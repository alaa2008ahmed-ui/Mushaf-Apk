import React, { useState, useRef } from 'react';
import { READERS, TAFSEERS, JUZ_MAP } from './constants';

interface DownloadModalProps {
    onClose: () => void;
    quranData: any;
    showToast: (msg: string) => void;
    isLandscape?: boolean;
}

// --- Helper Functions ---

const getAyahsForJuz = (juzNumber: number, quranData: any) => {
    const ayahsToDownload: {surah: number, ayah: number}[] = [];
    const startJuz = JUZ_MAP[juzNumber - 1];
    const endJuz = juzNumber < 30 ? JUZ_MAP[juzNumber] : null;

    let currentSurah = startJuz.s;
    let currentAyah = startJuz.a;

    while (true) {
        if (endJuz && currentSurah === endJuz.s && currentAyah === endJuz.a) {
            break;
        }
        
        ayahsToDownload.push({surah: currentSurah, ayah: currentAyah});
        
        const surahData = quranData.surahs.find((s: any) => s.number === currentSurah);
        if (!surahData) break;
        
        if (currentAyah < surahData.ayahs.length) {
            currentAyah++;
        } else {
            currentSurah++;
            currentAyah = 1;
            if (currentSurah > 114) break;
        }
    }
    return ayahsToDownload;
};

const checkSurahDownloaded = async (readerId: string, surahNumber: number, quranData: any) => {
    try {
        const downloadedFiles = JSON.parse(localStorage.getItem('downloaded_audio_files') || '[]');
        if (downloadedFiles.length === 0) return false;
        
        const surah = quranData.surahs.find((s: any) => s.number === surahNumber);
        if (!surah) return false;
        
        for (let i = 1; i <= surah.ayahs.length; i++) {
            const fileName = `${readerId}_${surahNumber}_${i}.mp3`;
            const exists = downloadedFiles.some((file: any) => file.fileName === fileName);
            if (!exists) return false;
        }
        return true;
    } catch (e) {
        console.error('Error checking surah download:', e);
        return false;
    }
};

const checkAllQuranDownloaded = async (readerId: string, quranData: any) => {
    try {
        const downloadedFiles = JSON.parse(localStorage.getItem('downloaded_audio_files') || '[]');
        if (downloadedFiles.length === 0) return false;
        
        for (const surah of quranData.surahs) {
            for (let i = 1; i <= surah.ayahs.length; i++) {
                const fileName = `${readerId}_${surah.number}_${i}.mp3`;
                const exists = downloadedFiles.some((file: any) => file.fileName === fileName);
                if (!exists) return false;
            }
        }
        return true;
    } catch (e) {
        console.error('Error checking all quran download:', e);
        return false;
    }
};

const storeAudioOffline = (fileName: string, blob: Blob) => {
    try {
        const downloadedFiles = JSON.parse(localStorage.getItem('downloaded_audio_files') || '[]');
        const fileRecord = {
            fileName: fileName,
            timestamp: Date.now(),
            size: blob.size
        };
        
        const existingIndex = downloadedFiles.findIndex((file: any) => file.fileName === fileName);
        if(existingIndex !== -1) {
            downloadedFiles[existingIndex] = fileRecord;
        } else {
            downloadedFiles.push(fileRecord);
        }
        
        localStorage.setItem('downloaded_audio_files', JSON.stringify(downloadedFiles));
    } catch (e) {
        console.error('Error storing audio offline record:', e);
    }
};

const checkTafsirDownloaded = async (tafsirId: string, surahNumber: number) => {
    try {
        const downloadedTafsir = JSON.parse(localStorage.getItem('downloaded_tafsir_files') || '[]');
        if (downloadedTafsir.length === 0) return false;
        
        const fileName = `${tafsirId}_${surahNumber}_tafsir.json`;
        return downloadedTafsir.some((file: any) => file.fileName === fileName);
    } catch (e) {
        console.error('Error checking tafsir download:', e);
        return false;
    }
};

