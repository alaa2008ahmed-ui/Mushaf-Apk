import { SpotlightStep } from '../CommunitySpotlightGuide';

// 12. خطوات إرشاد الحاسبة الشرعية - تبويب الزكاة
export const CALCULATOR_ZAKAT_STEPS: SpotlightStep[] = [
  {
    id: 'calc_tabs_bar',
    targetSelector: '#calc-tabs-bar',
    titleAr: 'تبويبات الحاسبة الشرعية',
    titleEn: 'Sharia Calculator Tabs',
    descAr: 'شريط التبويبات الفقهية: تنقل بسهولة بين حاسبة الزكاة بأنواعها، حاسبة المواريث والتركات، حاسبة الكفارات وفدية الصيام، وحاسبة زكاة الفطر والأضاحي والعقيقة.',
    descEn: 'Jurisprudence tabs bar: easily switch between Zakat, Inheritance, Expiations & Fidyah, and Fitr, Udhiyah & Aqiqah.',
    badgeAr: 'الأقسام الفقهية',
    badgeEn: 'Calculator Tabs',
    iconName: 'tab',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'zakat_header_actions',
    targetSelector: '#zakat-header-actions',
    titleAr: 'شريط النتائج وزر إعادة الضبط',
    titleEn: 'Total Badge & Reset Action',
    descAr: 'يعرض شارة إجمالي الزكاة النقدية المستحقة فورياً بمجرد إدخال البيانات، مع زر (إعادة ضبط) لمسح جميع الحقول والبدء بحساب جديد بلمسة واحدة.',
    descEn: 'Displays the live calculated cash zakat total badge, with a (Reset) button to instantly clear all inputs and start fresh.',
    badgeAr: 'الإجمالي وإعادة الضبط',
    badgeEn: 'Total & Reset',
    iconName: 'action',
    accentColor: '#059669',
    gradient: 'from-emerald-600 to-teal-700'
  },
  {
    id: 'zakat_card_cash',
    targetSelector: '#zakat-card-cash',
    titleAr: 'بطاقة زكاة النقود والمدخرات',
    titleEn: 'Cash & Savings Zakat Card',
    descAr: 'أدخل إجمالي أموالك النقدية الحاضرة ومدخراتك البنكية والودائع التي حال عليها الحول القمري (مرور عام هجري كامل)؛ حيث تجب فيها الزكاة شرعاً بنسبة 2.5% (ربع العُشر) عند بلوغ النصاب.',
    descEn: 'Enter all your cash in hand and bank savings held for a full lunar year (Hawl); zakat is due at 2.5% upon reaching the Nisab threshold.',
    badgeAr: 'زكاة النقود',
    badgeEn: 'Cash & Savings',
    iconName: 'block',
    accentColor: '#0ea5e9',
    gradient: 'from-sky-500 to-blue-600'
  },
  {
    id: 'zakat_card_gold_silver',
    targetSelector: '#zakat-card-gold-silver',
    titleAr: 'بطاقة زكاة الذهب والفضة',
    titleEn: 'Gold & Silver Zakat Card',
    descAr: 'بطاقة شاملة لحساب زكاة المعادن الثمينة: أدخل الوزن وسعر الجرام الحالي في بلدك لعيار 24 (نصابه 85 جم)، عيار 21 (نصابه 97.14 جم)، عيار 18 (نصابه 113.33 جم)، والفضة (نصابها 595 جم)؛ ليقوم النظام آلياً بضرب الأوزان بالأسعار وتحديد بلوغ النصاب الشرعي واحتساب مقدار الزكاة المستحقة بنسبة 2.5%.',
    descEn: 'All-in-one precious metals card: enter weight and market price per gram for 24K (Nisab 85g), 21K (Nisab 97.14g), 18K (Nisab 113.33g), and Silver (Nisab 595g); automatically computes values, verifies Nisab, and calculates 2.5% due.',
    badgeAr: 'الذهب والفضة',
    badgeEn: 'Gold & Silver',
    iconName: 'block',
    accentColor: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'zakat_card_trade',
    targetSelector: '#zakat-card-trade',
    titleAr: 'بطاقة عروض التجارة والعقارات',
    titleEn: 'Trade Merchandise & Real Estate Card',
    descAr: 'تشمل تقييم البضائع المعروضة للبيع والنشاط التجاري بسعر السوق الحالي عند تمام الحول، وإيرادات وغلة العقارات الاستثمارية المؤجرة بعد مرور عام قمري عليها، وتُضم لحساب الوعاء الزكوي بنسبة 2.5%.',
    descEn: 'Evaluates inventory goods for trade at current market selling prices at the end of Hawl, plus investment rental revenues held for a lunar year, taxed at 2.5%.',
    badgeAr: 'عروض التجارة',
    badgeEn: 'Trade & Properties',
    iconName: 'block',
    accentColor: '#3b82f6',
    gradient: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'zakat_card_crops',
    targetSelector: '#zakat-card-crops',
    titleAr: 'بطاقة زكاة الزروع والثمار',
    titleEn: 'Crops & Agricultural Produce Card',
    descAr: 'لحساب زكاة المحاصيل والثمار يوم حصادها؛ نصابها 5 أوسق (حوالي 653 كجم)، مع تحديد طريقة الري: ري طبيعي بالأمطار والعيون (الواجب 10% - العُشر)، أو ري بآلات ومضخات وتكلفة (الواجب 5% - نصف العُشر)، مع إمكانية إدخال سعر الكيلو لحساب القيمة النقدية المقابلة اختيارياً.',
    descEn: 'Calculates agricultural zakat at harvest time; Nisab is 5 Awsuq (~653 kg), select irrigation: natural rainfed (10% due) or artificial machinery (5% due), with optional price per kg to compute monetary value.',
    badgeAr: 'الزروع والثمار',
    badgeEn: 'Agricultural Zakat',
    iconName: 'block',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'zakat_card_livestock',
    targetSelector: '#zakat-card-livestock',
    titleAr: 'بطاقة زكاة الأنعام والركاز',
    titleEn: 'Livestock & Rikaz Card',
    descAr: 'أدخل أعداد الماشية السائمة لحساب زكاتها الشرعية: الإبل (نصابها من 5)، البقر (نصابها من 30)، الغنم والماعز (نصابها من 40) لمعرفة نوع وعدد الرؤوس الواجب إخراجها، بالإضافة لحقل الركاز والمعادن المدفونة التي تجب فيها نسبة الخُمس (20%) فور استخراجها دون اشتراط حول.',
    descEn: 'Enter grazing livestock counts: camels (Nisab 5), cattle (Nisab 30), sheep/goats (Nisab 40) to determine due animal types, plus buried treasures (Rikaz) and minerals taxed at 20% immediately without Hawl.',
    badgeAr: 'الأنعام والركاز',
    badgeEn: 'Livestock & Rikaz',
    iconName: 'block',
    accentColor: '#ea580c',
    gradient: 'from-orange-500 to-amber-600'
  },
  {
    id: 'zakat_card_summary',
    targetSelector: '#zakat-card-summary',
    titleAr: 'بطاقة الملخص النهائي للزكاة النقدية',
    titleEn: 'Final Cash Zakat Summary Card',
    descAr: 'الملخص الشامل للزكاة؛ يعرض إجمالي المبالغ الواجب إخراجها نقدياً، مع تفصيل نصيب كل قسم (الأموال والتجارة، المحاصيل، الركاز)، وتنبيه فقهي ذكي باللون الأحمر في حال لم يبلغ مجموع المال النصاب الشرعي المحدد.',
    descEn: 'Comprehensive summary displaying total payable cash zakat, breakdown by category (monetary/trade, crops, rikaz), and alert if wealth is below Nisab.',
    badgeAr: 'الملخص النهائي',
    badgeEn: 'Final Summary',
    iconName: 'action',
    accentColor: '#059669',
    gradient: 'from-emerald-600 to-teal-700'
  }
];

