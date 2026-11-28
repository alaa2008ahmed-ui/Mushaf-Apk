import React from 'react';
import { Search, X } from 'lucide-react';
import { toArabic } from '../QuranReader/constants';
import type { GlobalSearchThemeStyles } from './globalSearchTheme';

export interface SearchSectionOption {
    id: string;
    label: string;
}

interface GlobalSearchHeaderProps {
    isEn: boolean;
    isFromQuran: boolean;
    isQuranLandscape: boolean;
    pageTitle: string;
    handleBack: () => void;
    handleGoHome: () => void;
    dismissKeyboard: (force?: boolean) => void;
    searchBoxRef: React.RefObject<HTMLFormElement | null>;
    searchInputRef: React.RefObject<HTMLInputElement | null>;
    isKeyboardOpenRef: React.MutableRefObject<boolean>;
    query: string;
    setQuery: (q: string) => void;
    isAllSelected: boolean;
    selectedSections: string[];
    otherSections: SearchSectionOption[];
    handleToggleSection: (sectionId: string) => void;
    totalResults: number;
    sectionCounts: Record<string, number>;
    themeStyles: GlobalSearchThemeStyles;
    s3d: any;
}

const GlobalSearchHeader: React.FC<GlobalSearchHeaderProps> = ({
    isEn,
    isFromQuran,
    isQuranLandscape,
    pageTitle,
    handleBack,
    handleGoHome,
    dismissKeyboard,
    searchBoxRef,
    searchInputRef,
    isKeyboardOpenRef,
    query,
    setQuery,
    isAllSelected,
    selectedSections,
    otherSections,
    handleToggleSection,
    totalResults,
    sectionCounts,
    themeStyles,
    s3d,
}) => {
    const {
        isQuranFlatSearch,
        theme,
        flatAccent,
        flatBorderSubtle,
        flatBorderStrong,
        accentBadgeText,
        quranTopBarBg,
        quranTopBarText,
        card3DClass,
        btn3DClass,
        icon3DClass,
        badge3DStyle,
        headerCardStyle,
        sectionIconStyle,
    } = themeStyles;

    const hasTypedText = query.trim().length > 0;
    const showOnlySelectedSections = !isAllSelected && hasTypedText;
    const visibleOtherSections = showOnlySelectedSections
        ? otherSections.filter(sec => selectedSections.includes(sec.id))
        : otherSections;

    return (
        <>
            <header
                className={`app-top-bar shrink-0 ${isQuranFlatSearch ? 'quran-context' : ''}`}
                dir={isEn ? 'ltr' : 'rtl'}
                style={isQuranFlatSearch ? { backgroundColor: quranTopBarBg, color: quranTopBarText } : undefined}
            >
                <div className="app-top-bar__inner">
                    <div className="relative flex items-center justify-center w-full min-h-[44px]">
                        {/* Back button */}
                        <div className={`absolute ${isEn ? 'left-0' : 'right-0'} flex items-center`}>
                            <button
                                onClick={handleBack}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 ${isQuranFlatSearch ? 'active:opacity-70' : 'active:scale-90'} cursor-pointer`}
                                style={isQuranFlatSearch ? { color: quranTopBarText } : undefined}
                                title={isEn ? "Go Back" : "رجوع للخلف"}
                                aria-label={isEn ? "Go Back" : "رجوع للخلف"}
                            >
                                <i className={`fa-solid ${isEn ? 'fa-arrow-left' : 'fa-arrow-right'} text-xl`}></i>
                            </button>
                        </div>

                        {/* Title in center */}
                        <div className="text-center px-12 min-w-0">
                            <h1
                                className="app-top-bar__title text-lg sm:text-xl font-cairo truncate"
                                style={isQuranFlatSearch ? { color: quranTopBarText, fontFamily: "'Cairo', sans-serif" } : { fontFamily: "'Cairo', sans-serif" }}
                            >
                                {pageTitle}
                            </h1>
                        </div>

                        {/* Home button (hidden when opened from QuranReader menus) */}
                        {!isQuranFlatSearch && (
                            <div className={`absolute ${isEn ? 'right-0' : 'left-0'} flex items-center gap-1`}>
                                <button
                                    onClick={handleGoHome}
                                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                    title={isEn ? "Home" : "الصفحة الرئيسية"}
                                    aria-label={isEn ? "Home" : "الصفحة الرئيسية"}
                                >
                                    <i className="fa-solid fa-house text-xl"></i>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Sub-header with Search Input */}
            <div
                className={`w-full mx-auto shrink-0 z-10 border-0 overflow-visible ${isQuranLandscape ? 'global-search-subheader max-w-none pt-2 pb-1' : 'max-w-lg md:max-w-2xl px-4 pt-3 pb-2'}`}
                style={{ backgroundColor: theme.bgColor }}
            >
                <form
                    ref={searchBoxRef}
                    onSubmit={(e) => {
                        e.preventDefault();
                        dismissKeyboard(true);
                    }}
                    className="relative overflow-visible mb-1 flex items-center"
                >
                    <input
                        ref={searchInputRef}
                        type="text"
                        enterKeyHint="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => {
                            isKeyboardOpenRef.current = true;
                        }}
                        onBlur={() => {
                            isKeyboardOpenRef.current = false;
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.keyCode === 13) {
                                e.preventDefault();
                                dismissKeyboard(true);
                            }
                        }}
                        placeholder={
                            isAllSelected
                                ? (isEn ? "Search across all sections..." : "ابحث في جميع أقسام التطبيق...")
                                : (isEn
                                    ? "Search in selected sections..."
                                    : "ابحث في الأقسام المحددة...")
                        }
                        className={`w-full py-3 px-3 rounded-2xl focus:outline-none text-xs sm:text-sm font-bold ${card3DClass} ${isQuranFlatSearch ? '' : 'border-0'} transition-all ${isEn ? 'pl-12 pr-11 text-left' : 'pr-12 pl-11 text-right'}`}
                        dir={isEn ? "ltr" : "rtl"}
                        style={isQuranFlatSearch ? {
                            backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : (theme.btnBg || '#ffffff'),
                            color: theme.textColor,
                            border: `1.5px solid ${flatBorderStrong}`,
                            outline: 'none'
                        } : {
                            color: s3d.textColor,
                            outline: 'none'
                        }}
                    />
                    <span
                        className={`absolute ${isEn ? 'left-2.5' : 'right-2.5'} top-1/2 -translate-y-1/2 w-7 h-7 rounded-full ${isQuranFlatSearch ? 'madinah-flat-badge' : 'app-3d-badge border-0'} pointer-events-none flex items-center justify-center`}
                        style={sectionIconStyle}
                        aria-hidden="true"
                    >
                        <Search className={`w-3.5 h-3.5 ${icon3DClass}`} style={{ color: isFromQuran ? flatAccent : s3d.noticeAccent }} />
                    </span>
                    {query && (
                        <button
                            type="button"
                            onClick={() => { setQuery(''); setTimeout(() => searchInputRef.current?.focus(), 10); }}
                            className={`absolute ${isEn ? 'right-2.5' : 'left-2.5'} top-1/2 transform -translate-y-1/2 w-7 h-7 rounded-full ${isQuranFlatSearch ? 'madinah-flat-icon-btn' : `app-page-card ${s3d.surfaceCardClass} border-0`} cursor-pointer flex items-center justify-center`}
                            style={isQuranFlatSearch ? { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', border: `1px solid ${flatBorderSubtle}` } : undefined}
                            title={isEn ? "Clear" : "مسح"}
                        >
                            <X className={`w-3.5 h-3.5 ${icon3DClass}`} style={{ color: isFromQuran ? flatAccent : s3d.noticeAccent }} />
                        </button>
                    )}
                </form>

                {/* Pages & Sections Selector Bar */}
                <div className="mt-2.5 flex items-center gap-2 pb-1.5 overflow-visible">
                    {/* Fixed "All Sections" Button */}
                    {!showOnlySelectedSections && (
                        <button
                            key="all"
                            onClick={() => handleToggleSection('all')}
                            className={`px-3 py-1.5 rounded-xl whitespace-nowrap text-[11px] font-bold transition-all ${isQuranFlatSearch ? '' : 'border-0'} cursor-pointer shrink-0 flex items-center gap-1.5 ${
                                isAllSelected
                                    ? (isQuranFlatSearch ? 'madinah-flat-btn-selected' : 'app-page-card')
                                    : (isQuranFlatSearch ? 'madinah-flat-btn opacity-90 hover:opacity-100' : `${btn3DClass}`)
                            }`}
                            style={isAllSelected ? badge3DStyle : headerCardStyle('rgba(255,255,255,0.06)')}
                        >
                            <span>{isEn ? "All Sections" : "كل الأقسام"}</span>
                            {query && totalResults > 0 && (
                                <span
                                    className={`${isQuranFlatSearch ? 'madinah-flat-badge' : 'app-3d-badge border-0'} text-[10px] px-1.5 py-0.2 rounded-full font-extrabold`}
                                    style={{
                                        backgroundColor: isAllSelected ? 'rgba(0,0,0,0.2)' : (theme.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.07)'),
                                        color: isAllSelected ? (isFromQuran ? accentBadgeText : s3d.btnTextColor) : theme.textColor
                                    }}
                                >
                                    {isEn ? totalResults : toArabic(totalResults)}
                                </span>
                            )}
                        </button>
                    )}

                    {/* Scrollable Remaining Section Buttons */}
                    <div className="flex-1 flex overflow-x-auto gap-2 py-2 px-0.5 hide-scrollbar">
                        {visibleOtherSections.map(sec => {
                            const isSelected = !isAllSelected && selectedSections.includes(sec.id);
                            const count = sectionCounts[sec.id] || 0;

                            return (
                                <button
                                    key={sec.id}
                                    onClick={() => handleToggleSection(sec.id)}
                                    className={`px-3 py-1.5 rounded-xl whitespace-nowrap text-[11px] font-bold transition-all ${isQuranFlatSearch ? '' : 'border-0'} cursor-pointer flex items-center gap-1.5 shrink-0 ${
                                        isSelected
                                            ? (isQuranFlatSearch ? 'madinah-flat-btn-selected' : 'app-page-card')
                                            : (isQuranFlatSearch ? 'madinah-flat-btn opacity-90 hover:opacity-100' : `${btn3DClass}`)
                                    }`}
                                    style={isSelected ? badge3DStyle : headerCardStyle('rgba(255,255,255,0.06)')}
                                >
                                    <span>{sec.label}</span>
                                    {query && totalResults > 0 && count > 0 && (
                                        <span
                                            className={`${isQuranFlatSearch ? 'madinah-flat-badge' : 'app-3d-badge border-0'} text-[10px] px-1.5 py-0.2 rounded-full font-extrabold`}
                                            style={{
                                                backgroundColor: isSelected ? 'rgba(0,0,0,0.2)' : (theme.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.07)'),
                                                color: isSelected ? (isFromQuran ? accentBadgeText : s3d.btnTextColor) : theme.textColor
                                            }}
                                        >
                                            {isEn ? count : toArabic(count)}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
};

export default GlobalSearchHeader;
