import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ReadingMode, JUZ_MAP, toArabic, SURAH_NAMES_AR } from '../components/QuranReader/constants';
import {
    isMadinahPageFontLoadedSync,
    loadMadinahPageFont,
    preloadAdjacentMadinahFonts,
} from '../utils/quran/qpcMadinahData';
import { getClusterForLanguage, saveClusterPosition } from '../utils/quran/quranClusterSync';
import { getAppNotificationSettings } from '../utils/notifications/appNotificationSettings';

interface AutoScrollState {
    isActive: boolean;
    isPaused: boolean;
    elapsedTime: number;
}

interface UseQuranScrollAndJumpParams {
    quranData: any;
    visiblePages: number[];
    setVisiblePages: React.Dispatch<React.SetStateAction<number[]>>;
    readingMode: ReadingMode;
    readingModeRef: React.MutableRefObject<ReadingMode>;
    isMadinahVertical: boolean;
    isMadinahVerticalRef: React.MutableRefObject<boolean>;
    mushafContentRef: React.RefObject<HTMLDivElement | null>;
    currentAyah: { s: number; a: number };
    setCurrentAyah: React.Dispatch<React.SetStateAction<{ s: number; a: number }>>;
    currentAyahRef: React.MutableRefObject<{ s: number; a: number }>;
    selectedAyahRef: React.MutableRefObject<{ s: number; a: number; page: number; juz: number } | null>;
    setHighlightedAyahId: React.Dispatch<React.SetStateAction<string | null>>;
    shouldSkipSavePositionRef: React.MutableRefObject<boolean>;
    posSuffix: string;
    isWirdMode: boolean;
    localIsMemorizationMode: boolean;
    language: string;
    isLandscapeRef: React.MutableRefObject<boolean>;
    isPlaying: boolean;
    autoScrollState: AutoScrollState;
    autoScrollStateRef: React.MutableRefObject<AutoScrollState>;
    stopAudio: () => void;
    playAudio: (s: number, a: number) => void;
    showToast: (message: string) => void;
    showMarkerNotification: (type: 'quarter' | 'sajda' | 'surah', text: string) => void;
    handleSajdahVisible: (surahName: string, sNum: number, ayahNum: number) => void;
    setJuzNotification: React.Dispatch<React.SetStateAction<{ show: boolean; text: string }>>;
    juzTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
    isMountedRef: React.MutableRefObject<boolean>;
    isPageInputActiveRef: React.MutableRefObject<boolean>;
    isBottomPageInputActiveRef: React.MutableRefObject<boolean>;
    setActiveModals: React.Dispatch<React.SetStateAction<string[]>>;
    isHideToolbarsEnabledRef: React.MutableRefObject<boolean>;
    setIsLandscapeUIHidden: React.Dispatch<React.SetStateAction<boolean>>;
    setLastInteractionType: React.Dispatch<React.SetStateAction<'page' | 'ayah'>>;
    saveWirdPosition: (s: number, a: number, explicitPage?: number) => void;
    wirdEndPage: number | null;
    hasShownWirdComplete: boolean;
    setHasShownWirdComplete: React.Dispatch<React.SetStateAction<boolean>>;
    setShowWirdCompleteModal: React.Dispatch<React.SetStateAction<boolean>>;
    initialSurah?: number;
    initialAyah?: number;
    initialPage?: number;
    localMemorizationSettings?: any;
    isJumpingRef: React.MutableRefObject<boolean>;
    hasJumpedRef: React.MutableRefObject<boolean>;
    handleScrollRef: React.MutableRefObject<(() => void) | null>;
    scrollToAyahRef: React.MutableRefObject<(s: number, a: number, instant?: boolean, retries?: number, isPageJump?: boolean) => void>;
    jumpToAyahRef: React.MutableRefObject<(s: number, a: number, instant?: boolean, isPageJump?: boolean) => void>;
    jumpToPageRef: React.MutableRefObject<(pageNum: number, instant?: boolean) => void>;
}

