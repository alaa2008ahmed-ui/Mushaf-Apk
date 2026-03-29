
import React from 'react';
import { useTheme } from '../context/ThemeContext';

function BottomBar({ onHomeClick, onThemesClick, showHome = true, showThemes = true }) {
    const { theme, themeKey } = useTheme();

    const isSingleButton = !showHome || !showThemes;
    const homeButtonClass = `bar-button btn-3d-effect ${isSingleButton ? 'w-full max-w-[160px] mx-auto py-2.5 px-4 rounded-xl shadow-lg' : 'max-w-[120px]'}`;
    const themesButtonClass = `bar-button btn-3d-effect ${isSingleButton ? 'w-full max-w-[160px] mx-auto py-2.5 px-4 rounded-xl shadow-lg' : 'max-w-[120px]'}`;

    return (
        <nav className="app-bottom-bar">
            <div className="app-bottom-bar__inner">
                {showHome && (
                    <button 
                        onClick={onHomeClick} 
                        className={homeButtonClass}
                        style={{ background: theme.palette[0], color: 'white', fontFamily: theme.font, border: theme.btnBorder || 'none' }}
                    >
                        <span className="text-xl">🏠</span>
                        {!isSingleButton && <span>الرئيسية</span>}
                    </button>
                )}
                {showThemes && (
                    <button 
                        id="themes-btn"
                        onClick={onThemesClick} 
                        className={themesButtonClass}
                        style={{ 
                            background: themeKey === 'default' ? '#10b981' : theme.palette[1], 
                            color: 'white', 
                            fontFamily: theme.font, 
                            border: theme.btnBorder || 'none' 
                        }}
                        data-id="theme-toggle-button"
                    >
                         <span className="text-xl">🎨</span>
                        <span>الثيمات</span>
                    </button>
                )}
            </div>
        </nav>
    );
}

export default BottomBar;