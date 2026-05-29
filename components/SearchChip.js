import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, BorderRadius, Spacing } from '../styles';
import DeleteIcon from './DeleteIcon';

/**
 * SearchChip Component
 * Displays a search term chip with a remove button
 */
export default function SearchChip({ text, onRemove, onPress }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPress} style={styles.textButton}>
        <Text style={styles.text}>{text}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onRemove} style={styles.closeButton}>
        <DeleteIcon width={16} height={16} color={Colors.gray300} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.xl,
    paddingLeft: Spacing.md,
    paddingRight: 0,
    gap: 2,
  },
  textButton: {
    paddingVertical: 6,
  },
  text: {
    ...Typography.body2Regular,
    color: Colors.gray900,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
