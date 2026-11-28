import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    ReadingMode,
    JUZ_MAP,
    toArabic,
    READERS,
    MEMORIZATION_READERS,
    getReadersForMode,
    getValidReaderForMode,
} from '../components/QuranReader/constants';
import {
    getAppNotificationSettings,
    APP_NOTIFICATION_CHANGE_EVENT,
} from '../utils/notifications/appNotificationSettings';
import { getReciterDisplayName } from '../utils/quran/listenQuranTranslations';
import { markQuranMicroHintUsed } from '../components/QuranReader/QuranMicroHints';
import type { AutoScrollState } from './useQuranAutoScroll';

interface UseQuranAyahInteractionsParams {
    quranData: any;
    readingMode: ReadingMode;
    readingModeRef: React.MutableRefObject<ReadingMode>;
    isMadinahVerticalRef: React.MutableRefObject<boolean>;
    isLandscapeRef: React.MutableRefObject<boolean>;
    settingsRef: React.MutableRefObject<any>;
    readerSetting: string;
    localIsMemorizationMode: boolean;
    memorizationSettingsRef: React.MutableRefObject<any>;
    isEn: boolean;
    currentAyah: { s: number; a: number };
    currentAyahRef: React.MutableRefObject<{ s: number; a: number }>;
    isPlaying: boolean;
    isAudioLoading: boolean;
    isPlayingRef: React.MutableRefObject<boolean>;
    isAudioLoadingRef: React.MutableRefObject<boolean>;
    stopAudio: () => void;
    playAudio: (s: number, a: number) => void;
    showToast: (message: string) => void;
    isFloatingMenuOpenRef: React.MutableRefObject<boolean>;
    lastFloatingMenuCloseTimeRef: React.MutableRefObject<number>;
    setIsFloatingMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setFloatingMenuInitialView: React.Dispatch<React.SetStateAction<string>>;
    isHideToolbarsEnabledRef: React.MutableRefObject<boolean>;
    setIsLandscapeUIHidden: React.Dispatch<React.SetStateAction<boolean>>;
    showSajdahCard: boolean;
    setAyahContextMenu: React.Dispatch<React.SetStateAction<any>>;
    setAyahContextColorField: React.Dispatch<React.SetStateAction<'textColor' | 'bgColor' | 'highlightTextColor' | null>>;
    ayahContextMenuIsOpen: boolean;
    activeModals: string[];
    tafseerInfoIsOpen: boolean;
    surahContentModalIsOpen: boolean;
    tafseerSelectionInfoIsOpen: boolean;
    setTafseerSelectionInfo: React.Dispatch<React.SetStateAction<any>>;
    autoScrollStateRef: React.MutableRefObject<AutoScrollState>;
    autoScrollPausedRef: React.MutableRefObject<boolean>;
    setAutoScrollState: React.Dispatch<React.SetStateAction<AutoScrollState>>;
    wasAutoscrollingBeforeAyahContext: React.MutableRefObject<boolean>;
    wasAutoscrollingBeforeBackground: React.MutableRefObject<boolean>;
    isAppBackgroundedRef: React.MutableRefObject<boolean>;
    toggleAutoScrollPause: () => void;
    handleAyahClickRef: React.MutableRefObject<(s: number, a: number, isExplicitSelection?: boolean) => void>;
    openModalRef: React.MutableRefObject<(modalName: string, params?: any) => void>;
}

