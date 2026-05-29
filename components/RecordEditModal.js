import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, BorderRadius } from '../styles';
import DefaultHeader from './DefaultHeader';
import CloseIcon from './CloseIcon';
import TextField from './TextField';
import Button from './Button';

export default function RecordEditModal({ visible, onClose, record, book, onSave }) {
  const insets = useSafeAreaInsets();

  const [hours, setHours] = React.useState('0');
  const [minutes, setMinutes] = React.useState('0');
  const [seconds, setSeconds] = React.useState('0');
  const [page, setPage] = React.useState('');

  const original = React.useRef({ hours: '0', minutes: '0', seconds: '0', page: '' });

  React.useEffect(() => {
    if (visible && record) {
      const d = record.duration ?? 0;
      const h = String(Math.floor(d / 3600));
      const m = String(Math.floor((d % 3600) / 60));
      const s = String(d % 60);
      const p = String(record.endPage ?? '');
      setHours(h); setMinutes(m); setSeconds(s); setPage(p);
      original.current = { hours: h, minutes: m, seconds: s, page: p };
    }
  }, [visible, record]);

  const totalPages = book?.totalPages ?? 0;
  const isCompleted = book?.isCompleted ?? false;
  const startPage = record?.startPage ?? 0;
  const pageNum = parseInt(page) || 0;
  const pageChanged = page !== original.current.page;
  const timeChanged = hours !== original.current.hours || minutes !== original.current.minutes || seconds !== original.current.seconds;
  const hasChanged = pageChanged || timeChanged;
  const pageBelowStart = page !== '' && pageNum < startPage;
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
      endPage: pageNum || record?.endPage || 0,
    });
  };

  const numOnly = (setter) => (text) => setter(text.replace(/[^0-9]/g, ''));

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
                value={hours}
                onChangeText={numOnly(setHours)}
                keyboardType="number-pad"
                returnKeyType="next"
              />
            </View>
            <View style={styles.timeCol}>
              <Text style={styles.label}>분</Text>
              <TextField
                value={minutes}
                onChangeText={numOnly(setMinutes)}
                keyboardType="number-pad"
                returnKeyType="next"
              />
            </View>
            <View style={styles.timeCol}>
              <Text style={styles.label}>초</Text>
              <TextField
                value={seconds}
                onChangeText={numOnly(setSeconds)}
                keyboardType="number-pad"
                returnKeyType="next"
              />
            </View>
          </View>
          <Text style={styles.helpText}>숫자만 입력 가능합니다</Text>

          {/* 페이지 */}
          <View style={styles.pageGroup}>
            <Text style={styles.label}>페이지</Text>
            <TextField
              value={page}
              onChangeText={numOnly(setPage)}
              keyboardType="number-pad"
              returnKeyType="done"
              disabled={isCompleted}
              error={pageError}
              helpText={
                isCompleted
                  ? '페이지 수를 수정하시면 완독한 기록에서 없어집니다'
                  : pageBelowStart
                  ? `읽기 시작한 페이지(${startPage}p)보다 이전으로 수정할 수 없습니다`
                  : totalPages > 0 && pageNum > totalPages
                  ? `책의 총 페이지 수(${totalPages}p)보다 클 수 없습니다`
                  : undefined
              }
            />
          </View>
        </View>

        <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
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
  },
  saveButton: {
    width: '100%',
  },
});
