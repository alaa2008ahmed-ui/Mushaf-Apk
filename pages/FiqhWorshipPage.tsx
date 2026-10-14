import React, { useState, useEffect } from 'react';
import { FIQH_WORSHIP_DATA, FiqhSection, FiqhStep } from '../data/fiqhWorshipData';
import BottomBar from '../components/BottomBar';
import ThemePageLock from '../components/ThemePageLock';
import { useTheme } from '../context/ThemeContext';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { motion, AnimatePresence } from 'framer-motion';

interface FiqhWorshipPageProps {
    onBack: () => void;
    onNavigate: (pageId: string, params?: any) => void;
    navParams?: any;
}

const FiqhWorshipPage: React.FC<FiqhWorshipPageProps> = ({ onBack, onNavigate, navParams }) => {
    const { theme, themeKey } = useTheme();

    const [activeSectionId, setActiveSectionId] = useState<string>('wudu');
    const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(null);
    const [fontSizeScale, setFontSizeScale] = useState<number>(1);
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

    const activeSection = FIQH_WORSHIP_DATA.find((s) => s.id === activeSectionId) || FIQH_WORSHIP_DATA[0];

    // Hardware back button support
    useEffect(() => {
        const interceptor = () => {
            if (selectedStepIndex !== null) {
                setSelectedStepIndex(null);
                return true;
            }
            return false;
        };
        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [selectedStepIndex]);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 2500);
    };

    const handleCopyText = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            showToast(`تم نسخ ${label} بنجاح`);
        }).catch(() => {
            showToast('تعذر النسخ، يرجى التحديد يدوياً');
        });
    };

    const handleShareStep = (step: FiqhStep) => {
        const textToShare = `📖 *${step.title}* (${activeSection.title})\n\n📌 *الصفة والدليل:* ${step.description}\n\n📜 *الدليل الشرعي:* ${step.proof}${step.dhikr ? `\n\n🤲 *الذكر المستحب:* ${step.dhikr}` : ''}\n\nمشارك من تطبيق مصحف أحمد وليلى`;
        if (navigator.share) {
            navigator.share({
                title: step.title,
                text: textToShare
            }).catch(() => {});
        } else {
            handleCopyText(textToShare, 'تفاصيل الخطوة');
        }
    };

    const handleHomeClick = () => {
        if (selectedStepIndex !== null) {
            setSelectedStepIndex(null);
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
                                فقه العبادات المصور
                            </h1>
                            <p className="app-top-bar__subtitle text-xs sm:text-sm">
                                دليل عملي لصفة الصلاة والوضوء وسجود السهو والطهارة
                            </p>
                        </div>

                        <div className="w-10 flex items-center justify-end">
                            <button
                                onClick={() => setFontSizeScale(prev => prev === 1 ? 1.15 : prev === 1.15 ? 1.3 : 1)}
                                className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 flex items-center justify-center text-xs font-bold"
                                title="تكبير الخط"
                            >
                                <i className="fa-solid fa-font"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Section Switcher Tabs */}
            <div className="px-4 py-2 shrink-0 max-w-4xl mx-auto w-full">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
                    {FIQH_WORSHIP_DATA.map((sec) => {
                        const active = sec.id === activeSectionId;
                        return (
                            <button
                                key={sec.id}
                                onClick={() => {
                                    setActiveSectionId(sec.id);
                                    setSelectedStepIndex(null);
                                }}
                                className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 flex items-center gap-2 active:scale-95 ${
                                    active
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                                        : 'bg-black/5 dark:bg-white/5 hover:bg-black/10'
                                }`}
                                style={{ borderColor: active ? undefined : 'var(--card-border)' }}
                            >
                                <i className={`${sec.icon} text-sm`}></i>
                                <span>{sec.shortTitle}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto hide-scrollbar px-4 pt-1 pb-32">
                <div className="max-w-3xl mx-auto space-y-4">
                    {/* Active Section Banner */}
                    <div 
                        className="p-4 sm:p-5 rounded-3xl themed-card border shadow-sm relative overflow-hidden"
                        style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                    >
                        <div 
                            className="absolute -right-12 -top-12 w-36 h-36 rounded-full opacity-15 blur-2xl pointer-events-none"
                            style={{ backgroundColor: primaryColor }}
                        />

                        <div className="flex items-center gap-3.5">
                            <div 
                                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                                style={{ 
                                    backgroundColor: isDefaultTheme ? '#00000010' : `${primaryColor}25`,
                                    color: isDefaultTheme ? '#000000' : primaryColor
                                }}
                            >
                                <i className={`${activeSection.icon} text-2xl`}></i>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                        {activeSection.badge}
                                    </span>
                                    <span className="text-xs opacity-60">
                                        {activeSection.steps.length} خطوات عملية
                                    </span>
                                </div>
                                <h2 className="text-base sm:text-lg font-bold font-kufi truncate mt-0.5">
                                    {activeSection.title}
                                </h2>
                                <p className="text-xs opacity-75 mt-0.5 leading-relaxed line-clamp-2">
                                    {activeSection.summary}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Step-by-Step Flow List */}
                    <div className="space-y-3.5">
                        {activeSection.steps.map((step, idx) => {
                            const isExpanded = selectedStepIndex === idx;

                            return (
                                <motion.div
                                    key={step.number}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="rounded-2xl sm:rounded-3xl themed-card border shadow-sm overflow-hidden transition-all"
                                    style={{ 
                                        borderColor: isExpanded ? primaryColor : cardBorderColor,
                                        borderWidth: '1.5px',
                                        borderStyle: 'solid'
                                    }}
                                >
                                    {/* Step Header Bar */}
                                    <div 
                                        onClick={() => setSelectedStepIndex(isExpanded ? null : idx)}
                                        className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div 
                                                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs text-white"
                                                style={{ backgroundColor: primaryColor }}
                                            >
                                                {step.number}
                                            </div>

                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-sm sm:text-base font-kufi truncate">
                                                        {step.title}
                                                    </h3>
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold border ${step.rulingColor}`}>
                                                        {step.ruling}
                                                    </span>
                                                </div>
                                                <p className="text-xs opacity-70 truncate mt-0.5">
                                                    {step.description}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0 opacity-60">
                                            <i className={`fa-solid ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'} text-xs`}></i>
                                        </div>
                                    </div>

                                    {/* Step Expanded Details */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="border-t px-4 sm:px-5 py-4 space-y-3.5 bg-black/[0.02] dark:bg-white/[0.02]"
                                                style={{ borderColor: 'var(--card-border)' }}
                                            >
                                                {/* Full Description */}
                                                <div>
                                                    <span className="text-[11px] font-bold opacity-60 block mb-1">
                                                        الكيفية والصفة:
                                                    </span>
                                                    <p 
                                                        className="leading-relaxed font-medium"
                                                        style={{ fontSize: `${14 * fontSizeScale}px` }}
                                                    >
                                                        {step.description}
                                                    </p>
                                                </div>

                                                {/* Dhikr Box if available */}
                                                {step.dhikr && (
                                                    <div 
                                                        className="p-3.5 rounded-2xl border bg-emerald-500/10 border-emerald-500/30 relative"
                                                    >
                                                        <div className="flex items-center justify-between mb-1.5">
                                                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                                                <i className="fa-solid fa-hands-praying"></i>
                                                                الذكر أو الدعاء المشروع
                                                            </span>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleCopyText(step.dhikr!, 'الذكر');
                                                                }}
                                                                className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold hover:bg-emerald-500/30 transition-colors"
                                                            >
                                                                <i className="fa-regular fa-copy ml-1"></i>
                                                                نسخ
                                                            </button>
                                                        </div>
                                                        <p 
                                                            className="font-quran leading-loose text-center text-emerald-800 dark:text-emerald-200"
                                                            style={{ fontSize: `${16 * fontSizeScale}px` }}
                                                        >
                                                            {step.dhikr}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Proof / Hadith */}
                                                <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs">
                                                    <span className="font-bold opacity-75 block mb-1 flex items-center gap-1.5 text-blue-500">
                                                        <i className="fa-solid fa-scroll"></i>
                                                        الدليل من السنة أو القرآن:
                                                    </span>
                                                    <p className="opacity-85 italic leading-relaxed">
                                                        {step.proof}
                                                    </p>
                                                </div>

                                                {/* Common Mistakes To Avoid */}
                                                {step.mistakesToAvoid && (
                                                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-300">
                                                        <span className="font-bold block mb-1 flex items-center gap-1.5">
                                                            <i className="fa-solid fa-triangle-exclamation"></i>
                                                            أخطاء شائعة يجب تجنبها:
                                                        </span>
                                                        <p className="leading-relaxed">
                                                            {step.mistakesToAvoid}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Action Bar */}
                                                <div className="flex items-center justify-end gap-2 pt-1 border-t" style={{ borderColor: 'var(--card-border)' }}>
                                                    <button
                                                        onClick={() => handleShareStep(step)}
                                                        className="px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                                                        style={{ borderColor: cardBorderColor }}
                                                    >
                                                        <i className="fa-solid fa-share-nodes text-xs"></i>
                                                        مشاركة الخطوة
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Extra Notes / Fiqh Principles */}
                    {activeSection.extraNotes && activeSection.extraNotes.length > 0 && (
                        <div className="mt-6 space-y-3">
                            {activeSection.extraNotes.map((note, i) => (
                                <div 
                                    key={i} 
                                    className="p-4 sm:p-5 rounded-3xl themed-card border shadow-sm space-y-2"
                                    style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                >
                                    <h4 className="font-bold text-sm font-kufi flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                        <i className="fa-solid fa-circle-info"></i>
                                        {note.title}
                                    </h4>
                                    <ul className="space-y-1.5 text-xs opacity-80 list-disc list-inside leading-relaxed">
                                        {note.items.map((item, j) => (
                                            <li key={j}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
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

export default FiqhWorshipPage;
