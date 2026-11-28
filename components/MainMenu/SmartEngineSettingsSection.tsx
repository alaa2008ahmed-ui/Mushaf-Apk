import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Trash2, Check, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import {
  getSmartEngineSettings,
  saveSmartEngineSettings,
  subscribeSmartEngine,
  getSmartLearnedInsights,
  deleteSmartPatternByKey,
  resetSmartEngineMemory,
  getVariantDisplayName,
} from '../../services/smartEngine/smartEngineService';
import type {
  SmartEngineSettings,
  SmartLearnedInsight,
  SmartThemeVariant,
} from '../../services/smartEngine/smartEngineTypes';
import { showGlobalAppToast } from '../../utils/notifications/appNotificationSettings';

interface SmartEngineSettingsSectionProps {
  isEn: boolean;
  isNightMode: boolean;
  isBlackTheme: boolean;
  themeAccentColor: string;
  pageBgColor: string;
  showInsightsModal: boolean;
  setShowInsightsModal: (show: boolean) => void;
  onHomeClose: () => void;
}

const SMART_COLOR_SWATCHES: {
  variant: SmartThemeVariant;
  hex: string;
  labelAr: string;
  labelEn: string;
}[] = [
  { variant: 'gold', hex: '#d97706', labelAr: 'الذهبي', labelEn: 'Gold' },
  { variant: 'sky', hex: '#0284c7', labelAr: 'السماوي', labelEn: 'Sky' },
  { variant: 'emerald', hex: '#047857', labelAr: 'الزمردي', labelEn: 'Emerald' },
  { variant: 'burgundy', hex: '#881337', labelAr: 'العنابي', labelEn: 'Burgundy' },
];

