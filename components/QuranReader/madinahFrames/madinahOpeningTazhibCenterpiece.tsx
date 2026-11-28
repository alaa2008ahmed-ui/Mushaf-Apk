import React from 'react';
import type { MadinahThemePalette } from '../MadinahFrameSVG';
import type { MadinahFrameDesignId } from './madinahFrameTypes';

/* ============================================================================
   5B. OPENING PAGES (1 & 2) INNER TAZHIB CENTERPIECE
   ============================================================================ */

export const MadinahOpeningTazhibCenterpieceSVG: React.FC<{
    design: MadinahFrameDesignId;
    cx: number;
    cy: number;
    scale: number;
    isFatihah: boolean;
    palette: MadinahThemePalette;
}> = ({ design, cx, cy, scale, isFatihah, palette }) => {
    switch (design) {
        case 2: // Andalusian Curved Horseshoe Arch Wings & Floral Shamsa
            return (
                <g transform={`translate(${cx}, ${cy}) scale(${scale})`}>
                    {[1, -1].map((sDir, idx) => (
                        <g key={idx} transform={`scale(${sDir}, 1)`}>
                            <path
                                d="M44 0 Q72 -22 106 -8 Q120 0 132 0 Q120 0 106 8 Q72 22 44 0 Z"
                                fill={palette.cartoucheFill}
                                fillOpacity="0.86"
                                stroke={palette.primary}
                                strokeWidth="1.05"
                            />
                            <path
                                d="M52 0 Q74 -14 100 -4 Q112 0 120 0 Q112 0 100 4 Q74 14 52 0 Z"
                                fill={palette.secondary}
                                fillOpacity="0.28"
                                stroke={palette.gold}
                                strokeWidth="0.85"
                            />
                            <circle cx="78" cy="0" r="3.6" fill={palette.gold} stroke={palette.primary} strokeWidth="0.6" />
                            <circle cx="102" cy="0" r="2.2" fill={palette.primary} />
                            <circle cx="132" cy="0" r="2.4" fill={palette.gold} stroke={palette.primary} strokeWidth="0.55" />
                        </g>
                    ))}
                    {isFatihah ? (
                        <g>
                            <circle r="38" fill={palette.cartoucheFill} stroke={palette.primary} strokeWidth="1.35" />
                            <circle r="33" fill={palette.secondary} fillOpacity="0.16" stroke={palette.gold} strokeWidth="1.0" />
                            {Array.from({ length: 12 }).map((_, i) => (
                                <ellipse
                                    key={i}
                                    cx="0"
                                    cy="-18"
                                    rx="4.2"
                                    ry="9.5"
                                    transform={`rotate(${i * 30})`}
                                    fill={i % 2 === 0 ? palette.secondary : palette.gold}
                                    fillOpacity="0.42"
                                    stroke={palette.primary}
                                    strokeWidth="0.65"
                                />
                            ))}
                            <circle r="11" fill={palette.frameBg} stroke={palette.primary} strokeWidth="1.1" />
                            <circle r="6" fill={palette.gold} stroke={palette.primary} strokeWidth="0.7" />
                            <circle r="2.2" fill={palette.cartoucheFill} />
                        </g>
                    ) : (
                        <g>
                            <path
                                d="M-46 0 C-42 -22 -24 -30 0 -30 C24 -30 42 -22 46 0 C42 22 24 30 0 30 C-24 30 -42 22 -46 0 Z"
                                fill={palette.cartoucheFill}
                                stroke={palette.primary}
                                strokeWidth="1.35"
                            />
                            <path
                                d="M-40 0 C-36 -18 -21 -25 0 -25 C21 -25 36 -18 40 0 C36 18 21 25 0 25 C-21 25 -36 18 -40 0 Z"
                                fill={palette.secondary}
                                fillOpacity="0.18"
                                stroke={palette.gold}
                                strokeWidth="0.95"
                            />
                            {[0, 45, 90, 135].map((deg) => (
                                <ellipse
                                    key={deg}
                                    cx="0"
                                    cy="0"
                                    rx="13"
                                    ry="4.2"
                                    transform={`rotate(${deg})`}
                                    fill={palette.gold}
                                    fillOpacity="0.45"
                                    stroke={palette.primary}
                                    strokeWidth="0.65"
                                />
                            ))}
                            <circle r="4.8" fill={palette.gold} stroke={palette.primary} strokeWidth="0.8" />
                            <circle cx="-27" cy="0" r="2.6" fill={palette.gold} stroke={palette.primary} strokeWidth="0.6" />
                            <circle cx="27" cy="0" r="2.6" fill={palette.gold} stroke={palette.primary} strokeWidth="0.6" />
                        </g>
                    )}
                </g>
            );

        case 3: // Eight-Point Star Chevron Wings & Rub el Hizb Shamsa
            return (
                <g transform={`translate(${cx}, ${cy}) scale(${scale})`}>
                    {[1, -1].map((sDir, idx) => (
                        <g key={idx} transform={`scale(${sDir}, 1)`}>
                            <polygon
                                points="42,0 64,-15 106,-11 132,0 106,11 64,15"
                                fill={palette.cartoucheFill}
                                fillOpacity="0.9"
                                stroke={palette.primary}
                                strokeWidth="1.05"
                            />
                            <polygon
                                points="50,0 67,-10 100,-7 120,0 100,7 67,10"
                                fill={palette.secondary}
                                fillOpacity="0.28"
                                stroke={palette.gold}
                                strokeWidth="0.85"
                            />
                            <polygon points="78,-6 85,0 78,6 71,0" fill={palette.gold} stroke={palette.primary} strokeWidth="0.6" />
                            <polygon points="103,-4 108,0 103,4 98,0" fill={palette.gold} stroke={palette.primary} strokeWidth="0.55" />
                            <line x1="46" y1="-19" x2="122" y2="-11" stroke={palette.primary} strokeOpacity="0.55" strokeWidth="0.85" />
                            <line x1="46" y1="19" x2="122" y2="11" stroke={palette.primary} strokeOpacity="0.55" strokeWidth="0.85" />
                        </g>
                    ))}
                    {isFatihah ? (
                        <g>
                            <rect x="-28" y="-28" width="56" height="56" fill={palette.cartoucheFill} stroke={palette.primary} strokeWidth="1.35" />
                            <rect x="-28" y="-28" width="56" height="56" transform="rotate(45)" fill={palette.cartoucheFill} fillOpacity="0.92" stroke={palette.primary} strokeWidth="1.35" />
                            <rect x="-22" y="-22" width="44" height="44" fill={palette.secondary} fillOpacity="0.18" stroke={palette.gold} strokeWidth="1" />
                            <rect x="-22" y="-22" width="44" height="44" transform="rotate(45)" fill="none" stroke={palette.gold} strokeWidth="1" />
                            <polygon points="0,-15 15,0 0,15 -15,0" fill={palette.frameBg} stroke={palette.primary} strokeWidth="0.95" />
                            <circle r="5.5" fill={palette.gold} stroke={palette.primary} strokeWidth="0.85" />
                            <circle r="2" fill={palette.cartoucheFill} />
                        </g>
                    ) : (
                        <g>
                            <polygon
                                points="-48,0 -34,-28 34,-28 48,0 34,28 -34,28"
                                fill={palette.cartoucheFill}
                                stroke={palette.primary}
                                strokeWidth="1.35"
                            />
                            <polygon
                                points="-41,0 -29,-22 29,-22 41,0 29,22 -29,22"
                                fill={palette.secondary}
                                fillOpacity="0.18"
                                stroke={palette.gold}
                                strokeWidth="0.95"
                            />
                            <rect x="-13" y="-13" width="26" height="26" fill={palette.frameBg} stroke={palette.primary} strokeWidth="1" />
                            <rect x="-13" y="-13" width="26" height="26" transform="rotate(45)" fill={palette.frameBg} fillOpacity="0.9" stroke={palette.gold} strokeWidth="0.9" />
                            <polygon points="0,-7 7,0 0,7 -7,0" fill={palette.gold} stroke={palette.primary} strokeWidth="0.65" />
                            <polygon points="-28,-4 -24,0 -28,4 -32,0" fill={palette.gold} stroke={palette.primary} strokeWidth="0.6" />
                            <polygon points="28,-4 32,0 28,4 24,0" fill={palette.gold} stroke={palette.primary} strokeWidth="0.6" />
                        </g>
                    )}
                </g>
            );

        case 4: // Mamluk Trefoil Wings & Fluted Sunburst Medallion
            return (
                <g transform={`translate(${cx}, ${cy}) scale(${scale})`}>
                    {[1, -1].map((sDir, idx) => (
                        <g key={idx} transform={`scale(${sDir}, 1)`}>
                            <path
                                d="M44 0 C58 -18 76 -18 90 -8 Q106 -14 122 0 Q106 14 90 8 C76 18 58 18 44 0 Z"
                                fill={palette.cartoucheFill}
                                fillOpacity="0.9"
                                stroke={palette.primary}
                                strokeWidth="1.05"
                            />
                            <path
                                d="M52 0 C63 -11 76 -11 88 -4 Q100 -8 111 0 Q100 8 88 4 C76 11 63 11 52 0 Z"
                                fill={palette.secondary}
                                fillOpacity="0.28"
                                stroke={palette.gold}
                                strokeWidth="0.85"
                            />
                            <circle cx="71" cy="0" r="3.4" fill={palette.gold} stroke={palette.primary} strokeWidth="0.6" />
                            <path d="M122 0 L132 -4 L136 0 L132 4 Z" fill={palette.gold} stroke={palette.primary} strokeWidth="0.65" />
                        </g>
                    ))}
                    {isFatihah ? (
                        <g>
                            <polygon
                                points="0,-39 8,-30 20,-34 22,-22 34,-20 30,-8 39,0 30,8 34,20 22,22 20,34 8,30 0,39 -8,30 -20,34 -22,22 -34,20 -30,8 -39,0 -30,-8 -34,-20 -22,-22 -20,-34 -8,-30"
                                fill={palette.cartoucheFill}
                                stroke={palette.primary}
                                strokeWidth="1.25"
                            />
                            <circle r="27" fill={palette.secondary} fillOpacity="0.2" stroke={palette.gold} strokeWidth="1" />
                            <circle r="18" fill={palette.frameBg} stroke={palette.primary} strokeWidth="1.05" />
                            <circle r="10" fill={palette.gold} fillOpacity="0.65" stroke={palette.primary} strokeWidth="0.8" />
                            <circle r="3.5" fill={palette.cartoucheFill} />
                        </g>
                    ) : (
                        <g>
                            <path
                                d="M-47 0 Q-43 -14 -33 -17 Q-28 -30 -14 -30 L14 -30 Q28 -30 33 -17 Q43 -14 47 0 Q43 14 33 17 Q28 30 14 30 L-14 30 Q-28 30 -33 17 Q-43 14 -47 0 Z"
                                fill={palette.cartoucheFill}
                                stroke={palette.primary}
                                strokeWidth="1.3"
                            />
                            <path
                                d="M-40 0 Q-37 -11 -29 -13 Q-24 -24 -12 -24 L12 -24 Q24 -24 29 -13 Q37 -11 40 0 Q37 11 29 13 Q24 24 12 24 L-12 24 Q-24 24 -29 13 Q-37 11 -40 0 Z"
                                fill={palette.secondary}
                                fillOpacity="0.18"
                                stroke={palette.gold}
                                strokeWidth="0.95"
                            />
                            <circle r="13" fill={palette.frameBg} stroke={palette.primary} strokeWidth="1" />
                            <circle r="6" fill={palette.gold} stroke={palette.primary} strokeWidth="0.7" />
                            <circle cx="-26" cy="0" r="2.5" fill={palette.gold} stroke={palette.primary} strokeWidth="0.55" />
                            <circle cx="26" cy="0" r="2.5" fill={palette.gold} stroke={palette.primary} strokeWidth="0.55" />
                        </g>
                    )}
                </g>
            );

        case 5: // Ottoman Rumi Calm Minimalist Finials & Triple-Ring Shamsa
            return (
                <g transform={`translate(${cx}, ${cy}) scale(${scale})`}>
                    {[1, -1].map((sDir, idx) => (
                        <g key={idx} transform={`scale(${sDir}, 1)`}>
                            <line x1="42" y1="0" x2="128" y2="0" stroke={palette.gold} strokeWidth="1.1" />
                            <path
                                d="M46 -7 Q84 -15 118 0 Q84 15 46 7"
                                fill="none"
                                stroke={palette.primary}
                                strokeOpacity="0.45"
                                strokeWidth="0.8"
                            />
                            <circle cx="80" cy="0" r="5.5" fill={palette.cartoucheFill} stroke={palette.primary} strokeWidth="0.9" />
                            <circle cx="80" cy="0" r="2.2" fill={palette.gold} />
                            <circle cx="105" cy="0" r="3" fill={palette.cartoucheFill} stroke={palette.gold} strokeWidth="0.8" />
                            <circle cx="128" cy="0" r="2" fill={palette.gold} />
                        </g>
                    ))}
                    {isFatihah ? (
                        <g>
                            <circle r="35" fill={palette.cartoucheFill} stroke={palette.primary} strokeWidth="1.25" />
                            <circle r="29" fill={palette.secondary} fillOpacity="0.12" stroke={palette.gold} strokeWidth="0.95" />
                            <circle r="21" fill={palette.frameBg} stroke={palette.primary} strokeWidth="0.95" />
                            <circle r="13" fill="none" stroke={palette.gold} strokeWidth="0.85" />
                            <circle r="5" fill={palette.gold} stroke={palette.primary} strokeWidth="0.7" />
                        </g>
                    ) : (
                        <g>
                            <rect x="-44" y="-26" width="88" height="52" rx="26" fill={palette.cartoucheFill} stroke={palette.primary} strokeWidth="1.25" />
                            <rect x="-38" y="-20.5" width="76" height="41" rx="20.5" fill={palette.secondary} fillOpacity="0.12" stroke={palette.gold} strokeWidth="0.95" />
                            <circle r="13" fill={palette.frameBg} stroke={palette.primary} strokeWidth="0.95" />
                            <circle r="5" fill={palette.gold} stroke={palette.primary} strokeWidth="0.7" />
                            <circle cx="-26" cy="0" r="2.2" fill={palette.gold} />
                            <circle cx="26" cy="0" r="2.2" fill={palette.gold} />
                        </g>
                    )}
                </g>
            );

        case 6: // Kufic Stepped Architectural Wings & Maze Plaque
            return (
                <g transform={`translate(${cx}, ${cy}) scale(${scale})`}>
                    {[1, -1].map((sDir, idx) => (
                        <g key={idx} transform={`scale(${sDir}, 1)`}>
                            <path
                                d="M42 -10 H102 V-4 H122 V4 H102 V10 H42"
                                fill={palette.cartoucheFill}
                                fillOpacity="0.9"
                                stroke={palette.primary}
                                strokeWidth="1.05"
                                strokeLinejoin="miter"
                            />
                            <path
                                d="M48 -5 H95 V5 H48"
                                fill={palette.secondary}
                                fillOpacity="0.22"
                                stroke={palette.gold}
                                strokeWidth="0.85"
                                strokeLinejoin="miter"
                            />
                            <rect x="68" y="-3.5" width="7" height="7" fill={palette.gold} stroke={palette.primary} strokeWidth="0.6" />
                            <rect x="126" y="-2.5" width="5" height="5" fill={palette.gold} stroke={palette.primary} strokeWidth="0.55" />
                        </g>
                    ))}
                    {isFatihah ? (
                        <g>
                            <rect x="-33" y="-33" width="66" height="66" fill={palette.cartoucheFill} stroke={palette.primary} strokeWidth="1.35" />
                            <rect x="-27" y="-27" width="54" height="54" fill={palette.secondary} fillOpacity="0.16" stroke={palette.gold} strokeWidth="1" />
                            <path
                                d="M-19 -19 H19 V19 H-11 V-11 H11 V11 H-4 V-4 H4"
                                fill="none"
                                stroke={palette.primary}
                                strokeWidth="1.15"
                                strokeLinejoin="miter"
                            />
                            <rect x="-5" y="-5" width="10" height="10" fill={palette.gold} stroke={palette.primary} strokeWidth="0.7" />
                        </g>
                    ) : (
                        <g>
                            <polygon
                                points="-45,-16 -36,-16 -36,-28 36,-28 36,-16 45,-16 45,16 36,16 36,28 -36,28 -36,16 -45,16"
                                fill={palette.cartoucheFill}
                                stroke={palette.primary}
                                strokeWidth="1.35"
                                strokeLinejoin="miter"
                            />
                            <rect x="-32" y="-22" width="64" height="44" fill={palette.secondary} fillOpacity="0.16" stroke={palette.gold} strokeWidth="0.95" />
                            <rect x="-14" y="-14" width="28" height="28" fill={palette.frameBg} stroke={palette.primary} strokeWidth="1.05" />
                            <rect x="-6" y="-6" width="12" height="12" fill={palette.gold} stroke={palette.primary} strokeWidth="0.7" />
                            <rect x="-27" y="-3" width="6" height="6" fill={palette.gold} stroke={palette.primary} strokeWidth="0.55" />
                            <rect x="21" y="-3" width="6" height="6" fill={palette.gold} stroke={palette.primary} strokeWidth="0.55" />
                        </g>
                    )}
                </g>
            );

        case 1:
        default: // Royal Madinah Classic Wings & Shamsa
            return (
                <g transform={`translate(${cx}, ${cy}) scale(${scale})`}>
                    {[1, -1].map((sDir, idx) => (
                        <g key={idx} transform={`scale(${sDir}, 1)`}>
                            <line x1="44" y1="0" x2="132" y2="0" stroke={palette.gold} strokeWidth="1.15" />
                            <line x1="50" y1="-3.5" x2="118" y2="-3.5" stroke={palette.primary} strokeOpacity="0.35" strokeWidth="0.65" />
                            <line x1="50" y1="3.5" x2="118" y2="3.5" stroke={palette.primary} strokeOpacity="0.35" strokeWidth="0.65" />
                            <path
                                d="M52 0 C67 -12 87 -12 104 0 C87 12 67 12 52 0 Z"
                                fill={palette.cartoucheFill}
                                fillOpacity="0.88"
                                stroke={palette.primary}
                                strokeWidth="1"
                            />
                            <path
                                d="M58 0 C70 -7.5 84 -7.5 97 0 C84 7.5 70 7.5 58 0 Z"
                                fill={palette.secondary}
                                fillOpacity="0.3"
                                stroke={palette.gold}
                                strokeWidth="0.75"
                            />
                            <polygon
                                points="78,-4.2 82.8,0 78,4.2 73.2,0"
                                fill={palette.gold}
                                stroke={palette.primary}
                                strokeWidth="0.55"
                            />
                            <path
                                d="M42 -16 C64 -28 96 -26 122 -14 C106 -17 88 -17 72 -11"
                                fill="none"
                                stroke={palette.primary}
                                strokeOpacity="0.7"
                                strokeWidth="0.95"
                                strokeLinecap="round"
                            />
                            <path
                                d="M42 16 C64 28 96 26 122 14 C106 17 88 17 72 11"
                                fill="none"
                                stroke={palette.primary}
                                strokeOpacity="0.7"
                                strokeWidth="0.95"
                                strokeLinecap="round"
                            />
                            <circle cx="122" cy="-14" r="1.9" fill={palette.gold} stroke={palette.primary} strokeWidth="0.5" />
                            <circle cx="122" cy="14" r="1.9" fill={palette.gold} stroke={palette.primary} strokeWidth="0.5" />
                            <path
                                d="M112 0 C118 -6 126 -6 132 0 C126 6 118 6 112 0 Z"
                                fill={palette.secondary}
                                fillOpacity="0.45"
                                stroke={palette.primary}
                                strokeWidth="0.85"
                            />
                            <circle cx="132" cy="0" r="2.2" fill={palette.gold} stroke={palette.primary} strokeWidth="0.55" />
                        </g>
                    ))}

                    {isFatihah ? (
                        <g>
                            <circle r="38" fill={palette.cartoucheFill} stroke={palette.primary} strokeWidth="1.35" />
                            <circle r="34" fill={palette.secondary} fillOpacity="0.16" stroke={palette.gold} strokeWidth="1" strokeDasharray="2.8 1.8" />
                            <rect x="-21" y="-21" width="42" height="42" rx="2.2" fill={palette.frameBg} stroke={palette.primary} strokeWidth="1.15" />
                            <rect x="-21" y="-21" width="42" height="42" rx="2.2" transform="rotate(45)" fill={palette.frameBg} fillOpacity="0.88" stroke={palette.primary} strokeWidth="1.15" />
                            <rect x="-16.5" y="-16.5" width="33" height="33" rx="1.5" fill="none" stroke={palette.gold} strokeWidth="0.9" />
                            <rect x="-16.5" y="-16.5" width="33" height="33" rx="1.5" transform="rotate(45)" fill="none" stroke={palette.gold} strokeWidth="0.9" />
                            {[0, 45, 90, 135].map((deg) => (
                                <ellipse
                                    key={deg}
                                    cx="0"
                                    cy="0"
                                    rx="12"
                                    ry="4"
                                    transform={`rotate(${deg})`}
                                    fill={palette.secondary}
                                    fillOpacity="0.5"
                                    stroke={palette.primary}
                                    strokeWidth="0.7"
                                />
                            ))}
                            <circle r="5.2" fill={palette.gold} stroke={palette.primary} strokeWidth="0.85" />
                            <circle r="2" fill={palette.cartoucheFill} />
                        </g>
                    ) : (
                        <g>
                            <path
                                d="M-46 -17 L-30 -31 L30 -31 L46 -17 L46 17 L30 31 L-30 31 L-46 17 Z"
                                fill={palette.cartoucheFill}
                                stroke={palette.primary}
                                strokeWidth="1.35"
                            />
                            <path
                                d="M-41.5 -14.5 L-27.5 -27 L27.5 -27 L41.5 -14.5 L41.5 14.5 L27.5 27 L-27.5 27 L-41.5 14.5 Z"
                                fill={palette.secondary}
                                fillOpacity="0.18"
                                stroke={palette.gold}
                                strokeWidth="0.95"
                            />
                            <rect x="-14.5" y="-14.5" width="29" height="29" rx="1.6" fill={palette.frameBg} stroke={palette.primary} strokeWidth="1.05" />
                            <rect x="-14.5" y="-14.5" width="29" height="29" rx="1.6" transform="rotate(45)" fill={palette.frameBg} fillOpacity="0.92" stroke={palette.gold} strokeWidth="0.95" />
                            {[0, 45, 90, 135].map((deg) => (
                                <ellipse
                                    key={deg}
                                    cx="0"
                                    cy="0"
                                    rx="9.5"
                                    ry="3.2"
                                    transform={`rotate(${deg})`}
                                    fill={palette.secondary}
                                    fillOpacity="0.48"
                                    stroke={palette.primary}
                                    strokeWidth="0.65"
                                />
                            ))}
                            <circle r="4.2" fill={palette.gold} stroke={palette.primary} strokeWidth="0.75" />
                            <circle r="1.5" fill={palette.cartoucheFill} />
                            <polygon points="-30,-5 -25,0 -30,5 -35,0" fill={palette.gold} stroke={palette.primary} strokeWidth="0.7" />
                            <polygon points="30,-5 35,0 30,5 25,0" fill={palette.gold} stroke={palette.primary} strokeWidth="0.7" />
                        </g>
                    )}
                </g>
            );
    }
};
