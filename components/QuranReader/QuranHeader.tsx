import React from 'react';
import { toArabic } from './constants';

interface QuranHeaderProps {
    isPageInputActive: boolean;
    pageInputRef: React.RefObject<HTMLInputElement>;
    pageInput: string;
    handlePageInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handlePageInputBlur: () => void;
    handlePageInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    handlePageButtonClick: () => void;
    page: number;
    surahName: string;
    currentAyah: { s: number; a: number };
    juz: number;
    openModal: (modalId: string) => void;
    currentTheme: any;
    getToolbarStyle: (id: string, bg: string, text: string, border: string) => React.CSSProperties;
    handlePlayButtonPointerDown: (e: React.PointerEvent) => void;
    handlePlayButtonPointerUp: (e: React.PointerEvent) => void;
    handlePlayButtonPointerLeave: () => void;
    renderPlayButtonIcon: () => React.ReactNode;
    reciterToast: { show: boolean; name: string };
    readingMode: 'mushaf' | 'tafseer' | 'meanings' | 'translation';
    setReadingMode: (mode: 'mushaf' | 'tafseer' | 'meanings' | 'translation') => void;
    isMemorizationMode?: boolean;
    memorizationSettings?: any;
    useTajweed: boolean;
    handleMushafTypeSelect: (type: 'uthmani' | 'tajweed') => void;
}