// خطوات إرشاد الحاسبة الشرعية - تبويب المواريث والتركات
export const CALCULATOR_MAWARITH_STEPS: SpotlightStep[] = [
  {
    id: 'mawarith_header_actions',
    targetSelector: '#mawarith-header-actions',
    titleAr: 'شريط المواريث وإعادة الضبط',
    titleEn: 'Inheritance Header & Reset',
    descAr: 'عنوان قسم المواريث وحساب التركات، مزود بزر (إعادة ضبط) لمسح جميع بيانات الورثة والتركة والبدء في حل مسألة فقهية جديدة بلمسة واحدة.',
    descEn: 'Inheritance calculation header equipped with a (Reset) button to instantly clear all heirs and estate figures to start a new case.',
    badgeAr: 'إدارة المسألة',
    badgeEn: 'Header & Reset',
    iconName: 'action',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'mawarith_card_estate',
    targetSelector: '#mawarith-card-estate',
    titleAr: 'بطاقة قيمة التركة الإجمالية',
    titleEn: 'Total Estate Value Card',
    descAr: 'أدخل المبلغ الصافي للتركة المراد توزيعها على الورثة، وذلك بعد خصم تكاليف تجهيز الميت وتكفينه ودفنه، وسداد جميع ديونه المستحقة للعباد ولله، وإنفاذ وصاياه الشرعية الصحيحة في حدود الثلث لغير وارث.',
    descEn: 'Enter net estate value after deducting funeral expenses, settling all debts, and executing valid wills within one-third for non-heirs.',
    badgeAr: 'قيمة التركة',
    badgeEn: 'Estate Value',
    iconName: 'block',
    accentColor: '#0ea5e9',
    gradient: 'from-sky-500 to-blue-600'
  },
  {
    id: 'mawarith_card_parents',
    targetSelector: '#mawarith-card-parents',
    titleAr: 'بطاقة الأصول (الآباء والأجداد)',
    titleEn: 'Ascendants (Parents & Grandparents) Card',
    descAr: 'حدد وجود الأب والأم والجد لأب والجدات من الجهتين؛ حيث يرث الأب بالفرض أو التعصيب ويحجب الأجداد والإخوة، وترث الأم الثلث أو السدس مع حجب الجدات، وتتفاعل الخيارات ذاتياً بحسب قواعد الحجب الفقهية.',
    descEn: 'Select living parents and grandparents; father inherits by quota or Ta\'seeb and blocks grandfathers and siblings, mother inherits 1/3 or 1/6 and blocks grandmothers.',
    badgeAr: 'الآباء والأجداد',
    badgeEn: 'Ascendants',
    iconName: 'user',
    accentColor: '#8b5cf6',
    gradient: 'from-violet-500 to-purple-600'
  },
  {
    id: 'mawarith_card_spouses',
    targetSelector: '#mawarith-card-spouses',
    titleAr: 'بطاقة الزوج والزوجة',
    titleEn: 'Spouse Status Card',
    descAr: 'اختر الحالة الزوجية للمتوفى (زوج يرث النصف أو الربع، أو زوجة ترث الربع أو الثمن بحسب وجود الفرع الوارث)، مع إمكانية تحديد عدد الزوجات (من 1 إلى 4) ليتم اقتسام نصيب الزوجية بينهن بالتساوي.',
    descEn: 'Select surviving spouse (husband inherits 1/2 or 1/4, or wife inherits 1/4 or 1/8 based on descendants), with wives counter (1-4) sharing the portion equally.',
    badgeAr: 'الزوجية',
    badgeEn: 'Spouses',
    iconName: 'user',
    accentColor: '#ec4899',
    gradient: 'from-pink-500 to-rose-600'
  },
  {
    id: 'mawarith_card_descendants',
    targetSelector: '#mawarith-card-descendants',
    titleAr: 'بطاقة الفروع (الأبناء وبناتهم)',
    titleEn: 'Descendants (Children & Grandchildren) Card',
    descAr: 'أدخل أعداد الأبناء الذكور والإناث، وأولاد الابن (أبناء وبنات الابن) عند عدم وجود ابن مباشر صلب؛ حيث يطبق النظام قاعدة التوريث القرآنية (للذكر مثل حظ الأنثيين) وحساب فروض البنات عند انفرادهن.',
    descEn: 'Enter counts of sons, daughters, grandsons, and granddaughters (blocked by sons); automatically applies (male gets twice female share) and daughters\' fixed shares.',
    badgeAr: 'الفروع',
    badgeEn: 'Descendants',
    iconName: 'user',
    accentColor: '#3b82f6',
    gradient: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'mawarith_card_siblings',
    targetSelector: '#mawarith-card-siblings',
    titleAr: 'بطاقة الحواشي (الإخوة والأخوات)',
    titleEn: 'Collaterals (Brothers & Sisters) Card',
    descAr: 'أدخل عدد الإخوة والأخوات الأشقاء، ولأب، ولأم؛ وتطبق الحاسبة قواعد الحجب بالفرع الوارث المذكر أو الأب، كما تحسب ميراث الإخوة لأم بالسوية بالتساوي التام بين الذكر والأنثى بنص القرآن الكريم.',
    descEn: 'Enter counts of full, paternal, and maternal siblings; automatically applies blocking by male descendants or father, and splits maternal siblings\' quota equally between males and females.',
    badgeAr: 'الحواشي',
    badgeEn: 'Siblings',
    iconName: 'group',
    accentColor: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'mawarith_card_extended',
    targetSelector: '#mawarith-card-extended',
    titleAr: 'بطاقة العصبات الأخرى (أبناء الإخوة والأعمام)',
    titleEn: 'Other Agnatic Heirs (Asabah) Card',
    descAr: 'لحساب أنصبة باقي العصبات بالنفس عند انعدام العصبات الأقرب: أبناء الأخ الشقيق، أبناء الأخ لأب، الأعمام، وأبناء العمومة؛ مع تقديم الأقرب جهة ودرجة وقوة لحيازة ما تبقى من التركة تعصيباً.',
    descEn: 'Calculates shares for secondary agnatic heirs (nephews, uncles, cousins) when closer agnates are absent, following strict genealogical proximity rules.',
    badgeAr: 'العصبات',
    badgeEn: 'Extended Heirs',
    iconName: 'group',
    accentColor: '#ea580c',
    gradient: 'from-orange-500 to-amber-600'
  },
  {
    id: 'mawarith_card_results',
    targetSelector: '#mawarith-card-results',
    titleAr: 'بطاقة جدول توزيع الميراث والأنصبة',
    titleEn: 'Inheritance Distribution Table Card',
    descAr: 'جدول بياني شامل يعرض قائمة الورثة المستحقين، نوع إرث كل وارث (فرض، تعصيب، عول، رد)، النسبة المئوية الدقيقة من التركة، والمبلغ المالي المستحق لكل فرد أو فئة بالعملة بدقة شرعية وحسابية متناهية.',
    descEn: 'Detailed distribution table presenting eligible heirs, share type (Fixed, Ta\'seeb, Awl, Radd), exact percentage, and final monetary payout for each heir.',
    badgeAr: 'جدول الميراث',
    badgeEn: 'Distribution Table',
    iconName: 'block',
    accentColor: '#059669',
    gradient: 'from-emerald-600 to-teal-700'
  }
];

