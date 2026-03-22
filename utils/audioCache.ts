
export const TAJWEED_AUDIO_URLS = [
    'https://www.everyayah.com/data/Husary_64kbps/114001.mp3',
    'https://www.everyayah.com/data/Husary_64kbps/078001.mp3',
    'https://www.everyayah.com/data/Husary_64kbps/027042.mp3',
    'https://www.everyayah.com/data/Husary_64kbps/113002.mp3',
    'https://www.everyayah.com/data/Husary_64kbps/002004.mp3',
    'https://www.everyayah.com/data/Husary_64kbps/002054.mp3',
    'https://www.everyayah.com/data/Husary_64kbps/002008.mp3',
    'https://www.everyayah.com/data/Husary_64kbps/099007.mp3',
    'https://www.everyayah.com/data/Husary_64kbps/002107.mp3',
    'https://www.everyayah.com/data/Husary_64kbps/002005.mp3',
    'https://www.everyayah.com/data/Husary_64kbps/018002.mp3',
    'https://www.everyayah.com/data/Husary_64kbps/002173.mp3',
    'https://www.everyayah.com/data/Husary_64kbps/002027.mp3',
    'https://www.everyayah.com/data/Husary_64kbps/002033.mp3',
    'https://www.everyayah.com/data/Husary_64kbps/017001.mp3',
    'https://www.everyayah.com/data/Husary_64kbps/002062.mp3',
    'https://www.everyayah.com/data/Husary_64kbps/004011.mp3',
    'https://www.everyayah.com/data/Husary_64kbps/106004.mp3',
    'https://www.everyayah.com/data/Husary_64kbps/113001.mp3',
    'https://www.everyayah.com/data/Husary_64kbps/110002.mp3',
    'https://www.everyayah.com/data/Husary_64kbps/085020.mp3',
    'https://www.everyayah.com/data/Husary_64kbps/002007.mp3',
    'https://www.everyayah.com/data/Husary_64kbps/002019.mp3',
    'https://www.everyayah.com/data/Husary_64kbps/039069.mp3',
    'https://www.everyayah.com/data/Husary_64kbps/110001.mp3',
    'https://www.everyayah.com/data/Husary_64kbps/002021.mp3',
    'https://www.everyayah.com/data/Husary_64kbps/109002.mp3',
    'https://www.everyayah.com/data/Husary_64kbps/001007.mp3',
    'https://www.everyayah.com/data/Husary_64kbps/069001.mp3',
    'https://www.everyayah.com/data/Husary_64kbps/010051.mp3',
    'https://www.everyayah.com/data/Husary_64kbps/001002.mp3',
    'https://www.everyayah.com/data/Husary_64kbps/001005.mp3',
    'https://www.everyayah.com/data/Husary_64kbps/106001.mp3',
    'https://www.everyayah.com/data/Husary_64kbps/106003.mp3',
    'https://www.everyayah.com/data/Husary_64kbps/025020.mp3',
    'https://www.everyayah.com/data/Husary_64kbps/104003.mp3',
    'https://www.everyayah.com/data/Husary_64kbps/002031.mp3',
    'https://www.everyayah.com/data/Husary_64kbps/002165.mp3',
    'https://www.everyayah.com/data/Husary_64kbps/002101.mp3',
    'https://www.everyayah.com/data/Husary_64kbps/002127.mp3',
    'https://www.everyayah.com/data/Husary_64kbps/002022.mp3',
    'https://www.everyayah.com/data/Husary_64kbps/002049.mp3',
    'https://www.everyayah.com/data/Husary_64kbps/112001.mp3',
    'https://www.everyayah.com/data/Husary_64kbps/001001.mp3'
];

export const CACHE_NAME = 'tajweed-audio-v1';

export const preloadTajweedAudio = async () => {
    if (!('caches' in window)) return;

    try {
        const cache = await caches.open(CACHE_NAME);
        const keys = await cache.keys();
        const cachedUrls = new Set(keys.map(request => request.url));

        const toFetch = TAJWEED_AUDIO_URLS.filter(url => !cachedUrls.has(new URL(url, window.location.origin).href));

        if (toFetch.length === 0) {
            console.log('All tajweed audio files are already cached.');
            return;
        }

        console.log(`Starting background preload of ${toFetch.length} tajweed audio files...`);
        
        // Fetch in chunks to avoid overwhelming the network
        const chunkSize = 5;
        for (let i = 0; i < toFetch.length; i += chunkSize) {
            const chunk = toFetch.slice(i, i + chunkSize);
            await Promise.all(chunk.map(async (url) => {
                try {
                    const response = await fetch(url);
                    if (response.ok) {
                        await cache.put(url, response);
                    }
                } catch (e) {
                    console.warn(`Failed to cache tajweed audio: ${url}`, e);
                }
            }));
        }
        console.log('Tajweed audio preloading completed.');
    } catch (error) {
        console.error('Tajweed audio preloading failed:', error);
    }
};

export const getCachedAudioUrl = async (url: string): Promise<string> => {
    if (!('caches' in window)) return url;

    try {
        const cache = await caches.open(CACHE_NAME);
        const response = await cache.match(url);
        if (response) {
            const blob = await response.blob();
            return URL.createObjectURL(blob);
        }
    } catch (error) {
        console.warn('Failed to retrieve from cache, using network:', error);
    }
    return url;
};
