
import React, { useState, useEffect, FC } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import BottomBar from '../components/BottomBar';
import { useTheme } from '../context/ThemeContext';
import { umrahSteps, hajjTypes, hajjTamattuPlan, hajjIfradPlan, hajjQiranPlan, hajjGeneralInfo, allDuaas, homeScreenAdditions } from '../data/hajjUmrahData';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { motion, AnimatePresence } from 'motion/react';
import { 
    ChevronLeft, ChevronRight, ChevronDown, Map, Heart, Compass, 
    BookOpen, Info, ShieldAlert, ListChecks, Plus, Minus, RotateCcw, Tent,
    ZoomIn, CheckCircle2, Circle, ArrowLeft, Footprints
} from 'lucide-react';

interface DuaaSectionProps {
    title: string;
    items: string[];
    isOpen: boolean;
    onToggle: () => void;
    onZoom: (item: string) => void;
}

const DuaaSection: FC<DuaaSectionProps> = ({ title, items, isOpen, onToggle, onZoom }) => (
    <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden mb-3">
        <button 
            onClick={onToggle} 
            className="w-full flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
            <span className="font-bold text-base md:text-lg">{title}</span>
            <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-5 h-5 text-gray-500" />
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
                    <ul className="p-4 space-y-3 bg-white dark:bg-gray-900/20">
                        {items.map((item, index) => (
                            <li key={index} className="flex items-start justify-between gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40">
                                <span className="text-base md:text-lg leading-loose" dangerouslySetInnerHTML={{ __html: item }}></span>
                                <button onClick={() => onZoom(item)} className="p-2 shrink-0 text-gray-400 hover:text-emerald-600 transition-colors rounded-full hover:bg-emerald-50 dark:hover:bg-gray-700">
                                    <ZoomIn className="w-5 h-5" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

const ChecklistScreen = () => {
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
            title: "للحج والعمرة (أساسيات)",
            items: [
                { id: '1', text: "ملابس الإحرام (للرجال: إزار ورداء، للنساء: ملابس واسعة محتشمة)" },
                { id: '2', text: "حذاء خفيف ومريح (بدون خياطة محيطة للرجال)" },
                { id: '3', text: "حقيبة صغيرة/حزام حفظ الأوراق والمال" },
                { id: '4', text: "مقص صغير / ماكينة حلاقة" },
                { id: '5', text: "أدوية شخصية ومسكنات" },
                { id: '6', text: "مظلة شمسية (شمسية)" }
            ]
        },
        {
            title: "مستلزمات عامة",
            items: [
                { id: '7', text: "كتيب أذكار / مصحف جيب / سبحة" },
                { id: '8', text: "ملابس قطنية مريحة" },
                { id: '9', text: "مناديل مبللة وجافة (خالية من الكحول والعطور)" },
                { id: '10', text: "شاحن هاتف محمول وبطارية طوارئ (Power Bank)" },
                { id: '11', text: "نظارة شمسية" },
                { id: '12', text: "سجادة صلاة خفيفة" }
            ]
        }
    ];

    return (
        <motion.section 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl p-6 text-center">
                <div className="w-16 h-16 mx-auto bg-emerald-100 dark:bg-emerald-800/50 rounded-full flex items-center justify-center mb-3">
                    <ListChecks className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2">قائمة التجهيزات</h2>
                <p className="text-base text-gray-600 dark:text-gray-300">حدد الأشياء التي قمت بتجهيزها لرحلتك.</p>
            </div>

            <div className="space-y-4">
                {categories.map((cat, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="font-bold text-lg mb-3 text-emerald-600 dark:text-emerald-400">{cat.title}</h3>
                        <div className="space-y-2">
                            {cat.items.map(item => (
                                <button 
                                    key={item.id} 
                                    onClick={() => toggleItem(item.id)}
                                    className="w-full flex items-start gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                >
                                    <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-md flex items-center justify-center ${checkedItems[item.id] ? 'bg-emerald-500 text-white' : 'border-2 border-gray-300 dark:border-gray-600'}`}>
                                        {checkedItems[item.id] && <CheckCircle2 size={14} />}
                                    </div>
                                    <span className={`text-base text-right leading-relaxed ${checkedItems[item.id] ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-200'}`}>
                                        {item.text}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </motion.section>
    );
};

const CountersScreen = () => {
    const [tawaf, setTawaf] = useState(0);
    const [sai, setSai] = useState(0);
    const [activeTab, setActiveTab] = useState<'tawaf'|'sai'>('tawaf');

    const increment = () => {
        if (activeTab === 'tawaf') {
            if (tawaf < 7) setTawaf(tawaf + 1);
        } else {
            if (sai < 7) setSai(sai + 1);
        }
    };

    const reset = () => {
        if (activeTab === 'tawaf') setTawaf(0);
        else setSai(0);
    };

    const currentCount = activeTab === 'tawaf' ? tawaf : sai;

    return (
        <motion.section 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl p-6 text-center">
                <div className="w-16 h-16 mx-auto bg-emerald-100 dark:bg-emerald-800/50 rounded-full flex items-center justify-center mb-3">
                    <RotateCcw className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2">عداد الأشواط</h2>
                <p className="text-base text-gray-600 dark:text-gray-300">أداة مساعدة لعد أشواط الطواف والسعي.</p>
            </div>

            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl text-lg">
                <button 
                    onClick={() => setActiveTab('tawaf')} 
                    className={`flex-1 py-3 rounded-xl font-bold transition ${activeTab === 'tawaf' ? 'bg-white dark:bg-gray-700 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-gray-500'}`}
                >
                    الطواف
                </button>
                <button 
                    onClick={() => setActiveTab('sai')} 
                    className={`flex-1 py-3 rounded-xl font-bold transition ${activeTab === 'sai' ? 'bg-white dark:bg-gray-700 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-gray-500'}`}
                >
                    السعي
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 flex flex-col items-center justify-center shadow-sm border border-gray-100 dark:border-gray-700 min-h-[300px]">
                <div className="relative mb-8">
                     <svg className="w-48 h-48 transform -rotate-90">
                        <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-100 dark:text-gray-700" />
                        <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="none" className="text-emerald-500" strokeDasharray="553" strokeDashoffset={553 - (553 * currentCount) / 7} style={{ transition: 'stroke-dashoffset 0.5s ease' }} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                         <span className="text-5xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{currentCount}</span>
                         <span className="text-sm text-gray-400 font-bold mt-1">من 7</span>
                    </div>
                </div>

                <div className="flex gap-4 w-full">
                    <button onClick={reset} className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 rounded-2xl font-bold text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center justify-center gap-2">
                        <RotateCcw size={20} /> تصفير
                    </button>
                    <button onClick={increment} disabled={currentCount >= 7} className={`flex-[2] py-4 rounded-2xl font-bold text-white transition flex items-center justify-center gap-2 text-lg ${currentCount >= 7 ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 active:scale-95'}`}>
                        <Plus size={24} /> إضافة شوط
                    </button>
                </div>
                
                {currentCount >= 7 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-2">
                        <CheckCircle2 size={20} /> تقبل الله طاعتكم
                    </motion.div>
                )}
            </div>
        </motion.section>
    );
};

function HajjUmrah({ onBack }) {
    const { theme } = useTheme();
    const [screen, setScreen] = useState('home');
    const [hajjType, setHajjType] = useState('tamattu');
    const [openDuaaId, setOpenDuaaId] = useState<number | null>(null);
    const [zoomedDuaa, setZoomedDuaa] = useState(null);

    const handleDuaaToggle = (id: number) => {
        setOpenDuaaId(prevId => (prevId === id ? null : id));
    };

    const openZoomModal = (item) => {
        setZoomedDuaa({ text: item });
    };

    const closeZoomModal = () => {
        setZoomedDuaa(null);
    };
    
    useEffect(() => {
        if(screen === 'duaa') {
            setOpenDuaaId(1);
        }
    }, [screen]);

    useEffect(() => {
        const interceptor = () => {
            if (zoomedDuaa) {
                setZoomedDuaa(null);
                return true; // handled
            } else if (screen !== 'home') {
                setScreen('home');
                return true; // handled
            }
            return false; // let the global handler process it (will call onBack)
        };

        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [screen, zoomedDuaa]);

    const renderScreen = () => {
        switch (screen) {
            case 'umrah': return <UmrahScreen key="umrah" theme={theme} />;
            case 'hajj': return <HajjScreen key="hajj" hajjType={hajjType} setHajjType={setHajjType} theme={theme} />;
            case 'duaa': return <DuaaScreen key="duaa" openDuaaId={openDuaaId} onToggle={handleDuaaToggle} onZoom={openZoomModal} />;
            case 'checklist': return <ChecklistScreen key="checklist" />;
            case 'counters': return <CountersScreen key="counters" />;
            default: return <HomeScreen key="home" setScreen={setScreen} theme={theme} />;
        }
    };

    const handleHomeClick = () => {
        if (zoomedDuaa) {
            setZoomedDuaa(null);
        } else if (screen !== 'home') {
            setScreen('home');
        } else {
            onBack();
        }
    };

    return (
        <div className="h-screen flex flex-col bg-transparent">
            <header className="app-top-bar">
                <div className="app-top-bar__inner gap-2 relative">
                    {screen !== 'home' && (
                        <button onClick={() => setScreen('home')} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition">
                            <ChevronRight size={24} />
                        </button>
                    )}
                    <div className="relative flex items-center justify-center">
                        <h1 className="app-top-bar__title text-2xl md:text-3xl font-kufi tracking-wide">الحج والعمرة</h1>
                    </div>
                    {screen === 'home' && <p className="app-top-bar__subtitle">دليل مبسّط لمناسك الحج والعمرة مع خطوات وأذكار واضحة</p>}
                </div>
            </header>

            <main className="w-full max-w-4xl mx-auto px-4 pt-4 flex-grow overflow-y-auto pb-24">
                <AnimatePresence mode="wait">
                    {renderScreen()}
                </AnimatePresence>
            </main>

            <BottomBar onHomeClick={handleHomeClick} onThemesClick={() => {}} showThemes={false} />

            {zoomedDuaa && (
                <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center p-4" onClick={closeZoomModal}>
                    <div className="themed-card p-8 rounded-3xl w-full max-w-2xl text-center relative flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        <div className="overflow-y-auto hide-scrollbar flex-1 py-4">
                            <p className="text-3xl md:text-4xl leading-relaxed font-amiri" dangerouslySetInnerHTML={{ __html: zoomedDuaa.text }}></p>
                        </div>

                        <div className="mt-6 shrink-0">
                            <button onClick={closeZoomModal} className="w-full py-3 rounded-xl font-bold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:opacity-90 transition-opacity">إغلاق</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const HomeScreen = ({ setScreen, theme }) => (
     <motion.section 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
        id="home-screen" className="space-y-4"
    >
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 to-emerald-950 p-6 text-white shadow-xl">
            <div className="absolute top-0 right-0 p-8 opacity-10">
                <Map size={120} />
            </div>
            <div className="relative z-10 text-center">
                <p className="text-2xl md:text-3xl mb-2 font-amiri leading-relaxed">
                    ﴿ وَأَتِمُّوا الْحَجَّ وَالْعُمْرَةَ لِلَّهِ ﴾
                </p>
                <p className="text-base opacity-90 font-medium">سورة البقرة - آية 196</p>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4 mt-2">
            <button onClick={() => setScreen('umrah')} className="flex flex-col items-center justify-center p-5 rounded-3xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all gap-3">
                <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Compass size={28} />
                </div>
                <h2 className="font-bold text-lg">دليل العمرة</h2>
            </button>
            <button onClick={() => setScreen('hajj')} className="flex flex-col items-center justify-center p-5 rounded-3xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all gap-3">
                <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Tent size={28} />
                </div>
                <h2 className="font-bold text-lg">دليل الحج</h2>
            </button>
            <button onClick={() => setScreen('counters')} className="flex flex-col items-center justify-center p-5 rounded-3xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all gap-3">
                <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <RotateCcw size={28} />
                </div>
                <h2 className="font-bold text-lg">عَدّاد الطواف</h2>
            </button>
            <button onClick={() => setScreen('duaa')} className="flex flex-col items-center justify-center p-5 rounded-3xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all gap-3">
                <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <BookOpen size={28} />
                </div>
                <h2 className="font-bold text-lg">أدعية وأذكار</h2>
            </button>
            <button onClick={() => setScreen('checklist')} className="flex flex-col items-center justify-center p-5 rounded-3xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all gap-3 col-span-2">
                <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <ListChecks size={28} />
                </div>
                <h2 className="font-bold text-lg">قائمة التجهيزات والأمتعة</h2>
            </button>
        </div>

        <div className="mt-5 space-y-3">
             <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-4 border border-orange-100 dark:border-orange-800/30">
                <h3 className="font-bold text-orange-800 dark:text-orange-300 mb-2 flex items-center gap-2 text-lg">
                    <ShieldAlert size={18} />
                    <span>قاعدة مهمة</span>
                </h3>
                <p className="leading-relaxed text-base text-orange-700 dark:text-orange-200/80">ترك ركن يبطل النسك، أما ترك واجب فيُجبر بدم، وارتكاب المحظورات يوجب الفدية وقد يفسد النسك.</p>
            </div>
            {homeScreenAdditions.map((item, index) => (
                 <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2" style={{color: theme.name === 'أبيض وأسود' ? theme.textColor : theme.palette[index % 2]}}>
                        <Info size={18} />
                        <span>{item.title}</span>
                    </h3>
                    {item.type === 'hadith' ? 
                        <p className="text-base dark:text-gray-300 leading-relaxed pr-2 border-r-2 border-emerald-500">{item.content[0]}<br/><span className="opacity-70 text-left block mt-2 text-sm">{item.content[1]}</span></p> :
                        <ul className="space-y-2 text-base dark:text-gray-300">
                            {item.content.map((point, i) => (
                                <li key={i} className="flex gap-2 items-start">
                                    <div className="mt-1"><Circle size={8} className="fill-current text-emerald-500" /></div>
                                    <span dangerouslySetInnerHTML={{ __html: point }}></span>
                                </li>
                            ))}
                        </ul>
                    }
                </div>
            ))}
        </div>
    </motion.section>
);

const UmrahScreen = ({ theme }) => (
     <motion.section 
        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
        id="umrah-screen" className="space-y-6"
    >
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl p-6 text-center">
            <h2 className="text-3xl font-bold mb-2">أداء العمرة</h2>
            <p className="text-base text-gray-600 dark:text-gray-300">العمرة زيارة لبيت الله الحرام على وجهٍ مخصوص مع الإحرام والطواف والسعي والحلق أو التقصير.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-lg flex items-center gap-2 mb-3 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 size={18} /> أركان العمرة
                </h3>
                <ul className="space-y-2 text-base text-gray-600 dark:text-gray-300">
                    <li className="flex gap-2"><div className="mt-1.5"><Circle size={6} className="fill-current" /></div> الإحرام (النية).</li>
                    <li className="flex gap-2"><div className="mt-1.5"><Circle size={6} className="fill-current" /></div> الطواف بالبيت.</li>
                    <li className="flex gap-2"><div className="mt-1.5"><Circle size={6} className="fill-current" /></div> السعي بين الصفا والمروة.</li>
                </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-lg flex items-center gap-2 mb-3 text-emerald-600 dark:text-emerald-400">
                    <ListChecks size={18} /> واجبات العمرة
                </h3>
                <ul className="space-y-2 text-base text-gray-600 dark:text-gray-300">
                    <li className="flex gap-2"><div className="mt-1.5"><Circle size={6} className="fill-current" /></div> الإحرام من الميقات.</li>
                    <li className="flex gap-2"><div className="mt-1.5"><Circle size={6} className="fill-current" /></div> الحلق أو التقصير.</li>
                </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-orange-100 dark:border-orange-900/30">
                <h3 className="font-bold text-lg flex items-center gap-2 mb-3 text-orange-600 dark:text-orange-400">
                    <ShieldAlert size={18} /> ما يفسد العمرة
                </h3>
                 <ul className="space-y-2 text-base text-gray-600 dark:text-gray-300">
                    <li className="flex gap-2"><div className="mt-1.5"><Circle size={6} className="fill-current text-orange-500" /></div> الجماع قبل التحلّل.</li>
                    <li className="flex gap-2"><div className="mt-1.5"><Circle size={6} className="fill-current text-orange-500" /></div> ترك ركن من الأركان.</li>
                </ul>
            </div>
        </div>

         <h3 className="text-xl font-bold mt-6 mb-4 flex items-center gap-2">
            <Footprints className="w-5 h-5" /> خطوات أداء العمرة
         </h3>
        <div className="space-y-4">
            {umrahSteps.map((step, index) => {
                return (
                    <div key={step.title} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex gap-4 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-1.5 h-full bg-emerald-500" />
                        <div className="flex-shrink-0 w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center justify-center text-2xl">
                            {step.icon}
                        </div>
                        <div className="pt-1">
                            <h4 className="font-bold text-lg mb-2">{step.title}</h4>
                            {step.points ? (
                                <ul className="space-y-2 text-base text-gray-600 dark:text-gray-300">
                                    {step.points.map((p, i) => (
                                        <li key={i} className="flex gap-2 items-start">
                                            <div className="mt-1.5"><Circle size={5} className="fill-current text-gray-400" /></div>
                                            <span dangerouslySetInnerHTML={{ __html: p }}></span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: step.text.replace('{{THEME_PALETTE_0}}', theme.name === 'أبيض وأسود' ? theme.textColor : theme.palette[0]) }}></p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    </motion.section>
);

const HajjScreen = ({ hajjType, setHajjType, theme }) => (
     <motion.section 
        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
        id="hajj-screen" className="space-y-6"
    >
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl p-6 text-center">
            <h2 className="text-3xl font-bold mb-2">أداء الحج</h2>
            <p className="text-base text-gray-600 dark:text-gray-300">تعرّف على أنواع الحج والمخطط الزمني للأيام المخصصة لأداء المناسك.</p>
        </div>

        <div>
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Info size={18} /> أنواع الحج
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                {Object.keys(hajjTypes).map(key => (
                    <button key={key} onClick={() => setHajjType(key)} 
                        className={`flex-shrink-0 px-5 py-3 rounded-2xl font-bold transition-all border text-lg ${hajjType === key ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700'}`}
                    >
                        {hajjTypes[key].name}
                    </button>
                ))}
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 text-base text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
                <strong className="text-emerald-600 dark:text-emerald-400 ml-2">{hajjTypes[hajjType].name}:</strong> 
                {hajjTypes[hajjType].description}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"><h3 className="font-bold text-lg mb-3 text-emerald-600 dark:text-emerald-400 flex items-center gap-2"><CheckCircle2 size={18}/>أركان الحج</h3><ul className="space-y-2 text-base text-gray-600 dark:text-gray-300">{hajjGeneralInfo.arkan.map((item, i)=><li key={i} className="flex gap-2"><Circle size={6} className="mt-1.5 fill-current" />{item}</li>)}</ul></div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"><h3 className="font-bold text-lg mb-3 text-emerald-600 dark:text-emerald-400 flex items-center gap-2"><ListChecks size={18}/>واجبات الحج</h3><ul className="space-y-2 text-base text-gray-600 dark:text-gray-300">{hajjGeneralInfo.wajibat.map((item, i)=><li key={i} className="flex gap-2"><Circle size={6} className="mt-1.5 fill-current" />{item}</li>)}</ul></div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-orange-100 dark:border-orange-900/30"><h3 className="font-bold text-lg mb-3 text-orange-600 dark:text-orange-400 flex items-center gap-2"><ShieldAlert size={18}/>ما يفسد الحج</h3><ul className="space-y-2 text-base text-gray-600 dark:text-gray-300">{hajjGeneralInfo.mufsidat.map((item, i)=><li key={i} className="flex gap-2"><Circle size={6} className="mt-1.5 fill-current text-orange-500" />{item}</li>)}</ul></div>
        </div>

        {hajjType === 'tamattu' && (
             <div className="mt-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Map className="w-5 h-5" /> مخطط الأيام (حج التمتع)
                </h3>
                <div className="space-y-4 relative before:absolute before:inset-0 before:right-5 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700">
                    {hajjTamattuPlan.map((day, i) => (
                        <div key={i} className="relative flex items-center gap-4 group">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-gray-900 bg-emerald-500 text-white shrink-0 z-10 font-bold text-base shadow-sm">
                                {i+1}
                            </div>
                            <div className="flex-1 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <h5 className="font-bold text-lg text-emerald-600 dark:text-emerald-400 mb-2">{day.day}</h5>
                                <ul className="space-y-2 text-base text-gray-600 dark:text-gray-300">
                                    {day.actions.map((action, j)=><li key={j} className="flex gap-2 items-start"><div className="mt-1.5"><Circle size={5} className="fill-current text-gray-400" /></div><span dangerouslySetInnerHTML={{__html: action}}></span></li>)}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
        {hajjType === 'ifrad' && (
             <div className="mt-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Map className="w-5 h-5" /> مخطط الأيام (حج الإفراد)
                </h3>
                <div className="space-y-4 relative before:absolute before:inset-0 before:right-5 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700">
                    {hajjIfradPlan.map((day, i) => (
                        <div key={i} className="relative flex items-center gap-4 group">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-gray-900 bg-emerald-500 text-white shrink-0 z-10 font-bold text-base shadow-sm">
                                {i+1}
                            </div>
                            <div className="flex-1 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <h5 className="font-bold text-lg text-emerald-600 dark:text-emerald-400 mb-2">{day.day}</h5>
                                <ul className="space-y-2 text-base text-gray-600 dark:text-gray-300">
                                    {day.actions.map((action, j)=><li key={j} className="flex gap-2 items-start"><div className="mt-1.5"><Circle size={5} className="fill-current text-gray-400" /></div><span dangerouslySetInnerHTML={{__html: action}}></span></li>)}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
        {hajjType === 'qiran' && (
             <div className="mt-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Map className="w-5 h-5" /> مخطط الأيام (حج القِران)
                </h3>
                <div className="space-y-4 relative before:absolute before:inset-0 before:right-5 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700">
                    {hajjQiranPlan.map((day, i) => (
                        <div key={i} className="relative flex items-center gap-4 group">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-gray-900 bg-emerald-500 text-white shrink-0 z-10 font-bold text-base shadow-sm">
                                {i+1}
                            </div>
                            <div className="flex-1 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <h5 className="font-bold text-lg text-emerald-600 dark:text-emerald-400 mb-2">{day.day}</h5>
                                <ul className="space-y-2 text-base text-gray-600 dark:text-gray-300">
                                    {day.actions.map((action, j)=><li key={j} className="flex gap-2 items-start"><div className="mt-1.5"><Circle size={5} className="fill-current text-gray-400" /></div><span dangerouslySetInnerHTML={{__html: action}}></span></li>)}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </motion.section>
);

const DuaaScreen = ({ openDuaaId, onToggle, onZoom }) => {
    return (
        <motion.section 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            id="duaa-screen" className="space-y-4"
        >
             <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl p-6 text-center mb-6">
                <div className="w-16 h-16 mx-auto bg-emerald-100 dark:bg-emerald-800/50 rounded-full flex items-center justify-center mb-3">
                    <BookOpen className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-3xl font-bold mb-2">الأدعية والأذكار</h2>
                <p className="text-base text-gray-600 dark:text-gray-300">مجموعة منتقاة وشاملة من الأدعية التي يناسب قولها في سائر المناسك.</p>
            </div>

            <div className="space-y-3">
                {allDuaas.map(section => (
                    <DuaaSection 
                        key={section.id}
                        title={section.title} 
                        items={section.items} 
                        isOpen={openDuaaId === section.id}
                        onToggle={() => onToggle(section.id)}
                        onZoom={onZoom}
                    />
                ))}
            </div>
        </motion.section>
    );
};


export default HajjUmrah;
