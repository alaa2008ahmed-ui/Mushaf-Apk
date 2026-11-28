import { Coordinates, PrayerTimes as AdhanPrayerTimes } from 'adhan';
import moment from 'moment-hijri';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { prayerNamesAr, ADHAN_CHANNELS_CONFIG } from '../../data/prayerAndApp/prayerTimesData';
import {
    checkSupportsDST,
    getActiveNotificationTone,
    getActiveNotificationSoundPath
} from '../../utils/prayerAndWorship/prayerTimesUtils';
import {
    scheduleDeviceSilentWindows,
    cancelAllDeviceSilentWindows,
    updateNativeAlertsGroupSummary,
    scheduleNativeAdhanAlarms,
    cancelNativeAdhanAlarms,
    ScheduledAdhanAlarm,
    scheduleNativeIqamaAlarms,
    cancelNativeIqamaAlarms,
    ScheduledIqamaAlarm,
    ensureNativeCustomNotificationChannel
} from '../../utils/notifications/silentMode';
import { PRAYER_NAMES_EN } from '../../utils/prayerAndWorship/prayerTimesTranslations';
import { ensureNotificationPermission } from '../../utils/notifications/permissionHelper';
import { getEffectiveNotificationLanguage } from '../../utils/notifications/appNotificationSettings';
import { getCalculationParams } from './prayerCalculationService';
import {
    PrayerConfig,
    SunriseAlertsConfig,
    DEFAULT_SUNRISE_ALERTS,
    getEffectiveIqamaMinutes,
    isPrayerIqamaEnabled
} from './prayerTypesAndConfig';

const LEGACY_CHANNELS = [
    'adhan_general_channel',
    'adhan_channel_silent',
    'pre_adhan_reminder_channel',
    'pre_adhan_alarm_channel',
    'pre_adhan_v3_chime_channel',
    'iqama_reminder_channel',
    'iqama_alarm_channel',
    'iqama_v3_chime_channel',
    'iqama_v4_chime_channel',
    'prayer_silent_channel',
    'prayer_silent_v3_chime_channel',
    'prayer_silent_v4_chime_channel',
    'night_times_channel',
    'night_times_alarm_channel',
    'athkar_reminders_channel',
    'athkar_reminders_alarm_channel',
    'adhan_channel_takbeer1',
    'adhan_channel_takbeer2',
    'adhan_channel_takbeer3',
    'adhan_channel_takbeer4',
    'adhan_channel_takbeer5',
    'adhan_channel_takbeer6',
    'adhan_channel_azan1',
    'adhan_channel_azan2',
    'adhan_channel_azan3',
    'adhan_channel_azan4',
    'adhan_channel_salah',
    'adhan_channel_shahadah',
    'adhan_v3_takbeer1', 'adhan_v3_takbeer2', 'adhan_v3_takbeer3',
    'adhan_v3_takbeer4', 'adhan_v3_takbeer5', 'adhan_v3_takbeer6',
    'adhan_v3_azan1', 'adhan_v3_azan2', 'adhan_v3_azan3', 'adhan_v3_azan4',
    'adhan_v3_salah', 'adhan_v3_shahadah', 'adhan_v3_silent',
    'adhan_v4_takbeer1', 'adhan_v4_takbeer2', 'adhan_v4_takbeer3',
    'adhan_v4_takbeer4', 'adhan_v4_takbeer5', 'adhan_v4_takbeer6',
    'adhan_v4_azan1', 'adhan_v4_azan2', 'adhan_v4_azan3', 'adhan_v4_azan4',
    'adhan_v4_salah', 'adhan_v4_shahadah', 'adhan_v4_silent',
    'adhan_v5_silent',
    'athkar_channel_v4_silent',
    'iqama_v4_silent_channel',
    'prayer_silent_v4_silent_channel'
];

