import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../styles';
import Button from './Button';

export default function ModalPopup({
  visible = false,
  title,
  description,
  primaryButtonText = '확인',
  secondaryButtonText = '취소',
  onPrimaryPress,
  onSecondaryPress,
  onClose,
  onDismiss,
  hideSecondaryButton = false,
  primaryButtonDisabled = false,
  children,
  descriptionStyle,
  aboveButtons,
  inline = false,
}) {
  const content = (
    <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        {description && (
          <Text style={[styles.description, descriptionStyle]}>{description}</Text>
        )}
        {children}
      </View>
      {aboveButtons}
      <View style={[styles.buttonWrapper, hideSecondaryButton && styles.buttonWrapperCenter]}>
        {!hideSecondaryButton && (
          <Button variant="sub" size="xlarge" onPress={onSecondaryPress || onClose} style={styles.button}>
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
  );

  if (inline) {
    if (!visible) return null;
    return (
      <Pressable style={styles.inlineOverlay} onPress={() => onClose?.()}>
        {content}
      </Pressable>
    );
  }

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="none"
      onRequestClose={() => { Keyboard.dismiss(); onClose?.(); }}
      onDismiss={onDismiss}
    >
      <Pressable style={styles.overlay} onPress={() => { Keyboard.dismiss(); onClose?.(); }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          {content}
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
  inlineOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
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
