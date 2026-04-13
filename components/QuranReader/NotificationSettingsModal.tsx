import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Smartphone, AppWindow, VolumeX } from 'lucide-react';
import { toArabic } from './constants';
import { usePrayerTimes } from '../../context/PrayerTimesContext';
import { setupNotifications } from '../../utils/notifications';

interface NotificationSettingsModalProps {
    onClose: () => void;
    showToast: (msg: string) => void;
    isLandscape: boolean;
    modeSuffix: string;
    initialTab?: 'app' | 'phone';
}

const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({ onClose, showToast, isLandscape, modeSuffix, initialTab }) => {
    const { config, updateConfig } = usePrayerTimes();
    const [activeTab, setActiveTab] = useState<'app' | 'phone'>(initialTab || 'app');

    const [appSettings, setAppSettings] = useState(() => {
        const saved = localStorage.getItem('notification_settings' + modeSuffix);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Error parsing notification settings', e);
            }
        }
        return {
            quarter: true,
            sajda: true,
            themes: true,
            downloads: true,
            bookmarks: true,
            juz: true,
            general: true
        };
    });

    const [phoneSettings, setPhoneSettings] = useState(() => {
        const saved = localStorage.getItem('phone_notifications_settings');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Error parsing phone notification settings', e);
            }
        }
        return {
            sabah: true,
            masaa: true,
            dua: true,
            tasbeehMorning: true,
            tasbeehEvening: true,
            kahf: true,
        };
    });

    const toggleAppSetting = (key: string) => {
        const newSettings = { ...appSettings, [key]: !appSettings[key] };
        setAppSettings(newSettings);
        localStorage.setItem('notification_settings' + modeSuffix, JSON.stringify(newSettings));
        window.dispatchEvent(new Event('notification-settings-change'));
        
        const labels: Record<string, string> = {
            quarter: 'تنبيهات الأحزاب والأرباع',
            sajda: 'تنبيهات السجدات',
            themes: 'تنبيهات تغيير الثيمات',
            downloads: 'تنبيهات التحميل',
            bookmarks: 'تنبيهات الإشارات المرجعية',
            juz: 'تنبيهات بداية الأجزاء',
            general: 'التنبيهات العامة'
        };
        
        showToast(`${newSettings[key] ? 'تم تفعيل' : 'تم تعطيل'} ${labels[key]}`);
    };

    const togglePhoneSetting = (key: string) => {
        const newSettings = { ...phoneSettings, [key]: !phoneSettings[key] };
        setPhoneSettings(newSettings);
        localStorage.setItem('phone_notifications_settings', JSON.stringify(newSettings));
        setupNotifications(newSettings);
        
        const labels: Record<string, string> = {
            sabah: 'أذكار الصباح',
            masaa: 'أذكار المساء',
            dua: 'وقت الدعاء',
            tasbeehMorning: 'التسبيح (صباحاً)',
            tasbeehEvening: 'التسبيح (مساءً)',
            kahf: 'سورة الكهف',
        };
        
        showToast(`${newSettings[key] ? 'تم تفعيل' : 'تم تعطيل'} ${labels[key]}`);
    };

    const toggleNightNotification = (key: 'firstThird' | 'midnight' | 'lastThird') => {
        const currentNightNotifs = config.nightNotifications || { firstThird: true, midnight: true, lastThird: true };
        const newNightNotifs = { ...currentNightNotifs, [key]: !currentNightNotifs[key] };
        updateConfig({ nightNotifications: newNightNotifs });
        
        const labels: Record<string, string> = {
            firstThird: 'أول الليل',
            midnight: 'منتصف الليل',
            lastThird: 'الثلث الأخير'
        };
        
        showToast(`${newNightNotifs[key] ? 'تم تفعيل' : 'تم تعطيل'} إشعار ${labels[key]}`);
    };

    const muteAudioForDuration = (durationDays: number) => {
        const muteUntil = Date.now() + durationDays * 24 * 60 * 60 * 1000;
        updateConfig({ audioMutedUntil: muteUntil });
        showToast(`تم تعطيل التنبيهات الصوتية للصلاة لمدة ${durationDays} يوم`);
    };

    const unmuteAudio = () => {
        updateConfig({ audioMutedUntil: undefined });
        showToast('تم تفعيل التنبيهات الصوتية للصلاة');
    };

    const isAudioMuted = config.audioMutedUntil && Date.now() < config.audioMutedUntil;

    return (
        <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[1200] flex items-center justify-center ${isLandscape ? 'p-0' : 'p-4'} animate-fadeIn`} onClick={onClose}>
            <div className={`modal-skinned w-full ${isLandscape ? 'max-w-4xl h-full rounded-none max-h-screen' : 'max-w-md rounded-2xl max-h-[85vh]'} shadow-2xl overflow-hidden flex flex-col animate-modal-enter`} onClick={e => e.stopPropagation()}>
                <div className="theme-header-bg p-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        <h3 className="font-bold text-lg">الإشعارات</h3>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-black/10 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button 
                        className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'app' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'opacity-60'}`}
                        onClick={() => setActiveTab('app')}
                    >
                        <AppWindow className="w-4 h-4" />
                        إشعارات التطبيق
                    </button>
                    <button 
                        className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'phone' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'opacity-60'}`}
                        onClick={() => setActiveTab('phone')}
                    >
                        <Smartphone className="w-4 h-4" />
                        إشعارات الهاتف
                    </button>
                </div>

                <div className="p-4 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                    {activeTab === 'app' ? (
                        <div className="space-y-2 animate-fadeIn">
                            <p className="text-xs opacity-70 text-center mb-4">
                                إشعارات تظهر داخل التطبيق أثناء الاستخدام
                            </p>
                            {[
                                { id: 'quarter', label: 'الأحزاب والأرباع', desc: 'تنبيه عند الوصول لبداية حزب أو ربع جديد' },
                                { id: 'juz', label: 'بداية الأجزاء', desc: 'تنبيه عند الانتقال لجزء جديد' },
                                { id: 'sajda', label: 'مواضع السجدات', desc: 'تنبيه عند الوصول لآية بها سجدة تلاوة' },
                                { id: 'themes', label: 'تغيير الثيمات', desc: 'تنبيه عند تطبيق لون أو ثيم جديد' },
                                { id: 'downloads', label: 'التحميلات', desc: 'تنبيهات حالة تحميل السور أو التفاسير' },
                                { id: 'bookmarks', label: 'الإشارات المرجعية', desc: 'تنبيه عند حفظ أو حذف إشارة مرجعية' },
                                { id: 'general', label: 'تنبيهات عامة', desc: 'تنبيهات الحفظ، الاختبارات، والعمليات الأخرى' }
                            ].map((item) => (
                                <div 
                                    key={item.id}
                                    onClick={() => toggleAppSetting(item.id)}
                                    className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer ${
                                        appSettings[item.id] 
                                        ? 'themed-card-bg border-emerald-500 shadow-sm' 
                                        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60'
                                    }`}
                                >
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-bold text-sm">{item.label}</span>
                                        <span className="text-[10px] opacity-60">{item.desc}</span>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                                        appSettings[item.id] ? 'bg-emerald-500 text-white' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}>
                                        {appSettings[item.id] && <Check className="w-3 h-3" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4 animate-fadeIn">
                            <p className="text-xs opacity-70 text-center mb-2">
                                إشعارات تظهر على شاشة الهاتف حتى لو كان التطبيق مغلقاً
                            </p>

                            <div className="space-y-2">
                                <h4 className="font-bold text-sm mb-2 opacity-80">أوقات الليل</h4>
                                {[
                                    { id: 'firstThird', label: 'أول الليل', desc: 'تنبيه بدخول وقت أول الليل' },
                                    { id: 'midnight', label: 'منتصف الليل', desc: 'تنبيه بدخول منتصف الليل الشرعي' },
                                    { id: 'lastThird', label: 'الثلث الأخير', desc: 'تنبيه بدخول الثلث الأخير من الليل' }
                                ].map((item) => {
                                    const isEnabled = config.nightNotifications?.[item.id as keyof typeof config.nightNotifications] ?? true;
                                    return (
                                        <div 
                                            key={item.id}
                                            onClick={() => toggleNightNotification(item.id as 'firstThird' | 'midnight' | 'lastThird')}
                                            className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer ${
                                                isEnabled 
                                                ? 'themed-card-bg border-emerald-500 shadow-sm' 
                                                : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60'
                                            }`}
                                        >
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-bold text-sm">{item.label}</span>
                                                <span className="text-[10px] opacity-60">{item.desc}</span>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                                                isEnabled ? 'bg-emerald-500 text-white' : 'bg-gray-300 dark:bg-gray-600'
                                            }`}>
                                                {isEnabled && <Check className="w-3 h-3" />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                                <h4 className="font-bold text-sm mb-2 opacity-80">الأذكار والتسبيح</h4>
                                {[
                                    { id: 'sabah', label: 'أذكار الصباح', desc: 'تنبيه يومي الساعة 7:00 صباحاً' },
                                    { id: 'masaa', label: 'أذكار المساء', desc: 'تنبيه يومي الساعة 4:30 عصراً' },
                                    { id: 'dua', label: 'وقت الدعاء', desc: 'تنبيه يومي الساعة 2:00 ظهراً' },
                                    { id: 'tasbeehMorning', label: 'التسبيح (صباحاً)', desc: 'تنبيه يومي الساعة 10:00 صباحاً' },
                                    { id: 'tasbeehEvening', label: 'التسبيح (مساءً)', desc: 'تنبيه يومي الساعة 8:00 مساءً' },
                                    { id: 'kahf', label: 'سورة الكهف', desc: 'تنبيه أسبوعي يوم الجمعة الساعة 9:00 صباحاً' }
                                ].map((item) => (
                                    <div 
                                        key={item.id}
                                        onClick={() => togglePhoneSetting(item.id)}
                                        className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer ${
                                            phoneSettings[item.id as keyof typeof phoneSettings] 
                                            ? 'themed-card-bg border-emerald-500 shadow-sm' 
                                            : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60'
                                        }`}
                                    >
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-bold text-sm">{item.label}</span>
                                            <span className="text-[10px] opacity-60">{item.desc}</span>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                                            phoneSettings[item.id as keyof typeof phoneSettings] ? 'bg-emerald-500 text-white' : 'bg-gray-300 dark:bg-gray-600'
                                        }`}>
                                            {phoneSettings[item.id as keyof typeof phoneSettings] && <Check className="w-3 h-3" />}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-bold text-sm opacity-80 flex items-center gap-2">
                                        <VolumeX className="w-4 h-4" />
                                        إيقاف التنبيهات الصوتية للصلاة
                                    </h4>
                                    {isAudioMuted && (
                                        <button onClick={unmuteAudio} className="text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded-md font-bold">
                                            تفعيل الصوت
                                        </button>
                                    )}
                                </div>
                                {isAudioMuted && config.audioMutedUntil && (
                                    <p className="text-xs text-red-500 mb-2">
                                        التنبيهات الصوتية متوقفة حتى: {new Date(config.audioMutedUntil).toLocaleDateString('ar-SA')}
                                    </p>
                                )}
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { label: 'اليوم', days: 1 },
                                        { label: 'غداً', days: 2 },
                                        { label: 'يومين', days: 2 },
                                        { label: '3 أيام', days: 3 },
                                        { label: '4 أيام', days: 4 },
                                        { label: 'أسبوع', days: 7 },
                                        { label: 'أسبوعين', days: 14 },
                                        { label: 'شهر', days: 30 }
                                    ].map((opt) => (
                                        <button
                                            key={opt.label}
                                            onClick={() => muteAudioForDuration(opt.days)}
                                            className="py-2 px-1 text-xs font-bold rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 themed-card-bg border-t border-gray-100 dark:border-gray-800">
                    <button 
                        onClick={onClose}
                        className="theme-accent-btn w-full font-bold py-3 rounded-xl shadow-lg transition-transform active:scale-95"
                    >
                        تم
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationSettingsModal;
