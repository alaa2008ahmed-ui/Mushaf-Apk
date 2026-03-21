
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface TajweedExample {
    text: string;
    audioUrl: string;
    description?: string;
}

interface TajweedRule {
    id: string;
    title: string;
    description: string;
    color: string;
    examples: TajweedExample[];
}

const TAJWEED_RULES: TajweedRule[] = [
    {
        id: 'ghunnah',
        title: 'الغنة (Ghunnah)',
        description: 'صوت يخرج من الخيشوم، وتكون في النون والميم المشددتين بمقدار حركتين.',
        color: '#FF69B4',
        examples: [
            { text: 'النَّاسِ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/114001.mp3', description: 'نون مشددة' },
            { text: 'ثُمَّ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/002028.mp3', description: 'ميم مشددة' },
            { text: 'عَمَّ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/078001.mp3', description: 'ميم مشددة' },
            { text: 'كَأَنَّ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/027042.mp3', description: 'نون مشددة' },
        ]
    },
    {
        id: 'ikhfa',
        title: 'الإخفاء (Ikhfa)',
        description: 'النطق بالنون الساكنة أو التنوين بصفة بين الإظهار والإدغام مع بقاء الغنة.',
        color: '#4169E1',
        examples: [
            { text: 'مِنْ شَرِّ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/113002.mp3' },
            { text: 'أُنْزِلَ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/002004.mp3' },
            { text: 'أَنْدَاداً', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/002022.mp3' },
            { text: 'أَنْفُسِكُمْ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/002054.mp3' },
        ]
    },
    {
        id: 'idgham_ghunnah',
        title: 'إدغام بغنة (Idgham with Ghunnah)',
        description: 'إدخال النون الساكنة أو التنوين في حروف (ي ن م و) مع الغنة.',
        color: '#2E8B57',
        examples: [
            { text: 'مَنْ يَقُولُ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/002008.mp3' },
            { text: 'فَمَنْ يَعْمَلْ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/099007.mp3' },
            { text: 'وَلِيٍّ وَلَا نَصِيرٍ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/002107.mp3' },
        ]
    },
    {
        id: 'idgham_no_ghunnah',
        title: 'إدغام بغير غنة (Idgham without Ghunnah)',
        description: 'إدخال النون الساكنة أو التنوين في حرفي (ل ر) بدون غنة.',
        color: '#2E8B57',
        examples: [
            { text: 'مِنْ رَبِّهِمْ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/002005.mp3' },
            { text: 'مِنْ لَدُنْهُ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/018002.mp3' },
            { text: 'غَفُورٌ رَحِيمٌ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/002173.mp3' },
        ]
    },
    {
        id: 'iqlab',
        title: 'الإقلاب (Iqlab)',
        description: 'قلب النون الساكنة أو التنوين ميماً مخفاة بغنة عند ملاقاتها لحرف الباء.',
        color: '#808080',
        examples: [
            { text: 'مِنْ بَعْدِ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/002027.mp3' },
            { text: 'أَنْبِئْهُمْ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/002033.mp3' },
            { text: 'سَمِيعٌ بَصِيرٌ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/017001.mp3' },
        ]
    },
    {
        id: 'izhar',
        title: 'الإظهار (Izhar)',
        description: 'إخراج النون الساكنة أو التنوين من مخرجها بوضوح. حروفه (ء هـ ع ح غ خ).',
        color: '#000000',
        examples: [
            { text: 'مَنْ آمَنَ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/002062.mp3' },
            { text: 'عَلِيمٌ حَكِيمٌ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/002032.mp3' },
            { text: 'مِنْ خَوْفٍ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/106004.mp3' },
        ]
    },
    {
        id: 'qalqalah',
        title: 'القلقلة (Qalqalah)',
        description: 'اضطراب الصوت عند النطق بالحرف الساكن. حروفها (قطب جد).',
        color: '#FF4500',
        examples: [
            { text: 'الْفَلَقِ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/113001.mp3', description: 'قلقلة كبرى' },
            { text: 'يَدْخُلُونَ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/110002.mp3', description: 'قلقلة صغرى' },
            { text: 'مُحِيطٌ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/085020.mp3', description: 'قلقلة كبرى' },
            { text: 'أَبْصَارِهِمْ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/002007.mp3', description: 'قلقلة صغرى' },
        ]
    },
    {
        id: 'madd_muttasil',
        title: 'المد المتصل (Madd Muttasil)',
        description: 'أن يأتي حرف المد وبعده همزة في كلمة واحدة. يمد 4 أو 5 حركات.',
        color: '#DC143C',
        examples: [
            { text: 'السَّمَاءِ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/002019.mp3' },
            { text: 'جِيءَ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/039069.mp3' },
            { text: 'إِذَا جَاءَ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/110001.mp3' },
        ]
    },
    {
        id: 'madd_munfasil',
        title: 'المد المنفصل (Madd Munfasil)',
        description: 'أن يأتي حرف المد في آخر كلمة والهمزة في أول الكلمة التالية. يمد 2 أو 4 أو 5 حركات.',
        color: '#DC143C',
        examples: [
            { text: 'بِمَا أُنْزِلَ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/002004.mp3' },
            { text: 'يَا أَيُّهَا', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/002021.mp3' },
            { text: 'لَا أَعْبُدُ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/109002.mp3' },
        ]
    },
    {
        id: 'madd_lazim',
        title: 'المد اللازم (Madd Lazim)',
        description: 'أن يأتي بعد حرف المد سكون أصلي ثابت وصلاً ووقفاً. يمد 6 حركات.',
        color: '#DC143C',
        examples: [
            { text: 'الضَّالِّينَ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/001007.mp3' },
            { text: 'الْحَاقَّةُ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/069001.mp3' },
            { text: 'آلْآنَ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/010051.mp3' },
        ]
    },
    {
        id: 'madd_arid',
        title: 'المد العارض للسكون (Madd Arid)',
        description: 'أن يأتي بعد حرف المد حرف متحرك يتم تسكينه لأجل الوقف. يمد 2 أو 4 أو 6 حركات.',
        color: '#DC143C',
        examples: [
            { text: 'الْعَالَمِينَ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/001002.mp3' },
            { text: 'نَسْتَعِينُ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/001005.mp3' },
            { text: 'الْمُفْلِحُونَ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/002005.mp3' },
        ]
    },
    {
        id: 'madd_lin',
        title: 'مد اللين (Madd Lin)',
        description: 'أن تأتي الواو أو الياء الساكنة المفتوح ما قبلها وبعدها حرف سكن للوقف.',
        color: '#DC143C',
        examples: [
            { text: 'قُرَيْشٍ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/106001.mp3' },
            { text: 'الْبَيْتِ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/106003.mp3' },
            { text: 'خَوْفٍ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/106004.mp3' },
        ]
    },
    {
        id: 'madd_silah',
        title: 'مد الصلة (Madd Silah)',
        description: 'مد هاء الضمير للمفرد الغائب المذكر إذا وقعت بين متحركين.',
        color: '#DC143C',
        examples: [
            { text: 'بِهِۦ بَصِيرًا', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/025020.mp3', description: 'صلة صغرى' },
            { text: 'أَخْلَدَهُۥ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/104003.mp3', description: 'صلة كبرى' },
        ]
    },
    {
        id: 'madd_badal',
        title: 'مد البدل (Madd Badal)',
        description: 'أن تتقدم الهمزة على حرف المد في كلمة واحدة. يمد حركتين.',
        color: '#DC143C',
        examples: [
            { text: 'آدَمَ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/002031.mp3' },
            { text: 'إِيمَانًا', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/002165.mp3' },
            { text: 'أُوتُوا', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/002101.mp3' },
        ]
    },
    {
        id: 'rules_ra',
        title: 'أحكام الراء (Rules of Ra)',
        description: 'للراء حالتان: التفخيم (تغليظ الصوت) والترقيق (تنحيف الصوت) حسب حركتها وما قبلها.',
        color: '#8B4513',
        examples: [
            { text: 'رَبَّنَا', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/002127.mp3', description: 'تفخيم' },
            { text: 'رِزْقًا', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/002022.mp3', description: 'ترقيق' },
            { text: 'فِرْعَوْنَ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/002049.mp3', description: 'ترقيق' },
        ]
    },
    {
        id: 'rules_lam',
        title: 'أحكام اللام (Rules of Lam)',
        description: 'الأصل في اللام الترقيق، وتفخم في لفظ الجلالة (الله) إذا سبقها فتح أو ضم.',
        color: '#4B0082',
        examples: [
            { text: 'اللَّهُ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/112001.mp3', description: 'تفخيم' },
            { text: 'بِسْمِ اللَّهِ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/001001.mp3', description: 'ترقيق' },
            { text: 'لِلَّهِ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/001002.mp3', description: 'ترقيق' },
        ]
    }
];

const TajweedEducation: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [selectedRule, setSelectedRule] = useState<string | null>(null);
    const [playingAudio, setPlayingAudio] = useState<string | null>(null);
    const [isPreloading, setIsPreloading] = useState(true);
    const [preloadProgress, setPreloadProgress] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    React.useEffect(() => {
        const allUrls = TAJWEED_RULES.flatMap(rule => rule.examples.map(ex => ex.audioUrl));
        const uniqueUrls = Array.from(new Set(allUrls));
        let loadedCount = 0;

        if (uniqueUrls.length === 0) {
            setIsPreloading(false);
            return;
        }

        const preload = async () => {
            const promises = uniqueUrls.map(url => {
                return new Promise((resolve) => {
                    const audio = new Audio();
                    audio.src = url;
                    audio.preload = 'auto';
                    
                    const handleLoad = () => {
                        loadedCount++;
                        setPreloadProgress(Math.floor((loadedCount / uniqueUrls.length) * 100));
                        resolve(null);
                        cleanup();
                    };

                    const handleError = () => {
                        console.warn(`Failed to preload: ${url}`);
                        loadedCount++;
                        setPreloadProgress(Math.floor((loadedCount / uniqueUrls.length) * 100));
                        resolve(null);
                        cleanup();
                    };

                    const cleanup = () => {
                        audio.removeEventListener('canplaythrough', handleLoad);
                        audio.removeEventListener('error', handleError);
                    };

                    audio.addEventListener('canplaythrough', handleLoad);
                    audio.addEventListener('error', handleError);
                    audio.load();

                    // Timeout to prevent infinite loading if network is slow
                    setTimeout(() => {
                        if (loadedCount < uniqueUrls.length) {
                            handleError();
                        }
                    }, 10000);
                });
            });

            await Promise.all(promises);
            // Small delay for smooth transition
            setTimeout(() => setIsPreloading(false), 500);
        };

        preload();
    }, []);

    const playAudio = (url: string) => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
        } else {
            audioRef.current.pause();
        }

        if (playingAudio === url) {
            setPlayingAudio(null);
            return;
        }

        setPlayingAudio(url);
        
        const tryPlay = (audioUrl: string, isFallback = false) => {
            if (!audioRef.current) return;
            
            audioRef.current.src = audioUrl;
            
            const playPromise = audioRef.current.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(err => {
                    console.error(`Audio playback failed for ${audioUrl}:`, err);
                    
                    if (!isFallback) {
                        // Try fallback mirror
                        const fallbackUrl = audioUrl.replace('www.everyayah.com/data', 'mirrors.quranicaudio.com/everyayah');
                        console.log(`Attempting fallback to: ${fallbackUrl}`);
                        tryPlay(fallbackUrl, true);
                    } else {
                        setPlayingAudio(null);
                    }
                });
            }
        };

        tryPlay(url);

        audioRef.current.onended = () => setPlayingAudio(null);
    };

    if (isPreloading) {
        return (
            <div className="min-h-screen bg-[#1B4332] flex flex-col items-center justify-center text-white p-6" dir="rtl">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center"
                >
                    <div className="w-20 h-20 border-4 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin mb-6 mx-auto"></div>
                    <h2 className="text-2xl font-bold mb-2">جاري التحميل...</h2>
                    <p className="text-emerald-200 mb-8">يتم الآن تحميل الدروس والأمثلة الصوتية</p>
                    
                    <div className="w-64 h-2 bg-emerald-900 rounded-full overflow-hidden mx-auto">
                        <motion.div 
                            className="h-full bg-emerald-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${preloadProgress}%` }}
                        />
                    </div>
                    <span className="text-xs mt-2 block opacity-60">{preloadProgress}%</span>

                    <motion.div 
                        className="mt-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2 }}
                    >
                        <button 
                            onClick={() => setIsPreloading(false)}
                            className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full text-sm transition-colors"
                        >
                            تخطي التحميل (Skip)
                        </button>
                    </motion.div>
                </motion.div>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-screen bg-[#F8F9FA] text-[#212529] flex flex-col overflow-hidden"
            dir="rtl"
        >
            {/* Header - Quran Majeed Style */}
            <div className="bg-[#1B4332] text-white px-4 py-4 flex items-center shadow-lg shrink-0">
                <button onClick={onBack} className="p-2 hover:bg-[#2D6A4F] rounded-full transition-colors ml-2">
                    <i className="fa-solid fa-arrow-right text-xl"></i>
                </button>
                <div className="flex flex-col">
                    <h1 className="text-lg font-bold">قواعد التجويد</h1>
                    <span className="text-xs opacity-80">تعلم أحكام التلاوة الصحيحة</span>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pb-10">
                {/* Color Guide Section */}
                <div className="p-4">
                    <div className="bg-white rounded-2xl p-4 shadow-sm mb-6 border border-emerald-100">
                        <h3 className="text-sm font-bold text-emerald-800 mb-3 flex items-center gap-2">
                            <i className="fa-solid fa-circle-info"></i>
                            دليل الألوان
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {TAJWEED_RULES.map(rule => (
                                <div key={rule.id} className="flex items-center gap-1.5 bg-stone-50 px-2 py-1 rounded-lg border border-stone-100">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: rule.color }}></div>
                                    <span className="text-[10px] font-medium">{rule.title.split(' ')[0]}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Rules List */}
                    <div className="space-y-4">
                        {TAJWEED_RULES.map((rule) => (
                            <div key={rule.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200">
                                <button 
                                    onClick={() => setSelectedRule(selectedRule === rule.id ? null : rule.id)}
                                    className="w-full flex items-center justify-between p-4 text-right"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: rule.color }}></div>
                                        <span className="font-bold text-stone-800">{rule.title}</span>
                                    </div>
                                    <i className={`fa-solid fa-chevron-down text-stone-400 transition-transform ${selectedRule === rule.id ? 'rotate-180' : ''}`}></i>
                                </button>

                                <AnimatePresence>
                                    {selectedRule === rule.id && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-4 pb-4 pt-2 border-t border-stone-50">
                                                <p className="text-sm text-stone-600 mb-4 leading-relaxed bg-emerald-50/50 p-3 rounded-xl">
                                                    {rule.description}
                                                </p>
                                                
                                                <div className="space-y-3">
                                                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">أمثلة توضيحية</h4>
                                                    {rule.examples.map((example, idx) => (
                                                        <div 
                                                            key={idx}
                                                            className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100"
                                                        >
                                                            <div className="flex flex-col">
                                                                <span className="text-xl font-serif mb-1" style={{ color: rule.color }}>{example.text}</span>
                                                                {example.description && <span className="text-[10px] text-stone-400">{example.description}</span>}
                                                            </div>
                                                            <button 
                                                                onClick={() => playAudio(example.audioUrl)}
                                                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                                                    playingAudio === example.audioUrl 
                                                                    ? 'bg-emerald-600 text-white shadow-lg scale-105' 
                                                                    : 'bg-white text-emerald-700 border border-emerald-100 hover:bg-emerald-50'
                                                                }`}
                                                            >
                                                                <i className={`fa-solid ${playingAudio === example.audioUrl ? 'fa-pause' : 'fa-play'}`}></i>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Tip */}
                <div className="p-6 text-center">
                    <div className="inline-flex items-center gap-2 text-stone-400 text-xs bg-white px-4 py-2 rounded-full shadow-sm border border-stone-100">
                        <i className="fa-solid fa-lightbulb text-amber-400"></i>
                        <span>اضغط على القاعدة لعرض التفاصيل والأمثلة</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default TajweedEducation;
