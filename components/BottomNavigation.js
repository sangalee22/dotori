import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal, ScrollView, ActivityIndicator, Platform, Animated, PanResponder, Pressable } from 'react-native';
import { saveCardImage, captureCard } from '../utils/imageSave';
import { pickImageFromLibrary, takePhoto as takePhotoUtil } from '../utils/pickImage';
import { useSinglePress } from '../utils/useSinglePress';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, BorderRadius, Spacing } from '../styles';
import Svg, { Path } from 'react-native-svg';
import IconButton from './IconButton';
import PlayIcon from './PlayIcon';
import PauseIcon from './PauseIcon';
import DefaultHeader from './DefaultHeader';
import CloseIcon from './CloseIcon';
import TextField from './TextField';
import EmptyState from './EmptyState';
import ReadingBookItem from './ReadingBookItem';
import SectionTitle from './SectionTitle';
import BestBook from './BestBook';
import ModalPopup from './ModalPopup';
import Button from './Button';
import { searchBooks, fetchBookDetail } from '../services/aladinApi';
import ReadingResultCard, { CARD_WIDTH, CARD_HEIGHT } from './ReadingResultCard';
import Toast from './Toast';
import Switch from './Switch';
import ResultStyleTab from './ResultStyleTab';
import PopupHeader from './PopupHeader';

