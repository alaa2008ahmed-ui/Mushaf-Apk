
import React, { useState, useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import BottomBar from '../components/BottomBar';
import { useTheme } from '../context/ThemeContext';
import { HISN_ALMUSLIM_CATEGORIES, HISN_ALMUSLIM_DATA } from '../data/hisnAlmuslimData';
import { registerBackInterceptor } from '../hooks/useBackButton';

function HisnAlmuslim({ onBack }) {
    const { theme } = useTheme();
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [zoomedItem, setZoomedItem] = useState(null);

    const openZoomModal = (item) => {
        setZoomedItem(item);
    };

    const closeZoomModal = () => {
        setZoomedItem(null);
    };

    useEffect(() => {
        const interceptor = () => {
            if (zoomedItem) {
                setZoomedItem(null);
                return true;
            } else if (selectedCategory) {
                setSelectedCategory(null);
                return true;
            }
            return false;
        };

        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [selectedCategory, zoomedItem]);

    const CategoriesScreen = () => (
        <div className="p-4 space-y-3">
            {HISN_ALMUSLIM_CATEGORIES.map((category, index) => {
                const colorType = index % 2 === 0 ? 'primary' : 'secondary';
                return (
                    <div key={category.id} onClick={() => setSelectedCategory(category)}
                          className={`themed-card p-4 rounded-xl shadow-sm border-r-4 flex items-center justify-between cursor-pointer active:scale-95 transition`}
                          style={{ borderRightColor: colorType === 'primary' ? theme.palette[0] : theme.palette[1] }}>
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center`} style={{backgroundColor: colorType === 'primary' ? theme.palette[0]+'20' : theme.palette[1]+'20', color: colorType === 'primary' ? theme.palette[0] : theme.palette[1]}}>
                                <i className={`fa-solid ${category.icon} text-xl`}></i>
                            </div>
                            <div>
                                <h2 className="font-bold text-base">{category.title}</h2>
                            </div>
                        </div>
                        <i className="fa-solid fa-angle-left themed-text-muted"></i>
                    </div>
                )
            })}
        </div>
    );

    const CategoryDetailScreen = () => {
        if (!selectedCategory) return null;
        const items = HISN_ALMUSLIM_DATA[selectedCategory.id] || [];

        return (
            <div className="space-y-4 fade-in">
                {items.map((item, index) => (
                    <div key={index} className="themed-card p-5 rounded-2xl border relative overflow-hidden group mb-4 transition-all duration-300">
                        <div className="flex justify-between items-center mb-3">
                            <span className={`text-xs px-2 py-1 rounded-full font-bold`} style={{ 
                                backgroundColor: item.type === 'ayah' ? '#dbeafe' : item.type === 'hadith' ? '#fef3c7' : '#dcfce7',
                                color: item.type === 'ayah' ? '#1e40af' : item.type === 'hadith' ? '#92400e' : '#166534'
                            }}>
                                {item.type === 'ayah' ? 'آية كريمة' : item.type === 'hadith' ? 'حديث نبوي' : 'دعاء / ذكر'}
                            </span>
                            {item.title && <h3 className="text-sm font-bold opacity-80">{item.title}</h3>}
                        </div>
                        <p className="text-xl leading-relaxed text-center font-amiri select-none">{item.text}</p>
                        {item.source && <p className="text-xs mt-3 text-center themed-text-muted opacity-80">المصدر: {item.source}</p>}
                        <div className="flex justify-center mt-3">
                            <button onClick={() => openZoomModal(item)} className="p-2 rounded-full hover:bg-card-bg-hover transition-colors">
                                <i className="fa-solid fa-magnifying-glass-plus text-lg"></i>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const handleHomeClick = () => {
        if (selectedCategory) {
            setSelectedCategory(null);
        } else {
            onBack();
        }
    };

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-transparent">
            <header className="app-top-bar">
                <div className="app-top-bar__inner">
                    <div className="relative flex items-center justify-center">
                        <h1 className="app-top-bar__title text-xl sm:text-2xl font-kufi flex items-center gap-2 justify-center">
                            {selectedCategory ? selectedCategory.title : 'حصن المسلم'}
                        </h1>
                    </div>
                    <p className="app-top-bar__subtitle">
                        {selectedCategory ? `أذكار ${selectedCategory.title}` : 'استعرض أبواب وأذكار حصن المسلم بسهولة.'}
                    </p>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto hide-scrollbar relative max-w-md mx-auto w-full p-4 pb-24">
                {selectedCategory ? <CategoryDetailScreen /> : <CategoriesScreen />}
            </main>

            <BottomBar onHomeClick={handleHomeClick} onThemesClick={() => {}} showThemes={false} />

            {zoomedItem && (
                <div className="fixed inset-0 bg-black/80 z-[100] flex justify-center items-center p-4 backdrop-blur-sm" onClick={closeZoomModal}>
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
            )}
        </div>
    );
}

export default HisnAlmuslim;
