import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function MypagePin({ width = 10, height = 5, color = '#61487F' }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 10 5" fill="none">
      <Path d="M0 5V0L10 5H0Z" fill={color} />
    </Svg>
  );
}
