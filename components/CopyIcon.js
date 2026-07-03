import React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';
import { Colors } from '../styles';

export default function CopyIcon({ width = 24, height = 24, color = Colors.gray700 }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Rect x="9" y="9" width="11" height="11" rx="2" stroke={color} strokeWidth="1.5" />
      <Path
        d="M15 9V7C15 5.89543 14.1046 5 13 5H7C5.89543 5 5 5.89543 5 7V13C5 14.1046 5.89543 15 7 15H9"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}
