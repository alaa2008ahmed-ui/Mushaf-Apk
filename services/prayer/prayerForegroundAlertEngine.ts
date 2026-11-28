import { Capacitor } from '@capacitor/core';
import { prayerNamesAr } from '../../data/prayerAndApp/prayerTimesData';
import { checkSupportsDST, playNotificationSound } from '../../utils/prayerAndWorship/prayerTimesUtils';
import { getNativeSilentStatus } from '../../utils/notifications/silentMode';
import { PRAYER_NAMES_EN } from '../../utils/prayerAndWorship/prayerTimesTranslations';
import { triggerAlertVibration } from '../../utils/app/vibrationHelper';
import { applyOffset } from './prayerCalculationService';
import { resolveAdhanToneFile } from './prayerNotificationScheduler';
import {
    PrayerConfig,
    SunriseAlertsConfig,
    DEFAULT_SUNRISE_ALERTS,
    getEffectiveIqamaMinutes,
    isPrayerIqamaEnabled
} from './prayerTypesAndConfig';

interface ForegroundAlertEngineParams {
    now: Date;
    times: Record<string, string>;
    config: PrayerConfig;
    isEn: boolean;
    triggeredAlerts: Set<string>;
    isWindowManuallyRestored: (startMillis?: number | null) => boolean;
    onTriggerAdhanAlert: (alert: { prayerKey: string; prayerName: string; timeStr: string; soundFileName?: string }) => void;
    onTriggerIqamaAlert: (alert: { prayerKey: string; prayerName: string; minutes: number; timeStr: string }) => void;
}

