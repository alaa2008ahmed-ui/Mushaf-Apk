import { SpotlightStep } from '../CommunitySpotlightGuide';

export const SMART_HOME_HEADER_STEPS: SpotlightStep[] = [
  {
    id: 'smart_home_night_mode',
    targetSelector: '#night-mode-toggle-btn',
    titleAr: 'زر الأوضاع والثيمات',
    titleEn: 'Themes & Modes Menu',
    descAr: 'اضغط هنا للتبديل الفوري بين الوضع الذهبي، الوضع الليلي الفاخر (الأسود العميق)، الوضع السماوي المشرق، الوضع الزمردي الهادئ، والوضع العنابي الملكي.',
    descEn: 'Tap here to instantly switch between Gold Mode, Luxury Night Mode (Deep Black), Bright Sky Mode, Calm Emerald Mode, and Royal Burgundy Mode.',
    badgeAr: 'الأوضاع والثيمات',
    badgeEn: 'Themes & Modes',
    iconName: 'moon',
    accentColor: '#d97706',
    gradient: 'from-amber-500 to-amber-600',
    preferredPlacement: 'bottom'
  },
  {
    id: 'smart_home_edit_mode',
    targetSelector: '#app-title',
    titleAr: 'الضغط المطول على اسم التطبيق (السحب والإفلات)',
    titleEn: 'Hold App Title (Drag & Drop Reorder)',
    descAr: 'اضغط مطولاً (~ثانية واحدة) على اسم التطبيق لتفعيل وضع التعديل الذكي؛ حيث يمكنك نقل البطاقات وتغيير أماكنها بسهولة وسلاسة عن طريق السحب والإفلات بلمس إصبعك مباشرة على الشاشة. وعند الانتهاء يظهر زرا (حفظ ✓) و(استعادة ↺) أعلى الشريط للحفظ أو الاستعادة.',
    descEn: 'Long press (~1 second) the app title to activate edit mode. Reorder any card by dragging and dropping it directly with your finger on screen. Use the top (Save ✓) or (Reset ↺) buttons to apply or restore default layout.',
    badgeAr: 'السحب والإفلات',
    badgeEn: 'Drag & Drop',
    iconName: 'slider',
    accentColor: '#d97706',
    gradient: 'from-amber-500 to-amber-600',
    preferredPlacement: 'bottom'
  },
  {
    id: 'smart_home_settings_btn',
    targetSelector: '#home-settings-toggle-btn',
    titleAr: 'زر إعدادات التطبيق وصفحة القرآن',
    titleEn: 'App & Quran Page Settings Button',
    descAr: 'اضغط هنا لفتح شاشة الإعدادات الشاملة: للتحكم بإشعارات التطبيق، إشعارات الهاتف، إعدادات صفحة القرآن (الخطوط، القراء، التفاسير، تصاميم السور)، تحميل المصحف والتفاسير، وإظهار أو إخفاء بطاقات الصفحة الرئيسية.',
    descEn: 'Tap here to open comprehensive settings: manage app & phone notifications, Quran page settings (fonts, reciters, tafseers, surah designs), download audio/tafseers, and toggle home screen cards.',
    badgeAr: 'الإعدادات الشاملة',
    badgeEn: 'Settings',
    iconName: 'gear',
    accentColor: '#d97706',
    gradient: 'from-amber-500 to-amber-600',
    preferredPlacement: 'bottom'
  },
  {
    id: 'smart_home_lang_toggle',
    targetSelector: '#language-btn',
    titleAr: 'تبديل لغة التطبيق (العربية / English)',
    titleEn: 'Switch Language (Arabic / English)',
    descAr: 'اضغط هنا للتبديل السريع بين الواجهتين العربية والإنجليزية لكافة صفحات وأقسام ومحتويات التطبيق.',
    descEn: 'Tap here to quickly switch between Arabic and English across all app pages, tabs, and content.',
    badgeAr: 'لغة التطبيق',
    badgeEn: 'Language',
    iconName: 'lang',
    accentColor: '#d97706',
    gradient: 'from-amber-500 to-amber-600',
    preferredPlacement: 'bottom'
  }
];

