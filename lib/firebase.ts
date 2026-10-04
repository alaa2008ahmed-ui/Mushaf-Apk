import { initializeApp, setLogLevel } from "firebase/app";
import { initializeFirestore, enableMultiTabIndexedDbPersistence } from "firebase/firestore";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  signInWithCredential,
  getRedirectResult,
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import firebaseConfig from "../firebase-applet-config.json";

// Set logging level to error to hide verbose connection status warnings in the console
try {
  setLogLevel("error");
} catch (e) {}

// Intercept and silence Firebase connectivity warning logs from showing in the console
if (typeof window !== 'undefined' && window.console) {
  const originalWarn = window.console.warn;
  window.console.warn = function (...args) {
    const msg = args[0];
    if (
      typeof msg === 'string' &&
      (msg.includes('@firebase/firestore') ||
       msg.includes('Could not reach Cloud Firestore backend'))
    ) {
      return;
    }
    originalWarn.apply(window.console, args);
  };
}

export const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
}, firebaseConfig.firestoreDatabaseId || "(default)");

// Enable robust offline persistence for local caching
try {
  enableMultiTabIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn("Multiple tabs open, persistence enabled in first tab only.");
    } else if (err.code === 'unimplemented') {
      console.warn("The current browser does not support all of the features required to enable persistence.");
    }
  });
} catch (e) {}

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { signInWithPopup, signInWithRedirect, signInWithCredential, getRedirectResult, signOut, onAuthStateChanged };
export type { FirebaseUser };
