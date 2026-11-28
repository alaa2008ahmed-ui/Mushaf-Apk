// Cached loaders for Tafseer & Meanings when searching from those reading pages
let cachedTafseerMap: Map<string, string> | null = null;
let cachedMeaningsMap: Map<string, string> | null = null;

export const loadTafseerMap = async (): Promise<Map<string, string> | null> => {
    if (cachedTafseerMap) return cachedTafseerMap;
    try {
        const res = await fetch('/assets/data/ar.jalalayn.json');
        const data = await res.json();
        const surahs = data?.data?.surahs;
        if (Array.isArray(surahs)) {
            const map = new Map<string, string>();
            surahs.forEach((surah: any) => {
                const sNum = surah?.number;
                if (!sNum || !Array.isArray(surah.ayahs)) return;
                surah.ayahs.forEach((ayah: any) => {
                    if (ayah?.numberInSurah && ayah?.text) {
                        map.set(`${sNum}:${ayah.numberInSurah}`, ayah.text);
                    }
                });
            });
            cachedTafseerMap = map;
            return cachedTafseerMap;
        }
    } catch (e) {
        console.error('Failed to load Tafseer for search:', e);
    }
    return null;
};

export const loadMeaningsMap = async (): Promise<Map<string, string> | null> => {
    if (cachedMeaningsMap) return cachedMeaningsMap;
    try {
        const res = await fetch('/tafseer.json');
        const data = await res.json();
        if (Array.isArray(data)) {
            const map = new Map<string, string>();
            data.forEach((item: any) => {
                if (item?.number && item?.aya && item?.text) {
                    map.set(`${item.number}:${item.aya}`, item.text);
                }
            });
            cachedMeaningsMap = map;
            return cachedMeaningsMap;
        }
    } catch (e) {
        console.error('Failed to load Meanings for search:', e);
    }
    return null;
};

export const stripTajweedTags = (text: string) => {
    return text;
};

export const fixQuranText = (text: string) => {
    if (!text) return "";
    return text.replace(/۞/g, '');
};

export const normalizeArabic = (text: string) => {
    if (!text) return '';
    const normalized = stripTajweedTags(text);
    return normalized
        .replace(/\u0670/g, "ا")
        .replace(/[\u0610-\u061A\u064B-\u065F\u06D6-\u06ED\u0640]/g, "")
        .replace(/\u06E6/g, "ي")
        .replace(/\u06E5/g, "و")
        .replace(/[أإآٱ]/g, "ا")
        .replace(/ة/g, "ه")
        .replace(/[ىي]/g, "ي")
        .replace(/ذالِك/g, "ذلك")
        .replace(/\bذالك\b/g, "ذلك")
        .replace(/\bالرحمان\b/g, "الرحمن")
        .replace(/\bهاذا\b/g, "هذا")
        .replace(/\bإلااه\b/g, "إله")
        .replace(/\s+/g, " ")
        .trim();
};

export interface SearchMatchers {
    q: string;
    normQ: string;
    hasLatinChars: boolean;
    hasArabicChars: boolean;
    arabicRegex: RegExp | null;
    englishRegex: RegExp | null;
    activeHighlightRegex: RegExp | null;
    isNumberSearch: boolean;
    searchNum: number;
    searchWordsAr: string[];
    matchArabic: (text: string) => boolean;
    matchEnglish: (text: string) => boolean;
    matchItem: (arText: string, enText?: string, arExtra?: string, enExtra?: string) => boolean;
}

export const buildSearchMatchers = (q: string, isEn: boolean): SearchMatchers => {
    const hasLatinChars = /[a-zA-Z]/.test(q);
    const hasArabicChars = /[\u0600-\u06FF]/.test(q);
    const normQ = normalizeArabic(q);

    // Regex for Quran Arabic text with strict word boundary separation:
    // innerGap: diacritics/tashkeel/dagger-alif within a word (NO whitespace permitted)
    // wordGap: whitespace + diacritics between words
    const innerGap = '[\\u0610-\\u061A\\u064B-\\u065F\\u0670\\u06D6-\\u06ED\\u0640]*';
    const wordGap = '[\\s\\u0610-\\u061A\\u064B-\\u065F\\u0670\\u06D6-\\u06ED\\u0640]+';

    const wordsAr = normQ.split(/\s+/).filter(Boolean);
    const wordPatterns = wordsAr.map(w => {
        return w.split('').map(c => (
            c === 'ا' ? '[أإآٱا\\u0670]' :
            (c === 'ه' ? '[هة]' :
            (c === 'ي' ? '[يى]' : c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
        )).join(innerGap);
    });

    const highlightPattern = wordPatterns.join(wordGap);

    let arabicRegex: RegExp | null = null;
    try {
        arabicRegex = new RegExp(highlightPattern, 'gi');
    } catch (e) {
        arabicRegex = null;
    }

    // Regex for English text
    const englishWords = q
        .toLowerCase()
        .split(/\s+/)
        .map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .filter(Boolean);

    let englishRegex: RegExp | null = null;
    if (englishWords.length > 0) {
        try {
            englishRegex = new RegExp(`(${englishWords.join('|')})`, 'gi');
        } catch (e) {
            englishRegex = null;
        }
    }

    const isNumberSearch = /^[0-9\u0660-\u0669]+$/.test(q);
    const searchNum = isNumberSearch ? parseInt(q.replace(/[٠-٩]/g, d => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)]), 10) : -1;

    const searchWordsAr = normQ.split(/\s+/).filter(Boolean);
    const matchArabic = (text: string) => {
        if (!text) return false;
        const normText = normalizeArabic(text);
        if (!normText) return false;

        // 1. Direct match on normalized text (preserves word boundaries and spaces)
        if (normText.includes(normQ)) return true;

        // 2. Exact word boundary regex match (handles Uthmani diacritics / dagger alif)
        if (arabicRegex) {
            const freshRegex = new RegExp(arabicRegex.source, 'gi');
            if (freshRegex.test(text)) return true;
        }

        // 3. Multi-word phrase search: ensure every query word exists in normalized target text
        if (searchWordsAr.length > 1) {
            return searchWordsAr.every(word => normText.includes(word));
        }

        return false;
    };

    const matchEnglish = (text: string) => {
        if (!text || englishWords.length === 0) return false;
        const lower = text.toLowerCase();
        return englishWords.every(word => lower.includes(word));
    };

    const matchItem = (arText: string, enText?: string, arExtra?: string, enExtra?: string) => {
        if (isEn) {
            return matchEnglish(enText || '') || matchEnglish(enExtra || '');
        }
        return matchArabic(arText) || (arExtra ? matchArabic(arExtra) : false);
    };

    const activeHighlightRegex = isEn ? englishRegex : arabicRegex;

    return {
        q,
        normQ,
        hasLatinChars,
        hasArabicChars,
        arabicRegex,
        englishRegex,
        activeHighlightRegex,
        isNumberSearch,
        searchNum,
        searchWordsAr,
        matchArabic,
        matchEnglish,
        matchItem,
    };
};
