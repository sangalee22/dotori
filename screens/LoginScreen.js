import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Colors, Typography } from '../styles';
import { Spacing } from '../styles/spacing';
import SimbolFillIcon from '../components/SimbolFillIcon';
import LogoTextIcon from '../components/LogoTextIcon';
import KakaoLoginButton from '../components/KakaoLoginButton';
import GoogleLoginButton from '../components/GoogleLoginButton';
import AppleLoginButton from '../components/AppleLoginButton';
import { loginWithKakao, loginWithGoogle, loginWithApple, getGoogleRedirectResult } from '../services/auth';
import ModalPopup from '../components/ModalPopup';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

// Google OAuth Client IDs — Firebase Console > Authentication > Sign-in method > Google > Web client ID
const GOOGLE_WEB_CLIENT_ID = '642592573898-elm8i8sjah4npkim86jcgr03vuarp41k.apps.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID = '642592573898-4usjhm7pucep31piahrnj4sf4bdbgsbg.apps.googleusercontent.com';
const GOOGLE_ANDROID_CLIENT_ID = '642592573898-elm8i8sjah4npkim86jcgr03vuarp41k.apps.googleusercontent.com'; // Android 전용 Client ID 발급 전까지 Web ID 사용

export default function LoginScreen({ onLogin, onSignUp }) {
  const [isLoading, setIsLoading] = useState(false);
  const [conflictInfo, setConflictInfo] = useState(null);

  const PROVIDER_NAMES = { kakao: '카카오', google: '구글', apple: 'Apple' };

  const handleConflictConfirm = () => {
    const pending = conflictInfo.pendingUserInfo;
    setConflictInfo(null);
    onSignUp?.(pending);
  };

  // 네이티브 전용 Google OAuth 훅 (웹은 signInWithRedirect 사용)
  const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    redirectUri: makeRedirectUri({
      native: 'com.googleusercontent.apps.642592573898-4usjhm7pucep31piahrnj4sf4bdbgsbg:/oauth2redirect',
    }),
  });

  // 웹: Google redirect 로그인 후 돌아왔을 때 결과 처리
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    getGoogleRedirectResult().then(result => {
      if (!result) return;
      if (result.isNewUser) {
        onSignUp?.(result.userInfo);
      } else {
        onLogin?.(result.userInfo);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web' || !googleResponse) return;
    if (googleResponse.type === 'success') {
      const idToken = googleResponse.authentication?.idToken;
      handleGoogleLoginNative(idToken);
    } else if (googleResponse.type === 'error' || googleResponse.type === 'dismiss') {
      setIsLoading(false);
    }
  }, [googleResponse]);

  const handleGoogleLoginNative = async (idToken) => {
    try {
      const result = await loginWithGoogle(idToken);
      if (result.isNewUser && result.existingProvider) {
        setConflictInfo({ existingProvider: result.existingProvider, pendingUserInfo: result.userInfo });
      } else if (result.isNewUser) {
        onSignUp?.(result.userInfo);
      } else {
        onLogin?.(result.userInfo);
      }
    } catch (error) {
      console.error('Google login error:', error);
      Alert.alert('로그인 실패', error.message || '구글 로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKakaoLogin = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      console.log('Kakao login initiated');

      const result = await loginWithKakao();

      if (result.isNewUser && result.existingProvider) {
        setConflictInfo({ existingProvider: result.existingProvider, pendingUserInfo: result.userInfo });
      } else if (result.isNewUser) {
        // New user - go to sign up screen
        console.log('New user detected, navigating to sign up');
        if (onSignUp) {
          onSignUp(result.userInfo);
        }
      } else {
        // Existing user - log in and go to main page
        console.log('Existing user, logging in');
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

  const handleAppleLogin = async () => {
    if (isLoading) return;
    try {
      setIsLoading(true);
      const result = await loginWithApple();
      if (result.isNewUser && result.existingProvider) {
        setConflictInfo({ existingProvider: result.existingProvider, pendingUserInfo: result.userInfo });
      } else if (result.isNewUser) {
        onSignUp?.(result.userInfo);
      } else {
        onLogin?.(result.userInfo);
      }
    } catch (error) {
      if (error.code !== 'ERR_REQUEST_CANCELED') {
        console.error('Apple login error:', error);
        Alert.alert('로그인 실패', error.message || 'Apple 로그인에 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);

    if (Platform.OS === 'web') {
      try {
        const result = await loginWithGoogle();
        if (result.isNewUser && result.existingProvider) {
          setConflictInfo({ existingProvider: result.existingProvider, pendingUserInfo: result.userInfo });
        } else if (result.isNewUser) {
          onSignUp?.(result.userInfo);
        } else {
          onLogin?.(result.userInfo);
        }
      } catch (error) {
        console.error('Google login error:', error);
        Alert.alert('로그인 실패', error.message || '구글 로그인에 실패했습니다.');
        setIsLoading(false);
      }
    } else {
      // 네이티브: useAuthRequest 훅으로 Google OAuth → useEffect에서 처리
      googlePromptAsync?.();
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

            {Platform.OS === 'ios' && (
              <TouchableOpacity onPress={handleAppleLogin} activeOpacity={0.8} disabled={isLoading}>
                <AppleLoginButton />
              </TouchableOpacity>
            )}
          </View>

          {__DEV__ && (
            <TouchableOpacity
              onPress={() => onLogin?.({ id: 'dev_test_user', email: 'test@dotori.dev', displayName: '테스트유저' })}
              activeOpacity={0.7}
              style={styles.devButton}
            >
              <Text style={styles.devButtonText}>🛠 테스트로 시작하기 (개발용)</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>

      <ModalPopup
        visible={!!conflictInfo}
        title="이미 가입되어있어요"
        description={`${PROVIDER_NAMES[conflictInfo?.existingProvider]}으로 가입되어있어요.\n이 SNS로 계속 가입할까요?`}
        primaryButtonText="가입"
        secondaryButtonText="취소"
        onPrimaryPress={handleConflictConfirm}
        onSecondaryPress={() => setConflictInfo(null)}
        onClose={() => setConflictInfo(null)}
      />
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
  devButton: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  devButtonText: {
    ...Typography.body2Medium,
    color: Colors.white,
  },
});
