import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function ArrowRightIcon({ width = 24, height = 24, color = '#6A6670' }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15.3853 7.10247C15.7172 6.77054 16.2545 6.77053 16.5864 7.10247L20.2778 10.7929C21.8842 12.3992 20.7466 15.1461 18.4751 15.1464H3.81982C3.35038 15.1464 2.97021 14.7653 2.97021 14.2958C2.97034 13.8265 3.35046 13.4462 3.81982 13.4462H18.4751C19.2321 13.4459 19.6111 12.5304 19.0757 11.995L15.3853 8.30364C15.0533 7.97169 15.0533 7.43441 15.3853 7.10247Z"
        fill={color}
      />
    </Svg>
  );
}
