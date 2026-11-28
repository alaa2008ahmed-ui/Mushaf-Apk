import React from 'react';
import { ChevronLeft } from 'lucide-react';
import type { GlobalSearchThemeStyles } from '../globalSearchTheme';

export const highlightSearchText = (
    text: string,
    regex: RegExp | null,
    theme: any
): React.ReactNode => {
    if (!text) return null;
    if (!regex) return <span>{text}</span>;
    try {
        const parts: React.ReactNode[] = [];
        let lastIndex = 0;
        const globalRegex = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g');
        let match: RegExpExecArray | null;
        let safety = 0;
        while ((match = globalRegex.exec(text)) !== null && safety < 100) {
            safety++;
            if (match.index > lastIndex) {
                parts.push(text.substring(lastIndex, match.index));
            }
            parts.push(
                <span
                    key={`${match.index}-${safety}`}
                    style={{ color: theme.accent || theme.palette[0] }}
                    className="font-bold underline decoration-2 bg-yellow-400/20 px-0.5 rounded"
                >
                    {match[0]}
                </span>
            );
            lastIndex = globalRegex.lastIndex;
            if (match[0].length === 0) {
                globalRegex.lastIndex++;
            }
        }
        if (lastIndex < text.length) {
            parts.push(text.substring(lastIndex));
        }
        return <>{parts.length > 0 ? parts : text}</>;
    } catch (e) {
        return <span>{text}</span>;
    }
};

interface CategoryResultShellProps {
    isAllSelected: boolean;
    isExpanded: boolean;
    onToggle: () => void;
    isEn: boolean;
    isFromQuran: boolean;
    themeStyles: GlobalSearchThemeStyles;
    s3d: any;
    icon: React.ReactNode;
    flatIcon: React.ReactNode;
    allTitle: string;
    flatTitle: string;
    badgeLabel: string | number;
    children: React.ReactNode;
    topMargin?: boolean;
}

export const CategoryResultShell: React.FC<CategoryResultShellProps> = ({
    isAllSelected,
    isExpanded,
    onToggle,
    isEn,
    isFromQuran,
    themeStyles,
    s3d,
    icon,
    flatIcon,
    allTitle,
    flatTitle,
    badgeLabel,
    children,
    topMargin = true,
}) => {
    const {
        theme,
        card3DClass,
        btn3DClass,
        inner3DClass,
        icon3DClass,
        badge3DStyle,
        headerCardStyle,
        sectionIconStyle,
    } = themeStyles;

    return (
        <div className={`space-y-3 ${topMargin ? 'mt-4' : ''}`}>
            {isAllSelected ? (
                <div className={`mb-3 rounded-2xl ${card3DClass} overflow-hidden border-0`} style={headerCardStyle('rgba(255,255,255,0.03)')}>
                    <button
                        onClick={onToggle}
                        className={`w-full flex justify-between items-center p-4 transition-all ${btn3DClass} border-0 rounded-2xl cursor-pointer`}
                        style={headerCardStyle('rgba(255,255,255,0.06)')}
                    >
                        <h4 className="font-bold text-base flex items-center gap-2.5" style={{ color: isFromQuran ? (theme.accent || theme.palette[0]) : s3d.noticeAccent }}>
                            {icon}
                            {allTitle}
                        </h4>
                        <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${inner3DClass} border-0`} style={badge3DStyle}>
                                {badgeLabel}
                            </span>
                            <ChevronLeft className={`w-5 h-5 transition-transform ${icon3DClass} ${isExpanded ? (isEn ? 'rotate-90' : '-rotate-90') : (isEn ? 'rotate-180' : '')}`} />
                        </div>
                    </button>
                    {isExpanded && (
                        <div className="p-3 space-y-2.5" style={{ backgroundColor: theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.015)' }}>
                            {children}
                        </div>
                    )}
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-2.5 mb-2 px-1">
                        <span className={`p-2 rounded-xl ${inner3DClass} border-0`} style={sectionIconStyle}>
                            {flatIcon}
                        </span>
                        <h3 className="font-bold text-sm opacity-90" style={{ color: theme.textColor }}>
                            {flatTitle}
                        </h3>
                    </div>
                    {children}
                </>
            )}
        </div>
    );
};
