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
          <SimbolFillIcon width={32} height={32} fillColor="#7F59D6" strokeColor="#3D3941" />
          <LogoTextIcon width={108} height={22} color="#3D3941" />
        </View>
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
    gap: Spacing.sm,
  },
  subtitle: {
    ...Typography.headline3Medium,
    color: Colors.primary600,
  },
});
