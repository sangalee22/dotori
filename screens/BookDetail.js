import React from 'react';
import { StyleSheet, View, Text, Image, ScrollView, Animated, PanResponder, Dimensions, ActivityIndicator, Modal, Pressable, KeyboardAvoidingView, Platform, TouchableOpacity, InputAccessoryView, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Typography, Spacing, BorderRadius } from '../styles';
import DefaultHeader from '../components/DefaultHeader';
import SectionTitle from '../components/SectionTitle';
import MoreButton from '../components/MoreButton';
import Button from '../components/Button';
import SubTab from '../components/SubTab';
import SimbolOutlineIcon from '../components/SimbolOutlineIcon';
import SimbolFillIcon from '../components/SimbolFillIcon';
import CommentIcon from '../components/CommentIcon';
import CommentLargeIcon from '../components/CommentLargeIcon';
import ReviewItem from '../components/ReviewItem';
import FeedItem from '../components/FeedItem';
import BookTopSection from '../components/BookTopSection';
import PopupHeader from '../components/PopupHeader';
import TextField from '../components/TextField';
import Checkbox from '../components/Checkbox';
import HelpIcon from '../components/HelpIcon';
import ImageIcon from '../components/ImageIcon';
import DeleteIcon from '../components/DeleteIcon';
import Toast from '../components/Toast';
import IconButton from '../components/IconButton';
import Switch from '../components/Switch';
import ChevronDownIcon from '../components/ChevronDownIcon';
import CheckIcon from '../components/CheckIcon';
import { useToast } from '../contexts/ToastContext';
import { fetchBookDetail, searchBooks, formatAuthorForDetail } from '../services/aladinApi';
import { formatTimeAgo } from '../utils/formatTimeAgo';
import Skeleton from '../components/Skeleton';

/**
 * BookDetail Screen
 * @param {string} isbn - Book ISBN (required for API)
 * @param {string} bookTitle - Book title (fallback)
 * @param {string} bookSubtitle - Book subtitle (optional)
 * @param {string} author - Book author (fallback)
 * @param {string} coverImage - Book cover image URL (fallback)
 * @param {boolean} initialFavorite - Initial favorite state
 * @param {function} onToggleFavorite - Callback when favorite is toggled
 * @param {function} onBack - Callback when back button is pressed
 * @param {function} onMenu - Callback when menu button is pressed
 * @param {function} onUpdateReading - Callback when reading status is updated (page, review, completion)
 * @param {function} onAddReview - Callback when review is submitted
 * @param {function} onEditReview - Callback when review is edited
 * @param {function} onDeleteReview - Callback when review is deleted
 * @param {array} reviews - Array of reviews for this book
 * @param {object} currentUser - Current user data
 * @param {string} initialTab - Initial tab to show ('info' or 'reviews')
 * @param {boolean} openReviewModal - Whether to automatically open review modal on mount
 * @param {object} initialReadingState - Initial reading state {isReading, isCompleted, currentPage, totalPages}
 * @param {object} style - Additional style overrides
 */
