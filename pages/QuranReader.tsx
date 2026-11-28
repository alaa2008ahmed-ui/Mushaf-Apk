import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo, FC } from 'react';
import {
    shouldShowAppToast,
    showGlobalAppToast,
} from '../utils/notifications/appNotificationSettings';
import './QuranReader.css'; 
import { 
    ReadingMode, 
    JUZ_MAP, 
    SURAH_NAMES_AR, 
    SURAH_NAMES_EN, 
    getTafseerDisplayName,
    resolveNonConflictingWordHighlightColor
} from '../components/QuranReader/constants';
import MushafPage from '../components/QuranReader/MushafPage';
import MadinahMushafView from '../components/QuranReader/MadinahMushafView';
import { getMadinahThemePalette, MadinahShellSideFrames, MushafPageFrameOverlay } from '../components/QuranReader/MadinahFrameSVG';
import VerticalReadingView from '../components/QuranReader/VerticalReadingView';
import { useQuranHabitTracker } from '../hooks/useQuranHabitTracker';
import { useQuranBackInterceptor } from '../hooks/useQuranBackInterceptor';
import QuranReaderModalsLayer from '../components/QuranReader/QuranReaderModalsLayer';
import ReadingTimer from '../components/QuranReader/ReadingTimer';
import MarkerNotification from '../components/QuranReader/MarkerNotification';
import QuranHeader from '../components/QuranReader/QuranHeader';
import QuranFooter from '../components/QuranReader/QuranFooter';
import FloatingMenu from '../components/QuranReader/FloatingMenu';
import AyahContextMenu from '../components/QuranReader/AyahContextMenu';
import {
    getClusterForLanguage,
    saveClusterPosition,
    syncClusterSettings,
    saveMadinahSettings
} from '../utils/quran/quranClusterSync';
import { quranData as quranJsonData } from '../utils/quran/quranData';
import { useTheme, restoreHomeThemeDOMInstantly } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useQuranReaderAudio } from '../hooks/useQuranReaderAudio';
import { useQuranMemorizationRecorder } from '../hooks/useQuranMemorizationRecorder';
import { useQuranVoiceCommands } from '../hooks/useQuranVoiceCommands';
import { useQuranExplanations } from '../hooks/useQuranExplanations';
import { useQuranAutoScroll, AutoScrollState } from '../hooks/useQuranAutoScroll';
import { useQuranScrollAndJump } from '../hooks/useQuranScrollAndJump';
import { useQuranPageInputsAndMenus } from '../hooks/useQuranPageInputsAndMenus';
import { useQuranWirdAndBookmarks } from '../hooks/useQuranWirdAndBookmarks';
import { useQuranThemeAndSettings } from '../hooks/useQuranThemeAndSettings';
import { useQuranReaderModesAndSession } from '../hooks/useQuranReaderModesAndSession';
import { useQuranAyahInteractions } from '../hooks/useQuranAyahInteractions';
import { useQuranModalsAndLifecycle } from '../hooks/useQuranModalsAndLifecycle';
import {
    resolveContextualQuranOpen,
    clearContextualQuranSessionAndRestore,
    recordSmartSurahRead,
    senseAndPropagateColorChoice,
    getVariantDisplayName,
} from '../services/smartEngine/smartEngineService';
import type { ContextualQuranResolution } from '../services/smartEngine/smartEngineTypes';

declare var window: any;

