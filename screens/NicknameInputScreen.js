import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Colors, Typography } from '../styles';
import { Spacing } from '../styles/spacing';
import DefaultHeader from '../components/DefaultHeader';
import TextField from '../components/TextField';
import Button from '../components/Button';
import { checkNicknameAvailability } from '../services/auth';

export default function NicknameInputScreen({ onNext, onBack }) {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);

  // 0.5초 디바운스 후 유효성 검사
  useEffect(() => {
    // 닉네임이 비어있으면 검사하지 않음
    if (nickname.length === 0) {
      setError('');
      setIsValid(false);
      return;
    }

    // 0.5초 디바운스
    const timer = setTimeout(async () => {
      await validateNickname(nickname);
    }, 500);

    return () => clearTimeout(timer);
  }, [nickname]);

  const validateNickname = async (value) => {
    setIsValidating(true);
    setIsValid(false);

    // 1. 띄어쓰기 검사
    if (/\s/.test(value)) {
      setError('띄어쓰기는 사용할 수 없습니다.');
      setIsValidating(false);
      return false;
    }

    // 2. 특수문자 검사
    if (/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      setError('!@#$등 특수문자는 사용할 수 없습니다.');
      setIsValidating(false);
      return false;
    }

    // 3. 최소 길이 검사
    if (value.length < 2) {
      setError('2자 이상으로 입력해주세요.');
      setIsValidating(false);
      return false;
    }

    // 4. 최대 길이 검사
    if (value.length > 8) {
      setError('8자 이내로 입력해주세요.');
      setIsValidating(false);
      return false;
    }

    // 5. 중복 검사 (API 호출)
    const isAvailable = await checkNicknameAvailability(value);
    if (!isAvailable) {
      setError('중복되는 닉네임입니다.');
      setIsValidating(false);
      return false;
    }

    // 모든 검사 통과
    setError('');
    setIsValid(true);
    setIsValidating(false);
    return true;
  };

  const handleNicknameChange = (value) => {
    // 띄어쓰기 자동 제거
    const trimmed = value.replace(/\s/g, '');
    setNickname(trimmed);
  };

  const handleNext = async () => {
    // 버튼 클릭 시 유효성 검사 실행
    const valid = await validateNickname(nickname);
    if (valid) {
      onNext({ nickname });
    }
  };

  const canProceed = nickname.length > 0 && !isValidating;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <DefaultHeader
        onBack={onBack}
        title="회원가입"
        showBlur={false}
        iconColor={Colors.gray900}
        rightButtons={[]}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
          <View style={styles.content}>
            {/* Title */}
            <Text style={styles.title}>닉네임을 입력해주세요</Text>

            {/* Nickname Input */}
            <TextField
              value={nickname}
              onChangeText={handleNicknameChange}
              placeholder="닉네임"
              autoFocus={true}
              helpText={error || "띄어쓰기 없이 8자 이내로 입력해주세요"}
              error={!!error}
              maxLength={8}
            />
          </View>

          {/* Bottom Button */}
          <View style={styles.bottomButtonContainer}>
            <Button
              variant="primary"
              size="xxlarge"
              onPress={handleNext}
              disabled={!canProceed}
              style={styles.bottomButton}
            >
              다음
            </Button>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 64, // Space for header
    paddingHorizontal: Spacing.md,
    gap: Spacing.xxxl,
  },
  title: {
    ...Typography.headline2Medium,
    color: Colors.gray900,
    marginTop: 72,
    marginLeft: Spacing.sm,
  },
  bottomButtonContainer: {
    paddingHorizontal: Spacing.xl,
    // paddingBottom: Spacing.lg,
    paddingTop: Spacing.md,
  },
  bottomButton: {
    width: '100%',
  },
});
