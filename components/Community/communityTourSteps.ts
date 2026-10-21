import { SpotlightStep } from './CommunitySpotlightGuide';

// 1. خطوات إرشاد شاشة تسجيل حساب جديد في مجتمع التواصل
export const ONBOARDING_REGISTER_STEPS: SpotlightStep[] = [
  {
    id: 'reg_tabs',
    targetSelector: '#onboarding-tabs-container',
    titleAr: 'تبويبات الحساب',
    titleEn: 'Account Options',
    descAr: 'اختر "تسجيل جديد" لإنشاء ملف شخصي جديد، أو اضغط "استعادة الحساب" إذا كان لديك حساب سابق.',
    descEn: 'Select "Register" for a new account, or tap "Restore" if you already have one.',
    badgeAr: 'التبويبات',
    badgeEn: 'Tabs',
    iconName: 'tab',
    accentColor: '#10b981', // Emerald
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'reg_avatar',
    targetSelector: '#onboarding-reg-avatar',
    titleAr: 'اختر صورة رمزية',
    titleEn: 'Choose an Avatar',
    descAr: 'اختر صورة رمزية معبّرة لحسابك من بين الصور والأفاتار المتاحة، أو اضغط على أيقونة الكاميرا لاستيراد صورة من هاتفك.',
    descEn: 'Choose an expressive avatar from presets or tap the camera icon to import a photo from your phone.',
    badgeAr: 'صورة رمزية',
    badgeEn: 'Avatar',
    iconName: 'profile',
    accentColor: '#0ea5e9', // Sky blue
    gradient: 'from-sky-500 to-blue-600'
  },
  {
    id: 'reg_username',
    targetSelector: '#onboarding-reg-username',
    titleAr: 'اسم المستخدم',
    titleEn: 'Your Username',
    descAr: 'اكتب اسمك الحقيقي أو لقبك المفضل الذي سيظهر لجميع الإخوة والأخوات في مجتمع التواصل.',
    descEn: 'Type your preferred name or nickname that community members will see.',
    badgeAr: 'الاسم • Name',
    badgeEn: 'Profile Name',
    iconName: 'user',
    accentColor: '#8b5cf6', // Violet
    gradient: 'from-violet-500 to-purple-600'
  },
  {
    id: 'reg_passcode',
    targetSelector: '#onboarding-reg-passcode',
    titleAr: 'الرقم السري الخاص بحسابك',
    titleEn: 'Account Passcode / PIN',
    descAr: 'أدخل رمزاً سرياً مكوناً من 4 إلى 12 خانة لحماية حسابك واستعادته في أي وقت ومن أي هاتف.',
    descEn: 'Enter a 4-12 digit PIN/passcode to protect and recover your account anytime.',
    badgeAr: 'حماية وأمان',
    badgeEn: 'Security PIN',
    iconName: 'lock',
    accentColor: '#ec4899', // Pink / Rose
    gradient: 'from-pink-500 to-rose-600'
  },
  {
    id: 'reg_country',
    targetSelector: '#onboarding-reg-country',
    titleAr: 'اختيار الدولة',
    titleEn: 'Your Country',
    descAr: 'اختر دولتك الكريمة لعرض علمها بجوار اسمك والتعارف على أهل بلدك في حلقات القرآن.',
    descEn: 'Select your country to display its flag beside your profile name.',
    badgeAr: 'الدولة • Flag',
    badgeEn: 'Country Flag',
    iconName: 'country',
    accentColor: '#f59e0b', // Amber
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'reg_submit',
    targetSelector: '#onboarding-reg-actions',
    titleAr: 'بدء التسجيل والدخول',
    titleEn: 'Complete Registration',
    descAr: 'اضغط على زر التسجيل لإنشاء حسابك فوراً والانطلاق في رحلة التواصل والتنافس المبارك في حفظ وقراءة القرآن الكريم.',
    descEn: 'Tap the register button to create your account and start your blessed community journey.',
    badgeAr: 'انطلاق • Start',
    badgeEn: 'Get Started',
    iconName: 'action',
    accentColor: '#10b981', // Emerald
    gradient: 'from-emerald-500 to-teal-600'
  }
];

