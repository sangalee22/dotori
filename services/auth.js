import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleAuthProvider, OAuthProvider, signInWithRedirect, getRedirectResult, signInWithCredential, signInAnonymously, signOut, onAuthStateChanged } from 'firebase/auth';
import { ref, deleteObject, listAll } from 'firebase/storage';
import { storage } from './firebase';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { auth } from './firebase';
import { getUser, getUserByEmail, createUser, checkNickname, deleteAllUserData, saveWithdrawalReason } from './firestore';

WebBrowser.maybeCompleteAuthSession();

const KAKAO_REST_KEY = '2b5d49a5425814b1d77004161b404e35';
const googleProvider = new GoogleAuthProvider();

// ─── Web: 팝업 + REST API ─────────────────────────────────────────────────────

async function exchangeKakaoCode(code, redirectUri) {
  const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: KAKAO_REST_KEY,
      redirect_uri: redirectUri,
      code,
    }).toString(),
  });
  const tokenData = await tokenRes.json();
  console.log('Kakao token response:', JSON.stringify(tokenData));
  if (!tokenData.access_token) throw new Error(`토큰 발급 실패: ${tokenData.error_description || tokenData.error || JSON.stringify(tokenData)}`);

  const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const userData = await userRes.json();
  if (userData.code < 0) throw new Error(`사용자 정보 조회 실패 (${userData.code})`);


  const kakaoId = `kakao_${userData.id}`;
  const profile = userData.kakao_account?.profile;
  const userInfo = {
    id: kakaoId,
    provider: 'kakao',
    email: userData.kakao_account?.email || null,
    name: profile?.nickname || null,
    profileImage: profile?.profile_image_url || null,
  };

  if (!auth.currentUser) await signInAnonymously(auth).catch(() => {});
  const existing = await getUser(kakaoId);
  const isNewUser = !existing;
  let existingProvider = null;
  if (isNewUser && userInfo.email) {
    const emailUser = await getUserByEmail(userInfo.email);
    if (emailUser && emailUser.provider !== 'kakao') existingProvider = emailUser.provider;
  }
  return { userInfo, isNewUser, existingProvider };
}

async function loginWithKakaoWeb() {
  const redirectUri = window.location.href.split('?')[0].replace(/\/$/, '') || window.location.origin;

  return new Promise((resolve, reject) => {
    const authUrl =
      `https://kauth.kakao.com/oauth/authorize` +
      `?client_id=${KAKAO_REST_KEY}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=profile_nickname,profile_image`;

    const popup = window.open(authUrl, 'kakao_login', 'width=500,height=600,scrollbars=yes');

    if (!popup) {
      reject(new Error('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.'));
      return;
    }

    const timer = setInterval(async () => {
      if (popup.closed) {
        clearInterval(timer);
        reject(new Error('카카오 로그인이 취소되었습니다.'));
        return;
      }
      try {
        const url = popup.location.href;
        if (url.startsWith(redirectUri)) {
          const code = new URL(url).searchParams.get('code');
          popup.close();
          clearInterval(timer);
          if (!code) { reject(new Error('인증 코드를 받지 못했습니다.')); return; }
          try {
            resolve(await exchangeKakaoCode(code, redirectUri));
          } catch (e) { reject(e); }
        }
      } catch (_) { /* 카카오 도메인 - cross-origin, 계속 대기 */ }
    }, 500);
  });
}

// ─── Native: @react-native-seoul/kakao-login ──────────────────────────────────

async function loginWithKakaoNative() {
  const { login, getProfile } = require('@react-native-seoul/kakao-login');
  const token = await login();
  if (!token?.accessToken) throw new Error('카카오 로그인 실패');

  const profile = await getProfile();
  const kakaoId = `kakao_${profile.id}`;
  const userInfo = {
    id: kakaoId,
    provider: 'kakao',
    email: profile.email || null,
    name: profile.nickname || null,
    profileImage: profile.profileImageUrl || null,
  };

  await AsyncStorage.setItem('kakao_access_token', token.accessToken);
  if (!auth.currentUser) await signInAnonymously(auth).catch(() => {});
  const existing = await getUser(kakaoId);
  const isNewUser = !existing;
  let existingProvider = null;
  if (isNewUser && userInfo.email) {
    const emailUser = await getUserByEmail(userInfo.email);
    if (emailUser && emailUser.provider !== 'kakao') existingProvider = emailUser.provider;
  }
  return { userInfo, isNewUser, existingProvider };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function loginWithGoogle(idToken = null) {
  if (Platform.OS === 'web') {
    // 웹: redirect 방식 사용 (popup의 implicit flow는 Google 정책으로 차단됨)
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
    return null; // 페이지가 이동하므로 여기서 반환값 없음
  }
  // 네이티브: expo-auth-session으로 받은 idToken으로 Firebase 인증
  if (!idToken) throw new Error('Google ID 토큰이 없습니다.');
  const credential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(auth, credential);
  const firebaseUser = result.user;
  const existing = await getUser(firebaseUser.uid);
  const isNewUser = !existing;
  let existingProvider = null;
  if (isNewUser && firebaseUser.email) {
    const emailUser = await getUserByEmail(firebaseUser.email);
    if (emailUser && emailUser.provider !== 'google') existingProvider = emailUser.provider;
  }
  return {
    userInfo: {
      id: firebaseUser.uid,
      provider: 'google',
      email: firebaseUser.email,
      name: firebaseUser.displayName,
      profileImage: firebaseUser.photoURL,
    },
    isNewUser,
    existingProvider,
  };
}

// 웹 전용: Google redirect 로그인 후 결과 처리
export async function getGoogleRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    if (!result) return null;
    const firebaseUser = result.user;
    const existing = await getUser(firebaseUser.uid);
    return {
      userInfo: {
        id: firebaseUser.uid,
        provider: 'google',
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        profileImage: firebaseUser.photoURL,
      },
      isNewUser: !existing,
    };
  } catch {
    return null;
  }
}

