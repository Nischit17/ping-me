import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  enableMultiTabIndexedDbPersistence,
  CACHE_SIZE_UNLIMITED,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCfbqP_cKJ6pOxIRG--jRQwdqDU9LyhFIM",
  authDomain: "chat-app-59689.firebaseapp.com",
  projectId: "chat-app-59689",
  storageBucket: "chat-app-59689.appspot.com",
  messagingSenderId: "622024352234",
  appId: "1:622024352234:web:cea93046b9dc225db35293",
  measurementId: "G-7P83L5BT91",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore with optimized configuration
export const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
});

// Enable offline persistence
try {
  enableMultiTabIndexedDbPersistence(db);
} catch (err) {
  console.warn("Firestore persistence could not be enabled:", err);
}

export const storage = getStorage(app);

export default app;
