import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Kakao Login
 * Authenticates user with Kakao and returns user information
 */
export async function loginWithKakao() {
  try {
    // TODO: Implement actual Kakao login
    // 1. Install: npm install @react-native-seoul/kakao-login
    // 2. Configure Kakao app in Kakao Developers console
    // 3. Add native configuration (iOS/Android)
    // 4. Call Kakao login API

    // Example implementation (uncomment when library is installed):
    /*
    import { login, getProfile } from '@react-native-seoul/kakao-login';

    const token = await login();
    const profile = await getProfile();

    return {
      provider: 'kakao',
      id: profile.id,
      email: profile.email,
      name: profile.nickname,
      profileImage: profile.profileImageUrl,
    };
    */

    // Mock implementation for development
    console.log('[AUTH] Kakao login initiated');

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock user data
    const mockUserData = {
      provider: 'kakao',
      id: 'kakao_' + Date.now(),
      email: 'user@kakao.com',
      name: 'Kakao User',
      profileImage: null,
    };

    // Check if user exists in our system
    const existingUser = await checkUserExists(mockUserData.id);

    return {
      userInfo: mockUserData,
      isNewUser: !existingUser,
    };
  } catch (error) {
    console.error('[AUTH] Kakao login error:', error);
    throw new Error('카카오 로그인에 실패했습니다.');
  }
}

/**
 * Google Login
 * Authenticates user with Google and returns user information
 */
export async function loginWithGoogle() {
  try {
    // TODO: Implement actual Google login
    // 1. Install: npm install @react-native-google-signin/google-signin
    // 2. Configure Google Cloud Console project
    // 3. Add OAuth credentials
    // 4. Configure native modules (iOS/Android)
    // 5. Call Google login API

    // Example implementation (uncomment when library is installed):
    /*
    import { GoogleSignin } from '@react-native-google-signin/google-signin';

    GoogleSignin.configure({
      webClientId: 'YOUR_WEB_CLIENT_ID',
    });

    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();

    return {
      provider: 'google',
      id: userInfo.user.id,
      email: userInfo.user.email,
      name: userInfo.user.name,
      profileImage: userInfo.user.photo,
    };
    */

    // Mock implementation for development
    console.log('[AUTH] Google login initiated');

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock user data
    const mockUserData = {
      provider: 'google',
      id: 'google_' + Date.now(),
      email: 'user@gmail.com',
      name: 'Google User',
      profileImage: null,
    };

    // Check if user exists in our system
    const existingUser = await checkUserExists(mockUserData.id);

    return {
      userInfo: mockUserData,
      isNewUser: !existingUser,
    };
  } catch (error) {
    console.error('[AUTH] Google login error:', error);
    throw new Error('구글 로그인에 실패했습니다.');
  }
}

/**
 * Check if user exists in the system
 * @param {string} userId - User ID from social provider
 * @returns {Promise<Object|null>} User data if exists, null otherwise
 */
async function checkUserExists(userId) {
  try {
    // TODO: Replace with actual API call to your backend
    // Example:
    /*
    const response = await fetch(`${API_URL}/users/${userId}`);
    if (response.ok) {
      return await response.json();
    }
    return null;
    */

    // Mock implementation - check local storage
    const userData = await AsyncStorage.getItem(`user_${userId}`);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('[AUTH] Check user exists error:', error);
    return null;
  }
}

/**
 * Register new user
 * @param {Object} userInfo - User information from social login
 * @param {string} nickname - User's chosen nickname
 * @returns {Promise<Object>} Registered user data
 */
export async function registerUser(userInfo, nickname) {
  try {
    // TODO: Replace with actual API call to your backend
    // Example:
    /*
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        providerId: userInfo.id,
        provider: userInfo.provider,
        email: userInfo.email,
        name: userInfo.name,
        nickname,
        profileImage: userInfo.profileImage,
      }),
    });
    return await response.json();
    */

    // Mock implementation - save to local storage
    const userData = {
      ...userInfo,
      nickname,
      createdAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(`user_${userInfo.id}`, JSON.stringify(userData));
    await AsyncStorage.setItem('currentUser', JSON.stringify(userData));

    console.log('[AUTH] User registered:', userData);
    return userData;
  } catch (error) {
    console.error('[AUTH] Register user error:', error);
    throw new Error('회원가입에 실패했습니다.');
  }
}

/**
 * Login existing user
 * @param {Object} userInfo - User information from social login
 * @returns {Promise<Object>} User data
 */
export async function loginExistingUser(userInfo) {
  try {
    // TODO: Replace with actual API call to your backend
    // Example:
    /*
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        providerId: userInfo.id,
        provider: userInfo.provider,
      }),
    });
    return await response.json();
    */

    // Mock implementation - get from local storage
    const userData = await AsyncStorage.getItem(`user_${userInfo.id}`);
    if (userData) {
      const user = JSON.parse(userData);
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));
      console.log('[AUTH] User logged in:', user);
      return user;
    }

    throw new Error('User not found');
  } catch (error) {
    console.error('[AUTH] Login existing user error:', error);
    throw new Error('로그인에 실패했습니다.');
  }
}

/**
 * Get current logged in user
 * @returns {Promise<Object|null>} Current user data or null
 */
export async function getCurrentUser() {
  try {
    const userData = await AsyncStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('[AUTH] Get current user error:', error);
    return null;
  }
}

/**
 * Check if nickname is available
 * @param {string} nickname - Nickname to check
 * @returns {Promise<boolean>} True if available, false if already taken
 */
export async function checkNicknameAvailability(nickname) {
  try {
    // TODO: Replace with actual API call to your backend
    // Example:
    /*
    const response = await fetch(`${API_URL}/users/check-nickname`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname }),
    });
    const data = await response.json();
    return data.available;
    */

    // Mock implementation - simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock - check against some reserved nicknames
    const reservedNicknames = ['admin', 'test', '관리자', '테스트'];
    return !reservedNicknames.includes(nickname.toLowerCase());
  } catch (error) {
    console.error('[AUTH] Check nickname availability error:', error);
    return false;
  }
}

/**
 * Logout current user
 */
export async function logout() {
  try {
    await AsyncStorage.removeItem('currentUser');
    console.log('[AUTH] User logged out');
  } catch (error) {
    console.error('[AUTH] Logout error:', error);
    throw new Error('로그아웃에 실패했습니다.');
  }
}
