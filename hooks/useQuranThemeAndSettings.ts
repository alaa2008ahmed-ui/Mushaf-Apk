import React, { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react';
import { KeepAwake } from '@capacitor-community/keep-awake';
import {
    ReadingMode,
    THEMES,
    getValidReaderForMode,
    DEFAULT_SETTINGS,
    getCurrentLayoutContext,
    getQuranThemeForLayout,
    getToolbarColorsForTheme,
    syncQuranThemeToStorage,
    getLinkedQuranThemeForHomeVariant,
    getEffectiveWordHighlightColor,
    resolveNonConflictingWordHighlightColor,
    isDarkQuranTheme,
} from '../components/QuranReader/constants';
import { syncSystemStatusBar } from '../utils/styles/statusBar';
import {
    resolveReaderSettingsWithTheme,
    sanitizeRemovedThemeInStorage,
} from '../components/QuranReader/QuranReaderInlineModals';
import {
    getClusterForLanguage,
    saveClusterPosition,
    getClusterPosition,
    syncClusterSettings,
    getClusterSettings,
    getMadinahSettings,
    saveMadinahSettings,
} from '../utils/quran/quranClusterSync';
import { getMadinahThemePalette } from '../components/QuranReader/MadinahFrameSVG';
import { quranData as quranJsonData } from '../utils/quran/quranData';

interface UseQuranThemeAndSettingsParams {
    readingMode: ReadingMode;
    readingModeRef: React.MutableRefObject<ReadingMode>;
    initialLandscape: boolean;
    isLandscape: boolean;
    isLandscapeRef: React.MutableRefObject<boolean>;
    navParams: any;
    language: string;
    isWirdMode: boolean;
    localIsMemorizationMode: boolean;
    isNightMode: boolean;
    themeKey: string;
    homeThemeVariant: any;
    themeSuffix: string;
    posSuffix: string;
    bookmarkSuffix: string;
    getScopedSuffix: (mode: string, landscapeFlag?: boolean) => string;
    initialSurah?: number;
    initialPage?: number;
    currentAyah: { s: number; a: number };
    setCurrentAyah: React.Dispatch<React.SetStateAction<{ s: number; a: number }>>;
    currentAyahRef: React.MutableRefObject<{ s: number; a: number }>;
    selectedAyahRef: React.MutableRefObject<{ s: number; a: number; page: number; juz: number } | null>;
    setHighlightedAyahId: React.Dispatch<React.SetStateAction<string | null>>;
    setVisiblePages: React.Dispatch<React.SetStateAction<number[]>>;
    getSavedModePosition: (targetMode: ReadingMode) => { s: number; a: number; isExplicit?: boolean } | null;
    prevReadingModeRef: React.MutableRefObject<ReadingMode>;
    isJumpingRef: React.MutableRefObject<boolean>;
    hasJumpedRef: React.MutableRefObject<boolean>;
    shouldSkipSavePositionRef: React.MutableRefObject<boolean>;
    isTransparentMode: boolean;
    setIsTransparentMode: React.Dispatch<React.SetStateAction<boolean>>;
    isHideToolbarsEnabledRef: React.MutableRefObject<boolean>;
    setIsHideToolbarsEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    isLandscapeUIHidden: boolean;
    setIsLandscapeUIHidden: React.Dispatch<React.SetStateAction<boolean>>;
    showSajdahCard: boolean;
    setShowSajdahCard: React.Dispatch<React.SetStateAction<boolean>>;
    activeModals: string[];
    setActiveModals: React.Dispatch<React.SetStateAction<string[]>>;
    setIsFloatingMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
    loadBookmarksForMode: (targetMode: string) => any[];
    setBookmarks: React.Dispatch<React.SetStateAction<any[]>>;
    setQuranData: React.Dispatch<React.SetStateAction<any>>;
    scrollToAyahRef: React.MutableRefObject<(s: number, a: number, instant?: boolean, retries?: number, isPageJump?: boolean) => void>;
    jumpToAyahRef: React.MutableRefObject<(s: number, a: number, instant?: boolean, isPageJump?: boolean) => void>;
    stopAutoScrollRef: React.MutableRefObject<(showTimer?: boolean) => void>;
    stopAudioRef: React.MutableRefObject<() => void>;
    playAudioRef: React.MutableRefObject<(s: number, a: number) => void>;
    isPlayingRef: React.MutableRefObject<boolean>;
}

export const useQuranThemeAndSettings = ({
    readingMode,
    readingModeRef,
    initialLandscape,
    isLandscape,
    isLandscapeRef,
    navParams,
    language,
    isWirdMode,
    localIsMemorizationMode,
    isNightMode,
    themeKey,
    homeThemeVariant,
    themeSuffix,
    posSuffix,
    bookmarkSuffix,
    getScopedSuffix,
    initialSurah,
    initialPage,
    currentAyah,
    setCurrentAyah,
    currentAyahRef,
    selectedAyahRef,
    setHighlightedAyahId,
    setVisiblePages,
    getSavedModePosition,
    prevReadingModeRef,
    isJumpingRef,
    hasJumpedRef,
    shouldSkipSavePositionRef,
    isTransparentMode,
    setIsTransparentMode,
    isHideToolbarsEnabledRef,
    setIsHideToolbarsEnabled,
    isLandscapeUIHidden,
    setIsLandscapeUIHidden,
    showSajdahCard,
    setShowSajdahCard,
    activeModals,
    setActiveModals,
    setIsFloatingMenuOpen,
    loadBookmarksForMode,
    setBookmarks,
    setQuranData,
    scrollToAyahRef,
    jumpToAyahRef,
    stopAutoScrollRef,
    stopAudioRef,
    playAudioRef,
    isPlayingRef,
}: UseQuranThemeAndSettingsParams) => {
    const [settings, setSettings] = useState(() => {
        const mode = getScopedSuffix(readingMode, initialLandscape);
        sanitizeRemovedThemeInStorage(mode);
        const layout = getCurrentLayoutContext(navParams);
        const cluster = getClusterForLanguage(language);
        const effectiveScopeMode = isWirdMode ? 'wird' : localIsMemorizationMode ? 'memorization' : readingMode;
        const isMadinahInit = readingMode === 'madinah';
        const clusterSettings = (!isWirdMode && !localIsMemorizationMode)
            ? (isMadinahInit ? getMadinahSettings(initialLandscape) : getClusterSettings(cluster, readingMode, initialLandscape))
            : null;
        const targetThemeId = getQuranThemeForLayout(layout, mode, readingMode);
        const fallbackThemeId = getLinkedQuranThemeForHomeVariant(homeThemeVariant);
        const defaultTheme = THEMES[targetThemeId as keyof typeof THEMES] || THEMES[fallbackThemeId as keyof typeof THEMES] || THEMES['gold'];
        const saved = isMadinahInit
            ? (localStorage.getItem('quran_settings' + mode) || (!initialLandscape ? localStorage.getItem('quran_settings_madinah') : null))
            : localStorage.getItem('quran_settings' + mode);
        const base = clusterSettings || (saved ? JSON.parse(saved) : {});
        const validatedReader = getValidReaderForMode(readingMode, base.reader);
        const isEnglishTranslationOrBilingual = language === 'en' && (readingMode === 'translation' || readingMode === 'bilingual');
        const effectiveFontSize = base.fontSize !== undefined ? base.fontSize : (isEnglishTranslationOrBilingual ? 1.2 : 1.6);
        return resolveReaderSettingsWithTheme(
            {
                ...base,
                fontSize: effectiveFontSize,
                reader: validatedReader,
                fontFamily: base.fontFamily || defaultTheme.font,
                textColor: base.textColor || defaultTheme.text,
                bgColor: base.bgColor || defaultTheme.bg,
                theme: base.theme || defaultTheme.id
            },
            defaultTheme,
            effectiveScopeMode,
            initialLandscape
        );
    });

    const settingsRef = useRef(settings);
    useEffect(() => { settingsRef.current = settings; }, [settings]);

    const [currentTheme, setCurrentTheme] = useState(() => {
        const mode = getScopedSuffix(readingMode, initialLandscape);
        const layout = getCurrentLayoutContext(navParams);
        const themeId = getQuranThemeForLayout(layout, mode, readingMode);
        const fallbackThemeId = getLinkedQuranThemeForHomeVariant(homeThemeVariant);
        return THEMES[themeId as keyof typeof THEMES] || THEMES[fallbackThemeId as keyof typeof THEMES] || THEMES['gold'];
    });

    const [toolbarColors, setToolbarColors] = useState(() => {
        const mode = getScopedSuffix(readingMode, initialLandscape);
        const layout = getCurrentLayoutContext(navParams);
        const themeId = getQuranThemeForLayout(layout, mode, readingMode);
        const fallbackThemeId = getLinkedQuranThemeForHomeVariant(homeThemeVariant);
        const theme = THEMES[themeId as keyof typeof THEMES] || THEMES[fallbackThemeId as keyof typeof THEMES] || THEMES['gold'];
        return getToolbarColorsForTheme(theme);
    });

    useEffect(() => {
        const isDarkTheme = isDarkQuranTheme(currentTheme);
        syncSystemStatusBar(isDarkTheme, currentTheme?.bg || '#FFFFFF', `quran:${currentTheme?.id || ''}`);
    }, [currentTheme]);

    // Keep screen awake logic
    useEffect(() => {
        let wakeLock: any = null;

        const requestWakeLock = async () => {
            // 1. Try Capacitor KeepAwake (for APK)
            try {
                await KeepAwake.keepAwake();
            } catch (e) {
                // Not in Capacitor or failed
            }

            // 2. Try Web Screen Wake Lock API (Fallback/Web)
            if ('wakeLock' in navigator) {
                try {
                    wakeLock = await (navigator as any).wakeLock.request('screen');
                } catch (err) {
                    console.warn('Wake Lock request failed:', err);
                }
            }
        };

        requestWakeLock();

        // Re-request wake lock when page becomes visible again
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                requestWakeLock();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            KeepAwake.allowSleep().catch(() => {});
            if (wakeLock) {
                wakeLock.release().catch(() => {});
            }
        };
    }, []);

    const updateSetting = (key: string, value: any) => {
        const layout = getCurrentLayoutContext(navParams);
        const effectiveScopeMode = isWirdMode ? 'wird' : localIsMemorizationMode ? 'memorization' : readingMode;
        const scopedSettingsKey = `quran_settings_${layout}_${effectiveScopeMode}_${isLandscape ? 'h' : 'v'}`;
        const newSettings = { ...settings, [key]: value };
        if (
            newSettings.wordHighlightEnabled &&
            ['highlightTextColor', 'theme', 'wordHighlightEnabled'].includes(key) &&
            newSettings.wordHighlightColor &&
            newSettings.wordHighlightColor !== 'auto'
        ) {
            const effectiveAyahHighlightColor =
                newSettings.highlightTextColor || currentTheme?.highlightText || currentTheme?.accent;
            const resolvedWordColor = resolveNonConflictingWordHighlightColor(
                effectiveAyahHighlightColor,
                newSettings.wordHighlightColor
            );
            if (resolvedWordColor !== newSettings.wordHighlightColor) {
                newSettings.wordHighlightColor = resolvedWordColor;
            }
        }
        const curS = currentAyahRef.current?.s || currentAyah?.s || 1;
        const curA = currentAyahRef.current?.a || currentAyah?.a || 1;
        const wasPlaying = key === 'reader' && isPlayingRef.current;
        if (wasPlaying) {
            stopAudioRef.current();
        }
        setSettings(newSettings);
        const hasColorChange = ['textColor', 'bgColor', 'highlightTextColor', 'theme'].includes(key);
        if (!isWirdMode && !localIsMemorizationMode) {
            const cluster = getClusterForLanguage(language);
            if (readingMode === 'madinah') {
                saveMadinahSettings(newSettings, {
                    markCustomColors: hasColorChange,
                    isLandscape: isLandscapeRef.current,
                });
            } else {
                localStorage.setItem(scopedSettingsKey, JSON.stringify(newSettings));
                localStorage.setItem('quran_settings' + themeSuffix, JSON.stringify(newSettings));
                syncClusterSettings(cluster, newSettings, isLandscapeRef.current, {
                    markCustomColors: hasColorChange,
                    readingMode,
                });
            }
            if (!shouldSkipSavePositionRef.current) {
                saveClusterPosition(cluster, { s: curS, a: curA, ts: Date.now() }, isLandscapeRef.current);
            }
        } else {
            localStorage.setItem(scopedSettingsKey, JSON.stringify(newSettings));
            localStorage.setItem('quran_settings' + themeSuffix, JSON.stringify(newSettings));
            if (hasColorChange) {
                const orient = isLandscapeRef.current ? 'h' : 'v';
                if (isNightMode) {
                    localStorage.setItem(`quran_settings_${effectiveScopeMode}_night_colors_custom_${orient}`, 'true');
                } else {
                    localStorage.setItem(`quran_settings_${effectiveScopeMode}_colors_custom_${orient}`, 'true');
                }
            }
            window.dispatchEvent(new Event('settings-change'));
        }
        if (wasPlaying) {
            setTimeout(() => {
                playAudioRef.current(curS, curA);
            }, 200);
        }
    };

    // Load settings based on orientation and mode
    useEffect(() => {
        const mode = themeSuffix;
        sanitizeRemovedThemeInStorage(mode);

        const layout = getCurrentLayoutContext(navParams);
        const cluster = getClusterForLanguage(language);
        const effectiveScopeMode = isWirdMode ? 'wird' : localIsMemorizationMode ? 'memorization' : readingMode;
        const scopedSettingsKey = `quran_settings_${layout}_${effectiveScopeMode}_${isLandscape ? 'h' : 'v'}`;
        const isMadinah = readingMode === 'madinah';

        // Prefer isolated mode+orientation settings if not in wird/memorization mode
        let clusterSettings = null;
        if (!isWirdMode && !localIsMemorizationMode) {
            clusterSettings = isMadinah
                ? getMadinahSettings(isLandscape)
                : getClusterSettings(cluster, readingMode, isLandscape);
        }
        const savedSettings = isMadinah
            ? (localStorage.getItem(scopedSettingsKey) || localStorage.getItem('quran_settings' + mode) || (!isLandscape ? localStorage.getItem('quran_settings_madinah') : null))
            : (localStorage.getItem(scopedSettingsKey) || localStorage.getItem('quran_settings' + mode));
        const baseSettings = clusterSettings || (savedSettings ? JSON.parse(savedSettings) : {});
        const validatedReader = getValidReaderForMode(localIsMemorizationMode ? 'mushaf' : readingMode, baseSettings.reader);
        const isEnglishTranslationOrBilingual = language === 'en' && (readingMode === 'translation' || readingMode === 'bilingual');
        const defaultFontSize = isEnglishTranslationOrBilingual ? 1.2 : 1.6;
        let effectiveFontSize = baseSettings.fontSize !== undefined ? baseSettings.fontSize : defaultFontSize;

        const themeId = getQuranThemeForLayout(layout, mode, readingMode);

        const fallbackThemeId = getLinkedQuranThemeForHomeVariant(homeThemeVariant);
        const newTheme = THEMES[themeId as keyof typeof THEMES] || THEMES[fallbackThemeId as keyof typeof THEMES] || THEMES['gold'];

        setCurrentTheme(newTheme);
        setToolbarColors(getToolbarColorsForTheme(newTheme));
        syncQuranThemeToStorage(newTheme, mode, readingMode);

        const resolvedSettings = resolveReaderSettingsWithTheme(
            {
                ...baseSettings,
                fontSize: effectiveFontSize,
                reader: validatedReader,
                bgColor: baseSettings.bgColor || newTheme.bg,
                textColor: baseSettings.textColor || newTheme.text,
                highlightTextColor: baseSettings.highlightTextColor || newTheme.highlightText || newTheme.accent,
                theme: baseSettings.theme || newTheme.id
            },
            newTheme,
            effectiveScopeMode,
            isLandscape
        );

        // Guard setSettings to avoid unnecessary re-renders
        setSettings(prev => {
            if (JSON.stringify(prev) === JSON.stringify(resolvedSettings)) return prev;
            return resolvedSettings;
        });

        const transSetting = localStorage.getItem('transparent_mode' + mode) === 'true';
        setIsTransparentMode(transSetting);

        const hideToolbarsSetting = localStorage.getItem('hide_toolbars_enabled' + mode) === 'true';
        if (isHideToolbarsEnabledRef.current !== hideToolbarsSetting) {
            setIsHideToolbarsEnabled(hideToolbarsSetting);
        }

        const currentModeBookmarks = loadBookmarksForMode(readingMode);
        setBookmarks(prev => {
            if (JSON.stringify(prev) === JSON.stringify(currentModeBookmarks)) return prev;
            return currentModeBookmarks;
        });

        const savedSajdah = localStorage.getItem('show_sajdah_card' + mode);
        const targetSajdah = savedSajdah !== null ? savedSajdah === 'true' : true;
        if (showSajdahCard !== targetSajdah) setShowSajdahCard(targetSajdah);

        if (mode.endsWith('_h')) {
            setIsLandscapeUIHidden(true);
        } else {
            if (!hideToolbarsSetting && isLandscapeUIHidden !== false) setIsLandscapeUIHidden(false);
            else if (hideToolbarsSetting && isLandscapeUIHidden !== true) setIsLandscapeUIHidden(true);
        }

        let targetS = 1;
        let targetA = 1;

        if (isWirdMode || localIsMemorizationMode) {
            const modePos = getSavedModePosition(readingMode);
            targetS = modePos?.s || 1;
            targetA = modePos?.a || 1;
        } else if (selectedAyahRef.current?.s && selectedAyahRef.current?.a) {
            // When an ayah is explicitly selected in ANY mode, prioritize it across ALL modes!
            targetS = selectedAyahRef.current.s;
            targetA = selectedAyahRef.current.a;
        } else if (currentAyahRef.current?.s && currentAyahRef.current?.a) {
            // ALWAYS KEEP THE EXACT ACTIVE AYAH REACHED BY THE READER!
            targetS = currentAyahRef.current.s;
            targetA = currentAyahRef.current.a;
        } else {
            const clusterPos = getClusterPosition(cluster, readingMode, isLandscape);
            if (clusterPos?.s) {
                targetS = clusterPos.s;
                targetA = clusterPos.a || 1;
            } else {
                const modePos = getSavedModePosition(readingMode);
                targetS = modePos?.s || 1;
                targetA = modePos?.a || 1;
            }
        }

        const isModeChange = prevReadingModeRef.current !== readingMode;
        // Only stop activities if the reading mode actually changed, not just orientation
        if (isModeChange) {
            isJumpingRef.current = true;
            setTimeout(() => {
                isJumpingRef.current = false;
            }, 800);

            stopAudioRef.current();
            stopAutoScrollRef.current(false);
            setActiveModals([]);
            setIsFloatingMenuOpen(false);
            prevReadingModeRef.current = readingMode;

            // Immediately update currentAyah and highlighted ayah to the synced target
            setCurrentAyah({ s: targetS, a: targetA });
            currentAyahRef.current = { s: targetS, a: targetA };
            setHighlightedAyahId(`ayah-${targetS}-${targetA}`);

            const sObj = quranJsonData.surahs[targetS - 1];
            const aObj = sObj?.ayahs?.[targetA - 1];
            const targetP = aObj?.page || 1;
            const targetJuz = aObj?.juz || 1;

            if (selectedAyahRef.current) {
                selectedAyahRef.current = { s: targetS, a: targetA, page: targetP, juz: targetJuz };
            }

            if (readingMode === 'mushaf') {
                setVisiblePages([...new Set([targetP, targetP + 1, targetP + 2, targetP - 1, targetP - 2])].filter(n => n > 0 && n <= 604).sort((a: number, b: number) => a - b));
                setTimeout(() => {
                    scrollToAyahRef.current(targetS, targetA, true, 50, false);
                }, 80);
            }

            if (!isWirdMode && !localIsMemorizationMode && !shouldSkipSavePositionRef.current) {
                saveClusterPosition(cluster, { s: targetS, a: targetA }, isLandscape);
                const savedObj = { s: targetS, a: targetA, page: targetP, juz: targetJuz, isExplicit: Boolean(selectedAyahRef.current), ts: Date.now() };
                localStorage.setItem('last_read_ayah_global', JSON.stringify(savedObj));
                const ALL_READING_MODES = ['mushaf', 'madinah', 'tafseer', 'meanings', 'translation', 'bilingual'];
                ALL_READING_MODES.forEach(m => {
                    localStorage.setItem(`last_read_pos_${m}`, JSON.stringify(savedObj));
                    localStorage.setItem(`last_pos_${m}_v`, JSON.stringify(savedObj));
                    localStorage.setItem(`last_pos_${m}_h`, JSON.stringify(savedObj));
                });
            }
        }

        if (!hasJumpedRef.current && (initialSurah || initialPage || localIsMemorizationMode || isWirdMode)) {
            // Do not jump to lastPos on initial mount if we have initial params
        } else if (!hasJumpedRef.current) {
            if (readingMode === 'madinah') {
                isJumpingRef.current = false;
            } else {
                // Prevent scroll listener from overwriting position during transition
                isJumpingRef.current = true;
                setTimeout(() => {
                    jumpToAyahRef.current(targetS, targetA, true, false);
                }, 100);
            }
        }

        const savedToolbarColors = localStorage.getItem('toolbar_colors_v2' + mode);
        if (savedToolbarColors) {
            try {
                const colors = JSON.parse(savedToolbarColors);
                // SANITIZER: Force solid colors for backgrounds
                Object.keys(colors).forEach(key => {
                    if (colors[key].bg && (colors[key].bg.includes('rgba') || colors[key].bg === 'transparent')) {
                        colors[key].bg = THEMES[themeId as keyof typeof THEMES]?.barBg || "#ffffff";
                    }
                    if (colors[key].border && (colors[key].border.includes('rgba') || colors[key].border === 'transparent')) {
                        colors[key].border = THEMES[themeId as keyof typeof THEMES]?.barBorder?.split(' ')[2] || "#e5e7eb";
                    }
                });
                setToolbarColors(colors);
            } catch (e) {}
        } else {
            const theme = THEMES['black'];
            setToolbarColors(getToolbarColorsForTheme(theme));
        }
    }, [themeSuffix, posSuffix, initialSurah, initialPage, localIsMemorizationMode, isWirdMode, isNightMode, homeThemeVariant, readingMode, language]);

    useEffect(() => {
        const handleThemeChange = () => {
            const modeSuffix = themeSuffix;
            const layout = getCurrentLayoutContext(navParams);
            const themeId = getQuranThemeForLayout(layout, modeSuffix, readingMode);
            const newTheme = THEMES[themeId as keyof typeof THEMES] || THEMES['gold'];

            setCurrentTheme(prev => {
                if (prev?.id === newTheme.id) return prev;
                return newTheme;
            });

            const effectiveScopeMode = isWirdMode ? 'wird' : localIsMemorizationMode ? 'memorization' : readingMode;
            const parsed = (isWirdMode || localIsMemorizationMode)
                ? (() => {
                    const savedSettings = localStorage.getItem('quran_settings' + modeSuffix);
                    return savedSettings ? JSON.parse(savedSettings) : null;
                })()
                : readingMode === 'madinah'
                    ? (getMadinahSettings(isLandscapeRef.current) || (() => {
                        const savedSettings = localStorage.getItem('quran_settings' + modeSuffix);
                        return savedSettings ? JSON.parse(savedSettings) : null;
                    })())
                    : (getClusterSettings(getClusterForLanguage(language), readingMode, isLandscapeRef.current) || (() => {
                        const savedSettings = localStorage.getItem('quran_settings' + modeSuffix);
                        return savedSettings ? JSON.parse(savedSettings) : null;
                    })());
            if (parsed || readingMode === 'madinah' || isDarkQuranTheme(newTheme)) {
                const newSettings = resolveReaderSettingsWithTheme(parsed, newTheme, effectiveScopeMode, isLandscapeRef.current);
                setSettings(prev => {
                    if (JSON.stringify(prev) === JSON.stringify(newSettings)) return prev;
                    return newSettings;
                });
            } else {
                setSettings(prev => {
                    if (JSON.stringify(prev) === JSON.stringify(DEFAULT_SETTINGS)) return prev;
                    return DEFAULT_SETTINGS;
                });
            }

            const savedToolbarColors = localStorage.getItem('toolbar_colors_v2' + modeSuffix);
            if (savedToolbarColors) {
                try {
                    const parsedColors = JSON.parse(savedToolbarColors);
                    setToolbarColors(prev => {
                        if (JSON.stringify(prev) === JSON.stringify(parsedColors)) return prev;
                        return parsedColors;
                    });
                } catch (e) {}
            } else {
                const theme = THEMES['black'];
                const defaultColors = getToolbarColorsForTheme(theme);
                setToolbarColors(prev => {
                    if (JSON.stringify(prev) === JSON.stringify(defaultColors)) return prev;
                    return defaultColors;
                });
            }

            setQuranData(quranJsonData);

            const transSetting = localStorage.getItem('transparent_mode' + modeSuffix) === 'true';
            if (isTransparentMode !== transSetting) setIsTransparentMode(transSetting);

            const savedBookmarks = localStorage.getItem('quran_bookmarks_list' + bookmarkSuffix);
            const parsedBookmarks = savedBookmarks ? JSON.parse(savedBookmarks) : [];
            setBookmarks(prev => {
                if (JSON.stringify(prev) === JSON.stringify(parsedBookmarks)) return prev;
                return parsedBookmarks;
            });

            const savedSajdah = localStorage.getItem('show_sajdah_card' + modeSuffix);
            const targetSajdah = savedSajdah !== null ? savedSajdah === 'true' : true;
            if (showSajdahCard !== targetSajdah) setShowSajdahCard(targetSajdah);

            if (modeSuffix.endsWith('_h')) {
                setIsLandscapeUIHidden(true);
            } else {
                if (!isHideToolbarsEnabledRef.current && isLandscapeUIHidden !== false) setIsLandscapeUIHidden(false);
            }
        };
        const handleSettingsChange = () => {
            const mode = themeSuffix;
            const effectiveScopeMode = isWirdMode ? 'wird' : localIsMemorizationMode ? 'memorization' : readingMode;
            const parsed = (isWirdMode || localIsMemorizationMode)
                ? (() => {
                    const saved = localStorage.getItem('quran_settings' + mode);
                    return saved ? JSON.parse(saved) : null;
                })()
                : readingMode === 'madinah'
                    ? (getMadinahSettings(isLandscapeRef.current) || (() => {
                        const saved = localStorage.getItem('quran_settings' + mode);
                        return saved ? JSON.parse(saved) : null;
                    })())
                    : (getClusterSettings(getClusterForLanguage(language), readingMode, isLandscapeRef.current) || (() => {
                        const saved = localStorage.getItem('quran_settings' + mode);
                        return saved ? JSON.parse(saved) : null;
                    })());
            const activeThemeId = getQuranThemeForLayout(getCurrentLayoutContext(navParams), mode, readingMode);
            const activeThemeObj = THEMES[activeThemeId as keyof typeof THEMES] || THEMES['gold'];
            if (parsed || readingMode === 'madinah' || isDarkQuranTheme(activeThemeObj)) {
                const newSettings = resolveReaderSettingsWithTheme(parsed, activeThemeObj, effectiveScopeMode, isLandscapeRef.current);
                setSettings(prev => {
                    if (JSON.stringify(prev) === JSON.stringify(newSettings)) return prev;
                    return newSettings;
                });
            }

            const savedToolbarColors = localStorage.getItem('toolbar_colors_v2' + mode);
            if (savedToolbarColors) {
                try {
                    const parsedColors = JSON.parse(savedToolbarColors);
                    setToolbarColors(prev => {
                        if (JSON.stringify(prev) === JSON.stringify(parsedColors)) return prev;
                        return parsedColors;
                    });
                } catch (e) {}
            }

            const transSetting = localStorage.getItem('transparent_mode' + mode) === 'true';
            setIsTransparentMode(transSetting);

            const hideToolbarsSetting = localStorage.getItem('hide_toolbars_enabled' + mode) === 'true';
            if (isHideToolbarsEnabledRef.current !== hideToolbarsSetting) {
                setIsHideToolbarsEnabled(hideToolbarsSetting);
                if (!isLandscapeRef.current) {
                    if (hideToolbarsSetting) {
                        setIsLandscapeUIHidden(true);
                    } else {
                        setIsLandscapeUIHidden(false);
                    }
                }
            }

            const savedBookmarks = localStorage.getItem('quran_bookmarks_list' + bookmarkSuffix);
            const parsedBookmarks = savedBookmarks ? JSON.parse(savedBookmarks) : [];
            setBookmarks(prev => {
                if (JSON.stringify(prev) === JSON.stringify(parsedBookmarks)) return prev;
                return parsedBookmarks;
            });

            const savedSajdah = localStorage.getItem('show_sajdah_card' + mode);
            const targetSajdah = savedSajdah !== null ? savedSajdah === 'true' : true;
            if (showSajdahCard !== targetSajdah) setShowSajdahCard(targetSajdah);
        };

        window.addEventListener('theme-change', handleThemeChange);
        window.addEventListener('themeChanged', handleThemeChange);
        window.addEventListener('settings-change', handleSettingsChange);
        return () => {
            window.removeEventListener('theme-change', handleThemeChange);
            window.removeEventListener('themeChanged', handleThemeChange);
            window.removeEventListener('settings-change', handleSettingsChange);
        };
    }, [themeSuffix, bookmarkSuffix, readingMode]);

    useLayoutEffect(() => {
        const root = document.documentElement;
        const t = currentTheme;

        // Set Theme CSS Variables
        root.style.setProperty('--qr-bg', settings.bgColor || t.bg || '#ffffff');
        root.style.setProperty('--qr-text', settings.textColor || t.text);
        root.style.setProperty('--qr-fontFamily', settings.fontFamily || t.font);
        root.style.setProperty('--qr-bar-bg', t.barBg);
        root.style.setProperty('--qr-bar-text', t.barText);
        root.style.setProperty('--qr-bar-border', t.barBorder);
        root.style.setProperty('--qr-btn-bg', t.btnBg);
        root.style.setProperty('--qr-btn-text', t.btnText);
        root.style.setProperty('--qr-accent', t.accent || (t as any).palette?.[0]);
        root.style.setProperty('--qr-accent-text', t.accentText || '#ffffff');
        root.style.setProperty('--qr-modal-bg', t.modalBg);
        root.style.setProperty('--qr-modal-text', t.modalText);
        root.style.setProperty('--qr-header-bg', t.headerBg);
        root.style.setProperty('--qr-header-text', t.headerText);
        root.style.setProperty('--qr-card-bg', t.cardBg);
        root.style.setProperty('--qr-card-text', t.cardText);
        root.style.setProperty('--qr-card-border', t.cardBorder);
        root.style.setProperty('--qr-sajdah', t.sajdah);
        const ayahHighlightText = settings.highlightTextColor || (t as any).highlightText || t.accent || (t as any).palette?.[0];
        root.style.setProperty('--qr-highlight-text', ayahHighlightText);

        const wordColors = getEffectiveWordHighlightColor(ayahHighlightText, settings.wordHighlightColor, t.id);
        root.style.setProperty('--qr-word-highlight-bg', wordColors.bg);
        root.style.setProperty('--qr-word-highlight-text', wordColors.text);
        root.style.setProperty('--qr-word-highlight-shadow', wordColors.shadow);

        root.style.setProperty('--color-sajdah', t.sajdah);
        root.style.setProperty('--search-result-bg', t.cardBg);
        root.style.setProperty('--search-result-border', t.accent || (t as any).palette?.[0]);
        root.style.setProperty('--search-result-text', t.cardText);

        const darkBgs = [
            '#000000', '#2c241b', '#101010', '#0f172a', '#2e1065', '#064e3b', '#1e293b', '#4c1d95',
            '#1e1b4b', '#451a03', '#022c22', '#450a0a', '#1e3a8a', '#422006', '#78350f', '#4c1d95',
            '#280a1e', '#041e3a', '#1c1917', '#0f172a', '#09090b', '#064e3b', '#134e4a', '#334155',
            '#0a0a0a', '#111111'
        ];
        // Ensure isDark is true if either background is in the list OR the text color is explicitly white
        const textColor = (settings.textColor || t.text || '').toLowerCase();
        const bgColor = (settings.bgColor || t.bg || '').toLowerCase();
        const isDark = darkBgs.includes(bgColor) || textColor === '#ffffff';

        if (isDark) document.documentElement.classList.add('dark');
        else if (!isNightMode) document.documentElement.classList.remove('dark');

        // Signal that quran context variables have been set to avoid other contexts overwriting them
        window.dispatchEvent(new CustomEvent('quran-vars-applied', { detail: { themeId: t.id } }));

        return () => {
            if (!isNightMode) {
                document.documentElement.classList.remove('dark');
            }
        };
    }, [currentTheme, themeKey, readingMode, settings.highlightTextColor, settings.wordHighlightColor, settings.textColor, settings.bgColor, settings.fontFamily, activeModals, isNightMode]);

    const initialPinchDistanceRef = useRef<number | null>(null);
    const initialPinchFontSizeRef = useRef<number | null>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        if (readingModeRef.current === 'madinah') return;
        if (e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const distance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
            initialPinchDistanceRef.current = distance;
            initialPinchFontSizeRef.current = settings.fontSize;
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (readingModeRef.current === 'madinah') return;
        if (e.touches.length === 2 && initialPinchDistanceRef.current !== null && initialPinchFontSizeRef.current !== null) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const distance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);

            const scaleFactor = distance / initialPinchDistanceRef.current;
            const rawFontSize = Math.min(Math.max(initialPinchFontSizeRef.current * scaleFactor, 0.5), 5.0);
            const newFontSize = parseFloat(rawFontSize.toFixed(2));

            setSettings(prev => ({ ...prev, fontSize: newFontSize }));
        }
    };

    const handleTouchEnd = () => {
        if (readingModeRef.current === 'madinah') {
            initialPinchDistanceRef.current = null;
            initialPinchFontSizeRef.current = null;
            return;
        }
        if (initialPinchDistanceRef.current !== null) {
            const roundedFontSize = parseFloat(Number(settingsRef.current.fontSize || 1).toFixed(2));
            const updated = { ...settingsRef.current, fontSize: roundedFontSize };
            setSettings(updated);
            localStorage.setItem('quran_settings' + themeSuffix, JSON.stringify(updated));
            if (!isWirdMode && !localIsMemorizationMode) {
                const cluster = getClusterForLanguage(language);
                syncClusterSettings(cluster, updated, isLandscapeRef.current, { readingMode: readingModeRef.current });
            } else {
                window.dispatchEvent(new Event('settings-change'));
            }
        }
        initialPinchDistanceRef.current = null;
        initialPinchFontSizeRef.current = null;
    };

    const getToolbarStyle = (type: string, defaultBg: string, defaultText: string, defaultBorder: string) => {
        const config = toolbarColors[type];
        let bg = config?.bg || defaultBg || "#ffffff";

        // Final safety check: if bg is rgba or transparent, use a solid fallback
        if (!bg || bg.includes('rgba') || bg === 'transparent') {
            bg = currentTheme.barBg || "#ffffff";
        }

        const isMainBar = type === 'top-toolbar' || type === 'bottom-toolbar';

        // Apply transparency if enabled (only for main bars); keep all reading toolbars & buttons completely flat
        let finalBg = bg;
        const backdrop = 'none';
        const finalShadow = 'none';

        if (isTransparentMode && isMainBar) {
            finalBg = 'transparent';
        }

        return {
            backgroundColor: finalBg,
            color: config?.text || defaultText,
            borderTop: 'none',
            borderBottom: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            outline: 'none',
            fontFamily: config?.font || 'inherit',
            opacity: 1,
            backdropFilter: backdrop,
            WebkitBackdropFilter: backdrop,
            boxShadow: finalShadow
        };
    };

    const madinahMenuVars = useMemo(() => {
        const isDark = isDarkQuranTheme(currentTheme);
        const isDeepBlack = currentTheme?.id === 'deep_black';
        const rawAccent = currentTheme?.accent || '#10b981';
        const flatAccent = isDeepBlack
            ? (rawAccent.toLowerCase() !== '#27272a' && rawAccent.toLowerCase() !== '#000000' ? rawAccent : '#e4e4e7')
            : (currentTheme?.id === 'gold' ? '#b45309' : (rawAccent || '#10b981'));
        const flatBorderSubtle = isDark
            ? 'rgba(255, 255, 255, 0.16)'
            : (currentTheme?.id === 'black' ? 'rgba(15, 23, 42, 0.16)' : `${flatAccent}44`);
        const flatBorderStrong = isDark
            ? 'rgba(255, 255, 255, 0.28)'
            : (currentTheme?.id === 'black' ? 'rgba(15, 23, 42, 0.26)' : `${flatAccent}88`);
        const flatBarBorder = isDark
            ? 'rgba(255, 255, 255, 0.20)'
            : (currentTheme?.id === 'black' ? 'rgba(15, 23, 42, 0.16)' : `${flatAccent}55`);

        const baseFlatVars: Record<string, string> = {
            '--qr-flat-accent': flatAccent,
            '--qr-flat-border-subtle': flatBorderSubtle,
            '--qr-flat-border-strong': flatBorderStrong,
            '--qr-flat-bar-border': flatBarBorder,
            '--qr-flat-surface': isDark ? (currentTheme?.cardBg || '#141418') : '#ffffff',
            '--qr-flat-icon-text': isDeepBlack && flatAccent === '#e4e4e7' ? '#09090b' : (currentTheme?.accentText || '#ffffff'),
        };

        if (readingMode !== 'madinah' && readingMode !== 'mushaf') {
            return baseFlatVars as React.CSSProperties;
        }

        const palette = getMadinahThemePalette(currentTheme);
        return {
            ...baseFlatVars,
            '--madinah-menu-bg': palette.frameBg,
            '--madinah-menu-surface': palette.cartoucheFill,
            '--madinah-menu-header-bg': isDark ? 'rgba(255, 255, 255, 0.06)' : palette.frameBg,
            '--madinah-menu-text': isDark ? '#f8fafc' : palette.bannerText,
            '--madinah-menu-border': palette.primary,
            '--madinah-menu-border-strong': `${palette.primary}99`,
            '--madinah-menu-border-subtle': `${palette.primary}44`,
            '--madinah-menu-accent': palette.primary,
            '--madinah-menu-icon-text': '#ffffff',
            '--madinah-menu-gold': palette.gold,
        } as React.CSSProperties;
    }, [readingMode, currentTheme]);

    return {
        settings,
        setSettings,
        settingsRef,
        currentTheme,
        setCurrentTheme,
        toolbarColors,
        setToolbarColors,
        updateSetting,
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
        getToolbarStyle,
        madinahMenuVars,
    };
};
