import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Employee, ArchivedRecord } from './types';

const serverFirebaseConfig = {
  apiKey: "AIzaSyAxpAbPXmNv165CCykK_7-QTx9bbTQrYXE",
  authDomain: "allowances-for-employees.firebaseapp.com",
  projectId: "allowances-for-employees",
  storageBucket: "allowances-for-employees.firebasestorage.app",
  messagingSenderId: "642879169489",
  appId: "1:642879169489:web:cb9032f528f18e84e4f6f0"
};

export function isFirebaseConfigured(): boolean {
  return Boolean(
    serverFirebaseConfig.apiKey &&
    serverFirebaseConfig.projectId
  );
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || serverFirebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || serverFirebaseConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || serverFirebaseConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || serverFirebaseConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || serverFirebaseConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || serverFirebaseConfig.appId
};

const app = isFirebaseConfigured() 
  ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0])
  : null;

export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;

// Data access methods
export const EMPLOYEES_COLLECTION = 'employees';

export function subscribeToEmployees(onUpdate: (employees: Employee[]) => void, onError?: (err: any) => void): (() => void) | null {
  if (!isFirebaseConfigured() || !db) {
    return null;
  }
  try {
    const unsubscribe = onSnapshot(collection(db, EMPLOYEES_COLLECTION), (snapshot) => {
      const employees: Employee[] = [];
      snapshot.forEach((docSnap) => {
        employees.push(docSnap.data() as Employee);
      });
      onUpdate(employees);
    }, (error) => {
      console.warn("Notice: Real-time listener disconnected or failed.", error);
      if (onError) onError(error);
    });
    return unsubscribe;
  } catch (error) {
    console.warn("Notice: Could not start Firestore real-time listener.", error);
    return null;
  }
}

export async function fetchEmployeesFromFirestore(): Promise<Employee[] | null> {
  if (!isFirebaseConfigured() || !db) {
    return null;
  }
  try {
    const querySnapshot = await getDocs(collection(db, EMPLOYEES_COLLECTION));
    const employees: Employee[] = [];
    querySnapshot.forEach((docSnap) => {
      employees.push(docSnap.data() as Employee);
    });
    return employees;
  } catch (error) {
    console.warn("Notice: Operating in offline mode or Firestore connection unavailable.", error);
    return null;
  }
}

function cleanForFirestore<T>(data: T): T {
  if (data === undefined || data === null) return data;
  return JSON.parse(JSON.stringify(data));
}

export async function saveEmployeeToFirestore(employee: Employee): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    return;
  }
  try {
    const docRef = doc(db, EMPLOYEES_COLLECTION, employee.id);
    await setDoc(docRef, cleanForFirestore(employee));
  } catch (error) {
    console.warn("Notice: Could not save to Firestore (offline or unavailable).", error);
  }
}

export async function deleteEmployeeFromFirestore(id: string): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    return;
  }
  try {
    const docRef = doc(db, EMPLOYEES_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn("Notice: Could not delete from Firestore (offline or unavailable).", error);
  }
}

export const ARCHIVED_RECORDS_COLLECTION = 'archived_records';

export function subscribeToArchivedRecords(onUpdate: (records: ArchivedRecord[]) => void): (() => void) | null {
  if (!isFirebaseConfigured() || !db) {
    return null;
  }
  try {
    const unsubscribe = onSnapshot(collection(db, ARCHIVED_RECORDS_COLLECTION), (snapshot) => {
      const records: ArchivedRecord[] = [];
      snapshot.forEach((docSnap) => {
        records.push(docSnap.data() as ArchivedRecord);
      });
      onUpdate(records);
    }, (error) => {
      console.warn("Notice: Archived records real-time listener failed.", error);
    });
    return unsubscribe;
  } catch (error) {
    return null;
  }
}

export async function saveArchivedRecordToFirestore(record: ArchivedRecord): Promise<void> {
  if (!isFirebaseConfigured() || !db) return;
  try {
    const docRef = doc(db, ARCHIVED_RECORDS_COLLECTION, record.id);
    await setDoc(docRef, cleanForFirestore(record));
  } catch (error) {
    console.warn("Notice: Could not save archived record to Firestore.", error);
  }
}

export async function deleteArchivedRecordFromFirestore(id: string): Promise<void> {
  if (!isFirebaseConfigured() || !db) return;
  try {
    const docRef = doc(db, ARCHIVED_RECORDS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn("Notice: Could not delete archived record from Firestore.", error);
  }
}

export const SETTINGS_COLLECTION = 'app_settings';
export const COMPANY_SETTINGS_DOC = 'company_names';

export function subscribeToCompanySettings(onUpdate: (ar: string, en: string) => void): (() => void) | null {
  if (!isFirebaseConfigured() || !db) return null;
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, COMPANY_SETTINGS_DOC);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.ar && data.en) {
          onUpdate(data.ar, data.en);
        }
      }
    }, (error) => {
      console.warn("Notice: Company settings listener failed.", error);
    });
  } catch (error) {
    return null;
  }
}

export async function saveCompanySettingsToFirestore(ar: string, en: string): Promise<void> {
  if (!isFirebaseConfigured() || !db) return;
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, COMPANY_SETTINGS_DOC);
    await setDoc(docRef, { ar, en, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.warn("Notice: Could not save company settings to Firestore.", error);
  }
}

export const PRINT_TEMPLATES_DOC = 'print_templates';

export function subscribeToPrintTemplates(onUpdate: (data: Record<string, string>) => void): (() => void) | null {
  if (!isFirebaseConfigured() || !db) return null;
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, PRINT_TEMPLATES_DOC);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data) {
          onUpdate(data as Record<string, string>);
        }
      }
    }, (error) => {
      console.warn("Notice: Print templates listener failed.", error);
    });
  } catch (error) {
    return null;
  }
}

export async function savePrintTemplatesToFirestore(data: Record<string, string>): Promise<void> {
  if (!isFirebaseConfigured() || !db) return;
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, PRINT_TEMPLATES_DOC);
    await setDoc(docRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    console.warn("Notice: Could not save print templates to Firestore.", error);
  }
}

export const FORMULA_SETTINGS_DOC = 'formula_settings';

export function subscribeToFormulaSettings(onUpdate: (data: any) => void): (() => void) | null {
  if (!isFirebaseConfigured() || !db) return null;
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, FORMULA_SETTINGS_DOC);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data) {
          onUpdate(data);
        }
      }
    }, (error) => {
      console.warn("Notice: Formula settings listener failed.", error);
    });
  } catch (error) {
    return null;
  }
}

export async function saveFormulaSettingsToFirestore(data: any): Promise<void> {
  if (!isFirebaseConfigured() || !db) return;
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, FORMULA_SETTINGS_DOC);
    await setDoc(docRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    console.warn("Notice: Could not save formula settings to Firestore.", error);
  }
}



