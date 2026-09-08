import { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
  Platform, Animated, Image, UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Colors, Typography, Spacing } from '../styles';
import LogoTextIcon from '../components/LogoTextIcon';
import SimbolFillIcon from '../components/SimbolFillIcon';
import KakaoLoginButton from '../components/KakaoLoginButton';
import GoogleLoginButton from '../components/GoogleLoginButton';
import AppleLoginButton from '../components/AppleLoginButton';
import { ShapeStar, ShapeMint, ShapeMoon, ShapePink, ShapeRed, ShapeYellow } from '../components/shapes';
import { BlurView } from 'expo-blur';
import Svg, { Path } from 'react-native-svg';

let MaskedView = null;
try {
  if (UIManager.hasViewManagerConfig?.('RNCMaskedView')) {
    MaskedView = require('@react-native-masked-view/masked-view').default;
  }
} catch {}
import { loginWithKakao, loginWithGoogle, loginWithApple, getGoogleRedirectResult } from '../services/auth';
import ModalPopup from '../components/ModalPopup';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_WEB_CLIENT_ID = '642592573898-elm8i8sjah4npkim86jcgr03vuarp41k.apps.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID = '642592573898-4usjhm7pucep31piahrnj4sf4bdbgsbg.apps.googleusercontent.com';
const GOOGLE_ANDROID_CLIENT_ID = '642592573898-elm8i8sjah4npkim86jcgr03vuarp41k.apps.googleusercontent.com';


// 책 이미지: 853×759 (가로가 살짝 더 넓은 열린 책)
const BOOK_W = 144;
const BOOK_H = BOOK_W * (759 / 853);

// 일러스트 씬 고정 크기 (디바이스 무관)
const SCENE = 300;
const BK_LEFT = (SCENE - BOOK_W) / 2;       // 78
const BK_TOP = (SCENE - BOOK_H) / 2 + 69;   // ≈151

