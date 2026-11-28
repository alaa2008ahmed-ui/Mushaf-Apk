import { Coordinates, CalculationMethod, PrayerTimes as AdhanPrayerTimes, Madhab, HighLatitudeRule } from 'adhan';
import moment from 'moment-hijri';
import { prayerNamesAr } from '../../data/prayerAndApp/prayerTimesData';
import { checkSupportsDST } from '../../utils/prayerAndWorship/prayerTimesUtils';
import { PRAYER_NAMES_EN } from '../../utils/prayerAndWorship/prayerTimesTranslations';
import { PrayerConfig } from './prayerTypesAndConfig';

export const fetchWithTimeout = async (url: string, options: any = {}, timeout = 5000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (e) {
        clearTimeout(id);
        throw e;
    }
};

export const applyOffset = (timeStr: string, offsetMins: number) => {
    if (!timeStr || timeStr.includes('--')) return '--:--';
    const [h, m] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(h), parseInt(m), 0);
    date.setMinutes(date.getMinutes() + (offsetMins || 0));
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

export const getCalculationParams = (date: Date, locationData?: any, userConfig?: Partial<PrayerConfig>) => {
    let params = CalculationMethod.MuslimWorldLeague();
    let methodId = 3; // MWL
    let detectedMethodId = 'MuslimWorldLeague';
    let detectedNameAr = 'رابطة العالم الإسلامي';
    let detectedNameEn = 'Muslim World League';

    const country = locationData?.fullCountry || '';
    const code = locationData?.combinedCode || '';

    // Auto-detection based on country code/name
    if (code.startsWith('+20') || country.includes('مصر')) {
        detectedMethodId = 'Egyptian';
        detectedNameAr = 'الهيئة المصرية العامة للمساحة';
        detectedNameEn = 'Egyptian General Authority of Survey';
    } else if (code.startsWith('+966') || country.includes('السعودية')) {
        detectedMethodId = 'UmmAlQura';
        detectedNameAr = 'جامعة أم القرى - مكة المكرمة';
        detectedNameEn = 'Umm Al-Qura University, Makkah';
    } else if (code.startsWith('+971') || country.includes('الإمارات')) {
        detectedMethodId = 'Dubai';
        detectedNameAr = 'دائرة الشؤون الإسلامية بدبي';
        detectedNameEn = 'Dubai Islamic Affairs';
    } else if (code.startsWith('+965') || country.includes('الكويت')) {
        detectedMethodId = 'Kuwait';
        detectedNameAr = 'وزارة الأوقاف والشؤون الإسلامية - الكويت';
        detectedNameEn = 'Ministry of Awqaf - Kuwait';
    } else if (code.startsWith('+974') || country.includes('قطر')) {
        detectedMethodId = 'Qatar';
        detectedNameAr = 'وزارة الأوقاف والشؤون الإسلامية - قطر';
        detectedNameEn = 'Ministry of Awqaf - Qatar';
    } else if (code.startsWith('+1') || country.includes('أمريكا') || country.includes('كندا')) {
        detectedMethodId = 'NorthAmerica';
        detectedNameAr = 'الجمعية الإسلامية لأمريكا الشمالية (ISNA)';
        detectedNameEn = 'Islamic Society of North America (ISNA)';
    } else if (code.startsWith('+90') || country.includes('تركيا')) {
        detectedMethodId = 'Turkey';
        detectedNameAr = 'رئاسة الشؤون الدينية التركية (Diyanet)';
        detectedNameEn = 'Diyanet İşleri Başkanlığı, Turkey';
    } else if (code.startsWith('+92') || country.includes('باكستان')) {
        detectedMethodId = 'Karachi';
        detectedNameAr = 'جامعة العلوم الإسلامية بكراتشي';
        detectedNameEn = 'University of Islamic Sciences, Karachi';
    }

    const effectiveMethodKey = (userConfig?.calculationMethod && userConfig.calculationMethod !== 'auto')
        ? userConfig.calculationMethod
        : detectedMethodId;

    switch (effectiveMethodKey) {
        case 'Egyptian':
            params = CalculationMethod.Egyptian();
            methodId = 5;
            break;
        case 'UmmAlQura':
            params = CalculationMethod.UmmAlQura();
            methodId = 4;
            break;
        case 'Dubai':
            params = CalculationMethod.Dubai();
            methodId = 16;
            break;
        case 'Kuwait':
            params = CalculationMethod.Kuwait();
            methodId = 9;
            break;
        case 'Qatar':
            params = CalculationMethod.Qatar();
            methodId = 10;
            break;
        case 'NorthAmerica':
            params = CalculationMethod.NorthAmerica();
            methodId = 2;
            break;
        case 'Turkey':
            params = CalculationMethod.Turkey();
            methodId = 13;
            break;
        case 'Karachi':
            params = CalculationMethod.Karachi();
            methodId = 1;
            break;
        case 'Tehran':
            params = CalculationMethod.Tehran();
            methodId = 7;
            break;
        case 'Singapore':
            params = CalculationMethod.Singapore();
            methodId = 11;
            break;
        case 'MoonsightingCommittee':
            params = CalculationMethod.MoonsightingCommittee();
            methodId = 15;
            break;
        case 'MuslimWorldLeague':
        default:
            params = CalculationMethod.MuslimWorldLeague();
            methodId = 3;
            break;
    }

    // 2. Asr Madhab configuration (Shafi'i/Majority vs Hanafi)
    const asrMadhab = userConfig?.asrMadhab || 'shafi';
    if (asrMadhab === 'hanafi') {
        params.madhab = Madhab.Hanafi;
    } else {
        params.madhab = Madhab.Shafi;
    }

    // 3. High Latitude Rule configuration
    const highLatRule = userConfig?.highLatitudeRule || 'auto';
    if (highLatRule === 'middleofthenight') {
        params.highLatitudeRule = HighLatitudeRule.MiddleOfTheNight;
    } else if (highLatRule === 'seventhofthenight') {
        params.highLatitudeRule = HighLatitudeRule.SeventhOfTheNight;
    } else if (highLatRule === 'twilightangle') {
        params.highLatitudeRule = HighLatitudeRule.TwilightAngle;
    } else if (highLatRule === 'auto') {
        if (locationData?.lat && Math.abs(locationData.lat) > 48) {
            const coordinates = new Coordinates(locationData.lat, locationData.lng);
            params.highLatitudeRule = HighLatitudeRule.recommended(coordinates);
        }
    }

    return {
        params,
        methodId,
        detectedMethodId,
        detectedNameAr,
        detectedNameEn,
        effectiveMethodKey,
        asrMadhab,
        highLatRule
    };
};

