import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { VoiceRecorder } from 'capacitor-voice-recorder';
import { acquireListenInterruption, releaseListenInterruption } from '../utils/audio/listenAudioCoordinator';
import { normalizeArabic } from '../utils/audio/voiceParser';

interface UseQuranMemorizationRecorderParams {
    quranData: any;
    currentAyahRef: React.MutableRefObject<{ s: number; a: number }>;
    localMemorizationSettings: any;
    language: string;
    showToast: (message: string) => void;
    stopAudio: () => void;
    jumpToAyahRef: React.MutableRefObject<(s: number, a: number, instant?: boolean, isPageJump?: boolean) => void>;
}

export const useQuranMemorizationRecorder = ({
    quranData,
    currentAyahRef,
    localMemorizationSettings,
    language,
    showToast,
    stopAudio,
    jumpToAyahRef,
}: UseQuranMemorizationRecorderParams) => {
    const [revealedAyahs, setRevealedAyahs] = useState<string[]>([]);
    const [tempRevealedAyah, setTempRevealedAyah] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordedAudio, setRecordedAudio] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recordedAudioRef = useRef<HTMLAudioElement | null>(null);
    const speechRecognitionRef = useRef<any>(null);
    const recognizedTextRef = useRef<string>('');
    const isSpeechRecognitionActiveRef = useRef(false);

    const stopRecordedAudio = useCallback(() => {
        if (recordedAudioRef.current) {
            recordedAudioRef.current.pause();
            recordedAudioRef.current = null;
        }
    }, []);

    const checkRecognizedText = (isFinalCheck = false) => {
        const ayah = currentAyahRef.current;
        const spokenText = normalizeArabic(recognizedTextRef.current);
        const currentAyahData = quranData?.surahs[ayah.s - 1]?.ayahs[ayah.a - 1];

        if (currentAyahData) {
            const originalText = normalizeArabic(currentAyahData.text);

            const spokenWords = spokenText.split(' ').filter(w => w.length > 0);
            const originalWords = originalText.split(' ').filter(w => w.length > 0);

            let matchCount = 0;
            for (const word of originalWords) {
                if (spokenWords.includes(word)) {
                    matchCount++;
                }
            }

            const matchPercentage = originalWords.length > 0 ? matchCount / originalWords.length : 0;

            if (matchPercentage > 0.6 || spokenText.includes(originalText) || originalText.includes(spokenText)) {
                showToast('أحسنت');
                const ayahKey = `${ayah.s}-${ayah.a}`;
                setRevealedAyahs(prev => prev.includes(ayahKey) ? prev : [...prev, ayahKey]);

                recognizedTextRef.current = '';

                let isEnd = false;
                if (localMemorizationSettings) {
                    const { toSurah, toAyah } = localMemorizationSettings;
                    if (ayah.s === toSurah && ayah.a === toAyah) {
                        showToast('تم الانتهاء من المراجعة بنجاح');
                        isEnd = true;
                    }
                }

                stopRecording(true);

                if (isEnd) return;

                const nextA = ayah.a + 1;
                const currentSurah = quranData.surahs[ayah.s - 1];
                if (nextA <= currentSurah.ayahs.length) {
                    jumpToAyahRef.current(ayah.s, nextA, true);
                } else if (ayah.s < 114) {
                    jumpToAyahRef.current(ayah.s + 1, 1, true);
                }
            } else if (spokenWords.length >= Math.max(2, originalWords.length * 0.4)) {
                showToast('أخطأت، حاول مرة أخرى');
                const ayahKey = `${ayah.s}-${ayah.a}`;
                setTempRevealedAyah(ayahKey);

                recognizedTextRef.current = '';

                setTimeout(() => {
                    setTempRevealedAyah(null);
                }, 3000);
            } else if (isFinalCheck) {
                showToast('أخطأت أعد المحاولة');

                const ayahKey = `${ayah.s}-${ayah.a}`;
                setTempRevealedAyah(ayahKey);
                setTimeout(() => {
                    setTempRevealedAyah(null);
                }, 800);

                if (recognizedTextRef.current) {
                    console.log("Recognized text was:", recognizedTextRef.current);
                }

                recognizedTextRef.current = '';
            }
        }
    };

    const startRecording = async () => {
        stopAudio();
        stopRecordedAudio();
        acquireListenInterruption('quran-reader-mic');

        recognizedTextRef.current = '';
        isSpeechRecognitionActiveRef.current = false;

        if (localMemorizationSettings?.isReviewMode) {
            try {
                if (Capacitor.isNativePlatform()) {
                    const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
                    const checkPerm = await SpeechRecognition.checkPermissions();
                    if (checkPerm.speechRecognition !== 'granted') {
                        await SpeechRecognition.requestPermissions();
                    }

                    SpeechRecognition.removeAllListeners();
                    SpeechRecognition.addListener('partialResults', (data: any) => {
                        if (data.matches && data.matches.length > 0) {
                            recognizedTextRef.current = data.matches[0];
                            checkRecognizedText(false);
                        }
                    });

                    SpeechRecognition.addListener('listeningState', (data: any) => {
                        console.log("Listening state changed:", data.status);
                    });

                    await SpeechRecognition.start({
                        language: "ar-SA",
                        maxResults: 1,
                        partialResults: true,
                        popup: false
                    });

                    isSpeechRecognitionActiveRef.current = true;
                } else {
                    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                    if (SpeechRecognitionAPI) {
                        const recognition = new SpeechRecognitionAPI();
                        recognition.lang = 'ar-SA';
                        recognition.continuous = true;
                        recognition.interimResults = true;

                        recognition.onstart = () => {
                            console.log("Speech recognition started");
                            showToast('جاري الاستماع...');
                        };

                        recognition.onerror = (event: any) => {
                            const err = event?.error;
                            if (err === 'not-allowed' || err === 'service-not-allowed') {
                                console.warn("Speech recognition permission denied by user/browser:", err);
                                showToast(language === 'en' ? 'Microphone permission denied' : 'تم رفض إذن الميكروفون');
                            } else if (err !== 'no-speech' && err !== 'aborted') {
                                console.warn("Speech recognition warning:", err);
                                showToast(language === 'en' ? 'Voice recognition error' : 'تعذر التعرف على الصوت');
                            }
                            setIsRecording(false);
                            isSpeechRecognitionActiveRef.current = false;
                            releaseListenInterruption('quran-reader-mic');
                            if (speechRecognitionRef.current) {
                                try {
                                    speechRecognitionRef.current.abort();
                                } catch (_) {}
                                speechRecognitionRef.current = null;
                            }
                        };

                        recognition.onresult = (event: any) => {
                            let interimTranscript = '';
                            let isFinal = false;
                            for (let i = event.resultIndex; i < event.results.length; ++i) {
                                if (event.results[i].isFinal) {
                                    recognizedTextRef.current = event.results[i][0].transcript;
                                    isFinal = true;
                                } else {
                                    interimTranscript += event.results[i][0].transcript;
                                }
                            }
                            if (interimTranscript) {
                                recognizedTextRef.current = interimTranscript;
                            }
                            checkRecognizedText(isFinal);
                        };

                        speechRecognitionRef.current = recognition;
                        recognition.start();
                        isSpeechRecognitionActiveRef.current = true;
                    } else {
                        throw new Error("Speech Recognition not supported");
                    }
                }
                setIsRecording(true);
                showToast('بدأ الاستماع...');
                return;
            } catch (err) {
                console.error("Error starting speech recognition", err);
                isSpeechRecognitionActiveRef.current = false;
            }
        }

        try {
            if (Capacitor.isNativePlatform()) {
                const hasPermission = await VoiceRecorder.hasAudioRecordingPermission();
                if (!hasPermission.value) {
                    const request = await VoiceRecorder.requestAudioRecordingPermission();
                    if (!request.value) {
                        releaseListenInterruption('quran-reader-mic');
                        showToast('الرجاء منح صلاحية الميكروفون');
                        return;
                    }
                }

                const result = await VoiceRecorder.startRecording();
                if (result.value) {
                    setIsRecording(true);
                    showToast('بدأ التسجيل...');
                } else {
                    releaseListenInterruption('quran-reader-mic');
                    showToast('فشل بدء التسجيل');
                }
            } else {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;
                audioChunksRef.current = [];

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        audioChunksRef.current.push(event.data);
                    }
                };

                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    setRecordedAudio(audioUrl);
                    setIsRecording(false);
                    releaseListenInterruption('quran-reader-mic');
                };

                mediaRecorder.start();
                setIsRecording(true);
                showToast('بدأ التسجيل...');
            }
        } catch (err) {
            console.error("Error starting recording", err);
            releaseListenInterruption('quran-reader-mic');
            showToast('فشل بدء التسجيل');
        }
    };

    const stopRecording = async (isAutoMatched: any = false) => {
        const autoMatched = isAutoMatched === true;
        setIsRecording(false);
        releaseListenInterruption('quran-reader-mic');
        if (localMemorizationSettings?.isReviewMode && isSpeechRecognitionActiveRef.current) {
            try {
                if (Capacitor.isNativePlatform()) {
                    const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
                    await SpeechRecognition.stop();
                    SpeechRecognition.removeAllListeners();
                } else if (speechRecognitionRef.current) {
                    speechRecognitionRef.current.stop();
                }

                isSpeechRecognitionActiveRef.current = false;

                if (!autoMatched) {
                    checkRecognizedText(true);
                }
                return;
            } catch (err) {
                console.error("Error stopping speech recognition", err);
            }
        }

        if (Capacitor.isNativePlatform()) {
            try {
                const result = await VoiceRecorder.stopRecording();
                if (result.value && result.value.recordDataBase64) {
                    const audioUrl = `data:${result.value.mimeType};base64,${result.value.recordDataBase64}`;
                    setRecordedAudio(audioUrl);
                    showToast('تم إيقاف التسجيل');
                }
            } catch (err) {
                console.error("Error stopping recording", err);
                showToast('فشل إيقاف التسجيل');
            }
        } else if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            showToast('تم إيقاف التسجيل');
        }
    };

    const playRecordedAudio = () => {
        stopAudio();
        stopRecordedAudio();
        if (recordedAudio) {
            acquireListenInterruption('quran-reader-recorded');
            const audio = new Audio(recordedAudio);
            recordedAudioRef.current = audio;
            audio.onended = () => {
                releaseListenInterruption('quran-reader-recorded');
            };
            audio.onerror = () => {
                releaseListenInterruption('quran-reader-recorded');
            };
            audio.play().catch(() => {
                releaseListenInterruption('quran-reader-recorded');
            });
        }
    };

    useEffect(() => {
        return () => {
            if (speechRecognitionRef.current) {
                try { speechRecognitionRef.current.stop(); } catch (_) {}
            }
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                try {
                    mediaRecorderRef.current.stop();
                    mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
                } catch (_) {}
            }
            releaseListenInterruption('quran-reader-mic');
        };
    }, []);

    return {
        revealedAyahs,
        setRevealedAyahs,
        tempRevealedAyah,
        setTempRevealedAyah,
        isRecording,
        recordedAudio,
        startRecording,
        stopRecording,
        playRecordedAudio,
        stopRecordedAudio,
    };
};
