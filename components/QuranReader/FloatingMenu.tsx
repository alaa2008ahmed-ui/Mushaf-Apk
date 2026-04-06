import React, { useState, useEffect } from 'react';
import { Monitor, Smartphone, ChevronDown, List, Search, Brain, Calendar, BookOpen, Book, FileText, Headphones, Languages, Clock, Sun, Compass, Mic, Bookmark, BookText, Settings, Palette, Plus, Save, X, Heart, Calculator, Info, HelpCircle, Download, Type } from 'lucide-react';
import { THEMES, DEFAULT_SETTINGS, READERS, MEMORIZATION_READERS } from './constants';

interface FloatingMenuProps {
    isFloatingMenuOpen: boolean;
    floatingMenuRef: React.RefObject<HTMLDivElement>;
    openModal: (modalId: string, params?: any) => void;
    setIsFloatingMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
    getToolbarStyle: (id: string, bg: string, text: string, border: string) => React.CSSProperties;
    currentTheme: any;
    isLandscape: boolean;
    onNavigate: (pageId: string) => void;
    readingMode: 'mushaf' | 'tafseer' | 'meanings' | 'translation';
    setReadingMode: (mode: 'mushaf' | 'tafseer' | 'meanings' | 'translation') => void;
    useTajweed: boolean;
    handleMushafTypeSelect: (type: 'uthmani' | 'tajweed') => void;
    showToast: (msg: string) => void;
    isWirdMode?: boolean;
    isMemorizationMode?: boolean;
    settings: any;
    updateSetting: (key: string, value: any) => void;
    isHideToolbarsEnabled: boolean;
    setIsHideToolbarsEnabled: (value: boolean) => void;
    isTransparentMode: boolean;
    setIsTransparentMode: (value: boolean) => void;
    isPractical?: boolean;
}

const ALL_SHORTCUTS = [
    { id: 'quran-download-parent', label: 'تحميل القرآن', icon: <Download size={18} /> },
    { id: 'tafseer-download', label: 'تحميل التفسير', icon: <Download size={18} /> },
    { id: 'interface-customization', label: 'تخصيص الواجهة', icon: <Palette size={18} /> },
    { id: 'font-type', label: 'نوع الخط', icon: <Type size={18} /> },
];

const DEFAULT_SHORTCUTS = ['quran-download-parent', 'tafseer-download', 'interface-customization', 'font-type'];

