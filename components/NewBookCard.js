import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../styles';

/**
 * NewBookCard Component
 * 신간 도서 카드 컴포넌트
 * @param {string} coverImage - 책 표지 이미지 URL
 * @param {string} title - 책 제목
 * @param {string} subtitle - 부제목 (선택)
 * @param {string} author - 저자명
 * @param {function} onPress - 카드 클릭 핸들러
 * @param {object} style - 추가 스타일
 */
export default function NewBookCard({ coverImage, title, subtitle, author, onPress, style }) {
  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress} activeOpacity={0.9}>
      <Image
        source={{ uri: coverImage }}
        style={styles.backgroundImage}
        resizeMode="cover"
        blurRadius={20}
      />
      <View style={styles.overlay}>
        <Image
          source={{ uri: coverImage }}
          style={styles.coverImage}
          resizeMode="cover"
        />
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
          <Text style={styles.author} numberOfLines={1}>
            {author}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 320,
    height: 140,
    borderRadius: 50,
    overflow: 'hidden',
  },
  backgroundImage: {
    position: 'absolute',
    width: '120%',
    height: '120%',
    left: '-10%',
    top: '-10%',
  },
  overlay: {
    flex: 1,
    flexDirection: 'row',
    padding: Spacing.xl,
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  coverImage: {
    width: 100,
    height: 143,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.gray100,
    borderColor: Colors.gray100,
    borderWidth: 1,
  },
  infoContainer: {
    flex: 1,
    marginLeft: Spacing.lg,
    justifyContent: 'flex-start',
  },
  title: {
    ...Typography.headline3Bold,
    color: Colors.gray900,
    marginBottom: 2,
    marginTop: Spacing.lg,
  },
  subtitle: {
    ...Typography.subtitle1Regular,
    color: Colors.gray900,
    marginBottom: Spacing.sm,
  },
  author: {
    ...Typography.body1Regular,
    color: Colors.gray700,
  },
});
