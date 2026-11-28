import type { TestimonyItem } from './tenPromisedCardsData';

export interface CompanionTabsExtraPatch {
  specialSkillsAr: string[];
  specialSkillsEn: string[];
  uniqueDistinctionsAr: string[];
  uniqueDistinctionsEn: string[];
  majorBattlesAr: string[];
  majorBattlesEn: string[];
  hadithsAndQuotesAr: { hadith: string; source: string }[];
  hadithsAndQuotesEn: { hadith: string; source: string }[];
  titlesAndHonorsAr: string[];
  titlesAndHonorsEn: string[];
  testimoniesAr: string[];
  testimoniesEn: string[];
  extraTestimonies: TestimonyItem[];
  majorAchievementsAr: string[];
  majorAchievementsEn: string[];
  civilizationalImpactAr: string[];
  civilizationalImpactEn: string[];
  inspirationalLessonsAr: string[];
  inspirationalLessonsEn: string[];
  spiritualLessonsAr: string[];
  spiritualLessonsEn: string[];
  leadershipLessonsAr: string[];
  leadershipLessonsEn: string[];
  modernApplicationAr: string[];
  modernApplicationEn: string[];
}

export const TABS_LISTS_EXTRA_PART1: Record<string, CompanionTabsExtraPatch> = {
  // 1. أبو بكر الصديق
  'abu-bakr': {
    specialSkillsAr: ['تعبير الرؤى والبصيرة الروحية'],
    specialSkillsEn: ['Dream interpretation & spiritual insight'],
    uniqueDistinctionsAr: ['الوحيد من الصحابة الذي أمَّ النبيُّ ﷺ خلفه في مرض وفاته إقراراً لإمامته.'],
    uniqueDistinctionsEn: ['Uniquely chosen by the Prophet ﷺ to lead congregational prayers during his final illness.'],
    majorBattlesAr: ['بعثة الحج عام 9 هـ: أمَّره النبي ﷺ أميراً على الحج، وبعث معه براءة لتطهير البيت الحرام من الشرك.'],
    majorBattlesEn: ['Pilgrimage Leadership (9 AH): Appointed Commander of Hajj to declare Makkah sanctuary of pure monotheism.'],
    hadithsAndQuotesAr: [
      {
        hadith: '«يَا أَبَا بَكْرٍ، أَمَا تَرْضَى أَنَّكَ كُنْتَ مَعِي فِي الْغَارِ، وَصَاحِبِي عَلَى الْحَوْضِ»',
        source: 'أخرجه الترمذي في المناقب'
      },
      {
        hadith: '«مَا طَلَعَتِ الشَّمْسُ وَلَا غَرَبَتْ عَلَى أَحَدٍ بَعْدَ النَّبِيِّينَ وَالْمُرْسَلِينَ أَفْضَلَ مِنْ أَبِي بَكْرٍ»',
        source: 'أثر مشهور عن الصحابة في فضل الصديق'
      }
    ],
    hadithsAndQuotesEn: [
      {
        hadith: '"O Abu Bakr, are you not pleased that you were my companion in the cave and will be my companion at the Pond?"',
        source: 'Narrated by At-Tirmidhi'
      },
      {
        hadith: '"The sun has neither risen nor set upon anyone better than Abu Bakr after the Prophets and Messengers."',
        source: 'Celebrated Consensus of the Companions'
      }
    ],
    titlesAndHonorsAr: ['المُبرَّأ من فوق سبع سماوات بالصُّحبة المنصوصة في سورة التوبة.'],
    titlesAndHonorsEn: ['Vindicated from above seven heavens as the Prophet\'s explicit Companion in Surah At-Tawbah.'],
    testimoniesAr: [
      'قال علي بن أبي طالب رضي الله عنه يوم الجمل: «لو كنا نرى لأحد بعد رسول الله ﷺ فضلاً على أبي بكر لقدمناه، هو خير هذه الأمة بعد نبيها».',
      'قال عمرو بن العاص: سألت النبي ﷺ أي الناس أحب إليك؟ قال: عائشة، قلت من الرجال؟ قال: «أبوها».',
      'قال حسان بن ثابت رضي الله عنه: «وثاني اثنين في الغار المنيف وقد طاف العدو به إذ صعد الجبلا».'
    ],
    testimoniesEn: [
      'Ali ibn Abi Talib testified: "Abu Bakr is the best of this entire Ummah after its Prophet ﷺ."',
      'Amr ibn Al-As asked the Prophet ﷺ who was dearest to him among men, and he replied: "Her father (Abu Bakr)."',
      'Hassan ibn Thabit immortalized in poetry: "The second of the two in the lofty Cave as enemies circled the mountain."'
    ],
    extraTestimonies: [
      {
        speakerAr: 'عبد الله بن مسعود رضي الله عنه',
        speakerEn: 'Abdullah ibn Masud',
        quoteAr: '«لقد قمنا بعد رسول الله ﷺ مقاماً كدنا نهلك فيه لولا أن الله مَنَّ علينا بأبي بكر».',
        quoteEn: '"After the Messenger of Allah ﷺ, we stood on a precipice where we nearly perished had Allah not blessed us with Abu Bakr."'
      },
      {
        speakerAr: 'أبو الدرداء رضي الله عنه',
        speakerEn: 'Abu Ad-Darda',
        quoteAr: '«أمر رسول الله ﷺ أبا بكر أن يصلي بالناس، فوالله ما قدَّموه إلا لعظم حقه وسبقه».',
        quoteEn: '"The Prophet ﷺ ordered Abu Bakr to lead prayers, proving his unmatched seniority and merit."'
      },
      {
        speakerAr: 'أم المؤمنين عائشة رضي الله عنها',
        speakerEn: 'Aisha (Mother of the Believers)',
        quoteAr: '«ما غبطتُ أحداً بغبطتي أبا بكر يوم قال فيه رسول الله: لا يبقينَّ في المسجد خوخة إلا خوخة أبي بكر».',
        quoteEn: '"I admired no honor more than when the Prophet ﷺ ordered every door to the mosque closed except Abu Bakr\'s."'
      }
    ],
    majorAchievementsAr: ['إرساء نظام تقاسم الأعباء الدستورية والمشاورة الجماعية مع كبار الصحابة منذ اليوم الأول للخلافة.'],
    majorAchievementsEn: ['Institutionalized collective Shura consultation and constitutional accountability from day one of the Caliphate.'],
    civilizationalImpactAr: ['توثيق النص القرآني بين دفتين ليكون المرجع المعصوم المحفوظ للأمة عبر العصور.'],
    civilizationalImpactEn: ['Preserved the complete Quranic text in a single authoritative codex for all future generations.'],
    inspirationalLessonsAr: ['بذل المال والنفس بسخاء في لحظات التأسيس الحرجة دون انتظار عائد دنيوي.'],
    inspirationalLessonsEn: ['Investing wealth and life wholeheartedly during foundational crises without seeking worldly return.'],
    spiritualLessonsAr: [
      'المداومة على الجمع بين أنواع القربات في يوم واحد: الصيام والصدقة وعيادة المريض واتباع الجنائز.',
      'التصديق الفوري بالوحي دون تردد أو جدال عقلي متكبر.'
    ],
    spiritualLessonsEn: [
      'Combining diverse daily acts of devotion: fasting, charity, visiting the sick, and attending funerals.',
      'Immediate conviction in revelation without arrogant hesitation.'
    ],
    leadershipLessonsAr: [
      'الثبات المطلق على الثوابت الشرعية وإن تراجع الجميع في لحظات الاضطراب.',
      'انتقاء القادة الأكفاء وتحديد المهام بدقة كإرسال خالد بن الوليد وعكرمة وأسامة.'
    ],
    leadershipLessonsEn: [
      'Unwavering resolve on foundational principles even when consensus trembles during crises.',
      'Strategic delegation to competent commanders with crystal-clear mission mandates.'
    ],
    modernApplicationAr: [
      'اعتماد مبدأ الشفافية والمحاسبة الذاتية في الإدارة الحديثة لقوله: "إذا أسأتُ فقوّموني".',
      'المبادرة في الإنفاق الخيري والمشاريع الوقفية التي تحفظ المجتمع وقت الأزمات.'
    ],
    modernApplicationEn: [
      'Embedding transparent accountability in modern leadership: "If I err, correct me."',
      'Proactive philanthropic investment that stabilizes communities during economic shocks.'
    ]
  },

  // 2. عمر بن الخطاب
  'umar-ibn-khattab': {
    specialSkillsAr: ['استشراف المستقبل وإلهام الموافقات القرآنية'],
    specialSkillsEn: ['Visionary foresight & Quranic-aligned discernment'],
    uniqueDistinctionsAr: ['مَن وضع التأريخ الهجري ليؤرخ للأمة انطلاقتها الحضارية المستقلة بالهجرة النبوية.'],
    uniqueDistinctionsEn: ['Instituted the Islamic Hijri calendar, anchoring civilization to the Prophetic Migration.'],
    majorBattlesAr: [
      'الفتح الميداني لبيت المقدس (16 هـ): تسلَّم مفاتيح القدس شخصياً وكتب العهدة العمرية التاريخية.',
      'فتح مصر (20 هـ): أمدَّ عمرو بن العاص بقيادة الزبير والمقداد ليؤمّن جناح الدولة الإسلامية.'
    ],
    majorBattlesEn: [
      'Peaceful Reception of Jerusalem (16 AH): Personally received the city keys and authored the Covenant of Umar.',
      'Liberation of Egypt (20 AH): Directed strategic reinforcements to secure the western Mediterranean flank.'
    ],
    hadithsAndQuotesAr: [
      {
        hadith: '«أَشَدُّ أُمَّتِي فِي أَمْرِ اللَّهِ عُمَرُ»',
        source: 'أخرجه الترمذي وابن ماجه وأحمد'
      },
      {
        hadith: '«لَوْ كَانَ بَعْدِي نَبِيٌّ لَكَانَ عُمَرَ بْنَ الْخَطَّابِ»',
        source: 'أخرجه الترمذي وحسنه'
      }
    ],
    hadithsAndQuotesEn: [
      {
        hadith: '"The firmest of my Ummah regarding the command of Allah is Umar."',
        source: 'Narrated by At-Tirmidhi, Ibn Majah, and Ahmad'
      },
      {
        hadith: '"Were there to be a Prophet after me, it would have been Umar ibn Al-Khattab."',
        source: 'Narrated by At-Tirmidhi'
      }
    ],
    titlesAndHonorsAr: [
      'المُلهَم المُحدَّث الذي يوافق ربه في آيات قرآنية كريمة.',
      'صاحب الفتوحات العظيمة ومُرسِّخ دولة المؤسسات والعدل.'
    ],
    titlesAndHonorsEn: [
      'The Divinely Inspired (Muhaddath) whose counsel preceded several Quranic revelations.',
      'Architect of Islamic state institutions, administrative courts, and universal welfare.'
    ],
    testimoniesAr: [
      'قال علي بن أبي طالب رضي الله عنه: «كنا أصحاب محمد لا نبعد أن السكينة تنطق على لسان عمر».',
      'قال سعد بن أبي وقاص: «إن عمر ليُصلح في بيته كما يُصلح في منبره، ما خاف لومة لائم».',
      'قال حذيفة بن اليمان عند مقتله: «لقد كسر بموت عمر ركن الإسلام، وثُلِمت ثلمة لا تُرتق إلى يوم القيامة».'
    ],
    testimoniesEn: [
      'Ali ibn Abi Talib stated: "We used to say that Divine serenity speaks directly upon the tongue of Umar."',
      'Saad ibn Abi Waqqas noted: "Umar kept his private conduct as spotless as his public pulpit."',
      'Hudhayfah lamented upon his martyrdom: "With Umar\'s passing, a breach opened in Islam\'s fortress."'
    ],
    extraTestimonies: [
      {
        speakerAr: 'أبو بكر الصديق رضي الله عنه',
        speakerEn: 'Abu Bakr As-Siddiq',
        quoteAr: '«ما على ظهر الأرض رجل أحب إلي من عمر، ولقد استخلفته لكم وأنا أعلمكم به».',
        quoteEn: '"No man on earth is dearer or more capable to me than Umar; I appointed him knowing his worth best."'
      },
      {
        speakerAr: 'عبد الله بن مسعود رضي الله عنه',
        speakerEn: 'Abdullah ibn Masud',
        quoteAr: '«إن إسلام عمر كان فتحاً، وإن هجرته كانت نصراً، وإن إمارته كانت رحمة».',
        quoteEn: '"Umar\'s conversion was a breakthrough, his migration a victory, and his rule a mercy."'
      },
      {
        speakerAr: 'سعد بن معاذ وسعيد بن المسيب',
        speakerEn: 'Sa\'id ibn Al-Musayyib',
        quoteAr: '«كان عمر أعظم مصلح في الأمة بعد الصديق؛ جمع بين الهيبة والرحمة بالضعفاء».',
        quoteEn: '"Umar was the supreme reformer of the nation after Abu Bakr, uniting majesty with mercy for the weak."'
      }
    ],
    majorAchievementsAr: ['إطلاق نظام الضمان الاجتماعي الشامل للرضع والفقراء وأهل الذمة العاجزين من بيت المال.'],
    majorAchievementsEn: ['Launched universal social welfare stipends supporting infants, orphans, elders, and needy non-Muslim citizens.'],
    civilizationalImpactAr: ['ترسيخ استقلال القضاء وفصل السلطة التنفيذية عن المراقبة المالية عبر نظام "من أين لك هذا؟".'],
    civilizationalImpactEn: ['Institutionalized judicial independence and mandatory asset-auditing of public officials.'],
    inspirationalLessonsAr: ['الحرص على محاسبة النفس والولاة يومياً، وعدم التمييز بين قريب وبعيد في الحق.'],
    inspirationalLessonsEn: ['Daily self-scrutiny and zero-nepotism enforcement across every stratum of governance.'],
    spiritualLessonsAr: [
      'الخوف الصادق من الله عز وجل في الخلوة أشد من الخوف في العلانية.',
      'البكاء عند سماع آيات الوعيد واستحضار عظمة الوقوف بين يدي الله.'
    ],
    spiritualLessonsEn: [
      'Private awe of Allah stronger than any public display of devotion.',
      'Softness of heart when hearing divine warnings of accountability.'
    ],
    leadershipLessonsAr: [
      'النزول الميداني لتفقد أحوال الرعية ليلاً وعدم الاكتفاء بتقارير الولاة.',
      'صيانة حقوق الإنسان وتجريم التعسف الإداري في كل الأقاليم.'
    ],
    leadershipLessonsEn: [
      'Direct field inspection of citizens\' needs rather than relying solely on official memos.',
      'Codifying civil rights and prosecuting administrative abuse across all provinces.'
    ],
    modernApplicationAr: [
      'تطبيق مبادئ الحوكمة والرقابة المالية الصارمة وإقرار الذمة المالية للمسؤولين.',
      'إنشاء صناديق التكافل والرعاية الاجتماعية التي تحفظ كرامة الفئات الهشة.'
    ],
    modernApplicationEn: [
      'Enforcing public asset disclosures and anti-corruption audits for government executives.',
      'Designing social safety nets that guarantee basic human dignity for vulnerable households.'
    ]
  },

  // 3. عثمان بن عفان
  'uthman-ibn-affan': {
    specialSkillsAr: ['هندسة المشروعات الوقفية الكبرى المستدامة'],
    specialSkillsEn: ['Architecting perpetual public endowments (Waqf)'],
    uniqueDistinctionsAr: ['تبرع بآبار المياه والوسائل اللوجستية التي أنقذت المدينة وجيوش الحدود في أشد العسرات.'],
    uniqueDistinctionsEn: ['Financed vital urban water access and entire frontier supply lines during extreme hardship.'],
    majorBattlesAr: [
      'بيعة الرضوان بالحديبية (6 هـ): كان سفيراً للنبي ﷺ في قريش وبايع النبي عن عثمان بيده الشريفة.',
      'فتح إفريقية وقبرص والبحر المتوسط (27–31 هـ): قاد التوسع البحري والبري الأول غرباً وشرقاً في عهده.'
    ],
    majorBattlesEn: [
      'Embassy of Hudaybiyyah (6 AH): Served as the Prophet\'s envoy; the Prophet ﷺ pledged on Uthman\'s behalf with his own hand.',
      'Naval Expansion & Cyprus/North Africa (27–31 AH): Authorized the first Mediterranean fleet and North African campaigns.'
    ],
    hadithsAndQuotesAr: [
      {
        hadith: '«مَا ضَرَّ عُثْمَانَ مَا عَمِلَ بَعْدَ الْيَوْمِ»',
        source: 'أخرجه الترمذي وأحمد يوم تجهيز جيش العسرة'
      },
      {
        hadith: '«اللَّهُمَّ إِنِّي قَدْ رَضِيتُ عَنْ عُثْمَانَ فَارْضَ عَنْهُ»',
        source: 'رواه ابن سعد في الطبقات والبيهقي'
      }
    ],
    hadithsAndQuotesEn: [
      {
        hadith: '"Nothing Uthman does after today can harm him!"',
        source: 'Narrated by At-Tirmidhi and Ahmad (Tabuk Expedition)'
      },
      {
        hadith: '"O Allah, I am pleased with Uthman, so be pleased with him."',
        source: 'Recorded by Ibn Sa\'d and Al-Bayhaqi'
      }
    ],
    titlesAndHonorsAr: [
      'الصحابي الذي بايع له النبي ﷺ بإحدى يديه الشريفتين تحت الشجرة.',
      'مُجهِّز جيش العسرة بآلاف الدنانير ومئات الإبل والخيول.'
    ],
    titlesAndHonorsEn: [
      'Represented by the Prophet\'s own right hand during the Pledge of Ar-Ridwan.',
      'Chief Financer of the Tabuk Expedition during the Hour of Hardship.'
    ],
    testimoniesAr: [
      'قال أنس بن مالك: «ما رأينا أحداً أرحم باليتامى والأرامل ولا أشد حياءً من عثمان بن عفان».',
      'قال عبد الله بن سلام يوم الدار: «والله لئن قتلتموه لا تلتئمون ولا تصلون جميعاً أبداً».',
      'قال أبو هريرة: «اشترى عثمان الجنة من رسول الله ﷺ مرتين: يوم بئر رومة ويوم جيش العسرة».'
    ],
    testimoniesEn: [
      'Anas ibn Malik remarked: "We never knew anyone more tender to orphans or deeply modest than Uthman."',
      'Abdullah ibn Salam warned the besiegers: "If you slay him, unity will shatter among you."',
      'Abu Hurayrah noted: "Uthman bought Paradise from the Messenger of Allah ﷺ twice: at Rumah Well and Tabuk."'
    ],
    extraTestimonies: [
      {
        speakerAr: 'رسول الله ﷺ',
        speakerEn: 'Prophet Muhammad ﷺ',
        quoteAr: '«أَلَا أَسْتَحِي مِنْ رَجُلٍ تَسْتَحِي مِنْهُ الْمَلَائِكَةُ!»',
        quoteEn: '"Should I not feel shy before a man before whom even the angels feel shy?"'
      },
      {
        speakerAr: 'زيد بن ثابت رضي الله عنه',
        speakerEn: 'Zayd ibn Thabit',
        quoteAr: '«جمع عثمان الأمة على مصحف واحد فأطفأ به أعظم باب للفرقة والخلاف في القراءة».',
        quoteEn: '"Uthman united the Ummah upon one Quranic codex, extinguishing future textual division forever."'
      },
      {
        speakerAr: 'الحسن البصري رحمه الله',
        speakerEn: 'Al-Hasan Al-Basri',
        quoteAr: '«كان عثمان يُطعم الناس طعام الإمارة ويدخل بيته فيأكل الخل والزيت».',
        quoteEn: '"Uthman served state banquets to citizens while eating vinegar and olive oil quietly at home."'
      }
    ],
    majorAchievementsAr: [
      'إنشاء ميناء جدة البحري لخدمة حجاج بيت الله الحرام وتطوير موانئ التجارة الإسلامية.',
      'تأمين الموارد المالية الدائمة للمجتمع بفضل وقف بئر رومة الذي لا يزال أثره قائماً.'
    ],
    majorAchievementsEn: [
      'Designated Jeddah as Makkah\'s main maritime port to facilitate pilgrim transport and commerce.',
      'Established the enduring Waqf endowment of the Rumah Well whose legacy persists centuries later.'
    ],
    civilizationalImpactAr: ['تأسيس الملاحة البحرية الإسلامية المنظمة وحماية السواحل الإسلامية من الإغارات البيزنطية.'],
    civilizationalImpactEn: ['Built organized maritime defense safeguarding Mediterranean coastlines against imperial raids.'],
    inspirationalLessonsAr: ['الحرص على حقن دماء المسلمين حتى ولو أدى ذلك إلى التضحية بالنفس حفاظاً على وحدة الصف.'],
    inspirationalLessonsEn: ['Prioritizing communal peace and refusing bloodshed even at the cost of personal martyrdom.'],
    spiritualLessonsAr: [
      'الحياء خلق نبيل يحفظ القلب من الوقوع في الدنايا والآثام.',
      'المواظبة على تلاوة القرآن ليلاً والتأنس بكلام الله في المحن والشدائد.'
    ],
    spiritualLessonsEn: [
      'Modesty (Haya) as an inner spiritual shield elevating character above vulgarity.',
      'Finding profound solace in late-night Quran recitation even amid intense political turmoil.'
    ],
    leadershipLessonsAr: [
      'حسم الخلافات المرجعية مبكراً بتوحيد المصحف للحفاظ على هوية الأمة.',
      'إعطاء الأولوية للمشاريع التنموية والبنية التحتية مثل المياه والموانئ والمساجد.'
    ],
    leadershipLessonsEn: [
      'Resolving foundational textual divergences early to preserve shared identity.',
      'Investing strategically in long-term infrastructure: water systems, harbors, and houses of worship.'
    ],
    modernApplicationAr: [
      'دعم الأوقاف الخيرية المستدامة في التعليم والمياه والصحة العامة.',
      'تغليب لغة السلم والحوار في الأزمات الداخلية وتجنب التصعيد.'
    ],
    modernApplicationEn: [
      'Funding perpetual endowments (Awqaf) for clean water, literacy, and public infrastructure.',
      'Practicing de-escalation and non-violent restraint during internal organizational crises.'
    ]
  },

  // 4. علي بن أبي طالب
  'ali-ibn-abi-talib': {
    specialSkillsAr: ['حفظ التوازن بين الحزم العسكري والرحمة بالمخالفين'],
    specialSkillsEn: ['Balancing military decisiveness with chivalry toward opponents'],
    uniqueDistinctionsAr: ['قضى بأعقد المعضلات الفقهية والقضائية فكان عمر يستعيذ بالله من معضلة ليس لها أبو الحسن.'],
    uniqueDistinctionsEn: ['Resolved the toughest judicial dilemmas; Umar sought refuge in Allah from crises without Ali\'s counsel.'],
    majorBattlesAr: [
      'غزوة حنين (8 هـ): ثبت مع نفر يسير حول النبي ﷺ حين تفرقت الجموع تحت وابل النبال.',
      'سرية اليمن وبعثة القضاء (10 هـ): أرسله النبي ﷺ لليمن داعياً وقاضياً فأسلمت همدان في يوم واحد.'
    ],
    majorBattlesEn: [
      'Battle of Hunayn (8 AH): Stood shoulder-to-shoulder shielding the Prophet ﷺ during the initial ambush.',
      'Mission to Yemen (10 AH): Dispatched as judge and envoy; the entire Hamdan tribe accepted Islam in one day.'
    ],
    hadithsAndQuotesAr: [
      {
        hadith: '«لَأُعْطِيَنَّ الرَّايَةَ غَدًا رَجُلًا يُحِبُّ اللَّهَ وَرَسُولَهُ وَيُحِبُّهُ اللَّهُ وَرَسُولُهُ، يَفْتَحُ اللَّهُ عَلَى يَدَيْهِ»',
        source: 'متفق عليه (البخاري ومسلم) يوم خيبر'
      },
      {
        hadith: '«أَنْتَ مِنِّي وَأَنَا مِنْكَ»',
        source: 'أخرجه البخاري في الصلح'
      }
    ],
    hadithsAndQuotesEn: [
      {
        hadith: '"Tomorrow I shall hand the banner to a man who loves Allah and His Messenger, and whom Allah and His Messenger love."',
        source: 'Agreed Upon (Al-Bukhari & Muslim) at Khaybar'
      },
      {
        hadith: '"You are from me, and I am from you."',
        source: 'Narrated by Sahih Al-Bukhari'
      }
    ],
    titlesAndHonorsAr: [
      'أقضى الأمة وأحد كبار كتّاب الوحي والعهود النبوية.',
      'المُؤتمن على رد أمانات قريش لأصحابها ليلة الهجرة النبوية.'
    ],
    titlesAndHonorsEn: [
      'Foremost Jurist of the Companions and premier scribe of prophetic treaties.',
      'Entrusted with returning all Makkan deposits safely on the night of Hijrah.'
    ],
    testimoniesAr: [
      'قال عبد الله بن عباس: «أُعطي علي بن أبي طالب تسعة أعشار العلم، والله لقد شاركهم في العُشر الباقي».',
      'قال سعيد بن المسيب: «ما كان أحد من الصحابة يقول: سلوني، إلا علي بن أبي طالب».',
      'قال معاوية بن أبي سفيان لضرار الضمري صف لي علياً، فلما وصفه بالعلم والشجاعة والعبادة بكى معاوية وقال: «رحم الله أبا الحسن كان والله كذلك».'
    ],
    testimoniesEn: [
      'Ibn Abbas affirmed: "Ali was granted nine-tenths of all knowledge, and shared fully in the remaining tenth."',
      'Sa\'id ibn Al-Musayyib observed: "No Companion dared say \'Ask me anything\' except Ali ibn Abi Talib."',
      'Mu\'awiyah wept hearing Dirar describe Ali\'s valor and nocturnal devotion, saying: "May Allah have mercy on Abu Al-Hasan; he was truly so."'
    ],
    extraTestimonies: [
      {
        speakerAr: 'رسول الله ﷺ',
        speakerEn: 'Prophet Muhammad ﷺ',
        quoteAr: '«أَمَا تَرْضَى أَنْ تَكُونَ مِنِّي بِمَنْزِلَةِ هَارُونَ مِنْ مُوسَى إِلَّا أَنَّهُ لَا نَبِيَّ بَعْدِي!»',
        quoteEn: '"Are you not pleased to hold the same rank with me that Aaron held with Moses, save that there is no Prophet after me?"'
      },
      {
        speakerAr: 'سلمان الفارسي رضي الله عنه',
        speakerEn: 'Salman Al-Farsi',
        quoteAr: '«أقضانا وأعلمنا بمقاصد الكتاب والسنة علي بن أبي طالب».',
        quoteEn: '"Our keenest judge and deepest connoisseur of the Quran and Sunnah is Ali ibn Abi Talib."'
      },
      {
        speakerAr: 'أبو سعيد الخدري رضي الله عنه',
        speakerEn: 'Abu Sa\'id Al-Khudri',
        quoteAr: '«كنا نعرف المنافقين ببغضهم لعلي بن أبي طالب».',
        quoteEn: '"We used to identify hypocrites strictly by their malice toward Ali ibn Abi Talib."'
      }
    ],
    majorAchievementsAr: [
      'نقل مركز الثقل الإداري والعلمي إلى الكوفة وتحويلها إلى حاضرة كبرى للفقه واللغة والحديث.',
      'إرساء وثيقة المساواة والمواطنة والحوكمة الأخلاقية في عهده التاريخي لمالك الأشتر.'
    ],
    majorAchievementsEn: [
      'Transformed Kufah into a vibrant intellectual metropolis for jurisprudence, linguistics, and Hadith.',
      'Authored the landmark constitutional Charter of Governance in his letter to Malik Al-Ashtar.'
    ],
    civilizationalImpactAr: ['تطوير المدرسة الفكرية والبلاغية العربية وتأسيس علوم المعاني والآداب الإسلامية.'],
    civilizationalImpactEn: ['Laid foundational cornerstones for Arabic linguistic grammar, rhetoric, and Islamic ethics.'],
    inspirationalLessonsAr: ['أن العلم الحقيقي يثمر تواضعاً وخشية ورحمة حتى في أوقات القوة والقدرة.'],
    inspirationalLessonsEn: ['Demonstrating that genuine knowledge yields humility, reverence, and mercy even at the height of power.'],
    spiritualLessonsAr: [
      'الزهد القلبي مع مباشرة مسؤوليات الأمة العظمى دون أن تفتن الدنيا قلبه.',
      'العبادة الليلية العميقة والمناجاة المليئة بالتسليم والشكر لله.'
    ],
    spiritualLessonsEn: [
      'Inner spiritual detachment while carrying the heaviest public responsibilities.',
      'Deep nocturnal devotion filled with gratitude and submission to the Creator.'
    ],
    leadershipLessonsAr: [
      'إنصاف الخصوم والالتزام بأخلاقيات الحرب والسلام حتى في الفتن الداخلية.',
      'بناء منظومة القضاء على التثبت والتحقيق لا على الظنون والأهواء.'
    ],
    leadershipLessonsEn: [
      'Upholding humane rules of engagement and refusing vengeance even toward political rivals.',
      'Anchoring judicial verdicts on rigorous verification rather than rumor or bias.'
    ],
    modernApplicationAr: [
      'تعزيز سيادة القانون ومبدأ المساواة الإنسانية بين المواطنين جميعاً.',
      'الجمع بين التأصيل العلمي والقدوة الأخلاقية في مواقع القيادة والتعليم.'
    ],
    modernApplicationEn: [
      'Championing universal rule of law and civil dignity for every member of society.',
      'Uniting intellectual excellence with personal ethical integrity in modern institutions.'
    ]
  },

  // 5. طلحة بن عبيد الله
  'talha-ibn-ubaydillah': {
    specialSkillsAr: ['حماية الضعفاء وإغاثة الملهوفين دون سؤال أو منّ'],
    specialSkillsEn: ['Discreet relief for distressed families without pride'],
    uniqueDistinctionsAr: ['تسمى باسمه "يوم أحد" لثباته الأسطوري وفدائه النبي ﷺ بأربع وعشرين طعنة.'],
    uniqueDistinctionsEn: ['The Battle of Uhud became known as "Talha\'s Day" after he absorbed dozens of blows shielding the Prophet ﷺ.'],
    majorBattlesAr: [
      'حراسة النبي ﷺ في غزوة ذات الرقاع والأحزاب والحديبية حتى نال وسام الشهيد الحي.',
      'شراؤه بئر الحسي (بئر طلحة) بالمدينة وإطعام الناس في غزوة العسرة وبذله للركائب والمؤونة.'
    ],
    majorBattlesEn: [
      'Stood constant frontline guard for the Prophet ﷺ across Uhud, Khandaq, and Hudaybiyyah.',
      'Purchased wells and provisioned expeditions tirelessly throughout the Madinah campaigns.'
    ],
    hadithsAndQuotesAr: [
      {
        hadith: '«طَلْحَةُ الْفَيَّاضُ، وَطَلْحَةُ الْخَيْرِ، وَطَلْحَةُ الْجُودِ»',
        source: 'ألقاب أطلقها عليه النبي ﷺ في مواطن العطاء والجود'
      },
      {
        hadith: '«لَقَدْ رَأَيْتُنِي يَوْمَ أُحُدٍ وَمَا فِي الْأَرْضِ قَرِيبٌ مِنِّي غَيْرُ جِبْرِيلَ عَنْ يَمِينِي وَطَلْحَةَ عَنْ يَسَارِي»',
        source: 'ورد في السيرة والمناقب لثباته الأسطوري'
      },
      {
        hadith: '«مَا أُبَالِي أَيُّ رَجُلَيَّ سَلِمَ؛ طَلْحَةُ وَفَى بِنَذْرِهِ»',
        source: 'تفسير قوله تعالى: (مِنْهُمْ مَنْ قَضَى نَحْبَهُ) - أخرجه الترمذي'
      }
    ],
    hadithsAndQuotesEn: [
      {
        hadith: '"Talha the Munificent, Talha the Virtuous, Talha the Overflowing with Generosity."',
        source: 'Prophetic titles bestowed upon him'
      },
      {
        hadith: '"At Uhud, none stood closest to shield me except Jibril on my right and Talha on my left."',
        source: 'Recorded in Prophetic Siyar & Merits'
      },
      {
        hadith: '"Talha is among those who have fulfilled their covenant while still walking upon the earth."',
        source: 'Narrated by At-Tirmidhi (Commentary on Al-Ahzab: 23)'
      }
    ],
    titlesAndHonorsAr: [
      'أحد الثمانية السابقين الأولين إلى الإسلام على يد الصديق أبي بكر.',
      'سابق قوافل البرّ وكافل فقراء بني تيم وأهل المدينة المنورة.'
    ],
    titlesAndHonorsEn: [
      'One of the earliest eight converts guided to Islam by Abu Bakr As-Siddiq.',
      'Tireless patron of orphans, widows, and indebted families throughout Madinah.'
    ],
    testimoniesAr: [
      'قال عمر بن الخطاب لطلحة والزبير وسعد وعبد الرحمن: «إنكم رؤوس الناس وقادتهم في الشورى».',
      'قال قبيصة بن جابر: «صحبت طلحة بن عبيد الله فما رأيت أحداً أعطى لجزيل من غير مسألة منه».',
      'قال الزبير بن العوام يوم أحد: «والله ما استطاع أحد أن يصنع يوم أحد ما صنع طلحة دفاعاً عن النبي ﷺ».'
    ],
    testimoniesEn: [
      'Umar ibn Al-Khattab affirmed to the Shura council: "You are the undisputed leaders and elders of the community."',
      'Qabisah ibn Jabir attested: "I never saw anyone give massive fortunes without even being asked like Talha."',
      'Az-Zubayr testified: "No warrior matched Talha\'s selfless defense of the Prophet ﷺ on the slopes of Uhud."'
    ],
    extraTestimonies: [
      {
        speakerAr: 'عمر بن الخطاب رضي الله عنه',
        speakerEn: 'Umar ibn Al-Khattab',
        quoteAr: '«توفي رسول الله ﷺ وهو عنكم راضٍ، يا معشر أهل الشورى».',
        quoteEn: '"The Messenger of Allah ﷺ passed away completely pleased with you, O members of the Shura council."'
      },
      {
        speakerAr: 'جابر بن عبد الله رضي الله عنه',
        speakerEn: 'Jabir ibn Abdullah',
        quoteAr: '«وقى طلحةُ رسولَ الله ﷺ يوم أحد بنفسه حتى شُلَّت يده، فأوجب الله له الجنة».',
        quoteEn: '"Talha shielded the Messenger of Allah ﷺ at Uhud with his own body until his hand was paralyzed, earning Paradise."'
      },
      {
        speakerAr: 'زوجته سعدى بنت عوف المرية',
        speakerEn: 'His Wife Su\'da bint Awf',
        quoteAr: '«ما رأيته قط مهموماً إلا من همِّ كيف يصل مالٌ إلى فقراء عشيرته قبل أن يبيت عنده».',
        quoteEn: '"I never saw him troubled except by the worry of distributing wealth to needy relatives before nightfall."'
      }
    ],
    majorAchievementsAr: [
      'ضمان السلم المجتمعي والتكافل العائلي بتكفل ديون عشيرته وزواج شبابها وإطعام أسرها.',
      'توسيع التجارة الحلال بين الشام والحجاز واستثمار أرباحها في بناء مساجد ومرافق المدينة.'
    ],
    majorAchievementsEn: [
      'Underwrote family debts, marriages, and daily sustenance across entire clans in Madinah.',
      'Built thriving ethical trade corridors between Syria and Hijaz to fund social welfare.'
    ],
    civilizationalImpactAr: ['تأسيس نموذج الرأسمالية الرحيمة التي تنفق المال لحظة تحصيله لتحريك الاقتصاد الخيري.'],
    civilizationalImpactEn: ['Modelled compassionate enterprise where wealth circulates rapidly to uplift struggling households.'],
    inspirationalLessonsAr: ['أن الجسد الفاني يرتفع عند الله إذا بُذل في حماية الرسالة وإغاثة الضعفاء.'],
    inspirationalLessonsEn: ['Physical scars borne in service of truth become eternal badges of spiritual nobility.'],
    spiritualLessonsAr: [
      'تحقيق مقام الشهادة القلبية بالصدق والوفاء بالعهد قبل لقاء الله.',
      'كراهية اكتناز الذهب والفضة وإيثار سعادة الفقراء على متاع النفس.'
    ],
    spiritualLessonsEn: [
      'Attaining the spiritual rank of martyrdom through uncompromising fidelity while alive.',
      'Detesting hoarding and finding genuine peace only after relieving the hungry.'
    ],
    leadershipLessonsAr: [
      'الدفاع الميداني المباشر عن القيادة الرشيدة في لحظات الانهيار والخطر.',
      'الحرص على رأب الصدع وتغليب صوت الصلح عندما تشتعل الخلافات.'
    ],
    leadershipLessonsEn: [
      'Stepping in front of danger personally when collective ranks waver.',
      'Prioritizing reconciliation over escalation when internal conflicts erupt.'
    ],
    modernApplicationAr: [
      'تخصيص جزء ثابت من أرباح الأعمال لدعم تعليم الأيتام وسداد ديون الغارمين.',
      'التطوع المباشر لإغاثة المنكوبين وتوفير الاحتياجات الأساسية قبل سؤالهم.'
    ],
    modernApplicationEn: [
      'Dedicating recurring corporate profits toward orphan scholarships and debt-relief initiatives.',
      'Proactively reaching out to distressed families with dignified support before they must ask.'
    ]
  }
};
