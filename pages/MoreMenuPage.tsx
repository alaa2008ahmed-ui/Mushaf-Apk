import React, { useState, useEffect } from 'react';
import BottomBar from '../components/BottomBar';
import { useTheme } from '../context/ThemeContext';
import InteractiveBackground from '../components/InteractiveBackground';
import NavButton from '../components/MainMenu/NavButton';
import TutorialOverlay, { TutorialStep } from '../components/Tutorial/TutorialOverlay';
import { Grid, Mic } from 'lucide-react';

const ALL_MENU_ITEMS = [
    { id: 'quran', label: "📖 القرآن الكريم", className: "col-span-2 h-12", colorIndex: 0 },
    { id: 'listen', label: "🎧 الاستماع للقرآن", className: "col-span-2 h-10", colorIndex: 0 },
    { id: 'prayer-times', label: "⏱️ مواقيت الصلاة", className: "col-span-2 h-10", colorIndex: 0 },
    { id: 'daily-wird', label: "📅 الورد اليومي", className: "col-span-2 h-10", colorIndex: 0 },
    { id: 'memorization', label: "🧠 التحفيظ", className: "col-span-2 h-10", colorIndex: 0 },
    { id: 'voice-control', label: "🎙️ التحكم الصوتي", className: "col-span-2 h-12", colorIndex: 0 },
    { id: 'adia', label: "🤲 الأدعية", className: "h-10", colorIndex: 1 },
    { id: 'sabah-masaa', label: "☀️ الأذكار", className: "h-10", colorIndex: 1 },
    { id: 'salah-adhkar', label: "🕌 أذكار الصلاة", className: "h-10", colorIndex: 1 },
    { id: 'hisn-muslim', label: "🛡️ حصن المسلم", className: "h-10", colorIndex: 1 },
    { id: 'tasbeeh', label: "📿 السبحة", className: "h-10", colorIndex: 1 },
    { id: 'calendar', label: "📅 التقويم", className: "h-10", colorIndex: 1 },
    { id: 'qibla', label: "🧭 القبلة", className: "h-10", colorIndex: 1 },
    { id: 'hajj-umrah', label: "🕋 الحج والعمرة", className: "h-10", colorIndex: 1 },
    { id: 'nawawi', label: "📚 الأربعون النووية", className: "h-10", colorIndex: 1 },
    { id: 'calculators', label: "🧮 الحاسبة الشرعية", className: "h-10", colorIndex: 1 },
];

interface MoreMenuPageProps {
    onNavigate: (pageId: string) => void;
    onBack: () => void;
}

const MoreMenuPage: React.FC<MoreMenuPageProps> = ({ onNavigate, onBack }) => {
    const { theme, themeKey } = useTheme();
    const [visibleItems, setVisibleItems] = useState<string[]>(() => {
        const savedVisible = localStorage.getItem('visibleMenuItems');
        return savedVisible ? JSON.parse(savedVisible) : ALL_MENU_ITEMS.map(i => i.id);
    });

    const moreMenuTutorialSteps: TutorialStep[] = [
        {
            id: 'all-items',
            title: 'مركز الخدمات الشامل',
            text: 'هنا تجد جميع كنوز التطبيق في مكان واحد. من الأذكار اليومية إلى الكتب الإسلامية الهامة مثل حصن المسلم والأربعون النووية. تم ترتيب الأقسام لتصل إلى ما تريد بسرعة وسهولة، مما يجعل هذا القسم مرجعك اليومي لكل ما يخص العبادة.',
            icon: <Grid className="w-8 h-8 text-white" />
        },
        {
            id: 'new-features',
            title: 'أدوات العبادة المتقدمة',
            text: 'لقد أضفنا أدوات ذكية لمساعدتك في رحلتك الإيمانية: "الورد اليومي" لتنظيم ختماتك، "التحفيظ" لضبط حفظك، و"مواقيت الصلاة" الدقيقة. كل قسم مصمم ليوفر لك تجربة غنية ومفيدة.',
            icon: <Grid className="w-8 h-8 text-white" />
        },
        {
            id: 'voice-control-highlight',
            title: 'ثورة التحكم الصوتي',
            text: 'لا تدع هاتفك يشتتك أثناء العبادة؛ فعل ميزة التحكم الصوتي من هنا لتتحكم في كل شيء بصوتك. اطلب من المساعد الصوتي فتح أي قسم أو سورة، وسينفذ طلبك فوراً، مما يتيح لك تجربة استخدام "بدون لمس" بالكامل.',
            selector: '[data-id="nav-button-voice-control"]',
            icon: <Mic className="w-8 h-8 text-white" />
        },
        {
            id: 'calculators-highlight',
            title: 'الحاسبة الشرعية والخدمات',
            text: 'يتضمن هذا القسم أيضاً أدوات عملية مثل الحاسبة الشرعية لحساب الزكاة والمواريث، واتجاه القبلة، والتقويم الهجري. كل ما يحتاجه المسلم في حياته اليومية متوفر هنا بين يديك.',
            selector: '[data-id="nav-button-calculators"]',
            icon: <Grid className="w-8 h-8 text-white" />
        }
    ];

    return (
        <div>
            <InteractiveBackground />
            <div className="h-screen w-full flex flex-col overflow-hidden">
                <header className="app-top-bar relative z-10">
                    <div className="app-top-bar__inner flex items-center justify-center px-4">
                        <div className="text-center">
                            <h1 className="app-top-bar__title text-2xl font-kufi flex items-center justify-center gap-2">
                                <span className="text-indigo-500">✨</span>
                                القائمة الشاملة
                            </h1>
                            <p className="app-top-bar__subtitle">جميع أقسام التطبيق</p>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto pb-32 hide-scrollbar">
                    <div className="main-layout px-4 flex flex-col pt-6" style={{ fontFamily: theme.font }}>
                        <div className="grid grid-cols-2 gap-3 w-full max-w-sm mx-auto">
                            {ALL_MENU_ITEMS.map((item) => {
                                const isVisible = visibleItems.includes(item.id);
                                return (
                                    <div
                                        key={item.id}
                                        className={`${item.className} transition-all duration-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
                                        style={{ visibility: isVisible ? 'visible' : 'hidden' }}
                                    >
                                        <NavButton
                                            label={item.label}
                                            onClick={() => onNavigate(item.id)}
                                            className="w-full h-full"
                                            color={themeKey === 'olive_grove' ? (['quran', 'listen', 'prayer-times', 'daily-wird', 'memorization', 'voice-control'].includes(item.id) ? '#4D7C0F' : '#65A30D') : (theme.palette[item.colorIndex] || theme.palette[0])}
                                            border={theme.btnBorder}
                                            isGlass={theme.isGlass}
                                            btnText={theme.btnText}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <BottomBar onHomeClick={() => onNavigate('home')} onThemesClick={() => {}} showThemes={false} />
            <TutorialOverlay tutorialId="more-menu-tutorial" steps={moreMenuTutorialSteps} />
        </div>
    );
};

export default MoreMenuPage;
