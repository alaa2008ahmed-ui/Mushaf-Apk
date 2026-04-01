import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'motion/react';
import { CheckCircle, BookOpen, RotateCcw, Play, Settings, X } from 'lucide-react';
import BottomBar from '../components/BottomBar';

interface WirdSettings {
  mode: 'days' | 'pages';
  value: number;
  startDate: string;
  currentDay: number;
  completedDays: number[];
  isActive: boolean;
}

const TOTAL_PAGES = 604;

const DailyWird: React.FC<{ onBack: () => void; onNavigate: (page: string, params?: any) => void }> = ({ onBack, onNavigate }) => {
  const { theme, themeKey } = useTheme();
  const [settings, setSettings] = useState<WirdSettings | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [tempMode, setTempMode] = useState<'days' | 'pages'>('days');
  const [tempValue, setTempValue] = useState<string>('30');

  const toEnglishDigits = (str: string) => {
    return str.replace(/[٠-٩]/g, (d) => (d.charCodeAt(0) - 1632).toString())
              .replace(/[۰-۹]/g, (d) => (d.charCodeAt(0) - 1776).toString());
  };

  useEffect(() => {
    const saved = localStorage.getItem('dailyWirdSettings');
    if (saved) {
      setSettings(JSON.parse(saved));
    } else {
      setShowSettings(true);
    }
  }, []);

  const saveSettings = (newSettings: WirdSettings) => {
    setSettings(newSettings);
    localStorage.setItem('dailyWirdSettings', JSON.stringify(newSettings));
  };

  const handleStart = () => {
    const val = parseInt(tempValue) || (tempMode === 'days' ? 30 : 20);
    const newSettings: WirdSettings = {
      mode: tempMode,
      value: val,
      startDate: settings ? settings.startDate : new Date().toISOString(),
      currentDay: settings ? settings.currentDay : 1,
      completedDays: settings ? settings.completedDays : [],
      isActive: true,
    };
    saveSettings(newSettings);
    setShowSettings(false);
  };

  const handleEdit = () => {
    if (settings) {
      setTempMode(settings.mode);
      setTempValue(settings.value.toString());
      setShowSettings(true);
    }
  };

  const handleCancelEdit = () => {
    setShowSettings(false);
  };

  const handleReset = () => {
    if (window.confirm('هل أنت متأكد من إعادة تعيين الختمة؟')) {
      setShowSettings(true);
      setSettings(null);
      localStorage.removeItem('dailyWirdSettings');
    }
  };

  const markDayCompleted = () => {
    if (!settings) return;
    const newCompleted = [...settings.completedDays, settings.currentDay];
    const newSettings = {
      ...settings,
      completedDays: newCompleted,
      currentDay: settings.currentDay < getTotalDays() ? settings.currentDay + 1 : settings.currentDay,
    };
    saveSettings(newSettings);
  };

  const getTotalDays = () => {
    if (!settings) return 30;
    return settings.mode === 'days' ? settings.value : Math.ceil(TOTAL_PAGES / settings.value);
  };

  const getPagesPerDay = () => {
    if (!settings) return 20;
    return settings.mode === 'pages' ? settings.value : Math.ceil(TOTAL_PAGES / settings.value);
  };

  const handleOpenQuran = (page: number) => {
    onNavigate('quran', { page });
  };

  const renderSettings = () => (
    <div className="p-6 rounded-2xl shadow-lg border" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
      <h2 className="text-2xl font-bold mb-6 text-center">إعداد الختمة</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block mb-2 font-semibold">طريقة الختمة:</label>
          <div className="flex gap-4">
            <button 
              onClick={() => setTempMode('days')}
              className={`flex-1 py-3 rounded-xl border-2 transition-all ${tempMode === 'days' ? 'border-green-500 bg-green-500/10 text-green-600 dark:text-green-400' : 'border-gray-300 dark:border-gray-600'}`}
            >
              حسب الأيام
            </button>
            <button 
              onClick={() => setTempMode('pages')}
              className={`flex-1 py-3 rounded-xl border-2 transition-all ${tempMode === 'pages' ? 'border-green-500 bg-green-500/10 text-green-600 dark:text-green-400' : 'border-gray-300 dark:border-gray-600'}`}
            >
              حسب الصفحات
            </button>
          </div>
        </div>

        <div>
          <label className="block mb-2 font-semibold">
            {tempMode === 'days' ? 'عدد الأيام للختمة:' : 'عدد الصفحات يومياً:'}
          </label>
          <input 
            type="text"
            inputMode="numeric"
            value={tempValue}
            onChange={(e) => {
              const val = toEnglishDigits(e.target.value);
              if (val === '' || /^\d*$/.test(val)) {
                setTempValue(val);
              }
            }}
            className="w-full border rounded-xl p-3 text-center text-xl font-bold focus:outline-none focus:border-green-500"
            style={{ backgroundColor: theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)', borderColor: theme.cardBorder, color: theme.textColor }}
            placeholder={tempMode === 'days' ? '30' : '20'}
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button 
            onClick={handleStart}
            className="flex-1 py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Play size={24} />
            {settings ? 'حفظ التعديلات' : 'ابدأ الختمة'}
          </button>
          {settings && (
            <button 
              onClick={handleCancelEdit}
              className="py-4 px-6 bg-gray-500 hover:bg-gray-400 text-white rounded-xl font-bold text-lg flex items-center justify-center transition-colors"
            >
              <X size={24} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const getDayRange = (day: number) => {
    if (!settings) return { start: 1, end: 20 };
    if (settings.mode === 'days') {
      const totalDays = settings.value;
      const start = Math.floor(((day - 1) * TOTAL_PAGES) / totalDays) + 1;
      const end = Math.floor((day * TOTAL_PAGES) / totalDays);
      return { start, end: Math.max(start - 1, end) };
    } else {
      const pagesPerDay = settings.value;
      const start = (day - 1) * pagesPerDay + 1;
      const end = Math.min(day * pagesPerDay, TOTAL_PAGES);
      return { start: Math.min(start, TOTAL_PAGES + 1), end };
    }
  };

  const renderProgress = () => {
    if (!settings) return null;
    const totalDays = getTotalDays();
    const progress = (settings.completedDays.length / totalDays) * 100;
    
    const { start: startPage, end: endPage } = getDayRange(settings.currentDay);
    const isCompleted = settings.completedDays.includes(settings.currentDay);
    const hasPages = startPage <= endPage && startPage <= TOTAL_PAGES;

    return (
      <div className="space-y-6">
        {/* Progress Bar */}
        <div className="rounded-2xl p-6 shadow-lg border" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <div className="flex justify-between mb-2">
            <span className="font-bold">نسبة الإنجاز</span>
            <span className="font-bold text-green-500 dark:text-green-400">{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full h-4 rounded-full overflow-hidden" style={{ backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
            />
          </div>
          <div className="flex justify-between mt-2 text-sm opacity-80">
            <span>اليوم {settings.currentDay} من {totalDays}</span>
            <span>{settings.completedDays.length} يوم مكتمل</span>
          </div>
        </div>

        {/* Current Wird */}
        <div className="rounded-2xl p-6 shadow-lg border text-center" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <h3 className="text-xl font-bold mb-4 text-emerald-600 dark:text-emerald-400">ورد اليوم ({settings.currentDay})</h3>
          
          <div className="flex justify-center items-center gap-4 mb-6">
            {hasPages ? (
              <>
                <div className="p-4 rounded-xl flex-1" style={{ backgroundColor: theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)' }}>
                  <p className="text-sm opacity-80 mb-1">من صفحة</p>
                  <p className="text-3xl font-bold">{startPage}</p>
                </div>
                <span className="text-2xl opacity-50">-</span>
                <div className="p-4 rounded-xl flex-1" style={{ backgroundColor: theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)' }}>
                  <p className="text-sm opacity-80 mb-1">إلى صفحة</p>
                  <p className="text-3xl font-bold">{endPage}</p>
                </div>
              </>
            ) : (
              <div className="p-4 rounded-xl flex-1" style={{ backgroundColor: theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)' }}>
                <p className="text-xl font-bold">لقد أكملت جميع الصفحات!</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {hasPages && (
              <button 
                onClick={() => handleOpenQuran(startPage)}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <BookOpen size={24} />
                افتح المصحف للقراءة
              </button>
            )}

            {!isCompleted ? (
              <button 
                onClick={markDayCompleted}
                className="w-full py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <CheckCircle size={24} />
                تمت القراءة
              </button>
            ) : (
              <div className="w-full py-4 bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30 rounded-xl font-bold flex items-center justify-center gap-2">
                <CheckCircle size={24} />
                أنجزت ورد اليوم، بارك الله فيك!
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={handleEdit}
            className="flex-1 py-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Settings size={20} />
            تعديل الختمة
          </button>
          <button 
            onClick={handleReset}
            className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw size={20} />
            إعادة تعيين
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: theme.font, backgroundColor: theme.background, color: theme.textColor }}>
      <header className="app-top-bar relative z-10">
        <div className="app-top-bar__inner flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="app-top-bar__title text-2xl font-kufi flex items-center justify-center gap-2">
              <span className="text-green-500 dark:text-green-400">📅</span>
              الورد اليومي
            </h1>
            <p className="app-top-bar__subtitle">تابع ختمتك للقرآن الكريم</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-32">
        <div className="max-w-md mx-auto mt-4">
          {showSettings || !settings ? renderSettings() : renderProgress()}
        </div>
      </main>

      <BottomBar onHomeClick={onBack} onThemesClick={() => {}} showThemes={false} />
    </div>
  );
};

export default DailyWird;
