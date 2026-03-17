import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import BottomBar from '../components/BottomBar';
import { useTheme } from '../context/ThemeContext';
import { prayerNamesAr } from '../data/prayerTimesData';
import { usePrayerTimes, copyAssetToDevice } from '../context/PrayerTimesContext';
import { registerBackInterceptor } from '../hooks/useBackButton';

const internetTones = [
    { name: "أذان 1", path: "/assets/audio/azan1.mp3" },
    { name: "أذان 2", path: "/assets/audio/azan2.mp3" },
    { name: "أذان 3", path: "/assets/audio/azan3.mp3" },
    { name: "أذان 4", path: "/assets/audio/azan4.mp3" },
    { name: "تكبيرة 1", path: "/assets/audio/takbeer1.mp3" },
    { name: "تكبيرة 2", path: "/assets/audio/takbeer2.mp3" },
    { name: "تكبيرة 3", path: "/assets/audio/takbeer3.mp3" },
    { name: "تكبيرة 4", path: "/assets/audio/takbeer4.mp3" },
    { name: "تكبيرة 5", path: "/assets/audio/takbeer5.mp3" },
    { name: "تكبيرة 6", path: "/assets/audio/takbeer6.mp3" },
    { name: "الصلاة", path: "/assets/audio/Salah.mp3" },
    { name: "الشهادة", path: "/assets/audio/shahadah.mp3" },
];

