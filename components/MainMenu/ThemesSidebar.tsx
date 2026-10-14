import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Image, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { presetThemes } from '../../context/themes';

interface ThemesSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// ألوان الدوائر المميزة لكل ثيم من ثيمات الصفحة الرئيسية
const getThemeCircleColor = (key: string, t: any) => {
  if (key === 'deep_black') return '#000000';
  if (key === 'default') return '#059669';
  if (key === 'fajr_light') return '#0284C7';
  if (key === 'golden_sand') return '#B45309';
  if (key === 'olive_grove') return '#4D7C0F';
  if (key === 'kaaba_kiswa') return '#111827';
  if (key === 'islamic_heritage') return '#8B4513';
  if (key === 'evening_tranquility') return '#2563EB';
  if (key === 'morning_dew') return '#10B981';
  if (key === 'madinah_rose') return '#BE123C';
  if (key === 'andalusian_garden') return '#166534';
  if (key === 'blue_mosque') return '#0E7490';
  if (key === 'clay_earth') return '#9A3412';
  if (key === 'slate_stone') return '#334155';
  if (key === 'sunset_glow') return '#EA580C';
  if (key === 'electric_violet') return '#7C3AED';
  if (key === 'sakura_breeze') return '#DB2777';
  if (key === 'midnight_neon') return '#0891B2';
  if (key === 'royal_purple') return '#6D28D9';
  if (key === 'desert_night') return '#4338CA';
  if (key === 'ocean_peace') return '#0284C7';
  if (key === 'vintage_paper') return '#78350F';
  if (key === 'turquoise_gem') return '#0D9488';
  if (key === 'deep_forest') return '#047857';
  if (key === 'lavender_mist') return '#A855F7';
  if (key === 'crystal_glass') return '#38BDF8';
  if (key === 'frosted_emerald') return '#059669';
  if (key === 'midnight_glass') return '#1E1B4B';
  return (t?.palette && t.palette[0]) || t?.accent || t?.bgColor || '#10B981';
};


export const ThemesSidebar: React.FC<ThemesSidebarProps> = ({ isOpen, onClose }) => {
  const { theme, themeKey, applyPresetTheme, setCustomBackground, resetBackground } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const asideRef = useRef<HTMLElement>(null);

  const handleBgUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const isVideo = file.type.startsWith('video/');
        setCustomBackground(result, isVideo);
      };
      reader.readAsDataURL(file);
    }
  };

  const themeBorderColor = (theme.palette && theme.palette[0]) || theme.accent || '#10b981';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[1200] bg-black/25 backdrop-blur-[1px] cursor-pointer"
            style={{ position: 'fixed' }}
          />

          {/* Narrow Sidebar Drawer stuck to the right edge with permanent white background */}
          <motion.aside
            ref={asideRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="w-[84px] sm:w-[94px] shadow-2xl flex flex-col rounded-l-2xl rounded-r-none border-y-2 border-l-2 border-r-0 overflow-hidden"
            dir="rtl"
            style={{
              position: 'fixed',
              top: 'calc(env(safe-area-inset-top, 0px) + 1cm)',
              bottom: 'calc(env(safe-area-inset-bottom, 0px) + 1cm)',
              right: 0,
              zIndex: 1250,
              backgroundColor: '#FFFFFF',
              color: '#1e293b',
              borderColor: themeBorderColor,
              fontFamily: theme.font,
            }}
          >
            {/* Quick Actions Row */}
            <div 
              className="p-1.5 border-b grid grid-cols-3 gap-1 shrink-0 bg-slate-50 relative z-10"
              style={{ borderBottomColor: `${themeBorderColor}25` }}
            >
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-2 px-1 rounded-lg flex items-center justify-center transition-all active:scale-90 hover:bg-slate-200/60 cursor-pointer"
                title="تخصيص خلفية مخصصة"
                aria-label="تخصيص خلفية مخصصة"
              >
                <Image className="w-4 h-4 text-blue-500" />
              </button>

              <button
                type="button"
                onClick={() => resetBackground()}
                className="py-2 px-1 rounded-lg flex items-center justify-center transition-all active:scale-90 hover:bg-slate-200/60 cursor-pointer"
                title="استعادة الخلفية"
                aria-label="استعادة الخلفية"
              >
                <RotateCcw className="w-4 h-4 text-amber-500" />
              </button>

              <button
                type="button"
                onClick={() => applyPresetTheme('default')}
                className="py-2 px-1 rounded-lg flex items-center justify-center transition-all active:scale-90 hover:bg-slate-200/60 cursor-pointer"
                title="الثيم الافتراضي"
                aria-label="الثيم الافتراضي"
              >
                <Sparkles className="w-4 h-4 text-emerald-500" />
              </button>
            </div>

            {/* Hidden File Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*,video/*" 
              className="hidden" 
              onChange={handleBgUpload} 
            />

            {/* Scrollable Theme Circles (فقط دوائر الثيمات بدون أي نصوص) */}
            <div className="flex-1 overflow-y-auto p-2 pb-2.5 scrollbar-hide relative z-10 bg-white">
              <div className="grid grid-cols-2 gap-y-3.5 gap-x-1.5 place-items-center py-2">
                {Object.entries(presetThemes).map(([key, t]: [string, any]) => {
                  const isSelected = themeKey === key;
                  const circleBg = getThemeCircleColor(key, t);

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => applyPresetTheme(key)}
                      className="flex items-center justify-center p-0.5 group transition-transform active:scale-90 cursor-pointer rounded-full"
                      title={t.name}
                      aria-label={t.name}
                    >
                      <div
                        className={`w-[22px] h-[22px] rounded-full border-[1.5px] transition-all flex items-center justify-center relative shadow-sm ${
                          isSelected
                            ? 'scale-110 shadow-md'
                            : 'border-slate-300 hover:border-slate-400 hover:scale-110'
                        }`}
                        style={{
                          backgroundColor: circleBg,
                          borderColor: isSelected
                            ? themeBorderColor
                            : undefined,
                          boxShadow: isSelected
                            ? `0 0 0 1.5px #FFFFFF, 0 0 0 3px ${themeBorderColor}`
                            : undefined
                        }}
                      >
                        {isSelected && (
                          <div
                            className="w-1.5 h-1.5 rounded-full shadow-sm"
                            style={{
                              backgroundColor:
                                key === 'deep_black' || key === 'kaaba_kiswa'
                                  ? themeBorderColor
                                  : '#ffffff'
                            }}
                          />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default ThemesSidebar;
