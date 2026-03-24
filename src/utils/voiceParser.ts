
/**
 * Voice Command Parser Utility for Quran App
 * Handles normalization, number conversion, and regex-based command extraction.
 */

export const ARABIC_NUMBERS_MAP: Record<string, number> = {
    'واحد': 1, 'واحدة': 1, 'اول': 1, 'الأول': 1, 'اولى': 1,
    'اثنان': 2, 'اثنين': 2, 'ثاني': 2, 'الثاني': 2,
    'ثلاثة': 3, 'ثلاث': 3, 'ثالث': 3, 'الثالث': 3,
    'اربعة': 4, 'اربع': 4, 'رابع': 4, 'الرابع': 4,
    'خمسة': 5, 'خمس': 5, 'خامس': 5, 'الخامس': 5,
    'ستة': 6, 'ست': 6, 'سادس': 6, 'السادس': 6,
    'سبعة': 7, 'سبع': 7, 'سابع': 7, 'السابع': 7,
    'ثمانية': 8, 'ثمان': 8, 'ثامن': 8, 'الثامن': 8,
    'تسعة': 9, 'تسع': 9, 'تاسع': 9, 'التاسع': 9,
    'عشرة': 10, 'عشر': 10, 'عاشر': 10, 'العاشر': 10,
    'احد عشر': 11, 'اثنا عشر': 12, 'ثلاثة عشر': 13, 'اربعة عشر': 14, 'خمسة عشر': 15,
    'ستة عشر': 16, 'سبعة عشر': 17, 'ثمانية عشر': 18, 'تسعة عشر': 19,
    'عشرون': 20, 'عشرين': 20,
    'ثلاثون': 30, 'ثلاثين': 30,
    'اربعون': 40, 'اربعين': 40,
    'خمسون': 50, 'خمسين': 50,
    'ستون': 60, 'ستين': 60,
    'سبعون': 70, 'سبعين': 70,
    'ثمانون': 80, 'ثمانين': 80,
    'تسعون': 90, 'تسعين': 90,
    'مائة': 100, 'مئة': 100,
    'مائتان': 200, 'مئتان': 200,
    'ثلاثمائة': 300, 'اربعمائة': 400, 'خمسمائة': 500,
    'ستمائة': 600, 'سبعمائة': 700, 'ثمانمائة': 800, 'تسعمائة': 900,
    'الف': 1000
};

/**
 * Normalizes Arabic text for better matching
 */
export const normalizeArabic = (text: string): string => {
    if (!text) return '';
    return text
        .trim()
        .replace(/[\u064B-\u0652]/g, '') // Remove Tashkeel
        .replace(/[أإآ]/g, 'ا')
        .replace(/ة/g, 'ه')
        .replace(/ى/g, 'ي')
        .replace(/\s+/g, ' ')
        .toLowerCase();
};

/**
 * Converts Arabic word-based numbers to digits
 */
export const arabicWordsToNumber = (text: string): number | null => {
    if (!text) return null;
    
    // Check if it's already digits
    const digitsMatch = text.match(/\d+/);
    if (digitsMatch) return parseInt(digitsMatch[0], 10);

    const words = text.split(/[\sو]+/); // Split by space or 'و'
    let total = 0;
    let current = 0;

    for (const word of words) {
        const normWord = normalizeArabic(word);
        if (ARABIC_NUMBERS_MAP[normWord] !== undefined) {
            const val = ARABIC_NUMBERS_MAP[normWord];
            if (val >= 100) {
                if (current === 0) current = 1;
                total += current * val;
                current = 0;
            } else {
                current += val;
            }
        }
    }
    total += current;
    return total > 0 ? total : null;
};

export interface ParsedCommand {
    action: string;
    params?: Record<string, any>;
    originalText: string;
}

/**
 * Main parser for voice commands
 */
