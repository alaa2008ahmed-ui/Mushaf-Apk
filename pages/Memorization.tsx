import React, { useState, useEffect } from 'react';
import { ArrowRight, HelpCircle, Repeat, Play, User, ArrowLeftRight, CheckSquare, Minus, Plus } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import InteractiveBackground from '../components/InteractiveBackground';
import quranData from '../data/quran-uthmani.json';
import { SURAH_NAMES_AR } from '../components/QuranReader/constants';

interface MemorizationProps {
    onBack: () => void;
    onNavigate: (pageId: string, params?: any) => void;
}

const READERS = [
    { id: 'ar.alafasy', name: 'مشاري العفاسي' },
    { id: 'ar.abdulbasit', name: 'عبد الباسط عبد الصمد' },
    { id: 'ar.husary', name: 'محمود خليل الحصري' },
    { id: 'ar.minshawi', name: 'محمد صديق المنشاوي' },
    { id: 'ar.mahermuaiqly', name: 'ماهر المعيقلي' },
    { id: 'ar.hudhaify', name: 'علي الحذيفي' },
    { id: 'ar.shaatree', name: 'أبو بكر الشاطري' },
    { id: 'ar.ayyoub', name: 'محمد أيوب' },
    { id: 'ar.juhany', name: 'عبد الله الجهني' },
    { id: 'ar.shuraym', name: 'سعود الشريم' },
    { id: 'ar.sudais', name: 'عبد الرحمن السديس' }
];

