export interface QuranRadio {
    id: string;
    name: string;
    category: 'official' | 'reciters' | 'tafseer' | 'adhkar';
    categoryLabel: string;
    country?: string;
    flag?: string;
    url: string;
    backupUrl?: string;
    bitrate: string;
    description: string;
    icon: string;
}

export const QURAN_RADIOS: QuranRadio[] = [
    // الإذاعات الرسمية للدول
    {
        id: 'radio-cairo',
        name: 'إذاعة القرآن الكريم من القاهرة',
        category: 'official',
        categoryLabel: 'إذاعات رسمية',
        country: 'مصر',
        flag: '🇪🇬',
        url: 'https://stream.radiojar.com/8s5u8tpdtwzuv',
        backupUrl: 'https://n06.radiojar.com/8s5u8tpdtwzuv',
        bitrate: '128 kbps',
        description: 'البث الحي لإذاعة القرآن الكريم المصرية، أعرق وأقدم إذاعة قرآنية في العالم الإسلامي منذ عام 1964م.',
        icon: 'fa-solid fa-tower-broadcast'
    },
    {
        id: 'radio-makkah',
        name: 'إذاعة القرآن الكريم من مكة المكرمة',
        category: 'official',
        categoryLabel: 'إذاعات رسمية',
        country: 'السعودية',
        flag: '🇸🇦',
        url: 'https://backup.qurango.net/radio/makkah',
        backupUrl: 'https://stream.zeno.fm/fvrrt43vn0quv',
        bitrate: '128 kbps',
        description: 'بث مبارك مباشر لتلاوات بيت الله الحرام وصلوات الحرم المكي الشريف على مدار الساعة.',
        icon: 'fa-solid fa-kaaba'
    },
    {
        id: 'radio-riyadh',
        name: 'إذاعة القرآن الكريم من الرياض',
        category: 'official',
        categoryLabel: 'إذاعات رسمية',
        country: 'السعودية',
        flag: '🇸🇦',
        url: 'https://stream.zeno.fm/t3qms66cptzuv',
        backupUrl: 'https://backup.qurango.net/radio/riyadh',
        bitrate: '128 kbps',
        description: 'البث الرسمي لإذاعة القرآن الكريم من المملكة العربية السعودية، برامج علمية وتلاوات عذبة.',
        icon: 'fa-solid fa-mosque'
    },
    {
        id: 'radio-sharjah',
        name: 'إذاعة الشارقة للقرآن الكريم',
        category: 'official',
        categoryLabel: 'إذاعات رسمية',
        country: 'الإمارات',
        flag: '🇦🇪',
        url: 'https://s1.voscast.com:8192/stream',
        backupUrl: 'https://backup.qurango.net/radio/sharjah',
        bitrate: '128 kbps',
        description: 'إذاعة متخصصة بتلاوة القرآن الكريم بمختلف الروايات من إمارة الشارقة بدولة الإمارات.',
        icon: 'fa-solid fa-radio'
    },
    {
        id: 'radio-tunisia',
        name: 'إذاعة الزيتونة للقرآن الكريم',
        category: 'official',
        categoryLabel: 'إذاعات رسمية',
        country: 'تونس',
        flag: '🇹🇳',
        url: 'https://stream.zeno.fm/4wt8ncyx8reuv',
        backupUrl: 'https://backup.qurango.net/radio/tunisia',
        bitrate: '96 kbps',
        description: 'إذاعة الزيتونة المباركة من الجمهورية التونسية، قراءات برواية قالون وتلاوات مغاربية خاشعة.',
        icon: 'fa-solid fa-star-and-crescent'
    },

    // إذاعات كبار القراء
    {
        id: 'radio-abdulbasit',
        name: 'إذاعة الشيخ عبد الباسط عبد الصمد',
        category: 'reciters',
        categoryLabel: 'كبار القراء',
        url: 'https://backup.qurango.net/radio/abdulbasit_abdulsamad_mojawwad',
        backupUrl: 'https://backup.qurango.net/radio/abdulbasit_abdulsamad_warsh',
        bitrate: '128 kbps',
        description: 'تلاوات مجودة ومرتلة نادرة لصوت مكة وسفير كتاب الله الشيخ عبد الباسط عبد الصمد رحمه الله.',
        icon: 'fa-solid fa-microphone-lines'
    },
    {
        id: 'radio-hussary',
        name: 'إذاعة الشيخ محمود خليل الحصري',
        category: 'reciters',
        categoryLabel: 'كبار القراء',
        url: 'https://backup.qurango.net/radio/mahmoud_khalil_alhussary',
        backupUrl: 'https://backup.qurango.net/radio/mahmoud_khalil_alhussary_mojawwad',
        bitrate: '128 kbps',
        description: 'شيخ عموم المقارئ المصرية، إتقان التجويد ومخارج الحروف وضبط أحكام التلاوة.',
        icon: 'fa-solid fa-microphone-lines'
    },
    {
        id: 'radio-minshawi',
        name: 'إذاعة الشيخ محمد صديق المنشاوي',
        category: 'reciters',
        categoryLabel: 'كبار القراء',
        url: 'https://backup.qurango.net/radio/mohammed_siddiq_alminshawi_mojawwad',
        backupUrl: 'https://backup.qurango.net/radio/mohammed_siddiq_alminshawi',
        bitrate: '128 kbps',
        description: 'الصوت الباكي الخاشع الذي يأسر القلوب، تلاوات مجودة كاملة ومحافل قرآنية مهيبة.',
        icon: 'fa-solid fa-microphone-lines'
    },
    {
        id: 'radio-alafasy',
        name: 'إذاعة الشيخ مشاري بن راشد العفاسي',
        category: 'reciters',
        categoryLabel: 'كبار القراء',
        url: 'https://backup.qurango.net/radio/mishary_alafasi',
        bitrate: '128 kbps',
        description: 'المصحف المرتل برواية حفص عن عاصم بصوت القارئ الشيخ مشاري العفاسي.',
        icon: 'fa-solid fa-microphone-lines'
    },
    {
        id: 'radio-muaiqly',
        name: 'إذاعة الشيخ ماهر المعيقلي',
        category: 'reciters',
        categoryLabel: 'كبار القراء',
        url: 'https://backup.qurango.net/radio/maher_al_muaiqly',
        bitrate: '128 kbps',
        description: 'إمام وخطيب المسجد الحرام، تلاوات نديّة خاشعة تنبض بالخشوع والسكينة.',
        icon: 'fa-solid fa-microphone-lines'
    },
    {
        id: 'radio-shuraim',
        name: 'إذاعة الشيخ سعود الشريم',
        category: 'reciters',
        categoryLabel: 'كبار القراء',
        url: 'https://backup.qurango.net/radio/saud_alshuraim',
        bitrate: '128 kbps',
        description: 'تلاوات الحرم المكي الشريف وتراويح وتهجد المسجد الحرام برواية حفص عن عاصم.',
        icon: 'fa-solid fa-microphone-lines'
    },
    {
        id: 'radio-ajmy',
        name: 'إذاعة الشيخ أحمد بن علي العجمي',
        category: 'reciters',
        categoryLabel: 'كبار القراء',
        url: 'https://backup.qurango.net/radio/ahmad_alajmy',
        bitrate: '128 kbps',
        description: 'تلاوة كاملة بصوت عذب شجي تأسر القلوب وتزيد الإيمان.',
        icon: 'fa-solid fa-microphone-lines'
    },

    // التفسير والعلوم القرآنية
    {
        id: 'radio-tafseer',
        name: 'إذاعة تفسير القرآن الكريم',
        category: 'tafseer',
        categoryLabel: 'تفسير وخواطر',
        url: 'https://backup.qurango.net/radio/tafseer',
        bitrate: '96 kbps',
        description: 'تفسير آيات الذكر الحكيم، تأملات إيمانية وشرح لمعاني كتاب الله الميسرة.',
        icon: 'fa-solid fa-book-quran'
    },
    {
        id: 'radio-fatwa',
        name: 'إذاعة الفتاوى الشرعية والدروس',
        category: 'tafseer',
        categoryLabel: 'تفسير وخواطر',
        url: 'https://backup.qurango.net/radio/fatwa',
        bitrate: '96 kbps',
        description: 'فتاوى كبار العلماء وإجابات على الأسئلة الفقهية ودروس في العقيدة وفقه العبادات.',
        icon: 'fa-solid fa-scale-balanced'
    },
    {
        id: 'radio-quran-stories',
        name: 'إذاعة قصص الأنبياء والقرآن',
        category: 'tafseer',
        categoryLabel: 'تفسير وخواطر',
        url: 'https://backup.qurango.net/radio/quran_stories',
        bitrate: '96 kbps',
        description: 'سرد قصص أنبياء الله ورسله والدروس المستفادة من قصص القرآن العظيم.',
        icon: 'fa-solid fa-scroll'
    },

    // الأذكار والرقية والتلاوات الخاشعة
    {
        id: 'radio-khushoo',
        name: 'إذاعة التلاوات الخاشعة والمبكية',
        category: 'adhkar',
        categoryLabel: 'أذكار ورقَى',
        url: 'https://backup.qurango.net/radio/khaled_aljileel',
        backupUrl: 'https://backup.qurango.net/radio/mishary_alafasi',
        bitrate: '128 kbps',
        description: 'مختارات من أعذب وأخشع التلاوات المؤثرة لمختلف قراء العالم الإسلامي.',
        icon: 'fa-solid fa-heart-pulse'
    },
    {
        id: 'radio-adhkar',
        name: 'إذاعة أذكار اليوم والليلة',
        category: 'adhkar',
        categoryLabel: 'أذكار ورقَى',
        url: 'https://backup.qurango.net/radio/athkar_sabah_masaa',
        bitrate: '96 kbps',
        description: 'بث متواصل لأذكار الصباح والمساء، أذكار النوم والاستيقاظ، وأدعية التحصين اليومي.',
        icon: 'fa-solid fa-shield-heart'
    },
    {
        id: 'radio-ruqyah',
        name: 'إذاعة الرقية الشرعية',
        category: 'adhkar',
        categoryLabel: 'أذكار ورقَى',
        url: 'https://backup.qurango.net/radio/roqiah',
        bitrate: '96 kbps',
        description: 'رقية شرعية شاملة بصوت كبار القراء للتحصين والشفاء وطمأنينة النفس والبيت.',
        icon: 'fa-solid fa-wand-magic-sparkles'
    },
    {
        id: 'radio-takbeer',
        name: 'إذاعة تكبيرات العيد والحج',
        category: 'adhkar',
        categoryLabel: 'أذكار ورقَى',
        url: 'https://backup.qurango.net/radio/eid',
        bitrate: '96 kbps',
        description: 'تكبيرات الحرم المكي الشريف والمسجد النبوي وأجواء الأعياد المباركة وشعائر الحج.',
        icon: 'fa-solid fa-hands-praying'
    }
];
