import React from 'react';

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
            <button onClick={() => { onNavigate('tajweed-education'); setIsFloatingMenuOpen(false); }} className="bottom-bar-button btn-green w-full justify-between mb-2" style={getToolbarStyle('btn-bookmarks-list', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBg)}><span>تعليم التجويد</span><i className="fa-solid fa-book-open text-emerald-500"></i></button>
            <button onClick={() => { openModal('bookmarks-modal'); setIsFloatingMenuOpen(false); }} className="bottom-bar-button btn-green w-full justify-between mb-2" style={getToolbarStyle('btn-bookmarks-list', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBg)}><span>قائمة الإشارات</span><i className="fa-solid fa-bookmark text-amber-500"></i></button>
            {!initialLandscape && (
                <button onClick={() => { openModal('search-modal'); setIsFloatingMenuOpen(false); }} className="bottom-bar-button btn-purple w-full justify-between mb-2" style={getToolbarStyle('btn-search', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBg)}><span>البحث</span><i className="fa-solid fa-magnifying-glass text-sky-500"></i></button>
            )}
            <button onClick={() => { openModal('themes-modal'); setIsFloatingMenuOpen(false); }} className="bottom-bar-button btn-green w-full justify-between mb-2" style={getToolbarStyle('btn-themes', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBg)}><span>الثيمات</span><i className="fa-solid fa-palette text-pink-500"></i></button>
            <button onClick={() => { openModal('settings-modal'); setIsFloatingMenuOpen(false); }} className="bottom-bar-button btn-green w-full justify-between" style={getToolbarStyle('btn-settings', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBg)}><span>الإعدادات</span><i className="fa-solid fa-sliders text-slate-500"></i></button>
        </div>
    );
};

export default FloatingMenu;
