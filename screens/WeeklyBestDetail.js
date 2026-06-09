import React from 'react';
import {
  StyleSheet, View, FlatList, Animated,
  Dimensions, ActivityIndicator, Text, Pressable, Image,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, BorderRadius } from '../styles';
import DefaultHeader from '../components/DefaultHeader';
import SubTab from '../components/SubTab';
import TabElement from '../components/TabElement';
import EmptyState from '../components/EmptyState';
import { fetchBestsellersByPeriod, CATEGORY_LIST } from '../services/aladinApi';

const PERIOD_TABS = [
  { id: 'monthly', label: '월간 베스트' },
  { id: 'weekly',  label: '주간 베스트' },
  { id: 'daily',   label: '일간 베스트' },
];

const SUBTAB_HEIGHT = 49;
const CATEGORY_HEIGHT = 48;
const INITIAL_COUNT = 20;
const PAGE_COUNT = 10;

function formatYearMonth(year, month) {
  return `${year}년 ${month}월`;
}

function BestListItem({ item, onPress }) {
  const rankColor = item.rank === 1 ? Colors.primary500 : item.rank === 2 ? Colors.primary600 : item.rank === 3 ? Colors.primary800 : Colors.gray400;
  const titleParts = item.title?.split(' - ');
  const mainTitle = titleParts?.[0]?.trim() ?? '';
  const subTitle = titleParts?.[1]?.trim() ?? '';

  return (
    <Pressable style={styles.listItem} onPress={onPress}>
      <Text style={[styles.rank, item.rank <= 3 && styles.rankTop3, { color: rankColor }]}>{item.rank}</Text>
      <View style={styles.bookGroup}>
        <Image
          source={item.coverImage ? { uri: item.coverImage } : null}
          style={styles.cover}
          resizeMode="cover"
        />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{mainTitle}</Text>
        {!!subTitle && <Text style={styles.subTitle} numberOfLines={1}>{subTitle}</Text>}
        <Text style={styles.author} numberOfLines={1}>{item.author}</Text>
      </View>
      </View>
    </Pressable>
  );
}