function AddRecordForm({ addRecordBook, addRecordDate, addRecordStartPage, setAddRecordStartPage, addRecordEndPage, setAddRecordEndPage, readingRecords, insets, onSave }) {
  const [hours, setHours] = React.useState('');
  const [minutes, setMinutes] = React.useState('');
  const [seconds, setSeconds] = React.useState('');

  const bookRecords = readingRecords.filter(r => String(r.isbn) === String(addRecordBook?.isbn));
  const nextRecord = [...bookRecords]
    .filter(r => r.date > addRecordDate)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  const nextStartPage = nextRecord ? nextRecord.startPage : null;
  const prevRecord = [...bookRecords]
    .filter(r => r.date <= addRecordDate)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  const prevEndPage = prevRecord ? prevRecord.endPage : null;
  const startPageNum = parseInt(addRecordStartPage);
  const endPageNum = parseInt(addRecordEndPage);
  const exceedsTotal = addRecordBook?.totalPages > 0 && !isNaN(endPageNum) && endPageNum > addRecordBook.totalPages;
  const exceedsNext = nextStartPage !== null && addRecordEndPage.trim() !== '' && !isNaN(endPageNum) && endPageNum >= nextStartPage;
  const isBlocked = nextStartPage !== null && nextStartPage === 0;
  const startBelowPrev = prevEndPage !== null && addRecordStartPage.trim() !== '' && !isNaN(startPageNum) && startPageNum < prevEndPage;
  const endBelowPrev = prevEndPage !== null && addRecordEndPage.trim() !== '' && !isNaN(endPageNum) && endPageNum <= prevEndPage;
  const numOnly = (setter) => (t) => setter(t.replace(/[^0-9]/g, ''));

  const getDuration = () =>
    (parseInt(hours) || 0) * 3600 + (parseInt(minutes) || 0) * 60 + (parseInt(seconds) || 0);

  return (
    <View style={arStyles.container}>
      <View style={arStyles.fields}>
        {/* 읽기 시작한 페이지 */}
        <View style={arStyles.fieldGroup}>
          <TextField
            label="읽기 시작한 페이지"
            value={addRecordStartPage}
            onChangeText={(t) => setAddRecordStartPage(t.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            returnKeyType="next"
            placeholder="0"
            error={startBelowPrev}
            helpText={startBelowPrev ? `이전 날짜 기록의 마지막 페이지(${prevEndPage}p) 이상이어야 합니다` : '미입력시 자동으로 처음부터 읽기 시작합니다.'}
          />
        </View>

        {/* 읽은 마지막 페이지 */}
        <View style={arStyles.fieldGroup}>
          <TextField
            label="읽은 마지막 페이지"
            value={addRecordEndPage}
            onChangeText={(t) => setAddRecordEndPage(t.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            returnKeyType="done"
            placeholder="페이지를 입력해주세요"
            error={exceedsTotal || exceedsNext || endBelowPrev}
            helpText={
              exceedsTotal
                ? `책의 총 페이지 수(${addRecordBook.totalPages}p)보다 클 수 없습니다`
                : exceedsNext
                ? `이후 날짜 기록의 시작 페이지(${nextStartPage}p)보다 작아야 합니다`
                : endBelowPrev
                ? `이전 날짜 기록의 마지막 페이지(${prevEndPage}p)보다 커야 합니다`
                : addRecordBook?.totalPages > 0
                ? `책의 마지막 페이지(${addRecordBook.totalPages}p)`
                : undefined
            }
          />
        </View>

        {/* 독서 시간 */}
        <View style={arStyles.fieldGroup}>
          <View style={arStyles.timeRow}>
            <View style={arStyles.timeCol}>
              <Text style={arStyles.timeLabel}>시간</Text>
              <TextField
                value={hours}
                onChangeText={numOnly(setHours)}
                keyboardType="number-pad"
                returnKeyType="next"
                placeholder="0"
              />
            </View>
            <View style={arStyles.timeCol}>
              <Text style={arStyles.timeLabel}>분</Text>
              <TextField
                value={minutes}
                onChangeText={numOnly(setMinutes)}
                keyboardType="number-pad"
                returnKeyType="next"
                placeholder="0"
              />
            </View>
            <View style={arStyles.timeCol}>
              <Text style={arStyles.timeLabel}>초</Text>
              <TextField
                value={seconds}
                onChangeText={numOnly(setSeconds)}
                keyboardType="number-pad"
                returnKeyType="done"
                placeholder="0"
              />
            </View>
          </View>
          <Text style={arStyles.helpText}>숫자만 입력 가능합니다</Text>
        </View>

        {/* 이후 날짜 기록 제한 안내 */}
        {isBlocked && (
          <View style={arStyles.infoBox}>
            <Text style={arStyles.infoText}>
              이후 날짜에 읽기 시작한 페이지보다 작은 값만 입력할 수 있습니다.{'\n'}이후 날짜의 독서 기록을 먼저 수정해주세요.
            </Text>
          </View>
        )}
      </View>

      <View style={[arStyles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
        <Button
          variant="primary"
          size="xxlarge"
          style={arStyles.button}
          disabled={!addRecordEndPage.trim() || exceedsTotal || exceedsNext || endBelowPrev || startBelowPrev || isBlocked}
          onPress={() => onSave(parseInt(addRecordStartPage) || 0, endPageNum || 0, getDuration())}
        >
          기록
        </Button>
      </View>
    </View>
  );
}

const arStyles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between' },
  fields: { gap: Spacing.xl },
  fieldGroup: { gap: Spacing.xs },
  label: { ...Typography.body2Medium, color: Colors.gray700 },
  infoBox: {
    backgroundColor: Colors.gray50,
    borderRadius: 12,
    padding: Spacing.md,
  },
  infoText: {
    ...Typography.body3Regular,
    color: Colors.gray600,
    lineHeight: 20,
  },
  footer: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md, backgroundColor: Colors.white },
  button: { width: '100%', maxWidth: 296, alignSelf: 'center' },
  timeRow: { flexDirection: 'row', gap: Spacing.md },
  timeCol: { flex: 1, gap: Spacing.xs },
  timeLabel: { ...Typography.body2Regular, color: Colors.gray600 },
  helpText: { ...Typography.body3Regular, color: Colors.gray500, marginTop: Spacing.xs },
});

// Home Icon
function HomeIcon({ active }) {
  const color = active ? Colors.gray900 : Colors.gray500;
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path d="M18.0298 14.2939C18.0301 13.8248 18.4103 13.4445 18.8795 13.4443C19.3488 13.4443 19.7298 13.8247 19.73 14.2939V20.25C19.73 20.7194 19.3489 21.0996 18.8795 21.0996H14.2398C13.7704 21.0996 13.3892 20.7194 13.3892 20.25V17.1563C13.3892 16.7973 13.0987 16.506 12.7398 16.5059H11.2613C10.9024 16.506 10.6119 16.7974 10.6119 17.1563V20.25C10.6119 20.7194 10.2307 21.0996 9.76129 21.0996H5.12066C4.65122 21.0996 4.27008 20.7194 4.27008 20.25V14.2939C4.2703 13.8247 4.65136 13.4443 5.12066 13.4443C5.58977 13.4446 5.97005 13.8248 5.97027 14.2939V19.4004H8.91168V17.1563C8.91168 15.8585 9.96355 14.8058 11.2613 14.8057H12.7398C14.0376 14.8058 15.0894 15.8584 15.0894 17.1563V19.4004H18.0298V14.2939ZM16.7232 6.77149L18.0298 7.9209V4.59961H16.7232V6.77149ZM19.73 9.41602L21.2027 10.7109C21.5549 11.0208 21.5894 11.5577 21.2798 11.9102C20.9698 12.2627 20.4322 12.2973 20.0796 11.9873L11.9996 4.88184L5.61285 10.499H10.4205C10.8899 10.499 11.2711 10.8802 11.2711 11.3496C11.2709 11.8189 10.8898 12.1992 10.4205 12.1992H4.68414C3.4396 12.1988 2.85883 10.6579 3.79351 9.83594L11.439 3.11133L11.566 3.01953C11.8773 2.83425 12.2802 2.86456 12.5611 3.11133L15.024 5.27735V4.25C15.024 3.50443 15.628 2.90041 16.3736 2.90039H18.3795C19.125 2.90039 19.73 3.50442 19.73 4.25V9.41602Z" fill={color} />
    </Svg>
  );
}

// Feed Icon (피드)
function DotoriRoomIcon({ active }) {
  const color = active ? Colors.gray900 : Colors.gray500;
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path d="M11.5524 20.4734C11.5269 20.4604 11.4802 20.4372 11.4117 20.408C11.2747 20.3495 11.0489 20.2643 10.7281 20.1765C10.0874 20.0011 9.06017 19.8142 7.58948 19.8142C6.11882 19.8142 5.09155 20.0011 4.45081 20.1765C4.13041 20.2642 3.90521 20.3495 3.76819 20.408C3.69975 20.4372 3.65313 20.4604 3.62756 20.4734L3.6051 20.4851C3.60579 20.4847 3.60675 20.4839 3.60803 20.4832L3.61194 20.4812C3.34939 20.6364 3.02348 20.639 2.75842 20.488C2.49319 20.3369 2.32988 20.055 2.32971 19.7498V8.7644C2.32995 8.29516 2.71002 7.91479 3.17932 7.91479C3.64862 7.91479 4.0287 8.29516 4.02893 8.7644V18.53C4.82116 18.3158 5.99102 18.115 7.58948 18.115C8.18719 18.115 8.72516 18.1428 9.20569 18.1892C8.33786 17.5726 7.27709 17.0626 6.09045 16.989C5.64233 16.9613 5.29269 16.5893 5.2926 16.1404V4.25073C5.29261 3.78145 5.67299 3.40138 6.14221 3.40112C7.82134 3.40112 9.21775 4.22923 10.2887 5.21362C11.3608 6.19921 12.1811 7.40702 12.7301 8.32983C12.8082 8.46118 12.8501 8.61159 12.8502 8.7644V18.5291C13.6425 18.3149 14.8128 18.115 16.4108 18.115C18.0085 18.115 19.1782 18.3149 19.9703 18.5291V9.13062C19.8363 9.02045 19.6361 8.87478 19.3649 8.72632C18.7658 8.3984 17.8031 8.04573 16.4108 8.04565C15.8596 8.04565 15.3765 8.10112 14.9586 8.18726C14.499 8.2818 14.0495 7.98575 13.9547 7.52612C13.8599 7.06635 14.1561 6.61699 14.6158 6.52222C15.1475 6.41263 15.7452 6.34546 16.4108 6.34546C18.1052 6.34553 19.3471 6.7785 20.1813 7.23511C20.5959 7.46207 20.9059 7.69186 21.1178 7.8728C21.2238 7.9633 21.3055 8.04195 21.3639 8.10132C21.3931 8.13099 21.4165 8.15603 21.4342 8.17554C21.4431 8.18529 21.4506 8.19401 21.4567 8.20093C21.4596 8.20423 21.4622 8.2071 21.4645 8.20972C21.4656 8.21098 21.4665 8.21252 21.4674 8.21362L21.4703 8.21655L21.5563 8.33862C21.6308 8.46723 21.6705 8.61404 21.6705 8.7644V19.7498C21.6704 20.0549 21.5069 20.3369 21.2418 20.488C20.9767 20.6391 20.6509 20.6356 20.3883 20.4802V20.4812L20.3922 20.4832L20.3951 20.4851C20.3926 20.4837 20.3851 20.4797 20.3727 20.4734C20.3471 20.4604 20.3006 20.4372 20.2321 20.408C20.095 20.3495 19.8692 20.2643 19.5485 20.1765C18.9077 20.0012 17.881 19.8142 16.4108 19.8142C14.9402 19.8142 13.9129 20.0012 13.2721 20.1765C12.9514 20.2643 12.7255 20.3495 12.5885 20.408C12.52 20.4372 12.4734 20.4604 12.4479 20.4734L12.4303 20.4822H12.4313L12.4323 20.4812H12.4332L12.4323 20.4802C12.1652 20.6381 11.834 20.6384 11.567 20.4802C11.5634 20.4783 11.5583 20.4764 11.5524 20.4734ZM6.9928 15.3914C8.63663 15.6954 9.98618 16.5719 10.9332 17.3787C11.0083 17.4426 11.0794 17.5087 11.15 17.572V9.00269C10.6478 8.18313 9.96782 7.22797 9.13733 6.4646C8.47651 5.85727 7.75973 5.4073 6.9928 5.21069V15.3914ZM12.4254 20.4851C12.4261 20.4847 12.4271 20.4839 12.4283 20.4832L12.4303 20.4822L12.4254 20.4851Z" fill={color} />
    </Svg>
  );
}

// Dotori Room Icon (도토리룸)
function BookshelfIcon({ active }) {
  const color = active ? Colors.gray900 : Colors.gray500;
  return (
    <Svg width="24" height="24" viewBox="0 0 20 20" fill="none">
      <Path d="M10.5743 1.83647C10.9135 1.67316 11.294 1.64566 11.6144 1.68348C11.9336 1.72117 12.2875 1.83456 12.5673 2.05457C13.1669 2.52602 13.1705 3.23596 13.0906 3.69031C13.0071 4.16488 12.7985 4.60996 12.6544 4.87277C12.6127 4.94874 12.5717 5.01865 12.5331 5.08598C12.6048 5.11635 12.6786 5.14707 12.7521 5.1812C13.1068 5.34604 13.2611 5.76799 13.0963 6.12277C12.9314 6.47732 12.5102 6.63085 12.1555 6.46619C11.9706 6.38024 11.7921 6.31135 11.6298 6.25135C11.5104 6.30909 11.3798 6.36266 11.2481 6.40434C10.973 6.49145 10.5682 6.57996 10.2097 6.52397C9.89732 6.47516 9.52845 6.32221 9.23073 6.11789C9.09493 6.02468 8.90689 5.87183 8.75872 5.66216C7.99847 5.69562 7.23681 6.04661 6.74782 6.39865C5.84921 7.04563 5.38186 7.80074 5.24635 8.2297C5.16563 8.48531 5.21897 8.75813 5.43109 8.95805C6.11168 9.59909 7.61459 10.2876 9.69297 10.5857C12.3043 10.9601 13.9346 10.6247 14.6108 10.4384C14.6242 10.4347 14.6636 10.425 14.7133 10.3204C14.7699 10.2011 14.8141 9.99969 14.8085 9.7214C14.7972 9.16265 14.588 8.48537 14.225 7.98393C13.9958 7.66712 14.0663 7.22455 14.3829 6.99516C14.6998 6.76578 15.1431 6.83696 15.3725 7.15386C15.9113 7.89828 16.2086 8.85786 16.2254 9.69373C16.2337 10.1127 16.1728 10.5493 15.9934 10.9275C15.8756 11.1759 15.7 11.4062 15.462 11.5769C15.3958 12.0659 15.2618 12.7009 15.0356 13.3689C14.7398 14.2423 14.2716 15.2224 13.5536 16.0129C12.2052 17.4976 10.4474 18.6571 8.32659 18.2517C7.45096 18.0843 6.73973 17.7547 6.12445 17.2393C5.52082 16.7336 5.04081 16.0747 4.58636 15.3C4.12807 14.5188 3.87484 13.6236 3.77825 12.7211C3.73664 12.3322 4.01769 11.9832 4.40651 11.9415C4.79549 11.8998 5.14451 12.1815 5.18613 12.5705C5.26606 13.3173 5.47169 14.0098 5.80788 14.5831C6.22533 15.2947 6.60883 15.7965 7.03428 16.1529C7.44798 16.4994 7.93188 16.7337 8.59271 16.8601C9.98588 17.1264 11.2785 16.4107 12.5047 15.0608C13.0466 14.4641 13.4343 13.6796 13.6936 12.9139C13.7997 12.6007 13.8797 12.2985 13.941 12.0253C12.9366 12.1822 11.4547 12.2695 9.49115 11.9878C7.26924 11.6691 5.43946 10.9115 4.46022 9.98914C3.81378 9.38025 3.66747 8.52522 3.89544 7.80327C4.13701 7.03837 4.81474 6.04459 5.92018 5.24874C6.52389 4.81411 7.51965 4.31935 8.61956 4.25102C8.6287 4.21032 8.63712 4.16963 8.64723 4.12977C8.71779 3.85181 8.82921 3.52605 8.99066 3.26632C9.37386 2.64987 9.90104 2.1607 10.5743 1.83647ZM11.4483 3.09054C11.3126 3.07452 11.2199 3.09751 11.1887 3.11251C10.7688 3.31476 10.4412 3.61566 10.1935 4.01421C10.1422 4.09677 10.0755 4.26322 10.0209 4.47807C9.98076 4.63632 9.95754 4.78004 9.9485 4.88253C9.96746 4.90034 9.9944 4.92405 10.0323 4.95008C10.0985 4.99549 10.1778 5.03777 10.2569 5.07052C10.3384 5.10423 10.3999 5.11974 10.4286 5.12423C10.4316 5.12449 10.4419 5.12472 10.4604 5.12423C10.4849 5.12359 10.5176 5.12102 10.5572 5.11528C10.6375 5.10362 10.7297 5.08204 10.8201 5.05343C10.8821 5.03381 10.9354 5.01181 10.978 4.99321C11.1327 4.66986 11.3093 4.37897 11.4125 4.1908C11.523 3.98927 11.6507 3.70049 11.6957 3.44455C11.7177 3.31937 11.7128 3.23895 11.7031 3.19634C11.7009 3.18703 11.6989 3.18064 11.6974 3.1768L11.6949 3.17111C11.6945 3.17071 11.6934 3.17005 11.6917 3.16867C11.6699 3.15155 11.585 3.1067 11.4483 3.09054Z" fill={color} />
    </Svg>
  );
}

// My/Profile Icon
function MyIcon({ active }) {
  const color = active ? Colors.gray900 : Colors.gray500;
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path d="M10.715 10.5645C11.1844 10.5708 11.5601 10.9565 11.5539 11.4258C11.5475 11.895 11.1618 12.2708 10.6926 12.2646C10.2928 12.2592 9.78173 12.2775 9.41131 12.3633C7.89691 12.714 6.75905 13.7018 6.04999 15.1191C5.7538 15.7112 5.53802 16.1915 5.19549 16.8848C4.98067 17.3198 4.98452 17.8938 5.21698 18.3467C5.42894 18.7595 5.83637 19.0879 6.53241 19.0879H15.7873C16.2567 19.0879 16.6379 19.4681 16.6379 19.9375C16.6379 20.4069 16.2567 20.7871 15.7873 20.7871H6.53241C5.17769 20.7871 4.19847 20.0835 3.70526 19.123C3.23271 18.2024 3.21291 17.0612 3.67206 16.1318C3.94371 15.582 4.27134 14.8744 4.52948 14.3584C5.43405 12.5502 6.95591 11.1868 9.02752 10.707C9.60749 10.5727 10.2892 10.5587 10.715 10.5645ZM7.15936 8.04492C7.15939 5.35385 9.27924 3.21289 12.0021 3.21289C14.6766 3.21293 16.8449 5.35214 16.8449 8.05371C16.8449 9.33399 16.3703 10.3003 15.8586 10.9678C16.0912 11.056 16.3401 11.1645 16.6008 11.2979C17.4414 11.7281 18.1658 12.3288 18.7404 13.1074C19.3694 13.9598 19.8223 15.0182 20.3088 16.1016C20.8917 17.3999 20.8261 18.9755 19.5158 20.0703C19.1555 20.3713 18.6195 20.3232 18.3185 19.9629C18.0177 19.6026 18.0657 19.0666 18.426 18.7656C19.0071 18.2799 19.1134 17.5894 18.758 16.7979C18.2396 15.6433 17.8671 14.7878 17.3723 14.1172C16.9599 13.5583 16.4422 13.1267 15.8264 12.8115C15.2982 12.5413 14.8448 12.4093 14.5344 12.3447C14.3795 12.3125 14.2605 12.2963 14.1857 12.2891C14.1484 12.2854 14.1214 12.2839 14.1076 12.2832H14.1047C13.7179 12.2817 13.3805 12.0192 13.2844 11.6445C13.1883 11.2699 13.3572 10.877 13.6955 10.6895C13.7018 10.6857 13.7137 10.6792 13.7297 10.6689C13.7643 10.6467 13.819 10.609 13.8879 10.5566C14.0266 10.4512 14.2158 10.2887 14.4045 10.0674C14.7783 9.62898 15.1447 8.97252 15.1447 8.05371C15.1447 6.29748 13.7442 4.91215 12.0021 4.91211C10.2207 4.91211 8.85958 6.29017 8.85956 8.04492C8.85956 8.2468 8.87687 8.43105 8.90545 8.59863C8.98436 9.06137 8.67288 9.50017 8.21014 9.5791C7.74755 9.65793 7.30875 9.34729 7.22967 8.88477C7.18525 8.62432 7.15936 8.34418 7.15936 8.04492Z" fill={color} />
    </Svg>
  );
}

