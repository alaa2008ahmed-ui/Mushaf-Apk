import React from 'react';

interface PrayerTimesHeaderProps {
    handleRefreshLocation: () => void;
    onOpenNotifications: () => void;
    cityGov: string;
    fullCountry: string;
    combinedCode?: string;
    topBarTextColor: string;
}

const PrayerTimesHeader: React.FC<PrayerTimesHeaderProps> = ({
    handleRefreshLocation,
    onOpenNotifications,
    cityGov,
    fullCountry,
    combinedCode,
    topBarTextColor
}) => {
    return (
        <header className="app-top-bar">
            <div className="app-top-bar__inner relative">
                <div className="relative flex items-center justify-center min-h-[40px]">
                    <h1 className="app-top-bar__title text-xl sm:text-2xl font-kufi truncate px-12" style={{ color: topBarTextColor }}>{cityGov}</h1>
                    <div className="absolute right-0 flex items-center gap-1">
                         <i onClick={onOpenNotifications} className="text-xl cursor-pointer fa-solid fa-bell p-2" style={{ color: topBarTextColor }}></i>
                         <i id="location-refresh-btn" onClick={handleRefreshLocation} className="text-xl cursor-pointer active:rotate-180 duration-700 fa-solid fa-location-crosshairs p-2" style={{ color: topBarTextColor }}></i>
                    </div>
                </div>
                 <div className="app-top-bar__subtitle flex items-center justify-center gap-1.5" dir="rtl" style={{ color: topBarTextColor }}>
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