// Helper Functions
const applyOffset = (timeStr, offsetMins) => {
    if (!timeStr || timeStr.includes('--')) return "--:--";
    let [h, m] = timeStr.split(':');
    let date = new Date();
    date.setHours(parseInt(h), parseInt(m), 0);
    date.setMinutes(date.getMinutes() + (offsetMins || 0));
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

const formatTime12 = (time) => {
    if(!time || time.includes('--')) return "--:-- --";
    let [h, m] = time.split(':');
    h = parseInt(h);
    const ap = h >= 12 ? 'pm' : 'am';
    h = h % 12 || 12;
    return `<span class="text-xl font-black">${h}:${m.toString().padStart(2, '0')}</span> <span class="time-period">${ap}</span>`;
};

const formatTime12_EN = (time) => {
    if (!time || time.includes('--')) return "--:-- --";
    let [h, m] = time.split(':');
    h = parseInt(h);
    const ap = h >= 12 ? 'pm' : 'am';
    h = h % 12 || 12;
    return `${h}:${m.toString().padStart(2, '0')} ${ap}`;
}

const formatTime12_clean = (time) => {
    if (!time || time.includes('--')) return "--:-- --";
    let [h, m] = time.split(':');
    h = parseInt(h);
    const ap = h >= 12 ? 'pm' : 'am';
    h = h % 12 || 12;
    return `${h}:${m.toString().padStart(2, '0')} ${ap}`;
}

const getMediaURL = (s) => {
    if (!s) return '';
    if (s.startsWith('file://')) {
        return Capacitor.convertFileSrc(s);
    }
    // For bundled assets starting with '/', return as is so the WebView loads them from its local server
    return s;
};

// Global audio instance for previewing tones
let previewAudio: HTMLAudioElement | null = null;

const playNotificationSound = (source) => {
    if (!source || source === 'none') return;
    const mediaUrl = getMediaURL(source);
    
    // Stop any currently playing preview
    stopNotificationSound();

    try {
        previewAudio = new Audio(mediaUrl);
        previewAudio.play().catch(e => console.error("Audio play failed:", e));
    } catch (e) {
        console.error("Failed to play notification sound with HTML5 Audio:", e);
    }
};

const stopNotificationSound = () => {
    if (previewAudio) {
        previewAudio.pause();
        previewAudio.currentTime = 0;
        previewAudio = null;
    }
};


// Main Component
function PrayerTimes({ onBack }) {
    const { theme, themeKey } = useTheme();
    const { times, dates, nextPrayer, countdown, config, refreshLocation, manualSearch, updateConfig } = usePrayerTimes();

    const isBlackAndWhite = themeKey === 'black_and_white';
    const primaryColor = isBlackAndWhite ? '#FFFFFF' : theme.palette[0];
    const secondaryColor = isBlackAndWhite ? '#FFFFFF' : theme.palette[1];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEditingKey, setCurrentEditingKey] = useState(null);
    const [tempOffset, setTempOffset] = useState(0);
    const [tempIqama, setTempIqama] = useState(0);
    const [searchInput, setSearchInput] = useState("");
    const searchIconRef = useRef(null);
    const [toastMessage, setToastMessage] = useState('');
    
    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => setToastMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [toastMessage]);
    
    const showToast = useCallback((msg) => setToastMessage(msg), []);

    useEffect(() => {
        const interceptor = () => {
            if (isModalOpen) {
                setIsModalOpen(false);
                return true;
            }
            return false;
        };
        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [isModalOpen]);

    const handleRefreshLocation = async () => {
        showToast("جاري تحديد الموقع الحالي...");
        try {
            await refreshLocation();
            showToast("تم تحديث الموقع بنجاح");
        } catch (e) {
            console.error(e);
            showToast("حدث خطأ أثناء تحديد الموقع");
        }
    };

    const handleManualSearch = async () => {
        if(!searchInput) return;
        if (searchIconRef.current) searchIconRef.current.className = 'fa-solid fa-spinner fa-spin';
        try {
            await manualSearch(searchInput);
        } catch(e) { 
            console.error(e); 
            showToast("حدث خطأ أثناء البحث أو لم يتم العثور على نتائج.");
        } 
        finally { if (searchIconRef.current) searchIconRef.current.className = 'fa-solid fa-magnifying-glass'; }
    }
    
    const openSettings = (key) => {
        setCurrentEditingKey(key);
        setTempOffset(config.prayerOffsets[key] || 0);
        setTempIqama(config.iqamaOffsets[key] || 0);
        setIsModalOpen(true);
    };

    const saveUserConfig = () => {
        stopNotificationSound(); // Stop audio preview on save
        updateConfig({
            prayerOffsets: { ...config.prayerOffsets, [currentEditingKey]: tempOffset },
            iqamaOffsets: { ...config.iqamaOffsets, [currentEditingKey]: tempIqama }
        });
        setIsModalOpen(false);
    };

    const closeModal = () => {
        stopNotificationSound(); // Stop audio preview on close
        setIsModalOpen(false);
    };

    const togglePrayerSound = (key) => {
        updateConfig({
            mutedPrayers: {...config.mutedPrayers, [key]: !config.mutedPrayers[key] }
        });
    }

    const handleToneSelection = async (e) => {
        const value = e.target.value;
        if (value === 'custom') {
            document.getElementById('sound-file-input').click();
        } else if (value === 'none') {
            stopNotificationSound();
            updateConfig({
                tones: { ...config.tones, [currentEditingKey]: { name: 'بدون تنبيه', data: 'none' } }
            });
        } else {
            const selectedInternet = internetTones.find(t => t.path === value);
            if (selectedInternet) {
                try {
                    let localUri = selectedInternet.path;
                    if (localUri.startsWith('http')) {
                        showToast("جاري تحميل الصوت للمعاينة...");
                        localUri = await copyAssetToDevice(selectedInternet.path);
                    }
                    playNotificationSound(localUri); // Play preview
                    updateConfig({
                        tones: { ...config.tones, [currentEditingKey]: { name: selectedInternet.name, data: localUri, originalUrl: selectedInternet.path }}
                    });
                    if (localUri.startsWith('http')) {
                        showToast("تم اختيار الصوت بنجاح");
                    }
                } catch (err) {
                    console.error("Failed to download tone:", err);
                    showToast("فشل في تحميل الملف الصوتي. يرجى التحقق من اتصالك بالإنترنت.");
                }
            }
        }
    };
    
    const handleToneUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const audioDataUrl = event.target.result as string;
                playNotificationSound(audioDataUrl); // Play preview
                updateConfig({
                    tones: { ...config.tones, [currentEditingKey]: { name: file.name, data: audioDataUrl }}
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const renderToneSelector = () => {
        if (!currentEditingKey) return null;
        
        const currentTone = config.tones[currentEditingKey];
        let selectValue = '/assets/audio/takbeer1.mp3'; // Default to Takbeer 1
        if (currentTone) {
            if (currentTone.data === 'none') {
                selectValue = 'none';
            } else if (currentTone.data.startsWith('data:')) {
                selectValue = 'custom';
            } else if (currentTone.originalUrl) {
                selectValue = currentTone.originalUrl;
            } else {
                selectValue = currentTone.data;
            }
        }

        return (
            <div>
                <label className="block text-[10px] font-black mb-2 uppercase tracking-widest" style={{ color: secondaryColor }}>نغمة التنبيه</label>
                <div className="relative">
                    <select value={selectValue} onChange={handleToneSelection} className="w-full appearance-none themed-bg-alt border themed-card-border rounded-xl py-3 px-4 text-xs font-bold" style={{ color: primaryColor }}>
                        <option value="none">بدون تنبيه</option>
                        {internetTones.map(tone => <option key={tone.path} value={tone.path}>{tone.name}</option>)}
                        <option value="custom">نغمة مخصصة...</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3">
                         <i className="fa-solid fa-chevron-down text-xs" style={{color: secondaryColor}}></i>
                    </div>
                </div>
                <input type="file" id="sound-file-input" accept="audio/*" className="hidden" onChange={handleToneUpload}/>
                {selectValue === 'custom' && currentTone && <p className="text-center text-[10px] mt-1 truncate" style={{ color: secondaryColor }}>الملف الحالي: {currentTone.name}</p>}
            </div>
        );
    };

    return (
        <div className="h-screen w-screen flex flex-col" style={{ backgroundColor: theme.bgColor || '#0D1B2A', color: theme.textColor }}>
            <header className="app-top-bar">
                <div className="app-top-bar__inner">
                    <div className="flex items-center justify-center gap-2">
                        <i onClick={handleRefreshLocation} className="text-xl cursor-pointer active:rotate-180 duration-700 fa-solid fa-location-crosshairs" style={{ color: primaryColor }}></i>
                        <h1 className="app-top-bar__title text-xl sm:text-2xl font-kufi truncate" style={{ color: primaryColor }}>{config.location.cityGov}</h1>
                    </div>
                     <div className="flex items-center justify-center gap-2" dir="rtl">
                        <p className="text-xs font-bold" style={{ color: primaryColor }}>{config.location.fullCountry}</p>
                        {config.location.combinedCode && (
                            <span className="text-xs font-black text-white bg-black/20 px-2 py-0.5 rounded-md border border-white/20" dir="ltr">{config.location.combinedCode}</span>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto hide-scrollbar p-4 pb-24">
                <div className="max-w-md mx-auto">
                    <div className="themed-card rounded-2xl p-2.5 flex items-center justify-between shadow-sm mb-5">
                        <div className="flex-1 text-center border-l themed-text-muted/20">
                            <p className="text-[9px] font-bold uppercase mb-0.5" style={{ color: secondaryColor }}>التاريخ الهجري</p>
                            <p className="text-xs font-bold" style={{color: secondaryColor}}>{dates.hijri}</p>
                        </div>
                        <div className="flex-1 text-center">
                            <p className="text-[9px] font-bold uppercase mb-0.5" style={{ color: primaryColor }}>التاريخ الميلادي</p>
                            <p className="text-xs font-bold" style={{color: primaryColor}}>{dates.gregorian}</p>
                        </div>
                    </div>

                     <div className="flex items-center justify-center gap-3 mb-5 px-1">
                        <button onClick={handleManualSearch} className="themed-card text-sm font-black px-3 py-1.5 rounded-lg shadow-sm active:scale-95 hover:bg-card-bg-hover" style={{ color: primaryColor }}>بحث</button>
                        <div className="flex-1 relative themed-card rounded-xl overflow-hidden shadow-sm">
                            <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()} placeholder="عن مدينة أو محافظة..." 
                                className="w-full bg-transparent py-2.5 px-4 pr-10 text-xs outline-none transition-all" style={{ color: primaryColor }}/>
                            <button onClick={handleManualSearch} className="absolute right-3 top-2.5" style={{color: secondaryColor}}>
                                <i ref={searchIconRef} className="fa-solid fa-magnifying-glass"></i>
                            </button>
                        </div>
                    </div>
                    
                     {nextPrayer && times[nextPrayer.key] && (
                        <div className="rounded-2xl p-3 text-white mb-5 relative overflow-hidden" style={{background: isBlackAndWhite ? `linear-gradient(135deg, #333, #000)` : `linear-gradient(135deg, ${theme.palette[1]}, ${theme.palette[0]})`}}>
                            <div className="flex justify-between items-center relative z-10">
                                <div className="text-right">
                                    <p className="text-[10px] font-bold opacity-90">المتبقي على صلاة <span className="underline decoration-white/40">{nextPrayer.name}</span></p>
                                    <p className="text-3xl font-black font-mono tracking-tighter">{countdown}</p>
                                </div>
                                <div className="text-left">
                                    <p className="text-[9px] font-bold opacity-80 uppercase">موعد الأذان</p>
                                    <p className="text-base font-black" dangerouslySetInnerHTML={{ __html: formatTime12(applyOffset(times[nextPrayer.key], config.prayerOffsets[nextPrayer.key])) }}></p>
                                </div>
                            </div>
                            <div className="absolute -left-6 -bottom-6 w-16 h-16 bg-white opacity-10 rounded-full blur-2xl"></div>
                        </div>
                    )}

                    <div className="space-y-3 mt-5">
                        {['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((key, idx) => {
                             const displayTimeStr = applyOffset(times[key], config.prayerOffsets[key]);
                             const iqamaTime = applyOffset(displayTimeStr, config.iqamaOffsets[key]);
                             const isMuted = config.mutedPrayers[key];
                             
                            return (
                                <div key={key} className="prayer-card rounded-2xl px-4 flex items-center justify-between mb-3 themed-card" style={{borderColor: nextPrayer?.key === key ? primaryColor : 'var(--card-border)', borderWidth: nextPrayer?.key === key ? '2px' : '1px'}}>
                                    <div className="flex items-center gap-3">
                                        {key !== 'Sunrise' ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <div onClick={() => togglePrayerSound(key)} className={`toggle-dot ${isMuted ? 'bg-red-500' : 'bg-green-500'}`} style={{borderColor: primaryColor}}></div>
                                                <button onClick={() => openSettings(key)} className="settings-btn shadow-sm hover:opacity-80" style={{ color: primaryColor }}><i className="fa-solid fa-sliders"></i></button>
                                            </div>
                                        ) : <div className="w-12"></div>}
                                        <div className="w-10 h-10 rounded-2xl themed-bg-alt flex items-center justify-center border" style={{color: idx % 2 === 0 ? primaryColor : secondaryColor, borderColor: 'var(--card-border)'}}>
                                             <i className={`fa-regular ${key === 'Sunrise' ? 'fa-sun' : 'fa-moon'} text-xl`}></i>
                                        </div>
                                         <div className="flex flex-col">
                                            <h3 className="font-bold text-sm leading-none mb-1.5" style={{ color: primaryColor }}>{prayerNamesAr[key]}</h3>
                                            {key !== 'Sunrise' && iqamaTime && !iqamaTime.includes('--') && (
                                                <span className="text-[9px] font-black px-2 py-0.5 rounded-full border" style={{color: secondaryColor, backgroundColor: isBlackAndWhite ? '#333' : theme.palette[1] + '1A', borderColor: isBlackAndWhite ? '#FFF' : theme.palette[1] + '33'}}>إقامة {formatTime12_clean(iqamaTime)}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-left flex flex-col items-end">
                                        <span style={{ color: primaryColor }} dangerouslySetInnerHTML={{ __html: formatTime12(displayTimeStr) }}></span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </main>

             {isModalOpen && currentEditingKey && (
                 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-6 scale-in">
                    <div className="rounded-[2.5rem] w-full max-w-xs p-6 shadow-2xl" style={{ backgroundColor: 'var(--modal-bg)', color: 'var(--modal-text)' }}>
                         <div className="flex justify-between items-center mb-6 pb-2 border-b" style={{ borderColor: 'var(--card-border)' }}>
                            <h3 className="font-black text-sm" style={{ color: primaryColor }}>إعدادات صلاة {prayerNamesAr[currentEditingKey]}</h3>
                            <button onClick={closeModal} className="hover:text-red-500" style={{ color: secondaryColor }}><i className="fa-solid fa-circle-xmark text-2xl"></i></button>
                        </div>
                        <div className="space-y-6">
                             <div>
                                <label className="block text-[10px] font-black mb-3 uppercase tracking-widest text-center" style={{ color: secondaryColor }}>تعديل وقت الأذان (بالدقائق)</label>
                                <div className="flex items-center justify-between themed-bg-alt p-2 rounded-2xl border themed-card-border shadow-inner">
                                    <button onClick={() => setTempOffset(p => p - 1)} className="control-btn text-red-500 shadow-sm"><i className="fa-solid fa-minus"></i></button>
                                    <div className="text-center">
                                        <div className="text-lg font-black en-digits" style={{ color: primaryColor }}>{formatTime12_EN(applyOffset(times[currentEditingKey], tempOffset))}</div>
                                        <div className="text-[10px] font-bold mt-0.5 en-digits" style={{color: secondaryColor}}>{tempOffset > 0 ? "+" : ""}{tempOffset} min</div>
                                    </div>
                                    <button onClick={() => setTempOffset(p => p + 1)} className="control-btn shadow-sm" style={{color: primaryColor}}><i className="fa-solid fa-plus"></i></button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black mb-3 uppercase tracking-widest text-center" style={{ color: secondaryColor }}>تنبيه الإقامة (بالدقائق)</label>
                                <div className="flex items-center justify-between themed-bg-alt p-2 rounded-2xl border themed-card-border shadow-inner">
                                    <button onClick={() => setTempIqama(p => Math.max(0, p - 1))} className="control-btn text-red-500 shadow-sm"><i className="fa-solid fa-minus"></i></button>
                                    <div className="text-center">
                                        <div className="text-lg font-black en-digits" style={{ color: primaryColor }}>{tempIqama}</div>
                                        <div className="text-[10px] font-bold mt-0.5 uppercase tracking-tighter" style={{color: secondaryColor}}>min</div>
                                    </div>
                                    <button onClick={() => setTempIqama(p => p + 1)} className="control-btn shadow-sm" style={{color: primaryColor}}><i className="fa-solid fa-plus"></i></button>
                                </div>
                            </div>
                            {renderToneSelector()}
                        </div>
                        <button onClick={saveUserConfig} className="w-full mt-8 text-white py-4 rounded-2xl font-black text-sm shadow-lg active:scale-95 transition-all" style={{backgroundColor: primaryColor, color: isBlackAndWhite ? '#000' : '#FFF'}}>حفظ التغييرات</button>
                    </div>
                </div>
            )}
            {toastMessage && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-[100]">
                    {toastMessage}
                </div>
            )}
            <BottomBar onHomeClick={onBack} onThemesClick={() => {}} showThemes={false} />
        </div>
    );
}

export default PrayerTimes;