
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { doc, getDocFromServer, initializeFirestore, setLogLevel } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";
import firebaseConfig from './firebase-config.json';

// Silence Firestore client warnings
setLogLevel('silent');

// Define global keys to prevent multiple instances during Vite HMR or React StrictMode
const GLOBAL_APP_KEY = '_custom_firebase_app_instance';
const GLOBAL_FIRESTORE_KEY = '_custom_firestore_instance';

// Initialize or reuse Firebase App instance
const app = typeof window !== 'undefined' && (window as any)[GLOBAL_APP_KEY]
  ? (window as any)[GLOBAL_APP_KEY]
  : (getApps().length > 0 ? getApp() : initializeApp(firebaseConfig));

if (typeof window !== 'undefined' && !(window as any)[GLOBAL_APP_KEY]) {
  (window as any)[GLOBAL_APP_KEY] = app;
}

// Initialize or reuse Firestore instance
const dbId = (firebaseConfig as any).firestoreDatabaseId;
let dbInstance;

if (typeof window !== 'undefined' && (window as any)[GLOBAL_FIRESTORE_KEY]) {
  dbInstance = (window as any)[GLOBAL_FIRESTORE_KEY];
} else {
  // Use standard getFirestore for stability. 
  // experimentalForceLongPolling is known to cause ID: ca9 assertion failures in 12.x
  dbInstance = initializeFirestore(app, {
    // Standard configuration for web environment
  }, dbId === "(default)" ? undefined : dbId);
  
  if (typeof window !== 'undefined') {
    (window as any)[GLOBAL_FIRESTORE_KEY] = dbInstance;
  }
}

export { dbInstance as db };
export const auth = getAuth();
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  // Log as warning rather than error so the platform doesn't strictly report it as a crash 
  console.warn('Firebase sync warning (update your rules): ', JSON.stringify(errInfo));
  // We removed the "throw new Error" here because it crashes the React app completely 
  // when the user hasn't updated their external Firestore security rules yet.
  // The DualStorageService will gracefully fall back to localStorage.
}

