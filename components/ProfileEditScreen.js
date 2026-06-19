import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, PanResponder, Alert, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInAnonymously } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '../services/firebase';
import { updateUser } from '../services/firestore';
import { Colors, Spacing, Typography, BorderRadius } from '../styles';
import UserProfile from './UserProfile';
import IconButton from './IconButton';
import EditFillIcon from './EditFillIcon';
import PopupHeader from './PopupHeader';
import DefaultHeader from './DefaultHeader';
import TextField from './TextField';
import Button from './Button';
import { resizeImage } from '../utils/pickImage';
import { useToast } from '../contexts/ToastContext';

export default function ProfileEditScreen({ currentUser, slideAnim, onClose, onSave }) {
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const [nicknameInput, setNicknameInput] = React.useState(
    currentUser?.nickname || currentUser?.name || ''
  );
  const [nicknameError, setNicknameError] = React.useState('');
  const [isNicknameValid, setIsNicknameValid] = React.useState(true);
  // 선택한 이미지 로컬 URI (null = 기본이미지, undefined = 변경없음)
  const [pendingImage, setPendingImage] = React.useState(undefined);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = React.useState(false);
  const bottomSheetY = React.useRef(new Animated.Value(300)).current;
  const permissionGrantedRef = React.useRef(false);

  React.useEffect(() => {
    ImagePicker.getMediaLibraryPermissionsAsync().then(({ status }) => {
      permissionGrantedRef.current = status === 'granted';
    });
  }, []);

  const displayImage = pendingImage === undefined
    ? (currentUser?.profileImage || null)
    : pendingImage;

  React.useEffect(() => {
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
  }, [nicknameInput]);

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderMove: (_, g) => { if (g.dy > 0) bottomSheetY.setValue(g.dy); },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 100) closeBottomSheet();
        else Animated.spring(bottomSheetY, { toValue: 0, useNativeDriver: true, tension: 50, friction: 10 }).start();
      },
    })
  ).current;

  const openBottomSheet = () => {
    setIsBottomSheetVisible(true);
    Animated.spring(bottomSheetY, { toValue: 0, useNativeDriver: true, tension: 50, friction: 10 }).start();
  };

  const closeBottomSheet = (cb) => {
    Animated.timing(bottomSheetY, { toValue: 300, duration: 200, useNativeDriver: true }).start(() => {
      setIsBottomSheetVisible(false);
      cb?.();
    });
  };

  const handlePickImage = async () => {
    setIsBottomSheetVisible(false);

    if (!permissionGrantedRef.current) {
      const req = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!req.granted) {
        Alert.alert('권한 필요', '앨범에 접근하려면 권한이 필요합니다.');
        return;
      }
      permissionGrantedRef.current = true;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled && result.assets?.length > 0) {
      setPendingImage(result.assets[0].uri);
    }
  };

  const handleDefaultImage = () => {
    closeBottomSheet(() => setPendingImage(null));
  };

  const handleSave = async () => {
    if (!isNicknameValid || !!nicknameError) return;
    setIsLoading(true);
    try {
      await new Promise(r => setTimeout(r, 80));
      let profileImage = currentUser?.profileImage ?? null;

      if (pendingImage === null) {
        profileImage = null;
      } else if (pendingImage !== undefined && !pendingImage.startsWith('http')) {
        if (!auth.currentUser) await signInAnonymously(auth).catch(() => {});
        const resizedUri = await resizeImage(pendingImage, { maxSize: 500, square: true });
        const response = await fetch(resizedUri);
        const blob = await response.blob();
        const storageRef = ref(storage, `profileImages/${currentUser.id}`);
        await uploadBytes(storageRef, blob);
        profileImage = await getDownloadURL(storageRef);
      }

      if (currentUser?.id) {
        await updateUser(currentUser.id, { nickname: nicknameInput, profileImage });
      }
      const stored = await AsyncStorage.getItem('currentUser');
      const base = stored ? JSON.parse(stored) : {};
      const updated = { ...base, nickname: nicknameInput, profileImage };
      await AsyncStorage.setItem('currentUser', JSON.stringify(updated));
      showToast('프로필이 수정되었어요.');
      onSave(updated);
      // 성공 시 loading 유지 — 화면 닫힘 애니메이션 동안 스피너 표시
    } catch {
      showToast('수정에 실패했어요. 다시 시도해주세요.');
      setIsLoading(false);
    }
  };

  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, styles.container, { transform: [{ translateX: slideAnim }] }]}>
      <DefaultHeader
        title="프로필 수정"
        onBack={onClose}
        hideRightButton
        backgroundColor={Colors.white}
        showBlur={false}
        topInset={insets.top}
      />

      <View style={[styles.content, { marginTop: insets.top + 52 }]}>
        <View style={styles.imageContainer}>
          <UserProfile
            imageUri={displayImage}
            size={80}
            style={styles.profileImage}
          />
          <View style={styles.imageEditBtn}>
            <IconButton size={28} onPress={openBottomSheet}>
              <EditFillIcon />
            </IconButton>
          </View>
        </View>

        <View style={styles.fieldWrapper}>
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

      <View style={[styles.bottom, { paddingBottom: insets.bottom + Spacing.md }]}>
        <Button
          variant="primary"
          size="xxlarge"
          onPress={handleSave}
          disabled={!isNicknameValid || !!nicknameError}
          loading={isLoading}
        >
          수정
        </Button>
      </View>

      {/* 바텀시트 — Modal 없이 View로 (UIViewController 충돌 방지) */}
      {isBottomSheetVisible && (
        <Pressable style={[StyleSheet.absoluteFillObject, styles.sheetOverlay]} onPress={() => closeBottomSheet()}>
          <Animated.View style={[styles.sheetContainer, { transform: [{ translateY: bottomSheetY }] }]}>
            <Pressable onPress={e => e.stopPropagation()}>
              <View {...panResponder.panHandlers}>
                <PopupHeader title="프로필 이미지" />
              </View>
              <View style={styles.sheetBody}>
                <View style={styles.optionBox}>
                  <TouchableOpacity style={styles.optionItem} onPress={handlePickImage}>
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
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    zIndex: 200,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xxl,
    gap: Spacing.xxl,
  },
  imageContainer: {
    alignSelf: 'center',
    position: 'relative',
    width: 80,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: Colors.gray100,
  },
  imageEditBtn: {
    position: 'absolute',
    right: -Spacing.sm,
    bottom: 0,
  },
  fieldWrapper: {
    gap: Spacing.xs,
  },
  bottom: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  sheetOverlay: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
    zIndex: 20,
  },
  sheetContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  sheetBody: {
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
});