// خطوات إرشاد شاشة التسجيل عند بدء تشغيل التطبيق (بدون حقل الصورة الرمزية مع ترتيب الرقم السري بعد الاسم)
export const INITIAL_ONBOARDING_REGISTER_STEPS: SpotlightStep[] = [
  {
    id: 'reg_tabs',
    targetSelector: '#onboarding-tabs-container',
    titleAr: 'تبويبات الحساب',
    titleEn: 'Account Options',
    descAr: 'اختر "تسجيل جديد" لإنشاء ملف شخصي جديد، أو اضغط "استعادة الحساب" إذا كان لديك حساب سابق.',
    descEn: 'Select "Register" for a new account, or tap "Restore" if you already have one.',
    badgeAr: 'التبويبات',
    badgeEn: 'Tabs',
    iconName: 'tab',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'reg_username',
    targetSelector: '#onboarding-reg-username',
    titleAr: 'اسم المستخدم',
    titleEn: 'Your Username',
    descAr: 'اكتب اسمك الحقيقي أو لقبك المفضل الذي سيظهر لجميع الإخوة والأخوات في مجتمع التواصل.',
    descEn: 'Type your preferred name or nickname that community members will see.',
    badgeAr: 'الاسم • Name',
    badgeEn: 'Profile Name',
    iconName: 'user',
    accentColor: '#8b5cf6',
    gradient: 'from-violet-500 to-purple-600'
  },
  {
    id: 'reg_passcode',
    targetSelector: '#onboarding-reg-passcode',
    titleAr: 'الرقم السري الخاص بحسابك',
    titleEn: 'Account Passcode / PIN',
    descAr: 'أدخل رمزاً سرياً لحماية حسابك واستعادته في أي وقت ومن أي هاتف.',
    descEn: 'Enter a PIN/passcode to protect and recover your account anytime.',
    badgeAr: 'حماية وأمان',
    badgeEn: 'Security PIN',
    iconName: 'lock',
    accentColor: '#ec4899',
    gradient: 'from-pink-500 to-rose-600'
  },
  {
    id: 'reg_country',
    targetSelector: '#onboarding-reg-country',
    titleAr: 'اختيار الدولة',
    titleEn: 'Your Country',
    descAr: 'اختر دولتك الكريمة لعرض علمها بجوار اسمك والتعارف على أهل بلدك في حلقات القرآن.',
    descEn: 'Select your country to display its flag beside your profile name.',
    badgeAr: 'الدولة • Flag',
    badgeEn: 'Country Flag',
    iconName: 'country',
    accentColor: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'reg_submit',
    targetSelector: '#onboarding-reg-actions',
    titleAr: 'بدء التسجيل والدخول',
    titleEn: 'Complete Registration',
    descAr: 'اضغط على زر التسجيل لإنشاء حسابك فوراً والانطلاق في رحلة التواصل والتنافس المبارك في حفظ وقراءة القرآن الكريم.',
    descEn: 'Tap the register button to create your account and start your blessed community journey.',
    badgeAr: 'انطلاق • Start',
    badgeEn: 'Get Started',
    iconName: 'action',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  }
];

// 2. خطوات إرشاد شاشة استعادة الحساب السابق
export const ONBOARDING_RESTORE_STEPS: SpotlightStep[] = [
  {
    id: 'res_tab_info',
    targetSelector: '#onboarding-tabs-container',
    titleAr: 'استعادة حساب سابق',
    titleEn: 'Restore Existing Account',
    descAr: 'هذا القسم مخصص لاسترجاع حسابك السابق ومحادثاتك ومجموعاتك بكل أمان.',
    descEn: 'This tab allows you to recover your existing profile, chats, and groups securely.',
    badgeAr: 'استعادة • Restore',
    badgeEn: 'Recovery Tab',
    iconName: 'tab',
    accentColor: '#3b82f6', // Blue
    gradient: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'res_username',
    targetSelector: '#onboarding-restore-username',
    titleAr: 'اسم المستخدم أو كود الحساب',
    titleEn: 'Username or Account Code',
    descAr: 'أدخل اسمك المسجل به مسبقاً أو كود حسابك الفريد المكون من حروف وأرقام مثل MQ-XXXXX.',
    descEn: 'Enter your registered name or your unique code (e.g., MQ-XXXXX).',
    badgeAr: 'بيانات الحساب',
    badgeEn: 'Account ID',
    iconName: 'user',
    accentColor: '#8b5cf6', // Purple
    gradient: 'from-purple-500 to-violet-600'
  },
  {
    id: 'res_passcode',
    targetSelector: '#onboarding-restore-passcode',
    titleAr: 'الرقم السري للحساب',
    titleEn: 'Security PIN',
    descAr: 'اكتب نفس الرقم السري الذي اخترته عند إنشاء الحساب لتأكيد ملكيتك له.',
    descEn: 'Enter the PIN/password you originally set when creating your profile.',
    badgeAr: 'كلمة المرور',
    badgeEn: 'Password',
    iconName: 'lock',
    accentColor: '#f59e0b', // Amber
    gradient: 'from-amber-500 to-yellow-600'
  },
  {
    id: 'res_submit',
    targetSelector: '#onboarding-restore-actions',
    titleAr: 'تأكيد الاستعادة',
    titleEn: 'Confirm Restoration',
    descAr: 'اضغط على زر "استعادة الحساب" وسيتم جلب كافة بياناتك ورسائلك السابقة فوراً.',
    descEn: 'Tap "Restore" to fetch all your profile data and chats immediately.',
    badgeAr: 'دخول الحساب',
    badgeEn: 'Login Now',
    iconName: 'action',
    accentColor: '#10b981', // Emerald
    gradient: 'from-emerald-500 to-teal-600'
  }
];

