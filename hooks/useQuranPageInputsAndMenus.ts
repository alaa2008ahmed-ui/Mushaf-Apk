import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { ReadingMode, DEFAULT_SETTINGS } from '../components/QuranReader/constants';
import { preloadMadinahPagesForInput } from '../utils/quran/qpcMadinahData';
import { markQuranMicroHintUsed } from '../components/QuranReader/QuranMicroHints';
import type { AutoScrollState } from './useQuranAutoScroll';

interface UseQuranPageInputsAndMenusParams {
    navParams?: any;
    readingMode: ReadingMode;
    readingModeRef: React.MutableRefObject<ReadingMode>;
    activeModals: string[];
    appContainerRef: React.RefObject<HTMLDivElement | null>;
    autoScrollStateRef: React.MutableRefObject<AutoScrollState>;
    autoScrollPausedRef: React.MutableRefObject<boolean>;
    setAutoScrollStateRef: React.MutableRefObject<React.Dispatch<React.SetStateAction<AutoScrollState>>>;
    jumpToPageRef: React.MutableRefObject<(pageNum: number, instant?: boolean) => void>;
    stopAudioRef: React.MutableRefObject<() => void>;
}

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

const normalizePageDigits = (raw: string) =>
    raw
        .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
        .replace(/[^0-9]/g, '')
        .slice(0, 3);

