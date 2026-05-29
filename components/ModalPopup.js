import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../styles';
import Button from './Button';

/**
 * ModalPopup Component
 * @param {boolean} visible - Modal visibility
 * @param {string} title - Modal title
 * @param {string} description - Modal description (optional)
 * @param {string} primaryButtonText - Primary button text
 * @param {string} secondaryButtonText - Secondary button text (optional)
 * @param {function} onPrimaryPress - Primary button press handler
 * @param {function} onSecondaryPress - Secondary button press handler
 * @param {function} onClose - Close modal handler
 * @param {boolean} hideSecondaryButton - Hide secondary button (default: false)
 * @param {boolean} primaryButtonDisabled - Disable primary button (default: false)
 */
export default function ModalPopup({
  visible = false,
  title,
  description,
  primaryButtonText = '확인',
  secondaryButtonText = '취소',
  onPrimaryPress,
  onSecondaryPress,
  onClose,
  hideSecondaryButton = false,
  primaryButtonDisabled = false,
  children,
  descriptionStyle,
}) {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
            {/* Body */}
            <View style={styles.body}>
              <Text style={styles.title}>{title}</Text>
              {description && (
                <Text style={[styles.description, descriptionStyle]}>{description}</Text>
              )}
              {children}
            </View>

            {/* Buttons */}
            <View style={[styles.buttonWrapper, hideSecondaryButton && styles.buttonWrapperCenter]}>
              {!hideSecondaryButton && (
                <Button
                  variant="sub"
                  size="xlarge"
                  onPress={onSecondaryPress || onClose}
                  style={styles.button}
                >
                  {secondaryButtonText}
                </Button>
              )}
              <Button
                variant="primary"
                size="xlarge"
                onPress={onPrimaryPress}
                disabled={primaryButtonDisabled}
                style={hideSecondaryButton ? styles.buttonSingle : styles.button}
              >
                {primaryButtonText}
              </Button>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: 300,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    paddingTop: Spacing.xxxl,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  body: {
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.subtitle1Medium,
    color: Colors.gray900,
    textAlign: 'center',
  },
  description: {
    ...Typography.body1Regular,
    color: Colors.gray700,
    textAlign: 'center',
  },
  buttonWrapper: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  button: {
    flex: 1,
  },
  buttonWrapperCenter: {
    justifyContent: 'center',
  },
  buttonSingle: {
    maxWidth: 200,
    flex: 1,
  },
});
