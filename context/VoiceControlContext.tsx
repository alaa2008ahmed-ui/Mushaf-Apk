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
];

const VoiceControlContext = createContext<VoiceControlContextType | undefined>(undefined);

export const VoiceControlProvider: React.FC<{ children: React.ReactNode, onAction: (action: string, text: string) => void }> = ({ children, onAction }) => {
    const [isEnabled, setIsEnabled] = useState(() => localStorage.getItem('voice_control_enabled') === 'true');
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [commands, setCommands] = useState<VoiceCommand[]>(() => {
        const saved = localStorage.getItem('voice_commands_v2');
        return saved ? JSON.parse(saved) : DEFAULT_COMMANDS;
    });

    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        localStorage.setItem('voice_control_enabled', isEnabled.toString());
        if (isEnabled) {
            startRecognition();
        } else {
            stopRecognition();
        }
    }, [isEnabled]);

    useEffect(() => {
        localStorage.setItem('voice_commands_v2', JSON.stringify(commands));
    }, [commands]);

    const startRecognition = useCallback(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition && !recognitionRef.current) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'ar-SA';

            recognitionRef.current.onstart = () => setIsListening(true);
            recognitionRef.current.onend = () => {
                if (isEnabled) {
                    recognitionRef.current?.start();
                } else {
                    setIsListening(false);
                }
            };

            recognitionRef.current.onresult = (event: any) => {
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        const finalTranscript = event.results[i][0].transcript.trim().toLowerCase();
                        setTranscript(finalTranscript);
                        handleCommand(finalTranscript);
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                if (event.error === 'not-allowed') {
                    setIsEnabled(false);
                }
            };

            recognitionRef.current.start();
        }
    }, [isEnabled]);

    const stopRecognition = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
            setIsListening(false);
        }
    }, []);

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