export const SMART_HOME_QURAN_STEP: SpotlightStep = {
  id: 'smart_home_quran_card',
  targetSelector: '#modern-card-container-quran',
  titleAr: 'بطاقة القرآن الكريم والوصول السريع',
  titleEn: 'Holy Quran & Quick Reading',
  descAr: 'تعرض آخر موضع توقفت عنده في المصحف (السورة، الآية، الجزء، والصفحة) مع الشريط التفاعلي المتحرك للآية الكريمة، وتوفر أزراراً سريعة لاختيار وضع القراءة المناسب لك بلمسة واحدة.',
  descEn: 'Displays your last read position (Surah, Ayah, Juz, and Page) with the animated verse ticker bar, plus quick buttons to open your preferred reading mode in one tap.',
  badgeAr: 'المصحف الشريف',
  badgeEn: 'Holy Quran',
  iconName: 'quran',
  accentColor: '#d97706',
  gradient: 'from-amber-500 to-amber-600',
  preferredPlacement: 'bottom'
};

export const SMART_HOME_QURAN_STEPS: SpotlightStep[] = [
  SMART_HOME_QURAN_STEP,
  {
    id: 'smart_home_quran_vertical_btn',
    targetSelector: '#home-quran-vertical-btn',
    titleAr: 'زر القراءة الرأسية (رأسي)',
    titleEn: 'Vertical Reading Button',
    descAr: 'اضغط هنا لفتح المصحف في الوضع الرأسي العمودي مع تمرير الصفحات للأعلى والأسفل، واستكمال التلاوة مباشرة من آخر موضع وصلت إليه، مع تحكم كامل في الخطوط والتفاسير والألوان.',
    descEn: 'Tap here to open the Mushaf in portrait vertical reading mode with smooth vertical scrolling, resuming directly from your last read verse with full font and Tafseer controls.',
    badgeAr: 'الوضع الرأسي',
    badgeEn: 'Vertical Mode',
    iconName: 'quran',
    accentColor: '#d97706',
    gradient: 'from-amber-500 to-amber-600',
    preferredPlacement: 'bottom'
  },
  {
    id: 'smart_home_quran_madinah_btn',
    targetSelector: '#home-quran-madinah-btn',
    titleAr: 'زر مصحف المدينة (أفقي)',
    titleEn: 'Madinah Mushaf Button',
    descAr: 'اضغط هنا لفتح مصحف المدينة المنورة ذي الـ 15 سطراً بالرسم العثماني المعتمد، مع تقليب الصفحات أفقياً يميناً ويساراً وإطارات زخرفية مميزة وإعدادات مستقلة.',
    descEn: 'Tap here to open the authentic 15-line Uthmani Madinah Mushaf with horizontal page swiping, ornamental page frames, and independent reading settings.',
    badgeAr: 'مصحف المدينة',
    badgeEn: 'Madinah Mushaf',
    iconName: 'quran',
    accentColor: '#d97706',
    gradient: 'from-amber-500 to-amber-600',
    preferredPlacement: 'bottom'
  },
  {
    id: 'smart_home_quran_landscape_btn',
    targetSelector: '#home-quran-landscape-btn',
    titleAr: 'زر القراءة العرضية (عرضي)',
    titleEn: 'Landscape Reading Button',
    descAr: 'اضغط هنا لفتح المصحف بالوضع العرضي على كامل عرض الشاشة لوضوح أكبر للخط والآيات، واستئناف القراءة من موضع توقفك بمساحة عرض مريحة وهادئة.',
    descEn: 'Tap here to open the Quran in widescreen landscape mode for larger, clearer verse typography and a spacious, comfortable reading view.',
    badgeAr: 'الوضع العرضي',
    badgeEn: 'Landscape Mode',
    iconName: 'quran',
    accentColor: '#d97706',
    gradient: 'from-amber-500 to-amber-600',
    preferredPlacement: 'bottom'
  }
];

