import React, { FC } from 'react';

const AutoScrollSettingsModal: FC<{
    isOpen: boolean,
    onClose: () => void,
    onSelectTime: (minutes: number) => void,
    currentMinutes: number,
    isLandscape?: boolean
}> = ({ isOpen, onClose, onSelectTime, currentMinutes, isLandscape }) => {
    if (!isOpen) return null;
    const options = Array.from({length: 56}, (_, i) => i + 5);
    return (
        <div className="fixed inset-0 z-[300] bg-transparent flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
            <div className={`modal-skinned w-full ${isLandscape ? 'max-w-4xl' : 'max-w-sm sm:max-w-2xl'} rounded-2xl shadow-2xl flex flex-col max-h-[90vh]`} onClick={e => e.stopPropagation()}>
                <div className="p-4 overflow-y-auto flex-1">
                    <div className="mb-2 font-bold text-center">وقت التمرير (بالدقائق)</div>
                    <div className={`grid ${isLandscape ? 'grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2' : 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2'}`}>
                        {options.map(m => (
                            <button key={m} onClick={() => { onSelectTime(m); }} className={`p-2 rounded-lg text-center font-bold transition ${currentMinutes === m ? 'theme-accent-btn' : 'themed-card-bg border'}`}>
                                <span className="text-sm">{m}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="p-3 border-t themed-card-bg rounded-b-2xl">
                    <button onClick={onClose} className="w-full py-2 rounded-xl font-bold theme-btn-bg">إغلاق</button>
                </div>
            </div>
        </div>
    );
};

export default AutoScrollSettingsModal;