// 3. خطوات إرشاد الشريط العلوي لصفحة المجتمع
export const COMMUNITY_HEADER_STEPS: SpotlightStep[] = [
  {
    id: 'comm_nav',
    targetSelector: '#community-header-nav',
    titleAr: 'زر الرجوع للخلف',
    titleEn: 'Navigation',
    descAr: 'يمكنك الرجوع للخلف للشاشات السابقة في أي وقت.',
    descEn: 'Quickly navigate back to the previous screen at any moment.',
    badgeAr: 'التصفح • Navigation',
    badgeEn: 'Quick Navigation',
    iconName: 'nav',
    accentColor: '#0ea5e9', // Sky blue
    gradient: 'from-sky-500 to-blue-600'
  },
  {
    id: 'comm_profile',
    targetSelector: '#community-profile-pill',
    titleAr: 'الملف الشخصي وكود الحساب',
    titleEn: 'Profile & Account Code',
    descAr: 'اضغط على شريط ملفك لعرض كودك الفريد ومشاركته مع الأصدقاء، وتعديل صورتك وحالتك وكلمة مرورك.',
    descEn: 'Tap here to view your unique account code, copy it, and edit your profile or avatar.',
    badgeAr: 'ملفي الشخصي',
    badgeEn: 'My Profile',
    iconName: 'profile',
    accentColor: '#10b981', // Emerald
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'comm_header_right',
    targetSelector: '#community-header-right',
    titleAr: 'الدليل والرئيسية',
    titleEn: 'Guide & Home',
    descAr: 'زر فتح الدليل الإرشادي للمجتمع، والعودة السريعة إلى الصفحة الرئيسية.',
    descEn: 'Access the community guide or quickly return to Home.',
    badgeAr: 'المساعدة والرئيسية',
    badgeEn: 'Guide & Home',
    iconName: 'action',
    accentColor: '#0ea5e9', // Sky blue
    gradient: 'from-sky-500 to-blue-600'
  },
  {
    id: 'comm_tabs',
    targetSelector: '#community-tabs-nav',
    titleAr: 'أقسام وتبويبات المجتمع',
    titleEn: 'Community Sections',
    descAr: 'تنقل بين المحادثات المباشرة (الأصدقاء)، وحلقات التدبر (المجتمع)، ودليل المستخدمين (الأعضاء)، وقائمة (الحظر).',
    descEn: 'Switch between direct chats (Friends), group circles (Community), user directory (Members), and Blocked list.',
    badgeAr: 'الأقسام الرئيسية',
    badgeEn: 'Main Tabs',
    iconName: 'tab',
    accentColor: '#8b5cf6', // Violet
    gradient: 'from-violet-500 to-purple-600'
  },
  {
    id: 'comm_search',
    targetSelector: '#community-search-container',
    titleAr: 'شريط البحث والتحديث',
    titleEn: 'Search & Live Refresh',
    descAr: 'ابحث بالاسم أو الدولة أو كود الحساب، وزر التحديث الدائري لجلب أحدث الرسائل والمجموعات فوراً.',
    descEn: 'Search users or groups by name/country/code, and refresh instantly for latest data.',
    badgeAr: 'البحث والتحديث',
    badgeEn: 'Search Bar',
    iconName: 'search',
    accentColor: '#ec4899', // Pink
    gradient: 'from-pink-500 to-rose-600'
  }
];

// 4. خطوات إرشاد تبويب الأصدقاء (المحادثات الخاصة)
export const TAB_CHATS_STEPS: SpotlightStep[] = [
  {
    id: 'tab_chats_item',
    targetSelector: '#community-tab-chats',
    titleAr: 'تبويب الأصدقاء',
    titleEn: 'Friends & Direct Chats',
    descAr: 'يضم جميع محادثاتك الثنائية الخاصة، مع ظهور شارة حمراء توضح عدد الرسائل غير المقروءة.',
    descEn: 'Displays all your 1-on-1 private conversations, with unread message counter badges.',
    badgeAr: 'الأصدقاء • Friends',
    badgeEn: 'Friends Tab',
    iconName: 'chat',
    accentColor: '#0ea5e9',
    gradient: 'from-sky-500 to-blue-600'
  },
  {
    id: 'tab_chats_list',
    targetSelector: '#community-chats-section',
    titleAr: 'قائمة المحادثات الخاصة',
    titleEn: 'Conversations List',
    descAr: 'اضغط على أي صديق لفتح المحادثة، أو اسحب لليسار للخيارات. يمكنك إرسال آيات بالرسم العثماني وتسجيلات صوتية.',
    descEn: 'Tap any friend to open chat. Share Uthmani Qur’an verses, voice notes, and media files.',
    badgeAr: 'المحادثات',
    badgeEn: 'Chat Rooms',
    iconName: 'action',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  }
];

