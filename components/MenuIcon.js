import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function MenuIcon({ width = 24, height = 24, color = '#3D3941' }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 12H21M3 6H21M3 18H21"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
