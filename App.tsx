
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

// --- Main App Component ---
function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [history, setHistory] = useState(['home']);
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const handleVoiceAction = useCallback((action: string, text: string) => {
    console.log('Voice Action:', action, text);
    
    // Global Navigation Actions
    if (action === 'go_home') setHistory(['home']);
    else if (action === 'open_athkar') handleNavigate('sabah-masaa');
    else if (action === 'open_prayer') handleNavigate('prayer-times');
    else if (action === 'open_qibla') handleNavigate('qibla');
    else if (action === 'open_tasbeeh') handleNavigate('tasbeeh');
    else if (action === 'open_tajweed') handleNavigate('tajweed-education');
    else if (action === 'open_search') window.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'open_search' } }));
    else if (action === 'open_themes') setIsThemeSelectorOpen(true);
    else if (action === 'open_settings') window.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'open_settings' } }));
    
    // Quran Specific Actions (Forwarded to QuranReader via Event)
    else if (['next_page', 'prev_page', 'play_audio', 'stop_audio', 'quran_navigation'].includes(action)) {
      if (history[history.length - 1] === 'quran') {
        window.dispatchEvent(new CustomEvent('voice-command', { detail: { action, text } }));
      } else {
        handleNavigate('quran');
        // Wait for navigation then dispatch? Or just let QuranReader handle it on mount if we pass state?
        // For now, just dispatch. If QuranReader is not mounted, it won't do anything.
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('voice-command', { detail: { action, text } }));
        }, 500);
      }
    }
  }, [history]);

  useEffect(() => {
    // Start preloading tajweed audio in the background
    preloadTajweedAudio();
  }, []);

  const page = history[history.length - 1];

  const navigateBack = useCallback(() => {
    setHistory(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
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

  const handleNavigate = (pageId: string) => {
    const validPages = [
      'quran', 'quran-landscape', 'salah-adhkar', 'calendar', 'listen', 'tasbeeh', 
      'hajj-umrah', 'hisn-muslim', 'prayer-times', 'qibla', 
      'sabah-masaa', 'adia', 'nawawi', 'calculators', 'tajweed-education'
    ];

    if (validPages.includes(pageId)) {
      if (history[history.length - 1] !== pageId) {
        setHistory(prev => [...prev, pageId]);
      }
    } else {
      alert(`التنقل إلى قسم "${pageId}" قيد الإنشاء.`);
    }
  };
  
  const toggleThemeSelector = () => setIsThemeSelectorOpen(prev => !prev);
  const closeThemeSelector = () => setIsThemeSelectorOpen(false);

  if (showSplash) {
    return <VideoSplash onEnded={() => setShowSplash(false)} />;
  }

  return (
    <PrayerTimesProvider>
      <VoiceControlProvider onAction={handleVoiceAction}>
        <div className="relative min-h-screen">
          <AppRouter 
            page={page} 
            onBack={navigateBack} 
            onNavigate={handleNavigate} 
            onOpenThemes={toggleThemeSelector}
          />

          {/* Global Voice Control Toggle */}
          <VoiceControlToggle />

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
      </VoiceControlProvider>
    </PrayerTimesProvider>
  );
}

import { useVoiceControl } from './context/VoiceControlContext';

const VoiceControlToggle = () => {
  const { isEnabled, setIsEnabled, isListening } = useVoiceControl();

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => setIsEnabled(!isEnabled)}
      className={`fixed bottom-24 left-6 z-[100] w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors ${
        isEnabled 
          ? (isListening ? 'bg-red-500 animate-pulse' : 'bg-green-500') 
          : 'bg-gray-400'
      }`}
      title={isEnabled ? 'تعطيل التحكم الصوتي' : 'تفعيل التحكم الصوتي'}
    >
      {isEnabled ? <Mic className="text-white w-6 h-6" /> : <MicOff className="text-white w-6 h-6" />}
      
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