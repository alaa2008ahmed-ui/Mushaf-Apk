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
        <div className="fixed inset-0 z-[100] bg-black/30 flex justify-center pt-10 px-4 animate-fadeIn backdrop-blur-sm" onClick={onClose}>
            <div className={`modal-skinned w-full ${isLandscape ? 'max-w-4xl' : 'max-w-2xl'} rounded-t-2xl flex flex-col max-h-[85vh]`} onClick={e => e.stopPropagation()}>
                <div className="p-4 theme-header-bg rounded-t-2xl flex justify-between items-center">
                    <h3 className="font-bold text-lg">
                        الإشارات المرجعية
                    </h3>
                    <button onClick={onClose} className="text-2xl">&times;</button>
                </div>
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
            </div>
        </div>
    );
};

export default BookmarksModal;
