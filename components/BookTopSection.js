import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../styles';
import Skeleton from './Skeleton';

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
});
