import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ReadingMode, SURAH_NAMES_AR } from '../components/QuranReader/constants';
import {
    preloadEmbeddedQuranExplanations,
    ensureEmbeddedTafseerLoaded,
    ensureEmbeddedMeaningsLoaded,
    ensureEmbeddedTranslationLoaded,
    getEmbeddedJalalaynSurahSync,
    getEmbeddedMeaningsSurahSync,
    getEmbeddedTranslationSurahSync,
    getEmbeddedTafseerRawSurahs,
    getEmbeddedMeaningsRawArray,
    getEmbeddedTranslationRawArray,
} from '../utils/quran/embeddedQuranExplanations';
import { markQuranMicroHintUsed } from '../components/QuranReader/QuranMicroHints';
import {
    getClusterForLanguage,
    syncClusterSettings,
    saveMadinahSettings,
} from '../utils/quran/quranClusterSync';
import { recordSmartInterest } from '../services/smartEngine/smartEngineService';

interface AutoScrollState {
    isActive: boolean;
    isPaused: boolean;
    elapsedTime: number;
}

interface UseQuranExplanationsParams {
    quranData: any;
    page: string;
    setCurrentPage: (page: string) => void;
    readingMode: ReadingMode;
    readingModeRef: React.MutableRefObject<ReadingMode>;
    settings: any;
    setSettings: React.Dispatch<React.SetStateAction<any>>;
    isWirdMode: boolean;
    localIsMemorizationMode: boolean;
    themeSuffix: string;
    language: string;
    isEn: boolean;
    isLandscapeRef: React.MutableRefObject<boolean>;
    isFloatingMenuOpenRef: React.MutableRefObject<boolean>;
    lastFloatingMenuCloseTimeRef: React.MutableRefObject<number>;
    setIsFloatingMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
    autoScrollStateRef: React.MutableRefObject<AutoScrollState>;
    autoScrollPausedRef: React.MutableRefObject<boolean>;
    setAutoScrollStateRef: React.MutableRefObject<React.Dispatch<React.SetStateAction<AutoScrollState>>>;
    showToast: (message: string) => void;
}

