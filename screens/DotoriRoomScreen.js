import React from 'react';
import { StyleSheet, View, ScrollView, Text, Image, Pressable, Animated, Dimensions, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, BorderRadius } from '../styles';
import EmptyState from '../components/EmptyState';
import ArrowLeftIcon from '../components/ArrowLeftIcon';
import ArrowRightIcon from '../components/ArrowRightIcon';
import IconButton from '../components/IconButton';
import CalendarDayCell from '../components/CalendarDayCell';
import CalendarRecordBottomSheet from '../components/CalendarRecordBottomSheet';
import RecordDetailModal from '../components/RecordDetailModal';
import SubTab from '../components/SubTab';
import Button from '../components/Button';
import PopupHeader from '../components/PopupHeader';

const HEADER_HEIGHT = 104;
const MAIN_TAB_HEIGHT = 44;
const SUB_TAB_HEIGHT = 49;
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SCREEN_HEIGHT = Dimensions.get('window').height;

function getCalendarDays(year, month) {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const days = [...Array(startOffset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

function formatDuration(seconds) {
  if (!seconds) return '0초';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts = [];
  if (h > 0) parts.push(`${h}시간`);
  if (m > 0) parts.push(`${m}분`);
  if (s > 0 || parts.length === 0) parts.push(`${s}초`);
  return parts.join(' ');
}


function CompletedBookSheet({ visible, onClose, book, records = [], onBookPress, onRecordPress }) {
  const translateY = React.useRef(new Animated.Value(300)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 50, friction: 10 }).start();
    } else {
      Animated.timing(translateY, { toValue: 300, duration: 200, useNativeDriver: true }).start();
    }
  }, [visible]);

  const sortedRecords = [...records].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const totalReadingDays = new Set(records.map(r => r.date)).size;
  const totalDuration = records.reduce((s, r) => s + (r.duration ?? 0), 0);
  const coverUri = book?.coverImage ?? book?.cover;
  const lastRecord = sortedRecords[0];

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={sheetStyles.container}>
        <Pressable style={sheetStyles.backdrop} onPress={onClose} />
        <Animated.View style={[sheetStyles.sheet, { transform: [{ translateY }] }]}>
          <PopupHeader title="완독한 책" />
          <View style={sheetStyles.listContent}>
            <ScrollView
              style={sheetStyles.listBox}
              contentContainerStyle={sheetStyles.listBoxContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={sheetStyles.recordItem}>
                <View style={sheetStyles.cardTop}>
                  <Pressable onPress={() => { onClose(); setTimeout(() => onBookPress?.(book), 300); }}>
                    <Image
                      source={(lastRecord?.cover ?? coverUri) ? { uri: lastRecord?.cover ?? coverUri } : null}
                      style={sheetStyles.cover}
                      resizeMode="cover"
                    />
                  </Pressable>
                  <Pressable style={sheetStyles.info} onPress={() => sortedRecords.length > 0 && onRecordPress?.(lastRecord, book, totalReadingDays)}>
                    <Text style={sheetStyles.bookTitle} numberOfLines={2}>
                      {((lastRecord?.title) ?? book?.title)?.split(' - ')[0].trim()}
                    </Text>
                    <Text style={sheetStyles.author} numberOfLines={1}>{book?.author ?? ''}</Text>
                    {sortedRecords.length > 0 && (
                      <>
                        <Text style={sheetStyles.readingDays}>{totalReadingDays}일 동안 독서 했어요</Text>
                        <Text style={sheetStyles.duration}>{formatDuration(totalDuration)}</Text>
                      </>
                    )}
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const sheetStyles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)' },
  sheet: { backgroundColor: Colors.white, borderTopLeftRadius: 50, borderTopRightRadius: 50 },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.huge,
  },
  listBox: {
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    maxHeight: SCREEN_HEIGHT * 0.8 - 146,
  },
  listBoxContent: { paddingVertical: Spacing.sm },
  recordItem: { paddingHorizontal: Spacing.md, gap: Spacing.sm },
  divider: { height: 1, backgroundColor: Colors.gray100 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  cover: { width: 68.6, height: 100, borderRadius: 4.8, borderColor: Colors.gray100, borderWidth: 1, backgroundColor: Colors.gray100 },
  info: { flex: 1 },
  bookTitle: { ...Typography.body1Medium, color: Colors.gray900 },
  author: { ...Typography.body2Regular, color: Colors.gray500 },
  readingDays: { ...Typography.body3Regular, color: Colors.gray700, marginTop: Spacing.sm, marginBottom: Spacing.xxs },
  duration: { ...Typography.headline3Bold, color: Colors.gray900 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xxl },
  emptyText: { ...Typography.body1Medium, color: Colors.gray500 },
});

