import { NAWAWI_DATA } from '../../../data/nawawi/nawawiData';
import { asmaulHusna } from '../../../data/worshipAndHistory/asmaulHusnaData';
import { PROPHETIC_SEERAH_DATA, PROPHETIC_STANCES_DATA } from '../../../data/islamicEncyclopedia/propheticSeerah/propheticSeerahData';
import { umrahVirtues, umrahSteps } from '../../../data/worshipAndHistory/hajjUmrahData';
import { TEN_PROMISED_COMPANIONS } from '../../../data/islamicEncyclopedia/tenPromised/tenPromisedData';
import { DIVINE_MIRACLES_DATA } from '../../../data/islamicEncyclopedia/divineMiracles/divineMiraclesData';
import type { SearchMatchers } from '../searchHelpers';

export const searchNawawiSource = (matchers: SearchMatchers, isEn: boolean): any[] => {
    const { matchArabic, arabicRegex } = matchers;
    const foundNawawi: any[] = [];
    if (!isEn) {
        NAWAWI_DATA.forEach((item) => {
            if (matchArabic(item.hadith) || matchArabic(item.title)) {
                foundNawawi.push({
                    type: 'nawawi',
                    hadith: item.hadith,
                    title: item.title,
                    id: item.id,
                    highlightRegex: arabicRegex
                });
            }
        });
    }
    return foundNawawi;
};

export const searchAsmaulHusnaSource = (matchers: SearchMatchers): any[] => {
    const { matchItem, activeHighlightRegex } = matchers;
    const foundAsmaulHusna: any[] = [];
    asmaulHusna.forEach((item) => {
        if (matchItem(item.name, item.transliteration, item.meaning, item.meaningEn) || matchItem(item.evidence, item.evidenceEn)) {
            foundAsmaulHusna.push({
                type: 'asmaulHusna',
                name: item.name,
                transliteration: item.transliteration,
                meaning: item.meaning,
                meaningEn: item.meaningEn,
                evidence: item.evidence,
                evidenceEn: item.evidenceEn,
                id: item.id,
                highlightRegex: activeHighlightRegex
            });
        }
    });
    return foundAsmaulHusna;
};

export const searchSeerahSource = (matchers: SearchMatchers, isEn: boolean): any[] => {
    const { matchArabic, activeHighlightRegex } = matchers;
    const foundSeerah: any[] = [];
    if (!isEn) {
        PROPHETIC_SEERAH_DATA.forEach((item) => {
            if (matchArabic(item.title) || matchArabic(item.summary) || matchArabic(item.details) || (item.badge && matchArabic(item.badge))) {
                foundSeerah.push({
                    type: 'seerah',
                    kind: 'milestone',
                    title: item.title,
                    eraLabel: item.eraLabel,
                    yearGregorian: item.yearGregorian,
                    summary: item.summary,
                    details: item.details,
                    id: item.id,
                    highlightRegex: activeHighlightRegex
                });
            }
        });
        PROPHETIC_STANCES_DATA.forEach((item) => {
            if (matchArabic(item.title) || matchArabic(item.situation) || matchArabic(item.quote) || matchArabic(item.moralLesson)) {
                foundSeerah.push({
                    type: 'seerah',
                    kind: 'stance',
                    title: item.title,
                    category: item.category,
                    situation: item.situation,
                    quote: item.quote,
                    id: item.id,
                    highlightRegex: activeHighlightRegex
                });
            }
        });
    }
    return foundSeerah;
};

export const searchHajjUmrahSource = (matchers: SearchMatchers, isEn: boolean): any[] => {
    const { matchArabic, activeHighlightRegex } = matchers;
    const foundHajjUmrah: any[] = [];
    if (!isEn) {
        umrahVirtues.forEach((v, idx) => {
            if (matchArabic(v.title) || matchArabic(v.text) || matchArabic(v.explanation)) {
                foundHajjUmrah.push({
                    type: 'hajjUmrah',
                    kind: 'virtue',
                    title: v.title,
                    text: v.text,
                    explanation: v.explanation,
                    id: `v_${idx}`,
                    highlightRegex: activeHighlightRegex
                });
            }
        });
        umrahSteps.forEach((s) => {
            if (matchArabic(s.title) || matchArabic(s.subtitle) || matchArabic(s.quranAyah) || matchArabic(s.hadith)) {
                foundHajjUmrah.push({
                    type: 'hajjUmrah',
                    kind: 'step',
                    title: s.title,
                    subtitle: s.subtitle,
                    quranAyah: s.quranAyah,
                    hadith: s.hadith,
                    id: s.title,
                    highlightRegex: activeHighlightRegex
                });
            }
        });
    }
    return foundHajjUmrah;
};

export const searchTenPromisedSource = (matchers: SearchMatchers): any[] => {
    const { matchItem, activeHighlightRegex } = matchers;
    const foundTenPromised: any[] = [];
    TEN_PROMISED_COMPANIONS.forEach((c) => {
        if (
            matchItem(c.nameAr, c.nameEn, c.fullNameAr, c.fullNameEn) ||
            matchItem(c.titleBadgeAr, c.titleBadgeEn, c.keyQuoteAr, c.keyQuoteEn) ||
            matchItem(c.gladTidingsHadithAr, c.gladTidingsHadithEn)
        ) {
            foundTenPromised.push({
                type: 'tenPromised',
                nameAr: c.nameAr,
                nameEn: c.nameEn,
                titleBadgeAr: c.titleBadgeAr,
                titleBadgeEn: c.titleBadgeEn,
                hadithAr: c.gladTidingsHadithAr,
                hadithEn: c.gladTidingsHadithEn,
                quoteAr: c.keyQuoteAr,
                quoteEn: c.keyQuoteEn,
                id: c.id,
                highlightRegex: activeHighlightRegex
            });
        }
    });
    return foundTenPromised;
};

export const searchDivineMiraclesSource = (matchers: SearchMatchers): any[] => {
    const { matchItem, activeHighlightRegex } = matchers;
    const foundDivineMiracles: any[] = [];
    DIVINE_MIRACLES_DATA.forEach((item) => {
        if (
            matchItem(item.titleAr, item.titleEn, item.summaryAr, item.summaryEn) ||
            matchItem(item.descriptionAr, item.descriptionEn, item.badgeAr, item.badgeEn) ||
            matchItem(item.scientificOrHistoricalFactAr || '', item.scientificOrHistoricalFactEn || '') ||
            (item.quranEvidence && matchItem(item.quranEvidence.ayahAr, item.quranEvidence.ayahEn)) ||
            (item.hadithEvidence && matchItem(item.hadithEvidence.matnAr, item.hadithEvidence.matnEn))
        ) {
            foundDivineMiracles.push({
                type: 'divineMiracles',
                titleAr: item.titleAr,
                titleEn: item.titleEn,
                badgeAr: item.badgeAr,
                badgeEn: item.badgeEn,
                summaryAr: item.summaryAr,
                summaryEn: item.summaryEn,
                id: item.id,
                highlightRegex: activeHighlightRegex
            });
        }
    });
    return foundDivineMiracles;
};
