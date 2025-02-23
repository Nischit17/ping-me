import React, { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { User, AuthContextType } from "../types";
import { notificationService } from "../services/notificationService";

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            setUser(userDoc.data() as User);
          } else {
            // Create user document if it doesn't exist
            const userData: User = {
              id: firebaseUser.uid,
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName:
                firebaseUser.displayName || firebaseUser.email!.split("@")[0],
              photoURL: firebaseUser.photoURL || null,
              createdAt: new Date(),
            };
            await setDoc(userRef, userData);
            setUser(userData);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Error in auth state change:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      setError(null);
      const { user: firebaseUser } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userData = await createUserDocument(firebaseUser);
      setUser(userData);
    } catch (err) {
      console.error("Error signing up:", err);
      setError(err instanceof Error ? err.message : "Failed to sign up");
      throw err;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const { user: firebaseUser } = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        const pushToken =
          await notificationService.registerForPushNotifications();

        if (pushToken && userData.pushToken !== pushToken) {
          await updateDoc(userRef, { pushToken });
          userData.pushToken = pushToken;
        }

        setUser(userData);
      }
    } catch (err) {
      console.error("Error signing in:", err);
      setError(err instanceof Error ? err.message : "Failed to sign in");
      throw err;
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      if (user?.uid) {
        await updateDoc(doc(db, "users", user.uid), { pushToken: null });
      }
      await firebaseSignOut(auth);
      setUser(null);
    } catch (err) {
      console.error("Error signing out:", err);
      setError(err instanceof Error ? err.message : "Failed to sign out");
      throw err;
    }
  };

  const createUserDocument = async (firebaseUser: FirebaseUser) => {
    const userRef = doc(db, "users", firebaseUser.uid);
    const pushToken = await notificationService.registerForPushNotifications();

    const userData: User = {
      id: firebaseUser.uid,
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName:
        firebaseUser.displayName || firebaseUser.email!.split("@")[0],
      photoURL: firebaseUser.photoURL || null,
      createdAt: new Date(),
      pushToken,
    };

    await setDoc(userRef, userData);
    return userData;
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user?.uid) return;

    try {
      setError(null);
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, data);
      setUser((prev) => (prev ? { ...prev, ...data } : null));
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err instanceof Error ? err.message : "Failed to update profile");
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
