import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '../styles';
import { Spacing } from '../styles/spacing';
import SimbolFillIcon from '../components/SimbolFillIcon';
import LogoTextIcon from '../components/LogoTextIcon';

export default function SplashScreen({ onFinish }) {
  useEffect(() => {
    // 2초 후 자동으로 다음 화면으로 전환
    const timer = setTimeout(() => {
      if (onFinish) {
        onFinish();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <SimbolFillIcon width={32} height={32} fillColor="#B284E7" strokeColor="#3D3941" />
          <LogoTextIcon width={108} height={22} color="#3D3941" />
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>우리들의 독서 공간 도토리</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    gap: Spacing.lg,
    paddingBottom: 50,
  },
  logoContainer: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  subtitle: {
    ...Typography.headline3Medium,
    color: Colors.primary600,
  },
});
