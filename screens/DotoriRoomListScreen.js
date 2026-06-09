import React from 'react';
import { StyleSheet, View, ScrollView, Text, RefreshControl, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../styles';
import FeedItem from '../components/FeedItem';
import SimbolOutlineIcon from '../components/SimbolOutlineIcon';
import { searchBooks, cleanAuthorName } from '../services/aladinApi';

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
    // 리뷰 작성 시 연결된 책 정보를 최우선으로 사용 (API 캐시보다 신뢰도 높음)
    // cover만 bookCache로 보완하고, 책 자체(title/author)는 Firestore 데이터 유지
    if (item.book?.title) {
      // API 캐시 커버 우선 (Firestore 저장 URL이 만료됐을 수 있음), 없으면 Firestore URL
      const cover = (isbn && bookCache[isbn]?.cover) || item.book.cover;
      return { ...item.book, cover };
    }
    if (item.bookTitle) {
      const cover = (isbn && bookCache[isbn]?.cover) || item.bookCover;
      return { title: item.bookTitle, author: item.bookAuthor, cover };
    }
    const found = readingBooks.find(b => String(b.isbn) === String(isbn));
    if (found) return { title: found.title, author: cleanAuthorName(found.author), cover: found.coverImage ?? found.cover };
    if (isbn && bookCache[isbn]) return bookCache[isbn];
    return null;
  };

  // ISBN별 책 정보를 Aladin API로 조회 → 전역 캐시 + Firestore 동기화
  const isbnKey = [...new Set(
    filtered.map(item => item.bookIsbn ?? item.isbn).filter(Boolean)
  )].sort().join(',');

  React.useEffect(() => {
    const isbns = isbnKey ? isbnKey.split(',').filter(isbn => !bookCache[isbn]) : [];
    if (isbns.length === 0) return;

    isbns.forEach(async (isbn) => {
      const sampleItem = filtered.find(item => (item.bookIsbn ?? item.isbn) === isbn);
      const storedTitle = sampleItem?.book?.title || sampleItem?.bookTitle;
      if (!storedTitle) return;
      try {
        const results = await searchBooks(storedTitle, 'Title', 3);
        if (!results?.length) return;
        const norm = (s) => (s || '').split(' - ')[0].trim().toLowerCase();
        const match = results.find(b => {
          const t = norm(b.title);
          const s = norm(storedTitle);
          return t === s || t.includes(s) || s.includes(t);
        }) || results[0];
        if (match?.coverImage) {
          const cover = match.coverImage.replace(/^http:\/\/image\.aladin\.co\.kr/, 'https://image.aladin.co.kr');
          onBookCacheUpdate?.(isbn, {
            title: (match.title || '').split(' - ')[0].trim() || storedTitle,
            author: cleanAuthorName(match.author),
            cover,
          });
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
