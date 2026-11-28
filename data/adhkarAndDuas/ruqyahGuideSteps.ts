// Ruqyah types and step-by-step guide steps

export interface RuqyahItem {
  id: string;
  type: 'quran' | 'sunnah';
  title: string;
  titleEn: string;
  text: string;
  textEn: string;
  source: string;
  sourceEn: string;
}

export interface RuqyahGuideStep {
  number: number;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
}

export const RUQYAH_GUIDE_STEPS: RuqyahGuideStep[] = [
  {
    "number": 1,
    "titleAr": "الوضوء والطهارة الكاملة:",
    "titleEn": "Complete Ablution (Wudu) & Sincerity:",
    "descAr": "استحضر النية الخالصة لله وحده بأن الشفاء بيده سبحانه، وتوضأ وضوءك للصلاة.",
    "descEn": "Purify your intention solely for Allah knowing that healing is in His Hands alone, and perform complete ablution as for prayer."
  },
  {
    "number": 2,
    "titleAr": "الالتقاء والمسح والنفث:",
    "titleEn": "Cupping Hands, Reciting, Nafth & Wiping:",
    "descAr": "اجمع كفيك واقرأ فيهما سورة الفاتحة وآية الكرسي والمعوذات، ثم انفث فيهما (نفخ خفيف رقيق مع رذاذ يسير) وامسح بهما وجهك ورأسك وما أقبل من جسدك.",
    "descEn": "Cup your hands together and recite Surah Al-Fatihah, Ayat Al-Kursi, and the Mu'awwidhat (Al-Ikhlas, Al-Falaq, An-Nas), then gently blow into them with a fine breath (nafth), and wipe over your face, head, and the front of your body."
  },
  {
    "number": 3,
    "titleAr": "الرقية على الماء وزيت الزيتون:",
    "titleEn": "Ruqyah over Water and Olive Oil:",
    "descAr": "قرّب إناء ماء أو زيت زيتون من فمك أثناء قراءة آيات الرقية الشرعية، ثم انفث فيه بعد الانتهاء، واشرب من الماء وامسح أو ادهن مواضع الألم بزيت الزيتون.",
    "descEn": "Bring a vessel of pure water or olive oil close to your mouth while reciting Ruqyah verses, then breathe lightly into it upon finishing. Drink from the water and apply or massage the oil over areas of pain."
  },
  {
    "number": 4,
    "titleAr": "وضع اليد على موضع الوجع:",
    "titleEn": "Placing the Right Hand on the Place of Pain:",
    "descAr": "وضع يدك اليمنى على موضع الألم من جسدك، وركز قلبك ويقينك على قدرة الله في الشفاء، ثم ردد الأذكار النبوية المقررة.",
    "descEn": "Place your right hand on the location of pain on your body, fix your heart and certitude on Allah's absolute power to heal, then repeat the prescribed Prophetic supplications."
  },
  {
    "number": 5,
    "titleAr": "الاستمرارية والمحافظة:",
    "titleEn": "Consistency & Daily Fortification:",
    "descAr": "كرر الرقية يومياً وخاصة في الصباح والمساء، وحافظ بانتظام على أذكار اليوم والليلة لتبقى في حصن إلهي منيع ومستمر.",
    "descEn": "Repeat the Ruqyah daily, especially in the morning and evening, and consistently maintain your daily morning and evening Adhkar to remain within a steadfast divine fortress."
  }
];
