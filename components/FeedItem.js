import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Modal, Pressable, Dimensions, Animated, PanResponder } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../styles';
import UserProfile from './UserProfile';
import HeartIcon from './HeartIcon';
import CommentIconNew from './CommentIconNew';
import Button from './Button';
import IconButton from './IconButton';
import MoreIcon from './MoreIcon';
import CloseIcon from './CloseIcon';
import DefaultHeader from './DefaultHeader';
import PopupHeader from './PopupHeader';
import ModalPopup from './ModalPopup';
import Toast from './Toast';

/**
 * FeedItem Component
 * Displays different types of feed items: image, text, or spoiler
 * @param {string|number} id - Unique feed item ID
 * @param {string} type - Feed type: 'img', 'text', or 'spo'
 * @param {object} user - User info { name, profileImage }
 * @param {string} timeAgo - Time since posted (e.g., '5분 전')
 * @param {number} page - Page number
 * @param {number} myCurrentPage - User's current reading page
 * @param {string} content - Post content text
 * @param {Array} images - Array of image sources (for type='img')
 * @param {number} likes - Number of likes
 * @param {number} comments - Number of comments
 * @param {boolean} isSpoiler - Whether content is revealed (for type='spo')
 * @param {boolean} isMyReview - Whether this review was written by current user
 * @param {function} onRevealSpoiler - Callback when spoiler is revealed
 * @param {function} onDelete - Callback when review is deleted
 * @param {function} onEdit - Callback when review is edited
 * @param {object} style - Additional style overrides
 */
