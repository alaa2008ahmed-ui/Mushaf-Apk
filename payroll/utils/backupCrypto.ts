import { Employee, Signatures } from '../types';

export interface BackupPayload {
  version: string;
  exportedAt: string;
  sheetTitle: string;
  employees: Employee[];
  signatures: Signatures;
  archives: any[];
}

const SECRET_KEY = "HR_PAYROLL_2026_ENTERPRISE_ALAA_SECURE_KEY";
const HEADER_PREFIX = "HRBAK1_";

/**
 * Obfuscates and encrypts the backup JSON without requiring a user password.
 * Uses UTF-8 byte encoding combined with a cyclic XOR cipher and Base64 transformation.
 */
export const encryptBackupData = (payload: BackupPayload): string => {
  try {
    const jsonStr = JSON.stringify(payload);
    const textEncoder = new TextEncoder();
    const dataBytes = textEncoder.encode(jsonStr);
    const keyBytes = textEncoder.encode(SECRET_KEY);
    
    const encryptedBytes = new Uint8Array(dataBytes.length);
    for (let i = 0; i < dataBytes.length; i++) {
      // XOR with key byte + position offset scrambling
      const keyByte = keyBytes[i % keyBytes.length];
      encryptedBytes[i] = dataBytes[i] ^ keyByte ^ ((i * 7) & 0xFF);
    }

    // Convert Uint8Array to Base64 string
    let binary = '';
    const len = encryptedBytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(encryptedBytes[i]);
    }
    const base64Str = window.btoa(binary);
    
    return HEADER_PREFIX + base64Str;
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error("حدث خطأ أثناء تشفير بيانات النسخة الاحتياطية.");
  }
};

/**
 * Decrypts and decodes the .bak file content back into the BackupPayload object.
 */
export const decryptBackupData = (bakContent: string): BackupPayload => {
  try {
    const trimmed = bakContent.trim();
    if (!trimmed.startsWith(HEADER_PREFIX)) {
      // Check if it's plain JSON (fallback for legacy backups)
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        return JSON.parse(trimmed);
      }
      throw new Error("تنسيق ملف النسخة الاحتياطية غير معروف أو غير مدعوم.");
    }

    const base64Str = trimmed.substring(HEADER_PREFIX.length);
    const binaryStr = window.atob(base64Str);
    const len = binaryStr.length;
    const encryptedBytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      encryptedBytes[i] = binaryStr.charCodeAt(i);
    }

    const textEncoder = new TextEncoder();
    const keyBytes = textEncoder.encode(SECRET_KEY);
    const decryptedBytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      const keyByte = keyBytes[i % keyBytes.length];
      decryptedBytes[i] = encryptedBytes[i] ^ keyByte ^ ((i * 7) & 0xFF);
    }

    const textDecoder = new TextDecoder();
    const jsonStr = textDecoder.decode(decryptedBytes);
    const payload = JSON.parse(jsonStr) as BackupPayload;

    if (!payload.employees || !Array.isArray(payload.employees)) {
      throw new Error("بيانات الموظفين في الملف غير صالحة.");
    }

    return payload;
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("فشل في فك تشفير الملف. قد يكون الملف تالفاً أو ليس ملف .bak صحيح.");
  }
};
