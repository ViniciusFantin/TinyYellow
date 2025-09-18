import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyCAnkd52n_ge0IXKZvmhY7c3ZEdAKSoXX0",
  authDomain: "tinyyellow-66b13.firebaseapp.com",
  projectId: "tinyyellow-66b13",
  storageBucket: "tinyyellow-66b13.firebasestorage.app",
  messagingSenderId: "917510144175",
  appId: "1:917510144175:web:bcbbfac059eccddb1cd45a",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