export const useQuranScrollAndJump = ({
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
    initialSurah,
    initialAyah,
    initialPage,
    localMemorizationSettings,
    isJumpingRef,
    hasJumpedRef,
    handleScrollRef,
    scrollToAyahRef,
    jumpToAyahRef,
    jumpToPageRef,
}: UseQuranScrollAndJumpParams) => {
    const [madinahVerticalJump, setMadinahVerticalJump] = useState<{ page: number; seq: number } | null>(null);
    const [showRapidScrollToast, setShowRapidScrollToast] = useState(false);

    const lastManualScrollTopRef = useRef(0);
    const lastManualScrollTimeRef = useRef(0);
    const rapidScrollBurstCountRef = useRef(0);
    const lastRapidScrollDetectedTimeRef = useRef(0);
    const lastRapidScrollToastTimeRef = useRef(0);
    const rapidScrollToastTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lastNotifiedQuarter = useRef<number | null>(null);
    const lastNotifiedJuz = useRef<number | null>(null);
    const madinahJumpTokenRef = useRef(0);
    const lastScrollUpdateTime = useRef(0);
    const persistAyahPosTimerRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (persistAyahPosTimerRef.current) {
                clearTimeout(persistAyahPosTimerRef.current);
                persistAyahPosTimerRef.current = null;
            }
            if (rapidScrollToastTimerRef.current) {
                clearTimeout(rapidScrollToastTimerRef.current);
                rapidScrollToastTimerRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (quranData && currentAyah?.s) {
            const surah = quranData.surahs[currentAyah.s - 1];
            const ayahObj = surah?.ayahs[(currentAyah.a || 1) - 1];
            if (ayahObj?.juz && lastNotifiedJuz.current === null) {
                lastNotifiedJuz.current = ayahObj.juz;
            }
            if (ayahObj?.hizbQuarter && lastNotifiedQuarter.current === null) {
                lastNotifiedQuarter.current = ayahObj.hizbQuarter;
            }
        }
    }, [currentAyah, quranData]);

    const pagesMap = useMemo(() => {
        if (!quranData) return new Map<number, any[]>();
        const map = new Map<number, any[]>();
        quranData.surahs.forEach((surah: any) => {
            surah.ayahs.forEach((ayah: any) => {
                const p = Number(ayah.page);
                if (!map.has(p)) map.set(p, []);
                map.get(p)!.push({ ...ayah, sNum: surah.number, sName: surah.name });
            });
        });
        return map;
    }, [quranData]);

    const getPageData = useCallback((pageNum: number) => {
        return pagesMap.get(Number(pageNum)) || [];
    }, [pagesMap]);

    const scrollToAyah = useCallback((s: number, a: number, instant: boolean = false, retries: number = 50, isPageJump: boolean = false) => {
        if (readingModeRef.current === 'madinah') {
            isJumpingRef.current = false;
            return;
        }
        const container = document.getElementById('mushaf-content');
        if (!container) {
            setTimeout(() => {
                isJumpingRef.current = false;
            }, 600);
            return;
        }

        const el = document.getElementById(`ayah-${s}-${a}`);
        if (el) {
            const scrollElToTop = (element: HTMLElement) => {
                const pageEl = element.closest('.mushaf-page');
                const targetEl = (isPageJump && pageEl) ? (pageEl as HTMLElement) : element;

                // Calculate offsetTop relative to the container to avoid getBoundingClientRect issues with CSS transforms
                let offsetTop = 0;
                let currentEl: HTMLElement | null = targetEl;
                while (currentEl && currentEl !== container) {
                    offsetTop += currentEl.offsetTop;
                    currentEl = currentEl.offsetParent as HTMLElement;
                }

                // Center the ayah in the viewport, unless it's a page jump
                if (!isPageJump) {
                    const containerHeight = container.clientHeight;
                    const elHeight = targetEl.clientHeight;
                    offsetTop = Math.max(0, offsetTop - (containerHeight / 2) + (elHeight / 2));
                }

                if (instant) {
                    container.scrollTop = offsetTop;
                } else {
                    container.scrollTo({ top: offsetTop, behavior: 'smooth' });
                }
            };

            scrollElToTop(el);

            if (instant) {
                // Call it a few more times to combat layout shift from images/fonts loading
                let count = 0;
                const interval = setInterval(() => {
                    const currentEl = document.getElementById(`ayah-${s}-${a}`);
                    if (currentEl) {
                        scrollElToTop(currentEl);
                    }
                    count++;
                    if (count > 5) clearInterval(interval);
                }, 100);
            }

            // Reset jumping state after a short delay to allow scroll to complete
            setTimeout(() => {
                isJumpingRef.current = false;
            }, 600);
        } else if (retries > 0) {
            setTimeout(() => scrollToAyah(s, a, instant, retries - 1, isPageJump), 50);
        } else {
            // Reset jumping state if we failed to find the element
            isJumpingRef.current = false;
        }
    }, [readingModeRef, isJumpingRef]);

    useEffect(() => {
        scrollToAyahRef.current = scrollToAyah;
    }, [scrollToAyah, scrollToAyahRef]);

    const handleAyahClick = useCallback((s: number, a: number, isExplicitSelection: boolean = true) => {
        const surah = quranData?.surahs?.[s - 1];
        const ayahObj = surah?.ayahs?.[a - 1];
        const pageNum = ayahObj?.page || 1;
        const juzNum = ayahObj?.juz || (JUZ_MAP.slice().reverse().find(j => (s > j.s) || (s === j.s && a >= j.a))?.j || 1);

        if (isExplicitSelection) {
            selectedAyahRef.current = { s, a, page: pageNum, juz: juzNum };
            setHighlightedAyahId(`ayah-${s}-${a}`);
        } else {
            selectedAyahRef.current = null;
            setHighlightedAyahId(null);
        }

        setCurrentAyah({ s, a });
        currentAyahRef.current = { s, a };

        if (persistAyahPosTimerRef.current) {
            clearTimeout(persistAyahPosTimerRef.current);
            persistAyahPosTimerRef.current = null;
        }
        if (shouldSkipSavePositionRef.current) {
            return;
        }
        persistAyahPosTimerRef.current = window.setTimeout(() => {
            persistAyahPosTimerRef.current = null;
            if (shouldSkipSavePositionRef.current) return;
            const savedObj = { s, a, page: pageNum, juz: juzNum, isExplicit: isExplicitSelection, ts: Date.now() };
            if (isWirdMode) {
                localStorage.setItem(`last_pos${posSuffix}`, JSON.stringify(savedObj));
                saveWirdPosition(s, a, pageNum);
                return;
            }

            if (localIsMemorizationMode) {
                const orient = isLandscapeRef.current ? 'h' : 'v';
                localStorage.setItem(`last_pos${posSuffix}`, JSON.stringify(savedObj));
                localStorage.setItem(`last_pos_memorization_${orient}`, JSON.stringify(savedObj));
                localStorage.setItem('last_read_ayah_memorization', JSON.stringify(savedObj));
                return;
            }

            const ALL_READING_MODES = ['mushaf', 'madinah', 'tafseer', 'meanings', 'translation', 'bilingual'];
            ALL_READING_MODES.forEach(m => {
                localStorage.setItem(`last_read_pos_${m}`, JSON.stringify(savedObj));
                localStorage.setItem(`last_pos_${m}_v`, JSON.stringify(savedObj));
                localStorage.setItem(`last_pos_${m}_h`, JSON.stringify(savedObj));
            });
            const key = `last_pos${posSuffix}`;
            localStorage.setItem(key, JSON.stringify(savedObj));

            const orient = isLandscapeRef.current ? 'h' : 'v';
            localStorage.setItem('last_read_ayah_global', JSON.stringify(savedObj));
            localStorage.setItem(`last_pos_${orient}`, JSON.stringify(savedObj));
            window.dispatchEvent(new Event('last_read_update'));
            const cluster = getClusterForLanguage(language);
            saveClusterPosition(cluster, savedObj, isLandscapeRef.current);
        }, 180);
    }, [
        posSuffix,
        quranData,
        isWirdMode,
        localIsMemorizationMode,
        language,
        selectedAyahRef,
        setHighlightedAyahId,
        setCurrentAyah,
        currentAyahRef,
        shouldSkipSavePositionRef,
        saveWirdPosition,
        isLandscapeRef,
    ]);

    useEffect(() => {
        const contentEl = mushafContentRef.current;
        if (!contentEl) return;

        const handleScroll = () => {
            if (isJumpingRef.current) return;
            if (readingMode !== 'mushaf' && !(readingMode === 'madinah' && isMadinahVerticalRef.current)) return;

            const { scrollTop, scrollHeight, clientHeight } = contentEl;
            const now = Date.now();

            if (!autoScrollStateRef.current.isActive || autoScrollStateRef.current.isPaused) {
                const timeDiff = now - lastManualScrollTimeRef.current;
                const delta = Math.abs(scrollTop - lastManualScrollTopRef.current);
                if (timeDiff > 0 && timeDiff < 250 && delta > 120) {
                    lastRapidScrollDetectedTimeRef.current = now;
                    rapidScrollBurstCountRef.current += 1;
                    if (rapidScrollBurstCountRef.current >= 2) {
                        if (now - lastRapidScrollToastTimeRef.current > 4000) {
                            lastRapidScrollToastTimeRef.current = now;
                            setShowRapidScrollToast(true);
                            if (rapidScrollToastTimerRef.current) clearTimeout(rapidScrollToastTimerRef.current);
                            rapidScrollToastTimerRef.current = setTimeout(() => {
                                setShowRapidScrollToast(false);
                            }, 2000);
                        }
                        rapidScrollBurstCountRef.current = 0;
                    }
                } else if (timeDiff > 400) {
                    rapidScrollBurstCountRef.current = 0;
                }
                lastManualScrollTopRef.current = scrollTop;
                lastManualScrollTimeRef.current = now;
            }

            if (readingMode === 'mushaf') {
                if (scrollTop < 500) {
                    setVisiblePages(prev => {
                        if (prev.length === 0) return prev;
                        const firstPage = Math.min(...prev);
                        if (firstPage > 1) {
                            const newPage = firstPage - 1;
                            if (!prev.includes(newPage)) {
                                return [newPage, ...prev].sort((a, b) => a - b);
                            }
                        }
                        return prev;
                    });
                }
                if (scrollHeight - scrollTop <= clientHeight + 800) {
                    setVisiblePages(prev => {
                        if (prev.length === 0) return prev;
                        const lastPage = Math.max(...prev);
                        if (lastPage < 604) {
                            const newPage = lastPage + 1;
                            if (!prev.includes(newPage)) {
                                return [...prev, newPage].sort((a, b) => a - b);
                            }
                        }
                        return prev;
                    });
                }
            }

            if (now - lastScrollUpdateTime.current < 50) return;
            lastScrollUpdateTime.current = now;

            const isAudioOrAutoScrollActive = isPlaying || (autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused);
            const contentRect = contentEl.getBoundingClientRect();
            const x = readingMode === 'madinah'
                ? (contentRect.left + contentRect.width / 2)
                : (window.innerWidth / 2);
            const topOffset = isLandscapeRef.current ? 40 : 70;
            const y = readingMode === 'madinah'
                ? (isAudioOrAutoScrollActive
                    ? (contentRect.top + contentRect.height / 2)
                    : (contentRect.top + contentRect.height * 0.28))
                : (isAudioOrAutoScrollActive
                    ? window.innerHeight / 2
                    : Math.max(topOffset + 20, Math.min(topOffset + (window.innerHeight - topOffset) * 0.28, window.innerHeight / 2)));

            const el = document.elementFromPoint(x, y);

            let s = 0;
            let a = 0;
            let juzAttr: string | undefined;
            let quarterAttr: string | undefined;
            let isSajdahVisible = false;
            let sajdahSurahName = '';

            if (readingMode === 'madinah') {
                let wordEl: HTMLElement | null = el?.closest('.madinah-qpc-word') as HTMLElement | null;
                if (!wordEl) {
                    const samplePoints = [
                        { x, y: y - 22 }, { x, y: y + 22 },
                        { x: x - 40, y }, { x: x + 40, y },
                        { x, y: y - 48 }, { x, y: y + 48 },
                    ];
                    for (const pt of samplePoints) {
                        const testEl = document.elementFromPoint(pt.x, pt.y);
                        const found = testEl?.closest('.madinah-qpc-word') as HTMLElement | null;
                        if (found) {
                            wordEl = found;
                            break;
                        }
                    }
                }
                if (!wordEl) {
                    const vPages = contentEl.querySelectorAll('.madinah-vertical-page');
                    let focalPageEl: Element | null = el?.closest('.madinah-vertical-page') || null;
                    if (!focalPageEl && vPages.length > 0) {
                        let bestDist = Infinity;
                        vPages.forEach((vp) => {
                            const rect = vp.getBoundingClientRect();
                            if (rect.top <= y && rect.bottom >= y) {
                                focalPageEl = vp;
                                bestDist = 0;
                            } else {
                                const dist = Math.abs((rect.top + rect.bottom) / 2 - y);
                                if (dist < bestDist) {
                                    bestDist = dist;
                                    focalPageEl = vp;
                                }
                            }
                        });
                    }
                    if (focalPageEl) {
                        const words = focalPageEl.querySelectorAll('.madinah-qpc-word');
                        let closestWord: HTMLElement | null = null;
                        let minDiff = Infinity;
                        words.forEach((wEl) => {
                            const rect = wEl.getBoundingClientRect();
                            const diff = Math.abs((rect.top + rect.bottom) / 2 - y);
                            if (diff < minDiff) {
                                minDiff = diff;
                                closestWord = wEl as HTMLElement;
                            }
                        });
                        if (closestWord) {
                            wordEl = closestWord;
                        } else {
                            const pNum = parseInt((focalPageEl as HTMLElement).dataset.page || '0', 10);
                            const pAyahs = pNum ? pagesMap.get(pNum) : undefined;
                            if (pAyahs && pAyahs.length > 0) {
                                const sorted = [...pAyahs].sort((p1: any, p2: any) =>
                                    p1.sNum !== p2.sNum ? p1.sNum - p2.sNum : p1.numberInSurah - p2.numberInSurah
                                );
                                s = sorted[0].sNum;
                                a = sorted[0].numberInSurah;
                            }
                        }
                    }
                }
                if (wordEl) {
                    s = parseInt(wordEl.dataset.snum || '0', 10);
                    a = parseInt(wordEl.dataset.ayah || '0', 10);
                    isSajdahVisible = wordEl.getAttribute('data-sajdah') === 'true';
                }
                if (s > 0 && a > 0) {
                    const surahObj = quranData?.surahs?.[s - 1];
                    const ayahObj = surahObj?.ayahs?.[a - 1];
                    if (ayahObj?.juz) juzAttr = String(ayahObj.juz);
                    if (ayahObj?.hizbQuarter) quarterAttr = String(ayahObj.hizbQuarter);
                    if (isSajdahVisible) sajdahSurahName = surahObj?.name || SURAH_NAMES_AR[s - 1] || '';
                }
            } else {
                if (!el) return;

                let ayahBlock: Element | null = el.closest('.ayah-text-block, .ayah-item');
                if (!ayahBlock) {
                    const samplePoints = [
                        { x, y: y - 25 }, { x, y: y + 25 },
                        { x: x - 40, y }, { x: x + 40, y },
                        { x, y: y - 55 }, { x, y: y + 55 },
                    ];
                    for (const pt of samplePoints) {
                        const testEl = document.elementFromPoint(pt.x, pt.y);
                        const found = testEl?.closest('.ayah-text-block, .ayah-item');
                        if (found) {
                            ayahBlock = found;
                            break;
                        }
                    }
                }
                if (!ayahBlock) {
                    const pageEl = el.closest('.mushaf-page') || document.elementFromPoint(x, y)?.closest('.mushaf-page');
                    if (pageEl) {
                        const ayahs = pageEl.querySelectorAll('.ayah-text-block');
                        let closest: Element | null = null;
                        let minDiff = Infinity;
                        ayahs.forEach(ayEl => {
                            const rect = ayEl.getBoundingClientRect();
                            const diff = Math.abs((rect.top + rect.bottom) / 2 - y);
                            if (diff < minDiff) {
                                minDiff = diff;
                                closest = ayEl;
                            }
                        });
                        if (closest) {
                            ayahBlock = closest;
                        }
                    }
                }

                if (ayahBlock && ayahBlock.id) {
                    const parts = ayahBlock.id.split('-');
                    if (parts.length === 3) {
                        s = parseInt(parts[1], 10);
                        a = parseInt(parts[2], 10);
                        juzAttr = (ayahBlock as HTMLElement).dataset.juz;
                        quarterAttr = (ayahBlock as HTMLElement).dataset.hizbQuarter;
                        if (ayahBlock.getAttribute('data-sajdah') === 'true') {
                            isSajdahVisible = true;
                            sajdahSurahName = (ayahBlock as HTMLElement).dataset.surah || '';
                        }
                    }
                }
            }

            if (s > 0 && a > 0) {
                if (s !== currentAyahRef.current.s || a !== currentAyahRef.current.a) {
                    const prevAyah = currentAyahRef.current;

                    // Prevent backward jumping of active Ayah/Page due to sub-pixel hit-testing during auto-scroll
                    if (autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused) {
                        if (s < prevAyah.s || (s === prevAyah.s && a < prevAyah.a)) {
                            return;
                        }
                    }

                    setCurrentAyah({ s, a });
                    currentAyahRef.current = { s, a };

                    if (!shouldSkipSavePositionRef.current) {
                        if (isWirdMode) {
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
                        if (curMode === 'mushaf') {
                            localStorage.setItem('last_read_ayah_global', JSON.stringify({ s, a, ts: Date.now() }));
                            localStorage.setItem(`last_pos_${orient}`, JSON.stringify({ s, a, ts: Date.now() }));
                            window.dispatchEvent(new Event('last_read_update'));
                        }
                        const cluster = getClusterForLanguage(language);
                        saveClusterPosition(cluster, { s, a, ts: Date.now() }, isLandscapeRef.current);
                    }

                    // Detect Juz change
                    if (juzAttr) {
                        const newJuz = parseInt(juzAttr, 10);
                        if (lastNotifiedJuz.current !== null && newJuz !== lastNotifiedJuz.current) {
                            if (getAppNotificationSettings().juz !== false) {
                                if (juzTimeoutRef.current) clearTimeout(juzTimeoutRef.current);
                                const isBackward = newJuz < lastNotifiedJuz.current;
                                const text = isBackward
                                    ? `نهاية الجزء ${toArabic(newJuz)}`
                                    : `بداية الجزء ${toArabic(newJuz)}`;
                                setJuzNotification({ show: true, text });
                                juzTimeoutRef.current = setTimeout(() => {
                                    setJuzNotification(prev => ({ ...prev, show: false }));
                                    juzTimeoutRef.current = null;
                                }, 4000);
                            }
                        }
                        lastNotifiedJuz.current = newJuz;
                    }

                    // Detect Quarter change
                    if (quarterAttr) {
                        const newQuarter = parseInt(quarterAttr, 10);
                        if (lastNotifiedQuarter.current !== null && newQuarter !== lastNotifiedQuarter.current) {
                            const isBackward = newQuarter < lastNotifiedQuarter.current;
                            let label = '';
                            const qInHizb = ((newQuarter - 1) % 4) + 1;
                            const hizbNum = Math.ceil(newQuarter / 4);
                            const prevHizbNum = Math.ceil(lastNotifiedQuarter.current / 4);

                            if (isBackward) {
                                if (qInHizb === 4 || hizbNum < prevHizbNum) label = `نهاية الحزب ${toArabic(hizbNum)}`;
                                else if (qInHizb === 3) label = `نصف الحزب ${toArabic(hizbNum)}`;
                                else if (qInHizb === 2) label = `ربع الحزب ${toArabic(hizbNum)}`;
                                else label = `بداية الحزب ${toArabic(hizbNum)}`;
                            } else {
                                if (qInHizb === 1) label = `بداية الحزب ${toArabic(hizbNum)}`;
                                else if (qInHizb === 2) label = `ربع الحزب ${toArabic(hizbNum)}`;
                                else if (qInHizb === 3) label = `نصف الحزب ${toArabic(hizbNum)}`;
                                else if (qInHizb === 4) label = `ثلاثة أرباع الحزب ${toArabic(hizbNum)}`;
                            }

                            showMarkerNotification('quarter', label);
                        }
                        lastNotifiedQuarter.current = newQuarter;
                    }

                    if (isSajdahVisible && sajdahSurahName) {
                        handleSajdahVisible(sajdahSurahName, s, a);
                    }
                }
            }
        };

        handleScrollRef.current = handleScroll;
        contentEl.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            handleScrollRef.current = null;
            contentEl.removeEventListener('scroll', handleScroll);
        };
    }, [
        visiblePages,
        autoScrollState.isActive,
        handleSajdahVisible,
        posSuffix,
        readingMode,
        isMadinahVertical,
        pagesMap,
        quranData,
        mushafContentRef,
        isJumpingRef,
        isMadinahVerticalRef,
        autoScrollStateRef,
        setVisiblePages,
        isPlaying,
        isLandscapeRef,
        currentAyahRef,
        setCurrentAyah,
        shouldSkipSavePositionRef,
        isWirdMode,
        saveWirdPosition,
        localIsMemorizationMode,
        readingModeRef,
        language,
        juzTimeoutRef,
        setJuzNotification,
        showMarkerNotification,
        handleScrollRef,
    ]);

    const jumpToAyah = useCallback((s: number, a: number, instant: boolean = false, isPageJump: boolean = false) => {
        if (isJumpingRef.current && !instant) return;
        setLastInteractionType(isPageJump ? 'page' : 'ayah');
        stopAudio();
        if (!quranData) return;
        const indexedSurah = quranData.surahs[s - 1];
        const surah = indexedSurah?.number === s ? indexedSurah : quranData.surahs.find((su: any) => su.number === s);
        const indexedAyah = surah?.ayahs?.[a - 1];
        const ayah = indexedAyah?.numberInSurah === a ? indexedAyah : surah?.ayahs?.find((ay: any) => ay.numberInSurah === a);
        if (!ayah) return;

        lastNotifiedJuz.current = null;
        lastNotifiedQuarter.current = null;

        const targetPage = Number(ayah.page);

        if (readingModeRef.current === 'madinah') {
            const jumpToken = ++madinahJumpTokenRef.current;
            const commitMadinahJump = () => {
                if (!isMountedRef.current || readingModeRef.current !== 'madinah') return;
                if (jumpToken !== madinahJumpTokenRef.current) return;

                preloadAdjacentMadinahFonts(targetPage);
                if (isMadinahVerticalRef.current) {
                    isJumpingRef.current = true;
                    setMadinahVerticalJump({ page: targetPage, seq: Date.now() + Math.random() });
                    setTimeout(() => {
                        isJumpingRef.current = false;
                    }, 350);
                } else {
                    isJumpingRef.current = false;
                }
                handleAyahClick(s, a);
                if (!isPageInputActiveRef.current && !isBottomPageInputActiveRef.current) {
                    setActiveModals([]);
                }
            };

            const isTargetReady =
                isMadinahPageFontLoadedSync(targetPage) &&
                isMadinahPageFontLoadedSync(1);

            if (isTargetReady) {
                commitMadinahJump();
            } else {
                if (!isPageInputActiveRef.current && !isBottomPageInputActiveRef.current) {
                    setActiveModals([]);
                }
                Promise.all([
                    loadMadinahPageFont(targetPage),
                    loadMadinahPageFont(1),
                ]).then(() => {
                    commitMadinahJump();
                });
            }
            return;
        }

        isJumpingRef.current = true;
        setVisiblePages([...new Set([targetPage, targetPage + 1, targetPage + 2, targetPage - 1, targetPage - 2])].filter(n => n > 0 && n <= 604).sort((a: number, b: number) => a - b));
        handleAyahClick(s, a);
        if (!isPageInputActiveRef.current && !isBottomPageInputActiveRef.current) {
            setActiveModals([]);
        }

        scrollToAyah(s, a, instant, 50, isPageJump);
        if (isHideToolbarsEnabledRef.current || isLandscapeRef.current) {
            setIsLandscapeUIHidden(true);
        }
    }, [
        quranData,
        handleAyahClick,
        stopAudio,
        scrollToAyah,
        isJumpingRef,
        setLastInteractionType,
        readingModeRef,
        isMountedRef,
        isMadinahVerticalRef,
        isPageInputActiveRef,
        isBottomPageInputActiveRef,
        setActiveModals,
        setVisiblePages,
        isHideToolbarsEnabledRef,
        isLandscapeRef,
        setIsLandscapeUIHidden,
    ]);

    useEffect(() => {
        jumpToAyahRef.current = jumpToAyah;
    }, [jumpToAyah, jumpToAyahRef]);

    const jumpToPage = useCallback((pageNum: number, instant: boolean = true) => {
        if (!quranData || isNaN(pageNum) || pageNum < 1 || pageNum > 604) return;
        setLastInteractionType('page');

        const pageData = getPageData(pageNum);
        if (pageData && pageData.length > 0) {
            const sortedAyahs = [...pageData].sort((a: any, b: any) => {
                if (a.sNum !== b.sNum) return a.sNum - b.sNum;
                return a.numberInSurah - b.numberInSurah;
            });
            const firstAyah = sortedAyahs[0];
            jumpToAyah(firstAyah.sNum, firstAyah.numberInSurah, instant, true);
        } else {
            showToast(`لا توجد بيانات لصفحة ${toArabic(pageNum)}`);
        }
    }, [quranData, jumpToAyah, getPageData, showToast, setLastInteractionType]);

    useEffect(() => {
        jumpToPageRef.current = jumpToPage;
    }, [jumpToPage, jumpToPageRef]);

    useEffect(() => {
        if (hasJumpedRef.current) return;
        hasJumpedRef.current = true;
        const isMadinah = readingModeRef.current === 'madinah';

        if (initialSurah && initialAyah) {
            jumpToAyah(initialSurah, initialAyah, true);
            if (!isMadinah) {
                setTimeout(() => {
                    if (isMountedRef.current) {
                        jumpToAyah(initialSurah, initialAyah, true);
                    }
                }, 50);
            }
            return;
        }

        if (localIsMemorizationMode && localMemorizationSettings) {
            setTimeout(() => {
                const startS = localMemorizationSettings.fromSurah;
                const startA = localMemorizationSettings.fromAyah;
                jumpToAyah(startS, startA, true);
                setTimeout(() => {
                    if (isMountedRef.current) {
                        if (!localMemorizationSettings.isReviewMode) {
                            playAudio(startS, startA);
                        }
                    }
                }, 500);
            }, 0);
        } else if (initialPage) {
            if (isMadinah) {
                jumpToPage(initialPage, true);
            } else {
                setTimeout(() => {
                    jumpToPage(initialPage, true);
                }, 0);
            }
        } else {
            const key = posSuffix;
            const lastPos = JSON.parse(localStorage.getItem(`last_pos${key}`) || '{}');
            if (isMadinah) {
                if (lastPos.s && (lastPos.s !== currentAyahRef.current.s || lastPos.a !== currentAyahRef.current.a)) {
                    jumpToAyah(lastPos.s, lastPos.a || 1, true);
                }
            } else {
                setTimeout(() => {
                    jumpToAyah(lastPos.s || 1, lastPos.a || 1, true);
                }, 0);
            }
        }
    }, [
        jumpToAyah,
        jumpToPage,
        posSuffix,
        initialSurah,
        initialAyah,
        initialPage,
        localIsMemorizationMode,
        localMemorizationSettings,
        playAudio,
        hasJumpedRef,
        readingModeRef,
        isMountedRef,
        currentAyahRef,
    ]);

    useEffect(() => {
        if (initialSurah && initialAyah) {
            jumpToAyah(initialSurah, initialAyah, true);
        }
    }, [initialSurah, initialAyah, jumpToAyah]);

    const handleMadinahPageChange = useCallback((newPage: number) => {
        const clamped = Math.max(1, Math.min(604, newPage));
        const pageData = getPageData(clamped);
        if (!pageData || pageData.length === 0) return;

        const sorted = [...pageData].sort((a: any, b: any) => {
            if (a.sNum !== b.sNum) return a.sNum - b.sNum;
            return a.numberInSurah - b.numberInSurah;
        });
        const firstAyah = sorted[0];
        if (!firstAyah) return;

        handleAyahClick(firstAyah.sNum, firstAyah.numberInSurah, false);

        if (isWirdMode && wirdEndPage !== null && clamped >= wirdEndPage && !hasShownWirdComplete) {
            setHasShownWirdComplete(true);
            setShowWirdCompleteModal(true);
        }
    }, [getPageData, handleAyahClick, isWirdMode, wirdEndPage, hasShownWirdComplete, setHasShownWirdComplete, setShowWirdCompleteModal]);

    return {
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
    };
};
