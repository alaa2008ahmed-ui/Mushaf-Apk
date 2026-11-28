import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { ReadingMode } from '../components/QuranReader/constants';
import { getClusterForLanguage, getClusterPosition } from '../utils/quran/quranClusterSync';
import { quranData as quranJsonData } from '../utils/quran/quranData';

interface UseQuranReaderModesAndSessionParams {
    initialLandscape: boolean;
    initialSurah?: number;
    initialAyah?: number;
    initialPage?: number;
    isWirdMode: boolean;
    isMemorizationMode: boolean;
    memorizationSettings?: any;
    navParams?: any;
    language: string;
    setCurrentPage: (page: string) => void;
    isPageInputActiveBridgeRef: React.MutableRefObject<boolean>;
    isBottomPageInputActiveBridgeRef: React.MutableRefObject<boolean>;
    memorizationSettingsRef: React.MutableRefObject<any>;
    jumpToAyahRef: React.MutableRefObject<(s: number, a: number, instant?: boolean, isPageJump?: boolean) => void>;
    playAudioRef: React.MutableRefObject<(s: number, a: number) => void>;
    isMountedRef: React.MutableRefObject<boolean>;
}

export const useQuranReaderModesAndSession = ({
    initialLandscape,
    initialSurah,
    initialAyah,
    initialPage,
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
}: UseQuranReaderModesAndSessionParams) => {
    const [isLandscape, setIsLandscape] = useState(initialLandscape);
    const isLandscapeRef = useRef(initialLandscape);
    useEffect(() => { isLandscapeRef.current = isLandscape; }, [isLandscape]);
    const prevOrientRef = useRef<'h' | 'v'>(initialLandscape ? 'h' : 'v');

    const normalizeVisibleMode = useCallback((mode: ReadingMode | undefined, targetLang: string): ReadingMode => {
        if (targetLang === 'en') {
            if (mode === 'madinah' || mode === 'mushaf' || mode === 'bilingual' || mode === 'translation') return mode;
            return 'translation';
        }
        if (mode === 'mushaf' || mode === 'madinah' || mode === 'bilingual') return mode;
        return 'mushaf';
    }, []);

    const getSavedArabicMode = useCallback((orient: 'h' | 'v'): ReadingMode => {
        const modernSaved = localStorage.getItem(`quran_reading_mode_ar_${orient}`) as ReadingMode;
        if (modernSaved && ['mushaf', 'madinah', 'bilingual'].includes(modernSaved)) return modernSaved;
        const legacySaved = (localStorage.getItem(`last_arabic_reading_mode_${orient}`) as ReadingMode)
            || (localStorage.getItem(`last_reading_mode_${orient}`) as ReadingMode);
        if (legacySaved && ['mushaf', 'madinah', 'bilingual'].includes(legacySaved)) {
            return legacySaved;
        }
        return 'mushaf';
    }, []);

    const getSavedEnglishMode = useCallback((orient: 'h' | 'v'): ReadingMode => {
        const modernSaved = localStorage.getItem(`quran_reading_mode_en_v2_${orient}`) as ReadingMode;
        if (modernSaved && ['translation', 'bilingual', 'madinah'].includes(modernSaved)) {
            return modernSaved;
        }
        return 'translation';
    }, []);

    const [readingMode, setReadingModeState] = useState<ReadingMode>(() => {
        if (navParams?.readingMode) return normalizeVisibleMode(navParams.readingMode, language);
        if (isWirdMode || isMemorizationMode) return 'mushaf';
        const orient = initialLandscape ? 'h' : 'v';
        if (language === 'en') {
            return getSavedEnglishMode(orient);
        } else {
            return getSavedArabicMode(orient);
        }
    });

    useEffect(() => {
        if (navParams?.readingMode && !isMemorizationMode) {
            setReadingModeState(normalizeVisibleMode(navParams.readingMode, language));
        }
    }, [navParams?.readingMode, isMemorizationMode, language, normalizeVisibleMode]);

    const setReadingMode = useCallback((newMode: ReadingMode | ((prev: ReadingMode) => ReadingMode)) => {
        setReadingModeState(prev => {
            const rawResolved = typeof newMode === 'function' ? newMode(prev) : newMode;
            const resolved = normalizeVisibleMode(rawResolved, language);
            if (!isWirdMode && !isMemorizationMode) {
                const orient = isLandscape ? 'h' : 'v';
                if (language === 'en') {
                    localStorage.setItem(`quran_reading_mode_en_v2_${orient}`, resolved);
                    localStorage.setItem(`quran_reading_mode_en_${orient}`, resolved);
                } else {
                    localStorage.setItem(`quran_reading_mode_ar_${orient}`, resolved);
                    localStorage.setItem(`last_arabic_reading_mode_${orient}`, resolved);
                }
                localStorage.setItem(`last_reading_mode_${orient}`, resolved);
                localStorage.setItem('last_reading_mode_unified', resolved);
            }
            return resolved;
        });
    }, [isWirdMode, isMemorizationMode, isLandscape, language, normalizeVisibleMode]);

    const prevLanguageRef = useRef(language);
    useEffect(() => {
        if (prevLanguageRef.current !== language) {
            prevLanguageRef.current = language;
            const orient = isLandscapeRef.current ? 'h' : 'v';
            if (language === 'en') {
                setReadingModeState(getSavedEnglishMode(orient));
            } else {
                if (!['mushaf', 'madinah', 'bilingual'].includes(readingMode)) {
                    setReadingModeState(getSavedArabicMode(orient));
                }
            }
        }
    }, [language, readingMode, getSavedEnglishMode, getSavedArabicMode]);

    useEffect(() => {
        const orient = isLandscape ? 'h' : 'v';
        if (prevOrientRef.current !== orient) {
            prevOrientRef.current = orient;
        }
    }, [isLandscape]);

    useEffect(() => {
        setCurrentPage(`quran_${readingMode}`);
    }, [setCurrentPage, readingMode]);

    const readingModeRef = useRef(readingMode);
    useEffect(() => { readingModeRef.current = readingMode; }, [readingMode]);
    const prevReadingModeRef = useRef(readingMode);

    const [showResumeModal, setShowResumeModal] = useState(false);
    const [savedSession, setSavedSession] = useState<any>(null);
    const [localIsMemorizationMode, setLocalIsMemorizationMode] = useState(isMemorizationMode);
    const [localMemorizationSettings, setLocalMemorizationSettings] = useState(memorizationSettings);
    useEffect(() => { memorizationSettingsRef.current = localMemorizationSettings; }, [localMemorizationSettings, memorizationSettingsRef]);
    const [isHideMode, setIsHideMode] = useState(memorizationSettings?.isReviewMode || false);
    const [showReviewTest, setShowReviewTest] = useState(false);

    // Auto-detect orientation based on layout dimensions for browser and device compatibility
    useEffect(() => {
        const handleResize = () => {
            if (initialLandscape) return;

            // Ignore resize if keyboard is likely open to prevent orientation flip
            const activeEl = document.activeElement;
            const isInputActive = activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA' || activeEl?.getAttribute('contenteditable') === 'true';

            if (isInputActive || isBottomPageInputActiveBridgeRef.current || isPageInputActiveBridgeRef.current) {
                return;
            }

            const width = window.innerWidth;

            // Use matchMedia for more reliable orientation detection that ignores keyboard height
            let isL = window.matchMedia("(orientation: landscape)").matches;

            // Re-validate: if it claims landscape but height is EXTREMELY small relative to width on a mobile device,
            // or if it's a mobile device and width < 600, it's probably just a resize.
            // Most phones in landscape are > 600px wide.
            if (isL && width < 600 && (navigator.userAgent.includes('Mobi') || navigator.userAgent.includes('Android'))) {
                return;
            }

            // Only auto-switch to landscape mode on mobile/native devices.
            // On desktop/preview, a wide window shouldn't force the mobile landscape reading UI
            // which hides toolbars and share buttons.
            if (!Capacitor.isNativePlatform()) {
                const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                if (!isMobileUA) {
                    isL = false; // Always default to portrait in desktop preview so toolbars/share buttons appear normally
                }
            }

            if (isL !== isLandscapeRef.current) {
                setIsLandscape(isL);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial check

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const sharedSuffix = isLandscape ? '_h' : '_v';
    const modeSuffix = sharedSuffix;

    // Scoped suffixes for bookmarks and last position to have separate records for each mode
    const getScopedSuffix = (mode: string, landscapeFlag?: boolean) => {
        const orient = (landscapeFlag !== undefined ? landscapeFlag : isLandscape) ? 'h' : 'v';
        if (isWirdMode) return `_wird_${orient}`;
        if (localIsMemorizationMode) return `_memorization_${orient}`;
        if (mode === 'mushaf') return `_${orient}`;
        return `_${mode}_${orient}`;
    };

    const bookmarkSuffix = getScopedSuffix(readingMode);
    const posSuffix = getScopedSuffix(readingMode);
    const themeSuffix = posSuffix; // Always scope settings/themes strictly per mode

    const getSavedModePosition = useCallback((targetMode: ReadingMode): { s: number; a: number; isExplicit?: boolean } | null => {
        try {
            if (isWirdMode) {
                const orient = isLandscape ? 'h' : 'v';
                const savedWird = localStorage.getItem('last_read_ayah_wird') || localStorage.getItem(`last_pos_wird_${orient}`) || localStorage.getItem('last_pos_wird');
                if (savedWird) {
                    const parsed = JSON.parse(savedWird);
                    if (parsed && typeof parsed.s === 'number' && parsed.s >= 1 && parsed.s <= 114) {
                        return { s: parsed.s, a: parsed.a || 1, isExplicit: parsed.isExplicit };
                    }
                }
                return null;
            }
            if (localIsMemorizationMode) {
                const orient = isLandscape ? 'h' : 'v';
                const savedMem = localStorage.getItem('last_read_ayah_memorization') || localStorage.getItem(`last_pos_memorization_${orient}`);
                if (savedMem) {
                    const parsed = JSON.parse(savedMem);
                    if (parsed && typeof parsed.s === 'number' && parsed.s >= 1 && parsed.s <= 114) {
                        return { s: parsed.s, a: parsed.a || 1, isExplicit: parsed.isExplicit };
                    }
                }
                return null;
            }
            const cluster = getClusterForLanguage(language);
            const clusterPos = getClusterPosition(cluster, targetMode, isLandscape);
            if (clusterPos?.s) {
                return { s: clusterPos.s, a: clusterPos.a || 1, isExplicit: clusterPos.isExplicit };
            }
            const modePosKey = `last_read_pos_${targetMode}`;
            const modeSaved = localStorage.getItem(modePosKey);
            if (modeSaved) {
                const parsed = JSON.parse(modeSaved);
                if (parsed && typeof parsed.s === 'number' && parsed.s >= 1 && parsed.s <= 114) {
                    return { s: parsed.s, a: parsed.a || 1, isExplicit: parsed.isExplicit };
                }
            }
            const orient = isLandscape ? 'h' : 'v';
            const key = `last_pos_${targetMode}_${orient}`;
            const saved = localStorage.getItem(key);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && typeof parsed.s === 'number' && parsed.s >= 1 && parsed.s <= 114) {
                    return { s: parsed.s, a: parsed.a || 1, isExplicit: parsed.isExplicit };
                }
            }
            if (targetMode === 'mushaf') {
                const legacyKey = `last_pos_${orient}`;
                const legacySaved = localStorage.getItem(legacyKey) || localStorage.getItem('last_read_ayah_global');
                if (legacySaved) {
                    const parsed = JSON.parse(legacySaved);
                    if (parsed && typeof parsed.s === 'number' && parsed.s >= 1 && parsed.s <= 114) {
                        return { s: parsed.s, a: parsed.a || 1, isExplicit: parsed.isExplicit };
                    }
                }
            }
        } catch (e) {}
        return null;
    }, [isLandscape, isWirdMode, localIsMemorizationMode, language]);

    const [visiblePages, setVisiblePages] = useState<number[]>(() => {
        let p = initialPage;
        if (!p && initialSurah) {
            const surah = quranJsonData.surahs[initialSurah - 1];
            const ayah = surah?.ayahs[(initialAyah || 1) - 1];
            if (ayah) p = ayah.page;
        }
        if (!p && isMemorizationMode && memorizationSettings) {
            const surah = quranJsonData.surahs[memorizationSettings.fromSurah - 1];
            const ayah = surah?.ayahs[(memorizationSettings.fromAyah || 1) - 1];
            if (ayah) p = ayah.page;
        }
        if (!p) {
            try {
                let parsed: any = null;
                const orient = initialLandscape ? 'h' : 'v';
                if (isWirdMode) {
                    const saved = localStorage.getItem('last_read_ayah_wird') || localStorage.getItem(`last_pos_wird_${orient}`) || localStorage.getItem('last_pos_wird');
                    if (saved) parsed = JSON.parse(saved);
                } else if (isMemorizationMode) {
                    const saved = localStorage.getItem(`last_pos_memorization_${orient}`);
                    if (saved) parsed = JSON.parse(saved);
                } else {
                    const cluster = getClusterForLanguage(language);
                    const clusterPos = getClusterPosition(cluster, readingMode, initialLandscape);
                    if (clusterPos?.s) {
                        parsed = clusterPos;
                    } else {
                        const modeSaved = localStorage.getItem(`last_read_pos_${readingMode}`);
                        if (modeSaved) parsed = JSON.parse(modeSaved);
                        if (!parsed) {
                            const saved = localStorage.getItem(`last_pos_${readingMode}_${orient}`);
                            if (saved) parsed = JSON.parse(saved);
                        }
                        if (!parsed && readingMode === 'mushaf') {
                            const globalSaved = localStorage.getItem('last_read_ayah_global') || localStorage.getItem(`last_pos_${orient}`);
                            if (globalSaved) parsed = JSON.parse(globalSaved);
                        }
                    }
                }
                if (parsed && typeof parsed.s === 'number') {
                    const surah = quranJsonData.surahs[parsed.s - 1];
                    const ayah = surah?.ayahs[(parsed.a || 1) - 1];
                    if (ayah) p = ayah.page;
                }
            } catch (e) {}
        }
        const targetPage = p || 1;
        return [...new Set([targetPage, targetPage + 1, targetPage + 2, targetPage - 1, targetPage - 2])].filter(n => n > 0 && n <= 604).sort((a: number, b: number) => a - b);
    });

    const [currentAyah, setCurrentAyah] = useState<{ s: number; a: number }>(() => {
        if (initialSurah) {
            return { s: initialSurah, a: initialAyah || 1 };
        }
        if (initialPage) {
            const pageInt = Number(initialPage);
            for (let s = 1; s <= 114; s++) {
                const surah = quranJsonData.surahs[s - 1];
                for (let a = 1; a <= surah.ayahs.length; a++) {
                    if (surah.ayahs[a - 1].page === pageInt) {
                        return { s, a };
                    }
                }
            }
        }
        if (localIsMemorizationMode && localMemorizationSettings) {
            return { s: localMemorizationSettings.fromSurah, a: localMemorizationSettings.fromAyah };
        }
        try {
            const orient = initialLandscape ? 'h' : 'v';
            if (isWirdMode) {
                const saved = localStorage.getItem('last_read_ayah_wird') || localStorage.getItem(`last_pos_wird_${orient}`) || localStorage.getItem('last_pos_wird');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (parsed?.s) return { s: parsed.s, a: parsed.a || 1 };
                }
            } else if (isMemorizationMode) {
                const saved = localStorage.getItem(`last_pos_memorization_${orient}`);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (parsed?.s) return { s: parsed.s, a: parsed.a || 1 };
                }
            } else {
                const cluster = getClusterForLanguage(language);
                const clusterPos = getClusterPosition(cluster, readingMode, initialLandscape);
                if (clusterPos?.s) return { s: clusterPos.s, a: clusterPos.a || 1 };

                const modeSaved = localStorage.getItem(`last_read_pos_${readingMode}`);
                if (modeSaved) {
                    const parsed = JSON.parse(modeSaved);
                    if (parsed?.s) return { s: parsed.s, a: parsed.a || 1 };
                }
                const saved = localStorage.getItem(`last_pos_${readingMode}_${orient}`);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (parsed?.s) return { s: parsed.s, a: parsed.a || 1 };
                }
                if (readingMode === 'mushaf') {
                    const globalSaved = localStorage.getItem('last_read_ayah_global') || localStorage.getItem(`last_pos_${orient}`);
                    if (globalSaved) {
                        const parsed = JSON.parse(globalSaved);
                        if (parsed?.s) return { s: parsed.s, a: parsed.a || 1 };
                    }
                }
            }
        } catch (e) {}
        return { s: 1, a: 1 };
    });

    const currentAyahRef = useRef(currentAyah);
    useEffect(() => { currentAyahRef.current = currentAyah; }, [currentAyah]);

    const handleResumeSession = () => {
        if (savedSession) {
            setLocalIsMemorizationMode(true);
            const nextSettings = {
                ...savedSession.settings,
                rangeRepeatCount: savedSession.rangeRepeatCount,
                currentRepeatCount: savedSession.currentRepeatCount
            };
            setLocalMemorizationSettings(nextSettings);
            memorizationSettingsRef.current = nextSettings;

            jumpToAyahRef.current(savedSession.currentAyah.s, savedSession.currentAyah.a, true);
            setTimeout(() => {
                if (isMountedRef.current) {
                    playAudioRef.current(savedSession.currentAyah.s, savedSession.currentAyah.a);
                }
            }, 500);
        }
        setShowResumeModal(false);
    };

    const handleStartNewFromResume = () => {
        localStorage.removeItem('memorization_session_v1');
        setShowResumeModal(false);
    };

    return {
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
        setSavedSession,
        localIsMemorizationMode,
        localMemorizationSettings,
        isHideMode,
        setIsHideMode,
        showReviewTest,
        setShowReviewTest,
        handleResumeSession,
        handleStartNewFromResume,
    };
};
