import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, BorderRadius } from '../styles';
import DefaultHeader from './DefaultHeader';
import CloseIcon from './CloseIcon';
import TextField from './TextField';
import Button from './Button';
import ModalPopup from './ModalPopup';

export default function RecordEditModal({ visible, onClose, record, book, onSave, onComplete, isLatestRecord = true }) {
  const insets = useSafeAreaInsets();

  const [completeConfirmVisible, setCompleteConfirmVisible] = React.useState(false);
  const [hours, setHours] = React.useState('0');
  const [minutes, setMinutes] = React.useState('0');
  const [seconds, setSeconds] = React.useState('0');
  const [startPageEdit, setStartPageEdit] = React.useState('');
  const [page, setPage] = React.useState('');

  const hoursRef = React.useRef(null);
  const minutesRef = React.useRef(null);
  const secondsRef = React.useRef(null);
  const startPageRef = React.useRef(null);
  const endPageRef = React.useRef(null);

  const original = React.useRef({ hours: '0', minutes: '0', seconds: '0', startPage: '', page: '' });

  React.useEffect(() => {
    if (visible && record) {
      const d = record.duration ?? 0;
      const h = String(Math.floor(d / 3600));
      const m = String(Math.floor((d % 3600) / 60));
      const s = String(d % 60);
      const sp = String(record.startPage ?? '');
      const p = String(record.endPage ?? '');
      setHours(h); setMinutes(m); setSeconds(s); setStartPageEdit(sp); setPage(p);
      original.current = { hours: h, minutes: m, seconds: s, startPage: sp, page: p };
    }
  }, [visible, record]);

  const totalPages = book?.totalPages ?? 0;
  const isCompleted = book?.isCompleted ?? false;
  const startPageNum = parseInt(startPageEdit) || 0;
  const pageNum = parseInt(page) || 0;
  const startPageChanged = startPageEdit !== original.current.startPage;
  const pageChanged = page !== original.current.page;
  const timeChanged = hours !== original.current.hours || minutes !== original.current.minutes || seconds !== original.current.seconds;
  const hasChanged = pageChanged || timeChanged || startPageChanged;
  const pageBelowStart = page !== '' && startPageEdit !== '' && pageNum < startPageNum;
  const pageError = (totalPages > 0 && pageNum > totalPages) || pageBelowStart;

  const handleSave = () => {
    if (pageError) return;
    const totalSeconds =
      (parseInt(hours) || 0) * 3600 +
      (parseInt(minutes) || 0) * 60 +
      (parseInt(seconds) || 0);
    onSave?.({
      ...record,
      duration: totalSeconds,
      startPage: startPageNum,
      endPage: pageNum || record?.endPage || 0,
    });
  };

  const numOnly = (setter) => (text) => setter(text.replace(/[^0-9]/g, ''));
  const clampedSub60 = (setter) => (text) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    const num = parseInt(cleaned) || 0;
    setter(num > 59 ? '59' : cleaned);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <DefaultHeader
          title="독서 기록 수정"
          rightButton={<CloseIcon />}
          onMenu={onClose}
          showBlur={false}
          backgroundColor={Colors.white}
          topInset={insets.top}
        />

        <View style={[styles.body, { paddingTop: insets.top + 52 + Spacing.xl }]}>
          {/* 시간 / 분 / 초 */}
          <View style={styles.timeRow}>
            <View style={styles.timeCol}>
              <Text style={styles.label}>시간</Text>
              <TextField
                ref={hoursRef}
                value={hours}
                onChangeText={numOnly(setHours)}
                keyboardType="number-pad"
                returnKeyType="next"
                onSubmitEditing={() => minutesRef.current?.focus()}
              />
            </View>
            <View style={styles.timeCol}>
              <Text style={styles.label}>분</Text>
              <TextField
                ref={minutesRef}
                value={minutes}
                onChangeText={clampedSub60(setMinutes)}
                keyboardType="number-pad"
                returnKeyType="next"
                onSubmitEditing={() => secondsRef.current?.focus()}
              />
            </View>
            <View style={styles.timeCol}>
              <Text style={styles.label}>초</Text>
              <TextField
                ref={secondsRef}
                value={seconds}
                onChangeText={clampedSub60(setSeconds)}
                keyboardType="number-pad"
                returnKeyType="next"
                onSubmitEditing={() => startPageRef.current?.focus()}
              />
            </View>
          </View>
          <Text style={styles.helpText}>분·초는 59까지 입력 가능합니다</Text>

          {/* 페이지 */}
          <View style={styles.pageGroup}>
            <Text style={styles.label}>읽기 시작한 페이지</Text>
            <TextField
              ref={startPageRef}
              value={startPageEdit}
              onChangeText={numOnly(setStartPageEdit)}
              keyboardType="number-pad"
              returnKeyType="next"
              onSubmitEditing={() => endPageRef.current?.focus()}
            />
          </View>
          <View style={styles.pageGroup}>
            <Text style={styles.label}>어디까지 읽었나요</Text>
            <TextField
              ref={endPageRef}
              value={page}
              onChangeText={numOnly(setPage)}
              keyboardType="number-pad"
              returnKeyType="done"
              error={pageError}
              helpText={
                pageBelowStart
                  ? `읽기 시작한 페이지(${startPageNum}p)보다 이전으로 수정할 수 없습니다`
                  : totalPages > 0 && pageNum > totalPages
                  ? `책의 총 페이지 수(${totalPages}p)보다 클 수 없습니다`
                  : totalPages > 0
                  ? `책의 마지막 페이지(${totalPages}p)`
                  : undefined
              }
            />
          </View>
        </View>

        <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
          <Button
            variant="text"
            size="medium"
            style={styles.completeButton}
            textStyle={{ color: Colors.gray800, textDecorationLine: 'underline' }}
            onPress={() => {
              if (isLatestRecord) {
                onSave?.({ ...record, endPage: book?.totalPages ?? record?.endPage ?? 0 });
                onComplete?.();
              } else {
                setCompleteConfirmVisible(true);
              }
            }}
          >
            완독했어요 🎉
          </Button>
          <Button
            variant="primary"
            size="xxlarge"
            style={styles.saveButton}
            onPress={handleSave}
            disabled={!hasChanged || pageError}
          >
            반영
          </Button>
        </View>
      </View>
      <ModalPopup
        visible={completeConfirmVisible}
        title="완독하시겠어요?"
        description="이 기록보다 더 최근 기록이 있어요."
        primaryButtonText="완독"
        secondaryButtonText="취소"
        onPrimaryPress={() => {
          setCompleteConfirmVisible(false);
          onSave?.({ ...record, endPage: book?.totalPages ?? record?.endPage ?? 0 });
          onComplete?.();
        }}
        onSecondaryPress={() => setCompleteConfirmVisible(false)}
        onClose={() => setCompleteConfirmVisible(false)}
      />
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
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xs,
  },
  timeRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  timeCol: {
    flex: 1,
    gap: Spacing.xs,
  },
  pageGroup: {
    gap: Spacing.xs,
    marginTop: Spacing.lg,
  },
  label: {
    ...Typography.body2Medium,
    color: Colors.gray700,
  },
  helpText: {
    ...Typography.body3Regular,
    color: Colors.gray500,
    marginTop: Spacing.xs,
  },
  footer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    backgroundColor: Colors.white,
    alignItems: 'center',
    gap: Spacing.md,
  },
  completeButton: {
    alignSelf: 'center',
  },
  saveButton: {
    width: '100%',
  },
});
