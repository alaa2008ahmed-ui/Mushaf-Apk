import React from 'react';
import { FONTS, THEMES } from './constants';

interface AyahContextMenuProps {
    isOpen: boolean;
    tempSettings: any;
    ayahContextColorField: 'textColor' | 'bgColor' | 'highlightTextColor' | null;
    setAyahContextColorField: (field: 'textColor' | 'bgColor' | 'highlightTextColor' | null) => void;
    setAyahContextMenu: React.Dispatch<React.SetStateAction<any>>;
    renderCheckerboard: (color: string) => React.CSSProperties;
    PREDEFINED_COLORS: string[];
    openModal: (modalId: string) => void;
    onSave: () => void;
}

const AyahContextMenu: React.FC<AyahContextMenuProps> = ({
    isOpen,
    tempSettings,
    ayahContextColorField,
    setAyahContextColorField,
    setAyahContextMenu,
    renderCheckerboard,
    PREDEFINED_COLORS,
    openModal,
    onSave
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-black/30 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn" onClick={() => setAyahContextMenu((p: any) => ({...p, isOpen: false}))}>
            <div 
                className="ayah-context-menu modal-skinned w-full max-w-sm rounded-2xl shadow-2xl flex flex-col max-h-[85vh] animate-modal-enter" 
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 flex justify-between items-center h-14 flex-none theme-header-bg rounded-t-2xl">
                    <h2 className="text-xl font-bold">تخصيص الآية</h2>
                    <button onClick={() => setAyahContextMenu((p: any) => ({...p, isOpen: false}))} className="hover:opacity-80 rounded-full bg-white/20 w-9 h-9 flex items-center justify-center text-lg">✕</button>
                </div>
                
                <div className="p-5 overflow-y-auto flex-1 space-y-6">
                    {/* Colors Section */}
                    <div className="grid grid-cols-3 gap-5 border-b pb-6 border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col">
                            <label className="text-sm font-bold opacity-80 mb-2 text-center">لون النص</label>
                            <div 
                                className={`h-12 w-full rounded-xl border shadow-sm cursor-pointer ${ayahContextColorField === 'textColor' ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-300'}`}
                                style={renderCheckerboard(tempSettings.textColor)}
                                onClick={() => setAyahContextColorField(ayahContextColorField === 'textColor' ? null : 'textColor')}
                            ></div>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-bold opacity-80 mb-2 text-center">لون الخلفية</label>
                            <div 
                                className={`h-12 w-full rounded-xl border shadow-sm cursor-pointer ${ayahContextColorField === 'bgColor' ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-300'}`}
                                style={renderCheckerboard(tempSettings.bgColor)}
                                onClick={() => setAyahContextColorField(ayahContextColorField === 'bgColor' ? null : 'bgColor')}
                            ></div>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-bold opacity-80 mb-2 text-center">لون التحديد</label>
                            <div 
                                className={`h-12 w-full rounded-xl border shadow-sm cursor-pointer ${ayahContextColorField === 'highlightTextColor' ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-300'}`}
                                style={renderCheckerboard(tempSettings.highlightTextColor || THEMES['olive'].highlightText)}
                                onClick={() => setAyahContextColorField(ayahContextColorField === 'highlightTextColor' ? null : 'highlightTextColor')}
                            ></div>
                        </div>
                        
                        {ayahContextColorField && (
                            <div className="col-span-3 bg-gray-50 dark:bg-gray-800/80 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 mt-1 animate-fadeIn">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                        اختر لون {ayahContextColorField === 'bgColor' ? 'الخلفية' : ayahContextColorField === 'textColor' ? 'النص' : 'التحديد'}
                                    </span>
                                    <button onClick={() => setAyahContextColorField(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                        <i className="fa-solid fa-times text-sm"></i>
                                    </button>
                                </div>
                                <div className="grid grid-cols-8 gap-2">
                                    {PREDEFINED_COLORS.map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setAyahContextMenu((prev: any) => ({
                                                ...prev,
                                                tempSettings: { ...prev.tempSettings, [ayahContextColorField!]: c }
                                            }))}
                                            className={`h-8 rounded border shadow-sm transition-transform hover:scale-110 ${tempSettings[ayahContextColorField!] === c ? 'ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-gray-800' : 'border-gray-200 dark:border-gray-600'}`}
                                            style={renderCheckerboard(c)}
                                            title={c}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Fonts Section - Modal Trigger */}
                    <div className="flex items-center justify-between gap-5">
                        <label className="text-base font-bold opacity-80 whitespace-nowrap">نوع الخط:</label>
                        <button 
                            onClick={() => openModal('ayah-font-modal')}
                            className="flex-1 p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-base font-bold outline-none focus:ring-2 focus:ring-indigo-500 text-right flex justify-between items-center"
                            style={{ fontFamily: tempSettings.fontFamily }}
                        >
                            <span>{FONTS.find(f => f.id === tempSettings.fontFamily)?.name || 'اختر الخط'}</span>
                            <i className="fa-solid fa-chevron-down text-xs opacity-50"></i>
                        </button>
                    </div>

                    {/* Save and Close Button */}
                    <div className="pt-4">
                        <button 
                            onClick={onSave}
                            className="w-full py-4 rounded-2xl bg-emerald-600 text-white text-base font-bold shadow-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-3"
                        >
                            <i className="fa-solid fa-save text-lg"></i>
                            <span>حفظ وإغلاق</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AyahContextMenu;
