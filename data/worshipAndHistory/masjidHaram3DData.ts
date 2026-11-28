export type HaramGateDirection = 'south' | 'east' | 'north' | 'west' | 'expansion';

export interface HaramGateInfo {
  id: string;
  number: string;
  nameAr: string;
  nameEn: string;
  direction: HaramGateDirection;
  isMajor?: boolean;
  /** World coordinates right at the doorway threshold */
  position: [number, number, number];
  /** World coordinates just outside the gate facing inward */
  exteriorCamera: [number, number, number];
  /** World coordinates inside the mosque along the entry axis */
  interiorWalkPoint: [number, number, number];
  /** Whether the gate leads primarily toward Mas'a or directly to Mataf */
  leadsTo: 'mataf' | 'masa' | 'expansion';
  descriptionAr: string;
  descriptionEn: string;
}

export interface HaramLandmarkInfo {
  id: string;
  nameAr: string;
  nameEn: string;
  subtitleAr: string;
  subtitleEn: string;
  position: [number, number, number];
  cameraOffset: [number, number, number];
  targetOffset: [number, number, number];
  descriptionAr: string;
  descriptionEn: string;
  ritualNoteAr?: string;
  ritualNoteEn?: string;
}

/**
 * Spatial coordinate convention (Kaaba centered at [0, 0, 0]):
 * -Z = North (الشام / باب الفتح / التوسعة الثالثة)
 * +Z = South (اليمن / أجياد / باب الملك عبدالعزيز / الصفا)
 * +X = East (المسعى / باب السلام / باب الكعبة / الحجر الأسود)
 * -X = West (جبل عمر / باب الملك فهد / باب العمرة)
 */
export const HARAM_DIMENSIONS = {
  kaabaWidth: 6.2,    // X dimension (~11.03m scaled)
  kaabaDepth: 7.2,    // Z dimension (~12.86m scaled)
  kaabaHeight: 7.5,   // Y dimension (~13.1m scaled)
  matafInnerRadius: 24,
  matafOuterRadius: 42,
  riwaqInnerRadius: 43,
  riwaqOuterRadius: 62,
  riwaqHeight: 11.5,
  outerPlazaHalfW: 118,
  outerPlazaHalfD: 145,
  masaX: 68,          // East side corridor center X
  masaWidth: 16,      // Corridor width
  safaZ: 70,          // South end of Mas'a (extended corridor)
  marwahZ: -70,       // North end of Mas'a (extended corridor)
  expansionNorthZ: -88,
  expansionDepth: 48,
  expansionWidth: 118,
};

