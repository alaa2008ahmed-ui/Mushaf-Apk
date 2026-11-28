import React from 'react';
import type { MadinahThemePalette } from '../MadinahFrameSVG';
import type { MadinahFrameDesignId } from './madinahFrameTypes';

/* ============================================================================
   1. OUTER PAGE FRAME: Side Patterns, Corners, Bottom Edge & Medallion
   ============================================================================ */

export const MadinahVerticalPatternContent: React.FC<{
    design: MadinahFrameDesignId;
    palette: MadinahThemePalette;
}> = ({ design, palette }) => {
    switch (design) {
        case 2: // Andalusian Arch Wave & Pearls
            return (
                <>
                    <rect width="16" height="36" fill={palette.frameBg} />
                    <line x1="1" y1="0" x2="1" y2="36" stroke={palette.primary} strokeWidth="1.3" />
                    <line x1="15" y1="0" x2="15" y2="36" stroke={palette.gold} strokeWidth="1.1" />
                    <path
                        d="M3.5 0 Q12.5 9 3.5 18 Q12.5 27 3.5 36"
                        fill="none"
                        stroke={palette.primary}
                        strokeWidth="1.0"
                    />
                    <path
                        d="M12.5 0 Q3.5 9 12.5 18 Q3.5 27 12.5 36"
                        fill={palette.secondary}
                        fillOpacity="0.22"
                        stroke={palette.gold}
                        strokeWidth="0.85"
                    />
                    <circle cx="8" cy="9" r="1.7" fill={palette.gold} stroke={palette.primary} strokeWidth="0.5" />
                    <circle cx="8" cy="27" r="1.7" fill={palette.gold} stroke={palette.primary} strokeWidth="0.5" />
                    <circle cx="8" cy="18" r="1.2" fill={palette.deep} />
                </>
            );
        case 3: // Eight-Point Star / Geometric Rub el Hizb Lattice
            return (
                <>
                    <rect width="16" height="36" fill={palette.frameBg} />
                    <line x1="1" y1="0" x2="1" y2="36" stroke={palette.primary} strokeWidth="1.3" />
                    <line x1="15" y1="0" x2="15" y2="36" stroke={palette.gold} strokeWidth="1.1" />
                    <polygon
                        points="8,2 13,9 8,16 3,9"
                        fill={palette.secondary}
                        fillOpacity="0.34"
                        stroke={palette.primary}
                        strokeWidth="0.85"
                    />
                    <polygon
                        points="8,20 13,27 8,34 3,27"
                        fill={palette.secondary}
                        fillOpacity="0.34"
                        stroke={palette.primary}
                        strokeWidth="0.85"
                    />
                    <rect x="5.5" y="6.5" width="5" height="5" fill={palette.gold} fillOpacity="0.7" stroke={palette.deep} strokeWidth="0.5" />
                    <rect x="5.5" y="24.5" width="5" height="5" fill={palette.gold} fillOpacity="0.7" stroke={palette.deep} strokeWidth="0.5" />
                    <polygon points="8,15.5 10.5,18 8,20.5 5.5,18" fill={palette.gold} stroke={palette.primary} strokeWidth="0.5" />
                </>
            );
        case 4: // Mamluk Mihrab Trefoil Arcade
            return (
                <>
                    <rect width="16" height="36" fill={palette.frameBg} />
                    <line x1="1" y1="0" x2="1" y2="36" stroke={palette.primary} strokeWidth="1.4" />
                    <line x1="15" y1="0" x2="15" y2="36" stroke={palette.gold} strokeWidth="1.1" />
                    <path
                        d="M3 2 L12.5 2 L12.5 16 L3 16 Z"
                        fill={palette.secondary}
                        fillOpacity="0.2"
                        stroke={palette.primary}
                        strokeWidth="0.7"
                    />
                    <path
                        d="M3.5 9 Q7.5 4.5 12 9 Q7.5 13.5 3.5 9 Z"
                        fill={palette.gold}
                        fillOpacity="0.6"
                        stroke={palette.primary}
                        strokeWidth="0.75"
                    />
                    <path
                        d="M3 20 L12.5 20 L12.5 34 L3 34 Z"
                        fill={palette.secondary}
                        fillOpacity="0.2"
                        stroke={palette.primary}
                        strokeWidth="0.7"
                    />
                    <path
                        d="M3.5 27 Q7.5 22.5 12 27 Q7.5 31.5 3.5 27 Z"
                        fill={palette.gold}
                        fillOpacity="0.6"
                        stroke={palette.primary}
                        strokeWidth="0.75"
                    />
                    <circle cx="8" cy="18" r="1.5" fill={palette.deep} />
                </>
            );
        case 5: // Ottoman Rumi Minimalist Knots
            return (
                <>
                    <rect width="16" height="36" fill={palette.frameBg} />
                    <line x1="1.2" y1="0" x2="1.2" y2="36" stroke={palette.primary} strokeWidth="1.1" />
                    <line x1="3.6" y1="0" x2="3.6" y2="36" stroke={palette.gold} strokeWidth="0.65" strokeOpacity="0.75" />
                    <line x1="14.8" y1="0" x2="14.8" y2="36" stroke={palette.gold} strokeWidth="1.0" />
                    <line x1="9" y1="0" x2="9" y2="36" stroke={palette.primary} strokeWidth="0.55" strokeOpacity="0.35" />
                    <circle cx="9" cy="18" r="3.4" fill={palette.cartoucheFill} stroke={palette.primary} strokeWidth="0.85" />
                    <circle cx="9" cy="18" r="1.5" fill={palette.gold} />
                    <circle cx="9" cy="6" r="1.1" fill={palette.gold} fillOpacity="0.8" />
                    <circle cx="9" cy="30" r="1.1" fill={palette.gold} fillOpacity="0.8" />
                </>
            );
        case 6: // Kufic Geometric Fretwork
            return (
                <>
                    <rect width="16" height="36" fill={palette.frameBg} />
                    <line x1="1" y1="0" x2="1" y2="36" stroke={palette.primary} strokeWidth="1.3" />
                    <line x1="15" y1="0" x2="15" y2="36" stroke={palette.gold} strokeWidth="1.1" />
                    <path
                        d="M4 2 H12 V14 H6 V8 H10 V11 M12 18 H4 V34 H12 V22 H6 V28 H10 V25"
                        fill="none"
                        stroke={palette.primary}
                        strokeWidth="1.0"
                        strokeLinejoin="miter"
                    />
                    <rect x="6.5" y="15" width="3" height="3" fill={palette.gold} stroke={palette.deep} strokeWidth="0.5" />
                    <rect x="6.5" y="34.5" width="3" height="1.5" fill={palette.gold} />
                </>
            );
        case 1:
        default: // Royal Madinah Classic
            return (
                <>
                    <rect width="16" height="36" fill={palette.frameBg} />
                    <line x1="1" y1="0" x2="1" y2="36" stroke={palette.primary} strokeWidth="1.3" />
                    <line x1="15" y1="0" x2="15" y2="36" stroke={palette.gold} strokeWidth="1.1" />
                    <path
                        d="M8 2 C12 7 12 13 8 18 C4 13 4 7 8 2 Z M8 18 C12 23 12 29 8 34 C4 29 4 23 8 18 Z"
                        fill={palette.secondary}
                        fillOpacity="0.45"
                        stroke={palette.primary}
                        strokeWidth="0.85"
                    />
                    <circle cx="8" cy="18" r="2.2" fill={palette.gold} />
                    <circle cx="8" cy="0" r="1.4" fill={palette.deep} />
                    <circle cx="8" cy="36" r="1.4" fill={palette.deep} />
                </>
            );
    }
};