const checkAllTafsirDownloaded = async (tafsirId: string, quranData: any) => {
    try {
        const downloadedTafsir = JSON.parse(localStorage.getItem('downloaded_tafsir_files') || '[]');
        if (downloadedTafsir.length === 0) return false;
        
        for (const surah of quranData.surahs) {
            const fileName = `${tafsirId}_${surah.number}_tafsir.json`;
            const exists = downloadedTafsir.some((file: any) => file.fileName === fileName);
            if (!exists) return false;
        }
        return true;
    } catch (e) {
        console.error('Error checking all tafsir download:', e);
        return false;
    }
};

const storeTafsirOffline = (fileName: string, data: any) => {
    try {
        const downloadedTafsir = JSON.parse(localStorage.getItem('downloaded_tafsir_files') || '[]');
        const fileRecord = {
            fileName: fileName,
            data: data, // Storing full data in localStorage might hit limits, but per requirements
            timestamp: Date.now()
        };
        
        const existingIndex = downloadedTafsir.findIndex((file: any) => file.fileName === fileName);
        if(existingIndex !== -1) {
            downloadedTafsir[existingIndex] = fileRecord;
        } else {
            downloadedTafsir.push(fileRecord);
        }
        
        localStorage.setItem('downloaded_tafsir_files', JSON.stringify(downloadedTafsir));
        // Also store the actual content in a separate key to avoid massive single JSON
        localStorage.setItem(`tafsir_content_${fileName}`, JSON.stringify(data));
    } catch (e) {
        console.error('Error storing tafsir offline:', e);
    }
};

