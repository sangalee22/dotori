import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../styles';

export default function RequiredDot() {
  return <View style={styles.dot} />;
}

const styles = StyleSheet.create({
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary500,
    alignSelf: 'flex-start',
  },
});
