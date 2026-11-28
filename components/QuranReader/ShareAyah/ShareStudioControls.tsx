import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { toArabic } from '../constants';
import {
    SHARE_FONTS,
    ShareStudioPalette,
    TEXT_COLORS,
} from './shareStudioConstants';

interface ShareCustomizationPanelProps {
    selectedFont: string;
    setSelectedFont: React.Dispatch<React.SetStateAction<string>>;
    fontSize: number;
    setFontSize: React.Dispatch<React.SetStateAction<number>>;
    textColor: string;
    setTextColor: React.Dispatch<React.SetStateAction<string>>;
    customText: string;
    setCustomText: React.Dispatch<React.SetStateAction<string>>;
    showBismillah: boolean;
    setShowBismillah: React.Dispatch<React.SetStateAction<boolean>>;
    isEn: boolean;
    palette: ShareStudioPalette;
}

export const ShareCustomizationPanel: React.FC<ShareCustomizationPanelProps> = ({
    selectedFont,
    setSelectedFont,
    fontSize,
    setFontSize,
    textColor,
    setTextColor,
    customText,
    setCustomText,
    showBismillah,
    setShowBismillah,
    isEn,
    palette,
}) => {
    const {
        accentBg,
        accentText,
        surfaceBg,
        trackBg,
        textPrimary,
        textMuted,
        flatNeutralBorder,
        flatActiveBorder,
        tactileNeutralShadow,
        tactileActiveShadow,
        tactileInsetShadow,
    } = palette;

    return (
        <div className="space-y-2.5">
            {/* Font Family Row */}
            <div>
                <div className="flex items-center gap-2 overflow-x-auto py-1 px-0.5 hide-scrollbar">
                    {SHARE_FONTS.map((font) => {
                        const isSelected = selectedFont === font.id;
                        return (
                            <button
                                key={font.id}
                                type="button"
                                onClick={() => setSelectedFont(font.id)}
                                className="px-3 py-2 rounded-xl shrink-0 border-0 transition-transform active:scale-95 text-xs font-bold cursor-pointer whitespace-nowrap"
                                style={{
                                    fontFamily: 'var(--font-ui)',
                                    backgroundColor: isSelected ? accentBg : surfaceBg,
                                    color: isSelected ? accentText : textPrimary,
                                    border: isSelected ? flatActiveBorder : flatNeutralBorder,
                                    boxShadow: isSelected ? tactileActiveShadow : tactileNeutralShadow,
                                }}
                            >
                                {font.name}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Size Stepper + Color Swatches Row */}
            <div className="flex items-center gap-2.5">
                <div
                    className="flex items-center gap-1.5 p-1.5 rounded-xl shrink-0"
                    style={{ backgroundColor: trackBg, border: flatNeutralBorder, boxShadow: tactileInsetShadow }}
                >
                    <button
                        type="button"
                        onClick={() => setFontSize((prev) => Math.max(12, prev - 2))}
                        className="w-8 h-8 rounded-lg flex items-center justify-center border-0 cursor-pointer active:translate-y-0.5 active:scale-95 transition-all"
                        style={{ backgroundColor: surfaceBg, color: textPrimary, border: flatNeutralBorder, boxShadow: tactileNeutralShadow }}
                        title={isEn ? 'Decrease font size' : 'تصغير الخط'}
                    >
                        <Minus size={14} strokeWidth={2.5} />
                    </button>
                    <span className="text-xs font-black min-w-[28px] text-center tabular-nums" style={{ color: textPrimary }}>
                        {fontSize}
                    </span>
                    <button
                        type="button"
                        onClick={() => setFontSize((prev) => Math.min(48, prev + 2))}
                        className="w-8 h-8 rounded-lg flex items-center justify-center border-0 cursor-pointer active:translate-y-0.5 active:scale-95 transition-all"
                        style={{ backgroundColor: surfaceBg, color: textPrimary, border: flatNeutralBorder, boxShadow: tactileNeutralShadow }}
                        title={isEn ? 'Increase font size' : 'تكبير الخط'}
                    >
                        <Plus size={14} strokeWidth={2.5} />
                    </button>
                </div>

                <div
                    className="flex-1 flex items-center gap-2 overflow-x-auto px-2.5 py-2 rounded-xl hide-scrollbar"
                    style={{ backgroundColor: trackBg, border: flatNeutralBorder, boxShadow: tactileInsetShadow }}
                >
                    {TEXT_COLORS.map((color) => {
                        const isSelected = textColor === color;
                        return (
                            <button
                                key={color}
                                type="button"
                                onClick={() => setTextColor(color)}
                                className={`w-6 h-6 rounded-full shrink-0 cursor-pointer transition-transform active:scale-90 ${
                                    isSelected ? 'scale-120' : 'opacity-90 hover:opacity-100'
                                }`}
                                style={{
                                    backgroundColor: color,
                                    border: isSelected ? `2.5px solid ${accentBg}` : '1.5px solid rgba(148,163,184,0.45)',
                                    boxShadow: 'none',
                                }}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Optional Custom Caption Input + Bismillah Toggle */}
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder={isEn ? 'Optional note / caption...' : 'نص إضافي يظهر أسفل البطاقة (اختياري)...'}
                    className="flex-1 min-w-0 px-3 py-2.5 text-xs font-semibold rounded-xl outline-none transition-all border-0"
                    style={{
                        backgroundColor: trackBg,
                        color: textPrimary,
                        border: flatNeutralBorder,
                        boxShadow: tactileInsetShadow,
                    }}
                    maxLength={50}
                    dir={isEn ? 'ltr' : 'rtl'}
                />
                <button
                    type="button"
                    onClick={() => setShowBismillah((prev) => !prev)}
                    className="px-3 py-2.5 rounded-xl text-xs font-extrabold shrink-0 border-0 cursor-pointer transition-all active:scale-95 whitespace-nowrap"
                    style={{
                        backgroundColor: showBismillah ? accentBg : surfaceBg,
                        color: showBismillah ? accentText : textMuted,
                        border: showBismillah ? flatActiveBorder : flatNeutralBorder,
                        boxShadow: showBismillah ? tactileActiveShadow : tactileNeutralShadow,
                    }}
                    title={isEn ? (showBismillah ? 'Hide Bismillah' : 'Show Bismillah') : (showBismillah ? 'إخفاء البسملة من التصميم' : 'إظهار البسملة في التصميم')}
                    aria-pressed={showBismillah}
                >
                    {isEn ? 'Bismillah' : 'البسملة'}
                </button>
            </div>
        </div>
    );
};

interface SharePrimaryCTAProps {
    shareType: 'text' | 'image' | 'page' | 'audio';
    pageChunksLength: number;
    safePageIndex: number;
    isSharing: boolean;
    primaryShareLabel: string;
    handleShare: (shareMode?: 'all' | 'current') => Promise<void>;
    onClose: () => void;
    isEn: boolean;
    palette: ShareStudioPalette;
}

export const SharePrimaryCTA: React.FC<SharePrimaryCTAProps> = ({
    shareType,
    pageChunksLength,
    safePageIndex,
    isSharing,
    primaryShareLabel,
    handleShare,
    onClose,
    isEn,
    palette,
}) => {
    const {
        accentBg,
        accentText,
        surfaceBg,
        textPrimary,
        flatNeutralBorder,
        flatActiveBorder,
        tactileNeutralShadow,
        tactileActiveShadow,
    } = palette;

    return (
        <div className="flex items-center justify-center gap-2 mx-auto w-full">
            {(shareType === 'image' || shareType === 'page') && pageChunksLength > 1 ? (
                <div className="flex items-center justify-center gap-2 w-full max-w-[380px] mx-auto">
                    <button
                        type="button"
                        onClick={() => handleShare('current')}
                        disabled={isSharing}
                        className="flex-1 py-2 px-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center transition-all active:translate-y-0.5 disabled:opacity-70 border-0 cursor-pointer whitespace-nowrap"
                        style={{
                            backgroundColor: surfaceBg,
                            color: textPrimary,
                            border: flatNeutralBorder,
                            boxShadow: tactileNeutralShadow,
                        }}
                        title="مشاركة الصورة المعروضة حالياً فقط"
                    >
                        {isSharing ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <span>{isEn ? `Current (${safePageIndex + 1})` : `مشاركة الحالية (${toArabic(safePageIndex + 1)})`}</span>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => handleShare('all')}
                        disabled={isSharing}
                        className="flex-[1.15] py-2 px-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center transition-all active:translate-y-0.5 disabled:opacity-70 border-0 cursor-pointer whitespace-nowrap"
                        style={{
                            backgroundColor: accentBg,
                            color: accentText,
                            border: flatActiveBorder,
                            boxShadow: tactileActiveShadow,
                        }}
                        title={`مشاركة جميع الصور (${pageChunksLength})`}
                    >
                        {isSharing ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <span>{isEn ? `Share All (${pageChunksLength})` : `مشاركة الكل (${toArabic(pageChunksLength)})`}</span>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-[0.8] py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center transition-all active:translate-y-0.5 border-0 cursor-pointer whitespace-nowrap"
                        style={{
                            backgroundColor: surfaceBg,
                            color: textPrimary,
                            border: flatNeutralBorder,
                            boxShadow: tactileNeutralShadow,
                        }}
                    >
                        <span>{isEn ? 'Cancel' : 'إلغاء'}</span>
                    </button>
                </div>
            ) : (
                <div className="flex items-center justify-center gap-2.5 w-full max-w-[330px] mx-auto">
                    <button
                        type="button"
                        onClick={() => handleShare('all')}
                        disabled={isSharing}
                        className="flex-[1.35] py-2 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center transition-all active:translate-y-0.5 disabled:opacity-70 border-0 cursor-pointer whitespace-nowrap"
                        style={{
                            backgroundColor: accentBg,
                            color: accentText,
                            border: flatActiveBorder,
                            boxShadow: tactileActiveShadow,
                        }}
                    >
                        {isSharing ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <span>{primaryShareLabel}</span>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-2 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center transition-all active:translate-y-0.5 border-0 cursor-pointer whitespace-nowrap"
                        style={{
                            backgroundColor: surfaceBg,
                            color: textPrimary,
                            border: flatNeutralBorder,
                            boxShadow: tactileNeutralShadow,
                        }}
                    >
                        <span>{isEn ? 'Cancel' : 'إلغاء'}</span>
                    </button>
                </div>
            )}
        </div>
    );
};