// 5. خطوات إرشاد تبويب المجتمع (المجموعات والحلقات)
export const TAB_COMMUNITY_STEPS: SpotlightStep[] = [
  {
    id: 'tab_comm_create',
    targetSelector: '#community-create-group-btn',
    titleAr: 'زر إنشاء مجموعة جديدة',
    titleEn: 'Create New Group',
    descAr: 'يمكنك إنشاء حلقة قرآنية أو مجموعة تدبرية، وتحديد ما إذا كانت عامة للجميع أو خاصة تتطلب دعوة.',
    descEn: 'Create a Qur’anic study circle or group, setting it as public or invitation-only.',
    badgeAr: 'إنشاء حلقة • Create',
    badgeEn: 'Create Circle',
    iconName: 'group',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'tab_comm_list',
    targetSelector: '#community-groups-section',
    titleAr: 'قائمة حلقات المجتمع',
    titleEn: 'Community Circles',
    descAr: 'تصفح الحلقات المتاحة والدعوات المعلقة. انضم لحلقات ختم القرآن وتدارس الآيات وتفاعل مع الإخوة.',
    descEn: 'Browse study circles and pending invitations. Join Khatm groups and Quranic discussions.',
    badgeAr: 'المجموعات والحلقات',
    badgeEn: 'Circles List',
    iconName: 'tab',
    accentColor: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600'
  }
];

// 6. خطوات إرشاد تبويب الأعضاء (دليل مستخدمي المصحف)
export const TAB_USERS_STEPS: SpotlightStep[] = [
  {
    id: 'tab_users_item',
    targetSelector: '#community-tab-users',
    titleAr: 'دليل الأعضاء',
    titleEn: 'Members Directory',
    descAr: 'يعرض جميع قراء المصحف المسجلين من أنحاء العالم مع علم دولتهم وحالتهم (متصل الآن أو غير متصل).',
    descEn: 'Shows all registered Qur’an readers worldwide, their country flags, and online presence.',
    badgeAr: 'الأعضاء • Members',
    badgeEn: 'Directory',
    iconName: 'user',
    accentColor: '#8b5cf6',
    gradient: 'from-violet-500 to-purple-600'
  },
  {
    id: 'tab_users_actions',
    targetSelector: '#community-users-section',
    titleAr: 'بدء المحادثة والإضافة',
    titleEn: 'Connecting with Members',
    descAr: 'اضغط على زر المراسلة أو الإضافة لبدء حوار مبارك مع أي عضو، أو اضغط على الملف للتعرف عليه.',
    descEn: 'Tap chat or add button to start a blessed connection, or view their profile bio.',
    badgeAr: 'التواصل والتعارف',
    badgeEn: 'Direct Connection',
    iconName: 'action',
    accentColor: '#0ea5e9',
    gradient: 'from-sky-500 to-blue-600'
  }
];

// 7. خطوات إرشاد تبويب الحظر
export const TAB_BLOCKED_STEPS: SpotlightStep[] = [
  {
    id: 'tab_blocked_info',
    targetSelector: '#community-blocked-section',
    titleAr: 'قائمة الحظر والأمان',
    titleEn: 'Blocked List & Privacy',
    descAr: 'هنا يمكنك مراجعة الأشخاص المحظورين، وإلغاء الحظر عن أي مستخدم بضغطة زر لتعود للتواصل معه.',
    descEn: 'Review blocked users and unblock any user with one tap to resume communication.',
    badgeAr: 'الأمان والخصوصية',
    badgeEn: 'Security & Block',
    iconName: 'block',
    accentColor: '#ec4899',
    gradient: 'from-rose-500 to-pink-600'
  }
];

