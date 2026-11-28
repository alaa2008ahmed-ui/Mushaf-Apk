import React from 'react';
import type { MadinahThemePalette } from '../MadinahFrameSVG';
import type { MadinahFrameDesignId } from './madinahFrameTypes';

/* ============================================================================
   2. SURAH BANNER DESIGNS (Background Pattern, Corner, Wing, Center Cartouche)
   ============================================================================ */

export const MadinahSurahBannerPatternContent: React.FC<{
    design: MadinahFrameDesignId;
    palette: MadinahThemePalette;
}> = ({ design, palette }) => {
    switch (design) {
        case 2:
            return (
                <>
                    <path
                        d="M0 16 Q8 3 16 16 Q24 3 32 16"
                        fill={palette.secondary}
                        fillOpacity="0.16"
                        stroke={palette.primary}
                        strokeOpacity="0.22"
                        strokeWidth="0.7"
                    />
                    <circle cx="8" cy="10" r="1.2" fill={palette.gold} fillOpacity="0.4" />
                    <circle cx="24" cy="10" r="1.2" fill={palette.gold} fillOpacity="0.4" />
                </>
            );
        case 3:
            return (
                <>
                    <polygon
                        points="8,2 14,8 8,14 2,8"
                        fill={palette.secondary}
                        fillOpacity="0.14"
                        stroke={palette.primary}
                        strokeOpacity="0.2"
                        strokeWidth="0.65"
                    />
                    <polygon
                        points="24,2 30,8 24,14 18,8"
                        fill={palette.secondary}
                        fillOpacity="0.14"
                        stroke={palette.primary}
                        strokeOpacity="0.2"
                        strokeWidth="0.65"
                    />
                    <circle cx="16" cy="8" r="1.1" fill={palette.gold} fillOpacity="0.4" />
                </>
            );
        case 4:
            return (
                <>
                    <path
                        d="M2 14 V6 Q8 1.5 14 6 V14 M18 14 V6 Q24 1.5 30 6 V14"
                        fill={palette.secondary}
                        fillOpacity="0.14"
                        stroke={palette.primary}
                        strokeOpacity="0.2"
                        strokeWidth="0.65"
                    />
                    <circle cx="8" cy="8" r="1.2" fill={palette.gold} fillOpacity="0.38" />
                    <circle cx="24" cy="8" r="1.2" fill={palette.gold} fillOpacity="0.38" />
                </>
            );
        case 5:
            return (
                <>
                    <circle cx="16" cy="8" r="4.5" fill="none" stroke={palette.primary} strokeOpacity="0.16" strokeWidth="0.65" />
                    <circle cx="16" cy="8" r="1.3" fill={palette.gold} fillOpacity="0.38" />
                    <circle cx="0" cy="8" r="1.1" fill={palette.gold} fillOpacity="0.3" />
                    <circle cx="32" cy="8" r="1.1" fill={palette.gold} fillOpacity="0.3" />
                </>
            );
        case 6:
            return (
                <>
                    <path
                        d="M2 3 H14 V13 H6 V7 H10 M18 13 H30 V3 H22 V9 H26"
                        fill="none"
                        stroke={palette.primary}
                        strokeOpacity="0.2"
                        strokeWidth="0.7"
                    />
                    <rect x="14.8" y="6.8" width="2.4" height="2.4" fill={palette.gold} fillOpacity="0.35" />
                </>
            );
        case 1:
        default:
            return (
                <>
                    <path
                        d="M2 8 C7 4.2 11 4.2 16 8 C11 11.8 7 11.8 2 8 Z M16 8 C21 4.2 25 4.2 30 8 C25 11.8 21 11.8 16 8 Z"
                        fill={palette.secondary}
                        fillOpacity="0.16"
                        stroke={palette.primary}
                        strokeOpacity="0.18"
                        strokeWidth="0.65"
                    />
                    <circle cx="16" cy="8" r="1.3" fill={palette.gold} fillOpacity="0.35" />
                </>
            );
    }
};

