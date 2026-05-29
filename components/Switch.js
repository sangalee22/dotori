import React from 'react';
import { Pressable, Animated, StyleSheet } from 'react-native';
import { Colors } from '../styles';

export default function Switch({ value = false, onValueChange, disabled = false }) {
  const translateX = React.useRef(new Animated.Value(value ? 20 : 0)).current;

  React.useEffect(() => {
    Animated.timing(translateX, {
      toValue: value ? 20 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [value, translateX]);

  const handlePress = () => {
    if (!disabled && onValueChange) {
      onValueChange(!value);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.track,
        value ? styles.trackActive : styles.trackInactive,
        disabled && styles.trackDisabled,
      ]}
      disabled={disabled}
    >
      <Animated.View
        style={[
          styles.thumb,
          {
            transform: [{ translateX }],
          },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 44,
    height: 24,
    borderRadius: 100,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  trackActive: {
    backgroundColor: Colors.primary500,
  },
  trackInactive: {
    backgroundColor: Colors.gray50,
  },
  trackDisabled: {
    opacity: 0.5,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 100,
    backgroundColor: Colors.white,
      shadowColor: '#272727',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2, // for Android
  },
});
