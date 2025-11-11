import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBYoymxMBFFZSsLYhgWHh6Z8vkn4c57F-M",
  authDomain: "qr-feedback-backend.firebaseapp.com",
  projectId: "qr-feedback-backend",
  storageBucket: "qr-feedback-backend.firebasestorage.app",
  messagingSenderId: "197952162193",
  appId: "1:197952162193:web:56b4524423c20fa6aeb230",
  measurementId: "G-FWHWCDN5S3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
