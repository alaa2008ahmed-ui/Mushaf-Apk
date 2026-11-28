import React from 'react';
import type { MadinahThemePalette } from '../MadinahFrameSVG';
import type { MadinahFrameDesignId } from './madinahFrameTypes';

/* ============================================================================
   3. TOP BAR (#header) DESIGNS: Circular Icon Frame, Bookmark Badge, Surah Pill
   ============================================================================ */

export const MadinahHeaderCircleSVG: React.FC<{
    design: MadinahFrameDesignId;
    palette: MadinahThemePalette;
}> = ({ design, palette }) => {
    switch (design) {
        case 2: // Andalusian Scalloped Floral Rosette
            return (
                <svg viewBox="0 0 44 44" className="madinah-header-svg-frame absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                    <circle cx="22" cy="22" r="20" fill={palette.secondary} fillOpacity="0.18" stroke={palette.primary} strokeWidth="1.1" strokeDasharray="3.2 2.1" />
                    <circle cx="22" cy="22" r="17" fill={palette.cartoucheFill} stroke={palette.primary} strokeWidth="1.25" />
                    <circle cx="22" cy="22" r="14.2" fill="none" stroke={palette.gold} strokeWidth="0.95" />
                    <circle cx="22" cy="3.8" r="1.4" fill={palette.gold} stroke={palette.primary} strokeWidth="0.4" />
                    <circle cx="22" cy="40.2" r="1.4" fill={palette.gold} stroke={palette.primary} strokeWidth="0.4" />
                    <circle cx="3.8" cy="22" r="1.4" fill={palette.gold} stroke={palette.primary} strokeWidth="0.4" />
                    <circle cx="40.2" cy="22" r="1.4" fill={palette.gold} stroke={palette.primary} strokeWidth="0.4" />
                </svg>
            );
        case 3: // Eight-Pointed Rub el Hizb Crisp Star
            return (
                <svg viewBox="0 0 44 44" className="madinah-header-svg-frame absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                    <rect x="6" y="6" width="32" height="32" fill={palette.secondary} fillOpacity="0.22" stroke={palette.primary} strokeWidth="1.2" />
                    <rect x="6" y="6" width="32" height="32" transform="rotate(45 22 22)" fill={palette.gold} fillOpacity="0.22" stroke={palette.gold} strokeWidth="1.2" />
                    <polygon
                        points="22,6.5 33,11 37.5,22 33,33 22,37.5 11,33 6.5,22 11,11"
                        fill={palette.cartoucheFill}
                        stroke={palette.primary}
                        strokeWidth="1.2"
                    />
                    <circle cx="22" cy="22" r="12.8" fill="none" stroke={palette.gold} strokeWidth="0.85" />
                </svg>
            );
        case 4: // Mamluk Fluted Sunburst Medallion
            return (
                <svg viewBox="0 0 44 44" className="madinah-header-svg-frame absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                    <polygon
                        points="22,1.5 26.5,6.5 33.5,4.5 34.5,11.5 41,13.5 37.5,19.5 42.5,22 37.5,24.5 41,30.5 34.5,32.5 33.5,39.5 26.5,37.5 22,42.5 17.5,37.5 10.5,39.5 9.5,32.5 3,30.5 6.5,24.5 1.5,22 6.5,19.5 3,13.5 9.5,11.5 10.5,4.5 17.5,6.5"
                        fill={palette.secondary}
                        fillOpacity="0.24"
                        stroke={palette.primary}
                        strokeWidth="1.05"
                    />
                    <circle cx="22" cy="22" r="15" fill={palette.cartoucheFill} stroke={palette.primary} strokeWidth="1.2" />
                    <circle cx="22" cy="22" r="12.6" fill="none" stroke={palette.gold} strokeWidth="0.9" />
                </svg>
            );
        case 5: // Ottoman Sleek Triple Ring
            return (
                <svg viewBox="0 0 44 44" className="madinah-header-svg-frame absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                    <circle cx="22" cy="22" r="19" fill={palette.cartoucheFill} stroke={palette.primary} strokeWidth="1.25" />
                    <circle cx="22" cy="22" r="16" fill="none" stroke={palette.gold} strokeWidth="0.9" />
                    <circle cx="22" cy="22" r="13.5" fill="none" stroke={palette.primary} strokeOpacity="0.35" strokeWidth="0.6" />
                    <circle cx="22" cy="3" r="1.3" fill={palette.gold} />
                    <circle cx="22" cy="41" r="1.3" fill={palette.gold} />
                </svg>
            );
        case 6: // Kufic Architectural Octagon-in-Square
            return (
                <svg viewBox="0 0 44 44" className="madinah-header-svg-frame absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                    <rect x="3" y="3" width="38" height="38" rx="3" fill={palette.secondary} fillOpacity="0.16" stroke={palette.primary} strokeWidth="1.25" />
                    <rect x="6" y="6" width="32" height="32" rx="2" fill={palette.cartoucheFill} stroke={palette.gold} strokeWidth="1.0" />
                    <polygon points="14,7.5 30,7.5 36.5,14 36.5,30 30,36.5 14,36.5 7.5,30 7.5,14" fill="none" stroke={palette.primary} strokeWidth="1.0" />
                </svg>
            );
        case 1:
        default:
            return (
                <svg viewBox="0 0 44 44" className="madinah-header-svg-frame absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                    <rect x="7" y="7" width="30" height="30" rx="3" fill={palette.secondary} fillOpacity="0.22" stroke={palette.primary} strokeWidth="1.2" />
                    <rect x="7" y="7" width="30" height="30" rx="3" transform="rotate(45 22 22)" fill={palette.secondary} fillOpacity="0.18" stroke={palette.primary} strokeWidth="1.2" />
                    <circle cx="22" cy="22" r="15.5" fill={palette.cartoucheFill} stroke={palette.primary} strokeWidth="1.2" />
                    <circle cx="22" cy="22" r="13.2" fill="none" stroke={palette.gold} strokeWidth="0.9" />
                    <circle cx="22" cy="4.2" r="1.25" fill={palette.gold} />
                    <circle cx="22" cy="39.8" r="1.25" fill={palette.gold} />
                    <circle cx="4.2" cy="22" r="1.25" fill={palette.gold} />
                    <circle cx="39.8" cy="22" r="1.25" fill={palette.gold} />
                </svg>
            );
    }
};

