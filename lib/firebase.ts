import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  getAuth,
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
  User as FirebaseUser,
} from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { firebaseConfig } from "./config/firebase";

let app: FirebaseApp;
let auth: Auth | null = null;
let db: Firestore;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  app = getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
}

export const signInWithGoogle = async () => {
  if (!auth) throw new Error("Firebase Auth not initialized");
  
  const { GoogleSignin } = await import("@react-native-google-signin/google-signin");
  
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  await GoogleSignin.hasPlayServices();
  const userInfo = await GoogleSignin.signIn();
  const googleCredential = GoogleAuthProvider.credential(userInfo.idToken);
  return signInWithCredential(auth, googleCredential);
};

export const signInWithApple = async () => {
  if (!auth) throw new Error("Firebase Auth not initialized");
  
  const AppleAuthentication = await import("expo-apple-authentication");
  
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  const provider = new OAuthProvider("apple.com");
  const appleCredential = provider.credential({
    idToken: credential.identityToken!,
    rawNonce: (credential as any).nonce,
  });
  
  return signInWithCredential(auth, appleCredential);
};

export const sendOTP = async (phoneNumber: string, recaptchaVerifier: any) => {
  if (!auth) throw new Error("Firebase Auth not initialized");
  const provider = new PhoneAuthProvider(auth);
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

export { auth, db };
