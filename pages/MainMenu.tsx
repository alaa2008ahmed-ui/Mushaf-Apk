
import React, { useState, useEffect } from 'react';
import BottomBar from '../components/BottomBar';
import { useTheme } from '../context/ThemeContext';
import WhatsAppButton from '../components/WhatsAppButton';
import InteractiveBackground from '../components/InteractiveBackground';
import { verses } from '../data/mainMenuData';
import MenuCustomizationModal from '../components/MenuCustomizationModal';
import PasscodeModal from '../components/PasscodeModal';
import { registerBackInterceptor } from '../hooks/useBackButton';
import VerseSection from '../components/MainMenu/VerseSection';
import TitleSection from '../components/MainMenu/TitleSection';
import GridSection from '../components/MainMenu/GridSection';
import FloatingNeonTicker from '../components/FloatingNeonTicker';
import VerseContextMenu from '../components/MainMenu/VerseContextMenu';
import TutorialOverlay, { TutorialStep } from '../components/Tutorial/TutorialOverlay';
import { Mic, Palette, Grid, BookOpen } from 'lucide-react';
import { useVoiceControl } from '../context/VoiceControlContext';
import { usePrayerTimes } from '../context/PrayerTimesContext';
import { prayerNamesAr } from '../data/prayerTimesData';
import { quranData as rawQuranData } from '../utils/quranData';
import { SURAH_NAMES_AR, toArabic } from '../components/QuranReader/constants';
import { ON_THIS_DAY_EVENTS } from '../data/onThisDayEvents';
import { shareAsImage } from '../utils/shareAsImage';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment-hijri';

const ISLAMIC_EVENTS = [
    { day: 1, month: 1, name: "رأس السنة الهجرية" },
    { day: 10, month: 1, name: "يوم عاشوراء" },
    { day: 12, month: 3, name: "المولد النبوي الشريف" },
    { day: 27, month: 7, name: "الإسراء والمعراج" },
    { day: 15, month: 8, name: "النصف من شعبان" },
    { day: 1, month: 9, name: "أول أيام شهر رمضان" },
    { day: 27, month: 9, name: "ليلة القدر" },
    { day: 1, month: 10, name: "عيد الفطر المبارك" },
    { day: 9, month: 12, name: "يوم عرفة" },
    { day: 10, month: 12, name: "عيد الأضحى المبارك" }
];

const HIJRI_MONTHS = ["محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"];
const GREGORIAN_MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

const ALL_POSSIBLE_ITEMS = [
    { id: 'quran', label: "📖 القرآن الكريم", className: "col-span-2 h-12", colorIndex: 0 },
    { id: 'listen', label: "🎧 الاستماع للقرآن", className: "col-span-2 h-10", colorIndex: 0 },
    { id: 'prayer-times', label: "⏱️ مواقيت الصلاة", className: "col-span-2 h-10", colorIndex: 0 },
    { id: 'adia', label: "🤲 الأدعية", className: "h-10", colorIndex: 1 },
    { id: 'sabah-masaa', label: "☀️ الأذكار", className: "h-10", colorIndex: 1 },
    { id: 'salah-adhkar', label: "🕌 أذكار الصلاة", className: "h-10", colorIndex: 1 },
    { id: 'hisn-muslim', label: "🛡️ حصن المسلم", className: "h-10", colorIndex: 1 },
    { id: 'tasbeeh', label: "📿 السبحة", className: "h-10", colorIndex: 1 },
    { id: 'calendar', label: "📅 التقويم", className: "h-10", colorIndex: 1 },
    { id: 'qibla', label: "🧭 القبلة", className: "h-10", colorIndex: 1 },
    { id: 'hajj-umrah', label: "🕋 الحج والعمرة", className: "h-10", colorIndex: 1 },
    { id: 'nawawi', label: "📚 الأربعون النووية", className: "h-10", colorIndex: 1 },
    { id: 'calculators', label: "🧮 الحاسبة الشرعية", className: "h-10", colorIndex: 1 },
    { id: 'asmaul-husna', label: "✨ أسماء الله الحسنى", className: "col-span-2 h-10", colorIndex: 1 },
    { id: 'more', label: "✨ قائمة التطبيقات", className: "col-span-2 h-10 flex justify-center", colorIndex: 0 },
];

const DEFAULT_MENU_ITEMS = [
    { id: 'quran', label: "📖 القرآن الكريم", className: "col-span-2 h-12", colorIndex: 0 },
    { id: 'listen', label: "🎧 الاستماع للقرآن", className: "col-span-2 h-10", colorIndex: 0 },
    { id: 'prayer-times', label: "⏱️ مواقيت الصلاة", className: "col-span-2 h-10", colorIndex: 0 },
    { id: 'adia', label: "🤲 الأدعية", className: "h-10", colorIndex: 1 },
    { id: 'sabah-masaa', label: "☀️ الأذكار", className: "h-10", colorIndex: 1 },
    { id: 'salah-adhkar', label: "🕌 أذكار الصلاة", className: "h-10", colorIndex: 1 },
    { id: 'hisn-muslim', label: "🛡️ حصن المسلم", className: "h-10", colorIndex: 1 },
    { id: 'tasbeeh', label: "📿 السبحة", className: "h-10", colorIndex: 1 },
    { id: 'calendar', label: "📅 التقويم", className: "h-10", colorIndex: 1 },
    { id: 'qibla', label: "🧭 القبلة", className: "h-10", colorIndex: 1 },
    { id: 'hajj-umrah', label: "🕋 الحج والعمرة", className: "h-10", colorIndex: 1 },
    { id: 'more', label: "✨ قائمة التطبيقات", className: "col-span-2 h-10 flex justify-center", colorIndex: 0 },
];

