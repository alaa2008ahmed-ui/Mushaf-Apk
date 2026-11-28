import React from 'react';
import { BookOpen, Sparkles, UserCheck, Compass, Users } from 'lucide-react';
import { toArabic } from '../../QuranReader/constants';
import type { GlobalSearchThemeStyles } from '../globalSearchTheme';
import { highlightSearchText, CategoryResultShell } from './searchResultsShared';

interface KnowledgeSearchSectionsProps {
    isEn: boolean;
    isFromQuran: boolean;
    isAllSelected: boolean;
    showNawawi: boolean;
    showAsmaulHusna: boolean;
    showSeerah: boolean;
    showHajjUmrah: boolean;
    showTenPromised: boolean;
    showDivineMiracles: boolean;
    nawawiResults: any[];
    asmaulHusnaResults: any[];
    seerahResults: any[];
    hajjUmrahResults: any[];
    tenPromisedResults: any[];
    divineMiraclesResults: any[];
    expandedCategories: Record<string, boolean>;
    setExpandedCategories: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    handleResultClick: (pageId: string, params?: any) => void;
    themeStyles: GlobalSearchThemeStyles;
    s3d: any;
}

const KnowledgeSearchSections: React.FC<KnowledgeSearchSectionsProps> = ({
    isEn,
    isFromQuran,
    isAllSelected,
    showNawawi,
    showAsmaulHusna,
    showSeerah,
    showHajjUmrah,
    showTenPromised,
    showDivineMiracles,
    nawawiResults,
    asmaulHusnaResults,
    seerahResults,
    hajjUmrahResults,
    tenPromisedResults,
    divineMiraclesResults,
    expandedCategories,
    setExpandedCategories,
    handleResultClick,
    themeStyles,
    s3d,
}) => {
    const { theme, card3DClass, icon3DClass, itemCardStyle } = themeStyles;
    const highlightText = (text: string, regex: RegExp | null) =>
        highlightSearchText(text, regex, theme);

    return (
        <>
            {/* 7. An-Nawawi 40 Hadiths */}
            {showNawawi && nawawiResults.length > 0 && (
                <CategoryResultShell
                    isAllSelected={isAllSelected}
                    isExpanded={expandedCategories.nawawi}
                    onToggle={() => setExpandedCategories(p => ({ ...p, nawawi: !p.nawawi }))}
                    isEn={isEn}
                    isFromQuran={isFromQuran}
                    themeStyles={themeStyles}
                    s3d={s3d}
                    icon={<BookOpen className={`w-5 h-5 ${icon3DClass}`} />}
                    flatIcon={<BookOpen className={`w-4 h-4 ${icon3DClass}`} />}
                    allTitle={isEn ? "An-Nawawi's 40 Hadiths" : "الأربعون النووية"}
                    flatTitle={isEn ? `An-Nawawi's 40 Hadiths (${nawawiResults.length})` : `الأربعون النووية (${toArabic(nawawiResults.length)})`}
                    badgeLabel={isEn ? nawawiResults.length : toArabic(nawawiResults.length)}
                >
                    {nawawiResults.map((r, idx) => (
                        <button
                            key={`nawawi-${idx}`}
                            className={`w-full ${isEn ? 'text-left' : 'text-right'} ${isAllSelected ? 'p-3.5' : 'p-4 mb-2.5'} rounded-2xl ${card3DClass} border-0 transition-all cursor-pointer`}
                            style={itemCardStyle('rgba(255,255,255,0.05)')}
                            onClick={() => handleResultClick('nawawi', { hadithId: r.id })}
                        >
                            <div className={`${isAllSelected ? 'text-[11px] mb-1' : 'text-xs mb-2'} opacity-80 font-bold`} style={{ color: theme.textColor }}>
                                {r.title}
                            </div>
                            <div className={`font-qalam text-base leading-relaxed ${isAllSelected ? 'line-clamp-2' : ''}`} style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
                                {r.hadith}
                            </div>
                        </button>
                    ))}
                </CategoryResultShell>
            )}

            {/* 8. Asmaul Husna */}
            {showAsmaulHusna && asmaulHusnaResults.length > 0 && (
                <CategoryResultShell
                    isAllSelected={isAllSelected}
                    isExpanded={expandedCategories.asmaulHusna}
                    onToggle={() => setExpandedCategories(p => ({ ...p, asmaulHusna: !p.asmaulHusna }))}
                    isEn={isEn}
                    isFromQuran={isFromQuran}
                    themeStyles={themeStyles}
                    s3d={s3d}
                    icon={<Sparkles className={`w-5 h-5 ${icon3DClass}`} />}
                    flatIcon={<Sparkles className={`w-4 h-4 ${icon3DClass}`} />}
                    allTitle={isEn ? "Names of Allah (Asmaul Husna)" : "أسماء الله الحسنى"}
                    flatTitle={isEn ? `Names of Allah (${asmaulHusnaResults.length})` : `أسماء الله الحسنى (${toArabic(asmaulHusnaResults.length)})`}
                    badgeLabel={isEn ? asmaulHusnaResults.length : toArabic(asmaulHusnaResults.length)}
                >
                    {asmaulHusnaResults.map((r, idx) => (
                        <button
                            key={`asmaulHusna-${idx}`}
                            className={`w-full ${isEn ? 'text-left' : 'text-right'} ${isAllSelected ? 'p-3.5' : 'p-4 mb-2.5'} rounded-2xl ${card3DClass} border-0 transition-all cursor-pointer`}
                            style={itemCardStyle('rgba(255,255,255,0.05)')}
                            onClick={() => handleResultClick('asma-allah', { nameId: r.id })}
                        >
                            <div className={`font-bold ${isAllSelected ? 'text-base mb-1' : 'text-lg mb-1.5'}`} style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
                                {r.name} {isEn && `(${r.transliteration})`}
                            </div>
                            <div className={`${isAllSelected ? 'text-xs line-clamp-2' : 'text-sm mb-2'} leading-relaxed opacity-80`} style={{ color: theme.textColor }}>
                                {highlightText(isEn ? r.meaningEn : r.meaning, r.highlightRegex)}
                            </div>
                            {!isAllSelected && r.evidence && (
                                <div className="text-xs opacity-60 font-bold border-t pt-2 mt-2 border-black/10 dark:border-white/10">
                                    {isEn ? (r.evidenceEn || r.evidence) : r.evidence}
                                </div>
                            )}
                        </button>
                    ))}
                </CategoryResultShell>
            )}

            {/* 9. Prophetic Seerah */}
            {showSeerah && seerahResults.length > 0 && (
                <CategoryResultShell
                    isAllSelected={isAllSelected}
                    isExpanded={expandedCategories.seerah}
                    onToggle={() => setExpandedCategories(p => ({ ...p, seerah: !p.seerah }))}
                    isEn={isEn}
                    isFromQuran={isFromQuran}
                    themeStyles={themeStyles}
                    s3d={s3d}
                    icon={<UserCheck className={`w-5 h-5 ${icon3DClass}`} />}
                    flatIcon={<UserCheck className={`w-4 h-4 ${icon3DClass}`} />}
                    allTitle={isEn ? "Prophetic Seerah" : "السيرة النبوية الشريفة"}
                    flatTitle={isEn ? `Prophetic Seerah (${seerahResults.length})` : `السيرة النبوية (${toArabic(seerahResults.length)})`}
                    badgeLabel={isEn ? seerahResults.length : toArabic(seerahResults.length)}
                >
                    {seerahResults.map((r, idx) => (
                        <button
                            key={`seerah-${idx}`}
                            className={`w-full ${isEn ? 'text-left' : 'text-right'} ${isAllSelected ? 'p-3.5' : 'p-4 mb-2.5'} rounded-2xl ${card3DClass} border-0 transition-all cursor-pointer`}
                            style={itemCardStyle('rgba(255,255,255,0.05)')}
                            onClick={() => handleResultClick('prophetic-seerah', { eventId: r.id })}
                        >
                            <div className={`${isAllSelected ? 'text-[11px] opacity-75 mb-1' : 'text-sm opacity-90 mb-1.5'} font-bold`} style={{ color: theme.textColor }}>
                                {r.title}
                            </div>
                            <div className={`text-xs leading-relaxed opacity-80 ${isAllSelected ? 'line-clamp-2' : ''}`} style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
                                {highlightText(r.summary || r.situation || r.details, r.highlightRegex)}
                            </div>
                        </button>
                    ))}
                </CategoryResultShell>
            )}

            {/* 10. Hajj & Umrah */}
            {showHajjUmrah && hajjUmrahResults.length > 0 && (
                <CategoryResultShell
                    isAllSelected={isAllSelected}
                    isExpanded={expandedCategories.hajjUmrah}
                    onToggle={() => setExpandedCategories(p => ({ ...p, hajjUmrah: !p.hajjUmrah }))}
                    isEn={isEn}
                    isFromQuran={isFromQuran}
                    themeStyles={themeStyles}
                    s3d={s3d}
                    icon={<Compass className={`w-5 h-5 ${icon3DClass}`} />}
                    flatIcon={<Compass className={`w-4 h-4 ${icon3DClass}`} />}
                    allTitle={isEn ? "Hajj & Umrah" : "الحج والعمرة"}
                    flatTitle={isEn ? `Hajj & Umrah (${hajjUmrahResults.length})` : `الحج والعمرة (${toArabic(hajjUmrahResults.length)})`}
                    badgeLabel={isEn ? hajjUmrahResults.length : toArabic(hajjUmrahResults.length)}
                >
                    {hajjUmrahResults.map((r, idx) => (
                        <button
                            key={`hajjUmrah-${idx}`}
                            className={`w-full ${isEn ? 'text-left' : 'text-right'} ${isAllSelected ? 'p-3.5' : 'p-4 mb-2.5'} rounded-2xl ${card3DClass} border-0 transition-all cursor-pointer`}
                            style={itemCardStyle('rgba(255,255,255,0.05)')}
                            onClick={() => handleResultClick('hajj-umrah', { screen: r.section || 'umrah', title: r.title })}
                        >
                            <div className={`${isAllSelected ? 'text-[11px] mb-1' : 'text-xs mb-2'} font-bold opacity-80`} style={{ color: theme.textColor }}>
                                {r.title}
                            </div>
                            <div className={`text-xs leading-relaxed opacity-80 ${isAllSelected ? 'line-clamp-2' : ''}`} style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
                                {highlightText(r.text || r.subtitle || r.explanation, r.highlightRegex)}
                            </div>
                        </button>
                    ))}
                </CategoryResultShell>
            )}

            {/* 11. Ten Promised Paradise */}
            {showTenPromised && tenPromisedResults.length > 0 && (
                <CategoryResultShell
                    isAllSelected={isAllSelected}
                    isExpanded={expandedCategories.tenPromised}
                    onToggle={() => setExpandedCategories(p => ({ ...p, tenPromised: !p.tenPromised }))}
                    isEn={isEn}
                    isFromQuran={isFromQuran}
                    themeStyles={themeStyles}
                    s3d={s3d}
                    icon={<Users className={`w-5 h-5 ${icon3DClass}`} />}
                    flatIcon={<Users className={`w-4 h-4 ${icon3DClass}`} />}
                    allTitle={isEn ? "Ten Promised Paradise" : "العشرة المبشرون بالجنة"}
                    flatTitle={isEn ? `Ten Promised Paradise (${tenPromisedResults.length})` : `العشرة المبشرون بالجنة (${toArabic(tenPromisedResults.length)})`}
                    badgeLabel={isEn ? tenPromisedResults.length : toArabic(tenPromisedResults.length)}
                >
                    {tenPromisedResults.map((r, idx) => (
                        <button
                            key={`tenPromised-${idx}`}
                            className={`w-full ${isEn ? 'text-left' : 'text-right'} ${isAllSelected ? 'p-3.5' : 'p-4 mb-2.5'} rounded-2xl ${card3DClass} border-0 transition-all cursor-pointer`}
                            style={itemCardStyle('rgba(255,255,255,0.05)')}
                            onClick={() => handleResultClick('ten-promised', { companionId: r.id })}
                        >
                            <div className={`font-bold ${isAllSelected ? 'text-sm mb-1' : 'text-base mb-1.5'}`} style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
                                {isEn ? r.nameEn : r.nameAr}
                            </div>
                            <div className={`text-xs leading-relaxed opacity-80 ${isAllSelected ? 'line-clamp-2' : 'mb-2'}`} style={{ color: theme.textColor }}>
                                {isAllSelected
                                    ? highlightText(isEn ? (r.titleBadgeEn || r.hadithEn) : (r.titleBadgeAr || r.hadithAr), r.highlightRegex)
                                    : highlightText(isEn ? r.titleBadgeEn : r.titleBadgeAr, r.highlightRegex)}
                            </div>
                            {!isAllSelected && (r.hadithAr || r.hadithEn) && (
                                <div className="text-xs opacity-70 font-semibold border-t pt-2 mt-2 border-black/10 dark:border-white/10">
                                    {highlightText(isEn ? r.hadithEn : r.hadithAr, r.highlightRegex)}
                                </div>
                            )}
                        </button>
                    ))}
                </CategoryResultShell>
            )}

            {/* 12. Divine Miracles */}
            {showDivineMiracles && divineMiraclesResults.length > 0 && (
                <CategoryResultShell
                    isAllSelected={isAllSelected}
                    isExpanded={expandedCategories.divineMiracles}
                    onToggle={() => setExpandedCategories(p => ({ ...p, divineMiracles: !p.divineMiracles }))}
                    isEn={isEn}
                    isFromQuran={isFromQuran}
                    themeStyles={themeStyles}
                    s3d={s3d}
                    icon={<Sparkles className={`w-5 h-5 ${icon3DClass}`} />}
                    flatIcon={<Sparkles className={`w-4 h-4 ${icon3DClass}`} />}
                    allTitle={isEn ? "Divine Miracles" : "المعجزات الإلهية"}
                    flatTitle={isEn ? `Divine Miracles (${divineMiraclesResults.length})` : `المعجزات الإلهية (${toArabic(divineMiraclesResults.length)})`}
                    badgeLabel={isEn ? divineMiraclesResults.length : toArabic(divineMiraclesResults.length)}
                >
                    {divineMiraclesResults.map((r, idx) => (
                        <button
                            key={`divineMiracles-${idx}`}
                            className={`w-full ${isEn ? 'text-left' : 'text-right'} ${isAllSelected ? 'p-3.5' : 'p-4 mb-2.5'} rounded-2xl ${card3DClass} border-0 transition-all cursor-pointer`}
                            style={itemCardStyle('rgba(255,255,255,0.05)')}
                            onClick={() => handleResultClick('divine-miracles', { highlightId: r.id, itemId: r.id })}
                        >
                            <div className={`font-bold ${isAllSelected ? 'text-sm mb-1' : 'text-base mb-1.5'}`} style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
                                {isEn ? r.titleEn : r.titleAr}
                            </div>
                            <div className={`text-xs leading-relaxed opacity-80 ${isAllSelected ? 'line-clamp-2' : 'mb-2'}`} style={{ color: theme.textColor }}>
                                {isAllSelected
                                    ? highlightText(isEn ? (r.summaryEn || r.badgeEn) : (r.summaryAr || r.badgeAr), r.highlightRegex)
                                    : highlightText(isEn ? r.summaryEn : r.summaryAr, r.highlightRegex)}
                            </div>
                            {!isAllSelected && (r.badgeAr || r.badgeEn) && (
                                <div className="text-xs opacity-70 font-semibold border-t pt-2 mt-2 border-black/10 dark:border-white/10">
                                    {isEn ? r.badgeEn : r.badgeAr}
                                </div>
                            )}
                        </button>
                    ))}
                </CategoryResultShell>
            )}
        </>
    );
};

export default KnowledgeSearchSections;