export async function loginWithApple() {
  const AppleAuthentication = require('expo-apple-authentication');
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  const { identityToken, fullName } = credential;
  if (!identityToken) throw new Error('Apple ID 토큰이 없습니다.');

  const provider = new OAuthProvider('apple.com');
  const oauthCredential = provider.credential({ idToken: identityToken });
  const result = await signInWithCredential(auth, oauthCredential);

  const firebaseUser = result.user;
  const existing = await getUser(firebaseUser.uid);
  const isNewUser = !existing;
  const name = firebaseUser.displayName ||
    (fullName ? [fullName.givenName, fullName.familyName].filter(Boolean).join(' ') : null);
  let existingProvider = null;
  if (isNewUser && firebaseUser.email) {
    const emailUser = await getUserByEmail(firebaseUser.email);
    if (emailUser && emailUser.provider !== 'apple') existingProvider = emailUser.provider;
  }
  return {
    userInfo: {
      id: firebaseUser.uid,
      provider: 'apple',
      email: firebaseUser.email,
      name,
      profileImage: null,
    },
    isNewUser,
    existingProvider,
  };
}

export async function loginWithKakao() {
  if (Platform.OS === 'web') {
    return loginWithKakaoWeb();
  }
  return loginWithKakaoNative();
}

export async function loginExistingUser(userInfo) {
  await AsyncStorage.setItem('currentUser', JSON.stringify(userInfo));
}

export async function registerUser(userInfo, nickname) {
  const userData = {
    nickname,
    name: userInfo.name,
    email: userInfo.email,
    profileImage: userInfo.profileImage,
    provider: userInfo.provider,
  };
  await createUser(userInfo.id, userData);
  const fullUser = { id: userInfo.id, ...userData };
  await AsyncStorage.setItem('currentUser', JSON.stringify(fullUser));
  return fullUser;
}

export async function checkNicknameAvailability(nickname) {
  return await checkNickname(nickname);
}

async function deleteStorageFolder(folderRef) {
  try {
    const { items, prefixes } = await listAll(folderRef);
    await Promise.all([
      ...items.map(item => deleteObject(item).catch(() => {})),
      ...prefixes.map(prefix => deleteStorageFolder(prefix)),
    ]);
  } catch {}
}

export async function withdrawUser(userId, provider, reasonData) {
  if (reasonData) await saveWithdrawalReason(userId, reasonData).catch(() => {});
  await deleteAllUserData(userId);
  await Promise.all([
    deleteObject(ref(storage, `profileImages/${userId}`)).catch(() => {}),
    deleteStorageFolder(ref(storage, `reviewImages/${userId}`)),
  ]);

  if (provider === 'kakao') {
    const token = await AsyncStorage.getItem('kakao_access_token');
    if (token) {
      await fetch('https://kapi.kakao.com/v1/user/unlink', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
      await AsyncStorage.removeItem('kakao_access_token');
    }
    if (Platform.OS !== 'web') {
      const { unlink } = require('@react-native-seoul/kakao-login');
      await unlink().catch(() => {});
    }
  }

  if (provider === 'google') {
    const user = auth.currentUser;
    if (user) await user.delete().catch(() => {});
  }

  await AsyncStorage.clear();
  await signOut(auth).catch(() => {});
}

export async function logout() {
  await AsyncStorage.removeItem('currentUser');
  if (Platform.OS === 'web' && window.Kakao?.isInitialized()) {
    window.Kakao.Auth.logout(() => {});
  } else if (Platform.OS !== 'web') {
    const { logout: kakaoLogout } = require('@react-native-seoul/kakao-login');
    await kakaoLogout().catch(() => {});
  }
  await signOut(auth).catch(() => {});
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function getCurrentUser() {
  return auth.currentUser;
}
