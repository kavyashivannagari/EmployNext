// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth"
import {getDatabase} from "firebase/database"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAsmnfX9sCFDmbXwj9F2J_3VDQ6BvHe8sQ",
  authDomain: "employnext-8bbd8.firebaseapp.com",
  projectId: "employnext-8bbd8",
  storageBucket: "employnext-8bbd8.firebasestorage.app",
  messagingSenderId: "407213440123",
  appId: "1:407213440123:web:e876314164acedaefb36de"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
 export const auth=getAuth(app)
 export const db=getDatabase(app)