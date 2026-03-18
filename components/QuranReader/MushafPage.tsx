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
}

const renderTajweedText = (text: string) => {
    if (!text) return text;
    
    // Fix for disconnected characters like Small High Ya (U+06E6) and Small High Waw (U+06E5)
    // We wrap them with Zero Width Joiner (U+200D) to force connection with surrounding letters.
    const fixedText = text.replace(/([\u06E5\u06E6])/g, '\u200D$1\u200D');

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

const MushafPage: React.FC<MushafPageProps> = React.memo(({ pageNum, pageData, highlightedAyahId, onAyahClick, onVerseClick, onVerseLongPress, onAyahLongPress, onInteractionStart, onInteractionEnd, settings }) => {
    const pageRef = useRef<HTMLDivElement | null>(null);
    const longPressTimer = useRef<number | null>(null);
    const isLongPressTriggered = useRef(false);
    const touchStartPos = useRef<{x: number, y: number} | null>(null);

    const handleAyahTouchStart = (s: number, a: number, e: React.TouchEvent | React.MouseEvent) => {
        if ('touches' in e && e.touches.length > 1) return; // Ignore multi-touch
        e.stopPropagation();
        if (onInteractionStart) onInteractionStart();
        isLongPressTriggered.current = false;
        
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        touchStartPos.current = { x: clientX, y: clientY };

        longPressTimer.current = window.setTimeout(() => {
            if (onAyahLongPress) {
                onAyahLongPress(s, a, clientX, clientY);
                isLongPressTriggered.current = true;
            }
            longPressTimer.current = null;
        }, 600);
    };

    const handleAyahTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
        if (!touchStartPos.current || !longPressTimer.current) return;
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        
        // If moved more than 10px, cancel long press
        if (Math.abs(clientX - touchStartPos.current.x) > 10 || Math.abs(clientY - touchStartPos.current.y) > 10) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    const handleVersePointerDown = (s: number, a: number, e: React.PointerEvent) => {
        e.stopPropagation();
        if (onInteractionStart) onInteractionStart();
        isLongPressTriggered.current = false;
        longPressTimer.current = window.setTimeout(() => {
            if (onVerseLongPress) {
                onVerseLongPress(s, a);
                isLongPressTriggered.current = true;
            }
            longPressTimer.current = null;
        }, 600);
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
        fontFamily: settings?.fontFamily || 'var(--font-amiri)',
        color: settings?.theme === 'dark' ? '#fff' : (settings?.textColor || '#000')
    };

    const headerStyle = {
        fontSize: settings ? `${settings.fontSize * 0.94}rem` : '1.6rem',
        fontFamily: settings?.fontFamily || 'var(--font-amiri)'
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
                    
                    const text = (ayah.numberInSurah === 1 && ayah.sNum !== 1 && ayah.sNum !== 9) 
                        ? ayah.text.replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', '').replace('بِّسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', '').trim() 
                        : ayah.text;
                    
                    const id = `ayah-${ayah.sNum}-${ayah.numberInSurah}`;

                    return (
                        <React.Fragment key={id}>
                            {showHeader && ( 
                                <> 
                                    <div className="surah-header-container">
                                        <svg className="surah-header-bg" viewBox="0 0 600 80" preserveAspectRatio="none">
                                            {/* Outer Green Box with Double Border */}
                                            <rect x="2" y="2" width="596" height="76" fill="#22c55e" stroke="#14532d" strokeWidth="2" />
                                            <rect x="6" y="6" width="588" height="68" fill="none" stroke="#dcfce7" strokeWidth="1" opacity="0.5" />
                                            
                                            {/* Center Cartouche Background (Light) - Shrunken Width */}
                                            <path d="M 180 10 L 420 10 Q 440 10 445 25 L 450 40 L 445 55 Q 440 70 420 70 L 180 70 Q 160 70 155 55 L 150 40 L 155 25 Q 160 10 180 10 Z" fill="#dcfce7" stroke="#14532d" strokeWidth="2" />
                                            
                                            {/* Inner decorative line for cartouche - Shrunken Width */}
                                            <path d="M 185 15 L 415 15 Q 430 15 434 25 L 438 40 L 434 55 Q 430 65 415 65 L 185 65 Q 170 65 166 55 L 162 40 L 166 25 Q 170 15 185 15 Z" fill="none" stroke="#14532d" strokeWidth="1" opacity="0.5" />
                                        </svg>
                                        
                                        <div className="surah-header-content">
                                            <div className="surah-header-right-text">{SURAH_INFO[ayah.sNum]?.type}</div>
                                            <div className="surah-header-center-text">{ayah.sName.replace('سورة', '').trim()}</div>
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
                                onTouchStart={(e) => handleAyahTouchStart(ayah.sNum, ayah.numberInSurah, e)}
                                onTouchMove={handleAyahTouchMove}
                                onTouchEnd={handlePointerUp}
                                onMouseDown={(e) => handleAyahTouchStart(ayah.sNum, ayah.numberInSurah, e)}
                                onMouseMove={handleAyahTouchMove}
                                onMouseUp={handlePointerUp}
                                onMouseLeave={handlePointerLeave}
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
                                    onPointerDown={(e) => handleVersePointerDown(ayah.sNum, ayah.numberInSurah, e as any)}
                                    onPointerUp={(e) => {
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