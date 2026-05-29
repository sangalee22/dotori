import React from 'react';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '../styles';

/**
 * UserIcon Component
 * Simple user icon with circle
 */
export default function UserIcon({ width = 48, height = 48, color = Colors.gray400 }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 48 48" fill="none">
      <Circle
        cx="24"
        cy="20.377"
        r="8.5295"
        fill={color}
      />
    </Svg>
  );
}
