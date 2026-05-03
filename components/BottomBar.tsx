
import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Lock, Unlock } from 'lucide-react';

interface BottomBarProps {
    onHomeClick: () => void;
    onThemesClick: () => void;
    showHome?: boolean;
    showThemes?: boolean;
    homeLabel?: string;
    leftButton?: React.ReactNode;
    rightButton?: React.ReactNode;
}

function BottomBar({ onHomeClick, onThemesClick, showHome = true, showThemes = true, homeLabel = "الرئيسية", leftButton, rightButton }: BottomBarProps) {
    const { theme, themeKey, isPageLocked, togglePageLock, isQuranPage } = useTheme();

    const isSingleButton = !showHome || !showThemes;
    const homeButtonClass = `bar-button btn-3d-effect ${isSingleButton ? 'w-full max-w-[160px] mx-auto py-2.5 px-4 rounded-xl shadow-lg' : 'max-w-[120px]'}`;
    const themesButtonClass = `bar-button btn-3d-effect ${isSingleButton ? 'w-full max-w-[160px] mx-auto py-2.5 px-4 rounded-xl shadow-lg' : 'max-w-[120px]'}`;

    // Fix for border style conflict - parse the border string if it exists
    const parseBorder = (borderStr: string | undefined) => {
        if (!borderStr || borderStr === 'none') return { borderWidth: 0, borderStyle: 'none' as const, borderColor: 'transparent' };
        const parts = borderStr.split(' ');
        return {
            borderWidth: parts[0] || '1px',
            borderStyle: (parts[1] || 'solid') as any,
            borderColor: parts[2] || theme.palette[0]
        };
    };

    const navBorder = parseBorder(theme.barBorder);
    const homeBtnBorder = parseBorder(theme.btnBorder);
    const themesBtnBorder = parseBorder(theme.btnBorder);

    return (
        <nav className="app-bottom-bar" style={{ 
            borderTopWidth: theme.barBorder ? navBorder.borderWidth : '2px',
            borderTopStyle: theme.barBorder ? navBorder.borderStyle : 'solid',
            borderTopColor: theme.barBorder ? navBorder.borderColor : theme.palette[0],
            fontFamily: theme.font 
        }}>
            <div className="app-bottom-bar__inner">
                {/* Home Section */}
                <div className="flex items-center gap-2">
                    {showHome && (
                        <button 
                            onClick={onHomeClick} 
                            className={homeButtonClass}
                            style={{ 
                                background: themeKey === 'olive_grove' ? '#4D7C0F' : theme.palette[0], 
                                color: 'white', 
                                fontFamily: theme.font, 
                                borderWidth: homeBtnBorder.borderWidth,
                                borderStyle: homeBtnBorder.borderStyle,
                                borderColor: homeBtnBorder.borderColor
                            }}
                        >
                            <span className="text-xl">🏠</span>
                            <span className="hidden sm:inline">{homeLabel}</span>
                        </button>
                    )}
                </div>
                
                {leftButton && <div className="mx-1">{leftButton}</div>}
                
                {showThemes && (
                    <button 
                        id="themes-btn"
                        onClick={onThemesClick} 
                        className={themesButtonClass}
                        style={{ 
                            background: themeKey === 'olive_grove' ? '#65A30D' : theme.palette[1], 
                            color: 'white', 
                            fontFamily: theme.font, 
                            borderWidth: themesBtnBorder.borderWidth,
                            borderStyle: themesBtnBorder.borderStyle,
                            borderColor: themesBtnBorder.borderColor
                        }}
                        data-id="theme-toggle-button"
                    >
                         <span className="text-xl">🎨</span>
                        <span>الثيمات</span>
                    </button>
                )}
                
                {rightButton && <div className="mx-1">{rightButton}</div>}
            </div>
        </nav>
    );
}

export default BottomBar;