function MainMenu({ onNavigate, onOpenThemes, onOpenSideMenu }) {
  const { showVoiceIcon } = useVoiceControl();
  const [currentVerse] = useState(() => {
    const randomIndex = Math.floor(Math.random() * verses.length);
    return verses[randomIndex];
  });
  const { theme, themeKey } = useTheme();
  const [visibleItems, setVisibleItems] = useState<string[]>(() => {
    const savedVisible = localStorage.getItem('visibleMenuItems');
    if (savedVisible) {
        try {
            const parsed = JSON.parse(savedVisible);
            return parsed.filter((id: string) => id !== 'habit-tracker');
        } catch (e) {
            return DEFAULT_MENU_ITEMS.map(i => i.id);
        }
    }
    return DEFAULT_MENU_ITEMS.map(i => i.id);
  });
  const [menuItems, setMenuItems] = useState(() => {
    const savedLayout = localStorage.getItem('menuLayout');
    if (savedLayout) {
        try {
            const parsed = JSON.parse(savedLayout);
            const filtered = parsed.filter((item: any) => item.id !== 'habit-tracker');
            return filtered;
        } catch (e) {
            return DEFAULT_MENU_ITEMS;
        }
    }
    return DEFAULT_MENU_ITEMS;
  });
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
  const [isPasscodeOpen, setIsPasscodeOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [verseFontSize, setVerseFontSize] = useState(() => {
      const saved = localStorage.getItem('mainMenuVerseFontSize');
      return saved ? parseFloat(saved) : 1.25;
  });
  const [verseSettings, setVerseSettings] = useState(() => {
      const saved = localStorage.getItem('mainMenuVerseSettings');
      return saved ? JSON.parse(saved) : {
          fontFamily: theme.font,
          bgColor: 'transparent',
          textColor: theme.textColor
      };
  });
  const [isVerseMenuOpen, setIsVerseMenuOpen] = useState(false);

  const PREDEFINED_COLORS = [
      '#ffffff', '#f3f4f6', '#9ca3af', '#4b5563', '#000000',
      '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e',
      '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6',
      '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
      '#f43f5e', '#78716c', '#57534e', 'transparent'
  ];

  const renderCheckerboard = (color: string) => {
      if (color === 'transparent' || color === 'rgba(0, 0, 0, 0)') {
          return {
              backgroundColor: '#ffffff',
              backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%)',
              backgroundSize: '8px 8px'
          };
      }
      return { backgroundColor: color };
  };

  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSaveVerseSettings = (newSettings: any) => {
      setVerseSettings(newSettings);
      localStorage.setItem('mainMenuVerseSettings', JSON.stringify(newSettings));
  };

  const homeTutorialSteps: TutorialStep[] = [
    {
      id: 'welcome',
      title: 'أهلاً بك في مُصْحَفُ أَحْمَدَ وَلَيْلَى',
      text: 'هذه جولة سريعة لتعريفك بأهم مميزات التطبيق وكيفية استخدامها. تم تصميم هذا التطبيق ليكون رفيقك الدائم في العبادة، حيث يجمع بين سهولة الاستخدام والجمال البصري.',
      selector: '#app-title',
      icon: <BookOpen className="w-8 h-8 text-white" />
    },
    {
      id: 'voice',
      title: 'التحكم الصوتي',
      text: 'تحكم في التطبيق بالأوامر الصوتية العربية للتنقل والبحث والتحكم في التلاوة بسهولة. (هذه الخاصية تعمل فقط عند الاتصال بالإنترنت)',
      selector: '#voice-control-btn',
      icon: <Mic className="w-8 h-8 text-white" />
    },
    {
      id: 'whatsapp',
      title: 'تواصل معنا',
      text: 'هل لديك اقتراح، استفسار، أو واجهت مشكلة؟ اضغط هنا للتواصل معنا مباشرة عبر الواتساب. نحن دائماً نسعد بسماع آرائكم لتحسين التطبيق وتقديم أفضل خدمة ممكنة.',
      selector: '#whatsapp-button-container',
      icon: <svg viewBox="0 0 24 24" className="w-8 h-8 text-white"><path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.361.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
    },
    {
      id: 'themes',
      title: 'تخصيص المظهر (الثيمات)',
      text: 'نؤمن بأن لكل مستخدم ذوقه الخاص، لذا وفرنا مجموعة واسعة من "الثيمات" الجاهزة (ليلي، هادئ، كلاسيكي). يمكنك أيضاً تعيين خلفية مخصصة أو فيديو تفاعلي ليكون خلفية لمصحفك الخاص.',
      selector: '#themes-btn',
      icon: <Palette className="w-8 h-8 text-white" />
    }
  ];

  const [currentTutorialStep, setCurrentTutorialStep] = useState<string>('');
  const { times, nextPrayer, countdown } = usePrayerTimes();
  
  const [lastReadAyah, setLastReadAyah] = useState<{ s: number, a: number, text: string, surahName: string } | null>(null);

  const [onThisDayEvent, setOnThisDayEvent] = useState<{ text: string, year: number, dateStr: string } | null>(null);
  const [onThisDayIndex, setOnThisDayIndex] = useState(0);
  const [onThisDayList, setOnThisDayList] = useState<{ text: string, year: number }[]>([]);
  const [showExpandedEventsModal, setShowExpandedEventsModal] = useState(false);
  const [showExpandedUpcomingEventModal, setShowExpandedUpcomingEventModal] = useState(false);

  const [upcomingEvent, setUpcomingEvent] = useState<{name: string, dateStr: string, gregorianDateStr: string, daysRemaining: number, isToday: boolean} | null>(null);

  useEffect(() => {
      // calculate the next Islamic event
      const today = moment().startOf('day');
      const currentHijriYear = today.iYear();
      
      let nextEvent = null;
      let minDiff = Infinity;
      
      ISLAMIC_EVENTS.forEach(event => {
          let eventDate = moment(`${currentHijriYear}-${event.month}-${event.day}`, 'iYYYY-iM-iD').startOf('day');
          let diff = eventDate.diff(today, 'days');
          
          if (diff < 0) {
              eventDate = moment(`${currentHijriYear + 1}-${event.month}-${event.day}`, 'iYYYY-iM-iD').startOf('day');
              diff = eventDate.diff(today, 'days');
          }
          
          if (diff >= 0 && diff < minDiff) {
              minDiff = diff;
              nextEvent = { ...event, date: eventDate, diff };
          }
      });
      
      if (nextEvent) {
          setUpcomingEvent({
              name: nextEvent.name,
              dateStr: `${toArabic(nextEvent.date.iDate())} ${HIJRI_MONTHS[nextEvent.date.iMonth()]} ${toArabic(nextEvent.date.iYear())} هـ`,
              gregorianDateStr: `${toArabic(nextEvent.date.date())} ${GREGORIAN_MONTHS[nextEvent.date.month()]} ${toArabic(nextEvent.date.year())} م`,
              daysRemaining: nextEvent.diff,
              isToday: nextEvent.diff === 0
          });
      }
  }, []);

  useEffect(() => {
      const today = new Date();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const key = `${mm}-${dd}`;
      const formatter = new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' });
      const dateStr = formatter.format(today);

      let events = ON_THIS_DAY_EVENTS[key] || [];

      let stored = null;
      try { stored = JSON.parse(localStorage.getItem('on_this_day_state') || 'null'); } catch(e){}

      let startIndex = 0;
      if (stored && stored.key === key) {
          startIndex = (stored.index + 1) % Math.max(1, events.length);
      } else if (events.length > 0) {
          startIndex = Math.floor(Math.random() * events.length);
      }

      if (events.length > 0) {
          setOnThisDayList(events);
          setOnThisDayIndex(startIndex);
          setOnThisDayEvent({ ...events[startIndex], dateStr });
      }
      localStorage.setItem('on_this_day_state', JSON.stringify({ key, index: startIndex }));
  }, []);

  const handleNextEvent = async (e: React.MouseEvent) => {
      e.stopPropagation();
      const today = new Date();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const formatter = new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' });
      const dateStr = formatter.format(today);

      if (navigator.onLine && onThisDayIndex >= onThisDayList.length - 1) {
          try {
              const res = await fetch(`https://api.wikimedia.org/feed/v1/wikipedia/ar/onthisday/events/${mm}/${dd}`);
              const data = await res.json();
              if (data && data.events && data.events.length > onThisDayList.length) {
                  const newEvents = data.events.map((e: any) => ({ year: e.year || 0, text: e.text }));
                  setOnThisDayList(newEvents);
                  const newIndex = onThisDayList.length;
                  setOnThisDayIndex(newIndex);
                  setOnThisDayEvent({ ...newEvents[newIndex], dateStr });
                  localStorage.setItem('on_this_day_state', JSON.stringify({ key: `${mm}-${dd}`, index: newIndex }));
                  return;
              }
          } catch (e) {
              console.error(e);
          }
      }

      const nextIndex = (onThisDayIndex + 1) % Math.max(1, onThisDayList.length);
      setOnThisDayIndex(nextIndex);
      if (onThisDayList[nextIndex]) {
          setOnThisDayEvent({ ...onThisDayList[nextIndex], dateStr });
          localStorage.setItem('on_this_day_state', JSON.stringify({ key: `${mm}-${dd}`, index: nextIndex }));
      }
  };

  const handleShareHighlight = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onThisDayEvent) return;
    await shareAsImage({
        text: onThisDayEvent.text,
        source: `حدث في مثل هذا اليوم - ${onThisDayEvent.year}م`,
        category: onThisDayEvent.dateStr,
        theme,
        setToastMessage
    });
  };

  const handleCopyHighlight = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onThisDayEvent) return;
    const textToCopy = `${onThisDayEvent.dateStr}\nفي عام ${onThisDayEvent.year} ميلادي\n${onThisDayEvent.text}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
        setToastMessage('تم النسخ إلى الحافظة');
        setTimeout(() => setToastMessage(''), 2000);
    });
  };

  const handleShareUpcomingEvent = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!upcomingEvent) return;
    await shareAsImage({
        text: `المناسبة: ${upcomingEvent.name}\nالمتبقي: ${upcomingEvent.isToday ? 'اليوم' : toArabic(upcomingEvent.daysRemaining) + ' يوم'}`,
        source: upcomingEvent.gregorianDateStr,
        category: upcomingEvent.dateStr,
        theme,
        setToastMessage
    });
  };

  const handleCopyUpcomingEvent = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!upcomingEvent) return;
    const textToCopy = `المناسبة الإسلامية القادمة: ${upcomingEvent.name}\nالتاريخ الهجري: ${upcomingEvent.dateStr}\nالتاريخ الميلادي: ${upcomingEvent.gregorianDateStr}\nالمتبقي: ${upcomingEvent.isToday ? 'اليوم' : toArabic(upcomingEvent.daysRemaining) + ' يوم'}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
        setToastMessage('تم النسخ إلى الحافظة');
        setTimeout(() => setToastMessage(''), 2000);
    });
  };

  useEffect(() => {
    const updateLastRead = () => {
      try {
          const globalStr = localStorage.getItem('last_read_ayah_global');
          const vStr = localStorage.getItem('last_pos_v');
          const hStr = localStorage.getItem('last_pos_h');
          
          let target = null;
          if (globalStr) {
              target = JSON.parse(globalStr);
          } else {
              const v = vStr ? JSON.parse(vStr) : null;
              const h = hStr ? JSON.parse(hStr) : null;
              target = v || h;
          }

          if (target && target.s && target.a) {
              const { s, a } = target;
              const surah = rawQuranData.surahs[s - 1];
              if (surah) {
                  const ayah = surah.ayahs.find((ay: any) => ay.numberInSurah === a);
                  if (ayah) {
                      let text = ayah.text.replace(/۞/g, '');
                      if (s !== 1 && s !== 9 && a === 1) {
                          text = text.replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', '').replace('بِّسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', '').trim();
                      }
                      setLastReadAyah({ s, a, text, surahName: SURAH_NAMES_AR[s - 1] });
                  }
              }
          }
      } catch (e) {
          console.error("Error loading last read ayah", e);
      }
    };

    updateLastRead();
    window.addEventListener('storage', updateLastRead);
    window.addEventListener('last_read_update', updateLastRead);
    return () => {
      window.removeEventListener('storage', updateLastRead);
      window.removeEventListener('last_read_update', updateLastRead);
    };
  }, []);

  // --- Logic to determine Previous and Next "Salah" (excluding Sunrise) ---
  const getSalahStats = () => {
    if (!nextPrayer || !times || Object.keys(times).length === 0) {
      return { prev: '-', next: '-', remaining: '--:--:--' };
    }

    const salahKeys = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    let nextIndex = salahKeys.indexOf(nextPrayer.key);
    
    // If nextPrayer is Sunrise, the next ACTUAL salah is Dhuhr (index 1)
    if (nextPrayer.key === 'Sunrise') {
      nextIndex = 1; 
    }

    const prevIndex = (nextIndex - 1 + salahKeys.length) % salahKeys.length;
    const actualNextIndex = nextIndex % salahKeys.length;

    return {
      prev: prayerNamesAr[salahKeys[prevIndex] as keyof typeof prayerNamesAr],
      next: prayerNamesAr[salahKeys[actualNextIndex] as keyof typeof prayerNamesAr],
      remaining: countdown
    };
  };

  const { prev: prevSalah, next: nextSalah, remaining: prayerCountdown } = getSalahStats();

  useEffect(() => {
    // Check if we need to update layout in storage (migration/fix)
    const savedLayout = localStorage.getItem('menuLayout');
    if (savedLayout) {
        try {
            const parsed = JSON.parse(savedLayout);
            let changed = false;
            const updated = parsed.map((item: any) => {
                let currentItem = { ...item };
                if (currentItem.id === 'calculators' || currentItem.id === 'calendar') {
                    if (currentItem.customColor) {
                        delete currentItem.customColor;
                        changed = true;
                    }
                }
                if (currentItem.id === 'more' && !currentItem.className.includes('flex justify-center')) {
                    changed = true;
                    currentItem.className = currentItem.className + " flex justify-center";
                }
                if (currentItem.className) {
                    const newClass = currentItem.className.replace(/h-\d+/g, (match) => {
                        if (match === 'h-12') return 'h-12';
                        return 'h-10';
                    });
                    if (currentItem.className !== newClass) {
                        changed = true;
                        currentItem.className = newClass;
                    }
                }
                return currentItem;
            });
            
            if (changed) {
                const filtered = updated.filter((item: any) => item.id !== 'habit-tracker');
                localStorage.setItem('menuLayout', JSON.stringify(filtered));
                setMenuItems(filtered);
            } else {
                // Always ensure habit-tracker is removed
                const filtered = updated.filter((item: any) => item.id !== 'habit-tracker');
                if (filtered.length !== updated.length) {
                    localStorage.setItem('menuLayout', JSON.stringify(filtered));
                    setMenuItems(filtered);
                }
            }
        } catch (e) {
            // Error handled in initializer
        }
    }
  }, []);

  const handleCancelEdit = () => {
      const savedLayout = localStorage.getItem('menuLayout');
      if (savedLayout) {
          setMenuItems(JSON.parse(savedLayout));
      } else {
          setMenuItems(DEFAULT_MENU_ITEMS);
      }
      setIsEditMode(false);
      if (navigator.vibrate) navigator.vibrate(50);
  };

  useEffect(() => {
      const interceptor = () => {
          if (isCustomizationOpen) {
              setIsCustomizationOpen(false);
              return true;
          }
          if (isEditMode) {
              handleCancelEdit();
              return true;
          }
          return false;
      };
      const unregister = registerBackInterceptor(interceptor);
      return unregister;
  }, [isCustomizationOpen, isEditMode]);

  const handleSaveCustomization = (selectedIds: string[]) => {
      setVisibleItems(selectedIds);
      localStorage.setItem('visibleMenuItems', JSON.stringify(selectedIds));
  };

  const handleSaveLayout = () => {
      localStorage.setItem('menuLayout', JSON.stringify(menuItems));
      setIsEditMode(false);
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(50);
  };

  const handleResetLayout = () => {
      setMenuItems(DEFAULT_MENU_ITEMS);
      localStorage.removeItem('menuLayout');
      setIsEditMode(false);
      if (navigator.vibrate) navigator.vibrate(50);
  };

  return (
    <div>
      <InteractiveBackground />
      <div className="h-screen w-full flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto pb-24 no-scrollbar">
          <div className="main-layout px-4 flex flex-col" style={{ fontFamily: theme.font }}>
              
              <div id="verse-section">
                <VerseSection 
                    currentVerse={currentVerse}
                    verseFontSize={verseFontSize}
                    theme={theme}
                    verseSettings={verseSettings}
                />
              </div>

              <TitleSection 
                  isEditMode={isEditMode}
                  setIsEditMode={setIsEditMode}
                  handleSaveLayout={handleSaveLayout}
                  handleResetLayout={handleResetLayout}
                  handleCancelEdit={handleCancelEdit}
                  theme={theme}
                  themeKey={themeKey}
                  onOpenSideMenu={onOpenSideMenu}
              />

              <div id="grid-section">
                <GridSection 
                    menuItems={menuItems}
                    setMenuItems={setMenuItems}
                    visibleItems={visibleItems}
                    isEditMode={isEditMode}
                    onNavigate={(id) => {
                        if (id === 'more') onNavigate('more-menu');
                        else onNavigate(id, { from: 'home' });
                    }}
                    theme={theme}
                    themeKey={themeKey}
                    DEFAULT_MENU_ITEMS={DEFAULT_MENU_ITEMS}
                />
              </div>

              {/* Footer/Save Button */}
              {!isEditMode && (
                  <div className="flex flex-col gap-2 w-full max-w-sm mx-auto mt-1 mb-4">
                      {/* Dua Card */}
                      <div className="flex items-center justify-center gap-2 h-12">
                          {!showVoiceIcon && (
                              <div className="flex items-center justify-center shrink-0">
                                  <WhatsAppButton />
                              </div>
                          )}
                          <div className="themed-card p-1 rounded-2xl text-center flex-1 relative h-full flex flex-col justify-center overflow-hidden">
                              <FloatingNeonTicker />
                              <p className={`${!showVoiceIcon ? 'text-[14px]' : 'text-[16px]'} font-bold leading-tight`} style={{ color: theme.bgColor === '#000000' ? '#FFFFFF' : (themeKey === 'default' ? '#a855f7' : (themeKey === 'olive_grove' ? '#65A30D' : theme.textColor)) }}>
                                  اللهم ارحمهما واغفر لهما واجعل مثواهما الجنة
                              </p>
                          </div>
                      </div>

                      {/* Prayer Status Cards */}
                      <div 
                          className="p-2 rounded-2xl shadow-lg border-2 transition-all duration-300" 
                          style={{ borderColor: theme.palette[0], backgroundColor: theme.cardBg || 'rgba(255, 255, 255, 0.8)' }}
                      >
                          <div className="grid grid-cols-3 gap-2">
                           {/* Right Card: Previous Prayer */}
                           <div className="themed-card py-2 px-1 rounded-xl text-center flex flex-col justify-center items-center shadow-sm border-2 transition-all" 
                                style={{ borderColor: `${theme.palette[0]}33` }}>
                               <span className="text-[10px] opacity-70 font-bold mb-0.5">السابقة</span>
                               <span className="text-[15px] font-black truncate w-full" style={{ color: theme.textColor }}>{prevSalah}</span>
                           </div>

                           {/* Middle Card: Remaining Time */}
                           <div className="themed-card py-2 px-1 rounded-xl text-center flex flex-col justify-center items-center shadow-md border-2 relative overflow-hidden" 
                                style={{ borderColor: theme.palette[0] }}>
                               <span className="text-[10px] opacity-70 font-bold mb-0.5">متبقي</span>
                               <span className="text-[16px] font-mono font-black tracking-wider" style={{ color: theme.textColor }}>{prayerCountdown}</span>
                           </div>

                           {/* Left Card: Next Prayer */}
                           <div className="themed-card py-2 px-1 rounded-xl text-center flex flex-col justify-center items-center shadow-sm border-2 transition-all"
                                style={{ borderColor: `${theme.palette[0]}33` }}>
                               <span className="text-[10px] opacity-70 font-bold mb-0.5">القادمة</span>
                               <span className="text-[15px] font-black truncate w-full" style={{ color: theme.textColor }}>{nextSalah}</span>
                           </div>
                          </div>
                      </div>


                      {/* On This Day Card */}
                      {onThisDayEvent && (
                          <div 
                              className="w-full mt-1 py-4 px-5 rounded-2xl shadow-lg border-2 relative overflow-hidden flex flex-col gap-3 cursor-pointer"
                              style={{ borderColor: theme.palette[0], backgroundColor: theme.cardBg || 'rgba(255, 255, 255, 0.8)' }}
                              dir="rtl"
                              onClick={() => setShowExpandedEventsModal(true)}
                          >
                              <div className="flex items-center justify-between z-10 w-full relative">
                                  <div className="flex items-center gap-2" style={{ color: theme.palette[0] }}>
                                      <i className="fa-solid fa-calendar-day text-base"></i>
                                      <span className="text-sm font-bold font-kufi">حدث في مثل هذا اليوم</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                      <button 
                                          onClick={handleNextEvent}
                                          className="p-1.5 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                                          title="حدث آخر"
                                          style={{ color: theme.palette[0] }}
                                      >
                                          <i className="fa-solid fa-rotate-right text-xs"></i>
                                      </button>
                                      <button 
                                          onClick={handleCopyHighlight}
                                          className="p-1.5 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                                          title="نسخ"
                                          style={{ color: theme.palette[0] }}
                                      >
                                          <i className="fa-regular fa-copy text-xs"></i>
                                      </button>
                                      <button 
                                          onClick={handleShareHighlight}
                                          className="p-1.5 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                                          title="مشاركة"
                                          style={{ color: theme.palette[0] }}
                                      >
                                          <i className="fa-solid fa-share-nodes text-xs"></i>
                                      </button>
                                  </div>
                              </div>
                              <div className="flex items-start gap-4 w-full relative z-10">
                                  <div className="flex flex-col items-center justify-center shrink-0 min-w-[85px] p-2.5 rounded-xl bg-black/5 dark:bg-white/5" style={{ color: theme.textColor }}>
                                      <span className="text-[10px] font-bold opacity-70 mb-1 text-center">{onThisDayEvent.dateStr}</span>
                                      <span className="text-xl font-black font-kufi leading-none">{toArabic(onThisDayEvent.year)}</span>
                                      <span className="text-[10px] font-bold opacity-70 mt-1">ميلادي</span>
                                  </div>
                                  <p className="text-base leading-relaxed flex-1 break-words font-hafs font-bold" style={{ color: theme.textColor }}>
                                      {onThisDayEvent.text}
                                  </p>
                              </div>
                          </div>
                      )}

                      {/* Upcoming Islamic Event Card */}
                      {upcomingEvent && (
                          <div 
                              className="w-full mt-3 py-4 px-5 rounded-2xl shadow-lg border-2 relative overflow-hidden flex flex-col gap-3 cursor-pointer"
                              style={{ borderColor: theme.palette[0], backgroundColor: theme.cardBg || 'rgba(255, 255, 255, 0.8)' }}
                              dir="rtl"
                              onClick={() => setShowExpandedUpcomingEventModal(true)}
                          >
                              <div className="absolute top-4 left-5 flex gap-2 z-20">
                                  <button 
                                      onClick={handleCopyUpcomingEvent}
                                      className="p-1.5 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                                      title="نسخ"
                                      style={{ color: theme.palette[0] }}
                                  >
                                      <i className="fa-regular fa-copy text-xs"></i>
                                  </button>
                                  <button 
                                      onClick={handleShareUpcomingEvent}
                                      className="p-1.5 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                                      title="مشاركة"
                                      style={{ color: theme.palette[0] }}
                                  >
                                      <i className="fa-solid fa-share-nodes text-xs"></i>
                                  </button>
                              </div>
                              <div className="flex items-center gap-2 z-10 w-full relative" style={{ color: theme.palette[0] }}>
                                  <i className="fa-solid fa-moon text-base"></i>
                                  <span className="text-sm font-bold font-kufi">المناسبة الإسلامية القادمة</span>
                              </div>
                              <div className="flex items-center gap-4 w-full relative z-10">
                                  <div className="flex flex-col items-center justify-center shrink-0 min-w-[85px] p-2.5 rounded-xl bg-black/5 dark:bg-white/5" style={{ color: theme.textColor }}>
                                      {!upcomingEvent.isToday && (
                                          <span className="text-xs font-bold opacity-70 mb-1">باقي</span>
                                      )}
                                      <span className="text-xl font-black font-kufi leading-none mt-1" style={{ color: theme.palette[0] }}>
                                          {upcomingEvent.isToday ? 'اليوم' : toArabic(upcomingEvent.daysRemaining)}
                                      </span>
                                      {!upcomingEvent.isToday && (
                                          <span className="text-xs font-bold opacity-70 mt-1">يوم</span>
                                      )}
                                  </div>
                                  <div className="flex flex-col flex-1 mt-1" style={{ color: theme.textColor }}>
                                      <p className="text-lg leading-relaxed break-words font-kufi font-bold">
                                          {upcomingEvent.name}
                                      </p>
                                      <p className="text-sm font-bold opacity-70 mt-1">
                                          {upcomingEvent.dateStr}
                                      </p>
                                      <p className="text-sm font-bold opacity-70 mt-1">
                                          {upcomingEvent.gregorianDateStr}
                                      </p>
                                  </div>
                              </div>
                          </div>
                      )}

                      {/* Web App Link Card */}
                      <div 
                          className="w-full mt-3 py-4 px-5 rounded-2xl shadow-lg border-2 relative flex flex-col gap-3"
                          style={{ borderColor: theme.palette[0], backgroundColor: theme.cardBg || 'rgba(255, 255, 255, 0.8)' }}
                          dir="rtl"
                      >
                          <div className="flex items-center gap-2 z-10 w-full relative" style={{ color: theme.palette[0] }}>
                              <i className="fa-solid fa-globe text-base"></i>
                              <span className="text-sm font-bold font-kufi">تصفح التطبيق</span>
                          </div>
                          
                          <p className="text-sm font-bold leading-relaxed" style={{ color: theme.textColor }}>
                              لمشاهدة التطبيق على المتصفح او الايفون اضغط على الرابط
                          </p>

                          <div className="flex items-center gap-2 mt-1">
                              <button 
                                  onClick={() => window.open('https://mushaf-ahmed-and-laila.netlify.app/', '_blank')}
                                  className="flex-1 py-3 px-4 rounded-xl font-bold text-sm text-center flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
                                  style={{ 
                                      backgroundColor: theme.palette[0], 
                                      color: (theme.palette[0]?.toLowerCase() === '#ffffff' || theme.palette[0]?.toLowerCase() === 'white') ? '#000000' : '#ffffff' 
                                  }}
                              >
                                  <i className="fa-solid fa-arrow-up-right-from-square"></i>
                                  <span>فتح الرابط</span>
                              </button>
                              
                              <button 
                                  onClick={(e) => {
                                      e.stopPropagation();
                                      navigator.clipboard.writeText('https://mushaf-ahmed-and-laila.netlify.app/').then(() => {
                                          setToastMessage('تم نسخ الرابط');
                                          setTimeout(() => setToastMessage(''), 2000);
                                      });
                                  }}
                                  className="w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors shadow-sm active:scale-95"
                                  title="نسخ الرابط"
                                  style={{ color: theme.palette[0] }}
                              >
                                  <i className="fa-regular fa-copy text-lg"></i>
                              </button>

                              <button 
                                  onClick={(e) => {
                                      e.stopPropagation();
                                      if (navigator.share) {
                                          navigator.share({
                                              title: 'تطبيق القرآن الكريم',
                                              text: 'لمشاهدة التطبيق على المتصفح او الايفون اضغط على الرابط',
                                              url: 'https://mushaf-ahmed-and-laila.netlify.app/',
                                          }).catch(console.error);
                                      } else {
                                          navigator.clipboard.writeText('https://mushaf-ahmed-and-laila.netlify.app/').then(() => {
                                              setToastMessage('تم نسخ الرابط (المشاركة غير مدعومة)');
                                              setTimeout(() => setToastMessage(''), 2000);
                                          });
                                      }
                                  }}
                                  className="w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors shadow-sm active:scale-95"
                                  title="مشاركة الرابط"
                                  style={{ color: theme.palette[0] }}
                              >
                                  <i className="fa-solid fa-share-nodes text-lg"></i>
                              </button>
                          </div>
                      </div>

                  </div>
              )}
          </div>
        </div>
      </div>

      {showExpandedEventsModal && onThisDayEvent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl" onClick={() => setShowExpandedEventsModal(false)}>
            <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-3xl shadow-2xl p-6" onClick={e => e.stopPropagation()} style={{ backgroundColor: theme.cardBg || 'rgba(255, 255, 255, 0.95)' }}>
                <div className="flex flex-col items-center gap-4 mb-6">
                    <div className="text-center font-bold text-2xl font-kufi" style={{ color: theme.palette[0] }}>
                        {onThisDayEvent.dateStr} {toArabic(onThisDayEvent.year)} ميلادي
                    </div>
                </div>
                
                <div className="flex flex-col gap-6 w-full">
                    <div className="flex flex-col items-center justify-center gap-6 p-8 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 w-full">
                        <p className="text-[32px] sm:text-[38px] leading-[1.6] font-hafs font-bold text-center w-full" style={{ color: theme.textColor }}>
                            {onThisDayEvent.text}
                        </p>
                    </div>

                    <button 
                        onClick={() => setShowExpandedEventsModal(false)}
                        className="w-full py-4 rounded-2xl font-bold text-xl transition-all shadow-md active:scale-95"
                        style={{ 
                            backgroundColor: theme.palette[0],
                            color: '#fff'
                        }}
                    >
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
      )}

      {showExpandedUpcomingEventModal && upcomingEvent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl" onClick={() => setShowExpandedUpcomingEventModal(false)}>
            <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-3xl shadow-2xl p-6" onClick={e => e.stopPropagation()} style={{ backgroundColor: theme.cardBg || 'rgba(255, 255, 255, 0.95)' }}>
                <div className="flex flex-col items-center gap-4 mb-6">
                    <div className="text-center font-bold text-2xl font-kufi flex items-center gap-2" style={{ color: theme.palette[0] }}>
                        <i className="fa-solid fa-moon"></i>
                        المناسبة الإسلامية القادمة
                    </div>
                </div>
                
                <div className="flex flex-col gap-6 w-full">
                    <div className="flex flex-col items-center justify-center gap-6 p-8 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 w-full text-center">
                        <p className="text-[32px] sm:text-[38px] leading-[1.6] font-kufi font-bold w-full" style={{ color: theme.textColor }}>
                            {upcomingEvent.name}
                        </p>
                        <hr className="w-1/2 opacity-20 border-current" style={{ color: theme.textColor }} />
                        <div className="flex flex-col gap-2">
                            <p className="text-xl font-bold opacity-80" style={{ color: theme.textColor }}>
                                {upcomingEvent.dateStr}
                            </p>
                            <p className="text-xl font-bold opacity-80" style={{ color: theme.textColor }}>
                                {upcomingEvent.gregorianDateStr}
                            </p>
                        </div>
                        <div className="w-full p-4 rounded-xl mt-2 flex flex-col items-center" style={{ backgroundColor: theme.palette[0] + '20', color: theme.palette[0] }}>
                           <span className="text-lg font-bold mb-1 opacity-80">
                               {upcomingEvent.isToday ? 'توافق' : 'يتبقى عليها'}
                           </span>
                           <span className="text-5xl font-black font-kufi my-2">
                               {upcomingEvent.isToday ? 'اليوم' : toArabic(upcomingEvent.daysRemaining)}
                           </span>
                           {!upcomingEvent.isToday && (
                               <span className="text-lg font-bold opacity-80">يوم</span>
                           )}
                        </div>
                    </div>

                    <button 
                        onClick={() => setShowExpandedUpcomingEventModal(false)}
                        className="w-full py-4 rounded-2xl font-bold text-xl transition-all shadow-md active:scale-95"
                        style={{ 
                            backgroundColor: theme.palette[0],
                            color: '#fff'
                        }}
                    >
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
      )}

      <BottomBar 
        onHomeClick={() => {}} 
        onThemesClick={onOpenThemes} 
        showHome={false} 
        showThemes={true} 
      />
      
      <PasscodeModal 
        isOpen={isPasscodeOpen}
        onClose={() => setIsPasscodeOpen(false)}
        onSuccess={() => setIsCustomizationOpen(true)}
        isLandscape={isLandscape}
      />

      <MenuCustomizationModal 
        isOpen={isCustomizationOpen}
        onClose={() => setIsCustomizationOpen(false)}
        allItems={ALL_POSSIBLE_ITEMS}
        visibleIds={visibleItems}
        onSave={handleSaveCustomization}
        isLandscape={isLandscape}
      />

      <VerseContextMenu 
        isOpen={isVerseMenuOpen}
        onClose={() => setIsVerseMenuOpen(false)}
        settings={verseSettings}
        onSave={handleSaveVerseSettings}
        currentTheme={theme}
        renderCheckerboard={renderCheckerboard}
        PREDEFINED_COLORS={PREDEFINED_COLORS}
        isLandscape={isLandscape}
      />

      <TutorialOverlay 
        tutorialId="home-tutorial" 
        steps={homeTutorialSteps} 
        onStepChange={setCurrentTutorialStep}
      />
      {currentTutorialStep && (
        <style>{`
          #voice-control-btn {
            opacity: ${currentTutorialStep === 'voice' ? '1' : '0'} !important;
            pointer-events: ${currentTutorialStep === 'voice' ? 'auto' : 'none'} !important;
            z-index: 10005 !important;
            transition: opacity 0.3s ease !important;
          }
        `}</style>
      )}

      <AnimatePresence>
        {toastMessage && (
            <motion.div 
                initial={{ opacity: 0, y: 50, x: '-50%' }}
                animate={{ opacity: 1, y: 0, x: '-50%' }}
                exit={{ opacity: 0, y: 50, x: '-50%' }}
                className="fixed bottom-24 left-1/2 z-[200] bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg font-bold text-sm text-center whitespace-nowrap"
            >
                {toastMessage}
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MainMenu;
