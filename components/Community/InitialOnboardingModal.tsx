import React from 'react';
import { motion } from 'motion/react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

interface InitialOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (pageId: string) => void;
}

export const InitialOnboardingModal: React.FC<InitialOnboardingModalProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const { setLanguage } = useLanguage();
  const { theme, themeKey } = useTheme();
  const isBlackTheme = themeKey === 'deep_black' || theme?.bgColor === '#000000';

  if (!isOpen) return null;

  const handleSelectLanguage = (lang: 'ar' | 'en') => {
    try {
      setLanguage(lang);
      localStorage.setItem('initial_community_onboarding_completed', 'true');
    } catch (e) {}
    onClose();
    onNavigate('home');
  };

  const cardBg = isBlackTheme ? '#111827' : (theme?.bgColor || '#ffffff');
  const textColor = isBlackTheme ? '#ffffff' : (theme?.textColor || '#000000');
  const borderColor = isBlackTheme ? 'rgba(255,255,255,0.1)' : (theme?.cardBorder || 'rgba(0,0,0,0.1)');

  return (
    <div className="fixed inset-0 z-[1400] bg-black/60 backdrop-blur-md flex items-center justify-center p-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-sm rounded-3xl p-6 sm:p-7 shadow-2xl border flex flex-col items-center text-center relative overflow-hidden"
        style={{
          backgroundColor: cardBg,
          borderColor: borderColor,
          color: textColor
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 shadow-inner">
          <Globe size={30} />
        </div>

        <h2 className="text-lg sm:text-xl font-black mb-2">
          اختر لغة التطبيق / Choose App Language
        </h2>
        <p className="text-xs sm:text-sm opacity-75 mb-6 leading-relaxed">
          يرجى اختيار لغة العرض المفضلة لديك للبدء في استخدام مصحف أحمد وليلى.
          <br />
          Please select your preferred display language to start.
        </p>

        <div className="w-full space-y-3">
          <button
            onClick={() => handleSelectLanguage('ar')}
            className="w-full py-3.5 px-6 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <span>العربية</span>
            <span className="text-xs opacity-85 font-normal">(Arabic)</span>
          </button>

          <button
            onClick={() => handleSelectLanguage('en')}
            className="w-full py-3.5 px-6 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
          >
            <span>English</span>
            <span className="text-xs opacity-85 font-normal">(الإنجليزية)</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default InitialOnboardingModal;
