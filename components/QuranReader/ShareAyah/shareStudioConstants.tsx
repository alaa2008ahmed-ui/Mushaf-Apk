import React from 'react';
import {
    FONTS,
    SURAH_INFO,
    SURAH_NAMES_AR,
    SURAH_NAMES_EN,
    toArabic,
    getAyahCountText,
    isDarkQuranTheme,
    ReadingMode,
} from '../constants';
import { resolveQuranModalPalette } from '../modalThemeUtils';
import {
    SHARE_CARD_DESIGNS,
    ShareDesignId,
    getDesignTypographyTheme,
} from '../../../utils/share/shareAsImage';
import { DARK_EXTRA_SHARE_DESIGN_IDS } from '../../../utils/share/shareCardDesignsExtra';
import {
    DARK_QURAN_PAGE_SHARE_DESIGN_IDS,
    QuranPageDesignPalette,
} from '../../../utils/share/shareCardDesignsQuran';

export const IslamicFlourish: React.FC<{ color: string; scale?: number }> = ({ color, scale = 1 }) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', margin: `${10 * scale}px 0`, opacity: 0.85, pointerEvents: 'none' }}>
            <svg width={220 * scale} height={20 * scale} viewBox="0 0 220 20" fill="none">
                <path d="M10 10h65m70 0h65" stroke={color} strokeWidth={1.5 * scale} strokeLinecap="round" opacity="0.6" />
                <circle cx="82" cy="10" r={2.5 * scale} fill={color} />
                <circle cx="138" cy="10" r={2.5 * scale} fill={color} />
                <path d="M110 2l6 8-6 8-6-8z" fill={color} opacity="0.9" />
                <circle cx="110" cy="10" r={1.8 * scale} fill="#ffffff" opacity="0.75" />
            </svg>
        </div>
    );
};

export interface ShareAyahModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentAyah: { s: number; a: number };
    quranData: any;
    currentTheme: any;
    readingMode?: ReadingMode;
    settings?: any;
    showToast?: (msg: string) => void;
    isLandscape?: boolean;
    instantShareMode?: boolean;
    instantShareNonce?: number;
}

export const SHARE_STUDIO_PREFS_KEY = 'quran_share_studio_prefs_v1';

export interface ShareStudioPrefs {
    bgId?: string;
    frameId?: string;
    fontId?: string;
    fontSize?: number;
    textColor?: string;
    customText?: string;
    showBismillah?: boolean;
    shareType?: 'text' | 'image' | 'page' | 'audio';
}

