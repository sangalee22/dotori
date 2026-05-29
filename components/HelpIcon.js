import React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

export default function HelpIcon({ width = 20, height = 36, color = '#C0BEC5' }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 20 36" fill="none">
      <Rect
        x={3.85}
        y={11.85}
        width={12.3}
        height={12.3}
        rx={6.15}
        stroke={color}
        strokeWidth={1.7}
      />
      <Path
        d="M9.31802 20.1277L9 13.5H11L10.682 20.1277H9.31802ZM9.40204 22.5V21.1671H10.6859V22.5H9.40204Z"
        fill={color}
      />
    </Svg>
  );
}
