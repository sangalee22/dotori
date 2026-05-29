import React from 'react';
import { View, Text, Image, ImageBackground, StyleSheet } from 'react-native';
import { Colors, Spacing } from '../styles';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

export const CARD_WIDTH = 1080;
export const CARD_HEIGHT = 1920;
const COVER_HEIGHT = 492;

const THEMES = {
  dark: {
    overlay: 'rgba(0, 0, 0, 0.62)',
    text: '#FFFFFF',
    textMuted70: 'rgba(255, 255, 255, 0.7)',
    textMuted60: 'rgba(255, 255, 255, 0.6)',
    placeholder: 'rgba(255, 255, 255, 0.15)',
  },
  light: {
    overlay: 'rgba(255, 255, 255, 0.62)',
    text: '#29252B',
    textMuted70: 'rgba(41, 37, 43, 0.7)',
    textMuted60: 'rgba(41, 37, 43, 0.6)',
    placeholder: 'rgba(41, 37, 43, 0.15)',
  },
};

const STYLE1_BG = Colors.gray200;
const STYLE1_TEXT = '#FFFFFF';
const STYLE1_MUTED = 'rgba(255, 255, 255, 0.55)';
const STYLE1_ACCENT = '#5C3D8F';

function formatTime(s) {
  const h = String(Math.floor(s / 3600)).padStart(2, '0');
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const sec = String(s % 60).padStart(2, '0');
  return `${h}:${m}:${sec}`;
}

