import React, { useState, useRef } from 'react';
import BottomBar from '../components/BottomBar';
import { useTheme } from '../context/ThemeContext';
import ZakatCalculator from '../components/Calculators/ZakatCalculator';
import MawarithCalculator from '../components/Calculators/MawarithCalculator';
import KaffaratCalculator from '../components/Calculators/KaffaratCalculator';
import { Download, RefreshCw, Calculator } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface CalculatorsProps {
    onBack: () => void;
}

const Calculators: React.FC<CalculatorsProps> = ({ onBack }) => {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState<'zakat' | 'mawarith' | 'kaffarat'>('zakat');
    const contentRef = useRef<HTMLDivElement>(null);

    const handleExportPDF = async () => {
        if (!contentRef.current) return;
        try {
            const canvas = await html2canvas(contentRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: theme.isOriginal ? '#ffffff' : '#1a1a1a'
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`calculator_${activeTab}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };

    return (
        <div className="h-screen flex flex-col bg-transparent">
            {/* Header */}
            <header className="app-top-bar shadow-sm z-10">
                <div className="app-top-bar__inner flex justify-between items-center px-4">
                    <div className="flex-1"></div>
                    <div className="flex-2 text-center">
                        <h1 className="text-2xl font-kufi font-bold text-primary">الحاسبة الشاملة</h1>
                        <p className="text-xs opacity-80 font-cairo">زكاة، مواريث، كفارات</p>
                    </div>
                    <div className="flex-1 flex justify-end">
                        <button onClick={handleExportPDF} className="p-2 rounded-full hover:bg-primary/10 text-primary transition-colors" title="حفظ كـ PDF">
                            <Download size={20} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex px-4 pt-4 gap-2 font-cairo z-10">
                {[
                    { id: 'zakat', label: 'الزكاة', icon: 'fa-coins' },
                    { id: 'mawarith', label: 'المواريث', icon: 'fa-scale-balanced' },
                    { id: 'kaffarat', label: 'الكفارات', icon: 'fa-hand-holding-heart' }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 py-3 px-2 rounded-t-xl font-bold transition-all duration-300 flex flex-col items-center gap-1
                            ${activeTab === tab.id 
                                ? 'bg-primary text-white shadow-[0_-4px_10px_rgba(16,185,129,0.2)] scale-105 origin-bottom' 
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                        <i className={`fa-solid ${tab.icon} ${activeTab === tab.id ? 'text-lg' : 'text-base'}`}></i>
                        <span className="text-sm">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 pb-24 hide-scrollbar font-cairo bg-gray-50/50 dark:bg-black/20" ref={contentRef}>
                <div className="max-w-3xl mx-auto">
                    {activeTab === 'zakat' && <ZakatCalculator />}
                    {activeTab === 'mawarith' && <MawarithCalculator />}
                    {activeTab === 'kaffarat' && <KaffaratCalculator />}
                </div>
            </main>

            <BottomBar onHomeClick={onBack} onThemesClick={() => {}} showThemes={false} />
        </div>
    );
};

export default Calculators;
