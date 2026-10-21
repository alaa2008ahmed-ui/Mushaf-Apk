import { SpotlightStep } from '../Community/CommunitySpotlightGuide';

// 1. خطوات إرشاد الصفحة الرئيسية للورد اليومي (متابعة الإنجاز)
export const DAILY_WIRD_MAIN_STEPS: SpotlightStep[] = [
  {
    id: 'wird_header_nav',
    targetSelector: '#wird-top-bar',
    titleAr: 'الشريط العلوي لصفحة الورد',
    titleEn: 'Daily Wird Top Bar',
    descAr: 'يتيح لك الرجوع للخلف، تثبيت مظهر ولون الصفحة (قفل الثيم)، أو الانتقال للشاشة الرئيسية، مع إمكانية إعادة تشغيل هذا الدليل التوضيحي بالضغط على زر (?) في أي وقت.',
    descEn: 'Navigate back, lock page theme, jump to home, or reopen this interactive guide anytime by tapping the (?) help icon.',
    badgeAr: 'الشريط العلوي',
    badgeEn: 'Top Bar',
    iconName: 'nav',
    accentColor: '#0284c7',
    gradient: 'from-sky-500 to-blue-600'
  },
  {
    id: 'wird_profile_selector',
    targetSelector: '#wird-profile-selector',
    titleAr: 'إدارة المستخدمين والختمات',
    titleEn: 'Multiple Users & Khatmas',
    descAr: 'يمكنك إضافة أكثر من مستخدم أو ختمة (مثل ختمة شخصية، ختمة لأحد أفراد العائلة، أو ختمة رمضان)، والتبديل بينهم وحفظ ومتابعة تقدم كل ختمة بشكل منفصل.',
    descEn: 'Create and switch between multiple users or khatmas (personal, family, or Ramadan), tracking each reading progress independently.',
    badgeAr: 'المستخدمون',
    badgeEn: 'Profiles',
    iconName: 'user',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'wird_progress_card',
    targetSelector: '#wird-progress-container',
    titleAr: 'مؤشر إنجاز الختمة',
    titleEn: 'Khatma Completion Rate',
    descAr: 'يعرض لك نسبة الإنجاز المئوية للختمة، ورقم اليوم الحالي من إجمالي أيام الخطة، وعدد الأيام المكتملة حتى الآن بدقة.',
    descEn: 'Displays your overall Quran completion percentage, current day number out of total planned days, and completed days count.',
    badgeAr: 'نسبة الإنجاز',
    badgeEn: 'Progress',
    iconName: 'action',
    accentColor: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'wird_today_card',
    targetSelector: '#wird-today-container',
    titleAr: 'ورد اليوم والصفحات المحددة',
    titleEn: "Today's Assigned Portion",
    descAr: 'يوضح لك بالضبط الصفحات المحددة لورد اليوم (من صفحة كذا إلى صفحة كذا) وفق خطتك المعتمدة للختم.',
    descEn: 'Clearly indicates the exact starting and ending pages assigned for today according to your reading plan.',
    badgeAr: 'ورد اليوم',
    badgeEn: "Today's Wird",
    iconName: 'verse',
    accentColor: '#8b5cf6',
    gradient: 'from-purple-500 to-indigo-600'
  },
  {
    id: 'wird_actions_card',
    targetSelector: '#wird-actions-container',
    titleAr: 'فتح المصحف وتأكيد القراءة',
    titleEn: "Open Qur'an & Mark Completed",
    descAr: 'اضغط على «افتح المصحف للقراءة» (أو متابعة الورد) للانتقال مباشرة لصفحتك في المصحف، وبعد الانتهاء اضغط «تمت القراءة» لترحيل الورد والانتقال لليوم التالي.',
    descEn: 'Tap "Open Qur\'an to Read" (or Continue Wird) to jump directly to your assigned page, and click "Read Completed" when finished to advance to the next day.',
    badgeAr: 'القراءة والمتابعة',
    badgeEn: 'Reading',
    iconName: 'quran',
    accentColor: '#059669',
    gradient: 'from-emerald-600 to-teal-700'
  },
  {
    id: 'wird_controls_card',
    targetSelector: '#wird-control-buttons',
    titleAr: 'تعديل الخطة وإعادة التعيين',
    titleEn: 'Edit & Reset Options',
    descAr: 'زر «تعديل الختمة» لتغيير عدد الأيام أو الصفحات في أي وقت، وزر «إعادة تعيين» لإعادة تصفير الورد وبدء ختمة جديدة من البداية مع طلب التأكيد.',
    descEn: 'Use "Edit Khatma" to modify your duration or pages per day, and "Reset" to clear progress and restart from the beginning with confirmation.',
    badgeAr: 'خيارات التحكم',
    badgeEn: 'Settings',
    iconName: 'lock',
    accentColor: '#ec4899',
    gradient: 'from-pink-500 to-rose-600'
  }
];

