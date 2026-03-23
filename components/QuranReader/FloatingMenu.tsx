import React from 'react';
import { Mic, BookMarked, Search, Palette, Settings } from 'lucide-react';

interface FloatingMenuProps {
    isFloatingMenuOpen: boolean;
    floatingMenuRef: React.RefObject<HTMLDivElement>;
    openModal: (modalId: string) => void;
    setIsFloatingMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
    getToolbarStyle: (id: string, bg: string, text: string, border: string) => React.CSSProperties;
    currentTheme: any;
    initialLandscape: boolean;
    onNavigate: (pageId: string) => void;
}

const FloatingMenu: React.FC<FloatingMenuProps> = ({
    isFloatingMenuOpen,
    floatingMenuRef,
    openModal,
    setIsFloatingMenuOpen,
    getToolbarStyle,
    currentTheme,
    initialLandscape,
    onNavigate
}) => {
    return (
        <div id="floating-menu" className={isFloatingMenuOpen ? 'open' : ''} ref={floatingMenuRef}>
            <button onClick={() => { openModal('bookmarks-modal'); setIsFloatingMenuOpen(false); }} className="bottom-bar-button btn-green !rounded-full !w-12 !h-12 !p-0 flex items-center justify-center shadow-lg" style={getToolbarStyle('btn-bookmarks-list', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBg)} title="العلامات المحفوظة">
                <BookMarked size={24} />
            </button>
            {!initialLandscape && (
                <button onClick={() => { openModal('search-modal'); setIsFloatingMenuOpen(false); }} className="bottom-bar-button btn-purple !rounded-full !w-12 !h-12 !p-0 flex items-center justify-center shadow-lg" style={getToolbarStyle('btn-search', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBg)} title="بحث">
                    <Search size={24} />
                </button>
            )}
            <button onClick={() => { openModal('themes-modal'); setIsFloatingMenuOpen(false); }} className="bottom-bar-button btn-green !rounded-full !w-12 !h-12 !p-0 flex items-center justify-center shadow-lg" style={getToolbarStyle('btn-themes', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBg)} title="المظهر">
                <Palette size={24} />
            </button>
            <button onClick={() => { openModal('settings-modal'); setIsFloatingMenuOpen(false); }} className="bottom-bar-button btn-green !rounded-full !w-12 !h-12 !p-0 flex items-center justify-center shadow-lg" style={getToolbarStyle('btn-settings', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBg)} title="الإعدادات">
                <Settings size={24} />
            </button>
        </div>
    );
};

export default FloatingMenu;