export const HARAM_LANDMARKS: HaramLandmarkInfo[] = [
  {
    id: 'exterior-overview',
    nameAr: 'المسجد الحرام من الخارج',
    nameEn: 'Masjid al-Haram Exterior',
    subtitleAr: 'نظرة شاملة على الحرم والأبراج والمآذن والأبواب',
    subtitleEn: 'Full aerial view of the Sanctuary, landmarks, minarets & gates',
    position: [0, 6, 0],
    cameraOffset: [-152, 108, 174],
    targetOffset: [0, 8, 8],
    descriptionAr:
      'منظر خارجي شامل للمسجد الحرام يظهر فيه صحن المطاف، الأروقة التاريخية، المسعى شرقاً، التوسعة السعودية الثالثة شمالاً، محاطاً ببرج الساعة وأبراج مكة لمعرفة الاتجاهات والأبواب.',
    descriptionEn:
      'Complete exterior view of Masjid al-Haram showing the Mataf, arched Riwaq colonnades, Al-Mas\'a to the east, the 3rd Saudi Expansion to the north, and the surrounding Makkah Clock Tower & landmark towers.',
  },
  {
    id: 'kaaba',
    nameAr: 'الكعبة المشرفة',
    nameEn: 'The Holy Kaaba',
    subtitleAr: 'قبلة المسلمين في قلب صحن المطاف',
    subtitleEn: 'Qiblah of Muslims at the heart of the Mataf',
    position: [0, 4.5, 0],
    cameraOffset: [21, 14, 22],
    targetOffset: [0, 3.8, 0],
    descriptionAr:
      'بيت الله الحرام وقبلة المسلمين، يبلغ ارتفاعها نحو 13.1 متراً وتكسوها الكسوة السوداء المطرزة بالحزام الذهبي، وبابها في الجهة الشرقية.',
    descriptionEn:
      'The Sacred House of Allah and Qiblah of Muslims, standing ~13.1m high, draped in the black Kiswah with the golden Hizam belt, with its door on the eastern wall.',
    ritualNoteAr: 'الطواف سبعة أشواط عكس عقارب الساعة بحيث تكون الكعبة عن يسار الطائف.',
    ritualNoteEn: 'Tawaf is performed in 7 counter-clockwise circuits with the Kaaba on your left.',
  },
  {
    id: 'black-stone',
    nameAr: 'الحجر الأسود',
    nameEn: 'The Black Stone (Al-Hajar Al-Aswad)',
    subtitleAr: 'الركن الجنوبي الشرقي — نقطة بداية ونهاية الطواف',
    subtitleEn: 'Southeastern corner — Start & end point of Tawaf',
    position: [3.25, 1.8, 3.7],
    cameraOffset: [13, 6.5, 14],
    targetOffset: [3.1, 2.2, 3.6],
    descriptionAr:
      'يقع في الركن الجنوبي الشرقي للكعبة المشرفة، ومنه يبدأ كل شوط من أشواط الطواف السبعة وإليه ينتهي، محاذياً للخط الإرشادي في صحن المطاف.',
    descriptionEn:
      'Set into the southeastern corner of the Kaaba. Every Tawaf circuit begins and ends aligned with the Black Stone and the green guidance line.',
    ritualNoteAr: 'استلمه وقبّله إن تيسّر دون إيذاء، وإلا فأشر إليه بيدك اليمنى قائلاً: «الله أكبر».',
    ritualNoteEn: 'Kiss or touch it if easy without crowding; otherwise point to it saying "Allahu Akbar".',
  },
  {
    id: 'multazam-door',
    nameAr: 'باب الكعبة والملتزم',
    nameEn: 'Kaaba Door & Al-Multazam',
    subtitleAr: 'الجهة الشرقية بين الحجر الأسود والباب',
    subtitleEn: 'Eastern facade between Black Stone and the Door',
    position: [3.3, 2.8, 1.3],
    cameraOffset: [15, 7, 4],
    targetOffset: [3.1, 3.2, 0.8],
    descriptionAr:
      'الملتزم هو المسافة التي بين الحجر الأسود وباب الكعبة الشريف في الجدار الشرقي، وهو من مواطن إجابة الدعاء.',
    descriptionEn:
      'Al-Multazam is the eastern wall area between the Black Stone and the Kaaba Door, a blessed place for earnest supplication.',
  },
  {
    id: 'hijr-ismail',
    nameAr: 'حِجر إسماعيل (الحطيم)',
    nameEn: 'Hijr Ismail (Al-Hatim)',
    subtitleAr: 'الجدار المقوّس شمال غرب الكعبة',
    subtitleEn: 'Semicircular wall on the northwestern side',
    position: [0, 1.5, -7.2],
    cameraOffset: [-12, 8, -17],
    targetOffset: [0, 1.5, -6.5],
    descriptionAr:
      'الحائط النصف دائري الواقع في الجهة الشمالية الغربية للكعبة المشرفة، وجزء منه من أصل بناء البيت، لذا يجب الطواف من خارجه لا من داخله.',
    descriptionEn:
      'The semicircular marble enclosure on the northwest side of the Kaaba. Part of it lies within the original Kaaba foundation, so Tawaf must go around its exterior.',
    ritualNoteAr: 'لا يصح الشوط إذا دخل الطائف داخل الحجر أثناء الطواف.',
    ritualNoteEn: 'A circuit is invalid if walked inside Hijr Ismail during Tawaf.',
  },
  {
    id: 'yemeni-corner',
    nameAr: 'الركن اليماني',
    nameEn: 'The Yemeni Corner (Al-Rukn Al-Yamani)',
    subtitleAr: 'الركن الجنوبي الغربي للكعبة المشرفة',
    subtitleEn: 'Southwestern corner of the Kaaba',
    position: [-3.25, 1.8, 3.7],
    cameraOffset: [-14, 6.5, 14],
    targetOffset: [-3.1, 2.2, 3.6],
    descriptionAr:
      'الركن الجنوبي الغربي للكعبة، ويُسن استلامه باليد اليمنى في كل شوط إن تيسر دون تقبيل أو إشارة، وبينَه وبين الحجر الأسود يُقال الدعاء المأثور.',
    descriptionEn:
      'The southwestern corner of the Kaaba. It is Sunnah to touch it with the right hand if accessible without kissing or pointing, reciting the Prophetic dua between it and the Black Stone.',
    ritualNoteAr: '﴿ رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ ﴾',
    ritualNoteEn: '"Our Lord, give us in this world good and in the Hereafter good and protect us from the punishment of the Fire."',
  },
  {
    id: 'maqam-ibrahim',
    nameAr: 'مقام إبراهيم عليه السلام',
    nameEn: 'Maqam Ibrahim',
    subtitleAr: 'المقصورة الذهبية شرق الكعبة المشرفة',
    subtitleEn: 'Golden shrine east of the Kaaba',
    position: [11.5, 2.0, -0.6],
    cameraOffset: [22, 7.5, 8],
    targetOffset: [11.5, 1.8, -0.6],
    descriptionAr:
      'الحجر الذي قام عليه نبي الله إبراهيم عليه السلام عند بناء الكعبة، ويقع في الجهة الشرقية في صحن المطاف داخل مقصورة زجاجية مذهّبة.',
    descriptionEn:
      'The stone upon which Prophet Ibrahim (AS) stood while building the Kaaba, housed in a golden-trimmed glass enclosure east of the Kaaba.',
    ritualNoteAr: 'بعد إتمام 7 أشواط طواف، يُصلّى خلفه ركعتا الطواف: ﴿ وَاتَّخِذُوا مِن مَّقَامِ إِبْرَاهِيمَ مُصَلًّى ﴾.',
    ritualNoteEn: 'Pray two rak\'ahs behind Maqam Ibrahim after completing 7 circuits of Tawaf.',
  },
  {
    id: 'zamzam',
    nameAr: 'موقع بئر زمزم',
    nameEn: 'Zamzam Well Area',
    subtitleAr: 'جنوب شرق الكعبة ومقام إبراهيم',
    subtitleEn: 'Southeast of Kaaba & Maqam Ibrahim',
    position: [15.5, 0.8, 7.5],
    cameraOffset: [26, 9, 17],
    targetOffset: [15.5, 0.5, 7.5],
    descriptionAr:
      'البئر المباركة الواقعة في صحن المطاف شرق-جنوب شرق الكعبة على بُعد نحو 20 متراً، ومغطاة حالياً تحت بلاط صحن المطاف وتُضخ مياهها إلى مشارب الحرم.',
    descriptionEn:
      'The blessed well located ~20m east-southeast of the Kaaba beneath the Mataf marble floor, supplying drinking stations throughout the Sanctuary.',
    ritualNoteAr: 'يُسن الشرب من ماء زمزم والتضلع منه بعد صلاة ركعتي الطواف مع الدعاء.',
    ritualNoteEn: 'It is Sunnah to drink Zamzam water to one\'s fill after the two Tawaf rak\'ahs.',
  },
  {
    id: 'mataf-interior',
    nameAr: 'صحن المطاف والأروقة من الداخل',
    nameEn: 'Mataf & Interior Colonnades',
    subtitleAr: 'منظور داخلي من داخل صحن الطواف',
    subtitleEn: 'Interior view from inside the Mataf courtyard',
    position: [0, 2.4, 30],
    cameraOffset: [-21, 5.4, 26],
    targetOffset: [0, 4.0, 0],
    descriptionAr:
      'صحن المطاف المفروش برخام ثاسوس الأبيض البارد، تحيط به الأروقة العباسية والعثمانية بأعمدتها وأقواسها وقبابها ومشربياتها المتصلة بأدوار التوسعة.',
    descriptionEn:
      'The open Mataf paved with cooling white Thassos marble, encircled by multi-level arched Riwaq colonnades, Mashrabiya facades, and Ottoman domes.',
  },
  {
    id: 'safa-marwah',
    nameAr: 'داخل المسعى (الصفا والمروة)',
    nameEn: 'Inside Al-Mas\'a (Safa & Marwah)',
    subtitleAr: 'الدخول إلى ممر السعي والميلين الأخضرين',
    subtitleEn: 'Interior corridor view with Green Lights & dual tracks',
    position: [68, 3.2, 0],
    cameraOffset: [68, 4.2, 52],
    targetOffset: [68, 3.2, -52],
    descriptionAr:
      'منظور داخلي واضح من قلب ممر المسعى يمتد بين جبل الصفا جنوباً وجبل المروة شمالاً، ويظهر فيه مسارا الذهاب والإياب والميلان الأخضران والثريات والأروقة العلوية.',
    descriptionEn:
      'Clear interior view from inside the Al-Mas\'a gallery between Mount Safa and Mount Marwah, showing the dual tracks, central lane, green-lit Harwalah arches, and upper balconies.',
    ritualNoteAr: 'يبدأ السعي من الصفا وينتهي بالمروة (من الصفا إلى المروة شوط، ومن المروة إلى الصفا شوط).',
    ritualNoteEn: 'Sa\'i starts at Safa and ends at Marwah (Safa to Marwah = 1 lap, Marwah to Safa = 1 lap).',
  },
  {
    id: 'safa-mount',
    nameAr: 'جبل الصفا (من الداخل)',
    nameEn: 'Mount Safa (Interior)',
    subtitleAr: 'منصة جبل الصفا وقبته وبداية السعي',
    subtitleEn: 'Inside Mount Safa gallery & rock outcrop',
    position: [68, 2.6, 70],
    cameraOffset: [68, 3.6, 54],
    targetOffset: [68, 2.4, 70],
    descriptionAr:
      'داخل مقصورة جبل الصفا في الطرف الجنوبي للمسعى؛ تظهر صخور جبل الصفا المحاطة بالسياج الرخامي الدائري والقباب والمشكاة العلوية ومنها يبدأ السعي نحو المروة.',
    descriptionEn:
      'Inside the Mount Safa gallery at the southern end of Al-Mas\'a, showing the natural granite outcrop, marble viewing balustrade, and towering ribbed dome.',
    ritualNoteAr: 'يُرقى على الصفا وتُستقبل الكعبة ويُدعى الله قبل الانطلاق نحو المروة.',
    ritualNoteEn: 'Stand at Safa facing the Kaaba in supplication before heading north toward Marwah.',
  },
  {
    id: 'marwah-mount',
    nameAr: 'جبل المروة (من الداخل)',
    nameEn: 'Mount Marwah (Interior)',
    subtitleAr: 'منصة جبل المروة ونهاية السعي',
    subtitleEn: 'Inside Mount Marwah gallery & rock outcrop',
    position: [68, 2.6, -70],
    cameraOffset: [68, 3.6, -54],
    targetOffset: [68, 2.4, -70],
    descriptionAr:
      'داخل مقصورة جبل المروة في الطرف الشمالي للمسعى؛ تظهر صخور المروة والسلالم الرخامية وقبة المروة المضيئة حيث ينتهي الشوط السابع.',
    descriptionEn:
      'Inside the Mount Marwah gallery at the northern end of Al-Mas\'a, featuring the Marwah rock outcrop, marble steps, and grand dome where the 7th lap concludes.',
    ritualNoteAr: 'عند إتمام الشوط السابع على المروة يتحلل المعتمر بالحلق أو التقصير.',
    ritualNoteEn: 'Upon completing the 7th lap at Marwah, the pilgrim concludes Sa\'i with Tahallul.',
  },
  {
    id: 'king-abdullah-expansion',
    nameAr: 'التوسعة السعودية الثالثة (الشمالية)',
    nameEn: '3rd Saudi Expansion (North)',
    subtitleAr: 'ساحة وقباب التوسعة الكبرى وباب الملك عبدالله',
    subtitleEn: 'Grand Northern Expansion courtyard, domes & Gate 100',
    position: [0, 5, -92],
    cameraOffset: [46, 38, -138],
    targetOffset: [0, 5, -72],
    descriptionAr:
      'أكبر توسعة في تاريخ المسجد الحرام في الجهة الشمالية، وتتميز بقبابها المتحركة والثابتة ومآذنها الشاهقة وباب الملك عبدالله (رقم 100) في قلب الواجهة الشمالية.',
    descriptionEn:
      'The largest expansion in Masjid al-Haram\'s history on the northern side, featuring monumental domes, soaring minarets, and King Abdullah Gate (100).',
  },
  {
    id: 'clock-tower',
    nameAr: 'برج الساعة',
    nameEn: 'Makkah Clock Tower · South',
    subtitleAr: 'معلم الجهة الجنوبية أمام باب الملك عبدالعزيز (1)',
    subtitleEn: 'Southern landmark facing King Abdulaziz Gate (1)',
    position: [-10, 88, 162],
    cameraOffset: [-48, 72, 245],
    targetOffset: [-8, 42, 130],
    descriptionAr:
      'وقف الملك عبدالعزيز (برج الساعة الملكي) في الجهة الجنوبية مقابل باب الملك عبدالعزيز (باب 1) وباب أجياد؛ يحدد وجوده اتجاه الجنوب ويُسترشد به للوصول إلى الساحة الجنوبية.',
    descriptionEn:
      'Abraj Al-Bait (Makkah Royal Clock Tower) directly south of King Abdulaziz Gate (1), serving as the primary southern orientation landmark.',
  },
  {
    id: 'jabal-omar',
    nameAr: 'أبراج جبل عمر',
    nameEn: 'Jabal Omar Towers · West',
    subtitleAr: 'معلم الجهة الغربية أمام باب الملك فهد (79)',
    subtitleEn: 'Western landmark facing King Fahd Gate (79)',
    position: [-144, 48, 16],
    cameraOffset: [-215, 62, 68],
    targetOffset: [-100, 18, 18],
    descriptionAr:
      'مجمع أبراج جبل عمر وأبراج هيلتون في الجهة الغربية المقابلة لباب الملك فهد (79) وباب العمرة (62)، مما يوضح اتجاه الغرب ومداخل الساحة الغربية.',
    descriptionEn:
      'Jabal Omar & Hilton towers along the western boundary facing King Fahd Gate (79) and Bab Al-Umrah (62), orienting the western entrances.',
  },
  {
    id: 'al-safwah',
    nameAr: 'أبراج الصفوة',
    nameEn: 'Al-Safwah Towers · Southeast',
    subtitleAr: 'معلم الجهة الجنوبية الشرقية قرب أجياد وباب الصفا (13)',
    subtitleEn: 'Southeastern landmark near Ajyad & Safa Gate (13)',
    position: [56, 44, 152],
    cameraOffset: [115, 58, 215],
    targetOffset: [52, 18, 96],
    descriptionAr:
      'أبراج الصفوة في الجهة الجنوبية الشرقية بجوار برج الساعة وأمام ساحة أجياد ومدخل الصفا، لتحديد الاتجاه إلى باب أجياد (5) وباب إسماعيل (8) وباب الصفا (13).',
    descriptionEn:
      'Al-Safwah Towers on the southeastern side beside the Clock Tower, guiding pilgrims to Bab Ajyad (5), Bab Ismail (8), and Bab Al-Safa (13).',
  },
  {
    id: 'shamiyah-towers',
    nameAr: 'أبراج الشامية',
    nameEn: 'Shamiyah & Jabal Al-Kaaba · Northwest',
    subtitleAr: 'معلم الجهة الشمالية الغربية قرب التوسعة الثالثة وباب الفتح',
    subtitleEn: 'Northwestern landmark near 3rd Expansion & Bab Al-Fath',
    position: [-94, 44, -152],
    cameraOffset: [-168, 60, -212],
    targetOffset: [-48, 16, -110],
    descriptionAr:
      'أبراج الشامية وجبل الكعبة في الجهة الشمالية الغربية المحاذية لبوابات التوسعة السعودية الثالثة وباب الملك عبدالله (100) وباب الفتح (45).',
    descriptionEn:
      'Shamiyah & Jabal Al-Kaaba towers on the northwest edge beside the 3rd Saudi Expansion portals and King Abdullah Gate (100).',
  },
  {
    id: 'makkah-hilton',
    nameAr: 'أبراج مكة وهيلتون',
    nameEn: 'Makkah & Hilton Towers · Southwest',
    subtitleAr: 'معلم الجهة الجنوبية الغربية قرب باب إبراهيم (88) وباب الوداع (92)',
    subtitleEn: 'Southwestern landmark near Bab Ibrahim (88) & Bab Al-Wada (92)',
    position: [-88, 48, 145],
    cameraOffset: [-142, 58, 208],
    targetOffset: [-62, 16, 98],
    descriptionAr:
      'أبراج مكة وفندق هيلتون في الجهة الجنوبية الغربية أمام الساحة الغربية الجنوبية؛ يسترشد بها القاصدون للوصول إلى باب إبراهيم (88) وباب الملك عبدالعزيز (1).',
    descriptionEn:
      'Makkah & Hilton Towers along the southwestern plaza guiding pilgrims toward Bab Ibrahim (88) and King Abdulaziz Gate (1).',
  },
  {
    id: 'ghazzah-towers',
    nameAr: 'أبراج الغزة',
    nameEn: 'Al-Ghazzah Towers · Northeast',
    subtitleAr: 'معلم الجهة الشمالية الشرقية قرب باب المروة (25) وباب السلام',
    subtitleEn: 'Northeastern landmark near Bab Al-Marwah (25) & Bab Al-Salam',
    position: [96, 40, -148],
    cameraOffset: [152, 58, -206],
    targetOffset: [74, 16, -98],
    descriptionAr:
      'منطقة وأبراج الغزة في الجهة الشمالية الشرقية أمام الساحات الشرقية الشمالية؛ تُرشد القادمين نحو باب المروة الرئيسي (25) ومداخل المسعى والصحن.',
    descriptionEn:
      'Al-Ghazzah district towers on the northeastern side guiding pilgrims arriving toward Bab Al-Marwah Main Gate (25).',
  },
  {
    id: 'dar-al-tawhid',
    nameAr: 'فندق دار التوحيد',
    nameEn: 'Dar Al Tawhid Intercontinental & East Plazas',
    subtitleAr: 'المعلم الفندقي الشهير مقابل باب السلام (19) والساحات الشرقية',
    subtitleEn: 'Renowned luxury hotel facing Bab Al-Salam (19) & eastern plazas',
    position: [154, 28, 60],
    cameraOffset: [215, 60, 108],
    targetOffset: [112, 16, 52],
    descriptionAr:
      'فندق دار التوحيد إنتركونتيننتال الفخم في الساحات الشرقية المباشرة المقابلة لباب السلام وممر المسعى، وهو وجهة رئيسية للزوار والمعتمرين القادمين من الشرق.',
    descriptionEn:
      'Dar Al Tawhid Intercontinental Hotel directly overlooking the eastern plazas and Bab Al-Salam, serving as a primary luxury gateway for eastern arrivals.',
  },
  {
    id: 'ibrahim-khalil-hotels',
    nameAr: 'فنادق إبراهيم الخليل',
    nameEn: 'Ibrahim Al-Khalil Street Hotels & South Plazas',
    subtitleAr: 'المحور الفندقي والخدمي النشط أمام باب الملك عبدالعزيز وباب أجياد',
    subtitleEn: 'Active hotel & commercial corridor facing King Abdulaziz & Ajyad gates',
    position: [154, 26, -6],
    cameraOffset: [215, 56, 22],
    targetOffset: [110, 14, -4],
    descriptionAr:
      'مجموعة الفنادق والابراج الحديثة الواقعة على امتداد شارع إبراهيم الخليل والساحات الجنوبية للصحن، وتوفر مسارات سهلة للوصول إلى باب الملك عبدالعزيز وباب أجياد.',
    descriptionEn:
      'Modern hotel towers along Ibrahim Al-Khalil street and the southern plaza, offering direct pedestrian access toward King Abdulaziz and Ajyad gates.',
  },
  {
    id: 'eastern-tunnels-plazas',
    nameAr: 'أنفاق وساحات الشرق',
    nameEn: 'Modern Eastern & Northeast Tunnels & Plazas Network',
    subtitleAr: 'أنفاق المشاة والمركبات والساحات الكبرى قرب باب المروة وباب علي',
    subtitleEn: 'Pedestrian & vehicular tunnels and major plazas near Marwah & Ali gates',
    position: [154, 42, -72],
    cameraOffset: [216, 62, -112],
    targetOffset: [112, 18, -62],
    descriptionAr:
      'شبكة الأنفاق الحديثة ومحاور الطرق والساحات الشرقية الشمالية الواقعة بالقرب من باب المروة (25) وباب علي (22)، والتي تنظم حركة الحشود والسيارات بكل سهولة.',
    descriptionEn:
      'Modern tunnel networks, access roads, and northern eastern plazas situated near Bab Al-Marwah (25) and Bab Ali (22), streamlining visitor flow.',
  },
];

