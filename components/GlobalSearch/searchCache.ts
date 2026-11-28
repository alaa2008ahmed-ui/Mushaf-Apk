export const getSectionsKey = (sections: string[]): string => {
    if (!sections || sections.length === 0 || sections.includes('all')) return 'all';
    return [...sections].sort().join(',');
};

const createEmptySearchCache = () => ({
    query: '',
    activeTab: 'all' as string | string[],
    sectionsKey: 'all',
    language: '',
    readingMode: '',
    scrollTop: 0,
    quranResults: [] as any[],
    athkarResults: [] as any[],
    salahAthkarResults: [] as any[],
    duaResults: [] as any[],
    ruqyahResults: [] as any[],
    hisnResults: [] as any[],
    nawawiResults: [] as any[],
    asmaulHusnaResults: [] as any[],
    seerahResults: [] as any[],
    hajjUmrahResults: [] as any[],
    tenPromisedResults: [] as any[],
    divineMiraclesResults: [] as any[],
});

export const searchCache = createEmptySearchCache();

export const clearSearchCache = () => {
    Object.assign(searchCache, createEmptySearchCache());
};

export interface GlobalSearchResultBuckets {
    quranResults: any[];
    athkarResults: any[];
    salahAthkarResults: any[];
    duaResults: any[];
    ruqyahResults: any[];
    hisnResults: any[];
    nawawiResults: any[];
    asmaulHusnaResults: any[];
    seerahResults: any[];
    hajjUmrahResults: any[];
    tenPromisedResults: any[];
    divineMiraclesResults: any[];
}

export const emptyResultBuckets = (): GlobalSearchResultBuckets => ({
    quranResults: [],
    athkarResults: [],
    salahAthkarResults: [],
    duaResults: [],
    ruqyahResults: [],
    hisnResults: [],
    nawawiResults: [],
    asmaulHusnaResults: [],
    seerahResults: [],
    hajjUmrahResults: [],
    tenPromisedResults: [],
    divineMiraclesResults: [],
});
