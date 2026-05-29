import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function PlusIcon({ width = 24, height = 24, color = '#000000' }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 5.52539V18.4754M5.52539 12H18.4754"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
