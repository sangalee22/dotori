import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

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
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
