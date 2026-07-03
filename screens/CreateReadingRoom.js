import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors, Typography, Spacing, BorderRadius } from '../styles';
import TextField from '../components/TextField';
import Button from '../components/Button';
import IconButton from '../components/IconButton';
import SectionTitle from '../components/SectionTitle';
import CloseIcon from '../components/CloseIcon';
import DefaultHeader from '../components/DefaultHeader';
import PlusIcon from '../components/PlusIcon';
import MinusIcon from '../components/MinusIcon';
import CalendarIcon from '../components/CalendarIcon';
import Switch from '../components/Switch';
import BookTopSection from '../components/BookTopSection';
import ModalPopup from '../components/ModalPopup';
import DatePickerModal from '../components/DatePickerModal';
import { fetchBookDetail, searchBooks, formatAuthorForDetail } from '../services/aladinApi';
import { createRoomWithCode } from '../services/firestore';
import { auth } from '../services/firebase';

export default function CreateReadingRoom({
  isbn,
  bookTitle = null,
  bookSubtitle,
  author = null,
  coverImage,
  onBack,
  onNext,
  style,
}) {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [roomName, setRoomName] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [participantCount, setParticipantCount] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [hasDeadline, setHasDeadline] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [bookData, setBookData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [roomNameError, setRoomNameError] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // displayTitle 확정되면 룸 이름 자동 세팅 (사용자가 직접 수정하지 않은 경우에만)
  const hasEditedRoomName = React.useRef(false);
  React.useEffect(() => {
    if (hasEditedRoomName.current || !displayTitle) return;
    const suffix = ' 도토리룸';
    const maxTitleLen = 20 - suffix.length - 1; // 1 = '…' 길이
    const title = displayTitle.length > 15
      ? `${displayTitle.slice(0, maxTitleLen)}…`
      : displayTitle;
    setRoomName(`${title}${suffix}`);
  }, [displayTitle]);

  // BookDetail과 동일한 API 로딩 패턴
  React.useEffect(() => {
    if (!isbn && !bookTitle) return;

    const loadBookDetail = async () => {
      setIsLoading(true);
      try {
        let targetIsbn = isbn;

        if (bookTitle) {
          const norm = (s) => (s || '').split(' - ')[0].trim().toLowerCase();
          const results = await searchBooks(bookTitle, 'Title', 3);
          const match = results?.find(b => {
            const t = norm(b.title);
            const s = norm(bookTitle);
            return t === s || t.includes(s) || s.includes(t);
          }) || results?.[0];
          if (match?.isbn) targetIsbn = match.isbn;
        }

        const data = await fetchBookDetail(targetIsbn);
        setBookData(data);
      } catch {
        // 조회 실패 시 props fallback으로 표시
      } finally {
        setIsLoading(false);
      }
    };

    loadBookDetail();
  }, [isbn, bookTitle]);

  // BookDetail과 동일한 display 값 계산
  const fullTitle = bookTitle || bookData?.title || '';
  const titleParts = fullTitle.split(' - ');
  const displayTitle = titleParts[0].trim();
  const displaySubtitle = titleParts.length > 1
    ? titleParts.slice(1).join(' - ').trim()
    : (bookData?.subTitle || bookData?.subtitle || bookSubtitle);
  const authorData = formatAuthorForDetail(author || bookData?.author);
  const translatorRoles = ['옮긴이', '번역', '역자', '역'];
  const mainAuthors = authorData.filter(a => !a.role || !translatorRoles.some(r => a.role.includes(r)));
  const displayAuthor = mainAuthors.length > 0
    ? mainAuthors.map(a => a.name).join(', ')
    : (author?.split(',')[0].trim() ?? '');
  const displayCover = coverImage || bookData?.cover;

  const handleIncrement = () => setParticipantCount(prev => prev + 1);
  const handleDecrement = () => setParticipantCount(prev => Math.max(0, prev - 1));

  const handleNext = async () => {
    if (!roomName.trim()) {
      setRoomNameError(true);
      return;
    }
    setIsCreating(true);
    try {
      const uid = auth.currentUser?.uid;
      const { id: roomId, roomCode } = await createRoomWithCode({
        name: roomName,
        isPublic,
        maxParticipants: isPublic ? participantCount : 0,
        deadline: hasDeadline ? selectedDate.toISOString() : null,
        bookIsbn: isbn || bookData?.isbn || null,
        bookTitle: displayTitle || null,
        bookAuthor: displayAuthor || null,
        bookCover: displayCover || null,
        createdBy: uid || null,
      });
      onNext?.({ roomId, roomCode, roomName });
    } catch {
      // 생성 실패 시 무시 (향후 toast 추가 가능)
    } finally {
      setIsCreating(false);
    }
  };

  const handleClosePress = () => setShowCloseModal(true);
  const handleConfirmClose = () => {
    setShowCloseModal(false);
    onBack?.();
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) setSelectedDate(date);
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}년 ${month}월 ${day}일 까지`;
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, style]}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <BookTopSection
          bookTitle={displayTitle}
          bookSubtitle={displaySubtitle}
          author={displayAuthor}
          coverImage={displayCover}
          paddingTop={insets.top + 67}
          isLoading={isLoading}
        />

        <View style={styles.formSection}>
          {/* 룸 이름 */}
          <View>
            <SectionTitle required>도토리룸 명</SectionTitle>
            <TextField
              value={roomName}
              onChangeText={(text) => {
                const filtered = text.replace(/[^가-힣a-zA-Z0-9 !?.]/g, '');
                if (filtered.length > 20) return;
                hasEditedRoomName.current = true;
                setRoomNameError(false);
                setRoomName(filtered);
              }}
              error={roomNameError}
              helpText="20자 이하로 입력해주세요. (!?.만 허용)"
              placeholder="룸 이름을 입력하세요"
            />
          </View>

          {/* 공개/비공개 */}
          <View>
            <View style={styles.toggleRow}>
              <View style={styles.toggleTextContainer}>
                <SectionTitle>도토리 룸 공개</SectionTitle>
                <Text style={styles.helpText}>* 자유롭게 참여하고 독후감을 볼 수 있습니다.</Text>
              </View>
              <Switch value={isPublic} onValueChange={setIsPublic} />
            </View>
          </View>

          {/* 인원 (공개일 때만) */}
          {isPublic && (
            <View>
              <SectionTitle required>인원</SectionTitle>
              <View style={styles.participantRow}>
                <View style={styles.participantInputContainer}>
                  <TextField
                    value={String(participantCount)}
                    onChangeText={(text) => {
                      const num = parseInt(text, 10);
                      if (!isNaN(num) && num >= 0) setParticipantCount(num);
                      else if (text === '') setParticipantCount(0);
                    }}
                    placeholder="0"
                    keyboardType="numeric"
                  />
                  <Text style={styles.helpText}>* 자신을 포함한 명 수, 0명 : 제한 없음</Text>
                </View>
                <View style={styles.counterButtons}>
                  <IconButton onPress={handleDecrement} size={48}>
                    <MinusIcon width={24} height={24} color={Colors.gray700} />
                  </IconButton>
                  <IconButton onPress={handleIncrement} size={48}>
                    <PlusIcon width={24} height={24} color={Colors.gray700} />
                  </IconButton>
                </View>
              </View>
            </View>
          )}

          {/* 기간 */}
          <View>
            <View style={styles.toggleRow}>
              <SectionTitle>기간</SectionTitle>
              <Switch value={hasDeadline} onValueChange={setHasDeadline} />
            </View>
            {hasDeadline && (
              <TouchableOpacity
                style={styles.dateField}
                onPress={() => setShowDatePicker(true)}
              >
                <CalendarIcon width={24} height={24} color={Colors.gray700} />
                <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      {showDatePicker && (Platform.OS === 'ios' ? (
        <DatePickerModal
          visible={showDatePicker}
          value={selectedDate}
          minimumDate={new Date()}
          onChange={handleDateChange}
          onClose={() => setShowDatePicker(false)}
          title="기간 설정"
        />
      ) : (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      ))}

      <DefaultHeader
        title="같이 읽기"
        gradientOpacity={headerOpacity}
        gradientStyle={{ height: 120 }}
        rightButton={<CloseIcon width={24} height={24} color={Colors.gray700} />}
        onMenu={handleClosePress}
      />

      <ModalPopup
        visible={showCloseModal}
        title="도토리룸 만들기를 취소할까요?"
        primaryButtonText="취소"
        secondaryButtonText="아니요"
        onPrimaryPress={handleConfirmClose}
        onSecondaryPress={() => setShowCloseModal(false)}
        onClose={() => setShowCloseModal(false)}
      />

      <SafeAreaView style={styles.bottomContainer} edges={['bottom']}>
        <LinearGradient
          colors={['rgba(255,255,255,0.00)', 'rgba(255,255,255,0.84)', '#FFFFFF']}
          locations={[0, 0.4451, 1]}
          style={styles.bottomGradient}
        >
          <Button variant="primary" size="xxlarge" onPress={handleNext} disabled={isCreating} style={styles.nextButton}>
            {isCreating ? '만드는 중...' : '만들기'}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  formSection: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl,
    gap: Spacing.huge,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  toggleTextContainer: {
    flex: 1,
    // gap: Spacing.xs,
  },
  helpText: {
    ...Typography.caption1Regular,
    color: Colors.gray600,
    paddingLeft: Spacing.sm,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  participantInputContainer: {
    flex: 1,
    gap: Spacing.xs,
  },
  counterButtons: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.gray200,
    overflow: 'hidden',
  },
  dateField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    height: 48,
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  dateText: {
    ...Typography.body1Regular,
    fontSize: 15,
    color: Colors.gray900,
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
  nextButton: {
    width: 296,
  },
});
