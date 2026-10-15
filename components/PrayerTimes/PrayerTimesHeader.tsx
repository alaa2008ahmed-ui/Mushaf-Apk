import React from 'react';
import ThemePageLock from '../ThemePageLock';
import { useLanguage } from '../../context/LanguageContext';

interface PrayerTimesHeaderProps {
    handleRefreshLocation: () => void;
    onOpenNotifications: () => void;
    cityGov: string;
    fullCountry: string;
    combinedCode?: string;
    topBarTextColor: string;
    onBack?: () => void;
    onHome?: () => void;
}

const PrayerTimesHeader: React.FC<PrayerTimesHeaderProps> = ({
    handleRefreshLocation,
    onOpenNotifications,
    cityGov,
    fullCountry,
    combinedCode,
    topBarTextColor,
    onBack,
    onHome
}) => {
    const { t } = useLanguage();

    return (
        <header className="app-top-bar">
            <div className="app-top-bar__inner">
                <div className="relative flex items-center justify-center min-h-[44px]">
                    {/* سهم الرجوع للخلف على يمين النص بالشريط العلوي مع زر تحديث الموقع */}
                    <div className="absolute right-0 flex items-center gap-1">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title="رجوع للخلف"
                                aria-label="رجوع للخلف"
                            >
                                <i className="fa-solid fa-arrow-right text-xl"></i>
                            </button>
                        )}
                        <button
                            id="location-refresh-btn"
                            onClick={handleRefreshLocation}
                            className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                            title="تحديث الموقع"
                            aria-label="تحديث الموقع"
                        >
                            <i className="text-lg active:rotate-180 duration-700 fa-solid fa-location-crosshairs"></i>
                        </button>
                    </div>

                    {/* عنوان الصفحة في الوسط */}
                    <div className="text-center px-24">
                        <h1 className="app-top-bar__title text-base sm:text-lg md:text-xl font-kufi truncate">
                            {cityGov}
                        </h1>
                    </div>

                    {/* أيقونة المنزل على يسار النص للعودة إلى الصفحة الرئيسية مع الإعدادات وقفل الثيم */}
                    <div className="absolute left-0 flex items-center gap-1">
                        <ThemePageLock />
                        <button
                            onClick={onOpenNotifications}
                            className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                            title={t('sidemenu.settings', 'الإعدادات')}
                            aria-label={t('sidemenu.settings', 'الإعدادات')}
                        >
                            <i className="text-lg fa-solid fa-gear"></i>
                        </button>
                        {onHome && (
                            <button
                                onClick={onHome}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title="الصفحة الرئيسية"
                                aria-label="الصفحة الرئيسية"
                            >
                                <i className="fa-solid fa-house text-xl"></i>
                            </button>
                        )}
                    </div>
                </div>
                 <div className="app-top-bar__subtitle flex items-center justify-center gap-1.5" dir="rtl">
                    <span className="font-bold">{fullCountry}</span>
                    {combinedCode && (
                        <span className="text-[10px] font-black text-white bg-black/20 px-1.5 py-0 rounded border border-white/20" dir="ltr">{combinedCode}</span>
                    )}
                </div>
            </div>
        </header>
    );
};

export default PrayerTimesHeader;
