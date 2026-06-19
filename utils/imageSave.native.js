import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import { Alert, InteractionManager } from 'react-native';

export async function captureCard(ref) {
  return await captureRef(ref, { format: 'png', quality: 1 });
}

export async function saveCardImage(ref) {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('권한 필요', '사진 저장을 위해 갤러리 접근 권한이 필요합니다.');
    return false;
  }
  // 모달 전환 애니메이션이 완전히 끝난 후 캡처
  await new Promise(resolve => InteractionManager.runAfterInteractions(resolve));
  // format:'jpg' + width:1056 → 직접 목표 해상도 JPEG으로 캡처 (중간 PNG 불필요)
  const uri = await captureRef(ref, { format: 'jpg', quality: 0.9, width: 1056 });
  await MediaLibrary.saveToLibraryAsync(uri);
  return true;
}
