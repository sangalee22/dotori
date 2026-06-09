import React from 'react';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, Image, useWindowDimensions, TouchableOpacity, ActivityIndicator, Platform, Keyboard, Animated } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ToastProvider } from './contexts/ToastContext';
import MainHeader from './components/MainHeader';
import Button from './components/Button';
import BestReviewCard from './components/BestReviewCard';
import ArrowRightIcon from './components/ArrowRightIcon';
import SectionTitle from './components/SectionTitle';
import MoreButton from './components/MoreButton';
import TabElement from './components/TabElement';
import BestBook from './components/BestBook';
import NewBookCard from './components/NewBookCard';
import Navigator from './components/Navigator';
import BottomNavigation from './components/BottomNavigation';
import BookDetail from './screens/BookDetail';
import SearchScreen from './screens/SearchScreen';
import CreateReadingRoom from './screens/CreateReadingRoom';
import RoomFeed from './screens/RoomFeed';
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import NicknameInputScreen from './screens/NicknameInputScreen';
import TermsAgreementScreen from './screens/TermsAgreementScreen';
import WeeklyBestDetail from './screens/WeeklyBestDetail';
import DotoriRoomListScreen from './screens/DotoriRoomListScreen';
import DotoriRoomScreen from './screens/DotoriRoomScreen';
import MyScreen from './screens/MyScreen';
import ModalPopup from './components/ModalPopup';
import SettingIcon from './components/SettingIcon';
import IconButton from './components/IconButton';
import { registerUser, logout as firebaseLogout, withdrawUser, onAuthChange } from './services/auth';
import { getUser, getUserBooks, getReadingRecords, getReviews, updateReviewsBookInfo, getBookReaderCount } from './services/firestore';
import { Colors, Typography, FontWeights } from './styles';
import { Spacing, BorderRadius } from './styles/spacing';
import { fetchBestsellers, fetchNewBooks, fetchBookDetail, searchBooks, cleanAuthorName, CATEGORY_LIST } from './services/aladinApi';
import { formatTimeAgo } from './utils/formatTimeAgo';

// 웹에서 Min Sans 폰트 로드
if (Platform.OS === 'web') {
  require('./styles/fonts.css');
}

// Book cover images
const bookCoverMower = require('./assets/book-cover-mower.png');
const nowReadingNull = require('./assets/img_nowreding-null.png');