// 8. خطوات إرشاد داخل غرفة الدردشة (Direct & Group Chat)
export const CHAT_ROOM_STEPS: SpotlightStep[] = [
  {
    id: 'chat_header',
    targetSelector: '#chat-header-bar',
    titleAr: 'شريط معلومات المحادثة',
    titleEn: 'Chat Header & Actions',
    descAr: 'يعرض اسم الطرف الآخر وحالة اتصاله، وقائمة الخيارات (مسح الرسائل، كتم الإشعارات، الحظر، تفاصيل المجموعة).',
    descEn: 'Displays partner/group info, online status, and options (clear messages, mute, block, group info).',
    badgeAr: 'الشريط العلوي',
    badgeEn: 'Top Header',
    iconName: 'nav',
    accentColor: '#0ea5e9', // Sky blue
    gradient: 'from-sky-500 to-blue-600'
  },
  {
    id: 'chat_verse',
    targetSelector: '#chat-btn-verse',
    titleAr: 'مشاركة آيات القرآن الكريم',
    titleEn: 'Share Qur’anic Verses',
    descAr: 'ميزة فريدة لاختيار أي آية أو مقطع قرآني وتخصيص إطار إسلامي ذهبي وتلاوة صوتية لمشاركتها فوراً.',
    descEn: 'Select any verse in Uthmani script with Islamic gold frames and audio recitation.',
    badgeAr: 'آية قرآنية • Qur’an Verse',
    badgeEn: 'Holy Verse',
    iconName: 'verse',
    accentColor: '#10b981', // Emerald
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'chat_attach',
    targetSelector: '#chat-btn-attach',
    titleAr: 'إرفاق وسائط ومستندات',
    titleEn: 'Media & File Attachments',
    descAr: 'إرسال صور وفيديوهات ومستندات وملفات صوتية بسهولة لدعم حلقات التدارس ونشر الفائدة.',
    descEn: 'Send photos, videos, PDF documents, and audio files easily within the chat.',
    badgeAr: 'المرفقات • Attach',
    badgeEn: 'Attachments',
    iconName: 'attach',
    accentColor: '#f59e0b', // Amber
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'chat_emoji',
    targetSelector: '#chat-btn-emoji',
    titleAr: 'أذكار وتعبيرات إسلامية',
    titleEn: 'Adhkar & Emojis',
    descAr: 'قائمة جاهزة لأذكار وأدعية مأثورة (سبحان الله، الحمد لله، جزاك الله خيراً، بارك الله فيك...) والرموز التعبيرية.',
    descEn: 'Instant Islamic adhkar and greetings (SubhanAllah, JazakAllah Khair...) plus emojis.',
    badgeAr: 'أذكار وتعبيرات',
    badgeEn: 'Adhkar Picker',
    iconName: 'emoji',
    accentColor: '#8b5cf6', // Violet
    gradient: 'from-violet-500 to-purple-600'
  },
  {
    id: 'chat_input',
    targetSelector: '#chat-input-text',
    titleAr: 'مربع كتابة الرسالة',
    titleEn: 'Message Input Field',
    descAr: 'اكتب رسالتك النصية هنا. يدعم لوحة المفاتيح والرموز والروابط القرآنية بكل سلاسة.',
    descEn: 'Type your text message here. Supports multiline, emojis, and references.',
    badgeAr: 'كتابة الرسائل',
    badgeEn: 'Message Box',
    iconName: 'text',
    accentColor: '#6366f1', // Indigo
    gradient: 'from-indigo-500 to-blue-600'
  },
  {
    id: 'chat_voice_send',
    targetSelector: '#chat-btn-voice-send',
    titleAr: 'التسجيل الصوتي والإرسال',
    titleEn: 'Voice Notes & Send',
    descAr: 'اضغط على الميكروفون لتسجيل تلاوة أو رسالة صوتية نقية، أو اضغط سهم الإرسال بعد كتابة النص.',
    descEn: 'Tap the mic to record a crystal-clear audio message, or tap Send for text messages.',
    badgeAr: 'الصوت والإرسال',
    badgeEn: 'Voice & Send',
    iconName: 'voice',
    accentColor: '#ec4899', // Pink
    gradient: 'from-pink-500 to-rose-600'
  }
];

// Ahl Al-Quran Page Tour Steps
export const AHL_QURAN_HEADER_STEPS: SpotlightStep[] = [
  {
    id: 'ahl_header_intro',
    targetSelector: '.app-top-bar',
    titleAr: 'مرحباً بك في صفحة أهل القرآن',
    titleEn: "Welcome to People of the Qur'an",
    descAr: 'هنا تتنافس قلوب الإخوة والأخوات في تلاوة كتاب الله وختمه، مع لوحة شرف تفاعلية وإحصائيات شخصية دقيقة.',
    descEn: 'Here hearts compete in reciting and completing the Book of Allah, with an interactive leaderboard and personal stats.',
    badgeAr: 'أهل القرآن',
    badgeEn: "People of Qur'an",
    iconName: 'quran',
    accentColor: '#f59e0b',
    gradient: 'from-amber-500 to-yellow-600'
  }
];

export const AHL_QURAN_LEADERBOARD_STEPS: SpotlightStep[] = [
  {
    id: 'ahl_tabs',
    targetSelector: '#ahl-tab-leaderboard',
    titleAr: 'لوحة المتصدرين',
    titleEn: 'Leaderboard Tab',
    descAr: 'تستعرض ترتيب القراء الأكابر وأصحاب الختمات والصفحات المسجلة للشهر الحالي أو للأشهر السابقة.',
    descEn: 'Displays top reciters, khatmas, and recorded pages for current or previous months.',
    badgeAr: 'المتصدرين',
    badgeEn: 'Leaderboard',
    iconName: 'tab',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'ahl_archive',
    targetSelector: '#ahl-archive-selector',
    titleAr: 'أرشيف الشهور والإجمالي',
    titleEn: 'Archive & Cumulative Total',
    descAr: 'يمكنك تصفح أرشيف الشهور الهجرية أو الميلادية الماضية، أو عرض الإجمالي التراكمي لكل الأوقات.',
    descEn: 'Browse past Hijri or Gregorian month archives, or view the cumulative lifetime total.',
    badgeAr: 'الأرشيف • Archive',
    badgeEn: 'Month Archive',
    iconName: 'search',
    accentColor: '#3b82f6',
    gradient: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'ahl_list',
    targetSelector: '#ahl-leaderboard-list',
    titleAr: 'قائمة لوحة الشرف',
    titleEn: 'Honor Board List',
    descAr: 'شاهد ترتيبك وأسماء الإخوة والأخوات القراء، مع إمكانية الظهور بأسماء رسمية أو كفاعل خير (مجهول).',
    descEn: 'See your rank and fellow readers, with options to appear publicly or as an anonymous benefactor.',
    badgeAr: 'قائمة الشرف',
    badgeEn: 'Honor List',
    iconName: 'user',
    accentColor: '#8b5cf6',
    gradient: 'from-violet-500 to-purple-600'
  }
];

