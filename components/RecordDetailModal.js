import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable, Animated, PanResponder, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../styles';
import DefaultHeader from './DefaultHeader';
import ReadingResultCard, { CARD_WIDTH, CARD_HEIGHT } from './ReadingResultCard';
import ResultStyleTab from './ResultStyleTab';
import Switch from './Switch';
import Button from './Button';
import ModalPopup from './ModalPopup';
import CloseIcon from './CloseIcon';
import RecordEditModal from './RecordEditModal';
import { pickImageFromLibrary, takePhoto as takePhotoUtil } from '../utils/pickImage';

export default function RecordDetailModal({ visible, onClose, record, book, readingDays = 1, onDelete, onEdit, onComplete, isLatestRecord = true, hideTime = false }) {
  const insets = useSafeAreaInsets();
  const [variant, setVariant] = React.useState('light');
  const [showBookInfo, setShowBookInfo] = React.useState(true);
  const [resultAreaSize, setResultAreaSize] = React.useState({ width: 0, height: 0 });
  const [deleteConfirmVisible, setDeleteConfirmVisible] = React.useState(false);
  const [editVisible, setEditVisible] = React.useState(false);
  const [customCardBg, setCustomCardBg] = React.useState(null);
  const [isCardMenuVisible, setIsCardMenuVisible] = React.useState(false);
  const cardMenuTranslateY = React.useRef(new Animated.Value(300)).current;

  const cardMenuPanResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderMove: (_, g) => { if (g.dy > 0) cardMenuTranslateY.setValue(g.dy); },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 100) closeCardMenu();
        else Animated.spring(cardMenuTranslateY, { toValue: 0, useNativeDriver: true, tension: 50, friction: 10 }).start();
      },
    })
  ).current;

  const openCardMenu = () => {
    if (variant !== 'style1' && variant !== 'style2') return;
    setIsCardMenuVisible(true);
    Animated.spring(cardMenuTranslateY, { toValue: 0, useNativeDriver: true, tension: 50, friction: 10 }).start();
  };

  const closeCardMenu = () => {
    Animated.timing(cardMenuTranslateY, { toValue: 300, duration: 200, useNativeDriver: true }).start(() => {
      setIsCardMenuVisible(false);
    });
  };

  const handlePickFromAlbum = () => {
    pickImageFromLibrary((uri) => { setCustomCardBg(uri); closeCardMenu(); });
  };

  const handleTakePhoto = () => {
    takePhotoUtil((uri) => { setCustomCardBg(uri); closeCardMenu(); });
  };

  const bookData = React.useMemo(() => ({
    title: record?.title ?? '',
    author: book?.author ?? '',
    coverImage: record?.cover ?? '',
  }), [record, book]);

  const endTime = record?.createdAt ? new Date(record.createdAt) : new Date();
  const startTime = hideTime ? null : (record?.duration ? new Date(endTime - record.duration * 1000) : endTime);

  const previewScale = resultAreaSize.width > 0
    ? Math.min(resultAreaSize.width / CARD_WIDTH, resultAreaSize.height / CARD_HEIGHT)
    : 1;
  const scaledW = CARD_WIDTH * previewScale;
  const scaledH = CARD_HEIGHT * previewScale;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <DefaultHeader
          title="독서 기록"
          rightButton={<CloseIcon />}
          onMenu={onClose}
          showBlur={false}
          backgroundColor={Colors.white}
          topInset={insets.top}
        />

        <View style={[styles.body, { paddingTop: insets.top + 52 }]}>
          {/* 카드 영역 - 나머지 공간 전부 */}
          <View
            style={styles.dataArea}
            onLayout={e => {
              const { width, height } = e.nativeEvent.layout;
              setResultAreaSize({ width, height });
            }}
          >
            {resultAreaSize.width > 0 && (
              <View style={{ width: scaledW, height: scaledH, overflow: 'hidden' }}>
                <View style={{
                  width: CARD_WIDTH,
                  height: CARD_HEIGHT,
                  transform: [{ scale: previewScale }],
                  marginLeft: -((CARD_WIDTH - scaledW) / 2),
                  marginTop: -((CARD_HEIGHT - scaledH) / 2),
                }}>
                  <ReadingResultCard
                    variant={variant}
                    book={bookData}
                    elapsed={record?.duration ?? 0}
                    startTime={startTime}
                    endTime={endTime}
                    startPage={record?.startPage ?? 0}
                    endPage={record?.endPage ?? 0}
                    totalPages={record?.totalPages ?? book?.totalPages ?? 0}
                    readingDays={readingDays}
                    displayScale={previewScale}
                    showBookInfo={showBookInfo}
                    customBackground={customCardBg}
                    dateOnly={hideTime}
                  />
                </View>
                <Pressable
                  style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                  onPress={openCardMenu}
                />
                {(variant === 'style1' || variant === 'style2') && (
                  <View style={styles.bookInfoToggleRow}>
                    <Text style={styles.bookInfoToggleLabel}>책 정보</Text>
                    <Switch value={showBookInfo} onValueChange={setShowBookInfo} />
                  </View>
                )}
              </View>
            )}
          </View>

          {/* 하단 고정 그룹 */}
          <View style={styles.bottomGroup}>
            <View style={styles.tabSection}>
              {[
                { key: 'light',  label: 'Light',  thumbnail: require('../assets/thmb_light.png')  },
                { key: 'dark',   label: 'Dark',   thumbnail: require('../assets/thmb_dark.png')   },
                { key: 'style1', label: 'Style1', thumbnail: require('../assets/thmb_style1.png') },
                { key: 'style2', label: 'Style2', thumbnail: require('../assets/thmb_style2.png') },
              ].map(({ key, label, thumbnail }) => (
                <ResultStyleTab
                  key={key}
                  label={label}
                  thumbnail={thumbnail}
                  selected={variant === key}
                  onPress={() => setVariant(key)}
                />
              ))}
            </View>
            <View style={styles.deleteRow}>
              <Pressable onPress={() => setDeleteConfirmVisible(true)} style={styles.deleteButton}>
                <Text style={styles.deleteText}>기록 삭제</Text>
              </Pressable>
            </View>
            <View style={[styles.mainButtons, { paddingBottom: insets.bottom + Spacing.md }]}>
              <Button variant="outline" size="xxlarge" style={styles.halfButton} onPress={() => setEditVisible(true)}>
                기록 수정
              </Button>
              <Button variant="primary" size="xxlarge" style={styles.halfButton}>
                이미지 저장
              </Button>
            </View>
          </View>
        </View>
      </View>
      <ModalPopup
        visible={deleteConfirmVisible}
        title="삭제할까요?"
        description="삭제한 기록은 되돌릴 수 없습니다."
        primaryButtonText="삭제"
        secondaryButtonText="취소"
        onPrimaryPress={() => {
          setDeleteConfirmVisible(false);
          setTimeout(() => onDelete?.(), 300);
        }}
        onSecondaryPress={() => setDeleteConfirmVisible(false)}
        onClose={() => setDeleteConfirmVisible(false)}
      />

      <RecordEditModal
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        record={record}
        book={book}
        onSave={(updated) => {
          onEdit?.(updated);
          setEditVisible(false);
        }}
        onComplete={() => {
          setEditVisible(false);
          onComplete?.();
        }}
        isLatestRecord={isLatestRecord}
      />

      <Modal visible={isCardMenuVisible} transparent animationType="none" onRequestClose={closeCardMenu}>
        <Pressable style={styles.cardMenuOverlay} onPress={closeCardMenu}>
          <Animated.View style={[styles.cardMenuContainer, { transform: [{ translateY: cardMenuTranslateY }] }]}>
            <Pressable onPress={e => e.stopPropagation()}>
              <View {...cardMenuPanResponder.panHandlers} style={styles.cardMenuDragHandle} />
              <View style={styles.cardMenuBody}>
                <View style={styles.cardMenuOptionBox}>
                  <TouchableOpacity style={styles.cardMenuOptionItem} onPress={handlePickFromAlbum}>
                    <Text style={styles.cardMenuOptionText}>앨범에서 선택</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cardMenuOptionItem} onPress={handleTakePhoto}>
                    <Text style={styles.cardMenuOptionText}>사진 촬영</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  body: {
    flex: 1,
  },
  dataArea: {
    flex: 1,
    alignItems: 'center',
    overflow: 'hidden',
  },
  bookInfoToggleRow: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  bookInfoToggleLabel: {
    ...Typography.body2Regular,
    color: Colors.white,
  },
  bottomGroup: {
    backgroundColor: Colors.white,
  },
  tabSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 20,
  },
  deleteRow: {
    alignItems: 'center',
  },
  deleteButton: {
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    ...Typography.body2Medium,
    color: Colors.gray500,
    textDecorationLine: 'underline',
  },
  mainButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  halfButton: {
    flex: 1,
  },
  cardMenuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  cardMenuContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  cardMenuDragHandle: {
    height: 28,
  },
  cardMenuBody: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.huge,
  },
  cardMenuOptionBox: {
    backgroundColor: Colors.gray50,
    borderRadius: 12,
    paddingVertical: Spacing.sm,
  },
  cardMenuOptionItem: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  cardMenuOptionText: {
    ...Typography.body1Medium,
    color: Colors.gray900,
  },
});
