import { ReadingMode, THEMES, DEFAULT_SETTINGS, getToolbarColorsForTheme, isNightModeForLayout, isDarkQuranTheme } from '../../components/QuranReader/constants';

export type ReadingCluster = 'unified' | 'ar' | 'en';

export const ALL_READING_MODES: ReadingMode[] = ['mushaf', 'madinah', 'tafseer', 'meanings', 'translation', 'bilingual'];
export const SETTINGS_CLUSTER_MODES: ReadingMode[] = ['mushaf', 'tafseer', 'meanings', 'translation', 'bilingual'];
export const ARABIC_CLUSTER_MODES: ReadingMode[] = ALL_READING_MODES;
export const ENGLISH_CLUSTER_MODES: ReadingMode[] = ALL_READING_MODES;

export const getClusterModes = (_cluster?: ReadingCluster): ReadingMode[] => {
    return ALL_READING_MODES;
};

export const getClusterForLanguage = (_language?: string): ReadingCluster => {
    return 'unified';
};

export const isModeInCluster = (_cluster: ReadingCluster | string, mode: ReadingMode | string): boolean => {
    return ALL_READING_MODES.includes(mode as ReadingMode);
};

const isHexLightColor = (color?: string): boolean => {
    if (!color || typeof color !== 'string') return false;
    const c = color.trim().toLowerCase();
    if (c === 'transparent' || c === 'rgba(0, 0, 0, 0)') return false;
    const hex = c.startsWith('#') ? c.slice(1) : '';
    if (!hex) return false;
    let r = 0, g = 0, b = 0;
    if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
    } else {
        return false;
    }
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return false;
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 >= 0.45;
};

const readRawMadinahBaseSettings = (isLandscape: boolean = false): any => {
    const orient = isLandscape ? 'h' : 'v';
    const keysToCheck = [
        `quran_settings_modern_madinah_${orient}`,
        `quran_settings_madinah_${orient}`,
        `quran_layout_modern_madinah_settings_${orient}`,
    ];
    for (const key of keysToCheck) {
        const saved = localStorage.getItem(key);
        if (saved) {
            return JSON.parse(saved);
        }
    }
    if (!isLandscape) {
        const legacy = localStorage.getItem('quran_settings_madinah');
        if (legacy) {
            return JSON.parse(legacy);
        }
    }
    return null;
};

export const getMadinahSettings = (isLandscape: boolean = false): any => {
    try {
        const orient = isLandscape ? 'h' : 'v';
        const baseParsed = readRawMadinahBaseSettings(isLandscape);
        const isNight = isNightModeForLayout('modern');

        if (!isNight) {
            return baseParsed;
        }

        const scopedNightRaw = localStorage.getItem(`quran_settings_madinah_night_${orient}`);
        const nightRaw = scopedNightRaw || (!isLandscape ? localStorage.getItem('quran_settings_madinah_night') : null);
        const nightParsed = nightRaw ? JSON.parse(nightRaw) : null;
        const scopedCustomFlag = localStorage.getItem(`quran_settings_madinah_night_colors_custom_${orient}`);
        const hasCustomNightColors = scopedCustomFlag !== null
            ? scopedCustomFlag === 'true'
            : (!isLandscape && localStorage.getItem('quran_settings_madinah_night_colors_custom') === 'true');
        const nightThemeId =
            localStorage.getItem(`current_theme_id_modern_madinah_night_${orient}`) ||
            localStorage.getItem(`current_theme_id_madinah_night_${orient}`) ||
            (!isLandscape
                ? (localStorage.getItem('current_theme_id_modern_madinah_night') || localStorage.getItem('current_theme_id_madinah_night'))
                : null) ||
            'deep_black';
        const nightTheme = (THEMES as any)[nightThemeId] || THEMES.deep_black;
        const mergedBase = baseParsed ? { ...baseParsed } : {};

        if (
            hasCustomNightColors &&
            nightParsed &&
            !isHexLightColor(nightParsed.bgColor) &&
            isHexLightColor(nightParsed.textColor)
        ) {
            return {
                ...mergedBase,
                bgColor: nightParsed.bgColor || nightTheme.bg || '#000000',
                textColor: nightParsed.textColor || nightTheme.text || '#ffffff',
                highlightTextColor: mergedBase.lockHighlightColor
                    ? (nightParsed.highlightTextColor || mergedBase.highlightTextColor)
                    : (nightParsed.highlightTextColor || nightTheme.highlightText || nightTheme.accent),
                theme: nightParsed.theme || nightTheme.id || 'deep_black',
            };
        }

        return {
            ...mergedBase,
            bgColor: nightTheme.bg || '#000000',
            textColor: nightTheme.text || '#ffffff',
            highlightTextColor: mergedBase.lockHighlightColor
                ? (mergedBase.highlightTextColor || nightTheme.highlightText || nightTheme.accent)
                : (nightTheme.highlightText || nightTheme.accent),
            theme: nightTheme.id || 'deep_black',
        };
    } catch (e) {
        console.warn('Failed to get Madinah settings', e);
    }
    return null;
};