export const MadinahHorizontalPatternContent: React.FC<{
    design: MadinahFrameDesignId;
    palette: MadinahThemePalette;
}> = ({ design, palette }) => {
    switch (design) {
        case 2:
            return (
                <>
                    <rect width="36" height="16" fill={palette.frameBg} />
                    <line x1="0" y1="1" x2="36" y2="1" stroke={palette.primary} strokeWidth="1.2" />
                    <line x1="0" y1="15" x2="36" y2="15" stroke={palette.gold} strokeWidth="1.1" />
                    <path
                        d="M0 3.5 Q9 12.5 18 3.5 Q27 12.5 36 3.5"
                        fill="none"
                        stroke={palette.primary}
                        strokeWidth="1.0"
                    />
                    <path
                        d="M0 12.5 Q9 3.5 18 12.5 Q27 3.5 36 12.5"
                        fill={palette.secondary}
                        fillOpacity="0.22"
                        stroke={palette.gold}
                        strokeWidth="0.85"
                    />
                    <circle cx="9" cy="8" r="1.7" fill={palette.gold} stroke={palette.primary} strokeWidth="0.5" />
                    <circle cx="27" cy="8" r="1.7" fill={palette.gold} stroke={palette.primary} strokeWidth="0.5" />
                    <circle cx="18" cy="8" r="1.2" fill={palette.deep} />
                </>
            );
        case 3:
            return (
                <>
                    <rect width="36" height="16" fill={palette.frameBg} />
                    <line x1="0" y1="1" x2="36" y2="1" stroke={palette.primary} strokeWidth="1.2" />
                    <line x1="0" y1="15" x2="36" y2="15" stroke={palette.gold} strokeWidth="1.1" />
                    <polygon
                        points="2,8 9,3 16,8 9,13"
                        fill={palette.secondary}
                        fillOpacity="0.34"
                        stroke={palette.primary}
                        strokeWidth="0.85"
                    />
                    <polygon
                        points="20,8 27,3 34,8 27,13"
                        fill={palette.secondary}
                        fillOpacity="0.34"
                        stroke={palette.primary}
                        strokeWidth="0.85"
                    />
                    <rect x="6.5" y="5.5" width="5" height="5" fill={palette.gold} fillOpacity="0.7" stroke={palette.deep} strokeWidth="0.5" />
                    <rect x="24.5" y="5.5" width="5" height="5" fill={palette.gold} fillOpacity="0.7" stroke={palette.deep} strokeWidth="0.5" />
                    <polygon points="15.5,8 18,5.5 20.5,8 18,10.5" fill={palette.gold} stroke={palette.primary} strokeWidth="0.5" />
                </>
            );
        case 4:
            return (
                <>
                    <rect width="36" height="16" fill={palette.frameBg} />
                    <line x1="0" y1="1" x2="36" y2="1" stroke={palette.primary} strokeWidth="1.2" />
                    <line x1="0" y1="15" x2="36" y2="15" stroke={palette.gold} strokeWidth="1.1" />
                    <rect x="2" y="3" width="14" height="9.5" fill={palette.secondary} fillOpacity="0.2" stroke={palette.primary} strokeWidth="0.7" />
                    <path d="M9 3.5 Q13.5 7.5 9 12 Q4.5 7.5 9 3.5 Z" fill={palette.gold} fillOpacity="0.6" stroke={palette.primary} strokeWidth="0.75" />
                    <rect x="20" y="3" width="14" height="9.5" fill={palette.secondary} fillOpacity="0.2" stroke={palette.primary} strokeWidth="0.7" />
                    <path d="M27 3.5 Q31.5 7.5 27 12 Q22.5 7.5 27 3.5 Z" fill={palette.gold} fillOpacity="0.6" stroke={palette.primary} strokeWidth="0.75" />
                    <circle cx="18" cy="8" r="1.5" fill={palette.deep} />
                </>
            );
        case 5:
            return (
                <>
                    <rect width="36" height="16" fill={palette.frameBg} />
                    <line x1="0" y1="1.2" x2="36" y2="1.2" stroke={palette.primary} strokeWidth="1.1" />
                    <line x1="0" y1="3.6" x2="36" y2="3.6" stroke={palette.gold} strokeWidth="0.65" strokeOpacity="0.75" />
                    <line x1="0" y1="14.8" x2="36" y2="14.8" stroke={palette.gold} strokeWidth="1.0" />
                    <line x1="0" y1="9" x2="36" y2="9" stroke={palette.primary} strokeWidth="0.55" strokeOpacity="0.35" />
                    <circle cx="18" cy="9" r="3.4" fill={palette.cartoucheFill} stroke={palette.primary} strokeWidth="0.85" />
                    <circle cx="18" cy="9" r="1.5" fill={palette.gold} />
                    <circle cx="6" cy="9" r="1.1" fill={palette.gold} fillOpacity="0.8" />
                    <circle cx="30" cy="9" r="1.1" fill={palette.gold} fillOpacity="0.8" />
                </>
            );
        case 6:
            return (
                <>
                    <rect width="36" height="16" fill={palette.frameBg} />
                    <line x1="0" y1="1" x2="36" y2="1" stroke={palette.primary} strokeWidth="1.2" />
                    <line x1="0" y1="15" x2="36" y2="15" stroke={palette.gold} strokeWidth="1.1" />
                    <path
                        d="M2 4 V12 H14 V6 H8 V10 H11 M18 12 V4 H34 V12 H22 V6 H28 V10 H25"
                        fill="none"
                        stroke={palette.primary}
                        strokeWidth="1.0"
                        strokeLinejoin="miter"
                    />
                    <rect x="15" y="6.5" width="3" height="3" fill={palette.gold} stroke={palette.deep} strokeWidth="0.5" />
                    <rect x="34.5" y="6.5" width="1.5" height="3" fill={palette.gold} />
                </>
            );
        case 1:
        default:
            return (
                <>
                    <rect width="36" height="16" fill={palette.frameBg} />
                    <line x1="0" y1="1" x2="36" y2="1" stroke={palette.primary} strokeWidth="1.2" />
                    <line x1="0" y1="15" x2="36" y2="15" stroke={palette.gold} strokeWidth="1.1" />
                    <path
                        d="M2 8 C7 4 13 4 18 8 C13 12 7 12 2 8 Z M18 8 C23 4 29 4 34 8 C29 12 23 12 18 8 Z"
                        fill={palette.secondary}
                        fillOpacity="0.45"
                        stroke={palette.primary}
                        strokeWidth="0.85"
                    />
                    <circle cx="18" cy="8" r="2" fill={palette.gold} />
                    <circle cx="0" cy="8" r="1.3" fill={palette.deep} />
                    <circle cx="36" cy="8" r="1.3" fill={palette.deep} />
                </>
            );
    }
};