export const MadinahHeaderBadgeSVG: React.FC<{
    design: MadinahFrameDesignId;
    palette: MadinahThemePalette;
}> = ({ design, palette }) => {
    switch (design) {
        case 2: // Andalusian Arched Badge
            return (
                <svg viewBox="0 0 54 40" className="madinah-header-svg-frame absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                    <path
                        d="M12,1.5 L42,1.5 C49.5,1.5 52.5,10 52.5,20 C52.5,30 49.5,38.5 42,38.5 L12,38.5 C4.5,38.5 1.5,30 1.5,20 C1.5,10 4.5,1.5 12,1.5 Z"
                        fill={palette.cartoucheFill}
                        stroke={palette.primary}
                        strokeWidth="1.3"
                    />
                    <path
                        d="M13.5,4.2 L40.5,4.2 C46.5,4.2 49.5,11.2 49.5,20 C49.5,28.8 46.5,35.8 40.5,35.8 L13.5,35.8 C7.5,35.8 4.5,28.8 4.5,20 C4.5,11.2 7.5,4.2 13.5,4.2 Z"
                        fill="none"
                        stroke={palette.gold}
                        strokeWidth="0.95"
                    />
                    <circle cx="27" cy="2.8" r="1.4" fill={palette.gold} />
                    <circle cx="27" cy="37.2" r="1.4" fill={palette.gold} />
                </svg>
            );
        case 3: // Eight-Point Star Geometric Badge
            return (
                <svg viewBox="0 0 54 40" className="madinah-header-svg-frame absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                    <polygon
                        points="10,1.5 44,1.5 48,7 52.5,20 48,33 44,38.5 10,38.5 6,33 1.5,20 6,7"
                        fill={palette.cartoucheFill}
                        stroke={palette.primary}
                        strokeWidth="1.3"
                    />
                    <polygon
                        points="11.5,4.2 42.5,4.2 45.8,8.5 49.5,20 45.8,31.5 42.5,35.8 11.5,35.8 8.2,31.5 4.5,20 8.2,8.5"
                        fill="none"
                        stroke={palette.gold}
                        strokeWidth="0.95"
                    />
                </svg>
            );
        case 4: // Mamluk Trefoil Badge
            return (
                <svg viewBox="0 0 54 40" className="madinah-header-svg-frame absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                    <path
                        d="M11,1.5 L43,1.5 Q47,1.5 48,9.5 Q52.5,14 52.5,20 Q52.5,26 48,30.5 Q47,38.5 43,38.5 L11,38.5 Q7,38.5 6,30.5 Q1.5,26 1.5,20 Q1.5,14 6,9.5 Q7,1.5 11,1.5 Z"
                        fill={palette.cartoucheFill}
                        stroke={palette.primary}
                        strokeWidth="1.3"
                    />
                    <path
                        d="M12.5,4.2 L41.5,4.2 Q44.5,4.2 45.5,10.8 Q49.5,14.8 49.5,20 Q49.5,25.2 45.5,29.2 Q44.5,35.8 41.5,35.8 L12.5,35.8 Q9.5,35.8 8.5,29.2 Q4.5,25.2 4.5,20 Q4.5,14.8 8.5,10.8 Q9.5,4.2 12.5,4.2 Z"
                        fill="none"
                        stroke={palette.gold}
                        strokeWidth="0.95"
                    />
                </svg>
            );
        case 5: // Ottoman Smooth Pill Badge
            return (
                <svg viewBox="0 0 54 40" className="madinah-header-svg-frame absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                    <rect x="2" y="2" width="50" height="36" rx="18" fill={palette.cartoucheFill} stroke={palette.primary} strokeWidth="1.25" />
                    <rect x="4.8" y="4.8" width="44.4" height="30.4" rx="15.2" fill="none" stroke={palette.gold} strokeWidth="0.9" />
                </svg>
            );
        case 6: // Kufic Stepped Architectural Plaque
            return (
                <svg viewBox="0 0 54 40" className="madinah-header-svg-frame absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                    <polygon
                        points="8,1.5 46,1.5 46,7.5 52,7.5 52,32.5 46,32.5 46,38.5 8,38.5 8,32.5 2,32.5 2,7.5 8,7.5"
                        fill={palette.cartoucheFill}
                        stroke={palette.primary}
                        strokeWidth="1.3"
                    />
                    <rect x="6" y="5" width="42" height="30" fill="none" stroke={palette.gold} strokeWidth="0.95" />
                </svg>
            );
        case 1:
        default:
            return (
                <svg viewBox="0 0 54 40" className="madinah-header-svg-frame absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                    <polygon points="8,1.5 46,1.5 52.5,8 52.5,32 46,38.5 8,38.5 1.5,32 1.5,8" fill={palette.cartoucheFill} stroke={palette.primary} strokeWidth="1.3" />
                    <polygon points="9.5,4 44.5,4 50,9.5 50,30.5 44.5,36 9.5,36 4,30.5 4,9.5" fill="none" stroke={palette.gold} strokeWidth="0.95" />
                    <polygon points="27,0.5 29.2,2.8 27,5.1 24.8,2.8" fill={palette.gold} stroke={palette.primary} strokeWidth="0.6" />
                    <polygon points="27,34.9 29.2,37.2 27,39.5 24.8,37.2" fill={palette.gold} stroke={palette.primary} strokeWidth="0.6" />
                </svg>
            );
    }
};

