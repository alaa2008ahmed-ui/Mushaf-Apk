import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, ReactNode } from 'react';
import { CALCULATION_METHOD_OPTIONS, ASR_MADHAB_OPTIONS, HIGH_LATITUDE_RULE_OPTIONS } from '../data/prayerAndApp/prayerTimesData';
import {
    stopNotificationSound,
    setActiveNotificationTone,
    setStoredAlertVolume
} from '../utils/prayerAndWorship/prayerTimesUtils';
import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext';
import { LocationSearchSuggestion } from '../services/locationSearchService';
import { usePrayerAutoSilent } from '../hooks/usePrayerAutoSilent';
import {
    SunriseAlertsConfig,
    DEFAULT_SUNRISE_ALERTS,
    PrayerConfig,
    PrayerLocation,
    RESET_PRAYER_OFFSETS,
    loadInitialPrayerConfig,
    getEffectiveIqamaMinutes,
    isPrayerIqamaEnabled
} from '../services/prayer/prayerTypesAndConfig';
import {
    getCalculationParams,
    computeTimesSync,
    fetchAladhanTimesOnline,
    getCityCurrentTime,
    findNextPrayer
} from '../services/prayer/prayerCalculationService';
import {
    refreshDeviceLocation,
    searchLocationByQuery,
    buildLocationFromSuggestion
} from '../services/prayer/prayerLocationService';
import {
    scheduleAllPrayerNotifications,
    copyAssetToDevice
} from '../services/prayer/prayerNotificationScheduler';
import { syncPrayerWidget } from '../services/prayer/prayerWidgetService';
import { evaluateForegroundPrayerAlerts } from '../services/prayer/prayerForegroundAlertEngine';
import { NOTIFICATION_LOCK_LANG_CHANGE_EVENT } from '../utils/notifications/appNotificationSettings';

// Re-export public types and helpers for backwards compatibility across all consumers
export type { SunriseAlertsConfig, PrayerConfig, PrayerLocation };
export {
    DEFAULT_SUNRISE_ALERTS,
    getEffectiveIqamaMinutes,
    isPrayerIqamaEnabled,
    getCalculationParams,
    computeTimesSync,
    copyAssetToDevice
};

export interface PrayerTimesContextType {
    times: Record<string, string>;
    dates: { hijri: string; gregorian: string };
    nextPrayer: { key: string; date: Date; name: string } | null;
    config: PrayerConfig;
    setConfig: React.Dispatch<React.SetStateAction<PrayerConfig>>;
    refreshLocation: (isManualUserAction?: boolean) => Promise<void>;
    manualSearch: (query: string) => Promise<void>;
    selectLocation: (suggestion: LocationSearchSuggestion) => void;
    updateConfig: (newConfig: Partial<PrayerConfig>) => void;
    alertVolume: number;
    setAlertVolume: (vol: number) => void;
    isPrayerSilentActive?: boolean;
    activeSilentPrayerName?: string;
    activeIqamaAlert?: { prayerKey: string; prayerName: string; minutes: number; timeStr: string } | null;
    dismissIqamaAlert?: () => void;
    activeAdhanAlert?: { prayerKey: string; prayerName: string; timeStr: string; soundFileName?: string } | null;
    dismissAdhanAlert?: () => void;
    activeCalculationMethodName?: string;
    activeAsrMadhabName?: string;
    activeHighLatRuleName?: string;
    manuallyRestoreSilent?: () => Promise<void>;
}

const PrayerTimesContext = createContext<PrayerTimesContextType | undefined>(undefined);
const PrayerCountdownContext = createContext<string>('00:00:00');

