import React, { useState, useRef, useEffect } from 'react';
import { X, Share2, Plus, Minus, Type, Image as ImageIcon, FileText, Volume2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { FONTS, SURAH_NAMES_AR, toArabic } from './constants';

interface ShareAyahModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentAyah: { s: number; a: number };
    quranData: any;
    currentTheme: any;
    readingMode?: 'mushaf' | 'tafseer' | 'meanings' | 'translation';
}

const BACKGROUNDS = [
    { id: 'bg1', type: 'gradient', value: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', border: '#4a72b8', accent: '#FFD700' },
    { id: 'bg2', type: 'gradient', value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', border: '#58ff9d', accent: '#004D40' },
    { id: 'bg3', type: 'gradient', value: 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)', border: '#ae4dff', accent: '#00FFCC' },
    { id: 'bg4', type: 'gradient', value: 'linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)', border: '#ff6b4b', accent: '#FFD700' },
    { id: 'bg5', type: 'gradient', value: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)', border: '#54b8fb', accent: '#FFEB3B' },
    { id: 'bg6', type: 'gradient', value: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)', border: '#4c7384', accent: '#FFCA28' },
    { id: 'bg7', type: 'gradient', value: 'linear-gradient(135deg, #f2709c 0%, #ff9472 100%)', border: '#ffb399', accent: '#880E4F' },
    { id: 'bg8', type: 'gradient', value: 'linear-gradient(135deg, #1D976C 0%, #93F9B9 100%)', border: '#b3fcd0', accent: '#004D40' },
    { id: 'bg9', type: 'gradient', value: 'linear-gradient(135deg, #000000 0%, #434343 100%)', border: '#666666', accent: '#FFD700' },
    { id: 'bg10', type: 'gradient', value: 'linear-gradient(135deg, #5C258D 0%, #4389A2 100%)', border: '#6db3c9', accent: '#FFEB3B' },
    { id: 'bg11', type: 'gradient', value: 'linear-gradient(135deg, #134E5E 0%, #71B280 100%)', border: '#8cd19c', accent: '#FFF' },
    { id: 'bg12', type: 'gradient', value: 'linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)', border: '#ffb399', accent: '#FFF' },
    { id: 'bg13', type: 'gradient', value: 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)', border: '#b8eb5e', accent: '#004D40' },
    { id: 'bg14', type: 'gradient', value: 'linear-gradient(135deg, #8E0E00 0%, #1F1C18 100%)', border: '#b31200', accent: '#FFD700' },
    { id: 'bg15', type: 'gradient', value: 'linear-gradient(135deg, #00C9FF 0%, #92FE9D 100%)', border: '#b3ffc2', accent: '#004D40' },
    { id: 'bg16', type: 'gradient', value: 'linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)', border: '#ffd266', accent: '#880E4F' },
    { id: 'bg17', type: 'gradient', value: 'radial-gradient(circle at 50% 50%, #1a2a6c, #b21f1f, #fdbb2d)', border: '#fdbb2d', accent: '#FFF' },
    { id: 'bg18', type: 'gradient', value: 'linear-gradient(45deg, #d53369 0%, #daae51 100%)', border: '#daae51', accent: '#FFF' },
    { id: 'bg19', type: 'pattern', value: 'repeating-linear-gradient(45deg, #0f2027, #0f2027 10px, #203a43 10px, #203a43 20px)', border: '#4c7384', accent: '#FFD700' },
    { id: 'bg20', type: 'pattern', value: 'repeating-radial-gradient(circle at 0 0, transparent 0, #5c258d 10px), repeating-linear-gradient(#4389a2, #4389a2)', border: '#6db3c9', accent: '#FFF' },
    { id: 'bg21', type: 'pattern', value: 'radial-gradient(circle at 50% 50%, #11998e 2px, transparent 2.5px), radial-gradient(circle at 50% 50%, #38ef7d 2px, transparent 2.5px)', border: '#58ff9d', accent: '#004D40' },
];

const FRAMES = [
    { id: 'none', name: 'بدون إطار', type: 'none', color: 'transparent' },
    { id: 'f1', name: 'مزدوج ذهبي', type: 'double', color: '#FFD700' },
    { id: 'f2', name: 'مزدوج أبيض', type: 'double', color: '#ffffff' },
    { id: 'f3', name: 'زوايا ذهبي', type: 'corner-diamonds', color: '#FFD700' },
    { id: 'f4', name: 'زوايا أبيض', type: 'corner-diamonds', color: '#ffffff' },
    { id: 'f5', name: 'محراب ذهبي', type: 'mihrab', color: '#FFD700' },
    { id: 'f6', name: 'محراب أبيض', type: 'mihrab', color: '#ffffff' },
    { id: 'f7', name: 'أنيق ذهبي', type: 'elegant', color: '#FFD700' },
    { id: 'f8', name: 'أنيق أبيض', type: 'elegant', color: '#ffffff' },
];

const FrameOverlay = ({ frame }: { frame: typeof FRAMES[0] }) => {
    if (frame.type === 'none') return null;
    
    const color = frame.color;

    if (frame.type === 'double') {
        return <div style={{ position: 'absolute', top: '10px', left: '10px', right: '10px', bottom: '10px', border: `3px double ${color}`, borderRadius: '8px', pointerEvents: 'none', zIndex: 5 }} />;
    }
    if (frame.type === 'corner-diamonds') {
        return (
            <div style={{ position: 'absolute', top: '14px', left: '14px', right: '14px', bottom: '14px', border: `1px solid ${color}`, pointerEvents: 'none', zIndex: 5 }}>
                <div style={{ position: 'absolute', top: '-4px', left: '-4px', width: '8px', height: '8px', backgroundColor: color, transform: 'rotate(45deg)' }} />
                <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', backgroundColor: color, transform: 'rotate(45deg)' }} />
                <div style={{ position: 'absolute', bottom: '-4px', left: '-4px', width: '8px', height: '8px', backgroundColor: color, transform: 'rotate(45deg)' }} />
                <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '8px', height: '8px', backgroundColor: color, transform: 'rotate(45deg)' }} />
            </div>
        );
    }
    if (frame.type === 'mihrab') {
        return (
            <div style={{ position: 'absolute', top: '10px', left: '10px', right: '10px', bottom: '10px', border: `2px solid ${color}`, borderTopLeftRadius: '60px', borderTopRightRadius: '60px', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px', pointerEvents: 'none', zIndex: 5 }} />
        );
    }
    if (frame.type === 'elegant') {
        return (
            <div style={{ position: 'absolute', top: '10px', left: '10px', right: '10px', bottom: '10px', border: `1px solid ${color}`, borderRadius: '12px', pointerEvents: 'none', zIndex: 5 }}>
                <div style={{ position: 'absolute', top: '4px', left: '4px', right: '4px', bottom: '4px', border: `1px solid ${color}`, borderRadius: '8px', opacity: 0.5 }} />
            </div>
        );
    }
    return null;
};

const TEXT_COLORS = [
    '#ffffff', '#000000', '#f1c40f', '#e74c3c', '#2ecc71', '#3498db',
    '#9b59b6', '#e67e22', '#1abc9c', '#ecf0f1', '#95a5a6', '#34495e',
    '#ff9ff3', '#feca57', '#ff6b6b', '#48dbfb', '#1dd1a1', '#5f27cd'
];

const ShareAyahModal: React.FC<ShareAyahModalProps> = ({
    isOpen,
    onClose,
    currentAyah,
    quranData,
    currentTheme,
    readingMode = 'mushaf'
}) => {
    const [shareType, setShareType] = useState<'text' | 'image' | 'page' | 'audio'>('image');
    const [fromAyah, setFromAyah] = useState(currentAyah.a);
    const [toAyah, setToAyah] = useState(currentAyah.a);
    const [selectedAyahs, setSelectedAyahs] = useState<{ s: number; a: number }[]>([currentAyah]);
    
    const [selectedBg, setSelectedBg] = useState(BACKGROUNDS[0]);
    const [selectedFrame, setSelectedFrame] = useState(FRAMES[0]);
    const [fontSize, setFontSize] = useState(20);
    const [textColor, setTextColor] = useState(TEXT_COLORS[0]);
    const [selectedFont, setSelectedFont] = useState(FONTS[0].id);
    const [customText, setCustomText] = useState('');
    const [isSharing, setIsSharing] = useState(false);
    const [explanationData, setExplanationData] = useState<any>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    const hiddenCaptureRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchExplanation = async () => {
            if (readingMode === 'mushaf') return;
            try {
                let url = '';
                if (readingMode === 'tafseer') url = '/assets/data/ar.jalalayn.json';
                else if (readingMode === 'meanings') url = '/tafseer.json';
                else if (readingMode === 'translation') url = '/en.json';
                
                if (url) {
                    const res = await fetch(url);
                    const data = await res.json();
                    setExplanationData(data);
                }
            } catch (e) {
                console.error('Error fetching explanation for share:', e);
            }
        };
        fetchExplanation();
    }, [readingMode]);

    useEffect(() => {
        if (isOpen) {
            setFromAyah(currentAyah.a);
            setToAyah(currentAyah.a);
            setSelectedAyahs([currentAyah]);
            setSelectedBg(BACKGROUNDS[0]);
            setSelectedFrame(FRAMES[0]);
            setFontSize(20);
            setTextColor(TEXT_COLORS[0]);
            setSelectedFont(FONTS[0].id);
            setCustomText('');
            setShareType('image');
        }
    }, [isOpen, currentAyah]);

    useEffect(() => {
        const start = Math.min(fromAyah, toAyah);
        const end = Math.max(fromAyah, toAyah);
        const newSelected = [];
        for (let a = start; a <= end; a++) {
            newSelected.push({ s: currentAyah.s, a });
        }
        setSelectedAyahs(newSelected);
    }, [fromAyah, toAyah, currentAyah.s]);

    if (!isOpen || !quranData) return null;

    const getAyahText = (s: number, a: number) => {
        const surah = quranData.surahs[s - 1];
        if (!surah) return '';
        const ayah = surah.ayahs.find((ay: any) => ay.numberInSurah === a);
        if (!ayah) return '';
        let text = ayah.text;
        if (s !== 1 && s !== 9 && a === 1) {
            text = text.replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', '').replace('بِّسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', '').trim();
        }
        return text;
    };

    const getSurahName = (s: number) => {
        return SURAH_NAMES_AR[s - 1] || '';
    };

    const getExplanationText = (s: number, a: number) => {
        if (!explanationData) return '';
        if (readingMode === 'tafseer') {
            return explanationData.data?.surahs?.[s - 1]?.ayahs?.[a - 1]?.text || explanationData[s - 1]?.ayahs?.[a - 1]?.text || '';
        }
        if (readingMode === 'meanings') {
            return explanationData.find((m: any) => m.number === String(s) && m.aya === String(a))?.text || '';
        }
        if (readingMode === 'translation') {
            return explanationData[s - 1]?.verses?.[a - 1]?.translation || '';
        }
        return '';
    };

    const combinedText = selectedAyahs.map(ay => getAyahText(ay.s, ay.a) + ` ﴿${toArabic(ay.a)}﴾`).join(' ');
    const combinedExplanation = selectedAyahs.map(ay => getExplanationText(ay.s, ay.a)).filter(t => t).join('\n');
    const firstAyah = selectedAyahs[0];
    const lastAyah = selectedAyahs[selectedAyahs.length - 1];
    const surahInfo = firstAyah.s === lastAyah.s 
        ? (firstAyah.a === lastAyah.a 
            ? `سورة ${getSurahName(firstAyah.s)} - آية ${toArabic(firstAyah.a)}`
            : `سورة ${getSurahName(firstAyah.s)} - آية ${toArabic(firstAyah.a)} إلى آية ${toArabic(lastAyah.a)}`)
        : `سورة ${getSurahName(firstAyah.s)} آية ${toArabic(firstAyah.a)} - سورة ${getSurahName(lastAyah.s)} آية ${toArabic(lastAyah.a)}`;

    const handleShare = async () => {
        if (isSharing) return;
        setIsSharing(true);
        
        let shareText = `${surahInfo}\nايات من القران الكريم . بواسطة : مصحف احمد وليلى`;
        
        if (shareType === 'page') {
            const pageNum = quranData.surahs[currentAyah.s - 1].ayahs.find((ay: any) => ay.numberInSurah === currentAyah.a)?.page || 1;
            
            // Find all ayahs in this page
            const pageAyahs: {s: number, a: number}[] = [];
            quranData.surahs.forEach((surah: any, sIdx: number) => {
                surah.ayahs.forEach((ayah: any) => {
                    if (ayah.page === pageNum) {
                        pageAyahs.push({ s: sIdx + 1, a: ayah.numberInSurah });
                    }
                });
            });
            
            let pageSurahInfo = surahInfo;
            if (pageAyahs.length > 0) {
                const firstPageAyah = pageAyahs[0];
                const lastPageAyah = pageAyahs[pageAyahs.length - 1];
                pageSurahInfo = firstPageAyah.s === lastPageAyah.s 
                    ? `سورة ${getSurahName(firstPageAyah.s)} - آية ${toArabic(firstPageAyah.a)} إلى آية ${toArabic(lastPageAyah.a)}`
                    : `سورة ${getSurahName(firstPageAyah.s)} آية ${toArabic(firstPageAyah.a)} - سورة ${getSurahName(lastPageAyah.s)} آية ${toArabic(lastPageAyah.a)}`;
            }
            
            shareText = `صفحة ${toArabic(pageNum)} - ${pageSurahInfo}\nايات من القران الكريم . بواسطة : مصحف احمد وليلى`;
        }
        
        const fullText = `${combinedText}\n\n${combinedExplanation ? combinedExplanation + '\n\n' : ''}${shareText}`;

        const blobToBase64 = (blob: Blob): Promise<string> => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        };

        try {
            if (shareType === 'text') {
                if (Capacitor.isNativePlatform()) {
                    await Share.share({
                        title: 'مشاركة آية',
                        text: fullText,
                        dialogTitle: 'مشاركة عبر'
                    });
                } else if (navigator.share) {
                    await navigator.share({
                        title: 'مشاركة آية',
                        text: fullText,
                    });
                } else {
                    alert("المشاركة غير مدعومة في هذا المتصفح");
                }
            } else if (shareType === 'image' && previewRef.current) {
                const canvas = await html2canvas(previewRef.current, {
                    scale: 2.5,
                    useCORS: true,
                    backgroundColor: '#ffffff',
                    onclone: (clonedDoc) => {
                        const elements = clonedDoc.getElementsByTagName('*');
                        for (let i = 0; i < elements.length; i++) {
                            const el = elements[i] as HTMLElement;
                            const style = window.getComputedStyle(el);
                            ['color', 'backgroundColor', 'borderColor', 'outlineColor'].forEach(prop => {
                                const val = el.style.getPropertyValue(prop) || style.getPropertyValue(prop);
                                if (val && (val.includes('oklab') || val.includes('oklch'))) {
                                    el.style.setProperty(prop, prop === 'color' ? '#000000' : 'transparent', 'important');
                                }
                            });
                        }
                    }
                });
                const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

                if (Capacitor.isNativePlatform()) {
                    const fileName = `ayah_share_${Date.now()}.jpg`;
                    const base64Data = dataUrl.split(',')[1];
                    const savedFile = await Filesystem.writeFile({
                        path: fileName,
                        data: base64Data,
                        directory: Directory.Cache,
                    });
                    
                    await Share.share({
                        title: 'مشاركة آية',
                        text: shareText,
                        url: savedFile.uri,
                        dialogTitle: 'مشاركة عبر'
                    });
                } else if (navigator.share) {
                    try {
                        const blob = await (await fetch(dataUrl)).blob();
                        const file = new File([blob], 'ayah.jpg', { type: 'image/jpeg' });
                        if (navigator.canShare && navigator.canShare({ files: [file] })) {
                            await navigator.share({
                                title: 'مشاركة آية',
                                text: shareText,
                                files: [file],
                            });
                        } else {
                            await navigator.share({ title: 'مشاركة آية', text: shareText });
                        }
                    } catch (e) {
                        await navigator.share({ title: 'مشاركة آية', text: shareText });
                    }
                } else {
                    alert("المشاركة غير مدعومة في هذا المتصفح");
                }
            } else if (shareType === 'page') {
                const pageNum = quranData.surahs[currentAyah.s - 1].ayahs.find((ay: any) => ay.numberInSurah === currentAyah.a)?.page || 1;
                
                // Find the page element or the main content container
                let captureElement: HTMLElement | null = null;
                
                if (readingMode === 'mushaf') {
                    captureElement = document.querySelector(`.mushaf-page[data-page="${pageNum}"]`) as HTMLElement;
                } else {
                    // For Tafseer/Meanings, use the hidden capture element
                    captureElement = hiddenCaptureRef.current;
                }
                
                if (!captureElement) {
                    captureElement = document.getElementById('mushaf-content');
                }
                
                if (captureElement) {
                    try {
                        // Ensure all images are loaded if any
                        const images = captureElement.querySelectorAll('img');
                        await Promise.all(Array.from(images).map(img => {
                            if (img.complete) return Promise.resolve();
                            return new Promise(resolve => {
                                img.onload = resolve;
                                img.onerror = resolve;
                            });
                        }));

                        const canvas = await html2canvas(captureElement, {
                            scale: 2,
                            useCORS: true,
                            backgroundColor: currentTheme.bg || '#ffffff',
                            logging: false,
                            onclone: (clonedDoc) => {
                                // Fix for oklch/oklab colors that html2canvas doesn't support
                                const elements = clonedDoc.getElementsByTagName('*');
                                for (let i = 0; i < elements.length; i++) {
                                    const el = elements[i] as HTMLElement;
                                    const style = window.getComputedStyle(el);
                                    ['color', 'backgroundColor', 'borderColor', 'outlineColor'].forEach(prop => {
                                        const val = el.style.getPropertyValue(prop) || style.getPropertyValue(prop);
                                        if (val && (val.includes('oklab') || val.includes('oklch'))) {
                                            el.style.setProperty(prop, prop === 'color' ? '#000000' : 'transparent', 'important');
                                        }
                                    });
                                }
                                
                                // Ensure the cloned element is visible even if the original is hidden
                                const clonedCapture = clonedDoc.getElementById('hidden-page-capture');
                                if (clonedCapture) {
                                    clonedCapture.style.position = 'relative';
                                    clonedCapture.style.left = '0';
                                    clonedCapture.style.top = '0';
                                    clonedCapture.style.visibility = 'visible';
                                    clonedCapture.style.display = 'block';
                                }
                            }
                        });
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

                        if (Capacitor.isNativePlatform()) {
                            const fileName = `quran_page_${pageNum}_${Date.now()}.jpg`;
                            const base64Data = dataUrl.split(',')[1];
                            const savedFile = await Filesystem.writeFile({
                                path: fileName,
                                data: base64Data,
                                directory: Directory.Cache,
                            });
                            
                            await Share.share({
                                title: 'مشاركة صفحة',
                                text: shareText,
                                url: savedFile.uri,
                                dialogTitle: 'مشاركة عبر'
                            });
                        } else if (navigator.share) {
                            const blob = await (await fetch(dataUrl)).blob();
                            const file = new File([blob], `page_${pageNum}.jpg`, { type: 'image/jpeg' });
                            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                                await navigator.share({
                                    title: 'مشاركة صفحة',
                                    text: shareText,
                                    files: [file],
                                });
                            } else {
                                await navigator.share({
                                    title: 'مشاركة صفحة',
                                    text: shareText,
                                });
                            }
                        } else {
                            // Fallback for browsers that don't support sharing
                            const link = document.createElement('a');
                            link.download = `page_${pageNum}.jpg`;
                            link.href = dataUrl;
                            link.click();
                        }
                    } catch (e) {
                        console.error('Error capturing page:', e);
                        // Fallback to text share
                        if (Capacitor.isNativePlatform()) {
                            await Share.share({
                                title: 'مشاركة صفحة',
                                text: shareText,
                                dialogTitle: 'مشاركة عبر'
                            });
                        } else if (navigator.share) {
                            await navigator.share({
                                title: 'مشاركة صفحة',
                                text: shareText,
                            });
                        }
                    }
                }
            } else if (shareType === 'audio') {
                let reader = 'ar.alafasy';
                try {
                    const settings = JSON.parse(localStorage.getItem('quran_settings') || '{}');
                    if (settings.reader) reader = settings.reader;
                } catch (e) {}
                
                const sStr = String(firstAyah.s).padStart(3, '0');
                const aStr = String(firstAyah.a).padStart(3, '0');
                const audioReader = reader === 'ar.alafasy' ? 'Alafasy_128kbps' : reader;
                const audioUrl = `https://everyayah.com/data/${audioReader}/${sStr}${aStr}.mp3`;
                
                // Custom file name: SurahName_AyahRange.mp3
                const fileName = `${getSurahName(firstAyah.s)}_${firstAyah.a}${firstAyah.a !== lastAyah.a ? '-' + lastAyah.a : ''}.mp3`;

                try {
                    const res = await fetch(audioUrl);
                    if (!res.ok) throw new Error('Failed to fetch audio');
                    const blob = await res.blob();

                    if (Capacitor.isNativePlatform()) {
                        const base64Data = await blobToBase64(blob);
                        const savedFile = await Filesystem.writeFile({
                            path: fileName,
                            data: base64Data.split(',')[1],
                            directory: Directory.Cache,
                        });
                        await Share.share({
                            title: 'مشاركة تلاوة',
                            text: shareText,
                            url: savedFile.uri,
                            dialogTitle: 'مشاركة عبر'
                        });
                    } else if (navigator.share) {
                        const file = new File([blob], fileName, { type: 'audio/mpeg' });
                        if (navigator.canShare && navigator.canShare({ files: [file] })) {
                            await navigator.share({
                                title: 'مشاركة تلاوة',
                                text: shareText,
                                files: [file],
                            });
                        } else {
                            // Fallback to text only if file share not supported
                            await navigator.share({
                                title: 'مشاركة تلاوة',
                                text: shareText,
                            });
                        }
                    } else {
                        await Share.share({
                            title: 'مشاركة تلاوة',
                            text: shareText,
                            dialogTitle: 'مشاركة عبر'
                        });
                    }
                } catch (e) {
                    console.error('Error sharing audio file:', e);
                    // Fallback to text share
                    if (Capacitor.isNativePlatform()) {
                        await Share.share({
                            title: 'مشاركة تلاوة',
                            text: shareText,
                            dialogTitle: 'مشاركة عبر'
                        });
                    } else if (navigator.share) {
                        await navigator.share({
                            title: 'مشاركة تلاوة',
                            text: shareText,
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error sharing:', error);
        } finally {
            setIsSharing(false);
        }
    };

    const pageNum = quranData.surahs[currentAyah.s - 1].ayahs.find((ay: any) => ay.numberInSurah === currentAyah.a)?.page || 1;
    const pageAyahs: {s: number, a: number}[] = [];
    let pageSurahInfo = "";
    if (readingMode !== 'mushaf') {
        quranData.surahs.forEach((surah: any, sIdx: number) => {
            surah.ayahs.forEach((ayah: any) => {
                if (ayah.page === pageNum) {
                    pageAyahs.push({ s: sIdx + 1, a: ayah.numberInSurah });
                }
            });
        });
        
        if (pageAyahs.length > 0) {
            const firstPageAyah = pageAyahs[0];
            const lastPageAyah = pageAyahs[pageAyahs.length - 1];
            pageSurahInfo = firstPageAyah.s === lastPageAyah.s 
                ? `سورة ${getSurahName(firstPageAyah.s)} - آية ${toArabic(firstPageAyah.a)} إلى آية ${toArabic(lastPageAyah.a)}`
                : `سورة ${getSurahName(firstPageAyah.s)} آية ${toArabic(firstPageAyah.a)} - سورة ${getSurahName(lastPageAyah.s)} آية ${toArabic(lastPageAyah.a)}`;
        }
    }

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm overflow-y-auto" dir="rtl">
            {/* Hidden capture element for Tafseer/Meanings page share */}
            {readingMode !== 'mushaf' && (
                <div 
                    id="hidden-page-capture"
                    ref={hiddenCaptureRef}
                    style={{
                        position: 'absolute',
                        left: '-9999px',
                        top: '-9999px',
                        width: '800px', // Fixed width for consistent capture
                        backgroundColor: currentTheme.bg || '#ffffff',
                        padding: '40px',
                        color: currentTheme.text || '#000000',
                        direction: 'rtl'
                    }}
                >
                    <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: `2px solid ${currentTheme.accent}`, paddingBottom: '15px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: currentTheme.accent }}>
                            صفحة {toArabic(pageNum)} - {pageSurahInfo}
                        </h2>
                    </div>
                    
                    {pageAyahs.map((ay, idx) => {
                        const ayahText = getAyahText(ay.s, ay.a);
                        const explanation = getExplanationText(ay.s, ay.a);
                        const isNewSurah = idx === 0 || pageAyahs[idx-1].s !== ay.s;
                        
                        return (
                            <div key={`${ay.s}-${ay.a}`} style={{ marginBottom: '25px' }}>
                                {isNewSurah && idx > 0 && (
                                    <div style={{ textAlign: 'center', margin: '30px 0', padding: '10px', backgroundColor: `${currentTheme.accent}15`, borderRadius: '8px' }}>
                                        <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: currentTheme.accent }}>سورة {getSurahName(ay.s)}</h3>
                                    </div>
                                )}
                                <div style={{ 
                                    fontSize: '22px', 
                                    lineHeight: '1.8', 
                                    fontFamily: 'var(--font-amiri-quran), serif',
                                    color: currentTheme.accent,
                                    marginBottom: '10px',
                                    textAlign: 'right'
                                }}>
                                    {ayahText} ﴿{toArabic(ay.a)}﴾
                                </div>
                                {explanation && (
                                    <div style={{ 
                                        fontSize: '16px', 
                                        lineHeight: '1.6', 
                                        color: currentTheme.text,
                                        opacity: 0.9,
                                        textAlign: readingMode === 'translation' ? 'left' : 'right',
                                        direction: readingMode === 'translation' ? 'ltr' : 'rtl',
                                        padding: '10px',
                                        backgroundColor: 'rgba(0,0,0,0.02)',
                                        borderRadius: '6px'
                                    }}>
                                        {explanation}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    
                    <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #eee', textAlign: 'center', opacity: 0.6, fontSize: '14px' }}>
                        مصحف احمد وليلى - {new Date().toLocaleDateString('ar-EG')}
                    </div>
                </div>
            )}

            <div className="min-h-full flex items-center justify-center p-2 sm:p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md flex flex-col">
                    {/* Header */}
                    <div className="flex justify-between items-center p-3 border-b dark:border-gray-700">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">مشاركة</h3>
                        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-3 space-y-4">
                        {/* Share Type Selector */}
                        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                            <button onClick={() => setShareType('text')} className={`flex-1 py-1 text-[10px] font-medium rounded-md flex items-center justify-center gap-1 transition-colors ${shareType === 'text' ? 'bg-blue-500 text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}>
                                <Type size={12} /> نص
                            </button>
                            <button onClick={() => setShareType('image')} className={`flex-1 py-1 text-[10px] font-medium rounded-md flex items-center justify-center gap-1 transition-colors ${shareType === 'image' ? 'bg-blue-500 text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}>
                                <ImageIcon size={12} /> صورة
                            </button>
                            <button onClick={() => setShareType('page')} className={`flex-1 py-1 text-[10px] font-medium rounded-md flex items-center justify-center gap-1 transition-colors ${shareType === 'page' ? 'bg-blue-500 text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}>
                                <FileText size={12} /> صفحة
                            </button>
                            <button onClick={() => setShareType('audio')} className={`flex-1 py-1 text-[10px] font-medium rounded-md flex items-center justify-center gap-1 transition-colors ${shareType === 'audio' ? 'bg-blue-500 text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}>
                                <Volume2 size={12} /> صوت
                            </button>
                        </div>

                        {/* Range Selector */}
                        {shareType !== 'page' && (
                            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-1.5 rounded-xl gap-3">
                                <div className="flex-1">
                                    <label className="block text-[9px] text-center text-gray-500 dark:text-gray-400 mb-0.5">من</label>
                                    <select 
                                        value={fromAyah} 
                                        onChange={(e) => setFromAyah(Number(e.target.value))}
                                        className="w-full p-1 text-[10px] border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 text-center outline-none"
                                    >
                                        {quranData.surahs[currentAyah.s - 1].ayahs.map((ay: any) => (
                                            <option key={ay.numberInSurah} value={ay.numberInSurah}>
                                                {getSurahName(currentAyah.s)} {ay.numberInSurah}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-[9px] text-center text-gray-500 dark:text-gray-400 mb-0.5">إلى</label>
                                    <select 
                                        value={toAyah} 
                                        onChange={(e) => setToAyah(Number(e.target.value))}
                                        className="w-full p-1 text-[10px] border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 text-center outline-none"
                                    >
                                        {quranData.surahs[currentAyah.s - 1].ayahs.map((ay: any) => (
                                            <option key={ay.numberInSurah} value={ay.numberInSurah}>
                                                {getSurahName(currentAyah.s)} {ay.numberInSurah}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Preview Area (Only for Image) */}
                        {shareType === 'image' && (
                            <div className="flex justify-center drop-shadow-md">
                                <div 
                                    ref={previewRef}
                                    style={{
                                        position: 'relative',
                                        width: '100%',
                                        maxWidth: '320px',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '16px',
                                        textAlign: 'center',
                                        backgroundImage: selectedBg.value,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        border: `3px solid ${selectedBg.border}`,
                                        backgroundColor: '#ffffff'
                                    }}
                                >
                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.2)' }}></div>
                                    <FrameOverlay frame={selectedFrame} />
                                    <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', width: '100%' }}>
                                        {readingMode === 'mushaf' && (
                                            <p 
                                                style={{ 
                                                    fontFamily: 'var(--font-amiri-quran), var(--font-hafs), serif', 
                                                    fontSize: `${fontSize * 1.2}px`, 
                                                    color: selectedBg.accent, 
                                                    marginBottom: '16px',
                                                    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                                                    opacity: 1,
                                                    marginTop: '8px',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                                            </p>
                                        )}
                                        <p 
                                            style={{ 
                                                lineHeight: '1.8',
                                                fontFamily: selectedFont,
                                                fontSize: `${fontSize}px`, 
                                                color: textColor,
                                                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                                                margin: 0,
                                                marginTop: '8px'
                                            }}
                                        >
                                            {combinedText}
                                        </p>
                                        {readingMode !== 'mushaf' && combinedExplanation && (
                                            <p 
                                                style={{ 
                                                    lineHeight: '1.5',
                                                    fontFamily: 'sans-serif',
                                                    fontSize: `${fontSize * 0.6}px`, 
                                                    color: textColor,
                                                    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                                                    margin: '12px 0 0 0',
                                                    opacity: 0.9,
                                                    direction: readingMode === 'translation' ? 'ltr' : 'rtl',
                                                    textAlign: readingMode === 'translation' ? 'left' : 'right',
                                                    width: '100%'
                                                }}
                                            >
                                                {combinedExplanation}
                                            </p>
                                        )}
                                        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.3)', width: '100%', paddingLeft: '4px', paddingRight: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                            <p style={{ fontFamily: selectedFont, color: textColor, textShadow: '0 1px 2px rgba(0,0,0,0.5)', fontSize: '12px', fontWeight: 'bold', opacity: 0.9, textAlign: 'center', margin: 0 }}>
                                                {surahInfo}
                                            </p>
                                            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '2px' }}>
                                                <span 
                                                    style={{ color: selectedBg.accent, textShadow: '0 1px 3px rgba(0,0,0,0.8)', fontSize: '11px', fontWeight: 800, textAlign: 'right' }} 
                                                    dir="rtl"
                                                >
                                                    مصحف احمد وليلى
                                                </span>
                                                <span 
                                                    style={{ fontFamily: selectedFont, color: textColor, textShadow: '0 1px 2px rgba(0,0,0,0.5)', fontSize: '10px', fontWeight: 500, maxWidth: '50%', textAlign: 'left', lineHeight: 1.2, opacity: 0.9 }} 
                                                >
                                                    {customText}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Image Customization Controls */}
                        {shareType === 'image' && (
                            <div className="space-y-2">
                                {/* Background Selection */}
                                <div>
                                    <label className="block text-[10px] font-medium text-gray-700 dark:text-gray-300 mb-1">الخلفية</label>
                                    <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
                                        {BACKGROUNDS.map(bg => (
                                            <button
                                                key={bg.id}
                                                onClick={() => setSelectedBg(bg)}
                                                className={`w-8 h-8 rounded-lg shrink-0 border-2 transition-all ${selectedBg.id === bg.id ? 'border-blue-500 scale-110 shadow-sm' : 'border-transparent'}`}
                                                style={{
                                                    backgroundImage: bg.value,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center'
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Frame Selection */}
                                <div>
                                    <label className="block text-[10px] font-medium text-gray-700 dark:text-gray-300 mb-1">الإطار</label>
                                    <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
                                        {FRAMES.map(frame => (
                                            <button
                                                key={frame.id}
                                                onClick={() => setSelectedFrame(frame)}
                                                className={`shrink-0 px-2 py-1 rounded-lg border transition-all text-[9px] font-medium flex items-center justify-center min-w-[60px] ${selectedFrame.id === frame.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
                                            >
                                                {frame.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Text Controls */}
                                <div className="grid grid-cols-2 gap-2">
                                    {/* Font Size */}
                                    <div>
                                        <label className="block text-[10px] font-medium text-gray-700 dark:text-gray-300 mb-1">حجم الخط</label>
                                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-1 rounded-lg">
                                            <button 
                                                onClick={() => setFontSize(prev => Math.max(12, prev - 2))}
                                                className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded-md text-gray-600 dark:text-gray-300"
                                            >
                                                <Minus size={12} />
                                            </button>
                                            <span className="font-medium text-[10px] text-gray-700 dark:text-gray-200">{fontSize}</span>
                                            <button 
                                                onClick={() => setFontSize(prev => Math.min(48, prev + 2))}
                                                className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded-md text-gray-600 dark:text-gray-300"
                                            >
                                                <Plus size={12} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Text Color */}
                                    <div>
                                        <label className="block text-[10px] font-medium text-gray-700 dark:text-gray-300 mb-1">لون النص</label>
                                        <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar bg-gray-50 dark:bg-gray-700/50 p-1 rounded-lg items-center">
                                            {TEXT_COLORS.map(color => (
                                                <button
                                                    key={color}
                                                    onClick={() => setTextColor(color)}
                                                    className={`w-5 h-5 rounded-full shrink-0 border-2 transition-all ${textColor === color ? 'border-blue-500 scale-110' : 'border-gray-300 dark:border-gray-600'}`}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Font Selection */}
                                <div>
                                    <label className="block text-[10px] font-medium text-gray-700 dark:text-gray-300 mb-1">نوع الخط</label>
                                    <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
                                        {FONTS.map(font => (
                                            <button
                                                key={font.id}
                                                onClick={() => setSelectedFont(font.id)}
                                                className={`px-2 py-1 rounded-lg shrink-0 border transition-all text-[10px] ${selectedFont === font.id ? 'bg-blue-500 text-white border-blue-500' : 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'}`}
                                                style={{ fontFamily: font.id }}
                                            >
                                                {font.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Custom Text Input */}
                                <div>
                                    <input 
                                        type="text" 
                                        value={customText}
                                        onChange={(e) => setCustomText(e.target.value)}
                                        placeholder="نص إضافي (اختياري)..."
                                        className="w-full p-1.5 text-[10px] border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        maxLength={50}
                                        dir="rtl"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-2 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
                        <button
                            onClick={handleShare}
                            disabled={isSharing}
                            className="w-full py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-70"
                            style={{ backgroundColor: currentTheme.primary || '#3b82f6' }}
                        >
                            {isSharing ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Share2 size={16} />
                                    مشاركة
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShareAyahModal;
