import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Preferences } from '@capacitor/preferences';
import { ReadingMode } from '../components/QuranReader/constants';
import { getDayRange } from '../components/QuranReader/QuranReaderInlineModals';
import { syncDailyWirdNotifications, getWirdDayRange } from '../services/dailyWirdNotificationService';
import { loadMadinahPageFont } from '../utils/quran/qpcMadinahData';
import { restoreHomeThemeDOMInstantly } from '../context/ThemeContext';
import { markQuranMicroHintUsed } from '../components/QuranReader/QuranMicroHints';

interface UseQuranWirdAndBookmarksParams {
    isWirdMode: boolean;
    localIsMemorizationMode: boolean;
    readingMode: ReadingMode;
    readingModeRef: React.MutableRefObject<ReadingMode>;
    initialLandscape: boolean;
    isLandscape: boolean;
    isLandscapeRef: React.MutableRefObject<boolean>;
    bookmarkSuffix: string;
    quranData: any;
    currentAyah: { s: number; a: number };
    currentAyahRef: React.MutableRefObject<{ s: number; a: number }>;
    jumpToPageRef: React.MutableRefObject<(pageNum: number, instant?: boolean) => void>;
    showToast: (message: string) => void;
    onNavigate: (pageId: string, params?: any) => void;
    isEn: boolean;
    activeModals: string[];
    openModalRef: React.MutableRefObject<(modalName: string, params?: any) => void>;
}