export const evaluateForegroundPrayerAlerts = ({
    now,
    times,
    config,
    isEn,
    triggeredAlerts,
    isWindowManuallyRestored,
    onTriggerAdhanAlert,
    onTriggerIqamaAlert
}: ForegroundAlertEngineParams) => {
    if (Object.keys(times).length === 0) return;

    const isNative = Capacitor.isNativePlatform();
    const dayStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    const prayerCheckKeys = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const supportsDST = checkSupportsDST(config.location?.combinedCode, config.location?.fullCountry);
    const isSummerTimeActive = config.isSummerTime && supportsDST;

    for (const key of prayerCheckKeys) {
        const isPrayerMuted = !!config.mutedPrayers?.[key];
        const totalOffset = (config.prayerOffsets[key] || 0) + (isSummerTimeActive ? 60 : 0);
        const adjustedTime = applyOffset(times[key], totalOffset);
        if (!adjustedTime || adjustedTime.includes('--')) continue;

        const [h, m] = adjustedTime.split(':').map(Number);
        const prayerTimeObj = new Date(now);
        prayerTimeObj.setHours(h, m, 0, 0);

        const diffMs = now.getTime() - prayerTimeObj.getTime();

        // 1. Live Adhan Sound & Visual Alert (within 0-45s)
        const adhanAlertKey = `${dayStr}_adhan_${key}`;
        if (diffMs >= 0 && diffMs <= 45000 && !triggeredAlerts.has(adhanAlertKey)) {
            triggeredAlerts.add(adhanAlertKey);
            if (!isPrayerMuted && key !== 'Sunrise') {
                const { soundFileName, playSound: canPlay } = resolveAdhanToneFile(
                    config.tones?.[key],
                    config.audioMutedUntil,
                    Date.now()
                );

                if (canPlay) {
                    if (!isNative) {
                        console.log(`[Foreground Adhan] Playing web live adhan tone: ${soundFileName} for ${key}`);
                        playNotificationSound(`/assets/audio/${soundFileName}`);
                    } else {
                        console.log(`[Native Adhan] Adhan tone handled natively by Android notification channel for ${key}`);
                    }
                }

                if (!isNative) {
                    triggerAlertVibration('adhan');
                    const prayerNameLocal = isEn ? (PRAYER_NAMES_EN[key] || key) : (prayerNamesAr[key] || key);

                    onTriggerAdhanAlert({
                        prayerKey: key,
                        prayerName: prayerNameLocal,
                        timeStr: adjustedTime,
                        soundFileName
                    });

                    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                        try {
                            new Notification(isEn ? `It is now time for ${prayerNameLocal} Adhan` : `حان الآن موعد أذان ${prayerNameLocal}`, {
                                body: isEn
                                    ? 'Remember Allah. The Prophet ﷺ said: "O Bilal, call the Adhan so we may find comfort in prayer."'
                                    : 'حيَّ على الصلاة، حيَّ على الفلاح.. «أرحنا بها يا بلال» ﷺ.',
                                icon: '/icon.png',
                                tag: `standalone_web_adhan_${key}_${Date.now()}`,
                                requireInteraction: true
                            });
                        } catch (e) {}
                    }
                }
            }
        }

        if (isPrayerMuted) {
            continue;
        }

        const prayerChimeSound = '/assets/audio/notif_droplet.wav';

        // 2. Live Pre-Adhan Preparation Reminder
        let isPreReminderEnabled = false;
        let reminderMinutes = 15;
        if (config.prayerPreReminders?.[key] !== undefined) {
            isPreReminderEnabled = !!config.prayerPreReminders[key].enabled;
            reminderMinutes = config.prayerPreReminders[key].minutes || 15;
        } else if (config.preAthanReminder && config.preAthanReminder.enabled !== false) {
            isPreReminderEnabled = true;
            reminderMinutes = config.preAthanReminder.minutes || 15;
        }

        if (isPreReminderEnabled && key !== 'Sunrise') {
            const preTimeObj = new Date(prayerTimeObj.getTime() - reminderMinutes * 60000);
            const preDiffMs = now.getTime() - preTimeObj.getTime();
            const preAlertKey = `${dayStr}_pre_${key}`;
            if (preDiffMs >= 0 && preDiffMs <= 45000 && !triggeredAlerts.has(preAlertKey)) {
                triggeredAlerts.add(preAlertKey);
                if (!isNative) {
                    console.log(`[Foreground Alert] Playing prayer chime for pre-adhan ${key}`);
                    triggerAlertVibration('alert');
                    playNotificationSound(prayerChimeSound);
                }
            }
        }

        // 3. Live Iqama Reminder
        const isIqamaEnabled = isPrayerIqamaEnabled(config, key);
        const iqamaMinutes = getEffectiveIqamaMinutes(config, key);
        const iqamaTimeObj = new Date(prayerTimeObj.getTime() + iqamaMinutes * 60000);

        if (isIqamaEnabled && key !== 'Sunrise') {
            const iqamaDiffMs = now.getTime() - iqamaTimeObj.getTime();
            const iqamaAlertKey = `${dayStr}_iqama_${key}`;
            if (iqamaDiffMs >= 0 && iqamaDiffMs <= 45000 && !triggeredAlerts.has(iqamaAlertKey)) {
                triggeredAlerts.add(iqamaAlertKey);
                if (!isNative) {
                    console.log(`[Iqama Alert] Playing prayer chime and showing visual alert for ${key}`);
                    triggerAlertVibration('alert');
                    playNotificationSound(prayerChimeSound, true);

                    const prayerNameLocal = isEn ? (PRAYER_NAMES_EN[key] || key) : (prayerNamesAr[key] || key);
                    const iqamaFormatted = applyOffset(times[key], totalOffset + iqamaMinutes);
                    onTriggerIqamaAlert({
                        prayerKey: key,
                        prayerName: prayerNameLocal,
                        minutes: iqamaMinutes,
                        timeStr: iqamaFormatted
                    });
                }
            }
        }

        // 4. Live Auto-Silent Mode (Web chime fallback + Android foreground boundary reconciliation)
        let isSilentEnabled = false;
        let silentDurationMins = 15;
        if (config.prayerAutoSilent?.[key] !== undefined) {
            isSilentEnabled = !!config.prayerAutoSilent[key].enabled;
            silentDurationMins = config.prayerAutoSilent[key].duration || 15;
        } else if (config.autoSilent) {
            isSilentEnabled = true;
            silentDurationMins = config.autoSilentDuration || 15;
        }

        if (isSilentEnabled && key !== 'Sunrise') {
            const silentDelayMs = 10000;
            const silentStartObj = new Date(iqamaTimeObj.getTime() + silentDelayMs);
            const silentEndObj = new Date(silentStartObj.getTime() + silentDurationMins * 60000);
            const silentDiffMs = now.getTime() - silentStartObj.getTime();
            const silentEndDiffMs = now.getTime() - silentEndObj.getTime();

            if (!isNative) {
                const silentAlertKey = `${dayStr}_silent_${key}`;
                if (
                    silentDiffMs >= 0 &&
                    silentDiffMs <= 45000 &&
                    !triggeredAlerts.has(silentAlertKey) &&
                    !isWindowManuallyRestored(silentStartObj.getTime())
                ) {
                    triggeredAlerts.add(silentAlertKey);
                    const isIqamaAlsoAlerting = isIqamaEnabled && Math.abs(silentStartObj.getTime() - iqamaTimeObj.getTime()) < 60000;
                    if (!isIqamaAlsoAlerting) {
                        console.log(`[Foreground Alert] Playing prayer chime for auto-silent ${key}`);
                        triggerAlertVibration('alert');
                        playNotificationSound(prayerChimeSound);
                    }
                }
            } else if (Capacitor.getPlatform() === 'android') {
                const fgStartKey = `${dayStr}_silent_fg_start_${key}`;
                if (silentDiffMs >= 0 && silentDiffMs <= 5000 && !triggeredAlerts.has(fgStartKey)) {
                    triggeredAlerts.add(fgStartKey);
                    getNativeSilentStatus().catch(() => {});
                }
                const fgEndKey = `${dayStr}_silent_fg_end_${key}`;
                if (silentEndDiffMs >= 2000 && silentEndDiffMs <= 7000 && !triggeredAlerts.has(fgEndKey)) {
                    triggeredAlerts.add(fgEndKey);
                    getNativeSilentStatus().catch(() => {});
                }
            }
        }
    }

    // Live Sunrise & Duha foreground alerts (Web fallback)
    const isSunriseMuted = !!config.mutedPrayers?.Sunrise;
    const isGlobalAudioPaused = Boolean(config.audioMutedUntil && Date.now() < config.audioMutedUntil);
    if (!isSunriseMuted && !isNative && times.Sunrise && !times.Sunrise.includes('--')) {
        const sunriseOffset = (config.prayerOffsets.Sunrise || 0) + (isSummerTimeActive ? 60 : 0);
        const adjustedSunrise = applyOffset(times.Sunrise, sunriseOffset);
        if (adjustedSunrise && !adjustedSunrise.includes('--')) {
            const [sH, sM] = adjustedSunrise.split(':').map(Number);
            const sunriseTimeObj = new Date(now);
            sunriseTimeObj.setHours(sH, sM, 0, 0);

            const srCfg: SunriseAlertsConfig = {
                ...DEFAULT_SUNRISE_ALERTS,
                ...(config.sunriseAlerts || {})
            };

            if (srCfg.preSunriseEnabled) {
                const preMins = srCfg.preSunriseMinutes || 15;
                const preObj = new Date(sunriseTimeObj.getTime() - preMins * 60000);
                const preDiff = now.getTime() - preObj.getTime();
                const preKey = `${dayStr}_pre_sunrise`;
                if (preDiff >= 0 && preDiff <= 45000 && !triggeredAlerts.has(preKey)) {
                    triggeredAlerts.add(preKey);
                    triggerAlertVibration('alert');
                    if (!isGlobalAudioPaused) playNotificationSound('/assets/audio/notif_droplet.wav');
                    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                        try {
                            new Notification(isEn ? 'Sunrise is Approaching' : 'اقترب وقت الشروق', {
                                body: isEn
                                    ? `${preMins} mins left until sunrise.. Hurry to perform Fajr prayer.`
                                    : `بقي ${preMins} دقيقة على شروق الشمس.. بادر بأداء صلاة الفجر.`,
                                icon: '/icon.png',
                                tag: `standalone_web_pre_sunrise_${dayStr}`
                            });
                        } catch (e) {}
                    }
                }
            }

            if (srCfg.atSunriseEnabled) {
                const srDiff = now.getTime() - sunriseTimeObj.getTime();
                const srKey = `${dayStr}_at_sunrise`;
                if (srDiff >= 0 && srDiff <= 45000 && !triggeredAlerts.has(srKey)) {
                    triggeredAlerts.add(srKey);
                    triggerAlertVibration('alert');
                    if (!isGlobalAudioPaused) playNotificationSound('/assets/audio/chime.mp3');
                    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                        try {
                            new Notification(isEn ? 'The Sun Has Risen' : 'أشرقت الشمس الآن', {
                                body: isEn
                                    ? 'Fajr time has ended, and the 15-minute prohibited prayer time has begun.'
                                    : 'انتهى وقت صلاة الفجر، وبدأ وقت النهي عن النافلة لـ ١٥ دقيقة.',
                                icon: '/icon.png',
                                tag: `standalone_web_at_sunrise_${dayStr}`
                            });
                        } catch (e) {}
                    }
                }
            }

            if (srCfg.duhaEnabled) {
                const duhaMins = srCfg.duhaMinutes || 15;
                const duhaObj = new Date(sunriseTimeObj.getTime() + duhaMins * 60000);
                const duhaDiff = now.getTime() - duhaObj.getTime();
                const duhaKey = `${dayStr}_duha_prayer`;
                if (duhaDiff >= 0 && duhaDiff <= 45000 && !triggeredAlerts.has(duhaKey)) {
                    triggeredAlerts.add(duhaKey);
                    triggerAlertVibration('alert');
                    if (!isGlobalAudioPaused) playNotificationSound('/assets/audio/chime.mp3');
                    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                        try {
                            new Notification(isEn ? 'Duha Prayer Time' : 'حان وقت صلاة الضحى', {
                                body: isEn
                                    ? "The sun has risen high.. Don't forget two rak'ahs of Duha prayer."
                                    : 'ارتفعت الشمس وزال وقت النهي.. لا تنسَ ركعتي الضحى صدقة عن مفاصلك.',
                                icon: '/icon.png',
                                tag: `standalone_web_duha_${dayStr}`
                            });
                        } catch (e) {}
                    }
                }
            }
        }
    }
};