export const useQuranPageInputsAndMenus = ({
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
}: UseQuranPageInputsAndMenusParams) => {
    const [isFloatingMenuOpen, setIsFloatingMenuOpen] = useState(
        Boolean(navParams?.openSidebar || navParams?.openFloatingMenu || navParams?.openMenu)
    );
    const [floatingMenuInitialView, setFloatingMenuInitialView] = useState('main');
    const isFloatingMenuOpenRef = useRef(isFloatingMenuOpen);
    const lastFloatingMenuCloseTimeRef = useRef<number>(0);
    const prevFloatingMenuOpenRef = useRef(isFloatingMenuOpen);
    const floatingMenuRef = useRef<HTMLDivElement>(null);
    const menuButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        isFloatingMenuOpenRef.current = isFloatingMenuOpen;
        if (prevFloatingMenuOpenRef.current && !isFloatingMenuOpen) {
            lastFloatingMenuCloseTimeRef.current = Date.now();
            setFloatingMenuInitialView('main');
        }
        prevFloatingMenuOpenRef.current = isFloatingMenuOpen;
    }, [isFloatingMenuOpen]);

    const [ayahContextMenu, setAyahContextMenu] = useState<{
        isOpen: boolean;
        isCustomizing: boolean;
        x: number;
        y: number;
        s: number;
        a: number;
        tempSettings: any;
        originalSettings: any;
    }>({
        isOpen: false,
        isCustomizing: false,
        x: 0,
        y: 0,
        s: 0,
        a: 0,
        tempSettings: DEFAULT_SETTINGS,
        originalSettings: DEFAULT_SETTINGS,
    });
    const [ayahContextColorField, setAyahContextColorField] = useState<'textColor' | 'bgColor' | 'highlightTextColor' | null>(null);

    // Close context menu on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent | TouchEvent) => {
            if (ayahContextMenu.isOpen && activeModals.length === 0) {
                const target = e.target as HTMLElement;
                if (!target.closest('.ayah-context-menu')) {
                    setAyahContextMenu(prev => ({ ...prev, isOpen: false }));
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [ayahContextMenu.isOpen, activeModals]);

    const [isPageInputActive, setIsPageInputActive] = useState(false);
    const [pageInput, setPageInput] = useState('');
    const isPageInputActiveRef = useRef(false);
    const pageInputRef = useRef<HTMLInputElement>(null);
    useEffect(() => { isPageInputActiveRef.current = isPageInputActive; }, [isPageInputActive]);

    const [isBottomPageInputActive, setIsBottomPageInputActive] = useState(false);
    const [bottomPageInput, setBottomPageInput] = useState('');
    const isBottomPageInputActiveRef = useRef(false);
    const bottomPageInputRef = useRef<HTMLInputElement>(null);
    useEffect(() => { isBottomPageInputActiveRef.current = isBottomPageInputActive; }, [isBottomPageInputActive]);

    const [lockedMadinahHeight, setLockedMadinahHeight] = useState<number | null>(null);
    const lockedMadinahHeightTimerRef = useRef<number | null>(null);

    useEffect(() => {
        if (isPageInputActive && pageInputRef.current) {
            pageInputRef.current.focus({ preventScroll: true });
        }
    }, [isPageInputActive]);

    useEffect(() => {
        if (isBottomPageInputActive && bottomPageInputRef.current) {
            bottomPageInputRef.current.focus({ preventScroll: true });
        }
    }, [isBottomPageInputActive]);

    useEffect(() => {
        if (readingMode !== 'madinah') {
            if (lockedMadinahHeightTimerRef.current !== null) {
                window.clearTimeout(lockedMadinahHeightTimerRef.current);
                lockedMadinahHeightTimerRef.current = null;
            }
            setLockedMadinahHeight(null);
            return;
        }
        if (isBottomPageInputActive || isPageInputActive) {
            if (lockedMadinahHeightTimerRef.current !== null) {
                window.clearTimeout(lockedMadinahHeightTimerRef.current);
                lockedMadinahHeightTimerRef.current = null;
            }
        } else if (lockedMadinahHeight !== null) {
            if (lockedMadinahHeightTimerRef.current !== null) {
                window.clearTimeout(lockedMadinahHeightTimerRef.current);
            }
            lockedMadinahHeightTimerRef.current = window.setTimeout(() => {
                lockedMadinahHeightTimerRef.current = null;
                setLockedMadinahHeight(null);
            }, 350);
        }
        return () => {
            if (lockedMadinahHeightTimerRef.current !== null) {
                window.clearTimeout(lockedMadinahHeightTimerRef.current);
                lockedMadinahHeightTimerRef.current = null;
            }
        };
    }, [readingMode, isBottomPageInputActive, isPageInputActive, lockedMadinahHeight]);

    useEffect(() => {
        if (readingMode !== 'madinah' || !Capacitor.isNativePlatform()) return;
        try {
            Keyboard.setScroll({ isDisabled: true });
            Keyboard.setResizeMode({ mode: 'none' as any });
        } catch (e) {}
        return () => {
            try {
                Keyboard.setScroll({ isDisabled: false });
                Keyboard.setResizeMode({ mode: 'native' as any });
            } catch (e) {}
        };
    }, [readingMode, activeModals.length]);

    const toggleFloatingMenu = useCallback(() => {
        setIsFloatingMenuOpen(prev => {
            const willOpen = !prev;
            if (willOpen) {
                // Defer these updates as they cannot be called inside a state updater
                setTimeout(() => {
                    setFloatingMenuInitialView('main');
                    stopAudioRef.current();
                }, 0);
            } else {
                lastFloatingMenuCloseTimeRef.current = Date.now();
            }
            return willOpen;
        });
    }, [stopAudioRef]);

    const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const normalized = normalizePageDigits(e.target.value);
        setPageInput(normalized);
        if (readingModeRef.current === 'madinah') {
            preloadMadinahPagesForInput(normalized);
        }
    };

    const handlePageInputBlur = () => {
        const raw = pageInput;
        isPageInputActiveRef.current = false;
        setIsPageInputActive(false);
        setPageInput('');
        if (raw) {
            const pageNum = parseInt(raw, 10);
            if (pageNum >= 1 && pageNum <= 604) {
                jumpToPageRef.current(pageNum, true);
            }
        }
    };

    const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handlePageInputBlur();
        } else if (e.key === 'Escape') {
            isPageInputActiveRef.current = false;
            setIsPageInputActive(false);
            setPageInput('');
        }
    };

    const handlePageButtonClick = () => {
        markQuranMicroHintUsed(readingModeRef.current, 'page_num_btn');
        if (autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused) {
            autoScrollPausedRef.current = true;
            setAutoScrollStateRef.current(p => ({ ...p, isPaused: true }));
        }
        if (readingMode === 'madinah') {
            const fullH = appContainerRef.current?.clientHeight || window.innerHeight;
            if (fullH > 0) setLockedMadinahHeight(fullH);
            if (Capacitor.isNativePlatform()) {
                try {
                    Keyboard.setScroll({ isDisabled: true });
                    Keyboard.setResizeMode({ mode: 'none' as any });
                } catch (e) {}
            }
        }
        setIsBottomPageInputActive(false);
        setBottomPageInput('');
        setIsPageInputActive(true);
        setPageInput('');
        setTimeout(() => pageInputRef.current?.focus({ preventScroll: true }), 100);
    };

    const handleBottomPageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const normalized = normalizePageDigits(e.target.value);
        setBottomPageInput(normalized);
        if (readingModeRef.current === 'madinah') {
            preloadMadinahPagesForInput(normalized);
        }
    };

    const handleBottomPageInputBlur = () => {
        const raw = bottomPageInput;
        isBottomPageInputActiveRef.current = false;
        setIsBottomPageInputActive(false);
        setBottomPageInput('');
        if (raw) {
            const pageNum = parseInt(raw, 10);
            if (pageNum >= 1 && pageNum <= 604) {
                jumpToPageRef.current(pageNum, true);
            }
        }
    };

    const handleBottomPageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleBottomPageInputBlur();
        } else if (e.key === 'Escape') {
            isBottomPageInputActiveRef.current = false;
            setIsBottomPageInputActive(false);
            setBottomPageInput('');
        }
    };

    const handleBottomPageButtonClick = () => {
        markQuranMicroHintUsed(readingModeRef.current, 'bottom_page_btn');
        if (autoScrollStateRef.current.isActive && !autoScrollStateRef.current.isPaused) {
            autoScrollPausedRef.current = true;
            setAutoScrollStateRef.current(p => ({ ...p, isPaused: true }));
        }
        if (readingMode === 'madinah') {
            const fullH = appContainerRef.current?.clientHeight || window.innerHeight;
            if (fullH > 0) setLockedMadinahHeight(fullH);
            if (Capacitor.isNativePlatform()) {
                try {
                    Keyboard.setScroll({ isDisabled: true });
                    Keyboard.setResizeMode({ mode: 'none' as any });
                } catch (e) {}
            }
        }
        setIsPageInputActive(false);
        setPageInput('');
        setIsBottomPageInputActive(true);
        setBottomPageInput('');
        setTimeout(() => bottomPageInputRef.current?.focus({ preventScroll: true }), 100);
    };

    useEffect(() => {
        const handleGlobalCaptureGhostEvents = (event: MouseEvent | TouchEvent) => {
            if (Date.now() - lastFloatingMenuCloseTimeRef.current < 500) {
                const target = event.target as HTMLElement | null;
                // Allow interactions with the menu toggle buttons, modals, cards, dialogs, and interactive elements
                if (target && (
                    target.closest('#btn-menu-header') ||
                    target.closest('#btn-menu-footer') ||
                    (menuButtonRef.current && menuButtonRef.current.contains(target)) ||
                    target.closest('.modal-skinned') ||
                    target.closest('[role="dialog"]') ||
                    target.closest('.fixed.z-\\[1100\\]') ||
                    target.closest('.fixed.z-\\[1200\\]') ||
                    target.closest('.fixed.z-\\[1000\\]') ||
                    target.closest('.fixed.z-50') ||
                    target.closest('button') ||
                    target.closest('input') ||
                    target.closest('select') ||
                    target.closest('label') ||
                    target.closest('.cursor-pointer') ||
                    target.closest('#font-controls-row') ||
                    target.closest('#reciter-tafseer-row') ||
                    target.closest('.themed-card-bg')
                )) {
                    return;
                }
                event.preventDefault();
                event.stopPropagation();
                if ('stopImmediatePropagation' in event) {
                    (event as any).stopImmediatePropagation();
                }
            }
        };

        document.addEventListener('click', handleGlobalCaptureGhostEvents, { capture: true });
        document.addEventListener('touchend', handleGlobalCaptureGhostEvents, { capture: true, passive: false });
        document.addEventListener('pointerup', handleGlobalCaptureGhostEvents, { capture: true });
        document.addEventListener('mouseup', handleGlobalCaptureGhostEvents, { capture: true });

        return () => {
            document.removeEventListener('click', handleGlobalCaptureGhostEvents, { capture: true });
            document.removeEventListener('touchend', handleGlobalCaptureGhostEvents, { capture: true });
            document.removeEventListener('pointerup', handleGlobalCaptureGhostEvents, { capture: true });
            document.removeEventListener('mouseup', handleGlobalCaptureGhostEvents, { capture: true });
        };
    }, []);

    useEffect(() => {
        if (!isFloatingMenuOpen) return;

        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            const target = event.target as Node | null;
            if (!target) return;

            // Don't close if tapping inside floating menu
            if (floatingMenuRef.current && floatingMenuRef.current.contains(target)) {
                return;
            }
            // Don't close if tapping menu toggle buttons
            if (menuButtonRef.current && menuButtonRef.current.contains(target)) {
                return;
            }
            const headerBtn = document.getElementById('btn-menu-header');
            if (headerBtn && headerBtn.contains(target)) {
                return;
            }

            const el = target as HTMLElement;

            // CRITICAL: NEVER close floating menu if a spotlight guide is active or if tapping inside spotlight guide / modal!
            if (
                document.querySelector('.quran-spotlight-guide') ||
                document.getElementById('quran-spotlight-guide-root') ||
                (el && el.closest && (
                    el.closest('.quran-spotlight-guide') ||
                    el.closest('[data-guide-card]') ||
                    el.closest('.fixed.z-\\[100000\\]') ||
                    el.closest('.z-\\[100001\\]') ||
                    el.closest('.z-\\[100002\\]') ||
                    el.closest('[id^="spotlight-"]') ||
                    el.closest('svg')
                ))
            ) {
                return;
            }

            // If tapping inside any modal, dialog, or settings card, close floating menu smoothly WITHOUT destroying the click event
            if (el && el.closest && (
                el.closest('.modal-skinned') ||
                el.closest('[role="dialog"]') ||
                el.closest('.fixed.z-\\[1100\\]') ||
                el.closest('.fixed.z-\\[1200\\]') ||
                el.closest('.fixed.z-\\[1000\\]') ||
                el.closest('.fixed.z-50') ||
                el.closest('#reciter-tafseer-row') ||
                el.closest('#font-controls-row') ||
                el.closest('.themed-card-bg') ||
                el.closest('button') ||
                el.closest('input')
            )) {
                setIsFloatingMenuOpen(false);
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            if ('stopImmediatePropagation' in event) {
                (event as any).stopImmediatePropagation();
            }
            lastFloatingMenuCloseTimeRef.current = Date.now();
            setIsFloatingMenuOpen(false);
        };

        document.addEventListener('click', handleClickOutside, { capture: true });
        document.addEventListener('touchend', handleClickOutside, { capture: true, passive: false });

        return () => {
            document.removeEventListener('click', handleClickOutside, { capture: true });
            document.removeEventListener('touchend', handleClickOutside, { capture: true });
        };
    }, [isFloatingMenuOpen]);

    return {
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
    };
};