export const SmartEngineSettingsSection: React.FC<SmartEngineSettingsSectionProps> = ({
  isEn,
  isNightMode,
  isBlackTheme,
  themeAccentColor,
  pageBgColor,
  showInsightsModal,
  setShowInsightsModal,
  onHomeClose,
}) => {
  const { homeThemeVariant, setHomeThemeVariant, setNightModeActive } = useTheme();
  const [settings, setSettings] = useState<SmartEngineSettings>(() => getSmartEngineSettings());
  const [insights, setInsights] = useState<SmartLearnedInsight[]>(() => getSmartLearnedInsights(isEn));
  const [confirmReset, setConfirmReset] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    const refresh = (next: SmartEngineSettings) => {
      setSettings(next);
      setInsights(getSmartLearnedInsights(isEn));
    };
    const unsubscribe = subscribeSmartEngine(refresh);
    setInsights(getSmartLearnedInsights(isEn));
    return unsubscribe;
  }, [isEn]);

  useEffect(() => {
    if (showInsightsModal) {
      setInsights(getSmartLearnedInsights(isEn));
      setConfirmReset(false);
    }
  }, [showInsightsModal, isEn]);

  const handleToggleMaster = () => {
    const nextVal = !settings.enabled;
    const updated = saveSmartEngineSettings({ enabled: nextVal });
    setSettings(updated);
    showGlobalAppToast(
      nextVal
        ? isEn
          ? 'Smart Adaptive Engine enabled'
          : 'تم تفعيل المحرك الذكي للتطبيق'
        : isEn
          ? 'Smart Adaptive Engine disabled'
          : 'تم تعطيل المحرك الذكي للتطبيق'
    );
  };

  const handleToggleSubFeature = (
    key: keyof Omit<SmartEngineSettings, 'enabled'>,
    labelAr: string,
    labelEn: string
  ) => {
    const nextVal = !settings[key];
    const updated = saveSmartEngineSettings({ [key]: nextVal });
    setSettings(updated);
    showGlobalAppToast(
      nextVal
        ? isEn
          ? `Enabled: ${labelEn}`
          : `تم تفعيل: ${labelAr}`
        : isEn
          ? `Disabled: ${labelEn}`
          : `تم إيقاف: ${labelAr}`
    );
  };

  const handlePropagateColorSwatch = (variant: SmartThemeVariant) => {
    if (!settings.enabled || !settings.autoColorSync) {
      saveSmartEngineSettings({ enabled: true, autoColorSync: true });
    }
    if (isNightMode) {
      setNightModeActive(false);
    }
    setHomeThemeVariant(variant);
    const name = getVariantDisplayName(variant, isEn);
    showGlobalAppToast(
      isEn ? `Propagated globally: ${name}` : `تم تعميم ${name} على التطبيق بالكامل`
    );
    setInsights(getSmartLearnedInsights(isEn));
  };

  const handleDeletePattern = (patternKey: string) => {
    deleteSmartPatternByKey(patternKey);
    setInsights(getSmartLearnedInsights(isEn));
    showGlobalAppToast(isEn ? 'Pattern removed' : 'تم حذف النمط المحفوظ');
  };

  const handleResetAllMemory = () => {
    resetSmartEngineMemory();
    setConfirmReset(false);
    setInsights(getSmartLearnedInsights(isEn));
    showGlobalAppToast(
      isEn ? 'Smart Engine memory cleared' : 'تم مسح ذاكرة المحرك الذكي بنجاح'
    );
  };

  const subFeatures: {
    key: keyof Omit<SmartEngineSettings, 'enabled'>;
    titleAr: string;
    titleEn: string;
    descAr: string;
    descEn: string;
  }[] = [
    {
      key: 'autoColorSync',
      titleAr: 'تعميم الألوان الذكي',
      titleEn: 'Smart Color Propagation',
      descAr: 'يستشعر لونك أو طابعك المفضل ويعممه على التطبيق',
      descEn: 'Senses preferred colors and syncs the app theme automatically',
    },
    {
      key: 'smartQuranContext',
      titleAr: 'السور المعتادة والعودة للختمة',
      titleEn: 'Contextual Surah & Khatma Return',
      descAr: 'يفتح السورة المعتادة في وقتها ثم يعيدك لآخر آية بختمتك',
      descEn: 'Opens recurring surahs on time and restores your Khatma later',
    },
    {
      key: 'smartAdiaOpening',
      titleAr: 'فتح الأدعية على المفضل',
      titleEn: 'Smart Supplications Opening',
      descAr: 'يبدأ صفحة الأدعية بأكثر الأدعية والأقسام محبة لك',
      descEn: 'Opens Supplications directly on your favorite & frequent duas',
    },
    {
      key: 'smartNotifications',
      titleAr: 'إشعارات حسب اهتماماتك',
      titleEn: 'Interest-Based Notifications',
      descAr: 'يخصّص التنبيهات والتذكيرات وفق اهتماماتك الأكثر حضوراً',
      descEn: 'Tailors reminders and highlights around your top interests',
    },
  ];

  const renderSwitch = (checked: boolean) => (
    <div
      aria-hidden="true"
      className={`app-3d-switch-track relative w-13 h-7 rounded-full transition-colors duration-200 ease-in-out shrink-0 p-0.5 pointer-events-none ${
        !checked ? (isNightMode ? 'bg-zinc-700' : 'bg-slate-300') : ''
      }`}
      style={{
        backgroundColor: checked ? themeAccentColor : undefined,
      }}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`app-3d-switch-thumb w-6 h-6 rounded-full bg-white transform ${
          checked ? (isEn ? 'translate-x-6' : '-translate-x-6') : 'translate-x-0'
        }`}
      />
    </div>
  );

  return (
    <>
      <div className="p-4 sm:p-5 rounded-3xl transition-all white-3d-container-card space-y-3">
        <div className={isExpanded ? 'space-y-2' : ''}>
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
            className="w-full flex items-center justify-between gap-2 text-start cursor-pointer transition-opacity active:opacity-80"
          >
            <h3
              className="text-sm sm:text-base font-black tracking-wide flex items-center gap-2 min-w-0"
              style={{ color: themeAccentColor }}
            >
              <Brain className="w-4 h-4 shrink-0" />
              <span className="truncate">{isEn ? 'Smart Adaptive Engine' : 'المحرك الذكي للتطبيق'}</span>
            </h3>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded-lg"
                style={{
                  backgroundColor: settings.enabled
                    ? isBlackTheme
                      ? 'rgba(245, 158, 11, 0.16)'
                      : `${themeAccentColor}18`
                    : isBlackTheme
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(0,0,0,0.06)',
                  color: settings.enabled ? themeAccentColor : undefined,
                }}
              >
                {settings.enabled ? (isEn ? 'Active' : 'مفعّل') : isEn ? 'Off' : 'معطّل'}
              </span>
              {isEn ? (
                <ChevronRight
                  className={`w-4 h-4 shrink-0 opacity-60 transition-transform duration-200 ${
                    isExpanded ? 'rotate-90' : ''
                  }`}
                />
              ) : (
                <ChevronLeft
                  className={`w-4 h-4 shrink-0 opacity-60 transition-transform duration-200 ${
                    isExpanded ? '-rotate-90' : ''
                  }`}
                />
              )}
            </div>
          </button>
          {isExpanded && <div className="app-3d-divider" />}
        </div>

        {isExpanded && (
        <div className="space-y-2.5 pt-1">
          {/* Master Enable/Disable Toggle */}
          <button
            type="button"
            onClick={handleToggleMaster}
            role="switch"
            aria-checked={settings.enabled}
            title={settings.enabled ? (isEn ? 'Disable' : 'تعطيل') : (isEn ? 'Enable' : 'تفعيل')}
            className="w-full text-start p-3.5 sm:p-4 rounded-2xl transition-all active:scale-[0.98] cursor-pointer flex items-center justify-between gap-4 white-3d-card-btn shadow-xs border-0"
          >
            <div className="min-w-0 flex-1">
              <h4 className="text-base sm:text-lg font-black truncate">
                {isEn ? 'Enable Smart Engine' : 'تفعيل المحرك الذكي'}
              </h4>
              <p className="text-xs opacity-70 mt-0.5 leading-snug">
                {isEn
                  ? 'Adapts colors, Quran surahs, supplications & alerts locally to your habits'
                  : 'يتكيّف محلياً مع ألوانك، سورك المعتادة، أدعيتك واهتماماتك'}
              </p>
            </div>
            {renderSwitch(settings.enabled)}
          </button>

          {/* Sub-Feature Toggles & Insights Button */}
          {settings.enabled && (
            <div className="space-y-2 pt-1">
              {subFeatures.map((feat) => {
                const isChecked = settings[feat.key];
                return (
                  <button
                    key={feat.key}
                    type="button"
                    onClick={() => handleToggleSubFeature(feat.key, feat.titleAr, feat.titleEn)}
                    role="switch"
                    aria-checked={isChecked}
                    className="w-full text-start p-3 sm:p-3.5 rounded-2xl transition-all active:scale-[0.98] cursor-pointer flex items-center justify-between gap-3 white-3d-card-btn shadow-xs border-0"
                  >
                    <div className="min-w-0 flex-1">
                      <h5 className="text-sm sm:text-base font-extrabold truncate">
                        {isEn ? feat.titleEn : feat.titleAr}
                      </h5>
                      <p className="text-[11px] sm:text-xs opacity-65 mt-0.5 leading-snug">
                        {isEn ? feat.descEn : feat.descAr}
                      </p>
                    </div>
                    {renderSwitch(isChecked)}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setShowInsightsModal(true)}
                className="w-full text-start p-3.5 sm:p-4 rounded-2xl transition-all active:scale-[0.98] cursor-pointer flex items-center justify-between gap-3 white-3d-card-btn shadow-xs border-0"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Sparkles className="w-4 h-4 shrink-0" style={{ color: themeAccentColor }} />
                  <span className="text-sm sm:text-base font-black truncate">
                    {isEn ? 'Learned Habits & Smart Memory' : 'استعراض ما تعلّمه المحرك وتخصيصه'}
                  </span>
                </div>
                {isEn ? (
                  <ChevronRight className="w-4 h-4 shrink-0 opacity-60" />
                ) : (
                  <ChevronLeft className="w-4 h-4 shrink-0 opacity-60" />
                )}
              </button>
            </div>
          )}
        </div>
        )}
      </div>

      {/* Full-Screen Child Modal: Smart Engine Memory & Insights */}
      {showInsightsModal && (
        <div
          className="fixed inset-0 z-[9999999] flex flex-col font-cairo select-none overflow-hidden animate-fadeIn"
          style={{ backgroundColor: pageBgColor }}
          dir={isEn ? 'ltr' : 'rtl'}
        >
          <header className="app-top-bar settings-top-bar shrink-0" dir={isEn ? 'ltr' : 'rtl'}>
            <div className="app-top-bar__inner">
              <div className="relative flex items-center justify-center w-full min-h-[44px]">
                <div className={`absolute ${isEn ? 'left-0' : 'right-0'} flex items-center`}>
                  <button
                    type="button"
                    onClick={() => setShowInsightsModal(false)}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                    title={isEn ? 'Go Back' : 'رجوع للخلف'}
                    aria-label={isEn ? 'Go Back' : 'رجوع للخلف'}
                  >
                    <i className={`fa-solid ${isEn ? 'fa-arrow-left' : 'fa-arrow-right'} text-xl`}></i>
                  </button>
                </div>

                <div className="text-center px-12 min-w-0">
                  <h1 className="app-top-bar__title text-lg sm:text-xl font-cairo truncate">
                    {isEn ? 'Smart Engine Memory' : 'ذاكرة المحرك الذكي'}
                  </h1>
                </div>

                <div className={`absolute ${isEn ? 'right-0' : 'left-0'} flex items-center gap-1`}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowInsightsModal(false);
                      onHomeClose();
                    }}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                    title={isEn ? 'Home' : 'الصفحة الرئيسية'}
                    aria-label={isEn ? 'Home' : 'الصفحة الرئيسية'}
                  >
                    <i className="fa-solid fa-house text-xl"></i>
                  </button>
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 pt-4 pb-24 space-y-4 no-scrollbar max-w-2xl mx-auto w-full app-scroll-safe">
            {/* Instant Color Propagation Picker */}
            <div className="p-4 sm:p-5 rounded-3xl white-3d-container-card space-y-3">
              <div className="space-y-1.5">
                <h3
                  className="text-sm sm:text-base font-black"
                  style={{ color: themeAccentColor }}
                >
                  {isEn ? 'Instant Color Propagation' : 'تعميم لون موحد للتطبيق'}
                </h3>
                <p className="text-xs opacity-70">
                  {isEn
                    ? 'Tap any color to apply and unify it across the entire app immediately.'
                    : 'اختر أي لون لتعميمه فوراً على الواجهة الرئيسية وصفحات التطبيق والمصحف.'}
                </p>
                <div className="app-3d-divider" />
              </div>

              <div className="grid grid-cols-4 gap-2.5 pt-1">
                {SMART_COLOR_SWATCHES.map((sw) => {
                  const isActive = !isNightMode && homeThemeVariant === sw.variant;
                  return (
                    <button
                      key={sw.variant}
                      type="button"
                      onClick={() => handlePropagateColorSwatch(sw.variant)}
                      className="p-2.5 rounded-2xl white-3d-card-btn flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border-0"
                    >
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center shadow-md border-2 border-white/80"
                        style={{ backgroundColor: sw.hex }}
                      >
                        {isActive && <Check className="w-4 h-4 text-white stroke-[3]" />}
                      </span>
                      <span className="text-xs font-black truncate">
                        {isEn ? sw.labelEn : sw.labelAr}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Discovered Habits & Learned Insights */}
            <div className="p-4 sm:p-5 rounded-3xl white-3d-container-card space-y-3">
              <div className="space-y-1.5">
                <h3
                  className="text-sm sm:text-base font-black"
                  style={{ color: themeAccentColor }}
                >
                  {isEn ? 'What the Smart Engine Learned' : 'ما تعلّمه المحرك من استخدامك'}
                </h3>
                <div className="app-3d-divider" />
              </div>

              {insights.length === 0 ? (
                <div className="py-6 text-center space-y-2 opacity-75">
                  <Brain className="w-9 h-9 mx-auto opacity-50" />
                  <p className="text-sm font-bold">
                    {isEn
                      ? 'No recurring habits detected yet.'
                      : 'لم يكتشف المحرك عادات متكررة بعد.'}
                  </p>
                  <p className="text-xs px-4">
                    {isEn
                      ? 'Keep reading Quran, supplications, and using your preferred themes — patterns appear automatically here.'
                      : 'مع قراءتك للقرآن وتكرار السور والأدعية واختيار الألوان ستظهر أنماطك الذكية هنا تلقائياً.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {insights.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl white-3d-card-btn flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                          style={{
                            backgroundColor: isBlackTheme
                              ? 'rgba(245, 158, 11, 0.16)'
                              : `${themeAccentColor}18`,
                            color: themeAccentColor,
                          }}
                        >
                          <i className={`fa-solid ${item.icon} text-sm`}></i>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm sm:text-base font-black leading-snug">
                            {isEn ? item.titleEn : item.titleAr}
                          </h4>
                          <p className="text-xs opacity-75 mt-1 leading-relaxed">
                            {isEn ? item.detailEn : item.detailAr}
                          </p>
                        </div>
                      </div>

                      {item.deletablePatternKey && (
                        <button
                          type="button"
                          onClick={() => handleDeletePattern(item.deletablePatternKey!)}
                          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-rose-500 hover:bg-rose-500/10 active:scale-90 transition-all cursor-pointer"
                          title={isEn ? 'Remove pattern' : 'حذف النمط'}
                          aria-label={isEn ? 'Remove pattern' : 'حذف النمط'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reset Memory Section (2-Step Inline Confirmation) */}
            <div className="p-4 sm:p-5 rounded-3xl white-3d-container-card space-y-3">
              {!confirmReset ? (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="w-full p-3.5 rounded-2xl white-3d-card-btn flex items-center justify-center gap-2 text-rose-600 dark:text-rose-400 font-black text-sm sm:text-base active:scale-[0.98] transition-all cursor-pointer border-0"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{isEn ? 'Reset Smart Engine Memory' : 'مسح ذاكرة المحرك الذكي'}</span>
                </button>
              ) : (
                <div className="space-y-2.5 text-center">
                  <p className="text-xs sm:text-sm font-bold">
                    {isEn
                      ? 'Clear all learned surahs, supplication preferences, and color history?'
                      : 'هل تريد مسح جميع السور المعتادة وتفضيلات الأدعية والألوان المتعلّمة؟'}
                  </p>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleResetAllMemory}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 text-white font-black text-xs sm:text-sm active:scale-95 transition-all cursor-pointer"
                    >
                      {isEn ? 'Confirm Reset' : 'تأكيد المسح'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmReset(false)}
                      className="flex-1 py-2.5 px-4 rounded-xl white-3d-card-btn font-bold text-xs sm:text-sm active:scale-95 transition-all cursor-pointer border-0"
                    >
                      {isEn ? 'Cancel' : 'إلغاء'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SmartEngineSettingsSection;
