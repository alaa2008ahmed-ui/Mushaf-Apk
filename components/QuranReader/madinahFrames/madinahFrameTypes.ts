export type MadinahFrameDesignId = 1 | 2 | 3 | 4 | 5 | 6;

export interface MadinahFrameDesignMeta {
    id: MadinahFrameDesignId;
    nameAr: string;
    nameEn: string;
}

export const MADINAH_FRAME_DESIGNS: MadinahFrameDesignMeta[] = [
    { id: 1, nameAr: 'المصحف الملكي', nameEn: 'Royal Madinah' },
    { id: 2, nameAr: 'الأندلسي المقوّس', nameEn: 'Andalusian Arch' },
    { id: 3, nameAr: 'النجمة الثمانية', nameEn: 'Eight-Point Star' },
    { id: 4, nameAr: 'المملوكي المزخرف', nameEn: 'Mamluk Mihrab' },
    { id: 5, nameAr: 'العثماني الهادئ', nameEn: 'Ottoman Rumi' },
    { id: 6, nameAr: 'الكوفي المعماري', nameEn: 'Kufic Geometric' },
];

export const normalizeMadinahFrameDesign = (raw?: number | string): MadinahFrameDesignId => {
    const num = Number(raw);
    if (num >= 1 && num <= 6) return Math.round(num) as MadinahFrameDesignId;
    return 1;
};

export const FRAME_TO_SURAH_HEADER_DESIGN: Record<MadinahFrameDesignId, number> = {
    1: 1, // Royal Madinah
    2: 2, // Andalusian Arch
    3: 3, // Eight-Point Star
    4: 4, // Mamluk Mihrab
    5: 7, // Ottoman Rumi
    6: 9, // Kufic Geometric
};

export const getSurahHeaderDesignForFrame = (raw?: number | string): number => {
    const id = normalizeMadinahFrameDesign(raw);
    return FRAME_TO_SURAH_HEADER_DESIGN[id] ?? 1;
};
