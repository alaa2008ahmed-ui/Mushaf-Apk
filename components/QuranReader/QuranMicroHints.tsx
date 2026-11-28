import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Hand } from 'lucide-react';
import { isDarkQuranTheme } from './constants';

export type QuranMicroHintId =
    | 'verse_num'
    | 'ayah_text'
    | 'play_btn'
    | 'bookmark_btn'
    | 'autoscroll_btn'
    | 'page_num_btn'
    | 'share_btn'
    | 'bottom_page_btn';

interface QuranMicroHintStorage {
    shownCounts: Record<string, number>;
    usedHints: Record<string, boolean>;
}

const STORAGE_KEY = 'quran_micro_hints_v1';
const USED_EVENT_NAME = 'quran-micro-hint-used';
const MAX_SHOWN_PER_HINT = 20;
const MAX_HINTS_PER_VISIT = 7;
const HINT_DURATION_MS = 4000;
const SUPPORTED_MODES = new Set(['mushaf', 'madinah', 'translation', 'bilingual']);

const getVariedInitialDelayMs = () => 2500 + Math.floor(Math.random() * 3000); // 2.5s - 5.5s

const getVariedBetweenDelayMs = (shownSoFarInSession: number) => {
    if (shownSoFarInSession <= 1) {
        return 8000 + Math.floor(Math.random() * 7000); // 8s - 15s
    }
    if (shownSoFarInSession === 2) {
        return 14000 + Math.floor(Math.random() * 10000); // 14s - 24s
    }
    return 18000 + Math.floor(Math.random() * 12000); // 18s - 30s
};

const readStorageState = (): QuranMicroHintStorage => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { shownCounts: {}, usedHints: {} };
        const parsed = JSON.parse(raw);
        return {
            shownCounts: parsed?.shownCounts && typeof parsed.shownCounts === 'object' ? parsed.shownCounts : {},
            usedHints: parsed?.usedHints && typeof parsed.usedHints === 'object' ? parsed.usedHints : {},
        };
    } catch {
        return { shownCounts: {}, usedHints: {} };
    }
};

const writeStorageState = (state: QuranMicroHintStorage) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        // Ignore storage quota errors
    }
};

const getHintStorageKey = (mode: string, hintId: QuranMicroHintId) => `${mode}:${hintId}`;

export const markQuranMicroHintUsed = (mode: string, hintId: QuranMicroHintId) => {
    if (!SUPPORTED_MODES.has(mode)) return;
    const key = getHintStorageKey(mode, hintId);
    const state = readStorageState();
    if (!state.usedHints[key]) {
        state.usedHints[key] = true;
        writeStorageState(state);
    }
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(USED_EVENT_NAME, { detail: { mode, hintId, key } }));
    }
};

interface ActiveHintBubble {
    id: QuranMicroHintId;
    text: string;
    left: number;
    top: number;
    arrowLeft: number;
    placement: 'above' | 'below';
    width: number;
}

interface QuranMicroHintsProps {
    readingMode: string;
    isMadinahVertical?: boolean;
    isPaused: boolean;
    isEn: boolean;
    currentTheme?: any;
}

const MUSHAF_HINTS: QuranMicroHintId[] = [
    'verse_num',
    'ayah_text',
    'page_num_btn',
    'share_btn',
    'play_btn',
    'bookmark_btn',
    'autoscroll_btn',
];

const MADINAH_HINTS: QuranMicroHintId[] = [
    'verse_num',
    'ayah_text',
    'bottom_page_btn',
    'bookmark_btn',
    'autoscroll_btn',
    'play_btn',
];

const TRANSLATION_HINTS: QuranMicroHintId[] = [
    'verse_num',
    'ayah_text',
    'page_num_btn',
    'share_btn',
    'play_btn',
    'bookmark_btn',
    'autoscroll_btn',
];

const BILINGUAL_HINTS: QuranMicroHintId[] = [
    'verse_num',
    'ayah_text',
    'page_num_btn',
    'play_btn',
    'bookmark_btn',
    'autoscroll_btn',
];

