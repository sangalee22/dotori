import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../styles';
import ArrowLeftIcon from './ArrowLeftIcon';
import MenuIcon from './MenuIcon';
import IconButton from './IconButton';

/**
 * DefaultHeader Component
 * Header used in detail screens with back button, title, and right action buttons
 * @param {function} onBack - Back button press handler
 * @param {function} onMenu - Menu button press handler (or right button press handler)
 * @param {ReactNode} rightButton - Custom right button component (if not provided, uses MenuIcon) - DEPRECATED: use rightButtons instead
 * @param {Array<ReactNode>} rightButtons - Array of custom right button components (if not provided, uses single MenuIcon)
 * @param {ReactNode} leftTitleIcon - Optional icon to display on the left of the title (e.g., lock icon)
 * @param {string} title - Optional title to display in center
 * @param {Animated.Value} titleOpacity - Optional animated opacity for title
 * @param {Animated.Value} gradientOpacity - Optional animated opacity for blur background (renamed from gradientOpacity for backward compatibility)
 * @param {object} gradientStyle - Additional style overrides (kept for backward compatibility)
 * @param {string} iconColor - Icon color (default: gray800)
 * @param {boolean} showBlur - Whether to show blur background (default: true)
 * @param {string} backgroundColor - Background color for the header
 * @param {object} style - Additional style overrides
 */
export default function DefaultHeader({
  onBack,
  onMenu,
  rightButton,
  rightButtons,
  leftTitleIcon,
  title,
  titleOpacity,
  gradientOpacity,
  gradientStyle,
  hideRightButton = false,
  iconColor = Colors.gray800,
  showBlur = true,
  backgroundColor,
  topInset,
  style,
}) {
  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        backgroundColor ? { backgroundColor } : null,
        topInset != null ? { paddingTop: topInset } : null,
      ]}
      edges={topInset != null ? [] : ['top']}
    >
      {/* Blur Background */}
      {showBlur && gradientOpacity != null && (
        <Animated.View style={[styles.blurContainer, { opacity: gradientOpacity }]}>
          <View style={styles.blurBackground} />
        </Animated.View>
      )}
      <View style={[styles.header, style]}>
      {onBack ? (
        <IconButton onPress={onBack}>
          <ArrowLeftIcon color={iconColor} />
        </IconButton>
      ) : (
        <View style={{ width: 48 }} />
      )}
      <View style={styles.rightButtonsWrapper}>
        {hideRightButton ? (
          <View style={{ width: 48 }} />
        ) : rightButtons ? (
          <View style={styles.rightButtonsContainer}>
            {rightButtons.map((button, index) => (
              <View key={index}>{button}</View>
            ))}
          </View>
        ) : rightButton ? (
          <IconButton onPress={onMenu}>
            {rightButton}
          </IconButton>
        ) : (
          <IconButton onPress={onMenu}>
            <MenuIcon color={iconColor} />
          </IconButton>
        )}
      </View>
      {title && (
        <View style={styles.titleContainer}>
          {leftTitleIcon && (
            <View style={styles.leftTitleIcon}>
              {leftTitleIcon}
            </View>
          )}
          <Animated.Text
            style={[
              styles.title,
              leftTitleIcon && styles.titleWithIcon,
              titleOpacity != null && { opacity: titleOpacity },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title || ''}
          </Animated.Text>
        </View>
      )}
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  blurContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  blurBackground: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
    height: 52,
  },
  rightButtonsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  titleContainer: {
    position: 'absolute',
    left: 60,
    right: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    alignSelf: 'center',
    pointerEvents: 'box-none',
  },
  leftTitleIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  title: {
    ...Typography.subtitle1Medium,
    color: Colors.gray900,
    textAlign: 'center',
    flexShrink: 1,
  },
  titleWithIcon: {
    marginRight: Spacing.sm,
  },
});
