import React from 'react';
import Svg, { Rect, Path, G } from 'react-native-svg';

export default function CalendarIcon({ width = 24, height = 24, color = '#000000' }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Rect x="3.666" y="6.545" width="16.668" height="5" fill={color} />
      <Rect x="3.666" y="13.237" width="16.668" height="8.762" fill={color} />
      <G>
        <Rect x="6.726" y="4.002" width="2" height="5.2" rx="1" fill={color} />
        <Rect x="15.275" y="4.002" width="2" height="5.2" rx="1" fill={color} />
      </G>
    </Svg>
  );
}