export const MadinahSurahBannerCornerSVG: React.FC<{
    design: MadinahFrameDesignId;
    palette: MadinahThemePalette;
    posClass: string;
}> = ({ design, palette, posClass }) => {
    switch (design) {
        case 2:
            return (
                <svg viewBox="0 0 12 12" className={`madinah-surah-corner ${posClass} pointer-events-none`} aria-hidden="true">
                    <circle cx="6" cy="6" r="5" fill={palette.frameBg} stroke={palette.primary} strokeWidth="0.9" />
                    <circle cx="6" cy="6" r="2.2" fill={palette.gold} stroke={palette.primary} strokeWidth="0.45" />
                </svg>
            );
        case 3:
            return (
                <svg viewBox="0 0 12 12" className={`madinah-surah-corner ${posClass} pointer-events-none`} aria-hidden="true">
                    <rect x="2" y="2" width="8" height="8" fill={palette.frameBg} stroke={palette.primary} strokeWidth="0.85" />
                    <rect x="2" y="2" width="8" height="8" transform="rotate(45 6 6)" fill={palette.gold} fillOpacity="0.7" stroke={palette.primary} strokeWidth="0.6" />
                    <circle cx="6" cy="6" r="1.2" fill={palette.cartoucheFill} />
                </svg>
            );
        case 4:
            return (
                <svg viewBox="0 0 12 12" className={`madinah-surah-corner ${posClass} pointer-events-none`} aria-hidden="true">
                    <polygon points="3.5,1 8.5,1 11,3.5 11,8.5 8.5,11 3.5,11 1,8.5 1,3.5" fill={palette.frameBg} stroke={palette.primary} strokeWidth="0.9" />
                    <circle cx="6" cy="6" r="2.2" fill={palette.gold} />
                </svg>
            );
        case 5:
            return (
                <svg viewBox="0 0 12 12" className={`madinah-surah-corner ${posClass} pointer-events-none`} aria-hidden="true">
                    <circle cx="6" cy="6" r="4.5" fill={palette.cartoucheFill} stroke={palette.gold} strokeWidth="0.9" />
                    <circle cx="6" cy="6" r="1.6" fill={palette.primary} />
                </svg>
            );
        case 6:
            return (
                <svg viewBox="0 0 12 12" className={`madinah-surah-corner ${posClass} pointer-events-none`} aria-hidden="true">
                    <rect x="1" y="1" width="10" height="10" fill={palette.frameBg} stroke={palette.primary} strokeWidth="0.95" />
                    <rect x="3.5" y="3.5" width="5" height="5" fill={palette.gold} stroke={palette.primary} strokeWidth="0.5" />
                </svg>
            );
        case 1:
        default:
            return (
                <svg viewBox="0 0 12 12" className={`madinah-surah-corner ${posClass} pointer-events-none`} aria-hidden="true">
                    <rect x="1" y="1" width="10" height="10" rx="1.5" fill={palette.frameBg} stroke={palette.primary} strokeWidth="0.9" />
                    <path d="M6 2.2 L7.1 4.9 L9.8 6 L7.1 7.1 L6 9.8 L4.9 7.1 L2.2 6 L4.9 4.9 Z" fill={palette.gold} stroke={palette.primary} strokeWidth="0.45" />
                    <circle cx="6" cy="6" r="1" fill={palette.cartoucheFill} />
                </svg>
            );
    }
};