const QuranHeader: React.FC<QuranHeaderProps> = React.memo(({
    isPageInputActive,
    pageInputRef,
    pageInput,
    handlePageInputChange,
    handlePageInputBlur,
    handlePageInputKeyDown,
    handlePageButtonClick,
    page,
    surahName,
    currentAyah,
    juz,
    openModal,
    currentTheme,
    getToolbarStyle,
    handlePlayButtonPointerDown,
    handlePlayButtonPointerUp,
    handlePlayButtonPointerLeave,
    renderPlayButtonIcon,
    reciterToast,
    readingMode,
    setReadingMode,
    isMemorizationMode = false,
    memorizationSettings,
    useTajweed,
    handleMushafTypeSelect
}) => {
    const [isModeMenuOpen, setIsModeMenuOpen] = React.useState(false);

    return (
        <header id="header" className={`header-default flex-none z-50 flex items-center px-4 justify-between border-b shadow-xl w-full gap-2`} style={getToolbarStyle('top-toolbar', currentTheme.barBg, currentTheme.barText, currentTheme.barBorder)}>
            <button 
                id="surah-name-header" 
                onClick={() => openModal('surah-modal')}
                className="top-bar-text-button flex items-center justify-center leading-none !pt-0" 
                style={getToolbarStyle('surah', currentTheme.barBg, currentTheme.barText, currentTheme.barBorder)}
            >
                <span className="flex items-center justify-center leading-none">
                    {surahName} - {isMemorizationMode && memorizationSettings ? (
                        <>الآيات {toArabic(memorizationSettings.fromAyah)} - {toArabic(memorizationSettings.toAyah)}</>
                    ) : (
                        <>آية {toArabic(currentAyah.a)}</>
                    )}
                </span>
            </button>
            <div id="juz-number-header" className="top-bar-text-button !rounded-lg !min-w-[36px] !w-[36px] !h-[36px] !pt-0 !pb-[3px] !px-0 cursor-default flex-shrink-0 !font-black !text-lg flex items-center justify-center leading-none" style={{ cursor: 'default', ...getToolbarStyle('juz', currentTheme.barBg, currentTheme.barText, currentTheme.barBorder) }}>{toArabic(juz)}</div>
            {isPageInputActive ? (
                <input
                    ref={pageInputRef}
                    id="header-page"
                    type="tel"
                    value={pageInput}
                    onChange={handlePageInputChange}
                    onBlur={handlePageInputBlur}
                    onKeyDown={handlePageInputKeyDown}
                    className="top-bar-text-button !rounded-lg !min-w-[46px] !w-[46px] !h-[36px] !pt-0 !pb-[3px] !px-0 text-center flex-shrink-0 !font-black !text-lg flex items-center justify-center leading-none"
                    style={getToolbarStyle('page', currentTheme.barBg, currentTheme.barText, currentTheme.barBorder)}
                    placeholder={`${toArabic(page)}`}
                />
            ) : (
                <button 
                    id="header-page" 
                    onClick={handlePageButtonClick}
                    className="top-bar-text-button !rounded-lg !min-w-[46px] !w-[46px] !h-[36px] !pt-0 !pb-[3px] !px-0 flex-shrink-0 !font-black !text-lg flex items-center justify-center leading-none" 
                    style={getToolbarStyle('page', currentTheme.barBg, currentTheme.barText, currentTheme.barBorder)}
                >
                    {toArabic(page)}
                </button>
            )}
            
            <div className="relative flex-shrink-0">
                <button 
                    id="btn-mode-switch"
                    onClick={() => setIsModeMenuOpen(!isModeMenuOpen)}
                    className="top-bar-text-button !rounded-full !w-10 !h-10 !p-0 flex items-center justify-center flex-shrink-0 aspect-square"
                    style={getToolbarStyle('audio', currentTheme.barBg, currentTheme.barText, currentTheme.barBorder)}
                >
                    <i className={`fa-solid ${readingMode === 'mushaf' ? (useTajweed ? 'fa-book-open' : 'fa-book-quran') : readingMode === 'tafseer' ? 'fa-book-open-reader' : 'fa-language'}`}></i>
                </button>
                
                {isModeMenuOpen && (
                    <>
                        <div className="fixed inset-0 z-[100]" onClick={() => setIsModeMenuOpen(false)}></div>
                        <div className="absolute top-full left-0 mt-2 w-40 rounded-xl shadow-2xl z-[110] overflow-hidden animate-fadeIn"
                             style={{ backgroundColor: currentTheme.cardBg, color: currentTheme.cardText, border: `1px solid ${currentTheme.cardBorder}` }}>
                            <button 
                                onClick={() => { setReadingMode('mushaf'); handleMushafTypeSelect('uthmani'); setIsModeMenuOpen(false); }}
                                className={`w-full px-4 py-3 text-right flex items-center gap-3 transition ${readingMode === 'mushaf' && !useTajweed ? 'bg-black/5 font-bold' : 'hover:bg-black/5'}`}
                            >
                                <i className="fa-solid fa-book-quran w-5"></i>
                                <span>المصحف</span>
                            </button>
                            <button 
                                onClick={() => { setReadingMode('mushaf'); handleMushafTypeSelect('tajweed'); setIsModeMenuOpen(false); }}
                                className={`w-full px-4 py-3 text-right flex items-center gap-3 transition ${readingMode === 'mushaf' && useTajweed ? 'bg-black/5 font-bold' : 'hover:bg-black/5'}`}
                            >
                                <i className="fa-solid fa-book-open w-5"></i>
                                <span>المجود</span>
                            </button>
                            <button 
                                onClick={() => { setReadingMode('tafseer'); setIsModeMenuOpen(false); }}
                                className={`w-full px-4 py-3 text-right flex items-center gap-3 transition ${readingMode === 'tafseer' ? 'bg-black/5 font-bold' : 'hover:bg-black/5'}`}
                            >
                                <i className="fa-solid fa-book-open-reader w-5"></i>
                                <span>التفسير</span>
                            </button>
                            <button 
                                onClick={() => { setReadingMode('meanings'); setIsModeMenuOpen(false); }}
                                className={`w-full px-4 py-3 text-right flex items-center gap-3 transition ${readingMode === 'meanings' ? 'bg-black/5 font-bold' : 'hover:bg-black/5'}`}
                            >
                                <i className="fa-solid fa-language w-5"></i>
                                <span>المعاني</span>
                            </button>
                            <button 
                                onClick={() => { setReadingMode('translation'); setIsModeMenuOpen(false); }}
                                className={`w-full px-4 py-3 text-right flex items-center gap-3 transition ${readingMode === 'translation' ? 'bg-black/5 font-bold' : 'hover:bg-black/5'}`}
                            >
                                <i className="fa-solid fa-globe w-5"></i>
                                <span>الترجمة</span>
                            </button>
                        </div>
                    </>
                )}
            </div>

            <div className="relative flex-shrink-0">
                <button 
                    id="btn-play" 
                    onPointerDown={handlePlayButtonPointerDown}
                    onPointerUp={handlePlayButtonPointerUp}
                    onPointerLeave={handlePlayButtonPointerLeave}
                    className="top-bar-text-button !rounded-full !w-10 !h-10 !p-0 flex items-center justify-center flex-shrink-0 aspect-square" 
                    style={{...getToolbarStyle('audio', currentTheme.barBg, currentTheme.barText, currentTheme.barBorder), touchAction: 'none'}}
                >
                    {renderPlayButtonIcon()}
                </button>
                {reciterToast.show && (
                    <div className="absolute top-full left-0 mt-2 px-3 py-1 text-xs rounded-lg shadow-lg whitespace-nowrap z-[100] animate-fadeIn font-bold pointer-events-none"
                            style={{ backgroundColor: currentTheme.cardBg, color: currentTheme.cardText, border: `1px solid ${currentTheme.cardBorder}` }}>
                        {reciterToast.name}
                    </div>
                )}
            </div>
        </header>
    );
});

export default QuranHeader;
