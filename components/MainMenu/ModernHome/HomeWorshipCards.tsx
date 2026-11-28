import React from 'react';
import { Check, ChevronDown, ChevronLeft, RotateCcw } from 'lucide-react';
import moment from 'moment-hijri';
import { toArabic } from '../../QuranReader/constants';
import { DEFAULT_PHRASES } from '../../../data/adhkarAndDuas/tasbeehData';
import { getPhraseDisplay } from '../../../utils/prayerAndWorship/tasbeehTranslations';

interface HomeTrackerCardProps {
  isEn: boolean;
  isRTL: boolean;
  isNightMode: boolean;
  isBlackTheme: boolean;
  completedPrayersCount: number;
  totalDailyProgress: number;
  todayHabits: any;
  dailyWirdStatus: { isDone: boolean; hasPlan: boolean; prefix: string; highlight: string };
  formatNumber: (n: number | string) => string;
  handleTogglePrayer: (e: React.MouseEvent, key: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha') => void;
  onNavigate: (pageId: string, params?: any) => void;
}

export const HomeTrackerCard: React.FC<HomeTrackerCardProps> = ({
  isEn,
  isRTL,
  isNightMode,
  isBlackTheme,
  completedPrayersCount,
  totalDailyProgress,
  todayHabits,
  dailyWirdStatus,
  formatNumber,
  handleTogglePrayer,
  onNavigate,
}) => (
  <div className="w-full golden-3d-card p-4 sm:p-5 select-none">
    <div className="flex items-center justify-between w-full mb-3.5">
      <div className="flex flex-col text-start">
        <span className="card-header-title text-xs sm:text-sm font-bold text-[#451A03] dark:text-amber-100 font-cairo">
          {isEn ? 'Five Daily Prayers Tracker' : 'مربي الصلوات الخمس'}
        </span>
        <span className="text-[11px] text-amber-900/85 dark:text-amber-200/80 font-medium">
          {isEn
            ? `Completed ${completedPrayersCount} of 5`
            : `أنجزت ${formatNumber(completedPrayersCount)} من ٥ صلوات`}
        </span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <span
          className="text-sm sm:text-base font-black text-[#451A03] dark:text-amber-100 shrink-0 font-cairo select-none px-1"
          title={isEn ? 'Total Daily Progress Percentage' : 'النسبة المئوية الإجمالية'}
          dir="ltr"
        >
          {isEn ? `${totalDailyProgress}%` : `%${formatNumber(totalDailyProgress)}`}
        </span>

        <button
          type="button"
          onClick={() => onNavigate('habit-tracker')}
          className="px-3.5 py-1.5 rounded-full golden-3d-pill-btn font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-xs shrink-0"
        >
          <span>{isEn ? 'Habit Tracker' : 'مربي العبادات'}</span>
          <ChevronLeft className={`w-3.5 h-3.5 ${isRTL ? '' : 'rotate-180'}`} />
        </button>
      </div>
    </div>

    <div className="grid grid-cols-5 gap-1.5 sm:gap-2 my-2">
      {[
        { key: 'fajr', label: isEn ? 'Fajr' : 'الفجر', iconSrc: '/assets/3d_icons/icon_prayer_fajr.png' },
        { key: 'dhuhr', label: isEn ? 'Dhuhr' : 'الظهر', iconSrc: '/assets/3d_icons/icon_prayer_dhuhr.png' },
        { key: 'asr', label: isEn ? 'Asr' : 'العصر', iconSrc: '/assets/3d_icons/icon_prayer_asr.png' },
        { key: 'maghrib', label: isEn ? 'Maghrib' : 'المغرب', iconSrc: '/assets/3d_icons/icon_prayer_maghrib.png' },
        { key: 'isha', label: isEn ? 'Isha' : 'العشاء', iconSrc: '/assets/3d_icons/icon_prayer_isha.png' },
      ].map((item) => {
        const isDone = !!todayHabits.prayers?.[item.key as keyof typeof todayHabits.prayers];
        return (
          <button
            key={item.key}
            type="button"
            onClick={(e) => handleTogglePrayer(e, item.key as any)}
            className={`group flex flex-col items-center justify-between p-1.5 sm:p-2.5 rounded-2xl transition-all duration-150 active:scale-90 cursor-pointer relative white-3d-card-btn min-h-[88px] sm:min-h-[96px] ${
              isDone
                ? ((isNightMode || isBlackTheme) ? 'prayer-card-done' : 'ring-2 ring-emerald-500/80 shadow-md')
                : ''
            }`}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 relative flex items-center justify-center my-auto">
              <img
                src={item.iconSrc}
                alt={item.label}
                className={`w-full h-full object-contain pointer-events-none transition-transform duration-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.12)] ${
                  isDone ? 'scale-105' : 'group-hover:scale-105'
                }`}
                loading="lazy"
              />
              {isDone && (
                <div className="prayer-done-badge absolute -top-1 -right-1 w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md border-1.5 border-white animate-in zoom-in-75 duration-150">
                  <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                </div>
              )}
            </div>
            <span
              className="prayer-name-label text-[11px] sm:text-xs font-black tracking-tight font-cairo select-none mt-0.5"
              style={{
                color: (isNightMode || isBlackTheme) ? '#000000' : '#1C1917',
                WebkitTextFillColor: (isNightMode || isBlackTheme) ? '#000000' : '#1C1917',
                textShadow: (isNightMode || isBlackTheme) ? 'none' : '0 1px 1px rgba(255,255,255,0.8)'
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>

    <div className="flex items-center justify-between gap-2 text-xs font-semibold pt-2.5 mt-2 border-t border-amber-300/60">
      <div className="flex flex-col items-start gap-0.5 min-w-0 text-start">
        <span className="text-amber-950 dark:text-amber-100 font-bold leading-snug">
          {isEn ? `Daily Progress: ` : `الإنجاز اليومي: `}
          <span className="gold-accent-text font-extrabold" dir="ltr">{isEn ? `${totalDailyProgress}%` : `%${formatNumber(totalDailyProgress)}`}</span>
        </span>
        <button
          type="button"
          onClick={() => onNavigate('daily-wird')}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-900/85 dark:text-amber-200/80 hover:text-amber-950 transition-colors bg-transparent border-none p-0 outline-none cursor-pointer truncate max-w-full"
          title={isEn ? 'Open Daily Quran Wird' : 'فتح الورد القرآني اليومي'}
        >
          {dailyWirdStatus.prefix && (
            <span>{dailyWirdStatus.prefix}</span>
          )}
          <span className={`font-extrabold gold-accent-text ${dailyWirdStatus.isDone ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-950 dark:text-amber-100'}`}>
            {dailyWirdStatus.highlight}
          </span>
        </button>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => onNavigate('daily-wird')}
          className="px-3.5 py-1.5 rounded-full golden-3d-pill-btn font-bold text-xs flex items-center gap-1.5 shrink-0 active:scale-95 transition-all cursor-pointer shadow-xs"
          title={isEn ? 'Daily Quran Wird' : 'متابعة الورد القرآني'}
        >
          <span>{isEn ? 'Daily Wird' : 'متابعة الورد القرآني'}</span>
          <ChevronLeft className={`w-3.5 h-3.5 ${isRTL ? '' : 'rotate-180'}`} />
        </button>
      </div>
    </div>
  </div>
);

interface HomeQuickTasbeehCardProps {
  showQuickTasbeeh: boolean;
  isEn: boolean;
  isRTL: boolean;
  language: string;
  isNightMode: boolean;
  isBlackTheme: boolean;
  isSkyTheme: boolean;
  isEmeraldTheme: boolean;
  isBurgundyTheme: boolean;
  quickCount: number;
  setQuickCount: React.Dispatch<React.SetStateAction<number>>;
  selectedQuickPhraseText: string;
  setSelectedQuickPhraseText: React.Dispatch<React.SetStateAction<string>>;
  quickTarget: number;
  setQuickTarget: React.Dispatch<React.SetStateAction<number>>;
  totalTodayTasbeeh: number;
  setTotalTodayTasbeeh: React.Dispatch<React.SetStateAction<number>>;
  isDhikrMenuOpen: boolean;
  setIsDhikrMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isTargetMenuOpen: boolean;
  setIsTargetMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  getQuickTasbeehPhrases: () => { id: number; text: string }[];
  onNavigate: (pageId: string, params?: any) => void;
}

export const HomeQuickTasbeehCard: React.FC<HomeQuickTasbeehCardProps> = ({
  showQuickTasbeeh,
  isEn,
  isRTL,
  language,
  isNightMode,
  isBlackTheme,
  isSkyTheme,
  isEmeraldTheme,
  isBurgundyTheme,
  quickCount,
  setQuickCount,
  selectedQuickPhraseText,
  setSelectedQuickPhraseText,
  quickTarget,
  setQuickTarget,
  totalTodayTasbeeh,
  setTotalTodayTasbeeh,
  isDhikrMenuOpen,
  setIsDhikrMenuOpen,
  isTargetMenuOpen,
  setIsTargetMenuOpen,
  getQuickTasbeehPhrases,
  onNavigate,
}) => {
  if (!showQuickTasbeeh) return null;

  const availablePhrases = getQuickTasbeehPhrases();
  const currentDisplayPhrase = selectedQuickPhraseText || (availablePhrases[0]?.text || DEFAULT_PHRASES[0].text);

  const handleIncrementQuick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (quickCount >= quickTarget) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate([150, 80, 150]); } catch {}
      }
      return;
    }

    const newCount = quickCount + 1;
    setQuickCount(newCount);
    setTotalTodayTasbeeh(prev => prev + 1);

    try {
      localStorage.setItem('quick_tasbeeh_home_count', String(newCount));
      const todayStr = moment().format('YYYY-MM-DD');
      const savedSettings = localStorage.getItem('mushaf_tasbeeh_settings');
      const settings = savedSettings ? JSON.parse(savedSettings) : {};
      const dailyStats = settings.dailyStats || [];
      const todayIdx = dailyStats.findIndex((s: any) => s.date === todayStr);
      if (todayIdx >= 0) {
        dailyStats[todayIdx].count += 1;
      } else {
        dailyStats.push({ date: todayStr, count: 1 });
      }
      settings.dailyStats = dailyStats;
      localStorage.setItem('mushaf_tasbeeh_settings', JSON.stringify(settings));
    } catch (err) {}

    if (newCount === quickTarget) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate([120, 60, 120, 60, 200]); } catch {}
      }
    } else {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(30); } catch {}
      }
    }
  };

  const handleResetQuick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuickCount(0);
    try {
      localStorage.setItem('quick_tasbeeh_home_count', '0');
    } catch {}
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(40); } catch {}
    }
  };

  return (
    <div
      id="modern-card-container-quick-tasbeeh"
      className={`w-full golden-3d-card p-4 sm:p-5 select-none transition-all duration-300 relative ${
        isDhikrMenuOpen || isTargetMenuOpen ? 'z-50' : 'z-20'
      }`}
    >
      <div className="flex items-center justify-between w-full mb-3">
        <div className="flex flex-col text-start">
          <span className="card-header-title text-xs sm:text-sm font-bold text-[#451A03] dark:text-amber-100 font-cairo">
            {isEn ? 'Quick Tasbeeh & Instant Dhikr' : 'التسبيح السريع والذِّكر اللحظي'}
          </span>
          <span className="text-[11px] text-amber-900/85 dark:text-amber-200/80 font-medium mt-0.5">
            {isEn
              ? `Today's total: ${totalTodayTasbeeh} tasbeehs`
              : `إجمالي تسبيحات اليوم: ${toArabic(totalTodayTasbeeh)} تسبيحة`}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3 relative z-30">
        <div className="relative flex-1 min-w-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsDhikrMenuOpen(prev => !prev);
              setIsTargetMenuOpen(false);
            }}
            className="w-full py-2 px-3 rounded-xl white-3d-card-btn font-bold text-xs flex items-center justify-between transition-all active:scale-[0.99] cursor-pointer hover:brightness-[1.02] shadow-xs"
          >
            <span className="truncate font-amiri text-xs sm:text-sm font-bold text-[#1C1917] dark:text-amber-100">
              {getPhraseDisplay(currentDisplayPhrase, language)}
            </span>
            <ChevronDown className={`w-4 h-4 shrink-0 text-[#1C1917] dark:text-amber-200 transition-transform duration-200 ${isDhikrMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDhikrMenuOpen && (
            <div
              className={`absolute z-50 top-full mt-1.5 w-full rounded-2xl shadow-2xl p-1.5 space-y-1 max-h-56 overflow-y-auto font-cairo border ${
                isNightMode || isBlackTheme
                  ? 'bg-zinc-900/95 border-zinc-700/80 text-zinc-100'
                  : isSkyTheme
                    ? 'bg-sky-50/95 border-sky-300/60 text-sky-950'
                    : isEmeraldTheme
                      ? 'bg-emerald-50/95 border-emerald-300/60 text-emerald-950'
                      : isBurgundyTheme
                        ? 'bg-rose-50/95 border-rose-300/60 text-rose-950'
                        : 'bg-amber-50/95 border-amber-400/60 text-amber-950'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {availablePhrases.map((p) => {
                const isSelected = p.text === currentDisplayPhrase;
                return (
                  <button
                    key={`dhikr-option-${p.id}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedQuickPhraseText(p.text);
                      try { localStorage.setItem('quick_tasbeeh_selected_phrase', p.text); } catch {}
                      setIsDhikrMenuOpen(false);
                    }}
                    className={`w-full text-start px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? (isSkyTheme ? 'bg-sky-600 text-white shadow-xs' : isEmeraldTheme ? 'bg-emerald-600 text-white shadow-xs' : isBurgundyTheme ? 'bg-rose-800 text-white shadow-xs' : 'bg-amber-600 text-white shadow-xs')
                        : (isNightMode || isBlackTheme ? 'text-amber-100 hover:bg-zinc-800' : isSkyTheme ? 'text-sky-950 hover:bg-sky-100' : isEmeraldTheme ? 'text-emerald-950 hover:bg-emerald-100' : isBurgundyTheme ? 'text-rose-950 hover:bg-rose-100' : 'text-amber-950 hover:bg-amber-100')
                    }`}
                  >
                    <span className="font-amiri text-xs sm:text-sm truncate">
                      {getPhraseDisplay(p.text, language)}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="relative w-28 sm:w-32 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsTargetMenuOpen(prev => !prev);
              setIsDhikrMenuOpen(false);
            }}
            className="w-full py-2 px-2.5 rounded-xl white-3d-card-btn font-bold text-xs flex items-center justify-between transition-all active:scale-[0.99] cursor-pointer hover:brightness-[1.02] shadow-xs"
          >
            <span className="truncate font-cairo text-[#1C1917] dark:text-amber-100">
              {isEn ? `${quickTarget}` : `${toArabic(quickTarget)}`}
            </span>
            <ChevronDown className={`w-4 h-4 shrink-0 text-[#1C1917] dark:text-amber-200 transition-transform duration-200 ${isTargetMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isTargetMenuOpen && (
            <div
              className={`absolute z-50 top-full mt-1.5 w-full rounded-2xl shadow-2xl p-1.5 space-y-1 font-cairo border ${
                isNightMode || isBlackTheme
                  ? 'bg-zinc-900/95 border-zinc-700/80 text-zinc-100'
                  : isSkyTheme
                    ? 'bg-sky-50/95 border-sky-300/60 text-sky-950'
                    : isEmeraldTheme
                      ? 'bg-emerald-50/95 border-emerald-300/60 text-emerald-950'
                      : isBurgundyTheme
                        ? 'bg-rose-50/95 border-rose-300/60 text-rose-950'
                        : 'bg-amber-50/95 border-amber-400/60 text-amber-950'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {[33, 50, 99, 100].map((num) => {
                const isSelected = num === quickTarget;
                return (
                  <button
                    key={`target-option-${num}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setQuickTarget(num);
                      try { localStorage.setItem('quick_tasbeeh_target', String(num)); } catch {}
                      setIsTargetMenuOpen(false);
                    }}
                    className={`w-full text-center px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? (isSkyTheme ? 'bg-sky-600 text-white shadow-xs' : isEmeraldTheme ? 'bg-emerald-600 text-white shadow-xs' : isBurgundyTheme ? 'bg-rose-800 text-white shadow-xs' : 'bg-amber-600 text-white shadow-xs')
                        : (isNightMode || isBlackTheme ? 'text-amber-100 hover:bg-zinc-800' : isSkyTheme ? 'text-sky-950 hover:bg-sky-100' : isEmeraldTheme ? 'text-emerald-950 hover:bg-emerald-100' : isBurgundyTheme ? 'text-rose-950 hover:bg-rose-100' : 'text-amber-950 hover:bg-amber-100')
                    }`}
                  >
                    <span>{isEn ? num : toArabic(num)}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="w-full text-center py-2.5 px-3 mb-3 rounded-xl white-3d-card-btn shadow-xs select-none">
        <p className="text-sm sm:text-base font-bold text-[#1C1917] dark:text-amber-100 font-amiri leading-relaxed">
          {getPhraseDisplay(currentDisplayPhrase, language)}
        </p>
      </div>

      <div className="flex items-center justify-between gap-2.5 my-1">
        <button
          type="button"
          onClick={handleIncrementQuick}
          className={`flex-1 min-w-0 py-2 sm:py-2.5 px-3 rounded-xl sm:rounded-2xl golden-3d-btn font-extrabold text-white flex items-center justify-center active:scale-95 transition-all duration-150 cursor-pointer shadow-md relative overflow-hidden group ${
            quickCount >= quickTarget ? 'ring-2 ring-emerald-500' : ''
          }`}
          title={isEn ? 'Tap to Tasbeeh' : 'انقر للتسبيح'}
        >
          <span
            className="text-lg sm:text-xl font-black font-cairo tracking-wider drop-shadow-md leading-none py-0.5 truncate inline-flex items-center justify-center gap-1.5"
            dir="ltr"
          >
            <span>{isEn ? quickCount : toArabic(quickCount)}</span>
            <span className="opacity-75 mx-0.5">/</span>
            <span>{isEn ? quickTarget : toArabic(quickTarget)}</span>
          </span>
        </button>

        <button
          type="button"
          onClick={handleResetQuick}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full white-3d-card-btn flex items-center justify-center text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 active:scale-90 transition-all cursor-pointer shrink-0"
          title={isEn ? 'Reset Counter' : 'إعادة ضبط العداد'}
        >
          <RotateCcw className="w-4 h-4 stroke-[2.5]" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('tasbeeh')}
          className="px-3.5 py-1.5 rounded-full golden-3d-pill-btn font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-xs shrink-0"
          title={isEn ? 'Open Full Tasbeeh' : 'فتح السبحة'}
        >
          <span>{isEn ? 'Tasbeeh' : 'السبحة'}</span>
          <ChevronLeft className={`w-3.5 h-3.5 ${isRTL ? '' : 'rotate-180'}`} />
        </button>
      </div>
    </div>
  );
};
