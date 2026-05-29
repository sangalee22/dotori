import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius } from '../styles';

/**
 * Navigator Component (Pagination Dots)
 * @param {number} total - Total number of pages
 * @param {number} active - Active page index (0-based)
 * @param {object} style - Additional style overrides
 */
export default function Navigator({ total = 5, active = 0, style }) {
  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === active ? styles.activeDot : styles.inactiveDot,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  dot: {
    borderRadius: 4,
    backgroundColor: Colors.gray100,
  },
  activeDot: {
    width: 4,
    height: 4,
    backgroundColor: Colors.primary500,
  },
  inactiveDot: {
    width: 3,
    height: 3,
  },
});