export default function WeeklyBestDetail({ onBack, onBookPress }) {
  const insets = useSafeAreaInsets();
  const slideAnim = React.useRef(new Animated.Value(Dimensions.get('window').width)).current;

  const [activePeriod, setActivePeriod] = React.useState('monthly');
  const [activeCategory, setActiveCategory] = React.useState('종합');
  const [activeSubCategory, setActiveSubCategory] = React.useState(null);

  const activeCategoryObj = CATEGORY_LIST.find(c => c.name === activeCategory);
  const effectiveCategoryId = activeSubCategory ?? activeCategoryObj?.id ?? 0;
  const [books, setBooks] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);

  const now = new Date();
  const [year] = React.useState(now.getFullYear());
  const [month] = React.useState(now.getMonth() + 1);

  React.useEffect(() => {
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: false, tension: 50, friction: 10 }).start();
  }, []);

  const loadInitial = React.useCallback(() => {
    setLoading(true);
    setBooks([]);
    setHasMore(true);
    fetchBestsellersByPeriod(activePeriod, effectiveCategoryId, INITIAL_COUNT, 1).then(data => {
      setBooks(data);
      setHasMore(data.length >= INITIAL_COUNT);
      setLoading(false);
    });
  }, [activePeriod, effectiveCategoryId]);

  React.useEffect(() => { loadInitial(); }, [loadInitial]);

  const loadMore = React.useCallback(() => {
    if (loadingMore || !hasMore || loading) return;
    setLoadingMore(true);
    const start = books.length + 1;
    fetchBestsellersByPeriod(activePeriod, effectiveCategoryId, PAGE_COUNT, start).then(data => {
      setBooks(prev => [...prev, ...data]);
      setHasMore(data.length >= PAGE_COUNT);
      setLoadingMore(false);
    });
  }, [loadingMore, hasMore, loading, books.length, activePeriod, effectiveCategoryId]);

  const handleBack = () => {
    Animated.timing(slideAnim, { toValue: Dimensions.get('window').width, duration: 300, useNativeDriver: false })
      .start(() => onBack?.());
  };

  const HEADER_HEIGHT = insets.top + 52;
  const fixedAreaHeight = SUBTAB_HEIGHT;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateX: slideAnim }] }]}>
      <DefaultHeader
        title="북 베스트"
        onBack={handleBack}
        rightButtons={[]}
        showBlur={false}
        backgroundColor={Colors.white}
        topInset={insets.top}
      />

      <View style={[styles.fixedArea, { top: HEADER_HEIGHT }]}>
        <View style={styles.subTabRow}>
          {PERIOD_TABS.map(tab => (
            <SubTab key={tab.id} active={activePeriod === tab.id} onPress={() => setActivePeriod(tab.id)}>
              {tab.label}
            </SubTab>
          ))}
        </View>
        <View style={styles.subTabDivider} />
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={Colors.primary500}
          style={{ marginTop: HEADER_HEIGHT + fixedAreaHeight + 60 }}
        />
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item, i) => `${item.isbn}-${i}`}
          contentContainerStyle={[styles.listContent, { paddingTop: Spacing.lg }]}
          style={{ marginTop: HEADER_HEIGHT + fixedAreaHeight }}
          ListHeaderComponent={
            <>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={CATEGORY_LIST}
                keyExtractor={c => c.name}
                contentContainerStyle={styles.categoryRow}
                style={styles.categoryScroll}
                renderItem={({ item: cat }) => (
                  <TabElement
                    active={activeCategory === cat.name}
                    onPress={() => { setActiveCategory(cat.name); setActiveSubCategory(null); }}
                    style={{ marginRight: Spacing.xs }}
                  >
                    {cat.label}
                  </TabElement>
                )}
              />
              {activeCategoryObj?.subs?.length > 0 && (
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={activeCategoryObj.subs}
                  keyExtractor={s => String(s.id)}
                  contentContainerStyle={styles.categoryRow}
                  style={styles.categoryScroll}
                  renderItem={({ item: sub }) => (
                    <TabElement
                      active={effectiveCategoryId === sub.id}
                      onPress={() => setActiveSubCategory(sub.id)}
                      style={{ marginRight: Spacing.xs }}
                    >
                      {sub.label}
                    </TabElement>
                  )}
                />
              )}
              {activePeriod === 'monthly' && (
                <View style={styles.dateRow}>
                  <Pressable style={styles.datePicker} onPress={() => {}}>
                    <Text style={styles.dateText}>{formatYearMonth(year, month)}</Text>
                    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                      <Path d="M18 10L12 16L6 10" stroke="#6A6670" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  </Pressable>
                </View>
              )}
            </>
          }
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={<EmptyState text="베스트셀러 정보를 불러올 수 없어요" />}
          ListFooterComponent={
            loadingMore ? <ActivityIndicator color={Colors.primary500} style={{ marginVertical: Spacing.lg }} /> : null
          }
          renderItem={({ item }) => (
            <BestListItem item={item} onPress={() => onBookPress?.(item)} />
          )}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },

  fixedArea: {
    position: 'absolute',
    left: 0, right: 0,
    zIndex: 5,
    backgroundColor: Colors.white,
  },
  subTabRow: { flexDirection: 'row', paddingHorizontal: Spacing.sm },
  subTabDivider: { height: 1, backgroundColor: Colors.gray50 },
  categoryScroll: { height: CATEGORY_HEIGHT},
  categoryRow: { alignItems: 'center' , marginBottom: Spacing.md },
  dateRow: { paddingVertical: Spacing.xs , marginBottom: Spacing.lg },
  datePicker: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  dateText: { ...Typography.body1Regular, color: Colors.gray800 },

  listContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.huge, paddingTop: Spacing.lg, },

  listItem: {
    flexDirection: 'row',
    alignItems: 'top',
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  rank: {
    ...Typography.headline3Medium,
    color: Colors.gray700,
    width: 24,
    textAlign: 'center',
  },
  rankTop3: {
    ...Typography.headline1Bold,
  },
  bookGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  cover: {
    width: 82.1,
    height: 120,
    borderRadius: 5.2,
    backgroundColor: Colors.gray100,
    borderColor: Colors.gray50,
    borderWidth: 1,
  },
  info: {
    flex: 1,
    gap: Spacing.xxs,
  },
  title: {
    ...Typography.headline3Medium,
    color: Colors.gray900,
  },
  subTitle: {
    ...Typography.body2Regular,
    color: Colors.gray700,
  },
  author: {
    ...Typography.body2Regular,
    color: Colors.gray500,
  },
  separator: {
    height: 1,
    // backgroundColor: Colors.gray50,
  },
});
