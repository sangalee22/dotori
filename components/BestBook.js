import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, Typography, BorderRadius, Spacing } from '../styles';

export default function BestBook({
  rank,
  title = '',
  author = '',
  coverImage,
  onPress,
  style,
  cardWidth,
  isActive = false,
  // legacy props (recent books section)
  flexibleWidth = false,
}) {
  const cleanTitle = (title || '').split(' - ')[0].trim();
  const showRank = rank != null && rank <= 10;

  // 캐러셀 모드 (cardWidth 지정 시)
  if (cardWidth) {
    const rankColor =
      rank === 1 ? Colors.primary900 :
      rank === 2 ? Colors.primary800 :
      rank === 3 ? Colors.primary500 :
      Colors.gray700;

    if (isActive) {
      // 가운데: cover 141×206, 전체 141×310, rank 위에서 겹침
      return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={[styles.activeContainer, style]}>
          {showRank && (
            <Text style={[styles.activeRank, { color: rankColor }]}>{rank}</Text>
          )}
          <View style={[styles.activeCover, showRank && { marginTop: -24 }]}>
            {coverImage
              ? <Image source={{ uri: coverImage }} style={styles.coverImage} />
              : <View style={styles.coverPlaceholder} />}
          </View>
          <Text style={styles.activeTitle} numberOfLines={2}>{cleanTitle}</Text>
          <Text style={styles.activeAuthor} numberOfLines={1}>{author}</Text>
        </TouchableOpacity>
      );
    }

    // 양옆: cover 106×155, rank 없음
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={[styles.inactiveContainer, style]}>
        <View style={styles.inactiveCover}>
          {coverImage
            ? <Image source={{ uri: coverImage }} style={styles.coverImage} />
            : <View style={styles.coverPlaceholder} />}
        </View>
        <Text style={styles.inactiveTitle} numberOfLines={2}>{cleanTitle}</Text>
        <Text style={styles.inactiveAuthor} numberOfLines={1}>{author}</Text>
        <BlurView intensity={10} tint="light" style={[StyleSheet.absoluteFill, { height: 310 }]} />
      </TouchableOpacity>
    );
  }

  // 레거시 모드 (recent books 등)
  const isFirstPlace = rank === 1;
  const isSecondPlace = rank === 2;
  const isThirdPlace = rank === 3;

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
        style,
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
          <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">{cleanTitle}</Text>
          <Text style={styles.author} numberOfLines={2} ellipsizeMode="tail">{author}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // ── 캐러셀: 가운데 (active) ───────────────
  activeContainer: {
    width: 141,
    height: 310,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  activeRank: {
    fontFamily: 'Min Sans',
    fontWeight: '800',
    fontSize: 50,
    lineHeight: 48,
    paddingLeft: Spacing.xs,
    alignSelf: 'flex-start',
    zIndex: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.30)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  activeCover: {
    width: 141,
    height: 206,
    borderRadius: BorderRadius.sm,
    borderColor: Colors.gray100,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
    zIndex: 1,
  },
  activeTitle: {
    ...Typography.subtitle1Medium,
    color: Colors.gray900,
    textAlign: 'center',
    width: 141,
  },
  activeAuthor: {
    ...Typography.body2Regular,
    color: Colors.gray600,
    textAlign: 'center',
    width: 141,
    marginTop: 2,
  },

  // ── 캐러셀: 양옆 (inactive) ───────────────
  inactiveContainer: {
    width: 141,
    height: 257,
    alignItems: 'center',
    justifyContent: 'flex-start',
    opacity: 0.5,
  },
  inactiveCover: {
    width: 106,
    height: 155,
    borderRadius: BorderRadius.sm,
    borderColor: Colors.gray100,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    marginTop: 53,
    overflow: 'hidden',
  },
  inactiveTitle: {
    ...Typography.body2regular,
    color: Colors.gray900,
    textAlign: 'center',
    width: 106,
  },
  inactiveAuthor: {
    ...Typography.body3Regular,
    color: Colors.gray500,
    textAlign: 'center',
    width: 106,
    marginTop: 2,
  },

  // ── 레거시 ────────────────────────────────
  carouselRank: {
    fontFamily: 'Min Sans',
    fontWeight: '800',
    fontSize: 50,
    lineHeight: 48,
    alignSelf: 'flex-start',
    zIndex: 10,
  },
  carouselCover: {
    width: '100%',
    aspectRatio: 0.68,
    borderRadius: BorderRadius.sm,
    borderColor: Colors.gray100,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  carouselCoverWithRank: {
    marginTop: -24,
  },
  carouselTitle: {
    ...Typography.subtitle1Medium,
    color: Colors.gray900,
    textAlign: 'center',
    marginTop: 2,
  },
  carouselAuthor: {
    ...Typography.body2Regular,
    color: Colors.gray600,
    textAlign: 'center',
    marginTop: 2,
  },

  // ── 레거시 모드 ───────────────────────────
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
    color: Colors.primary900,
    height: 48,
  },
  rankSecond: {
    fontSize: 40,
    lineHeight: 53,
    color: Colors.primary800,
  },
  rankThird: {
    fontSize: 40,
    lineHeight: 53,
    color: Colors.primary500,
  },
  card: { alignItems: 'center' },
  cardRank1: { marginTop: -24 },
  cardRank23: { marginTop: -28 },
  cardFlexible: { width: '100%' },
  coverLarge: {
    width: 126, height: 184,
    borderRadius: BorderRadius.sm,
    borderColor: Colors.gray100, borderWidth: 1,
    overflow: 'hidden', marginBottom: Spacing.sm,
  },
  coverMedium: {
    width: 106, height: 155,
    borderRadius: BorderRadius.sm,
    borderColor: Colors.gray100, borderWidth: 1,
    overflow: 'hidden', marginBottom: Spacing.sm,
  },
  coverFlexible: {
    width: '100%',
    aspectRatio: 106 / 155,
    borderRadius: BorderRadius.sm,
    borderColor: Colors.gray100, borderWidth: 1,
    overflow: 'hidden', marginBottom: Spacing.sm,
  },
  coverImage: { width: '100%', height: '100%' },
  coverPlaceholder: { flex: 1, backgroundColor: Colors.gray200 },
  info: { gap: 2 },
  infoLarge: { width: 126 },
  infoMedium: { width: 106 },
  infoFlexible: { width: '100%' },
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
