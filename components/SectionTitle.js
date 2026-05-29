import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../styles';

/**
 * SectionTitle Component
 * @param {ReactNode} children - Section title text
 * @param {number|string} count - Optional count to display on the right
 * @param {object} style - Additional style overrides
 */
export default function SectionTitle({ children, count, style }) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{children}</Text>
      {count !== undefined && count !== null && (
        <Text style={styles.count}>{count}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    height: 32,
    paddingLeft: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  title: {
    ...Typography.headline3Medium,
    color: Colors.gray900,
  },
  count: {
    ...Typography.body1ExtraBold,
    color: Colors.primary900,
    marginTop: 2,
  },
});
