
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import BottomBar from '../components/BottomBar';
import ThemePageLock from '../components/ThemePageLock';
import { asmaulHusna, AsmaulHusnaItem } from '../data/asmaulHusnaData';
import { X, Info, Book } from 'lucide-react';

const AsmaulHusna: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [selectedName, setSelectedName] = useState<AsmaulHusnaItem | null>(null);

    const handleHomeClick = () => {
        if (selectedName) {
            setSelectedName(null);
        } else {
            onBack();
        }
    };

    return (
        <div className="h-screen flex flex-col overflow-hidden relative bg-transparent">
            <header className="app-top-bar z-20">
                <div className="app-top-bar__inner">
                    <div className="relative flex items-center justify-center w-full">
                        <div className="absolute left-0">
                            <ThemePageLock />
                        </div>
                        <h1 className="app-top-bar__title text-2xl font-kufi">
                            أسماء الله الحسنى
                        </h1>
                    </div>
                    <p className="app-top-bar__subtitle text-xs">٩٩ اسماً من أحصاها دخل الجنة</p>
                </div>
            </header>

            <main className="flex-1 overflow-hidden flex flex-col px-4 z-10">
                <div className="flex-1 overflow-y-auto hide-scrollbar pt-0 pb-48">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-w-5xl mx-auto">
                        {asmaulHusna.map((item) => (
                            <motion.button
                                key={item.id}
                                whileHover={{ y: -5, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedName(item)}
                                className="relative themed-card rounded-3xl p-4 flex flex-col items-center justify-center text-center aspect-square group border border-black/5 shadow-md transition-all duration-300 overflow-hidden"
                            >
                                {/* ID Badge */}
                                <div className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 text-[9px] font-bold opacity-60">
                                    {item.id}
                                </div>
                                
                                <div className="flex flex-col items-center justify-center flex-1 w-full gap-1">
                                    <h3 className="text-3xl font-bold font-quran leading-none group-hover:scale-110 transition-transform duration-300 mb-1" style={{ color: 'var(--text-color)' }}>
                                        {item.name}
                                    </h3>
                                    
                                    <div className="h-px w-8 bg-black/10 dark:bg-white/10 mb-1" />
                                    
                                    <span className="text-[11px] font-medium uppercase tracking-wider opacity-60 transition-all font-sans line-clamp-1" style={{ color: 'var(--text-color)' }}>
                                        {item.transliteration}
                                    </span>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </main>

            <AnimatePresence>
                {selectedName && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                        onClick={() => setSelectedName(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0, y: 40 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0, y: 40 }}
                            className="themed-card w-full max-w-md p-0 overflow-hidden relative rounded-[2.5rem] shadow-2xl border border-white/20"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Decorative Top Section */}
                            <div className="bg-primary/10 pt-10 pb-8 px-6 text-center border-b border-primary/10 relative">
                                <div className="absolute top-4 left-0 right-0 flex justify-center">
                                    <span className="px-4 py-1 rounded-full bg-primary/20 text-xs font-mono tracking-widest uppercase text-primary">
                                        الاسم رقم {selectedName.id}
                                    </span>
                                </div>
                                
                                <h2 className="text-7xl font-bold font-quran text-primary mb-4 drop-shadow-md">
                                    {selectedName.name}
                                </h2>
                                
                                <div className="inline-block px-6 py-2 rounded-2xl bg-white/10 dark:bg-black/20 border border-white/10 mt-2">
                                    <p className="text-xl font-mono tracking-wider italic text-primary/80">
                                        {selectedName.transliteration}
                                    </p>
                                </div>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-end gap-3 text-primary/70">
                                        <h4 className="font-bold text-sm font-kufi">المعنى الميسر</h4>
                                        <div className="p-1.5 rounded-lg bg-primary/10"><Info className="w-4 h-4" /></div>
                                    </div>
                                    <p className="text-xl leading-relaxed opacity-90 font-amiri text-right pr-2">
                                        {selectedName.meaning}
                                    </p>
                                </div>

                                <div className="h-px bg-primary/10 w-1/2 mx-auto" />

                                <div className="space-y-3">
                                    <div className="flex items-center justify-end gap-3 text-primary/70">
                                        <h4 className="font-bold text-sm font-kufi">الدليل من الكتاب والسنة</h4>
                                        <div className="p-1.5 rounded-lg bg-primary/10"><Book className="w-4 h-4" /></div>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute top-0 right-0 bottom-0 w-1 bg-primary rounded-full opacity-30" />
                                        <p className="text-lg italic leading-relaxed opacity-80 pr-6 font-amiri text-right">
                                            {selectedName.evidence}
                                        </p>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => setSelectedName(null)}
                                    className="w-full py-5 rounded-2xl bg-primary text-white text-xl font-kufi shadow-xl shadow-primary/30 active:scale-[0.98] transition-all mt-6"
                                >
                                    إغلاق
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <BottomBar onHomeClick={handleHomeClick} onThemesClick={() => {}} showThemes={false} />
        </div>
    );
};

export default AsmaulHusna;
