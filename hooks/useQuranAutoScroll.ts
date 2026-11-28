import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { ReadingMode } from '../components/QuranReader/constants';
import { markQuranMicroHintUsed } from '../components/QuranReader/QuranMicroHints';

const PAGES_PER_JUZ = 20;
const PAGE_HEIGHT_FALLBACK = 1300;

export interface AutoScrollState {
    isActive: boolean;
    isPaused: boolean;
    elapsedTime: number;
}

interface UseQuranAutoScrollParams {
    autoScrollStateRef: React.MutableRefObject<AutoScrollState>;
    autoScrollPausedRef: React.MutableRefObject<boolean>;
    setAutoScrollStateRef: React.MutableRefObject<React.Dispatch<React.SetStateAction<AutoScrollState>>>;
    wasAutoscrollingBeforeModal: React.MutableRefObject<boolean>;
    isAnyMenuOpenRef: React.MutableRefObject<boolean>;
    mushafContentRef: React.RefObject<HTMLDivElement | null>;
    settingsRef: React.MutableRefObject<any>;
    readingMode: ReadingMode;
    readingModeRef: React.MutableRefObject<ReadingMode>;
    isMadinahVertical: boolean;
    isLandscape: boolean;
    isLandscapeRef: React.MutableRefObject<boolean>;
    isHideToolbarsEnabledRef: React.MutableRefObject<boolean>;
    setIsLandscapeUIHidden: React.Dispatch<React.SetStateAction<boolean>>;
    setIsFloatingMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isFloatingMenuOpen: boolean;
    activeModals: string[];
    isTafseerOpen: boolean;
    isTafseerSelectionOpen: boolean;
    isJumpingRef: React.MutableRefObject<boolean>;
    handleScrollRef: React.MutableRefObject<(() => void) | null>;
    showToast: (message: string) => void;
    isEn: boolean;
}

