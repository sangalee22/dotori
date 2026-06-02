import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyB-DaCa48IZYkJJV7hn-Ydz3hoe_G-aXS4",
  authDomain: "dotori-b69be.firebaseapp.com",
  projectId: "dotori-b69be",
  storageBucket: "dotori-b69be.firebasestorage.app",
  messagingSenderId: "642592573898",
  appId: "1:642592573898:web:033f50f4aad2461a2ca733",
  measurementId: "G-7ZC08SNGSQ"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = Platform.OS === 'web'
  ? getAuth(app)
  : initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
export const storage = getStorage(app);

export default app;
