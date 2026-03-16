import React, { useState, useEffect, useRef, useCallback, FC } from 'react';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import './QuranReader.css'; 
import { JUZ_MAP, toArabic, THEMES, TAFSEERS, READERS } from '../components/QuranReader/constants';
import SearchModal from '../components/QuranReader/SearchModal';
import ThemesModal from '../components/QuranReader/ThemesModal';
import SettingsModal from '../components/QuranReader/SettingsModal';
import ToolbarColorPickerModal from '../components/QuranReader/ToolbarColorPickerModal';
import { QuranDownloadModal, TafsirDownloadModal } from '../components/QuranReader/DownloadModals';
import SurahJuzModal from '../components/QuranReader/SurahJuzModal';
import { KeepAwake } from '@capacitor-community/keep-awake';
import BookmarksModal from '../components/QuranReader/BookmarksModal';
import MushafPage from '../components/QuranReader/MushafPage';
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
import quranUthmaniJson from '../data/quran-uthmani.json';
import quranTajweedJson from '../data/quran-tajweed.json';
import { registerBackInterceptor } from '../hooks/useBackButton';

declare var window: any;

const QuranReader: FC<{ onBack: () => void, initialLandscape?: boolean }> = ({ onBack, initialLandscape = false }) => {
    const [isLandscape, setIsLandscape] = useState(initialLandscape);
    const modeSuffix = isLandscape ? '_h' : '_v';

    const [useTajweed, setUseTajweed] = useState(() => localStorage.getItem('use_tajweed_quran' + modeSuffix) === 'true');
    const [quranData, setQuranData] = useState<any>(useTajweed ? quranTajweedJson.data : quranUthmaniJson.data);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState('');
    const [loadingProgress, setLoadingProgress] = useState(100);

    const [visiblePages, setVisiblePages] = useState<number[]>([1, 2, 3]);
    const [currentAyah, setCurrentAyah] = useState<{ s: number; a: number }>({ s: 1, a: 1 });
    const [highlightedAyahId, setHighlightedAyahId] = useState<string | null>(null);

    const [activeModals, setActiveModals] = useState<string[]>([]);
    const [isFloatingMenuOpen, setIsFloatingMenuOpen] = useState(false);
    const [isLandscapeUIHidden, setIsLandscapeUIHidden] = useState(initialLandscape);
    const isLandscapeUIHiddenRef = useRef(false);
    useEffect(() => { isLandscapeUIHiddenRef.current = isLandscapeUIHidden; }, [isLandscapeUIHidden]);
    const isLandscapeRef = useRef(false);
    useEffect(() => { isLandscapeRef.current = isLandscape; }, [isLandscape]);

    // Load settings based on orientation
    useEffect(() => {
        const mode = isLandscape ? '_h' : '_v';
        
        const tajweedSetting = localStorage.getItem('use_tajweed_quran' + mode) === 'true';
        setUseTajweed(tajweedSetting);
        setQuranData(tajweedSetting ? quranTajweedJson.data : quranUthmaniJson.data);

        const savedSettings = localStorage.getItem('quran_settings' + mode);
        const defaultTheme = THEMES['default'];
        const initialSettings = savedSettings ? JSON.parse(savedSettings) : {
            fontSize: 1.7, fontFamily: defaultTheme.font, textColor: defaultTheme.text, bgColor: defaultTheme.bg,
            reader: 'Abu_Bakr_Ash-Shaatree_128kbps', theme: 'default', scrollMinutes: 20, tafseer: 'ar.jalalayn'
        };
        setSettings(initialSettings);

        const themeId = localStorage.getItem('current_theme_id' + mode) || 'default';
        const newTheme = THEMES[themeId as keyof typeof THEMES] || THEMES['default'];
        setCurrentTheme(newTheme);

        const savedToolbarColors = localStorage.getItem('toolbar_colors' + mode);
        if (savedToolbarColors) {
            try {
                setToolbarColors(JSON.parse(savedToolbarColors));
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
                'btn-home': { bg: green, text: white, border: greenBorder },
                'btn-bookmark': { bg: green, text: white, border: greenBorder },
                'btn-bookmarks-list': { bg: green, text: white, border: greenBorder },
                'btn-themes': { bg: green, text: white, border: greenBorder },
                'btn-autoscroll': { bg: purple, text: white, border: purpleBorder },
                'btn-menu': { bg: purple, text: white, border: purpleBorder },
                'btn-search': { bg: purple, text: white, border: purpleBorder }
            });
        }
        setIsTransparentMode(localStorage.getItem('transparent_mode' + mode) === 'true');
    }, [isLandscape]);
    
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
    const [bookmarks, setBookmarks] = useState([]);

    const [sajdahInfo, setSajdahInfo] = useState<{ show: boolean; surah?: string; ayah?: number }>({ show: false });
    const [sajdahCardInfo, setSajdahCardInfo] = useState({ show: false, surah: '', ayah: 0, juz: 0, page: 0, wasAutoscrolling: false, wasPlaying: false });

    const [autoScrollState, setAutoScrollState] = useState({ isActive: false, isPaused: false, elapsedTime: 0 });
    const [showSajdahCard, setShowSajdahCard] = useState(() => {
        const saved = localStorage.getItem('show_sajdah_card');
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
    const [isTransparentMode, setIsTransparentMode] = useState(() => localStorage.getItem('transparent_mode' + (initialLandscape ? '_h' : '_v')) === 'true');

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
        }
        setIsPlaying(false);
        setIsAudioLoading(false);
        setPlayingAyah(null);
    }, []);

    // Stop audio on unmount
    useEffect(() => {
        return () => {
            stopAudio();
        };
    }, [stopAudio]);
    const showMarkerNotification = useCallback((type: 'juz' | 'quarter' | 'sajda' | 'surah', text: string) => {
        setMarkerNotification({ show: true, type, text });
        setTimeout(() => setMarkerNotification(prev => ({ ...prev, show: false })), 2000);
    }, []);

    const handleSajdahVisible = useCallback((surahName: string, sNum: number, ayahNum: number) => {
        if (markerNotification.show || sajdahCardInfoRef.current.show) return;

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

    const playNextAyah = useCallback(() => {
        if (!quranData || !playingAyah) return stopAudio();
        const { s, a } = playingAyah;
        const surah = quranData.surahs[s - 1];
        if (!surah) return stopAudio();
    
        if (a < surah.ayahs.length) {
            const nextAyah = { s, a: a + 1 };
            playAudio(nextAyah.s, nextAyah.a);
        } else {
            stopAudio();
            showToast('انتهت السورة');
        }
    }, [quranData, playingAyah, stopAudio, showToast]);

    const playNextAyahRef = useRef(playNextAyah);
    useEffect(() => { playNextAyahRef.current = playNextAyah; }, [playNextAyah]);

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

        for (let i = 0; i < 10; i++) {
            const ayahNum = startAyah + i;
            if (ayahNum > surah.ayahs.length) break;
            const cacheKey = `${s}:${ayahNum}`;
            if (!audioCacheRef.current[cacheKey]) {
                const surahStr = String(s).padStart(3, '0');
                const ayahStr = String(ayahNum).padStart(3, '0');
                const audioUrl = `https://everyayah.com/data/${settings.reader}/${surahStr}${ayahStr}.mp3`;
                
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
    }, [settings.reader, quranData]);

    const scrollToAyah = useCallback((s: number, a: number, instant: boolean = false) => {
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
        }
    }, []);

    const playAudio = useCallback(async (s: number, a: number) => {
        stopAudio();
        setIsAudioLoading(true);
        setPlayingAyah({ s, a });
        setCurrentAyah({ s, a });
        setHighlightedAyahId(`ayah-${s}-${a}`);
        scrollToAyah(s, a, false);
    
        const cacheKey = `${s}:${a}`;
        let audio: HTMLAudioElement;
    
        if (audioCacheRef.current[cacheKey]) {
            audio = audioCacheRef.current[cacheKey];
            audio.currentTime = 0;
        } else {
            const surahStr = String(s).padStart(3, '0');
            const ayahStr = String(a).padStart(3, '0');
            const audioUrl = `https://everyayah.com/data/${settings.reader}/${surahStr}${ayahStr}.mp3`;
            let audioSrc = audioUrl;

            try {
                if ('caches' in window) {
                    const cache = await caches.open('quran-audio-cache');
                    const cachedResponse = await cache.match(audioUrl);
                    if (cachedResponse) {
                        const blob = await cachedResponse.blob();
                        audioSrc = URL.createObjectURL(blob);
                        showToast(`تشغيل من المحفوظات`);
                    }
                }
            } catch (e) { console.warn("Cache API check failed", e); }
    
            audio = new Audio(audioSrc);
            audio.preload = 'auto';
            audioCacheRef.current[cacheKey] = audio;
        }
    
        currentAudioRef.current = audio;
    
        audio.onplaying = () => { setIsPlaying(true); setIsAudioLoading(false); };
        audio.onpause = () => setIsPlaying(false);
        audio.onwaiting = () => setIsAudioLoading(true);
        audio.onended = () => playNextAyahRef.current();
        audio.onerror = () => {
            showToast('خطأ في تحميل المقطع الصوتي.');
            stopAudio();
            delete audioCacheRef.current[cacheKey];
        };
    
        try {
            await audio.play();
            preloadAudioQueue(s, a + 1);
            manageAudioCache(s, a);
        } catch (error) {
            showToast('فشل تشغيل الصوت.');
            stopAudio();
            delete audioCacheRef.current[cacheKey];
        }
    }, [settings.reader, stopAudio, preloadAudioQueue, manageAudioCache, showToast, scrollToAyah]);

    const closeModal = useCallback((modalName: string) => {
        setActiveModals(p => p.filter(m => m !== modalName));
        if (wasAutoscrollingBeforeModal.current) {
            const anyOtherOpen = activeModals.some(m => m !== modalName);
            if (!anyOtherOpen) {
                autoScrollPausedRef.current = false;
                setAutoScrollState(p => ({ ...p, isPaused: false }));
                wasAutoscrollingBeforeModal.current = false;
            }
        }
    }, [activeModals]);

    const openModal = useCallback((modalName: string) => { 
        stopAudio(); 
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
        const key = isLandscapeRef.current ? 'last_pos_landscape' : 'last_pos';
        localStorage.setItem(key, JSON.stringify({ s, a }));
    }, []);

    const handleAyahTextClick = useCallback((s: number, a: number) => {
        handleAyahClick(s, a);
        
        if (autoScrollStateRef.current.isActive) {
            const newPausedState = !autoScrollStateRef.current.isPaused;
            autoScrollPausedRef.current = newPausedState;
            const newState = { ...autoScrollStateRef.current, isPaused: newPausedState };
            autoScrollStateRef.current = newState;
            setAutoScrollState(newState);
            
            if (isLandscapeRef.current) {
                setIsLandscapeUIHidden(!newPausedState);
            }
        } else if (isLandscapeRef.current) {
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
                if (isLandscapeRef.current) {
                    setIsLandscapeUIHidden(false);
                }
            }
            setIsTafseerLoading(true);
            setTafseerInfo({ isOpen: true, s, a, text: '', surahName: surah.name, wasAutoscrolling });
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

    const toggleAudio = useCallback(() => {
        if (isPlaying || isAudioLoading) stopAudio();
        else if (currentAyah) {
            playAudio(currentAyah.s, currentAyah.a);
            const reciterName = READERS.find(r => r.id === settings.reader)?.name || 'القارئ';
            setReciterToast({ show: true, name: reciterName });
            setTimeout(() => setReciterToast(prev => ({ ...prev, show: false })), 2000);
        }
        else showToast('الرجاء اختيار آية للبدء');
    }, [isPlaying, isAudioLoading, currentAyah, playAudio, stopAudio, settings.reader]);

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

    const handleAutoScrollButtonPointerDown = (e: React.PointerEvent) => {
        e.stopPropagation();
        autoScrollButtonTimerRef.current = window.setTimeout(() => {
            autoScrollButtonTimerRef.current = null;
            setIsAutoScrollSettingsOpen(true);
        }, 500);
    };

    const handleAutoScrollButtonPointerUp = (e: React.PointerEvent) => {
        e.stopPropagation();
        if (autoScrollButtonTimerRef.current) {
            clearTimeout(autoScrollButtonTimerRef.current);
            autoScrollButtonTimerRef.current = null;
            toggleAutoScroll();
        }
    };

    const handleAutoScrollButtonPointerLeave = (e: React.PointerEvent) => {
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
            const mode = isLandscapeRef.current ? '_h' : '_v';
            const themeId = localStorage.getItem('current_theme_id' + mode) || 'default';
            const newTheme = THEMES[themeId as keyof typeof THEMES] || THEMES['default'];
            setCurrentTheme(newTheme);
            
            const savedSettings = localStorage.getItem('quran_settings' + mode);
            if (savedSettings) {
                setSettings(JSON.parse(savedSettings));
            } else {
                setSettings(prev => ({ 
                    ...prev, 
                    bgColor: newTheme.bg, 
                    textColor: newTheme.text, 
                    fontFamily: newTheme.font,
                    highlightTextColor: (newTheme as any).highlightText || newTheme.accent
                }));
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
                    'btn-home': { bg: green, text: white, border: greenBorder },
                    'btn-bookmark': { bg: green, text: white, border: greenBorder },
                    'btn-bookmarks-list': { bg: green, text: white, border: greenBorder },
                    'btn-themes': { bg: green, text: white, border: greenBorder },
                    'btn-autoscroll': { bg: purple, text: white, border: purpleBorder },
                    'btn-menu': { bg: purple, text: white, border: purpleBorder },
                    'btn-search': { bg: purple, text: white, border: purpleBorder }
                });
            }
            setIsTransparentMode(localStorage.getItem('transparent_mode' + mode) === 'true');
        };
        const handleSettingsChange = () => {
            const mode = isLandscapeRef.current ? '_h' : '_v';
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
                    'btn-home': { bg: green, text: white, border: greenBorder },
                    'btn-bookmark': { bg: green, text: white, border: greenBorder },
                    'btn-bookmarks-list': { bg: green, text: white, border: greenBorder },
                    'btn-themes': { bg: green, text: white, border: greenBorder },
                    'btn-autoscroll': { bg: purple, text: white, border: purpleBorder },
                    'btn-menu': { bg: purple, text: white, border: purpleBorder },
                    'btn-search': { bg: purple, text: white, border: purpleBorder }
                });
            }
            
            const savedSajdah = localStorage.getItem('show_sajdah_card');
            setShowSajdahCard(savedSajdah !== null ? savedSajdah === 'true' : true);
            setIsTransparentMode(localStorage.getItem('transparent_mode' + mode) === 'true');
            
            const tajweedSetting = localStorage.getItem('use_tajweed_quran' + mode) === 'true';
            setUseTajweed(tajweedSetting);
            setQuranData(tajweedSetting ? quranTajweedJson.data : quranUthmaniJson.data);
        };
        window.addEventListener('theme-change', handleThemeChange);
        window.addEventListener('settings-change', handleSettingsChange);
        return () => {
            window.removeEventListener('theme-change', handleThemeChange);
            window.removeEventListener('settings-change', handleSettingsChange);
        };
    }, []);

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
            setBookmarks(JSON.parse(localStorage.getItem('quran_bookmarks_list') || '[]'));
        }
    }, [isBookmarksModalOpen]);

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
            const y = contentEl.getBoundingClientRect().top + (contentEl.clientHeight / 2);
            
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

    const hasJumpedRef = useRef(false);
    useEffect(() => {
        if (hasJumpedRef.current) return;
        hasJumpedRef.current = true;
        const key = initialLandscape ? 'last_pos_landscape' : 'last_pos';
        const lastPos = JSON.parse(localStorage.getItem(key) || '{}');
        setTimeout(() => {
            jumpToAyah(lastPos.s || 1, lastPos.a || 1, true);
        }, 100);
    }, [jumpToAyah, initialLandscape]);

    const jumpToPage = useCallback((pageNum: number, instant: boolean = true) => {
        if (!quranData || isNaN(pageNum) || pageNum < 1 || pageNum > 604) return;
        
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

    const [bookmarksFilter, setBookmarksFilter] = useState<boolean | null>(null);

    const saveBookmark = () => { 
        if (!currentAyah) { showToast('اختر آية أولاً'); return; } 
        const stored = JSON.parse(localStorage.getItem('quran_bookmarks_list') || '[]'); 
        const date = new Date(); 
        const newBookmark = { 
            id: Date.now(), 
            s: currentAyah.s, 
            a: currentAyah.a, 
            isLandscape: isLandscapeRef.current,
            date: date.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }), 
            time: date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) 
        }; 
        const newBookmarks = [newBookmark, ...stored]; 
        localStorage.setItem('quran_bookmarks_list', JSON.stringify(newBookmarks)); 
        setBookmarks(newBookmarks); 
        showToast(`تم حفظ الإشارة (${isLandscapeRef.current ? 'أفقي' : 'رأسي'})`); 
    };
    const deleteBookmark = (id:number) => { const newBookmarks = bookmarks.filter((b:any) => b.id !== id); localStorage.setItem('quran_bookmarks_list', JSON.stringify(newBookmarks)); setBookmarks(newBookmarks); };

    const bookmarkButtonTimerRef = useRef<number | null>(null);
    const handleBookmarkButtonPointerDown = () => {
        bookmarkButtonTimerRef.current = window.setTimeout(() => {
            bookmarkButtonTimerRef.current = null;
            setBookmarksFilter(isLandscapeRef.current);
            openModal('bookmarks-modal');
        }, 500);
    };

    const handleBookmarkButtonPointerUp = () => {
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
        
        // Use a point slightly above the center if bars are hidden to avoid jumping
        const centerY = content.getBoundingClientRect().top + (content.clientHeight / 2);
        const el = document.elementFromPoint(window.innerWidth / 2, centerY); 
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
      if (autoScrollStateRef.current.isActive) {
        const newPausedState = !autoScrollStateRef.current.isPaused;
        autoScrollPausedRef.current = newPausedState;
        const newState = { ...autoScrollStateRef.current, isPaused: newPausedState };
        autoScrollStateRef.current = newState;
        setAutoScrollState(newState);
        
        if (isLandscape) {
            setIsLandscapeUIHidden(!newPausedState);
        }
      } else if (isLandscape) {
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
        if (autoScrollState.isActive && !autoScrollState.isPaused) {
            autoScrollPausedRef.current = true;
            setAutoScrollState(p => ({ ...p, isPaused: true }));
        }
        setIsPageInputActive(true);
    };

    const getToolbarStyle = (type: string, defaultBg: string, defaultText: string, defaultBorder: string) => {
        const config = toolbarColors[type];
        if (isTransparentMode && (type === 'top-toolbar' || type === 'bottom-toolbar')) return { backgroundColor: 'transparent', color: defaultText, borderColor: 'transparent', boxShadow: 'none', backdropFilter: 'none', WebkitBackdropFilter: 'none', position: 'fixed' as 'fixed', left: 0, right: 0, zIndex: 50, ...(type === 'top-toolbar' ? { top: 0 } : { bottom: 0 }) };
        if (config) return { backgroundColor: config.bg, color: defaultText, borderColor: config.border, fontFamily: config.font || 'inherit' };
        return { backgroundColor: defaultBg, color: defaultText, borderColor: defaultBorder };
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
        if (isAudioLoading) return <span className="text-emerald-500 font-bold animate-pulse text-xs">جاري..</span>;
        if (isPlaying) return <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg>;
        return <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>;
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

    return (
        <div className={`quran-reader-container ${isPageInputActive ? 'force-ui-visible' : ''} ${isLandscape ? 'landscape-mode' : ''} ${isLandscapeUIHidden ? 'landscape-ui-hidden' : ''}`} id="app-container" style={{ backgroundColor: settings.bgColor, color: settings.textColor, fontFamily: settings.fontFamily, position: 'relative', height: '100dvh', overflow: 'hidden' } as React.CSSProperties}>
            <header id="header" className={`header-default flex-none z-50 flex items-center px-4 justify-between border-b shadow-xl w-full gap-2`} style={getToolbarStyle('top-toolbar', currentTheme.barBg, currentTheme.barText, currentTheme.barBorder)}>
                <button 
                    id="surah-name-header" 
                    onClick={() => openModal('surah-modal')}
                    className="top-bar-text-button" 
                    style={getToolbarStyle('surah', currentTheme.barBg, currentTheme.barText, currentTheme.barBorder)}
                >
                    <span>{surahName} - آية {toArabic(currentAyah.a)}</span>
                </button>
                <button id="juz-number-header" onClick={() => openModal('juz-modal')} className="top-bar-text-button" style={getToolbarStyle('juz', currentTheme.barBg, currentTheme.barText, currentTheme.barBorder)}>الجزء {toArabic(juz)}</button>
                {isPageInputActive ? (
                    <input
                        ref={pageInputRef}
                        id="header-page"
                        type="tel"
                        value={pageInput}
                        onChange={handlePageInputChange}
                        onBlur={handlePageInputBlur}
                        onKeyDown={handlePageInputKeyDown}
                        className="top-bar-text-button"
                        style={getToolbarStyle('page', currentTheme.barBg, currentTheme.barText, currentTheme.barBorder)}
                        placeholder={`ص ${toArabic(page)}`}
                    />
                ) : (
                    <button 
                        id="header-page" 
                        onClick={handlePageButtonClick}
                        className="top-bar-text-button" 
                        style={getToolbarStyle('page', currentTheme.barBg, currentTheme.barText, currentTheme.barBorder)}
                    >
                        ص {toArabic(page)}
                    </button>
                )}
                <div className="relative flex-shrink-0">
                    <button 
                        id="btn-play" 
                        onPointerDown={handlePlayButtonPointerDown}
                        onPointerUp={handlePlayButtonPointerUp}
                        onPointerLeave={handlePlayButtonPointerLeave}
                        className="top-bar-text-button" 
                        style={{...getToolbarStyle('audio', currentTheme.barBg, currentTheme.barText, currentTheme.barBorder), touchAction: 'none'}}
                    >
                        <span id="play-icon-svg">{renderPlayButtonIcon()}</span>
                    </button>
                    {reciterToast.show && (
                        <div className="absolute top-full left-0 mt-2 px-3 py-1 text-xs rounded-lg shadow-lg whitespace-nowrap z-[100] animate-fadeIn font-bold pointer-events-none"
                             style={{ backgroundColor: currentTheme.cardBg, color: currentTheme.cardText, border: `1px solid ${currentTheme.cardBorder}` }}>
                            {reciterToast.name}
                        </div>
                    )}
                </div>
            </header>
            <ReadingTimer isVisible={autoScrollState.isPaused || (!autoScrollState.isActive && autoScrollState.elapsedTime > 0)} elapsedTime={autoScrollState.elapsedTime} />
            <div id="mushaf-content" ref={mushafContentRef} onClick={handleScreenTap} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} className="flex-grow overflow-y-auto w-full relative touch-pan-y" style={isTransparentMode ? { position: 'absolute', top: 0, bottom: 0, height: '100%', zIndex: 0, paddingTop: '80px', paddingBottom: '80px' } : {}}>
                <div id="pages-container" className="full-mushaf-container">
                   {[...new Set(visiblePages)].sort((a: number, b: number) => a - b).map(pageNum => (<MushafPage key={pageNum} pageNum={pageNum} pageData={getPageData(pageNum)} highlightedAyahId={highlightedAyahId} onAyahClick={handleAyahTextClick} onVerseClick={handleVerseClick} onVerseLongPress={handleVerseLongPress} onInteractionStart={handleInteractionStart} onInteractionEnd={handleInteractionEnd} settings={settings} />))}
                </div>
            </div>
            <MarkerNotification isVisible={markerNotification.show} type={markerNotification.type} text={markerNotification.text} />
            <div id="floating-menu" className={isFloatingMenuOpen ? 'open' : ''} ref={floatingMenuRef}>
                 <button onClick={() => { setBookmarksFilter(null); openModal('bookmarks-modal'); setIsFloatingMenuOpen(false); }} className="bottom-bar-button btn-green w-full justify-between mb-2" style={getToolbarStyle('btn-bookmarks-list', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBg)}><span>قائمة الإشارات</span><i className="fa-solid fa-list"></i></button>
                 {!isLandscape && (
                     <button onClick={() => { openModal('search-modal'); setIsFloatingMenuOpen(false); }} className="bottom-bar-button btn-purple w-full justify-between mb-2" style={getToolbarStyle('btn-search', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBg)}><span>البحث</span><i className="fa-solid fa-search"></i></button>
                 )}
                 <button onClick={() => { openModal('themes-modal'); setIsFloatingMenuOpen(false); }} className="bottom-bar-button btn-green w-full justify-between mb-2" style={getToolbarStyle('btn-themes', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBg)}><span>الثيمات</span><i className="fa-solid fa-palette"></i></button>
                 <button onClick={() => { openModal('settings-modal'); setIsFloatingMenuOpen(false); }} className="bottom-bar-button btn-green w-full justify-between" style={getToolbarStyle('btn-settings', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBg)}><span>الإعدادات</span><i className="fa-solid fa-cog"></i></button>
            </div>
            <footer id="bottom-bar" className={`footer-default flex-none border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10 flex justify-around items-center px-1 py-1 w-full`} style={getToolbarStyle('bottom-toolbar', currentTheme.barBg, currentTheme.barText, currentTheme.barBorder)}>
                <button ref={menuButtonRef} id="btn-menu" onClick={() => setIsFloatingMenuOpen(p => !p)} className="bottom-bar-button btn-purple flex-1 mx-1" style={getToolbarStyle('btn-menu', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBg)}><i className="fa-solid fa-bars"></i><span className="hidden sm:inline">القائمة</span></button>
                <button 
                    id="btn-bookmark" 
                    onPointerDown={handleBookmarkButtonPointerDown}
                    onPointerUp={handleBookmarkButtonPointerUp}
                    onPointerLeave={handleBookmarkButtonPointerLeave}
                    className="bottom-bar-button btn-green flex-1 mx-1" 
                    style={{...getToolbarStyle('btn-bookmark', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBg), touchAction: 'none'}}
                >
                    <i className="fa-solid fa-bookmark"></i>
                    <span className="hidden sm:inline">حفظ</span>
                </button>
                <button 
                    id="btn-autoscroll" 
                    onPointerDown={handleAutoScrollButtonPointerDown}
                    onPointerUp={handleAutoScrollButtonPointerUp}
                    onPointerLeave={handleAutoScrollButtonPointerLeave}
                    className="bottom-bar-button btn-purple flex-1 mx-1" 
                    style={{...getToolbarStyle('btn-autoscroll', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBg), touchAction: 'none'}}
                >
                    {autoScrollState.isActive ? <i className="fa-solid fa-pause icon-autoscroll-active"></i> : <i className="fa-solid fa-arrow-down"></i>}
                    <span className="hidden sm:inline">{autoScrollState.isActive ? "إيقاف" : "تمرير"}</span>
                </button>
                <button id="btn-home" onClick={onBack} className="bottom-bar-button btn-green flex-1 mx-1" style={getToolbarStyle('btn-home', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBg)}><i className="fa-solid fa-home"></i><span className="hidden sm:inline">الرئيسية</span></button>
            </footer>
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
        {activeModals.includes('surah-modal') && <SurahJuzModal type="surah" quranData={quranData} onSelect={(s, a) => { closeModal('surah-modal'); setTimeout(() => jumpToAyah(s, a, true), 0); }} onClose={() => closeModal('surah-modal')} isLandscape={isLandscape} currentSelection={currentAyah.s} />}
            {activeModals.includes('juz-modal') && <SurahJuzModal type="juz" quranData={quranData} onSelect={(j: number) => { closeModal('juz-modal'); setTimeout(() => jumpToAyah(JUZ_MAP[j - 1].s, JUZ_MAP[j - 1].a, true), 0); }} onClose={() => closeModal('juz-modal')} isLandscape={isLandscape} currentSelection={juz} />}
            {activeModals.includes('bookmarks-modal') && (
                <BookmarksModal 
                    bookmarks={bookmarks} 
                    quranData={quranData} 
                    filterLandscape={bookmarksFilter}
                    isLandscape={isLandscape}
                    onSelect={(s, a, isL) => {
                        if (isL !== isLandscapeRef.current) {
                            setIsLandscape(isL);
                        }
                        jumpToAyah(s, a, true);
                    }} 
                    onDelete={deleteBookmark} 
                    onClose={() => {
                        closeModal('bookmarks-modal');
                        setBookmarksFilter(null);
                    }} 
                />
            )}
            {activeModals.includes('search-modal') && <SearchModal quranData={quranData} onSelect={(s,a) => jumpToAyah(s,a, true)} onClose={() => closeModal('search-modal')} isLandscape={isLandscape} />}
            {activeModals.includes('themes-modal') && <ThemesModal onClose={() => closeModal('themes-modal')} showToast={showToast} isLandscape={isLandscape} />}
            {activeModals.includes('settings-modal') && <SettingsModal onClose={() => closeModal('settings-modal')} onOpenModal={openModal} showToast={showToast} isLandscape={isLandscape} />}
            {activeModals.includes('font-modal') && <FontSelectModal isOpen={true} onClose={() => closeModal('font-modal')} isLandscape={isLandscape} currentFontId={settings.fontFamily} onSelect={(id) => {
                const newSettings = { ...settings, fontFamily: id };
                setSettings(newSettings);
                localStorage.setItem('quran_settings' + modeSuffix, JSON.stringify(newSettings));
                window.dispatchEvent(new Event('settings-change'));
                showToast('تم تغيير الخط بنجاح');
                closeModal('font-modal');
            }} />}
            {activeModals.includes('scroll-speed-modal') && <ScrollSpeedModal isOpen={true} onClose={() => closeModal('scroll-speed-modal')} isLandscape={isLandscape} currentMinutes={settings.scrollMinutes} onSelect={(m) => {
                const newSettings = { ...settings, scrollMinutes: m };
                setSettings(newSettings);
                localStorage.setItem('quran_settings' + modeSuffix, JSON.stringify(newSettings));
                window.dispatchEvent(new Event('settings-change'));
                showToast('تم تغيير سرعة التمرير');
                closeModal('scroll-speed-modal');
            }} />}
            {activeModals.includes('reciter-modal') && <ReciterSelectModal onClose={() => closeModal('reciter-modal')} currentReader={settings.reader} isLandscape={isLandscape} onSelect={(id) => {
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
            <Toast message={toast.message} show={toast.show} onClose={handleToastClose} />
        </div>
    );
};

export default QuranReader;