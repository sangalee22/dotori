import React from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, Modal, Pressable, Keyboard, Platform, Animated, PanResponder, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Colors, Typography, Spacing, BorderRadius, FontWeights } from '../styles';
import DefaultHeader from '../components/DefaultHeader';
import SubTab from '../components/SubTab';
import Switch from '../components/Switch';
import FeedItem from '../components/FeedItem';
import IconButton from '../components/IconButton';
import LockIcon from '../components/LockIcon';
import MoreIcon from '../components/MoreIcon';
import PostIcon from '../components/PostIcon';
import EditIcon from '../components/EditIcon';
import MypagePin from '../components/MypagePin';
import UserProfile from '../components/UserProfile';
import PlusFillIcon from '../components/PlusFillIcon';
import SectionTitle from '../components/SectionTitle';
import PopupHeader from '../components/PopupHeader';
import TextField from '../components/TextField';
import Button from '../components/Button';
import Toast from '../components/Toast';
import Checkbox from '../components/Checkbox';
import HelpIcon from '../components/HelpIcon';
import ImageIcon from '../components/ImageIcon';
import BookDetail from './BookDetail';
import { searchBooks, fetchBookDetail } from '../services/aladinApi';
import { InputAccessoryView } from 'react-native';


const RoomFeed = ({
  bookTitle = '도토리룸 명',
  bookCoverImage,
  bookSubtitle,
  author,
  progress = 41,
  endDate = '2026.01.22',
  daysLeft = 35,
  myPage = 52,
  totalPages = 100,
  isPrivate = true,
  onBack,
  onMenu,
  onPost,
  style,
}) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = React.useState('feed');
  const [showUpToMyProgress, setShowUpToMyProgress] = React.useState(false);
  const [isPageEditModalVisible, setIsPageEditModalVisible] = React.useState(false);
  const [currentMyPage, setCurrentMyPage] = React.useState(myPage);
  const [pageInput, setPageInput] = React.useState(String(myPage));
  const [isCompleted, setIsCompleted] = React.useState(false);
  const [toastVisible, setToastVisible] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');
  const [currentProgress, setCurrentProgress] = React.useState(progress);
  const [showBookDetail, setShowBookDetail] = React.useState(false);
  const [bookDetailData, setBookDetailData] = React.useState(null);
  const [scrollY, setScrollY] = React.useState(0);
  const [isReviewModalVisible, setIsReviewModalVisible] = React.useState(false);
  const [reviewPageInput, setReviewPageInput] = React.useState('');
  const [reviewContent, setReviewContent] = React.useState('');
  const [isSpoiler, setIsSpoiler] = React.useState(false);
  const [infoTab, setInfoTab] = React.useState('info'); // 'info' or 'reviews'

  // Modal drag animation
  const modalTranslateY = React.useRef(new Animated.Value(0)).current;
  const reviewModalTranslateY = React.useRef(new Animated.Value(0)).current;

  // Mock: 참여자 수 (실제로는 API에서 받아야 함)
  const participantCount = 5; // TODO: API에서 실제 참여자 수 가져오기

  // Use API data if available, otherwise use props
  const displayCoverImage = bookDetailData?.coverImage
    ? { uri: bookDetailData.coverImage }
    : bookCoverImage || require('../assets/book-cover-mower.png');

  // Split title and subtitle from API data
  const fullTitle = bookDetailData?.title || bookTitle;
  const titleParts = fullTitle.split(' - ');
  const displayTitle = titleParts[0]?.trim() || bookTitle;
  const displaySubtitle = titleParts.length > 1
    ? titleParts.slice(1).join(' - ').trim()
    : bookSubtitle;

  const displayAuthor = bookDetailData?.author || author;
  const displayTotalPages = bookDetailData?.totalPages || totalPages;

  // Calculate my progress percentage based on current page
  const myProgress = displayTotalPages > 0 ? Math.round((currentMyPage / displayTotalPages) * 100) : 0;

  // Calculate sticky tab position
  const BOOK_DETAIL_HEIGHT = 352;
  const TAB_HEIGHT = 48;
  const HEADER_HEIGHT = 52 + insets.top;
  const isTabSticky = scrollY > (BOOK_DETAIL_HEIGHT - HEADER_HEIGHT);
  const headerOpacity = Math.min(scrollY / 100, 1);
  React.useEffect(() => {
    const fetchBookData = async () => {
      try {
        console.log('🔍 책 검색 중: 혼모노 성해나');
        const results = await searchBooks('혼모노 성해나', 'Keyword', 5);

        if (results && results.length > 0) {
          // Find the most relevant result
          const book = results.find(b =>
            b.title.includes('혼모노') && b.author.includes('성해나')
          ) || results[0];

          console.log('✅ 책 검색 완료:', book.title, book.author);

          // Fetch detailed info to get page count
          if (book.isbn) {
            console.log('📖 책 상세 정보 조회 중...');
            const detailData = await fetchBookDetail(book.isbn);

            if (detailData) {
              // Merge search result with detail data
              const completeBookData = {
                ...book,
                totalPages: detailData.subInfo?.itemPage || null,
                publisher: detailData.publisher || book.publisher,
                description: detailData.description || book.description,
              };

              console.log('✅ 상세 정보 로드 완료. 총 페이지:', completeBookData.totalPages);
              setBookDetailData(completeBookData);
            } else {
              setBookDetailData(book);
            }
          } else {
            setBookDetailData(book);
          }
        }
      } catch (error) {
        console.error('❌ 책 검색 실패:', error);
      }
    };

    fetchBookData();
  }, []);

  const handleOpenPageEdit = () => {
    setPageInput(String(currentMyPage));
    setIsPageEditModalVisible(true);
    modalTranslateY.setValue(0);
  };

  const handleClosePageEdit = () => {
    Animated.timing(modalTranslateY, {
      toValue: 500,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsPageEditModalVisible(false);
      modalTranslateY.setValue(0);
    });
    Keyboard.dismiss();
  };

  // PanResponder for modal drag
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to vertical drags
        return Math.abs(gestureState.dy) > 5 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (evt, gestureState) => {
        // Only allow downward drag
        if (gestureState.dy > 0) {
          modalTranslateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        // If dragged more than 100px, close the modal
        if (gestureState.dy > 100) {
          handleClosePageEdit();
        } else {
          // Otherwise, spring back to original position
          Animated.spring(modalTranslateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 10,
          }).start();
        }
      },
    })
  ).current;

  const updateAverageProgress = (newMyPage) => {
    if (displayTotalPages === 0 || participantCount === 0) return;

    // 현재 평균 페이지 계산
    const currentAvgPage = (currentProgress / 100) * displayTotalPages;
    // 전체 합 = 평균 * 참여자 수
    const totalPagesSum = currentAvgPage * participantCount;
    // 내 기존 페이지를 빼고 새 페이지를 더함
    const newTotalPagesSum = totalPagesSum - currentMyPage + newMyPage;
    // 새로운 평균 페이지
    const newAvgPage = newTotalPagesSum / participantCount;
    // 새로운 평균 진도율
    const newAvgProgress = Math.round((newAvgPage / displayTotalPages) * 100);

    setCurrentProgress(newAvgProgress);
  };

  const handlePageUpdate = () => {
    const newPage = parseInt(pageInput, 10);

    if (isNaN(newPage) || newPage < 0) {
      return;
    }

    if (newPage > displayTotalPages) {
      setToastMessage('책의 마지막 페이지를 넘었어요');
      setToastVisible(true);
      return;
    }

    updateAverageProgress(newPage);
    setCurrentMyPage(newPage);
    setIsCompleted(newPage === displayTotalPages);
    // TODO: Call API to update page
    console.log('Update page to:', newPage);
    handleClosePageEdit();
  };

  const handleCompleteBook = () => {
    updateAverageProgress(displayTotalPages);
    setCurrentMyPage(displayTotalPages);
    setPageInput(String(displayTotalPages));
    setIsCompleted(true);
    // TODO: Call API to mark as completed
    console.log('Mark as completed');
    handleClosePageEdit();
  };

  const handleOpenBookDetail = () => {
    setShowBookDetail(true);
  };

  const handleCloseBookDetail = () => {
    setShowBookDetail(false);
  };

  const handleOpenReview = () => {
    setReviewPageInput(String(currentMyPage));
    setReviewContent('');
    setIsSpoiler(false);
    setIsReviewModalVisible(true);
    reviewModalTranslateY.setValue(0);
  };

  const handleCloseReview = () => {
    Animated.timing(reviewModalTranslateY, {
      toValue: 1000,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsReviewModalVisible(false);
      reviewModalTranslateY.setValue(0);
    });
    Keyboard.dismiss();
  };

  const handleSubmitReview = () => {
    const page = parseInt(reviewPageInput, 10);

    if (isNaN(page) || page < 0) {
      setToastMessage('페이지를 입력해주세요');
      setToastVisible(true);
      return;
    }

    if (page > displayTotalPages) {
      setToastMessage('책의 마지막 페이지를 넘었어요');
      setToastVisible(true);
      return;
    }

    if (!reviewContent.trim()) {
      setToastMessage('후기를 작성해주세요');
      setToastVisible(true);
      return;
    }

    // TODO: Call API to submit review
    console.log('Submit review:', { page, content: reviewContent, isSpoiler });
    setToastMessage('후기가 등록되었습니다');
    setToastVisible(true);
    handleCloseReview();
  };

  // Tab component to reuse
  const TabComponent = () => (
    <View style={styles.tabSection}>
      <View style={styles.tabs}>
        <SubTab
          active={activeTab === 'feed'}
          onPress={() => setActiveTab('feed')}
        >
          피드
        </SubTab>
        <SubTab
          active={activeTab === 'participants'}
          onPress={() => setActiveTab('participants')}
        >
          참여
        </SubTab>
      </View>
      {activeTab === 'feed' && (
        <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>내 진도까지</Text>
        <Switch
          value={showUpToMyProgress}
          onValueChange={setShowUpToMyProgress}
    />
  </View>
)}
    </View>
  );

  // Mock feed data with different types
  const feedData = [
    {
      id: 1,
      type: 'img',
      user: {
        name: 'User name',
        profileImage: null,
      },
      timeAgo: '5분 전',
      page: 12,
      content: 'posting',
      images: [require('../assets/book-cover-mower.png')],
      likes: 123,
      comments: 123,
    },
    {
      id: 2,
      type: 'img',
      user: {
        name: 'User name',
        profileImage: null,
      },
      timeAgo: '1시간 전',
      page: 25,
      content: 'posting',
      images: [
        require('../assets/book-cover-mower.png'),
        require('../assets/book-cover-mower.png'),
      ],
      likes: 45,
      comments: 12,
    },
    {
      id: 3,
      type: 'text',
      user: {
        name: 'User name',
        profileImage: null,
      },
      timeAgo: '2시간 전',
      page: 30,
      content: 'posting',
      likes: 67,
      comments: 8,
    },
    {
      id: 4,
      type: 'spo',
      user: {
        name: 'User name',
        profileImage: null,
      },
      timeAgo: '3시간 전',
      page: 45,
      content: '이 부분은 정말 감동적이었어요. 주인공의 선택이 너무 인상적이었습니다.',
      likes: 89,
      comments: 15,
      isSpoiler: true,
    },
  ];

  // Mock participant data
  const participantsData = [
    { id: 1, nickname: 'nickname', profileImage: null, showAddButton: false },
    { id: 2, nickname: 'nickname', profileImage: null, showAddButton: false },
    { id: 3, nickname: 'nickname', profileImage: null, showAddButton: false },
    { id: 4, nickname: 'nickname', profileImage: null, showAddButton: false },
    { id: 5, nickname: 'nickname', profileImage: null, showAddButton: false },
    { id: 6, nickname: 'nickname', profileImage: null, showAddButton: true },
    { id: 7, nickname: 'nickname', profileImage: null, showAddButton: true },
    { id: 8, nickname: 'nickname', profileImage: null, showAddButton: true },
    { id: 9, nickname: 'nickname', profileImage: null, showAddButton: true },
    { id: 10, nickname: 'nickname', profileImage: null, showAddButton: true },
    { id: 11, nickname: 'nickname', profileImage: null, showAddButton: true },
    { id: 12, nickname: 'nickname', profileImage: null, showAddButton: true },
    { id: 13, nickname: 'nickname', profileImage: null, showAddButton: true },
    { id: 14, nickname: 'nickname', profileImage: null, showAddButton: true },
    { id: 15, nickname: 'nickname', profileImage: null, showAddButton: true },
    { id: 16, nickname: 'nickname', profileImage: null, showAddButton: true },
  ];

  return (
    <View style={[styles.container, style]}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
      >
        {/* Book Detail Top Section */}
        <View style={styles.bookDetailTop}>
          {/* Background Image with Blur */}
          <View style={styles.backgroundContainer}>
            <Image
              source={displayCoverImage}
              style={styles.backgroundImage}
              resizeMode="cover"
              blurRadius={20}
            />
            <View style={styles.overlay} />
          </View>

          <View style={styles.bookInfo}>
            <TouchableOpacity
              style={styles.bookInfoMain}
              activeOpacity={0.7}
              onPress={handleOpenBookDetail}
            >
              <Image
                source={displayCoverImage}
                style={styles.bookCover}
                resizeMode="cover"
              />
              <View style={styles.bookData}>
                <View style={styles.titleSection}>
                  <Text style={styles.bookTitle} numberOfLines={1}>{displayTitle}</Text>
                  {displaySubtitle && (
                    <Text style={styles.bookSubtitle} numberOfLines={1}>{displaySubtitle}</Text>
                  )}
                </View>
                <Text style={styles.bookAuthor} numberOfLines={1}>{displayAuthor}</Text>
              </View>
            </TouchableOpacity>

            {/* Progress Section */}
            <View style={styles.progressSection}>
              <View style={styles.progressInfo}>
                <View style={styles.progressLeft}>
                  <Text style={styles.progressLabel}>독서 진도</Text>
                  <Text style={styles.progressPercent}>{currentProgress}%</Text>
                </View>
                <View style={styles.progressRight}>
                  <Text style={styles.dateText}>~ {endDate} </Text>
                  <Text style={styles.daysLeftText}>D-{daysLeft}</Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBar, { width: `${currentProgress}%` }]} />
                {/* My Progress Circle Indicator */}
                <View style={[styles.myProgressIndicator, { left: `${myProgress}%` }]} />
              </View>

              {/* My Progress Badge or Complete Badge */}
              {isCompleted ? (
                <View style={styles.completeBadgeContainer}>
                  <TouchableOpacity onPress={handleOpenPageEdit} activeOpacity={0.7}>
                    <Image
                      source={require('../assets/complete-badge.png')}
                      style={styles.completeBadge}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                <View
                  style={[
                    styles.myProgressSection,
                    myProgress >= 60
                      ? { marginRight: `${100 - myProgress}%`, alignItems: 'flex-end' }
                      : { marginLeft: `${myProgress}%`, alignItems: 'flex-start' }
                  ]}
                >
                  <View style={[styles.myProgressPin, myProgress >= 60 && { transform: [{ scaleX: -1 }] }]}>
                    <MypagePin color={Colors.primary900} />
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.myProgressBadge,
                      myProgress >= 60 ? styles.myProgressBadgeRight : styles.myProgressBadgeLeft
                    ]}
                    onPress={handleOpenPageEdit}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.myProgressLabel}>나는</Text>
                    <Text style={styles.myProgressPage}>{currentMyPage}P</Text>
                    <EditIcon width={18} height={18} color={Colors.white} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Tab Section - In scroll (hidden when sticky) */}
        {!isTabSticky && (
          Platform.OS === 'web' ? (
            <View style={styles.tabSectionWeb}>
              <TabComponent />
            </View>
          ) : (
            <View style={styles.tabSectionBlur}>
              <TabComponent />
            </View>
          )
        )}

        {/* Placeholder for sticky tab to prevent content jump */}
        {isTabSticky && <View style={{ height: TAB_HEIGHT }} />}

        {/* Info/Reviews Tab Section */}
        {activeTab === 'feed' && (
          <View style={styles.infoTabSection}>
            <SubTab
              active={infoTab === 'info'}
              onPress={() => setInfoTab('info')}
            >
              정보
            </SubTab>
            <SubTab
              active={infoTab === 'reviews'}
              onPress={() => setInfoTab('reviews')}
            >
              독후감
            </SubTab>
          </View>
        )}

        {/* Feed Section */}
        {activeTab === 'feed' && (
          <View style={styles.feedSection}>
            {feedData
              .filter(item => !showUpToMyProgress || item.page <= currentMyPage)
              .map((item) => (
                <FeedItem
                  key={item.id}
                  id={item.id}
                  type={item.type}
                  user={item.user}
                  timeAgo={item.timeAgo}
                  page={item.page}
                  myCurrentPage={currentMyPage}
                  content={item.content}
                  images={item.images}
                  likes={item.likes}
                  comments={item.comments}
                  isSpoiler={item.isSpoiler}
                  onRevealSpoiler={() => {
                    // TODO: Handle reveal spoiler
                    console.log('Reveal spoiler for item', item.id);
                  }}
                />
              ))}
          </View>
        )}
        {/* Participants Section */}
        {activeTab === 'participants' && (
          <View style={styles.participantsSection}>
            {/* Section Header */}
            <SectionTitle count={participantsData.length}>인원</SectionTitle>

            {/* Participants Grid */}
            <View style={styles.participantsGrid}>
              {participantsData.map((participant) => (
                <View key={participant.id} style={styles.participantItem}>
                  <View style={styles.profileWrapper}>
                    <UserProfile
                      size={48}
                      imageUri={participant.profileImage}
                    />
                    {participant.showAddButton && (
                      <View style={styles.addButtonWrapper}>
                        <IconButton
                          size={28}
                          onPress={() => {
                            setToastMessage('팔로우 했습니다.');
                            setToastVisible(true);
                            // TODO: Call API to follow user
                            console.log('Follow user:', participant.id);
                          }}
                        >
                          <PlusFillIcon width={20} height={20} color={Colors.gray900} />
                        </IconButton>
                      </View>
                    )}
                  </View>
                  <Text style={styles.participantNickname} numberOfLines={1}>
                    {participant.nickname}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
      {Platform.OS === 'ios' && (
          <InputAccessoryView nativeID="hideDoneButton">
            <View style={{ height: 0 }} />
          </InputAccessoryView>
        )}
      {/* Sticky Tab Section - Fixed position */}
      {isTabSticky && (
        <View style={[styles.tabSectionFixed, { top: HEADER_HEIGHT }]}>
          {Platform.OS === 'web' ? (
            <View style={styles.tabSectionWeb}>
              <TabComponent />
            </View>
          ) : (
            <View style={styles.tabSectionBlur}>
              <TabComponent />
            </View>
          )}
        </View>
      )}

      {/* Header */}
      <DefaultHeader
        onBack={onBack}
        onMenu={onMenu}
        title={displayTitle}
        titleOpacity={headerOpacity}
        gradientOpacity={headerOpacity}
        leftTitleIcon={isPrivate && <LockIcon color={Colors.gray500} />}
        rightButtons={[
          <IconButton key="menu" onPress={onMenu}>
            <MoreIcon />
          </IconButton>,
          <IconButton key="post" onPress={handleOpenReview}>
            <PostIcon />
          </IconButton>,
        ]}
        style={styles.headerContainer}
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
                  transform: [{ translateY: modalTranslateY }],
                },
              ]}
            >
              <Pressable onPress={(e) => e.stopPropagation()}>
                <View {...panResponder.panHandlers}>
                  <PopupHeader title="나의 독서 진도율" />
                </View>

                {/* 컨텐츠 영역 */}
                <View style={styles.modalBody}>
                  <TextField
                    label="몇 페이지까지 읽으셨나요?"
                    value={pageInput}
                    onChangeText={(text) => {
                      // 숫자만 입력 허용
                      const numericValue = text.replace(/[^0-9]/g, '');
                      setPageInput(numericValue);
                    }}
                    placeholder="페이지 입력"
                    keyboardType="numeric"
                    inputAccessoryViewID="hideDoneButton"
                    helpText="책의 출판사, 판쇄에 따라 페이지 수가 다를 수 있습니다"
                    autoFocus={true}
                  />
                </View>

                {/* 버튼 영역 */}
                <View style={styles.modalButtons}>
                  <Button
                    variant="outline"
                    size="large"
                    onPress={handleCompleteBook}
                    style={styles.button}
                  >
                    완독
                  </Button>
                  <Button
                    variant="primary"
                    size="large"
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

      {/* Book Review Modal */}
      <Modal
        visible={isReviewModalVisible}
        transparent={false}
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
              <PopupHeader title="독후감" />

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
                      keyboardType="numeric"
                      inputAccessoryViewID="hideDoneButton"
                      autoFocus={true}
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
                          setToastMessage('책 상세에서\n모두에게 공개 됩니다.');
                          setToastVisible(true);
                        }}
                      >
                        <HelpIcon width={20} height={36} />
                      </IconButton>
                      {toastVisible && isReviewModalVisible && (
                        <View style={styles.helpToast}>
                          <Toast
                            visible={true}
                            message={toastMessage}
                            onHide={() => setToastVisible(false)}
                          />
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                {/* Review Text Field */}
                <TextField
                  value={reviewContent}
                  onChangeText={setReviewContent}
                  placeholder="| 독후감을 남겨주세요"
                  placeholderTextColor={Colors.gray400}
                  multiline={true}
                  style={styles.reviewTextArea}
                  containerStyle={styles.reviewTextAreaContainer}
                />
              </View>

              {/* Bottom Button Section - Fixed above keyboard */}
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={0}
              >
                <View style={styles.reviewBottomSection}>
                  <IconButton
                    size={40}
                    onPress={() => {
                      // TODO: Open image picker
                      console.log('Open image picker');
                    }}
                  >
                    <ImageIcon width={24} height={24} />
                  </IconButton>
                <Button
                    variant="primary"
                    size="large"
                    onPress={handlePageUpdate}
                    style={styles.button}
                    disabled={reviewContent.length < 5}
                  >
                    게시
                  </Button>
                </View>
              </KeyboardAvoidingView>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>

      {/* Toast (only show when modal is not open) */}
      <View style={styles.toastContainer}>
        <Toast
          visible={toastVisible && !isPageEditModalVisible && !isReviewModalVisible}
          message={toastMessage}
          onHide={() => setToastVisible(false)}
        />
      </View>

      {/* Book Detail */}
      {showBookDetail && bookDetailData && (
        <BookDetail
          isbn={bookDetailData.isbn}
          bookTitle={bookDetailData.title}
          author={bookDetailData.author}
          coverImage={bookDetailData.coverImage}
          onBack={handleCloseBookDetail}
          style={styles.bookDetailOverlay}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Book Detail Top Section
  bookDetailTop: {
    width: '100%',
    height: 352,
    position: 'relative',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  backgroundPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.gray100,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  bookInfo: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    paddingTop: 120,
  },
  bookInfoMain: {
    width: 300,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  bookCover: {
    width: 66,
    height: 95,
    borderRadius: BorderRadius.sm,
    borderColor: Colors.gray100,
    borderWidth: 1,
  },
  bookData: {
    flex: 1,
    gap: Spacing.sm,
  },
  titleSection: {
    gap: 2,
  },
  bookTitle: {
    ...Typography.headline2Bold,
    color: Colors.gray900,
  },
  bookSubtitle: {
    ...Typography.subtitle1Regular,
    color: Colors.gray900,
  },
  bookAuthor: {
    ...Typography.body1Regular,
    color: Colors.gray700,
  },

  // Progress Section
  progressSection: {
    gap: Spacing.sm,
    width: 300,
    alignSelf: 'center',
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  progressLabel: {
    ...Typography.body1Regular,
    color: Colors.gray800,
  },
  progressPercent: {
    ...Typography.body1ExtraBold,
    color: Colors.gray900,
  },
  progressRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  dateText: {
    ...Typography.body1Regular,
    color: Colors.gray800,
  },
  daysLeftText: {
    ...Typography.body1ExtraBold,
    color: Colors.gray900,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.white,
    borderRadius: 10,
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary500,
    borderRadius: 10,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  myProgressIndicator: {
    width: 8,
    height: 8,
    backgroundColor: Colors.primary900,
    borderRadius: 8,
    position: 'absolute',
    top: 0,
    marginLeft: -4,
  },
  myProgressSection: {
    // alignItems set dynamically based on progress
  },
  myProgressPin: {
    alignItems: 'center',
  },
  myProgressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary900,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    gap: 4,
  },
  myProgressBadgeLeft: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: BorderRadius.sm,
    borderBottomLeftRadius: BorderRadius.sm,
    borderBottomRightRadius: BorderRadius.sm,
  },
  myProgressBadgeRight: {
    borderTopLeftRadius: BorderRadius.sm,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: BorderRadius.sm,
    borderBottomRightRadius: BorderRadius.sm,
  },
  myProgressLabel: {
    ...Typography.body1Regular,
    color: Colors.white,
  },
  myProgressPage: {
    ...Typography.body1ExtraBold,
    color: Colors.white,
  },
  completeBadgeContainer: {
    alignItems: 'flex-end',
  },
  completeBadge: {
    width: 93,
    height: 33,
  },

  // Tab Section
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
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray50,
  },
  tabs: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.xl,
  },
  switchLabel: {
    ...Typography.body3Regular,
    color: Colors.gray700,
  },
  infoTabSection: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.sm,
  },

  // Feed Section
  feedSection: {
    paddingTop: 0,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.huge,
    gap: Spacing.xxl,
  },

  // Participants Section
  participantsSection: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: 80,
    gap: Spacing.sm,
  },
  participantsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.xs,
    rowGap: Spacing.lg,
  },
  participantItem: {
    width: '25%',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  profileWrapper: {
    position: 'relative',
    width: 48,
    height: 48,
  },
  addButtonWrapper: {
    position: 'absolute',
    top: 24,
    right: -8,
  },
  participantNickname: {
    ...Typography.body2Regular,
    color: Colors.gray800,
    textAlign: 'center',
    width: '100%',
  },

  // Header
  headerContainer: {
    // position, top, left, right are handled by DefaultHeader's SafeAreaView
  },

  // Modal
  keyboardAvoidingView: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    overflow: 'hidden',
  },
  modalBody: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
    backgroundColor: Colors.white,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: 310 + Spacing.md, // iPhone bottom safe area + extra space
    backgroundColor: Colors.white,
  },
  button: {
    flex: 1,
  },

  // Book Detail Overlay
  bookDetailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },

  // Toast Container
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10000,
    pointerEvents: 'box-none',
  },

  // Review Modal
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
    paddingTop: Spacing.xl,
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
    right: 0,
    bottom: -34,
    zIndex: 1000,
  },
  reviewTextArea: {
    flex: 1,
  },
  reviewTextAreaContainer: {
    flex: 1,
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
    paddingBottom: 84 + Spacing.md, // iPhone bottom safe area + extra space
    gap: Spacing.lg,
  },
});

export default RoomFeed;