export const SMART_HOME_LISTEN_QURAN_STEP: SpotlightStep = {
  id: 'smart_home_listen_quran_card',
  targetSelector: '#modern-card-container-listen-quran',
  titleAr: 'بطاقة الاستماع للقرآن الكريم بأصوات كبار القراء',
  titleEn: 'Audio Quran Recitations Card',
  descAr: 'استمع لتلاوات القرآن الكريم العذبة بأصوات نخبة من مشاهير القراء، مع مشغل صوتي مباشر على الصفحة الرئيسية يتيح تشغيل السور، التحميل للاستماع بدون إنترنت، والتنقل بين التلاوات بسهولة.',
  descEn: 'Listen to beautiful Quranic recitations by renowned reciters with an interactive audio player directly on the home screen, supporting offline downloads and smooth playback controls.',
  badgeAr: 'الاستماع للقرآن',
  badgeEn: 'Listen to Quran',
  iconName: 'volume',
  accentColor: '#d97706',
  gradient: 'from-amber-500 to-amber-600',
  preferredPlacement: 'bottom'
};

export const SMART_HOME_SEASONAL_STEP: SpotlightStep = {
  id: 'smart_home_seasonal_card',
  targetSelector: '#modern-card-container-seasonal',
  titleAr: 'الشريط الموسمي الذكي',
  titleEn: 'Smart Seasonal Strip',
  descAr: 'شريط تفاعلي يتألق بالمناسبات الإسلامية، الأحداث التاريخية العظيمة في مثل هذا اليوم، وإشراقات الإيمان المتجددة.',
  descEn: 'Interactive seasonal banner featuring Islamic occasions, monumental historical events on this day, and daily spiritual inspirations.',
  badgeAr: 'الشريط الموسمي',
  badgeEn: 'Seasonal Strip',
  iconName: 'sparkles',
  accentColor: '#d97706',
  gradient: 'from-amber-500 to-amber-600',
  preferredPlacement: 'bottom'
};

