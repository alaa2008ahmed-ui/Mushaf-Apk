import React, { useState, useEffect } from 'react';
import { READERS, TAFSEERS, THEMES, DEFAULT_SETTINGS, toArabic } from './constants';

interface SettingsModalProps {
    onClose: () => void;
    onOpenModal: (modalName: string) => void;
    showToast: (msg: string) => void;
    isLandscape: boolean;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onOpenModal, showToast, isLandscape }) => {
    const modeSuffix = isLandscape ? '_h' : '_v';
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        onClose();
    };

    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('quran_settings' + modeSuffix);
        const baseSettings = saved ? JSON.parse(saved) : {};
        return { ...DEFAULT_SETTINGS, ...baseSettings };
    });
    
    useEffect(() => {
        const handleSettingsUpdate = () => {
            const saved = localStorage.getItem('quran_settings' + modeSuffix);
            const baseSettings = saved ? JSON.parse(saved) : {};
            setSettings({ ...DEFAULT_SETTINGS, ...baseSettings });
        };
        window.addEventListener('theme-change', handleSettingsUpdate);
        window.addEventListener('settings-change', handleSettingsUpdate);
        return () => {
            window.removeEventListener('theme-change', handleSettingsUpdate);
            window.removeEventListener('settings-change', handleSettingsUpdate);
        };
    }, [modeSuffix]);

    const [showSajdahCard, setShowSajdahCard] = useState(() => {
        const saved = localStorage.getItem('show_sajdah_card' + modeSuffix);
        return saved !== null ? saved === 'true' : true;
    });
    const [useTajweed, setUseTajweed] = useState(() => localStorage.getItem('use_tajweed_quran' + modeSuffix) === 'true');
    const [isHideToolbarsEnabled, setIsHideToolbarsEnabled] = useState(() => localStorage.getItem('hide_toolbars_enabled' + modeSuffix) === 'true');

    const [activeColorField, setActiveColorField] = useState<'textColor' | 'bgColor' | 'highlightTextColor' | null>(null);

    const PREDEFINED_COLORS = [
        '#ffffff', '#f3f4f6', '#9ca3af', '#4b5563', '#000000',
        '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e',
        '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6',
        '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
        '#f43f5e', '#78716c', '#57534e', 'transparent'
    ];

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

    const updateSetting = (key: string, value: any) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        localStorage.setItem('quran_settings' + modeSuffix, JSON.stringify(newSettings));
        // Dispatch event for live updates
        window.dispatchEvent(new Event('settings-change'));
    };

    const handleSajdahCardToggle = (checked: boolean) => {
        setShowSajdahCard(checked);
        localStorage.setItem('show_sajdah_card' + modeSuffix, String(checked));
        window.dispatchEvent(new Event('settings-change'));
        showToast(checked ? 'تم تفعيل بطاقة السجدة الكبرى' : 'تم إيقاف بطاقة السجدة الكبرى');
    };

    const handleTajweedToggle = (checked: boolean) => {
        setUseTajweed(checked);
        localStorage.setItem('use_tajweed_quran' + modeSuffix, String(checked));
        window.dispatchEvent(new Event('settings-change'));
        showToast(checked ? 'تم تفعيل المصحف المجود' : 'تم إيقاف المصحف المجود');
    };

    const handleHideToolbarsToggle = (checked: boolean) => {
        setIsHideToolbarsEnabled(checked);
        localStorage.setItem('hide_toolbars_enabled' + modeSuffix, String(checked));
        window.dispatchEvent(new Event('settings-change'));
        showToast(checked ? 'تم تفعيل إخفاء الأشرطة' : 'تم تعطيل إخفاء الأشرطة');
    };




    const getReaderName = (id: string) => READERS.find(r => r.id === id)?.name || id;
    const getTafseerName = (id: string) => TAFSEERS.find(t => t.id === id)?.name || id;
    const getFontName = (val: string) => {
        const fontMap: Record<string, string> = {
            "var(--font-amiri-quran)": "حفص", "var(--font-amiri)": "نسخ", "var(--font-scheherazade)": "مجود",
            "var(--font-lateef)": "تراثي", "var(--font-harmattan)": "ورش", "var(--font-aref)": "رقعة",
            "var(--font-gulzar)": "نستعليق", "var(--font-kufi)": "كوفي", "var(--font-kufam)": "كوفي حديث",
            "var(--font-noto)": "نسخ حديث", "var(--font-cairo)": "القاهرة", "var(--font-messiri)": "المسيري",
            "var(--font-rakkas)": "رقاص", "var(--font-lalezar)": "لالزار", "var(--font-katibeh)": "قطيبة",
            "var(--font-tajawal)": "تجوّل", "var(--font-changa)": "شنقة", "var(--font-mirza)": "ميرزا",
            "var(--font-qalam)": "قلم", "var(--font-thuluth)": "ثلوث", "var(--font-digital)": "رقمي",
            "'KFGQPC Uthman Taha Naskh'": "مجمع الملك فهد", "'Me Quran'": "خط المصحف"
        };
        return fontMap[val] || "افتراضي";
    };

    return (
        <div className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-fadeIn`} onClick={handleClose}>
            <div className={`modal-skinned w-full ${isLandscape ? 'max-w-4xl' : 'max-w-md sm:max-w-2xl'} rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-modal-enter`} onClick={e => e.stopPropagation()}>
                <div className="p-3 flex justify-between items-center h-12 flex-none theme-header-bg">
                    <h2 className="text-lg font-bold">إعدادات العرض</h2>
                    <button onClick={handleClose} className="hover:opacity-80 rounded-full bg-white/20 w-8 h-8 flex items-center justify-center">✕</button>
                </div>
                <div className={`p-3 overflow-y-auto text-center flex-1 ${isLandscape ? 'grid grid-cols-2 gap-x-6 gap-y-2' : 'space-y-2'}`}>
                    <div className={`${isLandscape ? 'col-span-2' : ''} border-b pb-2 border-gray-200 dark:border-gray-700 space-y-2`}>
                        <div className="flex items-center justify-between mt-3">
                            <label className="text-sm font-bold opacity-80">حجم الخط</label>
                            <span className="text-xs px-2 rounded themed-card-bg">{settings.fontSize}</span>
                        </div>
                        <input type="range" min="0.5" max="4.5" step="0.1" value={settings.fontSize} onChange={(e) => updateSetting('fontSize', parseFloat(e.target.value))} className="w-full h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                    </div>

                    <div className={`${isLandscape ? 'col-span-2 grid grid-cols-3 gap-3' : 'grid grid-cols-1 gap-3'} border-b pb-2 border-gray-200 dark:border-gray-700`}>
                        <div className="flex flex-col">
                            <label className="text-xs font-bold opacity-80 mb-1">لون النص</label>
                            <div 
                                className={`h-8 w-full rounded border shadow-sm cursor-pointer ${activeColorField === 'textColor' ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-300'}`}
                                style={renderCheckerboard(settings.textColor)}
                                onClick={() => setActiveColorField(activeColorField === 'textColor' ? null : 'textColor')}
                            ></div>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-xs font-bold opacity-80 mb-1">لون الخلفية</label>
                            <div 
                                className={`h-8 w-full rounded border shadow-sm cursor-pointer ${activeColorField === 'bgColor' ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-300'}`}
                                style={renderCheckerboard(settings.bgColor)}
                                onClick={() => setActiveColorField(activeColorField === 'bgColor' ? null : 'bgColor')}
                            ></div>
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-xs font-bold opacity-80">لون التحديد</label>
                                <div className="flex items-center gap-1">
                                    <input 
                                        type="checkbox" 
                                        id="lock-highlight-color" 
                                        checked={settings.lockHighlightColor} 
                                        onChange={(e) => updateSetting('lockHighlightColor', e.target.checked)} 
                                        className="w-3 h-3 accent-emerald-500"
                                    />
                                    <label htmlFor="lock-highlight-color" className="text-[9px] font-bold opacity-70 cursor-pointer">قفل</label>
                                </div>
                            </div>
                            <div 
                                className={`h-8 w-full rounded border shadow-sm cursor-pointer ${activeColorField === 'highlightTextColor' ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-300'}`}
                                style={renderCheckerboard(settings.highlightTextColor || THEMES['default'].highlightText)}
                                onClick={() => setActiveColorField(activeColorField === 'highlightTextColor' ? null : 'highlightTextColor')}
                            ></div>
                        </div>
                        
                        {activeColorField && (
                            <div className="col-span-full bg-gray-50 dark:bg-gray-800/80 p-3 rounded-xl border border-gray-200 dark:border-gray-700 mt-2 animate-fadeIn">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                        اختر لون {activeColorField === 'bgColor' ? 'الخلفية' : activeColorField === 'textColor' ? 'النص' : 'التحديد'}
                                    </span>
                                    <button onClick={() => setActiveColorField(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                        <i className="fa-solid fa-times"></i>
                                    </button>
                                </div>
                                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                                    {PREDEFINED_COLORS.map(c => (
                                        <button
                                            key={c}
                                            onClick={() => updateSetting(activeColorField, c)}
                                            className={`h-8 rounded-md border shadow-sm transition-transform hover:scale-110 ${settings[activeColorField] === c ? 'ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-gray-800' : 'border-gray-200 dark:border-gray-600'}`}
                                            style={renderCheckerboard(c)}
                                            title={c}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border-b border-gray-200 dark:border-gray-700 py-1">
                        <label className="text-xs font-bold block opacity-80">نوع الخط</label>
                        <div className="mt-1">
                            <button onClick={() => onOpenModal('font-modal')} className="w-full p-2 text-xs h-8 themed-card-bg rounded-lg border flex justify-between items-center px-3 font-bold">
                                <span>{getFontName(settings.fontFamily)}</span>
                                <i className="fa-solid fa-chevron-left opacity-50"></i>
                            </button>
                        </div>
                    </div>

                    <div className="border-b border-gray-200 dark:border-gray-700 py-1">
                        <label className="text-xs font-bold block opacity-80">القارئ</label>
                        <div className="mt-1">
                            <button onClick={() => onOpenModal('reciter-modal')} className="w-full p-2 text-xs h-8 themed-card-bg rounded-lg border flex justify-between items-center px-3 font-bold">
                                <span>{getReaderName(settings.reader)}</span>
                                <i className="fa-solid fa-chevron-left opacity-50"></i>
                            </button>
                        </div>
                    </div>

                    <div className="border-b border-gray-200 dark:border-gray-700 py-2">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold opacity-80 text-right">تكرار الآية</label>
                            <div className="flex items-center gap-1.5 flex-wrap justify-center">
                                {[1, 2, 3, 4, 5].map(num => (
                                    <button
                                        key={num}
                                        onClick={() => updateSetting('ayahRepeatCount', num)}
                                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                                            settings.ayahRepeatCount === num 
                                            ? 'theme-accent-btn shadow-md scale-110' 
                                            : 'themed-card-bg border opacity-60 hover:opacity-100'
                                        }`}
                                    >
                                        {toArabic(num)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="border-b border-gray-200 dark:border-gray-700 py-1">
                        <label className="text-xs font-bold block opacity-80">التفسير</label>
                        <div className="mt-1">
                            <button onClick={() => onOpenModal('tafseer-selection-modal')} className="w-full p-2 text-xs h-8 themed-card-bg rounded-lg border flex justify-between items-center px-3 font-bold">
                                <span>{getTafseerName(settings.tafseer)}</span>
                                <i className="fa-solid fa-chevron-left opacity-50"></i>
                            </button>
                        </div>
                    </div>

                    <div className="border-b pb-2 border-gray-200 dark:border-gray-700 space-y-2">
                        <div className="flex items-center justify-between mt-1">
                            <label className="text-sm font-bold opacity-80">سرعة التمرير</label>
                        </div>
                        <div className="mt-1">
                            <button onClick={() => onOpenModal('scroll-speed-modal')} className="w-full p-2 text-xs h-8 themed-card-bg rounded-lg border flex justify-between items-center px-3 font-bold">
                                <span>{settings.scrollMinutes} دقيقة</span>
                                <i className="fa-solid fa-chevron-left opacity-50"></i>
                            </button>
                        </div>
                    </div>

                    <div className="border-b pb-2 border-gray-200 dark:border-gray-700 py-1">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-bold opacity-80">إظهار بطاقة السجدة</label>
                            <div className="relative inline-block w-10 align-middle select-none">
                                <input type="checkbox" id="show-sajdah-card" checked={showSajdahCard} onChange={(e) => handleSajdahCardToggle(e.target.checked)} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-2 appearance-none cursor-pointer"/>
                                <label htmlFor="show-sajdah-card" className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${showSajdahCard ? 'bg-emerald-500' : 'bg-gray-300'}`}></label>
                            </div>
                        </div>
                    </div>

                    <div className="border-b pb-2 border-gray-200 dark:border-gray-700 py-1">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-bold opacity-80">المصحف المجود</label>
                            <div className="relative inline-block w-10 align-middle select-none">
                                <input type="checkbox" id="use-tajweed" checked={useTajweed} onChange={(e) => handleTajweedToggle(e.target.checked)} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-2 appearance-none cursor-pointer"/>
                                <label htmlFor="use-tajweed" className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${useTajweed ? 'bg-emerald-500' : 'bg-gray-300'}`}></label>
                            </div>
                        </div>
                    </div>

                    <div className="border-b pb-2 border-gray-200 dark:border-gray-700 py-1">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-bold opacity-80">إخفاء الأشرطة</label>
                            <div className="relative inline-block w-10 align-middle select-none">
                                <input type="checkbox" id="hide-toolbars" checked={isHideToolbarsEnabled} onChange={(e) => handleHideToolbarsToggle(e.target.checked)} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-2 appearance-none cursor-pointer"/>
                                <label htmlFor="hide-toolbars" className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${isHideToolbarsEnabled ? 'bg-emerald-500' : 'bg-gray-300'}`}></label>
                            </div>
                        </div>
                    </div>

                    <div className="border-b border-gray-200 dark:border-gray-700 py-1">
                        <div className="custom-select-wrapper">
                            <button onClick={() => onOpenModal('toolbar-color-picker-modal')} className="custom-select-display text-xs h-8 w-full text-right px-2 flex items-center justify-between themed-card-bg">
                                <span>تخصيص الواجهة</span>
                                <i className="fa-solid fa-chevron-left text-gray-500 text-xs"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div className="border-b border-gray-200 dark:border-gray-700 py-1">
                        <div className="custom-select-wrapper">
                            <button onClick={() => { onOpenModal('quran-download-modal'); }} className="custom-select-display text-xs h-8 w-full text-right px-2 flex items-center justify-between themed-card-bg">
                                <span>تحميل القرآن الكريم</span>
                                <i className="fa-solid fa-chevron-left text-gray-500 text-xs"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div className="border-b border-gray-200 dark:border-gray-700 py-1">
                        <div className="custom-select-wrapper">
                            <button onClick={() => { onOpenModal('tafsir-download-modal'); }} className="custom-select-display text-xs h-8 w-full text-right px-2 flex items-center justify-between themed-card-bg">
                                <span>تحميل التفسير</span>
                                <i className="fa-solid fa-chevron-left text-gray-500 text-xs"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="p-3 text-center flex-none themed-card-bg">
                    <button onClick={handleClose} className="theme-accent-btn font-bold py-2 px-8 rounded-lg shadow text-sm w-full">حفظ وإغلاق</button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;