export const parseVoiceCommand = (
    text: string, 
    surahNames: string[], 
    customCommands: any[] = []
): ParsedCommand | null => {
    const normalized = normalizeArabic(text);
    
    // 1. Check Custom Commands first (Dynamic Commands)
    for (const cmd of customCommands) {
        const normPhrase = normalizeArabic(cmd.phrase);
        if (normalized.includes(normPhrase)) {
            return { action: cmd.action, originalText: text };
        }
    }

    // 2. Font Size Control: "خط" + [رقم]
    const fontRegex = /(?:خط|حجم الخط)\s+(?:الي|إلى|الى)?\s*([آ-ي\s\d]+)/;
    const fontMatch = normalized.match(fontRegex);
    if (fontMatch) {
        const num = arabicWordsToNumber(fontMatch[1]);
        if (num) {
            return { action: 'set_font_size', params: { size: num }, originalText: text };
        }
    }

    // 3. Theme Control: "ثيم" or "لون" + [اسم اللون]
    const themeRegex = /(?:ثيم|لون|مظهر)\s+([آ-ي\s]+)/;
    const themeMatch = normalized.match(themeRegex);
    if (themeMatch) {
        const themeName = themeMatch[1].trim();
        // Mapping common Arabic color names to theme IDs
        const themeMap: Record<string, string> = {
            'اخضر': 'green', 'الأخضر': 'green',
            'ازرق': 'blue', 'الأزرق': 'blue',
            'احمر': 'red', 'الأحمر': 'red',
            'اسود': 'dark', 'الأسود': 'dark', 'ليلي': 'dark',
            'ابيض': 'light', 'الأبيض': 'light', 'نهاري': 'light',
            'بني': 'sepia', 'البني': 'sepia', 'قديم': 'sepia'
        };
        const themeId = themeMap[normalizeArabic(themeName)];
        if (themeId) {
            return { action: 'set_theme', params: { theme: themeId }, originalText: text };
        }
    }

    // 4. Relative Commands
    const relativeMap: Record<string, string> = {
        'تكبير': 'increase_font',
        'تصغير': 'decrease_font',
        'ايقاف': 'stop_audio',
        'تشغيل': 'play_audio',
        'التالي': 'next_page',
        'السابق': 'prev_page',
        'رجوع': 'go_back',
        'الرئيسية': 'go_home'
    };
    for (const [key, action] of Object.entries(relativeMap)) {
        if (normalized.includes(normalizeArabic(key))) {
            return { action, originalText: text };
        }
    }

    // 5. Page Logic: "صفحة [رقم]"
    const pageRegex = /(?:صفحه|صفحة)\s+([آ-ي\s\d]+)/;
    const pageMatch = normalized.match(pageRegex);
    if (pageMatch) {
        const num = arabicWordsToNumber(pageMatch[1]);
        if (num && num >= 1 && num <= 604) {
            return { action: 'go_to_page', params: { page: num }, originalText: text };
        }
    }

    // 6. UI Label Matching (Keyword-based)
    const uiKeywords = [
        'الاعدادات', 'المسبحه', 'القبله', 'البحث', 'العلامات', 'التجويد', 
        'الاذكار', 'الصلاه', 'التقويم', 'الحج', 'العمره', 'الاربعون', 'الحاسبه',
        'الاستماع', 'الادعيه', 'المصحف', 'الرئيسيه', 'الثيمات'
    ];
    for (const keyword of uiKeywords) {
        if (normalized.includes(normalizeArabic(keyword))) {
            return { action: 'ui_click', params: { label: keyword }, originalText: text };
        }
    }

    // 7. Juz Logic: "جزء [رقم]"
    const juzRegex = /(?:جزء)\s+([آ-ي\s\d]+)/;
    const juzMatch = normalized.match(juzRegex);
    if (juzMatch) {
        const num = arabicWordsToNumber(juzMatch[1]);
        if (num && num >= 1 && num <= 30) {
            return { action: 'go_to_juz', params: { juz: num }, originalText: text };
        }
    }

    // 4. Surah & Ayah Logic
    // Pattern: "[اسم السورة] آية [رقم]" or just "[اسم السورة]"
    for (let i = 0; i < surahNames.length; i++) {
        const surahName = normalizeArabic(surahNames[i]);
        if (normalized.includes(surahName)) {
            const surahId = i + 1;
            
            // Check for Ayah
            const ayahRegex = new RegExp(`${surahName}\\s+(?:آيه|آية)\\s+([آ-ي\\s\\d]+)`);
            const ayahMatch = normalized.match(ayahRegex);
            
            if (ayahMatch) {
                const ayahNum = arabicWordsToNumber(ayahMatch[1]);
                if (ayahNum) {
                    return { 
                        action: 'go_to_ayah', 
                        params: { surah: surahId, ayah: ayahNum }, 
                        originalText: text 
                    };
                }
            }
            
            // If only surah name was mentioned
            return { action: 'go_to_surah', params: { surah: surahId }, originalText: text };
        }
    }

    return null;
};