// خطوات إرشاد الحاسبة الشرعية - تبويب الكفارات وفدية الصيام
export const CALCULATOR_KAFFARAT_STEPS: SpotlightStep[] = [
  {
    id: 'kaffarat_header_actions',
    targetSelector: '#kaffarat-header-actions',
    titleAr: 'شريط الكفارات وإعادة الضبط',
    titleEn: 'Expiations Header & Reset',
    descAr: 'عنوان قسم حساب الكفارات والفدية الشرعية مع زر (إعادة ضبط) لمسح القيم المدخلة وتصفير الحسابات للبدء من جديد بلمسة واحدة.',
    descEn: 'Expiations and Fidyah calculator toolbar with a (Reset) button to instantly clear all values and restart calculation.',
    badgeAr: 'إدارة الكفارات',
    badgeEn: 'Header & Reset',
    iconName: 'action',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'kaffarat_card_fidyah',
    targetSelector: '#kaffarat-card-fidyah',
    titleAr: 'بطاقة فدية الصيام',
    titleEn: 'Fasting Fidyah Card',
    descAr: 'تجب على العاجز عن صيام رمضان عجزاً دائماً كالكبير في السن والمريض مرضاً مزمناً؛ أدخل عدد الأيام المفطرة ومتوسط تكلفة وجبة إطعام مسكين واحد ليحسب النظام آلياً إجمالي المبلغ الواجب إخراجه.',
    descEn: 'Due by those permanently unable to fast Ramadan (elderly or chronically ill); enter missed days and meal cost per needy person to automatically compute total Fidyah.',
    badgeAr: 'فدية الصيام',
    badgeEn: 'Fasting Fidyah',
    iconName: 'block',
    accentColor: '#0ea5e9',
    gradient: 'from-sky-500 to-blue-600'
  },
  {
    id: 'kaffarat_card_yamin',
    targetSelector: '#kaffarat-card-yamin',
    titleAr: 'بطاقة كفارة اليمين',
    titleEn: 'Oath Expiation (Kaffarat al-Yamin) Card',
    descAr: 'تجب عند الحنث في اليمين المعقودة؛ وهي إطعام عشرة مساكين من أوسط ما تطعمون أهليكم؛ أدخل تكلفة الوجبة المشبعة الواحدة ليقوم النظام آلياً بضربها في 10 وإظهار إجمالي كفارة اليمين المستحقة.',
    descEn: 'Due upon breaking an oath; feeding 10 needy persons; enter cost of one meal to automatically multiply by 10 and display the total expiation amount.',
    badgeAr: 'كفارة اليمين',
    badgeEn: 'Oath Expiation',
    iconName: 'block',
    accentColor: '#3b82f6',
    gradient: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'kaffarat_card_notes',
    targetSelector: '#kaffarat-card-notes',
    titleAr: 'بطاقة الضوابط الفقهية لإخراج الكفارات',
    titleEn: 'Jurisprudence Guidelines Card',
    descAr: 'إيضاح للأحكام الفقهية المعتمدة: الأصل الشرعي في الكفارة والفدية إخراج الطعام عيناً من قوت البلد (مُد أو نصف صاع)، وأجاز جمهور من الفقهاء إخراج القيمة نقداً تيسيراً وسداً لحاجة المسكين.',
    descEn: 'Jurisprudence notes: the standard Sharia requirement is distributing actual staple food (Mudd or half Sa\'), while paying cash value is permitted by scholars to ease poor relief.',
    badgeAr: 'ضوابط فقهية',
    badgeEn: 'Legal Guidelines',
    iconName: 'block',
    accentColor: '#8b5cf6',
    gradient: 'from-purple-500 to-violet-600'
  }
];

