const requiredEnvVars = {
  firebase: {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  },
  google: {
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  },
};

// Validate required environment variables
const validateEnv = () => {
  const missing: string[] = [];
  
  if (!requiredEnvVars.firebase.apiKey) missing.push("EXPO_PUBLIC_FIREBASE_API_KEY");
  if (!requiredEnvVars.firebase.authDomain) missing.push("EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN");
  if (!requiredEnvVars.firebase.projectId) missing.push("EXPO_PUBLIC_FIREBASE_PROJECT_ID");
  if (!requiredEnvVars.firebase.storageBucket) missing.push("EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET");
  if (!requiredEnvVars.firebase.messagingSenderId) missing.push("EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID");
  if (!requiredEnvVars.firebase.appId) missing.push("EXPO_PUBLIC_FIREBASE_APP_ID");
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}\n` +
      "Please ensure all Firebase configuration variables are set in your .env file."
    );
  }
};

// Only validate in non-development or when explicitly required
if (__DEV__) {
  // In development, warn but don't throw
  const missing: string[] = [];
  if (!requiredEnvVars.firebase.apiKey) missing.push("EXPO_PUBLIC_FIREBASE_API_KEY");
  if (!requiredEnvVars.firebase.authDomain) missing.push("EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN");
  if (!requiredEnvVars.firebase.projectId) missing.push("EXPO_PUBLIC_FIREBASE_PROJECT_ID");
  
  if (missing.length > 0) {
    console.warn(
      `⚠️ Missing environment variables: ${missing.join(", ")}\n` +
      "The app may not function correctly without these variables."
    );
  }
} else {
  // In production, validate strictly
  validateEnv();
}

export const ENV = requiredEnvVars as {
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  google: {
    webClientId: string | undefined;
  };
};