export const PrayerTimesProvider = ({ children }: { children: ReactNode }) => {
    const [config, setConfig] = useState<PrayerConfig>(loadInitialPrayerConfig);
    const { themeKey } = useTheme();
    const { language } = useLanguage();
    const isEn = language === 'en';

    const [times, setTimes] = useState<Record<string, string>>({});
    const [dates, setDates] = useState({ hijri: '-- -- --', gregorian: '-- -- --' });
    const [nextPrayer, setNextPrayer] = useState<{ key: string; date: Date; name: string } | null>(null);
    const [countdown, setCountdown] = useState('00:00:00');
    const countdownRef = useRef('00:00:00');

    const [activeIqamaAlert, setActiveIqamaAlert] = useState<{
        prayerKey: string;
        prayerName: string;
        minutes: number;
        timeStr: string;
    } | null>(null);
    const dismissIqamaAlert = useCallback(() => {
        stopNotificationSound();
        setActiveIqamaAlert(null);
    }, []);

    const [activeAdhanAlert, setActiveAdhanAlert] = useState<{
        prayerKey: string;
        prayerName: string;
        timeStr: string;
        soundFileName?: string;
    } | null>(null);
    const dismissAdhanAlert = useCallback(() => {
        stopNotificationSound();
        setActiveAdhanAlert(null);
    }, []);

    const triggeredAlertsRef = useRef<Set<string>>(new Set());

    // Auto-Silent state, native listeners, and manual restore
    const {
        isPrayerSilentActive,
        activeSilentPrayerName,
        isWindowManuallyRestored,
        manuallyRestoreSilent
    } = usePrayerAutoSilent(config, times, isEn);

    // Persist config changes
    useEffect(() => {
        try {
            localStorage.setItem('prayerFinal_v34', JSON.stringify(config));
        } catch (e) {}
    }, [config]);

    // Calculate prayer times locally (0ms) then refine via AlAdhan API if online
    const fetchTimesForLocation = useCallback(
        async (locationData: any) => {
            if (!locationData) return;
            try {
                const date = new Date();

                const localResult = computeTimesSync(locationData, date, isEn, config);
                if (localResult) {
                    setTimes(localResult.timings);
                    setDates(localResult.dates);
                    localStorage.setItem('grandPrayersCache', JSON.stringify(localResult));
                }

                try {
                    const onlineResult = await fetchAladhanTimesOnline(locationData, date, isEn, config);
                    if (onlineResult) {
                        setTimes(onlineResult.timings);
                        setDates(onlineResult.dates);
                        localStorage.setItem(
                            'grandPrayersCache',
                            JSON.stringify({ timings: onlineResult.timings, dates: onlineResult.dates })
                        );
                        if (onlineResult.timezone) {
                            localStorage.setItem('grandLocationTimezone', onlineResult.timezone);
                        }
                    }
                } catch (apiErr) {
                    // AlAdhan API failed or offline: local times already computed and rendered in 0ms!
                }
            } catch (e) {
                console.error('Failed to calculate prayer times:', e);
            }
        },
        [isEn, config]
    );

    // Re-calculate times when coordinates OR calculation settings change
    const prevCalculationRef = useRef({
        lat: config.location?.lat,
        lng: config.location?.lng,
        method: config.calculationMethod,
        madhab: config.asrMadhab,
        highLat: config.highLatitudeRule
    });

    useEffect(() => {
        if (!config.location) return;
        const prev = prevCalculationRef.current;
        const coordsChanged = prev.lat !== config.location.lat || prev.lng !== config.location.lng;
        const methodChanged = prev.method !== config.calculationMethod;
        const madhabChanged = prev.madhab !== config.asrMadhab;
        const highLatChanged = prev.highLat !== config.highLatitudeRule;

        if (coordsChanged || methodChanged || madhabChanged || highLatChanged) {
            prevCalculationRef.current = {
                lat: config.location.lat,
                lng: config.location.lng,
                method: config.calculationMethod,
                madhab: config.asrMadhab,
                highLat: config.highLatitudeRule
            };
            fetchTimesForLocation(config.location);
        }
    }, [config.location, config.calculationMethod, config.asrMadhab, config.highLatitudeRule, fetchTimesForLocation]);

    const refreshLocation = useCallback(
        async (isManualUserAction: boolean = false) => {
            return refreshDeviceLocation({
                isEn,
                isManualUserAction,
                onImmediateTimes: immediateTimes => {
                    setTimes(immediateTimes.timings);
                    setDates(immediateTimes.dates);
                    localStorage.setItem('grandPrayersCache', JSON.stringify(immediateTimes));
                },
                onLocationResolved: (newLoc, resetOffsets) => {
                    setConfig(prev => ({
                        ...prev,
                        location: newLoc,
                        ...(resetOffsets ? { prayerOffsets: RESET_PRAYER_OFFSETS } : {})
                    }));
                },
                onResetOffsetsOnly: () => {
                    setConfig(prev => ({ ...prev, prayerOffsets: RESET_PRAYER_OFFSETS }));
                }
            });
        },
        [isEn]
    );

    const manualSearch = useCallback(
        async (query: string) => {
            const newLocation = await searchLocationByQuery(query, isEn);
            if (!newLocation) return;
            setConfig(prev => ({
                ...prev,
                location: newLocation,
                prayerOffsets: RESET_PRAYER_OFFSETS
            }));
        },
        [isEn]
    );

    const selectLocation = useCallback(
        (suggestion: LocationSearchSuggestion) => {
            if (!suggestion) return;
            const newLocation = buildLocationFromSuggestion(suggestion, isEn);
            setConfig(prev => ({
                ...prev,
                location: newLocation,
                prayerOffsets: RESET_PRAYER_OFFSETS
            }));
        },
        [isEn]
    );

    const updateConfig = useCallback((newConfig: Partial<PrayerConfig>) => {
        if (newConfig.mutedPrayers) {
            for (const [key, isMuted] of Object.entries(newConfig.mutedPrayers)) {
                if (isMuted) {
                    stopNotificationSound();
                    setActiveAdhanAlert(prev => (prev?.prayerKey === key ? null : prev));
                    setActiveIqamaAlert(prev => (prev?.prayerKey === key ? null : prev));
                }
            }
        }
        if (newConfig.notificationTone) {
            setActiveNotificationTone(newConfig.notificationTone as any);
        }
        if (typeof newConfig.alertVolume === 'number') {
            setStoredAlertVolume(newConfig.alertVolume);
        }
        setConfig(prev => {
            const updated = { ...prev, ...newConfig };
            try {
                localStorage.setItem('prayerFinal_v34', JSON.stringify(updated));
                if (newConfig.sunriseAlerts) {
                    localStorage.setItem('sunrise_alerts_settings_v1', JSON.stringify(updated.sunriseAlerts));
                }
            } catch (e) {}
            return updated;
        });
    }, []);

    // Notification & Auto-Silent Scheduling
    const scheduleNotifications = useCallback(async () => {
        await scheduleAllPrayerNotifications(config, isEn);
    }, [config, isEn]);

    useEffect(() => {
        const timerId = setTimeout(() => {
            scheduleNotifications();
        }, 120);

        const handleReschedule = () => {
            scheduleNotifications();
        };
        window.addEventListener('notification-permission-resolved', handleReschedule);
        window.addEventListener(NOTIFICATION_LOCK_LANG_CHANGE_EVENT, handleReschedule);
        return () => {
            clearTimeout(timerId);
            window.removeEventListener('notification-permission-resolved', handleReschedule);
            window.removeEventListener(NOTIFICATION_LOCK_LANG_CHANGE_EVENT, handleReschedule);
        };
    }, [scheduleNotifications]);

    const updateWidget = useCallback(
        (
            currentTimes: Record<string, string>,
            currentDates: { hijri: string; gregorian: string },
            currentNext: any,
            currentCountdown: string
        ) => {
            syncPrayerWidget({
                currentTimes,
                currentDates,
                currentNext,
                currentCountdown,
                config,
                isEn,
                themeKey
            });
        },
        [config.location, config.prayerOffsets, config.isSummerTime, config.syncWidgetTheme, isEn, themeKey]
    );

    useEffect(() => {
        const handleWidgetSettingsChanged = () => {
            if (times && dates && nextPrayer) {
                updateWidget(times, dates, nextPrayer, countdownRef.current);
            }
        };
        window.addEventListener('widget-settings-changed', handleWidgetSettingsChanged);
        return () => window.removeEventListener('widget-settings-changed', handleWidgetSettingsChanged);
    }, [times, dates, nextPrayer, updateWidget]);

    // Next Prayer Countdown & Live Foreground Alert Engine
    useEffect(() => {
        let lastWidgetUpdateMinute = -1;

        const timer = setInterval(() => {
            const next = findNextPrayer(times, config, isEn);
            setNextPrayer(prev => {
                if (!next && !prev) return prev;
                if (
                    next &&
                    prev &&
                    prev.key === next.key &&
                    prev.name === next.name &&
                    prev.date.getTime() === next.date.getTime()
                ) {
                    return prev;
                }
                return next ? { key: next.key, date: next.date, name: next.name } : null;
            });

            const now = getCityCurrentTime();

            if (next && next.cityNow) {
                const diff = next.date.getTime() - next.cityNow.getTime();
                if (diff > 0) {
                    const h = Math.floor(diff / 3600000);
                    const m = Math.floor((diff % 3600000) / 60000);
                    const s = Math.floor((diff % 60000) / 1000);
                    const countdownStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                    countdownRef.current = countdownStr;
                    setCountdown(prev => (prev === countdownStr ? prev : countdownStr));

                    if (m !== lastWidgetUpdateMinute) {
                        lastWidgetUpdateMinute = m;
                        updateWidget(times, dates, next, countdownStr);
                    }
                } else {
                    countdownRef.current = '00:00:00';
                    setCountdown(prev => (prev === '00:00:00' ? prev : '00:00:00'));
                }
            }

            evaluateForegroundPrayerAlerts({
                now,
                times,
                config,
                isEn,
                triggeredAlerts: triggeredAlertsRef.current,
                isWindowManuallyRestored,
                onTriggerAdhanAlert: setActiveAdhanAlert,
                onTriggerIqamaAlert: setActiveIqamaAlert
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [
        times,
        dates,
        config,
        isEn,
        updateWidget,
        isWindowManuallyRestored
    ]);

    // Update widget when times or next prayer changes (not every second)
    useEffect(() => {
        if (times.Fajr && nextPrayer) {
            updateWidget(times, dates, nextPrayer, countdownRef.current);
        }
    }, [times, dates, nextPrayer?.key, updateWidget]);

    // Update widget immediately when theme changes
    useEffect(() => {
        if (times.Fajr && nextPrayer) {
            updateWidget(times, dates, nextPrayer, countdownRef.current);
        }
    }, [themeKey, times, dates, nextPrayer, updateWidget]);

    // Initial load
    useEffect(() => {
        const cached = localStorage.getItem('grandPrayersCache');
        if (cached) {
            try {
                const prayerData = JSON.parse(cached);
                if (prayerData && prayerData.timings) setTimes(prayerData.timings);
                if (prayerData && prayerData.dates) setDates(prayerData.dates);
            } catch (e) {}
        }
        if (config.location) {
            const syncTimes = computeTimesSync(config.location, new Date(), isEn);
            if (syncTimes) {
                setTimes(prev => (prev && Object.keys(prev).length > 0 ? prev : syncTimes.timings));
                setDates(prev => (prev && prev.hijri && !prev.hijri.includes('--') ? prev : syncTimes.dates));
            }
            fetchTimesForLocation(config.location);
        }

        const hasAutoLocated = localStorage.getItem('prayer_has_auto_located_v2');
        if (!hasAutoLocated) {
            refreshLocation(false)
                .then(() => {
                    try {
                        localStorage.setItem('prayer_has_auto_located_v2', 'true');
                    } catch (e) {}
                })
                .catch(() => {});
        }
    }, [fetchTimesForLocation, refreshLocation, isEn]);

    const calcInfo = useMemo(() => {
        return getCalculationParams(new Date(), config.location, config);
    }, [config.location, config.calculationMethod, config.asrMadhab, config.highLatitudeRule]);

    const activeCalculationMethodName = useMemo(() => {
        if (!config.calculationMethod || config.calculationMethod === 'auto') {
            return isEn ? `Auto (${calcInfo.detectedNameEn})` : `تلقائي (${calcInfo.detectedNameAr})`;
        }
        const opt = CALCULATION_METHOD_OPTIONS.find(o => o.id === config.calculationMethod);
        return isEn ? opt?.nameEn || config.calculationMethod : opt?.nameAr || config.calculationMethod;
    }, [config.calculationMethod, calcInfo, isEn]);

    const activeAsrMadhabName = useMemo(() => {
        const opt = ASR_MADHAB_OPTIONS.find(o => o.id === (config.asrMadhab || 'shafi'));
        return isEn ? opt?.scholarEn || 'Majority' : opt?.scholarAr || 'جمهور العلماء';
    }, [config.asrMadhab, isEn]);

    const activeHighLatRuleName = useMemo(() => {
        const opt = HIGH_LATITUDE_RULE_OPTIONS.find(o => o.id === (config.highLatitudeRule || 'auto'));
        return isEn ? opt?.nameEn || 'Auto' : opt?.nameAr || 'تلقائي';
    }, [config.highLatitudeRule, isEn]);

    const effectiveAlertVolume = typeof config.alertVolume === 'number' ? config.alertVolume : 100;
    useEffect(() => {
        setStoredAlertVolume(effectiveAlertVolume);
    }, [effectiveAlertVolume]);

    const setAlertVolume = useCallback(
        (vol: number) => {
            const clamped = Math.max(0, Math.min(100, Math.round(vol)));
            updateConfig({ alertVolume: clamped });
        },
        [updateConfig]
    );

    const contextValue = useMemo(
        () => ({
            times,
            dates,
            nextPrayer,
            config,
            setConfig,
            refreshLocation,
            manualSearch,
            selectLocation,
            updateConfig,
            alertVolume: effectiveAlertVolume,
            setAlertVolume,
            isPrayerSilentActive,
            activeSilentPrayerName,
            manuallyRestoreSilent,
            activeIqamaAlert,
            dismissIqamaAlert,
            activeAdhanAlert,
            dismissAdhanAlert,
            activeCalculationMethodName,
            activeAsrMadhabName,
            activeHighLatRuleName
        }),
        [
            times,
            dates,
            nextPrayer,
            config,
            refreshLocation,
            manualSearch,
            selectLocation,
            updateConfig,
            effectiveAlertVolume,
            setAlertVolume,
            isPrayerSilentActive,
            activeSilentPrayerName,
            manuallyRestoreSilent,
            activeIqamaAlert,
            dismissIqamaAlert,
            activeAdhanAlert,
            dismissAdhanAlert,
            activeCalculationMethodName,
            activeAsrMadhabName,
            activeHighLatRuleName
        ]
    );

    return (
        <PrayerTimesContext.Provider value={contextValue}>
            <PrayerCountdownContext.Provider value={countdown}>{children}</PrayerCountdownContext.Provider>
        </PrayerTimesContext.Provider>
    );
};

export const usePrayerTimes = () => {
    const context = useContext(PrayerTimesContext);
    if (!context) {
        throw new Error('usePrayerTimes must be used within a PrayerTimesProvider');
    }
    return context;
};

export const usePrayerCountdown = () => {
    return useContext(PrayerCountdownContext);
};
