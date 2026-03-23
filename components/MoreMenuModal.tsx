
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, Calculator, Mic, GraduationCap } from 'lucide-react';

interface MoreMenuModalProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (pageId: string) => void;
    theme: any;
    themeKey: string;
}

const MoreMenuModal: React.FC<MoreMenuModalProps> = ({
    isOpen,
    onClose,
    onNavigate,
    theme,
    themeKey
}) => {
    const menuItems = [
        { id: 'nawawi', label: "📚 الأربعون النووية", icon: <BookOpen className="w-5 h-5" /> },
        { id: 'tajweed-education', label: "📖 تعليم التجويد", icon: <GraduationCap className="w-5 h-5" /> },
        { id: 'calculators', label: "🧮 الحاسبة الشرعية", icon: <Calculator className="w-5 h-5" /> },
        { id: 'voice-control', label: "🎙️ التحكم الصوتي", icon: <Mic className="w-5 h-5" /> },
    ];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
                    style={{ backgroundColor: theme.modalBg || '#ffffff', color: theme.textColor }}
                    onClick={e => e.stopPropagation()}
                >
                    <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: theme.barBorder || '#e5e7eb' }}>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <span className="text-indigo-500">✨</span>
                            المزيد
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-6 grid grid-cols-1 gap-3">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    onNavigate(item.id);
                                    onClose();
                                }}
                                className="flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-95 text-right w-full"
                                style={{ 
                                    backgroundColor: themeKey === 'default' ? '#f0fdf4' : 'rgba(255,255,255,0.05)',
                                    border: `1px solid ${theme.barBorder || '#e5e7eb'}`
                                }}
                            >
                                <div className="p-2 rounded-xl bg-white/50 shadow-sm">
                                    {item.icon}
                                </div>
                                <span className="font-bold text-lg">{item.label}</span>
                            </button>
                        ))}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default MoreMenuModal;