export const useQuranAutoScroll = ({
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
    isTafseerOpen,
    isTafseerSelectionOpen,
    isJumpingRef,
    handleScrollRef,
    showToast,
    isEn,
}: UseQuranAutoScrollParams) => {
    const [autoScrollState, setAutoScrollState] = useState<AutoScrollState>({
        isActive: false,
        isPaused: false,
        elapsedTime: 0,
    });
    const [isAutoScrollSettingsOpen, setIsAutoScrollSettingsOpen] = useState(false);

    useLayoutEffect(() => {
        autoScrollStateRef.current = autoScrollState;
        setAutoScrollStateRef.current = setAutoScrollState;
    }, [autoScrollState, autoScrollStateRef, setAutoScrollStateRef]);

    const autoScrollButtonTimerRef = useRef<number | null>(null);
    const autoScrollFrameRef = useRef<number | null>(null);
    const timerIntervalRef = useRef<number | null>(null);
    const stopTimerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const scrollAccumulatorRef = useRef(0);
    const lastScrollTimeRef = useRef<number>(0);

    const wasAutoscrollingBeforeAyahContext = useRef(false);
    const wasAutoscrollingBeforeAutoScrollSettings = useRef(false);
    const wasAutoscrollingBeforeFloatingMenu = useRef(false);
    const wasAutoscrollingBeforeBackground = useRef(false);
    const isAppBackgroundedRef = useRef(false);

    useEffect(() => {
        return () => {
            if (autoScrollFrameRef.current) {
                cancelAnimationFrame(autoScrollFrameRef.current);
                autoScrollFrameRef.current = null;
            }
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
            if (stopTimerTimeoutRef.current) {
                clearTimeout(stopTimerTimeoutRef.current);
                stopTimerTimeoutRef.current = null;
            }
            if (autoScrollButtonTimerRef.current) {
                clearTimeout(autoScrollButtonTimerRef.current);
                autoScrollButtonTimerRef.current = null;
            }
        };
    }, []);

    // Landscape touch momentum scrolling
    useEffect(() => {
        if (!isLandscape) return;

        let touchStartX = 0;
        let touchStartY = 0;
        let lastTouchX = 0;
        let lastTouchY = 0;
        let isScrolling = false;
        let lastTouchTime = 0;
        let velocityX = 0;
        let velocityY = 0;
        let momentumFrame: number | null = null;
        let activeScrollable: HTMLElement | null = null;

        const handleTouchStart = (e: TouchEvent) => {
            if (e.touches.length !== 1) return;
            if (momentumFrame) cancelAnimationFrame(momentumFrame);

            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            lastTouchX = touchStartX;
            lastTouchY = touchStartY;
            lastTouchTime = e.timeStamp;
            isScrolling = false;
            velocityX = 0;
            velocityY = 0;
            activeScrollable = null;
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length !== 1) return;

            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const currentTime = e.timeStamp;

            if (!isScrolling) {
                if (Math.abs(currentX - touchStartX) > 10 || Math.abs(currentY - touchStartY) > 10) {
                    isScrolling = true;
                } else {
                    return;
                }
            }

            const deltaX = currentX - lastTouchX;
            const deltaY = currentY - lastTouchY;
            const deltaTime = currentTime - lastTouchTime;

            if (deltaTime > 0) {
                velocityX = deltaX / deltaTime;
                velocityY = deltaY / deltaTime;
            }

            lastTouchX = currentX;
            lastTouchY = currentY;
            lastTouchTime = currentTime;

            if (isScrolling) {
                let target = e.target as HTMLElement;
                let scrollable: HTMLElement | null = null;

                while (target && target !== document.body) {
                    const style = window.getComputedStyle(target);
                    const overflowY = style.overflowY;
                    const overflowX = style.overflowX;

                    const canScrollY = (overflowY === 'auto' || overflowY === 'scroll') && target.scrollHeight > target.clientHeight;
                    const canScrollX = (overflowX === 'auto' || overflowX === 'scroll') && target.scrollWidth > target.clientWidth;

                    if (canScrollY || canScrollX) {
                        scrollable = target;
                        break;
                    }
                    target = target.parentElement as HTMLElement;
                }

                if (scrollable) {
                    const isSimulatedLandscape = isLandscape && window.innerHeight > window.innerWidth;

                    if (isSimulatedLandscape) {
                        if (e.cancelable) {
                            e.preventDefault();
                        }
                        scrollable.scrollTop -= deltaY;
                        scrollable.scrollLeft += deltaX;
                        activeScrollable = scrollable;
                    } else if (isLandscape) {
                        if (e.cancelable) {
                            e.preventDefault();
                        }
                        scrollable.scrollTop -= deltaY;
                        scrollable.scrollLeft -= deltaX;
                        activeScrollable = scrollable;
                    }
                }
            }
        };

        const handleTouchEnd = (e: TouchEvent) => {
            if (!isScrolling || !activeScrollable) return;

            const timeSinceLastMove = e.timeStamp - lastTouchTime;
            if (timeSinceLastMove > 50) {
                velocityX = 0;
                velocityY = 0;
            }

            let vx = velocityX;
            let vy = velocityY;
            const friction = 0.95;
            const isSimulatedLandscape = isLandscape && window.innerHeight > window.innerWidth;

            const applyMomentum = () => {
                if (Math.abs(vx) < 0.1 && Math.abs(vy) < 0.1) return;

                if (activeScrollable) {
                    if (isSimulatedLandscape) {
                        activeScrollable.scrollTop -= vy * 16;
                        activeScrollable.scrollLeft += vx * 16;
                    } else {
                        activeScrollable.scrollTop -= vy * 16;
                        activeScrollable.scrollLeft -= vx * 16;
                    }
                }

                vx *= friction;
                vy *= friction;

                momentumFrame = requestAnimationFrame(applyMomentum);
            };

            if (Math.abs(vx) > 0.1 || Math.abs(vy) > 0.1) {
                momentumFrame = requestAnimationFrame(applyMomentum);
            }
        };

        document.addEventListener('touchstart', handleTouchStart, { passive: false });
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd, { passive: false });

        return () => {
            if (momentumFrame) cancelAnimationFrame(momentumFrame);
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isLandscape]);

    // Auto-pause while auto-scroll settings modal is open
    useEffect(() => {
        if (isAutoScrollSettingsOpen) {
            if (autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused) {
                autoScrollPausedRef.current = true;
                const newState = { ...autoScrollStateRef.current, isPaused: true };
                autoScrollStateRef.current = newState;
                setAutoScrollState(newState);
                wasAutoscrollingBeforeAutoScrollSettings.current = true;
            }
        } else {
            if (wasAutoscrollingBeforeAutoScrollSettings.current) {
                wasAutoscrollingBeforeAutoScrollSettings.current = false;
                const anyOtherOpen = isFloatingMenuOpen || activeModals.length > 0 || isTafseerOpen || isTafseerSelectionOpen;
                if (!anyOtherOpen && autoScrollStateRef.current.isActive && autoScrollStateRef.current.isPaused) {
                    autoScrollPausedRef.current = false;
                    const newState = { ...autoScrollStateRef.current, isPaused: false };
                    autoScrollStateRef.current = newState;
                    setAutoScrollState(newState);
                }
            }
        }
    }, [isAutoScrollSettingsOpen, isFloatingMenuOpen, activeModals, isTafseerOpen, isTafseerSelectionOpen, autoScrollStateRef, autoScrollPausedRef]);

    // Auto-pause while floating menu is open
    useEffect(() => {
        if (isFloatingMenuOpen) {
            if (autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused) {
                autoScrollPausedRef.current = true;
                const newState = { ...autoScrollStateRef.current, isPaused: true };
                autoScrollStateRef.current = newState;
                setAutoScrollState(newState);
                wasAutoscrollingBeforeFloatingMenu.current = true;
            }
        } else {
            if (wasAutoscrollingBeforeFloatingMenu.current) {
                wasAutoscrollingBeforeFloatingMenu.current = false;
                const anyOtherOpen = isAutoScrollSettingsOpen || activeModals.length > 0 || isTafseerOpen || isTafseerSelectionOpen;
                if (!anyOtherOpen && autoScrollStateRef.current.isActive && autoScrollStateRef.current.isPaused) {
                    autoScrollPausedRef.current = false;
                    const newState = { ...autoScrollStateRef.current, isPaused: false };
                    autoScrollStateRef.current = newState;
                    setAutoScrollState(newState);
                }
            }
        }
    }, [isFloatingMenuOpen, isAutoScrollSettingsOpen, activeModals, isTafseerOpen, isTafseerSelectionOpen, autoScrollStateRef, autoScrollPausedRef]);

    const updateHeadersDuringAutoScroll = useCallback(() => {
        if (handleScrollRef.current) {
            handleScrollRef.current();
        }
    }, [handleScrollRef]);

    const stopAutoScroll = useCallback((showTimer = true) => {
        if (autoScrollFrameRef.current) cancelAnimationFrame(autoScrollFrameRef.current);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        if (stopTimerTimeoutRef.current) {
            clearTimeout(stopTimerTimeoutRef.current);
            stopTimerTimeoutRef.current = null;
        }
        autoScrollFrameRef.current = null;
        timerIntervalRef.current = null;
        autoScrollPausedRef.current = false;
        wasAutoscrollingBeforeBackground.current = false;

        const newState = { isActive: false, isPaused: false, elapsedTime: autoScrollStateRef.current.elapsedTime };
        autoScrollStateRef.current = newState;
        setAutoScrollState(newState);

        if (showTimer && newState.elapsedTime > 0) {
            stopTimerTimeoutRef.current = setTimeout(() => {
                stopTimerTimeoutRef.current = null;
                setAutoScrollState(p => {
                    const updated = { ...p, elapsedTime: 0 };
                    autoScrollStateRef.current = updated;
                    return updated;
                });
            }, 3000);
        } else {
            const resetState = { ...newState, elapsedTime: 0 };
            autoScrollStateRef.current = resetState;
            setAutoScrollState(resetState);
        }
    }, [autoScrollPausedRef, autoScrollStateRef]);

    useEffect(() => {
        if (!isMadinahVertical && readingMode === 'madinah' && autoScrollStateRef.current.isActive) {
            stopAutoScroll(false);
        }
    }, [isMadinahVertical, readingMode, autoScrollStateRef, stopAutoScroll]);

    const startAutoScroll = useCallback(() => {
        markQuranMicroHintUsed(readingModeRef.current, 'autoscroll_btn');
        if (!mushafContentRef.current) return;

        // Close any open menus/settings first to ensure bars can hide
        setIsAutoScrollSettingsOpen(false);
        setIsFloatingMenuOpen(false);

        // Clear any existing auto-scroll without triggering a full stop state update
        if (autoScrollFrameRef.current) cancelAnimationFrame(autoScrollFrameRef.current);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        if (stopTimerTimeoutRef.current) {
            clearTimeout(stopTimerTimeoutRef.current);
            stopTimerTimeoutRef.current = null;
        }
        autoScrollFrameRef.current = null;
        timerIntervalRef.current = null;
        autoScrollPausedRef.current = false;
        wasAutoscrollingBeforeBackground.current = false;
        isJumpingRef.current = false;

        // Update state immediately
        const initialState = { isActive: true, isPaused: false, elapsedTime: 0 };
        autoScrollStateRef.current = initialState;
        setAutoScrollState(initialState);

        if (isHideToolbarsEnabledRef.current || isLandscapeRef.current) {
            setIsLandscapeUIHidden(true);
        }

        // Delay to let layout stabilize
        setTimeout(() => {
            if (!mushafContentRef.current || !autoScrollStateRef.current.isActive) return;

            scrollAccumulatorRef.current = 0;
            autoScrollPausedRef.current = autoScrollStateRef.current.isPaused || isAppBackgroundedRef.current;
            lastScrollTimeRef.current = performance.now();

            let hasMeasuredHeight = false;
            let cachedPageHeight = PAGE_HEIGHT_FALLBACK;
            let lastHeightCalcTime = 0;

            const scrollStep = (timestamp: number) => {
                if (!lastScrollTimeRef.current) lastScrollTimeRef.current = timestamp;
                const rawDeltaTime = timestamp - lastScrollTimeRef.current;
                const deltaTime = Math.min(Math.max(0, rawDeltaTime), 100);
                lastScrollTimeRef.current = timestamp;

                const isHidden = isAppBackgroundedRef.current || (typeof document !== 'undefined' && document.hidden);
                if (!autoScrollPausedRef.current && !isHidden && mushafContentRef.current) {
                    const content = mushafContentRef.current;

                    // Recalculate page height every 3 seconds or if it's the first time
                    if (timestamp - lastHeightCalcTime > 3000 || lastHeightCalcTime === 0) {
                        const pages = content.querySelectorAll('.mushaf-page, .madinah-vertical-page');
                        let totalHeight = 0;
                        let count = 0;
                        pages.forEach((page: any) => {
                            const h = page.offsetHeight;
                            if (h) {
                                totalHeight += h;
                                count++;
                            }
                        });
                        if (count > 0) {
                            cachedPageHeight = totalHeight / count;
                            hasMeasuredHeight = true;
                        } else {
                            // In translation or bilingual mode, measure rendered .ayah-item elements with clamping and smoothing
                            const ayahItems = content.querySelectorAll('.ayah-item');
                            if (ayahItems.length > 0) {
                                let totalAyahH = 0;
                                let measuredCount = 0;
                                ayahItems.forEach((item: any) => {
                                    const h = item.offsetHeight || 0;
                                    if (h > 0) {
                                        totalAyahH += h;
                                        measuredCount++;
                                    }
                                });
                                if (measuredCount > 0) {
                                    const avgAyahH = totalAyahH / measuredCount;
                                    // Clamp to prevent erratic speed jumps between short and long Surahs
                                    const rawTarget = Math.max(850, Math.min(2200, avgAyahH * 10.4));
                                    cachedPageHeight = hasMeasuredHeight ? (cachedPageHeight * 0.75 + rawTarget * 0.25) : rawTarget;
                                    hasMeasuredHeight = true;
                                }
                            } else if (!hasMeasuredHeight) {
                                cachedPageHeight = content.clientHeight || PAGE_HEIGHT_FALLBACK;
                            }
                        }
                        lastHeightCalcTime = timestamp;
                    }

                    const minutesPerJuz = parseInt(String(settingsRef.current.scrollMinutes), 10) || 20;
                    const totalPixels = cachedPageHeight * PAGES_PER_JUZ;
                    const totalTimeMs = minutesPerJuz * 60 * 1000;

                    if (totalPixels > 0 && totalTimeMs > 0) {
                        const pixelsPerMs = totalPixels / totalTimeMs;
                        scrollAccumulatorRef.current += pixelsPerMs * deltaTime;

                        if (scrollAccumulatorRef.current >= 1) {
                            const pixelsToMove = Math.floor(scrollAccumulatorRef.current);
                            const prevScrollTop = content.scrollTop;
                            content.scrollTop = prevScrollTop + pixelsToMove;
                            const actualMoved = content.scrollTop - prevScrollTop;
                            if (actualMoved > 0) {
                                scrollAccumulatorRef.current -= Math.min(pixelsToMove, actualMoved);
                                updateHeadersDuringAutoScroll();
                            } else if (content.scrollTop + content.clientHeight >= content.scrollHeight - 2) {
                                scrollAccumulatorRef.current = 0;
                            } else if (scrollAccumulatorRef.current > 10) {
                                scrollAccumulatorRef.current -= pixelsToMove;
                            }
                        }
                    }
                }
                autoScrollFrameRef.current = requestAnimationFrame(scrollStep);
            };

            autoScrollFrameRef.current = requestAnimationFrame(scrollStep);

            timerIntervalRef.current = window.setInterval(() => {
                const isHidden = isAppBackgroundedRef.current || (typeof document !== 'undefined' && document.hidden);
                if (!autoScrollPausedRef.current && !isHidden) {
                    setAutoScrollState(prev => {
                        const updated = { ...prev, elapsedTime: prev.elapsedTime + 1 };
                        autoScrollStateRef.current = updated;
                        return updated;
                    });
                }
            }, 1000);
        }, 100);
    }, [
        readingModeRef,
        mushafContentRef,
        setIsFloatingMenuOpen,
        autoScrollPausedRef,
        isJumpingRef,
        autoScrollStateRef,
        isHideToolbarsEnabledRef,
        isLandscapeRef,
        setIsLandscapeUIHidden,
        settingsRef,
        updateHeadersDuringAutoScroll,
    ]);

    const toggleAutoScroll = useCallback(() => {
        if (autoScrollStateRef.current.isActive) stopAutoScroll();
        else {
            startAutoScroll();
            showToast(isEn || readingMode === 'translation' ? 'Auto-scroll enabled' : 'تم تفعيل التمرير التلقائي');
        }
    }, [autoScrollStateRef, stopAutoScroll, startAutoScroll, showToast, isEn, readingMode]);

    const toggleAutoScrollPause = useCallback(() => {
        if (autoScrollStateRef.current.isActive) {
            wasAutoscrollingBeforeBackground.current = false;
            const newPausedState = !autoScrollStateRef.current.isPaused;
            autoScrollPausedRef.current = newPausedState;
            const newState = { ...autoScrollStateRef.current, isPaused: newPausedState };
            autoScrollStateRef.current = newState;
            setAutoScrollState(newState);
        }
    }, [autoScrollStateRef, autoScrollPausedRef]);

    const pauseAutoScrollForBackground = useCallback(() => {
        isAppBackgroundedRef.current = true;
        if (autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused) {
            wasAutoscrollingBeforeBackground.current = true;
            autoScrollPausedRef.current = true;
            scrollAccumulatorRef.current = 0;
            const pausedState = { ...autoScrollStateRef.current, isPaused: true };
            autoScrollStateRef.current = pausedState;
            setAutoScrollState(pausedState);
        }
    }, [autoScrollStateRef, autoScrollPausedRef]);

    const resumeAutoScrollFromBackground = useCallback(() => {
        isAppBackgroundedRef.current = false;
        lastScrollTimeRef.current = performance.now();
        scrollAccumulatorRef.current = 0;

        if (wasAutoscrollingBeforeBackground.current) {
            wasAutoscrollingBeforeBackground.current = false;
            if (autoScrollStateRef.current.isActive && !isAnyMenuOpenRef.current) {
                autoScrollPausedRef.current = false;
                const resumedState = { ...autoScrollStateRef.current, isPaused: false };
                autoScrollStateRef.current = resumedState;
                setAutoScrollState(resumedState);
            }
        }
    }, [autoScrollStateRef, autoScrollPausedRef, isAnyMenuOpenRef]);

    const handleAutoScrollButtonPointerDown = useCallback((e: React.SyntheticEvent) => {
        e.stopPropagation();
        if (e && e.type === 'touchstart') {
            e.preventDefault();
        }
        markQuranMicroHintUsed(readingModeRef.current, 'autoscroll_btn');
        if (autoScrollButtonTimerRef.current) return;
        autoScrollButtonTimerRef.current = window.setTimeout(() => {
            autoScrollButtonTimerRef.current = null;
            setIsAutoScrollSettingsOpen(true);
        }, 500);
    }, [readingModeRef]);

    const handleAutoScrollButtonPointerUp = useCallback((e: React.PointerEvent | React.TouchEvent) => {
        e.stopPropagation();
        if (e && e.type === 'touchend') {
            e.preventDefault();
        }
        if (autoScrollButtonTimerRef.current) {
            clearTimeout(autoScrollButtonTimerRef.current);
            autoScrollButtonTimerRef.current = null;
            toggleAutoScroll();
        }
    }, [toggleAutoScroll]);

    const handleAutoScrollButtonPointerLeave = useCallback(() => {
        if (autoScrollButtonTimerRef.current) {
            clearTimeout(autoScrollButtonTimerRef.current);
            autoScrollButtonTimerRef.current = null;
        }
    }, []);

    return {
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
    };
};
