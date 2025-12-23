import { ENV } from "@/constants/env";

export const firebaseConfig = {
  apiKey: ENV.firebase.apiKey || "demo-api-key",
  authDomain: ENV.firebase.authDomain || "demo-project.firebaseapp.com",
  projectId: ENV.firebase.projectId || "demo-project",
  storageBucket: ENV.firebase.storageBucket || "demo-project.appspot.com",
  messagingSenderId: ENV.firebase.messagingSenderId || "123456789",
  appId: ENV.firebase.appId || "1:123456789:web:abcdef",
};