export const computeTimesSync = (
    locationData: any,
    date: Date = new Date(),
    isEn: boolean = false,
    userConfig?: Partial<PrayerConfig>
) => {
    if (!locationData || typeof locationData.lat !== 'number' || typeof locationData.lng !== 'number') {
        return null;
    }
    try {
        let effectiveConfig = userConfig;
        if (!effectiveConfig && typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('prayerFinal_v34');
                if (saved) effectiveConfig = JSON.parse(saved);
            } catch (e) {}
        }
        const { params } = getCalculationParams(date, locationData, effectiveConfig);
        const coordinates = new Coordinates(locationData.lat, locationData.lng);
        const prayerTimes = new AdhanPrayerTimes(coordinates, date, params);

        const formatTime = (d: Date) => {
            return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
        };

        const isRamadan = moment(date).iMonth() === 8;
        const country = locationData?.fullCountry || '';
        const code = locationData?.combinedCode || '';
        let ishaTime = prayerTimes.isha;
        if (isRamadan && (code.startsWith('+966') || country.includes('السعودية') || code.startsWith('+974') || country.includes('قطر'))) {
            const diffMinutes = (ishaTime.getTime() - prayerTimes.maghrib.getTime()) / 60000;
            if (diffMinutes < 110) {
                ishaTime = new Date(ishaTime.getTime() + 30 * 60000);
            }
        }

        const timings = {
            Fajr: formatTime(prayerTimes.fajr),
            Sunrise: formatTime(prayerTimes.sunrise),
            Dhuhr: formatTime(prayerTimes.dhuhr),
            Asr: formatTime(prayerTimes.asr),
            Maghrib: formatTime(prayerTimes.maghrib),
            Isha: formatTime(ishaTime)
        };

        let hijriDate = '';
        let gregorianDate = '';
        try {
            const hijriFormatter = new Intl.DateTimeFormat(isEn ? 'en-US-u-ca-islamic' : 'ar-SA-u-ca-islamic', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            hijriDate = hijriFormatter.format(date);
        } catch {
            hijriDate = moment(date).format('iYYYY/iM/iD');
        }

        try {
            const gregorianFormatter = new Intl.DateTimeFormat(isEn ? 'en-US' : 'ar-EG', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            gregorianDate = gregorianFormatter.format(date);
        } catch {
            gregorianDate = date.toLocaleDateString();
        }

        return {
            timings,
            dates: {
                hijri: hijriDate,
                gregorian: gregorianDate
            }
        };
    } catch (e) {
        return null;
    }
};

export const fetchAladhanTimesOnline = async (
    locationData: any,
    date: Date,
    isEn: boolean,
    config: Partial<PrayerConfig>
): Promise<{ timings: Record<string, string>; dates: { hijri: string; gregorian: string }; timezone?: string } | null> => {
    const { lat, lng } = locationData;
    const { methodId, asrMadhab, highLatRule } = getCalculationParams(date, locationData, config);
    const timestamp = Math.floor(date.getTime() / 1000);
    const schoolParam = asrMadhab === 'hanafi' ? 1 : 0;
    let latAdjParam = 0;
    if (highLatRule === 'middleofthenight') latAdjParam = 1;
    else if (highLatRule === 'seventhofthenight') latAdjParam = 2;
    else if (highLatRule === 'twilightangle') latAdjParam = 3;
    else if (highLatRule === 'auto' && Math.abs(lat) > 48) latAdjParam = 3;

    let apiUrl = `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${lng}&method=${methodId}&school=${schoolParam}`;
    if (latAdjParam > 0) {
        apiUrl += `&latitudeAdjustmentMethod=${latAdjParam}`;
    }

    const apiRes = await fetchWithTimeout(apiUrl, {}, 5000);
    const apiData = await apiRes.json();

    if (apiData && apiData.code === 200) {
        const data = apiData.data;
        const timings = {
            Fajr: data.timings.Fajr,
            Sunrise: data.timings.Sunrise,
            Dhuhr: data.timings.Dhuhr,
            Asr: data.timings.Asr,
            Maghrib: data.timings.Maghrib,
            Isha: data.timings.Isha
        };

        const gregorianMonthsArMap: Record<string, string> = {
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
        const gMonthRaw = data.date.gregorian.month.en;
        const gMonthLocalized = isEn ? gMonthRaw : (gregorianMonthsArMap[gMonthRaw] || data.date.gregorian.month.ar || gMonthRaw);
        const hijriDate = `${data.date.hijri.day} ${data.date.hijri.month.ar} ${data.date.hijri.year}`;
        const gregorianDate = `${data.date.gregorian.day} ${gMonthLocalized} ${data.date.gregorian.year}`;

        return {
            timings,
            dates: { hijri: hijriDate, gregorian: gregorianDate },
            timezone: data.meta?.timezone
        };
    }
    return null;
};

export const getCityCurrentTime = (): Date => {
    const cityTimezone = localStorage.getItem('grandLocationTimezone');
    let now = new Date();
    if (cityTimezone) {
        try {
            const cityTimeStr = now.toLocaleString('en-US', { timeZone: cityTimezone });
            now = new Date(cityTimeStr);
        } catch (e) {
            console.warn('Timezone conversion failed:', e);
        }
    }
    return now;
};

export const findNextPrayer = (
    times: Record<string, string>,
    config: PrayerConfig,
    isEn: boolean
): { key: string; date: Date; name: string; cityNow: Date } | null => {
    if (!Object.keys(times).length) return null;

    const now = getCityCurrentTime();
    const keys = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    let found: { key: string; date: Date; name: string; cityNow: Date } | null = null;

    const supportsDST = checkSupportsDST(config.location.combinedCode, config.location.fullCountry);
    const isSummerTimeActive = config.isSummerTime && supportsDST;

    for (const key of keys) {
        const totalOffset = (config.prayerOffsets[key] || 0) + (isSummerTimeActive ? 60 : 0);
        const adjustedTime = applyOffset(times[key], totalOffset);
        if (adjustedTime && !adjustedTime.includes('--')) {
            const [h, m] = adjustedTime.split(':');
            const pDate = new Date(now);
            pDate.setHours(parseInt(h), parseInt(m), 0, 0);

            if (pDate > now) {
                found = {
                    key,
                    date: pDate,
                    name: isEn ? (PRAYER_NAMES_EN[key] || key) : prayerNamesAr[key],
                    cityNow: now
                };
                break;
            }
        }
    }

    if (!found && times.Fajr) {
        const totalOffset = (config.prayerOffsets.Fajr || 0) + (isSummerTimeActive ? 60 : 0);
        const fajrTime = applyOffset(times.Fajr, totalOffset);
        if (fajrTime && !fajrTime.includes('--')) {
            const [h, m] = fajrTime.split(':');
            const pDate = new Date(now);
            pDate.setDate(pDate.getDate() + 1);
            pDate.setHours(parseInt(h), parseInt(m), 0, 0);
            found = {
                key: 'Fajr',
                date: pDate,
                name: isEn ? (PRAYER_NAMES_EN['Fajr'] || 'Fajr') : prayerNamesAr['Fajr'],
                cityNow: now
            };
        }
    }

    return found;
};
