import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, BorderRadius, Spacing } from '../styles';

/**
 * BestBook Component
 * @param {number} rank - Book ranking (1, 2, 3, etc.)
 * @param {string} title - Book title
 * @param {string} author - Book author
 * @param {string} coverImage - Book cover image URL (optional)
 * @param {string} isbn - Book ISBN for detail page
 * @param {function} onPress - Callback when book is pressed
 * @param {object} style - Additional style overrides
 */
export default function BestBook({
  rank = 1,
  title = 'Book Title',
  author = 'Author',
  coverImage,
  isbn,
  onPress,
  style,
  flexibleWidth = false,
}) {
  const isFirstPlace = rank === 1;
  const showRank = rank <= 3;

  const isSecondPlace = rank === 2;
  const isThirdPlace = rank === 3;

  // 부제목 제거 (예: "책 제목 - 부제목" -> "책 제목")
  const cleanTitle = title.split(' - ')[0].trim();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
      style={[
        styles.container,
        !isFirstPlace && !flexibleWidth && styles.containerFixed,
        (isSecondPlace || isThirdPlace) && styles.containerWithRank,
        !showRank && styles.containerNoRank,
        style
      ]}
    >
      {showRank && (
        <Text style={[
          styles.rank,
          isFirstPlace && styles.rankLarge,
          isSecondPlace && styles.rankSecond,
          isThirdPlace && styles.rankThird,
        ]}>
          {rank}
        </Text>
      )}
      <View style={[
        styles.card,
        isFirstPlace && styles.cardRank1,
        (isSecondPlace || isThirdPlace) && styles.cardRank23,
        flexibleWidth && styles.cardFlexible,
      ]}>
        <View style={
          flexibleWidth
            ? styles.coverFlexible
            : (isFirstPlace ? styles.coverLarge : styles.coverMedium)
        }>
          {coverImage ? (
            <Image source={{ uri: coverImage }} style={styles.coverImage} />
          ) : (
            <View style={styles.coverPlaceholder} />
          )}
        </View>
        <View style={[
          styles.info,
          !flexibleWidth && (isFirstPlace ? styles.infoLarge : styles.infoMedium),
          flexibleWidth && styles.infoFlexible,
        ]}>
          <Text
            style={styles.title}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {cleanTitle}
          </Text>
          <Text
            style={styles.author}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {author}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  containerFixed: {
    width: 106,
  },
  containerWithRank: {
    paddingTop: Spacing.sm,
  },
  containerNoRank: {
    paddingTop: 33,
  },
  rank: {
    fontFamily: 'Min Sans',
    fontWeight: '800',
    color: Colors.gray800,
    alignSelf: 'flex-start',
    zIndex: 10,
  },
  rankLarge: {
    fontSize: 50,
    lineHeight: 48,
    letterSpacing: 0,
    color: Colors.primary900,
    height: 48,
  },
  rankSecond: {
    fontSize: 40,
    lineHeight: 53,
    letterSpacing: 0,
    color: Colors.primary800,
  },
  rankThird: {
    fontSize: 40,
    lineHeight: 53,
    letterSpacing: 0,
    color: Colors.primary500,
  },
  card: {
    alignItems: 'center',
  },
  cardRank1: {
    marginTop: -24,
  },
  cardRank23: {
    marginTop: -28,
  },
  cardFlexible: {
    width: '100%',
  },
  coverLarge: {
    width: 126,
    height: 184,
    borderRadius: BorderRadius.sm,
    borderColor: Colors.gray100,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  coverMedium: {
    width: 106,
    height: 155,
    borderRadius: BorderRadius.sm,
    borderColor: Colors.gray100,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  coverFlexible: {
    width: '100%',
    aspectRatio: 106 / 155, // Maintain aspect ratio (width / height = 0.684)
    borderRadius: BorderRadius.sm,
    borderColor: Colors.gray100,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
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
    gap: 2,
  },
  infoLarge: {
    width: 126, // 1위 표지 크기와 동일
  },
  infoMedium: {
    width: 106, // 나머지 표지 크기와 동일
  },
  infoFlexible: {
    width: '100%',
  },
  title: {
    ...Typography.subtitle1Medium,
    color: Colors.gray900,
    textAlign: 'center',
  },
  author: {
    ...Typography.body2Regular,
    color: Colors.gray600,
    textAlign: 'center',
  },
});
