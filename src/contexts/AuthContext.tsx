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
            const userData = userDoc.data() as User;
            // Update active status and last seen
            const updates = {
              isActive: true,
              lastSeen: new Date(),
            };
            await updateDoc(userRef, updates);
            setUser({ ...userData, ...updates });
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
              isActive: true,
              lastSeen: new Date(),
            };
            await setDoc(userRef, userData);
            setUser(userData);
          }
        } else {
          if (user?.uid) {
            // Update status to offline when signing out
            await updateDoc(doc(db, "users", user.uid), {
              isActive: false,
              lastSeen: new Date(),
            });
          }
          setUser(null);
        }
      } catch (err) {
        console.error("Error in auth state change:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    });

    // Set up presence system
    if (user?.uid) {
      const userRef = doc(db, "users", user.uid);
      const presenceInterval = setInterval(async () => {
        try {
          await updateDoc(userRef, {
            isActive: true,
            lastSeen: new Date(),
          });
        } catch (error) {
          console.error("Error updating presence:", error);
        }
      }, 30000); // Update every 30 seconds

      return () => {
        clearInterval(presenceInterval);
        unsubscribe();
      };
    }

    return () => unsubscribe();
  }, [user?.uid]);

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

        // Update user data with active status and new push token
        const updates = {
          isActive: true,
          ...(pushToken && userData.pushToken !== pushToken
            ? { pushToken }
            : {}),
        };

        await updateDoc(userRef, updates);
        setUser({ ...userData, ...updates });
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
        await updateDoc(doc(db, "users", user.uid), {
          pushToken: null,
          isActive: false,
        });
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
      isActive: true,
      bio: "",
      phoneNumber: "",
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

  const value: AuthContextType = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    logout: signOut,
    updateUserProfile: updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
