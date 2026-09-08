import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../styles';
import Skeleton from './Skeleton';
import ProgressBar from './ProgressBar';
import MypagePin from './MypagePin';
import Svg, { Path } from 'react-native-svg';

/**
 * BookTopSection Component
 * 책 상세 정보 상단 섹션 (배경 이미지 + 책 커버 + 책 정보)
 */
export default function BookTopSection({
  bookTitle,
  bookSubtitle,
  author,
  coverImage,
  paddingTop = 108,
  coverWidth = 600,
  coverHeight = 246,
  isLoading = false,
  isReading = false,
  isCompleted = false,
  readingProgress = 0,
  currentPage = 0,
  totalPages = 0,
  onOpenPageEdit,
  style,
}) {
  // coverHeight가 기본값(246)이 아닐 때만 자동 비율 모드
  const autoSize = coverHeight !== 246;

  const [displaySize, setDisplaySize] = React.useState({
    width: autoSize ? Math.round(coverHeight * 0.7) : coverWidth,
    height: coverHeight,
  });

  React.useEffect(() => {
    setDisplaySize({
      width: autoSize ? Math.round(coverHeight * 0.7) : coverWidth,
      height: coverHeight,
    });
  }, [coverImage, coverWidth, coverHeight]);

  const handleCoverLoad = ({ nativeEvent }) => {
    if (!autoSize) return;
    const { width: w, height: h } = nativeEvent.source;
    if (!w || !h) return;
    setDisplaySize({
      width: Math.round(w * (coverHeight / h)),
      height: coverHeight,
    });
  };

  return (
    <View style={[styles.topSection, { paddingTop }, style]}>
      {/* Background Image with Blur */}
      <View style={styles.backgroundContainer}>
        {coverImage ? (
          <Image
            source={typeof coverImage === 'string' ? { uri: coverImage } : coverImage}
            style={styles.backgroundImage}
            resizeMode="cover"
            blurRadius={20}
          />
        ) : (
          <View style={styles.backgroundPlaceholder} />
        )}
        <View style={styles.overlay} />
      </View>

      {/* Book Info */}
      <View style={styles.bookInfoContainer}>
        {/* Book Cover */}
        <View style={{ width: displaySize.width, height: displaySize.height, alignSelf: 'center', borderRadius: BorderRadius.sm, overflow: 'hidden' }}>
          {isLoading ? (
            <Skeleton width={164} height={displaySize.height} borderRadius={BorderRadius.sm} />
          ) : coverImage ? (
            <Image
              source={typeof coverImage === 'string' ? { uri: coverImage } : coverImage}
              style={{ width: displaySize.width, height: displaySize.height }}
              resizeMode="contain"
              onLoad={handleCoverLoad}
            />
          ) : (
            <View style={{ width: displaySize.width, height: displaySize.height, backgroundColor: Colors.gray50 }} />
          )}
        </View>

        {/* Book Data */}
        <View style={styles.bookData}>
          {isLoading ? (
            <>
              <Skeleton width={160} height={22} borderRadius={6} />
              <Skeleton width={100} height={16} borderRadius={6} style={{ marginTop: Spacing.sm }} />
            </>
          ) : (
            <>
              <Text style={styles.bookTitle}>{bookTitle || ''}</Text>
              {bookSubtitle && <Text style={styles.bookSubtitle}>{bookSubtitle}</Text>}
              <Text style={styles.bookAuthor}>{author || ''}</Text>
            </>
          )}
        </View>
      </View>

      {/* Progress Bar + Bubble */}
      {isReading && !isCompleted && (
        <View style={styles.progressContainer}>
          <ProgressBar
            progress={readingProgress}
            trackColor={Colors.white}
          />
          <View
            style={[
              styles.myProgressSection,
              readingProgress >= 60
                ? { marginRight: `${100 - readingProgress}%`, alignItems: 'flex-end' }
                : { marginLeft: `${readingProgress}%`, alignItems: 'flex-start' },
            ]}
          >
            <View style={[styles.myProgressPin, readingProgress >= 60 && { transform: [{ scaleX: -1 }] }]}>
              <MypagePin color={Colors.primary900} />
            </View>
            <TouchableOpacity
              style={[
                styles.myProgressBadge,
                readingProgress >= 60 ? styles.myProgressBadgeRight : styles.myProgressBadgeLeft,
              ]}
              onPress={onOpenPageEdit}
              activeOpacity={0.7}
            >
              <Text style={styles.myProgressPage}>{currentPage}P</Text>
              <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
                <Path d="M15.4211 5.85287C15.1941 5.07332 14.7741 4.36364 14.2 3.78952C13.6259 3.2154 12.9162 2.7954 12.1367 2.56839C11.9242 2.51354 11.7013 2.51354 11.4888 2.56839C11.2752 2.63043 11.0811 2.74644 10.9252 2.90526L9.48058 4.35639L3.30033 10.5302C3.10607 10.733 2.97935 10.991 2.93755 11.2687L2.54238 13.9636C2.51214 14.1653 2.52764 14.3712 2.58772 14.5661C2.6538 14.7605 2.76264 14.9373 2.90516 15.0844C3.05027 15.2282 3.22518 15.3383 3.41694 15.4083C3.55104 15.4523 3.69097 15.4737 3.83155 15.4731H4.01942L6.71437 15.0779C6.99572 15.0418 7.25744 14.9143 7.45937 14.7151L13.6461 8.52838L15.0843 7.09669C15.2463 6.9381 15.3639 6.73976 15.4253 6.5215C15.4867 6.30323 15.4897 6.07267 15.4341 5.85287H15.4211ZM14.4753 6.261C14.4582 6.31569 14.4269 6.36487 14.3846 6.40352L13.2898 7.49834L10.4912 4.70622L11.599 3.59844C11.6418 3.55964 11.6927 3.53087 11.748 3.51422H11.897C12.5103 3.69665 13.0684 4.02913 13.5209 4.48159C13.9733 4.93405 14.3058 5.4922 14.4883 6.10552C14.4945 6.15769 14.4901 6.21058 14.4753 6.261Z" fill="white" />
              </Svg>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  topSection: {
    position: 'relative',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    paddingTop: 108,
    paddingBottom: Spacing.xxxl,
    overflow: 'hidden',
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
  bookInfoContainer: {
    alignItems: 'center',
    gap: Spacing.lg,
  },
  bookData: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  bookTitle: {
    ...Typography.headline2Bold,
    color: Colors.gray900,
    textAlign: 'center',
  },
  bookSubtitle: {
    ...Typography.subtitle1Regular,
    color: Colors.gray900,
    textAlign: 'center',
    marginTop: 2,
  },
  bookAuthor: {
    ...Typography.body1Regular,
    color: Colors.gray700,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  progressContainer: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.huge,
  },
  myProgressSection: {
    marginTop: Spacing.xs,
  },
  myProgressPin: {
    alignItems: 'center',
  },
  myProgressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary900,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    gap: Spacing.xs,
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
});
