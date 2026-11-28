import React from 'react';
import { THEMES, isDarkQuranTheme } from '../QuranReader/constants';
import { getQuranThemeIdForLayout, getQuranSettingsForLayout } from '../../utils/quran/quranThemeHelper';
import { getMadinahThemePalette } from '../QuranReader/MadinahFrameSVG';

export const isHexColorDark = (color?: string): boolean => {
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
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.45;
};

// Helper to get reader theme
export const getReaderTheme = (isLandscape = false, readingMode = 'mushaf') => {
    try {
        const suffix = isLandscape ? '_h' : '_v';
        const mode = readingMode || 'mushaf';
        const themeId = getQuranThemeIdForLayout(suffix, undefined, mode);
        const quranSettings = getQuranSettingsForLayout(suffix, undefined, mode) || {};
        const originalTheme = THEMES[themeId as keyof typeof THEMES] || THEMES.black;

        const isDeepBlack = themeId === 'deep_black';
        const bgColor = isDeepBlack ? '#000000' : (quranSettings.bgColor || originalTheme.bg);
        const textColor = isDeepBlack ? '#FFFFFF' : (quranSettings.textColor || originalTheme.text);
        const accent = isDeepBlack ? '#FFFFFF' : (quranSettings.highlightTextColor || originalTheme.accent);
        const isDark =
            textColor.toLowerCase() === '#ffffff' ||
            isDeepBlack ||
            themeId.startsWith('i_') ||
            isHexColorDark(bgColor) ||
            ['#000000', '#0a0a0a', '#18181b', '#09090b', '#022c22', '#450a0a', '#1e3a8a', '#422006', '#78350f', '#4c1d95', '#280a1e', '#041e3a', '#1e1b4b', '#0f172a', '#064e3b', '#134e4a', '#334155'].includes(bgColor.toLowerCase());

        return {
            ...originalTheme,
            rawBgColor: quranSettings.bgColor || '',
            originalBg: originalTheme.bg || '#ffffff',
            bgColor,
            textColor,
            text: textColor,
            bg: bgColor,
            accent,
            accentText: isDeepBlack ? '#000000' : (originalTheme.accentText || '#ffffff'),
            btnBg: isDeepBlack ? '#18181b' : originalTheme.btnBg,
            btnText: isDeepBlack ? '#FFFFFF' : originalTheme.btnText,
            palette: [accent, originalTheme.barText, originalTheme.btnBg],
            font: quranSettings.fontFamily || originalTheme.font,
            isDark
        };
    } catch (e) {
        const defaultTheme = THEMES.black;
        return {
            ...defaultTheme,
            rawBgColor: '',
            originalBg: '#ffffff',
            bgColor: '#ffffff',
            textColor: '#000000',
            text: '#000000',
            bg: '#ffffff',
            barBg: '#ffffff',
            barText: '#3b82f6',
            barBorder: '#3b82f6',
            accent: '#3b82f6',
            palette: ['#3b82f6', '#3b82f6', '#ffffff'],
            font: 'var(--font-amiri)',
            isDark: false
        };
    }
};

export interface GlobalSearchThemeStyles {
    isQuranFlatSearch: boolean;
    theme: any;
    madinahVars: React.CSSProperties;
    flatAccent: string;
    flatBorderSubtle: string;
    flatBorderStrong: string;
    accentBadgeText: string;
    quranTopBarBg: string;
    quranTopBarText: string;
    card3DClass: string;
    btn3DClass: string;
    inner3DClass: string;
    icon3DClass: string;
    badge3DStyle: React.CSSProperties;
    itemCardStyle: (darkAlpha?: string) => React.CSSProperties;
    headerCardStyle: (darkAlpha?: string) => React.CSSProperties;
    sectionIconStyle: React.CSSProperties;
}

