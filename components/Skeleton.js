import React from 'react';
import { Animated } from 'react-native';
import { Colors } from '../styles';

export default function Skeleton({ width, height = 16, borderRadius = 6, style }) {
  const opacity = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { backgroundColor: Colors.gray200, width, height, borderRadius, opacity },
        style,
      ]}
    />
  );
}
