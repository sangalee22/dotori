import React from 'react';
import Svg, { Path } from 'react-native-svg';

/**
 * HeartIcon Component
 * @param {string} color - Icon color (default: #C0BEC5)
 * @param {number} width - Icon width (default: 20)
 * @param {number} height - Icon height (default: 20)
 */
export default function HeartIcon({ color = '#C0BEC5', width = 20, height = 20 }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 20 20" fill="none">
      <Path
        d="M1.66699 7.61416C1.66699 11.6667 5.01699 13.8258 7.46866 15.7592C8.33366 16.4408 9.16699 17.0833 10.0003 17.0833C10.8337 17.0833 11.667 16.4417 12.532 15.7583C14.9845 13.8267 18.3337 11.6667 18.3337 7.61499C18.3337 3.56333 13.7503 0.687492 10.0003 4.58416C6.25033 0.687492 1.66699 3.56166 1.66699 7.61416Z"
        fill={color}
      />
    </Svg>
  );
}