function ReadingRecordCard({ book, lastRecord, totalDuration, readingDays, pct, onPress, onReviewPress, isLast }) {
  const coverUri = lastRecord?.cover ?? book?.coverImage ?? book?.cover;

  return (
    <View>
      <Pressable style={cardStyles.container} onPress={onPress}>
        <View style={cardStyles.top}>
          <Image
            source={coverUri ? { uri: coverUri } : null}
            style={cardStyles.cover}
            resizeMode="cover"
          />
          <View style={cardStyles.info}>
            <Text style={cardStyles.title} numberOfLines={2}>{(book?.title ?? lastRecord?.title)?.split(' - ')[0].trim()}</Text>
            <Text style={cardStyles.author} numberOfLines={1}>{book?.author ?? ''}</Text>
            <View style={cardStyles.durationRow}>
              <Text style={cardStyles.duration}>{formatDuration(totalDuration)}</Text>
              <Button variant="outline" size="medium" onPress={onReviewPress}>독후감</Button>
            </View>
          </View>
        </View>
        <View style={cardStyles.progressTrack}>
          <View style={[cardStyles.progressFill, { width: `${pct}%` }]} />
        </View>
        <View style={cardStyles.bottom}>
          <Text style={cardStyles.pagesText}>{book?.currentPage ?? 0} pages · {pct}%</Text>
          {readingDays > 0 && <Text style={cardStyles.daysText}>{readingDays}일 동안 독서 했어요</Text>}
        </View>
      </Pressable>
      {!isLast && <View style={cardStyles.divider} />}
    </View>
  );
}

const cardStyles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  top: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  cover: {
    width: 56.3,
    height: 82,
    borderRadius: 3.9,
    borderColor: Colors.gray100,
    borderWidth: 1,
    backgroundColor: Colors.gray100,
  },
  info: {
    flex: 1,
    // gap: Spacing.xxs,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  title: {
    ...Typography.body1Medium,
    color: Colors.gray900,
  },
  author: {
    ...Typography.body2Regular,
    color: Colors.gray500,
    marginBottom: Spacing.xs,
  },
  time: {
    ...Typography.body3Regular,
    color: Colors.gray700,
    marginTop: Spacing.xs,
  },
  duration: {
    ...Typography.headline3Bold,
    color: Colors.gray900,
  },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.gray100,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary800,
    borderRadius: 2,
  },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pagesText: {
    ...Typography.body3Regular,
    color: Colors.gray900,
  },
  daysText: {
    ...Typography.body3Regular,
    color: Colors.gray900,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray50,
  },
});

