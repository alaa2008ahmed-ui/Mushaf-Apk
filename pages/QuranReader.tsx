import React, { useState, useEffect, useRef, useCallback, FC } from 'react';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import './QuranReader.css'; 
import { ReadingMode, JUZ_MAP, toArabic, THEMES, TAFSEERS, READERS, MEMORIZATION_READERS, DEFAULT_SETTINGS, FONTS, SURAH_NAMES_AR } from '../components/QuranReader/constants';
import SearchModal from '../components/QuranReader/SearchModal';
import ThemesModal from '../components/QuranReader/ThemesModal';
import SettingsModal from '../components/QuranReader/SettingsModal';
import ToolbarColorPickerModal from '../components/QuranReader/ToolbarColorPickerModal';
import { QuranDownloadModal, TafsirDownloadModal } from '../components/QuranReader/DownloadModals';
import SurahJuzModal from '../components/QuranReader/SurahJuzModal';
import { KeepAwake } from '@capacitor-community/keep-awake';
import BookmarksModal from '../components/QuranReader/BookmarksModal';
import MushafPage from '../components/QuranReader/MushafPage';
import VerticalReadingView from '../components/QuranReader/VerticalReadingView';
import Toast from '../components/QuranReader/Toast';
import TafseerModal from '../components/QuranReader/TafseerModal';
import ReciterSelectModal from '../components/QuranReader/ReciterSelectModal';
import SajdahCardModal from '../components/QuranReader/SajdahCardModal';
import TafseerSelectionModal from '../components/QuranReader/TafseerSelectionModal';
import MushafSelectionModal from '../components/QuranReader/MushafSelectionModal';
import FontSelectModal from '../components/QuranReader/FontSelectModal';
import ScrollSpeedModal from '../components/QuranReader/ScrollSpeedModal';
import AutoScrollSettingsModal from '../components/QuranReader/AutoScrollSettingsModal';
import ReadingTimer from '../components/QuranReader/ReadingTimer';
import MarkerNotification from '../components/QuranReader/MarkerNotification';
import QuranHeader from '../components/QuranReader/QuranHeader';
import QuranFooter from '../components/QuranReader/QuranFooter';
import FloatingMenu from '../components/QuranReader/FloatingMenu';
import AyahContextMenu from '../components/QuranReader/AyahContextMenu';
import ShareAyahModal from '../components/QuranReader/ShareAyahModal';
import TutorialOverlay, { TutorialStep } from '../components/Tutorial/TutorialOverlay';
import { MousePointer2, Move, ZoomIn, LayoutGrid, Mic, Bookmark, Home, Share2 } from 'lucide-react';
import quranUthmaniJson from '../data/quran-uthmani.json';
import quranTajweedJson from '../data/quran-tajweed.json';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { parseVoiceCommand, normalizeArabic } from '../utils/voiceParser';

declare var window: any;

const parseArabicNumber = (text: string): number | null => {
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

const AyahActionMenu = ({ isOpen, onClose, onTafseer, onMeanings, currentTheme }: any) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[200] bg-black/30 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
            <div className="modal-skinned w-full max-w-sm rounded-2xl shadow-2xl flex flex-col animate-modal-enter" onClick={e => e.stopPropagation()}>
                <div className="p-4 flex justify-between items-center h-14 flex-none theme-header-bg rounded-t-2xl">
                    <h2 className="text-xl font-bold">خيارات الآية</h2>
                    <button onClick={onClose} className="hover:opacity-80 rounded-full bg-white/20 w-9 h-9 flex items-center justify-center text-lg">✕</button>
                </div>
                <div className="p-5 flex flex-col gap-4">
                    <button onClick={onTafseer} style={{ backgroundColor: currentTheme?.accent || '#4f46e5', color: currentTheme?.accentText || '#ffffff' }} className="w-full py-3 px-4 rounded-xl font-bold text-lg transition-transform hover:scale-105 shadow-md flex items-center justify-center gap-2">
                        <i className="fa-solid fa-book-open"></i>
                        التفسير
                    </button>
                    <button onClick={onMeanings} style={{ backgroundColor: currentTheme?.highlightText || currentTheme?.accent || '#0d9488', color: currentTheme?.accentText || '#ffffff' }} className="w-full py-3 px-4 rounded-xl font-bold text-lg transition-transform hover:scale-105 shadow-md flex items-center justify-center gap-2">
                        <i className="fa-solid fa-language"></i>
                        معاني القرآن
                    </button>
                </div>
            </div>
        </div>
    );
};

const WirdCompletionModal = ({ isOpen, onClose, onGoToWird, onGoHome, currentTheme, onMarkCompleted }: any) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[300] bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
            <div className="modal-skinned w-full max-w-sm rounded-3xl shadow-2xl flex flex-col animate-modal-enter p-8 text-center" 
                 style={{ 
                     backgroundColor: 'var(--modal-bg)', 
                     color: 'var(--modal-text)', 
                     border: `2px solid var(--color-primary)`,
                     fontFamily: currentTheme?.font
                 }}>
                <div className="w-24 h-24 bg-green-500/20 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                    <i className="fa-solid fa-check-double text-5xl"></i>
                </div>
                <h2 className="text-3xl font-bold mb-6 font-kufi">تقبل الله طاعتك!</h2>
                <p className="opacity-80 mb-10 text-xl leading-relaxed">لقد وصلت إلى نهاية وردك اليومي المحدد. يمكنك التوقف عن القراءة الآن أو الاستمرار كما تحب.</p>
                <div className="flex flex-col gap-4">
                    <button 
                        onClick={onMarkCompleted}
                        className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-xl transition-transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
                    >
                        <i className="fa-solid fa-check-circle"></i>
                        تمت القراءة (حفظ الورد)
                    </button>
                    <button 
                        onClick={onGoToWird}
                        className="w-full py-5 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-bold text-xl transition-transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
                    >
                        <i className="fa-solid fa-calendar-check"></i>
                        العودة لصفحة الورد
                    </button>
                    <button 
                        onClick={onGoHome}
                        className="w-full py-5 bg-gray-500/10 hover:bg-gray-500/20 rounded-2xl font-bold text-xl transition-transform hover:scale-105 flex items-center justify-center gap-3"
                        style={{ color: 'var(--modal-text)' }}
                    >
                        <i className="fa-solid fa-house"></i>
                        الرئيسية
                    </button>
                    <button 
                        onClick={onClose}
                        className="w-full py-4 opacity-70 hover:opacity-100 font-bold text-lg"
                    >
                        إغلاق والاستمرار في القراءة
                    </button>
                </div>
            </div>
        </div>
    );
};

const ResumeSessionModal = ({ isOpen, onClose, onResume, onStartNew, currentTheme, savedSession }: any) => {
    if (!isOpen || !savedSession) return null;
    return (
        <div className="fixed inset-0 z-[400] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="modal-skinned w-full max-w-sm rounded-3xl shadow-2xl p-6 text-center animate-modal-enter"
                 style={{ backgroundColor: 'var(--modal-bg)', color: 'var(--modal-text)', border: `2px solid var(--color-primary)`, fontFamily: currentTheme?.font }}>
                <div className="w-16 h-16 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fa-solid fa-play text-3xl"></i>
                </div>
                <h2 className="text-xl font-bold mb-2">جلسة سابقة متوفرة</h2>
                <p className="opacity-70 mb-6 text-sm">
                    تم العثور على جلسة تحفيظ سابقة عند سورة {SURAH_NAMES_AR[savedSession.currentAyah.s - 1]} الآية {savedSession.currentAyah.a}.
                    هل تود الاستمرار من حيث توقفت أم البدء من جديد؟
                </p>
                <div className="space-y-3">
                    <button 
                        onClick={onResume}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-md active:scale-95 transition-transform"
                    >
                        الاستمرار في الجلسة
                    </button>
                    <button 
                        onClick={onStartNew}
                        className="w-full py-3 bg-gray-500/10 hover:bg-gray-500/20 rounded-xl font-bold opacity-70 active:scale-95 transition-transform"
                        style={{ color: 'var(--modal-text)' }}
                    >
                        البدء من جديد
                    </button>
                </div>
            </div>
        </div>
    );
};

