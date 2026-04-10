import React from 'react';
import { FONTS, THEMES } from './constants';
import { Type, Palette, Highlighter, Save, X, Languages, ChevronDown, Check } from 'lucide-react';

interface AyahContextMenuProps {
    isOpen: boolean;
    tempSettings: any;
    ayahContextColorField: 'textColor' | 'bgColor' | 'highlightTextColor' | null;
    setAyahContextColorField: (field: 'textColor' | 'bgColor' | 'highlightTextColor' | null) => void;
    setAyahContextMenu: React.Dispatch<React.SetStateAction<any>>;
    onTempSettingsChange?: (newSettings: any) => void;
    onCancel?: () => void;
    renderCheckerboard: (color: string) => React.CSSProperties;
    PREDEFINED_COLORS: string[];
    openModal: (modalId: string) => void;
    onSave: () => void;
    onTranslation: () => void;
    currentTheme: any;
}

const AyahContextMenu: React.FC<AyahContextMenuProps> = ({
    isOpen,
    tempSettings,
    ayahContextColorField,
    setAyahContextColorField,
    setAyahContextMenu,
    onTempSettingsChange,
    onCancel,
    renderCheckerboard,
    PREDEFINED_COLORS,
    openModal,
    onSave,
    onTranslation,
    currentTheme
}) => {
    if (!isOpen) return null;

    const iconColor = currentTheme.accent || '#000000';

    return (
        <div className="fixed inset-0 z-[1100] bg-black/30 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn" onClick={() => {
            if (onCancel) onCancel();
            setAyahContextMenu((p: any) => ({...p, isOpen: false}));
        }}>
            <div 
                className="w-full max-w-[320px] bg-white rounded-2xl shadow-2xl transition-all duration-300 flex flex-col pointer-events-auto overflow-hidden animate-modal-enter" 
                style={{ 
                    fontFamily: currentTheme.font,
                    border: `2px solid ${currentTheme.barBorder || currentTheme.accent || '#000000'}`
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-2">
                        <Palette size={18} style={{ color: iconColor }} />
                        <span className="font-bold text-sm text-gray-800">تخصيص المظهر</span>
                    </div>
                    <button onClick={() => {
                        if (onCancel) onCancel();
                        setAyahContextMenu((p: any) => ({...p, isOpen: false}));
                    }} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto max-h-[70vh] custom-scrollbar space-y-5">
                    {/* Colors Section */}
                    <div className="space-y-3">
                        <div className="bg-blue-50/50 py-1.5 px-3 rounded-md text-right">
                            <span className="text-xs font-bold text-gray-700">الألوان</span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { id: 'textColor', label: 'النص', icon: <Type size={14} /> },
                                { id: 'bgColor', label: 'الخلفية', icon: <Palette size={14} /> },
                                { id: 'highlightTextColor', label: 'التحديد', icon: <Highlighter size={14} /> }
                            ].map(field => (
                                <div key={field.id} className="flex flex-col gap-1.5">
                                    <button 
                                        onClick={() => setAyahContextColorField(ayahContextColorField === field.id ? null : field.id as any)}
                                        className={`h-12 w-full rounded-xl border-2 shadow-sm transition-all relative overflow-hidden flex items-center justify-center ${ayahContextColorField === field.id ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-gray-200 hover:border-gray-300'}`}
                                        style={renderCheckerboard(tempSettings[field.id] || (field.id === 'highlightTextColor' ? THEMES['olive'].highlightText : ''))}
                                    >
                                        {ayahContextColorField === field.id && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                                                <Check size={16} className="text-white drop-shadow-md" />
                                            </div>
                                        )}
                                    </button>
                                    <span className="text-[10px] font-bold text-gray-500 text-center">{field.label}</span>
                                </div>
                            ))}
                        </div>

                        {ayahContextColorField && (
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 animate-fadeIn">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-bold text-gray-600">
                                        اختر لون {ayahContextColorField === 'bgColor' ? 'الخلفية' : ayahContextColorField === 'textColor' ? 'النص' : 'التحديد'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-6 gap-1.5">
                                    {PREDEFINED_COLORS.map(c => (
                                        <button
                                            key={c}
                                            onClick={() => {
                                                const newTempSettings = { ...tempSettings, [ayahContextColorField!]: c };
                                                setAyahContextMenu((prev: any) => ({
                                                    ...prev,
                                                    tempSettings: newTempSettings
                                                }));
                                                if (onTempSettingsChange) {
                                                    onTempSettingsChange(newTempSettings);
                                                }
                                            }}
                                            className={`h-7 rounded-lg border transition-all hover:scale-110 relative ${tempSettings[ayahContextColorField!] === c ? 'ring-2 ring-emerald-500 ring-offset-1' : 'border-gray-200'}`}
                                            style={renderCheckerboard(c)}
                                        >
                                            {tempSettings[ayahContextColorField!] === c && <Check size={10} className="absolute inset-0 m-auto text-white drop-shadow-sm" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Fonts Section */}
                    <div className="space-y-3">
                        <div className="bg-blue-50/50 py-1.5 px-3 rounded-md text-right">
                            <span className="text-xs font-bold text-gray-700">نوع الخط</span>
                        </div>
                        
                        <button 
                            onClick={() => openModal('ayah-font-modal')}
                            className="w-full p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors flex justify-between items-center group"
                        >
                            <div className="flex items-center gap-3">
                                <Type size={18} style={{ color: iconColor }} />
                                <span className="text-sm font-bold text-gray-800" style={{ fontFamily: tempSettings.fontFamily }}>
                                    {FONTS.find(f => f.id === tempSettings.fontFamily)?.name || 'اختر الخط'}
                                </span>
                            </div>
                            <ChevronDown size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                        </button>
                    </div>

                    {/* Actions Section */}
                    <div className="space-y-2 pt-2">
                        <button 
                            onClick={onTranslation}
                            className="w-full py-3 rounded-xl bg-blue-50 text-blue-700 text-sm font-bold hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 border border-blue-100"
                        >
                            <Languages size={18} />
                            <span>عرض الترجمة</span>
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50/80 flex gap-3">
                    <button 
                        onClick={() => {
                            if (onCancel) onCancel();
                            setAyahContextMenu((p: any) => ({...p, isOpen: false}));
                        }}
                        className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold text-sm active:scale-95 transition-all"
                    >
                        إلغاء
                    </button>
                    <button 
                        onClick={onSave}
                        className="flex-[2] py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <Save size={18} />
                        <span>حفظ التغييرات</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AyahContextMenu;
