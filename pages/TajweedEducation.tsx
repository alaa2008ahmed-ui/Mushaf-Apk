import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../context/ThemeContext';
import BottomBar from '../components/BottomBar';

interface TajweedExample {
    id: string;
    fullAyah: string;
    highlightedWord: string;
    audioUrl: string;
    description?: string;
}

interface TajweedQuiz {
    question: string;
    options: string[];
    correctAnswer: number;
}

interface TajweedRule {
    id: string;
    title: string;
    description: string;
    color: string;
    poem: string;
    articulationPoint?: string;
    examples: TajweedExample[];
    quiz: TajweedQuiz;
}

const TAJWEED_RULES: TajweedRule[] = [
    {
        id: 'ghunnah',
        title: 'الغنة (Ghunnah)',
        description: 'صوت يخرج من الخيشوم، وتكون في النون والميم المشددتين بمقدار حركتين.',
        color: '#FF69B4',
        poem: 'وَغُنَّ مِيمًا ثُمَّ نُونًا شُدِّدَا .. وَسَمِّ كُلاً حَرْفَ غُنَّةٍ بَدَا',
        articulationPoint: 'الخيشوم (أقصى الأنف من الداخل)',
        examples: [
            { id: 'g1', fullAyah: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ', highlightedWord: 'النَّاسِ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/114001.mp3', description: 'نون مشددة' },
            { id: 'g2', fullAyah: 'عَمَّ يَتَسَاءَلُونَ', highlightedWord: 'عَمَّ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/078001.mp3', description: 'ميم مشددة' },
            { id: 'g3', fullAyah: 'فَلَمَّا جَاءَتْ قِيلَ أَهَكَذَا عَرْشُكِ قَالَتْ كَأَنَّهُ هُوَ', highlightedWord: 'كَأَنَّهُ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/027042.mp3', description: 'نون مشددة' },
        ],
        quiz: {
            question: 'ما هو مقدار الغنة في النون والميم المشددتين؟',
            options: ['حركة واحدة', 'حركتان', 'ثلاث حركات', 'أربع حركات'],
            correctAnswer: 1
        }
    },
    {
        id: 'ikhfa',
        title: 'الإخفاء الحقيقي (Ikhfa)',
        description: 'النطق بالنون الساكنة أو التنوين بصفة بين الإظهار والإدغام عارياً عن التشديد مع بقاء الغنة.',
        color: '#4169E1',
        poem: 'وَالرَّابِعُ الإِخْفَاءُ عِنْدَ الْفَاضِلِ .. مِنَ الحُرُوفِ وَاجِبٌ لِلْفَاضِلِ',
        articulationPoint: 'إخفاء النون عند مخرج الحرف الذي يليها',
        examples: [
            { id: 'ik1', fullAyah: 'مِنْ شَرِّ مَا خَلَقَ', highlightedWord: 'مِنْ شَرِّ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/113002.mp3' },
            { id: 'ik2', fullAyah: 'وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنْزِلَ إِلَيْكَ', highlightedWord: 'أُنْزِلَ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/002004.mp3' },
            { id: 'ik3', fullAyah: 'فَتُوبُوا إِلَى بَارِئِكُمْ فَاقْتُلُوا أَنْفُسَكُمْ', highlightedWord: 'أَنْفُسَكُمْ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/002054.mp3' },
        ],
        quiz: {
            question: 'كم عدد حروف الإخفاء الحقيقي؟',
            options: ['6 حروف', '15 حرفاً', '4 حروف', 'حرف واحد'],
            correctAnswer: 1
        }
    },
    {
        id: 'idgham_ghunnah',
        title: 'إدغام بغنة (Idgham with Ghunnah)',
        description: 'إدخال النون الساكنة أو التنوين في حروف (ي ن م و) مع الغنة.',
        color: '#2E8B57',
        poem: 'وَالثَّانِ إِدْغَامٌ بِسِتَّةٍ أَتَتْ .. فِي يَرْمَلُونَ عِنْدَهُمْ قَدْ ثَبَتَتْ\nلَكِنَّهَا قِسْمَانِ قِسْمٌ يُدْغَمَا .. فِيهِ بِغُنَّةٍ بِيَنْمُو عُلِمَا',
        examples: [
            { id: 'ig1', fullAyah: 'وَمِنَ النَّاسِ مَنْ يَقُولُ آمَنَّا بِاللَّهِ', highlightedWord: 'مَنْ يَقُولُ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/002008.mp3' },
            { id: 'ig2', fullAyah: 'فَمَنْ يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ', highlightedWord: 'فَمَنْ يَعْمَلْ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/099007.mp3' },
            { id: 'ig3', fullAyah: 'وَمَا لَكُمْ مِنْ دُونِ اللَّهِ مِنْ وَلِيٍّ وَلَا نَصِيرٍ', highlightedWord: 'وَلِيٍّ وَلَا', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/002107.mp3' },
        ],
        quiz: {
            question: 'ما هي الكلمة التي تجمع حروف الإدغام بغنة؟',
            options: ['يرملون', 'ينمو', 'قطب جد', 'أخي هاك'],
            correctAnswer: 1
        }
    },
    {
        id: 'idgham_no_ghunnah',
        title: 'إدغام بغير غنة (Idgham without Ghunnah)',
        description: 'إدخال النون الساكنة أو التنوين في حرفي (ل ر) بدون غنة.',
        color: '#2E8B57',
        poem: 'وَالثَّانِ إِدْغَامٌ بِغَيْرِ غُنَّةْ .. فِي اللاَّمِ وَالرَّا ثُمَّ كَرِّرَنَّهْ',
        examples: [
            { id: 'in1', fullAyah: 'أُولَئِكَ عَلَى هُدًى مِنْ رَبِّهِمْ', highlightedWord: 'مِنْ رَبِّهِمْ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/002005.mp3' },
            { id: 'in2', fullAyah: 'قَيِّمًا لِيُنْذِرَ بَأْسًا شَدِيدًا مِنْ لَدُنْهُ', highlightedWord: 'مِنْ لَدُنْهُ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/018002.mp3' },
            { id: 'in3', fullAyah: 'إِنَّ اللَّهَ غَفُورٌ رَحِيمٌ', highlightedWord: 'غَفُورٌ رَحِيمٌ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/002173.mp3' },
        ],
        quiz: {
            question: 'ما هي حروف الإدغام بغير غنة؟',
            options: ['ي ، و', 'ل ، ر', 'م ، ن', 'ء ، هـ'],
            correctAnswer: 1
        }
    },
    {
        id: 'iqlab',
        title: 'الإقلاب (Iqlab)',
        description: 'قلب النون الساكنة أو التنوين ميماً مخفاة بغنة عند ملاقاتها لحرف الباء.',
        color: '#808080',
        poem: 'وَالثَّالِثُ الإِقْلَابُ عِنْدَ الْبَاءِ .. مِيمًا بِغُنَّةٍ مَعَ الإِخْفَاءِ',
        articulationPoint: 'انطباق الشفتين انطباقاً خفيفاً لنطق الميم',
        examples: [
            { id: 'iq1', fullAyah: 'الَّذِينَ يَنْقُضُونَ عَهْدَ اللَّهِ مِنْ بَعْدِ مِيثَاقِهِ', highlightedWord: 'مِنْ بَعْدِ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/002027.mp3' },
            { id: 'iq2', fullAyah: 'قَالَ يَا آدَمُ أَنْبِئْهُمْ بِأَسْمَائِهِمْ', highlightedWord: 'أَنْبِئْهُمْ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/002033.mp3' },
            { id: 'iq3', fullAyah: 'سُبْحَانَ الَّذِي أَسْرَى بِعَبْدِهِ لَيْلًا مِنَ الْمَسْجِدِ الْحَرَامِ إِلَى الْمَسْجِدِ الْأَقْصَى الَّذِي بَارَكْنَا حَوْلَهُ لِنُرِيَهُ مِنْ آيَاتِنَا إِنَّهُ هُوَ السَّمِيعُ الْبَصِيرُ', highlightedWord: 'السَّمِيعُ الْبَصِيرُ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/017001.mp3' },
        ],
        quiz: {
            question: 'متى يحدث الإقلاب؟',
            options: ['عند مجيء حرف الميم بعد النون', 'عند مجيء حرف الباء بعد النون الساكنة أو التنوين', 'عند الوقف على التنوين', 'عند التقاء الساكنين'],
            correctAnswer: 1
        }
    },
    {
        id: 'izhar',
        title: 'الإظهار الحلقي (Izhar)',
        description: 'إخراج النون الساكنة أو التنوين من مخرجها بوضوح. حروفه (ء هـ ع ح غ خ).',
        color: '#000000',
        poem: 'فَالأَوَّلُ الإِظْهَارُ قَبْلَ أَحْرُفِ .. لِلْحَلْقِ سِتٍّ رُتِّبَتْ فَلْتَعْرِفِ\nهَمْزٌ فَهَاءٌ ثُمَّ عَيْنٌ حَاءُ .. مُهْمَلَتَانِ ثُمَّ غَيْنٌ خَاءُ',
        articulationPoint: 'الحلق (أقصى، وسط، وأدنى الحلق)',
        examples: [
            { id: 'iz1', fullAyah: 'إِنَّ الَّذِينَ آمَنُوا وَالَّذِينَ هَادُوا وَالنَّصَارَى وَالصَّابِئِينَ مَنْ آمَنَ بِاللَّهِ', highlightedWord: 'مَنْ آمَنَ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/002062.mp3' },
            { id: 'iz2', fullAyah: 'يُوصِيكُمُ اللَّهُ فِي أَوْلَادِكُمْ ۖ لِلذَّكَرِ مِثْلُ حَظِّ الْأُنْثَيَيْنِ ۚ ... إِنَّ اللَّهَ كَانَ عَلِيمًا حَكِيمًا', highlightedWord: 'عَلِيمًا حَكِيمًا', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/004011.mp3' },
            { id: 'iz3', fullAyah: 'الَّذِي أَطْعَمَهُمْ مِنْ جُوعٍ وَآمَنَهُمْ مِنْ خَوْفٍ', highlightedWord: 'مِنْ خَوْفٍ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/106004.mp3' },
        ],
        quiz: {
            question: 'لماذا سمي الإظهار بالحلقي؟',
            options: ['لأن حروفه تخرج من الشفتين', 'لأن حروفه تخرج من الحلق', 'لأن صوته يشبه الحلق', 'لأنه يحلق في الفم'],
            correctAnswer: 1
        }
    },
    {
        id: 'qalqalah',
        title: 'القلقلة (Qalqalah)',
        description: 'اضطراب الصوت عند النطق بالحرف الساكن. حروفها (قطب جد).',
        color: '#FF4500',
        poem: 'قَلْقَلَةٌ قُطْبُ جَدٍّ وَاللِّينُ .. وَاوٌ وَيَاءٌ سَكَنَا وَانْفَتَحَا قَبْلَهُمَا',
        examples: [
            { id: 'q1', fullAyah: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ', highlightedWord: 'الْفَلَقِ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/113001.mp3', description: 'قلقلة كبرى (عند الوقف)' },
            { id: 'q2', fullAyah: 'وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللَّهِ أَفْوَاجًا', highlightedWord: 'يَدْخُلُونَ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/110002.mp3', description: 'قلقلة صغرى (في وسط الكلمة)' },
            { id: 'q3', fullAyah: 'وَاللَّهُ مِنْ وَرَائِهِمْ مُحِيطٌ', highlightedWord: 'مُحِيطٌ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/085020.mp3', description: 'قلقلة كبرى' },
            { id: 'q4', fullAyah: 'خَتَمَ اللَّهُ عَلَى قُلُوبِهِمْ وَعَلَى سَمْعِهِمْ وَعَلَى أَبْصَارِهِمْ غِشَاوَةٌ', highlightedWord: 'أَبْصَارِهِمْ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/002007.mp3', description: 'قلقلة صغرى' },
        ],
        quiz: {
            question: 'متى تكون القلقلة كبرى؟',
            options: ['إذا كان الحرف في أول الكلمة', 'إذا كان الحرف ساكناً في وسط الكلمة', 'عند الوقف على حرف القلقلة', 'إذا كان الحرف متحركاً'],
            correctAnswer: 2
        }
    },
    {
        id: 'madd_muttasil',
        title: 'المد المتصل (Madd Muttasil)',
        description: 'أن يأتي حرف المد وبعده همزة في كلمة واحدة. يمد 4 أو 5 حركات.',
        color: '#DC143C',
        poem: 'فَوَاجِبٌ إِنْ جَاءَ هَمْزٌ بَعْدَ مَدْ .. فِي كِلْمَةٍ وَذَا بِمُتَّصِلٍ يُعَدْ',
        examples: [
            { id: 'mm1', fullAyah: 'أَوْ كَصَيِّبٍ مِنَ السَّمَاءِ فِيهِ ظُلُمَاتٌ وَرَعْدٌ وَبَرْقٌ', highlightedWord: 'السَّمَاءِ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/002019.mp3' },
            { id: 'mm2', fullAyah: 'وَأَشْرَقَتِ الْأَرْضُ بِنُورِ رَبِّهَا وَوُضِعَ الْكِتَابُ وَجِيءَ بِالنَّبِيِّينَ', highlightedWord: 'وَجِيءَ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/039069.mp3' },
            { id: 'mm3', fullAyah: 'إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ', highlightedWord: 'جَاءَ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/110001.mp3' },
        ],
        quiz: {
            question: 'ما هو حكم المد المتصل؟',
            options: ['الجواز', 'الوجوب', 'اللزوم', 'الندب'],
            correctAnswer: 1
        }
    },
    {
        id: 'madd_munfasil',
        title: 'المد المنفصل (Madd Munfasil)',
        description: 'أن يأتي حرف المد في آخر كلمة والهمزة في أول الكلمة التالية. يمد 2 أو 4 أو 5 حركات.',
        color: '#DC143C',
        poem: 'وَجَائِزٌ مَدٌّ وَقَصْرٌ إِنْ فُصِلْ .. كُلٌّ بِكِلْمَةٍ وَهَذَا المُنْفَصِلْ',
        examples: [
            { id: 'mn1', fullAyah: 'وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنْزِلَ إِلَيْكَ وَمَا أُنْزِلَ مِنْ قَبْلِكَ', highlightedWord: 'بِمَا أُنْزِلَ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/002004.mp3' },
            { id: 'mn2', fullAyah: 'يَا أَيُّهَا النَّاسُ اعْبُدُوا رَبَّكُمُ', highlightedWord: 'يَا أَيُّهَا', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/002021.mp3' },
            { id: 'mn3', fullAyah: 'لَا أَعْبُدُ مَا تَعْبُدُونَ', highlightedWord: 'لَا أَعْبُدُ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/109002.mp3' },
        ],
        quiz: {
            question: 'ما هو حكم المد المنفصل؟',
            options: ['الوجوب', 'اللزوم', 'الجواز', 'المنع'],
            correctAnswer: 2
        }
    },
    {
        id: 'madd_lazim',
        title: 'المد اللازم (Madd Lazim)',
        description: 'أن يأتي بعد حرف المد سكون أصلي ثابت وصلاً ووقفاً. يمد 6 حركات.',
        color: '#DC143C',
        poem: 'وَلَازِمٌ إِنِ السُّكُونُ أُصِّلَا .. وَصْلاً وَوَقْفًا بَعْدَ مَدٍّ طُوِّلَا',
        examples: [
            { id: 'ml1', fullAyah: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ', highlightedWord: 'الضَّالِّينَ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/001007.mp3' },
            { id: 'ml2', fullAyah: 'الْحَاقَّةُ', highlightedWord: 'الْحَاقَّةُ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/069001.mp3' },
            { id: 'ml3', fullAyah: 'آلْآنَ وَقَدْ كُنْتُمْ بِهِ تَسْتَعْجِلُونَ', highlightedWord: 'آلْآنَ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/010051.mp3' },
        ],
        quiz: {
            question: 'كم عدد حركات المد اللازم؟',
            options: ['حركتان', 'أربع حركات', 'خمس حركات', 'ست حركات'],
            correctAnswer: 3
        }
    },
    {
        id: 'madd_arid',
        title: 'المد العارض للسكون (Madd Arid)',
        description: 'أن يأتي بعد حرف المد حرف متحرك يتم تسكينه لأجل الوقف. يمد 2 أو 4 أو 6 حركات.',
        color: '#DC143C',
        poem: 'وَمِثْلُ ذَا إِنْ عَرَضَ السُّكُونُ .. وَقْفًا كَتَعْلَمُونَ نَسْتَعِينُ',
        examples: [
            { id: 'ma1', fullAyah: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', highlightedWord: 'الْعَالَمِينَ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/001002.mp3' },
            { id: 'ma2', fullAyah: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', highlightedWord: 'نَسْتَعِينُ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/001005.mp3' },
            { id: 'ma3', fullAyah: 'أُولَئِكَ عَلَى هُدًى مِنْ رَبِّهِمْ وَأُولَئِكَ هُمُ الْمُفْلِحُونَ', highlightedWord: 'الْمُفْلِحُونَ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/002005.mp3' },
        ],
        quiz: {
            question: 'متى يحدث المد العارض للسكون؟',
            options: ['عند الوصل دائماً', 'عند الوقف على الكلمة', 'في بداية الآية', 'إذا جاء بعده همزة'],
            correctAnswer: 1
        }
    },
    {
        id: 'madd_lin',
        title: 'مد اللين (Madd Lin)',
        description: 'أن تأتي الواو أو الياء الساكنة المفتوح ما قبلها وبعدها حرف سكن للوقف.',
        color: '#DC143C',
        poem: 'وَاللِّينُ مِنْهَا الْيَاءُ وَوَاوٌ سُكِّنَا .. إِنِ انْفِتَاحٌ قَبْلَ كُلٍّ أُعْلِنَا',
        examples: [
            { id: 'mln1', fullAyah: 'لِإِيلَافِ قُرَيْشٍ', highlightedWord: 'قُرَيْشٍ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/106001.mp3' },
            { id: 'mln2', fullAyah: 'فَلْيَعْبُدُوا رَبَّ هَذَا الْبَيْتِ', highlightedWord: 'الْبَيْتِ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/106003.mp3' },
            { id: 'mln3', fullAyah: 'الَّذِي أَطْعَمَهُمْ مِنْ جُوعٍ وَآمَنَهُمْ مِنْ خَوْفٍ', highlightedWord: 'خَوْفٍ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/106004.mp3' },
        ],
        quiz: {
            question: 'ما هي حركة الحرف الذي يسبق حرفي اللين (الواو والياء)؟',
            options: ['الكسرة', 'الضمة', 'الفتحة', 'السكون'],
            correctAnswer: 2
        }
    },
    {
        id: 'madd_silah',
        title: 'مد الصلة (Madd Silah)',
        description: 'مد هاء الضمير للمفرد الغائب المذكر إذا وقعت بين متحركين.',
        color: '#DC143C',
        poem: 'وَصِلْ هَاءَ ضَمِيرٍ عَنْ سُكُونٍ قَبْلَ مَا .. حُرِّكَ وَاقْصُرْ عَنْ سُكُونٍ جُلِّيَا',
        examples: [
            { id: 'ms1', fullAyah: 'إِنَّهُ كَانَ بِعِبَادِهِ خَبِيرًا بَصِيرًا', highlightedWord: 'بِعِبَادِهِ خَبِيرًا', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/025020.mp3', description: 'صلة صغرى' },
            { id: 'ms2', fullAyah: 'يَحْسَبُ أَنَّ مَالَهُ أَخْلَدَهُ', highlightedWord: 'أَخْلَدَهُ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/104003.mp3', description: 'صلة كبرى' },
        ],
        quiz: {
            question: 'متى تمد هاء الضمير؟',
            options: ['إذا وقعت بين ساكنين', 'إذا وقعت بين متحركين', 'إذا جاء بعدها همزة فقط', 'دائماً'],
            correctAnswer: 1
        }
    },
    {
        id: 'madd_badal',
        title: 'مد البدل (Madd Badal)',
        description: 'أن تتقدم الهمزة على حرف المد في كلمة واحدة. يمد حركتين.',
        color: '#DC143C',
        poem: 'أَوْ قُدِّمَ الْهَمْزُ عَلَى المَدِّ وَذَا .. بَدَلْ كَآمَنُوا وَإِيمَانًا خُذَا',
        examples: [
            { id: 'mb1', fullAyah: 'وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا', highlightedWord: 'آدَمَ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/002031.mp3' },
            { id: 'mb2', fullAyah: 'وَمِنَ النَّاسِ مَنْ يَتَّخِذُ مِنْ دُونِ اللَّهِ أَنْدَادًا يُحِبُّونَهُمْ كَحُبِّ اللَّهِ وَالَّذِينَ آمَنُوا أَشَدُّ حُبًّا لِلَّهِ', highlightedWord: 'آمَنُوا', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/002165.mp3' },
            { id: 'mb3', fullAyah: 'وَلَمَّا جَاءَهُمْ كِتَابٌ مِنْ عِنْدِ اللَّهِ مُصَدِّقٌ لِمَا مَعَهُمْ وَكَانُوا مِنْ قَبْلُ يَسْتَفْتِحُونَ عَلَى الَّذِينَ كَفَرُوا فَلَمَّا جَاءَهُمْ مَا عَرَفُوا كَفَرُوا بِهِ فَلَعْنَةُ اللَّهِ عَلَى الْكَافِرِينَ', highlightedWord: 'أُوتُوا', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/002101.mp3' },
        ],
        quiz: {
            question: 'ما هو مقدار مد البدل؟',
            options: ['حركة واحدة', 'حركتان', 'أربع حركات', 'ست حركات'],
            correctAnswer: 1
        }
    },
    {
        id: 'rules_ra',
        title: 'أحكام الراء (Rules of Ra)',
        description: 'للراء حالتان: التفخيم (تغليظ الصوت) والترقيق (تنحيف الصوت) حسب حركتها وما قبلها.',
        color: '#8B4513',
        poem: 'وَرَقِّقِ الرَّاءَ إِذَا مَا كُسِرَتْ .. كَذَاكَ بَعْدَ الْكَسْرِ حَيْثُ سَكَنَتْ',
        examples: [
            { id: 'rr1', fullAyah: 'وَإِذْ يَرْفَعُ إِبْرَاهِيمُ الْقَوَاعِدَ مِنَ الْبَيْتِ وَإِسْمَاعِيلُ رَبَّنَا تَقَبَّلْ مِنَّا', highlightedWord: 'رَبَّنَا', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/002127.mp3', description: 'تفخيم' },
            { id: 'rr2', fullAyah: 'الَّذِي جَعَلَ لَكُمُ الْأَرْضَ فِرَاشًا وَالسَّمَاءَ بِنَاءً وَأَنْزَلَ مِنَ السَّمَاءِ مَاءً فَأَخْرَجَ بِهِ مِنَ الثَّمَرَاتِ رِزْقًا لَكُمْ', highlightedWord: 'رِزْقًا', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/002022.mp3', description: 'ترقيق' },
            { id: 'rr3', fullAyah: 'وَإِذْ نَجَّيْنَاكُمْ مِنْ آلِ فِرْعَوْنَ يَسُومُونَكُمْ سُوءَ الْعَذَابِ', highlightedWord: 'فِرْعَوْنَ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/002049.mp3', description: 'ترقيق' },
        ],
        quiz: {
            question: 'متى ترقق الراء؟',
            options: ['إذا كانت مفتوحة', 'إذا كانت مضمومة', 'إذا كانت مكسورة', 'إذا جاء بعدها ألف'],
            correctAnswer: 2
        }
    },
    {
        id: 'rules_lam',
        title: 'أحكام اللام (Rules of Lam)',
        description: 'الأصل في اللام الترقيق، وتفخم في لفظ الجلالة (الله) إذا سبقها فتح أو ضم.',
        color: '#4B0082',
        poem: 'وَفَخِّمِ اللاَّمَ مِنِ اسْمِ اللَّهِ .. عَنْ فَتْحٍ اوْ ضَمٍّ كَعَبْدُ اللَّهِ',
        examples: [
            { id: 'rl1', fullAyah: 'قُلْ هُوَ اللَّهُ أَحَدٌ', highlightedWord: 'اللَّهُ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/112001.mp3', description: 'تفخيم' },
            { id: 'rl2', fullAyah: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ', highlightedWord: 'بِسْمِ اللَّهِ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/001001.mp3', description: 'ترقيق' },
            { id: 'rl3', fullAyah: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', highlightedWord: 'لِلَّهِ', audioUrl: 'https://www.everyayah.com/data/Husary_64kbps/001002.mp3', description: 'ترقيق' },
        ],
        quiz: {
            question: 'متى تفخم لام لفظ الجلالة (الله)؟',
            options: ['إذا سبقها كسر', 'إذا سبقها فتح أو ضم', 'دائماً', 'إذا جاءت في أول الآية فقط'],
            correctAnswer: 1
        }
    }
];

const TajweedEducation: React.FC<{ onBack: () => void, onNavigateToMushaf?: () => void }> = ({ onBack, onNavigateToMushaf }) => {
    const { theme } = useTheme();
    const [selectedRule, setSelectedRule] = useState<string | null>(null);
    const [playingAudio, setPlayingAudio] = useState<string | null>(null);
    const [recordingId, setRecordingId] = useState<string | null>(null);
    const [userRecordings, setUserRecordings] = useState<Record<string, string>>({});
    const [completedRules, setCompletedRules] = useState<string[]>([]);
    const [quizAnswers, setQuizAnswers] = useState<Record<string, boolean>>({});
    
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const userAudioRef = useRef<HTMLAudioElement | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    useEffect(() => {
        const savedProgress = localStorage.getItem('tajweed_progress');
        if (savedProgress) {
            setCompletedRules(JSON.parse(savedProgress));
        }
    }, []);

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

    const playAudio = (url: string) => {
        if (!audioRef.current) audioRef.current = new Audio();
        else audioRef.current.pause();

        if (playingAudio === url) {
            setPlayingAudio(null);
            return;
        }

        setPlayingAudio(url);
        audioRef.current.src = url;
        audioRef.current.play().catch(err => {
            console.error(`Audio playback failed:`, err);
            setPlayingAudio(null);
        });

        audioRef.current.onended = () => setPlayingAudio(null);
    };

    const playUserRecording = (url: string) => {
        if (!userAudioRef.current) userAudioRef.current = new Audio();
        else userAudioRef.current.pause();

        userAudioRef.current.src = url;
        userAudioRef.current.play();
    };

    const startRecording = async (exampleId: string) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);
                setUserRecordings(prev => ({ ...prev, [exampleId]: audioUrl }));
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setRecordingId(exampleId);
        } catch (err) {
            console.error("Microphone access denied", err);
            alert("يرجى السماح بالوصول إلى الميكروفون لتسجيل قراءتك والمقارنة.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setRecordingId(null);
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

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-screen bg-transparent text-[var(--text-color)] flex flex-col overflow-hidden"
            dir="rtl"
            style={{ fontFamily: theme.font }}
        >
            {/* Header */}
            <div className="px-4 py-4 flex flex-col shadow-lg shrink-0" style={{ backgroundColor: `rgba(var(--top-bar-rgb), 1)`, color: 'var(--top-bar-text)' }}>
                <div className="flex items-center mb-4 relative">
                    {onNavigateToMushaf && (
                        <button onClick={onNavigateToMushaf} className="absolute right-0 p-2 hover:bg-white/10 rounded-full transition-colors z-10" title="العودة للقراءة">
                            <i className="fa-solid fa-book-quran text-xl"></i>
                        </button>
                    )}
                    <div className="flex flex-col w-full text-center">
                        <h1 className="text-xl font-bold">دورة التجويد التفاعلية</h1>
                        <span className="text-xs opacity-80 mt-1">تعلم، استمع، سجل، واختبر نفسك</span>
                    </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-black/20 rounded-full h-2.5 mb-1">
                    <div className="h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%`, backgroundColor: theme.palette[0] }}></div>
                </div>
                <div className="flex justify-between text-xs font-bold opacity-90">
                    <span>مستوى التقدم</span>
                    <span>{progressPercentage}%</span>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pb-24 p-4">
                <div className="space-y-4">
                    {TAJWEED_RULES.map((rule) => {
                        const isCompleted = completedRules.includes(rule.id);
                        const isOpen = selectedRule === rule.id;

                        return (
                            <div key={rule.id} className="rounded-2xl overflow-hidden shadow-sm border transition-all" style={{ backgroundColor: 'var(--card-bg)', borderColor: isCompleted ? theme.palette[0] : 'var(--card-border)', color: 'var(--text-color)' }}>
                                <button 
                                    onClick={() => setSelectedRule(isOpen ? null : rule.id)}
                                    className="w-full flex items-center justify-between p-4 text-right transition-colors"
                                    style={{ backgroundColor: isOpen ? 'var(--card-bg-hover)' : 'transparent' }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-10 rounded-full" style={{ backgroundColor: rule.color }}></div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-lg">{rule.title}</span>
                                            {isCompleted && <span className="text-xs font-bold" style={{ color: theme.palette[0] }}><i className="fa-solid fa-check-circle ml-1"></i>مكتمل</span>}
                                        </div>
                                    </div>
                                    <i className={`fa-solid fa-chevron-down opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
                                </button>

                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-4 pb-6 pt-2 border-t" style={{ borderColor: 'var(--card-border)' }}>
                                                
                                                {/* Description & Poem */}
                                                <div className="p-4 rounded-xl mb-6" style={{ backgroundColor: `${theme.palette[0]}15` }}>
                                                    <p className="text-sm leading-relaxed mb-3">{rule.description}</p>
                                                    {rule.articulationPoint && (
                                                        <div className="flex items-center gap-2 text-xs mb-3 font-bold" style={{ color: theme.palette[0] }}>
                                                            <i className="fa-solid fa-head-side-cough"></i>
                                                            <span>مخرج الحرف: {rule.articulationPoint}</span>
                                                        </div>
                                                    )}
                                                    <div className="border-t pt-3 mt-3" style={{ borderColor: `${theme.palette[0]}30` }}>
                                                        <span className="text-xs font-bold block mb-1" style={{ color: theme.palette[0] }}>من تحفة الأطفال / الجزرية:</span>
                                                        <p className="text-sm font-serif whitespace-pre-line leading-loose text-center" style={{ color: theme.palette[1] || theme.palette[0] }}>{rule.poem}</p>
                                                    </div>
                                                </div>
                                                
                                                {/* Examples & Recording */}
                                                <div className="space-y-4 mb-8">
                                                    <h4 className="text-sm font-bold border-b pb-2" style={{ borderColor: 'var(--card-border)' }}>التدريب العملي (استمع وسجل)</h4>
                                                    {rule.examples.map((example) => (
                                                        <div key={example.id} className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--card-bg-hover)', borderColor: 'var(--card-border)' }}>
                                                            <div className="mb-4 text-center">
                                                                {renderAyah(example.fullAyah, example.highlightedWord, rule.color)}
                                                                {example.description && <span className="block text-xs mt-2 opacity-60">{example.description}</span>}
                                                            </div>
                                                            
                                                            <div className="flex items-center justify-center gap-4 border-t pt-3" style={{ borderColor: 'var(--card-border)' }}>
                                                                {/* Play Sheikh Audio */}
                                                                <button 
                                                                    onClick={() => playAudio(example.audioUrl)}
                                                                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all"
                                                                    style={{ 
                                                                        backgroundColor: playingAudio === example.audioUrl ? theme.palette[0] : 'var(--card-bg)', 
                                                                        color: playingAudio === example.audioUrl ? 'white' : theme.palette[0],
                                                                        border: `1px solid ${theme.palette[0]}`
                                                                    }}
                                                                >
                                                                    <i className={`fa-solid ${playingAudio === example.audioUrl ? 'fa-pause' : 'fa-play'}`}></i>
                                                                    الشيخ
                                                                </button>

                                                                {/* Record User Audio */}
                                                                <button 
                                                                    onClick={() => recordingId === example.id ? stopRecording() : startRecording(example.id)}
                                                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${recordingId === example.id ? 'bg-red-500 text-white animate-pulse' : ''}`}
                                                                    style={{ 
                                                                        backgroundColor: recordingId === example.id ? undefined : 'var(--card-bg)', 
                                                                        color: recordingId === example.id ? undefined : '#ef4444',
                                                                        border: `1px solid #ef4444`
                                                                    }}
                                                                >
                                                                    <i className={`fa-solid ${recordingId === example.id ? 'fa-stop' : 'fa-microphone'}`}></i>
                                                                    {recordingId === example.id ? 'إيقاف' : 'سجل'}
                                                                </button>

                                                                {/* Play User Audio */}
                                                                {userRecordings[example.id] && (
                                                                    <button 
                                                                        onClick={() => playUserRecording(userRecordings[example.id])}
                                                                        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
                                                                        style={{ 
                                                                            backgroundColor: `${theme.palette[1] || theme.palette[0]}20`, 
                                                                            color: theme.palette[1] || theme.palette[0],
                                                                            border: `1px solid ${theme.palette[1] || theme.palette[0]}50`
                                                                        }}
                                                                    >
                                                                        <i className="fa-solid fa-headphones"></i>
                                                                        قراءتك
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Quiz Section */}
                                                <div className="p-5 rounded-xl border" style={{ backgroundColor: 'var(--card-bg-hover)', borderColor: 'var(--card-border)' }}>
                                                    <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
                                                        <i className="fa-solid fa-clipboard-question text-amber-500"></i>
                                                        اختبر نفسك
                                                    </h4>
                                                    <p className="text-sm mb-4">{rule.quiz.question}</p>
                                                    <div className="space-y-2">
                                                        {rule.quiz.options.map((opt, idx) => {
                                                            const isAnswered = quizAnswers[rule.id] !== undefined;
                                                            const isCorrect = idx === rule.quiz.correctAnswer;
                                                            
                                                            let btnStyle: React.CSSProperties = {
                                                                width: '100%',
                                                                textAlign: 'right',
                                                                padding: '0.75rem',
                                                                borderRadius: '0.5rem',
                                                                fontSize: '0.875rem',
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
                                                                    className="hover:opacity-80"
                                                                    style={btnStyle}
                                                                >
                                                                    {opt}
                                                                    {isAnswered && isCorrect && <i className="fa-solid fa-check float-left mt-1"></i>}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                    {quizAnswers[rule.id] === false && (
                                                        <p className="text-xs text-red-500 mt-3 font-bold">إجابة خاطئة، حاول مراجعة الشرح أعلاه.</p>
                                                    )}
                                                    {quizAnswers[rule.id] === true && (
                                                        <p className="text-xs mt-3 font-bold" style={{ color: theme.palette[0] }}>أحسنت! إجابة صحيحة.</p>
                                                    )}
                                                </div>

                                                {/* Mushaf Integration Button */}
                                                {onNavigateToMushaf && (
                                                    <button 
                                                        onClick={onNavigateToMushaf}
                                                        className="w-full mt-4 py-3 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98]"
                                                        style={{ backgroundColor: theme.palette[0] }}
                                                    >
                                                        <i className="fa-solid fa-book-open"></i>
                                                        تطبيق عملي في المصحف
                                                    </button>
                                                )}

                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            <BottomBar onHomeClick={onBack} onThemesClick={() => {}} showThemes={false} />
        </motion.div>
    );
};

export default TajweedEducation;