export const SMART_HOME_PRAYER_STEPS: SpotlightStep[] = [
  {
    id: 'smart_home_prayer_location',
    targetSelector: '#home-prayer-location-section',
    titleAr: 'تحديد الموقع واسم المدينة والدولة (GPS)',
    titleEn: 'City, Country & GPS Location',
    descAr: 'انقر على اسم مدينتك أو أيقونة الموقع لتحديث إحداثيات موقعك الجغرافي تلقائياً عبر الأقمار الصناعية (GPS)، وحساب مواقيت الصلاة واتجاه القبلة بدقة متناهية لموقعك الحالي.',
    descEn: 'Tap your city name or the location pin to automatically refresh your GPS coordinates and calculate exact prayer times and Qibla direction for your current position.',
    badgeAr: 'الموقع والمدينة',
    badgeEn: 'GPS Location',
    iconName: 'map',
    accentColor: '#d97706',
    gradient: 'from-amber-500 to-amber-600',
    preferredPlacement: 'bottom'
  },
  {
    id: 'smart_home_prayer_hijri',
    targetSelector: '#home-prayer-hijri-date-btn',
    titleAr: 'التاريخ الهجري والتقويم الإسلامي',
    titleEn: 'Hijri Date & Islamic Calendar',
    descAr: 'اضغط على التاريخ الهجري للانتقال المباشر لصفحة التقويم الهجري الشامل، واستعراض المناسبات الدينية والأحداث التاريخية والتحويل بين التاريخين الهجري والميلادي.',
    descEn: 'Tap the Hijri date to directly open the comprehensive Hijri Calendar, view Islamic events and historical milestones, and convert dates seamlessly.',
    badgeAr: 'التاريخ الهجري',
    badgeEn: 'Hijri Calendar',
    iconName: 'calendar',
    accentColor: '#d97706',
    gradient: 'from-amber-500 to-amber-600',
    preferredPlacement: 'bottom'
  },
  {
    id: 'smart_home_prayer_qibla',
    targetSelector: '#home-prayer-qibla-btn',
    titleAr: 'بوصلة اتجاه القبلة الذكية',
    titleEn: 'Smart Qibla Compass',
    descAr: 'اضغط على أيقونة بوصلة القبلة (🧭) لتحديد الاتجاه الدقيق للكعبة المشرفة والمسجد الحرام بلمسة واحدة وسهولة تامة بالبوصلة الرقمية والدرجات.',
    descEn: 'Tap the Qibla compass icon (🧭) to instantly find the exact direction to the Kaaba and Masjid al-Haram with interactive digital compass degrees.',
    badgeAr: 'اتجاه القبلة',
    badgeEn: 'Qibla Direction',
    iconName: 'compass',
    accentColor: '#d97706',
    gradient: 'from-amber-500 to-amber-600',
    preferredPlacement: 'bottom'
  },
  {
    id: 'smart_home_prayer_countdown',
    targetSelector: '#home-prayer-countdown-section',
    titleAr: 'العد التنازلي الحي ومواقيت الصلاة',
    titleEn: 'Live Countdown & Prayer Times',
    descAr: 'يستعرض العد التنازلي اللحظي المتبقي لأذان الصلاة القادمة بالثواني، وموعد الأذان، مع شريط التقدم اليومي بين الصلوات. اضغط في أي مكان هنا لفتح جدول مواقيت الصلاة الكامل.',
    descEn: 'Displays live real-time countdown to the upcoming prayer adhan, exact prayer time, and the daily progress bar. Tap anywhere here to open the full prayer timetable.',
    badgeAr: 'مواقيت الصلاة',
    badgeEn: 'Prayer Times',
    iconName: 'clock',
    accentColor: '#d97706',
    gradient: 'from-amber-500 to-amber-600',
    preferredPlacement: 'bottom'
  }
];

export const SMART_HOME_SEARCH_STEP: SpotlightStep = {
  id: 'smart_home_search_card',
  targetSelector: '#modern-card-container-search',
  titleAr: 'بطاقة البحث الشامل والذكي',
  titleEn: 'Comprehensive Smart Search Bar',
  descAr: 'مُحرّك بحث ذكي وفوري يُمكّنك من البحث بكلمة واحدة فقط في السور والآيات القرآنية الشريفة، والأحاديث النبوية، والأذكار، وكافة أقسام وخدمات التطبيق بدون عناء؛ مع ترتيب تلقائي لأيقونات الأقسام الأكثر استخداماً وزيارة حسب نمط استخدامك اليومي.',
  descEn: 'Instant smart search engine allowing you to search across Quran surahs & ayahs, Hadith, Adhkar, and all app services in one place, with dynamic reordering of your most visited apps based on daily usage.',
  badgeAr: 'البحث الذكي',
  badgeEn: 'Smart Search',
  iconName: 'search',
  accentColor: '#d97706',
  gradient: 'from-amber-500 to-amber-600',
  preferredPlacement: 'bottom'
};

export const SMART_HOME_APPS_STEP: SpotlightStep = {
  id: 'smart_home_daily_apps_card',
  targetSelector: '#modern-card-container-apps',
  titleAr: 'بطاقة التطبيقات الإسلامية والتطبيقات اليومية (بتبويباتها)',
  titleEn: 'Islamic Apps Drawer & Daily Apps (With Tabs)',
  descAr: 'درج ذكي وتفاعلي يضم كافة التطبيقات والخدمات الإسلامية مقسمة بتبويباتها الشاملة (المكتبة، العبادات، الأدوات).',
  descEn: 'Interactive smart drawer featuring all Islamic apps categorized into comprehensive tabs (Library, Worship, Tools).',
  badgeAr: 'التطبيقات الإسلامية',
  badgeEn: 'Islamic Apps',
  iconName: 'widgets',
  accentColor: '#d97706',
  gradient: 'from-amber-500 to-amber-600',
  preferredPlacement: 'bottom'
};

