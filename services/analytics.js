import { Platform } from 'react-native';

let analyticsModule = null;

async function getAnalytics() {
  if (analyticsModule) return analyticsModule;
  if (Platform.OS === 'web') return null;
  try {
    analyticsModule = (await import('@react-native-firebase/analytics')).default;
    return analyticsModule;
  } catch {
    return null;
  }
}

// 화면 추적
export async function logScreen(screenName) {
  const analytics = await getAnalytics();
  await analytics?.().logScreenView({ screen_name: screenName, screen_class: screenName });
}

// 버튼/이벤트 추적
export async function logEvent(eventName, params = {}) {
  const analytics = await getAnalytics();
  await analytics?.().logEvent(eventName, params);
}

// 로그인
export async function logLogin(method) {
  const analytics = await getAnalytics();
  await analytics?.().logLogin({ method });
}

// 회원가입
export async function logSignUp(method) {
  const analytics = await getAnalytics();
  await analytics?.().logSignUp({ method });
}
