
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
import { preloadTajweedAudio } from './utils/audioCache';
import { Mic, MicOff } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from './context/ThemeContext';
import { normalizeArabic } from './src/utils/voiceParser';

// --- Main App Component ---
function App() {
  const { theme, applyPresetTheme } = useTheme();
  const [showSplash, setShowSplash] = useState(true);
  const [history, setHistory] = useState(['home']);
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const handleNavigate = useCallback((pageId: string) => {
    const validPages = [
      'quran', 'quran-landscape', 'quran-download', 'salah-adhkar', 'calendar', 'listen', 'tasbeeh', 
      'hajj-umrah', 'hisn-muslim', 'prayer-times', 'qibla', 
      'sabah-masaa', 'adia', 'nawawi', 'calculators', 'tajweed-education', 'voice-control', 'more-menu'
    ];

    if (validPages.includes(pageId)) {
      setHistory(prev => {
        if (prev[prev.length - 1] !== pageId) {
          return [...prev, pageId];
        }
        return prev;
      });
    } else {
      alert(`التنقل إلى قسم "${pageId}" قيد الإنشاء.`);
    }
  }, []);

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
      applyPresetTheme(params.theme);
      return;
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
    else if (action === 'open_tajweed' || (action === 'ui_click' && params?.label?.includes('تجويد'))) handleNavigate('tajweed-education');
    else if (action === 'open_nawawi' || (action === 'ui_click' && params?.label?.includes('اربعون'))) handleNavigate('nawawi');
    else if (action === 'open_calculators' || (action === 'ui_click' && params?.label?.includes('حاسبه'))) handleNavigate('calculators');
    else if (action === 'open_listen' || (action === 'ui_click' && params?.label?.includes('استماع'))) handleNavigate('listen');
    else if (action === 'open_adia' || (action === 'ui_click' && params?.label?.includes('ادعيه'))) handleNavigate('adia');
    else if (action === 'open_salah_adhkar') handleNavigate('salah-adhkar');
    else if (action === 'open_hisn_muslim' || (action === 'ui_click' && params?.label?.includes('حصن'))) handleNavigate('hisn-muslim');
    else if (action === 'open_calendar' || (action === 'ui_click' && params?.label?.includes('تقويم'))) handleNavigate('calendar');
    else if (action === 'open_hajj_umrah' || (action === 'ui_click' && params?.label?.includes('حج'))) handleNavigate('hajj-umrah');
    else if (action === 'open_quran' || (action === 'ui_click' && params?.label?.includes('مصحف'))) handleNavigate('quran');
    else if (action === 'open_voice_control') handleNavigate('voice-control');
    else if (action === 'open_search' || (action === 'ui_click' && params?.label?.includes('بحث'))) {
      setHistory(prev => {
        if (prev[prev.length - 1] === 'quran') {
          window.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'open_search', params } }));
          return prev;
        } else {
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'open_search', params } }));
          }, 500);
          return [...prev, 'quran'];
        }
      });
    }
    else if (action === 'open_themes' || (action === 'ui_click' && params?.label?.includes('ثيم'))) setIsThemeSelectorOpen(true);
    else if (action === 'open_settings' || (action === 'ui_click' && params?.label?.includes('اعدادات'))) {
      setHistory(prev => {
        if (prev[prev.length - 1] === 'quran') {
          window.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'open_settings', params } }));
          return prev;
        } else {
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'open_settings', params } }));
          }, 500);
          return [...prev, 'quran'];
        }
      });
    }
    else if (action === 'exit_app') setShowExitConfirm(true);
    else if (action === 'go_back') navigateBack();
    
    // 4. Quran Specific Actions (Forwarded to QuranReader via Event)
    else if (['next_page', 'prev_page', 'play_audio', 'stop_audio', 'quran_navigation', 'increase_font', 'decrease_font', 'change_theme', 'download_quran', 'show_tafsir', 'open_bookmarks', 'go_to_page', 'go_to_juz', 'go_to_surah', 'go_to_ayah', 'set_font_size', 'set_color', 'toggle_sajdah', 'contextual_number', 'start_autoscroll', 'stop_autoscroll', 'stop_action', 'increase_speed', 'decrease_speed', 'scroll_up', 'scroll_down', 'set_orientation_horizontal', 'set_orientation_vertical'].includes(action)) {
      // If theme selector is open, don't navigate to Quran page just for scrolling
      if (isThemeSelectorOpen && (action === 'scroll_up' || action === 'scroll_down')) {
          window.dispatchEvent(new CustomEvent('voice-command', { detail: { action, text, params } }));
          return;
      }
      
      setHistory(prev => {
        if (prev[prev.length - 1] === 'quran') {
          window.dispatchEvent(new CustomEvent('voice-command', { detail: { action, text, params } }));
          return prev;
        } else {
          // For orientation and general scroll/stop commands, if not in Quran, we might not want to force navigate, but the user requested "عند قول القراءة الافقية او القراءة الراسية يتم الذهاب الى الصفحة المحددة"
          // So we navigate to quran for all quran specific actions.
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('voice-command', { detail: { action, text, params } }));
          }, 500);
          return [...prev, 'quran'];
        }
      });
    }
    
    // 5. Tasbeeh and Adkar Specific Actions
    else if (['increment_tasbeeh', 'reset_counter'].includes(action)) {
      setHistory(prev => {
        const currentPage = prev[prev.length - 1];
        if (currentPage === 'tasbeeh' || currentPage === 'sabah-masaa' || currentPage === 'salah-adhkar') {
          window.dispatchEvent(new CustomEvent('voice-command', { detail: { action, text, params } }));
        }
        return prev;
      });
    }
  }, [handleNavigate, applyPresetTheme, performUiClick, navigateBack, isThemeSelectorOpen]);

  const page = history[history.length - 1];

  if (showSplash) {
    return <VideoSplash onEnded={() => setShowSplash(false)} />;
  }

  return (
    <PrayerTimesProvider>
      <VoiceControlProvider onAction={handleVoiceAction}>
        <AppContent 
          page={page} 
          history={history}
          isThemeSelectorOpen={isThemeSelectorOpen}
          showExitConfirm={showExitConfirm}
          handleNavigate={handleNavigate}
          navigateBack={navigateBack}
          setIsThemeSelectorOpen={setIsThemeSelectorOpen}
          setShowExitConfirm={setShowExitConfirm}
        />
      </VoiceControlProvider>
    </PrayerTimesProvider>
  );
}

