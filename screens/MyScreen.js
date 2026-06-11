import React from 'react';
import { StyleSheet, View, ScrollView, Text, Modal, Pressable, Animated, PanResponder, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { updateUser } from '../services/firestore';
import { storage, auth } from '../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signInAnonymously } from 'firebase/auth';
import { Colors, Spacing, Typography, BorderRadius } from '../styles';
import UserProfile from '../components/UserProfile';
import IconButton from '../components/IconButton';
import EditIcon from '../components/EditIcon';
import PopupHeader from '../components/PopupHeader';
import FeedItem from '../components/FeedItem';
import SubTab from '../components/SubTab';
import SimbolOutlineIcon from '../components/SimbolOutlineIcon';
import SettingIcon from '../components/SettingIcon';
import TextField from '../components/TextField';
import Button from '../components/Button';
import DefaultHeader from '../components/DefaultHeader';
import ArrowRightIcon from '../components/ArrowRightIcon';
import TermsDetailModal from '../components/TermsDetailModal';
import ModalPopup from '../components/ModalPopup';
import WithdrawModal from '../components/WithdrawModal';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { formatTimeAgo } from '../utils/formatTimeAgo';

function KakaoIcon() {
  return (
    <Svg width={32} height={32} viewBox="0 0 40 40">
      <Circle cx="20" cy="20" r="20" fill="#FEE500"/>
      <Path d="M20 10C14.477 10 10 13.582 10 18C10 20.71 11.656 23.102 14.22 24.594L13.17 28.406C13.09 28.695 13.406 28.926 13.656 28.754L18.156 25.84C18.76 25.926 19.375 25.97 20 25.97C25.523 25.97 30 22.418 30 18C30 13.582 25.523 10 20 10Z" fill="#3C1E1E"/>
    </Svg>
  );
}

function GoogleIcon() {
  return (
    <Svg width={32} height={32} viewBox="0 0 40 40">
      <Circle cx="20" cy="20" r="20" fill="white" stroke="#E0E0E0" strokeWidth="1"/>
      <Path d="M29.6 20.227c0-.709-.064-1.39-.182-2.045H20v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4"/>
      <Path d="M20 30c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.759-5.595-4.123h-3.341v2.59A9.996 9.996 0 0020 30z" fill="#34A853"/>
      <Path d="M14.405 21.9a6.003 6.003 0 010-3.8v-2.59h-3.341a10.002 10.002 0 000 8.98l3.341-2.59z" fill="#FBBC05"/>
      <Path d="M20 13.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C24.959 10.99 22.695 10 20 10a9.996 9.996 0 00-8.936 5.51l3.341 2.59C15.19 15.736 17.395 13.977 20 13.977z" fill="#EA4335"/>
    </Svg>
  );
}

function AppleIcon() {
  return (
    <Svg width={32} height={32} viewBox="0 0 40 40">
      <Circle cx="20" cy="20" r="20" fill="#000000"/>
      <Path d="M21.51 12.27C22.18 11.46 22.63 10.36 22.5 9.25C21.54 9.29 20.38 9.88 19.69 10.69C19.07 11.41 18.52 12.54 18.68 13.62C19.75 13.7 20.84 13.08 21.51 12.27ZM22.49 13.85C20.91 13.75 19.57 14.74 18.82 14.74C18.07 14.74 16.92 13.9 15.67 13.92C14.05 13.95 12.55 14.85 11.72 16.28C10.03 19.14 11.28 23.38 12.92 25.7C13.72 26.84 14.69 28.1 15.97 28.06C17.18 28.01 17.65 27.27 19.1 27.27C20.55 27.27 20.97 28.06 22.25 28.03C23.57 28.01 24.41 26.89 25.21 25.75C26.12 24.44 26.49 23.17 26.51 23.1C26.48 23.09 24.13 22.17 24.1 19.38C24.08 17.04 25.95 15.93 26.04 15.87C24.97 14.27 23.3 13.92 22.49 13.85Z" fill="white"/>
    </Svg>
  );
}

export default function MyScreen({ reviews = [], currentUser, readingRecords = [], readingBooks = [], onBookPress, showSettings = false, onSettingsClose, onLogout, onWithdraw, onUpdateUser }) {
  const insets = useSafeAreaInsets();
  const [isProfileModalVisible, setIsProfileModalVisible] = React.useState(false);
  const profileModalTranslateY = React.useRef(new Animated.Value(300)).current;
  const [showProfileEdit, setShowProfileEdit] = React.useState(false);
  const [nicknameInput, setNicknameInput] = React.useState('');
  const [nicknameError, setNicknameError] = React.useState('');
  const [isNicknameValid, setIsNicknameValid] = React.useState(false);
  const [selectedTerm, setSelectedTerm] = React.useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);
  const [showWithdraw, setShowWithdraw] = React.useState(false);
  const [user, setUser] = React.useState({
    nickname: 'User name',
    profileImage: null,
  });

  React.useEffect(() => {
    loadUserData();
  }, []);

  React.useEffect(() => {
    if (currentUser?.nickname || currentUser?.name) {
      setUser(prev => ({
        ...prev,
        nickname: currentUser.nickname || currentUser.name || prev.nickname,
        profileImage: currentUser.profileImage || prev.profileImage,
      }));
    }
  }, [currentUser]);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('currentUser');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser({
          nickname: parsedUser.nickname || parsedUser.name || 'User name',
          profileImage: parsedUser.profileImage || null,
        });
      }
    } catch (error) {}
  };

  const saveUserData = async (updatedUser) => {
    try {
      const userData = await AsyncStorage.getItem('currentUser');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        await AsyncStorage.setItem('currentUser', JSON.stringify({ ...parsedUser, profileImage: updatedUser.profileImage }));
      }
    } catch (error) {}
  };

  const profilePanResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderMove: (_, g) => { if (g.dy > 0) profileModalTranslateY.setValue(g.dy); },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 100) {
          handleCloseProfileModal();
        } else {
          Animated.spring(profileModalTranslateY, { toValue: 0, useNativeDriver: true, tension: 50, friction: 10 }).start();
        }
      },
    })
  ).current;

  const handleOpenProfileModal = () => {
    setIsProfileModalVisible(true);
    Animated.spring(profileModalTranslateY, { toValue: 0, useNativeDriver: true, tension: 50, friction: 10 }).start();
  };

  const handleCloseProfileModal = () => {
    Animated.timing(profileModalTranslateY, { toValue: 300, duration: 200, useNativeDriver: true }).start(() => {
      setIsProfileModalVisible(false);
    });
  };

  const handleSelectImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('권한 필요', '앨범에 접근하려면 권한이 필요합니다.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 1 });
    handleCloseProfileModal();
    if (!result.canceled && result.assets?.length > 0) {
      const localUri = result.assets[0].uri;
      setUser(prev => ({ ...prev, profileImage: localUri }));
      try {
        let profileImage = localUri;
        if (currentUser?.id) {
          if (!auth.currentUser) await signInAnonymously(auth).catch(() => {});
          const response = await fetch(localUri);
          const blob = await response.blob();
          const storageRef = ref(storage, `profileImages/${currentUser.id}`);
          await uploadBytes(storageRef, blob);
          profileImage = await getDownloadURL(storageRef);
        }
        setUser(prev => ({ ...prev, profileImage }));
        if (currentUser?.id) await updateUser(currentUser.id, { profileImage });
        const stored = await AsyncStorage.getItem('currentUser');
        if (stored) {
          const updated = { ...JSON.parse(stored), profileImage };
          await AsyncStorage.setItem('currentUser', JSON.stringify(updated));
          onUpdateUser?.(updated);
        }
      } catch (e) { console.error('프로필 이미지 업로드 실패:', e?.code, e?.message); }
    }
  };

  const handleDefaultImage = async () => {
    handleCloseProfileModal();
    const newUser = { ...user, profileImage: null };
    setUser(newUser);
    try {
      if (currentUser?.id) await updateUser(currentUser.id, { profileImage: null });
      const stored = await AsyncStorage.getItem('currentUser');
      if (stored) {
        const updated = { ...JSON.parse(stored), profileImage: null };
        await AsyncStorage.setItem('currentUser', JSON.stringify(updated));
        onUpdateUser?.(updated);
      }
    } catch {}
  };

  React.useEffect(() => {
    if (!showProfileEdit) return;
    if (nicknameInput.length === 0) { setNicknameError(''); setIsNicknameValid(false); return; }
    const timer = setTimeout(() => {
      if (/[!@#$%^&*(),.?":{}|<>]/.test(nicknameInput)) {
        setNicknameError('!@#$등 특수문자는 사용할 수 없습니다.'); setIsNicknameValid(false);
      } else if (nicknameInput.length < 2) {
        setNicknameError('2자 이상으로 입력해주세요.'); setIsNicknameValid(false);
      } else {
        setNicknameError(''); setIsNicknameValid(true);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [nicknameInput, showProfileEdit]);

  const handleOpenProfileEdit = () => {
    setNicknameInput(user.nickname);
    setNicknameError('');
    setIsNicknameValid(true);
    setShowProfileEdit(true);
  };

  const handleSaveProfile = async () => {
    if (!isNicknameValid) return;
    const newUser = { ...user, nickname: nicknameInput };
    setUser(newUser);
    try {
      if (currentUser?.id) {
        await updateUser(currentUser.id, { nickname: nicknameInput, profileImage: user.profileImage ?? null });
      }
      const stored = await AsyncStorage.getItem('currentUser');
      const base = stored ? JSON.parse(stored) : {};
      const updated = { ...base, nickname: nicknameInput, profileImage: user.profileImage ?? null };
      await AsyncStorage.setItem('currentUser', JSON.stringify(updated));
      onUpdateUser?.(updated);
    } catch {}
    setShowProfileEdit(false);
  };

  const getBook = (item) => {
    const isbn = item.bookIsbn ?? item.isbn;
    const found = readingBooks.find(b => String(b.isbn) === String(isbn));
    const fallbackCover = found ? (found.coverImage ?? found.cover) : null;
    if (item.book) return { ...item.book, cover: item.book.cover || fallbackCover };
    if (found) return { title: found.title, author: found.author, cover: fallbackCover };
    return null;
  };

  // 내 독후감만 필터 (최신순)
  const myReviews = [...reviews]
    .filter(r => r.userId === currentUser?.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // 독서한 날 수 계산
  const readingDays = React.useMemo(() => {
    const dates = new Set(readingRecords.map(r => r.date));
    return dates.size;
  }, [readingRecords]);

  return (
    <>
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + 60 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* 프로필 영역 */}
          <View style={styles.profileSection}>
            <TouchableOpacity style={styles.profileImageContainer} onPress={handleOpenProfileEdit} activeOpacity={0.7}>
              <UserProfile imageUri={user.profileImage} size={64} style={styles.profileImage} />
              <View style={styles.editIconButton}>
                <IconButton size={28} onPress={handleOpenProfileEdit}>
                  <EditIcon />
                </IconButton>
              </View>
            </TouchableOpacity>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user.nickname}</Text>
              <Text style={styles.readingDays}>
                <Text style={styles.readingDaysHighlight}>{readingDays}일째 </Text>독서중이에요
              </Text>
            </View>
          </View>

          {/* 탭 */}
          <View style={styles.tabRow}>
            <SubTab active={true}>독후감</SubTab>
          </View>

          {/* 내 독후감 피드 */}
          {myReviews.length > 0 ? (
            <View style={styles.feedList}>
              {myReviews.map(item => (
                <FeedItem
                  key={item.id}
                  id={item.id}
                  type={item.type}
                  user={{ name: user.nickname, profileImage: user.profileImage }}
                  timeAgo={item.createdAt ? formatTimeAgo(item.createdAt) : item.timeAgo}
                  page={item.page}
                  content={item.content}
                  images={item.images}
                  likes={item.likes}
                  comments={item.comments}
                  isSpoiler={false}
                  myCurrentPage={Infinity}
                  isCompleted={item.isCompleted}
                  isMyReview={true}
                  showBookInfo={true}
                  book={getBook(item)}
                  onBookPress={(book) => onBookPress && onBookPress({ ...book, isbn: item.bookIsbn, coverImage: book?.cover })}
                />
              ))}
            </View>
          ) : (
            <View style={styles.empty}>
              <SimbolOutlineIcon width={24} height={24} color={Colors.gray400} />
              <Text style={styles.emptyText}>아직 작성된 독후감이 없어요</Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* 프로필 수정 서브 페이지 */}
      {showProfileEdit && (
        <View style={styles.profileEditContainer}>
          <DefaultHeader
            title="프로필 수정"
            onBack={() => setShowProfileEdit(false)}
            hideRightButton
            backgroundColor={Colors.white}
            showBlur={false}
            topInset={insets.top}
          />

          {/* 콘텐츠 */}
          <View style={[styles.profileEditContent, { marginTop: insets.top + 52 }]}>
            {/* 프로필 이미지 */}
            <View style={styles.profileEditImageContainer}>
              <UserProfile imageUri={user.profileImage} size={80} style={styles.profileEditImage} />
              <View style={styles.profileEditIconButton}>
                <IconButton size={28} onPress={handleOpenProfileModal}>
                  <EditIcon />
                </IconButton>
              </View>
            </View>

            {/* 닉네임 입력 */}
            <View style={styles.profileEditField}>
              <TextField
                value={nicknameInput}
                onChangeText={(text) => setNicknameInput(text.replace(/\s/g, '').slice(0, 8))}
                placeholder="username"
                helpText={nicknameError || '띄어쓰기 없이 8자 이내로 입력해주세요'}
                error={!!nicknameError}
                maxLength={8}
              />
            </View>
          </View>

          {/* 수정 버튼 */}
          <View style={[styles.profileEditBottom, { paddingBottom: insets.bottom + Spacing.md }]}>
            <Button variant="primary" size="xxlarge" onPress={handleSaveProfile} disabled={!isNicknameValid || !!nicknameError}>
              수정
            </Button>
          </View>
        </View>
      )}

      {/* 프로필 이미지 변경 바텀시트 */}
      {isProfileModalVisible && (
        <Modal visible transparent animationType="none" onRequestClose={handleCloseProfileModal}>
          <Pressable style={styles.modalOverlay} onPress={handleCloseProfileModal}>
            <Animated.View style={[styles.modalContainer, { transform: [{ translateY: profileModalTranslateY }] }]}>
              <Pressable onPress={e => e.stopPropagation()}>
                <View {...profilePanResponder.panHandlers}>
                  <PopupHeader title="프로필 이미지" />
                </View>
                <View style={styles.modalBody}>
                  <View style={styles.optionBox}>
                    <TouchableOpacity style={styles.optionItem} onPress={handleSelectImage}>
                      <Text style={styles.optionText}>이미지 선택</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.optionItem} onPress={handleDefaultImage}>
                      <Text style={styles.optionText}>기본 이미지</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Pressable>
            </Animated.View>
          </Pressable>
        </Modal>
      )}

      {/* 설정 페이지 */}
      {showSettings && (
        <View style={styles.profileEditContainer}>
          <DefaultHeader
            title="설정"
            onBack={() => onSettingsClose?.()}
            hideRightButton
            backgroundColor={Colors.white}
            showBlur={false}
            topInset={insets.top}
          />
          <ScrollView style={{ marginTop: insets.top + 52 }} contentContainerStyle={{ paddingTop: Spacing.lg }} showsVerticalScrollIndicator={false}>
            {/* 계정 섹션 */}
            <View style={styles.settingSection}>
              <Text style={styles.settingSectionLabel}>계정</Text>
              <View style={styles.settingRow}>
                <Text style={styles.settingRowLabel}>연동 계정</Text>
                <View style={styles.settingRowIcons}>
                  <View style={{ opacity: currentUser?.provider === 'kakao' ? 1 : 0.3 }}>
                    <KakaoIcon />
                  </View>
                  <View style={{ opacity: currentUser?.provider === 'google' ? 1 : 0.3 }}>
                    <GoogleIcon />
                  </View>
                  <View style={{ opacity: currentUser?.provider === 'apple' ? 1 : 0.3 }}>
                    <AppleIcon />
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.settingDivider} />

            {/* 앱 정보 섹션 */}
            <View style={styles.settingSection}>
              <Text style={styles.settingSectionLabel}>앱 정보</Text>
              <View style={styles.settingRow}>
                <Text style={styles.settingRowLabel}>버전 정보</Text>
                <Text style={styles.settingRowValue}>1.0.0</Text>
              </View>
              <TouchableOpacity style={styles.settingRow} activeOpacity={0.7} onPress={() => setSelectedTerm('service')}>
                <Text style={styles.settingRowLabel}>이용약관</Text>
                <ArrowRightIcon width={16} height={16} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingRow} activeOpacity={0.7} onPress={() => setSelectedTerm('privacy')}>
                <Text style={styles.settingRowLabel}>개인정보 처리방침</Text>
                <ArrowRightIcon width={16} height={16} />
              </TouchableOpacity>
            </View>

            <View style={styles.settingDivider} />

            {/* 로그아웃 / 회원 탈퇴 */}
            <View style={styles.settingSection}>
              <TouchableOpacity style={styles.settingRow} activeOpacity={0.7} onPress={() => setShowLogoutConfirm(true)}>
                <Text style={styles.settingRowLabel}>로그아웃</Text>
                <ArrowRightIcon width={16} height={16} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingRow} activeOpacity={0.7} onPress={() => setShowWithdraw(true)}>
                <Text style={styles.settingRowLabel}>회원 탈퇴</Text>
                <ArrowRightIcon width={16} height={16} />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      )}

      <TermsDetailModal
        visible={selectedTerm !== null}
        termId={selectedTerm}
        onClose={() => setSelectedTerm(null)}
      />

      <WithdrawModal
        visible={showWithdraw}
        onClose={() => setShowWithdraw(false)}
        onWithdraw={() => {
          setShowWithdraw(false);
          setTimeout(() => onWithdraw?.(), 300);
        }}
      />

      <ModalPopup
        visible={showLogoutConfirm}
        title="로그아웃할까요?"
        primaryButtonText="로그아웃"
        secondaryButtonText="취소"
        onPrimaryPress={() => {
          setShowLogoutConfirm(false);
          setTimeout(() => onLogout?.(), 300);
        }}
        onSecondaryPress={() => setShowLogoutConfirm(false)}
        onClose={() => setShowLogoutConfirm(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    // paddingVertical: Spacing.lg,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xxl,
  },
  profileImageContainer: {
    position: 'relative',
    width: 64,
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.xxl,
    borderWidth: 1,
    borderColor: Colors.gray100,
  },
  editIconButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  profileInfo: {
    flex: 1,
    gap: Spacing.xxs,
  },
  userName: {
    ...Typography.headline2Medium,
    color: Colors.gray900,
  },
  readingDays: {
    ...Typography.body2Regular,
    color: Colors.gray900,
  },
  readingDaysHighlight: {
    color: Colors.primary600,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray50,
  },
  feedList: {
    // paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.huge,
    // gap: Spacing.xxl,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingTop: 80,
  },
  emptyText: {
    ...Typography.subtitle1Medium,
    color: Colors.gray500,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  modalBody: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.huge,
  },
  optionBox: {
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
  },
  optionItem: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  optionText: {
    ...Typography.body1Medium,
    color: Colors.gray900,
  },

  // 프로필 수정 페이지
  profileEditContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.white,
    zIndex: 100,
  },
  profileEditContent: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xxl,
    gap: Spacing.xxl,
  },
  profileEditImageContainer: {
    alignSelf: 'center',
    position: 'relative',
    width: 80,
  },
  profileEditImage: {
    width: 80,
    height: 80,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: Colors.gray100,
    // paddingHorizontal: Spacing.sm,
  },
  profileEditIconButton: {
    position: 'absolute',
    right: -Spacing.sm,
    bottom: 0,
  },
  profileEditField: {
    gap: Spacing.xs,
  },
  profileEditBottom: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },

  // 설정 페이지
  settingSection: {
    // paddingTop: Spacing.sm,
    // gap: Spacing.xxl,
  },
  settingSectionLabel: {
    ...Typography.body2Regular,
    color: Colors.gray500,
    marginLeft: Spacing.lg,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // paddingVertical: Spacing.sm,
    height: 48,
    paddingHorizontal: Spacing.lg,
  },
  settingRowLabel: {
    ...Typography.body1Medium,
    color: Colors.gray900,
  },
  settingRowValue: {
    ...Typography.body2Regular,
    color: Colors.gray600,
  },
  settingRowIcons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  settingDivider: {
    height: 1,
    backgroundColor: Colors.gray50,
    marginVertical: Spacing.xxl,
  },
});
