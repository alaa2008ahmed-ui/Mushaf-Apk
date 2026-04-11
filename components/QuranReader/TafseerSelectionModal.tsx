import React, { FC } from 'react';
import { TAFSEERS } from './constants';

const TafseerSelectionModal: FC<{
    isOpen: boolean,
    onClose: () => void,
    onSelect: (tafseerId: string) => void,
    currentTafseerId: string,
    isLandscape?: boolean
}> = ({ isOpen, onClose, onSelect, currentTafseerId, isLandscape }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[1200] bg-black/40 flex items-center justify-center p-4 backdrop-blur-[2px] animate-fadeIn" onClick={onClose}>
            <div className={`modal-skinned w-full ${isLandscape ? 'max-w-4xl' : 'max-w-sm sm:max-w-2xl'} rounded-2xl shadow-2xl flex flex-col max-h-[80vh]`} onClick={e => e.stopPropagation()}>
                <div className={`p-2 overflow-y-auto flex-1 grid ${isLandscape ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3' : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2'}`}>
                    {TAFSEERS.map(t => (
                        <button key={t.id} onClick={() => onSelect(t.id)} 
                            className={`w-full p-3 rounded-xl text-center font-bold transition flex flex-col justify-center items-center gap-1 ${currentTafseerId === t.id ? '' : 'hover:opacity-80'}`} 
                            style={{ 
                                backgroundColor: 'var(--qr-card-bg)', 
                                color: currentTafseerId === t.id ? 'var(--qr-accent)' : 'var(--qr-card-text)', 
                                border: `2px solid ${currentTafseerId === t.id ? 'var(--qr-accent)' : 'var(--qr-card-border)'}` 
                            }}>
                            <span className="text-sm">{t.name}</span>
                            {currentTafseerId === t.id && <i className="fa-solid fa-check text-xs"></i>}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TafseerSelectionModal;
