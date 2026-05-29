import React from 'react';
import Svg, { Path } from 'react-native-svg';

/**
 * CommentIconNew Component
 * @param {string} color - Icon color (default: #C0BEC5)
 * @param {number} width - Icon width (default: 20)
 * @param {number} height - Icon height (default: 20)
 */
export default function CommentIconNew({ color = '#C0BEC5', width = 20, height = 20 }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 20 20" fill="none">
      <Path
        d="M2.5 6.29684C2.5 4.45589 3.99238 2.9635 5.83333 2.9635H14.1667C16.0076 2.9635 17.5 4.45589 17.5 6.29683V10.7116C17.5 12.5526 16.0076 14.045 14.1667 14.045H10.5369L9.42003 15.8971C9.10241 16.4238 8.34315 16.4367 8.00781 15.9211L6.78769 14.045H5.83333C3.99238 14.045 2.5 12.5526 2.5 10.7116V6.29684Z"
        fill={color}
      />
    </Svg>
  );
}
