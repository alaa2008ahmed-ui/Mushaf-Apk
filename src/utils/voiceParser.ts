
/**
 * Voice Command Parser Utility for Quran App
 * Handles normalization, number conversion, and regex-based command extraction.
 */

export const ARABIC_NUMBERS_MAP: Record<string, number> = {
    'واحد': 1, 'واحده': 1, 'اول': 1, 'الاول': 1, 'اولى': 1,
    'اثنان': 2, 'اثنين': 2, 'ثاني': 2, 'الثاني': 2,
    'ثلاثه': 3, 'ثلاث': 3, 'ثالث': 3, 'الثالث': 3,
    'اربعة': 4, 'اربع': 4, 'رابع': 4, 'الرابع': 4, 'اربعه': 4,
    'خمسه': 5, 'خمس': 5, 'خامس': 5, 'الخامس': 5,
    'سته': 6, 'ست': 6, 'سادس': 6, 'السادس': 6,
    'سبعه': 7, 'سبع': 7, 'سابع': 7, 'السابع': 7,
    'ثمانيه': 8, 'ثمان': 8, 'ثامن': 8, 'الثامن': 8,
    'تسعه': 9, 'تسع': 9, 'تاسع': 9, 'التاسع': 9,
    'عشره': 10, 'عشر': 10, 'عاشر': 10, 'العاشر': 10,
    'احد عشر': 11, 'اثنا عشر': 12, 'ثلاثه عشر': 13, 'اربعة عشر': 14, 'اربعه عشر': 14, 'خمسه عشر': 15,
    'سته عشر': 16, 'سبعه عشر': 17, 'ثمانيه عشر': 18, 'تسعه عشر': 19,
    'عشرون': 20, 'عشرين': 20,
    'ثلاثون': 30, 'ثلاثين': 30,
    'اربعون': 40, 'اربعين': 40,
    'خمسون': 50, 'خمسين': 50,
    'ستون': 60, 'ستين': 60,
    'سبعون': 70, 'سبعين': 70,
    'ثمانون': 80, 'ثمانين': 80,
    'تسعون': 90, 'تسعين': 90,
    'مائه': 100, 'مئه': 100,
    'مائتان': 200, 'مئتان': 200,
    'ثلاثمائه': 300, 'اربعمائه': 400, 'خمسمائه': 500,
    'ستمائه': 600, 'سبعمائه': 700, 'ثمانمائه': 800, 'تسعمائه': 900,
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
        .replace(/[ة]/g, 'ه')
        .replace(/[ى]/g, 'ي')
        .replace(/[ؤ]/g, 'و')
        .replace(/[ئ]/g, 'ي')
        .replace(/\bال/g, '') // Remove 'Al-' prefix
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

    // 2. Extract Generic Numbers (Context-Aware)
    const genericNumberMatch = normalized.match(/\d+/);
    const wordNumber = arabicWordsToNumber(normalized);
    const extractedNumber = genericNumberMatch ? parseInt(genericNumberMatch[0], 10) : wordNumber;

    // 3. Font Size Control: "خط" + [رقم]
    const fontRegex = /(?:خط|حجم الخط)\s+(?:الي|إلى|الى)?\s*([آ-ي\s\d]+)/;
    const fontMatch = normalized.match(fontRegex);
    if (fontMatch) {
        const num = arabicWordsToNumber(fontMatch[1]);
        if (num) {
            return { action: 'set_font_size', params: { size: num }, originalText: text };
        }
    }

    // 4. Theme Control: "ثيم" or "سيم" or "لون" + [اسم اللون]
    const themeRegex = /(?:ثيم|سيم|لون|مظهر)\s+([آ-ي\s]+)/;
    const themeMatch = normalized.match(themeRegex);
    if (themeMatch) {
        const themeName = themeMatch[1].trim();
        
        // Main App Themes
        const mainThemeMap: Record<string, string> = {
            'اخضر': 'olive_grove', 'الاخضر': 'olive_grove',
            'ازرق': 'modern_blue', 'الازرق': 'modern_blue',
            'احمر': 'madinah_rose', 'الاحمر': 'madinah_rose',
            'اسود': 'black_and_white', 'الاسود': 'black_and_white', 'ليلي': 'midnight_glass',
            'ابيض': 'default', 'الابيض': 'default', 'نهاري': 'default',
            'بني': 'vintage_paper', 'البني': 'vintage_paper', 'قديم': 'vintage_paper',
            'بنفسجي': 'electric_violet', 'البنفسجي': 'electric_violet',
            'وردي': 'sakura_breeze', 'الوردي': 'sakura_breeze',
            'فيروزي': 'turquoise_gem', 'الفيروزي': 'turquoise_gem',
            'الافتراضي': 'default', 'افتراضي': 'default',
            'ابيض واسود': 'black_and_white',
            'نور الفجر': 'fajr_light',
            'الرمال الذهبيه': 'golden_sand', 'رمال ذهبيه': 'golden_sand',
            'الزيتون المبارك': 'olive_grove', 'زيتون مبارك': 'olive_grove',
            'كسوه الكعبه': 'kaaba_kiswa', 'كعبه': 'kaaba_kiswa', 'الكعبه': 'kaaba_kiswa',
            'ورد المدينه': 'madinah_rose',
            'حدائق الاندلس': 'andalusian_garden',
            'المسجد الازرق': 'blue_mosque',
            'الطين والارض': 'clay_earth',
            'الحجر والرخام': 'slate_stone',
            'ازرق عصري': 'modern_blue',
            'بنفسجي كهربائي': 'electric_violet',
            'نسيم الساكورا': 'sakura_breeze', 'ساكورا': 'sakura_breeze',
            'نيون منتصف الليل': 'midnight_neon', 'نيون': 'midnight_neon',
            'ارجواني ملكي': 'royal_purple', 'ارجواني': 'royal_purple',
            'ليل الصحراء': 'desert_night', 'صحراء': 'desert_night',
            'سلام المحيط': 'ocean_peace', 'محيط': 'ocean_peace',
            'ورق عتيق': 'vintage_paper', 'ورق': 'vintage_paper',
            'غابه عميقه': 'deep_forest', 'غابه': 'deep_forest',
            'ضباب الخزامى': 'lavender_mist', 'خزامى': 'lavender_mist',
            'كريستال شفاف': 'crystal_glass', 'كريستال': 'crystal_glass',
            'زمرد زجاجي': 'frosted_emerald', 'زمرد': 'frosted_emerald',
            'زجاج ليلي': 'midnight_glass', 'زجاج': 'midnight_glass'
        };

        // Quran Reader Themes
        const quranThemeMap: Record<string, string> = {
            'ورق قديم': 'cream',
            'اسود كامل': 'deep_black', 'اسود': 'deep_black', 'الاسود': 'deep_black',
            'عصر ذهبي': 'golden_age', 'ذهبي': 'golden_age',
            'اندلس': 'andalusia',
            'قبه': 'medina', 'القبه': 'medina',
            'تهجد': 'midnight',
            'ازرق سماوي': 'blue_cyan', 'سماوي': 'blue_cyan',
            'مرجان': 'coral',
            'نعنع': 'mint',
            'صندل': 'sandal',
            'زيتون': 'olive',
            'مسجد زمردي': 'emerald_mosque', 'زمردي': 'emerald_mosque',
            'سماء الليل': 'night_sky',
            'اسلامي حديث': 'modern_islamic', 'اسلامي': 'modern_islamic',
            'ضوء القمر الفضي': 'silver_moon', 'فضي': 'silver_moon',
            'كثبان رمليه': 'sand_dunes', 'رملي': 'sand_dunes',
            'زخرفه تيل': 'teal_ornament', 'تيل': 'teal_ornament',
            'ندى الصباح': 'morning_dew', 'صباحي': 'morning_dew',
            'خشب دافئ': 'warm_wood', 'خشبي': 'warm_wood',
            'ليلكي ناعم': 'soft_lilac', 'ليلكي': 'soft_lilac',
            'روضه شريفه': 'medina_green', 'روضه': 'medina_green',
            'ازرق اندلسي': 'andalusian_blue',
            'ورد جوري': 'damascus_rose', 'جوري': 'damascus_rose',
            'فخار': 'clay_pot',
            'لؤلؤي': 'pearl_white',
            'مذهب': 'quranic_gold'
        };

        const normalizedThemeName = normalizeArabic(themeName);
        
        // Check if it matches both (like 'الافتراضي' or 'كعبه' or 'اسود' or 'ابيض' or 'اخضر' or 'ازرق')
        // We will send a special type 'both' if it's ambiguous, or just send both IDs.
        const mainId = mainThemeMap[normalizedThemeName];
        const quranId = quranThemeMap[normalizedThemeName];

        if (mainId && quranId) {
            return { action: 'set_theme', params: { theme: mainId, quranTheme: quranId, type: 'both' }, originalText: text };
        } else if (mainId) {
            return { action: 'set_theme', params: { theme: mainId, type: 'main' }, originalText: text };
        } else if (quranId) {
            return { action: 'set_theme', params: { theme: quranId, type: 'quran' }, originalText: text };
        }
    }

    // 4.5 Open Themes Menu
    if (normalized === 'الثيمات' || normalized === 'ثيمات' || normalized === 'السيمات' || normalized === 'سيمات') {
        return { action: 'open_themes', originalText: text };
    }

    // 5. Action Verbs (Contextual Execution)
    const actionVerbs: Record<string, string> = {
        'نزل': 'download', 'تحميل': 'download',
        'احذف': 'delete', 'مسح': 'delete',
        'شغل': 'play_audio', 'استماع': 'play_audio',
        'وقف': 'stop_audio', 'اسكت': 'stop_audio',
        'كبر': 'increase_font', 'صغر': 'decrease_font',
        'بحث': 'open_search'
    };
    for (const [verb, action] of Object.entries(actionVerbs)) {
        if (normalized.startsWith(normalizeArabic(verb))) {
            const remaining = normalized.replace(normalizeArabic(verb), '').trim();
            return { action, params: { target: remaining }, originalText: text };
        }
    }

    // 6. Global Constants / Relative Commands
    const relativeMap: Record<string, string> = {
        'تكبير': 'increase_font',
        'تصغير': 'decrease_font',
        'ايقاف': 'stop_audio',
        'تشغيل': 'play_audio',
        'التالي': 'next_page',
        'السابق': 'prev_page',
        'رجوع': 'go_back',
        'الرئيسية': 'go_home',
        'الرئيسيه': 'go_home',
        'القراءه الافقيه': 'open_quran_horizontal',
        'القراءة الافقية': 'open_quran_horizontal',
        'القراءه الراسيه': 'open_quran_vertical',
        'القراءة الراسية': 'open_quran_vertical',
        'قراءه افقيه': 'open_quran_horizontal',
        'قراءه راسيه': 'open_quran_vertical',
        'افقي': 'set_orientation_horizontal',
        'رأسي': 'set_orientation_vertical',
        'راسي': 'set_orientation_vertical',
        'عرضي': 'set_orientation_horizontal',
        'طولي': 'set_orientation_vertical',
        'خروج': 'exit_app'
    };
    for (const [key, action] of Object.entries(relativeMap)) {
        if (normalized === normalizeArabic(key)) {
            return { action, originalText: text };
        }
    }

    // 7. Page Logic: "صفحة [رقم]"
    const pageRegex = /(?:صفحه|صفحة)\s+([آ-ي\s\d]+)/;
    const pageMatch = normalized.match(pageRegex);
    if (pageMatch) {
        const num = arabicWordsToNumber(pageMatch[1]);
        if (num && num >= 1 && num <= 604) {
            return { action: 'go_to_page', params: { page: num }, originalText: text };
        }
    }

    // 8. Juz Logic: "جزء [رقم]"
    const juzRegex = /(?:جزء)\s+([آ-ي\s\d]+)/;
    const juzMatch = normalized.match(juzRegex);
    if (juzMatch) {
        const num = arabicWordsToNumber(juzMatch[1]);
        if (num && num >= 1 && num <= 30) {
            return { action: 'go_to_juz', params: { juz: num }, originalText: text };
        }
    }

    // 9. Surah & Ayah Logic
    for (let i = 0; i < surahNames.length; i++) {
        const surahName = normalizeArabic(surahNames[i]);
        if (normalized.includes(surahName)) {
            const surahId = i + 1;
            const ayahRegex = new RegExp(`${surahName}\\s+(?:آيه|آية)?\\s*([آ-ي\\s\\d]+)`);
            const ayahMatch = normalized.match(ayahRegex);
            
            if (ayahMatch) {
                const ayahNum = arabicWordsToNumber(ayahMatch[1].trim());
                if (ayahNum) {
                    return { action: 'go_to_ayah', params: { surah: surahId, ayah: ayahNum }, originalText: text };
                }
            }
            return { action: 'go_to_surah', params: { surah: surahId }, originalText: text };
        }
    }

    // 10. Contextual Number (If just a number is spoken)
    if (extractedNumber) {
        return { action: 'contextual_number', params: { value: extractedNumber }, originalText: text };
    }

    // 11. UI Discovery Fallback (Return as potential UI click)
    return { action: 'ui_discovery', params: { text: normalized }, originalText: text };

    return null;
};
