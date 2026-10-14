import React, { useState, useEffect, useRef } from 'react';
import { QURAN_RADIOS, QuranRadio } from '../data/quranRadiosData';
import BottomBar from '../components/BottomBar';
import ThemePageLock from '../components/ThemePageLock';
import { useTheme } from '../context/ThemeContext';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { motion, AnimatePresence } from 'framer-motion';

interface QuranRadiosPageProps {
    onBack: () => void;
    onNavigate: (pageId: string, params?: any) => void;
    navParams?: any;
}

const QuranRadiosPage: React.FC<QuranRadiosPageProps> = ({ onBack, onNavigate, navParams }) => {
    const { theme, themeKey } = useTheme();

    const [activeTab, setActiveTab] = useState<'all' | 'official' | 'reciters' | 'tafseer' | 'adhkar' | 'favorites'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentRadio, setCurrentRadio] = useState<QuranRadio | null>(() => QURAN_RADIOS[0]);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [volume, setVolume] = useState<number>(1);
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [favorites, setFavorites] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem('quran_radios_favs_v1');
            return saved ? JSON.parse(saved) : ['radio-cairo', 'radio-makkah'];
        } catch {
            return ['radio-cairo', 'radio-makkah'];
        }
    });
    const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
    const [sleepTimerSecondsLeft, setSleepTimerSecondsLeft] = useState<number | null>(null);
    const [showSleepModal, setShowSleepModal] = useState<boolean>(false);
    const [streamQuality, setStreamQuality] = useState<'hq' | 'eco'>('hq');
    const [toastMessage, setToastMessage] = useState<string>('');

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const sleepTimerRef = useRef<any>(null);

    const isBlackTheme = theme.bgColor === '#000000';
    const isDefaultTheme = themeKey === 'default';
    const cardBorderColor = isDefaultTheme 
        ? '#000000' 
        : (isBlackTheme 
            ? '#FFFFFF' 
            : (theme.palette?.[0] || '#000000'));

    const primaryColor = isDefaultTheme 
        ? '#059669' 
        : (theme.palette?.[0] || '#059669');

    // Setup audio element
    useEffect(() => {
        const audio = new Audio();
        audio.preload = 'none';
        audioRef.current = audio;

        audio.addEventListener('playing', () => {
            setIsLoading(false);
            setIsPlaying(true);
        });

        audio.addEventListener('waiting', () => {
            setIsLoading(true);
        });

        audio.addEventListener('pause', () => {
            setIsPlaying(false);
            setIsLoading(false);
        });

        audio.addEventListener('error', () => {
            setIsLoading(false);
            setIsPlaying(false);
            // Try backup URL if available
            if (currentRadio?.backupUrl && audio.src !== currentRadio.backupUrl) {
                showToast('جاري التبديل لرابط البث الاحتياطي...');
                audio.src = currentRadio.backupUrl;
                audio.play().catch(() => {
                    showToast('تعذر تشغيل هذه الإذاعة حالياً، يرجى تجربة إذاعة أخرى.');
                });
            } else {
                showToast('تعذر تشغيل هذه الإذاعة حالياً، يرجى المحاولة لاحقاً.');
            }
        });

        return () => {
            audio.pause();
            audio.src = '';
            if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
        };
    }, []);

    // Handle back button
    useEffect(() => {
        const interceptor = () => {
            if (showSleepModal) {
                setShowSleepModal(false);
                return true;
            }
            return false;
        };
        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [showSleepModal]);

    // Sleep Timer countdown
    useEffect(() => {
        if (sleepTimerMinutes === null) {
            setSleepTimerSecondsLeft(null);
            if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
            return;
        }

        const totalSeconds = sleepTimerMinutes * 60;
        setSleepTimerSecondsLeft(totalSeconds);

        if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);

        sleepTimerRef.current = setInterval(() => {
            setSleepTimerSecondsLeft((prev) => {
                if (prev === null || prev <= 1) {
                    clearInterval(sleepTimerRef.current);
                    if (audioRef.current) {
                        audioRef.current.pause();
                        setIsPlaying(false);
                    }
                    setSleepTimerMinutes(null);
                    showToast('انتهى مؤقت النوم وتم إيقاف تشغيل الإذاعة');
                    return null;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
        };
    }, [sleepTimerMinutes]);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3000);
    };

    const toggleFavorite = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setFavorites((prev) => {
            const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
            try {
                localStorage.setItem('quran_radios_favs_v1', JSON.stringify(next));
            } catch {}
            return next;
        });
    };

    const handlePlayRadio = (radio: QuranRadio) => {
        if (!audioRef.current) return;

        if (currentRadio?.id === radio.id && isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
            return;
        }

        setCurrentRadio(radio);
        setIsLoading(true);
        audioRef.current.src = radio.url;
        audioRef.current.volume = isMuted ? 0 : volume;

        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
            playPromise.catch((err) => {
                console.warn('Radio play interrupted:', err);
                // Try backup if available
                if (radio.backupUrl) {
                    audioRef.current!.src = radio.backupUrl;
                    audioRef.current!.play().catch(() => {
                        setIsLoading(false);
                        setIsPlaying(false);
                    });
                } else {
                    setIsLoading(false);
                    setIsPlaying(false);
                }
            });
        }
    };

    const togglePlayPause = () => {
        if (!audioRef.current || !currentRadio) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            handlePlayRadio(currentRadio);
        }
    };

    const toggleMute = () => {
        if (!audioRef.current) return;
        if (isMuted) {
            audioRef.current.volume = volume;
            setIsMuted(false);
        } else {
            audioRef.current.volume = 0;
            setIsMuted(true);
        }
    };

    const handleVolumeChange = (newVol: number) => {
        setVolume(newVol);
        setIsMuted(false);
        if (audioRef.current) {
            audioRef.current.volume = newVol;
        }
    };

    // Filter radios
    const filteredRadios = QURAN_RADIOS.filter((radio) => {
        const matchesCategory =
            activeTab === 'all'
                ? true
                : activeTab === 'favorites'
                ? favorites.includes(radio.id)
                : radio.category === activeTab;

        const matchesSearch =
            searchQuery.trim() === '' ||
            radio.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            radio.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (radio.country && radio.country.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesCategory && matchesSearch;
    });

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleHomeClick = () => {
        if (navParams?.from === 'more-menu') {
            onNavigate('more-menu');
        } else {
            onBack();
        }
    };

    return (
        <div 
            className="h-screen flex flex-col overflow-hidden" 
            style={{ backgroundColor: 'transparent', color: theme.textColor, fontFamily: theme.font }}
        >
            {/* Header */}
            <header className="app-top-bar">
                <div className="app-top-bar__inner">
                    <div className="relative flex items-center justify-between w-full">
                        <div className="w-10 flex items-center">
                            <ThemePageLock />
                        </div>

                        <div className="flex-1 text-center px-2">
                            <h1 className="app-top-bar__title text-xl sm:text-2xl font-kufi">
                                إذاعات القرآن الكريم
                            </h1>
                            <p className="app-top-bar__subtitle text-xs sm:text-sm">
                                بث مباشر عالي النقاء لكبرى الإذاعات الرسمية وكبار القراء
                            </p>
                        </div>

                        <div className="w-10 flex items-center justify-end">
                            <button
                                onClick={() => setShowSleepModal(true)}
                                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                                    sleepTimerMinutes ? 'bg-amber-500 text-white shadow-md' : 'bg-black/5 dark:bg-white/10 hover:bg-black/10'
                                }`}
                                title="مؤقت النوم"
                            >
                                <i className="fa-solid fa-moon text-sm"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto hide-scrollbar px-4 pt-2 pb-32">
                <div className="max-w-3xl mx-auto space-y-4">
                    {/* Featured Live Player Card */}
                    {currentRadio && (
                        <div 
                            className="p-5 sm:p-6 rounded-3xl themed-card border shadow-lg relative overflow-hidden"
                            style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                        >
                            <div 
                                className="absolute -right-16 -top-16 w-44 h-44 rounded-full opacity-15 blur-3xl pointer-events-none"
                                style={{ backgroundColor: primaryColor }}
                            />

                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4 text-center sm:text-right w-full sm:w-auto">
                                    <div 
                                        className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center shrink-0 shadow-md relative"
                                        style={{ 
                                            backgroundColor: isDefaultTheme ? '#00000010' : `${primaryColor}25`,
                                            color: isDefaultTheme ? '#000000' : primaryColor
                                        }}
                                    >
                                        <i className={`${currentRadio.icon} text-3xl`}></i>
                                        {isPlaying && (
                                            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                                {currentRadio.country ? `${currentRadio.flag || ''} ${currentRadio.country}` : currentRadio.categoryLabel}
                                            </span>
                                            <span className="text-[11px] opacity-70 font-mono">
                                                {currentRadio.bitrate}
                                            </span>
                                        </div>
                                        <h2 className="text-lg sm:text-xl font-bold font-kufi truncate mt-1">
                                            {currentRadio.name}
                                        </h2>
                                        <p className="text-xs opacity-75 truncate max-w-sm mt-0.5">
                                            {currentRadio.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Controls */}
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => toggleFavorite(currentRadio.id)}
                                        className="w-10 h-10 rounded-full border flex items-center justify-center transition-transform active:scale-90"
                                        style={{ borderColor: cardBorderColor }}
                                        title="إضافة للمفضلة"
                                    >
                                        <i className={`${favorites.includes(currentRadio.id) ? 'fa-solid fa-heart text-red-500' : 'fa-regular fa-heart opacity-70'} text-base`}></i>
                                    </button>

                                    <button
                                        onClick={togglePlayPause}
                                        disabled={isLoading}
                                        className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-all transform active:scale-90 hover:scale-105"
                                        style={{ backgroundColor: primaryColor }}
                                        title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل البث'}
                                    >
                                        {isLoading ? (
                                            <i className="fa-solid fa-circle-notch fa-spin text-xl"></i>
                                        ) : isPlaying ? (
                                            <i className="fa-solid fa-pause text-2xl"></i>
                                        ) : (
                                            <i className="fa-solid fa-play text-2xl mr-0.5"></i>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Audio Visualizer & Volume Bar */}
                            <div className="mt-4 pt-3 border-t flex flex-wrap items-center justify-between gap-3 text-xs" style={{ borderColor: 'var(--card-border)' }}>
                                <div className="flex items-center gap-2">
                                    {isPlaying ? (
                                        <div className="flex items-end gap-1 h-4">
                                            <span className="w-1 bg-emerald-500 rounded-full animate-pulse h-3"></span>
                                            <span className="w-1 bg-emerald-500 rounded-full animate-bounce h-4"></span>
                                            <span className="w-1 bg-emerald-500 rounded-full animate-pulse h-2"></span>
                                            <span className="w-1 bg-emerald-500 rounded-full animate-bounce h-3.5"></span>
                                            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mr-1.5">بث مباشر الآن</span>
                                        </div>
                                    ) : (
                                        <span className="text-[11px] opacity-60">جاهز للتشغيل</span>
                                    )}

                                    {sleepTimerSecondsLeft !== null && (
                                        <span className="bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full text-[11px] font-bold">
                                            <i className="fa-solid fa-clock ml-1"></i>
                                            إيقاف بعد {formatTime(sleepTimerSecondsLeft)}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <button onClick={toggleMute} className="opacity-70 hover:opacity-100">
                                        <i className={`fa-solid ${isMuted || volume === 0 ? 'fa-volume-xmark text-red-500' : volume < 0.5 ? 'fa-volume-low' : 'fa-volume-high'}`}></i>
                                    </button>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        value={isMuted ? 0 : volume}
                                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                                        className="w-20 sm:w-28 h-1.5 bg-black/10 dark:bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Search & Tabs */}
                    <div className="space-y-2.5">
                        <div 
                            className="p-2 sm:p-2.5 rounded-2xl themed-card border shadow-sm relative overflow-hidden flex items-center"
                            style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                        >
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="ابحث عن إذاعة، قارئ، أو دولة..."
                                    className="w-full pl-8 pr-9 py-2 text-xs sm:text-sm rounded-xl border bg-black/5 dark:bg-white/5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    style={{ borderColor: 'var(--card-border)', color: theme.textColor }}
                                />
                                <i className="fa-solid fa-magnifying-glass absolute right-3 top-1/2 -translate-y-1/2 text-xs opacity-50"></i>
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs opacity-50 hover:opacity-100"
                                    >
                                        <i className="fa-solid fa-times"></i>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Category Filter Pills */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
                            {[
                                { id: 'all', label: 'الكل', icon: 'fa-layer-group' },
                                { id: 'official', label: 'الإذاعات الرسمية', icon: 'fa-tower-broadcast' },
                                { id: 'reciters', label: 'كبار القراء', icon: 'fa-microphone-lines' },
                                { id: 'tafseer', label: 'تفسير وعلوم', icon: 'fa-book-quran' },
                                { id: 'adhkar', label: 'أذكار ورقى', icon: 'fa-shield-heart' },
                                { id: 'favorites', label: `المفضلة (${favorites.length})`, icon: 'fa-heart' },
                            ].map((tab) => {
                                const active = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 flex items-center gap-1.5 active:scale-95 ${
                                            active
                                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                                : 'bg-black/5 dark:bg-white/5 hover:bg-black/10'
                                        }`}
                                        style={{ borderColor: active ? undefined : 'var(--card-border)' }}
                                    >
                                        <i className={`fa-solid ${tab.icon} text-[10px]`}></i>
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Radios Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {filteredRadios.map((radio) => {
                            const isSelected = currentRadio?.id === radio.id;
                            const isRadioPlaying = isSelected && isPlaying;
                            const isFav = favorites.includes(radio.id);

                            return (
                                <div
                                    key={radio.id}
                                    onClick={() => handlePlayRadio(radio)}
                                    className={`p-4 rounded-2xl themed-card border transition-all cursor-pointer active:scale-98 relative overflow-hidden flex items-center justify-between gap-3 shadow-sm hover:shadow-md ${
                                        isSelected ? 'ring-2 ring-emerald-500' : ''
                                    }`}
                                    style={{ 
                                        borderColor: isSelected ? primaryColor : cardBorderColor,
                                        borderWidth: '1.5px',
                                        borderStyle: 'solid'
                                    }}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div 
                                            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                                            style={{ 
                                                backgroundColor: isDefaultTheme ? '#00000010' : `${primaryColor}20`,
                                                color: isDefaultTheme ? '#000000' : primaryColor
                                            }}
                                        >
                                            <i className={`${radio.icon} text-xl`}></i>
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <h3 className="font-bold text-sm truncate font-kufi">
                                                    {radio.name}
                                                </h3>
                                            </div>
                                            <p className="text-[11px] opacity-70 truncate mt-0.5">
                                                {radio.categoryLabel} {radio.country ? `• ${radio.country}` : ''}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={(e) => toggleFavorite(radio.id, e)}
                                            className="w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-90"
                                            title="المفضلة"
                                        >
                                            <i className={`${isFav ? 'fa-solid fa-heart text-red-500' : 'fa-regular fa-heart opacity-40'} text-sm`}></i>
                                        </button>

                                        <div 
                                            className="w-9 h-9 rounded-full flex items-center justify-center text-white shadow-sm"
                                            style={{ backgroundColor: isRadioPlaying ? '#10b981' : primaryColor }}
                                        >
                                            {isSelected && isLoading ? (
                                                <i className="fa-solid fa-circle-notch fa-spin text-sm"></i>
                                            ) : isRadioPlaying ? (
                                                <i className="fa-solid fa-pause text-sm"></i>
                                            ) : (
                                                <i className="fa-solid fa-play text-sm mr-0.5"></i>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {filteredRadios.length === 0 && (
                        <div className="text-center py-12 opacity-60">
                            <i className="fa-solid fa-radio text-3xl mb-2"></i>
                            <p className="text-sm">لا توجد إذاعات تطابق بحثك</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Sleep Timer Modal */}
            <AnimatePresence>
                {showSleepModal && (
                    <div 
                        className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
                        onClick={() => setShowSleepModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-sm rounded-3xl p-5 shadow-2xl border bg-slate-900 text-white"
                            style={{ borderColor: cardBorderColor }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-base font-kufi flex items-center gap-2">
                                    <i className="fa-solid fa-moon text-amber-400"></i>
                                    مؤقت النوم التلقائي
                                </h3>
                                <button onClick={() => setShowSleepModal(false)} className="opacity-70 hover:opacity-100 p-1">
                                    <i className="fa-solid fa-xmark text-lg"></i>
                                </button>
                            </div>

                            <p className="text-xs opacity-80 mb-4 leading-relaxed">
                                سيتم إيقاف تشغيل إذاعة القرآن تلقائياً بعد انقضاء الوقت المحدد حتى تنام في طمأنينة وسكينة.
                            </p>

                            <div className="grid grid-cols-2 gap-2.5">
                                {[15, 30, 45, 60].map((mins) => (
                                    <button
                                        key={mins}
                                        onClick={() => {
                                            setSleepTimerMinutes(mins);
                                            setShowSleepModal(false);
                                            showToast(`تم ضبط مؤقت النوم على ${mins} دقيقة`);
                                        }}
                                        className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                                            sleepTimerMinutes === mins
                                                ? 'bg-amber-500 text-black border-amber-400 shadow-md'
                                                : 'bg-white/10 hover:bg-white/20 border-white/10'
                                        }`}
                                    >
                                        <i className="fa-regular fa-clock"></i>
                                        {mins} دقيقة
                                    </button>
                                ))}
                            </div>

                            {sleepTimerMinutes !== null && (
                                <button
                                    onClick={() => {
                                        setSleepTimerMinutes(null);
                                        setShowSleepModal(false);
                                        showToast('تم إلغاء مؤقت النوم');
                                    }}
                                    className="w-full mt-3 py-2 rounded-2xl text-xs font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/40"
                                >
                                    إلغاء المؤقت
                                </button>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div 
                        initial={{ opacity: 0, y: 30, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 30, x: '-50%' }}
                        className="fixed bottom-24 left-1/2 z-[260] bg-gray-900 text-white px-5 py-2.5 rounded-full shadow-2xl font-bold text-xs text-center whitespace-nowrap border border-white/10"
                    >
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Bar */}
            <BottomBar onHomeClick={handleHomeClick} onThemesClick={() => {}} showThemes={false} />
        </div>
    );
};

export default QuranRadiosPage;
