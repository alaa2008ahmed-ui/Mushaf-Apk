import React, { useEffect, useCallback } from 'react';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { JUZ_MAP, THEMES, SURAH_NAMES_AR, ReadingMode } from '../components/QuranReader/constants';
import { parseVoiceCommand, normalizeArabic } from '../utils/audio/voiceParser';
import { getClusterForLanguage, syncClusterSettings } from '../utils/quran/quranClusterSync';

interface UseQuranVoiceCommandsParams {
    quranData: any;
    visiblePages: number[];
    currentAyah: { s: number; a: number };
    currentAyahRef: React.MutableRefObject<{ s: number; a: number }>;
    readingModeRef: React.MutableRefObject<ReadingMode>;
    isLandscapeRef: React.MutableRefObject<boolean>;
    autoScrollStateRef: React.MutableRefObject<{ isActive: boolean; isPaused: boolean; elapsedTime: number }>;
    autoScrollPausedRef: React.MutableRefObject<boolean>;
    wasAutoscrollingBeforeModal: React.MutableRefObject<boolean>;
    lastInteractionType: 'page' | 'ayah';
    activeModals: string[];
    sajdahCardInfo: { show: boolean; [key: string]: any };
    isWirdMode: boolean;
    localIsMemorizationMode: boolean;
    language: string;
    themeSuffix: string;
    jumpToPage: (pageNum: number, instant?: boolean) => void;
    jumpToAyah: (s: number, a: number, instant?: boolean, isPageJump?: boolean) => void;
    openModal: (modalName: string, params?: any) => void;
    handleHomeClick: (targetPage?: string) => void;
    onNavigate: (pageId: string, params?: any) => void;
    onBack: () => void;
    saveBookmark: () => void;
    toggleAutoScroll: () => void;
    stopAutoScroll: (showTimer?: boolean) => void;
    handlePlayButtonPointerDown: () => void;
    handlePlayButtonPointerUp: () => void;
    handleCloseSajdahCard: () => void;
    updateSetting: (key: string, value: any) => void;
    setSettings: React.Dispatch<React.SetStateAction<any>>;
    setActiveModals: React.Dispatch<React.SetStateAction<string[]>>;
    setAutoScrollState: React.Dispatch<React.SetStateAction<{ isActive: boolean; isPaused: boolean; elapsedTime: number }>>;
    setIsLandscapeUIHidden: React.Dispatch<React.SetStateAction<boolean>>;
    setIsTafseerLoading: React.Dispatch<React.SetStateAction<boolean>>;
    setTafseerInfo: React.Dispatch<React.SetStateAction<any>>;
    setMultiTafseerInfo: React.Dispatch<React.SetStateAction<any>>;
    setTafseerSelectionInfo: React.Dispatch<React.SetStateAction<any>>;
    setIsFloatingMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsPageInputActive: React.Dispatch<React.SetStateAction<boolean>>;
    setAyahContextMenu: React.Dispatch<React.SetStateAction<any>>;
}

