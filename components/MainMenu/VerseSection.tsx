import React, { useRef } from 'react';

interface VerseSectionProps {
    currentVerse: { text: string; surah: string; number: string | number };
    verseFontSize: number;
    setVerseFontSize: (size: number) => void;
    setIsCustomizationOpen: (isOpen: boolean) => void;
    theme: any;
    themeKey: string;
    verseSettings: {
        fontFamily: string;
        bgColor: string;
        textColor: string;
    };
}

const VerseSection: React.FC<VerseSectionProps> = ({
    currentVerse,
    verseFontSize,
    setVerseFontSize,
    setIsCustomizationOpen,
    theme,
    themeKey,
    verseSettings
}) => {
    const initialDistanceRef = useRef<number | null>(null);
    const initialFontSizeRef = useRef<number>(1.25);

    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
            initialDistanceRef.current = dist;
            initialFontSizeRef.current = verseFontSize;
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length === 2 && initialDistanceRef.current !== null) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
            
            const scale = dist / initialDistanceRef.current;
            let newSize = initialFontSizeRef.current * scale;
            
            newSize = Math.max(0.8, Math.min(newSize, 3.0));
            setVerseFontSize(newSize);
        }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (e.touches.length < 2) {
            if (initialDistanceRef.current !== null) {
                localStorage.setItem('mainMenuVerseFontSize', verseFontSize.toString());
                initialDistanceRef.current = null;
            }
        }
    };

    return (
        <div 
            className="text-center pt-12 select-none touch-manipulation mx-4 p-4 rounded-3xl"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
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