export default function DotoriRoomScreen({ readingBooks = [], reviews = [], readingRecords = [], wantToReadBooks = [], currentUser, activeTab = 'calendar', onBookPress, onReviewPress, onScroll, logoHeightAnim, onDeleteReadingRecord, onEditReadingRecord, onAddRecord }) {
  const insets = useSafeAreaInsets();
  const today = new Date();
  const [calYear, setCalYear] = React.useState(today.getFullYear());
  const [calMonth, setCalMonth] = React.useState(today.getMonth() + 1);
  const [bookshelfSubTab, setBookshelfSubTab] = React.useState('reading');

  const [selectedRecord, setSelectedRecord] = React.useState(null);
  const [selectedDate, setSelectedDate] = React.useState(null);
  const [detailItem, setDetailItem] = React.useState(null);
  const [completedDetailBook, setCompletedDetailBook] = React.useState(null);

  const calDays = getCalendarDays(calYear, calMonth);
  const calWeeks = [];
  for (let i = 0; i < calDays.length; i += 7) calWeeks.push(calDays.slice(i, i + 7));

  const readingBooksFiltered = readingBooks.filter(b => !b.isCompleted);
  const completedBooksFiltered = readingBooks.filter(b => b.isCompleted);

  const completedIsbnSet = new Set(completedBooksFiltered.map(b => b.isbn));
  const completedTotalDuration = readingRecords
    .filter(r => completedIsbnSet.has(r.isbn))
    .reduce((sum, r) => sum + (r.duration ?? 0), 0);

  const recordsByDay = {};
  readingRecords.forEach(r => {
    const d = new Date(r.date);
    if (d.getFullYear() === calYear && d.getMonth() + 1 === calMonth) {
      const day = d.getDate();
      if (!recordsByDay[day]) recordsByDay[day] = [];
      recordsByDay[day].push(r);
    }
  });

  const totalBooks = readingBooks.length;
  const completedBooks = completedBooksFiltered.length;
  const recordedDays = Object.keys(recordsByDay).length;

  const monthlyTotalSeconds = readingRecords
    .filter(r => {
      const d = new Date(r.date);
      return d.getFullYear() === calYear && d.getMonth() + 1 === calMonth;
    })
    .reduce((sum, r) => sum + (r.duration ?? 0), 0);
  const monthlyHours = Math.floor(monthlyTotalSeconds / 3600);
  const monthlyMinutes = Math.floor((monthlyTotalSeconds % 3600) / 60);

  const prevMonth = () => {
    if (calMonth === 1) { setCalYear(y => y - 1); setCalMonth(12); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 12) { setCalYear(y => y + 1); setCalMonth(1); }
    else setCalMonth(m => m + 1);
  };

  const isToday = (day) =>
    day === today.getDate() &&
    calMonth === today.getMonth() + 1 &&
    calYear === today.getFullYear();

  const bookshelfSubTabs = [
    { id: 'reading', label: `읽는중 ${readingBooksFiltered.length}` },
    { id: 'completed', label: `완독 ${completedBooksFiltered.length}` },
    { id: 'wantToRead', label: `읽고싶은 책 ${wantToReadBooks.length}` },
  ];

  const subTabTop = logoHeightAnim
    ? Animated.add(logoHeightAnim, insets.top + MAIN_TAB_HEIGHT)
    : insets.top + HEADER_HEIGHT;

  const contentPaddingTop = activeTab === 'bookshelf'
    ? insets.top + HEADER_HEIGHT + SUB_TAB_HEIGHT
    : insets.top + HEADER_HEIGHT;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingTop: contentPaddingTop }]}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'calendar' && (
          <>
            <View style={styles.statsCard}>
              <View style={styles.statsHeader}>
                <View style={styles.monthNav}>
                  <IconButton size={36} onPress={prevMonth}>
                    <ArrowLeftIcon color={Colors.gray700} />
                  </IconButton>
                  <Text style={styles.monthText}>{calYear}년 {calMonth}월</Text>
                  <IconButton size={36} onPress={nextMonth}>
                    <ArrowRightIcon color={Colors.gray700} />
                  </IconButton>
                </View>
                <Text style={styles.totalTime}>총 <Text style={styles.totalTimeValue}>{monthlyHours}시간 {monthlyMinutes}분</Text></Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statsRow}>
                {[
                  { value: `${totalBooks}권`, label: '총 읽은 책' },
                  { value: `${completedBooks}권`, label: '완독한 책' },
                  { value: `${recordedDays}일`, label: '기록' },
                ].map((s, i) => (
                  <View key={i} style={styles.statItem}>
                    <Text style={styles.statValue}>{s.value}</Text>
                    <Text style={styles.statLabel}>{s.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.calendar}>
              <View style={styles.week}>
                {DAY_LABELS.map(d => (
                  <View key={d} style={styles.dayHeaderCell}>
                    <Text style={styles.dayHeaderText}>{d}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.grid}>
                {calWeeks.map((week, wi) => (
                  <View key={wi} style={styles.week}>
                    {week.map((day, di) =>
                      day ? (
                        <CalendarDayCell
                          key={di}
                          day={day}
                          isToday={isToday(day)}
                          isFuture={(() => {
                            const dateStr = `${calYear}-${String(calMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                            return dateStr > todayStr;
                          })()}
                          cover={recordsByDay[day]?.[0]?.cover ?? null}
                          recordCount={recordsByDay[day]?.length ?? 0}
                          onPress={() => {
                            const dateStr = `${calYear}-${String(calMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                            if (dateStr > todayStr) return;
                            setSelectedDate(dateStr);
                            setSelectedRecord(recordsByDay[day] ?? []);
                          }}
                        />
                      ) : (
                        <View key={di} style={styles.emptyCell} />
                      )
                    )}
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        {activeTab === 'bookshelf' && (
          <View>

            {bookshelfSubTab === 'reading' && (
              readingBooksFiltered.length > 0 ? (
                <View>
                  {readingBooksFiltered.map((book, i) => {
                    const bookRecords = readingRecords.filter(r => r.isbn === book.isbn);
                    const lastRecord = [...bookRecords].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
                    const totalDuration = bookRecords.reduce((sum, r) => sum + (r.duration ?? 0), 0);
                    const readingDays = new Set(bookRecords.map(r => r.date)).size;
                    const totalPages = book.totalPages ?? 0;
                    const currentPage = book.currentPage ?? 0;
                    const pct = totalPages > 0 ? Math.min(100, Math.round((currentPage / totalPages) * 100)) : 0;
                    return (
                      <ReadingRecordCard
                        key={book.isbn}
                        book={book}
                        lastRecord={lastRecord}
                        totalDuration={totalDuration}
                        readingDays={readingDays}
                        pct={pct}
                        isLast={i === readingBooksFiltered.length - 1}
                        onPress={() => onBookPress && onBookPress(book)}
                        onReviewPress={() => onReviewPress && onReviewPress(book)}
                      />
                    );
                  })}
                </View>
              ) : (
                <EmptyState text="읽는 중인 책이 없어요" />
              )
            )}

            {bookshelfSubTab === 'completed' && (
              completedBooksFiltered.length > 0 ? (
                <>
                  <View style={styles.completedStatsCard}>
                    <View style={styles.completedStatItem}>
                      <Text style={styles.completedStatValue}>{formatDuration(completedTotalDuration)}</Text>
                      <Text style={styles.completedStatLabel}>총 독서 시간</Text>
                    </View>
                    <View style={styles.completedStatDivider} />
                    <View style={styles.completedStatItem}>
                      <Text style={styles.completedStatValue}>{completedBooksFiltered.length}권</Text>
                      <Text style={styles.completedStatLabel}>완독</Text>
                    </View>
                  </View>
                  <View style={styles.coverGrid}>
                    {completedBooksFiltered.map(book => (
                      <Pressable
                        key={book.isbn}
                        style={styles.coverGridItem}
                        onPress={() => setCompletedDetailBook(book)}
                      >
                        <Image
                          source={(book.coverImage ?? book.cover) ? { uri: book.coverImage ?? book.cover } : null}
                          style={styles.coverGridImage}
                          resizeMode="cover"
                        />
                      </Pressable>
                    ))}
                  </View>
                </>
              ) : (
                <EmptyState text="완독한 책이 없어요" />
              )
            )}

            {bookshelfSubTab === 'wantToRead' && (
              wantToReadBooks.length > 0 ? (
                <View style={styles.coverGrid}>
                  {wantToReadBooks.map(book => (
                    <Pressable
                      key={book.isbn}
                      style={styles.coverGridItem}
                      onPress={() => onBookPress && onBookPress(book)}
                    >
                      <Image
                        source={(book.coverImage ?? book.cover) ? { uri: book.coverImage ?? book.cover } : null}
                        style={styles.coverGridImage}
                        resizeMode="cover"
                      />
                    </Pressable>
                  ))}
                </View>
              ) : (
                <EmptyState text="읽고 싶은 책이 없어요" />
              )
            )}
          </View>
        )}
      </ScrollView>

      {activeTab === 'bookshelf' && (
        <Animated.View style={[styles.subTabFixed, { top: subTabTop }]}>
          <View style={styles.subTabRow}>
            {bookshelfSubTabs.map(tab => (
              <SubTab
                key={tab.id}
                active={bookshelfSubTab === tab.id}
                onPress={() => setBookshelfSubTab(tab.id)}
              >
                {tab.label}
              </SubTab>
            ))}
          </View>
          <View style={styles.subTabDivider} />
        </Animated.View>
      )}

      <CalendarRecordBottomSheet
        visible={selectedDate !== null}
        onClose={() => { setSelectedRecord(null); setSelectedDate(null); }}
        records={selectedRecord ?? []}
        date={selectedDate}
        readingBooks={readingBooks}
        readingRecords={readingRecords}
        onRecordPress={(record, book, readingDays) => {
          setSelectedRecord(null);
          setSelectedDate(null);
          setTimeout(() => setDetailItem({ record, book, readingDays }), 300);
        }}
        onAddRecord={() => {
          const date = selectedDate;
          setSelectedRecord(null);
          setSelectedDate(null);
          setTimeout(() => onAddRecord?.(date), 300);
        }}
      />

      <RecordDetailModal
        visible={!!detailItem}
        onClose={() => setDetailItem(null)}
        record={detailItem?.record}
        book={detailItem?.book}
        readingDays={detailItem?.readingDays ?? 1}
        hideTime={detailItem?.hideTime ?? false}
        onDelete={() => {
          onDeleteReadingRecord?.(detailItem?.record);
          setDetailItem(null);
        }}
        onEdit={(updated) => {
          onEditReadingRecord?.(updated);
          setDetailItem(prev => prev ? { ...prev, record: updated } : null);
        }}
      />

      <CompletedBookSheet
        visible={!!completedDetailBook}
        onClose={() => setCompletedDetailBook(null)}
        book={completedDetailBook}
        records={readingRecords.filter(r => r.isbn === completedDetailBook?.isbn)}
        onBookPress={(book) => onBookPress && onBookPress(book)}
        onRecordPress={(record, book, readingDays) => {
          setCompletedDetailBook(null);
          const bookRecords = readingRecords.filter(r => r.isbn === book?.isbn);
          const totalDuration = bookRecords.reduce((s, r) => s + (r.duration ?? 0), 0);
          const lastRecord = [...bookRecords].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
          const syntheticRecord = {
            ...record,
            createdAt: lastRecord?.createdAt ?? record?.createdAt,
            endPage: book?.totalPages ?? record?.endPage,
            startPage: 0,
            totalPages: book?.totalPages ?? record?.totalPages,
            duration: totalDuration,
          };
          setTimeout(() => setDetailItem({ record: syntheticRecord, book, readingDays, hideTime: true }), 300);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scrollView: { flex: 1 },
  content: { paddingBottom: 100 },

  statsCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    marginTop: Spacing.xs,
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.xxl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  monthText: {
    ...Typography.body1Medium,
    color: Colors.gray900,
  },
  totalTime: {
    ...Typography.body1Medium,
    color: Colors.gray700,
    marginRight: Spacing.md,
  },
  totalTimeValue: {
    ...Typography.headline2Bold,
    color: Colors.gray900,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray100,
    marginBottom: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    width: '33%',
  },
  statValue: {
    ...Typography.headline3Bold,
    color: Colors.gray900,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    ...Typography.body2Regular,
    color: Colors.gray700,
  },

  calendar: {
    paddingHorizontal: Spacing.md,
  },
  week: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  dayHeaderCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  dayHeaderText: {
    ...Typography.caption1Regular,
    color: Colors.gray500,
  },
  grid: {
    gap: Spacing.xs,
  },
  emptyCell: {
    flex: 1,
  },

  subTabFixed: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 5,
    backgroundColor: Colors.white,
  },
  subTabRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xs,
  },
  subTabDivider: {
    height: 1,
    backgroundColor: Colors.gray50,
  },
  bookList: {
    paddingHorizontal: Spacing.md,
  },

  // 완독 탭
  completedStatsCard: {
    flexDirection: 'row',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.xl,
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xl,
  },
  completedStatItem: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  completedStatDivider: {
    width: 1,
    backgroundColor: Colors.gray100,
    marginVertical: Spacing.xs,
  },
  completedStatValue: {
    ...Typography.headline3Bold,
    color: Colors.gray900,
  },
  completedStatLabel: {
    ...Typography.body2Regular,
    color: Colors.gray700,
  },
  coverGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
    marginTop: 20,
  },
  coverGridItem: {
    width: (Dimensions.get('window').width - Spacing.md * 2 - Spacing.md * 2) / 3,
    aspectRatio: 0.68,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  coverGridImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.sm,
    borderColor: Colors.gray50,
    borderWidth: 1,
  },
});
