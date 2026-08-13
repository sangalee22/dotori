import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../styles';

const ICON_SIZE = { small: 20, medium: 20, large: 20, xlarge: 20, xxlarge: 20 };
const ICON_GAP  = { small: Spacing.xs, medium: Spacing.xs, large: Spacing.xs, xlarge: Spacing.xs, xxlarge: Spacing.xs };

const ICON_COLOR = {
  primary: Colors.white,
  default: Colors.gray900,
  text:    Colors.primary500,
  outline: Colors.gray900,
  sub:     Colors.gray900,
  subline: Colors.gray900,
};

/**
 * Button Component
 * @param {string} variant - 'primary' | 'default' | 'text' | 'outline' | 'sub'
 * @param {string} size - 'small' (28) | 'medium' (32) | 'large' (40) | 'xlarge' (48) | 'xxlarge' (52)
 * @param {function} onPress - Press handler
 * @param {ReactNode} children - Button text or content
 * @param {ReactElement} icon - 오른쪽 아이콘 (size·color 자동 적용)
 * @param {boolean} disabled - Disabled state
 * @param {object} style - Additional style overrides
 */
export default function Button({
  variant = 'primary',
  size = 'medium',
  onPress,
  children,
  icon,
  leftIcon,
  disabled = false,
  loading = false,
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
    subline: styles.variantSubline,
  };

  const pressedStyles = {
    primary: styles.pressedPrimary,
    default: styles.pressedDefault,
    text: styles.pressedText,
    outline: styles.pressedOutline,
    sub: styles.pressedSub,
    subline: styles.pressedSubline,
  };

  const textSizeStyles = {
    small: variant === 'text' ? styles.textTextSmall : styles.textSmall,
    medium: variant === 'text' ? styles.textTextMedium : styles.textMedium,
    large: variant === 'text' ? styles.textTextLarge : styles.textLarge,
    xlarge: variant === 'text' ? styles.textTextXLarge : styles.textXLarge,
    xxlarge: variant === 'text' ? styles.textTextXXLarge : styles.textXXLarge,
  };

  const textVariantStyles = {
    primary: styles.textPrimary,
    default: styles.textDefault,
    text: styles.textOnly,
    outline: styles.textOutline,
    sub: styles.textSub,
    subline: styles.textSubline,
  };

  const textPressedStyles = {
    text: styles.textPressed,
  };

  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.button,
        sizeStyles[size],
        variantStyles[variant],
        disabled && !loading && styles.disabled,
        pressed && !isDisabled && pressedStyles[variant],
        pressed && !isDisabled && variant !== 'text' && { transform: [{ translateY: 3 }] },
        style,
      ]}
      {...props}
    >
      {({ pressed }) =>
        loading ? (
          <LottieView
            source={require('../assets/loading.json')}
            autoPlay
            loop
            style={{ width: 24, height: 24 }}
          />
        ) : typeof children === 'string' ? (
          (icon || leftIcon) ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
              {leftIcon && React.cloneElement(leftIcon, {
                width: 24,
                height: 24,
                color: isDisabled ? Colors.gray400 : ICON_COLOR[variant],
              })}
              <Text
                style={[
                  styles.text,
                  textSizeStyles[size],
                  textVariantStyles[variant],
                  isDisabled && styles.textDisabled,
                  pressed && !isDisabled && textPressedStyles[variant],
                  textStyle,
                ]}
              >
                {children}
              </Text>
              {icon && React.cloneElement(icon, {
                width: ICON_SIZE[size],
                height: ICON_SIZE[size],
                color: isDisabled ? Colors.gray400 : ICON_COLOR[variant],
              })}
            </View>
          ) : (
            <Text
              style={[
                styles.text,
                textSizeStyles[size],
                textVariantStyles[variant],
                isDisabled && styles.textDisabled,
                pressed && !isDisabled && textPressedStyles[variant],
                textStyle,
              ]}
            >
              {children}
            </Text>
          )
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
  variantSubline: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray300,
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
    backgroundColor: Colors.gray200,
  },
  pressedSub: {
    backgroundColor: Colors.gray200,
  },
  pressedSubline: {
    backgroundColor: Colors.gray50,
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

  // default / primary / outline / sub 공유 텍스트 스타일
  textSmall: {
    ...Typography.body2Medium,
  },
  textMedium: {
    ...Typography.body1Medium,
  },
  textLarge: {
    ...Typography.body1Medium,
  },
  textXLarge: {
    ...Typography.subtitle1Medium,
  },
  textXXLarge: {
    ...Typography.subtitle1Medium,
  },

  // text variant 전용 텍스트 스타일
  textTextSmall: {
    ...Typography.body2Regular,
  },
  textTextMedium: {
    ...Typography.body2Regular,
  },
  textTextLarge: {
    ...Typography.body1Medium,
  },
  textTextXLarge: {
    ...Typography.subtitle1Medium,
  },
  textTextXXLarge: {
    ...Typography.subtitle1Medium,
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
  textSubline: {
    color: Colors.gray900,
  },
  textDisabled: {
    color: Colors.gray400,
  },
  textPressed: {
    color: Colors.gray500,
  },
});
