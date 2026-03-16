import React, { useState, useEffect } from 'react';
import { READERS, TAFSEERS, THEMES } from './constants';

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
        const defaultTheme = THEMES['default'];
        return saved ? JSON.parse(saved) : {
            fontSize: 1.7,
            fontFamily: defaultTheme.font,
            textColor: defaultTheme.text,
            bgColor: defaultTheme.bg,
            highlightTextColor: defaultTheme.highlightText || defaultTheme.accent,
            reader: 'Abu_Bakr_Ash-Shaatree_128kbps',
            theme: 'default',
            scrollMinutes: 20,
            tafseer: 'ar.jalalayn',
            lockHighlightColor: false
        };
    });
    
    const [showSajdahCard, setShowSajdahCard] = useState(() => {
        const saved = localStorage.getItem('show_sajdah_card');
        return saved !== null ? saved === 'true' : true;
    });
    const [useTajweed, setUseTajweed] = useState(() => localStorage.getItem('use_tajweed_quran' + modeSuffix) === 'true');



    const updateSetting = (key: string, value: any) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        localStorage.setItem('quran_settings' + modeSuffix, JSON.stringify(newSettings));
        // Dispatch event for live updates
        window.dispatchEvent(new Event('settings-change'));
    };

    const handleSajdahCardToggle = (checked: boolean) => {
        setShowSajdahCard(checked);
        localStorage.setItem('show_sajdah_card', String(checked));
        window.dispatchEvent(new Event('settings-change'));
        showToast(checked ? 'تم تفعيل بطاقة السجدة الكبرى' : 'تم إيقاف بطاقة السجدة الكبرى');
    };

    const handleTajweedToggle = (checked: boolean) => {
        setUseTajweed(checked);
        localStorage.setItem('use_tajweed_quran' + modeSuffix, String(checked));
        window.dispatchEvent(new Event('settings-change'));
        showToast(checked ? 'تم تفعيل المصحف المجود' : 'تم إيقاف المصحف المجود');
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
                    <div className="border-b pb-2 border-gray-200 dark:border-gray-700 space-y-2">
                        <div className="flex items-center justify-between mt-3">
                            <label className="text-sm font-bold opacity-80">حجم الخط</label>
                            <span className="text-xs px-2 rounded themed-card-bg">{settings.fontSize}</span>
                        </div>
                        <input type="range" min="0.5" max="4.5" step="0.1" value={settings.fontSize} onChange={(e) => updateSetting('fontSize', parseFloat(e.target.value))} className="w-full h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                    </div>

                    <div className="grid grid-cols-3 gap-3 border-b pb-2 border-gray-200 dark:border-gray-700">
                        <div>
                            <label className="text-[10px] sm:text-xs font-bold block mb-1 opacity-80 truncate">لون النص</label>
                            <div className="h-8 w-full rounded border border-gray-300 relative overflow-hidden">
                                <input type="color" value={settings.textColor} onChange={(e) => updateSetting('textColor', e.target.value)} className="absolute -top-2 -left-2 w-[150%] h-[150%] cursor-pointer p-0 border-0" />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] sm:text-xs font-bold block mb-1 opacity-80 truncate">لون الخلفية</label>
                            <div className="h-8 w-full rounded border border-gray-300 relative overflow-hidden">
                                <input type="color" value={settings.bgColor} onChange={(e) => updateSetting('bgColor', e.target.value)} className="absolute -top-2 -left-2 w-[150%] h-[150%] cursor-pointer p-0 border-0" />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] sm:text-xs font-bold block mb-1 opacity-80 truncate">لون التحديد</label>
                            <div className="h-8 w-full rounded border border-gray-300 relative overflow-hidden">
                                <input type="color" value={settings.highlightTextColor || THEMES['default'].highlightText} onChange={(e) => updateSetting('highlightTextColor', e.target.value)} className="absolute -top-2 -left-2 w-[150%] h-[150%] cursor-pointer p-0 border-0" />
                            </div>
                            <div className="flex items-center justify-center mt-1 gap-1">
                                <input 
                                    type="checkbox" 
                                    id="lock-highlight-color" 
                                    checked={settings.lockHighlightColor} 
                                    onChange={(e) => updateSetting('lockHighlightColor', e.target.checked)} 
                                    className="w-3 h-3 accent-emerald-500"
                                />
                                <label htmlFor="lock-highlight-color" className="text-[9px] font-bold opacity-70 cursor-pointer">قفل اللون</label>
                            </div>
                        </div>
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
                            <label className="text-sm font-bold opacity-80">سرعة التمرير (وقت الجزء)</label>
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
                            <label className="text-sm font-bold opacity-80">تفعيل المصحف المجود (ملون)</label>
                            <div className="relative inline-block w-10 align-middle select-none">
                                <input type="checkbox" id="use-tajweed" checked={useTajweed} onChange={(e) => handleTajweedToggle(e.target.checked)} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-2 appearance-none cursor-pointer"/>
                                <label htmlFor="use-tajweed" className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${useTajweed ? 'bg-emerald-500' : 'bg-gray-300'}`}></label>
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