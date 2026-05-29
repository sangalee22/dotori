import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography } from '../styles';
import { Spacing } from '../styles/spacing';
import RadioIcon from './RadioIcon';

export default function RadioItem({ label, selected = false, onPress }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <RadioIcon selected={selected} />
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  label: {
    ...Typography.body1Regular,
    color: Colors.gray900,
  },
});
