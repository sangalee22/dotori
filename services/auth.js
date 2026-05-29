import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { getUser, createUser, checkNickname } from './firestore';

const googleProvider = new GoogleAuthProvider();

export async function loginWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  const existing = await getUser(user.uid);

  return {
    userInfo: {
      id: user.uid,
      provider: 'google',
      email: user.email,
      name: user.displayName,
      profileImage: user.photoURL,
    },
    isNewUser: !existing,
  };
}

export async function loginWithKakao() {
  // 카카오 로그인은 네이티브 앱에서만 지원 (웹 미지원)
  throw new Error('카카오 로그인은 앱에서만 사용 가능합니다.');
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

  return { id: userInfo.id, ...userData };
}

export async function checkNicknameAvailability(nickname) {
  return await checkNickname(nickname);
}

export async function logout() {
  await signOut(auth);
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function getCurrentUser() {
  return auth.currentUser;
}
