import React, { createContext, useState, useContext, useEffect } from "react";
import { auth, db } from "../config/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  enableIndexedDbPersistence,
} from "firebase/firestore";
import { User } from "../types";

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === "failed-precondition") {
    console.warn("Persistence failed - multiple tabs open");
  } else if (err.code === "unimplemented") {
    console.warn("Persistence not available");
  }
});

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (displayName: string, photoURL: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setUser(userData);
          } else {
            // If user document doesn't exist, create one
            const userData: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName:
                firebaseUser.displayName || firebaseUser.email!.split("@")[0],
              photoURL: firebaseUser.photoURL,
              createdAt: new Date(),
            };
            await setDoc(doc(db, "users", firebaseUser.uid), userData);
            setUser(userData);
          }
        } catch (error: any) {
          if (error.code === "unavailable") {
            // If offline, use the Firebase user data as fallback
            const userData: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName:
                firebaseUser.displayName || firebaseUser.email!.split("@")[0],
              photoURL: firebaseUser.photoURL,
              createdAt: new Date(),
            };
            setUser(userData);
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const { user: firebaseUser } = userCredential;

      await updateProfile(firebaseUser, { displayName });

      const userData: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: displayName,
        photoURL: null,
        createdAt: new Date(),
      };

      await setDoc(doc(db, "users", firebaseUser.uid), userData);
      setUser(userData);
    } catch (error) {
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const { user: firebaseUser } = userCredential;

      // Check if user document exists
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (!userDoc.exists()) {
        // Create user document if it doesn't exist
        const userData: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || email.split("@")[0],
          photoURL: null,
          createdAt: new Date(),
        };
        await setDoc(doc(db, "users", firebaseUser.uid), userData);
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  const updateUserProfile = async (displayName: string, photoURL: string) => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await updateProfile(currentUser, { displayName, photoURL });
        await setDoc(
          doc(db, "users", currentUser.uid),
          { displayName, photoURL },
          { merge: true }
        );
        setUser((prev) => (prev ? { ...prev, displayName, photoURL } : null));
      }
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    logout,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
