import React, { useEffect } from 'react';
import { Animated, StyleSheet, Text, Platform } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../styles';

/**
 * Toast Component
 * @param {boolean} visible - Whether the toast is visible
 * @param {string} message - Toast message
 * @param {number} duration - Duration in milliseconds (default: 2000)
 * @param {function} onHide - Callback when toast hides
 * @param {object} style - Additional style overrides
 */
export default function Toast({ visible, message, duration = 2000, onHide, style }) {
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(translateY, {
            toValue: 20,
            duration: 300,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]).start(() => {
          if (onHide) onHide();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, onHide]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }],
          pointerEvents: visible ? 'auto' : 'none',
        },
        style,
      ]}
    >
      <Animated.View style={styles.inner}>
        <Text style={styles.message}>{message}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    left: '50%',
    marginLeft: -150, // Half of width (300px / 2)
    width: 300,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    elevation: 999,
    zIndex: 9999,
  },
  inner: {
    backgroundColor: Colors.primary900,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  message: {
    ...Typography.body1Medium,
    color: Colors.white,
    textAlign: 'center',
  },
});
