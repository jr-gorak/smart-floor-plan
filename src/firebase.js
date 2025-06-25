// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCux9SrWqkFls-jUUW8H8hCH5SN0ZE8MEE",
  authDomain: "smart-floor-planner.firebaseapp.com",
  projectId: "smart-floor-planner",
  storageBucket: "smart-floor-planner.firebasestorage.app",
  messagingSenderId: "695295729545",
  appId: "1:695295729545:web:7c8fdbcba8ba00b7474b58"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);