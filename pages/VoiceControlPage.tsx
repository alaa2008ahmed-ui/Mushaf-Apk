
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useVoiceControl, VoiceCommand } from '../context/VoiceControlContext';
import { Mic, MicOff, Trash2, Edit2, Check, X, Plus, RotateCcw, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import BottomBar from '../components/BottomBar';

const AVAILABLE_ACTIONS = [
    { id: 'next_page', name: 'الصفحة التالية' },
    { id: 'prev_page', name: 'الصفحة السابقة' },
    { id: 'open_search', name: 'فتح البحث' },
    { id: 'open_themes', name: 'فتح الثيمات' },
    { id: 'open_settings', name: 'فتح الإعدادات' },
    { id: 'open_bookmarks', name: 'فتح العلامات' },
    { id: 'open_tajweed', name: 'فتح تعليم التجويد' },
    { id: 'open_athkar', name: 'فتح الأذكار' },
    { id: 'open_prayer', name: 'فتح مواقيت الصلاة' },
    { id: 'open_qibla', name: 'فتح القبلة' },
    { id: 'open_tasbeeh', name: 'فتح المسبحة' },
    { id: 'play_audio', name: 'تشغيل الصوت' },
    { id: 'stop_audio', name: 'إيقاف الصوت' },
    { id: 'go_home', name: 'الرئيسية' },
    { id: 'increase_font', name: 'تكبير الخط' },
    { id: 'decrease_font', name: 'تصغير الخط' },
    { id: 'change_theme', name: 'تغيير لون الخلفية' },
    { id: 'download_quran', name: 'تحميل القرآن' },
    { id: 'download_tafsir', name: 'تحميل التفسير' },
    { id: 'show_tafsir', name: 'عرض التفسير' },
    { id: 'open_nawawi', name: 'فتح الأربعون النووية' },
    { id: 'open_calculators', name: 'فتح الحاسبة الشرعية' },
    { id: 'open_listen', name: 'فتح الاستماع للقرآن' },
    { id: 'open_adia', name: 'فتح الأدعية' },
    { id: 'open_salah_adhkar', name: 'فتح أذكار الصلاة' },
    { id: 'open_hisn_muslim', name: 'فتح حصن المسلم' },
    { id: 'open_calendar', name: 'فتح التقويم' },
    { id: 'open_hajj_umrah', name: 'فتح الحج والعمرة' },
    { id: 'open_voice_control', name: 'فتح التحكم الصوتي' },
    { id: 'set_orientation_horizontal', name: 'القراءة الأفقية (عرضي)' },
    { id: 'set_orientation_vertical', name: 'القراءة الرأسية (طولي)' },
    { id: 'disable_voice_control', name: 'إيقاف التحكم الصوتي' },
];

const VoiceControlPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { theme } = useTheme();
    const { 
        isEnabled, 
        setIsEnabled, 
        isListening, 
        transcript, 
        commands, 
        updateCommand, 
        addCommand, 
        deleteCommand,
        resetToDefaults,
        showVoiceIcon,
        setShowVoiceIcon
    } = useVoiceControl();

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [showAddCommand, setShowAddCommand] = useState(false);
    const [newPhrase, setNewPhrase] = useState('');
    const [newAction, setNewAction] = useState('');

    const handleEdit = (cmd: VoiceCommand) => {
        setEditingId(cmd.id);
        setEditValue(cmd.phrase);
    };

    const handleSaveEdit = (id: string) => {
        if (editValue.trim()) {
            updateCommand(id, editValue.trim());
            setEditingId(null);
        }
    };

    const handleAdd = () => {
        if (newPhrase.trim() && newAction) {
            addCommand(newPhrase.trim(), newAction);
            setNewPhrase('');
            setNewAction('');
            setShowAddCommand(false);
        }
    };

    return (
        <div className="h-screen flex flex-col bg-transparent overflow-hidden">
            <header className="app-top-bar">
                <div className="app-top-bar__inner flex items-center justify-center px-4">
                    <div className="text-center">
                        <h1 className="app-top-bar__title text-2xl font-kufi">التحكم الصوتي</h1>
                        <p className="app-top-bar__subtitle">إدارة الأوامر الصوتية الذكية</p>
                    </div>
                </div>
            </header>

            <main className="w-full flex-1 flex flex-col items-center overflow-hidden p-4 pb-24">
                <div className="w-full max-w-lg flex-1 overflow-y-auto hide-scrollbar pb-6 space-y-6">
                    {/* Status Section */}
                    <div className="themed-card p-6 flex flex-col items-center justify-center space-y-4">
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsEnabled(!isEnabled)}
                            className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all ${isEnabled && isListening ? 'animate-pulse' : ''}`}
                            style={{ 
                                backgroundColor: isEnabled ? (isListening ? '#ef4444' : '#10b981') : '#9ca3af',
                                color: '#ffffff'
                            }}
                        >
                            {isEnabled ? <Mic className="w-12 h-12" /> : <MicOff className="w-12 h-12" />}
                        </motion.button>
                        <div className="text-center">
                            <p className="text-lg font-bold">
                                {isEnabled ? (isListening ? 'جاري الاستماع...' : 'التحكم الصوتي مفعل') : 'التحكم الصوتي معطل'}
                            </p>
                            <p className="text-xs opacity-60 mt-1">
                                {isEnabled ? 'يمكنك التحدث بالأوامر من أي مكان في التطبيق' : 'اضغط على الزر لتفعيل الاستماع الدائم'}
                            </p>
                        </div>
                        
                        {transcript && isListening && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 rounded-2xl bg-black/5 w-full text-center italic font-bold text-lg border border-black/5"
                            >
                                "{transcript}"
                            </motion.div>
                        )}
                    </div>

                    {/* Settings Section */}
                    <div className="themed-card p-6 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-lg">أيقونة التحكم الصوتي</h3>
                            <p className="text-xs opacity-60 mt-1">إظهار أيقونة التحكم الصوتي في الصفحة الرئيسية</p>
                        </div>
                        <button 
                            onClick={() => setShowVoiceIcon(!showVoiceIcon)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${showVoiceIcon ? 'bg-emerald-500' : 'bg-gray-300'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showVoiceIcon ? '-translate-x-6' : '-translate-x-1'}`} />
                        </button>
                    </div>

                    {/* Help Section */}
                    <div className="p-5 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/20">
                        <h4 className="text-sm font-bold text-emerald-600 mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                            أمثلة سريعة للأوامر الذكية:
                        </h4>
                        <ul className="text-xs space-y-2 opacity-80 list-disc list-inside font-medium">
                            <li>"الاستماع للقران" / "مواقيت الصلاه"</li>
                            <li>"اذكار الصلاه" / "حصن المسلم"</li>
                            <li>"التقويم" / "القبله" / "الحج والعمرة"</li>
                            <li>"اذهب إلى سورة الكهف آية عشرة"</li>
                            <li>"صفحة مائة" / "الجزء الثلاثون"</li>
                            <li>"إيقاف التحكم الصوتي" (للتعطيل الفوري)</li>
                        </ul>
                    </div>

                    {/* Instructions Section */}
                    <div className="themed-card p-6 space-y-6">
                        <h3 className="font-bold text-lg flex items-center gap-2 border-b pb-2">
                            <ChevronRight className="w-5 h-5 text-primary" />
                            دليل التحكم الصوتي الشامل
                        </h3>
                        
                        <div className="space-y-6 text-sm opacity-90 leading-relaxed">
                            <section className="space-y-2">
                                <h4 className="font-bold text-primary flex items-center gap-2">
                                    <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                                    1. محرك "انطق ما تراه":
                                </h4>
                                <p className="pr-4">هذه هي الميزة الأقوى؛ يمكنك ببساطة نطق اسم أي زر أو قائمة تظهر أمامك على الشاشة حالياً، وسيقوم التطبيق بالنقر عليها فوراً. مثلاً: "الصفحة الرئيسية"، "مواقيت الصلاة"، "القبلة".</p>
                            </section>

                            <section className="space-y-2">
                                <h4 className="font-bold text-primary flex items-center gap-2">
                                    <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                                    2. التنقل الذكي في المصحف:
                                </h4>
                                <p className="pr-4">النظام يفهم السياق؛ إذا كنت تقرأ في المصحف ونطقت رقماً فقط (مثل "عشرين")، سينتقل بك إلى الآية 20 في السورة الحالية. كما يمكنك استخدام:</p>
                                <ul className="list-disc list-inside pr-6 space-y-1 text-xs">
                                    <li>"سورة [اسم السورة]" للانتقال لبداية السورة.</li>
                                    <li>"صفحة [رقم]" للانتقال لصفحة محددة.</li>
                                    <li>"جزء [رقم]" للانتقال لبداية الجزء.</li>
                                </ul>
                            </section>

                            <section className="space-y-2">
                                <h4 className="font-bold text-primary flex items-center gap-2">
                                    <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                                    3. التحكم في وضع الشاشة والخط:
                                </h4>
                                <ul className="list-disc list-inside pr-4 space-y-1">
                                    <li>"القراءة الأفقية" أو "عرضي" لتدوير الشاشة.</li>
                                    <li>"القراءة الرأسية" أو "طولي" للوضع المعتاد.</li>
                                    <li>"تكبير الخط" أو "تصغير الخط" للتحكم في حجم النص.</li>
                                </ul>
                            </section>

                            <section className="space-y-2">
                                <h4 className="font-bold text-primary flex items-center gap-2">
                                    <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                                    4. تحميل القرآن والتفسير صوتياً:
                                </h4>
                                <ul className="list-disc list-inside pr-4 space-y-1 text-xs">
                                    <li>انطق "تحميل القرآن" أو "تحميل التفسير" لفتح القائمة.</li>
                                    <li>داخل القائمة: انطق اسم السورة (مثل "البقرة")، أو رقم الجزء (مثل "الجزء الأول")، أو اسم القارئ/المفسر لتحديده مباشرة.</li>
                                    <li>انطق "تحميل" لبدء التنزيل فوراً.</li>
                                    <li>انطق "إلغاء" لإيقاف التحميل أو إغلاق القائمة.</li>
                                </ul>
                            </section>

                            <section className="space-y-2">
                                <h4 className="font-bold text-primary flex items-center gap-2">
                                    <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                                    5. التنقل العام بين الأقسام:
                                </h4>
                                <p className="pr-4">يمكنك الانتقال السريع لأي قسم في التطبيق بمجرد نطق اسمه:</p>
                                <ul className="list-disc list-inside pr-6 space-y-1 text-xs">
                                    <li>"الرئيسية" للعودة للشاشة الرئيسية.</li>
                                    <li>"الأذكار" أو "أذكار الصباح والمساء".</li>
                                    <li>"مواقيت الصلاة" أو "القبلة" أو "المسبحة".</li>
                                    <li>"حصن المسلم" أو "الأربعون النووية".</li>
                                    <li>"التقويم" أو "الحج والعمرة" أو "الأدعية".</li>
                                </ul>
                            </section>

                            <section className="space-y-2">
                                <h4 className="font-bold text-primary flex items-center gap-2">
                                    <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                                    6. التحكم في الصوت والاستماع:
                                </h4>
                                <ul className="list-disc list-inside pr-4 space-y-1">
                                    <li>"تشغيل" أو "استماع" لبدء القراءة الصوتية.</li>
                                    <li>"إيقاف" أو "اسكت" لإنهاء القراءة فوراً.</li>
                                    <li>"الاستماع للقرآن" لفتح قسم مشغل الصوتيات.</li>
                                </ul>
                            </section>

                            <section className="space-y-2">
                                <h4 className="font-bold text-primary flex items-center gap-2">
                                    <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                                    7. أوامر المصحف المتقدمة:
                                </h4>
                                <ul className="list-disc list-inside pr-4 space-y-1 text-xs">
                                    <li>"فتح البحث" للبحث عن آية أو سورة.</li>
                                    <li>"فتح العلامات" للوصول لعلامات الحفظ.</li>
                                    <li>"تعليم التجويد" لفتح دروس التجويد الملون.</li>
                                    <li>"عرض التفسير" لإظهار تفسير الآية الحالية.</li>
                                </ul>
                            </section>

                            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs italic">
                                * نصيحة: لا تقلق بشأن التشكيل أو "ال" التعريف، النظام ذكي بما يكفي ليفهم "البقرة" أو "بقرة" بنفس الدقة.
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <BottomBar onHomeClick={onBack} onThemesClick={() => {}} showThemes={false} />
        </div>
    );
};

export default VoiceControlPage;
