import { SpotlightStep } from '../CommunitySpotlightGuide';

export const LISTEN_QURAN_PAGE_STEPS: SpotlightStep[] = [
  {
    id: 'listen_top_fav',
    targetSelector: '#btn-listen-toggle-fav',
    titleAr: 'إضافة التلاوة للمفضلة',
    titleEn: 'Add to Favorites',
    descAr: 'اضغط على رمز القلب لحفظ التلاوة الحالية (السورة مع القارئ المختار) في قائمة مفضلاتك للرجوع إليها والاستماع لها في أي وقت بلمسة واحدة.',
    descEn: 'Tap the heart icon to save the current recitation (surah & selected reciter) to your favorites for instant playback anytime.',
    badgeAr: 'المفضلة',
    badgeEn: 'Favorites',
    iconName: 'action',
    accentColor: '#ec4899',
    gradient: 'from-pink-500 to-rose-600'
  },
  {
    id: 'listen_reciter_select',
    targetSelector: '#btn-listen-select-reciter',
    titleAr: 'اختيار القارئ والشيخ',
    titleEn: 'Select Reciter',
    descAr: 'اضغط لاختيار قارئك المفضل من بين نخبة من كبار قراء العالم الإسلامي بمختلف الروايات وطرق التلاوة (مرتل ومجود)، مع إمكانية البحث السريع.',
    descEn: 'Tap to choose your favorite reciter from renowned Islamic reciters across multiple recitation styles, with quick search.',
    badgeAr: 'القارئ',
    badgeEn: 'Reciter',
    iconName: 'user',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'listen_surah_select',
    targetSelector: '#btn-listen-select-surah',
    titleAr: 'اختيار السورة الكريمة',
    titleEn: 'Select Surah',
    descAr: 'اضغط لعرض قائمة سور القرآن الكريم المتاحة بصوت القارئ الحالي، مع بيان رقم السورة واسمها ونوعها (مكية أو مدنية).',
    descEn: 'Tap to browse all available Quranic surahs for this reciter, with surah number, name, and revelation type.',
    badgeAr: 'السورة',
    badgeEn: 'Surah',
    iconName: 'quran',
    accentColor: '#3b82f6',
    gradient: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'listen_player_controls',
    targetSelector: '#listen-player-card',
    titleAr: 'مشغل التلاوة والتحكم بالصوت',
    titleEn: 'Audio Player & Controls',
    descAr: 'مشغل الصوت التفاعلي: شريط تقديم وتأخير التلاوة بالدقائق والثواني، زر التشغيل والإيقاف المؤقت، وزري الانتقال للسورة التالية والسابقة.',
    descEn: 'Interactive audio player: seekbar to scrub through minutes and seconds, Play/Pause button, and skip to next or previous surah.',
    badgeAr: 'المشغل',
    badgeEn: 'Player',
    iconName: 'volume',
    accentColor: '#059669',
    gradient: 'from-emerald-600 to-teal-700'
  },
  {
    id: 'listen_sleep_timer',
    targetSelector: '#listen-sleep-timer-card',
    titleAr: 'مؤقت النوم والإيقاف التلقائي',
    titleEn: 'Sleep Timer & Auto-Stop',
    descAr: 'حدد موعداً لإيقاف التلاوة تلقائياً عند النوم؛ اختر فترات سريعة (15، 30، 60 دقيقة) أو عند نهاية السورة، أو حدد الدقائق يدوياً بـ (+ / -).',
    descEn: 'Set a timer to automatically stop playback when sleeping; choose quick presets (15, 30, 60 mins), at the end of the surah, or fine-tune minutes with (+ / -).',
    badgeAr: 'مؤقت النوم',
    badgeEn: 'Sleep Timer',
    iconName: 'moon',
    accentColor: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'listen_playback_options',
    targetSelector: '#listen-options-card',
    titleAr: 'خيارات التكرار والتشغيل المتواصل',
    titleEn: 'Repeat & Continuous Play',
    descAr: 'خيارات تشغيل ذكية: تفعيل تكرار نفس السورة تلقائياً للحفظ والمراجعة، أو التشغيل المتواصل للانتقال التلقائي للسور التالية تباعاً دون انقطاع.',
    descEn: 'Smart playback options: repeat the current surah for memorization, or enable continuous play to automatically transition to subsequent surahs.',
    badgeAr: 'خيارات التشغيل',
    badgeEn: 'Options',
    iconName: 'action',
    accentColor: '#8b5cf6',
    gradient: 'from-purple-500 to-violet-600'
  },
  {
    id: 'listen_download_surahs',
    targetSelector: '#btn-listen-download',
    titleAr: 'تحميل التلاوات بدون إنترنت',
    titleEn: 'Download for Offline Listening',
    descAr: 'تحميل سور المصحف الشريف بصوت أي قارئ تريده على ذاكرة هاتفك للاستماع لها في أي وقت ومكان دون الحاجة لاتصال بالإنترنت.',
    descEn: 'Download holy surahs recited by your favorite reciters to your device storage for offline playback anytime without internet.',
    badgeAr: 'تحميل التلاوات',
    badgeEn: 'Offline Download',
    iconName: 'nav',
    accentColor: '#0ea5e9',
    gradient: 'from-sky-500 to-blue-600'
  },
  {
    id: 'listen_saved_favorites',
    targetSelector: '#listen-favorites-card',
    titleAr: 'قائمة المفضلات المحفوظة',
    titleEn: 'Saved Recitations Favorites',
    descAr: 'بطاقة تجمع تلاواتك المفضلة (حتى 10 تلاوات)؛ اضغط على أي تلاوة لتشغيلها فوراً، أو احذفها بلمسة واحدة متى شئت.',
    descEn: 'Collection of your favorite recitations (up to 10); tap any item to play it instantly or remove it with one click.',
    badgeAr: 'المفضلات',
    badgeEn: 'Favorites List',
    iconName: 'block',
    accentColor: '#ef4444',
    gradient: 'from-rose-500 to-red-600'
  }
];

