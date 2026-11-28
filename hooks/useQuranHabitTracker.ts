import { useMemo, useRef, useCallback, useEffect, MutableRefObject, RefObject } from 'react';
import moment from 'moment-hijri';
import { useHabitTracker, QURAN_READING_STANDARDS, getVerifiedPagesReadForDate } from './useHabitTracker';
import { ReadingMode } from '../components/QuranReader/constants';

interface UseQuranHabitTrackerParams {
    pagesMap: Map<number, any[]>;
    mushafContentRef: RefObject<HTMLDivElement | null>;
    readingMode: ReadingMode;
    isMadinahVertical: boolean;
    currentAyahRef: MutableRefObject<{ s: number; a: number }>;
    quranData: any;
    currentPageNumber: number;
    isLoading: boolean;
    isOverlayBlocking: boolean;
    autoScrollStateRef: MutableRefObject<{ isActive: boolean; isPaused: boolean; elapsedTime: number }>;
    settingsRef: MutableRefObject<any>;
    isJumpingRef: MutableRefObject<boolean>;
    showRapidScrollToast: boolean;
    lastRapidScrollDetectedTimeRef: MutableRefObject<number>;
}

export const useQuranHabitTracker = ({
    pagesMap,
    mushafContentRef,
    readingMode,
    isMadinahVertical,
    currentAyahRef,
    quranData,
    currentPageNumber,
    isLoading,
    isOverlayBlocking,
    autoScrollStateRef,
    settingsRef,
    isJumpingRef,
    showRapidScrollToast,
    lastRapidScrollDetectedTimeRef,
}: UseQuranHabitTrackerParams) => {
    // حساب عدد الكلمات الفعلي لكل صفحة في مصحف المدينة النبوية (604 صفحات) لمراعاة الصفحات القصيرة كالفاتحة وأول البقرة
    const pageWordCountsMap = useMemo(() => {
        const counts = new Map<number, number>();
        pagesMap.forEach((ayahs, pNum) => {
            let words = 0;
            for (let i = 0; i < ayahs.length; i++) {
                const text = (ayahs[i]?.text || '').trim();
                if (text) {
                    words += text.split(/\s+/).length;
                }
            }
            counts.set(pNum, words);
        });
        return counts;
    }, [pagesMap]);

    // Smart Real-Time Page Reading Tracker for Habit Tracker (مربّي العبادات)

    // مراجع التتبع الدقيق لمربّي العبادات:
    // 1) التمرير التلقائي: اعتماد جميع أوقات وسرعات التمرير التلقائي واحتساب صفحاتها بدقة دون ضياع عند انتقال الصفحات
    // 2) التمرير اليدوي: احتساب القراءة بدءاً من 10 دقائق فأكثر للجزء الواحد (30 ثانية كحد أدنى للصفحة القياسية) مع منع التمرير السريع
    const autoScrollPageDwellSecsRef = useRef<Record<number, number>>({});
    const lastAutoScrollPageRef = useRef<number | null>(null);
    const habitPageDwellSecsRef = useRef<Record<number, number>>({});
    const lastActiveHabitPageRef = useRef<number | null>(null);
    const continuousStaySecsRef = useRef<number>(0);
    const manualActiveReadingSecsRef = useRef<number>(0);
    const manualCumulativeRequiredSecsRef = useRef<number>(0);

    const getCurrentlyVisiblePage = useCallback((): number => {
        const content = mushafContentRef.current;
        if (content && (readingMode === 'mushaf' || (readingMode === 'madinah' && isMadinahVertical))) {
            const pages = content.querySelectorAll('.mushaf-page, .madinah-vertical-page');
            if (pages.length > 0) {
                const containerRect = content.getBoundingClientRect();
                const focalY = containerRect.top + containerRect.height * 0.45;

                let bestPage = 0;
                let closestDist = Infinity;

                for (let i = 0; i < pages.length; i++) {
                    const pageEl = pages[i] as HTMLElement;
                    const rect = pageEl.getBoundingClientRect();
                    const pageNum = parseInt(pageEl.dataset.page || pageEl.id.replace('madinah-page-', '').replace('page-', ''), 10);
                    if (!pageNum || pageNum < 1 || pageNum > 604) continue;

                    if (rect.top <= focalY && rect.bottom >= focalY) {
                        return pageNum;
                    }

                    const pageCenter = rect.top + rect.height / 2;
                    const dist = Math.abs(pageCenter - focalY);
                    if (dist < closestDist) {
                        closestDist = dist;
                        bestPage = pageNum;
                    }
                }

                if (bestPage >= 1 && bestPage <= 604) {
                    return bestPage;
                }
            }
        }

        // Fallback for non-mushaf mode or before DOM layout
        if (currentAyahRef.current?.s && quranData?.surahs) {
            const s = currentAyahRef.current.s;
            const a = currentAyahRef.current.a;
            const pg = quranData.surahs[s - 1]?.ayahs?.find((ay: any) => ay.numberInSurah === a)?.page;
            if (pg && pg >= 1 && pg <= 604) return pg;
        }

        return currentPageNumber || 1;
    }, [currentPageNumber, quranData, readingMode, isMadinahVertical, mushafContentRef, currentAyahRef]);

    const getManualRequiredSecondsForPage = useCallback((pageNum: number): number => {
        // ثالثاً: الصفحة الأولى والثانية بالمصحف يتم احتسابهما بأي وقت نظراً لصغر هاتين الصفحتين
        if (pageNum === 1 || pageNum === 2) {
            return 1;
        }
        // ثانياً: عند التمرير اليدوي يتم احتساب كل صفحة من 30 ثانية للصفحة الواحدة
        return 30;
    }, []);

    const getAutoScrollTargetSecondsForPage = useCallback((pageNum: number, scrollMinutes: number): number => {
        // ثالثاً: الصفحة الأولى والثانية بالمصحف يتم احتسابهما بأي وقت نظراً لصغر هاتين الصفحتين
        if (pageNum === 1 || pageNum === 2) {
            return 1;
        }
        // أولاً: عند التمرير التلقائي عند اختيار أي وقت من 5 دقائق إلى 60 دقيقة يتم الاحتساب بأي سرعة للقراءة لكل صفحة
        const safeScrollMinutes = Math.max(5, Math.min(60, Number(scrollMinutes) || QURAN_READING_STANDARDS.STANDARD_MINUTES_PER_JUZ));
        const expectedSecsPerStandardPage = (safeScrollMinutes * 60) / QURAN_READING_STANDARDS.PAGES_PER_JUZ;
        const wordsOnPage = pageWordCountsMap.get(pageNum) || QURAN_READING_STANDARDS.STANDARD_WORDS_PER_PAGE;
        const wordRatio = Math.min(1.2, Math.max(0.4, wordsOnPage / QURAN_READING_STANDARDS.STANDARD_WORDS_PER_PAGE));
        return Math.max(2, Math.round(expectedSecsPerStandardPage * wordRatio));
    }, [pageWordCountsMap]);

    useEffect(() => {
        const timer = setInterval(() => {
            if (isLoading) return;
            if (typeof document !== 'undefined' && document.hidden) return;

            if (isOverlayBlocking) return;

            const now = Date.now();
            const isAutoScroll = autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused;
            const scrollMinutes = parseInt(String(settingsRef.current.scrollMinutes), 10) || QURAN_READING_STANDARDS.STANDARD_MINUTES_PER_JUZ;

            const visiblePage = getCurrentlyVisiblePage();

            // --- الربط الدقيق مع مربّي العبادات ---
            if (!visiblePage || visiblePage < 1 || visiblePage > QURAN_READING_STANDARDS.TOTAL_MUSHAF_PAGES) {
                return;
            }

            const todayStr = moment().format('YYYY-MM-DD');
            const creditedTodaySet = new Set<number>(getVerifiedPagesReadForDate(todayStr));

            // أ) حالة التمرير التلقائي: عند اختيار أي وقت من 5 دقائق إلى 60 دقيقة يتم الاحتساب بأي سرعة للقراءة لكل صفحة
            if (isAutoScroll) {
                const prevAutoPage = lastAutoScrollPageRef.current;

                // عند إتمام تمرير صفحة تلقائياً والانتقال للصفحة التالية، نضمن احتساب الصفحة السابقة بأي سرعة كانت
                if (
                    prevAutoPage !== null &&
                    prevAutoPage !== visiblePage &&
                    Math.abs(visiblePage - prevAutoPage) === 1 &&
                    !creditedTodaySet.has(prevAutoPage)
                ) {
                    const prevAutoSecs = autoScrollPageDwellSecsRef.current[prevAutoPage] || 0;
                    const prevTargetSecs = getAutoScrollTargetSecondsForPage(prevAutoPage, scrollMinutes);
                    const isPrevShort = prevAutoPage === 1 || prevAutoPage === 2;
                    const minTransitionSecs = isPrevShort 
                        ? 1 
                        : Math.max(1, Math.floor(prevTargetSecs * 0.25));

                    if (prevAutoSecs >= minTransitionSecs) {
                        creditedTodaySet.add(prevAutoPage);
                        autoScrollPageDwellSecsRef.current[prevAutoPage] = 0;
                        useHabitTracker.getState().recordQuranPageRead(prevAutoPage, prevAutoSecs, true);
                    }
                }

                lastAutoScrollPageRef.current = visiblePage;

                if (creditedTodaySet.has(visiblePage)) {
                    return;
                }

                const nextAutoSecs = (autoScrollPageDwellSecsRef.current[visiblePage] || 0) + 1;
                autoScrollPageDwellSecsRef.current[visiblePage] = nextAutoSecs;

                const isCurrentShort = visiblePage === 1 || visiblePage === 2;
                const targetAutoSecs = getAutoScrollTargetSecondsForPage(visiblePage, scrollMinutes);
                const inPageThresholdSecs = isCurrentShort 
                    ? 1 
                    : Math.max(1, Math.floor(targetAutoSecs * 0.55));

                if (nextAutoSecs >= inPageThresholdSecs) {
                    creditedTodaySet.add(visiblePage);
                    autoScrollPageDwellSecsRef.current[visiblePage] = 0;
                    useHabitTracker.getState().recordQuranPageRead(visiblePage, nextAutoSecs, true);
                }
                return;
            }

            // ب) حالة التمرير اليدوي: يتم احتساب كل صفحة من 30 ثانية للصفحة الواحدة، وإذا قل وقت التمرير عن ذلك لا يتم احتسابها
            // الصفحتان الأولى والثانية بالمصحف يتم احتسابهما بأي وقت نظراً لصغرهما
            lastAutoScrollPageRef.current = null;
            if (isJumpingRef.current) return;

            if (showRapidScrollToast || now - lastRapidScrollDetectedTimeRef.current < 1500) {
                const prevP = lastActiveHabitPageRef.current;
                if (prevP !== null && !creditedTodaySet.has(prevP)) {
                    habitPageDwellSecsRef.current[prevP] = 0;
                }
                continuousStaySecsRef.current = 0;
                return;
            }

            let activeManualPage = visiblePage;
            const prevManualPage = lastActiveHabitPageRef.current;

            // إذا أوشك القارئ يدوياً على إتمام آخر أسطر الصفحة السابقة ولا تزال ظاهرة في الشاشة
            if (
                readingMode === 'mushaf' &&
                prevManualPage !== null &&
                prevManualPage !== visiblePage &&
                Math.abs(visiblePage - prevManualPage) === 1 &&
                !creditedTodaySet.has(prevManualPage)
            ) {
                const prevDwell = habitPageDwellSecsRef.current[prevManualPage] || 0;
                const prevReq = getManualRequiredSecondsForPage(prevManualPage);
                if (prevDwell >= Math.floor(prevReq * 0.8)) {
                    const content = mushafContentRef.current;
                    if (content) {
                        const containerRect = content.getBoundingClientRect();
                        const prevPageEl = content.querySelector(`.mushaf-page[data-page="${prevManualPage}"], #page-${prevManualPage}`) as HTMLElement | null;
                        if (prevPageEl) {
                            const rect = prevPageEl.getBoundingClientRect();
                            const visibleOverlap = Math.min(containerRect.bottom, rect.bottom) - Math.max(containerRect.top, rect.top);
                            if (visibleOverlap >= containerRect.height * 0.20) {
                                activeManualPage = prevManualPage;
                            }
                        }
                    }
                }
            }

            // عند الانتقال من صفحة إلى أخرى: إذا قل وقت التمرير عن 30 ثانية (أو 1 ثانية للصفحتين 1 و 2)، لا يتم احتسابها ويُصفر عدادها
            if (prevManualPage !== null && prevManualPage !== activeManualPage) {
                if (!creditedTodaySet.has(prevManualPage)) {
                    habitPageDwellSecsRef.current[prevManualPage] = 0;
                }
                continuousStaySecsRef.current = 0;
            }
            lastActiveHabitPageRef.current = activeManualPage;
            continuousStaySecsRef.current += 1;

            if (creditedTodaySet.has(activeManualPage)) {
                return;
            }

            const requiredManualSecs = getManualRequiredSecondsForPage(activeManualPage);
            const nextManualSecs = (habitPageDwellSecsRef.current[activeManualPage] || 0) + 1;
            habitPageDwellSecsRef.current[activeManualPage] = nextManualSecs;

            // إذا استوفت الصفحة الوقت المطلوب (30 ثانية للصفحة العادية، أو بأي وقت للصفحتين 1 و 2) يتم احتسابها
            if (nextManualSecs >= requiredManualSecs) {
                creditedTodaySet.add(activeManualPage);
                habitPageDwellSecsRef.current[activeManualPage] = 0;
                useHabitTracker.getState().recordQuranPageRead(activeManualPage, nextManualSecs, false);
            }
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, [
        isLoading,
        isOverlayBlocking,
        showRapidScrollToast,
        readingMode,
        getCurrentlyVisiblePage,
        getManualRequiredSecondsForPage,
        getAutoScrollTargetSecondsForPage,
        autoScrollStateRef,
        settingsRef,
        isJumpingRef,
        lastRapidScrollDetectedTimeRef,
        mushafContentRef,
    ]);

    return {
        pageWordCountsMap,
        getCurrentlyVisiblePage,
        getManualRequiredSecondsForPage,
        getAutoScrollTargetSecondsForPage,
        manualActiveReadingSecsRef,
        manualCumulativeRequiredSecsRef,
    };
};
