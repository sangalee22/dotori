import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import { Alert } from 'react-native';

export async function captureCard(ref) {
  return await captureRef(ref, { format: 'png', quality: 1 });
}

export async function saveCardImage(ref) {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('권한 필요', '사진 저장을 위해 갤러리 접근 권한이 필요합니다.');
    return false;
  }
  const uri = await captureCard(ref);
  await MediaLibrary.saveToLibraryAsync(uri);
  return true;
}
