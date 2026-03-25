import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { parseVoiceCommand, normalizeArabic } from '../src/utils/voiceParser';
import { SURAH_NAMES_AR } from '../components/QuranReader/constants';

export interface VoiceCommand {
    id: string;
    phrase: string;
    action: string;
    isDefault?: boolean;
}

interface VoiceControlContextType {
    isEnabled: boolean;
    setIsEnabled: (enabled: boolean) => void;
    toggleEnabled: () => void;
    isListening: boolean;
    transcript: string;
    commands: VoiceCommand[];
    currentPage: string;
    setCurrentPage: (page: string) => void;
    updateCommand: (id: string, phrase: string) => void;
    addCommand: (phrase: string, action: string) => void;
    deleteCommand: (id: string) => void;
    resetToDefaults: () => void;
}

const DEFAULT_COMMANDS: VoiceCommand[] = [
    { id: 'next_page', phrase: 'الصفحة التالية', action: 'next_page', isDefault: true },
    { id: 'prev_page', phrase: 'الصفحة السابقة', action: 'prev_page', isDefault: true },
    { id: 'open_search', phrase: 'فتح البحث', action: 'open_search', isDefault: true },
    { id: 'open_themes', phrase: 'فتح الثيمات', action: 'open_themes', isDefault: true },
    { id: 'open_settings', phrase: 'فتح الإعدادات', action: 'open_settings', isDefault: true },
    { id: 'open_bookmarks', phrase: 'فتح العلامات', action: 'open_bookmarks', isDefault: true },
    { id: 'open_tajweed', phrase: 'فتح تعليم التجويد', action: 'open_tajweed', isDefault: true },
    { id: 'open_athkar', phrase: 'فتح الأذكار', action: 'open_athkar', isDefault: true },
    { id: 'open_prayer', phrase: 'فتح مواقيت الصلاة', action: 'open_prayer', isDefault: true },
    { id: 'open_qibla', phrase: 'فتح القبلة', action: 'open_qibla', isDefault: true },
    { id: 'open_tasbeeh', phrase: 'فتح المسبحة', action: 'open_tasbeeh', isDefault: true },
    { id: 'play_audio', phrase: 'تشغيل الصوت', action: 'play_audio', isDefault: true },
    { id: 'stop_audio', phrase: 'إيقاف الصوت', action: 'stop_audio', isDefault: true },
    { id: 'go_home', phrase: 'الرئيسية', action: 'go_home', isDefault: true },
    { id: 'increase_font', phrase: 'تكبير الخط', action: 'increase_font', isDefault: true },
    { id: 'decrease_font', phrase: 'تصغير الخط', action: 'decrease_font', isDefault: true },
    { id: 'change_theme', phrase: 'تغيير لون الخلفية', action: 'change_theme', isDefault: true },
    { id: 'download_quran', phrase: 'تحميل القرآن', action: 'download_quran', isDefault: true },
    { id: 'show_tafsir', phrase: 'عرض التفسير', action: 'show_tafsir', isDefault: true },
    { id: 'open_nawawi', phrase: 'فتح الأربعون النووية', action: 'open_nawawi', isDefault: true },
    { id: 'open_calculators', phrase: 'فتح الحاسبة الشرعية', action: 'open_calculators', isDefault: true },
    { id: 'open_listen', phrase: 'فتح الاستماع للقرآن', action: 'open_listen', isDefault: true },
    { id: 'open_adia', phrase: 'فتح الأدعية', action: 'open_adia', isDefault: true },
    { id: 'open_salah_adhkar', phrase: 'فتح أذكار الصلاة', action: 'open_salah_adhkar', isDefault: true },
    { id: 'open_hisn_muslim', phrase: 'فتح حصن المسلم', action: 'open_hisn_muslim', isDefault: true },
    { id: 'open_calendar', phrase: 'فتح التقويم', action: 'open_calendar', isDefault: true },
    { id: 'open_hajj_umrah', phrase: 'فتح الحج والعمرة', action: 'open_hajj_umrah', isDefault: true },
    { id: 'open_quran', phrase: 'مصحف', action: 'open_quran', isDefault: true },
    { id: 'open_voice_control', phrase: 'فتح التحكم الصوتي', action: 'open_voice_control', isDefault: true },
    { id: 'disable_voice_control', phrase: 'إيقاف التحكم الصوتي', action: 'disable_voice_control', isDefault: true },
    // Direct Navigation Commands (No "Open" prefix)
    { id: 'nav_listen', phrase: 'الاستماع للقران', action: 'open_listen', isDefault: true },
    { id: 'nav_prayer', phrase: 'مواقيت الصلاه', action: 'open_prayer', isDefault: true },
    { id: 'nav_salah_adhkar', phrase: 'اذكار الصلاه', action: 'open_salah_adhkar', isDefault: true },
    { id: 'nav_hisn_muslim', phrase: 'حصن المسلم', action: 'open_hisn_muslim', isDefault: true },
    { id: 'nav_hisn_muslim_alt', phrase: 'حسن المسلم', action: 'open_hisn_muslim', isDefault: true },
    { id: 'nav_calendar', phrase: 'التقويم', action: 'open_calendar', isDefault: true },
    { id: 'nav_qibla', phrase: 'القبله', action: 'open_qibla', isDefault: true },
    { id: 'nav_hajj_umrah', phrase: 'الحج والعمرة', action: 'open_hajj_umrah', isDefault: true },
    { id: 'nav_voice_control', phrase: 'التحكم الصوتى', action: 'open_voice_control', isDefault: true },
];

