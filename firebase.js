// Import Firebase modules
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyDayFrdSJUTl-uA_zA-JN3L7A8VDqr2bb8",
  authDomain: "apdetector.firebaseapp.com",
  projectId: "apdetector",
  storageBucket: "apdetector.firebasestorage.app",
  messagingSenderId: "1092278671909",
  appId: "1:1092278671909:web:3cea5501cb2de07f8f7dcc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); // Firestore Database
export const rtdb = getDatabase(app);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
