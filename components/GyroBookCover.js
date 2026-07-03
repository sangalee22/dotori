import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

let Accelerometer = null;
try { Accelerometer = require('expo-sensors').Accelerometer; } catch {}

export default function GyroBookCover({ children, range = 20 }) {
  const tiltX = useRef(new Animated.Value(0)).current;
  const tiltY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!Accelerometer) return;
    Accelerometer.setUpdateInterval(50);
    const sub = Accelerometer.addListener(({ x, y }) => {
      Animated.spring(tiltX, { toValue: x, useNativeDriver: false, damping: 18, stiffness: 70, mass: 0.6 }).start();
      Animated.spring(tiltY, { toValue: -y, useNativeDriver: false, damping: 18, stiffness: 70, mass: 0.6 }).start();
    });
    return () => sub.remove();
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