export const resolveAdhanToneFile = (
    toneConfig: { name?: string; data?: string; originalUrl?: string } | undefined,
    audioMutedUntil: number | undefined,
    targetTimeMs: number
): { soundFileName: string; rawSoundName: string; playSound: boolean } => {
    let soundFileName = 'takbeer1.mp3';
    let playSound = true;

    if (audioMutedUntil && targetTimeMs < audioMutedUntil) {
        playSound = false;
    } else if (toneConfig && toneConfig.data) {
        if (toneConfig.data === 'none') {
            playSound = false;
        } else {
            const rawPath = (toneConfig.originalUrl || toneConfig.data || '').toLowerCase();
            const toneName = (toneConfig.name || '').trim();

            if (
                rawPath.includes('salah') ||
                toneName === 'الصلاة' ||
                toneName === 'الصلاه' ||
                toneName.includes('صلاة') ||
                toneName.includes('صلاه') ||
                toneName.toLowerCase().includes('salah')
            ) {
                soundFileName = 'salah.mp3';
            } else if (
                rawPath.includes('shahadah') ||
                toneName === 'الشهادة' ||
                toneName === 'الشهاده' ||
                toneName.includes('شهادة') ||
                toneName.includes('شهاده') ||
                toneName.toLowerCase().includes('shahadah')
            ) {
                soundFileName = 'shahadah.mp3';
            } else if (rawPath.includes('takbeer1') || toneName.includes('تكبيرة 1') || toneName.includes('تكبيرات 1')) {
                soundFileName = 'takbeer1.mp3';
            } else if (rawPath.includes('takbeer2') || toneName.includes('تكبيرة 2') || toneName.includes('تكبيرات 2')) {
                soundFileName = 'takbeer2.mp3';
            } else if (rawPath.includes('takbeer3') || toneName.includes('تكبيرة 3') || toneName.includes('تكبيرات 3')) {
                soundFileName = 'takbeer3.mp3';
            } else if (rawPath.includes('takbeer4') || toneName.includes('تكبيرة 4') || toneName.includes('تكبيرات 4')) {
                soundFileName = 'takbeer4.mp3';
            } else if (rawPath.includes('takbeer5') || toneName.includes('تكبيرة 5') || toneName.includes('تكبيرات 5')) {
                soundFileName = 'takbeer5.mp3';
            } else if (rawPath.includes('takbeer6') || toneName.includes('تكبيرة 6') || toneName.includes('تكبيرات 6')) {
                soundFileName = 'takbeer6.mp3';
            } else if (rawPath.includes('azan1') || toneName.includes('أذان 1')) {
                soundFileName = 'azan1.mp3';
            } else if (rawPath.includes('azan2') || toneName.includes('أذان 2')) {
                soundFileName = 'azan2.mp3';
            } else if (rawPath.includes('azan3') || toneName.includes('أذان 3')) {
                soundFileName = 'azan3.mp3';
            } else if (rawPath.includes('azan4') || toneName.includes('أذان 4')) {
                soundFileName = 'azan4.mp3';
            } else {
                const extracted = rawPath.split('/').pop()?.split('?')[0] || '';
                const normalized = extracted.toLowerCase().replace(/[^a-z0-9_.]/g, '');
                if (normalized) {
                    soundFileName = normalized.endsWith('.mp3') ? normalized : normalized + '.mp3';
                }
            }
        }
    }

    const rawSoundName = soundFileName.replace(/\.mp3$/i, '').toLowerCase();
    return { soundFileName, rawSoundName, playSound };
};

const configureNativeNotificationChannels = async (isEn: boolean): Promise<boolean> => {
    let hasNotifPermission = false;
    try {
        hasNotifPermission = await ensureNotificationPermission(false);
        const existingChannels = await LocalNotifications.listChannels();
        const existingIds = new Set((existingChannels?.channels || []).map((c: any) => c.id));

        for (const oldId of LEGACY_CHANNELS) {
            if (existingIds.has(oldId)) {
                try {
                    await LocalNotifications.deleteChannel({ id: oldId });
                } catch (e) {}
            }
        }

        for (const chan of ADHAN_CHANNELS_CONFIG) {
            if (!existingIds.has(chan.id)) {
                try {
                    await LocalNotifications.createChannel({
                        id: chan.id,
                        name: chan.name,
                        description: isEn ? `Adhan notification tone: ${chan.name}` : `نغمة إشعار الأذان: ${chan.name}`,
                        importance: 5,
                        sound: chan.raw || chan.sound,
                        vibration: true,
                        visibility: 1
                    });
                } catch (chanErr) {
                    console.warn(`Error creating channel ${chan.id}:`, chanErr);
                }
            }
        }

        if (!existingIds.has('adhan_v6_silent')) {
            try {
                await LocalNotifications.createChannel({
                    id: 'adhan_v6_silent',
                    name: isEn ? 'Prayer Adhan (Silent)' : 'أذان الصلوات (بدون صوت)',
                    description: isEn ? 'Adhan notification without sound' : 'إشعار الأذان بدون صوت تنبيه مع اهتزاز',
                    importance: 5,
                    vibration: true,
                    visibility: 1,
                    lights: true
                });
            } catch (e) {}
        }

        const alertChannels = [
            {
                id: 'pre_adhan_v4_droplet_channel',
                name: isEn ? 'Prayer Preparation Alert' : 'تنبيه الاستعداد للصلاة',
                desc: isEn ? 'Short gentle droplet tone before Adhan' : 'نغمة تنبيه قطرة ماء للاستعداد والوضوء قبل الأذان',
                sound: 'notif_droplet.wav'
            },
            {
                id: 'iqama_v5_droplet_channel',
                name: isEn ? 'Prayer Iqama Alert' : 'تنبيه إقامة الصلاة',
                desc: isEn ? 'Droplet alert when prayer Iqama begins' : 'نغمة قطرة ماء وإشعار مرئي عند حلول موعد إقامة الصلاة',
                sound: 'notif_droplet.wav'
            },
            {
                id: 'prayer_silent_v5_droplet_channel',
                name: isEn ? 'Auto Silent for Prayer' : 'الصامت التلقائي للصلاة',
                desc: isEn ? 'Short droplet alert when silent mode activates or deactivates' : 'نغمة قطرة ماء عند تفعيل أو إنهاء وضع الصامت للصلاة',
                sound: 'notif_droplet.wav'
            },
            {
                id: 'night_times_v3_chime_channel',
                name: isEn ? 'Night Times Reminders' : 'تنبيهات أوقات الليل',
                desc: isEn ? 'Notifications for first third, midnight, and last third' : 'إشعارات لأوقات أول الليل، منتصف الليل، والثلث الأخير',
                sound: 'chime.mp3'
            },
            {
                id: 'sunrise_duha_v1_chime_channel',
                name: isEn ? 'Sunrise & Duha Alerts' : 'تنبيهات الشروق وصلاة الضحى',
                desc: isEn ? 'Calm reminder alerts for sunrise and Duha prayer' : 'نغمة تنبيه هادئة لأوقات الشروق وصلاة الضحى',
                sound: 'chime.mp3'
            },
            {
                id: 'athkar_v3_chime_channel',
                name: isEn ? 'Adhkar & Reminders' : 'أذكار وتنبيهات عامة',
                desc: isEn ? 'Reminders for morning, evening, and daily prayers' : 'قناة تنبيهات أذكار الصباح والمساء والسنن والأدعية',
                sound: 'chime.mp3'
            }
        ];

        for (const ac of alertChannels) {
            if (!existingIds.has(ac.id)) {
                await LocalNotifications.createChannel({
                    id: ac.id,
                    name: ac.name,
                    description: ac.desc,
                    importance: 5,
                    sound: ac.sound,
                    vibration: true,
                    visibility: 1
                });
            }
        }
    } catch (err) {
        console.warn('Error configuring LocalNotifications channels:', err);
    }
    return hasNotifPermission;
};

