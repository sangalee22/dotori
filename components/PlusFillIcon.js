import React from 'react';
import Svg, { Path } from 'react-native-svg';

/**
 * PlusFillIcon Component
 * @param {string} color - Icon color (default: #29252B)
 * @param {number} width - Icon width (default: 20)
 * @param {number} height - Icon height (default: 20)
 */
export default function PlusFillIcon({ color = '#29252B', width = 20, height = 20 }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 20 20" fill="none">
      <Path
        d="M10 1.66699C14.6024 1.66699 18.333 5.39763 18.333 10C18.333 14.6024 14.6024 18.333 10 18.333C5.39763 18.333 1.66699 14.6024 1.66699 10C1.66699 5.39763 5.39763 1.66699 10 1.66699Z"
        fill={color}
      />
      <Path
        d="M9.15005 6.07273C9.15005 5.60329 9.53065 5.22268 10.0001 5.22268C10.4695 5.22276 10.8501 5.60334 10.8501 6.07273L10.8495 9.15044H13.9279C14.3973 9.15047 14.7779 9.53107 14.7779 10.0005C14.7778 10.4698 14.3972 10.8505 13.9279 10.8505H10.8495V13.9289C10.8493 14.3982 10.4694 14.7782 10.0001 14.7783C9.53076 14.7783 9.15092 14.3982 9.15074 13.9289L9.15005 10.8498H6.07165C5.60229 10.8498 5.22243 10.4698 5.22229 10.0005C5.22229 9.53105 5.6022 9.15113 6.07165 9.15113L9.14936 9.15044L9.15005 6.07273Z"
        fill="white"
      />
    </Svg>
  );
}
