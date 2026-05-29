import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../styles';
import SimbolOutlineIcon from './SimbolOutlineIcon';

export default function EmptyState({ icon, text }) {
  return (
    <View style={styles.container}>
      {icon ?? <SimbolOutlineIcon width={20} height={20} color={Colors.gray700} />}
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 150,
  },
  text: {
    ...Typography.subtitle1Medium,
    color: Colors.gray700,
  },
});