export const SMART_HOME_ADHKAR_STEP: SpotlightStep = {
  id: 'smart_home_adhkar_card',
  targetSelector: '#modern-card-container-adhkar',
  titleAr: 'بطاقة أذكار الصباح والمساء (التبديل التلقائي)',
  titleEn: 'Morning & Evening Adhkar (Auto-Switching)',
  descAr: 'تتغير البطاقة تلقائياً بحسب الوقت الحالي من اليوم: تتألق بأذكار الصباح خلال فترة النهار، وتتحول تلقائياً لأذكار المساء بعد صلاة العصر وحتى الليل، لضمان وصولك السريع لأذكارك اليومية في وقتها المناسب.',
  descEn: 'Automatically changes depending on the time of day: displays Morning Adhkar during daytime and switches to Evening Adhkar after Asr until night for instant access to your daily adhkar.',
  badgeAr: 'أذكار الصباح والمساء',
  badgeEn: 'Daily Adhkar',
  iconName: 'clock',
  accentColor: '#d97706',
  gradient: 'from-amber-500 to-amber-600',
  preferredPlacement: 'bottom'
};

export const SMART_HOME_TRACKER_STEP: SpotlightStep = {
  id: 'smart_home_tracker_card',
  targetSelector: '#modern-card-container-tracker',
  titleAr: 'بطاقة مربي الصلوات الخمس والصدقات والورد',
  titleEn: 'Prayers, Charity & Wird Tracker Card',
  descAr: 'تتبع أداء الصلوات الخمس المفروضة، السنن، الصدقات، والورد القرآني اليومي مع نسبة إنجاز مئوية تفاعلية لتعزيز الالتزام والمداومة على الطاعات.',
  descEn: 'Track obligatory prayers, sunnahs, charity, and daily Quran recitation with interactive progress percentages to boost spiritual consistency.',
  badgeAr: 'مربي الصلوات والصدقات',
  badgeEn: 'Worship Tracker',
  iconName: 'action',
  accentColor: '#d97706',
  gradient: 'from-amber-500 to-amber-600',
  preferredPlacement: 'bottom'
};

export const SMART_HOME_QUICK_TASBEEH_STEP: SpotlightStep = {
  id: 'smart_home_quick_tasbeeh_card',
  targetSelector: '#modern-card-container-quick-tasbeeh',
  titleAr: 'بطاقة التسبيح السريع والذِّكر اللحظي',
  titleEn: 'Quick Tasbeeh & Instant Dhikr Card',
  descAr: 'مسبحة إلكترونية تفاعلية مباشرة على الشاشة الرئيسية تتيح لك اختيار صيغة الذكر وتحديد الهدف العددي، مع عداد ذكي بنقرة واحدة وإحصاء إجمالي تسبيحات اليوم والتنبيه عند إتمام الورد.',
  descEn: 'Interactive digital tasbeeh directly on the home screen allowing you to pick your dhikr phrase, set your count target, track daily totals, and receive completion alerts.',
  badgeAr: 'التسبيح السريع',
  badgeEn: 'Quick Tasbeeh',
  iconName: 'sparkles',
  accentColor: '#d97706',
  gradient: 'from-amber-500 to-amber-600',
  preferredPlacement: 'bottom'
};

export const SMART_HOME_TAWAF_STEP: SpotlightStep = {
  id: 'smart_home_tawaf_card',
  targetSelector: '#modern-card-container-tawaf, #modern-tawaf-counter-card',
  titleAr: 'بطاقة عداد الطواف والسعي التفاعلي',
  titleEn: 'Interactive Tawaf & Sa\'i Counter Card',
  descAr: 'عداد رقمي ذكي لمتابعة وإحصاء أشواط الطواف حول الكعبة المشرفة وأشواط السعي بين الصفا والمروة خطوة بخطوة، مع أدعية كل شوط والتنبيه بالاهتزاز عند اكتمال الأشواط السبعة.',
  descEn: 'Smart digital counter to track circuits of Tawaf around the Kaaba and Sa\'i between Safa and Marwah step by step, with supplications for each lap and vibration alerts.',
  badgeAr: 'عداد الأشواط',
  badgeEn: 'Tawaf Counter',
  iconName: 'compass',
  accentColor: '#d97706',
  gradient: 'from-amber-500 to-amber-600',
  preferredPlacement: 'bottom'
};

