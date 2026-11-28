import React from 'react';
import { Search } from 'lucide-react';
import type { GlobalSearchThemeStyles } from './globalSearchTheme';
import type { SearchSectionOption } from './GlobalSearchHeader';
import QuranSearchSection from './results/QuranSearchSection';
import WorshipSearchSections from './results/WorshipSearchSections';
import KnowledgeSearchSections from './results/KnowledgeSearchSections';

interface GlobalSearchResultsProps {
    isEn: boolean;
    isFromQuran: boolean;
    isQuranLandscape: boolean;
    sourceReadingMode?: string;
    readingModeLabel: string;
    query: string;
    isSearching: boolean;
    totalResults: number;
    selectedSections: string[];
    sectionsList: SearchSectionOption[];
    quranResults: any[];
    athkarResults: any[];
    salahAthkarResults: any[];
    duaResults: any[];
    ruqyahResults: any[];
    hisnResults: any[];
    nawawiResults: any[];
    asmaulHusnaResults: any[];
    seerahResults: any[];
    hajjUmrahResults: any[];
    tenPromisedResults: any[];
    divineMiraclesResults: any[];
    expandedSurahs: Record<number, boolean>;
    toggleSurah: (surahNum: number) => void;
    expandedCategories: Record<string, boolean>;
    setExpandedCategories: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    handleResultClick: (pageId: string, params?: any) => void;
    themeStyles: GlobalSearchThemeStyles;
    s3d: any;
}

