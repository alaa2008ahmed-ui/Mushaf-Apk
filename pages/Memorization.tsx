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

    const [showHelpModal, setShowHelpModal] = useState(false);
    const [showExplanationModal, setShowExplanationModal] = useState(false);
    const [activePicker, setActivePicker] = useState<'range' | 'ayah' | 'pause' | null>(null);

    const handleStart = () => {
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
    };

    const getAyahsCount = (surahNum: number) => {
        return quranData.data.surahs[surahNum - 1]?.ayahs.length || 0;
    };

    const NumberPicker = ({ value, onChange, label }: { value: number, onChange: (v: number) => void, label: string }) => (
        <div className="flex items-center gap-2">
            <div 
                onClick={() => setActivePicker(label as any)}
                className="flex items-center gap-4 rounded-xl p-1 shadow-sm border cursor-pointer hover:bg-black/5 transition-colors" 
                style={{ backgroundColor: theme.bgColor, borderColor: 'var(--card-border)' }}
            >
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onChange(Math.max(1, value - 1));
                    }} 
                    className="w-10 h-10 flex items-center justify-center text-white rounded-lg active:scale-90 transition-transform" 
                    style={{ backgroundColor: theme.btnBg }}
                >
                    <Minus size={20} />
                </button>
                <div className="flex flex-col items-center min-w-[40px]">
                    <span className="font-bold text-xl" style={{ color: 'var(--text-color)' }}>{value}</span>
                    <span className="text-[10px] opacity-50" style={{ color: 'var(--text-color)' }}>مرة</span>
                </div>
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onChange(value + 1);
                    }} 
                    className="w-10 h-10 flex items-center justify-center text-white rounded-lg active:scale-90 transition-transform" 
                    style={{ backgroundColor: theme.btnBg }}
                >
                    <Plus size={20} />
                </button>
            </div>
        </div>
    );

    return (
        <div className="h-screen flex flex-col bg-transparent" style={{ fontFamily: theme.font, color: 'var(--text-color)' }}>
            <div className="relative z-10 flex flex-col h-full">
                <header className="app-top-bar shrink-0 relative z-10">
                    <div className="app-top-bar__inner flex items-center justify-center px-4">
                        <h1 className="app-top-bar__title text-2xl font-kufi flex items-center justify-center gap-2">
                            التحفيظ
                        </h1>
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
                        <div className="flex items-center justify-end gap-2 font-bold text-lg" style={{ color: 'var(--text-color)' }}>
                            <span>إعدادات التكرار</span>
                            <Repeat size={24} />
                        </div>

                        <div className="rounded-2xl border divide-y" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                            {/* Range Repeat */}
                            <div className="flex items-center justify-between p-4" style={{ borderColor: 'var(--card-border)' }}>
                                <NumberPicker value={rangeRepeat} onChange={setRangeRepeat} label="range" />
                                <span className="font-medium" style={{ color: 'var(--text-color)' }}>تكرار نطاق الآيات</span>
                            </div>

                            {/* Ayah Repeat */}
                            <div className="flex items-center justify-between p-4" style={{ borderColor: 'var(--card-border)' }}>
                                <NumberPicker value={ayahRepeat} onChange={setAyahRepeat} label="ayah" />
                                <span className="font-medium" style={{ color: 'var(--text-color)' }}>تكرار الآية الواحدة</span>
                            </div>

                            {/* Linked Repeat */}
                            <div className="flex items-center justify-between p-4" style={{ borderColor: 'var(--card-border)' }}>
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => setShowExplanationModal(true)}
                                        className="flex items-center gap-1 px-3 py-1 border rounded-full text-sm hover:bg-black/5 transition-colors" 
                                        style={{ borderColor: 'var(--card-border)', color: 'var(--text-color)' }}
                                    >
                                        توضيح <Play size={14} />
                                    </button>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={linkedRepeat} onChange={(e) => setLinkedRepeat(e.target.checked)} />
                                        <div 
                                            className={`w-11 h-6 rounded-full peer peer-focus:outline-none transition-colors after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:-translate-x-full peer-checked:after:border-white ${linkedRepeat ? 'bg-emerald-500' : 'bg-gray-400'}`}
                                        ></div>
                                    </label>
                                </div>
                                <span className="font-medium" style={{ color: 'var(--text-color)' }}>تفعيل التكرار المترابط</span>
                            </div>

                            {/* Pause Length */}
                            <div className="flex items-center justify-between p-4" style={{ borderColor: 'var(--card-border)' }}>
                                <NumberPicker value={pauseLength} onChange={setPauseLength} label="pause" />
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
                            <HelpCircle 
                                size={18} 
                                onClick={() => setShowHelpModal(true)} 
                                className="cursor-pointer hover:scale-110 transition-transform" 
                                style={{ color: theme.btnBg || theme.palette[0] }} 
                            />
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

            {/* Help Modal */}
            {showHelpModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={() => setShowHelpModal(false)}>
                    <div className="w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-modal-enter text-right" onClick={e => e.stopPropagation()} style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', border: `1px solid var(--card-border)` }}>
                        <h2 className="text-xl font-bold mb-4 border-b pb-2" style={{ borderColor: 'var(--card-border)' }}>دليل التحفيظ</h2>
                        <div className="space-y-4 text-sm leading-relaxed">
                            <p>• <span className="font-bold">تكرار الآية:</span> عدد مرات تكرار كل آية على حدة قبل الانتقال للتالية.</p>
                            <p>• <span className="font-bold">تكرار النطاق:</span> عدد مرات إعادة المجموعة كاملة بعد الانتهاء منها.</p>
                            <p>• <span className="font-bold">التكرار المترابط:</span> يقوم بتكرار الآية السابقة مع الحالية لربط الحفظ.</p>
                            <p>• <span className="font-bold">السكتة:</span> فترة صمت بعد كل آية لتعطيك فرصة للترديد خلف القارئ.</p>
                        </div>
                        <button onClick={() => setShowHelpModal(false)} className="w-full mt-6 py-3 rounded-xl font-bold text-white" style={{ backgroundColor: theme.btnBg }}>فهمت</button>
                    </div>
                </div>
            )}

            {/* Explanation Modal */}
            {showExplanationModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={() => setShowExplanationModal(false)}>
                    <div className="w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-modal-enter text-right" onClick={e => e.stopPropagation()} style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', border: `1px solid var(--card-border)` }}>
                        <h2 className="text-xl font-bold mb-4 border-b pb-2" style={{ borderColor: 'var(--card-border)' }}>التكرار المترابط</h2>
                        <p className="text-sm leading-relaxed mb-6">
                            هذه الميزة تساعدك على ربط الآيات ببعضها. عند تفعيلها، سيقوم التطبيق بتشغيل الآية السابقة مرة واحدة قبل البدء بتكرار الآية الحالية، مما يرسخ تسلسل الآيات في ذاكرتك.
                        </p>
                        <button onClick={() => setShowExplanationModal(false)} className="w-full py-3 rounded-xl font-bold text-white" style={{ backgroundColor: theme.btnBg }}>إغلاق</button>
                    </div>
                </div>
            )}

            {/* Number Picker Modal */}
            {activePicker && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={() => setActivePicker(null)}>
                    <div className="w-full max-w-xs rounded-3xl p-6 shadow-2xl animate-modal-enter text-center" onClick={e => e.stopPropagation()} style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', border: `1px solid var(--card-border)` }}>
                        <h2 className="text-xl font-bold mb-4">اختر عدد المرات</h2>
                        <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto p-2 hide-scrollbar">
                            {Array.from({ length: 50 }).map((_, i) => (
                                <button 
                                    key={i}
                                    onClick={() => {
                                        const val = i + 1;
                                        if (activePicker === 'range') setRangeRepeat(val);
                                        else if (activePicker === 'ayah') setAyahRepeat(val);
                                        else if (activePicker === 'pause') setPauseLength(val);
                                        setActivePicker(null);
                                    }}
                                    className="aspect-square flex items-center justify-center rounded-xl border font-bold hover:bg-black/5 transition-colors"
                                    style={{ 
                                        borderColor: 'var(--card-border)',
                                        backgroundColor: (activePicker === 'range' ? rangeRepeat : activePicker === 'ayah' ? ayahRepeat : pauseLength) === i + 1 ? theme.btnBg : 'transparent',
                                        color: (activePicker === 'range' ? rangeRepeat : activePicker === 'ayah' ? ayahRepeat : pauseLength) === i + 1 ? '#fff' : 'var(--text-color)'
                                    }}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--card-border)' }}>
                            <p className="text-xs opacity-50 mb-2">أو أدخل الرقم يدوياً</p>
                            <input 
                                type="number" 
                                className="w-full p-3 rounded-xl border text-center font-bold outline-none"
                                style={{ backgroundColor: theme.bgColor, color: 'var(--text-color)', borderColor: 'var(--card-border)' }}
                                value={activePicker === 'range' ? rangeRepeat : activePicker === 'ayah' ? ayahRepeat : pauseLength}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value) || 1;
                                    if (activePicker === 'range') setRangeRepeat(val);
                                    else if (activePicker === 'ayah') setAyahRepeat(val);
                                    else if (activePicker === 'pause') setPauseLength(val);
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && setActivePicker(null)}
                                autoFocus
                            />
                        </div>
                        <button onClick={() => setActivePicker(null)} className="w-full mt-4 py-3 rounded-xl font-bold text-white" style={{ backgroundColor: theme.btnBg }}>تأكيد</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Memorization;
