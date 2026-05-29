import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
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
import InvitedUserItem from '../components/InvitedUserItem';
import ModalPopup from '../components/ModalPopup';
import DatePickerModal from '../components/DatePickerModal';

export default function CreateReadingRoom({
  bookTitle = 'booktitle',
  bookSubtitle,
  author = 'artist',
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
  const [selectedDate, setSelectedDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // 30일 후
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [hasEditedRoomName, setHasEditedRoomName] = useState(false);
  // 가상 데이터로 초기화 (UI 확인용)
  const [invitedFriends, setInvitedFriends] = useState([
    { id: '1', nickname: '포코어포코' },
    { id: '2', nickname: '책읽는사람' },
    { id: '3', nickname: '도토리' },
    { id: '4', nickname: '독서왕' },
    { id: '5', nickname: '리더' },
    { id: '6', nickname: '작가지망생' },
  ]);
  // 친구 목록 스크롤 상태
  const [friendScrollState, setFriendScrollState] = useState({
    isScrollable: false,
    showLeftGradient: false,
    showRightGradient: false,
  });
  // 닫기 확인 모달 상태
  const [showCloseModal, setShowCloseModal] = useState(false);

  // 다음 버튼 활성화 조건: 공개이거나, 비공개일 때 친구 초대가 있어야 함
  const isNextButtonEnabled = isPublic || invitedFriends.length > 0;

  const handleIncrement = () => {
    setParticipantCount(prev => prev + 1);
  };

  const handleDecrement = () => {
    setParticipantCount(prev => Math.max(0, prev - 1));
  };

  const handleRemoveFriend = (friendId) => {
    setInvitedFriends(prev => prev.filter(friend => friend.id !== friendId));
  };

  const handleClosePress = () => {
    setShowCloseModal(true);
  };

  const handleConfirmClose = () => {
    setShowCloseModal(false);
    if (onBack) {
      onBack();
    }
  };

  const handleFriendScroll = (event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollX = contentOffset.x;
    const scrollWidth = contentSize.width;
    const viewWidth = layoutMeasurement.width;

    const isScrollable = scrollWidth > viewWidth;
    const isAtStart = scrollX <= 5; // 5px threshold
    const isAtEnd = scrollX >= scrollWidth - viewWidth - 5; // 5px threshold

    setFriendScrollState({
      isScrollable,
      showLeftGradient: isScrollable && !isAtStart,
      showRightGradient: isScrollable && !isAtEnd,
    });
  };

  const handleFriendScrollLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    // Calculate content width: 66px per item + 4px gap between items + 16px padding
    const contentWidth = invitedFriends.length * 66 + Math.max(0, invitedFriends.length - 1) * 4 + 16;
    const isScrollable = contentWidth > width;

    setFriendScrollState({
      isScrollable,
      showLeftGradient: false,
      showRightGradient: isScrollable,
    });
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(Platform.OS === 'ios'); // iOS는 모달로 유지
    if (date) {
      setSelectedDate(date);
    }
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}년 ${month}월 ${day}일 까지`;
  };

  // Calculate header opacity based on scroll position
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
        {/* Top Section with Book Cover and Info */}
        <BookTopSection
          bookTitle={bookTitle}
          bookSubtitle={bookSubtitle}
          author={author}
          coverImage={coverImage}
          paddingTop={insets.top + 67}
        />

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Room Name */}
          <View style={styles.formField}>
            <SectionTitle style={styles.sectionTitle}>도토리룸 명</SectionTitle>
            <TextField
              value={roomName}
              onChangeText={setRoomName}
              placeholder="룸 이름을 입력하세요"
              style={styles.textField}
            />
          </View>

          {/* Public/Private Toggle */}
          <View style={styles.formField}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleTextContainer}>
                <SectionTitle style={styles.sectionTitle}>도토리 룸 공개</SectionTitle>
                <Text style={styles.helpText}>* 자유롭게 참여하고 독후감을 볼 수 있습니다.</Text>
              </View>
              <Switch value={isPublic} onValueChange={setIsPublic} />
            </View>
          </View>

          {/* Participant Count - Only show when public */}
          {isPublic && (
            <View style={styles.formField}>
              <SectionTitle style={styles.sectionTitle}>인원</SectionTitle>
              <View style={styles.participantRow}>
                <View style={styles.participantInputContainer}>
                  <TextField
                    value={String(participantCount)}
                    onChangeText={(text) => {
                      const num = parseInt(text, 10);
                      if (!isNaN(num) && num >= 0) {
                        setParticipantCount(num);
                      } else if (text === '') {
                        setParticipantCount(0);
                      }
                    }}
                    placeholder="0"
                    keyboardType="numeric"
                    style={styles.participantTextField}
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

          {/* Duration */}
          <View style={styles.formField}>
            <SectionTitle style={styles.sectionTitle}>기간</SectionTitle>
            <TouchableOpacity
              style={styles.dateField}
              onPress={() => setShowDatePicker(true)}
            >
              <CalendarIcon width={24} height={24} color={Colors.gray700} />
              <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
            </TouchableOpacity>
          </View>

          {/* Friend Invite */}
          <View style={styles.formField}>
            <SectionTitle style={styles.sectionTitle}>친구 초대</SectionTitle>
            <View style={styles.friendInviteContainer}>
              <TouchableOpacity style={styles.addFriendButton}>
                <PlusIcon width={24} height={24} color={Colors.gray700} />
              </TouchableOpacity>
              {invitedFriends.length > 0 && (
                <View style={styles.friendListWrapper} onLayout={handleFriendScrollLayout}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.friendListContent}
                    style={styles.friendList}
                    onScroll={handleFriendScroll}
                    scrollEventThrottle={16}
                  >
                    {invitedFriends.map((friend) => (
                      <InvitedUserItem
                        key={friend.id}
                        nickname={friend.nickname}
                        imageUri={friend.imageUri}
                        onRemove={() => handleRemoveFriend(friend.id)}
                      />
                    ))}
                  </ScrollView>
                  {/* Left Gradient */}
                  {friendScrollState.showLeftGradient && (
                    <LinearGradient
                      colors={['rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 0)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.friendListGradientLeft}
                      pointerEvents="none"
                    />
                  )}
                  {/* Right Gradient */}
                  {friendScrollState.showRightGradient && (
                    <LinearGradient
                      colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 1)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.friendListGradientRight}
                      pointerEvents="none"
                    />
                  )}
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Date Picker */}
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

      {/* Header */}
      <DefaultHeader
        title="같이 읽기"
        gradientOpacity={headerOpacity}
        gradientStyle={{ height: 120 }}
        rightButton={<CloseIcon width={24} height={24} color={Colors.gray700} />}
        onMenu={handleClosePress}
      />

      {/* Close Confirmation Modal */}
      <ModalPopup
        visible={showCloseModal}
        title="도토리룸 만들기를 취소할까요?"
        primaryButtonText="취소"
        secondaryButtonText="아니요"
        onPrimaryPress={handleConfirmClose}
        onSecondaryPress={() => setShowCloseModal(false)}
        onClose={() => setShowCloseModal(false)}
      />

      {/* Bottom Button */}
      <SafeAreaView style={styles.bottomContainer} edges={['bottom']}>
        <LinearGradient
            colors={['rgba(255,255,255,0.00)', 'rgba(255,255,255,0.84)', '#FFFFFF']}
            locations={[0, 0.4451, 1]}
            style={styles.bottomGradient}
          >
          <Button variant="primary" size="xlarge" onPress={onNext} disabled={!isNextButtonEnabled} style={styles.nextButton}>
            만들기
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
    gap: Spacing.xs,
  },
  helpText: {
    ...Typography.caption1Regular,
    color: Colors.gray600,
    paddingLeft:Spacing.sm
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  participantInputContainer: {
    flex: 1,
    gap: Spacing.xs,
  },
  participantTextField: {
    marginTop: 0,
  },
  counterButtons: {
    flexDirection: 'row',
    gap: 0,
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
  },
  dateText: {
    ...Typography.body1Regular,
    fontSize: 15,
    color: Colors.gray900,
  },
  friendInviteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.lg,
    marginTop: Spacing.sm,
  },
  addFriendButton: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: Colors.bg50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  friendListWrapper: {
    flex: 1,
    position: 'relative',
  },
  friendList: {
    flex: 1,
  },
  friendListContent: {
    gap: 4,
  },
  friendListGradientLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 40,
  },
  friendListGradientRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 40,
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
