import React from 'react';
import { JUZ_MAP } from '../../QuranReader/constants';

export const getJuzForAyah = (s: number, a: number): number => {
  for (let i = JUZ_MAP.length - 1; i >= 0; i--) {
    const j = JUZ_MAP[i];
    if (s > j.s || (s === j.s && a >= j.a)) {
      return j.j;
    }
  }
  return 1;
};

export type ModernCardId =
  | 'quran'
  | 'listen-quran'
  | 'prayer'
  | 'seasonal'
  | 'adhkar'
  | 'search'
  | 'apps'
  | 'tracker'
  | 'quick-tasbeeh'
  | 'tawaf'
  | 'reflections'
  | 'share';

export const DEFAULT_MODERN_CARD_ORDER: ModernCardId[] = [
  'quran',
  'listen-quran',
  'seasonal',
  'prayer',
  'search',
  'apps',
  'adhkar',
  'tracker',
  'quick-tasbeeh',
  'tawaf',
  'reflections',
  'share'
];

export const MODERN_CARD_TITLES: Record<ModernCardId, { ar: string; en: string }> = {
  quran: { ar: 'متابعة تلاوة المصحف', en: 'Quran Recitation' },
  'listen-quran': { ar: 'الاستماع للقرآن', en: 'Audio Quran Recitation' },
  prayer: { ar: 'مواقيت الصلاة والقبلة', en: 'Prayer Times & Qibla' },
  seasonal: { ar: 'الشريط الموسمي الذكي', en: 'Seasonal Strip' },
  adhkar: { ar: 'الأذكار اليومية والوصول السريع', en: 'Daily Adhkar & Quick Apps' },
  search: { ar: 'البحث والتطبيقات المفضلة', en: 'Search & Favorite Apps' },
  apps: { ar: 'التطبيقات والخدمات الإسلامية', en: 'Islamic Apps Drawer' },
  tracker: { ar: 'مربي الصلوات الخمس والورد', en: 'Prayers & Wird Tracker' },
  'quick-tasbeeh': { ar: 'التسبيح السريع والذِّكر اللحظي', en: 'Quick Tasbeeh & Instant Dhikr' },
  tawaf: { ar: 'عداد الطواف والسعي', en: 'Tawaf & Sa\'i Counter' },
  reflections: { ar: 'إشراقات وذاكرة اليوم', en: 'Reflections & Daily Memory' },
  share: { ar: 'مشاركة التطبيق والدعم الفني', en: 'Share & Tech Support' },
};

export interface ModernHomeViewProps {
  onNavigate: (pageId: string, params?: any) => void;
  theme: any;
  themeKey: string;
  isBlackTheme: boolean;
  setToastMessage: (msg: string) => void;
  onThisDayEvent: any;
  handleNextEvent?: (e?: any) => void;
  handleShareHighlight?: (e?: any) => void | Promise<void>;
  handleCopyHighlight?: (e?: any) => void | Promise<void>;
  setShowExpandedEventsModal: (show: boolean) => void;
  currentHistoryMemoryEvent: any;
  handleNextHistoryMemoryEvent?: (e?: any) => void | Promise<void>;
  handleShareHistoryMemory?: (e?: any) => void | Promise<void>;
  handleCopyHistoryMemory?: (e?: any) => void | Promise<void>;
  setShowExpandedHistoryMemoryModal: (show: boolean) => void;
  upcomingEvents: any[];
  eventIndex: number;
  setEventIndex: React.Dispatch<React.SetStateAction<number>>;
  handleShareUpcomingEvent?: (e?: any) => void | Promise<void>;
  handleCopyUpcomingEvent?: (e?: any) => void | Promise<void>;
  setShowExpandedUpcomingEventModal: (show: boolean) => void;
  shareTextAr?: string;
  shareTextEn?: string;
  isEditMode?: boolean;
  setIsEditMode?: (mode: boolean) => void;
  onOpenGuide?: () => void;
  onToggleNightMode?: () => void;
}

export interface HomeServiceItem {
  id: string;
  title: string;
  category: string;
  icon: any;
  circleBg: string;
  isNew: boolean;
}

export const WEB_APP_URL = 'https://mushaf-ahmed-laila.vercel.app/';

export const get3DIconForService = (id: string): string => {
  switch (id) {
    case 'quran':
      return '/assets/3d_icons/icon_quran.png';
    case 'quran-horizontal':
      return '/assets/3d_icons/icon_quran_horizontal.png';
    case 'quran-landscape':
      return '/assets/3d_icons/icon_quran_landscape.png';
    case 'listen':
      return '/assets/3d_icons/icon_listen.png';
    case 'memorization':
      return '/assets/3d_icons/icon_memorization.png';
    case 'daily-wird':
      return '/assets/3d_icons/icon_daily_wird.png';
    case 'prayer-times':
      return '/assets/3d_icons/icon_prayer_times.png';
    case 'salah-adhkar':
      return '/assets/3d_icons/icon_salah_adhkar.png';
    case 'qibla':
      return '/assets/3d_icons/icon_qibla.png';
    case 'sabah-masaa':
      return '/assets/3d_icons/icon_sabah_masaa.png';
    case 'adia':
      return '/assets/3d_icons/icon_adia.png';
    case 'tasbeeh':
      return '/assets/3d_icons/icon_tasbeeh.png';
    case 'others':
      return '/assets/3d_icons/icon_ruqyah.png';
    case 'prophetic-seerah':
      return '/assets/3d_icons/icon_seerah.png';
    case 'ten-promised':
      return '/assets/3d_icons/icon_ten_promised.png';
    case 'divine-miracles':
      return '/assets/3d_icons/icon_tajweed.png';
    case 'hisn-muslim':
      return '/assets/3d_icons/icon_hisn.png';
    case 'hajj-umrah':
      return '/assets/3d_icons/icon_hajj_umrah.png';
    case 'asmaul-husna':
      return '/assets/3d_icons/icon_asmaul_husna.png';
    case 'habit-tracker':
      return '/assets/3d_icons/icon_habit_tracker.png';
    case 'calculators':
      return '/assets/3d_icons/icon_calculators.png';
    case 'nawawi':
      return '/assets/3d_icons/icon_nawawi.png';
    case 'calendar':
      return '/assets/3d_icons/icon_calendar.png';
    case 'islamic-sites':
      return '/assets/3d_icons/icon_islamic_sites.png';
    case 'voice-control':
      return '/assets/3d_icons/icon_voice_control.png';
    case 'tajweed':
      return '/assets/3d_icons/icon_tajweed.png';
    default:
      return '/assets/3d_icons/icon_more.png';
  }
};

export const getCityNowDate = () => {
  const cityTimezone = typeof localStorage !== 'undefined' ? localStorage.getItem('grandLocationTimezone') : null;
  let current = new Date();
  if (cityTimezone) {
    try {
      const cityTimeStr = current.toLocaleString('en-US', { timeZone: cityTimezone });
      current = new Date(cityTimeStr);
    } catch {}
  }
  return current;
};