// خطوات إرشاد الحاسبة الشرعية - تبويب زكاة الفطر
export const CALCULATOR_FITR_STEPS: SpotlightStep[] = [
  {
    id: 'fitr_subtabs',
    targetSelector: '#fitr-udhiyah-subtabs',
    titleAr: 'التبديل بين زكاة الفطر والأضحية',
    titleEn: 'Toggle Fitr & Udhiyah Modes',
    descAr: 'شريط التبديل السريع بين قسمين: (زكاة الفطر) لحساب صاع الفطر للأفراد والأسرة، و(الأضحية والعقيقة) لحساب بهيمة الأنعام والأسهم وقسمة الأثلاث والعقيقة عن المواليد.',
    descEn: 'Quick subtab switcher: toggle between (Zakat al-Fitr) for individuals and families, and (Udhiyah & Aqiqah) for livestock, shares, thirds division, and newborn sacrifice.',
    badgeAr: 'التبويب الفرعي',
    badgeEn: 'Subtab Toggle',
    iconName: 'tab',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'fitr_card_inputs',
    targetSelector: '#fitr-card-inputs',
    titleAr: 'بطاقة مدخلات زكاة الفطر',
    titleEn: 'Zakat al-Fitr Inputs Card',
    descAr: 'بطاقة متكاملة لحساب الفطر: حدد عدد أفراد الأسرة بالأرقام أو الأزرار السريعة، خيار إضافة الجنين في بطن أمه (استحباباً لفعل عثمان رضي الله عنه)، اختيار نوع الصاع من قوت البلد (أرز، قمح، تمر، زبيب، صاع قياسي)، وخيار إدخال القيمة النقدية للفرد بالعملة المحلية.',
    descEn: 'All-in-one Fitr input card: specify family member count with quick buttons, unborn baby checkbox (recommended), select staple food type (rice, wheat, dates, standard Sa\'), and enter cash equivalent per person.',
    badgeAr: 'مدخلات الفطر',
    badgeEn: 'Fitr Inputs',
    iconName: 'block',
    accentColor: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'fitr_card_results',
    targetSelector: '#fitr-card-results',
    titleAr: 'بطاقة نتائج زكاة الفطر وأحكامها',
    titleEn: 'Zakat al-Fitr Results & Rulings Card',
    descAr: 'تعرض إجمالي المقدار العيني بالصاع والكيلوجرام، وإجمالي المقدار النقدي المقدر، مع ملخص للأحكام الفقهية: وقت الوجوب بغروب شمس ليلة العيد، وأفضل وقت للإخراج قبل صلاة العيد، ومصارفها المشروعة للمساكين.',
    descEn: 'Displays total in-kind weight in kg, estimated total cash, and Sharia rulings: time of obligation at Eid eve sunset, best time before Eid prayer, and poor recipients.',
    badgeAr: 'نتائج وأحكام',
    badgeEn: 'Fitr Results',
    iconName: 'block',
    accentColor: '#059669',
    gradient: 'from-emerald-600 to-teal-700'
  }
];

