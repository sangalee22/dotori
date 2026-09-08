import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export default function GyroBookCover({ children, range = 20 }) {
  const tiltX = useRef(new Animated.Value(0)).current;
  const tiltY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const { requireOptionalNativeModule } = require('expo-modules-core');
    if (!requireOptionalNativeModule('ExponentAccelerometer')) return;
    let sub;
    try {
      const Accelerometer = require('expo-sensors/build/Accelerometer').default;
      Accelerometer.setUpdateInterval(50);
      sub = Accelerometer.addListener(({ x, y }) => {
        Animated.spring(tiltX, { toValue: x, useNativeDriver: false, damping: 18, stiffness: 70, mass: 0.6 }).start();
        Animated.spring(tiltY, { toValue: -y, useNativeDriver: false, damping: 18, stiffness: 70, mass: 0.6 }).start();
      });
    } catch {}
    return () => sub?.remove();
  }, []);

  return (
    <Animated.View style={{
      transform: [
        { translateX: tiltX.interpolate({ inputRange: [-1, 1], outputRange: [-range, range] }) },
        { translateY: tiltY.interpolate({ inputRange: [-1, 1], outputRange: [-range, range] }) },
      ],
    }}>
      {children}
    </Animated.View>
  );
}
