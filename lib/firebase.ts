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
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import * as SecureStore from "expo-secure-store";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let auth: Auth;
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

export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider("apple.com");

export const signInWithGoogle = async () => {
  const { GoogleSignin } = await import("@react-native-google-signin/google-signin");
  
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  await GoogleSignin.hasPlayServices();
  const userInfo = await GoogleSignin.signIn();
  const googleCredential = GoogleAuthProvider.credential(userInfo.data?.idToken);
  return signInWithCredential(auth, googleCredential);
};

export const signInWithApple = async () => {
  const AppleAuthentication = await import("expo-apple-authentication");
  
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationRequestScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationRequestScope.EMAIL,
    ],
  });

  const appleCredential = OAuthProvider.credential(
    appleProvider.providerId,
    credential.identityToken!
  );
  
  return signInWithCredential(auth, appleCredential);
};

export const sendOTP = async (phoneNumber: string, recaptchaVerifier: any) => {
  const provider = new PhoneAuthProvider(auth);
  return provider.verifyPhoneNumber(phoneNumber, recaptchaVerifier);
};

export const verifyOTP = async (verificationId: string, code: string) => {
  const credential = PhoneAuthProvider.credential(verificationId, code);
  return signInWithCredential(auth, credential);
};

export const signInWithEmail = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signUpWithEmail = async (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const resetPassword = async (email: string) => {
  return sendPasswordResetEmail(auth, email);
};

export const sendEmailLink = async (email: string, actionCodeSettings: any) => {
  return sendSignInLinkToEmail(auth, email, actionCodeSettings);
};

export const checkEmailLink = (emailLink: string): boolean => {
  return isSignInWithEmailLink(auth, emailLink);
};

export const signInWithEmailLink = async (email: string, emailLink: string) => {
  return signInWithEmailLink(auth, email, emailLink);
};

export const signOut = async () => {
  await firebaseSignOut(auth);
  await SecureStore.deleteItemAsync("authToken");
};

export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

export { auth, db };

