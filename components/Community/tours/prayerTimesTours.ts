import { SpotlightStep } from '../CommunitySpotlightGuide';

// 13. خطوات إرشاد صفحة مواقيت الصلاة
export const PRAYER_TIMES_PAGE_STEPS: SpotlightStep[] = [
  {
    id: 'prayer_gps_refresh',
    targetSelector: '#location-refresh-btn',
    titleAr: 'تحديث الموقع الجغرافي (GPS)',
    titleEn: 'Refresh GPS Location',
    descAr: 'اضغط هنا لتحديث إحداثيات موقعك الحالي بدقة عبر نظام الـ GPS لإعادة حساب مواقيت الأذان والصلوات بدقة تامة لمدينتك.',
    descEn: 'Tap here to update your current GPS coordinates and recalculate precise prayer times and Qibla direction for your city.',
    badgeAr: 'الموقع الجغرافي',
    badgeEn: 'GPS Location',
    iconName: 'map',
    accentColor: '#0ea5e9',
    gradient: 'from-sky-500 to-blue-600'
  },
  {
    id: 'prayer_top_settings_btn',
    targetSelector: '#prayer-top-bar-settings-btn',
    titleAr: 'إعدادات الصلاة',
    titleEn: 'Prayer Settings',
    descAr: 'اضغط هنا لفتح قائمة إعدادات الصلاة: اختيار وتغيير نغمة الإشعارات للأذكار والتنبيهات، تفعيل الإشعار المستمر لمواقيت الصلاة، تخصيص التطبيقات المصغرة (الودجت)، كتم التنبيهات الصوتية مؤقتاً، وتنبيهات أذكار قيام الليل واليوم.',
    descEn: 'Tap here to open prayer settings: choose and change notification tones for adhkar and reminders, manage persistent prayer notification, customize home screen widgets, temporarily mute audio alerts, and configure night and daily athkar reminders.',
    badgeAr: 'إعدادات الصلاة',
    badgeEn: 'Prayer Settings',
    iconName: 'gear',
    accentColor: '#8b5cf6',
    gradient: 'from-violet-500 to-purple-600'
  },
  {
    id: 'prayer_home_widgets_guide',
    preferredPlacement: 'center',
    titleAr: 'التطبيقات المصغرة (٣ تطبيقات للشاشة)',
    titleEn: '3 Home Screen Widgets & Settings',
    descAr: `يوفر التطبيق ٣ تطبيقات مصغرة (ودجت) يمكنك إضافتها لشاشة هاتفك لمتابعة مواقيت الصلاة:
١. كلاسيكي شامل (٤×١): جدول الصلوات الست والتاريخ وقيام الليل.
٢. مصغر السابقة والقادمة (٤×١): بطاقتان مجسمتان لصلاتك السابقة والقادمة.
٣. الصلاة القادمة فقط (٢×١): حجم مصغر وأنيق يعرض اسم الصلاة القادمة والوقت المتبقي فقط مع إمكانية تكبيره بحرية.

⚙️ ضبط الشفافية وثيم الألوان:
اضغط مطولاً على أي تطبيق مصغر بشاشة هاتفك ثم اختر (الضبط) للتحكم في نسبة الشفافية (من 0% إلى 100%) وتغيير ثيم الألوان بالكامل بنقرة واحدة.`,
    descEn: `The app provides 3 home screen widgets to track prayer times live:
1. Classic Comprehensive (4x1): Full 6-prayer matrix, date, and night milestones.
2. Compact Prev & Next (4x1): Dual 3D tactile cards for previous and upcoming prayers.
3. Next Prayer Only (2x1): Ultra-minimal icon-sized card showing only the next prayer and remaining time with free resize capability.

⚙️ Transparency & Colors:
Long-press any widget on your phone screen and tap Settings to adjust transparency (0% to 100%) and choose your favorite color theme.`,
    badgeAr: '٣ تطبيقات مصغرة • تخصيص كامل',
    badgeEn: '3 Widgets • Customization',
    iconName: 'widgets',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'prayer_search_box',
    targetSelector: '#prayer-date-search-container',
    titleAr: 'البحث عن أي مدينة أو تاريخ',
    titleEn: 'City & Date Search',
    descAr: 'يمكنك كتابة اسم أي مدينة أو عاصمة في العالم أو اختيار يوم محدد لمعرفة مواقيت الصلاة الفلكية بدقة متناهية دون الحاجة لتواجدك هناك.',
    descEn: 'Type any city or country worldwide, or pick a specific date to view its exact astronomical prayer times instantly.',
    badgeAr: 'البحث الذكي',
    badgeEn: 'Search',
    iconName: 'search',
    accentColor: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'prayer_nearby_mosques',
    targetSelector: '#nearby-mosques-btn',
    titleAr: 'المساجد القريبة من موقعك',
    titleEn: 'Nearby Mosques',
    descAr: 'يفتح لك خرائط جوجل للبحث عن جميع المساجد المحيطة بك وعرض المسافة ومسارات المشي والقيادة للوصول إلى صلاة الجماعة.',
    descEn: 'Opens Google Maps to locate all mosques surrounding your current position with walking and driving directions.',
    badgeAr: 'المساجد • Maps',
    badgeEn: 'Nearby Mosques',
    iconName: 'map',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'prayer_monthly_times',
    targetSelector: '#monthly-times-btn',
    titleAr: 'جدول مواقيت الشهر بالكامل',
    titleEn: 'Monthly Timetable',
    descAr: 'عرض جدول إمساكية ومواقيت الصلاة لكامل الشهر الهجري أو الميلادي مع إمكانية تصديرها كملف PDF أنيق أو مشاركتها كصورة.',
    descEn: 'View the full monthly prayer timetable for Hijri or Gregorian months with options to export as a formatted PDF or share as an image.',
    badgeAr: 'إمساكية الشهر',
    badgeEn: 'Monthly Timetable',
    iconName: 'calendar',
    accentColor: '#8b5cf6',
    gradient: 'from-violet-500 to-purple-600'
  },
  {
    id: 'prayer_calculation_method',
    targetSelector: '#calculation-method-btn',
    titleAr: 'طرق الحساب والمذاهب الفقهية',
    titleEn: 'Calculation Methods & Fiqh',
    descAr: 'تفتح لك صفحة مستقلة لتحديد الهيئة الفلكية لحساب زاويتي الفجر والعشاء (مثل أم القرى ورابطة العالم الإسلامي)، ومذهب العصر (الجمهور أو الحنفية)، وقواعد خطوط العرض العليا.',
    descEn: 'Opens a full page to configure the astronomical calculation method for Fajr and Isha, Asr juristic school (Majority or Hanafi), and high-latitude rules.',
    badgeAr: 'طريقة الحساب',
    badgeEn: 'Calculation Method',
    iconName: 'gear',
    accentColor: '#d97706',
    gradient: 'from-amber-500 to-yellow-600'
  },
  {
    id: 'prayer_visual_sun_path',
    targetSelector: '#visual-sun-path-card',
    titleAr: 'بطاقة مسار الشمس المرئي ومحاكاة اليوم',
    titleEn: 'Visual Sun Path & Day Simulation',
    descAr: 'بطاقة تفاعلية مجسمة ثلاثية الأبعاد تعرض المسار الفلكي الحقيقي للشمس من الشروق حتى الغروب، مع إمكانية تشغيل محاكاة حركة الشمس ومعرفة زاوية الارتفاع وساعات النهار.',
    descEn: 'Interactive 3D celestial card showing real-time sun trajectory from sunrise to sunset, with daylight duration, elevation angle, and interactive 24-hour sun movement simulation.',
    badgeAr: 'مسار الشمس 3D',
    badgeEn: 'Sun Path 3D',
    iconName: 'sparkles',
    accentColor: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'prayer_next_card',
    targetSelector: '#next-prayer-countdown-container',
    titleAr: 'الصلاة القادمة والعد التنازلي الحي',
    titleEn: 'Next Prayer & Live Countdown',
    descAr: 'يعرض اسم الصلاة القادمة مع عداد تنازلي دقيق بالثواني والدقائق لموعد رفع الأذان، مع تلوين مميز للبطاقة لتنبيهك بوقت الصلاة.',
    descEn: 'Displays the next upcoming prayer with an active countdown timer down to the second until the call to prayer.',
    badgeAr: 'الصلاة القادمة',
    badgeEn: 'Next Prayer',
    iconName: 'clock',
    accentColor: '#059669',
    gradient: 'from-emerald-600 to-teal-700'
  },
  {
    id: 'prayer_night_times',
    targetSelector: '#night-times-container',
    titleAr: 'مواقيت قيام الليل وتنبيهات الأسحار',
    titleEn: 'Night Times & Tahajjud Reminders',
    descAr: 'حساب شرعي دقيق للثلث الأول ومنتصف الليل والثلث الأخير المستحب فيه قيام الليل والاستغفار، مع إمكانية تفعيل جرس التنبيه لكل وقت.',
    descEn: 'Accurate calculations for the first third, midnight, and the blessed last third of the night, with toggleable reminder bells.',
    badgeAr: 'قيام الليل',
    badgeEn: 'Night Times',
    iconName: 'moon',
    accentColor: '#6366f1',
    gradient: 'from-indigo-500 to-blue-600'
  },
  {
    id: 'prayer_cards_grid',
    targetSelector: '#prayer-list',
    titleAr: 'بطاقات مواقيت الصلوات اليومية',
    titleEn: 'Daily Prayer Cards Grid',
    descAr: 'شبكة مواقيت الصلوات الست (الفجر، الشروق، الظهر، العصر، المغرب، العشاء). توضح وقت دخول الصلاة ووقت الإقامة المحدد لكل فرض.',
    descEn: 'Grid of the six daily prayer cards showing exact adhan times, iqama intervals, and active highlights.',
    badgeAr: 'أوقات الصلوات',
    badgeEn: 'Prayer Timings',
    iconName: 'clock',
    accentColor: '#3b82f6',
    gradient: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'prayer_card_weather',
    targetSelector: '#prayer-card-weather-btn',
    titleAr: 'طقس ودرجة حرارة وقت الصلاة',
    titleEn: 'Prayer Time Weather & Temperature',
    descAr: 'يعرض حالة الطقس ودرجة الحرارة المتوقعة تحديداً بوقت هذه الصلاة. اضغط على الأيقونة لفتح بطاقة إرشادية وتفصيلية لحالة الجو، سرعة الرياح، ونسبة الرطوبة، مع توجيهات للخروج إلى المسجد واختيار الملابس المناسبة.',
    descEn: 'Displays live weather condition and expected temperature specifically for this prayer time. Tap the icon to view detailed atmospheric data: wind speed, humidity, and walking guidance to the mosque.',
    badgeAr: 'طقس الصلاة',
    badgeEn: 'Prayer Weather',
    iconName: 'cloud',
    accentColor: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'prayer_sound_toggle',
    targetSelector: '#prayer-sound-toggle-btn',
    titleAr: 'كتم أو تشغيل صوت الأذان للصلاة',
    titleEn: 'Mute / Unmute Adhan Sound',
    descAr: 'اضغط على النقطة (خضراء=مفعل / حمراء=مكتوم) لتفعيل أو إيقاف صوت الأذان والتنبيه لكل صلاة على حدة حسب رغبتك.',
    descEn: 'Tap the status indicator (green=active / red=muted) to toggle adhan sound and notifications independently for each prayer.',
    badgeAr: 'صوت الأذان',
    badgeEn: 'Sound Alert',
    iconName: 'volume',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'prayer_card_settings_btn',
    targetSelector: '#prayer-settings-btn',
    titleAr: 'زر تخصيص وإعدادات الصلاة',
    titleEn: 'Prayer Customization & Settings',
    descAr: 'اضغط على هذا الزر لفتح قائمة إعدادات الصلاة: ضبط دقائق الأذان، تنبيه الاستعداد، وقت الإقامة، الوضع الصامت التلقائي واختيار نغمة المؤذن.',
    descEn: 'Tap this button to open the prayer settings menu: calibrate adhan minutes, readiness alert, iqama time, auto-silent mode, and reciter tone.',
    badgeAr: 'إعدادات الصلاة',
    badgeEn: 'Settings',
    iconName: 'gear',
    accentColor: '#8b5cf6',
    gradient: 'from-purple-500 to-violet-600'
  }
];