export const AHL_QURAN_STATS_STEPS: SpotlightStep[] = [
  {
    id: 'ahl_stats_tab',
    targetSelector: '#ahl-tab-mystats',
    titleAr: 'إحصائياتي الشخصية',
    titleEn: 'My Statistics',
    descAr: 'تابع بدقة عدد صفحاتك المقروءة، عدد الختمات، وترتيبك الحالي في المجتمع.',
    descEn: 'Track your read pages count, khatmas, and current rank in the community precisely.',
    badgeAr: 'إحصائيات',
    badgeEn: 'Statistics',
    iconName: 'action',
    accentColor: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'ahl_stats_overview',
    targetSelector: '#ahl-stats-overview',
    titleAr: 'ملخص إنجازاتك',
    titleEn: 'Achievement Summary',
    descAr: 'بطاقة موجزة تلخص إنجازك القرآني لهذا الشهر ومجمل صفحاتك المختومة.',
    descEn: 'A concise card summarizing your Qurani achievement for this month and total completed pages.',
    badgeAr: 'الملخص',
    badgeEn: 'Overview',
    iconName: 'quran',
    accentColor: '#ec4899',
    gradient: 'from-pink-500 to-rose-600'
  }
];

export const AHL_QURAN_PRIVACY_STEPS: SpotlightStep[] = [
  {
    id: 'ahl_privacy_tab',
    targetSelector: '#ahl-tab-privacy',
    titleAr: 'الخصوصية والظهور',
    titleEn: 'Privacy & Visibility',
    descAr: 'تحكم في كيفية ظهورك في لائحة الشرف (علني بالاسم، أو كفاعل خير مجهول، أو مخفي نهائياً).',
    descEn: 'Control how you appear on the leaderboard (public name, anonymous benefactor, or fully hidden).',
    badgeAr: 'الخصوصية',
    badgeEn: 'Privacy',
    iconName: 'lock',
    accentColor: '#3b82f6',
    gradient: 'from-blue-500 to-cyan-600'
  },
  {
    id: 'ahl_privacy_calendar',
    targetSelector: '#ahl-privacy-calendar',
    titleAr: 'نوع التقويم المعتمد',
    titleEn: 'Approved Calendar Type',
    descAr: 'اختر اعتماد الشهور الهجرية أو الميلادية لتصنيف أداء لوحة المتصدرين.',
    descEn: 'Choose whether Hijri or Gregorian months govern the leaderboard rankings.',
    badgeAr: 'التقويم',
    badgeEn: 'Calendar',
    iconName: 'search',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'ahl_privacy_options',
    targetSelector: '#ahl-privacy-options',
    titleAr: 'خيارات الخصوصية الثلاثة',
    titleEn: 'Three Privacy Options',
    descAr: 'اختر النمط الذي يناسبك لحفظ أجر الإخلاص والسر مع الاستمرار في تسجيل صفحاتك.',
    descEn: 'Pick the mode that suits you to preserve sincerity while continuing to record your pages.',
    badgeAr: 'التحكم',
    badgeEn: 'Controls',
    iconName: 'action',
    accentColor: '#8b5cf6',
    gradient: 'from-purple-500 to-indigo-600'
  }
];

export const DAILY_SETTINGS_STEPS: SpotlightStep[] = [
  {
    id: 'wird_name',
    targetSelector: '#wird-name-container',
    titleAr: 'إسم الورد أو الختمة',
    titleEn: 'Wird or Khatma Name',
    descAr: 'قم بتسمية وردك القرآني (مثل ختمة رمضان أو الورد اليومي) لتمييزه بسهولة.',
    descEn: 'Name your Quranic wird (e.g. Ramadan Khatma or Daily Wird) to easily identify it.',
    badgeAr: 'اسم الختمة',
    badgeEn: 'Khatma Name',
    iconName: 'user',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'wird_mode',
    targetSelector: '#wird-mode-container',
    titleAr: 'طريقة تنظيم الختمة',
    titleEn: 'Khatma Method',
    descAr: 'اختر ما إذا كنت تريد تنظيم الختمة حسب عدد الأيام (مثلاً 30 يوماً) أو حسب عدد الصفحات يومياً.',
    descEn: 'Choose whether to organize your khatma by number of days (e.g. 30 days) or daily pages.',
    badgeAr: 'طريقة الختمة',
    badgeEn: 'Khatma Method',
    iconName: 'tab',
    accentColor: '#3b82f6',
    gradient: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'wird_value',
    targetSelector: '#wird-value-container',
    titleAr: 'تحديد القيمة والكمية',
    titleEn: 'Value & Quantity',
    descAr: 'أدخل عدد الأيام المطلوبة لإتمام الختمة، أو عدد الصفحات التي تود قراءتها يومياً.',
    descEn: 'Enter the required days to complete the khatma, or the number of pages to read daily.',
    badgeAr: 'القيمة',
    badgeEn: 'Value',
    iconName: 'action',
    accentColor: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'wird_start',
    targetSelector: '#wird-start-container',
    titleAr: 'زر حفظ وبدء الختمة',
    titleEn: 'Start & Save Khatma Button',
    descAr: 'اضغط هنا لحفظ إعدادات الختمة والبدء فوراً في متابعة وردك وتلاوتك.',
    descEn: 'Tap here to save khatma settings and immediately start tracking your wird and recitation.',
    badgeAr: 'البدء',
    badgeEn: 'Start',
    iconName: 'nav',
    accentColor: '#8b5cf6',
    gradient: 'from-violet-500 to-purple-600'
  }
];

