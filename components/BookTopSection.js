import React from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../styles';

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
  isLoading = false,
  style,
}) {
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
        <View style={styles.bookCover}>
          {isLoading ? (
            <ActivityIndicator size="large" color={Colors.primary500} />
          ) : coverImage ? (
            <Image
              source={typeof coverImage === 'string' ? { uri: coverImage } : coverImage}
              style={styles.coverImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.coverPlaceholder} />
          )}
        </View>

        {/* Book Data */}
        <View style={styles.bookData}>
          <Text style={styles.bookTitle}>{bookTitle || ''}</Text>
          {bookSubtitle && <Text style={styles.bookSubtitle}>{bookSubtitle}</Text>}
          <Text style={styles.bookAuthor}>{author || ''}</Text>
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  bookCover: {
    height: 246,
    width: 600,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverImage: {
    height: 246,
    width: 600,
    borderRadius: BorderRadius.sm,
  },
  coverPlaceholder: {
    width: 'auto',
    height: 246,
    backgroundColor: Colors.gray50,
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
