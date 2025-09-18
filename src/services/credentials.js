import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDy5fUIBhZLpKBtGrLlfkf2b7hQxnvsq74",
  authDomain: "ipa-app-93325.firebaseapp.com",
  projectId: "ipa-app-93325",
  storageBucket: "ipa-app-93325.appspot.com",
  messagingSenderId: "710571178171",
  appId: "1:710571178171:web:c0d9df9dc15dee8399d19e",
  databaseURL: "https://ipa-app-93325-default-rtdb.europe-west1.firebasedatabase.app/"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Solución universal para inicialización de auth
let auth;

try {
  if (Platform.OS === 'web') {
    auth = getAuth(app);
  } else {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  }
} catch (error) {
  console.error("Error initializing auth:", error);
  auth = getAuth(app); // Fallback
}

export { app, auth, database };