import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { toArabic, SURAH_INFO, SURAH_NAMES_AR } from './constants';

interface VerticalReadingViewProps {
    quranData: any;
    readingMode: 'tafseer' | 'meanings' | 'translation';
    settings: any;
    currentTheme: any;
    currentAyah: { s: number; a: number };
    onAyahClick: (s: number, a: number) => void;
    onSettingsChange?: (newSettings: any) => void;
    modeSuffix?: string;
}

// Global cache to ensure instant loading after first fetch
let cachedTafseerData: any[] | null = null;
let cachedMeaningsData: any[] | null = null;
let cachedTranslationData: any[] | null = null;

const VerticalReadingView: React.FC<VerticalReadingViewProps> = React.memo(({
    quranData,
    readingMode,
    settings,
    currentTheme,
    currentAyah,
    onAyahClick,
    onSettingsChange,
    modeSuffix = '_v'
}) => {
    const [tafseerData, setTafseerData] = useState<any[]>(cachedTafseerData || []);
    const [meaningsData, setMeaningsData] = useState<any[]>(cachedMeaningsData || []);
    const [translationData, setTranslationData] = useState<any[]>(cachedTranslationData || []);
    const [isLoading, setIsLoading] = useState(() => {
        if (readingMode === 'tafseer') return !cachedTafseerData;
        if (readingMode === 'meanings') return !cachedMeaningsData;
        if (readingMode === 'translation') return !cachedTranslationData;
        return true;
    });
    const virtuosoRef = useRef<VirtuosoHandle>(null);

    // Pinch-to-zoom refs
    const initialPinchDistanceRef = useRef<number | null>(null);
    const initialPinchFontSizeRef = useRef<number | null>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const distance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
            initialPinchDistanceRef.current = distance;
            initialPinchFontSizeRef.current = settings.fontSize;
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length === 2 && initialPinchDistanceRef.current !== null && initialPinchFontSizeRef.current !== null && onSettingsChange) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const distance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
            
            const scaleFactor = distance / initialPinchDistanceRef.current;
            const newFontSize = Math.min(Math.max(initialPinchFontSizeRef.current * scaleFactor, 1.0), 5.0);
            
            onSettingsChange({ ...settings, fontSize: newFontSize });
        }
    };

    const handleTouchEnd = () => {
        if (initialPinchDistanceRef.current !== null && onSettingsChange) {
            localStorage.setItem('quran_settings' + modeSuffix, JSON.stringify(settings));
            window.dispatchEvent(new Event('settings-change'));
        }
        initialPinchDistanceRef.current = null;
        initialPinchFontSizeRef.current = null;
    };

    useEffect(() => {
        const fetchTafseer = async () => {
            if (cachedTafseerData) return;
            try {
                const res = await fetch('/assets/data/ar.jalalayn.json');
                const data = await res.json();
                if (data.code === 200 && data.data && data.data.surahs) {
                    cachedTafseerData = data.data.surahs;
                    setTafseerData(cachedTafseerData);
                    if (readingMode === 'tafseer') setIsLoading(false);
                }
            } catch (error) {
                console.error('Error fetching tafseer data:', error);
            }
        };

        const fetchMeanings = async () => {
            if (cachedMeaningsData) return;
            try {
                const res = await fetch('/tafseer.json');
                const data = await res.json();
                cachedMeaningsData = data;
                setMeaningsData(cachedMeaningsData);
                if (readingMode === 'meanings') setIsLoading(false);
            } catch (error) {
                console.error('Error fetching meanings data:', error);
            }
        };

        const fetchTranslation = async () => {
            if (cachedTranslationData) return;
            try {
                const res = await fetch('/en.json');
                const data = await res.json();
                cachedTranslationData = data;
                setTranslationData(cachedTranslationData);
                if (readingMode === 'translation') setIsLoading(false);
            } catch (error) {
                console.error('Error fetching translation data:', error);
            }
        };

        fetchTafseer();
        fetchMeanings();
        fetchTranslation();
    }, [readingMode]);

    // Flatten the Quran data into a single list of items (headers and ayahs)
    const flattenedItems = useMemo(() => {
        const items: any[] = [];
        quranData.surahs.forEach((surah: any) => {
            // Add Surah Header
            items.push({
                type: 'header',
                surahNumber: surah.number,
                surahName: SURAH_NAMES_AR[surah.number - 1],
                surahType: SURAH_INFO[surah.number].type,
                ayahCount: SURAH_INFO[surah.number].ayahs
            });

            // Add Ayahs
            surah.ayahs.forEach((ayah: any) => {
                items.push({
                    type: 'ayah',
                    surahNumber: surah.number,
                    ayahNumber: ayah.numberInSurah,
                    text: ayah.text,
                    id: `${surah.number}-${ayah.numberInSurah}`
                });
            });
        });
        return items;
    }, [quranData]);

    // Find the index of the current ayah in the flattened list
    const initialIndex = useMemo(() => {
        const targetId = `${currentAyah.s}-${currentAyah.a}`;
        const index = flattenedItems.findIndex(item => item.type === 'ayah' && item.id === targetId);
        return index !== -1 ? index : 0;
    }, [flattenedItems, currentAyah]);

    // Scroll to current ayah when it changes externally
    useEffect(() => {
        if (!isLoading && virtuosoRef.current) {
            const targetId = `${currentAyah.s}-${currentAyah.a}`;
            const index = flattenedItems.findIndex(item => item.type === 'ayah' && item.id === targetId);
            if (index !== -1) {
                virtuosoRef.current.scrollToIndex({
                    index,
                    align: 'start', // Align to start for better visibility of the surah/ayah
                    behavior: 'auto' // Instant jump, no smooth scrolling
                });
            }
        }
    }, [currentAyah.s, currentAyah.a, isLoading, flattenedItems]);

    const getMeaning = (s: number, a: number) => {
        return meaningsData.find(m => m.number === String(s) && m.aya === String(a))?.text;
    };

    const getTafseer = (s: number, a: number) => {
        return tafseerData[s - 1]?.ayahs[a - 1]?.text;
    };

    const getTranslation = (s: number, a: number) => {
        return translationData[s - 1]?.verses[a - 1]?.translation;
    };

    const renderItem = useCallback((index: number, item: any) => {
        if (item.type === 'header') {
            const headerBg = currentTheme?.headerBg || '#2ecc71';
            const headerBorder = currentTheme?.accent || '#1a5d38';
            const headerText = currentTheme?.headerText || '#ffffff';
            const cartoucheBg = currentTheme?.bg || '#e8f8f1';
            const cartoucheText = currentTheme?.accent || '#1a5d38';

            return (
                <div className="px-4 py-6">
                    <div className="surah-header-visual relative h-14 w-full flex items-center justify-between px-6 rounded-md border-[3px] overflow-hidden"
                         style={{ 
                             background: headerBg,
                             borderColor: headerBorder,
                             boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
                         }}>
                        <div className="font-bold text-lg z-10 drop-shadow-md" style={{ color: headerText }}>
                            {toArabic(item.ayahCount)} آيات
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative h-10 px-12 flex items-center justify-center border-2 shadow-inner"
                                 style={{ 
                                     borderRadius: '50px / 50px', 
                                     minWidth: '240px',
                                     backgroundColor: cartoucheBg,
                                     borderColor: headerBorder
                                 }}>
                                <h2 className="text-xl font-bold whitespace-nowrap mb-0" style={{ color: cartoucheText }}>
                                    سُورَةُ {item.surahName}
                                </h2>
                                <div className="absolute left-0 top-0 bottom-0 w-4 border-r-2 rounded-l-full opacity-30" style={{ borderColor: headerBorder }}></div>
                                <div className="absolute right-0 top-0 bottom-0 w-4 border-l-2 rounded-r-full opacity-30" style={{ borderColor: headerBorder }}></div>
                            </div>
                        </div>
                        <div className="font-bold text-lg z-10 drop-shadow-md" style={{ color: headerText }}>
                            {item.surahType}
                        </div>
                    </div>
                </div>
            );
        }

        const isHighlighted = currentAyah.s === item.surahNumber && currentAyah.a === item.ayahNumber;
        
        return (
            <div className="px-4 py-2">
                <div 
                    className={`ayah-item p-4 rounded-xl transition-all border ${isHighlighted ? 'ring-2' : ''}`}
                    style={{ 
                        backgroundColor: isHighlighted ? `${currentTheme.accent}20` : 'transparent',
                        borderColor: isHighlighted ? currentTheme.accent : 'transparent'
                    }}
                    onClick={() => onAyahClick(item.surahNumber, item.ayahNumber)}
                >
                    <div className="ayah-text mb-4 text-right leading-relaxed" 
                         style={{ 
                             fontSize: `${settings.fontSize}rem`, 
                             fontFamily: settings.fontFamily,
                             color: currentTheme.accent,
                             textAlign: 'justify',
                             textJustify: 'inter-word'
                         }}>
                        {item.text}
                        <span className="inline-flex items-center justify-center w-8 h-8 mr-2 rounded-full border border-current text-sm font-bold"
                              style={{ color: currentTheme.text, whiteSpace: 'nowrap' }}>
                            {toArabic(item.ayahNumber)}
                        </span>
                    </div>
                    
                    <div className="divider h-px w-full my-4 opacity-20" style={{ backgroundColor: currentTheme.text }}></div>
                    
                    <div className="explanation-text text-right opacity-90 leading-relaxed"
                         style={{ 
                             fontSize: `${settings.fontSize * 0.8}rem`, 
                             color: currentTheme.text,
                             direction: readingMode === 'translation' ? 'ltr' : 'rtl',
                             textAlign: readingMode === 'translation' ? 'left' : 'right'
                         }}>
                        {readingMode === 'tafseer' ? getTafseer(item.surahNumber, item.ayahNumber) : 
                         readingMode === 'meanings' ? getMeaning(item.surahNumber, item.ayahNumber) :
                         getTranslation(item.surahNumber, item.ayahNumber)}
                    </div>
                </div>
            </div>
        );
    }, [currentAyah, currentTheme, settings, readingMode, onAyahClick, meaningsData, tafseerData, translationData]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full" style={{ backgroundColor: currentTheme.bg }}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: currentTheme.accent }}></div>
            </div>
        );
    }

    return (
        <div 
            className="h-full w-full overflow-hidden" 
            style={{ direction: 'rtl', backgroundColor: currentTheme.bg }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <Virtuoso
                ref={virtuosoRef}
                data={flattenedItems}
                initialTopMostItemIndex={initialIndex}
                overscan={200} // Pre-render items for smoother experience
                className="h-full scrollbar-hide"
                itemContent={renderItem}
            />
        </div>
    );
});

export default VerticalReadingView;
