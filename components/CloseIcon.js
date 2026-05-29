import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../styles';

/**
 * CloseIcon Component
 * X icon for closing/removing items
 */
export default function CloseIcon({ width = 24, height = 24, color = Colors.gray700 }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.3994 6.39935C16.7313 6.0674 17.2686 6.0674 17.6005 6.39935C17.9324 6.7313 17.9324 7.2686 17.6005 7.60052L13.2011 11.9999L17.6005 16.3994C17.9324 16.7313 17.9324 17.2686 17.6005 17.6005C17.2686 17.9324 16.7313 17.9324 16.3994 17.6005L11.9999 13.2011L7.60052 17.6005C7.2686 17.9324 6.7313 17.9324 6.39935 17.6005C6.0674 17.2686 6.0674 16.7313 6.39935 16.3994L10.7988 11.9999L6.39935 7.60052C6.0674 7.26858 6.0674 6.7313 6.39935 6.39935C6.7313 6.0674 7.26858 6.0674 7.60052 6.39935L11.9999 10.7988L16.3994 6.39935Z"
        fill={color}
      />
    </Svg>
  );
}