export const buildGlobalSearchThemeStyles = ({
    appTheme,
    s3d,
    readerTheme,
    isFromQuran,
    ornamentPalette,
}: {
    appTheme: any;
    s3d: any;
    readerTheme: any;
    isFromQuran: boolean;
    ornamentPalette: ReturnType<typeof getMadinahThemePalette> | null;
}): GlobalSearchThemeStyles => {
    const isAppBlackTheme = s3d.isBlackTheme;
    const appIsDark = s3d.isDark;
    const appAccent = s3d.primaryColor;
    const appBgColor = s3d.pageBgColor;
    const appTextColor = s3d.textColor;

    const appSearchTheme = {
        ...appTheme,
        bgColor: appBgColor,
        bg: appBgColor,
        textColor: appTextColor,
        text: appTextColor,
        accent: appAccent,
        accentText: s3d.btnTextColor,
        palette: [appAccent, ...(appTheme.palette || [appAccent])],
        btnBg: appIsDark ? (isAppBlackTheme ? '#18181b' : '#1E293B') : '#ffffff',
        btnText: appTextColor,
        isDark: appIsDark,
    };

    const isQuranFlatSearch = isFromQuran;

    const rawReaderBg = (readerTheme.rawBgColor || '').trim();
    const normRawReaderBg = rawReaderBg.toLowerCase();
    const normOrigBg = (readerTheme.originalBg || '#ffffff').trim().toLowerCase();
    const hasCustomReaderBg =
        Boolean(normRawReaderBg) &&
        normRawReaderBg !== 'transparent' &&
        normRawReaderBg !== 'rgba(0, 0, 0, 0)' &&
        normRawReaderBg !== normOrigBg;

    const quranResolvedBg = ornamentPalette
        ? (hasCustomReaderBg ? rawReaderBg : ornamentPalette.frameBg)
        : appSearchTheme.bgColor;
    const quranThemeIsDark = isDarkQuranTheme(readerTheme);
    const quranResolvedIsDark = Boolean(readerTheme.isDark) || quranThemeIsDark || isHexColorDark(quranResolvedBg);
    const quranTopBarBg = ornamentPalette ? ornamentPalette.frameBg : appSearchTheme.bgColor;
    const quranTopBarText = ornamentPalette
        ? (quranThemeIsDark ? '#f8fafc' : ornamentPalette.bannerText)
        : appSearchTheme.textColor;
    const quranBodyText = ornamentPalette
        ? (quranResolvedIsDark ? '#f8fafc' : ornamentPalette.bannerText)
        : appSearchTheme.textColor;

    const theme = isFromQuran && ornamentPalette
        ? {
              ...readerTheme,
              bgColor: quranResolvedBg,
              bg: quranResolvedBg,
              textColor: quranBodyText,
              text: quranBodyText,
              accent: quranThemeIsDark && readerTheme.id === 'deep_black' ? '#e4e4e7' : ornamentPalette.primary,
              btnBg: quranResolvedIsDark ? '#141418' : (ornamentPalette.cartoucheFill || '#ffffff'),
              isDark: quranResolvedIsDark,
              palette: [
                  ornamentPalette.primary,
                  ...(readerTheme.palette?.slice(1) || [ornamentPalette.secondary, ornamentPalette.cartoucheFill]),
              ],
          }
        : (isFromQuran ? readerTheme : appSearchTheme);

    const flatAccent = ornamentPalette
        ? (quranThemeIsDark && readerTheme.id === 'deep_black' ? '#e4e4e7' : ornamentPalette.primary)
        : (theme.isDark && (theme.accent === '#27272a' || theme.accent === '#000000')
            ? '#e4e4e7'
            : (theme.id === 'gold' ? '#b45309' : (theme.accent || theme.palette[0] || '#10b981')));
    const flatBorderSubtle = theme.isDark
        ? 'rgba(255, 255, 255, 0.16)'
        : `${flatAccent}44`;
    const flatBorderStrong = theme.isDark
        ? 'rgba(255, 255, 255, 0.28)'
        : `${flatAccent}99`;
    const madinahVars: React.CSSProperties = isQuranFlatSearch
        ? ({
              '--madinah-menu-bg': quranTopBarBg,
              '--madinah-menu-surface': theme.btnBg || (theme.isDark ? '#0a0a0c' : '#ffffff'),
              '--madinah-menu-header-bg': quranTopBarBg,
              '--madinah-menu-text': quranTopBarText,
              '--madinah-menu-border': flatAccent,
              '--madinah-menu-border-strong': flatBorderStrong,
              '--madinah-menu-border-subtle': flatBorderSubtle,
              '--madinah-menu-accent': flatAccent,
              '--madinah-menu-icon-text': flatAccent.toUpperCase() === '#FFFFFF' || flatAccent.toUpperCase() === '#E4E4E7' ? '#09090b' : '#ffffff',
          } as React.CSSProperties)
        : {};

    const accentBadgeText = (flatAccent.toUpperCase() === '#FFFFFF' || flatAccent.toUpperCase() === '#E4E4E7') ? '#09090b' : '#ffffff';

    const card3DClass = isQuranFlatSearch
        ? 'madinah-flat-card'
        : `app-page-card ${s3d.surfaceCardClass}`;
    const btn3DClass = isQuranFlatSearch
        ? 'madinah-flat-btn'
        : `app-page-card ${s3d.surfaceCardClass}`;
    const inner3DClass = isQuranFlatSearch
        ? 'madinah-flat-badge'
        : 'app-3d-badge';
    const icon3DClass = isQuranFlatSearch ? '' : 'quran-3d-icon';

    const badge3DStyle: React.CSSProperties = isQuranFlatSearch
        ? { backgroundColor: flatAccent, color: accentBadgeText, border: `1px solid ${flatAccent}` }
        : { backgroundColor: s3d.primaryColor, color: s3d.btnTextColor, border: 'none' };
    const itemCardStyle = (darkAlpha = 'rgba(255,255,255,0.05)'): React.CSSProperties =>
        isQuranFlatSearch
            ? { backgroundColor: theme.isDark ? darkAlpha : (theme.btnBg || '#ffffff'), color: theme.textColor, border: `1.5px solid ${flatBorderSubtle}` }
            : { color: s3d.textColor };
    const headerCardStyle = (darkAlpha = 'rgba(255,255,255,0.06)'): React.CSSProperties =>
        isQuranFlatSearch
            ? { backgroundColor: theme.isDark ? darkAlpha : (theme.btnBg || '#ffffff'), color: theme.textColor, border: `1.5px solid ${flatBorderSubtle}` }
            : { color: s3d.textColor };
    const sectionIconStyle: React.CSSProperties = isQuranFlatSearch
        ? { backgroundColor: `${flatAccent}14`, color: flatAccent, border: `1px solid ${flatBorderSubtle}` }
        : { backgroundColor: s3d.softResultBg, color: s3d.noticeAccent, border: 'none' };

    return {
        isQuranFlatSearch,
        theme,
        madinahVars,
        flatAccent,
        flatBorderSubtle,
        flatBorderStrong,
        accentBadgeText,
        quranTopBarBg,
        quranTopBarText,
        card3DClass,
        btn3DClass,
        inner3DClass,
        icon3DClass,
        badge3DStyle,
        itemCardStyle,
        headerCardStyle,
        sectionIconStyle,
    };
};