export const DAILY_PROGRESS_STEPS: SpotlightStep[] = [
  {
    id: 'wird_profile',
    targetSelector: '#wird-profile-selector',
    titleAr: 'بطاقة المستخدم الحالي والختمات',
    titleEn: 'Current User & Khatmas',
    descAr: 'هذا هو المستخدم الحالي والختمة النشطة، يمكنك الضغط على هذه البطاقة للتبديل بين المستخدمين والختمات أو إضافة ختمة جديدة.',
    descEn: 'This is the current user and active khatma. Tap this card to switch users or create a new khatma.',
    badgeAr: 'المستخدم الحالي',
    badgeEn: 'Current User',
    iconName: 'user',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'wird_progress',
    targetSelector: '#wird-progress-container',
    titleAr: 'مؤشر إنجاز الختمة والتقدم',
    titleEn: 'Progress & Completion Rate',
    descAr: 'تابع نسبة إنجازك الإجمالية للختمة وعدد الأيام المكتملة بكل دقة وسهولة.',
    descEn: 'Track your overall khatma completion percentage and completed days precisely.',
    badgeAr: 'الإنجاز',
    badgeEn: 'Progress',
    iconName: 'quran',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'wird_today',
    targetSelector: '#wird-today-container',
    titleAr: 'تفاصيل ورد اليوم الحالي',
    titleEn: 'Today’s Wird Details',
    descAr: 'يعرض لك صفحات الورد المحددة لهذا اليوم (من صفحة كذا إلى صفحة كذا) بدقة.',
    descEn: 'Shows you the specified wird pages for today (from page X to page Y) precisely.',
    badgeAr: 'الورد اليومي',
    badgeEn: 'Daily Wird',
    iconName: 'search',
    accentColor: '#0ea5e9',
    gradient: 'from-sky-500 to-blue-600'
  },
  {
    id: 'wird_actions',
    targetSelector: '#wird-actions-container',
    titleAr: 'أزرار القراءة وتسجيل الإنجاز',
    titleEn: 'Reading & Action Buttons',
    descAr: 'افتح المصحف مباشرة للقراءة عند صفحة الورد، أو اضغط لتسجيل اليوم كمكتمل.',
    descEn: 'Open the Mushaf directly for reading at your wird page, or tap to mark the day as completed.',
    badgeAr: 'التفاعل',
    badgeEn: 'Actions',
    iconName: 'action',
    accentColor: '#ec4899',
    gradient: 'from-pink-500 to-rose-600'
  },
  {
    id: 'wird_edit',
    targetSelector: '#wird-edit-btn',
    titleAr: 'تعديل الختمة',
    titleEn: 'Edit Khatma',
    descAr: 'اضغط هنا لتعديل إعدادات الختمة الحالية أو تغيير طريقة التنظيم.',
    descEn: 'Tap here to edit current khatma settings or change the organization method.',
    badgeAr: 'تعديل',
    badgeEn: 'Edit',
    iconName: 'action',
    accentColor: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'wird_reset',
    targetSelector: '#wird-reset-btn',
    titleAr: 'إعادة تعيين',
    titleEn: 'Reset',
    descAr: 'اضغط هنا لمسح سجل الختمة الحالية والبدء من جديد.',
    descEn: 'Tap here to clear the current khatma history and start over.',
    badgeAr: 'إعادة تعيين',
    badgeEn: 'Reset',
    iconName: 'nav',
    accentColor: '#ef4444',
    gradient: 'from-red-500 to-rose-600'
  }
];

