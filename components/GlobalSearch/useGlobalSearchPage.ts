import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Keyboard } from '@capacitor/keyboard';
import { Capacitor } from '@capacitor/core';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { registerBackInterceptor } from '../../hooks/useBackButton';
import { loadQuranEnglishTranslation } from '../../utils/quran/quranTranslationHelper';
import { getCalculator3DStyles } from '../../utils/styles/calculator3DStyles';
import { getMadinahThemePalette } from '../QuranReader/MadinahFrameSVG';
import {
    loadTafseerMap,
    loadMeaningsMap,
    getSectionsKey,
    searchCache,
    performGlobalSearch
} from './searchEngine';
import { getReaderTheme, buildGlobalSearchThemeStyles } from './globalSearchTheme';

export const useGlobalSearchPage = ({
    onBack,
    onNavigate,
    navParams,
}: {
    onBack: () => void;
    onNavigate: (pageId: string, params?: any) => void;
    navParams?: any;
}) => {
    const { theme: appTheme, themeKey, isNightMode, homeThemeVariant, setCurrentPage } = useTheme();
    const { language } = useLanguage();
    const isEn = language === 'en';
    const s3d = getCalculator3DStyles(appTheme, themeKey, isNightMode, homeThemeVariant);

    const isFromQuran = Boolean(
        navParams?.fromSidebar ||
        navParams?.from === 'quran' ||
        navParams?.from === 'quran-landscape' ||
        (typeof navParams?.from === 'string' && navParams.from.startsWith('quran'))
    );
    const isQuranLandscape = navParams?.from === 'quran-landscape';

    const sourceReadingMode: string | undefined = React.useMemo(() => {
        if (!isFromQuran) return undefined;
        if (navParams?.readingMode) return navParams.readingMode;
        const orient = isQuranLandscape ? 'h' : 'v';
        if (isEn) {
            return (
                localStorage.getItem(`quran_reading_mode_en_${orient}`) ||
                localStorage.getItem(`last_reading_mode_${orient}`) ||
                'translation'
            );
        }
        return (
            localStorage.getItem(`quran_reading_mode_ar_${orient}`) ||
            localStorage.getItem(`last_arabic_reading_mode_${orient}`) ||
            localStorage.getItem(`last_reading_mode_${orient}`) ||
            'mushaf'
        );
    }, [isFromQuran, navParams?.readingMode, isQuranLandscape, isEn]);

    const readingModeLabel = React.useMemo(() => {
        if (!sourceReadingMode) return '';
        switch (sourceReadingMode) {
            case 'mushaf': return isEn ? 'Mushaf' : 'المصحف';
            case 'madinah': return isEn ? 'Madinah Mushaf' : 'مصحف المدينة';
            case 'tafseer': return isEn ? 'Tafseer' : 'التفسير';
            case 'meanings': return isEn ? 'Word Meanings' : 'المعاني';
            case 'bilingual': return isEn ? 'Recitation & Translation' : 'التلاوة والترجمة';
            case 'translation': return isEn ? 'Translation' : 'الترجمة';
            default: return '';
        }
    }, [sourceReadingMode, isEn]);

    const [readerTheme, setReaderTheme] = useState(() => getReaderTheme(isQuranLandscape, sourceReadingMode || 'mushaf'));

    // Pre-fetch English Quran translation & mode-specific data when needed
    useEffect(() => {
        loadQuranEnglishTranslation();
        if (sourceReadingMode === 'tafseer') {
            loadTafseerMap();
        } else if (sourceReadingMode === 'meanings') {
            loadMeaningsMap();
        }
    }, [sourceReadingMode]);

    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchBoxRef = useRef<HTMLFormElement>(null);
    const isKeyboardOpenRef = useRef(false);

    const dismissKeyboard = useCallback((force = false) => {
        const inputEl = searchInputRef.current;
        const activeEl = document.activeElement;
        const hasFocusedInput = Boolean(
            (inputEl && activeEl === inputEl) ||
            (activeEl instanceof HTMLElement && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA'))
        );

        if (inputEl && activeEl === inputEl) {
            inputEl.blur();
        } else if (activeEl instanceof HTMLElement && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
            activeEl.blur();
        }

        if (Capacitor.isNativePlatform() && (force || hasFocusedInput || isKeyboardOpenRef.current)) {
            isKeyboardOpenRef.current = false;
            Keyboard.hide().catch(() => {});
        }
    }, []);

    const handleBack = useCallback(() => {
        dismissKeyboard(true);
        onBack();
    }, [dismissKeyboard, onBack]);

    const handleGoHome = useCallback(() => {
        dismissKeyboard(true);
        onNavigate('home');
    }, [dismissKeyboard, onNavigate]);

    useEffect(() => {
        const interceptor = () => {
            handleBack();
            return true;
        };
        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [handleBack]);

    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;
        Keyboard.setScroll({ isDisabled: true });

        let showHandle: any;
        let hideHandle: any;
        let cancelled = false;

        Promise.resolve(Keyboard.addListener('keyboardDidShow', () => {
            isKeyboardOpenRef.current = true;
        }))
            .then((h) => {
                if (cancelled) h?.remove?.();
                else showHandle = h;
            })
            .catch(() => {});

        Promise.resolve(Keyboard.addListener('keyboardDidHide', () => {
            isKeyboardOpenRef.current = false;
        }))
            .then((h) => {
                if (cancelled) h?.remove?.();
                else hideHandle = h;
            })
            .catch(() => {});

        return () => {
            cancelled = true;
            showHandle?.remove?.();
            hideHandle?.remove?.();
        };
    }, []);

    useEffect(() => {
        setCurrentPage(isFromQuran ? (isQuranLandscape ? 'quran_search_landscape' : 'quran_search') : 'search');
        setReaderTheme(getReaderTheme(isQuranLandscape, sourceReadingMode || 'mushaf'));

        const handleThemeChange = () => {
            setReaderTheme(getReaderTheme(isQuranLandscape, sourceReadingMode || 'mushaf'));
        };

        window.addEventListener('theme-change', handleThemeChange);
        window.addEventListener('settings-change', handleThemeChange);
        return () => {
            window.removeEventListener('theme-change', handleThemeChange);
            window.removeEventListener('settings-change', handleThemeChange);
        };
    }, [setCurrentPage, isFromQuran, isQuranLandscape, sourceReadingMode]);

    const ornamentPalette = React.useMemo(
        () => (isFromQuran ? getMadinahThemePalette(readerTheme) : null),
        [isFromQuran, readerTheme]
    );

    const themeStyles = buildGlobalSearchThemeStyles({
        appTheme,
        s3d,
        readerTheme,
        isFromQuran,
        ornamentPalette,
    });

    const [query, setQuery] = useState(searchCache.query);
    const [selectedSections, setSelectedSections] = useState<string[]>(() => {
        if (isFromQuran && (sourceReadingMode || '') !== searchCache.readingMode) {
            return ['quran'];
        }
        if (Array.isArray(searchCache.activeTab)) {
            return searchCache.activeTab.length > 0 ? searchCache.activeTab : (isFromQuran ? ['quran'] : ['all']);
        }
        if (typeof searchCache.activeTab === 'string' && searchCache.activeTab) {
            if (searchCache.activeTab === 'all' && !searchCache.query && isFromQuran) {
                return ['quran'];
            }
            return [searchCache.activeTab];
        }
        return isFromQuran ? ['quran'] : ['all'];
    });

    const handleToggleSection = (sectionId: string) => {
        if (sectionId === 'all') {
            setSelectedSections(['all']);
            return;
        }

        setSelectedSections(prev => {
            const withoutAll = prev.filter(id => id !== 'all');
            let next: string[];
            if (withoutAll.includes(sectionId)) {
                next = withoutAll.filter(id => id !== sectionId);
            } else {
                next = [...withoutAll, sectionId];
            }
            if (next.length === 0) {
                return ['all'];
            }
            return next;
        });
    };

    const handleResultClick = useCallback((pageId: string, params?: any) => {
        searchCache.scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
        onNavigate(pageId, params);
    }, [onNavigate]);

    useEffect(() => {
        if (searchCache.scrollTop > 0) {
            setTimeout(() => {
                window.scrollTo({ top: searchCache.scrollTop, behavior: 'instant' });
            }, 10);
        }
        const handleScroll = () => {
            const currentScroll = window.scrollY || document.documentElement.scrollTop || 0;
            if (currentScroll > 0) {
                searchCache.scrollTop = currentScroll;
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const [quranResults, setQuranResults] = useState<any[]>(searchCache.quranResults);
    const [athkarResults, setAthkarResults] = useState<any[]>(searchCache.athkarResults);
    const [salahAthkarResults, setSalahAthkarResults] = useState<any[]>(searchCache.salahAthkarResults);
    const [duaResults, setDuaResults] = useState<any[]>(searchCache.duaResults);
    const [ruqyahResults, setRuqyahResults] = useState<any[]>(searchCache.ruqyahResults);
    const [hisnResults, setHisnResults] = useState<any[]>(searchCache.hisnResults);
    const [nawawiResults, setNawawiResults] = useState<any[]>(searchCache.nawawiResults);
    const [asmaulHusnaResults, setAsmaulHusnaResults] = useState<any[]>(searchCache.asmaulHusnaResults);
    const [seerahResults, setSeerahResults] = useState<any[]>(searchCache.seerahResults);
    const [hajjUmrahResults, setHajjUmrahResults] = useState<any[]>(searchCache.hajjUmrahResults);
    const [tenPromisedResults, setTenPromisedResults] = useState<any[]>(searchCache.tenPromisedResults);
    const [divineMiraclesResults, setDivineMiraclesResults] = useState<any[]>(searchCache.divineMiraclesResults);

    const [isSearching, setIsSearching] = useState(false);
    const [expandedSurahs, setExpandedSurahs] = useState<Record<number, boolean>>({});
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
        quran: false,
        dua: false,
        ruqyah: false,
        athkar: false,
        salahAthkar: false,
        hisn: false,
        nawawi: false,
        asmaulHusna: false,
        seerah: false,
        hajjUmrah: false,
        tenPromised: false,
        divineMiracles: false,
    });

    useEffect(() => {
        setExpandedSurahs({});
    }, [quranResults]);

    const toggleSurah = (surahNum: number) => {
        setExpandedSurahs(prev => {
            const isCurrentlyOpen = Boolean(prev[surahNum]);
            if (isCurrentlyOpen) {
                return {};
            } else {
                return { [surahNum]: true };
            }
        });
    };

    const searchTimeoutRef = useRef<any>(null);

    const performSearch = useCallback(async (currentQuery: string, sectionsToSearch: string[]) => {
        const q = currentQuery.trim();
        if (q) {
            setIsSearching(true);
        }

        const results = await performGlobalSearch({
            currentQuery,
            sectionsToSearch,
            isEn,
            language,
            sourceReadingMode,
        });

        setQuranResults(results.quranResults);
        setAthkarResults(results.athkarResults);
        setSalahAthkarResults(results.salahAthkarResults);
        setDuaResults(results.duaResults);
        setRuqyahResults(results.ruqyahResults);
        setHisnResults(results.hisnResults);
        setNawawiResults(results.nawawiResults);
        setAsmaulHusnaResults(results.asmaulHusnaResults);
        setSeerahResults(results.seerahResults);
        setHajjUmrahResults(results.hajjUmrahResults);
        setTenPromisedResults(results.tenPromisedResults);
        setDivineMiraclesResults(results.divineMiraclesResults);
        setIsSearching(false);
    }, [isEn, language, sourceReadingMode]);

    useEffect(() => {
        searchCache.activeTab = selectedSections.includes('all') ? 'all' : (selectedSections.length === 1 ? selectedSections[0] : (selectedSections as any));
    }, [selectedSections]);

    useEffect(() => {
        const trimmed = query.trim();
        const currentSectionsKey = getSectionsKey(selectedSections);

        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

        if (trimmed === '') {
            setQuranResults([]);
            setAthkarResults([]);
            setSalahAthkarResults([]);
            setDuaResults([]);
            setRuqyahResults([]);
            setHisnResults([]);
            setNawawiResults([]);
            setAsmaulHusnaResults([]);
            setSeerahResults([]);
            setHajjUmrahResults([]);
            setTenPromisedResults([]);
            setDivineMiraclesResults([]);
            setIsSearching(false);

            Object.assign(searchCache, {
                query: '',
                sectionsKey: currentSectionsKey,
                language,
                readingMode: sourceReadingMode || '',
                scrollTop: 0,
                quranResults: [],
                athkarResults: [],
                salahAthkarResults: [],
                duaResults: [],
                ruqyahResults: [],
                hisnResults: [],
                nawawiResults: [],
                asmaulHusnaResults: [],
                seerahResults: [],
                hajjUmrahResults: [],
                tenPromisedResults: [],
                divineMiraclesResults: [],
            });
            return;
        }

        if (
            trimmed === searchCache.query &&
            currentSectionsKey === searchCache.sectionsKey &&
            language === searchCache.language &&
            (sourceReadingMode || '') === searchCache.readingMode
        ) {
            return;
        }

        setIsSearching(true);
        searchTimeoutRef.current = setTimeout(() => {
            performSearch(query, selectedSections);
        }, 300);

        return () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        };
    }, [query, selectedSections, language, sourceReadingMode, performSearch]);

    const totalResults =
        quranResults.length +
        athkarResults.length +
        salahAthkarResults.length +
        duaResults.length +
        ruqyahResults.length +
        hisnResults.length +
        nawawiResults.length +
        asmaulHusnaResults.length +
        seerahResults.length +
        hajjUmrahResults.length +
        tenPromisedResults.length +
        divineMiraclesResults.length;

    const sectionsList = [
        { id: 'all', label: isEn ? 'All Sections' : 'كل الأقسام' },
        { id: 'quran', label: readingModeLabel ? (isEn ? `Quran (${readingModeLabel})` : `القرآن • ${readingModeLabel}`) : (isEn ? 'Quran' : 'القرآن الكريم') },
        { id: 'athkar', label: isEn ? 'Adhkar' : 'أذكار اليوم' },
        { id: 'salahAthkar', label: isEn ? 'Prayer Adhkar' : 'أذكار الصلاة' },
        { id: 'dua', label: isEn ? 'Supplications' : 'الأدعية' },
        { id: 'ruqyah', label: isEn ? 'Ruqyah' : 'الرقية الشرعية' },
        { id: 'hisn', label: isEn ? 'Hisn Al-Muslim' : 'حصن المسلم' },
        { id: 'nawawi', label: isEn ? 'An-Nawawi 40' : 'الأربعون النووية' },
        { id: 'asmaulHusna', label: isEn ? 'Asmaul Husna' : 'أسماء الله الحسنى' },
        { id: 'seerah', label: isEn ? 'Seerah' : 'السيرة النبوية' },
        { id: 'hajjUmrah', label: isEn ? 'Hajj & Umrah' : 'الحج والعمرة' },
        { id: 'tenPromised', label: isEn ? 'Ten Promised' : 'العشرة المبشرون' },
        { id: 'divineMiracles', label: isEn ? 'Divine Miracles' : 'المعجزات الإلهية' },
    ];
    const otherSections = sectionsList.filter(s => s.id !== 'all');
    const isAllSelected = selectedSections.includes('all') || selectedSections.length === 0;

    const sectionCounts: Record<string, number> = {
        quran: quranResults.length,
        athkar: athkarResults.length,
        salahAthkar: salahAthkarResults.length,
        dua: duaResults.length,
        ruqyah: ruqyahResults.length,
        hisn: hisnResults.length,
        nawawi: nawawiResults.length,
        asmaulHusna: asmaulHusnaResults.length,
        seerah: seerahResults.length,
        hajjUmrah: hajjUmrahResults.length,
        tenPromised: tenPromisedResults.length,
        divineMiracles: divineMiraclesResults.length,
    };

    const pageTitle = isEn ? 'Advanced Search' : 'البحث المتقدم';

    return {
        isEn,
        s3d,
        isFromQuran,
        isQuranLandscape,
        sourceReadingMode,
        readingModeLabel,
        searchInputRef,
        searchBoxRef,
        isKeyboardOpenRef,
        dismissKeyboard,
        handleBack,
        handleGoHome,
        themeStyles,
        query,
        setQuery,
        selectedSections,
        handleToggleSection,
        handleResultClick,
        quranResults,
        athkarResults,
        salahAthkarResults,
        duaResults,
        ruqyahResults,
        hisnResults,
        nawawiResults,
        asmaulHusnaResults,
        seerahResults,
        hajjUmrahResults,
        tenPromisedResults,
        divineMiraclesResults,
        isSearching,
        expandedSurahs,
        toggleSurah,
        expandedCategories,
        setExpandedCategories,
        totalResults,
        sectionsList,
        otherSections,
        isAllSelected,
        sectionCounts,
        pageTitle,
    };
};
