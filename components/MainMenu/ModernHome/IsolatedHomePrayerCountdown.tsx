import React, { useState, useEffect } from 'react';
import { computeTimesSync } from '../../../context/PrayerTimesContext';
import { checkSupportsDST, applyOffset } from '../../../utils/prayerAndWorship/prayerTimesUtils';
import { getCityNowDate } from './modernHomeConstants';

interface IsolatedHomePrayerCountdownProps {
  times: Record<string, string>;
  config: any;
  isEn: boolean;
  isNightMode: boolean;
  isBlackTheme: boolean;
  isSkyTheme: boolean;
  isEmeraldTheme: boolean;
  isBurgundyTheme: boolean;
  formatNumber: (n: number | string) => string;
  onOpenPrayerTimes: () => void;
}

export const IsolatedHomePrayerCountdown: React.FC<IsolatedHomePrayerCountdownProps> = React.memo(({
  times,
  config,
  isEn,
  isNightMode,
  isBlackTheme,
  isSkyTheme,
  isEmeraldTheme,
  isBurgundyTheme,
  formatNumber,
  onOpenPrayerTimes,
}) => {
  const [nowDate, setNowDate] = useState<Date>(() => getCityNowDate());

  useEffect(() => {
    const timer = setInterval(() => {
      setNowDate(getCityNowDate());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getPrayerDateTime = (key: string, baseDate: Date) => {
    let rawTime = times?.[key];
    if (!rawTime || rawTime.includes('--')) {
      const fallbackComputed = computeTimesSync(config.location, baseDate, isEn);
      if (fallbackComputed?.timings && (fallbackComputed.timings as any)[key]) {
        rawTime = (fallbackComputed.timings as any)[key];
      }
    }
    if (!rawTime || rawTime.includes('--')) return null;

    const supportsDST = checkSupportsDST(config.location?.combinedCode, config.location?.fullCountry);
    const isSummerTimeActive = config.isSummerTime && supportsDST;
    const totalOffset = (config.prayerOffsets?.[key] || 0) + (isSummerTimeActive ? 60 : 0);
    const adjustedTime = applyOffset(rawTime, totalOffset);
    if (!adjustedTime || adjustedTime.includes('--')) return null;
    const [hours, minutes] = adjustedTime.split(':').map(Number);
    const date = new Date(baseDate);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const formatTime12 = (date: Date | null) => {
    if (!date) return isEn ? '--:--' : formatNumber('--:--');
    let h = date.getHours();
    const m = date.getMinutes().toString().padStart(2, '0');
    const isPM = h >= 12;
    h = h % 12 || 12;
    const hStr = h.toString().padStart(2, '0');
    if (isEn) {
      return `${hStr}:${m} ${isPM ? 'PM' : 'AM'}`;
    }
    const formattedDigits = formatNumber(`${hStr}:${m}`);
    return `${formattedDigits} ${isPM ? 'م' : 'ص'}`;
  };

  const today = new Date(nowDate);
  let fajrToday = getPrayerDateTime('Fajr', today);
  let dhuhrToday = getPrayerDateTime('Dhuhr', today);
  let asrToday = getPrayerDateTime('Asr', today);
  let maghribToday = getPrayerDateTime('Maghrib', today);
  let ishaToday = getPrayerDateTime('Isha', today);

  if (!fajrToday || !dhuhrToday || !asrToday || !maghribToday || !ishaToday) {
    const fallbackLoc = config.location?.lat ? config.location : { lat: 21.4225, lng: 39.8262, city: 'Makkah', cityNameAr: 'مكة المكرمة' };
    const computed = computeTimesSync(fallbackLoc, today, isEn);
    if (computed?.timings) {
      const parsePrayerTime = (timeStr: string) => {
        const [h, m] = timeStr.split(':').map(Number);
        const d = new Date(today);
        d.setHours(h, m, 0, 0);
        return d;
      };
      fajrToday = parsePrayerTime(computed.timings.Fajr);
      dhuhrToday = parsePrayerTime(computed.timings.Dhuhr);
      asrToday = parsePrayerTime(computed.timings.Asr);
      maghribToday = parsePrayerTime(computed.timings.Maghrib);
      ishaToday = parsePrayerTime(computed.timings.Isha);
    }
  }

  let prayerData = {
    nextName: isEn ? 'Dhuhr' : 'الظهر',
    nextTimeStr: '--:--',
    prevName: isEn ? 'Fajr' : 'الفجر',
    prevTimeStr: '--:--',
    countdownStr: '--:--:--',
    progressPercent: 0,
  };

  if (fajrToday && dhuhrToday && asrToday && maghribToday && ishaToday) {
    let prevName = 'الفجر';
    let prevDate = fajrToday;
    let nextName = 'الظهر';
    let nextDate = dhuhrToday;

    if (nowDate < fajrToday) {
      const ishaYesterday = new Date(ishaToday);
      ishaYesterday.setDate(ishaYesterday.getDate() - 1);
      prevName = isEn ? 'Isha' : 'العشاء';
      prevDate = ishaYesterday;
      nextName = isEn ? 'Fajr' : 'الفجر';
      nextDate = fajrToday;
    } else if (nowDate >= fajrToday && nowDate < dhuhrToday) {
      prevName = isEn ? 'Fajr' : 'الفجر';
      prevDate = fajrToday;
      nextName = isEn ? 'Dhuhr' : 'الظهر';
      nextDate = dhuhrToday;
    } else if (nowDate >= dhuhrToday && nowDate < asrToday) {
      prevName = isEn ? 'Dhuhr' : 'الظهر';
      prevDate = dhuhrToday;
      nextName = isEn ? 'Asr' : 'العصر';
      nextDate = asrToday;
    } else if (nowDate >= asrToday && nowDate < maghribToday) {
      prevName = isEn ? 'Asr' : 'العصر';
      prevDate = asrToday;
      nextName = isEn ? 'Maghrib' : 'المغرب';
      nextDate = maghribToday;
    } else if (nowDate >= maghribToday && nowDate < ishaToday) {
      prevName = isEn ? 'Maghrib' : 'المغرب';
      prevDate = maghribToday;
      nextName = isEn ? 'Isha' : 'العشاء';
      nextDate = ishaToday;
    } else {
      const fajrTomorrow = new Date(fajrToday);
      fajrTomorrow.setDate(fajrTomorrow.getDate() + 1);
      prevName = isEn ? 'Isha' : 'العشاء';
      prevDate = ishaToday;
      nextName = isEn ? 'Fajr' : 'الفجر';
      nextDate = fajrTomorrow;
    }

    const totalDuration = nextDate.getTime() - prevDate.getTime();
    const elapsed = Math.max(0, nowDate.getTime() - prevDate.getTime());
    const progressPercent = totalDuration > 0
      ? Math.min(100, Math.max(0, (elapsed / totalDuration) * 100))
      : 0;

    const diffMs = Math.max(0, nextDate.getTime() - nowDate.getTime());
    const h = Math.floor(diffMs / 3600000);
    const m = Math.floor((diffMs % 3600000) / 60000);
    const s = Math.floor((diffMs % 60000) / 1000);
    const countdownStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

    prayerData = {
      nextName,
      nextTimeStr: formatTime12(nextDate),
      prevName,
      prevTimeStr: formatTime12(prevDate),
      countdownStr,
      progressPercent: Math.round(progressPercent),
    };
  }

  return (
    <div id="home-prayer-countdown-section" className="w-full" style={{ contain: 'layout style' }}>
      <div
        onClick={onOpenPrayerTimes}
        className="flex items-end justify-between cursor-pointer py-1"
        title={isEn ? 'Click to open full Prayer Times' : 'انقر لعرض مواقيت الصلاة'}
      >
        <div className="flex flex-col text-start">
          <span className="text-[11px] font-semibold text-amber-900/85">
            {isEn ? (
              <>
                Time to <span className="gold-accent-text font-extrabold">{prayerData.nextName}</span> Adhan
              </>
            ) : (
              <>
                الوقت المتبقي لأذان <span className="gold-accent-text font-extrabold">{prayerData.nextName}</span>
              </>
            )}
          </span>
          <span
            className="text-3xl sm:text-4xl font-cairo font-black tracking-tight text-[#451A03] tabular-nums leading-tight min-h-[2.25rem]"
            style={{ textShadow: (isNightMode || isBlackTheme) ? 'none' : '0 1px 1px rgba(255,255,255,0.8)' }}
          >
            {isEn ? prayerData.countdownStr : formatNumber(prayerData.countdownStr)}
          </span>
        </div>
        <div className="flex flex-col text-end">
          <span className="text-[11px] font-semibold text-amber-900/85">
            {isEn ? 'Adhan Time' : 'موعد الأذان'}
          </span>
          <span className="text-xl sm:text-2xl font-black text-[#5B2605] tabular-nums leading-tight">
            {prayerData.nextTimeStr}
          </span>
        </div>
      </div>

      <div
        onClick={onOpenPrayerTimes}
        className="w-full mt-3 cursor-pointer"
      >
        <div className={`w-full h-2.5 rounded-full p-0.5 overflow-hidden ${(isNightMode || isBlackTheme) ? 'bg-[#0e0e13] shadow-[inset_0_2px_4px_rgba(0,0,0,0.85),0_1px_0_rgba(255,255,255,0.08)]' : 'bg-black/[0.08] shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)]'}`}>
          <div
            className={`h-full rounded-full shadow-sm transition-all duration-1000 ease-out ${
              isBurgundyTheme
                ? 'bg-gradient-to-r from-rose-900 via-rose-800 to-rose-950'
                : isSkyTheme
                  ? 'bg-gradient-to-r from-sky-800 via-sky-700 to-sky-900'
                  : isEmeraldTheme
                    ? 'bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900'
                    : 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-500'
            }`}
            style={{ width: `${prayerData.progressPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs sm:text-[13px] font-bold text-amber-900/95 mt-1.5 px-0.5 whitespace-nowrap">
          <span className="tabular-nums">{prayerData.prevName} {prayerData.prevTimeStr}</span>
          <span className="text-amber-950 font-extrabold tabular-nums gold-accent-text">{isEn ? prayerData.progressPercent : formatNumber(prayerData.progressPercent)}%</span>
          <span className="tabular-nums">{prayerData.nextName} {prayerData.nextTimeStr}</span>
        </div>
      </div>
    </div>
  );
});
