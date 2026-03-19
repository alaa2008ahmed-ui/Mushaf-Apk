
import React, { useState, useEffect, useCallback, useRef } from 'react';
import BottomBar from '../components/BottomBar';
import { useTheme } from '../context/ThemeContext';
import type { Theme } from '../context/themes';
import { DEFAULT_PHRASES } from '../data/tasbeehData';
import { registerBackInterceptor } from '../hooks/useBackButton';

// FIX: Renamed to be more specific to phrases
const PHRASES_STORAGE_KEY = 'ahmed_laila_tasbeeh_phrases';
// FIX: Added a new key for other settings like color
const SETTINGS_STORAGE_KEY = 'ahmed_laila_tasbeeh_settings_v1';

// FIX: Correctly convert digits to numbers for array indexing.
const toArabicNumerals = (num) => {
    if (num === null || num === undefined) return '';
    return String(num).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);
};
const toEnglishNumerals = (str) => {
    if (str === null || str === undefined) return '';
    const map = { '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9' };
    return str.toString().replace(/[٠-٩]/g, m => map[m]);
};

const playSound = (freq = 880, dur = 0.05) => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const audioCtx = new AudioContext();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + dur);
    } catch (e) { console.warn("Could not play sound", e); }
};

const vibrate = (pattern: number | number[] = 50) => {
    if (navigator.vibrate) navigator.vibrate(pattern);
};

const ThreeDButton = ({ label, onClick, color, padding = "py-3 px-4 text-base", children = null, theme }: {label: string, onClick: () => void, color: string, padding?: string, children?: React.ReactNode, theme: Theme}) => (
    <button
        onClick={onClick}
        className={`w-full rounded-full font-extrabold cursor-pointer transform active:translate-y-1 active:shadow-none focus:outline-none overflow-hidden btn-3d-effect ${padding}`}
        style={{
            background: color,
            color: '#FFFFFF',
            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            boxShadow: `0 4px 0 0 ${theme.palette[0]}99, 0 6px 12px rgba(0,0,0,0.25)`
        }}
    >
        <div className="flex items-center justify-center relative z-10 h-full w-full gap-2">
            {children}{label}
        </div>
    </button>
);