export const saveMadinahSettings = (
    newSettings: any,
    options?: { markCustomColors?: boolean; isLandscape?: boolean }
) => {
    try {
        if (!newSettings || typeof newSettings !== 'object') return;
        const isLandscape = Boolean(options?.isLandscape);
        const orient = isLandscape ? 'h' : 'v';
        const isNight = isNightModeForLayout('modern');
        const existingDay = readRawMadinahBaseSettings(isLandscape) || {};

        let serialized: string;
        if (isNight) {
            const nightPayload = {
                bgColor: newSettings.bgColor || '#000000',
                textColor: newSettings.textColor || '#ffffff',
                highlightTextColor: newSettings.highlightTextColor || THEMES.deep_black.highlightText,
                theme: newSettings.theme || 'deep_black',
            };
            localStorage.setItem(`quran_settings_madinah_night_${orient}`, JSON.stringify(nightPayload));
            if (options?.markCustomColors) {
                localStorage.setItem(`quran_settings_madinah_night_colors_custom_${orient}`, 'true');
            }

            const existingDayTheme =
                existingDay.theme && !isDarkQuranTheme(existingDay.theme)
                    ? existingDay.theme
                    : 'gold';
            const dayFallbackTheme = (THEMES as any)[existingDayTheme] || THEMES.gold;
            const mergedDaySettings = {
                ...DEFAULT_SETTINGS,
                ...existingDay,
                ...newSettings,
                bgColor:
                    existingDay.bgColor && isHexLightColor(existingDay.bgColor)
                        ? existingDay.bgColor
                        : dayFallbackTheme.bg,
                textColor:
                    existingDay.textColor && !isHexLightColor(existingDay.textColor)
                        ? existingDay.textColor
                        : dayFallbackTheme.text,
                highlightTextColor:
                    existingDay.highlightTextColor || dayFallbackTheme.highlightText || dayFallbackTheme.accent,
                theme: existingDayTheme,
            };
            serialized = JSON.stringify(mergedDaySettings);
        } else {
            const mergedSettings = { ...DEFAULT_SETTINGS, ...existingDay, ...newSettings };
            serialized = JSON.stringify(mergedSettings);
            if (options?.markCustomColors) {
                localStorage.setItem(`quran_settings_madinah_colors_custom_${orient}`, 'true');
            }
        }

        localStorage.setItem(`quran_settings_madinah_${orient}`, serialized);
        localStorage.setItem(`quran_settings_modern_madinah_${orient}`, serialized);
        localStorage.setItem(`quran_layout_modern_madinah_settings_${orient}`, serialized);

        window.dispatchEvent(new Event('settings-change'));
    } catch (e) {
        console.warn('Failed to save Madinah settings', e);
    }
};

export interface AyahPosition {
    s: number;
    a: number;
    page?: number;
    juz?: number;
    isExplicit?: boolean;
    ts?: number;
}

/**
 * Save reading position universally across ALL reading modes:
 * Mushaf, Madinah, Tafseer, Meanings, Translation, Recitation & Translation (Bilingual)
 * Whenever any page updates the position or stops on an ayah, every page stays 100% in sync.
 */
