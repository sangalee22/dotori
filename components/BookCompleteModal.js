import React, { useEffect, useRef } from 'react';
import { Modal, StyleSheet, Pressable, View, Text, Animated, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { CATEGORY_SHAPE_MAP, getCategoryIdFromName } from './GlassBottle';
import { Colors, Typography, Spacing } from '../styles';

const ETC_IMG = require('../assets/shapes/shapes_etc_glass.png');
const SHAPE_SIZE = 100;

export default function BookCompleteModal({ visible, book, onClose }) {
  const dropAnim = useRef(new Animated.Value(-300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      dropAnim.setValue(-300);
      fadeAnim.setValue(0);
      // 모달 fade-in(~300ms) 이후 도형 모션 시작
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 180,
            useNativeDriver: true,
          }),
          Animated.spring(dropAnim, {
            toValue: 0,
            friction: 5,
            tension: 120,
            useNativeDriver: true,
          }),
        ]).start();
      }, 280);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const catId = getCategoryIdFromName(book?.categoryName);
  const shape = catId != null ? CATEGORY_SHAPE_MAP[catId] : null;

  const renderShape = () => {
    if (shape?.img) {
      return <Image source={shape.img} style={styles.shape} resizeMode="contain" />;
    }
    if (shape?.Comp) {
      return <shape.Comp size={SHAPE_SIZE} />;
    }
    return <Image source={ETC_IMG} style={styles.shape} resizeMode="contain" />;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
        <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.container}>
          <View style={styles.group}>
            <Animated.View style={{ transform: [{ translateY: dropAnim }], opacity: fadeAnim }}>
              {renderShape()}
            </Animated.View>
            <Text style={styles.text}>{"완독!\n한 권의 도토리가 쌓였어요 🌰"}</Text>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  group: {
    alignItems: 'center',
    paddingBottom: Spacing.huge,
  },
  shape: {
    width: SHAPE_SIZE,
    height: SHAPE_SIZE,
  },
  text: {
    ...Typography.headline1Bold,
    color: Colors.white,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
});
