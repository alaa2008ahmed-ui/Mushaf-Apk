import { QiblaIcon } from '../Qibla/QiblaIcon';
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Sun,
  Clock,
  BookOpen,
  Sparkles,
  ShieldCheck,
  BookMarked,
  Maximize2,
  Globe,
  HeartHandshake,
  ScrollText,
  Mic,
  Headphones,
  Brain,
  BookmarkCheck,
  CircleDot,
  Award,
  Tent,
  Star,
  CheckSquare,
  Calculator,
  CalendarDays,
} from 'lucide-react';
import { Reorder } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useSeenPages } from '../../utils/app/badgeManager';
import { usePrayerTimes } from '../../context/PrayerTimesContext';
import { useVoiceControl } from '../../context/VoiceControlContext';
import { useHabitTracker } from '../../hooks/useHabitTracker';
import { getLocalizedLocationName } from '../../utils/prayerAndWorship/prayerTimesTranslations';
import { SURAH_NAMES_AR, SURAH_NAMES_EN } from '../QuranReader/constants';
import { quranData as quranJsonData } from '../../utils/quran/quranData';
import { loadQuranEnglishTranslation, getCachedQuranEnglishTranslation, QuranEnglishSurah } from '../../utils/quran/quranTranslationHelper';
import ShareAppQrModal from './ShareAppQrModal';
import TawafCounterCard from './TawafCounterCard';
import { getTawafCounterState, subscribeTawafCounter, TawafCounterState } from '../../utils/prayerAndWorship/tawafCounterStorage';
import SmartSeasonalStrip from './SmartSeasonalStrip';
import { ISLAMIC_WISDOMS, getWisdomOfTheDay } from '../../data/prayerAndApp/wisdomData';
import { registerBackInterceptor } from '../../hooks/useBackButton';
import { useFavoriteApps } from '../../utils/app/favoriteAppsManager';
import { getActiveWirdProfile, getWirdDayRange, getWirdTotalDays, WirdProfile } from '../../services/dailyWirdNotificationService';
import { getAccurateHijriDate, HIJRI_MONTHS_AR, HIJRI_MONTHS_EN } from '../../utils/app/islamicOccasionsEngine';
import { Capacitor } from '@capacitor/core';
import { Share as CapacitorShare } from '@capacitor/share';
import { Preferences } from '@capacitor/preferences';
import moment from 'moment-hijri';
import { DEFAULT_PHRASES } from '../../data/adhkarAndDuas/tasbeehData';
import ListenQuranCard from './ListenQuranCard';
import {
  DEFAULT_MODERN_CARD_ORDER,
  MODERN_CARD_TITLES,
  ModernCardId,
  ModernHomeViewProps,
  WEB_APP_URL,
  getCityNowDate,
  getJuzForAyah,
} from './ModernHome/modernHomeConstants';
import { HomeQuranCard, HomePrayerCard, HomeAdhkarCard } from './ModernHome/HomeTopCards';
import { HomeSearchCard, HomeAppsCard } from './ModernHome/HomeSearchAndAppsCards';
import { HomeTrackerCard, HomeQuickTasbeehCard } from './ModernHome/HomeWorshipCards';
import { HomeReflectionsCard, HomeShareCard, ReorderableCardItem } from './ModernHome/HomeBottomCards';

export type { ModernCardId };
export { DEFAULT_MODERN_CARD_ORDER, MODERN_CARD_TITLES };