// 14. خطوات إرشاد صفحة مواقيت الشهر
export const MONTHLY_PRAYER_TIMES_STEPS: SpotlightStep[] = [
  {
    id: 'monthly_export_pdf',
    targetSelector: '#btn-monthly-pdf',
    titleAr: 'تصدير إمساكية الشهر كـ PDF',
    titleEn: 'Export Timetable as PDF',
    descAr: 'تصدير جدول مواقيت الصلاة للشهر كاملاً في ملف PDF عالي الجودة ومنسق بعناية للطباعة الورقية أو الحفظ على الهاتف.',
    descEn: 'Export the complete monthly prayer schedule as a high quality PDF document ready for printing or offline keeping.',
    badgeAr: 'تصدير PDF',
    badgeEn: 'Export PDF',
    iconName: 'file',
    accentColor: '#ef4444',
    gradient: 'from-red-500 to-rose-600'
  },
  {
    id: 'monthly_share_image',
    targetSelector: '#btn-monthly-share',
    titleAr: 'مشاركة جدول الشهر كصورة',
    titleEn: 'Share Timetable as Image',
    descAr: 'إنشاء صورة بتصميم إسلامي أنيق لجدول مواقيت الصلاة ومشاركتها مع العائلة والأصدقاء ومجموعات الواتساب ومواقع التواصل.',
    descEn: 'Generate an elegant image of the monthly prayer timetable and share it with family and WhatsApp groups.',
    badgeAr: 'مشاركة كصورة',
    badgeEn: 'Share Image',
    iconName: 'share',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'monthly_date_picker',
    targetSelector: '#btn-monthly-picker',
    titleAr: 'اختيار الشهر والسنة',
    titleEn: 'Month & Year Picker',
    descAr: 'اضغط على اسم الشهر لفتح نافذة اختيار أي شهر وسنة هجرية أو ميلادية والتنقل المباشر لمواقيتها بكل سهولة.',
    descEn: 'Tap the month name to open a quick selector modal and switch directly to any Hijri or Gregorian month and year.',
    badgeAr: 'اختيار الشهر',
    badgeEn: 'Date Picker',
    iconName: 'calendar',
    accentColor: '#0ea5e9',
    gradient: 'from-sky-500 to-blue-600'
  },
  {
    id: 'monthly_calendar_toggle',
    targetSelector: '#btn-monthly-calendar-toggle',
    titleAr: 'التبديل بين الهجري والميلادي',
    titleEn: 'Hijri & Gregorian Toggle',
    descAr: 'زر التبديل السريع لعرض مواقيت الشهر حسب الأشهر الهجرية الإسلامية (رمضان، شوال..) أو الأشهر الميلادية.',
    descEn: 'Quick toggle to view the monthly schedule based on Islamic Hijri months or Gregorian calendar months.',
    badgeAr: 'التقويم',
    badgeEn: 'Calendar Toggle',
    iconName: 'tab',
    accentColor: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'monthly_nav_arrows',
    targetSelector: '#btn-monthly-prev, #btn-monthly-next',
    titleAr: 'التنقل بين الشهور السابقة والقادمة',
    titleEn: 'Month Navigation Arrows',
    descAr: 'استخدم أسهم التنقل للانتقال السريع للشهر التالي أو العودة للشهر السابق بلمسة واحدة.',
    descEn: 'Use the navigation arrows to advance to the next month or go back to previous months with one tap.',
    badgeAr: 'تنقل الشهور',
    badgeEn: 'Navigation',
    iconName: 'nav',
    accentColor: '#8b5cf6',
    gradient: 'from-violet-500 to-purple-600'
  },
  {
    id: 'monthly_table_grid',
    targetSelector: '#monthly-table-container',
    preferredPlacement: 'center',
    titleAr: 'جدول المواقيت وتظليل اليوم الحالي',
    titleEn: 'Timetable & Today Highlighting',
    descAr: 'جدول كامل لجميع أيام الشهر مع مواقيت الصلوات الخمس والشروق، ويتم تمييز وتظليل يومك الحالي بلون بارز تلقائياً لسهولة المتابعة.',
    descEn: 'Full monthly timetable with all five prayers and sunrise times, automatically highlighting today row for easy tracking.',
    badgeAr: 'جدول الشهر',
    badgeEn: 'Timetable',
    iconName: 'clock',
    accentColor: '#059669',
    gradient: 'from-emerald-600 to-teal-700'
  }
];

