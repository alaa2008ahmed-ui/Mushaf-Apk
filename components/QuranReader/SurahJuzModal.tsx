import React, { useState, useEffect, useRef } from 'react';
import { JUZ_MAP, toArabic } from './constants';

interface SurahJuzModalProps {
    type: 'surah' | 'juz';
    quranData: any;
    onSelect: (surahOrJuz: number, ayah?: number) => void;
    onClose: () => void;
    isLandscape?: boolean;
    currentSelection?: number;
}

const SurahJuzModal: React.FC<SurahJuzModalProps> = ({ type, quranData, onSelect, onClose, isLandscape, currentSelection }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const selectedRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        // استخدام requestAnimationFrame لضمان أن القائمة قد ظهرت تماماً قبل التمرير
        requestAnimationFrame(() => {
            if (selectedRef.current) {
                selectedRef.current.scrollIntoView({ behavior: 'auto', block: 'center' });
            }
        });
    }, [type]); // التمرير عند تغيير النوع أيضاً

    const removeDiacritics = (text: string) => {
        if (!text) return "";
        return text
            .replace(/[\u064B-\u0652\u0670\u0653-\u065F\u0640]/g, "") // Remove all diacritics and small characters
            .replace(/[أإآٱ]/g, "ا") // Normalize all types of Alef
            .replace(/ة/g, "ه")
            .replace(/ى/g, "ي")
            .replace(/\s+/g, " ") // Normalize spaces
            .trim();
    };

    const normalizedSearch = removeDiacritics(searchTerm)
        .replace(/^صوره/, "سوره") // Handle common typo 'صورة' instead of 'سورة'
        .replace(/\sصوره/, " سوره");

    const filteredSurahs = quranData?.surahs.filter((s: any) => {
        const name = s.name;
        const nameWithoutSurah = s.name.replace('سورة', '').trim();
        
        const normalizedName = removeDiacritics(name);
        const normalizedNameWithoutSurah = removeDiacritics(nameWithoutSurah);
        
        return normalizedName.includes(normalizedSearch) || 
               normalizedNameWithoutSurah.includes(normalizedSearch) ||
               normalizedSearch.includes(normalizedNameWithoutSurah); // Handle searching for "سورة الفاتحة" when name is just "الفاتحة"
    });

    return (
        <div className={`fixed inset-0 z-[100] bg-black/30 flex justify-center items-start ${isLandscape ? 'pt-0 px-0' : 'pt-10 px-4'} animate-fadeIn backdrop-blur-sm`} onClick={onClose}>
            <div className={`modal-skinned w-full ${isLandscape ? 'max-w-6xl h-full rounded-none' : 'max-w-4xl rounded-t-2xl max-h-[90vh]'} flex flex-col`} onClick={e => e.stopPropagation()}>
                <div className={`p-4 theme-header-bg flex flex-col gap-3 ${isLandscape ? 'rounded-none' : 'rounded-t-2xl'}`}>
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg">{type === 'surah' ? 'اختر السورة' : 'اختر الجزء'}</h3>
                        <button onClick={onClose} className="text-2xl">&times;</button>
                    </div>
                    
                    {type === 'surah' && !isLandscape && (
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="ابحث عن سورة..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-2 pr-10 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                            />
                            <i className="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 opacity-50"></i>
                        </div>
                    )}
                </div>
                <div className={`overflow-y-auto p-4 flex flex-col gap-3 flex-1 content-start ${searchTerm ? 'items-center' : ''}`}>
                    {type === 'surah' ? (
                        <div className={`grid w-full gap-3 ${searchTerm ? 'grid-cols-1 max-w-md' : (isLandscape ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4')}`}>
                            {filteredSurahs?.length > 0 ? (
                                filteredSurahs.map((s: any) => (
                                    <button 
                                        key={s.number} 
                                        ref={currentSelection === s.number ? selectedRef : null}
                                        onClick={() => onSelect(s.number, 1)} 
                                        className={`p-2.5 rounded-lg transition text-right font-bold border flex justify-between items-center group ${currentSelection === s.number ? 'bg-orange-500 text-white border-orange-600 shadow-xl scale-[1.03] ring-2 ring-orange-300 z-10' : 'theme-btn-bg'}`}
                                    >
                                        <span>
                                            <span className="opacity-80">{toArabic(s.number)}.</span> 
                                            <span style={{ fontFamily: 'var(--font-amiri)' }}> {s.name.replace('سورة', '').trim()}</span>
                                        </span>
                                        <span className="text-xs font-normal opacity-80">
                                            {s.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} - {toArabic(s.ayahs.length)} آية
                                        </span>
                                    </button>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-10 opacity-60">لا توجد نتائج للبحث</div>
                            )}
                        </div>
                    ) : (
                        <div className={`grid w-full gap-3 ${isLandscape ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'}`}>
                            {JUZ_MAP.map((j: any) => (
                                <button 
                                    key={j.j} 
                                    ref={currentSelection === j.j ? selectedRef : null}
                                    onClick={() => onSelect(j.j)} 
                                    className={`p-2.5 rounded-lg transition font-bold border flex flex-col items-center justify-center text-center ${currentSelection === j.j ? 'bg-orange-500 text-white border-orange-600 shadow-xl scale-[1.03] ring-2 ring-orange-300 z-10' : 'theme-btn-bg'}`}
                                >
                                    <span className="text-lg mb-1">الجزء {toArabic(j.j)}</span>
                                    <span className="text-xs font-normal opacity-80" style={{ fontFamily: 'var(--font-amiri)' }}>
                                        {quranData?.surahs[j.s-1]?.name.replace('سورة','').trim()} آية {toArabic(j.a)} - صفحة {toArabic(quranData?.surahs[j.s-1]?.ayahs[j.a-1]?.page || '')}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SurahJuzModal;
