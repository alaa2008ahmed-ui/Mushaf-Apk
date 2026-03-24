import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { JUZ_MAP, toArabic, THEMES, TAFSEERS, READERS, DEFAULT_SETTINGS, SURAH_NAMES_AR } from '../components/QuranReader/constants';
import quranUthmaniJson from '../data/quran-uthmani.json';
import quranTajweedJson from '../data/quran-tajweed.json';
import { parseVoiceCommand } from '../src/utils/voiceParser';

import { useQuranState } from './useQuranState';
import { useQuranSettings } from './useQuranSettings';
import { useQuranScrollAndJump } from './useQuranScrollAndJump';
import { useQuranAudio } from './useQuranAudio';
import { useQuranAutoScroll } from './useQuranAutoScroll';
import { useQuranHandlers } from './useQuranHandlers';
import { useQuranBookmarks } from './useQuranBookmarks';
import { useQuranModals } from './useQuranModals';
import { useQuranContextAndTafseer } from './useQuranContextAndTafseer';
import { useQuranToolbarStyle } from './useQuranToolbarStyle';
import { useQuranEffects } from './useQuranEffects';
import { useQuranTouch } from './useQuranTouch';
import { useQuranEventListeners } from './useQuranEventListeners';

export const useQuranReaderLogic = (onBack: () => void, onNavigate: (pageId: string) => void, initialLandscape: boolean = false) => {
    // 1. Base State
    const {
        isLandscape, setIsLandscape, isLandscapeRef, modeSuffix,
        isLoading, setIsLoading, loadingStatus, setLoadingStatus, loadingProgress, setLoadingProgress,
        visiblePages, setVisiblePages,
        currentAyah, setCurrentAyah, currentAyahRef,
        highlightedAyahId, setHighlightedAyahId, highlightedAyahIdRef,
        activeModals, setActiveModals,
        isFloatingMenuOpen, setIsFloatingMenuOpen,
        toast, showToast, handleToastClose,
        reciterToast, setReciterToast,
        markerNotification, showMarkerNotification,
        isLandscapeUIHidden, setIsLandscapeUIHidden, isLandscapeUIHiddenRef,
        isPageInputActive, setIsPageInputActive, isPageInputActiveRef,
        pageInput, setPageInput,
        isJumpingRef, wasAutoscrollingBeforeModal
    } = useQuranState(initialLandscape);

    // 2. Settings & Theme
    const {
        useTajweed, setUseTajweed,
        quranData, setQuranData,
        isTransparentMode, setIsTransparentMode,
        isHideToolbarsEnabled, setIsHideToolbarsEnabled,
        settings, setSettings, settingsRef, updateSetting,
        currentTheme, setCurrentTheme,
        toolbarColors, setToolbarColors,
        bookmarks, setBookmarks,
        showSajdahCard, setShowSajdahCard
    } = useQuranSettings(initialLandscape, modeSuffix);

    // 3. Modals & Context/Tafseer
    const {
        ayahContextMenu, setAyahContextMenu,
        ayahContextColorField, setAyahContextColorField,
        tafseerInfo, setTafseerInfo,
        tafseerSelectionInfo, setTafseerSelectionInfo,
        isTafseerLoading, setIsTafseerLoading
    } = useQuranContextAndTafseer(settings);

    // 4. Audio
    const {
        isPlaying, setIsPlaying, isPlayingRef,
        isAudioLoading, setIsAudioLoading, isAudioLoadingRef,
        playingAyah, setPlayingAyah,
        stopAudio, playAudio, toggleAudio, playSurah
    } = useQuranAudio(settings, quranData, showToast, (s, a, i) => scrollAndJump.scrollToAyah(s, a, i), setCurrentAyah, setHighlightedAyahId);

    // 5. Modals Helper
    const { closeModal, openModal } = useQuranModals(
        activeModals, setActiveModals, tafseerSelectionInfo, setTafseerSelectionInfo,
        { current: { isActive: false, isPaused: false } } as any, // Placeholder for autoScrollStateRef
        { current: false } as any, // Placeholder for autoScrollPausedRef
        () => {}, // Placeholder for setAutoScrollState
        wasAutoscrollingBeforeModal, stopAudio
    );

    // 6. AutoScroll
    const {
        autoScrollState, setAutoScrollState, autoScrollStateRef,
        isAutoScrollSettingsOpen, setIsAutoScrollSettingsOpen,
        autoScrollButtonTimerRef, autoScrollPausedRef,
        startAutoScroll, stopAutoScroll, toggleAutoScroll
    } = useQuranAutoScroll(settingsRef, { current: null } as any, () => {});

    // 7. Scroll & Jump
    const scrollAndJump = useQuranScrollAndJump(
        quranData, isLandscapeRef, { current: null } as any, // Placeholder for mushafContentRef
        currentAyahRef, highlightedAyahIdRef, setCurrentAyah, setHighlightedAyahId, setVisiblePages,
        stopAudio, isPageInputActiveRef, setActiveModals, showToast,
        autoScrollState, isJumpingRef, showMarkerNotification, (s, sn, an) => {} // Placeholder for handleSajdahVisible
    );

    // 8. Handlers
    const handlers = useQuranHandlers(
        isLandscapeRef, initialLandscape, autoScrollStateRef, autoScrollPausedRef,
        setAutoScrollState, setIsLandscapeUIHidden, setIsFloatingMenuOpen,
        scrollAndJump.handleAyahClick, quranData, setIsTafseerLoading, setTafseerInfo,
        setTafseerSelectionInfo, setAyahContextMenu, settingsRef, settings, setSettings,
        modeSuffix, setPageInput, pageInput, scrollAndJump.jumpToPage, setIsPageInputActive,
        autoScrollState, showToast, setUseTajweed, setQuranData, closeModal,
        quranTajweedJson, quranUthmaniJson
    );

    // 9. Bookmarks
    const { saveBookmark, deleteBookmark } = useQuranBookmarks(bookmarks, setBookmarks, currentAyah, modeSuffix, showToast);

    // 10. Toolbar Style
    const { getToolbarStyle } = useQuranToolbarStyle(toolbarColors, currentTheme, isTransparentMode);

    // 11. Touch
    const touch = useQuranTouch(settings, setSettings, modeSuffix, settingsRef);

    // 12. Event Listeners
    useQuranEventListeners(
        isLandscapeRef, setCurrentTheme, setSettings, setToolbarColors, setUseTajweed,
        setQuranData, setIsTransparentMode, setIsHideToolbarsEnabled, setBookmarks,
        setShowSajdahCard, setIsLandscapeUIHidden
    );

    // 13. Effects
    const hasJumpedRef = useRef(false);
    useQuranEffects(
        isFloatingMenuOpen, { current: null } as any, { current: null } as any, setIsFloatingMenuOpen,
        activeModals, tafseerInfo, tafseerSelectionInfo, { show: false }, isPageInputActive,
        closeModal, () => {}, setTafseerInfo, setTafseerSelectionInfo, setIsPageInputActive,
        autoScrollPausedRef, setAutoScrollState, isPageInputActiveRef,
        { current: null } as any, false, setBookmarks, modeSuffix, hasJumpedRef,
        initialLandscape, scrollAndJump.jumpToAyah, quranData
    );

    // --- Missing Handlers and Logic ---

    const handleSajdahVisible = useCallback((surahName: string, sNum: number, ayahNum: number) => {
        // Implementation for sajdah notification/card
    }, []);

    const handlePageVisible = useCallback((pageNum: number) => {
        // Implementation for page visibility
    }, []);

    const handleScroll = useCallback(() => {
        // Implementation for scroll handling
    }, []);

    const handleFloatingMenuToggle = useCallback(() => {
        setIsFloatingMenuOpen(prev => !prev);
    }, [setIsFloatingMenuOpen]);

    const handlePageInputSubmit = useCallback(() => {
        handlers.handlePageInputBlur();
    }, [handlers]);

    const handleContextMenu = useCallback((s: number, a: number, x: number, y: number) => {
        handlers.handleAyahLongPress(s, a, x, y);
    }, [handlers]);

    const handleContextColorSelect = useCallback((color: string) => {
        if (ayahContextColorField) {
            const newSettings = { ...ayahContextMenu.tempSettings, [ayahContextColorField]: color };
            setAyahContextMenu(prev => ({ ...prev, tempSettings: newSettings }));
        }
    }, [ayahContextColorField, ayahContextMenu.tempSettings]);

    const handleContextColorFieldSelect = useCallback((field: 'textColor' | 'bgColor' | 'highlightTextColor') => {
        setAyahContextColorField(field);
    }, []);

    const handleContextReset = useCallback(() => {
        setAyahContextMenu(prev => ({ ...prev, tempSettings: { ...settings } }));
    }, [settings]);

    const handleContextSave = useCallback(() => {
        setSettings(ayahContextMenu.tempSettings);
        localStorage.setItem('quran_settings' + modeSuffix, JSON.stringify(ayahContextMenu.tempSettings));
        window.dispatchEvent(new Event('settings-change'));
        setAyahContextMenu(prev => ({ ...prev, isOpen: false }));
    }, [ayahContextMenu.tempSettings, modeSuffix, setSettings]);

    const handleContextCancel = useCallback(() => {
        setAyahContextMenu(prev => ({ ...prev, isOpen: false }));
    }, []);

    const handleToolbarColorChange = useCallback((type: string, field: 'bg' | 'text' | 'border' | 'font', value: string) => {
        setToolbarColors((prev: any) => {
            const newColors = { ...prev, [type]: { ...prev[type], [field]: value } };
            localStorage.setItem('toolbar_colors' + modeSuffix, JSON.stringify(newColors));
            return newColors;
        });
    }, [modeSuffix]);

    const handleToolbarColorReset = useCallback((type: string) => {
        // Reset specific toolbar color
    }, []);

    const handleToolbarColorResetAll = useCallback(() => {
        localStorage.removeItem('toolbar_colors' + modeSuffix);
        window.dispatchEvent(new Event('settings-change'));
    }, [modeSuffix]);

    const handleToolbarColorSave = useCallback(() => {
        closeModal('toolbar-color-modal');
    }, [closeModal]);

    const handleToolbarColorCancel = useCallback(() => {
        closeModal('toolbar-color-modal');
    }, [closeModal]);

    const handleToolbarColorFieldSelect = useCallback((field: string) => {
        // Implementation
    }, []);

    const handleToolbarColorSelect = useCallback((color: string) => {
        // Implementation
    }, []);

    const handleCloseSajdahCard = useCallback(() => {
        // Implementation
    }, []);

    const handleVoiceCommand = useCallback((text: string) => {
        const saved = localStorage.getItem('voice_commands_v2');
        const customCommands = saved ? JSON.parse(saved) : [];
        const parsed = parseVoiceCommand(text, SURAH_NAMES_AR, customCommands);
        
        if (parsed) {
            const { action, params } = parsed;
            console.log('Quran Voice Command:', action, params);

            if (action === 'go_to_page' && params?.page) scrollAndJump.jumpToPage(params.page, true);
            else if (action === 'go_to_juz' && params?.juz) {
                const juzInfo = JUZ_MAP.find(j => j.j === params.juz);
                if (juzInfo) scrollAndJump.jumpToAyah(juzInfo.s, juzInfo.a, true);
            } 
            else if (action === 'go_to_surah' && params?.surah) scrollAndJump.jumpToAyah(params.surah, 1, true);
            else if (action === 'go_to_ayah' && params?.surah && params?.ayah) scrollAndJump.jumpToAyah(params.surah, params.ayah, true);
            else if (action === 'next_page') scrollAndJump.jumpToPage(Math.min(604, Math.max(...visiblePages) + 1));
            else if (action === 'prev_page') scrollAndJump.jumpToPage(Math.max(1, Math.min(...visiblePages) - 1));
            else if (action === 'play_audio') playAudio(currentAyah.s, currentAyah.a);
            else if (action === 'stop_audio') stopAudio();
            else if (action === 'open_search') openModal('search-modal');
            else if (action === 'open_settings') openModal('settings-modal');
            else if (action === 'open_themes') openModal('themes-modal');
            else if (action === 'go_home') onBack();
            
            // Requested Navigation Actions
            else if (action === 'open_listen') onNavigate('listen');
            else if (action === 'open_prayer') onNavigate('prayer-times');
            else if (action === 'open_salah_adhkar') onNavigate('salah-adhkar');
            else if (action === 'open_hisn_muslim') onNavigate('hisn-muslim');
            else if (action === 'open_calendar') onNavigate('calendar');
            else if (action === 'open_qibla') onNavigate('qibla');
            else if (action === 'open_hajj_umrah') onNavigate('hajj-umrah');
            else if (action === 'open_voice_control') onNavigate('voice-control');
            
            // Legacy/Alternative Actions
            else if (action === 'go_athkar') onNavigate('sabah-masaa');
            else if (action === 'go_prayer') onNavigate('prayer-times');
            else if (action === 'go_qibla') onNavigate('qibla');
            else if (action === 'go_tasbeeh') onNavigate('tasbeeh');
        }
    }, [onNavigate, onBack, openModal, scrollAndJump, visiblePages, playAudio, stopAudio, currentAyah]);

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

    return {
        isLandscape, modeSuffix, useTajweed, setUseTajweed, quranData, setQuranData,
        isLoading, setIsLoading, loadingStatus, setLoadingStatus, loadingProgress, setLoadingProgress,
        visiblePages, setVisiblePages, currentAyah, setCurrentAyah, highlightedAyahId, setHighlightedAyahId,
        isTransparentMode, setIsTransparentMode, isHideToolbarsEnabled, setIsHideToolbarsEnabled,
        lastInteractionType: 'page', // Placeholder
        setLastInteractionType: () => {}, // Placeholder
        activeModals, setActiveModals, isFloatingMenuOpen, setIsFloatingMenuOpen,
        ayahContextMenu, setAyahContextMenu, ayahContextColorField, setAyahContextColorField,
        isLandscapeUIHidden, setIsLandscapeUIHidden, settings, setSettings,
        currentTheme, setCurrentTheme, bookmarks, setBookmarks,
        autoScrollState, setAutoScrollState,
        isPlaying, setIsPlaying, isAudioLoading, setIsAudioLoading, playingAyah, setPlayingAyah,
        isTafseerLoading, setIsTafseerLoading, isPageInputActive, setIsPageInputActive,
        pageInput, setPageInput, mushafContentRef: { current: null }, // Placeholder
        floatingMenuRef: { current: null }, menuButtonRef: { current: null }, pageInputRef: { current: null },
        toast, reciterToast, markerNotification, sajdahCardInfo: { show: false },
        isAutoScrollSettingsOpen, setIsAutoScrollSettingsOpen,
        tafseerInfo, setTafseerInfo, tafseerSelectionInfo, setTafseerSelectionInfo,
        toolbarColors, setToolbarColors, showToast, handleToastClose,
        stopAudio, playAudio, closeModal, openModal,
        jumpToAyah: scrollAndJump.jumpToAyah, jumpToAyahRef: scrollAndJump.jumpToAyahRef,
        jumpToPage: scrollAndJump.jumpToPage,
        toggleAutoScroll, startAutoScroll,
        stopAutoScroll, saveBookmark, deleteBookmark,
        handleVoiceCommand, PREDEFINED_COLORS, renderCheckerboard,
        handleMushafTypeSelect: handlers.handleMushafTypeSelect,
        handleTafseerSelect: handlers.handleTafseerSelect,
        playSurah, updateSetting, handleAyahClick: scrollAndJump.handleAyahClick,
        handleAyahTextClick: handlers.handleAyahTextClick,
        handleSajdahVisible, handlePageVisible, handleScroll, handleFloatingMenuToggle,
        handlePageInputChange: handlers.handlePageInputChange,
        handlePageInputSubmit, handlePageInputBlur: handlers.handlePageInputBlur,
        handlePageInputKeyDown: handlers.handlePageInputKeyDown,
        handleContextMenu, handleContextColorSelect, handleContextColorFieldSelect,
        handleContextReset, handleContextSave, handleContextCancel,
        handleToolbarColorChange, handleToolbarColorReset, handleToolbarColorResetAll,
        handleToolbarColorSave, handleToolbarColorCancel, handleToolbarColorFieldSelect,
        handleToolbarColorSelect,
        getToolbarStyle,
        showSajdahCard, setShowSajdahCard, handleCloseSajdahCard
    };
};
