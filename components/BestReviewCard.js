import React from 'react';
import { View, Text, Image, StyleSheet, useWindowDimensions, Platform, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../styles';
import UserProfile from './UserProfile';
import CommentIcon from './CommentIcon';

export default function BestReviewCard({
  bookTitle = 'Book Title',
  bookSubtitle,
  author = 'Author',
  coverImage,
  readerCount = 0,
  reviewerName = 'User name',
  reviewerImage,
  reviewDate = '2025.12.12',
  reviewText = 'Review text',
  onBookPress,
  onReviewPress,
  style,
}) {
  const [imageError, setImageError] = React.useState(false);
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = windowWidth - Spacing.md * 2;

  return (
    <View style={[styles.container, { width: cardWidth }, style]}>
      {/* 회색 리뷰 카드 (뒤) */}
      <TouchableOpacity style={styles.reviewCard} activeOpacity={0.85} onPress={onReviewPress}>
        <View style={styles.reviewContent}>
          <View style={styles.quoteIcon}>
            <CommentIcon width={40} height={40} />
          </View>
          <View style={styles.userInfo}>
            <View style={styles.userGroup}>
              <UserProfile imageUri={reviewerImage} size={32} />
              <Text style={styles.userName}>{reviewerName}</Text>
            </View>
            <Text style={styles.reviewDate}>{reviewDate}</Text>
          </View>
          <View style={styles.reviewTextContainer}>
            <Text style={styles.reviewText} numberOfLines={3} ellipsizeMode="tail">
              {reviewText}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* 책 정보 (앞 — JSX 상 나중에 렌더링 = 위에 표시) */}
      <TouchableOpacity style={styles.bookInfo} activeOpacity={0.85} onPress={onBookPress}>
        <View style={styles.bookCoverShadow}>
          <View style={styles.bookCover}>
            {coverImage && !imageError ? (
              Platform.OS === 'web' ? (
                <img src={coverImage} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={() => setImageError(true)} />
              ) : (
                <Image source={{ uri: coverImage }} style={styles.coverImage} resizeMode="cover" onError={() => setImageError(true)} />
              )
            ) : (
              <View style={styles.coverPlaceholder} />
            )}
          </View>
        </View>
        <View style={styles.bookData}>
          <Text style={styles.bookTitle} numberOfLines={1} ellipsizeMode="tail">
            {bookTitle}
          </Text>
          {bookSubtitle && (
            <Text style={styles.bookSubtitle} numberOfLines={1} ellipsizeMode="tail">
              {bookSubtitle}
            </Text>
          )}
          <Text style={styles.author} numberOfLines={1} ellipsizeMode="tail">
            {author}
          </Text>
        </View>
      </TouchableOpacity>

      {/* 배지 */}
      <View style={styles.readerBadge}>
        <Text style={styles.readerBadgeText}>총 {readerCount}명 읽는 중</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 252,
  },
  readerBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderColor: Colors.gray100,
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 6,
    paddingVertical: Spacing.xs,
  },
  readerBadgeText: {
    ...Typography.caption1Regular,
    color: Colors.gray600,
  },
  bookInfo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.md,
  },
  bookCoverShadow: {
    width: 78,
    height: 112,
    borderRadius: BorderRadius.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 5,
  },
  bookCover: {
    width: 78,
    height: 112,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    backgroundColor: Colors.gray200,
  },
  coverImage: {
    width: 78,
    height: 112,
  },
  coverPlaceholder: {
    flex: 1,
    backgroundColor: Colors.gray200,
  },
  bookData: {
    flex: 1,
    gap: Spacing.xs,
    paddingTop: Spacing.huge,
  },
  bookTitle: {
    ...Typography.body1ExtraBold,
    color: Colors.gray900,
  },
  bookSubtitle: {
    ...Typography.body1Regular,
    color: Colors.gray700,
  },
  author: {
    ...Typography.body3Regular,
    color: Colors.gray600,
  },
  reviewCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 220,
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.xxl,
    paddingHorizontal: Spacing.xxl,
    paddingTop: 84,
    paddingBottom: Spacing.xl,
  },
  reviewContent: {
    position: 'relative',
    paddingTop: Spacing.lg,
    paddingLeft: Spacing.xxl,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  userGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  userName: {
    ...Typography.body2Regular,
    color: Colors.gray900,
  },
  reviewDate: {
    ...Typography.caption1Regular,
    color: Colors.gray500,
  },
  quoteIcon: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 40,
    height: 40,
  },
  reviewTextContainer: {},
  reviewText: {
    ...Typography.body2Medium,
    color: Colors.gray900,
    paddingLeft: Spacing.huge,
  },
});
