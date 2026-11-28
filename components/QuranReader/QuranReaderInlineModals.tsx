import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, X, ZoomIn } from 'lucide-react';
import {
    DEFAULT_SETTINGS,
    SURAH_NAMES_AR,
    THEMES,
    getLinkedQuranThemeForHomeVariant,
    getToolbarColorsForTheme,
    isDarkQuranTheme
} from './constants';
import { resolveQuranModalPalette } from './modalThemeUtils';
import { useLanguage } from '../../context/LanguageContext';
import { registerBackInterceptor } from '../../hooks/useBackButton';
import { getWirdDayRange } from '../../services/dailyWirdNotificationService';

export const isHexLightForMadinahGuard = (color?: string): boolean => {
    if (!color || typeof color !== 'string') return false;
    const c = color.trim().toLowerCase();
    if (c === 'transparent' || c === 'rgba(0, 0, 0, 0)') return false;
    const hex = c.startsWith('#') ? c.slice(1) : '';
    if (!hex) return false;
    let r = 0, g = 0, b = 0;
    if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
    } else {
        return false;
    }
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return false;
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 >= 0.45;
};

export const resolveReaderSettingsWithTheme = (
    baseSettings: any,
    themeObj: any,
    modeKey: string = 'mushaf',
    isLandscapeFlag: boolean = false
) => {
    const merged = { ...DEFAULT_SETTINGS, ...(baseSettings || {}) };
    if (isDarkQuranTheme(themeObj)) {
        const orient = isLandscapeFlag ? 'h' : 'v';
        let hasCustomNightColors = false;
        const customKey = `quran_settings_${modeKey}_night_colors_custom_${orient}`;
        try {
            const scopedFlag = localStorage.getItem(customKey);
            hasCustomNightColors = scopedFlag !== null
                ? scopedFlag === 'true'
                : (modeKey === 'madinah' && !isLandscapeFlag && localStorage.getItem('quran_settings_madinah_night_colors_custom') === 'true');
        } catch {}
        if (
            !hasCustomNightColors ||
            isHexLightForMadinahGuard(merged.bgColor) ||
            !isHexLightForMadinahGuard(merged.textColor)
        ) {
            merged.bgColor = themeObj?.bg || '#000000';
            merged.textColor = themeObj?.text || '#ffffff';
            merged.theme = themeObj?.id || 'deep_black';
            if (!merged.lockHighlightColor) {
                merged.highlightTextColor = themeObj?.highlightText || themeObj?.accent || '#f59e0b';
            }
        }
    }
    return merged;
};

export const parseArabicNumber = (text: string): number | null => {
    const arabicDigits = text.match(/[٠-٩]+/g);
    if (arabicDigits) {
        const standard = arabicDigits[0].replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
        return parseInt(standard);
    }
    const englishDigits = text.match(/\d+/g);
    if (englishDigits) return parseInt(englishDigits[0]);
    
    const words: Record<string, number> = {
        'واحد': 1, 'اثنين': 2, 'ثلاثة': 3, 'اربعة': 4, 'خمسة': 5, 'ستة': 6, 'سبعة': 7, 'ثمانية': 8, 'تسعة': 9, 'عشرة': 10,
        'عشرين': 20, 'ثلاثين': 30, 'اربعين': 40, 'خمسين': 50, 'ستين': 60, 'سبعين': 70, 'ثمانين': 80, 'تسعين': 90, 'مئة': 100, 'مائة': 100
    };
    
    for (const [word, val] of Object.entries(words)) {
        if (text.includes(word)) return val;
    }
    return null;
};