const QuranMicroHints: React.FC<QuranMicroHintsProps> = ({
    readingMode,
    isMadinahVertical = false,
    isPaused,
    isEn,
    currentTheme,
}) => {
    const isSupportedMode = SUPPORTED_MODES.has(readingMode);
    const effectiveEn = isEn || readingMode === 'translation';
    const [activeBubble, setActiveBubble] = useState<ActiveHintBubble | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    const sessionShownIdsRef = useRef<Set<string>>(new Set());
    const sessionCountRef = useRef<number>(0);
    const activeTimerRef = useRef<number | null>(null);
    const fadeTimerRef = useRef<number | null>(null);
    const nextTimerRef = useRef<number | null>(null);
    const activeHintIdRef = useRef<QuranMicroHintId | null>(null);
    const isPointerActiveRef = useRef<boolean>(false);
    const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
    const lastMovementTsRef = useRef<number>(0);

    const clearScheduleTimers = useCallback(() => {
        if (activeTimerRef.current !== null) {
            window.clearTimeout(activeTimerRef.current);
            activeTimerRef.current = null;
        }
        if (nextTimerRef.current !== null) {
            window.clearTimeout(nextTimerRef.current);
            nextTimerRef.current = null;
        }
    }, []);

    const clearFadeTimer = useCallback(() => {
        if (fadeTimerRef.current !== null) {
            window.clearTimeout(fadeTimerRef.current);
            fadeTimerRef.current = null;
        }
    }, []);

    const clearAllTimers = useCallback(() => {
        clearScheduleTimers();
        clearFadeTimer();
    }, [clearFadeTimer, clearScheduleTimers]);

    const dismissCurrentHint = useCallback((immediate = false) => {
        setIsVisible(false);
        activeHintIdRef.current = null;
        clearFadeTimer();
        if (immediate) {
            setActiveBubble(null);
            return;
        }
        fadeTimerRef.current = window.setTimeout(() => {
            fadeTimerRef.current = null;
            setActiveBubble(null);
        }, 220);
    }, [clearFadeTimer]);

    // Reset session tracking when switching reading modes
    useEffect(() => {
        clearAllTimers();
        sessionShownIdsRef.current.clear();
        sessionCountRef.current = 0;
        activeHintIdRef.current = null;
        setIsVisible(false);
        setActiveBubble(null);
    }, [readingMode, clearAllTimers]);

    const getHintDefinition = useCallback(
        (id: QuranMicroHintId): { selector: string; text: string; isInlineTarget: boolean } => {
            const isVerticalTranslationFamily = readingMode === 'translation' || readingMode === 'bilingual';
            switch (id) {
                case 'verse_num':
                    return {
                        selector:
                            readingMode === 'madinah'
                                ? '.madinah-qpc-word-end'
                                : readingMode === 'translation'
                                ? '.translation-verse-num'
                                : readingMode === 'bilingual'
                                ? '.verse-container, .translation-verse-num'
                                : '.verse-container',
                        text: isVerticalTranslationFamily
                            ? effectiveEn
                                ? 'Verse no.: Tap to view Tafseer'
                                : 'رقم الآية: اضغط لعرض التفسير'
                            : effectiveEn
                            ? 'Verse no.: Tap for options • Hold for Tafseer'
                            : 'رقم الآية: ضغطة لخيارات الآية • مطولاً للتفسير',
                        isInlineTarget: true,
                    };
                case 'ayah_text':
                    return {
                        selector: readingMode === 'madinah' ? '.madinah-qpc-line-ayah' : '.ayah-text-block',
                        text:
                            readingMode === 'madinah'
                                ? effectiveEn
                                    ? 'Verse: Tap to recite • Hold to customize colors'
                                    : 'نص الآية: ضغطة للتلاوة • مطولاً لتخصيص الألوان'
                                : effectiveEn
                                ? 'Verse: Tap to recite • Double-tap bars • Hold for colors'
                                : 'نص الآية: ضغطة للتلاوة • ضغطتان للأشرطة • مطولاً للألوان',
                        isInlineTarget: true,
                    };
                case 'page_num_btn':
                    return {
                        selector: '#header-page',
                        text: effectiveEn
                            ? 'Page no.: Tap to type any page and jump'
                            : 'رقم الصفحة: اضغط لكتابة رقم الصفحة والانتقال إليها',
                        isInlineTarget: false,
                    };
                case 'share_btn':
                    return {
                        selector: '#btn-share',
                        text: effectiveEn
                            ? 'Share card: Tap to design and share verse image'
                            : 'مشاركة صورة: اضغط لتصميم ومشاركة الآية كبطاقة',
                        isInlineTarget: false,
                    };
                case 'bottom_page_btn':
                    return {
                        selector: '#madinah-bottom-page-btn',
                        text: effectiveEn
                            ? 'Page no.: Tap to type any page number and jump'
                            : 'رقم الصفحة: اضغط لكتابة رقم الصفحة والانتقال إليها',
                        isInlineTarget: false,
                    };
                case 'play_btn':
                    return {
                        selector: '#btn-play',
                        text: effectiveEn
                            ? 'Recite: Tap to play • Hold to choose reciter'
                            : 'زر التلاوة: ضغطة للتشغيل • مطولاً لاختيار القارئ',
                        isInlineTarget: false,
                    };
                case 'bookmark_btn':
                    return {
                        selector: readingMode === 'madinah' ? '#madinah-header-bookmark-btn' : '#btn-bookmark',
                        text: effectiveEn
                            ? 'Bookmarks: Tap to save • Hold for saved list'
                            : 'الإشارات المرجعية: ضغطة للحفظ • مطولاً لعرض العلامات',
                        isInlineTarget: false,
                    };
                case 'autoscroll_btn':
                default:
                    return {
                        selector: readingMode === 'madinah' ? '#madinah-bottom-autoscroll-btn' : '#btn-autoscroll',
                        text: effectiveEn
                            ? 'Auto-scroll: Tap to start • Hold for speed'
                            : 'التمرير التلقائي: ضغطة للتشغيل • مطولاً للسرعة',
                        isInlineTarget: false,
                    };
            }
        },
        [readingMode, effectiveEn]
    );

    const findBestTargetRect = useCallback(
        (selector: string, isInlineTarget: boolean): DOMRect | null => {
            if (typeof document === 'undefined' || typeof window === 'undefined') return null;
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const elements = Array.from(document.querySelectorAll<HTMLElement>(selector));
            if (elements.length === 0) return null;

            const isElementVisible = (el: HTMLElement): boolean => {
                const style = window.getComputedStyle(el);
                if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity || '1') < 0.2) {
                    return false;
                }
                const toolbar = el.closest('#header, #bottom-bar') as HTMLElement | null;
                if (toolbar) {
                    const toolbarStyle = window.getComputedStyle(toolbar);
                    if (
                        toolbarStyle.display === 'none' ||
                        toolbarStyle.visibility === 'hidden' ||
                        parseFloat(toolbarStyle.opacity || '1') < 0.2
                    ) {
                        return false;
                    }
                }
                return true;
            };

            if (!isInlineTarget) {
                for (const el of elements) {
                    if (!isElementVisible(el)) continue;
                    const rect = el.getBoundingClientRect();
                    if (rect.width > 4 && rect.height > 4 && rect.top >= -2 && rect.bottom <= vh + 2 && rect.left >= -2 && rect.right <= vw + 2) {
                        return rect;
                    }
                }
                return null;
            }

            const minTop = Math.max(76, vh * 0.16);
            const maxBottom = Math.min(vh - 76, vh * 0.84);
            const idealY = vh * 0.36;

            let bestRect: DOMRect | null = null;
            let bestScore = Number.POSITIVE_INFINITY;
            let fallbackRect: DOMRect | null = null;
            let fallbackScore = Number.POSITIVE_INFINITY;

            for (const el of elements) {
                if (!isElementVisible(el)) continue;
                const rect = el.getBoundingClientRect();
                if (rect.width < 6 || rect.height < 6) continue;
                if (rect.right < 12 || rect.left > vw - 12) continue;

                const centerY = rect.top + rect.height / 2;
                const dist = Math.abs(centerY - idealY);

                if (rect.top >= minTop && rect.bottom <= maxBottom) {
                    if (dist < bestScore) {
                        bestScore = dist;
                        bestRect = rect;
                    }
                } else {
                    const visibleTop = Math.max(rect.top, minTop);
                    const visibleBottom = Math.min(rect.bottom, maxBottom);
                    if (visibleBottom - visibleTop >= 24) {
                        const clampedCenterY = (visibleTop + visibleBottom) / 2;
                        const clampedDist = Math.abs(clampedCenterY - idealY);
                        if (clampedDist < fallbackScore) {
                            fallbackScore = clampedDist;
                            fallbackRect = new DOMRect(
                                rect.left,
                                visibleTop,
                                rect.width,
                                visibleBottom - visibleTop
                            );
                        }
                    }
                }
            }

            return bestRect || fallbackRect;
        },
        []
    );

    const computeBubblePosition = useCallback((rect: DOMRect, isInlineTarget: boolean): Omit<ActiveHintBubble, 'id' | 'text'> => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const bubbleWidth = Math.min(252, Math.max(195, vw - 28));
        const estimatedHeight = 48;

        const targetCenterX = Math.max(20, Math.min(vw - 20, rect.left + rect.width / 2));
        const rawLeft = targetCenterX - bubbleWidth / 2;
        const left = Math.max(12, Math.min(vw - bubbleWidth - 12, rawLeft));
        const arrowLeft = Math.max(14, Math.min(bubbleWidth - 22, targetCenterX - left - 4));

        const preferBelow = isInlineTarget
            ? rect.top < vh * 0.42
            : rect.top < vh * 0.5;

        let placement: 'above' | 'below' = preferBelow ? 'below' : 'above';
        let top = placement === 'below' ? rect.bottom + 10 : rect.top - estimatedHeight - 10;

        if (placement === 'below' && top + estimatedHeight > vh - 16) {
            placement = 'above';
            top = Math.max(12, rect.top - estimatedHeight - 10);
        } else if (placement === 'above' && top < 12) {
            placement = 'below';
            top = Math.min(vh - estimatedHeight - 12, rect.bottom + 10);
        }

        return { left, top, arrowLeft, placement, width: bubbleWidth };
    }, []);

    const scheduleNextHint = useCallback(
        (delayMs: number) => {
            clearScheduleTimers();
            if (!isSupportedMode || isPaused) return;
            if (sessionCountRef.current >= MAX_HINTS_PER_VISIT) return;

            nextTimerRef.current = window.setTimeout(() => {
                if (!isSupportedMode || isPaused) return;
                if (sessionCountRef.current >= MAX_HINTS_PER_VISIT) return;

                // Delay showing a new hint if user is actively touching/scrolling
                if (isPointerActiveRef.current || Date.now() - lastMovementTsRef.current < 900) {
                    scheduleNextHint(1500);
                    return;
                }

                const storage = readStorageState();
                const modeHints =
                    readingMode === 'madinah'
                        ? MADINAH_HINTS
                        : readingMode === 'translation'
                        ? TRANSLATION_HINTS
                        : readingMode === 'bilingual'
                        ? BILINGUAL_HINTS
                        : MUSHAF_HINTS;

                // Prioritize hints shown fewest times so all features rotate naturally across up to 20 appearances
                const candidates = modeHints
                    .filter((id) => {
                        if (id === 'autoscroll_btn' && readingMode === 'madinah' && !isMadinahVertical) {
                            return false;
                        }
                        if (sessionShownIdsRef.current.has(id)) return false;
                        const key = getHintStorageKey(readingMode, id);
                        if (storage.usedHints[key]) return false;
                        if ((storage.shownCounts[key] || 0) >= MAX_SHOWN_PER_HINT) return false;
                        return true;
                    })
                    .map((id) => ({
                        id,
                        count: storage.shownCounts[getHintStorageKey(readingMode, id)] || 0,
                        jitter: Math.random(),
                    }))
                    .sort((a, b) => (a.count !== b.count ? a.count - b.count : a.jitter - b.jitter));

                for (const candidate of candidates) {
                    const id = candidate.id;
                    const key = getHintStorageKey(readingMode, id);
                    const def = getHintDefinition(id);
                    const rect = findBestTargetRect(def.selector, def.isInlineTarget);
                    if (!rect) continue;

                    const pos = computeBubblePosition(rect, def.isInlineTarget);

                    sessionShownIdsRef.current.add(id);
                    sessionCountRef.current += 1;
                    storage.shownCounts[key] = (storage.shownCounts[key] || 0) + 1;
                    writeStorageState(storage);

                    activeHintIdRef.current = id;
                    setActiveBubble({
                        id,
                        text: def.text,
                        ...pos,
                    });
                    window.requestAnimationFrame(() => setIsVisible(true));

                    activeTimerRef.current = window.setTimeout(() => {
                        dismissCurrentHint(false);
                        if (sessionCountRef.current < MAX_HINTS_PER_VISIT) {
                            scheduleNextHint(getVariedBetweenDelayMs(sessionCountRef.current));
                        }
                    }, HINT_DURATION_MS);

                    return;
                }

                if (candidates.length > 0) {
                    scheduleNextHint(8000);
                }
            }, delayMs);
        },
        [
            clearScheduleTimers,
            computeBubblePosition,
            dismissCurrentHint,
            findBestTargetRect,
            getHintDefinition,
            isMadinahVertical,
            isPaused,
            isSupportedMode,
            readingMode,
        ]
    );

    // Start or pause hint scheduling based on reader state (including auto-scroll)
    useEffect(() => {
        if (!isSupportedMode || isPaused) {
            clearAllTimers();
            activeHintIdRef.current = null;
            setIsVisible(false);
            setActiveBubble(null);
            return;
        }

        if (sessionCountRef.current < MAX_HINTS_PER_VISIT && !activeHintIdRef.current) {
            const delay =
                sessionCountRef.current === 0
                    ? getVariedInitialDelayMs()
                    : getVariedBetweenDelayMs(sessionCountRef.current);
            scheduleNextHint(delay);
        }

        return () => {
            clearScheduleTimers();
        };
    }, [isSupportedMode, isPaused, scheduleNextHint, clearAllTimers, clearScheduleTimers]);

    // When Madinah switches to vertical mode, ensure vertical autoscroll hint can appear if not yet seen/used
    useEffect(() => {
        if (readingMode !== 'madinah' || !isMadinahVertical || isPaused) return;
        if (activeHintIdRef.current || sessionCountRef.current >= MAX_HINTS_PER_VISIT) return;
        scheduleNextHint(getVariedInitialDelayMs());
    }, [readingMode, isMadinahVertical, isPaused, scheduleNextHint]);

    // Immediately dismiss if the user actually performs the hinted action
    useEffect(() => {
        const handleUsed = (e: Event) => {
            const detail = (e as CustomEvent)?.detail;
            if (!detail) return;
            if (detail.mode === readingMode && detail.hintId === activeHintIdRef.current) {
                clearScheduleTimers();
                dismissCurrentHint(true);
                if (!isPaused && sessionCountRef.current < MAX_HINTS_PER_VISIT) {
                    scheduleNextHint(getVariedBetweenDelayMs(sessionCountRef.current));
                }
            }
        };
        window.addEventListener(USED_EVENT_NAME, handleUsed);
        return () => window.removeEventListener(USED_EVENT_NAME, handleUsed);
    }, [readingMode, isPaused, clearScheduleTimers, dismissCurrentHint, scheduleNextHint]);

    // Track user movement continuously and immediately dismiss ANY visible hint when moving/scrolling in any direction
    useEffect(() => {
        if (!isSupportedMode) return;

        const dismissOnMovement = () => {
            lastMovementTsRef.current = Date.now();
            if (!activeHintIdRef.current) return;
            clearScheduleTimers();
            dismissCurrentHint(true);
            if (!isPaused && sessionCountRef.current < MAX_HINTS_PER_VISIT) {
                scheduleNextHint(getVariedBetweenDelayMs(sessionCountRef.current));
            }
        };

        const onTouchStart = (e: TouchEvent) => {
            if (e.touches.length >= 1) {
                isPointerActiveRef.current = true;
                pointerStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                if (e.touches.length > 1) {
                    dismissOnMovement();
                }
            }
        };

        const onTouchMove = (e: TouchEvent) => {
            if (e.touches.length === 0) return;
            isPointerActiveRef.current = true;
            if (e.touches.length > 1) {
                dismissOnMovement();
                return;
            }
            const t = e.touches[0];
            if (!pointerStartRef.current) {
                pointerStartRef.current = { x: t.clientX, y: t.clientY };
                return;
            }
            const dx = t.clientX - pointerStartRef.current.x;
            const dy = t.clientY - pointerStartRef.current.y;
            if (Math.hypot(dx, dy) >= 5) {
                dismissOnMovement();
            }
        };

        const onTouchEnd = () => {
            isPointerActiveRef.current = false;
            pointerStartRef.current = null;
        };

        const onMouseDown = (e: MouseEvent) => {
            if (e.button !== 0) return;
            isPointerActiveRef.current = true;
            pointerStartRef.current = { x: e.clientX, y: e.clientY };
        };

        const onMouseMove = (e: MouseEvent) => {
            if ((e.buttons & 1) === 0 || !isPointerActiveRef.current) return;
            if (!pointerStartRef.current) {
                pointerStartRef.current = { x: e.clientX, y: e.clientY };
                return;
            }
            const dx = e.clientX - pointerStartRef.current.x;
            const dy = e.clientY - pointerStartRef.current.y;
            if (Math.hypot(dx, dy) >= 5) {
                dismissOnMovement();
            }
        };

        const onMouseUp = () => {
            isPointerActiveRef.current = false;
            pointerStartRef.current = null;
        };

        const onWheel = (e: WheelEvent) => {
            if (Math.abs(e.deltaX) >= 1 || Math.abs(e.deltaY) >= 1) {
                dismissOnMovement();
            }
        };

        const onScroll = () => {
            dismissOnMovement();
        };

        const onKeyDown = (e: KeyboardEvent) => {
            if (
                e.key === 'ArrowLeft' ||
                e.key === 'ArrowRight' ||
                e.key === 'ArrowUp' ||
                e.key === 'ArrowDown' ||
                e.key === 'PageUp' ||
                e.key === 'PageDown'
            ) {
                dismissOnMovement();
            }
        };

        window.addEventListener('touchstart', onTouchStart, { capture: true, passive: true });
        window.addEventListener('touchmove', onTouchMove, { capture: true, passive: true });
        window.addEventListener('touchend', onTouchEnd, { capture: true, passive: true });
        window.addEventListener('touchcancel', onTouchEnd, { capture: true, passive: true });
        window.addEventListener('mousedown', onMouseDown, { capture: true, passive: true });
        window.addEventListener('mousemove', onMouseMove, { capture: true, passive: true });
        window.addEventListener('mouseup', onMouseUp, { capture: true, passive: true });
        window.addEventListener('wheel', onWheel, { capture: true, passive: true });
        document.addEventListener('scroll', onScroll, { capture: true, passive: true });
        window.addEventListener('keydown', onKeyDown, { capture: true, passive: true });

        return () => {
            window.removeEventListener('touchstart', onTouchStart, { capture: true });
            window.removeEventListener('touchmove', onTouchMove, { capture: true });
            window.removeEventListener('touchend', onTouchEnd, { capture: true });
            window.removeEventListener('touchcancel', onTouchEnd, { capture: true });
            window.removeEventListener('mousedown', onMouseDown, { capture: true });
            window.removeEventListener('mousemove', onMouseMove, { capture: true });
            window.removeEventListener('mouseup', onMouseUp, { capture: true });
            window.removeEventListener('wheel', onWheel, { capture: true });
            document.removeEventListener('scroll', onScroll, { capture: true });
            window.removeEventListener('keydown', onKeyDown, { capture: true });
        };
    }, [isSupportedMode, isPaused, clearScheduleTimers, dismissCurrentHint, scheduleNextHint]);

    const bubblePalette = useMemo(() => {
        const isDark = isDarkQuranTheme(currentTheme);
        const themeId = typeof currentTheme === 'string' ? currentTheme : (currentTheme?.id || '');

        const mixColor = (hexA: string, hexB: string, weightB: number): string | null => {
            const parse = (raw: string): [number, number, number] | null => {
                const h = raw.replace('#', '').trim();
                const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
                if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
                return [
                    parseInt(full.slice(0, 2), 16),
                    parseInt(full.slice(2, 4), 16),
                    parseInt(full.slice(4, 6), 16),
                ];
            };
            const a = parse(hexA);
            const b = parse(hexB);
            if (!a || !b) return null;
            const w = Math.max(0, Math.min(1, weightB));
            const r = Math.round(a[0] * (1 - w) + b[0] * w);
            const g = Math.round(a[1] * (1 - w) + b[1] * w);
            const bl = Math.round(a[2] * (1 - w) + b[2] * w);
            return `#${[r, g, bl].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
        };

        if (isDark || themeId === 'deep_black') {
            const accentHex =
                typeof currentTheme?.accent === 'string' &&
                currentTheme.accent.toLowerCase() !== '#27272a' &&
                currentTheme.accent.toLowerCase() !== '#000000'
                    ? currentTheme.accent
                    : (currentTheme?.verseBracket || currentTheme?.sajdah || '#fbbf24');
            const darkBg = mixColor(accentHex, '#0b0b0e', 0.84) || '#18181d';
            const borderCol = mixColor(accentHex, '#ffffff', 0.32) || '#fbbf24';
            return {
                bg: darkBg,
                text: '#FFFFFF',
                border: borderCol,
                iconBg: 'rgba(255, 255, 255, 0.14)',
                iconColor: borderCol,
                shadow: '0 10px 28px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.12)',
            };
        }

        if (themeId === 'green') {
            return {
                bg: '#052E16',
                text: '#FFFFFF',
                border: '#4ADE80',
                iconBg: 'rgba(74, 222, 128, 0.2)',
                iconColor: '#86EFAC',
                shadow: '0 10px 26px rgba(5, 46, 22, 0.45)',
            };
        }

        if (themeId === 'night_sky') {
            return {
                bg: '#0C1F42',
                text: '#FFFFFF',
                border: '#60A5FA',
                iconBg: 'rgba(96, 165, 250, 0.2)',
                iconColor: '#93C5FD',
                shadow: '0 10px 26px rgba(12, 31, 66, 0.45)',
            };
        }

        if (themeId === 'maroon') {
            return {
                bg: '#3B071E',
                text: '#FFFFFF',
                border: '#F472B6',
                iconBg: 'rgba(244, 114, 182, 0.2)',
                iconColor: '#FBCFE8',
                shadow: '0 10px 26px rgba(59, 7, 30, 0.48)',
            };
        }

        if (themeId === 'gold') {
            return {
                bg: '#422006',
                text: '#FFFFFF',
                border: '#FBBF24',
                iconBg: 'rgba(251, 191, 36, 0.2)',
                iconColor: '#FDE68A',
                shadow: '0 10px 26px rgba(66, 32, 6, 0.48)',
            };
        }

        if (themeId === 'black') {
            return {
                bg: '#111827',
                text: '#FFFFFF',
                border: '#9CA3AF',
                iconBg: 'rgba(255, 255, 255, 0.16)',
                iconColor: '#F3F4F6',
                shadow: '0 10px 26px rgba(17, 24, 39, 0.44)',
            };
        }

        const customSample = String(
            currentTheme?.barText ||
            currentTheme?.barBorder ||
            currentTheme?.accent ||
            currentTheme?.headerText ||
            ''
        ).trim();
        const veryDarkCustom = mixColor(customSample, '#050507', 0.78);
        const lightBorderCustom = mixColor(customSample, '#ffffff', 0.45);
        if (veryDarkCustom && lightBorderCustom) {
            return {
                bg: veryDarkCustom,
                text: '#FFFFFF',
                border: lightBorderCustom,
                iconBg: 'rgba(255, 255, 255, 0.18)',
                iconColor: lightBorderCustom,
                shadow: '0 10px 26px rgba(0, 0, 0, 0.44)',
            };
        }

        return {
            bg: '#111827',
            text: '#FFFFFF',
            border: '#9CA3AF',
            iconBg: 'rgba(255, 255, 255, 0.16)',
            iconColor: '#F3F4F6',
            shadow: '0 10px 26px rgba(17, 24, 39, 0.44)',
        };
    }, [currentTheme]);

    if (!isSupportedMode || !activeBubble) return null;

    return (
        <div className="fixed inset-0 z-[950] pointer-events-none select-none" dir={effectiveEn ? 'ltr' : 'rtl'}>
            <div
                onClick={() => {
                    clearScheduleTimers();
                    dismissCurrentHint(true);
                    if (!isPaused && sessionCountRef.current < MAX_HINTS_PER_VISIT) {
                        scheduleNextHint(getVariedBetweenDelayMs(sessionCountRef.current));
                    }
                }}
                className={`${isVisible ? 'pointer-events-auto' : 'pointer-events-none'} cursor-pointer relative transition-all duration-200 ease-out`}
                style={{
                    position: 'fixed',
                    left: `${activeBubble.left}px`,
                    top: `${activeBubble.top}px`,
                    width: `${activeBubble.width}px`,
                    backgroundColor: bubblePalette.bg,
                    color: bubblePalette.text,
                    border: `1.5px solid ${bubblePalette.border}`,
                    borderRadius: '12px',
                    padding: '8px 11px',
                    boxShadow: bubblePalette.shadow,
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible
                        ? 'translateY(0) scale(1)'
                        : activeBubble.placement === 'below'
                        ? 'translateY(-4px) scale(0.97)'
                        : 'translateY(4px) scale(0.97)',
                }}
                role="status"
                aria-live="polite"
            >
                <span
                    aria-hidden="true"
                    style={{
                        position: 'absolute',
                        left: `${activeBubble.arrowLeft}px`,
                        ...(activeBubble.placement === 'below'
                            ? {
                                  top: '-5.5px',
                                  borderTop: `1.5px solid ${bubblePalette.border}`,
                                  borderLeft: `1.5px solid ${bubblePalette.border}`,
                              }
                            : {
                                  bottom: '-5.5px',
                                  borderBottom: `1.5px solid ${bubblePalette.border}`,
                                  borderRight: `1.5px solid ${bubblePalette.border}`,
                              }),
                        width: '9px',
                        height: '9px',
                        backgroundColor: bubblePalette.bg,
                        transform: 'rotate(45deg)',
                    }}
                />
                <div className="flex items-center gap-2 relative z-10">
                    <span
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                        style={{
                            backgroundColor: bubblePalette.iconBg,
                            color: bubblePalette.iconColor,
                        }}
                    >
                        <Hand size={12} />
                    </span>
                    <span className="text-[11px] leading-[1.45] font-bold">
                        {activeBubble.text}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default QuranMicroHints;
