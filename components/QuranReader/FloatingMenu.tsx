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
            <button onClick={() => { openModal('voice-control-modal'); setIsFloatingMenuOpen(false); }} className="bottom-bar-button btn-green !rounded-full !w-12 !h-12 !p-0 flex items-center justify-center shadow-lg" style={getToolbarStyle('btn-voice-control', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBg)} title="التحكم الصوتي"><i className="fa-solid fa-microphone-lines text-indigo-500 text-xl"></i></button>
            <button onClick={() => { onNavigate('tajweed-education'); setIsFloatingMenuOpen(false); }} className="bottom-bar-button btn-green !rounded-full !w-12 !h-12 !p-0 flex items-center justify-center shadow-lg" style={getToolbarStyle('btn-bookmarks-list', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBg)}><i className="fa-solid fa-book-open text-indigo-500 text-xl"></i></button>
            <button onClick={() => { openModal('bookmarks-modal'); setIsFloatingMenuOpen(false); }} className="bottom-bar-button btn-green !rounded-full !w-12 !h-12 !p-0 flex items-center justify-center shadow-lg" style={getToolbarStyle('btn-bookmarks-list', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBg)}><i className="fa-solid fa-bookmark text-indigo-500 text-xl"></i></button>
            {!initialLandscape && (
                <button onClick={() => { openModal('search-modal'); setIsFloatingMenuOpen(false); }} className="bottom-bar-button btn-purple !rounded-full !w-12 !h-12 !p-0 flex items-center justify-center shadow-lg" style={getToolbarStyle('btn-search', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBg)}><i className="fa-solid fa-magnifying-glass text-indigo-500 text-xl"></i></button>
            )}
            <button onClick={() => { openModal('themes-modal'); setIsFloatingMenuOpen(false); }} className="bottom-bar-button btn-green !rounded-full !w-12 !h-12 !p-0 flex items-center justify-center shadow-lg" style={getToolbarStyle('btn-themes', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBg)}><i className="fa-solid fa-palette text-indigo-500 text-xl"></i></button>
            <button onClick={() => { openModal('settings-modal'); setIsFloatingMenuOpen(false); }} className="bottom-bar-button btn-green !rounded-full !w-12 !h-12 !p-0 flex items-center justify-center shadow-lg" style={getToolbarStyle('btn-settings', currentTheme.btnBg, currentTheme.btnText, currentTheme.btnBg)}><i className="fa-solid fa-sliders text-indigo-500 text-xl"></i></button>
        </div>
    );
};

export default FloatingMenu;