export const scheduleAllPrayerNotifications = async (config: PrayerConfig, isEn: boolean): Promise<void> => {
    const effectiveIsEn = getEffectiveNotificationLanguage(isEn ? 'en' : 'ar') === 'en';
    isEn = effectiveIsEn;
    const isNative = Capacitor.isNativePlatform();
    const isAndroidNative = Capacitor.getPlatform() === 'android';
    const w = window as any;

    const prayerKeys = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const notificationsToSchedule: any[] = [];
    const adhanAlarmsToSchedule: ScheduledAdhanAlarm[] = [];
    const iqamaAlarmsToSchedule: ScheduledIqamaAlarm[] = [];
    const silentWindowsToSchedule: any[] = [];

    const hasNotifPermission = isNative ? await configureNativeNotificationChannels(isEn) : false;

    for (let day = 0; day < 7; day++) {
        const date = new Date();
        date.setDate(date.getDate() + day);

        const coordinates = new Coordinates(config.location.lat, config.location.lng);
        const { params } = getCalculationParams(date, config.location, config);
        const prayerTimes = new AdhanPrayerTimes(coordinates, date, params);

        const dayTimings: any = {
            Fajr: prayerTimes.fajr,
            Sunrise: prayerTimes.sunrise,
            Dhuhr: prayerTimes.dhuhr,
            Asr: prayerTimes.asr,
            Maghrib: prayerTimes.maghrib,
            Isha: prayerTimes.isha
        };

        const isRamadan = moment(date).iMonth() === 8;
        const country = config.location.fullCountry || '';
        const code = config.location.combinedCode || '';
        if (isRamadan && (code.startsWith('+966') || country.includes('السعودية') || code.startsWith('+974') || country.includes('قطر'))) {
            const diffMinutes = (dayTimings.Isha.getTime() - dayTimings.Maghrib.getTime()) / 60000;
            if (diffMinutes < 110) {
                dayTimings.Isha = new Date(dayTimings.Isha.getTime() + 30 * 60000);
            }
        }

        const supportsDST = checkSupportsDST(config.location.combinedCode, config.location.fullCountry);
        const isSummerTimeActive = config.isSummerTime && supportsDST;

        for (const key of prayerKeys) {
            const prayerDate = new Date(dayTimings[key]);
            const totalOffset = (config.prayerOffsets[key] || 0) + (isSummerTimeActive ? 60 : 0);
            prayerDate.setMinutes(prayerDate.getMinutes() + totalOffset);

            if (config.mutedPrayers?.[key]) {
                continue;
            }

            const prayerNameLocal = isEn ? (PRAYER_NAMES_EN[key] || key) : (prayerNamesAr[key] || key);

            // 1. Adhan Notification
            if (!config.mutedPrayers?.[key] && key !== 'Sunrise') {
                const toneConfig = config.tones?.[key];
                const { soundFileName, rawSoundName, playSound } = resolveAdhanToneFile(
                    toneConfig,
                    config.audioMutedUntil,
                    prayerDate.getTime()
                );

                const matchedChan = ADHAN_CHANNELS_CONFIG.find(c => c.raw === rawSoundName || c.sound === soundFileName);
                let chosenChannelId = 'adhan_v5_takbeer1';
                let finalSound: string | undefined = 'takbeer1.mp3';

                if (!playSound) {
                    chosenChannelId = 'adhan_v6_silent';
                    finalSound = undefined;
                } else if (matchedChan) {
                    chosenChannelId = matchedChan.id;
                    finalSound = matchedChan.sound;
                }

                if (prayerDate > new Date()) {
                    const notifId = 1000 + (day * 10) + prayerKeys.indexOf(key) + 1;
                    const adhanTitle = isEn ? `It is now time for ${prayerNameLocal} Adhan` : `حان الآن موعد أذان ${prayerNameLocal}`;
                    const adhanBody = isEn
                        ? 'Remember Allah. The Prophet ﷺ said: "O Bilal, call the Adhan so we may find comfort in prayer."'
                        : 'حيَّ على الصلاة، حيَّ على الفلاح.. «أرحنا بها يا بلال» ﷺ.';

                    if (isAndroidNative) {
                        const customSoundUri =
                            playSound &&
                            toneConfig?.data &&
                            (toneConfig.data.startsWith('file://') || toneConfig.data.startsWith('content://'))
                                ? toneConfig.data
                                : '';

                        adhanAlarmsToSchedule.push({
                            id: notifId,
                            prayerKey: key,
                            title: adhanTitle,
                            body: adhanBody,
                            triggerAtMillis: prayerDate.getTime(),
                            soundName: rawSoundName || 'takbeer1',
                            soundUri: customSoundUri,
                            playSound,
                            isArabic: !isEn
                        });
                    } else {
                        notificationsToSchedule.push({
                            id: notifId,
                            title: adhanTitle,
                            body: adhanBody,
                            schedule: { at: prayerDate, allowWhileIdle: true },
                            channelId: chosenChannelId,
                            sound: finalSound,
                            smallIcon: 'ic_stat_name',
                            extra: {
                                type: 'adhan',
                                prayer: key,
                                soundFile: finalSound,
                                playSound
                            }
                        });
                    }
                }
            }

            // 2. Pre-Adhan Preparation Reminder
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
                const prePrayerDate = new Date(prayerDate.getTime() - reminderMinutes * 60000);
                if (prePrayerDate > new Date()) {
                    const preNotifId = 5000 + (day * 10) + prayerKeys.indexOf(key) + 1;
                    notificationsToSchedule.push({
                        id: preNotifId,
                        title: isEn
                            ? `${prayerNameLocal} Adhan is approaching (${reminderMinutes} minutes left)`
                            : `اقترب موعد صلاة ${prayerNameLocal}`,
                        body: isEn
                            ? `Time for wudu, preparation, and proceeding to prayer for ${prayerNameLocal}.`
                            : `بقي ${reminderMinutes} دقيقة على الأذان.. تهيّأ بالوضوء وأقبل على الله.`,
                        schedule: { at: prePrayerDate, allowWhileIdle: true },
                        channelId: 'pre_adhan_v4_droplet_channel',
                        sound: 'notif_droplet.wav',
                        smallIcon: 'ic_stat_name',
                        extra: { type: 'pre_adhan', prayer: key, playSound: true, soundFile: '/assets/audio/notif_droplet.wav' }
                    });
                }
            }

            // 3. Iqama Reminder Notification
            const isIqamaReminderEnabled = isPrayerIqamaEnabled(config, key);
            const iqamaMinutes = getEffectiveIqamaMinutes(config, key);
            const iqamaPrayerDate = new Date(prayerDate.getTime() + iqamaMinutes * 60000);

            if (isIqamaReminderEnabled && key !== 'Sunrise') {
                if (iqamaPrayerDate > new Date()) {
                    const iqamaNotifId = 6000 + (day * 10) + prayerKeys.indexOf(key) + 1;
                    const iqamaTitle = isEn
                        ? `It is now time for ${prayerNameLocal} Iqama`
                        : `أُقيمت صلاة ${prayerNameLocal}`;
                    const iqamaBody = isEn
                        ? 'Salah has begun. Straighten and close your ranks, may Allah reward you.'
                        : 'استووا واعتدلوا، وأقبلوا بقلوبكم على الله.';

                    if (isAndroidNative) {
                        iqamaAlarmsToSchedule.push({
                            id: iqamaNotifId,
                            prayerKey: key,
                            title: iqamaTitle,
                            body: iqamaBody,
                            triggerAtMillis: iqamaPrayerDate.getTime(),
                            playSound: true,
                            isArabic: !isEn
                        });
                    } else {
                        notificationsToSchedule.push({
                            id: iqamaNotifId,
                            title: iqamaTitle,
                            body: iqamaBody,
                            schedule: { at: iqamaPrayerDate, allowWhileIdle: true },
                            channelId: 'iqama_v5_droplet_channel',
                            sound: 'notif_droplet.wav',
                            smallIcon: 'ic_stat_name',
                            extra: { type: 'iqama', prayer: key, playSound: true, soundFile: '/assets/audio/notif_droplet.wav' }
                        });
                    }
                }
            }

            // 4. Auto Silent Mode Window Scheduling
            let isSilentEnabled = false;
            let silentDuration = 15;

            if (config.prayerAutoSilent?.[key] !== undefined) {
                isSilentEnabled = !!config.prayerAutoSilent[key].enabled;
                silentDuration = config.prayerAutoSilent[key].duration || 15;
            } else if (config.autoSilent) {
                isSilentEnabled = true;
                silentDuration = config.autoSilentDuration || 15;
            }

            if (isSilentEnabled && key !== 'Sunrise') {
                const silentStartDelayMs = 10000;
                const silentStart = new Date(iqamaPrayerDate.getTime() + silentStartDelayMs);
                const silentEnd = new Date(silentStart.getTime() + silentDuration * 60000);
                const silentStartNotifId = 7000 + (day * 10) + prayerKeys.indexOf(key) + 1;
                const isIqamaAlertingBefore = isIqamaReminderEnabled && Math.abs(silentStart.getTime() - iqamaPrayerDate.getTime()) < 60000;
                const shouldPlaySilentChime = !isIqamaAlertingBefore;
                const silentStartTitle = isEn
                    ? `Silent mode activated (${prayerNameLocal} Prayer)`
                    : `وضع الخشوع مُفعّل — ${prayerNameLocal}`;
                const silentStartBody = isEn
                    ? `Device muted automatically for ${silentDuration} minutes for ${prayerNameLocal} prayer.`
                    : `كُتِم صوت الهاتف تلقائياً لمدة ${silentDuration} دقيقة لتنعم بخشوعك.`;

                if (!isAndroidNative) {
                    if (silentStart > new Date()) {
                        notificationsToSchedule.push({
                            id: silentStartNotifId,
                            title: silentStartTitle,
                            body: silentStartBody,
                            schedule: { at: silentStart, allowWhileIdle: true },
                            channelId: shouldPlaySilentChime ? 'prayer_silent_v5_droplet_channel' : 'adhan_v6_silent',
                            sound: shouldPlaySilentChime ? 'notif_droplet.wav' : undefined,
                            smallIcon: 'ic_stat_name',
                            extra: {
                                type: 'auto_silent_start',
                                prayer: key,
                                playSound: shouldPlaySilentChime,
                                soundFile: shouldPlaySilentChime ? '/assets/audio/notif_droplet.wav' : undefined
                            }
                        });
                    }

                    if (silentEnd > new Date()) {
                        const silentEndNotifId = 8000 + (day * 10) + prayerKeys.indexOf(key) + 1;
                        notificationsToSchedule.push({
                            id: silentEndNotifId,
                            title: isEn
                                ? `Silent mode ended (${prayerNameLocal} Prayer)`
                                : `تقبّل الله صلاتكم — ${prayerNameLocal}`,
                            body: isEn
                                ? `Device sound and media restored after ${prayerNameLocal} prayer. May Allah accept our prayers.`
                                : 'أُعيد صوت الهاتف تلقائياً.. لا تنسَ أذكار ما بعد الصلاة.',
                            schedule: { at: silentEnd, allowWhileIdle: true },
                            channelId: 'prayer_silent_v5_droplet_channel',
                            sound: 'notif_droplet.wav',
                            smallIcon: 'ic_stat_name',
                            extra: { type: 'auto_silent_end', prayer: key, playSound: true, soundFile: '/assets/audio/notif_droplet.wav' }
                        });
                    }
                }

                if (silentEnd.getTime() > Date.now()) {
                    silentWindowsToSchedule.push({
                        id: silentStartNotifId,
                        prayerKey: key,
                        prayerName: prayerNameLocal,
                        startMillis: silentStart.getTime(),
                        durationMinutes: silentDuration,
                        title: silentStartTitle,
                        body: silentStartBody,
                        shouldPlayChime: shouldPlaySilentChime,
                        isArabic: !isEn
                    });
                }
            }
        }

        // Sunrise & Duha Notifications
        if (!config.mutedPrayers?.Sunrise && dayTimings.Sunrise) {
            const sunriseOffset = (config.prayerOffsets.Sunrise || 0) + (isSummerTimeActive ? 60 : 0);
            const sunriseDate = new Date(dayTimings.Sunrise);
            sunriseDate.setMinutes(sunriseDate.getMinutes() + sunriseOffset);

            const sunriseCfg: SunriseAlertsConfig = {
                ...DEFAULT_SUNRISE_ALERTS,
                ...(config.sunriseAlerts || {})
            };

            if (sunriseCfg.preSunriseEnabled) {
                const preMins = sunriseCfg.preSunriseMinutes || 15;
                const preSunriseDate = new Date(sunriseDate.getTime() - preMins * 60000);
                if (preSunriseDate > new Date()) {
                    const isAudioPaused = Boolean(config.audioMutedUntil && preSunriseDate.getTime() < config.audioMutedUntil);
                    notificationsToSchedule.push({
                        id: 3000 + (day * 10) + 1,
                        title: isEn ? 'Sunrise is Approaching' : 'اقترب وقت الشروق',
                        body: isEn
                            ? `${preMins} mins left until sunrise.. Hurry to perform Fajr prayer.`
                            : `بقي ${preMins} دقيقة على شروق الشمس.. بادر بأداء صلاة الفجر.`,
                        schedule: { at: preSunriseDate, allowWhileIdle: true },
                        channelId: isAudioPaused ? 'adhan_v6_silent' : 'pre_adhan_v4_droplet_channel',
                        sound: isAudioPaused ? undefined : 'notif_droplet.wav',
                        smallIcon: 'ic_stat_name',
                        extra: {
                            type: 'pre_sunrise',
                            prayer: 'Sunrise',
                            playSound: !isAudioPaused,
                            soundFile: !isAudioPaused ? '/assets/audio/notif_droplet.wav' : undefined
                        }
                    });
                }
            }

            if (sunriseCfg.atSunriseEnabled && sunriseDate > new Date()) {
                const isAudioPaused = Boolean(config.audioMutedUntil && sunriseDate.getTime() < config.audioMutedUntil);
                notificationsToSchedule.push({
                    id: 3000 + (day * 10) + 2,
                    title: isEn ? 'The Sun Has Risen' : 'أشرقت الشمس الآن',
                    body: isEn
                        ? 'Fajr time has ended, and the 15-minute prohibited prayer time has begun.'
                        : 'انتهى وقت صلاة الفجر، وبدأ وقت النهي عن النافلة لـ ١٥ دقيقة.',
                    schedule: { at: sunriseDate, allowWhileIdle: true },
                    channelId: isAudioPaused ? 'adhan_v6_silent' : 'sunrise_duha_v1_chime_channel',
                    sound: isAudioPaused ? undefined : 'chime.mp3',
                    smallIcon: 'ic_stat_name',
                    extra: {
                        type: 'sunrise',
                        prayer: 'Sunrise',
                        playSound: !isAudioPaused,
                        soundFile: !isAudioPaused ? '/assets/audio/chime.mp3' : undefined
                    }
                });
            }

            if (sunriseCfg.duhaEnabled) {
                const duhaMins = sunriseCfg.duhaMinutes || 15;
                const duhaDate = new Date(sunriseDate.getTime() + duhaMins * 60000);
                if (duhaDate > new Date()) {
                    const isAudioPaused = Boolean(config.audioMutedUntil && duhaDate.getTime() < config.audioMutedUntil);
                    notificationsToSchedule.push({
                        id: 3000 + (day * 10) + 3,
                        title: isEn ? 'Duha Prayer Time' : 'حان وقت صلاة الضحى',
                        body: isEn
                            ? "The sun has risen high.. Don't forget two rak'ahs of Duha prayer."
                            : 'ارتفعت الشمس وزال وقت النهي.. لا تنسَ ركعتي الضحى صدقة عن مفاصلك.',
                        schedule: { at: duhaDate, allowWhileIdle: true },
                        channelId: isAudioPaused ? 'adhan_v6_silent' : 'sunrise_duha_v1_chime_channel',
                        sound: isAudioPaused ? undefined : 'chime.mp3',
                        smallIcon: 'ic_stat_name',
                        extra: {
                            type: 'duha',
                            prayer: 'Sunrise',
                            playSound: !isAudioPaused,
                            soundFile: !isAudioPaused ? '/assets/audio/chime.mp3' : undefined
                        }
                    });
                }
            }
        }

        // Night Times Notifications
        const nightNotifs = config.nightNotifications || { firstThird: true, midnight: true, lastThird: true };
        const tomorrow = new Date(date);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowParams = getCalculationParams(tomorrow, config.location, config).params;
        const tomorrowPrayerTimes = new AdhanPrayerTimes(coordinates, tomorrow, tomorrowParams);

        const maghribDate = new Date(dayTimings.Maghrib);
        const tomorrowFajrDate = new Date(tomorrowPrayerTimes.fajr);

        const maghribOffset = (config.prayerOffsets.Maghrib || 0) + (isSummerTimeActive ? 60 : 0);
        const fajrOffset = (config.prayerOffsets.Fajr || 0) + (isSummerTimeActive ? 60 : 0);

        maghribDate.setMinutes(maghribDate.getMinutes() + maghribOffset);
        tomorrowFajrDate.setMinutes(tomorrowFajrDate.getMinutes() + fajrOffset);

        const diffMs = tomorrowFajrDate.getTime() - maghribDate.getTime();
        const firstThirdDate = new Date(maghribDate.getTime() + diffMs / 3);
        const midnightDate = new Date(maghribDate.getTime() + diffMs / 2);
        const lastThirdDate = new Date(maghribDate.getTime() + (diffMs * 2) / 3);

        const activeTone = getActiveNotificationTone();
        const isSoundMuted = activeTone.id === 'none' || activeTone.data === 'none';
        const isPhoneRingtone =
            !isSoundMuted &&
            (activeTone.id === 'phone_ringtone' ||
                activeTone.data?.startsWith('content://') ||
                activeTone.data?.startsWith('file://'));
        const notifSoundPath = getActiveNotificationSoundPath();
        const cleanToneId = (activeTone.id || 'chime').replace(/[^a-zA-Z0-9_]/g, '');
        let nightChannelId = isSoundMuted ? 'athkar_channel_v5_silent' : `athkar_channel_v4_${cleanToneId}`;
        let nightSoundFile: string | undefined = isSoundMuted
            ? undefined
            : activeTone.fileName || (cleanToneId.startsWith('notif_') ? `${cleanToneId}.wav` : `${cleanToneId}.mp3`);

        if (isPhoneRingtone && activeTone.data) {
            nightChannelId = isAndroidNative
                ? await ensureNativeCustomNotificationChannel(activeTone.data, activeTone.name)
                : activeTone.channelId || 'athkar_channel_v4_chime';
            nightSoundFile = undefined;
        }

        if (nightNotifs.firstThird && firstThirdDate > new Date()) {
            notificationsToSchedule.push({
                id: 2000 + (day * 10) + 1,
                title: isEn ? 'First Third of the Night' : 'أول الليل',
                body: isEn
                    ? 'The Prophet ﷺ said: "The best prayer after the obligatory prayers is the night prayer."'
                    : 'قال رسول الله ﷺ: "أفضل الصلاة بعد الفريضة صلاة الليل"',
                schedule: { at: firstThirdDate, allowWhileIdle: true },
                channelId: nightChannelId,
                sound: nightSoundFile,
                smallIcon: 'ic_stat_name',
                extra: {
                    type: 'night',
                    period: 'firstThird',
                    playSound: !isSoundMuted,
                    soundFile: nightSoundFile ? `/assets/audio/${nightSoundFile}` : undefined,
                    soundPath: notifSoundPath
                }
            });
        }

        if (nightNotifs.midnight && midnightDate > new Date()) {
            notificationsToSchedule.push({
                id: 2000 + (day * 10) + 2,
                title: isEn ? 'Islamic Midnight' : 'منتصف الليل',
                body: isEn
                    ? 'The Prophet ﷺ said: "Observe the night prayer, for it was the habit of the righteous before you."'
                    : 'قال رسول الله ﷺ: "عليكم بقيام الليل فإنه دأب الصالحين قبلكم، وقربة إلى الله تعالى"',
                schedule: { at: midnightDate, allowWhileIdle: true },
                channelId: nightChannelId,
                sound: nightSoundFile,
                smallIcon: 'ic_stat_name',
                extra: {
                    type: 'night',
                    period: 'midnight',
                    playSound: !isSoundMuted,
                    soundFile: nightSoundFile ? `/assets/audio/${nightSoundFile}` : undefined,
                    soundPath: notifSoundPath
                }
            });
        }

        if (nightNotifs.lastThird && lastThirdDate > new Date()) {
            notificationsToSchedule.push({
                id: 2000 + (day * 10) + 3,
                title: isEn ? 'Last Third of the Night' : 'الثلث الأخير من الليل',
                body: isEn
                    ? 'The Prophet ﷺ said: "Our Lord descends every night to the lowest heaven during the last third of the night, asking: Who is calling upon Me, that I may answer him?"'
                    : 'قال ﷺ: "ينزل ربنا تبارك وتعالى كل ليلة إلى السماء الدنيا حين يبقى ثلث الليل الآخر، فيقول: من يدعوني فأستجيب له..."',
                schedule: { at: lastThirdDate, allowWhileIdle: true },
                channelId: nightChannelId,
                sound: nightSoundFile,
                smallIcon: 'ic_stat_name',
                extra: {
                    type: 'night',
                    period: 'lastThird',
                    playSound: !isSoundMuted,
                    soundFile: nightSoundFile ? `/assets/audio/${nightSoundFile}` : undefined,
                    soundPath: notifSoundPath
                }
            });
        }
    }

    if (isNative) {
        try {
            if (silentWindowsToSchedule.length > 0) {
                await scheduleDeviceSilentWindows(silentWindowsToSchedule);
                console.log(`[Capacitor] Scheduled ${silentWindowsToSchedule.length} auto-silent windows.`);
            } else {
                await cancelAllDeviceSilentWindows();
            }
        } catch (silentErr) {
            console.warn('Error scheduling auto-silent windows:', silentErr);
        }

        if (hasNotifPermission) {
            try {
                const pending = await LocalNotifications.getPending();
                const delivered = await LocalNotifications.getDeliveredNotifications();
                const deliveredIds = new Set((delivered?.notifications || []).map(n => n.id));

                const prayerNotifs = (pending?.notifications || []).filter(
                    n => n.id >= 1000 && n.id < 9000 && !deliveredIds.has(n.id)
                );
                if (prayerNotifs.length > 0) {
                    await LocalNotifications.cancel({ notifications: prayerNotifs });
                }

                if (notificationsToSchedule.length > 0) {
                    const cleanPrayerNotifs = notificationsToSchedule.map(n => {
                        let finalId = n.id;
                        while (deliveredIds.has(finalId)) {
                            finalId += 500;
                        }
                        const { group, groupSummary, ...rest } = n;
                        return {
                            ...rest,
                            id: finalId,
                            group: 'com.mushaf.ahmedandlayla.PRAYER_ALERTS_CARD',
                            groupSummary: false,
                            smallIcon: 'ic_stat_name',
                            iconColor: '#2E7D5E',
                            ongoing: false,
                            autoCancel: true
                        };
                    });
                    await LocalNotifications.schedule({ notifications: cleanPrayerNotifs });
                    console.log(
                        `[Capacitor] Scheduled ${cleanPrayerNotifs.length} prayer/iqama notifications under group com.mushaf.ahmedandlayla.PRAYER_ALERTS_CARD.`
                    );
                    await updateNativeAlertsGroupSummary();
                }
            } catch (err) {
                console.warn('Error scheduling via LocalNotifications:', err);
            }
        }

        if (isAndroidNative) {
            try {
                if (adhanAlarmsToSchedule.length > 0) {
                    await scheduleNativeAdhanAlarms(adhanAlarmsToSchedule);
                    console.log(`[Capacitor] Scheduled ${adhanAlarmsToSchedule.length} volume-controlled native Adhan alarms.`);
                } else {
                    await cancelNativeAdhanAlarms();
                }
            } catch (adhanErr) {
                console.warn('Error scheduling native Adhan alarms:', adhanErr);
            }

            try {
                if (iqamaAlarmsToSchedule.length > 0) {
                    await scheduleNativeIqamaAlarms(iqamaAlarmsToSchedule);
                    console.log(`[Capacitor] Scheduled ${iqamaAlarmsToSchedule.length} native exact-clock Iqama alarms.`);
                } else {
                    await cancelNativeIqamaAlarms();
                }
            } catch (iqamaErr) {
                console.warn('Error scheduling native Iqama alarms:', iqamaErr);
            }
        }
    } else if (w.cordova && w.cordova.plugins && w.cordova.plugins.notification && w.cordova.plugins.notification.local) {
        const localNotifier = w.cordova.plugins.notification.local;
        localNotifier.cancelAll(() => {
            const cordovaNotifs = notificationsToSchedule.map(n => ({
                id: n.id,
                title: n.title,
                text: n.body,
                trigger: { at: n.schedule?.at },
                foreground: true,
                smallIcon: 'ic_stat_name',
                icon: 'ic_stat_name',
                androidAllowWhileIdle: true
            }));
            if (cordovaNotifs.length > 0) {
                localNotifier.schedule(cordovaNotifs);
            }
        });
    }
};

