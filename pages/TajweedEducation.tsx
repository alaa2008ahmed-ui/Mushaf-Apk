import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../context/ThemeContext';
import BottomBar from '../components/BottomBar';
import { getCachedAudioUrl } from '../utils/audioCache';
import { VoiceRecorder } from 'capacitor-voice-recorder';
import { registerBackInterceptor } from '../hooks/useBackButton';

interface TajweedExample {
    id: string;
    fullAyah: string;
    highlightedWord: string;
    audioUrl: string;
    description?: string;
    surah: number;
    ayah: number;
}

interface TajweedQuiz {
    question: string;
    options: string[];
    correctAnswer: number;
}

interface TajweedRule {
    id: string;
    title: string;
    category: string;
    description: string;
    color: string;
    poem: string;
    articulationPoint?: string;
    examples: TajweedExample[];
    quiz: TajweedQuiz;
}

const TAJWEED_RULES: TajweedRule[] = [
    {
        "id": "ghunnah",
        "title": "الغنة",
        "category": "أحكام النون والميم المشددتين",
        "description": "صوت يخرج من الخيشوم، وتكون في النون والميم المشددتين بمقدار حركتين.",
        "color": "#FF69B4",
        "poem": "وَغُنَّ مِيمًا ثُمَّ نُونًا شُدِّدَا .. وَسَمِّ كُلاً حَرْفَ غُنَّةٍ بَدَا",
        "articulationPoint": "الخيشوم (أقصى الأنف من الداخل)",
        "examples": [
            {
                "id": "g1",
                "fullAyah": "قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
                "highlightedWord": "النَّاسِ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/114001.mp3",
                "description": "نون مشددة",
                "surah": 114,
                "ayah": 1
            },
            {
                "id": "g2",
                "fullAyah": "عَمَّ يَتَسَاءَلُونَ",
                "highlightedWord": "عَمَّ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/078001.mp3",
                "description": "ميم مشددة",
                "surah": 78,
                "ayah": 1
            },
            {
                "id": "g3",
                "fullAyah": "فَلَمَّا جَاءَتْ قِيلَ أَهَكَذَا عَرْشُكِ قَالَتْ كَأَنَّهُ هُوَ",
                "highlightedWord": "كَأَنَّهُ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/027042.mp3",
                "description": "نون مشددة",
                "surah": 27,
                "ayah": 42
            },
            {
                "id": "ghunnah_ex_4",
                "fullAyah": "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
                "highlightedWord": "إِنَّ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/002153.mp3",
                "description": "نون مشددة",
                "surah": 2,
                "ayah": 153
            },
            {
                "id": "ghunnah_ex_5",
                "fullAyah": "ثُمَّ لَتُسْأَلُنَّ يَوْمَئِذٍ عَنِ النَّعِيمِ",
                "highlightedWord": "ثُمَّ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/102008.mp3",
                "description": "ميم مشددة",
                "surah": 102,
                "ayah": 8
            }
        ],
        "quiz": {
            "question": "ما هو مقدار الغنة في النون والميم المشددتين؟",
            "options": [
                "حركة واحدة",
                "حركتان",
                "ثلاث حركات",
                "أربع حركات"
            ],
            "correctAnswer": 1
        }
    },
    {
        "id": "ikhfa",
        "title": "الإخفاء الحقيقي",
        "category": "أحكام النون الساكنة والتنوين",
        "description": "النطق بالنون الساكنة أو التنوين بصفة بين الإظهار والإدغام عارياً عن التشديد مع بقاء الغنة.",
        "color": "#4169E1",
        "poem": "وَالرَّابِعُ الإِخْفَاءُ عِنْدَ الْفَاضِلِ .. مِنَ الحُرُوفِ وَاجِبٌ لِلْفَاضِلِ",
        "articulationPoint": "إخفاء النون عند مخرج الحرف الذي يليها",
        "examples": [
            {
                "id": "ik1",
                "fullAyah": "مِنْ شَرِّ مَا خَلَقَ",
                "highlightedWord": "مِنْ شَرِّ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/113002.mp3",
                "surah": 113,
                "ayah": 2
            },
            {
                "id": "ik2",
                "fullAyah": "وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنْزِلَ إِلَيْكَ",
                "highlightedWord": "أُنْزِلَ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/002004.mp3",
                "surah": 2,
                "ayah": 4
            },
            {
                "id": "ik3",
                "fullAyah": "فَتُوبُوا إِلَى بَارِئِكُمْ فَاقْتُلُوا أَنْفُسَكُمْ",
                "highlightedWord": "أَنْفُسَكُمْ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/002054.mp3",
                "surah": 2,
                "ayah": 54
            },
            {
                "id": "ikhfa_ex_4",
                "fullAyah": "أَنْ كَانَ ذَا مَالٍ وَبَنِينَ",
                "highlightedWord": "أَنْ كَانَ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/068014.mp3",
                "description": "إخفاء النون عند الكاف",
                "surah": 68,
                "ayah": 14
            },
            {
                "id": "ikhfa_ex_5",
                "fullAyah": "الَّذِينَ هُمْ عَنْ صَلَاتِهِمْ سَاهُونَ",
                "highlightedWord": "عَنْ صَلَاتِهِمْ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/107005.mp3",
                "description": "إخفاء النون عند الصاد",
                "surah": 107,
                "ayah": 5
            }
        ],
        "quiz": {
            "question": "كم عدد حروف الإخفاء الحقيقي؟",
            "options": [
                "6 حروف",
                "15 حرفاً",
                "4 حروف",
                "حرف واحد"
            ],
            "correctAnswer": 1
        }
    },
    {
        "id": "idgham_ghunnah",
        "title": "إدغام بغنة",
        "category": "أحكام النون الساكنة والتنوين",
        "description": "إدخال النون الساكنة أو التنوين في حروف (ي ن م و) مع الغنة.",
        "color": "#2E8B57",
        "poem": "وَالثَّانِ إِدْغَامٌ بِسِتَّةٍ أَتَتْ .. فِي يَرْمَلُونَ عِنْدَهُمْ قَدْ ثَبَتَتْ\nلَكِنَّهَا قِسْمَانِ قِسْمٌ يُدْغَمَا .. فِيهِ بِغُنَّةٍ بِيَنْمُو عُلِمَا",
        "examples": [
            {
                "id": "ig1",
                "fullAyah": "وَمِنَ النَّاسِ مَنْ يَقُولُ آمَنَّا بِاللَّهِ",
                "highlightedWord": "مَنْ يَقُولُ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/002008.mp3",
                "surah": 2,
                "ayah": 8
            },
            {
                "id": "ig2",
                "fullAyah": "فَمَنْ يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ",
                "highlightedWord": "فَمَنْ يَعْمَلْ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/099007.mp3",
                "surah": 99,
                "ayah": 7
            },
            {
                "id": "ig3",
                "fullAyah": "وَمَا لَكُمْ مِنْ دُونِ اللَّهِ مِنْ وَلِيٍّ وَلَا نَصِيرٍ",
                "highlightedWord": "وَلِيٍّ وَلَا",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/002107.mp3",
                "surah": 2,
                "ayah": 107
            },
            {
                "id": "idgham_ghunnah_ex_4",
                "fullAyah": "تَبَّتْ يَدَا أَبِي لَهَبٍ وَتَبَّ",
                "highlightedWord": "لَهَبٍ وَتَبَّ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/111001.mp3",
                "description": "إدغام التنوين في الواو",
                "surah": 111,
                "ayah": 1
            },
            {
                "id": "idgham_ghunnah_ex_5",
                "fullAyah": "وُجُوهٌ يَوْمَئِذٍ نَاعِمَةٌ",
                "highlightedWord": "وُجُوهٌ يَوْمَئِذٍ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/088008.mp3",
                "description": "إدغام التنوين في الياء",
                "surah": 88,
                "ayah": 8
            }
        ],
        "quiz": {
            "question": "ما هي الكلمة التي تجمع حروف الإدغام بغنة؟",
            "options": [
                "يرملون",
                "ينمو",
                "قطب جد",
                "أخي هاك"
            ],
            "correctAnswer": 1
        }
    },
    {
        "id": "idgham_no_ghunnah",
        "title": "إدغام بغير غنة",
        "category": "أحكام النون الساكنة والتنوين",
        "description": "إدخال النون الساكنة أو التنوين في حرفي (ل ر) بدون غنة.",
        "color": "#2E8B57",
        "poem": "وَالثَّانِ إِدْغَامٌ بِغَيْرِ غُنَّةْ .. فِي اللاَّمِ وَالرَّا ثُمَّ كَرِّرَنَّهْ",
        "examples": [
            {
                "id": "in1",
                "fullAyah": "أُولَئِكَ عَلَى هُدًى مِنْ رَبِّهِمْ",
                "highlightedWord": "مِنْ رَبِّهِمْ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/002005.mp3",
                "surah": 2,
                "ayah": 5
            },
            {
                "id": "in2",
                "fullAyah": "قَيِّمًا لِيُنْذِرَ بَأْسًا شَدِيدًا مِنْ لَدُنْهُ",
                "highlightedWord": "مِنْ لَدُنْهُ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/018002.mp3",
                "surah": 18,
                "ayah": 2
            },
            {
                "id": "in3",
                "fullAyah": "إِنَّ اللَّهَ غَفُورٌ رَحِيمٌ",
                "highlightedWord": "غَفُورٌ رَحِيمٌ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/002173.mp3",
                "surah": 2,
                "ayah": 173
            },
            {
                "id": "idgham_no_ghunnah_ex_4",
                "fullAyah": "وَيْلٌ لِكُلِّ هُمَزَةٍ لُمَزَةٍ",
                "highlightedWord": "وَيْلٌ لِكُلِّ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/104001.mp3",
                "description": "إدغام التنوين في اللام",
                "surah": 104,
                "ayah": 1
            },
            {
                "id": "idgham_no_ghunnah_ex_5",
                "fullAyah": "سَلَامٌ قَوْلًا مِنْ رَبٍّ رَحِيمٍ",
                "highlightedWord": "رَبٍّ رَحِيمٍ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/036058.mp3",
                "description": "إدغام النون في الراء",
                "surah": 36,
                "ayah": 58
            }
        ],
        "quiz": {
            "question": "ما هي حروف الإدغام بغير غنة؟",
            "options": [
                "ي ، و",
                "ل ، ر",
                "م ، ن",
                "ء ، هـ"
            ],
            "correctAnswer": 1
        }
    },
    {
        "id": "iqlab",
        "title": "الإقلاب",
        "category": "أحكام النون الساكنة والتنوين",
        "description": "قلب النون الساكنة أو التنوين ميماً مخفاة بغنة عند ملاقاتها لحرف الباء.",
        "color": "#808080",
        "poem": "وَالثَّالِثُ الإِقْلَابُ عِنْدَ الْبَاءِ .. مِيمًا بِغُنَّةٍ مَعَ الإِخْفَاءِ",
        "articulationPoint": "انطباق الشفتين انطباقاً خفيفاً لنطق الميم",
        "examples": [
            {
                "id": "iq1",
                "fullAyah": "الَّذِينَ يَنْقُضُونَ عَهْدَ اللَّهِ مِنْ بَعْدِ مِيثَاقِهِ",
                "highlightedWord": "مِنْ بَعْدِ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/002027.mp3",
                "surah": 2,
                "ayah": 27
            },
            {
                "id": "iq2",
                "fullAyah": "قَالَ يَا آدَمُ أَنْبِئْهُمْ بِأَسْمَائِهِمْ",
                "highlightedWord": "أَنْبِئْهُمْ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/002033.mp3",
                "surah": 2,
                "ayah": 33
            },
            {
                "id": "iq3",
                "fullAyah": "سُبْحَانَ الَّذِي أَسْرَى بِعَبْدِهِ لَيْلًا مِنَ الْمَسْجِدِ الْحَرَامِ إِلَى الْمَسْجِدِ الْأَقْصَى الَّذِي بَارَكْنَا حَوْلَهُ لِنُرِيَهُ مِنْ آيَاتِنَا إِنَّهُ هُوَ السَّمِيعُ الْبَصِيرُ",
                "highlightedWord": "السَّمِيعُ الْبَصِيرُ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/017001.mp3",
                "surah": 17,
                "ayah": 1
            },
            {
                "id": "iqlab_ex_4",
                "fullAyah": "كَلَّا لَيُنْبَذَنَّ فِي الْحُطَمَةِ",
                "highlightedWord": "لَيُنْبَذَنَّ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/104004.mp3",
                "description": "قلب النون ميماً عند الباء",
                "surah": 104,
                "ayah": 4
            },
            {
                "id": "iqlab_ex_5",
                "fullAyah": "كَانَ النَّاسُ أُمَّةً وَاحِدَةً ... مِنْ بَعْدِ مَا جَاءَتْهُمُ الْبَيِّنَاتُ",
                "highlightedWord": "مِنْ بَعْدِ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/002213.mp3",
                "description": "قلب النون ميماً عند الباء",
                "surah": 2,
                "ayah": 213
            }
        ],
        "quiz": {
            "question": "متى يحدث الإقلاب؟",
            "options": [
                "عند مجيء حرف الميم بعد النون",
                "عند مجيء حرف الباء بعد النون الساكنة أو التنوين",
                "عند الوقف على التنوين",
                "عند التقاء الساكنين"
            ],
            "correctAnswer": 1
        }
    },
    {
        "id": "izhar",
        "title": "الإظهار الحلقي",
        "category": "أحكام النون الساكنة والتنوين",
        "description": "إخراج النون الساكنة أو التنوين من مخرجها بوضوح. حروفه (ء هـ ع ح غ خ).",
        "color": "#000000",
        "poem": "فَالأَوَّلُ الإِظْهَارُ قَبْلَ أَحْرُفِ .. لِلْحَلْقِ سِتٍّ رُتِّبَتْ فَلْتَعْرِفِ\nهَمْزٌ فَهَاءٌ ثُمَّ عَيْنٌ حَاءُ .. مُهْمَلَتَانِ ثُمَّ غَيْنٌ خَاءُ",
        "articulationPoint": "الحلق (أقصى، وسط، وأدنى الحلق)",
        "examples": [
            {
                "id": "iz1",
                "fullAyah": "إِنَّ الَّذِينَ آمَنُوا وَالَّذِينَ هَادُوا وَالنَّصَارَى وَالصَّابِئِينَ مَنْ آمَنَ بِاللَّهِ",
                "highlightedWord": "مَنْ آمَنَ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/002062.mp3",
                "surah": 2,
                "ayah": 62
            },
            {
                "id": "iz2",
                "fullAyah": "يُوصِيكُمُ اللَّهُ فِي أَوْلَادِكُمْ ۖ لِلذَّكَرِ مِثْلُ حَظِّ الْأُنْثَيَيْنِ ۚ ... إِنَّ اللَّهَ كَانَ عَلِيمًا حَكِيمًا",
                "highlightedWord": "عَلِيمًا حَكِيمًا",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/004011.mp3",
                "surah": 4,
                "ayah": 11
            },
            {
                "id": "iz3",
                "fullAyah": "الَّذِي أَطْعَمَهُمْ مِنْ جُوعٍ وَآمَنَهُمْ مِنْ خَوْفٍ",
                "highlightedWord": "مِنْ خَوْفٍ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/106004.mp3",
                "surah": 106,
                "ayah": 4
            },
            {
                "id": "izhar_ex_4",
                "fullAyah": "فَصَلِّ لِرَبِّكَ وَانْحَرْ",
                "highlightedWord": "وَانْحَرْ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/108002.mp3",
                "description": "إظهار النون عند الحاء",
                "surah": 108,
                "ayah": 2
            },
            {
                "id": "izhar_ex_5",
                "fullAyah": "وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ",
                "highlightedWord": "غاسِقٍ إِذا",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/113003.mp3",
                "description": "إظهار التنوين عند الهمزة",
                "surah": 113,
                "ayah": 3
            }
        ],
        "quiz": {
            "question": "لماذا سمي الإظهار بالحلقي؟",
            "options": [
                "لأن حروفه تخرج من الشفتين",
                "لأن حروفه تخرج من الحلق",
                "لأن صوته يشبه الحلق",
                "لأنه يحلق في الفم"
            ],
            "correctAnswer": 1
        }
    },
    {
        "id": "qalqalah",
        "title": "القلقلة",
        "category": "أحكام أخرى",
        "description": "اضطراب الصوت عند النطق بالحرف الساكن. حروفها (قطب جد).",
        "color": "#FF4500",
        "poem": "قَلْقَلَةٌ قُطْبُ جَدٍّ وَاللِّينُ .. وَاوٌ وَيَاءٌ سَكَنَا وَانْفَتَحَا قَبْلَهُمَا",
        "examples": [
            {
                "id": "q1",
                "fullAyah": "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ",
                "highlightedWord": "الْفَلَقِ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/113001.mp3",
                "description": "قلقلة كبرى (عند الوقف)",
                "surah": 113,
                "ayah": 1
            },
            {
                "id": "q2",
                "fullAyah": "وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللَّهِ أَفْوَاجًا",
                "highlightedWord": "يَدْخُلُونَ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/110002.mp3",
                "description": "قلقلة صغرى (في وسط الكلمة)",
                "surah": 110,
                "ayah": 2
            },
            {
                "id": "q3",
                "fullAyah": "وَاللَّهُ مِنْ وَرَائِهِمْ مُحِيطٌ",
                "highlightedWord": "مُحِيطٌ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/085020.mp3",
                "description": "قلقلة كبرى",
                "surah": 85,
                "ayah": 20
            },
            {
                "id": "q4",
                "fullAyah": "خَتَمَ اللَّهُ عَلَى قُلُوبِهِمْ وَعَلَى سَمْعِهِمْ وَعَلَى أَبْصَارِهِمْ غِشَاوَةٌ",
                "highlightedWord": "أَبْصَارِهِمْ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/002007.mp3",
                "description": "قلقلة صغرى",
                "surah": 2,
                "ayah": 7
            },
            {
                "id": "qalqalah_ex_5",
                "fullAyah": "لَقَدْ خَلَقْنَا الْإِنْسَانَ فِي كَبَدٍ",
                "highlightedWord": "لَقَدْ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/090004.mp3",
                "description": "قلقلة صغرى (الدال)",
                "surah": 90,
                "ayah": 4
            }
        ],
        "quiz": {
            "question": "متى تكون القلقلة كبرى؟",
            "options": [
                "إذا كان الحرف في أول الكلمة",
                "إذا كان الحرف ساكناً في وسط الكلمة",
                "عند الوقف على حرف القلقلة",
                "إذا كان الحرف متحركاً"
            ],
            "correctAnswer": 2
        }
    },
    {
        "id": "madd_muttasil",
        "title": "المد المتصل",
        "category": "أحكام المدود",
        "description": "أن يأتي حرف المد وبعده همزة في كلمة واحدة. يمد 4 أو 5 حركات.",
        "color": "#DC143C",
        "poem": "فَوَاجِبٌ إِنْ جَاءَ هَمْزٌ بَعْدَ مَدْ .. فِي كِلْمَةٍ وَذَا بِمُتَّصِلٍ يُعَدْ",
        "examples": [
            {
                "id": "mm1",
                "fullAyah": "أَوْ كَصَيِّبٍ مِنَ السَّمَاءِ فِيهِ ظُلُمَاتٌ وَرَعْدٌ وَبَرْقٌ",
                "highlightedWord": "السَّمَاءِ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/002019.mp3",
                "surah": 2,
                "ayah": 19
            },
            {
                "id": "mm2",
                "fullAyah": "وَأَشْرَقَتِ الْأَرْضُ بِنُورِ رَبِّهَا وَوُضِعَ الْكِتَابُ وَجِيءَ بِالنَّبِيِّينَ",
                "highlightedWord": "وَجِيءَ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/039069.mp3",
                "surah": 39,
                "ayah": 69
            },
            {
                "id": "mm3",
                "fullAyah": "إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ",
                "highlightedWord": "جَاءَ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/110001.mp3",
                "surah": 110,
                "ayah": 1
            },
            {
                "id": "madd_muttasil_ex_4",
                "fullAyah": "إِنَّ الَّذِينَ كَفَرُوا سَوَاءٌ عَلَيْهِمْ أَأَنْذَرْتَهُمْ",
                "highlightedWord": "سَوَاءٌ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/002006.mp3",
                "description": "مد متصل (الهمزة بعد حرف المد في كلمة واحدة)",
                "surah": 2,
                "ayah": 6
            },
            {
                "id": "madd_muttasil_ex_5",
                "fullAyah": "وَأَمَّا السَّائِلَ فَلَا تَنْهَرْ",
                "highlightedWord": "السَّائِلَ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/093010.mp3",
                "description": "مد متصل",
                "surah": 93,
                "ayah": 10
            }
        ],
        "quiz": {
            "question": "ما هو حكم المد المتصل؟",
            "options": [
                "الجواز",
                "الوجوب",
                "اللزوم",
                "الندب"
            ],
            "correctAnswer": 1
        }
    },
    {
        "id": "madd_munfasil",
        "title": "المد المنفصل",
        "category": "أحكام المدود",
        "description": "أن يأتي حرف المد في آخر كلمة والهمزة في أول الكلمة التالية. يمد 2 أو 4 أو 5 حركات.",
        "color": "#DC143C",
        "poem": "وَجَائِزٌ مَدٌّ وَقَصْرٌ إِنْ فُصِلْ .. كُلٌّ بِكِلْمَةٍ وَهَذَا المُنْفَصِلْ",
        "examples": [
            {
                "id": "mn1",
                "fullAyah": "وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنْزِلَ إِلَيْكَ وَمَا أُنْزِلَ مِنْ قَبْلِكَ",
                "highlightedWord": "بِمَا أُنْزِلَ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/002004.mp3",
                "surah": 2,
                "ayah": 4
            },
            {
                "id": "mn2",
                "fullAyah": "يَا أَيُّهَا النَّاسُ اعْبُدُوا رَبَّكُمُ",
                "highlightedWord": "يَا أَيُّهَا",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/002021.mp3",
                "surah": 2,
                "ayah": 21
            },
            {
                "id": "mn3",
                "fullAyah": "لَا أَعْبُدُ مَا تَعْبُدُونَ",
                "highlightedWord": "لَا أَعْبُدُ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/109002.mp3",
                "surah": 109,
                "ayah": 2
            },
            {
                "id": "madd_munfasil_ex_4",
                "fullAyah": "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ",
                "highlightedWord": "إِنَّا أَعْطَيْنَاكَ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/108001.mp3",
                "description": "مد منفصل",
                "surah": 108,
                "ayah": 1
            },
            {
                "id": "madd_munfasil_ex_5",
                "fullAyah": "قُلْ يَا أَيُّهَا الْكَافِرُونَ",
                "highlightedWord": "يَا أَيُّهَا",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/109001.mp3",
                "description": "مد منفصل",
                "surah": 109,
                "ayah": 1
            }
        ],
        "quiz": {
            "question": "ما هو حكم المد المنفصل؟",
            "options": [
                "الوجوب",
                "اللزوم",
                "الجواز",
                "المنع"
            ],
            "correctAnswer": 2
        }
    },
    {
        "id": "madd_lazim",
        "title": "المد اللازم",
        "category": "أحكام المدود",
        "description": "أن يأتي بعد حرف المد سكون أصلي ثابت وصلاً ووقفاً. يمد 6 حركات.",
        "color": "#DC143C",
        "poem": "وَلَازِمٌ إِنِ السُّكُونُ أُصِّلَا .. وَصْلاً وَوَقْفًا بَعْدَ مَدٍّ طُوِّلَا",
        "examples": [
            {
                "id": "ml1",
                "fullAyah": "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
                "highlightedWord": "الضَّالِّينَ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/001007.mp3",
                "surah": 1,
                "ayah": 7
            },
            {
                "id": "ml2",
                "fullAyah": "الْحَاقَّةُ",
                "highlightedWord": "الْحَاقَّةُ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/069001.mp3",
                "surah": 69,
                "ayah": 1
            },
            {
                "id": "ml3",
                "fullAyah": "آلْآنَ وَقَدْ كُنْتُمْ بِهِ تَسْتَعْجِلُونَ",
                "highlightedWord": "آلْآنَ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/010051.mp3",
                "surah": 10,
                "ayah": 51
            },
            {
                "id": "madd_lazim_ex_4",
                "fullAyah": "فَإِذَا جَاءَتِ الطَّامَّةُ الْكُبْرَى",
                "highlightedWord": "الطَّامَّةُ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/079034.mp3",
                "description": "مد لازم كلمي مثقل",
                "surah": 79,
                "ayah": 34
            },
            {
                "id": "madd_lazim_ex_5",
                "fullAyah": "فَإِذَا جَاءَتِ الصَّاخَّةُ",
                "highlightedWord": "الصَّاخَّةُ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/080033.mp3",
                "description": "مد لازم كلمي مثقل",
                "surah": 80,
                "ayah": 33
            }
        ],
        "quiz": {
            "question": "كم عدد حركات المد اللازم؟",
            "options": [
                "حركتان",
                "أربع حركات",
                "خمس حركات",
                "ست حركات"
            ],
            "correctAnswer": 3
        }
    },
    {
        "id": "madd_arid",
        "title": "المد العارض للسكون",
        "category": "أحكام المدود",
        "description": "أن يأتي بعد حرف المد حرف متحرك يتم تسكينه لأجل الوقف. يمد 2 أو 4 أو 6 حركات.",
        "color": "#DC143C",
        "poem": "وَمِثْلُ ذَا إِنْ عَرَضَ السُّكُونُ .. وَقْفًا كَتَعْلَمُونَ نَسْتَعِينُ",
        "examples": [
            {
                "id": "ma1",
                "fullAyah": "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
                "highlightedWord": "الْعَالَمِينَ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/001002.mp3",
                "surah": 1,
                "ayah": 2
            },
            {
                "id": "ma2",
                "fullAyah": "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
                "highlightedWord": "نَسْتَعِينُ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/001005.mp3",
                "surah": 1,
                "ayah": 5
            },
            {
                "id": "ma3",
                "fullAyah": "أُولَئِكَ عَلَى هُدًى مِنْ رَبِّهِمْ وَأُولَئِكَ هُمُ الْمُفْلِحُونَ",
                "highlightedWord": "الْمُفْلِحُونَ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/002005.mp3",
                "surah": 2,
                "ayah": 5
            },
            {
                "id": "madd_arid_ex_4",
                "fullAyah": "مَالِكِ يَوْمِ الدِّينِ",
                "highlightedWord": "الدِّينِ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/001004.mp3",
                "description": "مد عارض للسكون",
                "surah": 1,
                "ayah": 4
            },
            {
                "id": "madd_arid_ex_5",
                "fullAyah": "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
                "highlightedWord": "نَسْتَعِينُ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/001005.mp3",
                "description": "مد عارض للسكون",
                "surah": 1,
                "ayah": 5
            }
        ],
        "quiz": {
            "question": "متى يحدث المد العارض للسكون؟",
            "options": [
                "عند الوصل دائماً",
                "عند الوقف على الكلمة",
                "في بداية الآية",
                "إذا جاء بعده همزة"
            ],
            "correctAnswer": 1
        }
    },
    {
        "id": "madd_lin",
        "title": "مد اللين",
        "category": "أحكام المدود",
        "description": "أن تأتي الواو أو الياء الساكنة المفتوح ما قبلها وبعدها حرف سكن للوقف.",
        "color": "#DC143C",
        "poem": "وَاللِّينُ مِنْهَا الْيَاءُ وَوَاوٌ سُكِّنَا .. إِنِ انْفِتَاحٌ قَبْلَ كُلٍّ أُعْلِنَا",
        "examples": [
            {
                "id": "mln1",
                "fullAyah": "لِإِيلَافِ قُرَيْشٍ",
                "highlightedWord": "قُرَيْشٍ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/106001.mp3",
                "surah": 106,
                "ayah": 1
            },
            {
                "id": "mln2",
                "fullAyah": "فَلْيَعْبُدُوا رَبَّ هَذَا الْبَيْتِ",
                "highlightedWord": "الْبَيْتِ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/106003.mp3",
                "surah": 106,
                "ayah": 3
            },
            {
                "id": "mln3",
                "fullAyah": "الَّذِي أَطْعَمَهُمْ مِنْ جُوعٍ وَآمَنَهُمْ مِنْ خَوْفٍ",
                "highlightedWord": "خَوْفٍ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/106004.mp3",
                "surah": 106,
                "ayah": 4
            },
            {
                "id": "madd_lin_ex_4",
                "fullAyah": "فَلْيَعْبُدُوا رَبَّ هَذَا الْبَيْتِ",
                "highlightedWord": "الْبَيْتِ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/106003.mp3",
                "description": "مد لين",
                "surah": 106,
                "ayah": 3
            },
            {
                "id": "madd_lin_ex_5",
                "fullAyah": "الَّذِي أَطْعَمَهُمْ مِنْ جُوعٍ وَآمَنَهُمْ مِنْ خَوْفٍ",
                "highlightedWord": "خَوْفٍ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/106004.mp3",
                "description": "مد لين",
                "surah": 106,
                "ayah": 4
            }
        ],
        "quiz": {
            "question": "ما هي حركة الحرف الذي يسبق حرفي اللين (الواو والياء)؟",
            "options": [
                "الكسرة",
                "الضمة",
                "الفتحة",
                "السكون"
            ],
            "correctAnswer": 2
        }
    },
    {
        "id": "madd_silah",
        "title": "مد الصلة",
        "category": "أحكام المدود",
        "description": "مد هاء الضمير للمفرد الغائب المذكر إذا وقعت بين متحركين.",
        "color": "#DC143C",
        "poem": "وَصِلْ هَاءَ ضَمِيرٍ عَنْ سُكُونٍ قَبْلَ مَا .. حُرِّكَ وَاقْصُرْ عَنْ سُكُونٍ جُلِّيَا",
        "examples": [
            {
                "id": "ms1",
                "fullAyah": "إِنَّهُ كَانَ بِعِبَادِهِ خَبِيرًا بَصِيرًا",
                "highlightedWord": "بِعِبَادِهِ خَبِيرًا",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/025020.mp3",
                "description": "صلة صغرى",
                "surah": 25,
                "ayah": 20
            },
            {
                "id": "ms2",
                "fullAyah": "يَحْسَبُ أَنَّ مَالَهُ أَخْلَدَهُ",
                "highlightedWord": "أَخْلَدَهُ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/104003.mp3",
                "description": "صلة كبرى",
                "surah": 104,
                "ayah": 3
            },
            {
                "id": "madd_silah_ex_3",
                "fullAyah": "فَأُمُّهُ هَاوِيَةٌ",
                "highlightedWord": "فَأُمُّهُ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/101009.mp3",
                "description": "صلة صغرى",
                "surah": 101,
                "ayah": 9
            },
            {
                "id": "madd_silah_ex_4",
                "fullAyah": "إِنَّهُ عَلَى رَجْعِهِ لَقَادِرٌ",
                "highlightedWord": "إِنَّهُ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/086008.mp3",
                "description": "صلة صغرى",
                "surah": 86,
                "ayah": 8
            },
            {
                "id": "madd_silah_ex_5",
                "fullAyah": "وَمَا يُغْنِي عَنْهُ مَالُهُ إِذَا تَرَدَّى",
                "highlightedWord": "مَالُهُ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/092011.mp3",
                "description": "صلة صغرى",
                "surah": 92,
                "ayah": 11
            }
        ],
        "quiz": {
            "question": "متى تمد هاء الضمير؟",
            "options": [
                "إذا وقعت بين ساكنين",
                "إذا وقعت بين متحركين",
                "إذا جاء بعدها همزة فقط",
                "دائماً"
            ],
            "correctAnswer": 1
        }
    },
    {
        "id": "madd_badal",
        "title": "مد البدل",
        "category": "أحكام المدود",
        "description": "أن تتقدم الهمزة على حرف المد في كلمة واحدة. يمد حركتين.",
        "color": "#DC143C",
        "poem": "أَوْ قُدِّمَ الْهَمْزُ عَلَى المَدِّ وَذَا .. بَدَلْ كَآمَنُوا وَإِيمَانًا خُذَا",
        "examples": [
            {
                "id": "mb1",
                "fullAyah": "وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا",
                "highlightedWord": "آدَمَ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/002031.mp3",
                "surah": 2,
                "ayah": 31
            },
            {
                "id": "mb2",
                "fullAyah": "وَمِنَ النَّاسِ مَنْ يَتَّخِذُ مِنْ دُونِ اللَّهِ أَنْدَادًا يُحِبُّونَهُمْ كَحُبِّ اللَّهِ وَالَّذِينَ آمَنُوا أَشَدُّ حُبًّا لِلَّهِ",
                "highlightedWord": "آمَنُوا",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/002165.mp3",
                "surah": 2,
                "ayah": 165
            },
            {
                "id": "mb3",
                "fullAyah": "وَلَمَّا جَاءَهُمْ كِتَابٌ مِنْ عِنْدِ اللَّهِ مُصَدِّقٌ لِمَا مَعَهُمْ وَكَانُوا مِنْ قَبْلُ يَسْتَفْتِحُونَ عَلَى الَّذِينَ كَفَرُوا فَلَمَّا جَاءَهُمْ مَا عَرَفُوا كَفَرُوا بِهِ فَلَعْنَةُ اللَّهِ عَلَى الْكَافِرِينَ",
                "highlightedWord": "أُوتُوا",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/002101.mp3",
                "surah": 2,
                "ayah": 101
            },
            {
                "id": "madd_badal_ex_4",
                "fullAyah": "إِيلَافِهِمْ رِحْلَةَ الشِّتَاءِ وَالصَّيْفِ",
                "highlightedWord": "إِيلَافِهِمْ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/106002.mp3",
                "description": "مد بدل",
                "surah": 106,
                "ayah": 2
            },
            {
                "id": "madd_badal_ex_5",
                "fullAyah": "وَالَّذِينَ هَاجَرُوا فِي اللَّهِ مِنْ بَعْدِ مَا ظُلِمُوا ... وَأُوذُوا فِي سَبِيلِي",
                "highlightedWord": "أُوذُوا",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/003195.mp3",
                "description": "مد بدل",
                "surah": 3,
                "ayah": 195
            }
        ],
        "quiz": {
            "question": "ما هو مقدار مد البدل؟",
            "options": [
                "حركة واحدة",
                "حركتان",
                "أربع حركات",
                "ست حركات"
            ],
            "correctAnswer": 1
        }
    },
    {
        "id": "rules_ra",
        "title": "أحكام الراء",
        "category": "التفخيم والترقيق",
        "description": "للراء حالتان: التفخيم (تغليظ الصوت) والترقيق (تنحيف الصوت) حسب حركتها وما قبلها.",
        "color": "#8B4513",
        "poem": "وَرَقِّقِ الرَّاءَ إِذَا مَا كُسِرَتْ .. كَذَاكَ بَعْدَ الْكَسْرِ حَيْثُ سَكَنَتْ",
        "examples": [
            {
                "id": "rr1",
                "fullAyah": "وَإِذْ يَرْفَعُ إِبْرَاهِيمُ الْقَوَاعِدَ مِنَ الْبَيْتِ وَإِسْمَاعِيلُ رَبَّنَا تَقَبَّلْ مِنَّا",
                "highlightedWord": "رَبَّنَا",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/002127.mp3",
                "description": "تفخيم",
                "surah": 2,
                "ayah": 127
            },
            {
                "id": "rr2",
                "fullAyah": "الَّذِي جَعَلَ لَكُمُ الْأَرْضَ فِرَاشًا وَالسَّمَاءَ بِنَاءً وَأَنْزَلَ مِنَ السَّمَاءِ مَاءً فَأَخْرَجَ بِهِ مِنَ الثَّمَرَاتِ رِزْقًا لَكُمْ",
                "highlightedWord": "رِزْقًا",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/002022.mp3",
                "description": "ترقيق",
                "surah": 2,
                "ayah": 22
            },
            {
                "id": "rr3",
                "fullAyah": "وَإِذْ نَجَّيْنَاكُمْ مِنْ آلِ فِرْعَوْنَ يَسُومُونَكُمْ سُوءَ الْعَذَابِ",
                "highlightedWord": "فِرْعَوْنَ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/002049.mp3",
                "description": "ترقيق",
                "surah": 2,
                "ayah": 49
            },
            {
                "id": "rules_ra_ex_4",
                "fullAyah": "وَالْعَصْرِ",
                "highlightedWord": "وَالْعَصْرِ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/103001.mp3",
                "description": "ترقيق الراء عند الوقف",
                "surah": 103,
                "ayah": 1
            },
            {
                "id": "rules_ra_ex_5",
                "fullAyah": "فَهُوَ فِي عِيشَةٍ رَاضِيَةٍ",
                "highlightedWord": "رَاضِيَةٍ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/101007.mp3",
                "description": "تفخيم الراء المفتوحة",
                "surah": 101,
                "ayah": 7
            }
        ],
        "quiz": {
            "question": "متى ترقق الراء؟",
            "options": [
                "إذا كانت مفتوحة",
                "إذا كانت مضمومة",
                "إذا كانت مكسورة",
                "إذا جاء بعدها ألف"
            ],
            "correctAnswer": 2
        }
    },
    {
        "id": "rules_lam",
        "title": "أحكام اللام",
        "category": "التفخيم والترقيق",
        "description": "الأصل في اللام الترقيق، وتفخم في لفظ الجلالة (الله) إذا سبقها فتح أو ضم.",
        "color": "#4B0082",
        "poem": "وَفَخِّمِ اللاَّمَ مِنِ اسْمِ اللَّهِ .. عَنْ فَتْحٍ اوْ ضَمٍّ كَعَبْدُ اللَّهِ",
        "examples": [
            {
                "id": "rl1",
                "fullAyah": "قُلْ هُوَ اللَّهُ أَحَدٌ",
                "highlightedWord": "اللَّهُ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/112001.mp3",
                "description": "تفخيم",
                "surah": 112,
                "ayah": 1
            },
            {
                "id": "rl2",
                "fullAyah": "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ",
                "highlightedWord": "بِسْمِ اللَّهِ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/001001.mp3",
                "description": "ترقيق",
                "surah": 1,
                "ayah": 1
            },
            {
                "id": "rl3",
                "fullAyah": "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
                "highlightedWord": "لِلَّهِ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/001002.mp3",
                "description": "ترقيق",
                "surah": 1,
                "ayah": 2
            },
            {
                "id": "rules_lam_ex_4",
                "fullAyah": "شَهِدَ اللَّهُ أَنَّهُ لَا إِلَهَ إِلَّا هُوَ",
                "highlightedWord": "اللَّهُ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/003018.mp3",
                "description": "تفخيم لام لفظ الجلالة",
                "surah": 3,
                "ayah": 18
            },
            {
                "id": "rules_lam_ex_5",
                "fullAyah": "فِي دِينِ اللَّهِ أَفْوَاجًا",
                "highlightedWord": "اللَّهِ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/110002.mp3",
                "description": "ترقيق لام لفظ الجلالة",
                "surah": 110,
                "ayah": 2
            }
        ],
        "quiz": {
            "question": "متى تفخم لام لفظ الجلالة (الله)؟",
            "options": [
                "إذا سبقها كسر",
                "إذا سبقها فتح أو ضم",
                "دائماً",
                "إذا جاءت في أول الآية فقط"
            ],
            "correctAnswer": 1
        }
    },
    {
        "id": "ikhfa_shafawi",
        "title": "الإخفاء الشفوي",
        "category": "أحكام الميم الساكنة",
        "description": "إخفاء الميم الساكنة مع الغنة بمقدار حركتين إذا جاء بعدها حرف الباء.",
        "color": "#4169E1",
        "poem": "فَالأَوَّلُ الإِخْفَاءُ عِنْدَ الْبَاءِ .. وَسَمِّهِ الشَّفْوِيَّ لِلْقُرَّاءِ",
        "articulationPoint": "انطباق الشفتين انطباقاً خفيفاً",
        "examples": [
            {
                "id": "is1",
                "fullAyah": "تَرْمِيهِمْ بِحِجَارَةٍ مِنْ سِجِّيلٍ",
                "highlightedWord": "تَرْمِيهِمْ بِحِجَارَةٍ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/105004.mp3",
                "surah": 105,
                "ayah": 4
            },
            {
                "id": "is2",
                "fullAyah": "وَمِنَ النَّاسِ مَنْ يَقُولُ آمَنَّا بِاللَّهِ وَبِالْيَوْمِ الْآخِرِ وَمَا هُمْ بِمُؤْمِنِينَ",
                "highlightedWord": "هُمْ بِمُؤْمِنِينَ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/002008.mp3",
                "surah": 2,
                "ayah": 8
            },
            {
                "id": "is3",
                "fullAyah": "إِنَّ رَبَّهُمْ بِهِمْ يَوْمَئِذٍ لَخَبِيرٌ",
                "highlightedWord": "رَبَّهُمْ بِهِمْ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/100011.mp3",
                "surah": 100,
                "ayah": 11
            },
            {
                "id": "ikhfa_shafawi_ex_4",
                "fullAyah": "أَلَمْ يَعْلَمْ بِأَنَّ اللَّهَ يَرَى",
                "highlightedWord": "يَعْلَمْ بِأَنَّ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/096014.mp3",
                "description": "إخفاء شفوي",
                "surah": 96,
                "ayah": 14
            },
            {
                "id": "ikhfa_shafawi_ex_5",
                "fullAyah": "فَبَشِّرْهُمْ بِعَذَابٍ أَلِيمٍ",
                "highlightedWord": "فَبَشِّرْهُمْ بِعَذَابٍ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/084024.mp3",
                "description": "إخفاء شفوي",
                "surah": 84,
                "ayah": 24
            }
        ],
        "quiz": {
            "question": "ما هو الحرف الذي تخفى عنده الميم الساكنة؟",
            "options": [
                "النون",
                "الميم",
                "الباء",
                "الواو"
            ],
            "correctAnswer": 2
        }
    },
    {
        "id": "idgham_shafawi",
        "title": "الإدغام الشفوي",
        "category": "أحكام الميم الساكنة",
        "description": "إدغام الميم الساكنة في ميم متحركة بعدها بحيث تصير ميمًا واحدة مشددة مع الغنة.",
        "color": "#2E8B57",
        "poem": "وَالثَّانِ إِدْغَامٌ بِمِثْلِهَا أَتَى .. وَسَمِّ إِدْغَامًا صَغِيرًا يَا فَتَى",
        "examples": [
            {
                "id": "ids1",
                "fullAyah": "الَّذِي أَطْعَمَهُمْ مِنْ جُوعٍ وَآمَنَهُمْ مِنْ خَوْفٍ",
                "highlightedWord": "أَطْعَمَهُمْ مِنْ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/106004.mp3",
                "surah": 106,
                "ayah": 4
            },
            {
                "id": "ids2",
                "fullAyah": "إِنَّهَا عَلَيْهِمْ مُؤْصَدَةٌ",
                "highlightedWord": "عَلَيْهِمْ مُؤْصَدَةٌ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/104008.mp3",
                "surah": 104,
                "ayah": 8
            },
            {
                "id": "ids3",
                "fullAyah": "فِي قُلُوبِهِمْ مَرَضٌ فَزَادَهُمُ اللَّهُ مَرَضًا",
                "highlightedWord": "قُلُوبِهِمْ مَرَضٌ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/002010.mp3",
                "surah": 2,
                "ayah": 10
            },
            {
                "id": "idgham_shafawi_ex_4",
                "fullAyah": "إِنَّهَا عَلَيْهِمْ مُؤْصَدَةٌ",
                "highlightedWord": "عَلَيْهِمْ مُؤْصَدَةٌ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/104008.mp3",
                "description": "إدغام شفوي",
                "surah": 104,
                "ayah": 8
            },
            {
                "id": "idgham_shafawi_ex_5",
                "fullAyah": "الَّذِي أَطْعَمَهُمْ مِنْ جُوعٍ وَآمَنَهُمْ مِنْ خَوْفٍ",
                "highlightedWord": "آمَنَهُمْ مِنْ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/106004.mp3",
                "description": "إدغام شفوي",
                "surah": 106,
                "ayah": 4
            }
        ],
        "quiz": {
            "question": "ما هو الإدغام الشفوي؟",
            "options": [
                "إدغام الميم في الباء",
                "إدغام الميم في الميم",
                "إدغام النون في الميم",
                "إدغام الميم في الواو"
            ],
            "correctAnswer": 1
        }
    },
    {
        "id": "izhar_shafawi",
        "title": "الإظهار الشفوي",
        "category": "أحكام الميم الساكنة",
        "description": "إظهار الميم الساكنة عند ملاقاتها لأي حرف من حروف الهجاء عدا الميم والباء، ويكون أشد إظهاراً عند الواو والفاء.",
        "color": "#000000",
        "poem": "وَالثَّالِثُ الإِظْهَارُ فِي الْبَقِيَّةْ .. مِنْ أَحْرُفٍ وَسَمِّهَا شَفْوِيَّةْ\nوَاحْذَرْ لَدَى وَاوٍ وَفَا أَنْ تَخْتَفِي .. لِقُرْبِهَا وَالاتِّحَادِ فَاعْرِفِ",
        "examples": [
            {
                "id": "izs1",
                "fullAyah": "أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَابِ الْفِيلِ",
                "highlightedWord": "أَلَمْ تَرَ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/105001.mp3",
                "surah": 105,
                "ayah": 1
            },
            {
                "id": "izs2",
                "fullAyah": "لَكُمْ دِينُكُمْ وَلِيَ دِينِ",
                "highlightedWord": "لَكُمْ دِينُكُمْ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/109006.mp3",
                "surah": 109,
                "ayah": 6
            },
            {
                "id": "izs3",
                "fullAyah": "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ",
                "highlightedWord": "أَنْعَمْتَ عَلَيْهِمْ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/001007.mp3",
                "surah": 1,
                "ayah": 7
            },
            {
                "id": "izhar_shafawi_ex_4",
                "fullAyah": "أَلَمْ يَجْعَلْ كَيْدَهُمْ فِي تَضْلِيلٍ",
                "highlightedWord": "أَلَمْ يَجْعَلْ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/105002.mp3",
                "description": "إظهار شفوي",
                "surah": 105,
                "ayah": 2
            },
            {
                "id": "izhar_shafawi_ex_5",
                "fullAyah": "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ",
                "highlightedWord": "أَنْعَمْتَ عَلَيْهِمْ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/001007.mp3",
                "description": "إظهار شفوي",
                "surah": 1,
                "ayah": 7
            }
        ],
        "quiz": {
            "question": "عند أي الحروف يجب الحذر من إخفاء الميم الساكنة؟",
            "options": [
                "الباء والميم",
                "الواو والفاء",
                "النون والياء",
                "السين والشين"
            ],
            "correctAnswer": 1
        }
    },
    {
        "id": "madd_tabii",
        "title": "المد الطبيعي",
        "category": "أحكام المدود",
        "description": "هو المد الذي لا تقوم ذات الحرف إلا به، ولا يتوقف على سبب من همز أو سكون. يمد حركتين.",
        "color": "#DC143C",
        "poem": "وَالمَدُّ أَصْلِيٌّ وَ فَرْعِيٌّ لَهُ .. وَسَمِّ أَوَّلاً طَبِيعِيًّا وَهُوَ\nمَا لَا تَوَقُّفٌ لَهُ عَلَى سَبَبْ .. وَلَا بِدُونِهِ الحُرُوفُ تُجْتَلَبْ",
        "examples": [
            {
                "id": "mt1",
                "fullAyah": "وَإِذْ قَالَ رَبُّكَ لِلْمَلَائِكَةِ إِنِّي جَاعِلٌ فِي الْأَرْضِ خَلِيفَةً",
                "highlightedWord": "قَالَ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/002030.mp3",
                "surah": 2,
                "ayah": 30
            },
            {
                "id": "mt2",
                "fullAyah": "وَمِنَ النَّاسِ مَنْ يَقُولُ آمَنَّا بِاللَّهِ وَبِالْيَوْمِ الْآخِرِ",
                "highlightedWord": "يَقُولُ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/002008.mp3",
                "surah": 2,
                "ayah": 8
            },
            {
                "id": "mt3",
                "fullAyah": "وَإِذَا قِيلَ لَهُمْ لَا تُفْسِدُوا فِي الْأَرْضِ قَالُوا إِنَّمَا نَحْنُ مُصْلِحُونَ",
                "highlightedWord": "قِيلَ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/002011.mp3",
                "surah": 2,
                "ayah": 11
            },
            {
                "id": "madd_tabii_ex_4",
                "fullAyah": "فِي دِينِ اللَّهِ أَفْوَاجًا",
                "highlightedWord": "دِينِ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/110002.mp3",
                "description": "مد طبيعي",
                "surah": 110,
                "ayah": 2
            },
            {
                "id": "madd_tabii_ex_5",
                "fullAyah": "مَا أَغْنَى عَنْهُ مَالُهُ وَمَا كَسَبَ",
                "highlightedWord": "مَا",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/111002.mp3",
                "description": "مد طبيعي",
                "surah": 111,
                "ayah": 2
            }
        ],
        "quiz": {
            "question": "ما هو مقدار المد الطبيعي؟",
            "options": [
                "حركة واحدة",
                "حركتان",
                "أربع حركات",
                "ست حركات"
            ],
            "correctAnswer": 1
        }
    },
    {
        "id": "madd_iwad",
        "title": "مد العوض",
        "category": "أحكام المدود",
        "description": "التعويض عن تنوين النصب حالة الوقف بألف تمد مقدار حركتين.",
        "color": "#DC143C",
        "poem": "وَمَدُّ عِوَضٍ عَنْ تَنْوِينِ نَصْبٍ .. إِذَا وَقَفْتَ فَامْدُدْهُ كَالطَّبِيعِي",
        "examples": [
            {
                "id": "mi1",
                "fullAyah": "وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللَّهِ أَفْوَاجًا",
                "highlightedWord": "أَفْوَاجًا",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/110002.mp3",
                "surah": 110,
                "ayah": 2
            },
            {
                "id": "mi2",
                "fullAyah": "فَسَبِّحْ بِحَمْدِ رَبِّكَ وَاسْتَغْفِرْهُ إِنَّهُ كَانَ تَوَّابًا",
                "highlightedWord": "تَوَّابًا",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/110003.mp3",
                "surah": 110,
                "ayah": 3
            },
            {
                "id": "mi3",
                "fullAyah": "يُوصِيكُمُ اللَّهُ فِي أَوْلَادِكُمْ ۖ لِلذَّكَرِ مِثْلُ حَظِّ الْأُنْثَيَيْنِ ۚ ... إِنَّ اللَّهَ كَانَ عَلِيمًا حَكِيمًا",
                "highlightedWord": "حَكِيمًا",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/004011.mp3",
                "surah": 4,
                "ayah": 11
            },
            {
                "id": "madd_iwad_ex_4",
                "fullAyah": "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
                "highlightedWord": "يُسْرًا",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/094006.mp3",
                "description": "مد عوض",
                "surah": 94,
                "ayah": 6
            },
            {
                "id": "madd_iwad_ex_5",
                "fullAyah": "وَالْعَادِيَاتِ ضَبْحًا",
                "highlightedWord": "ضَبْحًا",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/100001.mp3",
                "description": "مد عوض",
                "surah": 100,
                "ayah": 1
            }
        ],
        "quiz": {
            "question": "متى يطبق مد العوض؟",
            "options": [
                "عند الوصل",
                "عند الوقف على تنوين النصب",
                "عند الوقف على تنوين الضم",
                "عند الوقف على التاء المربوطة"
            ],
            "correctAnswer": 1
        }
    },
    {
        "id": "isti_la",
        "title": "حروف الاستعلاء",
        "category": "التفخيم والترقيق",
        "description": "الاستعلاء هو ارتفاع أقصى اللسان إلى الحنك الأعلى عند النطق بالحرف، وحروفه مجموعة في (خص ضغط قظ) وهي مفخمة دائماً.",
        "color": "#8B4513",
        "poem": "وَحَرْفَ الِاسْتِعْلَاءِ فَخِّمْ وَاخْصُصَا .. الاِطْبَاقَ أَقْوَى نَحْوَ قَالَ وَالْعَصَا",
        "examples": [
            {
                "id": "ist1",
                "fullAyah": "جَزَاؤُهُمْ عِنْدَ رَبِّهِمْ جَنَّاتُ عَدْنٍ تَجْرِي مِنْ تَحْتِهَا الْأَنْهَارُ خَالِدِينَ فِيهَا أَبَدًا",
                "highlightedWord": "خَالِدِينَ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/098008.mp3",
                "description": "حرف الخاء",
                "surah": 98,
                "ayah": 8
            },
            {
                "id": "ist2",
                "fullAyah": "يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
                "highlightedWord": "الصَّابِرِينَ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/002153.mp3",
                "description": "حرف الصاد",
                "surah": 2,
                "ayah": 153
            },
            {
                "id": "ist3",
                "fullAyah": "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
                "highlightedWord": "الضَّالِّينَ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/001007.mp3",
                "description": "حرف الضاد",
                "surah": 1,
                "ayah": 7
            },
            {
                "id": "isti_la_ex_4",
                "fullAyah": "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ",
                "highlightedWord": "صُدُورِ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/114005.mp3",
                "description": "حرف الصاد",
                "surah": 114,
                "ayah": 5
            },
            {
                "id": "isti_la_ex_5",
                "fullAyah": "وَطُورِ سِينِينَ",
                "highlightedWord": "وَطُورِ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/095002.mp3",
                "description": "حرف الطاء",
                "surah": 95,
                "ayah": 2
            }
        ],
        "quiz": {
            "question": "ما هي الكلمة التي تجمع حروف الاستعلاء (التفخيم)؟",
            "options": [
                "يرملون",
                "قطب جد",
                "خص ضغط قظ",
                "حي طهر"
            ],
            "correctAnswer": 2
        }
    },
    {
        "id": "idgham_mutamathilayn",
        "title": "إدغام المتماثلين",
        "category": "الإدغام العام",
        "description": "أن يتفق الحرفان صفة ومخرجاً، ويكون الأول ساكناً والثاني متحركاً، فيدغمان ليصبحا حرفاً واحداً مشدداً.",
        "color": "#2E8B57",
        "poem": "إِنْ فِي الصِّفَاتِ وَالمَخَارِجِ اتَّفَقْ .. حَرْفَانِ فَالْمِثْلَانِ فِيهِمَا أَحَقْ",
        "examples": [
            {
                "id": "imut1",
                "fullAyah": "وَإِذِ اسْتَسْقَى مُوسَى لِقَوْمِهِ فَقُلْنَا اضْرِبْ بِعَصَاكَ الْحَجَرَ",
                "highlightedWord": "اضْرِبْ بِعَصَاكَ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/002060.mp3",
                "description": "باء ساكنة بعدها باء متحركة",
                "surah": 2,
                "ayah": 60
            },
            {
                "id": "imut2",
                "fullAyah": "وَإِذَا جَاءُوكُمْ قَالُوا آمَنَّا وَقَدْ دَخَلُوا بِالْكُفْرِ وَهُمْ قَدْ خَرَجُوا بِهِ",
                "highlightedWord": "وَقَدْ دَخَلُوا",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/005061.mp3",
                "description": "دال ساكنة بعدها دال متحركة",
                "surah": 5,
                "ayah": 61
            },
            {
                "id": "imut3",
                "fullAyah": "أَيْنَمَا تَكُونُوا يُدْرِكْكُمُ الْمَوْتُ وَلَوْ كُنْتُمْ فِي بُرُوجٍ مُشَيَّدَةٍ",
                "highlightedWord": "يُدْرِكْكُمُ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/004078.mp3",
                "description": "كاف ساكنة بعدها كاف متحركة",
                "surah": 4,
                "ayah": 78
            },
            {
                "id": "idgham_mutamathilayn_ex_4",
                "fullAyah": "فَمَا رَبِحَتْ تِجَارَتُهُمْ",
                "highlightedWord": "رَبِحَتْ تِجَارَتُهُمْ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/002016.mp3",
                "description": "تاء ساكنة بعدها تاء متحركة",
                "surah": 2,
                "ayah": 16
            },
            {
                "id": "idgham_mutamathilayn_ex_5",
                "fullAyah": "أَيْنَمَا تَكُونُوا يُدْرِكْكُمُ الْمَوْتُ",
                "highlightedWord": "يُدْرِكْكُمُ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/004078.mp3",
                "description": "كاف ساكنة بعدها كاف متحركة",
                "surah": 4,
                "ayah": 78
            }
        ],
        "quiz": {
            "question": "ما هما الحرفان المتماثلان؟",
            "options": [
                "الحرفان اللذان اتفقا مخرجاً واختلفا صفة",
                "الحرفان اللذان اتفقا صفة واختلفا مخرجاً",
                "الحرفان اللذان اتفقا مخرجاً وصفة",
                "الحرفان اللذان تقاربا مخرجاً وصفة"
            ],
            "correctAnswer": 2
        }
    },
    {
        "id": "idgham_mutajanisayn",
        "title": "إدغام المتجانسين",
        "category": "الإدغام العام",
        "description": "أن يتفق الحرفان مخرجاً ويختلفا صفة، ويكون الأول ساكناً والثاني متحركاً.",
        "color": "#2E8B57",
        "poem": "وَإِنْ يَكُونَا مَخْرَجًا تَقَارَبَا .. وَفِي الصِّفَاتِ اخْتَلَفَا يُلَقَّبَا\nمُتَقَارِبَيْنِ أَوْ يَكُونَا اتَّفَقَا .. فِي مَخْرَجٍ دُونَ الصِّفَاتِ حُقِّقَا\nبِالْمُتَجَانِسَيْنِ",
        "examples": [
            {
                "id": "imuj1",
                "fullAyah": "وَدَّتْ طَائِفَةٌ مِنْ أَهْلِ الْكِتَابِ لَوْ يُضِلُّونَكُمْ",
                "highlightedWord": "وَدَّتْ طَائِفَةٌ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/003069.mp3",
                "description": "تاء ساكنة بعدها طاء (إدغام كامل)",
                "surah": 3,
                "ayah": 69
            },
            {
                "id": "imuj2",
                "fullAyah": "فَلَمَّا أَثْقَلَتْ دَعَوَا اللَّهَ رَبَّهُمَا",
                "highlightedWord": "أَثْقَلَتْ دَعَوَا",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/007189.mp3",
                "description": "تاء ساكنة بعدها دال (إدغام كامل)",
                "surah": 7,
                "ayah": 189
            },
            {
                "id": "imuj3",
                "fullAyah": "فَمَثَلُهُ كَمَثَلِ الْكَلْبِ إِنْ تَحْمِلْ عَلَيْهِ يَلْهَثْ أَوْ تَتْرُكْهُ يَلْهَثْ ذَلِكَ مَثَلُ الْقَوْمِ",
                "highlightedWord": "يَلْهَثْ ذَلِكَ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/007176.mp3",
                "description": "ثاء ساكنة بعدها ذال (إدغام كامل)",
                "surah": 7,
                "ayah": 176
            },
            {
                "id": "idgham_mutajanisayn_ex_4",
                "fullAyah": "وَلَوْ أَنَّهُمْ إِذْ ظَلَمُوا أَنْفُسَهُمْ جَاءُوكَ",
                "highlightedWord": "إِذْ ظَلَمُوا",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/004064.mp3",
                "description": "ذال ساكنة بعدها ظاء",
                "surah": 4,
                "ayah": 64
            },
            {
                "id": "idgham_mutajanisayn_ex_5",
                "fullAyah": "يَا بُنَيَّ ارْكَبْ مَعَنَا",
                "highlightedWord": "ارْكَبْ مَعَنَا",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/011042.mp3",
                "description": "باء ساكنة بعدها ميم",
                "surah": 11,
                "ayah": 42
            }
        ],
        "quiz": {
            "question": "ما هما الحرفان المتجانسان؟",
            "options": [
                "اتفقا مخرجاً واختلفا صفة",
                "اتفقا صفة واختلفا مخرجاً",
                "تقاربا مخرجاً وصفة",
                "اتفقا مخرجاً وصفة"
            ],
            "correctAnswer": 0
        }
    },
    {
        "id": "idgham_mutaqaribayn",
        "title": "إدغام المتقاربين",
        "category": "الإدغام العام",
        "description": "أن يتقارب الحرفان مخرجاً وصفة، ويكون الأول ساكناً والثاني متحركاً.",
        "color": "#2E8B57",
        "poem": "وَإِنْ يَكُونَا مَخْرَجًا تَقَارَبَا .. وَفِي الصِّفَاتِ اخْتَلَفَا يُلَقَّبَا\nمُتَقَارِبَيْنِ",
        "examples": [
            {
                "id": "imuq1",
                "fullAyah": "وَقُلْ رَبِّ أَدْخِلْنِي مُدْخَلَ صِدْقٍ",
                "highlightedWord": "وَقُلْ رَبِّ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/017080.mp3",
                "description": "لام ساكنة بعدها راء",
                "surah": 17,
                "ayah": 80
            },
            {
                "id": "imuq2",
                "fullAyah": "أَلَمْ نَخْلُقْكُمْ مِنْ مَاءٍ مَهِينٍ",
                "highlightedWord": "نَخْلُقْكُمْ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/077020.mp3",
                "description": "قاف ساكنة بعدها كاف (إدغام كامل أو ناقص)",
                "surah": 77,
                "ayah": 20
            },
            {
                "id": "idgham_mutaqaribayn_ex_3",
                "fullAyah": "بَلْ رَفَعَهُ اللَّهُ إِلَيْهِ",
                "highlightedWord": "بَلْ رَفَعَهُ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/004158.mp3",
                "description": "لام ساكنة بعدها راء",
                "surah": 4,
                "ayah": 158
            },
            {
                "id": "idgham_mutaqaribayn_ex_4",
                "fullAyah": "أَلَمْ نَخْلُقْكُمْ مِنْ مَاءٍ مَهِينٍ",
                "highlightedWord": "نَخْلُقْكُمْ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/077020.mp3",
                "description": "قاف ساكنة بعدها كاف",
                "surah": 77,
                "ayah": 20
            },
            {
                "id": "idgham_mutaqaribayn_ex_5",
                "fullAyah": "وَقُلْ رَبِّ زِدْنِي عِلْمًا",
                "highlightedWord": "وَقُلْ رَبِّ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/020114.mp3",
                "description": "لام ساكنة بعدها راء",
                "surah": 20,
                "ayah": 114
            }
        ],
        "quiz": {
            "question": "ما هما الحرفان المتقاربان؟",
            "options": [
                "اتفقا مخرجاً وصفة",
                "تقاربا مخرجاً وصفة",
                "اتفقا مخرجاً واختلفا صفة",
                "اتفقا صفة واختلفا مخرجاً"
            ],
            "correctAnswer": 1
        }
    },
    {
        "id": "madd_muttasil_2",
        "title": "المد المتصل",
        "category": "أحكام المدود",
        "description": "أن يقع بعد حرف المد همز متصل به في كلمة واحدة. يمد بمقدار 4 أو 5 حركات وجوباً.",
        "color": "#9370DB",
        "poem": "فَوَاجِبٌ إِنْ جَاءَ هَمْزٌ بَعْدَ مَدْ .. فِي كِلْمَةٍ وَذَا بِمُتَّصِلٍ يُعَدْ",
        "examples": [
            {
                "id": "mmut1",
                "fullAyah": "إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ",
                "highlightedWord": "جَاءَ",
                "audioUrl": "https://server8.mp3quran.net/afs/001002.mp3",
                "description": "ألف مد بعدها همزة في كلمة واحدة",
                "surah": 110,
                "ayah": 1
            },
            {
                "id": "madd_muttasil_2_ex_2",
                "fullAyah": "وَالسَّمَاءِ وَالطَّارِقِ",
                "highlightedWord": "وَالسَّمَاءِ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/086001.mp3",
                "description": "مد متصل",
                "surah": 86,
                "ayah": 1
            },
            {
                "id": "madd_muttasil_2_ex_3",
                "fullAyah": "فَإِذَا جَاءَتِ الطَّامَّةُ الْكُبْرَى",
                "highlightedWord": "جَاءَتِ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/079034.mp3",
                "description": "مد متصل",
                "surah": 79,
                "ayah": 34
            },
            {
                "id": "madd_muttasil_2_ex_4",
                "fullAyah": "وَجِيءَ يَوْمَئِذٍ بِجَهَنَّمَ",
                "highlightedWord": "وَجِيءَ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/089023.mp3",
                "description": "مد متصل",
                "surah": 89,
                "ayah": 23
            },
            {
                "id": "madd_muttasil_2_ex_5",
                "fullAyah": "سِيءَ بِهِمْ وَضَاقَ بِهِمْ ذَرْعًا",
                "highlightedWord": "سِيءَ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/011077.mp3",
                "description": "مد متصل",
                "surah": 11,
                "ayah": 77
            }
        ],
        "quiz": {
            "question": "ما هو مقدار مد المتصل؟",
            "options": [
                "حركتان",
                "4 أو 5 حركات وجوباً",
                "6 حركات لزوماً",
                "حركتان أو 4 أو 6"
            ],
            "correctAnswer": 1
        }
    },
    {
        "id": "madd_munfasil_2",
        "title": "المد المنفصل",
        "category": "أحكام المدود",
        "description": "أن يقع بعد حرف المد همز منفصل عنه في الكلمة التي تليها. يمد بمقدار 4 أو 5 حركات جوازاً.",
        "color": "#9370DB",
        "poem": "وَجَائِزٌ مَدٌّ وَقَصْرٌ إِنْ فُصِلْ .. كُلٌّ بِكِلْمَةٍ وَهَذَا المُنْفَصِلْ",
        "examples": [
            {
                "id": "mmun1",
                "fullAyah": "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ",
                "highlightedWord": "إِنَّا أَعْطَيْنَاكَ",
                "audioUrl": "https://server8.mp3quran.net/afs/001003.mp3",
                "description": "ألف مد في آخر الكلمة الأولى وهمزة في أول الثانية",
                "surah": 108,
                "ayah": 1
            },
            {
                "id": "madd_munfasil_2_ex_2",
                "fullAyah": "يَا أَيُّهَا الْكَافِرُونَ",
                "highlightedWord": "يَا أَيُّهَا",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/109001.mp3",
                "description": "مد منفصل",
                "surah": 109,
                "ayah": 1
            },
            {
                "id": "madd_munfasil_2_ex_3",
                "fullAyah": "تَبَّتْ يَدَا أَبِي لَهَبٍ وَتَبَّ",
                "highlightedWord": "يَدَا أَبِي",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/111001.mp3",
                "description": "مد منفصل",
                "surah": 111,
                "ayah": 1
            },
            {
                "id": "madd_munfasil_2_ex_4",
                "fullAyah": "قُوا أَنْفُسَكُمْ وَأَهْلِيكُمْ نَارًا",
                "highlightedWord": "قُوا أَنْفُسَكُمْ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/066006.mp3",
                "description": "مد منفصل",
                "surah": 66,
                "ayah": 6
            },
            {
                "id": "madd_munfasil_2_ex_5",
                "fullAyah": "إِنِّي أَنَا اللَّهُ رَبِّ الْعَالَمِينَ",
                "highlightedWord": "إِنِّي أَنَا",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/028030.mp3",
                "description": "مد منفصل",
                "surah": 28,
                "ayah": 30
            }
        ],
        "quiz": {
            "question": "ما هو حكم المد المنفصل؟",
            "options": [
                "الوجوب",
                "اللزوم",
                "الجواز",
                "المنع"
            ],
            "correctAnswer": 2
        }
    },
    {
        "id": "madd_badal_2",
        "title": "المد البدل",
        "category": "أحكام المدود",
        "description": "أن يتقدم الهمز على حرف المد في كلمة واحدة، وليس بعد حرف المد همز أو سكون. يمد حركتين.",
        "color": "#9370DB",
        "poem": "أَوْ قُدِّمَ الْهَمْزُ عَلَى الْمَدِّ وَذَا .. بَدَلْ كَآمَنُوا وَإِيمَانًا خُذَا",
        "examples": [
            {
                "id": "mbad1",
                "fullAyah": "آمَنَ الرَّسُولُ بِمَا أُنْزِلَ إِلَيْهِ مِنْ رَبِّهِ",
                "highlightedWord": "آمَنَ",
                "audioUrl": "https://server8.mp3quran.net/afs/001004.mp3",
                "description": "همزة تقدمت على الألف",
                "surah": 2,
                "ayah": 285
            },
            {
                "id": "madd_badal_2_ex_2",
                "fullAyah": "لِإِيلَافِ قُرَيْشٍ",
                "highlightedWord": "لِإِيلَافِ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/106001.mp3",
                "description": "مد بدل",
                "surah": 106,
                "ayah": 1
            },
            {
                "id": "madd_badal_2_ex_3",
                "fullAyah": "إِيمَانًا مَعَ إِيمَانِهِمْ",
                "highlightedWord": "إِيمَانًا",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/048004.mp3",
                "description": "مد بدل",
                "surah": 48,
                "ayah": 4
            },
            {
                "id": "madd_badal_2_ex_4",
                "fullAyah": "أُوتُوا الْكِتَابَ",
                "highlightedWord": "أُوتُوا",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/002101.mp3",
                "description": "مد بدل",
                "surah": 2,
                "ayah": 101
            },
            {
                "id": "madd_badal_2_ex_5",
                "fullAyah": "آتَيْنَاكَ سَبْعًا مِنَ الْمَثَانِي",
                "highlightedWord": "آتَيْنَاكَ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/015087.mp3",
                "description": "مد بدل",
                "surah": 15,
                "ayah": 87
            }
        ],
        "quiz": {
            "question": "ما هو المد البدل؟",
            "options": [
                "أن يأتي الهمز بعد حرف المد",
                "أن يتقدم الهمز على حرف المد",
                "أن يأتي سكون بعد حرف المد",
                "أن يأتي شدة بعد حرف المد"
            ],
            "correctAnswer": 1
        }
    },
    {
        "id": "madd_aridh",
        "title": "المد العارض للسكون",
        "category": "أحكام المدود",
        "description": "أن يقع بعد حرف المد حرف سكن سكوناً عارضاً لأجل الوقف. يمد 2 أو 4 أو 6 حركات.",
        "color": "#9370DB",
        "poem": "وَمِثْلُ ذَا إِنْ عَرَضَ السُّكُونُ .. وَقْفًا كَتَعْلَمُونَ نَسْتَعِينُ",
        "examples": [
            {
                "id": "mari1",
                "fullAyah": "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
                "highlightedWord": "الْعَالَمِينَ",
                "audioUrl": "https://server8.mp3quran.net/afs/001005.mp3",
                "description": "الوقف على النون بالسكون العارض وقبلها ياء مد",
                "surah": 1,
                "ayah": 2
            },
            {
                "id": "madd_aridh_ex_2",
                "fullAyah": "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
                "highlightedWord": "نَسْتَعِينُ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/001005.mp3",
                "description": "مد عارض للسكون",
                "surah": 1,
                "ayah": 5
            },
            {
                "id": "madd_aridh_ex_3",
                "fullAyah": "الرَّحْمَٰنِ الرَّحِيمِ",
                "highlightedWord": "الرَّحِيمِ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/001003.mp3",
                "description": "مد عارض للسكون",
                "surah": 1,
                "ayah": 3
            },
            {
                "id": "madd_aridh_ex_4",
                "fullAyah": "مَالِكِ يَوْمِ الدِّينِ",
                "highlightedWord": "الدِّينِ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/001004.mp3",
                "description": "مد عارض للسكون",
                "surah": 1,
                "ayah": 4
            },
            {
                "id": "madd_aridh_ex_5",
                "fullAyah": "مِنَ الْجِنَّةِ وَالنَّاسِ",
                "highlightedWord": "وَالنَّاسِ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/114006.mp3",
                "description": "مد عارض للسكون",
                "surah": 114,
                "ayah": 6
            }
        ],
        "quiz": {
            "question": "متى يحدث المد العارض للسكون؟",
            "options": [
                "عند الوصل دائماً",
                "عند الوقف على الكلمة",
                "في بداية الكلمة",
                "عند التقاء الساكنين"
            ],
            "correctAnswer": 1
        }
    },
    {
        "id": "madd_lazim_2",
        "title": "المد اللازم",
        "category": "أحكام المدود",
        "description": "أن يقع بعد حرف المد سكون أصلي (ثابت وصلاً ووقفاً) في كلمة أو حرف. يمد 6 حركات لزوماً.",
        "color": "#9370DB",
        "poem": "وَلاَزِمٌ إِنِ السُّكُونُ أُصِّلاَ .. وَصْلاً وَوَقْفًا بَعْدَ مَدٍّ طُوِّلاَ",
        "examples": [
            {
                "id": "mlaz1",
                "fullAyah": "وَلَا الضَّالِّينَ",
                "highlightedWord": "الضَّالِّينَ",
                "audioUrl": "https://server8.mp3quran.net/afs/001006.mp3",
                "description": "ألف مد بعدها لام مشددة (سكون أصلي)",
                "surah": 1,
                "ayah": 7
            },
            {
                "id": "madd_lazim_2_ex_2",
                "fullAyah": "الْحَاقَّةُ مَا الْحَاقَّةُ",
                "highlightedWord": "الْحَاقَّةُ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/069001.mp3",
                "description": "مد لازم كلمي مثقل",
                "surah": 69,
                "ayah": 1
            },
            {
                "id": "madd_lazim_2_ex_3",
                "fullAyah": "أَتُحَاجُّونِّي فِي اللَّهِ",
                "highlightedWord": "أَتُحَاجُّونِّي",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/006080.mp3",
                "description": "مد لازم كلمي مثقل",
                "surah": 6,
                "ayah": 80
            },
            {
                "id": "madd_lazim_2_ex_4",
                "fullAyah": "ق وَالْقُرْآنِ الْمَجِيدِ",
                "highlightedWord": "ق",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/050001.mp3",
                "description": "مد لازم حرفي مخفف",
                "surah": 50,
                "ayah": 1
            },
            {
                "id": "madd_lazim_2_ex_5",
                "fullAyah": "الم",
                "highlightedWord": "الم",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/002001.mp3",
                "description": "مد لازم حرفي مثقل ومخفف",
                "surah": 2,
                "ayah": 1
            }
        ],
        "quiz": {
            "question": "ما هو مقدار المد اللازم؟",
            "options": [
                "حركتان",
                "4 حركات",
                "6 حركات لزوماً",
                "8 حركات"
            ],
            "correctAnswer": 2
        }
    },
    {
        "id": "qalqalah_2",
        "title": "القلقلة",
        "category": "أحكام أخرى",
        "description": "اضطراب الصوت عند النطق بالحرف الساكن حتى يسمع له نبرة قوية. حروفها مجموعة في (قطب جد).",
        "color": "#FF8C00",
        "poem": "قَلْقَلَةٌ قُطْبُ جَدٍّ وَالْلِّينُ .. وَاوٌ وَيَاءٌ سَكَنَا وَانْفَتَحَا قَبْلَهُمَا",
        "examples": [
            {
                "id": "qal1",
                "fullAyah": "قُلْ هُوَ اللَّهُ أَحَدٌ",
                "highlightedWord": "أَحَدٌ",
                "audioUrl": "https://server8.mp3quran.net/afs/112001.mp3",
                "description": "دال ساكنة سكوناً عارضاً للوقف (قلقلة كبرى)",
                "surah": 112,
                "ayah": 1
            },
            {
                "id": "qalqalah_2_ex_2",
                "fullAyah": "فِي جِيدِهَا حَبْلٌ مِنْ مَسَدٍ",
                "highlightedWord": "حَبْلٌ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/111005.mp3",
                "description": "باء ساكنة (قلقلة صغرى)",
                "surah": 111,
                "ayah": 5
            },
            {
                "id": "qalqalah_2_ex_3",
                "fullAyah": "وَالْعَادِيَاتِ ضَبْحًا",
                "highlightedWord": "ضَبْحًا",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/100001.mp3",
                "description": "باء ساكنة (قلقلة صغرى)",
                "surah": 100,
                "ayah": 1
            },
            {
                "id": "qalqalah_2_ex_4",
                "fullAyah": "اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ",
                "highlightedWord": "اقْرَأْ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/096001.mp3",
                "description": "قاف ساكنة (قلقلة صغرى)",
                "surah": 96,
                "ayah": 1
            },
            {
                "id": "qalqalah_2_ex_5",
                "fullAyah": "لَمْ يَلِدْ وَلَمْ يُولَدْ",
                "highlightedWord": "يَلِدْ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/112003.mp3",
                "description": "دال ساكنة (قلقلة صغرى)",
                "surah": 112,
                "ayah": 3
            }
        ],
        "quiz": {
            "question": "ما هي حروف القلقلة؟",
            "options": [
                "يرملون",
                "قطب جد",
                "أو ي",
                "فحثه شخص سكت"
            ],
            "correctAnswer": 1
        }
    },
    {
        "id": "ahkam_ra",
        "title": "أحكام الراء",
        "category": "أحكام التفخيم والترقيق",
        "description": "الراء تفخم إذا كانت مفتوحة أو مضمومة، وترقق إذا كانت مكسورة، ولها أحكام تفصيلية عند السكون.",
        "color": "#FF6347",
        "poem": "وَرَقِّقِ الرَّاءَ إِذَا مَا كُسِرَتْ .. كَذَاكَ بَعْدَ الْكَسْرِ حَيْثُ سَكَنَتْ",
        "examples": [
            {
                "id": "ra1",
                "fullAyah": "فَصَلِّ لِرَبِّكَ وَانْحَرْ",
                "highlightedWord": "وَانْحَرْ",
                "audioUrl": "https://server8.mp3quran.net/afs/108002.mp3",
                "description": "راء ساكنة وقبلها مفتوح (تفخيم)",
                "surah": 108,
                "ayah": 2
            },
            {
                "id": "ahkam_ra_ex_2",
                "fullAyah": "وَالْعَصْرِ",
                "highlightedWord": "وَالْعَصْرِ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/103001.mp3",
                "description": "راء ساكنة للوقف وقبلها ساكن قبله فتح (تفخيم)",
                "surah": 103,
                "ayah": 1
            },
            {
                "id": "ahkam_ra_ex_3",
                "fullAyah": "وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللَّهِ أَفْوَاجًا",
                "highlightedWord": "أَفْوَاجًا",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/110002.mp3",
                "description": "راء مفتوحة (تفخيم)",
                "surah": 110,
                "ayah": 2
            },
            {
                "id": "ahkam_ra_ex_4",
                "fullAyah": "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ",
                "highlightedWord": "بِرَبِّ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/113001.mp3",
                "description": "راء مكسورة (ترقيق)",
                "surah": 113,
                "ayah": 1
            },
            {
                "id": "ahkam_ra_ex_5",
                "fullAyah": "مِنْ شَرِّ مَا خَلَقَ",
                "highlightedWord": "شَرِّ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/113002.mp3",
                "description": "راء مكسورة (ترقيق)",
                "surah": 113,
                "ayah": 2
            }
        ],
        "quiz": {
            "question": "متى ترقق الراء؟",
            "options": [
                "إذا كانت مفتوحة",
                "إذا كانت مضمومة",
                "إذا كانت مكسورة",
                "دائماً"
            ],
            "correctAnswer": 2
        }
    },
    {
        "id": "lam_jalalah",
        "title": "لام لفظ الجلالة",
        "category": "أحكام التفخيم والترقيق",
        "description": "تفخم لام لفظ الجلالة (الله) إذا سبقها فتح أو ضم، وترقق إذا سبقها كسر.",
        "color": "#FF6347",
        "poem": "وَفَخِّمِ اللاَّمَ مِنِ اسْمِ اللَّهِ .. عَنْ فَتْحٍ اوْ ضَمٍّ كَعَبْدُ اللَّهِ",
        "examples": [
            {
                "id": "lam1",
                "fullAyah": "إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ",
                "highlightedWord": "نَصْرُ اللَّهِ",
                "audioUrl": "https://server8.mp3quran.net/afs/110003.mp3",
                "description": "لام لفظ الجلالة مسبوقة بضم (تفخيم)",
                "surah": 110,
                "ayah": 1
            },
            {
                "id": "lam_jalalah_ex_2",
                "fullAyah": "قُلْ هُوَ اللَّهُ أَحَدٌ",
                "highlightedWord": "اللَّهُ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/112001.mp3",
                "description": "لام لفظ الجلالة مسبوقة بفتح (تفخيم)",
                "surah": 112,
                "ayah": 1
            },
            {
                "id": "lam_jalalah_ex_3",
                "fullAyah": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
                "highlightedWord": "اللَّهِ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/001001.mp3",
                "description": "لام لفظ الجلالة مسبوقة بكسر (ترقيق)",
                "surah": 1,
                "ayah": 1
            },
            {
                "id": "lam_jalalah_ex_4",
                "fullAyah": "فِي دِينِ اللَّهِ أَفْوَاجًا",
                "highlightedWord": "اللَّهِ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/110002.mp3",
                "description": "لام لفظ الجلالة مسبوقة بكسر (ترقيق)",
                "surah": 110,
                "ayah": 2
            },
            {
                "id": "lam_jalalah_ex_5",
                "fullAyah": "يَدُ اللَّهِ فَوْقَ أَيْدِيهِمْ",
                "highlightedWord": "يَدُ اللَّهِ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/048010.mp3",
                "description": "لام لفظ الجلالة مسبوقة بضم (تفخيم)",
                "surah": 48,
                "ayah": 10
            }
        ],
        "quiz": {
            "question": "متى تفخم لام لفظ الجلالة؟",
            "options": [
                "إذا سبقها كسر",
                "إذا سبقها فتح أو ضم",
                "دائماً",
                "أبداً"
            ],
            "correctAnswer": 1
        }
    },
    {
        "id": "hamzat_wasl",
        "title": "همزة الوصل والقطع",
        "category": "أحكام أخرى",
        "description": "همزة الوصل تثبت في الابتداء وتسقط في الوصل، وهمزة القطع تثبت في الابتداء والوصل.",
        "color": "#FF8C00",
        "poem": "وَابْدَأْ بِهَمْزِ الْوَصْلِ مِنْ فِعْلٍ بِضَمْ .. إِنْ كَانَ ثَالِثٌ مِنَ الْفِعْلِ يُضَمْ",
        "examples": [
            {
                "id": "ham1",
                "fullAyah": "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
                "highlightedWord": "اهْدِنَا",
                "audioUrl": "https://server8.mp3quran.net/afs/001007.mp3",
                "description": "همزة وصل تثبت عند الابتداء مكسورة",
                "surah": 1,
                "ayah": 6
            },
            {
                "id": "hamzat_wasl_ex_2",
                "fullAyah": "اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ",
                "highlightedWord": "اقْرَأْ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/096001.mp3",
                "description": "همزة وصل في فعل (اقرأ)",
                "surah": 96,
                "ayah": 1
            },
            {
                "id": "hamzat_wasl_ex_3",
                "fullAyah": "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
                "highlightedWord": "الْحَمْدُ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/001002.mp3",
                "description": "همزة وصل في اسم (الحمد)",
                "surah": 1,
                "ayah": 2
            },
            {
                "id": "hamzat_wasl_ex_4",
                "fullAyah": "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
                "highlightedWord": "الصِّرَاطَ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/001006.mp3",
                "description": "همزة وصل في اسم (الصراط)",
                "surah": 1,
                "ayah": 6
            },
            {
                "id": "hamzat_wasl_ex_5",
                "fullAyah": "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ",
                "highlightedWord": "الَّذِينَ",
                "audioUrl": "https://www.everyayah.com/data/Husary_64kbps/001007.mp3",
                "description": "همزة وصل في اسم (الذين)",
                "surah": 1,
                "ayah": 7
            }
        ],
        "quiz": {
            "question": "ما هو حكم همزة الوصل عند وصل الكلام؟",
            "options": [
                "تثبت دائماً",
                "تسقط",
                "تتحول إلى ياء",
                "تتحول إلى واو"
            ],
            "correctAnswer": 1
        }
    }
];