// 15. خطوات إرشاد قائمة إعدادات الصلاة
export const PRAYER_SETTINGS_MODAL_STEPS: SpotlightStep[] = [
  {
    id: 'setting_adhan_offset',
    targetSelector: '#setting-adhan-adjustment',
    titleAr: 'تقديم أو تأخير وقت الأذان',
    titleEn: 'Adjust Adhan Timing & Offset',
    descAr: 'يمكنك زيادة أو إنقاص وقت الأذان بالدقائق عبر زري (+ / -) أو كتابة الرقم يدوياً، أو الضغط على أيقونة الساعة لكتابة الوقت الدقيق لمطابقة مسجد حيك.',
    descEn: 'Increase or decrease the adhan time in minutes using (+ / -), type the offset manually, or tap the clock icon to enter exact local time.',
    badgeAr: 'وقت الأذان',
    badgeEn: 'Adhan Calibration',
    iconName: 'clock',
    accentColor: '#0ea5e9',
    gradient: 'from-sky-500 to-blue-600'
  },
  {
    id: 'setting_tone_selector',
    targetSelector: '#setting-tone-selector',
    titleAr: 'نغمة الأذان واختيار المؤذن',
    titleEn: 'Adhan Tone & Reciter Selection',
    descAr: 'اختر نغمة وتكبيرات الأذان المفضلة لديك من قائمة المؤذنين المشاهير، أو ارفع ملفك الصوتي الخاص من ذاكرة هاتفك.',
    descEn: 'Choose your preferred adhan or takbeer from renowned muezzins, or upload your own audio file from your device.',
    badgeAr: 'صوت الأذان',
    badgeEn: 'Adhan Reciter',
    iconName: 'volume',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'setting_pre_reminder',
    targetSelector: '#setting-pre-reminder',
    titleAr: 'تنبيه الاستعداد للصلاة قبل الأذان',
    titleEn: 'Pre-Adhan Readiness Alert',
    descAr: 'تنبيه لطيف مسبق قبل حلول الأذان بعدة دقائق (10، 15، 20 دقيقة أو تحديد يدوي) للاستعداد والتفرغ والوضوء والذهاب للمسجد.',
    descEn: 'A preparatory reminder minutes before adhan (10, 15, 20 mins or custom) to prepare, make wudu, and head to prayer.',
    badgeAr: 'الاستعداد للصلاة',
    badgeEn: 'Readiness Alert',
    iconName: 'bell',
    accentColor: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'setting_iqama_alert',
    targetSelector: '#setting-iqama-alert',
    titleAr: 'تنبيه وموعد إقامة الصلاة',
    titleEn: 'Iqama Reminder Alert',
    descAr: 'تنبيه بصوت رنين عند حلول موعد إقامة الصلاة في المسجد بعدد الدقائق المحدد بعد الأذان (10، 15، 20 دقيقة أو تحديد يدوي).',
    descEn: 'Chime reminder when the congregation prayer starts after your specified minutes from adhan.',
    badgeAr: 'وقت الإقامة',
    badgeEn: 'Iqama Time',
    iconName: 'bell',
    accentColor: '#8b5cf6',
    gradient: 'from-violet-500 to-purple-600'
  },
  {
    id: 'setting_auto_silent',
    targetSelector: '#setting-auto-silent',
    titleAr: 'تحويل الهاتف للوضع الصامت تلقائياً',
    titleEn: 'Automatic Silent Mode in Prayer',
    descAr: 'كتم صوت الهاتف ونغماته تلقائياً أثناء الصلاة لمنع الإزعاج داخل المسجد، مع إعادته لوضعه الطبيعي تلقائياً بعد انقضاء مدة الصلاة.',
    descEn: 'Automatically mutes phone ringers during prayer to prevent disturbance, and restores normal volume afterwards.',
    badgeAr: 'الوضع الصامت',
    badgeEn: 'Auto Silent',
    iconName: 'volume',
    accentColor: '#ec4899',
    gradient: 'from-pink-500 to-rose-600'
  },
  {
    id: 'setting_save_btn',
    targetSelector: '#setting-save-btn',
    titleAr: 'حفظ الإعدادات والتعديلات',
    titleEn: 'Save Custom Settings',
    descAr: 'اضغط على زر الحفظ لتطبيق كافة التغييرات على توقيت الصلاة ونغماتها والتنبيهات التلقائية فوراً.',
    descEn: 'Tap the save button to apply all custom timings, alerts, and silent durations immediately.',
    badgeAr: 'حفظ التعديلات',
    badgeEn: 'Save Changes',
    iconName: 'action',
    accentColor: '#059669',
    gradient: 'from-emerald-600 to-teal-700'
  }
];

