import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAXgUL4t6NU39GT_ad_aYh_RZNJjC-Gjz4",
    authDomain: "localuni-a9004.firebaseapp.com",
    projectId: "localuni-a9004",
    storageBucket: "localuni-a9004.firebasestorage.app",
    messagingSenderId: "804132051604",
    appId: "1:804132051604:web:b511e873d36b0ec40e7281",
    measurementId: "G-0KM6NM3E84"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