const TajweedEducation: React.FC<{ 
    onBack: () => void, 
    onNavigate?: (pageId: string, params?: any) => void,
    onNavigateToMushaf?: (surah?: number, ayah?: number) => void, 
    onOpenThemes?: () => void,
    navParams?: any 
}> = ({ onBack, onNavigate, onNavigateToMushaf, onOpenThemes, navParams }) => {
    const { theme, themeKey } = useTheme();
    const [selectedRule, setSelectedRule] = useState<string | null>(null);
    const [playingAudio, setPlayingAudio] = useState<string | null>(null);
    const [userPlayingAudio, setUserPlayingAudio] = useState<string | null>(null);
    const [recordingId, setRecordingId] = useState<string | null>(null);
    const [userRecordings, setUserRecordings] = useState<Record<string, string>>({});
    const [completedRules, setCompletedRules] = useState<string[]>([]);
    const [quizAnswers, setQuizAnswers] = useState<Record<string, boolean>>({});
    
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const userAudioRef = useRef<HTMLAudioElement | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const isNavigatingToMushaf = useRef(false);

    useEffect(() => {
        const savedProgress = localStorage.getItem('tajweed_progress');
        if (savedProgress) {
            setCompletedRules(JSON.parse(savedProgress));
        }

        const savedRule = localStorage.getItem('tajweed_selected_rule');
        if (savedRule) {
            setSelectedRule(savedRule);
        }
    }, []);

    useEffect(() => {
        if (selectedRule) {
            localStorage.setItem('tajweed_selected_rule', selectedRule);
        } else {
            localStorage.removeItem('tajweed_selected_rule');
        }
    }, [selectedRule]);

    useEffect(() => {
        if (!playingAudio && audioRef.current) {
            audioRef.current.pause();
        }
    }, [playingAudio]);

    useEffect(() => {
        if (!userPlayingAudio && userAudioRef.current) {
            userAudioRef.current.pause();
        }
    }, [userPlayingAudio]);

    useEffect(() => {
        return () => {
            // Stop audio when leaving the page, unless we are going to the Mushaf for practical application
            if (!isNavigatingToMushaf.current) {
                if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current.currentTime = 0;
                }
                if (userAudioRef.current) {
                    userAudioRef.current.pause();
                    userAudioRef.current.currentTime = 0;
                }
            }
        };
    }, []);

    useEffect(() => {
        if (selectedRule) {
            const unregister = registerBackInterceptor(() => {
                setSelectedRule(null);
                setPlayingAudio(null);
                setRecordingId(null);
                return true;
            });
            return unregister;
        }
    }, [selectedRule]);

    const saveProgress = (ruleId: string) => {
        if (!completedRules.includes(ruleId)) {
            const newProgress = [...completedRules, ruleId];
            setCompletedRules(newProgress);
            localStorage.setItem('tajweed_progress', JSON.stringify(newProgress));
        }
    };

    const handleQuizAnswer = (ruleId: string, selectedIndex: number, correctIndex: number) => {
        const isCorrect = selectedIndex === correctIndex;
        setQuizAnswers(prev => ({ ...prev, [ruleId]: isCorrect }));
        if (isCorrect) {
            saveProgress(ruleId);
        }
    };

    const playAudio = async (url: string) => {
        if (!audioRef.current) audioRef.current = new Audio();
        else audioRef.current.pause();

        if (playingAudio === url) {
            setPlayingAudio(null);
            return;
        }

        setPlayingAudio(url);
        
        // Try to get from cache first for instant playback
        const finalUrl = await getCachedAudioUrl(url);
        audioRef.current.src = finalUrl;
        
        audioRef.current.play().catch(err => {
            console.error(`Audio playback failed:`, err);
            setPlayingAudio(null);
        });

        audioRef.current.onended = () => setPlayingAudio(null);
    };

    const playUserRecording = (url: string) => {
        if (!userAudioRef.current) userAudioRef.current = new Audio();
        else userAudioRef.current.pause();

        if (userPlayingAudio === url) {
            setUserPlayingAudio(null);
            return;
        }

        setUserPlayingAudio(url);
        userAudioRef.current.src = url;
        userAudioRef.current.play().catch(err => {
            console.error("User audio playback failed:", err);
            setUserPlayingAudio(null);
        });

        userAudioRef.current.onended = () => setUserPlayingAudio(null);
    };

    const startRecording = async (exampleId: string) => {
        try {
            // Request permission directly as requested
            const requestResult = await VoiceRecorder.requestAudioRecordingPermission();
            
            if (!requestResult.value) {
                // Only show manual alert if permission is explicitly denied
                alert("تم رفض الوصول للميكروفون. يرجى تفعيل الإذن من إعدادات التطبيق لتسجيل قراءتك والمقارنة.");
                return;
            }

            // If permission is true, start recording directly
            const startResult = await VoiceRecorder.startRecording();
            if (startResult.value) {
                setRecordingId(exampleId);
            } else {
                alert("حدث خطأ أثناء محاولة بدء التسجيل.");
            }
        } catch (err: any) {
            console.error("Microphone access error:", err);
            alert(`خطأ في الوصول للميكروفون: ${err.message || 'غير معروف'}`);
        }
    };

    const stopRecording = async () => {
        if (recordingId) {
            try {
                const result = await VoiceRecorder.stopRecording();
                if (result.value && result.value.recordDataBase64) {
                    const audioData = `data:${result.value.mimeType};base64,${result.value.recordDataBase64}`;
                    setUserRecordings(prev => ({ ...prev, [recordingId]: audioData }));
                }
            } catch (err) {
                console.error("Error stopping recording:", err);
            } finally {
                setRecordingId(null);
            }
        }
    };

    const renderAyah = (fullAyah: string, highlightedWord: string, color: string) => {
        const parts = fullAyah.split(highlightedWord);
        if (parts.length === 1) return <span className="font-quran">{fullAyah}</span>;
        
        return (
            <span className="font-quran leading-loose text-xl md:text-2xl">
                {parts.map((part, i) => (
                    <React.Fragment key={i}>
                        {part}
                        {i < parts.length - 1 && (
                            <span style={{ color: color, backgroundColor: `${color}15` }} className="font-bold px-1 rounded-md mx-1">
                                {highlightedWord}
                            </span>
                        )}
                    </React.Fragment>
                ))}
            </span>
        );
    };

    const progressPercentage = Math.round((completedRules.length / TAJWEED_RULES.length) * 100);

    const handleHomeClick = () => {
        if (onNavigate) {
            onNavigate('home');
        } else {
            onBack();
        }
    };

    return (
        <div 
            className="h-screen bg-transparent text-[var(--text-color)] flex flex-col overflow-hidden relative"
            dir="rtl"
            style={{ fontFamily: theme.font }}
        >
            {/* Header */}
            <header className="app-top-bar">
                <div className="app-top-bar__inner flex items-center justify-center px-4">
                    {onNavigateToMushaf && (
                        <button onClick={() => onNavigateToMushaf(navParams?.surah, navParams?.ayah)} className="absolute right-4 p-2 hover:bg-white/10 rounded-full transition-colors z-10" title="العودة للقراءة">
                            <i className="fa-solid fa-book-quran text-xl"></i>
                        </button>
                    )}
                    <div className="text-center">
                        <h1 className="app-top-bar__title text-2xl font-kufi">دورة التجويد التفاعلية</h1>
                        <p className="app-top-bar__subtitle">تعلم، استمع، سجل، واختبر نفسك</p>
                    </div>
                </div>
            </header>

            <div className="px-4 py-2 flex flex-col shadow-sm shrink-0" style={{ backgroundColor: `rgba(var(--top-bar-rgb), 0.1)` }}>
                {/* Progress Bar */}
                <div className="w-full bg-black/10 rounded-full h-2 mb-1">
                    <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%`, backgroundColor: theme.palette[0] }}></div>
                </div>
                <div className="flex justify-between text-[10px] font-bold opacity-70">
                    <span>مستوى التقدم</span>
                    <span>{progressPercentage}%</span>
                </div>
            </div>

            {/* Scrollable Content (Grid of Cards) */}
            <div className="flex-1 overflow-y-auto pb-24 p-4">
                <div className="space-y-8">
                    {Object.entries(
                        TAJWEED_RULES.reduce((acc, rule) => {
                            if (!acc[rule.category]) acc[rule.category] = [];
                            acc[rule.category].push(rule);
                            return acc;
                        }, {} as Record<string, TajweedRule[]>)
                    ).map(([category, rules]) => (
                        <div key={category} className="space-y-4">
                            <h2 className="text-xl font-bold border-b-2 pb-2 inline-block" style={{ borderColor: theme.palette[0], color: theme.palette[0] }}>
                                {category}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {rules.map((rule) => {
                                    const isCompleted = completedRules.includes(rule.id);

                                    return (
                                        <button 
                                            key={rule.id}
                                            onClick={() => setSelectedRule(rule.id)}
                                            className="rounded-2xl overflow-hidden shadow-sm border transition-all hover:scale-[1.02] active:scale-[0.98] flex flex-col text-right h-full"
                                            style={{ backgroundColor: 'var(--card-bg)', borderColor: isCompleted ? theme.palette[0] : 'var(--card-border)', color: 'var(--text-color)' }}
                                        >
                                            <div className="p-4 flex-1 w-full flex flex-col">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-2 h-10 rounded-full shrink-0" style={{ backgroundColor: rule.color }}></div>
                                                        <span className="font-bold text-lg leading-tight">{rule.title}</span>
                                                    </div>
                                                    {isCompleted && <i className="fa-solid fa-check-circle text-lg shrink-0" style={{ color: theme.palette[0] }}></i>}
                                                </div>
                                                <p className="text-xs opacity-70 line-clamp-2 leading-relaxed flex-1">{rule.description}</p>
                                                <div className="mt-4 flex items-center justify-between text-xs font-bold" style={{ color: theme.palette[0] }}>
                                                    <span>{rule.examples.length} أمثلة للتدريب</span>
                                                    <span className="flex items-center gap-1">ابدأ التعلم <i className="fa-solid fa-arrow-left text-[10px]"></i></span>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal for Active Rule */}
            <AnimatePresence>
                {selectedRule && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed inset-0 z-[100] flex flex-col"
                        style={{ fontFamily: theme.font, backgroundColor: 'var(--modal-bg)' }}
                    >
                        {(() => {
                            const rule = TAJWEED_RULES.find(r => r.id === selectedRule)!;
                            const isCompleted = completedRules.includes(rule.id);
                            
                            return (
                                <>
                                    <div className="app-top-bar shrink-0 shadow-md flex items-center justify-center px-4 py-3">
                                        <h2 className="text-xl font-bold font-kufi truncate px-4">{rule.title}</h2>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-4 pb-24">
                                        {/* Description & Poem */}
                                        <div className="p-5 rounded-2xl mb-6 shadow-sm border" style={{ backgroundColor: `${theme.palette[0]}10`, borderColor: `${theme.palette[0]}30` }}>
                                            <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: theme.palette[0] }}>
                                                <i className="fa-solid fa-book-open-reader"></i>
                                                الشرح
                                            </h3>
                                            <p className="text-sm leading-relaxed mb-4">{rule.description}</p>
                                            
                                            {rule.articulationPoint && (
                                                <div className="flex items-center gap-2 text-sm mb-4 font-bold" style={{ color: theme.palette[0] }}>
                                                    <i className="fa-solid fa-head-side-cough"></i>
                                                    <span>مخرج الحرف: {rule.articulationPoint}</span>
                                                </div>
                                            )}
                                            
                                            <div className="border-t pt-4 mt-2" style={{ borderColor: `${theme.palette[0]}30` }}>
                                                <span className="text-sm font-bold block mb-2 flex items-center gap-2" style={{ color: theme.palette[0] }}>
                                                    <i className="fa-solid fa-feather-pointed"></i>
                                                    من تحفة الأطفال / الجزرية:
                                                </span>
                                                <p className="text-base font-serif whitespace-pre-line leading-loose text-center bg-white/5 p-4 rounded-xl" style={{ color: theme.palette[1] || theme.palette[0] }}>
                                                    {rule.poem}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {/* Examples & Recording */}
                                        <div className="space-y-4 mb-8">
                                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: theme.palette[0] }}>
                                                <i className="fa-solid fa-headphones-simple"></i>
                                                التدريب العملي ({rule.examples.length} أمثلة)
                                            </h3>
                                            
                                            {rule.examples.map((example, index) => (
                                                <div key={example.id} className="p-5 rounded-2xl border shadow-sm" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                                                    <div className="flex justify-between items-center mb-3">
                                                        <span className="text-xs font-bold px-2 py-1 rounded-md" style={{ backgroundColor: `${theme.palette[0]}20`, color: theme.palette[0] }}>مثال {index + 1}</span>
                                                        {example.description && <span className="text-xs opacity-70">{example.description}</span>}
                                                    </div>
                                                    
                                                    <div className="mb-6 text-center bg-[var(--card-bg-hover)] p-4 rounded-xl border border-[var(--card-border)]">
                                                        {renderAyah(example.fullAyah, example.highlightedWord, rule.color)}
                                                    </div>
                                                    
                                                    <div className="flex flex-wrap items-center justify-center gap-3">
                                                        {/* Play Sheikh Audio */}
                                                        <button 
                                                            onClick={() => playAudio(example.audioUrl)}
                                                            className="flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all shadow-sm"
                                                            style={{ 
                                                                backgroundColor: playingAudio === example.audioUrl ? theme.palette[0] : 'var(--card-bg-hover)', 
                                                                color: playingAudio === example.audioUrl ? 'white' : theme.palette[0],
                                                                border: `1px solid ${theme.palette[0]}`
                                                            }}
                                                        >
                                                            <i className={`fa-solid ${playingAudio === example.audioUrl ? 'fa-pause' : 'fa-play'}`}></i>
                                                            استمع للشيخ
                                                        </button>

                                                        {/* Record User Audio */}
                                                        <button 
                                                            onClick={() => recordingId === example.id ? stopRecording() : startRecording(example.id)}
                                                            className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all shadow-sm ${recordingId === example.id ? 'bg-red-500 text-white animate-pulse' : ''}`}
                                                            style={{ 
                                                                backgroundColor: recordingId === example.id ? undefined : 'var(--card-bg-hover)', 
                                                                color: recordingId === example.id ? undefined : '#ef4444',
                                                                border: `1px solid #ef4444`
                                                            }}
                                                        >
                                                            <i className={`fa-solid ${recordingId === example.id ? 'fa-stop' : 'fa-microphone'}`}></i>
                                                            {recordingId === example.id ? 'إيقاف التسجيل' : 'سجل قراءتك'}
                                                        </button>

                                                        {/* Play User Audio */}
                                                        {userRecordings[example.id] && (
                                                            <button 
                                                                onClick={() => playUserRecording(userRecordings[example.id])}
                                                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold shadow-sm"
                                                                style={{ 
                                                                    backgroundColor: userPlayingAudio === userRecordings[example.id] ? theme.palette[0] : `${theme.palette[1] || theme.palette[0]}20`, 
                                                                    color: userPlayingAudio === userRecordings[example.id] ? 'white' : (theme.palette[1] || theme.palette[0]),
                                                                    border: `1px solid ${theme.palette[1] || theme.palette[0]}50`
                                                                }}
                                                            >
                                                                <i className={`fa-solid ${userPlayingAudio === userRecordings[example.id] ? 'fa-pause' : 'fa-headphones'}`}></i>
                                                                {userPlayingAudio === userRecordings[example.id] ? 'إيقاف الاستماع' : 'استمع لتسجيلك'}
                                                            </button>
                                                        )}

                                                        {/* Mushaf Integration Button */}
                                                        {onNavigateToMushaf && (
                                                            <button 
                                                                onClick={() => {
                                                                    isNavigatingToMushaf.current = true;
                                                                    onNavigateToMushaf(example.surah, example.ayah);
                                                                }}
                                                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold shadow-sm transition-all hover:opacity-90"
                                                                style={{ 
                                                                    backgroundColor: theme.palette[0], 
                                                                    color: 'white',
                                                                }}
                                                            >
                                                                <i className="fa-solid fa-book-open"></i>
                                                                تطبيق عملي في المصحف
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Quiz Section */}
                                        <div className="p-6 rounded-2xl border shadow-sm" style={{ backgroundColor: 'var(--card-bg-hover)', borderColor: 'var(--card-border)' }}>
                                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: theme.palette[0] }}>
                                                <i className="fa-solid fa-clipboard-question"></i>
                                                اختبر نفسك
                                            </h3>
                                            <p className="text-base mb-5 font-medium">{rule.quiz.question}</p>
                                            <div className="space-y-3">
                                                {rule.quiz.options.map((opt, idx) => {
                                                    const isAnswered = quizAnswers[rule.id] !== undefined;
                                                    const isCorrect = idx === rule.quiz.correctAnswer;
                                                    
                                                    let btnStyle: React.CSSProperties = {
                                                        width: '100%',
                                                        textAlign: 'right',
                                                        padding: '1rem',
                                                        borderRadius: '0.75rem',
                                                        fontSize: '0.95rem',
                                                        transition: 'all 0.2s',
                                                        border: '1px solid var(--card-border)',
                                                        backgroundColor: 'var(--card-bg)',
                                                        color: 'var(--text-color)'
                                                    };
                                                    
                                                    if (isAnswered) {
                                                        if (isCorrect) {
                                                            btnStyle.backgroundColor = `${theme.palette[0]}30`;
                                                            btnStyle.borderColor = theme.palette[0];
                                                            btnStyle.fontWeight = 'bold';
                                                        } else {
                                                            btnStyle.opacity = 0.5;
                                                        }
                                                    }

                                                    return (
                                                        <button 
                                                            key={idx}
                                                            disabled={isAnswered}
                                                            onClick={() => handleQuizAnswer(rule.id, idx, rule.quiz.correctAnswer)}
                                                            className="hover:opacity-80 shadow-sm"
                                                            style={btnStyle}
                                                        >
                                                            {opt}
                                                            {isAnswered && isCorrect && <i className="fa-solid fa-check float-left mt-1"></i>}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {quizAnswers[rule.id] === false && (
                                                <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-bold flex items-center gap-2">
                                                    <i className="fa-solid fa-circle-xmark"></i>
                                                    إجابة خاطئة، حاول مراجعة الشرح أعلاه.
                                                </div>
                                            )}
                                            {quizAnswers[rule.id] === true && (
                                                <div className="mt-4 p-3 rounded-lg border text-sm font-bold flex items-center gap-2" style={{ backgroundColor: `${theme.palette[0]}10`, borderColor: `${theme.palette[0]}30`, color: theme.palette[0] }}>
                                                    <i className="fa-solid fa-circle-check"></i>
                                                    أحسنت! إجابة صحيحة.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <BottomBar 
                                        onHomeClick={() => { setSelectedRule(null); setPlayingAudio(null); setUserPlayingAudio(null); setRecordingId(null); }} 
                                        onThemesClick={onOpenThemes || (() => {})} 
                                        showThemes={false} 
                                        homeLabel="رجوع" 
                                    />
                                </>
                            );
                        })()}
                    </motion.div>
                )}
            </AnimatePresence>
            
            <BottomBar onHomeClick={handleHomeClick} onThemesClick={onOpenThemes || (() => {})} showThemes={false} />
        </div>
    );
};

export default TajweedEducation;
