import { SpotlightStep } from '../CommunitySpotlightGuide';

// 15. خطوات إرشاد شاشة إعداد التحفيظ والتكرار
export const MEMORIZATION_SETUP_STEPS: SpotlightStep[] = [
  {
    id: 'mem_dashboard',
    targetSelector: '#memorization-dashboard-container',
    titleAr: 'لوحة إنجاز الحافظ',
    titleEn: 'Memorization Journey Dashboard',
    descAr: 'تستعرض لك نسبة تقدمك الإجمالية في حفظ القرآن الكريم، إجمالي الآيات المحفوظة، ومعدل الاستمرار والمداومة.',
    descEn: 'Tracks your overall Quran memorization progress, total mastered ayahs, and active streak days.',
    badgeAr: 'لوحة الإنجاز',
    badgeEn: 'Dashboard',
    iconName: 'profile',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'mem_tabs',
    targetSelector: '#memorization-tabs-container',
    titleAr: 'تبويبات قسم التحفيظ المنهجي',
    titleEn: 'Memorization Section Tabs',
    descAr: 'تنقل بسهولة بين إعداد جلسات الحفظ، الخطط المنهجية الجاهزة، جدول المراجعة الدورية، ومركز الاختبارات المباشرة.',
    descEn: 'Switch smoothly between session setup, structured plans, review schedule, and instant quizzes.',
    badgeAr: 'الأقسام',
    badgeEn: 'Tabs',
    iconName: 'tab',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'mem_mode',
    targetSelector: '#memorization-selection-mode-container',
    titleAr: 'تحديد النطاق المرن',
    titleEn: 'Flexible Range Selection',
    descAr: 'اختر الطريقة الأنسب لك لتحديد المقاطع المراد حفظها: بالآية والسورة، بالصفحة، بالربع، أو بالجزء.',
    descEn: 'Choose how to specify your target passage: by Verse & Surah, Mushaf Page, Quarter (Rub\'), or Juz.',
    badgeAr: 'تحديد النطاق',
    badgeEn: 'Range',
    iconName: 'quran',
    accentColor: '#0ea5e9',
    gradient: 'from-sky-500 to-blue-600'
  },
  {
    id: 'mem_range',
    targetSelector: '#memorization-range-picker-container',
    titleAr: 'تحديد السورة والآيات',
    titleEn: 'Surah & Ayah Selector',
    descAr: 'انقر على أي من الحقول لتغيير سورة وآية البداية وسورة وآية النهاية للمقطع المطلوب بدقة متناهية.',
    descEn: 'Tap any field to customize your starting surah/ayah and ending target with precision.',
    badgeAr: 'النطاق',
    badgeEn: 'Ayah Target',
    iconName: 'verse',
    accentColor: '#8b5cf6',
    gradient: 'from-purple-500 to-indigo-600'
  },
  {
    id: 'mem_reader',
    targetSelector: '#reader-select-container',
    titleAr: 'اختيار القارئ المعلم',
    titleEn: 'Select Preferred Reciter',
    descAr: 'اختر القارئ المفضل لديك للاستماع لتلاوته المتقنة والترديد خلفه أثناء جلسة الحفظ المباركة.',
    descEn: 'Select your favorite reciter to listen to accurate recitations and repeat along during memorization.',
    badgeAr: 'القارئ',
    badgeEn: 'Reciter',
    iconName: 'user',
    accentColor: '#0ea5e9',
    gradient: 'from-sky-500 to-blue-600'
  },
  {
    id: 'mem_repeat',
    targetSelector: '#repetition-settings-container',
    titleAr: 'قواعد التكرار والربط الشنقيطي',
    titleEn: 'Repetition & Shanqiti Loop Rules',
    descAr: 'حدد عدد مرات تكرار الآية، تكرار النطاق الكامل، سكتة الترديد، تفعيل الربط بالسابقة، والتكرار التراكمي الشنقيطي لضمان رسوخ الآيات.',
    descEn: 'Set ayah repeats, range loops, pauses, verse linking, and Shanqiti cumulative loops for deep retention.',
    badgeAr: 'التكرار والربط',
    badgeEn: 'Repetition Rules',
    iconName: 'action',
    accentColor: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'mem_start',
    targetSelector: '#btn-start-memorization',
    titleAr: 'بدء جلسة التحفيظ',
    titleEn: 'Start Memorization Session',
    descAr: 'اضغط هنا لبدء الجلسة التفاعلية في المصحف والتلاوة والتكرار مع إبراز الآيات والإخفاء البصري.',
    descEn: 'Tap to start the interactive Quran session for recitation, repetition, visual hiding, and focus.',
    badgeAr: 'بدء الجلسة',
    badgeEn: 'Start Session',
    iconName: 'quran',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'mem_download',
    targetSelector: '#btn-download-reciters',
    titleAr: 'تحميل الصوتيات للعمل بدون إنترنت',
    titleEn: 'Download Audio for Offline Use',
    descAr: 'حمل تلاوات السور والقراء مسبقاً على جهازك لتواصل التحفيظ والتكرار في أي مكان بدون اتصال بالإنترنت.',
    descEn: 'Download recitations to your device so you can practice memorization offline anywhere.',
    badgeAr: 'بدون إنترنت',
    badgeEn: 'Offline Audio',
    iconName: 'nav',
    accentColor: '#0284c7',
    gradient: 'from-cyan-500 to-blue-600'
  }
];

