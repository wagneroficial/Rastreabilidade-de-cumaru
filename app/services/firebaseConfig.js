// app/services/firebaseConfig.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
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

// Inicializa apenas se não houver apps existentes
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