export const extractModalAccentColor = (val?: string, fallback = '#3b82f6'): string => {
    if (!val) return fallback;
    if (val.includes('#')) {
        const match = val.match(/#[0-9a-fA-F]{3,8}/);
        if (match) return match[0];
    }
    return val;
};

export const AyahActionMenu = React.memo(({ 
    isOpen, 
    onClose, 
    onTafseer, 
    onTafseerPage,
    onMeanings, 
    onMeaningsPage,
    onTranslation, 
    onTranslationSurah,
    onAsbabNuzul,
    onIrab,
    onMutashabihat,
    onWaqf,
    onShareCard,
    currentTheme, 
    isLandscape 
}: any) => {
    const { language, dir } = useLanguage();
    const isEn = language === 'en';
    const [subMenuMode, setSubMenuMode] = useState<'tafseer' | 'meanings' | 'translation' | null>(null);
    const subMenuModeRef = useRef(subMenuMode);
    subMenuModeRef.current = subMenuMode;
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;
    const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

    useEffect(() => {
        if (!isOpen) {
            setSubMenuMode(null);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const interceptor = () => {
            if (subMenuModeRef.current) {
                setSubMenuMode(null);
                return true;
            }
            onCloseRef.current?.();
            return true;
        };
        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [isOpen]);

    useEffect(() => {
        if (!subMenuMode) return;
        const timer = window.setTimeout(() => {
            itemRefs.current[subMenuMode]?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        }, 160);
        return () => window.clearTimeout(timer);
    }, [subMenuMode]);

    if (!isOpen) return null;

    const p = resolveQuranModalPalette(currentTheme);

    const options: Array<{
        id: string;
        label: string;
        icon: string;
        subMode?: 'tafseer' | 'meanings' | 'translation';
        onClick: () => void;
    }> = [
        {
            id: 'tafseer',
            label: isEn ? "Quran Tafseer" : "تفسير القرآن",
            icon: "fa-book-open",
            subMode: 'tafseer',
            onClick: () => setSubMenuMode((prev) => (prev === 'tafseer' ? null : 'tafseer')),
        },
        {
            id: 'meanings',
            label: isEn ? "Quran Meanings" : "معاني القرآن",
            icon: "fa-language",
            subMode: 'meanings',
            onClick: () => setSubMenuMode((prev) => (prev === 'meanings' ? null : 'meanings')),
        },
        { id: 'waqf', label: isEn ? "Waqf Signs" : "علامات الوقف في الآية", icon: "fa-compass", onClick: onWaqf },
        { id: 'mutashabihat', label: isEn ? "Mutashabihat" : "المتشابهات اللفظية", icon: "fa-code-compare", onClick: onMutashabihat },
        { id: 'asbab', label: isEn ? "Asbab Al-Nuzul" : "أسباب النزول والقصص", icon: "fa-scroll", onClick: onAsbabNuzul },
        { id: 'irab', label: isEn ? "Syntax & I'rab" : "إعراب الآية وبيانها", icon: "fa-layer-group", onClick: onIrab },
        { id: 'share-card', label: isEn ? "Share Ayah" : "مشاركة الآية", icon: "fa-palette", onClick: onShareCard },
        {
            id: 'translation',
            label: isEn ? "Quran Translation" : "ترجمة القرآن",
            icon: "fa-globe",
            subMode: 'translation',
            onClick: () => setSubMenuMode((prev) => (prev === 'translation' ? null : 'translation')),
        },
    ];

    const subItemsByMode = {
        tafseer: [
            {
                id: 'ayah-tafseer',
                label: isEn ? 'Ayah Tafseer' : 'تفسير آية',
                icon: <ZoomIn size={isLandscape ? 14 : 17} style={{ color: p.headerAccent }} />,
                onClick: () => {
                    setSubMenuMode(null);
                    onTafseer?.();
                },
            },
            {
                id: 'surah-tafseer',
                label: isEn ? 'Surah Tafseer' : 'تفسير سورة',
                icon: <BookOpen size={isLandscape ? 14 : 17} style={{ color: p.headerAccent }} />,
                onClick: () => {
                    setSubMenuMode(null);
                    onTafseerPage?.();
                },
            },
        ],
        meanings: [
            {
                id: 'ayah-meanings',
                label: isEn ? 'Ayah Meanings' : 'معاني آية',
                icon: <ZoomIn size={isLandscape ? 14 : 17} style={{ color: p.headerAccent }} />,
                onClick: () => {
                    setSubMenuMode(null);
                    onMeanings?.();
                },
            },
            {
                id: 'surah-meanings',
                label: isEn ? 'Surah Meanings' : 'معاني سورة',
                icon: <BookOpen size={isLandscape ? 14 : 17} style={{ color: p.headerAccent }} />,
                onClick: () => {
                    setSubMenuMode(null);
                    onMeaningsPage?.();
                },
            },
        ],
        translation: [
            {
                id: 'ayah-translation',
                label: isEn ? 'Ayah Translation' : 'ترجمة آية',
                icon: <ZoomIn size={isLandscape ? 14 : 17} style={{ color: p.headerAccent }} />,
                onClick: () => {
                    setSubMenuMode(null);
                    onTranslation?.();
                },
            },
            {
                id: 'surah-translation',
                label: isEn ? 'Surah Translation' : 'ترجمة سورة',
                icon: <BookOpen size={isLandscape ? 14 : 17} style={{ color: p.headerAccent }} />,
                onClick: () => {
                    setSubMenuMode(null);
                    onTranslationSurah?.();
                },
            },
        ],
    };

    return (
        <div className={`fixed inset-0 z-[1200] bg-black/55 flex items-center justify-center ${isLandscape ? 'p-2' : 'p-4'}`} onClick={onClose}>
            <div 
                dir={dir} 
                className={`modal-skinned madinah-enlarged-popup ayah-options-modal-popup settings-3d-adia-scope ${p.isDark ? 'settings-3d-dark quran-3d-dark' : ''} ${isLandscape ? 'w-[62%] max-w-[430px] max-h-[108%] rounded-3xl' : 'w-full max-w-[310px] rounded-3xl max-h-[118dvh]'} flex flex-col overflow-hidden border-0`} 
                style={{ 
                    fontFamily: p.fontFamily,
                    backgroundColor: p.modalBg, 
                    color: p.modalText, 
                    border: 'none', 
                    outline: 'none' 
                }} 
                onClick={e => e.stopPropagation()}
            >
                {/* Canonical Raised Header */}
                <div className={isLandscape ? "p-2.5 pb-1.5 shrink-0" : "p-3.5 pb-2 shrink-0"}>
                    <div 
                        className={`${isLandscape ? 'py-1.5 px-3 rounded-xl' : 'py-2.5 px-3.5 rounded-2xl'} flex items-center justify-between quran-raised-card border-0`}
                        style={{
                            backgroundColor: p.headerBg,
                        }}
                    >
                        <span className={`${isLandscape ? 'text-xs' : 'text-xs sm:text-sm'} font-black tracking-wide`} style={{ color: p.headerAccent }}>
                            {isEn ? "Verse Options & Sciences" : "خيارات وتدبر الآية"}
                        </span>
                        <button 
                            type="button"
                            onClick={onClose} 
                            className={`${isLandscape ? 'w-7 h-7' : 'w-8 h-8'} quran-raised-btn rounded-full flex items-center justify-center border-0 cursor-pointer`}
                            style={{ backgroundColor: p.closeBg, color: p.headerAccent }}
                            aria-label={isEn ? "Close" : "إغلاق"}
                        >
                            <X size={isLandscape ? 14 : 16} />
                        </button>
                    </div>
                </div>

                {/* Options: compact 2-column grid in landscape, clean vertical list in portrait */}
                <div className={isLandscape ? "p-2.5 pt-1.5 pb-3 grid grid-cols-2 gap-2 overflow-y-auto flex-1 min-h-0 custom-scrollbar items-start" : "p-3.5 pt-2 pb-4 gap-3 overflow-y-auto flex-1 min-h-0 flex flex-col custom-scrollbar"}>
                    {options.map((item) => {
                        const subItems = item.subMode ? subItemsByMode[item.subMode] : null;
                        const isExpanded = Boolean(item.subMode && subMenuMode === item.subMode);

                        return (
                            <div
                                key={item.id}
                                ref={(el) => {
                                    if (item.subMode) itemRefs.current[item.subMode] = el;
                                }}
                                className="flex flex-col"
                            >
                                <button 
                                    type="button"
                                    onClick={item.onClick} 
                                    aria-expanded={item.subMode ? isExpanded : undefined}
                                    className={`w-full ${isLandscape ? 'min-h-[42px] py-2 px-2.5 text-[11.5px] leading-snug rounded-xl gap-2' : 'py-3 px-4 text-base rounded-2xl justify-between gap-3'} font-bold flex items-center cursor-pointer border-0 quran-raised-btn`}
                                    style={{ 
                                        backgroundColor: p.cardBg, 
                                        color: p.cardText 
                                    }}
                                >
                                    {isLandscape ? (
                                        <>
                                            <span 
                                                className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                                                style={{ backgroundColor: p.isDark ? 'rgba(255,255,255,0.08)' : `${p.headerAccent}16`, color: p.headerAccent }}
                                            >
                                                <i className={`fa-solid ${item.icon} text-xs`}></i>
                                            </span>
                                            <span className="font-bold leading-snug text-start flex-1 min-w-0" style={{ color: p.cardText }}>
                                                {item.label}
                                            </span>
                                            {item.subMode && (
                                                <i
                                                    className={`fa-solid ${isEn ? 'fa-chevron-right' : 'fa-chevron-left'} text-[10px] shrink-0 opacity-45 transition-transform duration-200`}
                                                    style={{
                                                        color: p.cardText,
                                                        transform: isExpanded ? (isEn ? 'rotate(90deg)' : 'rotate(-90deg)') : 'none',
                                                    }}
                                                ></i>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <i className={`fa-solid ${item.icon} text-base shrink-0`} style={{ color: p.headerAccent }}></i>
                                                <span className="font-bold truncate text-start" style={{ color: p.cardText }}>
                                                    {item.label}
                                                </span>
                                            </div>
                                            {item.subMode && (
                                                <i
                                                    className={`fa-solid ${isEn ? 'fa-chevron-right' : 'fa-chevron-left'} text-xs shrink-0 opacity-40 transition-transform duration-200`}
                                                    style={{
                                                        color: p.cardText,
                                                        transform: isExpanded ? (isEn ? 'rotate(90deg)' : 'rotate(-90deg)') : 'none',
                                                    }}
                                                ></i>
                                            )}
                                        </>
                                    )}
                                </button>

                                {subItems && (
                                    <div
                                        className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
                                            isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                        }`}
                                        style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
                                        aria-hidden={!isExpanded}
                                    >
                                        <div className="overflow-hidden">
                                            <div
                                                className={`${isLandscape ? 'pt-1.5 pb-1 px-0.5 gap-1.5' : 'pt-2 pb-1 px-1 ps-3 gap-2'} flex flex-col`}
                                                style={
                                                    !isLandscape
                                                        ? {
                                                              borderInlineStart: `2px solid ${p.headerAccent}35`,
                                                              marginInlineStart: '0.5rem',
                                                          }
                                                        : undefined
                                                }
                                            >
                                                {subItems.map((sub) => (
                                                    <button
                                                        key={sub.id}
                                                        type="button"
                                                        onClick={sub.onClick}
                                                        tabIndex={isExpanded ? 0 : -1}
                                                        className={`w-full ${isLandscape ? 'py-2 px-2.5 text-[11.5px] rounded-xl gap-2' : 'py-2.5 px-3.5 text-sm sm:text-[15px] rounded-2xl gap-2.5'} font-bold flex items-center justify-between cursor-pointer border-0 quran-raised-btn`}
                                                        style={{
                                                            backgroundColor: p.cardBg,
                                                            color: p.cardText,
                                                        }}
                                                    >
                                                        <div className={`flex items-center ${isLandscape ? 'gap-2' : 'gap-2.5'} flex-1 min-w-0`}>
                                                            <span
                                                                className={`${isLandscape ? 'w-6 h-6 rounded-lg' : 'w-7 h-7 rounded-xl'} flex items-center justify-center shrink-0`}
                                                                style={{
                                                                    backgroundColor: p.isDark ? 'rgba(255,255,255,0.08)' : `${p.headerAccent}16`,
                                                                }}
                                                            >
                                                                {sub.icon}
                                                            </span>
                                                            <span className="font-bold truncate text-start" style={{ color: p.cardText }}>
                                                                {sub.label}
                                                            </span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
});

export const getDayRange = (day: number, settings: any) => {
    if (!settings) return { start: 1, end: 21 };
    return getWirdDayRange(day, settings);
};

export const WirdCompletionModal = ({ isOpen, onClose, onContinue, onGoToWird, onGoHome, currentTheme, isLandscape, isEn }: any) => {
    if (!isOpen) return null;
    return (
        <div className={`fixed inset-0 z-[1100] bg-black/55 flex items-center justify-center ${isLandscape ? 'p-2' : 'p-4'}`}>
            <div className={`modal-skinned font-cairo ${isLandscape ? 'w-[56%] max-w-[360px] max-h-[85%] rounded-3xl overflow-y-auto p-4' : 'w-full max-w-[320px] max-h-[90dvh] overflow-y-auto rounded-3xl p-6'} flex flex-col text-center border-0`} 
                 style={{ 
                     fontFamily: "'Cairo', sans-serif",
                     backgroundColor: currentTheme?.modalBg,
                     color: currentTheme?.modalText,
                     border: 'none',
                     outline: 'none'
                 }}>
                <div className={`${isLandscape ? 'w-11 h-11 mb-2.5' : 'w-16 h-16 mb-4'} rounded-full flex items-center justify-center mx-auto quran-raised-card`}
                     style={{ backgroundColor: currentTheme?.id === 'deep_black' ? 'rgba(255,255,255,0.12)' : `${currentTheme?.accent}20`, color: currentTheme?.id === 'deep_black' ? '#ffffff' : currentTheme?.accent }}>
                    <i className={`fa-solid fa-check-double ${isLandscape ? 'text-xl' : 'text-3xl'} quran-3d-icon`}></i>
                </div>
                <h2 className={`${isLandscape ? 'text-base mb-1.5' : 'text-xl mb-3'} font-bold font-cairo`} style={{ color: currentTheme?.id === 'deep_black' ? '#ffffff' : currentTheme?.accent, fontFamily: "'Cairo', sans-serif" }}>
                    {isEn ? "May Allah Accept Your Worship!" : "تقبل الله طاعتك!"}
                </h2>
                <p className={`opacity-80 ${isLandscape ? 'mb-3.5 text-xs' : 'mb-6 text-sm'} leading-relaxed`}>
                    {isEn 
                        ? "You have completed your assigned daily portion. You may pause now or continue reading as you like." 
                        : "لقد وصلت إلى نهاية وردك اليومي المحدد. يمكنك التوقف عن القراءة الآن أو الاستمرار كما تحب."}
                </p>
                <div className={`flex flex-col ${isLandscape ? 'gap-2' : 'gap-3'}`}>
                    <button 
                        onClick={onContinue}
                        className={`w-full ${isLandscape ? 'py-2.5 text-xs rounded-xl' : 'py-3.5 text-sm rounded-2xl'} font-bold transition-opacity active:opacity-80 flex items-center justify-center border-0 quran-raised-btn-selected cursor-pointer`}
                        style={{ backgroundColor: currentTheme?.accent, color: currentTheme?.accentText }}
                    >
                        <span>{isEn ? "Continue Reading" : "استمرار القراءة"}</span>
                    </button>
                    <button 
                        onClick={onGoToWird}
                        className={`w-full ${isLandscape ? 'py-2.5 text-xs rounded-xl' : 'py-3.5 text-sm rounded-2xl'} font-bold transition-opacity active:opacity-80 flex items-center justify-center border-0 quran-raised-btn cursor-pointer`}
                        style={{ backgroundColor: currentTheme?.headerBg, color: currentTheme?.headerText }}
                    >
                        <span>{isEn ? "Return to Daily Wird Page" : "العوده لصفحة الورد اليومى"}</span>
                    </button>
                    <button 
                        onClick={onGoHome}
                        className={`w-full ${isLandscape ? 'py-2.5 text-xs rounded-xl' : 'py-3.5 text-sm rounded-2xl'} font-bold transition-opacity active:opacity-80 flex items-center justify-center border-0 quran-raised-btn cursor-pointer`}
                        style={currentTheme?.bg === '#000000' ? {
                            backgroundColor: '#000000',
                            color: '#FFFFFF'
                        } : { backgroundColor: `${currentTheme?.barBg}80`, color: currentTheme?.barText }}
                    >
                        <span>{isEn ? "Return to Home Page" : "العوده للصفحه الرئيسيه"}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export const ResumeSessionModal = ({ isOpen, onClose, onResume, onStartNew, currentTheme, savedSession, isLandscape }: any) => {
    if (!isOpen || !savedSession) return null;
    return (
        <div className={`fixed inset-0 z-[1100] bg-black/55 flex items-center justify-center ${isLandscape ? 'p-2' : 'p-4'}`}>
            <div className={`modal-skinned ${isLandscape ? 'w-[56%] max-w-[360px] max-h-[85%] rounded-3xl overflow-y-auto p-4' : 'w-full max-w-sm max-h-[90dvh] overflow-y-auto rounded-3xl p-6'} text-center border-0`}
                 style={{ fontFamily: currentTheme?.font, border: 'none', outline: 'none' }}>
                <div className={`${isLandscape ? 'w-11 h-11 mb-2.5' : 'w-16 h-16 mb-4'} bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mx-auto quran-raised-card`}>
                    <i className={`fa-solid fa-play ${isLandscape ? 'text-xl' : 'text-3xl'} quran-3d-icon`}></i>
                </div>
                <h2 className={`${isLandscape ? 'text-base mb-1.5' : 'text-xl mb-2'} font-bold`}>جلسة سابقة متوفرة</h2>
                <p className={`opacity-70 ${isLandscape ? 'mb-3.5 text-xs' : 'mb-6 text-sm'}`}>
                    تم العثور على جلسة تحفيظ سابقة عند سورة {SURAH_NAMES_AR[savedSession.currentAyah.s - 1]} الآية {savedSession.currentAyah.a}.
                    هل تود الاستمرار من حيث توقفت أم البدء من جديد؟
                </p>
                <div className={isLandscape ? "space-y-2" : "space-y-3"}>
                    <button 
                        onClick={onResume}
                        className={`w-full ${isLandscape ? 'py-2.5 text-xs rounded-xl' : 'py-3.5 rounded-2xl'} bg-blue-600 hover:bg-blue-500 text-white font-bold border-0 quran-raised-btn-selected active:opacity-80 transition-opacity flex items-center justify-center gap-2`}
                    >
                        <i className="fa-solid fa-play quran-3d-icon"></i>
                        الاستمرار في الجلسة
                    </button>
                    <button 
                        onClick={onStartNew}
                        className={`w-full ${isLandscape ? 'py-2.5 text-xs rounded-xl' : 'py-3.5 rounded-2xl'} font-bold border-0 quran-raised-btn active:opacity-80 transition-opacity flex items-center justify-center gap-2`}
                        style={{ color: 'var(--modal-text)' }}
                    >
                        <i className="fa-solid fa-rotate-left quran-3d-icon"></i>
                        البدء من جديد
                    </button>
                </div>
            </div>
        </div>
    );
};

export const REMOVED_QURAN_THEMES = new Set([
    'brown', 'i_musk', 'red', 'olive', 'blue', 'purple', 'orange', 'amber_light', 'mint', 'pink', 'cyan', 'lime',
    'i_emerald', 'i_ruby', 'i_lapis', 'i_gold', 'i_amber', 'i_amethyst', 'i_sunset_royal', 'i_deep_ocean',
    'i_brocade', 'i_midnight', 'i_royal_gold', 'i_forest', 'i_turquoise', 'i_slate'
]);

export const sanitizeRemovedThemeInStorage = (modeSuffix: string) => {
    try {
        const savedThemeId = localStorage.getItem('current_theme_id' + modeSuffix);
        const savedSettingsStr = localStorage.getItem('quran_settings' + modeSuffix);
        const parsedSettings = savedSettingsStr ? JSON.parse(savedSettingsStr) : null;
        const settingsThemeId = parsedSettings?.theme;

        if (
            (savedThemeId && REMOVED_QURAN_THEMES.has(savedThemeId)) ||
            (settingsThemeId && REMOVED_QURAN_THEMES.has(settingsThemeId))
        ) {
            const fallbackId = getLinkedQuranThemeForHomeVariant() || 'gold';
            const fallbackTheme = THEMES[fallbackId as keyof typeof THEMES] || THEMES['gold'];
            localStorage.setItem('current_theme_id' + modeSuffix, fallbackTheme.id);
            localStorage.removeItem('toolbar_colors_v2' + modeSuffix);
            if (parsedSettings) {
                const updated = {
                    ...parsedSettings,
                    theme: fallbackTheme.id,
                    bgColor: fallbackTheme.bg,
                    textColor: fallbackTheme.text,
                    ...(parsedSettings.lockHighlightColor
                        ? {}
                        : { highlightTextColor: fallbackTheme.highlightText }),
                };
                localStorage.setItem('quran_settings' + modeSuffix, JSON.stringify(updated));
            }
        } else if (savedThemeId === 'deep_black' || settingsThemeId === 'deep_black') {
            const dbTheme = THEMES['deep_black'];
            if (parsedSettings && parsedSettings.textColor && parsedSettings.textColor.toLowerCase() === '#f59e0b') {
                const updated = {
                    ...parsedSettings,
                    bgColor: dbTheme.bg,
                    textColor: dbTheme.text,
                    ...(parsedSettings.lockHighlightColor ? {} : { highlightTextColor: dbTheme.highlightText }),
                };
                localStorage.setItem('quran_settings' + modeSuffix, JSON.stringify(updated));
            }
            const tbStr = localStorage.getItem('toolbar_colors_v2' + modeSuffix);
            if (tbStr && (tbStr.toLowerCase().includes('#f59e0b') || tbStr.toLowerCase().includes('#d97706'))) {
                localStorage.setItem('toolbar_colors_v2' + modeSuffix, JSON.stringify(getToolbarColorsForTheme(dbTheme)));
            }
        }
    } catch (e) {}
};
