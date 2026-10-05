import { initializeApp, setLogLevel } from "firebase/app";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from "firebase/firestore";
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

// Set logging level to silent to suppress internal retry/connection logs from Firebase SDK
try {
  setLogLevel("silent");
} catch (e) {}

// Intercept and silence Firebase connectivity warning & error logs from showing in the console
if (typeof window !== 'undefined' && window.console) {
  const isFirestoreNetworkNoise = (args: any[]) => {
    return args.some(arg => {
      if (typeof arg === 'string') {
        return (
          arg.includes('@firebase/firestore') ||
          arg.includes('Could not reach Cloud Firestore backend') ||
          arg.includes('code=unavailable') ||
          arg.includes('The operation could not be completed') ||
          arg.includes('operate in offline mode')
        );
      }
      if (arg && typeof arg === 'object') {
        const msg = arg.message || arg.stack || '';
        return (
          msg.includes('Could not reach Cloud Firestore backend') ||
          msg.includes('code=unavailable') ||
          msg.includes('The operation could not be completed')
        );
      }
      return false;
    });
  };

  const originalWarn = window.console.warn;
  window.console.warn = function (...args) {
    if (isFirestoreNetworkNoise(args)) return;
    originalWarn.apply(window.console, args);
  };

  const originalError = window.console.error;
  window.console.error = function (...args) {
    if (isFirestoreNetworkNoise(args)) return;
    originalError.apply(window.console, args);
  };

  const originalInfo = window.console.info;
  window.console.info = function (...args) {
    if (isFirestoreNetworkNoise(args)) return;
    originalInfo.apply(window.console, args);
  };
}

export const app = initializeApp(firebaseConfig);

// Initialize Firestore with modern persistent multi-tab cache and force long-polling for reliable connectivity
export const db = initializeFirestore(
  app, 
  {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    }),
    experimentalForceLongPolling: true
  }, 
  firebaseConfig.firestoreDatabaseId || "(default)"
);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { signInWithPopup, signInWithRedirect, signInWithCredential, getRedirectResult, signOut, onAuthStateChanged };
export type { FirebaseUser };