// 2. خطوات إرشاد إعداد الختمة الجديدة أو تعديلها
export const DAILY_WIRD_SETTINGS_STEPS: SpotlightStep[] = [
  {
    id: 'wird_name_step',
    targetSelector: '#wird-name-container',
    titleAr: 'اسم المستخدم أو الختمة',
    titleEn: 'User or Khatma Name',
    descAr: 'اكتب اسماً مميزاً للختمة أو للشخص صاحب الختمة (مثل: ختمة الفجر، ختمة رمضان، أحمد).',
    descEn: 'Enter a distinctive name for the khatma or the reader (e.g., Dawn Khatma, Ramadan, Ahmed).',
    badgeAr: 'الاسم',
    badgeEn: 'Name',
    iconName: 'user',
    accentColor: '#0284c7',
    gradient: 'from-sky-500 to-blue-600'
  },
  {
    id: 'wird_mode_step',
    targetSelector: '#wird-mode-container',
    titleAr: 'طريقة احتساب الختمة',
    titleEn: 'Khatma Calculation Method',
    descAr: 'اختر إما «حسب الأيام» لتحديد مدة الختمة بالأيام (مثلاً ختمة في 30 يوماً)، أو «حسب الصفحات» لتحديد عدد الصفحات التي ترغب بقراءتها يومياً (مثلاً 20 صفحة يومياً).',
    descEn: 'Choose "By Days" to set total khatma duration in days (e.g. 30 days), or "By Pages" to specify daily read pages (e.g. 20 pages/day).',
    badgeAr: 'طريقة الختمة',
    badgeEn: 'Method',
    iconName: 'action',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'wird_value_step',
    targetSelector: '#wird-value-container',
    titleAr: 'تحديد المدة أو عدد الصفحات',
    titleEn: 'Set Duration or Page Count',
    descAr: 'أدخل العدد المطلوب بالأرقام؛ وسيقوم النظام تلقائياً بتوزيع صفحات المصحف الشريف الـ 604 بالتساوي على وردك اليومي.',
    descEn: 'Enter the desired number; the system will automatically distribute the 604 pages of the Holy Quran evenly across your daily portions.',
    badgeAr: 'المقدار والمدة',
    badgeEn: 'Value & Duration',
    iconName: 'verse',
    accentColor: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'wird_start_step',
    targetSelector: '#wird-start-container',
    titleAr: 'بدء الختمة وتأكيد الحفظ',
    titleEn: 'Start Khatma & Save',
    descAr: 'اضغط على «ابدأ الختمة» (أو حفظ) لتثبيت خطتك والانتقال فوراً لصفحة المتابعة اليومية وبدء قراءة وردك المبارك.',
    descEn: 'Click "Start Khatma" (or Save) to lock in your plan and immediately proceed to daily tracking and reading.',
    badgeAr: 'البدء والحفظ',
    badgeEn: 'Start & Save',
    iconName: 'quran',
    accentColor: '#059669',
    gradient: 'from-emerald-600 to-green-700'
  }
];
