import React, { FC } from 'react';
import { FONTS } from './constants';
import { useLanguage } from '../../context/LanguageContext';

const FONT_NAMES_EN: Record<string, string> = {
    "نسخ": "Naskh",
    "نسخ حديث": "Modern Naskh",
    "تراثي": "Traditional",
    "ثلوث": "Thuluth",
    "رقعة": "Ruq'ah",
    "ورش": "Warsh",
    "حفص": "Hafs",
    "خط المصحف": "Mushaf Font",
    "قطيبة": "Katibeh",
    "قلم": "Qalam",
    "كوفي": "Kufi",
    "مجمع الملك فهد": "King Fahd Complex",
    "مجود": "Mujawwad",
    "ميرزا": "Mirza"
};

const FontSelectModal: FC<{
    isOpen: boolean,
    onClose: () => void,
    onSelect: (fontId: string) => void,
    currentFontId: string,
    isLandscape?: boolean
}> = ({ isOpen, onClose, onSelect, currentFontId, isLandscape }) => {
    const { language, dir } = useLanguage();
    const isEn = language === 'en';
    if (!isOpen) return null;
    return (
        <div className={`fixed inset-0 z-[1200] bg-transparent flex justify-center items-center ${isLandscape ? 'p-0' : 'p-4'} animate-fadeIn`} onClick={onClose}>
            <div dir={dir} className={`modal-skinned w-full ${isLandscape ? 'max-w-4xl h-full rounded-none max-h-screen' : 'max-w-md sm:max-w-2xl rounded-2xl max-h-[90vh]'} shadow-2xl flex flex-col animate-modal-enter`} onClick={e => e.stopPropagation()}>
                <div className={`p-3 overflow-y-auto flex-1 grid ${isLandscape ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2'}`}>
                    {FONTS.map(f => (
                        <button 
                            key={f.id} 
                            onClick={() => onSelect(f.id)} 
                            className={`w-full p-3 rounded-xl text-center font-bold transition flex flex-col justify-center items-center gap-1 ${currentFontId === f.id ? 'theme-accent-btn' : 'hover:opacity-80'}`} 
                            style={currentFontId !== f.id ? { backgroundColor: 'var(--qr-card-bg)', color: 'var(--qr-card-text)', border: '1px solid var(--qr-card-border)', fontFamily: f.id } : { fontFamily: f.id }}
                        >
                            <span className="text-lg">{isEn ? (FONT_NAMES_EN[f.name] || f.name) : f.name}</span>
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
