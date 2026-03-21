
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
            { text: 'إِنَّ', audioUrl: 'https://www.al-hamd.com/audio/tajweed/ghunnah_1.mp3', description: 'نون مشددة' },
            { text: 'ثُمَّ', audioUrl: 'https://www.al-hamd.com/audio/tajweed/ghunnah_2.mp3', description: 'ميم مشددة' },
            { text: 'عَمَّ', audioUrl: 'https://www.al-hamd.com/audio/tajweed/ghunnah_3.mp3', description: 'ميم مشددة' },
            { text: 'كَأَنَّ', audioUrl: 'https://www.al-hamd.com/audio/tajweed/ghunnah_4.mp3', description: 'نون مشددة' },
        ]
    },
    {
        id: 'ikhfa',
        title: 'الإخفاء (Ikhfa)',
        description: 'النطق بالنون الساكنة أو التنوين بصفة بين الإظهار والإدغام مع بقاء الغنة.',
        color: '#4169E1',
        examples: [
            { text: 'مِنْ قَبْلُ', audioUrl: 'https://www.al-hamd.com/audio/tajweed/ikhfa_1.mp3' },
            { text: 'أَنْدَاداً', audioUrl: 'https://www.al-hamd.com/audio/tajweed/ikhfa_2.mp3' },
            { text: 'مِنْ شَرِّ', audioUrl: 'https://www.al-hamd.com/audio/tajweed/ikhfa_3.mp3' },
            { text: 'أَنْفُسِكُمْ', audioUrl: 'https://www.al-hamd.com/audio/tajweed/ikhfa_4.mp3' },
        ]
    },
    {
        id: 'idgham_ghunnah',
        title: 'إدغام بغنة (Idgham with Ghunnah)',
        description: 'إدخال النون الساكنة أو التنوين في حروف (ي ن م و) مع الغنة.',
        color: '#2E8B57',
        examples: [
            { text: 'مَنْ يَقُولُ', audioUrl: 'https://www.al-hamd.com/audio/tajweed/idgham_1.mp3' },
            { text: 'مِنْ مَالِ', audioUrl: 'https://www.al-hamd.com/audio/tajweed/idgham_3.mp3' },
            { text: 'وَلِيٍّ وَلَا نَصِيرٍ', audioUrl: 'https://www.al-hamd.com/audio/tajweed/idgham_4.mp3' },
        ]
    },
    {
        id: 'idgham_no_ghunnah',
        title: 'إدغام بغير غنة (Idgham without Ghunnah)',
        description: 'إدخال النون الساكنة أو التنوين في حرفي (ل ر) بدون غنة.',
        color: '#2E8B57',
        examples: [
            { text: 'مِنْ رَبِّهِمْ', audioUrl: 'https://www.al-hamd.com/audio/tajweed/idgham_2.mp3' },
            { text: 'مِنْ لَدُنْهُ', audioUrl: 'https://www.al-hamd.com/audio/tajweed/idgham_5.mp3' },
            { text: 'غَفُورٌ رَحِيمٌ', audioUrl: 'https://www.al-hamd.com/audio/tajweed/idgham_6.mp3' },
        ]
    },
    {
        id: 'iqlab',
        title: 'الإقلاب (Iqlab)',
        description: 'قلب النون الساكنة أو التنوين ميماً مخفاة بغنة عند ملاقاتها لحرف الباء.',
        color: '#808080',
        examples: [
            { text: 'مِنْ بَعْدِ', audioUrl: 'https://www.al-hamd.com/audio/tajweed/iqlab_1.mp3' },
            { text: 'أَنْبِئْهُمْ', audioUrl: 'https://www.al-hamd.com/audio/tajweed/iqlab_2.mp3' },
            { text: 'سَمِيعٌ بَصِيرٌ', audioUrl: 'https://www.al-hamd.com/audio/tajweed/iqlab_3.mp3' },
        ]
    },
    {
        id: 'izhar',
        title: 'الإظهار (Izhar)',
        description: 'إخراج النون الساكنة أو التنوين من مخرجها بوضوح. حروفه (ء هـ ع ح غ خ).',
        color: '#000000',
        examples: [
            { text: 'مَنْ آمَنَ', audioUrl: 'https://www.al-hamd.com/audio/tajweed/izhar_1.mp3' },
            { text: 'عَلِيمٌ حَكِيمٌ', audioUrl: 'https://www.al-hamd.com/audio/tajweed/izhar_2.mp3' },
            { text: 'مِنْ خَوْفٍ', audioUrl: 'https://www.al-hamd.com/audio/tajweed/izhar_3.mp3' },
        ]
    },
    {
        id: 'qalqalah',
        title: 'القلقلة (Qalqalah)',
        description: 'اضطراب الصوت عند النطق بالحرف الساكن. حروفها (قطب جد).',
        color: '#FF4500',
        examples: [
            { text: 'الْفَلَقِ', audioUrl: 'https://www.al-hamd.com/audio/tajweed/qalqalah_1.mp3', description: 'قلقلة كبرى' },
            { text: 'يَدْخُلُونَ', audioUrl: 'https://www.al-hamd.com/audio/tajweed/qalqalah_2.mp3', description: 'قلقلة صغرى' },
            { text: 'مُحِيطٌ', audioUrl: 'https://www.al-hamd.com/audio/tajweed/qalqalah_3.mp3', description: 'قلقلة كبرى' },
            { text: 'أَبْصَارِهِمْ', audioUrl: 'https://www.al-hamd.com/audio/tajweed/qalqalah_4.mp3', description: 'قلقلة صغرى' },
        ]
    },
    {
        id: 'madd_muttasil',
        title: 'المد المتصل (Madd Muttasil)',
        description: 'أن يأتي حرف المد وبعده همزة في كلمة واحدة. يمد 4 أو 5 حركات.',
        color: '#DC143C',
        examples: [
            { text: 'السَّمَاءِ', audioUrl: 'https://www.al-hamd.com/audio/tajweed/madd_muttasil_1.mp3' },
            { text: 'جِيءَ', audioUrl: 'https://www.al-hamd.com/audio/tajweed/madd_muttasil_2.mp3' },
            { text: 'سُوءَ', audioUrl: 'https://www.al-hamd.com/audio/tajweed/madd_muttasil_3.mp3' },
        ]
    },
    {
        id: 'madd_munfasil',
        title: 'المد المنفصل (Madd Munfasil)',
        description: 'أن يأتي حرف المد في آخر كلمة والهمزة في أول الكلمة التالية. يمد 2 أو 4 أو 5 حركات.',
        color: '#DC143C',
        examples: [
            { text: 'بِمَا أُنْزِلَ', audioUrl: 'https://www.al-hamd.com/audio/tajweed/madd_munfasil_1.mp3' },
            { text: 'يَا أَيُّهَا', audioUrl: 'https://www.al-hamd.com/audio/tajweed/madd_munfasil_2.mp3' },
            { text: 'قُولُوا آمَنَّا', audioUrl: 'https://www.al-hamd.com/audio/tajweed/madd_munfasil_3.mp3' },
        ]
    },
    {
        id: 'madd_lazim',
        title: 'المد اللازم (Madd Lazim)',
        description: 'أن يأتي بعد حرف المد سكون أصلي ثابت وصلاً ووقفاً. يمد 6 حركات.',
        color: '#DC143C',
        examples: [
            { text: 'الضَّالِّينَ', audioUrl: 'https://www.al-hamd.com/audio/tajweed/madd_lazim_1.mp3' },
            { text: 'الْحَاقَّةُ', audioUrl: 'https://www.al-hamd.com/audio/tajweed/madd_lazim_2.mp3' },
            { text: 'آلْآنَ', audioUrl: 'https://www.al-hamd.com/audio/tajweed/madd_lazim_3.mp3' },
        ]
    },
    {
        id: 'madd_arid',
        title: 'المد العارض للسكون (Madd Arid)',
        description: 'أن يأتي بعد حرف المد حرف متحرك يتم تسكينه لأجل الوقف. يمد 2 أو 4 أو 6 حركات.',
        color: '#DC143C',
        examples: [
            { text: 'الْعَالَمِينَ', audioUrl: 'https://www.al-hamd.com/audio/tajweed/madd_arid_1.mp3' },
            { text: 'نَسْتَعِينُ', audioUrl: 'https://www.al-hamd.com/audio/tajweed/madd_arid_2.mp3' },
            { text: 'الْمُفْلِحُونَ', audioUrl: 'https://www.al-hamd.com/audio/tajweed/madd_arid_3.mp3' },
        ]
    },
    {
        id: 'madd_lin',
        title: 'مد اللين (Madd Lin)',
        description: 'أن تأتي الواو أو الياء الساكنة المفتوح ما قبلها وبعدها حرف سكن للوقف.',
        color: '#DC143C',
        examples: [
            { text: 'قُرَيْشٍ', audioUrl: 'https://www.al-hamd.com/audio/tajweed/madd_lin_1.mp3' },
            { text: 'الْبَيْتِ', audioUrl: 'https://www.al-hamd.com/audio/tajweed/madd_lin_2.mp3' },
            { text: 'خَوْفٍ', audioUrl: 'https://www.al-hamd.com/audio/tajweed/madd_lin_3.mp3' },
        ]
    },
    {
        id: 'madd_silah',
        title: 'مد الصلة (Madd Silah)',
        description: 'مد هاء الضمير للمفرد الغائب المذكر إذا وقعت بين متحركين.',
        color: '#DC143C',
        examples: [
            { text: 'بِهِۦ بَصِيرًا', audioUrl: 'https://www.al-hamd.com/audio/tajweed/madd_silah_1.mp3', description: 'صلة صغرى' },
            { text: 'عِنْدَهُۥٓ إِلَّا', audioUrl: 'https://www.al-hamd.com/audio/tajweed/madd_silah_2.mp3', description: 'صلة كبرى' },
        ]
    },
    {
        id: 'madd_badal',
        title: 'مد البدل (Madd Badal)',
        description: 'أن تتقدم الهمزة على حرف المد في كلمة واحدة. يمد حركتين.',
        color: '#DC143C',
        examples: [
            { text: 'آدَمَ', audioUrl: 'https://www.al-hamd.com/audio/tajweed/madd_badal_1.mp3' },
            { text: 'إِيمَانًا', audioUrl: 'https://www.al-hamd.com/audio/tajweed/madd_badal_2.mp3' },
            { text: 'أُوتُوا', audioUrl: 'https://www.al-hamd.com/audio/tajweed/madd_badal_3.mp3' },
        ]
    },
    {
        id: 'rules_ra',
        title: 'أحكام الراء (Rules of Ra)',
        description: 'للراء حالتان: التفخيم (تغليظ الصوت) والترقيق (تنحيف الصوت) حسب حركتها وما قبلها.',
        color: '#8B4513',
        examples: [
            { text: 'رَبَّنَا', audioUrl: 'https://www.al-hamd.com/audio/tajweed/ra_1.mp3', description: 'تفخيم' },
            { text: 'رِزْقًا', audioUrl: 'https://www.al-hamd.com/audio/tajweed/ra_2.mp3', description: 'ترقيق' },
            { text: 'فِرْعَوْنَ', audioUrl: 'https://www.al-hamd.com/audio/tajweed/ra_3.mp3', description: 'ترقيق' },
        ]
    },
    {
        id: 'rules_lam',
        title: 'أحكام اللام (Rules of Lam)',
        description: 'الأصل في اللام الترقيق، وتفخم في لفظ الجلالة (الله) إذا سبقها فتح أو ضم.',
        color: '#4B0082',
        examples: [
            { text: 'قَالَ اللَّهُ', audioUrl: 'https://www.al-hamd.com/audio/tajweed/lam_1.mp3', description: 'تفخيم' },
            { text: 'بِسْمِ اللَّهِ', audioUrl: 'https://www.al-hamd.com/audio/tajweed/lam_2.mp3', description: 'ترقيق' },
            { text: 'لِلَّهِ', audioUrl: 'https://www.al-hamd.com/audio/tajweed/lam_3.mp3', description: 'ترقيق' },
        ]
    }
];

const TajweedEducation: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [selectedRule, setSelectedRule] = useState<string | null>(null);
    const [playingAudio, setPlayingAudio] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const playAudio = (url: string) => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
        if (playingAudio === url) {
            setPlayingAudio(null);
            return;
        }
        setPlayingAudio(url);
        audioRef.current = new Audio(url);
        audioRef.current.play();
        audioRef.current.onended = () => setPlayingAudio(null);
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-[#F8F9FA] text-[#212529]"
            dir="rtl"
        >
            {/* Header - Quran Majeed Style */}
            <div className="sticky top-0 z-20 bg-[#1B4332] text-white px-4 py-4 flex items-center shadow-lg">
                <button onClick={onBack} className="p-2 hover:bg-[#2D6A4F] rounded-full transition-colors ml-2">
                    <i className="fa-solid fa-arrow-right text-xl"></i>
                </button>
                <div className="flex flex-col">
                    <h1 className="text-lg font-bold">قواعد التجويد</h1>
                    <span className="text-xs opacity-80">تعلم أحكام التلاوة الصحيحة</span>
                </div>
            </div>

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
        </motion.div>
    );
};

export default TajweedEducation;
