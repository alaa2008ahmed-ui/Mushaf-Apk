import React, { useState, useEffect } from 'react';
import { Monitor, Smartphone, ChevronDown, List, Search, Brain, Calendar, BookOpen, Book, FileText, Headphones, Languages, Clock, Sun, Compass, Mic, Bookmark, BookText, Settings, Palette, Plus, Save, X, Heart, Calculator, Info, HelpCircle, Download } from 'lucide-react';
import { THEMES, DEFAULT_SETTINGS } from './constants';

interface FloatingMenuProps {
    isFloatingMenuOpen: boolean;
    floatingMenuRef: React.RefObject<HTMLDivElement>;
    openModal: (modalId: string) => void;
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
}

const ALL_SHORTCUTS = [
    { id: 'prayer-times', label: 'مواقيت الصلاة', icon: <Clock size={18} /> },
    { id: 'monthly-prayer-times', label: 'مواقيت الصلاة الشهرية', icon: <Calendar size={18} /> },
    { id: 'sabah-masaa', label: 'الأذكار', icon: <Sun size={18} /> },
    { id: 'salah-adhkar', label: 'أذكار الصلاة', icon: <Book size={18} /> },
    { id: 'qibla', label: 'القبلة', icon: <Compass size={18} /> },
    { id: 'adia', label: 'الأدعية', icon: <Heart size={18} /> },
    { id: 'hisn-muslim', label: 'حصن المسلم', icon: <Book size={18} /> },
    { id: 'tasbeeh', label: 'التسبيح', icon: <Smartphone size={18} /> },
    { id: 'calendar', label: 'التقويم الهجري', icon: <Calendar size={18} /> },
    { id: 'listen', label: 'الاستماع', icon: <Headphones size={18} /> },
    { id: 'calculators', label: 'الحسابات', icon: <Calculator size={18} /> },
    { id: 'nawawi', label: 'الأربعون النووية', icon: <FileText size={18} /> },
    { id: 'hajj-umrah', label: 'الحج والعمرة', icon: <Info size={18} /> },
    { id: 'voice-control', label: 'التحكم الصوتي', icon: <Mic size={18} /> },
    { id: 'daily-wird', label: 'الورد اليومي', icon: <Calendar size={18} /> },
    { id: 'memorization', label: 'التحفيظ', icon: <Brain size={18} /> },
    { id: 'tajweed-education', label: 'تعليم التجويد', icon: <BookOpen size={18} /> },
    { id: 'quran-download', label: 'تحميل المصحف', icon: <Download size={18} /> },
];

