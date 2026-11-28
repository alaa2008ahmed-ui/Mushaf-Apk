import React from 'react';
import type { MadinahThemePalette } from '../MadinahFrameSVG';
import type { MadinahFrameDesignId } from './madinahFrameTypes';

/* ============================================================================
   5A. OPENING PAGES (1 & 2) INNER TAZHIB CARPET, CORNERS & CREST
   ============================================================================ */

export const MadinahOpeningTazhibPatternContent: React.FC<{
    design: MadinahFrameDesignId;
    palette: MadinahThemePalette;
}> = ({ design, palette }) => {
    switch (design) {
        case 2: // Andalusian Interlaced Ogee Arches & Pearls
            return (
                <>
                    <rect width="36" height="36" fill={palette.frameBg} />
                    <path
                        d="M0 18 Q9 4 18 18 Q27 32 36 18 M0 18 Q9 32 18 18 Q27 4 36 18"
                        fill={palette.secondary}
                        fillOpacity="0.16"
                        stroke={palette.primary}
                        strokeOpacity="0.26"
                        strokeWidth="0.7"
                    />
                    <path
                        d="M18 0 Q4 9 18 18 Q32 27 18 36 M18 0 Q32 9 18 18 Q4 27 18 36"
                        fill="none"
                        stroke={palette.gold}
                        strokeOpacity="0.45"
                        strokeWidth="0.7"
                    />
                    <circle cx="9" cy="18" r="2.2" fill={palette.cartoucheFill} stroke={palette.primary} strokeOpacity="0.3" strokeWidth="0.6" />
                    <circle cx="27" cy="18" r="2.2" fill={palette.cartoucheFill} stroke={palette.primary} strokeOpacity="0.3" strokeWidth="0.6" />
                    <circle cx="18" cy="9" r="1.5" fill={palette.gold} fillOpacity="0.65" />
                    <circle cx="18" cy="27" r="1.5" fill={palette.gold} fillOpacity="0.65" />
                    <circle cx="18" cy="18" r="1.4" fill={palette.primary} fillOpacity="0.4" />
                </>
            );
        case 3: // Eight-Point Star / Rub el Hizb Mosaic Lattice
            return (
                <>
                    <rect width="36" height="36" fill={palette.frameBg} />
                    <rect
                        x="7"
                        y="7"
                        width="22"
                        height="22"
                        fill={palette.secondary}
                        fillOpacity="0.14"
                        stroke={palette.primary}
                        strokeOpacity="0.24"
                        strokeWidth="0.65"
                    />
                    <rect
                        x="7"
                        y="7"
                        width="22"
                        height="22"
                        transform="rotate(45 18 18)"
                        fill={palette.gold}
                        fillOpacity="0.12"
                        stroke={palette.gold}
                        strokeOpacity="0.45"
                        strokeWidth="0.65"
                    />
                    <polygon
                        points="18,10.5 25.5,18 18,25.5 10.5,18"
                        fill={palette.cartoucheFill}
                        fillOpacity="0.65"
                        stroke={palette.primary}
                        strokeOpacity="0.28"
                        strokeWidth="0.6"
                    />
                    <polygon points="18,15.2 20.8,18 18,20.8 15.2,18" fill={palette.gold} fillOpacity="0.72" />
                    <polygon points="0,15.5 2.5,18 0,20.5 -2.5,18" fill={palette.primary} fillOpacity="0.25" />
                    <polygon points="36,15.5 38.5,18 36,20.5 33.5,18" fill={palette.primary} fillOpacity="0.25" />
                    <polygon points="15.5,0 18,2.5 20.5,0 18,-2.5" fill={palette.primary} fillOpacity="0.25" />
                    <polygon points="15.5,36 18,38.5 20.5,36 18,33.5" fill={palette.primary} fillOpacity="0.25" />
                </>
            );
        case 4: // Mamluk Honeycomb Mihrab Arcade & Trefoils
            return (
                <>
                    <rect width="36" height="36" fill={palette.frameBg} />
                    <path
                        d="M3 32 V14 Q18 3 33 14 V32 Z"
                        fill={palette.secondary}
                        fillOpacity="0.15"
                        stroke={palette.primary}
                        strokeOpacity="0.24"
                        strokeWidth="0.68"
                    />
                    <path
                        d="M9 28 V17 Q18 9 27 17 V28 Z"
                        fill="none"
                        stroke={palette.gold}
                        strokeOpacity="0.44"
                        strokeWidth="0.65"
                    />
                    <path
                        d="M18 13 Q23 19 18 25 Q13 19 18 13 Z"
                        fill={palette.gold}
                        fillOpacity="0.24"
                        stroke={palette.primary}
                        strokeOpacity="0.28"
                        strokeWidth="0.6"
                    />
                    <circle cx="18" cy="19" r="1.5" fill={palette.gold} fillOpacity="0.7" />
                    <circle cx="0" cy="0" r="1.8" fill={palette.primary} fillOpacity="0.24" />
                    <circle cx="36" cy="0" r="1.8" fill={palette.primary} fillOpacity="0.24" />
                    <circle cx="0" cy="36" r="1.8" fill={palette.primary} fillOpacity="0.24" />
                    <circle cx="36" cy="36" r="1.8" fill={palette.primary} fillOpacity="0.24" />
                </>
            );
        case 5: // Ottoman Rumi Calm Rings & Delicate Pearls
            return (
                <>
                    <rect width="36" height="36" fill={palette.frameBg} />
                    <circle cx="18" cy="18" r="11" fill="none" stroke={palette.primary} strokeOpacity="0.18" strokeWidth="0.6" />
                    <circle cx="18" cy="18" r="6.5" fill={palette.secondary} fillOpacity="0.1" stroke={palette.gold} strokeOpacity="0.4" strokeWidth="0.6" />
                    <circle cx="18" cy="18" r="1.8" fill={palette.gold} fillOpacity="0.65" />
                    <circle cx="0" cy="0" r="6.5" fill="none" stroke={palette.gold} strokeOpacity="0.3" strokeWidth="0.55" />
                    <circle cx="36" cy="0" r="6.5" fill="none" stroke={palette.gold} strokeOpacity="0.3" strokeWidth="0.55" />
                    <circle cx="0" cy="36" r="6.5" fill="none" stroke={palette.gold} strokeOpacity="0.3" strokeWidth="0.55" />
                    <circle cx="36" cy="36" r="6.5" fill="none" stroke={palette.gold} strokeOpacity="0.3" strokeWidth="0.55" />
                </>
            );
        case 6: // Kufic Geometric Interlocking Fretwork Grid
            return (
                <>
                    <rect width="36" height="36" fill={palette.frameBg} />
                    <path
                        d="M3 3 H33 V33 H3 Z"
                        fill="none"
                        stroke={palette.primary}
                        strokeOpacity="0.18"
                        strokeWidth="0.65"
                    />
                    <path
                        d="M8 8 H28 V24 H13 V14 H22 V19"
                        fill="none"
                        stroke={palette.gold}
                        strokeOpacity="0.45"
                        strokeWidth="0.7"
                        strokeLinejoin="miter"
                    />
                    <rect x="15.5" y="15.5" width="5" height="5" fill={palette.secondary} fillOpacity="0.22" stroke={palette.primary} strokeOpacity="0.28" strokeWidth="0.6" />
                    <rect x="0" y="0" width="3" height="3" fill={palette.gold} fillOpacity="0.35" />
                    <rect x="33" y="0" width="3" height="3" fill={palette.gold} fillOpacity="0.35" />
                    <rect x="0" y="33" width="3" height="3" fill={palette.gold} fillOpacity="0.35" />
                    <rect x="33" y="33" width="3" height="3" fill={palette.gold} fillOpacity="0.35" />
                </>
            );
        case 1:
        default: // Royal Madinah 8-Fold Rosette & Petal Girih Lattice
            return (
                <>
                    <rect width="36" height="36" fill={palette.frameBg} />
                    <path
                        d="M18 2 L22.5 13.5 L34 18 L22.5 22.5 L18 34 L13.5 22.5 L2 18 L13.5 13.5 Z"
                        fill={palette.secondary}
                        fillOpacity="0.18"
                        stroke={palette.gold}
                        strokeOpacity="0.42"
                        strokeWidth="0.65"
                    />
                    <path
                        d="M0 0 C6 4 12 4 18 0 M18 0 C24 4 30 4 36 0 M0 36 C6 32 12 32 18 36 M18 36 C24 32 30 32 36 36 M0 0 C4 6 4 12 0 18 M0 18 C4 24 4 30 0 36 M36 0 C32 6 32 12 36 18 M36 18 C32 24 32 30 36 36"
                        fill="none"
                        stroke={palette.primary}
                        strokeOpacity="0.2"
                        strokeWidth="0.65"
                    />
                    <circle cx="18" cy="18" r="4.2" fill={palette.cartoucheFill} fillOpacity="0.55" stroke={palette.primary} strokeOpacity="0.28" strokeWidth="0.6" />
                    <circle cx="18" cy="18" r="1.4" fill={palette.gold} fillOpacity="0.65" />
                    <circle cx="0" cy="0" r="1.5" fill={palette.gold} fillOpacity="0.45" />
                    <circle cx="36" cy="0" r="1.5" fill={palette.gold} fillOpacity="0.45" />
                    <circle cx="0" cy="36" r="1.5" fill={palette.gold} fillOpacity="0.45" />
                    <circle cx="36" cy="36" r="1.5" fill={palette.gold} fillOpacity="0.45" />
                </>
            );
    }
};