export function loadShareStudioPrefs(): ShareStudioPrefs {
    try {
        const raw = localStorage.getItem(SHARE_STUDIO_PREFS_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

export function saveShareStudioPrefs(prefs: ShareStudioPrefs): void {
    try {
        localStorage.setItem(SHARE_STUDIO_PREFS_KEY, JSON.stringify(prefs));
    } catch {
        // ignore storage quota errors
    }
}

export interface ShareBgOption {
    id: string;
    designId?: ShareDesignId;
    name: string;
    nameEn?: string;
    type: 'share_design' | 'gradient' | 'solid' | 'pattern';
    value: string;
    border: string;
    accent: string;
    brandColor?: string;
    defaultTextColor?: string;
    sourceColor?: string;
    dividerColor?: string;
    overlay?: string;
    isLight?: boolean;
    category: 'share_designs' | 'gradients' | 'solids';
}

export const DARK_SHARE_DESIGNS = new Set<ShareDesignId>([
    'lapis_turquoise',
    'obsidian_gold',
    'royal_amethyst',
    ...DARK_EXTRA_SHARE_DESIGN_IDS,
    ...DARK_QURAN_PAGE_SHARE_DESIGN_IDS,
]);

export const SHARE_DESIGN_BGS: ShareBgOption[] = SHARE_CARD_DESIGNS.map((d) => {
    const typo = getDesignTypographyTheme(d.id);
    const isLight = !DARK_SHARE_DESIGNS.has(d.id);
    return {
        id: `design_${d.id}`,
        designId: d.id,
        name: d.nameAr,
        nameEn: d.nameEn,
        type: 'share_design',
        value: `linear-gradient(155deg, ${d.previewColors[0]} 0%, ${d.previewColors[1]} 55%, ${d.previewColors[2]} 100%)`,
        border: typo.badgeBorder,
        accent: typo.bismillahColor,
        brandColor: typo.brandColor,
        defaultTextColor: typo.bodyColor,
        sourceColor: typo.sourceColor,
        dividerColor: typo.sourceDividerColor,
        isLight,
        category: 'share_designs',
    };
});

export const BACKGROUNDS: ShareBgOption[] = [
    // --- 1. Shared App Share Card Designs (تصاميم المشاركة العشرة المعتمدة) ---
    ...SHARE_DESIGN_BGS,

    // --- 2. High-End Color Gradients (تدرجات لونية زاهية وفخمة) ---
    {
        id: 'bg_pure_gold_foil',
        name: 'رقائق الذهب الملكية',
        type: 'gradient',
        value: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 35%, #d97706 70%, #92400e 100%)',
        border: '#fef08a',
        accent: '#451a03',
        category: 'gradients'
    },
    {
        id: 'bg_turquoise_teal',
        name: 'فيروزي إسلامي زاهي',
        type: 'gradient',
        value: 'linear-gradient(135deg, #042f2e 0%, #0d9488 50%, #14b8a6 100%)',
        border: '#5eead4',
        accent: '#fde047',
        category: 'gradients'
    },
    {
        id: 'bg_ruby_crimson',
        name: 'ياقوت أندلسي فاخر',
        type: 'gradient',
        value: 'linear-gradient(135deg, #4c0519 0%, #881337 50%, #e11d48 100%)',
        border: '#fda4af',
        accent: '#fef08a',
        category: 'gradients'
    },
    {
        id: 'bg_deep_purple_gold',
        name: 'بنفسج ملكي مذهب',
        type: 'gradient',
        value: 'linear-gradient(135deg, #2e1065 0%, #581c87 50%, #9333ea 100%)',
        border: '#d8b4fe',
        accent: '#fde047',
        category: 'gradients'
    },
    {
        id: 'bg_deep_sapphire',
        name: 'أزرق سماوي عميق',
        type: 'gradient',
        value: 'linear-gradient(135deg, #082f49 0%, #0369a1 50%, #0284c7 100%)',
        border: '#7dd3fc',
        accent: '#fef08a',
        category: 'gradients'
    },
    {
        id: 'bg_royal',
        name: 'أرجواني ذهبي',
        type: 'gradient',
        value: 'linear-gradient(135deg, #4c1d95 0%, #7e22ce 100%)',
        border: '#c084fc',
        accent: '#fde047',
        category: 'gradients'
    },
    {
        id: 'bg_sand',
        name: 'رمال ذهبية',
        type: 'gradient',
        value: 'linear-gradient(to right, #fef3c7, #fde68a)',
        border: '#d97706',
        accent: '#78350f',
        category: 'gradients',
        isLight: true
    },
    {
        id: 'bg_sage',
        name: 'أخضر ناعم',
        type: 'gradient',
        value: 'linear-gradient(to bottom right, #ecfdf5, #d1fae5)',
        border: '#059669',
        accent: '#064e3b',
        category: 'gradients',
        isLight: true
    },
    {
        id: 'bg_mesh_1',
        name: 'طيف زمردي ونيلي',
        type: 'gradient',
        value: 'radial-gradient(at 0% 0%, #064e3b 0px, transparent 50%), radial-gradient(at 100% 100%, #1e1b4b 0px, transparent 50%), linear-gradient(to right, #0f766e, #312e81)',
        border: '#10b981',
        accent: '#fbbf24',
        category: 'gradients'
    },
    {
        id: 'bg_mesh_2',
        name: 'طيف كهرماني وأرجوان',
        type: 'gradient',
        value: 'radial-gradient(at 100% 0%, #7c2d12 0px, transparent 50%), radial-gradient(at 0% 100%, #4c1d95 0px, transparent 50%), linear-gradient(to right, #9a3412, #6b21a8)',
        border: '#fb923c',
        accent: '#fde047',
        category: 'gradients'
    },

    // --- 3. Solid Colors & Light Patterns (ألوان ونقوش فاتحة) ---
    { id: 'bg_white', name: 'أبيض ناصع', type: 'solid', value: '#ffffff', border: '#e2e8f0', accent: '#0f172a', category: 'solids', isLight: true },
    { id: 'bg_light_cream', name: 'كريمي عاجي ناعم', type: 'solid', value: '#faf8f5', border: '#d97706', accent: '#78350f', category: 'solids', isLight: true },
    { id: 'bg_light_parchment', name: 'رق قرآني مذهب', type: 'gradient', value: 'linear-gradient(135deg, #fffdfa 0%, #fef3c7 60%, #fde68a 100%)', border: '#f59e0b', accent: '#451a03', category: 'solids', isLight: true },
    { id: 'bg_light_mint', name: 'نعناعي لؤلؤي', type: 'gradient', value: 'linear-gradient(135deg, #f0fdf4 0%, #e6f4ea 50%, #d1fae5 100%)', border: '#10b981', accent: '#064e3b', category: 'solids', isLight: true },
    { id: 'bg_light_sky', name: 'سماوي ناصع', type: 'gradient', value: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)', border: '#0284c7', accent: '#0369a1', category: 'solids', isLight: true },
    { id: 'bg_light_rose', name: 'وردي حريري', type: 'gradient', value: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 50%, #fecdd3 100%)', border: '#f43f5e', accent: '#881337', category: 'solids', isLight: true },
    { id: 'bg_light_gold', name: 'رقائق لؤلؤية ذهبية', type: 'gradient', value: 'linear-gradient(135deg, #fffbeb 0%, #fef9c3 50%, #fef08a 100%)', border: '#eab308', accent: '#713f12', category: 'solids', isLight: true },
    { id: 'bg_light_lavender', name: 'لافندر عاجي', type: 'gradient', value: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #e9d5ff 100%)', border: '#a855f7', accent: '#581c87', category: 'solids', isLight: true },
    { id: 'bg_light_turquoise', name: 'فيروزي ناعم', type: 'gradient', value: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 50%, #99f6e4 100%)', border: '#14b8a6', accent: '#042f2e', category: 'solids', isLight: true },
    { id: 'bg_light_pattern_dots', name: 'نقاط إسلامية فاتحة', type: 'pattern', value: 'radial-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(to right, #f8fafc, #f1f5f9)', border: '#94a3b8', accent: '#0f172a', category: 'solids', isLight: true },
    { id: 'bg_light_marble', name: 'رخام ملكي ناصع', type: 'gradient', value: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)', border: '#cbd5e1', accent: '#1e293b', category: 'solids', isLight: true },
    { id: 'bg_black', name: 'أسود كربوني', type: 'solid', value: '#0f172a', border: '#334155', accent: '#fbbf24', category: 'solids' },
    { id: 'bg_pattern_1', name: 'خطوط هندسية', type: 'pattern', value: 'repeating-linear-gradient(45deg, #0f172a, #0f172a 10px, #1e293b 10px, #1e293b 20px)', border: '#64748b', accent: '#fbbf24', category: 'solids' },
    { id: 'bg_pattern_2', name: 'دوائر هندسية', type: 'pattern', value: 'repeating-radial-gradient(circle at 0 0, transparent 0, #064e3b 15px), repeating-linear-gradient(#022c22, #022c22)', border: '#10b981', accent: '#fef08a', category: 'solids' }
];

export const FRAMES = [
    { id: 'none', name: 'بدون إطار', type: 'none', color: 'transparent', category: 'all' },
    { id: 'f_mamluk_gold', name: 'مملوكي ذهبي', type: 'mamluk-star', color: '#FFD700', category: 'islamic' },
    { id: 'f_mamluk_white', name: 'مملوكي أبيض', type: 'mamluk-star', color: '#ffffff', category: 'islamic' },
    { id: 'f_trefoil_gold', name: 'تاج المحراب ذهبي', type: 'trefoil-arch', color: '#FFD700', category: 'islamic' },
    { id: 'f_trefoil_white', name: 'تاج المحراب أبيض', type: 'trefoil-arch', color: '#ffffff', category: 'islamic' },
    { id: 'f_andalusian_gold', name: 'زخرفة أندلسية ذهبي', type: 'andalusian-lace', color: '#FFD700', category: 'islamic' },
    { id: 'f_andalusian_white', name: 'زخرفة أندلسية أبيض', type: 'andalusian-lace', color: '#ffffff', category: 'islamic' },
    { id: 'f_quranic_gold', name: 'مصحف مذهب فاخر', type: 'quranic-royal', color: '#FFD700', category: 'islamic' },
    { id: 'f_quranic_white', name: 'مصحف قرآني أبيض', type: 'quranic-royal', color: '#ffffff', category: 'islamic' },
    { id: 'f_ottoman_gold', name: 'عثماني ملكي ذهبي', type: 'ottoman-crest', color: '#FFD700', category: 'islamic' },
    { id: 'f_ottoman_white', name: 'عثماني ملكي أبيض', type: 'ottoman-crest', color: '#ffffff', category: 'islamic' },
    { id: 'f5', name: 'محراب ذهبي', type: 'mihrab', color: '#FFD700', category: 'islamic' },
    { id: 'f6', name: 'محراب أبيض', type: 'mihrab', color: '#ffffff', category: 'islamic' },
    { id: 'f7', name: 'محراب دبل ذهبي', type: 'mihrab-double', color: '#FFD700', category: 'islamic' },
    { id: 'f8', name: 'محراب دبل أبيض', type: 'mihrab-double', color: '#ffffff', category: 'islamic' },
    { id: 'f9', name: 'كلاسيكي إسلامي ذهبي', type: 'classic-islamic', color: '#FFD700', category: 'islamic' },
    { id: 'f10', name: 'كلاسيكي إسلامي أبيض', type: 'classic-islamic', color: '#ffffff', category: 'islamic' },
    { id: 'f1', name: 'مزدوج ذهبي', type: 'double', color: '#FFD700', category: 'classic' },
    { id: 'f2', name: 'مزدوج أبيض', type: 'double', color: '#ffffff', category: 'classic' },
    { id: 'f_ornate_1', name: 'أنيق ذهبي', type: 'elegant', color: '#FFD700', category: 'classic' },
    { id: 'f_ornate_2', name: 'أنيق أبيض', type: 'elegant', color: '#ffffff', category: 'classic' },
    { id: 'f3', name: 'زوايا ذهبي', type: 'corner-diamonds', color: '#FFD700', category: 'classic' },
    { id: 'f4', name: 'زوايا أبيض', type: 'corner-diamonds', color: '#ffffff', category: 'classic' },
];

export type ShareFrameOption = typeof FRAMES[0];

export const FrameOverlay = ({ frame, scale = 1 }: { frame: ShareFrameOption; scale?: number }) => {
    if (frame.type === 'none') return null;

    const color = frame.color;
    const padding = 10 * scale;
    const borderW = 3 * scale;
    const cornerW = 8 * scale;
    const cornerOffset = -4 * scale;

    if (frame.type === 'double') {
        return <div style={{ position: 'absolute', top: `${padding}px`, left: `${padding}px`, right: `${padding}px`, bottom: `${padding}px`, border: `${borderW}px double ${color}`, borderRadius: `${8 * scale}px`, pointerEvents: 'none', zIndex: 5 }} />;
    }
    if (frame.type === 'corner-diamonds') {
        return (
            <div style={{ position: 'absolute', top: `${14 * scale}px`, left: `${14 * scale}px`, right: `${14 * scale}px`, bottom: `${14 * scale}px`, border: `${1 * scale}px solid ${color}`, pointerEvents: 'none', zIndex: 5 }}>
                <div style={{ position: 'absolute', top: `${cornerOffset}px`, left: `${cornerOffset}px`, width: `${cornerW}px`, height: `${cornerW}px`, backgroundColor: color, transform: 'rotate(45deg)' }} />
                <div style={{ position: 'absolute', top: `${cornerOffset}px`, right: `${cornerOffset}px`, width: `${cornerW}px`, height: `${cornerW}px`, backgroundColor: color, transform: 'rotate(45deg)' }} />
                <div style={{ position: 'absolute', bottom: `${cornerOffset}px`, left: `${cornerOffset}px`, width: `${cornerW}px`, height: `${cornerW}px`, backgroundColor: color, transform: 'rotate(45deg)' }} />
                <div style={{ position: 'absolute', bottom: `${cornerOffset}px`, right: `${cornerOffset}px`, width: `${cornerW}px`, height: `${cornerW}px`, backgroundColor: color, transform: 'rotate(45deg)' }} />
            </div>
        );
    }
    if (frame.type === 'mihrab') {
        return (
            <div style={{ position: 'absolute', top: `${padding}px`, left: `${padding}px`, right: `${padding}px`, bottom: `${padding}px`, border: `${2 * scale}px solid ${color}`, borderTopLeftRadius: `${60 * scale}px`, borderTopRightRadius: `${60 * scale}px`, borderBottomLeftRadius: `${8 * scale}px`, borderBottomRightRadius: `${8 * scale}px`, pointerEvents: 'none', zIndex: 5 }} />
        );
    }
    if (frame.type === 'elegant') {
        return (
            <div style={{ position: 'absolute', top: `${padding}px`, left: `${padding}px`, right: `${padding}px`, bottom: `${padding}px`, border: `${1 * scale}px solid ${color}`, borderRadius: `${12 * scale}px`, pointerEvents: 'none', zIndex: 5 }}>
                <div style={{ position: 'absolute', top: `${4 * scale}px`, left: `${4 * scale}px`, right: `${4 * scale}px`, bottom: `${4 * scale}px`, border: `${1 * scale}px solid ${color}`, borderRadius: `${8 * scale}px`, opacity: 0.5 }} />
            </div>
        );
    }
    if (frame.type === 'mihrab-double') {
        return (
            <div style={{ position: 'absolute', top: `${padding}px`, left: `${padding}px`, right: `${padding}px`, bottom: `${padding}px`, border: `${2 * scale}px solid ${color}`, borderTopLeftRadius: `${60 * scale}px`, borderTopRightRadius: `${60 * scale}px`, borderBottomLeftRadius: `${8 * scale}px`, borderBottomRightRadius: `${8 * scale}px`, pointerEvents: 'none', zIndex: 5 }}>
                <div style={{ position: 'absolute', top: `${4 * scale}px`, left: `${4 * scale}px`, right: `${4 * scale}px`, bottom: `${4 * scale}px`, border: `${1 * scale}px dashed ${color}`, borderTopLeftRadius: `${56 * scale}px`, borderTopRightRadius: `${56 * scale}px`, borderBottomLeftRadius: `${4 * scale}px`, borderBottomRightRadius: `${4 * scale}px`, opacity: 0.6 }} />
            </div>
        );
    }
    if (frame.type === 'classic-islamic') {
        const cSize = 25 * scale;
        return (
            <div style={{ position: 'absolute', top: `${padding}px`, left: `${padding}px`, right: `${padding}px`, bottom: `${padding}px`, pointerEvents: 'none', zIndex: 5, border: `${1 * scale}px solid ${color}` }}>
                <div style={{ position: 'absolute', top: `${3 * scale}px`, left: `${3 * scale}px`, right: `${3 * scale}px`, bottom: `${3 * scale}px`, border: `${2 * scale}px solid ${color}`, opacity: 0.9 }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: `${cSize}px`, height: `${cSize}px`, borderRight: `${2 * scale}px solid ${color}`, borderBottom: `${2 * scale}px solid ${color}`, backgroundColor: 'transparent', borderBottomRightRadius: '100%', opacity: 0.9 }} />
                    <div style={{ position: 'absolute', top: 0, right: 0, width: `${cSize}px`, height: `${cSize}px`, borderLeft: `${2 * scale}px solid ${color}`, borderBottom: `${2 * scale}px solid ${color}`, backgroundColor: 'transparent', borderBottomLeftRadius: '100%', opacity: 0.9 }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, width: `${cSize}px`, height: `${cSize}px`, borderRight: `${2 * scale}px solid ${color}`, borderTop: `${2 * scale}px solid ${color}`, backgroundColor: 'transparent', borderTopRightRadius: '100%', opacity: 0.9 }} />
                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: `${cSize}px`, height: `${cSize}px`, borderLeft: `${2 * scale}px solid ${color}`, borderTop: `${2 * scale}px solid ${color}`, backgroundColor: 'transparent', borderTopLeftRadius: '100%', opacity: 0.9 }} />
                </div>
            </div>
        );
    }
    if (frame.type === 'mamluk-star') {
        const starSize = 22 * scale;
        const starOffset = -11 * scale;
        return (
            <div style={{ position: 'absolute', top: `${padding + 6 * scale}px`, left: `${padding + 6 * scale}px`, right: `${padding + 6 * scale}px`, bottom: `${padding + 6 * scale}px`, border: `${2 * scale}px solid ${color}`, pointerEvents: 'none', zIndex: 5 }}>
                <div style={{ position: 'absolute', top: `${4 * scale}px`, left: `${4 * scale}px`, right: `${4 * scale}px`, bottom: `${4 * scale}px`, border: `${1 * scale}px solid ${color}`, opacity: 0.6 }} />
                <div style={{ position: 'absolute', top: `${starOffset}px`, left: `${starOffset}px`, width: `${starSize}px`, height: `${starSize}px` }}>
                    <svg width={starSize} height={starSize} viewBox="0 0 24 24">
                        <rect x="4" y="4" width="16" height="16" fill={color} />
                        <rect x="4" y="4" width="16" height="16" fill={color} transform="rotate(45 12 12)" />
                        <circle cx="12" cy="12" r="3" fill="#ffffff" opacity="0.85" />
                    </svg>
                </div>
                <div style={{ position: 'absolute', top: `${starOffset}px`, right: `${starOffset}px`, width: `${starSize}px`, height: `${starSize}px` }}>
                    <svg width={starSize} height={starSize} viewBox="0 0 24 24">
                        <rect x="4" y="4" width="16" height="16" fill={color} />
                        <rect x="4" y="4" width="16" height="16" fill={color} transform="rotate(45 12 12)" />
                        <circle cx="12" cy="12" r="3" fill="#ffffff" opacity="0.85" />
                    </svg>
                </div>
                <div style={{ position: 'absolute', bottom: `${starOffset}px`, left: `${starOffset}px`, width: `${starSize}px`, height: `${starSize}px` }}>
                    <svg width={starSize} height={starSize} viewBox="0 0 24 24">
                        <rect x="4" y="4" width="16" height="16" fill={color} />
                        <rect x="4" y="4" width="16" height="16" fill={color} transform="rotate(45 12 12)" />
                        <circle cx="12" cy="12" r="3" fill="#ffffff" opacity="0.85" />
                    </svg>
                </div>
                <div style={{ position: 'absolute', bottom: `${starOffset}px`, right: `${starOffset}px`, width: `${starSize}px`, height: `${starSize}px` }}>
                    <svg width={starSize} height={starSize} viewBox="0 0 24 24">
                        <rect x="4" y="4" width="16" height="16" fill={color} />
                        <rect x="4" y="4" width="16" height="16" fill={color} transform="rotate(45 12 12)" />
                        <circle cx="12" cy="12" r="3" fill="#ffffff" opacity="0.85" />
                    </svg>
                </div>
            </div>
        );
    }
    if (frame.type === 'trefoil-arch') {
        return (
            <div style={{ position: 'absolute', top: `${padding}px`, left: `${padding}px`, right: `${padding}px`, bottom: `${padding}px`, border: `${2.5 * scale}px solid ${color}`, borderTopLeftRadius: `${70 * scale}px`, borderTopRightRadius: `${70 * scale}px`, borderBottomLeftRadius: `${16 * scale}px`, borderBottomRightRadius: `${16 * scale}px`, pointerEvents: 'none', zIndex: 5 }}>
                <div style={{ position: 'absolute', top: `${5 * scale}px`, left: `${5 * scale}px`, right: `${5 * scale}px`, bottom: `${5 * scale}px`, border: `${1 * scale}px solid ${color}`, borderTopLeftRadius: `${65 * scale}px`, borderTopRightRadius: `${65 * scale}px`, borderBottomLeftRadius: `${12 * scale}px`, borderBottomRightRadius: `${12 * scale}px`, opacity: 0.65 }} />
                <div style={{ position: 'absolute', top: `${-12 * scale}px`, left: '50%', transform: 'translateX(-50%)', width: `${30 * scale}px`, height: `${24 * scale}px` }}>
                    <svg width={30 * scale} height={24 * scale} viewBox="0 0 30 24" fill="none">
                        <path d="M15 0 L18 8 L24 9 L19 14 L20 20 L15 16 L10 20 L11 14 L6 9 L12 8 Z" fill={color} />
                        <circle cx="15" cy="10" r="2.5" fill="#ffffff" />
                    </svg>
                </div>
            </div>
        );
    }
    if (frame.type === 'andalusian-lace') {
        const cLen = 35 * scale;
        return (
            <div style={{ position: 'absolute', top: `${padding}px`, left: `${padding}px`, right: `${padding}px`, bottom: `${padding}px`, border: `${1.5 * scale}px solid ${color}`, borderRadius: `${12 * scale}px`, pointerEvents: 'none', zIndex: 5 }}>
                <div style={{ position: 'absolute', top: `${6 * scale}px`, left: `${6 * scale}px`, right: `${6 * scale}px`, bottom: `${6 * scale}px`, border: `${1 * scale}px dashed ${color}`, borderRadius: `${8 * scale}px`, opacity: 0.7 }} />
                <svg style={{ position: 'absolute', top: 0, left: 0 }} width={cLen} height={cLen} viewBox="0 0 35 35" fill="none">
                    <path d="M2 33 V12 C2 6 6 2 12 2 H33" stroke={color} strokeWidth={2.5 * scale} strokeLinecap="round" />
                    <circle cx="12" cy="12" r="3" fill={color} />
                    <path d="M12 2 C12 8 8 12 2 12" stroke={color} strokeWidth={1.5 * scale} />
                </svg>
                <svg style={{ position: 'absolute', top: 0, right: 0 }} width={cLen} height={cLen} viewBox="0 0 35 35" fill="none">
                    <path d="M33 33 V12 C33 6 29 2 23 2 H2" stroke={color} strokeWidth={2.5 * scale} strokeLinecap="round" />
                    <circle cx="23" cy="12" r="3" fill={color} />
                    <path d="M23 2 C23 8 27 12 33 12" stroke={color} strokeWidth={1.5 * scale} />
                </svg>
                <svg style={{ position: 'absolute', bottom: 0, left: 0 }} width={cLen} height={cLen} viewBox="0 0 35 35" fill="none">
                    <path d="M2 2 V23 C2 29 6 33 12 33 H33" stroke={color} strokeWidth={2.5 * scale} strokeLinecap="round" />
                    <circle cx="12" cy="23" r="3" fill={color} />
                    <path d="M12 33 C12 27 8 23 2 23" stroke={color} strokeWidth={1.5 * scale} />
                </svg>
                <svg style={{ position: 'absolute', bottom: 0, right: 0 }} width={cLen} height={cLen} viewBox="0 0 35 35" fill="none">
                    <path d="M33 2 V23 C33 29 29 33 23 33 H2" stroke={color} strokeWidth={2.5 * scale} strokeLinecap="round" />
                    <circle cx="23" cy="23" r="3" fill={color} />
                    <path d="M23 33 C23 27 27 23 33 23" stroke={color} strokeWidth={1.5 * scale} />
                </svg>
            </div>
        );
    }
    if (frame.type === 'quranic-royal') {
        const cSize = 28 * scale;
        return (
            <div style={{ position: 'absolute', top: `${padding}px`, left: `${padding}px`, right: `${padding}px`, bottom: `${padding}px`, border: `${3 * scale}px solid ${color}`, pointerEvents: 'none', zIndex: 5 }}>
                <div style={{ position: 'absolute', top: `${5 * scale}px`, left: `${5 * scale}px`, right: `${5 * scale}px`, bottom: `${5 * scale}px`, border: `${1 * scale}px solid ${color}` }}>
                    <div style={{ position: 'absolute', top: `${4 * scale}px`, left: `${4 * scale}px`, right: `${4 * scale}px`, bottom: `${4 * scale}px`, border: `${1 * scale}px solid ${color}`, opacity: 0.6 }} />
                    <div style={{ position: 'absolute', top: 0, left: 0, width: `${cSize}px`, height: `${cSize}px`, borderRight: `${1.5 * scale}px solid ${color}`, borderBottom: `${1.5 * scale}px solid ${color}`, borderBottomRightRadius: '100%' }} />
                    <div style={{ position: 'absolute', top: 0, right: 0, width: `${cSize}px`, height: `${cSize}px`, borderLeft: `${1.5 * scale}px solid ${color}`, borderBottom: `${1.5 * scale}px solid ${color}`, borderBottomLeftRadius: '100%' }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, width: `${cSize}px`, height: `${cSize}px`, borderRight: `${1.5 * scale}px solid ${color}`, borderTop: `${1.5 * scale}px solid ${color}`, borderTopRightRadius: '100%' }} />
                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: `${cSize}px`, height: `${cSize}px`, borderLeft: `${1.5 * scale}px solid ${color}`, borderTop: `${1.5 * scale}px solid ${color}`, borderTopLeftRadius: '100%' }} />
                </div>
            </div>
        );
    }
    if (frame.type === 'ottoman-crest') {
        return (
            <div style={{ position: 'absolute', top: `${padding + 4 * scale}px`, left: `${padding + 4 * scale}px`, right: `${padding + 4 * scale}px`, bottom: `${padding + 4 * scale}px`, border: `${2 * scale}px solid ${color}`, borderRadius: `${18 * scale}px`, pointerEvents: 'none', zIndex: 5 }}>
                <div style={{ position: 'absolute', top: `${6 * scale}px`, left: `${6 * scale}px`, right: `${6 * scale}px`, bottom: `${6 * scale}px`, border: `${1 * scale}px solid ${color}`, borderRadius: `${12 * scale}px`, opacity: 0.7 }} />
                <div style={{ position: 'absolute', top: `${-8 * scale}px`, left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(0,0,0,0.4)', padding: `0 ${8 * scale}px`, borderRadius: '9999px' }}>
                    <svg width={36 * scale} height={16 * scale} viewBox="0 0 36 16" fill="none">
                        <circle cx="18" cy="8" r="4" fill={color} />
                        <path d="M2 8h10m12 0h10" stroke={color} strokeWidth={1.5 * scale} strokeLinecap="round" />
                    </svg>
                </div>
                <div style={{ position: 'absolute', bottom: `${-8 * scale}px`, left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(0,0,0,0.4)', padding: `0 ${8 * scale}px`, borderRadius: '9999px' }}>
                    <svg width={36 * scale} height={16 * scale} viewBox="0 0 36 16" fill="none">
                        <circle cx="18" cy="8" r="4" fill={color} />
                        <path d="M2 8h10m12 0h10" stroke={color} strokeWidth={1.5 * scale} strokeLinecap="round" />
                    </svg>
                </div>
            </div>
        );
    }
    return null;
};

export const TEXT_COLORS = [
    '#ffffff', '#000000', '#f1c40f', '#e74c3c', '#2ecc71', '#3498db',
    '#e67e22', '#1abc9c', '#ecf0f1', '#95a5a6', '#34495e',
    '#ff9ff3', '#feca57', '#ff6b6b', '#5f27cd'
];

const EXCLUDED_SHARE_FONT_IDS = new Set([
    "var(--font-katibeh)",
    "var(--font-qalam)",
    "'KFGQPC Uthman Taha Naskh'",
]);
export const SHARE_FONTS = FONTS.filter((f) => !EXCLUDED_SHARE_FONT_IDS.has(f.id));

const SHORT_FONT_NAMES_AR: Record<string, string> = {
    "var(--font-amiri)": "نسخ",
    "var(--font-noto)": "حديث",
    "var(--font-lateef)": "تراثي",
    "var(--font-thuluth)": "ثلوث",
    "var(--font-aref)": "رقعة",
    "var(--font-harmattan)": "ورش",
    "var(--font-amiri-quran)": "حفص",
    "'Me Quran'": "مصحف",
    "var(--font-katibeh)": "قطيبة",
    "var(--font-qalam)": "قلم",
    "var(--font-kufi)": "كوفي",
    "'KFGQPC Uthman Taha Naskh'": "الفهد",
    "var(--font-scheherazade)": "مجود",
    "var(--font-mirza)": "ميرزا",
};

const SHORT_FONT_NAMES_EN: Record<string, string> = {
    "var(--font-amiri)": "Naskh",
    "var(--font-noto)": "Modern",
    "var(--font-lateef)": "Trad.",
    "var(--font-thuluth)": "Thuluth",
    "var(--font-aref)": "Ruq'ah",
    "var(--font-harmattan)": "Warsh",
    "var(--font-amiri-quran)": "Hafs",
    "'Me Quran'": "Mushaf",
    "var(--font-katibeh)": "Katibeh",
    "var(--font-qalam)": "Qalam",
    "var(--font-kufi)": "Kufi",
    "'KFGQPC Uthman Taha Naskh'": "Fahd",
    "var(--font-scheherazade)": "Mujaw.",
    "var(--font-mirza)": "Mirza",
};

export const getShortFontLabel = (font: { id: string; name: string; nameEn?: string }, isEn: boolean): string => {
    if (isEn) {
        return SHORT_FONT_NAMES_EN[font.id] || (font.nameEn || font.name).split(' ')[0];
    }
    return SHORT_FONT_NAMES_AR[font.id] || font.name.split(' ')[0];
};

export interface SharePageChunk {
    pageNumber: number;
    totalPages: number;
    mushafPage: number;
    endMushafPage: number;
    ayahs: { s: number; a: number }[];
    fromAyah: number;
    toAyah: number;
    totalChars: number;
    surahInfoText: string;
}

export interface ShareDesignAssets {
    exportBackdropUrl: string;
    previewBackdropUrl: string;
    upperMotifUrl: string;
    lowerMotifUrl: string;
}

export interface ShareStudioPalette {
    accentBg: string;
    accentLip: string;
    accentText: string;
    studioBg: string;
    surfaceBg: string;
    trackBg: string;
    dividerColor: string;
    textPrimary: string;
    textMuted: string;
    flatNeutralBorder: string;
    flatActiveBorder: string;
    flatStrongBorder: string;
    tactileNeutralShadow: string;
    tactileActiveShadow: string;
    tactileInsetShadow: string;
    tactileCardShadow: string;
}

export function buildShareStudioPalette(currentTheme: any, isFlatMadinah: boolean): ShareStudioPalette {
    const madinahPalette = isFlatMadinah ? resolveQuranModalPalette(currentTheme) : null;
    const isDark = isDarkQuranTheme(currentTheme);
    const isDeepBlack = currentTheme?.id === 'deep_black';
    const rawAccent = isDeepBlack ? '#D97706' : (currentTheme?.accent || '#D97706');
    const accentBg = isFlatMadinah && madinahPalette
        ? madinahPalette.selectedBg
        : (currentTheme?.id === 'gold' ? '#D97706' : rawAccent);
    const accentLip = isDark ? '#050507' : 'rgba(15, 23, 42, 0.28)';
    const accentText = isFlatMadinah && madinahPalette
        ? madinahPalette.selectedText
        : (isDeepBlack ? '#000000' : '#FFFFFF');
    const studioBg = isFlatMadinah && madinahPalette
        ? madinahPalette.modalBg
        : (isDark ? (currentTheme?.bg || '#09090B') : '#F8FAFC');
    const surfaceBg = isFlatMadinah && madinahPalette
        ? madinahPalette.cardBg
        : (isDark ? (currentTheme?.cardBg || '#141418') : '#FFFFFF');
    const trackBg = isFlatMadinah && madinahPalette
        ? madinahPalette.subtleBg
        : (isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.05)');
    const dividerColor = isFlatMadinah
        ? 'var(--madinah-menu-border-subtle, rgba(180, 83, 9, 0.28))'
        : (isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.07)');
    const textPrimary = isFlatMadinah && madinahPalette
        ? madinahPalette.cardText
        : (isDark ? '#FFFFFF' : '#0F172A');
    const textMuted = isFlatMadinah && madinahPalette
        ? madinahPalette.mutedText
        : (isDark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(15, 23, 42, 0.58)');

    const flatNeutralBorder = isFlatMadinah
        ? '1.5px solid var(--madinah-menu-border-subtle, rgba(180, 83, 9, 0.28))'
        : `1.5px solid var(--qr-flat-border-subtle, ${dividerColor})`;
    const flatActiveBorder = isFlatMadinah
        ? '1.5px solid var(--madinah-menu-accent, #b45309)'
        : `1.5px solid var(--qr-flat-accent, ${accentBg})`;
    const flatStrongBorder = isFlatMadinah
        ? '1.5px solid var(--madinah-menu-border-strong, rgba(180, 83, 9, 0.55))'
        : `1.5px solid var(--qr-flat-border-strong, ${dividerColor})`;

    return {
        accentBg,
        accentLip,
        accentText,
        studioBg,
        surfaceBg,
        trackBg,
        dividerColor,
        textPrimary,
        textMuted,
        flatNeutralBorder,
        flatActiveBorder,
        flatStrongBorder,
        tactileNeutralShadow: 'none',
        tactileActiveShadow: 'none',
        tactileInsetShadow: 'none',
        tactileCardShadow: 'none',
    };
}

export function getChunkTypography(chunkChars: number, ratio: number = 1) {
    let baseSize: number;
    let lineHeight: number;
    let bismillahSize: number;

    if (chunkChars < 60) {
        baseSize = 124;
        lineHeight = 2.45;
        bismillahSize = 64;
    } else if (chunkChars < 120) {
        baseSize = 108;
        lineHeight = 2.35;
        bismillahSize = 60;
    } else if (chunkChars < 220) {
        baseSize = 94;
        lineHeight = 2.25;
        bismillahSize = 56;
    } else if (chunkChars < 350) {
        baseSize = 82;
        lineHeight = 2.15;
        bismillahSize = 52;
    } else if (chunkChars < 500) {
        baseSize = 72;
        lineHeight = 2.08;
        bismillahSize = 48;
    } else if (chunkChars < 680) {
        baseSize = 65;
        lineHeight = 2.02;
        bismillahSize = 46;
    } else if (chunkChars < 880) {
        baseSize = 60;
        lineHeight = 1.98;
        bismillahSize = 44;
    } else if (chunkChars < 1080) {
        baseSize = 54;
        lineHeight = 1.90;
        bismillahSize = 42;
    } else if (chunkChars < 1240) {
        baseSize = 48;
        lineHeight = 1.82;
        bismillahSize = 40;
    } else if (chunkChars < 1420) {
        baseSize = 42;
        lineHeight = 1.72;
        bismillahSize = 36;
    } else {
        baseSize = 38;
        lineHeight = 1.65;
        bismillahSize = 34;
    }

    const maxSafeFontSize = chunkChars >= 1350 ? 64 : chunkChars >= 1150 ? 74 : chunkChars >= 900 ? 86 : 145;
    const ayahFontSize = Math.min(maxSafeFontSize, Math.max(20, Math.round(baseSize * ratio)));
    const explanationFontSize = Math.max(16, Math.round(ayahFontSize * 0.62));
    return { ayahFontSize, lineHeight, bismillahSize, explanationFontSize };
}

export const QuranPageSurahBanner: React.FC<{
    surahNum: number;
    scale: number;
    isEn: boolean;
    quranPagePalette: QuranPageDesignPalette | null;
    quranSurahBannerUrl: string;
}> = ({ surahNum, scale, isEn, quranPagePalette, quranSurahBannerUrl }) => {
    if (!quranPagePalette || !quranSurahBannerUrl) return null;
    const rawAr = SURAH_NAMES_AR[surahNum - 1] || '';
    const cleanAr = rawAr
        .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
        .replace(/سورة|سُورَةُ|سُورَة/g, '')
        .trim();
    const enName = SURAH_NAMES_EN[surahNum - 1] || '';
    const info = SURAH_INFO[surahNum];
    const ayahCount = info?.ayahs || 7;
    const countLabel = isEn
        ? `${ayahCount} ${ayahCount === 1 ? 'Verse' : 'Verses'}`
        : getAyahCountText(ayahCount);
    const typeLabel = isEn
        ? info?.type === 'مكية'
            ? 'Meccan'
            : 'Medinan'
        : info?.type || 'مكية';
    const titleLabel = isEn ? `Surah ${enName}` : `سورة ${cleanAr}`;
    const bannerW = Math.round(910 * scale * 10) / 10;
    const bannerH = Math.round(112 * scale * 10) / 10;
    const titleFontSize = Math.round((isEn ? 32 : 42) * scale * 10) / 10;
    const metaFontSize = Math.round((isEn ? 21 : 25) * scale * 10) / 10;

    return (
        <span
            style={{
                position: 'relative',
                display: 'block',
                width: '100%',
                maxWidth: `${bannerW}px`,
                height: `${bannerH}px`,
                margin: `${Math.round(4 * scale * 10) / 10}px auto ${Math.round(14 * scale * 10) / 10}px auto`,
                flexShrink: 0,
                boxSizing: 'border-box',
            }}
        >
            <img
                src={quranSurahBannerUrl}
                alt=""
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'fill',
                    pointerEvents: 'none',
                }}
            />
            <span
                style={{
                    position: 'absolute',
                    right: '3.48%',
                    top: 0,
                    bottom: 0,
                    width: '18.04%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-amiri), var(--font-cairo), sans-serif',
                    fontSize: `${metaFontSize}px`,
                    fontWeight: 700,
                    color: quranPagePalette.metaText,
                    lineHeight: 1.15,
                    whiteSpace: 'nowrap',
                    direction: isEn ? 'ltr' : 'rtl',
                }}
            >
                {countLabel}
            </span>
            <span
                style={{
                    position: 'absolute',
                    left: '24.56%',
                    top: 0,
                    bottom: 0,
                    width: '50.87%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: `0 ${Math.round(28 * scale * 10) / 10}px`,
                    boxSizing: 'border-box',
                    fontFamily: 'var(--font-amiri), var(--font-amiri-quran), serif',
                    fontSize: `${titleFontSize}px`,
                    fontWeight: 800,
                    color: quranPagePalette.bannerText,
                    lineHeight: 1.15,
                    whiteSpace: 'nowrap',
                    direction: isEn ? 'ltr' : 'rtl',
                }}
            >
                {titleLabel}
            </span>
            <span
                style={{
                    position: 'absolute',
                    left: '3.48%',
                    top: 0,
                    bottom: 0,
                    width: '18.04%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-amiri), var(--font-cairo), sans-serif',
                    fontSize: `${metaFontSize}px`,
                    fontWeight: 700,
                    color: quranPagePalette.metaText,
                    lineHeight: 1.15,
                    whiteSpace: 'nowrap',
                    direction: isEn ? 'ltr' : 'rtl',
                }}
            >
                {typeLabel}
            </span>
        </span>
    );
};

export const QuranPageBottomDivider: React.FC<{
    mushafPageNum: number;
    scale: number;
    quranPagePalette: QuranPageDesignPalette | null;
}> = ({ mushafPageNum, scale, quranPagePalette }) => {
    if (!quranPagePalette) return null;
    return (
        <div
            style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: `${Math.round(8 * scale * 10) / 10}px`,
                marginBottom: `${Math.round(8 * scale * 10) / 10}px`,
                flexShrink: 0,
            }}
        >
            <div
                style={{
                    fontFamily: 'var(--font-amiri-quran), var(--font-hafs), serif',
                    fontSize: `${Math.round(42 * scale * 10) / 10}px`,
                    fontWeight: 700,
                    lineHeight: 1.2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: `${Math.round(10 * scale * 10) / 10}px`,
                    direction: 'rtl',
                }}
            >
                <span style={{ color: quranPagePalette.verseBracket }}>﴿</span>
                <span style={{ color: quranPagePalette.verseNumber }}>{toArabic(mushafPageNum)}</span>
                <span style={{ color: quranPagePalette.verseBracket }}>﴾</span>
            </div>
            <div
                style={{
                    width: '62%',
                    height: `${Math.max(1, Math.round(3 * scale * 10) / 10)}px`,
                    backgroundColor: quranPagePalette.gold,
                    marginTop: `${Math.round(6 * scale * 10) / 10}px`,
                    borderRadius: '999px',
                }}
            />
        </div>
    );
};
