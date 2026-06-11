import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, Platform } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../styles';

export default function Toast({ visible, message, style, requestId }) {
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(20)).current;
  const everShownRef = useRef(false);

  useEffect(() => {
    if (visible) {
      everShownRef.current = true;
      opacity.stopAnimation();
      translateY.stopAnimation();
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: Platform.OS !== 'web' }),
      ]).start();
    } else if (everShownRef.current) {
      opacity.stopAnimation();
      translateY.stopAnimation();
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(translateY, { toValue: 20, duration: 300, useNativeDriver: Platform.OS !== 'web' }),
      ]).start();
    }
  }, [visible, requestId]);

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
    marginLeft: -150,
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
