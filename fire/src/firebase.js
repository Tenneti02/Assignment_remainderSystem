import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBRkpBgRkdkk0B8_dNyYdKEYGhyUejeT8U",
  authDomain: "assignment-969b4.firebaseapp.com",
  projectId: "assignment-969b4",
  storageBucket: "assignment-969b4.firebasestorage.app",
  messagingSenderId: "996391837098",
  appId: "1:996391837098:web:9b704680f0e19f67889fd3",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);