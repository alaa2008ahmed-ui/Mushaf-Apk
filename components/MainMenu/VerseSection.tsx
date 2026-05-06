import React, { useRef } from 'react';

interface VerseSectionProps {
    currentVerse: { text: string; surah: string; number: string | number };
    verseFontSize: number;
    theme: any;
    verseSettings: {
        fontFamily: string;
        bgColor: string;
        textColor: string;
    };
}

const VerseSection: React.FC<VerseSectionProps> = ({
    currentVerse,
    verseFontSize,
    theme,
    verseSettings
}) => {
    return (
        <div 
            className="text-center select-none touch-manipulation mx-4 p-2 pt-6 rounded-3xl"
            dir="rtl"
            style={{ 
                userSelect: 'none', 
                WebkitUserSelect: 'none',
                backgroundColor: verseSettings.bgColor,
                fontFamily: verseSettings.fontFamily
            }}
        >
            <p className="font-bold leading-tight mb-1 pointer-events-none transition-all duration-75" style={{ color: verseSettings.textColor === theme.textColor && theme.textColor === '#000000' ? theme.palette[0] : verseSettings.textColor, fontSize: `${verseFontSize}rem` }}>
                {currentVerse.text}
            </p>
            <p className="text-[12px] font-bold text-left pl-8 pointer-events-none transition-all duration-75 opacity-70" style={{ color: verseSettings.textColor === theme.textColor && theme.textColor === '#000000' ? theme.palette[1] : verseSettings.textColor, fontSize: `${Math.max(0.75, verseFontSize * 0.6)}rem` }}>
                {`(${currentVerse.surah}: ${currentVerse.number})`}
            </p>
        </div>
    );
};

export default VerseSection;