const GlobalSearchResults: React.FC<GlobalSearchResultsProps> = ({
    isEn,
    isFromQuran,
    isQuranLandscape,
    sourceReadingMode,
    readingModeLabel,
    query,
    isSearching,
    totalResults,
    selectedSections,
    sectionsList,
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
    expandedSurahs,
    toggleSurah,
    expandedCategories,
    setExpandedCategories,
    handleResultClick,
    themeStyles,
    s3d,
}) => {
    const { theme, card3DClass, icon3DClass, headerCardStyle } = themeStyles;

    if (isSearching) {
        return (
            <div className="flex flex-col items-center justify-center py-20 opacity-60">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 mb-4" style={{ borderBottomColor: theme.accent || theme.palette[0] }}></div>
                <p className="font-bold">{isEn ? "Searching..." : "جاري البحث الشامل..."}</p>
            </div>
        );
    }

    const isAllSelected = selectedSections.includes('all') || selectedSections.length === 0;

    if (query && totalResults === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <div
                    className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-5 ${card3DClass} border-0`}
                    style={headerCardStyle('rgba(255,255,255,0.06)')}
                >
                    <Search className={`w-10 h-10 ${icon3DClass} opacity-60`} style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }} />
                </div>
                <p className="font-bold text-sm sm:text-base opacity-75" style={{ color: theme.textColor }}>
                    {isAllSelected
                        ? (isEn ? "No results found for your search" : "لا توجد نتائج لبحثك في جميع صفحات التطبيق")
                        : (isEn ? "No results found in the selected sections" : "لا توجد نتائج لبحثك في الأقسام المحددة")}
                </p>
            </div>
        );
    }

    if (!query) {
        const activeSectionLabels = selectedSections
            .filter(id => id !== 'all')
            .map(id => sectionsList.find(s => s.id === id)?.label)
            .filter(Boolean)
            .join('، ');

        return (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <p className="font-semibold text-xs sm:text-sm leading-relaxed opacity-35 max-w-md select-none" style={{ color: theme.textColor }}>
                    {isAllSelected ? (
                        isEn ? (
                            <>
                                Search across all application sections:<br/>
                                Quran, Adhkar, Prayers, Supplications, Ruqyah, Hisn Al-Muslim, Seerah, Asmaul Husna, Hajj & Umrah, Ten Promised Paradise, and Divine Miracles.
                            </>
                        ) : (
                            <>
                                ابحث في جميع أقسام وصفحات التطبيق:<br/>
                                القرآن الكريم، الأذكار، أذكار الصلاة، الأدعية والرقية الشرعية، حصن المسلم، أسماء الله الحسنى، السيرة النبوية، الحج والعمرة، العشرة المبشرون بالجنة، والمعجزات الإلهية.
                            </>
                        )
                    ) : (
                        isEn ? (
                            <>
                                Search scope limited to: <span className="underline decoration-2" style={{ color: theme.accent || theme.palette[0] }}>{activeSectionLabels}</span>.<br/>
                                Type any word or phrase to search within these sections, or select "All Sections" to search globally.
                            </>
                        ) : (
                            <>
                                البحث مخصص في الأقسام: <span className="underline decoration-2" style={{ color: theme.accent || theme.palette[0] }}>{activeSectionLabels}</span>.<br/>
                                اكتب أي كلمة أو عبارة للبحث داخل هذه الأقسام، أو اختر "كل الأقسام" للبحث الشامل.
                            </>
                        )
                    )}
                </p>
            </div>
        );
    }

    const showQuran = isAllSelected || selectedSections.includes('quran');
    const showAthkar = isAllSelected || selectedSections.includes('athkar');
    const showSalahAthkar = isAllSelected || selectedSections.includes('salahAthkar');
    const showDua = isAllSelected || selectedSections.includes('dua');
    const showRuqyah = isAllSelected || selectedSections.includes('ruqyah');
    const showHisn = isAllSelected || selectedSections.includes('hisn');
    const showNawawi = isAllSelected || selectedSections.includes('nawawi');
    const showAsmaulHusna = isAllSelected || selectedSections.includes('asmaulHusna');
    const showSeerah = isAllSelected || selectedSections.includes('seerah');
    const showHajjUmrah = isAllSelected || selectedSections.includes('hajjUmrah');
    const showTenPromised = isAllSelected || selectedSections.includes('tenPromised');
    const showDivineMiracles = isAllSelected || selectedSections.includes('divineMiracles');

    return (
        <div className="space-y-4">
            {showQuran && (
                <QuranSearchSection
                    isEn={isEn}
                    isFromQuran={isFromQuran}
                    isQuranLandscape={isQuranLandscape}
                    isAllSelected={isAllSelected}
                    sourceReadingMode={sourceReadingMode}
                    readingModeLabel={readingModeLabel}
                    query={query}
                    quranResults={quranResults}
                    expandedSurahs={expandedSurahs}
                    toggleSurah={toggleSurah}
                    isCategoryExpanded={expandedCategories.quran}
                    onToggleCategory={() => setExpandedCategories(p => ({ ...p, quran: !p.quran }))}
                    handleResultClick={handleResultClick}
                    themeStyles={themeStyles}
                    s3d={s3d}
                />
            )}

            <WorshipSearchSections
                isEn={isEn}
                isFromQuran={isFromQuran}
                isAllSelected={isAllSelected}
                showAthkar={showAthkar}
                showSalahAthkar={showSalahAthkar}
                showDua={showDua}
                showRuqyah={showRuqyah}
                showHisn={showHisn}
                athkarResults={athkarResults}
                salahAthkarResults={salahAthkarResults}
                duaResults={duaResults}
                ruqyahResults={ruqyahResults}
                hisnResults={hisnResults}
                expandedCategories={expandedCategories}
                setExpandedCategories={setExpandedCategories}
                handleResultClick={handleResultClick}
                themeStyles={themeStyles}
                s3d={s3d}
            />

            <KnowledgeSearchSections
                isEn={isEn}
                isFromQuran={isFromQuran}
                isAllSelected={isAllSelected}
                showNawawi={showNawawi}
                showAsmaulHusna={showAsmaulHusna}
                showSeerah={showSeerah}
                showHajjUmrah={showHajjUmrah}
                showTenPromised={showTenPromised}
                showDivineMiracles={showDivineMiracles}
                nawawiResults={nawawiResults}
                asmaulHusnaResults={asmaulHusnaResults}
                seerahResults={seerahResults}
                hajjUmrahResults={hajjUmrahResults}
                tenPromisedResults={tenPromisedResults}
                divineMiraclesResults={divineMiraclesResults}
                expandedCategories={expandedCategories}
                setExpandedCategories={setExpandedCategories}
                handleResultClick={handleResultClick}
                themeStyles={themeStyles}
                s3d={s3d}
            />
        </div>
    );
};

export default GlobalSearchResults;
