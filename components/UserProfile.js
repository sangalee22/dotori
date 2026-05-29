import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { BorderRadius, Colors } from '../styles';

/**
 * UserProfile Component
 * @param {string} imageUri - User profile image URL
 * @param {number} size - Profile size: 28, 32, 40, or 48 (default: 32)
 * @param {object} style - Additional style overrides
 */
export default function UserProfile({
  imageUri,
  size = 32,
  style,
}) {
  const sizeStyle = sizeStyles[size] || sizeStyles[32];
  const iconScale = size / 24; // Scale SVG based on size

  return (
    <View style={[styles.container, sizeStyle.container, style]}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image} />
      ) : (
        <View style={styles.placeholder}>
          <Svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
          >
            <Circle cx="12" cy="9.45349" r="4.26477" fill={Colors.gray600} />
            <Path
              d="M4.89717 18.2969C5.89377 16.2116 7.9995 14.8841 10.3107 14.8841H13.6892C16.0004 14.8841 18.1061 16.2116 19.1027 18.2969L21.8284 24H2.17151L4.89717 18.2969Z"
              fill={Colors.gray600}
            />
          </Svg>
        </View>
      )}
    </View>
  );
}

const sizeStyles = {
  28: StyleSheet.create({
    container: {
      width: 28,
      height: 28,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: Colors.gray100,
    },
    iconCircle: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
  }),
  32: StyleSheet.create({
    container: {
      width: 32,
      height: 32,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: Colors.gray100,
    },
    iconCircle: {
      width: 11.4,
      height: 11.4,
      borderRadius: 5.7,
    },
  }),
  40: StyleSheet.create({
    container: {
      width: 40,
      height: 40,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: Colors.gray100,
    },
    iconCircle: {
      width: 14.2,
      height: 14.2,
      borderRadius: 7.1,
    },
  }),
  48: StyleSheet.create({
    container: {
      width: 48,
      height: 48,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: Colors.gray100,
    },
    iconCircle: {
      width: 17,
      height: 17,
      borderRadius: 8.5,
    },
  }),
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderColor: Colors.gray100,
    backgroundColor: Colors.white,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: Colors.gray100,
    backgroundColor: Colors.white,
  },
});
