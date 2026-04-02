import React, { useState, useEffect } from 'react';
import { ArrowRight, HelpCircle, Repeat, Play, User, ArrowLeftRight, CheckSquare, Minus, Plus } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import InteractiveBackground from '../components/InteractiveBackground';
import quranData from '../data/quran-uthmani.json';
import { SURAH_NAMES_AR, MEMORIZATION_READERS } from '../components/QuranReader/constants';
import BottomBar from '../components/BottomBar';

interface MemorizationProps {
    onBack: () => void;
    onNavigate: (pageId: string, params?: any) => void;
}

const Memorization: React.FC<MemorizationProps> = ({ onBack, onNavigate }) => {
    const { theme } = useTheme();
    const [selectedReader, setSelectedReader] = useState(MEMORIZATION_READERS[1].id); // Default to Abdul Basit
    
    const [fromSurah, setFromSurah] = useState(1);
    const [fromAyah, setFromAyah] = useState(1);
    const [toSurah, setToSurah] = useState(1);
    const [toAyah, setToAyah] = useState(7);

    const [rangeRepeat, setRangeRepeat] = useState(1);
    const [ayahRepeat, setAyahRepeat] = useState(1);
    const [linkedRepeat, setLinkedRepeat] = useState(true);
    const [pauseLength, setPauseLength] = useState(1);
    const [testAfterSession, setTestAfterSession] = useState(false);

    const [savedSession, setSavedSession] = useState<any>(null);
    const [showResumeModal, setShowResumeModal] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('memorization_session_v1');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Check if session is not too old (e.g., within 24 hours)
                const isRecent = Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000;
                if (isRecent) {
                    setSavedSession(parsed);
                    setShowResumeModal(true);
                } else {
                    localStorage.removeItem('memorization_session_v1');
                }
            } catch (e) {}
        }
    }, []);

    const handleStart = (isResume: boolean = false) => {
        if (isResume && savedSession) {
            onNavigate('quran', {
                isMemorization: true,
                surah: savedSession.currentAyah.s,
                ayah: savedSession.currentAyah.a,
                memorizationSettings: {
                    ...savedSession.settings,
                    rangeRepeatCount: savedSession.rangeRepeatCount,
                    currentRepeatCount: savedSession.currentRepeatCount
                }
            });
            setShowResumeModal(false);
        } else {
            localStorage.removeItem('memorization_session_v1');
            onNavigate('quran', {
                isMemorization: true,
                memorizationSettings: {
                    reader: selectedReader,
                    fromSurah,
                    fromAyah,
                    toSurah,
                    toAyah,
                    rangeRepeat,
                    ayahRepeat,
                    linkedRepeat,
                    pauseLength,
                    testAfterSession
                }
            });
        }
    };

    const getAyahsCount = (surahNum: number) => {
        return quranData.data.surahs[surahNum - 1]?.ayahs.length || 0;
    };

    return (
        <div className="fixed inset-0 flex flex-col" style={{ fontFamily: theme.font, backgroundColor: theme.bgColor || '#000000', color: 'var(--text-color)' }}>
            <InteractiveBackground />
            <div className="relative z-10 flex flex-col h-full">
                <header className="app-top-bar shrink-0 relative z-10">
                    <div className="app-top-bar__inner flex items-center justify-between px-4">
                        <div className="w-10"></div>
                        <h1 className="app-top-bar__title text-2xl font-kufi flex items-center justify-center gap-2">
                            التحفيظ
                        </h1>
                        <div className="w-10"></div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 space-y-6 hide-scrollbar">
                    {/* Reader Selection */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-end gap-2 font-bold text-lg" style={{ color: 'var(--text-color)' }}>
                            <span>اختر اسم القارئ</span>
                            <User size={24} />
                        </div>
                        <div className="relative">
                            <select 
                                value={selectedReader}
                                onChange={(e) => setSelectedReader(e.target.value)}
                                className="w-full p-4 rounded-2xl appearance-none outline-none text-right font-medium text-lg shadow-sm border"
                                style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', borderColor: 'var(--card-border)' }}
                            >
                                {MEMORIZATION_READERS.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px]" style={{ borderTopColor: 'var(--text-color)' }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Ayah Range */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-end gap-2 font-bold text-lg" style={{ color: 'var(--text-color)' }}>
                            <span>نطاق الآيات</span>
                            <ArrowLeftRight size={24} />
                        </div>
                        
                        <div className="flex gap-4" dir="rtl">
                            {/* From */}
                            <div className="flex-1 p-4 rounded-2xl border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                                <div className="text-center font-bold mb-3 text-lg" style={{ color: 'var(--text-color)' }}>من</div>
                                <div className="space-y-3">
                                    <div className="relative">
                                        <select 
                                            value={fromSurah}
                                            onChange={(e) => {
                                                setFromSurah(Number(e.target.value));
                                                setFromAyah(1);
                                            }}
                                            className="w-full p-3 border rounded-xl appearance-none outline-none text-center font-medium shadow-sm cursor-pointer"
                                            style={{ backgroundColor: theme.bgColor, color: 'var(--text-color)', borderColor: 'var(--card-border)' }}
                                        >
                                            {SURAH_NAMES_AR.map((name, i) => (
                                                <option key={i} value={i + 1}>{name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px]" style={{ borderTopColor: 'var(--text-color)' }}></div>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <select 
                                            value={fromAyah}
                                            onChange={(e) => setFromAyah(Number(e.target.value))}
                                            className="w-full p-3 border rounded-xl appearance-none outline-none text-center font-medium shadow-sm cursor-pointer"
                                            style={{ backgroundColor: theme.bgColor, color: 'var(--text-color)', borderColor: 'var(--card-border)' }}
                                        >
                                            {Array.from({ length: getAyahsCount(fromSurah) }).map((_, i) => (
                                                <option key={i} value={i + 1}>الآية {i + 1}</option>
                                            ))}
                                        </select>
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px]" style={{ borderTopColor: 'var(--text-color)' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* To */}
                            <div className="flex-1 p-4 rounded-2xl border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                                <div className="text-center font-bold mb-3 text-lg" style={{ color: 'var(--text-color)' }}>إلى</div>
                                <div className="space-y-3">
                                    <div className="relative">
                                        <select 
                                            value={toSurah}
                                            onChange={(e) => {
                                                setToSurah(Number(e.target.value));
                                                setToAyah(1);
                                            }}
                                            className="w-full p-3 border rounded-xl appearance-none outline-none text-center font-medium shadow-sm cursor-pointer"
                                            style={{ backgroundColor: theme.bgColor, color: 'var(--text-color)', borderColor: 'var(--card-border)' }}
                                        >
                                            {SURAH_NAMES_AR.map((name, i) => (
                                                <option key={i} value={i + 1}>{name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px]" style={{ borderTopColor: 'var(--text-color)' }}></div>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <select 
                                            value={toAyah}
                                            onChange={(e) => setToAyah(Number(e.target.value))}
                                            className="w-full p-3 border rounded-xl appearance-none outline-none text-center font-medium shadow-sm cursor-pointer"
                                            style={{ backgroundColor: theme.bgColor, color: 'var(--text-color)', borderColor: 'var(--card-border)' }}
                                        >
                                            {Array.from({ length: getAyahsCount(toSurah) }).map((_, i) => (
                                                <option key={i} value={i + 1}>الآية {i + 1}</option>
                                            ))}
                                        </select>
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px]" style={{ borderTopColor: 'var(--text-color)' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Repetition Settings */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <button className="flex items-center gap-1 px-3 py-1.5 border rounded-full text-sm font-medium" style={{ borderColor: theme.btnBg, color: theme.btnBg }}>
                                مساعدة <HelpCircle size={16} />
                            </button>
                            <div className="flex items-center gap-2 font-bold text-lg" style={{ color: 'var(--text-color)' }}>
                                <span>التكرار</span>
                                <Repeat size={24} />
                            </div>
                        </div>

                        <div className="rounded-2xl border divide-y" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                            {/* Range Repeat */}
                            <div className="flex items-center justify-between p-4" style={{ borderColor: 'var(--card-border)' }}>
                                <div className="flex items-center gap-4 rounded-xl p-1 shadow-sm border" style={{ backgroundColor: theme.bgColor, borderColor: 'var(--card-border)' }}>
                                    <button 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setRangeRepeat(prev => Math.max(1, prev - 1));
                                        }} 
                                        className="w-10 h-10 flex items-center justify-center text-white rounded-lg active:scale-90 transition-transform cursor-pointer" 
                                        style={{ backgroundColor: theme.btnBg }}
                                    >
                                        <Minus size={20} />
                                    </button>
                                    <span className="font-bold min-w-[30px] text-center text-xl" style={{ color: 'var(--text-color)' }}>{rangeRepeat}</span>
                                    <span className="text-sm" style={{ color: 'var(--text-color)', opacity: 0.7 }}>مرة</span>
                                    <button 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setRangeRepeat(prev => prev + 1);
                                        }} 
                                        className="w-10 h-10 flex items-center justify-center text-white rounded-lg active:scale-90 transition-transform cursor-pointer" 
                                        style={{ backgroundColor: theme.btnBg }}
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                                <span className="font-medium" style={{ color: 'var(--text-color)' }}>تكرار نطاق الآيات</span>
                            </div>

                            {/* Ayah Repeat */}
                            <div className="flex items-center justify-between p-4" style={{ borderColor: 'var(--card-border)' }}>
                                <div className="flex items-center gap-4 rounded-xl p-1 shadow-sm border" style={{ backgroundColor: theme.bgColor, borderColor: 'var(--card-border)' }}>
                                    <button 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setAyahRepeat(prev => Math.max(1, prev - 1));
                                        }} 
                                        className="w-10 h-10 flex items-center justify-center text-white rounded-lg active:scale-90 transition-transform cursor-pointer" 
                                        style={{ backgroundColor: theme.btnBg }}
                                    >
                                        <Minus size={20} />
                                    </button>
                                    <span className="font-bold min-w-[30px] text-center text-xl" style={{ color: 'var(--text-color)' }}>{ayahRepeat}</span>
                                    <span className="text-sm" style={{ color: 'var(--text-color)', opacity: 0.7 }}>مرة</span>
                                    <button 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setAyahRepeat(prev => prev + 1);
                                        }} 
                                        className="w-10 h-10 flex items-center justify-center text-white rounded-lg active:scale-90 transition-transform cursor-pointer" 
                                        style={{ backgroundColor: theme.btnBg }}
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                                <span className="font-medium" style={{ color: 'var(--text-color)' }}>تكرار الآية الواحدة</span>
                            </div>

                            {/* Linked Repeat */}
                            <div className="flex items-center justify-between p-4" style={{ borderColor: 'var(--card-border)' }}>
                                <div className="flex items-center gap-4">
                                    <button className="flex items-center gap-1 px-3 py-1 border rounded-full text-sm" style={{ borderColor: 'var(--card-border)', color: 'var(--text-color)' }}>
                                        توضيح <Play size={14} />
                                    </button>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={linkedRepeat} onChange={(e) => setLinkedRepeat(e.target.checked)} />
                                        <div 
                                            className={`w-11 h-6 rounded-full peer peer-focus:outline-none transition-colors after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:-translate-x-full peer-checked:after:border-white ${linkedRepeat ? 'bg-emerald-500' : 'bg-gray-300'}`}
                                        ></div>
                                    </label>
                                </div>
                                <span className="font-medium" style={{ color: 'var(--text-color)' }}>تفعيل التكرار المترابط</span>
                            </div>

                            {/* Pause Length */}
                            <div className="flex items-center justify-between p-4" style={{ borderColor: 'var(--card-border)' }}>
                                <div className="flex items-center gap-4 rounded-xl p-1 shadow-sm border" style={{ backgroundColor: theme.bgColor, borderColor: 'var(--card-border)' }}>
                                    <button 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setPauseLength(prev => Math.max(0, prev - 1));
                                        }} 
                                        className="w-10 h-10 flex items-center justify-center text-white rounded-lg active:scale-90 transition-transform cursor-pointer" 
                                        style={{ backgroundColor: theme.btnBg }}
                                    >
                                        <Minus size={20} />
                                    </button>
                                    <span className="font-bold min-w-[30px] text-center text-xl" style={{ color: 'var(--text-color)' }}>{pauseLength}</span>
                                    <span className="text-sm" style={{ color: 'var(--text-color)', opacity: 0.7 }}>مرة</span>
                                    <button 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setPauseLength(prev => prev + 1);
                                        }} 
                                        className="w-10 h-10 flex items-center justify-center text-white rounded-lg active:scale-90 transition-transform cursor-pointer" 
                                        style={{ backgroundColor: theme.btnBg }}
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                                <span className="font-medium" style={{ color: 'var(--text-color)' }}>طول السكتة (بقدر الآية)</span>
                            </div>
                        </div>
                    </div>

                    {/* Test After Session */}
                    <div className="flex items-center justify-between p-4 rounded-2xl border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={testAfterSession} onChange={(e) => setTestAfterSession(e.target.checked)} />
                            <div 
                                className={`w-11 h-6 rounded-full peer peer-focus:outline-none transition-colors after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:-translate-x-full peer-checked:after:border-white ${testAfterSession ? 'bg-emerald-500' : 'bg-gray-300'}`}
                            ></div>
                        </label>
                        <div className="flex items-center gap-2 font-bold text-lg" style={{ color: 'var(--text-color)' }}>
                            <span>اختبار بعد الجلسة</span>
                            <CheckSquare size={24} />
                            <HelpCircle size={18} style={{ color: theme.btnBg || theme.palette[0] }} />
                        </div>
                    </div>
                </main>

                {/* Start Button */}
                <div className="p-4 border-t shrink-0 pb-20 mb-2" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', zIndex: 20 }}>
                    <button 
                        onClick={handleStart}
                        className="w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all active:scale-95 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        ابدأ جلسة التحفيظ
                    </button>
                </div>
            </div>
            
            <BottomBar onHomeClick={() => onNavigate('more-menu')} onThemesClick={() => {}} showThemes={false} />

            {/* Resume Session Modal */}
            {showResumeModal && savedSession && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div className="w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-modal-enter text-center" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', border: `1px solid var(--card-border)` }}>
                        <div className="w-16 h-16 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Play size={32} />
                        </div>
                        <h2 className="text-xl font-bold mb-2">جلسة سابقة متوفرة</h2>
                        <p className="opacity-70 mb-6">
                            تم العثور على جلسة تحفيظ سابقة عند سورة {SURAH_NAMES_AR[savedSession.currentAyah.s - 1]} الآية {savedSession.currentAyah.a}.
                            هل تود الاستمرار من حيث توقفت أم البدء من جديد؟
                        </p>
                        <div className="space-y-3">
                            <button 
                                onClick={() => handleStart(true)}
                                className="w-full py-3 rounded-xl font-bold text-white shadow-md active:scale-95 transition-transform"
                                style={{ backgroundColor: theme.btnBg || '#3b82f6' }}
                            >
                                الاستمرار في الجلسة
                            </button>
                            <button 
                                onClick={() => handleStart(false)}
                                className="w-full py-3 rounded-xl font-bold opacity-70 hover:opacity-100 active:scale-95 transition-transform"
                                style={{ backgroundColor: 'var(--card-border)', color: 'var(--text-color)' }}
                            >
                                البدء من جديد
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Memorization;