export const QuranDownloadModal: React.FC<DownloadModalProps> = ({ onClose, quranData, showToast, isLandscape }) => {
    const [selectedReader, setSelectedReader] = useState('');
    const [selectedSurahs, setSelectedSurahs] = useState<string[]>([]);
    const [selectedJuzs, setSelectedJuzs] = useState<string[]>([]);
    const [isDownloading, setIsDownloading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('');
    const abortControllerRef = useRef<AbortController | null>(null);

    const toggleSurah = (surahNum: string) => {
        if (surahNum === 'all') {
            if (selectedSurahs.includes('all')) {
                setSelectedSurahs([]);
            } else {
                setSelectedSurahs(['all']);
                setSelectedJuzs([]);
            }
            return;
        }
        
        let newSelection = [...selectedSurahs];
        if (newSelection.includes('all')) newSelection = newSelection.filter(s => s !== 'all');
        
        if (newSelection.includes(surahNum)) {
            newSelection = newSelection.filter(s => s !== surahNum);
        } else {
            newSelection.push(surahNum);
        }
        setSelectedSurahs(newSelection);
    };

    const toggleJuz = (juzNum: string) => {
        let newSelection = [...selectedJuzs];
        if (selectedSurahs.includes('all')) setSelectedSurahs(selectedSurahs.filter(s => s !== 'all'));
        
        if (newSelection.includes(juzNum)) {
            newSelection = newSelection.filter(j => j !== juzNum);
        } else {
            newSelection.push(juzNum);
        }
        setSelectedJuzs(newSelection);
    };

    const downloadSelected = async () => {
        if (!selectedReader || (selectedSurahs.length === 0 && selectedJuzs.length === 0)) return;
        
        setIsDownloading(true);
        setStatus('جاري التحضير للتحميل...');
        setProgress(0);
        abortControllerRef.current = new AbortController();

        try {
            if (selectedSurahs.includes('all')) {
                const allDownloaded = await checkAllQuranDownloaded(selectedReader, quranData);
                if (allDownloaded) {
                    showToast("[صوتي] المصحف الكريم تم تحميله مسبقاً");
                    setIsDownloading(false);
                    return;
                }
                await downloadEntireQuran(selectedReader);
            } else {
                const ayahsToDownload = new Set<string>();
                
                for (const surahNumStr of selectedSurahs) {
                    const surahNum = parseInt(surahNumStr);
                    const surah = quranData.surahs.find((s: any) => s.number === surahNum);
                    if (surah) {
                        for (let i = 1; i <= surah.ayahs.length; i++) {
                            ayahsToDownload.add(`${surahNum}_${i}`);
                        }
                    }
                }
                
                for (const juzNumStr of selectedJuzs) {
                    const juzNum = parseInt(juzNumStr);
                    const ayahs = getAyahsForJuz(juzNum, quranData);
                    for (const a of ayahs) {
                        ayahsToDownload.add(`${a.surah}_${a.ayah}`);
                    }
                }
                
                const ayahsList = Array.from(ayahsToDownload).map(s => {
                    const [surah, ayah] = s.split('_').map(Number);
                    return { surah, ayah };
                });
                
                ayahsList.sort((a, b) => {
                    if (a.surah !== b.surah) return a.surah - b.surah;
                    return a.ayah - b.ayah;
                });
                
                let downloaded = 0;
                const totalAyahs = ayahsList.length;
                
                for (const item of ayahsList) {
                    if (abortControllerRef.current?.signal.aborted) throw new Error('Aborted');
                    await downloadAyah(selectedReader, item.surah, item.ayah);
                    downloaded++;
                    setProgress((downloaded / totalAyahs) * 100);
                    setStatus(`جاري التحميل - ${Math.round((downloaded / totalAyahs) * 100)}%`);
                }
            }
            setStatus('تم التحميل بنجاح!');
            setProgress(100);
            showToast('تم التحميل بنجاح!');
        } catch (error: any) {
            if (error.name === 'AbortError') {
                setStatus('تم إيقاف التحميل');
                showToast('تم إيقاف التحميل');
            } else {
                setStatus(`خطأ: ${error.message}`);
                showToast(`خطأ: ${error.message}`);
            }
        } finally {
            setIsDownloading(false);
            abortControllerRef.current = null;
        }
    };

    const stopDownload = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    };

    const downloadSpecificSurah = async (readerId: string, surahNumber: number) => {
        const surah = quranData.surahs.find((s: any) => s.number === surahNumber);
        if (!surah) throw new Error('Surah not found');

        const totalAyahs = surah.ayahs.length;
        for (let i = 1; i <= totalAyahs; i++) {
            if (abortControllerRef.current?.signal.aborted) throw new Error('Aborted');
            
            await downloadAyah(readerId, surahNumber, i);
            setProgress((i / totalAyahs) * 100);
            setStatus(`جاري تحميل سورة ${surah.name} - آية ${i}/${totalAyahs}`);
        }
    };

    const downloadEntireQuran = async (readerId: string) => {
        let totalAyahs = 6236; // Approx
        let downloaded = 0;
        
        for (const surah of quranData.surahs) {
            for (let i = 1; i <= surah.ayahs.length; i++) {
                if (abortControllerRef.current?.signal.aborted) throw new Error('Aborted');
                await downloadAyah(readerId, surah.number, i);
                downloaded++;
                setProgress((downloaded / totalAyahs) * 100);
                setStatus(`جاري تحميل المصحف كاملاً - ${Math.round((downloaded / totalAyahs) * 100)}%`);
            }
        }
    };

    const downloadAyah = async (readerId: string, surah: number, ayah: number) => {
        const surahStr = String(surah).padStart(3, '0');
        const ayahStr = String(ayah).padStart(3, '0');
        const url = `https://everyayah.com/data/${readerId}/${surahStr}${ayahStr}.mp3`;
        const fileName = `${readerId}_${surah}_${ayah}.mp3`;
        
        try {
            const cache = await caches.open('quran-audio-cache');
            const match = await cache.match(url);
            if (match) {
                // Even if cached, ensure metadata exists
                storeAudioOffline(fileName, await match.blob());
                return;
            }

            const response = await fetch(url, { signal: abortControllerRef.current?.signal });
            if (!response.ok) throw new Error('Network response was not ok');
            
            const blob = await response.blob();
            await cache.put(url, new Response(blob));
            storeAudioOffline(fileName, blob);
            
        } catch (e) {
            console.error(e);
            if ((e as Error).name === 'AbortError') throw e;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[155] flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
            <div className={`modal-skinned w-full ${isLandscape ? 'max-w-4xl' : 'max-w-md'} rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]`} onClick={e => e.stopPropagation()}>
                <div className="p-3 flex justify-between items-center h-12 flex-none theme-header-bg">
                    <h2 className="text-lg font-bold">تحميل القرآن الكريم</h2>
                    <button onClick={onClose} className="hover:opacity-80 rounded-full bg-white/20 w-8 h-8 flex items-center justify-center">✕</button>
                </div>
                <div className="p-3 space-y-4 overflow-y-auto text-center flex-1">
                    <div className="space-y-4">
                        <div className="text-right">
                            <label className="text-xs font-bold opacity-70 block mb-2">اختر القارئ</label>
                            <div className={`grid ${isLandscape ? 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3'} gap-2 ${isLandscape ? 'max-h-40' : 'max-h-60'} overflow-y-auto p-2 border rounded-lg themed-card-bg custom-scrollbar`} dir="rtl">
                                {READERS.map(r => (
                                    <button 
                                        key={r.id}
                                        onClick={() => setSelectedReader(r.id)}
                                        className={`text-[10px] sm:text-xs p-2 rounded-md border transition-all font-bold ${selectedReader === r.id ? 'theme-btn-bg border-transparent' : 'bg-black/5 border-gray-200 dark:border-gray-700'}`}
                                    >
                                        {r.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="text-right">
                            <label className="text-xs font-bold opacity-70 block mb-2">اختر السور (يمكنك اختيار أكثر من سورة)</label>
                            <div className={`grid ${isLandscape ? 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3'} gap-2 ${isLandscape ? 'max-h-32' : 'max-h-40'} overflow-y-auto p-2 border rounded-lg themed-card-bg custom-scrollbar`} dir="rtl">
                                <button 
                                    onClick={() => toggleSurah('all')}
                                    className={`text-[10px] sm:text-xs p-2 rounded-md border transition-all font-bold ${selectedSurahs.includes('all') ? 'theme-btn-bg border-transparent' : 'bg-black/5 border-gray-200 dark:border-gray-700'}`}
                                >
                                    المصحف كاملاً
                                </button>
                                {quranData?.surahs.map((s: any) => (
                                    <button 
                                        key={s.number}
                                        onClick={() => toggleSurah(s.number.toString())}
                                        className={`text-[10px] sm:text-xs p-2 rounded-md border transition-all font-bold ${selectedSurahs.includes(s.number.toString()) ? 'theme-btn-bg border-transparent' : 'bg-black/5 border-gray-200 dark:border-gray-700'}`}
                                    >
                                        {s.name.replace('سورة', '').trim()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="text-right">
                            <label className="text-xs font-bold opacity-70 block mb-2">اختر الأجزاء (يمكنك اختيار أكثر من جزء)</label>
                            <div className={`grid ${isLandscape ? 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3'} gap-2 ${isLandscape ? 'max-h-32' : 'max-h-40'} overflow-y-auto p-2 border rounded-lg themed-card-bg custom-scrollbar`} dir="rtl">
                                {Array.from({length: 30}, (_, i) => i + 1).map(juzNum => (
                                    <button 
                                        key={juzNum}
                                        onClick={() => toggleJuz(juzNum.toString())}
                                        className={`text-[10px] sm:text-xs p-2 rounded-md border transition-all font-bold ${selectedJuzs.includes(juzNum.toString()) ? 'theme-btn-bg border-transparent' : 'bg-black/5 border-gray-200 dark:border-gray-700'}`}
                                    >
                                        الجزء {juzNum}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        {!isDownloading ? (
                            <button onClick={downloadSelected} disabled={!selectedReader || (selectedSurahs.length === 0 && selectedJuzs.length === 0)} className={`w-full theme-btn-bg py-2.5 rounded-lg shadow font-bold text-sm ${(!selectedReader || (selectedSurahs.length === 0 && selectedJuzs.length === 0)) ? 'opacity-50 cursor-not-allowed' : ''}`}>تحميل</button>
                        ) : (
                            <div className="mt-2">
                                <div className="text-xs font-bold mb-1">{status}</div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-emerald-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                </div>
                                <button onClick={stopDownload} className="w-full mt-2 bg-red-500 text-white py-1.5 rounded-lg shadow hover:bg-red-600 font-bold text-sm">إيقاف التحميل</button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="p-3 text-center flex-none themed-card-bg">
                    <button onClick={onClose} className="theme-accent-btn font-bold py-2 px-8 rounded-lg shadow text-sm w-full">إغلاق</button>
                </div>
            </div>
        </div>
    );
};

export const TafsirDownloadModal: React.FC<DownloadModalProps> = ({ onClose, quranData, showToast, isLandscape }) => {
    const [selectedTafsir, setSelectedTafsir] = useState('');
    const [selectedSurah, setSelectedSurah] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('');
    const abortControllerRef = useRef<AbortController | null>(null);

    const downloadTafsir = async () => {
        if (!selectedTafsir || !selectedSurah) return;
        
        setIsDownloading(true);
        setStatus('جاري التحضير للتحميل...');
        setProgress(0);
        abortControllerRef.current = new AbortController();

        try {
            if (selectedSurah === 'all') {
                const allDownloaded = await checkAllTafsirDownloaded(selectedTafsir, quranData);
                if (allDownloaded) {
                    showToast("[تفاسير] التفاسير تم تحميلها مسبقاً");
                    setIsDownloading(false);
                    return;
                }
                await downloadAllTafsir(selectedTafsir);
            } else {
                const isDownloaded = await checkTafsirDownloaded(selectedTafsir, parseInt(selectedSurah));
                if (isDownloaded) {
                    const sName = quranData.surahs[parseInt(selectedSurah) - 1].name.replace('سورة', '').trim();
                    showToast(`[تفاسير] تفسير سورة ${sName} تم تحميله مسبقاً`);
                    setIsDownloading(false);
                    return;
                }
                await downloadSpecificTafsir(selectedTafsir, parseInt(selectedSurah));
            }
            setStatus('تم التحميل بنجاح!');
            setProgress(100);
            showToast('تم التحميل بنجاح!');
        } catch (error: any) {
            if (error.name === 'AbortError') {
                setStatus('تم إيقاف التحميل');
                showToast('تم إيقاف التحميل');
            } else {
                setStatus(`خطأ: ${error.message}`);
                showToast(`خطأ: ${error.message}`);
            }
        } finally {
            setIsDownloading(false);
            abortControllerRef.current = null;
        }
    };

    const stopDownload = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    };

    const downloadSpecificTafsir = async (tafsirId: string, surahNumber: number) => {
        const url = `https://api.alquran.cloud/v1/surah/${surahNumber}/${tafsirId}`;
        const fileName = `${tafsirId}_${surahNumber}_tafsir.json`;
        
        try {
            const response = await fetch(url, { signal: abortControllerRef.current?.signal });
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            
            storeTafsirOffline(fileName, data.data);
            setProgress(100);
        } catch (e) {
            if ((e as Error).name === 'AbortError') throw e;
            throw new Error('Failed to download tafsir');
        }
    };

    const downloadAllTafsir = async (tafsirId: string) => {
        const totalSurahs = 114;
        for (let i = 1; i <= totalSurahs; i++) {
            if (abortControllerRef.current?.signal.aborted) throw new Error('Aborted');
            await downloadSpecificTafsir(tafsirId, i);
            setProgress((i / totalSurahs) * 100);
            setStatus(`جاري تحميل تفسير سورة ${i}/${totalSurahs}`);
            // Delay to avoid rate limiting
            await new Promise(r => setTimeout(r, 200));
        }
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[156] flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
            <div className={`modal-skinned w-full ${isLandscape ? 'max-w-4xl' : 'max-w-md'} rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]`} onClick={e => e.stopPropagation()}>
                <div className="p-3 flex justify-between items-center h-12 flex-none theme-header-bg">
                    <h2 className="text-lg font-bold">تحميل التفسير</h2>
                    <button onClick={onClose} className="hover:opacity-80 rounded-full bg-white/20 w-8 h-8 flex items-center justify-center">✕</button>
                </div>
                <div className="p-3 space-y-4 overflow-y-auto text-center flex-1">
                    <div className="space-y-4">
                        <div className="text-right">
                            <label className="text-xs font-bold opacity-70 block mb-2">اختر التفسير</label>
                            <div className={`grid ${isLandscape ? 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3'} gap-2 ${isLandscape ? 'max-h-40' : 'max-h-60'} overflow-y-auto p-2 border rounded-lg themed-card-bg custom-scrollbar`} dir="rtl">
                                {TAFSEERS.filter(t => t.id !== 'ar.jalalayn').map(t => (
                                    <button 
                                        key={t.id}
                                        onClick={() => setSelectedTafsir(t.id)}
                                        className={`text-[10px] sm:text-xs p-2 rounded-md border transition-all font-bold ${selectedTafsir === t.id ? 'theme-btn-bg border-transparent' : 'bg-black/5 border-gray-200 dark:border-gray-700'}`}
                                    >
                                        {t.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="text-right">
                            <label className="text-xs font-bold opacity-70 block mb-2">اختر السورة</label>
                            <div className={`grid ${isLandscape ? 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3'} gap-2 ${isLandscape ? 'max-h-40' : 'max-h-60'} overflow-y-auto p-2 border rounded-lg themed-card-bg custom-scrollbar`} dir="rtl">
                                <button 
                                    onClick={() => setSelectedSurah('all')}
                                    className={`text-[10px] sm:text-xs p-2 rounded-md border transition-all font-bold ${selectedSurah === 'all' ? 'theme-btn-bg border-transparent' : 'bg-black/5 border-gray-200 dark:border-gray-700'}`}
                                >
                                    تحميل التفاسير كاملاً
                                </button>
                                {quranData?.surahs.map((s: any) => (
                                    <button 
                                        key={s.number}
                                        onClick={() => setSelectedSurah(s.number.toString())}
                                        className={`text-[10px] sm:text-xs p-2 rounded-md border transition-all font-bold ${selectedSurah === s.number.toString() ? 'theme-btn-bg border-transparent' : 'bg-black/5 border-gray-200 dark:border-gray-700'}`}
                                    >
                                        {s.name.replace('سورة', '').trim()}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        {!isDownloading ? (
                            <button onClick={downloadTafsir} disabled={!selectedTafsir || !selectedSurah} className={`w-full theme-btn-bg py-2.5 rounded-lg shadow font-bold text-sm ${(!selectedTafsir || !selectedSurah) ? 'opacity-50 cursor-not-allowed' : ''}`}>تحميل</button>
                        ) : (
                            <div className="mt-2">
                                <div className="text-xs font-bold mb-1">{status}</div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-purple-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                </div>
                                <button onClick={stopDownload} className="w-full mt-2 bg-red-500 text-white py-1.5 rounded-lg shadow hover:bg-red-600 font-bold text-sm">إيقاف التحميل</button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="p-3 text-center flex-none themed-card-bg">
                    <button onClick={onClose} className="theme-accent-btn font-bold py-2 px-8 rounded-lg shadow text-sm w-full">إغلاق</button>
                </div>
            </div>
        </div>
    );
};