// 15. خطوات إرشاد شاشة إعداد التحفيظ والتكرار
export const MEMORIZATION_SETUP_STEPS: SpotlightStep[] = [
  {
    id: 'mem_tabs',
    targetSelector: '#memorization-tabs-container',
    titleAr: 'تبويبات التحفيظ والمراجعة',
    titleEn: 'Memorization & Review Tabs',
    descAr: 'تنقل بسهولة بين إعداد جلسات الحفظ والتكرار الذكي، وجدول المراجعة الدورية وتثبيت المحفوظات.',
    descEn: 'Easily switch between setting up new memorization sessions and managing your periodic review schedule.',
    badgeAr: 'الأقسام',
    badgeEn: 'Tabs',
    iconName: 'tab',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'mem_reader',
    targetSelector: '#reader-select-container',
    titleAr: 'اختيار القارئ المفضل',
    titleEn: 'Select Reciter',
    descAr: 'اختر القارئ المفضل لديك للاستماع لتلاوته المتقنة والترديد خلفه أثناء جلسة الحفظ المباركة.',
    descEn: 'Choose your preferred reciter to listen to accurate recitations and repeat after them during memorization.',
    badgeAr: 'القارئ',
    badgeEn: 'Reciter',
    iconName: 'user',
    accentColor: '#0ea5e9',
    gradient: 'from-sky-500 to-blue-600'
  },
  {
    id: 'mem_range',
    targetSelector: '#ayah-range-container',
    titleAr: 'تحديد نطاق السور والآيات',
    titleEn: 'Surah & Ayah Range',
    descAr: 'حدد بدقة السورة والآية التي تود بدء الحفظ منها، والسورة والآية التي ينتهي عندها المقطع.',
    descEn: 'Accurately specify the starting surah and ayah, as well as the ending point of the passage to memorize.',
    badgeAr: 'نطاق الآيات',
    badgeEn: 'Ayah Range',
    iconName: 'verse',
    accentColor: '#8b5cf6',
    gradient: 'from-purple-500 to-indigo-600'
  },
  {
    id: 'mem_repeat',
    targetSelector: '#repetition-settings-container',
    titleAr: 'إعدادات التكرار والربط الذكي',
    titleEn: 'Repetition & Linking Settings',
    descAr: 'حدد عدد مرات تكرار كل آية، وعدد تكرار كامل النطاق، مع ميزة «ربط الآيات» لترسيخ المعاني، ومدة السكتة للترديد.',
    descEn: 'Set repetitions per ayah, whole range loops, verse linking for deep retention, and pause length to repeat along.',
    badgeAr: 'التكرار والربط',
    badgeEn: 'Repetition',
    iconName: 'action',
    accentColor: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'mem_test',
    targetSelector: '#test-after-session-container',
    titleAr: 'اختبار بعد الجلسة',
    titleEn: 'Post-Session Test',
    descAr: 'فعّل هذا الخيار لاختبار حفظك ذاتياً وتفاعلياً بمجرد انتهاء التكرار للتأكد من رسوخ الآيات في صدرك.',
    descEn: 'Enable this option to take an interactive self-test right after your repetition session to verify retention.',
    badgeAr: 'الاختبار',
    badgeEn: 'Test',
    iconName: 'action',
    accentColor: '#ec4899',
    gradient: 'from-pink-500 to-rose-600'
  },
  {
    id: 'mem_start',
    targetSelector: '#btn-start-memorization',
    titleAr: 'بدء جلسة التحفيظ',
    titleEn: 'Start Memorization Session',
    descAr: 'اضغط هنا لفتح المصحف الشريف وبدء جلسة التلاوة والتكرار المخصصة وفق الإعدادات التي اخترتها.',
    descEn: 'Tap here to launch the Quran screen and begin your interactive repetition session according to your plan.',
    badgeAr: 'ابدأ الآن',
    badgeEn: 'Start Now',
    iconName: 'quran',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'mem_download',
    targetSelector: '#btn-download-reciters',
    titleAr: 'تحميل التلاوات بدون إنترنت',
    titleEn: 'Download Offline Recitations',
    descAr: 'يمكنك تحميل سور القراء مسبقاً على هاتفك للاستمرار في التحفيظ والمراجعة في أي وقت دون الحاجة لشبكة الإنترنت.',
    descEn: 'Download surahs beforehand so you can continue your memorization practice offline anywhere, anytime.',
    badgeAr: 'بدون إنترنت',
    badgeEn: 'Offline Audio',
    iconName: 'nav',
    accentColor: '#0284c7',
    gradient: 'from-cyan-500 to-blue-600'
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
    titleAr: 'إحصائيات الإنجاز والمراجعة',
    titleEn: 'Memorization Stats',
    descAr: 'يعرض لك إجمالي المقاطع المحفوظة، مع بيان عدد المقاطع التي استحقت موعد المراجعة اليوم.',
    descEn: 'Displays total memorized ranges and the number of passages due for review today.',
    badgeAr: 'الإحصائيات',
    badgeEn: 'Stats',
    iconName: 'profile',
    accentColor: '#3b82f6',
    gradient: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'rev_list',
    targetSelector: '#memorization-review-list',
    titleAr: 'قائمة المحفوظات للمراجعة',
    titleEn: 'Review Schedule List',
    descAr: 'يعرض جميع مقاطعك المحفوظة مع تواريخ مراجعتها؛ يمكنك الضغط على زر «بدء جلسة المراجعة والتثبيت» للانطلاق فوراً في تثبيتها، أو حذفها.',
    descEn: 'Lists all your memorized passages with due dates; tap "Start Review & Fixation Session" to review immediately or delete them.',
    badgeAr: 'جدول المحفوظات',
    badgeEn: 'Schedule List',
    iconName: 'quran',
    accentColor: '#8b5cf6',
    gradient: 'from-purple-500 to-indigo-600'
  }
];
