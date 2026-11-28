import React from 'react';
import { BookOpen, ChevronLeft } from 'lucide-react';
import { toArabic, SURAH_NAMES_EN } from '../../QuranReader/constants';
import { normalizeArabic } from '../searchEngine';
import type { GlobalSearchThemeStyles } from '../globalSearchTheme';
import { highlightSearchText } from './searchResultsShared';

interface QuranSearchSectionProps {
    isEn: boolean;
    isFromQuran: boolean;
    isQuranLandscape: boolean;
    isAllSelected: boolean;
    sourceReadingMode?: string;
    readingModeLabel: string;
    query: string;
    quranResults: any[];
    expandedSurahs: Record<number, boolean>;
    toggleSurah: (surahNum: number) => void;
    isCategoryExpanded: boolean;
    onToggleCategory: () => void;
    handleResultClick: (pageId: string, params?: any) => void;
    themeStyles: GlobalSearchThemeStyles;
    s3d: any;
}

const QuranSearchSection: React.FC<QuranSearchSectionProps> = ({
    isEn,
    isFromQuran,
    isQuranLandscape,
    isAllSelected,
    sourceReadingMode,
    readingModeLabel,
    query,
    quranResults,
    expandedSurahs,
    toggleSurah,
    isCategoryExpanded,
    onToggleCategory,
    handleResultClick,
    themeStyles,
    s3d,
}) => {
    const {
        theme,
        card3DClass,
        btn3DClass,
        inner3DClass,
        icon3DClass,
        badge3DStyle,
        itemCardStyle,
        headerCardStyle,
        sectionIconStyle,
    } = themeStyles;

    if (quranResults.length === 0) return null;

    const highlightText = (text: string, regex: RegExp | null) =>
        highlightSearchText(text, regex, theme);

    const groupedQuran = quranResults.reduce((acc, r) => {
        if (!acc[r.surah]) acc[r.surah] = { surahName: r.surahName, surahNameEn: r.surahNameEn, ayahs: [] };
        acc[r.surah].ayahs.push(r);
        return acc;
    }, {} as Record<number, { surahName: string, surahNameEn?: string, ayahs: any[] }>);
    const sortedQuranSurahs = Object.keys(groupedQuran).map(Number).sort((a, b) => a - b);

    const isLatinQuery = /[a-zA-Z]/.test(query);
    const normQ = normalizeArabic(query);
    const innerGap = '[\\u0610-\\u061A\\u064B-\\u065F\\u0670\\u06D6-\\u06ED\\u0640]*';
    const wordGap = '[\\s\\u0610-\\u061A\\u064B-\\u065F\\u0670\\u06D6-\\u06ED\\u0640]+';
    const wordsAr = normQ.split(/\s+/).filter(Boolean);
    const wordPatterns = wordsAr.map(w => {
        return w.split('').map(c => (
            c === 'ا' ? '[أإآٱا\\u0670]' :
            (c === 'ه' ? '[هة]' :
            (c === 'ي' ? '[يى]' : c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
        )).join(innerGap);
    });
    const highlightPattern = wordPatterns.join(wordGap);
    let activeRegex: RegExp | null = null;
    try {
        if (isEn || isLatinQuery) {
            const englishWords = query.toLowerCase().split(/\s+/).map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).filter(Boolean);
            if (englishWords.length > 0) activeRegex = new RegExp(`(${englishWords.join('|')})`, 'gi');
        } else if (highlightPattern) {
            activeRegex = new RegExp(highlightPattern, 'gi');
        }
    } catch (e) {
        activeRegex = null;
    }

    const countQuranItemMatches = (item: any) => {
        if (!activeRegex) return 1;
        const targetParts: string[] = [];
        if (isLatinQuery || sourceReadingMode === 'translation' || (isEn && sourceReadingMode !== 'bilingual')) {
            if (item.textEn) targetParts.push(item.textEn);
        } else {
            if (item.text) targetParts.push(item.text);
            if (sourceReadingMode === 'tafseer' && item.tafseerText) targetParts.push(item.tafseerText);
            if (sourceReadingMode === 'meanings' && item.meaningsText) targetParts.push(item.meaningsText);
        }
        const combined = targetParts.join(' ');
        const matches = combined.match(activeRegex);
        return matches ? Math.max(matches.length, 1) : 1;
    };

    const totalQuranWordOccurrences = quranResults.reduce((acc, item) => acc + countQuranItemMatches(item), 0);
    const targetReadingMode = sourceReadingMode || (isEn ? 'translation' : undefined);
    const quranSectionHeading = isEn
        ? (readingModeLabel ? `The Holy Quran (${readingModeLabel})` : 'The Holy Quran')
        : (readingModeLabel ? `القرآن الكريم (${readingModeLabel})` : 'القرآن الكريم');

    const renderQuranResultContent = (r: any) => {
        if (sourceReadingMode === 'bilingual') {
            return (
                <div className="space-y-2">
                    <div className="font-amiri-quran text-base leading-loose text-right" dir="rtl">
                        {highlightText(r.text, isLatinQuery ? null : r.highlightRegex)}
                    </div>
                    {r.textEn && (
                        <div className="text-sm font-medium opacity-85 leading-relaxed text-left border-t border-dashed pt-2" style={{ color: theme.textColor, borderColor: `${theme.accent || '#888'}33` }} dir="ltr">
                            {highlightText(r.textEn, isLatinQuery ? r.highlightRegex : null)}
                        </div>
                    )}
                </div>
            );
        }
        if (sourceReadingMode === 'translation' || isEn) {
            return (
                <div className="space-y-1.5">
                    <div className="text-sm font-medium leading-relaxed" style={{ color: theme.textColor }}>
                        {highlightText(r.textEn || r.text, r.highlightRegex)}
                    </div>
                    {sourceReadingMode !== 'translation' && (
                        <div className="font-amiri-quran text-sm opacity-70 leading-loose text-right" dir="rtl">
                            {r.text}
                        </div>
                    )}
                </div>
            );
        }
        if (sourceReadingMode === 'tafseer') {
            return (
                <div className="space-y-2" dir="rtl">
                    <div className="font-amiri-quran text-base leading-loose">
                        {highlightText(r.text, r.highlightRegex)}
                    </div>
                    {r.tafseerText && (
                        <div className="text-xs sm:text-sm opacity-85 leading-relaxed border-t border-dashed pt-2" style={{ color: theme.textColor, borderColor: `${theme.accent || '#888'}33` }}>
                            <span className="font-bold ml-1.5" style={{ color: theme.accent || theme.palette?.[0] }}>التفسير:</span>
                            {highlightText(r.tafseerText, r.highlightRegex)}
                        </div>
                    )}
                </div>
            );
        }
        if (sourceReadingMode === 'meanings') {
            return (
                <div className="space-y-2" dir="rtl">
                    <div className="font-amiri-quran text-base leading-loose">
                        {highlightText(r.text, r.highlightRegex)}
                    </div>
                    {r.meaningsText && (
                        <div className="text-xs sm:text-sm opacity-85 leading-relaxed border-t border-dashed pt-2" style={{ color: theme.textColor, borderColor: `${theme.accent || '#888'}33` }}>
                            <span className="font-bold ml-1.5" style={{ color: theme.accent || theme.palette?.[0] }}>المعاني:</span>
                            {highlightText(r.meaningsText, r.highlightRegex)}
                        </div>
                    )}
                </div>
            );
        }
        return (
            <div className="font-amiri-quran text-base leading-loose" dir="rtl">
                {highlightText(r.text, r.highlightRegex)}
            </div>
        );
    };

    const renderSurahGroups = (expandedListBg: string, outerExtraClass: string) => (
        <>
            {sortedQuranSurahs.map(surahNum => {
                const group = groupedQuran[surahNum];
                const isExpanded = expandedSurahs[surahNum];
                const rawArSurahName = (group.surahName || '').trim();
                const surahDisplayName = isEn
                    ? `Surah ${group.surahNameEn || SURAH_NAMES_EN[surahNum - 1] || rawArSurahName}`
                    : (rawArSurahName.startsWith('سورة') || rawArSurahName.startsWith('سُورَة')
                        ? rawArSurahName
                        : `سورة ${rawArSurahName}`);
                const surahWordOccurrences = group.ayahs.reduce((acc: number, item: any) => acc + countQuranItemMatches(item), 0);
                return (
                    <div key={surahNum} className={`rounded-2xl ${card3DClass} overflow-hidden border-0 ${outerExtraClass}`} style={itemCardStyle('rgba(255,255,255,0.04)')}>
                        <button
                            onClick={() => toggleSurah(surahNum)}
                            className={`w-full flex justify-between items-center p-3.5 transition-all ${btn3DClass} border-0 rounded-2xl cursor-pointer`}
                            style={itemCardStyle('rgba(255,255,255,0.06)')}
                        >
                            <h4 className={`${isEn ? 'font-bold' : 'font-amiri-quran'} text-base font-bold`} style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
                                {surahDisplayName}
                            </h4>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${inner3DClass} border-0`} style={badge3DStyle}>
                                    {isEn ? (
                                        surahWordOccurrences > group.ayahs.length
                                            ? `${group.ayahs.length} Ayahs (${surahWordOccurrences} matches)`
                                            : `${group.ayahs.length} Ayahs`
                                    ) : (
                                        surahWordOccurrences > group.ayahs.length
                                            ? `${toArabic(group.ayahs.length)} آية (وردت ${toArabic(surahWordOccurrences)} مرة)`
                                            : `${toArabic(group.ayahs.length)} آية`
                                    )}
                                </span>
                                <ChevronLeft className={`w-4 h-4 transition-transform ${icon3DClass} ${isExpanded ? (isEn ? 'rotate-90' : '-rotate-90') : (isEn ? 'rotate-180' : '')}`} />
                            </div>
                        </button>

                        {isExpanded && (
                            <div className="p-2.5 space-y-2.5" style={{ backgroundColor: expandedListBg }}>
                                {group.ayahs.map((r, idx) => (
                                    <button
                                        key={`quran-${surahNum}-${idx}`}
                                        className={`w-full ${isEn ? 'text-left' : 'text-right'} p-3.5 rounded-2xl ${card3DClass} border-0 transition-all cursor-pointer`}
                                        style={itemCardStyle('rgba(255,255,255,0.05)')}
                                        onClick={() => handleResultClick(isQuranLandscape ? 'quran-landscape' : 'quran', { surah: r.surah, ayah: r.ayah, readingMode: targetReadingMode, fromGlobalSearch: true, skipSavePosition: true })}
                                    >
                                        <div className="text-[11px] opacity-60 mb-1.5 flex items-center gap-1.5 font-bold">
                                            <span>{isEn ? `Verse ${r.ayah}` : `آية ${toArabic(r.ayah)}`}</span>
                                            <span>•</span>
                                            <span>{isEn ? `Juz ${r.juz}` : `جزء ${toArabic(r.juz)}`}</span>
                                            <span>•</span>
                                            <span>{isEn ? `Page ${r.page}` : `صفحة ${toArabic(r.page)}`}</span>
                                        </div>
                                        {renderQuranResultContent(r)}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </>
    );

    return (
        <div className="space-y-3">
            {isAllSelected ? (
                <div className={`mb-3 rounded-2xl ${card3DClass} overflow-hidden border-0`} style={headerCardStyle('rgba(255,255,255,0.03)')}>
                    <button
                        onClick={onToggleCategory}
                        className={`w-full flex justify-between items-center p-4 transition-all ${btn3DClass} border-0 rounded-2xl cursor-pointer`}
                        style={headerCardStyle('rgba(255,255,255,0.06)')}
                    >
                        <h4 className="font-bold text-base flex items-center gap-2.5" style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
                            <BookOpen className={`w-5 h-5 ${icon3DClass}`} />
                            {quranSectionHeading}
                        </h4>
                        <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${inner3DClass} border-0`} style={badge3DStyle}>
                                {isEn ? (
                                    totalQuranWordOccurrences > quranResults.length
                                        ? `${quranResults.length} Ayahs (${totalQuranWordOccurrences} matches)`
                                        : `${quranResults.length} Ayahs`
                                ) : (
                                    totalQuranWordOccurrences > quranResults.length
                                        ? `${toArabic(quranResults.length)} آية (وردت ${toArabic(totalQuranWordOccurrences)} مرة)`
                                        : `${toArabic(quranResults.length)} آية`
                                )}
                            </span>
                            <ChevronLeft className={`w-5 h-5 transition-transform ${icon3DClass} ${isCategoryExpanded ? (isEn ? 'rotate-90' : '-rotate-90') : (isEn ? 'rotate-180' : '')}`} />
                        </div>
                    </button>
                    {isCategoryExpanded && (
                        <div className="p-3 space-y-2.5" style={{ backgroundColor: theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.015)' }}>
                            {renderSurahGroups(theme.isDark ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.01)', 'mb-2')}
                        </div>
                    )}
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-2.5 mb-2 px-1">
                        <span className={`p-2 rounded-xl ${inner3DClass} border-0`} style={sectionIconStyle}>
                            <BookOpen className={`w-4 h-4 ${icon3DClass}`} />
                        </span>
                        <h3 className="font-bold text-sm opacity-90" style={{ color: theme.textColor }}>
                            {isEn ? (
                                totalQuranWordOccurrences > quranResults.length
                                    ? `${quranSectionHeading} (${quranResults.length} Ayahs - ${totalQuranWordOccurrences} matches)`
                                    : `${quranSectionHeading} (${quranResults.length} Ayahs)`
                            ) : (
                                totalQuranWordOccurrences > quranResults.length
                                    ? `${quranSectionHeading} (${toArabic(quranResults.length)} آية - وردت ${toArabic(totalQuranWordOccurrences)} مرة)`
                                    : `${quranSectionHeading} (${toArabic(quranResults.length)} آية)`
                            )}
                        </h3>
                    </div>
                    {renderSurahGroups(theme.isDark ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.015)', 'mb-2.5')}
                </>
            )}
        </div>
    );
};

export default QuranSearchSection;