// FIX: Made `children` prop optional to resolve "Property 'children' is missing" error.
const ModalWrapper = ({ children, onClose, isOpen }: { children?: React.ReactNode, onClose: () => void, isOpen: boolean }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="p-6 rounded-2xl w-full max-w-xs space-y-4 bg-modal-bg text-modal-text shadow-2xl border border-modal-border" onClick={e => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
};


// --- Main Component ---
function Tasbeeh({ onBack }) {
    const { theme, themeKey } = useTheme();
    const isBlackAndWhite = themeKey === 'black_and_white';
    const primaryTextColor = isBlackAndWhite ? '#FFFFFF' : theme.palette[0];
    const secondaryTextColor = isBlackAndWhite ? '#FFFFFF' : theme.palette[1];

    const [phrases, setPhrases] = useState<{id: number, text: string}[]>([]);
    const [count, setCount] = useState(0);
    const [target, setTarget] = useState(33);
    const [activePhrase, setActivePhrase] = useState('');
    const [isCountingStopped, setIsCountingStopped] = useState(false);
    // FIX: Added 'color' to the modals state object to manage the color picker modal.
    const [modals, setModals] = useState({ target: false, phrase: false, add: false, delete: false, color: false });
    const [message, setMessage] = useState({ text: '', type: 'green', visible: false });
    const targetInputRef = useRef<HTMLInputElement>(null);
    const newPhraseInputRef = useRef<HTMLInputElement>(null);
    // FIX: Added state to manage the counter's background color, initialized with the primary theme color.
    const [counterColor, setCounterColor] = useState(theme.palette[0]);

    const loadPhrases = useCallback(() => {
        try {
            const stored = localStorage.getItem(PHRASES_STORAGE_KEY);
            const userChanges = stored ? JSON.parse(stored) : [];
            const deletedTexts = userChanges.filter(c => c.deleted).map(c => c.text);
            const addedPhrases = userChanges.filter(c => !c.deleted);

            let currentPhrases = DEFAULT_PHRASES.filter(p => !deletedTexts.includes(p.text));
            addedPhrases.forEach(p => {
                if (!currentPhrases.some(cp => cp.text === p.text)) {
                    currentPhrases.push({ id: Date.now() + Math.random(), text: p.text });
                }
            });
            
            setPhrases(currentPhrases);
            if (!currentPhrases.some(p => p.text === activePhrase)) {
                setActivePhrase(currentPhrases[0]?.text || '');
            }

        } catch (e) {
            setPhrases(DEFAULT_PHRASES);
            setActivePhrase(DEFAULT_PHRASES[0]?.text || '');
        }
    }, [activePhrase]);

    useEffect(() => {
        loadPhrases();
        // FIX: Load the counter color from local storage on component mount, falling back to the theme color.
        try {
            const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                if (settings.counterColor) {
                    setCounterColor(settings.counterColor);
                }
            } else {
                setCounterColor(theme.palette[0]);
            }
        } catch(e) {
            console.warn("Could not load tasbeeh settings", e);
            setCounterColor(theme.palette[0]);
        }
    }, [loadPhrases, theme.palette]);

    useEffect(() => {
        const interceptor = () => {
            if (modals.target || modals.phrase || modals.add || modals.delete || modals.color) {
                setModals({ target: false, phrase: false, add: false, delete: false, color: false });
                return true;
            }
            return false;
        };
        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [modals]);

    const showMessage = (text: string, type = 'green') => {
        setMessage({ text, type, visible: true });
        setTimeout(() => setMessage(prev => ({ ...prev, visible: false })), 2000);
    };

    const handleIncrement = () => {
        if (isCountingStopped) {
            return;
        }
        playSound();
        vibrate(30);
        const newCount = count + 1;
        if (target > 0 && newCount >= target) {
            setCount(target);
            setIsCountingStopped(true);
            vibrate([100, 50, 100]);
            playSound(660, 0.2);
            showMessage('تم الوصول للهدف!');
        } else {
            setCount(newCount);
        }
    };
    
    const handleReset = () => {
        setCount(0);
        setIsCountingStopped(false);
    };

    const saveChanges = (currentPhrases: {id: number, text: string}[]) => {
        try {
            const deletedDefaults = DEFAULT_PHRASES.filter(dp => !currentPhrases.some(cp => cp.text === dp.text)).map(p => ({ text: p.text, deleted: true }));
            const addedUserPhrases = currentPhrases.filter(cp => !DEFAULT_PHRASES.some(dp => dp.text === cp.text));
            localStorage.setItem(PHRASES_STORAGE_KEY, JSON.stringify([...deletedDefaults, ...addedUserPhrases]));
            loadPhrases(); // Reload to ensure consistency
        } catch (e) { console.error("Failed to save tasbeeh phrases", e); }
    };
    
    const handleAddPhrase = (newPhraseText: string) => {
        const trimmed = newPhraseText.trim();
        if (!trimmed) { showMessage('لا يمكن إضافة ذكر فارغ.', 'red'); return; }
        if (phrases.some(p => p.text === trimmed)) { showMessage('هذا الذكر موجود بالفعل.', 'red'); return; }
        
        const newPhrases = [...phrases, { id: Date.now(), text: trimmed }];
        saveChanges(newPhrases);
        setActivePhrase(trimmed);
        handleReset();
        setModals(p => ({...p, add: false, phrase: false}));
        showMessage('تم إضافة الذكر بنجاح.');
    };
    
    const handleDeletePhrase = (phraseText: string) => {
        const newPhrases = phrases.filter(p => p.text !== phraseText);
        saveChanges(newPhrases);

        if (activePhrase === phraseText) {
            const nextPhrase = newPhrases.length > 0 ? newPhrases[0].text : (DEFAULT_PHRASES[0]?.text || '');
            setActivePhrase(nextPhrase);
            handleReset();
        }
        showMessage('تم حذف الذكر بنجاح.');
    };

    const handleSetTarget = () => {
        const newTargetValue = targetInputRef.current?.value || '0';
        const num = parseInt(toEnglishNumerals(newTargetValue), 10);
        const newTarget = isNaN(num) || num < 0 ? 0 : num;
        handleReset();
        setTarget(newTarget);
        setModals(p => ({...p, target: false}));
    };
    
    // FIX: New function to handle setting and saving the counter color.
    const handleSetCounterColor = (color: string) => {
        setCounterColor(color);
        try {
            const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
            const settings = savedSettings ? JSON.parse(savedSettings) : {};
            settings.counterColor = color;
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
        } catch (e) {
            console.error("Failed to save counter color", e);
        }
        showMessage('تم تغيير لون العداد.');
        setModals(p => ({...p, color: false}));
    };

    // FIX: A list of predefined color options for the color picker modal.
    const colorOptions = [
        theme.palette[0],
        theme.palette[1],
        ...(theme.palette[2] ? [theme.palette[2]] : []),
        '#3b82f6', // blue
        '#ef4444', // red
        '#10b981', // green
        '#f97316', // orange
        '#8b5cf6', // violet
    ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 8);

    return (
        <div className="h-screen flex flex-col bg-transparent">
            <header className="app-top-bar">
                <div className="app-top-bar__inner">
                    <h1 className="app-top-bar__title text-2xl font-kufi">السبحة الإلكترونية</h1>
                    <p className="app-top-bar__subtitle">أضف أذكارك الخاصة وتتبع تسبيحك بدقة</p>
                </div>
            </header>
            
            <main className="p-4 flex-grow relative flex flex-col items-center overflow-y-auto pb-24 fade-in">
                 <div className="w-full max-w-lg mt-2 space-y-3 mb-2">
                    <div className="rounded-xl themed-card p-2">
                        <button onClick={() => setModals(p => ({...p, phrase: true}))} className="w-full py-3 px-4 rounded-xl flex justify-between items-center text-lg font-bold transition themed-bg-alt hover:opacity-80">
                            <span className="text-sm flex-shrink-0 ml-2" style={{color: secondaryTextColor}}>الذكر الحالي:</span>
                            <span className="flex-grow text-xl font-extrabold text-center font-amiri truncate" style={{color: isBlackAndWhite ? '#FFFFFF' : undefined}}>{activePhrase}</span>
                            <svg className="h-5 w-5 mr-2 flex-shrink-0" style={{color: secondaryTextColor}} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </button>
                    </div>
                    {/* FIX: Changed grid to 3 columns and added a button to open the color picker modal. */}
                    <div className="grid grid-cols-3 gap-3">
                         <button onClick={() => setModals(p => ({...p, add: true}))} className="py-2.5 px-2 font-bold rounded-full text-white text-xs sm:text-sm" style={{backgroundColor: isBlackAndWhite ? '#333' : theme.palette[0], color: '#FFF', border: isBlackAndWhite ? '1px solid #FFF' : 'none'}}>إضافة ذكر</button>
                         <button onClick={() => setModals(p => ({...p, delete: true}))} className="py-2.5 px-2 font-bold rounded-full themed-card text-xs sm:text-sm" style={{color: isBlackAndWhite ? '#FFF' : undefined, border: isBlackAndWhite ? '1px solid #FFF' : 'none'}}>حذف ذكر</button>
                         <button onClick={() => setModals(p => ({...p, color: true}))} className="py-2.5 px-2 font-bold rounded-full text-white text-xs sm:text-sm" style={{backgroundColor: isBlackAndWhite ? '#333' : (theme.palette[1] || theme.palette[0]), color: '#FFF', border: isBlackAndWhite ? '1px solid #FFF' : 'none'}}>لون العداد</button>
                    </div>
                 </div>

                 <div className="flex-grow flex flex-col items-center justify-center w-full max-w-lg space-y-4 py-2">
                    <div className="text-center px-6 py-3 rounded-2xl themed-card w-full max-w-xs">
                        <span className="block text-sm font-bold mb-1" style={{color: secondaryTextColor}}>{isCountingStopped && target > 0 ? 'تم الوصول للهدف! 🎉' : 'الهدف:'}</span>
                        <span className="text-3xl font-extrabold font-amiri" style={{color: primaryTextColor}}>{toArabicNumerals(target > 0 ? target : 'مفتوح')}</span>
                    </div>
                    {/* FIX: Applied the selected background color to the counter button and set text color to white for contrast. */}
                    <button onClick={handleIncrement} className={`tasbeeh-counter w-64 h-64 rounded-full flex flex-col items-center justify-center transition-all duration-200 ease-out cursor-pointer select-none relative z-10`} style={{ backgroundColor: counterColor }}>
                        <span className="text-9xl font-mono font-black" style={{ fontFamily: 'Amiri', textShadow: '0 4px 8px rgba(0,0,0,0.2)', color: 'white' }}>
                            {toArabicNumerals(count)}
                        </span>
                        <span className="text-lg font-bold mt-2" style={{color: 'white', opacity: 0.8}}>
                            {isCountingStopped ? 'قم بالتصفير للبدء' : 'اضغط للعد'}
                        </span>
                    </button>
                </div>
                
                <div className="w-full max-w-lg px-4 mt-auto mb-2">
                    <div className="grid grid-cols-2 gap-3">
                        <ThreeDButton label="تصفير" onClick={handleReset} color={isBlackAndWhite ? '#333' : theme.palette[1]} padding="py-2.5 text-base" theme={theme}>
                            {/* No children */}
                        </ThreeDButton>
                        <ThreeDButton label="تعديل الهدف" onClick={() => setModals(p => ({...p, target: true}))} color={isBlackAndWhite ? '#000' : theme.palette[0]} padding="py-2.5 text-base" theme={theme}>
                             {/* No children */}
                        </ThreeDButton>
                    </div>
                </div>
            </main>
            
            {/* Modals */}
            <ModalWrapper isOpen={modals.target} onClose={() => setModals(p => ({...p, target: false}))}>
                <h3 className="text-xl font-bold text-center border-b pb-2 border-modal-border">تعيين الهدف</h3>
                <p className='text-sm text-center opacity-80'>أدخل العدد المستهدف (مثل 33). أدخل 0 للإلغاء.</p>
                <input ref={targetInputRef} id="target-input" type="text" inputMode="numeric" dir="rtl" defaultValue={toArabicNumerals(target > 0 ? target : '')}
                    onInput={(e) => (e.target as HTMLInputElement).value = (e.target as HTMLInputElement).value.replace(/[^0-9٠-٩]/g, '')}
                    className="w-full p-3 rounded-xl text-center text-2xl font-bold focus:outline-none focus:ring-2 bg-card-bg-hover text-modal-text border border-modal-border"/>
                <div className="flex gap-3 pt-2">
                    <button onClick={() => setModals(p => ({...p, target: false}))} className="flex-1 py-2 rounded-lg bg-gray-500/20 text-modal-text font-bold hover:bg-gray-500/30 transition-colors">إلغاء</button>
                    <button onClick={handleSetTarget} className="flex-1 py-2 rounded-lg text-white font-bold" style={{backgroundColor: theme.palette[0]}}>حفظ</button>
                </div>
            </ModalWrapper>

            <ModalWrapper isOpen={modals.add} onClose={() => setModals(p => ({...p, add: false}))}>
                 <h3 className="text-xl font-bold text-center border-b pb-2 border-modal-border">إضافة تسبيح</h3>
                 <input ref={newPhraseInputRef} id="new-phrase-input" type="text" placeholder="اكتب الذكر هنا..." dir="rtl" className="w-full p-3 rounded-xl text-right text-lg focus:outline-none focus:ring-2 bg-card-bg-hover text-modal-text border border-modal-border"/>
                <div className="flex gap-3 pt-2">
                    <button onClick={() => setModals(p => ({...p, add: false}))} className="flex-1 py-2 rounded-lg bg-gray-500/20 text-modal-text font-bold hover:bg-gray-500/30 transition-colors">إلغاء</button>
                    <button onClick={() => handleAddPhrase(newPhraseInputRef.current?.value || '')} className="flex-1 py-2 rounded-lg text-white font-bold" style={{backgroundColor: theme.palette[0]}}>إضافة</button>
                </div>
            </ModalWrapper>
            
            <ModalWrapper isOpen={modals.delete} onClose={() => setModals(p => ({...p, delete: false}))}>
                 <h3 className="text-xl font-bold text-center border-b pb-3 border-modal-border">حذف تسبيح</h3>
                 <div className="space-y-3 overflow-y-auto max-h-60 pr-2">
                    {phrases.length > 0 ? (
                         phrases.map(p => (
                             <div key={p.id} className="p-2 rounded-lg flex items-center justify-between bg-card-bg-hover border border-modal-border">
                                 <span className="text-right text-base flex-grow pl-2 font-amiri text-modal-text">{p.text}</span>
                                 <button onClick={() => handleDeletePhrase(p.text)} className="w-14 h-8 text-xs font-bold rounded-md bg-red-500 text-white flex-shrink-0 hover:bg-red-600 transition-colors">حذف</button>
                             </div>
                         ))
                    ) : (
                        <p className="text-center opacity-60 py-4">لا يوجد أذكار لحذفها.</p>
                    )}
                 </div>
                 <div className="pt-4 mt-2 border-t border-modal-border">
                     <button onClick={() => setModals(p => ({...p, delete: false}))} className="w-full py-2 rounded-lg bg-gray-500/20 text-modal-text font-bold hover:bg-gray-500/30 transition-colors">
                         إغلاق
                     </button>
                 </div>
            </ModalWrapper>

            <ModalWrapper isOpen={modals.phrase} onClose={() => setModals(p => ({...p, phrase: false}))}>
                <h3 className="text-xl font-bold text-center border-b pb-3 border-modal-border">اختر الذكر</h3>
                <div className="space-y-3 overflow-y-auto max-h-60 pr-2">
                    {phrases.map(p => (
                        <div key={p.id} onClick={() => { setActivePhrase(p.text); handleReset(); setModals(p => ({...p, phrase: false})); }}
                             className={`p-3 rounded-xl cursor-pointer flex items-center justify-between border-2 ${activePhrase === p.text ? 'border-primary bg-primary/10' : 'border-transparent hover:bg-card-bg-hover bg-card-bg-hover/50'}`}>
                            <span className="text-right text-lg font-amiri text-modal-text">{p.text}</span>
                            {activePhrase === p.text && <div className="w-3 h-3 bg-primary rounded-full flex-shrink-0"></div>}
                        </div>
                    ))}
                </div>
            </ModalWrapper>
            
            {/* FIX: Added a new modal for selecting the counter color. */}
            <ModalWrapper isOpen={modals.color} onClose={() => setModals(p => ({...p, color: false}))}>
                <h3 className="text-xl font-bold text-center border-b pb-2 border-modal-border">اختر لون العداد</h3>
                <div className="grid grid-cols-4 gap-4 pt-4 justify-items-center">
                    {colorOptions.map(color => (
                        <button
                            key={color}
                            onClick={() => handleSetCounterColor(color)}
                            className={`w-12 h-12 rounded-full border-4 transition-transform transform active:scale-90 ${counterColor === color ? 'ring-2 ring-offset-2 ring-offset-modal-bg ring-primary' : ''}`}
                            style={{ backgroundColor: color, borderColor: 'rgba(255,255,255,0.5)' }}
                        />
                    ))}
                </div>
                <div className="pt-4 mt-2 border-t border-modal-border">
                    <button onClick={() => setModals(p => ({...p, color: false}))} className="w-full py-2 rounded-lg bg-gray-500/20 text-modal-text font-bold hover:bg-gray-500/30 transition-colors">
                        إغلاق
                    </button>
                </div>
            </ModalWrapper>

            {message.visible && (
                <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 p-3 text-white rounded-lg shadow-xl transition-opacity duration-500 z-[200] font-bold ${message.type === 'green' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                    {message.text}
                </div>
            )}

            <BottomBar onHomeClick={onBack} onThemesClick={() => {}} showThemes={false} />
        </div>
    );
}

export default Tasbeeh;