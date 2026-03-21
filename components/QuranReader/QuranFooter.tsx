import React from 'react';

interface QuranFooterProps {
    currentTheme: any;
    getToolbarStyle: (id: string, bg: string, text: string, border: string) => React.CSSProperties;
    setIsFloatingMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
    menuButtonRef: React.RefObject<HTMLButtonElement>;
    handleBookmarkButtonPointerDown: (e: React.PointerEvent | React.TouchEvent) => void;
    handleBookmarkButtonPointerUp: (e: React.PointerEvent | React.TouchEvent) => void;
    handleBookmarkButtonPointerLeave: () => void;
    handleAutoScrollButtonPointerDown: (e: React.PointerEvent | React.TouchEvent) => void;
    handleAutoScrollButtonPointerUp: (e: React.PointerEvent | React.TouchEvent) => void;
    handleAutoScrollButtonPointerLeave: () => void;
    autoScrollState: { isActive: boolean; isPaused: boolean; elapsedTime: number };
    onBack: () => void;
}

const QuranFooter: React.FC<QuranFooterProps> = ({
    currentTheme,
    getToolbarStyle,
    setIsFloatingMenuOpen,
    menuButtonRef,
    handleBookmarkButtonPointerDown,
    handleBookmarkButtonPointerUp,
    handleBookmarkButtonPointerLeave,
    handleAutoScrollButtonPointerDown,
    handleAutoScrollButtonPointerUp,
    handleAutoScrollButtonPointerLeave,
    autoScrollState,
    onBack
}) => {
    return (
        <footer id="bottom-bar" className={`footer-default flex-none border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 flex justify-around items-center px-1 py-1 w-full`} style={getToolbarStyle('bottom-toolbar', currentTheme.barBg, currentTheme.barText, currentTheme.barBorder)}>
            <button ref={menuButtonRef} id="btn-menu" onClick={() => setIsFloatingMenuOpen(p => !p)} className="bottom-bar-button btn-purple flex-1 mx-1" style={getToolbarStyle('btn-menu', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBg)}><i className="fa-solid fa-grip-vertical text-indigo-500"></i><span className="hidden sm:inline">القائمة</span></button>
            <button 
                id="btn-bookmark" 
                onPointerDown={handleBookmarkButtonPointerDown}
                onPointerUp={handleBookmarkButtonPointerUp}
                onPointerLeave={handleBookmarkButtonPointerLeave}
                onTouchStart={handleBookmarkButtonPointerDown}
                onTouchEnd={handleBookmarkButtonPointerUp}
                onTouchCancel={handleBookmarkButtonPointerLeave}
                className="bottom-bar-button btn-green flex-1 mx-1" 
                style={{...getToolbarStyle('btn-bookmark', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBg), touchAction: 'none'}}
            >
                <i className="fa-solid fa-star text-yellow-500"></i>
                <span className="hidden sm:inline">حفظ</span>
            </button>
            <button 
                id="btn-autoscroll" 
                onPointerDown={handleAutoScrollButtonPointerDown}
                onPointerUp={handleAutoScrollButtonPointerUp}
                onPointerLeave={handleAutoScrollButtonPointerLeave}
                onTouchStart={handleAutoScrollButtonPointerDown}
                onTouchEnd={handleAutoScrollButtonPointerUp}
                onTouchCancel={handleAutoScrollButtonPointerLeave}
                className="bottom-bar-button btn-purple flex-1 mx-1" 
                style={{...getToolbarStyle('btn-autoscroll', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBg), touchAction: 'none'}}
            >
                {autoScrollState.isActive ? <i className="fa-solid fa-circle-pause text-red-500 icon-autoscroll-active"></i> : <i className="fa-solid fa-angles-down text-blue-500"></i>}
                <span className="hidden sm:inline">{autoScrollState.isActive ? "إيقاف" : "تمرير"}</span>
            </button>
            <button 
                id="btn-home" 
                onClick={onBack} 
                className="bottom-bar-button btn-green flex-1 mx-1" 
                style={getToolbarStyle('btn-home', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBg)}
            >
                <i className="fa-solid fa-house text-red-500"></i>
                <span className="hidden sm:inline">الرئيسية</span>
            </button>
        </footer>
    );
};

export default QuranFooter;
