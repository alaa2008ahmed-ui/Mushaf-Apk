import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Share2, Plus, Minus, Type } from 'lucide-react';
import html2canvas from 'html2canvas';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { FONTS } from './constants';

interface ShareAyahModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentAyah: { s: number; a: number };
    quranData: any;
    currentTheme: any;
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
];

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
    currentTheme
}) => {
    const [selectedAyahs, setSelectedAyahs] = useState<{ s: number; a: number }[]>([currentAyah]);
    const [selectedBg, setSelectedBg] = useState(BACKGROUNDS[0]);
    const [fontSize, setFontSize] = useState(24);
    const [textColor, setTextColor] = useState(TEXT_COLORS[0]);
    const [selectedFont, setSelectedFont] = useState(FONTS[0].id);
    const [customText, setCustomText] = useState('');
    const [isSharing, setIsSharing] = useState(false);
    const previewRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setSelectedAyahs([currentAyah]);
            setSelectedBg(BACKGROUNDS[0]);
            setFontSize(24);
            setTextColor(TEXT_COLORS[0]);
            setSelectedFont(FONTS[0].id);
            setCustomText('');
        }
    }, [isOpen, currentAyah]);

    if (!isOpen || !quranData) return null;

    const handlePrevAyah = () => {
        const first = selectedAyahs[0];
        if (first.a > 1) {
            setSelectedAyahs([{ s: first.s, a: first.a - 1 }, ...selectedAyahs]);
        } else if (first.s > 1) {
            const prevSurah = quranData.surahs[first.s - 2];
            setSelectedAyahs([{ s: first.s - 1, a: prevSurah.ayahs.length }, ...selectedAyahs]);
        }
    };

    const handleNextAyah = () => {
        const last = selectedAyahs[selectedAyahs.length - 1];
        const currentSurah = quranData.surahs[last.s - 1];
        if (last.a < currentSurah.ayahs.length) {
            setSelectedAyahs([...selectedAyahs, { s: last.s, a: last.a + 1 }]);
        } else if (last.s < 114) {
            setSelectedAyahs([...selectedAyahs, { s: last.s + 1, a: 1 }]);
        }
    };

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
        return quranData.surahs[s - 1]?.name || '';
    };

    const handleShare = async () => {
        if (!previewRef.current || isSharing) return;
        setIsSharing(true);
        const shareText = `تلاوة من القرآن الكريم\n${surahInfo}\nتم الإنشاء بواسطة: مصحف احمد وليلى`;
        try {
            const canvas = await html2canvas(previewRef.current, {
                scale: 2.5,
                useCORS: true,
                backgroundColor: '#ffffff',
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
                // Web fallback
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
                        await navigator.share({
                            title: 'مشاركة آية',
                            text: shareText,
                        });
                    }
                } catch (e) {
                    await navigator.share({ title: 'مشاركة آية', text: shareText });
                }
            } else {
                alert("المشاركة غير مدعومة في هذا المتصفح");
            }
        } catch (error) {
            console.error('Error sharing image:', error);
        } finally {
            setIsSharing(false);
        }
    };

    const combinedText = selectedAyahs.map(ay => getAyahText(ay.s, ay.a) + ` ﴿${ay.a}﴾`).join(' ');
    const firstAyah = selectedAyahs[0];
    const lastAyah = selectedAyahs[selectedAyahs.length - 1];
    const surahInfo = firstAyah.s === lastAyah.s 
        ? (firstAyah.a === lastAyah.a 
            ? `سورة ${getSurahName(firstAyah.s)} - آية ${firstAyah.a}`
            : `سورة ${getSurahName(firstAyah.s)} - آيات ${firstAyah.a}-${lastAyah.a}`)
        : `سورة ${getSurahName(firstAyah.s)} آية ${firstAyah.a} - سورة ${getSurahName(lastAyah.s)} آية ${lastAyah.a}`;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" dir="rtl">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">مشاركة آية</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Preview Area */}
                    <div className="flex justify-center">
                        <div 
                            ref={previewRef}
                            className="relative w-full max-w-[350px] rounded-xl overflow-hidden flex flex-col items-center justify-center py-4 px-6 text-center shadow-lg"
                            style={{
                                backgroundImage: selectedBg.value,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                border: `4px solid ${selectedBg.border}`
                            }}
                        >
                            <div className="absolute inset-0 bg-black/20"></div>
                            <div className="relative z-10 flex flex-col items-center justify-center w-full">
                                <p 
                                    className="leading-loose"
                                    style={{ 
                                        fontFamily: selectedFont,
                                        fontSize: `${fontSize}px`, 
                                        color: textColor,
                                        textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                                    }}
                                >
                                    {combinedText}
                                </p>
                                <div className="mt-4 pt-4 border-t border-white/30 w-full px-2 flex flex-col items-center gap-2">
                                    <p style={{ fontFamily: selectedFont, color: textColor, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }} className="text-sm font-bold opacity-90 text-center">
                                        {surahInfo}
                                    </p>
                                    <div className="w-full flex justify-between items-end mt-1">
                                        <span 
                                            style={{ fontFamily: selectedFont, color: textColor, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }} 
                                            className="text-xs font-medium max-w-[50%] text-right leading-tight opacity-90"
                                        >
                                            {customText}
                                        </span>
                                        <a 
                                            href="https://play.google.com/store/apps/details?id=com.AhmedLaila.Quran&hl=ar&pli=1" 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            style={{ color: selectedBg.accent, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }} 
                                            className="text-[13px] font-extrabold hover:opacity-100 transition-opacity underline decoration-dotted underline-offset-4 text-left drop-shadow-md"
                                            dir="rtl"
                                        >
                                            مصحف احمد وليلى
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ayah Controls */}
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-2 rounded-xl">
                        <button 
                            onClick={handleNextAyah}
                            className="flex items-center gap-1 px-3 py-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                            <ChevronRight size={16} />
                            الآية التالية
                        </button>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            {selectedAyahs.length} آيات
                        </span>
                        <button 
                            onClick={handlePrevAyah}
                            className="flex items-center gap-1 px-3 py-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                            الآية السابقة
                            <ChevronLeft size={16} />
                        </button>
                    </div>

                    {/* Background Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الخلفية</label>
                        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                            {BACKGROUNDS.map(bg => (
                                <button
                                    key={bg.id}
                                    onClick={() => setSelectedBg(bg)}
                                    className={`w-12 h-12 rounded-lg shrink-0 border-2 transition-all ${selectedBg.id === bg.id ? 'border-blue-500 scale-110 shadow-md' : 'border-transparent'}`}
                                    style={{
                                        backgroundImage: bg.value,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Text Controls */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Font Size */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">حجم الخط</label>
                            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-1 rounded-lg">
                                <button 
                                    onClick={() => setFontSize(prev => Math.max(12, prev - 2))}
                                    className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-md text-gray-600 dark:text-gray-300"
                                >
                                    <Minus size={18} />
                                </button>
                                <span className="font-medium text-gray-700 dark:text-gray-200">{fontSize}</span>
                                <button 
                                    onClick={() => setFontSize(prev => Math.min(48, prev + 2))}
                                    className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-md text-gray-600 dark:text-gray-300"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Text Color */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">لون النص</label>
                            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg items-center">
                                {TEXT_COLORS.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => setTextColor(color)}
                                        className={`w-8 h-8 rounded-full shrink-0 border-2 transition-all ${textColor === color ? 'border-blue-500 scale-110' : 'border-gray-300 dark:border-gray-600'}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Font Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">نوع الخط</label>
                        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                            {FONTS.map(font => (
                                <button
                                    key={font.id}
                                    onClick={() => setSelectedFont(font.id)}
                                    className={`px-4 py-2 rounded-lg shrink-0 border transition-all ${selectedFont === font.id ? 'bg-blue-500 text-white border-blue-500' : 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'}`}
                                    style={{ fontFamily: font.id }}
                                >
                                    {font.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Text Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">نص إضافي (اختياري)</label>
                        <input 
                            type="text" 
                            value={customText}
                            onChange={(e) => setCustomText(e.target.value)}
                            placeholder="اكتب نصاً يظهر أسفل الصورة..."
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            maxLength={50}
                            dir="rtl"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
                    <button
                        onClick={handleShare}
                        disabled={isSharing}
                        className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-70"
                        style={{ backgroundColor: currentTheme.primary || '#3b82f6' }}
                    >
                        {isSharing ? (
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <Share2 size={20} />
                                مشاركة الصورة
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareAyahModal;
