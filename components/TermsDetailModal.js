import { View, Text, StyleSheet, Modal, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography } from '../styles';
import { Spacing } from '../styles/spacing';
import DefaultHeader from './DefaultHeader';
import CloseIcon from './CloseIcon';

// 약관 내용 (실제로는 API에서 가져오거나 별도 파일로 관리)
const TERMS_CONTENT = {
  service: `도토리룸 서비스 이용 약관

제1조 (목적)
이 약관은 도토리룸(이하 "회사")이 제공하는 독서 커뮤니티 서비스(이하 "서비스")의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.

제2조 (정의)
이 약관에서 사용하는 용어의 정의는 다음과 같습니다.
1. "서비스"라 함은 회사가 제공하는 독서 커뮤니티 플랫폼 및 관련 제반 서비스를 의미합니다.
2. "회원"이라 함은 회사의 서비스에 접속하여 이 약관에 따라 회사와 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 고객을 말합니다.
3. "아이디(ID)"라 함은 회원의 식별과 서비스 이용을 위하여 회원이 정하고 회사가 승인하는 문자와 숫자의 조합을 의미합니다.

제3조 (약관의 게시와 개정)
1. 회사는 이 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.
2. 회사는 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.
3. 회사가 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행약관과 함께 제1항의 방식에 따라 그 개정약관의 적용일자 30일 전부터 적용일자 전일까지 공지합니다.

제4조 (서비스의 제공 및 변경)
1. 회사는 다음과 같은 업무를 수행합니다.
   - 독서 커뮤니티 플랫폼 제공
   - 독서 그룹 생성 및 관리
   - 도서 정보 제공
   - 기타 회사가 정하는 업무

제5조 (서비스의 중단)
1. 회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.`,

  privacy: `개인정보 수집 및 이용 동의

1. 개인정보의 수집 및 이용 목적
도토리룸(이하 "회사")은 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보 보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.

가. 회원 가입 및 관리
회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리, 서비스 부정이용 방지, 각종 고지·통지 목적으로 개인정보를 처리합니다.

나. 서비스 제공
독서 커뮤니티 서비스 제공, 콘텐츠 제공, 맞춤 서비스 제공, 본인인증을 목적으로 개인정보를 처리합니다.

2. 수집하는 개인정보의 항목
회사는 회원가입, 상담, 서비스 신청 등을 위해 아래와 같은 개인정보를 수집하고 있습니다.

가. 필수항목
- 성명, 이메일, 닉네임, SNS 계정 정보

나. 자동 수집 항목
- 서비스 이용기록, 접속 로그, 쿠키, 접속 IP 정보

3. 개인정보의 보유 및 이용기간
회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.

가. 회원 탈퇴 시까지 (단, 관계 법령 위반에 따른 수사·조사 등이 진행중인 경우에는 해당 수사·조사 종료 시까지)

4. 동의를 거부할 권리
귀하는 본 안내에 따른 개인정보 수집·이용에 대하여 동의를 거부할 권리가 있습니다. 다만, 귀하가 개인정보 동의를 거부하시는 경우에 서비스 이용에 제한이 있을 수 있음을 알려드립니다.`,

  marketing: `마케팅 수신 동의

1. 수집 목적
신규 서비스 개발 및 맞춤 서비스 제공, 이벤트 및 광고성 정보 제공 및 참여기회 제공, 인구통계학적 특성에 따른 서비스 제공 및 광고 게재, 서비스의 유효성 확인, 접속빈도 파악 또는 회원의 서비스 이용에 대한 통계

2. 수집 항목
이메일, 휴대전화번호, 서비스 이용 기록

3. 보유 및 이용 기간
회원 탈퇴 시 또는 동의 철회 시까지

4. 동의 거부 권리
귀하는 위와 같은 마케팅 정보 수신에 대한 동의를 거부할 수 있으며, 동의 후에도 언제든지 철회할 수 있습니다. 동의를 거부하더라도 회사가 제공하는 서비스의 이용에는 제한이 없습니다. 단, 할인, 이벤트 및 각종 마케팅 정보 안내 서비스가 제한됩니다.`,
};

const TERMS_TITLES = {
  service: '서비스 이용 약관',
  privacy: '개인정보 수집 및 이용 동의',
  marketing: '마케팅 수신 동의',
};

/**
 * TermsDetailModal Component
 * @param {boolean} visible - Modal visibility
 * @param {string} termId - Term ID (service, privacy, marketing)
 * @param {function} onClose - Close modal handler
 */
export default function TermsDetailModal({ visible = false, termId, onClose }) {
  const insets = useSafeAreaInsets();
  const title = TERMS_TITLES[termId] || '약관';
  const content = TERMS_CONTENT[termId] || '';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <DefaultHeader
          title={title}
          showBlur={false}
          iconColor={Colors.gray900}
          backgroundColor={Colors.white}
          onMenu={onClose}
          topInset={insets.top}
          rightButton={
            <CloseIcon color={Colors.gray900} />
          }
        />

        <ScrollView style={[styles.scrollView, { paddingTop: insets.top + 52 }]} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.content}>{content}</Text>
        </ScrollView>
      </View>
    </Modal>
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
    padding: Spacing.xl,
  },
  content: {
    ...Typography.body2Regular,
    color: Colors.gray900,
    lineHeight: 22,
  },
});