export const saveClusterPosition = (
    _cluster: ReadingCluster | string,
    pos: AyahPosition,
    isLandscape: boolean = false
) => {
    try {
        if (!pos || typeof pos.s !== 'number' || pos.s < 1 || pos.s > 114) return;
        const s = pos.s;
        const a = pos.a || 1;
        const timestamp = Date.now();
        const savedObj: AyahPosition = { ...pos, s, a, isExplicit: true, ts: timestamp };
        const serialized = JSON.stringify(savedObj);
        const orient = isLandscape ? 'h' : 'v';

        // Master universal keys
        localStorage.setItem('quran_last_pos_unified', serialized);
        localStorage.setItem('quran_last_pos_ar_cluster', serialized);
        localStorage.setItem('quran_last_pos_en_cluster', serialized);
        localStorage.setItem('last_read_ayah_global', serialized);
        localStorage.setItem(`last_pos_${orient}`, serialized);
        localStorage.setItem('last_pos_v', serialized);
        localStorage.setItem('last_pos_h', serialized);

        // Sync across all reading pages and both orientations
        ALL_READING_MODES.forEach(m => {
            localStorage.setItem(`last_read_pos_${m}`, serialized);
            localStorage.setItem(`last_pos_${m}_v`, serialized);
            localStorage.setItem(`last_pos_${m}_h`, serialized);
        });

        // Specific legacy & isolated keys
        localStorage.setItem('last_read_pos_bilingual_ar', serialized);
        localStorage.setItem('last_pos_bilingual_ar_v', serialized);
        localStorage.setItem('last_pos_bilingual_ar_h', serialized);
        localStorage.setItem('last_read_pos_bilingual_en', serialized);
        localStorage.setItem('last_pos_bilingual_en_v', serialized);
        localStorage.setItem('last_pos_bilingual_en_h', serialized);

        window.dispatchEvent(new Event('last_read_update'));
    } catch (e) {
        console.warn('Failed to save cluster position', e);
    }
};

/**
 * Retrieve saved reading position universally.
 */
export const getClusterPosition = (
    _cluster?: ReadingCluster | string,
    targetMode?: ReadingMode,
    isLandscape: boolean = false
): AyahPosition | null => {
    try {
        const orient = isLandscape ? 'h' : 'v';
        const keysToCheck = [
            'quran_last_pos_unified',
            'last_read_ayah_global',
            targetMode ? `last_read_pos_${targetMode}` : null,
            targetMode ? `last_pos_${targetMode}_${orient}` : null,
            'last_read_pos_mushaf',
            'last_pos_mushaf_v',
            'last_read_pos_tafseer',
            'last_read_pos_meanings',
            'last_read_pos_translation',
            'last_read_pos_bilingual',
            'quran_last_pos_ar_cluster',
            'quran_last_pos_en_cluster',
            `last_pos_${orient}`,
            'last_pos_v',
            'last_pos_h'
        ].filter(Boolean) as string[];

        for (const key of keysToCheck) {
            const item = localStorage.getItem(key);
            if (item) {
                const parsed = JSON.parse(item);
                if (parsed && typeof parsed.s === 'number' && parsed.s >= 1 && parsed.s <= 114) {
                    return parsed;
                }
            }
        }
    } catch (e) {
        console.warn('Failed to get cluster position', e);
    }
    return null;
};

/**
 * Save reading settings strictly scoped to the specified readingMode and orientation
 * so modifying settings on one reading page never affects any other page.
 */
