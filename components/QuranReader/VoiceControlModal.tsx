import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface VoiceControlModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentTheme: any;
    onCommand: (command: string) => void;
}

interface CustomCommand {
    phrase: string;
    action: string;
}

const VoiceControlModal: React.FC<VoiceControlModalProps> = ({
    isOpen,
    onClose,
    currentTheme,
    onCommand
}) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [customCommands, setCustomCommands] = useState<CustomCommand[]>(() => {
        const saved = localStorage.getItem('custom_voice_commands');
        return saved ? JSON.parse(saved) : [];
    });
    const [newPhrase, setNewPhrase] = useState('');
    const [newAction, setNewAction] = useState('');
    const [showAddCommand, setShowAddCommand] = useState(false);

    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'ar-SA';

            recognitionRef.current.onresult = (event: any) => {
                const current = event.resultIndex;
                const transcriptText = event.results[current][0].transcript;
                setTranscript(transcriptText);

                if (event.results[current].isFinal) {
                    onCommand(transcriptText);
                    setTimeout(() => {
                        setIsListening(false);
                    }, 1000);
                }
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
            };
        }
    }, [onCommand]);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            setTranscript('');
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    const saveCustomCommands = (commands: CustomCommand[]) => {
        setCustomCommands(commands);
        localStorage.setItem('custom_voice_commands', JSON.stringify(commands));
    };

    const addCommand = () => {
        if (newPhrase && newAction) {
            const updated = [...customCommands, { phrase: newPhrase.trim().toLowerCase(), action: newAction }];
            saveCustomCommands(updated);
            setNewPhrase('');
            setNewAction('');
            setShowAddCommand(false);
        }
    };

    const deleteCommand = (index: number) => {
        const updated = customCommands.filter((_, i) => i !== index);
        saveCustomCommands(updated);
    };

    const AVAILABLE_ACTIONS = [
        { id: 'next_page', name: 'الصفحة التالية' },
        { id: 'prev_page', name: 'الصفحة السابقة' },
        { id: 'open_search', name: 'فتح البحث' },
        { id: 'open_themes', name: 'فتح الثيمات' },
        { id: 'open_settings', name: 'فتح الإعدادات' },
        { id: 'open_bookmarks', name: 'فتح العلامات' },
        { id: 'open_tajweed', name: 'فتح تعليم التجويد' },
        { id: 'open_athkar', name: 'فتح الأذكار' },
        { id: 'open_prayer', name: 'فتح مواقيت الصلاة' },
        { id: 'open_qibla', name: 'فتح القبلة' },
        { id: 'open_tasbeeh', name: 'فتح المسبحة' },
        { id: 'play_audio', name: 'تشغيل/إيقاف الصوت' },
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                style={{ backgroundColor: currentTheme.modalBg, color: currentTheme.modalText }}
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: currentTheme.barBorder }}>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <i className="fa-solid fa-microphone-lines text-indigo-500"></i>
                        التحكم الصوتي
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-black/10 rounded-full transition-colors">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Microphone Section */}
                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <button 
                            onClick={toggleListening}
                            className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-xl transition-all ${isListening ? 'animate-pulse scale-110' : 'hover:scale-105'}`}
                            style={{ 
                                backgroundColor: isListening ? '#ef4444' : currentTheme.accent,
                                color: isListening ? '#ffffff' : currentTheme.accentText
                            }}
                        >
                            <i className={`fa-solid ${isListening ? 'fa-stop' : 'fa-microphone'}`}></i>
                        </button>
                        <p className="text-sm font-bold opacity-70">
                            {isListening ? 'جاري الاستماع...' : 'اضغط للتحدث بالأوامر العربية'}
                        </p>
                        
                        {transcript && (
                            <div className="p-4 rounded-2xl bg-black/5 w-full text-center italic font-bold">
                                "{transcript}"
                            </div>
                        )}
                    </div>

                    {/* Custom Commands Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-sm opacity-80">الأوامر المخصصة</h3>
                            <button 
                                onClick={() => setShowAddCommand(!showAddCommand)}
                                className="text-xs font-bold px-3 py-1 rounded-full"
                                style={{ backgroundColor: currentTheme.accent, color: currentTheme.accentText }}
                            >
                                {showAddCommand ? 'إلغاء' : 'إضافة أمر جديد'}
                            </button>
                        </div>

                        {showAddCommand && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                className="p-4 rounded-2xl border space-y-3"
                                style={{ borderColor: currentTheme.barBorder, backgroundColor: 'rgba(0,0,0,0.03)' }}
                            >
                                <div>
                                    <label className="text-xs font-bold block mb-1">عند سماع نص:</label>
                                    <input 
                                        type="text" 
                                        value={newPhrase}
                                        onChange={e => setNewPhrase(e.target.value)}
                                        placeholder="مثلاً: افتح المصحف"
                                        className="w-full p-2 rounded-lg border bg-transparent text-sm"
                                        style={{ borderColor: currentTheme.barBorder }}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold block mb-1">نفذ إجراء:</label>
                                    <select 
                                        value={newAction}
                                        onChange={e => setNewAction(e.target.value)}
                                        className="w-full p-2 rounded-lg border bg-transparent text-sm"
                                        style={{ borderColor: currentTheme.barBorder }}
                                    >
                                        <option value="">اختر الإجراء...</option>
                                        {AVAILABLE_ACTIONS.map(action => (
                                            <option key={action.id} value={action.id}>{action.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <button 
                                    onClick={addCommand}
                                    disabled={!newPhrase || !newAction}
                                    className="w-full py-2 rounded-xl font-bold text-sm disabled:opacity-50"
                                    style={{ backgroundColor: currentTheme.accent, color: currentTheme.accentText }}
                                >
                                    حفظ الأمر
                                </button>
                            </motion.div>
                        )}

                        <div className="space-y-2">
                            {customCommands.length === 0 ? (
                                <p className="text-xs opacity-50 text-center py-4">لا توجد أوامر مخصصة حالياً</p>
                            ) : (
                                customCommands.map((cmd, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl border" style={{ borderColor: currentTheme.barBorder }}>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold">"{cmd.phrase}"</span>
                                            <span className="text-[10px] opacity-60">{AVAILABLE_ACTIONS.find(a => a.id === cmd.action)?.name}</span>
                                        </div>
                                        <button onClick={() => deleteCommand(idx)} className="text-red-500 p-2">
                                            <i className="fa-solid fa-trash-can"></i>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Help Section */}
                    <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                        <h4 className="text-xs font-bold text-indigo-500 mb-2">أمثلة للأوامر المدمجة:</h4>
                        <ul className="text-[10px] space-y-1 opacity-80 list-disc list-inside">
                            <li>"اذهب إلى سورة الكهف"</li>
                            <li>"اذهب إلى صفحة مئة"</li>
                            <li>"اذهب إلى الجزء الثلاثين"</li>
                            <li>"افتح الأذكار"</li>
                            <li>"الصفحة التالية" / "الصفحة السابقة"</li>
                        </ul>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default VoiceControlModal;
