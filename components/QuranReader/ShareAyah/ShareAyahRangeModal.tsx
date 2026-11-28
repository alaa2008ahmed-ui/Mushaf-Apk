import React from 'react';
import { X } from 'lucide-react';
import { toArabic } from '../constants';
import { ShareStudioPalette } from './shareStudioConstants';

interface ShareAyahRangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    surahNumber: number;
    ayahs: any[];
    fromAyah: number;
    setFromAyah: React.Dispatch<React.SetStateAction<number>>;
    toAyah: number;
    setToAyah: React.Dispatch<React.SetStateAction<number>>;
    rangeSelectionMode: 'single' | 'range';
    setRangeSelectionMode: React.Dispatch<React.SetStateAction<'single' | 'range'>>;
    rangeActiveStep: 'from' | 'to';
    setRangeActiveStep: React.Dispatch<React.SetStateAction<'from' | 'to'>>;
    rangeListRef: React.RefObject<HTMLDivElement | null>;
    selectedAyahRef: React.RefObject<HTMLButtonElement | null>;
    getSurahName: (s: number) => string;
    getAyahText: (s: number, a: number, strip?: boolean) => string;
    isEn: boolean;
    palette: ShareStudioPalette;
}

export const ShareAyahRangeModal: React.FC<ShareAyahRangeModalProps> = ({
    isOpen,
    onClose,
    surahNumber,
    ayahs,
    fromAyah,
    setFromAyah,
    toAyah,
    setToAyah,
    rangeSelectionMode,
    setRangeSelectionMode,
    rangeActiveStep,
    setRangeActiveStep,
    rangeListRef,
    selectedAyahRef,
    getSurahName,
    getAyahText,
    isEn,
    palette,
}) => {
    if (!isOpen) return null;

    const {
        accentBg,
        accentText,
        surfaceBg,
        trackBg,
        dividerColor,
        textPrimary,
        flatNeutralBorder,
        flatActiveBorder,
        flatStrongBorder,
        tactileNeutralShadow,
        tactileActiveShadow,
        tactileInsetShadow,
        tactileCardShadow,
    } = palette;

    return (
        <div
            className="fixed inset-0 z-[1220] bg-black/60 flex items-center justify-center p-4 overflow-clip"
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
            }}
        >
            <div
                className="madinah-flat-submodal w-full max-w-[360px] flex flex-col max-h-[75dvh] overflow-clip rounded-3xl border-0"
                style={{ backgroundColor: surfaceBg, color: textPrimary, border: flatStrongBorder, boxShadow: tactileCardShadow }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-3.5 pb-2.5 border-b space-y-2.5 shrink-0" style={{ borderColor: dividerColor }}>
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-black" style={{ color: textPrimary }}>
                            {isEn ? `Select Verses · ${getSurahName(surahNumber)}` : `تحديد الآيات · سورة ${getSurahName(surahNumber)}`}
                        </span>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-8 h-8 rounded-full flex items-center justify-center border-0 cursor-pointer transition-all active:translate-y-0.5 active:scale-90"
                            style={{ backgroundColor: surfaceBg, color: textPrimary, border: flatNeutralBorder, boxShadow: tactileNeutralShadow }}
                        >
                            <X size={15} />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl" style={{ backgroundColor: trackBg, border: flatNeutralBorder, boxShadow: tactileInsetShadow }}>
                        <button
                            type="button"
                            onClick={() => {
                                setRangeSelectionMode('single');
                                setRangeActiveStep('from');
                            }}
                            className="py-1.5 px-2 rounded-xl text-xs font-extrabold border-0 cursor-pointer transition-all active:translate-y-0.5"
                            style={{
                                backgroundColor: rangeSelectionMode === 'single' ? accentBg : surfaceBg,
                                color: rangeSelectionMode === 'single' ? accentText : textPrimary,
                                border: rangeSelectionMode === 'single' ? flatActiveBorder : flatNeutralBorder,
                                boxShadow: rangeSelectionMode === 'single' ? tactileActiveShadow : tactileNeutralShadow,
                            }}
                        >
                            {isEn ? 'Single Ayah' : 'آية واحدة'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setRangeSelectionMode('range');
                            }}
                            className="py-1.5 px-2 rounded-xl text-xs font-extrabold border-0 cursor-pointer transition-all active:translate-y-0.5"
                            style={{
                                backgroundColor: rangeSelectionMode === 'range' ? accentBg : surfaceBg,
                                color: rangeSelectionMode === 'range' ? accentText : textPrimary,
                                border: rangeSelectionMode === 'range' ? flatActiveBorder : flatNeutralBorder,
                                boxShadow: rangeSelectionMode === 'range' ? tactileActiveShadow : tactileNeutralShadow,
                            }}
                        >
                            {isEn ? 'Verse Range' : 'من آية إلى آية'}
                        </button>
                    </div>

                    {rangeSelectionMode === 'range' && (
                        <div className="grid grid-cols-2 gap-2 pt-0.5">
                            <button
                                type="button"
                                onClick={() => setRangeActiveStep('from')}
                                className="py-2 px-3 rounded-xl text-xs font-extrabold border-0 cursor-pointer flex items-center justify-center gap-1.5 transition-all active:translate-y-0.5"
                                style={{
                                    backgroundColor: rangeActiveStep === 'from' ? accentBg : surfaceBg,
                                    color: rangeActiveStep === 'from' ? accentText : textPrimary,
                                    border: rangeActiveStep === 'from' ? flatActiveBorder : flatNeutralBorder,
                                    boxShadow: rangeActiveStep === 'from' ? tactileActiveShadow : tactileNeutralShadow,
                                }}
                            >
                                <span>{isEn ? 'From:' : 'من الآية:'}</span>
                                <span className="tabular-nums">{toArabic(fromAyah)}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRangeActiveStep('to')}
                                className="py-2 px-3 rounded-xl text-xs font-extrabold border-0 cursor-pointer flex items-center justify-center gap-1.5 transition-all active:translate-y-0.5"
                                style={{
                                    backgroundColor: rangeActiveStep === 'to' ? accentBg : surfaceBg,
                                    color: rangeActiveStep === 'to' ? accentText : textPrimary,
                                    border: rangeActiveStep === 'to' ? flatActiveBorder : flatNeutralBorder,
                                    boxShadow: rangeActiveStep === 'to' ? tactileActiveShadow : tactileNeutralShadow,
                                }}
                            >
                                <span>{isEn ? 'To:' : 'إلى الآية:'}</span>
                                <span className="tabular-nums">{toArabic(toAyah)}</span>
                            </button>
                        </div>
                    )}
                </div>

                <div ref={rangeListRef} className="flex-1 min-h-0 overflow-y-auto px-3.5 py-3 space-y-2.5">
                    {ayahs.map((ay: any) => {
                        const val = ay.numberInSurah;
                        const startVal = Math.min(fromAyah, toAyah);
                        const endVal = Math.max(fromAyah, toAyah);
                        const isEndpoint =
                            rangeSelectionMode === 'single'
                                ? fromAyah === val
                                : (rangeActiveStep === 'from' ? fromAyah === val : toAyah === val);
                        const inRange = rangeSelectionMode === 'range' && val >= startVal && val <= endVal;
                        const snippet = getAyahText(surahNumber, val);

                        return (
                            <button
                                key={val}
                                type="button"
                                ref={isEndpoint ? selectedAyahRef : undefined}
                                onClick={() => {
                                    if (rangeSelectionMode === 'single') {
                                        setFromAyah(val);
                                        setToAyah(val);
                                        onClose();
                                    } else if (rangeActiveStep === 'from') {
                                        setFromAyah(val);
                                        if (val > toAyah) setToAyah(val);
                                        setRangeActiveStep('to');
                                    } else {
                                        if (val < fromAyah) {
                                            setToAyah(fromAyah);
                                            setFromAyah(val);
                                        } else {
                                            setToAyah(val);
                                        }
                                        onClose();
                                    }
                                }}
                                className="w-full py-2 px-3.5 rounded-2xl border-0 flex items-center gap-3 text-start cursor-pointer transition-transform active:scale-[0.98]"
                                style={{
                                    backgroundColor: isEndpoint
                                        ? accentBg
                                        : inRange
                                        ? `${accentBg}22`
                                        : surfaceBg,
                                    color: isEndpoint ? accentText : textPrimary,
                                    border: isEndpoint ? flatActiveBorder : flatNeutralBorder,
                                    boxShadow: isEndpoint ? tactileActiveShadow : tactileNeutralShadow,
                                }}
                            >
                                <span
                                    className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-sm font-black tabular-nums"
                                    style={{
                                        fontFamily: 'var(--font-ui)',
                                        backgroundColor: isEndpoint ? 'rgba(255,255,255,0.22)' : surfaceBg,
                                        color: isEndpoint ? accentText : accentBg,
                                        border: isEndpoint ? '1px solid rgba(255,255,255,0.28)' : `1px solid ${dividerColor}`,
                                        boxShadow: 'none',
                                    }}
                                >
                                    {toArabic(val)}
                                </span>
                                <span
                                    className="flex-1 min-w-0 block text-[15px] leading-[2.3] py-1 truncate text-right"
                                    style={{ fontFamily: 'var(--font-amiri-quran), serif' }}
                                    dir="rtl"
                                >
                                    {snippet}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {rangeSelectionMode === 'range' && (
                    <div className="p-3 border-t shrink-0" style={{ borderColor: dividerColor }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full py-2.5 rounded-2xl text-xs font-extrabold border-0 cursor-pointer transition-transform active:scale-95"
                            style={{
                                backgroundColor: accentBg,
                                color: accentText,
                                border: flatActiveBorder,
                                boxShadow: tactileActiveShadow,
                            }}
                        >
                            {isEn
                                ? `Apply (${fromAyah} – ${toAyah})`
                                : `تطبيق النطاق (${toArabic(Math.min(fromAyah, toAyah))} – ${toArabic(Math.max(fromAyah, toAyah))})`}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
