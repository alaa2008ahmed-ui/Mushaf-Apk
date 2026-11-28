import { getActiveNotificationTone } from '../../utils/prayerAndWorship/prayerTimesUtils';

export interface SunriseAlertsConfig {
    preSunriseEnabled: boolean;
    preSunriseMinutes: number;
    atSunriseEnabled: boolean;
    duhaEnabled: boolean;
    duhaMinutes: number;
}

export const DEFAULT_SUNRISE_ALERTS: SunriseAlertsConfig = {
    preSunriseEnabled: true,
    preSunriseMinutes: 15,
    atSunriseEnabled: true,
    duhaEnabled: true,
    duhaMinutes: 15
};

export interface PrayerLocation {
    cityGov: string;
    fullCountry: string;
    combinedCode: string;
    lat: number;
    lng: number;
    cityGovAr?: string;
    cityGovEn?: string;
    fullCountryAr?: string;
    fullCountryEn?: string;
    accuracy?: number;
    source?: 'gps' | 'ip' | 'manual' | 'default';
}

export interface PrayerConfig {
    iqamaOffsets: Record<string, number>;
    prayerOffsets: Record<string, number>;
    tones: Record<string, { name: string; data: string; originalUrl?: string }>;
    mutedPrayers: Record<string, boolean>;
    location: PrayerLocation;
    isSummerTime?: boolean;
    syncWidgetTheme?: boolean;
    nightNotifications?: {
        firstThird: boolean;
        midnight: boolean;
        lastThird: boolean;
    };
    audioMutedUntil?: number;
    preAthanReminder?: {
        enabled: boolean;
        minutes: number;
    };
    autoSilent?: boolean;
    autoSilentDuration?: number;
    // Per-prayer overrides (when global setting is off)
    prayerPreReminders?: Record<string, { enabled: boolean; minutes: number }>;
    prayerAutoSilent?: Record<string, { enabled: boolean; duration: number }>;
    // Iqama alert settings
    iqamaReminder?: {
        enabled: boolean;
        minutes?: number;
    };
    prayerIqamaReminders?: Record<string, { enabled: boolean; minutes?: number }>;
    // Sunrise & Duha alert settings
    sunriseAlerts?: SunriseAlertsConfig;
    notificationTone?: { id: string; name: string; data: string; fileName?: string };
    // In-app prayer alerts volume (0 - 100%)
    alertVolume?: number;
    // Astronomical calculation and Fiqh settings
    calculationMethod?: string;
    asrMadhab?: 'shafi' | 'hanafi';
    highLatitudeRule?: 'auto' | 'twilightangle' | 'middleofthenight' | 'seventhofthenight' | 'none';
}

export const DEFAULT_CONFIG: PrayerConfig = {
    iqamaOffsets: { Fajr: 20, Dhuhr: 15, Asr: 15, Maghrib: 10, Isha: 15 },
    prayerOffsets: { Fajr: 0, Sunrise: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0 },
    tones: {},
    mutedPrayers: {},
    location: {
        cityGov: 'الدمام - الشرقية',
        fullCountry: 'المملكة العربية السعودية',
        combinedCode: '+966013',
        lat: 26.4207,
        lng: 50.0888,
        cityGovAr: 'الدمام - الشرقية',
        cityGovEn: 'Dammam - Eastern Province',
        fullCountryAr: 'المملكة العربية السعودية',
        fullCountryEn: 'Saudi Arabia',
        source: 'default'
    },
    isSummerTime: false,
    syncWidgetTheme: true,
    nightNotifications: { firstThird: true, midnight: true, lastThird: true },
    preAthanReminder: { enabled: false, minutes: 15 },
    autoSilent: false,
    autoSilentDuration: 15,
    iqamaReminder: { enabled: true, minutes: 15 },
    sunriseAlerts: DEFAULT_SUNRISE_ALERTS,
    notificationTone: {
        id: 'chime',
        name: 'رنين هادئ',
        data: '/assets/audio/chime.mp3',
        fileName: 'chime.mp3'
    },
    alertVolume: 100,
    calculationMethod: 'auto',
    asrMadhab: 'shafi',
    highLatitudeRule: 'auto'
};