export const syncClusterSettings = (
    _cluster: ReadingCluster | string,
    newSettings: any,
    isLandscape: boolean = false,
    options?: { markCustomColors?: boolean; readingMode?: ReadingMode | string }
) => {
    try {
        if (!newSettings || typeof newSettings !== 'object') return;

        const mode = (options?.readingMode || 'mushaf') as ReadingMode;
        if (mode === 'madinah') {
            saveMadinahSettings(newSettings, {
                markCustomColors: options?.markCustomColors,
                isLandscape,
            });
            return;
        }

        const orient = isLandscape ? 'h' : 'v';
        const modeSuffix = mode === 'mushaf' ? `_${orient}` : `_${mode}_${orient}`;
        const existingRaw =
            localStorage.getItem(`quran_settings_modern_${mode}_${orient}`) ||
            localStorage.getItem(`quran_settings_${mode}_${orient}`) ||
            localStorage.getItem(`quran_settings${modeSuffix}`) ||
            localStorage.getItem(`quran_layout_modern_${mode}_settings_${orient}`);
        const currentScoped = existingRaw ? JSON.parse(existingRaw) : {};
        const isNight = isNightModeForLayout('modern');

        let mergedSettings: any;
        if (isNight) {
            const nightPayload = {
                bgColor: newSettings.bgColor || '#000000',
                textColor: newSettings.textColor || '#ffffff',
                highlightTextColor: newSettings.highlightTextColor || THEMES.deep_black.highlightText,
                theme: newSettings.theme || 'deep_black',
            };
            localStorage.setItem(`quran_settings_${mode}_night_${orient}`, JSON.stringify(nightPayload));
            if (options?.markCustomColors) {
                localStorage.setItem(`quran_settings_${mode}_night_colors_custom_${orient}`, 'true');
            }

            const existingDayTheme =
                currentScoped.theme && !isDarkQuranTheme(currentScoped.theme)
                    ? currentScoped.theme
                    : 'gold';
            const dayFallbackTheme = (THEMES as any)[existingDayTheme] || THEMES.gold;
            mergedSettings = {
                ...DEFAULT_SETTINGS,
                ...currentScoped,
                ...newSettings,
                bgColor:
                    currentScoped.bgColor && isHexLightColor(currentScoped.bgColor)
                        ? currentScoped.bgColor
                        : dayFallbackTheme.bg,
                textColor:
                    currentScoped.textColor && !isHexLightColor(currentScoped.textColor)
                        ? currentScoped.textColor
                        : dayFallbackTheme.text,
                highlightTextColor:
                    currentScoped.highlightTextColor || dayFallbackTheme.highlightText || dayFallbackTheme.accent,
                theme: existingDayTheme,
            };
        } else {
            mergedSettings = { ...DEFAULT_SETTINGS, ...currentScoped, ...newSettings };
            if (options?.markCustomColors) {
                localStorage.setItem(`quran_settings_${mode}_colors_custom_${orient}`, 'true');
            }
        }
        const serialized = JSON.stringify(mergedSettings);

        localStorage.setItem(`quran_settings${modeSuffix}`, serialized);
        localStorage.setItem(`quran_settings_${mode}_${orient}`, serialized);
        localStorage.setItem(`quran_settings_modern_${mode}_${orient}`, serialized);
        localStorage.setItem(`quran_layout_modern_${mode}_settings_${orient}`, serialized);

        window.dispatchEvent(new Event('settings-change'));
    } catch (e) {
        console.warn('Failed to sync cluster settings', e);
    }
};

/**
 * Save theme selection strictly scoped to the specified readingMode and orientation.
 */
export const syncClusterTheme = (
    _cluster: ReadingCluster | string,
    themeId: string,
    currentLayout: 'modern' = 'modern',
    isLandscape: boolean = false,
    readingMode: ReadingMode = 'mushaf'
) => {
    try {
        const theme = THEMES[themeId as keyof typeof THEMES];
        if (!theme) return;

        const orient = isLandscape ? 'h' : 'v';
        const o = `_${orient}`;
        const modeSuffix = readingMode === 'mushaf' ? o : `_${readingMode}${o}`;
        const colors = getToolbarColorsForTheme(theme);
        const colorsJson = JSON.stringify(colors);

        localStorage.setItem(`current_theme_id_${currentLayout}_${readingMode}${o}`, themeId);
        localStorage.setItem(`current_theme_id_${readingMode}${o}`, themeId);
        localStorage.setItem(`quran_layout_${currentLayout}_${readingMode}_theme${o}`, themeId);
        localStorage.setItem(`quran_user_chosen_theme_${currentLayout}_${readingMode}${o}`, themeId);
        localStorage.setItem(`toolbar_colors_v2${modeSuffix}`, colorsJson);
        localStorage.setItem(`quran_layout_${currentLayout}_${readingMode}_toolbar_colors${o}`, colorsJson);

        const existingStr =
            localStorage.getItem(`quran_settings_modern_${readingMode}_${orient}`) ||
            localStorage.getItem(`quran_settings_${readingMode}_${orient}`) ||
            localStorage.getItem(`quran_settings${modeSuffix}`);
        const existing = existingStr ? JSON.parse(existingStr) : {};
        const updated = {
            ...DEFAULT_SETTINGS,
            ...existing,
            bgColor: theme.bg,
            textColor: theme.text,
            fontFamily: theme.font || existing.fontFamily,
            highlightTextColor: existing.lockHighlightColor ? existing.highlightTextColor : (theme.highlightText || theme.accent),
            theme: theme.id
        };
        syncClusterSettings('unified', updated, isLandscape, { readingMode });

        window.dispatchEvent(new Event('theme-change'));
    } catch (e) {
        console.warn('Failed to sync cluster theme', e);
    }
};