export default function FeedItem({
  id,
  type = 'text',
  user,
  timeAgo,
  page,
  myCurrentPage = 0,
  content,
  images = [],
  likes,
  comments,
  isSpoiler = true,
  isCompleted = false,
  isMyReview = false,
  showBookInfo = false,
  book,
  onBookPress,
  onRevealSpoiler,
  onDelete,
  onEdit,
  style,
}) {
  const [isLiked, setIsLiked] = React.useState(false);
  const [likeCount, setLikeCount] = React.useState(Array.isArray(likes) ? likes.length : (likes ?? 0));
  const [isRevealed, setIsRevealed] = React.useState(false);
  const [isMoreModalVisible, setIsMoreModalVisible] = React.useState(false);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = React.useState(false);
  const [toastVisible, setToastVisible] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');
  const [isImageViewerVisible, setIsImageViewerVisible] = React.useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);
  const insets = useSafeAreaInsets();
  const moreModalTranslateY = React.useRef(new Animated.Value(300)).current;
  const skeletonAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (showBookInfo && !book) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(skeletonAnim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
          Animated.timing(skeletonAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [showBookInfo, book]);

  // PanResponder for more modal drag
  const morePanResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to vertical drags
        return Math.abs(gestureState.dy) > 5 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (evt, gestureState) => {
        // Only allow downward drag
        if (gestureState.dy > 0) {
          moreModalTranslateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        // If dragged more than 100px, close the modal
        if (gestureState.dy > 100) {
          handleCloseMoreModal();
        } else {
          // Otherwise, spring back to original position
          Animated.spring(moreModalTranslateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 10,
          }).start();
        }
      },
    })
  ).current;

  // Load saved states on mount
  React.useEffect(() => {
    const loadStates = async () => {
      try {
        // Load like state
        const savedLikeState = await AsyncStorage.getItem(`feedLike_${id}`);
        if (savedLikeState !== null) {
          const { isLiked: savedIsLiked, likeCount: savedLikeCount } = JSON.parse(savedLikeState);
          setIsLiked(savedIsLiked);
          setLikeCount(savedLikeCount);
        }

        // Load revealed state
        const savedRevealedState = await AsyncStorage.getItem(`feedRevealed_${id}`);
        if (savedRevealedState !== null) {
          setIsRevealed(JSON.parse(savedRevealedState));
        }
      } catch (error) {
        console.error('Error loading states:', error);
      }
    };

    if (id) {
      loadStates();
    }
  }, [id]);

  const handleLikePress = async () => {
    const newIsLiked = !isLiked;
    const newLikeCount = newIsLiked ? likeCount + 1 : likeCount - 1;

    setIsLiked(newIsLiked);
    setLikeCount(newLikeCount);

    // Save to AsyncStorage
    try {
      await AsyncStorage.setItem(
        `feedLike_${id}`,
        JSON.stringify({ isLiked: newIsLiked, likeCount: newLikeCount })
      );
    } catch (error) {
      console.error('Error saving like state:', error);
    }
  };

  const handleRevealSpoiler = async () => {
    setIsRevealed(true);

    // Save to AsyncStorage
    try {
      await AsyncStorage.setItem(`feedRevealed_${id}`, JSON.stringify(true));
    } catch (error) {
      console.error('Error saving revealed state:', error);
    }

    // Call the optional callback
    if (onRevealSpoiler) {
      onRevealSpoiler();
    }
  };

  const handleOpenMoreModal = () => {
    setIsMoreModalVisible(true);
    Animated.spring(moreModalTranslateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 10,
    }).start();
  };

  const handleCloseMoreModal = () => {
    Animated.timing(moreModalTranslateY, {
      toValue: 300,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsMoreModalVisible(false);
    });
  };

  const handleEditPress = () => {
    handleCloseMoreModal();
    setTimeout(() => {
      if (onEdit) {
        onEdit({
          id,
          type,
          page,
          content,
          images,
          isSpoiler,
          isCompleted,
        });
      }
    }, 250);

  };

  const handleDeletePress = () => {
    // Close more modal first
    handleCloseMoreModal();
    // Show delete confirmation after a short delay
    setTimeout(() => {
      setIsDeleteConfirmVisible(true);
    }, 300);
  };

  const handleConfirmDelete = () => {
    setIsDeleteConfirmVisible(false);

    // Call deletion callback
    if (onDelete) {
      onDelete(id);
    }

    // Show toast
    setToastMessage('독후감이 삭제되었어요');
    setToastVisible(true);
  };

  const handleCancelDelete = () => {
    setIsDeleteConfirmVisible(false);
  };

  const handleImagePress = (index) => {
    setSelectedImageIndex(index);
    setIsImageViewerVisible(true);
  };

  const handleCloseImageViewer = () => {
    setIsImageViewerVisible(false);
  };

  // Determine if this feed should show as spoiler
  const shouldShowAsSpoiler = page && page > 0 && (page > myCurrentPage) && !isRevealed;
  return (
    <>
    <View style={[styles.container, style]}>
      {/* User Info & Page Badge */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <UserProfile
            size={32}
            imageUri={user.profileImage}
          />
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.timeAgo}>{timeAgo}</Text>
        </View>
        {isCompleted ? (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>완독</Text>
          </View>
        ) : page && page > 0 ? (
          <View style={styles.pageBadge}>
            <Text style={styles.pageText}>{page} Page</Text>
          </View>
        ) : null}
      </View>

      {/* Book Info Skeleton */}
      {showBookInfo && !book && (
        <Animated.View style={[styles.bookInfoWrapper, { opacity: skeletonAnim }]}>
          <View style={styles.bookInfo}>
            <View style={[styles.bookCover, styles.skeletonBlock]} />
            <View style={styles.bookMeta}>
              <View style={[styles.skeletonBar, { width: '55%', marginBottom: 6 }]} />
              <View style={[styles.skeletonBar, { width: '35%' }]} />
            </View>
          </View>
        </Animated.View>
      )}

      {/* Book Info */}
      {showBookInfo && book && (
        <View style={styles.bookInfoWrapper}>
          <TouchableOpacity
            style={styles.bookInfo}
            activeOpacity={0.7}
            onPress={() => onBookPress && onBookPress(book)}
          >
            <View style={styles.bookCover}>
              {book.cover ? (
                <Image
                  source={{ uri: book.cover }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                  onError={() => console.log('[Cover] load failed:', book.cover)}
                />
              ) : (
                <View style={[{ width: '100%', height: '100%' }, styles.bookCoverPlaceholder]} />
              )}
            </View>
            <View style={styles.bookMeta}>
              <Text style={styles.bookTitle} numberOfLines={1}>{book.title?.split(' - ')[0].trim()}</Text>
              {book.author ? <Text style={styles.bookAuthor} numberOfLines={1}>{book.author}</Text> : null}
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Content based on type */}
      {shouldShowAsSpoiler ? (
        // Show spoiler overlay for any type if page > myCurrentPage
        <View style={styles.contentSection}>
          <View style={styles.spoilerOverlay}>
            <Text style={styles.spoilerMessage}>아직 이 내용까지 읽지 않았어요!</Text>
            <Button
              variant="outline"
              size="small"
              onPress={handleRevealSpoiler}
              style={styles.spoilerButton}
            >
              내용 확인
            </Button>
          </View>
        </View>
      ) : (
        <>
          {type === 'img' && (
            <>
              {/* Images */}
              {images.length > 0 && (
                images.length === 1 ? (
                  // Single image - full width, max height 120
                  <TouchableOpacity
                    style={styles.singleImageContainer}
                    activeOpacity={0.9}
                    onPress={() => handleImagePress(0)}
                  >
                    <Image
                      source={typeof images[0] === 'string' ? { uri: images[0] } : images[0]}
                      style={styles.feedImageSingle}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ) : (
                  // Multiple images - horizontal scroll
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.imagesScroll}
                    contentContainerStyle={styles.imagesContainer}
                  >
                    {images.map((image, index) => (
                      <TouchableOpacity
                        key={index}
                        activeOpacity={0.9}
                        onPress={() => handleImagePress(index)}
                      >
                        <Image
                          source={typeof image === 'string' ? { uri: image } : image}
                          style={styles.feedImage}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )
              )}
              {/* Text Content */}
              <View style={styles.contentSection}>
                <Text style={styles.contentText}>{content}</Text>
              </View>
            </>
          )}

          {type === 'text' && (
            <View style={styles.contentSection}>
              <Text style={styles.contentText}>{content}</Text>
            </View>
          )}

          {type === 'spo' && (
            <View style={styles.contentSection}>
              <Text style={styles.contentText}>{content}</Text>
            </View>
          )}
        </>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <View style={styles.actionsLeft}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleLikePress}
            activeOpacity={0.7}
          >
            <HeartIcon color={isLiked ? Colors.primary500 : Colors.gray300} />
            <Text style={[
              styles.actionCount,
              isLiked && styles.actionCountActive
            ]}>
              {likeCount}
            </Text>
          </TouchableOpacity>
          {/* 댓글 기능 미구현 - 숨김 처리
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
            <CommentIconNew color={Colors.gray300} />
            <Text style={styles.actionCount}>{comments}</Text>
          </TouchableOpacity>
          */}
        </View>
        {isMyReview && (
          <IconButton size={36} onPress={handleOpenMoreModal}>
            <MoreIcon color={Colors.gray800} />
          </IconButton>
        )}
      </View>
    </View>

    {/* More Options Modal */}
    {isMoreModalVisible && (
      <Modal
        visible={isMoreModalVisible}
        transparent
        animationType="none"
        onRequestClose={handleCloseMoreModal}
      >
        <Pressable style={styles.reviewModalOverlay} onPress={handleCloseMoreModal}>
          <Animated.View
            style={[
              styles.moreModalContainer,
              {
                transform: [{ translateY: moreModalTranslateY }],
              },
            ]}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View {...morePanResponder.panHandlers}>
                <PopupHeader title="독후감" />
              </View>
              <View style={styles.moreModalBody}>
                <View style={styles.moreOptionBox}>
                  <TouchableOpacity style={styles.optionItem} onPress={handleEditPress}>
                    <Text style={styles.optionText}>수정</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.optionItem} onPress={handleDeletePress}>
                    <Text style={styles.optionText}>삭제</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    )}

    {/* Delete Confirmation Modal */}
    <ModalPopup
      visible={isDeleteConfirmVisible}
      title="독후감을 삭제할까요?"
      description="삭제 후 취소할 수 없습니다."
      primaryButtonText="삭제"
      secondaryButtonText="취소"
      onPrimaryPress={handleConfirmDelete}
      onSecondaryPress={handleCancelDelete}
      onClose={handleCancelDelete}
    />

    {/* Toast */}
    {toastVisible && (
      <Modal visible={toastVisible} transparent animationType="none" statusBarTranslucent>
        <View style={{ flex: 1, pointerEvents: 'box-none' }}>
          <Toast
            visible={toastVisible}
            message={toastMessage}
            onHide={() => setToastVisible(false)}
          />
        </View>
      </Modal>
    )}

    {/* Image Viewer Modal */}
    {isImageViewerVisible && (
      <Modal
        visible={isImageViewerVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseImageViewer}
        statusBarTranslucent
      >
        <View style={styles.imageViewerContainer}>
          <DefaultHeader
            rightButton={
              <IconButton size={40} onPress={handleCloseImageViewer}>
                <CloseIcon width={24} height={24} color={Colors.white} />
              </IconButton>
            }
            style={{
              paddingTop: insets.top,
              backgroundColor: 'transparent',
            }}
          />
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentOffset={{ x: selectedImageIndex * Dimensions.get('window').width, y: 0 }}
            style={styles.imageViewerScroll}
          >
            {images.map((image, index) => (
              <View key={index} style={styles.imageViewerPage}>
                <Image
                  source={typeof image === 'string' ? { uri: image } : image}
                  style={styles.imageViewerImage}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xl,
    borderBottomColor: Colors.gray50,
    borderBottomWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  userName: {
    ...Typography.body2Medium,
    color: Colors.gray900,
  },
  timeAgo: {
    ...Typography.caption1Regular,
    color: Colors.gray500,
  },
  pageBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  pageText: {
    ...Typography.body2ExtraBold,
    color: Colors.primary600,
  },
  completedBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  completedText: {
    ...Typography.body2ExtraBold,
    color: Colors.primary600,
  },

  // Book Info
  bookInfoWrapper: {
    paddingLeft: Spacing.huge,
    paddingBottom: Spacing.sm,
  },
  bookInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  bookCover: {
    width: 31.6,
    height: 46,
    borderRadius: 2.2,
    overflow: 'hidden',
  },
  bookCoverPlaceholder: {
    backgroundColor: Colors.gray100,
  },
  skeletonBlock: {
    backgroundColor: Colors.gray100,
  },
  skeletonBar: {
    height: 12,
    backgroundColor: Colors.gray100,
    borderRadius: 6,
  },
  bookMeta: {
    flex: 1,
  },
  bookTitle: {
    ...Typography.body2Medium,
    color: Colors.gray900,
  },
  bookAuthor: {
    ...Typography.caption1Regular,
    color: Colors.gray500,
  },

  // Images
  imagesScroll: {
    marginTop: 4,
    marginLeft: -Spacing.md,
    marginRight: -Spacing.md,
  },
  imagesContainer: {
    paddingLeft: 52,
    paddingRight: Spacing.md,
    gap: Spacing.sm,
  },
  feedImage: {
    width: 214,
    height: 280,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.gray50,
  },
  singleImageContainer: {
    marginVertical: Spacing.xs,
    paddingLeft: Spacing.huge,
  },
  feedImageSingle: {
    width: '100%',
    height: 420,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.gray50,
  },

  // Content
  contentSection: {
    paddingLeft: Spacing.huge,
    paddingVertical: Spacing.xs,
  },
  contentText: {
    ...Typography.body1Regular,
    color: Colors.gray900,
  },

  // Spoiler
  spoilerOverlay: {
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 104,
    justifyContent: 'center',
  },
  spoilerMessage: {
    ...Typography.body1Regular,
    color: Colors.gray800,
    textAlign: 'center',
  },
  spoilerButton: {
    width: 80,
    height: 32,
  },

  // Actions
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: Spacing.huge,
  },
  actionsLeft: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  actionCount: {
    ...Typography.body3Regular,
    color: Colors.gray800,
  },
  actionCountActive: {
    color: Colors.primary600,
  },

  // More Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  reviewModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  moreModalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  moreModalBody: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.huge,
  },
  moreOptionBox: {
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
  },
  optionItem: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  optionText: {
    ...Typography.body1Medium,
    color: Colors.gray900,
  },

  // Image Viewer Styles
  imageViewerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  imageViewerScroll: {
    flex: 1,
  },
  imageViewerPage: {
    width: Dimensions.get('window').width,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerImage: {
    width: '100%',
    height: '100%',
  },
});
