import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function PlayIcon({ width = 24, height = 24, color = 'white' }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17.415 11.1799C17.9852 11.5779 17.9852 12.422 17.415 12.8199L7.98333 19.4031C7.32043 19.8658 6.41098 19.3915 6.41098 18.5831L6.41098 5.41675C6.41098 4.60835 7.32043 4.13405 7.98333 4.59675L17.415 11.1799Z"
        fill={color}
      />
    </Svg>
  );
}
