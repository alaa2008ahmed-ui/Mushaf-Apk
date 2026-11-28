import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import {
    ReadingMode,
    THEMES,
    JUZ_MAP,
    toArabic,
    getCurrentLayoutContext,
    getQuranThemeForLayout,
    getToolbarColorsForTheme,
    syncQuranThemeToStorage,
    getLinkedQuranThemeForHomeVariant,
} from '../components/QuranReader/constants';
import {
    getClusterForLanguage,
    getClusterSettings,
    getMadinahSettings,
} from '../utils/quran/quranClusterSync';
import { resolveReaderSettingsWithTheme } from '../components/QuranReader/QuranReaderInlineModals';
import { getQuranGuideSeen } from '../components/QuranReader/QuranSpotlightGuide';
import { QuranGuideStep } from '../components/QuranReader/quranGuideSteps';
import { markQuranMicroHintUsed } from '../components/QuranReader/QuranMicroHints';
import { preloadQpcAndMadinahStartup } from '../utils/quran/qpcMadinahData';
import type { AutoScrollState } from './useQuranAutoScroll';

interface UseQuranModalsAndLifecycleParams {
    quranData: any;
    readingMode: ReadingMode;
    readingModeRef: React.MutableRefObject<ReadingMode>;
    isLandscape: boolean;
    isLandscapeRef: React.MutableRefObject<boolean>;
    isWirdMode: boolean;
    isMemorizationMode: boolean;
    localIsMemorizationMode: boolean;
    memorizationSettingsRef: React.MutableRefObject<any>;
    isSessionFinishedRef: React.MutableRefObject<boolean>;
    currentRepeatCountRef: React.MutableRefObject<number>;
    rangeRepeatCountRef: React.MutableRefObject<number>;
    navParams?: any;
    themeSuffix: string;
    homeThemeVariant: any;
    language: string;
    initialPage?: number;
    currentPageNumber: number;
    currentAyah: { s: number; a: number };
    currentAyahRef: React.MutableRefObject<{ s: number; a: number }>;
    pagesMap: Map<number, any[]>;
    isLoading: boolean;
    activeModals: string[];
    setActiveModals: React.Dispatch<React.SetStateAction<string[]>>;
    setInitialSearchQuery: React.Dispatch<React.SetStateAction<string | undefined>>;
    isFloatingMenuOpen: boolean;
    isFloatingMenuOpenRef: React.MutableRefObject<boolean>;
    setIsFloatingMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isAutoScrollSettingsOpen: boolean;
    autoScrollStateRef: React.MutableRefObject<AutoScrollState>;
    autoScrollPausedRef: React.MutableRefObject<boolean>;
    setAutoScrollState: React.Dispatch<React.SetStateAction<AutoScrollState>>;
    wasAutoscrollingBeforeModal: React.MutableRefObject<boolean>;
    tafseerInfoIsOpen: boolean;
    tafseerSelectionInfoIsOpen: boolean;
    setTafseerSelectionInfo: React.Dispatch<React.SetStateAction<any>>;
    setSajdahCardInfo: React.Dispatch<React.SetStateAction<any>>;
    stopAudio: () => void;
    pauseAutoScrollForBackground: () => void;
    resumeAutoScrollFromBackground: () => void;
    setCurrentTheme: React.Dispatch<React.SetStateAction<any>>;
    setToolbarColors: React.Dispatch<React.SetStateAction<any>>;
    setSettings: React.Dispatch<React.SetStateAction<any>>;
    showJuzNotification: (text: string) => void;
    isMountedRef: React.MutableRefObject<boolean>;
}

