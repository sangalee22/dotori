import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../styles';

/**
 * Button Component
 * @param {string} variant - 'primary' | 'default' | 'text' | 'outline' | 'sub'
 * @param {string} size - 'small' (28) | 'medium' (32) | 'large' (40) | 'xlarge' (48) | 'xxlarge' (52)
 * @param {function} onPress - Press handler
 * @param {ReactNode} children - Button text or content
 * @param {boolean} disabled - Disabled state
 * @param {object} style - Additional style overrides
 */
export default function Button({
  variant = 'primary',
  size = 'medium',
  onPress,
  children,
  disabled = false,
  style,
  textStyle,
  ...props
}) {
  const sizeStyles = {
    small: styles.sizeSmall,
    medium: styles.sizeMedium,
    large: styles.sizeLarge,
    xlarge: styles.sizeXLarge,
    xxlarge: styles.sizeXXLarge,
  };

  const variantStyles = {
    primary: styles.variantPrimary,
    default: styles.variantDefault,
    text: styles.variantText,
    outline: styles.variantOutline,
    sub: styles.variantSub,
  };

  const pressedStyles = {
    primary: styles.pressedPrimary,
    default: styles.pressedDefault,
    text: styles.pressedText,
    outline: styles.pressedOutline,
    sub: styles.pressedSub,
  };

  const textSizeStyles = {
    small: styles.textSmall,
    medium: styles.textMedium,
    large: styles.textLarge,
    xlarge: styles.textXLarge,
    xxlarge: styles.textXXLarge,
  };

  const textVariantStyles = {
    primary: styles.textPrimary,
    default: styles.textDefault,
    text: styles.textOnly,
    outline: styles.textOutline,
    sub: styles.textSub,
  };

  const textPressedStyles = {
    text: styles.textPressed,
  };

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.button,
        sizeStyles[size],
        variantStyles[variant],
        disabled && styles.disabled,
        pressed && !disabled && pressedStyles[variant],
        pressed && !disabled && variant !== 'text' && { transform: [{ translateY: 3 }] },
        style,
      ]}
      {...props}
    >
      {({ pressed }) =>
        typeof children === 'string' ? (
          <Text
            style={[
              styles.text,
              textSizeStyles[size],
              textVariantStyles[variant],
              disabled && styles.textDisabled,
              pressed && !disabled && textPressedStyles[variant],
              textStyle,
            ]}
          >
            {children}
          </Text>
        ) : (
          children
        )
      }
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },

  // Size variants
  sizeSmall: {
    height: 32,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  sizeMedium: {
    height: 36,
    paddingHorizontal: Spacing.md,
    borderRadius: 14,
  },
  sizeLarge: {
    height: 40,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  sizeXLarge: {
    height: 48,
    paddingHorizontal: Spacing.lg,
    borderRadius: 18,
  },
  sizeXXLarge: {
    height: 52,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xl,
    maxWidth: 296,
    alignSelf: 'center',
    width: '100%',
  },

  // Variant styles
  variantPrimary: {
    backgroundColor: Colors.primary500,
  },
  variantDefault: {
    backgroundColor: Colors.gray100,
  },
  variantText: {
    backgroundColor: 'transparent',
  },
  variantOutline: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary600,
  },
  variantSub: {
    backgroundColor: Colors.gray100,
  },

  // Disabled state
  disabled: {
    backgroundColor: Colors.gray100,
  },

  // Pressed states
  pressedPrimary: {
    backgroundColor: Colors.primary600,
  },
  pressedDefault: {
    backgroundColor: Colors.primary600,
  },
  pressedSub: {
    backgroundColor: Colors.gray200,
  },
  pressedOutline: {
    backgroundColor: Colors.gray50,
  },
  pressedText: {
    backgroundColor: 'transparent',
  },

  // Text styles
  text: {
    textAlign: 'center',
  },
  textSmall: {
    ...Typography.body2Regular,
  },
  textMedium: {
    ...Typography.body2Regular,
  },
  textLarge: {
    ...Typography.body1Medium,
  },
  textXLarge: {
    ...Typography.subtitle1Medium,
  },
  textXXLarge: {
    ...Typography.headline3Medium,
  },

  // Text color variants
  textPrimary: {
    color: Colors.white,
  },
  textDefault: {
    color: Colors.gray900,
  },
  textOnly: {
    color: Colors.primary500,
  },
  textOutline: {
    color: Colors.gray900,
  },
  textSub: {
    color: Colors.gray900,
  },
  textDisabled: {
    color: Colors.gray400,
  },
  textPressed: {
    color: Colors.gray500,
  },
});
