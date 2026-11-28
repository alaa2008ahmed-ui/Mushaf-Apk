import React from 'react';
import { ChevronLeft, MapPin } from 'lucide-react';
import { QiblaIcon } from '../../Qibla/QiblaIcon';
import OutdoorWeatherBadge from '../OutdoorWeatherBadge';
import { markPageAsSeen } from '../../../utils/app/badgeManager';
import { recordAppVisit } from '../../../utils/app/favoriteAppsManager';
import { AyahTickerBar } from './AyahTickerBar';
import { IsolatedHomePrayerCountdown } from './IsolatedHomePrayerCountdown';

interface HomeQuranCardProps {
  isEn: boolean;
  isNightMode: boolean;
  isBlackTheme: boolean;
  lastReadQuran: { surah: number; surahName: string; ayah: number; page: number; juz: number };
  currentAyahText: string;
  formatNumber: (n: number | string) => string;
  handleOpenQuranFromCard: () => void;
  onNavigate: (pageId: string, params?: any) => void;
  getResolvedEnglishQuranMode: (orient?: 'v' | 'h') => string;
}

export const HomeQuranCard: React.FC<HomeQuranCardProps> = ({
  isEn,
  isNightMode,
  isBlackTheme,
  lastReadQuran,
  currentAyahText,
  formatNumber,
  handleOpenQuranFromCard,
  onNavigate,
  getResolvedEnglishQuranMode,
}) => (
  <div className="w-full golden-3d-card px-4 pt-2.5 pb-4 sm:px-5 sm:pt-3 sm:pb-5 select-none flex flex-col justify-between gap-2 min-h-[148px] sm:min-h-[162px]">
    <div className="flex flex-col w-full">
      <div className="flex items-center min-w-0 w-full text-start">
        <span
          className={`card-header-title font-black transition-colors font-cairo ${
            isEn
              ? 'text-[11px] min-[380px]:text-xs sm:text-sm leading-tight whitespace-normal'
              : 'text-xs sm:text-sm truncate'
          }`}
          style={{ color: (isNightMode || isBlackTheme) ? '#FFFFFF' : '#451A03' }}
        >
          {isEn ? 'Continue Quran Recitation' : 'تابع تلاوة المصحف'}
        </span>
      </div>

      <div className="flex items-center justify-center gap-3 sm:gap-4 w-full mt-2 sm:mt-2.5">
        <button
          id="home-quran-vertical-btn"
          type="button"
          onClick={handleOpenQuranFromCard}
          className="px-4 sm:px-5 min-w-[68px] sm:min-w-[84px] py-1.5 rounded-full font-bold text-xs flex items-center justify-center shrink-0 active:scale-95 transition-all golden-3d-pill-btn cursor-pointer"
          title={isEn ? 'Vertical Reading' : 'تلاوة رأسية للمصحف'}
        >
          <span>{isEn ? 'Vertical' : 'رأسي'}</span>
        </button>
        <button
          id="home-quran-madinah-btn"
          type="button"
          onClick={() => onNavigate('quran', { from: 'modern_home', readingMode: 'madinah' })}
          className="px-4 sm:px-5 min-w-[68px] sm:min-w-[84px] py-1.5 rounded-full font-bold text-xs flex items-center justify-center shrink-0 active:scale-95 transition-all golden-3d-pill-btn cursor-pointer"
          title={isEn ? 'Madinah Mushaf (Horizontal)' : 'مصحف المدينة (أفقي)'}
        >
          <span>{isEn ? 'Madinah' : 'أفقي'}</span>
        </button>
        {!isEn && (
          <button
            id="home-quran-landscape-btn"
            type="button"
            onClick={() => onNavigate('quran-landscape', { from: 'modern_home', surah: lastReadQuran.surah, ayah: lastReadQuran.ayah, page: lastReadQuran.page, ...(isEn ? { readingMode: getResolvedEnglishQuranMode('h') } : {}) })}
            className="px-4 sm:px-5 min-w-[68px] sm:min-w-[84px] py-1.5 rounded-full font-bold text-xs flex items-center justify-center shrink-0 active:scale-95 transition-all golden-3d-pill-btn cursor-pointer"
            title={isEn ? 'Landscape Reading' : 'تلاوة عرضية للمصحف'}
          >
            <span>{isEn ? 'Landscape' : 'عرضي'}</span>
          </button>
        )}
      </div>
    </div>

    <div className="flex flex-col w-full">
      <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap text-[11px] sm:text-xs font-black w-full min-w-0 font-cairo -mb-1">
        <span className="shrink-0" style={{ color: (isNightMode || isBlackTheme) ? '#FFFFFF' : '#451A03' }}>
          {lastReadQuran.surahName} :
        </span>
        <span className="shrink-0" style={{ color: (isNightMode || isBlackTheme) ? '#FDE68A' : '#5B2605' }}>
          {isEn
            ? `( Ayah ${lastReadQuran.ayah} Juz ${lastReadQuran.juz} Page ${lastReadQuran.page} )`
            : `( الآية ${formatNumber(lastReadQuran.ayah)} الجزء ${formatNumber(lastReadQuran.juz)} الصفحة ${formatNumber(lastReadQuran.page)} )`}
        </span>
      </div>

      <AyahTickerBar
        text={currentAyahText}
        ayahNum={lastReadQuran.ayah}
        isEn={isEn}
        isNightMode={isNightMode}
        isBlackTheme={isBlackTheme}
        formatNumber={formatNumber}
      />
    </div>
  </div>
);

