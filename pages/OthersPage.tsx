import React, { useState, useEffect, useRef } from 'react';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { motion, AnimatePresence } from 'framer-motion';
import BottomBar from '../components/BottomBar';
import ThemePageLock from '../components/ThemePageLock';
import { useTheme } from '../context/ThemeContext';
import { shareAsImage } from '../utils/shareAsImage';
import { playTTS, stopTTS, subscribeTTS } from '../utils/ttsEngine';

interface OthersPageProps {
  onBack: () => void;
  onNavigate: (pageId: string, params?: any) => void;
  onOpenThemes?: () => void;
}

interface RuqyahItem {
  id: string;
  type: 'quran' | 'sunnah';
  title: string;
  text: string;
  source: string;
}

// Complete, rich, and high-fidelity Ruqyah scriptures (الآيات والأدعية بكثافة)
const RUQYAH_DATA: RuqyahItem[] = [
  // --- 1. QURANIC RUQYAH ---
  {
    id: 'rq_quran_1',
    type: 'quran',
    title: 'سورة الفاتحة',
    text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ (١) الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ (٢) الرَّحْمَٰنِ الرَّحِيمِ (٣) مَالِكِ يَوْمِ الدِّينِ (٤) إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ (٥) اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ (٦) صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ (٧)',
    source: 'القرآن الكريم'
  },
  {
    id: 'rq_quran_2',
    type: 'quran',
    title: 'سورة البقرة (الآيات ١ - ٥)',
    text: 'الم (١) ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِلْمُتَّقِينَ (٢) الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنْفِقُونَ (٣) وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنْزِلَ إِلَيْكَ وَمَا أُنْزِلَ مِنْ قَبْلِكَ وَبِالْآخِرَةِ هُمْ يُوقِنُونَ (٤) أُولَٰئِكَ عَلَىٰ هُدًى مِنْ رَبِّهِمْ ۖ وَأُولَٰئِكَ هُمُ الْمُفْلِحُونَ (٥)',
    source: 'القرآن الكريم'
  },
  {
    id: 'rq_quran_3',
    type: 'quran',
    title: 'آية الكرسي (آية التحصين والوقاية العظمى)',
    text: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    source: 'القرآن الكريم'
  },
  {
    id: 'rq_quran_4',
    type: 'quran',
    title: 'أواخر سورة البقرة (الآيات ٢٨٤ - ٢٨٦)',
    text: 'لِلَّهِ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ وَإِنْ تُبْدُوا مَا فِي أَنْفُسِكُمْ أَوْ تُخْفُوهُ يُحَاسِبْكُمْ بِهِ اللَّهُ ۖ فَيَغْفِرُ لِمَنْ يَشَاءُ وَيُعَذِّبُ مَنْ يَشَاءُ ۗ وَاللَّهُ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ (٢٨٤) آمَنَ الرَّسُولُ بِمَا أُنْزلَ إِلَيْهِ مِنْ رَبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِنْ رُسُلِهِ ۚ وَقَالُوا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ (٢٨٥) لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَا إِنْ نَسِينَا أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِنْ قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ ۖ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا ۚ أَنْتَ مَوْلَانَا فَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ (٢٨٦)',
    source: 'القرآن الكريم'
  },
  {
    id: 'rq_quran_5',
    type: 'quran',
    title: 'آيات إبطال السحر والعين (سورة الأعراف)',
    text: 'وَأَوْحَيْنَا إِلَىٰ مُوسَىٰ أَنْ أَلْقِ عَصَاكَ ۖ فَإِذَا هِيَ تَلْقَفُ مَا يَأْفِكُونَ (١١٧) فَوَقَعَ الْحَقُّ وَبَطَلَ مَا كَانُوا يَعْمَلُونَ (١١٨) فَغُلِبُوا هُنَالِكَ وَانْقَلَبُوا صَاغِرِينَ (١١٩) وَأُلْقِيَ السَّحَرَةُ سَاجِدِينَ (١٢٠) قَالُوا آمَنَّا بِرَبِّ الْعَالَمِينَ (١٢١) رَبِّ مُوسَىٰ وَهَارُونَ (١٢٢)',
    source: 'القرآن الكريم'
  },
  {
    id: 'rq_quran_6',
    type: 'quran',
    title: 'آيات الشفاء وإبطال السحر (سورة يونس)',
    text: 'فَلَمَّا أَلْقَوْا قَالَ مُوسَىٰ مَا جِئْتُمْ بِهِ السِّحْرُ ۖ إِنَّ اللَّهَ سَيُبْطِلُهُ ۖ إِنَّ اللَّهَ لَا يُصْلِحُ عَمَلَ الْمُفْسِدِينَ (٨١) وَيُحِقُّ اللَّهُ الْحَقَّ بِكَلِمَاتِهِ وَلَوْ كَرِهَ الْمُجْرِمُونَ (٨٢)',
    source: 'القرآن الكريم'
  },
  {
    id: 'rq_quran_7',
    type: 'quran',
    title: 'آية الشفاء واليقين (سورة طه)',
    text: 'وَأَلْقِ مَا فِي يَمِينِكَ تَلْقَفْ مَا صَنَعُوا ۖ إِنَّمَا صَنَعُوا كَيْدُ سَاحِرٍ ۖ وَلَا يُفْلِحُ السَّاحِرُ حَيْثُ أَتَىٰ',
    source: 'القرآن الكريم'
  },
  {
    id: 'rq_quran_8',
    type: 'quran',
    title: 'آيات الحفظ والطمأنينة (سورة المؤمنون)',
    text: 'أَفَحَسِبْتُمْ أَنَّمَا خَلَقْنَاكُمْ عَبَثًا وَأَنَّكُمْ إِلَيْنَا لَا تُرْجَعُونَ (١١٥) فَتَعَالَى اللَّهُ الْمَلِكُ الْحَقُّ ۖ لَا إِلَٰهَ إِلَّا هُوَ رَبُّ الْعَرْشِ الْكَرِيمِ (١١٦) وَمَنْ يَدْعُ مَعَ اللَّهِ إِلَٰهًا آخَرَ لَا بُرْهَانَ لَهُ بِهِ فَإِنَّمَا حِسَابُهُ عِنْدَ رَبِّهِ ۖ إِنَّهُ لَا يُفْلِحُ الْكَافِرُونَ (١١٧) وَقُلْ رَبِّ اغْفِرْ وَارْحَمْ وَأَنْتَ خَيْرُ الرَّاحِمِينَ (١١٨)',
    source: 'القرآن الكريم'
  },
  {
    id: 'rq_quran_9',
    type: 'quran',
    title: 'آيات طرد الشياطين وتثبيت السكينة (سورة الصافات)',
    text: 'وَالصَّافَّاتِ صَفًّا (١) فَالزَّاجِرَاتِ زَجْرًا (٢) فَالتَّالِيَاتِ ذِكْرًا (٣) إِنَّ إِلَٰهَكُمْ لَوَاحِدٌ (٤) رَبُّ السَّمَاوَاتِ وَالْأَرْضِ وَمَا بَيْنَهُمَا وَرَبُّ الْمَشَارِقِ (٥) إِنَّا زَيَّنَّا السَّمَاءَ الدُّنْيَا بِزِينَةٍ الْكَوَاكِبِ (٦) وَحِفْظًا مِنْ كُلِّ شَيْطَانٍ مَارِدٍ (٧) لَا يَسَّمَّعُونَ إِلَى الْمَلَإِ الْأَعْلَىٰ وَيُقْذَفُونَ مِنْ كُلِّ جَانِبٍ (٨) دُحُورًا ۖ وَلَهُمْ عَذَابٌ وَاصِبٌ (٩) إِلَّا مَنْ خَطِفَ الْخَطْفَةَ فَأَتْبَعَهُ شِهَابٌ ثَاقِبٌ (١٠)',
    source: 'القرآن الكريم'
  },
  {
    id: 'rq_quran_10',
    type: 'quran',
    title: 'أواخر سورة الحشر (الآيات ٢١ - ٢٤)',
    text: 'لَوْ أَنْزَلْنَا هَٰذَا الْقُرْآنَ عَلَىٰ جَبَلٍ لَرَأَيْتَهُ خَاشِعًا مُتَصَدِّعًا مِنْ خَشْيَةِ اللَّهِ ۚ وَتِلْكَ الْأَمْثَالُ نَضْرِبُهَا لِلنَّاسِ لَعَلَّهُمْ يَتَفَكَّرُونَ (٢١) هُوَ اللَّهُ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ ۖ عَالِمُ الْغَيْبِ وَالشَّهَادَةِ ۖ هُوَ الرَّحْمَٰنُ الرَّحِيمُ (٢٢) هُوَ اللَّهُ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ الْمَلِكُ الْقُدُّوسُ السَّلَامُ الْمُؤْمِنُ الْمُهَيْمِنُ الْعَزِيزُ الْجَبَّارُ الْمُتَكَبِّرُ ۚ سُبْحَانَ اللَّهِ عَمَّا يُشْرِكُونَ (٢٣) هُوَ اللَّهُ الْخَالِقُ الْبَارِئُ الْمُصَوِّرُ ۖ لَهُ الْأَسْمَاءُ الْحُسْنَىٰ ۚ يُسَبِّحُ لَهُ مَا فِي السَّمَاوَاتِ وَالْأَرْضِ ۖ وَهُوَ الْعَزِيزُ الْحَكِيمُ (٢٤)',
    source: 'القرآن الكريم'
  },
  {
    id: 'rq_quran_11',
    type: 'quran',
    title: 'سورة الكافرون (للبراءة من الشرك)',
    text: 'قُلْ يَا أَيُّهَا الْكَافِرُونَ (١) لَا أَعْبُدُ مَا تَعْبُدُونَ (٢) وَلَا أَنْتُمْ عَابِدُونَ مَا أَعْبُدُ (٣) وَلَا أَنَا عَابِدٌ مَا عَبَدْتُمْ (٤) وَلَا أَنْتُمْ عَابِدُونَ مَا أَعْبُدُ (٥) لَكُمْ دِينُكُمْ وَلِيَ دِينِ (٦)',
    source: 'القرآن الكريم'
  },
  {
    id: 'rq_quran_12',
    type: 'quran',
    title: 'سورة الإخلاص (مكررة)',
    text: 'قُلْ هُوَ اللَّهُ أَحَدٌ (١) اللَّهُ الصَّمَدُ (٢) لَمْ يَلِدْ وَلَمْ يُولَدْ (٣) وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ (٤)',
    source: 'القرآن الكريم'
  },
  {
    id: 'rq_quran_13',
    type: 'quran',
    title: 'سورة الفلق (التحصين من عين الحاسدين)',
    text: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ (١) مِنْ شَرِّ مَا خَلَقَ (٢) وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ (٣) وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ (٤) وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ (٥)',
    source: 'القرآن الكريم'
  },
  {
    id: 'rq_quran_14',
    type: 'quran',
    title: 'سورة الناس (للطرد من وساوس الشيطان)',
    text: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ (١) مَلِكِ النَّاسِ (٢) إِلَٰهِ النَّاسِ (٣) مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ (٤) الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ (٥) مِنَ الْجِنَّةِ وَالنَّاسِ (٦)',
    source: 'القرآن الكريم'
  },

  // --- 2. SUNNAH RUQYAH ---
  {
    id: 'rq_sunnah_1',
    type: 'sunnah',
    title: 'تعويذ بكلمات الله التامات (٣ مرات)',
    text: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.',
    source: 'صحيح مسلم'
  },
  {
    id: 'rq_sunnah_2',
    type: 'sunnah',
    title: 'دعاء الشفاء للرفع وإزالة الأوجاع والأسقام',
    text: 'أَذْهِبِ الْبَاسَ رَبَّ النَّاسِ، وَاشْفِ أَنْتَ الشَّافِي، لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَمًا.',
    source: 'متفق عليه'
  },
  {
    id: 'rq_sunnah_3',
    type: 'sunnah',
    title: 'تعويذ نبوي من الشيطان والعين اللامة',
    text: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّةِ، مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ، وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ.',
    source: 'صحيح البخاري'
  },
  {
    id: 'rq_sunnah_4',
    type: 'sunnah',
    title: 'رقية جبريل عليه السلام لنبينا محمد ﷺ',
    text: 'بِسْمِ اللَّهِ أَرْقِيكَ، مِنْ كُلِّ شَيْءٍ يُؤْذِيكَ، مِنْ شَرِّ كُلِّ نَفْسٍ أَوْ عَيْنِ حَاسِدٍ، اللَّهُ يَشْفِيكَ، بِسْمِ اللَّهِ أَرْقِيكَ.',
    source: 'صحيح مسلم'
  },
  {
    id: 'rq_sunnah_5',
    type: 'sunnah',
    title: 'دعاء الوجع والألم بالبدن (تضع يدك على الوجع)',
    text: 'بسم الله (٣ مرات)، أَعُوذُ بِاللَّهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ (٧ مرات).',
    source: 'صحيح مسلم'
  },
  {
    id: 'rq_sunnah_6',
    type: 'sunnah',
    title: 'التحصين النبوي اليومي الأعظم',
    text: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ.',
    source: 'سنن أبي داود'
  },
  {
    id: 'rq_sunnah_7',
    type: 'sunnah',
    title: 'كفاية العبد وتوكله (٧ مرات)',
    text: 'حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ ۖ عَلَيْهِ تَوَكَّلْتُ ۖ وَهُوَ رَبُّ الْعَرْشِ الْكَرِيمِ.',
    source: 'سنن أبي داود'
  },
  {
    id: 'rq_sunnah_8',
    type: 'sunnah',
    title: 'دعاء تفريج الهم والكرب وصرف ضرر العين والوصب',
    text: 'اللَّهُمَّ اصْرِفْ عَنِّي حَرَّ الْعَيْنِ، وَبَرْدَ الْعَيْنِ، وَوَصَبَ الْعَيْنِ.',
    source: 'مسند أحمد'
  },
  {
    id: 'rq_sunnah_9',
    type: 'sunnah',
    title: 'تعويذ نبوي شامل من شر عباده وهمزات الشياطين',
    text: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ غَضَبِهِ وَعِقَابِهِ، وَشَرِّ عِبَادِهِ، وَمِنْ هَمَزَاتِ الشَّيَاطِينِ وَأَنْ يَحْضُرُونِ.',
    source: 'جامع الترمذي'
  },
  {
    id: 'rq_sunnah_10',
    type: 'sunnah',
    title: 'رقية التربة النبوية بالريق للمريض',
    text: 'بِسْمِ اللَّهِ تُرْبَةُ أَرْضِنَا، بِرِيقَةِ بَعْضِنَا، يُشْفَى سَقِيمُنَا، بِإِذْنِ رَبِّنَا.',
    source: 'متفق عليه'
  },
  {
    id: 'rq_sunnah_11',
    type: 'sunnah',
    title: 'سؤال العافية في البدن والسمع والبصر',
    text: 'اللَّهُمَّ عافِني في بَدَني، اللَّهُمَّ عافِني في سَمْعي، اللَّهُمَّ عافِني في بَصَري، لا إلهَ إلَّا أنتَ.',
    source: 'سنن أبي داود'
  },
  {
    id: 'rq_sunnah_12',
    type: 'sunnah',
    title: 'دعاء التبريك وصرف حر وحسد العين وضررها',
    text: 'اللَّهُمَّ بَارِكْ عَلَيْهِ، وَأَذْهِبْ عَنْهُ حَرَّ الْعَيْنِ وَبَرْدَهَا وَوَصَبَهَا.',
    source: 'مسند أحمد'
  },
  {
    id: 'rq_sunnah_13',
    type: 'sunnah',
    title: 'تعويذ نبوي عظيم لا يجاوزه بر ولا فاجر',
    text: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ الَّتِي لَا يُجَاوِزُهُنَّ بَرٌّ وَلَا فَاجِرٌ مِنْ شَرِّ مَا خَلَقَ، وَبَرَأَ وَذَرَأَ، وَمِنْ شَرِّ مَا يَنْزِلُ مِنَ السَّمَاءِ، وَمِنْ شَرِّ مَا يَعْرُجُ فِيهَا، وَمِنْ شَرِّ مَا ذَرَأَ فِي الْأَرْضِ، وَمِنْ شَرِّ مَا يَخْرُجُ مِنْهَا، وَمِنْ شَرِّ فِتَنِ اللَّيْلِ وَالنَّهَارِ، وَمِنْ شَرِّ كُلِّ طَارِقٍ إِلَّا طَارِقًا يَطْرُقُ بِخَيْرٍ يَا رَحْمَنُ.',
    source: 'مسند أحمد'
  },
  {
    id: 'rq_sunnah_14',
    type: 'sunnah',
    title: 'الاستعاذة بوجه الله الكريم وكلماته التامات',
    text: 'اللَّهُمَّ إِنِّي أَعُوذُ بِوَجْهِكَ الْكَرِيمِ، وَكَلِمَاتِكَ التَّامَّاتِ، مِنْ شَرِّ مَا أَنْتَ آخِذٌ بِنَاصِيَتِهِ، اللَّهُمَّ أَنْتَ تَكْشِفُ الْمَغْرَمَ وَالْمَأْثَمَ.',
    source: 'سنن أبي داود'
  }
];

