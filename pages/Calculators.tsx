import React, { useState } from 'react';
import BottomBar from '../components/BottomBar';
import { useTheme } from '../context/ThemeContext';
import ThemePageLock from '../components/ThemePageLock';
import ZakatCalculator from '../components/Calculators/ZakatCalculator';
import MawarithCalculator from '../components/Calculators/MawarithCalculator';
import KaffaratCalculator from '../components/Calculators/KaffaratCalculator';
import FitrAndUdhiyahCalculator from '../components/Calculators/FitrAndUdhiyahCalculator';
import { useLanguage } from '../context/LanguageContext';

interface CalculatorsProps {
    onBack: () => void; onNavigate: (id: string, params?: any) => void; 
}

const Calculators: React.FC<CalculatorsProps> = ({ onBack , onNavigate }) => {
    const { theme, themeKey } = useTheme();
    const { t, language } = useLanguage();
    const isBlackTheme = theme.bgColor === '#000000' || theme.name === 'أبيض وأسود';
    const isDefaultTheme = themeKey === 'default' || !themeKey;
    const cardBorderColor = isDefaultTheme 
        ? '#000000' 
        : (isBlackTheme 
            ? '#FFFFFF' 
            : (theme.palette?.[0] || '#000000'));
    const [activeTab, setActiveTab] = useState<'zakat' | 'mawarith' | 'kaffarat' | 'fitr-udhiyah'>('zakat');

    return (
        <div className="h-screen flex flex-col bg-transparent">
            {/* Header */}
            <header className="app-top-bar shadow-sm z-10">
                <div className="app-top-bar__inner">
                    <div className="relative flex items-center justify-center w-full">
                        <div className="absolute left-0">
                            <ThemePageLock />
                        </div>
                        <h1 className="app-top-bar__title text-2xl font-kufi">
                            {t('page.calculators_title', 'الحاسبة الشاملة')}
                        </h1>
                    </div>
                    <p className="app-top-bar__subtitle">
                        {t('page.calculators_subtitle', 'زكاة، مواريث، كفارات، فطر وأضحية')}
                    </p>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex px-2 sm:px-4 pt-2.5 sm:pt-3 gap-1.5 sm:gap-2 font-cairo z-10">
                {[
                    { id: 'zakat', label: language === 'en' ? 'Zakat' : 'الزكاة' },
                    { id: 'mawarith', label: language === 'en' ? 'Mawarith' : 'المواريث' },
                    { id: 'kaffarat', label: language === 'en' ? 'Kaffarat' : 'الكفارات' },
                    { id: 'fitr-udhiyah', label: language === 'en' ? 'Fitr & Udhiyah' : 'فطر وأضحية' }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 py-1.5 sm:py-2 px-1 sm:px-2 rounded-t-xl font-bold transition-all duration-300 flex items-center justify-center cursor-pointer
                            ${activeTab === tab.id 
                                ? (isDefaultTheme 
                                    ? 'bg-black text-white scale-105 origin-bottom shadow-md' 
                                    : (isBlackTheme ? 'bg-white text-black scale-105 origin-bottom shadow-md' : 'bg-primary text-white shadow-[0_-4px_10px_rgba(16,185,129,0.2)] scale-105 origin-bottom')
                                  ) 
                                : (isDefaultTheme 
                                    ? 'bg-white text-black shadow-sm opacity-80 hover:opacity-100' 
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                  )}`}
                        style={{
                            borderColor: cardBorderColor,
                            borderWidth: '1.5px',
                            borderStyle: 'solid',
                        }}
                    >
                        <span className="text-xs sm:text-sm whitespace-nowrap">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto px-4 pb-4 hide-scrollbar font-cairo bg-gray-50/50 dark:bg-black/20">
                <div className="max-w-3xl mx-auto pt-2">
                    {activeTab === 'zakat' && <ZakatCalculator cardBorderColor={cardBorderColor} />}
                    {activeTab === 'mawarith' && <MawarithCalculator cardBorderColor={cardBorderColor} />}
                    {activeTab === 'kaffarat' && <KaffaratCalculator cardBorderColor={cardBorderColor} />}
                    {activeTab === 'fitr-udhiyah' && <FitrAndUdhiyahCalculator cardBorderColor={cardBorderColor} />}
                </div>
                <div className="shrink-0 w-full h-32"></div>
            </main>

            <BottomBar onHomeClick={onBack} onThemesClick={() => {}} showThemes={false} />
        </div>
    );
};

export default Calculators;
