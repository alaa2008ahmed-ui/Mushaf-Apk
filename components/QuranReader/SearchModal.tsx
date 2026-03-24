import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toArabic } from './constants';

interface SearchModalProps {
    quranData: any;
    onSelect: (surah: number, ayah: number) => void;
    onClose: () => void;
    isLandscape?: boolean;
}

const SearchModal: React.FC<SearchModalProps> = ({ quranData, onSelect, onClose, isLandscape }) => {
    const modeSuffix = isLandscape ? '_h' : '_v';
    const [query, setQuery] = useState(() => localStorage.getItem('search_query' + modeSuffix) || '');
    const [results, setResults] = useState<any[]>([]);
    const [visibleCount, setVisibleCount] = useState(100);
    const [isSearching, setIsSearching] = useState(false);
    const [searchStats, setSearchStats] = useState('');
    const searchJobIdRef = useRef(0);
    const searchTimeoutRef = useRef<any>(null);

    const handleSearchInput = (q: string) => {
        setQuery(q);
        localStorage.setItem('search_query' + modeSuffix, q);
        if (q.trim() !== '') {
            setSearchStats('جاري الكتابة...');
        } else {
            setSearchStats('');
            setResults([]);
            setVisibleCount(100);
        }

        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => performSearch(q), 500);
    };

    useEffect(() => {
        const handleVoiceCommand = (e: any) => {
            const { action, text } = e.detail;
            if (action === 'execute_search') {
                handleSearchInput(text);
            } else if (action === 'clear_search') {
                handleSearchInput('');
            } else if (action === 'close_search') {
                onClose();
            }
        };

        window.addEventListener('voice-command', handleVoiceCommand);
        return () => window.removeEventListener('voice-command', handleVoiceCommand);
    }, [handleSearchInput, onClose]);

    useEffect(() => {
        if (query.trim() !== '') {
            performSearch(query);
        }
    }, []);

    const stripTajweedTags = (text: string) => {
        if (!text) return '';
        return text.replace(/\[([a-z])(?::\d+)?\[([^\]]+)\]/g, '$2');
    };

    const normalizeArabic = (text: string) => {
        const stripped = stripTajweedTags(text);
        return stripped.replace(/[\u064B-\u065F\u0670]/g, "")
                   .replace(/\u0640/g, "")
                   .replace(/[أإآٱ]/g, "ا")
                   .replace(/ة/g, "ه")
                   .replace(/ى/g, "ي");
    };

    const performSearch = (q: string) => {
        if (!quranData) return;
        
        searchJobIdRef.current += 1;
        const newJobId = searchJobIdRef.current;
        
        q = q.trim();
        if (q === '') {
            setResults([]);
            setVisibleCount(100);
            setSearchStats('');
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        setSearchStats('...');
        setVisibleCount(100);
        
        // Use setTimeout to allow UI update before heavy processing
        setTimeout(() => {
            executeSearchOptimized(q, newJobId);
        }, 10);
    };

    const executeSearchOptimized = (q: string, jobId: number) => {
        const normQ = normalizeArabic(q);
        const highlightPattern = normQ.split('').map(c => (c==='ا'?'[أإآٱا]':(c==='ه'?'[هة]':(c==='ي'?'[يى]':c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))))).join('[\\u064B-\\u065F\\u0670]*');
        const regex = new RegExp(highlightPattern, 'gi');
        
        const foundResults: any[] = [];
        let sIdx = 0;
        let aIdx = 0;

        const processChunk = () => {
            if (searchJobIdRef.current > jobId) return; // Cancelled by newer search
            
            const start = performance.now();
            while (sIdx < quranData.surahs.length) {
                const surah = quranData.surahs[sIdx];
                while (aIdx < surah.ayahs.length) {
                    const ayah = surah.ayahs[aIdx];
                    const cleanText = stripTajweedTags(ayah.text);
                    if (normalizeArabic(cleanText).includes(normQ)) {
                        foundResults.push({ 
                            text: cleanText, 
                            surah: surah.number, 
                            surahName: surah.name, 
                            ayah: ayah.numberInSurah, 
                            page: ayah.page,
                            highlightRegex: regex
                        });
                    }
                    aIdx++;
                    if (performance.now() - start > 15) {
                        setResults([...foundResults]);
                        setSearchStats(`جاري البحث... (${toArabic(foundResults.length)})`);
                        setTimeout(processChunk, 0);
                        return;
                    }
                }
                aIdx = 0;
                sIdx++;
            }
            
            if (searchJobIdRef.current === jobId) {
                setResults([...foundResults]);
                setSearchStats(`النتائج: ${toArabic(foundResults.length)}`);
                setIsSearching(false);
            }
        };

        processChunk();
    };

    const highlightText = (text: string, regex: RegExp) => {
        const parts = text.split(regex);
        const matches = text.match(regex) || [];
        return (
            <>
                {parts.map((part, i) => (
                    <React.Fragment key={i}>
                        {part}
                        {matches[i] && <span className="highlighted-search-term">{matches[i]}</span>}
                    </React.Fragment>
                ))}
            </>
        );
    };

    const visibleResults = results.slice(0, visibleCount);
    const groupedResults = visibleResults.reduce((acc, r) => {
        if (!acc[r.surah]) {
            acc[r.surah] = { surahName: r.surahName, ayahs: [] };
        }
        acc[r.surah].ayahs.push(r);
        return acc;
    }, {} as Record<number, { surahName: string, ayahs: any[] }>);
    const sortedSurahKeys = Object.keys(groupedResults).map(Number).sort((a, b) => a - b);

    return (
        <div className={`fixed inset-0 z-[200] bg-black/30 flex justify-center ${isLandscape ? 'items-start pt-0 px-0' : 'items-center px-4'} backdrop-blur-sm animate-fadeIn`} onClick={onClose}>
            <div className={`modal-skinned w-full ${isLandscape ? 'max-w-4xl h-full rounded-none' : 'max-w-lg rounded-2xl max-h-[90vh]'} flex flex-col shadow-2xl`} onClick={e => e.stopPropagation()}>
                <div className={`p-4 flex justify-between items-center shadow-md theme-header-bg ${isLandscape ? 'rounded-none' : 'rounded-t-2xl'}`}>
                    <h3 className="font-bold text-lg">البحث في المصحف</h3>
                    <button onClick={onClose} className="text-2xl hover:opacity-80 transition">&times;</button>
                </div>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="relative">
                        <input 
                            type="text" 
                            value={query}
                            onChange={(e) => handleSearchInput(e.target.value)}
                            placeholder="اكتب كلمة للبحث..." 
                            className="w-full p-3 pl-10 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold themed-input"
                            autoFocus
                        />
                        <button onClick={() => performSearch(query)} className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-emerald-500 text-white p-1.5 rounded-lg hover:bg-emerald-600 transition">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        </button>
                    </div>
                    <div className="text-xs text-center mt-2 opacity-60 font-bold">{searchStats}</div>
                </div>
                <div className={`flex-1 overflow-y-auto p-4 relative themed-bg space-y-4`}>
                    {isSearching && (
                        <div className="text-center mt-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
                            <p className="mt-2 opacity-60 font-bold">جاري البحث...</p>
                        </div>
                    )}
                    
                    {!isSearching && results.length === 0 && query.trim() !== '' && (
                        <div className="text-center opacity-40 mt-10">
                            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                            <p>لا توجد نتائج لبحثك</p>
                        </div>
                    )}

                    {!isSearching && results.length === 0 && query.trim() === '' && (
                        <div className="text-center opacity-40 mt-10">
                            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                            <p>ابدأ البحث عن أي كلمة أو آية</p>
                        </div>
                    )}

                    {sortedSurahKeys.map(surahNum => {
                        const group = groupedResults[surahNum];
                        return (
                            <div key={surahNum} className="mb-6">
                                <h4 className="font-bold text-emerald-600 dark:text-emerald-400 mb-3 border-b border-emerald-500/30 pb-2 text-lg">{group.surahName}</h4>
                                <div className={isLandscape ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
                                    {group.ayahs.map((r, idx) => (
                                        <div key={idx} className="search-context-block search-main-ayah" onClick={() => { onSelect(r.surah, r.ayah); onClose(); }}>
                                            <div className="search-context-label">آية {toArabic(r.ayah)} - صفحة {toArabic(r.page)}</div>
                                            <div className="search-context-ayah">
                                                {highlightText(r.text, r.highlightRegex)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                    
                    {!isSearching && results.length > visibleCount && (
                        <button 
                            onClick={() => setVisibleCount(prev => prev + 100)}
                            className="w-full py-3 mt-4 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition shadow-md"
                        >
                            عرض المزيد من النتائج ({toArabic(results.length - visibleCount)} متبقية)
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchModal;
