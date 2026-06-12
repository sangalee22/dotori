import * as ImagePicker from 'expo-image-picker';

export async function pickImageFromLibrary(callback) {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') return;
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', allowsMultipleSelection: false, quality: 0.7 });
  if (!result.canceled && result.assets?.[0]) callback(result.assets[0].uri);
}

export async function takePhoto(callback) {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') return;
  const result = await ImagePicker.launchCameraAsync({ allowsEditing: false, quality: 0.7 });
  if (!result.canceled && result.assets?.[0]) callback(result.assets[0].uri);
}

export async function resizeImage(uri) {
  return uri;
}
