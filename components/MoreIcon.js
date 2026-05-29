import React from 'react';
import Svg, { Circle } from 'react-native-svg';

export default function MoreIcon({ width = 24, height = 24, color = '#3D3941' }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Circle cx="6" cy="12" r="1.5" fill={color} />
      <Circle cx="12" cy="12" r="1.5" fill={color} />
      <Circle cx="18" cy="12" r="1.5" fill={color} />
    </Svg>
  );
}
