import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface ZoomModalProps {
    zoomedDhikr: {
        text: string;
        source?: string;
    } | null;
    onClose: () => void;
}

const ZoomModal: React.FC<ZoomModalProps> = ({ zoomedDhikr, onClose }) => {
    const { theme } = useTheme();

    if (!zoomedDhikr) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-[100] flex justify-center items-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-modal-bg text-modal-text p-8 rounded-3xl w-full max-w-2xl text-center relative scale-in shadow-2xl border-2 border-modal-border" style={{ fontFamily: theme.font }} onClick={e => e.stopPropagation()}>
                <p className="text-3xl md:text-4xl leading-relaxed">
                    {zoomedDhikr.text}
                </p>
                {zoomedDhikr.source && (
                    <p className="text-lg mt-6 font-bold" style={{ color: theme.palette[1] }}>
                        {zoomedDhikr.source}
                    </p>
                )}
                <div className="mt-8">
                    <button onClick={onClose} className="w-full py-3 rounded-xl font-bold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">إغلاق</button>
                </div>
            </div>
        </div>
    );
};

export default ZoomModal;
