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
        const saved = localStorage.getItem('toolbar_colors_v2' + modeSuffix);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                return parsed;
            } catch (e) {}
        }
        
        const theme = THEMES['default'];
        const black = "#000000";
        const white = "#ffffff";
        
        return {
            'top-toolbar': { bg: white, border: black },
            'bottom-toolbar': { bg: white, border: black },
            'surah': { bg: white, text: black, border: black, font: theme.font },
            'juz': { bg: white, text: black, border: black, font: theme.font },
            'page': { bg: white, text: black, border: black, font: theme.font },
            'audio': { bg: white, text: black, border: black },
            'btn-settings': { bg: white, text: black, border: black },
            'btn-home': { bg: white, text: black, border: black },
            'btn-bookmark': { bg: white, text: black, border: black },
            'btn-bookmarks-list': { bg: white, text: black, border: black },
            'btn-themes': { bg: white, text: black, border: black },
            'btn-autoscroll': { bg: white, text: black, border: black },
            'btn-menu': { bg: white, text: black, border: black },
            'btn-search': { bg: white, text: black, border: black },
            'btn-share': { bg: white, text: black, border: black }
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
