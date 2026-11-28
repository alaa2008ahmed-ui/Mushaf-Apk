import { useState, useEffect, useCallback, useRef } from 'react';
import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import { App } from '@capacitor/app';
import { prayerNamesAr } from '../data/prayerAndApp/prayerTimesData';
import { checkSupportsDST } from '../utils/prayerAndWorship/prayerTimesUtils';
import { PRAYER_NAMES_EN } from '../utils/prayerAndWorship/prayerTimesTranslations';
import {
    manualRestoreDeviceSound,
    getNativeSilentStatus,
    addNativeSilentStateListener,
    SilentStatus
} from '../utils/notifications/silentMode';
import { PrayerConfig, getEffectiveIqamaMinutes } from '../services/prayer/prayerTypesAndConfig';

export const usePrayerAutoSilent = (
    config: PrayerConfig,
    times: Record<string, string>,
    isEn: boolean
) => {
    const [isPrayerSilentActive, setIsPrayerSilentActive] = useState(false);
    const [activeSilentPrayerName, setActiveSilentPrayerName] = useState('');
    const activeSilentWindowRef = useRef<{ startMillis: number; windowId: number; prayerKey: string } | null>(null);
    const manuallyRestoredWindowsRef = useRef<Set<number>>(new Set());

    // Hydrate manually restored silent windows
    useEffect(() => {
        try {
            const raw = localStorage.getItem('manuallyRestoredSilentWindows_v1');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
                    const valid = parsed.filter(ts => typeof ts === 'number' && ts > cutoff);
                    manuallyRestoredWindowsRef.current = new Set(valid);
                    if (valid.length !== parsed.length) {
                        localStorage.setItem('manuallyRestoredSilentWindows_v1', JSON.stringify(valid));
                    }
                }
            }
        } catch (e) {}
    }, []);

    const markWindowManuallyRestored = useCallback((startMillis?: number | null) => {
        if (!startMillis || startMillis <= 0) return;
        manuallyRestoredWindowsRef.current.add(startMillis);
        try {
            const cutoff = Date.now() - 24 * 60 * 60 * 1000;
            const filtered = Array.from(manuallyRestoredWindowsRef.current).filter(ts => ts > cutoff);
            manuallyRestoredWindowsRef.current = new Set(filtered);
            localStorage.setItem('manuallyRestoredSilentWindows_v1', JSON.stringify(filtered));
        } catch (e) {}
    }, []);

    const isWindowManuallyRestored = useCallback((startMillis?: number | null) => {
        if (!startMillis || startMillis <= 0) return false;
        return manuallyRestoredWindowsRef.current.has(startMillis);
    }, []);

    // Synchronize in-app Auto-Silent banner with real device state (Android) or non-restored window (Web)
    useEffect(() => {
        const isAndroidNative = Capacitor.getPlatform() === 'android';

        if (isAndroidNative) {
            let mounted = true;
            let stateListenerHandle: PluginListenerHandle | null = null;
            let appStateHandle: PluginListenerHandle | null = null;

            const applyNativeStatus = (status: SilentStatus | null) => {
                if (!mounted) return;
                if (!status) {
                    activeSilentWindowRef.current = null;
                    setIsPrayerSilentActive(false);
                    setActiveSilentPrayerName('');
                    return;
                }

                const now = Date.now();
                const isRestoredInJs = status.activeStartMillis > 0 && isWindowManuallyRestored(status.activeStartMillis);
                const isValidActive =
                    !!status.isSilentActive &&
                    !status.manuallyRestored &&
                    !!status.isDeviceMuted &&
                    !isRestoredInJs &&
                    (status.activeEndMillis <= 0 || now < status.activeEndMillis);

                if (status.manuallyRestored && status.restoredWindowStartMillis > 0) {
                    markWindowManuallyRestored(status.restoredWindowStartMillis);
                }

                if (isValidActive) {
                    activeSilentWindowRef.current = {
                        startMillis: status.activeStartMillis,
                        windowId: status.activeWindowId,
                        prayerKey: status.activePrayerKey
                    };
                    setIsPrayerSilentActive(true);
                    setActiveSilentPrayerName(status.activePrayerName || status.activePrayerKey || '');
                } else {
                    activeSilentWindowRef.current = null;
                    setIsPrayerSilentActive(false);
                    setActiveSilentPrayerName('');
                }
            };

            const syncFromNative = async () => {
                const status = await getNativeSilentStatus();
                applyNativeStatus(status);
            };

            syncFromNative();

            addNativeSilentStateListener(status => {
                applyNativeStatus(status);
            })
                .then(handle => {
                    if (mounted) {
                        stateListenerHandle = handle;
                    } else {
                        handle?.remove();
                    }
                })
                .catch(() => {});

            App.addListener('appStateChange', ({ isActive }) => {
                if (isActive && mounted) {
                    syncFromNative();
                }
            })
                .then(handle => {
                    if (mounted) {
                        appStateHandle = handle;
                    } else {
                        handle?.remove();
                    }
                })
                .catch(() => {});

            const pollInterval = setInterval(syncFromNative, 5000);

            return () => {
                mounted = false;
                clearInterval(pollInterval);
                stateListenerHandle?.remove();
                appStateHandle?.remove();
            };
        }

        // Web / non-Android fallback
        if (!times || Object.keys(times).length === 0) {
            setIsPrayerSilentActive(false);
            setActiveSilentPrayerName('');
            return;
        }

        const checkSilentStatusWeb = () => {
            const now = new Date();
            const nowMs = now.getTime();
            const prayerKeys = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
            let foundActive = false;
            let activeName = '';
            let foundWindow: { startMillis: number; windowId: number; prayerKey: string } | null = null;

            for (const key of prayerKeys) {
                if (config.mutedPrayers?.[key]) continue;

                let isSilentEnabled = false;
                let duration = 15;

                if (config.prayerAutoSilent?.[key] !== undefined) {
                    isSilentEnabled = !!config.prayerAutoSilent[key].enabled;
                    duration = config.prayerAutoSilent[key].duration || 15;
                } else if (config.autoSilent) {
                    isSilentEnabled = true;
                    duration = config.autoSilentDuration || 15;
                }

                if (!isSilentEnabled) continue;

                const timeStr = times[key];
                if (!timeStr || timeStr.includes('--')) continue;

                const [h, m] = timeStr.split(':').map(Number);
                const supportsDST = checkSupportsDST(config.location?.combinedCode, config.location?.fullCountry);
                const totalOffset = (config.prayerOffsets[key] || 0) + (config.isSummerTime && supportsDST ? 60 : 0);

                const prayerDate = new Date(now);
                prayerDate.setHours(h, m, 0, 0);
                prayerDate.setMinutes(prayerDate.getMinutes() + totalOffset);

                const iqamaOffset = getEffectiveIqamaMinutes(config, key);
                const silentStartMs = prayerDate.getTime() + iqamaOffset * 60000 + 10000;
                const silentEndMs = silentStartMs + duration * 60000;

                if (nowMs >= silentStartMs && nowMs < silentEndMs) {
                    if (!isWindowManuallyRestored(silentStartMs)) {
                        foundActive = true;
                        activeName = isEn ? (PRAYER_NAMES_EN[key] || key) : (prayerNamesAr[key] || key);
                        foundWindow = { startMillis: silentStartMs, windowId: 0, prayerKey: key };
                    }
                    break;
                }
            }

            activeSilentWindowRef.current = foundWindow;
            setIsPrayerSilentActive(foundActive);
            setActiveSilentPrayerName(activeName);
        };

        checkSilentStatusWeb();
        const interval = setInterval(checkSilentStatusWeb, 5000);
        return () => clearInterval(interval);
    }, [
        config.autoSilent,
        config.autoSilentDuration,
        config.prayerAutoSilent,
        config.mutedPrayers,
        config.iqamaOffsets,
        config.iqamaReminder,
        times,
        config.prayerOffsets,
        config.isSummerTime,
        config.location,
        isEn,
        isWindowManuallyRestored,
        markWindowManuallyRestored
    ]);

    const manuallyRestoreSilent = useCallback(async () => {
        const currentWindow = activeSilentWindowRef.current;
        if (currentWindow?.startMillis) {
            markWindowManuallyRestored(currentWindow.startMillis);
        } else if (times && Object.keys(times).length > 0) {
            const nowMs = Date.now();
            const nowDate = new Date();
            const supportsDST = checkSupportsDST(config.location?.combinedCode, config.location?.fullCountry);
            for (const key of ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']) {
                const timeStr = times[key];
                if (!timeStr || timeStr.includes('--')) continue;
                const [h, m] = timeStr.split(':').map(Number);
                const totalOffset = (config.prayerOffsets[key] || 0) + (config.isSummerTime && supportsDST ? 60 : 0);
                const pDate = new Date(nowDate);
                pDate.setHours(h, m, 0, 0);
                pDate.setMinutes(pDate.getMinutes() + totalOffset);
                const iqamaOffset = getEffectiveIqamaMinutes(config, key);
                const duration = config.prayerAutoSilent?.[key]?.duration || config.autoSilentDuration || 15;
                const startMs = pDate.getTime() + iqamaOffset * 60000 + 10000;
                const endMs = startMs + duration * 60000;
                if (nowMs >= startMs && nowMs < endMs) {
                    markWindowManuallyRestored(startMs);
                }
            }
        }

        activeSilentWindowRef.current = null;
        setIsPrayerSilentActive(false);
        setActiveSilentPrayerName('');
        await manualRestoreDeviceSound(
            currentWindow ? { startMillis: currentWindow.startMillis, windowId: currentWindow.windowId } : undefined
        );
    }, [times, config, markWindowManuallyRestored]);

    return {
        isPrayerSilentActive,
        activeSilentPrayerName,
        isWindowManuallyRestored,
        manuallyRestoreSilent
    };
};