const FloatingMenu: React.FC<FloatingMenuProps> = ({
    isFloatingMenuOpen,
    floatingMenuRef,
    openModal,
    setIsFloatingMenuOpen,
    getToolbarStyle,
    currentTheme,
    isLandscape,
    onNavigate,
    readingMode,
    setReadingMode,
    useTajweed,
    handleMushafTypeSelect,
    showToast,
    isWirdMode = false,
    isMemorizationMode = false,
    settings,
    updateSetting,
    isHideToolbarsEnabled,
    setIsHideToolbarsEnabled,
    isTransparentMode,
    setIsTransparentMode,
    isPractical = false
}) => {
    const [selectedShortcuts, setSelectedShortcuts] = useState<string[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [tempShortcuts, setTempShortcuts] = useState<string[]>([]);
    const [isThemesOpen, setIsThemesOpen] = useState(false);
    const [isDownloadSubMenuOpen, setIsDownloadSubMenuOpen] = useState(false);

    useEffect(() => {
        if (isFloatingMenuOpen) {
            setIsThemesOpen(false);
            setIsDownloadSubMenuOpen(false);
        }
    }, [isFloatingMenuOpen]);

    useEffect(() => {
        const saved = localStorage.getItem('quran_menu_shortcuts');
        if (saved) {
            const parsed = JSON.parse(saved);
            const validShortcuts = parsed.filter((id: string) => ALL_SHORTCUTS.some(s => s.id === id));
            
            // If all saved shortcuts were removed or if we want to ensure the new ones are there
            if (validShortcuts.length === 0) {
                setSelectedShortcuts(DEFAULT_SHORTCUTS);
                localStorage.setItem('quran_menu_shortcuts', JSON.stringify(DEFAULT_SHORTCUTS));
            } else {
                setSelectedShortcuts(validShortcuts);
            }
        } else {
            setSelectedShortcuts(DEFAULT_SHORTCUTS);
        }
    }, []);

    const handleAction = (action: () => void) => {
        action();
        setIsFloatingMenuOpen(false);
    };

    const saveShortcuts = () => {
        setSelectedShortcuts(tempShortcuts);
        localStorage.setItem('quran_menu_shortcuts', JSON.stringify(tempShortcuts));
        setIsAddModalOpen(false);
    };

    const iconColor = currentTheme.accent || '#000000';

    const applyTheme = (themeId: string) => {
        const theme = THEMES[themeId as keyof typeof THEMES];
        if (!theme) return;

        const modeSuffix = isMemorizationMode 
            ? `_memorization_${isLandscape ? 'h' : 'v'}` 
            : isWirdMode 
                ? `_wird_${isLandscape ? 'h' : 'v'}` 
                : readingMode === 'mushaf' 
                    ? (isLandscape ? '_h' : '_v') 
                    : `_${readingMode}_${isLandscape ? 'h' : 'v'}`;
        
        localStorage.setItem('current_theme_id' + modeSuffix, themeId);
        
        const themeColors = { 
            'top-toolbar': { bg: theme.barBg, border: theme.barBorder }, 
            'bottom-toolbar': { bg: theme.barBg, border: theme.barBorder }, 
            'surah': { bg: theme.btnBg, text: theme.btnText, border: theme.barBorder, font: theme.font }, 
            'juz': { bg: theme.btnBg, text: theme.btnText, border: theme.barBorder, font: theme.font }, 
            'page': { bg: theme.btnBg, text: theme.btnText, border: theme.barBorder, font: theme.font }, 
            'audio': { bg: theme.btnBg, text: theme.btnText, border: theme.barBorder }, 
            'btn-settings': { bg: theme.btnBg, text: theme.btnText, border: theme.barBorder }, 
            'btn-home': { bg: theme.btnBg, text: theme.btnText, border: theme.barBorder }, 
            'btn-bookmark': { bg: theme.btnBg, text: theme.btnText, border: theme.barBorder }, 
            'btn-bookmarks-list': { bg: theme.btnBg, text: theme.btnText, border: theme.barBorder }, 
            'btn-themes': { bg: theme.btnBg, text: theme.btnText, border: theme.barBorder }, 
            'btn-autoscroll': { bg: theme.btnBg, text: theme.btnText, border: theme.barBorder }, 
            'btn-menu': { bg: theme.btnBg, text: theme.btnText, border: theme.barBorder }, 
            'btn-search': { bg: theme.btnBg, text: theme.btnText, border: theme.barBorder },
            'btn-share': { bg: theme.btnBg, text: theme.btnText, border: theme.barBorder }
        };

        localStorage.setItem('toolbar_colors_v2' + modeSuffix, JSON.stringify(themeColors));

        const savedSettings = JSON.parse(localStorage.getItem('quran_settings' + modeSuffix) || '{}');
        const baseSettings = { ...DEFAULT_SETTINGS, ...savedSettings };
        const updatedSettings = {
            ...baseSettings,
            bgColor: theme.bg || "#ffffff",
            textColor: theme.text || "#000000",
            fontFamily: theme.font,
            ...(baseSettings.lockHighlightColor ? {} : { highlightTextColor: theme.highlightText || theme.accent }),
            theme: themeId
        };
        localStorage.setItem('quran_settings' + modeSuffix, JSON.stringify(updatedSettings));

        window.dispatchEvent(new Event('theme-change'));
        showToast(`تم تطبيق ثيم: ${theme.name}`);
    };

    return (
        <div 
            ref={floatingMenuRef}
            className={`fixed top-[calc(3.5rem+var(--logical-safe-top))] bottom-[calc(3.5rem+var(--logical-safe-bottom))] right-4 z-[1000] flex items-start gap-4 pointer-events-none`}
            dir="rtl"
        >
            {/* The Main Menu Container */}
            <div 
                id="floating-menu" 
                className={`w-[260px] max-w-[85vw] bg-white rounded-2xl shadow-2xl transition-all duration-300 origin-top-right flex flex-col pointer-events-auto h-full ${isFloatingMenuOpen ? 'opacity-100 visible scale-100 translate-y-0' : 'opacity-0 invisible scale-95 -translate-y-4'}`} 
                style={{ fontFamily: currentTheme.font }}
            >
                {!isAddModalOpen ? (
                    /* Main Menu Content */
                    <div className="p-4 flex flex-col gap-4 overflow-y-auto flex-grow custom-scrollbar">
                        {/* نوع المصحف */}
                        {!isPractical && (
                            <MenuSection title="نوع المصحف" iconColor={iconColor} titleColor="#2563eb">
                                <div className="flex flex-col gap-1 mb-2">
                                    <button 
                                        className={`w-full py-2.5 px-4 rounded-xl text-sm flex items-center justify-between transition-all ${!useTajweed ? 'bg-gray-100 font-bold' : 'hover:bg-gray-50'}`} 
                                        onClick={() => handleAction(() => { setReadingMode('mushaf'); handleMushafTypeSelect('uthmani'); })} 
                                        style={{ color: !useTajweed ? '#000000' : '#4b5563' }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <BookText size={18} style={{ color: iconColor }} />
                                            <span className="whitespace-nowrap font-bold">العثماني</span>
                                        </div>
                                        {!useTajweed && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: iconColor }}></div>}
                                    </button>
                                    <button 
                                        className={`w-full py-2.5 px-4 rounded-xl text-sm flex items-center justify-between transition-all ${useTajweed ? 'bg-gray-100 font-bold' : 'hover:bg-gray-50'}`} 
                                        onClick={() => handleAction(() => { setReadingMode('mushaf'); handleMushafTypeSelect('tajweed'); })} 
                                        style={{ color: useTajweed ? '#000000' : '#4b5563' }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <BookOpen size={18} style={{ color: iconColor }} />
                                            <span className="whitespace-nowrap font-bold">التجويد</span>
                                        </div>
                                        {useTajweed && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: iconColor }}></div>}
                                    </button>
                                </div>
                                <MenuItem icon={<Book size={18} />} label="التفسير" onClick={() => handleAction(() => setReadingMode('tafseer'))} iconColor={iconColor} />
                                <MenuItem icon={<FileText size={18} />} label="المعاني" onClick={() => handleAction(() => setReadingMode('meanings'))} iconColor={iconColor} />
                                <MenuItem icon={<Languages size={18} />} label="الترجمة" onClick={() => handleAction(() => setReadingMode('translation'))} iconColor={iconColor} />
                                <MenuItem icon={<Headphones size={18} />} label="الصوتيات" onClick={() => handleAction(() => openModal('reciter-modal'))} iconColor={iconColor} />
                            </MenuSection>
                        )}

                        {isPractical && (
                            <MenuSection title="وضع التطبيق العملي" iconColor={iconColor} titleColor="#2563eb">
                                <div className="bg-blue-50 p-3 rounded-xl mb-2">
                                    <p className="text-xs text-blue-800 leading-relaxed">
                                        أنت الآن في وضع التطبيق العملي للمصحف المجود.
                                    </p>
                                </div>
                                <MenuItem icon={<Book size={18} />} label="التفسير" onClick={() => handleAction(() => setReadingMode('tafseer'))} iconColor={iconColor} />
                                <MenuItem icon={<FileText size={18} />} label="المعاني" onClick={() => handleAction(() => setReadingMode('meanings'))} iconColor={iconColor} />
                                <MenuItem icon={<Languages size={18} />} label="الترجمة" onClick={() => handleAction(() => setReadingMode('translation'))} iconColor={iconColor} />
                                <MenuItem icon={<Headphones size={18} />} label="الصوتيات" onClick={() => handleAction(() => openModal('reciter-modal'))} iconColor={iconColor} />
                            </MenuSection>
                        )}

                        {/* الإعدادات والبحث */}
                        <MenuSection title="الإعدادات والبحث" iconColor={iconColor} titleColor="#16a34a">
                            <MenuItem icon={<Search size={18} />} label="البحث" onClick={() => handleAction(() => openModal('search-modal'))} iconColor={iconColor} />
                            <MenuItem icon={<Settings size={18} />} label="الإعدادات" onClick={() => handleAction(() => openModal('settings-modal'))} iconColor={iconColor} />
                            <MenuItem icon={<Bookmark size={18} />} label="العلامات المرجعية" onClick={() => handleAction(() => openModal('bookmarks-modal'))} iconColor={iconColor} />
                            <div className="flex flex-col">
                                <button 
                                    onClick={() => setIsThemesOpen(!isThemesOpen)} 
                                    className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors text-right w-full"
                                >
                                    <div style={{ color: iconColor }}><Palette size={18} /></div>
                                    <span className="text-sm font-bold flex-1" style={{ color: '#000000' }}>المظهر</span>
                                    <ChevronDown size={16} className={`transition-transform duration-200 ${isThemesOpen ? 'rotate-180' : ''}`} style={{ color: iconColor }} />
                                </button>
                                
                                {isThemesOpen && (
                                    <div className="flex flex-col gap-3 p-3 bg-gray-50/80 rounded-xl mt-1 mb-2 animate-fadeIn">
                                        <div className="border-b border-gray-200 pb-3 mb-1 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-bold opacity-80" style={{ color: '#000000' }}>قفل لون التحديد</label>
                                                <div className="relative inline-block w-8 align-middle select-none">
                                                    <input 
                                                        type="checkbox" 
                                                        id="menu-lock-highlight" 
                                                        checked={settings?.lockHighlightColor || false} 
                                                        onChange={(e) => updateSetting('lockHighlightColor', e.target.checked)} 
                                                        className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-2 appearance-none cursor-pointer"
                                                    />
                                                    <label htmlFor="menu-lock-highlight" className={`toggle-label block overflow-hidden h-4 rounded-full cursor-pointer ${settings?.lockHighlightColor ? 'bg-emerald-500' : 'bg-gray-300'}`}></label>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-bold opacity-80" style={{ color: '#000000' }}>إخفاء الأشرطة</label>
                                                <div className="relative inline-block w-8 align-middle select-none">
                                                    <input 
                                                        type="checkbox" 
                                                        id="menu-hide-toolbars" 
                                                        checked={isTransparentMode} 
                                                        onChange={(e) => {
                                                            setIsTransparentMode(e.target.checked);
                                                            const modeSuffix = readingMode === 'mushaf' ? (isLandscape ? '_h' : '_v') : `_${readingMode}_${isLandscape ? 'h' : 'v'}`;
                                                            localStorage.setItem('transparent_mode' + modeSuffix, String(e.target.checked));
                                                            window.dispatchEvent(new Event('settings-change'));
                                                            showToast(e.target.checked ? 'تم تفعيل إخفاء الأشرطة' : 'تم تعطيل إخفاء الأشرطة');
                                                        }} 
                                                        className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-2 appearance-none cursor-pointer"
                                                    />
                                                    <label htmlFor="menu-hide-toolbars" className={`toggle-label block overflow-hidden h-4 rounded-full cursor-pointer ${isTransparentMode ? 'bg-emerald-500' : 'bg-gray-300'}`}></label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-y-4 gap-x-2">
                                            {Object.entries(THEMES).map(([id, theme]: [string, any]) => (
                                                <button
                                                    key={id}
                                                    onClick={() => {
                                                        applyTheme(id);
                                                        setIsFloatingMenuOpen(false);
                                                    }}
                                                    className="flex flex-col items-center gap-1.5 group"
                                                >
                                                    <div 
                                                        className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${localStorage.getItem('current_theme_id' + (isMemorizationMode ? `_memorization_${isLandscape ? 'h' : 'v'}` : isWirdMode ? `_wird_${isLandscape ? 'h' : 'v'}` : readingMode === 'mushaf' ? (isLandscape ? '_h' : '_v') : `_${readingMode}_${isLandscape ? 'h' : 'v'}`)) === id ? 'scale-110 border-gray-400 shadow-md' : 'border-transparent hover:scale-105'}`}
                                                        style={{ backgroundColor: theme.accent || theme.barText || '#000000' }}
                                                    >
                                                        {localStorage.getItem('current_theme_id' + (isMemorizationMode ? `_memorization_${isLandscape ? 'h' : 'v'}` : isWirdMode ? `_wird_${isLandscape ? 'h' : 'v'}` : readingMode === 'mushaf' ? (isLandscape ? '_h' : '_v') : `_${readingMode}_${isLandscape ? 'h' : 'v'}`)) === id && (
                                                            <div className="w-2 h-2 rounded-full bg-white shadow-sm"></div>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] font-bold opacity-80 truncate w-full text-center leading-tight" style={{ color: '#000000' }}>{theme.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </MenuSection>

                        {/* اختصارات أخرى */}
                        <MenuSection title="اختصارات أخرى" iconColor={iconColor} titleColor="#d97706">
                            {ALL_SHORTCUTS.filter(s => selectedShortcuts.includes(s.id)).map(shortcut => (
                                <React.Fragment key={shortcut.id}>
                                    <MenuItem 
                                        icon={shortcut.icon} 
                                        label={shortcut.label} 
                                        onClick={() => {
                                            if (shortcut.id === 'quran-download-parent') {
                                                setIsDownloadSubMenuOpen(!isDownloadSubMenuOpen);
                                            } else {
                                                handleAction(() => {
                                                    if (shortcut.id === 'tafseer-download') {
                                                        openModal('tafsir-download-modal');
                                                    } else if (shortcut.id === 'interface-customization') {
                                                        openModal('toolbar-color-picker-modal');
                                                    } else if (shortcut.id === 'font-type') {
                                                        openModal('font-modal');
                                                    } else {
                                                        onNavigate(shortcut.id);
                                                    }
                                                });
                                            }
                                        }} 
                                        iconColor={iconColor} 
                                        showChevron={shortcut.id === 'quran-download-parent'}
                                        isExpanded={shortcut.id === 'quran-download-parent' && isDownloadSubMenuOpen}
                                    />
                                    {shortcut.id === 'quran-download-parent' && isDownloadSubMenuOpen && (
                                        <div className="flex flex-col gap-1 p-2 bg-gray-50/80 rounded-xl mt-1 mb-2 animate-fadeIn">
                                            <MenuItem 
                                                icon={<Download size={16} />} 
                                                label="تحميل المصحف" 
                                                onClick={() => handleAction(() => openModal('quran-download-modal'))} 
                                                iconColor={iconColor} 
                                                isSubItem
                                            />
                                            <MenuItem 
                                                icon={<Headphones size={16} />} 
                                                label="تحميل الاستماع" 
                                                onClick={() => handleAction(() => openModal('quran-download-modal', { readersList: READERS, mode: 'surah' }))} 
                                                iconColor={iconColor} 
                                                isSubItem
                                            />
                                            <MenuItem 
                                                icon={<Brain size={16} />} 
                                                label="تحميل التحفيظ" 
                                                onClick={() => handleAction(() => openModal('quran-download-modal', { readersList: MEMORIZATION_READERS, mode: 'ayah' }))} 
                                                iconColor={iconColor} 
                                                isSubItem
                                            />
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}
                        </MenuSection>
                    </div>
                ) : (
                    /* Customization Content (Replacing Main Menu) */
                    <div className="flex flex-col h-full overflow-hidden">
                        <div className="p-4 border-b flex items-center justify-between bg-gray-50/50">
                            <div className="flex items-center gap-2">
                                <Plus size={20} style={{ color: '#000000' }} />
                                <h3 className="font-bold text-sm" style={{ color: '#000000' }}>تخصيص الاختصارات</h3>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
                                <X size={18} />
                            </button>
                        </div>
                        
                        <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
                            <div className="flex flex-col gap-1">
                                {ALL_SHORTCUTS.map(shortcut => {
                                    const isSelected = tempShortcuts.includes(shortcut.id);
                                    return (
                                        <button 
                                            key={shortcut.id}
                                            onClick={() => {
                                                if (isSelected) {
                                                    setTempShortcuts(tempShortcuts.filter(id => id !== shortcut.id));
                                                } else {
                                                    setTempShortcuts([...tempShortcuts, shortcut.id]);
                                                }
                                            }}
                                            className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors text-right w-full group"
                                        >
                                            <div style={{ color: isSelected ? '#000000' : '#9ca3af' }} className="transition-colors">
                                                {shortcut.icon}
                                            </div>
                                            <span className={`text-sm flex-1 transition-all ${isSelected ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>
                                                {shortcut.label}
                                            </span>
                                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-black border-black text-white' : 'border-gray-300 group-hover:border-gray-400'}`}>
                                                {isSelected && <Save size={12} />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="p-3 border-t bg-gray-50/80 flex gap-2">
                            <button 
                                onClick={saveShortcuts}
                                className="flex-1 text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
                                style={{ backgroundColor: iconColor }}
                            >
                                <Save size={16} />
                                حفظ
                            </button>
                            <button 
                                onClick={() => setIsAddModalOpen(false)}
                                className="px-4 py-2.5 bg-gray-200 text-gray-600 rounded-xl font-bold text-sm active:scale-95 transition-all"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const MenuSection: React.FC<{ title: string, children: React.ReactNode, iconColor: string, titleColor?: string }> = ({ title, children, iconColor, titleColor = '#000000' }) => (
    <div className="flex flex-col">
        <div className="bg-blue-50/50 py-1.5 px-3 rounded-md mb-2 text-right">
            <span className="text-xs font-bold" style={{ color: titleColor }}>{title}</span>
        </div>
        <div className="flex flex-col px-2">
            {children}
        </div>
    </div>
);

const MenuItem: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void, iconColor: string, showChevron?: boolean, isExpanded?: boolean, isSubItem?: boolean }> = ({ icon, label, onClick, iconColor, showChevron, isExpanded, isSubItem }) => (
    <button onClick={onClick} className={`flex items-center gap-3 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors text-right w-full ${isSubItem ? 'px-2 py-2 border-0' : ''}`}>
        <div style={{ color: iconColor }}>{icon}</div>
        <span className={`${isSubItem ? 'text-xs' : 'text-sm'} font-bold flex-1`} style={{ color: '#000000' }}>{label}</span>
        {showChevron && (
            <ChevronDown size={16} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} style={{ color: iconColor }} />
        )}
    </button>
);

export default FloatingMenu;
