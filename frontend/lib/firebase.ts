import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { Platform } from "react-native";
import {
  getAuth,
  initializeAuth,
  Auth,
  GoogleAuthProvider,
  OAuthProvider,
  PhoneAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  confirmPasswordReset as firebaseConfirmPasswordReset,
  signOut as firebaseSignOut,
  signInWithPopup,
  User as FirebaseUser,
  ApplicationVerifier,
} from "firebase/auth";
// @ts-ignore - getReactNativePersistence exists but may not be in TypeScript definitions for v11
import { getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore, Firestore } from "firebase/firestore";
import { getDatabase, Database } from "firebase/database";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { firebaseConfig } from "./config/firebase";
import { ENV } from "@/constants/env";

let app: FirebaseApp;
let auth: Auth | null = null;
let db: Firestore;
let realtimeDb: Database;
let storage: FirebaseStorage;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  // Use initializeAuth with AsyncStorage persistence for React Native
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    try {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
      });
    } catch (error: any) {
      // If auth is already initialized, get the existing instance
      if (error.code === 'auth/already-initialized') {
        auth = getAuth(app);
      } else {
        throw error;
      }
    }
  } else {
    // Web platform uses getAuth
    auth = getAuth(app);
  }
  db = getFirestore(app);
  realtimeDb = getDatabase(app);
  storage = getStorage(app);
} else {
  app = getApps()[0];
  // Use initializeAuth with AsyncStorage persistence for React Native
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    try {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
      });
    } catch (error: any) {
      // If auth is already initialized, get the existing instance
      if (error.code === 'auth/already-initialized') {
        auth = getAuth(app);
      } else {
        throw error;
      }
    }
  } else {
    // Web platform uses getAuth
    auth = getAuth(app);
  }
  db = getFirestore(app);
  realtimeDb = getDatabase(app);
  storage = getStorage(app);
}

export const signInWithGoogle = async () => {
  if (!auth) throw new Error("Firebase Auth not initialized");
  
  // Check if running on native mobile (React Native/Expo)
  if (typeof window === 'undefined' || Platform.OS === 'ios' || Platform.OS === 'android') {
    // Mobile Google sign-in not available without proper native setup
    throw new Error('Google sign-in is not available on mobile. Please use email/password or phone authentication.');
  } else {
    // Web implementation
    const { signInWithPopup } = await import("firebase/auth");
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  }
};

export const signInWithApple = async () => {
  if (!auth) throw new Error("Firebase Auth not initialized");
  
  // Apple Sign-In not available without proper native setup
  throw new Error("Apple Sign-In is not available. Please use email/password or phone authentication.");
};

export const sendOTP = async (phoneNumber: string, recaptchaVerifier: ApplicationVerifier | null) => {
  if (!auth) throw new Error("Firebase Auth not initialized");
  const provider = new PhoneAuthProvider(auth);
  if (!recaptchaVerifier) {
    throw new Error("Recaptcha verifier is required");
  }
  return provider.verifyPhoneNumber(phoneNumber, recaptchaVerifier);
};

export const verifyOTP = async (verificationId: string, code: string) => {
  if (!auth) throw new Error("Firebase Auth not initialized");
  const credential = PhoneAuthProvider.credential(verificationId, code);
  return signInWithCredential(auth, credential);
};

export const signInWithEmail = async (email: string, password: string) => {
  if (!auth) throw new Error("Firebase Auth not initialized");
  return signInWithEmailAndPassword(auth, email, password);
};

export const signUpWithEmail = async (email: string, password: string) => {
  if (!auth) throw new Error("Firebase Auth not initialized");
  return createUserWithEmailAndPassword(auth, email, password);
};

export const resetPassword = async (email: string) => {
  if (!auth) throw new Error("Firebase Auth not initialized");
  return sendPasswordResetEmail(auth, email);
};

export const confirmPasswordReset = async (oobCode: string, newPassword: string) => {
  if (!auth) throw new Error("Firebase Auth not initialized");
  return firebaseConfirmPasswordReset(auth, oobCode, newPassword);
};

export const signOut = async () => {
  if (auth) {
    await firebaseSignOut(auth);
  }
};

export const getCurrentUser = (): FirebaseUser | null => {
  return auth?.currentUser || null;
};

export { auth, db, realtimeDb, storage };