export interface TourExteriorLandmarkOrigin {
  landmarkId: string;
  nearestGateId: string;
  nameAr: string;
  nameEn: string;
  directionAr: string;
  directionEn: string;
  plazaStart: [number, number, number];
  gateOverviewCamStart: [number, number, number];
  gateOverviewCamEnd: [number, number, number];
  gateOverviewTarget: [number, number, number];
  step1Start: [number, number, number];
  step1End: [number, number, number];
  step2Waypoints: Array<[number, number, number]>;
}

export const TOUR_EXTERIOR_ORIGINS: TourExteriorLandmarkOrigin[] = [
  {
    landmarkId: 'clock-tower',
    nearestGateId: 'gate-1',
    nameAr: 'برج الساعة (أبراج البيت)',
    nameEn: 'Makkah Clock Tower',
    directionAr: 'الجهة الجنوبية',
    directionEn: 'South Side',
    plazaStart: [-10, 0.28, 134],
    gateOverviewCamStart: [-28, 22, 114],
    gateOverviewCamEnd: [-20, 18, 102],
    gateOverviewTarget: [-10, 9, 63],
    step1Start: [-10, 0.25, 96],
    step1End: [-10, 0.25, 70],
    step2Waypoints: [
      [-10, 0.22, 66],
      [-9, 0.22, 48],
      [-7, 0.22, 32],
      [-2, 0.22, 16],
      [7, 0.22, 10],
    ],
  },
  {
    landmarkId: 'jabal-omar',
    nearestGateId: 'gate-79',
    nameAr: 'أبراج جبل عمر',
    nameEn: 'Jabal Omar Towers',
    directionAr: 'الجهة الغربية',
    directionEn: 'West Side',
    plazaStart: [-124, 0.28, 18],
    gateOverviewCamStart: [-122, 22, 36],
    gateOverviewCamEnd: [-110, 18, 30],
    gateOverviewTarget: [-78.5, 10, 24],
    step1Start: [-104, 0.25, 24],
    step1End: [-82, 0.25, 24],
    step2Waypoints: [
      [-78, 0.22, 24],
      [-58, 0.22, 24],
      [-40, 0.22, 17],
      [-20, 0.22, 12],
      [6, 0.22, 10],
    ],
  },
  {
    landmarkId: 'al-safwah',
    nearestGateId: 'gate-5',
    nameAr: 'أبراج الصفوة',
    nameEn: 'Al-Safwah Towers',
    directionAr: 'الجهة الجنوبية الشرقية',
    directionEn: 'Southeast Side',
    plazaStart: [56, 0.28, 132],
    gateOverviewCamStart: [50, 22, 108],
    gateOverviewCamEnd: [42, 18, 95],
    gateOverviewTarget: [26, 9, 59],
    step1Start: [39, 0.25, 88],
    step1End: [29, 0.25, 66],
    step2Waypoints: [
      [26, 0.22, 59],
      [21, 0.22, 46],
      [15, 0.22, 32],
      [11, 0.22, 18],
      [9.5, 0.22, 9.8],
    ],
  },
  {
    landmarkId: 'shamiyah-towers',
    nearestGateId: 'gate-100',
    nameAr: 'أبراج الشامية وجبل الكعبة',
    nameEn: 'Shamiyah & Jabal Al-Kaaba',
    directionAr: 'الجهة الشمالية الغربية',
    directionEn: 'Northwest Side',
    plazaStart: [-84, 0.28, -135],
    gateOverviewCamStart: [-26, 26, -172],
    gateOverviewCamEnd: [-18, 22, -158],
    gateOverviewTarget: [0, 11, -116],
    step1Start: [0, 0.25, -148],
    step1End: [0, 0.25, -122],
    step2Waypoints: [
      [0, 0.22, -116],
      [0, 0.22, -88],
      [0, 0.22, -62],
      [0, 0.22, -32],
      [5, 0.22, -14],
      [9.5, 0.22, 5],
    ],
  },
  {
    landmarkId: 'makkah-hilton',
    nearestGateId: 'gate-88',
    nameAr: 'أبراج مكة وهيلتون',
    nameEn: 'Makkah & Hilton Towers',
    directionAr: 'الجهة الجنوبية الغربية',
    directionEn: 'Southwest Side',
    plazaStart: [-78, 0.28, 128],
    gateOverviewCamStart: [-76, 22, 88],
    gateOverviewCamEnd: [-67, 18, 76],
    gateOverviewTarget: [-41.5, 8, 49],
    step1Start: [-62, 0.25, 72],
    step1End: [-46, 0.25, 54],
    step2Waypoints: [
      [-41.5, 0.22, 49],
      [-32, 0.22, 38],
      [-21, 0.22, 25],
      [-9, 0.22, 14],
      [7, 0.22, 10],
    ],
  },
  {
    landmarkId: 'ghazzah-towers',
    nearestGateId: 'gate-25',
    nameAr: 'أبراج الغزة',
    nameEn: 'Al-Ghazzah Towers',
    directionAr: 'الجهة الشمالية الشرقية',
    directionEn: 'Northeast Side',
    plazaStart: [88, 0.28, -133],
    gateOverviewCamStart: [84, 21, -124],
    gateOverviewCamEnd: [77, 17, -112],
    gateOverviewTarget: [68, 9, -81.5],
    step1Start: [68, 0.25, -106],
    step1End: [68, 0.25, -86],
    step2Waypoints: [
      [68, 0.22, -81.5],
      [64, 0.22, -48],
      [63, 0.22, -4],
      [44, 0.22, 0],
      [22, 0.22, 0],
      [10, 0.22, 7.5],
    ],
  },
  {
    landmarkId: 'dar-al-tawhid',
    nearestGateId: 'gate-15',
    nameAr: 'فندق دار التوحيد',
    nameEn: 'Dar Al Tawhid Intercontinental & East Plazas',
    directionAr: 'الجهة الشرقية الجنوبية',
    directionEn: 'East-South Side',
    plazaStart: [116, 0.28, 60],
    gateOverviewCamStart: [112, 21, 44],
    gateOverviewCamEnd: [102, 17, 36],
    gateOverviewTarget: [77.9, 9, 28],
    step1Start: [94, 0.25, 28],
    step1End: [81, 0.25, 28],
    step2Waypoints: [
      [77.9, 0.22, 28],
      [64.5, 0.22, 22],
      [63.5, 0.22, 2],
      [44, 0.22, 2],
      [22, 0.22, 4],
      [10, 0.22, 9.5],
    ],
  },
  {
    landmarkId: 'ibrahim-khalil-hotels',
    nearestGateId: 'gate-19',
    nameAr: 'فنادق إبراهيم الخليل',
    nameEn: 'Ibrahim Al-Khalil Street Hotels & South Plazas',
    directionAr: 'الجهة الشرقية',
    directionEn: 'East Side',
    plazaStart: [128, 0.28, -4],
    gateOverviewCamStart: [114, 22, 16],
    gateOverviewCamEnd: [103, 18, 10],
    gateOverviewTarget: [77.9, 10, 0],
    step1Start: [94, 0.25, -4],
    step1End: [81, 0.25, 0],
    step2Waypoints: [
      [77.9, 0.22, 0],
      [62, 0.22, 0],
      [44, 0.22, 2],
      [22, 0.22, 4],
      [10, 0.22, 9.5],
    ],
  },
  {
    landmarkId: 'eastern-tunnels-plazas',
    nearestGateId: 'gate-22',
    nameAr: 'أنفاق وساحات الشرق',
    nameEn: 'Modern Eastern & Northeast Tunnels & Plazas Network',
    directionAr: 'الجهة الشرقية الشمالية',
    directionEn: 'East-North Side',
    plazaStart: [118, 0.28, -70],
    gateOverviewCamStart: [112, 21, -46],
    gateOverviewCamEnd: [102, 17, -36],
    gateOverviewTarget: [77.9, 9, -28],
    step1Start: [94, 0.25, -26],
    step1End: [81, 0.25, -28],
    step2Waypoints: [
      [77.9, 0.22, -28],
      [71.5, 0.22, -16],
      [68, 0.22, 0],
      [56, 0.22, 1],
      [36, 0.22, 3],
      [10, 0.22, 9.5],
    ],
  },
];

