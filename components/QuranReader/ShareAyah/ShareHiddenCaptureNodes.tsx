import React from 'react';
import { toArabic } from '../constants';
import { renderTajweedTextHtml } from '../MushafPage';
import { QuranPageDesignPalette } from '../../../utils/share/shareCardDesignsQuran';
import {
    FrameOverlay,
    IslamicFlourish,
    QuranPageBottomDivider,
    QuranPageSurahBanner,
    ShareBgOption,
    ShareDesignAssets,
    ShareFrameOption,
    SharePageChunk,
    getChunkTypography,
} from './shareStudioConstants';

interface ShareHiddenCaptureNodesProps {
    pageChunks: SharePageChunk[];
    userRatio: number;
    selectedBg: ShareBgOption;
    selectedFrame: ShareFrameOption;
    selectedFont: string;
    textColor: string;
    customText: string;
    showBismillah: boolean;
    isMushafLikeMode: boolean;
    shareType: 'text' | 'image' | 'page' | 'audio';
    isEn: boolean;
    quranPagePalette: QuranPageDesignPalette | null;
    quranSurahBannerUrl: string;
    shareDesignAssets: ShareDesignAssets | null;
    hiddenImageCaptureRef: React.RefObject<HTMLDivElement | null>;
    hiddenCapturePagesRef: React.MutableRefObject<(HTMLDivElement | null)[]>;
    getAyahText: (s: number, a: number, strip?: boolean) => string;
    getSurahName: (s: number) => string;
    getExplanationText: (s: number, a: number) => string;
}

