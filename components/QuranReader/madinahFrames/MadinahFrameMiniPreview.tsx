import React, { useId } from 'react';
import type { MadinahThemePalette } from '../MadinahFrameSVG';
import type { MadinahFrameDesignId } from './madinahFrameTypes';
import {
    MadinahVerticalPatternContent,
    MadinahHorizontalPatternContent,
    MadinahCornerRosetteSVG,
    MadinahBottomBadgeSVG,
} from './madinahOuterFrameParts';
import {
    MadinahSurahBannerPatternContent,
    MadinahSurahBannerCartoucheSVG,
} from './madinahSurahBannerParts';
import {
    MadinahHeaderCircleSVG,
    MadinahHeaderBadgeSVG,
    MadinahHeaderSurahFrameSVG,
} from './madinahHeaderBarParts';

/* ============================================================================
   4. LIVE MINIATURE FRAME PREVIEW FOR MADINAH SETTINGS MODAL
   ============================================================================ */

export const MadinahFrameMiniPreview: React.FC<{
    design: MadinahFrameDesignId;
    palette: MadinahThemePalette;
}> = ({ design, palette }) => {
    const uid = useId().replace(/:/g, '');
    const hPatId = `mf-prev-h-${uid}`;
    const vPatId = `mf-prev-v-${uid}`;
    const bPatId = `mf-prev-b-${uid}`;

    return (
        <div
            className="w-full h-[64px] rounded-xl overflow-hidden relative flex flex-col border"
            style={{
                backgroundColor: palette.frameBg,
                borderColor: palette.primary,
            }}
        >
            {/* Top Bar Mini Preview */}
            <div
                className="h-[19px] px-1.5 flex items-center justify-between gap-1 border-b shrink-0"
                style={{
                    backgroundColor: palette.frameBg,
                    borderBottomColor: palette.primary,
                }}
            >
                <div className="relative w-[13px] h-[13px] shrink-0">
                    <MadinahHeaderCircleSVG design={design} palette={palette} />
                </div>
                <div className="relative flex-1 h-[12px] min-w-0">
                    <MadinahHeaderSurahFrameSVG design={design} palette={palette} />
                </div>
                <div className="relative w-[16px] h-[12px] shrink-0">
                    <MadinahHeaderBadgeSVG design={design} palette={palette} />
                </div>
                <div className="relative w-[13px] h-[13px] shrink-0">
                    <MadinahHeaderCircleSVG design={design} palette={palette} />
                </div>
            </div>

            {/* Outer Frame & Inner Surah Cartouche Mini Preview */}
            <div className="flex-1 min-h-0 relative flex items-stretch px-[8px] pb-[8px]">
                {/* Left Side Frame */}
                <svg className="absolute left-0 top-0 bottom-[8px] w-[8px] h-[calc(100%-8px)]" preserveAspectRatio="none">
                    <defs>
                        <pattern id={vPatId} width="16" height="36" patternUnits="userSpaceOnUse" patternTransform="scale(0.5)">
                            <MadinahVerticalPatternContent design={design} palette={palette} />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#${vPatId})`} />
                </svg>

                {/* Right Side Frame */}
                <svg className="absolute right-0 top-0 bottom-[8px] w-[8px] h-[calc(100%-8px)]" preserveAspectRatio="none" style={{ transform: 'scaleX(-1)' }}>
                    <rect width="100%" height="100%" fill={`url(#${vPatId})`} />
                </svg>

                {/* Bottom Frame */}
                <svg className="absolute left-[8px] right-[8px] bottom-0 h-[8px] w-[calc(100%-16px)]" preserveAspectRatio="none">
                    <defs>
                        <pattern id={hPatId} width="36" height="16" patternUnits="userSpaceOnUse" patternTransform="scale(0.5)">
                            <MadinahHorizontalPatternContent design={design} palette={palette} />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#${hPatId})`} />
                </svg>

                {/* Corners */}
                <div className="absolute left-0 bottom-0 w-[9px] h-[9px]">
                    <MadinahCornerRosetteSVG design={design} palette={palette} />
                </div>
                <div className="absolute right-0 bottom-0 w-[9px] h-[9px]">
                    <MadinahCornerRosetteSVG design={design} palette={palette} />
                </div>

                {/* Inner Stage + Miniature Surah Banner */}
                <div
                    className="flex-1 min-w-0 flex flex-col items-center justify-center px-1.5 py-1 border-x border-b"
                    style={{
                        backgroundColor: palette.cartoucheFill,
                        borderColor: palette.gold,
                    }}
                >
                    <div
                        className="w-full h-[18px] rounded-[4px] relative flex items-center justify-center border overflow-hidden"
                        style={{
                            backgroundColor: palette.frameBg,
                            borderColor: palette.primary,
                        }}
                    >
                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                            <defs>
                                <pattern id={bPatId} width="32" height="16" patternUnits="userSpaceOnUse">
                                    <MadinahSurahBannerPatternContent design={design} palette={palette} />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill={`url(#${bPatId})`} />
                        </svg>
                        <div className="relative w-[56%] h-[14px] flex items-center justify-center">
                            <MadinahSurahBannerCartoucheSVG design={design} palette={palette} />
                            <span
                                className="relative z-10 text-[7.5px] font-bold leading-none truncate px-1"
                                style={{ color: palette.bannerText }}
                            >
                                الفاتحة
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bottom Center Page Medallion */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[26px] h-[10px]">
                    <MadinahBottomBadgeSVG design={design} palette={palette} />
                </div>
            </div>
        </div>
    );
};
