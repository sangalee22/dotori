import React from 'react';
import Svg, { Path } from 'react-native-svg';

/**
 * CheckIcon Component
 * Checkmark icon
 */
export default function CheckIcon({ width = 16, height = 16, color = '#B284E7' }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 16 16" fill="none">
      <Path
        d="M12.952 4.24802C13.1833 4.0373 13.5413 4.05386 13.7521 4.28513C13.9628 4.51646 13.9462 4.8745 13.715 5.08526L7.12839 11.0853C6.91144 11.2829 6.57951 11.2825 6.36341 11.084L2.28333 7.33396C2.05293 7.12219 2.03775 6.7636 2.24948 6.53318C2.46125 6.30278 2.81984 6.2876 3.05026 6.49933L6.74883 9.89841L12.952 4.24802Z"
        fill={color}
      />
    </Svg>
  );
}
