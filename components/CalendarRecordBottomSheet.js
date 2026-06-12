import React from 'react';
import { Modal, View, Text, Image, StyleSheet, Pressable, Animated, ScrollView, Dimensions } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../styles';
import PopupHeader from './PopupHeader';
import Button from './Button';
import EmptyState from './EmptyState';

const SCREEN_HEIGHT = Dimensions.get('window').height;

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${y}년 ${parseInt(m)}월 ${parseInt(d)}일`;
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

function formatTime(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  const h = d.getHours();
  const min = String(d.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = String(h % 12 || 12).padStart(2, '0');
  return `${ampm} ${h12}:${min}`;
}

function RecordItem({ record, book, readingDays, isLast, onPress }) {
  const totalPages = record.totalPages ?? book?.totalPages ?? 0;
  const startPage = record.startPage ?? 0;
  const endPage = record.endPage ?? 0;

  const prevPct = totalPages > 0 ? Math.min(100, Math.round((startPage / totalPages) * 100)) : 0;
  const currPct = totalPages > 0 ? Math.min(100, Math.round((endPage / totalPages) * 100)) : 0;
  const addedPages = endPage - startPage;
  const addedPct = currPct - prevPct;

  return (
    <View>
      <Pressable style={styles.recordItem} onPress={onPress}>
        <View style={styles.cardTop}>
          <Image source={{ uri: book?.coverImage ?? book?.cover ?? record?.cover }} style={styles.cover} resizeMode="cover" />
          <View style={styles.info}>
            <Text style={styles.bookTitle} numberOfLines={2}>{(book?.title ?? record?.title)?.split(' - ')[0].trim()}</Text>
            <Text style={styles.author} numberOfLines={1}>{book?.author ?? ''}</Text>
            <Text style={styles.time}>{formatTime(record.createdAt)}</Text>
            <Text style={styles.duration}>{formatDuration(record.duration)}</Text>
          </View>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressBase, { width: `${currPct}%` }]} />
          <View style={[styles.progressIncrement, { width: `${prevPct}%` }]} />
        </View>
        <View style={styles.cardBottom}>
          <Text style={styles.pagesText}>+ {addedPages} pages · + {addedPct}%</Text>
          <Text style={styles.daysText}>{readingDays}일 동안 독서 했어요</Text>
        </View>
      </Pressable>
      {!isLast && <View style={styles.divider} />}
    </View>
  );
}

export default function CalendarRecordBottomSheet({ visible, onClose, records = [], date: dateProp, readingBooks = [], readingRecords = [], onRecordPress, onAddRecord }) {
  const translateY = React.useRef(new Animated.Value(300)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 50, friction: 10 }).start();
    } else {
      Animated.timing(translateY, { toValue: 300, duration: 200, useNativeDriver: true }).start();
    }
  }, [visible]);

  const date = dateProp ?? records[0]?.date;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.container}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          <PopupHeader title={formatDate(date)} />
          <View style={styles.listContent}>
            <ScrollView
              style={styles.listBox}
              contentContainerStyle={styles.listBoxContent}
              showsVerticalScrollIndicator={false}
            >
              {records.length > 0 ? (
                [...records].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((record, i) => {
                  const book = readingBooks.find(b => b.isbn === record.isbn);
                  const readingDays = new Set(
                    readingRecords.filter(r => r.isbn === record.isbn && r.date <= record.date).map(r => r.date)
                  ).size;
                  return (
                    <RecordItem
                      key={i}
                      record={record}
                      book={book}
                      readingDays={readingDays}
                      isLast={i === records.length - 1}
                      onPress={() => onRecordPress?.(record, book, readingDays)}
                    />
                  );
                })
              ) : (
                <EmptyState text="읽은 책이 없어요" />
              )}
            </ScrollView>
          </View>
          <View style={styles.buttonArea}>
            <Button variant="outline" size="xlarge" style={styles.addButton} onPress={onAddRecord}>
              기록 추가
            </Button>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  buttonArea: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.huge,
    alignItems: 'center',
  },
  listBox: {
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    maxHeight: SCREEN_HEIGHT * 0.8 - 146,
  },
  listBoxContent: {
    paddingVertical: Spacing.sm,
  },
  recordItem: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    gap: Spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray100,
    marginVertical: Spacing.sm,
    // marginHorizontal: Spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  cover: {
    width: 68.6,
    height: 100,
    borderRadius: 4.8,
    borderColor: Colors.gray100,
    borderWidth: 1,
  },
  info: {
    flex: 1,
    // gap: Spacing.xxs,
  },
  bookTitle: {
    ...Typography.body1Medium,
    color: Colors.gray900,

  },
  author: {
    ...Typography.body2Regular,
    color: Colors.gray500,
  },
  time: {
    ...Typography.body3Regular,
    color: Colors.gray700,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xxs,
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
  progressBase: {
    position: 'absolute',
    height: '100%',
    backgroundColor: Colors.primary400,
    borderRadius: 2,
  },
  progressIncrement: {
    position: 'absolute',
    height: '100%',
    backgroundColor: Colors.primary800,
    borderRadius: 2,
  },
  cardBottom: {
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
  addButton: {
    width: '100%',
    // maxWidth: 296,
    alignSelf: 'center',
  },
});
