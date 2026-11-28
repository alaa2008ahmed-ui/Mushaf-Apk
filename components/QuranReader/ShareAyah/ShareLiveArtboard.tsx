import React from 'react';
import { ChevronLeft, ChevronRight, Minus, Plus, Volume2 } from 'lucide-react';
import { toArabic } from '../constants';
import { renderTajweedTextHtml } from '../MushafPage';
import { QuranPageDesignPalette } from '../../../utils/share/shareCardDesignsQuran';
import {
    FrameOverlay,
    IslamicFlourish,
    QuranPageBottomDivider,
    QuranPageSurahBanner,
    SHARE_FONTS,
    ShareBgOption,
    ShareDesignAssets,
    ShareFrameOption,
    SharePageChunk,
    ShareStudioPalette,
    TEXT_COLORS,
    getChunkTypography,
    getShortFontLabel,
} from './shareStudioConstants';

interface ShareLiveArtboardProps {
    currentPageChunk: SharePageChunk | undefined;
    pageChunksLength: number;
    safePageIndex: number;
    setCurrentImagePageIndex: React.Dispatch<React.SetStateAction<number>>;
    userRatio: number;
    selectedBg: ShareBgOption;
    leftBg: ShareBgOption;
    rightBg: ShareBgOption;
    handleSelectBg: (bg: ShareBgOption) => void;
    selectedFrame: ShareFrameOption;
    selectedFont: string;
    setSelectedFont: React.Dispatch<React.SetStateAction<string>>;
    fontSize: number;
    setFontSize: React.Dispatch<React.SetStateAction<number>>;
    textColor: string;
    setTextColor: React.Dispatch<React.SetStateAction<string>>;
    customText: string;
    showBismillah: boolean;
    isMushafLikeMode: boolean;
    shareType: 'text' | 'image' | 'page' | 'audio';
    isEn: boolean;
    quranPagePalette: QuranPageDesignPalette | null;
    quranSurahBannerUrl: string;
    shareDesignAssets: ShareDesignAssets | null;
    studioGroup: 'typography' | null;
    setStudioGroup: React.Dispatch<React.SetStateAction<'typography' | null>>;
    setHideDesktopCustomization: React.Dispatch<React.SetStateAction<boolean>>;
    showSideTypographyRails: boolean;
    railW: number;
    sideColumnH: number;
    artboardW: number;
    artboardH: number;
    scaledW: number;
    scaledH: number;
    fitScale: number;
    hasMultiImagePager: boolean;
    palette: ShareStudioPalette;
    previewRef: React.RefObject<HTMLDivElement | null>;
    activeFontBtnRef: React.RefObject<HTMLButtonElement | null>;
    activeColorBtnRef: React.RefObject<HTMLButtonElement | null>;
    isPointerDraggingRef: React.MutableRefObject<boolean>;
    dragStartXRef: React.MutableRefObject<number>;
    dragStartYRef: React.MutableRefObject<number>;
    draggedFarRef: React.MutableRefObject<boolean>;
    dragOffset: number;
    setDragOffset: React.Dispatch<React.SetStateAction<number>>;
    getAyahText: (s: number, a: number, strip?: boolean) => string;
    getSurahName: (s: number) => string;
    getExplanationText: (s: number, a: number) => string;
}

