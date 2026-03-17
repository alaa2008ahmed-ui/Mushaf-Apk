
export interface Theme {
    name: string;
    bgColor: string | null;
    isOriginal?: boolean;
    textColor: string;
    font: string;
    palette: string[];
    barBg?: string;
    barBorder?: string;
    btnBorder?: string;
    btnBg?: string;
    btnText?: string;
    accent?: string;
    highlightText?: string;
}

export const presetThemes: { [key: string]: Theme } = {
    default: {
        name: "الافتراضي",
        bgColor: "#FFFFFF",
        textColor: "#000000",
        font: "'Cairo', sans-serif",
        palette: ["#059669", "#7C3AED", "#047857"],
        barBg: "#FFFFFF",
        barBorder: "1px solid #F3F4F6"
    },
    black_and_white: {
        name: "أبيض وأسود",
        bgColor: "#000000",
        textColor: "#FFFFFF",
        font: "'Cairo', sans-serif",
        palette: ["#000000", "#000000", "#333333"],
        barBg: "#000000",
        barBorder: "1px solid #FFFFFF",
        btnBorder: "1px solid #FFFFFF"
    },
    fajr_light: {
        name: "نور الفجر",
        bgColor: "#F0F9FF",
        textColor: "#0C4A6E",
        font: "'Cairo', sans-serif",
        palette: ["#0284C7", "#0EA5E9", "#38BDF8"],
        barBg: "#E0F2FE",
        barBorder: "1px solid #BAE6FD"
    },
    golden_sand: {
        name: "الرمال الذهبية",
        bgColor: "#FFFBEB",
        textColor: "#451A03",
        font: "'Amiri', serif",
        palette: ["#B45309", "#D97706", "#92400E"],
        barBg: "#FEF3C7",
        barBorder: "1px solid #FDE68A"
    },
    olive_grove: {
        name: "الزيتون المبارك",
        bgColor: "#F7FEE7",
        textColor: "#1A2E05",
        font: "'Scheherazade New', serif",
        palette: ["#4D7C0F", "#65A30D", "#3F6212"],
        barBg: "#ECFCCB",
        barBorder: "1px solid #D9F99D"
    },
    kaaba_kiswa: {
        name: "كسوة الكعبة",
        bgColor: "#000000",
        textColor: "#FCD34D",
        font: "'Amiri', serif",
        palette: ["#F59E0B", "#D97706", "#FFFFFF"],
        barBg: "#111111",
        barBorder: "1px solid #F59E0B"
    },
    madinah_rose: {
        name: "ورد المدينة",
        bgColor: "#FFF1F2",
        textColor: "#881337",
        font: "'Cairo', sans-serif",
        palette: ["#BE123C", "#E11D48", "#9F1239"],
        barBg: "#FFE4E6",
        barBorder: "1px solid #FECDD3"
    },
    andalusian_garden: {
        name: "حدائق الأندلس",
        bgColor: "#F0FDF4",
        textColor: "#14532D",
        font: "'Scheherazade New', serif",
        palette: ["#166534", "#92400E", "#15803D"],
        barBg: "#DCFCE7",
        barBorder: "1px solid #86EFAC"
    },
    blue_mosque: {
        name: "المسجد الأزرق",
        bgColor: "#ECFEFF",
        textColor: "#164E63",
        font: "'Amiri', serif",
        palette: ["#0E7490", "#0891B2", "#06B6D4"],
        barBg: "#CFFAFE",
        barBorder: "1px solid #A5F3FC"
    },
    clay_earth: {
        name: "الطين والأرض",
        bgColor: "#FAFAF9",
        textColor: "#44403C",
        font: "'Cairo', sans-serif",
        palette: ["#44403C", "#57534E", "#78716C"],
        barBg: "#E7E5E4",
        barBorder: "1px solid #D6D3D1"
    },
    slate_stone: {
        name: "الحجر والرخام",
        bgColor: "#F8FAFC",
        textColor: "#334155",
        font: "'Cairo', sans-serif",
        palette: ["#334155", "#475569", "#64748B"],
        barBg: "#E2E8F0",
        barBorder: "1px solid #CBD5E1"
    },
    autumn_warmth: {
        name: "دفء الخريف",
        bgColor: "#78350F",
        textColor: "#FEF3C7",
        font: "'Amiri', serif",
        palette: ["#D97706", "#B45309", "#92400E"],
        barBg: "#92400E",
        barBorder: "1px solid #D97706"
    },
    sakura_breeze: {
        name: "نسيم الساكورا",
        bgColor: "#FFF1F2",
        textColor: "#9D174D",
        font: "'Cairo', sans-serif",
        palette: ["#F472B6", "#EC4899", "#DB2777"],
        barBg: "#FFE4E6",
        barBorder: "1px solid #FBCFE8"
    },
    midnight_neon: {
        name: "نيون منتصف الليل",
        bgColor: "#0F172A",
        textColor: "#F8FAFC",
        font: "'Cairo', sans-serif",
        palette: ["#06B6D4", "#D946EF", "#8B5CF6"],
        barBg: "#1E293B",
        barBorder: "1px solid #06B6D4"
    },
    royal_maroon: {
        name: "عنابي ملكي",
        bgColor: "#450A0A",
        textColor: "#FEE2E2",
        font: "'Amiri', serif",
        palette: ["#991B1B", "#7F1D1D", "#B91C1C"],
        barBg: "#7F1D1D",
        barBorder: "1px solid #991B1B"
    },
    royal_purple: {
        name: "أرجواني ملكي",
        bgColor: "#2E1065",
        textColor: "#F3E8FF",
        font: "'Amiri', serif",
        palette: ["#6D28D9", "#7C3AED", "#5B21B6"],
        barBg: "#4C1D95",
        barBorder: "1px solid #7C3AED"
    },
    desert_night: {
        name: "ليل الصحراء",
        bgColor: "#0B0F19",
        textColor: "#C7D2FE",
        font: "'Cairo', sans-serif",
        palette: ["#4F46E5", "#7C3AED", "#C026D3"],
        barBg: "#1E1B4B",
        barBorder: "1px solid #4F46E5"
    },
    ocean_peace: {
        name: "سلام المحيط",
        bgColor: "#0F172A",
        textColor: "#E2E8F0",
        font: "'Cairo', sans-serif",
        palette: ["#0EA5E9", "#0284C7", "#0369A1"],
        barBg: "#1E293B",
        barBorder: "1px solid #0EA5E9"
    },
    vintage_paper: {
        name: "ورق عتيق",
        bgColor: "#FEFBF1",
        textColor: "#3D3328",
        font: "'Amiri', serif",
        palette: ["#8C7B65", "#A69177", "#C2B092"],
        barBg: "#EDE6D3",
        barBorder: "1px solid #D4C5A9"
    },
    turquoise_gem: {
        name: "فيروزي",
        bgColor: "#F0FDFA",
        textColor: "#134E4A",
        font: "'Cairo', sans-serif",
        palette: ["#0D9488", "#14B8A6", "#2DD4BF"],
        barBg: "#CCFBF1",
        barBorder: "1px solid #99F6E4"
    },
    deep_forest: {
        name: "غابة عميقة",
        bgColor: "#022C22",
        textColor: "#D1FAE5",
        font: "'Amiri', serif",
        palette: ["#059669", "#10B981", "#047857"],
        barBg: "#064E3B",
        barBorder: "1px solid #059669"
    },
    lavender_mist: {
        name: "ضباب الخزامى",
        bgColor: "#FAF5FF",
        textColor: "#581C87",
        font: "'Cairo', sans-serif",
        palette: ["#7C3AED", "#8B5CF6", "#A855F7"],
        barBg: "#F3E8FF",
        barBorder: "1px solid #E9D5FF"
    },
    crystal_glass: {
        name: "كريستال شفاف",
        bgColor: "#FFFFFF",
        textColor: "#0369A1",
        font: "'Cairo', sans-serif",
        palette: ["#0284C7", "#0EA5E9", "#38BDF8"],
        barBg: "#E0F2FE",
        barBorder: "1px solid #38BDF8"
    },
    frosted_emerald: {
        name: "زمرد زجاجي",
        bgColor: "#ECFDF5",
        textColor: "#065F46",
        font: "'Cairo', sans-serif",
        palette: ["#10B981", "#34D399", "#064E3B"],
        barBg: "#D1FAE5",
        barBorder: "1px solid #10B981"
    },
    midnight_glass: {
        name: "زجاج ليلي",
        bgColor: "#0F172A",
        textColor: "#F1F5F9",
        font: "'Cairo', sans-serif",
        palette: ["#3B82F6", "#60A5FA", "#0F172A"],
        barBg: "#1E293B",
        barBorder: "1px solid #3B82F6"
    }
};