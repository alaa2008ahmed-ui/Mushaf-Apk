import {
    getSectionsKey,
    searchCache,
    clearSearchCache,
    emptyResultBuckets,
    GlobalSearchResultBuckets
} from './searchCache';
import {
    loadTafseerMap,
    loadMeaningsMap,
    stripTajweedTags,
    fixQuranText,
    normalizeArabic,
    buildSearchMatchers
} from './searchHelpers';
import { searchQuranSource } from './sources/searchQuranSource';
import {
    searchAthkarSource,
    searchSalahAthkarSource,
    searchDuaSource,
    searchRuqyahSource,
    searchHisnSource
} from './sources/searchWorshipSources';
import {
    searchNawawiSource,
    searchAsmaulHusnaSource,
    searchSeerahSource,
    searchHajjUmrahSource,
    searchTenPromisedSource,
    searchDivineMiraclesSource
} from './sources/searchKnowledgeSources';

export {
    loadTafseerMap,
    loadMeaningsMap,
    getSectionsKey,
    searchCache,
    clearSearchCache,
    stripTajweedTags,
    fixQuranText,
    normalizeArabic,
    emptyResultBuckets
};
export type { GlobalSearchResultBuckets };

export const performGlobalSearch = async ({
    currentQuery,
    sectionsToSearch,
    isEn,
    language,
    sourceReadingMode,
}: {
    currentQuery: string;
    sectionsToSearch: string[];
    isEn: boolean;
    language: string;
    sourceReadingMode?: string;
}): Promise<GlobalSearchResultBuckets> => {
    const q = currentQuery.trim();
    const isAll = !sectionsToSearch || sectionsToSearch.length === 0 || sectionsToSearch.includes('all');
    const shouldSearch = (secId: string) => isAll || sectionsToSearch.includes(secId);
    const currentSectionsKey = getSectionsKey(sectionsToSearch);

    if (!q) {
        const empty = emptyResultBuckets();
        Object.assign(searchCache, {
            query: '',
            sectionsKey: currentSectionsKey,
            language,
            readingMode: sourceReadingMode || '',
            scrollTop: 0,
            ...empty,
        });
        return empty;
    }

    const matchers = buildSearchMatchers(q, isEn);
    const allowLatinInQuran = isEn || sourceReadingMode === 'bilingual' || sourceReadingMode === 'translation';
    const allowArabicInQuran = !isEn || sourceReadingMode === 'bilingual';

    // Strict language enforcement (relaxed for bilingual/translation Quran reading pages):
    if ((!allowLatinInQuran && matchers.hasLatinChars) || (!allowArabicInQuran && matchers.hasArabicChars)) {
        const empty = emptyResultBuckets();
        Object.assign(searchCache, {
            query: q,
            sectionsKey: currentSectionsKey,
            language,
            readingMode: sourceReadingMode || '',
            ...empty,
        });
        return empty;
    }

    const foundQuran = shouldSearch('quran')
        ? await searchQuranSource({ matchers, isEn, sourceReadingMode })
        : [];

    const foundAthkar = shouldSearch('athkar') ? searchAthkarSource(matchers) : [];
    const foundSalahAthkar = shouldSearch('salahAthkar') ? searchSalahAthkarSource(matchers) : [];
    const foundDua = shouldSearch('dua') ? searchDuaSource(matchers) : [];
    const foundRuqyah = shouldSearch('ruqyah') ? searchRuqyahSource(matchers) : [];
    const foundHisn = shouldSearch('hisn') ? searchHisnSource(matchers) : [];
    const foundNawawi = shouldSearch('nawawi') ? searchNawawiSource(matchers, isEn) : [];
    const foundAsmaulHusna = shouldSearch('asmaulHusna') ? searchAsmaulHusnaSource(matchers) : [];
    const foundSeerah = shouldSearch('seerah') ? searchSeerahSource(matchers, isEn) : [];
    const foundHajjUmrah = shouldSearch('hajjUmrah') ? searchHajjUmrahSource(matchers, isEn) : [];
    const foundTenPromised = shouldSearch('tenPromised') ? searchTenPromisedSource(matchers) : [];
    const foundDivineMiracles = shouldSearch('divineMiracles') ? searchDivineMiraclesSource(matchers) : [];

    const results: GlobalSearchResultBuckets = {
        quranResults: foundQuran,
        athkarResults: foundAthkar,
        salahAthkarResults: foundSalahAthkar,
        duaResults: foundDua,
        ruqyahResults: foundRuqyah,
        hisnResults: foundHisn,
        nawawiResults: foundNawawi,
        asmaulHusnaResults: foundAsmaulHusna,
        seerahResults: foundSeerah,
        hajjUmrahResults: foundHajjUmrah,
        tenPromisedResults: foundTenPromised,
        divineMiraclesResults: foundDivineMiracles,
    };

    Object.assign(searchCache, {
        query: q,
        sectionsKey: currentSectionsKey,
        language,
        readingMode: sourceReadingMode || '',
        ...results,
    });

    return results;
};
