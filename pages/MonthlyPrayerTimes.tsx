import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { usePrayerTimes } from '../context/PrayerTimesContext';
import { Coordinates, CalculationMethod, PrayerTimes as AdhanPrayerTimes } from 'adhan';
import moment from 'moment-hijri';
import { formatTime12_clean, applyOffset } from '../utils/prayerTimesUtils';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Share, ArrowRight, Download, ChevronRight, ChevronLeft } from 'lucide-react';
import { Share as CapacitorShare } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import BottomBar from '../components/BottomBar';
import { registerBackInterceptor } from '../hooks/useBackButton';

const getCalculationParams = (country: string, code: string) => {
    let params = CalculationMethod.MuslimWorldLeague();
    if (code.startsWith('+20') || country.includes('مصر')) {
        params = CalculationMethod.Egyptian();
    } else if (code.startsWith('+966') || country.includes('السعودية')) {
        params = CalculationMethod.UmmAlQura();
    } else if (code.startsWith('+971') || country.includes('الإمارات')) {
        params = CalculationMethod.Dubai();
    } else if (code.startsWith('+965') || country.includes('الكويت')) {
        params = CalculationMethod.Kuwait();
    } else if (code.startsWith('+974') || country.includes('قطر')) {
        params = CalculationMethod.Qatar();
    } else if (code.startsWith('+1') || country.includes('أمريكا') || country.includes('كندا')) {
        params = CalculationMethod.NorthAmerica();
    } else if (code.startsWith('+90') || country.includes('تركيا')) {
        params = CalculationMethod.Turkey();
    } else if (code.startsWith('+92') || country.includes('باكستان')) {
        params = CalculationMethod.Karachi();
    }
    return params;
};

