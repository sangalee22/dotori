import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function CommentIcon({ width = 20, height = 20, color = '#61487F' }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 40 40" fill="none">
      <Path
        opacity="0.1"
        d="M18.576 4.68048L18.2723 5.53302L13.0584 20.1805H18.3094V35.3192H3.40118V22.0096L3.44415 21.8983L9.93536 5.08966L10.0936 4.68048H18.576ZM36.8592 4.68048L36.5565 5.53302L31.3426 20.1805H36.5926V35.3192H21.577V22.0096L21.6199 21.8983L28.1111 5.08966L28.2684 4.68048H36.8592Z"
        stroke={color}
        strokeWidth="1.2766"
      />
    </Svg>
  );
}