// 15ب. خطوات إرشاد قائمة إعدادات الشروق وصلاة الضحى
export const SUNRISE_SETTINGS_MODAL_STEPS: SpotlightStep[] = [
  {
    id: 'sunrise_time_adjustment',
    targetSelector: '#sunrise-setting-time-adjustment',
    titleAr: 'تعديل وقت الشروق بالدقائق',
    titleEn: 'Adjust Sunrise Timing',
    descAr: 'يمكنك تقديم أو تأخير موعد الشروق بالدقائق باستخدام زري (+ / -) أو كتابة الفارق يدوياً أو اختيار الوقت مباشرة من أيقونة الساعة؛ وسيتحدث موعد الضحى والتنبيهات تلقائياً.',
    descEn: 'Increase or decrease sunrise time in minutes using (+ / -), type the offset manually, or tap the clock icon to pick the exact time; Duha and alerts update automatically.',
    badgeAr: 'ضبط الشروق',
    badgeEn: 'Sunrise Timing',
    iconName: 'clock',
    accentColor: '#0ea5e9',
    gradient: 'from-sky-500 to-blue-600'
  },
  {
    id: 'sunrise_pre_alert',
    targetSelector: '#sunrise-setting-pre-alert',
    titleAr: 'تنبيه قرب الشروق (لإدراك الفجر)',
    titleEn: 'Pre-Sunrise Alert (Catch Fajr)',
    descAr: 'يذكّرك قبل شروق الشمس بـ 10 أو 15 أو 20 أو 30 دقيقة (أو أي مدة تختارها بأزرار + / -) للمبادرة بأداء صلاة الفجر قبل خروج وقتها.',
    descEn: 'Reminds you 10, 15, 20, or 30 minutes before sunrise (or any custom minutes via + / -) to perform Fajr prayer before its time ends.',
    badgeAr: 'قرب الشروق',
    badgeEn: 'Pre-Sunrise',
    iconName: 'bell',
    accentColor: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'sunrise_at_alert',
    targetSelector: '#sunrise-setting-at-alert',
    titleAr: 'تنبيه لحظة الشروق ووقت النهي',
    titleEn: 'At Sunrise & Prohibited Time Alert',
    descAr: 'يرسل إشعاراً بنغمة هادئة (وليست أذاناً) فور شروق الشمس لإعلامك بانتهاء وقت الفجر وبداية وقت النهي عن صلاة النافلة لمدة 15 دقيقة.',
    descEn: 'Sends a calm chime notification (not Adhan) right at sunrise indicating Fajr has ended and the 15-minute prohibited voluntary prayer window has begun.',
    badgeAr: 'لحظة الشروق',
    badgeEn: 'At Sunrise',
    iconName: 'bell',
    accentColor: '#eab308',
    gradient: 'from-yellow-500 to-amber-600'
  },
  {
    id: 'sunrise_duha_alert',
    targetSelector: '#sunrise-setting-duha-alert',
    titleAr: 'تنبيه وموعد صلاة الضحى / الإشراق',
    titleEn: 'Duha / Ishraq Prayer Alert',
    descAr: 'حدد الموعد بعد الشروق (15 دقيقة لبداية الإشراق، 30، 60، 120 دقيقة أو أي مدة بأزرار + / -) ليصلك إشعار بصلاة الضحى ويتحدث الوقت الظاهر أسفل بطاقة الشروق تلقائياً.',
    descEn: 'Choose when after sunrise to be reminded for Duha (15m for Ishraq start, 30m, 60m, 120m, or custom via + / -). The time badge on the Sunrise card updates automatically.',
    badgeAr: 'صلاة الضحى',
    badgeEn: 'Duha Prayer',
    iconName: 'clock',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'sunrise_save_btn',
    targetSelector: '#sunrise-setting-save-btn',
    titleAr: 'حفظ التغييرات وجدولة الإشعارات',
    titleEn: 'Save & Schedule Notifications',
    descAr: 'اضغط هنا لحفظ تفضيلاتك في الهاتف وتحديث وقت صلاة الضحى على البطاقة وجدولة جميع إشعارات الشروق والضحى تلقائياً.',
    descEn: 'Tap here to save your preferences, update the Duha time on the Sunrise card, and schedule all sunrise and Duha phone notifications.',
    badgeAr: 'حفظ الإعدادات',
    badgeEn: 'Save Changes',
    iconName: 'action',
    accentColor: '#059669',
    gradient: 'from-emerald-600 to-teal-700'
  }
];

