import React, { useEffect, useRef } from 'react';
import { SAJDAH_LOCATIONS, toArabic, SURAH_INFO } from './constants';

interface MushafPageProps {
    pageNum: number;
    pageData: any[];
    highlightedAyahId: string | null;
    onAyahClick: (surah: number, ayah: number) => void;
    onVerseClick: (surah: number, ayah: number, event: React.MouseEvent) => void;
    onVerseLongPress?: (surah: number, ayah: number) => void;
    onAyahLongPress?: (surah: number, ayah: number, x: number, y: number) => void;
    onInteractionStart?: () => void;
    onInteractionEnd?: () => void;
    settings?: {
        fontSize: number;
        fontFamily: string;
        textColor: string;
        theme: string;
    };
    currentTheme?: any;
}

const fixQuranText = (text: string) => {
    if (!text) return text;
    // Fix for "Ibrahim" and similar words where Small Yeh (\u06e6) causes disconnection in some fonts
    // We replace the sequence of (Heh + Kasra + Small Yeh) with (Heh + Kasra + Regular Yeh)
    // to ensure proper shaping and connectivity.
    return text.replace(/\u0647\u0650\u06e6/g, '\u0647\u0650\u064a');
};

const renderTajweedText = (text: string) => {
    if (!text) return text;
    
    // Remove the ZWJ hack as it breaks shaping in proper Quranic fonts
    const fixedText = text;

    if (!fixedText.includes('[')) return fixedText;
    
    const parts = [];
    let lastIndex = 0;
    const regex = /\[([a-z])(?::\d+)?\[([^\]]+)\]/g;
    let match;
    
    while ((match = regex.exec(fixedText)) !== null) {
        if (match.index > lastIndex) {
            parts.push(<span key={`text-${lastIndex}`}>{fixedText.substring(lastIndex, match.index)}</span>);
        }
        const colorClass = `tajweed-${match[1]}`;
        parts.push(<span key={`tag-${match.index}`} className={colorClass}>{match[2]}</span>);
        lastIndex = regex.lastIndex;
    }
    
    if (lastIndex < fixedText.length) {
        parts.push(<span key={`text-${lastIndex}`}>{fixedText.substring(lastIndex)}</span>);
    }
    
    return parts;
};