// Outer courtyard ring around the entire Masjid al-Haram footprint (clears all buildings & minarets)
const RING_X_MIN = -92;
const RING_X_MAX = 92;
const RING_Z_MIN = -128;
const RING_Z_MAX = 96;
const RING_W = RING_X_MAX - RING_X_MIN; // 184 (South/North)
const RING_D = RING_Z_MAX - RING_Z_MIN; // 210 (East/West)
const RING_PERIM = 2 * (RING_W + RING_D); // 788

// Perimeter corners ordered counter-clockwise: SW -> SE -> NE -> NW
const RING_CORNERS: Array<{ s: number; pt: [number, number, number] }> = [
  { s: 0, pt: [RING_X_MIN, 0.28, RING_Z_MAX] },
  { s: RING_W, pt: [RING_X_MAX, 0.28, RING_Z_MAX] },
  { s: RING_W + RING_D, pt: [RING_X_MAX, 0.28, RING_Z_MIN] },
  { s: 2 * RING_W + RING_D, pt: [RING_X_MIN, 0.28, RING_Z_MIN] },
];

type RingSide = 'south' | 'east' | 'north' | 'west';

const snapPointToRing = (
  x: number,
  z: number,
  preferredSide?: RingSide
): { pt: [number, number, number]; s: number } => {
  const cx = Math.max(RING_X_MIN, Math.min(RING_X_MAX, x));
  const cz = Math.max(RING_Z_MIN, Math.min(RING_Z_MAX, z));

  let side: RingSide | undefined = preferredSide;
  if (!side) {
    const dSouth = Math.abs(z - RING_Z_MAX);
    const dNorth = Math.abs(z - RING_Z_MIN);
    const dEast = Math.abs(x - RING_X_MAX);
    const dWest = Math.abs(x - RING_X_MIN);
    const minD = Math.min(dSouth, dNorth, dEast, dWest);
    if (minD === dSouth) side = 'south';
    else if (minD === dEast) side = 'east';
    else if (minD === dNorth) side = 'north';
    else side = 'west';
  }

  if (side === 'south') {
    return { pt: [cx, 0.28, RING_Z_MAX], s: cx - RING_X_MIN };
  }
  if (side === 'east') {
    return { pt: [RING_X_MAX, 0.28, cz], s: RING_W + (RING_Z_MAX - cz) };
  }
  if (side === 'north') {
    return { pt: [cx, 0.28, RING_Z_MIN], s: RING_W + RING_D + (RING_X_MAX - cx) };
  }
  return { pt: [RING_X_MIN, 0.28, cz], s: 2 * RING_W + RING_D + (cz - RING_Z_MIN) };
};

