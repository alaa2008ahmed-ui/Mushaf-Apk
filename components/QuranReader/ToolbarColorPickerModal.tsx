import React, { useState, useEffect, useCallback } from 'react';
import { registerBackInterceptor } from '../../hooks/useBackButton';

interface ToolbarColorPickerModalProps {
    onClose: () => void;
    onOpenModal: (modalName: string) => void;
    showToast: (msg: string) => void;
    currentTheme: any;
    toolbarColors: any;
    isLandscape: boolean;
}

// FIX: Add `onOpenModal` to props destructuring to make it available in the component.
const ToolbarColorPickerModal: React.FC<ToolbarColorPickerModalProps> = ({ onClose, onOpenModal, showToast, currentTheme, toolbarColors, isLandscape }) => {
    const modeSuffix = isLandscape ? '_h' : '_v';
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        onClose();
    };
    const [isTransparentMode, setIsTransparentMode] = useState(() => localStorage.getItem('transparent_mode' + modeSuffix) === 'true');
    const [headerSync, setHeaderSync] = useState(false);
    const [footerSync, setFooterSync] = useState(false);
    const [editingType, setEditingType] = useState<string | null>(null);
    
    // State for the edit modal
    const [editConfig, setEditConfig] = useState({ bg: '#ffffff', text: '#000000', border: '#cccccc', font: '' });
    const [activeColorField, setActiveColorField] = useState<'bg' | 'text' | 'border' | null>(null);

    useEffect(() => {
        const interceptor = () => {
            if (editingType) {
                setEditingType(null);
                return true;
            }
            return false;
        };
        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [editingType]);

    useEffect(() => {
        setActiveColorField(null);
    }, [editingType]);

    const PREDEFINED_COLORS = [
        '#ffffff', '#f3f4f6', '#9ca3af', '#4b5563', '#000000',
        '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e',
        '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6',
        '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
        '#f43f5e', '#78716c', '#57534e', 'transparent'
    ];

    const toggleTransparentMode = (checked: boolean) => {
        setIsTransparentMode(checked);
        localStorage.setItem('transparent_mode' + modeSuffix, String(checked));
        window.dispatchEvent(new Event('theme-change')); // Trigger theme re-application
        showToast(checked ? 'تم تفعيل وضع الأشرطة العائمة' : 'تم إلغاء وضع الأشرطة العائمة');
    };

    const getStyleForType = useCallback((type: string) => {
        const config = toolbarColors[type];
        
        let defaults = { bg: '#fff', text: '#000', border: '#ccc', font: 'inherit' };
        
        const headerButtons = ['surah', 'juz', 'page', 'audio'];
        const footerButtons = ['btn-menu', 'btn-settings', 'btn-home', 'btn-bookmark', 'btn-autoscroll', 'btn-themes', 'btn-bookmarks-list', 'btn-search'];

        if (type === 'top-toolbar' || type === 'bottom-toolbar') {
            defaults = { bg: currentTheme.barBg, text: currentTheme.barText, border: currentTheme.barBorder, font: currentTheme.font };
        } else if (headerButtons.includes(type)) {
            defaults = { bg: currentTheme.barBg, text: currentTheme.barText, border: currentTheme.barBorder, font: currentTheme.font };
        } else if (footerButtons.includes(type)) {
            defaults = { bg: currentTheme.btnBg, text: currentTheme.btnText, border: currentTheme.btnBg, font: currentTheme.font };
        }

        return {
            bg: config?.bg || defaults.bg,
            text: defaults.text,
            border: config?.border || defaults.border,
            font: config?.font || defaults.font
        };
    }, [currentTheme, toolbarColors]);

    const openEditModal = (type: string) => {
        setEditingType(type);
        const style = getStyleForType(type);
        setEditConfig({
            bg: style.bg,
            text: style.text,
            border: style.border,
            font: style.font || ''
        });
    };

    const saveElementChanges = () => {
        if (!editingType) return;
        
        const colors = JSON.parse(localStorage.getItem('toolbar_colors' + modeSuffix) || '{}');
        const newConfig = { ...editConfig };
        
        colors[editingType] = newConfig;
        
        const headerButtons = ['surah', 'juz', 'page', 'audio'];
        const footerButtons = ['btn-settings', 'btn-home', 'btn-bookmark', 'btn-bookmarks-list', 'btn-themes', 'btn-autoscroll', 'btn-menu', 'btn-search'];
        
        if (headerButtons.includes(editingType) && headerSync) {
            headerButtons.forEach(b => colors[b] = { ...newConfig });
        }
        
        if (footerButtons.includes(editingType) && footerSync) {
            footerButtons.forEach(b => colors[b] = { ...newConfig });
        }
        
        if (editingType === 'all') {
            [...headerButtons, ...footerButtons].forEach(k => colors[k] = { ...newConfig });
            colors.unifiedApplied = true;
        } else {
            delete colors.unifiedApplied;
        }
        
        localStorage.setItem('toolbar_colors' + modeSuffix, JSON.stringify(colors));
        window.dispatchEvent(new Event('theme-change'));
        setEditingType(null);
        showToast('تم حفظ التعديلات');
    };

    const getName = (type: string) => {
        const map: Record<string, string> = { 'top-toolbar': 'الشريط العلوى', 'bottom-toolbar': 'الشريط السفلى', 'surah': 'زر السورة', 'juz': 'زر الجزء', 'page': 'زر الصفحة', 'audio': 'زر الصوت', 'btn-settings': 'زر الإعدادات', 'btn-home': 'زر الرئيسية', 'btn-bookmark': 'زر الحفظ', 'btn-bookmarks-list': 'زر القائمة', 'btn-themes': 'زر الثيمات', 'btn-autoscroll': 'زر التمرير', 'btn-menu': 'زر القائمة الجانبية', 'btn-search': 'زر البحث', 'all': 'الكل' };
        return map[type] || type;
    };

    const renderCheckerboard = (color: string) => {
        if (color === 'transparent' || color === 'rgba(0, 0, 0, 0)') {
            return {
                backgroundColor: '#ffffff',
                backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%)',
                backgroundSize: '8px 8px'
            };
        }
        return { backgroundColor: color };
    };

    if (editingType) {
        return (
            <div className="fixed inset-0 z-[220] bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn" onClick={() => setEditingType(null)}>
                <div className={`bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full ${isLandscape ? 'max-w-2xl' : 'max-w-sm'} overflow-hidden animate-modal-enter flex flex-col max-h-[90vh]`} onClick={e => e.stopPropagation()}>
                    <div className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex justify-between items-center flex-none">
                        <h3 className="font-bold text-lg">تخصيص: {getName(editingType)}</h3>
                        <button onClick={() => setEditingType(null)} className="text-white hover:bg-white/20 rounded-full p-1">✕</button>
                    </div>
                    <div className={`p-5 overflow-y-auto flex-1 ${isLandscape ? 'grid grid-cols-2 gap-6 items-start' : 'space-y-4'}`}>
                        {!editingType.includes('toolbar') && (
                            <div id="modal-font-section" className={isLandscape ? 'col-span-1' : ''}>
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">نوع الخط</label>
                                <div className="custom-select-wrapper">
                                    <select value={editConfig.font} onChange={e => setEditConfig({...editConfig, font: e.target.value})} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white">
                                        <option value="">افتراضي</option>
                                        <option value="var(--font-amiri-quran)">حفص</option>
                                        <option value="var(--font-amiri)">نسخ</option>
                                        <option value="var(--font-scheherazade)">مجود</option>
                                        <option value="var(--font-lateef)">تراثي</option>
                                        <option value="var(--font-harmattan)">ورش</option>
                                        <option value="var(--font-aref)">رقعة</option>
                                        <option value="var(--font-gulzar)">نستعليق</option>
                                        <option value="var(--font-kufi)">كوفي</option>
                                        <option value="var(--font-kufam)">كوفي حديث</option>
                                        <option value="var(--font-noto)">نسخ حديث</option>
                                        <option value="var(--font-cairo)">القاهرة</option>
                                        <option value="var(--font-messiri)">المسيري</option>
                                        <option value="var(--font-rakkas)">رقاص</option>
                                        <option value="var(--font-lalezar)">لالزار</option>
                                        <option value="var(--font-katibeh)">قطيبة</option>
                                        <option value="var(--font-tajawal)">تجوّل</option>
                                        <option value="var(--font-changa)">شنقة</option>
                                        <option value="var(--font-mirza)">ميرزا</option>
                                        <option value="var(--font-qalam)">قلم</option>
                                        <option value="var(--font-thuluth)">ثلوث</option>
                                        <option value="var(--font-digital)">رقمي</option>
                                    </select>
                                </div>
                            </div>
                        )}
                        <div className={`grid gap-3 ${isLandscape && editingType.includes('toolbar') ? 'col-span-2 grid-cols-3' : 'grid-cols-1'}`}>
                            <div className="flex flex-col">
                                <label className="text-xs font-bold text-gray-500 mb-1">خلفية</label>
                                <div className="flex items-center gap-2">
                                    <div 
                                        className={`h-10 w-10 rounded-lg border shadow-sm cursor-pointer flex-shrink-0 ${activeColorField === 'bg' ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-300'}`}
                                        style={renderCheckerboard(editConfig.bg)}
                                        onClick={() => setActiveColorField(activeColorField === 'bg' ? null : 'bg')}
                                    ></div>
                                    <input 
                                        type="text" 
                                        value={editConfig.bg}
                                        onChange={e => setEditConfig({...editConfig, bg: e.target.value})}
                                        className="w-full h-10 border border-gray-300 rounded-lg px-2 text-xs font-mono dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                        dir="ltr"
                                        placeholder="#FFFFFF"
                                    />
                                </div>
                            </div>
                            {!editingType.includes('toolbar') && (
                                <div className="flex flex-col">
                                    <label className="text-xs font-bold text-gray-500 mb-1">نص/أيقونة</label>
                                    <div className="flex items-center gap-2">
                                        <div 
                                            className={`h-10 w-10 rounded-lg border shadow-sm cursor-pointer flex-shrink-0 ${activeColorField === 'text' ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-300'}`}
                                            style={renderCheckerboard(editConfig.text)}
                                            onClick={() => setActiveColorField(activeColorField === 'text' ? null : 'text')}
                                        ></div>
                                        <input 
                                            type="text" 
                                            value={editConfig.text}
                                            onChange={e => setEditConfig({...editConfig, text: e.target.value})}
                                            className="w-full h-10 border border-gray-300 rounded-lg px-2 text-xs font-mono dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                            dir="ltr"
                                            placeholder="#FFFFFF"
                                        />
                                    </div>
                                </div>
                            )}
                            <div className="flex flex-col">
                                <label className="text-xs font-bold text-gray-500 mb-1">حدود</label>
                                <div className="flex items-center gap-2">
                                    <div 
                                        className={`h-10 w-10 rounded-lg border shadow-sm cursor-pointer flex-shrink-0 ${activeColorField === 'border' ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-300'}`}
                                        style={renderCheckerboard(editConfig.border)}
                                        onClick={() => setActiveColorField(activeColorField === 'border' ? null : 'border')}
                                    ></div>
                                    <input 
                                        type="text" 
                                        value={editConfig.border}
                                        onChange={e => setEditConfig({...editConfig, border: e.target.value})}
                                        className="w-full h-10 border border-gray-300 rounded-lg px-2 text-xs font-mono dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                        dir="ltr"
                                        placeholder="#FFFFFF"
                                    />
                                </div>
                            </div>
                            
                            {activeColorField && (
                                <div className="col-span-full bg-gray-50 dark:bg-gray-800/80 p-3 rounded-xl border border-gray-200 dark:border-gray-700 mt-2 animate-fadeIn">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                            اختر لون {activeColorField === 'bg' ? 'الخلفية' : activeColorField === 'text' ? 'النص/الأيقونة' : 'الحدود'}
                                        </span>
                                        <button onClick={() => setActiveColorField(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                            <i className="fa-solid fa-times"></i>
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                                        {PREDEFINED_COLORS.map(c => (
                                            <button
                                                key={c}
                                                onClick={() => setEditConfig({...editConfig, [activeColorField]: c})}
                                                className={`h-8 rounded-md border shadow-sm transition-transform hover:scale-110 ${editConfig[activeColorField] === c ? 'ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-gray-800' : 'border-gray-200 dark:border-gray-600'}`}
                                                style={renderCheckerboard(c)}
                                                title={c}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <button onClick={saveElementChanges} className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg transition transform active:scale-95 ${isLandscape ? 'col-span-2' : 'w-full'}`}>تطبيق التغييرات</button>
                    </div>
                </div>
            </div>
        );
    }
    
    const allButtons = ['surah', 'juz', 'page', 'audio', 'btn-menu', 'btn-settings', 'btn-home', 'btn-bookmark', 'btn-autoscroll', 'btn-themes', 'btn-bookmarks-list', 'btn-search'];

    return (
        <div className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fadeIn`} onClick={handleClose}>
            <div className={`modal-skinned w-full ${isLandscape ? 'max-w-5xl' : 'max-w-md'} rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-modal-enter`} onClick={e => e.stopPropagation()}>
                <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex justify-between items-center shadow-md flex-none theme-header-bg">
                    <h3 className="text-lg font-extrabold flex items-center">
                        <i className="fa-solid fa-palette ml-2"></i>
                        تصميم الواجهة
                    </h3>
                    <div className="flex items-center">
                        <span className="ml-2 text-xs font-bold opacity-90">وضع شفاف</span>
                        <div className="relative inline-block w-8 align-middle select-none transition duration-200 ease-in">
                            <input type="checkbox" checked={isTransparentMode} onChange={e => toggleTransparentMode(e.target.checked)} className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-2 appearance-none cursor-pointer"/>
                            <label className={`toggle-label block overflow-hidden h-4 rounded-full cursor-pointer ${isTransparentMode ? 'bg-emerald-500' : 'bg-gray-300'}`}></label>
                        </div>
                    </div>
                </div>
                <div className={`flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 ${isLandscape ? 'grid grid-cols-2 gap-4' : 'space-y-4'}`}>
                    <div className="bg-gray-100 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-200 dark:border-gray-700 shadow-sm h-fit">
                        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 text-center border-b pb-2 border-gray-300 dark:border-gray-600">الأشرطة الرئيسية</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <button data-type="top-toolbar" onClick={() => openEditModal('top-toolbar')} className="color-option-btn group shadow-sm h-12 relative overflow-hidden flex items-center justify-between p-0">
                                <span className="relative z-10 font-bold text-xs px-3" style={{ color: getStyleForType('top-toolbar').text }}>الشريط العلوى</span>
                                <div className="color-preview-dot mr-3 z-10 relative" style={renderCheckerboard(getStyleForType('top-toolbar').bg)}></div>
                                <div className="absolute top-0 left-0 w-full h-full border-b-4 opacity-80 group-hover:opacity-100 transition" style={{backgroundColor: getStyleForType('top-toolbar').bg, borderColor: getStyleForType('top-toolbar').border}}></div>
                            </button>
                            <button data-type="bottom-toolbar" onClick={() => openEditModal('bottom-toolbar')} className="color-option-btn group shadow-sm h-12 relative overflow-hidden flex items-center justify-between p-0">
                                <span className="relative z-10 font-bold text-xs px-3" style={{ color: getStyleForType('bottom-toolbar').text }}>الشريط السفلى</span>
                                <div className="color-preview-dot mr-3 z-10 relative" style={renderCheckerboard(getStyleForType('bottom-toolbar').bg)}></div>
                                <div className="absolute bottom-0 left-0 w-full h-full border-t-4 opacity-80 group-hover:opacity-100 transition" style={{backgroundColor: getStyleForType('bottom-toolbar').bg, borderColor: getStyleForType('bottom-toolbar').border}}></div>
                            </button>
                        </div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-200 dark:border-gray-700 shadow-sm relative h-fit">
                        <div className="flex justify-between items-center mb-3 border-b pb-2 border-gray-300 dark:border-gray-600">
                            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 w-full text-center">أزرار الشريط العلوى</h4>
                            <div className="flex items-center gap-3 absolute left-3 top-3">
                                <div className="flex items-center">
                                    <label className="text-[10px] ml-1 font-bold text-indigo-500">توحيد</label>
                                    <input type="checkbox" checked={headerSync} onChange={e => setHeaderSync(e.target.checked)} className="sync-toggle w-3 h-3"/>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {['surah', 'juz', 'page', 'audio'].map(type => {
                                const style = getStyleForType(type);
                                return (
                                    <button key={type} data-type={type} onClick={() => openEditModal(type)} className="color-option-btn" style={{backgroundColor: style.bg, borderColor: style.border}}>
                                        <span className="text-xs font-bold" style={{color: style.text}}>{getName(type)}</span>
                                        <div className="color-preview-dot" style={renderCheckerboard(style.bg)}></div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div className={`bg-gray-100 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-200 dark:border-gray-700 shadow-sm relative h-fit ${isLandscape ? 'col-span-1' : ''}`}>
                        <div className="flex justify-between items-center mb-3 border-b pb-2 border-gray-300 dark:border-gray-600">
                            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 w-full text-center">أزرار الشريط السفلى</h4>
                            <div className="flex items-center gap-3 absolute left-3 top-3">
                                <div className="flex items-center">
                                    <label className="text-[10px] ml-1 font-bold text-indigo-500">توحيد</label>
                                    <input type="checkbox" checked={footerSync} onChange={e => setFooterSync(e.target.checked)} className="sync-toggle w-3 h-3"/>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                             {['btn-menu', 'btn-settings', 'btn-home', 'btn-bookmark', 'btn-autoscroll', 'btn-themes', 'btn-bookmarks-list', 'btn-search'].map(type => {
                                const style = getStyleForType(type);
                                return (
                                    <button key={type} data-type={type} onClick={() => openEditModal(type)} className="color-option-btn" style={{backgroundColor: style.bg, borderColor: style.border}}>
                                        <span className="text-xs font-bold" style={{color: style.text}}>{getName(type)}</span>
                                        <div className="color-preview-dot" style={renderCheckerboard(style.bg)}></div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div className={`${isLandscape ? 'col-span-1 flex items-center justify-center' : 'mt-2'}`}>
                         <button onClick={() => openEditModal('all')} className="w-full py-2 bg-indigo-100 dark:bg-indigo-900/30 border-2 border-dashed border-indigo-400 rounded-lg text-indigo-700 dark:text-indigo-300 font-bold hover:bg-indigo-200 transition text-sm">تطبيق لون موحد لجميع الأزرار</button>
                    </div>
                </div>
                <div className="p-3 bg-gray-100 dark:bg-gray-900 border-t dark:border-gray-700 flex justify-center items-center flex-none">
                    <button onClick={handleClose} className="bg-gray-800 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-gray-700 text-xs">الرجوع للإعدادات</button>
                </div>
            </div>
        </div>
    );
};

export default ToolbarColorPickerModal;