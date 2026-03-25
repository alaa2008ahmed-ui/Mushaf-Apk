import { THEMES, DEFAULT_SETTINGS } from './constants';

export const applyQuranTheme = (themeId: string, modeSuffix: string) => {
    const theme = THEMES[themeId as keyof typeof THEMES];
    if (!theme) return;

    localStorage.setItem('current_theme_id' + modeSuffix, themeId);
    
    // Generate Theme Colors
    let themeColors = {};
    if (themeId === 'default') {
         const green = "#10b981"; const greenBorder = "#059669";
         const purple = "#7e22ce"; const purpleBorder = "#6b21a8";
         const purpleText = "#6d28d9";
         const white = "#ffffff"; const grayBorder = "#e5e7eb";
         
         themeColors = {
            'top-toolbar': { bg: white, border: grayBorder },
            'bottom-toolbar': { bg: white, border: grayBorder },
            'surah': { bg: white, text: purpleText, border: purpleText, font: theme.font },
            'juz': { bg: white, text: green, border: green, font: theme.font },
            'page': { bg: white, text: purpleText, border: purpleText, font: theme.font },
            'audio': { bg: white, text: green, border: green },
            'btn-settings': { bg: purple, text: white, border: purpleBorder },
            'btn-home': { bg: green, text: white, border: greenBorder },
            'btn-bookmark': { bg: green, text: white, border: greenBorder },
            'btn-bookmarks-list': { bg: green, text: white, border: greenBorder },
            'btn-themes': { bg: green, text: white, border: greenBorder },
            'btn-autoscroll': { bg: purple, text: white, border: purpleBorder },
            'btn-menu': { bg: purple, text: white, border: purpleBorder },
            'btn-search': { bg: purple, text: white, border: purpleBorder }
         };
    } else {
         themeColors = { 
             'top-toolbar': { bg: theme.barBg, border: theme.barBorder }, 
             'bottom-toolbar': { bg: theme.barBg, border: theme.barBorder }, 
             'surah': { bg: theme.barBg, text: theme.barText, border: theme.barBorder, font: theme.font }, 
             'juz': { bg: theme.barBg, text: theme.barText, border: theme.barBorder, font: theme.font }, 
             'page': { bg: theme.barBg, text: theme.barText, border: theme.barBorder, font: theme.font }, 
             'audio': { bg: theme.barBg, text: theme.barText, border: theme.barBorder }, 
             'btn-settings': { bg: theme.btnBg, text: theme.btnText, border: theme.btnBg }, 
             'btn-home': { bg: theme.btnBg, text: theme.btnText, border: theme.btnBg }, 
             'btn-bookmark': { bg: theme.btnBg, text: theme.btnText, border: theme.btnBg }, 
             'btn-bookmarks-list': { bg: theme.btnBg, text: theme.btnText, border: theme.btnBg }, 
             'btn-themes': { bg: theme.btnBg, text: theme.btnText, border: theme.btnBg }, 
             'btn-autoscroll': { bg: theme.btnBg, text: theme.btnText, border: theme.btnBg }, 
             'btn-menu': { bg: theme.btnBg, text: theme.btnText, border: theme.btnBg }, 
             'btn-search': { bg: theme.btnBg, text: theme.btnText, border: theme.btnBg } 
         };
    }

    localStorage.setItem('toolbar_colors' + modeSuffix, JSON.stringify(themeColors));

    // Update quran_settings to match the theme's colors and font
    const savedSettings = JSON.parse(localStorage.getItem('quran_settings' + modeSuffix) || '{}');
    const baseSettings = { ...DEFAULT_SETTINGS, ...savedSettings };
    const updatedSettings = {
        ...baseSettings,
        bgColor: theme.bg,
        textColor: theme.text,
        fontFamily: theme.font,
        ...(baseSettings.lockHighlightColor ? {} : { highlightTextColor: theme.highlightText || theme.accent }),
        theme: themeId
    };
    localStorage.setItem('quran_settings' + modeSuffix, JSON.stringify(updatedSettings));

    // Dispatch a custom event to notify the main component to reload theme
    window.dispatchEvent(new Event('theme-change'));
};
