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
    hideVerses?: boolean;
}

export const fixQuranText = (text: string) => {
    if (!text) return text;
    return text.replace(/۞/g, '');
};

/**
 * Regex Cleaner: Removes hidden characters that break Arabic shaping
 * like Tatweel (\u0640) and Zero Width Joiner (\u200D).
 */
export const cleanArabicText = (text: string) => {
    if (!text) return text;
    return text.replace(/[\u0640\u200D]/g, '');
};

/**
 * Renders Tajweed text as an HTML string to be used with dangerouslySetInnerHTML.
 * This ensures that no extra spaces are added between spans, which would break Arabic shaping.
 */
export const renderTajweedTextHtml = (text: string) => {
    if (!text) return text;
    return fixQuranText(text);
};

const MushafPage: React.FC<MushafPageProps> = React.memo(({ pageNum, pageData, highlightedAyahId, onAyahClick, onVerseClick, onVerseLongPress, onAyahLongPress, onInteractionStart, onInteractionEnd, settings, currentTheme, hideVerses }) => {
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
        letterSpacing: 0,
        fontFeatureSettings: '"kern", "liga", "clig", "calt", "ccmp"',
        textRendering: 'optimizeLegibility'
    };

    const headerStyle = {
        fontSize: settings ? `${settings.fontSize * 0.94}rem` : '1.6rem',
        fontFamily: settings?.fontFamily || 'var(--font-amiri-quran)',
        color: currentTheme?.accent || '#6d28d9'
    };

    return (
        <div id={`page-${pageNum}`} className={`mushaf-page ${pageNum === 1 ? 'first-page' : ''}`} data-page={pageNum} ref={pageRef} style={{ backgroundColor: 'transparent' }}>
            <div className="page-content" style={pageStyle}>
                {pageData.map((ayah, index) => {
                    const isSajdah = SAJDAH_LOCATIONS.some(sl => sl.s === ayah.sNum && sl.a === ayah.numberInSurah);
                    const showHeader = currentSurah !== ayah.sNum && ayah.numberInSurah === 1;
                    if (showHeader) currentSurah = ayah.sNum;
                    
                    // Detect Hizb Quarter change
                    const prevAyah = index > 0 ? pageData[index - 1] : null;
                    const hasMarkerInText = ayah.text.includes('۞');
                    const isNewQuarter = (prevAyah ? (ayah.hizbQuarter !== prevAyah.hizbQuarter) : false) || hasMarkerInText;
                    
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
                                            <div className="surah-header-right-text" style={{ color: cartoucheText }}>{SURAH_INFO[ayah.sNum]?.type}</div>
                                            <div className="surah-header-center-text" style={{ color: cartoucheText }}>{ayah.sName.replace('سورة', '').trim()}</div>
                                            <div className="surah-header-left-text" style={{ color: cartoucheText }}>{toArabic(SURAH_INFO[ayah.sNum]?.ayahs || 0)} آيات</div>
                                        </div>
                                    </div> 
                                    {ayah.sNum !== 1 && ayah.sNum !== 9 && (
                                        <div className="bismillah" style={headerStyle}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
                                    )} 
                                </> 
                            )}
                            <span 
                                id={id} 
                                className={`ayah-text-block ${highlightedAyahId === id ? 'highlighted' : ''} ${isSajdah ? 'ayah-sajdah' : ''} ${hideVerses && highlightedAyahId !== id ? 'hide-text' : ''}`} 
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
                                <span 
                                    style={{ display: 'contents' }}
                                    dangerouslySetInnerHTML={{ 
                                        __html: renderTajweedTextHtml(text.replace(/\s+/g, ' ').trim()) 
                                    }} 
                                />
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
                                    <span className="verse-bracket" style={{ color: currentTheme?.accent || '#d97706' }}>﴿</span>
                                    <span className="verse-num-inner" style={{ color: currentTheme?.accent || '#1d4ed8' }}>{toArabic(ayah.numberInSurah)}</span>
                                    <span className="verse-bracket" style={{ color: currentTheme?.accent || '#d97706' }}>﴾</span>
                                </span>
                            </span>
                        </React.Fragment>
                    );
                })}
            </div>
            <div className="page-footer" style={{ flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <span className="page-number-bracket" style={{ color: currentTheme?.accent || '#d97706' }}>﴿</span>
                    <span className="page-number-text" style={{ color: currentTheme?.accent || '#1d4ed8' }}>{toArabic(pageNum)}</span>
                    <span className="page-number-bracket" style={{ color: currentTheme?.accent || '#d97706' }}>﴾</span>
                </div>
                <div style={{ width: '60%', height: '2px', backgroundColor: currentTheme?.accent || '#d97706', marginTop: '12px', opacity: 0.7, borderRadius: '1px' }}></div>
            </div>
        </div>
    );
});

export default MushafPage;