const VoiceControlContext = createContext<VoiceControlContextType | undefined>(undefined);

export const VoiceControlProvider: React.FC<{ children: React.ReactNode, onAction: (action: string, text: string, params?: any) => void }> = ({ children, onAction }) => {
    const [isEnabled, setIsEnabled] = useState(() => localStorage.getItem('voice_control_enabled') === 'true');
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [currentPage, setCurrentPage] = useState('home');
    const [commands, setCommands] = useState<VoiceCommand[]>(() => {
        const saved = localStorage.getItem('voice_commands_v2');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Merge any new default commands that might be missing
            const missingDefaults = DEFAULT_COMMANDS.filter(dc => !parsed.some((pc: VoiceCommand) => pc.id === dc.id));
            return [...parsed, ...missingDefaults];
        }
        return DEFAULT_COMMANDS;
    });

    const isEnabledRef = useRef(isEnabled);
    const isStartingRef = useRef(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const silentNodeRef = useRef<OscillatorNode | null>(null);

    // Create a silent audio anchor to keep audio focus and prevent system from stopping Quran audio
    const startSilentAnchor = useCallback(() => {
        try {
            if (!audioContextRef.current) {
                const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
                if (AudioContextClass) {
                    audioContextRef.current = new AudioContextClass();
                }
            }
            
            if (audioContextRef.current && !silentNodeRef.current) {
                const ctx = audioContextRef.current;
                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();
                
                gainNode.gain.value = 0.001; // Extremely low volume, practically silent
                oscillator.connect(gainNode);
                gainNode.connect(ctx.destination);
                
                oscillator.start();
                silentNodeRef.current = oscillator;
                console.log('Voice Control - Silent Audio Anchor Started');
            }
        } catch (e) {
            console.warn('Failed to start silent audio anchor:', e);
        }
    }, []);

    const stopSilentAnchor = useCallback(() => {
        if (silentNodeRef.current) {
            try {
                silentNodeRef.current.stop();
                silentNodeRef.current.disconnect();
            } catch (e) {}
            silentNodeRef.current = null;
        }
        if (audioContextRef.current) {
            try {
                audioContextRef.current.close();
            } catch (e) {}
            audioContextRef.current = null;
        }
        console.log('Voice Control - Silent Audio Anchor Stopped');
    }, []);

    useEffect(() => {
        localStorage.setItem('voice_commands_v2', JSON.stringify(commands));
    }, [commands]);

    const reloadCommands = useCallback(() => {
        const saved = localStorage.getItem('voice_commands_v2');
        if (saved) {
            const parsed = JSON.parse(saved);
            const missingDefaults = DEFAULT_COMMANDS.filter(dc => !parsed.some((pc: VoiceCommand) => pc.id === dc.id));
            setCommands([...parsed, ...missingDefaults]);
            console.log('Voice commands reloaded from storage');
        } else {
            setCommands(DEFAULT_COMMANDS);
        }
    }, []);

    const handleCommand = useCallback((text: string) => {
        const normalizedInput = normalizeArabic(text);
        console.log('Voice Control - Context:', currentPage);
        console.log('Voice Control - Original Input:', text);

        // 1. Contextual Focus: If an input is focused, type into it
        const activeElement = document.activeElement;
        if (activeElement && (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement)) {
            console.log('Voice Control - Typing into focused input');
            const start = activeElement.selectionStart || 0;
            const end = activeElement.selectionEnd || 0;
            const val = activeElement.value;
            activeElement.value = val.substring(0, start) + text + val.substring(end);
            activeElement.selectionStart = activeElement.selectionEnd = start + text.length;
            activeElement.dispatchEvent(new Event('input', { bubbles: true }));
            
            // Special case for Search: Execute search immediately
            if (currentPage === 'search' || activeElement.closest('.search-modal')) {
                console.log('Voice Control - Executing search');
                window.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'execute_search', text } }));
            }
            return;
        }

        // 2. Specific Page Context Handling
        if (currentPage === 'quran-download') {
            // In download page, surah names should toggle selection
            const surahMatch = SURAH_NAMES_AR.find(s => normalizeArabic(s) === normalizedInput);
            if (surahMatch) {
                console.log('Voice Control - Download Context: Toggling surah', surahMatch);
                window.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'toggle_download', params: { surahName: surahMatch } } }));
                return;
            }
        }

        if (currentPage === 'search') {
            if (normalizedInput.includes('الغاء البحث') || normalizedInput.includes('بحث جديد')) {
                window.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'clear_search' } }));
                return;
            }
            if (normalizedInput.includes('اغلاق البحث')) {
                window.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'close_search' } }));
                return;
            }
        }

        // 3. Use the new parser for Quran navigation and dynamic commands
        const parsed = parseVoiceCommand(text, SURAH_NAMES_AR, commands);
        if (parsed) {
            console.log('Voice Control - Parsed Command:', parsed.action, parsed.params);
            
            if (parsed.action === 'disable_voice_control') {
                setIsEnabled(false);
                return;
            }

            if (parsed.action === 'ui_discovery') {
                // Try to find a matching UI element and click it (Voice-to-Click Engine)
                // Prioritize exact matches and specific containers based on context
                const selectors = currentPage === 'quran' 
                    ? '.quran-reader-container button, .quran-reader-container [role="button"], .quran-reader-container li'
                    : 'button, [role="button"], a, .clickable, .voice-target, li, span, h1, h2, h3, p';
                
                const elements = document.querySelectorAll(selectors);
                for (const el of Array.from(elements)) {
                    const htmlEl = el as HTMLElement;
                    const elText = normalizeArabic(htmlEl.innerText || htmlEl.getAttribute('aria-label') || htmlEl.title || '');
                    if (elText && (elText === normalizedInput || elText.includes(normalizedInput))) {
                        console.log('Voice Control - UI Discovery: Clicking', elText);
                        htmlEl.click();
                        return;
                    }
                }
            }
            
            onAction(parsed.action, text, parsed.params);
            return;
        }

        // 4. Fallback to basic pattern matching for Quran navigation (if parser missed it)
        if (normalizedInput.includes('سوره') || normalizedInput.includes('سورة') || 
            normalizedInput.includes('صفحه') || normalizedInput.includes('صفحة') || 
            normalizedInput.includes('جزء')) {
            console.log('Voice Control - Fallback Match: Quran Navigation');
            onAction('quran_navigation', text);
        }
    }, [commands, onAction, currentPage]);

    const handleCommandRef = useRef(handleCommand);

    useEffect(() => {
        handleCommandRef.current = handleCommand;
    }, [handleCommand]);

    const startRecognition = useCallback(async () => {
        if (isStartingRef.current) return;
        isStartingRef.current = true;

        // Reload commands every time we start recognition as requested
        reloadCommands();

        try {
            const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
            
            console.log('Voice Recognition Started. Active phrases:', commands.map(c => c.phrase));
            
            // 1. Safely check and request permissions without blocking
            try {
                const checkPerm = await SpeechRecognition.checkPermissions();
                if (checkPerm.speechRecognition !== 'granted') {
                    await SpeechRecognition.requestPermissions();
                }
            } catch (permError) {
                console.warn('Permission check error (proceeding anyway):', permError);
            }

            // 2. Start listening loop
            const listenLoop = async () => {
                if (!isEnabledRef.current) {
                    setIsListening(false);
                    stopSilentAnchor();
                    return;
                }
                
                // Start silent anchor to protect audio focus
                startSilentAnchor();
                
                try {
                    // Ensure any previous session is stopped
                    try {
                        await SpeechRecognition.stop();
                    } catch (e) {}

                    setIsListening(true);
                    const result = await SpeechRecognition.start({
                        language: "ar-SA",
                        maxResults: 1,
                        partialResults: true, // Changed to true for better responsiveness
                        popup: false 
                    });

                    if (result && result.matches && result.matches.length > 0) {
                        const finalTranscript = result.matches[0].trim().toLowerCase();
                        setTranscript(finalTranscript);
                        handleCommandRef.current(finalTranscript);
                    }
                } catch (e: any) {
                    if (e?.message === 'Method not implemented on web.') {
                        setIsEnabled(false);
                        setIsListening(false);
                        stopSilentAnchor();
                        return; // Stop loop on web
                    }
                    console.error('Speech recognition error:', e);
                } finally {
                    if (isEnabledRef.current) {
                        // Minimal delay to allow system to breathe but keep loop tight
                        setTimeout(listenLoop, 300);
                    } else {
                        setIsListening(false);
                        stopSilentAnchor();
                    }
                }
            };

            listenLoop();
            isStartingRef.current = false;

        } catch (e: any) {
            // Ignore "Method not implemented on web" error as it's expected in browser
            if (e?.message !== 'Method not implemented on web.') {
                console.error('Error starting recognition:', e);
            }
            setIsEnabled(false);
            isStartingRef.current = false;
        }
    }, []);

    const stopRecognition = useCallback(async () => {
        try {
            const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
            await SpeechRecognition.stop();
        } catch (e: any) {
            // Ignore "Method not implemented on web" error as it's expected in browser
            if (e?.message !== 'Method not implemented on web.') {
                console.error('Error stopping recognition:', e);
            }
        }
        setIsListening(false);
    }, []);

    // Sync state changes to refs and trigger start/stop
    useEffect(() => {
        isEnabledRef.current = isEnabled;
        localStorage.setItem('voice_control_enabled', isEnabled.toString());
        
        if (isEnabled) {
            startRecognition();
        } else {
            stopRecognition();
        }
    }, [isEnabled, startRecognition, stopRecognition]);

    // Disable voice control when app goes to background
    useEffect(() => {
        const listener = CapacitorApp.addListener('appStateChange', ({ isActive }) => {
            if (!isActive && isEnabledRef.current) {
                setIsEnabled(false);
            }
        });

        return () => {
            listener.then(l => l.remove());
        };
    }, []);

    const toggleEnabled = useCallback(() => {
        setIsEnabled(prev => !prev);
    }, []);

    const updateCommand = (id: string, phrase: string) => {
        setCommands(prev => prev.map(c => c.id === id ? { ...c, phrase } : c));
    };

    const addCommand = (phrase: string, action: string) => {
        const newCmd: VoiceCommand = {
            id: Date.now().toString(),
            phrase,
            action,
            isDefault: false
        };
        setCommands(prev => [...prev, newCmd]);
    };

    const deleteCommand = (id: string) => {
        setCommands(prev => prev.filter(c => c.id !== id));
    };

    const resetToDefaults = () => {
        setCommands(DEFAULT_COMMANDS);
    };

    return (
        <VoiceControlContext.Provider value={{
            isEnabled,
            setIsEnabled,
            toggleEnabled,
            isListening,
            transcript,
            commands,
            currentPage,
            setCurrentPage,
            updateCommand,
            addCommand,
            deleteCommand,
            resetToDefaults
        }}>
            {children}
        </VoiceControlContext.Provider>
    );
};

export const useVoiceControl = () => {
    const context = useContext(VoiceControlContext);
    if (context === undefined) {
        throw new Error('useVoiceControl must be used within a VoiceControlProvider');
    }
    return context;
};
