import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import ThemePageLock from '../components/ThemePageLock';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { getPageButtonsGuide, PageButtonItem } from '../data/pageButtonsGuideData';
import NavButton from '../components/MainMenu/NavButton';
import { 
  Play, Pause, Bookmark, Share2, Menu, ChevronDown, 
  RotateCcw, Search, Headphones, Mic, Volume2, 
  Compass, Clock, Calendar, Settings, Palette, 
  SkipForward, SkipBack, Copy, Plus, BookOpen,
  MessageCircle, Trophy, Bell, Moon, Sliders,
  Heart, FileText, Shield, Globe, Calculator, Sparkles,
  CheckCircle2, Crown, RotateCw, Minus, ArrowUpRight, ChevronLeft, ChevronRight, Info
} from 'lucide-react';
import { usePrayerTimes } from '../context/PrayerTimesContext';
import { toArabic } from '../components/QuranReader/constants';
import VerseSection from '../components/MainMenu/VerseSection';
import FloatingNeonTicker from '../components/FloatingNeonTicker';
import { verses } from '../data/mainMenuData';
import { ButtonExplanationModal, ButtonExplanationData } from '../components/PageGuide/ButtonExplanationModal';
import { PageMockupDispatcher } from '../components/PageGuide/PageVisualMockups';

interface PageGuideProps {
  onBack: () => void;
  onNavigate: (pageId: string, params?: any) => void;
  initialPageKey?: string;
}

// مطابقة تامة لعناصر وألوان وترتيب الصفحة الرئيسية
const GREEN_ITEMS = [
  'quran', 'listen', 
  'prayer-times', 'qibla', 'salah-adhkar', 
  'community', 'ahl-al-quran', 
  'nawawi', 'voice-control', 'asmaul-husna',
  'prophetic-seerah'
];

const DEFAULT_MENU_ITEMS = [
  // الصف الاول : بطاقه القران الكريم + بطاقه الاستماع للقران باللون الاخضر
  { id: 'quran', label: "القرآن الكريم", className: "col-span-3 h-11" },
  { id: 'listen', label: "الاستماع للقرآن", className: "col-span-3 h-11" },
  // الصف الثانى : بطاقه مواقيت الصلاه + القبله + اذكار الصلاه باللون الاخضر
  { id: 'prayer-times', label: "مواقيت الصلاة", className: "col-span-2 h-11" },
  { id: 'qibla', label: "القبلة", className: "col-span-2 h-11" },
  { id: 'salah-adhkar', label: "أذكار الصلاة", className: "col-span-2 h-11" },
  // الصف الثالث : بطاقه الادعيه + حصن المسلم + الاذكار باللون البنفسجى
  { id: 'adia', label: "الأدعية", className: "col-span-2 h-11" },
  { id: 'hisn-muslim', label: "حصن المسلم", className: "col-span-2 h-11" },
  { id: 'sabah-masaa', label: "الأذكار", className: "col-span-2 h-11" },
  // الصف الرابع : بطاقه التقويم + الحج والعمرة + السبحه باللون البنفسجى
  { id: 'calendar', label: "التقويم", className: "col-span-2 h-11" },
  { id: 'hajj-umrah', label: "الحج والعمرة", className: "col-span-2 h-11" },
  { id: 'tasbeeh', label: "السبحة", className: "col-span-2 h-11" },
  // الصف الخامس : مجتمع التواصل + اهل القران باللون الاخضر
  { id: 'community', label: "مجتمع التواصل", className: "col-span-3 h-11" },
  { id: 'ahl-al-quran', label: "أهل القرآن", className: "col-span-3 h-11" },
  // الصف السادس : الورد اليومى + التحفيظ + مربى العبادات باللون البنفسجى
  { id: 'daily-wird', label: "الورد اليومي", className: "col-span-2 h-11" },
  { id: 'memorization', label: "التحفيظ", className: "col-span-2 h-11" },
  { id: 'habit-tracker', label: "مربّي العبادات", className: "col-span-2 h-11" },
  // الصف السابع : الرقيه الشرعيه + مواقع اسلاميه + الحاسبه الشرعيه باللون البنفسجى
  { id: 'others', label: "الرقية الشرعية", className: "col-span-2 h-11" },
  { id: 'islamic-sites', label: "مواقع إسلامية", className: "col-span-2 h-11" },
  { id: 'calculators', label: "الحاسبة الشرعية", className: "col-span-2 h-11" },
  // الصف الثامن : الاربعون النوويه + التحكم الصوتى + اسماء الله الحسنى باللون الأخضر
  { id: 'nawawi', label: "الأربعون النووية", className: "col-span-2 h-11" },
  { id: 'voice-control', label: "التحكم الصوتي", className: "col-span-2 h-11" },
  { id: 'asmaul-husna', label: "أسماء الله الحسنى", className: "col-span-2 h-11" },
  // صف السيرة والخط الزمني باللون الأخضر
  { id: 'prophetic-seerah', label: "السيرة والخط الزمني", className: "col-span-6 h-10 flex justify-center" },
];