// خطوات إرشاد الحاسبة الشرعية - تبويب الأضحية والعقيقة
export const CALCULATOR_UDHIYAH_STEPS: SpotlightStep[] = [
  {
    id: 'udhiyah_subtabs',
    targetSelector: '#fitr-udhiyah-subtabs',
    titleAr: 'التبديل بين زكاة الفطر والأضحية',
    titleEn: 'Toggle Fitr & Udhiyah Modes',
    descAr: 'شريط التبديل السريع بين قسمين: (زكاة الفطر) لحساب صاع الفطر للأفراد والأسرة، و(الأضحية والعقيقة) لحساب بهيمة الأنعام والأسهم وقسمة الأثلاث والعقيقة عن المواليد.',
    descEn: 'Quick subtab switcher: toggle between (Zakat al-Fitr) for individuals and families, and (Udhiyah & Aqiqah) for livestock, shares, thirds division, and newborn sacrifice.',
    badgeAr: 'التبويب الفرعي',
    badgeEn: 'Subtab Toggle',
    iconName: 'tab',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'udhiyah_card_animal',
    targetSelector: '#udhiyah-card-animal',
    titleAr: 'بطاقة بهيمة الأنعام والأسهم والأسعار',
    titleEn: 'Livestock Type, Age & Shares Card',
    descAr: 'اختر نوع الأضحية (ضأن، ماعز، بقر، إبل) مع بيان السن الشرعي المجزئ لكل نوع، تحديد عدد أسهمك المشارك بها (تجزئ الشاة عن شخص وأهل بيته، وتجزئ البقرة والبدنة عن 7 أسهم)، وإدخال سعر الذبيحة لحساب قيمة السهم وحصتك بدقة.',
    descEn: 'Choose animal type (sheep, goat, cattle, camel) with minimum age, select partnership shares (sheep for 1 household, cattle/camels up to 7 shares), and input price to calculate share cost.',
    badgeAr: 'بهيمة الأنعام',
    badgeEn: 'Livestock & Shares',
    iconName: 'block',
    accentColor: '#0ea5e9',
    gradient: 'from-sky-500 to-blue-600'
  },
  {
    id: 'udhiyah_card_division',
    targetSelector: '#udhiyah-card-division',
    titleAr: 'بطاقة قسمة الأضحية المستحبة (الأثلاث)',
    titleEn: 'Recommended Thirds Division Card',
    descAr: 'قسمة الأضحية وفق السنة النبوية الشريفة «فكلوا وأطعموا وادخروا»؛ حيث يقسم النظام وزن اللحم الصافي آلياً إلى ثلاثة أثلاث متساوية: ثلث لأهل البيت، ثلث هدية للأقارب والجيران، وثلث صدقة للفقراء والمساكين.',
    descEn: 'Divides net meat weight into three equal portions according to the Sunnah: 1/3 for family, 1/3 as gifts for relatives & neighbors, and 1/3 in charity for the needy.',
    badgeAr: 'قسمة الأثلاث',
    badgeEn: 'Thirds Division',
    iconName: 'block',
    accentColor: '#8b5cf6',
    gradient: 'from-violet-500 to-purple-600'
  },
  {
    id: 'udhiyah_card_defects',
    targetSelector: '#udhiyah-card-defects',
    titleAr: 'بطاقة فحص السلامة من العيوب الأربعة المانعة',
    titleEn: 'Invalidation Defects Checklist Card',
    descAr: 'قائمة تفاعلية لفحص سلامة الأضحية من العيوب الأربعة المانعة للإجزاء الواردة في حديث النبي ﷺ (العوراء، المريضة، العرجاء، والعجفاء)، مع مؤشر ذكي يوضح صحة الأضحية وإجزائها شرعاً.',
    descEn: 'Interactive checklist ensuring the animal is free from the 4 invalidating defects from the Prophetic Hadith (blind, sick, lame, emaciated), with validity badge.',
    badgeAr: 'فحص العيوب',
    badgeEn: 'Defect Checklist',
    iconName: 'block',
    accentColor: '#ef4444',
    gradient: 'from-rose-500 to-red-600'
  },
  {
    id: 'udhiyah_card_aqiqah',
    targetSelector: '#udhiyah-card-aqiqah',
    titleAr: 'بطاقة حاسبة العقيقة عن المواليد',
    titleEn: 'Newborn Aqiqah Calculator Card',
    descAr: 'لحساب العقيقة المسنونة في اليوم السابع للمولود؛ أدخل عدد المواليد الذكور (شاتان عن كل ولد) وعدد الإناث (شاة عن كل بنت)، ليقوم النظام بحساب إجمالي عدد الذبائح المطلوبة للعقيقة.',
    descEn: 'Calculates Sunnah Aqiqah for the 7th day of newborn; enter number of boys (2 sheep each) and girls (1 sheep each) to compute total required sacrifice animals.',
    badgeAr: 'حاسبة العقيقة',
    badgeEn: 'Aqiqah Calculator',
    iconName: 'block',
    accentColor: '#ec4899',
    gradient: 'from-pink-500 to-rose-600'
  }
];

export const CALCULATOR_FITR_UDHIYAH_STEPS: SpotlightStep[] = CALCULATOR_FITR_STEPS;

// للتوافق مع أي استدعاء قديم
export const CALCULATOR_PAGE_STEPS: SpotlightStep[] = CALCULATOR_ZAKAT_STEPS;
