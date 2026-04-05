import React, { useState, useEffect } from 'react';
import { ArrowRight, HelpCircle, Repeat, Play, User, ArrowLeftRight, CheckSquare, Minus, Plus, BookOpen } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import InteractiveBackground from '../components/InteractiveBackground';
import quranData from '../data/quran-tajweed.json';
import { SURAH_NAMES_AR, MEMORIZATION_READERS } from '../components/QuranReader/constants';
import BottomBar from '../components/BottomBar';
import TutorialOverlay, { TutorialStep } from '../components/Tutorial/TutorialOverlay';
import { QuranDownloadModal } from '../components/QuranReader/DownloadModals';
import Toast from '../components/QuranReader/Toast';
import './QuranReader.css';

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
    const [mushafType, setMushafType] = useState<'uthmani' | 'tajweed'>('tajweed');

    const [showHelpModal, setShowHelpModal] = useState(false);
    const [showExplanationModal, setShowExplanationModal] = useState(false);
    const [showResumePrompt, setShowResumePrompt] = useState(false);
    const [savedSession, setSavedSession] = useState<any>(null);
    const [activePicker, setActivePicker] = useState<'range' | 'ayah' | 'pause' | null>(null);
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

    const showToast = (message: string) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    // Load settings from localStorage
    useEffect(() => {
        const savedSettings = localStorage.getItem('memorization_settings_v1');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                setSelectedReader(parsed.reader || MEMORIZATION_READERS[1].id);
                setFromSurah(parsed.fromSurah || 1);
                setFromAyah(parsed.fromAyah || 1);
                setToSurah(parsed.toSurah || 1);
                setToAyah(parsed.toAyah || 7);
                setRangeRepeat(parsed.rangeRepeat || 1);
                setAyahRepeat(parsed.ayahRepeat || 1);
                setLinkedRepeat(parsed.linkedRepeat !== undefined ? parsed.linkedRepeat : true);
                setPauseLength(parsed.pauseLength || 1);
                setTestAfterSession(parsed.testAfterSession || false);
                setMushafType(parsed.mushafType || 'tajweed');
            } catch (e) {
                console.error("Failed to load memorization settings", e);
            }
        }

        // Check for active session
        const session = localStorage.getItem('memorization_session_v1');
        if (session) {
            try {
                const parsed = JSON.parse(session);
                // Only suggest if it's recent (last 24h)
                if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
                    setSavedSession(parsed);
                }
            } catch (e) {}
        }
    }, []);

    // Save settings to localStorage whenever they change
    useEffect(() => {
        const settings = {
            reader: selectedReader,
            fromSurah,
            fromAyah,
            toSurah,
            toAyah,
            rangeRepeat,
            ayahRepeat,
            linkedRepeat,
            pauseLength,
            testAfterSession,
            mushafType
        };
        localStorage.setItem('memorization_settings_v1', JSON.stringify(settings));
    }, [selectedReader, fromSurah, fromAyah, toSurah, toAyah, rangeRepeat, ayahRepeat, linkedRepeat, pauseLength, testAfterSession, mushafType]);

    const handleStart = () => {
        const session = localStorage.getItem('memorization_session_v1');
        if (savedSession && session) {
            setShowResumePrompt(true);
        } else {
            setSavedSession(null);
            startNewSession();
        }
    };

    const startNewSession = () => {
        onNavigate('quran', {
            isMemorization: true,
            mushafType,
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
                testAfterSession,
                mushafType
            }
        });
    };

    const resumeSession = () => {
        onNavigate('quran', {
            isMemorization: true,
            mushafType: savedSession.settings?.mushafType || 'tajweed',
            memorizationSettings: savedSession.settings,
            initialSurah: savedSession.currentAyah.s,
            initialAyah: savedSession.currentAyah.a
        });
    };

    const memorizationTutorialSteps: TutorialStep[] = [
        {
            id: 'reader-select',
            text: 'اختيار القارئ: يمكنك اختيار القارئ المفضل لك من هنا.',
            position: { top: '30%' },
            arrow: 'up',
            selector: '#reader-select-container',
            icon: <User className="w-8 h-8 text-white" />
        },
        {
            id: 'ayah-range',
            text: 'نطاق الآيات: حدد السورة والآية التي تود البدء منها والانتهاء إليها.',
            position: { top: '40%' },
            arrow: 'up',
            selector: '#ayah-range-container',
            icon: <ArrowLeftRight className="w-8 h-8 text-white" />
        },
        {
            id: 'start-btn',
            text: 'بدء الحفظ: اضغط هنا للبدء في جلسة التحفيظ.',
            position: { bottom: '100px' },
            arrow: 'down',
            selector: '#btn-start-memorization',
            icon: <Play className="w-8 h-8 text-white" />
        }
    ];

    const getAyahsCount = (surahNum: number) => {
        return quranData.data.surahs[surahNum - 1]?.ayahs.length || 0;
    };

    const NumberPicker = ({ value, onChange, label }: { value: number, onChange: (v: number) => void, label: string }) => (
        <div className="flex items-center gap-1">
            <div 
                onClick={() => setActivePicker(label as any)}
                className="flex items-center gap-2 rounded-lg p-1 shadow-sm border cursor-pointer hover:bg-black/5 transition-colors" 
                style={{ backgroundColor: theme.bgColor, borderColor: 'var(--card-border)' }}
            >
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onChange(Math.max(1, value - 1));
                    }} 
                    className="w-8 h-8 flex items-center justify-center text-white rounded-md active:scale-90 transition-transform" 
                    style={{ backgroundColor: theme.btnBg }}
                >
                    <Minus size={16} />
                </button>
                <div className="flex flex-col items-center min-w-[32px]">
                    <span className="font-bold text-base" style={{ color: 'var(--text-color)' }}>{value}</span>
                    <span className="text-[9px] opacity-50" style={{ color: 'var(--text-color)' }}>مرة</span>
                </div>
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onChange(value + 1);
                    }} 
                    className="w-8 h-8 flex items-center justify-center text-white rounded-md active:scale-90 transition-transform" 
                    style={{ backgroundColor: theme.btnBg }}
                >
                    <Plus size={16} />
                </button>
            </div>
        </div>
    );

    return (
        <div className="h-screen flex flex-col bg-transparent" style={{ fontFamily: theme.font, color: 'var(--text-color)' }}>
            <div className="relative z-10 flex flex-col h-full">
                <header className="app-top-bar shrink-0 relative z-10">
                    <div className="app-top-bar__inner flex items-center justify-center px-4">
                        <h1 className="app-top-bar__title text-xl font-kufi flex items-center justify-center gap-2">
                            التحفيظ
                        </h1>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-3 space-y-3 hide-scrollbar" dir="rtl">
                    {/* Reader Selection */}
                    <div className="space-y-1.5" id="reader-select-container">
                        <div className="flex items-center justify-start gap-2 font-bold text-base" style={{ color: 'var(--text-color)' }}>
                            <span>اختر اسم القارئ</span>
                            <User size={20} />
                        </div>
                        <div className="relative">
                            <select 
                                id="reader-select"
                                value={selectedReader}
                                onChange={(e) => { setSelectedReader(e.target.value); setSavedSession(null); }}
                                className="w-full p-3 rounded-xl appearance-none outline-none text-right font-medium text-base shadow-sm border"
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
                        {/* Download Button */}
                        <div className="pt-1">
                            <button 
                                onClick={() => setShowDownloadModal(true)} 
                                className="custom-select-display text-[10px] h-9 w-full text-right px-3 flex items-center justify-between themed-card-bg shadow-sm hover:opacity-90 transition-all active:scale-[0.98]"
                                style={{ borderColor: 'var(--card-border)' }}
                            >
                                <div className="flex items-center gap-2">
                                    <span>تحميل القراء</span>
                                    <i className="fa-solid fa-cloud-arrow-down text-emerald-500"></i>
                                </div>
                                <i className="fa-solid fa-chevron-left text-gray-500 text-[10px]"></i>
                            </button>
                        </div>
                    </div>

                    {/* Mushaf Type Selection */}
                    <div className="space-y-1.5" id="mushaf-type-container">
                        <div className="flex items-center justify-start gap-2 font-bold text-base" style={{ color: 'var(--text-color)' }}>
                            <span>نوع المصحف</span>
                            <BookOpen size={20} />
                        </div>
                        <div className="relative">
                            <select 
                                id="mushaf-type-select"
                                value={mushafType}
                                onChange={(e) => { setMushafType(e.target.value as 'uthmani' | 'tajweed'); setSavedSession(null); }}
                                className="w-full p-3 rounded-xl appearance-none outline-none text-right font-medium text-base shadow-sm border"
                                style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', borderColor: 'var(--card-border)' }}
                            >
                                <option value="uthmani">المصحف العادي</option>
                                <option value="tajweed">المصحف المجود</option>
                            </select>
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px]" style={{ borderTopColor: 'var(--text-color)' }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Ayah Range */}
                    <div className="space-y-2" id="ayah-range-container">
                        <div className="flex items-center justify-start gap-2 font-bold text-base" style={{ color: 'var(--text-color)' }}>
                            <span>نطاق الآيات</span>
                            <ArrowLeftRight size={20} />
                        </div>
                        
                        <div className="flex gap-2">
                            {/* From */}
                            <div className="flex-1 p-2.5 rounded-xl border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                                <div className="text-center font-bold mb-2 text-base" style={{ color: 'var(--text-color)' }}>من</div>
                                <div className="space-y-2">
                                    <div className="relative">
                                        <select 
                                            value={fromSurah}
                                            onChange={(e) => {
                                                const newSurah = Number(e.target.value);
                                                setFromSurah(newSurah);
                                                setFromAyah(1);
                                                setToSurah(newSurah);
                                                setToAyah(1);
                                                setSavedSession(null);
                                            }}
                                            className="w-full p-2 border rounded-lg appearance-none outline-none text-center font-medium shadow-sm cursor-pointer text-sm"
                                            style={{ backgroundColor: theme.bgColor, color: 'var(--text-color)', borderColor: 'var(--card-border)' }}
                                        >
                                            {SURAH_NAMES_AR.map((name, i) => (
                                                <option key={i} value={i + 1}>{name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px]" style={{ borderTopColor: 'var(--text-color)' }}></div>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <select 
                                            value={fromAyah}
                                            onChange={(e) => {
                                                setFromAyah(Number(e.target.value));
                                                setSavedSession(null);
                                            }}
                                            className="w-full p-2 border rounded-lg appearance-none outline-none text-center font-medium shadow-sm cursor-pointer text-sm"
                                            style={{ backgroundColor: theme.bgColor, color: 'var(--text-color)', borderColor: 'var(--card-border)' }}
                                        >
                                            {Array.from({ length: getAyahsCount(fromSurah) }).map((_, i) => (
                                                <option key={i} value={i + 1}>الآية {i + 1}</option>
                                            ))}
                                        </select>
                                        <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px]" style={{ borderTopColor: 'var(--text-color)' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* To */}
                            <div className="flex-1 p-2.5 rounded-xl border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                                <div className="text-center font-bold mb-2 text-base" style={{ color: 'var(--text-color)' }}>إلى</div>
                                <div className="space-y-2">
                                    <div className="relative">
                                        <select 
                                            value={toSurah}
                                            onChange={(e) => {
                                                const newSurah = Number(e.target.value);
                                                setToSurah(newSurah);
                                                setToAyah(getAyahsCount(newSurah));
                                                setSavedSession(null);
                                            }}
                                            className="w-full p-2 border rounded-lg appearance-none outline-none text-center font-medium shadow-sm cursor-pointer text-sm"
                                            style={{ backgroundColor: theme.bgColor, color: 'var(--text-color)', borderColor: 'var(--card-border)' }}
                                        >
                                            {SURAH_NAMES_AR.map((name, i) => (
                                                <option key={i} value={i + 1}>{name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px]" style={{ borderTopColor: 'var(--text-color)' }}></div>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <select 
                                            value={toAyah}
                                            onChange={(e) => {
                                                setToAyah(Number(e.target.value));
                                                setSavedSession(null);
                                            }}
                                            className="w-full p-2 border rounded-lg appearance-none outline-none text-center font-medium shadow-sm cursor-pointer text-sm"
                                            style={{ backgroundColor: theme.bgColor, color: 'var(--text-color)', borderColor: 'var(--card-border)' }}
                                        >
                                            {Array.from({ length: getAyahsCount(toSurah) }).map((_, i) => (
                                                <option key={i} value={i + 1}>الآية {i + 1}</option>
                                            ))}
                                        </select>
                                        <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px]" style={{ borderTopColor: 'var(--text-color)' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Repetition Settings */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-start gap-2 font-bold text-base" style={{ color: 'var(--text-color)' }}>
                            <span>إعدادات التكرار</span>
                            <Repeat size={20} />
                        </div>

                        <div className="rounded-xl border divide-y" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                            {/* Range Repeat */}
                            <div className="flex items-center justify-between p-3" style={{ borderColor: 'var(--card-border)' }}>
                                <span className="font-medium text-sm" style={{ color: 'var(--text-color)' }}>تكرار نطاق الآيات</span>
                                <NumberPicker value={rangeRepeat} onChange={(v) => { setRangeRepeat(v); setSavedSession(null); }} label="range" />
                            </div>

                            {/* Ayah Repeat */}
                            <div className="flex items-center justify-between p-3" style={{ borderColor: 'var(--card-border)' }}>
                                <span className="font-medium text-sm" style={{ color: 'var(--text-color)' }}>تكرار الآية الواحدة</span>
                                <NumberPicker value={ayahRepeat} onChange={(v) => { setAyahRepeat(v); setSavedSession(null); }} label="ayah" />
                            </div>

                            {/* Linked Repeat */}
                            <div className="flex items-center justify-between p-3" style={{ borderColor: 'var(--card-border)' }}>
                                <span className="font-medium text-sm" style={{ color: 'var(--text-color)' }}>تفعيل التكرار المترابط</span>
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => setShowExplanationModal(true)}
                                        className="flex items-center gap-1 px-2 py-0.5 border rounded-full text-[10px] hover:bg-black/5 transition-colors" 
                                        style={{ borderColor: 'var(--card-border)', color: 'var(--text-color)' }}
                                    >
                                        توضيح <Play size={12} />
                                    </button>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={linkedRepeat} onChange={(e) => { setLinkedRepeat(e.target.checked); setSavedSession(null); }} />
                                        <div 
                                            className={`w-9 h-5 rounded-full peer peer-focus:outline-none transition-colors after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:-translate-x-full peer-checked:after:border-white ${linkedRepeat ? 'bg-emerald-500' : 'bg-gray-400'}`}
                                        ></div>
                                    </label>
                                </div>
                            </div>

                            {/* Pause Length */}
                            <div className="flex items-center justify-between p-3" style={{ borderColor: 'var(--card-border)' }}>
                                <span className="font-medium text-sm" style={{ color: 'var(--text-color)' }}>طول السكتة (بقدر الآية)</span>
                                <NumberPicker value={pauseLength} onChange={(v) => { setPauseLength(v); setSavedSession(null); }} label="pause" />
                            </div>
                        </div>
                    </div>

                    {/* Test After Session */}
                    <div className="flex items-center justify-between p-3 rounded-xl border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                        <div className="flex items-center gap-2 font-bold text-base" style={{ color: 'var(--text-color)' }}>
                            <span>اختبار بعد الجلسة</span>
                            <CheckSquare size={20} />
                            <HelpCircle 
                                size={16} 
                                onClick={() => setShowHelpModal(true)} 
                                className="cursor-pointer hover:scale-110 transition-transform" 
                                style={{ color: theme.btnBg || theme.palette[0] }} 
                            />
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={testAfterSession} onChange={(e) => { setTestAfterSession(e.target.checked); setSavedSession(null); }} />
                            <div 
                                className={`w-9 h-5 rounded-full peer peer-focus:outline-none transition-colors after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:-translate-x-full peer-checked:after:border-white ${testAfterSession ? 'bg-emerald-500' : 'bg-gray-300'}`}
                            ></div>
                        </label>
                    </div>
                </main>

                {/* Start Button */}
                <div className="p-3 border-t shrink-0 pb-20 mb-2" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', zIndex: 20 }}>
                    <button 
                        onClick={handleStart}
                        className="w-full py-3 rounded-xl font-bold text-base shadow-lg transition-all active:scale-95 bg-emerald-600 hover:bg-emerald-700 text-white"
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

            {/* Resume Session Modal */}
            {showResumePrompt && savedSession && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div className="w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-modal-enter text-center" onClick={e => e.stopPropagation()} style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', border: `1px solid var(--card-border)` }}>
                        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Play size={32} />
                        </div>
                        <h2 className="text-xl font-bold mb-2">جلسة سابقة متوفرة</h2>
                        <p className="opacity-70 mb-6 text-sm leading-relaxed">
                            تم العثور على جلسة تحفيظ سابقة عند سورة {SURAH_NAMES_AR[savedSession.currentAyah.s - 1]} الآية {savedSession.currentAyah.a}.
                            هل تود الاستمرار من حيث توقفت أم البدء من جديد؟
                        </p>
                        <div className="space-y-3">
                            <button 
                                onClick={resumeSession}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md active:scale-95 transition-transform"
                            >
                                الاستمرار في الجلسة
                            </button>
                            <button 
                                onClick={() => {
                                    localStorage.removeItem('memorization_session_v1');
                                    setSavedSession(null);
                                    setShowResumePrompt(false);
                                    startNewSession();
                                }}
                                className="w-full py-3 bg-gray-500/10 hover:bg-gray-500/20 rounded-xl font-bold opacity-70 active:scale-95 transition-transform"
                                style={{ color: 'var(--text-color)' }}
                            >
                                البدء من جديد
                            </button>
                        </div>
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

            <TutorialOverlay tutorialId="memorization-tutorial" steps={memorizationTutorialSteps} />

            {showDownloadModal && (
                <QuranDownloadModal 
                    onClose={() => setShowDownloadModal(false)} 
                    quranData={quranData.data} 
                    showToast={showToast} 
                    isLandscape={false} 
                    readersList={MEMORIZATION_READERS}
                />
            )}
            {toast.show && <Toast message={toast.message} onClose={() => setToast({ show: false, message: '' })} />}
        </div>
    );
};

export default Memorization;
