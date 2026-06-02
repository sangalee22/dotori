import React from 'react';
import { StyleSheet, View, ScrollView, Text, RefreshControl, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../styles';
import FeedItem from '../components/FeedItem';
import SimbolOutlineIcon from '../components/SimbolOutlineIcon';
import { fetchBookDetail, cleanAuthorName } from '../services/aladinApi';

const PAGE_SIZE = 15;

// 헤더(60) + 탭바(12+20+12=44) = 104
const HEADER_HEIGHT = 60;

/**
 * FeedScreen (피드)
 * 모든 사용자의 독서 피드 게시물이 보여지는 화면
 */
export default function DotoriRoomListScreen({ reviews = [], currentUser, activeTab = 'all', readingBooks = [], bookCache = {}, onBookCacheUpdate, onBookPress, onScroll, onRefresh, onUpdateBookInfo }) {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = React.useState(false);
  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE);

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    setVisibleCount(PAGE_SIZE);
    if (onRefresh) await onRefresh();
    setTimeout(() => setRefreshing(false), 600);
  }, [onRefresh]);

  const handleScroll = React.useCallback((event) => {
    onScroll?.(event);
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    if (contentOffset.y + layoutMeasurement.height >= contentSize.height - 300) {
      setVisibleCount(prev => prev + PAGE_SIZE);
    }
  }, [onScroll]);

  const filtered = [...reviews]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const getBook = (item) => {
    const isbn = item.bookIsbn ?? item.isbn;
    // API 데이터만 사용 — Firestore의 item.book은 무시 (잘못된 데이터 방지)
    if (isbn && bookCache[isbn]) return bookCache[isbn];
    // 내 readingBooks에 있으면 신뢰할 수 있는 데이터
    const found = readingBooks.find(b => String(b.isbn) === String(isbn));
    if (found) return { title: found.title, author: cleanAuthorName(found.author), cover: found.coverImage ?? found.cover };
    return null; // API 로드 전엔 null (잘못된 Firestore 데이터 표시 안 함)
  };

  // ISBN별 책 정보를 Aladin API로 조회 → 전역 캐시 + Firestore 동기화
  const isbnKey = [...new Set(
    filtered.map(item => item.bookIsbn ?? item.isbn).filter(Boolean)
  )].sort().join(',');

  React.useEffect(() => {
    const isbns = isbnKey ? isbnKey.split(',').filter(isbn => !bookCache[isbn]) : [];
    if (isbns.length === 0) return;

    isbns.forEach(async (isbn) => {
      try {
        const detail = await fetchBookDetail(isbn);
        if (detail?.cover) {
          const bookData = {
            title: detail.title.split(' - ')[0].trim(),
            author: cleanAuthorName(detail.author),
            cover: detail.cover,
          };
          onBookCacheUpdate?.(isbn, bookData);
          onUpdateBookInfo?.(isbn, bookData);
        }
      } catch {}
    });
  }, [isbnKey]);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + HEADER_HEIGHT }]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary500}
          />
        }
      >
        {filtered.length > 0 ? (
          <View style={styles.feedList}>
            {filtered.slice(0, visibleCount).map((item) => {
              const isbn = item.bookIsbn ?? item.isbn;
              const readingBook = readingBooks.find(b => String(b.isbn) === String(isbn));
              const myCurrentPage = readingBook ? (readingBook.currentPage ?? 0) : Infinity;
              return (
              <FeedItem
                key={item.id}
                id={item.id}
                type={item.type}
                user={item.userId === currentUser?.id
                  ? { name: currentUser.nickname || currentUser.name, profileImage: currentUser.profileImage }
                  : item.user}
                timeAgo={item.timeAgo}
                page={item.page}
                myCurrentPage={myCurrentPage}
                content={item.content}
                images={item.images}
                likes={item.likes}
                comments={item.comments}
                isSpoiler={item.isSpoiler}
                isCompleted={item.isCompleted}
                isMyReview={item.userId === currentUser?.id}
                showBookInfo={true}
                book={getBook(item)}
                onBookPress={(book) => onBookPress && onBookPress({
                  ...book,
                  isbn,
                  coverImage: book?.cover,
                })}
              />
              );
            })}
            {visibleCount < filtered.length && (
              <ActivityIndicator
                color={Colors.primary500}
                style={styles.loadingMore}
              />
            )}
          </View>
        ) : (
          <View style={styles.empty}>
            <SimbolOutlineIcon width={24} height={24} color={Colors.gray400} />
            <Text style={styles.emptyText}>아직 작성된 피드가 없어요</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  feedList: {
  },
  loadingMore: {
    paddingVertical: Spacing.xl,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingTop: 100,
  },
  emptyText: {
    ...Typography.subtitle1Medium,
    color: Colors.gray500,
  },
});