/**
 * Retrieve reading settings strictly scoped to (currentMode, isLandscape).
 */
export const getClusterSettings = (
    _cluster?: ReadingCluster | string,
    currentMode?: ReadingMode,
    isLandscape: boolean = false
): any => {
    try {
        const mode = currentMode || 'mushaf';
        if (mode === 'madinah') {
            return getMadinahSettings(isLandscape);
        }

        const orient = isLandscape ? 'h' : 'v';
        const modeSuffix = mode === 'mushaf' ? `_${orient}` : `_${mode}_${orient}`;
        const keysToCheck = [
            `quran_settings_modern_${mode}_${orient}`,
            `quran_settings_${mode}_${orient}`,
            `quran_settings${modeSuffix}`,
            `quran_layout_modern_${mode}_settings_${orient}`,
        ];

        let baseParsed: any = null;
        for (const key of keysToCheck) {
            const item = localStorage.getItem(key);
            if (item) {
                baseParsed = JSON.parse(item);
                break;
            }
        }

        if (!isNightModeForLayout('modern')) {
            return baseParsed;
        }

        const nightRaw = localStorage.getItem(`quran_settings_${mode}_night_${orient}`);
        const nightParsed = nightRaw ? JSON.parse(nightRaw) : null;
        const hasCustomNightColors = localStorage.getItem(`quran_settings_${mode}_night_colors_custom_${orient}`) === 'true';
        const nightThemeId =
            localStorage.getItem(`current_theme_id_modern_${mode}_night_${orient}`) ||
            localStorage.getItem(`current_theme_id_${mode}_night_${orient}`) ||
            'deep_black';
        const nightTheme = (THEMES as any)[nightThemeId] || THEMES.deep_black;
        const mergedBase = baseParsed ? { ...baseParsed } : {};

        if (
            hasCustomNightColors &&
            nightParsed &&
            !isHexLightColor(nightParsed.bgColor) &&
            isHexLightColor(nightParsed.textColor)
        ) {
            return {
                ...mergedBase,
                bgColor: nightParsed.bgColor || nightTheme.bg || '#000000',
                textColor: nightParsed.textColor || nightTheme.text || '#ffffff',
                highlightTextColor: mergedBase.lockHighlightColor
                    ? (nightParsed.highlightTextColor || mergedBase.highlightTextColor)
                    : (nightParsed.highlightTextColor || nightTheme.highlightText || nightTheme.accent),
                theme: nightParsed.theme || nightTheme.id || 'deep_black',
            };
        }

        return {
            ...mergedBase,
            bgColor: nightTheme.bg || '#000000',
            textColor: nightTheme.text || '#ffffff',
            highlightTextColor: mergedBase.lockHighlightColor
                ? (mergedBase.highlightTextColor || nightTheme.highlightText || nightTheme.accent)
                : (nightTheme.highlightText || nightTheme.accent),
            theme: nightTheme.id || 'deep_black',
        };
    } catch (e) {
        console.warn('Failed to get cluster settings', e);
    }
    return null;
};