const MushafPage: React.FC<MushafPageProps> = React.memo(({ pageNum, pageData, highlightedAyahId, onAyahClick, onVerseClick, onVerseLongPress, onAyahLongPress, onInteractionStart, onInteractionEnd, settings, currentTheme }) => {
    const pageRef = useRef<HTMLDivElement | null>(null);
    const longPressTimer = useRef<number | null>(null);
    const isLongPressTriggered = useRef(false);
    const touchStartPos = useRef<{x: number, y: number} | null>(null);

    const handlePointerDown = (s: number, a: number, e: React.PointerEvent, isVerse: boolean) => {
        if (e.button !== 0 && e.pointerType === 'mouse') return; 
        e.stopPropagation();
        if (onInteractionStart) onInteractionStart();
        
        isLongPressTriggered.current = false;
        touchStartPos.current = { x: e.clientX, y: e.clientY };

        if (longPressTimer.current) {
            window.clearTimeout(longPressTimer.current);
        }

        longPressTimer.current = window.setTimeout(() => {
            if (isVerse) {
                if (onVerseLongPress) {
                    onVerseLongPress(s, a);
                    isLongPressTriggered.current = true;
                }
            } else {
                if (onAyahLongPress) {
                    onAyahLongPress(s, a, e.clientX, e.clientY);
                    isLongPressTriggered.current = true;
                }
            }
            longPressTimer.current = null;
        }, 600);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!touchStartPos.current || !longPressTimer.current) return;
        
        if (Math.abs(e.clientX - touchStartPos.current.x) > 15 || Math.abs(e.clientY - touchStartPos.current.y) > 15) {
            if (longPressTimer.current) {
                window.clearTimeout(longPressTimer.current);
                longPressTimer.current = null;
            }
        }
    };

    const handlePointerUp = () => {
        if (onInteractionEnd) onInteractionEnd();
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    const handlePointerLeave = () => {
        if (onInteractionEnd) onInteractionEnd();
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    if (!pageData || !pageData.length) return <div className={`mushaf-page ${pageNum === 1 ? 'first-page' : ''}`} style={{height: '1000px'}}></div>; // Placeholder for height calculation
    
    let currentSurah = -1;
    
    const pageStyle = {
        fontSize: settings ? `${settings.fontSize}rem` : '1.7rem',
        fontFamily: settings?.fontFamily || 'var(--font-amiri-quran)',
        color: settings?.theme === 'dark' ? '#fff' : (settings?.textColor || '#000'),
        textAlign: 'justify' as const,
        textJustify: 'inter-word' as const
    };

    const headerStyle = {
        fontSize: settings ? `${settings.fontSize * 0.94}rem` : '1.6rem',
        fontFamily: settings?.fontFamily || 'var(--font-amiri-quran)'
    };

    return (
        <div className={`mushaf-page ${pageNum === 1 ? 'first-page' : ''}`} data-page={pageNum} ref={pageRef} style={{ backgroundColor: 'transparent' }}>
            <div className="page-content" style={pageStyle}>
                {pageData.map((ayah, index) => {
                    const isSajdah = SAJDAH_LOCATIONS.some(sl => sl.s === ayah.sNum && sl.a === ayah.numberInSurah);
                    const showHeader = currentSurah !== ayah.sNum && ayah.numberInSurah === 1;
                    if (showHeader) currentSurah = ayah.sNum;
                    
                    // Detect Hizb Quarter change
                    const prevAyah = index > 0 ? pageData[index - 1] : null;
                    const isNewQuarter = prevAyah ? (ayah.hizbQuarter !== prevAyah.hizbQuarter) : false;
                    // Note: For the first ayah of the page, we might miss the marker if it changed between pages.
                    // But usually markers are at the start of pages or handled by the reader.
                    // We can also check if (ayah.hizbQuarter - 1) * some_logic matches.
                    
                    const text = fixQuranText((ayah.numberInSurah === 1 && ayah.sNum !== 1 && ayah.sNum !== 9) 
                        ? ayah.text.replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', '').replace('بِّسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', '').trim() 
                        : ayah.text);
                    
                    const id = `ayah-${ayah.sNum}-${ayah.numberInSurah}`;

                    const headerBg = currentTheme?.headerBg || '#22c55e';
                    const headerBorder = currentTheme?.accent || '#14532d';
                    const headerText = currentTheme?.headerText || '#ffffff';
                    const cartoucheBg = currentTheme?.bg || '#dcfce7';
                    const cartoucheText = currentTheme?.accent || '#14532d';

                    return (
                        <React.Fragment key={id}>
                            {showHeader && ( 
                                <> 
                                    <div className="surah-header-container">
                                        <svg className="surah-header-bg" viewBox="0 0 600 80" preserveAspectRatio="none">
                                            {/* Outer Green Box with Double Border */}
                                            <rect x="2" y="2" width="596" height="76" fill={headerBg} stroke={headerBorder} strokeWidth="2" />
                                            <rect x="6" y="6" width="588" height="68" fill="none" stroke={headerText} strokeWidth="1" opacity="0.3" />
                                            
                                            {/* Center Cartouche Background (Light) - Shrunken Width */}
                                            <path d="M 180 10 L 420 10 Q 440 10 445 25 L 450 40 L 445 55 Q 440 70 420 70 L 180 70 Q 160 70 155 55 L 150 40 L 155 25 Q 160 10 180 10 Z" fill={cartoucheBg} stroke={headerBorder} strokeWidth="2" />
                                            
                                            {/* Inner decorative line for cartouche - Shrunken Width */}
                                            <path d="M 185 15 L 415 15 Q 430 15 434 25 L 438 40 L 434 55 Q 430 65 415 65 L 185 65 Q 170 65 166 55 L 162 40 L 166 25 Q 170 15 185 15 Z" fill="none" stroke={headerBorder} strokeWidth="1" opacity="0.3" />
                                        </svg>
                                        
                                        <div className="surah-header-content" style={{ color: headerText }}>
                                            <div className="surah-header-right-text">{SURAH_INFO[ayah.sNum]?.type}</div>
                                            <div className="surah-header-center-text" style={{ color: cartoucheText }}>{ayah.sName.replace('سورة', '').trim()}</div>
                                            <div className="surah-header-left-text">{toArabic(SURAH_INFO[ayah.sNum]?.ayahs || 0)} آيات</div>
                                        </div>
                                    </div> 
                                    {ayah.sNum !== 1 && ayah.sNum !== 9 && (
                                        <div className="bismillah" style={headerStyle}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
                                    )} 
                                </> 
                            )}
                            <span 
                                id={id} 
                                className={`ayah-text-block ${highlightedAyahId === id ? 'highlighted' : ''} ${isSajdah ? 'ayah-sajdah' : ''}`} 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isLongPressTriggered.current) {
                                        onAyahClick(ayah.sNum, ayah.numberInSurah);
                                    }
                                }}
                                onPointerDown={(e) => handlePointerDown(ayah.sNum, ayah.numberInSurah, e, false)}
                                onPointerMove={handlePointerMove}
                                onPointerUp={handlePointerUp}
                                onPointerCancel={handlePointerUp}
                                onPointerLeave={handlePointerLeave}
                                onContextMenu={(e) => e.preventDefault()}
                                data-sajdah={isSajdah} 
                                data-snum={ayah.sNum}
                                data-surah={ayah.sName.replace('سورة','').trim()} 
                                data-ayah={ayah.numberInSurah}
                                data-juz={ayah.juz}
                                data-hizb-quarter={ayah.hizbQuarter}
                            >
                                {isNewQuarter && <span className="hizb-quarter-marker">۞</span>}
                                {renderTajweedText(text.replace(/\s+/g, ' ').trim())}
                                {isSajdah && <span className="sajdah-icon-inline">۩</span>}
                                <span className="verse-container" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!isLongPressTriggered.current) {
                                            onVerseClick(ayah.sNum, ayah.numberInSurah, e);
                                        }
                                    }}
                                    onPointerDown={(e) => handlePointerDown(ayah.sNum, ayah.numberInSurah, e, true)}
                                    onPointerUp={(e) => {
                                        e.stopPropagation();
                                        handlePointerUp();
                                    }}
                                    onPointerCancel={(e) => {
                                        e.stopPropagation();
                                        handlePointerUp();
                                    }}
                                    onPointerLeave={(e) => {
                                        e.stopPropagation();
                                        handlePointerLeave();
                                    }}
                                    onContextMenu={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                >
                                    <span className="verse-bracket">﴿</span>
                                    <span className="verse-num-inner">{toArabic(ayah.numberInSurah)}</span>
                                    <span className="verse-bracket">﴾</span>
                                </span>
                            </span>
                        </React.Fragment>
                    );
                })}
            </div>
            <div className="page-footer">
                <span className="page-number-bracket">﴿</span>
                <span className="page-number-text">{toArabic(pageNum)}</span>
                <span className="page-number-bracket">﴾</span>
            </div>
        </div>
    );
});

export default MushafPage;