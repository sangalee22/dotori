import React from 'react';
import { View, Text, StyleSheet, Share, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius } from '../styles';
import BookTopSection from '../components/BookTopSection';
import DefaultHeader from '../components/DefaultHeader';
import IconButton from '../components/IconButton';
import Button from '../components/Button';
import CopyIcon from '../components/CopyIcon';
import { useToast } from '../contexts/ToastContext';

export default function RoomCreatedScreen({
  isbn,
  bookTitle,
  bookSubtitle,
  author,
  coverImage,
  roomName,
  roomCode,
  onDone,
  style,
}) {
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const handleCopy = async () => {
    try {
      await Share.share({ message: roomCode });
    } catch {
      showToast('코드를 복사할 수 없어요.');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `도토리룸에 초대합니다!\n룸 이름: ${roomName}\n참여 코드: ${roomCode}`,
      });
    } catch {}
  };

  return (
    <View style={[styles.container, style]}>
      <StatusBar style="dark" />

      <View style={styles.scroll}>
        <BookTopSection
          bookTitle={bookTitle}
          bookSubtitle={bookSubtitle}
          author={author}
          coverImage={coverImage}
          paddingTop={insets.top + 67}
        />

        <View style={styles.content}>
          <Text style={styles.roomName}>{roomName}</Text>

          <View style={styles.codeRow}>
            <View style={styles.codeBox}>
              <Text style={styles.codeLabel}>참여 코드</Text>
              <Text style={styles.codeText}>{roomCode}</Text>
            </View>
            <IconButton onPress={handleCopy}>
              <CopyIcon width={24} height={24} color={Colors.gray700} />
            </IconButton>
          </View>

          <Text style={styles.codeDesc}>
            이 코드를 친구에게 공유하면 같이 읽기에 참여할 수 있어요.
          </Text>
        </View>
      </View>

      <DefaultHeader
        title="같이 읽기"
        topInset={insets.top}
        rightButton={
          <TouchableOpacity onPress={onDone} style={styles.doneButton}>
            <Text style={styles.doneText}>완료</Text>
          </TouchableOpacity>
        }
        onMenu={onDone}
        showBlur={false}
      />

      <SafeAreaView style={styles.bottomContainer} edges={['bottom']}>
        <LinearGradient
          colors={['rgba(255,255,255,0.00)', 'rgba(255,255,255,0.84)', '#FFFFFF']}
          locations={[0, 0.4451, 1]}
          style={styles.bottomGradient}
        >
          <Button variant="primary" size="xxlarge" onPress={handleShare} style={styles.shareButton}>
            공유하기
          </Button>
        </LinearGradient>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    gap: Spacing.xl,
  },
  roomName: {
    ...Typography.headline2Bold,
    color: Colors.gray900,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  codeBox: {
    gap: Spacing.xxs,
  },
  codeLabel: {
    ...Typography.caption1Regular,
    color: Colors.gray500,
  },
  codeText: {
    ...Typography.headline2Bold,
    color: Colors.primary500,
    letterSpacing: 4,
  },
  codeDesc: {
    ...Typography.body2Regular,
    color: Colors.gray500,
    lineHeight: 20,
  },
  doneButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  doneText: {
    ...Typography.subtitle1Medium,
    color: Colors.primary500,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomGradient: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
  },
  shareButton: {
    width: 296,
  },
});