const OthersPage: React.FC<OthersPageProps> = ({ onBack, onNavigate, onOpenThemes }) => {
  const { theme, themeKey } = useTheme();
  const [activeTab, setActiveTab] = useState<'all' | 'quran' | 'sunnah' | 'favorites' | 'guide'>('quran');
  const [toastMessage, setToastMessage] = useState<string>('');
  const [playingText, setPlayingText] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [zoomedDuaa, setZoomedDuaa] = useState<RuqyahItem | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuOpenDirection, setMenuOpenDirection] = useState<'up' | 'down'>('up');

  const fabRef = useRef<HTMLButtonElement>(null);

  // Subscribe to TTS playing changes
  useEffect(() => {
    const unsubscribe = subscribeTTS(setPlayingText);
    return () => {
      unsubscribe();
      stopTTS();
    };
  }, []);

  // Load favorites from local storage
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('ruqyah_favorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (e) {
      console.error("Failed to load favorites", e);
    }
  }, []);

  // Save favorites to storage
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const newFavs = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      try {
        localStorage.setItem('ruqyah_favorites', JSON.stringify(newFavs));
      } catch (err) {}
      return newFavs;
    });
  };

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  // Clipboard Copier
  const copyToClipboard = async (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      showToast('تم النسخ إلى الحافظة بنجاح');
    } catch (err) {
      showToast('فشل في نسخ النص');
    }
  };

  // Share Helper
  const handleShare = async (item: RuqyahItem, e: React.MouseEvent) => {
    e.stopPropagation();
    await shareAsImage({
      text: item.text,
      source: item.source,
      category: item.type === 'quran' ? 'الرقية من القرآن الكريـم' : 'الرقية من السنة المطهرة',
      theme,
      setToastMessage
    });
  };

  // Play/Stop Audio TTS Handler
  const handlePlayAudio = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (playingText === text) {
      stopTTS();
      setPlayingText(null);
    } else {
      playTTS(text, (msg) => {
        showToast(msg);
      });
    }
  };

  // FAB direction decider on click
  const handleFabClick = () => {
    if (!isMenuOpen && fabRef.current) {
      const rect = fabRef.current.getBoundingClientRect();
      if (rect.top < window.innerHeight / 2) {
        setMenuOpenDirection('down');
      } else {
        setMenuOpenDirection('up');
      }
    }
    setIsMenuOpen(!isMenuOpen);
  };

  // Back interceptor for Capacitor/Android to exit gracefully to home
  useEffect(() => {
    const interceptor = () => {
      if (zoomedDuaa) {
        setZoomedDuaa(null);
        return true;
      }
      if (isMenuOpen) {
        setIsMenuOpen(false);
        return true;
      }
      onNavigate('home');
      return true;
    };
    const unregister = registerBackInterceptor(interceptor);
    return unregister;
  }, [zoomedDuaa, isMenuOpen]);

  const getCardStyle = () => {
    return {
      borderColor: 'var(--card-border)',
      backgroundColor: theme.cardBg || 'rgba(255, 255, 255, 0.8)',
    };
  };

  const getTabStyle = (active: boolean) => {
    if (active) {
      return {
        backgroundColor: theme.palette[0],
        color: '#ffffff',
        borderColor: theme.palette[0]
      };
    }
    return {
      backgroundColor: theme.cardBg || 'rgba(255, 255, 255, 0.5)',
      color: theme.textColor,
      borderColor: theme.palette[0] + '33'
    };
  };

  const isBlackTheme = theme.bgColor === '#000000';

  // Filters items dynamically based on tab state
  const getFilteredItems = () => {
    if (activeTab === 'all') return RUQYAH_DATA;
    if (activeTab === 'favorites') return RUQYAH_DATA.filter(item => favorites.includes(item.id));
    if (activeTab === 'quran') return RUQYAH_DATA.filter(item => item.type === 'quran');
    if (activeTab === 'sunnah') return RUQYAH_DATA.filter(item => item.type === 'sunnah');
    return [];
  };

  const filteredItems = getFilteredItems();

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden relative bg-transparent" style={{ fontFamily: theme.font }}>
      {/* Top Header - Removed Back Arrow Button */}
      <header className="app-top-bar z-20 shrink-0">
        <div className="app-top-bar__inner">
          <div className="relative flex items-center justify-between w-full">
            <div className="w-10"></div> {/* Placeholder to balance centering */}
            <h1 className="app-top-bar__title text-xl sm:text-2xl font-kufi text-center flex-1" style={{ color: theme.textColor }}>
              الرقية الشرعية الشاملة
            </h1>
            <div className="shrink-0 w-10">
              <ThemePageLock />
            </div>
          </div>
          <p className="app-top-bar__subtitle text-xs" style={{ color: theme.textColor + 'aa' }}>
            الآيات والتحصينات النبوية الصحيحة من العين والحسد والمس
          </p>
        </div>
      </header>

      {/* Main Tabs Control */}
      <div className="px-4 py-2 z-20 shrink-0 max-w-2xl mx-auto w-full" dir="rtl">
        <div className="flex rounded-xl p-1 bg-black/5 dark:bg-white/5 border border-black/5 gap-1">
          <button 
            onClick={() => { setActiveTab('quran'); setIsMenuOpen(false); }}
            className="flex-1 py-2.5 rounded-lg text-xs font-black transition-all duration-300 border"
            style={getTabStyle(activeTab === 'quran')}
          >
            📖 الرقية من القرآن
          </button>
          <button 
            onClick={() => { setActiveTab('sunnah'); setIsMenuOpen(false); }}
            className="flex-1 py-2.5 rounded-lg text-xs font-black transition-all duration-300 border"
            style={getTabStyle(activeTab === 'sunnah')}
          >
            ✨ الرقية من السنة
          </button>
          <button 
            onClick={() => { setActiveTab('guide'); setIsMenuOpen(false); }}
            className="flex-1 py-2.5 rounded-lg text-xs font-black transition-all duration-300 border"
            style={getTabStyle(activeTab === 'guide')}
          >
            🌟 دليل الرقية الذاتية
          </button>
        </div>
      </div>

      {/* Main Container */}
      <main className="w-full flex-1 overflow-y-auto px-4 pt-0 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-right pt-2 pb-28" dir="rtl">
          <AnimatePresence mode="wait">
            {/* TABS 1 & 2: QURANIC / SUNNAH / FAVORITES / ALL LISTS */}
            {activeTab !== 'guide' && (
              <React.Fragment>
                {/* Intro Card */}
                <div 
                  className="p-4 rounded-xl border-2 text-right relative overflow-hidden shadow-sm text-xs sm:text-sm leading-relaxed text-justify opacity-95 col-span-full"
                  style={getCardStyle()}
                >
                  <p style={{ color: theme.textColor }}>
                    {activeTab === 'quran' && <span>قال الله تعالى: <span className="font-bold">«وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ»</span>. إليك الموسوعة الكاملة لآيات الرقية الشرعية والتحصين الثابتة، والمنظمة بدقة تامة لتسهيل القراءة والتدبر بنية الشفاء.</span>}
                    {activeTab === 'sunnah' && <span>أدعية الرقية النبوية الشريفة والتعويذات الصحيحة الواردة في الأحاديث الشريفة، وهي من أعظم أسباب دفع العين والمس والتحصين الكامل اليومي.</span>}
                    {activeTab === 'favorites' && <span>قائمتك الخاصة من آيات الرقية الشرعية والتعويذات النبوية المفضلة التي قمت بحفظها للوصول السريع إليها وتلاوتها في أي وقت.</span>}
                    {activeTab === 'all' && <span>الموسوعة الإسلامية الكاملة للرقية الشرعية من الكتاب والسنة المطهرة مرتبة ومتصلة في صفحة واحدة ميسرة للقراءة والتلاوة والاستماع.</span>}
                  </p>
                </div>

                {/* Duas/Verses Cards list (WITHOUT font-bold exactly like image & adia pages) */}
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <div 
                      key={item.id} 
                      className="p-5 rounded-3xl relative transition-all overflow-hidden themed-card group shadow-sm border flex flex-col justify-between" 
                      style={{ 
                        fontFamily: theme.font,
                        borderColor: 'var(--card-border)',
                      }}
                    >
                      {/* Arabic Text (Centered, Large Amiri, WITHOUT FONT-BOLD to match perfectly) */}
                      <p className="text-xl md:text-2xl leading-relaxed text-center font-amiri mb-6" style={{ color: 'var(--text-color)' }}>
                        {item.text}
                      </p>

                      {/* Meta & Interactive Control Line */}
                      <div className="mt-auto pt-4 border-t space-y-4" style={{borderColor: 'var(--card-border)'}}>
                        {/* Quiet metadata Pill (exactly like image) */}
                        <div className="flex justify-center">
                          <span className="text-xs sm:text-sm text-center opacity-70 font-bold bg-black/5 dark:bg-white/5 px-4 py-1.5 rounded-full" style={{ color: 'var(--text-color)' }}>
                            {item.type === 'quran' ? 'الرقية من القرآن الكريم' : 'الرقية من السنة النبوية'} • {item.source}
                          </span>
                        </div>
                        
                        {/* Action buttons bar */}
                        <div className="flex justify-between items-center">
                          {/* Favorite Button (Bottom Right) */}
                          <button 
                            onClick={(e) => toggleFavorite(item.id, e)} 
                            className="w-9 h-9 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors shrink-0"
                          >
                            <i className={`fa-heart ${favorites.includes(item.id) ? 'fa-solid text-red-500' : 'fa-regular opacity-70'}`} style={favorites.includes(item.id) ? {} : { color: 'var(--text-color)' }}></i>
                          </button>

                          {/* Control buttons group (Bottom Left like the image) */}
                          <div className="flex gap-2">
                            {/* Zoom Button */}
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setZoomedDuaa(item);
                              }} 
                              className="w-9 h-9 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100"
                              style={{ color: 'var(--text-color)' }}
                              title="تكبير"
                            >
                              <i className="fa-solid fa-magnifying-glass-plus"></i>
                            </button>

                            {/* Copy Button */}
                            <button 
                              onClick={(e) => copyToClipboard(item.text, e)} 
                              className="w-9 h-9 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100" 
                              style={{ color: 'var(--text-color)' }} 
                              title="نسخ"
                            >
                              <i className="fa-regular fa-copy"></i>
                            </button>

                            {/* Share Button */}
                            <button 
                              onClick={(e) => handleShare(item, e)} 
                              className="w-9 h-9 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100" 
                              style={{ color: 'var(--text-color)' }} 
                              title="مشاركة"
                            >
                              <i className="fa-solid fa-share-nodes"></i>
                            </button>

                            {/* Audio Play/Pause Button */}
                            <button 
                              onClick={(e) => handlePlayAudio(item.text, e)} 
                              className="w-9 h-9 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100" 
                              style={{ color: playingText === item.text ? '#ef4444' : 'var(--text-color)' }}
                              title={playingText === item.text ? "إيقاف الاستماع" : "استماع صوتي"}
                            >
                              <i className={`fa-solid ${playingText === item.text ? 'fa-circle-pause text-red-500 animate-pulse' : 'fa-volume-high'}`}></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center opacity-60 font-bold border-2 border-dashed rounded-3xl col-span-full" style={{ borderColor: 'var(--card-border)' }}>
                    <p>لا يوجد عناصر محفوظة في المفضلة حالياً.</p>
                  </div>
                )}
              </React.Fragment>
            )}

            {/* TABS 3: RUQYAH SELF GUIDE */}
            {activeTab === 'guide' && (
              <div className="space-y-4 text-right col-span-full" dir="rtl">
                {/* Step-by-Step Self Guide */}
                <div 
                  className="p-5 rounded-xl border-2 space-y-4"
                  style={getCardStyle()}
                >
                  <div className="flex items-center gap-2 border-b pb-2">
                    <i className="fa-solid fa-shield-halved text-emerald-500 text-lg"></i>
                    <h3 className="text-base font-black font-kufi" style={{ color: theme.palette[0] }}>
                      دليل الرقية الذاتية (كيف ترقي نفسك وأهلك؟)
                    </h3>
                  </div>

                  <div className="space-y-4 text-xs sm:text-sm leading-relaxed font-bold">
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 font-mono">١</div>
                      <div>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">الوضوء والطهارة الكاملة:</span>
                        <p className="opacity-90 font-normal">استحضر النية الخالصة لله وحده بأن الشفاء بيده سبحانه، وتوضأ وضوءك للصلاة.</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 font-mono">٢</div>
                      <div>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">الالتقاء والمسح والنفث:</span>
                        <p className="opacity-90 font-normal">اجمع كفيك واقرأ فيهما سورة الفاتحة وآية الكرسي والمعوذات، ثم انفث فيهما (نفخ خفيف رقيق مع رذاذ يسير) وامسح بهما وجهك ورأسك وما أقبل من جسدك.</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 font-mono">٣</div>
                      <div>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">الرقية على الماء وزيت الزيتون:</span>
                        <p className="opacity-90 font-normal">قرّب إناء ماء أو زيت زيتون من فمك أثناء قراءة آيات الرقية الشرعية، ثم انفث فيه بعد الانتهاء، واشرب من الماء وامسح أو ادهن مواضع الألم بزيت الزيتون.</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 font-mono">٤</div>
                      <div>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">وضع اليد على موضع الوجع:</span>
                        <p className="opacity-90 font-normal">وضع يدك اليمنى على موضع الألم من جسدك، وركز قلبك ويقينك على قدرة الله في الشفاء، ثم ردد الأذكار النبوية المقررة.</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 font-mono">٥</div>
                      <div>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">الاستمرارية والمحافظة:</span>
                        <p className="opacity-90 font-normal">كرر الرقية يومياً وخاصة في الصباح والمساء، وحافظ بانتظام على أذكار اليوم والليلة لتبقى في حصن إلهي منيع ومستمر.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Important Advisory */}
                <div 
                  className="p-5 rounded-xl border-2 space-y-2 bg-amber-500/5 border-amber-500/10 text-xs sm:text-sm leading-relaxed text-justify opacity-95"
                  style={getCardStyle()}
                >
                  <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                    <i className="fa-solid fa-heart"></i>
                    <span className="font-black text-xs sm:text-sm font-kufi">نصيحة ذهبية للشفاء التام:</span>
                  </div>
                  <p style={{ color: theme.textColor }}>
                    الشفاء الحقيقي هو تفويض الأمر لله وحده والتوكل التام عليه واليقين بأن الكلمات الشريفة هي كلام الله المليء بالأسرار والبركات. لا تبحث عن دجالين أو سحرة، بل ارقِ نفسك وأهلك بنفسك في بيتك، فصوتك ودعاءك الصادق لربك هو أعظم سبل الإجابة والقبول.
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-24 left-1/2 z-[200] bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg font-bold text-sm text-center whitespace-nowrap"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button (FAB) & Menu - EXACTLY matching Adia.tsx and image position */}
      <div className="fixed bottom-20 right-4 z-[90] flex flex-col items-end">
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: menuOpenDirection === 'up' ? 20 : -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: menuOpenDirection === 'up' ? 20 : -20, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className={`absolute right-0 ${menuOpenDirection === 'up' ? 'bottom-full mb-4 origin-bottom-right' : 'top-full mt-4 origin-top-right'} themed-card rounded-2xl shadow-xl border p-2 flex flex-col gap-1 overflow-hidden w-48 z-0`}
              style={{ 
                borderColor: 'var(--card-border)', 
                color: 'var(--text-color)',
                backgroundColor: theme.cardBg || 'rgba(255, 255, 255, 0.95)'
              }}
            >
              <button 
                onClick={() => { setActiveTab('all'); setIsMenuOpen(false); }}
                className={`w-full text-right px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${activeTab === 'all' ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                style={activeTab === 'all' ? { color: isBlackTheme ? '#FFFFFF' : theme.palette[0] } : {}}
              >
                الكل
              </button>
              <button 
                onClick={() => { setActiveTab('favorites'); setIsMenuOpen(false); }}
                className={`w-full text-right px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-between ${activeTab === 'favorites' ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                style={activeTab === 'favorites' ? { color: isBlackTheme ? '#FFFFFF' : theme.palette[0] } : {}}
              >
                المفضلة
                <i className="fa-solid fa-heart text-xs opacity-70"></i>
              </button>
              <div className="h-px bg-black/10 dark:bg-white/10 my-1" />
              
              <button 
                onClick={() => { setActiveTab('quran'); setIsMenuOpen(false); }}
                className={`w-full text-right px-4 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${activeTab === 'quran' ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                style={activeTab === 'quran' ? { color: isBlackTheme ? '#FFFFFF' : theme.palette[0] } : {}}
              >
                الرقية من القرآن
                <i className="fa-solid fa-book text-xs opacity-70"></i>
              </button>

              <button 
                onClick={() => { setActiveTab('sunnah'); setIsMenuOpen(false); }}
                className={`w-full text-right px-4 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${activeTab === 'sunnah' ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                style={activeTab === 'sunnah' ? { color: isBlackTheme ? '#FFFFFF' : theme.palette[0] } : {}}
              >
                الرقية من السنة
                <i className="fa-solid fa-star text-xs opacity-70"></i>
              </button>

              <button 
                onClick={() => { setActiveTab('guide'); setIsMenuOpen(false); }}
                className={`w-full text-right px-4 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${activeTab === 'guide' ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                style={activeTab === 'guide' ? { color: isBlackTheme ? '#FFFFFF' : theme.palette[0] } : {}}
              >
                دليل الرقية الذاتية
                <i className="fa-solid fa-circle-info text-xs opacity-70"></i>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          ref={fabRef}
          onClick={handleFabClick}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer relative z-10 ${themeKey === 'default' ? 'text-black' : (isBlackTheme ? 'text-black' : 'text-white')}`}
          style={
            themeKey === 'default'
            ? { backgroundColor: '#ffffff', border: '1px solid #000000' }
            : { backgroundColor: isBlackTheme ? '#FFFFFF' : theme.palette[0] }
          }
        >
          <i className={`fa-solid ${isMenuOpen ? 'fa-times' : 'fa-list-ul'} text-xl`}></i>
        </button>
      </div>

      {/* Zoom Modal - Matches perfect styling of other pages */}
      {zoomedDuaa && (
        <div 
          className="fixed inset-0 bg-black/80 z-[100] flex justify-center items-center p-4 backdrop-blur-sm" 
          onClick={() => setZoomedDuaa(null)}
        >
          <div 
            className="bg-modal-bg text-modal-text p-8 rounded-3xl w-full max-w-2xl text-center relative scale-in shadow-2xl border-2 border-modal-border flex flex-col max-h-[90vh]" 
            style={{ 
              fontFamily: theme.font,
              backgroundColor: theme.cardBg,
              color: theme.textColor,
              borderColor: theme.palette[0] + '44'
            }} 
            onClick={e => e.stopPropagation()}
            dir="rtl"
          >
            <div className="overflow-y-auto hide-scrollbar flex-1 py-4">
              <div className="text-3xl md:text-4xl leading-relaxed font-amiri">
                {zoomedDuaa.text}
              </div>
              <p className="text-lg mt-6 font-bold" style={{ color: theme.palette[0] }}>
                من {zoomedDuaa.type === 'quran' ? 'الرقية من القرآن الكريم' : 'الرقية من السنة النبوية'}
              </p>
            </div>

            <div className="mt-6 shrink-0">
              <button 
                onClick={() => setZoomedDuaa(null)} 
                className="w-full py-3 rounded-xl font-bold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:opacity-90 transition-opacity"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav Bar - showThemes={false} to delete Themes toggles */}
      <BottomBar 
        onHomeClick={() => onNavigate('home')} 
        onThemesClick={onOpenThemes || (() => {})} 
        showHome={true} 
        showThemes={false} 
      />
    </div>
  );
};

export default OthersPage;
