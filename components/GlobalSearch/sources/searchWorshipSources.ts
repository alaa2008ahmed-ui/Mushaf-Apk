import { HISN_ALMUSLIM_CATEGORIES, HISN_ALMUSLIM_DATA } from '../../../data/adhkarAndDuas/hisnAlmuslimData';
import { HISN_CATEGORIES_EN, HISN_ITEMS_EN } from '../../../data/adhkarAndDuas/hisnAlmuslimTranslationsEn';
import { ALL_DUAA } from '../../../data/adhkarAndDuas/adiaData';
import { ADIA_EN_MAP } from '../../../data/adhkarAndDuas/adiaTranslationsEn';
import { BASE_ADHKAR_MORNING, BASE_ADHKAR_EVENING } from '../../../data/adhkarAndDuas/adkarSabahMasaaData';
import { ADKAR_EN_MAP } from '../../../data/adhkarAndDuas/adkarTranslationsEn';
import { RUQYAH_DATA } from '../../../data/adhkarAndDuas/ruqyahData';
import { baseAthkar, fajrDhikr, fajrMaghribDhikr, specialZikr } from '../../../data/adhkarAndDuas/athkarAlSalahData';
import type { SearchMatchers } from '../searchHelpers';

export const searchAthkarSource = (matchers: SearchMatchers): any[] => {
    const { matchItem, activeHighlightRegex } = matchers;
    const foundAthkar: any[] = [];

    BASE_ADHKAR_MORNING.forEach((item, idx) => {
        const enTrans = ADKAR_EN_MAP[item.text] || ADKAR_EN_MAP[item.text.trim()];
        const enText = enTrans?.text || '';
        const enSource = enTrans?.source || '';
        if (matchItem(item.text, enText, '', enSource)) {
            foundAthkar.push({
                type: 'athkar',
                kind: 'morning',
                text: item.text,
                textEn: enText,
                source: item.source || '',
                sourceEn: enSource,
                id: idx,
                highlightRegex: activeHighlightRegex
            });
        }
    });

    BASE_ADHKAR_EVENING.forEach((item, idx) => {
        const enTrans = ADKAR_EN_MAP[item.text] || ADKAR_EN_MAP[item.text.trim()];
        const enText = enTrans?.text || '';
        const enSource = enTrans?.source || '';
        if (matchItem(item.text, enText, '', enSource)) {
            foundAthkar.push({
                type: 'athkar',
                kind: 'evening',
                text: item.text,
                textEn: enText,
                source: item.source || '',
                sourceEn: enSource,
                id: idx,
                highlightRegex: activeHighlightRegex
            });
        }
    });

    return foundAthkar;
};

export const searchSalahAthkarSource = (matchers: SearchMatchers): any[] => {
    const { matchItem, activeHighlightRegex } = matchers;
    const foundSalahAthkar: any[] = [];
    const allSalahItems = [...baseAthkar, fajrDhikr, fajrMaghribDhikr, specialZikr];

    allSalahItems.forEach((item, idx) => {
        if (matchItem(item.text, item.textEn, item.title, item.titleEn)) {
            foundSalahAthkar.push({
                type: 'salahAthkar',
                text: item.text,
                textEn: item.textEn,
                title: item.title,
                titleEn: item.titleEn,
                note: item.note,
                noteEn: item.noteEn,
                id: item.id || idx,
                highlightRegex: activeHighlightRegex
            });
        }
    });

    return foundSalahAthkar;
};

export const searchDuaSource = (matchers: SearchMatchers): any[] => {
    const { matchItem, activeHighlightRegex } = matchers;
    const foundDua: any[] = [];

    ALL_DUAA.forEach((item, idx) => {
        const enDua = ADIA_EN_MAP[item.id];
        const enText = enDua?.text || item.textEn || '';
        const enSource = enDua?.source || item.sourceEn || '';
        if (matchItem(item.text, enText, item.source, enSource)) {
            foundDua.push({
                type: 'dua',
                text: item.text,
                textEn: enText,
                source: item.source,
                sourceEn: enSource,
                id: idx,
                highlightRegex: activeHighlightRegex
            });
        }
    });

    return foundDua;
};

export const searchRuqyahSource = (matchers: SearchMatchers): any[] => {
    const { matchItem, activeHighlightRegex } = matchers;
    const foundRuqyah: any[] = [];

    RUQYAH_DATA.forEach((item) => {
        if (matchItem(item.text, item.textEn, item.source, item.sourceEn) || matchItem(item.title, item.titleEn)) {
            foundRuqyah.push({
                type: 'ruqyah',
                title: item.title,
                titleEn: item.titleEn,
                text: item.text,
                textEn: item.textEn,
                source: item.source,
                sourceEn: item.sourceEn,
                id: item.id,
                highlightRegex: activeHighlightRegex
            });
        }
    });

    return foundRuqyah;
};

export const searchHisnSource = (matchers: SearchMatchers): any[] => {
    const { matchItem, activeHighlightRegex } = matchers;
    const foundHisn: any[] = [];

    Object.keys(HISN_ALMUSLIM_DATA).forEach((catId) => {
        const category = HISN_ALMUSLIM_CATEGORIES.find(c => c.id === catId);
        const catEn = HISN_CATEGORIES_EN[catId];
        HISN_ALMUSLIM_DATA[catId as keyof typeof HISN_ALMUSLIM_DATA].forEach((item: any, itemIdx: number) => {
            const enKey = `${catId}_${itemIdx}`;
            const enItem = HISN_ITEMS_EN[enKey];
            const enText = enItem?.text || '';
            const enTitle = enItem?.title || catEn?.title || '';
            const enSource = enItem?.source || '';
            if (matchItem(item.text, enText, category?.title, enTitle) || (catEn && matchItem('', catEn.subtitle))) {
                foundHisn.push({
                    type: 'hisn',
                    categoryId: catId,
                    categoryTitle: category?.title || 'حصن المسلم',
                    categoryTitleEn: catEn?.title || 'Hisn Al-Muslim',
                    itemIndex: itemIdx,
                    text: item.text,
                    textEn: enText,
                    title: category?.title || 'حصن المسلم',
                    titleEn: catEn?.title || 'Hisn Al-Muslim',
                    source: item.source || '',
                    sourceEn: enSource,
                    id: item.id || enKey,
                    highlightRegex: activeHighlightRegex
                });
            }
        });
    });

    return foundHisn;
};