export const ShareLiveArtboard: React.FC<ShareLiveArtboardProps> = ({
    currentPageChunk,
    pageChunksLength,
    safePageIndex,
    setCurrentImagePageIndex,
    userRatio,
    selectedBg,
    leftBg,
    rightBg,
    handleSelectBg,
    selectedFrame,
    selectedFont,
    setSelectedFont,
    fontSize,
    setFontSize,
    textColor,
    setTextColor,
    customText,
    showBismillah,
    isMushafLikeMode,
    shareType,
    isEn,
    quranPagePalette,
    quranSurahBannerUrl,
    shareDesignAssets,
    studioGroup,
    setStudioGroup,
    setHideDesktopCustomization,
    showSideTypographyRails,
    railW,
    sideColumnH,
    artboardW,
    artboardH,
    scaledW,
    scaledH,
    fitScale,
    hasMultiImagePager,
    palette,
    previewRef,
    activeFontBtnRef,
    activeColorBtnRef,
    isPointerDraggingRef,
    dragStartXRef,
    dragStartYRef,
    draggedFarRef,
    dragOffset,
    setDragOffset,
    getAyahText,
    getSurahName,
    getExplanationText,
}) => {
    if (!currentPageChunk) return null;

    const {
        accentBg,
        accentText,
        surfaceBg,
        textPrimary,
        flatNeutralBorder,
        flatActiveBorder,
        flatStrongBorder,
        tactileNeutralShadow,
        tactileActiveShadow,
    } = palette;

    const currentChunkTypo = getChunkTypography(currentPageChunk.totalChars, userRatio);
    const previewAyahSize = Math.max(7, Math.round((currentChunkTypo.ayahFontSize / 3) * 10) / 10);
    const previewBismillahSize = Math.max(8, Math.round((currentChunkTypo.bismillahSize / 3) * 10) / 10);
    const previewExplanationSize = Math.max(7, Math.round((currentChunkTypo.explanationFontSize / 3) * 10) / 10);
    const previewIsShort = currentPageChunk.totalChars < 280;
    const previewExplanation = currentPageChunk.ayahs
        .map((ay) => getExplanationText(ay.s, ay.a))
        .filter((t) => t)
        .join('\n');
    const firstPreviewAyah = currentPageChunk.ayahs[0];
    const hasMultiplePreviewSurahs = currentPageChunk.ayahs.some((ay, idx) => idx > 0 && ay.s !== firstPreviewAyah?.s);
    const isPreviewFatihaStart = firstPreviewAyah?.s === 1 && firstPreviewAyah?.a === 1;
    const showPreviewTopBismillah =
        showBismillah &&
        isMushafLikeMode &&
        !(firstPreviewAyah?.s === 9 && firstPreviewAyah?.a === 1) &&
        !(quranPagePalette && isPreviewFatihaStart);
    const showPreviewTopSurahLabel =
        shareType === 'page' &&
        hasMultiplePreviewSurahs &&
        firstPreviewAyah?.a === 1;

    const handlePointerDown = (e: React.PointerEvent) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        isPointerDraggingRef.current = true;
        dragStartXRef.current = e.clientX;
        dragStartYRef.current = e.clientY;
        draggedFarRef.current = false;
        setDragOffset(0);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isPointerDraggingRef.current) return;
        const diffX = e.clientX - dragStartXRef.current;
        const diffY = e.clientY - dragStartYRef.current;
        if (Math.abs(diffX) > 8 || Math.abs(diffY) > 8) {
            draggedFarRef.current = true;
        }
        if (Math.abs(diffX) > Math.abs(diffY)) {
            setDragOffset(Math.max(-85, Math.min(85, diffX * 0.75)));
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (!isPointerDraggingRef.current) return;
        isPointerDraggingRef.current = false;
        const diffX = e.clientX - dragStartXRef.current;
        const diffY = e.clientY - dragStartYRef.current;
        if (Math.abs(diffX) > 18 && Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > 0) {
                handleSelectBg(leftBg);
            } else {
                handleSelectBg(rightBg);
            }
        }
        setDragOffset(0);
    };

    const handlePointerCancel = () => {
        isPointerDraggingRef.current = false;
        setDragOffset(0);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length !== 1) return;
        isPointerDraggingRef.current = true;
        dragStartXRef.current = e.touches[0].clientX;
        dragStartYRef.current = e.touches[0].clientY;
        draggedFarRef.current = false;
        setDragOffset(0);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isPointerDraggingRef.current || e.touches.length !== 1) return;
        const diffX = e.touches[0].clientX - dragStartXRef.current;
        const diffY = e.touches[0].clientY - dragStartYRef.current;
        if (Math.abs(diffX) > 8 || Math.abs(diffY) > 8) {
            draggedFarRef.current = true;
        }
        if (Math.abs(diffX) > Math.abs(diffY)) {
            setDragOffset(Math.max(-85, Math.min(85, diffX * 0.75)));
        }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!isPointerDraggingRef.current) return;
        isPointerDraggingRef.current = false;
        const diffX = (e.changedTouches?.[0]?.clientX ?? dragStartXRef.current) - dragStartXRef.current;
        const diffY = (e.changedTouches?.[0]?.clientY ?? dragStartYRef.current) - dragStartYRef.current;
        if (Math.abs(diffX) > 18 && Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > 0) {
                handleSelectBg(leftBg);
            } else {
                handleSelectBg(rightBg);
            }
        }
        setDragOffset(0);
    };

    return (
        <div
            className="flex flex-col items-center justify-center w-full h-full min-h-0 overflow-clip relative"
            onClick={() => {
                if (studioGroup !== null) setStudioGroup(null);
            }}
        >
            <div
                className="flex items-center justify-center gap-2 sm:gap-3.5 relative select-none touch-pan-y"
                dir="ltr"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
            >
                {showSideTypographyRails && (
                    <div
                        className="lg:hidden shrink-0 flex flex-col items-center justify-between"
                        style={{ width: `${railW}px`, height: `${sideColumnH}px` }}
                        onClick={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                    >
                        <div className="flex-1 min-h-0 w-full flex flex-col items-center animate-fadeIn">
                            <div className="w-full h-full overflow-y-auto hide-scrollbar overscroll-contain touch-pan-y flex flex-col gap-1.5 px-1 py-1">
                                {SHARE_FONTS.map((font) => {
                                    const isSelected = selectedFont === font.id;
                                    return (
                                        <button
                                            key={font.id}
                                            ref={isSelected ? activeFontBtnRef : undefined}
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedFont(font.id);
                                            }}
                                            className="w-full py-1.5 px-1 rounded-xl shrink-0 border-0 cursor-pointer transition-all active:scale-95 flex items-center justify-center text-center leading-tight"
                                            style={{
                                                fontFamily: 'var(--font-ui)',
                                                fontSize: '10.5px',
                                                fontWeight: 700,
                                                backgroundColor: isSelected ? accentBg : surfaceBg,
                                                color: isSelected ? accentText : textPrimary,
                                                border: isSelected ? flatActiveBorder : flatNeutralBorder,
                                                boxShadow: isSelected ? tactileActiveShadow : tactileNeutralShadow,
                                            }}
                                            title={isEn ? (font.nameEn || font.name) : font.name}
                                        >
                                            <span className="truncate w-full text-center">
                                                {getShortFontLabel(font, isEn)}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="shrink-0 w-full flex items-center justify-center pt-2 animate-fadeIn">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setFontSize((prev) => Math.min(48, prev + 2));
                                }}
                                disabled={fontSize >= 48}
                                className="w-10 h-10 rounded-full border-0 cursor-pointer flex items-center justify-center transition-all active:translate-y-0.5 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{
                                    backgroundColor: surfaceBg,
                                    color: textPrimary,
                                    border: flatNeutralBorder,
                                    boxShadow: tactileNeutralShadow,
                                }}
                                title={isEn ? 'Increase font size' : 'تكبير الخط'}
                                aria-label={isEn ? 'Increase font size' : 'تكبير الخط'}
                            >
                                <Plus size={18} strokeWidth={2.75} />
                            </button>
                        </div>
                    </div>
                )}

                <div
                    className="share-preview-artboard-wrap cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (draggedFarRef.current) return;
                        if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
                            setHideDesktopCustomization((prev) => !prev);
                        } else {
                            setStudioGroup((prev) => (prev === 'typography' ? null : 'typography'));
                        }
                    }}
                    style={{
                        width: `${scaledW}px`,
                        height: `${scaledH}px`,
                        position: 'relative',
                        flexShrink: 0,
                        borderRadius: '20px',
                        overflow: 'hidden',
                        transform: dragOffset ? `translateX(${dragOffset}px)` : undefined,
                        transition: isPointerDraggingRef.current ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                        border: flatStrongBorder,
                        boxShadow: 'none',
                    }}
                >
                    <div
                        ref={previewRef}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: `${artboardW}px`,
                            height: `${artboardH}px`,
                            transform: `scale(${fitScale})`,
                            transformOrigin: 'top left',
                            boxSizing: 'border-box',
                            borderRadius: selectedBg.type === 'share_design' ? '0px' : '12px',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding:
                                quranPagePalette
                                    ? selectedFrame.id !== 'none'
                                        ? '32px 30px 30px 30px'
                                        : '25px 25px 24px 25px'
                                    : selectedBg.type === 'share_design'
                                    ? selectedFrame.id !== 'none'
                                        ? '55px 43px 54px 43px'
                                        : '51px 39px 50px 39px'
                                    : selectedFrame.id !== 'none'
                                    ? '31px 37px 39px 37px'
                                    : '23px 21px 19px 21px',
                            textAlign: 'center',
                            backgroundColor: selectedBg.type === 'solid' ? selectedBg.value : undefined,
                            backgroundImage: selectedBg.type !== 'solid' ? selectedBg.value : undefined,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            border: selectedBg.type === 'share_design' ? 'none' : `4px solid ${selectedBg.border}`,
                            direction: isEn ? 'ltr' : 'rtl',
                        }}
                    >
                        {selectedBg.type === 'share_design' && shareDesignAssets?.previewBackdropUrl ? (
                            <img
                                src={shareDesignAssets.previewBackdropUrl}
                                alt=""
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'fill',
                                    pointerEvents: 'none',
                                    zIndex: 0,
                                }}
                            />
                        ) : (
                            selectedBg.id !== 'bg_white' &&
                            !selectedBg.isLight && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        backgroundColor: selectedBg.overlay || 'rgba(0, 0, 0, 0.22)',
                                    }}
                                />
                            )
                        )}

                        <FrameOverlay frame={selectedFrame} scale={4 / 3} />

                        <div
                            style={{
                                position: 'relative',
                                zIndex: 10,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                width: '100%',
                                height: '100%',
                                flex: 1,
                                boxSizing: 'border-box',
                            }}
                        >
                            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '3px' }}>
                                {quranPagePalette && firstPreviewAyah && (
                                    <QuranPageSurahBanner
                                        surahNum={firstPreviewAyah.s}
                                        scale={1 / 3}
                                        isEn={isEn}
                                        quranPagePalette={quranPagePalette}
                                        quranSurahBannerUrl={quranSurahBannerUrl}
                                    />
                                )}
                                {!quranPagePalette && showPreviewTopSurahLabel && (
                                    <p
                                        style={{
                                            fontFamily: 'var(--font-amiri-quran), var(--font-hafs), serif',
                                            fontSize: `${Math.round(previewBismillahSize * 0.92 * 10) / 10}px`,
                                            color: selectedBg.accent,
                                            margin: '0 0 1px 0',
                                            textShadow: selectedBg.id === 'bg_white' || selectedBg.isLight ? 'none' : '0 1.5px 3.5px rgba(0,0,0,0.45)',
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        سُورَةُ {getSurahName(firstPreviewAyah.s)}
                                    </p>
                                )}
                                {showPreviewTopBismillah && (
                                    <p
                                        style={{
                                            fontFamily: 'var(--font-amiri-quran), var(--font-hafs), serif',
                                            fontSize: `${previewBismillahSize}px`,
                                            color: quranPagePalette ? (quranPagePalette.isDark ? quranPagePalette.gold : quranPagePalette.deep) : selectedBg.accent,
                                            margin: 0,
                                            textShadow: selectedBg.id === 'bg_white' || selectedBg.isLight ? 'none' : '0 2px 4px rgba(0,0,0,0.5)',
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                                    </p>
                                )}
                                {!quranPagePalette && previewIsShort &&
                                    (selectedBg.type === 'share_design' && shareDesignAssets?.upperMotifUrl ? (
                                        <img
                                            src={shareDesignAssets.upperMotifUrl}
                                            alt=""
                                            style={{
                                                width: '193px',
                                                height: '43px',
                                                objectFit: 'contain',
                                                pointerEvents: 'none',
                                                margin: '3px 0',
                                            }}
                                        />
                                    ) : (
                                        <IslamicFlourish color={selectedBg.accent} scale={2 / 3} />
                                    ))}
                            </div>

                            <div
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    width: '100%',
                                    padding: selectedFrame.id !== 'none' ? '4px 9px' : '4px 0',
                                    minHeight: 0,
                                    boxSizing: 'border-box',
                                }}
                            >
                                <p
                                    className="share-preview-text"
                                    style={{
                                        lineHeight: currentChunkTypo.lineHeight,
                                        fontFamily: selectedFont,
                                        fontSize: `${previewAyahSize}px`,
                                        color: textColor,
                                        textShadow: selectedBg.id === 'bg_white' || selectedBg.isLight ? 'none' : '0 2px 5px rgba(0,0,0,0.55)',
                                        margin: 0,
                                        fontWeight: 'bold',
                                        whiteSpace: 'normal',
                                        letterSpacing: 0,
                                        wordBreak: 'keep-all',
                                        fontFeatureSettings: '"kern", "liga", "clig", "calt", "ccmp"',
                                        textRendering: 'optimizeLegibility',
                                        textAlign: 'center',
                                        width: '100%',
                                        padding: selectedFrame.id !== 'none' ? '0 7px' : '0',
                                        boxSizing: 'border-box',
                                    }}
                                >
                                    {currentPageChunk.ayahs.map((ay, idx) => {
                                        const isNewMidChunkSurah = idx > 0 && ay.a === 1;
                                        return (
                                            <React.Fragment key={`${ay.s}-${ay.a}-${idx}`}>
                                                {isNewMidChunkSurah && (
                                                    <>
                                                        {quranPagePalette ? (
                                                            <span style={{ display: 'block', marginTop: '5px' }}>
                                                                <QuranPageSurahBanner
                                                                    surahNum={ay.s}
                                                                    scale={1 / 3}
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
                                                                    fontSize: `${Math.round(previewBismillahSize * 0.9 * 10) / 10}px`,
                                                                    color: selectedBg.accent,
                                                                    marginTop: '5px',
                                                                    marginBottom: '1px',
                                                                    lineHeight: 1.4,
                                                                    fontWeight: 'bold',
                                                                    textShadow: selectedBg.id === 'bg_white' || selectedBg.isLight ? 'none' : '0 1.5px 3.5px rgba(0,0,0,0.45)',
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
                                                                    fontSize: `${Math.round(previewBismillahSize * 0.88 * 10) / 10}px`,
                                                                    color: quranPagePalette ? (quranPagePalette.isDark ? quranPagePalette.gold : quranPagePalette.deep) : selectedBg.accent,
                                                                    marginBottom: '3px',
                                                                    lineHeight: 1.4,
                                                                    fontWeight: 'bold',
                                                                    textShadow: selectedBg.id === 'bg_white' || selectedBg.isLight ? 'none' : '0 1.5px 3.5px rgba(0,0,0,0.45)',
                                                                }}
                                                            >
                                                                بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                                <span
                                                    style={{ display: 'contents' }}
                                                    dangerouslySetInnerHTML={{
                                                        __html: renderTajweedTextHtml(getAyahText(ay.s, ay.a, false)),
                                                    }}
                                                />
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

                                {previewExplanation && (
                                    <p
                                        style={{
                                            fontFamily: 'var(--font-cairo), sans-serif',
                                            fontSize: `${previewExplanationSize}px`,
                                            color: textColor,
                                            opacity: 0.92,
                                            marginTop: '9px',
                                            textAlign: 'center',
                                            lineHeight: '1.6',
                                            textShadow: selectedBg.id === 'bg_white' || selectedBg.isLight ? 'none' : '0 1px 3px rgba(0,0,0,0.5)',
                                            maxWidth: '94%',
                                        }}
                                    >
                                        {previewExplanation}
                                    </p>
                                )}

                                {!quranPagePalette && previewIsShort &&
                                    (selectedBg.type === 'share_design' && shareDesignAssets?.lowerMotifUrl ? (
                                        <img
                                            src={shareDesignAssets.lowerMotifUrl}
                                            alt=""
                                            style={{
                                                width: '193px',
                                                height: '43px',
                                                objectFit: 'contain',
                                                pointerEvents: 'none',
                                                margin: '3px 0',
                                            }}
                                        />
                                    ) : (
                                        <IslamicFlourish color={selectedBg.accent} scale={2 / 3} />
                                    ))}
                            </div>

                            <div
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    flexShrink: 0,
                                    paddingBottom: customText
                                        ? selectedFrame.id !== 'none'
                                            ? '7px'
                                            : '5px'
                                        : selectedFrame.id !== 'none'
                                        ? '4px'
                                        : '3px',
                                    gap: customText ? '3.5px' : '5px',
                                    boxSizing: 'border-box',
                                }}
                            >
                                {quranPagePalette && (
                                    <QuranPageBottomDivider
                                        mushafPageNum={currentPageChunk.mushafPage}
                                        scale={1 / 3}
                                        quranPagePalette={quranPagePalette}
                                    />
                                )}
                                <p
                                    style={{
                                        fontFamily: selectedFont,
                                        color: textColor,
                                        textShadow: selectedBg.id === 'bg_white' || selectedBg.isLight ? 'none' : '0 1px 2px rgba(0,0,0,0.5)',
                                        fontSize: '12.5px',
                                        fontWeight: 'bold',
                                        opacity: 0.96,
                                        textAlign: 'center',
                                        margin: 0,
                                        lineHeight: 1.35,
                                    }}
                                >
                                    {currentPageChunk.surahInfoText}
                                </p>
                                {!quranPagePalette && (
                                    <div
                                        style={{
                                            width: '60%',
                                            borderTop: `1px solid ${selectedBg.dividerColor || (selectedBg.isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.35)')}`,
                                        }}
                                    />
                                )}
                                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                    <span
                                        style={{
                                            fontFamily: 'var(--font-lateef), serif',
                                            color: selectedBg.brandColor || selectedBg.accent,
                                            textShadow: selectedBg.id === 'bg_white' || selectedBg.isLight ? 'none' : '0 1px 3px rgba(0,0,0,0.85)',
                                            fontSize: '16.5px',
                                            fontWeight: 700,
                                            lineHeight: 1.25,
                                            textAlign: 'center',
                                        }}
                                        dir={isEn ? 'ltr' : 'rtl'}
                                    >
                                        {isEn ? 'Mushaf Ahmed & Laila' : 'مصحف أحمد و ليلى'}
                                    </span>
                                    {customText ? (
                                        <span
                                            style={{
                                                fontFamily: selectedFont,
                                                color: textColor,
                                                textShadow: selectedBg.id === 'bg_white' || selectedBg.isLight ? 'none' : '0 1px 2px rgba(0,0,0,0.5)',
                                                fontSize: '16px',
                                                fontWeight: 600,
                                                maxWidth: '82%',
                                                textAlign: 'center',
                                                lineHeight: 1.25,
                                                opacity: 0.94,
                                                overflowWrap: 'anywhere',
                                                wordBreak: 'break-word',
                                            }}
                                        >
                                            {customText}
                                        </span>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onPointerDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleSelectBg(leftBg);
                        }}
                        className="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-0 cursor-pointer transition-transform active:scale-90"
                        style={{
                            backgroundColor: surfaceBg,
                            color: textPrimary,
                            border: flatNeutralBorder,
                            boxShadow: tactileNeutralShadow,
                        }}
                        title={leftBg.name}
                        aria-label={isEn ? 'Previous design' : 'التصميم السابق'}
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        type="button"
                        onPointerDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleSelectBg(rightBg);
                        }}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-0 cursor-pointer transition-opacity active:opacity-75"
                        style={{
                            backgroundColor: surfaceBg,
                            color: textPrimary,
                            border: flatNeutralBorder,
                            boxShadow: tactileNeutralShadow,
                        }}
                        title={rightBg.name}
                        aria-label={isEn ? 'Next design' : 'التصميم التالي'}
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>

                {showSideTypographyRails && (
                    <div
                        className="lg:hidden shrink-0 flex flex-col items-center justify-between"
                        style={{ width: `${railW}px`, height: `${sideColumnH}px` }}
                        onClick={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                    >
                        <div className="flex-1 min-h-0 w-full flex flex-col items-center animate-fadeIn">
                            <div className="w-full h-full overflow-y-auto hide-scrollbar overscroll-contain touch-pan-y flex flex-col items-center gap-2 px-1 py-1">
                                {TEXT_COLORS.map((color) => {
                                    const isSelected = textColor === color;
                                    return (
                                        <button
                                            key={color}
                                            ref={isSelected ? activeColorBtnRef : undefined}
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setTextColor(color);
                                            }}
                                            className={`w-7 h-7 rounded-full shrink-0 cursor-pointer transition-transform active:scale-90 ${
                                                isSelected ? 'scale-110' : 'opacity-90 hover:opacity-100'
                                            }`}
                                            style={{
                                                backgroundColor: color,
                                                border: isSelected
                                                    ? `2.5px solid ${accentBg}`
                                                    : '1.5px solid rgba(148,163,184,0.45)',
                                                boxShadow: 'none',
                                            }}
                                            aria-label={color}
                                        />
                                    );
                                })}
                            </div>
                        </div>

                        <div className="shrink-0 w-full flex items-center justify-center pt-2 animate-fadeIn">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setFontSize((prev) => Math.max(12, prev - 2));
                                }}
                                disabled={fontSize <= 12}
                                className="w-10 h-10 rounded-full border-0 cursor-pointer flex items-center justify-center transition-opacity active:opacity-75 disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{
                                    backgroundColor: surfaceBg,
                                    color: textPrimary,
                                    border: flatNeutralBorder,
                                    boxShadow: tactileNeutralShadow,
                                }}
                                title={isEn ? 'Decrease font size' : 'تصغير الخط'}
                                aria-label={isEn ? 'Decrease font size' : 'تصغير الخط'}
                            >
                                <Minus size={18} strokeWidth={2.75} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {hasMultiImagePager && (
                <div
                    className="flex items-center justify-between gap-2 mt-2 px-2.5 py-1.5 rounded-full shrink-0"
                    style={{
                        backgroundColor: surfaceBg,
                        border: flatNeutralBorder,
                        boxShadow: tactileNeutralShadow,
                    }}
                >
                    <button
                        type="button"
                        onClick={() => setCurrentImagePageIndex((prev) => Math.max(0, prev - 1))}
                        disabled={safePageIndex === 0}
                        className="w-7 h-7 rounded-full flex items-center justify-center disabled:opacity-30 border-0 cursor-pointer transition-all active:translate-y-0.5 active:scale-90"
                        style={{ backgroundColor: surfaceBg, color: textPrimary, border: flatNeutralBorder, boxShadow: tactileNeutralShadow }}
                        title="الصورة السابقة"
                    >
                        <ChevronRight size={15} />
                    </button>
                    <span className="text-[11px] font-extrabold px-1.5 tabular-nums whitespace-nowrap" style={{ color: textPrimary }}>
                        {isEn ? `Slide ${safePageIndex + 1} / ${pageChunksLength}` : `صورة ${toArabic(safePageIndex + 1)} من ${toArabic(pageChunksLength)}`}
                    </span>
                    <button
                        type="button"
                        onClick={() => setCurrentImagePageIndex((prev) => Math.min(pageChunksLength - 1, prev + 1))}
                        disabled={safePageIndex >= pageChunksLength - 1}
                        className="w-7 h-7 rounded-full flex items-center justify-center disabled:opacity-30 border-0 cursor-pointer transition-all active:translate-y-0.5 active:scale-90"
                        style={{ backgroundColor: surfaceBg, color: textPrimary, border: flatNeutralBorder, boxShadow: tactileNeutralShadow }}
                        title="الصورة التالية"
                    >
                        <ChevronLeft size={15} />
                    </button>
                </div>
            )}
        </div>
    );
};

