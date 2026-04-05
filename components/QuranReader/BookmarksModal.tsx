import React from 'react';
import { toArabic } from './constants';

interface BookmarksModalProps {
    bookmarks: any[];
    quranData: any;
    onSelect: (surah: number, ayah: number, isLandscape: boolean) => void;
    onDelete: (id: number) => void;
    onClose: () => void;
    isLandscape?: boolean;
}

const BookmarksModal: React.FC<BookmarksModalProps> = ({ bookmarks, quranData, onSelect, onDelete, onClose, isLandscape }) => {
    return (
        <div className="fixed inset-0 z-[100] bg-transparent flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
            <div className={`modal-skinned w-full ${isLandscape ? 'max-w-4xl' : 'max-w-2xl'} rounded-2xl flex flex-col max-h-[90vh] shadow-2xl border border-gray-200 dark:border-gray-700`} onClick={e => e.stopPropagation()}>
                <div className="overflow-y-auto p-4 flex-1 flex flex-col gap-3">
                    {bookmarks.length === 0 ? (
                        <div className="col-span-full text-center p-4 font-bold">لا توجد إشارات مرجعية محفوظة</div>
                    ) : (
                        bookmarks.map(b => {
                            const surahName = quranData?.surahs[b.s - 1]?.name.replace('سورة','').trim() || '';
                            return (
                                <div key={b.id} className={`w-full flex flex-col justify-between p-3 rounded-lg border transition themed-card-bg`}>
                                    <div className="flex-grow cursor-pointer" onClick={() => { onSelect(b.s, b.a, !!b.isLandscape); onClose(); }}>
                                        <div className="font-bold text-lg" style={{ fontFamily: 'var(--font-amiri)' }}>
                                            {surahName} - آية {toArabic(b.a)}
                                        </div>
                                        <div className="flex justify-between items-center mt-1">
                                            <div className="text-xs font-bold opacity-70">{b.date} | {b.time}</div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end mt-2">
                                        <button onClick={() => onDelete(b.id)} className="text-red-500 hover:text-red-700 p-1 text-lg">
                                            <i className="fa-solid fa-trash-alt"></i>
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
                <div className="p-3 border-t themed-card-bg rounded-b-2xl">
                    <button onClick={onClose} className="w-full py-2 rounded-xl font-bold theme-btn-bg">إغلاق</button>
                </div>
            </div>
        </div>
    );
};

export default BookmarksModal;
