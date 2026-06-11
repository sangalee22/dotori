import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../styles';

export default function ResultStyleTab({ label, selected = false, onPress, thumbnail }) {
  return (
    <TouchableOpacity style={styles.wrapper} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.box, selected && styles.boxSelected]}>
        {thumbnail && (
          <Image source={thumbnail} style={styles.thumbnail} resizeMode="cover" />
        )}
      </View>
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  box: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.gray100,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  boxSelected: {
    borderColor: Colors.primary500,
  },
  thumbnail: {
    position: 'absolute',                                     
    top: -2,                                                  
    left: -2,                                                 
    right: -2,                                                
    bottom: -2, 
    width: 50,
    height: 50,
  },
  label: {
    ...Typography.body2Regular,
    color: Colors.gray600,
  },
  labelSelected: {
    ...Typography.body2Medium,
    color: Colors.gray900,
  },
});
