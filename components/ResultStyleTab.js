import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../styles';

/**
 * ResultStyleTab
 * @param {string}   label    - 표시할 라벨 ('Light', 'Dark', 'Style1' …)
 * @param {boolean}  selected - 선택 여부
 * @param {function} onPress  - 탭 선택 콜백
 */
export default function ResultStyleTab({ label, selected = false, onPress }) {
  return (
    <TouchableOpacity style={styles.wrapper} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.box, selected && styles.boxSelected]} />
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  box: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.gray100,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  boxSelected: {
    borderColor: Colors.primary500,
  },
  label: {
    ...Typography.body2Regular,
    color: Colors.gray600,
  },
  labelSelected: {
    ...Typography.body2Medium,
    color: Colors.gray900,
  },
});
