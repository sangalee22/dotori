import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Colors, Typography } from '../styles';
import { Spacing } from '../styles/spacing';
import DefaultHeader from '../components/DefaultHeader';
import Checkbox from '../components/Checkbox';
import Button from '../components/Button';
import MoreButton from '../components/MoreButton';
import TermsDetailModal from '../components/TermsDetailModal';

// 약관 목록
const TERMS = [
  {
    id: 'service',
    label: '서비스 이용 약관 (필수)',
    required: true,
  },
  {
    id: 'privacy',
    label: '개인정보 수집 및 이용 동의 (필수)',
    required: true,
  },
  {
    id: 'marketing',
    label: '마케팅 수신 동의 (선택)',
    required: false,
  },
];

export default function TermsAgreementScreen({ onNext, onBack }) {
  const [agreedTerms, setAgreedTerms] = useState({
    service: false,
    privacy: false,
    marketing: false,
  });
  const [selectedTerm, setSelectedTerm] = useState(null);

  // 전체 동의 여부 확인
  const isAllAgreed = Object.values(agreedTerms).every(value => value);

  // 필수 약관만 동의했는지 확인
  const canProceed = TERMS
    .filter(term => term.required)
    .every(term => agreedTerms[term.id]);

  // 전체 동의 토글
  const handleToggleAll = () => {
    const newValue = !isAllAgreed;
    setAgreedTerms({
      service: newValue,
      privacy: newValue,
      marketing: newValue,
    });
  };

  // 개별 약관 토글
  const handleToggleTerm = (termId) => {
    setAgreedTerms(prev => ({
      ...prev,
      [termId]: !prev[termId],
    }));
  };

  // 약관 상세 보기
  const handleShowDetail = (termId) => {
    setSelectedTerm(termId);
  };

  // 약관 상세 모달 닫기
  const handleCloseDetail = () => {
    setSelectedTerm(null);
  };

  const handleNext = () => {
    if (canProceed) {
      onNext({ agreedTerms });
    }
  };

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

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
          {/* Title */}
          <Text style={styles.title}>
            회원가입을 위해{'\n'}약관 동의가 필요해요
          </Text>

          {/* Terms Section */}
          <View style={styles.termsSection}>
            {/* All Agree Checkbox */}
            <View style={styles.allAgreeContainer}>
              <Checkbox
                checked={isAllAgreed}
                onPress={handleToggleAll}
                label="모두동의"
                style={styles.allAgreeCheckbox}
                labelStyle={styles.allAgreeLabel}
              />
            </View>

            {/* Individual Terms */}
            <View style={styles.termsContainer}>
              {TERMS.map((term) => (
                <View key={term.id} style={styles.termRow}>
                  <Checkbox
                    checked={agreedTerms[term.id]}
                    onPress={() => handleToggleTerm(term.id)}
                    label={term.label}
                    style={styles.termCheckbox}
                  />
                  <MoreButton
                    onPress={() => handleShowDetail(term.id)}
                  />
                </View>
              ))}
            </View>
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
              시작하기
            </Button>
          </View>
        </SafeAreaView>
      </ScrollView>

      {/* Terms Detail Modal */}
      <TermsDetailModal
        visible={selectedTerm !== null}
        termId={selectedTerm}
        onClose={handleCloseDetail}
      />
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
    flexGrow: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: 64, // Space for header
  },
  title: {
    ...Typography.headline2Medium,
    color: Colors.gray900,
    marginTop: 72,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xxl,
    marginLeft: Spacing.sm,
  },
  termsSection: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  allAgreeContainer: {
    paddingVertical: Spacing.xs,
    paddingLeft: Spacing.xl,
  },
  allAgreeCheckbox: {
    paddingVertical: Spacing.xs,
  },
  allAgreeLabel: {
    ...Typography.body1ExtraBold,
  },
  termsContainer: {
    backgroundColor: Colors.gray50,
    borderRadius: 32,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.xs,
  },
  termRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 40,
  },
  termCheckbox: {
    flex: 1,
    paddingVertical: Spacing.xs,
  },
  bottomButtonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  bottomButton: {
    width: '100%',
  },
});
