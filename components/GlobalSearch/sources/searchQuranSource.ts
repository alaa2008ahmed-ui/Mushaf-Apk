import { quranData } from '../../../utils/quran/quranData';
import { SURAH_NAMES_EN } from '../../QuranReader/constants';
import {
    loadQuranEnglishTranslation,
    searchQuranEnglish,
    getCachedQuranEnglishTranslation
} from '../../../utils/quran/quranTranslationHelper';
import {
    loadTafseerMap,
    loadMeaningsMap,
    stripTajweedTags,
    fixQuranText,
    SearchMatchers
} from '../searchHelpers';

export const searchQuranSource = async ({
    matchers,
    isEn,
    sourceReadingMode,
}: {
    matchers: SearchMatchers;
    isEn: boolean;
    sourceReadingMode?: string;
}): Promise<any[]> => {
    const {
        q,
        hasLatinChars,
        hasArabicChars,
        arabicRegex,
        isNumberSearch,
        searchNum,
        searchWordsAr,
        matchArabic,
    } = matchers;

    let enQuranData = getCachedQuranEnglishTranslation();
    if ((isEn || sourceReadingMode === 'bilingual' || sourceReadingMode === 'translation') && !enQuranData) {
        enQuranData = await loadQuranEnglishTranslation();
    }
    let tafseerMap: Map<string, string> | null = null;
    if (sourceReadingMode === 'tafseer') {
        tafseerMap = await loadTafseerMap();
    }
    let meaningsMap: Map<string, string> | null = null;
    if (sourceReadingMode === 'meanings') {
        meaningsMap = await loadMeaningsMap();
    }

    const foundQuran: any[] = [];
    const seenAyahKeys = new Set<string>();

    const isEnglishQuranSearch =
        sourceReadingMode === 'translation' ||
        (isEn && sourceReadingMode !== 'bilingual') ||
        ((sourceReadingMode === 'bilingual') && hasLatinChars && !hasArabicChars);

    if (isEnglishQuranSearch) {
        if (!isNumberSearch && enQuranData && enQuranData.length > 0 && hasLatinChars) {
            const enResults = searchQuranEnglish(q, enQuranData, quranData);
            enResults.forEach(item => {
                const key = `${item.surah}:${item.ayah}`;
                if (!seenAyahKeys.has(key)) {
                    seenAyahKeys.add(key);
                    foundQuran.push(item);
                }
            });
        }
        if (isNumberSearch) {
            for (let sIdx = 0; sIdx < quranData.surahs.length; sIdx++) {
                const surah = quranData.surahs[sIdx];
                for (let aIdx = 0; aIdx < surah.ayahs.length; aIdx++) {
                    const ayah = surah.ayahs[aIdx];
                    const key = `${surah.number}:${ayah.numberInSurah}`;
                    if (ayah.numberInSurah === searchNum && !seenAyahKeys.has(key)) {
                        const enVerse = enQuranData?.[sIdx]?.verses?.[aIdx];
                        const enTransText = enVerse?.translation || '';
                        const surahNameEn = SURAH_NAMES_EN[surah.number - 1] || surah.name;
                        seenAyahKeys.add(key);
                        foundQuran.push({
                            type: 'quran',
                            text: fixQuranText(ayah.text),
                            textEn: enTransText,
                            surah: surah.number,
                            surahName: surah.name,
                            surahNameEn,
                            ayah: ayah.numberInSurah,
                            page: ayah.page,
                            juz: ayah.juz,
                            highlightRegex: null
                        });
                    }
                }
            }
        }
    } else if ((arabicRegex && searchWordsAr.length > 0) || isNumberSearch) {
        for (let sIdx = 0; sIdx < quranData.surahs.length; sIdx++) {
            const surah = quranData.surahs[sIdx];
            for (let aIdx = 0; aIdx < surah.ayahs.length; aIdx++) {
                const ayah = surah.ayahs[aIdx];
                const key = `${surah.number}:${ayah.numberInSurah}`;
                const enVerse = enQuranData?.[sIdx]?.verses?.[aIdx];
                const enTransText = enVerse?.translation || '';
                const surahNameEn = SURAH_NAMES_EN[surah.number - 1] || surah.name;
                const tafseerText = sourceReadingMode === 'tafseer' ? (tafseerMap?.get(key) || '') : '';
                const meaningsText = sourceReadingMode === 'meanings' ? (meaningsMap?.get(key) || '') : '';

                if (isNumberSearch && ayah.numberInSurah === searchNum) {
                    seenAyahKeys.add(key);
                    foundQuran.push({
                        type: 'quran',
                        text: fixQuranText(ayah.text),
                        textEn: enTransText,
                        tafseerText,
                        meaningsText,
                        surah: surah.number,
                        surahName: surah.name,
                        surahNameEn,
                        ayah: ayah.numberInSurah,
                        page: ayah.page,
                        juz: ayah.juz,
                        highlightRegex: null
                    });
                } else if (!isNumberSearch) {
                    const cleanText = stripTajweedTags(ayah.text);
                    const ayahMatched = matchArabic(cleanText) || (arabicRegex ? new RegExp(arabicRegex.source, 'gi').test(cleanText) : false);
                    const tafseerMatched = sourceReadingMode === 'tafseer' && Boolean(tafseerText) && (matchArabic(tafseerText) || (arabicRegex ? new RegExp(arabicRegex.source, 'gi').test(tafseerText) : false));
                    const meaningsMatched = sourceReadingMode === 'meanings' && Boolean(meaningsText) && (matchArabic(meaningsText) || (arabicRegex ? new RegExp(arabicRegex.source, 'gi').test(meaningsText) : false));

                    if (ayahMatched || tafseerMatched || meaningsMatched) {
                        seenAyahKeys.add(key);
                        foundQuran.push({
                            type: 'quran',
                            text: fixQuranText(ayah.text),
                            textEn: enTransText,
                            tafseerText,
                            meaningsText,
                            ayahMatched,
                            tafseerMatched,
                            meaningsMatched,
                            surah: surah.number,
                            surahName: surah.name,
                            surahNameEn,
                            ayah: ayah.numberInSurah,
                            page: ayah.page,
                            juz: ayah.juz,
                            highlightRegex: arabicRegex
                        });
                    }
                }
            }
        }
    }

    return foundQuran;
};
