import React from 'react';
import { BookOpen, Sun, Moon, Heart, Shield, CheckCircle2 } from 'lucide-react';
import { toArabic } from '../../QuranReader/constants';
import type { GlobalSearchThemeStyles } from '../globalSearchTheme';
import { highlightSearchText, CategoryResultShell } from './searchResultsShared';

interface WorshipSearchSectionsProps {
    isEn: boolean;
    isFromQuran: boolean;
    isAllSelected: boolean;
    showAthkar: boolean;
    showSalahAthkar: boolean;
    showDua: boolean;
    showRuqyah: boolean;
    showHisn: boolean;
    athkarResults: any[];
    salahAthkarResults: any[];
    duaResults: any[];
    ruqyahResults: any[];
    hisnResults: any[];
    expandedCategories: Record<string, boolean>;
    setExpandedCategories: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    handleResultClick: (pageId: string, params?: any) => void;
    themeStyles: GlobalSearchThemeStyles;
    s3d: any;
}

const WorshipSearchSections: React.FC<WorshipSearchSectionsProps> = ({
    isEn,
    isFromQuran,
    isAllSelected,
    showAthkar,
    showSalahAthkar,
    showDua,
    showRuqyah,
    showHisn,
    athkarResults,
    salahAthkarResults,
    duaResults,
    ruqyahResults,
    hisnResults,
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
            {/* 2. Morning/Evening Athkar */}
            {showAthkar && athkarResults.length > 0 && (
                <CategoryResultShell
                    isAllSelected={isAllSelected}
                    isExpanded={expandedCategories.athkar}
                    onToggle={() => setExpandedCategories(p => ({ ...p, athkar: !p.athkar }))}
                    isEn={isEn}
                    isFromQuran={isFromQuran}
                    themeStyles={themeStyles}
                    s3d={s3d}
                    icon={<Sun className={`w-5 h-5 ${icon3DClass}`} />}
                    flatIcon={<Sun className={`w-4 h-4 ${icon3DClass}`} />}
                    allTitle={isEn ? "Daily Adhkar (Morning & Evening)" : "أذكار الصباح والمساء"}
                    flatTitle={isEn ? `Daily Adhkar (${athkarResults.length})` : `أذكار الصباح والمساء (${toArabic(athkarResults.length)})`}
                    badgeLabel={isEn ? athkarResults.length : toArabic(athkarResults.length)}
                >
                    {athkarResults.map((r, idx) => (
                        <button
                            key={`athkar-${idx}`}
                            className={`w-full ${isEn ? 'text-left' : 'text-right'} ${isAllSelected ? 'p-3.5' : 'p-4 mb-2.5'} rounded-2xl ${card3DClass} border-0 transition-all cursor-pointer`}
                            style={itemCardStyle('rgba(255,255,255,0.05)')}
                            onClick={() => handleResultClick('sabah-masaa', { kind: r.kind, id: r.id, text: r.text })}
                        >
                            <div className={`text-[10px] opacity-60 ${isAllSelected ? 'mb-1' : 'mb-2'} font-bold flex items-center gap-1.5`}>
                                {r.kind === 'morning'
                                    ? <Sun className={`w-3.5 h-3.5 ${icon3DClass}`} style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }} />
                                    : <Moon className={`w-3.5 h-3.5 ${icon3DClass}`} style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }} />}
                                <span>{r.kind === 'morning' ? (isEn ? 'Morning Adhkar' : 'أذكار الصباح') : (isEn ? 'Evening Adhkar' : 'أذكار المساء')}</span>
                            </div>
                            <div className={`${isEn ? 'text-sm font-medium' : 'font-qalam text-base'} leading-relaxed ${isAllSelected ? 'line-clamp-2' : 'mb-1'}`} style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
                                {highlightText(isEn ? (r.textEn || r.text) : r.text, r.highlightRegex)}
                            </div>
                            {(r.sourceEn || r.source) && (
                                <div className={`${isAllSelected ? 'text-[10px]' : 'text-xs'} opacity-60 font-bold mt-1`}>
                                    {isEn ? (r.sourceEn || r.source) : r.source}
                                </div>
                            )}
                        </button>
                    ))}
                </CategoryResultShell>
            )}

            {/* 3. Prayer Adhkar */}
            {showSalahAthkar && salahAthkarResults.length > 0 && (
                <CategoryResultShell
                    isAllSelected={isAllSelected}
                    isExpanded={expandedCategories.salahAthkar}
                    onToggle={() => setExpandedCategories(p => ({ ...p, salahAthkar: !p.salahAthkar }))}
                    isEn={isEn}
                    isFromQuran={isFromQuran}
                    themeStyles={themeStyles}
                    s3d={s3d}
                    icon={<CheckCircle2 className={`w-5 h-5 ${icon3DClass}`} />}
                    flatIcon={<CheckCircle2 className={`w-4 h-4 ${icon3DClass}`} />}
                    allTitle={isEn ? "Prayer Adhkar" : "أذكار الصلاة"}
                    flatTitle={isEn ? `Prayer Adhkar (${salahAthkarResults.length})` : `أذكار الصلاة (${toArabic(salahAthkarResults.length)})`}
                    badgeLabel={isEn ? salahAthkarResults.length : toArabic(salahAthkarResults.length)}
                >
                    {salahAthkarResults.map((r, idx) => (
                        <button
                            key={`salahAthkar-${idx}`}
                            className={`w-full ${isEn ? 'text-left' : 'text-right'} ${isAllSelected ? 'p-3.5' : 'p-4 mb-2.5'} rounded-2xl ${card3DClass} border-0 transition-all cursor-pointer`}
                            style={itemCardStyle('rgba(255,255,255,0.05)')}
                            onClick={() => handleResultClick('athkar-salah', { id: r.id, title: r.title, text: r.text })}
                        >
                            {r.title && (
                                <div className={`${isAllSelected ? 'text-[11px] mb-1' : 'text-xs mb-1.5'} font-bold opacity-75`} style={{ color: theme.textColor }}>
                                    {isEn ? (r.titleEn || r.title) : r.title}
                                </div>
                            )}
                            <div className={`${isEn ? 'text-sm font-medium' : 'font-qalam text-base'} leading-relaxed ${isAllSelected ? 'line-clamp-2' : 'mb-1'}`} style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
                                {highlightText(isEn ? (r.textEn || r.text) : r.text, r.highlightRegex)}
                            </div>
                        </button>
                    ))}
                </CategoryResultShell>
            )}

            {/* 4. Duas */}
            {showDua && duaResults.length > 0 && (
                <CategoryResultShell
                    isAllSelected={isAllSelected}
                    isExpanded={expandedCategories.dua}
                    onToggle={() => setExpandedCategories(p => ({ ...p, dua: !p.dua }))}
                    isEn={isEn}
                    isFromQuran={isFromQuran}
                    themeStyles={themeStyles}
                    s3d={s3d}
                    icon={<Heart className={`w-5 h-5 ${icon3DClass}`} />}
                    flatIcon={<Heart className={`w-4 h-4 ${icon3DClass}`} />}
                    allTitle={isEn ? "Supplications (Duas)" : "الأدعية"}
                    flatTitle={isEn ? `Supplications (${duaResults.length})` : `الأدعية (${toArabic(duaResults.length)})`}
                    badgeLabel={isEn ? duaResults.length : toArabic(duaResults.length)}
                >
                    {duaResults.map((r, idx) => (
                        <button
                            key={`dua-${idx}`}
                            className={`w-full ${isEn ? 'text-left' : 'text-right'} ${isAllSelected ? 'p-3.5' : 'p-4 mb-2.5'} rounded-2xl ${card3DClass} border-0 transition-all cursor-pointer`}
                            style={itemCardStyle('rgba(255,255,255,0.05)')}
                            onClick={() => handleResultClick('adia', { id: r.id, category: r.category, text: r.text })}
                        >
                            <div className={`${isEn ? 'text-sm font-medium' : 'font-qalam text-base'} leading-relaxed ${isAllSelected ? 'mb-1 line-clamp-2' : 'mb-2'}`} style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
                                {highlightText(isEn ? (r.textEn || r.text) : r.text, r.highlightRegex)}
                            </div>
                            <div className={`${isAllSelected ? 'text-[10px]' : 'text-xs'} opacity-60 font-bold`}>
                                {isEn ? (r.sourceEn || r.source) : r.source}
                            </div>
                        </button>
                    ))}
                </CategoryResultShell>
            )}

            {/* 5. Ruqyah Shariah */}
            {showRuqyah && ruqyahResults.length > 0 && (
                <CategoryResultShell
                    isAllSelected={isAllSelected}
                    isExpanded={expandedCategories.ruqyah}
                    onToggle={() => setExpandedCategories(p => ({ ...p, ruqyah: !p.ruqyah }))}
                    isEn={isEn}
                    isFromQuran={isFromQuran}
                    themeStyles={themeStyles}
                    s3d={s3d}
                    icon={<Shield className={`w-5 h-5 ${icon3DClass}`} />}
                    flatIcon={<Shield className={`w-4 h-4 ${icon3DClass}`} />}
                    allTitle={isEn ? "Ruqyah Shariah" : "الرقية الشرعية"}
                    flatTitle={isEn ? `Ruqyah Shariah (${ruqyahResults.length})` : `الرقية الشرعية (${toArabic(ruqyahResults.length)})`}
                    badgeLabel={isEn ? ruqyahResults.length : toArabic(ruqyahResults.length)}
                >
                    {ruqyahResults.map((r, idx) => (
                        <button
                            key={`ruqyah-${idx}`}
                            className={`w-full ${isEn ? 'text-left' : 'text-right'} ${isAllSelected ? 'p-3.5' : 'p-4 mb-2.5'} rounded-2xl ${card3DClass} border-0 transition-all cursor-pointer`}
                            style={itemCardStyle('rgba(255,255,255,0.05)')}
                            onClick={() => handleResultClick('others', { section: 'ruqyah', highlightId: r.id, itemId: r.id })}
                        >
                            <div className={`${isAllSelected ? 'text-[11px] mb-1' : 'text-xs mb-2'} font-bold opacity-80`} style={{ color: theme.textColor }}>
                                {isEn ? (r.titleEn || r.title) : r.title}
                            </div>
                            <div className={`${isEn ? 'text-sm font-medium' : 'font-qalam text-base'} leading-relaxed ${isAllSelected ? 'line-clamp-2' : 'mb-1'}`} style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
                                {highlightText(isEn ? (r.textEn || r.text) : r.text, r.highlightRegex)}
                            </div>
                        </button>
                    ))}
                </CategoryResultShell>
            )}

            {/* 6. Hisn Al-Muslim */}
            {showHisn && hisnResults.length > 0 && (
                <CategoryResultShell
                    isAllSelected={isAllSelected}
                    isExpanded={expandedCategories.hisn}
                    onToggle={() => setExpandedCategories(p => ({ ...p, hisn: !p.hisn }))}
                    isEn={isEn}
                    isFromQuran={isFromQuran}
                    themeStyles={themeStyles}
                    s3d={s3d}
                    icon={<BookOpen className={`w-5 h-5 ${icon3DClass}`} />}
                    flatIcon={<BookOpen className={`w-4 h-4 ${icon3DClass}`} />}
                    allTitle={isEn ? "Hisn Al-Muslim" : "حصن المسلم"}
                    flatTitle={isEn ? `Hisn Al-Muslim (${hisnResults.length})` : `حصن المسلم (${toArabic(hisnResults.length)})`}
                    badgeLabel={isEn ? hisnResults.length : toArabic(hisnResults.length)}
                >
                    {hisnResults.map((r, idx) => (
                        <button
                            key={`hisn-${idx}`}
                            className={`w-full ${isEn ? 'text-left' : 'text-right'} ${isAllSelected ? 'p-3.5' : 'p-4 mb-2.5'} rounded-2xl ${card3DClass} border-0 transition-all cursor-pointer`}
                            style={itemCardStyle('rgba(255,255,255,0.05)')}
                            onClick={() => handleResultClick('hisn-muslim', { categoryId: r.categoryId, categoryTitle: r.categoryTitle, itemIndex: r.itemIndex, id: r.id, text: r.text })}
                        >
                            <div className={`${isEn ? 'text-sm font-medium' : 'font-qalam text-base'} leading-relaxed ${isAllSelected ? 'mb-1 line-clamp-2' : 'mb-2'}`} style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
                                {highlightText(isEn ? (r.textEn || r.text) : r.text, r.highlightRegex)}
                            </div>
                            <div className={`${isAllSelected ? 'text-[10px]' : 'text-xs'} opacity-60 font-bold`}>
                                {isEn ? (r.titleEn || r.title) : r.title}
                            </div>
                        </button>
                    ))}
                </CategoryResultShell>
            )}
        </>
    );
};

export default WorshipSearchSections;
