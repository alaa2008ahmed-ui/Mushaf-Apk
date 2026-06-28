
import React from 'react';
import { Employee } from '../types';
import CustomDatePicker from './ui/CustomDatePicker';
import { Printer, FileSpreadsheet, FileText } from 'lucide-react';

interface FilterBarProps {
    invoiceCount: number;
    onPrint: () => void;
    onExportExcel: () => void;
    onExportPdf: () => void;
    workingDate: Date;
    onDateChange: (date: Date) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ 
    invoiceCount,
    onPrint,
    onExportExcel,
    onExportPdf,
    workingDate,
    onDateChange
}) => {
    // Manually format date as DD / MM / YYYY
    const day = workingDate.getDate().toString().padStart(2, '0');
    const month = (workingDate.getMonth() + 1).toString().padStart(2, '0');
    const year = workingDate.getFullYear();
    const formattedDate = `${day} / ${month} / ${year}`;

    const dayOfWeek = workingDate.toLocaleDateString('en-US', { weekday: 'long' });
    const buttonsDisabled = invoiceCount === 0;
    
    // Correctly handle date changes to avoid timezone issues.
    // Creates a date object based on the input's "YYYY-MM-DD" value in the user's local timezone.
    const handleDateChange = (dateStr: string) => {
        const localDate = new Date(`${dateStr}T00:00:00`);
        onDateChange(localDate);
    };

    // Correctly format the local workingDate into "YYYY-MM-DD" for the input value.
    const formatDateForInput = (date: Date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formattedDateForInput = formatDateForInput(workingDate);


    return (
        <div className="bg-white rounded-lg shadow-md mb-2 flex flex-col items-center justify-between gap-1 no-print relative z-10 sticky top-0 md:top-[160px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] py-1.5 px-4 z-20">
            <div className="flex flex-col md:flex-row items-center justify-between w-full no-print gap-2 md:gap-4">
                {/* Interactive controls for screen view */}
                <div className="flex items-center gap-2 w-full md:flex-1">
                    <div className="flex-grow md:flex-none md:w-40">
                        <CustomDatePicker
                            value={formattedDateForInput}
                            onChange={handleDateChange}
                            themeColor="#3b82f6"
                        />
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-blue-700 bg-blue-100 px-2 sm:px-3 py-1.5 rounded-lg pointer-events-none uppercase tracking-wider whitespace-nowrap h-[34px] flex items-center justify-center">
                        {dayOfWeek}
                    </span>
                </div>

                <div className="hidden md:flex flex-col md:flex-1 text-center items-center justify-center">
                    <h2 className="text-base sm:text-lg font-bold text-gray-800 leading-tight">Daily Sales</h2>
                    <p className="text-[10px] sm:text-xs font-semibold text-blue-600 leading-tight">{formattedDate}</p>
                </div>

                {/* Action Buttons */}
                <div id="filter-bar-actions" className="flex items-center justify-center md:justify-end gap-2 flex-wrap w-full md:flex-1 no-print">
                    <button
                        onClick={onPrint}
                        disabled={buttonsDisabled}
                        className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-4 rounded-xl transition-all active:scale-95 shadow-md hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed h-[44px] min-w-[100px] group"
                        title="Print Report / طباعة التقرير"
                    >
                        <Printer className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        <span className="hidden xs:inline">Print / طباعة</span>
                    </button>
                    <button
                        onClick={onExportExcel}
                        disabled={buttonsDisabled}
                        className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl transition-all active:scale-95 shadow-md hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed h-[44px] min-w-[100px] group border-b-4 border-emerald-800"
                        title="Export to Excel / تصدير إكسل"
                    >
                        <FileSpreadsheet className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        <span className="hidden xs:inline">Excel / إكسل</span>
                    </button>
                    <button
                        onClick={onExportPdf}
                        disabled={buttonsDisabled}
                        className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded-xl transition-all active:scale-95 shadow-md hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed h-[44px] min-w-[100px] group border-b-4 border-rose-800"
                        title="Export to PDF / تصدير بي دي إف"
                    >
                        <FileText className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        <span className="hidden xs:inline">PDF / بي دي إف</span>
                    </button>
                </div>
            </div>

            {/* Static info for print/pdf view */}
            <div className="print-only w-full border-b mb-4 pb-4">
                <div className="flex justify-between items-center text-base p-2">
                    <div>
                        <span className="font-bold text-gray-700">Date:</span>
                        <span className="ml-2 text-gray-800">{formattedDate} ({dayOfWeek})</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilterBar;