export const buildExteriorLandmarkToGateWaypoints = (
  landmarkId: string,
  gate: HaramGateInfo
): Array<[number, number, number]> => {
  const origin =
    TOUR_EXTERIOR_ORIGINS.find((o) => o.landmarkId === landmarkId) || TOUR_EXTERIOR_ORIGINS[0];
  const startPt: [number, number, number] = [...origin.plazaStart];

  let startSide: RingSide = 'south';
  if (landmarkId === 'jabal-omar') startSide = 'west';
  else if (landmarkId === 'shamiyah-towers' || landmarkId === 'ghazzah-towers') startSide = 'north';
  else if (
    landmarkId === 'dar-al-tawhid' ||
    landmarkId === 'ibrahim-khalil-hotels' ||
    landmarkId === 'eastern-tunnels-plazas'
  ) {
    startSide = 'east';
  }

  const startRing = snapPointToRing(startPt[0], startPt[2], startSide);

  const [gx, , gz] = gate.position;
  const [ex, , ez] = gate.exteriorCamera;
  const dx = ex - gx;
  const dz = ez - gz;
  const dLen = Math.hypot(dx, dz) || 1;
  const ux = dx / dLen;
  const uz = dz / dLen;

  const gateTarget: [number, number, number] = [gx + ux * 3.4, 0.28, gz + uz * 3.4];

  let endRing: { pt: [number, number, number]; s: number };
  const tailPoints: Array<[number, number, number]> = [];

  if (gate.direction === 'north') {
    // Northern Riwaq gates lie south of the 3rd Saudi Expansion: enter via Gate 100 central aisle
    endRing = snapPointToRing(0, RING_Z_MIN, 'north');
    tailPoints.push(
      [0, 0.28, -116],
      [0, 0.28, -72],
      [gx, 0.28, gz - 7.5],
      gateTarget
    );
  } else if (gate.id === 'gate-27') {
    // Bab Al-Qubbah (NE corner): clear 3rd Expansion SE wall before curving to doorway
    endRing = snapPointToRing(92, -68, 'east');
    tailPoints.push([65, 0.28, -68], [63, 0.28, -56], gateTarget);
  } else {
    const approachPt: [number, number, number] = [gx + ux * 11, 0.28, gz + uz * 11];
    let gateSide: RingSide = 'south';
    if (gate.direction === 'south' || gate.id === 'gate-13') gateSide = 'south';
    else if (gate.direction === 'east') gateSide = 'east';
    else if (gate.direction === 'expansion') {
      gateSide =
        gate.id === 'gate-119' ? 'east' : gate.id === 'gate-160' ? 'west' : 'north';
    } else if (gate.direction === 'west') {
      gateSide = gz > 42 && Math.abs(uz) >= Math.abs(ux) * 0.7 ? 'south' : 'west';
    }
    endRing = snapPointToRing(approachPt[0], approachPt[2], gateSide);
    tailPoints.push(approachPt, gateTarget);
  }

  // Walk the shorter arc along the outer courtyard rectangle from startRing.s to endRing.s
  const ccwDist = (endRing.s - startRing.s + RING_PERIM) % RING_PERIM;
  const cwDist = (startRing.s - endRing.s + RING_PERIM) % RING_PERIM;
  const cornerPts: Array<[number, number, number]> = [];

  if (ccwDist <= cwDist) {
    const crossed = RING_CORNERS.map((c) => ({
      dist: (c.s - startRing.s + RING_PERIM) % RING_PERIM,
      pt: c.pt,
    }))
      .filter((item) => item.dist > 3 && item.dist < ccwDist - 3)
      .sort((a, b) => a.dist - b.dist);
    crossed.forEach((c) => cornerPts.push(c.pt));
  } else {
    const crossed = RING_CORNERS.map((c) => ({
      dist: (startRing.s - c.s + RING_PERIM) % RING_PERIM,
      pt: c.pt,
    }))
      .filter((item) => item.dist > 3 && item.dist < cwDist - 3)
      .sort((a, b) => a.dist - b.dist);
    crossed.forEach((c) => cornerPts.push(c.pt));
  }

  const raw: Array<[number, number, number]> = [
    startPt,
    startRing.pt,
    ...cornerPts,
    endRing.pt,
    ...tailPoints,
  ];

  // Deduplicate nearby consecutive points so spline stays taut and never loops
  const deduped: Array<[number, number, number]> = [];
  for (let i = 0; i < raw.length; i++) {
    const pt = raw[i];
    if (deduped.length === 0) {
      deduped.push(pt);
      continue;
    }
    const prev = deduped[deduped.length - 1];
    const d = Math.hypot(pt[0] - prev[0], pt[2] - prev[2]);
    if (d >= 2.8 || i === raw.length - 1) {
      deduped.push(pt);
    }
  }
  return deduped;
};