export const useQuranModalsAndLifecycle = ({
    quranData,
    readingMode,
    readingModeRef,
    isLandscape,
    isLandscapeRef,
    isWirdMode,
    isMemorizationMode,
    localIsMemorizationMode,
    memorizationSettingsRef,
    isSessionFinishedRef,
    currentRepeatCountRef,
    rangeRepeatCountRef,
    navParams,
    themeSuffix,
    homeThemeVariant,
    language,
    initialPage,
    currentPageNumber,
    currentAyah,
    currentAyahRef,
    pagesMap,
    isLoading,
    activeModals,
    setActiveModals,
    setInitialSearchQuery,
    isFloatingMenuOpen,
    isFloatingMenuOpenRef,
    setIsFloatingMenuOpen,
    isAutoScrollSettingsOpen,
    autoScrollStateRef,
    autoScrollPausedRef,
    setAutoScrollState,
    wasAutoscrollingBeforeModal,
    tafseerInfoIsOpen,
    tafseerSelectionInfoIsOpen,
    setTafseerSelectionInfo,
    setSajdahCardInfo,
    stopAudio,
    pauseAutoScrollForBackground,
    resumeAutoScrollFromBackground,
    setCurrentTheme,
    setToolbarColors,
    setSettings,
    showJuzNotification,
    isMountedRef,
}: UseQuranModalsAndLifecycleParams) => {
    const [waqfGuideInfo, setWaqfGuideInfo] = useState<{
        isOpen: boolean;
        s: number;
        a: number;
        surahName: string;
        verseText: string;
        openedFromMenu?: boolean;
        openedFromAyahMenu?: boolean;
    }>({
        isOpen: false,
        s: 1,
        a: 1,
        surahName: '',
        verseText: ''
    });

    const [mutashabihatInfo, setMutashabihatInfo] = useState<{
        isOpen: boolean;
        s: number;
        a: number;
        surahName?: string;
        verseText?: string;
        openedFromMenu?: boolean;
        openedFromAyahMenu?: boolean;
    }>({
        isOpen: false,
        s: 1,
        a: 1
    });

    const [asbabNuzulInfo, setAsbabNuzulInfo] = useState<{
        isOpen: boolean;
        s: number;
        a: number;
        surahName: string;
        verseText: string;
        openedFromMenu?: boolean;
        openedFromAyahMenu?: boolean;
    }>({
        isOpen: false,
        s: 1,
        a: 1,
        surahName: '',
        verseText: ''
    });

    const [irabInfo, setIrabInfo] = useState<{
        isOpen: boolean;
        s: number;
        a: number;
        surahName: string;
        verseText: string;
        openedFromMenu?: boolean;
        openedFromAyahMenu?: boolean;
    }>({
        isOpen: false,
        s: 1,
        a: 1,
        surahName: '',
        verseText: ''
    });

    const [thematicEncyclopediaInfo, setThematicEncyclopediaInfo] = useState<{
        isOpen: boolean;
        openedFromMenu?: boolean;
    }>({
        isOpen: false
    });
    const isThematicEncyclopediaOpen = thematicEncyclopediaInfo.isOpen;

    // --- Contextual Guides for Quran Reader & Submenus ---
    const [isMainGuideOpen, setIsMainGuideOpen] = useState(false);
    const [isSurahJuzGuideOpen, setIsSurahJuzGuideOpen] = useState(false);
    const [isSurahDesignPickerOpen, setIsSurahDesignPickerOpen] = useState(false);
    const [modalParams, setModalParams] = useState<any>(null);

    const closeModal = useCallback((modalName: string) => {
        setActiveModals(p => p.filter(m => m !== modalName));
        if (modalName === 'search-modal') {
            setInitialSearchQuery(undefined);
        }
        if (wasAutoscrollingBeforeModal.current) {
            const anyOtherOpen = activeModals.some(m => m !== modalName) || isAutoScrollSettingsOpen || isFloatingMenuOpen || tafseerInfoIsOpen || tafseerSelectionInfoIsOpen;
            if (!anyOtherOpen) {
                autoScrollPausedRef.current = false;
                setAutoScrollState(p => ({ ...p, isPaused: false }));
                wasAutoscrollingBeforeModal.current = false;
            }
        }
    }, [activeModals, isAutoScrollSettingsOpen, isFloatingMenuOpen, tafseerInfoIsOpen, tafseerSelectionInfoIsOpen, setActiveModals, setInitialSearchQuery, wasAutoscrollingBeforeModal, autoScrollPausedRef, setAutoScrollState]);

    const openModal = useCallback((modalName: string, params?: any) => {
        if (modalName === 'share-ayah') {
            markQuranMicroHintUsed(readingModeRef.current, 'share_btn');
        } else if (modalName === 'bookmarks-modal') {
            markQuranMicroHintUsed(readingModeRef.current, 'bookmark_btn');
        } else if (modalName === 'reciter-modal') {
            markQuranMicroHintUsed(readingModeRef.current, 'play_btn');
        }
        stopAudio();
        setIsFloatingMenuOpen(false);
        setModalParams(params);
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
        const wasFromMenu = Boolean(params?.openedFromMenu || isFloatingMenuOpenRef.current);
        const wasFromAyahMenu = Boolean(params?.openedFromAyahMenu);

        if (modalName === 'surah-design-picker') {
            setIsSurahDesignPickerOpen(true);
            return;
        }
        if (modalName === 'waqf-guide-modal') {
            const s = params?.s || currentAyah.s;
            const a = params?.a || currentAyah.a;
            const surahName = params?.surahName || quranData?.surahs?.[s - 1]?.name || '';
            const verseText = params?.verseText || quranData?.surahs?.[s - 1]?.ayahs?.[a - 1]?.text || '';
            setWaqfGuideInfo({ isOpen: true, s, a, surahName, verseText, openedFromMenu: wasFromMenu, openedFromAyahMenu: wasFromAyahMenu });
            return;
        }
        if (modalName === 'mutashabihat-modal') {
            const s = params?.s || currentAyah.s;
            const a = params?.a || currentAyah.a;
            const surahName = params?.surahName || quranData?.surahs?.[s - 1]?.name || '';
            const verseText = params?.verseText || quranData?.surahs?.[s - 1]?.ayahs?.[a - 1]?.text || '';
            setMutashabihatInfo({ isOpen: true, s, a, surahName, verseText, openedFromMenu: wasFromMenu, openedFromAyahMenu: wasFromAyahMenu });
            return;
        }
        if (modalName === 'asbab-nuzul-modal') {
            const s = params?.s || currentAyah.s;
            const a = params?.a || currentAyah.a;
            const surahName = params?.surahName || quranData?.surahs?.[s - 1]?.name || '';
            const verseText = params?.verseText || quranData?.surahs?.[s - 1]?.ayahs?.[a - 1]?.text || '';
            setAsbabNuzulInfo({ isOpen: true, s, a, surahName, verseText, openedFromMenu: wasFromMenu, openedFromAyahMenu: wasFromAyahMenu });
            return;
        }
        if (modalName === 'irab-modal') {
            const s = params?.s || currentAyah.s;
            const a = params?.a || currentAyah.a;
            const surahName = params?.surahName || quranData?.surahs?.[s - 1]?.name || '';
            const verseText = params?.verseText || quranData?.surahs?.[s - 1]?.ayahs?.[a - 1]?.text || '';
            setIrabInfo({ isOpen: true, s, a, surahName, verseText, openedFromMenu: wasFromMenu, openedFromAyahMenu: wasFromAyahMenu });
            return;
        }
        if (modalName === 'thematic-encyclopedia-modal') {
            setThematicEncyclopediaInfo({ isOpen: true, openedFromMenu: wasFromMenu });
            return;
        }
        if (modalName === 'tafseer-selection-modal') {
            setTafseerSelectionInfo((p: any) => ({ ...p, isOpen: true, wasAutoscrolling: wasScrolling }));
        } else if (modalName === 'sajdah-card') {
            setSajdahCardInfo({
                show: true,
                surah: '',
                ayah: 0,
                juz: 0,
                page: 0,
                wasAutoscrolling: wasScrolling,
                wasPlaying: false,
                openedFromMenu: isFloatingMenuOpenRef.current
            });
        } else {
            setActiveModals(p => [...p.filter(m => m !== modalName), modalName]);
        }
    }, [stopAudio, currentAyah, quranData, readingModeRef, setIsFloatingMenuOpen, setInitialSearchQuery, autoScrollStateRef, autoScrollPausedRef, setAutoScrollState, wasAutoscrollingBeforeModal, isFloatingMenuOpenRef, setTafseerSelectionInfo, setSajdahCardInfo, setActiveModals]);

    // 1. Quran page main guide: triggers immediately when page is opened in portrait mode and no other menu/modal is open
    useEffect(() => {
        if (isLandscape) {
            setIsMainGuideOpen(false);
            return;
        }
        const mainGuideKey = readingMode === 'madinah' ? 'madinah_reader' : 'main_reader';
        if (!isWirdMode && !isMemorizationMode && !navParams?.openModal && !getQuranGuideSeen(mainGuideKey)) {
            const anyModalOpen = activeModals.length > 0 || isFloatingMenuOpen || tafseerInfoIsOpen || tafseerSelectionInfoIsOpen;
            if (!anyModalOpen) {
                setIsMainGuideOpen(true);
            }
        }
    }, [activeModals, isFloatingMenuOpen, tafseerInfoIsOpen, tafseerSelectionInfoIsOpen, isWirdMode, isMemorizationMode, navParams?.openModal, isLandscape, readingMode]);

    // 5. Surah & Juz modal guide: triggers only when surah/juz modal is opened in portrait mode
    useEffect(() => {
        if (isLandscape) {
            setIsSurahJuzGuideOpen(false);
            return;
        }
        const isSurahModalOpen = activeModals.includes('surah-modal');
        if (isSurahModalOpen && !getQuranGuideSeen('surah_juz_modal_v2')) {
            const timer = setTimeout(() => {
                setIsSurahJuzGuideOpen(true);
            }, 350);
            return () => clearTimeout(timer);
        } else {
            setIsSurahJuzGuideOpen(false);
        }
    }, [activeModals, isLandscape]);

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, [isMountedRef]);

    // Stop audio & temporarily pause auto-scroll when app is minimized/backgrounded, and resume auto-scroll when restored
    useEffect(() => {
        let resumeFallbackTimer: number | null = null;

        const handleBackgroundPause = () => {
            if (resumeFallbackTimer) {
                clearTimeout(resumeFallbackTimer);
                resumeFallbackTimer = null;
            }
            pauseAutoScrollForBackground();
        };

        const handleNativeForeground = () => {
            if (typeof document !== 'undefined' && document.hidden) {
                if (resumeFallbackTimer) clearTimeout(resumeFallbackTimer);
                resumeFallbackTimer = window.setTimeout(() => {
                    resumeFallbackTimer = null;
                    resumeAutoScrollFromBackground();
                }, 150);
            } else {
                resumeAutoScrollFromBackground();
            }
        };

        const handleVisibilityChangeForAutoScroll = () => {
            if (typeof document !== 'undefined' && (document.visibilityState === 'hidden' || document.hidden)) {
                stopAudio();
                handleBackgroundPause();
            } else {
                if (resumeFallbackTimer) {
                    clearTimeout(resumeFallbackTimer);
                    resumeFallbackTimer = null;
                }
                resumeAutoScrollFromBackground();
            }
        };

        const appStateListener = CapacitorApp.addListener('appStateChange', ({ isActive }) => {
            if (!isActive) {
                stopAudio();
                handleBackgroundPause();
            } else {
                handleNativeForeground();
            }
        });

        const pauseListener = CapacitorApp.addListener('pause', () => {
            stopAudio();
            handleBackgroundPause();
        });

        const resumeListener = CapacitorApp.addListener('resume', () => {
            handleNativeForeground();
        });

        document.addEventListener('visibilitychange', handleVisibilityChangeForAutoScroll);
        window.addEventListener('pagehide', handleBackgroundPause);
        window.addEventListener('pageshow', handleNativeForeground);

        return () => {
            if (resumeFallbackTimer) clearTimeout(resumeFallbackTimer);
            document.removeEventListener('visibilitychange', handleVisibilityChangeForAutoScroll);
            window.removeEventListener('pagehide', handleBackgroundPause);
            window.removeEventListener('pageshow', handleNativeForeground);
            appStateListener.then(l => l.remove());
            pauseListener.then(l => l.remove());
            resumeListener.then(l => l.remove());

            if (localIsMemorizationMode && !isSessionFinishedRef.current) {
                const sessionData = {
                    currentAyah: currentAyahRef.current,
                    settings: memorizationSettingsRef.current,
                    rangeRepeatCount: rangeRepeatCountRef.current,
                    currentRepeatCount: currentRepeatCountRef.current,
                    timestamp: Date.now()
                };
                localStorage.setItem('memorization_session_v1', JSON.stringify(sessionData));
            }
            stopAudio();
        };
    }, [localIsMemorizationMode, stopAudio, pauseAutoScrollForBackground, resumeAutoScrollFromBackground, isSessionFinishedRef, currentAyahRef, memorizationSettingsRef, rangeRepeatCountRef, currentRepeatCountRef]);

    const handledNavParamsRef = useRef<any>(null);

    useEffect(() => {
        if (!navParams || handledNavParamsRef.current === navParams) return;
        handledNavParamsRef.current = navParams;

        const layout = getCurrentLayoutContext(navParams);
        const mode = themeSuffix;
        const activeMode = (navParams?.readingMode || readingMode) as ReadingMode;
        const targetThemeId = getQuranThemeForLayout(layout, mode, activeMode);
        const fallbackThemeId = getLinkedQuranThemeForHomeVariant(homeThemeVariant);
        const theme = THEMES[targetThemeId as keyof typeof THEMES] || THEMES[fallbackThemeId as keyof typeof THEMES] || THEMES['gold'];
        if (theme) {
            syncQuranThemeToStorage(theme, mode, activeMode);
            setCurrentTheme(theme);
            setToolbarColors(getToolbarColorsForTheme(theme));
            const modeBase = activeMode === 'madinah'
                ? getMadinahSettings(isLandscapeRef.current)
                : getClusterSettings(getClusterForLanguage(language), activeMode, isLandscapeRef.current);
            setSettings((prev: any) =>
                resolveReaderSettingsWithTheme({ ...prev, ...(modeBase || {}) }, theme, activeMode, isLandscapeRef.current)
            );
        }

        if (navParams?.openSidebar || navParams?.openFloatingMenu || navParams?.openMenu) {
            setIsFloatingMenuOpen(true);
        }
        if (navParams?.openModal) {
            const timer = setTimeout(() => {
                openModal(navParams.openModal, navParams);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [navParams, openModal]);

    const handleCloseMainGuide = useCallback(() => {
        setIsMainGuideOpen(false);
    }, []);

    const handleMainGuideStepChange = useCallback((stepIndex: number, step: QuranGuideStep) => {
        // Guide steps run dynamically on the currently active page
    }, []);

    useLayoutEffect(() => {
        if (readingMode !== 'madinah') return;
        preloadQpcAndMadinahStartup([currentPageNumber, currentPageNumber - 1, currentPageNumber + 1]);
    }, [readingMode, currentPageNumber]);

    const prevMadinahNotifiedPageRef = useRef<number | null>(null);
    useEffect(() => {
        if (readingMode !== 'madinah') {
            prevMadinahNotifiedPageRef.current = null;
            return;
        }
        if (isLoading || pagesMap.size === 0) return;
        if (prevMadinahNotifiedPageRef.current === null && initialPage && currentPageNumber !== initialPage) return;

        if (prevMadinahNotifiedPageRef.current === currentPageNumber) return;
        prevMadinahNotifiedPageRef.current = currentPageNumber;

        const pageAyahs = pagesMap.get(currentPageNumber);
        if (!pageAyahs || pageAyahs.length === 0) return;

        const startingJuz = JUZ_MAP.find((jEntry) =>
            pageAyahs.some((ay: any) => ay.sNum === jEntry.s && ay.numberInSurah === jEntry.a)
        );
        if (startingJuz && startingJuz.j > 1) {
            showJuzNotification(`بداية الجزء ${toArabic(startingJuz.j)}`);
        }
    }, [readingMode, currentPageNumber, isLoading, pagesMap, initialPage, showJuzNotification]);

    return {
        waqfGuideInfo,
        setWaqfGuideInfo,
        mutashabihatInfo,
        setMutashabihatInfo,
        asbabNuzulInfo,
        setAsbabNuzulInfo,
        irabInfo,
        setIrabInfo,
        thematicEncyclopediaInfo,
        setThematicEncyclopediaInfo,
        isThematicEncyclopediaOpen,
        isMainGuideOpen,
        setIsMainGuideOpen,
        isSurahJuzGuideOpen,
        setIsSurahJuzGuideOpen,
        isSurahDesignPickerOpen,
        setIsSurahDesignPickerOpen,
        modalParams,
        closeModal,
        openModal,
        handleCloseMainGuide,
        handleMainGuideStepChange,
    };
};