// 15b. خطوات إرشاد تبويب خطط التحفيظ
export const MEMORIZATION_PLANS_STEPS: SpotlightStep[] = [
  {
    id: 'plans_intro',
    targetSelector: '#memorization-tabs-container',
    titleAr: 'الخطط المنهجية الجاهزة',
    titleEn: 'Curriculum Plans',
    descAr: 'خطط منهجية مقسمة يومياً لحفظ أجزاء وسور كاملة (مثل جزء عم، جزء تبارك، سورة البقرة).',
    descEn: 'Structured daily curricula to memorize full juzs or surahs (e.g. Juz Amma, Juz Tabarak, Al-Baqarah).',
    badgeAr: 'الخطط المنهجية',
    badgeEn: 'Plans',
    iconName: 'tab',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'plans_list',
    targetSelector: '#memorization-preset-plans-container',
    titleAr: 'متابعة الورد والتقدم اليومي',
    titleEn: 'Track Daily Target & Progress',
    descAr: 'استعرض التفاصيل اليومية لكل خطة، واضغط على «البدء في هذه الخطة» أو «متابعة ورد اليوم» للانطلاق مباشرة.',
    descEn: 'Browse daily details for each plan and tap to start or resume today\'s assigned target.',
    badgeAr: 'متابعة الورد',
    badgeEn: 'Daily Target',
    iconName: 'action',
    accentColor: '#3b82f6',
    gradient: 'from-blue-500 to-indigo-600'
  }
];

// 16. خطوات إرشاد شاشة جدول المراجعة والتثبيت
export const MEMORIZATION_REVIEW_STEPS: SpotlightStep[] = [
  {
    id: 'rev_tabs',
    targetSelector: '#memorization-tabs-container',
    titleAr: 'جدول المراجعة الدورية',
    titleEn: 'Periodic Review Schedule',
    descAr: 'هذا القسم مخصص لإدارة وتثبيت ما حفظته وفق خوارزمية التكرار المتباعد لتفادي النسيان.',
    descEn: 'This section organizes and strengthens what you memorized using spaced repetition so you never forget.',
    badgeAr: 'المراجعة',
    badgeEn: 'Review',
    iconName: 'tab',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'rev_stats',
    targetSelector: '#memorization-review-stats',
    titleAr: 'إحصائيات الإنجاز والمراجعة (SM-2)',
    titleEn: 'Memorization Stats (SM-2)',
    descAr: 'يعرض لك إجمالي المقاطع المحفوظة، مع بيان عدد المقاطع التي استحقت موعد المراجعة اليوم بناءً على خوارزمية التكرار المتباعد.',
    descEn: 'Displays total memorized ranges and the number of passages due for review today based on spaced repetition.',
    badgeAr: 'الإحصائيات',
    badgeEn: 'Stats',
    iconName: 'profile',
    accentColor: '#3b82f6',
    gradient: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'rev_list',
    targetSelector: '#memorization-review-list',
    titleAr: 'قائمة المحفوظات ومواعيد التثبيت',
    titleEn: 'Review Schedule List',
    descAr: 'يعرض جميع مقاطعك المحفوظة مع تواريخ مراجعتها؛ يمكنك الضغط على زر «بدء المراجعة والتكرار» للانطلاق فوراً في تثبيتها، أو إجراء اختبار سريع.',
    descEn: 'Lists all your memorized passages with due dates; tap "Start Review & Repeat" to review immediately or take a quick test.',
    badgeAr: 'جدول المحفوظات',
    badgeEn: 'Schedule List',
    iconName: 'quran',
    accentColor: '#8b5cf6',
    gradient: 'from-purple-500 to-indigo-600'
  }
];

// 16b. خطوات إرشاد تبويب اختبار الحفظ
export const MEMORIZATION_QUIZ_STEPS: SpotlightStep[] = [
  {
    id: 'quiz_intro',
    targetSelector: '#memorization-tabs-container',
    titleAr: 'مركز الاختبار القرآني المباشر',
    titleEn: 'Instant Quran Quiz Center',
    descAr: 'مركز متكامل لاختبار قوة حفظك وتثبيت المحفوظات بأساليب تفاعلية مشوقة.',
    descEn: 'Interactive test center to challenge your retention and solidify verses.',
    badgeAr: 'الاختبار',
    badgeEn: 'Quiz Center',
    iconName: 'tab',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'quiz_modes',
    targetSelector: '#memorization-quiz-mode-container',
    titleAr: 'أنماط الاختبار التفاعلية',
    titleEn: 'Interactive Quiz Modes',
    descAr: 'اختبر نفسك بالتسميع الصوتي عبر المايكروفون، أو ترتيب الكلمات المبعثرة، أو اختيار الآية القادمة من السورة.',
    descEn: 'Test yourself via Voice Recitation microphone, Word Reordering, or Next Verse Selection.',
    badgeAr: 'أنماط الاختبار',
    badgeEn: 'Quiz Modes',
    iconName: 'action',
    accentColor: '#8b5cf6',
    gradient: 'from-purple-500 to-indigo-600'
  },
  {
    id: 'quiz_quick',
    targetSelector: '#memorization-quick-quizzes-container',
    titleAr: 'اختبارات سريعة على سور شائعة',
    titleEn: 'Quick Tests on Popular Surahs',
    descAr: 'اختر أي سورة شائعة (مثل الفاتحة، الملك، أواخر الكهف) لبدء اختبار فوري وتثبيت حفظك بدقة.',
    descEn: 'Pick popular surahs (e.g. Al-Fatihah, Al-Mulk, Early Al-Kahf) to launch an instant quiz and verify retention.',
    badgeAr: 'اختبار سريع',
    badgeEn: 'Quick Test',
    iconName: 'sparkles',
    accentColor: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600'
  }
];
