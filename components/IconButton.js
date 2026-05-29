import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { BorderRadius } from '../styles';

// Size configuration based on Figma design
const SIZE_CONFIG = {
  28: { iconSize: 20, borderRadius: BorderRadius.md },
  36: { iconSize: 20, borderRadius: 14 },
  40: { iconSize: 24, borderRadius: 15 },
  48: { iconSize: 24, borderRadius: 18 },
  52: { iconSize: 24, borderRadius: BorderRadius.xl },
};

export default function IconButton({ children, onPress, size = 48, width, height, style: externalStyle, ...props }) {
  const config = SIZE_CONFIG[size] || SIZE_CONFIG[48];

  // Use custom width/height if provided, otherwise use size
  const buttonWidth = width || size;
  const buttonHeight = height || size;

  // Clone children and inject size props if the child accepts them
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      // Only inject size props if they're not already specified
      const childProps = {};
      if (child.props.width === undefined) {
        childProps.width = config.iconSize;
      }
      if (child.props.height === undefined) {
        childProps.height = config.iconSize;
      }
      return Object.keys(childProps).length > 0 ? React.cloneElement(child, childProps) : child;
    }
    return child;
  });

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          width: buttonWidth,
          height: buttonHeight,
          borderRadius: config.borderRadius,
        },
        externalStyle,
        pressed && styles.pressed,
      ]}
      {...props}
    >
      {childrenWithProps}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
});