export const useQuranWirdAndBookmarks = ({
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
}: UseQuranWirdAndBookmarksParams) => {
    const loadBookmarksForMode = useCallback((targetMode: string): any[] => {
        try {
            const bKey = `quran_bookmarks_list_${targetMode}`;
            const saved = localStorage.getItem(bKey);
            if (saved) return JSON.parse(saved);

            const orient = isLandscape ? 'h' : 'v';
            const suffixed = localStorage.getItem(`quran_bookmarks_list_${targetMode}_${orient}`);
            if (suffixed) return JSON.parse(suffixed);

            if (targetMode === 'mushaf') {
                const legacy = localStorage.getItem('quran_bookmarks_list_v') || localStorage.getItem('quran_bookmarks_list_h') || localStorage.getItem('quran_bookmarks_list');
                if (legacy) return JSON.parse(legacy);
            }
        } catch (e) {}
        return [];
    }, [isLandscape]);

    const [bookmarks, setBookmarks] = useState(() => {
        const mode = initialLandscape ? '_h' : '_v';
        const bSuffix = (localIsMemorizationMode ? `_memorization_${mode}` : isWirdMode ? `_wird_${mode}` : readingMode === 'mushaf' ? mode : `_${readingMode}_${mode}`);
        return JSON.parse(localStorage.getItem('quran_bookmarks_list' + bSuffix) || '[]');
    });

    // Update bookmarks when mode or tajweed changes
    useEffect(() => {
        const savedBookmarks = localStorage.getItem('quran_bookmarks_list' + bookmarkSuffix);
        const parsedBookmarks = savedBookmarks ? JSON.parse(savedBookmarks) : [];
        setBookmarks(parsedBookmarks);
    }, [bookmarkSuffix]);

    const isBookmarksModalOpen = activeModals.includes('bookmarks-modal');
    useEffect(() => {
        if (isBookmarksModalOpen) {
            const list = loadBookmarksForMode(readingMode);
            setBookmarks(list);
            if (readingMode === 'madinah' && list.length > 0) {
                for (let i = 0; i < Math.min(list.length, 10); i++) {
                    const b = list[i];
                    const bp = Number(b?.page || quranData?.surahs?.[b?.s - 1]?.ayahs?.[b?.a - 1]?.page);
                    if (bp >= 1 && bp <= 604) {
                        void loadMadinahPageFont(bp);
                    }
                }
            }
        }
    }, [isBookmarksModalOpen, bookmarkSuffix, readingMode, loadBookmarksForMode, quranData]);

    const saveBookmark = () => {
        markQuranMicroHintUsed(readingModeRef.current, 'bookmark_btn');
        const current = currentAyahRef.current;
        if (!current) { showToast('اختر آية أولاً'); return; }
        const appLang = localStorage.getItem('app_language') || 'ar';
        const isEnLocale = appLang === 'en';
        const date = new Date();
        const newBookmark = {
            id: Date.now(),
            s: current.s,
            a: current.a,
            date: date.toLocaleDateString(isEnLocale ? 'en-US' : 'ar-EG', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }),
            time: date.toLocaleTimeString(isEnLocale ? 'en-US' : 'ar-EG', { hour: '2-digit', minute: '2-digit' })
        };
        const newBookmarks = [newBookmark, ...(bookmarks || [])];
        localStorage.setItem('quran_bookmarks_list' + bookmarkSuffix, JSON.stringify(newBookmarks));
        localStorage.setItem(`quran_bookmarks_list_${readingMode}`, JSON.stringify(newBookmarks));
        setBookmarks(newBookmarks);
        showToast(`تم حفظ الإشارة المرجعية`);
    };

    const deleteBookmark = (id: number) => {
        const newBookmarks = bookmarks.filter((b: any) => b.id !== id);
        localStorage.setItem('quran_bookmarks_list' + bookmarkSuffix, JSON.stringify(newBookmarks));
        localStorage.setItem(`quran_bookmarks_list_${readingMode}`, JSON.stringify(newBookmarks));
        setBookmarks(newBookmarks);
    };

    const bookmarkButtonTimerRef = useRef<number | null>(null);
    const handleBookmarkButtonPointerDown = (e: React.PointerEvent | React.TouchEvent) => {
        if (e && e.type === 'touchstart') {
            // Prevent pointer events if touch is handled
            e.preventDefault();
        }
        markQuranMicroHintUsed(readingModeRef.current, 'bookmark_btn');
        if (bookmarkButtonTimerRef.current) return;
        bookmarkButtonTimerRef.current = window.setTimeout(() => {
            bookmarkButtonTimerRef.current = null;
            openModalRef.current('bookmarks-modal');
        }, 500);
    };

    const handleBookmarkButtonPointerUp = (e: React.PointerEvent | React.TouchEvent) => {
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

    const [wirdEndPage, setWirdEndPage] = useState<number | null>(null);
    const [showWirdCompleteModal, setShowWirdCompleteModal] = useState(false);
    const [hasShownWirdComplete, setHasShownWirdComplete] = useState(false);
    const currentWirdDayRef = useRef<number>(1);
    const wirdCompletionTriggeredRef = useRef<number | null>(null);

    useEffect(() => {
        if (isWirdMode) {
            const saved = localStorage.getItem('dailyWirdSettings_v2');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    const activeProfile = parsed.profiles?.find((p: any) => p.id === parsed.activeId);
                    if (activeProfile && activeProfile.isActive) {
                        currentWirdDayRef.current = activeProfile.currentDay;
                        const { end } = getDayRange(activeProfile.currentDay, activeProfile);
                        setWirdEndPage(end);
                    }
                } catch (e) {}
            }
        }
    }, [isWirdMode]);

    const autoSaveDailyWirdCompletion = useCallback((finishedWirdEndPage?: number) => {
        const saved = localStorage.getItem('dailyWirdSettings_v2');
        if (!saved) return;
        try {
            const parsed = JSON.parse(saved);
            const activeProfile = parsed.profiles?.find((p: any) => p.id === parsed.activeId);
            if (!activeProfile) return;

            const TOTAL_PAGES_COUNT = 604;
            const getTotalDaysCount = (st: any) => {
                return st.mode === 'days' ? st.value : Math.ceil(TOTAL_PAGES_COUNT / st.value);
            };
            const totalDays = getTotalDaysCount(activeProfile);
            const todayStr = new Date().toISOString().split('T')[0];

            let dayToComplete = currentWirdDayRef.current || activeProfile.currentDay;
            if (finishedWirdEndPage) {
                for (let d = 1; d <= totalDays; d++) {
                    const range = getWirdDayRange(d, activeProfile);
                    if (range.end === finishedWirdEndPage || (d === dayToComplete && finishedWirdEndPage >= range.start && finishedWirdEndPage <= range.end)) {
                        dayToComplete = d;
                        break;
                    }
                }
            }

            // CRITICAL IDEMPOTENT PROTECTION:
            // If dayToComplete is ALREADY in completedDays, DO NOT increment currentDay or touch completedDays!
            if (activeProfile.completedDays && activeProfile.completedDays.includes(dayToComplete)) {
                if (activeProfile.lastPage !== undefined || activeProfile.lastAyah !== undefined) {
                    const updatedProfile = {
                        ...activeProfile,
                        lastPage: undefined,
                        lastAyah: undefined
                    };
                    const newProfiles = parsed.profiles.map((p: any) => p.id === activeProfile.id ? updatedProfile : p);
                    const dataStr = JSON.stringify({ ...parsed, profiles: newProfiles });
                    localStorage.setItem('dailyWirdSettings_v2', dataStr);
                    try { Preferences.set({ key: 'dailyWirdSettings_v2', value: dataStr }); } catch (e) {}
                }
                return;
            }

            // Single step increment: add dayToComplete to completedDays, set currentDay = dayToComplete + 1
            const newCompleted = Array.from(new Set([...(activeProfile.completedDays || []), dayToComplete])).sort((a, b) => a - b);
            const newCurrentDay = Math.min(dayToComplete + 1, totalDays);

            const newProfile = {
                ...activeProfile,
                completedDays: newCompleted,
                currentDay: newCurrentDay,
                lastPage: undefined,
                lastAyah: undefined,
                lastCompletedDate: todayStr
            };

            currentWirdDayRef.current = newCurrentDay;

            const newProfiles = parsed.profiles.map((p: any) => p.id === activeProfile.id ? newProfile : p);
            const dataStr = JSON.stringify({ ...parsed, profiles: newProfiles });
            localStorage.setItem('dailyWirdSettings_v2', dataStr);
            try {
                Preferences.set({ key: 'dailyWirdSettings_v2', value: dataStr });
            } catch (e) {}
            syncDailyWirdNotifications();
        } catch (e) {
            console.error('Error auto-saving daily wird progress:', e);
        }
    }, []);

    useEffect(() => {
        if (isWirdMode && wirdEndPage && quranData && !hasShownWirdComplete) {
            const ayah = quranData.surahs[currentAyah.s - 1]?.ayahs[currentAyah.a - 1];
            if (ayah) {
                const isPastEnd = ayah.page > wirdEndPage;
                const isFinalAyahOfQuran = wirdEndPage >= 604 && ayah.page === 604 && currentAyah.s === 114 && currentAyah.a === 6;
                if (isPastEnd || isFinalAyahOfQuran) {
                    if (wirdCompletionTriggeredRef.current === wirdEndPage) {
                        return;
                    }
                    wirdCompletionTriggeredRef.current = wirdEndPage;
                    setHasShownWirdComplete(true);
                    setShowWirdCompleteModal(true);
                    autoSaveDailyWirdCompletion(wirdEndPage);
                }
            }
        }
    }, [currentAyah, wirdEndPage, quranData, hasShownWirdComplete, isWirdMode, autoSaveDailyWirdCompletion]);

    const isWirdModeRef = useRef(isWirdMode);
    useEffect(() => { isWirdModeRef.current = isWirdMode; }, [isWirdMode]);
    const wirdEndPageRef = useRef(wirdEndPage);
    useEffect(() => { wirdEndPageRef.current = wirdEndPage; }, [wirdEndPage]);

    const saveWirdPosition = useCallback((s: number, a: number, explicitPage?: number) => {
        if (!isWirdModeRef.current) return;
        if (showWirdCompleteModal || hasShownWirdComplete) return;

        let pageNum = explicitPage;
        let juzNum = 1;
        if (quranData) {
            const surah = quranData.surahs?.[s - 1];
            const ayah = surah?.ayahs?.[a - 1];
            if (!pageNum && ayah?.page) {
                pageNum = ayah.page;
            }
            if (ayah?.juz) {
                juzNum = ayah.juz;
            }
        }
        if (!pageNum) return;

        if (wirdEndPageRef.current && pageNum > wirdEndPageRef.current) {
            return;
        }

        const savedObj = { s, a, page: pageNum, juz: juzNum, ts: Date.now() };
        const orient = isLandscapeRef.current ? 'h' : 'v';
        localStorage.setItem(`last_pos_wird_${orient}`, JSON.stringify(savedObj));
        localStorage.setItem('last_read_ayah_wird', JSON.stringify(savedObj));
        localStorage.setItem('last_pos_wird', JSON.stringify(savedObj));

        // Update dailyWirdSettings_v2 profile so Daily Wird page immediately sees the current ayah & page
        const saved = localStorage.getItem('dailyWirdSettings_v2');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const activeProfileIndex = parsed.profiles?.findIndex((p: any) => p.id === parsed.activeId);
                if (activeProfileIndex !== -1) {
                    const prof = parsed.profiles[activeProfileIndex];
                    if (prof.lastPage !== pageNum || prof.lastAyah?.s !== s || prof.lastAyah?.a !== a) {
                        prof.lastPage = pageNum;
                        prof.lastAyah = { s, a };
                        const dataStr = JSON.stringify(parsed);
                        localStorage.setItem('dailyWirdSettings_v2', dataStr);
                        try {
                            Preferences.set({ key: 'dailyWirdSettings_v2', value: dataStr });
                        } catch (e) {}
                    }
                }
            } catch (e) {}
        }
    }, [showWirdCompleteModal, hasShownWirdComplete, quranData, isLandscapeRef]);

    useEffect(() => {
        if (isWirdMode && quranData && !showWirdCompleteModal && !hasShownWirdComplete) {
            const ayah = quranData.surahs[currentAyah.s - 1]?.ayahs[currentAyah.a - 1];
            if (ayah) {
                saveWirdPosition(currentAyah.s, currentAyah.a, ayah.page);
            }
        }
    }, [currentAyah, isWirdMode, quranData, showWirdCompleteModal, hasShownWirdComplete, saveWirdPosition]);

    const handleMarkWirdCompleted = useCallback((action: 'continue' | 'daily-wird' | 'home' = 'continue') => {
        setShowWirdCompleteModal(false);

        const saved = localStorage.getItem('dailyWirdSettings_v2');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const activeProfile = parsed.profiles?.find((p: any) => p.id === parsed.activeId);
                if (activeProfile) {
                    // Ensure lastPage and lastAyah remain cleared so starting next wird begins from its first page
                    if (activeProfile.lastPage !== undefined || activeProfile.lastAyah !== undefined) {
                        const updatedProfile = {
                            ...activeProfile,
                            lastPage: undefined,
                            lastAyah: undefined
                        };
                        const newProfiles = parsed.profiles.map((p: any) => p.id === activeProfile.id ? updatedProfile : p);
                        const dataStr = JSON.stringify({ ...parsed, profiles: newProfiles });
                        localStorage.setItem('dailyWirdSettings_v2', dataStr);
                        try {
                            Preferences.set({ key: 'dailyWirdSettings_v2', value: dataStr });
                        } catch (e) {}
                    }

                    if (action === 'continue') {
                        currentWirdDayRef.current = activeProfile.currentDay;
                        const nextDayRange = getDayRange(activeProfile.currentDay, activeProfile);
                        setWirdEndPage(nextDayRange.end);
                        setHasShownWirdComplete(false);
                        wirdCompletionTriggeredRef.current = null;
                        jumpToPageRef.current(nextDayRange.start, true);
                        showToast(isEn ? 'Portion saved! Continuing to next day' : 'تم حفظ الورد ومتابعة قراءة ورد اليوم التالي');
                        return;
                    }
                }
            } catch (e) {
                console.error('Error handling wird completion modal action:', e);
            }
        }

        if (action === 'daily-wird') {
            showToast(isEn ? 'Daily portion saved successfully' : 'تم حفظ الورد اليومي بنجاح');
            restoreHomeThemeDOMInstantly();
            onNavigate('daily-wird');
        } else if (action === 'home') {
            showToast(isEn ? 'Daily portion saved successfully' : 'تم حفظ الورد اليومي بنجاح');
            restoreHomeThemeDOMInstantly();
            onNavigate('home');
        }
    }, [showToast, onNavigate, isEn, jumpToPageRef]);

    return {
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
    };
};
