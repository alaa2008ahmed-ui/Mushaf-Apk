import React, { useEffect } from 'react';
import { AppSettings } from '../types';
import { dualStorage } from '../DualStorageService';
import CryptoJS from 'crypto-js';
import LZString from 'lz-string';

interface Props {
    appSettings: AppSettings;
    setNotification: (notif: any) => void;
}

const AutoBackupManager: React.FC<Props> = ({ appSettings, setNotification }) => {
    useEffect(() => {
        if (!appSettings || !appSettings.autoBackupEnabled || !appSettings.autoBackupTime) {
            return;
        }

        const runAutoBackupCheck = async () => {
            try {
                const now = new Date();
                
                const getLocalDateString = (d: Date) => {
                    const yr = d.getFullYear();
                    const mo = d.getMonth() + 1;
                    const dy = d.getDate();
                    return `${yr}-${mo < 10 ? '0' + mo : mo}-${dy < 10 ? '0' + dy : dy}`;
                };

                const todayStr = getLocalDateString(now);
                const currentHour = now.getHours();
                const currentMin = now.getMinutes();
                const currentMinutes = currentHour * 60 + currentMin;

                const [targetHour, targetMin] = appSettings.autoBackupTime!.split(':').map(Number);
                const targetMinutes = targetHour * 60 + targetMin;

                // 1. Check Run Time
                if (currentMinutes < targetMinutes) {
                    return;
                }

                // 2. Frequency Match Check
                let frequencyMatch = false;
                const freq = appSettings.autoBackupFrequency || 'daily';

                if (freq === 'daily') {
                    frequencyMatch = true;
                } else if (freq === 'weekly') {
                    const currentDayOfWeek = now.getDay(); 
                    const targetDayOfWeek = appSettings.autoBackupDayOfWeek !== undefined ? Number(appSettings.autoBackupDayOfWeek) : 5; 
                    if (currentDayOfWeek === targetDayOfWeek) {
                        frequencyMatch = true;
                    }
                } else if (freq === 'monthly') {
                    const currentDayOfMonth = now.getDate(); 
                    const targetDayOfMonth = appSettings.autoBackupDayOfMonth !== undefined ? Number(appSettings.autoBackupDayOfMonth) : 1; 
                    if (currentDayOfMonth === targetDayOfMonth) {
                        frequencyMatch = true;
                    }
                }

                if (!frequencyMatch) {
                    return;
                }

                // 3. Prevent duplicate backup on the same day
                const localLastBackup = localStorage.getItem('localLastTriggeredBackupDate');
                if (localLastBackup === todayStr) {
                    return;
                }

                // Log triggered date locally before async operation to prevent double triggering
                localStorage.setItem('localLastTriggeredBackupDate', todayStr);

                // Export all databases
                const dataToBackup = dualStorage.exportAllData();
                const jsonString = JSON.stringify(dataToBackup);
                
                // Compress using LZ-String
                const compressed = LZString.compressToBase64(jsonString);
                
                const backupPass = 'swc_backup_secure_key_123';
                // Encrypt the compressed string
                const encrypted = CryptoJS.AES.encrypt(compressed, backupPass).toString();
                
                // Generate recovery code (Base64 obfuscated password)
                const recoveryCode = btoa(unescape(encodeURIComponent(backupPass)));

                // Wrap in structure with compression metadata and recovery code
                const finalPayload = JSON.stringify({
                    version: '2.5',
                    isEncrypted: true,
                    isCompressed: true,
                    compressionAlgo: 'lz-string',
                    recoveryCode: recoveryCode,
                    payload: encrypted
                });

                const blob = new Blob([finalPayload], { type: 'application/json' });
                
                // Create object URL and download
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                const filename = `swc-system-backup-auto-${todayStr}.json`;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                setNotification({ 
                    message: `Auto Backup completed and downloaded: ${filename}`, 
                    type: 'success' 
                });
                console.log(`Auto Backup triggered and downloaded successfully: ${filename}`);
            } catch (error) {
                console.error("Auto Backup check failed:", error);
                localStorage.removeItem('localLastTriggeredBackupDate');
            }
        };

        // Run check immediately on load
        runAutoBackupCheck();

        // Start interval of 60 seconds
        const backupInterval = setInterval(runAutoBackupCheck, 60000);

        return () => {
            clearInterval(backupInterval);
        };
    }, [appSettings, setNotification]);

    return null;
};

export default AutoBackupManager;
