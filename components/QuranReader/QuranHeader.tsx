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
}

const QuranHeader: React.FC<QuranHeaderProps> = ({
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
    reciterToast
}) => {
    return (
        <header id="header" className={`header-default flex-none z-50 flex items-center px-4 justify-between border-b shadow-xl w-full gap-2`} style={getToolbarStyle('top-toolbar', currentTheme.barBg, currentTheme.barText, currentTheme.barBorder)}>
            <button 
                id="surah-name-header" 
                onClick={() => openModal('surah-modal')}
                className="top-bar-text-button" 
                style={getToolbarStyle('surah', currentTheme.barBg, currentTheme.barText, currentTheme.barBorder)}
            >
                <span>{surahName} - آية {toArabic(currentAyah.a)}</span>
            </button>
            <div id="juz-number-header" className="top-bar-text-button !rounded-lg !min-w-[36px] !w-[36px] !h-[36px] !p-0 cursor-default flex-shrink-0 !font-black !text-lg flex items-center justify-center" style={{ cursor: 'default', ...getToolbarStyle('juz', currentTheme.barBg, currentTheme.barText, currentTheme.barBorder) }}>{toArabic(juz)}</div>
            {isPageInputActive ? (
                <input
                    ref={pageInputRef}
                    id="header-page"
                    type="tel"
                    value={pageInput}
                    onChange={handlePageInputChange}
                    onBlur={handlePageInputBlur}
                    onKeyDown={handlePageInputKeyDown}
                    className="top-bar-text-button !rounded-lg !min-w-[46px] !w-[46px] !h-[36px] !p-0 text-center flex-shrink-0 !font-black !text-lg"
                    style={getToolbarStyle('page', currentTheme.barBg, currentTheme.barText, currentTheme.barBorder)}
                    placeholder={`${toArabic(page)}`}
                />
            ) : (
                <button 
                    id="header-page" 
                    onClick={handlePageButtonClick}
                    className="top-bar-text-button !rounded-lg !min-w-[46px] !w-[46px] !h-[36px] !p-0 flex-shrink-0 !font-black !text-lg flex items-center justify-center" 
                    style={getToolbarStyle('page', currentTheme.barBg, currentTheme.barText, currentTheme.barBorder)}
                >
                    {toArabic(page)}
                </button>
            )}
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
};

export default QuranHeader;
