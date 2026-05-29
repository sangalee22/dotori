import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../styles';

/**
 * SubTab Component
 * Sub-navigation tab element with active/inactive states
 * @param {boolean} active - Whether the tab is currently active
 * @param {function} onPress - Callback when tab is pressed
 * @param {string} children - Tab label text
 * @param {object} style - Additional style overrides
 */
export default function SubTab({ active = false, onPress, children, style }) {
  return (
    <TouchableOpacity
      style={[styles.container, active && styles.containerActive, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.text,
          active && styles.textActive,
        ]}
      >
        {children}
      </Text>
      {active && <View style={styles.divider} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  containerActive: {
    paddingBottom: 0,
  },
  text: {
    ...Typography.subtitle1Medium,
    color: Colors.gray500,
    textAlign: 'center',
  },
  textActive: {
    color: Colors.gray900,
  },
  divider: {
    width: '100%',
    height: 4,
    backgroundColor: Colors.primary500,
    marginTop: Spacing.sm,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
});
