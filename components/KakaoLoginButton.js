import React from 'react';
import Svg, { Rect, Path, G, Defs, ClipPath } from 'react-native-svg';

export default function KakaoLoginButton({ width = 56, height = 56 }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 56 56" fill="none">
      <Rect width="56" height="56" rx="28" fill="#FAE100"/>
      <G clipPath="url(#clip0_11_1580)">
        <Path d="M28 18C21.9246 18 17 21.8469 17 26.5968C17 29.6891 19.0852 32.3982 22.2191 33.9132C21.9877 34.7628 21.3838 36.9877 21.2636 37.4779C21.1164 38.072 21.4829 38.072 21.7263 37.9026L25.9568 35.048C26.6334 35.1459 27.3162 35.1955 28 35.1965C34.0754 35.1965 39 31.3348 39 26.5968C39 21.8587 34.0694 18 28 18Z" fill="#381E1F"/>
      </G>
      <Defs>
        <ClipPath id="clip0_11_1580">
          <Rect width="22" height="22" fill="white" transform="translate(17 17)"/>
        </ClipPath>
      </Defs>
    </Svg>
  );
}
