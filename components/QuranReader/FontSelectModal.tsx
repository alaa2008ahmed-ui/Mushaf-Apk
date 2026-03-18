import React, { FC } from 'react';
import { FONTS } from './constants';

const FontSelectModal: FC<{
    isOpen: boolean,
    onClose: () => void,
    onSelect: (fontId: string) => void,
    currentFontId: string,
    isLandscape?: boolean
}> = ({ isOpen, onClose, onSelect, currentFontId, isLandscape }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[300] bg-black/30 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
            <div className={`modal-skinned w-full ${isLandscape ? 'max-w-4xl' : 'max-w-md sm:max-w-2xl'} rounded-2xl shadow-2xl flex flex-col max-h-[85vh] animate-modal-enter`} onClick={e => e.stopPropagation()}>
                <div className="p-4 theme-header-bg rounded-t-2xl flex justify-between items-center h-14 flex-none">
                    <h3 className="font-bold text-lg">اختر نوع الخط</h3>
                    <button onClick={onClose} className="hover:opacity-80 rounded-full bg-white/20 w-8 h-8 flex items-center justify-center">✕</button>
                </div>
                <div className={`p-3 overflow-y-auto flex-1 grid ${isLandscape ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2'}`}>
                    {FONTS.map(f => (
                        <button 
                            key={f.id} 
                            onClick={() => onSelect(f.id)} 
                            className={`w-full p-3 rounded-xl text-center font-bold transition flex flex-col justify-center items-center gap-1 ${currentFontId === f.id ? 'theme-accent-btn' : 'hover:opacity-80'}`} 
                            style={currentFontId !== f.id ? { backgroundColor: 'var(--qr-card-bg)', color: 'var(--qr-card-text)', border: '1px solid var(--qr-card-border)', fontFamily: f.id } : { fontFamily: f.id }}
                        >
                            <span className="text-lg">{f.name}</span>
                            <span className="text-xs opacity-70">﴿بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ﴾</span>
                            {currentFontId === f.id && <i className="fa-solid fa-check text-xs"></i>}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FontSelectModal;
