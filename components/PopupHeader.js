import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../styles';

export default function PopupHeader({ title }) {
  return (
    <View style={styles.container}>
      <View style={styles.handleBar} />
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray50,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  handleBar: {
    position: 'absolute',
    top: 10,
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.gray200,
  },
  title: {
    ...Typography.body1ExtraBold,
    color: Colors.gray900,
    marginTop: Spacing.sm,
  },
});