function AppContent({ 
  page, 
  history, 
  isThemeSelectorOpen, 
  showExitConfirm, 
  handleNavigate, 
  navigateBack, 
  setIsThemeSelectorOpen, 
  setShowExitConfirm 
}: any) {
  const { setCurrentPage } = useVoiceControl();

  useEffect(() => {
    setCurrentPage(page);
  }, [page, setCurrentPage]);

  useEffect(() => {
    // Start preloading tajweed audio in the background
    preloadTajweedAudio();
  }, []);

  useWakeLock();

  useBackButton({
    history,
    isThemeSelectorOpen,
    showExitConfirm,
    navigateBack,
    setIsThemeSelectorOpen,
    setShowExitConfirm
  });

  const handleConfirmExit = () => {
    CapacitorApp.exitApp();
  };
  
  const toggleThemeSelector = () => setIsThemeSelectorOpen(prev => !prev);
  const closeThemeSelector = () => setIsThemeSelectorOpen(false);

  return (
    <div className="relative min-h-screen">
      <AppRouter 
        page={page} 
        onBack={navigateBack} 
        onNavigate={handleNavigate} 
        onOpenThemes={toggleThemeSelector}
      />

      {/* Global Voice Control Toggle */}
      {page === 'home' && <VoiceControlToggle />}

      {isThemeSelectorOpen && (
        <ThemeSelector 
          onClose={closeThemeSelector} 
        />
      )}

      {showExitConfirm && (
          <ExitConfirmModal
              isOpen={showExitConfirm}
              onConfirm={handleConfirmExit}
              onClose={() => setShowExitConfirm(false)}
          />
      )}
      
      <RateUs />
    </div>
  );
}

import { useVoiceControl } from './context/VoiceControlContext';

const VoiceControlToggle = () => {
  const { isEnabled, toggleEnabled, isListening } = useVoiceControl();

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleEnabled}
      className={`fixed left-4 z-[100] w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-colors border-2 border-white ${
        isEnabled 
          ? (isListening ? 'bg-red-500 animate-pulse' : 'bg-green-500') 
          : 'bg-gray-400'
      }`}
      style={{ bottom: 'calc(72px + env(safe-area-inset-bottom, 0px))' }}
      title={isEnabled ? 'تعطيل التحكم الصوتي' : 'تفعيل التحكم الصوتي'}
    >
      {isEnabled ? <Mic className="text-white w-5 h-5" /> : <MicOff className="text-white w-5 h-5" />}
      
      {isEnabled && isListening && (
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-red-500 -z-10"
        />
      )}
    </motion.button>
  );
};

export default App;