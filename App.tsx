
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
import { preloadTajweedAudio } from './utils/audioCache';

// --- Main App Component ---
function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [history, setHistory] = useState(['home']);
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

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
      <div>
        <AppRouter 
          page={page} 
          onBack={navigateBack} 
          onNavigate={handleNavigate} 
          onOpenThemes={toggleThemeSelector}
        />

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
    </PrayerTimesProvider>
  );
}

export default App;