export const PageGuide: React.FC<PageGuideProps> = ({ 
  onBack, 
  onNavigate,
  initialPageKey 
}) => {
  const { theme, themeKey } = useTheme();
  const isBlackTheme = theme?.bgColor === '#000000' || themeKey === 'deep_black';
  const isDefaultTheme = themeKey === 'default';

  const primaryAccent = isBlackTheme 
    ? '#FFFFFF' 
    : (isDefaultTheme ? '#10b981' : (theme?.palette?.[0] || '#10b981'));

  const textColor = isBlackTheme ? '#FFFFFF' : (theme?.textColor || '#1f2937');
  const cardBorderColor = isDefaultTheme 
    ? '#000000' 
    : (isBlackTheme ? '#FFFFFF' : (theme?.palette?.[0] ? `${theme.palette[0]}` : '#10b981'));

  const cardBg = isBlackTheme 
    ? '#0d0d0d' 
    : (theme?.cardBg || 'rgba(255, 255, 255, 0.9)');

  const [selectedPageId, setSelectedPageId] = useState<string | null>(initialPageKey || null);
  const [inspectedElement, setInspectedElement] = useState<ButtonExplanationData | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // الاعتراض عند الضغط على زر الرجوع في الهاتف للعودة إلى قائمة الصفحات
  useEffect(() => {
    const interceptor = () => {
      if (selectedPageId) {
        setSelectedPageId(null);
        return true;
      }
      return false;
    };
    const unregister = registerBackInterceptor(interceptor);
    return unregister;
  }, [selectedPageId]);

  // التمرير لأعلى عند تغيير الصفحة
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [selectedPageId]);

  const selectedGuide = selectedPageId ? getPageButtonsGuide(selectedPageId) : null;

  const [currentVerse, setCurrentVerse] = useState(() => {
    const randomIndex = Math.floor(Math.random() * verses.length);
    return verses[randomIndex];
  });

  const [verseFontSize] = useState(() => {
    const saved = localStorage.getItem('mainMenuVerseFontSize');
    return saved ? parseFloat(saved) : 1.15;
  });

  const [verseSettings] = useState(() => {
    const saved = localStorage.getItem('mainMenuVerseSettings');
    return saved ? JSON.parse(saved) : {
      fontFamily: theme?.font || 'Amiri',
      bgColor: 'transparent',
      textColor: theme?.textColor || '#1f2937'
    };
  });

  const handleNextVerse = () => {
    const currentIndex = verses.findIndex(v => v.text === currentVerse.text);
    const nextIndex = (currentIndex + 1) % verses.length;
    setCurrentVerse(verses[nextIndex]);
  };

  const { times, nextPrayer, countdown } = usePrayerTimes();
  const getSalahStats = () => {
    if (!nextPrayer || !times || Object.keys(times).length === 0) {
      return { prev: 'العصر', next: 'المغرب', remaining: '01:25:40' };
    }
    const salahKeys = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    let nextIndex = salahKeys.indexOf(nextPrayer.key);
    if (nextPrayer.key === 'Sunrise') nextIndex = 1;
    const prevIndex = (nextIndex - 1 + salahKeys.length) % salahKeys.length;
    const actualNextIndex = nextIndex % salahKeys.length;
    const prayerNamesAr: Record<string, string> = {
      Fajr: 'الفجر',
      Sunrise: 'الشروق',
      Dhuhr: 'الظهر',
      Asr: 'العصر',
      Maghrib: 'المغرب',
      Isha: 'العشاء'
    };
    return {
      prev: prayerNamesAr[salahKeys[prevIndex]] || 'العصر',
      next: prayerNamesAr[salahKeys[actualNextIndex]] || 'المغرب',
      remaining: countdown || '01:25:40'
    };
  };
  const { prev: prevSalah, next: nextSalah, remaining: prayerCountdown } = getSalahStats();

  const handleBack = () => {
    if (selectedPageId) {
      setSelectedPageId(null);
    } else {
      onBack();
    }
  };

  const handleGoHome = () => {
    setSelectedPageId(null);
    onNavigate('home');
  };

  // دالة لتجسيد الأيقونة المحددة بدقة واحترافية وبأعلى وضوح
  const renderIcon = (btn: PageButtonItem) => {
    const iconStr = btn.icon || '';
    const id = btn.id || '';

    // زر المشاركة (مطابق تماماً للصورة المرفقة رقم 2)
    if (id === 'btn_share_ayah' || id.includes('share') || iconStr.includes('share')) {
      return <Share2 size={22} className="text-black dark:text-white stroke-[2.2]" />;
    }

    // زر الإشارة المرجعية (مطابق تماماً للصورة المرفقة رقم 3)
    if (id.includes('bookmark') || iconStr.includes('bookmark')) {
      return <Bookmark size={22} className="text-black dark:text-white stroke-[2.2]" />;
    }

    // زر التلاوة / التشغيل (مطابق تماماً للصورة المرفقة رقم 4)
    if (id.includes('play') || iconStr.includes('play')) {
      return <Play size={20} className="fill-black text-black dark:fill-white dark:text-white ml-0.5" />;
    }

    // زر القائمة والشريط الجانبي (مطابق تماماً للصورة المرفقة رقم 5)
    if (id.includes('menu') || iconStr.includes('bars')) {
      return <Menu size={22} className="text-black dark:text-white stroke-[2.5]" />;
    }

    if (iconStr.includes('angles-down') || iconStr.includes('chevron-down') || id.includes('autoscroll')) {
      return <ChevronDown size={24} className="text-black dark:text-white stroke-[2.5]" />;
    }

    if (iconStr.includes('pause')) {
      return <Pause size={22} className="text-black dark:text-white stroke-[2.5]" />;
    }

    if (iconStr.includes('headphones')) {
      return <Headphones size={22} className="text-black dark:text-white stroke-[2.2]" />;
    }

    if (iconStr.includes('rotate') || iconStr.includes('repeat') || iconStr.includes('arrows-rotate')) {
      return <RotateCcw size={20} className="text-black dark:text-white" />;
    }

    if (iconStr.includes('search') || iconStr.includes('magnifying-glass')) {
      return <Search size={20} className="text-black dark:text-white" />;
    }

    if (iconStr.includes('microphone') || iconStr.includes('mic')) {
      return <Mic size={22} className="text-black dark:text-white" />;
    }

    if (iconStr.includes('volume') || iconStr.includes('sound')) {
      return <Volume2 size={22} className="text-black dark:text-white" />;
    }

    if (iconStr.includes('compass')) {
      return <Compass size={22} className="text-black dark:text-white" />;
    }

    if (iconStr.includes('clock')) {
      return <Clock size={20} className="text-black dark:text-white" />;
    }

    if (iconStr.includes('calendar')) {
      return <Calendar size={20} className="text-black dark:text-white" />;
    }

    if (iconStr.includes('gear') || iconStr.includes('sliders')) {
      return <Settings size={20} className="text-black dark:text-white" />;
    }

    if (iconStr.includes('palette')) {
      return <Palette size={20} className="text-black dark:text-white" />;
    }

    if (iconStr.includes('copy')) {
      return <Copy size={20} className="text-black dark:text-white" />;
    }

    if (iconStr.includes('forward') || iconStr.includes('next')) {
      return <SkipForward size={20} className="text-black dark:text-white" />;
    }

    if (iconStr.includes('backward') || iconStr.includes('prev')) {
      return <SkipBack size={20} className="text-black dark:text-white" />;
    }

    if (iconStr.includes('plus')) {
      return <Plus size={20} className="text-black dark:text-white" />;
    }

    if (iconStr.includes('comments') || iconStr.includes('message') || id.includes('community')) {
      return <MessageCircle size={22} className="text-black dark:text-white stroke-[2.2]" />;
    }

    if (iconStr.includes('whatsapp') || id.includes('whatsapp')) {
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.361.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      );
    }

    if (iconStr.includes('trophy') || id.includes('ahl_al_quran')) {
      return <Trophy size={22} className="text-black dark:text-white stroke-[2.2]" />;
    }

    if (iconStr.includes('bell')) {
      return <Bell size={20} className="text-black dark:text-white" />;
    }

    if (iconStr.includes('moon')) {
      return <Moon size={20} className="text-black dark:text-white" />;
    }

    if (iconStr.includes('heart')) {
      return <Heart size={20} className="text-black dark:text-white" />;
    }

    if (iconStr.includes('shield')) {
      return <Shield size={20} className="text-black dark:text-white" />;
    }

    if (iconStr.includes('globe')) {
      return <Globe size={20} className="text-black dark:text-white" />;
    }

    if (iconStr.includes('calculator')) {
      return <Calculator size={20} className="text-black dark:text-white" />;
    }

    return <i className={`${iconStr} text-lg text-black dark:text-white`}></i>;
  };

  // نسخ وتجسيد شكل الزر أو الأيقونة بدقة تامة ومطابقة 100% للتصميمات الحقيقية بالصفحات
  const renderVisualButton = (btn: PageButtonItem) => {
    const isSingleClick = btn.name.includes('نقرة واحدة') || btn.label?.includes('نقرة');
    const isLongPress = btn.name.includes('ضغط مطول') || btn.label?.includes('مطول');

    // 0. أيقونات جانبي السيرة والخط الزمني الأربعة (مجتمع التواصل، واتساب، التحكم الصوتي، أهل القرآن)
    if (btn.id === 'seerah_side_community') {
      return (
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <div 
            className="w-11 h-11 rounded-full flex items-center justify-center shadow-md border-2 relative"
            style={{
              backgroundColor: isBlackTheme ? '#18181b' : '#ffffff',
              borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#10b981',
              color: isBlackTheme ? '#ffffff' : '#10b981'
            }}
          >
            <MessageCircle className="w-5 h-5" />
            <span className="absolute -top-1.5 -right-1.5 min-w-[19px] h-[19px] px-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-md leading-none">
              +99
            </span>
          </div>
          <span className="text-[10px] font-bold opacity-80 text-center">مجتمع التواصل</span>
        </div>
      );
    }

    if (btn.id === 'seerah_side_whatsapp') {
      return (
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <div className="w-11 h-11 rounded-full flex items-center justify-center shadow-md border-2 border-white bg-[#25D366]">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.361.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
          <span className="text-[10px] font-bold opacity-80 text-center">تواصل واتساب</span>
        </div>
      );
    }

    if (btn.id === 'seerah_side_voice') {
      return (
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <div 
            className="w-11 h-11 rounded-full flex items-center justify-center shadow-md border-2 border-white"
            style={{ backgroundColor: theme.palette?.[0] || '#10b981' }}
          >
            <Mic className="w-5 h-5 text-white" />
          </div>
          <span className="text-[10px] font-bold opacity-80 text-center">التحكم الصوتي</span>
        </div>
      );
    }

    if (btn.id === 'seerah_side_ahl_al_quran') {
      return (
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <div 
            className="w-11 h-11 rounded-full flex items-center justify-center shadow-md border-2 relative"
            style={{
              backgroundColor: isBlackTheme ? '#18181b' : '#ffffff',
              borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#f59e0b',
              color: '#f59e0b'
            }}
          >
            <Trophy className="w-5 h-5 text-amber-500" />
            <span className="absolute -top-1.5 -right-1.5 min-w-[19px] h-[19px] px-1 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-md leading-none">
              1#
            </span>
          </div>
          <span className="text-[10px] font-bold opacity-80 text-center">لوحة المتصدرين</span>
        </div>
      );
    }

    // 1. آية المصحف الشريف (نقرة واحدة أو ضغط مطول على نص الآية)
    if (btn.id === 'ayah_single_click' || btn.id === 'ayah_long_press') {
      return (
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <div className="px-2.5 py-1 rounded-lg border border-emerald-500/50 bg-emerald-500/15 shadow-sm flex items-center justify-center text-center">
            <span className="font-['Amiri_Quran',serif] text-xs font-bold text-emerald-950 dark:text-emerald-100 select-none whitespace-nowrap">
              النص القرآني
            </span>
          </div>
          {isSingleClick && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
              نقرة واحدة
            </span>
          )}
          {isLongPress && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 whitespace-nowrap">
              ضغط مطول
            </span>
          )}
        </div>
      );
    }

    // 2. رقم الآية القرآني المزخرف (نقرة واحدة أو ضغط مطول)
    if (btn.id === 'verse_num_single_click' || btn.id === 'verse_num_long_press') {
      return (
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/40 shadow-sm flex items-center justify-center">
            <span className="text-xs font-['Amiri_Quran',serif] font-bold select-none leading-none inline-flex items-center gap-0.5 whitespace-nowrap">
              <span className="text-amber-600 dark:text-amber-400 text-sm">﴿</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold px-0.5">رقم الآية</span>
              <span className="text-amber-600 dark:text-amber-400 text-sm">﴾</span>
            </span>
          </div>
          {isSingleClick && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
              نقرة واحدة
            </span>
          )}
          {isLongPress && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 whitespace-nowrap">
              ضغط مطول
            </span>
          )}
        </div>
      );
    }

    // 3. ترويسة السورة العثمانية (نقرة واحدة أو ضغط مطول)
    if (btn.id === 'surah_header_single_click' || btn.id === 'surah_header_long_press') {
      return (
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <div className="px-2.5 py-1 rounded-xl border-2 border-emerald-600/70 dark:border-emerald-400/70 bg-gradient-to-r from-emerald-600/15 via-emerald-600/25 to-emerald-600/15 shadow-sm text-center">
            <span className="font-['Amiri_Quran',serif] font-black text-xs text-emerald-900 dark:text-emerald-200 whitespace-nowrap">
              اسم السورة
            </span>
          </div>
          {isSingleClick && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
              نقرة واحدة
            </span>
          )}
          {isLongPress && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 whitespace-nowrap">
              ضغط مطول
            </span>
          )}
        </div>
      );
    }

    // 4. زر إدخال ورقم الصفحة في الشريط العلوي للمصحف
    if (btn.id === 'header_page_input') {
      return (
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <div className="h-9 min-w-[56px] px-2 rounded-lg bg-white dark:bg-slate-900 border border-black dark:border-white shadow-md flex items-center justify-center font-bold text-xs text-black dark:text-white whitespace-nowrap">
            رقم الصفحة
          </div>
        </div>
      );
    }

    // 5. زر اسم السورة والفهرس بالشريط العلوي
    if (btn.id === 'header_surah_name_btn') {
      return (
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <div className="h-9 px-2.5 rounded-xl bg-white dark:bg-slate-900 border border-black dark:border-white shadow-md flex items-center justify-center font-bold text-xs text-black dark:text-white whitespace-nowrap">
            اسم السورة
          </div>
        </div>
      );
    }

    // 6. الأزرار الدائرية المطابقة تماماً لأيقونات الصفحات
    if (btn.visualType === 'circle-button') {
      return (
        <div className="flex flex-col items-center justify-center gap-1.5 shrink-0">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center bg-white dark:bg-slate-900 border border-black dark:border-white shadow-md text-black dark:text-white relative transition-transform hover:scale-105"
          >
            {renderIcon(btn)}
          </div>
          {isSingleClick && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
              نقرة واحدة
            </span>
          )}
          {isLongPress && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 whitespace-nowrap">
              ضغط مطول
            </span>
          )}
        </div>
      );
    }

    // 7. أزرار العدادات والبطاقات التفاعلية (مثل عدادات التسبيح والأذكار)
    if (btn.visualType === 'counter-button') {
      const displayLabel = (btn.label && btn.label.length <= 15) ? btn.label : '';
      return (
        <div className="flex flex-col items-center gap-1.5 w-full max-w-[85px] sm:max-w-[95px] shrink-0">
          <div className="py-1.5 px-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-black dark:border-white shadow-md flex items-center justify-center gap-1.5 font-black text-xs text-black dark:text-white w-full">
            {renderIcon(btn)}
            {displayLabel && <span className="truncate max-w-[55px] text-center">{displayLabel}</span>}
          </div>
          {isSingleClick && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
              نقرة واحدة
            </span>
          )}
          {isLongPress && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 whitespace-nowrap">
              ضغط مطول
            </span>
          )}
        </div>
      );
    }

    // 8. الأزرار الكبسولية (Pill buttons مثل التبويبات وخيارات القراءة)
    if (btn.visualType === 'pill-button') {
      const displayLabel = (btn.label && btn.label.length <= 15) ? btn.label : '';
      return (
        <div className="flex flex-col items-center gap-1.5 w-full max-w-[85px] sm:max-w-[95px] shrink-0">
          <div className="py-1.5 px-2.5 rounded-full bg-white dark:bg-slate-900 border border-black dark:border-white shadow-md flex items-center justify-center gap-1.5 font-bold text-xs text-black dark:text-white w-full">
            {renderIcon(btn)}
            {displayLabel && <span className="truncate max-w-[55px] text-center">{displayLabel}</span>}
          </div>
          {isSingleClick && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
              نقرة واحدة
            </span>
          )}
          {isLongPress && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 whitespace-nowrap">
              ضغط مطول
            </span>
          )}
        </div>
      );
    }

    // 9. أزرار التبديل والتشغيل (Toggle buttons)
    if (btn.visualType === 'toggle-button') {
      const displayLabel = (btn.label && btn.label.length <= 15) ? btn.label : '';
      return (
        <div className="flex flex-col items-center gap-1 w-full max-w-[85px] sm:max-w-[95px] shrink-0">
          <div className="py-1 px-2 rounded-full bg-white dark:bg-slate-900 border border-black dark:border-white shadow-md flex items-center justify-center gap-1 font-bold text-xs text-black dark:text-white w-full">
            {renderIcon(btn)}
            {displayLabel && <span className="truncate max-w-[45px] text-center">{displayLabel}</span>}
            <div className="w-5 h-3 bg-emerald-500 rounded-full flex items-center justify-end px-0.5 shrink-0">
              <div className="w-2 h-2 bg-white rounded-full shadow-sm" />
            </div>
          </div>
        </div>
      );
    }

    // 10. بطاقات الخيارات والأقسام (Card buttons)
    const displayLabel = (btn.label && btn.label.length <= 15) ? btn.label : '';
    return (
      <div className="flex flex-col items-center gap-1.5 w-full max-w-[85px] sm:max-w-[95px] shrink-0">
        <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-black dark:border-white shadow-md flex items-center justify-center gap-1.5 font-bold text-xs text-black dark:text-white text-center w-full">
          {renderIcon(btn)}
          {displayLabel && <span className="max-w-[55px] truncate">{displayLabel}</span>}
        </div>
        {isSingleClick && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
            نقرة واحدة
          </span>
        )}
        {isLongPress && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 whitespace-nowrap">
            ضغط مطول
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-transparent relative select-none" dir="rtl">
      {/* شريط علوي للصفحة مطابق تماماً 100% للهيدر الأصلي لكل صفحة بالصور */}
      <header className="app-top-bar shrink-0">
        <div className="app-top-bar__inner">
          <div className="relative flex items-center justify-between w-full min-h-[44px]">
            {/* جهة اليمين: سهم الرجوع للخلف (مع أيقونة البوصلة في مواقيت الصلاة) */}
            <div className="flex items-center gap-1 z-10">
              <button
                onClick={handleBack}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                title={selectedPageId ? "العودة لقائمة الصفحات" : "رجوع للخلف"}
                aria-label="رجوع للخلف"
              >
                <i className="fa-solid fa-arrow-right text-xl"></i>
              </button>

              {selectedPageId === 'prayer-times' && (
                <div 
                  className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
                  onClick={() => setInspectedElement({
                    title: 'زر بوصلة القبلة بالهيدر',
                    purpose: 'ينتقل بك مباشرة من صفحة مواقيت الصلاة إلى بوصلة القبلة لتحديد اتجاه الكعبة المشرفة فورياً.'
                  })}
                >
                  <Compass size={20} />
                </div>
              )}
            </div>

            {/* عنوان الصفحة في الوسط مطابق 100% للصورة */}
            <div className="text-center px-2 min-w-0 flex-1">
              {selectedPageId === 'prayer-times' ? (
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => setInspectedElement({
                    title: 'مؤشر المدينة والموقع الجغرافي بالهيدر',
                    purpose: 'يعرض اسم المدينة والمحافظة المحددة حالياً وكود الدولة، وبالنقر عليه يمكنك تغيير المدينة أو تحديث الموقع عبر GPS.'
                  })}
                >
                  <span className="text-xs sm:text-sm font-black truncate max-w-[200px] sm:max-w-xs">
                    Dammam - Eastern Province
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold opacity-75">
                    <span className="bg-black/10 dark:bg-white/10 px-1 rounded text-[9px]">+966</span>
                    <span>Saudi Arabia</span>
                  </div>
                </div>
              ) : selectedPageId === 'listen' ? (
                <h1 
                  className="app-top-bar__title text-lg sm:text-xl font-kufi truncate flex items-center justify-center gap-2 cursor-pointer"
                  onClick={() => setInspectedElement({
                    title: 'عنوان صفحة الاستماع للقرآن',
                    purpose: 'صفحة الاستماع إلى المصحف المرتل والمجود بأصوات كبار قراء العالم الإسلامي مع ميزات التكرار ومؤقت النوم والمفضلات.'
                  })}
                >
                  <Heart size={18} className="text-red-500 fill-current" />
                  <span>الاستماع للقرآن</span>
                </h1>
              ) : (
                <h1 className="app-top-bar__title text-lg sm:text-xl font-kufi truncate max-w-[240px] sm:max-w-md mx-auto">
                  {selectedPageId 
                    ? ({
                        'tasbeeh': 'السبحة الإلكترونية',
                        'quran': 'القرآن الكريم',
                        'listen': 'الاستماع للقرآن',
                        'prayer-times': 'مواقيت الصلاة',
                        'qibla': 'اتجاه القبلة',
                        'salah-adhkar': 'أذكار الصلوات',
                        'adia': 'الأدعية المأثورة',
                        'hisn-muslim': 'حصن المسلم',
                        'sabah-masaa': 'أذكار الصباح',
                        'calendar': 'التقويم',
                        'hajj-umrah': 'الحج والعمرة',
                        'community': 'مجتمع التواصل',
                        'ahl-al-quran': 'أهل القرآن الكريم',
                        'daily-wird': 'الورد اليومي',
                        'memorization': 'التحفيظ والمراجعة',
                        'habit-tracker': 'مربّي العبادات',
                        'others': 'الرقية الشرعية',
                        'islamic-sites': 'مواقع إسلامية',
                        'calculators': 'الحاسبة الشرعية',
                        'nawawi': 'الأربعون النووية',
                        'voice-control': 'التحكم الصوتي',
                        'asmaul-husna': 'أسماء الله الحسنى',
                        'prophetic-seerah': 'السيرة والخط الزمني',
                        'side-community': 'مجتمع التواصل',
                        'side-whatsapp': 'تواصل واتساب',
                        'side-voice': 'التحكم الصوتي',
                        'side-ahl-al-quran': 'أهل القرآن الكريم'
                      }[selectedPageId] || selectedGuide?.pageName || 'دليل صفحات التطبيق')
                    : 'دليل صفحات التطبيق'}
                </h1>
              )}
            </div>

            {/* أدوات الهيدر اليسرى مطابقة تماماً للصور */}
            <div className="flex items-center gap-1 z-10">
              {/* في صفحة السبحة فقط يظهر قفل الثيم كما بالصورة */}
              {selectedPageId === 'tasbeeh' ? (
                <ThemePageLock />
              ) : selectedPageId === 'community' || selectedPageId === 'side-community' ? (
                /* في صفحة المجتمع: أيقونة المصحف + شارة المستخدم + الكأس + المنزل */
                <div className="flex items-center gap-1">
                  <div 
                    className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center cursor-pointer"
                    onClick={() => setInspectedElement({
                      title: 'زر فتح المصحف الشريف من المجتمع',
                      purpose: 'يتيح لك الانتقال السريع للمصحف لقراءة القرآن أو مشاركة آية مباشرة داخل محادثات المجتمع.'
                    })}
                  >
                    <BookOpen size={16} />
                  </div>
                  <div 
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-black/20 dark:border-white/20 text-[11px] font-bold cursor-pointer"
                    onClick={() => setInspectedElement({
                      title: 'شارة الملف الشخصي والدولة',
                      purpose: 'تعرض اسم حسابك وصورتك وعلم دولتك، وبالنقر عليها تفتح نافذة تعديل بياناتك الشخصية.'
                    })}
                  >
                    <div className="w-5 h-5 rounded-full bg-slate-300 flex items-center justify-center text-[10px]">👤</div>
                    <span>مستخدم افتراضي</span>
                    <span>🌐</span>
                  </div>
                  <div 
                    className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center text-amber-500 cursor-pointer"
                    onClick={() => setInspectedElement({
                      title: 'زر لوحة المتصدرين (الكأس)',
                      purpose: 'يفتح لوحة شرف متصدري قراءة القرآن الكريم ونشاط المجتمع لهذا الشهر.'
                    })}
                  >
                    <Trophy size={16} />
                  </div>
                  <button
                    onClick={handleGoHome}
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    title="الصفحة الرئيسية"
                  >
                    <i className="fa-solid fa-house text-base"></i>
                  </button>
                </div>
              ) : selectedPageId === 'prayer-times' ? (
                /* في صفحة مواقيت الصلاة: الترس + المنزل */
                <div className="flex items-center gap-1">
                  <div 
                    className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
                    onClick={() => setInspectedElement({
                      title: 'زر إعدادات مواقيت الصلاة والأذان',
                      purpose: 'يفتح إعدادات طرق الحساب الفلكي، اختيار نغمة الأذان لكل فريضة، معايرة دقائق الصلوات، وتفعيل منبه الإقامة.'
                    })}
                  >
                    <Settings size={18} />
                  </div>
                  <button
                    onClick={handleGoHome}
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    title="الصفحة الرئيسية"
                  >
                    <i className="fa-solid fa-house text-base"></i>
                  </button>
                </div>
              ) : selectedPageId === 'qibla' ? (
                /* في صفحة القبلة: أيقونة البوصلة + المنزل */
                <div className="flex items-center gap-1">
                  <div 
                    className="w-9 h-9 rounded-full flex items-center justify-center text-emerald-600 cursor-pointer"
                    onClick={() => setInspectedElement({
                      title: 'أيقونة معايرة البوصلة بالهيدر',
                      purpose: 'تتيح فحص دقة مستشعر البوصلة وتوجيهك لمعايرته بحركة 8 بالهواء عند وجود تداخل مغناطيسي.'
                    })}
                  >
                    <Compass size={18} />
                  </div>
                  <button
                    onClick={handleGoHome}
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    title="الصفحة الرئيسية"
                  >
                    <i className="fa-solid fa-house text-base"></i>
                  </button>
                </div>
              ) : selectedPageId === 'ahl-al-quran' || selectedPageId === 'side-ahl-al-quran' ? (
                /* في صفحة أهل القرآن: أيقونة المصحف + المنزل */
                <div className="flex items-center gap-1">
                  <div 
                    className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
                    onClick={() => setInspectedElement({
                      title: 'زر الانتقال للمصحف الشريف',
                      purpose: 'ينقلك مباشرة لصفحات القرآن الكريم لقراءة وردك وزيادة صفحاتك المسجلة في المسابقة.'
                    })}
                  >
                    <BookOpen size={18} />
                  </div>
                  <button
                    onClick={handleGoHome}
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    title="الصفحة الرئيسية"
                  >
                    <i className="fa-solid fa-house text-base"></i>
                  </button>
                </div>
              ) : (
                /* باقي الصفحات: قفل الثيم + زر الصفحة الرئيسية المنزل مطابق للصور الأصلية تماماً */
                <div className="flex items-center gap-1">
                  <ThemePageLock />
                  <button
                    onClick={handleGoHome}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                    title="الصفحة الرئيسية"
                    aria-label="الصفحة الرئيسية"
                  >
                    <i className="fa-solid fa-house text-xl"></i>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <div 
        ref={containerRef} 
        className="w-full flex-1 overflow-y-auto px-3 sm:px-4 pt-3 pb-12 custom-scrollbar"
        style={{ color: textColor }}
      >
        <div className="max-w-2xl mx-auto">
          
          {/* ========================================================= */}
          {/* أولاً: عرض كل بطاقات ومكونات الصفحة الرئيسية بنفس الترتيب التام مع شرح موجز عنها */}
          {/* ========================================================= */}
          {!selectedPageId && (
            <div className="w-full max-w-sm sm:max-w-md mx-auto flex flex-col gap-3 pb-8" dir="rtl">

              {/* الآية القرآنية الكريمة - مطابقة تماماً للصفحة الرئيسية */}
              <div 
                id="verse-section" 
                className="w-full cursor-pointer transition-transform active:scale-[0.99]" 
                onClick={handleNextVerse}
                title="اضغط لتغيير الآية"
              >
                <VerseSection 
                  currentVerse={currentVerse}
                  verseFontSize={verseFontSize}
                  theme={theme}
                  verseSettings={verseSettings}
                />
              </div>

              {/* عنوان التطبيق: مصحف أحمد وليلى - مطابق للصفحة الرئيسية */}
              <div className="w-full text-center select-none pt-0.5">
                <h1 
                  id="app-title" 
                  className="text-3xl sm:text-4xl font-black tracking-tight" 
                  style={{ color: isBlackTheme ? '#FFFFFF' : theme.textColor }}
                >
                  مُصْحَفُ أَحْمَدَ وَلَيْلَى
                </h1>
              </div>

              {/* الدعاء والشريط الإعلاني المتحرك */}
              <div className="relative z-10 text-center select-none -mt-1 mb-1">
                <div className="relative min-h-[32px] max-w-sm mx-auto flex items-center justify-center px-4">
                  <p className="text-[15px] font-black" style={{ color: isBlackTheme ? '#FFFFFF' : (themeKey === 'default' ? '#a855f7' : (themeKey === 'olive_grove' ? '#4D7C0F' : theme.textColor)) }}>
                    نرجوا الدعاء لهم بالرحمة والمغفرة
                  </p>
                  <FloatingNeonTicker />
                </div>
              </div>

              {/* شبكة أزرار وبطاقات خدمات وصفحات التطبيق (الـ 23 زر) */}
              <div className="w-full flex flex-col gap-2.5 transition-all">

                {/* شبكة الأزرار الـ 23 بنفس ترتيب وتوزيع ألوان الصفحة الرئيسية */}
                <div className="grid grid-cols-6 gap-x-2 gap-y-2.5 w-full mx-auto content-center relative py-1" dir="rtl">
                  {DEFAULT_MENU_ITEMS.map((item) => {
                    const isGreen = GREEN_ITEMS.includes(item.id);
                    const buttonColor = isBlackTheme
                      ? '#000000'
                      : (isDefaultTheme
                          ? (isGreen ? '#059669' : '#8B5CF6')
                          : (isGreen ? (theme.palette?.[0] || '#059669') : (theme.palette?.[1] || theme.palette?.[0] || '#8B5CF6')));
                    const buttonBorder = isBlackTheme ? '1px solid rgba(255, 255, 255, 0.25)' : theme.btnBorder;

                    // صف السيرة والخط الزمني مع الأيقونات الأربعة بجانبيه
                    if (item.id === 'prophetic-seerah') {
                      return (
                        <div key={item.id} className="col-span-6 h-10 flex items-center justify-center gap-1.5 sm:gap-2 w-full px-1">
                          {/* 1. أيقونة مجتمع التواصل */}
                          <button
                            type="button"
                            onClick={() => setSelectedPageId('side-community')}
                            className="w-9 h-9 rounded-full flex items-center justify-center shadow-lg border-2 shrink-0 relative transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                            style={{
                              backgroundColor: isBlackTheme ? '#18181b' : (theme.isGlass ? 'rgba(255, 255, 255, 0.2)' : (theme.cardBg || '#ffffff')),
                              borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : (theme.palette?.[0] || '#10b981'),
                              color: isBlackTheme ? '#ffffff' : (theme.palette?.[0] || '#10b981')
                            }}
                            title="شرح أيقونة مجتمع التواصل"
                            aria-label="شرح أيقونة مجتمع التواصل"
                          >
                            <MessageCircle className="w-5 h-5" />
                            <span 
                              className="absolute -top-1.5 -right-1.5 min-w-[19px] h-[19px] px-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-md leading-none"
                              style={{ backgroundColor: '#DC2626' }}
                            >
                              +99
                            </span>
                          </button>

                          {/* 2. أيقونة الواتساب */}
                          <button
                            type="button"
                            onClick={() => setSelectedPageId('side-whatsapp')}
                            className="w-9 h-9 rounded-full flex items-center justify-center shadow-lg border-2 border-white shrink-0 relative transition-transform hover:scale-105 active:scale-95 cursor-pointer bg-[#25D366]"
                            title="شرح أيقونة الواتساب"
                            aria-label="شرح أيقونة الواتساب"
                          >
                            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.361.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                          </button>

                          {/* زر السيرة والخط الزمني في المنتصف */}
                          <div className="flex-1 min-w-[130px] max-w-[210px] h-full">
                            <NavButton
                              label={item.label}
                              onClick={() => setSelectedPageId(item.id)}
                              className="w-full h-full shadow-lg"
                              color={buttonColor}
                              border={buttonBorder}
                              isGlass={theme.isGlass}
                              btnText="#FFFFFF"
                            />
                          </div>

                          {/* 3. أيقونة التحكم الصوتي */}
                          <button
                            type="button"
                            onClick={() => setSelectedPageId('side-voice')}
                            className="w-9 h-9 rounded-full flex items-center justify-center shadow-lg border-2 border-white shrink-0 relative transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                            style={{
                              backgroundColor: theme.palette?.[0] || '#10b981'
                            }}
                            title="شرح أيقونة التحكم الصوتي"
                            aria-label="شرح أيقونة التحكم الصوتي"
                          >
                            <Mic className="w-5 h-5 text-white" />
                          </button>

                          {/* 4. أيقونة أهل القرآن */}
                          <button
                            type="button"
                            onClick={() => setSelectedPageId('side-ahl-al-quran')}
                            className="w-9 h-9 rounded-full flex items-center justify-center shadow-lg border-2 shrink-0 relative transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                            style={{
                              backgroundColor: isBlackTheme ? '#18181b' : (theme.isGlass ? 'rgba(255, 255, 255, 0.2)' : (theme.cardBg || '#ffffff')),
                              borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#f59e0b',
                              color: '#f59e0b'
                            }}
                            title="شرح أيقونة أهل القرآن"
                            aria-label="شرح أيقونة أهل القرآن"
                          >
                            <Trophy className="w-5 h-5 text-amber-500" />
                            <span 
                              className="absolute -top-1.5 -right-1.5 min-w-[19px] h-[19px] px-1 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-md leading-none"
                            >
                              1#
                            </span>
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div key={item.id} className={item.className}>
                        <NavButton
                          label={item.label}
                          onClick={() => setSelectedPageId(item.id)}
                          className="w-full h-full shadow-lg"
                          color={buttonColor}
                          border={buttonBorder}
                          isGlass={theme.isGlass}
                          btnText="#FFFFFF"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* بطاقة حالة ومواقيت الصلاة */}
              <div 
                className="p-2 rounded-2xl shadow-md border-2 transition-all duration-300"
                style={{ borderColor: cardBorderColor, backgroundColor: isBlackTheme ? '#141414' : (theme?.cardBg || 'rgba(255, 255, 255, 0.8)') }}
              >
                <div className="grid grid-cols-3 gap-2">
                  {/* الصلاة السابقة */}
                  <div className="py-2 px-1 rounded-xl text-center flex flex-col justify-center items-center shadow-sm border-2 transition-all" style={{ borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.3)' : `${theme.palette?.[0] || '#10b981'}33`, backgroundColor: cardBg }}>
                    <span className="text-[10px] opacity-70 font-bold mb-0.5">السابقة</span>
                    <span className="text-sm sm:text-base font-black truncate w-full" style={{ color: textColor }}>{prevSalah}</span>
                  </div>

                  {/* الوقت المتبقي */}
                  <div className="py-2 px-1 rounded-xl text-center flex flex-col justify-center items-center shadow-md border-2 relative overflow-hidden" style={{ borderColor: cardBorderColor, backgroundColor: cardBg }}>
                    <span className="text-[10px] opacity-70 font-bold mb-0.5">متبقي</span>
                    <span className="text-sm sm:text-base font-mono font-black tracking-wider" style={{ color: textColor }}>{prayerCountdown}</span>
                  </div>

                  {/* الصلاة القادمة */}
                  <div className="py-2 px-1 rounded-xl text-center flex flex-col justify-center items-center shadow-sm border-2 transition-all" style={{ borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.3)' : `${theme.palette?.[0] || '#10b981'}33`, backgroundColor: cardBg }}>
                    <span className="text-[10px] opacity-70 font-bold mb-0.5">القادمة</span>
                    <span className="text-sm sm:text-base font-black truncate w-full" style={{ color: textColor }}>{nextSalah}</span>
                  </div>
                </div>
              </div>

              {/* بطاقة متصدري أهل القرآن */}
              <div 
                className="p-3 rounded-2xl shadow-md border-2 flex flex-col gap-2.5"
                style={{ borderColor: cardBorderColor, backgroundColor: isBlackTheme ? '#141414' : (theme?.cardBg || 'rgba(255, 255, 255, 0.8)') }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5" style={{ color: primaryAccent }}>
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-black font-kufi">متصدرو أهل القرآن</span>
                  </div>
                  <span className="text-[10px] font-bold opacity-70">المراكز الثلاثة الأولى</span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  {/* المركز الثاني */}
                  <div className="p-2 rounded-xl border flex flex-col items-center text-center gap-1" style={{ borderColor: isBlackTheme ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.08)', backgroundColor: cardBg }}>
                    <span className="w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-white text-[10px] font-black flex items-center justify-center">2#</span>
                    <span className="text-xs font-bold truncate w-full" style={{ color: textColor }}>المتسابق الثاني</span>
                    <span className="text-[10px] opacity-70 font-mono">٤٢٠ صفحة</span>
                  </div>

                  {/* المركز الأول */}
                  <div className="p-2 rounded-xl border-2 flex flex-col items-center text-center gap-1 relative shadow-sm" style={{ borderColor: '#f59e0b', backgroundColor: cardBg }}>
                    <Crown className="w-4 h-4 text-amber-500" />
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center -mt-1">1#</span>
                    <span className="text-xs font-black truncate w-full" style={{ color: textColor }}>المتصدر الأول</span>
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 font-mono">ختمتان • ٦٠٤ ص</span>
                  </div>

                  {/* المركز الثالث */}
                  <div className="p-2 rounded-xl border flex flex-col items-center text-center gap-1" style={{ borderColor: isBlackTheme ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.08)', backgroundColor: cardBg }}>
                    <span className="w-5 h-5 rounded-full bg-amber-700 text-white text-[10px] font-black flex items-center justify-center">3#</span>
                    <span className="text-xs font-bold truncate w-full" style={{ color: textColor }}>المتسابق الثالث</span>
                    <span className="text-[10px] opacity-70 font-mono">٣١٠ صفحات</span>
                  </div>
                </div>
              </div>

              {/* بطاقة مربّي العبادات */}
              <div 
                className="p-3.5 rounded-2xl shadow-md border-2 flex flex-col gap-3"
                style={{ borderColor: cardBorderColor, backgroundColor: isBlackTheme ? '#141414' : (theme?.cardBg || 'rgba(255, 255, 255, 0.8)') }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2" style={{ color: primaryAccent }}>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-black font-kufi">مربي العبادات</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      إنجاز اليوم
                    </span>
                  </div>
                  <span className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400">85%</span>
                </div>

                {/* شريط الإنجاز */}
                <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: '85%' }} />
                </div>

                {/* مقارنة الأيام السابقة */}
                <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-black/5 dark:border-white/5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] opacity-70 font-bold">اليوم</span>
                    <span className="text-xs font-black text-emerald-500 font-mono">85%</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] opacity-70 font-bold">أمس</span>
                    <span className="text-xs font-black text-emerald-500 font-mono">100%</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] opacity-70 font-bold">قبل أمس</span>
                    <span className="text-xs font-black text-emerald-500 font-mono">92%</span>
                  </div>
                </div>
              </div>

              {/* بطاقة حدث في مثل هذا اليوم */}
              <div 
                className="p-3.5 rounded-2xl shadow-md border-2 flex flex-col gap-2.5"
                style={{ borderColor: cardBorderColor, backgroundColor: isBlackTheme ? '#141414' : (theme?.cardBg || 'rgba(255, 255, 255, 0.8)') }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2" style={{ color: primaryAccent }}>
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-bold font-kufi">حدث في مثل هذا اليوم</span>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-70">
                    <div className="p-1 rounded bg-black/5 dark:bg-white/5"><RotateCw className="w-3 h-3" /></div>
                    <div className="p-1 rounded bg-black/5 dark:bg-white/5"><Copy className="w-3 h-3" /></div>
                    <div className="p-1 rounded bg-black/5 dark:bg-white/5"><Share2 className="w-3 h-3" /></div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 py-1.5 px-3 rounded-xl bg-black/5 dark:bg-white/5 text-xs font-bold font-kufi" style={{ color: textColor }}>
                  <span>١٥ أكتوبر</span>
                  <span className="opacity-30">•</span>
                  <span>٦٣٦ ميلادي</span>
                </div>

                <p className="text-xs sm:text-sm font-hafs font-bold text-justify leading-relaxed" style={{ color: textColor }}>
                  وقوع معركة اليرموك الخالدة بقيادة سيف الله المسلول خالد بن الوليد رضي الله عنه، والتي كانت فاتحة لتحرير بلاد الشام.
                </p>
              </div>

              {/* بطاقة المناسبات الإسلامية */}
              <div 
                className="p-3.5 rounded-2xl shadow-md border-2 flex flex-col gap-2.5"
                style={{ borderColor: cardBorderColor, backgroundColor: isBlackTheme ? '#141414' : (theme?.cardBg || 'rgba(255, 255, 255, 0.8)') }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2" style={{ color: primaryAccent }}>
                    <Moon className="w-4 h-4" />
                    <span className="text-xs font-bold font-kufi">المناسبات الإسلامية</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-70">
                    <div className="p-1 rounded bg-black/5 dark:bg-white/5"><ChevronRight className="w-3 h-3" /></div>
                    <div className="p-1 rounded bg-black/5 dark:bg-white/5"><ChevronLeft className="w-3 h-3" /></div>
                    <div className="p-1 rounded bg-black/5 dark:bg-white/5"><Copy className="w-3 h-3" /></div>
                    <div className="p-1 rounded bg-black/5 dark:bg-white/5"><Share2 className="w-3 h-3" /></div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 py-1 px-3 rounded-xl bg-black/5 dark:bg-white/5">
                  <span className="text-xs font-bold opacity-80" style={{ color: textColor }}>باقي</span>
                  <span className="text-base font-black font-kufi" style={{ color: primaryAccent }}>٥</span>
                  <span className="text-xs font-bold opacity-80" style={{ color: textColor }}>أيام</span>
                </div>

                <div className="text-center flex flex-col gap-1">
                  <p className="text-sm font-kufi font-black" style={{ color: textColor }}>
                    ليلة الإسراء والمعراج المباركة
                  </p>
                  <span className="text-[10px] font-bold opacity-60" style={{ color: textColor }}>
                    ٢٧ رجب ١٤٤٧ هـ • ٢٧ يناير ٢٠٢٦ م
                  </span>
                </div>
              </div>

              {/* بطاقة تصفح التطبيق */}
              <div 
                className="p-3 rounded-2xl shadow-md border-2 flex flex-col gap-2"
                style={{ borderColor: cardBorderColor, backgroundColor: isBlackTheme ? '#141414' : (theme?.cardBg || 'rgba(255, 255, 255, 0.8)') }}
              >
                <div className="flex items-center gap-2" style={{ color: primaryAccent }}>
                  <Globe className="w-4 h-4" />
                  <span className="text-xs font-bold font-kufi">تصفح التطبيق</span>
                </div>
                <p className="text-xs font-bold opacity-80 leading-relaxed" style={{ color: textColor }}>
                  لمشاهدة التطبيق على المتصفح او الايفون اضغط على الرابط
                </p>
                <div className="flex items-center justify-center gap-3 pt-1">
                  <div 
                    className="py-1.5 px-3 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm"
                    style={{ backgroundColor: primaryAccent, color: '#ffffff' }}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>فتح الرابط</span>
                  </div>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-black/5 dark:bg-white/5 opacity-80">
                    <Copy className="w-3.5 h-3.5" />
                  </div>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-black/5 dark:bg-white/5 opacity-80">
                    <Share2 className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* بطاقة شارك التطبيق */}
              <div 
                className="p-3 rounded-2xl shadow-md border-2 flex flex-col gap-2"
                style={{ borderColor: cardBorderColor, backgroundColor: isBlackTheme ? '#141414' : (theme?.cardBg || 'rgba(255, 255, 255, 0.8)') }}
              >
                <div className="flex items-center gap-2" style={{ color: primaryAccent }}>
                  <Share2 className="w-4 h-4" />
                  <span className="text-xs font-bold font-kufi">شارك التطبيق</span>
                </div>
                <p className="text-xs font-bold opacity-80 leading-relaxed" style={{ color: textColor }}>
                  اذا اعجبك التطبيق قم بنشره على وسائل التواصل ليكون لك الاجر ولمن تحب ان شاء الله .
                </p>
                <div className="flex items-center justify-center gap-6 pt-1">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/5 dark:bg-white/5 text-xs font-bold opacity-80">
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/5 dark:bg-white/5 text-xs font-bold opacity-80">
                    <Share2 className="w-3.5 h-3.5" />
                    <span>مشاركة</span>
                  </div>
                </div>
              </div>

              {/* بطاقة الدعاء لوالدي التطبيق */}
              <div 
                className="py-3 px-4 rounded-2xl shadow-md border-2 text-center flex flex-col items-center justify-center"
                style={{ borderColor: cardBorderColor, backgroundColor: isBlackTheme ? '#141414' : (theme?.cardBg || 'rgba(255, 255, 255, 0.8)') }}
              >
                <p className="text-sm sm:text-base font-bold font-kufi leading-relaxed" style={{ color: isBlackTheme ? '#FFFFFF' : (themeKey === 'default' ? '#a855f7' : primaryAccent) }}>
                  اللهم ارحمهما واغفر لهما واجعل مثواهما الجنة
                </p>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* ثانياً: عند الضغط على الصفحة يتم نسخ شكل الأزرار والأيقونات */}
          {/* ويكتب أمام كل زر أو أيقونة فائدتها بالصفحة بشرح واضح ووافٍ */}
          {/* مع حذف بطاقة العودة السفلية لوجود زر الرجوع بالهيدر */}
          {/* ========================================================= */}
          {/* ========================================================= */}
          {/* ثانياً: عند الضغط على أى زر من أزرار الصفحات تفتح نفس الصفحة */}
          {/* وبنفس التصميم تماماً كصورة فقط وعند الضغط على أي أيقونة أو زر */}
          {/* تظهر قائمة ليس بها سوى نص الشرح الوافي للزر أو البطاقة */}
          {/* ========================================================= */}
          {selectedPageId && (
            <div className="w-full pb-10 flex flex-col items-center animate-fadeIn">
              {/* الصفحة البصرية المطابقة تماماً 100% لتصميم الصفحة الأصلية */}
              <div className="w-full max-w-lg">
                <PageMockupDispatcher
                  pageId={selectedPageId}
                  onInspect={(data) => setInspectedElement(data)}
                  theme={theme}
                  themeKey={themeKey}
                  isBlackTheme={isBlackTheme}
                  primaryAccent={primaryAccent}
                  textColor={textColor}
                  cardBg={cardBg}
                  cardBorderColor={cardBorderColor}
                />
              </div>
            </div>
          )}

        </div>
      </div>

      {/* نافذة وقائمة شرح وظيفة الزر المنبثقة */}
      <ButtonExplanationModal
        data={inspectedElement}
        onClose={() => setInspectedElement(null)}
      />
    </div>
  );
};

export default PageGuide;
