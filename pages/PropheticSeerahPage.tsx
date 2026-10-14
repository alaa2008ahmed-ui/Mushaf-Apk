import React, { useState, useEffect } from 'react';
import { PROPHETIC_SEERAH_DATA, SeerahMilestone } from '../data/propheticSeerahData';
import BottomBar from '../components/BottomBar';
import ThemePageLock from '../components/ThemePageLock';
import { useTheme } from '../context/ThemeContext';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { motion, AnimatePresence } from 'framer-motion';

interface PropheticSeerahPageProps {
    onBack: () => void;
    onNavigate: (pageId: string, params?: any) => void;
    navParams?: any;
}

const PropheticSeerahPage: React.FC<PropheticSeerahPageProps> = ({ onBack, onNavigate, navParams }) => {
    const { theme, themeKey } = useTheme();

    const [activeEra, setActiveEra] = useState<'all' | 'pre-prophethood' | 'makki' | 'early-madani' | 'late-madani'>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedMilestone, setSelectedMilestone] = useState<SeerahMilestone | null>(null);
    const [toastMessage, setToastMessage] = useState<string>('');

    const isBlackTheme = theme.bgColor === '#000000';
    const isDefaultTheme = themeKey === 'default';
    const cardBorderColor = isDefaultTheme 
        ? '#000000' 
        : (isBlackTheme 
            ? '#FFFFFF' 
            : (theme.palette?.[0] || '#000000'));

    const primaryColor = isDefaultTheme 
        ? '#059669' 
        : (theme.palette?.[0] || '#059669');

    // Hardware back button support
    useEffect(() => {
        const interceptor = () => {
            if (selectedMilestone) {
                setSelectedMilestone(null);
                return true;
            }
            return false;
        };
        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [selectedMilestone]);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 2500);
    };

    const handleCopyMilestone = (m: SeerahMilestone) => {
        const text = `📜 *${m.title}* (${m.yearHijri ? `${m.yearHijri} / ` : ''}${m.yearGregorian})\n📍 *المكان:* ${m.location}\n👤 *عمر النبي ﷺ:* ${m.ageOfProphet}\n\n📖 *الخلاصة:* ${m.summary}\n\n💡 *العبر والدروس:*\n${m.lessons.map(l => `• ${l}`).join('\n')}\n\nمشارك من تطبيق مصحف أحمد وليلى`;
        navigator.clipboard.writeText(text).then(() => {
            showToast('تم نسخ محطة السيرة بنجاح');
        }).catch(() => {
            showToast('تعذر النسخ');
        });
    };

    const handleShareMilestone = (m: SeerahMilestone) => {
        const text = `📜 *${m.title}* (${m.yearHijri ? `${m.yearHijri} / ` : ''}${m.yearGregorian})\n📍 *المكان:* ${m.location}\n👤 *عمر النبي ﷺ:* ${m.ageOfProphet}\n\n📖 *الخلاصة:* ${m.summary}\n\n💡 *العبر والدروس:*\n${m.lessons.map(l => `• ${l}`).join('\n')}\n\nمشارك من تطبيق مصحف أحمد وليلى`;
        if (navigator.share) {
            navigator.share({
                title: m.title,
                text: text
            }).catch(() => {});
        } else {
            handleCopyMilestone(m);
        }
    };

    // Filter milestones
    const filteredMilestones = PROPHETIC_SEERAH_DATA.filter((m) => {
        const matchesEra = activeEra === 'all' || m.era === activeEra;
        const matchesSearch = 
            searchQuery.trim() === '' ||
            m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.lessons.some(l => l.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesEra && matchesSearch;
    });

    const currentIndex = selectedMilestone 
        ? PROPHETIC_SEERAH_DATA.findIndex(m => m.id === selectedMilestone.id) 
        : -1;
    const prevMilestone = currentIndex > 0 ? PROPHETIC_SEERAH_DATA[currentIndex - 1] : null;
    const nextMilestone = currentIndex >= 0 && currentIndex < PROPHETIC_SEERAH_DATA.length - 1 ? PROPHETIC_SEERAH_DATA[currentIndex + 1] : null;

    const handleHomeClick = () => {
        if (selectedMilestone) {
            setSelectedMilestone(null);
            return;
        }
        if (navParams?.from === 'more-menu') {
            onNavigate('more-menu');
        } else {
            onBack();
        }
    };

    return (
        <div 
            className="h-screen flex flex-col overflow-hidden" 
            style={{ backgroundColor: 'transparent', color: theme.textColor, fontFamily: theme.font }}
        >
            {/* Header */}
            <header className="app-top-bar">
                <div className="app-top-bar__inner">
                    <div className="relative flex items-center justify-between w-full">
                        <div className="w-10 flex items-center">
                            <ThemePageLock />
                        </div>

                        <div className="flex-1 text-center px-2">
                            <h1 className="app-top-bar__title text-xl sm:text-2xl font-kufi">
                                {selectedMilestone ? selectedMilestone.title : 'السيرة والخط الزمني'}
                            </h1>
                            <p className="app-top-bar__subtitle text-xs sm:text-sm">
                                {selectedMilestone ? `${selectedMilestone.eraLabel} • ${selectedMilestone.location}` : 'محطات حياة خير البرية ﷺ والعبر والدروس الإيمانية'}
                            </p>
                        </div>

                        <div className="w-10 flex items-center justify-end">
                            {selectedMilestone && (
                                <button
                                    onClick={() => setSelectedMilestone(null)}
                                    className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 flex items-center justify-center text-xs font-bold"
                                    title="العودة للقائمة"
                                >
                                    <i className="fa-solid fa-arrow-left"></i>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Container */}
            <main className="flex-1 overflow-y-auto hide-scrollbar px-4 pt-2 pb-32">
                <AnimatePresence mode="wait">
                    {selectedMilestone ? (
                        /* Milestone Detail View */
                        <motion.div
                            key={`detail-${selectedMilestone.id}`}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            className="max-w-2xl mx-auto space-y-4"
                        >
                            {/* Hero Card */}
                            <div 
                                className="p-5 sm:p-6 rounded-3xl themed-card border shadow-lg relative overflow-hidden"
                                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                            >
                                <div 
                                    className="absolute -right-16 -top-16 w-44 h-44 rounded-full opacity-15 blur-3xl pointer-events-none"
                                    style={{ backgroundColor: primaryColor }}
                                />

                                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                            {selectedMilestone.badge}
                                        </span>
                                        <span className="text-xs opacity-75 font-bold">
                                            {selectedMilestone.eraLabel}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1.5 text-xs opacity-80">
                                        <i className="fa-solid fa-location-dot text-emerald-500"></i>
                                        <span>{selectedMilestone.location}</span>
                                    </div>
                                </div>

                                <h2 className="text-xl sm:text-2xl font-bold font-kufi">
                                    {selectedMilestone.title}
                                </h2>

                                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t text-xs" style={{ borderColor: 'var(--card-border)' }}>
                                    <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5">
                                        <span className="opacity-60 block text-[10px]">التاريخ والزمن:</span>
                                        <span className="font-bold">{selectedMilestone.yearHijri ? `${selectedMilestone.yearHijri} • ` : ''}{selectedMilestone.yearGregorian}</span>
                                    </div>
                                    <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5">
                                        <span className="opacity-60 block text-[10px]">عمر النبي ﷺ:</span>
                                        <span className="font-bold">{selectedMilestone.ageOfProphet}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Full Narrative Details */}
                            <div 
                                className="p-5 rounded-3xl themed-card border shadow-sm space-y-3"
                                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                            >
                                <h3 className="text-sm font-bold font-kufi flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                    <i className="fa-solid fa-book-open"></i>
                                    أحداث المحطة وتفاصيلها
                                </h3>
                                <p className="text-sm sm:text-base leading-relaxed opacity-90 font-medium">
                                    {selectedMilestone.details}
                                </p>
                            </div>

                            {/* Lessons and Moral Values */}
                            <div 
                                className="p-5 rounded-3xl themed-card border shadow-sm space-y-3 bg-emerald-500/5 border-emerald-500/30"
                            >
                                <h3 className="text-sm font-bold font-kufi flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                    <i className="fa-solid fa-lightbulb"></i>
                                    العِبر والدروس الإيمانية المستفادة
                                </h3>
                                <div className="space-y-2">
                                    {selectedMilestone.lessons.map((lesson, idx) => (
                                        <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed">
                                            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">
                                                {idx + 1}
                                            </span>
                                            <p className="flex-1 font-medium">{lesson}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Proof Quote */}
                            {selectedMilestone.proof && (
                                <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs">
                                    <span className="font-bold opacity-75 block mb-1 text-blue-500 flex items-center gap-1.5">
                                        <i className="fa-solid fa-quote-right"></i>
                                        شاهد من القرآن الكريم أو السنة:
                                    </span>
                                    <p className="italic opacity-90 leading-relaxed font-semibold">
                                        {selectedMilestone.proof}
                                    </p>
                                </div>
                            )}

                            {/* Quick Actions & Navigation Between Milestones */}
                            <div className="flex items-center justify-between gap-2 pt-2">
                                <button
                                    onClick={() => handleShareMilestone(selectedMilestone)}
                                    className="px-4 py-2.5 rounded-2xl border text-xs font-bold flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 transition-all shadow-xs"
                                    style={{ borderColor: cardBorderColor }}
                                >
                                    <i className="fa-solid fa-share-nodes text-xs"></i>
                                    مشاركة كبطاقة ملهمة
                                </button>

                                <button
                                    onClick={() => handleCopyMilestone(selectedMilestone)}
                                    className="px-4 py-2.5 rounded-2xl border text-xs font-bold flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 transition-all shadow-xs"
                                    style={{ borderColor: cardBorderColor }}
                                >
                                    <i className="fa-regular fa-copy text-xs"></i>
                                    نسخ النص
                                </button>
                            </div>

                            {/* Next / Previous Milestones Navigation */}
                            <div className="grid grid-cols-2 gap-3 pt-3">
                                {prevMilestone ? (
                                    <button
                                        onClick={() => setSelectedMilestone(prevMilestone)}
                                        className="p-3 rounded-2xl border text-right transition-all active:scale-95 shadow-sm hover:border-emerald-500"
                                        style={{ borderColor: cardBorderColor }}
                                    >
                                        <span className="text-[10px] opacity-60 block">المحطة السابقة</span>
                                        <span className="text-xs font-bold block truncate font-kufi">{prevMilestone.title}</span>
                                    </button>
                                ) : (
                                    <div />
                                )}

                                {nextMilestone ? (
                                    <button
                                        onClick={() => setSelectedMilestone(nextMilestone)}
                                        className="p-3 rounded-2xl border text-left transition-all active:scale-95 shadow-sm hover:border-emerald-500"
                                        style={{ borderColor: cardBorderColor }}
                                    >
                                        <span className="text-[10px] opacity-60 block">المحطة التالية</span>
                                        <span className="text-xs font-bold block truncate font-kufi">{nextMilestone.title}</span>
                                    </button>
                                ) : (
                                    <div />
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        /* Timeline Interactive List */
                        <motion.div
                            key="timeline-list"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-4 max-w-3xl mx-auto"
                        >
                            {/* Search and Era Filters */}
                            <div className="space-y-2.5">
                                <div 
                                    className="p-2 sm:p-2.5 rounded-2xl themed-card border shadow-sm relative overflow-hidden flex items-center"
                                    style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                >
                                    <div className="relative w-full">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="ابحث في أحداث السيرة، المعارك، الأماكن والعبر..."
                                            className="w-full pl-8 pr-9 py-2 text-xs sm:text-sm rounded-xl border bg-black/5 dark:bg-white/5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                            style={{ borderColor: 'var(--card-border)', color: theme.textColor }}
                                        />
                                        <i className="fa-solid fa-magnifying-glass absolute right-3 top-1/2 -translate-y-1/2 text-xs opacity-50"></i>
                                        {searchQuery && (
                                            <button
                                                onClick={() => setSearchQuery('')}
                                                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs opacity-50 hover:opacity-100"
                                            >
                                                <i className="fa-solid fa-times"></i>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Era Filter Pills */}
                                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
                                    {[
                                        { id: 'all', label: 'كامل السيرة (الكل)', icon: 'fa-timeline' },
                                        { id: 'pre-prophethood', label: 'ما قبل البعثة', icon: 'fa-baby' },
                                        { id: 'makki', label: 'العهد المكي', icon: 'fa-book-quran' },
                                        { id: 'early-madani', label: 'العهد المدني الأول', icon: 'fa-mosque' },
                                        { id: 'late-madani', label: 'الفتوحات وحجة الوداع', icon: 'fa-kaaba' },
                                    ].map((era) => {
                                        const active = activeEra === era.id;
                                        return (
                                            <button
                                                key={era.id}
                                                onClick={() => setActiveEra(era.id as any)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 flex items-center gap-1.5 active:scale-95 ${
                                                    active
                                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                                        : 'bg-black/5 dark:bg-white/5 hover:bg-black/10'
                                                }`}
                                                style={{ borderColor: active ? undefined : 'var(--card-border)' }}
                                            >
                                                <i className={`fa-solid ${era.icon} text-[10px]`}></i>
                                                {era.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Timeline Items */}
                            <div className="relative border-r-2 border-emerald-500/30 pr-4 sm:pr-6 space-y-4 mr-2 sm:mr-3">
                                {filteredMilestones.map((m, idx) => (
                                    <div 
                                        key={m.id}
                                        onClick={() => setSelectedMilestone(m)}
                                        className="relative group cursor-pointer active:scale-98 transition-all"
                                    >
                                        {/* Dot Indicator on the Timeline */}
                                        <div 
                                            className="absolute -right-[23px] sm:-right-[31px] top-4 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 bg-emerald-500 border-white dark:border-slate-900 shadow-md group-hover:scale-125 transition-transform"
                                        />

                                        {/* Milestone Card */}
                                        <div 
                                            className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl themed-card border shadow-sm hover:shadow-md transition-all space-y-2 relative overflow-hidden"
                                            style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                                        {m.badge}
                                                    </span>
                                                    <span className="text-[11px] font-mono font-bold opacity-75">
                                                        {m.yearHijri ? `${m.yearHijri} • ` : ''}{m.yearGregorian}
                                                    </span>
                                                </div>

                                                <span className="text-[11px] opacity-60 flex items-center gap-1">
                                                    <i className="fa-solid fa-location-dot text-[10px] text-emerald-500"></i>
                                                    {m.location}
                                                </span>
                                            </div>

                                            <h3 className="font-bold text-base font-kufi group-hover:text-emerald-500 transition-colors">
                                                {m.title}
                                            </h3>

                                            <p className="text-xs opacity-80 leading-relaxed line-clamp-2">
                                                {m.summary}
                                            </p>

                                            <div className="flex items-center justify-between text-xs pt-1 border-t opacity-75" style={{ borderColor: 'var(--card-border)' }}>
                                                <span>عمر النبي: {m.ageOfProphet}</span>
                                                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                    عرض العِبر والتفاصيل
                                                    <i className="fa-solid fa-arrow-left text-[10px]"></i>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {filteredMilestones.length === 0 && (
                                <div className="text-center py-12 opacity-60">
                                    <i className="fa-solid fa-scroll text-3xl mb-2"></i>
                                    <p className="text-sm">لا توجد محطات تطابق بحثك</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Toast Message */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div 
                        initial={{ opacity: 0, y: 30, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 30, x: '-50%' }}
                        className="fixed bottom-24 left-1/2 z-[260] bg-gray-900 text-white px-5 py-2.5 rounded-full shadow-2xl font-bold text-xs text-center whitespace-nowrap border border-white/10"
                    >
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Bar */}
            <BottomBar onHomeClick={handleHomeClick} onThemesClick={() => {}} showThemes={false} />
        </div>
    );
};

export default PropheticSeerahPage;