export const useQuranAyahInteractions = ({
    quranData,
    readingMode,
    readingModeRef,
    isMadinahVerticalRef,
    isLandscapeRef,
    settingsRef,
    readerSetting,
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
    ayahContextMenuIsOpen,
    activeModals,
    tafseerInfoIsOpen,
    surahContentModalIsOpen,
    tafseerSelectionInfoIsOpen,
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
}: UseQuranAyahInteractionsParams) => {
    const [toast, setToast] = useState({ show: false, message: '' });
    const [reciterToast, setReciterToast] = useState({ show: false, name: '' });
    const [markerNotification, setMarkerNotification] = useState<{ show: boolean; type: 'quarter' | 'sajda' | 'surah'; text: string }>({ show: false, type: 'quarter', text: '' });
    const [juzNotification, setJuzNotification] = useState({ show: false, text: '' });
    const markerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const juzTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [notificationSettings, setNotificationSettings] = useState(() => getAppNotificationSettings());

    useEffect(() => {
        const handleUpdate = () => {
            setNotificationSettings(getAppNotificationSettings());
        };
        window.addEventListener(APP_NOTIFICATION_CHANGE_EVENT, handleUpdate);
        return () => window.removeEventListener(APP_NOTIFICATION_CHANGE_EVENT, handleUpdate);
    }, []);

    const handleToastClose = useCallback(() => {
        setToast(prev => ({ ...prev, show: false }));
    }, []);

    const [sajdahCardInfo, setSajdahCardInfo] = useState({
        show: false,
        surah: '',
        ayah: 0,
        juz: 0,
        page: 0,
        wasAutoscrolling: false,
        wasPlaying: false,
        openedFromMenu: false,
    });
    const sajdahCardInfoRef = useRef(sajdahCardInfo);
    useEffect(() => { sajdahCardInfoRef.current = sajdahCardInfo; }, [sajdahCardInfo]);

    const landscapeAutoHideTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lastAyahTapRef = useRef<{ time: number; key: string } | null>(null);

    const checkDoubleTapToToggleBars = useCallback((s: number, a: number) => {
        const now = Date.now();
        const ayahKey = `${s}-${a}`;
        const lastTap = lastAyahTapRef.current;

        if (lastTap && (now - lastTap.time) < 400) {
            markQuranMicroHintUsed(readingModeRef.current, 'ayah_text');
            setIsLandscapeUIHidden(prev => !prev);
            if (landscapeAutoHideTimerRef.current) {
                clearTimeout(landscapeAutoHideTimerRef.current);
                landscapeAutoHideTimerRef.current = null;
            }
            lastAyahTapRef.current = null;
            return true;
        } else {
            lastAyahTapRef.current = { time: now, key: ayahKey };
            return false;
        }
    }, [readingModeRef, setIsLandscapeUIHidden]);

    const [ayahActionMenu, setAyahActionMenu] = useState({ isOpen: false, s: 0, a: 0, surahName: '', wasAutoscrolling: false });
    const [instantShareTarget, setInstantShareTarget] = useState<{ s: number; a: number; nonce: number } | null>(null);

    const showMarkerNotification = useCallback((type: 'quarter' | 'sajda' | 'surah', text: string) => {
        // Map types to settings (read fresh settings to avoid stale closures)
        const latestSettings = getAppNotificationSettings();
        const settingKey = type === 'quarter' ? 'quarter' : type === 'sajda' ? 'sajda' : 'general';
        if (latestSettings[settingKey] === false) return;

        // Defer state update to prevent "Cannot update a component while rendering" error
        // as this can be called from Virtuoso callbacks
        setTimeout(() => {
            if (markerTimeoutRef.current) clearTimeout(markerTimeoutRef.current);
            setMarkerNotification({ show: true, type, text });
            markerTimeoutRef.current = setTimeout(() => {
                setMarkerNotification(prev => ({ ...prev, show: false }));
                markerTimeoutRef.current = null;
            }, 3500);
        }, 0);
    }, []);

    const showJuzNotification = useCallback((text: string) => {
        if (getAppNotificationSettings().juz === false) return;

        // Defer state update to prevent "Cannot update a component while rendering" error
        setTimeout(() => {
            if (juzTimeoutRef.current) clearTimeout(juzTimeoutRef.current);
            setJuzNotification({ show: true, text });
            juzTimeoutRef.current = setTimeout(() => {
                setJuzNotification(prev => ({ ...prev, show: false }));
                juzTimeoutRef.current = null;
            }, 4000);
        }, 0);
    }, []);

    const handleSajdahVisible = useCallback((surahName: string, sNum: number, ayahNum: number) => {
        if (sajdahCardInfoRef.current.show) return;

        const displaySurah = (surahName.includes('سورة') || surahName.includes('سُورَة'))
            ? surahName
            : `سورة ${surahName}`;

        showMarkerNotification('sajda', `سجدة تلاوة: ${displaySurah} - آية ${toArabic(ayahNum)}`);

        if (showSajdahCard) {
            if (!quranData) return;
            const juz = JUZ_MAP.slice().reverse().find(j => (sNum > j.s) || (sNum === j.s && ayahNum >= j.a))?.j || 1;
            const page = quranData.surahs[sNum - 1]?.ayahs.find((ay: any) => ay.numberInSurah === ayahNum)?.page || 1;

            const wasAutoscrolling = autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused;
            const wasPlaying = isPlayingRef.current || isAudioLoadingRef.current;

            // Defer state updates to prevent "Cannot update a component while rendering" error
            // if this is called during Virtuoso render
            setTimeout(() => {
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
                    wasPlaying,
                    openedFromMenu: false
                });
            }, 0);
        }
    }, [quranData, showMarkerNotification, stopAudio, showSajdahCard, autoScrollStateRef, autoScrollPausedRef, setAutoScrollState, isPlayingRef, isAudioLoadingRef]);

    const handleCloseSajdahCard = () => {
        const wasFromMenu = sajdahCardInfo.openedFromMenu;
        if (sajdahCardInfo.wasAutoscrolling) {
            autoScrollPausedRef.current = false;
            setAutoScrollState(p => ({ ...p, isPaused: false }));
        }
        setSajdahCardInfo({ show: false, surah: '', ayah: 0, juz: 0, page: 0, wasAutoscrolling: false, wasPlaying: false, openedFromMenu: false });

        if (wasFromMenu) {
            setFloatingMenuInitialView('sajdah_list');
            setIsFloatingMenuOpen(true);
        }
    };

    const handleAyahTextClick = useCallback((s: number, a: number) => {
        if (isFloatingMenuOpenRef.current || Date.now() - lastFloatingMenuCloseTimeRef.current < 500) {
            lastFloatingMenuCloseTimeRef.current = Date.now();
            setIsFloatingMenuOpen(false);
            return;
        }

        markQuranMicroHintUsed(readingModeRef.current, 'ayah_text');
        const isDoubleTap = checkDoubleTapToToggleBars(s, a);

        handleAyahClickRef.current(s, a);
        setIsFloatingMenuOpen(false);

        if (!isDoubleTap && readingModeRef.current !== 'madinah') {
            if (isLandscapeRef.current) {
                setIsLandscapeUIHidden(prev => !prev);
                if (landscapeAutoHideTimerRef.current) {
                    clearTimeout(landscapeAutoHideTimerRef.current);
                    landscapeAutoHideTimerRef.current = null;
                }
            } else {
                if (isHideToolbarsEnabledRef.current) {
                    setIsLandscapeUIHidden(prev => !prev);
                }
            }
        }

        if (autoScrollStateRef.current.isActive) {
            wasAutoscrollingBeforeBackground.current = false;
            const newPausedState = !autoScrollStateRef.current.isPaused;
            autoScrollPausedRef.current = newPausedState;
            const newState = { ...autoScrollStateRef.current, isPaused: newPausedState };
            autoScrollStateRef.current = newState;
            setAutoScrollState(newState);
        }
    }, [checkDoubleTapToToggleBars, handleAyahClickRef, isFloatingMenuOpenRef, lastFloatingMenuCloseTimeRef, setIsFloatingMenuOpen, readingModeRef, isLandscapeRef, setIsLandscapeUIHidden, isHideToolbarsEnabledRef, autoScrollStateRef, wasAutoscrollingBeforeBackground, autoScrollPausedRef, setAutoScrollState]);

    const handleVerseClick = useCallback((s: number, a: number, event: React.MouseEvent) => {
        event.stopPropagation();
        if (isFloatingMenuOpenRef.current || Date.now() - lastFloatingMenuCloseTimeRef.current < 500) {
            lastFloatingMenuCloseTimeRef.current = Date.now();
            setIsFloatingMenuOpen(false);
            return;
        }

        markQuranMicroHintUsed(readingModeRef.current, 'verse_num');
        const isDoubleTap = checkDoubleTapToToggleBars(s, a);
        handleAyahClickRef.current(s, a);

        if (isDoubleTap) {
            setAyahActionMenu({ isOpen: false, s, a, surahName: '', wasAutoscrolling: false });
            return;
        }

        if (!quranData) return;
        const surah = quranData.surahs.find((su: any) => su.number === s);
        if (surah) {
            const wasAutoscrolling = autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused;
            if (wasAutoscrolling) {
                autoScrollPausedRef.current = true;
                const newState = { ...autoScrollStateRef.current, isPaused: true };
                autoScrollStateRef.current = newState;
                setAutoScrollState(newState);
            }

            if (isLandscapeRef.current) {
                if (landscapeAutoHideTimerRef.current) {
                    clearTimeout(landscapeAutoHideTimerRef.current);
                    landscapeAutoHideTimerRef.current = null;
                }
                setIsLandscapeUIHidden(false);
            }
            setAyahActionMenu({ isOpen: true, s, a, surahName: surah.name, wasAutoscrolling });
        }
    }, [quranData, checkDoubleTapToToggleBars, handleAyahClickRef, isFloatingMenuOpenRef, lastFloatingMenuCloseTimeRef, setIsFloatingMenuOpen, readingModeRef, autoScrollStateRef, autoScrollPausedRef, setAutoScrollState, isLandscapeRef, setIsLandscapeUIHidden]);

    const handleVerseLongPress = useCallback((s: number, a: number) => {
        if (isFloatingMenuOpenRef.current || Date.now() - lastFloatingMenuCloseTimeRef.current < 500) {
            lastFloatingMenuCloseTimeRef.current = Date.now();
            setIsFloatingMenuOpen(false);
            return;
        }
        markQuranMicroHintUsed(readingModeRef.current, 'verse_num');
        const wasAutoscrolling = autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused;
        if (wasAutoscrolling) {
            autoScrollPausedRef.current = true;
            setAutoScrollState(p => ({ ...p, isPaused: true }));
            // Force update ref immediately to prevent race condition with handleInteractionEnd
            autoScrollStateRef.current = { ...autoScrollStateRef.current, isPaused: true };
        }
        setTafseerSelectionInfo({ isOpen: true, s, a, wasAutoscrolling });
    }, [isFloatingMenuOpenRef, lastFloatingMenuCloseTimeRef, setIsFloatingMenuOpen, readingModeRef, autoScrollStateRef, autoScrollPausedRef, setAutoScrollState, setTafseerSelectionInfo]);

    const handleAyahLongPress = useCallback((s: number, a: number, x: number, y: number) => {
        markQuranMicroHintUsed(readingModeRef.current, 'ayah_text');
        stopAudio();
        const wasAutoscrolling = autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused;
        if (wasAutoscrolling) {
            wasAutoscrollingBeforeAyahContext.current = true;
            autoScrollPausedRef.current = true;
            const newState = { ...autoScrollStateRef.current, isPaused: true };
            autoScrollStateRef.current = newState;
            setAutoScrollState(newState);
        }
        setAyahContextColorField(null);
        setAyahContextMenu({
            isOpen: true,
            isCustomizing: true,
            x, y, s, a,
            tempSettings: { ...settingsRef.current },
            originalSettings: { ...settingsRef.current }
        });
    }, [stopAudio, readingModeRef, autoScrollStateRef, wasAutoscrollingBeforeAyahContext, autoScrollPausedRef, setAutoScrollState, setAyahContextColorField, setAyahContextMenu, settingsRef]);

    const toggleAudio = useCallback(() => {
        markQuranMicroHintUsed(readingModeRef.current, 'play_btn');
        if (isPlaying || isAudioLoading) stopAudio();
        else {
            const activeAyah = currentAyahRef.current?.s && currentAyahRef.current?.a
                ? currentAyahRef.current
                : currentAyah;
            if (activeAyah && activeAyah.s && activeAyah.a) {
                playAudio(activeAyah.s, activeAyah.a);
                const currentMode = localIsMemorizationMode ? 'mushaf' : readingMode;
                const rawReaderId = localIsMemorizationMode && memorizationSettingsRef.current ? memorizationSettingsRef.current.reader : readerSetting;
                const currentReaderId = getValidReaderForMode(currentMode, rawReaderId);
                const modeReaders = getReadersForMode(currentMode, localIsMemorizationMode ? MEMORIZATION_READERS : READERS);
                const foundReciter = modeReaders.find(r => r.id === currentReaderId) || modeReaders[0];
                const rawReciterName = foundReciter?.name || 'القارئ';
                const reciterName = isEn ? getReciterDisplayName(rawReciterName, 'en') : rawReciterName;
                setReciterToast({ show: true, name: reciterName });
                setTimeout(() => setReciterToast(prev => ({ ...prev, show: false })), 2000);
            } else {
                showToast(isEn ? 'Please select an ayah to start' : 'الرجاء اختيار آية للبدء');
            }
        }
    }, [isPlaying, isAudioLoading, currentAyah, playAudio, stopAudio, readerSetting, localIsMemorizationMode, readingMode, isEn, readingModeRef, currentAyahRef, memorizationSettingsRef, showToast]);

    const playButtonTimerRef = useRef<number | null>(null);
    const handlePlayButtonPointerDown = () => {
        markQuranMicroHintUsed(readingModeRef.current, 'play_btn');
        playButtonTimerRef.current = window.setTimeout(() => {
            playButtonTimerRef.current = null;
            openModalRef.current('reciter-modal');
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

    const handleScreenTap = () => {
        setIsFloatingMenuOpen(false);
        if (readingModeRef.current === 'madinah') {
            if (isMadinahVerticalRef.current) {
                toggleAutoScrollPause();
            }
            return;
        }

        if (isLandscapeRef.current) {
            setIsLandscapeUIHidden(prev => !prev);
        } else {
            if (isHideToolbarsEnabledRef.current) {
                setIsLandscapeUIHidden(prev => !prev);
            }
        }

        toggleAutoScrollPause();
    };

    const handleInteractionStart = useCallback(() => {
        if (autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused) {
            autoScrollPausedRef.current = true;
        }
    }, [autoScrollStateRef, autoScrollPausedRef]);

    const handleInteractionEnd = useCallback(() => {
        setTimeout(() => {
            const isAnyModalOpen = activeModals.length > 0 || tafseerInfoIsOpen || surahContentModalIsOpen || tafseerSelectionInfoIsOpen || ayahContextMenuIsOpen;
            const isHidden = isAppBackgroundedRef.current || (typeof document !== 'undefined' && document.hidden);
            if (!isAnyModalOpen && !isHidden && autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused) {
                autoScrollPausedRef.current = false;
            }
        }, 100);
    }, [activeModals, tafseerInfoIsOpen, surahContentModalIsOpen, tafseerSelectionInfoIsOpen, ayahContextMenuIsOpen, isAppBackgroundedRef, autoScrollStateRef, autoScrollPausedRef]);

    const handleVerticalAyahClick = useCallback((s: number, a: number) => {
        markQuranMicroHintUsed(readingModeRef.current, 'ayah_text');
        const isDoubleTap = checkDoubleTapToToggleBars(s, a);

        handleAyahClickRef.current(s, a, true);

        setIsFloatingMenuOpen(false);

        if (!isDoubleTap) {
            if (isLandscapeRef.current) {
                setIsLandscapeUIHidden(prev => !prev);
                if (landscapeAutoHideTimerRef.current) {
                    clearTimeout(landscapeAutoHideTimerRef.current);
                    landscapeAutoHideTimerRef.current = null;
                }
            } else {
                if (isHideToolbarsEnabledRef.current) {
                    setIsLandscapeUIHidden(prev => !prev);
                }
            }
        }

        toggleAutoScrollPause();
    }, [handleAyahClickRef, checkDoubleTapToToggleBars, toggleAutoScrollPause, readingModeRef, setIsFloatingMenuOpen, isLandscapeRef, setIsLandscapeUIHidden, isHideToolbarsEnabledRef]);

    return {
        toast,
        setToast,
        handleToastClose,
        reciterToast,
        markerNotification,
        juzNotification,
        setJuzNotification,
        juzTimeoutRef,
        notificationSettings,
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
    };
};
