import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../styles';

const SIZE = {
  m: { height: 8, fillColor: Colors.primary500, trackColor: Colors.gray100 },
  s: { height: 4, fillColor: Colors.primary800, trackColor: Colors.gray100 },
};

export default function ProgressBar({
  size = 'm',
  progress = 0,
  leftLabel,
  rightLabel,
  trackColor: trackColorProp,
  style,
}) {
  const { height, fillColor, trackColor: defaultTrackColor } = SIZE[size] ?? SIZE.m;
  const trackColor = trackColorProp ?? defaultTrackColor;
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <View style={[styles.wrap, style]}>
      <View style={[styles.track, { height, backgroundColor: trackColor, borderRadius: height / 2 }]}>
        <View
          style={[
            styles.fill,
            { width: `${clampedProgress}%`, backgroundColor: fillColor, borderRadius: height / 2 },
          ]}
        />
      </View>
      {(leftLabel != null || rightLabel != null) && (
        <View style={styles.labels}>
          {leftLabel != null && (
            typeof leftLabel === 'string'
              ? <Text style={styles.label}>{leftLabel}</Text>
              : leftLabel
          )}
          {rightLabel != null && (
            typeof rightLabel === 'string'
              ? <Text style={styles.label}>{rightLabel}</Text>
              : rightLabel
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  track: {
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  fill: {
    height: '100%',
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    ...Typography.body2Regular,
    color: Colors.gray600,
  },
});