export const QIBLA_PAGE_STEPS: SpotlightStep[] = [
  {
    id: 'qibla_page_intro',
    titleAr: 'اتجاه القبلة',
    titleEn: 'Qibla Direction',
    descAr: 'تساعدك هذه الصفحة على تحديد اتجاه الكعبة المشرفة بدقة لصحة صلاتك أينما كنت. تضم خمس وسائل ذكية: البوصلة التفاعلية ثلاثية الأبعاد مع التنبيه بالاهتزاز عند التطابق، الخريطة ثلاثية الأبعاد، الواقع المعزز، اتجاه الشمس والقمر، وطريقة الظل.',
    descEn: 'Accurately guides you to the Kaaba from anywhere in the world to ensure proper prayer orientation. Offers five smart modes: a 3D interactive compass with alignment feedback, 3D Map, AR camera view, Sun & Moon bearing, and Shadow method.',
    badgeAr: 'فائدة الصفحة',
    badgeEn: 'Purpose & Benefit',
    iconName: 'block',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  }
];

export const CALENDAR_PAGE_STEPS: SpotlightStep[] = [
  {
    id: 'calendar_page_intro',
    titleAr: 'التقويم الهجري والميلادي والمناسبات',
    titleEn: 'Hijri & Gregorian Calendar & Events',
    descAr: 'تنظم وقتك وتربطك بالتاريخ الإسلامي عبر عرض التقويمين الهجري والميلادي معاً في شبكة واضحة تبرز المناسبات الدينية والأحداث التاريخية لكل شهر. كما تضم محولاً دقيقاً ثنائي الاتجاه للتحويل الفوري بين التاريخين الهجري والميلادي.',
    descEn: 'Helps you stay connected to the Islamic calendar by displaying Hijri and Gregorian dates side by side while highlighting monthly Islamic occasions and historical milestones. Also includes an accurate bidirectional Hijri–Gregorian date converter.',
    badgeAr: 'فائدة الصفحة',
    badgeEn: 'Purpose & Benefit',
    iconName: 'block',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  }
];