export const ModernHomeView: React.FC<ModernHomeViewProps> = ({
  onNavigate,
  theme,
  isBlackTheme,
  setToastMessage,
  onThisDayEvent,
  handleNextEvent,
  handleShareHighlight,
  handleCopyHighlight,
  setShowExpandedEventsModal,
  currentHistoryMemoryEvent,
  handleNextHistoryMemoryEvent,
  handleShareHistoryMemory,
  handleCopyHistoryMemory,
  setShowExpandedHistoryMemoryModal,
  upcomingEvents,
  eventIndex,
  setEventIndex,
  handleShareUpcomingEvent,
  handleCopyUpcomingEvent,
  setShowExpandedUpcomingEventModal,
  shareTextAr,
  shareTextEn,
  isEditMode = false,
}) => {
  const { language, isRTL, dir, t, formatNumber, translateEventName } = useLanguage();
  const { isNightMode, homeThemeVariant } = useTheme();
  const isEn = language === 'en';

  const isSkyTheme = !isNightMode && homeThemeVariant === 'sky';
  const isEmeraldTheme = !isNightMode && homeThemeVariant === 'emerald';
  const isBurgundyTheme = !isNightMode && homeThemeVariant === 'burgundy';

  const voiceIconColor = isNightMode
    ? '#F59E0B'
    : (isBurgundyTheme
        ? '#9f1239'
        : (isSkyTheme
            ? '#0369a1'
            : (isEmeraldTheme
                ? '#047857'
                : '#C25E00')));

  const voicePingColor = isNightMode
    ? '#FBBF24'
    : (isBurgundyTheme
        ? '#fb7185'
        : (isSkyTheme
            ? '#38BDF8'
            : (isEmeraldTheme
                ? '#34D399'
                : '#F59E0B')));

  const [tawafState, setTawafState] = useState<TawafCounterState>(() => getTawafCounterState());
  useEffect(() => {
    return subscribeTawafCounter((updated) => {
      setTawafState(updated);
    });
  }, []);

  const [showQuickTasbeeh, setShowQuickTasbeeh] = useState<boolean>(() => {
    try {
      return localStorage.getItem('show_quick_tasbeeh_home') === 'true';
    } catch {
      return false;
    }
  });

  const [quickCount, setQuickCount] = useState<number>(() => {
    try {
      const val = localStorage.getItem('quick_tasbeeh_home_count');
      return val ? parseInt(val, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  const [selectedQuickPhraseText, setSelectedQuickPhraseText] = useState<string>(() => {
    try {
      return localStorage.getItem('quick_tasbeeh_selected_phrase') || DEFAULT_PHRASES[0].text;
    } catch {
      return DEFAULT_PHRASES[0].text;
    }
  });

  const [quickTarget, setQuickTarget] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('quick_tasbeeh_target');
      const val = saved ? parseInt(saved, 10) : 33;
      return [33, 50, 99, 100].includes(val) ? val : 33;
    } catch {
      return 33;
    }
  });

  const [isDhikrMenuOpen, setIsDhikrMenuOpen] = useState<boolean>(false);
  const [isTargetMenuOpen, setIsTargetMenuOpen] = useState<boolean>(false);

  const getQuickTasbeehPhrases = useCallback((): { id: number; text: string }[] => {
    try {
      const saved = localStorage.getItem('mushaf_user_tasbeeh_phrases');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p: any, idx: number) => ({
            id: p.id || idx + 1,
            text: typeof p === 'string' ? p : (p.text || '')
          })).filter((p: { id: number; text: string }) => p.text.trim() !== '');
        }
      }
    } catch (e) {}
    return DEFAULT_PHRASES;
  }, []);

  useEffect(() => {
    if (!isDhikrMenuOpen && !isTargetMenuOpen) return;
    const handleOutsideClick = () => {
      setIsDhikrMenuOpen(false);
      setIsTargetMenuOpen(false);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };
  }, [isDhikrMenuOpen, isTargetMenuOpen]);

  const [totalTodayTasbeeh, setTotalTodayTasbeeh] = useState<number>(() => {
    try {
      const todayStr = moment().format('YYYY-MM-DD');
      const savedSettings = localStorage.getItem('mushaf_tasbeeh_settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        const stat = (settings.dailyStats || []).find((s: any) => s.date === todayStr);
        if (stat) return stat.count || 0;
      }
    } catch {}
    return 0;
  });

  useEffect(() => {
    const handleVisibilityChange = (e: any) => {
      if (typeof e?.detail?.enabled === 'boolean') {
        setShowQuickTasbeeh(e.detail.enabled);
      } else {
        try {
          setShowQuickTasbeeh(localStorage.getItem('show_quick_tasbeeh_home') === 'true');
        } catch {
          setShowQuickTasbeeh(false);
        }
      }
    };
    window.addEventListener('quick-tasbeeh-visibility-changed', handleVisibilityChange);
    window.addEventListener('storage', handleVisibilityChange);
    return () => {
      window.removeEventListener('quick-tasbeeh-visibility-changed', handleVisibilityChange);
      window.removeEventListener('storage', handleVisibilityChange);
    };
  }, []);

  const [showListenOnHome, setShowListenOnHome] = useState<boolean>(() => {
    try {
      return localStorage.getItem('show_listen_quran_home') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleListenVisibilityChange = (e: any) => {
      if (typeof e?.detail?.enabled === 'boolean') {
        setShowListenOnHome(e.detail.enabled);
      } else {
        try {
          setShowListenOnHome(localStorage.getItem('show_listen_quran_home') === 'true');
        } catch {
          setShowListenOnHome(false);
        }
      }
    };
    window.addEventListener('listen-card-visibility-changed', handleListenVisibilityChange);
    window.addEventListener('storage', handleListenVisibilityChange);
    return () => {
      window.removeEventListener('listen-card-visibility-changed', handleListenVisibilityChange);
      window.removeEventListener('storage', handleListenVisibilityChange);
    };
  }, []);

  const [cardsOrder, setCardsOrder] = useState<ModernCardId[]>(() => {
    try {
      const savedVersion = localStorage.getItem('modern_cards_order_version_v2');
      if (savedVersion !== 'v2026_quick_tasbeeh_under_tracker') {
        localStorage.setItem('modern_cards_order_version_v2', 'v2026_quick_tasbeeh_under_tracker');
        localStorage.setItem('modern_home_cards_order_v1', JSON.stringify(DEFAULT_MODERN_CARD_ORDER));
        Preferences.set({ key: 'modern_home_cards_order_v1', value: JSON.stringify(DEFAULT_MODERN_CARD_ORDER) }).catch(() => {});
        return DEFAULT_MODERN_CARD_ORDER;
      }
      const saved = localStorage.getItem('modern_home_cards_order_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const valid = DEFAULT_MODERN_CARD_ORDER.filter(id => parsed.includes(id));
          const missing = DEFAULT_MODERN_CARD_ORDER.filter(id => !parsed.includes(id));
          return [...valid, ...missing];
        }
      }
    } catch {}
    return DEFAULT_MODERN_CARD_ORDER;
  });

  const saveCardsOrder = useCallback((orderToSave?: ModernCardId[]) => {
    const target = orderToSave || cardsOrder;
    try {
      localStorage.setItem('modern_home_cards_order_v1', JSON.stringify(target));
    } catch {}
    Preferences.set({ key: 'modern_home_cards_order_v1', value: JSON.stringify(target) }).catch(() => {});
  }, [cardsOrder]);

  const handleResetCardsOrder = useCallback(() => {
    setCardsOrder(DEFAULT_MODERN_CARD_ORDER);
    saveCardsOrder(DEFAULT_MODERN_CARD_ORDER);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(40); } catch {}
    }
    setToastMessage?.(isEn ? 'Restored default card order ✓' : 'تمت استعادة الترتيب الافتراضي للبطاقات ✓');
  }, [saveCardsOrder, isEn, setToastMessage]);

  useEffect(() => {
    const handleSaveLayoutEvent = () => {
      saveCardsOrder();
    };
    const handleResetLayoutEvent = () => {
      handleResetCardsOrder();
    };
    window.addEventListener('save-home-cards-layout', handleSaveLayoutEvent);
    window.addEventListener('reset-home-cards-layout', handleResetLayoutEvent);
    return () => {
      window.removeEventListener('save-home-cards-layout', handleSaveLayoutEvent);
      window.removeEventListener('reset-home-cards-layout', handleResetLayoutEvent);
    };
  }, [saveCardsOrder, handleResetCardsOrder]);

  const { times, config, refreshLocation } = usePrayerTimes();
  const [isRefreshingLocation, setIsRefreshingLocation] = useState(false);

  const handleRefreshLocation = async (e?: React.MouseEvent) => {
    e?.stopPropagation?.();
    if (isRefreshingLocation) return;
    setIsRefreshingLocation(true);
    setToastMessage?.(isEn ? 'Updating location... 📍' : 'جاري تحديث الموقع تلقائياً... 📍');
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(30); } catch {}
      }
      await refreshLocation?.(true);
      setToastMessage?.(isEn ? 'Location updated successfully 📍' : 'تم تحديث الموقع بنجاح 📍');
    } catch {
      setToastMessage?.(isEn ? 'Failed to update location' : 'تعذر تحديث الموقع');
    } finally {
      setIsRefreshingLocation(false);
    }
  };

  const { records, toggleHabit, getDailyProgress } = useHabitTracker();
  const { isEnabled, toggleEnabled, showVoiceIcon } = useVoiceControl();
  const { isPageSeen } = useSeenPages();

  const [activeTab, setActiveTabState] = useState<'all' | 'library' | 'worship' | 'tools'>(() => {
    try {
      const saved = localStorage.getItem('modern_home_active_apps_tab');
      if (saved && ['all', 'library', 'worship', 'tools'].includes(saved)) {
        return saved as any;
      }
    } catch {}
    return 'library';
  });

  const setActiveTab = useCallback((tab: 'all' | 'library' | 'worship' | 'tools') => {
    setActiveTabState(tab);
    try {
      localStorage.setItem('modern_home_active_apps_tab', tab);
    } catch {}
  }, []);

  const [isAppsExpanded, setIsAppsExpandedState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('modern_home_apps_expanded');
      if (saved !== null) return saved === 'true';
    } catch {}
    return true;
  });

  const setIsAppsExpanded = useCallback((expanded: boolean | ((prev: boolean) => boolean)) => {
    setIsAppsExpandedState(prev => {
      const nextVal = typeof expanded === 'function' ? expanded(prev) : expanded;
      try {
        localStorage.setItem('modern_home_apps_expanded', String(nextVal));
      } catch {}
      return nextVal;
    });
  }, []);

  const [activeEventTab, setActiveEventTabState] = useState<'event' | 'memory' | 'occasions' | 'wisdom'>(() => {
    try {
      const saved = localStorage.getItem('modern_home_active_event_tab');
      if (saved && ['event', 'memory', 'occasions', 'wisdom'].includes(saved)) {
        return saved as any;
      }
    } catch {}
    return 'occasions';
  });

  const setActiveEventTab = useCallback((tab: 'event' | 'memory' | 'occasions' | 'wisdom') => {
    setActiveEventTabState(tab);
    try {
      localStorage.setItem('modern_home_active_event_tab', tab);
    } catch {}
  }, []);

  const [wisdomIndex, setWisdomIndex] = useState<number>(() => {
    const todayWisdom = getWisdomOfTheDay();
    const idx = ISLAMIC_WISDOMS.findIndex(w => w.id === todayWisdom.id);
    return idx >= 0 ? idx : 0;
  });
  const [showWisdomZoomModal, setShowWisdomZoomModal] = useState<boolean>(false);
  const currentWisdom = ISLAMIC_WISDOMS[wisdomIndex] || ISLAMIC_WISDOMS[0];

  const [showQrModal, setShowQrModal] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [copiedWebLink, setCopiedWebLink] = useState(false);

  const [activeBottomCardTab, setActiveBottomCardTabState] = useState<'share' | 'browse' | 'support'>(() => {
    try {
      const saved = localStorage.getItem('modern_home_active_bottom_card_tab');
      if (saved && ['share', 'browse', 'support'].includes(saved)) {
        return saved as any;
      }
    } catch {}
    return 'share';
  });

  const setActiveBottomCardTab = useCallback((tab: 'share' | 'browse' | 'support') => {
    setActiveBottomCardTabState(tab);
    try {
      localStorage.setItem('modern_home_active_bottom_card_tab', tab);
    } catch {}
  }, []);

  useEffect(() => {
    if (!showQrModal) return;
    const unregister = registerBackInterceptor(() => {
      setShowQrModal(false);
      return true;
    });
    return unregister;
  }, [showQrModal]);

  const [timeWindow, setTimeWindow] = useState(() => {
    const current = getCityNowDate();
    const h = current.getHours();
    return {
      date: current,
      dayKey: `${current.getFullYear()}-${current.getMonth()}-${current.getDate()}`,
      isMorning: h >= 3 && h < 15,
    };
  });

  useEffect(() => {
    const syncTimeWindow = () => {
      const current = getCityNowDate();
      const h = current.getHours();
      const nextDayKey = `${current.getFullYear()}-${current.getMonth()}-${current.getDate()}`;
      const nextIsMorning = h >= 3 && h < 15;
      setTimeWindow(prev => {
        if (prev.dayKey === nextDayKey && prev.isMorning === nextIsMorning) {
          return prev;
        }
        return { date: current, dayKey: nextDayKey, isMorning: nextIsMorning };
      });
    };
    const interval = setInterval(syncTimeWindow, 30000);
    return () => clearInterval(interval);
  }, []);

  const [todayStr, setTodayStr] = useState<string>(() => moment().format('YYYY-MM-DD'));

  useEffect(() => {
    const updateMidnight = () => {
      const freshStr = moment().format('YYYY-MM-DD');
      setTodayStr((prev) => (prev !== freshStr ? freshStr : prev));
    };

    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
    const msUntilMidnight = nextMidnight.getTime() - now.getTime();

    const midnightTimeout = setTimeout(updateMidnight, msUntilMidnight);
    const intervalCheck = setInterval(updateMidnight, 30000);

    return () => {
      clearTimeout(midnightTimeout);
      clearInterval(intervalCheck);
    };
  }, [todayStr]);

  const todayHabits = records[todayStr] || {
    prayers: { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false }
  };

  const completedPrayersCount = [
    todayHabits.prayers?.fajr,
    todayHabits.prayers?.dhuhr,
    todayHabits.prayers?.asr,
    todayHabits.prayers?.maghrib,
    todayHabits.prayers?.isha
  ].filter(Boolean).length;

  const prayersPercentage = Math.round((completedPrayersCount / 5) * 100);
  const totalDailyProgress = getDailyProgress ? getDailyProgress(todayStr) : prayersPercentage;

  const todayHijriDisplay = useMemo(() => {
    const { day, month, year } = getAccurateHijriDate(timeWindow.date);
    return isEn
      ? `${day} ${HIJRI_MONTHS_EN[month - 1] || ''} ${year} AH`
      : `${formatNumber(day)} ${HIJRI_MONTHS_AR[month - 1] || ''} ${formatNumber(year)} هـ`;
  }, [timeWindow.dayKey, timeWindow.date, isEn, formatNumber]);

  const [activeWird, setActiveWird] = useState<WirdProfile | null>(() => getActiveWirdProfile());

  useEffect(() => {
    const syncWird = () => {
      setActiveWird(getActiveWirdProfile());
    };
    syncWird();
    window.addEventListener('storage', syncWird);
    window.addEventListener('focus', syncWird);
    return () => {
      window.removeEventListener('storage', syncWird);
      window.removeEventListener('focus', syncWird);
    };
  }, []);

  const dailyWirdStatus = useMemo(() => {
    if (!activeWird) {
      return {
        isDone: false,
        hasPlan: false,
        prefix: isEn ? "Today's Wird:" : 'ورد اليوم:',
        highlight: isEn ? 'Start plan' : 'ابدأ ختمتك'
      };
    }

    const totalDays = getWirdTotalDays(activeWird);
    const todayIsoLocal = moment(timeWindow.date).format('YYYY-MM-DD');
    const todayIsoUtc = new Date().toISOString().split('T')[0];
    const isKhatmaCompleted = (activeWird.completedDays?.length || 0) >= totalDays;
    const isTodayCompleted =
      isKhatmaCompleted ||
      Boolean(activeWird.completedDays?.includes(activeWird.currentDay)) ||
      Boolean(
        activeWird.lastCompletedDate &&
          (activeWird.lastCompletedDate.startsWith(todayIsoLocal) ||
            activeWird.lastCompletedDate.startsWith(todayIsoUtc))
      );

    if (isTodayCompleted) {
      return {
        isDone: true,
        hasPlan: true,
        prefix: '',
        highlight: isEn ? "Today's Wird completed ✓" : 'تم إنجاز ورد اليوم ✓'
      };
    }

    const range = getWirdDayRange(activeWird.currentDay || 1, activeWird);
    const totalDayPages = Math.max(1, range.end - range.start + 1);
    let remainingPages = totalDayPages;

    if (activeWird.lastPage && activeWird.lastPage > range.start && activeWird.lastPage <= range.end) {
      remainingPages = Math.max(1, range.end - activeWird.lastPage + 1);
    } else if (activeWird.lastPage && activeWird.lastPage > range.end) {
      remainingPages = 1;
    }

    let arPagesText = '';
    if (remainingPages === 1) {
      arPagesText = 'متبقي صفحة واحدة';
    } else if (remainingPages === 2) {
      arPagesText = 'متبقي صفحتان';
    } else if (remainingPages >= 3 && remainingPages <= 10) {
      arPagesText = `متبقي ${formatNumber(remainingPages)} صفحات`;
    } else {
      arPagesText = `متبقي ${formatNumber(remainingPages)} صفحة`;
    }

    return {
      isDone: false,
      hasPlan: true,
      prefix: isEn ? "Today's Wird:" : 'ورد اليوم:',
      highlight: isEn
        ? `${remainingPages} ${remainingPages === 1 ? 'page' : 'pages'} left`
        : arPagesText
    };
  }, [activeWird, timeWindow.dayKey, timeWindow.date, isEn, formatNumber]);

  const [enQuranData, setEnQuranData] = useState<QuranEnglishSurah[] | null>(() => getCachedQuranEnglishTranslation());

  useEffect(() => {
    if (isEn && !enQuranData) {
      loadQuranEnglishTranslation().then(data => {
        if (data && data.length > 0) {
          setEnQuranData(data);
        }
      });
    }
  }, [isEn, enQuranData]);

  const [lastReadQuran, setLastReadQuran] = useState<{ surah: number; surahName: string; ayah: number; page: number; juz: number }>({
    surah: 1,
    surahName: isEn ? 'Surah Al-Fatihah' : 'سورة الفاتحة',
    ayah: 1,
    page: 1,
    juz: 1
  });

  useEffect(() => {
    const loadLastRead = () => {
      try {
        let savedGlobal: string | null = null;
        if (isEn) {
          savedGlobal = localStorage.getItem('last_read_pos_bilingual')
                     || localStorage.getItem('last_pos_bilingual_v')
                     || localStorage.getItem('last_pos_bilingual_h')
                     || localStorage.getItem('last_read_pos_translation')
                     || localStorage.getItem('last_pos_translation_v')
                     || localStorage.getItem('last_pos_translation_h')
                     || localStorage.getItem('last_read_ayah_global')
                     || localStorage.getItem('last_read_pos_mushaf');
        } else {
          savedGlobal = localStorage.getItem('last_read_pos_mushaf')
                     || localStorage.getItem('last_read_ayah_global')
                     || localStorage.getItem('last_pos_mushaf_v')
                     || localStorage.getItem('last_pos_mushaf_h');
        }

        if (savedGlobal) {
          const parsed = JSON.parse(savedGlobal);
          if (parsed && parsed.s && parsed.a) {
            const s = Number(parsed.s);
            const a = Number(parsed.a);
            const sName = isEn
              ? (SURAH_NAMES_EN[s - 1] ? `Surah ${SURAH_NAMES_EN[s - 1]}` : `Surah ${s}`)
              : (SURAH_NAMES_AR[s - 1] ? `سورة ${SURAH_NAMES_AR[s - 1]}` : 'سورة الفاتحة');

            let pageNum = parsed.page;
            let juzNum = parsed.juz;
            if (!pageNum || !juzNum || (pageNum === 1 && s > 1)) {
              const surah = quranJsonData?.surahs?.[s - 1];
              const ayahObj = surah?.ayahs?.[a - 1];
              if (ayahObj) {
                pageNum = ayahObj.page;
                juzNum = ayahObj.juz;
              }
            }
            if (!juzNum) {
              juzNum = getJuzForAyah(s, a);
            }

            setLastReadQuran({
              surah: s,
              surahName: sName,
              ayah: a,
              page: pageNum || 1,
              juz: juzNum || 1
            });
          }
        } else {
          setLastReadQuran({
            surah: 1,
            surahName: isEn ? 'Surah Al-Fatihah' : 'سورة الفاتحة',
            ayah: 1,
            page: 1,
            juz: 1
          });
        }
      } catch {}
    };

    loadLastRead();
    window.addEventListener('storage', loadLastRead);
    window.addEventListener('last_read_update', loadLastRead);
    return () => {
      window.removeEventListener('storage', loadLastRead);
      window.removeEventListener('last_read_update', loadLastRead);
    };
  }, [isEn]);

  const currentAyahText = useMemo(() => {
    if (!lastReadQuran.surah || !lastReadQuran.ayah) {
      return isEn
        ? 'In the name of Allah, the Entirely Merciful, the Especially Merciful'
        : 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
    }

    if (isEn) {
      if (enQuranData && enQuranData.length >= lastReadQuran.surah) {
        const enSurah = enQuranData[lastReadQuran.surah - 1];
        const enVerse = enSurah?.verses?.[lastReadQuran.ayah - 1];
        if (enVerse?.translation) {
          return enVerse.translation;
        }
      }
    }

    const surahObj = quranJsonData?.surahs?.[lastReadQuran.surah - 1];
    const ayahObj = surahObj?.ayahs?.[lastReadQuran.ayah - 1];
    return ayahObj?.text || (isEn ? 'In the name of Allah, the Entirely Merciful, the Especially Merciful' : 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ');
  }, [lastReadQuran.surah, lastReadQuran.ayah, isEn, enQuranData]);

  const cityDisplayName = useMemo(() => {
    const rawCityName = isEn
      ? ((config.location as any)?.cityGovEn || (config.location as any)?.city || config.location?.cityGov || 'Current Location')
      : ((config.location as any)?.cityGovAr || (config.location as any)?.cityNameAr || (config.location as any)?.city || config.location?.cityGov || 'موقعي الحالي');
    return getLocalizedLocationName(rawCityName, isEn ? 'en' : 'ar');
  }, [config.location, isEn]);

  const getResolvedEnglishQuranMode = useCallback((orient: 'v' | 'h' = 'v') => {
    const saved = localStorage.getItem(`quran_reading_mode_en_v2_${orient}`);
    if (saved === 'bilingual' || saved === 'translation' || saved === 'madinah') {
      return saved;
    }
    return 'translation';
  }, []);

  const handleOpenQuranFromCard = useCallback(() => {
    if (isEn) {
      onNavigate('quran', {
        from: 'modern_home',
        surah: lastReadQuran.surah,
        ayah: lastReadQuran.ayah,
        page: lastReadQuran.page,
        readingMode: getResolvedEnglishQuranMode('v'),
      });
      return;
    }
    const savedMode = localStorage.getItem('quran_reading_mode_ar_v') || localStorage.getItem('last_arabic_reading_mode_v');
    const resolvedMode = savedMode === 'madinah' || !savedMode || savedMode === 'tafseer' || savedMode === 'meanings' || savedMode === 'translation' ? 'mushaf' : savedMode;
    onNavigate('quran', {
      from: 'modern_home',
      surah: lastReadQuran.surah,
      ayah: lastReadQuran.ayah,
      page: lastReadQuran.page,
      readingMode: resolvedMode,
    });
  }, [onNavigate, lastReadQuran.surah, lastReadQuran.ayah, lastReadQuran.page, isEn, getResolvedEnglishQuranMode]);

  const handleOpenPrayerTimes = useCallback(() => {
    onNavigate('prayer-times');
  }, [onNavigate]);

  const isMorning = timeWindow.isMorning;

  const handleTogglePrayer = (e: React.MouseEvent, key: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha') => {
    e.stopPropagation();
    toggleHabit(todayStr, 'prayers', key);
    if (navigator.vibrate) navigator.vibrate(30);
  };

  const allServices = useMemo(() => [
    {
      id: 'quran',
      title: isEn ? 'Holy Quran' : 'القرآن الكريم',
      category: 'library',
      icon: BookOpen,
      circleBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/40',
      isNew: false
    },
    {
      id: 'quran-horizontal',
      title: isEn ? 'Horizontal Reading' : 'القراءة الأفقية',
      category: 'library',
      icon: BookOpen,
      circleBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/40',
      isNew: !isPageSeen('quran-horizontal')
    },
    {
      id: 'quran-landscape',
      title: isEn ? 'Landscape Reading' : 'القراءة العرضية',
      category: 'library',
      icon: Maximize2,
      circleBg: 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-800/40',
      isNew: false
    },
    {
      id: 'listen',
      title: isEn ? 'Listen to Quran' : 'الاستماع للقرآن',
      category: 'library',
      icon: Headphones,
      circleBg: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border-cyan-100 dark:border-cyan-800/40',
      isNew: false
    },
    {
      id: 'memorization',
      title: isEn ? 'Quran Memorization' : 'التحفيظ',
      category: 'worship',
      icon: Brain,
      circleBg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800/40',
      isNew: false
    },
    {
      id: 'daily-wird',
      title: isEn ? 'Daily Quran Wird' : 'الورد اليومي',
      category: 'worship',
      icon: BookmarkCheck,
      circleBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800/40',
      isNew: false
    },
    {
      id: 'prayer-times',
      title: isEn ? 'Prayer Times' : 'مواقيت الصلاة',
      category: 'worship',
      icon: Clock,
      circleBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/40',
      isNew: false
    },
    {
      id: 'salah-adhkar',
      title: isEn ? 'Prayer Dhikr' : 'أذكار الصلاة',
      category: 'worship',
      icon: Sparkles,
      circleBg: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-800/40',
      isNew: false
    },
    {
      id: 'qibla',
      title: isEn ? 'Compass' : 'البوصلة',
      category: 'worship',
      icon: QiblaIcon,
      circleBg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800/40',
      isNew: false
    },
    {
      id: 'sabah-masaa',
      title: isEn ? 'Adhkar' : 'الأذكار',
      category: 'worship',
      icon: Sun,
      circleBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800/40',
      isNew: false
    },
    {
      id: 'adia',
      title: isEn ? 'Supplications' : 'الأدعية',
      category: 'worship',
      icon: HeartHandshake,
      circleBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400 border-rose-100 dark:border-rose-800/40',
      isNew: false
    },
    {
      id: 'tasbeeh',
      title: isEn ? 'Tasbeeh' : 'التسبيح',
      category: 'worship',
      icon: CircleDot,
      circleBg: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border-cyan-100 dark:border-cyan-800/40',
      isNew: false
    },
    {
      id: 'others',
      title: isEn ? 'Ruqyah Shariah' : 'الرقية الشرعية',
      category: 'worship',
      icon: ShieldCheck,
      circleBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/40',
      isNew: !isPageSeen('others')
    },
    {
      id: 'prophetic-seerah',
      title: isEn ? 'Prophetic Seerah' : 'السيرة النبوية',
      category: 'library',
      icon: ScrollText,
      circleBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800/40',
      isNew: !isPageSeen('prophetic-seerah')
    },
    {
      id: 'ten-promised',
      title: isEn ? 'Ten Promised Paradise' : 'العشرة المبشرون',
      category: 'library',
      icon: Award,
      circleBg: 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-800/40',
      isNew: !isPageSeen('ten-promised')
    },
    {
      id: 'divine-miracles',
      title: isEn ? 'Divine Miracles' : 'المعجزات الإلهية',
      category: 'library',
      icon: Sparkles,
      circleBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800/40',
      isNew: !isPageSeen('divine-miracles')
    },
    {
      id: 'hisn-muslim',
      title: isEn ? 'Hisn Al-Muslim' : 'حصن المسلم',
      category: 'worship',
      icon: ShieldCheck,
      circleBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/40',
      isNew: false
    },
    {
      id: 'hajj-umrah',
      title: isEn ? 'Hajj & Umrah' : 'الحج والعمرة',
      category: 'worship',
      icon: Tent,
      circleBg: 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-800/40',
      isNew: false
    },
    {
      id: 'asmaul-husna',
      title: isEn ? 'Names of Allah' : 'أسماء الله الحسنى',
      category: 'library',
      icon: Star,
      circleBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800/40',
      isNew: false
    },
    {
      id: 'habit-tracker',
      title: isEn ? 'Habit Tracker' : 'مربّي العبادات',
      category: 'worship',
      icon: CheckSquare,
      circleBg: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-800/40',
      isNew: false
    },
    {
      id: 'calculators',
      title: isEn ? 'Islamic Calculators' : 'الحاسبة الشرعية',
      category: 'tools',
      icon: Calculator,
      circleBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      isNew: false
    },
    {
      id: 'nawawi',
      title: isEn ? 'An-Nawawi 40' : 'الأربعون النووية',
      category: 'library',
      icon: BookMarked,
      circleBg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800/40',
      isNew: false
    },
    {
      id: 'calendar',
      title: isEn ? 'Hijri Calendar' : 'التقويم',
      category: 'tools',
      icon: CalendarDays,
      circleBg: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-800/40',
      isNew: false
    },
    {
      id: 'islamic-sites',
      title: isEn ? 'Islamic Sites' : 'مواقع إسلامية',
      category: 'tools',
      icon: Globe,
      circleBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/40',
      isNew: !isPageSeen('islamic-sites')
    },
    {
      id: 'voice-control',
      title: isEn ? 'Voice Control' : 'التحكم الصوتي',
      category: 'tools',
      icon: Mic,
      circleBg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800/40',
      isNew: false
    }
  ], [isEn, isPageSeen]);

  const displayedServices = useMemo(() => {
    if (activeTab === 'all') return allServices;
    return allServices.filter(s => s.category === activeTab);
  }, [allServices, activeTab]);

  const favoriteAppIds = useFavoriteApps(10);
  const favoriteServices = useMemo(() => {
    return favoriteAppIds
      .map(id => allServices.find(s => s.id === id))
      .filter((s): s is typeof allServices[0] => Boolean(s));
  }, [favoriteAppIds, allServices]);

  const favScrollRef = useRef<HTMLDivElement | null>(null);
  const [favFadeState, setFavFadeState] = useState<{ left: boolean; right: boolean }>(() => ({
    left: isRTL,
    right: !isRTL
  }));

  const updateFavScrollFade = useCallback(() => {
    const el = favScrollRef.current;
    if (!el || el.children.length === 0) return;
    const cRect = el.getBoundingClientRect();
    const firstRect = el.firstElementChild?.getBoundingClientRect();
    const lastRect = el.lastElementChild?.getBoundingClientRect();
    if (!firstRect || !lastRect) return;

    const overflowLeft = firstRect.left < cRect.left - 4 || lastRect.left < cRect.left - 4;
    const overflowRight = firstRect.right > cRect.right + 4 || lastRect.right > cRect.right + 4;

    setFavFadeState(prev =>
      prev.left === overflowLeft && prev.right === overflowRight
        ? prev
        : { left: overflowLeft, right: overflowRight }
    );
  }, []);

  useEffect(() => {
    setFavFadeState({ left: isRTL, right: !isRTL });
    const raf = requestAnimationFrame(updateFavScrollFade);
    window.addEventListener('resize', updateFavScrollFade);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', updateFavScrollFade);
    };
  }, [isRTL, favoriteServices.length, updateFavScrollFade]);

  const favScrollMask = useMemo(() => {
    if (favFadeState.left && favFadeState.right) {
      return 'linear-gradient(to right, transparent 0px, black 28px, black calc(100% - 28px), transparent 100%)';
    }
    if (favFadeState.left) {
      return 'linear-gradient(to right, transparent 0px, black 32px, black 100%)';
    }
    if (favFadeState.right) {
      return 'linear-gradient(to left, transparent 0px, black 32px, black 100%)';
    }
    return 'none';
  }, [favFadeState.left, favFadeState.right]);

  const handleCopyWebUrl = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(WEB_APP_URL);
      setCopiedWebLink(true);
      setToastMessage(isEn ? 'Link copied to clipboard 📋' : 'تم نسخ الرابط بنجاح 📋');
      setTimeout(() => setCopiedWebLink(false), 2000);
    } catch {}
  };

  const handleShareWebUrl = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareData = {
      title: isEn ? 'Mushaf Ahmed & Laila Web App' : 'تطبيق مصحف أحمد و ليلى',
      text: isEn
        ? `To open the app on your browser or iPhone, tap the link:\n${WEB_APP_URL}`
        : `لمشاهدة التطبيق على المتصفح أو الآيفون اضغط على الرابط التالي:\n${WEB_APP_URL}`,
    };
    if (Capacitor.isNativePlatform()) {
      try {
        await CapacitorShare.share(shareData);
      } catch {
        handleCopyWebUrl(e);
      }
    } else if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        handleCopyWebUrl(e);
      }
    } else {
      handleCopyWebUrl(e);
    }
  };

  const textToShare = isEn
    ? (shareTextEn || `Noble Quran Ahmed & Laila - Ad-free Islamic Application: ${WEB_APP_URL}`)
    : (shareTextAr || `تطبيق مصحف أحمد وليلى - صدقة جارية، شامل وخالٍ تماماً من الإعلانات:\n${WEB_APP_URL}`);

  const handleShareAppGeneral = async () => {
    const shareData = {
      title: isEn ? 'Mushaf Ahmed & Laila' : 'مصحف أحمد وليلى',
      text: textToShare,
    };
    if (Capacitor.isNativePlatform()) {
      try {
        await CapacitorShare.share(shareData);
      } catch {
        try {
          await navigator.clipboard.writeText(textToShare);
          setToastMessage(t('app_share.copied', 'تم نسخ نص المشاركة بنجاح'));
        } catch {}
      }
    } else if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          try {
            await navigator.clipboard.writeText(textToShare);
            setToastMessage(t('app_share.copied', 'تم نسخ نص المشاركة بنجاح'));
          } catch {}
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(textToShare);
        setToastMessage(t('app_share.copied', 'تم نسخ نص المشاركة بنجاح'));
      } catch {}
    }
  };

  const handleCopyShareAppText = async () => {
    try {
      await navigator.clipboard.writeText(textToShare);
      setCopiedShare(true);
      setToastMessage(t('app_share.copied', 'تم نسخ نص المشاركة بنجاح 📋'));
      setTimeout(() => setCopiedShare(false), 2000);
    } catch {
      setToastMessage(t('common.failed_copy', 'فشل في النسخ'));
    }
  };

  const currentOccasion = upcomingEvents?.[eventIndex] || null;

  const renderCardContent = (cardId: ModernCardId) => {
    switch (cardId) {
      case 'quran':
        return (
          <HomeQuranCard
            isEn={isEn}
            isNightMode={isNightMode}
            isBlackTheme={isBlackTheme}
            lastReadQuran={lastReadQuran}
            currentAyahText={currentAyahText}
            formatNumber={formatNumber}
            handleOpenQuranFromCard={handleOpenQuranFromCard}
            onNavigate={onNavigate}
            getResolvedEnglishQuranMode={getResolvedEnglishQuranMode}
          />
        );
      case 'listen-quran':
        if (!showListenOnHome && !isEditMode) return null;
        return <ListenQuranCard onNavigate={onNavigate} />;
      case 'prayer':
        return (
          <HomePrayerCard
            times={times}
            config={config}
            isEn={isEn}
            isNightMode={isNightMode}
            isBlackTheme={isBlackTheme}
            isSkyTheme={isSkyTheme}
            isEmeraldTheme={isEmeraldTheme}
            isBurgundyTheme={isBurgundyTheme}
            isRefreshingLocation={isRefreshingLocation}
            cityDisplayName={cityDisplayName}
            todayHijriDisplay={todayHijriDisplay}
            formatNumber={formatNumber}
            handleRefreshLocation={handleRefreshLocation}
            handleOpenPrayerTimes={handleOpenPrayerTimes}
            onNavigate={onNavigate}
          />
        );
      case 'seasonal':
        return <SmartSeasonalStrip onNavigate={onNavigate} />;
      case 'adhkar':
        return (
          <HomeAdhkarCard
            isEn={isEn}
            isRTL={isRTL}
            dir={dir}
            isMorning={isMorning}
            isNightMode={isNightMode}
            isBlackTheme={isBlackTheme}
            onNavigate={onNavigate}
          />
        );
      case 'search':
        return (
          <HomeSearchCard
            isEn={isEn}
            dir={dir}
            isNightMode={isNightMode}
            isSkyTheme={isSkyTheme}
            isEmeraldTheme={isEmeraldTheme}
            isBurgundyTheme={isBurgundyTheme}
            homeThemeVariant={homeThemeVariant}
            showVoiceIcon={showVoiceIcon}
            isEnabled={isEnabled}
            toggleEnabled={toggleEnabled}
            voiceIconColor={voiceIconColor}
            voicePingColor={voicePingColor}
            setToastMessage={setToastMessage}
            favoriteServices={favoriteServices}
            favScrollRef={favScrollRef}
            updateFavScrollFade={updateFavScrollFade}
            favScrollMask={favScrollMask}
            onNavigate={onNavigate}
            getResolvedEnglishQuranMode={getResolvedEnglishQuranMode}
          />
        );
      case 'apps':
        return (
          <HomeAppsCard
            isEn={isEn}
            dir={dir}
            isNightMode={isNightMode}
            isBlackTheme={isBlackTheme}
            isSkyTheme={isSkyTheme}
            isEmeraldTheme={isEmeraldTheme}
            isBurgundyTheme={isBurgundyTheme}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isAppsExpanded={isAppsExpanded}
            setIsAppsExpanded={setIsAppsExpanded}
            displayedServices={displayedServices}
            onNavigate={onNavigate}
            getResolvedEnglishQuranMode={getResolvedEnglishQuranMode}
          />
        );
      case 'tracker':
        return (
          <HomeTrackerCard
            isEn={isEn}
            isRTL={isRTL}
            isNightMode={isNightMode}
            isBlackTheme={isBlackTheme}
            completedPrayersCount={completedPrayersCount}
            totalDailyProgress={totalDailyProgress}
            todayHabits={todayHabits}
            dailyWirdStatus={dailyWirdStatus}
            formatNumber={formatNumber}
            handleTogglePrayer={handleTogglePrayer}
            onNavigate={onNavigate}
          />
        );
      case 'quick-tasbeeh':
        return (
          <HomeQuickTasbeehCard
            showQuickTasbeeh={showQuickTasbeeh}
            isEn={isEn}
            isRTL={isRTL}
            language={language}
            isNightMode={isNightMode}
            isBlackTheme={isBlackTheme}
            isSkyTheme={isSkyTheme}
            isEmeraldTheme={isEmeraldTheme}
            isBurgundyTheme={isBurgundyTheme}
            quickCount={quickCount}
            setQuickCount={setQuickCount}
            selectedQuickPhraseText={selectedQuickPhraseText}
            setSelectedQuickPhraseText={setSelectedQuickPhraseText}
            quickTarget={quickTarget}
            setQuickTarget={setQuickTarget}
            totalTodayTasbeeh={totalTodayTasbeeh}
            setTotalTodayTasbeeh={setTotalTodayTasbeeh}
            isDhikrMenuOpen={isDhikrMenuOpen}
            setIsDhikrMenuOpen={setIsDhikrMenuOpen}
            isTargetMenuOpen={isTargetMenuOpen}
            setIsTargetMenuOpen={setIsTargetMenuOpen}
            getQuickTasbeehPhrases={getQuickTasbeehPhrases}
            onNavigate={onNavigate}
          />
        );
      case 'tawaf':
        if (!tawafState.showOnHome) return null;
        return (
          <TawafCounterCard
            theme={theme}
            isGolden={true}
            onNavigate={onNavigate}
          />
        );
      case 'reflections':
        return (
          <HomeReflectionsCard
            isEn={isEn}
            isNightMode={isNightMode}
            isBlackTheme={isBlackTheme}
            activeEventTab={activeEventTab}
            setActiveEventTab={setActiveEventTab}
            currentWisdom={currentWisdom}
            setWisdomIndex={setWisdomIndex}
            showWisdomZoomModal={showWisdomZoomModal}
            setShowWisdomZoomModal={setShowWisdomZoomModal}
            onThisDayEvent={onThisDayEvent}
            handleNextEvent={handleNextEvent}
            handleShareHighlight={handleShareHighlight}
            handleCopyHighlight={handleCopyHighlight}
            setShowExpandedEventsModal={setShowExpandedEventsModal}
            currentHistoryMemoryEvent={currentHistoryMemoryEvent}
            handleNextHistoryMemoryEvent={handleNextHistoryMemoryEvent}
            handleShareHistoryMemory={handleShareHistoryMemory}
            handleCopyHistoryMemory={handleCopyHistoryMemory}
            setShowExpandedHistoryMemoryModal={setShowExpandedHistoryMemoryModal}
            upcomingEvents={upcomingEvents}
            currentOccasion={currentOccasion}
            setEventIndex={setEventIndex}
            handleShareUpcomingEvent={handleShareUpcomingEvent}
            handleCopyUpcomingEvent={handleCopyUpcomingEvent}
            setShowExpandedUpcomingEventModal={setShowExpandedUpcomingEventModal}
            formatNumber={formatNumber}
            translateEventName={translateEventName}
            setToastMessage={setToastMessage}
            shareTextAr={shareTextAr}
          />
        );
      case 'share':
        return (
          <HomeShareCard
            isEn={isEn}
            isNightMode={isNightMode}
            isBlackTheme={isBlackTheme}
            activeBottomCardTab={activeBottomCardTab}
            setActiveBottomCardTab={setActiveBottomCardTab}
            t={t}
            handleShareAppGeneral={handleShareAppGeneral}
            setShowQrModal={setShowQrModal}
            handleCopyShareAppText={handleCopyShareAppText}
            copiedShare={copiedShare}
            handleCopyWebUrl={handleCopyWebUrl}
            copiedWebLink={copiedWebLink}
            handleShareWebUrl={handleShareWebUrl}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div data-layout="modern" className="flex flex-col gap-3 w-full max-w-md mx-auto pt-0 pb-1.5 modern-home-layout font-cairo" style={{ fontFamily: "'Cairo', sans-serif" }} dir={dir}>
      {isEditMode ? (
        <Reorder.Group
          axis="y"
          values={cardsOrder.filter(id => id !== 'seasonal' && (id !== 'tawaf' || tawafState.showOnHome) && (id !== 'quick-tasbeeh' || showQuickTasbeeh) && (id !== 'listen-quran' || showListenOnHome))}
          onReorder={(newOrderActive) => {
            const fullOrder: ModernCardId[] = [];
            for (const id of newOrderActive) {
              fullOrder.push(id);
              if (id === 'quran') {
                fullOrder.push('seasonal');
              }
              if (id === 'tracker' && !tawafState.showOnHome) {
                fullOrder.push('tawaf');
              }
            }
            if (!fullOrder.includes('seasonal')) {
              fullOrder.unshift('seasonal');
            }
            if (!tawafState.showOnHome && !fullOrder.includes('tawaf')) {
              fullOrder.push('tawaf');
            }

            setCardsOrder(fullOrder);
            saveCardsOrder(fullOrder);
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              try { navigator.vibrate(20); } catch {}
            }
          }}
          className="flex flex-col gap-3 w-full"
        >
          {cardsOrder
            .filter(id => id !== 'seasonal' && (id !== 'tawaf' || tawafState.showOnHome) && (id !== 'quick-tasbeeh' || showQuickTasbeeh) && (id !== 'listen-quran' || showListenOnHome))
            .map((cardId) => {
              const content = renderCardContent(cardId);
              if (!content) return null;

              return (
                <ReorderableCardItem
                  key={`modern-card-reorder-${cardId}`}
                  cardId={cardId}
                  isEn={isEn}
                  isNightMode={isNightMode}
                  isBlackTheme={isBlackTheme}
                >
                  {content}
                </ReorderableCardItem>
              );
            })}
        </Reorder.Group>
      ) : (
        cardsOrder.map((cardId) => {
          if (cardId === 'seasonal') {
            return (
              <SmartSeasonalStrip
                key={`modern-card-container-seasonal`}
                onNavigate={onNavigate}
              />
            );
          }
          if (cardId === 'tawaf' && !tawafState.showOnHome) {
            return null;
          }
          if (cardId === 'quick-tasbeeh' && !showQuickTasbeeh) {
            return null;
          }
          if (cardId === 'listen-quran' && !showListenOnHome) {
            return null;
          }
          const content = renderCardContent(cardId);
          if (!content) return null;

          return (
            <div
              key={`modern-card-container-${cardId}`}
              id={`modern-card-container-${cardId}`}
              className={`w-full transition-all duration-200 relative ${
                cardId === 'quick-tasbeeh' && (isDhikrMenuOpen || isTargetMenuOpen)
                  ? 'z-50'
                  : 'z-10'
              }`}
            >
              {content}
            </div>
          );
        })
      )}

      <div className="flex items-center justify-center gap-2 mt-1 mb-0.5 px-4" dir={dir}>
        <p
          className={`${(isNightMode || isBlackTheme) ? 'text-white' : 'gold-accent-text'} text-sm font-black font-cairo leading-tight text-center relative z-10`}
          style={{
            color: (isNightMode || isBlackTheme) ? '#FFFFFF' : '#78350F',
            fontFamily: "'Cairo', sans-serif",
            textShadow: (isNightMode || isBlackTheme) ? 'none' : '0 1px 2px rgba(255, 255, 255, 0.9), 0 2px 4px rgba(180, 83, 9, 0.15)'
          }}
        >
          {t('app.dua_bottom', 'اللهم ارحمهما واغفر لهما واجعل مثواهما الجنة')}
        </p>
      </div>

      <ShareAppQrModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
      />
    </div>
  );
};

export default ModernHomeView;
