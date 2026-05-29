import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors, Typography, Spacing } from '../styles';

/**
 * DatePickerModal Component
 * iOS-style modal wrapper for DateTimePicker
 * @param {boolean} visible - Modal visibility
 * @param {Date} value - Selected date value
 * @param {Date} minimumDate - Minimum selectable date (optional)
 * @param {function} onChange - Date change handler (event, date)
 * @param {function} onClose - Modal close handler
 * @param {string} title - Modal title (default: "기간 설정")
 */
export default function DatePickerModal({
  visible = false,
  value,
  minimumDate,
  onChange,
  onClose,
  title = '기간 설정',
}) {
  const handleDone = () => {
    if (onClose) onClose();
  };

  const handleCancel = () => {
    if (onClose) onClose();
  };

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleCancel}>
              <Text style={styles.button}>취소</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={handleDone}>
              <Text style={[styles.button, styles.buttonDone]}>완료</Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={value}
            mode="date"
            display="spinner"
            onChange={onChange}
            minimumDate={minimumDate}
            textColor={Colors.gray900}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  title: {
    ...Typography.subtitle1Medium,
    color: Colors.gray900,
  },
  button: {
    ...Typography.body1Regular,
    color: Colors.gray600,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  buttonDone: {
    color: Colors.primary500,
    fontWeight: '600',
  },
});
