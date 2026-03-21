import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface ZoomModalProps {
    zoomedItem: {
        title?: string;
        text: string;
        source?: string;
    } | null;
    onClose: () => void;
}

const ZoomModal: React.FC<ZoomModalProps> = ({ zoomedItem, onClose }) => {
    const { theme } = useTheme();

    if (!zoomedItem) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-[100] flex justify-center items-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-modal-bg text-modal-text p-8 rounded-3xl w-full max-w-2xl text-center relative scale-in shadow-2xl border-2 border-modal-border" style={{ fontFamily: theme.font }} onClick={e => e.stopPropagation()}>
                {zoomedItem.title && <h3 className="text-xl font-bold mb-4" style={{ color: theme.palette[1] }}>{zoomedItem.title}</h3>}
                <p className="text-3xl md:text-4xl leading-relaxed">
                    {zoomedItem.text}
                </p>
                {zoomedItem.source && (
                    <p className="text-lg mt-6 font-bold" style={{ color: theme.palette[1] }}>
                        المصدر: {zoomedItem.source}
                    </p>
                )}
            </div>
        </div>
    );
};

export default ZoomModal;
