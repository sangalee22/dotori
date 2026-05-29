import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../styles';

/**
 * CalendarDayCell Component
 * 4 states:
 *  - 기본        : day, isToday=false, cover=null
 *  - 오늘        : day, isToday=true,  cover=null
 *  - 기록됨      : day, isToday=false, cover=uri
 *  - 기록된 오늘 : day, isToday=true,  cover=uri
 */
export default function CalendarDayCell({ day, isToday = false, isFuture = false, cover = null, recordCount = 1, onPress }) {
  const hasRecord = !!cover;

  return (
    <Pressable
      style={[styles.cell, hasRecord && styles.cellRecorded]}
      onPress={onPress}
    >
      <View style={[styles.dateCircle, isToday && styles.dateCircleToday]}>
        <Text style={[styles.dateText, hasRecord && styles.dateTextRecorded, isToday && styles.dateTextToday, isFuture && styles.dateTextFuture]}>{day}</Text>
      </View>
      <View style={styles.coverWrapper}>
        {hasRecord ? (
          <Image source={{ uri: cover }} style={styles.cover} resizeMode="cover" />
        ) : (
          <View style={styles.cover} />
        )}
        {hasRecord && recordCount >= 2 && (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{recordCount}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    alignItems: 'center',
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.sm,
    gap: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  cellRecorded: {
    backgroundColor: Colors.gray50,
  },
  dateCircle: {
    width: 22,
    height: 22,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCircleToday: {
    backgroundColor: Colors.primary500,
  },
  dateText: {
    ...Typography.body3ExtraBold,
    color: Colors.gray600,
  },
  dateTextRecorded: {
    color: Colors.gray900,
  },
  dateTextToday: {
    color: Colors.white,
  },
  dateTextFuture: {
    color: Colors.gray400,
  },
  coverWrapper: {
    position: 'relative',
    width: 27.5,
    height: 40,
  },
  cover: {
    width: 27.5,
    height: 40,
    borderRadius: 2,
  },
  countBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeText: {
    fontSize: 9,
    color: Colors.white,
    lineHeight: 12,
  },
});
