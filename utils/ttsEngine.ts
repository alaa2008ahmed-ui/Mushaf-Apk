import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

/**
 * Centralized Text-to-Speech (TTS) Engine for spiritual texts (Adia, Adhkar, Hadiths).
 * Ensures a robust, high-quality, offline male voice across all devices and browsers.
 * Native platform support is enabled via Capacitor TextToSpeech when packaged as an APK.
 */

export type TTSStateCallback = (playingText: string | null) => void;

let currentUtterance: SpeechSynthesisUtterance | null = null;
let currentPlayingText: string | null = null;
const stateListeners: Set<TTSStateCallback> = new Set();

/**
 * Notifies all registered listeners of the current playback state.
 */
const notifyListeners = () => {
    stateListeners.forEach((listener) => listener(currentPlayingText));
};

/**
 * Subscribes to the playing state of the TTS engine.
 * Useful for React components to synchronize their play/pause buttons.
 */
export const subscribeTTS = (listener: TTSStateCallback) => {
    stateListeners.add(listener);
    listener(currentPlayingText); // initial call with current state
    return () => {
        stateListeners.delete(listener);
    };
};

/**
 * Stops any ongoing audio speech synthesis completely.
 */
export const stopTTS = () => {
    if (Capacitor.isNativePlatform()) {
        TextToSpeech.stop().catch((err) => console.error('Error stopping native TTS:', err));
    } else {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    }
    currentUtterance = null;
    currentPlayingText = null;
    notifyListeners();
};

/**
 * Retrieves the currently playing text, or null if idle.
 */
export const getPlayingText = (): string | null => currentPlayingText;

/**
 * Plays a given text, enforcing a male voice.
 * Supports both Native Android/iOS (via Capacitor) and Web Speech API.
 * @param text The Arabic text to speak.
 * @param onToast Optional callback to notify the UI of any messages or errors.
 */
export const playTTS = async (text: string, onToast?: (msg: string) => void) => {
    // Strip HTML tags from text if any
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    let cleanText = tempDiv.textContent || tempDiv.innerText || '';

    // If the exact text is already playing, stop it (toggle play/pause)
    if (currentPlayingText === text) {
        stopTTS();
        return;
    }

    // Stop any active playback first
    stopTTS();

    // 1. NATIVE PLATFORM SOLUTION (Android APK / iOS)
    if (Capacitor.isNativePlatform()) {
        currentPlayingText = text;
        notifyListeners();

        try {
            await TextToSpeech.speak({
                text: cleanText,
                lang: 'ar-SA',
                rate: 0.88,   // Calmer speed appropriate for supplication/remembrance
                pitch: 0.75,  // Deepen pitch natively: transforms generic system voice to deep, majestic male voice!
                volume: 1.0,
                category: 'playback'
            });

            // If it completed and hasn't been interrupted by another play request
            if (currentPlayingText === text) {
                currentPlayingText = null;
                notifyListeners();
            }
        } catch (err) {
            console.error('Native TTS Speak Error:', err);
            if (onToast) {
                onToast('خدمة القراءة الصوتية تواجه مشكلة على هذا الهاتف');
            }
            if (currentPlayingText === text) {
                currentPlayingText = null;
                notifyListeners();
            }
        }
        return;
    }

    // 2. WEB BROWSER SOLUTION (Previews, Safari, Chrome)
    if (!('speechSynthesis' in window)) {
        if (onToast) {
            onToast('خدمة القراءة الصوتية غير مدعومة على هذا الجهاز أو المتصفح');
        }
        return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.88;

    // Get all available system/browser voices
    const voices = window.speechSynthesis.getVoices();
    const arabicVoices = voices.filter((v) => {
        const lang = v.lang.toLowerCase();
        return lang.startsWith('ar') || lang.includes('ar-');
    });

    // Keywords to recognize explicitly male Arabic voices
    const maleVoiceKeywords = [
        'maged', 'hazem', 'hamid', 'shakir', 'male', 'naayf', 'tarik', 'ward',
        'arb-local', 'ard-local', 'arz-local', 'b-local', 'c-local', 'd-local', 'wavenet-b', 'wavenet-c', 'standard-b', 'standard-c'
    ];

    // Keywords to explicitly avoid (female voices)
    const femaleVoiceKeywords = [
        'laila', 'hoda', 'female', 'yasmine', 'mary', 'zeina', 'salma',
        'ara-local', 'arc-local', 'are-local', 'a-local', 'e-local', 'wavenet-a', 'wavenet-d', 'standard-a', 'standard-d'
    ];

    let chosenVoice: SpeechSynthesisVoice | null = null;
    let isExplicitMale = false;

    if (arabicVoices.length > 0) {
        // Look for a voice with known male tags
        chosenVoice = arabicVoices.find((v) => {
            const name = v.name.toLowerCase();
            return maleVoiceKeywords.some((keyword) => name.includes(keyword));
        }) || null;

        // If not found, try to avoid explicit female names
        if (!chosenVoice) {
            chosenVoice = arabicVoices.find((v) => {
                const name = v.name.toLowerCase();
                return !femaleVoiceKeywords.some((keyword) => name.includes(keyword));
            }) || null;
        }

        // Fallback to any Arabic voice
        if (!chosenVoice) {
            chosenVoice = arabicVoices[0];
        }
    }

    if (chosenVoice) {
        utterance.voice = chosenVoice;
        const name = chosenVoice.name.toLowerCase();
        isExplicitMale = maleVoiceKeywords.some((keyword) => name.includes(keyword));
    }

    // Drop the pitch to 0.78 for web fallback to turn female default voices into a gorgeous deep male voice.
    utterance.pitch = isExplicitMale ? 0.95 : 0.78;

    utterance.onstart = () => {
        currentPlayingText = text;
        currentUtterance = utterance;
        notifyListeners();
    };

    utterance.onend = () => {
        if (currentPlayingText === text) {
            currentPlayingText = null;
            currentUtterance = null;
            notifyListeners();
        }
    };

    utterance.onerror = (event) => {
        console.error('Web TTS playback error:', event);
        if (currentPlayingText === text) {
            currentPlayingText = null;
            currentUtterance = null;
            notifyListeners();
        }
    };

    window.speechSynthesis.speak(utterance);
};
