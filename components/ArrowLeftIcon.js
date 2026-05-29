import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function ArrowLeftIcon({ width = 24, height = 24, color = '#6A6670' }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8.61472 7.10247C8.28277 6.77054 7.74547 6.77053 7.41352 7.10247L3.72204 10.7929C2.11567 12.3992 3.25322 15.1461 5.52481 15.1464H20.1804C20.6499 15.1464 21.03 14.7653 21.03 14.2958C21.0299 13.8265 20.6498 13.4462 20.1804 13.4462H5.52481C4.76779 13.4459 4.38882 12.5304 4.92421 11.995L8.61472 8.30364C8.94668 7.97169 8.94667 7.43441 8.61472 7.10247Z"
        fill={color}
      />
    </Svg>
  );
}