export const useQuranVoiceCommands = ({
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
}: UseQuranVoiceCommandsParams) => {
    const handleVoiceCommand = useCallback((text: string) => {
        console.log('QuranReader - Voice Command:', text);

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
                const curP = readingModeRef.current === 'madinah'
                    ? (quranData?.surahs[currentAyahRef.current.s - 1]?.ayahs.find((ay: any) => ay.numberInSurah === currentAyahRef.current.a)?.page || 1)
                    : Math.min(...visiblePages);
                jumpToPage(Math.min(604, curP + 1));
                return;
            } else if (action === 'prev_page') {
                const curP = readingModeRef.current === 'madinah'
                    ? (quranData?.surahs[currentAyahRef.current.s - 1]?.ayahs.find((ay: any) => ay.numberInSurah === currentAyahRef.current.a)?.page || 1)
                    : Math.min(...visiblePages);
                jumpToPage(Math.max(1, curP - 1));
                return;
            } else if (action === 'play_audio') {
                handlePlayButtonPointerDown();
                handlePlayButtonPointerUp();
                return;
            } else if (action === 'open_settings') {
                openModal('settings-modal');
                return;
            } else if (action === 'go_home') {
                handleHomeClick();
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
                            if (isLandscapeRef.current) {
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

    useEffect(() => {
        const handleGlobalVoiceCommand = (e: any) => {
            const { action, text, params } = e.detail;

            const isDownloadModalOpen = activeModals.includes('quran-download-modal') || activeModals.includes('tafsir-download-modal');
            if (isDownloadModalOpen && ['quran_navigation', 'go_to_page', 'go_to_juz', 'go_to_surah', 'go_to_ayah', 'next_page', 'prev_page'].includes(action)) {
                return;
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
                const curP = readingModeRef.current === 'madinah'
                    ? (quranData?.surahs[currentAyahRef.current.s - 1]?.ayahs.find((ay: any) => ay.numberInSurah === currentAyahRef.current.a)?.page || 1)
                    : Math.min(...visiblePages);
                jumpToPage(Math.min(604, curP + 1));
            } else if (action === 'prev_page') {
                const curP = readingModeRef.current === 'madinah'
                    ? (quranData?.surahs[currentAyahRef.current.s - 1]?.ayahs.find((ay: any) => ay.numberInSurah === currentAyahRef.current.a)?.page || 1)
                    : Math.min(...visiblePages);
                jumpToPage(Math.max(1, curP - 1));
            } else if (action === 'play_audio' || action === 'stop_audio') {
                handlePlayButtonPointerDown();
                handlePlayButtonPointerUp();
            } else if (action === 'set_orientation_horizontal') {
                ScreenOrientation.lock({ orientation: 'landscape' });
            } else if (action === 'set_orientation_vertical') {
                ScreenOrientation.lock({ orientation: 'portrait' });
            } else if (action === 'contextual_number' && params?.value) {
                const num = params.value;
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
                            if (isLandscapeRef.current) {
                                setIsLandscapeUIHidden(false);
                            }
                        }
                        setIsTafseerLoading(true);
                        setTafseerInfo({ isOpen: true, s, a, text: '', surahName: surah.name, wasAutoscrolling });
                    }
                }
            } else if (action === 'open_multi_tafseer') {
                const s = currentAyahRef.current?.s || 1;
                const a = currentAyahRef.current?.a || 1;
                const surahObj = quranData?.surahs?.[s - 1];
                const ayahObj = surahObj?.ayahs?.[a - 1];
                setMultiTafseerInfo({
                    isOpen: true,
                    s,
                    a,
                    surahName: surahObj?.name,
                    ayahText: ayahObj?.text
                });
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
                setTafseerInfo((p: any) => ({ ...p, isOpen: false }));
                setTafseerSelectionInfo((p: any) => ({ ...p, isOpen: false }));
                if (sajdahCardInfo.show) handleCloseSajdahCard();
                setIsFloatingMenuOpen(false);
                setIsPageInputActive(false);
                setAyahContextMenu((p: any) => ({ ...p, isOpen: false }));
            } else if (action === 'save_bookmark') {
                saveBookmark();
            } else if (action === 'increase_font') {
                if (readingModeRef.current === 'madinah') return;
                setSettings((prev: any) => {
                    const newSize = Number((Math.min(4.5, prev.fontSize + 0.1)).toFixed(2));
                    const newSettings = { ...prev, fontSize: newSize };
                    localStorage.setItem('quran_settings' + themeSuffix, JSON.stringify(newSettings));
                    if (!isWirdMode && !localIsMemorizationMode) {
                        const cluster = getClusterForLanguage(language);
                        syncClusterSettings(cluster, newSettings, isLandscapeRef.current, { readingMode: readingModeRef.current });
                    } else {
                        window.dispatchEvent(new Event('settings-change'));
                    }
                    return newSettings;
                });
            } else if (action === 'decrease_font') {
                if (readingModeRef.current === 'madinah') return;
                setSettings((prev: any) => {
                    const newSize = Number((Math.max(0.5, prev.fontSize - 0.1)).toFixed(2));
                    const newSettings = { ...prev, fontSize: newSize };
                    localStorage.setItem('quran_settings' + themeSuffix, JSON.stringify(newSettings));
                    if (!isWirdMode && !localIsMemorizationMode) {
                        const cluster = getClusterForLanguage(language);
                        syncClusterSettings(cluster, newSettings, isLandscapeRef.current, { readingMode: readingModeRef.current });
                    } else {
                        window.dispatchEvent(new Event('settings-change'));
                    }
                    return newSettings;
                });
            } else if (action === 'set_font_size' && params?.size) {
                if (readingModeRef.current === 'madinah') return;
                setSettings((prev: any) => {
                    const newSize = Math.max(0.5, Math.min(4.5, params.size));
                    const newSettings = { ...prev, fontSize: newSize };
                    localStorage.setItem('quran_settings' + themeSuffix, JSON.stringify(newSettings));
                    if (!isWirdMode && !localIsMemorizationMode) {
                        const cluster = getClusterForLanguage(language);
                        syncClusterSettings(cluster, newSettings, isLandscapeRef.current, { readingMode: readingModeRef.current });
                    } else {
                        window.dispatchEvent(new Event('settings-change'));
                    }
                    return newSettings;
                });
            } else if (action === 'set_theme' && params?.theme && THEMES[params.theme as keyof typeof THEMES]) {
                updateSetting('theme', params.theme);
            }
        };

        window.addEventListener('voice-command', handleGlobalVoiceCommand);
        return () => window.removeEventListener('voice-command', handleGlobalVoiceCommand);
    }, [visiblePages, jumpToPage, handlePlayButtonPointerDown, handlePlayButtonPointerUp, openModal, handleVoiceCommand, activeModals]);
};
