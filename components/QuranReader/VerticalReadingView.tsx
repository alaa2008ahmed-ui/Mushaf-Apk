import React, { useEffect, useState, useRef, useMemo } from 'react';
import { toArabic, SURAH_INFO, SURAH_NAMES_AR } from './constants';

interface VerticalReadingViewProps {
    quranData: any;
    readingMode: 'tafseer' | 'meanings';
    settings: any;
    currentTheme: any;
    currentAyah: { s: number; a: number };
    onAyahClick: (s: number, a: number) => void;
}

// Global cache to ensure instant loading after first fetch
let cachedTafseerData: any[] | null = null;
let cachedMeaningsData: any[] | null = null;

const VerticalReadingView: React.FC<VerticalReadingViewProps> = ({
    quranData,
    readingMode,
    settings,
    currentTheme,
    currentAyah,
    onAyahClick
}) => {
    const [tafseerData, setTafseerData] = useState<any[]>(cachedTafseerData || []);
    const [meaningsData, setMeaningsData] = useState<any[]>(cachedMeaningsData || []);
    const [isLoading, setIsLoading] = useState(() => {
        if (readingMode === 'tafseer') return !cachedTafseerData;
        if (readingMode === 'meanings') return !cachedMeaningsData;
        return true;
    });
    const containerRef = useRef<HTMLDivElement>(null);
    const ayahRefs = useRef<Record<string, HTMLDivElement | null>>({});

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

        fetchTafseer();
        fetchMeanings();
    }, [readingMode]);

    // Scroll to current ayah when it changes or when mode changes
    useEffect(() => {
        if (!isLoading) {
            const ayahId = `${currentAyah.s}-${currentAyah.a}`;
            const element = ayahRefs.current[ayahId];
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [currentAyah, isLoading, readingMode]);

    const getMeaning = (s: number, a: number) => {
        return meaningsData.find(m => m.number === String(s) && m.aya === String(a))?.text;
    };

    const getTafseer = (s: number, a: number) => {
        return tafseerData[s - 1]?.ayahs[a - 1]?.text;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full" style={{ backgroundColor: currentTheme.bg }}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: currentTheme.accent }}></div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="vertical-reading-view p-4 space-y-8 overflow-y-auto h-full" style={{ direction: 'rtl', backgroundColor: currentTheme.bg }}>
            {quranData.surahs.map((surah: any) => (
                <div key={surah.number} className="surah-section">
                    {/* Surah Header Visual */}
                    <div className="surah-header-visual mb-8 relative h-14 w-full flex items-center justify-between px-6 rounded-md border-[3px] border-[#1a5d38] overflow-hidden"
                         style={{ 
                             background: 'linear-gradient(to bottom, #2ecc71, #27ae60)',
                             boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
                         }}>
                        {/* Left: Ayahs count */}
                        <div className="text-white font-bold text-lg z-10 drop-shadow-md">
                            {toArabic(SURAH_INFO[surah.number].ayahs)} آيات
                        </div>

                        {/* Center: Surah Name Shape */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative bg-[#e8f8f1] h-10 px-12 flex items-center justify-center border-2 border-[#1a5d38] shadow-inner"
                                 style={{ 
                                     borderRadius: '50px / 50px',
                                     minWidth: '240px'
                                 }}>
                                <h2 className="text-xl font-bold text-[#1a5d38] whitespace-nowrap mb-0">
                                    سُورَةُ {SURAH_NAMES_AR[surah.number - 1]}
                                </h2>
                                {/* Decorative side curves */}
                                <div className="absolute left-0 top-0 bottom-0 w-4 border-r-2 border-[#1a5d38] rounded-l-full opacity-30"></div>
                                <div className="absolute right-0 top-0 bottom-0 w-4 border-l-2 border-[#1a5d38] rounded-r-full opacity-30"></div>
                            </div>
                        </div>

                        {/* Right: Surah Type */}
                        <div className="text-white font-bold text-lg z-10 drop-shadow-md">
                            {SURAH_INFO[surah.number].type}
                        </div>
                    </div>

                    {/* Ayahs */}
                    <div className="ayahs-list space-y-6">
                        {surah.ayahs.map((ayah: any) => {
                            const isHighlighted = currentAyah.s === surah.number && currentAyah.a === ayah.numberInSurah;
                            const ayahId = `${surah.number}-${ayah.numberInSurah}`;
                            
                            return (
                                <div 
                                    key={ayahId}
                                    ref={el => ayahRefs.current[ayahId] = el}
                                    className={`ayah-item p-4 rounded-xl transition-all border ${isHighlighted ? 'ring-2' : ''}`}
                                    style={{ 
                                        backgroundColor: isHighlighted ? `${currentTheme.accent}20` : 'transparent',
                                        borderColor: isHighlighted ? currentTheme.accent : 'transparent'
                                    }}
                                    onClick={() => onAyahClick(surah.number, ayah.numberInSurah)}
                                >
                                    <div className="ayah-text mb-4 text-right leading-relaxed" 
                                         style={{ 
                                             fontSize: `${settings.fontSize}rem`, 
                                             fontFamily: settings.fontFamily,
                                             color: currentTheme.accent // Distinguish Ayah with accent color
                                         }}>
                                        {ayah.text}
                                        <span className="inline-flex items-center justify-center w-8 h-8 mr-2 rounded-full border border-current text-sm font-bold"
                                              style={{ color: currentTheme.text }}>
                                            {toArabic(ayah.numberInSurah)}
                                        </span>
                                    </div>
                                    
                                    <div className="divider h-px w-full my-4 opacity-20" style={{ backgroundColor: currentTheme.text }}></div>
                                    
                                    <div className="explanation-text text-right opacity-90 leading-relaxed"
                                         style={{ fontSize: `${settings.fontSize * 0.8}rem`, color: currentTheme.text }}>
                                        {readingMode === 'tafseer' ? getTafseer(surah.number, ayah.numberInSurah) : getMeaning(surah.number, ayah.numberInSurah)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default VerticalReadingView;