export const MadinahOpeningTazhibCornerSVG: React.FC<{
    design: MadinahFrameDesignId;
    palette: MadinahThemePalette;
}> = ({ design, palette }) => {
    switch (design) {
        case 2: // Andalusian Scalloped Arch Quarter-Rosette
            return (
                <>
                    <path
                        d="M0 0 L23 0 Q17 8 18 14 Q8 17 0 23 Z"
                        fill={palette.secondary}
                        fillOpacity="0.22"
                        stroke={palette.primary}
                        strokeOpacity="0.5"
                        strokeWidth="0.8"
                    />
                    <path
                        d="M0 0 L15 0 Q11 7 11 11 Q7 11 0 15 Z"
                        fill={palette.cartoucheFill}
                        fillOpacity="0.65"
                        stroke={palette.gold}
                        strokeWidth="0.75"
                    />
                    <circle cx="5.5" cy="5.5" r="1.8" fill={palette.gold} stroke={palette.primary} strokeWidth="0.4" />
                    <circle cx="14.5" cy="4.5" r="1.1" fill={palette.gold} />
                    <circle cx="4.5" cy="14.5" r="1.1" fill={palette.gold} />
                </>
            );
        case 3: // Eight-Point Star Geometric Diagonal Bevel
            return (
                <>
                    <polygon
                        points="0,0 22,0 13,13 0,22"
                        fill={palette.secondary}
                        fillOpacity="0.25"
                        stroke={palette.primary}
                        strokeOpacity="0.52"
                        strokeWidth="0.8"
                    />
                    <polygon
                        points="0,0 15,0 9,9 0,15"
                        fill={palette.cartoucheFill}
                        fillOpacity="0.7"
                        stroke={palette.gold}
                        strokeWidth="0.75"
                    />
                    <polygon points="5.5,2.5 8.5,5.5 5.5,8.5 2.5,5.5" fill={palette.gold} stroke={palette.primary} strokeWidth="0.45" />
                </>
            );
        case 4: // Mamluk Stepped Corner Niche
            return (
                <>
                    <polygon
                        points="0,0 22,0 22,6 15,6 15,15 6,15 6,22 0,22"
                        fill={palette.secondary}
                        fillOpacity="0.24"
                        stroke={palette.primary}
                        strokeOpacity="0.5"
                        strokeWidth="0.8"
                    />
                    <rect x="0" y="0" width="12" height="12" fill={palette.cartoucheFill} fillOpacity="0.65" stroke={palette.gold} strokeWidth="0.75" />
                    <circle cx="6" cy="6" r="2.2" fill={palette.gold} stroke={palette.primary} strokeWidth="0.45" />
                </>
            );
        case 5: // Ottoman Minimalist Smooth Pearl Arc
            return (
                <>
                    <path
                        d="M0 0 L20 0 A20 20 0 0 1 0 20 Z"
                        fill={palette.secondary}
                        fillOpacity="0.14"
                        stroke={palette.primary}
                        strokeOpacity="0.38"
                        strokeWidth="0.7"
                    />
                    <path
                        d="M0 0 L13.5 0 A13.5 13.5 0 0 1 0 13.5"
                        fill="none"
                        stroke={palette.gold}
                        strokeWidth="0.7"
                    />
                    <circle cx="5.2" cy="5.2" r="1.5" fill={palette.gold} />
                </>
            );
        case 6: // Kufic Sharp Stepped Square Corner Tile
            return (
                <>
                    <rect x="0" y="0" width="20" height="20" fill={palette.secondary} fillOpacity="0.2" stroke={palette.primary} strokeOpacity="0.48" strokeWidth="0.8" />
                    <path d="M0 14 H14 V0" fill="none" stroke={palette.gold} strokeWidth="0.85" />
                    <rect x="2.5" y="2.5" width="8.5" height="8.5" fill={palette.cartoucheFill} fillOpacity="0.75" stroke={palette.primary} strokeWidth="0.7" />
                    <rect x="4.8" y="4.8" width="4" height="4" fill={palette.gold} />
                </>
            );
        case 1:
        default: // Royal Madinah Quarter-Rosette
            return (
                <>
                    <path
                        d="M0 0 L22 0 C22 12.1 12.1 22 0 22 Z"
                        fill={palette.secondary}
                        fillOpacity="0.24"
                        stroke={palette.primary}
                        strokeOpacity="0.48"
                        strokeWidth="0.8"
                    />
                    <path
                        d="M0 0 L15 0 C15 8.3 8.3 15 0 15 Z"
                        fill={palette.cartoucheFill}
                        fillOpacity="0.6"
                        stroke={palette.gold}
                        strokeWidth="0.75"
                    />
                    <circle cx="5.5" cy="5.5" r="1.7" fill={palette.gold} />
                </>
            );
    }
};

