import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TimeSheetEmployee } from '../types';
import { dualStorage, COLLECTIONS } from '../DualStorageService';
import { onSnapshot, query, collection, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Printer, Calendar, ChevronLeft, ChevronRight, FileSpreadsheet, Edit2, Trash2, Truck } from 'lucide-react';
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
        const filename = `Drivers_Tankers_Timesheet_${monthKey}`;
        captureAndExport("printable-drivers-tankers", (canvas) => {
            printOrDownloadPdf(canvas, filename, 'l');
        });
    };

    const handleExportPdf = () => {
        const filename = `Drivers_Tankers_Timesheet_${monthKey}`;
        captureAndExport("printable-drivers-tankers", (canvas) => {
            try {
                const imgData = canvas.toDataURL('image/jpeg', 0.85);
                const { jsPDF } = (window as any).jspdf || (window as any).jsPDF;
                const pdf = new jsPDF('l', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const ratio = canvas.width / canvas.height;
                let width = pdfWidth;
                let height = width / ratio;
                
                if (height > pdfHeight) { 
                    height = pdfHeight; 
                    width = height * ratio; 
                }
                const xOffset = (pdfWidth - width) / 2;
                const yOffset = (pdfHeight - height) / 2;
                pdf.addImage(imgData, 'JPEG', xOffset, yOffset, width, height, undefined, 'FAST');
                pdf.save(`${filename}.pdf`);
            } catch (err) {
                console.error("PDF generation failed:", err);
                alert("Failed to export PDF.");
            }
        });
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

    const handleExportExcel = async () => {
        const ExcelJS = (window as any).ExcelJS;
        if (!ExcelJS) {
            console.error("ExcelJS library is not loaded.");
            alert("ExcelJS library is not loaded. Please wait a moment and try again.");
            return;
        }

        const daysArray31 = Array.from({ length: 31 }, (_, i) => i + 1);

        const workbook = new ExcelJS.Workbook();
        const headerTitleFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB4C6E7' } };
        const fontBold = { bold: true };
        const borderStyle = { 
            top: { style: 'thin' }, left: { style: 'thin' }, 
            bottom: { style: 'thin' }, right: { style: 'thin' } 
        };

        const sheet = workbook.addWorksheet(`Drivers ${monthKey}`, { views: [{ rightToLeft: false }] });
        sheet.getCell(`A2`).value = `Drivers (Tankers) - ${currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
        sheet.getCell(`A2`).font = { bold: true, size: 12, color: { argb: 'FF1F3A60' } };
        
        let currentRow = 4;
        const blueFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00B0F0' } };
        const yellowFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDE047' } };
        const whiteFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
        
        // 1. Write NAME column with diagonal border (A4:A5)
        const cell4Name = sheet.getCell(4, 1);
        cell4Name.value = 'NAME';
        cell4Name.fill = whiteFill;
        cell4Name.font = { bold: true, size: 11, color: { argb: 'FF000000' } };
        cell4Name.alignment = { horizontal: 'center', vertical: 'middle', textRotation: 45 };
        const diagonalBorder = {
            top: { style: 'thin' }, left: { style: 'thin' }, 
            bottom: { style: 'thin' }, right: { style: 'thin' },
            diagonal: { up: true, down: false, style: 'thin', color: { argb: 'FF000000' } }
        };
        cell4Name.border = diagonalBorder as any;

        const cell5Name = sheet.getCell(5, 1);
        cell5Name.fill = whiteFill;
        cell5Name.border = diagonalBorder as any;
        
        sheet.mergeCells(4, 1, 5, 1);

        // 2. Write standard columns headers (B4:B5 to F4:F5) - CAPACITY (M3), TOTAL TRIPS, TRIPS ON DUTY, TRIPS O.T., OVERTIME
        const colHeaders = ['CAPACITY (M3)', 'TOTAL TRIPS', 'TRIPS ON DUTY', 'TRIPS O.T.', 'OVERTIME'];
        colHeaders.forEach((val, idx) => {
            const colIdx = idx + 2; // Start from Column B
            // Write to row 4
            const cell4 = sheet.getCell(4, colIdx);
            cell4.value = val;
            cell4.fill = whiteFill;
            cell4.font = { bold: true, size: 10, color: { argb: val === 'OVERTIME' ? 'FFFF0000' : 'FF000000' } };
            cell4.border = borderStyle as any;
            cell4.alignment = { horizontal: 'center', vertical: 'middle', textRotation: 90 };
            
            // Write to row 5
            const cell5 = sheet.getCell(5, colIdx);
            cell5.fill = whiteFill;
            cell5.border = borderStyle as any;
            
            // Merge row 4 & 5 for this column
            sheet.mergeCells(4, colIdx, 5, colIdx);
        });
        
        // Days Row 4 (Day Names)
        daysArray31.forEach(day => {
            const dName = getDayName(day);
            const isRed = dName === 'FRIDAY' || dName === 'SATURDAY';
            const colIdx = 6 + day;
            
            const cell4 = sheet.getCell(4, colIdx);
            cell4.value = dName;
            cell4.fill = blueFill;
            cell4.font = { bold: true, size: 9, color: { argb: isRed ? 'FFFF0000' : 'FF000000' } };
            cell4.border = borderStyle as any;
            cell4.alignment = { horizontal: 'center', vertical: 'middle', textRotation: 90 };
        });
        sheet.getRow(4).height = 90;
        
        // Days Row 5 (Day Numbers)
        daysArray31.forEach(day => {
            const colIdx = 6 + day;
            const cell5 = sheet.getCell(5, colIdx);
            cell5.value = day <= daysInMonth ? day : '';
            cell5.fill = yellowFill;
            cell5.font = { bold: true, size: 10, color: { argb: 'FF000000' } };
            cell5.border = borderStyle as any;
            cell5.alignment = { horizontal: 'center', vertical: 'middle' };
        });
        sheet.getRow(5).height = 22;
        
        currentRow = 6;
        
        activeEmployees.forEach((emp) => {
            const eData = (gridData?.employeesData?.[emp.id] || { capacity: '', totalTrips: '', tripsOnDuty: '', tripsOT: '', overtime: '', days: {} }) as any;
            const isDriver = (emp.jobTitle || '').includes('سائق شاحنه') || (emp.jobTitle || '').includes('سائق');
            
            if (isDriver) {
                // Write Row 1
                const row1Values: any[] = [
                    emp.englishName || emp.name,
                    eData.capacity,
                    '',
                    '',
                    '',
                    eData.overtime
                ];
                daysArray31.forEach(day => {
                    row1Values.push(eData.days?.[`${day}_1`] || '');
                });
                
                row1Values.forEach((val, cIdx) => {
                    const cell = sheet.getCell(currentRow, cIdx + 1);
                    cell.value = val;
                    cell.border = borderStyle as any;
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                    cell.font = { size: 8 };
                    if (cIdx === 0) {
                        cell.font = { bold: true, size: 10 };
                        cell.alignment = { horizontal: 'left', vertical: 'middle' };
                    }
                });
                sheet.getRow(currentRow).height = 14;
                currentRow++;
                
                // Write Row 2
                const row2Values: any[] = [
                    '',
                    '',
                    eData.totalTrips,
                    '',
                    eData.tripsOT,
                    ''
                ];
                daysArray31.forEach(day => {
                    row2Values.push(eData.days?.[`${day}_2`] || '');
                });
                row2Values.forEach((val, cIdx) => {
                    const cell = sheet.getCell(currentRow, cIdx + 1);
                    cell.value = val;
                    cell.border = borderStyle as any;
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                    cell.font = { size: 8 };
                });
                sheet.getRow(currentRow).height = 14;
                currentRow++;
                
                // Write Row 3
                const row3Values: any[] = [
                    '',
                    '',
                    '',
                    eData.tripsOnDuty,
                    '',
                    ''
                ];
                daysArray31.forEach(day => {
                    row3Values.push(eData.days?.[`${day}_3`] || '');
                });
                row3Values.forEach((val, cIdx) => {
                    const cell = sheet.getCell(currentRow, cIdx + 1);
                    cell.value = val;
                    cell.border = borderStyle as any;
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                    cell.font = { size: 8 };
                });
                sheet.getRow(currentRow).height = 14;
                currentRow++;
                
                // Merge name cell across the 3 rows
                sheet.mergeCells(currentRow - 3, 1, currentRow - 1, 1);
            } else {
                // Not a driver, write 1 row
                const rowValues: any[] = [
                    emp.englishName || emp.name,
                    '',
                    '',
                    '',
                    '',
                    eData.overtime
                ];
                daysArray31.forEach(day => {
                    rowValues.push(eData.days?.[`${day}_1`] || '');
                });
                rowValues.forEach((val, cIdx) => {
                    const cell = sheet.getCell(currentRow, cIdx + 1);
                    cell.value = val;
                    cell.border = borderStyle as any;
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                    cell.font = { size: 8 };
                    if (cIdx === 0) {
                        cell.font = { bold: true, size: 10 };
                        cell.alignment = { horizontal: 'left', vertical: 'middle' };
                    }
                });
                sheet.getRow(currentRow).height = 14;
                currentRow++;
            }
        });
        
        sheet.getColumn(1).width = 24;
        sheet.getColumn(2).width = 4.5;
        sheet.getColumn(3).width = 4.5;
        sheet.getColumn(4).width = 4.5;
        sheet.getColumn(5).width = 4.5;
        sheet.getColumn(6).width = 4.5;
        for(let i = 0; i < daysArray31.length; i++) {
            sheet.getColumn(7 + i).width = 3.5;
        }
        
        workbook.xlsx.writeBuffer().then((buffer: ArrayBuffer) => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const filename = `Drivers_Tankers_Timesheet_${monthKey}.xlsx`;
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        });
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
                
                <div className="flex items-center space-x-2">
                    {!isArchived && (
                        <button 
                            onClick={() => setShowPostConfirm(true)} 
                            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-lg shadow-sm transition-all text-sm h-10 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            <span>Post Current</span>
                        </button>
                    )}
                    <button 
                        onClick={handlePrint} 
                        className="flex items-center justify-center bg-indigo-600 text-white p-2.5 rounded-md hover:bg-indigo-700 shadow-sm transition-all hover:scale-105 h-10 w-10"
                        title="Print"
                    >
                        <Printer size={18} />
                    </button>
                    <button 
                        onClick={handleExportPdf} 
                        className="flex items-center justify-center bg-red-600 text-white p-2.5 rounded-md hover:bg-red-700 shadow-sm transition-all hover:scale-105 h-10 w-10"
                        title="Export PDF"
                    >
                        <Printer size={18} />
                    </button>
                    <button 
                        onClick={handleExportExcel} 
                        className="flex items-center justify-center bg-green-600 text-white p-2.5 rounded-md hover:bg-green-700 shadow-sm transition-all hover:scale-105 h-10 w-10"
                        title="Export Excel"
                    >
                        <FileSpreadsheet size={18} />
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <div id="printable-drivers-tankers" className="overflow-x-auto print:overflow-visible pb-12 w-full" ref={tableRef}>
                    <div className="px-[0.5cm] w-full min-w-[1200px] bg-white">
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
                            
                            /* Ensure table headers are printed at custom larger font sizes */
                            th.header-name-th div {
                                font-size: 16px !important;
                                font-weight: 900 !important;
                            }
                            th.header-col-th span {
                                font-size: 11px !important;
                                font-weight: 900 !important;
                            }
                            th.header-day-th span {
                                font-size: 9px !important;
                                font-weight: 900 !important;
                            }
                            th.header-num-th {
                                font-size: 11px !important;
                                font-weight: 900 !important;
                                text-align: center !important;
                                vertical-align: middle !important;
                                line-height: 1 !important;
                                padding: 0 !important;
                                height: 24px !important;
                            }
                            th.header-num-th div {
                                display: flex !important;
                                align-items: center !important;
                                justify-content: center !important;
                                height: 100% !important;
                                width: 100% !important;
                                margin: 0 !important;
                                padding: 0 !important;
                            }
                            td.print-name-td {
                                font-size: 12.5px !important;
                                font-weight: 900 !important;
                                text-align: left !important;
                                vertical-align: middle !important;
                                line-height: 1.2 !important;
                                padding: 4px 8px !important;
                            }
                            td.print-name-td div {
                                display: flex !important;
                                align-items: center !important;
                                justify-content: flex-start !important;
                                height: 100% !important;
                                width: 100% !important;
                            }
                        }
                        
                        /* On-screen and fallback centering styles */
                        th.header-num-th {
                            font-size: 12px !important;
                            font-weight: 900 !important;
                            text-align: center !important;
                            vertical-align: middle !important;
                            line-height: 1 !important;
                            padding: 0 !important;
                            height: 24px !important;
                        }
                        th.header-num-th div {
                            display: flex !important;
                            align-items: center !important;
                            justify-content: center !important;
                            height: 100% !important;
                            width: 100% !important;
                        }
                        td.print-name-td {
                            font-size: 12.5px !important;
                            font-weight: 900 !important;
                            text-align: left !important;
                            vertical-align: middle !important;
                            line-height: 1.2 !important;
                            padding: 4px 8px !important;
                        }
                        td.print-name-td div {
                            display: flex !important;
                            align-items: center !important;
                            justify-content: flex-start !important;
                            height: 100% !important;
                            width: 100% !important;
                        }
                        `}
                    </style>
                    <div className="print-only" style={{ height: '0.5cm', width: '100%' }}></div>
                    {/* Print Header Banner */}
                    <div className="print-only mb-4" style={{ width: '100%' }}>
                        <div className="bg-[#2563eb] text-white rounded-lg p-4 flex items-center gap-4">
                            <div className="border-2 border-white/40 bg-white/20 rounded-xl px-5 py-2 font-black text-2xl tracking-wider lowercase">
                                swc
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold tracking-tight">Sweet Water Company LTD</span>
                                    <Truck className="w-6 h-6" />
                                </div>
                                <span className="text-sm font-light text-blue-50">Employee Overtime</span>
                            </div>
                        </div>
                    </div>
                    <table className="w-full border-collapse min-w-[1200px] border border-black table-fixed text-xs print-text-xs">
                        <thead>
                            <tr>
                                <th className="border-b-2 border-r border-black p-0 relative bg-white w-40 h-[120px] align-middle header-name-th" rowSpan={2}>
                                    <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                                        <line x1="0" y1="100%" x2="35%" y2="0" stroke="black" strokeWidth="1.5" />
                                        <line x1="35%" y1="0" x2="100%" y2="0" stroke="black" strokeWidth="1.5" />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center font-black text-[18px] transform -rotate-45 pointer-events-none select-none">
                                        NAME
                                    </div>
                                </th>
                                <th className="border border-black p-0 bg-white w-6 align-middle uppercase header-col-th" rowSpan={2}>
                                    <div className="relative h-24 w-full flex items-center justify-center">
                                        <span className="absolute transform -rotate-90 whitespace-nowrap text-[11.5px] font-black tracking-wider">
                                            CAPACITY (M3)
                                        </span>
                                    </div>
                                </th>
                                <th className="border border-black p-0 bg-white w-6 align-middle uppercase header-col-th" rowSpan={2}>
                                    <div className="relative h-24 w-full flex items-center justify-center">
                                        <span className="absolute transform -rotate-90 whitespace-nowrap text-[11.5px] font-black tracking-wider">
                                            TOTAL TRIPS
                                        </span>
                                    </div>
                                </th>
                                <th className="border border-black p-0 bg-white w-6 align-middle uppercase header-col-th" rowSpan={2}>
                                    <div className="relative h-24 w-full flex items-center justify-center">
                                        <span className="absolute transform -rotate-90 whitespace-nowrap text-[11.5px] font-black tracking-wider">
                                            TRIPS ON DUTY
                                        </span>
                                    </div>
                                </th>
                                <th className="border border-black p-0 bg-white w-6 align-middle uppercase header-col-th" rowSpan={2}>
                                    <div className="relative h-24 w-full flex items-center justify-center">
                                        <span className="absolute transform -rotate-90 whitespace-nowrap text-[11.5px] font-black tracking-wider">
                                            TRIPS O.T.
                                        </span>
                                    </div>
                                </th>
                                <th className="border border-black p-0 bg-white text-red-600 w-6 align-middle uppercase header-col-th" rowSpan={2}>
                                    <div className="relative h-24 w-full flex items-center justify-center">
                                        <span className="absolute transform -rotate-90 whitespace-nowrap text-[11.5px] font-black tracking-wider text-red-600">
                                            OVERTIME
                                        </span>
                                    </div>
                                </th>
                                {daysArray.map(day => {
                                    const dName = getDayName(day);
                                    const isRed = dName === 'FRIDAY' || dName === 'SATURDAY';
                                    return (
                                        <th key={`h1-${day}`} className={`border border-black p-0 align-middle bg-[#00b0f0] w-5 ${isRed ? 'text-red-600' : 'text-black'} header-day-th`}>
                                            <div className="relative h-24 w-full flex items-center justify-center">
                                                <span className={`absolute transform -rotate-90 whitespace-nowrap text-[9.5px] font-black tracking-wider ${isRed ? 'text-red-600' : 'text-black'}`}>
                                                    {dName}
                                                </span>
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                            <tr>
                                {daysArray.map(day => (
                                    <th 
                                        key={`h2-${day}`} 
                                        style={{ verticalAlign: 'middle', textAlign: 'center' }} 
                                        className="border border-black p-0 text-center align-middle font-black bg-yellow-300 text-[12px] header-num-th"
                                    >
                                        <div className="w-full h-full flex items-center justify-center">
                                            {day <= daysInMonth ? day : ''}
                                        </div>
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
                                            <td 
                                                style={{ borderBottom: '2px solid #000', borderRight: '1px solid #000', verticalAlign: 'middle', textAlign: 'left' }} 
                                                className="p-1 font-black text-red-600 uppercase text-left align-middle bg-white text-[12.5px] print-name-td" 
                                                rowSpan={rowSpan}
                                            >
                                                <div className="w-full h-full flex items-center justify-start">
                                                    {emp.englishName || emp.name}
                                                </div>
                                            </td>
                                            <td style={{ borderBottom: borderBottom, borderRight: '1px dashed #9ca3af' }} className="p-0 text-center relative h-5 bg-white">
                                                {isDriver && (
                                                    <input
                                                        type="text"
                                                        data-row={activeEmployees.indexOf(emp) * 3}
                                                        data-col={0}
                                                        onKeyDown={(e) => handleKeyDown(e, activeEmployees.indexOf(emp) * 3, 0)}
                                                        readOnly={isArchived}
                                                        value={eData.capacity}
                                                        onChange={(e) => handleDataChange(emp.id, 'capacity', e.target.value)}
                                                        className="w-full h-full text-center outline-none bg-transparent text-[10px] font-bold"
                                                    />
                                                )}
                                            </td>
                                            <td style={{ borderBottom: borderBottom, borderRight: '1px dashed #9ca3af' }} className="p-0 text-center relative h-5 bg-white"></td>
                                            <td style={{ borderBottom: borderBottom, borderRight: '1px dashed #9ca3af' }} className="p-0 text-center relative h-5 bg-white"></td>
                                            <td style={{ borderBottom: borderBottom, borderRight: '1px dashed #9ca3af' }} className="p-0 text-center relative h-5 bg-white"></td>
                                            <td style={{ borderBottom: borderBottom, borderRight: '1px solid #000' }} className="p-0 text-center relative font-bold text-red-600 h-5 bg-white">
                                                <input
                                                    type="text"
                                                    value={eData.overtime}
                                                    readOnly
                                                    className="w-full h-full text-center outline-none bg-transparent font-bold text-red-600 text-[10px]"
                                                />
                                            </td>
                                            {daysArray.map(day => (
                                                <td key={`d1-${day}`} style={{ borderBottom: borderBottom, borderRight: day === daysInMonth ? '1px solid #000' : '1px dashed #9ca3af' }} className="p-0 text-center relative h-5 bg-white">
                                                    {day <= daysInMonth && (
                                                        <input
                                                            type="text"
                                                            value={eData.days[`${day}_1`] || ''}
                                                            data-row={activeEmployees.indexOf(emp) * 3}
                                                            data-col={day + 4}
                                                            onKeyDown={(e) => handleKeyDown(e, activeEmployees.indexOf(emp) * 3, day + 4)}
                                                            readOnly={isArchived}
                                                            onChange={(e) => handleDataChange(emp.id, `${day}_1`, e.target.value)}
                                                            className={`w-full h-full text-center outline-none bg-transparent text-[10px] font-bold ${isWeekend(getDayName(day)) ? 'text-red-600' : ''}`}
                                                        />
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                        {isDriver && (
                                            <>
                                                <tr>
                                                    <td style={{ borderBottom: '1px dashed #9ca3af', borderRight: '1px dashed #9ca3af' }} className="p-0 bg-white h-5"></td>
                                                    <td style={{ borderBottom: '1px dashed #9ca3af', borderRight: '1px dashed #9ca3af' }} className="p-0 text-center relative h-5 bg-white">
                                                        <input
                                                            type="text"
                                                            value={eData.totalTrips}
                                                            readOnly
                                                            className="w-full h-full text-center outline-none bg-transparent text-[10px] font-bold"
                                                        />
                                                    </td>
                                                    <td style={{ borderBottom: '1px dashed #9ca3af', borderRight: '1px dashed #9ca3af' }} className="p-0 text-center relative h-5 bg-white"></td>
                                                    <td style={{ borderBottom: '1px dashed #9ca3af', borderRight: '1px dashed #9ca3af' }} className="p-0 text-center relative h-5 bg-white">
                                                        <input
                                                            type="text"
                                                            value={eData.tripsOT}
                                                            readOnly
                                                            className="w-full h-full text-center outline-none bg-transparent text-[10px] font-bold"
                                                        />
                                                    </td>
                                                    <td style={{ borderBottom: '1px dashed #9ca3af', borderRight: '1px solid #000' }} className="p-0 bg-white h-5"></td>
                                                    {daysArray.map(day => (
                                                        <td key={`d2-${day}`} style={{ borderBottom: '1px dashed #9ca3af', borderRight: day === daysInMonth ? '1px solid #000' : '1px dashed #9ca3af' }} className="p-0 text-center relative h-5 bg-white">
                                                            {day <= daysInMonth && (
                                                                <input
                                                                    type="text"
                                                                    value={eData.days[`${day}_2`] || ''}
                                                                    data-row={activeEmployees.indexOf(emp) * 3 + 1}
                                                                    data-col={day + 4}
                                                                    onKeyDown={(e) => handleKeyDown(e, activeEmployees.indexOf(emp) * 3 + 1, day + 4)}
                                                                    readOnly={isArchived}
                                                                    onChange={(e) => handleDataChange(emp.id, `${day}_2`, e.target.value)}
                                                                    className="w-full h-full text-center outline-none bg-transparent text-[10px] font-bold text-gray-800"
                                                                />
                                                            )}
                                                        </td>
                                                    ))}
                                                </tr>
                                                <tr>
                                                    <td style={{ borderBottom: '2px solid #000', borderRight: '1px dashed #9ca3af' }} className="p-0 bg-white h-5"></td>
                                                    <td style={{ borderBottom: '2px solid #000', borderRight: '1px dashed #9ca3af' }} className="p-0 bg-white h-5"></td>
                                                    <td style={{ borderBottom: '2px solid #000', borderRight: '1px dashed #9ca3af' }} className="p-0 text-center relative h-5 bg-white">
                                                        <input
                                                            type="text"
                                                            value={eData.tripsOnDuty}
                                                            readOnly
                                                            className="w-full h-full text-center outline-none bg-transparent text-[10px] font-bold"
                                                        />
                                                    </td>
                                                    <td style={{ borderBottom: '2px solid #000', borderRight: '1px dashed #9ca3af' }} className="p-0 bg-white h-5"></td>
                                                    <td style={{ borderBottom: '2px solid #000', borderRight: '1px solid #000' }} className="p-0 bg-white h-5"></td>
                                                    {daysArray.map(day => (
                                                        <td key={`d3-${day}`} style={{ borderBottom: '2px solid #000', borderRight: day === daysInMonth ? '1px solid #000' : '1px dashed #9ca3af' }} className="p-0 text-center relative h-5 bg-white">
                                                            {day <= daysInMonth && (
                                                                <input
                                                                    type="text"
                                                                    value={eData.days[`${day}_3`] || ''}
                                                                    data-row={activeEmployees.indexOf(emp) * 3 + 2}
                                                                    data-col={day + 4}
                                                                    onKeyDown={(e) => handleKeyDown(e, activeEmployees.indexOf(emp) * 3 + 2, day + 4)}
                                                                    readOnly={isArchived}
                                                                    onChange={(e) => handleDataChange(emp.id, `${day}_3`, e.target.value)}
                                                                    className="w-full h-full text-center outline-none bg-transparent text-[10px] font-bold text-gray-800"
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
                    <div className="print-only" style={{ height: '0.5cm', width: '100%' }}></div>
                    </div>
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
