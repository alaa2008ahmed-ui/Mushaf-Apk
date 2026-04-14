import React from 'react';
import { motion } from 'framer-motion';
import { X, Info, BookOpen, HelpCircle, Star } from 'lucide-react';
import { SURAH_DETAILS } from '../../data/surahInfoData';
import { toArabic } from './constants';

interface SurahInfoModalProps {
  surahName: string;
  surahNumber: number;
  onClose: () => void;
}

const SurahInfoModal: React.FC<SurahInfoModalProps> = ({ surahName, surahNumber, onClose }) => {
  const details = SURAH_DETAILS[surahNumber];

  if (!details) return null;

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="modal-skinned w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col border theme-card-border"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 theme-header-bg flex items-center justify-between border-b theme-card-border relative">
          {/* Close Button on the Left */}
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors theme-header-text z-10"
          >
            <X size={24} />
          </button>

          {/* Centered Title */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <h2 className="text-2xl font-bold theme-header-text leading-tight" style={{ fontFamily: 'var(--font-amiri)' }}>
              {surahName}
            </h2>
            <p className="text-[10px] opacity-60 font-bold theme-header-text">تفاصيل ومعلومات</p>
          </div>

          {/* Surah Number on the Right */}
          <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center text-2xl font-bold theme-header-text z-10">
            {toArabic(surahNumber)}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar text-right theme-card-bg" dir="rtl">
          
          {/* About */}
          <section className="space-y-2">
            <div className="flex items-center gap-2 theme-accent-text font-bold text-base">
              <Info size={18} />
              <h3>نبذة عن السورة</h3>
            </div>
            <p className="theme-card-text leading-relaxed opacity-90 pr-6 text-sm">
              {details.about}
            </p>
          </section>

          {/* Naming */}
          <section className="space-y-2">
            <div className="flex items-center gap-2 theme-accent-text font-bold text-base">
              <HelpCircle size={18} />
              <h3>سبب التسمية</h3>
            </div>
            <p className="theme-card-text leading-relaxed opacity-90 pr-6 text-sm">
              {details.naming}
            </p>
          </section>

          {/* Purposes */}
          <section className="space-y-2">
            <div className="flex items-center gap-2 theme-accent-text font-bold text-base">
              <BookOpen size={18} />
              <h3>مقاصد السورة</h3>
            </div>
            <p className="theme-card-text leading-relaxed opacity-90 pr-6 text-sm">
              {details.purposes}
            </p>
          </section>

          {/* Virtues */}
          <section className="space-y-2">
            <div className="flex items-center gap-2 theme-accent-text font-bold text-base">
              <Star size={18} />
              <h3>فضل السورة</h3>
            </div>
            <p className="theme-card-text leading-relaxed opacity-90 pr-6 text-sm">
              {details.virtues}
            </p>
          </section>

        </div>
      </motion.div>
    </div>
  );
};

export default SurahInfoModal;
