import { Capacitor } from '@capacitor/core';
import { checkSupportsDST, calculateNightTimes } from '../../utils/prayerAndWorship/prayerTimesUtils';
import { updateAndroidWidget } from '../../utils/notifications/widgetUtils';
import { PRAYER_NAMES_EN, getLocalizedLocationName } from '../../utils/prayerAndWorship/prayerTimesTranslations';
import { applyOffset, getCalculationParams } from './prayerCalculationService';
import { PrayerConfig } from './prayerTypesAndConfig';

interface SyncWidgetParams {
    currentTimes: Record<string, string>;
    currentDates: { hijri: string; gregorian: string };
    currentNext: any;
    currentCountdown: string;
    config: PrayerConfig;
    isEn: boolean;
    themeKey: string;
}

export const syncPrayerWidget = ({
    currentTimes,
    currentDates,
    currentNext,
    currentCountdown,
    config,
    isEn,
    themeKey
}: SyncWidgetParams) => {
    if (Capacitor.getPlatform() !== 'android' || !currentTimes.Fajr || !currentNext) return;

    const supportsDST = checkSupportsDST(config.location.combinedCode, config.location.fullCountry);
    const isSummerTimeActive = config.isSummerTime && supportsDST;

    const maghribOffset = (config.prayerOffsets.Maghrib || 0) + (isSummerTimeActive ? 60 : 0);
    const fajrOffset = (config.prayerOffsets.Fajr || 0) + (isSummerTimeActive ? 60 : 0);
    const maghribTime = applyOffset(currentTimes.Maghrib, maghribOffset);
    const fajrTime = applyOffset(currentTimes.Fajr, fajrOffset);
    const nightTimes = calculateNightTimes(maghribTime, fajrTime);

    const to12h = (timeStr: string) => {
        if (!timeStr || timeStr.includes('--')) return '--:--';
        const [hh, mm] = timeStr.split(':');
        let hInt = parseInt(hh);
        hInt = hInt % 12 || 12;
        return `${hInt.toString().padStart(2, '0')}:${mm}`;
    };

    const formatTime = (timeStr: string, offset: number) => {
        const adjusted = applyOffset(timeStr, offset + (isSummerTimeActive ? 60 : 0));
        if (!adjusted || adjusted.includes('--')) return '--:--';
        const [hh, mm] = adjusted.split(':');
        let hInt = parseInt(hh);
        hInt = hInt % 12 || 12;
        return `${hInt.toString().padStart(2, '0')}:${mm}`;
    };

    const formatTime24 = (timeStr: string, offset: number) => {
        const adjusted = applyOffset(timeStr, offset + (isSummerTimeActive ? 60 : 0));
        if (!adjusted || adjusted.includes('--')) return '00:00';
        return adjusted;
    };

    const isWidgetLockLang = typeof window !== 'undefined' ? localStorage.getItem('widget_lock_lang') : null;
    const isWidgetEn = isWidgetLockLang === 'en' ? true : isWidgetLockLang === 'ar' ? false : isEn;

    const dayNamesAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const dayNamesEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = isWidgetEn ? dayNamesEn[new Date().getDay()] : dayNamesAr[new Date().getDay()];

    const getTimestamp = (timeStr: string, offset: number, isTomorrow: boolean = false) => {
        const adjusted = applyOffset(timeStr, offset + (isSummerTimeActive ? 60 : 0));
        if (!adjusted || adjusted.includes('--')) return 0;
        const [hh, mm] = adjusted.split(':');

        const cityTimezone = localStorage.getItem('grandLocationTimezone');
        let cityNow = new Date();
        if (cityTimezone) {
            try {
                const cityTimeStr = cityNow.toLocaleString('en-US', { timeZone: cityTimezone });
                cityNow = new Date(cityTimeStr);
            } catch (e) {}
        }

        const pDate = new Date(cityNow);
        if (isTomorrow) pDate.setDate(pDate.getDate() + 1);
        pDate.setHours(parseInt(hh), parseInt(mm), 0, 0);

        return Date.now() + (pDate.getTime() - cityNow.getTime());
    };

    const rawCity = isWidgetEn
        ? ((config.location as any)?.cityGovEn || config.location?.cityGov || '').split(' - ')[0].trim()
        : ((config.location as any)?.cityGovAr || config.location?.cityGov || '').split(' - ')[0].trim();
    const localizedCity = getLocalizedLocationName(rawCity, isWidgetEn ? 'en' : 'ar');

    const gregorianMonthsMap: Record<string, string> = {
        January: 'يناير',
        February: 'فبراير',
        March: 'مارس',
        April: 'أبريل',
        May: 'مايو',
        June: 'يونيو',
        July: 'يوليو',
        August: 'أغسطس',
        September: 'سبتمبر',
        October: 'أكتوبر',
        November: 'نوفمبر',
        December: 'ديسمبر'
    };

    let localizedGregorian = currentDates.gregorian;
    if (!isWidgetEn) {
        Object.entries(gregorianMonthsMap).forEach(([enM, arM]) => {
            localizedGregorian = localizedGregorian.replace(enM, arM);
        });
    } else {
        Object.entries(gregorianMonthsMap).forEach(([enM, arM]) => {
            localizedGregorian = localizedGregorian.replace(arM, enM);
        });
    }

    let localizedHijri = currentDates.hijri;
    if (isWidgetEn) {
        localizedHijri = localizedHijri
            .replace('المحرم', 'Muharram')
            .replace('محرم', 'Muharram')
            .replace('صفر', 'Safar')
            .replace('ربيع الأول', "Rabi' 1")
            .replace('ربيع الاول', "Rabi' 1")
            .replace('ربيع الثاني', "Rabi' 2")
            .replace('ربيع الآخر', "Rabi' 2")
            .replace('جمادى الأولى', 'Jumada 1')
            .replace('جمادى الاولى', 'Jumada 1')
            .replace('جمادى الأول', 'Jumada 1')
            .replace('جمادى الاخرة', 'Jumada 2')
            .replace('جمادى الآخرة', 'Jumada 2')
            .replace('جمادى الثانية', 'Jumada 2')
            .replace('رجب', 'Rajab')
            .replace('شعبان', "Sha'ban")
            .replace('رمضان', 'Ramadan')
            .replace('شوال', 'Shawwal')
            .replace('ذو القعدة', 'Dhul-Qadah')
            .replace('ذو الحجة', 'Dhul-Hijjah');
    }

    const localizedNextName = isWidgetEn ? (PRAYER_NAMES_EN[currentNext.key] || currentNext.name) : currentNext.name;
    const firstThirdLabel = isWidgetEn ? `First Third: ${to12h(nightTimes.firstThird)}` : `أول الليل : ${to12h(nightTimes.firstThird)}`;
    const midnightLabel = isWidgetEn ? `Midnight: ${to12h(nightTimes.midnight)}` : `منتصف الليل : ${to12h(nightTimes.midnight)}`;
    const lastThirdLabel = isWidgetEn ? `Last Third: ${to12h(nightTimes.lastThird)}` : `الثلث الأخير : ${to12h(nightTimes.lastThird)}`;

    const { methodId } = getCalculationParams(new Date(), config.location, config);

    const widgetCityTz = localStorage.getItem('grandLocationTimezone');
    let widgetCityNow = new Date();
    if (widgetCityTz) {
        try {
            const cityTimeStr = widgetCityNow.toLocaleString('en-US', { timeZone: widgetCityTz });
            widgetCityNow = new Date(cityTimeStr);
        } catch (e) {}
    }

    updateAndroidWidget(
        {
            hijri: localizedHijri,
            gregorian: localizedGregorian,
            day: currentDayName,
            city: localizedCity,
            next_prayer_name: localizedNextName,
            next_prayer_id: currentNext.key.toLowerCase(),
            remaining_time: currentCountdown.split(':').slice(0, 2).join(':'),
            target_time_millis: Date.now() + (currentNext.date.getTime() - widgetCityNow.getTime()),
            base_date_millis: Date.now(),
            coordinates: {
                lat: config.location.lat,
                lng: config.location.lng
            },
            method_id: methodId,
            prayer_offsets: config.prayerOffsets,
            isSummerTime: config.isSummerTime,
            first_third: firstThirdLabel,
            midnight: midnightLabel,
            last_third: lastThirdLabel,
            app_language: isWidgetEn ? 'en' : 'ar',
            theme: {
                themeKey,
                isDark: themeKey === 'dark' || (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'))
            },
            times: {
                fajr: formatTime(currentTimes.Fajr, config.prayerOffsets.Fajr || 0),
                sunrise: formatTime(currentTimes.Sunrise, config.prayerOffsets.Sunrise || 0),
                dhuhr: formatTime(currentTimes.Dhuhr, config.prayerOffsets.Dhuhr || 0),
                asr: formatTime(currentTimes.Asr, config.prayerOffsets.Asr || 0),
                maghrib: formatTime(currentTimes.Maghrib, config.prayerOffsets.Maghrib || 0),
                isha: formatTime(currentTimes.Isha, config.prayerOffsets.Isha || 0)
            },
            times_24h: {
                fajr: formatTime24(currentTimes.Fajr, config.prayerOffsets.Fajr || 0),
                sunrise: formatTime24(currentTimes.Sunrise, config.prayerOffsets.Sunrise || 0),
                dhuhr: formatTime24(currentTimes.Dhuhr, config.prayerOffsets.Dhuhr || 0),
                asr: formatTime24(currentTimes.Asr, config.prayerOffsets.Asr || 0),
                maghrib: formatTime24(currentTimes.Maghrib, config.prayerOffsets.Maghrib || 0),
                isha: formatTime24(currentTimes.Isha, config.prayerOffsets.Isha || 0)
            },
            timestamps: {
                fajr: getTimestamp(currentTimes.Fajr, config.prayerOffsets.Fajr || 0),
                sunrise: getTimestamp(currentTimes.Sunrise, config.prayerOffsets.Sunrise || 0),
                dhuhr: getTimestamp(currentTimes.Dhuhr, config.prayerOffsets.Dhuhr || 0),
                asr: getTimestamp(currentTimes.Asr, config.prayerOffsets.Asr || 0),
                maghrib: getTimestamp(currentTimes.Maghrib, config.prayerOffsets.Maghrib || 0),
                isha: getTimestamp(currentTimes.Isha, config.prayerOffsets.Isha || 0),
                nextFajr: getTimestamp(currentTimes.Fajr, config.prayerOffsets.Fajr || 0, true),
                nextSunrise: getTimestamp(currentTimes.Sunrise, config.prayerOffsets.Sunrise || 0, true),
                nextDhuhr: getTimestamp(currentTimes.Dhuhr, config.prayerOffsets.Dhuhr || 0, true),
                nextAsr: getTimestamp(currentTimes.Asr, config.prayerOffsets.Asr || 0, true),
                nextMaghrib: getTimestamp(currentTimes.Maghrib, config.prayerOffsets.Maghrib || 0, true),
                nextIsha: getTimestamp(currentTimes.Isha, config.prayerOffsets.Isha || 0, true)
            }
        },
        config.syncWidgetTheme !== false
    );
};