export const copyAssetToDevice = async (assetPath: string): Promise<string> => {
    try {
        const filename = assetPath.split('/').pop()?.split('?')[0] || 'audio.mp3';
        if (!filename) return assetPath;

        const targetDirectory = Capacitor.getPlatform() === 'android' ? Directory.External : Directory.Data;

        try {
            const stat = await Filesystem.stat({
                path: `sounds/${filename}`,
                directory: targetDirectory
            });
            return stat.uri;
        } catch (e) {}

        if (assetPath.startsWith('http')) {
            try {
                const downloadResult = await Filesystem.downloadFile({
                    url: assetPath,
                    path: `sounds/${filename}`,
                    directory: targetDirectory,
                    recursive: true
                });

                if (downloadResult.path) {
                    const stat = await Filesystem.stat({
                        path: `sounds/${filename}`,
                        directory: targetDirectory
                    });
                    return stat.uri;
                }
            } catch (downloadError) {
                console.warn('Native downloadFile failed (likely on web), falling back to fetch:', downloadError);
            }
        }

        let response;
        try {
            response = await fetch(assetPath);
            if (!response.ok) throw new Error('Direct fetch failed');
        } catch (e) {
            if (assetPath.startsWith('http')) {
                console.warn('Direct fetch failed, trying proxy...', e);
                const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(assetPath)}`;
                response = await fetch(proxyUrl);
                if (!response.ok) {
                    const proxyUrl2 = `https://api.allorigins.win/raw?url=${encodeURIComponent(assetPath)}`;
                    response = await fetch(proxyUrl2);
                    if (!response.ok) throw new Error('All proxy fetches failed');
                }
            } else {
                throw e;
            }
        }

        const blob = await response.blob();

        const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

        await Filesystem.writeFile({
            path: `sounds/${filename}`,
            data: base64Data,
            directory: targetDirectory,
            recursive: true
        });

        const uriResult = await Filesystem.getUri({
            path: `sounds/${filename}`,
            directory: targetDirectory
        });

        return uriResult.uri;
    } catch (error) {
        console.error('Error copying asset to device:', error);
        return assetPath;
    }
};
