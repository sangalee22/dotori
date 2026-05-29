import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../styles';
import Svg, { Path, Rect } from 'react-native-svg';

/**
 * Checkbox Component
 * @param {boolean} checked - Whether checkbox is checked
 * @param {function} onPress - Callback when checkbox is pressed
 * @param {string} label - Label text to display next to checkbox
 * @param {boolean} disabled - Whether checkbox is disabled
 * @param {object} style - Additional style overrides
 * @param {object} labelStyle - Additional label style overrides
 */
export default function Checkbox({
  checked = false,
  onPress,
  label = '',
  disabled = false,
  style,
  labelStyle
}) {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {/* Checkbox Icon */}
      <View style={styles.iconContainer}>
        {checked ? (
          // Checked state
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Rect
              x={2}
              y={2}
              width={20}
              height={20}
              rx={7}
              fill={Colors.primary500}
            />
            <Path
              d="M7 12.5L10.5 16L17 9"
              stroke={Colors.white}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        ) : (
          // Unchecked state
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Rect
              x={2.85}
              y={2.85}
              width={18.3}
              height={18.3}
              rx={7}
              stroke={Colors.gray400}
              strokeWidth={1.7}
            />
          </Svg>
        )}
      </View>

      {/* Label */}
      {label ? (
        <Text style={[styles.label, labelStyle]}>{label}</Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: Spacing.xs, // 4px
    minHeight: 40,
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontFamily: 'MinSans-Regular',
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: -0.045,
    lineHeight: 24,
    color: Colors.gray900,
  },
});