const Memorization: React.FC<MemorizationProps> = ({ onBack, onNavigate }) => {
    const { theme } = useTheme();
    const [selectedReader, setSelectedReader] = useState(READERS[1].id); // Default to Abdul Basit
    
    const [fromSurah, setFromSurah] = useState(1);
    const [fromAyah, setFromAyah] = useState(1);
    const [toSurah, setToSurah] = useState(1);
    const [toAyah, setToAyah] = useState(7);

    const [rangeRepeat, setRangeRepeat] = useState(1);
    const [ayahRepeat, setAyahRepeat] = useState(1);
    const [linkedRepeat, setLinkedRepeat] = useState(true);
    const [pauseLength, setPauseLength] = useState(1);
    const [testAfterSession, setTestAfterSession] = useState(false);

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

    return (
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white" dir="rtl" style={{ fontFamily: theme.font }}>
            <InteractiveBackground />
            <div className="relative z-10 flex flex-col h-full">
                <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-sm">
                    <button onClick={onBack} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-600 dark:text-gray-300">
                        <ArrowRight size={20} />
                    </button>
                    <h1 className="text-xl font-bold">التحفيظ</h1>
                    <div className="w-10"></div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 space-y-6 hide-scrollbar">
                    {/* Reader Selection */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-end gap-2 text-gray-800 dark:text-gray-200 font-bold text-lg">
                            <span>اختر اسم القارئ</span>
                            <User size={24} />
                        </div>
                        <div className="relative">
                            <select 
                                value={selectedReader}
                                onChange={(e) => setSelectedReader(e.target.value)}
                                className="w-full p-4 bg-white dark:bg-gray-800 border-2 border-blue-100 dark:border-gray-700 rounded-2xl appearance-none outline-none text-right font-medium text-lg shadow-sm"
                            >
                                {READERS.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-gray-600 dark:border-t-gray-400"></div>
                            </div>
                        </div>
                    </div>

                    {/* Ayah Range */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-end gap-2 text-gray-800 dark:text-gray-200 font-bold text-lg">
                            <span>نطاق الآيات</span>
                            <ArrowLeftRight size={24} />
                        </div>
                        
                        <div className="flex gap-4">
                            {/* To */}
                            <div className="flex-1 bg-blue-50/50 dark:bg-gray-800/50 p-4 rounded-2xl border border-blue-100 dark:border-gray-700">
                                <div className="text-center font-bold mb-3 text-lg">إلى</div>
                                <div className="space-y-3">
                                    <div className="relative">
                                        <select 
                                            value={toSurah}
                                            onChange={(e) => {
                                                setToSurah(Number(e.target.value));
                                                setToAyah(1);
                                            }}
                                            className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl appearance-none outline-none text-center font-medium shadow-sm"
                                        >
                                            {SURAH_NAMES_AR.map((name, i) => (
                                                <option key={i} value={i + 1}>{name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-gray-600 dark:border-t-gray-400"></div>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <select 
                                            value={toAyah}
                                            onChange={(e) => setToAyah(Number(e.target.value))}
                                            className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl appearance-none outline-none text-center font-medium shadow-sm"
                                        >
                                            {Array.from({ length: getAyahsCount(toSurah) }).map((_, i) => (
                                                <option key={i} value={i + 1}>الآية {i + 1}</option>
                                            ))}
                                        </select>
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-gray-600 dark:border-t-gray-400"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* From */}
                            <div className="flex-1 bg-blue-50/50 dark:bg-gray-800/50 p-4 rounded-2xl border border-blue-100 dark:border-gray-700">
                                <div className="text-center font-bold mb-3 text-lg">من</div>
                                <div className="space-y-3">
                                    <div className="relative">
                                        <select 
                                            value={fromSurah}
                                            onChange={(e) => {
                                                setFromSurah(Number(e.target.value));
                                                setFromAyah(1);
                                            }}
                                            className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl appearance-none outline-none text-center font-medium shadow-sm"
                                        >
                                            {SURAH_NAMES_AR.map((name, i) => (
                                                <option key={i} value={i + 1}>{name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-gray-600 dark:border-t-gray-400"></div>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <select 
                                            value={fromAyah}
                                            onChange={(e) => setFromAyah(Number(e.target.value))}
                                            className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl appearance-none outline-none text-center font-medium shadow-sm"
                                        >
                                            {Array.from({ length: getAyahsCount(fromSurah) }).map((_, i) => (
                                                <option key={i} value={i + 1}>الآية {i + 1}</option>
                                            ))}
                                        </select>
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-gray-600 dark:border-t-gray-400"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Repetition Settings */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <button className="flex items-center gap-1 px-3 py-1.5 border border-blue-500 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
                                مساعدة <HelpCircle size={16} />
                            </button>
                            <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200 font-bold text-lg">
                                <span>التكرار</span>
                                <Repeat size={24} />
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                            {/* Range Repeat */}
                            <div className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border border-gray-100 dark:border-gray-700">
                                    <button onClick={() => setRangeRepeat(Math.max(1, rangeRepeat - 1))} className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-lg">
                                        <Minus size={18} />
                                    </button>
                                    <span className="font-bold min-w-[30px] text-center">{rangeRepeat}</span>
                                    <span className="text-gray-500 text-sm">مرة</span>
                                    <button onClick={() => setRangeRepeat(rangeRepeat + 1)} className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-lg">
                                        <Plus size={18} />
                                    </button>
                                </div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">تكرار نطاق الآيات</span>
                            </div>

                            {/* Ayah Repeat */}
                            <div className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border border-gray-100 dark:border-gray-700">
                                    <button onClick={() => setAyahRepeat(Math.max(1, ayahRepeat - 1))} className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-lg">
                                        <Minus size={18} />
                                    </button>
                                    <span className="font-bold min-w-[30px] text-center">{ayahRepeat}</span>
                                    <span className="text-gray-500 text-sm">مرة</span>
                                    <button onClick={() => setAyahRepeat(ayahRepeat + 1)} className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-lg">
                                        <Plus size={18} />
                                    </button>
                                </div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">تكرار الآية الواحدة</span>
                            </div>

                            {/* Linked Repeat */}
                            <div className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-4">
                                    <button className="flex items-center gap-1 px-3 py-1 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-full text-sm">
                                        توضيح <Play size={14} />
                                    </button>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={linkedRepeat} onChange={(e) => setLinkedRepeat(e.target.checked)} />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">تفعيل التكرار المترابط</span>
                            </div>

                            {/* Pause Length */}
                            <div className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border border-gray-100 dark:border-gray-700">
                                    <button onClick={() => setPauseLength(Math.max(0, pauseLength - 1))} className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-lg">
                                        <Minus size={18} />
                                    </button>
                                    <span className="font-bold min-w-[30px] text-center">{pauseLength}</span>
                                    <span className="text-gray-500 text-sm">مرة</span>
                                    <button onClick={() => setPauseLength(pauseLength + 1)} className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-lg">
                                        <Plus size={18} />
                                    </button>
                                </div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">طول السكتة (بقدر الآية)</span>
                            </div>
                        </div>
                    </div>

                    {/* Test After Session */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={testAfterSession} onChange={(e) => setTestAfterSession(e.target.checked)} />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                        <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200 font-bold text-lg">
                            <span>اختبار بعد الجلسة</span>
                            <CheckSquare size={24} />
                            <HelpCircle size={18} className="text-yellow-500" />
                        </div>
                    </div>
                </div>

                {/* Start Button */}
                <div className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
                    <button 
                        onClick={handleStart}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-lg transition-colors"
                    >
                        ابدأ جلسة التحفيظ
                    </button>
                    <div className="flex justify-center gap-2 mt-4">
                        <div className="w-12 h-1 bg-blue-600 rounded-full"></div>
                        <div className="w-12 h-1 bg-blue-200 dark:bg-gray-700 rounded-full"></div>
                        <div className="w-12 h-1 bg-blue-200 dark:bg-gray-700 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Memorization;
