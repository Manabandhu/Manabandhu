import { ENV } from "@/constants/env";

// Validate that required Firebase config values exist
if (!ENV.firebase.apiKey || !ENV.firebase.authDomain || !ENV.firebase.projectId) {
  throw new Error(
    "Firebase configuration is incomplete. Please check your environment variables."
  );
}

export const firebaseConfig = {
  apiKey: ENV.firebase.apiKey,
  authDomain: ENV.firebase.authDomain,
  projectId: ENV.firebase.projectId,
  storageBucket: ENV.firebase.storageBucket,
  messagingSenderId: ENV.firebase.messagingSenderId,
  appId: ENV.firebase.appId,
};