export default function MonthlyPrayerTimes({ onBack }: { onBack: () => void }) {
    const { theme, themeKey } = useTheme();
    const { config } = usePrayerTimes();
    const [currentHijriDate, setCurrentHijriDate] = useState(moment());
    const [isExporting, setIsExporting] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const pdfTableRef = useRef<HTMLDivElement>(null);

    const isBlackAndWhite = themeKey === 'black_and_white';
    const primaryColor = isBlackAndWhite ? '#FFFFFF' : theme.palette[0];
    const secondaryColor = isBlackAndWhite ? '#FFFFFF' : theme.palette[1];
    const topBarTextColor = theme.topBarText || (isBlackAndWhite ? '#FFFFFF' : theme.palette[0]);

    useEffect(() => {
        const interceptor = () => {
            onBack();
            return true;
        };
        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [onBack]);

    const monthData = useMemo(() => {
        const year = currentHijriDate.iYear();
        const month = currentHijriDate.iMonth();
        const daysInMonth = moment.iDaysInMonth(year, month);
        
        const data = [];
        const coordinates = new Coordinates(config.location.lat, config.location.lng);
        const params = getCalculationParams(config.location.fullCountry, config.location.combinedCode);

        for (let day = 1; day <= daysInMonth; day++) {
            const date = moment(`${year}/${month + 1}/${day}`, 'iYYYY/iM/iD').toDate();
            const prayerTimes = new AdhanPrayerTimes(coordinates, date, params);
            
            const formatTime = (d: Date) => {
                return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
            };

            const dayName = new Intl.DateTimeFormat('ar-SA', { weekday: 'long' }).format(date);
            const gregorianDay = date.getDate();
            
            const timings = {
                Fajr: formatTime(prayerTimes.fajr),
                Dhuhr: formatTime(prayerTimes.dhuhr),
                Asr: formatTime(prayerTimes.asr),
                Maghrib: formatTime(prayerTimes.maghrib),
                Isha: formatTime(prayerTimes.isha),
            };

            data.push({
                hijriDay: day,
                gregorianDay,
                gregorianDateStr: `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`,
                hijriDateStr: `${year}/${month + 1}/${day}`,
                dayName,
                timings
            });
        }
        return data;
    }, [currentHijriDate, config.location]);

    const handlePrevMonth = () => {
        setCurrentHijriDate(prev => prev.clone().subtract(1, 'iMonth'));
    };

    const handleNextMonth = () => {
        setCurrentHijriDate(prev => prev.clone().add(1, 'iMonth'));
    };

    const monthNameAr = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { month: 'long' }).format(currentHijriDate.toDate());
    const hijriYear = currentHijriDate.iYear();

    const generateImage = async () => {
        if (!pdfTableRef.current) return null;
        const canvas = await html2canvas(pdfTableRef.current, {
            scale: 2.5, // Increased scale for better print quality and clarity
            useCORS: true,
            backgroundColor: '#ffffff',
            windowWidth: 800
        });
        return {
            canvas,
            dataUrl: canvas.toDataURL('image/jpeg', 0.95) // High quality JPEG
        };
    };

    const handleShare = async () => {
        setIsSharing(true);
        const text = `مواقيت الصلاة لشهر ${monthNameAr} ${hijriYear} هـ\nالموقع: ${config.location.cityGov}\nتم الإنشاء بواسطة: مصحف احمد وليلى`;
        try {
            const result = await generateImage();
            if (!result) return;
            
            const fileName = `prayer_times_${Date.now()}.jpg`;

            if (Capacitor.isNativePlatform()) {
                const base64Data = result.dataUrl.split(',')[1];
                const savedFile = await Filesystem.writeFile({
                    path: fileName,
                    data: base64Data,
                    directory: Directory.Cache
                });
                
                await CapacitorShare.share({
                    title: `مواقيت الصلاة - ${monthNameAr}`,
                    text: text,
                    url: savedFile.uri,
                    dialogTitle: 'مشاركة مواقيت الصلاة',
                });
            } else if (navigator.share) {
                try {
                    const blob = await (await fetch(result.dataUrl)).blob();
                    const file = new File([blob], fileName, { type: 'image/jpeg' });
                    if (navigator.canShare && navigator.canShare({ files: [file] })) {
                        await navigator.share({
                            title: `مواقيت الصلاة - ${monthNameAr}`,
                            text: text,
                            files: [file]
                        });
                    } else {
                        await navigator.share({
                            title: `مواقيت الصلاة - ${monthNameAr}`,
                            text: text,
                        });
                    }
                } catch (e) {
                    await navigator.share({ title: `مواقيت الصلاة`, text: text });
                }
            } else {
                alert("المشاركة غير مدعومة في هذا المتصفح");
            }
        } catch (err) {
            console.error("Share failed:", err);
        } finally {
            setIsSharing(false);
        }
    };

    const handleExportPDF = async () => {
        setIsExporting(true);
        try {
            const result = await generateImage();
            if (!result) return;
            const { canvas, dataUrl } = result;
            
            const pdf = new jsPDF({
                orientation: canvas.width > canvas.height ? 'l' : 'p',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });
            
            pdf.addImage(dataUrl, 'JPEG', 0, 0, canvas.width, canvas.height);
            
            const fileName = `prayer_times_${hijriYear}_${currentHijriDate.iMonth() + 1}.pdf`;

            if (Capacitor.isNativePlatform()) {
                const pdfBase64 = pdf.output('datauristring').split(',')[1];
                const savedFile = await Filesystem.writeFile({
                    path: fileName,
                    data: pdfBase64,
                    directory: Directory.Cache
                });
                await CapacitorShare.share({
                    title: 'مواقيت الصلاة',
                    text: `مواقيت الصلاة لشهر ${monthNameAr} ${hijriYear} هـ`,
                    url: savedFile.uri,
                    dialogTitle: 'مشاركة أو حفظ ملف PDF'
                });
            } else {
                pdf.save(fileName);
            }
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("حدث خطأ أثناء إنشاء ملف PDF");
        } finally {
            setIsExporting(false);
        }
    };

    const getOffset = (key: string) => (config.prayerOffsets[key] || 0) + (config.isSummerTime ? 60 : 0);

    return (
        <div className="h-screen w-screen flex flex-col" style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}>
            {/* Top Bar */}
            <div className="app-top-bar" style={{ backgroundColor: primaryColor }}>
                <div className="app-top-bar__inner relative flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="app-top-bar__title text-xl" style={{ color: topBarTextColor }}>
                            مواقيت الشهر
                        </h1>
                        <p className="app-top-bar__subtitle" style={{ color: topBarTextColor }}>
                            {config.location.cityGov}
                        </p>
                    </div>
                </div>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-between px-4 py-3 themed-bg-alt border-b" style={{ borderColor: 'var(--card-border)' }}>
                <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <ChevronRight size={24} color={primaryColor} />
                </button>
                <h2 className="text-lg font-bold" style={{ color: primaryColor }}>
                    {monthNameAr} {hijriYear} هـ
                </h2>
                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <ChevronLeft size={24} color={primaryColor} />
                </button>
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-4 p-4 pb-0">
                <button 
                    onClick={handleShare}
                    disabled={isSharing}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-bold text-white transition-transform active:scale-95 disabled:opacity-50 min-w-[120px] shadow-sm"
                    style={{ backgroundColor: primaryColor }}
                >
                    <Share size={18} />
                    <span>{isSharing ? 'جاري...' : 'مشاركة'}</span>
                </button>
                <button 
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-bold text-white transition-transform active:scale-95 disabled:opacity-50 min-w-[120px] shadow-sm"
                    style={{ backgroundColor: secondaryColor }}
                >
                    <Download size={18} />
                    <span>{isExporting ? 'جاري...' : 'PDF'}</span>
                </button>
            </div>

            {/* Table */}
            <main className="flex-1 overflow-y-auto p-4 pb-24">
                <div className="max-w-4xl mx-auto overflow-x-auto rounded-xl border shadow-sm" style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--card-bg)' }}>
                    <table className="w-full text-center text-sm" dir="rtl">
                        <thead style={{ backgroundColor: primaryColor, color: isBlackAndWhite ? '#000' : '#fff' }}>
                            <tr>
                                <th className="p-2 border-b border-l border-white/20">اليوم</th>
                                <th className="p-2 border-b border-l border-white/20">م/هـ</th>
                                <th className="p-2 border-b border-l border-white/20">الفجر</th>
                                <th className="p-2 border-b border-l border-white/20">الظهر</th>
                                <th className="p-2 border-b border-l border-white/20">العصر</th>
                                <th className="p-2 border-b border-l border-white/20">المغرب</th>
                                <th className="p-2 border-b border-white/20">العشاء</th>
                            </tr>
                        </thead>
                        <tbody>
                            {monthData.map((day, idx) => {
                                const isToday = day.gregorianDateStr === `${new Date().getFullYear()}/${new Date().getMonth() + 1}/${new Date().getDate()}`;
                                return (
                                    <tr key={idx} className={`border-b last:border-0 transition-colors ${isToday ? 'bg-primary/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`} style={{ borderColor: 'var(--card-border)' }}>
                                        <td className="p-2 border-l" style={{ borderColor: 'var(--card-border)' }}>{day.dayName}</td>
                                        <td className="p-2 border-l font-mono text-xs" style={{ borderColor: 'var(--card-border)' }} dir="ltr">
                                            <span style={{ color: primaryColor }}>{day.hijriDay}</span>
                                            <span className="mx-1 opacity-50">/</span>
                                            <span className="opacity-70">{day.gregorianDay}</span>
                                        </td>
                                        <td className="p-2 border-l font-mono" style={{ borderColor: 'var(--card-border)' }}>{formatTime12_clean(applyOffset(day.timings.Fajr, getOffset('Fajr')))}</td>
                                        <td className="p-2 border-l font-mono" style={{ borderColor: 'var(--card-border)' }}>{formatTime12_clean(applyOffset(day.timings.Dhuhr, getOffset('Dhuhr')))}</td>
                                        <td className="p-2 border-l font-mono" style={{ borderColor: 'var(--card-border)' }}>{formatTime12_clean(applyOffset(day.timings.Asr, getOffset('Asr')))}</td>
                                        <td className="p-2 border-l font-mono" style={{ borderColor: 'var(--card-border)' }}>{formatTime12_clean(applyOffset(day.timings.Maghrib, getOffset('Maghrib')))}</td>
                                        <td className="p-2 font-mono">{formatTime12_clean(applyOffset(day.timings.Isha, getOffset('Isha')))}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </main>

            <BottomBar onHomeClick={onBack} onThemesClick={() => {}} showThemes={false} />

            {/* Hidden Table for PDF Export */}
            <div style={{ position: 'fixed', top: '-10000px', left: '-10000px', zIndex: -1000 }}>
                <div ref={pdfTableRef} style={{ width: '800px', padding: '20px', backgroundColor: '#fff', color: '#000', direction: 'rtl', fontFamily: 'Cairo, sans-serif' }}>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <h1 style={{ fontSize: '24px', color: primaryColor }}>مواقيت الصلاة لشهر {monthNameAr} {hijriYear} هـ</h1>
                        <p style={{ fontSize: '16px', color: '#666' }}>الموقع: {config.location.cityGov}</p>
                        <p style={{ fontSize: '14px', color: '#888', marginTop: '5px' }}>تم الإنشاء بواسطة: مصحف احمد وليلى</p>
                    </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ backgroundColor: primaryColor, color: '#fff' }}>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>اليوم</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>التاريخ الهجري</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>التاريخ الميلادي</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>الفجر</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>الظهر</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>العصر</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>المغرب</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>العشاء</th>
                        </tr>
                    </thead>
                    <tbody>
                        {monthData.map((day, idx) => (
                            <tr key={idx}>
                                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{day.dayName}</td>
                                <td style={{ padding: '8px', border: '1px solid #ddd', direction: 'ltr' }}>{day.hijriDateStr}</td>
                                <td style={{ padding: '8px', border: '1px solid #ddd', direction: 'ltr' }}>{day.gregorianDateStr}</td>
                                <td style={{ padding: '8px', border: '1px solid #ddd', direction: 'ltr' }}>{formatTime12_clean(applyOffset(day.timings.Fajr, getOffset('Fajr')))}</td>
                                <td style={{ padding: '8px', border: '1px solid #ddd', direction: 'ltr' }}>{formatTime12_clean(applyOffset(day.timings.Dhuhr, getOffset('Dhuhr')))}</td>
                                <td style={{ padding: '8px', border: '1px solid #ddd', direction: 'ltr' }}>{formatTime12_clean(applyOffset(day.timings.Asr, getOffset('Asr')))}</td>
                                <td style={{ padding: '8px', border: '1px solid #ddd', direction: 'ltr' }}>{formatTime12_clean(applyOffset(day.timings.Maghrib, getOffset('Maghrib')))}</td>
                                <td style={{ padding: '8px', border: '1px solid #ddd', direction: 'ltr' }}>{formatTime12_clean(applyOffset(day.timings.Isha, getOffset('Isha')))}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            </div>
        </div>
    );
}