export default function App() {
  const [fontsLoaded] = useFonts({
    'Paperlogy-Thin':       require('./assets/fonts/Paperlogy-1Thin.ttf'),
    'Paperlogy-ExtraLight': require('./assets/fonts/Paperlogy-2ExtraLight.ttf'),
    'Paperlogy-Light':      require('./assets/fonts/Paperlogy-3Light.ttf'),
    'Paperlogy-Regular':    require('./assets/fonts/Paperlogy-4Regular.ttf'),
    'Paperlogy-Medium':     require('./assets/fonts/Paperlogy-5Medium.ttf'),
    'Paperlogy-SemiBold':   require('./assets/fonts/Paperlogy-6SemiBold.ttf'),
    'Paperlogy-Bold':       require('./assets/fonts/Paperlogy-7Bold.ttf'),
    'Paperlogy-ExtraBold':  require('./assets/fonts/Paperlogy-8ExtraBold.ttf'),
    'Paperlogy-Black':      require('./assets/fonts/Paperlogy-9Black.ttf'),
    'LeeSeoyun':            require('./assets/fonts/이서윤체.ttf'),
    'OkMallangB':           require('./assets/fonts/OkMallangB.ttf'),
  });

  const { width: windowWidth } = useWindowDimensions();
  const [showSplash, setShowSplash] = React.useState(true); // Show splash screen on app start
  const [isLoggedIn, setIsLoggedIn] = React.useState(false); // Track login state
  const [isInSignUpFlow, setIsInSignUpFlow] = React.useState(false); // Track if user is in sign-up process
  const [signUpUserInfo, setSignUpUserInfo] = React.useState(null); // Store user info during sign-up
  const [signUpStep, setSignUpStep] = React.useState('nickname'); // 'nickname' or 'terms'
  const [signUpNickname, setSignUpNickname] = React.useState(''); // Store nickname during sign-up
  const [activeTab, setActiveTab] = React.useState('종합');
  const [activeBestReviewPage, setActiveBestReviewPage] = React.useState(0);
  const [bestReviews, setBestReviews] = React.useState([]);
  const [activeBottomTab, setActiveBottomTab] = React.useState('home');
  const [showMySettings, setShowMySettings] = React.useState(false);
  const [feedTab, setFeedTab] = React.useState('all'); // 'all' | 'mine'
  const [dotoriRoomTab, setDotoriRoomTab] = React.useState('calendar'); // 'calendar' | 'bookshelf'
  const logoHeightAnim = React.useRef(new Animated.Value(60)).current;
  const lastScrollY = React.useRef(0);
  const logoVisible = React.useRef(true);

  // 피드/도토리룸 탭을 벗어나면 로고 복원
  React.useEffect(() => {
    if (activeBottomTab !== 'dotoriRoom' && activeBottomTab !== 'bookshelf') {
      logoVisible.current = true;
      Animated.timing(logoHeightAnim, { toValue: 60, duration: 200, useNativeDriver: false }).start();
    }
  }, [activeBottomTab]);

  const handleFeedScroll = React.useCallback((e) => {
    const y = e.nativeEvent.contentOffset.y;
    const diff = y - lastScrollY.current;
    lastScrollY.current = y;
    if (diff > 5 && logoVisible.current && y > 10) {
      logoVisible.current = false;
      Animated.timing(logoHeightAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
    } else if (diff < -5 && !logoVisible.current) {
      logoVisible.current = true;
      Animated.timing(logoHeightAnim, { toValue: 60, duration: 200, useNativeDriver: false }).start();
    }
  }, []);
  const [currentView, setCurrentView] = React.useState('home'); // 'home', 'bookDetail', 'search', 'createRoom', or 'roomFeed'
  const [previousView, setPreviousView] = React.useState('home'); // Track previous view for back navigation
  const [selectedBook, setSelectedBook] = React.useState(null);
  const [selectedRoom, setSelectedRoom] = React.useState(null); // Store selected room data
  const [showCreateRoomModal, setShowCreateRoomModal] = React.useState(false); // Show create room confirmation modal
  const [pendingRoomData, setPendingRoomData] = React.useState(null); // Store room data for creation
  const openReadingModalRef = React.useRef(null);
  const [recentBooks, setRecentBooks] = React.useState([]); // Store recently viewed books
  const [recentSearches, setRecentSearches] = React.useState([]); // Store recent search terms
  const [readingRecords, setReadingRecords] = React.useState([]); // 타이머 독서 기록
  const [searchText, setSearchText] = React.useState(''); // Search input text
  const [hasSearched, setHasSearched] = React.useState(false); // Whether user has performed a search
  const [searchResults, setSearchResults] = React.useState([]); // Search results
  const [readingBooks, setReadingBooks] = React.useState([]); // Store books currently being read
  const [wantToReadBooks, setWantToReadBooks] = React.useState([]); // Store books user wants to read
  const [reviews, setReviews] = React.useState([]); // Store all reviews
  const [bookCache, setBookCache] = React.useState({}); // isbn → {title, author, cover} 전역 캐시
  const [currentUser, setCurrentUser] = React.useState({
    id: 'user_001',
    nickname: 'User name',
    name: 'User name',
    profileImage: null,
    provider: 'kakao', // 'kakao' | 'google'
  }); // Current logged-in user
  const [bookDetailInitialTab, setBookDetailInitialTab] = React.useState('info'); // Initial tab for BookDetail
  const [bookDetailOpenReviewModal, setBookDetailOpenReviewModal] = React.useState(false); // Whether to auto-open review modal
  const [bookDetailReviewInitialPage, setBookDetailReviewInitialPage] = React.useState(0);
  const [bookDetailReviewInitialImages, setBookDetailReviewInitialImages] = React.useState([]);
  const [bookDetailTargetReviewId, setBookDetailTargetReviewId] = React.useState(null);
  const bookListScrollRef = React.useRef(null);
  const [activeBestIndex, setActiveBestIndex] = React.useState(0);
  const [carouselReady, setCarouselReady] = React.useState(false);
  const bestAutoSlideRef = React.useRef(null);

  // 알라딘 API 상태 관리
  const [bestBooks, setBestBooks] = React.useState([]);
  const [isLoadingBooks, setIsLoadingBooks] = React.useState(false);
  const [booksError, setBooksError] = React.useState(null);
  const [newBooks, setNewBooks] = React.useState([]);
  const [isLoadingNewBooks, setIsLoadingNewBooks] = React.useState(false);

  // Toggle favorite book
  const toggleFavorite = (book) => {
    setWantToReadBooks(prev => {
      const exists = prev.some(b => b.isbn === book.isbn);
      return exists ? prev.filter(b => b.isbn !== book.isbn) : [...prev, book];
    });
  };

  // Add book to recent books
  const addToRecentBooks = (book) => {
    setRecentBooks((prevBooks) => {
      // Remove duplicate if exists
      const filtered = prevBooks.filter(b => b.isbn !== book.isbn);
      // Add to the beginning and limit to 6 books
      return [book, ...filtered].slice(0, 6);
    });
  };

  // Add search term to recent searches
  const addToRecentSearches = (searchTerm) => {
    if (!searchTerm || searchTerm.trim() === '') return;

    setRecentSearches((prevSearches) => {
      // Remove duplicate if exists
      const filtered = prevSearches.filter(term => term !== searchTerm.trim());
      // Add to the beginning and limit to 7 terms
      return [searchTerm.trim(), ...filtered].slice(0, 7);
    });
  };

  // Remove a specific search term
  const removeRecentSearch = (searchTerm) => {
    setRecentSearches((prevSearches) =>
      prevSearches.filter(term => term !== searchTerm)
    );
  };

  // Clear all recent searches
  const clearAllRecentSearches = () => {
    setRecentSearches([]);
  };

  // Clear all recent books
  const clearAllRecentBooks = () => {
    setRecentBooks([]);
  };

  // Load reading books from AsyncStorage
  React.useEffect(() => {
    const loadReadingBooks = async () => {
      try {
        const stored = await AsyncStorage.getItem('readingBooks');
        if (stored) {
          const parsed = JSON.parse(stored);
          // isbn 타입 불일치로 생긴 중복 제거 - 가장 currentPage 높은 항목 유지
          const seen = new Map();
          for (const book of parsed) {
            const key = String(book.isbn);
            const existing = seen.get(key);
            if (!existing || (book.currentPage ?? 0) > (existing.currentPage ?? 0)) {
              seen.set(key, book);
            }
          }
          setReadingBooks([...seen.values()]);
        }
      } catch (error) {
        console.error('Error loading reading books:', error);
      }
    };
    loadReadingBooks();
  }, []);

  // totalPages가 0인 책이 있으면 API에서 가져와서 업데이트
  React.useEffect(() => {
    const missingPages = readingBooks.filter(b => !b.totalPages && b.isbn);
    if (missingPages.length === 0) return;
    missingPages.forEach(async (book) => {
      try {
        const detail = await fetchBookDetail(book.isbn);
        const itemPage = detail?.subInfo?.itemPage;
        if (itemPage > 0) {
          setReadingBooks(prev => prev.map(b =>
            String(b.isbn) === String(book.isbn) && !b.totalPages
              ? { ...b, totalPages: itemPage }
              : b
          ));
        }
      } catch {}
    });
  }, [readingBooks.map(b => `${b.isbn}:${b.totalPages}`).join(',')]);

  // Save reading books to AsyncStorage whenever it changes
  React.useEffect(() => {
    const saveReadingBooks = async () => {
      try {
        await AsyncStorage.setItem('readingBooks', JSON.stringify(readingBooks));
      } catch (error) {
        console.error('Error saving reading books:', error);
      }
    };
    if (readingBooks.length > 0) saveReadingBooks();
  }, [readingBooks]);

  // Load / save wantToReadBooks
  const wantToReadLoaded = React.useRef(false);
  React.useEffect(() => {
    AsyncStorage.getItem('wantToReadBooks').then(stored => {
      if (stored) setWantToReadBooks(JSON.parse(stored));
      wantToReadLoaded.current = true;
    }).catch(() => { wantToReadLoaded.current = true; });
  }, []);

  React.useEffect(() => {
    if (!wantToReadLoaded.current) return;
    AsyncStorage.setItem('wantToReadBooks', JSON.stringify(wantToReadBooks)).catch(() => {});
  }, [wantToReadBooks]);

  // bookCache: AsyncStorage에서 로드 (버전 불일치 시 초기화 → 제목 검색으로 재조회)
  const BOOK_CACHE_VERSION = 2;
  React.useEffect(() => {
    AsyncStorage.getItem('bookCache').then(stored => {
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.__v !== BOOK_CACHE_VERSION) {
          AsyncStorage.removeItem('bookCache').catch(() => {});
          return;
        }
        const { __v, ...cache } = parsed;
        setBookCache(cache);
      }
    }).catch(() => {});
  }, []);

  // bookCache: 변경 시 AsyncStorage에 저장
  React.useEffect(() => {
    if (Object.keys(bookCache).length > 0) {
      AsyncStorage.setItem('bookCache', JSON.stringify({ __v: BOOK_CACHE_VERSION, ...bookCache })).catch(() => {});
    }
  }, [bookCache]);

  // Firestore 리뷰 → 앱 형식 변환
  const normalizeReview = (r) => {
    const createdAt = r.createdAt?.toDate?.() ? r.createdAt.toDate().toISOString() : (r.createdAt ?? new Date().toISOString());
    const toHttps = (url) => url?.replace(/^http:\/\/image\.aladin\.co\.kr/, 'https://image.aladin.co.kr') || null;

    // Firestore 플랫 필드(bookTitle/bookAuthor/bookCover/isbn) 우선 — 리뷰 작성 시 저장된 원본
    // 없으면 중첩 book 객체 사용 (앱에서 작성한 리뷰)
    let book;
    if (r.bookTitle) {
      book = { title: r.bookTitle, author: r.bookAuthor || '', cover: toHttps(r.bookCover) };
    } else if (r.book?.title) {
      book = { title: r.book.title, author: r.book.author || '', cover: toHttps(r.book.cover || r.book.coverImage) };
    } else {
      book = null;
    }

    return {
      ...r,
      bookIsbn: r.bookIsbn ?? r.isbn,
      createdAt,
      timeAgo: formatTimeAgo(createdAt),
      user: { name: r.userNickname ?? r.user?.name ?? '익명', profileImage: r.user?.profileImage ?? null },
      likes: Array.isArray(r.likes) ? r.likes : [],
      comments: r.commentCount ?? (Array.isArray(r.comments) ? r.comments.length : r.comments ?? 0),
      book,
    };
  };

  // Load reviews: Firestore가 primary source, AsyncStorage는 로컬 전용 리뷰 보완용
  React.useEffect(() => {
    const loadReviews = async () => {
      // 1. AsyncStorage에서 로컬 리뷰 로드 (normalizeReview 적용)
      try {
        const stored = await AsyncStorage.getItem('reviews');
        const local = stored ? JSON.parse(stored) : [];
        if (local.length > 0) setReviews(local.map(normalizeReview));
      } catch {}
      // 2. Firestore에서 전체 리뷰 로드 — Firestore 데이터가 항상 우선
      try {
        const fbReviews = await getReviews();
        if (fbReviews.length > 0) {
          const normalized = fbReviews.map(normalizeReview);
          setReviews(prev => {
            const fbIds = new Set(normalized.map(r => r.id));
            // Firestore 리뷰가 같은 ID의 로컬 리뷰를 덮어씀
            const merged = [...normalized, ...prev.filter(r => !fbIds.has(r.id))];
            return merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          });
        }
      } catch {}
    };
    loadReviews();
  }, []);

  React.useEffect(() => {
    AsyncStorage.getItem('readingRecords').then(stored => {
      if (stored) setReadingRecords(JSON.parse(stored));
    }).catch(() => {});
  }, []);

  // Firebase Auth 상태 감지 + Firestore 데이터 로드
  React.useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await getUser(firebaseUser.uid);
          if (userData) {
            setCurrentUser({ id: firebaseUser.uid, ...userData });
            setIsLoggedIn(true);
            setShowSplash(false);

            // Firestore에서 데이터 로드
            const [fbReadingBooks, fbWantBooks, fbRecords, fbReviews] = await Promise.all([
              getUserBooks(firebaseUser.uid, 'reading'),
              getUserBooks(firebaseUser.uid, 'want'),
              getReadingRecords(firebaseUser.uid),
              getReviews(),
            ]);

            // Firestore 데이터 병합: 로컬(AsyncStorage) 데이터의 coverImage 등 필드 보존
            if (fbReadingBooks.length > 0) {
              setReadingBooks(prev => {
                const localMap = new Map(prev.map(b => [String(b.isbn), b]));
                return fbReadingBooks.map(fb => ({ ...localMap.get(String(fb.isbn)), ...fb }));
              });
            }
            if (fbWantBooks.length > 0) {
              setWantToReadBooks(prev => {
                const localMap = new Map(prev.map(b => [String(b.isbn), b]));
                return fbWantBooks.map(fb => ({ ...localMap.get(String(fb.isbn)), ...fb }));
              });
            }
            if (fbRecords.length > 0) setReadingRecords(fbRecords);
            if (fbReviews.length > 0) {
              const normalized = fbReviews.map(normalizeReview);
              setReviews(prev => {
                const fbIds = new Set(normalized.map(r => r.id));
                const merged = [...normalized, ...prev.filter(r => !fbIds.has(r.id))];
                return merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
              });
            }
          }
        } catch (e) {
          console.error('Firebase data load error:', e);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSaveReadingRecord = React.useCallback(async (record) => {
    setReadingRecords(prev => {
      const updated = [...prev, record];
      AsyncStorage.setItem('readingRecords', JSON.stringify(updated)).catch(() => {});
      return updated;
    });
    // record에 totalPages가 있으면 readingBooks에도 반영
    if (record.totalPages > 0) {
      setReadingBooks(prev => prev.map(b =>
        String(b.isbn) === String(record.isbn) && b.totalPages === 0
          ? { ...b, totalPages: record.totalPages }
          : b
      ));
    }
  }, []);

  const handleDeleteReadingRecord = React.useCallback((record) => {
    setReadingRecords(prev => {
      const updated = prev.filter(r => !(r.isbn === record.isbn && r.createdAt === record.createdAt));
      AsyncStorage.setItem('readingRecords', JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  const handleEditReadingRecord = React.useCallback((updated) => {
    setReadingRecords(prev => {
      const next = prev.map(r =>
        r.isbn === updated.isbn && r.createdAt === updated.createdAt ? updated : r
      );
      AsyncStorage.setItem('readingRecords', JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  // Save reviews to AsyncStorage whenever it changes
  React.useEffect(() => {
    const saveReviews = async () => {
      try {
        await AsyncStorage.setItem('reviews', JSON.stringify(reviews));
      } catch (error) {
        console.error('Error saving reviews:', error);
      }
    };
    if (reviews.length > 0) {
      saveReviews();
    }
  }, [reviews]);

  // Add or update a reading book
  const updateReadingBook = (book, updateType, data) => {
    setReadingBooks((prevBooks) => {
      const existingIndex = prevBooks.findIndex(b => String(b.isbn) === String(book.isbn));
      const now = new Date().toISOString();
      const isNewBook = existingIndex < 0;

      const existingBook = existingIndex >= 0 ? prevBooks[existingIndex] : null;
      const todayStr = new Date().toISOString().split('T')[0];
      const prevDates = existingBook?.readingDates || [];
      const readingDates = prevDates.includes(todayStr) ? prevDates : [...prevDates, todayStr];

      const resolvedTotalPages = data?.totalPages || existingBook?.totalPages || book?.totalPages || 0;

      const updatedBook = {
        ...(existingBook ?? book),
        ...book,
        lastActivityAt: now,
        isCompleted: data?.isCompleted ?? existingBook?.isCompleted ?? false,
        currentPage: data?.currentPage ?? existingBook?.currentPage ?? 0,
        totalPages: resolvedTotalPages,
        readingDates,
      };

      // If this is a new book, set startedAt automatically
      if (isNewBook) {
        updatedBook.startedAt = now;
      }

      if (updateType === 'startReading') {
        updatedBook.startedAt = now;
        updatedBook.isCompleted = false;
        updatedBook.completedAt = null;
        updatedBook.currentPage = 0;
      } else if (updateType === 'updatePage') {
        updatedBook.lastPageUpdateAt = now;
        updatedBook.currentPage = data.currentPage;
        if (data.totalPages > 0 && data.currentPage >= data.totalPages) {
          updatedBook.isCompleted = true;
          updatedBook.completedAt = now;
        }
      } else if (updateType === 'addReview') {
        updatedBook.lastReviewAt = now;
      } else if (updateType === 'complete') {
        updatedBook.isCompleted = true;
        updatedBook.completedAt = now;
      }

      // 같은 isbn 중복 제거 후 업데이트
      const filtered = prevBooks.filter((b, i) =>
        String(b.isbn) !== String(book.isbn) || i === existingIndex
      );
      if (existingIndex >= 0) {
        const newBooks = filtered.map(b =>
          String(b.isbn) === String(book.isbn) ? updatedBook : b
        );
        return newBooks;
      } else {
        return [updatedBook, ...filtered];
      }
    });
  };

  // Add review handler
  const handleAddReview = (newReview) => {
    setReviews((prevReviews) => [newReview, ...prevReviews]);
  };

  // Delete review handler
  const handleDeleteReview = async (reviewId) => {
    // Remove from state
    setReviews((prevReviews) => prevReviews.filter(review => review.id !== reviewId));

    // Remove from AsyncStorage
    try {
      const updatedReviews = reviews.filter(review => review.id !== reviewId);
      await AsyncStorage.setItem('reviews', JSON.stringify(updatedReviews));
    } catch (error) {
      console.error('Error deleting review from AsyncStorage:', error);
    }
  };

  // Edit review handler
  const handleEditReview = async (reviewId, updatedData) => {
    // Update in state
    setReviews((prevReviews) =>
      prevReviews.map(review =>
        review.id === reviewId
          ? { ...review, ...updatedData }
          : review
      )
    );

    // Update in AsyncStorage
    try {
      const updatedReviews = reviews.map(review =>
        review.id === reviewId
          ? { ...review, ...updatedData }
          : review
      );
      await AsyncStorage.setItem('reviews', JSON.stringify(updatedReviews));
    } catch (error) {
      console.error('Error updating review in AsyncStorage:', error);
    }
  };

  // Get the most recent active book (excluding completed books)
  const getMostRecentActiveBook = () => {
    const activeBooks = readingBooks.filter(book => !book.isCompleted);
    if (activeBooks.length === 0) return null;

    return activeBooks.reduce((mostRecent, current) => {
      const currentActivity = new Date(current.lastActivityAt);
      const mostRecentActivity = new Date(mostRecent.lastActivityAt);
      return currentActivity > mostRecentActivity ? current : mostRecent;
    });
  };

  const currentReadingBook = getMostRecentActiveBook();
  const currentReadingBookTotalPages = currentReadingBook
    ? (currentReadingBook.totalPages > 0
        ? currentReadingBook.totalPages
        : readingRecords
            .filter(r => String(r.isbn) === String(currentReadingBook.isbn) && r.totalPages > 0)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]?.totalPages ?? 0)
    : 0;

  // Handle book press from recent books or search results
  const handleRecentBookPress = (book) => {
    Keyboard.dismiss(); // Dismiss keyboard when navigating to book detail
    setSelectedBook(book);
    addToRecentBooks(book); // Update recent books order
    setPreviousView(currentView); // Store current view before navigating
    setCurrentView('bookDetail');
  };

  const activeCategoryObj = CATEGORY_LIST.find(c => c.name === activeTab);
  const effectiveCategoryId = activeCategoryObj?.id ?? 0;

  // 알라딘 API로 베스트셀러 데이터 가져오기
  React.useEffect(() => {
    const loadBestsellers = async () => {
      setIsLoadingBooks(true);
      setBooksError(null);

      try {
        const books = await fetchBestsellers(effectiveCategoryId, 8);
        setBestBooks(books);
      } catch (error) {
        console.error('베스트셀러 로딩 오류:', error);
        setBooksError('베스트셀러를 불러오는데 실패했습니다.');
        setBestBooks([]);
      } finally {
        setIsLoadingBooks(false);
      }
    };

    loadBestsellers();
  }, [effectiveCategoryId]);

  const currentBooks = bestBooks;

  const carouselCardWidth = 141;
  const carouselSnap = carouselCardWidth;
  const carouselSidePadding = (windowWidth - carouselCardWidth) / 2;

  // 무한 루프용 3배 복제 배열
  const loopedBooks = currentBooks.length > 0
    ? [...currentBooks, ...currentBooks, ...currentBooks]
    : [];
  const loopOffset = currentBooks.length;

  // 책 로드 시 중간 복사본으로 초기화 (opacity 0 → 위치 이동 → opacity 1)
  React.useEffect(() => {
    if (currentBooks.length === 0) {
      setCarouselReady(false);
      return;
    }
    setCarouselReady(false);
    const idx = loopOffset;
    const t = setTimeout(() => {
      bookListScrollRef.current?.scrollTo({ x: idx * carouselSnap, animated: false });
      setActiveBestIndex(idx);
      setCarouselReady(true);
    }, 50);
    return () => clearTimeout(t);
  }, [currentBooks.length]);

  // 주간 베스트 자동 슬라이드
  React.useEffect(() => {
    if (currentBooks.length === 0) return;
    clearInterval(bestAutoSlideRef.current);
    bestAutoSlideRef.current = setInterval(() => {
      setActiveBestIndex(prev => {
        const next = prev + 1;
        bookListScrollRef.current?.scrollTo({ x: next * carouselSnap, animated: true });
        return next;
      });
    }, 4000);
    return () => clearInterval(bestAutoSlideRef.current);
  }, [currentBooks.length, carouselSnap]);

  // 신간 데이터 가져오기
  React.useEffect(() => {
    const loadNewBooks = async () => {
      setIsLoadingNewBooks(true);

      try {
        const books = await fetchNewBooks(1, 5); // 소설 카테고리 (ID: 1)
        setNewBooks(books);
      } catch (error) {
        console.error('신간 로딩 오류:', error);
        setNewBooks([]);
      } finally {
        setIsLoadingNewBooks(false);
      }
    };

    loadNewBooks();
  }, []);

  // 지난주(월~일) 범위 계산
  const getLastWeekRange = () => {
    const today = new Date();
    const dow = today.getDay(); // 0=일, 1=월
    const daysSinceMonday = dow === 0 ? 6 : dow - 1;
    const thisMonday = new Date(today);
    thisMonday.setDate(today.getDate() - daysSinceMonday);
    thisMonday.setHours(0, 0, 0, 0);
    const lastMonday = new Date(thisMonday);
    lastMonday.setDate(thisMonday.getDate() - 7);
    const lastSunday = new Date(thisMonday);
    lastSunday.setDate(thisMonday.getDate() - 1);
    lastSunday.setHours(23, 59, 59, 999);
    return { from: lastMonday, to: lastSunday };
  };

  React.useEffect(() => {
    if (reviews.length === 0) return;
    const loadBestReviews = async () => {
      const { from, to } = getLastWeekRange();
      let candidates = reviews
        .filter(r => {
          const d = new Date(r.createdAt);
          return d >= from && d <= to;
        })
        .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
        .slice(0, 6);

      // 지난주 리뷰가 부족하면 전체에서 좋아요 순으로 fallback
      if (candidates.length < 6) {
        const fallback = reviews
          .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
          .slice(0, 6);
        candidates = fallback;
      }


      const toHttps = (url) => url?.replace(/^http:\/\/image\.aladin\.co\.kr/, 'https://image.aladin.co.kr');

      const enrichCover = async (review) => {
        if (!review.book?.title) return review;

        const isbn = review.bookIsbn;
        const title = review.book.title;

        // ISBN이 캐시에 있으면 바로 사용
        const cached = isbn && bookCache[isbn];
        if (cached?.cover) {
          return { ...review, book: { ...review.book, cover: toHttps(cached.cover) } };
        }

        // 제목으로 검색 → ISBN이 알라딘 API와 불일치해도 정확한 책 커버 획득
        try {
          const results = await searchBooks(title, 'Title', 3);
          if (results?.length) {
            const norm = (s) => (s || '').split(' - ')[0].trim().toLowerCase();
            const match = results.find(b => {
              const t = norm(b.title);
              const s = norm(title);
              return t === s || t.includes(s) || s.includes(t);
            }) || results[0];
            if (match?.coverImage) {
              const cover = toHttps(match.coverImage);
              if (isbn) setBookCache(prev => ({ ...prev, [isbn]: { title: (match.title || '').split(' - ')[0].trim() || title, author: cleanAuthorName(match.author), cover } }));
              return { ...review, book: { ...review.book, cover } };
            }
          }
        } catch {}

        // 검색 실패 시 Firestore URL (http→https 변환)
        const storedCover = toHttps(review.book.cover || review.book.coverImage);
        return storedCover !== review.book.cover
          ? { ...review, book: { ...review.book, cover: storedCover } }
          : review;
      };

      const enriched = await Promise.all(candidates.map(enrichCover));

      // isbn별 읽는 중 유저 수 조회
      const withReaderCount = await Promise.all(enriched.map(async (review) => {
        const isbn = review.bookIsbn;
        if (!isbn) return { ...review, readerCount: 0 };
        try {
          const count = await getBookReaderCount(isbn);
          return { ...review, readerCount: count };
        } catch {
          return { ...review, readerCount: 0 };
        }
      }));

      setBestReviews(withReaderCount);
    };
    loadBestReviews();
  }, [reviews]);

  // Reset scroll position when tab changes
  React.useEffect(() => {
    if (currentBooks.length === 0) return;
    const initialIndex = currentBooks.length;
    bookListScrollRef.current?.scrollTo({ x: initialIndex * carouselSnap, animated: false });
    setActiveBestIndex(initialIndex);
  }, [activeTab]);

  // Calculate card width for best review
  const bestReviewCardWidth = windowWidth - Spacing.md * 2; // Subtract section padding
  const snapInterval = bestReviewCardWidth + Spacing.md; // card width + gap

  // Handle best review scroll
  const handleBestReviewScroll = (event) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(scrollX / snapInterval);
    setActiveBestReviewPage(pageIndex);
  };

  const bookTitle = selectedBook?.title || '모우어';

  // Show splash screen on app start
  if (showSplash) {
    return (
      <SafeAreaProvider>
        <SplashScreen onFinish={() => setShowSplash(false)} />
      </SafeAreaProvider>
    );
  }

  // Show login/signup screens if not logged in
  if (!isLoggedIn) {
    // Show sign-up screens during sign-up flow
    if (isInSignUpFlow && signUpUserInfo) {
      // Show nickname input screen
      if (signUpStep === 'nickname') {
        return (
          <SafeAreaProvider>
            <NicknameInputScreen
              onNext={({ nickname }) => {
                console.log('Nickname entered:', nickname);
                setSignUpNickname(nickname);
                setSignUpStep('terms');
              }}
              onBack={() => {
                // Go back to login screen
                setIsInSignUpFlow(false);
                setSignUpUserInfo(null);
                setSignUpStep('nickname');
                setSignUpNickname('');
              }}
            />
          </SafeAreaProvider>
        );
      }

      // Show terms agreement screen
      if (signUpStep === 'terms') {
        return (
          <SafeAreaProvider>
            <TermsAgreementScreen
              onNext={async ({ agreedTerms }) => {
                try {
                  console.log('Completing sign up with nickname:', signUpNickname);
                  console.log('Agreed terms:', agreedTerms);
                  // Register user with nickname
                  const userData = await registerUser(signUpUserInfo, signUpNickname);
                  console.log('User registered:', userData);
                  await AsyncStorage.multiRemove(['readingBooks', 'wantToReadBooks', 'readingRecords', 'reviews']);
                  setReadingBooks([]);
                  setWantToReadBooks([]);
                  setReadingRecords([]);
                  setCurrentUser(userData);
                  const fbReviews = await getReviews().catch(() => []);
                  if (fbReviews.length > 0) setReviews(fbReviews.map(normalizeReview));
                  setIsLoggedIn(true);
                  setIsInSignUpFlow(false);
                  setSignUpUserInfo(null);
                  setSignUpStep('nickname');
                  setSignUpNickname('');
                } catch (error) {
                  console.error('Sign up error:', error);
                  alert(error.message || '회원가입에 실패했습니다.');
                }
              }}
              onBack={() => {
                // Go back to nickname screen
                setSignUpStep('nickname');
              }}
            />
          </SafeAreaProvider>
        );
      }
    }

    // Show login screen
    return (
      <SafeAreaProvider>
        <LoginScreen
          onLogin={async (userInfo) => {
            await AsyncStorage.multiRemove(['readingBooks', 'wantToReadBooks', 'readingRecords', 'reviews']);
            setReadingBooks([]);
            setWantToReadBooks([]);
            setReadingRecords([]);
            const [userData, fbReviews] = await Promise.all([
              getUser(userInfo.id),
              getReviews(),
            ]);
            const fullUser = userData
              ? { id: userInfo.id, ...userData, profileImage: userData.profileImage || userInfo.profileImage || null }
              : { id: userInfo.id, nickname: userInfo.displayName || '테스트유저', email: userInfo.email || '', profileImage: userInfo.profileImage || null };
            setCurrentUser(fullUser);
            await AsyncStorage.setItem('currentUser', JSON.stringify(fullUser));
            if (fbReviews.length > 0) setReviews(fbReviews.map(normalizeReview));
            setIsLoggedIn(true);
          }}
          onSignUp={(userInfo) => {
            console.log('Starting sign up for:', userInfo);
            // Start sign-up flow
            setSignUpUserInfo(userInfo);
            setIsInSignUpFlow(true);
          }}
        />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ToastProvider>
        <View style={styles.wrapper}>
          <StatusBar style="dark" translucent backgroundColor="transparent" />

          {/* Render different screens based on active bottom tab */}
          {activeBottomTab === 'home' && (
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Now Reading Section */}
            <View style={[styles.section, !currentReadingBook && { paddingHorizontal: 0 }]}>
              {currentReadingBook ? (
                <TouchableOpacity
                  style={styles.nowReading}
                  onPress={() => {
                    // Reset BookDetail states to default when clicking on book cover
                    setBookDetailInitialTab('info');
                    setBookDetailOpenReviewModal(false);
                    setSelectedBook(currentReadingBook);
                    addToRecentBooks(currentReadingBook);
                    setPreviousView(currentView);
                    setCurrentView('bookDetail');
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.bookCoverSmall}>
                    {currentReadingBook.coverImage ? (
                      <Image
                        source={typeof currentReadingBook.coverImage === 'string'
                          ? { uri: currentReadingBook.coverImage }
                          : currentReadingBook.coverImage
                        }
                        style={styles.bookCoverPlaceholder}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.bookCoverPlaceholder} />
                    )}
                  </View>
                  <View style={styles.nowReadingInfo}>
                    <View>
                      <Text style={styles.bookTitle}>
                        {currentReadingBook.title ? currentReadingBook.title.split(' - ')[0].trim() : ''}
                      </Text>
                      <Text style={styles.bookAuthor}>{currentReadingBook.author || ''}</Text>
                    </View>
                    <View style={{ flex: 1, minHeight: Spacing.sm }} />
                    <View style={styles.nowReadingBottom}>
                      <View style={styles.progressSection}>
                        <Text style={styles.progressText}>
                          <Text style={styles.progressPercent}>
                            {currentReadingBookTotalPages > 0
                              ? Math.round((currentReadingBook.currentPage / currentReadingBookTotalPages) * 100)
                              : 0}%
                          </Text> 읽음
                        </Text>
                        <View style={styles.progressBarBg}>
                          <View style={[
                            styles.progressBar,
                            { width: `${currentReadingBookTotalPages > 0
                                ? Math.round((currentReadingBook.currentPage / currentReadingBookTotalPages) * 100)
                                : 0}%`
                            }
                          ]} />
                        </View>
                      </View>
                      <Button
                        variant="primary"
                        size="medium"
                        onPress={() => {
                          setBookDetailInitialTab('reviews');
                          setBookDetailOpenReviewModal(true);
                          setSelectedBook(currentReadingBook);
                          addToRecentBooks(currentReadingBook);
                          setPreviousView(currentView);
                          setCurrentView('bookDetail');
                        }}
                        style={{ alignSelf: 'flex-end' }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Text style={{ color: Colors.white, ...Typography.body2Medium }}>독후감 쓰기</Text>
                          <ArrowRightIcon width={20} height={20} color={Colors.white} />
                        </View>
                      </Button>
                    </View>
                  </View>
                </TouchableOpacity>
              ) : (
                <View style={styles.nowReadingNull}>
                  <Image
                    source={nowReadingNull}
                    style={[
                      styles.nowReadingNullImage,
                      windowWidth < 320 && {
                        width: windowWidth,
                        height: windowWidth * (110 / 320), // Maintain aspect ratio
                      }
                    ]}
                    resizeMode="contain"
                  />
                </View>
              )}
            </View>

{/* Recent Interest Section */}
        {recentBooks.length > 0 && (
          <View style={styles.section}>
            <View style={[styles.sectionHeader, { marginBottom: 8 }]}>
              <SectionTitle>최근 이런 책에 관심을 가졌네요!</SectionTitle>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.bestList}
              contentContainerStyle={{ paddingHorizontal: Spacing.md }}
            >
              {recentBooks.slice(0, 4).map((book, index) => (
                <BestBook
                  key={book.isbn || index}
                  rank={null}
                  title={book.title}
                  author={book.author}
                  coverImage={book.coverImage}
                  isbn={book.isbn}
                  onPress={() => handleRecentBookPress(book)}
                  style={{ marginRight: Spacing.md, paddingTop: 0 }}
                />
              ))}
            </ScrollView>
          </View>
        )}


        {/* Weekly Best Section */}
        <View style={[styles.sectionHeader, { marginBottom: Spacing.sm, paddingHorizontal: Spacing.md }]}>
          <SectionTitle>주간 베스트</SectionTitle>
          <MoreButton onPress={() => {
            setPreviousView(currentView);
            setCurrentView('weeklyBestDetail');
          }} />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
          style={[styles.tabScrollView, { paddingHorizontal: Spacing.md }]}
        >
          {CATEGORY_LIST.map((category) => (
            <TabElement
              key={category.id}
              active={activeTab === category.name}
              onPress={() => setActiveTab(category.name)}
            >
              {category.label}
            </TabElement>
          ))}
        </ScrollView>
        <View style={styles.weeklyBestSection}>
          {isLoadingBooks ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary500} />
              <Text style={styles.loadingText}>베스트셀러를 불러오는 중...</Text>
            </View>
          ) : booksError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{booksError}</Text>
            </View>
          ) : (
            <ScrollView
              ref={bookListScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={carouselSnap}
              decelerationRate="fast"
              style={{ height: 310, opacity: carouselReady ? 1 : 0 }}
              contentContainerStyle={{ paddingHorizontal: carouselSidePadding, alignItems: 'flex-start' }}
              onScrollBeginDrag={() => clearInterval(bestAutoSlideRef.current)}
              onMomentumScrollEnd={(e) => {
                const len = currentBooks.length;
                let index = Math.round(e.nativeEvent.contentOffset.x / carouselSnap);
                // 경계 처리: 첫/끝 복사본이면 중간 복사본으로 점프
                if (index < len) {
                  index = index + len;
                  bookListScrollRef.current?.scrollTo({ x: index * carouselSnap, animated: false });
                } else if (index >= len * 2) {
                  index = len + (index % len);
                  bookListScrollRef.current?.scrollTo({ x: index * carouselSnap, animated: false });
                }
                setActiveBestIndex(index);
                // 자동 슬라이드 재시작
                clearInterval(bestAutoSlideRef.current);
                bestAutoSlideRef.current = setInterval(() => {
                  setActiveBestIndex(prev => {
                    const next = prev + 1;
                    bookListScrollRef.current?.scrollTo({ x: next * carouselSnap, animated: true });
                    return next;
                  });
                }, 4000);
              }}
            >
              {loopedBooks.map((book, index) => (
                <BestBook
                  key={`${book.isbn || index}-${index}`}
                  rank={book.rank}
                  title={book.title}
                  author={book.author}
                  coverImage={book.coverImage}
                  isbn={book.isbn}
                  cardWidth={carouselCardWidth}
                  isActive={index % currentBooks.length === activeBestIndex % currentBooks.length}
                  onPress={() => {
                    const bookData = {
                      isbn: book.isbn,
                      title: book.title,
                      author: book.author,
                      coverImage: book.coverImage,
                    };
                    setSelectedBook(bookData);
                    addToRecentBooks(bookData);
                    setPreviousView(currentView);
                    setCurrentView('bookDetail');
                  }}
                  style={null}
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Best Review Section */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, { marginBottom: 8 }]}>
            <SectionTitle>이번주 베스트 리뷰</SectionTitle>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.bestReviewList}
            style={styles.bestReviewScrollView}
            snapToInterval={snapInterval}
            decelerationRate="fast"
            snapToAlignment="start"
            onScroll={handleBestReviewScroll}
            scrollEventThrottle={16}
          >
            {bestReviews.map((review, index) => {
              const bookData = {
                isbn: review.bookIsbn,
                title: review.book?.title || '',
                author: review.book?.author || '',
                coverImage: review.book?.cover || review.book?.coverImage,
              };
              return (
                <BestReviewCard
                  key={review.id || index}
                  bookTitle={bookData.title}
                  author={bookData.author}
                  coverImage={bookData.coverImage}
                  readerCount={review.readerCount ?? 0}
                  reviewerName={review.user?.name || '익명'}
                  reviewerImage={review.user?.profileImage}
                  reviewDate={review.createdAt ? new Date(review.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\.\s*/g, '.').replace(/\.$/, '') : ''}
                  reviewText={review.content || ''}
                  onBookPress={() => {
                    setBookDetailInitialTab('info');
                    setBookDetailOpenReviewModal(false);
                    setSelectedBook(bookData);
                    addToRecentBooks(bookData);
                    setPreviousView(currentView);
                    setCurrentView('bookDetail');
                  }}
                  onReviewPress={() => {
                    setBookDetailInitialTab('reviews');
                    setBookDetailOpenReviewModal(false);
                    setBookDetailTargetReviewId(review.id);
                    setSelectedBook(bookData);
                    addToRecentBooks(bookData);
                    setPreviousView(currentView);
                    setCurrentView('bookDetail');
                  }}
                />
              );
            })}
          </ScrollView>
              <View style={styles.navigatorContainer}>
                <Navigator total={bestReviews.length} active={activeBestReviewPage} />
              </View>
            </View>

        {/* New Books Section */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, { marginBottom: Spacing.sm }]}>
            <SectionTitle>눈에 띄는 신간</SectionTitle>
          </View>
          {isLoadingNewBooks ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary500} />
              <Text style={styles.loadingText}>신간을 불러오는 중...</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.newBooksList}
              contentContainerStyle={{ paddingHorizontal: Spacing.md }}
            >
              {newBooks.map((book, index) => {
                // Split title and subtitle if "-" exists
                const titleParts = book.title.split(' - ');
                const mainTitle = titleParts[0].trim();
                const subtitle = titleParts.length > 1 ? titleParts.slice(1).join(' - ').trim() : undefined;

                return (
                  <NewBookCard
                    key={book.isbn || index}
                    coverImage={book.coverImage}
                    title={mainTitle}
                    subtitle={subtitle}
                    author={book.author}
                    onPress={() => {
                    console.log('📚 신간 선택:', book.title, 'ISBN:', book.isbn);
                    const bookData = {
                      isbn: book.isbn,
                      title: book.title,
                      author: book.author,
                      coverImage: book.coverImage,
                      description: book.description,
                      publisher: book.publisher,
                      pubDate: book.pubDate,
                      priceStandard: book.priceStandard,
                      priceSales: book.priceSales,
                      link: book.link,
                    };
                    setSelectedBook(bookData);
                    addToRecentBooks(bookData);
                    setPreviousView(currentView);
                    setCurrentView('bookDetail');
                  }}
                    style={{ marginRight: index === newBooks.length - 1 ? 0 : Spacing.md }}
                  />
                );
              })}
            </ScrollView>
          )}
        </View>
          </ScrollView>
          )}

          {/* 피드 Screen */}
          {activeBottomTab === 'dotoriRoom' && (
            <DotoriRoomListScreen
              reviews={reviews}
              currentUser={currentUser}
              activeTab={feedTab}
              readingBooks={readingBooks}
              bookCache={bookCache}
              onBookCacheUpdate={(isbn, data) => setBookCache(prev => ({ ...prev, [isbn]: data }))}
              onScroll={handleFeedScroll}
              onRefresh={async () => {
                try {
                  const fbReviews = await getReviews();
                  if (fbReviews.length > 0) {
                    const normalized = fbReviews.map(normalizeReview);
                    setReviews(prev => {
                      const fbIds = new Set(normalized.map(r => r.id));
                      const merged = [...normalized, ...prev.filter(r => !fbIds.has(r.id))];
                      return merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    });
                  }
                } catch (e) {}
              }}
              onUpdateBookInfo={async (isbn, bookData) => {
                // book 데이터 없는 리뷰에만 Firestore 업데이트 (bookTitle 있는 리뷰는 건드리지 않음)
                updateReviewsBookInfo(isbn, bookData).catch(() => {});
              }}
              onBookPress={(book) => {
                setSelectedBook(book);
                addToRecentBooks(book);
                setCurrentView('bookDetail');
              }}
            />
          )}

          {/* 도토리룸 Screen */}
          {activeBottomTab === 'bookshelf' && (
            <DotoriRoomScreen
              readingBooks={readingBooks}
              reviews={reviews}
              readingRecords={readingRecords}
              wantToReadBooks={wantToReadBooks}
              currentUser={currentUser}
              activeTab={dotoriRoomTab}
              onScroll={handleFeedScroll}
              logoHeightAnim={logoHeightAnim}
              onBookPress={(book) => {
                setSelectedBook(book);
                setBookDetailInitialTab('info');
                setBookDetailOpenReviewModal(false);
                setCurrentView('bookDetail');
              }}
              onReviewPress={(book) => {
                setSelectedBook(book);
                setBookDetailInitialTab('reviews');
                setBookDetailOpenReviewModal(true);
                setBookDetailReviewInitialPage(book.currentPage ?? 0);
                setCurrentView('bookDetail');
              }}
              onDeleteReadingRecord={handleDeleteReadingRecord}
              onEditReadingRecord={handleEditReadingRecord}
              onAddRecord={(dateStr) => {
                const formatD = (s) => {
                  if (!s) return '독서 기록';
                  const [y, m, d] = s.split('-');
                  return `${y}년 ${parseInt(m)}월 ${parseInt(d)}일 독서 기록`;
                };
                openReadingModalRef.current?.({ title: formatD(dateStr), addRecordMode: true, date: dateStr });
              }}
            />
          )}

          {/* My Screen */}
          {activeBottomTab === 'my' && (
            <MyScreen
              reviews={reviews}
              currentUser={currentUser}
              readingRecords={readingRecords}
              readingBooks={readingBooks}
              onBookPress={(book) => {
                setSelectedBook(book);
                setCurrentView('bookDetail');
              }}
              showSettings={showMySettings}
              onSettingsClose={() => setShowMySettings(false)}
              onLogout={async () => {
                await firebaseLogout();
                setShowMySettings(false);
                setActiveBottomTab('home');
                setIsLoggedIn(false);
                setShowSplash(true);
              }}
              onWithdraw={async (reasonData) => {
                await withdrawUser(currentUser.id, currentUser.provider, reasonData);
                setShowMySettings(false);
                setActiveBottomTab('home');
                setCurrentUser(null);
                setReadingBooks([]);
                setWantToReadBooks([]);
                setReadingRecords([]);
                setReviews([]);
                setIsLoggedIn(false);
                setShowSplash(true);
              }}
              onUpdateUser={(updatedData) => {
                setCurrentUser(prev => ({ ...prev, ...updatedData }));
              }}
            />
          )}

          {/* Main Header */}
      <View style={styles.headerContainer}>
        <SafeAreaView style={styles.headerSafeArea} edges={['top']}>
          <MainHeader
            onSearch={() => setCurrentView('search')}
            tabs={
              activeBottomTab === 'dotoriRoom' ? undefined : activeBottomTab === 'bookshelf' ? [
                { id: 'calendar', label: '캘린더' },
                { id: 'bookshelf', label: '책장' },
              ] : undefined
            }
            activeTab={activeBottomTab === 'bookshelf' ? dotoriRoomTab : feedTab}
            onTabChange={activeBottomTab === 'bookshelf' ? setDotoriRoomTab : setFeedTab}
            logoHeightAnim={activeBottomTab === 'dotoriRoom' || activeBottomTab === 'bookshelf' ? logoHeightAnim : undefined}
            rightButton={activeBottomTab === 'my' ? (
              <IconButton onPress={() => setShowMySettings(true)}>
                <SettingIcon />
              </IconButton>
            ) : undefined}
          />
        </SafeAreaView>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavContainer}>
        <SafeAreaView style={styles.bottomNavSafeArea} edges={['bottom']}>
          <BottomNavigation
            activeTab={activeBottomTab}
            onTabPress={(tab) => {
              setActiveBottomTab(tab);
              console.log('Tab pressed:', tab);
            }}
            currentBooks={readingBooks
              .filter(book => !book.isCompleted)
              .map(book => ({
                ...book,
                progress: book.totalPages > 0
                  ? Math.round((book.currentPage / book.totalPages) * 100)
                  : 0,
              }))
            }
            readingRecords={readingRecords}
            onUpdateReading={(book, updateType, data) => updateReadingBook(book, updateType, data)}
            onWriteReview={({ book, endPage, imageUri }) => {
              setSelectedBook(book);
              addToRecentBooks(book);
              setPreviousView('home');
              setCurrentView('bookDetail');
              setBookDetailInitialTab('reviews');
              setBookDetailOpenReviewModal(true);
              setBookDetailReviewInitialPage(endPage);
              setBookDetailReviewInitialImages(imageUri ? [imageUri] : []);
            }}
            onSaveReadingRecord={handleSaveReadingRecord}
            onReady={(openModal) => { openReadingModalRef.current = openModal; }}
          />
        </SafeAreaView>
      </View>

      {/* BookDetail overlay - show when in bookDetail or createRoom view */}
      {(currentView === 'bookDetail' || currentView === 'createRoom') && selectedBook && (() => {
        // Find if this book is in reading state
        const readingBookData = readingBooks.find(book => book.isbn === selectedBook.isbn);

        return (
          <BookDetail
            isbn={selectedBook.isbn}
            bookTitle={selectedBook.title || bookTitle}
            author={selectedBook.author || '천선란'}
            coverImage={selectedBook.coverImage}
            initialFavorite={wantToReadBooks.some(b => b.isbn === selectedBook.isbn)}
            onToggleFavorite={() => toggleFavorite(selectedBook)}
            onBack={() => {
              setSelectedBook(null);
              setCurrentView(previousView);
              setBookDetailInitialTab('info');
              setBookDetailOpenReviewModal(false);
              setBookDetailReviewInitialPage(0);
              setBookDetailReviewInitialImages([]);
              setBookDetailTargetReviewId(null);
            }}
            onMenu={() => console.log('Menu pressed')}
            onCreateRoom={(bookData) => {
              setSelectedBook(bookData);
              setPreviousView(currentView);
              setCurrentView('createRoom');
            }}
            onUpdateReading={(updateType, data) => {
              updateReadingBook(selectedBook, updateType, data);
            }}
            initialTab={bookDetailInitialTab}
            openReviewModal={bookDetailOpenReviewModal}
            reviewInitialPage={bookDetailReviewInitialPage}
            reviewInitialImages={bookDetailReviewInitialImages}
            targetReviewId={bookDetailTargetReviewId}
            reviews={reviews}
            onAddReview={handleAddReview}
            onEditReview={handleEditReview}
            onDeleteReview={handleDeleteReview}
            currentUser={currentUser}
            initialReadingState={readingBookData ? {
              isReading: !readingBookData.isCompleted,
              isCompleted: readingBookData.isCompleted || false,
              currentPage: readingBookData.currentPage || 0,
              totalPages: readingBookData.totalPages || 0,
            } : null}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 200,
            }}
          />
        );
      })()}

      {/* Search Screen overlay */}
      {(currentView === 'search' || (currentView === 'bookDetail' && previousView === 'search')) && (
        <SearchScreen
          onBack={() => {
            setCurrentView('home');
            // 검색 페이지를 벗어날 때 검색 상태 초기화
            setSearchText('');
            setHasSearched(false);
            setSearchResults([]);
          }}
          recentBooks={recentBooks}
          recentSearches={recentSearches}
          onAddSearch={addToRecentSearches}
          onRemoveSearch={removeRecentSearch}
          onClearAllSearches={clearAllRecentSearches}
          onBookPress={handleRecentBookPress}
          onClearAllBooks={clearAllRecentBooks}
          searchText={searchText}
          setSearchText={setSearchText}
          hasSearched={hasSearched}
          setHasSearched={setHasSearched}
          searchResults={searchResults}
          setSearchResults={setSearchResults}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 100,
          }}
        />
      )}

      {/* CreateReadingRoom overlay - show on top of BookDetail */}
      {currentView === 'createRoom' && selectedBook && (
        <CreateReadingRoom
          bookTitle={selectedBook.title}
          bookSubtitle={selectedBook.subtitle}
          author={selectedBook.author}
          coverImage={selectedBook.coverImage}
          onBack={() => {
            // Keep selectedBook to show BookDetail when going back
            setCurrentView(previousView);
          }}
          onNext={() => {
            console.log('Next step - show confirmation modal');
            // Store the room data and show confirmation modal
            setPendingRoomData({
              bookTitle: selectedBook.title,
              author: selectedBook.author,
              bookCoverImage: selectedBook.coverImage,
              progress: 0, // New room starts at 0%
              endDate: '2026.01.22', // This should come from CreateReadingRoom form
              daysLeft: 35, // Calculate based on end date
              myPage: 0,
              isPrivate: false, // This should come from CreateReadingRoom form
            });
            setShowCreateRoomModal(true);
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 300,
          }}
        />
      )}

      {/* RoomFeed overlay - show when viewing a room feed */}
      {currentView === 'roomFeed' && selectedRoom && (
        <RoomFeed
          bookTitle={selectedRoom.bookTitle}
          author={selectedRoom.author}
          bookCoverImage={selectedRoom.bookCoverImage}
          progress={selectedRoom.progress}
          endDate={selectedRoom.endDate}
          daysLeft={selectedRoom.daysLeft}
          myPage={selectedRoom.myPage}
          isPrivate={selectedRoom.isPrivate}
          onBack={() => {
            setSelectedRoom(null);
            setCurrentView(previousView);
          }}
          onMenu={() => console.log('Menu pressed')}
          onPost={() => console.log('Post pressed')}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 400,
          }}
        />
      )}

      {/* WeeklyBestDetail overlay */}
      {(currentView === 'weeklyBestDetail' || (currentView === 'bookDetail' && previousView === 'weeklyBestDetail')) && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 500,
          display: currentView === 'bookDetail' ? 'none' : 'flex',
        }}>
          <WeeklyBestDetail
            onBack={() => {
              setCurrentView(previousView);
            }}
            onBookPress={(book) => {
              setSelectedBook(book);
              addToRecentBooks(book);
              setPreviousView('weeklyBestDetail');
              setCurrentView('bookDetail');
            }}
          />
        </View>
      )}

      {/* Create Room Confirmation Modal */}
      <ModalPopup
        visible={showCreateRoomModal}
        title="도토리룸을 만들까요?"
        primaryButtonText="만들기"
        secondaryButtonText="취소"
        onPrimaryPress={() => {
          console.log('Creating room and navigating to feed');
          // Close modal
          setShowCreateRoomModal(false);
          // Set the room data
          setSelectedRoom(pendingRoomData);
          // Close CreateReadingRoom screen
          setCurrentView('roomFeed');
          // Clear selected book
          setSelectedBook(null);
          setPendingRoomData(null);
        }}
        onSecondaryPress={() => {
          console.log('Cancelled room creation');
          setShowCreateRoomModal(false);
          setPendingRoomData(null);
        }}
        onClose={() => {
          setShowCreateRoomModal(false);
          setPendingRoomData(null);
        }}
      />
      </View>
      </ToastProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.white,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 130,
    paddingBottom: 100,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: Colors.white,
  },
  headerSafeArea: {
    position: 'relative',
    zIndex: 1,
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomNavBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomNavSafeArea: {
    position: 'relative',
    zIndex: 1,
  },
  weeklyBestSection: {
    backgroundColor: Colors.gray50,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
    marginBottom: 60,
    marginTop: Spacing.sm,
  },
  section: {
    paddingHorizontal: Spacing.md,
    marginBottom: 60,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  nowReading: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.sm,
    gap: Spacing.md,
  },
  nowReadingNull: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  nowReadingNullImage: {
    width: 320, // Fixed width
    height: 110, // Fixed height
  },
  bookCoverSmall: {
    width: 108,
    height: 158,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.gray100,
    overflow: 'hidden',
  },
  bookCoverLarge: {
    width: 126,
    height: 184,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  bookCoverMediumBest: {
    width: 106,
    height: 155,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  bookCoverPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.gray200,
  },
  nowReadingInfo: {
    flex: 1,
    paddingVertical: Spacing.xs,
  },
  bookTitle: {
    ...Typography.headline2Bold,
    color: Colors.gray900,
  },
  bookAuthor: {
    ...Typography.subtitle1Regular,
    color: Colors.gray600,
  },
  nowReadingBottom: {
    gap: Spacing.md,
  },
  progressSection: {
  },
  progressText: {
    ...Typography.body3Regular,
    color: Colors.gray800,
    marginBottom: Spacing.xs,
  },
  progressPercent: {
    fontWeight: FontWeights.extraBold,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.gray100,
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary500,
    borderRadius: 10,
  },
  continueButton: {
    backgroundColor: Colors.primary500,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    alignSelf: 'flex-end',
  },
  continueButtonText: {
    ...Typography.body2Medium,
    color: Colors.white,
  },
  tabScrollView: {
    marginHorizontal: -Spacing.md,
  },
  tabs: {
    flexDirection: 'row',
    gap: Spacing.xs,
    paddingVertical: 4,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  bestList: {
    marginHorizontal: -Spacing.md,
  },
  newBooksList: {
    marginHorizontal: -Spacing.md,
  },
  bestCard: {
    marginRight: Spacing.md,
    alignItems: 'center',
  },
  bestRank: {
    fontSize: 50,
    fontWeight: FontWeights.extraBold,
    color: Colors.gray800,
    alignSelf: 'flex-start',
  },
  bestRankSmall: {
    fontSize: 40,
  },
  bestBookTitle: {
    ...Typography.body2Medium,
    color: Colors.gray900,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  bestBookAuthor: {
    ...Typography.body2Regular,
    color: Colors.gray600,
    textAlign: 'center',
  },
  bestReviewScrollView: {
    marginHorizontal: -Spacing.md,
  },
  bestReviewList: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  navigatorContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...Typography.body2Regular,
    color: Colors.gray600,
    marginTop: Spacing.sm,
  },
  errorContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    ...Typography.body2Regular,
    color: Colors.error,
  },
});
