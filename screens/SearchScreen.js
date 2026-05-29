import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '../styles';
import SearchHeader from '../components/SearchHeader';
import SearchChip from '../components/SearchChip';
import BestBook from '../components/BestBook';
import SectionTitle from '../components/SectionTitle';
import EmptyState from '../components/EmptyState';
import { searchBooks } from '../services/aladinApi';

/**
 * SearchScreen Component
 * Search page with recent search terms and recently viewed books
 */
export default function SearchScreen({
  onBack,
  recentBooks = [],
  recentSearches = [],
  onAddSearch,
  onRemoveSearch,
  onClearAllSearches,
  onBookPress,
  onClearAllBooks,
  searchText,
  setSearchText,
  hasSearched,
  setHasSearched,
  searchResults,
  setSearchResults,
  style,
}) {
  const [isSearching, setIsSearching] = useState(false);
  const searchHeaderRef = React.useRef(null);

  // Slide in animation
  const slideAnim = React.useRef(new Animated.Value(Dimensions.get('window').width)).current;

  React.useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: false,
      tension: 50,
      friction: 10,
    }).start();
  }, []);

  // Handle search submission (e.g., when user presses Enter)
  const handleSearch = async () => {
    if (searchText.trim()) {
      if (onAddSearch) {
        onAddSearch(searchText);
      }

      setIsSearching(true);
      setHasSearched(true);

      try {
        console.log(`🔍 검색 시작: "${searchText}"`);
        const results = await searchBooks(searchText, 'Keyword', 20);
        console.log(`✅ 검색 완료: ${results.length}건`);
        setSearchResults(results);
      } catch (error) {
        console.error('❌ 검색 실패:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }
  };

  // Handle clearing all recent books
  const handleClearAllBooks = () => {
    if (onClearAllBooks) {
      onClearAllBooks();
    }
  };

  // Handle chip press - search with that term
  const handleChipPress = async (term) => {
    setSearchText(term);
    if (onAddSearch) {
      onAddSearch(term);
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      console.log(`🔍 검색 시작: "${term}"`);
      const results = await searchBooks(term, 'Keyword', 20);
      console.log(`✅ 검색 완료: ${results.length}건`);
      setSearchResults(results);
    } catch (error) {
      console.error('❌ 검색 실패:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle clear button press - reset search
  const handleClearSearch = () => {
    setSearchText('');
    setHasSearched(false);
    setSearchResults([]);
    // Focus on search input after clearing
    if (searchHeaderRef.current) {
      setTimeout(() => {
        searchHeaderRef.current?.focus();
      }, 0);
    }
  };

  return (
    <Animated.View style={[styles.animatedContainer, style, { transform: [{ translateX: slideAnim }] }]}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header with gradient background */}
        <SearchHeader
          ref={searchHeaderRef}
          searchText={searchText}
          onSearchTextChange={setSearchText}
          onBack={onBack}
          onSearch={handleSearch}
          onClear={handleClearSearch}
        />

        {/* Scrollable content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={[
            styles.contentContainer,
            hasSearched && searchResults.length === 0 && styles.centeredContent,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Loading state */}
          {isSearching && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary500} />
              <Text style={styles.loadingText}>검색 중...</Text>
            </View>
          )}

          {/* Search results */}
          {hasSearched && !isSearching && searchResults.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionTop}>
                <View style={styles.sectionTitleWithCount}>
                  <SectionTitle>도서</SectionTitle>
                  <Text style={styles.resultCount}>{searchResults.length}</Text>
                </View>
              </View>

              <View style={styles.resultsGrid}>
                {searchResults.map((book, index) => (
                  <View
                    key={index}
                    style={[
                      styles.bookCardWrapper,
                      (index + 1) % 3 === 0 && styles.bookCardWrapperLast
                    ]}
                  >
                    <BestBook
                      rank={4}
                      title={book.title}
                      author={book.author}
                      coverImage={book.coverImage}
                      isbn={book.isbn}
                      onPress={() => onBookPress && onBookPress(book)}
                      style={styles.bookCard}
                      flexibleWidth={true}
                    />
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* No results state */}
          {hasSearched && !isSearching && searchResults.length === 0 && (
            <EmptyState text="검색 결과가 없어요" />
          )}

          {/* Recent searches section */}
          {!hasSearched && recentSearches.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionTop}>
                <SectionTitle>최근 검색어</SectionTitle>
                <TouchableOpacity onPress={onClearAllSearches} style={styles.clearButton}>
                  <Text style={styles.clearButtonText}>전체 삭제</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.chipsContainer}>
                {recentSearches.map((term, index) => (
                  <SearchChip
                    key={index}
                    text={term}
                    onPress={() => handleChipPress(term)}
                    onRemove={() => onRemoveSearch(term)}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Recent books section */}
          {!hasSearched && recentBooks.length > 0 && (
            <View style={styles.recentBooksSection}>
              <View style={styles.sectionTop}>
                <SectionTitle>최근 본 도서</SectionTitle>
                <TouchableOpacity onPress={handleClearAllBooks} style={styles.clearButton}>
                  <Text style={styles.clearButtonText}>전체 삭제</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.booksContainer}
                style={styles.booksScrollView}
              >
                {recentBooks.map((book, index) => (
                  <BestBook
                    key={index}
                    rank={4}
                    title={book.title}
                    author={book.author}
                    coverImage={book.coverImage}
                    isbn={book.isbn}
                    onPress={() => onBookPress && onBookPress(book)}
                    style={{ paddingTop: 0, marginRight: index === recentBooks.length - 1 ? 0 : Spacing.md }}
                  />
                ))}
              </ScrollView>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  animatedContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl,
    gap: Spacing.huge,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 60,
  },
  loadingText: {
    ...Typography.body2Regular,
    color: Colors.gray700,
  },
  section: {
    gap: Spacing.xs,
  },
  sectionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleWithCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resultCount: {
    ...Typography.body1ExtraBold,
    color: Colors.primary900,
  },
  resultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  bookCardWrapper: {
    width: '31.5%',
    marginBottom: Spacing.lg,
  },
  bookCardWrapperLast: {
    width: '31.5%',
    marginBottom: Spacing.lg,
  },
  bookCard: {
    paddingTop: 0,
    width: '100%',
  },
  clearButton: {
    paddingVertical: 5,
    paddingRight: Spacing.sm,
  },
  clearButtonText: {
    ...Typography.body2Regular,
    color: Colors.gray700,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  recentBooksSection: {
    gap: Spacing.xs,
  },
  booksScrollView: {
    marginHorizontal: -Spacing.md, // Compensate for parent padding to extend to full width
  },
  booksContainer: {
    gap: 0, // Remove gap since we're using marginRight on each item
    paddingHorizontal: Spacing.md, // Add padding at edges
  },
});