export const MadinahCornerRosetteSVG: React.FC<{
    design: MadinahFrameDesignId;
    palette: MadinahThemePalette;
}> = ({ design, palette }) => {
    switch (design) {
        case 2: // Andalusian Scalloped Arch Medallion
            return (
                <svg viewBox="0 0 28 28" className="w-full h-full" aria-hidden="true">
                    <rect x="0.75" y="0.75" width="26.5" height="26.5" rx="6" fill={palette.frameBg} stroke={palette.primary} strokeWidth="1.2" />
                    <circle cx="14" cy="14" r="9.2" fill={palette.secondary} fillOpacity="0.22" stroke={palette.gold} strokeWidth="1.0" />
                    <path
                        d="M14 5.5 C16.5 8.5 19.5 11.5 22.5 14 C19.5 16.5 16.5 19.5 14 22.5 C11.5 19.5 8.5 16.5 5.5 14 C8.5 11.5 11.5 8.5 14 5.5 Z"
                        fill={palette.gold}
                        fillOpacity="0.85"
                        stroke={palette.primary}
                        strokeWidth="0.7"
                    />
                    <circle cx="14" cy="14" r="3" fill={palette.cartoucheFill} stroke={palette.primary} strokeWidth="0.9" />
                </svg>
            );
        case 3: // Rub el Hizb Crisp Octagonal Star
            return (
                <svg viewBox="0 0 28 28" className="w-full h-full" aria-hidden="true">
                    <rect x="0.75" y="0.75" width="26.5" height="26.5" rx="1" fill={palette.frameBg} stroke={palette.primary} strokeWidth="1.2" />
                    <rect x="5" y="5" width="18" height="18" fill={palette.secondary} fillOpacity="0.24" stroke={palette.primary} strokeWidth="0.9" />
                    <rect x="5" y="5" width="18" height="18" transform="rotate(45 14 14)" fill={palette.gold} fillOpacity="0.4" stroke={palette.gold} strokeWidth="0.95" />
                    <polygon points="14,7.5 19.5,14 14,20.5 8.5,14" fill={palette.cartoucheFill} stroke={palette.primary} strokeWidth="0.9" />
                    <circle cx="14" cy="14" r="2" fill={palette.gold} />
                </svg>
            );
        case 4: // Mamluk Stepped Trefoil Corner
            return (
                <svg viewBox="0 0 28 28" className="w-full h-full" aria-hidden="true">
                    <polygon
                        points="5,1 23,1 27,5 27,23 23,27 5,27 1,23 1,5"
                        fill={palette.frameBg}
                        stroke={palette.primary}
                        strokeWidth="1.25"
                    />
                    <polygon
                        points="7,4 21,4 24,7 24,21 21,24 7,24 4,21 4,7"
                        fill={palette.secondary}
                        fillOpacity="0.22"
                        stroke={palette.gold}
                        strokeWidth="0.9"
                    />
                    <circle cx="14" cy="14" r="4.5" fill={palette.gold} stroke={palette.deep} strokeWidth="0.7" />
                    <circle cx="14" cy="14" r="1.8" fill={palette.cartoucheFill} />
                </svg>
            );
        case 5: // Ottoman Minimalist Floral Dot
            return (
                <svg viewBox="0 0 28 28" className="w-full h-full" aria-hidden="true">
                    <rect x="1" y="1" width="26" height="26" rx="13" fill={palette.frameBg} stroke={palette.primary} strokeWidth="1.15" />
                    <circle cx="14" cy="14" r="9.5" fill="none" stroke={palette.gold} strokeWidth="0.85" />
                    <circle cx="14" cy="14" r="4.8" fill={palette.cartoucheFill} stroke={palette.primary} strokeWidth="0.9" />
                    <circle cx="14" cy="14" r="2" fill={palette.gold} />
                </svg>
            );
        case 6: // Kufic Architectural Square Tile
            return (
                <svg viewBox="0 0 28 28" className="w-full h-full" aria-hidden="true">
                    <rect x="0.75" y="0.75" width="26.5" height="26.5" fill={palette.frameBg} stroke={palette.primary} strokeWidth="1.25" />
                    <rect x="4" y="4" width="20" height="20" fill="none" stroke={palette.gold} strokeWidth="0.95" />
                    <rect x="7.5" y="7.5" width="13" height="13" fill={palette.secondary} fillOpacity="0.28" stroke={palette.primary} strokeWidth="0.9" />
                    <rect x="11" y="11" width="6" height="6" fill={palette.gold} stroke={palette.deep} strokeWidth="0.7" />
                </svg>
            );
        case 1:
        default:
            return (
                <svg viewBox="0 0 28 28" className="w-full h-full" aria-hidden="true">
                    <rect x="0.75" y="0.75" width="26.5" height="26.5" rx="2.5" fill={palette.frameBg} stroke={palette.primary} strokeWidth="1.2" />
                    <rect x="3.5" y="3.5" width="21" height="21" rx="1.5" fill="none" stroke={palette.gold} strokeWidth="0.9" />
                    <circle cx="14" cy="14" r="6.8" fill={palette.primary} opacity="0.22" stroke={palette.primary} strokeWidth="1" />
                    <path
                        d="M14 5.5 L16.2 11.8 L22.5 14 L16.2 16.2 L14 22.5 L11.8 16.2 L5.5 14 L11.8 11.8 Z"
                        fill={palette.gold}
                        stroke={palette.deep}
                        strokeWidth="0.6"
                    />
                    <circle cx="14" cy="14" r="2.2" fill={palette.cartoucheFill} stroke={palette.primary} strokeWidth="0.8" />
                </svg>
            );
    }
};