export const MadinahHeaderSurahFrameSVG: React.FC<{
    design: MadinahFrameDesignId;
    palette: MadinahThemePalette;
}> = ({ design, palette }) => {
    switch (design) {
        case 2: // Andalusian Arched Banner
            return (
                <div className="madinah-header-surah-frame absolute inset-0 flex items-stretch pointer-events-none" dir="ltr" aria-hidden="true">
                    <svg viewBox="0 0 16 40" className="w-[15px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M16 1.5 L10 1.5 C4 5.5 1.5 13 1.5 20 C1.5 27 4 34.5 10 38.5 L16 38.5 Z" fill={palette.cartoucheFill} />
                        <path d="M16 1.5 L10 1.5 C4 5.5 1.5 13 1.5 20 C1.5 27 4 34.5 10 38.5 L16 38.5" fill="none" stroke={palette.primary} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <path d="M16 4 L11 4 C6 7.5 4 13.8 4 20 C4 26.2 6 32.5 11 36 L16 36" fill="none" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <svg viewBox="0 0 100 40" className="flex-1 min-w-0 h-full" preserveAspectRatio="none">
                        <rect x="-1" y="1.5" width="102" height="37" fill={palette.cartoucheFill} />
                        <line x1="-1" y1="1.5" x2="101" y2="1.5" stroke={palette.primary} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="38.5" x2="101" y2="38.5" stroke={palette.primary} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="4" x2="101" y2="4" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="36" x2="101" y2="36" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <svg viewBox="0 0 16 40" className="w-[15px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M0 1.5 L6 1.5 C12 5.5 14.5 13 14.5 20 C14.5 27 12 34.5 6 38.5 L0 38.5 Z" fill={palette.cartoucheFill} />
                        <path d="M0 1.5 L6 1.5 C12 5.5 14.5 13 14.5 20 C14.5 27 12 34.5 6 38.5 L0 38.5" fill="none" stroke={palette.primary} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <path d="M0 4 L5 4 C10 7.5 12 13.8 12 20 C12 26.2 10 32.5 5 36 L0 36" fill="none" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                    </svg>
                </div>
            );
        case 3: // Eight-Pointed Star Chevron Banner
            return (
                <div className="madinah-header-surah-frame absolute inset-0 flex items-stretch pointer-events-none" dir="ltr" aria-hidden="true">
                    <svg viewBox="0 0 16 40" className="w-[15px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M16 1.5 L10 1.5 L6.5 8 L1.5 20 L6.5 32 L10 38.5 L16 38.5 Z" fill={palette.cartoucheFill} />
                        <path d="M16 1.5 L10 1.5 L6.5 8 L1.5 20 L6.5 32 L10 38.5 L16 38.5" fill="none" stroke={palette.primary} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <path d="M16 4 L11 4 L8.5 9.5 L4.2 20 L8.5 30.5 L11 36 L16 36" fill="none" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <svg viewBox="0 0 100 40" className="flex-1 min-w-0 h-full" preserveAspectRatio="none">
                        <rect x="-1" y="1.5" width="102" height="37" fill={palette.cartoucheFill} />
                        <line x1="-1" y1="1.5" x2="101" y2="1.5" stroke={palette.primary} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="38.5" x2="101" y2="38.5" stroke={palette.primary} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="4" x2="101" y2="4" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="36" x2="101" y2="36" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <svg viewBox="0 0 16 40" className="w-[15px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M0 1.5 L6 1.5 L9.5 8 L14.5 20 L9.5 32 L6 38.5 L0 38.5 Z" fill={palette.cartoucheFill} />
                        <path d="M0 1.5 L6 1.5 L9.5 8 L14.5 20 L9.5 32 L6 38.5 L0 38.5" fill="none" stroke={palette.primary} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <path d="M0 4 L5 4 L7.5 9.5 L11.8 20 L7.5 30.5 L5 36 L0 36" fill="none" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                    </svg>
                </div>
            );
        case 4: // Mamluk Trefoil Banner
            return (
                <div className="madinah-header-surah-frame absolute inset-0 flex items-stretch pointer-events-none" dir="ltr" aria-hidden="true">
                    <svg viewBox="0 0 16 40" className="w-[15px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M16 1.5 L10.5 1.5 Q6.5 1.5 5.5 9.5 Q1.5 14 1.5 20 Q1.5 26 5.5 30.5 Q6.5 38.5 10.5 38.5 L16 38.5 Z" fill={palette.cartoucheFill} />
                        <path d="M16 1.5 L10.5 1.5 Q6.5 1.5 5.5 9.5 Q1.5 14 1.5 20 Q1.5 26 5.5 30.5 Q6.5 38.5 10.5 38.5 L16 38.5" fill="none" stroke={palette.primary} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <path d="M16 4 L11 4 Q8 4 7.5 10.8 Q4 14.8 4 20 Q4 25.2 7.5 29.2 Q8 36 11 36 L16 36" fill="none" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <svg viewBox="0 0 100 40" className="flex-1 min-w-0 h-full" preserveAspectRatio="none">
                        <rect x="-1" y="1.5" width="102" height="37" fill={palette.cartoucheFill} />
                        <line x1="-1" y1="1.5" x2="101" y2="1.5" stroke={palette.primary} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="38.5" x2="101" y2="38.5" stroke={palette.primary} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="4" x2="101" y2="4" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="36" x2="101" y2="36" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <svg viewBox="0 0 16 40" className="w-[15px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M0 1.5 L5.5 1.5 Q9.5 1.5 10.5 9.5 Q14.5 14 14.5 20 Q14.5 26 10.5 30.5 Q9.5 38.5 5.5 38.5 L0 38.5 Z" fill={palette.cartoucheFill} />
                        <path d="M0 1.5 L5.5 1.5 Q9.5 1.5 10.5 9.5 Q14.5 14 14.5 20 Q14.5 26 10.5 30.5 Q9.5 38.5 5.5 38.5 L0 38.5" fill="none" stroke={palette.primary} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <path d="M0 4 L5 4 Q8 4 8.5 10.8 Q12 14.8 12 20 Q12 25.2 8.5 29.2 Q8 36 5 36 L0 36" fill="none" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                    </svg>
                </div>
            );
        case 5: // Ottoman Smooth Pill Banner
            return (
                <div className="madinah-header-surah-frame absolute inset-0 flex items-stretch pointer-events-none" dir="ltr" aria-hidden="true">
                    <svg viewBox="0 0 16 40" className="w-[15px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M16 2 L14 2 A12 18 0 0 0 14 38 L16 38 Z" fill={palette.cartoucheFill} />
                        <path d="M16 2 L14 2 A12 18 0 0 0 14 38 L16 38" fill="none" stroke={palette.primary} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                        <path d="M16 4.6 L14.2 4.6 A9.5 15.4 0 0 0 14.2 35.4 L16 35.4" fill="none" stroke={palette.gold} strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <svg viewBox="0 0 100 40" className="flex-1 min-w-0 h-full" preserveAspectRatio="none">
                        <rect x="-1" y="2" width="102" height="36" fill={palette.cartoucheFill} />
                        <line x1="-1" y1="2" x2="101" y2="2" stroke={palette.primary} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="38" x2="101" y2="38" stroke={palette.primary} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="4.6" x2="101" y2="4.6" stroke={palette.gold} strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="35.4" x2="101" y2="35.4" stroke={palette.gold} strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <svg viewBox="0 0 16 40" className="w-[15px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M0 2 L2 2 A12 18 0 0 1 2 38 L0 38 Z" fill={palette.cartoucheFill} />
                        <path d="M0 2 L2 2 A12 18 0 0 1 2 38 L0 38" fill="none" stroke={palette.primary} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                        <path d="M0 4.6 L1.8 4.6 A9.5 15.4 0 0 1 1.8 35.4 L0 35.4" fill="none" stroke={palette.gold} strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
                    </svg>
                </div>
            );
        case 6: // Kufic Stepped Architectural Banner
            return (
                <div className="madinah-header-surah-frame absolute inset-0 flex items-stretch pointer-events-none" dir="ltr" aria-hidden="true">
                    <svg viewBox="0 0 16 40" className="w-[15px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M16 1.5 L7.5 1.5 L7.5 7.5 L2 7.5 L2 32.5 L7.5 32.5 L7.5 38.5 L16 38.5 Z" fill={palette.cartoucheFill} />
                        <path d="M16 1.5 L7.5 1.5 L7.5 7.5 L2 7.5 L2 32.5 L7.5 32.5 L7.5 38.5 L16 38.5" fill="none" stroke={palette.primary} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <path d="M16 4 L10 4 L10 10 L4.5 10 L4.5 30 L10 30 L10 36 L16 36" fill="none" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <svg viewBox="0 0 100 40" className="flex-1 min-w-0 h-full" preserveAspectRatio="none">
                        <rect x="-1" y="1.5" width="102" height="37" fill={palette.cartoucheFill} />
                        <line x1="-1" y1="1.5" x2="101" y2="1.5" stroke={palette.primary} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="38.5" x2="101" y2="38.5" stroke={palette.primary} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="4" x2="101" y2="4" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="36" x2="101" y2="36" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <svg viewBox="0 0 16 40" className="w-[15px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M0 1.5 L8.5 1.5 L8.5 7.5 L14 7.5 L14 32.5 L8.5 32.5 L8.5 38.5 L0 38.5 Z" fill={palette.cartoucheFill} />
                        <path d="M0 1.5 L8.5 1.5 L8.5 7.5 L14 7.5 L14 32.5 L8.5 32.5 L8.5 38.5 L0 38.5" fill="none" stroke={palette.primary} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <path d="M0 4 L6 4 L6 10 L11.5 10 L11.5 30 L6 30 L6 36 L0 36" fill="none" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                    </svg>
                </div>
            );
        case 1:
        default:
            return (
                <div className="madinah-header-surah-frame absolute inset-0 flex items-stretch pointer-events-none" dir="ltr" aria-hidden="true">
                    <svg viewBox="0 0 14 40" className="w-[14px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M14 1.5 L8 1.5 L1.5 8 L1.5 32 L8 38.5 L14 38.5 Z" fill={palette.cartoucheFill} stroke="none" />
                        <path d="M14 1.5 L8 1.5 L1.5 8 L1.5 32 L8 38.5 L14 38.5" fill="none" stroke={palette.primary} strokeWidth="1.3" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                        <path d="M14 4 L9.5 4 L4 9.5 L4 30.5 L9.5 36 L14 36" fill="none" stroke={palette.gold} strokeWidth="0.95" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <svg viewBox="0 0 100 40" className="flex-1 min-w-0 h-full" preserveAspectRatio="none">
                        <rect x="-1" y="1.5" width="102" height="37" fill={palette.cartoucheFill} />
                        <line x1="-1" y1="1.5" x2="101" y2="1.5" stroke={palette.primary} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="38.5" x2="101" y2="38.5" stroke={palette.primary} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="4" x2="101" y2="4" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                        <line x1="-1" y1="36" x2="101" y2="36" stroke={palette.gold} strokeWidth="0.95" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <svg viewBox="0 0 14 40" className="w-[14px] h-full shrink-0" preserveAspectRatio="none">
                        <path d="M0 1.5 L6 1.5 L12.5 8 L12.5 32 L6 38.5 L0 38.5 Z" fill={palette.cartoucheFill} stroke="none" />
                        <path d="M0 1.5 L6 1.5 L12.5 8 L12.5 32 L6 38.5 L0 38.5" fill="none" stroke={palette.primary} strokeWidth="1.3" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                        <path d="M0 4 L4.5 4 L10 9.5 L10 30.5 L4.5 36 L0 36" fill="none" stroke={palette.gold} strokeWidth="0.95" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                    </svg>
                </div>
            );
    }
};