export default function BookDetail({
  isbn,
  bookTitle = null,
  bookSubtitle,
  author = null,
  coverImage,
  initialFavorite = false,
  onToggleFavorite,
  onBack,
  onMenu,
  onCreateRoom,
  onUpdateReading,
  onAddReview,
  onEditReview,
  onDeleteReview,
  reviews = [],
  currentUser,
  initialTab = 'info',
  openReviewModal = false,
  reviewInitialPage = 0,
  reviewInitialImages = [],
  targetReviewId = null,
  initialReadingState = null,
  style,
}) {
  const insets = useSafeAreaInsets();
  const [scrollYPos, setScrollYPos] = React.useState(0);
  const slideAnim = React.useRef(new Animated.Value(Dimensions.get('window').width)).current;
  const [isFavorite, setIsFavorite] = React.useState(initialFavorite);
  const { showToast, hideToast } = useToast();
  const scrollViewRef = React.useRef(null);
  const feedSectionLayoutY = React.useRef(0);
  const reviewLayoutYs = React.useRef({});

  // Scroll to targetReviewId when reviews tab is active
  React.useEffect(() => {
    if (!targetReviewId || activeTab !== 'reviews') return;
    const timer = setTimeout(() => {
      const reviewY = reviewLayoutYs.current[targetReviewId];
      if (reviewY !== undefined) {
        scrollViewRef.current?.scrollTo({ y: feedSectionLayoutY.current + reviewY, animated: true });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [targetReviewId, activeTab]);

  // Hide toast when component unmounts
  React.useEffect(() => {
    return () => {
      hideToast();
    };
  }, [hideToast]);

  // Review modal state
  const [isReviewModalVisible, setIsReviewModalVisible] = React.useState(false);
  const [reviewPageInput, setReviewPageInput] = React.useState('');
  const [reviewContent, setReviewContent] = React.useState('');
  const [isSpoiler, setIsSpoiler] = React.useState(true);
  const [toastVisible, setToastVisible] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');
  const [helpTooltipVisible, setHelpTooltipVisible] = React.useState(false);
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);

  React.useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', e => setKeyboardHeight(e.endCoordinates.height));
    const hide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setKeyboardHeight(0));
    return () => { show.remove(); hide.remove(); };
  }, []);
  const [selectedImages, setSelectedImages] = React.useState([]);
  const [editingReviewId, setEditingReviewId] = React.useState(null); // Track which review is being edited
  const [isEditMode, setIsEditMode] = React.useState(false); // Track if we're in edit mode
  const reviewModalTranslateY = React.useRef(new Animated.Value(Dimensions.get('window').height)).current;

  // Auto-open review modal if requested
  React.useEffect(() => {
    if (openReviewModal) {
      const timer = setTimeout(() => {
        setReviewPageInput(reviewInitialPage > 0 ? String(reviewInitialPage) : '');
        setReviewContent('');
        setIsSpoiler(true);
        setSelectedImages(reviewInitialImages.length > 0 ? reviewInitialImages : []);
        setIsReviewModalVisible(true);
        Animated.spring(reviewModalTranslateY, {
          toValue: 0,
          useNativeDriver: false,
          tension: 50,
          friction: 10,
        }).start();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [openReviewModal]);

  // API 상태 관리
  const [bookData, setBookData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  // Reading state - initialize from initialReadingState if provided
  const [isReading, setIsReading] = React.useState(initialReadingState?.isReading || false);
  const [isCompleted, setIsCompleted] = React.useState(initialReadingState?.isCompleted || false);
  const [readingProgress, setReadingProgress] = React.useState(0); // Default 0%
  const [currentPage, setCurrentPage] = React.useState(initialReadingState?.currentPage || 0);

  // Tab state
  const [activeTab, setActiveTab] = React.useState(initialTab); // 'info' or 'reviews'
  const [showUpToMyProgress, setShowUpToMyProgress] = React.useState(false); // Filter reviews by progress
  const [sortOrder, setSortOrder] = React.useState('latest'); // 'latest' or 'likes'
  const [isSortModalVisible, setIsSortModalVisible] = React.useState(false);
  const [reviewLikeCounts, setReviewLikeCounts] = React.useState({}); // Track actual like counts from AsyncStorage
  const sortModalTranslateY = React.useRef(new Animated.Value(300)).current;

  // Sticky tab calculation
  const [bookTopSectionHeight, setBookTopSectionHeight] = React.useState(0);
  const TAB_HEIGHT = 48;
  const HEADER_HEIGHT = 52 + insets.top;
  const isTabSticky = bookTopSectionHeight > 0 && scrollYPos > (bookTopSectionHeight - HEADER_HEIGHT);

  // Load like counts from AsyncStorage for all reviews
  React.useEffect(() => {
    const loadLikeCounts = async () => {
      const counts = {};
      for (const review of reviews) {
        try {
          const savedLikeState = await AsyncStorage.getItem(`feedLike_${review.id}`);
          if (savedLikeState) {
            const { likeCount } = JSON.parse(savedLikeState);
            counts[review.id] = likeCount;
          } else {
            counts[review.id] = review.likes || 0;
          }
        } catch (error) {
          console.error('Error loading like count:', error);
          counts[review.id] = review.likes || 0;
        }
      }
      setReviewLikeCounts(counts);
    };

    loadLikeCounts();
  }, [reviews]);

  // Filter reviews for this book and sort
  const bookReviews = React.useMemo(() => {
    const normTitle = (s) => (s || '').split(' - ')[0].trim().toLowerCase();
    const thisTitle = normTitle(bookTitle);
    let filtered = reviews.filter(review =>
      review.bookIsbn === isbn ||
      (thisTitle && normTitle(review.book?.title) === thisTitle)
    );

    // Apply progress filter if enabled
    if (showUpToMyProgress) {
      filtered = filtered.filter(review => {
        // Show all completed reviews
        if (review.isCompleted) return true;
        // Show reviews up to my current page
        return !review.page || review.page <= currentPage;
      });
    }

    // Sort by selected order
    if (sortOrder === 'latest') {
      return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortOrder === 'likes') {
      // Use actual like counts from AsyncStorage
      return filtered.sort((a, b) => {
        const aLikes = reviewLikeCounts[a.id] !== undefined ? reviewLikeCounts[a.id] : (a.likes || 0);
        const bLikes = reviewLikeCounts[b.id] !== undefined ? reviewLikeCounts[b.id] : (b.likes || 0);

        console.log(`Comparing: a.id=${a.id}, aLikes=${aLikes}, b.id=${b.id}, bLikes=${bLikes}`);

        // If like counts are different, sort by likes (descending)
        if (bLikes !== aLikes) {
          return bLikes - aLikes;
        }

        // If like counts are equal (including 0), sort by creation date (newest first)
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    }

    return filtered;
  }, [reviews, isbn, showUpToMyProgress, currentPage, sortOrder, reviewLikeCounts]);

  // Page edit modal state
  const [isPageEditModalVisible, setIsPageEditModalVisible] = React.useState(false);
  const [pageInput, setPageInput] = React.useState('');
  const pageModalTranslateY = React.useRef(new Animated.Value(0)).current;

  // 독서 시작 모달 (플레이 버튼) — 캘린더 수기입력과 별개
  const [isStartReadingModalVisible, setIsStartReadingModalVisible] = React.useState(false);
  const [startPageInput, setStartPageInput] = React.useState('');
  const [startPageError, setStartPageError] = React.useState('');
  const startReadingModalTranslateY = React.useRef(new Animated.Value(300)).current;

  // PanResponder for page edit modal drag
  const pageEditPanResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to vertical drags
        return Math.abs(gestureState.dy) > 5 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (evt, gestureState) => {
        // Only allow downward drag
        if (gestureState.dy > 0) {
          pageModalTranslateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        // If dragged more than 100px, close the modal
        if (gestureState.dy > 100) {
          handleClosePageEdit();
        } else {
          // Otherwise, spring back to original position
          Animated.spring(pageModalTranslateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 10,
          }).start();
        }
      },
    })
  ).current;

  // PanResponder for review modal drag
  const reviewPanResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to vertical drags
        return Math.abs(gestureState.dy) > 5 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (evt, gestureState) => {
        // Only allow downward drag
        if (gestureState.dy > 0) {
          reviewModalTranslateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        // If dragged more than 100px, close the modal
        if (gestureState.dy > 100) {
          handleCloseReview();
        } else {
          // Otherwise, spring back to original position
          Animated.spring(reviewModalTranslateY, {
            toValue: 0,
            useNativeDriver: false,
            tension: 50,
            friction: 10,
          }).start();
        }
      },
    })
  ).current;

  // PanResponder for sort modal drag
  const sortPanResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to vertical drags
        return Math.abs(gestureState.dy) > 5 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (evt, gestureState) => {
        // Only allow downward drag
        if (gestureState.dy > 0) {
          sortModalTranslateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        // If dragged more than 100px, close the modal
        if (gestureState.dy > 100) {
          handleCloseSortModal();
        } else {
          // Otherwise, spring back to original position
          Animated.spring(sortModalTranslateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 10,
          }).start();
        }
      },
    })
  ).current;

  // Slide in animation on mount
  React.useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: false,
      tension: 50,
      friction: 10,
    }).start();
  }, []);

  // Update local state when initialFavorite changes
  React.useEffect(() => {
    setIsFavorite(initialFavorite);
  }, [initialFavorite]);

  // 책 상세 정보 API 호출 — 제목으로 정확한 isbn 먼저 확보 후 상세 조회
  React.useEffect(() => {
    if (!isbn && !bookTitle) return;

    const loadBookDetail = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let targetIsbn = isbn;

        // 제목으로 Aladin isbn 재확인 (Firestore isbn이 API와 불일치할 수 있음)
        if (bookTitle) {
          const norm = (s) => (s || '').split(' - ')[0].trim().toLowerCase();
          const results = await searchBooks(bookTitle, 'Title', 3);
          const match = results?.find(b => {
            const t = norm(b.title);
            const s = norm(bookTitle);
            return t === s || t.includes(s) || s.includes(t);
          }) || results?.[0];
          if (match?.isbn) targetIsbn = match.isbn;
        }

        const data = await fetchBookDetail(targetIsbn);
        setBookData(data);
      } catch (err) {
        setError('책 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadBookDetail();
  }, [isbn, bookTitle]);

  // Calculate reading progress when bookData is loaded and initialReadingState exists
  React.useEffect(() => {
    if (bookData && initialReadingState && initialReadingState.currentPage > 0) {
      const totalPages = bookData?.subInfo?.itemPage || initialReadingState.totalPages || 1000;
      const progress = Math.round((initialReadingState.currentPage / totalPages) * 100);
      setReadingProgress(progress);
    }
  }, [bookData, initialReadingState]);

  // Calculate header opacity based on scroll position
  const headerOpacity = Math.min(scrollYPos / 100, 1);

  // Handle go to reviews tab
  const handleGoToReviewsTab = () => {
    setActiveTab('reviews');
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  // Handle back with animation
  const handleBack = () => {
    Animated.timing(slideAnim, {
      toValue: Dimensions.get('window').width,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      if (onBack) {
        onBack();
      }
    });
  };

  // Pan responder for swipe to go back
  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to horizontal swipes from the left edge
        const { pageX } = evt.nativeEvent;
        const { dx, dy } = gestureState;
        return pageX < 50 && dx > 10 && Math.abs(dy) < Math.abs(dx);
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dx > 0) {
          slideAnim.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        const screenWidth = Dimensions.get('window').width;
        // If swiped more than 30% of screen width, go back
        if (gestureState.dx > screenWidth * 0.3) {
          handleBack();
        } else {
          // Otherwise, spring back to original position
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: false,
            tension: 50,
            friction: 10,
          }).start();
        }
      },
    })
  ).current;

  // Handle favorite toggle
  const handleFavoriteToggle = () => {
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);

    // Call parent callback to update global state
    if (onToggleFavorite) {
      onToggleFavorite();
    }

    // Show toast only when adding to favorites
    if (newFavoriteState) {
      showToast('읽고 싶은 책장에 추가되었어요.');
    }
  };

  // Handle page edit modal
  const handleOpenPageEdit = () => {
    if (isPageEditModalVisible) return;
    setPageInput(currentPage === 0 ? '' : String(currentPage));
    setIsPageEditModalVisible(true);
    Animated.spring(pageModalTranslateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 10,
    }).start();
  };

  const handleClosePageEdit = () => {
    Animated.timing(pageModalTranslateY, {
      toValue: 300,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsPageEditModalVisible(false);
      setPageInput('');
    });
  };

  const handlePageUpdate = () => {
    const newPage = pageInput.trim() === '' ? 0 : parseInt(pageInput, 10);
    const totalPages = bookData?.subInfo?.itemPage || 1000;

    if (isNaN(newPage) || newPage < 0) {
      setToastMessage('페이지를 입력해주세요');
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2000);
      return;
    }

    if (newPage > totalPages) {
      setToastMessage('책의 마지막 페이지를 넘었어요');
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2000);
      return;
    }

    setCurrentPage(newPage);
    const progress = totalPages > 0 ? Math.round((newPage / totalPages) * 100) : 0;
    setReadingProgress(progress);

    // Update completed state based on whether user finished the book
    const isBookCompleted = newPage >= totalPages;
    if (isBookCompleted) {
      setIsCompleted(true);
    } else {
      setIsCompleted(false);
    }

    // Notify parent about reading update
    if (onUpdateReading) {
      onUpdateReading(isBookCompleted ? 'complete' : 'updatePage', {
        currentPage: newPage,
        totalPages,
        isCompleted: isBookCompleted,
      });
    }

    handleClosePageEdit();
    showToast('진도율이 업데이트되었습니다.');
  };

  const handleCompleteBook = () => {
    const totalPages = bookData?.subInfo?.itemPage || 1000;
    setCurrentPage(totalPages);
    setReadingProgress(100);
    setIsCompleted(true);

    if (onUpdateReading) {
      onUpdateReading('complete', {
        currentPage: totalPages,
        totalPages,
        isCompleted: true,
      });
    }

    handleClosePageEdit();
    showToast('완독하셨습니다!');
  };

  const handleRestartBook = () => {
    setCurrentPage(0);
    setReadingProgress(0);
    setIsCompleted(false);

    if (onUpdateReading) {
      onUpdateReading('startReading', {
        currentPage: 0,
        totalPages: bookData?.subInfo?.itemPage || 1000,
        isCompleted: false,
      });
    }

    handleClosePageEdit();
    showToast('처음부터 다시 읽어요!');
  };

  // 독서 시작 모달 핸들러 (플레이 버튼 전용)
  const handleOpenStartReading = () => {
    if (isStartReadingModalVisible) return;
    setStartPageInput('');
    setStartPageError('');
    setIsStartReadingModalVisible(true);
    Animated.spring(startReadingModalTranslateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 10,
    }).start();
  };

  const handleCloseStartReading = () => {
    Animated.timing(startReadingModalTranslateY, {
      toValue: 300,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsStartReadingModalVisible(false);
      setStartPageInput('');
      setStartPageError('');
    });
  };

  const handleConfirmStartReading = () => {
    const totalPages = bookData?.subInfo?.itemPage || 1000;
    const inputNum = startPageInput.trim() === '' ? 0 : parseInt(startPageInput, 10);

    if (isNaN(inputNum) || inputNum < 0) {
      setStartPageError('올바른 페이지를 입력해주세요');
      return;
    }
    if (inputNum > totalPages) {
      setStartPageError('책의 마지막 페이지를 넘었어요');
      return;
    }
    // 0은 처음부터 시작이라 항상 허용, 1 이상일 때만 현재 진도 체크
    if (inputNum > 0 && inputNum < currentPage) {
      setStartPageError('현재 진도율부터 읽을 수 있어요');
      return;
    }

    setStartPageError('');
    setIsReading(true);
    // 0 입력 시 진도 초기화
    const startPage = inputNum === 0 ? 0 : inputNum;
    setCurrentPage(startPage);
    const progress = totalPages > 0 ? Math.round((startPage / totalPages) * 100) : 0;
    setReadingProgress(progress);

    if (onUpdateReading) {
      onUpdateReading('startReading', {
        currentPage: startPage,
        totalPages,
        isCompleted: false,
      });
    }

    handleCloseStartReading();
    showToast(startPage === 0 ? '처음부터 읽어요!' : `${startPage}페이지부터 읽어요!`);
  };

  // Handle review modal
  const handleOpenReview = () => {
    if (isReviewModalVisible) return;
    setReviewPageInput('');
    setReviewContent('');
    setIsSpoiler(true);
    setSelectedImages([]);
    setIsReviewModalVisible(true);
    Animated.spring(reviewModalTranslateY, {
      toValue: 0,
      useNativeDriver: false,
      tension: 50,
      friction: 10,
    }).start();
  };

  const handleCloseReview = () => {
    Animated.timing(reviewModalTranslateY, {
      toValue: Dimensions.get('window').height,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setIsReviewModalVisible(false);
      setReviewPageInput('');
      setReviewContent('');
      setIsSpoiler(true);
      setSelectedImages([]);
      setEditingReviewId(null);
      setIsEditMode(false);
    });
  };

  // Handle image picker
  const handlePickImage = async () => {
    if (selectedImages.length >= 5) {
      setToastMessage('이미지는 최대 5장까지만 추가할 수 있어요.');
      setToastVisible(true);
      return;
    }
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        showToast('사진첩 접근 권한이 필요합니다.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 5,
      });

      if (!result.canceled && result.assets) {
        // Add selected images to the existing array (max 5)
        const newImages = result.assets.map(asset => asset.uri);
        const combinedImages = [...selectedImages, ...newImages].slice(0, 5);
        setSelectedImages(combinedImages);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      showToast('사진을 선택하는 중 오류가 발생했습니다.');
    }
  };

  // Remove image from selection
  const handleRemoveImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReview = () => {
    // Parse page - allow empty page
    const page = reviewPageInput.trim() ? parseInt(reviewPageInput, 10) : null;

    // Validate page only if it was provided
    if (reviewPageInput.trim() && (isNaN(page) || page < 0)) {
      setToastMessage('올바른 페이지 번호를 입력해주세요');
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2000);
      return;
    }

    const totalPages = bookData?.subInfo?.itemPage || 1000;
    if (page && page > totalPages) {
      setToastMessage('책의 마지막 페이지를 넘었어요');
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2000);
      return;
    }

    if (isEditMode && editingReviewId) {
      // Update existing review
      const updatedReview = {
        id: editingReviewId,
        type: selectedImages.length > 0 ? 'img' : (isSpoiler ? 'spo' : 'text'),
        page: page || null,
        content: reviewContent,
        images: selectedImages.length > 0 ? selectedImages : undefined,
        isSpoiler,
        updatedAt: new Date().toISOString(),
      };

      // Call parent callback to update review
      if (onEditReview) {
        onEditReview(editingReviewId, updatedReview);
      }

      // Close modal
      handleCloseReview();

      showToast('독후감이 수정되었습니다.');
    } else {
      // Create new review
      const newReview = {
        id: Date.now().toString(),
        type: selectedImages.length > 0 ? 'img' : (isSpoiler ? 'spo' : 'text'),
        userId: currentUser?.id, // Add user ID for ownership check
        user: {
          name: currentUser?.nickname || currentUser?.name || 'User name',
          profileImage: currentUser?.profileImage || null,
        },
        timeAgo: '방금 전',
        page: page || null,
        content: reviewContent,
        images: selectedImages.length > 0 ? selectedImages : undefined,
        likes: 0,
        comments: 0,
        isSpoiler,
        isCompleted: isCompleted,
        bookIsbn: isbn,
        book: {
          title: displayTitle,
          author: mainAuthors.length > 0 ? mainAuthors.map(a => a.name).join(', ') : author.split(',')[0].trim(),
          cover: displayCover,
        },
        createdAt: new Date().toISOString(),
      };

      // Call parent callback to add review
      if (onAddReview) {
        onAddReview(newReview);
      }

      // Notify parent about review submission for reading progress (only if page is provided)
      if (onUpdateReading && page) {
        onUpdateReading('addReview', {
          currentPage: page,
          totalPages,
          isCompleted: false,
        });
      }

      // Close modal
      handleCloseReview();

      // Switch to reviews tab and scroll to top
      setActiveTab('reviews');
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }, 100);

      showToast('독후감이 등록되었습니다.');
    }
  };

  // Handle review edit
  const handleEditReview = (reviewData) => {
    // Set edit mode
    setIsEditMode(true);
    setEditingReviewId(reviewData.id);

    // Populate form with existing data
    setReviewPageInput(reviewData.page ? String(reviewData.page) : '');
    setReviewContent(reviewData.content);
    setIsSpoiler(reviewData.isSpoiler);
    setSelectedImages(reviewData.images || []);

    // Open modal
    setIsReviewModalVisible(true);
    Animated.spring(reviewModalTranslateY, {
      toValue: 0,
      useNativeDriver: false,
      tension: 50,
      friction: 10,
    }).start();
  };

  // Handle review deletion
  const handleDeleteReview = (reviewId) => {
    // Call parent callback to remove review from global state
    if (onDeleteReview) {
      onDeleteReview(reviewId);
    }
  };

  // Sort modal handlers
  const handleOpenSortModal = () => {
    if (isSortModalVisible) return;
    setIsSortModalVisible(true);
    Animated.spring(sortModalTranslateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 10,
    }).start();
  };

  const handleCloseSortModal = () => {
    Animated.timing(sortModalTranslateY, {
      toValue: 300,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsSortModalVisible(false);
    });
  };

  const handleSelectSort = (order) => {
    setSortOrder(order);
    handleCloseSortModal();
  };

  // API 데이터 또는 fallback 데이터 사용
  // title에서 제목과 부제목 분리 (예: "모우어 - 잿빛 미래의 이야기" -> "모우어", "잿빛 미래의 이야기")
  // 제목·저자: props 우선 (Firestore 저장 데이터가 신뢰할 수 있음)
  // 커버·설명·출판사 등 부가정보: API 데이터 사용
  const fullTitle = bookTitle || bookData?.title || '';
  const titleParts = fullTitle.split(' - ');
  const displayTitle = titleParts[0].trim();
  const displaySubtitle = titleParts.length > 1
    ? titleParts.slice(1).join(' - ').trim()
    : (bookData?.subTitle || bookData?.subtitle || bookSubtitle);
  const authorData = formatAuthorForDetail(author || bookData?.author);
  const translatorRoles = ['옮긴이', '번역', '역자', '역'];
  const mainAuthors = authorData.filter(a => !a.role || !translatorRoles.some(r => a.role.includes(r)));
  const translators = authorData.filter(a => a.role && translatorRoles.some(r => a.role.includes(r)));
  const displayCover = coverImage || bookData?.cover;
  const displayDescription = bookData?.description || '';
  const displayPublisher = bookData?.publisher || '-';
  const displayPubDate = bookData?.pubDate || '-';
  const displayPages = bookData?.subInfo?.itemPage ? `${bookData.subInfo.itemPage}p` : '-';
  const displayCategory = bookData?.categoryName
    ? (bookData.categoryName.split('>')[2] ?? '-')
    : '-';

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          transform: [{ translateX: slideAnim }],
        }
      ]}
      {...panResponder.panHandlers}
    >
      <StatusBar style="dark" />

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={(e) => setScrollYPos(e.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
      >
        {/* Top Section with Book Cover and Info */}
        <View
          style={{ marginBottom: Spacing.lg }}
          onLayout={(event) => {
            const { height } = event.nativeEvent.layout;
            setBookTopSectionHeight(height);
          }}
        >
          <BookTopSection
            bookTitle={displayTitle}
            bookSubtitle={displaySubtitle}
            author={mainAuthors.length > 0 ? mainAuthors.map(a => a.name).join(', ') : author.split(',')[0].trim()}
            coverImage={displayCover}
            paddingTop={insets.top + 70}
            isLoading={isLoading}
          />
        </View>

        {/* Tab Section - In scroll (hidden when sticky) */}
        {!isTabSticky && (
          Platform.OS === 'web' ? (
            <View style={styles.tabSectionWeb}>
              <View style={styles.tabSection}>
                <SubTab
                  active={activeTab === 'info'}
                  onPress={() => setActiveTab('info')}
                >
                  정보
                </SubTab>
                <SubTab
                  active={activeTab === 'reviews'}
                  onPress={() => setActiveTab('reviews')}
                >
                  독후감
                </SubTab>
              </View>
            </View>
          ) : (
            <View style={styles.tabSectionBlur}>
              <View style={styles.tabSection}>
                <SubTab
                  active={activeTab === 'info'}
                  onPress={() => setActiveTab('info')}
                >
                  정보
                </SubTab>
                <SubTab
                  active={activeTab === 'reviews'}
                  onPress={() => setActiveTab('reviews')}
                >
                  독후감
                </SubTab>
              </View>
            </View>
          )
        )}

        {/* Placeholder for sticky tab to prevent content jump */}
        {isTabSticky && <View style={{ height: TAB_HEIGHT }} />}

        {/* Filter and Sort - Outside sectionDetail */}
        {activeTab === 'reviews' && (
          <View style={styles.filterSortContainer}>
            <TouchableOpacity style={styles.sortButton} activeOpacity={0.7} onPress={handleOpenSortModal}>
              <Text style={styles.sortText}>{sortOrder === 'latest' ? '최신순' : '좋아요순'}</Text>
              <ChevronDownIcon width={24} height={24} color={Colors.gray600} />
            </TouchableOpacity>
            <View style={styles.switchGroup}>
              <Text style={styles.switchLabel}>내 진도까지</Text>
              <Switch
                value={showUpToMyProgress}
                onValueChange={setShowUpToMyProgress}
              />
            </View>
          </View>
        )}

        {/* Section Detail */}
        <View style={[styles.sectionDetail, activeTab === 'reviews' ? styles.sectionDetailReviews : styles.sectionDetailInfo]}>
          {/* Book Summary Section */}
          {activeTab === 'info' && (
          <>
          <View style={styles.bookSummarySection}>
            <View style={styles.bookSummaryContainer}>
              {isLoading ? (
                <View style={{ gap: 8, flex: 1 }}>
                  <Skeleton width="100%" height={14} borderRadius={4} />
                  <Skeleton width="100%" height={14} borderRadius={4} />
                  <Skeleton width="70%" height={14} borderRadius={4} />
                </View>
              ) : (
                <>
                  <Text style={styles.bookSummaryText}>{displayDescription}</Text>
                  <View style={styles.bookSummaryIcon}>
                    <CommentLargeIcon width={60} height={60} />
                  </View>
                </>
              )}
            </View>

            {/* Book Info Details */}
            <View style={styles.bookInfoDetails}>
              {isLoading ? (
                <>
                  <View style={styles.infoRow}>
                    <Skeleton width={40} height={14} borderRadius={4} />
                    <Skeleton width={120} height={14} borderRadius={4} style={{ marginLeft: 8 }} />
                  </View>
                  <View style={styles.infoRow}>
                    <Skeleton width={40} height={14} borderRadius={4} />
                    <Skeleton width={100} height={14} borderRadius={4} style={{ marginLeft: 8 }} />
                  </View>
                  <View style={styles.infoRow}>
                    <Skeleton width={40} height={14} borderRadius={4} />
                    <Skeleton width={80} height={14} borderRadius={4} style={{ marginLeft: 8 }} />
                  </View>
                  <View style={styles.infoRow}>
                    <Skeleton width={40} height={14} borderRadius={4} />
                    <Skeleton width={60} height={14} borderRadius={4} style={{ marginLeft: 8 }} />
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>저자</Text>
                    <Text style={styles.infoValue}>
                      {mainAuthors.length > 0 ? mainAuthors.map(a => a.name).join(', ') : (author?.split(',')[0].trim() ?? '')}
                    </Text>
                  </View>
                  {translators.length > 0 && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>옮긴이</Text>
                      <Text style={styles.infoValue}>{translators.map(a => a.name).join(', ')}</Text>
                    </View>
                  )}
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>출판사</Text>
                    <View style={styles.infoValueRow}>
                      <Text style={styles.infoValue}>{displayPublisher}</Text>
                      <Text style={styles.infoValueSecondary}> {displayPubDate}</Text>
                    </View>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>카테고리</Text>
                    <Text style={styles.infoValue}>{displayCategory}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>분량</Text>
                    <Text style={styles.infoValue}>{displayPages}</Text>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Book Review Section */}
          <View style={styles.bookReviewSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <SectionTitle style={{ paddingRight: 0 }}>독후감</SectionTitle>
                {bookReviews.length > 0 && (
                  <Text style={styles.reviewCount}>{bookReviews.length}</Text>
                )}
              </View>
              <MoreButton label="전체" onPress={handleGoToReviewsTab} />
            </View>

            <View style={styles.reviewContainer}>
              {bookReviews.length === 0 ? (
                <View style={styles.emptyReviewCard}>
                  <SimbolOutlineIcon width={20} height={20} color={Colors.gray700} />
                  <Text style={styles.emptyReviewCardText}>{'아직 독후감이 없어요!\n혹시 이 책을 읽었나요?'}</Text>
                  <Button
                    variant="sub"
                    size="medium"
                    onPress={handleOpenReview}
                  >
                    독후감 쓰기
                  </Button>
                </View>
              ) : (
                <>
                  {bookReviews.slice(0, 3).map((review) => (
                    <ReviewItem
                      key={review.id}
                      username={review.user?.name ?? '익명'}
                      userImage={review.user?.profileImage}
                      date={formatTimeAgo(review.createdAt)}
                      page={review.page}
                      isCompleted={review.isCompleted}
                      reviewText={review.content}
                      numberOfLines={3}
                    />
                  ))}
                  <View style={styles.alreadyReadBox}>
                    <View style={styles.alreadyReadContent}>
                      <View style={styles.alreadyReadLeft}>
                        <SimbolOutlineIcon width={20} height={20} color={Colors.gray700} />
                        <Text style={styles.alreadyReadText}>이미 읽으셨나요?</Text>
                      </View>
                      <Button
                        variant="sub"
                        size="medium"
                        style={styles.alreadyReadButton}
                        onPress={handleOpenReview}
                      >
                        독후감 쓰기
                      </Button>
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>
          </>
          )}

          {/* Reviews Feed Section */}
          {activeTab === 'reviews' && (
            <View
              style={styles.feedSection}
              onLayout={(e) => { feedSectionLayoutY.current = e.nativeEvent.layout.y; }}
            >
              {bookReviews.length > 0 ? (
                bookReviews.map((item) => (
                  <View
                    key={item.id}
                    onLayout={(e) => { reviewLayoutYs.current[item.id] = e.nativeEvent.layout.y; }}
                  >
                  <FeedItem
                    key={item.id}
                    id={item.id}
                    type={item.type}
                    user={item.userId === currentUser?.id
                      ? { name: currentUser.nickname || currentUser.name, profileImage: currentUser.profileImage }
                      : item.user}
                    timeAgo={item.createdAt ? formatTimeAgo(item.createdAt) : item.timeAgo}
                    page={item.page}
                    myCurrentPage={isReading && !isCompleted ? currentPage : Infinity}
                    content={item.content}
                    images={item.images}
                    likes={item.likes}
                    comments={item.comments}
                    isSpoiler={item.isSpoiler}
                    isCompleted={item.isCompleted}
                    isMyReview={item.userId === currentUser?.id}
                    onRevealSpoiler={() => {
                      console.log('Reveal spoiler for item', item.id);
                    }}
                    onEdit={handleEditReview}
                    onDelete={handleDeleteReview}
                  />
                  </View>
                ))
              ) : (
                <View style={styles.emptyReviews}>
                  <SimbolOutlineIcon width={20} height={20} color={Colors.gray700} />
                  <Text style={styles.emptyReviewsText}>아직 작성된 독후감이 없어요</Text>
                </View>
              )}
            </View>
          )}

        </View>
      </ScrollView>

      {/* Sticky Tab Section - Fixed position */}
      {isTabSticky && (
        <View style={[styles.tabSectionFixed, { top: HEADER_HEIGHT }]}>
          {Platform.OS === 'web' ? (
            <View style={styles.tabSectionWeb}>
              <View style={styles.tabSection}>
                <SubTab
                  active={activeTab === 'info'}
                  onPress={() => setActiveTab('info')}
                >
                  정보
                </SubTab>
                <SubTab
                  active={activeTab === 'reviews'}
                  onPress={() => setActiveTab('reviews')}
                >
                  독후감
                </SubTab>
              </View>
            </View>
          ) : (
            <View style={styles.tabSectionBlur}>
              <View style={styles.tabSection}>
                <SubTab
                  active={activeTab === 'info'}
                  onPress={() => setActiveTab('info')}
                >
                  정보
                </SubTab>
                <SubTab
                  active={activeTab === 'reviews'}
                  onPress={() => setActiveTab('reviews')}
                >
                  독후감
                </SubTab>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Default Header */}
      <DefaultHeader
        onBack={handleBack}
        onMenu={handleFavoriteToggle}
        title={displayTitle}
        titleOpacity={headerOpacity}
        gradientOpacity={headerOpacity}
        rightButton={
          isFavorite ? (
            <SimbolFillIcon width={24} height={24} />
          ) : (
            <SimbolOutlineIcon width={24} height={24} color={Colors.gray800} />
          )
        }
      />

      {/* Page Edit Modal */}
      <Modal
        visible={isPageEditModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={handleClosePageEdit}
      >
        <Pressable style={styles.modalOverlay} onPress={handleClosePageEdit}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{ translateY: pageModalTranslateY }],
              },
            ]}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View {...pageEditPanResponder.panHandlers}>
                <PopupHeader title="나의 독서 진도율" />
              </View>

              {/* 컨텐츠 영역 */}
              <View style={styles.modalBody}>
                <TextField
                  label="몇 페이지까지 읽으셨나요?"
                  value={pageInput}
                  onChangeText={(text) => {
                    const numericValue = text.replace(/[^0-9]/g, '');
                    setPageInput(numericValue);
                  }}
                  placeholder="페이지 입력"
                  keyboardType="number-pad"
                  returnKeyType="none"
                  helpText="책의 출판사, 판쇄에 따라 페이지 수가 다를 수 있습니다"
                  autoFocus={true}
                  inputAccessoryViewID="hideDoneButton"
                />
              </View>

              {/* 버튼 영역 */}
              <View style={styles.modalButtons}>
                {isCompleted ? (
                  <Button
                    variant="outline"
                    size="xlarge"
                    onPress={handleRestartBook}
                    style={styles.button}
                  >
                    처음부터 읽기
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="xlarge"
                    onPress={handleCompleteBook}
                    style={styles.button}
                  >
                    완독
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="xlarge"
                  onPress={handlePageUpdate}
                  style={styles.button}
                >
                  수정
                </Button>
              </View>
            </Pressable>
          </Animated.View>
        </Pressable>

        {/* Toast inside Modal */}
        <Toast
          visible={toastVisible && isPageEditModalVisible}
          message={toastMessage}
          onHide={() => setToastVisible(false)}
        />
      </Modal>

      {/* 독서 시작 모달 (플레이 버튼 전용) */}
      <Modal
        visible={isStartReadingModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={handleCloseStartReading}
      >
        <Pressable style={styles.modalOverlay} onPress={handleCloseStartReading}>
          <Animated.View
            style={[styles.modalContent, { transform: [{ translateY: startReadingModalTranslateY }] }]}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              <PopupHeader title="독서 시작" />
              <View style={styles.modalBody}>
                <TextField
                  label="몇 페이지부터 읽을까요?"
                  value={startPageInput}
                  onChangeText={(text) => {
                    const numeric = text.replace(/[^0-9]/g, '');
                    setStartPageInput(numeric);
                    setStartPageError('');
                  }}
                  placeholder="페이지 입력"
                  keyboardType="number-pad"
                  returnKeyType="none"
                  helpText={startPageError || '0을 입력하시면 처음부터 읽어요'}
                  error={!!startPageError}
                  autoFocus={true}
                  inputAccessoryViewID="hideDoneButton"
                />
              </View>
              <View style={styles.modalButtons}>
                <Button
                  variant="outline"
                  size="xlarge"
                  onPress={handleCloseStartReading}
                  style={styles.button}
                >
                  취소
                </Button>
                <Button
                  variant="primary"
                  size="xlarge"
                  onPress={handleConfirmStartReading}
                  style={styles.button}
                >
                  시작하기
                </Button>
              </View>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>

      {/* Book Review Modal */}
      <Modal
        visible={isReviewModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={handleCloseReview}
      >
        <Pressable style={styles.reviewModalOverlay} onPress={handleCloseReview}>
          <Animated.View
            style={[
              styles.reviewModalContent,
              {
                transform: [{ translateY: reviewModalTranslateY }],
              },
            ]}
          >
            <Pressable onPress={(e) => e.stopPropagation()} style={{ flex: 1 }}>
              {/* Header */}
              <View {...reviewPanResponder.panHandlers}>
                <PopupHeader title="독후감" />
              </View>

              {/* Body */}
              <View style={styles.reviewBody}>
                {/* Top Row: Page input + Checkbox */}
                <View style={styles.topRow}>
                  {/* Left: Page Section */}
                  <View style={styles.pageSection}>
                    <TextField
                      value={reviewPageInput}
                      onChangeText={(text) => {
                        const numericValue = text.replace(/[^0-9]/g, '');
                        setReviewPageInput(numericValue);
                      }}
                      placeholder=" "
                      keyboardType="number-pad"
                      returnKeyType="none"
                      autoFocus={true}
                      inputAccessoryViewID="hideDoneButton"
                      style={styles.pageInput}
                      containerStyle={styles.pageInputContainer}
                    />
                    <Text style={styles.pageLabel}>Page</Text>
                  </View>

                  {/* Right: Checkbox + Help */}
                  <View style={styles.checkReviewSection}>
                    <Checkbox
                      checked={isSpoiler}
                      onPress={() => setIsSpoiler(!isSpoiler)}
                      label="독후감 공개"
                    />
                    <View style={styles.helpButtonContainer}>
                      <IconButton
                        width={20}
                        height={36}
                        onPress={() => {
                          setHelpTooltipVisible(true);
                          setTimeout(() => setHelpTooltipVisible(false), 2000);
                        }}
                      >
                        <HelpIcon width={20} height={36} />
                      </IconButton>
                      {helpTooltipVisible && (
                        <View style={styles.helpToast}>
                          <Text style={styles.helpToastText}>{'책 상세에서\n모두에게 공개 됩니다.'}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                {/* Review Text Field */}
                <TextField
                  value={reviewContent}
                  onChangeText={setReviewContent}
                  placeholder=" 독후감을 남겨주세요"
                  placeholderTextColor={Colors.gray400}
                  multiline={true}
                  style={styles.reviewTextArea}
                  containerStyle={styles.reviewTextAreaContainer}
                />
              </View>

              {/* Selected Images Preview */}
              {selectedImages.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.imagePreviewScroll}
                  contentContainerStyle={styles.imagePreviewContent}
                >
                  {selectedImages.map((imageUri, index) => (
                    <View key={index} style={styles.imagePreviewItem}>
                      <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                      <TouchableOpacity
                        style={styles.imageRemoveButton}
                        onPress={() => handleRemoveImage(index)}
                      >
                        <DeleteIcon width={20} height={20} color={Colors.gray400} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}

              {/* Bottom Button Section - Fixed above keyboard */}
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={0}
              >
                <View style={styles.reviewBottomSection}>
                  <IconButton
                    size={48}
                    onPress={handlePickImage}
                  >
                    <ImageIcon width={24} height={24} />
                  </IconButton>
                  <Button
                    variant="primary"
                    size="xlarge"
                    onPress={handleSubmitReview}
                    style={styles.button}
                    disabled={reviewContent.length < 5}
                  >
                    {isEditMode ? '수정' : '게시'}
                  </Button>
                </View>
              </KeyboardAvoidingView>
            </Pressable>
          </Animated.View>
        </Pressable>

        <Toast
          visible={toastVisible && isReviewModalVisible}
          message={toastMessage}
          onHide={() => setToastVisible(false)}
          style={{ bottom: keyboardHeight + 20 }}
        />
      </Modal>

      {/* Bottom Buttons */}
      <View style={[styles.bottomButtons]}>
        <LinearGradient
          colors={['rgba(255,255,255,0.00)', 'rgba(255,255,255,0.84)', '#FFFFFF']}
          locations={[0, 0.4451, 1]}
          style={styles.bottomGradient}
        />
        <View style={styles.buttonGroup}>
          {!isReading ? (
            <Button
              variant="primary"
              size="xxlarge"
              style={styles.readButton}
              onPress={handleOpenStartReading}
            >
              읽기
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="xxlarge"
                style={styles.writeReviewButton}
                onPress={handleOpenReview}
              >
                독후감 쓰기
              </Button>
              {isCompleted ? (
                <TouchableOpacity
                  style={styles.completedButton}
                  activeOpacity={0.7}
                  onPress={handleOpenPageEdit}
                >
                  <Text style={styles.completedButtonText}>완독 했어요! 🎉 </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.readingStatusButton}
                  activeOpacity={0.7}
                  onPress={handleOpenPageEdit}
                >
                  <View style={styles.readingStatusContent}>
                    <Text style={styles.readingProgressText}>{readingProgress}%</Text>
                    <Text style={styles.readingStatusText}>읽는중</Text>
                  </View>
                  <View style={styles.readingProgressBar}>
                    <View style={[styles.readingProgressFill, { width: `${readingProgress}%` }]} />
                  </View>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>

      {/* Sort Modal */}
      {isSortModalVisible && (
        <Modal
          visible={isSortModalVisible}
          transparent
          animationType="none"
          onRequestClose={handleCloseSortModal}
        >
          <Pressable style={styles.reviewModalOverlay} onPress={handleCloseSortModal}>
            <Animated.View
              style={[
                styles.sortModalContainer,
                {
                  transform: [{ translateY: sortModalTranslateY }],
                },
              ]}
            >
              <Pressable onPress={(e) => e.stopPropagation()}>
                <View {...sortPanResponder.panHandlers}>
                  <PopupHeader title="정렬" />
                </View>
                <View style={styles.sortModalBody}>
                  <View style={styles.sortOptionBox}>
                    <TouchableOpacity style={styles.optionItem} onPress={() => handleSelectSort('latest')}>
                      <Text style={[
                        styles.optionText,
                        sortOrder === 'latest' && styles.optionTextSelected
                      ]}>
                        최신순
                      </Text>
                      {sortOrder === 'latest' && <CheckIcon width={16} height={16} color={Colors.primary500} />}
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.optionItem} onPress={() => handleSelectSort('likes')}>
                      <Text style={[
                        styles.optionText,
                        sortOrder === 'likes' && styles.optionTextSelected
                      ]}>
                        좋아요순
                      </Text>
                      {sortOrder === 'likes' && <CheckIcon width={16} height={16} color={Colors.primary500} />}
                    </TouchableOpacity>
                  </View>
                </View>
              </Pressable>
            </Animated.View>
          </Pressable>
        </Modal>
      )}

      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID="hideDoneButton">
          <View style={{ height: 0 }} />
        </InputAccessoryView>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  contentSection: {
    padding: Spacing.md,
    minHeight: 400,
  },
  sectionPlaceholder: {
    ...Typography.body1Regular,
    color: Colors.gray600,
    textAlign: 'center',
    paddingVertical: Spacing.huge,
  },
  // Section Detail Styles
  sectionDetail: {
    paddingBottom: 120,
  },
  sectionDetailInfo: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl,
  },
  sectionDetailReviews: {
  },
  // Tab Section Styles
  tabSectionFixed: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9,
  },
  tabSectionWeb: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(15px)',
      WebkitBackdropFilter: 'blur(15px)',
    }),
  },
  tabSectionBlur: {
    backgroundColor: Colors.white,
  },
  tabSection: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray50,
  },
  // Feed Section
  feedSection: {
    paddingTop: 0,
  },
  filterSortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  switchGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  switchLabel: {
    ...Typography.body3Regular,
    color: Colors.gray700,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  sortText: {
    ...Typography.body1Regular,
    color: Colors.gray900,
  },
  bookSummarySection: {
    gap: 20,
  },
  bookSummaryContainer: {
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.xxl,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.xl,
    position: 'relative',
  },
  bookSummaryText: {
    ...Typography.body1Regular,
    color: Colors.gray900,
  },
  bookSummaryIcon: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  bookInfoDetails: {
    gap: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 24,
  },
  infoLabel: {
    ...Typography.body1Regular,
    color: Colors.gray600,
    width: 70,
    flexShrink: 0,
  },
  infoValue: {
    ...Typography.body1Medium,
    color: Colors.gray900,
    flexShrink: 1,
  },
  infoValueRole: {
    ...Typography.body1Regular,
    color: Colors.gray700,
    flexShrink: 1,
  },
  infoValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap',
  },
  infoValueColumn: {
    flexDirection: 'column',
    flex: 1,
    gap: Spacing.xs,
  },
  infoValueSecondary: {
    ...Typography.body1Regular,
    color: Colors.gray900,
  },
  // Book Review Section Styles
  bookReviewSection: {
    marginTop: Spacing.huge,
    gap: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewCount: {
    ...Typography.body1ExtraBold,
    color: Colors.primary900,
  },
  reviewContainer: {
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.xxl,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.xl,
    gap: Spacing.xl,
  },
  alreadyReadBox: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  alreadyReadContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alreadyReadLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  alreadyReadText: {
    ...Typography.body3Regular,
    color: Colors.gray700,
  },
  alreadyReadButton: {
    borderRadius: BorderRadius.md,
  },
  // Bottom Buttons Styles
  bottomButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xxxl,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    zIndex: 0,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: Spacing.sm,
    zIndex: 1,
    width: '100%',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  readButton: {
    width: '100%',
    maxWidth: 296,
  },
  writeReviewButton: {
    width: 140,
  },
  readingStatusButton: {
    flex: 1,
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 10,
    justifyContent: 'center',
    gap: Spacing.xs,
    maxWidth: 296,
    width: '100%',
  },
  readingStatusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  readingProgressText: {
    ...Typography.headline3Bold,
    color: Colors.gray900,
  },
  readingStatusText: {
    ...Typography.headline3Medium,
    color: Colors.gray900,
  },
  readingProgressBar: {
    height: 4,
    backgroundColor: Colors.white,
    borderRadius: 10,
    overflow: 'hidden',
  },
  readingProgressFill: {
    height: '100%',
    backgroundColor: Colors.primary500,
    borderRadius: 10,
  },
  completedButton: {
    flex: 1,
    height: 52,
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedButtonText: {
    ...Typography.headline3Medium,
    color: Colors.gray900,
    marginLeft: Spacing.sm,
  },
  // Page Edit Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    overflow: 'hidden',
  },
  modalBody: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    backgroundColor: Colors.white,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    // paddingTop: Spacing.lg,
    paddingBottom: 310 + Spacing.md,
    backgroundColor: Colors.white,
  },
  button: {
    flex: 1,
  },
  // Review Modal Styles
  reviewModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingTop: 80,
  },
  reviewModalContent: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  reviewBody: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xl,
    backgroundColor: Colors.white,
    gap: Spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  pageInput: {
    width: 68,
  },
  pageInputContainer: {
    height: 36,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 0,
    borderRadius: BorderRadius.md,
  },
  pageLabel: {
    ...Typography.body2ExtraBold,
    color: Colors.gray900,
  },
  checkReviewSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpButtonContainer: {
    position: 'relative',
  },
  helpToast: {
    position: 'absolute',
    top: 40,
    right: 0,
    zIndex: 1000,
    backgroundColor: 'rgba(93, 81, 108, 0.8)',
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    width: 169,
  },
  helpToastText: {
    ...Typography.body1Medium,
    color: Colors.white,
    textAlign: 'center',
  },
  reviewTextArea: {
    flex: 1,
  },
  reviewTextAreaContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
    borderRadius: 0,
    paddingHorizontal: Spacing.sm,
    paddingTop: 0,
    paddingBottom: 0,
  },
  reviewBottomSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: 84 + Spacing.md,
    gap: Spacing.sm,
  },
  button: {
    flex: 1,
  },
  // Image Preview Styles
  imagePreviewScroll: {
    maxHeight: 80,
    backgroundColor: Colors.white,
  },
  imagePreviewContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  imagePreviewItem: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imageRemoveButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    // backgroundColor: 'rgba(255, 255, 255, 0.8)',
    width: 28,
    height: 28,

    alignItems: 'center',
    justifyContent: 'center',
  },
  // Empty Reviews Styles
  emptyReviews: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 150,
  },
  emptyReviewsText: {
    ...Typography.subtitle1Medium,
    color: Colors.gray700,
  },
  emptyReviewCard: {
    // padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  emptyReviewCardText: {
    ...Typography.body3Regular,
    color: Colors.gray700,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },

  // Sort Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sortModalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  sortModalBody: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.huge,
  },
  sortOptionBox: {
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  optionText: {
    ...Typography.body1Medium,
    color: Colors.gray900,
  },
  optionTextSelected: {
    color: Colors.primary500,
  },
});