export const useQuranExplanations = ({
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
}: UseQuranExplanationsParams) => {
    const [tafseerInfo, setTafseerInfo] = useState<{
        isOpen: boolean;
        s: number;
        a: number;
        text: string;
        surahName: string;
        wasAutoscrolling: boolean;
        openedFromAyahMenu?: boolean;
    }>({ isOpen: false, s: 0, a: 0, text: '', surahName: '', wasAutoscrolling: false, openedFromAyahMenu: false });

    const [multiTafseerInfo, setMultiTafseerInfo] = useState<{
        isOpen: boolean;
        s: number;
        a: number;
        surahName?: string;
        ayahText?: string;
        fromSingleTafseer?: boolean;
    }>({ isOpen: false, s: 1, a: 1 });

    const [tafseerSelectionInfo, setTafseerSelectionInfo] = useState({
        isOpen: false,
        s: 0,
        a: 0,
        wasAutoscrolling: false,
    });
    const [isTafseerLoading, setIsTafseerLoading] = useState(false);
    const tafseerCache = useRef<any>({});

    const [quranMeaningsInfo, setQuranMeaningsInfo] = useState<{
        isOpen: boolean;
        s: number;
        a: number;
        text: string;
        surahName: string;
        wasAutoscrolling: boolean;
        openedFromAyahMenu?: boolean;
    }>({ isOpen: false, s: 0, a: 0, text: '', surahName: '', wasAutoscrolling: false, openedFromAyahMenu: false });
    const [isQuranMeaningsLoading, setIsQuranMeaningsLoading] = useState(false);
    const quranMeaningsCache = useRef<any>(null);
    const quranMeaningsMapRef = useRef<Map<string, string> | null>(null);

    const [quranTranslationInfo, setQuranTranslationInfo] = useState<{
        isOpen: boolean;
        s: number;
        a: number;
        text: string;
        surahName: string;
        wasAutoscrolling: boolean;
        openedFromAyahMenu?: boolean;
    }>({ isOpen: false, s: 0, a: 0, text: '', surahName: '', wasAutoscrolling: false, openedFromAyahMenu: false });
    const [isQuranTranslationLoading, setIsQuranTranslationLoading] = useState(false);
    const quranTranslationCache = useRef<any>(null);

    const [surahContentModal, setSurahContentModal] = useState<{
        isOpen: boolean;
        mode: 'tafseer' | 'meanings' | 'translation';
        s: number;
        a: number;
        surahName: string;
        wasAutoscrolling: boolean;
    }>({ isOpen: false, mode: 'tafseer', s: 1, a: 1, surahName: '', wasAutoscrolling: false });

    // English Tafseer state (strictly for bilingual and translation modes)
    const [englishTafseerInfo, setEnglishTafseerInfo] = useState<{
        isOpen: boolean;
        s: number;
        a: number;
        wasAutoscrolling: boolean;
        openedFromAyahMenu?: boolean;
    }>({
        isOpen: false,
        s: 1,
        a: 1,
        wasAutoscrolling: false,
        openedFromAyahMenu: false,
    });

    const handleAyahNumberLongPress = useCallback((s: number, a: number) => {
        if (isFloatingMenuOpenRef.current || Date.now() - lastFloatingMenuCloseTimeRef.current < 500) {
            lastFloatingMenuCloseTimeRef.current = Date.now();
            setIsFloatingMenuOpen(false);
            return;
        }
        // Strictly ONLY in bilingual and translation modes! Never in mushaf mode!
        if (readingMode !== 'bilingual' && readingMode !== 'translation') {
            return;
        }
        markQuranMicroHintUsed(readingModeRef.current, 'verse_num');
        const wasAutoscrolling = autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused;
        if (wasAutoscrolling) {
            autoScrollPausedRef.current = true;
            const newState = { ...autoScrollStateRef.current, isPaused: true };
            autoScrollStateRef.current = newState;
            setAutoScrollStateRef.current(newState);
        }
        setEnglishTafseerInfo({
            isOpen: true,
            s,
            a,
            wasAutoscrolling,
        });
        recordSmartInterest('tafseer', 1);
    }, [readingMode, readingModeRef, isFloatingMenuOpenRef, lastFloatingMenuCloseTimeRef, setIsFloatingMenuOpen, autoScrollStateRef, autoScrollPausedRef, setAutoScrollStateRef]);

    useEffect(() => {
        const updateCurrentPage = () => {
            if (tafseerInfo.isOpen) setCurrentPage('tafseer');
            else if (quranMeaningsInfo.isOpen) setCurrentPage('meanings');
            else if (quranTranslationInfo.isOpen) setCurrentPage('translation');
            else setCurrentPage(page);
        };
        const timer = setTimeout(updateCurrentPage, 0);
        return () => clearTimeout(timer);
    }, [tafseerInfo.isOpen, quranMeaningsInfo.isOpen, quranTranslationInfo.isOpen, page, setCurrentPage]);

    // Pre-warm local Tafseer, Word Meanings (O(1) map), and English Translation quietly after mount
    useEffect(() => {
        let cancelled = false;
        const warmTimer = window.setTimeout(() => {
            if (cancelled) return;
            if (!tafseerCache.current['1_ar.jalalayn']) {
                fetch('/assets/data/ar.jalalayn.json')
                    .then(r => r.json())
                    .then(data => {
                        if (cancelled || data?.code !== 200 || !data?.data?.surahs) return;
                        data.data.surahs.forEach((surah: any) => {
                            tafseerCache.current[`${surah.number}_ar.jalalayn`] = surah.ayahs;
                        });
                    })
                    .catch(() => {});
            }
            if (!quranMeaningsMapRef.current) {
                fetch('/tafseer.json')
                    .then(r => r.json())
                    .then(data => {
                        if (cancelled || !Array.isArray(data)) return;
                        quranMeaningsCache.current = data;
                        const map = new Map<string, string>();
                        for (let i = 0; i < data.length; i++) {
                            const item = data[i];
                            if (item?.number && item?.aya) {
                                map.set(`${item.number}:${item.aya}`, item.text || '');
                            }
                        }
                        quranMeaningsMapRef.current = map;
                    })
                    .catch(() => {});
            }
            if (!quranTranslationCache.current) {
                fetch('/en.json')
                    .then(r => r.json())
                    .then(data => {
                        if (!cancelled && data) {
                            quranTranslationCache.current = data;
                        }
                    })
                    .catch(() => {});
            }
        }, 900);

        return () => {
            cancelled = true;
            clearTimeout(warmTimer);
        };
    }, []);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            preloadEmbeddedQuranExplanations();
        }, 120);
        return () => window.clearTimeout(timer);
    }, []);

    const handleTafseerSelect = useCallback((tafseerId: string) => {
        if (tafseerSelectionInfo.wasAutoscrolling) {
            autoScrollPausedRef.current = false;
            const newState = { ...autoScrollStateRef.current, isPaused: false };
            autoScrollStateRef.current = newState;
            setAutoScrollStateRef.current(newState);
        }
        setTafseerSelectionInfo(prev => ({ ...prev, isOpen: false, wasAutoscrolling: false }));

        const newSettings = { ...settings, tafseer: tafseerId };
        setSettings(newSettings);
        if (readingMode === 'madinah' && !isWirdMode && !localIsMemorizationMode) {
            saveMadinahSettings(newSettings, { isLandscape: isLandscapeRef.current });
        } else {
            localStorage.setItem('quran_settings' + themeSuffix, JSON.stringify(newSettings));
            if (!isWirdMode && !localIsMemorizationMode) {
                const cluster = getClusterForLanguage(language);
                syncClusterSettings(cluster, newSettings, isLandscapeRef.current, { readingMode });
            } else {
                window.dispatchEvent(new Event('settings-change'));
            }
        }
        showToast(isEn ? 'Tafseer updated successfully' : 'تم تغيير التفسير بنجاح');
    }, [settings, setSettings, tafseerSelectionInfo.wasAutoscrolling, showToast, isEn, readingMode, isWirdMode, localIsMemorizationMode, themeSuffix, language, isLandscapeRef, autoScrollPausedRef, autoScrollStateRef, setAutoScrollStateRef]);

    useEffect(() => {
        const fetchTafseer = async () => {
            if (!tafseerInfo.isOpen) return;
            recordSmartInterest('tafseer', 1);
            const currentTafseerId = settings.tafseer || 'ar.jalalayn';
            const cacheKey = `${tafseerInfo.s}_${currentTafseerId}`;
            if (tafseerCache.current[cacheKey]) {
                const ayahTafseer = tafseerCache.current[cacheKey]?.[tafseerInfo.a - 1];
                setTafseerInfo(prev => ({ ...prev, text: ayahTafseer?.text || "التفسير غير متوفر لهذه الآية." }));
                setIsTafseerLoading(false);
                return;
            }
            if (currentTafseerId === 'ar.jalalayn') {
                const embeddedSync = getEmbeddedJalalaynSurahSync(tafseerInfo.s);
                if (embeddedSync) {
                    setTafseerInfo(prev => ({ ...prev, text: embeddedSync[tafseerInfo.a] || "التفسير غير متوفر لهذه الآية." }));
                    setIsTafseerLoading(false);
                    return;
                }
            }
            try {
                setIsTafseerLoading(true);
                if (currentTafseerId === 'ar.jalalayn') {
                    await ensureEmbeddedTafseerLoaded();
                    const rawSurahs = getEmbeddedTafseerRawSurahs();
                    if (Array.isArray(rawSurahs)) {
                        rawSurahs.forEach((surah: any) => {
                            tafseerCache.current[`${surah.number}_ar.jalalayn`] = surah.ayahs;
                        });
                    }
                    const embeddedSync = getEmbeddedJalalaynSurahSync(tafseerInfo.s);
                    setTafseerInfo(prev => ({ ...prev, text: embeddedSync?.[tafseerInfo.a] || "التفسير غير متوفر لهذه الآية." }));
                } else {
                    const res = await fetch(`https://api.alquran.cloud/v1/surah/${tafseerInfo.s}/${currentTafseerId}`);
                    const data = await res.json();
                    if (data.code === 200) tafseerCache.current[cacheKey] = data.data.ayahs;
                    else throw new Error('Failed to fetch tafseer data');
                    const ayahTafseer = tafseerCache.current[cacheKey]?.[tafseerInfo.a - 1];
                    setTafseerInfo(prev => ({ ...prev, text: ayahTafseer?.text || "التفسير غير متوفر لهذه الآية." }));
                }
            } catch (e) {
                setTafseerInfo(prev => ({ ...prev, text: 'خطأ في تحميل التفسير. يرجى التحقق من اتصالك بالإنترنت.' }));
            } finally {
                setIsTafseerLoading(false);
            }
        };
        fetchTafseer();
    }, [tafseerInfo.isOpen, tafseerInfo.s, tafseerInfo.a, settings.tafseer]);

    useEffect(() => {
        const fetchQuranMeanings = async () => {
            if (!quranMeaningsInfo.isOpen) return;
            const embeddedSync = getEmbeddedMeaningsSurahSync(quranMeaningsInfo.s);
            if (embeddedSync) {
                setQuranMeaningsInfo(prev => ({
                    ...prev,
                    text: embeddedSync[quranMeaningsInfo.a] || "معاني الكلمات غير متوفرة لهذه الآية.",
                }));
                setIsQuranMeaningsLoading(false);
                return;
            }
            if (quranMeaningsMapRef.current) {
                const foundText = quranMeaningsMapRef.current.get(`${quranMeaningsInfo.s}:${quranMeaningsInfo.a}`);
                setQuranMeaningsInfo(prev => ({
                    ...prev,
                    text: foundText || "معاني الكلمات غير متوفرة لهذه الآية.",
                }));
                setIsQuranMeaningsLoading(false);
                return;
            }
            try {
                setIsQuranMeaningsLoading(true);
                await ensureEmbeddedMeaningsLoaded();
                const rawMeanings = getEmbeddedMeaningsRawArray();
                if (rawMeanings && !quranMeaningsCache.current) {
                    quranMeaningsCache.current = rawMeanings;
                }
                const loadedSurah = getEmbeddedMeaningsSurahSync(quranMeaningsInfo.s);
                setQuranMeaningsInfo(prev => ({
                    ...prev,
                    text: loadedSurah?.[quranMeaningsInfo.a] || "معاني الكلمات غير متوفرة لهذه الآية.",
                }));
            } catch (e) {
                setQuranMeaningsInfo(prev => ({
                    ...prev,
                    text: 'خطأ في تحميل معاني القرآن. يرجى التحقق من اتصالك بالإنترنت.',
                }));
            } finally {
                setIsQuranMeaningsLoading(false);
            }
        };
        fetchQuranMeanings();
    }, [quranMeaningsInfo.isOpen, quranMeaningsInfo.s, quranMeaningsInfo.a]);

    useEffect(() => {
        const fetchQuranTranslation = async () => {
            if (!quranTranslationInfo.isOpen) return;
            const embeddedSync = getEmbeddedTranslationSurahSync(quranTranslationInfo.s);
            if (embeddedSync) {
                setQuranTranslationInfo(prev => ({
                    ...prev,
                    text: embeddedSync[quranTranslationInfo.a] || "الترجمة غير متوفرة لهذه الآية.",
                }));
                setIsQuranTranslationLoading(false);
                return;
            }
            if (quranTranslationCache.current) {
                const translationObj = quranTranslationCache.current[quranTranslationInfo.s - 1]?.verses[quranTranslationInfo.a - 1];
                setQuranTranslationInfo(prev => ({
                    ...prev,
                    text: translationObj?.translation || "الترجمة غير متوفرة لهذه الآية.",
                }));
                setIsQuranTranslationLoading(false);
                return;
            }
            try {
                setIsQuranTranslationLoading(true);
                await ensureEmbeddedTranslationLoaded();
                const rawTranslation = getEmbeddedTranslationRawArray();
                if (rawTranslation) {
                    quranTranslationCache.current = rawTranslation;
                }
                const loadedSurah = getEmbeddedTranslationSurahSync(quranTranslationInfo.s);
                setQuranTranslationInfo(prev => ({
                    ...prev,
                    text: loadedSurah?.[quranTranslationInfo.a] || "الترجمة غير متوفرة لهذه الآية.",
                }));
            } catch (e) {
                setQuranTranslationInfo(prev => ({
                    ...prev,
                    text: 'خطأ في تحميل الترجمة. يرجى التحقق من اتصالك بالإنترنت.',
                }));
            } finally {
                setIsQuranTranslationLoading(false);
            }
        };
        fetchQuranTranslation();
    }, [quranTranslationInfo.isOpen, quranTranslationInfo.s, quranTranslationInfo.a]);

    const handleZoomAyahCard = useCallback((s: number, a: number, explanationText?: string) => {
        const surahObj = quranData?.surahs?.[s - 1];
        const surahName = surahObj?.name || SURAH_NAMES_AR[s - 1] || '';
        const wasAutoscrolling = autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused;
        if (wasAutoscrolling) {
            autoScrollPausedRef.current = true;
            const newState = { ...autoScrollStateRef.current, isPaused: true };
            autoScrollStateRef.current = newState;
            setAutoScrollStateRef.current(newState);
        }
        if (readingModeRef.current === 'meanings') {
            const cachedText = explanationText || quranMeaningsMapRef.current?.get(`${s}:${a}`);
            setIsQuranMeaningsLoading(!cachedText && !quranMeaningsMapRef.current);
            setQuranMeaningsInfo({ isOpen: true, s, a, text: cachedText || '', surahName, wasAutoscrolling, openedFromAyahMenu: false });
        } else {
            const currentTafseerId = settings.tafseer || 'ar.jalalayn';
            const cacheKey = `${s}_${currentTafseerId}`;
            const cachedList = tafseerCache.current[cacheKey];
            const cachedText = explanationText || cachedList?.[a - 1]?.text;
            setIsTafseerLoading(!cachedText && !cachedList);
            setTafseerInfo({ isOpen: true, s, a, text: cachedText || '', surahName, wasAutoscrolling, openedFromAyahMenu: false });
        }
    }, [quranData, settings.tafseer, readingModeRef, autoScrollStateRef, autoScrollPausedRef, setAutoScrollStateRef]);

    return {
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
    };
};
