import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
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
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