export const ShareHiddenCaptureNodes: React.FC<ShareHiddenCaptureNodesProps> = ({
    pageChunks,
    userRatio,
    selectedBg,
    selectedFrame,
    selectedFont,
    textColor,
    customText,
    showBismillah,
    isMushafLikeMode,
    shareType,
    isEn,
    quranPagePalette,
    quranSurahBannerUrl,
    shareDesignAssets,
    hiddenImageCaptureRef,
    hiddenCapturePagesRef,
    getAyahText,
    getSurahName,
    getExplanationText,
}) => {
    return (
        <>
            {/* Hidden capture elements for High Quality Image & Page Share (Exact 1080x1920 Story format) */}
            <div style={{ position: 'fixed', left: '-9999px', top: '-9999px', pointerEvents: 'none' }} aria-hidden="true">
                {pageChunks.map((chunk, chunkIdx) => {
                    const chunkTypo = getChunkTypography(chunk.totalChars, userRatio);
                    const isShort = chunk.totalChars < 280;
                    const chunkExplanation = chunk.ayahs.map(ay => getExplanationText(ay.s, ay.a)).filter(t => t).join('\n');
                    const firstChunkAyah = chunk.ayahs[0];
                    const hasMultipleSurahsInChunk = chunk.ayahs.some((ay, idx) => idx > 0 && ay.s !== firstChunkAyah?.s);
                    const isFatihaStart = firstChunkAyah?.s === 1 && firstChunkAyah?.a === 1;
                    const showTopBismillah =
                        showBismillah &&
                        isMushafLikeMode &&
                        !(firstChunkAyah?.s === 9 && firstChunkAyah?.a === 1) &&
                        !(quranPagePalette && isFatihaStart);
                    const showTopSurahLabel =
                        shareType === 'page' &&
                        hasMultipleSurahsInChunk &&
                        firstChunkAyah?.a === 1;
                    return (
                        <div
                            key={`capture-chunk-${chunkIdx}`}
                            id={chunkIdx === 0 ? "hidden-image-capture" : `hidden-image-capture-${chunkIdx}`}
                            ref={chunkIdx === 0 ? hiddenImageCaptureRef : (el) => { hiddenCapturePagesRef.current[chunkIdx] = el; }}
                            style={{
                                position: 'relative',
                                width: '1080px',
                                height: '1920px',
                                minHeight: '1920px',
                                maxHeight: '1920px',
                                boxSizing: 'border-box',
                                borderRadius: selectedBg.type === 'share_design' ? '0px' : '36px',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding:
                                    quranPagePalette
                                        ? selectedFrame.id !== 'none'
                                            ? '96px 90px 90px 90px'
                                            : '76px 76px 72px 76px'
                                        : selectedBg.type === 'share_design'
                                        ? selectedFrame.id !== 'none'
                                            ? '164px 128px 162px 128px'
                                            : '152px 118px 150px 118px'
                                        : selectedFrame.id !== 'none'
                                        ? '92px 110px 116px 110px'
                                        : '68px 64px 56px 64px',
                                textAlign: 'center',
                                backgroundColor: selectedBg.type === 'solid' ? selectedBg.value : undefined,
                                backgroundImage: selectedBg.type !== 'solid' ? selectedBg.value : undefined,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                border: selectedBg.type === 'share_design' ? 'none' : `12px solid ${selectedBg.border}`,
                                direction: isEn ? 'ltr' : 'rtl'
                            }}
                        >
                            {selectedBg.type === 'share_design' && shareDesignAssets?.exportBackdropUrl ? (
                                <img
                                    src={shareDesignAssets.exportBackdropUrl}
                                    alt=""
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'fill',
                                        pointerEvents: 'none',
                                        zIndex: 0
                                    }}
                                />
                            ) : (
                                selectedBg.id !== 'bg_white' &&
                                !selectedBg.isLight && (
                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: selectedBg.overlay || 'rgba(0, 0, 0, 0.22)' }}></div>
                                )
                            )}
                            <FrameOverlay frame={selectedFrame} scale={4} />
                            <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', width: '100%', height: '100%', flex: 1, boxSizing: 'border-box' }}>
                                {/* Top Bismillah / Quran Surah Banner Header */}
                                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '8px' }}>
                                    {quranPagePalette && firstChunkAyah && (
                                        <QuranPageSurahBanner
                                            surahNum={firstChunkAyah.s}
                                            scale={1}
                                            isEn={isEn}
                                            quranPagePalette={quranPagePalette}
                                            quranSurahBannerUrl={quranSurahBannerUrl}
                                        />
                                    )}
                                    {!quranPagePalette && showTopSurahLabel && (
                                        <p
                                            style={{
                                                fontFamily: 'var(--font-amiri-quran), var(--font-hafs), serif',
                                                fontSize: `${Math.round(chunkTypo.bismillahSize * 0.92)}px`,
                                                color: selectedBg.accent,
                                                margin: '0 0 4px 0',
                                                textShadow: (selectedBg.id === 'bg_white' || selectedBg.isLight) ? 'none' : '0 4px 10px rgba(0,0,0,0.45)',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            سُورَةُ {getSurahName(firstChunkAyah.s)}
                                        </p>
                                    )}
                                    {showTopBismillah && (
                                        <p
                                            style={{
                                                fontFamily: 'var(--font-amiri-quran), var(--font-hafs), serif',
                                                fontSize: `${chunkTypo.bismillahSize}px`,
                                                color: quranPagePalette ? (quranPagePalette.isDark ? quranPagePalette.gold : quranPagePalette.deep) : selectedBg.accent,
                                                margin: 0,
                                                textShadow: (selectedBg.id === 'bg_white' || selectedBg.isLight) ? 'none' : '0 6px 12px rgba(0,0,0,0.5)',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                                        </p>
                                    )}
                                    {!quranPagePalette && isShort && (
                                        selectedBg.type === 'share_design' && shareDesignAssets?.upperMotifUrl ? (
                                            <img
                                                src={shareDesignAssets.upperMotifUrl}
                                                alt=""
                                                style={{
                                                    width: '580px',
                                                    height: '128px',
                                                    objectFit: 'contain',
                                                    pointerEvents: 'none',
                                                    margin: '8px 0'
                                                }}
                                            />
                                        ) : (
                                            <IslamicFlourish color={selectedBg.accent} scale={2} />
                                        )
                                    )}
                                </div>

                                {/* Middle Verse & Explanation auto-centered & adaptively sized to fill full page */}
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', padding: selectedFrame.id !== 'none' ? '12px 28px' : '12px 0', minHeight: 0, boxSizing: 'border-box' }}>
                                    <p
                                        className="share-preview-text"
                                        style={{
                                            lineHeight: chunkTypo.lineHeight,
                                            fontFamily: selectedFont,
                                            fontSize: `${chunkTypo.ayahFontSize}px`,
                                            color: textColor,
                                            textShadow: (selectedBg.id === 'bg_white' || selectedBg.isLight) ? 'none' : '0 6px 14px rgba(0,0,0,0.55)',
                                            margin: 0,
                                            fontWeight: 'bold',
                                            whiteSpace: 'normal',
                                            letterSpacing: 0,
                                            wordBreak: 'keep-all',
                                            fontFeatureSettings: '"kern", "liga", "clig", "calt", "ccmp"',
                                            textRendering: 'optimizeLegibility',
                                            textAlign: 'center',
                                            width: '100%',
                                            padding: selectedFrame.id !== 'none' ? '0 20px' : '0',
                                            boxSizing: 'border-box'
                                        }}
                                    >
                                        {chunk.ayahs.map((ay, idx) => {
                                            const isNewMidChunkSurah = idx > 0 && ay.a === 1;
                                            return (
                                                <React.Fragment key={`${ay.s}-${ay.a}-${idx}`}>
                                                    {isNewMidChunkSurah && (
                                                        <>
                                                            {quranPagePalette ? (
                                                                <span style={{ display: 'block', marginTop: '14px' }}>
                                                                    <QuranPageSurahBanner
                                                                        surahNum={ay.s}
                                                                        scale={1}
                                                                        isEn={isEn}
                                                                        quranPagePalette={quranPagePalette}
                                                                        quranSurahBannerUrl={quranSurahBannerUrl}
                                                                    />
                                                                </span>
                                                            ) : (
                                                                <span
                                                                    style={{
                                                                        display: 'block',
                                                                        fontFamily: 'var(--font-amiri-quran), var(--font-hafs), serif',
                                                                        fontSize: `${Math.round(chunkTypo.bismillahSize * 0.9)}px`,
                                                                        color: selectedBg.accent,
                                                                        marginTop: '14px',
                                                                        marginBottom: '2px',
                                                                        lineHeight: 1.4,
                                                                        fontWeight: 'bold',
                                                                        textShadow: (selectedBg.id === 'bg_white' || selectedBg.isLight) ? 'none' : '0 4px 10px rgba(0,0,0,0.45)',
                                                                    }}
                                                                >
                                                                    سُورَةُ {getSurahName(ay.s)}
                                                                </span>
                                                            )}
                                                            {showBismillah && ay.s !== 9 && (
                                                                <span
                                                                    style={{
                                                                        display: 'block',
                                                                        fontFamily: 'var(--font-amiri-quran), var(--font-hafs), serif',
                                                                        fontSize: `${Math.round(chunkTypo.bismillahSize * 0.88)}px`,
                                                                        color: quranPagePalette ? (quranPagePalette.isDark ? quranPagePalette.gold : quranPagePalette.deep) : selectedBg.accent,
                                                                        marginBottom: '8px',
                                                                        lineHeight: 1.4,
                                                                        fontWeight: 'bold',
                                                                        textShadow: (selectedBg.id === 'bg_white' || selectedBg.isLight) ? 'none' : '0 4px 10px rgba(0,0,0,0.45)',
                                                                    }}
                                                                >
                                                                    بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                                                                </span>
                                                            )}
                                                        </>
                                                    )}
                                                    <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: renderTajweedTextHtml(getAyahText(ay.s, ay.a, false)) }} />
                                                    {quranPagePalette ? (
                                                        <>
                                                            <span style={{ color: quranPagePalette.verseBracket }}> ﴿</span>
                                                            <span style={{ color: quranPagePalette.verseNumber }}>{toArabic(ay.a)}</span>
                                                            <span style={{ color: quranPagePalette.verseBracket }}>﴾ </span>
                                                        </>
                                                    ) : (
                                                        ` ﴿${toArabic(ay.a)}﴾ `
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}
                                    </p>
                                    {chunkExplanation && (
                                        <p style={{
                                            fontFamily: 'var(--font-cairo), sans-serif',
                                            fontSize: `${chunkTypo.explanationFontSize}px`,
                                            color: textColor,
                                            opacity: 0.92,
                                            marginTop: '28px',
                                            textAlign: 'center',
                                            lineHeight: '1.65',
                                            textShadow: (selectedBg.id === 'bg_white' || selectedBg.isLight) ? 'none' : '0 4px 8px rgba(0,0,0,0.5)',
                                            maxWidth: '94%'
                                        }}>
                                            {chunkExplanation}
                                        </p>
                                    )}
                                    {!quranPagePalette && isShort && (
                                        selectedBg.type === 'share_design' && shareDesignAssets?.lowerMotifUrl ? (
                                            <img
                                                src={shareDesignAssets.lowerMotifUrl}
                                                alt=""
                                                style={{
                                                    width: '580px',
                                                    height: '128px',
                                                    objectFit: 'contain',
                                                    pointerEvents: 'none',
                                                    margin: '10px 0'
                                                }}
                                            />
                                        ) : (
                                            <IslamicFlourish color={selectedBg.accent} scale={2} />
                                        )
                                    )}
                                </div>

                                {/* Bottom Metadata & Footer */}
                                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, paddingBottom: customText ? (selectedFrame.id !== 'none' ? '20px' : '16px') : (selectedFrame.id !== 'none' ? '12px' : '8px'), gap: customText ? '10px' : '14px', boxSizing: 'border-box' }}>
                                    {quranPagePalette && (
                                        <QuranPageBottomDivider
                                            mushafPageNum={chunk.mushafPage}
                                            scale={1}
                                            quranPagePalette={quranPagePalette}
                                        />
                                    )}
                                    <p style={{ fontFamily: selectedFont, color: textColor, textShadow: (selectedBg.id === 'bg_white' || selectedBg.isLight) ? 'none' : '0 3px 6px rgba(0,0,0,0.5)', fontSize: '38px', fontWeight: 'bold', opacity: 0.96, textAlign: 'center', margin: 0, lineHeight: 1.35 }}>
                                        {chunk.surahInfoText}
                                    </p>
                                    {!quranPagePalette && (
                                        <div style={{ width: '60%', borderTop: `2px solid ${selectedBg.dividerColor || (selectedBg.isLight ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.35)')}` }}></div>
                                    )}
                                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                        <a
                                            href="https://play.google.com/store/apps/details?id=com.mushaf.ahmedandlayla"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ fontFamily: 'var(--font-lateef), serif', color: selectedBg.brandColor || selectedBg.accent, textShadow: (selectedBg.id === 'bg_white' || selectedBg.isLight) ? 'none' : '0 4px 10px rgba(0,0,0,0.85)', fontSize: '50px', fontWeight: 700, lineHeight: 1.25, textAlign: 'center', textDecoration: 'none' }}
                                            dir={isEn ? 'ltr' : 'rtl'}
                                        >
                                            {isEn ? 'Mushaf Ahmed & Laila' : 'مصحف أحمد و ليلى'}
                                        </a>
                                        {customText ? (
                                            <span
                                                style={{ fontFamily: selectedFont, color: textColor, textShadow: (selectedBg.id === 'bg_white' || selectedBg.isLight) ? 'none' : '0 3px 6px rgba(0,0,0,0.5)', fontSize: '48px', fontWeight: 600, maxWidth: '82%', textAlign: 'center', lineHeight: 1.25, opacity: 0.94, overflowWrap: 'anywhere', wordBreak: 'break-word' }}
                                            >
                                                {customText}
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
};
