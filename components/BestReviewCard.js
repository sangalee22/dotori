import React from 'react';
import { View, Text, Image, StyleSheet, useWindowDimensions } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../styles';
import UserProfile from './UserProfile';
import CommentIcon from './CommentIcon';

/**
 * BestReviewCard Component
 * @param {string} bookTitle - Book title
 * @param {string} bookSubtitle - Book subtitle (optional)
 * @param {string} author - Book author
 * @param {string} coverImage - Book cover image URL
 * @param {number} readerCount - Number of people reading
 * @param {string} reviewerName - Reviewer's name
 * @param {string} reviewerImage - Reviewer's profile image
 * @param {string} reviewDate - Review date
 * @param {string} reviewText - Review content
 * @param {object} style - Additional style overrides
 */
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
  style,
}) {
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = windowWidth - Spacing.md * 2; // Subtract section padding

  return (
    <View style={[styles.container, { width: cardWidth }, style]}>
      {/* Reader Count Badge */}
      <View style={styles.readerBadge}>
        <Text style={styles.readerBadgeText}>총 {readerCount}명 읽는 중</Text>
      </View>

      {/* Book Info Section */}
      <View style={styles.bookInfo}>
        <View style={styles.bookCover}>
          {coverImage ? (
            <Image source={{ uri: coverImage }} style={styles.coverImage} />
          ) : (
            <View style={styles.coverPlaceholder} />
          )}
        </View>
        <View style={styles.bookData}>
          <View style={styles.bookTextInfo}>
            <Text style={styles.bookTitle} numberOfLines={1} ellipsizeMode="tail">
              {bookTitle}
            </Text>
            {bookSubtitle && (
              <Text style={styles.bookSubtitle} numberOfLines={1} ellipsizeMode="tail">
                {bookSubtitle}
              </Text>
            )}
          </View>
          <Text style={styles.author} numberOfLines={1} ellipsizeMode="tail">
            {author}
          </Text>
        </View>
      </View>

      {/* Review Card */}
      <View style={styles.reviewCard}>
        <View style={styles.reviewContent}>
          {/* Comment Icon */}
          <View style={styles.quoteIcon}>
            <CommentIcon width={40} height={40} />
          </View>

          {/* User Info */}
          <View style={styles.userInfo}>
            <View style={styles.userGroup}>
              <UserProfile imageUri={reviewerImage} size={32} />
              <Text style={styles.userName}>{reviewerName}</Text>
            </View>
            <Text style={styles.reviewDate}>{reviewDate}</Text>
          </View>

          {/* Review Text */}
          <View style={styles.reviewTextContainer}>
            <Text style={styles.reviewText} numberOfLines={3} ellipsizeMode="tail">
              {reviewText}
            </Text>
          </View>
        </View>
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
    zIndex: 10,
  },
  readerBadgeText: {
    ...Typography.caption1Regular,
    color: Colors.gray600,
  },
  bookInfo: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.md,
    zIndex: 2,
  },
  bookCover: {
    width: 78,
    height: 112,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
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
  bookTextInfo: {
    gap: 0,
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
    height: 220,
    marginTop: -80,
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.xxl,
    paddingHorizontal: Spacing.xxl,
    paddingTop: 84,
    paddingBottom: Spacing.xl,
    zIndex: 1,
  },
  reviewContent: {
    position: 'relative',
    paddingTop: Spacing.lg,
    paddingLeft: Spacing.xxl,
    gap: 2,
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
  reviewTextContainer: {
  },
  reviewText: {
    ...Typography.body2Medium,
    color: Colors.gray900,
    paddingLeft: Spacing.huge,
  },
});