export const MadinahOpeningTazhibCrestSVG: React.FC<{
    design: MadinahFrameDesignId;
    palette: MadinahThemePalette;
    cx: number;
    yCut: number;
    direction: 'top' | 'bottom';
}> = ({ design, palette, cx, yCut, direction }) => {
    // Tip points strictly away from the Quran text (upward for top carpet, downward for bottom carpet)
    const sy = direction === 'top' ? -1 : 1;

    switch (design) {
        case 2: // Andalusian Pearl Finial
            return (
                <g transform={`translate(${cx}, ${yCut}) scale(1, ${sy})`}>
                    <path d="M-12 0 Q0 12 12 0" fill={palette.frameBg} stroke={palette.primary} strokeWidth="1.15" />
                    <circle cx="0" cy="4.2" r="2.2" fill={palette.gold} stroke={palette.primary} strokeWidth="0.55" />
                    <circle cx="-6" cy="2" r="1.1" fill={palette.gold} />
                    <circle cx="6" cy="2" r="1.1" fill={palette.gold} />
                </g>
            );
        case 3: // Eight-Point Star Faceted Crest
            return (
                <g transform={`translate(${cx}, ${yCut}) scale(1, ${sy})`}>
                    <polygon points="-11,0 0,10 11,0 0,-2" fill={palette.cartoucheFill} stroke={palette.primary} strokeWidth="1.1" />
                    <polygon points="-5,0 0,5 5,0 0,-1" fill={palette.gold} />
                </g>
            );
        case 4: // Mamluk Trefoil Apex Finial
            return (
                <g transform={`translate(${cx}, ${yCut}) scale(1, ${sy})`}>
                    <path d="M-11 0 Q-5 9 0 12 Q5 9 11 0" fill={palette.cartoucheFill} stroke={palette.primary} strokeWidth="1.1" />
                    <circle cx="0" cy="5.5" r="2.3" fill={palette.gold} stroke={palette.primary} strokeWidth="0.55" />
                </g>
            );
        case 5: // Ottoman Minimalist Dot
            return (
                <g transform={`translate(${cx}, ${yCut}) scale(1, ${sy})`}>
                    <circle cx="0" cy="3.5" r="2.1" fill={palette.gold} stroke={palette.primary} strokeWidth="0.6" />
                </g>
            );
        case 6: // Kufic Stepped Square Bracket
            return (
                <g transform={`translate(${cx}, ${yCut}) scale(1, ${sy})`}>
                    <polygon points="-12,0 -12,5 -6,5 -6,9 6,9 6,5 12,5 12,0" fill={palette.cartoucheFill} stroke={palette.primary} strokeWidth="1.1" />
                    <rect x="-2.8" y="2.2" width="5.6" height="4.2" fill={palette.gold} stroke={palette.primary} strokeWidth="0.5" />
                </g>
            );
        case 1:
        default:
            return null;
    }
};
