// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import {getAuth} from "firebase/auth"
import {getFirestore} from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: "candid-minds.firebaseapp.com",
    projectId: "candid-minds",
    storageBucket: "candid-minds.firebasestorage.app",
    messagingSenderId: "666456410071",
    appId: "1:666456410071:web:8ccca5749c12ab4b00ad92",
    measurementId: "G-0KBW5ZTLCR"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()


export const auth = getAuth(app)
export const db = getFirestore(app)