export const HAJJ_UMRAH_PAGE_STEPS: SpotlightStep[] = [
  {
    id: 'hajj_umrah_page_intro',
    titleAr: 'دليل الحج والعمرة والسبحة التفاعلية',
    titleEn: 'Hajj, Umrah & Tawaf Guide',
    descAr: 'رفيقك الفقهي والعملي لأداء مناسك الحج والعمرة على هدي السنة بيُسر وطمأنينة. يجمع خطوات العمرة وأنساك الحج الثلاثة والأخطاء الشائعة مع أدعية الطواف والسعي المرتبة، وعداد أشواط تفاعلي (٧ أشواط) قابل للتثبيت بالرئيسية، وقائمة تجهيز شاملة.',
    descEn: "Your practical companion to perform Hajj and Umrah smoothly according to the Sunnah. Covers Umrah steps, the three Hajj types, common mistakes, categorized Tawaf and Sa'i supplications, an interactive 7-circuit counter (pinnable to Home), and a preparation checklist.",
    badgeAr: 'فائدة الصفحة',
    badgeEn: 'Purpose & Benefit',
    iconName: 'block',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  }
];

export const VOICE_CONTROL_PAGE_STEPS: SpotlightStep[] = [
  {
    id: 'voice_control_intro',
    titleAr: 'التحكم الصوتي في التطبيق',
    titleEn: 'Voice Control',
    descAr: 'تمنحك هذه الصفحة تحكماً ذكياً في التطبيق بصوتك دون لمس الشاشة، مما يسهل القراءة والتنقل السريع أثناء التلاوة أو الانشغال. تتيح تفعيل الاستماع الدائم وإظهار زر المايك بالرئيسية، وتعرض دليلاً منظماً لأوامر التنقل العام والمصحف والتفسير والتحكم بالخط والصوت.',
    descEn: 'Enables hands-free navigation across the app using natural voice commands for effortless reading and multitasking. Lets you toggle continuous listening and the home mic icon, and provides an organized directory of general, smart Quran navigation, and reading/display commands.',
    badgeAr: 'فائدة الصفحة',
    badgeEn: 'Purpose & Benefit',
    iconName: 'voice',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  }
];

export const TASBEEH_PAGE_STEPS: SpotlightStep[] = [
  {
    id: 'tasbeeh_page_intro',
    titleAr: 'السبحة الإلكترونية الذكية',
    titleEn: 'Smart Electronic Tasbeeh',
    descAr: 'تُعينك على المداومة على الذكر والاستغفار في كل وقت عبر مسبحة رقمية متطورة تحسب تسبيحك بدقة وتنبهك عند إتمام الهدف. تضم ٦ تصاميم متنوعة وألواناً قابلة للتخصيص، مع إمكانية إضافة أذكارك وتحديد العدد المطلوب ومتابعة إحصائياتك اليومية وتثبيتها بالرئيسية.',
    descEn: 'Helps you stay consistent in daily dhikr and istighfar with a smart counter that tracks your progress and alerts you upon reaching your goal. Features 6 skins, customizable colors, custom dhikr phrases and targets, daily statistics, and an option to pin Quick Tasbeeh to Home.',
    badgeAr: 'فائدة الصفحة',
    badgeEn: 'Purpose & Benefit',
    iconName: 'block',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  }
];
