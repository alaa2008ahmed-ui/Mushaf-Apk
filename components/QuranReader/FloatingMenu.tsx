import React, { useState, useEffect } from 'react';
import { Monitor, Smartphone, ChevronDown, List, Search, Brain, Calendar, BookOpen, Book, FileText, Headphones, Languages, Clock, Sun, Compass, Mic, Bookmark, BookText, Settings, Palette, Plus, Save, X, Heart, Calculator, Info, HelpCircle, Download } from 'lucide-react';

interface FloatingMenuProps {
    isFloatingMenuOpen: boolean;
    floatingMenuRef: React.RefObject<HTMLDivElement>;
    openModal: (modalId: string) => void;
    setIsFloatingMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
    getToolbarStyle: (id: string, bg: string, text: string, border: string) => React.CSSProperties;
    currentTheme: any;
    initialLandscape: boolean;
    onNavigate: (pageId: string) => void;
    readingMode: 'mushaf' | 'tafseer' | 'meanings' | 'translation';
    setReadingMode: (mode: 'mushaf' | 'tafseer' | 'meanings' | 'translation') => void;
    useTajweed: boolean;
    handleMushafTypeSelect: (type: 'uthmani' | 'tajweed') => void;
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
    initialLandscape,
    onNavigate,
    readingMode,
    setReadingMode,
    useTajweed,
    handleMushafTypeSelect
}) => {
    const [selectedShortcuts, setSelectedShortcuts] = useState<string[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [tempShortcuts, setTempShortcuts] = useState<string[]>([]);

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

    const iconColor = currentTheme.btnBg || '#10b981';

    return (
        <div 
            ref={floatingMenuRef}
            className={`fixed top-[calc(3.5rem+var(--logical-safe-top))] bottom-[calc(3.5rem+var(--logical-safe-bottom))] right-4 z-[1000] flex items-start gap-4 pointer-events-none`}
            dir="rtl"
        >
            {/* The Main Menu Container */}
            <div 
                id="floating-menu" 
                className={`w-max min-w-[220px] max-w-[85vw] bg-white rounded-2xl shadow-2xl transition-all duration-300 origin-top-right flex flex-col pointer-events-auto h-full ${isFloatingMenuOpen ? 'opacity-100 visible scale-100 translate-y-0' : 'opacity-0 invisible scale-95 -translate-y-4'}`} 
                style={{ fontFamily: currentTheme.font }}
            >
                {!isAddModalOpen ? (
                    /* Main Menu Content */
                    <div className="p-4 flex flex-col gap-4 overflow-y-auto flex-grow custom-scrollbar">
                        {/* نوع المصحف */}
                        <div className="flex flex-col gap-2">
                            <div className="text-right font-bold text-xs px-1 opacity-70" style={{ color: iconColor }}>نوع المصحف</div>
                            <div className="flex flex-col gap-1">
                                <button 
                                    className={`w-full py-2.5 px-4 rounded-xl text-sm flex items-center justify-between transition-all ${!useTajweed ? 'bg-gray-100 font-bold' : 'hover:bg-gray-50'}`} 
                                    onClick={() => handleAction(() => { setReadingMode('mushaf'); handleMushafTypeSelect('uthmani'); })} 
                                    style={{ color: !useTajweed ? iconColor : '#4b5563' }}
                                >
                                    <div className="flex items-center gap-3">
                                        <BookText size={18} />
                                        <span className="whitespace-nowrap">العثماني</span>
                                    </div>
                                    {!useTajweed && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: iconColor }}></div>}
                                </button>
                                <button 
                                    className={`w-full py-2.5 px-4 rounded-xl text-sm flex items-center justify-between transition-all ${useTajweed ? 'bg-gray-100 font-bold' : 'hover:bg-gray-50'}`} 
                                    onClick={() => handleAction(() => { setReadingMode('mushaf'); handleMushafTypeSelect('tajweed'); })} 
                                    style={{ color: useTajweed ? iconColor : '#4b5563' }}
                                >
                                    <div className="flex items-center gap-3">
                                        <BookOpen size={18} />
                                        <span className="whitespace-nowrap">التجويد</span>
                                    </div>
                                    {useTajweed && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: iconColor }}></div>}
                                </button>
                            </div>
                        </div>

                        {/* الإعدادات والبحث */}
                        <MenuSection title="الإعدادات والبحث" iconColor={iconColor}>
                            <MenuItem icon={<Search size={18} />} label="البحث" onClick={() => handleAction(() => openModal('search-modal'))} iconColor={iconColor} />
                            <MenuItem icon={<Palette size={18} />} label="المظهر" onClick={() => handleAction(() => openModal('themes-modal'))} iconColor={iconColor} />
                            <MenuItem icon={<Settings size={18} />} label="الإعدادات" onClick={() => handleAction(() => openModal('settings-modal'))} iconColor={iconColor} />
                            <MenuItem icon={<Bookmark size={18} />} label="العلامات المرجعية" onClick={() => handleAction(() => openModal('bookmarks-modal'))} iconColor={iconColor} />
                        </MenuSection>

                        {/* الخصائص */}
                        <MenuSection title="الخصائص" iconColor={iconColor}>
                            <MenuItem icon={<Book size={18} />} label="التفسير" onClick={() => handleAction(() => setReadingMode('tafseer'))} iconColor={iconColor} />
                            <MenuItem icon={<FileText size={18} />} label="المعاني" onClick={() => handleAction(() => setReadingMode('meanings'))} iconColor={iconColor} />
                            <MenuItem icon={<Headphones size={18} />} label="الصوتيات" onClick={() => handleAction(() => openModal('reciter-modal'))} iconColor={iconColor} />
                            <MenuItem icon={<Languages size={18} />} label="الترجمة" onClick={() => handleAction(() => setReadingMode('translation'))} iconColor={iconColor} />
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
                                <Plus size={20} style={{ color: iconColor }} />
                                <h3 className="font-bold text-sm" style={{ color: iconColor }}>تخصيص الاختصارات</h3>
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
                                            <div style={{ color: isSelected ? iconColor : '#9ca3af' }} className="transition-colors">
                                                {shortcut.icon}
                                            </div>
                                            <span className={`text-sm flex-1 transition-all ${isSelected ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>
                                                {shortcut.label}
                                            </span>
                                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 group-hover:border-gray-400'}`}>
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

const MenuSection: React.FC<{ title: string, children: React.ReactNode, iconColor: string }> = ({ title, children, iconColor }) => (
    <div className="flex flex-col">
        <div className="bg-blue-50/50 py-1.5 px-3 rounded-md mb-2 text-right">
            <span className="text-xs font-bold" style={{ color: iconColor }}>{title}</span>
        </div>
        <div className="flex flex-col px-2">
            {children}
        </div>
    </div>
);

const MenuItem: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void, iconColor: string }> = ({ icon, label, onClick, iconColor }) => (
    <button onClick={onClick} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors text-right w-full">
        <div style={{ color: iconColor }}>{icon}</div>
        <span className="text-sm text-gray-800 font-medium flex-1">{label}</span>
    </button>
);

export default FloatingMenu;
