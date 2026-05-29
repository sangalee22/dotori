import React from 'react';
import Svg, { Rect } from 'react-native-svg';

export default function RadioIcon({ selected = false, size = 24 }) {
  if (selected) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="6" y="6" width="12" height="12" rx="6" fill="#663FC0" />
        <Rect x="2.85" y="2.85" width="18.3" height="18.3" rx="9.15" stroke="#663FC0" strokeWidth="1.7" />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2.85" y="2.85" width="18.3" height="18.3" rx="9.15" stroke="#A3A1A9" strokeWidth="1.7" />
    </Svg>
  );
}
