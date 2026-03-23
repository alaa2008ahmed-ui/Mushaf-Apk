import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useVoiceControl, VoiceCommand } from '../../context/VoiceControlContext';
import { Mic, MicOff, Trash2, Edit2, Check, X, Plus, RotateCcw } from 'lucide-react';

interface VoiceControlModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentTheme: any;
}

const VoiceControlModal: React.FC<VoiceControlModalProps> = ({
    isOpen,
    onClose,
    currentTheme
}) => {
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                style={{ backgroundColor: currentTheme.modalBg, color: currentTheme.modalText }}
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: currentTheme.barBorder }}>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Mic className="text-indigo-500 w-6 h-6" />
                        التحكم الصوتي
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-black/10 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Status Section */}
                    <div className="flex flex-col items-center justify-center py-4 space-y-4">
                        <button 
                            onClick={() => setIsEnabled(!isEnabled)}
                            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all ${isEnabled && isListening ? 'animate-pulse scale-105' : 'hover:scale-105'}`}
                            style={{ 
                                backgroundColor: isEnabled ? (isListening ? '#ef4444' : '#10b981') : '#9ca3af',
                                color: '#ffffff'
                            }}
                        >
                            {isEnabled ? <Mic className="w-10 h-10" /> : <MicOff className="w-10 h-10" />}
                        </button>
                        <div className="text-center">
                            <p className="text-sm font-bold">
                                {isEnabled ? (isListening ? 'جاري الاستماع...' : 'التحكم الصوتي مفعل') : 'التحكم الصوتي معطل'}
                            </p>
                            <p className="text-[10px] opacity-60 mt-1">
                                {isEnabled ? 'يمكنك التحدث بالأوامر من أي مكان في التطبيق' : 'اضغط على الزر لتفعيل الاستماع الدائم'}
                            </p>
                        </div>
                        
                        {transcript && isListening && (
                            <div className="p-4 rounded-2xl bg-black/5 w-full text-center italic font-bold text-sm">
                                "{transcript}"
                            </div>
                        )}
                    </div>

                    {/* Commands List */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-sm opacity-80">إدارة الأوامر</h3>
                            <div className="flex gap-2">
                                <button 
                                    onClick={resetToDefaults}
                                    className="p-2 rounded-full hover:bg-black/5"
                                    title="إعادة ضبط المصنع"
                                >
                                    <RotateCcw className="w-4 h-4 opacity-60" />
                                </button>
                                <button 
                                    onClick={() => setShowAddCommand(!showAddCommand)}
                                    className="text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"
                                    style={{ backgroundColor: currentTheme.accent, color: currentTheme.accentText }}
                                >
                                    <Plus className="w-3 h-3" />
                                    {showAddCommand ? 'إلغاء' : 'إضافة'}
                                </button>
                            </div>
                        </div>

                        {showAddCommand && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                className="p-4 rounded-2xl border space-y-3 bg-black/5"
                                style={{ borderColor: currentTheme.barBorder }}
                            >
                                <div>
                                    <label className="text-[10px] font-bold block mb-1">العبارة الصوتية:</label>
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
                                    <label className="text-[10px] font-bold block mb-1">الإجراء:</label>
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
                                    onClick={handleAdd}
                                    disabled={!newPhrase.trim() || !newAction}
                                    className="w-full py-2 rounded-xl font-bold text-sm disabled:opacity-50"
                                    style={{ backgroundColor: currentTheme.accent, color: currentTheme.accentText }}
                                >
                                    حفظ الأمر الجديد
                                </button>
                            </motion.div>
                        )}

                        <div className="space-y-2">
                            {commands.map((cmd) => (
                                <div key={cmd.id} className="flex items-center justify-between p-3 rounded-xl border bg-black/5" style={{ borderColor: currentTheme.barBorder }}>
                                    <div className="flex-1 mr-2">
                                        {editingId === cmd.id ? (
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="text"
                                                    value={editValue}
                                                    onChange={e => setEditValue(e.target.value)}
                                                    className="flex-1 p-1 rounded border bg-white text-sm text-black"
                                                    autoFocus
                                                />
                                                <button onClick={() => handleSaveEdit(cmd.id)} className="text-green-600"><Check className="w-4 h-4" /></button>
                                                <button onClick={() => setEditingId(null)} className="text-red-600"><X className="w-4 h-4" /></button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold">"{cmd.phrase}"</span>
                                                <span className="text-[10px] opacity-60">
                                                    {AVAILABLE_ACTIONS.find(a => a.id === cmd.action)?.name || cmd.action}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => handleEdit(cmd)} className="p-2 opacity-60 hover:opacity-100">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        {!cmd.isDefault && (
                                            <button onClick={() => deleteCommand(cmd.id)} className="p-2 text-red-500 opacity-60 hover:opacity-100">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Help Section */}
                    <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                        <h4 className="text-xs font-bold text-indigo-500 mb-2">أمثلة للأوامر الذكية:</h4>
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