export const MadinahSurahBannerCartoucheSVG: React.FC<{
    design: MadinahFrameDesignId;
    palette: MadinahThemePalette;
}> = ({ design, palette }) => {
    switch (design) {
        case 2: // Andalusian Pointed Arch Cartouche
            return (
                <div className="madinah-qpc-surah-cartouche-svg-wrap pointer-events-none" dir="ltr" aria-hidden="true">
                    <svg viewBox="0 0 18 40" className="w-[16px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M18 1.5 L11 1.5 C4.5 5.5 1.5 13 1.5 20 C1.5 27 4.5 34.5 11 38.5 L18 38.5 Z" fill={palette.cartoucheFill} />
                        <path d="M18 1.5 L11 1.5 C4.5 5.5 1.5 13 1.5 20 C1.5 27 4.5 34.5 11 38.5 L18 38.5" fill="none" stroke={palette.primary} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                        <path d="M18 4.2 L12 4.2 C6.8 7.6 4.2 13.8 4.2 20 C4.2 26.2 6.8 32.4 12 35.8 L18 35.8" fill="none" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                        <circle cx="8.2" cy="20" r="2.2" fill={palette.gold} stroke={palette.primary} strokeWidth="0.6" />
                    </svg>
                    <svg viewBox="0 0 100 40" className="flex-1 min-w-0 h-full" preserveAspectRatio="none">
                        <rect x="-1" y="1.5" width="102" height="37" fill={palette.cartoucheFill} />
                        <line x1="-1" y1="1.5" x2="101" y2="1.5" stroke={palette.primary} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="38.5" x2="101" y2="38.5" stroke={palette.primary} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="4.2" x2="101" y2="4.2" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="35.8" x2="101" y2="35.8" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <svg viewBox="0 0 18 40" className="w-[16px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M0 1.5 L7 1.5 C13.5 5.5 16.5 13 16.5 20 C16.5 27 13.5 34.5 7 38.5 L0 38.5 Z" fill={palette.cartoucheFill} />
                        <path d="M0 1.5 L7 1.5 C13.5 5.5 16.5 13 16.5 20 C16.5 27 13.5 34.5 7 38.5 L0 38.5" fill="none" stroke={palette.primary} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                        <path d="M0 4.2 L6 4.2 C11.2 7.6 13.8 13.8 13.8 20 C13.8 26.2 11.2 32.4 6 35.8 L0 35.8" fill="none" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                        <circle cx="9.8" cy="20" r="2.2" fill={palette.gold} stroke={palette.primary} strokeWidth="0.6" />
                    </svg>
                </div>
            );
        case 3: // Eight-Pointed Star Chevron Cartouche
            return (
                <div className="madinah-qpc-surah-cartouche-svg-wrap pointer-events-none" dir="ltr" aria-hidden="true">
                    <svg viewBox="0 0 18 40" className="w-[16px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M18 1.5 L11 1.5 L7 8 L1.5 20 L7 32 L11 38.5 L18 38.5 Z" fill={palette.cartoucheFill} />
                        <path d="M18 1.5 L11 1.5 L7 8 L1.5 20 L7 32 L11 38.5 L18 38.5" fill="none" stroke={palette.primary} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                        <path d="M18 4.2 L12.5 4.2 L9 10 L4.2 20 L9 30 L12.5 35.8 L18 35.8" fill="none" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                        <polygon points="9.5,16.8 12.2,20 9.5,23.2 6.8,20" fill={palette.gold} stroke={palette.primary} strokeWidth="0.6" />
                    </svg>
                    <svg viewBox="0 0 100 40" className="flex-1 min-w-0 h-full" preserveAspectRatio="none">
                        <rect x="-1" y="1.5" width="102" height="37" fill={palette.cartoucheFill} />
                        <line x1="-1" y1="1.5" x2="101" y2="1.5" stroke={palette.primary} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="38.5" x2="101" y2="38.5" stroke={palette.primary} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="4.2" x2="101" y2="4.2" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="35.8" x2="101" y2="35.8" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <svg viewBox="0 0 18 40" className="w-[16px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M0 1.5 L7 1.5 L11 8 L16.5 20 L11 32 L7 38.5 L0 38.5 Z" fill={palette.cartoucheFill} />
                        <path d="M0 1.5 L7 1.5 L11 8 L16.5 20 L11 32 L7 38.5 L0 38.5" fill="none" stroke={palette.primary} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                        <path d="M0 4.2 L5.5 4.2 L9 10 L13.8 20 L9 30 L5.5 35.8 L0 35.8" fill="none" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                        <polygon points="8.5,16.8 11.2,20 8.5,23.2 5.8,20" fill={palette.gold} stroke={palette.primary} strokeWidth="0.6" />
                    </svg>
                </div>
            );
        case 4: // Mamluk Trefoil Mihrab Cartouche
            return (
                <div className="madinah-qpc-surah-cartouche-svg-wrap pointer-events-none" dir="ltr" aria-hidden="true">
                    <svg viewBox="0 0 18 40" className="w-[16px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M18 1.5 L12 1.5 Q7 1.5 6 9 Q1.5 14 1.5 20 Q1.5 26 6 31 Q7 38.5 12 38.5 L18 38.5 Z" fill={palette.cartoucheFill} />
                        <path d="M18 1.5 L12 1.5 Q7 1.5 6 9 Q1.5 14 1.5 20 Q1.5 26 6 31 Q7 38.5 12 38.5 L18 38.5" fill="none" stroke={palette.primary} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                        <path d="M18 4.2 L12.5 4.2 Q9 4.2 8.2 10.5 Q4.2 14.8 4.2 20 Q4.2 25.2 8.2 29.5 Q9 35.8 12.5 35.8 L18 35.8" fill="none" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                        <circle cx="8.5" cy="20" r="2" fill={palette.gold} stroke={palette.primary} strokeWidth="0.6" />
                    </svg>
                    <svg viewBox="0 0 100 40" className="flex-1 min-w-0 h-full" preserveAspectRatio="none">
                        <rect x="-1" y="1.5" width="102" height="37" fill={palette.cartoucheFill} />
                        <line x1="-1" y1="1.5" x2="101" y2="1.5" stroke={palette.primary} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="38.5" x2="101" y2="38.5" stroke={palette.primary} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="4.2" x2="101" y2="4.2" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="35.8" x2="101" y2="35.8" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <svg viewBox="0 0 18 40" className="w-[16px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M0 1.5 L6 1.5 Q11 1.5 12 9 Q16.5 14 16.5 20 Q16.5 26 12 31 Q11 38.5 6 38.5 L0 38.5 Z" fill={palette.cartoucheFill} />
                        <path d="M0 1.5 L6 1.5 Q11 1.5 12 9 Q16.5 14 16.5 20 Q16.5 26 12 31 Q11 38.5 6 38.5 L0 38.5" fill="none" stroke={palette.primary} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                        <path d="M0 4.2 L5.5 4.2 Q9 4.2 9.8 10.5 Q13.8 14.8 13.8 20 Q13.8 25.2 9.8 29.5 Q9 35.8 5.5 35.8 L0 35.8" fill="none" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                        <circle cx="9.5" cy="20" r="2" fill={palette.gold} stroke={palette.primary} strokeWidth="0.6" />
                    </svg>
                </div>
            );
        case 5: // Ottoman Curved Oval Pill Cartouche
            return (
                <div className="madinah-qpc-surah-cartouche-svg-wrap pointer-events-none" dir="ltr" aria-hidden="true">
                    <svg viewBox="0 0 18 40" className="w-[16px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M18 2 L14 2 A12 18 0 0 0 14 38 L18 38 Z" fill={palette.cartoucheFill} />
                        <path d="M18 2 L14 2 A12 18 0 0 0 14 38 L18 38" fill="none" stroke={palette.primary} strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
                        <path d="M18 4.6 L14.5 4.6 A9.5 15.4 0 0 0 14.5 35.4 L18 35.4" fill="none" stroke={palette.gold} strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
                        <circle cx="7" cy="20" r="1.8" fill={palette.gold} />
                    </svg>
                    <svg viewBox="0 0 100 40" className="flex-1 min-w-0 h-full" preserveAspectRatio="none">
                        <rect x="-1" y="2" width="102" height="36" fill={palette.cartoucheFill} />
                        <line x1="-1" y1="2" x2="101" y2="2" stroke={palette.primary} strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="38" x2="101" y2="38" stroke={palette.primary} strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="4.6" x2="101" y2="4.6" stroke={palette.gold} strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="35.4" x2="101" y2="35.4" stroke={palette.gold} strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <svg viewBox="0 0 18 40" className="w-[16px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M0 2 L4 2 A12 18 0 0 1 4 38 L0 38 Z" fill={palette.cartoucheFill} />
                        <path d="M0 2 L4 2 A12 18 0 0 1 4 38 L0 38" fill="none" stroke={palette.primary} strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
                        <path d="M0 4.6 L3.5 4.6 A9.5 15.4 0 0 1 3.5 35.4 L0 35.4" fill="none" stroke={palette.gold} strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
                        <circle cx="11" cy="20" r="1.8" fill={palette.gold} />
                    </svg>
                </div>
            );
        case 6: // Kufic Stepped Ziggurat Cartouche
            return (
                <div className="madinah-qpc-surah-cartouche-svg-wrap pointer-events-none" dir="ltr" aria-hidden="true">
                    <svg viewBox="0 0 18 40" className="w-[16px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M18 1.5 L8 1.5 L8 7.5 L2 7.5 L2 32.5 L8 32.5 L8 38.5 L18 38.5 Z" fill={palette.cartoucheFill} />
                        <path d="M18 1.5 L8 1.5 L8 7.5 L2 7.5 L2 32.5 L8 32.5 L8 38.5 L18 38.5" fill="none" stroke={palette.primary} strokeWidth="1.25" strokeLinejoin="miter" vectorEffect="non-scaling-stroke" />
                        <path d="M18 4.2 L10.5 4.2 L10.5 10 L4.5 10 L4.5 30 L10.5 30 L10.5 35.8 L18 35.8" fill="none" stroke={palette.gold} strokeWidth="0.95" strokeLinejoin="miter" vectorEffect="non-scaling-stroke" />
                        <rect x="6.5" y="18.2" width="3.6" height="3.6" fill={palette.gold} stroke={palette.primary} strokeWidth="0.6" />
                    </svg>
                    <svg viewBox="0 0 100 40" className="flex-1 min-w-0 h-full" preserveAspectRatio="none">
                        <rect x="-1" y="1.5" width="102" height="37" fill={palette.cartoucheFill} />
                        <line x1="-1" y1="1.5" x2="101" y2="1.5" stroke={palette.primary} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="38.5" x2="101" y2="38.5" stroke={palette.primary} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="4.2" x2="101" y2="4.2" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="35.8" x2="101" y2="35.8" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <svg viewBox="0 0 18 40" className="w-[16px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M0 1.5 L10 1.5 L10 7.5 L16 7.5 L16 32.5 L10 32.5 L10 38.5 L0 38.5 Z" fill={palette.cartoucheFill} />
                        <path d="M0 1.5 L10 1.5 L10 7.5 L16 7.5 L16 32.5 L10 32.5 L10 38.5 L0 38.5" fill="none" stroke={palette.primary} strokeWidth="1.25" strokeLinejoin="miter" vectorEffect="non-scaling-stroke" />
                        <path d="M0 4.2 L7.5 4.2 L7.5 10 L13.5 10 L13.5 30 L7.5 30 L7.5 35.8 L0 35.8" fill="none" stroke={palette.gold} strokeWidth="0.95" strokeLinejoin="miter" vectorEffect="non-scaling-stroke" />
                        <rect x="7.9" y="18.2" width="3.6" height="3.6" fill={palette.gold} stroke={palette.primary} strokeWidth="0.6" />
                    </svg>
                </div>
            );
        case 1:
        default: // Classic Chamfered Octagonal Cartouche
            return (
                <div className="madinah-qpc-surah-cartouche-svg-wrap pointer-events-none" dir="ltr" aria-hidden="true">
                    <svg viewBox="0 0 16 40" className="w-[14px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M16 1.5 L8 1.5 L1.5 9 L1.5 31 L8 38.5 L16 38.5 Z" fill={palette.cartoucheFill} stroke="none" />
                        <path d="M16 1.5 L8 1.5 L1.5 9 L1.5 31 L8 38.5 L16 38.5" fill="none" stroke={palette.primary} strokeWidth="1.25" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                        <path d="M16 4.2 L9.5 4.2 L4.2 10.5 L4.2 29.5 L9.5 35.8 L16 35.8" fill="none" stroke={palette.gold} strokeWidth="0.95" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                        <polygon points="7.5,17.2 10.2,20 7.5,22.8 4.8,20" fill={palette.gold} stroke={palette.primary} strokeWidth="0.6" />
                    </svg>
                    <svg viewBox="0 0 100 40" className="flex-1 min-w-0 h-full" preserveAspectRatio="none">
                        <rect x="-1" y="1.5" width="102" height="37" fill={palette.cartoucheFill} />
                        <line x1="-1" y1="1.5" x2="101" y2="1.5" stroke={palette.primary} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="38.5" x2="101" y2="38.5" stroke={palette.primary} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="4.2" x2="101" y2="4.2" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="35.8" x2="101" y2="35.8" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <svg viewBox="0 0 16 40" className="w-[14px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M0 1.5 L8 1.5 L14.5 9 L14.5 31 L8 38.5 L0 38.5 Z" fill={palette.cartoucheFill} stroke="none" />
                        <path d="M0 1.5 L8 1.5 L14.5 9 L14.5 31 L8 38.5 L0 38.5" fill="none" stroke={palette.primary} strokeWidth="1.25" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                        <path d="M0 4.2 L6.5 4.2 L11.8 10.5 L11.8 29.5 L6.5 35.8 L0 35.8" fill="none" stroke={palette.gold} strokeWidth="0.95" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                        <polygon points="8.5,17.2 11.2,20 8.5,22.8 5.8,20" fill={palette.gold} stroke={palette.primary} strokeWidth="0.6" />
                    </svg>
                </div>
            );
    }
};
