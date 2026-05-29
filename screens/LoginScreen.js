import { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Colors, Typography } from '../styles';
import { Spacing } from '../styles/spacing';
import SimbolFillIcon from '../components/SimbolFillIcon';
import LogoTextIcon from '../components/LogoTextIcon';
import KakaoLoginButton from '../components/KakaoLoginButton';
import GoogleLoginButton from '../components/GoogleLoginButton';
import { loginWithKakao, loginWithGoogle, loginExistingUser } from '../services/auth';

export default function LoginScreen({ onLogin, onSignUp }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleKakaoLogin = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      console.log('Kakao login initiated');

      const result = await loginWithKakao();

      if (result.isNewUser) {
        // New user - go to sign up screen
        console.log('New user detected, navigating to sign up');
        if (onSignUp) {
          onSignUp(result.userInfo);
        }
      } else {
        // Existing user - log in and go to main page
        console.log('Existing user, logging in');
        await loginExistingUser(result.userInfo);
        if (onLogin) {
          onLogin(result.userInfo);
        }
      }
    } catch (error) {
      console.error('Kakao login error:', error);
      Alert.alert('로그인 실패', error.message || '카카오 로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      console.log('Google login initiated');

      const result = await loginWithGoogle();

      if (result.isNewUser) {
        // New user - go to sign up screen
        console.log('New user detected, navigating to sign up');
        if (onSignUp) {
          onSignUp(result.userInfo);
        }
      } else {
        // Existing user - log in and go to main page
        console.log('Existing user, logging in');
        await loginExistingUser(result.userInfo);
        if (onLogin) {
          onLogin(result.userInfo);
        }
      }
    } catch (error) {
      console.error('Google login error:', error);
      Alert.alert('로그인 실패', error.message || '구글 로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Background Image */}
      <ImageBackground
        source={require('../assets/splash-bg.webp')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
      </ImageBackground>

      {/* Top Logo */}
      <SafeAreaView style={styles.topSafeArea} edges={['top']}>
        <View style={styles.logoContainer}>
          <SimbolFillIcon width={32} height={32} fillColor="#B284E7" strokeColor={Colors.white} />
          <LogoTextIcon width={71} height={20} color={Colors.white} />
          {/* Subtitle */}
           <Text style={styles.subtitle}>우리들의 독서 공간 도토리</Text>
        </View>
      </SafeAreaView>

      {/* Bottom Content */}
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.bottomContent}>
          <Text style={styles.title}>SNS 로그인 또는 가입하기</Text>
          {/* Login Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={handleKakaoLogin} activeOpacity={0.8} disabled={isLoading}>
              <KakaoLoginButton />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleGoogleLogin} activeOpacity={0.8} disabled={isLoading}>
              <GoogleLoginButton />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray900,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  topSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    gap: Spacing.xs,
    paddingTop: 150,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bottomContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 120,
    gap: Spacing.lg,
    alignItems: 'center',
  },
  title: {
    ...Typography.subtitle1Medium,
    color: Colors.white,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    ...Typography.headline3Medium,
    color: Colors.white,
    marginTop: Spacing.md,
  },
});