export default function LoginScreen({ onLogin, onSignUp, onDevBypass, onDevOnboarding }) {
  const [isLoading, setIsLoading] = useState(false);
  const [conflictInfo, setConflictInfo] = useState(null);

  const tiltX = useRef(new Animated.Value(0)).current;
  const tiltY = useRef(new Animated.Value(0)).current;

  const PROVIDER_NAMES = { kakao: '카카오', google: '구글', apple: 'Apple' };

  // 자이로(가속도계) 연결 — expo-sensors는 네이티브 빌드에서만 활성화
  useEffect(() => {
    const { requireOptionalNativeModule } = require('expo-modules-core');
    if (!requireOptionalNativeModule('ExponentAccelerometer')) return;
    let sub;
    try {
      const Accelerometer = require('expo-sensors/build/Accelerometer').default;
      Accelerometer.setUpdateInterval(50);
      sub = Accelerometer.addListener(({ x, y }) => {
        Animated.spring(tiltX, { toValue: x, useNativeDriver: true, damping: 18, stiffness: 70, mass: 0.6 }).start();
        Animated.spring(tiltY, { toValue: -y, useNativeDriver: true, damping: 18, stiffness: 70, mass: 0.6 }).start();
      });
    } catch {}
    return () => sub?.remove();
  }, []);

  // sensitivity: 움직임 범위(px), rotation: 고정 회전각 (예: '-15deg')
  const parallax = (sensitivity, rotation = '0deg') => ({
    transform: [
      { rotate: rotation },
      { translateX: tiltX.interpolate({ inputRange: [-1, 1], outputRange: [-sensitivity * 4, sensitivity * 4] }) },
      { translateY: tiltY.interpolate({ inputRange: [-1, 1], outputRange: [-sensitivity * 4, sensitivity * 4] }) },
    ],
  });

  // ─── 로그인 핸들러 ───────────────────────────────────────────

  const handleConflictConfirm = () => {
    const pending = conflictInfo.pendingUserInfo;
    setConflictInfo(null);
    onSignUp?.(pending);
  };

  const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    redirectUri: makeRedirectUri({
      native: 'com.googleusercontent.apps.642592573898-4usjhm7pucep31piahrnj4sf4bdbgsbg:/oauth2redirect',
    }),
  });

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    getGoogleRedirectResult().then(result => {
      if (!result) return;
      if (result.isNewUser) onSignUp?.(result.userInfo);
      else onLogin?.(result.userInfo);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web' || !googleResponse) return;
    if (googleResponse.type === 'success') {
      handleGoogleLoginNative(googleResponse.authentication?.idToken);
    } else {
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
      Alert.alert('로그인 실패', error.message || '구글 로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKakaoLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const result = await loginWithKakao();
      if (result.isNewUser && result.existingProvider) {
        setConflictInfo({ existingProvider: result.existingProvider, pendingUserInfo: result.userInfo });
      } else if (result.isNewUser) {
        onSignUp?.(result.userInfo);
      } else {
        onLogin?.(result.userInfo);
      }
    } catch (error) {
      Alert.alert('로그인 실패', error.message || '카카오 로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
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
        Alert.alert('로그인 실패', error.message || '구글 로그인에 실패했습니다.');
        setIsLoading(false);
      }
    } else {
      googlePromptAsync?.();
    }
  };

  // ─── 렌더 ────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* 로고 + 일러스트: 화면 세로 중앙 정렬 */}
      <SafeAreaView edges={['top']} style={styles.centerArea}>
        <View style={styles.centerGroup}>

          {/* 로고 + 서브타이틀 */}
          <View style={styles.logoContainer}>
            <LogoTextIcon width={94.5} height={26.4} color={Colors.gray900} />
            <Text style={styles.subtitle}>우리들의 독서 공간 도토리</Text>
          </View>

          {/* 300×300 일러스트 씬 */}
          <View style={styles.scene}>
            {/* ShapeStar × 2 */}
            <Animated.View style={[styles.shape, { top: SCENE * 0.12 - 10, left: SCENE * 0.25 }, parallax(22, '20deg')]}>
              <ShapeStar size={25} />
            </Animated.View>
            <Animated.View style={[styles.shape, { top: SCENE * 0.73 - 10, left: SCENE * 0.45 }, parallax(16, '-12deg')]}>
              <ShapeStar size={17} />
            </Animated.View>

            {/* ShapeMint × 2 */}
            <Animated.View style={[styles.shape, { top: SCENE * 0.45 - 10, left: SCENE * 0.70 }, parallax(14, '30deg')]}>
              <ShapeMint size={23} />
            </Animated.View>
            <Animated.View style={[styles.shape, { top: SCENE * 0.80 - 10, left: SCENE * 0.10 }, parallax(20, '-25deg')]}>
              <ShapeMint size={16} />
            </Animated.View>

            {/* ShapePink × 2 */}
            <Animated.View style={[styles.shape, { top: SCENE * 0.64 - 10, left: SCENE * 0.10 }, parallax(18, '15deg')]}>
              <ShapePink size={17} />
            </Animated.View>
            <Animated.View style={[styles.shape, { top: SCENE * 0.10 - 10, left: SCENE * 0.45 }, parallax(12, '-20deg')]}>
              <ShapePink size={14.4} />
            </Animated.View>

            {/* ShapeMoon × 2 */}
            <Animated.View style={[styles.shape, { top: SCENE * 0.25 - 10, left: SCENE * 0.25 }, parallax(16, '-35deg')]}>
              <ShapeMoon size={24} />
            </Animated.View>
            <Animated.View style={[styles.shape, { top: SCENE * 0.75 - 10, left: SCENE * 0.80 }, parallax(22, '40deg')]}>
              <ShapeMoon size={21} />
            </Animated.View>

            {/* ShapeRed × 2 */}
            <Animated.View style={[styles.shape, { top: SCENE * 0.38 - 10, left: SCENE * 0.90 }, parallax(24, '10deg')]}>
              <ShapeRed size={20.5} />
            </Animated.View>
            <Animated.View style={[styles.shape, { top: SCENE * 0.28 - 10, left: SCENE * 0.60 }, parallax(14, '-18deg')]}>
              <ShapeRed size={13.8} />
            </Animated.View>

            {/* ShapeYellow × 2 */}
            <Animated.View style={[styles.shape, { top: SCENE * 0.17 - 10, left: SCENE * 0.80 }, parallax(12, '25deg')]}>
              <ShapeYellow size={11.7} />
            </Animated.View>
            <Animated.View style={[styles.shape, { top: SCENE * 0.45 - 10, left: SCENE * 0.08 }, parallax(20, '-10deg')]}>
              <ShapeYellow size={16} />
            </Animated.View>

            {/* 심볼: 책 중앙 뒤에 */}
            <Animated.View style={[styles.shape, { left: BK_LEFT + BOOK_W / 2 - 23, top: BK_TOP + BOOK_H / 2 - 130 }, parallax(18)]}>
              <SimbolFillIcon width={46} height={46} fillColor="#7F59D6" strokeColor="#3D3941" />
            </Animated.View>

            {/* 블러: 책 모양으로 마스킹 (Build #24 이후 활성화) */}
            {MaskedView && <MaskedView
              style={{
                position: 'absolute',
                width: BOOK_W,
                height: BOOK_H,
                left: BK_LEFT,
                top: BK_TOP,
              }}
              maskElement={
                <Svg width={BOOK_W} height={BOOK_H} viewBox="0 0 427 380" fill="none">
                  <Path
                    d="M426.293 322.332L228.48 379.124H197.816L0 322.332V1.79688L197.816 38.3057H228.48L426.293 1.79688V322.332ZM411.338 4.55176L228.482 38.3037H197.846L19.957 5.45117L63.1289 0L213.229 27.0557L369.402 0L411.338 4.55176Z"
                    fill="black"
                  />
                </Svg>
              }
            >
              <BlurView intensity={40} tint="light" style={{ flex: 1 }} />
            </MaskedView>}

            {/* 책: 제일 앞, 고정 */}
            <Image
              source={require('../assets/shapes/book.png')}
              style={{
                position: 'absolute',
                width: BOOK_W,
                height: BOOK_H,
                left: BK_LEFT,
                top: BK_TOP,
              }}
              resizeMode="contain"
            />
          </View>
        </View>
      </SafeAreaView>

      {/* 하단 로그인 버튼 */}
      <SafeAreaView style={styles.bottomSafe} edges={['bottom']}>
        <View style={styles.bottomContent}>
          <Text style={styles.loginTitle}>SNS 로그인 또는 가입하기</Text>
          <View style={styles.buttonRow}>
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
            <View style={styles.devButtons}>
              <TouchableOpacity onPress={onDevBypass} style={styles.devButton}>
                <Text style={styles.devButtonText}>🛠 테스트 입장</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onDevOnboarding} style={styles.devButton}>
                <Text style={styles.devButtonText}>📋 온보딩 보기</Text>
              </TouchableOpacity>
            </View>
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
    backgroundColor: Colors.white,
  },
  centerArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerGroup: {
    alignItems: 'center',
    gap: Spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    gap: Spacing.lg,
  },
  subtitle: {
    ...Typography.headline3Medium,
    color: Colors.gray700,
  },
  scene: {
    width: SCENE,
    height: SCENE,
    overflow: 'visible',
  },
  shape: {
    position: 'absolute',
  },
  bottomSafe: {
    backgroundColor: Colors.white,
  },
  bottomContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.md,
    alignItems: 'center',
    gap: Spacing.lg,
  },
  loginTitle: {
    ...Typography.subtitle1Medium,
    color: Colors.gray600,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  devButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  devButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.gray100,
    borderRadius: 20,
  },
  devButtonText: {
    ...Typography.body2Regular,
    color: Colors.gray700,
  },
});