const QuranReader: FC<{ onBack: () => void, onNavigate: (pageId: string) => void, initialLandscape?: boolean, initialSurah?: number, initialAyah?: number, initialPage?: number, isWirdMode?: boolean, isMemorizationMode?: boolean, memorizationSettings?: any }> = ({ onBack, onNavigate, initialLandscape = false, initialSurah, initialAyah, initialPage, isWirdMode = false, isMemorizationMode = false, memorizationSettings }) => {
    const [isLandscape, setIsLandscape] = useState(initialLandscape);
    const [showResumeModal, setShowResumeModal] = useState(false);
    const [savedSession, setSavedSession] = useState<any>(null);
    const [localIsMemorizationMode, setLocalIsMemorizationMode] = useState(isMemorizationMode);
    const [localMemorizationSettings, setLocalMemorizationSettings] = useState(memorizationSettings);
    
    // Auto-detect orientation
    useEffect(() => {
        const handleResize = () => {
            const isL = window.innerWidth > window.innerHeight;
            if (isL !== isLandscapeRef.current) {
                setIsLandscape(isL);
            }
        };
        
        window.addEventListener('resize', handleResize);
        handleResize(); // Initial check
        
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [readingMode, setReadingMode] = useState<ReadingMode>('mushaf');
    const contextSuffix = isWirdMode ? '_wird' : (isMemorizationMode ? '_mem' : '_main');
    const modeSuffix = (readingMode === 'mushaf' ? (isLandscape ? '_h' : '_v') : `_${readingMode}_${isLandscape ? 'h' : 'v'}`) + contextSuffix;

    const [isLandscapeUIHidden, setIsLandscapeUIHidden] = useState(() => {
        if (!initialLandscape) return false;
        return localStorage.getItem('is_landscape_ui_hidden' + modeSuffix) === 'true';
    });
    const isLandscapeUIHiddenRef = useRef(isLandscapeUIHidden);
    useEffect(() => { 
        isLandscapeUIHiddenRef.current = isLandscapeUIHidden; 
        if (isLandscapeRef.current) {
            localStorage.setItem('is_landscape_ui_hidden' + modeSuffix, String(isLandscapeUIHidden));
        }
    }, [isLandscapeUIHidden, modeSuffix]);

    const [useTajweed, setUseTajweed] = useState(() => localIsMemorizationMode ? true : localStorage.getItem('use_tajweed_quran' + modeSuffix) === 'true');
    const [quranData, setQuranData] = useState<any>(useTajweed ? quranTajweedJson.data : quranUthmaniJson.data);

    useEffect(() => {
        if (localIsMemorizationMode) {
            setUseTajweed(true);
            setQuranData(quranTajweedJson.data);
        }
    }, [localIsMemorizationMode]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState('');
    const [loadingProgress, setLoadingProgress] = useState(100);

    const [visiblePages, setVisiblePages] = useState<number[]>([1, 2, 3]);
    const [wirdEndPage, setWirdEndPage] = useState<number | null>(null);
    const [showWirdCompleteModal, setShowWirdCompleteModal] = useState(false);
    const [hasShownWirdComplete, setHasShownWirdComplete] = useState(false);

    useEffect(() => {
        if (isWirdMode) {
            const saved = localStorage.getItem('dailyWirdSettings_v2');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    const activeProfile = parsed.profiles?.find((p: any) => p.id === parsed.activeId);
                    if (activeProfile && activeProfile.isActive) {
                        const getDayRange = (day: number, settings: any) => {
                            const TOTAL_PAGES = 604;
                            const startPage = settings.startPage || 1;
                            const pagesLeft = TOTAL_PAGES - startPage + 1;
                            const offset = startPage - 1;

                            if (settings.mode === 'days') {
                                const totalDays = settings.value;
                                const start = Math.floor(((day - 1) * pagesLeft) / totalDays) + 1 + offset;
                                const end = Math.floor((day * pagesLeft) / totalDays) + offset;
                                return { start, end: Math.max(start - 1, end) };
                            } else {
                                const pagesPerDay = settings.value;
                                const start = (day - 1) * pagesPerDay + 1 + offset;
                                const end = Math.min(day * pagesPerDay + offset, TOTAL_PAGES);
                                return { start: Math.min(start, TOTAL_PAGES + 1), end };
                            }
                        };
                        const { end } = getDayRange(activeProfile.currentDay, activeProfile);
                        setWirdEndPage(end);
                    }
                } catch (e) {}
            }
        }
    }, [isWirdMode]);

    const [currentAyah, setCurrentAyah] = useState<{ s: number; a: number }>({ s: 1, a: 1 });

    useEffect(() => {
        if (isWirdMode && wirdEndPage && quranData && !hasShownWirdComplete) {
            const ayah = quranData.surahs[currentAyah.s - 1]?.ayahs[currentAyah.a - 1];
            if (ayah && ayah.page > wirdEndPage) {
                // تأخير ظهور النافذة لضمان رؤية اكتمال الصفحة وانتقالها للأعلى
                const timer = setTimeout(() => {
                    setShowWirdCompleteModal(true);
                    setHasShownWirdComplete(true);
                }, 1200);
                return () => clearTimeout(timer);
            }
        }
    }, [currentAyah, wirdEndPage, quranData, hasShownWirdComplete, isWirdMode]);
    const isInitialMountRef = useRef(true);

    useEffect(() => {
        if (isInitialMountRef.current) {
            isInitialMountRef.current = false;
            return;
        }
        if (isWirdMode && quranData) {
            const ayah = quranData.surahs[currentAyah.s - 1]?.ayahs[currentAyah.a - 1];
            if (ayah) {
                const page = ayah.page;
                // Update localStorage for Daily Wird progress
                const saved = localStorage.getItem('dailyWirdSettings_v2');
                if (saved) {
                    try {
                        const parsed = JSON.parse(saved);
                        const activeProfileIndex = parsed.profiles?.findIndex((p: any) => p.id === parsed.activeId);
                        if (activeProfileIndex !== -1) {
                            // Only update if it's a new position
                            if (parsed.profiles[activeProfileIndex].lastPage !== page || 
                                parsed.profiles[activeProfileIndex].lastAyah?.s !== currentAyah.s ||
                                parsed.profiles[activeProfileIndex].lastAyah?.a !== currentAyah.a) {
                                
                                parsed.profiles[activeProfileIndex].lastPage = page;
                                parsed.profiles[activeProfileIndex].lastAyah = currentAyah;
                                localStorage.setItem('dailyWirdSettings_v2', JSON.stringify(parsed));
                            }
                        }
                    } catch (e) {}
                }
            }
        }
    }, [currentAyah, isWirdMode, quranData]);

    const [highlightedAyahId, setHighlightedAyahId] = useState<string | null>(null);
    const [isTransparentMode, setIsTransparentMode] = useState(() => localStorage.getItem('transparent_mode' + modeSuffix) === 'true');
    const [isHideToolbarsEnabled, setIsHideToolbarsEnabled] = useState(() => localStorage.getItem('hide_toolbars_enabled' + modeSuffix) === 'true');
    const [lastInteractionType, setLastInteractionType] = useState<'page' | 'ayah'>(() => {
        const saved = localStorage.getItem('last_interaction_type' + modeSuffix);
        return (saved as 'page' | 'ayah') || 'page';
    });

    useEffect(() => {
        localStorage.setItem('last_interaction_type' + modeSuffix, lastInteractionType);
    }, [lastInteractionType, modeSuffix]);

    const [activeModals, setActiveModals] = useState<string[]>([]);
    const [initialSearchQuery, setInitialSearchQuery] = useState<string | undefined>(undefined);
    const [isFloatingMenuOpen, setIsFloatingMenuOpen] = useState(false);
    const [ayahContextMenu, setAyahContextMenu] = useState<{isOpen: boolean, x: number, y: number, s: number, a: number, tempSettings: any}>({isOpen: false, x: 0, y: 0, s: 0, a: 0, tempSettings: DEFAULT_SETTINGS});
    const [ayahContextColorField, setAyahContextColorField] = useState<'textColor' | 'bgColor' | 'highlightTextColor' | null>(null);

    const PREDEFINED_COLORS = [
        '#ffffff', '#f3f4f6', '#9ca3af', '#4b5563', '#000000',
        '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e',
        '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6',
        '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
        '#f43f5e', '#78716c', '#57534e', 'transparent'
    ];

    const renderCheckerboard = (color: string) => {
        if (color === 'transparent' || color === 'rgba(0, 0, 0, 0)') {
            return {
                backgroundColor: '#ffffff',
                backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%)',
                backgroundSize: '8px 8px'
            };
        }
        return { backgroundColor: color };
    };
    
    // Close context menu on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent | TouchEvent) => {
            if (ayahContextMenu.isOpen && activeModals.length === 0) {
                const target = e.target as HTMLElement;
                if (!target.closest('.ayah-context-menu')) {
                    setAyahContextMenu(prev => ({ ...prev, isOpen: false }));
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [ayahContextMenu.isOpen, activeModals]);

    const updateSetting = (key: string, value: any) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        localStorage.setItem('quran_settings' + modeSuffix, JSON.stringify(newSettings));
        window.dispatchEvent(new Event('settings-change'));
    };
    const isLandscapeRef = useRef(false);
    useEffect(() => { isLandscapeRef.current = isLandscape; }, [isLandscape]);

    // Load settings based on orientation and mode
    useEffect(() => {
        const mode = (readingMode === 'mushaf' ? (isLandscape ? '_h' : '_v') : `_${readingMode}_${isLandscape ? 'h' : 'v'}`) + contextSuffix;
        
        const tajweedSetting = localStorage.getItem('use_tajweed_quran' + mode) === 'true';
        setUseTajweed(tajweedSetting);
        setQuranData(tajweedSetting ? quranTajweedJson.data : quranUthmaniJson.data);

        const savedSettings = localStorage.getItem('quran_settings' + mode);
        const baseSettings = savedSettings ? JSON.parse(savedSettings) : {};
        const initialSettings = { ...DEFAULT_SETTINGS, ...baseSettings };
        setSettings(initialSettings);

        const themeId = localStorage.getItem('current_theme_id' + mode) || 'default';
        const newTheme = THEMES[themeId as keyof typeof THEMES] || THEMES['default'];
        setCurrentTheme(newTheme);
        
        const transSetting = localStorage.getItem('transparent_mode' + mode) === 'true';
        setIsTransparentMode(transSetting);

        const savedBookmarks = localStorage.getItem('quran_bookmarks_list' + mode);
        setBookmarks(savedBookmarks ? JSON.parse(savedBookmarks) : []);

        const savedSajdah = localStorage.getItem('show_sajdah_card' + mode);
        setShowSajdahCard(savedSajdah !== null ? savedSajdah === 'true' : true);

        if (mode.endsWith('_h')) {
            setIsLandscapeUIHidden(localStorage.getItem('is_landscape_ui_hidden' + mode) === 'true');
        } else {
            setIsLandscapeUIHidden(false);
        }

        const posKey = `last_pos${mode}`;
        const lastPos = JSON.parse(localStorage.getItem(posKey) || '{}');
        
        // Stop dynamic activities on orientation or mode change
        stopAudio();
        setAutoScrollState({ isActive: false, isPaused: false, elapsedTime: 0 });
        setActiveModals([]);
        setIsFloatingMenuOpen(false);

        if (lastPos.s && lastPos.a) {
            setTimeout(() => {
                jumpToAyah(lastPos.s, lastPos.a, true);
            }, 100);
        }

        const savedToolbarColors = localStorage.getItem('toolbar_colors' + mode);
        if (savedToolbarColors) {
            try {
                const colors = JSON.parse(savedToolbarColors);
                // SANITIZER: Force solid colors for backgrounds
                Object.keys(colors).forEach(key => {
                    if (colors[key].bg && (colors[key].bg.includes('rgba') || colors[key].bg === 'transparent')) {
                        colors[key].bg = THEMES[themeId as keyof typeof THEMES]?.barBg || "#ffffff";
                    }
                    if (colors[key].border && (colors[key].border.includes('rgba') || colors[key].border === 'transparent')) {
                        colors[key].border = THEMES[themeId as keyof typeof THEMES]?.barBorder?.split(' ')[2] || "#e5e7eb";
                    }
                });
                setToolbarColors(colors);
            } catch (e) {}
        } else {
            const theme = THEMES['default'];
            const green = "#10b981"; const greenBorder = "#059669";
            const purple = "#7e22ce"; const purpleBorder = "#6b21a8";
            const purpleText = "#6d28d9";
            const white = "#ffffff"; const grayBorder = "#e5e7eb";
            setToolbarColors({
                'top-toolbar': { bg: white, border: grayBorder },
                'bottom-toolbar': { bg: white, border: grayBorder },
                'surah': { bg: white, text: purpleText, border: purpleText, font: theme.font },
                'juz': { bg: white, text: green, border: green, font: theme.font },
                'page': { bg: white, text: purpleText, border: purpleText, font: theme.font },
                'audio': { bg: white, text: green, border: green },
                'btn-settings': { bg: purple, text: white, border: purpleBorder },
                'btn-home': { bg: purple, text: white, border: purpleBorder },
                'btn-bookmark': { bg: green, text: white, border: greenBorder },
                'btn-bookmarks-list': { bg: green, text: white, border: greenBorder },
                'btn-themes': { bg: green, text: white, border: greenBorder },
                'btn-autoscroll': { bg: purple, text: white, border: purpleBorder },
                'btn-menu': { bg: purple, text: white, border: purpleBorder },
                'btn-search': { bg: purple, text: white, border: purpleBorder },
                'btn-share': { bg: green, text: white, border: greenBorder }
            });
        }
    }, [isLandscape, readingMode]);
    
    useEffect(() => {
        if (!isLandscape) return;

        let touchStartX = 0;
        let touchStartY = 0;
        let lastTouchX = 0;
        let lastTouchY = 0;
        let isScrolling = false;

        const handleTouchStart = (e: TouchEvent) => {
            if (e.touches.length !== 1) return;
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            lastTouchX = touchStartX;
            lastTouchY = touchStartY;
            isScrolling = false;
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length !== 1) return;
            
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            
            if (!isScrolling) {
                if (Math.abs(currentX - touchStartX) > 20 || Math.abs(currentY - touchStartY) > 20) {
                    isScrolling = true;
                    // Don't update lastTouch yet so the initial delta is applied
                } else {
                    return; // Wait until threshold is met
                }
            }

            const deltaX = currentX - lastTouchX;
            const deltaY = currentY - lastTouchY;
            
            lastTouchX = currentX;
            lastTouchY = currentY;

            if (isScrolling) {
                let target = e.target as HTMLElement;
                let scrollable: HTMLElement | null = null;
                
                while (target && target !== document.body) {
                    const style = window.getComputedStyle(target);
                    const overflowY = style.overflowY;
                    const overflowX = style.overflowX;
                    
                    const canScrollY = (overflowY === 'auto' || overflowY === 'scroll') && target.scrollHeight > target.clientHeight;
                    const canScrollX = (overflowX === 'auto' || overflowX === 'scroll') && target.scrollWidth > target.clientWidth;
                    
                    if (canScrollY || canScrollX) {
                        scrollable = target;
                        break;
                    }
                    target = target.parentElement as HTMLElement;
                }

                if (scrollable) {
                    if (e.cancelable) {
                        e.preventDefault();
                    }
                    scrollable.scrollTop += deltaX;
                    scrollable.scrollLeft += deltaY;
                }
            }
        };

        document.addEventListener('touchstart', handleTouchStart, { passive: false });
        document.addEventListener('touchmove', handleTouchMove, { passive: false });

        return () => {
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchmove', handleTouchMove);
        };
    }, [isLandscape]);

    const toggleOrientation = () => {
        setIsLandscape(!isLandscape);
        setIsFloatingMenuOpen(false);
    };
    
    const [toast, setToast] = useState({ show: false, message: '' });
    const [reciterToast, setReciterToast] = useState({ show: false, name: '' });
    const [markerNotification, setMarkerNotification] = useState<{ show: boolean, type: 'juz' | 'quarter' | 'sajda' | 'surah', text: string }>({ show: false, type: 'juz', text: '' });
    const lastNotifiedQuarter = useRef<number | null>(null);
    const lastNotifiedJuz = useRef<number | null>(null);
    const [bookmarks, setBookmarks] = useState(() => {
        const mode = initialLandscape ? '_h' : '_v';
        return JSON.parse(localStorage.getItem('quran_bookmarks_list' + mode) || '[]');
    });

    const [sajdahInfo, setSajdahInfo] = useState<{ show: boolean; surah?: string; ayah?: number }>({ show: false });
    const [sajdahCardInfo, setSajdahCardInfo] = useState({ show: false, surah: '', ayah: 0, juz: 0, page: 0, wasAutoscrolling: false, wasPlaying: false });

    const [autoScrollState, setAutoScrollState] = useState({ isActive: false, isPaused: false, elapsedTime: 0 });
    const [showSajdahCard, setShowSajdahCard] = useState(() => {
        const mode = initialLandscape ? '_h' : '_v';
        const saved = localStorage.getItem('show_sajdah_card' + mode);
        return saved !== null ? saved === 'true' : true;
    });

    const [isAutoScrollSettingsOpen, setIsAutoScrollSettingsOpen] = useState(false);
    const autoScrollButtonTimerRef = useRef<number | null>(null);
    const autoScrollFrameRef = useRef<number | null>(null);
    const lastScrollTimeRef = useRef<number>(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    const [playingAyah, setPlayingAyah] = useState<{s: number; a: number} | null>(null);
    
    const [tafseerInfo, setTafseerInfo] = useState({ isOpen: false, s: 0, a: 0, text: '', surahName: '', wasAutoscrolling: false });
    const [tafseerSelectionInfo, setTafseerSelectionInfo] = useState({ isOpen: false, s: 0, a: 0, wasAutoscrolling: false });
    const [isTafseerLoading, setIsTafseerLoading] = useState(false);
    const tafseerCache = useRef<any>({});
    
    const [ayahActionMenu, setAyahActionMenu] = useState({ isOpen: false, s: 0, a: 0, surahName: '', wasAutoscrolling: false });
    const [quranMeaningsInfo, setQuranMeaningsInfo] = useState({ isOpen: false, s: 0, a: 0, text: '', surahName: '', wasAutoscrolling: false });
    const [isQuranMeaningsLoading, setIsQuranMeaningsLoading] = useState(false);
    const quranMeaningsCache = useRef<any>(null);
    
    const [isPageInputActive, setIsPageInputActive] = useState(false);
    const [pageInput, setPageInput] = useState('');
    const isPageInputActiveRef = useRef(false);
    useEffect(() => { isPageInputActiveRef.current = isPageInputActive; }, [isPageInputActive]);
    const isJumpingRef = useRef(false);
    const wasAutoscrollingBeforeModal = useRef(false);

    const [settings, setSettings] = useState(() => {
        const mode = initialLandscape ? '_h' : '_v';
        const saved = localStorage.getItem('quran_settings' + mode);
        const defaultTheme = THEMES['default'];
        return saved ? JSON.parse(saved) : {
            fontSize: 1.7, fontFamily: defaultTheme.font, textColor: defaultTheme.text, bgColor: defaultTheme.bg,
            highlightTextColor: defaultTheme.highlightText || defaultTheme.accent,
            reader: 'Abu_Bakr_Ash-Shaatree_128kbps', theme: 'default', scrollMinutes: 20, tafseer: 'ar.jalalayn',
            hideUIOnAutoScroll: false,
            lockHighlightColor: false
        };
    });

    const [currentTheme, setCurrentTheme] = useState(() => {
        const mode = initialLandscape ? '_h' : '_v';
        const themeId = localStorage.getItem('current_theme_id' + mode) || 'default';
        return THEMES[themeId as keyof typeof THEMES] || THEMES['default'];
    });

    // Keep screen awake logic
    useEffect(() => {
        let wakeLock: any = null;

        const requestWakeLock = async () => {
            // 1. Try Capacitor KeepAwake (for APK)
            try {
                await KeepAwake.keepAwake();
            } catch (e) {
                // Not in Capacitor or failed
            }

            // 2. Try Web Screen Wake Lock API (Fallback/Web)
            if ('wakeLock' in navigator) {
                try {
                    wakeLock = await (navigator as any).wakeLock.request('screen');
                } catch (err) {
                    console.warn('Wake Lock request failed:', err);
                }
            }
        };

        requestWakeLock();

        // Re-request wake lock when page becomes visible again
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                requestWakeLock();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            KeepAwake.allowSleep().catch(() => {});
            if (wakeLock) {
                wakeLock.release().catch(() => {});
            }
        };
    }, []);

    const [toolbarColors, setToolbarColors] = useState(() => {
        const mode = initialLandscape ? '_h' : '_v';
        const saved = localStorage.getItem('toolbar_colors' + mode);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Migrate old default colors to new default colors
                if (parsed['surah']?.text === "#10b981" && parsed['juz']?.text === "#6d28d9") {
                    parsed['surah'].text = "#6d28d9";
                    parsed['surah'].border = "#6d28d9";
                    parsed['juz'].text = "#10b981";
                    parsed['juz'].border = "#10b981";
                    localStorage.setItem('toolbar_colors' + mode, JSON.stringify(parsed));
                }
                return parsed;
            } catch (e) {}
        }
        
        const theme = THEMES['default'];
        const green = "#10b981"; const greenBorder = "#059669";
        const purple = "#7e22ce"; const purpleBorder = "#6b21a8";
        const purpleText = "#6d28d9";
        const white = "#ffffff"; const grayBorder = "#e5e7eb";
        
        return {
            'top-toolbar': { bg: white, border: grayBorder },
            'bottom-toolbar': { bg: white, border: grayBorder },
            'surah': { bg: white, text: purpleText, border: purpleText, font: theme.font },
            'juz': { bg: white, text: green, border: green, font: theme.font },
            'page': { bg: white, text: purpleText, border: purpleText, font: theme.font },
            'audio': { bg: white, text: green, border: green },
            'btn-settings': { bg: purple, text: white, border: purpleBorder },
            'btn-home': { bg: green, text: white, border: greenBorder },
            'btn-bookmark': { bg: green, text: white, border: greenBorder },
            'btn-bookmarks-list': { bg: green, text: white, border: greenBorder },
            'btn-themes': { bg: green, text: white, border: greenBorder },
            'btn-autoscroll': { bg: purple, text: white, border: purpleBorder },
            'btn-menu': { bg: purple, text: white, border: purpleBorder },
            'btn-search': { bg: purple, text: white, border: purpleBorder }
        };
    });

    const quranTutorialSteps: TutorialStep[] = [
        {
            id: 'surah-name',
            text: 'اسم السورة: اضغط هنا لتغيير السورة أو الانتقال لجزء محدد بسهولة.',
            position: { top: '70px', right: '20px' },
            arrow: 'up',
            selector: '#surah-name-header',
            icon: <LayoutGrid className="w-8 h-8 text-white" />
        },
        {
            id: 'page-nav',
            text: 'رقم الصفحة: اضغط هنا للانتقال السريع لصفحة معينة عبر إدخال رقمها.',
            position: { top: '70px', left: '50%', right: 'auto' },
            arrow: 'up',
            selector: '#header-page',
            icon: <Move className="w-8 h-8 text-white" />
        },
        {
            id: 'audio-play',
            text: 'التشغيل الصوتي: اضغط للتشغيل أو الإيقاف، واضغط مطولاً لتغيير القارئ المفضل.',
            position: { top: '70px', left: '20px' },
            arrow: 'up',
            selector: '#btn-play',
            icon: <Mic className="w-8 h-8 text-white" />
        },
        {
            id: 'ayah-text',
            text: 'تفاعل مع الايه اضغط على نص الايه مطولا لعرض لون ونوع الخط ولون الخلفيه ولون التحديد',
            position: { top: '300px' },
            arrow: 'up',
            selector: '.ayah-text-block',
            icon: <MousePointer2 className="w-8 h-8 text-white" />
        },
        {
            id: 'ayah-number',
            text: 'رقم الايه لعرض التفسير واضغط مطولا للاختيار من التفسيرات المختلفه',
            position: { top: '350px' },
            arrow: 'up',
            selector: '.verse-container',
            icon: <MousePointer2 className="w-8 h-8 text-white" />
        },
        {
            id: 'zoom-gesture',
            text: 'التكبير والتصغير: استخدم إصبعين على الشاشة لتكبير أو تصغير الخط بما يريح عينيك.',
            position: { top: '60%' },
            icon: <ZoomIn className="w-8 h-8 text-white" />
        },
        {
            id: 'main-menu',
            text: 'القائمة العائمة: اضغط هنا للوصول السريع للبحث، المظهر، قائمة العلامات، والإعدادات العامة.',
            position: { bottom: '80px', right: '20px' },
            arrow: 'down',
            selector: '#btn-menu',
            icon: <LayoutGrid className="w-8 h-8 text-white" />
        },
        {
            id: 'bookmark-feature',
            text: 'حفظ العلامة: اضغط لحفظ موضعك الحالي، واضغط مطولاً لعرض وإدارة قائمة علاماتك.',
            position: { bottom: '80px', right: '35%' },
            arrow: 'down',
            selector: '#btn-bookmark',
            icon: <Bookmark className="w-8 h-8 text-white" />
        },
        {
            id: 'autoscroll-feature',
            text: 'التمرير التلقائي: اضغط لبدء أو إيقاف التمرير، واضغط مطولاً لضبط السرعة والأوقات المفضلة.',
            position: { bottom: '80px', left: '35%' },
            arrow: 'down',
            selector: '#btn-autoscroll',
            icon: <Move className="w-8 h-8 text-white" />
        },
        {
            id: 'share-ayah-feature',
            text: 'مشاركة آية: اضغط هنا لمشاركة الآية الحالية كصورة مع إمكانية تخصيص الخلفية والخط والألوان.',
            position: { bottom: '80px', left: '25%' },
            arrow: 'down',
            selector: '#btn-share',
            icon: <Share2 className="w-8 h-8 text-white" />
        },
        {
            id: 'home-nav',
            text: 'الرئيسية: اضغط هنا للعودة إلى الشاشة الرئيسية للتطبيق في أي وقت.',
            position: { bottom: '80px', left: '20px' },
            arrow: 'down',
            selector: '#btn-home',
            icon: <Home className="w-8 h-8 text-white" />
        }
    ];
    const mushafContentRef = useRef<HTMLDivElement>(null);
    const settingsRef = useRef(settings);
    useEffect(() => { settingsRef.current = settings; }, [settings]);
    const floatingMenuRef = useRef<HTMLDivElement>(null);
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const scrollIntervalRef = useRef<number | null>(null);
    const timerIntervalRef = useRef<number | null>(null);
    const scrollAccumulatorRef = useRef(0);
    const autoScrollPausedRef = useRef(false);
    const currentAyahRef = useRef(currentAyah);
    const lastScrollUpdateTime = useRef(0);
    const pageInputRef = useRef<HTMLInputElement>(null);
    
    const audioCacheRef = useRef<Record<string, HTMLAudioElement>>({});
    const currentAudioRef = useRef<HTMLAudioElement | null>(null);
    const handleResumeSession = () => {
        if (savedSession) {
            setLocalIsMemorizationMode(true);
            const settings = {
                ...savedSession.settings,
                rangeRepeatCount: savedSession.rangeRepeatCount,
                currentRepeatCount: savedSession.currentRepeatCount
            };
            setLocalMemorizationSettings(settings);
            memorizationSettingsRef.current = settings;
            
            jumpToAyah(savedSession.currentAyah.s, savedSession.currentAyah.a, true);
            setTimeout(() => {
                playAudio(savedSession.currentAyah.s, savedSession.currentAyah.a);
            }, 500);
        }
        setShowResumeModal(false);
    };

    const handleStartNewFromResume = () => {
        localStorage.removeItem('memorization_session_v1');
        setShowResumeModal(false);
    };

    const currentRepeatCountRef = useRef(localMemorizationSettings?.currentRepeatCount || 0);
    const ayahRepeatCountRef = useRef(settings.ayahRepeatCount || 1);

    useEffect(() => {
        ayahRepeatCountRef.current = settings.ayahRepeatCount || 1;
    }, [settings.ayahRepeatCount]);

    const sajdahInfoRef = useRef(sajdahInfo);
    useEffect(() => { sajdahInfoRef.current = sajdahInfo; }, [sajdahInfo]);
    const sajdahCardInfoRef = useRef(sajdahCardInfo);
    useEffect(() => { sajdahCardInfoRef.current = sajdahCardInfo; }, [sajdahCardInfo]);
    const autoScrollStateRef = useRef(autoScrollState);
    useEffect(() => { autoScrollStateRef.current = autoScrollState; }, [autoScrollState]);
    const isPlayingRef = useRef(isPlaying);
    useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
    const isAudioLoadingRef = useRef(isAudioLoading);
    useEffect(() => { isAudioLoadingRef.current = isAudioLoading; }, [isAudioLoading]);
    const highlightedAyahIdRef = useRef(highlightedAyahId);
    useEffect(() => { highlightedAyahIdRef.current = highlightedAyahId; }, [highlightedAyahId]);

    useEffect(() => { currentAyahRef.current = currentAyah; }, [currentAyah]);

    useEffect(() => {
        // Clear audio cache when reader changes to prevent playing old reader's audio
        audioCacheRef.current = {};

        if (isPlaying || isAudioLoading) {
            // Restart with new reader from the currently playing ayah (if any), otherwise current selected
            const target = playingAyah || currentAyah;
            playAudio(target.s, target.a);
        }
    }, [settings.reader]);
    
    useEffect(() => {
        if (isPageInputActive && pageInputRef.current) {
            pageInputRef.current.focus();
        }
    }, [isPageInputActive]);

    const showToast = useCallback((message: string) => setToast({ show: true, message }), []);
    
    const stopAudio = useCallback(() => {
        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current.onended = null;
            currentAudioRef.current = null;
        }
        currentRepeatCountRef.current = 0;
        setIsPlaying(false);
        setIsAudioLoading(false);
        setPlayingAyah(null);
    }, []);

    const isMounted = useRef(true);
    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
            stopAudio();
            if (localIsMemorizationMode) {
                const sessionData = {
                    currentAyah: currentAyahRef.current,
                    settings: memorizationSettingsRef.current,
                    rangeRepeatCount: rangeRepeatCountRef.current,
                    currentRepeatCount: currentRepeatCountRef.current,
                    timestamp: Date.now()
                };
                localStorage.setItem('memorization_session_v1', JSON.stringify(sessionData));
            }
        };
    }, [localIsMemorizationMode, stopAudio]);
    const showMarkerNotification = useCallback((type: 'juz' | 'quarter' | 'sajda' | 'surah', text: string) => {
        setMarkerNotification({ show: true, type, text });
        setTimeout(() => setMarkerNotification(prev => ({ ...prev, show: false })), 2000);
    }, []);

    const handleSajdahVisible = useCallback((surahName: string, sNum: number, ayahNum: number) => {
        if (sajdahCardInfoRef.current.show) return;

        showMarkerNotification('sajda', `سجدة تلاوة: سورة ${surahName} - آية ${toArabic(ayahNum)}`);

        if (showSajdahCard) {
            if (!quranData) return;
            const juz = JUZ_MAP.slice().reverse().find(j => (sNum > j.s) || (sNum === j.s && ayahNum >= j.a))?.j || 1;
            const page = quranData.surahs[sNum - 1]?.ayahs.find((ay:any) => ay.numberInSurah === ayahNum)?.page || 1;

            const wasAutoscrolling = autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused;
            const wasPlaying = isPlayingRef.current || isAudioLoadingRef.current;

            if (wasAutoscrolling) {
                autoScrollPausedRef.current = true;
                const newState = { ...autoScrollStateRef.current, isPaused: true };
                autoScrollStateRef.current = newState;
                setAutoScrollState(newState);
            }
            if (wasPlaying) {
                stopAudio();
            }

            setSajdahCardInfo({
                show: true,
                surah: surahName,
                ayah: ayahNum,
                juz,
                page,
                wasAutoscrolling,
                wasPlaying
            });
        }
    }, [quranData, showMarkerNotification, stopAudio, showSajdahCard]);

    const handleCloseSajdahCard = () => {
        if (sajdahCardInfo.wasAutoscrolling) {
            autoScrollPausedRef.current = false;
            setAutoScrollState(p => ({...p, isPaused: false }));
        }
        setSajdahCardInfo({ show: false, surah: '', ayah: 0, juz: 0, page: 0, wasAutoscrolling: false, wasPlaying: false });
    };

    const scrollToAyah = useCallback((s: number, a: number, instant: boolean = false, retries: number = 10) => {
        const el = document.getElementById(`ayah-${s}-${a}`);
        if (el) {
            const container = mushafContentRef.current;
            if (container) {
                if (isLandscapeRef.current) {
                    // In landscape mode (rotated), we use offsetTop for more reliable scrolling
                    const targetScroll = el.offsetTop - (container.clientHeight / 2) + (el.clientHeight / 2);
                    container.scrollTo({ top: targetScroll, behavior: instant ? 'auto' : 'smooth' });
                } else {
                    const containerRect = container.getBoundingClientRect();
                    const elRect = el.getBoundingClientRect();
                    const scrollTop = container.scrollTop + elRect.top - containerRect.top - (containerRect.height / 2) + (elRect.height / 2);
                    container.scrollTo({ top: scrollTop, behavior: instant ? 'auto' : 'smooth' });
                }
            } else {
                el.scrollIntoView({ block: 'center', behavior: instant ? 'auto' : 'smooth' });
            }
        } else if (retries > 0) {
            setTimeout(() => scrollToAyah(s, a, instant, retries - 1), 100);
        }
    }, []);

    const manageAudioCache = useCallback((currentS: number, currentA: number) => {
        const keys = Object.keys(audioCacheRef.current);
        if (keys.length <= 20) return;
        for (const key of keys) {
            const [s, a] = key.split(':').map(Number);
            if (Math.abs(currentA - a) > 10 || currentS !== s) {
                delete audioCacheRef.current[key];
            }
        }
    }, []);

    const preloadAudioQueue = useCallback(async (s: number, startAyah: number) => {
        if (!quranData) return;
        const surah = quranData.surahs[s - 1];
        if (!surah) return;

        const reader = localIsMemorizationMode && memorizationSettingsRef.current ? memorizationSettingsRef.current.reader : settings.reader;

        for (let i = 0; i < 10; i++) {
            const ayahNum = startAyah + i;
            if (ayahNum > surah.ayahs.length) break;
            const cacheKey = `${s}:${ayahNum}`;
            if (!audioCacheRef.current[cacheKey]) {
                const surahStr = String(s).padStart(3, '0');
                const ayahStr = String(ayahNum).padStart(3, '0');
                const audioUrl = `https://everyayah.com/data/${reader}/${surahStr}${ayahStr}.mp3`;
                
                try {
                    if ('caches' in window) {
                        const cache = await caches.open('quran-audio-cache');
                        const cachedResponse = await cache.match(audioUrl);
                        if (!cachedResponse) {
                            const audio = new Audio(audioUrl);
                            audio.preload = 'auto';
                            audioCacheRef.current[cacheKey] = audio;
                        }
                    } else {
                         const audio = new Audio(audioUrl);
                         audio.preload = 'auto';
                         audioCacheRef.current[cacheKey] = audio;
                    }
                } catch (e) { console.warn("Preloading failed", e); }
            }
        }
    }, [settings.reader, quranData, localIsMemorizationMode]);

    const memorizationSettingsRef = useRef(localMemorizationSettings);
    useEffect(() => { memorizationSettingsRef.current = localMemorizationSettings; }, [localMemorizationSettings]);
    const rangeRepeatCountRef = useRef(localMemorizationSettings?.rangeRepeatCount || 0);
    const lastLinkedAyahRef = useRef<{s: number, a: number} | null>(null);

    const playAudio = useCallback(async (s: number, a: number, isLinked = false, targetAyah?: {s: number, a: number}) => {
        stopAudio();
        setIsAudioLoading(true);
        setPlayingAyah({ s, a });
        setCurrentAyah({ s, a });
        setHighlightedAyahId(`ayah-${s}-${a}`);
        scrollToAyah(s, a, false);
        
        // Reset repeat count if it's a new ayah (not a repetition or linked)
        if (!isLinked && !targetAyah) {
            currentRepeatCountRef.current = 0;
        }

        // Handle Linked Repeat if it's the start of a new ayah session
        if (localIsMemorizationMode && memorizationSettingsRef.current?.linkedRepeat && !isLinked && !targetAyah) {
            // Only play linked if we haven't played it for this ayah yet
            if (lastLinkedAyahRef.current?.s !== s || lastLinkedAyahRef.current?.a !== a) {
                // Find previous ayah
                let prevS = s;
                let prevA = a - 1;
                if (prevA < 1) {
                    if (prevS > 1) {
                        prevS -= 1;
                        prevA = quranData.surahs[prevS - 1].ayahs.length;
                    }
                }
                
                if (prevA >= 1) {
                    lastLinkedAyahRef.current = { s, a };
                    // Play previous ayah once, then come back to current ayah
                    playAudio(prevS, prevA, true, { s, a });
                    return;
                }
            }
        }

        // Save session on every ayah change
        if (localIsMemorizationMode) {
            const sessionData = {
                currentAyah: { s, a },
                settings: memorizationSettingsRef.current,
                rangeRepeatCount: rangeRepeatCountRef.current,
                currentRepeatCount: currentRepeatCountRef.current,
                timestamp: Date.now()
            };
            localStorage.setItem('memorization_session_v1', JSON.stringify(sessionData));
        }

        // Pause voice control if it's running
        window.dispatchEvent(new CustomEvent('voice-control-pause'));
    
        const cacheKey = `${s}:${a}`;
        let audio: HTMLAudioElement;
    
        if (audioCacheRef.current[cacheKey]) {
            audio = audioCacheRef.current[cacheKey];
            audio.currentTime = 0;
        } else {
            const surahStr = String(s).padStart(3, '0');
            const ayahStr = String(a).padStart(3, '0');
            const reader = localIsMemorizationMode && memorizationSettingsRef.current ? memorizationSettingsRef.current.reader : settings.reader;
            const audioUrl = `https://everyayah.com/data/${reader}/${surahStr}${ayahStr}.mp3`;
            let audioSrc = audioUrl;

            try {
                if ('caches' in window) {
                    const cache = await caches.open('quran-audio-cache');
                    const cachedResponse = await cache.match(audioUrl);
                    if (cachedResponse) {
                        const blob = await cachedResponse.blob();
                        audioSrc = URL.createObjectURL(blob);
                    }
                }
            } catch (e) { console.warn("Cache API check failed", e); }
    
            audio = new Audio(audioSrc);
            audio.preload = 'auto';
            audioCacheRef.current[cacheKey] = audio;
        }
    
        currentAudioRef.current = audio;
    
        audio.onplaying = () => { setIsPlaying(true); setIsAudioLoading(false); };
        audio.onpause = () => { 
            setIsPlaying(false);
            // Resume voice control if it was running before
            window.dispatchEvent(new CustomEvent('voice-control-resume'));
        };
        audio.onwaiting = () => setIsAudioLoading(true);
        audio.onended = () => {
            if (localIsMemorizationMode && memorizationSettingsRef.current) {
                const memSettings = memorizationSettingsRef.current;
                
                // If this was a linked ayah, play the target ayah next
                if (isLinked && targetAyah) {
                    playAudio(targetAyah.s, targetAyah.a, false);
                    return;
                }

                const maxAyahRepeat = memSettings.ayahRepeat || 1;
                const pauseLength = memSettings.pauseLength || 0;
                
                const handleNext = () => {
                    if (currentRepeatCountRef.current < maxAyahRepeat - 1) {
                        currentRepeatCountRef.current += 1;
                        audio.currentTime = 0;
                        audio.play().catch(e => {
                            console.error("Repeat playback failed", e);
                            playNextAyahRef.current();
                        });
                    } else {
                        currentRepeatCountRef.current = 0;
                        // Check if we reached the end of the range
                        if (s === memSettings.toSurah && a === memSettings.toAyah) {
                            const maxRangeRepeat = memSettings.rangeRepeat || 1;
                            if (rangeRepeatCountRef.current < maxRangeRepeat - 1) {
                                rangeRepeatCountRef.current += 1;
                                playAudio(memSettings.fromSurah, memSettings.fromAyah);
                            } else {
                                rangeRepeatCountRef.current = 0;
                                stopAudio();
                                localStorage.removeItem('memorization_session_v1');
                                showToast('انتهت جلسة التحفيظ');
                                if (memSettings.testAfterSession) {
                                    showToast('حان وقت الاختبار!');
                                }
                                // Auto-return to memorization page
                                setTimeout(() => {
                                    if (onBack) onBack();
                                    else if (onNavigate) onNavigate('memorization');
                                }, 1500);
                            }
                        } else {
                            playNextAyahRef.current();
                        }
                    }
                };

                if (pauseLength > 0) {
                    const pauseMs = audio.duration * 1000 * pauseLength;
                    setTimeout(handleNext, pauseMs);
                } else {
                    handleNext();
                }
            } else {
                const maxRepeat = ayahRepeatCountRef.current;
                
                if (currentRepeatCountRef.current < maxRepeat - 1) {
                    currentRepeatCountRef.current += 1;
                    audio.currentTime = 0;
                    audio.play().catch(e => {
                        console.error("Repeat playback failed", e);
                        playNextAyahRef.current();
                    });
                } else {
                    currentRepeatCountRef.current = 0;
                    playNextAyahRef.current();
                }
            }
        };
        audio.onerror = () => {
            showToast('خطأ في تحميل المقطع الصوتي.');
            stopAudio();
            delete audioCacheRef.current[cacheKey];
            window.dispatchEvent(new CustomEvent('voice-control-resume'));
        };

    
        try {
            if (isMounted.current) {
                await audio.play();
            }
            preloadAudioQueue(s, a + 1);
            manageAudioCache(s, a);
        } catch (error) {
            showToast('فشل تشغيل الصوت.');
            stopAudio();
            delete audioCacheRef.current[cacheKey];
            window.dispatchEvent(new CustomEvent('voice-control-resume'));
        }
    }, [settings.reader, settings.ayahRepeatCount, localIsMemorizationMode, stopAudio, preloadAudioQueue, manageAudioCache, showToast, scrollToAyah, onBack, onNavigate]);

    const playNextAyah = useCallback(() => {
        if (!quranData || !playingAyah) return stopAudio();
        const { s, a } = playingAyah;
        const surah = quranData.surahs[s - 1];
        if (!surah) return stopAudio();
    
        let nextS = s;
        let nextA = a + 1;

        if (a < surah.ayahs.length) {
            nextA = a + 1;
        } else if (s < 114) {
            nextS = s + 1;
            nextA = 1;
        } else {
            stopAudio();
            showToast('انتهت السورة');
            return;
        }

        playAudio(nextS, nextA);
    }, [quranData, playingAyah, stopAudio, showToast, localIsMemorizationMode, playAudio]);

    const playNextAyahRef = useRef(playNextAyah);
    useEffect(() => { playNextAyahRef.current = playNextAyah; }, [playNextAyah]);



    const closeModal = useCallback((modalName: string) => {
        setActiveModals(p => p.filter(m => m !== modalName));
        if (modalName === 'search-modal') {
            setInitialSearchQuery(undefined);
        }
        if (wasAutoscrollingBeforeModal.current) {
            const anyOtherOpen = activeModals.some(m => m !== modalName);
            if (!anyOtherOpen) {
                autoScrollPausedRef.current = false;
                setAutoScrollState(p => ({ ...p, isPaused: false }));
                wasAutoscrollingBeforeModal.current = false;
            }
        }
    }, [activeModals]);

    const openModal = useCallback((modalName: string, params?: any) => { 
        stopAudio(); 
        if (modalName === 'search-modal' && params?.target) {
            setInitialSearchQuery(params.target);
        } else if (modalName === 'search-modal') {
            setInitialSearchQuery(undefined);
        }
        let wasScrolling = false;
        if (autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused) {
            autoScrollPausedRef.current = true;
            const newState = { ...autoScrollStateRef.current, isPaused: true };
            autoScrollStateRef.current = newState;
            setAutoScrollState(newState);
            wasAutoscrollingBeforeModal.current = true;
            wasScrolling = true;
        }
        if (modalName === 'tafseer-selection-modal') {
            setTafseerSelectionInfo(p => ({ ...p, isOpen: true, wasAutoscrolling: wasScrolling }));
        } else {
            setActiveModals(p => [...p.filter(m => m !== modalName), modalName]); 
        }
    }, [stopAudio]);
    
    const handleAyahClick = useCallback((s, a) => {
        setHighlightedAyahId(`ayah-${s}-${a}`);
        setCurrentAyah({ s, a });
        const key = `last_pos${modeSuffix}`;
        localStorage.setItem(key, JSON.stringify({ s, a }));
    }, [modeSuffix]);

    const handleAyahTextClick = useCallback((s: number, a: number) => {
        handleAyahClick(s, a);
        setIsFloatingMenuOpen(false);
        
        if (autoScrollStateRef.current.isActive) {
            const newPausedState = !autoScrollStateRef.current.isPaused;
            autoScrollPausedRef.current = newPausedState;
            const newState = { ...autoScrollStateRef.current, isPaused: newPausedState };
            autoScrollStateRef.current = newState;
            setAutoScrollState(newState);
            
            if (initialLandscape) {
                setIsLandscapeUIHidden(!newPausedState);
            }
        } else if (initialLandscape) {
            setIsLandscapeUIHidden(prev => !prev);
        }
    }, [handleAyahClick]);

    const handleVerseClick = useCallback((s: number, a: number, event: React.MouseEvent) => {
        event.stopPropagation();
        handleAyahClick(s, a);
        if (!quranData) return;
        const surah = quranData.surahs.find((su: any) => su.number === s);
        if (surah) {
            const wasAutoscrolling = autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused;
            if (wasAutoscrolling) {
                autoScrollPausedRef.current = true;
                const newState = { ...autoScrollStateRef.current, isPaused: true };
                autoScrollStateRef.current = newState;
                setAutoScrollState(newState);
            if (initialLandscape) {
                setIsLandscapeUIHidden(false);
            }
            }
            setAyahActionMenu({ isOpen: true, s, a, surahName: surah.name, wasAutoscrolling });
        }
    }, [quranData, handleAyahClick]);

    const handleVerseLongPress = useCallback((s: number, a: number) => {
        if (isLandscapeRef.current) return;
        const wasAutoscrolling = autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused;
        if (wasAutoscrolling) {
            autoScrollPausedRef.current = true;
            setAutoScrollState(p => ({ ...p, isPaused: true }));
            // Force update ref immediately to prevent race condition with handleInteractionEnd
            autoScrollStateRef.current = { ...autoScrollStateRef.current, isPaused: true };
        }
        setTafseerSelectionInfo({ isOpen: true, s, a, wasAutoscrolling });
    }, []);

    const handleAyahLongPress = useCallback((s: number, a: number, x: number, y: number) => {
        if (isLandscapeRef.current) return;
        setAyahContextMenu({ isOpen: true, x, y, s, a, tempSettings: { ...settingsRef.current } });
    }, []);

    const handleTafseerSelect = useCallback((tafseerId: string) => {
        if (tafseerSelectionInfo.wasAutoscrolling) {
            autoScrollPausedRef.current = false;
            setAutoScrollState(p => ({ ...p, isPaused: false }));
        }
        setTafseerSelectionInfo(prev => ({ ...prev, isOpen: false, wasAutoscrolling: false }));
        
        const newSettings = { ...settings, tafseer: tafseerId };
        setSettings(newSettings);
        localStorage.setItem('quran_settings' + modeSuffix, JSON.stringify(newSettings));
        window.dispatchEvent(new Event('settings-change'));
    }, [settings, tafseerSelectionInfo.wasAutoscrolling]);
    
    useEffect(() => {
        const fetchTafseer = async () => {
            if (!tafseerInfo.isOpen) return;
            const currentTafseerId = settings.tafseer || 'ar.jalalayn';
            const cacheKey = `${tafseerInfo.s}_${currentTafseerId}`;
            try {
                if (!tafseerCache.current[cacheKey]) {
                    if (currentTafseerId === 'ar.jalalayn') {
                        const res = await fetch('/assets/data/ar.jalalayn.json');
                        const data = await res.json();
                        if (data.code === 200 && data.data && data.data.surahs) {
                            data.data.surahs.forEach((surah: any) => {
                                tafseerCache.current[`${surah.number}_ar.jalalayn`] = surah.ayahs;
                            });
                        } else {
                            throw new Error('Failed to parse local tafseer data');
                        }
                    } else {
                        const res = await fetch(`https://api.alquran.cloud/v1/surah/${tafseerInfo.s}/${currentTafseerId}`);
                        const data = await res.json();
                        if (data.code === 200) tafseerCache.current[cacheKey] = data.data.ayahs;
                        else throw new Error('Failed to fetch tafseer data');
                    }
                }
                const ayahTafseer = tafseerCache.current[cacheKey]?.[tafseerInfo.a - 1];
                setTafseerInfo(prev => ({ ...prev, text: ayahTafseer?.text || "التفسير غير متوفر لهذه الآية." }));
            } catch (e) {
                setTafseerInfo(prev => ({...prev, text: 'خطأ في تحميل التفسير. يرجى التحقق من اتصالك بالإنترنت.'}));
            } finally { setIsTafseerLoading(false); }
        };
        fetchTafseer();
    }, [tafseerInfo.isOpen, tafseerInfo.s, tafseerInfo.a, settings.tafseer]);

    useEffect(() => {
        const fetchQuranMeanings = async () => {
            if (!quranMeaningsInfo.isOpen) return;
            try {
                setIsQuranMeaningsLoading(true);
                if (!quranMeaningsCache.current) {
                    const res = await fetch('/tafseer.json');
                    const data = await res.json();
                    quranMeaningsCache.current = data;
                }
                
                const meaningObj = quranMeaningsCache.current.find(
                    (item: any) => item.number === String(quranMeaningsInfo.s) && item.aya === String(quranMeaningsInfo.a)
                );
                
                setQuranMeaningsInfo(prev => ({ 
                    ...prev, 
                    text: meaningObj?.text || "معاني الكلمات غير متوفرة لهذه الآية." 
                }));
            } catch (e) {
                setQuranMeaningsInfo(prev => ({
                    ...prev, 
                    text: 'خطأ في تحميل معاني القرآن. يرجى التحقق من اتصالك بالإنترنت.'
                }));
            } finally { 
                setIsQuranMeaningsLoading(false); 
            }
        };
        fetchQuranMeanings();
    }, [quranMeaningsInfo.isOpen, quranMeaningsInfo.s, quranMeaningsInfo.a]);

    const toggleAudio = useCallback(() => {
        if (isPlaying || isAudioLoading) stopAudio();
        else if (currentAyah) {
            playAudio(currentAyah.s, currentAyah.a);
            const currentReaderId = localIsMemorizationMode && memorizationSettingsRef.current ? memorizationSettingsRef.current.reader : settings.reader;
            const readerList = localIsMemorizationMode ? MEMORIZATION_READERS : READERS;
            const reciterName = readerList.find(r => r.id === currentReaderId)?.name || 'القارئ';
            setReciterToast({ show: true, name: reciterName });
            setTimeout(() => setReciterToast(prev => ({ ...prev, show: false })), 2000);
        }
        else showToast('الرجاء اختيار آية للبدء');
    }, [isPlaying, isAudioLoading, currentAyah, playAudio, stopAudio, settings.reader, localIsMemorizationMode]);

    const playButtonTimerRef = useRef<number | null>(null);
    const handlePlayButtonPointerDown = () => {
        playButtonTimerRef.current = window.setTimeout(() => {
            playButtonTimerRef.current = null;
            openModal('reciter-modal');
        }, 500);
    };

    const handlePlayButtonPointerUp = () => {
        if (playButtonTimerRef.current) {
            clearTimeout(playButtonTimerRef.current);
            playButtonTimerRef.current = null;
            toggleAudio();
        }
    };

    const handlePlayButtonPointerLeave = () => {
        if (playButtonTimerRef.current) {
            clearTimeout(playButtonTimerRef.current);
            playButtonTimerRef.current = null;
        }
    };

    const handleAutoScrollButtonPointerDown = (e: React.SyntheticEvent) => {
        e.stopPropagation();
        if (e && e.type === 'touchstart') {
            e.preventDefault();
        }
        if (autoScrollButtonTimerRef.current) return;
        autoScrollButtonTimerRef.current = window.setTimeout(() => {
            autoScrollButtonTimerRef.current = null;
            setIsAutoScrollSettingsOpen(true);
        }, 500);
    };

    const handleAutoScrollButtonPointerUp = (e: React.SyntheticEvent) => {
        e.stopPropagation();
        if (e && e.type === 'touchend') {
            e.preventDefault();
        }
        if (autoScrollButtonTimerRef.current) {
            clearTimeout(autoScrollButtonTimerRef.current);
            autoScrollButtonTimerRef.current = null;
            toggleAutoScroll();
        }
    };

    const handleAutoScrollButtonPointerLeave = (e: React.SyntheticEvent) => {
        e.stopPropagation();
        if (autoScrollButtonTimerRef.current) {
            clearTimeout(autoScrollButtonTimerRef.current);
            autoScrollButtonTimerRef.current = null;
        }
    };

    const handleMushafTypeSelect = (type: 'uthmani' | 'tajweed') => {
        const isTajweed = type === 'tajweed';
        localStorage.setItem('use_tajweed_quran' + modeSuffix, String(isTajweed));
        setUseTajweed(isTajweed);
        setQuranData(isTajweed ? quranTajweedJson.data : quranUthmaniJson.data);
        closeModal('mushaf-selection-modal');
        showToast(isTajweed ? 'تم تفعيل المصحف المجود' : 'تم تفعيل المصحف العثماني');
        window.dispatchEvent(new Event('settings-change'));
    };

    useEffect(() => {
        const handleThemeChange = () => {
            const mode = modeSuffix;
            const themeId = localStorage.getItem('current_theme_id' + mode) || 'default';
            const newTheme = THEMES[themeId as keyof typeof THEMES] || THEMES['default'];
            setCurrentTheme(newTheme);
            
            const savedSettings = localStorage.getItem('quran_settings' + mode);
            if (savedSettings) {
                setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
            } else {
                setSettings(DEFAULT_SETTINGS);
            }
            
            const savedToolbarColors = localStorage.getItem('toolbar_colors' + mode);
            if (savedToolbarColors) {
                try {
                    const parsed = JSON.parse(savedToolbarColors);
                    if (parsed['surah']?.text === "#10b981" && parsed['juz']?.text === "#6d28d9") {
                        parsed['surah'].text = "#6d28d9";
                        parsed['surah'].border = "#6d28d9";
                        parsed['juz'].text = "#10b981";
                        parsed['juz'].border = "#10b981";
                        localStorage.setItem('toolbar_colors' + mode, JSON.stringify(parsed));
                    }
                    setToolbarColors(parsed);
                } catch (e) {}
            } else {
                const theme = THEMES['default'];
                const green = "#10b981"; const greenBorder = "#059669";
                const purple = "#7e22ce"; const purpleBorder = "#6b21a8";
                const purpleText = "#6d28d9";
                const white = "#ffffff"; const grayBorder = "#e5e7eb";
                setToolbarColors({
                    'top-toolbar': { bg: white, border: grayBorder },
                    'bottom-toolbar': { bg: white, border: grayBorder },
                    'surah': { bg: white, text: purpleText, border: purpleText, font: theme.font },
                    'juz': { bg: white, text: green, border: green, font: theme.font },
                    'page': { bg: white, text: purpleText, border: purpleText, font: theme.font },
                    'audio': { bg: white, text: green, border: green },
                    'btn-settings': { bg: purple, text: white, border: purpleBorder },
                    'btn-home': { bg: purple, text: white, border: purpleBorder },
                    'btn-bookmark': { bg: green, text: white, border: greenBorder },
                    'btn-bookmarks-list': { bg: green, text: white, border: greenBorder },
                    'btn-themes': { bg: green, text: white, border: greenBorder },
                    'btn-autoscroll': { bg: purple, text: white, border: purpleBorder },
                    'btn-menu': { bg: purple, text: white, border: purpleBorder },
                    'btn-search': { bg: purple, text: white, border: purpleBorder },
                    'btn-share': { bg: green, text: white, border: greenBorder }
                });
            }

            const tajweedSetting = localStorage.getItem('use_tajweed_quran' + mode) === 'true';
            setUseTajweed(tajweedSetting);
            setQuranData(tajweedSetting ? quranTajweedJson.data : quranUthmaniJson.data);

            const transSetting = localStorage.getItem('transparent_mode' + mode) === 'true';
            setIsTransparentMode(transSetting);

            const savedBookmarks = localStorage.getItem('quran_bookmarks_list' + mode);
            setBookmarks(savedBookmarks ? JSON.parse(savedBookmarks) : []);

            const savedSajdah = localStorage.getItem('show_sajdah_card' + mode);
            setShowSajdahCard(savedSajdah !== null ? savedSajdah === 'true' : true);

            if (mode.endsWith('_h')) {
                setIsLandscapeUIHidden(localStorage.getItem('is_landscape_ui_hidden' + mode) === 'true');
            } else {
                setIsLandscapeUIHidden(false);
            }
        };
        const handleSettingsChange = () => {
            const mode = modeSuffix;
            const saved = localStorage.getItem('quran_settings' + mode);
            if (saved) setSettings(JSON.parse(saved));
            
            const savedToolbarColors = localStorage.getItem('toolbar_colors' + mode);
            if (savedToolbarColors) {
                try {
                    const parsed = JSON.parse(savedToolbarColors);
                    if (parsed['surah']?.text === "#10b981" && parsed['juz']?.text === "#6d28d9") {
                        parsed['surah'].text = "#6d28d9";
                        parsed['surah'].border = "#6d28d9";
                        parsed['juz'].text = "#10b981";
                        parsed['juz'].border = "#10b981";
                        localStorage.setItem('toolbar_colors' + mode, JSON.stringify(parsed));
                    }
                    setToolbarColors(parsed);
                } catch (e) {}
            } else {
                const theme = THEMES['default'];
                const green = "#10b981"; const greenBorder = "#059669";
                const purple = "#7e22ce"; const purpleBorder = "#6b21a8";
                const purpleText = "#6d28d9";
                const white = "#ffffff"; const grayBorder = "#e5e7eb";
                setToolbarColors({
                    'top-toolbar': { bg: white, border: grayBorder },
                    'bottom-toolbar': { bg: white, border: grayBorder },
                    'surah': { bg: white, text: purpleText, border: purpleText, font: theme.font },
                    'juz': { bg: white, text: green, border: green, font: theme.font },
                    'page': { bg: white, text: purpleText, border: purpleText, font: theme.font },
                    'audio': { bg: white, text: green, border: green },
                    'btn-settings': { bg: purple, text: white, border: purpleBorder },
                    'btn-home': { bg: purple, text: white, border: purpleBorder },
                    'btn-bookmark': { bg: green, text: white, border: greenBorder },
                    'btn-bookmarks-list': { bg: green, text: white, border: greenBorder },
                    'btn-themes': { bg: green, text: white, border: greenBorder },
                    'btn-autoscroll': { bg: purple, text: white, border: purpleBorder },
                    'btn-menu': { bg: purple, text: white, border: purpleBorder },
                    'btn-search': { bg: purple, text: white, border: purpleBorder },
                    'btn-share': { bg: green, text: white, border: greenBorder }
                });
            }
            
            const tajweedSetting = localStorage.getItem('use_tajweed_quran' + mode) === 'true';
            setUseTajweed(tajweedSetting);
            setQuranData(tajweedSetting ? quranTajweedJson.data : quranUthmaniJson.data);
            
            const transSetting = localStorage.getItem('transparent_mode' + mode) === 'true';
            setIsTransparentMode(transSetting);

            const hideToolbarsSetting = localStorage.getItem('hide_toolbars_enabled' + mode) === 'true';
            setIsHideToolbarsEnabled(hideToolbarsSetting);

            const savedBookmarks = localStorage.getItem('quran_bookmarks_list' + mode);
            setBookmarks(savedBookmarks ? JSON.parse(savedBookmarks) : []);

            const savedSajdah = localStorage.getItem('show_sajdah_card' + mode);
            setShowSajdahCard(savedSajdah !== null ? savedSajdah === 'true' : true);

            if (mode.endsWith('_h')) {
                setIsLandscapeUIHidden(localStorage.getItem('is_landscape_ui_hidden' + mode) === 'true');
            } else {
                setIsLandscapeUIHidden(false);
            }
        };
        window.addEventListener('theme-change', handleThemeChange);
        window.addEventListener('settings-change', handleSettingsChange);
        return () => {
            window.removeEventListener('theme-change', handleThemeChange);
            window.removeEventListener('settings-change', handleSettingsChange);
        };
    }, [modeSuffix, showToast]);

    const handleMarkWirdCompleted = useCallback(() => {
        const saved = localStorage.getItem('dailyWirdSettings_v2');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const activeProfile = parsed.profiles?.find((p: any) => p.id === parsed.activeId);
                if (activeProfile) {
                    const TOTAL_PAGES_COUNT = 604;
                    const getTotalDaysCount = (settings: any) => {
                        return settings.mode === 'days' ? settings.value : Math.ceil(TOTAL_PAGES_COUNT / settings.value);
                    };
                    
                    const newCompleted = [...activeProfile.completedDays, activeProfile.currentDay];
                    const totalDays = getTotalDaysCount(activeProfile);
                    const newProfile = {
                        ...activeProfile,
                        completedDays: newCompleted,
                        currentDay: activeProfile.currentDay < totalDays ? activeProfile.currentDay + 1 : activeProfile.currentDay,
                    };
                    
                    const newProfiles = parsed.profiles.map((p: any) => p.id === activeProfile.id ? newProfile : p);
                    localStorage.setItem('dailyWirdSettings_v2', JSON.stringify({ ...parsed, profiles: newProfiles }));
                    showToast('تم حفظ الورد اليومي بنجاح');
                    setShowWirdCompleteModal(false);
                }
            } catch (e) {
                console.error('Error saving wird progress:', e);
            }
        }
    }, [showToast]);

    useEffect(() => {
        const root = document.documentElement;
        const t = currentTheme;
        
        // Set Theme CSS Variables
        root.style.setProperty('--qr-bg', t.bg);
        root.style.setProperty('--qr-text', t.text);
        root.style.setProperty('--qr-bar-bg', t.barBg);
        root.style.setProperty('--qr-bar-text', t.barText);
        root.style.setProperty('--qr-bar-border', t.barBorder);
        root.style.setProperty('--qr-btn-bg', t.btnBg);
        root.style.setProperty('--qr-btn-text', t.btnText);
        root.style.setProperty('--qr-accent', t.accent);
        root.style.setProperty('--qr-accent-text', t.accentText);
        root.style.setProperty('--qr-modal-bg', t.modalBg);
        root.style.setProperty('--qr-modal-text', t.modalText);
        root.style.setProperty('--qr-header-bg', t.headerBg);
        root.style.setProperty('--qr-header-text', t.headerText);
        root.style.setProperty('--qr-card-bg', t.cardBg);
        root.style.setProperty('--qr-card-text', t.cardText);
        root.style.setProperty('--qr-card-border', t.cardBorder);
        root.style.setProperty('--qr-sajdah', t.sajdah);
        root.style.setProperty('--qr-highlight-text', settings.highlightTextColor || (t as any).highlightText || t.accent);

        root.style.setProperty('--color-sajdah', t.sajdah);
        root.style.setProperty('--search-result-bg', t.cardBg);
        root.style.setProperty('--search-result-border', t.accent);
        root.style.setProperty('--search-result-text', t.cardText);
        
        const darkBgs = ['#000000', '#2c241b', '#101010', '#0f172a', '#2e1065', '#064e3b', '#1e293b', '#4c1d95', '#1e1b4b', '#451a03'];
        const isDark = t.bg && darkBgs.includes(t.bg.toLowerCase());
        if (isDark) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, [currentTheme, settings.highlightTextColor]);

    const isBookmarksModalOpen = activeModals.includes('bookmarks-modal');
    useEffect(() => {
        if (isBookmarksModalOpen) {
            setBookmarks(JSON.parse(localStorage.getItem('quran_bookmarks_list' + modeSuffix) || '[]'));
        }
    }, [isBookmarksModalOpen, modeSuffix]);

    useEffect(() => {
        const contentEl = mushafContentRef.current;
        if (!contentEl) return;
    
        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = contentEl;

            if (scrollTop < clientHeight) {
                setVisiblePages(prev => {
                    // FIX: Guard against applying Math.min on an empty array, which results in Infinity. This prevents potential arithmetic errors and invalid state.
                    if (prev.length === 0) return prev;
                    const firstPage = Math.min(...prev);
                    return firstPage > 1 ? [...new Set([firstPage - 1, ...prev])] : prev;
                });
            }
            if (scrollHeight - scrollTop <= clientHeight + 200) {
                setVisiblePages(prev => {
                    // FIX: Guard against applying Math.max on an empty array, which results in -Infinity. This prevents potential arithmetic errors and invalid state.
                    if (prev.length === 0) return prev;
                    const lastPage = Math.max(...prev);
                    return lastPage < 604 ? [...new Set([...prev, lastPage + 1])] : prev;
                });
            }
    
            if (autoScrollState.isActive || isJumpingRef.current) return;
    
            const now = Date.now();
            if (now - lastScrollUpdateTime.current < 100) return;
            lastScrollUpdateTime.current = now;
    
            const x = window.innerWidth / 2;
            const y = window.innerHeight / 2;
            
            const el = document.elementFromPoint(x, y);
            if (!el) return;
            
            const ayahBlock = el.closest('.ayah-text-block');
            if (ayahBlock && ayahBlock.id) {
                const parts = ayahBlock.id.split('-');
                if (parts.length === 3) {
                    const s = parseInt(parts[1], 10);
                    const a = parseInt(parts[2], 10);
    
                    if (s !== currentAyahRef.current.s || a !== currentAyahRef.current.a) {
                        const prevAyah = currentAyahRef.current;
                        setCurrentAyah({ s, a });

                        const juzAttr = (ayahBlock as HTMLElement).dataset.juz;
                        const quarterAttr = (ayahBlock as HTMLElement).dataset.hizbQuarter;
                        
                        // Detect Juz change
                        if (juzAttr) {
                            const newJuz = parseInt(juzAttr, 10);
                            if (lastNotifiedJuz.current !== null && newJuz !== lastNotifiedJuz.current) {
                                showMarkerNotification('juz', `بداية الجزء ${toArabic(newJuz)}`);
                            }
                            lastNotifiedJuz.current = newJuz;
                        }

                        // Detect Quarter change
                        if (quarterAttr) {
                            const newQuarter = parseInt(quarterAttr, 10);
                            if (lastNotifiedQuarter.current !== null && newQuarter !== lastNotifiedQuarter.current) {
                                let label = '';
                                const qInHizb = ((newQuarter - 1) % 4) + 1;
                                const hizbNum = Math.ceil(newQuarter / 4);
                                if (qInHizb === 1) label = `بداية الحزب ${toArabic(hizbNum)}`;
                                else if (qInHizb === 2) label = `ربع الحزب ${toArabic(hizbNum)}`;
                                else if (qInHizb === 3) label = `نصف الحزب ${toArabic(hizbNum)}`;
                                else if (qInHizb === 4) label = `ثلاثة أرباع الحزب ${toArabic(hizbNum)}`;
                                
                                showMarkerNotification('quarter', label);
                            }
                            lastNotifiedQuarter.current = newQuarter;
                        }

                        if (ayahBlock.getAttribute('data-sajdah') === 'true') {
                            const surahName = (ayahBlock as HTMLElement).dataset.surah || '';
                            const sNum = parseInt((ayahBlock as HTMLElement).dataset.snum || '0', 10);
                            const ayahNum = parseInt((ayahBlock as HTMLElement).dataset.ayah || '0', 10);
                            if(surahName && sNum && ayahNum){
                                handleSajdahVisible(surahName, sNum, ayahNum);
                            }
                        }
                    }
                }
            }
        };
    
        contentEl.addEventListener('scroll', handleScroll, { passive: true });
    
        return () => {
            contentEl.removeEventListener('scroll', handleScroll);
        };
    }, [visiblePages, autoScrollState.isActive, handleSajdahVisible]);

    const getPageData = useCallback((pageNum) => quranData ? quranData.surahs.flatMap((s:any) => s.ayahs.filter((a:any) => Number(a.page) === Number(pageNum)).map((a:any) => ({ ...a, sNum: s.number, sName: s.name }))) : [], [quranData]);
    
    const jumpToAyah = useCallback((s, a, instant = false) => {
        if (isJumpingRef.current && !instant) return;
        setLastInteractionType('ayah');
        stopAudio();
        if (!quranData) return;
        const surah = quranData.surahs.find((su:any) => su.number === s);
        const ayah = surah?.ayahs.find((ay:any) => ay.numberInSurah === a);
        if (!ayah) return;
        
        isJumpingRef.current = true;
        lastNotifiedJuz.current = null;
        lastNotifiedQuarter.current = null;
        const p = Number(ayah.page);
        setVisiblePages([...new Set([p, p + 1, p + 2, p - 1, p - 2])].filter(n => n > 0 && n <= 604).sort((a: number, b: number) => a - b));
        
        setTimeout(() => {
            scrollToAyah(s, a, instant);
            handleAyahClick(s, a);
            setTimeout(() => {
                isJumpingRef.current = false;
            }, 500);
        }, 150);
        
        if (!isPageInputActiveRef.current) {
            setActiveModals([]);
        }
    }, [quranData, handleAyahClick, stopAudio, scrollToAyah]);

    const jumpToPage = useCallback((pageNum: number, instant: boolean = true) => {
        if (!quranData || isNaN(pageNum) || pageNum < 1 || pageNum > 604) return;
        setLastInteractionType('page');
        
        const pageData = getPageData(pageNum);
        if (pageData && pageData.length > 0) {
            // Sort by surah number then ayah number to get the absolute first ayah of the page
            const sortedAyahs = pageData.sort((a: any, b: any) => {
                if (a.sNum !== b.sNum) return a.sNum - b.sNum;
                return a.numberInSurah - b.numberInSurah;
            });
            const firstAyah = sortedAyahs[0];
            jumpToAyah(firstAyah.sNum, firstAyah.numberInSurah, instant);
        } else {
            showToast(`لا توجد بيانات لصفحة ${toArabic(pageNum)}`);
        }
    }, [quranData, jumpToAyah, getPageData, showToast]);

    const hasJumpedRef = useRef(false);
    useEffect(() => {
        if (hasJumpedRef.current) return;
        hasJumpedRef.current = true;
        
        if (localIsMemorizationMode && localMemorizationSettings) {
            setTimeout(() => {
                const startS = initialSurah || localMemorizationSettings.fromSurah;
                const startA = initialAyah || localMemorizationSettings.fromAyah;
                jumpToAyah(startS, startA, true);
                setTimeout(() => {
                    playAudio(startS, startA);
                }, 500);
            }, 100);
        } else if (initialSurah && initialAyah) {
            setTimeout(() => {
                jumpToAyah(initialSurah, initialAyah, true);
            }, 100);
        } else if (initialPage) {
            setTimeout(() => {
                jumpToPage(initialPage, true);
            }, 100);
        } else {
            const key = initialLandscape ? 'last_pos_h' : 'last_pos_v';
            const lastPos = JSON.parse(localStorage.getItem(key) || '{}');
            setTimeout(() => {
                jumpToAyah(lastPos.s || 1, lastPos.a || 1, true);
            }, 100);
        }
    }, [jumpToAyah, jumpToPage, initialLandscape, initialSurah, initialAyah, initialPage, localIsMemorizationMode, localMemorizationSettings, playAudio]);

    const handleVoiceCommand = useCallback((text: string) => {
        console.log('QuranReader - Voice Command:', text);
        
        // Use the new parser for Quran navigation and custom commands
        const saved = localStorage.getItem('voice_commands_v2');
        const customCommands = saved ? JSON.parse(saved) : [];
        const parsed = parseVoiceCommand(text, SURAH_NAMES_AR, customCommands);
        
        if (parsed) {
            console.log('QuranReader - Parsed Command:', parsed.action, parsed.params);
            const { action, params } = parsed;
            
            if (action === 'go_to_page' && params?.page) {
                jumpToPage(params.page, true);
                return;
            } else if (action === 'go_to_juz' && params?.juz) {
                const juzInfo = JUZ_MAP.find(j => j.j === params.juz);
                if (juzInfo) jumpToAyah(juzInfo.s, juzInfo.a, true);
                return;
            } else if (action === 'go_to_surah' && params?.surah) {
                jumpToAyah(params.surah, 1, true);
                return;
            } else if (action === 'go_to_ayah' && params?.surah && params?.ayah) {
                jumpToAyah(params.surah, params.ayah, true);
                return;
            } else if (action === 'next_page') {
                jumpToPage(Math.min(604, Math.min(...visiblePages) + 1));
                return;
            } else if (action === 'prev_page') {
                jumpToPage(Math.max(1, Math.min(...visiblePages) - 1));
                return;
            } else if (action === 'play_audio') {
                handlePlayButtonPointerDown();
                handlePlayButtonPointerUp();
                return;
            } else if (action === 'open_search') {
                openModal('search-modal');
                return;
            } else if (action === 'open_settings') {
                openModal('settings-modal');
                return;
            } else if (action === 'open_themes') {
                openModal('themes-modal');
                return;
            } else if (action === 'go_home') {
                onBack();
                return;
            } else if (action === 'go_athkar') {
                onNavigate('athkar');
                return;
            } else if (action === 'go_prayer') {
                onNavigate('prayer-times');
                return;
            } else if (action === 'go_qibla') {
                onNavigate('qibla');
                return;
            } else if (action === 'go_tasbeeh') {
                onNavigate('tasbeeh');
                return;
            } else if (action === 'go_tajweed') {
                onNavigate('tajweed-education');
                return;
            } else if (action === 'show_tafsir') {
                if (currentAyahRef.current) {
                    const { s, a } = currentAyahRef.current;
                    const surah = quranData?.surahs.find((su: any) => su.number === s);
                    if (surah) {
                        const wasAutoscrolling = autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused;
                        if (wasAutoscrolling) {
                            autoScrollPausedRef.current = true;
                            const newState = { ...autoScrollStateRef.current, isPaused: true };
                            autoScrollStateRef.current = newState;
                            setAutoScrollState(newState);
                            if (initialLandscape) {
                                setIsLandscapeUIHidden(false);
                            }
                        }
                        setIsTafseerLoading(true);
                        setTafseerInfo({ isOpen: true, s, a, text: '', surahName: surah.name, wasAutoscrolling });
                    }
                }
                return;
            } else if (action === 'toggle_auto_scroll') {
                toggleAutoScroll();
                return;
            } else if (action === 'open_bookmarks') {
                openModal('bookmarks-modal');
                return;
            } else if (action === 'save_bookmark') {
                saveBookmark();
                return;
            }
        }

        // Fallback for other commands not in parser
        const normalized = normalizeArabic(text);
        
        if (normalized.includes('تكبير') || normalized.includes('خط كبير')) {
            window.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'increase_font' } }));
        } else if (normalized.includes('تصغير') || normalized.includes('خط صغير')) {
            window.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'decrease_font' } }));
        } else if (normalized.includes('شغل') || normalized.includes('وقف') || normalized.includes('صوت') || normalized.includes('استماع')) {
            handlePlayButtonPointerDown();
            handlePlayButtonPointerUp();
        }
    }, [onNavigate, onBack, openModal, jumpToAyah, jumpToPage, visiblePages, handlePlayButtonPointerDown, handlePlayButtonPointerUp]);

    // Handle global voice commands
    useEffect(() => {
        const handleGlobalVoiceCommand = (e: any) => {
            const { action, text, params } = e.detail;
            
            // Prevent background navigation if download modals are open
            const isDownloadModalOpen = activeModals.includes('quran-download-modal') || activeModals.includes('tafsir-download-modal');
            if (isDownloadModalOpen && ['quran_navigation', 'go_to_page', 'go_to_juz', 'go_to_surah', 'go_to_ayah', 'next_page', 'prev_page'].includes(action)) {
                return; // Let the modal handle it
            }

            if (action === 'quran_navigation' && text) {
                handleVoiceCommand(text);
            } else if (action === 'go_to_page' && params?.page) {
                jumpToPage(params.page, true);
            } else if (action === 'go_to_juz' && params?.juz) {
                const juzInfo = JUZ_MAP.find(j => j.j === params.juz);
                if (juzInfo) jumpToAyah(juzInfo.s, juzInfo.a, true);
            } else if (action === 'go_to_surah' && params?.surah) {
                jumpToAyah(params.surah, 1, true);
            } else if (action === 'go_to_ayah' && params?.surah && params?.ayah) {
                jumpToAyah(params.surah, params.ayah, true);
            } else if (action === 'next_page') {
                jumpToPage(Math.min(604, Math.min(...visiblePages) + 1));
            } else if (action === 'prev_page') {
                jumpToPage(Math.max(1, Math.min(...visiblePages) - 1));
            } else if (action === 'play_audio' || action === 'stop_audio') {
                handlePlayButtonPointerDown();
                handlePlayButtonPointerUp();
            } else if (action === 'set_orientation_horizontal') {
                ScreenOrientation.lock({ orientation: 'landscape' });
            } else if (action === 'set_orientation_vertical') {
                ScreenOrientation.lock({ orientation: 'portrait' });
            } else if (action === 'contextual_number' && params?.value) {
                const num = params.value;
                // If last interaction was ayah and number is reasonable for an ayah
                if (lastInteractionType === 'ayah' && num <= 286) {
                    jumpToAyah(currentAyah.s, num, true);
                } else if (num <= 604) {
                    jumpToPage(num, true);
                }
            } else if (action === 'open_search') {
                openModal('search-modal', params);
            } else if (action === 'open_settings' || action === 'change_theme') {
                openModal('settings-modal');
            } else if (action === 'download_quran') {
                openModal('quran-download-modal');
            } else if (action === 'download_tafsir') {
                openModal('tafsir-download-modal');
            } else if (action === 'show_tafsir') {
                if (currentAyahRef.current) {
                    const { s, a } = currentAyahRef.current;
                    const surah = quranData?.surahs.find((su: any) => su.number === s);
                    if (surah) {
                        const wasAutoscrolling = autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused;
                        if (wasAutoscrolling) {
                            autoScrollPausedRef.current = true;
                            const newState = { ...autoScrollStateRef.current, isPaused: true };
                            autoScrollStateRef.current = newState;
                            setAutoScrollState(newState);
                            if (initialLandscape) {
                                setIsLandscapeUIHidden(false);
                            }
                        }
                        setIsTafseerLoading(true);
                        setTafseerInfo({ isOpen: true, s, a, text: '', surahName: surah.name, wasAutoscrolling });
                    }
                }
            } else if (action === 'open_bookmarks') {
                openModal('bookmarks-modal');
            } else if (action === 'toggle_auto_scroll') {
                toggleAutoScroll();
            } else if (action === 'pause_auto_scroll') {
                if (autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused) {
                    autoScrollPausedRef.current = true;
                    const newState = { ...autoScrollStateRef.current, isPaused: true };
                    autoScrollStateRef.current = newState;
                    setAutoScrollState(newState);
                    if (initialLandscape) {
                        setIsLandscapeUIHidden(false);
                    }
                }
            } else if (action === 'stop_auto_scroll') {
                if (autoScrollStateRef.current.isActive) {
                    stopAutoScroll(false);
                }
            } else if (action === 'close_modal') {
                setActiveModals([]);
                if (wasAutoscrollingBeforeModal.current) {
                    autoScrollPausedRef.current = false;
                    setAutoScrollState(p => ({ ...p, isPaused: false }));
                    wasAutoscrollingBeforeModal.current = false;
                }
                setTafseerInfo(p => ({ ...p, isOpen: false }));
                setTafseerSelectionInfo(p => ({ ...p, isOpen: false }));
                if (sajdahCardInfo.isOpen) handleCloseSajdahCard();
                setIsFloatingMenuOpen(false);
                setIsPageInputActive(false);
                setAyahContextMenu(p => ({ ...p, isOpen: false }));
            } else if (action === 'save_bookmark') {
                saveBookmark();
            } else if (action === 'increase_font') {
                setSettings(prev => {
                    const newSize = Number((Math.min(4.5, prev.fontSize + 0.1)).toFixed(2));
                    const newSettings = { ...prev, fontSize: newSize };
                    localStorage.setItem('quran_settings' + modeSuffix, JSON.stringify(newSettings));
                    window.dispatchEvent(new Event('settings-change'));
                    return newSettings;
                });
            } else if (action === 'decrease_font') {
                setSettings(prev => {
                    const newSize = Number((Math.max(0.5, prev.fontSize - 0.1)).toFixed(2));
                    const newSettings = { ...prev, fontSize: newSize };
                    localStorage.setItem('quran_settings' + modeSuffix, JSON.stringify(newSettings));
                    window.dispatchEvent(new Event('settings-change'));
                    return newSettings;
                });
            } else if (action === 'set_font_size' && params?.size) {
                setSettings(prev => {
                    const newSize = Math.max(0.5, Math.min(4.5, params.size));
                    const newSettings = { ...prev, fontSize: newSize };
                    localStorage.setItem('quran_settings' + modeSuffix, JSON.stringify(newSettings));
                    window.dispatchEvent(new Event('settings-change'));
                    return newSettings;
                });
            } else if (action === 'set_theme' && params?.theme) {
                updateSetting('theme', params.theme);
            }
        };

        window.addEventListener('voice-command', handleGlobalVoiceCommand);
        return () => window.removeEventListener('voice-command', handleGlobalVoiceCommand);
    }, [visiblePages, jumpToPage, handlePlayButtonPointerDown, handlePlayButtonPointerUp, openModal, handleVoiceCommand, activeModals]);

    const saveBookmark = () => { 
        const current = currentAyahRef.current;
        if (!current) { showToast('اختر آية أولاً'); return; } 
        const stored = JSON.parse(localStorage.getItem('quran_bookmarks_list' + modeSuffix) || '[]'); 
        const date = new Date(); 
        const newBookmark = { 
            id: Date.now(), 
            s: current.s, 
            a: current.a, 
            date: date.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }), 
            time: date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) 
        }; 
        const newBookmarks = [newBookmark, ...stored]; 
        localStorage.setItem('quran_bookmarks_list' + modeSuffix, JSON.stringify(newBookmarks)); 
        setBookmarks(newBookmarks); 
        showToast(`تم حفظ الإشارة المرجعية`); 
    };
    const deleteBookmark = (id:number) => { 
        const newBookmarks = bookmarks.filter((b:any) => b.id !== id); 
        localStorage.setItem('quran_bookmarks_list' + modeSuffix, JSON.stringify(newBookmarks)); 
        setBookmarks(newBookmarks); 
    };

    const bookmarkButtonTimerRef = useRef<number | null>(null);
    const handleBookmarkButtonPointerDown = (e?: React.SyntheticEvent) => {
        if (e && e.type === 'touchstart') {
            // Prevent pointer events if touch is handled
            e.preventDefault();
        }
        if (bookmarkButtonTimerRef.current) return;
        bookmarkButtonTimerRef.current = window.setTimeout(() => {
            bookmarkButtonTimerRef.current = null;
            openModal('bookmarks-modal');
        }, 500);
    };

    const handleBookmarkButtonPointerUp = (e?: React.SyntheticEvent) => {
        if (e && e.type === 'touchend') {
            e.preventDefault();
        }
        if (bookmarkButtonTimerRef.current) {
            clearTimeout(bookmarkButtonTimerRef.current);
            bookmarkButtonTimerRef.current = null;
            saveBookmark();
        }
    };

    const handleBookmarkButtonPointerLeave = () => {
        if (bookmarkButtonTimerRef.current) {
            clearTimeout(bookmarkButtonTimerRef.current);
            bookmarkButtonTimerRef.current = null;
        }
    };

    const PAGES_PER_JUZ = 20;
    const PAGE_HEIGHT_FALLBACK = 1300;

    const initialPinchDistanceRef = useRef<number | null>(null);
    const initialPinchFontSizeRef = useRef<number | null>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const distance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
            initialPinchDistanceRef.current = distance;
            initialPinchFontSizeRef.current = settings.fontSize;
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length === 2 && initialPinchDistanceRef.current !== null && initialPinchFontSizeRef.current !== null) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const distance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
            
            const scaleFactor = distance / initialPinchDistanceRef.current;
            const newFontSize = Math.min(Math.max(initialPinchFontSizeRef.current * scaleFactor, 1.0), 5.0);
            
            setSettings(prev => ({ ...prev, fontSize: newFontSize }));
        }
    };

    const handleTouchEnd = () => {
        if (initialPinchDistanceRef.current !== null) {
             localStorage.setItem('quran_settings' + modeSuffix, JSON.stringify(settingsRef.current));
             window.dispatchEvent(new Event('settings-change'));
        }
        initialPinchDistanceRef.current = null;
        initialPinchFontSizeRef.current = null;
    };

    const updateHeadersDuringAutoScroll = () => {
        const content = mushafContentRef.current;
        if (!content) return;
        
        // Use the center of the screen
        const x = window.innerWidth / 2;
        const y = window.innerHeight / 2;
        const el = document.elementFromPoint(x, y); 
        if (!el) return;
        const ayahBlock = el.closest('.ayah-text-block');
        if (ayahBlock && ayahBlock.id) {
            const parts = ayahBlock.id.split('-'); 
            if (parts.length === 3) {
                const s = parseInt(parts[1]); const a = parseInt(parts[2]);
                if (s !== currentAyahRef.current.s || a !== currentAyahRef.current.a) {
                    // If there is a highlighted ayah, we only update currentAyah if it's NOT visible
                    // This prevents jumping selection on start and keeps the focus on the selected ayah.
                    const highlightedId = highlightedAyahIdRef.current;
                    if (highlightedId) {
                        const hEl = document.getElementById(highlightedId);
                        if (hEl) {
                            const rect = hEl.getBoundingClientRect();
                            const contentRect = content.getBoundingClientRect();
                            // If highlighted ayah is visible in the content area, don't update header
                            if (rect.top < contentRect.bottom && rect.bottom > contentRect.top) {
                                return;
                            }
                        }
                    }

                    setCurrentAyah({ s, a });
                    currentAyahRef.current = { s, a };
                    if (ayahBlock.getAttribute('data-sajdah') === 'true') {
                        const surahName = (ayahBlock as HTMLElement).dataset.surah || '';
                        const sNum = parseInt((ayahBlock as HTMLElement).dataset.snum || '0', 10);
                        const ayahNum = parseInt((ayahBlock as HTMLElement).dataset.ayah || '0', 10);
                        if(surahName && sNum && ayahNum){
                            handleSajdahVisible(surahName, sNum, ayahNum);
                        }
                    }
                }
            }
        }
    };

    const stopAutoScroll = (showTimer = true) => {
        if (autoScrollFrameRef.current) cancelAnimationFrame(autoScrollFrameRef.current);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        autoScrollFrameRef.current = null;
        timerIntervalRef.current = null;
        autoScrollPausedRef.current = false;

        const newState = { isActive: false, isPaused: false, elapsedTime: autoScrollStateRef.current.elapsedTime };
        autoScrollStateRef.current = newState;
        setAutoScrollState(newState);
        
        if (showTimer) setTimeout(() => setAutoScrollState(p => ({...p, elapsedTime: 0})), 3000);
        else setAutoScrollState(p => ({...p, elapsedTime: 0}));
    };
    
    const startAutoScroll = () => {
        if (!mushafContentRef.current) return;
        
        // Close any open menus/settings first to ensure bars can hide
        setIsAutoScrollSettingsOpen(false);
        setIsFloatingMenuOpen(false);

        // Clear any existing auto-scroll without triggering a full stop state update
        if (autoScrollFrameRef.current) cancelAnimationFrame(autoScrollFrameRef.current);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        autoScrollFrameRef.current = null;
        timerIntervalRef.current = null;
        autoScrollPausedRef.current = false;
        
        // Update state immediately so UI can react (hide bars)
        const initialState = { isActive: true, isPaused: false, elapsedTime: 0 };
        autoScrollStateRef.current = initialState;
        setAutoScrollState(initialState);
        
        // Delay to let layout stabilize after UI might hide
        setTimeout(() => {
            if (!mushafContentRef.current) return;
            
            scrollAccumulatorRef.current = 0;
            autoScrollPausedRef.current = false;
            lastScrollTimeRef.current = performance.now();
            
            let cachedPageHeight = PAGE_HEIGHT_FALLBACK;
            let lastHeightCalcTime = 0;

            const scrollStep = (timestamp: number) => {
                if (!lastScrollTimeRef.current) lastScrollTimeRef.current = timestamp;
                const deltaTime = timestamp - lastScrollTimeRef.current;
                lastScrollTimeRef.current = timestamp;

                if (!autoScrollPausedRef.current && mushafContentRef.current) {
                    const content = mushafContentRef.current;
                    
                    // Recalculate page height every 3 seconds or if it's the first time
                    if (timestamp - lastHeightCalcTime > 3000 || lastHeightCalcTime === 0) {
                        const pages = content.querySelectorAll('.mushaf-page');
                        let totalHeight = 0; let count = 0;
                        pages.forEach((page: any) => { const h = page.offsetHeight; if (h) { totalHeight += h; count++; } });
                        cachedPageHeight = count ? (totalHeight / count) : (content.clientHeight || PAGE_HEIGHT_FALLBACK);
                        lastHeightCalcTime = timestamp;
                    }
                    
                    const minutesPerJuz = parseInt(String(settingsRef.current.scrollMinutes), 10) || 20;
                    const totalPixels = cachedPageHeight * PAGES_PER_JUZ;
                    const totalTimeMs = minutesPerJuz * 60 * 1000;
                    
                    if (totalPixels > 0 && totalTimeMs > 0) {
                        const pixelsPerMs = totalPixels / totalTimeMs;
                        scrollAccumulatorRef.current += pixelsPerMs * deltaTime;
                        
                        if (scrollAccumulatorRef.current >= 1) {
                            const pixelsToMove = Math.floor(scrollAccumulatorRef.current);
                            content.scrollTop += pixelsToMove;
                            scrollAccumulatorRef.current -= pixelsToMove;
                            updateHeadersDuringAutoScroll();
                        }
                    }
                }
                autoScrollFrameRef.current = requestAnimationFrame(scrollStep);
            };

            autoScrollFrameRef.current = requestAnimationFrame(scrollStep);

            timerIntervalRef.current = window.setInterval(() => {
                 if (!autoScrollPausedRef.current) {
                     setAutoScrollState(prev => ({ ...prev, elapsedTime: prev.elapsedTime + 1 }));
                 }
            }, 1000);
        }, 100); // Reduced delay to 100ms for faster start
    };

    const toggleAutoScroll = () => {
        if (autoScrollStateRef.current.isActive) stopAutoScroll();
        else { startAutoScroll(); showToast('تم تفعيل التمرير التلقائي'); }
    };
    const handleScreenTap = () => {
      setIsFloatingMenuOpen(false);
      if (autoScrollStateRef.current.isActive) {
        const newPausedState = !autoScrollStateRef.current.isPaused;
        autoScrollPausedRef.current = newPausedState;
        const newState = { ...autoScrollStateRef.current, isPaused: newPausedState };
        autoScrollStateRef.current = newState;
        setAutoScrollState(newState);
        
        if (initialLandscape) {
            setIsLandscapeUIHidden(!newPausedState);
        }
      } else if (initialLandscape) {
          setIsLandscapeUIHidden(prev => !prev);
      }
    };

    const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 3);
        setPageInput(value);
    };

    const handlePageInputBlur = () => {
        if (pageInput) {
            const pageNum = parseInt(pageInput, 10);
            if (pageNum >= 1 && pageNum <= 604) {
                jumpToPage(pageNum, true);
            }
        }
        setIsPageInputActive(false);
        setPageInput(''); 
    };

    const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handlePageInputBlur();
        }
    };

    const handlePageButtonClick = () => {
        if (initialLandscape) return; // Disable page search in landscape mode
        if (autoScrollState.isActive && !autoScrollState.isPaused) {
            autoScrollPausedRef.current = true;
            setAutoScrollState(p => ({ ...p, isPaused: true }));
        }
        setIsPageInputActive(true);
    };

    const getToolbarStyle = (type: string, defaultBg: string, defaultText: string, defaultBorder: string) => {
        const config = toolbarColors[type];
        let bg = config?.bg || defaultBg || "#ffffff";
        let border = config?.border || defaultBorder || "#e5e7eb";

        // Final safety check: if bg is rgba or transparent, use a solid fallback
        if (!bg || bg.includes('rgba') || bg === 'transparent') {
            bg = currentTheme.barBg || "#ffffff";
        }
        if (!border || border.includes('rgba') || border === 'transparent') {
            border = currentTheme.barBorder?.split(' ')[2] || "#e5e7eb";
        }

        // Apply transparency if enabled (only for main bars)
        let finalBg = bg;
        let backdrop = 'none';
        let finalShadow: string | undefined = undefined;
        if (isTransparentMode && (type === 'top-toolbar' || type === 'bottom-toolbar')) {
            finalBg = 'transparent';
            border = 'transparent';
            finalShadow = 'none';
        }

        return { 
            backgroundColor: finalBg, 
            color: defaultText, 
            borderColor: border, 
            fontFamily: config?.font || 'inherit',
            opacity: 1,
            backdropFilter: backdrop,
            WebkitBackdropFilter: backdrop,
            ...(finalShadow && { boxShadow: finalShadow })
        };
    };

    const handleToastClose = useCallback(() => {
        setToast(prev => ({ ...prev, show: false }));
    }, []);

    useEffect(() => {
        const interceptor = () => {
            if (activeModals.length > 0) {
                const lastModal = activeModals[activeModals.length - 1];
                closeModal(lastModal);
                return true;
            }
            if (tafseerInfo.isOpen) {
                if (tafseerInfo.wasAutoscrolling) {
                    autoScrollPausedRef.current = false;
                    setAutoScrollState(p => ({ ...p, isPaused: false }));
                }
                setTafseerInfo(p => ({ ...p, isOpen: false, wasAutoscrolling: false }));
                return true;
            }
            if (tafseerSelectionInfo.isOpen) {
                if (tafseerSelectionInfo.wasAutoscrolling) {
                    autoScrollPausedRef.current = false;
                    setAutoScrollState(p => ({ ...p, isPaused: false }));
                }
                setTafseerSelectionInfo(p => ({ ...p, isOpen: false, wasAutoscrolling: false }));
                return true;
            }
            if (sajdahCardInfo.show) {
                handleCloseSajdahCard();
                return true;
            }
            if (isFloatingMenuOpen) {
                setIsFloatingMenuOpen(false);
                return true;
            }
            if (isPageInputActive) {
                setIsPageInputActive(false);
                setPageInput('');
                return true;
            }
            return false;
        };

        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [activeModals, tafseerInfo, tafseerSelectionInfo, sajdahCardInfo, isFloatingMenuOpen, isPageInputActive, closeModal, handleCloseSajdahCard]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (isFloatingMenuOpen && 
                floatingMenuRef.current && 
                !floatingMenuRef.current.contains(event.target as Node) &&
                menuButtonRef.current &&
                !menuButtonRef.current.contains(event.target as Node)) {
                setIsFloatingMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isFloatingMenuOpen]);

    if (isLoading) { return <div id="loader" className="fixed inset-0 bg-[#1f2937] text-white z-[9999] flex flex-col items-center justify-center"><div className="text-2xl font-bold mb-4">جاري تحميل المصحف...</div><div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden"><div id="progress-bar" className="h-full bg-green-500 transition-all duration-300" style={{width: `${loadingProgress}%`}}></div></div><div id="loader-status" className="mt-2 text-sm text-gray-400">{loadingStatus}</div></div> }
    
    const surahName = quranData?.surahs[currentAyah.s - 1]?.name.replace('سورة', '').trim() || '';
    const juz = JUZ_MAP.slice().reverse().find(j => (currentAyah.s > j.s) || (currentAyah.s === j.s && currentAyah.a >= j.a))?.j || 1;
    const page = quranData?.surahs[currentAyah.s - 1]?.ayahs.find((ay:any) => ay.numberInSurah === currentAyah.a)?.page || 1;
    const tafseerName = TAFSEERS.find(t => t.id === settings.tafseer)?.name || 'التفسير';

    const renderPlayButtonIcon = () => {
        if (isAudioLoading) return <i className="fa-solid fa-spinner fa-spin text-emerald-500 text-xl"></i>;
        if (isPlaying) return <i className="fa-solid fa-circle-pause text-red-500 text-2xl"></i>;
        return <i className="fa-solid fa-circle-play text-emerald-600 text-2xl"></i>;
    };

    const handleInteractionStart = useCallback(() => {
        if (autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused) {
            autoScrollPausedRef.current = true;
        }
    }, []);

    const handleInteractionEnd = useCallback(() => {
        setTimeout(() => {
             const isAnyModalOpen = activeModals.length > 0 || tafseerInfo.isOpen || tafseerSelectionInfo.isOpen;
             if (!isAnyModalOpen && autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused) {
                 autoScrollPausedRef.current = false;
             }
        }, 100);
    }, [activeModals, tafseerInfo.isOpen, tafseerSelectionInfo.isOpen]);

    const handleVerticalAyahClick = useCallback((s: number, a: number) => {
        setCurrentAyah({ s, a });
        setHighlightedAyahId(`${s}-${a}`);
        localStorage.setItem(`last_pos${modeSuffix}`, JSON.stringify({ s, a }));
    }, [modeSuffix]);

    return (
        <div className={`quran-reader-container ${isPageInputActive ? 'force-ui-visible' : ''} ${isLandscape ? 'landscape-mode' : ''} ${isLandscapeUIHidden ? 'landscape-ui-hidden' : ''} ${isHideToolbarsEnabled && autoScrollState.isActive && !autoScrollState.isPaused ? 'hide-toolbars-autoscroll' : ''} ${!initialLandscape ? 'vertical-page' : ''} ${isTransparentMode ? 'is-transparent-mode' : ''}`} id="app-container" style={{ backgroundColor: settings.bgColor, color: settings.textColor, fontFamily: settings.fontFamily, position: 'relative', height: '100dvh', overflow: 'hidden' } as React.CSSProperties}>
            <QuranHeader 
                isPageInputActive={isPageInputActive}
                pageInputRef={pageInputRef}
                pageInput={pageInput}
                handlePageInputChange={handlePageInputChange}
                handlePageInputBlur={handlePageInputBlur}
                handlePageInputKeyDown={handlePageInputKeyDown}
                handlePageButtonClick={handlePageButtonClick}
                page={page}
                surahName={surahName}
                currentAyah={currentAyah}
                juz={juz}
                openModal={openModal}
                currentTheme={currentTheme}
                getToolbarStyle={getToolbarStyle}
                handlePlayButtonPointerDown={handlePlayButtonPointerDown}
                handlePlayButtonPointerUp={handlePlayButtonPointerUp}
                handlePlayButtonPointerLeave={handlePlayButtonPointerLeave}
                renderPlayButtonIcon={renderPlayButtonIcon}
                reciterToast={reciterToast}
                readingMode={readingMode}
                setReadingMode={setReadingMode}
                isMemorizationMode={localIsMemorizationMode}
                memorizationSettings={localMemorizationSettings}
            />
            <ReadingTimer isVisible={autoScrollState.isPaused || (!autoScrollState.isActive && autoScrollState.elapsedTime > 0)} elapsedTime={autoScrollState.elapsedTime} />
            <div id="mushaf-content" ref={mushafContentRef} onClick={handleScreenTap} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} className="flex-grow overflow-y-auto w-full relative touch-pan-y">
                {readingMode === 'mushaf' ? (
                    <div id="pages-container" className="full-mushaf-container">
                    {[...new Set(visiblePages)].sort((a: number, b: number) => a - b).map(pageNum => {
                        const displaySettings = ayahContextMenu.isOpen ? { ...settings, ...ayahContextMenu.tempSettings } : settings;
                        return (
                            <MushafPage 
                                key={pageNum} 
                                pageNum={pageNum} 
                                pageData={getPageData(pageNum)} 
                                highlightedAyahId={highlightedAyahId} 
                                onAyahClick={handleAyahTextClick} 
                                onVerseClick={handleVerseClick} 
                                onVerseLongPress={handleVerseLongPress} 
                                onAyahLongPress={handleAyahLongPress} 
                                onInteractionStart={handleInteractionStart} 
                                onInteractionEnd={handleInteractionEnd} 
                                settings={displaySettings} 
                                currentTheme={currentTheme}
                            />
                        );
                    })}
                    </div>
                ) : (
                    <VerticalReadingView 
                        quranData={quranData}
                        readingMode={readingMode}
                        settings={settings}
                        currentTheme={currentTheme}
                        currentAyah={currentAyah}
                        onAyahClick={handleVerticalAyahClick}
                        onSettingsChange={setSettings}
                        modeSuffix={modeSuffix}
                    />
                )}
            </div>
            <MarkerNotification isVisible={markerNotification.show} type={markerNotification.type} text={markerNotification.text} />
            
            <AyahContextMenu 
                isOpen={ayahContextMenu.isOpen && !initialLandscape}
                tempSettings={ayahContextMenu.tempSettings}
                ayahContextColorField={ayahContextColorField}
                setAyahContextColorField={setAyahContextColorField}
                setAyahContextMenu={setAyahContextMenu}
                renderCheckerboard={renderCheckerboard}
                PREDEFINED_COLORS={PREDEFINED_COLORS}
                openModal={openModal}
                onSave={() => {
                    const modeSuffix = isLandscapeRef.current ? '_h' : '_v';
                    const newSettings = { ...settings, ...ayahContextMenu.tempSettings };
                    setSettings(newSettings);
                    localStorage.setItem('quran_settings' + modeSuffix, JSON.stringify(newSettings));
                    window.dispatchEvent(new Event('settings-change'));
                    setAyahContextMenu(p => ({ ...p, isOpen: false }));
                    showToast('تم حفظ وتطبيق التغييرات');
                }}
            />

            <QuranFooter 
                currentTheme={currentTheme}
                getToolbarStyle={getToolbarStyle}
                setIsFloatingMenuOpen={setIsFloatingMenuOpen}
                isFloatingMenuOpen={isFloatingMenuOpen}
                floatingMenuRef={floatingMenuRef}
                openModal={openModal}
                menuButtonRef={menuButtonRef}
                handleBookmarkButtonPointerDown={handleBookmarkButtonPointerDown}
                handleBookmarkButtonPointerUp={handleBookmarkButtonPointerUp}
                handleBookmarkButtonPointerLeave={handleBookmarkButtonPointerLeave}
                handleAutoScrollButtonPointerDown={handleAutoScrollButtonPointerDown}
                handleAutoScrollButtonPointerUp={handleAutoScrollButtonPointerUp}
                handleAutoScrollButtonPointerLeave={handleAutoScrollButtonPointerLeave}
                autoScrollState={autoScrollState}
                onBack={onBack}
                initialLandscape={initialLandscape}
                onNavigate={onNavigate}
            />
            {isAutoScrollSettingsOpen && (
            <AutoScrollSettingsModal
                isOpen={isAutoScrollSettingsOpen}
                onClose={() => setIsAutoScrollSettingsOpen(false)}
                onSelectTime={(minutes) => {
                    setSettings(p => ({...p, scrollMinutes: minutes}));
                    localStorage.setItem('quran_settings' + modeSuffix, JSON.stringify({...settings, scrollMinutes: minutes}));
                }}
                currentMinutes={settings.scrollMinutes}
                isLandscape={isLandscape}
            />
        )}
        {activeModals.includes('surah-modal') && <SurahJuzModal type="surah" quranData={quranData} onSelect={(s, a) => { closeModal('surah-modal'); setTimeout(() => jumpToAyah(s, a, true), 0); }} onClose={() => closeModal('surah-modal')} isLandscape={initialLandscape} currentSelection={currentAyah.s} currentAyah={currentAyah} />}
            {activeModals.includes('juz-modal') && <SurahJuzModal type="juz" quranData={quranData} onSelect={(s, a) => { closeModal('juz-modal'); setTimeout(() => jumpToAyah(s, a, true), 0); }} onClose={() => closeModal('juz-modal')} isLandscape={initialLandscape} currentSelection={juz} currentAyah={currentAyah} />}
            {activeModals.includes('bookmarks-modal') && (
                <BookmarksModal 
                    bookmarks={bookmarks} 
                    quranData={quranData} 
                    isLandscape={isLandscape}
                    onSelect={(s, a, isL) => {
                        jumpToAyah(s, a, true);
                    }} 
                    onDelete={deleteBookmark} 
                    onClose={() => {
                        closeModal('bookmarks-modal');
                    }} 
                />
            )}
            <WirdCompletionModal 
                isOpen={showWirdCompleteModal} 
                onClose={() => setShowWirdCompleteModal(false)} 
                onGoToWird={onBack} 
                onGoHome={() => onNavigate('home')}
                onMarkCompleted={handleMarkWirdCompleted}
                currentTheme={currentTheme} 
            />
            {activeModals.includes('search-modal') && <SearchModal quranData={quranData} onSelect={(s,a) => jumpToAyah(s,a, true)} onClose={() => closeModal('search-modal')} isLandscape={isLandscape} initialQuery={initialSearchQuery} readingMode={readingMode} />}
            {activeModals.includes('share-ayah') && <ShareAyahModal isOpen={true} onClose={() => closeModal('share-ayah')} currentAyah={currentAyah} quranData={quranData} currentTheme={currentTheme} readingMode={readingMode} />}
            {activeModals.includes('themes-modal') && <ThemesModal onClose={() => closeModal('themes-modal')} showToast={showToast} isLandscape={isLandscape} readingMode={readingMode} />}
            {activeModals.includes('settings-modal') && <SettingsModal onClose={() => closeModal('settings-modal')} onOpenModal={openModal} showToast={showToast} isLandscape={isLandscape} readingMode={readingMode} />}
            {activeModals.includes('font-modal') && <FontSelectModal isOpen={true} onClose={() => closeModal('font-modal')} isLandscape={isLandscape} currentFontId={settings.fontFamily} onSelect={(id) => {
                const newSettings = { ...settings, fontFamily: id };
                setSettings(newSettings);
                localStorage.setItem('quran_settings' + modeSuffix, JSON.stringify(newSettings));
                window.dispatchEvent(new Event('settings-change'));
                showToast('تم تغيير الخط بنجاح');
                closeModal('font-modal');
            }} />}
            {activeModals.includes('ayah-font-modal') && (
                <FontSelectModal 
                    isOpen={true} 
                    onClose={() => closeModal('ayah-font-modal')} 
                    isLandscape={isLandscape} 
                    currentFontId={ayahContextMenu.tempSettings.fontFamily} 
                    onSelect={(id) => {
                        setAyahContextMenu(prev => ({
                            ...prev,
                            tempSettings: { ...prev.tempSettings, fontFamily: id }
                        }));
                        closeModal('ayah-font-modal');
                    }} 
                />
            )}
            {activeModals.includes('scroll-speed-modal') && <ScrollSpeedModal isOpen={true} onClose={() => closeModal('scroll-speed-modal')} isLandscape={isLandscape} currentMinutes={settings.scrollMinutes} onSelect={(m) => {
                const newSettings = { ...settings, scrollMinutes: m };
                setSettings(newSettings);
                localStorage.setItem('quran_settings' + modeSuffix, JSON.stringify(newSettings));
                window.dispatchEvent(new Event('settings-change'));
                showToast('تم تغيير سرعة التمرير');
                closeModal('scroll-speed-modal');
            }} />}
            {activeModals.includes('reciter-modal') && <ReciterSelectModal onClose={() => closeModal('reciter-modal')} currentReader={localIsMemorizationMode && memorizationSettingsRef.current ? memorizationSettingsRef.current.reader : settings.reader} isLandscape={isLandscape} readersList={localIsMemorizationMode ? MEMORIZATION_READERS : READERS} onSelect={(id) => {
                if (localIsMemorizationMode && memorizationSettingsRef.current) {
                    memorizationSettingsRef.current.reader = id;
                }
                const newSettings = { ...settings, reader: id };
                setSettings(newSettings);
                localStorage.setItem('quran_settings' + modeSuffix, JSON.stringify(newSettings));
                window.dispatchEvent(new Event('settings-change'));
                showToast('تم تغيير القارئ بنجاح');
            }} />}
            {activeModals.includes('toolbar-color-picker-modal') && <ToolbarColorPickerModal onClose={() => closeModal('toolbar-color-picker-modal')} onOpenModal={openModal} showToast={showToast} currentTheme={currentTheme} toolbarColors={toolbarColors} isLandscape={isLandscape} />}
            {activeModals.includes('quran-download-modal') && <QuranDownloadModal onClose={() => closeModal('quran-download-modal')} quranData={quranData} showToast={showToast} isLandscape={isLandscape} />}
            {activeModals.includes('tafsir-download-modal') && <TafsirDownloadModal onClose={() => closeModal('tafsir-download-modal')} quranData={quranData} showToast={showToast} isLandscape={isLandscape} />}
            <TafseerModal 
                isOpen={tafseerInfo.isOpen} 
                isLoading={isTafseerLoading} 
                isLandscape={isLandscape}
                currentTheme={currentTheme}
                title={`${tafseerName} - ${tafseerInfo.surahName.replace('سورة','').trim()} - آية ${toArabic(tafseerInfo.a)}`} 
                text={tafseerInfo.text} 
                onClose={() => {
                    if (tafseerInfo.wasAutoscrolling) {
                        autoScrollPausedRef.current = false;
                        setAutoScrollState(p => ({ ...p, isPaused: false }));
                    }
                    setTafseerInfo(p => ({ ...p, isOpen: false, wasAutoscrolling: false }));
                }} 
            />
            <TafseerModal 
                isOpen={quranMeaningsInfo.isOpen} 
                isLoading={isQuranMeaningsLoading} 
                isLandscape={isLandscape}
                currentTheme={currentTheme}
                title={`معاني القرآن - ${quranMeaningsInfo.surahName.replace('سورة','').trim()} - آية ${toArabic(quranMeaningsInfo.a)}`} 
                text={quranMeaningsInfo.text} 
                onClose={() => {
                    if (quranMeaningsInfo.wasAutoscrolling) {
                        autoScrollPausedRef.current = false;
                        setAutoScrollState(p => ({ ...p, isPaused: false }));
                    }
                    setQuranMeaningsInfo(p => ({ ...p, isOpen: false, wasAutoscrolling: false }));
                }} 
            />
            <AyahActionMenu
                isOpen={ayahActionMenu.isOpen}
                currentTheme={currentTheme}
                onClose={() => {
                    if (ayahActionMenu.wasAutoscrolling) {
                        autoScrollPausedRef.current = false;
                        setAutoScrollState(p => ({ ...p, isPaused: false }));
                    }
                    setAyahActionMenu(p => ({ ...p, isOpen: false, wasAutoscrolling: false }));
                }}
                onTafseer={() => {
                    setAyahActionMenu(p => ({ ...p, isOpen: false }));
                    setIsTafseerLoading(true);
                    setTafseerInfo({ isOpen: true, s: ayahActionMenu.s, a: ayahActionMenu.a, text: '', surahName: ayahActionMenu.surahName, wasAutoscrolling: ayahActionMenu.wasAutoscrolling });
                }}
                onMeanings={() => {
                    setAyahActionMenu(p => ({ ...p, isOpen: false }));
                    setQuranMeaningsInfo({ isOpen: true, s: ayahActionMenu.s, a: ayahActionMenu.a, text: '', surahName: ayahActionMenu.surahName, wasAutoscrolling: ayahActionMenu.wasAutoscrolling });
                }}
            />
            <TafseerSelectionModal 
                isOpen={tafseerSelectionInfo.isOpen} 
                isLandscape={isLandscape}
                onClose={() => {
                    if (tafseerSelectionInfo.wasAutoscrolling) {
                        autoScrollPausedRef.current = false;
                        setAutoScrollState(p => ({ ...p, isPaused: false }));
                    }
                    setTafseerSelectionInfo(p => ({ ...p, isOpen: false, wasAutoscrolling: false }));
                }} 
                onSelect={handleTafseerSelect} 
                currentTafseerId={settings.tafseer} 
            />
            <MushafSelectionModal
                isOpen={activeModals.includes('mushaf-selection-modal')}
                isLandscape={isLandscape}
                onClose={() => closeModal('mushaf-selection-modal')}
                onSelect={handleMushafTypeSelect}
                currentType={useTajweed ? 'tajweed' : 'uthmani'}
            />
            <SajdahCardModal info={sajdahCardInfo} onClose={handleCloseSajdahCard} isLandscape={isLandscape} />
            <ResumeSessionModal 
                isOpen={showResumeModal} 
                onClose={() => setShowResumeModal(false)} 
                onResume={handleResumeSession} 
                onStartNew={handleStartNewFromResume} 
                currentTheme={currentTheme} 
                savedSession={savedSession} 
            />
            <Toast message={toast.message} show={toast.show} onClose={handleToastClose} />
            <TutorialOverlay tutorialId="quran-reader-tutorial" steps={quranTutorialSteps} />
        </div>
    );
};

export default QuranReader;