interface HomePrayerCardProps {
  times: Record<string, string>;
  config: any;
  isEn: boolean;
  isNightMode: boolean;
  isBlackTheme: boolean;
  isSkyTheme: boolean;
  isEmeraldTheme: boolean;
  isBurgundyTheme: boolean;
  isRefreshingLocation: boolean;
  cityDisplayName: string;
  todayHijriDisplay: string;
  formatNumber: (n: number | string) => string;
  handleRefreshLocation: (e?: React.MouseEvent) => Promise<void>;
  handleOpenPrayerTimes: () => void;
  onNavigate: (pageId: string, params?: any) => void;
}

export const HomePrayerCard: React.FC<HomePrayerCardProps> = ({
  times,
  config,
  isEn,
  isNightMode,
  isBlackTheme,
  isSkyTheme,
  isEmeraldTheme,
  isBurgundyTheme,
  isRefreshingLocation,
  cityDisplayName,
  todayHijriDisplay,
  formatNumber,
  handleRefreshLocation,
  handleOpenPrayerTimes,
  onNavigate,
}) => (
  <div className="w-full golden-3d-card p-4 sm:p-5 select-none">
    <div className="flex items-center justify-between gap-2 w-full mb-3">
      <div className="flex flex-col items-start min-w-0 max-w-[85%] text-start">
        <div
          id="home-prayer-location-section"
          className="flex items-center gap-1.5 min-w-0 max-w-full text-start p-0.5 rounded-lg"
        >
          <button
            type="button"
            onClick={handleRefreshLocation}
            disabled={isRefreshingLocation}
            className="gold-accent-icon inline-flex items-center justify-center shrink-0 cursor-pointer bg-transparent border-none p-0 outline-none active:scale-95 transition-transform"
            title={isEn ? 'Click to refresh location automatically' : 'انقر لتحديث الموقع تلقائياً'}
            aria-label={isEn ? 'Refresh location' : 'تحديث الموقع'}
          >
            <MapPin className={`w-3.5 h-3.5 text-amber-800 shrink-0 ${isRefreshingLocation ? 'animate-bounce' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleRefreshLocation}
            disabled={isRefreshingLocation}
            className="inline-flex items-center text-xs font-bold text-amber-950 hover:text-amber-800 active:scale-95 transition-all cursor-pointer bg-transparent border-none p-0 outline-none max-w-full leading-snug text-start"
            title={isEn ? 'Click to refresh location automatically' : 'انقر لتحديث الموقع تلقائياً'}
          >
            <span className="truncate">{cityDisplayName}</span>
          </button>
          <OutdoorWeatherBadge
            lat={config.location?.lat}
            lng={config.location?.lng}
            fajrTimeStr={times?.Fajr}
            ishaTimeStr={times?.Isha}
            compact={true}
          />
        </div>

        <button
          type="button"
          id="home-prayer-hijri-date-btn"
          onClick={() => onNavigate('calendar')}
          className="inline-flex items-center text-xs font-bold text-amber-900 hover:text-amber-950 active:scale-95 transition-all cursor-pointer bg-transparent border-none p-0.5 outline-none whitespace-nowrap leading-snug mt-2.5 gold-accent-text text-start rounded-lg"
          title={isEn ? 'Open Hijri Calendar' : 'فتح التقويم الهجري'}
        >
          {todayHijriDisplay}
        </button>
      </div>

      <button
        type="button"
        id="home-prayer-qibla-btn"
        onClick={() => onNavigate('qibla')}
        className="p-1 sm:p-1.5 flex items-center justify-center shrink-0 cursor-pointer hover:scale-110 active:scale-90 transition-all bg-transparent border-none outline-none rounded-xl"
        title={isEn ? 'Qibla Direction' : 'تحديد اتجاه القبلة'}
        aria-label={isEn ? 'Qibla Direction' : 'تحديد اتجاه القبلة'}
      >
        <QiblaIcon className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow-sm transition-transform hover:scale-105" />
      </button>
    </div>

    <IsolatedHomePrayerCountdown
      times={times}
      config={config}
      isEn={isEn}
      isNightMode={isNightMode}
      isBlackTheme={isBlackTheme}
      isSkyTheme={isSkyTheme}
      isEmeraldTheme={isEmeraldTheme}
      isBurgundyTheme={isBurgundyTheme}
      formatNumber={formatNumber}
      onOpenPrayerTimes={handleOpenPrayerTimes}
    />
  </div>
);

interface HomeAdhkarCardProps {
  isEn: boolean;
  isRTL: boolean;
  dir: 'rtl' | 'ltr';
  isMorning: boolean;
  isNightMode: boolean;
  isBlackTheme: boolean;
  onNavigate: (pageId: string, params?: any) => void;
}

export const HomeAdhkarCard: React.FC<HomeAdhkarCardProps> = ({
  isEn,
  isRTL,
  dir,
  isMorning,
  isNightMode,
  isBlackTheme,
  onNavigate,
}) => (
  <div className="w-full golden-3d-card p-3.5 sm:p-4 select-none">
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex flex-col min-w-0 text-start">
            <span className="card-header-title text-xs sm:text-sm font-black truncate font-cairo text-[#451A03]">
              {isEn ? 'Daily Adhkar' : 'الأذكار اليومية'}
            </span>
            <span className="text-[11px] font-medium truncate text-amber-900/85">
              {isMorning
                ? (isEn ? 'Morning Adhkar' : 'أذكار الصباح')
                : (isEn ? 'Evening Adhkar' : 'أذكار المساء')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              try {
                localStorage.setItem('adhkar_preferred_tab', isMorning ? 'morning' : 'evening');
              } catch {}
              recordAppVisit('sabah-masaa');
              onNavigate('sabah-masaa');
            }}
            className="px-3.5 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all golden-3d-pill-btn cursor-pointer"
            title={isMorning ? (isEn ? 'Morning Adhkar' : 'أذكار الصباح') : (isEn ? 'Evening Adhkar' : 'أذكار المساء')}
          >
            <span>{isMorning ? (isEn ? 'Morning' : 'أذكار الصباح') : (isEn ? 'Evening' : 'أذكار المساء')}</span>
            <ChevronLeft className={`w-3.5 h-3.5 ${isRTL ? '' : 'rotate-180'}`} />
          </button>
        </div>
      </div>

      <div className={`w-full h-px my-0.5 ${(isNightMode || isBlackTheme) ? 'bg-white/[0.07]' : 'bg-amber-300/60'}`} />

      <div className="w-full white-3d-container-card p-1 sm:p-2">
        <div
          className="grid grid-cols-5 gap-0.5 min-[360px]:gap-1 sm:gap-1.5 w-full items-start px-0.5"
          dir={dir}
        >
          {[
            {
              id: 'salah-adhkar',
              label: isEn ? 'Prayer Dhikr' : 'أذكار الصلاة',
              img: '/assets/3d_icons/icon_salah_adhkar.png',
              action: () => {
                markPageAsSeen('salah-adhkar');
                recordAppVisit('salah-adhkar');
                onNavigate('salah-adhkar');
              }
            },
            {
              id: 'sabah-masaa',
              label: isEn ? 'Adhkar' : 'الأذكار',
              img: '/assets/3d_icons/icon_sabah_masaa.png',
              action: () => {
                markPageAsSeen('sabah-masaa');
                recordAppVisit('sabah-masaa');
                onNavigate('sabah-masaa');
              }
            },
            {
              id: 'adia',
              label: isEn ? 'Supplications' : 'الأدعية',
              img: '/assets/3d_icons/icon_adia.png',
              action: () => {
                markPageAsSeen('adia');
                recordAppVisit('adia');
                onNavigate('adia');
              }
            },
            {
              id: 'hisn-muslim',
              label: isEn ? 'Hisn Al-Muslim' : 'حصن المسلم',
              img: '/assets/3d_icons/icon_hisn.png',
              action: () => {
                markPageAsSeen('hisn-muslim');
                recordAppVisit('hisn-muslim');
                onNavigate('hisn-muslim');
              }
            },
            {
              id: 'others',
              label: isEn ? 'Ruqyah Shariah' : 'الرقية الشرعية',
              img: '/assets/3d_icons/icon_ruqyah.png',
              action: () => {
                markPageAsSeen('others');
                recordAppVisit('others');
                onNavigate('others');
              }
            }
          ].map(btn => (
            <button
              key={`adhkar-3d-btn-${btn.id}`}
              type="button"
              onClick={btn.action}
              className="flex flex-col items-center justify-start p-0.5 group cursor-pointer active:scale-90 hover:scale-105 transition-all duration-200 w-full min-h-[64px] sm:min-h-[72px] select-none focus:outline-none"
            >
              <div className="w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 sm:w-12 sm:h-12 flex items-center justify-center relative shrink-0">
                <img
                  src={btn.img}
                  alt={btn.label}
                  className="w-full h-full object-contain pointer-events-none transition-transform duration-200 group-hover:scale-110 drop-shadow-[0_3px_5px_rgba(0,0,0,0.12)]"
                  loading="lazy"
                />
              </div>
              <span
                className="app-name-label text-[8px] min-[340px]:text-[8.5px] min-[370px]:text-[9px] min-[410px]:text-[10px] sm:text-[11px] font-black font-cairo text-center mt-1 leading-none tracking-tighter select-none whitespace-nowrap w-full"
                style={{
                  color: isNightMode ? '#FFFFFF' : '#1C1917',
                  textShadow: isNightMode ? 'none' : '0 1px 1px rgba(255,255,255,0.9)'
                }}
                title={btn.label}
              >
                {btn.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
);