export const RESET_PRAYER_OFFSETS: Record<string, number> = {
    Fajr: 0,
    Sunrise: 0,
    Dhuhr: 0,
    Asr: 0,
    Maghrib: 0,
    Isha: 0
};

export const getEffectiveIqamaMinutes = (config: any, key: string): number => {
    if (config?.prayerIqamaReminders?.[key]?.minutes !== undefined) {
        return Number(config.prayerIqamaReminders[key].minutes);
    }
    if (config?.iqamaOffsets?.[key] !== undefined) {
        return Number(config.iqamaOffsets[key]);
    }
    if (config?.iqamaReminder?.minutes !== undefined) {
        return Number(config.iqamaReminder.minutes);
    }
    return 15;
};

export const isPrayerIqamaEnabled = (config: any, key: string): boolean => {
    if (config?.prayerIqamaReminders?.[key]?.enabled !== undefined) {
        return config.prayerIqamaReminders[key].enabled !== false;
    }
    if (config?.iqamaReminder?.enabled !== undefined) {
        return config.iqamaReminder.enabled !== false;
    }
    return true;
};

export const loadInitialPrayerConfig = (): PrayerConfig => {
    try {
        let savedSunriseAlerts: Partial<SunriseAlertsConfig> | null = null;
        try {
            const rawSr = localStorage.getItem('sunrise_alerts_settings_v1');
            if (rawSr) savedSunriseAlerts = JSON.parse(rawSr);
        } catch (e) {}

        const saved = localStorage.getItem('prayerFinal_v34');
        if (saved) {
            const parsed = JSON.parse(saved);
            const hasMigratedSunrise = Boolean(parsed.sunriseAlerts);
            const mergedMuted = hasMigratedSunrise
                ? (parsed.mutedPrayers || {})
                : { ...(parsed.mutedPrayers || {}), Sunrise: false };

            return {
                ...DEFAULT_CONFIG,
                ...parsed,
                mutedPrayers: mergedMuted,
                prayerOffsets: {
                    ...DEFAULT_CONFIG.prayerOffsets,
                    ...(parsed.prayerOffsets || {})
                },
                iqamaReminder: {
                    enabled: parsed.iqamaReminder?.enabled !== undefined ? parsed.iqamaReminder.enabled : true,
                    minutes: parsed.iqamaReminder?.minutes || 15
                },
                sunriseAlerts: {
                    ...DEFAULT_SUNRISE_ALERTS,
                    ...(savedSunriseAlerts || {}),
                    ...(parsed.sunriseAlerts || {})
                },
                notificationTone: parsed.notificationTone || getActiveNotificationTone()
            };
        }

        // Migrate from v33 ensuring iqamaReminder defaults to enabled
        const oldSaved = localStorage.getItem('prayerFinal_v33');
        if (oldSaved) {
            const parsed = JSON.parse(oldSaved);
            return {
                ...DEFAULT_CONFIG,
                ...parsed,
                mutedPrayers: { ...(parsed.mutedPrayers || {}), Sunrise: false },
                prayerOffsets: {
                    ...DEFAULT_CONFIG.prayerOffsets,
                    ...(parsed.prayerOffsets || {})
                },
                preAthanReminder: { enabled: false, minutes: parsed.preAthanReminder?.minutes || 15 },
                autoSilent: false,
                iqamaReminder: { enabled: true, minutes: parsed.iqamaReminder?.minutes || 15 },
                sunriseAlerts: {
                    ...DEFAULT_SUNRISE_ALERTS,
                    ...(savedSunriseAlerts || {})
                }
            };
        }

        return {
            ...DEFAULT_CONFIG,
            sunriseAlerts: {
                ...DEFAULT_SUNRISE_ALERTS,
                ...(savedSunriseAlerts || {})
            }
        };
    } catch (e) {
        return DEFAULT_CONFIG;
    }
};
