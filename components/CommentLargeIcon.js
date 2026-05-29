import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function CommentLargeIcon({ width = 60, height = 60, color = '#61487F' }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 60 60" fill="none">
      <Path
        opacity="0.1"
        d="M28.5786 14.6804L28.2749 15.533L23.061 30.1804H28.312V45.3191H13.4038V32.0095L13.4468 31.8982L19.938 15.0896L20.0962 14.6804H28.5786ZM46.8618 14.6804L46.5591 15.533L41.3452 30.1804H46.5952V45.3191H31.5796V32.0095L31.6226 31.8982L38.1138 15.0896L38.271 14.6804H46.8618Z"
        stroke={color}
        strokeWidth="1.2766"
      />
    </Svg>
  );
}
