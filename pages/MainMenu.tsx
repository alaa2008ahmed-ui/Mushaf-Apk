
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
                      <div className="grid grid-cols-3 gap-2 px-1">
                           {/* Right Card: Previous Prayer */}
                           <div className="themed-card py-2 px-1 rounded-xl text-center flex flex-col justify-center items-center shadow-sm border-2 transition-all" 
                                style={{ borderColor: `${theme.palette[0]}33` }}>
                               <span className="text-[10px] opacity-70 font-bold mb-0.5">انتهت</span>
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
              )}
          </div>
        </div>
      </div>

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
    </div>
  );
}

export default MainMenu;
