import React from 'react';
import { Menu, Bookmark, ChevronDown, Pause, Home, Share2 } from 'lucide-react';
import FloatingMenu from './FloatingMenu';

interface QuranFooterProps {
    currentTheme: any;
    getToolbarStyle: (id: string, bg: string, text: string, border: string) => React.CSSProperties;
    setIsFloatingMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isFloatingMenuOpen: boolean;
    floatingMenuRef: React.RefObject<HTMLDivElement>;
    openModal: (modalId: string) => void;
    menuButtonRef: React.RefObject<HTMLButtonElement>;
    handleBookmarkButtonPointerDown: (e: React.PointerEvent | React.TouchEvent) => void;
    handleBookmarkButtonPointerUp: (e: React.PointerEvent | React.TouchEvent) => void;
    handleBookmarkButtonPointerLeave: () => void;
    handleAutoScrollButtonPointerDown: (e: React.PointerEvent | React.TouchEvent) => void;
    handleAutoScrollButtonPointerUp: (e: React.PointerEvent | React.TouchEvent) => void;
    handleAutoScrollButtonPointerLeave: () => void;
    autoScrollState: { isActive: boolean; isPaused: boolean; elapsedTime: number };
    onBack: () => void;
    initialLandscape: boolean;
    onNavigate: (pageId: string) => void;
}

const QuranFooter: React.FC<QuranFooterProps> = ({
    currentTheme,
    getToolbarStyle,
    setIsFloatingMenuOpen,
    isFloatingMenuOpen,
    floatingMenuRef,
    openModal,
    menuButtonRef,
    handleBookmarkButtonPointerDown,
    handleBookmarkButtonPointerUp,
    handleBookmarkButtonPointerLeave,
    handleAutoScrollButtonPointerDown,
    handleAutoScrollButtonPointerUp,
    handleAutoScrollButtonPointerLeave,
    autoScrollState,
    onBack,
    initialLandscape,
    onNavigate
}) => {
    return (
        <footer id="bottom-bar" className={`footer-default flex-none border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 flex justify-around items-center px-1 py-1 w-full`} style={getToolbarStyle('bottom-toolbar', currentTheme.barBg, currentTheme.barText, currentTheme.barBorder)}>
            <div className="relative">
                <button ref={menuButtonRef} id="btn-menu" onClick={() => setIsFloatingMenuOpen(p => !p)} className="bottom-bar-button btn-purple !rounded-full !w-12 !h-12 !p-0 flex items-center justify-center mx-1 shadow-sm" style={getToolbarStyle('btn-menu', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBg)} title="القائمة">
                    <Menu size={24} />
                </button>
                <FloatingMenu 
                    isFloatingMenuOpen={isFloatingMenuOpen}
                    floatingMenuRef={floatingMenuRef}
                    openModal={openModal}
                    setIsFloatingMenuOpen={setIsFloatingMenuOpen}
                    getToolbarStyle={getToolbarStyle}
                    currentTheme={currentTheme}
                    initialLandscape={initialLandscape}
                    onNavigate={onNavigate}
                />
            </div>
            <button 
                id="btn-bookmark" 
                onPointerDown={handleBookmarkButtonPointerDown}
                onPointerUp={handleBookmarkButtonPointerUp}
                onPointerLeave={handleBookmarkButtonPointerLeave}
                onTouchStart={handleBookmarkButtonPointerDown}
                onTouchEnd={handleBookmarkButtonPointerUp}
                onTouchCancel={handleBookmarkButtonPointerLeave}
                className="bottom-bar-button btn-green !rounded-full !w-12 !h-12 !p-0 flex items-center justify-center mx-1 shadow-sm" 
                style={{...getToolbarStyle('btn-bookmark', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBg), touchAction: 'none'}}
                title="حفظ العلامة"
            >
                <Bookmark size={24} />
            </button>
            <button 
                id="btn-autoscroll" 
                onPointerDown={handleAutoScrollButtonPointerDown}
                onPointerUp={handleAutoScrollButtonPointerUp}
                onPointerLeave={handleAutoScrollButtonPointerLeave}
                onTouchStart={handleAutoScrollButtonPointerDown}
                onTouchEnd={handleAutoScrollButtonPointerUp}
                onTouchCancel={handleAutoScrollButtonPointerLeave}
                className="bottom-bar-button btn-purple !rounded-full !w-12 !h-12 !p-0 flex items-center justify-center mx-1 shadow-sm" 
                style={{...getToolbarStyle('btn-autoscroll', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBg), touchAction: 'none'}}
                title="التمرير التلقائي"
            >
                {autoScrollState.isActive ? <Pause size={24} /> : <ChevronDown size={24} />}
            </button>
            <button 
                id="btn-share" 
                onClick={() => openModal('share-ayah')} 
                className="bottom-bar-button btn-green !rounded-full !w-12 !h-12 !p-0 flex items-center justify-center mx-1 shadow-sm" 
                style={getToolbarStyle('btn-share', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBg)}
                title="مشاركة"
            >
                <Share2 size={24} />
            </button>
            <button 
                id="btn-home" 
                onClick={onBack} 
                className="bottom-bar-button btn-green !rounded-full !w-12 !h-12 !p-0 flex items-center justify-center mx-1 shadow-sm" 
                style={getToolbarStyle('btn-home', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBg)}
                title="الرئيسية"
            >
                <Home size={24} />
            </button>
        </footer>
    );
};

export default QuranFooter;
