
import { initializeApp, getApp, getApps } from "firebase/app";
import{getAuth} from "firebase/auth";
import {getFirestore} from 'firebase/firestore';
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyA68uxKGHjFbDnxgVk8xG9PVk7NnDVOtjk",
    authDomain: "iready1.firebaseapp.com",
    projectId: "iready1",
    storageBucket: "iready1.firebasestorage.app",
    messagingSenderId: "752373526227",
    appId: "1:752373526227:web:674684df0f9217b9982e26",
    measurementId: "G-HNTB943E8N"
};

// Initialize Firebase
const app = !getApps.length? initializeApp(firebaseConfig): getApp();

export const auth= getAuth(app);
export const db= getFirestore(app);
