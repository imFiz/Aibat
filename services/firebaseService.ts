import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, TwitterAuthProvider, signInWithPopup, signOut, User as FirebaseUser } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBMZFDsbZvrDUU5fa1xiG-nF6zPzdCAoZA",
    authDomain: "for4-773e0.firebaseapp.com",
    projectId: "for4-773e0",
    storageBucket: "for4-773e0.firebasestorage.app",
    messagingSenderId: "778992413204",
    appId: "1:778992413204:web:3520ecfa1e492bd04f1501",
    measurementId: "G-XK41WBQ5D0",
    databaseURL: "https://for4-773e0-default-rtdb.europe-west1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, GoogleAuthProvider, TwitterAuthProvider, signInWithPopup, signOut, doc, setDoc, getDoc, updateDoc, increment };
export type { FirebaseUser };