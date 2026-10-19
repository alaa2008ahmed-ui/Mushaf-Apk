import React, { useState, useEffect, FC } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import ThemePageLock from '../components/ThemePageLock';
import { 
    umrahVirtues, umrahGeneralInfo, umrahSteps, hajjTypes, 
    hajjTamattuPlan, hajjIfradPlan, hajjQiranPlan, hajjGeneralInfo, 
    allDuaas, homeScreenAdditions 
} from '../data/hajjUmrahData';
import { 
    umrahVirtuesEn, umrahGeneralInfoEn, umrahStepsEn, 
    hajjGeneralInfoEn, hajjTypesEn, 
    hajjTamattuPlanEn, hajjIfradPlanEn, hajjQiranPlanEn 
} from '../data/hajjUmrahDataEn';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { motion, AnimatePresence } from 'motion/react';
import { 
    ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Map, Heart, Compass, 
    BookOpen, Info, ShieldAlert, ListChecks, Plus, Minus, RotateCcw, Tent,
    ZoomIn, ZoomOut, CheckCircle2, Circle, ArrowLeft, Footprints,
    Ban, HelpCircle, MapPin, Sparkles, Scale, AlertTriangle, ScrollText, Home,
    Copy, Check
} from 'lucide-react';
import { getTawafCounterState, saveTawafCounterState, subscribeTawafCounter } from '../utils/tawafCounterStorage';
import { 
    tHajj, getDuaaEnglish, CHECKLIST_ITEMS_EN, 
    DUAA_CATEGORY_TITLES_EN, HOME_ADDITIONS_EN 
} from '../utils/hajjUmrahTranslations';

interface DuaaSectionProps {
    id: number;
    title: string;
    items: string[];
    isOpen: boolean;
    onToggle: () => void;
    onZoom: (item: string) => void;
    cardBorderColor?: string;
}

