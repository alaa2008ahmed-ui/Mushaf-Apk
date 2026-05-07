import React from 'react';

interface PrayerTimesDateSearchProps {
    searchInput: string;
    setSearchInput: React.Dispatch<React.SetStateAction<string>>;
    handleManualSearch: () => void;
    searchIconRef: React.RefObject<HTMLElement>;
    primaryColor: string;
    secondaryColor: string;
}

const PrayerTimesDateSearch: React.FC<PrayerTimesDateSearchProps> = ({
    searchInput,
    setSearchInput,
    handleManualSearch,
    searchIconRef,
    primaryColor,
    secondaryColor
}) => {
    return (
        <>
             <div className="flex items-center justify-center gap-2 px-1">
                <button onClick={handleManualSearch} className="themed-card text-sm font-black px-3 py-2 rounded-lg shadow-sm active:scale-95 hover:bg-card-bg-hover" style={{ color: primaryColor }}>بحث</button>
                <div id="search-input-container" className="flex-1 relative themed-card rounded-lg overflow-hidden shadow-sm">
                    <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()} placeholder="عن مدينة أو محافظة..." 
                        className="w-full bg-transparent py-2.5 px-3 pr-9 text-[11px] outline-none transition-all" style={{ color: primaryColor }}/>
                    <button onClick={handleManualSearch} className="absolute right-3 top-2.5" style={{color: secondaryColor}}>
                        <i ref={searchIconRef} className="fa-solid fa-magnifying-glass"></i>
                    </button>
                </div>
            </div>
        </>
    );
};

export default PrayerTimesDateSearch;