export const MadinahBottomBadgeSVG: React.FC<{
    design: MadinahFrameDesignId;
    palette: MadinahThemePalette;
}> = ({ design, palette }) => {
    switch (design) {
        case 2: // Andalusian Pointed Arch Badge
            return (
                <svg viewBox="0 0 68 22" className="absolute inset-0 w-full h-full block pointer-events-none" preserveAspectRatio="none" aria-hidden="true">
                    <path
                        d="M12,1.5 L56,1.5 C64,1.5 66.5,7.5 66.5,11 C66.5,14.5 64,20.5 56,20.5 L12,20.5 C4,20.5 1.5,14.5 1.5,11 C1.5,7.5 4,1.5 12,1.5 Z"
                        fill={palette.cartoucheFill}
                        stroke={palette.primary}
                        strokeWidth="1.25"
                        vectorEffect="non-scaling-stroke"
                    />
                    <path
                        d="M13.5,3.8 L54.5,3.8 C60.5,3.8 63.2,8 63.2,11 C63.2,14 60.5,18.2 54.5,18.2 L13.5,18.2 C7.5,18.2 4.8,14 4.8,11 C4.8,8 7.5,3.8 13.5,3.8 Z"
                        fill="none"
                        stroke={palette.gold}
                        strokeWidth="0.9"
                        vectorEffect="non-scaling-stroke"
                    />
                    <circle cx="9.5" cy="11" r="1.5" fill={palette.gold} stroke={palette.primary} strokeWidth="0.5" />
                    <circle cx="58.5" cy="11" r="1.5" fill={palette.gold} stroke={palette.primary} strokeWidth="0.5" />
                </svg>
            );
        case 3: // Eight-Pointed Geometric Diamond Medallion
            return (
                <svg viewBox="0 0 68 22" className="absolute inset-0 w-full h-full block pointer-events-none" preserveAspectRatio="none" aria-hidden="true">
                    <polygon
                        points="11,1.5 57,1.5 62,5.5 66.5,11 62,16.5 57,20.5 11,20.5 6,16.5 1.5,11 6,5.5"
                        fill={palette.cartoucheFill}
                        stroke={palette.primary}
                        strokeWidth="1.25"
                        strokeLinejoin="miter"
                        vectorEffect="non-scaling-stroke"
                    />
                    <polygon
                        points="12.5,3.8 55.5,3.8 59.5,7 63,11 59.5,15 55.5,18.2 12.5,18.2 8.5,15 5,11 8.5,7"
                        fill="none"
                        stroke={palette.gold}
                        strokeWidth="0.9"
                        vectorEffect="non-scaling-stroke"
                    />
                    <polygon points="9.5,9.2 11.3,11 9.5,12.8 7.7,11" fill={palette.gold} />
                    <polygon points="58.5,9.2 60.3,11 58.5,12.8 56.7,11" fill={palette.gold} />
                </svg>
            );
        case 4: // Mamluk Trefoil Medallion
            return (
                <svg viewBox="0 0 68 22" className="absolute inset-0 w-full h-full block pointer-events-none" preserveAspectRatio="none" aria-hidden="true">
                    <path
                        d="M11,2 L57,2 Q61,2 62,6 Q66.5,8.5 66.5,11 Q66.5,13.5 62,16 Q61,20 57,20 L11,20 Q7,20 6,16 Q1.5,13.5 1.5,11 Q1.5,8.5 6,6 Q7,2 11,2 Z"
                        fill={palette.cartoucheFill}
                        stroke={palette.primary}
                        strokeWidth="1.25"
                        vectorEffect="non-scaling-stroke"
                    />
                    <path
                        d="M12.5,4.2 L55.5,4.2 Q58.5,4.2 59.5,7.2 Q63,9 63,11 Q63,13 59.5,14.8 Q58.5,17.8 55.5,17.8 L12.5,17.8 Q9.5,17.8 8.5,14.8 Q5,13 5,11 Q5,9 8.5,7.2 Q9.5,4.2 12.5,4.2 Z"
                        fill="none"
                        stroke={palette.gold}
                        strokeWidth="0.9"
                        vectorEffect="non-scaling-stroke"
                    />
                    <circle cx="9.5" cy="11" r="1.4" fill={palette.gold} stroke={palette.primary} strokeWidth="0.5" />
                    <circle cx="58.5" cy="11" r="1.4" fill={palette.gold} stroke={palette.primary} strokeWidth="0.5" />
                </svg>
            );
        case 5: // Ottoman Smooth Pill Medallion
            return (
                <svg viewBox="0 0 68 22" className="absolute inset-0 w-full h-full block pointer-events-none" preserveAspectRatio="none" aria-hidden="true">
                    <rect
                        x="2"
                        y="2"
                        width="64"
                        height="18"
                        rx="9"
                        fill={palette.cartoucheFill}
                        stroke={palette.primary}
                        strokeWidth="1.2"
                        vectorEffect="non-scaling-stroke"
                    />
                    <rect
                        x="4.5"
                        y="4.2"
                        width="59"
                        height="13.6"
                        rx="6.8"
                        fill="none"
                        stroke={palette.gold}
                        strokeWidth="0.85"
                        vectorEffect="non-scaling-stroke"
                    />
                    <circle cx="9.5" cy="11" r="1.3" fill={palette.gold} />
                    <circle cx="58.5" cy="11" r="1.3" fill={palette.gold} />
                </svg>
            );
        case 6: // Kufic Stepped Architectural Plaque
            return (
                <svg viewBox="0 0 68 22" className="absolute inset-0 w-full h-full block pointer-events-none" preserveAspectRatio="none" aria-hidden="true">
                    <polygon
                        points="8,1.5 60,1.5 60,4.5 66,4.5 66,17.5 60,17.5 60,20.5 8,20.5 8,17.5 2,17.5 2,4.5 8,4.5"
                        fill={palette.cartoucheFill}
                        stroke={palette.primary}
                        strokeWidth="1.25"
                        strokeLinejoin="miter"
                        vectorEffect="non-scaling-stroke"
                    />
                    <rect x="6" y="4" width="56" height="14" fill="none" stroke={palette.gold} strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
                    <rect x="8.5" y="9.5" width="3" height="3" fill={palette.gold} stroke={palette.primary} strokeWidth="0.5" />
                    <rect x="56.5" y="9.5" width="3" height="3" fill={palette.gold} stroke={palette.primary} strokeWidth="0.5" />
                </svg>
            );
        case 1:
        default:
            return (
                <svg viewBox="0 0 68 22" className="absolute inset-0 w-full h-full block pointer-events-none" preserveAspectRatio="none" aria-hidden="true">
                    <polygon
                        points="9,1.5 59,1.5 66.5,11 59,20.5 9,20.5 1.5,11"
                        fill={palette.cartoucheFill}
                        stroke={palette.primary}
                        strokeWidth="1.25"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                    />
                    <polygon
                        points="11,3.8 57,3.8 63.2,11 57,18.2 11,18.2 4.8,11"
                        fill="none"
                        stroke={palette.gold}
                        strokeWidth="0.9"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                    />
                    <circle cx="8.5" cy="11" r="1.4" fill={palette.gold} stroke={palette.primary} strokeWidth="0.5" />
                    <circle cx="59.5" cy="11" r="1.4" fill={palette.gold} stroke={palette.primary} strokeWidth="0.5" />
                </svg>
            );
    }
};
