import React from 'react';
import Svg, { Path } from 'react-native-svg';

/**
 * ChevronDownIcon Component
 * Downward pointing chevron icon
 */
export default function ChevronDownIcon({ width = 24, height = 24, color = '#6A6670' }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 10L12 16L6 10"
        stroke={color}
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
