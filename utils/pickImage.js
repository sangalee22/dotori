import * as ImagePicker from 'expo-image-picker';

export async function pickImageFromLibrary(callback) {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') return;
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', allowsMultipleSelection: false, quality: 1 });
  if (!result.canceled && result.assets?.[0]) callback(result.assets[0].uri);
}

export async function takePhoto(callback) {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') return;
  const result = await ImagePicker.launchCameraAsync({ allowsEditing: false, quality: 1 });
  if (!result.canceled && result.assets?.[0]) callback(result.assets[0].uri);
}

// square=true: 피커가 이미 1:1 크롭한 이미지 → 바로 리사이즈
// maxWidth: 가로 기준 고정 리사이즈 (세로는 비율 유지)
// square=false: 긴 변 기준으로 maxSize 이하로 축소
export async function resizeImage(uri, { maxSize = 1080, maxWidth = null, square = false } = {}) {
  try {
    const ImageManipulator = require('expo-image-manipulator');
    if (square) {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: maxSize } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      return result.uri;
    }

    if (maxWidth !== null) {
      const { width } = await ImageManipulator.manipulateAsync(uri, []);
      if (width <= maxWidth) {
        const result = await ImageManipulator.manipulateAsync(uri, [], { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG });
        return result.uri;
      }
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: maxWidth } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      return result.uri;
    }

    const { width, height } = await ImageManipulator.manipulateAsync(uri, []);
    const longer = Math.max(width, height);

    if (longer <= maxSize) {
      const result = await ImageManipulator.manipulateAsync(uri, [], { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG });
      return result.uri;
    }

    const actions = width >= height ? [{ resize: { width: maxSize } }] : [{ resize: { height: maxSize } }];
    const result = await ImageManipulator.manipulateAsync(uri, actions, { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG });
    return result.uri;
  } catch {
    return uri;
  }
}