function formatTimeShort(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

function formatTimeRange(start, dateOnly = false) {
  if (!start) return '';
  const y = start.getFullYear();
  const mo = String(start.getMonth() + 1).padStart(2, '0');
  const d = String(start.getDate()).padStart(2, '0');
  if (dateOnly) return `${y}.${mo}.${d}`;
  const h = start.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  const min = String(start.getMinutes()).padStart(2, '0');
  return `${y}.${mo}.${d} ${ampm} ${hour}:${min}`;
}

/**
 * ReadingResultCard
 * Base canvas: 1080x1920px (9:16).
 * Rendered at fixed size — wrap with scaled container for display.
 *
 * @param {'dark'|'light'|'style1'|'style2'|'style3'} variant
 * @param {object} book - { title, author, coverImage }
 * @param {number} elapsed - reading time in seconds
 * @param {Date}   startTime
 * @param {Date}   endTime
 * @param {number} startPage
 * @param {number} totalPages
 */
const BASE_BLUR = 2;

export default function ReadingResultCard({
  variant = 'dark',
  book,
  elapsed = 0,
  startTime,
  endTime,
  startPage = 0,
  endPage = 0,
  totalPages = 0,
  readingDays = 1,
  displayScale = 1,
  customBackground = null,
  showBookInfo = true,
  dateOnly = false,
}) {
  const theme = THEMES[variant] ?? THEMES.dark;
  const blurRadius = displayScale > 0 ? BASE_BLUR / displayScale : BASE_BLUR;
  const [coverWidth, setCoverWidth] = React.useState(null);

  React.useEffect(() => {
    if (!book?.coverImage) return;
    Image.getSize(
      book.coverImage,
      (w, h) => setCoverWidth(Math.round((w / h) * COVER_HEIGHT)),
      () => setCoverWidth(null),
    );
  }, [book?.coverImage]);

  const pagesRead = endPage > startPage ? endPage - startPage : endPage;

  const progress = totalPages > 0
    ? `${Math.round((endPage / totalPages) * 100) - Math.round((startPage / totalPages) * 100)}%`
    : '-';

  // ── Style1: solid background, bottom-heavy layout ──
  if (variant === 'style1') {
    return (
      <View style={[styles.card, { backgroundColor: STYLE1_BG }]}>
        {customBackground && (
          <Image source={{ uri: customBackground }} style={[StyleSheet.absoluteFill, { resizeMode: 'cover' }]} pointerEvents="none" />
        )}
        {/* 그라데이션 박스 */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.06)']}
          locations={[0.4795, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {/* 최상단: 책 커버 + 제목/저자 */}
        <View style={[styles.s1TopContent, { opacity: showBookInfo ? 1 : 0 }]}>
          <View style={styles.s1BookRow}>
            {book?.coverImage ? (
              <Image
                source={{ uri: book.coverImage }}
                style={[
                  styles.s1CoverThumb,
                  { width: coverWidth ? Math.round(coverWidth * 140 / COVER_HEIGHT) : Math.round(140 * 2 / 3) },
                ]}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.s1CoverThumb, { width: Math.round(140 * 2 / 3), backgroundColor: 'rgba(255,255,255,0.15)' }]} />
            )}
            <View style={styles.s1BookInfo}>
              <Text style={[styles.s1BookTitle, { color: STYLE1_TEXT, fontFamily: 'LeeSeoyun', textShadowColor: 'rgba(0,0,0,0.10)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 }]} numberOfLines={2}>
                {book?.title?.split(' - ')[0].trim()}
              </Text>
              <Text style={[styles.s1BookAuthor, { color: STYLE1_MUTED, fontFamily: 'LeeSeoyun', textShadowColor: 'rgba(0,0,0,0.10)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 }]} numberOfLines={1}>
                {book?.author}
              </Text>
            </View>
          </View>
        </View>

        {/* 중단: 심볼 박스 (flex 스페이서) */}
        <View style={styles.s1SymbolWrapper}>
          {!customBackground && (
            <View style={[styles.s1SymbolBox, { backgroundColor: STYLE1_ACCENT }]}>
              <Svg width={70} height={70} viewBox="0 0 43 43" fill="none">
                <Path
                  d="M21.4287 8.08105C22.267 8.08105 22.9473 8.76034 22.9473 9.59863V19.9102H33.2588C34.0971 19.9102 34.7764 20.5904 34.7764 21.4287C34.7761 22.2668 34.0969 22.9463 33.2588 22.9463H22.9473V33.2588C22.9473 34.0971 22.267 34.7764 21.4287 34.7764C20.5906 34.7762 19.9111 34.097 19.9111 33.2588V22.9463H9.59863C8.76048 22.9463 8.08127 22.2668 8.08105 21.4287C8.08105 20.5904 8.76034 19.9102 9.59863 19.9102H19.9111V9.59863C19.9111 8.76044 20.5906 8.08122 21.4287 8.08105Z"
                  fill="white"
                />
              </Svg>
            </View>
          )}
        </View>

        {/* 하단: 시간 + 통계 */}
        <View style={styles.s1Content}>
          <Text style={[styles.s1TimeRange, { color: STYLE1_MUTED, fontFamily: 'LeeSeoyun' }]}>
            {formatTimeRange(startTime, dateOnly)}
          </Text>
          {elapsed > 0 && (
            <Text style={[styles.s1Elapsed, { color: STYLE1_TEXT, fontFamily: 'LeeSeoyun' }]}>
              {formatTimeShort(elapsed)}
            </Text>
          )}
          <View style={[styles.stats, { justifyContent: 'center' }]}>
            <View style={[styles.statItem, { alignItems: 'center' }]}>
              <Text style={[styles.statValue, { color: STYLE1_TEXT, fontFamily: 'LeeSeoyun', fontSize: 80 }]}>{pagesRead}</Text>
              <Text style={[styles.statLabel, { color: STYLE1_MUTED, fontFamily: 'LeeSeoyun' }]}>pages</Text>
            </View>
            <View style={[styles.statItem, { alignItems: 'center' }]}>
              <Text style={[styles.statValue, { color: STYLE1_TEXT, fontFamily: 'LeeSeoyun', fontSize: 80 }]}>{progress}</Text>
              <Text style={[styles.statLabel, { color: STYLE1_MUTED, fontFamily: 'LeeSeoyun' }]}>progress</Text>
            </View>
            <View style={[styles.statItem, { alignItems: 'center' }]}>
              <Text style={[styles.statValue, { color: STYLE1_TEXT, fontFamily: 'LeeSeoyun', fontSize: 80 }]}>day {readingDays}</Text>
              <Text style={[styles.statLabel, { color: STYLE1_MUTED, fontFamily: 'LeeSeoyun' }]}>reading</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // ── Style2: style1 복사, 책 정보 ↔ 결과값 위치 교체 ──
  if (variant === 'style2') {
    return (
      <View style={[styles.card, { backgroundColor: STYLE1_BG }]}>
        {customBackground && (
          <Image source={{ uri: customBackground }} style={[StyleSheet.absoluteFill, { resizeMode: 'cover' }]} pointerEvents="none" />
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.06)']}
          locations={[0.4795, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {/* 최상단: 시간 + 통계 */}
        <View style={styles.s2TopContent}>
          <Text style={[styles.s1TimeRange, { color: STYLE1_MUTED, fontFamily: 'LeeSeoyun' }]}>
            {formatTimeRange(startTime, dateOnly)}
          </Text>
          {elapsed > 0 && (
            <Text style={[styles.s1Elapsed, { color: STYLE1_TEXT, fontFamily: 'OkMallangB', marginTop: Spacing.lg }]}>
              {formatTimeShort(elapsed)}
            </Text>
          )}
          <View style={[styles.stats, { justifyContent: 'center' }]}>
            <View style={[styles.statItem, { alignItems: 'center' }]}>
              <Text style={[styles.statValue, { color: STYLE1_TEXT, fontFamily: 'OkMallangB', fontSize: 80 }]}>{pagesRead}</Text>
              <Text style={[styles.statLabel, { color: STYLE1_MUTED, fontFamily: 'LeeSeoyun' }]}>pages</Text>
            </View>
            <View style={[styles.statItem, { alignItems: 'center' }]}>
              <Text style={[styles.statValue, { color: STYLE1_TEXT, fontFamily: 'OkMallangB', fontSize: 80 }]}>{progress}</Text>
              <Text style={[styles.statLabel, { color: STYLE1_MUTED, fontFamily: 'LeeSeoyun' }]}>progress</Text>
            </View>
            <View style={[styles.statItem, { alignItems: 'center' }]}>
              <Text style={[styles.statValue, { color: STYLE1_TEXT, fontFamily: 'OkMallangB', fontSize: 80 }]}>day {readingDays}</Text>
              <Text style={[styles.statLabel, { color: STYLE1_MUTED, fontFamily: 'LeeSeoyun' }]}>reading</Text>
            </View>
          </View>
        </View>

        {/* 중단: 심볼 박스 (flex 스페이서) */}
        <View style={styles.s1SymbolWrapper}>
          {!customBackground && (
            <View style={[styles.s1SymbolBox, { backgroundColor: STYLE1_ACCENT }]}>
              <Svg width={70} height={70} viewBox="0 0 43 43" fill="none">
                <Path
                  d="M21.4287 8.08105C22.267 8.08105 22.9473 8.76034 22.9473 9.59863V19.9102H33.2588C34.0971 19.9102 34.7764 20.5904 34.7764 21.4287C34.7761 22.2668 34.0969 22.9463 33.2588 22.9463H22.9473V33.2588C22.9473 34.0971 22.267 34.7764 21.4287 34.7764C20.5906 34.7762 19.9111 34.097 19.9111 33.2588V22.9463H9.59863C8.76048 22.9463 8.08127 22.2668 8.08105 21.4287C8.08105 20.5904 8.76034 19.9102 9.59863 19.9102H19.9111V9.59863C19.9111 8.76044 20.5906 8.08122 21.4287 8.08105Z"
                  fill="white"
                />
              </Svg>
            </View>
          )}
        </View>

        {/* 하단: 책 커버 + 제목/저자 */}
        <View style={[styles.s2BottomContent, { opacity: showBookInfo ? 1 : 0 }]}>
          <View style={styles.s1BookRow}>
            {book?.coverImage ? (
              <Image
                source={{ uri: book.coverImage }}
                style={[
                  styles.s1CoverThumb,
                  { width: coverWidth ? Math.round(coverWidth * 140 / COVER_HEIGHT) : Math.round(140 * 2 / 3) },
                ]}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.s1CoverThumb, { width: Math.round(140 * 2 / 3), backgroundColor: 'rgba(255,255,255,0.15)' }]} />
            )}
            <View style={styles.s1BookInfo}>
              <Text style={[styles.s1BookTitle, { color: STYLE1_TEXT, fontFamily: 'LeeSeoyun', textShadowColor: 'rgba(0,0,0,0.10)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 }]} numberOfLines={2}>
                {book?.title?.split(' - ')[0].trim()}
              </Text>
              <Text style={[styles.s1BookAuthor, { color: STYLE1_MUTED, fontFamily: 'LeeSeoyun', textShadowColor: 'rgba(0,0,0,0.10)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 }]} numberOfLines={1}>
                {book?.author}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // ── Default layout (dark / light / style3) ──
  return (
    <ImageBackground
      source={book?.coverImage ? { uri: book.coverImage } : null}
      style={styles.card}
      imageStyle={styles.cardBg}
      blurRadius={blurRadius}
    >
      <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
        {/* 상단: 책 커버 + 제목/저자 */}
        <View style={styles.cardTop}>
          {book?.coverImage ? (
            <Image
              source={{ uri: book.coverImage }}
              style={[styles.bookCover, coverWidth ? { width: coverWidth } : null]}
            />
          ) : (
            <View style={[styles.bookCoverPlaceholder, { backgroundColor: theme.placeholder }]} />
          )}
          <Text style={[styles.bookTitle, { color: theme.text, fontFamily: 'Paperlogy-SemiBold' }]} numberOfLines={2}>
            {book?.title?.split(' - ')[0].trim()}
          </Text>
          <Text style={[styles.bookAuthor, { color: theme.textMuted70, fontFamily: 'Paperlogy-Regular' }]} numberOfLines={1}>
            {book?.author}
          </Text>
        </View>

        {/* 하단: 시간 + 통계 */}
        <View style={styles.cardBottom}>
          <Text style={[styles.timeRange, { color: theme.textMuted60, fontFamily: 'Paperlogy-Regular' }]}>
            {formatTimeRange(startTime, dateOnly)}
          </Text>
          {elapsed > 0 && (
            <Text style={[styles.elapsedTime, { color: theme.text, fontFamily: 'Paperlogy-Medium' }]}>{formatTimeShort(elapsed)}</Text>
          )}
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.text, fontFamily: 'Paperlogy-SemiBold' }]}>{pagesRead}</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted60, fontFamily: 'Paperlogy-Regular' }]}>pages</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.text, fontFamily: 'Paperlogy-SemiBold' }]}>{progress}</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted60, fontFamily: 'Paperlogy-Regular' }]}>progress</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.text, fontFamily: 'Paperlogy-SemiBold' }]}>day {readingDays}</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted60, fontFamily: 'Paperlogy-Regular' }]}>reading</Text>
            </View>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    overflow: 'hidden',
  },
  cardBg: {
    resizeMode: 'cover',
    transform: [{ scale: 1.1 }],
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 70,
    paddingTop: 56,
    paddingBottom: 250,
  },
  cardTop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookCover: {
    height: COVER_HEIGHT,
    marginBottom: 64,
    resizeMode: 'cover',
  },
  bookCoverPlaceholder: {
    width: Math.round(COVER_HEIGHT * (2 / 3)),
    height: COVER_HEIGHT,
  },
  bookTitle: {
    fontSize: 54,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  bookAuthor: {
    fontSize: 42,
    fontWeight: '400',
    textAlign: 'center',
  },
  timeRange: {
    fontSize: 40,
    fontWeight: '400',
  },
  elapsedTime: {
    fontSize: 80,
    fontWeight: '500',
  },
  stats: {
    flexDirection: 'row',
    gap: 80,
    marginTop: Spacing.huge,
  },
  statItem: {
    gap: Spacing.sm,
  },
  statValue: {
    fontSize: 60,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 40,
    fontWeight: '400',
  },

  // ── Style1 ──
  s1SymbolWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  s1SymbolBox: {
    width: 120,
    height: 120,
    borderRadius: 43,
    alignItems: 'center',
    justifyContent: 'center',
  },
  s1TopContent: {
    paddingHorizontal: 54,
    paddingTop: 200,
    alignItems: 'center',
  },
  s1Content: {
    paddingHorizontal: 54,
    paddingBottom: 220,
    alignItems: 'center',
  },
  s1BookRow: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 40,
  },
  s1CoverThumb: {
    height: 140,
  },
  s1BookInfo: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  s1BookTitle: {
    fontSize: 60,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  s1BookAuthor: {
    fontSize: 50,
    fontWeight: '400',
    textAlign: 'center',
  },
  s1TimeRange: {
    fontSize: 40,
    textAlign: 'center',
  },
  s1Elapsed: {
    fontSize: 100,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },

  // ── Style2 ──
  s2TopContent: {
    paddingHorizontal: 54,
    paddingTop: 200,
    alignItems: 'center',
  },
  s2BottomContent: {
    paddingHorizontal: 54,
    paddingBottom: 220,
    alignItems: 'center',
  },
});
