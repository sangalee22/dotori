import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography } from '../styles';
import { Spacing, BorderRadius } from '../styles/spacing';
import DefaultHeader from './DefaultHeader';
import CloseIcon from './CloseIcon';
import RadioItem from './RadioItem';
import Button from './Button';
import TextField from './TextField';

const REASONS = [
  { id: 'error', label: '오류가 많아요' },
  { id: 'unused', label: '잘 사용하지 않아요' },
  { id: 'quality', label: '서비스가 별로에요(부족해요)' },
  { id: 'custom', label: '직접 입력' },
];

export default function WithdrawModal({ visible = false, onClose, onWithdraw }) {
  const insets = useSafeAreaInsets();
  const [selectedReason, setSelectedReason] = React.useState('error');
  const [customReason, setCustomReason] = React.useState('');

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <DefaultHeader
          title="회원 탈퇴"
          showBlur={false}
          backgroundColor={Colors.white}
          onMenu={onClose}
          topInset={insets.top}
          rightButton={<CloseIcon color={Colors.gray900} />}
        />

        <ScrollView
          style={{ marginTop: insets.top + 52 }}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>정말 탈퇴 하시겠어요?</Text>
          <Text style={styles.description}>
            탈퇴 하시는 이유를 알려주시면, 더 좋은 서비스로 다시 반날 수 있도록 노력하겠습니다.
          </Text>

          <View style={styles.reasonBox}>
            {REASONS.map((reason) => (
              <RadioItem
                key={reason.id}
                label={reason.label}
                selected={selectedReason === reason.id}
                onPress={() => setSelectedReason(reason.id)}
              />
            ))}
          </View>

          {selectedReason === 'custom' && (
            <TextField
              value={customReason}
              onChangeText={setCustomReason}
              placeholder="탈퇴 이유를 입력해주세요"
              multiline
              containerStyle={{ height: 80, overflow: 'hidden' }}
              style={{ marginBottom: Spacing.md }}
            />
          )}

          <Text style={styles.disclaimer}>
            * 탈퇴 후에는 모든 데이터가 삭제 되며, 삭제한 데이터는 복구하실 수 없습니다.
          </Text>
        </ScrollView>

        <View style={[styles.bottom, { paddingBottom: insets.bottom > 0 ? 0 : Spacing.lg }]}>
          <Button variant="default" size="xxlarge" onPress={() => onWithdraw?.()} style={styles.btn}>
            회원 탈퇴
          </Button>
          <Button variant="primary" size="xxlarge" onPress={onClose} style={styles.btn}>
            계속 사용
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
    overflow: 'hidden',
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl,
  },
  title: {
    ...Typography.headline1Medium,
    color: Colors.gray900,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  description: {
    ...Typography.body2Regular,
    color: Colors.gray800,
    marginBottom: Spacing.xxxl,
    paddingHorizontal: Spacing.sm,
  },
  reasonBox: {
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.xxxl,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  disclaimer: {
    ...Typography.body3Regular,
    color: Colors.gray500,
    marginHorizontal: Spacing.sm,
  },
  bottom: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
  },
  btn: {
    flex: 1,
    maxWidth: '100%',
    alignSelf: 'stretch',
  },
});
