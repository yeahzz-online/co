import { getAnalytics, type Analytics } from "firebase/analytics";
import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";

export const firebaseConfig = {
  apiKey: import.meta.env["VITE_FIREBASE_API_KEY"],
  authDomain: import.meta.env["VITE_FIREBASE_AUTH_DOMAIN"],
  projectId: import.meta.env["VITE_FIREBASE_PROJECT_ID"],
  storageBucket: import.meta.env["VITE_FIREBASE_STORAGE_BUCKET"],
  messagingSenderId: import.meta.env["VITE_FIREBASE_MESSAGING_SENDER_ID"],
  appId: import.meta.env["VITE_FIREBASE_APP_ID"],
  measurementId: import.meta.env["VITE_FIREBASE_MEASUREMENT_ID"],
};

const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId,
);

export const firebaseApp: FirebaseApp | undefined = hasFirebaseConfig
  ? getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig)
  : undefined;

export function requireFirebaseApp() {
  if (!firebaseApp) {
    throw new Error("Firebase is not configured. Add the VITE_FIREBASE_* variables to your environment.");
  }
  return firebaseApp;
}

// Analytics requires browser APIs, so keep it out of the server-rendering path.
export const analytics: Analytics | undefined =
  typeof window === "undefined" || !firebaseApp || !firebaseConfig.measurementId
    ? undefined
    : getAnalytics(firebaseApp);
