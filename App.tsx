
import React, { useState, useCallback, useEffect } from 'react';
import ThemeSelector from './components/ThemesModal';
import ExitConfirmModal from './components/ExitConfirmModal';
import AppRouter from './router/AppRouter';
import VideoSplash from './components/VideoSplash';
import RateUs from './components/RateUs';
import { useWakeLock } from './hooks/useWakeLock';
import { useBackButton } from './hooks/useBackButton';
import { App as CapacitorApp } from '@capacitor/app';
import { PrayerTimesProvider } from './context/PrayerTimesContext';
import { VoiceControlProvider } from './context/VoiceControlContext';
import { TutorialProvider } from './context/TutorialContext';
import SideMenu from './components/SideMenu';
import MawlidNotification from './components/MawlidNotification';
import { Mic, MicOff } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from './context/ThemeContext';
import { normalizeArabic } from './utils/voiceParser';
import { usePrayerTimes } from './context/PrayerTimesContext';
import { setupNotifications } from './utils/notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { clearSearchCache } from './pages/GlobalSearch';

// --- Main App Component ---
function App() {
  const { theme, applyPresetTheme, setCurrentPage } = useTheme();
  const [showSplash, setShowSplash] = useState(true);
  const [history, setHistory] = useState(['home']);
  const [navParams, setNavParams] = useState<any>(null);
  const [lastMenuPage, setLastMenuPage] = useState('home');
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

  useEffect(() => {
    const currentPage = history[history.length - 1];
    setCurrentPage(currentPage);
  }, [history, setCurrentPage]);

  useEffect(() => {
    if (!history.includes('search')) {
      clearSearchCache();
    }
    const currentPage = history[history.length - 1];
    if (currentPage === 'home' || currentPage === 'more-menu') {
      setLastMenuPage(currentPage);
    }
  }, [history]);

  const handleNavigate = useCallback((pageId: string, params?: any) => {
    setIsSideMenuOpen(false);
    const validPages = [
      'home', 'quran', 'quran-landscape', 'quran-download', 'salah-adhkar', 'calendar', 'listen', 'tasbeeh', 
      'hajj-umrah', 'hisn-muslim', 'prayer-times', 'monthly-prayer-times', 'qibla', 
      'sabah-masaa', 'adia', 'nawawi', 'calculators', 'voice-control', 'more-menu', 'daily-wird', 'memorization',
      'phone-notifications', 'search', 'asmaul-husna', 'habit-tracker'
    ];

    if (pageId === 'phone-notifications') {
      setNavParams({ openModal: 'notification-settings-modal' });
      setHistory(prev => [...prev, 'quran']);
      return;
    }

    if (pageId === 'settings') {
      setNavParams({ openModal: 'settings-modal' });
      setHistory(prev => [...prev, 'quran']);
      return;
    }

    if (pageId === 'home') {
      // 0. If force is true, reset to home
      if (params?.force) {
        setHistory(['home']);
        setNavParams(null);
        return;
      }

      // Logic for home button:
      // 1. If currently in quran, go back (one step)
      const current = history[history.length - 1];
      if (current === 'quran' || current === 'quran-landscape') {
        setHistory(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
        return;
      }
      
      // 2. If we are in more-menu, home should take us back to home
      if (current === 'more-menu') {
        setHistory(['home']);
        setNavParams(null);
        return;
      }

      // 3. Return to last menu
      if (lastMenuPage === 'more-menu') {
        const moreMenuIndex = history.lastIndexOf('more-menu');
        if (moreMenuIndex !== -1) {
          setHistory(prev => prev.slice(0, moreMenuIndex + 1));
          return;
        }
      }

      const quranIndex = history.lastIndexOf('quran');
      const quranLandscapeIndex = history.lastIndexOf('quran-landscape');
      const targetIndex = Math.max(quranIndex, quranLandscapeIndex);
      
      if (targetIndex !== -1 && targetIndex < history.length - 1) {
        setHistory(prev => prev.slice(0, targetIndex + 1));
        return;
      }

      setHistory(['home']);
      setNavParams(null);
      return;
    }

    if (validPages.includes(pageId)) {
      setNavParams(params || null);
      setHistory(prev => {
        const current = prev[prev.length - 1];
        
        // If we are navigating to the same page, do nothing
        if (current === pageId) return prev;

        // Features list (all valid pages except home, more-menu)
        const isMenu = (id: string) => id === 'home' || id === 'more-menu';
        const isQuran = (id: string) => id === 'quran' || id === 'quran-landscape';

        // If we are switching between features (and not coming from or going to a menu)
        // we replace the last feature to keep history clean.
        // Exception: quran reader stays in history if reached from another feature
        // to allow returning to the previous feature (like daily-wird).
        if (!isMenu(current) && !isMenu(pageId)) {
          if (isQuran(pageId) && !isQuran(current)) {
            return [...prev, pageId];
          }
          return [...prev.slice(0, -1), pageId];
        }

        return [...prev, pageId];
      });
    } else {
      alert(`التنقل إلى قسم "${pageId}" قيد الإنشاء.`);
    }
  }, [history, lastMenuPage]);

  useEffect(() => {
    setupNotifications();

    let listener: any = null;
    if (Capacitor.isNativePlatform()) {
      listener = LocalNotifications.addListener('localNotificationActionPerformed', (notificationAction) => {
        const page = notificationAction.notification.extra?.page;
        const params = notificationAction.notification.extra?.params;
        if (page) {
          handleNavigate(page, params);
        }
      });
    }

    return () => {
      if (listener) {
        listener.then((l: any) => l.remove());
      }
    };
  }, [handleNavigate]);

  const performUiClick = useCallback((label: string) => {
    const normalizedLabel = normalizeArabic(label);
    const elements = document.querySelectorAll('button, [role="button"], a, .clickable, .voice-target');
    for (const el of Array.from(elements)) {
      const htmlEl = el as HTMLElement;
      const text = normalizeArabic(htmlEl.innerText || htmlEl.getAttribute('aria-label') || htmlEl.title || '');
      if (text && text.includes(normalizedLabel)) {
        console.log('Voice Control - Simulating click on:', text);
        htmlEl.click();
        return true;
      }
    }
    return false;
  }, []);

  const navigateBack = useCallback(() => {
    setHistory(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const handleVoiceAction = useCallback((action: string, text: string, params?: any) => {
    console.log('Voice Action:', action, text, params);
    
    // 1. Handle Theme Change
    if (action === 'set_theme' && params?.theme) {
      if (page === 'quran') {
        window.dispatchEvent(new CustomEvent('voice-command', { detail: { action, text, params } }));
        return;
      } else {
        applyPresetTheme(params.theme);
        return;
      }
    }

    // 2. Handle UI Click
    if (action === 'ui_click' && params?.label) {
      if (performUiClick(params.label)) return;
    }

    // 3. Global Navigation Actions
    if (action === 'go_home') setHistory(['home']);
    else if (action === 'open_athkar' || (action === 'ui_click' && params?.label?.includes('اذكار'))) handleNavigate('sabah-masaa');
    else if (action === 'open_prayer' || (action === 'ui_click' && params?.label?.includes('صلاه'))) handleNavigate('prayer-times');
    else if (action === 'open_qibla' || (action === 'ui_click' && params?.label?.includes('قبله'))) handleNavigate('qibla');
    else if (action === 'open_tasbeeh' || (action === 'ui_click' && params?.label?.includes('مسبحه'))) handleNavigate('tasbeeh');
    else if (action === 'open_nawawi' || (action === 'ui_click' && params?.label?.includes('اربعون'))) handleNavigate('nawawi');
    else if (action === 'open_calculators' || (action === 'ui_click' && params?.label?.includes('حاسبه'))) handleNavigate('calculators');
    else if (action === 'open_listen' || (action === 'ui_click' && params?.label?.includes('استماع'))) handleNavigate('listen');
    else if (action === 'open_adia' || (action === 'ui_click' && params?.label?.includes('ادعيه'))) handleNavigate('adia');
    else if (action === 'open_salah_adhkar' || (action === 'ui_click' && params?.label?.includes('اذكار الصلاه'))) handleNavigate('salah-adhkar');
    else if (action === 'open_hisn_muslim' || (action === 'ui_click' && (params?.label?.includes('حصن') || params?.label?.includes('حسن')))) handleNavigate('hisn-muslim');
    else if (action === 'open_calendar' || (action === 'ui_click' && params?.label?.includes('تقويم'))) handleNavigate('calendar');
    else if (action === 'open_hajj_umrah' || (action === 'ui_click' && params?.label?.includes('حج'))) handleNavigate('hajj-umrah');
    else if (action === 'open_asmaul_husna' || (action === 'ui_click' && params?.label?.includes('اسماء الله'))) handleNavigate('asmaul-husna');
    else if (action === 'open_daily_wird' || (action === 'ui_click' && params?.label?.includes('ورد'))) handleNavigate('daily-wird');
    else if (action === 'open_memorization' || (action === 'ui_click' && params?.label?.includes('تحفيظ'))) handleNavigate('memorization');
    else if (action === 'open_quran' || (action === 'ui_click' && params?.label?.includes('مصحف'))) handleNavigate('quran');
    else if (action === 'open_voice_control' || (action === 'ui_click' && params?.label?.includes('تحكم صوتي'))) handleNavigate('voice-control');
    else if (action === 'open_more' || (action === 'ui_click' && params?.label?.includes('مزيد'))) handleNavigate('more-menu');
    else if (action === 'set_orientation_horizontal' || action === 'set_orientation_vertical') {
      window.dispatchEvent(new CustomEvent('voice-command', { detail: { action, text, params } }));
    }
    else if (action === 'open_search' || (action === 'ui_click' && params?.label?.includes('بحث'))) {
      handleNavigate('search');
    }
    else if (action === 'open_themes' || (action === 'ui_click' && params?.label?.includes('ثيم'))) {
      if (page === 'quran') {
        window.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'open_themes' } }));
      } else {
        setIsThemeSelectorOpen(true);
      }
    }
    else if (action === 'open_settings' || (action === 'ui_click' && params?.label?.includes('اعدادات'))) window.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'open_settings' } }));
    else if (action === 'exit_app') setShowExitConfirm(true);
    else if (action === 'go_back') navigateBack();
    
    // 4. Quran Specific Actions (Forwarded to QuranReader via Event)
    else if (['next_page', 'prev_page', 'play_audio', 'stop_audio', 'quran_navigation', 'increase_font', 'decrease_font', 'change_theme', 'download_quran', 'download_tafsir', 'show_tafsir', 'open_bookmarks', 'go_to_page', 'go_to_juz', 'go_to_surah', 'go_to_ayah', 'set_font_size', 'contextual_number', 'download', 'cancel', 'ui_discovery', 'toggle_auto_scroll', 'pause_auto_scroll', 'stop_auto_scroll', 'close_modal', 'save_bookmark'].includes(action)) {
      setHistory(prev => {
        if (prev[prev.length - 1] === 'quran') {
          window.dispatchEvent(new CustomEvent('voice-command', { detail: { action, text, params } }));
          return prev;
        } else {
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('voice-command', { detail: { action, text, params } }));
          }, 500);
          return [...prev, 'quran'];
        }
      });
    }
  }, [handleNavigate, applyPresetTheme, performUiClick, navigateBack]);

  const page = history[history.length - 1];

  if (showSplash) {
    return <VideoSplash onEnded={() => setShowSplash(false)} />;
  }

  return (
    <TutorialProvider>
      <PrayerTimesProvider>
        <VoiceControlProvider onAction={handleVoiceAction}>
          <AppContent 
            page={page} 
            history={history}
            navParams={navParams}
            isThemeSelectorOpen={isThemeSelectorOpen}
            showExitConfirm={showExitConfirm}
            isSideMenuOpen={isSideMenuOpen}
            setIsSideMenuOpen={setIsSideMenuOpen}
            handleNavigate={handleNavigate}
            navigateBack={navigateBack}
            setIsThemeSelectorOpen={setIsThemeSelectorOpen}
            setShowExitConfirm={setShowExitConfirm}
          />
        </VoiceControlProvider>
      </PrayerTimesProvider>
    </TutorialProvider>
  );
}


