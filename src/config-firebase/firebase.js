// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'


// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDeii3-L4Y9vrjRn540SZ2AkRheRD6dgLM",
    authDomain: "pick3-v4.firebaseapp.com",
    projectId: "pick3-v4",
    storageBucket: "pick3-v4.appspot.com",
    messagingSenderId: "331809289937",
    appId: "1:331809289937:web:d4dba5e1c8fb4477e0b7f0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// init services
const db = getFirestore()
const auth = getAuth()

export {db, auth}