const QuranReader: FC<{ page: string, onBack: () => void, onNavigate: (pageId: string, params?: any) => void, initialLandscape?: boolean, initialSurah?: number, initialAyah?: number, initialPage?: number, isWirdMode?: boolean, isMemorizationMode?: boolean, memorizationSettings?: any, navParams?: any }> = ({ page, onBack, onNavigate, initialLandscape = false, initialSurah, initialAyah, initialPage, isWirdMode = false, isMemorizationMode = false, memorizationSettings, navParams }) => {
    const { setCurrentPage, themeKey, isNightMode, homeThemeVariant } = useTheme();
    const { language, isRTL, formatNumber } = useLanguage();
    const isEn = language === 'en';

    const isPageInputActiveBridgeRef = useRef(false);
    const isBottomPageInputActiveBridgeRef = useRef(false);
    const appContainerRef = useRef<HTMLDivElement>(null);
    const jumpToPageRef = useRef<(pageNum: number, instant?: boolean) => void>(() => {});
    const scrollToAyahRef = useRef<(s: number, a: number, instant?: boolean, retries?: number, isPageJump?: boolean) => void>(() => {});
    const jumpToAyahRef = useRef<(s: number, a: number, instant?: boolean, isPageJump?: boolean) => void>(() => {});
    const autoScrollStateRef = useRef<AutoScrollState>({ isActive: false, isPaused: false, elapsedTime: 0 });
    const autoScrollPausedRef = useRef(false);
    const setAutoScrollStateRef = useRef<React.Dispatch<React.SetStateAction<AutoScrollState>>>(() => {});
    const stopAutoScrollRef = useRef<(showTimer?: boolean) => void>(() => {});
    const stopAudioRef = useRef<() => void>(() => {});
    const playAudioRef = useRef<(s: number, a: number) => void>(() => {});
    const isPlayingBridgeRef = useRef<boolean>(false);
    const openModalRef = useRef<(modalName: string, params?: any) => void>(() => {});
    const handleAyahClickRef = useRef<(s: number, a: number, isExplicitSelection?: boolean) => void>(() => {});
    const isMountedRef = useRef<boolean>(true);
    const memorizationSettingsRef = useRef(memorizationSettings);

    const contextualResolution = useMemo<ContextualQuranResolution>(() => {
        const isNormalQuranOpen =
            !isWirdMode &&
            !isMemorizationMode &&
            !initialSurah &&
            !initialPage &&
            !navParams?.surah &&
            !navParams?.page &&
            !navParams?.fromGlobalSearch &&
            !navParams?.openModal;
        if (!isNormalQuranOpen) return { action: 'none' };
        return resolveContextualQuranOpen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [contextualSessionInfo, setContextualSessionInfo] = useState<ContextualQuranResolution | null>(
        () => (contextualResolution.action === 'contextual' ? contextualResolution : null)
    );
    const [isContextualBannerDismissed, setIsContextualBannerDismissed] = useState(false);

    const effectiveInitialSurah = initialSurah ?? (contextualResolution.action === 'contextual' ? contextualResolution.surah : undefined);
    const effectiveInitialAyah = initialAyah ?? (contextualResolution.action === 'contextual' ? (contextualResolution.ayah || 1) : undefined);
    const effectiveInitialPage = initialPage ?? (contextualResolution.action === 'contextual' ? contextualResolution.page : undefined);

    const {
        isLandscape,
        setIsLandscape,
        isLandscapeRef,
        readingMode,
        setReadingMode,
        readingModeRef,
        prevReadingModeRef,
        modeSuffix,
        getScopedSuffix,
        bookmarkSuffix,
        posSuffix,
        themeSuffix,
        getSavedModePosition,
        visiblePages,
        setVisiblePages,
        currentAyah,
        setCurrentAyah,
        currentAyahRef,
        showResumeModal,
        setShowResumeModal,
        savedSession,
        localIsMemorizationMode,
        localMemorizationSettings,
        isHideMode,
        setIsHideMode,
        showReviewTest,
        setShowReviewTest,
        handleResumeSession,
        handleStartNewFromResume,
    } = useQuranReaderModesAndSession({
        initialLandscape,
        initialSurah: effectiveInitialSurah,
        initialAyah: effectiveInitialAyah,
        initialPage: effectiveInitialPage,
        isWirdMode,
        isMemorizationMode,
        memorizationSettings,
        navParams,
        language,
        setCurrentPage,
        isPageInputActiveBridgeRef,
        isBottomPageInputActiveBridgeRef,
        memorizationSettingsRef,
        jumpToAyahRef,
        playAudioRef,
        isMountedRef,
    });

    const [quranData, setQuranData] = useState(quranJsonData);

    const hasJumpedRef = useRef(false);
    const isJumpingRef = useRef(true);
    const shouldSkipSavePositionRef = useRef<boolean>(
        Boolean(navParams?.fromGlobalSearch || navParams?.skipSavePosition || contextualResolution.action === 'contextual')
    );
    useEffect(() => {
        if (navParams?.fromGlobalSearch || navParams?.skipSavePosition || contextualSessionInfo) {
            shouldSkipSavePositionRef.current = true;
        } else if (navParams === null || navParams === undefined) {
            shouldSkipSavePositionRef.current = false;
        }
    }, [navParams, contextualSessionInfo]);
    const saveFinalLastReadRef = useRef<() => void>(() => {});

    useLayoutEffect(() => {
        return () => {
            saveFinalLastReadRef.current?.();
            restoreHomeThemeDOMInstantly();
        };
    }, []);

    const handleHomeClick = useCallback((targetPage?: string) => {
        try {
            saveFinalLastReadRef.current?.();
        } catch (e) {}

        // الخروج المباشر واللحظي بدون تأخير زمني واستعادة ثيم الرئيسية لحظياً بدون أي وميض
        restoreHomeThemeDOMInstantly();

        if (isWirdMode || navParams?.isWird) {
            onNavigate('daily-wird');
            return;
        }
        if (isMemorizationMode || localIsMemorizationMode || navParams?.isMemorization || navParams?.memorizationSettings) {
            onNavigate('memorization');
            return;
        }
        if (targetPage === 'home') {
            onNavigate('home');
        } else {
            onBack();
        }
    }, [isWirdMode, isMemorizationMode, localIsMemorizationMode, navParams, onBack, onNavigate]);

    const [isLandscapeUIHidden, setIsLandscapeUIHidden] = useState(() => {
        if (initialLandscape) return true;
        // Default to false (visible) to ensure UI is seen in browser preview
        // Only hide if explicitly saved as hidden in localStorage for this mode
        try {
            const saved = localStorage.getItem('is_landscape_ui_hidden' + modeSuffix);
            return saved === 'true';
        } catch (e) {
            return false;
        }
    });
    const isLandscapeUIHiddenRef = useRef(isLandscapeUIHidden);
    useEffect(() => { 
        isLandscapeUIHiddenRef.current = isLandscapeUIHidden; 
        if (isLandscapeRef.current) {
            localStorage.setItem('is_landscape_ui_hidden' + modeSuffix, String(isLandscapeUIHidden));
        }
    }, [isLandscapeUIHidden, modeSuffix]);

    const [isLoading] = useState(false);
    const [loadingStatus] = useState('');
    const [loadingProgress] = useState(100);

    const selectedAyahRef = useRef<{ s: number; a: number; page: number; juz: number } | null>((() => {
        if (effectiveInitialSurah && effectiveInitialAyah) {
            let p = effectiveInitialPage;
            let j = 1;
            const surah = quranJsonData.surahs[effectiveInitialSurah - 1];
            const ayah = surah?.ayahs[(effectiveInitialAyah || 1) - 1];
            if (ayah) {
                p = ayah.page;
                j = ayah.juz;
            }
            return { s: effectiveInitialSurah, a: effectiveInitialAyah, page: p || 1, juz: j || 1 };
        }
        if (isWirdMode || localIsMemorizationMode) {
            if (isWirdMode) {
                try {
                    const savedWird = localStorage.getItem('last_read_ayah_wird');
                    if (savedWird) {
                        const parsed = JSON.parse(savedWird);
                        if (parsed?.isExplicit && parsed?.s && parsed?.a) {
                            return { s: parsed.s, a: parsed.a, page: parsed.page || 1, juz: parsed.juz || 1 };
                        }
                    }
                } catch {}
            }
            return null;
        }
        try {
            const saved = localStorage.getItem('last_read_ayah_global');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed?.isExplicit && parsed?.s && parsed?.a) {
                    return { s: parsed.s, a: parsed.a, page: parsed.page || 1, juz: parsed.juz || 1 };
                }
            }
        } catch {}
        return null;
    })());
    const [highlightedAyahId, setHighlightedAyahId] = useState<string | null>(() => {
        if (effectiveInitialSurah && effectiveInitialAyah) {
            return `ayah-${effectiveInitialSurah}-${effectiveInitialAyah}`;
        }
        if (isWirdMode || localIsMemorizationMode) {
            if (isWirdMode) {
                try {
                    const savedWird = localStorage.getItem('last_read_ayah_wird');
                    if (savedWird) {
                        const parsed = JSON.parse(savedWird);
                        if (parsed?.isExplicit && parsed?.s && parsed?.a) {
                            return `ayah-${parsed.s}-${parsed.a}`;
                        }
                    }
                } catch {}
            }
            return null;
        }
        try {
            const saved = localStorage.getItem('last_read_ayah_global');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed?.isExplicit && parsed?.s && parsed?.a) {
                    return `ayah-${parsed.s}-${parsed.a}`;
                }
            }
        } catch {}
        return null;
    });
    const [isTransparentMode, setIsTransparentMode] = useState(() => localStorage.getItem('transparent_mode' + themeSuffix) === 'true');
    const [isHideToolbarsEnabled, setIsHideToolbarsEnabled] = useState(() => {
        const saved = localStorage.getItem('hide_toolbars_enabled' + themeSuffix);
        return saved !== null ? saved === 'true' : false;
    });
    const isHideToolbarsEnabledRef = useRef(isHideToolbarsEnabled);
    useEffect(() => { isHideToolbarsEnabledRef.current = isHideToolbarsEnabled; }, [isHideToolbarsEnabled]);
    const [lastInteractionType, setLastInteractionType] = useState<'page' | 'ayah'>(() => {
        const saved = localStorage.getItem('last_interaction_type' + themeSuffix);
        return (saved as 'page' | 'ayah') || 'page';
    });

    useEffect(() => {
        localStorage.setItem('last_interaction_type' + themeSuffix, lastInteractionType);
    }, [lastInteractionType, themeSuffix]);

    const [activeModals, setActiveModals] = useState<string[]>([]);
    const [initialSearchQuery, setInitialSearchQuery] = useState<string | undefined>(undefined);
    const [showSajdahCard, setShowSajdahCard] = useState(() => {
        const mode = getScopedSuffix(readingMode, initialLandscape);
        const saved = localStorage.getItem('show_sajdah_card' + mode);
        return saved !== null ? saved === 'true' : true;
    });

    const showToast = useCallback((message: string) => {
        if (!shouldShowAppToast(message)) return;
        showGlobalAppToast(message);
    }, []);

    const {
        isFloatingMenuOpen,
        setIsFloatingMenuOpen,
        floatingMenuInitialView,
        setFloatingMenuInitialView,
        isFloatingMenuOpenRef,
        lastFloatingMenuCloseTimeRef,
        floatingMenuRef,
        menuButtonRef,
        toggleFloatingMenu,
        ayahContextMenu,
        setAyahContextMenu,
        ayahContextColorField,
        setAyahContextColorField,
        PREDEFINED_COLORS,
        renderCheckerboard,
        isPageInputActive,
        setIsPageInputActive,
        pageInput,
        setPageInput,
        isPageInputActiveRef,
        pageInputRef,
        isBottomPageInputActive,
        setIsBottomPageInputActive,
        bottomPageInput,
        setBottomPageInput,
        isBottomPageInputActiveRef,
        bottomPageInputRef,
        lockedMadinahHeight,
        handlePageInputChange,
        handlePageInputBlur,
        handlePageInputKeyDown,
        handlePageButtonClick,
        handleBottomPageInputChange,
        handleBottomPageInputBlur,
        handleBottomPageInputKeyDown,
        handleBottomPageButtonClick,
    } = useQuranPageInputsAndMenus({
        navParams,
        readingMode,
        readingModeRef,
        activeModals,
        appContainerRef,
        autoScrollStateRef,
        autoScrollPausedRef,
        setAutoScrollStateRef,
        jumpToPageRef,
        stopAudioRef,
    });

    useEffect(() => {
        isPageInputActiveBridgeRef.current = isPageInputActive;
        isBottomPageInputActiveBridgeRef.current = isBottomPageInputActive;
    }, [isPageInputActive, isBottomPageInputActive]);

    const {
        loadBookmarksForMode,
        bookmarks,
        setBookmarks,
        saveBookmark,
        deleteBookmark,
        handleBookmarkButtonPointerDown,
        handleBookmarkButtonPointerUp,
        handleBookmarkButtonPointerLeave,
        wirdEndPage,
        showWirdCompleteModal,
        setShowWirdCompleteModal,
        hasShownWirdComplete,
        setHasShownWirdComplete,
        saveWirdPosition,
        handleMarkWirdCompleted,
    } = useQuranWirdAndBookmarks({
        isWirdMode,
        localIsMemorizationMode,
        readingMode,
        readingModeRef,
        initialLandscape,
        isLandscape,
        isLandscapeRef,
        bookmarkSuffix,
        quranData,
        currentAyah,
        currentAyahRef,
        jumpToPageRef,
        showToast,
        onNavigate,
        isEn,
        activeModals,
        openModalRef,
    });

    const {
        settings,
        setSettings,
        settingsRef,
        currentTheme,
        setCurrentTheme,
        toolbarColors,
        setToolbarColors,
        updateSetting,
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
        getToolbarStyle,
        madinahMenuVars,
    } = useQuranThemeAndSettings({
        readingMode,
        readingModeRef,
        initialLandscape,
        isLandscape,
        isLandscapeRef,
        navParams,
        language,
        isWirdMode,
        localIsMemorizationMode,
        isNightMode,
        themeKey,
        homeThemeVariant,
        themeSuffix,
        posSuffix,
        bookmarkSuffix,
        getScopedSuffix,
        initialSurah: effectiveInitialSurah,
        initialPage: effectiveInitialPage,
        currentAyah,
        setCurrentAyah,
        currentAyahRef,
        selectedAyahRef,
        setHighlightedAyahId,
        setVisiblePages,
        getSavedModePosition,
        prevReadingModeRef,
        isJumpingRef,
        hasJumpedRef,
        shouldSkipSavePositionRef,
        isTransparentMode,
        setIsTransparentMode,
        isHideToolbarsEnabledRef,
        setIsHideToolbarsEnabled,
        isLandscapeUIHidden,
        setIsLandscapeUIHidden,
        showSajdahCard,
        setShowSajdahCard,
        activeModals,
        setActiveModals,
        setIsFloatingMenuOpen,
        loadBookmarksForMode,
        setBookmarks,
        setQuranData,
        scrollToAyahRef,
        jumpToAyahRef,
        stopAutoScrollRef,
        stopAudioRef,
        playAudioRef,
        isPlayingRef: isPlayingBridgeRef,
    });
    
    const handleScrollRef = useRef<(() => void) | null>(null);
    const wasAutoscrollingBeforeModal = useRef(false);
    const mushafContentRef = useRef<HTMLDivElement>(null);
    const isMadinahVertical = !navParams?.forceHorizontal && readingMode === 'madinah' && settings.madinahReadingDirection === 'vertical';
    const isMadinahVerticalRef = useRef(isMadinahVertical);
    useEffect(() => { isMadinahVerticalRef.current = isMadinahVertical; }, [isMadinahVertical]);
    const isAnyMenuOpenRef = useRef(false);
    const isSessionFinishedRef = useRef(false);
    const stopRecordedAudioRef = useRef<() => void>(() => {});

    const {
        isPlaying,
        isAudioLoading,
        playingAyah,
        audioProgress,
        isPlayingRef,
        isAudioLoadingRef,
        currentRepeatCountRef,
        rangeRepeatCountRef,
        stopAudio,
        playAudio,
        playSingleAyah,
    } = useQuranReaderAudio({
        quranData,
        readingMode,
        reader: settings.reader,
        ayahRepeatCount: settings.ayahRepeatCount || 1,
        localIsMemorizationMode,
        memorizationSettingsRef,
        isWirdMode,
        currentAyah,
        setCurrentAyah,
        setHighlightedAyahId,
        saveWirdPosition,
        scrollToAyahRef,
        showToast,
        isMountedRef,
        isSessionFinishedRef,
        setShowReviewTest,
        handleHomeClick,
        onBack,
        onNavigate,
        stopRecordedAudioRef,
    });

    useEffect(() => {
        stopAudioRef.current = stopAudio;
        playAudioRef.current = playAudio;
        isPlayingBridgeRef.current = isPlaying;
    }, [stopAudio, playAudio, isPlaying]);

    const {
        revealedAyahs,
        setRevealedAyahs,
        tempRevealedAyah,
        setTempRevealedAyah,
        isRecording,
        recordedAudio,
        startRecording,
        stopRecording,
        playRecordedAudio,
        stopRecordedAudio,
    } = useQuranMemorizationRecorder({
        quranData,
        currentAyahRef,
        localMemorizationSettings,
        language,
        showToast,
        stopAudio,
        jumpToAyahRef,
    });

    useEffect(() => {
        stopRecordedAudioRef.current = stopRecordedAudio;
    }, [stopRecordedAudio]);

    useEffect(() => {
        if (localMemorizationSettings?.isReviewMode) {
            setIsHideMode(true);
            setRevealedAyahs([]);
            setTempRevealedAyah(null);
        } else {
            setIsHideMode(false);
            setRevealedAyahs([]);
            setTempRevealedAyah(null);
        }
    }, [localMemorizationSettings?.isReviewMode]);

    const {
        tafseerInfo,
        setTafseerInfo,
        multiTafseerInfo,
        setMultiTafseerInfo,
        tafseerSelectionInfo,
        setTafseerSelectionInfo,
        isTafseerLoading,
        setIsTafseerLoading,
        tafseerCache,
        quranMeaningsInfo,
        setQuranMeaningsInfo,
        isQuranMeaningsLoading,
        setIsQuranMeaningsLoading,
        quranMeaningsCache,
        quranMeaningsMapRef,
        quranTranslationInfo,
        setQuranTranslationInfo,
        isQuranTranslationLoading,
        setIsQuranTranslationLoading,
        quranTranslationCache,
        surahContentModal,
        setSurahContentModal,
        englishTafseerInfo,
        setEnglishTafseerInfo,
        handleAyahNumberLongPress,
        handleTafseerSelect,
        handleZoomAyahCard,
    } = useQuranExplanations({
        quranData,
        page,
        setCurrentPage,
        readingMode,
        readingModeRef,
        settings,
        setSettings,
        isWirdMode,
        localIsMemorizationMode,
        themeSuffix,
        language,
        isEn,
        isLandscapeRef,
        isFloatingMenuOpenRef,
        lastFloatingMenuCloseTimeRef,
        setIsFloatingMenuOpen,
        autoScrollStateRef,
        autoScrollPausedRef,
        setAutoScrollStateRef,
        showToast,
    });

    const {
        autoScrollState,
        setAutoScrollState,
        isAutoScrollSettingsOpen,
        setIsAutoScrollSettingsOpen,
        wasAutoscrollingBeforeAyahContext,
        wasAutoscrollingBeforeBackground,
        isAppBackgroundedRef,
        stopAutoScroll,
        startAutoScroll,
        toggleAutoScroll,
        toggleAutoScrollPause,
        pauseAutoScrollForBackground,
        resumeAutoScrollFromBackground,
        handleAutoScrollButtonPointerDown,
        handleAutoScrollButtonPointerUp,
        handleAutoScrollButtonPointerLeave,
    } = useQuranAutoScroll({
        autoScrollStateRef,
        autoScrollPausedRef,
        setAutoScrollStateRef,
        wasAutoscrollingBeforeModal,
        isAnyMenuOpenRef,
        mushafContentRef,
        settingsRef,
        readingMode,
        readingModeRef,
        isMadinahVertical,
        isLandscape,
        isLandscapeRef,
        isHideToolbarsEnabledRef,
        setIsLandscapeUIHidden,
        setIsFloatingMenuOpen,
        isFloatingMenuOpen,
        activeModals,
        isTafseerOpen: tafseerInfo.isOpen,
        isTafseerSelectionOpen: tafseerSelectionInfo.isOpen,
        isJumpingRef,
        handleScrollRef,
        showToast,
        isEn,
    });

    useEffect(() => {
        stopAutoScrollRef.current = stopAutoScroll;
    }, [stopAutoScroll]);

    const {
        toast,
        handleToastClose,
        reciterToast,
        markerNotification,
        juzNotification,
        setJuzNotification,
        juzTimeoutRef,
        sajdahCardInfo,
        setSajdahCardInfo,
        sajdahCardInfoRef,
        ayahActionMenu,
        setAyahActionMenu,
        instantShareTarget,
        setInstantShareTarget,
        showMarkerNotification,
        showJuzNotification,
        handleSajdahVisible,
        handleCloseSajdahCard,
        handleAyahTextClick,
        handleVerseClick,
        handleVerseLongPress,
        handleAyahLongPress,
        handlePlayButtonPointerDown,
        handlePlayButtonPointerUp,
        handlePlayButtonPointerLeave,
        handleScreenTap,
        handleInteractionStart,
        handleInteractionEnd,
        handleVerticalAyahClick,
    } = useQuranAyahInteractions({
        quranData,
        readingMode,
        readingModeRef,
        isMadinahVerticalRef,
        isLandscapeRef,
        settingsRef,
        readerSetting: settings.reader,
        localIsMemorizationMode,
        memorizationSettingsRef,
        isEn,
        currentAyah,
        currentAyahRef,
        isPlaying,
        isAudioLoading,
        isPlayingRef,
        isAudioLoadingRef,
        stopAudio,
        playAudio,
        showToast,
        isFloatingMenuOpenRef,
        lastFloatingMenuCloseTimeRef,
        setIsFloatingMenuOpen,
        setFloatingMenuInitialView,
        isHideToolbarsEnabledRef,
        setIsLandscapeUIHidden,
        showSajdahCard,
        setAyahContextMenu,
        setAyahContextColorField,
        ayahContextMenuIsOpen: ayahContextMenu.isOpen,
        activeModals,
        tafseerInfoIsOpen: tafseerInfo.isOpen,
        surahContentModalIsOpen: surahContentModal.isOpen,
        tafseerSelectionInfoIsOpen: tafseerSelectionInfo.isOpen,
        setTafseerSelectionInfo,
        autoScrollStateRef,
        autoScrollPausedRef,
        setAutoScrollState,
        wasAutoscrollingBeforeAyahContext,
        wasAutoscrollingBeforeBackground,
        isAppBackgroundedRef,
        toggleAutoScrollPause,
        handleAyahClickRef,
        openModalRef,
    });

    const isAnyMenuOpen = isFloatingMenuOpen ||
                          activeModals.length > 0 ||
                          ayahContextMenu.isOpen ||
                          showWirdCompleteModal ||
                          showResumeModal ||
                          showReviewTest ||
                          isRecording ||
                          tafseerInfo.isOpen ||
                          quranMeaningsInfo.isOpen ||
                          quranTranslationInfo.isOpen ||
                          ayahActionMenu.isOpen ||
                          tafseerSelectionInfo.isOpen ||
                          isAutoScrollSettingsOpen ||
                          sajdahCardInfo.show;
    useEffect(() => { isAnyMenuOpenRef.current = isAnyMenuOpen; }, [isAnyMenuOpen]);

    const {
        pagesMap,
        getPageData,
        madinahVerticalJump,
        showRapidScrollToast,
        lastRapidScrollDetectedTimeRef,
        handleAyahClick,
        scrollToAyah,
        jumpToAyah,
        jumpToPage,
        handleMadinahPageChange,
    } = useQuranScrollAndJump({
        quranData,
        visiblePages,
        setVisiblePages,
        readingMode,
        readingModeRef,
        isMadinahVertical,
        isMadinahVerticalRef,
        mushafContentRef,
        currentAyah,
        setCurrentAyah,
        currentAyahRef,
        selectedAyahRef,
        setHighlightedAyahId,
        shouldSkipSavePositionRef,
        posSuffix,
        isWirdMode,
        localIsMemorizationMode,
        language,
        isLandscapeRef,
        isPlaying,
        autoScrollState,
        autoScrollStateRef,
        stopAudio,
        playAudio,
        showToast,
        showMarkerNotification,
        handleSajdahVisible,
        setJuzNotification,
        juzTimeoutRef,
        isMountedRef,
        isPageInputActiveRef,
        isBottomPageInputActiveRef,
        setActiveModals,
        isHideToolbarsEnabledRef,
        setIsLandscapeUIHidden,
        setLastInteractionType,
        saveWirdPosition,
        wirdEndPage,
        hasShownWirdComplete,
        setHasShownWirdComplete,
        setShowWirdCompleteModal,
        initialSurah: effectiveInitialSurah,
        initialAyah: effectiveInitialAyah,
        initialPage: effectiveInitialPage,
        localMemorizationSettings,
        isJumpingRef,
        hasJumpedRef,
        handleScrollRef,
        scrollToAyahRef,
        jumpToAyahRef,
        jumpToPageRef,
    });

    handleAyahClickRef.current = handleAyahClick;

    // Notify user when an expired contextual Surah session auto-restores their primary Khatma
    useEffect(() => {
        if (contextualResolution.action === 'restored' && contextualResolution.primaryBackup) {
            const b = contextualResolution.primaryBackup;
            const sName = isEn ? (SURAH_NAMES_EN[b.s - 1] || `Surah ${b.s}`) : (SURAH_NAMES_AR[b.s - 1] || '');
            const timer = window.setTimeout(() => {
                showToast(
                    isEn
                        ? `Habit window ended — restored Khatma (${sName} : ${b.a})`
                        : `انتهى وقت السورة المعتادة — تم إرجاعك لختمتك (${sName} : ${b.a})`
                );
            }, 450);
            return () => window.clearTimeout(timer);
        }
    }, [contextualResolution, isEn, showToast]);

    // Record Surah reading habit cleanly after spending >= 4s on a Surah
    useEffect(() => {
        if (isWirdMode || localIsMemorizationMode || contextualSessionInfo) return;
        if (!currentAyah?.s || currentAyah.s < 1 || currentAyah.s > 114) return;
        const timer = window.setTimeout(() => {
            recordSmartSurahRead(currentAyah.s);
        }, 4000);
        return () => window.clearTimeout(timer);
    }, [currentAyah.s, isWirdMode, localIsMemorizationMode, contextualSessionInfo]);

    const handleReturnToPrimaryKhatma = useCallback(() => {
        const restored = clearContextualQuranSessionAndRestore();
        setContextualSessionInfo(null);
        setIsContextualBannerDismissed(true);
        shouldSkipSavePositionRef.current = false;
        if (restored && restored.s) {
            jumpToAyah(restored.s, restored.a || 1, false);
            const sName = isEn ? (SURAH_NAMES_EN[restored.s - 1] || `Surah ${restored.s}`) : (SURAH_NAMES_AR[restored.s - 1] || '');
            showToast(isEn ? `Returned to your Khatma (${sName})` : `تمت العودة لختمتك (${sName})`);
        }
    }, [jumpToAyah, isEn, showToast]);

    const surahName = isEn ? (SURAH_NAMES_EN[currentAyah.s - 1] || `Surah ${currentAyah.s}`) : (SURAH_NAMES_AR[currentAyah.s - 1] || '');
    const juz = JUZ_MAP.slice().reverse().find(j => (currentAyah.s > j.s) || (currentAyah.s === j.s && currentAyah.a >= j.a))?.j || 1;
    const curSurahData = quranData?.surahs[currentAyah.s - 1];
    const indexedCurAyah = curSurahData?.ayahs?.[currentAyah.a - 1];
    const currentPageNumber =
        (indexedCurAyah?.numberInSurah === currentAyah.a
            ? indexedCurAyah.page
            : curSurahData?.ayahs.find((ay: any) => ay.numberInSurah === currentAyah.a)?.page) || 1;
    const tafseerName = getTafseerDisplayName(settings.tafseer || 'ar.jalalayn', isEn ? 'en' : 'ar');

    const {
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
    } = useQuranModalsAndLifecycle({
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
        initialPage: effectiveInitialPage,
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
        tafseerInfoIsOpen: tafseerInfo.isOpen,
        tafseerSelectionInfoIsOpen: tafseerSelectionInfo.isOpen,
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
    });

    useEffect(() => {
        openModalRef.current = openModal;
    }, [openModal]);

    useEffect(() => {
        if (!ayahContextMenu.isOpen && wasAutoscrollingBeforeAyahContext.current) {
            wasAutoscrollingBeforeAyahContext.current = false;
            if (autoScrollStateRef.current.isActive) {
                autoScrollPausedRef.current = false;
                const newState = { ...autoScrollStateRef.current, isPaused: false };
                autoScrollStateRef.current = newState;
                setAutoScrollState(newState);
            }
        }
    }, [ayahContextMenu.isOpen]);

    useQuranBackInterceptor({
        activeModals,
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
        ayahContextMenu,
        setAyahContextMenu,
        ayahActionMenu,
        setAyahActionMenu,
        tafseerInfo,
        setTafseerInfo,
        multiTafseerInfo,
        setMultiTafseerInfo,
        tafseerSelectionInfo,
        setTafseerSelectionInfo,
        quranMeaningsInfo,
        setQuranMeaningsInfo,
        quranTranslationInfo,
        setQuranTranslationInfo,
        surahContentModal,
        setSurahContentModal,
        englishTafseerInfo,
        setEnglishTafseerInfo,
        isAutoScrollSettingsOpen,
        setIsAutoScrollSettingsOpen,
        isSurahDesignPickerOpen,
        setIsSurahDesignPickerOpen,
        showWirdCompleteModal,
        setShowWirdCompleteModal,
        showResumeModal,
        setShowResumeModal,
        showReviewTest,
        setShowReviewTest,
        isMainGuideOpen,
        setIsMainGuideOpen,
        isSurahJuzGuideOpen,
        setIsSurahJuzGuideOpen,
        closeModal,
        handleCloseSajdahCard,
        onNavigate,
        setIsFloatingMenuOpen,
        isFloatingMenuOpenRef,
        isPageInputActiveRef,
        pageInputRef,
        setIsPageInputActive,
        setPageInput,
        isBottomPageInputActiveRef,
        bottomPageInputRef,
        setIsBottomPageInputActive,
        setBottomPageInput,
        autoScrollPausedRef,
        setAutoScrollState,
        sajdahCardInfoRef,
        readingModeRef,
        saveFinalLastReadRef,
    });

    useQuranVoiceCommands({
        quranData,
        visiblePages,
        currentAyah,
        currentAyahRef,
        readingModeRef,
        isLandscapeRef,
        autoScrollStateRef,
        autoScrollPausedRef,
        wasAutoscrollingBeforeModal,
        lastInteractionType,
        activeModals,
        sajdahCardInfo,
        isWirdMode,
        localIsMemorizationMode,
        language,
        themeSuffix,
        jumpToPage,
        jumpToAyah,
        openModal,
        handleHomeClick,
        onNavigate,
        onBack,
        saveBookmark,
        toggleAutoScroll,
        stopAutoScroll,
        handlePlayButtonPointerDown,
        handlePlayButtonPointerUp,
        handleCloseSajdahCard,
        updateSetting,
        setSettings,
        setActiveModals,
        setAutoScrollState,
        setIsLandscapeUIHidden,
        setIsTafseerLoading,
        setTafseerInfo,
        setMultiTafseerInfo,
        setTafseerSelectionInfo,
        setIsFloatingMenuOpen,
        setIsPageInputActive,
        setAyahContextMenu,
    });

    const isHabitOverlayBlocking =
        isMainGuideOpen ||
        activeModals.length > 0 ||
        isFloatingMenuOpen ||
        tafseerInfo.isOpen ||
        tafseerSelectionInfo.isOpen ||
        quranMeaningsInfo.isOpen ||
        quranTranslationInfo.isOpen ||
        surahContentModal.isOpen ||
        englishTafseerInfo.isOpen ||
        showWirdCompleteModal ||
        showResumeModal ||
        showReviewTest ||
        isAutoScrollSettingsOpen ||
        isSurahDesignPickerOpen ||
        sajdahCardInfo.show;

    useQuranHabitTracker({
        pagesMap,
        mushafContentRef,
        readingMode,
        isMadinahVertical,
        currentAyahRef,
        quranData,
        currentPageNumber,
        isLoading,
        isOverlayBlocking: isHabitOverlayBlocking,
        autoScrollStateRef,
        settingsRef,
        isJumpingRef,
        showRapidScrollToast,
        lastRapidScrollDetectedTimeRef,
    });

    const renderPlayButtonIcon = () => {
        const iconColor = getMadinahThemePalette(currentTheme).bannerText || currentTheme.barText || '#000000';
        if (isAudioLoading) return <i className="fa-solid fa-spinner fa-spin text-xl quran-3d-icon" style={{ color: iconColor }}></i>;
        if (isPlaying) return <i className="fa-solid fa-circle-pause text-2xl quran-3d-icon" style={{ color: '#ef4444' }}></i>;
        return <i className="fa-solid fa-circle-play text-2xl quran-3d-icon" style={{ color: iconColor }}></i>;
    };

    const sortedVisiblePages = useMemo(() => {
        return [...new Set(visiblePages)].sort((a: number, b: number) => a - b);
    }, [visiblePages]);

    const mushafDisplaySettings = useMemo(() => {
        return ayahContextMenu.isOpen ? { ...settings, ...ayahContextMenu.tempSettings } : settings;
    }, [ayahContextMenu.isOpen, ayahContextMenu.tempSettings, settings]);

    if (isLoading) { return <div id="loader" className="fixed inset-0 bg-[#1f2937] text-white z-[9999] flex flex-col items-center justify-center"><div className="text-2xl font-bold mb-4">جاري تحميل المصحف...</div><div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden"><div id="progress-bar" className="h-full bg-green-500 transition-all duration-300" style={{width: `${loadingProgress}%`}}></div></div><div id="loader-status" className="mt-2 text-sm text-gray-400">{loadingStatus}</div></div> }

    const isMushafFramed = readingMode === 'mushaf' && settings.showMushafFrame !== false;

    const headerAndMushaf = (
        <>
            <QuranHeader 
                isPageInputActive={isPageInputActive}
                pageInputRef={pageInputRef}
                pageInput={pageInput}
                handlePageInputChange={handlePageInputChange}
                handlePageInputBlur={handlePageInputBlur}
                handlePageInputKeyDown={handlePageInputKeyDown}
                handlePageButtonClick={handlePageButtonClick}
                page={currentPageNumber}
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
                isWirdMode={isWirdMode}
                isMemorizationMode={localIsMemorizationMode}
                memorizationSettings={localMemorizationSettings}
                setIsFloatingMenuOpen={toggleFloatingMenu}
                isFloatingMenuOpen={isFloatingMenuOpen}
                isAnyMenuOpen={isAnyMenuOpen}
                isMadinahMode={readingMode === 'madinah'}
                madinahFrameDesign={settings.madinahFrameDesign}
                handleBookmarkButtonPointerDown={handleBookmarkButtonPointerDown}
                handleBookmarkButtonPointerUp={handleBookmarkButtonPointerUp}
                handleBookmarkButtonPointerLeave={handleBookmarkButtonPointerLeave}
                isCurrentBookmarked={Array.isArray(bookmarks) && bookmarks.some((b: any) => b.s === currentAyah.s && b.a === currentAyah.a)}
            />
            {readingMode === 'madinah' && isMadinahVertical ? (
                <MadinahMushafView
                    currentPage={currentPageNumber}
                    getPageData={getPageData}
                    highlightedAyahId={highlightedAyahId}
                    onPageChange={handleMadinahPageChange}
                    onAyahClick={handleAyahTextClick}
                    onVerseClick={handleVerseClick}
                    onVerseLongPress={handleVerseLongPress}
                    onAyahLongPress={handleAyahLongPress}
                    onInteractionStart={handleInteractionStart}
                    onInteractionEnd={handleInteractionEnd}
                    settings={mushafDisplaySettings}
                    currentTheme={currentTheme}
                    hideVerses={isHideMode}
                    memorizationSettings={localMemorizationSettings}
                    isPlaying={isPlaying}
                    isRecording={isRecording}
                    revealedAyahs={revealedAyahs}
                    tempRevealedAyah={tempRevealedAyah}
                    audioProgress={audioProgress}
                    isLandscape={isLandscape}
                    isModalOpen={isAnyMenuOpen}
                    isBottomPageInputActive={isBottomPageInputActive}
                    bottomPageInputRef={bottomPageInputRef}
                    bottomPageInput={bottomPageInput}
                    onBottomPageButtonClick={handleBottomPageButtonClick}
                    onBottomPageInputChange={handleBottomPageInputChange}
                    onBottomPageInputBlur={handleBottomPageInputBlur}
                    onBottomPageInputKeyDown={handleBottomPageInputKeyDown}
                    isVerticalMode={true}
                    scrollContainerRef={mushafContentRef}
                    onScrollContainerClick={handleScreenTap}
                    verticalJumpTarget={madinahVerticalJump}
                    autoScrollState={autoScrollState}
                    onAutoScrollButtonPointerDown={handleAutoScrollButtonPointerDown}
                    onAutoScrollButtonPointerUp={handleAutoScrollButtonPointerUp}
                    onAutoScrollButtonPointerLeave={handleAutoScrollButtonPointerLeave}
                />
            ) : (
            <div id="mushaf-content" ref={mushafContentRef} onClick={handleScreenTap} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} className={readingMode === 'madinah' ? 'flex-grow overflow-hidden w-full h-full min-h-0 relative' : 'flex-grow overflow-y-auto w-full relative touch-pan-y'}>
                {readingMode === 'madinah' ? (
                    <MadinahMushafView
                        currentPage={currentPageNumber}
                        getPageData={getPageData}
                        highlightedAyahId={highlightedAyahId}
                        onPageChange={handleMadinahPageChange}
                        onAyahClick={handleAyahTextClick}
                        onVerseClick={handleVerseClick}
                        onVerseLongPress={handleVerseLongPress}
                        onAyahLongPress={handleAyahLongPress}
                        onInteractionStart={handleInteractionStart}
                        onInteractionEnd={handleInteractionEnd}
                        settings={mushafDisplaySettings}
                        currentTheme={currentTheme}
                        hideVerses={isHideMode}
                        memorizationSettings={localMemorizationSettings}
                        isPlaying={isPlaying}
                        isRecording={isRecording}
                        revealedAyahs={revealedAyahs}
                        tempRevealedAyah={tempRevealedAyah}
                        audioProgress={audioProgress}
                        isLandscape={isLandscape}
                        isModalOpen={isAnyMenuOpen}
                        isBottomPageInputActive={isBottomPageInputActive}
                        bottomPageInputRef={bottomPageInputRef}
                        bottomPageInput={bottomPageInput}
                        onBottomPageButtonClick={handleBottomPageButtonClick}
                        onBottomPageInputChange={handleBottomPageInputChange}
                        onBottomPageInputBlur={handleBottomPageInputBlur}
                        onBottomPageInputKeyDown={handleBottomPageInputKeyDown}
                    />
                ) : readingMode === 'mushaf' ? (
                    <div id="pages-container" className="full-mushaf-container">
                    {sortedVisiblePages.map(pageNum => (
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
                                settings={mushafDisplaySettings} 
                                currentTheme={currentTheme}
                                hideVerses={isHideMode}
                                memorizationSettings={localMemorizationSettings}
                                isPlaying={isPlaying}
                                isRecording={isRecording}
                                revealedAyahs={revealedAyahs}
                                tempRevealedAyah={tempRevealedAyah}
                                audioProgress={audioProgress}
                            />
                    ))}
                    </div>
                ) : (
                    <div className="min-h-full w-full">
                        <VerticalReadingView 
                            quranData={quranJsonData}
                            readingMode={readingMode as any}
                            settings={settings}
                            currentTheme={currentTheme}
                            currentAyah={currentAyah}
                            highlightedAyahId={highlightedAyahId}
                            isLandscape={isLandscape}
                            isLandscapeUIHidden={isLandscapeUIHidden}
                            onAyahClick={handleVerticalAyahClick}
                            onNavigateAyah={(s, a) => handleAyahClick(s, a, true)}
                            showToast={showToast}
                            onZoomAyahCard={handleZoomAyahCard}
                            onAyahLongPress={handleAyahLongPress}
                            onVisibleAyahChange={(s, a) => {
                                if (isJumpingRef.current) return;
                                if (s !== currentAyahRef.current.s || a !== currentAyahRef.current.a) {
                                    // Wrap in setTimeout to prevent "Cannot update a component while rendering" error
                                    // as rangeChanged can be called during Virtuoso render
                                    setTimeout(() => {
                                        if (isJumpingRef.current) return;
                                        setCurrentAyah({ s, a });
                                        currentAyahRef.current = { s, a };

                                        if (shouldSkipSavePositionRef.current) return;

                                        if (isWirdMode) {
                                            const orient = isLandscapeRef.current ? 'h' : 'v';
                                            localStorage.setItem(`last_pos${posSuffix}`, JSON.stringify({ s, a, ts: Date.now() }));
                                            saveWirdPosition(s, a);
                                            return;
                                        }

                                        if (localIsMemorizationMode) {
                                            const orient = isLandscapeRef.current ? 'h' : 'v';
                                            localStorage.setItem(`last_pos${posSuffix}`, JSON.stringify({ s, a, ts: Date.now() }));
                                            localStorage.setItem(`last_pos_memorization_${orient}`, JSON.stringify({ s, a, ts: Date.now() }));
                                            localStorage.setItem('last_read_ayah_memorization', JSON.stringify({ s, a, ts: Date.now() }));
                                            return;
                                        }

                                        const curMode = readingModeRef.current;
                                        const orient = isLandscapeRef.current ? 'h' : 'v';
                                        localStorage.setItem(`last_read_pos_${curMode}`, JSON.stringify({ s, a, ts: Date.now() }));
                                        localStorage.setItem(`last_pos_${curMode}_${orient}`, JSON.stringify({ s, a, ts: Date.now() }));
                                        localStorage.setItem(`last_pos${posSuffix}`, JSON.stringify({ s, a, ts: Date.now() })); 
                                        const cluster = getClusterForLanguage(language);
                                        saveClusterPosition(cluster, { s, a, ts: Date.now() }, isLandscapeRef.current);
                                    }, 0);
                                }
                            }}
                            showMarkerNotification={showMarkerNotification}
                            showJuzNotification={showJuzNotification}
                            handleSajdahVisible={handleSajdahVisible}
                            onSettingsChange={setSettings}
                            modeSuffix={themeSuffix}
                            hideVerses={isHideMode}
                            memorizationSettings={localMemorizationSettings}
                            isPlaying={isPlaying}
                            isRecording={isRecording}
                            revealedAyahs={revealedAyahs}
                            tempRevealedAyah={tempRevealedAyah}
                            audioProgress={audioProgress}
                            onAyahNumberLongPress={handleAyahNumberLongPress}
                            onAyahNumberClick={handleAyahNumberLongPress}
                            onInteractionStart={handleInteractionStart}
                            onInteractionEnd={handleInteractionEnd}
                            isAutoScrolling={autoScrollState.isActive && !autoScrollState.isPaused}
                        />
                    </div>
                )}
            </div>
            )}
        </>
    );

    return (
        <div 
            ref={appContainerRef}
            className={`quran-reader-container ${(isPageInputActive || isBottomPageInputActive) ? 'force-ui-visible' : ''} ${isLandscape ? 'landscape-mode' : ''} ${isLandscapeUIHidden && readingMode !== 'madinah' ? 'landscape-ui-hidden' : ''} ${!isLandscape ? 'vertical-page' : ''} ${(isTransparentMode && readingMode !== 'madinah') ? 'is-transparent-mode' : ''} ${(readingMode === 'madinah' || readingMode === 'mushaf' || settings.showPageBorder === false) ? 'no-border' : ''} ${readingMode === 'madinah' ? 'madinah-mode' : ''} ${readingMode === 'mushaf' ? 'mushaf-mode' : ''} ${isMushafFramed ? 'mushaf-framed-page' : ''} ${(isHideToolbarsEnabled && isLandscapeUIHidden && readingMode !== 'madinah') ? 'hide-toolbars-autoscroll' : ''}`} 
            id="app-container" 
            data-quran-theme={currentTheme.id}
            style={{ 
            backgroundColor: settings.bgColor || currentTheme.bg || '#ffffff', 
            color: settings.textColor, 
            fontFamily: settings.fontFamily, 
            position: 'relative', 
            height: (readingMode === 'madinah' && lockedMadinahHeight) ? `${lockedMadinahHeight}px` : '100dvh',
            minHeight: (readingMode === 'madinah' && lockedMadinahHeight) ? `${lockedMadinahHeight}px` : undefined,
            overflow: 'hidden',
            boxSizing: 'border-box',
            '--quran-border-color': currentTheme.barBorder || currentTheme.accent || '#000000',
            ...madinahMenuVars
        } as React.CSSProperties}>
            {readingMode === 'madinah' ? (
                <div className="madinah-shell">
                    <MadinahShellSideFrames currentTheme={currentTheme} frameDesign={settings.madinahFrameDesign} />
                    {headerAndMushaf}
                </div>
            ) : (
                <>
                    {isMushafFramed && (
                        <MushafPageFrameOverlay
                            currentTheme={currentTheme}
                            frameDesign={settings.madinahFrameDesign}
                        />
                    )}
                    {headerAndMushaf}
                </>
            )}
            <FloatingMenu 
                page={page}
                isFloatingMenuOpen={isFloatingMenuOpen}
                floatingMenuRef={floatingMenuRef}
                openModal={openModal}
                setIsFloatingMenuOpen={setIsFloatingMenuOpen}
                currentTheme={currentTheme}
                isLandscape={isLandscape}
                onNavigate={onNavigate}
                readingMode={readingMode}
                setReadingMode={setReadingMode}
                showToast={showToast}
                isWirdMode={isWirdMode}
                isMemorizationMode={localIsMemorizationMode}
                settings={settings}
                updateSetting={updateSetting}
                bookmarks={bookmarks}
                deleteBookmark={deleteBookmark}
                onSaveBookmark={saveBookmark}
                jumpToAyah={jumpToAyah}
                initialView={floatingMenuInitialView}
                onOpenMainGuide={!isLandscape ? () => setIsMainGuideOpen(true) : undefined}
            />
            <ReadingTimer
                isVisible={autoScrollState.isPaused || (!autoScrollState.isActive && autoScrollState.elapsedTime > 0)}
                elapsedTime={autoScrollState.elapsedTime}
                currentTheme={currentTheme}
                isEn={isEn || readingMode === 'translation'}
            />
            <MarkerNotification isVisible={markerNotification.show} type={markerNotification.type} text={markerNotification.text} currentTheme={currentTheme} />
            
            {ayahContextMenu.isOpen && ayahContextMenu.isCustomizing && (
            <AyahContextMenu 
                isOpen={true}
                tempSettings={ayahContextMenu.tempSettings}
                ayahContextColorField={ayahContextColorField}
                setAyahContextColorField={setAyahContextColorField}
                setAyahContextMenu={setAyahContextMenu}
                onTempSettingsChange={(newSettings, fieldChanged) => {
                    setSettings(prev => {
                        const updated = { ...prev, ...newSettings };
                        if (
                            updated.wordHighlightEnabled &&
                            (fieldChanged === 'highlightTextColor' || 'highlightTextColor' in newSettings) &&
                            updated.wordHighlightColor &&
                            updated.wordHighlightColor !== 'auto'
                        ) {
                            const effectiveAyahHighlightColor =
                                updated.highlightTextColor || currentTheme?.highlightText || currentTheme?.accent;
                            const resolvedWordColor = resolveNonConflictingWordHighlightColor(
                                effectiveAyahHighlightColor,
                                updated.wordHighlightColor
                            );
                            if (resolvedWordColor !== updated.wordHighlightColor) {
                                updated.wordHighlightColor = resolvedWordColor;
                            }
                        }
                        if (!isWirdMode && !localIsMemorizationMode) {
                            if (readingMode === 'madinah') {
                                saveMadinahSettings(updated, { markCustomColors: true, isLandscape: isLandscapeRef.current });
                            } else {
                                localStorage.setItem('quran_settings' + themeSuffix, JSON.stringify(updated));
                                const cluster = getClusterForLanguage(language);
                                syncClusterSettings(cluster, updated, isLandscapeRef.current, { markCustomColors: true, readingMode });
                            }
                        } else {
                            localStorage.setItem('quran_settings' + themeSuffix, JSON.stringify(updated));
                            window.dispatchEvent(new Event('settings-change'));
                        }
                        return updated;
                    });
                    if (fieldChanged === 'textColor') {
                        showToast(isEn ? 'Text color updated' : 'تم تغيير لون النص');
                    } else if (fieldChanged === 'bgColor') {
                        showToast(isEn ? 'Background color updated' : 'تم تغيير لون الخلفية');
                    } else if (fieldChanged === 'highlightTextColor') {
                        const propRes = newSettings.highlightTextColor
                            ? senseAndPropagateColorChoice('custom_color', newSettings.highlightTextColor)
                            : { propagated: false, variant: null };
                        if (propRes.propagated && propRes.variant) {
                            showToast(
                                isEn
                                    ? `Highlight updated • Synced (${getVariantDisplayName(propRes.variant, true)}) across app`
                                    : `تم تغيير التحديد وتعميم الطابع (${getVariantDisplayName(propRes.variant, false)})`
                            );
                        } else {
                            showToast(isEn ? 'Highlight color updated' : 'تم تغيير لون التحديد');
                        }
                    }
                }}
                renderCheckerboard={renderCheckerboard}
                PREDEFINED_COLORS={PREDEFINED_COLORS}
                currentTheme={currentTheme}
                isLandscape={isLandscape}
            />
            )}

            {readingMode !== 'madinah' && (
            <QuranFooter 
                currentTheme={currentTheme}
                getToolbarStyle={getToolbarStyle}
                setIsFloatingMenuOpen={setIsFloatingMenuOpen}
                isFloatingMenuOpen={isFloatingMenuOpen}
                isAnyMenuOpen={isAnyMenuOpen}
                hideShareButton={(readingMode !== 'mushaf' && !(isEn && readingMode === 'translation')) || isLandscape}
                hideAutoScrollButton={false}
                openModal={openModal}
                menuButtonRef={menuButtonRef}
                handleBookmarkButtonPointerDown={handleBookmarkButtonPointerDown}
                handleBookmarkButtonPointerUp={handleBookmarkButtonPointerUp}
                handleBookmarkButtonPointerLeave={handleBookmarkButtonPointerLeave}
                handleAutoScrollButtonPointerDown={handleAutoScrollButtonPointerDown}
                handleAutoScrollButtonPointerUp={handleAutoScrollButtonPointerUp}
                handleAutoScrollButtonPointerLeave={handleAutoScrollButtonPointerLeave}
                autoScrollState={autoScrollState}
                onBack={handleHomeClick}
                isEn={isEn}
                madinahFrameDesign={settings.madinahFrameDesign}
                isCurrentBookmarked={Array.isArray(bookmarks) && bookmarks.some((b: any) => b.s === currentAyah.s && b.a === currentAyah.a)}
            />
            )}
            <QuranReaderModalsLayer
                isAutoScrollSettingsOpen={isAutoScrollSettingsOpen}
                setIsAutoScrollSettingsOpen={setIsAutoScrollSettingsOpen}
                settings={settings}
                setSettings={setSettings}
                isWirdMode={isWirdMode}
                localIsMemorizationMode={localIsMemorizationMode}
                readingMode={readingMode}
                themeSuffix={themeSuffix}
                language={language}
                isLandscape={isLandscape}
                isLandscapeRef={isLandscapeRef}
                isEn={isEn}
                showToast={showToast}
                currentTheme={currentTheme}
                showRapidScrollToast={showRapidScrollToast}
                activeModals={activeModals}
                closeModal={closeModal}
                openModal={openModal}
                modalParams={modalParams}
                quranData={quranData}
                jumpToAyah={jumpToAyah}
                currentAyah={currentAyah}
                setCurrentAyah={setCurrentAyah}
                currentAyahRef={currentAyahRef}
                setIsSurahJuzGuideOpen={setIsSurahJuzGuideOpen}
                isSurahJuzGuideOpen={isSurahJuzGuideOpen}
                bookmarks={bookmarks}
                deleteBookmark={deleteBookmark}
                showWirdCompleteModal={showWirdCompleteModal}
                setShowWirdCompleteModal={setShowWirdCompleteModal}
                handleMarkWirdCompleted={handleMarkWirdCompleted}
                initialSearchQuery={initialSearchQuery}
                instantShareTarget={instantShareTarget}
                setInstantShareTarget={setInstantShareTarget}
                isSurahDesignPickerOpen={isSurahDesignPickerOpen}
                setIsSurahDesignPickerOpen={setIsSurahDesignPickerOpen}
                localMemorizationSettings={localMemorizationSettings}
                memorizationSettingsRef={memorizationSettingsRef}
                isPlaying={isPlaying}
                stopAudio={stopAudio}
                playAudio={playAudio}
                playSingleAyah={playSingleAyah}
                playingAyah={playingAyah}
                shouldSkipSavePositionRef={shouldSkipSavePositionRef}
                tafseerInfo={tafseerInfo}
                setTafseerInfo={setTafseerInfo}
                isTafseerLoading={isTafseerLoading}
                setIsTafseerLoading={setIsTafseerLoading}
                tafseerName={tafseerName}
                multiTafseerInfo={multiTafseerInfo}
                setMultiTafseerInfo={setMultiTafseerInfo}
                quranMeaningsInfo={quranMeaningsInfo}
                setQuranMeaningsInfo={setQuranMeaningsInfo}
                isQuranMeaningsLoading={isQuranMeaningsLoading}
                setIsQuranMeaningsLoading={setIsQuranMeaningsLoading}
                quranTranslationInfo={quranTranslationInfo}
                setQuranTranslationInfo={setQuranTranslationInfo}
                isQuranTranslationLoading={isQuranTranslationLoading}
                setIsQuranTranslationLoading={setIsQuranTranslationLoading}
                englishTafseerInfo={englishTafseerInfo}
                setEnglishTafseerInfo={setEnglishTafseerInfo}
                ayahActionMenu={ayahActionMenu}
                setAyahActionMenu={setAyahActionMenu}
                surahContentModal={surahContentModal}
                setSurahContentModal={setSurahContentModal}
                waqfGuideInfo={waqfGuideInfo}
                setWaqfGuideInfo={setWaqfGuideInfo}
                setIsFloatingMenuOpen={setIsFloatingMenuOpen}
                mutashabihatInfo={mutashabihatInfo}
                setMutashabihatInfo={setMutashabihatInfo}
                asbabNuzulInfo={asbabNuzulInfo}
                setAsbabNuzulInfo={setAsbabNuzulInfo}
                irabInfo={irabInfo}
                setIrabInfo={setIrabInfo}
                isThematicEncyclopediaOpen={isThematicEncyclopediaOpen}
                thematicEncyclopediaInfo={thematicEncyclopediaInfo}
                setThematicEncyclopediaInfo={setThematicEncyclopediaInfo}
                tafseerSelectionInfo={tafseerSelectionInfo}
                setTafseerSelectionInfo={setTafseerSelectionInfo}
                handleTafseerSelect={handleTafseerSelect}
                sajdahCardInfo={sajdahCardInfo}
                handleCloseSajdahCard={handleCloseSajdahCard}
                showResumeModal={showResumeModal}
                setShowResumeModal={setShowResumeModal}
                savedSession={savedSession}
                handleResumeSession={handleResumeSession}
                handleStartNewFromResume={handleStartNewFromResume}
                juzNotification={juzNotification}
                toast={toast}
                handleToastClose={handleToastClose}
                isHideMode={isHideMode}
                setIsHideMode={setIsHideMode}
                showReviewTest={showReviewTest}
                setShowReviewTest={setShowReviewTest}
                isRecording={isRecording}
                stopRecording={stopRecording}
                startRecording={startRecording}
                recordedAudio={recordedAudio}
                playRecordedAudio={playRecordedAudio}
                isMainGuideOpen={isMainGuideOpen}
                handleCloseMainGuide={handleCloseMainGuide}
                handleMainGuideStepChange={handleMainGuideStepChange}
                isMadinahVertical={isMadinahVertical}
                isLoading={isLoading}
                isAnyMenuOpen={isAnyMenuOpen}
                isPageInputActive={isPageInputActive}
                isBottomPageInputActive={isBottomPageInputActive}
                autoScrollState={autoScrollState}
                setAutoScrollState={setAutoScrollState}
                autoScrollPausedRef={autoScrollPausedRef}
                tafseerCache={tafseerCache}
                quranMeaningsCache={quranMeaningsCache}
                quranMeaningsMapRef={quranMeaningsMapRef}
                quranTranslationCache={quranTranslationCache}
            />

            {/* Smart Contextual Surah Banner (Non-intrusive floating pill with 1-tap return to primary Khatma) */}
            {contextualSessionInfo?.action === 'contextual' &&
                contextualSessionInfo.primaryBackup &&
                !isContextualBannerDismissed &&
                !isLandscapeUIHidden &&
                !isAnyMenuOpen && (
                <div
                    dir={isEn ? 'ltr' : 'rtl'}
                    className="fixed left-1/2 -translate-x-1/2 z-[45] max-w-[92vw] flex items-center gap-2 px-3 py-2 rounded-2xl shadow-lg border backdrop-blur-md transition-all"
                    style={{
                        top: 'calc(var(--app-safe-top, 0px) + 58px)',
                        backgroundColor: currentTheme?.cardBg || '#ffffff',
                        color: currentTheme?.text || '#0f172a',
                        borderColor: currentTheme?.accent || '#d97706',
                    }}
                >
                    <i
                        className="fa-solid fa-wand-magic-sparkles text-xs shrink-0"
                        style={{ color: currentTheme?.accent || '#d97706' }}
                    />
                    <span className="text-[11px] sm:text-xs font-bold truncate max-w-[44vw]">
                        {isEn ? contextualSessionInfo.reasonEn : contextualSessionInfo.reasonAr}
                    </span>
                    <button
                        type="button"
                        onClick={handleReturnToPrimaryKhatma}
                        className="px-2.5 py-1 rounded-xl text-[11px] font-black shrink-0 cursor-pointer active:scale-95 transition-transform"
                        style={{
                            backgroundColor: currentTheme?.accent || '#d97706',
                            color: currentTheme?.accentText || '#ffffff',
                        }}
                    >
                        {isEn
                            ? `Return (${SURAH_NAMES_EN[(contextualSessionInfo.primaryBackup.s || 1) - 1] || ''})`
                            : `عودة للختمة (${SURAH_NAMES_AR[(contextualSessionInfo.primaryBackup.s || 1) - 1] || ''})`}
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsContextualBannerDismissed(true)}
                        className="w-6 h-6 rounded-full flex items-center justify-center opacity-70 hover:opacity-100 cursor-pointer shrink-0"
                        aria-label={isEn ? 'Dismiss' : 'إخفاء'}
                    >
                        <i className="fa-solid fa-times text-[11px]" />
                    </button>
                </div>
            )}

        </div>
    );
};

export default QuranReader;