interface ShareNonImagePreviewProps {
    shareType: 'text' | 'audio';
    surahInfo: string;
    combinedText: string;
    combinedExplanation: string;
    handleCopy: () => void;
    isCopying: boolean;
    isCopiedFeedback: boolean;
    fromAyah: number;
    toAyah: number;
    surahNumber: number;
    getSurahName: (s: number) => string;
    isEn: boolean;
    palette: ShareStudioPalette;
}

export const ShareNonImagePreview: React.FC<ShareNonImagePreviewProps> = ({
    shareType,
    surahInfo,
    combinedText,
    combinedExplanation,
    handleCopy,
    isCopying,
    isCopiedFeedback,
    fromAyah,
    toAyah,
    surahNumber,
    getSurahName,
    isEn,
    palette,
}) => {
    const {
        accentBg,
        accentText,
        surfaceBg,
        trackBg,
        dividerColor,
        textPrimary,
        textMuted,
        flatNeutralBorder,
        flatActiveBorder,
        tactileNeutralShadow,
        tactileActiveShadow,
        tactileInsetShadow,
        tactileCardShadow,
    } = palette;

    if (shareType === 'text') {
        return (
            <div
                className="w-full max-w-[440px] max-h-full rounded-3xl p-5 flex flex-col gap-3.5 overflow-y-auto"
                style={{
                    backgroundColor: surfaceBg,
                    border: flatNeutralBorder,
                    boxShadow: tactileCardShadow,
                }}
            >
                <div className="flex items-center justify-between gap-2 pb-2 border-b" style={{ borderColor: dividerColor }}>
                    <span className="text-xs font-extrabold" style={{ color: accentBg }}>
                        {surahInfo}
                    </span>
                    <button
                        type="button"
                        onClick={handleCopy}
                        disabled={isCopying}
                        className="px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center justify-center border-0 cursor-pointer transition-all active:translate-y-0.5 active:scale-95 shrink-0"
                        style={{
                            backgroundColor: isCopiedFeedback ? accentBg : surfaceBg,
                            color: isCopiedFeedback ? accentText : textPrimary,
                            border: isCopiedFeedback ? flatActiveBorder : flatNeutralBorder,
                            boxShadow: isCopiedFeedback ? tactileActiveShadow : tactileNeutralShadow,
                        }}
                    >
                        <span>{isCopiedFeedback ? (isEn ? 'Copied' : 'تم النسخ') : (isEn ? 'Copy' : 'نسخ النص')}</span>
                    </button>
                </div>

                <p
                    className="text-lg sm:text-xl leading-[2] font-bold text-center"
                    style={{ fontFamily: 'var(--font-amiri-quran), serif', color: textPrimary }}
                >
                    {combinedText}
                </p>

                {combinedExplanation && (
                    <div
                        className="pt-3 border-t text-xs sm:text-sm leading-relaxed text-justify"
                        style={{ borderColor: dividerColor, color: textMuted }}
                    >
                        {combinedExplanation}
                    </div>
                )}

                <div className="pt-2 border-t text-center text-[11px] font-semibold" style={{ borderColor: dividerColor, color: textMuted }}>
                    {isEn ? 'Shared via Mushaf Ahmed & Laila' : 'آيات من القرآن الكريم · بواسطة مصحف أحمد و ليلى'}
                </div>
            </div>
        );
    }

    const start = Math.min(fromAyah, toAyah);
    const end = Math.max(fromAyah, toAyah);
    const audioFileName =
        start === end
            ? `سورة ${getSurahName(surahNumber)} الايه${String(start).padStart(2, '0')}.mp3`
            : `سورة ${getSurahName(surahNumber)} الايه من ${String(start).padStart(2, '0')} الى ${String(end).padStart(2, '0')}.mp3`;

    return (
        <div
            className="w-full max-w-[360px] rounded-3xl p-6 flex flex-col items-center text-center gap-4"
            style={{
                backgroundColor: surfaceBg,
                border: flatNeutralBorder,
                boxShadow: tactileCardShadow,
            }}
        >
            <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: accentBg, color: accentText, border: flatActiveBorder, boxShadow: tactileActiveShadow }}
            >
                <Volume2 size={30} />
            </div>

            <div className="space-y-1">
                <h4 className="text-base font-black" style={{ color: textPrimary }}>
                    {isEn ? 'Audio Recitation MP3' : 'تلاوة قرآنية بصيغة MP3'}
                </h4>
                <p className="text-xs font-semibold" style={{ color: textMuted }}>
                    {surahInfo}
                </p>
            </div>

            <div className="flex items-center justify-center gap-1.5 h-10 w-full px-4" aria-hidden="true">
                {[28, 52, 76, 44, 92, 64, 84, 38, 72, 96, 56, 40, 78, 48, 30].map((hPct, idx) => (
                    <span
                        key={idx}
                        className="w-1.5 rounded-full"
                        style={{
                            height: `${hPct}%`,
                            backgroundColor: accentBg,
                            opacity: idx % 2 === 0 ? 0.88 : 0.45,
                            boxShadow: 'none',
                        }}
                    />
                ))}
            </div>

            <div
                className="w-full px-3 py-2 rounded-xl text-[11px] font-bold truncate"
                style={{ backgroundColor: trackBg, color: textPrimary, border: flatNeutralBorder, boxShadow: tactileInsetShadow }}
                dir="rtl"
            >
                {audioFileName}
            </div>
        </div>
    );
};