export const SMART_HOME_REFLECTIONS_STEP: SpotlightStep = {
  id: 'smart_home_reflections_card',
  targetSelector: '#modern-card-container-reflections',
  titleAr: 'بطاقة إشراقات وذاكرة اليوم والحكمة اليومية',
  titleEn: 'Reflections, Daily Memory & Wisdom Card',
  descAr: 'تستعرض الحكم الإسلامية الخالدة، أحداث ذاكرة التاريخ الإسلامي، وأبرز المحطات اليومية مع إمكانية التكبير والتصفح والمشاركة كبطاقات مصممة.',
  descEn: 'Browse timeless Islamic wisdoms, key Islamic history milestones, and daily reflections with zoom, browsing, and card sharing.',
  badgeAr: 'إشراقات وذاكرة اليوم',
  badgeEn: 'Reflections & Memory',
  iconName: 'sparkles',
  accentColor: '#d97706',
  gradient: 'from-amber-500 to-amber-600',
  preferredPlacement: 'bottom'
};

export const SMART_HOME_SHARE_STEP: SpotlightStep = {
  id: 'smart_home_share_card',
  targetSelector: '#modern-card-container-share',
  titleAr: 'بطاقة شارك التطبيق والكيوار والدعم الفني',
  titleEn: 'Share App, QR Code & Tech Support Card',
  descAr: 'تمكنك من مشاركة التطبيق مع عائلتك وأصدقائك، عرض رمز الاستجابة السريعة (QR Code)، والتواصل المباشر مع الدعم الفني عبر الواتساب.',
  descEn: 'Share the app with family and friends, generate QR codes, and contact technical support directly via WhatsApp.',
  badgeAr: 'شارك التطبيق والدعم',
  badgeEn: 'Share & Support',
  iconName: 'share',
  accentColor: '#d97706',
  gradient: 'from-amber-500 to-amber-600',
  preferredPlacement: 'top'
};

export const MODERN_CARD_STEPS_MAP: Record<string, SpotlightStep[]> = {
  'quran': SMART_HOME_QURAN_STEPS,
  'listen-quran': [SMART_HOME_LISTEN_QURAN_STEP],
  'seasonal': [SMART_HOME_SEASONAL_STEP],
  'prayer': SMART_HOME_PRAYER_STEPS,
  'search': [SMART_HOME_SEARCH_STEP],
  'apps': [SMART_HOME_APPS_STEP],
  'adhkar': [SMART_HOME_ADHKAR_STEP],
  'tracker': [SMART_HOME_TRACKER_STEP],
  'quick-tasbeeh': [SMART_HOME_QUICK_TASBEEH_STEP],
  'tawaf': [SMART_HOME_TAWAF_STEP],
  'reflections': [SMART_HOME_REFLECTIONS_STEP],
  'share': [SMART_HOME_SHARE_STEP]
};

/**
 * دالة ذكية لتوليد خطوات إرشادات الصفحة الرئيسية ديناميكياً:
 * 1. تبدأ بأزرار وعناصر الشريط العلوي.
 * 2. تفحص الترتيب الفعلي للبطاقات المعروضة حالياً على الشاشة من شجرة الـ DOM.
 * 3. تضمن إدراج بطاقات الاستماع للقرآن، عداد الأشواط، والتسبيح السريع بموضعها الدقيق عند تفعيلها فقط واستبعادها عند تعطيلها.
 */
