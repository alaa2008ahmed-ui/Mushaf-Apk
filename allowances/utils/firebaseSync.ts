import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';

export const SETTINGS_COLLECTION = 'app_settings';
export const COMPANY_SETTINGS_DOC = 'company_names';
export const PRINT_TEMPLATES_DOC = 'print_templates';
export const FORMULA_SETTINGS_DOC = 'formula_settings';

export function isFirebaseConfigured(): boolean {
  return !!db;
}

export function subscribeToCompanySettings(onUpdate: (ar: string, en: string) => void): (() => void) | null {
  if (!db) return null;
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, COMPANY_SETTINGS_DOC);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && data.ar && data.en) {
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
  if (!db) return;
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, COMPANY_SETTINGS_DOC);
    await setDoc(docRef, { ar, en, updatedAt: new Date().toISOString() });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${SETTINGS_COLLECTION}/${COMPANY_SETTINGS_DOC}`);
    console.warn("Notice: Could not save company settings to Firestore.", error);
  }
}

export function subscribeToPrintTemplates(onUpdate: (data: Record<string, string>) => void): (() => void) | null {
  if (!db) return null;
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
  if (!db) return;
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, PRINT_TEMPLATES_DOC);
    await setDoc(docRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${SETTINGS_COLLECTION}/${PRINT_TEMPLATES_DOC}`);
    console.warn("Notice: Could not save print templates to Firestore.", error);
  }
}

export function subscribeToFormulaSettings(onUpdate: (data: any) => void): (() => void) | null {
  if (!db) return null;
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
  if (!db) return;
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, FORMULA_SETTINGS_DOC);
    await setDoc(docRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${SETTINGS_COLLECTION}/${FORMULA_SETTINGS_DOC}`);
    console.warn("Notice: Could not save formula settings to Firestore.", error);
  }
}