const DuaaSection: FC<DuaaSectionProps> = ({ id, title, items, isOpen, onToggle, onZoom, cardBorderColor }) => {
    const { language, isRTL } = useLanguage();
    const isEn = language === 'en';
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(0);
        }
    }, [isOpen]);

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentIndex < items.length - 1) setCurrentIndex(i => i + 1);
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentIndex > 0) setCurrentIndex(i => i - 1);
    };

    const displayTitle = isEn ? (DUAA_CATEGORY_TITLES_EN[id] || title) : title;
    const currentArabicItem = items[currentIndex] || '';
    const currentEnglishTranslation = getDuaaEnglish(currentArabicItem);

    return (
        <div id={`duaa-section-${id}`} className="themed-card rounded-2xl overflow-hidden mb-3 backdrop-blur-sm" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
            <button 
                type="button"
                onClick={onToggle} 
                className="w-full flex justify-between items-center p-4 bg-white/10 dark:bg-gray-800/50 hover:bg-white/20 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
                <span className={`font-bold text-base md:text-lg ${isEn ? 'text-left' : 'text-right'}`} style={{ color: 'var(--text-color)' }}>
                    {displayTitle}
                </span>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-5 h-5 opacity-70" style={{ color: 'var(--text-color)' }} />
                </motion.div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: 'auto', opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 bg-white/10 dark:bg-gray-900/20">
                            <div className="flex flex-col gap-4 p-5 rounded-xl bg-white/10 dark:bg-gray-800/40 shadow-sm relative min-h-[160px] justify-center items-center text-center" style={{ borderColor: cardBorderColor, borderWidth: '1px', borderStyle: 'solid' }}>
                                <span className={`absolute top-3 ${isRTL ? 'right-4' : 'left-4'} text-xs font-bold opacity-60 font-mono`} style={{ color: 'var(--text-color)' }}>
                                    {currentIndex + 1} / {items.length}
                                </span>
                                <button 
                                    type="button"
                                    onClick={() => onZoom(currentArabicItem)} 
                                    className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'} p-2 shrink-0 opacity-70 hover:opacity-100 transition-opacity rounded-full dark:hover:bg-gray-700 cursor-pointer`} 
                                    title={tHajj('zoomModalTitle', language)}
                                    style={{ color: 'var(--text-color)' }}
                                >
                                    <ZoomIn className="w-5 h-5" />
                                </button>
                                
                                <div className="mt-6 mb-2 space-y-3 w-full">
                                    {isEn ? (
                                        <p className="text-sm md:text-base leading-relaxed text-emerald-800 dark:text-emerald-300 font-medium px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-start">
                                            {currentEnglishTranslation}
                                        </p>
                                    ) : (
                                        <p className="text-lg md:text-xl leading-loose font-amiri font-bold" style={{ color: 'var(--text-color)' }}>
                                            {currentArabicItem}
                                        </p>
                                    )}
                                </div>
                                
                                <div className="flex w-full justify-between items-center mt-2 border-t border-black/10 dark:border-white/10 pt-3">
                                    <button 
                                        type="button"
                                        onClick={handleNext}
                                        disabled={currentIndex === items.length - 1}
                                        className="p-2 px-3 rounded-lg bg-black/5 dark:bg-white/10 disabled:opacity-30 hover:bg-black/10 dark:hover:bg-white/20 transition-colors flex items-center gap-1.5 cursor-pointer font-bold text-xs sm:text-sm"
                                        style={{ color: 'var(--text-color)' }}
                                    >
                                        {!isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                                        <span>{tHajj('nextDuaa', language)}</span>
                                    </button>
                                    
                                    <button 
                                        type="button"
                                        onClick={handlePrev}
                                        disabled={currentIndex === 0}
                                        className="p-2 px-3 rounded-lg bg-black/5 dark:bg-white/10 disabled:opacity-30 hover:bg-black/10 dark:hover:bg-white/20 transition-colors flex items-center gap-1.5 cursor-pointer font-bold text-xs sm:text-sm"
                                        style={{ color: 'var(--text-color)' }}
                                    >
                                        <span>{tHajj('prevDuaa', language)}</span>
                                        {!isRTL ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ChecklistScreen = ({ theme, cardBorderColor }: { theme: any, cardBorderColor?: string }) => {
    const { language, isRTL } = useLanguage();
    const isEn = language === 'en';
    const isBlackTheme = theme.bgColor === '#000000';
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const saved = localStorage.getItem('hajjUmrahChecklist');
        if (saved) {
            try { setCheckedItems(JSON.parse(saved)); } catch (e) {}
        }
    }, []);

    const toggleItem = (id: string) => {
        const newItems = { ...checkedItems, [id]: !checkedItems[id] };
        setCheckedItems(newItems);
        localStorage.setItem('hajjUmrahChecklist', JSON.stringify(newItems));
    };

    const categories = [
        {
            title: tHajj('checklistCatEssentials', language),
            items: [
                { id: '1', ar: "ملابس الإحرام (إزار ورداء / ملابس واسعة)" },
                { id: '2', ar: "حذاء خفيف ومريح" },
                { id: '3', ar: "حقيبة صغيرة لحفظ الأوراق والمال" },
                { id: '4', ar: "مقص صغير / ماكينة حلاقة" },
                { id: '5', ar: "أدوية شخصية ومسكنات" },
                { id: '6', ar: "مظلة شمسية" }
            ]
        },
        {
            title: tHajj('checklistCatGeneral', language),
            items: [
                { id: '7', ar: "كتيب أذكار / مصحف جيب / سبحة" },
                { id: '8', ar: "ملابس قطنية مريحة" },
                { id: '9', ar: "مناديل مبللة وجافة (بدون عطر)" },
                { id: '10', ar: "شاحن هاتف ومخزن طاقة" },
                { id: '11', ar: "نظارة شمسية" },
                { id: '12', ar: "سجادة صلاة خفيفة" }
            ]
        }
    ];

    return (
        <section className="space-y-4">
            <div className="rounded-2xl p-4 text-center backdrop-blur-sm" style={{ backgroundColor: isBlackTheme ? 'rgba(255,255,255,0.05)' : `${theme.palette[0]}15`, borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: isBlackTheme ? '#FFFFFF' : `${theme.palette[0]}20` }}>
                    <ListChecks className="w-6 h-6" style={{ color: isBlackTheme ? '#000000' : theme.palette[0] }} />
                </div>
                <p className="text-sm opacity-80 font-medium" style={{ color: 'var(--text-color)' }}>
                    {tHajj('checklistHeader', language)}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((cat, i) => (
                    <div key={i} className="themed-card backdrop-blur-md rounded-xl p-3" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                        <h3 className="font-bold text-base mb-2 border-b pb-1 text-start" style={{ color: isBlackTheme ? '#FFFFFF' : theme.palette[0], borderColor: isBlackTheme ? 'rgba(255,255,255,0.2)' : `${theme.palette[0]}20` }}>
                            {cat.title}
                        </h3>
                        <div className="space-y-1.5">
                            {cat.items.map(item => {
                                const itemText = isEn ? (CHECKLIST_ITEMS_EN[item.id] || item.ar) : item.ar;
                                return (
                                    <button 
                                        key={item.id} 
                                        type="button"
                                        onClick={() => toggleItem(item.id)}
                                        className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/40 dark:hover:bg-gray-700 transition-all border border-transparent cursor-pointer"
                                        style={{ borderColor: checkedItems[item.id] ? (isBlackTheme ? 'rgba(255,255,255,0.3)' : `${theme.palette[0]}20`) : 'transparent' }}
                                    >
                                        <div className={`shrink-0 w-4 h-4 rounded-md flex items-center justify-center transition-colors ${checkedItems[item.id] ? '' : 'border-2 border-gray-300/50 dark:border-gray-600'}`}
                                             style={{ backgroundColor: checkedItems[item.id] ? (isBlackTheme ? '#FFFFFF' : theme.palette[0]) : 'transparent' }}>
                                            {checkedItems[item.id] && <CheckCircle2 size={10} className={isBlackTheme ? "text-black" : "text-white"} />}
                                        </div>
                                        <span className={`text-sm text-start leading-relaxed font-medium transition-opacity flex-1 ${checkedItems[item.id] ? 'opacity-40 line-through' : ''}`} style={{ color: 'var(--text-color)' }}>
                                            {itemText}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

const CountersScreen = ({ theme, cardBorderColor }: { theme: any, cardBorderColor?: string }) => {
    const { language, isRTL } = useLanguage();
    const isEn = language === 'en';
    const isBlackTheme = theme.bgColor === '#000000';
    const [state, setState] = useState(getTawafCounterState());

    useEffect(() => {
        return subscribeTawafCounter((updated) => {
            setState(updated);
        });
    }, []);

    const currentCount = state.activeTab === 'tawaf' ? state.tawafCount : state.saiCount;
    const isComplete = currentCount >= 7;

    const increment = () => {
        if (currentCount >= 7) return;
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            try { navigator.vibrate(40); } catch {}
        }
        saveTawafCounterState(prev => {
            if (prev.activeTab === 'tawaf') {
                return { ...prev, tawafCount: Math.min(7, prev.tawafCount + 1) };
            } else {
                return { ...prev, saiCount: Math.min(7, prev.saiCount + 1) };
            }
        });
    };

    const decrement = () => {
        if (currentCount <= 0) return;
        saveTawafCounterState(prev => {
            if (prev.activeTab === 'tawaf') {
                return { ...prev, tawafCount: Math.max(0, prev.tawafCount - 1) };
            } else {
                return { ...prev, saiCount: Math.max(0, prev.saiCount - 1) };
            }
        });
    };

    const reset = () => {
        saveTawafCounterState(prev => {
            if (prev.activeTab === 'tawaf') {
                return { ...prev, tawafCount: 0 };
            } else {
                return { ...prev, saiCount: 0 };
            }
        });
    };

    const toggleHomeVisibility = () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            try { navigator.vibrate(30); } catch {}
        }
        saveTawafCounterState(prev => ({
            ...prev,
            showOnHome: !prev.showOnHome
        }));
    };

    const switchTab = (tab: 'tawaf' | 'sai') => {
        saveTawafCounterState({ activeTab: tab });
    };

    return (
        <section className="space-y-4">
            {/* Header info & Home toggle button */}
            <div 
                className="backdrop-blur-md rounded-2xl p-4 text-center transition-all" 
                style={{ 
                    backgroundColor: isBlackTheme ? 'rgba(255,255,255,0.05)' : `${theme.palette[0]}15`, 
                    borderColor: cardBorderColor, 
                    borderWidth: '1.5px', 
                    borderStyle: 'solid' 
                }}
            >
                <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: isBlackTheme ? '#FFFFFF' : `${theme.palette[0]}20` }}>
                    <RotateCcw className="w-6 h-6" style={{ color: isBlackTheme ? '#000000' : theme.palette[0] }} />
                </div>
                <h3 className="font-bold text-base mb-1" style={{ color: isBlackTheme ? '#FFFFFF' : theme.palette[0] }}>
                    {tHajj('counterHeaderTitle', language)}
                </h3>
                <p className="text-xs opacity-75 mb-3" style={{ color: 'var(--text-color)' }}>
                    {tHajj('counterHeaderDesc', language)}
                </p>

                {/* Toggle button */}
                <button
                    type="button"
                    onClick={toggleHomeVisibility}
                    className={`w-full p-3 rounded-xl border-2 flex items-center justify-between transition-all active:scale-[0.98] cursor-pointer ${
                        state.showOnHome 
                            ? (isBlackTheme ? 'bg-white/10 border-white' : 'border-emerald-500 bg-emerald-500/10') 
                            : 'bg-black/5 dark:bg-white/5 border-dashed border-gray-400/40 hover:border-gray-400'
                    }`}
                >
                    <div className="flex items-center gap-2.5 text-start">
                        <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{
                                backgroundColor: state.showOnHome 
                                    ? (isBlackTheme ? '#FFFFFF' : theme.palette[0]) 
                                    : 'rgba(150,150,150,0.15)',
                                color: state.showOnHome 
                                    ? (isBlackTheme ? '#000000' : '#FFFFFF') 
                                    : 'var(--text-color)'
                            }}
                        >
                            <Home size={18} />
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-xs md:text-sm" style={{ color: isBlackTheme ? '#FFFFFF' : theme.textColor }}>
                                    {tHajj('counterShowOnHome', language)}
                                </span>
                                {state.showOnHome ? (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500 text-white shadow-sm">
                                        {tHajj('counterEnabled', language)}
                                    </span>
                                ) : (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-gray-400/20 text-gray-500 dark:text-gray-400">
                                        {tHajj('counterDisabled', language)}
                                    </span>
                                )}
                            </div>
                            <span className="text-[11px] opacity-70 block text-start mt-0.5" style={{ color: 'var(--text-color)' }}>
                                {state.showOnHome 
                                    ? tHajj('counterHomeActiveDesc', language)
                                    : tHajj('counterHomeInactiveDesc', language)}
                            </span>
                        </div>
                    </div>

                    {/* Toggle Knob */}
                    <div 
                        className={`w-12 h-6.5 rounded-full p-1 transition-all flex items-center shrink-0 ${
                            state.showOnHome 
                                ? 'justify-end' 
                                : 'justify-start bg-gray-300 dark:bg-gray-700'
                        }`}
                        style={{
                            backgroundColor: state.showOnHome ? (isBlackTheme ? '#FFFFFF' : theme.palette[0]) : undefined
                        }}
                    >
                        <div 
                            className="w-4.5 h-4.5 rounded-full transition-all shadow-md"
                            style={{
                                backgroundColor: state.showOnHome && isBlackTheme ? '#000000' : '#FFFFFF'
                            }}
                        />
                    </div>
                </button>
            </div>

            {/* Tawaf vs Sa'i switch */}
            <div className="flex bg-white/10 dark:bg-gray-800/50 backdrop-blur-xl p-1 rounded-2xl" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                <button 
                    type="button"
                    onClick={() => switchTab('tawaf')} 
                    className={`flex-1 py-2 rounded-xl font-bold transition-all cursor-pointer text-xs sm:text-sm ${state.activeTab === 'tawaf' ? (isBlackTheme ? 'text-black shadow-lg' : 'text-white shadow-lg') : 'opacity-60'}`}
                    style={{ 
                        backgroundColor: state.activeTab === 'tawaf' ? (isBlackTheme ? '#FFFFFF' : theme.palette[0]) : 'transparent',
                        color: state.activeTab === 'tawaf' ? (isBlackTheme ? 'black' : 'white') : 'var(--text-color)' 
                    }}
                >
                    {tHajj('tabTawaf', language)} ({state.tawafCount}/7)
                </button>
                <button 
                    type="button"
                    onClick={() => switchTab('sai')} 
                    className={`flex-1 py-2 rounded-xl font-bold transition-all cursor-pointer text-xs sm:text-sm ${state.activeTab === 'sai' ? (isBlackTheme ? 'text-black shadow-lg' : 'text-white shadow-lg') : 'opacity-60'}`}
                    style={{ 
                        backgroundColor: state.activeTab === 'sai' ? (isBlackTheme ? '#FFFFFF' : theme.palette[0]) : 'transparent',
                        color: state.activeTab === 'sai' ? (isBlackTheme ? 'black' : 'white') : 'var(--text-color)' 
                    }}
                >
                    {tHajj('tabSai', language)} ({state.saiCount}/7)
                </button>
            </div>

            {/* Circular Counter Box */}
            <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl p-5 flex flex-col items-center justify-center shadow-xl min-h-[240px]" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                {/* 7 Laps progress bar */}
                <div className="w-full max-w-xs flex items-center justify-between gap-1.5 mb-4 px-1">
                    {[1, 2, 3, 4, 5, 6, 7].map((lap) => {
                        const isPassed = lap <= currentCount;
                        const isCurrent = lap === currentCount + 1 && !isComplete;
                        return (
                            <div key={lap} className="flex-1 flex flex-col items-center gap-1">
                                <div 
                                    className={`w-full h-3.5 rounded-full transition-all duration-300 ${
                                        isPassed 
                                            ? 'shadow-sm' 
                                            : isCurrent 
                                            ? 'ring-2 ring-amber-400 ring-offset-1 animate-pulse shadow-sm' 
                                            : 'bg-black/10 dark:bg-white/10 opacity-30'
                                    }`}
                                    style={{
                                        backgroundColor: isPassed 
                                            ? (isBlackTheme ? '#FFFFFF' : theme.palette[0]) 
                                            : isCurrent 
                                            ? '#f59e0b' 
                                            : undefined
                                    }}
                                />
                                <span className={`text-[10px] font-mono font-bold ${isPassed || isCurrent ? 'opacity-90' : 'opacity-40'}`} style={{ color: 'var(--text-color)' }}>
                                    {lap}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* SVG Progress Circle */}
                <div className="relative mb-5">
                     <svg className="w-32 h-32 transform -rotate-90">
                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="5" fill="none" className="text-white/10 dark:text-gray-700" />
                        <circle cx="64" cy="64" r="58" stroke={isBlackTheme ? '#FFFFFF' : theme.palette[0]} strokeWidth="5" fill="none" strokeDasharray="364.4" strokeDashoffset={364.4 - (364.4 * currentCount) / 7} style={{ transition: 'stroke-dashoffset 0.5s ease' }} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                         <span className="text-3xl font-bold font-mono" style={{ color: theme.isDark ? '#ffffff' : (isBlackTheme ? '#FFFFFF' : theme.palette[0]), textShadow: isBlackTheme ? '0 0 20px rgba(255,255,255,0.3)' : `0 0 20px ${theme.palette[0]}4D` }}>
                             {currentCount}
                         </span>
                         <span className="text-[10px] font-bold mt-0.5 opacity-60" style={{ color: 'var(--text-color)' }}>
                             {tHajj('ofSevenLaps', language)}
                         </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2.5 w-full max-w-xs">
                    <button 
                        type="button"
                        onClick={reset} 
                        title={tHajj('resetCounterTooltip', language)} 
                        className="p-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all border border-white/10 flex items-center justify-center active:scale-95 cursor-pointer"
                    >
                        <RotateCcw size={18} style={{ color: 'var(--text-color)' }} />
                    </button>

                    <button 
                        type="button"
                        onClick={decrement}
                        disabled={currentCount <= 0}
                        title={tHajj('decreaseCounterTooltip', language)} 
                        className={`p-3 bg-white/10 rounded-xl font-bold transition-all border border-white/10 flex items-center justify-center active:scale-95 cursor-pointer ${currentCount <= 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/20'}`}
                    >
                        <Minus size={18} style={{ color: 'var(--text-color)' }} />
                    </button>

                    <button 
                        type="button"
                        onClick={increment} 
                        disabled={isComplete} 
                        className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-base shadow-lg cursor-pointer ${
                            isComplete 
                                ? 'bg-emerald-600 text-white cursor-default' 
                                : 'active:scale-95 text-white'
                        }`}
                        style={{ 
                            backgroundColor: isComplete ? '#16a34a' : (isBlackTheme ? '#FFFFFF' : theme.palette[0]), 
                            color: (isComplete ? '#FFFFFF' : (isBlackTheme ? '#000000' : 'white')) 
                        }}
                    >
                        {isComplete ? <CheckCircle2 size={20} /> : <Plus size={20} />}
                        <span className="text-sm font-bold">
                            {isComplete ? tHajj('sevenLapsCompleted', language) : tHajj('nextLapBtn', language)}
                        </span>
                    </button>
                </div>
            </div>
        </section>
    );
};

export function HajjUmrah({ onBack, onNavigate }: { onBack: () => void; onNavigate: (pageId: string) => void }) {
    const { theme, themeKey } = useTheme();
    const { language, isRTL, dir } = useLanguage();
    const isEn = language === 'en';

    const isBlackTheme = theme.bgColor === '#000000' || theme.name === 'أبيض وأسود';
    const isDefaultTheme = themeKey === 'default' || !themeKey;
    const cardBorderColor = isDefaultTheme 
        ? '#000000' 
        : (isBlackTheme 
            ? '#FFFFFF' 
            : (theme.palette?.[0] || '#000000'));

    const [screen, setScreen] = useState<'home' | 'umrah' | 'hajj' | 'duaa' | 'checklist' | 'counters'>('home');
    const [hajjType, setHajjType] = useState<'tamattu' | 'ifrad' | 'qiran'>('tamattu');
    const [selectedDetail, setSelectedDetail] = useState<any>(null);
    const [openDuaaId, setOpenDuaaId] = useState<number | null>(1);
    const [zoomedDuaa, setZoomedDuaa] = useState<{ text: string } | null>(null);
    const [zoomFontSize, setZoomFontSize] = useState<number>(30);
    const [copySuccess, setCopySuccess] = useState(false);

    const handleDuaaToggle = (id: number) => {
        setOpenDuaaId(prevId => prevId === id ? null : id);
    };

    const openZoomModal = (text: string) => setZoomedDuaa({ text });
    const closeZoomModal = () => {
        setZoomedDuaa(null);
        setCopySuccess(false);
    };

    const handleCopyDuaa = () => {
        if (!zoomedDuaa) return;
        const textToCopy = isEn 
            ? getDuaaEnglish(zoomedDuaa.text)
            : zoomedDuaa.text;
        navigator.clipboard.writeText(textToCopy);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    useEffect(() => {
        const interceptor = () => {
            if (zoomedDuaa) {
                closeZoomModal();
                return true;
            }
            if (selectedDetail) {
                setSelectedDetail(null);
                return true;
            }
            if (screen !== 'home') {
                setScreen('home');
                return true;
            }
            return false;
        };

        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [screen, zoomedDuaa, selectedDetail]);

    const handleBack = () => {
        if (selectedDetail) {
            setSelectedDetail(null);
        } else if (zoomedDuaa) {
            closeZoomModal();
        } else if (screen !== 'home') {
            setScreen('home');
        } else {
            onBack();
        }
    };

    const handleGoHome = () => {
        if (selectedDetail) setSelectedDetail(null);
        if (zoomedDuaa) closeZoomModal();
        if (screen !== 'home') setScreen('home');
        onNavigate('home');
    };

    const getScreenTitle = () => {
        switch (screen) {
            case 'umrah': return tHajj('screenUmrahTitle', language);
            case 'hajj': return tHajj('screenHajjTitle', language);
            case 'duaa': return tHajj('screenDuaaTitle', language);
            case 'checklist': return tHajj('screenChecklistTitle', language);
            case 'counters': return tHajj('screenCountersTitle', language);
            default: return tHajj('appTitle', language);
        }
    };

    const renderScreen = () => {
        switch (screen) {
            case 'umrah': return <UmrahScreen key="umrah" theme={theme} onSelectDetail={setSelectedDetail} cardBorderColor={cardBorderColor} />;
            case 'hajj': return <HajjScreen key="hajj" hajjType={hajjType} setHajjType={setHajjType} theme={theme} onSelectDetail={setSelectedDetail} cardBorderColor={cardBorderColor} />;
            case 'duaa': return <DuaaScreen key="duaa" theme={theme} openDuaaId={openDuaaId} onToggle={handleDuaaToggle} onZoom={openZoomModal} cardBorderColor={cardBorderColor} />;
            case 'checklist': return <ChecklistScreen key="checklist" theme={theme} cardBorderColor={cardBorderColor} />;
            case 'counters': return <CountersScreen key="counters" theme={theme} cardBorderColor={cardBorderColor} />;
            default: return <HomeScreen key="home" setScreen={setScreen} theme={theme} cardBorderColor={cardBorderColor} />;
        }
    };

    return (
        <div className="h-screen flex flex-col bg-transparent" dir={dir}>
            <header className="app-top-bar">
                <div className="app-top-bar__inner">
                    <div className="relative flex items-center justify-center w-full min-h-[44px]">
                        {/* Back Arrow */}
                        <div className={`absolute ${isRTL ? 'right-0' : 'left-0'} flex items-center`}>
                            <button
                                type="button"
                                onClick={handleBack}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title={tHajj('back', language)}
                                aria-label={tHajj('back', language)}
                            >
                                <i className={`fa-solid ${isRTL ? 'fa-arrow-right' : 'fa-arrow-left'} text-xl`}></i>
                            </button>
                        </div>

                        {/* Screen Title */}
                        <div className="text-center px-12 min-w-0">
                            <h1 className="app-top-bar__title text-lg sm:text-xl font-kufi truncate">
                                {getScreenTitle()}
                            </h1>
                        </div>

                        {/* Home Button */}
                        <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} flex items-center gap-1`}>
                            {screen === 'home' && <ThemePageLock />}
                            <button
                                type="button"
                                onClick={handleGoHome}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title={tHajj('home', language)}
                                aria-label={tHajj('home', language)}
                            >
                                <i className="fa-solid fa-house text-xl"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="w-full max-w-4xl mx-auto px-4 pt-2 flex-1 overflow-y-auto pb-6">
                {renderScreen()}
                <div className="w-full h-6 shrink-0"></div>
            </main>

            {/* Selected Detail Modal */}
            {selectedDetail && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-3 md:p-4 overflow-hidden" onClick={() => setSelectedDetail(null)}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="themed-card w-full max-w-xl rounded-3xl overflow-hidden flex flex-col max-h-[88vh] shadow-2xl"
                        style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-5 border-b border-white/10 flex items-center justify-between" style={{ backgroundColor: isDefaultTheme ? 'rgba(0,0,0,0.05)' : `${theme.palette[0]}15` }}>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0" style={{ backgroundColor: isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : `${theme.palette[0]}30`), color: isBlackTheme ? '#000000' : (isDefaultTheme ? '#FFFFFF' : theme.palette[0]) }}>
                                    {selectedDetail.icon || <Info />}
                                </div>
                                <div className="text-start">
                                    <h3 className="text-lg md:text-xl font-bold leading-tight" style={{ color: 'var(--text-color)' }}>
                                        {selectedDetail.title}
                                    </h3>
                                    {selectedDetail.subtitle && (
                                        <p className="text-xs opacity-75 mt-0.5" style={{ color: 'var(--text-color)' }}>
                                            {selectedDetail.subtitle}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setSelectedDetail(null)} 
                                className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition cursor-pointer"
                            >
                                <RotateCcw size={18} className="rotate-45" style={{ color: 'var(--text-color)' }} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-start">
                            {/* Quranic Verse Callout */}
                            {(selectedDetail.quranAyah || selectedDetail.evidence || (selectedDetail.quranEvidence && selectedDetail.quranEvidence.length > 0)) && (
                                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 dark:bg-amber-950/20">
                                    <div className="flex items-center gap-2 mb-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
                                        <BookOpen size={16} />
                                        <span>{tHajj('quranEvidenceSection', language)}</span>
                                    </div>
                                    {selectedDetail.quranAyah && (
                                        <p className={`text-base md:text-lg leading-relaxed text-amber-900 dark:text-amber-200 ${isEn ? 'font-sans font-medium' : 'font-amiri font-bold'}`}>
                                            {selectedDetail.quranAyah}
                                        </p>
                                    )}
                                    {selectedDetail.evidence && !selectedDetail.quranAyah && (
                                        <p className={`text-sm md:text-base leading-relaxed text-amber-900 dark:text-amber-200 ${isEn ? 'font-sans font-medium' : 'font-amiri font-bold'}`}>
                                            {selectedDetail.evidence}
                                        </p>
                                    )}
                                    {selectedDetail.quranEvidence && selectedDetail.quranEvidence.map((ev: string, idx: number) => (
                                        <p key={idx} className={`text-base leading-relaxed text-amber-900 dark:text-amber-200 mt-1 ${isEn ? 'font-sans font-medium' : 'font-amiri font-bold'}`}>
                                            {ev}
                                        </p>
                                    ))}
                                </div>
                            )}

                            {/* Hadith Callout */}
                            {(selectedDetail.hadith || (selectedDetail.sunnahEvidence && selectedDetail.sunnahEvidence.length > 0)) && (
                                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 dark:bg-emerald-950/20">
                                    <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                                        <ScrollText size={16} />
                                        <span>{tHajj('sunnahEvidenceSection', language)}</span>
                                    </div>
                                    {selectedDetail.hadith && (
                                        <p className={`text-sm md:text-base leading-relaxed text-emerald-950 dark:text-emerald-200 ${isEn ? 'font-sans font-medium' : 'font-amiri'}`}>
                                            {selectedDetail.hadith}
                                        </p>
                                    )}
                                    {selectedDetail.sunnahEvidence && selectedDetail.sunnahEvidence.map((ev: string, idx: number) => (
                                        <p key={idx} className={`text-sm md:text-base leading-relaxed text-emerald-950 dark:text-emerald-200 mt-2 ${isEn ? 'font-sans font-medium' : 'font-amiri'}`}>
                                            {ev}
                                        </p>
                                    ))}
                                </div>
                            )}

                            {/* Fiqhi Definition or Summary */}
                            {(selectedDetail.definition || selectedDetail.description) && (
                                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 dark:bg-blue-950/20">
                                    <div className="flex items-center gap-2 mb-1.5 text-blue-600 dark:text-blue-400 font-bold text-xs">
                                        <Info size={16} />
                                        <span>{tHajj('fiqhDefSection', language)}</span>
                                    </div>
                                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-color)' }}>
                                        {selectedDetail.definition || selectedDetail.description}
                                    </p>
                                </div>
                            )}

                            {/* Hady ruling */}
                            {selectedDetail.hadyRuling && (
                                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 dark:bg-purple-950/20">
                                    <div className="flex items-center gap-2 mb-1.5 text-purple-600 dark:text-purple-400 font-bold text-xs">
                                        <Scale size={16} />
                                        <span>{tHajj('hadyRulingSection', language)}</span>
                                    </div>
                                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-color)' }}>
                                        {selectedDetail.hadyRuling}
                                    </p>
                                </div>
                            )}

                            {/* Who is it for */}
                            {selectedDetail.whoIsItFor && (
                                <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 dark:bg-teal-950/20">
                                    <div className="flex items-center gap-2 mb-1.5 text-teal-600 dark:text-teal-400 font-bold text-xs">
                                        <MapPin size={16} />
                                        <span>{tHajj('whoIsItForSection', language)}</span>
                                    </div>
                                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-color)' }}>
                                        {selectedDetail.whoIsItFor}
                                    </p>
                                </div>
                            )}

                            {/* Fiqh Comparison */}
                            {selectedDetail.comparison && (
                                <div className="p-4 rounded-2xl bg-white/5 dark:bg-black/20 border border-white/10 space-y-2">
                                    <h4 className="font-bold text-xs flex items-center gap-2" style={{ color: isBlackTheme ? '#FFFFFF' : theme.palette[0] }}>
                                        <Scale size={16} /> {tHajj('comparisonSummarySection', language)}
                                    </h4>
                                    <div className="grid grid-cols-1 gap-2 text-xs">
                                        <div className="p-2 rounded-lg bg-white/5"><span className="font-bold">{tHajj('compIhram', language)}: </span>{selectedDetail.comparison.ihram}</div>
                                        <div className="p-2 rounded-lg bg-white/5"><span className="font-bold">{tHajj('compTahallul', language)}: </span>{selectedDetail.comparison.tahallul}</div>
                                        <div className="p-2 rounded-lg bg-white/5"><span className="font-bold">{tHajj('compTawaf', language)}: </span>{selectedDetail.comparison.tawaf}</div>
                                        <div className="p-2 rounded-lg bg-white/5"><span className="font-bold">{tHajj('compSai', language)}: </span>{selectedDetail.comparison.sai}</div>
                                        <div className="p-2 rounded-lg bg-white/5"><span className="font-bold">{tHajj('compHady', language)}: </span>{selectedDetail.comparison.hady}</div>
                                    </div>
                                </div>
                            )}

                            {/* Raw HTML text */}
                            {selectedDetail.text && (
                                <div className="text-base leading-relaxed font-medium" 
                                     style={{ color: 'var(--text-color)' }} 
                                     dangerouslySetInnerHTML={{ __html: selectedDetail.text.replaceAll('{{THEME_PALETTE_0}}', theme.palette[0]) }}>
                                </div>
                            )}

                            {/* Step points / Actions */}
                            {(selectedDetail.points || selectedDetail.actions || selectedDetail.detailedSteps) && (
                                <div className="space-y-2">
                                    <h4 className="font-bold text-xs flex items-center gap-2 mb-2" style={{ color: isBlackTheme ? '#FFFFFF' : theme.palette[0] }}>
                                        <ListChecks size={16} /> {tHajj('practicalStepsSection', language)}
                                    </h4>
                                    <ul className="space-y-2.5">
                                        {(selectedDetail.points || selectedDetail.actions || selectedDetail.detailedSteps).map((point: string, i: number) => (
                                            <li key={i} className="flex gap-3 p-3.5 rounded-xl bg-white/5 dark:bg-black/20 border border-white/10">
                                                <div className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm" style={{ backgroundColor: isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : theme.palette[0]), color: isBlackTheme ? '#000000' : '#FFFFFF' }}>
                                                    {i + 1}
                                                </div>
                                                <p className="flex-1 text-sm leading-relaxed" style={{ color: 'var(--text-color)' }} dangerouslySetInnerHTML={{ __html: point }}></p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Sunan */}
                            {selectedDetail.sunan && selectedDetail.sunan.length > 0 && (
                                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 dark:bg-emerald-950/10 space-y-2">
                                    <h4 className="font-bold text-xs flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                        <Sparkles size={16} /> {tHajj('sunnahEtiquetteSection', language)}
                                    </h4>
                                    <ul className="space-y-1.5 text-xs">
                                        {selectedDetail.sunan.map((item: string, i: number) => (
                                            <li key={i} className="flex gap-2 items-start" style={{ color: 'var(--text-color)' }}>
                                                <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                                                <span className="leading-relaxed">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Mistakes to avoid */}
                            {selectedDetail.mistakes && selectedDetail.mistakes.length > 0 && (
                                <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 dark:bg-orange-950/20 space-y-2">
                                    <h4 className="font-bold text-xs flex items-center gap-2 text-orange-600 dark:text-orange-400">
                                        <AlertTriangle size={16} /> {tHajj('commonMistakesSection', language)}
                                    </h4>
                                    <ul className="space-y-1.5 text-xs">
                                        {selectedDetail.mistakes.map((item: string, i: number) => (
                                            <li key={i} className="flex gap-2 items-start" style={{ color: 'var(--text-color)' }}>
                                                <ShieldAlert size={14} className="text-orange-500 shrink-0 mt-0.5" />
                                                <span className="leading-relaxed">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Footer Button */}
                        <div className="p-4 bg-white/5 border-t border-white/10">
                            <button 
                                type="button"
                                onClick={() => setSelectedDetail(null)} 
                                className="w-full py-3.5 rounded-2xl font-bold shadow-lg active:scale-[0.98] transition-all cursor-pointer"
                                style={{ backgroundColor: isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : theme.palette[0]), color: isBlackTheme ? '#000000' : '#FFFFFF' }}
                            >
                                {tHajj('understoodBtn', language)}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Magnifier / Zoom Modal for Adhkar & Supplications */}
            {zoomedDuaa && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[70] flex justify-center items-center p-3 md:p-4 overflow-hidden" onClick={closeZoomModal}>
                    <div 
                        className="themed-card p-5 sm:p-7 rounded-3xl w-full max-w-2xl text-center relative flex flex-col max-h-[90vh] shadow-2xl" 
                        style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }} 
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Top Bar with Font Size Controls & Copy */}
                        <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10 flex-wrap gap-2">
                            <div className="flex items-center gap-2 font-bold text-sm">
                                <Sparkles className="w-4 h-4 text-amber-500" />
                                <span>{tHajj('zoomModalTitle', language)}</span>
                            </div>

                            {/* Magnification Toolbar */}
                            <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/10 p-1 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setZoomFontSize(prev => Math.min(prev + 4, 52))}
                                    className="p-1.5 px-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/20 transition-all font-bold text-xs flex items-center gap-1 cursor-pointer"
                                    title={tHajj('zoomIn', language)}
                                >
                                    <ZoomIn size={14} />
                                    <span>+</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setZoomFontSize(prev => Math.max(prev - 4, 18))}
                                    className="p-1.5 px-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/20 transition-all font-bold text-xs flex items-center gap-1 cursor-pointer"
                                    title={tHajj('zoomOut', language)}
                                >
                                    <ZoomOut size={14} />
                                    <span>-</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setZoomFontSize(30)}
                                    className="p-1.5 px-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/20 transition-all font-bold text-[10px] cursor-pointer"
                                    title={tHajj('zoomReset', language)}
                                >
                                    {tHajj('zoomReset', language)}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCopyDuaa}
                                    className="p-1.5 px-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/20 transition-all font-bold text-xs flex items-center gap-1 text-emerald-600 dark:text-emerald-400 cursor-pointer"
                                    title={tHajj('copyDuaa', language)}
                                >
                                    {copySuccess ? <Check size={14} /> : <Copy size={14} />}
                                </button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="overflow-y-auto custom-scrollbar flex-1 py-4 px-2 space-y-4">
                            {isEn ? (
                                <div className="p-4 sm:p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-start space-y-2">
                                    <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <BookOpen size={14} />
                                        <span>{tHajj('translationLabel', language)}</span>
                                    </div>
                                    <p 
                                        className="leading-relaxed font-medium select-text text-emerald-950 dark:text-emerald-100" 
                                        style={{ fontSize: `${Math.max(16, zoomFontSize - 4)}px` }}
                                    >
                                        {getDuaaEnglish(zoomedDuaa.text)}
                                    </p>
                                </div>
                            ) : (
                                <p 
                                    className="leading-relaxed font-amiri font-bold select-text" 
                                    style={{ fontSize: `${zoomFontSize}px`, color: 'var(--text-color)' }}
                                >
                                    {zoomedDuaa.text}
                                </p>
                            )}

                            {copySuccess && (
                                <p className="text-xs font-bold text-emerald-500 animate-pulse">
                                    {tHajj('copiedSuccess', language)}
                                </p>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="mt-4 shrink-0 pt-2 border-t border-white/10">
                            <button 
                                type="button"
                                onClick={closeZoomModal} 
                                className="w-full py-3 rounded-xl font-bold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:opacity-90 transition-opacity cursor-pointer"
                            >
                                {tHajj('closeBtn', language)}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const HomeScreen = ({ setScreen, theme, cardBorderColor }: { setScreen: any, theme: any, cardBorderColor?: string }) => {
    const { language, isRTL } = useLanguage();
    const isEn = language === 'en';
    const { themeKey } = useTheme();
    const isBlackTheme = theme.bgColor === '#000000';
    const isDefaultTheme = themeKey === 'default' || theme.name?.includes('الافتراضي') || (!themeKey && theme.palette[0] === '#10b981');

    const additions = isEn ? HOME_ADDITIONS_EN : homeScreenAdditions;

    return (
     <section id="home-screen" className="space-y-4">
        <div className="grid grid-cols-2 gap-3 md:gap-4">
            {[
                { id: 'umrah', icon: <Compass size={20} />, label: tHajj('cardUmrah', language) },
                { id: 'hajj', icon: <Tent size={20} />, label: tHajj('cardHajj', language) },
                { id: 'counters', icon: <RotateCcw size={20} />, label: tHajj('cardCounters', language) },
                { id: 'duaa', icon: <BookOpen size={20} />, label: tHajj('cardDuaa', language) }
            ].map(item => (
                <button 
                    key={item.id}
                    type="button"
                    onClick={() => setScreen(item.id)} 
                    className="group relative flex flex-col items-center justify-center p-4 rounded-xl bg-white/10 dark:bg-white/5 backdrop-blur-xl shadow-lg hover:bg-white/20 transition-all duration-300 cursor-pointer"
                    style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                >
                    <div className="relative z-10 w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-inner border border-black/5" 
                         style={{ 
                            backgroundColor: isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#FFFFFF' : `${theme.palette[0]}20`), 
                            color: isBlackTheme ? '#000000' : (isDefaultTheme ? '#000000' : theme.palette[0]) 
                         }}>
                        {item.icon}
                    </div>
                    <h2 className="relative z-10 font-bold text-sm mt-2 text-center" style={{ color: 'var(--text-color)' }}>
                        {item.label}
                    </h2>
                </button>
            ))}
            
            <button 
                type="button"
                onClick={() => setScreen('checklist')} 
                className="group relative flex flex-col items-center justify-center p-4 rounded-xl bg-white/10 dark:bg-white/5 backdrop-blur-xl shadow-lg hover:bg-white/20 transition-all duration-300 col-span-2 cursor-pointer"
                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
            >
                <div className="relative z-10 w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-inner border border-black/5" 
                     style={{ 
                        backgroundColor: isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#FFFFFF' : `${theme.palette[0]}20`), 
                        color: isBlackTheme ? '#000000' : (isDefaultTheme ? '#000000' : theme.palette[0]) 
                     }}>
                    <ListChecks size={20} />
                </div>
                <h2 className="relative z-10 font-bold text-sm mt-2 text-center" style={{ color: 'var(--text-color)' }}>
                    {tHajj('cardChecklist', language)}
                </h2>
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {additions.map((item, index) => {
                let IconComponent = Info;
                if (item.icon === 'fa-gem') IconComponent = BookOpen;
                if (item.icon === 'fa-ban') IconComponent = Ban;
                if (item.icon === 'fa-map-location-dot') IconComponent = MapPin;
                if (item.icon === 'fa-circle-question') IconComponent = HelpCircle;

                return (
                 <div key={index} className="bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-xl p-4 shadow-lg text-start" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                    <h3 className="font-bold text-base mb-2 flex items-center gap-2" style={{color: (isBlackTheme ? '#FFFFFF' : (theme.name === 'أبيض وأسود' ? theme.textColor : theme.palette[index % theme.palette.length]))}}>
                        <IconComponent size={16} />
                        <span>{item.title}</span>
                    </h3>
                    {item.type === 'hadith' ? (
                        <p className={`text-xs leading-relaxed ${isRTL ? 'pr-3 border-r-2' : 'pl-3 border-l-2'} font-medium`} style={{ color: 'var(--text-color)', borderColor: isBlackTheme ? '#FFFFFF' : theme.palette[0] }}>
                            {item.content[0]}
                        </p>
                    ) : (
                        <ul className="space-y-1.5 opacity-90 mt-2">
                            {item.content.map((point, pi) => (
                                <li key={pi} className="flex gap-2 items-start text-xs font-medium" style={{ color: 'var(--text-color)' }}>
                                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 opacity-60" style={{ backgroundColor: isBlackTheme ? '#FFFFFF' : theme.palette[0] }}></div>
                                    <span className="flex-1 leading-relaxed opacity-85">{point}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                 </div>
                );
            })}
             <div className="col-span-1 md:col-span-2 bg-orange-500/5 dark:bg-orange-900/10 rounded-xl p-4 backdrop-blur-md text-start" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                <h3 className="font-bold text-orange-600 dark:text-orange-400 mb-1 flex items-center gap-2 text-base">
                    <ShieldAlert size={16} />
                    <span>{isEn ? 'Important Warning' : 'تنبيه هام'}</span>
                </h3>
                <p className="leading-relaxed text-xs" style={{ color: 'var(--text-color)' }}>
                    {isEn 
                        ? 'Omitting a pillar invalidates the ritual, whereas omitting an obligation requires a sacrificial penalty (dam), and committing prohibitions incurs an expiation (fidyah).' 
                        : 'ترك ركن يبطل النسك، أما ترك واجب فيُجبر بدم، وارتكاب المحظورات يوجب الفدية.'}
                </p>
            </div>
        </div>
    </section>
    );
};

const UmrahScreen = ({ theme, onSelectDetail, cardBorderColor }: { theme: any, onSelectDetail: any, cardBorderColor?: string }) => {
    const { language, isRTL } = useLanguage();
    const isEn = language === 'en';
    const { themeKey } = useTheme();
    const isBlackTheme = theme.bgColor === '#000000';
    const isDefaultTheme = themeKey === 'default' || theme.name?.includes('الافتراضي') || (!themeKey && theme.palette[0] === '#10b981');
    const [showVirtues, setShowVirtues] = useState(false);

    const virtuesList = isEn ? umrahVirtuesEn : umrahVirtues;
    const generalInfo = isEn ? umrahGeneralInfoEn : umrahGeneralInfo;
    const stepsList = isEn ? umrahStepsEn : umrahSteps;

    return (
     <section id="umrah-screen" className="space-y-4">
        {/* Intro Banner */}
        <div className="rounded-2xl p-4 text-center backdrop-blur-sm shadow-md" 
             style={{ backgroundColor: isBlackTheme ? 'rgba(255,255,255,0.05)' : (isDefaultTheme ? 'rgba(0,0,0,0.05)' : `${theme.palette[0]}15`), borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
            <p className="font-amiri text-base font-bold text-amber-700 dark:text-amber-300">
                {tHajj('umrahIntroVerse', language)}
            </p>
            <p className="text-xs opacity-75 mt-1" style={{ color: 'var(--text-color)' }}>
                {tHajj('umrahIntroDesc', language)}
            </p>
        </div>

        {/* Card: Virtues */}
        <div className="themed-card rounded-2xl overflow-hidden backdrop-blur-md shadow-md" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
            <button 
                type="button"
                onClick={() => setShowVirtues(!showVirtues)}
                className="w-full p-3.5 flex items-center justify-between transition-colors bg-white/5 hover:bg-white/10 text-start cursor-pointer"
            >
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: isBlackTheme ? '#FFFFFF' : `${theme.palette[0]}25`, color: isBlackTheme ? '#000000' : theme.palette[0] }}>
                        <Sparkles size={16} />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm" style={{ color: 'var(--text-color)' }}>
                            {tHajj('umrahVirtuesTitle', language)}
                        </h3>
                        <p className="text-[11px] opacity-70">
                            {tHajj('umrahVirtuesSubtitle', language)}
                        </p>
                    </div>
                </div>
                {showVirtues ? <ChevronUp size={18} style={{ color: 'var(--text-color)' }} /> : <ChevronDown size={18} style={{ color: 'var(--text-color)' }} />}
            </button>

            {showVirtues && (
                <div className="p-3.5 border-t border-white/10 space-y-3 bg-black/10 text-start">
                    {virtuesList.map((v, i) => (
                        <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold" style={{ color: isBlackTheme ? '#FFFFFF' : theme.palette[0] }}>{v.title}</span>
                                <span className="text-[10px] opacity-60 font-mono">{v.source}</span>
                            </div>
                            <p className={`text-sm font-semibold text-amber-600 dark:text-amber-300 ${isEn ? 'font-sans' : 'font-amiri'}`}>{v.text}</p>
                            <p className="text-xs opacity-80 leading-relaxed" style={{ color: 'var(--text-color)' }}>{v.explanation}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* General Info Grid: Arkan, Wajibat, Sunan, Mufsidat */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            <button 
                type="button"
                onClick={() => onSelectDetail({
                    icon: '🕌',
                    title: isEn ? 'The Three Pillars of Umrah' : 'أركان العمرة الثلاثة',
                    subtitle: isEn ? 'Umrah is invalid without them and cannot be compensated by animal sacrifice' : 'لا تصح العمرة إلا بها ولا تُجبر بدم بإجماع العلماء',
                    points: generalInfo.arkan,
                    quranAyah: isEn ? '﴿ And complete the Hajj and \'Umrah for Allah ﴾ [Al-Baqarah: 196]' : '﴿ وَأَتِمُّوا الْحَجَّ وَالْعُمْرَةَ لِلَّهِ ﴾ [البقرة: 196]، وقوله تعالى: ﴿ وَلْيَطَّوَّفُوا بِالْبَيْتِ الْعَتِيقِ ﴾ [الحج: 29]',
                    hadith: isEn ? 'The Prophet ﷺ said: «Actions are judged by intentions», and: «Perform Sa\'i, for Allah has prescribed Sa\'i upon you»' : 'قال رسول الله ﷺ: «إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ» وقال: «اسْعَوْا فَإِنَّ اللهَ كَتَبَ عَلَيْكُمُ السَّعْيَ»'
                })}
                className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-md rounded-xl p-3 text-start hover:bg-white/20 transition-all group cursor-pointer" 
                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
            >
                <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs" style={{ color: isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : theme.palette[0]) }}>
                        {tHajj('pillarsLabel', language)} (3)
                    </span>
                    <CheckCircle2 size={14} className="opacity-70" />
                </div>
                <p className="text-[10px] opacity-75 line-clamp-2" style={{ color: 'var(--text-color)' }}>
                    {isEn ? 'Ihram, Tawaf (7 circuits), Sa\'i (7 laps)' : 'الإحرام، الطواف 7 أشواط، السعي 7 أشواط'}
                </p>
            </button>

            <button 
                type="button"
                onClick={() => onSelectDetail({
                    icon: '📜',
                    title: isEn ? 'Obligations of Umrah (Wajibat)' : 'واجبات العمرة',
                    subtitle: isEn ? 'Omitting an obligation requires a sacrificial penalty (dam) and Umrah remains valid' : 'من ترك واجباً لزمه دم (شاة) وعمرته صحيحة',
                    points: generalInfo.wajibat,
                    hadith: isEn ? 'The Prophet ﷺ said: «These boundaries are for their people and whoever passes them...» and: «O Allah, have mercy on those who shave their heads»' : 'قال رسول الله ﷺ: «هُنَّ لَهُنَّ، وَلِمَنْ أَتَى عَلَيْهِنَّ...» وقال: «اللَّهُمَّ ارْحَمِ المُحَلِّقِينَ»'
                })}
                className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-md rounded-xl p-3 text-start hover:bg-white/20 transition-all group cursor-pointer" 
                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
            >
                <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs" style={{ color: isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : theme.palette[0]) }}>
                        {tHajj('obligationsLabel', language)} (2)
                    </span>
                    <ListChecks size={14} className="opacity-70" />
                </div>
                <p className="text-[10px] opacity-75 line-clamp-2" style={{ color: 'var(--text-color)' }}>
                    {isEn ? 'Ihram from the Miqat, Shaving or Trimming hair' : 'الإحرام من الميقات، الحلق أو التقصير'}
                </p>
            </button>

            <button 
                type="button"
                onClick={() => onSelectDetail({
                    icon: '✨',
                    title: isEn ? 'Prophetic Sunnahs of Umrah' : 'سنن وآداب العمرة النبوية',
                    subtitle: isEn ? 'Recommended acts that multiply rewards in following the Prophet ﷺ' : 'أعمال مستحبة تزيد في الأجر والاقتداء بالنبي ﷺ',
                    points: generalInfo.sunan,
                    hadith: isEn ? 'The Messenger of Allah ﷺ frequently chanted the Talbiyah, uncovered his right shoulder, and quickened his pace in the first three circuits of Tawaf.' : 'كان رسول الله ﷺ يكثر من التلبية ويضطبع ويرمل في الثلاثة أشواط الأولى في طواف العمرة'
                })}
                className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-md rounded-xl p-3 text-start hover:bg-white/20 transition-all group cursor-pointer" 
                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
            >
                <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs" style={{ color: isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : theme.palette[0]) }}>
                        {tHajj('sunnahsLabel', language)} (8)
                    </span>
                    <Sparkles size={14} className="opacity-70" />
                </div>
                <p className="text-[10px] opacity-75 line-clamp-2" style={{ color: 'var(--text-color)' }}>
                    {isEn ? 'Ghusl, Perfume, Talbiyah, Ramal, Idtiba\'...' : 'الغسل، الطيب، التلبية، الرمل، الاضطباع...'}
                </p>
            </button>

            <button 
                type="button"
                onClick={() => onSelectDetail({
                    icon: '⚠️',
                    title: isEn ? 'Prohibitions & Nullifiers of Umrah' : 'مفسدات ومحظورات العمرة',
                    subtitle: isEn ? 'Acts that invalidate Umrah or incur an expiation' : 'أعمال تبطل العمرة أو توجب الفدية',
                    points: generalInfo.mufsidat,
                    quranAyah: isEn ? '﴿ So whoever has made Hajj obligatory upon himself therein, there is [to be for him] no sexual relations and no disobedience and no disputing during Hajj ﴾ [Al-Baqarah: 197]' : '﴿ فَمَن فَرَضَ فِيهِنَّ الْحَجَّ فَلَا رَفَثَ وَلَا فُسُوقَ وَلَا جِدَالَ فِي الْحَجِّ ﴾ [البقرة: 197]'
                })}
                className="bg-orange-500/10 dark:bg-orange-950/30 backdrop-blur-md rounded-xl p-3 text-start hover:bg-orange-500/20 transition-all group cursor-pointer" 
                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
            >
                <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-orange-600 dark:text-orange-400">
                        {tHajj('prohibitionsLabel', language)} (3)
                    </span>
                    <ShieldAlert size={14} className="text-orange-500" />
                </div>
                <p className="text-[10px] opacity-75 line-clamp-2" style={{ color: 'var(--text-color)' }}>
                    {isEn ? 'Marital relations before Tahallul, missing a pillar...' : 'الجماع قبل التحلل، ترك ركن، ارتكاب المحظورات'}
                </p>
            </button>
        </div>

        {/* 9 Steps */}
        <div className="space-y-3">
            <h3 className="text-base font-bold flex items-center gap-2 text-start" style={{ color: 'var(--text-color)' }}>
                <Compass className="w-5 h-5" style={{ color: isBlackTheme ? '#FFFFFF' : theme.palette[0] }} />
                <span>{tHajj('umrahStepsSectionTitle', language)}</span>
            </h3>
            {stepsList.map((step) => (
                <button 
                    key={step.title} 
                    type="button"
                    onClick={() => onSelectDetail(step)}
                    className="w-full text-start themed-card backdrop-blur-md rounded-2xl p-4 flex items-center gap-3.5 hover:shadow-lg transition-all active:scale-[0.982] group cursor-pointer"
                    style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                >
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-sm md:text-base leading-snug" style={{ color: 'var(--text-color)' }}>
                                {step.title}
                            </h4>
                        </div>
                        {step.subtitle && (
                            <p className="text-xs opacity-75 mt-0.5 truncate" style={{ color: 'var(--text-color)' }}>
                                {step.subtitle}
                            </p>
                        )}
                        <div className="flex gap-2 mt-2 flex-wrap text-[10px]">
                            {step.quranAyah && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-medium">
                                    {tHajj('quranProofBadge', language)}
                                </span>
                            )}
                            {step.hadith && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-medium">
                                    {tHajj('sunnahProofBadge', language)}
                                </span>
                            )}
                            {step.points && (
                                <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300 font-medium">
                                    {step.points.length} {tHajj('fiqhPointsBadge', language)}
                                </span>
                            )}
                        </div>
                    </div>

                    {!isRTL ? (
                        <ChevronRight size={18} className="opacity-30 group-hover:opacity-60 transition-opacity shrink-0" style={{ color: 'var(--text-color)' }} />
                    ) : (
                        <ChevronLeft size={18} className="opacity-30 group-hover:opacity-60 transition-opacity shrink-0" style={{ color: 'var(--text-color)' }} />
                    )}
                </button>
            ))}
        </div>
    </section>
    );
};

const HajjScreen = ({ hajjType, setHajjType, theme, onSelectDetail, cardBorderColor }: { hajjType: any, setHajjType: any, theme: any, onSelectDetail: any, cardBorderColor?: string }) => {
    const { language, isRTL } = useLanguage();
    const isEn = language === 'en';
    const { themeKey } = useTheme();
    const isBlackTheme = theme.bgColor === '#000000';
    const isDefaultTheme = themeKey === 'default' || theme.name?.includes('الافتراضي') || (!themeKey && theme.palette[0] === '#10b981');

    const typesMap = isEn ? hajjTypesEn : hajjTypes;
    const currentType = typesMap[hajjType];
    const generalInfo = isEn ? hajjGeneralInfoEn : hajjGeneralInfo;
    const tamattuPlan = isEn ? hajjTamattuPlanEn : hajjTamattuPlan;
    const ifradPlan = isEn ? hajjIfradPlanEn : hajjIfradPlan;
    const qiranPlan = isEn ? hajjQiranPlanEn : hajjQiranPlan;

    return (
     <section id="hajj-screen" className="space-y-4">
        {/* Quran Intro Banner */}
        <div className="rounded-2xl p-4 text-center backdrop-blur-sm shadow-md"
             style={{ backgroundColor: isDefaultTheme ? 'rgba(0,0,0,0.05)' : `${theme.palette[0]}15`, borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
            <p className="font-amiri text-base font-bold text-amber-700 dark:text-amber-300">
                {tHajj('hajjIntroVerse', language)}
            </p>
            <p className="text-xs opacity-75 mt-1" style={{ color: 'var(--text-color)' }}>
                {tHajj('hajjIntroHadith', language)}
            </p>
        </div>

        {/* General Info Grid: Arkan, Wajibat, Sunan, Mufsidat */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            <button 
                type="button"
                onClick={() => onSelectDetail({
                    icon: '🕋',
                    title: isEn ? 'The Four Pillars of Hajj' : 'أركان الحج الأربعة',
                    subtitle: isEn ? 'Hajj is invalid without them and missing one cannot be compensated by animal sacrifice' : 'لا يصح الحج إلا بها جميعاً، وفوات واحد منها يبطل الحج ولا يُجبر بدم',
                    points: generalInfo.arkan,
                    quranAyah: isEn ? '﴿ And let them circumambulate the Ancient House ﴾ [Al-Hajj: 29]' : '﴿ وَلْيَطَّوَّفُوا بِالْبَيْتِ الْعَتِيقِ ﴾ [الحج: 29]',
                    hadith: isEn ? 'The Messenger of Allah ﷺ said: «Hajj is Arafat», and: «Perform Sa\'i, for Allah has prescribed Sa\'i upon you»' : 'قال رسول الله ﷺ: «الحَجُّ عَرَفَةُ» وقال: «اسْعَوْا فَإِنَّ اللهَ كَتَبَ عَلَيْكُمُ السَّعْيَ»'
                })}
                className="themed-card backdrop-blur-md rounded-xl p-3 text-start hover:bg-white/20 transition-all group cursor-pointer"
                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
            >
                <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs" style={{ color: isDefaultTheme ? '#000000' : theme.palette[0] }}>
                        {tHajj('pillarsLabel', language)} (4)
                    </span>
                    <CheckCircle2 size={14} className="opacity-70" />
                </div>
                <p className="text-[10px] opacity-75 line-clamp-2" style={{ color: 'var(--text-color)' }}>
                    {isEn ? 'Ihram, Arafat, Tawaf Al-Ifadah, Sa\'i' : 'الإحرام، عرفة، طواف الإفاضة، السعي'}
                </p>
            </button>

            <button 
                type="button"
                onClick={() => onSelectDetail({
                    icon: '📜',
                    title: isEn ? 'The Seven Obligations of Hajj' : 'واجبات الحج السبعة',
                    subtitle: isEn ? 'Omitting one requires an animal sacrifice (dam) slaughtered in Mecca' : 'من ترك واجباً منها لزمه دم (شاة) يذبحها في مكة ويوزعها على فقرائها وحجه صحيح',
                    points: generalInfo.wajibat,
                    hadith: isEn ? 'Ibn Abbas (may Allah be pleased with him) said: «Whoever forgets a rite of his rituals or leaves it must offer a sacrificial blood offering.» [Muwatta Malik]' : 'عن ابن عباس رضي الله عنهما: «مَنْ نَسِيَ مِنْ نُسُكِهِ شَيْئًا أَوْ تَرَكَهُ فَلْيُهْرِقْ دَمًا» [موطأ مالك]'
                })}
                className="themed-card backdrop-blur-md rounded-xl p-3 text-start hover:bg-white/20 transition-all group cursor-pointer"
                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
            >
                <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs" style={{ color: isDefaultTheme ? '#000000' : theme.palette[0] }}>
                        {tHajj('obligationsLabel', language)} (7)
                    </span>
                    <ListChecks size={14} className="opacity-70" />
                </div>
                <p className="text-[10px] opacity-75 line-clamp-2" style={{ color: 'var(--text-color)' }}>
                    {isEn ? 'Miqat, Arafat until sunset, Muzdalifah, Mina, Jamarat, Shaving, Farewell Tawaf' : 'الميقات، الوقوف للمغرب، مزدلفة، منى، الجمار، الحلق، الوداع'}
                </p>
            </button>

            <button 
                type="button"
                onClick={() => onSelectDetail({
                    icon: '✨',
                    title: isEn ? 'Prophetic Sunnahs of Hajj' : 'سنن الحج وآدابه النبوية',
                    subtitle: isEn ? 'Recommended acts that raise status following the Prophet ﷺ' : 'أعمال مستحبة ترفع الدرجات وتكمل الأجر اقتداءً بالنبي ﷺ',
                    points: generalInfo.sunan,
                    hadith: isEn ? 'The Prophet ﷺ said during the Farewell Pilgrimage: «Take your rituals from me, for I do not know if I will perform Hajj after this Hajj of mine.» [Sahih Muslim]' : 'قال رسول الله ﷺ في حجة الوداع: «لِتَأْخُذُوا مَنَاسِكَكُمْ، فَإِنِّي لَا أَدْرِي لَعَلِّي لَا أَحُجُّ بَعْدَ حَجَّتِي هَذِهِ» [صحيح مسلم]'
                })}
                className="themed-card backdrop-blur-md rounded-xl p-3 text-start hover:bg-white/20 transition-all group cursor-pointer"
                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
            >
                <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs" style={{ color: isDefaultTheme ? '#000000' : theme.palette[0] }}>
                        {tHajj('sunnahsLabel', language)} (8)
                    </span>
                    <Sparkles size={14} className="opacity-70" />
                </div>
                <p className="text-[10px] opacity-75 line-clamp-2" style={{ color: 'var(--text-color)' }}>
                    {isEn ? 'Mina overnight on Tarwiyah, Tawaf Al-Qudum, Combining prayers, Talbiyah...' : 'المبيت بمنى ليلة عرفة، طواف القدوم، الجمع بنمرة، التلبية...'}
                </p>
            </button>

            <button 
                type="button"
                onClick={() => onSelectDetail({
                    icon: '⚠️',
                    title: isEn ? 'Prohibitions & Nullifiers of Hajj' : 'مفسدات الحج ومحظوراته',
                    subtitle: isEn ? 'Acts that invalidate Hajj or incur a sacrificial penalty' : 'ما يبطل الحج بالكلية أو يوجب الفدية والدم',
                    points: generalInfo.mufsidat,
                    quranAyah: isEn ? '﴿ Hajj is [during] well-known months, so whoever has made Hajj obligatory upon himself therein, there is [to be for him] no sexual relations and no disobedience and no disputing during Hajj ﴾ [Al-Baqarah: 197]' : '﴿ الْحَجُّ أَشْهُرٌ مَّعْلُومَاتٌ فَمَن فَرَضَ فِيهِنَّ الْحَجَّ فَلَا رَفَثَ وَلَا فُسُوقَ وَلَا جِدَالَ فِي الْحَجِّ ﴾ [البقرة: 197]'
                })}
                className="bg-orange-500/10 dark:bg-orange-950/30 backdrop-blur-md rounded-xl p-3 text-start hover:bg-orange-500/20 transition-all group cursor-pointer"
                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
            >
                <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-orange-600 dark:text-orange-400">
                        {tHajj('prohibitionsLabel', language)} (3)
                    </span>
                    <ShieldAlert size={14} className="text-orange-500" />
                </div>
                <p className="text-[10px] opacity-75 line-clamp-2" style={{ color: 'var(--text-color)' }}>
                    {isEn ? 'Intercourse before Tahallul, missing Arafah, omitting a pillar' : 'الجماع قبل التحلل، فوات عرفة، ترك ركن'}
                </p>
            </button>
        </div>

        {/* Three Types of Hajj */}
        <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
                <h3 className="text-base font-bold flex items-center gap-2 text-start" style={{ color: 'var(--text-color)' }}>
                    <Scale className="w-5 h-5" style={{ color: isBlackTheme ? '#FFFFFF' : theme.palette[0] }} />
                    <span>{tHajj('hajjTypesSectionTitle', language)}</span>
                </h3>
            </div>

            {/* Selector buttons */}
            <div className="grid grid-cols-3 gap-2">
                {Object.keys(typesMap).map(key => {
                    const isSelected = hajjType === key;
                    const typeName = typesMap[key].name;
                    return (
                        <button key={key} type="button" onClick={() => setHajjType(key)} 
                            className={`px-3 py-2.5 rounded-xl font-bold transition-all text-xs md:text-sm flex flex-col items-center gap-1 cursor-pointer ${isSelected ? 'shadow-md scale-[1.02]' : 'bg-white/5 hover:bg-white/10'}`}
                            style={{ 
                                backgroundColor: isSelected ? (isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : theme.palette[0])) : 'transparent',
                                borderColor: isSelected ? (isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : theme.palette[0])) : cardBorderColor,
                                borderWidth: '1.5px',
                                borderStyle: 'solid',
                                color: isSelected ? (isBlackTheme ? '#000000' : '#FFFFFF') : 'var(--text-color)', 
                                opacity: isSelected ? 1 : 0.75 
                            }}
                        >
                            <span>{typeName}</span>
                        </button>
                    );
                })}
            </div>

            {/* Selected type card */}
            {currentType && (
                <div className="themed-card rounded-2xl p-4 md:p-5 backdrop-blur-md shadow-xl border space-y-4 text-start" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/10">
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-lg md:text-xl font-bold" style={{ color: isBlackTheme ? '#FFFFFF' : theme.palette[0] }}>
                                    {currentType.name}
                                </h4>
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                    {currentType.badge}
                                </span>
                            </div>
                            <p className="text-xs opacity-80 mt-1 leading-relaxed" style={{ color: 'var(--text-color)' }}>
                                {currentType.definition}
                            </p>
                        </div>

                        <button 
                            type="button"
                            onClick={() => onSelectDetail({
                                icon: '📖',
                                title: `${currentType.name} - ${isEn ? 'Complete Proof & Steps' : 'الدليل والأحكام الكاملة'}`,
                                subtitle: currentType.badge,
                                definition: currentType.definition,
                                quranEvidence: currentType.quranEvidence,
                                sunnahEvidence: currentType.sunnahEvidence,
                                hadyRuling: currentType.hadyRuling,
                                whoIsItFor: currentType.whoIsItFor,
                                detailedSteps: currentType.detailedSteps,
                                comparison: currentType.comparison
                            })}
                            className="shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                            style={{ 
                                backgroundColor: isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : theme.palette[0]), 
                                color: isBlackTheme ? '#000000' : '#FFFFFF' 
                            }}
                        >
                            <ScrollText size={14} />
                            <span>{tHajj('viewFullEvidenceBtn', language)}</span>
                        </button>
                    </div>

                    {/* Evidences */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 dark:bg-amber-950/20 space-y-1.5">
                            <span className="font-bold text-xs flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
                                <BookOpen size={14} /> {tHajj('quranEvidenceTitle', language)}
                            </span>
                            {currentType.quranEvidence.map((ev: string, idx: number) => (
                                <p key={idx} className={`text-xs md:text-sm leading-relaxed text-amber-900 dark:text-amber-200 ${isEn ? 'font-sans font-medium' : 'font-amiri'}`}>
                                    {ev}
                                </p>
                            ))}
                        </div>

                        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 dark:bg-emerald-950/20 space-y-1.5">
                            <span className="font-bold text-xs flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                                <ScrollText size={14} /> {tHajj('sunnahEvidenceTitle', language)}
                            </span>
                            {currentType.sunnahEvidence.slice(0, 2).map((ev: string, idx: number) => (
                                <p key={idx} className={`text-xs leading-relaxed text-emerald-950 dark:text-emerald-200 ${isEn ? 'font-sans' : ''}`}>
                                    {ev}
                                </p>
                            ))}
                        </div>
                    </div>

                    {/* Hady Ruling */}
                    <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/25 dark:bg-purple-950/20 space-y-1">
                        <span className="font-bold text-xs flex items-center gap-1.5 text-purple-700 dark:text-purple-300">
                            <Scale size={14} /> {tHajj('hadyRulingTitle', language)}
                        </span>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-color)' }}>
                            {currentType.hadyRuling}
                        </p>
                    </div>

                    {/* Fiqh Comparison */}
                    <div className="p-3 rounded-xl bg-white/5 dark:bg-black/20 border border-white/10 space-y-2">
                        <span className="font-bold text-xs flex items-center gap-1.5" style={{ color: isBlackTheme ? '#FFFFFF' : theme.palette[0] }}>
                            <ListChecks size={14} /> {tHajj('comparisonTitle', language)} ({currentType.name})
                        </span>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-[11px]">
                            <div className="p-2 rounded-lg bg-white/5 text-center">
                                <span className="block font-bold text-[10px] opacity-70 mb-0.5">{tHajj('compIhram', language)}</span>
                                <span className="leading-tight">{currentType.comparison.ihram}</span>
                            </div>
                            <div className="p-2 rounded-lg bg-white/5 text-center">
                                <span className="block font-bold text-[10px] opacity-70 mb-0.5">{tHajj('compTahallul', language)}</span>
                                <span className="leading-tight">{currentType.comparison.tahallul}</span>
                            </div>
                            <div className="p-2 rounded-lg bg-white/5 text-center">
                                <span className="block font-bold text-[10px] opacity-70 mb-0.5">{tHajj('compTawaf', language)}</span>
                                <span className="leading-tight">{currentType.comparison.tawaf}</span>
                            </div>
                            <div className="p-2 rounded-lg bg-white/5 text-center">
                                <span className="block font-bold text-[10px] opacity-70 mb-0.5">{tHajj('compSai', language)}</span>
                                <span className="leading-tight">{currentType.comparison.sai}</span>
                            </div>
                            <div className="p-2 rounded-lg bg-white/5 text-center col-span-2 md:col-span-1">
                                <span className="block font-bold text-[10px] opacity-70 mb-0.5">{tHajj('compHady', language)}</span>
                                <span className="leading-tight">{currentType.comparison.hady}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Timeline */}
        <div className="pt-2">
            <h3 className="text-base font-bold mb-3 flex items-center gap-2 text-start" style={{ color: 'var(--text-color)' }}>
                <Map className="w-5 h-5" style={{ color: isBlackTheme ? '#FFFFFF' : theme.palette[0] }} /> 
                <span>{tHajj('hajjTimelineSectionTitle', language)}</span>
            </h3>
            <div className="space-y-2.5">
                {(hajjType === 'tamattu' ? tamattuPlan : hajjType === 'ifrad' ? ifradPlan : qiranPlan).map((day, i) => (
                    <button 
                        key={i} 
                        type="button"
                        onClick={() => onSelectDetail({ 
                            title: day.day, 
                            subtitle: day.summary,
                            evidence: day.evidence,
                            points: day.actions, 
                            icon: <div className="text-2xl">{day.icon}</div> 
                        })}
                        className="w-full text-start themed-card backdrop-blur-md rounded-2xl p-4 flex items-center gap-3.5 hover:shadow-lg transition-all active:scale-[0.982] group cursor-pointer"
                        style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                    >
                        <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-sm md:text-base" style={{ color: 'var(--text-color)' }}>{day.day}</h5>
                            <p className="text-xs opacity-75 mt-0.5 truncate" style={{ color: 'var(--text-color)' }}>{day.summary}</p>
                            {day.evidence && (
                                <p className="text-[10px] text-amber-700 dark:text-amber-300 font-medium mt-1 truncate">
                                    📜 {day.evidence}
                                </p>
                            )}
                        </div>

                        {!isRTL ? (
                            <ChevronRight size={18} className="opacity-30 group-hover:opacity-60 transition-opacity shrink-0" style={{ color: 'var(--text-color)' }} />
                        ) : (
                            <ChevronLeft size={18} className="opacity-30 group-hover:opacity-60 transition-opacity shrink-0" style={{ color: 'var(--text-color)' }} />
                        )}
                    </button>
                ))}
            </div>
        </div>
    </section>
    );
};

const DuaaScreen = ({ theme, openDuaaId, onToggle, onZoom, cardBorderColor }: { theme: any, openDuaaId: any, onToggle: any, onZoom: any, cardBorderColor?: string }) => {
    const { language } = useLanguage();
    const isBlackTheme = theme.bgColor === '#000000';
    return (
        <section id="duaa-screen" className="space-y-4">
             <div className="rounded-xl p-3 text-center mb-3 backdrop-blur-sm"
                  style={{ backgroundColor: isBlackTheme ? 'rgba(255,255,255,0.05)' : `${theme.palette[0]}15`, borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                <div className="w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-1.5" style={{ backgroundColor: isBlackTheme ? '#FFFFFF' : `${theme.palette[0]}20` }}>
                    <BookOpen className="w-5 h-5" style={{ color: isBlackTheme ? '#000000' : theme.palette[0] }} />
                </div>
                <p className="text-xs opacity-80 font-medium">
                    {tHajj('duaaScreenHeader', language)}
                </p>
            </div>

            <div className="space-y-2">
                {allDuaas.map(section => (
                    <DuaaSection 
                        key={section.id}
                        id={section.id}
                        title={section.title} 
                        items={section.items} 
                        isOpen={openDuaaId === section.id}
                        onToggle={() => onToggle(section.id)}
                        onZoom={onZoom}
                        cardBorderColor={cardBorderColor}
                    />
                ))}
            </div>
        </section>
    );
};

export default HajjUmrah;
