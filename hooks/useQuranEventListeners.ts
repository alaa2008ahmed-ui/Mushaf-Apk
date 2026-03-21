import React, { useEffect } from 'react';
import { DEFAULT_SETTINGS, THEMES } from '../components/QuranReader/constants';
import quranUthmaniJson from '../data/quran-uthmani.json';
import quranTajweedJson from '../data/quran-tajweed.json';

export const useQuranEventListeners = (
    isLandscapeRef: React.MutableRefObject<boolean>,
    setCurrentTheme: React.Dispatch<React.SetStateAction<any>>,
    setSettings: React.Dispatch<React.SetStateAction<any>>,
    setToolbarColors: React.Dispatch<React.SetStateAction<any>>,
    setUseTajweed: React.Dispatch<React.SetStateAction<boolean>>,
    setQuranData: React.Dispatch<React.SetStateAction<any>>,
    setIsTransparentMode: React.Dispatch<React.SetStateAction<boolean>>,
    setIsHideToolbarsEnabled: React.Dispatch<React.SetStateAction<boolean>>,
    setBookmarks: React.Dispatch<React.SetStateAction<any[]>>,
    setShowSajdahCard: React.Dispatch<React.SetStateAction<boolean>>,
    setIsLandscapeUIHidden: React.Dispatch<React.SetStateAction<boolean>>
) => {
    useEffect(() => {
        const handleThemeChange = () => {
            const mode = isLandscapeRef.current ? '_h' : '_v';
            const themeId = localStorage.getItem('current_theme_id' + mode) || 'default';
            const newTheme = THEMES[themeId as keyof typeof THEMES] || THEMES['default'];
            setCurrentTheme(newTheme);
            
            const savedSettings = localStorage.getItem('quran_settings' + mode);
            if (savedSettings) {
                setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
            } else {
                setSettings(DEFAULT_SETTINGS);
            }
            
            const savedToolbarColors = localStorage.getItem('toolbar_colors' + mode);
            if (savedToolbarColors) {
                try {
                    const parsed = JSON.parse(savedToolbarColors);
                    if (parsed['surah']?.text === "#10b981" && parsed['juz']?.text === "#6d28d9") {
                        parsed['surah'].text = "#6d28d9";
                        parsed['surah'].border = "#6d28d9";
                        parsed['juz'].text = "#10b981";
                        parsed['juz'].border = "#10b981";
                        localStorage.setItem('toolbar_colors' + mode, JSON.stringify(parsed));
                    }
                    setToolbarColors(parsed);
                } catch (e) {}
            } else {
                const theme = THEMES['default'];
                const green = "#10b981"; const greenBorder = "#059669";
                const purple = "#7e22ce"; const purpleBorder = "#6b21a8";
                const purpleText = "#6d28d9";
                const white = "#ffffff"; const grayBorder = "#e5e7eb";
                setToolbarColors({
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
                });
            }

            const tajweedSetting = localStorage.getItem('use_tajweed_quran' + mode) === 'true';
            setUseTajweed(tajweedSetting);
            setQuranData(tajweedSetting ? quranTajweedJson.data : quranUthmaniJson.data);

            const transSetting = localStorage.getItem('transparent_mode' + mode) === 'true';
            setIsTransparentMode(transSetting);

            const hideToolbarsSetting = localStorage.getItem('hide_toolbars_enabled' + mode) === 'true';
            setIsHideToolbarsEnabled(hideToolbarsSetting);

            const savedBookmarks = localStorage.getItem('quran_bookmarks_list' + mode);
            setBookmarks(savedBookmarks ? JSON.parse(savedBookmarks) : []);

            const savedSajdah = localStorage.getItem('show_sajdah_card' + mode);
            setShowSajdahCard(savedSajdah !== null ? savedSajdah === 'true' : true);

            if (mode === '_h') {
                setIsLandscapeUIHidden(localStorage.getItem('is_landscape_ui_hidden') === 'true');
            } else {
                setIsLandscapeUIHidden(false);
            }
        };

        const handleSettingsChange = () => {
            const mode = isLandscapeRef.current ? '_h' : '_v';
            const saved = localStorage.getItem('quran_settings' + mode);
            if (saved) setSettings(JSON.parse(saved));
            
            const savedToolbarColors = localStorage.getItem('toolbar_colors' + mode);
            if (savedToolbarColors) {
                try {
                    const parsed = JSON.parse(savedToolbarColors);
                    if (parsed['surah']?.text === "#10b981" && parsed['juz']?.text === "#6d28d9") {
                        parsed['surah'].text = "#6d28d9";
                        parsed['surah'].border = "#6d28d9";
                        parsed['juz'].text = "#10b981";
                        parsed['juz'].border = "#10b981";
                        localStorage.setItem('toolbar_colors' + mode, JSON.stringify(parsed));
                    }
                    setToolbarColors(parsed);
                } catch (e) {}
            } else {
                const theme = THEMES['default'];
                const green = "#10b981"; const greenBorder = "#059669";
                const purple = "#7e22ce"; const purpleBorder = "#6b21a8";
                const purpleText = "#6d28d9";
                const white = "#ffffff"; const grayBorder = "#e5e7eb";
                setToolbarColors({
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
                });
            }
            
            const tajweedSetting = localStorage.getItem('use_tajweed_quran' + mode) === 'true';
            setUseTajweed(tajweedSetting);
            setQuranData(tajweedSetting ? quranTajweedJson.data : quranUthmaniJson.data);
            
            const transSetting = localStorage.getItem('transparent_mode' + mode) === 'true';
            setIsTransparentMode(transSetting);

            const hideToolbarsSetting = localStorage.getItem('hide_toolbars_enabled' + mode) === 'true';
            setIsHideToolbarsEnabled(hideToolbarsSetting);

            const savedBookmarks = localStorage.getItem('quran_bookmarks_list' + mode);
            setBookmarks(savedBookmarks ? JSON.parse(savedBookmarks) : []);

            const savedSajdah = localStorage.getItem('show_sajdah_card' + mode);
            setShowSajdahCard(savedSajdah !== null ? savedSajdah === 'true' : true);

            if (mode === '_h') {
                setIsLandscapeUIHidden(localStorage.getItem('is_landscape_ui_hidden') === 'true');
            } else {
                setIsLandscapeUIHidden(false);
            }
        };

        window.addEventListener('theme-change', handleThemeChange);
        window.addEventListener('settings-change', handleSettingsChange);
        return () => {
            window.removeEventListener('theme-change', handleThemeChange);
            window.removeEventListener('settings-change', handleSettingsChange);
        };
    }, [isLandscapeRef, setCurrentTheme, setSettings, setToolbarColors, setUseTajweed, setQuranData, setIsTransparentMode, setIsHideToolbarsEnabled, setBookmarks, setShowSajdahCard, setIsLandscapeUIHidden]);
};