/**
 * BottomNavigation Component
 * @param {string} activeTab - Currently active tab ('home', 'dotoriRoom', 'bookshelf', 'chat', 'my')
 * @param {function} onTabPress - Callback when tab is pressed, receives tab name
 * @param {object} style - Additional style overrides
 */
export default function BottomNavigation({ activeTab = 'home', onTabPress, currentBooks = [], readingRecords = [], onUpdateReading, onWriteReview, onSaveReadingRecord, onReady, style }) {
  const insets = useSafeAreaInsets();
  const cardCaptureRef = React.useRef(null);
  const [resultToast, setResultToast] = React.useState({ visible: false, message: '' });
  const [customCardBg, setCustomCardBg] = React.useState(null);
  const [showBookInfo, setShowBookInfo] = React.useState(true);

  const showResultToast = (message) => {
    setResultToast({ visible: true, message });
  };

  const handlePickFromAlbum = () => {
    pickImageFromLibrary((uri) => {
      setCustomCardBg(uri);
      closeCardMenu();
    });
  };

  const handleTakePhoto = () => {
    takePhotoUtil((uri) => {
      setCustomCardBg(uri);
      closeCardMenu();
    });
  };

  // 카드 메뉴 바텀시트
  const [isCardMenuVisible, setIsCardMenuVisible] = React.useState(false);
  const cardMenuTranslateY = React.useRef(new Animated.Value(300)).current;
  const cardMenuPanResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderMove: (_, g) => { if (g.dy > 0) cardMenuTranslateY.setValue(g.dy); },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 100) {
          closeCardMenu();
        } else {
          Animated.spring(cardMenuTranslateY, { toValue: 0, useNativeDriver: true, tension: 50, friction: 10 }).start();
        }
      },
    })
  ).current;

  const openCardMenu = () => {
    setIsCardMenuVisible(true);
    Animated.spring(cardMenuTranslateY, { toValue: 0, useNativeDriver: true, tension: 50, friction: 10 }).start();
  };

  const closeCardMenu = () => {
    Animated.timing(cardMenuTranslateY, { toValue: 300, duration: 200, useNativeDriver: true }).start(() => {
      setIsCardMenuVisible(false);
    });
  };
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalTitle, setModalTitle] = React.useState('독서 시작');
  const [isAddRecordMode, setIsAddRecordMode] = React.useState(false);
  const [addRecordBook, setAddRecordBook] = React.useState(null);
  const [addRecordDate, setAddRecordDate] = React.useState('');
  const [isAddRecordEditVisible, setIsAddRecordEditVisible] = React.useState(false);
  const [addRecordStartPage, setAddRecordStartPage] = React.useState('');
  const [addRecordEndPage, setAddRecordEndPage] = React.useState('');
  const [searchText, setSearchText] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [hasSearched, setHasSearched] = React.useState(false);
  const [selectedBook, setSelectedBook] = React.useState(null);
  const [selectedBookTotalPages, setSelectedBookTotalPages] = React.useState(0);
  const [isPageModalVisible, setIsPageModalVisible] = React.useState(false);
  const [pageInput, setPageInput] = React.useState('');
  const pageInputRef = React.useRef(null);
  const [elapsed, setElapsed] = React.useState(0);
  const timerRef = React.useRef(null);
  const [isPauseModalVisible, setIsPauseModalVisible] = React.useState(false);
  const [isResultModalVisible, setIsResultModalVisible] = React.useState(false);
  const [resultElapsed, setResultElapsed] = React.useState(0);
  const [readingStartTime, setReadingStartTime] = React.useState(null);
  const [readingEndTime, setReadingEndTime] = React.useState(null);
  const [readingStartPage, setReadingStartPage] = React.useState(0);
  const [resultAreaSize, setResultAreaSize] = React.useState({ width: 0, height: 0 });
  const [selectedVariant, setSelectedVariant] = React.useState('light');
  const [isEndPageModalVisible, setIsEndPageModalVisible] = React.useState(false);
  const [endPageInput, setEndPageInput] = React.useState('');
  const endPageInputRef = React.useRef(null);
  const [sessionReadingDays, setSessionReadingDays] = React.useState(1);
  const isManualResultRef = React.useRef(false);
  const isBookSelectingRef = React.useRef(false);
  const isSavingRef = React.useRef(false);
  const isPlayPressRef = React.useRef(false);

  React.useEffect(() => {
    if (onReady) {
      onReady((options = {}) => {
        const title = typeof options === 'string' ? options : (options.title ?? '독서 시작');
        const addRecord = typeof options === 'object' && !!options.addRecordMode;
        const date = typeof options === 'object' ? (options.date ?? new Date().toISOString().split('T')[0]) : new Date().toISOString().split('T')[0];
        setModalTitle(title);
        setIsAddRecordMode(addRecord);
        setAddRecordDate(date);
        // 매번 열릴 때 검색/선택 상태 초기화
        setSelectedBook(null);
        setSearchText('');
        setSearchResults([]);
        setHasSearched(false);
        setPageInput('');
        setIsModalOpen(true);
      });
    }
  }, []);

  React.useEffect(() => {
    if (isPlaying && !isPauseModalVisible) {
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, isPauseModalVisible]);

  const formatTime = (s) => {
    const h = String(Math.floor(s / 3600)).padStart(2, '0');
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };


  const handleSaveImage = async () => {
    if (Platform.OS === 'web') {
      showResultToast('이미지 저장은 모바일 앱에서 지원돼요.');
      return;
    }
    try {
      const success = await saveCardImage(cardCaptureRef);
      if (success) showResultToast('이미지가 저장되었어요.');
    } catch {
      showResultToast('이미지 저장에 실패했어요.');
    }
  };

  const handleWriteReview = async () => {
    try {
      let imageUri = null;
      if (Platform.OS !== 'web') {
        try {
          imageUri = await captureCard(cardCaptureRef);
        } catch (e) {
          console.warn('captureCard 실패 (무시):', e);
        }
      }
      setIsResultModalVisible(false);
      onWriteReview?.({
        book: selectedBook,
        endPage: parseInt(endPageInput) || 0,
        imageUri,
      });
    } catch (e) {
      console.error('handleWriteReview 에러:', e);
      showResultToast('오류가 발생했어요.');
    }
  };

  const handleCloseModal = () => {
    setIsPlaying(false);
    setElapsed(0);
    setIsModalOpen(false);
    setSearchText('');
    setSearchResults([]);
    setHasSearched(false);
    setIsSearching(false);
    setPageInput('');
  };

  const handleStartReading = () => {
    setReadingStartTime(new Date());
    setReadingStartPage(parseInt(pageInput) || 0);
    setIsPageModalVisible(false);
    setPageInput('');
    setTimeout(() => {
      setIsModalOpen(false);
    }, 250);
    setTimeout(() => {
      setIsPlaying(true);
    }, 600);
  };

  const handleBookSelect = async (book) => {
    if (isBookSelectingRef.current) return;
    isBookSelectingRef.current = true;
    try {
    if (isAddRecordMode) {
      const bookRecords = readingRecords.filter(r => String(r.isbn) === String(book.isbn));
      const prevRecord = [...bookRecords]
        .filter(r => r.date < addRecordDate)
        .sort((a, b) => b.date.localeCompare(a.date))[0];
      setAddRecordStartPage(prevRecord ? String(prevRecord.endPage) : '');
      setAddRecordEndPage('');
      setIsModalOpen(false);

      // totalPages가 없으면 API에서 가져오기
      let resolvedBook = book;
      if (!book.totalPages && book.isbn) {
        try {
          const detail = await fetchBookDetail(book.isbn);
          resolvedBook = { ...book, totalPages: detail?.subInfo?.itemPage || 0 };
        } catch {
          resolvedBook = book;
        }
      }
      setAddRecordBook(resolvedBook);
      setTimeout(() => setIsAddRecordEditVisible(true), 300);
      return;
    }
    setSelectedBook(book);
    setSelectedBookTotalPages(0);
    setPageInput(book.currentPage > 0 ? String(book.currentPage) : '');
    setIsPageModalVisible(true);
    if (book.totalPages > 0) {
      setSelectedBookTotalPages(book.totalPages);
    } else if (book.isbn) {
      try {
        const detail = await fetchBookDetail(book.isbn);
        setSelectedBookTotalPages(detail?.subInfo?.itemPage || 0);
      } catch {
        setSelectedBookTotalPages(0);
      }
    }
  } finally {
    isBookSelectingRef.current = false;
  }
  };

  React.useEffect(() => {
    if (isPageModalVisible) {
      setTimeout(() => pageInputRef.current?.focus(), 100);
    }
  }, [isPageModalVisible]);

  React.useEffect(() => {
    if (isResultModalVisible) {
      if (isManualResultRef.current) {
        // 수동 기록은 endPage가 이미 설정되어 있으므로 입력 팝업 스킵
      } else {
        setEndPageInput('');
        setIsEndPageModalVisible(true);
      }
    }
  }, [isResultModalVisible]);

  React.useEffect(() => {
    if (isEndPageModalVisible) {
      setTimeout(() => endPageInputRef.current?.focus(), 100);
    }
  }, [isEndPageModalVisible]);

  const handleSearch = async () => {
    if (!searchText.trim()) return;
    setIsSearching(true);
    setHasSearched(true);
    try {
      const results = await searchBooks(searchText, 'Keyword', 20);
      setSearchResults(results);
    } catch (error) {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (text) => {
    setSearchText(text);
    if (text.length === 0) {
      setSearchResults([]);
      setHasSearched(false);
    }
  };
  const tabs = [
    { id: 'home', label: '홈', Icon: HomeIcon },
    { id: 'dotoriRoom', label: '피드', Icon: DotoriRoomIcon },
    { id: 'bookshelf', label: '도토리룸', Icon: BookshelfIcon },
    { id: 'my', label: 'my', Icon: MyIcon },
  ];

  return (
    <View style={[styles.container, style]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => onTabPress && onTabPress(tab.id)}
            activeOpacity={0.7}
          >
            <tab.Icon active={isActive} />
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
      <View style={styles.playButtonWrapper}>
        {(isPlaying || elapsed > 0) && (
          <View style={styles.timerBox}>
            <Text style={styles.timerText}>{formatTime(elapsed)}</Text>
          </View>
        )}
        <IconButton size={52} style={styles.playButton} onPress={() => {
          if (isPlaying) {
            if (!isPauseModalVisible) setIsPauseModalVisible(true);
          } else if (elapsed > 0) {
            setIsPlaying(true);
          } else {
            if (isPlayPressRef.current || isModalOpen) return;
            isPlayPressRef.current = true;
            setTimeout(() => { isPlayPressRef.current = false; }, 800);
            setModalTitle('독서 시작');
            setIsAddRecordMode(false);
            setSearchText('');
            setSearchResults([]);
            setHasSearched(false);
            setIsSearching(false);
            setPageInput('');
            setIsModalOpen(true);
          }
        }}>
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </IconButton>
      </View>

      <ModalPopup
        visible={isPauseModalVisible}
        title="독서를 그만할까요?"
        description="정지해도 다음에 이어서 읽을 수 있어요"
        primaryButtonText="정지"
        secondaryButtonText="일시정지"
        onPrimaryPress={() => {
          const todayStr = new Date().toISOString().split('T')[0];
          const existingDates = selectedBook?.readingDates || [];
          const uniqueDays = new Set(existingDates);
          uniqueDays.add(todayStr);
          setSessionReadingDays(uniqueDays.size);
          setResultElapsed(elapsed);
          setReadingEndTime(new Date());
          setIsPauseModalVisible(false);
          handleCloseModal();
          setIsResultModalVisible(true);
        }}
        onSecondaryPress={() => {
          setIsPauseModalVisible(false);
          setIsPlaying(false);
        }}
        onClose={() => setIsPauseModalVisible(false)}
      />

      <Modal visible={isResultModalVisible} animationType="slide" onRequestClose={() => { setIsResultModalVisible(false); isManualResultRef.current = false; }}>
        <View style={styles.resultModalContainer}>
          <DefaultHeader
            title="독서 결과"
            showBlur={false}
            backgroundColor={Colors.white}
            topInset={insets.top}
            rightButtons={[
              <Button
                key="done"
                variant="text"
                size="large"
                onPress={() => { setIsResultModalVisible(false); setCustomCardBg(null); isManualResultRef.current = false; }}
              >
                완료
              </Button>
            ]}
          />
          <View style={[styles.resultBody, { paddingTop: insets.top + 52 }]}>
            {/* 결과 데이터 영역 - 70% */}
            {(() => {
              const previewScale = resultAreaSize.width > 0
                ? Math.min(resultAreaSize.width / CARD_WIDTH, resultAreaSize.height / CARD_HEIGHT)
                : 1;
              const scaledW = CARD_WIDTH * previewScale;
              const scaledH = CARD_HEIGHT * previewScale;
              return (
                <>
                  {/* 캡처용 원본 사이즈 카드 — previewScale로 blur 동일하게 */}
                  <View
                    ref={cardCaptureRef}
                    collapsable={false}
                    style={{ position: 'absolute', left: -(CARD_WIDTH + 10), top: 0, width: CARD_WIDTH, height: CARD_HEIGHT }}
                  >
                    <ReadingResultCard
                      variant={selectedVariant}
                      book={selectedBook}
                      elapsed={resultElapsed}
                      startTime={readingStartTime}
                      endTime={readingEndTime}
                      startPage={readingStartPage}
                      endPage={parseInt(endPageInput) || 0}
                      totalPages={selectedBookTotalPages}
                      readingDays={sessionReadingDays}
                      displayScale={previewScale}
                      customBackground={customCardBg}
                      showBookInfo={showBookInfo}
                    />
                  </View>
                  <View
                    style={styles.resultDataArea}
                    onLayout={(e) => {
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
                            variant={selectedVariant}
                            book={selectedBook}
                            elapsed={resultElapsed}
                            startTime={readingStartTime}
                            endTime={readingEndTime}
                            startPage={readingStartPage}
                            endPage={parseInt(endPageInput) || 0}
                            totalPages={selectedBookTotalPages}
                            readingDays={sessionReadingDays}
                            displayScale={previewScale}
                            customBackground={customCardBg}
                            showBookInfo={showBookInfo}
                          />
                        </View>
                        {/* 카드 전체를 덮는 투명 터치 오버레이 */}
                        <Pressable
                          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                          onPress={openCardMenu}
                        />
                        {/* 책정보 토글 — style1/2에서만 카드 하단 중앙에 오버레이 */}
                        {(selectedVariant === 'style1' || selectedVariant === 'style2') && (
                          <View style={styles.bookInfoToggleRow}>
                            <Text style={styles.bookInfoToggleLabel}>책 정보</Text>
                            <Switch value={showBookInfo} onValueChange={setShowBookInfo} />
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                </>
              );
            })()}

            {/* 스타일 선택 탭 */}
            <View style={styles.resultTabSection}>
              {[
                { key: 'light',  label: 'Light'  },
                { key: 'dark',   label: 'Dark'   },
                { key: 'style1', label: 'Style1' },
                { key: 'style2', label: 'Style2' },
              ].map(({ key, label }) => (
                <ResultStyleTab
                  key={key}
                  label={label}
                  selected={selectedVariant === key}
                  onPress={() => setSelectedVariant(key)}
                />
              ))}
            </View>

            {/* 하단 버튼 영역 */}
            <View style={[styles.resultBottomButtons, { paddingBottom: insets.bottom + Spacing.md }]}>
              <Text style={styles.resultSaveHint}>독서 결과는 자동으로 도토리룸에 저장돼요.</Text>
              <View style={styles.resultButtonRow}>
                <Button variant="outline" size="xxlarge" style={styles.resultButtonHalf} onPress={handleWriteReview}>
                  독후감 작성
                </Button>
                <Button variant="primary" size="xxlarge" style={styles.resultButtonHalf} onPress={handleSaveImage}>
                  이미지 저장
                </Button>
              </View>
            </View>
          <Toast
            visible={resultToast.visible}
            message={resultToast.message}
            onHide={() => setResultToast(prev => ({ ...prev, visible: false }))}
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

          <ModalPopup
            visible={isEndPageModalVisible}
            title="어디까지 읽었나요?"
            description={selectedBook?.title?.split(' - ')[0].trim()}
            descriptionStyle={{ color: Colors.primary500 }}
            primaryButtonText="확인"
            hideSecondaryButton={true}
            onPrimaryPress={() => {
              const endPage = parseInt(endPageInput) || 0;
              setIsEndPageModalVisible(false);
              if (onUpdateReading && selectedBook) {
                onUpdateReading(selectedBook, 'updatePage', {
                  currentPage: endPage,
                  totalPages: selectedBookTotalPages,
                });
              }
              if (onSaveReadingRecord && selectedBook) {
                onSaveReadingRecord({
                  date: new Date().toISOString().split('T')[0],
                  isbn: selectedBook.isbn,
                  title: selectedBook.title,
                  cover: selectedBook.coverImage,
                  duration: resultElapsed,
                  createdAt: new Date().toISOString(),
                  startPage: readingStartPage,
                  endPage,
                  totalPages: selectedBookTotalPages,
                });
              }
            }}
            primaryButtonDisabled={
              !endPageInput.trim() ||
              (endPageInput.length > 1 && endPageInput.startsWith('0')) ||
              (selectedBookTotalPages > 0 && parseInt(endPageInput) > selectedBookTotalPages) ||
              parseInt(endPageInput) <= readingStartPage
            }
            onClose={() => setIsEndPageModalVisible(false)}
          >
            <TextField
              ref={endPageInputRef}
              placeholder="페이지를 입력해주세요"
              helpText={
                endPageInput.length > 1 && endPageInput.startsWith('0')
                  ? '올바른 페이지 번호를 입력해주세요.'
                  : selectedBookTotalPages > 0 && parseInt(endPageInput) > selectedBookTotalPages
                  ? `책의 마지막 페이지(${selectedBookTotalPages}p)를 넘었어요.`
                  : endPageInput.trim() && parseInt(endPageInput) <= readingStartPage
                  ? '읽기 시작한 페이지보다 큰 값을 입력해주세요.'
                  : '읽기 시작한 페이지보다 큰 값을 입력해주세요.'
              }
              value={endPageInput}
              onChangeText={text => setEndPageInput(text.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              returnKeyType="done"
              error={
                (endPageInput.length > 1 && endPageInput.startsWith('0')) ||
                (selectedBookTotalPages > 0 && parseInt(endPageInput) > selectedBookTotalPages) ||
                (endPageInput.trim() !== '' && parseInt(endPageInput) <= readingStartPage)
              }
              style={{ marginTop: Spacing.md }}
            />
          </ModalPopup>
        </View>
        </View>
      </Modal>

      <Modal visible={isModalOpen} animationType="slide" onRequestClose={handleCloseModal}>
        <View style={styles.modalContainer}>
          <DefaultHeader
            title={modalTitle}
            showBlur={false}
            backgroundColor={Colors.white}
            topInset={insets.top}
            rightButton={<CloseIcon />}
            onMenu={handleCloseModal}
          />
          <View style={[styles.modalStatic, { paddingTop: insets.top + 52 + Spacing.lg }]}>
            <TextField
              placeholder="책 또는 저자를 검색해주세요"
              value={searchText}
              onChangeText={handleSearchChange}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              showClearButton
              style={{ marginBottom: Spacing.xxl }}
            />
            {/* <View style={styles.divider} /> */}
          </View>
          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            {isSearching ? (
              /* 로딩 중 */
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary500} />
              </View>
            ) : hasSearched ? (
              searchResults.length > 0 ? (
                /* 검색 결과 있음 */
                <View style={styles.searchSection}>
                  <View style={styles.sectionTitleWithCount}>
                    <SectionTitle>도서</SectionTitle>
                    <Text style={styles.resultCount}>{searchResults.length}</Text>
                  </View>
                  <View style={styles.resultsGrid}>
                    {searchResults.map((book, index) => (
                      <View
                        key={book.isbn || index}
                        style={[
                          styles.bookCardWrapper,
                          (index + 1) % 3 === 0 && styles.bookCardWrapperLast,
                        ]}
                      >
                        <BestBook
                          rank={4}
                          title={book.title}
                          author={book.author}
                          coverImage={book.coverImage}
                          isbn={book.isbn}
                          style={styles.bookCard}
                          flexibleWidth={true}
                          onPress={() => handleBookSelect(book)}
                        />
                      </View>
                    ))}
                  </View>
                </View>
              ) : (
                /* 검색 결과 없음 */
                <EmptyState text="검색 결과가 없어요" />
              )
            ) : (
              currentBooks.length > 0 ? (
                /* 읽고 있는 책 있음 */
                <View>
                  <SectionTitle>읽고 있는 책</SectionTitle>
                  {currentBooks.map((book, index) => (
                    <ReadingBookItem
                      key={book.isbn || index}
                      title={book.title}
                      author={book.author}
                      coverImage={book.coverImage}
                      progress={book.progress || 0}
                      onPress={() => handleBookSelect(book)}
                    />
                  ))}
                </View>
              ) : (
                /* 읽고 있는 책 없음 */
                <EmptyState text="읽고 있는 책이 없어요" />
              )
            )}
          </ScrollView>
          <ModalPopup
            visible={isPageModalVisible}
            title="몇페이지부터 읽을까요?"
            description={selectedBook?.title?.split(' - ')[0].trim()}
            descriptionStyle={{ color: Colors.primary500 }}
            primaryButtonText="시작"
            secondaryButtonText="취소"
            onPrimaryPress={handleStartReading}
            primaryButtonDisabled={
              !pageInput.trim() ||
              (pageInput.length > 1 && pageInput.startsWith('0')) ||
              (selectedBookTotalPages > 0 && parseInt(pageInput) > selectedBookTotalPages) ||
              (selectedBook?.currentPage > 0 && parseInt(pageInput) < selectedBook.currentPage)
            }
            onClose={() => setIsPageModalVisible(false)}
          >
            <TextField
              ref={pageInputRef}
              placeholder="페이지를 입력해주세요"
              helpText={
                pageInput.length > 1 && pageInput.startsWith('0')
                  ? '올바른 페이지 번호를 입력해주세요.'
                  : selectedBookTotalPages > 0 && parseInt(pageInput) > selectedBookTotalPages
                  ? `책의 마지막 페이지(${selectedBookTotalPages}p)를 넘었어요.`
                  : selectedBook?.currentPage > 0 && parseInt(pageInput) < selectedBook.currentPage
                  ? `읽고있는 페이지(${selectedBook.currentPage}p)보다 이전이에요.`
                  : selectedBook?.currentPage > 0
                  ? '현재 진도율 부터 읽을 수 있어요.'
                  : '0을 입력하시면 처음부터 읽어요'
              }
              value={pageInput}
              onChangeText={text => setPageInput(text.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              returnKeyType="done"
              error={
                (pageInput.length > 1 && pageInput.startsWith('0')) ||
                (selectedBookTotalPages > 0 && parseInt(pageInput) > selectedBookTotalPages) ||
                (selectedBook?.currentPage > 0 && parseInt(pageInput) < selectedBook.currentPage)
              }
              style={{ marginTop: Spacing.md }}
            />
          </ModalPopup>
        </View>
      </Modal>

      <Modal visible={isAddRecordEditVisible} animationType="slide" onRequestClose={() => setIsAddRecordEditVisible(false)}>
        <View style={styles.addRecordContainer}>
          <DefaultHeader
            title={modalTitle}
            showBlur={false}
            backgroundColor={Colors.white}
            topInset={insets.top}
            onBack={() => setIsAddRecordEditVisible(false)}
            hideRightButton
          />
          <View style={[styles.addRecordBody, { paddingTop: insets.top + 52 + Spacing.xl }]}>
            {/* 책 정보 카드 */}
            <View style={styles.addRecordBookCard}>
              <Image
                source={addRecordBook?.coverImage ? { uri: addRecordBook.coverImage } : null}
                style={styles.addRecordCover}
                resizeMode="cover"
              />
              <View>
                <Text style={styles.addRecordBookTitle} numberOfLines={1}>
                  {addRecordBook?.title?.split(' - ')[0].trim()}
                </Text>
                <Text style={styles.addRecordBookAuthor} numberOfLines={1}>
                  {addRecordBook?.author}
                </Text>
              </View>
            </View>

            <AddRecordForm
              addRecordBook={addRecordBook}
              addRecordDate={addRecordDate}
              addRecordStartPage={addRecordStartPage}
              setAddRecordStartPage={setAddRecordStartPage}
              addRecordEndPage={addRecordEndPage}
              setAddRecordEndPage={setAddRecordEndPage}
              readingRecords={readingRecords}
              insets={insets}
              onSave={(startPage, endPage, duration) => {
                if (isSavingRef.current) return;
                isSavingRef.current = true;
                const totalPages = addRecordBook?.totalPages ?? 0;
                const isCompleted = totalPages > 0 && endPage >= totalPages;
                onSaveReadingRecord?.({
                  isbn: addRecordBook?.isbn,
                  title: addRecordBook?.title,
                  cover: addRecordBook?.coverImage,
                  duration,
                  startPage,
                  endPage,
                  totalPages,
                  date: addRecordDate || new Date().toISOString().split('T')[0],
                  createdAt: addRecordDate ? new Date(addRecordDate).toISOString() : new Date().toISOString(),
                });
                onUpdateReading?.(addRecordBook, isCompleted ? 'complete' : 'updatePage', {
                  currentPage: endPage,
                  totalPages,
                  isCompleted,
                });

                // 결과 팝업을 위한 상태 세팅
                setSelectedBook(addRecordBook);
                setResultElapsed(duration);
                setReadingStartPage(startPage);
                setEndPageInput(String(endPage));
                setSelectedBookTotalPages(totalPages);
                setReadingStartTime(null);
                setReadingEndTime(null);
                setSessionReadingDays(1);
                isManualResultRef.current = true;

                setIsAddRecordEditVisible(false);
                setAddRecordBook(null);
                setIsAddRecordMode(false);
                setTimeout(() => { setIsResultModalVisible(true); isSavingRef.current = false; }, 300);
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  addRecordContainer: { flex: 1, backgroundColor: Colors.white },
  addRecordBody: { flex: 1, paddingHorizontal: Spacing.lg, gap: Spacing.xl },
  addRecordBookCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xl,
  },
  addRecordCover: { width: 41, height: 60, borderRadius: 3, backgroundColor: Colors.gray100 },
  addRecordBookTitle: { ...Typography.body1Medium, color: Colors.gray900 },
  addRecordBookAuthor: { ...Typography.body2Regular, color: Colors.gray500, marginTop: Spacing.xxs },

  container: {
    flexDirection: 'row',
    height: 76,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xxs,
  },
  label: {
    ...Typography.caption1Regular,
    color: Colors.gray500,
    textAlign: 'center',
  },
  activeLabel: {
    color: Colors.gray900,
  },
  playButtonWrapper: {
    alignSelf: 'center',
    marginLeft: Spacing.md,
  },
  playButton: {
    backgroundColor: Colors.primary500,
  },
  timerBox: {
    position: 'absolute',
    width: 70,
    alignSelf: 'center',
    bottom: 52 + 8,
    backgroundColor: Colors.primary800,
    borderRadius: BorderRadius.huge,
    paddingVertical: 5,
    alignItems: 'center',
    zIndex: 10,
  },
  timerText: {
    ...Typography.body3Regular,
    color: Colors.white,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  modalStatic: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.xxl,
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  loadingContainer: {
    paddingTop: Spacing.xxxl,
    alignItems: 'center',
  },
  searchSection: {
    gap: Spacing.sm,
  },
  sectionTitleWithCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resultCount: {
    ...Typography.body1ExtraBold,
    color: Colors.primary900,
  },
  resultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  bookCardWrapper: {
    width: '31.5%',
    marginBottom: Spacing.lg,
  },
  bookCardWrapperLast: {
    width: '31.5%',
    marginBottom: Spacing.lg,
  },
  bookCard: {
    paddingTop: 0,
    width: '100%',
  },
  resultModalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  resultBody: {
    flex: 1,
  },
  resultDataArea: {
    height: '70%',
    alignItems: 'center',
    overflow: 'hidden',
  },
  resultTabSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
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
  resultBottomButtons: {
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  resultSaveHint: {
    ...Typography.body2Regular,
    color: Colors.gray500,
    textAlign: 'center',
  },
  resultButtonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  resultButtonHalf: {
    flex: 1,
  },
  cardMenuDragHandle: {
    height: 28,
  },
  cardMenuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  cardMenuContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  cardMenuBody: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.huge,
  },
  cardMenuOptionBox: {
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.md,
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
