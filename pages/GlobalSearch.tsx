import React from 'react';
import { searchCache, clearSearchCache } from '../components/GlobalSearch/searchEngine';
import { useGlobalSearchPage } from '../components/GlobalSearch/useGlobalSearchPage';
import GlobalSearchHeader from '../components/GlobalSearch/GlobalSearchHeader';
import GlobalSearchResults from '../components/GlobalSearch/GlobalSearchResults';
import './QuranReader.css';

export { searchCache, clearSearchCache };

interface GlobalSearchProps {
    onBack: () => void;
    onNavigate: (pageId: string, params?: any) => void;
    navParams?: any;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ onBack, onNavigate, navParams }) => {
    const state = useGlobalSearchPage({ onBack, onNavigate, navParams });
    const {
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
    } = state;

    const { isQuranFlatSearch, theme, madinahVars } = themeStyles;

    return (
        <div
            id="global-search-page"
            className={`h-[100dvh] w-full flex flex-col relative overflow-hidden transition-colors ${isQuranFlatSearch ? 'madinah-flat-search font-cairo' : ''} ${isQuranLandscape ? 'global-search-landscape' : ''} ${theme.isDark ? 'dark' : ''}`}
            dir={isEn ? "ltr" : "rtl"}
            onPointerDownCapture={(e) => {
                const target = e.target as HTMLElement | null;
                if (target && searchBoxRef.current?.contains(target)) return;
                if (target?.closest('button, a, [role="button"], .cursor-pointer')) return;
                dismissKeyboard();
            }}
            onClickCapture={(e) => {
                const target = e.target as HTMLElement | null;
                if (target && searchBoxRef.current?.contains(target)) return;
                dismissKeyboard();
            }}
            style={{
                backgroundColor: theme.bgColor,
                ...(isQuranFlatSearch ? { fontFamily: "'Cairo', sans-serif" } : {}),
                ...madinahVars
            }}
        >
            <GlobalSearchHeader
                isEn={isEn}
                isFromQuran={isFromQuran}
                isQuranLandscape={isQuranLandscape}
                pageTitle={pageTitle}
                handleBack={handleBack}
                handleGoHome={handleGoHome}
                dismissKeyboard={dismissKeyboard}
                searchBoxRef={searchBoxRef}
                searchInputRef={searchInputRef}
                isKeyboardOpenRef={isKeyboardOpenRef}
                query={query}
                setQuery={setQuery}
                isAllSelected={isAllSelected}
                selectedSections={selectedSections}
                otherSections={otherSections}
                handleToggleSection={handleToggleSection}
                totalResults={totalResults}
                sectionCounts={sectionCounts}
                themeStyles={themeStyles}
                s3d={s3d}
            />

            {/* Content */}
            <div
                className="flex-1 min-h-0 overflow-y-auto app-scroll-safe w-full"
                dir={isEn ? "ltr" : "rtl"}
                onTouchMove={() => {
                    if (isKeyboardOpenRef.current || document.activeElement === searchInputRef.current) {
                        dismissKeyboard();
                    }
                }}
                style={{
                    backgroundColor: theme.bgColor
                }}
            >
                <div className={`mx-auto py-2 w-full ${isQuranLandscape ? 'global-search-results-inner max-w-none' : 'max-w-lg md:max-w-2xl px-4'}`}>
                    <GlobalSearchResults
                        isEn={isEn}
                        isFromQuran={isFromQuran}
                        isQuranLandscape={isQuranLandscape}
                        sourceReadingMode={sourceReadingMode}
                        readingModeLabel={readingModeLabel}
                        query={query}
                        isSearching={isSearching}
                        totalResults={totalResults}
                        selectedSections={selectedSections}
                        sectionsList={sectionsList}
                        quranResults={quranResults}
                        athkarResults={athkarResults}
                        salahAthkarResults={salahAthkarResults}
                        duaResults={duaResults}
                        ruqyahResults={ruqyahResults}
                        hisnResults={hisnResults}
                        nawawiResults={nawawiResults}
                        asmaulHusnaResults={asmaulHusnaResults}
                        seerahResults={seerahResults}
                        hajjUmrahResults={hajjUmrahResults}
                        tenPromisedResults={tenPromisedResults}
                        divineMiraclesResults={divineMiraclesResults}
                        expandedSurahs={expandedSurahs}
                        toggleSurah={toggleSurah}
                        expandedCategories={expandedCategories}
                        setExpandedCategories={setExpandedCategories}
                        handleResultClick={handleResultClick}
                        themeStyles={themeStyles}
                        s3d={s3d}
                    />
                </div>
            </div>
        </div>
    );
};

export default GlobalSearch;
