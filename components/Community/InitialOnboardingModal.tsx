import React from 'react';
import { motion } from 'motion/react';
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
        className="w-full max-w-xs sm:max-w-sm rounded-3xl p-5 sm:p-6 shadow-2xl border flex flex-col items-center text-center relative overflow-hidden"
        style={{
          backgroundColor: cardBg,
          borderColor: borderColor,
          color: textColor
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* أول القائمة: الصف الأول (مصحف أحمد وليلى) والصف الثاني (Mushaf Ahmed &laila) */}
        <div className="flex flex-col items-center justify-center w-full mb-4">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-2.5 shadow-md"
            style={{ backgroundColor: isBlackTheme ? 'rgba(255,255,255,0.12)' : `${theme?.palette?.[0] || '#059669'}18` }}
          >
            <img 
              src="/app_icon.png" 
              alt="Logo" 
              className="w-8 h-8 object-contain rounded-lg"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }} 
            />
          </div>
          <h1 
            className="text-xl sm:text-2xl font-black font-kufi tracking-tight mb-1"
            style={{ color: isBlackTheme ? '#FFFFFF' : (theme?.palette?.[0] || '#059669') }}
          >
            مصحف أحمد وليلى
          </h1>
          <h2 
            className="text-sm sm:text-base font-bold font-sans tracking-wide opacity-85"
            style={{ color: isBlackTheme ? '#E5E7EB' : (theme?.textColor || '#374151') }}
          >
            Mushaf Ahmed &laila
          </h2>
        </div>

        <div className="w-full h-px bg-current opacity-10 mb-4" />

        <h3 className="text-xs sm:text-sm font-bold mb-4 opacity-75 whitespace-nowrap tracking-tight">
          اختر لغة التطبيق / Choose App Language
        </h3>

        <div className="w-full space-y-3">
          <button
            onClick={() => handleSelectLanguage('ar')}
            className="w-full py-3.5 px-6 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <span>العربية</span>
          </button>

          <button
            onClick={() => handleSelectLanguage('en')}
            className="w-full py-3.5 px-6 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
          >
            <span>English</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default InitialOnboardingModal;
