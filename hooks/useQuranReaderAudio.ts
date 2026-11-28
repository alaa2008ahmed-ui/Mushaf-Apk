import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ReadingMode, getValidReaderForMode } from '../components/QuranReader/constants';
import { useAudioStore } from './useAudioStore';
import { acquireListenInterruption, releaseListenInterruption } from '../utils/audio/listenAudioCoordinator';

interface UseQuranReaderAudioParams {
    quranData: any;
    readingMode: ReadingMode;
    reader: string;
    ayahRepeatCount: number;
    localIsMemorizationMode: boolean;
    memorizationSettingsRef: React.MutableRefObject<any>;
    isWirdMode: boolean;
    currentAyah: { s: number; a: number };
    setCurrentAyah: React.Dispatch<React.SetStateAction<{ s: number; a: number }>>;
    setHighlightedAyahId: React.Dispatch<React.SetStateAction<string | null>>;
    saveWirdPosition: (s: number, a: number, explicitPage?: number) => void;
    scrollToAyahRef: React.MutableRefObject<(s: number, a: number, instant?: boolean, retries?: number, isPageJump?: boolean) => void>;
    showToast: (message: string) => void;
    isMountedRef: React.MutableRefObject<boolean>;
    isSessionFinishedRef: React.MutableRefObject<boolean>;
    setShowReviewTest: React.Dispatch<React.SetStateAction<boolean>>;
    handleHomeClick: (targetPage?: string) => void;
    onBack?: () => void;
    onNavigate?: (pageId: string, params?: any) => void;
    stopRecordedAudioRef: React.MutableRefObject<() => void>;
}