export const HARAM_GATES: HaramGateInfo[] = [
  // ================= SOUTH SIDE (+Z): King Abdulaziz Gate -> Ajyad -> Safa =================
  {
    id: 'gate-1',
    number: '1',
    nameAr: 'باب الملك عبدالعزيز',
    nameEn: 'King Abdulaziz Gate',
    direction: 'south',
    isMajor: true,
    position: [-10, 0, 63],
    exteriorCamera: [-16, 14, 96],
    interiorWalkPoint: [-8, 2.4, 34],
    leadsTo: 'mataf',
    descriptionAr: 'البوابة الرئيسية الكبرى في الجهة الجنوبية للمسجد الحرام بمآذنها التوأمية، مقابلة لوقف الملك عبدالعزيز، وتؤدي مباشرة إلى صحن المطاف.',
    descriptionEn: 'The grand southern main entrance flanked by twin minarets facing the Clock Tower plaza, leading directly into the Mataf.',
  },
  {
    id: 'gate-5',
    number: '5',
    nameAr: 'باب أجياد',
    nameEn: 'Bab Ajyad',
    direction: 'south',
    isMajor: true,
    position: [26, 0, 59],
    exteriorCamera: [31, 13, 86],
    interiorWalkPoint: [22, 2.4, 31],
    leadsTo: 'mataf',
    descriptionAr: 'من الأبواب التاريخية المعروفة جهة أجياد جنوب شرق الحرم، قريب من الحجر الأسود والمسعى.',
    descriptionEn: 'Historic Ajyad entrance on the southeast side, convenient for reaching the Black Stone corner and Mas\'a.',
  },
  {
    id: 'gate-8',
    number: '8',
    nameAr: 'باب إسماعيل',
    nameEn: 'Bab Ismail',
    direction: 'south',
    isMajor: true,
    position: [46, 0, 57.8],
    exteriorCamera: [46, 12, 84],
    interiorWalkPoint: [40, 2.4, 30],
    leadsTo: 'mataf',
    descriptionAr: 'من الأبواب الشهيرة في الجهة الجنوبية الشرقية قرب الصفا، ويصل سريعاً إلى الحجر الأسود والصفا.',
    descriptionEn: 'Well-known southeastern gate near Al-Safa, offering quick access to the Black Stone and Safa.',
  },
  {
    id: 'gate-13',
    number: '13',
    nameAr: 'باب الصفا الرئيسي',
    nameEn: 'Bab Al-Safa Main Gate',
    direction: 'east',
    isMajor: true,
    position: [68, 0, 81.5],
    exteriorCamera: [70, 13, 108],
    interiorWalkPoint: [68, 2.4, 67],
    leadsTo: 'masa',
    descriptionAr: 'البوابة الكبرى عند قبة الصفا في الطرف الجنوبي للمسعى، يدخل منها القاصدون لبداية السعي.',
    descriptionEn: 'Grand portal beneath the Safa dome at the southern end of Al-Mas\'a.',
  },

  // ================= EAST SIDE (+X): Along Al-Mas'a -> Bab Al-Salam -> Marwah =================
  {
    id: 'gate-15',
    number: '15',
    nameAr: 'باب بني شيبة',
    nameEn: 'Bab Bani Shaibah',
    direction: 'east',
    position: [77.9, 0, 28],
    exteriorCamera: [104, 12, 30],
    interiorWalkPoint: [66, 2.4, 26],
    leadsTo: 'masa',
    descriptionAr: 'باب شرقي يحمل اسم سدنة الكعبة (بني شيبة)، يفتح على النصف الجنوبي للمسعى.',
    descriptionEn: 'Eastern gate named after the custodians of the Kaaba, opening onto the southern Mas\'a.',
  },
  {
    id: 'gate-19',
    number: '19',
    nameAr: 'باب السلام',
    nameEn: 'Bab Al-Salam',
    direction: 'east',
    isMajor: true,
    position: [77.9, 0, 0],
    exteriorCamera: [108, 14, 0],
    interiorWalkPoint: [36, 2.4, 0],
    leadsTo: 'mataf',
    descriptionAr: 'من أعرق أبواب المسجد الحرام في الجهة الشرقية؛ اعتاد القادمون من المشرق الدخول منه باتجاه الكعبة ومقام إبراهيم.',
    descriptionEn: 'One of the most historic eastern gates of Masjid al-Haram, leading directly across the Mas\'a toward Maqam Ibrahim and the Kaaba.',
  },
  {
    id: 'gate-22',
    number: '22',
    nameAr: 'باب علي رضي الله عنه',
    nameEn: 'Bab Ali',
    direction: 'east',
    position: [77.9, 0, -28],
    exteriorCamera: [104, 12, -28],
    interiorWalkPoint: [65, 2.4, -26],
    leadsTo: 'masa',
    descriptionAr: 'باب في الواجهة الشرقية يربط الساحة الشرقية بالنصف الشمالي من المسعى.',
    descriptionEn: 'Eastern gate connecting the east courtyard to the northern half of Al-Mas\'a.',
  },
  {
    id: 'gate-25',
    number: '25',
    nameAr: 'باب المروة الرئيسي',
    nameEn: 'Bab Al-Marwah Main Gate',
    direction: 'east',
    isMajor: true,
    position: [68, 0, -81.5],
    exteriorCamera: [70, 13, -108],
    interiorWalkPoint: [68, 2.4, -67],
    leadsTo: 'masa',
    descriptionAr: 'البوابة الكبرى عند جبل المروة في الطرف الشمالي للمسعى، يخرج منها المعتمرون بعد التحلل أو يتجهون منها للساحة الشرقية.',
    descriptionEn: 'Grand portal at Mount Marwah at the northern end of Al-Mas\'a where pilgrims conclude Sa\'i.',
  },

  // ================= NORTH SIDE (-Z): Historic Al-Fath & Northern Riwaq =================
  {
    id: 'gate-40',
    number: '40',
    nameAr: 'باب المدّعى',
    nameEn: 'Bab Al-Mudda\'a',
    direction: 'north',
    position: [42, 0, -60],
    exteriorCamera: [44, 12, -82],
    interiorWalkPoint: [34, 2.4, -32],
    leadsTo: 'mataf',
    descriptionAr: 'باب تاريخي في الجهة الشمالية الشرقية يصل بين ساحات الشمال والأروقة الداخلية.',
    descriptionEn: 'Historic northeastern gate connecting northern plazas to the inner colonnades.',
  },
  {
    id: 'gate-45',
    number: '45',
    nameAr: 'باب الفتح',
    nameEn: 'Bab Al-Fath',
    direction: 'north',
    isMajor: true,
    position: [0, 0, -63],
    exteriorCamera: [0, 14, -92],
    interiorWalkPoint: [0, 2.4, -34],
    leadsTo: 'mataf',
    descriptionAr: 'البوابة الشمالية الرئيسية التاريخية بمآذنها التوأمية، ومنها دخل النبي ﷺ مكة يوم الفتح؛ وتصل مباشرة إلى حِجر إسماعيل والمطاف.',
    descriptionEn: 'The grand historic northern gate with twin minarets, connecting straight toward Hijr Ismail and the northern Mataf.',
  },
  {
    id: 'gate-53',
    number: '53',
    nameAr: 'باب القدس',
    nameEn: 'Bab Al-Quds',
    direction: 'north',
    position: [-39, 0, -60],
    exteriorCamera: [-42, 12, -82],
    interiorWalkPoint: [-30, 2.4, -30],
    leadsTo: 'mataf',
    descriptionAr: 'باب في الركن الشمالي الغربي يسهل الانتقال نحو التوسعة الثالثة وباب العمرة.',
    descriptionEn: 'Northwestern corner gate facilitating movement toward the 3rd Expansion and Bab Al-Umrah.',
  },

  // ================= 3RD SAUDI EXPANSION (-Z far north): King Abdullah Gate & Wings =================
  {
    id: 'gate-100',
    number: '100',
    nameAr: 'باب الملك عبدالله بن عبدالعزيز',
    nameEn: 'King Abdullah Gate',
    direction: 'expansion',
    isMajor: true,
    position: [0, 0, -116],
    exteriorCamera: [0, 20, -155],
    interiorWalkPoint: [0, 2.4, -84],
    leadsTo: 'expansion',
    descriptionAr: 'البوابة المركزية العملاقة للتوسعة السعودية الثالثة في أقصى الشمال، تحيط بها المآذن الشاهقة والقباب الكبرى وتؤدي إلى صحن التوسعة ثم إلى الكعبة.',
    descriptionEn: 'The monumental central portal of the 3rd Saudi Expansion at the far north, leading through the grand prayer halls straight toward the Mataf.',
  },
  {
    id: 'gate-104',
    number: '104',
    nameAr: 'باب التوسعة 104 (الشمال الشرقي)',
    nameEn: 'Expansion Gate 104',
    direction: 'expansion',
    position: [26, 0, -116],
    exteriorCamera: [30, 15, -145],
    interiorWalkPoint: [24, 2.4, -84],
    leadsTo: 'expansion',
    descriptionAr: 'من بوابات التوسعة الثالثة في الجناح الشمالي الشرقي.',
    descriptionEn: 'Northeastern wing entrance of the 3rd Saudi Expansion.',
  },
  {
    id: 'gate-119',
    number: '119',
    nameAr: 'باب التوسعة 119',
    nameEn: 'Expansion Gate 119',
    direction: 'expansion',
    position: [58, 0, -86],
    exteriorCamera: [88, 15, -86],
    interiorWalkPoint: [40, 2.4, -80],
    leadsTo: 'expansion',
    descriptionAr: 'مدخل شرقي جانبي إلى أدوار التوسعة السعودية الثالثة والسلالم الكهربائية.',
    descriptionEn: 'Side eastern entry to the 3rd Expansion floors and escalators.',
  },
  {
    id: 'gate-142',
    number: '142',
    nameAr: 'باب التوسعة 142 (الشمال الغربي)',
    nameEn: 'Expansion Gate 142',
    direction: 'expansion',
    position: [-26, 0, -116],
    exteriorCamera: [-30, 15, -145],
    interiorWalkPoint: [-24, 2.4, -84],
    leadsTo: 'expansion',
    descriptionAr: 'بوابة كبرى في الجناح الشمالي الغربي للتوسعة السعودية الثالثة.',
    descriptionEn: 'Major northwestern wing portal of the 3rd Saudi Expansion.',
  },
  {
    id: 'gate-160',
    number: '160',
    nameAr: 'باب التوسعة 160',
    nameEn: 'Expansion Gate 160',
    direction: 'expansion',
    position: [-58, 0, -86],
    exteriorCamera: [-88, 15, -86],
    interiorWalkPoint: [-40, 2.4, -80],
    leadsTo: 'expansion',
    descriptionAr: 'مدخل غربي جانبي إلى صحن التوسعة الثالثة ومناطق السلالم والمصاعد.',
    descriptionEn: 'Side western entry to the 3rd Expansion prayer halls and escalators.',
  },

  // ================= WEST SIDE (-X): Al-Umrah Gate -> King Fahd Gate -> Farewell Gate =================
  {
    id: 'gate-62',
    number: '62',
    nameAr: 'باب العمرة',
    nameEn: 'Bab Al-Umrah',
    direction: 'west',
    isMajor: true,
    position: [-54, 0, -34],
    exteriorCamera: [-86, 14, -44],
    interiorWalkPoint: [-30, 2.4, -18],
    leadsTo: 'mataf',
    descriptionAr: 'من أعرق أبواب الجهة الشمالية الغربية ومميز بمآذنه التوأمية؛ يفضّل المعتمرون الدخول منه إلى الركن الشامي والمطاف.',
    descriptionEn: 'Historic northwestern portal with twin minarets, traditionally favored by Umrah pilgrims entering toward the Levantine corner and Mataf.',
  },
  {
    id: 'gate-70',
    number: '70',
    nameAr: 'باب أحد',
    nameEn: 'Bab Uhud',
    direction: 'west',
    position: [-63.5, 0, -6],
    exteriorCamera: [-90, 12, -6],
    interiorWalkPoint: [-34, 2.4, -4],
    leadsTo: 'mataf',
    descriptionAr: 'باب في الواجهة الغربية بين باب العمرة وباب الملك فهد.',
    descriptionEn: 'Western facade gate situated between Bab Al-Umrah and King Fahd Gate.',
  },
  {
    id: 'gate-79',
    number: '79',
    nameAr: 'باب الملك فهد',
    nameEn: 'King Fahd Gate',
    direction: 'west',
    isMajor: true,
    position: [-78.5, 0, 24],
    exteriorCamera: [-108, 15, 30],
    interiorWalkPoint: [-32, 2.4, 14],
    leadsTo: 'mataf',
    descriptionAr: 'أكبر بوابات الواجهة الغربية بمآذنه الشاهقة وقبابه المهيبة، يربط توسعة الملك فهد وساحات جبل عمر مباشرة بصحن المطاف.',
    descriptionEn: 'The grandest western portal with towering minarets, linking the King Fahd Expansion and Jabal Omar plaza straight to the Mataf.',
  },
  {
    id: 'gate-88',
    number: '88',
    nameAr: 'باب إبراهيم',
    nameEn: 'Bab Ibrahim',
    direction: 'west',
    isMajor: true,
    position: [-41.5, 0, 49],
    exteriorCamera: [-66, 12, 68],
    interiorWalkPoint: [-24, 2.4, 28],
    leadsTo: 'mataf',
    descriptionAr: 'باب تاريخي في الركن الجنوبي الغربي يقابل الركن اليماني للكعبة المشرفة.',
    descriptionEn: 'Historic southwestern gate facing toward the Yemeni Corner of the Kaaba.',
  },
];

