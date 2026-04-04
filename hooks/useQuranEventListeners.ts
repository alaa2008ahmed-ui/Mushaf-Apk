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
            
            const savedToolbarColors = localStorage.getItem('toolbar_colors_v2' + mode);
            if (savedToolbarColors) {
                try {
                    const parsed = JSON.parse(savedToolbarColors);
                    setToolbarColors(parsed);
                } catch (e) {}
            } else {
                const theme = THEMES['default'];
                const black = "#000000";
                const white = "#ffffff";
                setToolbarColors({
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
                    'btn-search': { bg: white, text: black, border: black }
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
            
            const savedToolbarColors = localStorage.getItem('toolbar_colors_v2' + mode);
            if (savedToolbarColors) {
                try {
                    const parsed = JSON.parse(savedToolbarColors);
                    setToolbarColors(parsed);
                } catch (e) {}
            } else {
                const theme = THEMES['default'];
                const black = "#000000";
                const white = "#ffffff";
                setToolbarColors({
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
                    'btn-search': { bg: white, text: black, border: black }
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
