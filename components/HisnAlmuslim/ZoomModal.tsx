import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

interface ZoomModalProps {
    zoomedItem: {
        title?: string;
        text: string;
        source?: string;
        isEn?: boolean;
    } | null;
    onClose: () => void;
}

const ZoomModal: React.FC<ZoomModalProps> = ({ zoomedItem, onClose }) => {
    const { theme } = useTheme();
    const { language } = useLanguage();
    const isEn = zoomedItem?.isEn ?? (language === 'en' || (zoomedItem?.text ? !/[\u0600-\u06FF]/.test(zoomedItem.text) : false));

    if (!zoomedItem) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-[100] flex justify-center items-center p-4 backdrop-blur-sm" onClick={onClose} dir={isEn ? 'ltr' : 'rtl'}>
            <div 
                className="bg-modal-bg text-modal-text p-6 sm:p-8 rounded-3xl w-full max-w-2xl text-center relative scale-in shadow-2xl border-2 border-modal-border flex flex-col max-h-[90vh]" 
                style={{ fontFamily: isEn ? 'sans-serif' : theme.font }} 
                onClick={e => e.stopPropagation()}
            >
                <div className="overflow-y-auto hide-scrollbar flex-1 py-4">
                    {zoomedItem.title && (
                        <h3 className={`text-xl font-bold mb-4 ${isEn ? 'text-left font-sans' : 'text-center'}`} style={{ color: theme.palette[1] }}>
                            {zoomedItem.title}
                        </h3>
                    )}
                    <p className={`leading-relaxed ${isEn ? 'text-xl sm:text-2xl text-left font-sans font-medium' : 'text-3xl md:text-4xl text-center font-amiri'}`}>
                        {zoomedItem.text}
                    </p>
                    {zoomedItem.source && (
                        <p className={`text-base sm:text-lg mt-6 font-bold ${isEn ? 'text-left font-sans' : 'text-center font-cairo'}`} style={{ color: theme.palette[1] }}>
                            {isEn ? `Source: ${zoomedItem.source}` : `المصدر: ${zoomedItem.source}`}
                        </p>
                    )}
                </div>

                <div className="mt-6 shrink-0">
                    <button 
                        onClick={onClose} 
                        className="w-full py-3 rounded-xl font-bold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:opacity-90 transition-opacity cursor-pointer"
                    >
                        {isEn ? 'Close' : 'إغلاق'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ZoomModal;
