import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const requirePublicEnv = (key: string, value: string | undefined) => {
  if (!value) {
    throw new Error(`Missing Firebase environment variable: ${key}`);
  }
  return value;
};

const firebaseConfig = {
  apiKey: requirePublicEnv(
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  ),
  authDomain: requirePublicEnv(
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  ),
  projectId: requirePublicEnv(
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  ),
  storageBucket: requirePublicEnv(
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  ),
  messagingSenderId: requirePublicEnv(
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  ),
  appId: requirePublicEnv(
    "NEXT_PUBLIC_FIREBASE_APP_ID",
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  ),
};

/**
 * Firebase client initialization and export of service instances.
 * Configured using required public Firebase environment variables.
 */
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
