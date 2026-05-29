import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../styles';

/**
 * TabElement Component
 * @param {boolean} active - Whether the tab is active
 * @param {function} onPress - Press handler
 * @param {ReactNode} children - Tab text
 * @param {object} style - Additional style overrides
 */
export default function TabElement({ active = false, onPress, children, style }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.tab,
        active && styles.tabActive,
        style,
      ]}
    >
      <Text style={[
        styles.tabText,
        active && styles.tabTextActive,
      ]}>
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tab: {
    height: 36,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.gray50,
  },
  tabActive: {
    backgroundColor: Colors.primary500,
  },
  tabText: {
    ...Typography.body1Regular,
    color: Colors.gray900,
  },
  tabTextActive: {
    ...Typography.body1ExtraBold,
    color: Colors.white,
  },
});
