import React, { useState, forwardRef } from 'react';
import { TextInput, StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { Colors, BorderRadius, Spacing, Typography } from '../styles';
import DeleteIcon from './DeleteIcon';

const TextField = forwardRef((
  {
    value = '',
    onChangeText,
    placeholder,
    disabled = false,
    secureTextEntry = false,
    autoFocus = false,
    placeholderTextColor,
    style,
    containerStyle,
    showClearButton = false,
    onClear,
    onSubmitEditing,
    returnKeyType = 'done',
    keyboardType = 'default',
    inputAccessoryViewID,
    onFocus,
    onBlur,
    label,
    helpText,
    multiline = false,
    error = false,
  },
  ref
) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChangeText) {
      onChangeText('');
    }
  };

  const containerStyles = [styles.inputContainer];
  if (isFocused && !error && !disabled) {
    containerStyles.push(styles.inputContainerFocused);
  }
  if (error) {
    containerStyles.push(styles.inputContainerError);
  }
  if (disabled) {
    containerStyles.push(styles.inputContainerDisabled);
  }
  if (showClearButton && value) {
    containerStyles.push(styles.inputContainerWithButton);
  }
  if (multiline) {
    containerStyles.push(styles.inputContainerMultiline);
  }

  const inputStyles = [styles.input];
  if (multiline) inputStyles.push(styles.inputMultiline);
  if (disabled) inputStyles.push(styles.inputDisabled);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[containerStyles, containerStyle]}>
        <TextInput
          ref={ref}
          style={inputStyles}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor || Colors.gray400}
          value={value}
          onChangeText={onChangeText}
          onFocus={(e) => {
            setIsFocused(true);
            if (onFocus) onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            if (onBlur) onBlur(e);
          }}
          editable={!disabled}
          secureTextEntry={secureTextEntry}
          autoFocus={autoFocus}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          keyboardType={keyboardType}
          inputAccessoryViewID={inputAccessoryViewID}
          multiline={multiline}
        />
        {showClearButton && value && !disabled ? (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <DeleteIcon width={20} height={20} color={Colors.gray300} />
          </TouchableOpacity>
        ) : null}
      </View>
      {helpText && <Text style={[styles.helpText, error && styles.helpTextError]}>{helpText}</Text>}
    </View>
  );
});

TextField.displayName = 'TextField';

export default TextField;

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    ...Typography.body2Regular,
    color: Colors.gray900,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  inputContainer: {
    backgroundColor: Colors.gray50,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    height: 48,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputContainerFocused: {
    borderColor: Colors.primary500,
  },
  inputContainerError: {
    borderWidth: 1,
    borderColor: Colors.error,
  },
  inputContainerDisabled: {},
  inputContainerWithButton: {
    paddingRight: 0,
  },
  inputContainerMultiline: {
    height: 'auto',
    alignItems: 'flex-start',
    paddingVertical: Spacing.md,
  },
  input: {
    flex: 1,
    fontFamily: Typography.body1Regular.fontFamily,
    fontSize: Typography.body1Regular.fontSize,
    fontWeight: Typography.body1Regular.fontWeight,
    letterSpacing: Typography.body1Regular.letterSpacing,
    color: Colors.gray900,
    padding: 0,
    margin: 0,
    textAlignVertical: 'center',
    outlineStyle: 'none',
  },
  inputDisabled: {
    color: Colors.gray400,
  },
  inputMultiline: {
    textAlignVertical: 'top',
    minHeight: 100,
  },
  clearButton: {
    height: 48,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpText: {
    ...Typography.body3Regular,
    color: Colors.gray600,
    marginTop: Spacing.sm,
    paddingLeft: Spacing.sm,
  },
  helpTextError: {
    color: Colors.error,
  },
});
