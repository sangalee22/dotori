import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../styles';
import UserProfile from './UserProfile';

/**
 * RoomCard Component
 * @param {string} bookTitle - Book title
 * @param {string} author - Book author
 * @param {string} coverImage - Book cover image URL
 * @param {boolean} isParticipating - Whether user is participating
 * @param {string} status - 'inProgress' | 'recruiting'
 * @param {number} progress - Progress percentage (0-100)
 * @param {Array} participants - Array of participant objects (with id, image, joinedAt)
 * @param {string} currentUserId - Current logged-in user's ID
 * @param {number} recruitCount - Number of people to recruit
 * @param {Function} onPress - Function to call when card is pressed
 * @param {object} style - Additional style overrides
 */
export default function RoomCard({
  bookTitle = 'Book Title',
  author = 'Author',
  coverImage,
  isParticipating = false,
  status = 'inProgress',
  progress = 0,
  participants = [],
  currentUserId,
  recruitCount = 0,
  onPress,
  style,
}) {
  const showProgress = isParticipating && status === 'inProgress';
  const showPeople = status === 'inProgress' && !isParticipating;
  const showRecruiting = status === 'recruiting';

  // Sort participants: current user first, then by most recent
  const sortedParticipants = React.useMemo(() => {
    if (!participants.length) return [];

    const currentUser = participants.find(p => p.id === currentUserId);
    const others = participants
      .filter(p => p.id !== currentUserId)
      .sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt));

    return currentUser ? [currentUser, ...others] : others;
  }, [participants, currentUserId]);

  // Show up to 3 profiles
  const displayedParticipants = sortedParticipants.slice(0, 3);

  // Calculate moreCount (only show if > 3 participants)
  const moreCount = sortedParticipants.length > 3 ? sortedParticipants.length - 3 : 0;

  const CardContainer = onPress ? TouchableOpacity : View;

  return (
    <CardContainer
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {/* Book Cover */}
      <View style={styles.bookCover}>
        {coverImage ? (
          <Image source={{ uri: coverImage }} style={styles.coverImage} />
        ) : (
          <View style={styles.coverPlaceholder} />
        )}
      </View>

      {/* Info Section */}
      <View style={styles.info}>
        {/* Book Data */}
        <View style={styles.dataBook}>
          <Text style={styles.bookTitle}>{bookTitle}</Text>
          <Text style={styles.author}>{author}</Text>
        </View>

        {/* Bottom Section */}
        <View style={styles.wrapBottom}>
          {showProgress && (
            <>
              {/* Progress Section */}
              <View style={styles.wrapProgress}>
                <View style={styles.countRead}>
                  <Text style={styles.progressText}>
                    <Text style={styles.progressPercent}>{progress}%</Text> 읽음
                  </Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBar, { width: `${progress}%` }]} />
                </View>
              </View>

              {/* People Count */}
              <View style={styles.wrapPeopleCount}>
                <View style={styles.wrapPeople}>
                  {displayedParticipants.map((participant, index) => (
                    <UserProfile
                      key={participant.id || index}
                      imageUri={participant.image}
                      size={28}
                      style={{ marginLeft: index > 0 ? -Spacing.sm : 0 }}
                    />
                  ))}
                </View>
                {moreCount > 0 && (
                  <View style={styles.moreCount}>
                    <Text style={styles.moreCountText}>+{moreCount}</Text>
                  </View>
                )}
              </View>
            </>
          )}

          {showPeople && (
            <View style={styles.wrapPeopleCount}>
              <View style={styles.wrapPeople}>
                {displayedParticipants.map((participant, index) => (
                  <UserProfile
                    key={participant.id || index}
                    imageUri={participant.image}
                    size={28}
                    style={{ marginLeft: index > 0 ? -Spacing.sm : 0 }}
                  />
                ))}
              </View>
              {moreCount > 0 && (
                <View style={styles.moreCount}>
                  <Text style={styles.moreCountText}>+{moreCount}</Text>
                </View>
              )}
            </View>
          )}

          {showRecruiting && (
            <View style={styles.recruitBadge}>
              <Text style={styles.recruitText}>{recruitCount}명 모집</Text>
            </View>
          )}
        </View>
      </View>
    </CardContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.bg50,
    borderRadius: BorderRadius.xxl,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.lg,
    flexShrink: 0,
    width: '100%',
  },
  bookCover: {
    width: 65,
    height: 94,
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
  info: {
    flex: 1,
    justifyContent: 'space-between',
  },
  dataBook: {
    paddingTop: Spacing.xs,
  },
  bookTitle: {
    ...Typography.body1ExtraBold,
    color: Colors.gray900,
  },
  author: {
    ...Typography.body3Regular,
    color: Colors.gray600,
  },
  wrapBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wrapProgress: {
  },
  countRead: {
    marginBottom: Spacing.xs,
  },
  progressText: {
    ...Typography.body3Regular,
    color: Colors.gray700,
  },
  progressPercent: {
    fontWeight: '800',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: Colors.gray200,
    borderRadius: 10,
    overflow: 'hidden',
    width: 70,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary500,
    borderRadius: 10,
  },
  wrapPeopleCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flexShrink: 0,
  },
  wrapPeople: {
    flexDirection: 'row',
    flexShrink: 0,
  },
  moreCount: {
    backgroundColor: Colors.white,
    borderColor: Colors.gray100,
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 6,
    paddingVertical: Spacing.xs,
  },
  moreCountText: {
    ...Typography.caption1Regular,
    color: Colors.gray600,
  },
  recruitBadge: {
    backgroundColor: Colors.white,
    borderColor: Colors.gray100,
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 6,
    paddingVertical: Spacing.xs,
  },
  recruitText: {
    ...Typography.caption1Regular,
    color: Colors.gray700,
  },
});
