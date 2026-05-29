import React from 'react';
import { StyleSheet, View, ScrollView, Text, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../styles';
import FeedItem from '../components/FeedItem';
import SimbolOutlineIcon from '../components/SimbolOutlineIcon';

// 헤더(60) + 탭바(12+20+12=44) = 104
const HEADER_HEIGHT = 60;

/**
 * FeedScreen (피드)
 * 모든 사용자의 독서 피드 게시물이 보여지는 화면
 */
export default function DotoriRoomListScreen({ reviews = [], currentUser, activeTab = 'all', readingBooks = [], onBookPress, onScroll, onRefresh }) {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    if (onRefresh) await onRefresh();
    setTimeout(() => setRefreshing(false), 600);
  }, [onRefresh]);

  const filtered = [...reviews]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const getBook = (item) => {
    if (item.book) return item.book;
    const found = readingBooks.find(b => b.isbn === item.bookIsbn);
    if (found) return { title: found.title, author: found.author, cover: found.coverImage ?? found.cover };
    return null;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + HEADER_HEIGHT }]}
        onScroll={onScroll}
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
            {filtered.map((item) => {
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
            ))}
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
