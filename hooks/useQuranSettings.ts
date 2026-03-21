import React, { useState, useEffect, useRef } from 'react';
import { DEFAULT_SETTINGS, THEMES } from '../components/QuranReader/constants';
import quranUthmaniJson from '../data/quran-uthmani.json';
import quranTajweedJson from '../data/quran-tajweed.json';

export const useQuranSettings = (initialLandscape: boolean, modeSuffix: string) => {
    const [useTajweed, setUseTajweed] = useState(() => localStorage.getItem('use_tajweed_quran' + modeSuffix) === 'true');
    const [quranData, setQuranData] = useState<any>(null);

    useEffect(() => {
        const data = useTajweed ? quranTajweedJson.data : quranUthmaniJson.data;
        setQuranData(data);
    }, [useTajweed]);
    
    const [isTransparentMode, setIsTransparentMode] = useState(() => localStorage.getItem('transparent_mode' + modeSuffix) === 'true');
    const [isHideToolbarsEnabled, setIsHideToolbarsEnabled] = useState(() => localStorage.getItem('hide_toolbars_enabled' + modeSuffix) === 'true');

    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('quran_settings' + modeSuffix);
        const defaultTheme = THEMES['default'];
        return saved ? JSON.parse(saved) : {
            fontSize: 1.7, fontFamily: defaultTheme.font, textColor: defaultTheme.text, bgColor: defaultTheme.bg,
            highlightTextColor: defaultTheme.highlightText || defaultTheme.accent,
            reader: 'Abu_Bakr_Ash-Shaatree_128kbps', theme: 'default', scrollMinutes: 20, tafseer: 'ar.jalalayn',
            hideUIOnAutoScroll: false,
            lockHighlightColor: false
        };
    });
    const settingsRef = useRef(settings);
    useEffect(() => { settingsRef.current = settings; }, [settings]);

    const [currentTheme, setCurrentTheme] = useState(() => {
        const themeId = localStorage.getItem('current_theme_id' + modeSuffix) || 'default';
        return THEMES[themeId as keyof typeof THEMES] || THEMES['default'];
    });

    const [toolbarColors, setToolbarColors] = useState(() => {
        const saved = localStorage.getItem('toolbar_colors' + modeSuffix);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed['surah']?.text === "#10b981" && parsed['juz']?.text === "#6d28d9") {
                    parsed['surah'].text = "#6d28d9";
                    parsed['surah'].border = "#6d28d9";
                    parsed['juz'].text = "#10b981";
                    parsed['juz'].border = "#10b981";
                    localStorage.setItem('toolbar_colors' + modeSuffix, JSON.stringify(parsed));
                }
                return parsed;
            } catch (e) {}
        }
        
        const theme = THEMES['default'];
        const green = "#10b981"; const greenBorder = "#059669";
        const purple = "#7e22ce"; const purpleBorder = "#6b21a8";
        const purpleText = "#6d28d9";
        const white = "#ffffff"; const grayBorder = "#e5e7eb";
        
        return {
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
    });

    const [bookmarks, setBookmarks] = useState(() => {
        return JSON.parse(localStorage.getItem('quran_bookmarks_list' + modeSuffix) || '[]');
    });

    const [showSajdahCard, setShowSajdahCard] = useState(() => {
        const saved = localStorage.getItem('show_sajdah_card' + modeSuffix);
        return saved !== null ? saved === 'true' : true;
    });

    const updateSetting = (key: string, value: any, isLandscapeRef: React.MutableRefObject<boolean>) => {
        const currentModeSuffix = isLandscapeRef.current ? '_h' : '_v';
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        localStorage.setItem('quran_settings' + currentModeSuffix, JSON.stringify(newSettings));
        window.dispatchEvent(new Event('settings-change'));
    };

    return {
        useTajweed, setUseTajweed,
        quranData, setQuranData,
        isTransparentMode, setIsTransparentMode,
        isHideToolbarsEnabled, setIsHideToolbarsEnabled,
        settings, setSettings, settingsRef, updateSetting,
        currentTheme, setCurrentTheme,
        toolbarColors, setToolbarColors,
        bookmarks, setBookmarks,
        showSajdahCard, setShowSajdahCard
    };
};
