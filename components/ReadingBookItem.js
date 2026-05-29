import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../styles';
import ArrowRightIcon from './ArrowRightIcon';

export default function ReadingBookItem({ title, author, coverImage, progress = 0, onPress }) {
  const cleanTitle = title?.split(' - ')[0].trim();
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.coverWrapper}>
        <Image
          source={coverImage ? { uri: coverImage } : null}
          style={styles.cover}
          resizeMode="cover"
        />
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{cleanTitle}</Text>
        <Text style={styles.author} numberOfLines={1}>{author}</Text>
      </View>
      <ArrowRightIcon color={Colors.gray400} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  coverWrapper: {
    gap: Spacing.xs,
  },
  cover: {
    width: 41.2,
    height: 60,
    borderRadius: 3,
    backgroundColor: Colors.gray100,
    borderColor: Colors.gray100,
    borderWidth: 1,
  },
  progressBar: {
    width: 41.2,
    height: 4,
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.huge,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary800,
    borderRadius: BorderRadius.huge,
  },
  info: {
    flex: 1,
    gap: Spacing.xxs,
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.body1Medium,
    color: Colors.gray900,
  },
  author: {
    ...Typography.body2Regular,
    color: Colors.gray500,
  },
});
