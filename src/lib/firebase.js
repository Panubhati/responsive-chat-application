import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "reactchat-4ff1d.firebaseapp.com",
  projectId: "reactchat-4ff1d",
  storageBucket: "reactchat-4ff1d.firebasestorage.app",
  messagingSenderId: "749008467678",
  appId: "1:749008467678:web:4bcc326e04ffdab891f44f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth()
export const db = getFirestore()