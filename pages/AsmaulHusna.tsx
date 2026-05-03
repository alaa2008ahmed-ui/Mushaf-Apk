
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import BottomBar from '../components/BottomBar';
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
                <div className="app-top-bar__inner flex items-center justify-center px-4">
                    <div className="text-center">
                        <h1 className="app-top-bar__title text-2xl font-kufi">أسماء الله الحسنى</h1>
                        <p className="app-top-bar__subtitle text-xs">٩٩ اسماً من أحصاها دخل الجنة</p>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-hidden flex flex-col px-4 z-10">
                <div className="flex-1 overflow-y-auto hide-scrollbar pt-4 pb-48">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-w-5xl mx-auto">
                        {asmaulHusna.map((item) => (
                            <motion.button
                                key={item.id}
                                whileHover={{ y: -4, scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedName(item)}
                                className="relative bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-2xl p-4 flex flex-col items-center justify-center text-center aspect-square group border border-white/10 shadow-lg shadow-black/5 hover:shadow-primary/20 transition-all duration-300 overflow-hidden"
                            >
                                {/* Decorative Background Elements */}
                                <div className="absolute top-0 right-0 w-12 h-12 bg-primary/5 rounded-full -mr-6 -mt-6 transition-transform duration-700 group-hover:scale-150 blur-xl" />
                                <div className="absolute bottom-0 left-0 w-12 h-12 bg-primary/5 rounded-full -ml-6 -mb-6 transition-transform duration-700 group-hover:scale-150 blur-xl" />
                                
                                <h3 className="relative z-10 text-lg font-bold font-amiri leading-tight group-hover:text-primary transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
                                    {item.name}
                                </h3>
                                
                                <span className="absolute bottom-1 right-2 text-[8px] font-mono opacity-30 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text-color)' }}>
                                    #{item.id}
                                </span>
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
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setSelectedName(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="themed-card w-full max-w-sm p-6 overflow-hidden relative rounded-3xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center space-y-6 pt-4">
                                <div className="space-y-1">
                                    <span className="text-xs opacity-50 font-mono">الاسم رقم {selectedName.id}</span>
                                    <h2 className="text-6xl font-bold font-quran text-primary leading-tight">{selectedName.name}</h2>
                                    <p className="text-lg opacity-60 font-mono italic">{selectedName.transliteration}</p>
                                </div>

                                <div className="space-y-4 text-right">
                                    <div className="space-y-2">
                                        <h4 className="font-bold flex items-center justify-end gap-2 text-sm font-amiri">
                                            <Info className="w-4 h-4" />
                                            المعنى الميسر
                                        </h4>
                                        <p className="text-lg leading-relaxed opacity-90 font-amiri">{selectedName.meaning}</p>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="font-bold flex items-center justify-end gap-2 text-sm font-amiri">
                                            <Book className="w-4 h-4" />
                                            الدليل من القرآن أو السنة
                                        </h4>
                                        <p className="text-md italic leading-relaxed opacity-80 bg-black/5 p-4 rounded-2xl border-r-4 border-primary font-amiri">
                                            {selectedName.evidence}
                                        </p>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => setSelectedName(null)}
                                    className="w-full py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all mt-4"
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
