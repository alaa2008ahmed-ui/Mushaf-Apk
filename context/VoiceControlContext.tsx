import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

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
    { id: 'open_voice_control', phrase: 'فتح التحكم الصوتي', action: 'open_voice_control', isDefault: true },
];

const VoiceControlContext = createContext<VoiceControlContextType | undefined>(undefined);

export const VoiceControlProvider: React.FC<{ children: React.ReactNode, onAction: (action: string, text: string) => void }> = ({ children, onAction }) => {
    const [isEnabled, setIsEnabled] = useState(() => localStorage.getItem('voice_control_enabled') === 'true');
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
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

    useEffect(() => {
        isEnabledRef.current = isEnabled;
        localStorage.setItem('voice_control_enabled', isEnabled.toString());
        // Only start on mount if it was enabled, but we rely on user interaction for subsequent toggles
    }, [isEnabled]);

    // Start on mount if enabled
    useEffect(() => {
        if (isEnabled) {
            startRecognition();
        }
    }, []); // Run once on mount

    useEffect(() => {
        localStorage.setItem('voice_commands_v2', JSON.stringify(commands));
    }, [commands]);

    const handleCommand = useCallback((text: string) => {
        // Check custom/edited commands first
        const match = commands.find(c => text.includes(c.phrase.toLowerCase()));
        if (match) {
            onAction(match.action, text);
            return;
        }

        // Fallback to basic pattern matching if no exact phrase match
        if (text.includes('سورة') || text.includes('صفحة') || text.includes('جزء')) {
            onAction('quran_navigation', text);
        }
    }, [commands, onAction]);

    const handleCommandRef = useRef(handleCommand);

    useEffect(() => {
        handleCommandRef.current = handleCommand;
    }, [handleCommand]);

    const startRecognition = useCallback(async () => {
        if (isStartingRef.current) return;
        isStartingRef.current = true;

        try {
            const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
            
            // Request permission and wait for system response
            const permissionResult = await SpeechRecognition.requestPermission();
            
            // Check if permission is granted (handle different possible return formats)
            let isGranted = false;
            if (permissionResult === true) isGranted = true;
            else if (typeof permissionResult === 'object') {
                if ((permissionResult as any).speechRecognition === 'granted') isGranted = true;
                else if ((permissionResult as any).permission === true) isGranted = true;
                else if ((permissionResult as any).granted === true) isGranted = true;
            }

            // Fallback check if the result format is unknown
            if (!isGranted) {
                const checkPerm = await SpeechRecognition.hasPermission();
                if (checkPerm.permission) {
                    isGranted = true;
                }
            }

            if (!isGranted) {
                alert('يرجى السماح بالوصول إلى الميكروفون لتفعيل التحكم الصوتي.');
                setIsEnabled(false);
                isStartingRef.current = false;
                return;
            }

            const listenLoop = async () => {
                if (!isEnabledRef.current) {
                    setIsListening(false);
                    return;
                }
                
                try {
                    setIsListening(true);
                    const result = await SpeechRecognition.start({
                        language: "ar-SA",
                        partialResults: false,
                        popup: false
                    });

                    if (result && result.matches && result.matches.length > 0) {
                        const finalTranscript = result.matches[0].trim().toLowerCase();
                        setTranscript(finalTranscript);
                        handleCommandRef.current(finalTranscript);
                    }
                } catch (e) {
                    console.error('Speech recognition error:', e);
                } finally {
                    if (isEnabledRef.current) {
                        // Small delay before restarting to avoid freezing
                        setTimeout(listenLoop, 500);
                    } else {
                        setIsListening(false);
                    }
                }
            };

            listenLoop();
            isStartingRef.current = false;

        } catch (e) {
            console.error('Error starting recognition:', e);
            setIsEnabled(false);
            isStartingRef.current = false;
        }
    }, []);

    const stopRecognition = useCallback(async () => {
        try {
            const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
            await SpeechRecognition.stop();
        } catch (e) {
            console.error('Error stopping recognition:', e);
        }
        setIsListening(false);
    }, []);

    const toggleEnabled = useCallback(() => {
        setIsEnabled(prev => {
            const nextState = !prev;
            if (nextState) {
                startRecognition();
            } else {
                stopRecognition();
            }
            return nextState;
        });
    }, [startRecognition, stopRecognition]);

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
