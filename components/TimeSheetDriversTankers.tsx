import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TimeSheetEmployee } from '../types';
import { dualStorage, COLLECTIONS } from '../DualStorageService';
import { onSnapshot, query, collection, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Printer, Calendar, ChevronLeft, ChevronRight, FileSpreadsheet, Edit2, Trash2 } from 'lucide-react';
import { captureAndExport, printOrDownloadPdf } from '../captureUtils';

interface Props {
    employees: TimeSheetEmployee[];
    title?: string;
    namesLanguage?: 'ar' | 'en';
}

interface DriversGridData {
    id: string;
    month: string; // YYYY-MM
    employeesData: Record<string, {
        capacity: string;
        totalTrips: string;
        tripsOnDuty: string;
        tripsOT: string;
        overtime: string;
        days: Record<string, string>;
    }>;
}

export default function TimeSheetDriversTankers({ employees, title = "DRIVERS (TANKERS)", namesLanguage = 'en' }: Props) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [gridData, setGridData] = useState<DriversGridData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const tableRef = useRef<HTMLDivElement>(null);

    const [showDatePicker, setShowDatePicker] = useState(false);
    const datePickerRef = useRef<HTMLDivElement>(null);
    const [pickerYear, setPickerYear] = useState(() => currentDate.getFullYear());
    const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthsAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setShowDatePicker(false);
            }
        }
        if (showDatePicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDatePicker]);

    const monthKey = useMemo(() => {
        return `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    }, [currentDate]);

    const activeEmployees = useMemo(() => {
        const filtered = employees.filter(emp => emp.isActive !== false && emp.showInDriversTab === true);
        return filtered.sort((a, b) => {
            const aIsDriver = (a.jobTitle || '').includes('سائق شاحنه') || (a.jobTitle || '').includes('سائق');
            const bIsDriver = (b.jobTitle || '').includes('سائق شاحنه') || (b.jobTitle || '').includes('سائق');
            if (aIsDriver && !bIsDriver) return -1;
            if (!aIsDriver && bIsDriver) return 1;
            return 0;
        });
    }, [employees]);

    useEffect(() => {
        setIsLoading(true);
        const q = query(
            collection(db, COLLECTIONS.RECORDS),
            where('type', '==', 'timesheet_drivers_tankers')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const loadedDocs = snapshot.docs.map(doc => ({ ...doc.data().data, _docId: doc.id })).filter((d: any) => d.month === monthKey);
                if (loadedDocs.length > 0) {
                    const docData = loadedDocs[0];
                    setGridData({ ...docData, id: docData._docId });
                } else {
                    setGridData(null);
                }
            } else {
                setGridData(null);
            }
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching drivers tankers data:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [monthKey]);

    const handlePreviousMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
    const handleNextMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));

    const handleDataChange = async (employeeId: string, field: 'capacity' | 'totalTrips' | 'tripsOnDuty' | 'tripsOT' | 'overtime' | string, value: string) => {
        let currentGrid = gridData;
        if (!currentGrid) {
            currentGrid = {
                id: `ts-dt-${monthKey}`,
                month: monthKey,
                employeesData: {}
            };
        }

        const empData = currentGrid.employeesData[employeeId] || {
            capacity: '',
            totalTrips: '',
            tripsOnDuty: '',
            tripsOT: '',
            overtime: '',
            days: {}
        };

        if (field.includes('_')) {
            empData.days[field] = value;
            
            // Auto-calculate sums
            let sum1 = 0, sum2 = 0, sum3 = 0;
            for (let i = 1; i <= 31; i++) {
                const v1 = parseFloat(empData.days[`${i}_1`]);
                if (!isNaN(v1)) sum1 += v1;
                
                const v2 = parseFloat(empData.days[`${i}_2`]);
                if (!isNaN(v2)) sum2 += v2;
                
                const v3 = parseFloat(empData.days[`${i}_3`]);
                if (!isNaN(v3)) sum3 += v3;
            }
            empData.overtime = sum1 > 0 ? sum1.toString() : '';
            empData.tripsOT = sum2 > 0 ? sum2.toString() : '';
            empData.tripsOnDuty = sum3 > 0 ? sum3.toString() : '';
            empData.totalTrips = (sum2 + sum3) > 0 ? (sum2 + sum3).toString() : '';

            // Sync with Overtime 2
            if (field.includes('_1')) {
                const dayStr = field.split('_')[0];
                const dayNum = parseInt(dayStr);
                if (!isNaN(dayNum)) {
                    try {
                        const ot2Id = `ts-grid-overtime2-${monthKey}`;
                        const records = dualStorage.getLocalData(COLLECTIONS.RECORDS) || [];
                        const ot2Record = records.find((r: any) => r.id === ot2Id);
                        let ot2Data = ot2Record ? ot2Record.data : { id: ot2Id, month: monthKey, employeesData: {} };
                        if (!ot2Data.employeesData) ot2Data.employeesData = {};
                        if (!ot2Data.employeesData[employeeId]) ot2Data.employeesData[employeeId] = { days: {}, statuses: {}, bonus: '', otTrips: '', rate: '' };
                        ot2Data.employeesData[employeeId].days[dayNum] = value;
                        
                        dualStorage.save(COLLECTIONS.RECORDS, ot2Id, {
                            type: 'timesheet_grid_overtime2',
                            data: ot2Data
                        }).finally(() => window.dispatchEvent(new Event('timesheet_updated')));
                    } catch (e) {
                        console.error('Failed to sync with Overtime 2', e);
                    }
                }
            }
        } else {
            empData[field as any] = value;
        }

        const newData = {
            ...currentGrid,
            employeesData: {
                ...currentGrid.employeesData,
                [employeeId]: empData
            }
        };

        setGridData(newData); // Optimistic UI

        dualStorage.save(COLLECTIONS.RECORDS, newData.id, {
            type: 'timesheet_drivers_tankers',
            data: newData
        }).finally(() => window.dispatchEvent(new Event('timesheet_updated'))).catch(error => {
            console.error("Error saving data:", error);
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const [isPosting, setIsPosting] = useState(false);
    const [showPostConfirm, setShowPostConfirm] = useState(false);

    // Check if current month is archived
    const isArchived = React.useMemo(() => {
        const records = dualStorage.getLocalData(COLLECTIONS.RECORDS) || [];
        const archiveId = `ts-archive-drivers-${monthKey}`;
        return records.some((r: any) => r.id === archiveId);
    }, [monthKey]);

    const handlePostDrivers = async () => {
        setIsPosting(true);
        try {
            const archiveId = `ts-archive-drivers-${monthKey}`;
            
            const archiveRecord = {
                id: archiveId,
                month: monthKey,
                postedAt: new Date().toISOString(),
                overtimeType: 'drivers',
                drivers: gridData,
                employees: activeEmployees
            };

            await dualStorage.save(COLLECTIONS.RECORDS, archiveId, {
                type: 'timesheet_posted_month',
                data: archiveRecord
            });

            // Also post Overtime 2 to sync archiving
            const ot2ArchiveId = `ts-archive-overtime2-${monthKey}`;
            const records = dualStorage.getLocalData(COLLECTIONS.RECORDS) || [];
            const hasOt2Archive = records.some((r: any) => r.id === ot2ArchiveId);
            if (!hasOt2Archive) {
                const ot2Record = records.find((r: any) => r.type === 'timesheet_grid_overtime2' && r.data.month === monthKey);
                const o2Data = ot2Record ? ot2Record.data : { id: `ts-grid-overtime2-${monthKey}`, month: monthKey, employeesData: {} };
                await dualStorage.save(COLLECTIONS.RECORDS, ot2ArchiveId, {
                    type: 'timesheet_posted_month',
                    data: {
                        id: ot2ArchiveId,
                        month: monthKey,
                        postedAt: new Date().toISOString(),
                        overtimeType: 'overtime2',
                        overtime2: o2Data,
                        employees: activeEmployees
                    }
                });
            }

            window.dispatchEvent(new Event('timesheet_grid_updated'));
            window.dispatchEvent(new Event('timesheet_grid_updated_remote'));
            setShowPostConfirm(false);
        } catch (error) {
            console.error("Error posting drivers sheet:", error);
            alert("Failed to post drivers sheet.");
        } finally {
            setIsPosting(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, rowIndex: number, colIndex: number) => {
        const key = e.key;
        if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(key)) return;
        
        let nextRow = rowIndex;
        let nextCol = colIndex;
        
        if (key === 'ArrowUp') nextRow--;
        if (key === 'ArrowDown' || key === 'Enter') nextRow++;
        if (key === 'ArrowLeft') nextCol--;
        if (key === 'ArrowRight') nextCol++;
        
        let nextInput = document.querySelector(`input[data-row="${nextRow}"][data-col="${nextCol}"]`) as HTMLInputElement;
        
        if (!nextInput) {
             if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'Enter') {
                 let step = (key === 'ArrowUp') ? -1 : 1;
                 let r = rowIndex + step;
                 while(r >= 0 && r < activeEmployees.length * 3) {
                     const el = document.querySelector(`input[data-row="${r}"][data-col="${nextCol}"]`) as HTMLInputElement;
                     if (el) {
                         nextInput = el;
                         break;
                     }
                     r += step;
                 }
             } else if (key === 'ArrowLeft' || key === 'ArrowRight') {
                 let step = (key === 'ArrowLeft') ? -1 : 1;
                 let c = colIndex + step;
                 while(c >= 0 && c <= 35) {
                     const el = document.querySelector(`input[data-row="${nextRow}"][data-col="${c}"]`) as HTMLInputElement;
                     if (el) {
                         nextInput = el;
                         break;
                     }
                     c += step;
                 }
             }
        }
    
        if (nextInput) {
            e.preventDefault();
            nextInput.focus();
            nextInput.select();
        }
    };

    const handleExportExcel = () => {
        // Excel export requires proper library which isn't available here, 
        // fallback to printing or let user copy
        alert('Please use the copy functionality (or print) for this table.');
    };

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const daysArray = Array.from({ length: 31 }, (_, i) => i + 1);

    const getDayName = (dayNumber: number) => {
        if (dayNumber > daysInMonth) return '';
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber);
        return date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    };

    const isWeekend = (dayName: string) => {
        return dayName === 'FRIDAY' || dayName === 'SATURDAY';
    };

    const displayMonthName = namesLanguage === 'ar'
        ? `${monthsAr[currentDate.getMonth()]} ${currentDate.getFullYear()}`
        : `${currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;

    return (
        <div className="w-full bg-white print:m-0 print:p-0">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 print:hidden gap-4 p-4 border-b">
                <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2 shadow-sm border border-gray-100 relative" ref={datePickerRef}>
                    <button
                        onClick={handlePreviousMonth}
                        className="p-1.5 hover:bg-gray-200 rounded text-gray-600 transition-colors"
                        title={namesLanguage === 'ar' ? 'الشهر السابق' : 'Previous Month'}
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    <button
                        onClick={() => {
                            setPickerYear(currentDate.getFullYear());
                            setShowDatePicker(!showDatePicker);
                        }}
                        className="flex items-center space-x-2 font-black text-indigo-700 text-lg px-4 py-1.5 bg-white rounded-md border border-gray-200 hover:border-indigo-400 focus:outline-none transition-all shadow-sm"
                        title={namesLanguage === 'ar' ? 'اختر الشهر' : 'Select Month'}
                    >
                        <span>{displayMonthName}</span>
                        <Calendar className="w-5 h-5 text-indigo-500" />
                    </button>

                    <button
                        onClick={handleNextMonth}
                        className="p-1.5 hover:bg-gray-200 rounded text-gray-600 transition-colors"
                        title={namesLanguage === 'ar' ? 'الشهر التالي' : 'Next Month'}
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>

                    {showDatePicker && (
                        <div className="absolute z-50 mt-1 top-full left-0 bg-white border border-gray-300 rounded-md shadow-lg p-3 w-64 no-print">
                            <div className="flex justify-between items-center mb-3">
                                <button onClick={() => setPickerYear(y => y - 1)} className="p-1 hover:bg-gray-100 rounded text-gray-600">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <span className="font-bold text-lg text-gray-800">{pickerYear}</span>
                                <button onClick={() => setPickerYear(y => y + 1)} className="p-1 hover:bg-gray-100 rounded text-gray-600">
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {Array.from({ length: 12 }).map((_, i) => {
                                    const mLabel = namesLanguage === 'ar' ? monthsAr[i] : monthsEn[i];
                                    const isSelected = pickerYear === currentDate.getFullYear() && i === currentDate.getMonth();
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                setCurrentDate(new Date(pickerYear, i, 1));
                                                setShowDatePicker(false);
                                            }}
                                            className={`py-2 text-xs rounded transition-colors font-semibold ${
                                                isSelected ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'hover:bg-indigo-100 text-gray-700'
                                            }`}
                                        >
                                            {mLabel}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="flex space-x-3">
                    {!isArchived && (
                        <button onClick={() => setShowPostConfirm(true)} className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 shadow-sm transition-all">
                            <span>Transfer to Archive</span>
                        </button>
                    )}
                    <button onClick={handlePrint} className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 shadow-sm transition-all">
                        <Printer size={18} />
                        <span>Print PDF</span>
                    </button>
                    <button onClick={handleExportExcel} className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 shadow-sm transition-all">
                        <FileSpreadsheet size={18} />
                        <span>Export Excel</span>
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <div className="overflow-x-auto print:overflow-visible pb-12 w-full" ref={tableRef}>
                    <style>
                        {`
                        @media print {
                            @page {
                                size: A4 landscape;
                                margin: 5mm;
                            }
                            table { page-break-inside: auto; }
                            tr { page-break-inside: avoid; page-break-after: auto; }
                            thead { display: table-header-group; }
                            tfoot { display: table-row-group; }
                            .print-text-xs { font-size: 8px !important; }
                        }
                        `}
                    </style>
                    <table className="w-full border-collapse min-w-[1200px] border border-black table-fixed text-xs print-text-xs">
                        <thead>
                            <tr>
                                <th className="border-b-2 border-r border-black p-0 relative bg-white w-40 h-[120px] align-middle" rowSpan={2}>
                                    <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                                        <line x1="0" y1="100%" x2="35%" y2="0" stroke="black" strokeWidth="1.5" />
                                        <line x1="35%" y1="0" x2="100%" y2="0" stroke="black" strokeWidth="1.5" />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center font-bold text-[15px] transform -rotate-45 pointer-events-none select-none">
                                        {namesLanguage === 'ar' ? 'الاسم' : 'NAME'}
                                    </div>
                                </th>
                                <th className="border border-black p-0 bg-white w-10 align-middle uppercase" rowSpan={2}>
                                    <div className="flex items-center justify-center h-full w-full">
                                        <div className="[writing-mode:vertical-rl] rotate-180 text-[12px] font-bold tracking-wider">CAPACITY (M3)</div>
                                    </div>
                                </th>
                                <th className="border border-black p-0 bg-white w-10 align-middle uppercase" rowSpan={2}>
                                    <div className="flex items-center justify-center h-full w-full">
                                        <div className="[writing-mode:vertical-rl] rotate-180 text-[12px] font-bold tracking-wider">TOTAL TRIPS</div>
                                    </div>
                                </th>
                                <th className="border border-black p-0 bg-white w-10 align-middle uppercase" rowSpan={2}>
                                    <div className="flex items-center justify-center h-full w-full">
                                        <div className="[writing-mode:vertical-rl] rotate-180 text-[12px] font-bold tracking-wider">TRIPS ON DUTY</div>
                                    </div>
                                </th>
                                <th className="border border-black p-0 bg-white w-10 align-middle uppercase" rowSpan={2}>
                                    <div className="flex items-center justify-center h-full w-full">
                                        <div className="[writing-mode:vertical-rl] rotate-180 text-[12px] font-bold tracking-wider">TRIPS O.T.</div>
                                    </div>
                                </th>
                                <th className="border border-black p-0 bg-white text-red-600 w-10 align-middle uppercase" rowSpan={2}>
                                    <div className="flex items-center justify-center h-full w-full">
                                        <div className="[writing-mode:vertical-rl] rotate-180 text-[12px] font-bold tracking-wider">OVERTIME</div>
                                    </div>
                                </th>
                                {daysArray.map(day => {
                                    const dName = getDayName(day);
                                    const isRed = dName === 'FRIDAY' || dName === 'SATURDAY';
                                    return (
                                        <th key={`h1-${day}`} className={`border border-black p-0 align-middle bg-[#00b0f0] w-6 ${isRed ? 'text-red-600' : 'text-black'}`}>
                                            <div className="flex items-center justify-center h-full w-full py-2">
                                                <div className="[writing-mode:vertical-rl] rotate-180 text-[12px] font-bold tracking-wider">{dName}</div>
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                            <tr>
                                {daysArray.map(day => (
                                    <th key={`h2-${day}`} className="border border-black p-1 text-center font-bold bg-yellow-300 text-[12px]">
                                        {day <= daysInMonth ? day : ''}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {activeEmployees.map((emp) => {
                                const eData = gridData?.employeesData[emp.id] || { capacity: '', totalTrips: '', tripsOnDuty: '', tripsOT: '', overtime: '', days: {} };
                                const isDriver = (emp.jobTitle || '').includes('سائق شاحنه') || (emp.jobTitle || '').includes('سائق');
                                const borderBottom = isDriver ? '1px dashed #9ca3af' : '2px solid #000';
                                const rowSpan = isDriver ? 3 : 1;

                                return (
                                    <React.Fragment key={emp.id}>
                                        <tr>
                                            <td style={{ borderBottom: '2px solid #000', borderRight: '1px solid #000' }} className="p-2 font-bold text-red-600 uppercase text-left align-middle bg-white" rowSpan={rowSpan}>
                                                {emp.englishName || emp.name}
                                            </td>
                                            <td style={{ borderBottom: borderBottom, borderRight: '1px dashed #9ca3af' }} className="p-0 text-center relative h-6 bg-white">
                                                {isDriver && (
                                                    <input
                                                        type="text"
                                                        data-row={activeEmployees.indexOf(emp) * 3}
                                                        data-col={0}
                                                        onKeyDown={(e) => handleKeyDown(e, activeEmployees.indexOf(emp) * 3, 0)}
                                                        readOnly={isArchived}
                                                        value={eData.capacity}
                                                        onChange={(e) => handleDataChange(emp.id, 'capacity', e.target.value)}
                                                        className="w-full h-full text-center outline-none bg-transparent text-[12px] font-bold"
                                                    />
                                                )}
                                            </td>
                                            <td style={{ borderBottom: borderBottom, borderRight: '1px dashed #9ca3af' }} className="p-0 text-center relative h-6 bg-white"></td>
                                            <td style={{ borderBottom: borderBottom, borderRight: '1px dashed #9ca3af' }} className="p-0 text-center relative h-6 bg-white"></td>
                                            <td style={{ borderBottom: borderBottom, borderRight: '1px dashed #9ca3af' }} className="p-0 text-center relative h-6 bg-white"></td>
                                            <td style={{ borderBottom: borderBottom, borderRight: '1px solid #000' }} className="p-0 text-center relative font-bold text-red-600 h-6 bg-white">
                                                <input
                                                    type="text"
                                                    value={eData.overtime}
                                                    readOnly
                                                    className="w-full h-full text-center outline-none bg-transparent font-bold text-red-600 text-[12px]"
                                                />
                                            </td>
                                            {daysArray.map(day => (
                                                <td key={`d1-${day}`} style={{ borderBottom: borderBottom, borderRight: day === daysInMonth ? '1px solid #000' : '1px dashed #9ca3af' }} className="p-0 text-center relative h-6 bg-white">
                                                    {day <= daysInMonth && (
                                                        <input
                                                            type="text"
                                                            value={eData.days[`${day}_1`] || ''}
                                                            data-row={activeEmployees.indexOf(emp) * 3}
                                                            data-col={day + 4}
                                                            onKeyDown={(e) => handleKeyDown(e, activeEmployees.indexOf(emp) * 3, day + 4)}
                                                            readOnly={isArchived}
                                                            onChange={(e) => handleDataChange(emp.id, `${day}_1`, e.target.value)}
                                                            className={`w-full h-full text-center outline-none bg-transparent text-[12px] font-bold ${isWeekend(getDayName(day)) ? 'text-red-600' : ''}`}
                                                        />
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                        {isDriver && (
                                            <>
                                                <tr>
                                                    <td style={{ borderBottom: '1px dashed #9ca3af', borderRight: '1px dashed #9ca3af' }} className="p-0 bg-white h-6"></td>
                                                    <td style={{ borderBottom: '1px dashed #9ca3af', borderRight: '1px dashed #9ca3af' }} className="p-0 text-center relative h-6 bg-white">
                                                        <input
                                                            type="text"
                                                            value={eData.totalTrips}
                                                            readOnly
                                                            className="w-full h-full text-center outline-none bg-transparent text-[12px] font-bold"
                                                        />
                                                    </td>
                                                    <td style={{ borderBottom: '1px dashed #9ca3af', borderRight: '1px dashed #9ca3af' }} className="p-0 text-center relative h-6 bg-white"></td>
                                                    <td style={{ borderBottom: '1px dashed #9ca3af', borderRight: '1px dashed #9ca3af' }} className="p-0 text-center relative h-6 bg-white">
                                                        <input
                                                            type="text"
                                                            value={eData.tripsOT}
                                                            readOnly
                                                            className="w-full h-full text-center outline-none bg-transparent text-[12px] font-bold"
                                                        />
                                                    </td>
                                                    <td style={{ borderBottom: '1px dashed #9ca3af', borderRight: '1px solid #000' }} className="p-0 bg-white h-6"></td>
                                                    {daysArray.map(day => (
                                                        <td key={`d2-${day}`} style={{ borderBottom: '1px dashed #9ca3af', borderRight: day === daysInMonth ? '1px solid #000' : '1px dashed #9ca3af' }} className="p-0 text-center relative h-6 bg-white">
                                                            {day <= daysInMonth && (
                                                                <input
                                                                    type="text"
                                                                    value={eData.days[`${day}_2`] || ''}
                                                                    data-row={activeEmployees.indexOf(emp) * 3 + 1}
                                                                    data-col={day + 4}
                                                                    onKeyDown={(e) => handleKeyDown(e, activeEmployees.indexOf(emp) * 3 + 1, day + 4)}
                                                                    readOnly={isArchived}
                                                                    onChange={(e) => handleDataChange(emp.id, `${day}_2`, e.target.value)}
                                                                    className="w-full h-full text-center outline-none bg-transparent text-[12px] font-bold text-gray-800"
                                                                />
                                                            )}
                                                        </td>
                                                    ))}
                                                </tr>
                                                <tr>
                                                    <td style={{ borderBottom: '2px solid #000', borderRight: '1px dashed #9ca3af' }} className="p-0 bg-white h-6"></td>
                                                    <td style={{ borderBottom: '2px solid #000', borderRight: '1px dashed #9ca3af' }} className="p-0 bg-white h-6"></td>
                                                    <td style={{ borderBottom: '2px solid #000', borderRight: '1px dashed #9ca3af' }} className="p-0 text-center relative h-6 bg-white">
                                                        <input
                                                            type="text"
                                                            value={eData.tripsOnDuty}
                                                            readOnly
                                                            className="w-full h-full text-center outline-none bg-transparent text-[12px] font-bold"
                                                        />
                                                    </td>
                                                    <td style={{ borderBottom: '2px solid #000', borderRight: '1px dashed #9ca3af' }} className="p-0 bg-white h-6"></td>
                                                    <td style={{ borderBottom: '2px solid #000', borderRight: '1px solid #000' }} className="p-0 bg-white h-6"></td>
                                                    {daysArray.map(day => (
                                                        <td key={`d3-${day}`} style={{ borderBottom: '2px solid #000', borderRight: day === daysInMonth ? '1px solid #000' : '1px dashed #9ca3af' }} className="p-0 text-center relative h-6 bg-white">
                                                            {day <= daysInMonth && (
                                                                <input
                                                                    type="text"
                                                                    value={eData.days[`${day}_3`] || ''}
                                                                    data-row={activeEmployees.indexOf(emp) * 3 + 2}
                                                                    data-col={day + 4}
                                                                    onKeyDown={(e) => handleKeyDown(e, activeEmployees.indexOf(emp) * 3 + 2, day + 4)}
                                                                    readOnly={isArchived}
                                                                    onChange={(e) => handleDataChange(emp.id, `${day}_3`, e.target.value)}
                                                                    className="w-full h-full text-center outline-none bg-transparent text-[12px] font-bold text-gray-800"
                                                                />
                                                            )}
                                                        </td>
                                                    ))}
                                                </tr>
                                            </>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                            {activeEmployees.length === 0 && (
                                <tr>
                                    <td colSpan={37} className="border border-black p-4 text-center text-gray-500">
                                        No drivers found for this tab. Please add them from the Employees list.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Post Confirmation Modal */}
            {showPostConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[400] no-print">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-100 text-left">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 p-6 pb-0">
                            Post to Archive
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed mb-6 px-6">
                            Are you sure you want to post the drivers timesheet of <span className="font-bold text-indigo-600">{currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}</span>? This will transfer the month to the List Overtime tab and immediately lock the data from further edits.
                        </p>
                        <div className="flex justify-end gap-3 px-6 pb-6">
                            <button
                                disabled={isPosting}
                                onClick={() => setShowPostConfirm(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={isPosting}
                                onClick={handlePostDrivers}
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
                            >
                                {isPosting ? 'Posting...' : 'Confirm & Post'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