export const useQuranReaderAudio = ({
    quranData,
    readingMode,
    reader: settingsReader,
    ayahRepeatCount,
    localIsMemorizationMode,
    memorizationSettingsRef,
    isWirdMode,
    currentAyah,
    setCurrentAyah,
    setHighlightedAyahId,
    saveWirdPosition,
    scrollToAyahRef,
    showToast,
    isMountedRef,
    isSessionFinishedRef,
    setShowReviewTest,
    handleHomeClick,
    onBack,
    onNavigate,
    stopRecordedAudioRef,
}: UseQuranReaderAudioParams) => {
    const {
        isPlaying,
        setIsPlaying,
        isAudioLoading,
        setIsAudioLoading,
        playingAyah,
        setPlayingAyah,
    } = useAudioStore();

    const [audioProgress, setAudioProgress] = useState<{ currentTime: number; duration: number } | null>(null);

    const audioCacheRef = useRef<Record<string, HTMLAudioElement>>({});
    const currentAudioRef = useRef<HTMLAudioElement | null>(null);
    const pauseTimeoutRef = useRef<number | null>(null);
    const playSingleAyahOnlyRef = useRef<boolean>(false);
    const currentRepeatCountRef = useRef<number>(memorizationSettingsRef.current?.currentRepeatCount || 0);
    const ayahRepeatCountRef = useRef<number>(ayahRepeatCount || 1);
    const rangeRepeatCountRef = useRef<number>(memorizationSettingsRef.current?.rangeRepeatCount || 0);
    const lastLinkedAyahRef = useRef<{ s: number; a: number } | null>(null);

    const isPlayingRef = useRef(isPlaying);
    useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

    const isAudioLoadingRef = useRef(isAudioLoading);
    useEffect(() => { isAudioLoadingRef.current = isAudioLoading; }, [isAudioLoading]);

    useEffect(() => {
        ayahRepeatCountRef.current = ayahRepeatCount || 1;
    }, [ayahRepeatCount]);

    const stopAudio = useCallback(() => {
        playSingleAyahOnlyRef.current = false;
        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current.onended = null;
        }
        stopRecordedAudioRef.current();
        if (pauseTimeoutRef.current) {
            clearTimeout(pauseTimeoutRef.current);
            pauseTimeoutRef.current = null;
        }
        currentRepeatCountRef.current = 0;
        releaseListenInterruption('quran-reader-audio');
        releaseListenInterruption('quran-reader-recorded');
        setIsPlaying(false);
        setIsAudioLoading(false);
        setPlayingAyah(null);
        setAudioProgress(null);
    }, [setIsPlaying, setIsAudioLoading, setPlayingAyah, stopRecordedAudioRef]);

    useEffect(() => {
        const handleStopAudio = () => stopAudio();
        window.addEventListener('quran-stop-audio', handleStopAudio);
        return () => window.removeEventListener('quran-stop-audio', handleStopAudio);
    }, [stopAudio]);

    const manageAudioCache = useCallback((currentS: number, currentA: number) => {
        const keys = Object.keys(audioCacheRef.current);
        if (keys.length <= 20) return;
        for (const key of keys) {
            const [s, a] = key.split(':').map(Number);
            if (Math.abs(currentA - a) > 10 || currentS !== s) {
                delete audioCacheRef.current[key];
            }
        }
    }, []);

    const preloadAudioQueue = useCallback(async (s: number, startAyah: number) => {
        if (!quranData) return;
        const surah = quranData.surahs[s - 1];
        if (!surah) return;

        const reader = localIsMemorizationMode && memorizationSettingsRef.current ? memorizationSettingsRef.current.reader : settingsReader;

        for (let i = 0; i < 10; i++) {
            const ayahNum = startAyah + i;
            if (ayahNum > surah.ayahs.length) break;
            const cacheKey = `${s}:${ayahNum}`;
            if (!audioCacheRef.current[cacheKey]) {
                const surahStr = String(s).padStart(3, '0');
                const ayahStr = String(ayahNum).padStart(3, '0');
                const audioUrl = `https://everyayah.com/data/${reader}/${surahStr}${ayahStr}.mp3`;

                try {
                    if ('caches' in window) {
                        const cache = await caches.open('quran-audio-cache');
                        const cachedResponse = await cache.match(audioUrl);
                        if (!cachedResponse) {
                            const audio = new Audio(audioUrl);
                            audio.preload = 'auto';
                            audioCacheRef.current[cacheKey] = audio;
                        }
                    } else {
                        const audio = new Audio(audioUrl);
                        audio.preload = 'auto';
                        audioCacheRef.current[cacheKey] = audio;
                    }
                } catch (e) { console.warn("Preloading failed", e); }
            }
        }
    }, [settingsReader, quranData, localIsMemorizationMode, memorizationSettingsRef]);

    const playNextAyahRef = useRef<() => void>(() => {});

    const playAudio = useCallback(async (s: number, a: number, isLinked = false, targetAyah?: { s: number; a: number }, singleAyahOnly = false) => {
        stopAudio();
        acquireListenInterruption('quran-reader-audio');
        playSingleAyahOnlyRef.current = singleAyahOnly;
        setIsAudioLoading(true);

        const rawReader = localIsMemorizationMode && memorizationSettingsRef.current ? memorizationSettingsRef.current.reader : settingsReader;
        const reader = getValidReaderForMode(localIsMemorizationMode ? 'mushaf' : readingMode, rawReader);

        setPlayingAyah({ s, a });
        setCurrentAyah({ s, a });
        if (isWirdMode) {
            saveWirdPosition(s, a);
        }
        setHighlightedAyahId(`ayah-${s}-${a}`);
        scrollToAyahRef.current(s, a, false);

        if (!isLinked && !targetAyah) {
            currentRepeatCountRef.current = 0;
        }

        if (localIsMemorizationMode && memorizationSettingsRef.current?.linkedRepeat && !isLinked && !targetAyah) {
            if (lastLinkedAyahRef.current?.s !== s || lastLinkedAyahRef.current?.a !== a) {
                let prevS = s;
                let prevA = a - 1;
                if (prevA < 1) {
                    if (prevS > 1) {
                        prevS -= 1;
                        prevA = quranData.surahs[prevS - 1].ayahs.length;
                    }
                }

                if (prevA >= 1) {
                    lastLinkedAyahRef.current = { s, a };
                    playAudio(prevS, prevA, true, { s, a });
                    return;
                }
            }
        }

        if (localIsMemorizationMode) {
            const sessionData = {
                currentAyah: { s, a },
                settings: memorizationSettingsRef.current,
                rangeRepeatCount: rangeRepeatCountRef.current,
                currentRepeatCount: currentRepeatCountRef.current,
                timestamp: Date.now()
            };
            localStorage.setItem('memorization_session_v1', JSON.stringify(sessionData));
        }

        window.dispatchEvent(new CustomEvent('voice-control-pause'));

        const cacheKey = `${s}:${a}`;
        let audio: HTMLAudioElement;

        if (audioCacheRef.current[cacheKey]) {
            audio = audioCacheRef.current[cacheKey];
            audio.currentTime = 0;
        } else {
            const surahStr = String(s).padStart(3, '0');
            const ayahStr = String(a).padStart(3, '0');
            const activeReader = localIsMemorizationMode && memorizationSettingsRef.current ? memorizationSettingsRef.current.reader : settingsReader;
            const audioUrl = `https://everyayah.com/data/${activeReader}/${surahStr}${ayahStr}.mp3`;
            let audioSrc = audioUrl;

            try {
                if ('caches' in window) {
                    const cache = await caches.open('quran-audio-cache');
                    const cachedResponse = await cache.match(audioUrl);
                    if (cachedResponse) {
                        const blob = await cachedResponse.blob();
                        audioSrc = URL.createObjectURL(blob);
                    }
                }
            } catch (e) { console.warn("Cache API check failed", e); }

            audio = new Audio(audioSrc);
            audio.preload = 'auto';
            audioCacheRef.current[cacheKey] = audio;
        }

        currentAudioRef.current = audio;

        audio.onplaying = () => { setIsPlaying(true); setIsAudioLoading(false); };
        audio.ontimeupdate = () => {
            if (audio.duration && audio.duration > 0) {
                setAudioProgress({ currentTime: audio.currentTime, duration: audio.duration });
            }
        };
        audio.onpause = () => {
            setIsPlaying(false);
            setAudioProgress(null);
            window.dispatchEvent(new CustomEvent('voice-control-resume'));
        };
        audio.onwaiting = () => setIsAudioLoading(true);
        audio.onended = () => {
            if (!isMountedRef.current) return;
            if (playSingleAyahOnlyRef.current) {
                playSingleAyahOnlyRef.current = false;
                stopAudio();
                return;
            }
            if (localIsMemorizationMode && memorizationSettingsRef.current) {
                const memSettings = memorizationSettingsRef.current;

                if (isLinked && targetAyah) {
                    playAudio(targetAyah.s, targetAyah.a, false);
                    return;
                }

                const maxAyahRepeat = memSettings.ayahRepeat || 1;
                const pauseLength = memSettings.pauseLength || 0;

                const handleNext = () => {
                    if (currentRepeatCountRef.current < maxAyahRepeat - 1) {
                        currentRepeatCountRef.current += 1;
                        audio.currentTime = 0;
                        audio.play().catch(e => {
                            console.error("Repeat playback failed", e);
                            playNextAyahRef.current();
                        });
                    } else {
                        currentRepeatCountRef.current = 0;
                        if (s > memSettings.toSurah || (s === memSettings.toSurah && a >= memSettings.toAyah)) {
                            const maxRangeRepeat = memSettings.rangeRepeat || 1;
                            if (rangeRepeatCountRef.current < maxRangeRepeat - 1) {
                                rangeRepeatCountRef.current += 1;
                                playAudio(memSettings.fromSurah, memSettings.fromAyah);
                            } else {
                                rangeRepeatCountRef.current = 0;
                                isSessionFinishedRef.current = true;
                                stopAudio();
                                localStorage.removeItem('memorization_session_v1');
                                showToast('انتهت جلسة التحفيظ والمراجعة');
                                if (memSettings.testAfterSession) {
                                    setShowReviewTest(true);
                                } else {
                                    setTimeout(() => {
                                        if (!isMountedRef.current) return;
                                        if (onBack) handleHomeClick();
                                        else if (onNavigate) onNavigate('memorization');
                                    }, 1500);
                                }
                            }
                        } else {
                            playNextAyahRef.current();
                        }
                    }
                };

                if (pauseLength > 0) {
                    const pauseMs = audio.duration * 1000 * pauseLength;
                    pauseTimeoutRef.current = window.setTimeout(handleNext, pauseMs);
                } else {
                    handleNext();
                }
            } else {
                const maxRepeat = ayahRepeatCountRef.current;

                if (currentRepeatCountRef.current < maxRepeat - 1) {
                    currentRepeatCountRef.current += 1;
                    audio.currentTime = 0;
                    audio.play().catch(e => {
                        console.error("Repeat playback failed", e);
                        playNextAyahRef.current();
                    });
                } else {
                    currentRepeatCountRef.current = 0;
                    playNextAyahRef.current();
                }
            }
        };
        audio.onerror = () => {
            showToast('خطأ في تحميل المقطع الصوتي.');
            stopAudio();
            delete audioCacheRef.current[cacheKey];
            window.dispatchEvent(new CustomEvent('voice-control-resume'));
        };

        try {
            await audio.play();
            if (!isMountedRef.current) {
                audio.pause();
                return;
            }
            preloadAudioQueue(s, a + 1);
            manageAudioCache(s, a);
        } catch (error) {
            if (!isMountedRef.current) return;
            showToast('فشل تشغيل الصوت.');
            stopAudio();
            delete audioCacheRef.current[cacheKey];
            window.dispatchEvent(new CustomEvent('voice-control-resume'));
        }
    }, [settingsReader, ayahRepeatCount, localIsMemorizationMode, readingMode, isWirdMode, quranData, stopAudio, preloadAudioQueue, manageAudioCache, showToast, scrollToAyahRef, saveWirdPosition, setCurrentAyah, setHighlightedAyahId, setIsAudioLoading, setIsPlaying, setPlayingAyah, setShowReviewTest, handleHomeClick, onBack, onNavigate, isMountedRef, isSessionFinishedRef, memorizationSettingsRef]);

    const playSingleAyah = useCallback(async (s: number, a: number) => {
        if (isPlaying && playingAyah?.s === s && playingAyah?.a === a) {
            stopAudio();
            return;
        }
        playSingleAyahOnlyRef.current = true;
        await playAudio(s, a, false, undefined, true);
    }, [isPlaying, playingAyah, stopAudio, playAudio]);

    const playNextAyah = useCallback(() => {
        if (!quranData || !playingAyah) return stopAudio();
        const { s, a } = playingAyah;
        const surah = quranData.surahs[s - 1];
        if (!surah) return stopAudio();

        let nextS = s;
        let nextA = a + 1;

        if (a < surah.ayahs.length) {
            nextA = a + 1;
        } else if (s < 114) {
            nextS = s + 1;
            nextA = 1;
        } else {
            stopAudio();
            showToast('انتهت السورة');
            return;
        }

        playAudio(nextS, nextA);
    }, [quranData, playingAyah, stopAudio, showToast, playAudio]);

    useEffect(() => {
        playNextAyahRef.current = playNextAyah;
    }, [playNextAyah]);

    useEffect(() => {
        audioCacheRef.current = {};
        if (isPlaying || isAudioLoading) {
            const target = playingAyah || currentAyah;
            playAudio(target.s, target.a);
        }
    }, [settingsReader]);

    return {
        isPlaying,
        isAudioLoading,
        playingAyah,
        audioProgress,
        isPlayingRef,
        isAudioLoadingRef,
        currentRepeatCountRef,
        rangeRepeatCountRef,
        stopAudio,
        playAudio,
        playSingleAyah,
        playNextAyah,
    };
};