export type TourRitualMode =
  | 'arrival'
  | 'gate-entry'
  | 'black-stone'
  | 'tawaf-7'
  | 'maqam-prayer'
  | 'zamzam'
  | 'safa-dua'
  | 'sai-7'
  | 'marwah-tahallul';

export type RitualOverlayMode = 'none' | 'tawaf' | 'sai' | 'both';

export interface TourStop3D {
  id: string;
  stepNumber: number;
  phaseAr: string;
  phaseEn: string;
  titleAr: string;
  titleEn: string;
  landmarkId?: string;
  gateId?: string;
  ritualMode: TourRitualMode;
  overlay: RitualOverlayMode;
  durationSec: number;
  tipAr: string;
  tipEn: string;
  detailAr: string;
  detailEn: string;
  duaAr?: string;
  duaEn?: string;
}

export const UMRAH_3D_TOUR_STOPS: TourStop3D[] = [
  {
    id: 'tour-ihram',
    stepNumber: 1,
    phaseAr: '١. الإحرام والتوجه للحرم',
    phaseEn: '1. Ihram & Arrival',
    titleAr: '1. الإحرام والنية والوصول إلى ساحات الحرم',
    titleEn: '1. Ihram, Intention & Arrival at the Sanctuary',
    landmarkId: 'exterior-overview',
    ritualMode: 'arrival',
    overlay: 'none',
    durationSec: 7,
    tipAr: 'الإحرام من الميقات والتلبية وصولاً إلى الساحات؛ يظهر برج الساعة جنوباً وجبل عمر غرباً.',
    tipEn: 'Enter Ihram at the Miqat reciting Talbiyah as you arrive at the Sanctuary plazas.',
    detailAr:
      'ينوي المعتمر العمرة من الميقات قائلاً: «لَبَّيْكَ اللَّهُمَّ عُمْرَةً»، ويكثر من التلبية حتى يصل إلى المسجد الحرام خاشعاً مستعداً لبدء المناسك.',
    detailEn:
      'Make intention for Umrah at the Miqat ("Labbayka Allahumma Umrah") and recite the Talbiyah until reaching Masjid al-Haram.',
    duaAr: '«لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الحَمْدَ وَالنِّعْمَةَ لَكَ وَالمُلْكَ، لا شَرِيكَ لَكَ»',
    duaEn: '"Here I am O Allah, here I am..."',
  },
  {
    id: 'tour-enter-gate',
    stepNumber: 2,
    phaseAr: '٢. دخول المسجد الحرام',
    phaseEn: '2. Entering the Haram',
    titleAr: '2. الدخول من باب الملك فهد (79) نحو المطاف',
    titleEn: '2. Entering via King Fahd Gate (79)',
    gateId: 'gate-79',
    ritualMode: 'gate-entry',
    overlay: 'tawaf',
    durationSec: 10,
    tipAr: 'شاهد المعتمر يدخل بالقدم اليمنى عابراً الأروقة المقوّسة متجهاً إلى صحن المطاف.',
    tipEn: 'Watch the pilgrim enter with the right foot through the arched colonnades toward the Mataf.',
    detailAr:
      'يُستحب تقديم القدم اليمنى عند دخول المسجد الحرام وقطع التلبية عند رؤية الكعبة المشرفة، والاتجاه بهدوء وسكينة نحو صحن الطواف.',
    detailEn:
      'Step in with the right foot reciting the Mosque entry dua and pause the Talbiyah upon seeing the Holy Kaaba.',
    duaAr: '«بِسْمِ اللَّهِ وَالصَّلاةُ وَالسَّلامُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ»',
    duaEn: '"In the name of Allah... O Allah, open for me the gates of Your mercy."',
  },
  {
    id: 'tour-black-stone',
    stepNumber: 3,
    phaseAr: '٣. استلام الحجر الأسود',
    phaseEn: '3. Black Stone Start',
    titleAr: '3. محاذاة الحجر الأسود وبداية الطواف (الاضطباع)',
    titleEn: '3. Aligning with the Black Stone & Idtiba',
    landmarkId: 'black-stone',
    ritualMode: 'black-stone',
    overlay: 'tawaf',
    durationSec: 12,
    tipAr: 'يضطبع الرجل (يكشف الكتف الأيمن) ويستقبل الحجر الأسود عند الخط الأخضر لبدء الشوط الأول.',
    tipEn: 'Men uncover the right shoulder (Idtiba) and face the Black Stone at the green line to start.',
    detailAr:
      'يقف المعتمر محاذياً للحجر الأسود والخط الإرشادي، يستلمه إن تيسر دون زحام، وإلا يشير إليه بيده اليمنى قائلاً هذا الذكر.',
    detailEn:
      'Stand aligned with the Black Stone corner, touch/kiss if clear or raise your hands toward it reciting this supplication.',
    duaAr:
      'بِسْمِ اللهِ، وَاللهُ أَكْبَرُ، اللَّهُمَّ إِيمَانًا بِكَ، وَتَصْدِيقًا بِكِتَابِكَ، وَوَفَاءً بِعَهْدِكَ، وَاتِّبَاعًا لِسُنَّةِ نَبِيِّكَ مُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ.',
    duaEn:
      '"In the name of Allah, and Allah is the Greatest. O Allah, out of faith in You, belief in Your Book, fulfillment of Your covenant, and following the Sunnah of Your Prophet Muhammad ﷺ."',
  },
  {
    id: 'tour-tawaf-7',
    stepNumber: 4,
    phaseAr: '٤. الطواف ٧ أشواط',
    phaseEn: '4. 7 Tawaf Circuits',
    titleAr: '4. أشواط الطواف السبعة حول الكعبة (خارج الحِجر)',
    titleEn: '4. Performing the 7 Tawaf Circuits around the Kaaba',
    landmarkId: 'kaaba',
    ritualMode: 'tawaf-7',
    overlay: 'tawaf',
    durationSec: 118,
    tipAr: 'مسار الـ 7 أشواط مرسوم بالكامل حول الكعبة وخارج حِجر إسماعيل؛ رَمَلٌ في الأشواط ٣ الأولى.',
    tipEn: 'All 7 counter-clockwise circuits are drawn around the Kaaba outside Hijr Ismail (Ramal in laps 1-3).',
    detailAr:
      'يطوف 7 أشواط كاملة عكس عقارب الساعة والكعبة عن يساره، مع الرمل (إسراع المشي) للرجال في الأشواط الثلاثة الأولى، والمرور خارج حِجر إسماعيل، واستلام الركن اليماني.',
    detailEn:
      'Complete 7 counter-clockwise circuits keeping the Kaaba on your left and walking outside Hijr Ismail. Men walk briskly (Ramal) in the first 3 circuits.',
    duaAr: 'بين الركن اليماني والحجر الأسود: ﴿ رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ ﴾',
    duaEn: '"Our Lord, give us good in this world and good in the Hereafter and protect us from the Fire."',
  },
  {
    id: 'tour-maqam',
    stepNumber: 5,
    phaseAr: '٥. ركعتا الطواف',
    phaseEn: '5. Prayer at Maqam Ibrahim',
    titleAr: '5. صلاة ركعتين خلف مقام إبراهيم عليه السلام',
    titleEn: '5. Two Rak\'ahs behind Maqam Ibrahim',
    landmarkId: 'maqam-ibrahim',
    ritualMode: 'maqam-prayer',
    overlay: 'tawaf',
    durationSec: 12,
    tipAr: 'بعد إتمام الشوط السابع يغطي الرجل كتفه الأيمن ويصلي ركعتين خلف المقام باتجاه الكعبة.',
    tipEn: 'After the 7th circuit, cover the right shoulder and pray 2 rak\'ahs behind Maqam Ibrahim.',
    detailAr:
      'يُصلي المعتمر ركعتين خفيفتين خلف مقام إبراهيم (أو في أي موضع من الحرم إن اشتد الزحام)، يقرأ في الأولى بالكافرون وفي الثانية بالإخلاص.',
    detailEn:
      'Pray two brief rak\'ahs behind Maqam Ibrahim (or anywhere in the Haram if crowded), reciting Surah Al-Kafirun and Al-Ikhlas.',
    duaAr: '﴿ وَاتَّخِذُوا مِن مَّقَامِ إِبْرَاهِيمَ مُصَلًّى ﴾',
    duaEn: '"And take the standing place of Ibrahim as a place of prayer."',
  },
  {
    id: 'tour-zamzam',
    stepNumber: 6,
    phaseAr: '٦. الشرب من زمزم',
    phaseEn: '6. Drinking Zamzam',
    titleAr: '6. الشرب من ماء زمزم المبارك والدعاء',
    titleEn: '6. Drinking Zamzam Water & Supplication',
    landmarkId: 'zamzam',
    ritualMode: 'zamzam',
    overlay: 'none',
    durationSec: 19,
    tipAr: 'يتجه إلى مشارب زمزم فيتضلع من مائها المبارك ويدعو، ثم يسلك المسار نحو جبل الصفا في المسعى.',
    tipEn: 'Drink Zamzam water with dua, then follow the path heading east toward Mount Safa.',
    detailAr:
      'ماء زمزم لما شُرب له؛ يُسن التضلع منه مع الدعاء بالعلم النافع والرزق الواسع والشفاء، ثم التوجه عبر الممر الموضّح شرقاً إلى جبل الصفا لبدء السعي.',
    detailEn:
      'Drink Zamzam water abundantly while making dua, then follow the illuminated route east into Al-Mas\'a toward Mount Safa to begin Sa\'i.',
    duaAr: '«اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْماً نَافِعاً، وَرِزْقاً وَاسِعاً، وَشِفَاءً مِنْ كُلِّ دَاءٍ»',
    duaEn: '"O Allah, I ask You for beneficial knowledge, abundant provision, and healing from every ailment."',
  },
  {
    id: 'tour-safa-start',
    stepNumber: 7,
    phaseAr: '٧. الوقوف على الصفا',
    phaseEn: '7. Ascending Mount Safa',
    titleAr: '7. الدخول إلى جبل الصفا واستقبال الكعبة لبدء السعي',
    titleEn: '7. Entering Mount Safa & Facing the Kaaba',
    landmarkId: 'safa-mount',
    ritualMode: 'safa-dua',
    overlay: 'sai',
    durationSec: 21,
    tipAr: 'داخل منصة جبل الصفا؛ يستقبل الكعبة ويرفع يديه ويكبّر ويهلّل ويدعو ثلاث مرات قبل الانطلاق.',
    tipEn: 'Inside Mount Safa gallery: face the Kaaba, raise hands, praise Allah & supplicate 3 times.',
    detailAr:
      'عند الدنو من الصفا أول مرة يقرأ: ﴿إِنَّ الصَّفَا وَالْمَرْوَةَ مِن شَعَائِرِ اللَّهِ...﴾ ثم يرقى عليه مستقبلاً الكعبة فيقول هذا الذكر ثلاث مرات ويدعو بينها.',
    detailEn:
      'Upon approaching Safa for the first time recite Ayah 2:158, then face the Qiblah, declare Allah\'s greatness and recite this dhikr three times with dua.',
    duaAr:
      'اللهُ أَكْبَرُ، اللهُ أَكْبَرُ، اللهُ أَكْبَرُ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ، أَنْجَزَ وَعْدَهُ، وَنَصَرَ عَبْدَهُ، وَهَزَمَ الْأَحْزَابَ وَحْدَهُ.',
    duaEn:
      '"Allahu Akbar (3x). There is no god worthy of worship except Allah alone, with no partner; to Him belongs dominion and praise, and He is over all things Omnipotent..." (3 times)',
  },
  {
    id: 'tour-sai-7',
    stepNumber: 8,
    phaseAr: '٨. السعي ٧ أشواط',
    phaseEn: '8. 7 Laps of Sa\'i',
    titleAr: '8. الأشواط السبعة بين الصفا والمروة والميلين الأخضرين',
    titleEn: '8. Performing 7 Sa\'i Laps inside Al-Mas\'a',
    landmarkId: 'safa-marwah',
    ritualMode: 'sai-7',
    overlay: 'sai',
    durationSec: 235,
    tipAr: 'منظور علوي شامل للمسعى ومساراته السبعة: يهرول بين الميلين الأخضرين في النصف الأول (جهة الصفا) ويتوقف عند الصفا والمروة في كل شوط للذكر ثلاث مرات.',
    tipEn: 'Full overhead view of the 7 Sa\'i lanes: brisk pace between the green markers in the Safa half, stopping at Safa & Marwah on every lap for the 3x dhikr.',
    detailAr:
      'من الصفا إلى المروة شوط، ومن المروة إلى الصفا شوط، فيُتم 7 أشواط. يهرول الرجل بين الميلين الأخضرين الواقعين في النصف الأول من المسعى جهة الصفا ويدعو أثناء السعي، ويتوقف عند بلوغ الصفا والمروة في كل شوط للذكر ثلاث مرات.',
    detailEn:
      'Safa to Marwah is 1 lap and Marwah to Safa is 1 lap (total 7). Men jog briskly between the green lights located in the first half toward Safa and stop upon reaching Safa and Marwah on each lap to recite the dhikr three times.',
    duaAr: 'أدعية وأذكار مستحبة',
    duaEn: 'Recommended Supplications & Remembrance',
  },
  {
    id: 'tour-marwah-tahallul',
    stepNumber: 9,
    phaseAr: '٩. المروة والتحلل',
    phaseEn: '9. Marwah & Tahallul',
    titleAr: '9. بلوغ جبل المروة وإتمام السعي والتحلل (الحلق أو التقصير)',
    titleEn: '9. Completing Sa\'i at Marwah & Tahallul',
    landmarkId: 'marwah-mount',
    ritualMode: 'marwah-tahallul',
    overlay: 'sai',
    durationSec: 24,
    tipAr: 'عند انتهاء الشوط السابع على المروة يقف مستقبلاً الكعبة ويكبّر ويهلّل ثلاث مرات، ثم يحلق أو يقصر وبذلك تكتمل عمرته المباركة.',
    tipEn: 'Complete the 7th lap at Marwah facing the Kaaba reciting the dhikr 3 times, then shave or trim hair to complete Umrah.',
    detailAr:
      'يقف على المروة مستقبلاً القبلة يقول الذكر ثلاث مرات ويدعو مثل ما دعا على الصفا، ثم يتحلل الرجل بحلق الرأس (وهو الأفضل) أو التقصير من جميع الرأس، وتقص المرأة قدر أنملة.',
    detailEn:
      'Face the Kaaba at Marwah and recite the dhikr three times with supplication as at Safa; men then shave or trim hair evenly, and women trim a fingertip length.',
    duaAr:
      'اللهُ أَكْبَرُ، اللهُ أَكْبَرُ، اللهُ أَكْبَرُ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ، أَنْجَزَ وَعْدَهُ، وَنَصَرَ عَبْدَهُ، وَهَزَمَ الْأَحْزَابَ وَحْدَهُ.',
    duaEn:
      '"Allahu Akbar (3x). There is no god worthy of worship except Allah alone... He fulfilled His promise, gave victory to His servant, and defeated the confederates alone." (3 times)',
  },
];

