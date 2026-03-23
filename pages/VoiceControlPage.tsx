
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useVoiceControl, VoiceCommand } from '../context/VoiceControlContext';
import { Mic, MicOff, Trash2, Edit2, Check, X, Plus, RotateCcw, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import BottomBar from '../components/BottomBar';

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
    { id: 'play_audio', name: 'تشغيل الصوت' },
    { id: 'stop_audio', name: 'إيقاف الصوت' },
    { id: 'go_home', name: 'الرئيسية' },
];

const VoiceControlPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { theme } = useTheme();
    const { 
        isEnabled, 
        setIsEnabled, 
        isListening, 
        transcript, 
        commands, 
        updateCommand, 
        addCommand, 
        deleteCommand,
        resetToDefaults
    } = useVoiceControl();

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [showAddCommand, setShowAddCommand] = useState(false);
    const [newPhrase, setNewPhrase] = useState('');
    const [newAction, setNewAction] = useState('');

    const handleEdit = (cmd: VoiceCommand) => {
        setEditingId(cmd.id);
        setEditValue(cmd.phrase);
    };

    const handleSaveEdit = (id: string) => {
        if (editValue.trim()) {
            updateCommand(id, editValue.trim());
            setEditingId(null);
        }
    };

    const handleAdd = () => {
        if (newPhrase.trim() && newAction) {
            addCommand(newPhrase.trim(), newAction);
            setNewPhrase('');
            setNewAction('');
            setShowAddCommand(false);
        }
    };

    return (
        <div className="h-screen flex flex-col bg-transparent overflow-hidden">
            <header className="app-top-bar">
                <div className="app-top-bar__inner flex items-center justify-center px-4">
                    <div className="text-center">
                        <h1 className="app-top-bar__title text-2xl font-kufi">التحكم الصوتي</h1>
                        <p className="app-top-bar__subtitle">إدارة الأوامر الصوتية الذكية</p>
                    </div>
                </div>
            </header>

            <main className="w-full flex-1 flex flex-col items-center overflow-hidden p-4 pb-24">
                <div className="w-full max-w-lg flex-1 overflow-y-auto hide-scrollbar pb-6 space-y-6">
                    {/* Status Section */}
                    <div className="themed-card p-6 flex flex-col items-center justify-center space-y-4">
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsEnabled(!isEnabled)}
                            className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all ${isEnabled && isListening ? 'animate-pulse' : ''}`}
                            style={{ 
                                backgroundColor: isEnabled ? (isListening ? '#ef4444' : '#10b981') : '#9ca3af',
                                color: '#ffffff'
                            }}
                        >
                            {isEnabled ? <Mic className="w-12 h-12" /> : <MicOff className="w-12 h-12" />}
                        </motion.button>
                        <div className="text-center">
                            <p className="text-lg font-bold">
                                {isEnabled ? (isListening ? 'جاري الاستماع...' : 'التحكم الصوتي مفعل') : 'التحكم الصوتي معطل'}
                            </p>
                            <p className="text-xs opacity-60 mt-1">
                                {isEnabled ? 'يمكنك التحدث بالأوامر من أي مكان في التطبيق' : 'اضغط على الزر لتفعيل الاستماع الدائم'}
                            </p>
                        </div>
                        
                        {transcript && isListening && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 rounded-2xl bg-black/5 w-full text-center italic font-bold text-lg border border-black/5"
                            >
                                "{transcript}"
                            </motion.div>
                        )}
                    </div>

                    {/* Commands List Header */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="font-bold text-lg opacity-80">إدارة الأوامر</h3>
                            <div className="flex gap-2">
                                <button 
                                    onClick={resetToDefaults}
                                    className="p-2 rounded-full hover:bg-black/5 transition-colors"
                                    title="إعادة ضبط المصنع"
                                >
                                    <RotateCcw className="w-5 h-5 opacity-60" />
                                </button>
                                <button 
                                    onClick={() => setShowAddCommand(!showAddCommand)}
                                    className="text-sm font-bold px-4 py-2 rounded-full flex items-center gap-2 shadow-md transition-all active:scale-95"
                                    style={{ backgroundColor: theme.palette[0], color: '#ffffff' }}
                                >
                                    <Plus className="w-4 h-4" />
                                    {showAddCommand ? 'إلغاء' : 'إضافة أمر'}
                                </button>
                            </div>
                        </div>

                        {showAddCommand && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                className="p-5 rounded-2xl themed-card space-y-4 border-2"
                                style={{ borderColor: theme.palette[0] + '40' }}
                            >
                                <div>
                                    <label className="text-xs font-bold block mb-2 opacity-70">العبارة الصوتية:</label>
                                    <input 
                                        type="text" 
                                        value={newPhrase}
                                        onChange={e => setNewPhrase(e.target.value)}
                                        placeholder="مثلاً: افتح المصحف"
                                        className="w-full p-3 rounded-xl border bg-black/5 text-base outline-none focus:ring-2"
                                        style={{ borderColor: theme.barBorder, ringColor: theme.palette[0] }}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold block mb-2 opacity-70">الإجراء:</label>
                                    <select 
                                        value={newAction}
                                        onChange={e => setNewAction(e.target.value)}
                                        className="w-full p-3 rounded-xl border bg-black/5 text-base outline-none"
                                        style={{ borderColor: theme.barBorder }}
                                    >
                                        <option value="">اختر الإجراء...</option>
                                        {AVAILABLE_ACTIONS.map(action => (
                                            <option key={action.id} value={action.id}>{action.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <button 
                                    onClick={handleAdd}
                                    disabled={!newPhrase.trim() || !newAction}
                                    className="w-full py-3 rounded-xl font-bold text-base shadow-lg disabled:opacity-50 transition-all active:scale-95"
                                    style={{ backgroundColor: theme.palette[0], color: '#ffffff' }}
                                >
                                    حفظ الأمر الجديد
                                </button>
                            </motion.div>
                        )}

                        <div className="space-y-3">
                            {commands.map((cmd) => (
                                <div key={cmd.id} className="flex items-center justify-between p-4 rounded-2xl themed-card border border-black/5 shadow-sm">
                                    <div className="flex-1 mr-2">
                                        {editingId === cmd.id ? (
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="text"
                                                    value={editValue}
                                                    onChange={e => setEditValue(e.target.value)}
                                                    className="flex-1 p-2 rounded-lg border bg-white text-base text-black outline-none"
                                                    autoFocus
                                                />
                                                <button onClick={() => handleSaveEdit(cmd.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-full"><Check className="w-5 h-5" /></button>
                                                <button onClick={() => setEditingId(null)} className="p-2 text-red-600 hover:bg-red-50 rounded-full"><X className="w-5 h-5" /></button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col">
                                                <span className="text-lg font-bold">"{cmd.phrase}"</span>
                                                <span className="text-xs opacity-60 font-medium">
                                                    {AVAILABLE_ACTIONS.find(a => a.id === cmd.action)?.name || cmd.action}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => handleEdit(cmd)} className="p-2 opacity-60 hover:opacity-100 hover:bg-black/5 rounded-full transition-all">
                                            <Edit2 className="w-5 h-5" />
                                        </button>
                                        {!cmd.isDefault && (
                                            <button onClick={() => deleteCommand(cmd.id)} className="p-2 text-red-500 opacity-60 hover:opacity-100 hover:bg-red-50 rounded-full transition-all">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Help Section */}
                    <div className="p-5 rounded-2xl bg-indigo-500/10 border-2 border-indigo-500/20">
                        <h4 className="text-sm font-bold text-indigo-500 mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                            أمثلة للأوامر الذكية:
                        </h4>
                        <ul className="text-xs space-y-2 opacity-80 list-disc list-inside font-medium">
                            <li>"اذهب إلى سورة الكهف"</li>
                            <li>"اذهب إلى صفحة مئة"</li>
                            <li>"اذهب إلى الجزء الثلاثين"</li>
                            <li>"افتح الأذكار"</li>
                            <li>"الصفحة التالية" / "الصفحة السابقة"</li>
                        </ul>
                    </div>
                </div>
            </main>

            <BottomBar onHomeClick={onBack} onThemesClick={() => {}} showThemes={false} />
        </div>
    );
};

export default VoiceControlPage;