export const getDynamicSmartHomeSteps = (): SpotlightStep[] => {
  const steps: SpotlightStep[] = [...SMART_HOME_HEADER_STEPS];

  let orderedCardIds: string[] = [];

  // 1. الفحص الفعلي المباشر لترتيب عناصر الـ DOM المعروضة على الشاشة (يعكس السحب والإفلات والترتيب الحالي بنسبة 100%)
  if (typeof document !== 'undefined') {
    const cardNodes = document.querySelectorAll('[id^="modern-card-container-"]');
    cardNodes.forEach(node => {
      const cardId = node.id.replace('modern-card-container-', '');
      if (cardId && !orderedCardIds.includes(cardId)) {
        orderedCardIds.push(cardId);
      }
    });
  }

  // 2. احتياط عند عدم توفر الـ DOM (مثلاً قبل الإظهار الأولي): الاعتماد على الترتيب المحفوظ وحالة التفعيل
  if (orderedCardIds.length === 0) {
    try {
      const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('modern_home_cards_order_v1') : null;
      const defaultOrder = [
        'quran',
        'listen-quran',
        'seasonal',
        'prayer',
        'search',
        'apps',
        'adhkar',
        'tracker',
        'quick-tasbeeh',
        'tawaf',
        'reflections',
        'share'
      ];
      const order: string[] = saved ? JSON.parse(saved) : defaultOrder;
      const showListen = typeof localStorage !== 'undefined' ? localStorage.getItem('show_listen_quran_home') === 'true' : false;
      const showTasbeeh = typeof localStorage !== 'undefined' ? localStorage.getItem('show_quick_tasbeeh_home') === 'true' : false;
      let isTawafActive = false;
      try {
        const savedTawaf = typeof localStorage !== 'undefined' ? localStorage.getItem('mushaf_tawaf_counter_state') : null;
        if (savedTawaf) {
          const parsed = JSON.parse(savedTawaf);
          isTawafActive = Boolean(parsed?.showOnHome);
        }
      } catch {}

      orderedCardIds = order.filter(id => {
        if (id === 'listen-quran' && !showListen) return false;
        if (id === 'quick-tasbeeh' && !showTasbeeh) return false;
        if (id === 'tawaf' && !isTawafActive) return false;
        return true;
      });
    } catch {
      orderedCardIds = [
        'quran',
        'listen-quran',
        'seasonal',
        'prayer',
        'search',
        'apps',
        'adhkar',
        'tracker',
        'quick-tasbeeh',
        'tawaf',
        'reflections',
        'share'
      ];
    }
  }

  // 3. إضافة خطوات البطاقات النشطة طبقاً لترتيبها الفعلي الحالي
  for (const cardId of orderedCardIds) {
    const cardSteps = MODERN_CARD_STEPS_MAP[cardId];
    if (cardSteps && cardSteps.length > 0) {
      if (cardId === 'quran' && typeof document !== 'undefined' && !document.getElementById('home-quran-landscape-btn')) {
        steps.push(...cardSteps.filter(step => step.id !== 'smart_home_quran_landscape_btn'));
      } else {
        steps.push(...cardSteps);
      }
    }
  }

  return steps;
};

export const SMART_HOME_PAGE_STEPS: SpotlightStep[] = [
  ...SMART_HOME_HEADER_STEPS,
  ...SMART_HOME_QURAN_STEPS,
  SMART_HOME_LISTEN_QURAN_STEP,
  SMART_HOME_SEASONAL_STEP,
  ...SMART_HOME_PRAYER_STEPS,
  SMART_HOME_SEARCH_STEP,
  SMART_HOME_APPS_STEP,
  SMART_HOME_ADHKAR_STEP,
  SMART_HOME_TRACKER_STEP,
  SMART_HOME_QUICK_TASBEEH_STEP,
  SMART_HOME_TAWAF_STEP,
  SMART_HOME_REFLECTIONS_STEP,
  SMART_HOME_SHARE_STEP
];
