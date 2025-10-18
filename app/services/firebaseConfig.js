// app/services/firebaseConfig.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import {
  getReactNativePersistence,
  initializeAuth
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBdEtF94S7SnLpGfcihwWWKyjaVxjQfULQ",
  authDomain: "virtual-75deb.firebaseapp.com",
  projectId: "virtual-75deb",
  storageBucket: "virtual-75deb.appspot.com",
  messagingSenderId: "30730370845",
  appId: "1:30730370845:web:34009f5750ba77bde5ebf4",
  measurementId: "G-2GNG35NFKH",
};

const app = initializeApp(firebaseConfig);

// Auth com persistência explícita usando AsyncStorage
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);
export default app;