const DEFAULT_SHORTCUTS = ['prayer-times', 'sabah-masaa', 'qibla', 'adia', 'hisn-muslim'];

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
    setIsHideToolbarsEnabled
}) => {
    const [selectedShortcuts, setSelectedShortcuts] = useState<string[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [tempShortcuts, setTempShortcuts] = useState<string[]>([]);
    const [isThemesOpen, setIsThemesOpen] = useState(false);

    useEffect(() => {
        if (isFloatingMenuOpen) {
            setIsThemesOpen(false);
        }
    }, [isFloatingMenuOpen]);

    useEffect(() => {
        const saved = localStorage.getItem('quran_menu_shortcuts');
        if (saved) {
            setSelectedShortcuts(JSON.parse(saved));
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
        
        const white = "#ffffff";
        const themeColor = themeId === 'default' ? '#000000' : (theme.accent || theme.barText || "#000000");
        
        const themeColors = { 
            'top-toolbar': { bg: white, border: themeColor }, 
            'bottom-toolbar': { bg: white, border: themeColor }, 
            'surah': { bg: white, text: themeColor, border: themeColor, font: theme.font }, 
            'juz': { bg: white, text: themeColor, border: themeColor, font: theme.font }, 
            'page': { bg: white, text: themeColor, border: themeColor, font: theme.font }, 
            'audio': { bg: white, text: themeColor, border: themeColor }, 
            'btn-settings': { bg: white, text: themeColor, border: themeColor }, 
            'btn-home': { bg: white, text: themeColor, border: themeColor }, 
            'btn-bookmark': { bg: white, text: themeColor, border: themeColor }, 
            'btn-bookmarks-list': { bg: white, text: themeColor, border: themeColor }, 
            'btn-themes': { bg: white, text: themeColor, border: themeColor }, 
            'btn-autoscroll': { bg: white, text: themeColor, border: themeColor }, 
            'btn-menu': { bg: white, text: themeColor, border: themeColor }, 
            'btn-search': { bg: white, text: themeColor, border: themeColor },
            'btn-share': { bg: white, text: themeColor, border: themeColor }
        };

        localStorage.setItem('toolbar_colors_v2' + modeSuffix, JSON.stringify(themeColors));

        const savedSettings = JSON.parse(localStorage.getItem('quran_settings' + modeSuffix) || '{}');
        const baseSettings = { ...DEFAULT_SETTINGS, ...savedSettings };
        const updatedSettings = {
            ...baseSettings,
            bgColor: "#ffffff",
            textColor: "#000000",
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
                        <MenuSection title="نوع المصحف" iconColor={iconColor}>
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

                        {/* الإعدادات والبحث */}
                        <MenuSection title="الإعدادات والبحث" iconColor={iconColor}>
                            <MenuItem icon={<Search size={18} />} label="البحث" onClick={() => handleAction(() => openModal('search-modal'))} iconColor={iconColor} />
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
                                                        checked={isHideToolbarsEnabled} 
                                                        onChange={(e) => {
                                                            setIsHideToolbarsEnabled(e.target.checked);
                                                            const modeSuffix = readingMode === 'mushaf' ? (isLandscape ? '_h' : '_v') : `_${readingMode}_${isLandscape ? 'h' : 'v'}`;
                                                            localStorage.setItem('hide_toolbars_enabled' + modeSuffix, String(e.target.checked));
                                                            window.dispatchEvent(new Event('settings-change'));
                                                            showToast(e.target.checked ? 'تم تفعيل إخفاء الأشرطة' : 'تم تعطيل إخفاء الأشرطة');
                                                        }} 
                                                        className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-2 appearance-none cursor-pointer"
                                                    />
                                                    <label htmlFor="menu-hide-toolbars" className={`toggle-label block overflow-hidden h-4 rounded-full cursor-pointer ${isHideToolbarsEnabled ? 'bg-emerald-500' : 'bg-gray-300'}`}></label>
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
                            <MenuItem icon={<Settings size={18} />} label="الإعدادات" onClick={() => handleAction(() => openModal('settings-modal'))} iconColor={iconColor} />
                            <MenuItem icon={<Bookmark size={18} />} label="العلامات المرجعية" onClick={() => handleAction(() => openModal('bookmarks-modal'))} iconColor={iconColor} />
                        </MenuSection>

                        {/* اختصارات أخرى */}
                        <MenuSection title="اختصارات أخرى" iconColor={iconColor}>
                            {ALL_SHORTCUTS.filter(s => selectedShortcuts.includes(s.id)).map(shortcut => (
                                <MenuItem 
                                    key={shortcut.id}
                                    icon={shortcut.icon} 
                                    label={shortcut.label} 
                                    onClick={() => handleAction(() => onNavigate(shortcut.id))} 
                                    iconColor={iconColor} 
                                />
                            ))}
                            <MenuItem 
                                icon={<Plus size={18} />} 
                                label="إضافة" 
                                onClick={() => { setTempShortcuts([...selectedShortcuts]); setIsAddModalOpen(true); }} 
                                iconColor={iconColor} 
                            />
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
                                style={{ backgroundColor: '#000000' }}
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

const MenuSection: React.FC<{ title: string, children: React.ReactNode, iconColor: string }> = ({ title, children, iconColor }) => (
    <div className="flex flex-col">
        <div className="bg-blue-50/50 py-1.5 px-3 rounded-md mb-2 text-right">
            <span className="text-xs font-bold" style={{ color: '#000000' }}>{title}</span>
        </div>
        <div className="flex flex-col px-2">
            {children}
        </div>
    </div>
);

const MenuItem: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void, iconColor: string }> = ({ icon, label, onClick, iconColor }) => (
    <button onClick={onClick} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors text-right w-full">
        <div style={{ color: iconColor }}>{icon}</div>
        <span className="text-sm font-bold flex-1" style={{ color: '#000000' }}>{label}</span>
    </button>
);

export default FloatingMenu;