function AppContent({ 
  page, 
  history, 
  navParams,
  isThemeSelectorOpen, 
  showExitConfirm, 
  isSideMenuOpen,
  setIsSideMenuOpen,
  handleNavigate, 
  navigateBack, 
  setIsThemeSelectorOpen, 
  setShowExitConfirm 
}: any) {
  const { setCurrentPage: setVoicePage } = useVoiceControl();
  const { theme, themeKey, applyPresetTheme, setCurrentPage: setThemePage } = useTheme();

  useEffect(() => {
    setVoicePage(page);
    setThemePage(page);
  }, [page, setVoicePage, setThemePage]);

  useWakeLock();

  useBackButton({
    history,
    isThemeSelectorOpen,
    showExitConfirm,
    navigateBack,
    setIsThemeSelectorOpen,
    setShowExitConfirm
  });

  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleConfirmExit = () => {
    CapacitorApp.exitApp();
  };
  
  const handleOpenThemes = useCallback(() => {
    if (page === 'quran' || page === 'quran-landscape') {
      window.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'open_themes' } }));
    } else {
      setIsThemeSelectorOpen(prev => !prev);
    }
  }, [page]);

  const closeThemeSelector = () => setIsThemeSelectorOpen(false);

  return (
    <div className="relative min-h-screen">
      <AppRouter 
        page={page} 
        onBack={navigateBack} 
        onNavigate={handleNavigate} 
        onOpenThemes={handleOpenThemes}
        onOpenSideMenu={() => setIsSideMenuOpen(true)}
        navParams={navParams}
      />

      <SideMenu 
        isOpen={isSideMenuOpen} 
        onClose={() => setIsSideMenuOpen(false)} 
        onNavigate={handleNavigate}
        onOpenThemes={handleOpenThemes}
        currentTheme={theme}
        currentPage={page}
      />

      {/* Global Voice Control Toggle - Removed from here, moved to MainMenu */}
      {/* {page === 'home' && <VoiceControlToggle />} */}

      {isThemeSelectorOpen && (
        <ThemeSelector 
          onClose={closeThemeSelector} 
          isLandscape={isLandscape}
        />
      )}

      {showExitConfirm && (
          <ExitConfirmModal
              isOpen={showExitConfirm}
              onConfirm={handleConfirmExit}
              onClose={() => setShowExitConfirm(false)}
              isLandscape={isLandscape}
          />
      )}
      
      <RateUs />
      <MawlidNotification />
    </div>
  );
}

import { useVoiceControl } from './context/VoiceControlContext';
import { useTutorial } from './context/TutorialContext';

export default App;
