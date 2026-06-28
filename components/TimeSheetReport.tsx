import React, { useState, useEffect, useMemo } from 'react';
import { TimeSheetEmployee } from '../types';
import { dualStorage, COLLECTIONS } from '../DualStorageService';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { captureAndExport, printOrDownloadPdf } from '../captureUtils';
import { Printer, FileSpreadsheet, Copy, ClipboardPaste, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const STATUS_OPTIONS = [
    {
        key: 'sic_leave',
        en: 'Sic Leave',
        ar: 'إجازة مرضية',
        color: '#ffff00', // Bright Yellow
        textColor: '#000000'
    },
    {
        key: 'vacation',
        en: 'Vacation',
        ar: 'إجازة',
        color: '#7030a0', // Purple
        textColor: '#ffffff'
    },
    {
        key: 'happy_eid',
        en: 'Happy Eid',
        ar: 'عيد سعيد',
        color: '#834c24', // Brown
        textColor: '#ffffff'
    },
    {
        key: 'national_day',
        en: 'National Day',
        ar: 'اليوم الوطني',
        color: '#00b050', // Green
        textColor: '#ffffff'
    },
    {
        key: 'late',
        en: 'Late',
        ar: 'تأخير',
        color: '#ffc000', // Golden Orange
        textColor: '#000000'
    },
    {
        key: 'absence',
        en: 'Absence',
        ar: 'غياب',
        color: '#ff0000', // Red
        textColor: '#ffffff'
    }
];

interface Props {
    employees: TimeSheetEmployee[];
    title?: string;
    typeKey: string;
    namesLanguage?: 'ar' | 'en';
    currentUser?: any;
}

interface EmployeeGridData {
    bonus: string;
    otTrips: string;
    rate: string;
    days: Record<number, string>; // day index 1..31 to string value
    statuses?: Record<number, string>; // day index 1..31 to status option key
}

interface MonthlyGrid {
    id: string;
    month: string; // YYYY-MM
    employeesData: Record<string, EmployeeGridData>;
}

export default function TimeSheetReport({ employees, title = "Employee Overtime", typeKey, namesLanguage = 'ar', currentUser }: Props) {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const copyMenuRef = React.useRef<HTMLDivElement>(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    
    const [gridData, setGridData] = useState<MonthlyGrid | null>(() => {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const local = dualStorage.getLocalData(COLLECTIONS.RECORDS) || [];
        const record = local.find((r: any) => r && r.type === `timesheet_grid_${typeKey}` && r.data && r.data.month === currentMonth);
        return record ? (record.data as MonthlyGrid) : null;
    });

    const [isPosted, setIsPosted] = useState(() => {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const local = dualStorage.getLocalData(COLLECTIONS.RECORDS) || [];
        return local.some((r: any) => r && r.type === 'timesheet_posted_month' && r.data && r.data.month === currentMonth && r.data.overtimeType === typeKey);
    });

    const [showPostConfirm, setShowPostConfirm] = useState(false);
    const [isPosting, setIsPosting] = useState(false);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
    const [showCopyMenu, setShowCopyMenu] = useState(false);
    
    const [showDatePicker, setShowDatePicker] = useState(false);
    const datePickerRef = React.useRef<HTMLDivElement>(null);
    const [pickerYear, setPickerYear] = useState(() => parseInt(new Date().toISOString().slice(0, 4)));
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (copyMenuRef.current && !copyMenuRef.current.contains(event.target as Node)) {
                setShowCopyMenu(false);
            }
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setShowDatePicker(false);
            }
        }
        if (showCopyMenu || showDatePicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showCopyMenu, showDatePicker]);

    const [doubleClickMenu, setDoubleClickMenu] = useState<{
        empId: string;
        day: number;
        x: number;
        y: number;
    } | null>(null);

    useEffect(() => {
        const q = query(
            collection(db, COLLECTIONS.RECORDS),
            where('type', '==', 'timesheet_posted_month'),
            where('data.month', '==', selectedMonth),
            where('data.overtimeType', '==', typeKey)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setIsPosted(!snapshot.empty);
        });

        return () => unsubscribe();
    }, [selectedMonth, typeKey]);

    const isEditableMonth = useMemo(() => {
        const now = new Date();
        const currentMonthStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
        
        // If it's current month or future, it's always editable
        if (selectedMonth >= currentMonthStr) return true;
        
        return !isPosted; // Editable if NOT posted
    }, [selectedMonth, isPosted]);

    const getCellStyle = (empId: string, day: number, displayVal: string, isFriday: boolean) => {
        // 1. Check statuses field first
        const statusKey = gridData?.employeesData[empId]?.statuses?.[day];
        if (statusKey) {
            const matched = STATUS_OPTIONS.find(opt => opt.key === statusKey);
            if (matched) {
                return {
                    backgroundColor: matched.color,
                    color: '#000000',
                    fontWeight: 'bold' as const
                };
            }
        }

        // 2. Fallback to display text value matching for backward compatibility
        const valClean = (displayVal || '').trim().toLowerCase();
        if (valClean) {
            const matched = STATUS_OPTIONS.find(opt => 
                opt.en.toLowerCase() === valClean || 
                opt.ar.toLowerCase() === valClean
            );

            if (matched) {
                return {
                    backgroundColor: matched.color,
                    color: '#000000',
                    fontWeight: 'bold' as const
                };
            }
        }

        if (isFriday) {
            return {
                backgroundColor: '#00b0f0',
                color: '#000000'
            };
        }

        return {};
    };

    const handleCellDoubleClick = (e: React.MouseEvent, empId: string, day: number) => {
        if (!isEditableMonth) return;
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        setDoubleClickMenu({
            empId,
            day,
            x: rect.left + window.scrollX,
            y: rect.bottom + window.scrollY
        });
    };

    const currentYear = parseInt(selectedMonth.split('-')[0]);
    const currentMonth = parseInt(selectedMonth.split('-')[1]);
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const handlePostOvertime = async () => {
        setIsPosting(true);
        try {
            const records = dualStorage.getLocalData(COLLECTIONS.RECORDS) || [];
            const archiveId = `ts-archive-${typeKey}-${selectedMonth}`;

            if (typeKey === 'overtime1') {
                const ot1Record = records.find(r => r.type === 'timesheet_grid_overtime1' && r.data.month === selectedMonth);
                const o1Data = ot1Record ? ot1Record.data : { id: `ts-grid-overtime1-${selectedMonth}`, month: selectedMonth, employeesData: {} };

                const archiveRecord = {
                    id: archiveId,
                    month: selectedMonth,
                    postedAt: new Date().toISOString(),
                    overtimeType: 'overtime1',
                    overtime1: o1Data,
                    employees: employees
                };

                await dualStorage.save(COLLECTIONS.RECORDS, archiveId, {
                    type: 'timesheet_posted_month',
                    data: archiveRecord
                });

                const emptyO1 = {
                    id: o1Data.id,
                    month: selectedMonth,
                    employeesData: {}
                };

                await dualStorage.save(COLLECTIONS.RECORDS, emptyO1.id, {
                    type: 'timesheet_grid_overtime1',
                    data: emptyO1
                });
            } else {
                const ot2Record = records.find(r => r.type === 'timesheet_grid_overtime2' && r.data.month === selectedMonth);
                const o2Data = ot2Record ? ot2Record.data : { id: `ts-grid-overtime2-${selectedMonth}`, month: selectedMonth, employeesData: {} };

                const archiveRecord = {
                    id: archiveId,
                    month: selectedMonth,
                    postedAt: new Date().toISOString(),
                    overtimeType: 'overtime2',
                    overtime2: o2Data,
                    employees: employees
                };

                await dualStorage.save(COLLECTIONS.RECORDS, archiveId, {
                    type: 'timesheet_posted_month',
                    data: archiveRecord
                });

                const emptyO2 = {
                    id: o2Data.id,
                    month: selectedMonth,
                    employeesData: {}
                };

                await dualStorage.save(COLLECTIONS.RECORDS, emptyO2.id, {
                    type: 'timesheet_grid_overtime2',
                    data: emptyO2
                });
            }

            const [yearStr, monthStr] = selectedMonth.split('-');
            let year = parseInt(yearStr);
            let month = parseInt(monthStr);
            month += 1;
            if (month > 12) {
                month = 1;
                year += 1;
            }
            const nextMonth = `${year}-${month.toString().padStart(2, '0')}`;
            setSelectedMonth(nextMonth);

            window.dispatchEvent(new Event('timesheet_grid_updated'));
            window.dispatchEvent(new Event('timesheet_grid_updated_remote'));
            window.dispatchEvent(new Event('timesheet_posted_updated'));

            setShowPostConfirm(false);
        } catch (err) {
            console.error("Error posting overtime:", err);
        } finally {
            setIsPosting(false);
        }
    };

    useEffect(() => {
        const dateObj = new Date(currentYear, currentMonth - 1);
        const formattedMonth = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        window.dispatchEvent(new CustomEvent('timesheet_month_changed', { detail: formattedMonth }));
        return () => window.dispatchEvent(new CustomEvent('timesheet_month_changed', { detail: '' }));
    }, [selectedMonth]);

    // Load data when month changes - Real-time sync
    useEffect(() => {
        const q = query(
            collection(db, COLLECTIONS.RECORDS),
            where('type', '==', `timesheet_grid_${typeKey}`),
            where('data.month', '==', selectedMonth)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const loaded = snapshot.docs[0].data();
                setGridData(loaded.data);
            } else {
                setGridData({
                    id: `ts-grid-${typeKey}-${selectedMonth}`,
                    month: selectedMonth,
                    employeesData: {}
                });
            }
        });

        const handleUnposted = (e: any) => {
            if (e.detail?.tab === typeKey && e.detail?.month) {
                setSelectedMonth(e.detail.month);
            }
        };
        
        window.addEventListener('timesheet_unposted', handleUnposted);

        return () => {
            unsubscribe();
            window.removeEventListener('timesheet_unposted', handleUnposted);
        };
    }, [selectedMonth, typeKey]);


    const updateCell = (empId: string, field: 'bonus' | 'otTrips' | 'rate' | 'day', val: string, day?: number) => {
        if (!gridData) return;
        
        // Deep copy employeesData so we don't mutate state directly
        const newEmployeesData = { ...gridData.employeesData };
        if (!newEmployeesData[empId]) {
            newEmployeesData[empId] = { bonus: '', otTrips: '', rate: '', days: {}, statuses: {} };
        } else {
            newEmployeesData[empId] = { 
                ...newEmployeesData[empId],
                days: { ...newEmployeesData[empId].days },
                statuses: { ...(newEmployeesData[empId].statuses || {}) }
            };
        }
        
        if (field === 'day' && day) {
            newEmployeesData[empId].days[day] = val;
        } else if (field !== 'day') {
            newEmployeesData[empId][field] = val;
        }

        const newData = {
            ...gridData,
            employeesData: newEmployeesData
        };

        // Update local React state instantly
        setGridData(newData);

        // Save to dualStorage in background (non-blocking)
        dualStorage.save(COLLECTIONS.RECORDS, newData.id, {
            type: `timesheet_grid_${typeKey}`,
            data: newData
        }).catch(err => {
            console.error("Error saving grid cell:", err);
        });
    };

    const updateCellStatus = (empId: string, day: number, statusKey: string) => {
        if (!gridData) return;
        
        const newEmployeesData = { ...gridData.employeesData };
        if (!newEmployeesData[empId]) {
            newEmployeesData[empId] = { bonus: '', otTrips: '', rate: '', days: {}, statuses: {} };
        } else {
            newEmployeesData[empId] = { 
                ...newEmployeesData[empId],
                days: { ...newEmployeesData[empId].days },
                statuses: { ...(newEmployeesData[empId].statuses || {}) }
            };
        }
        
        if (statusKey) {
            newEmployeesData[empId].statuses = newEmployeesData[empId].statuses || {};
            newEmployeesData[empId].statuses[day] = statusKey;
        } else {
            if (newEmployeesData[empId].statuses) {
                delete newEmployeesData[empId].statuses[day];
            }
        }

        const newData = {
            ...gridData,
            employeesData: newEmployeesData
        };

        setGridData(newData);

        dualStorage.save(COLLECTIONS.RECORDS, newData.id, {
            type: `timesheet_grid_${typeKey}`,
            data: newData
        }).catch(err => {
            console.error("Error saving grid cell status:", err);
        });
    };

    const getCellValue = (empId: string, day: number) => {
        return gridData?.employeesData[empId]?.days[day] || '';
    };

    const calculateTotalHours = (empId: string) => {
        if (!gridData || !gridData.employeesData[empId]) return 0;
        const dData = gridData.employeesData[empId];
        return daysArray.reduce((sum, day) => {
            const val = parseFloat(dData.days[day] || '0');
            return sum + (isNaN(val) ? 0 : val);
        }, 0);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, row: number, col: number) => {
        let nextRow = row;
        let nextCol = col;

        if (e.key === 'ArrowRight') {
            nextCol += 1;
        } else if (e.key === 'ArrowLeft') {
            nextCol -= 1;
        } else if (e.key === 'ArrowDown') {
            nextRow += 1;
        } else if (e.key === 'ArrowUp') {
            nextRow -= 1;
        } else if (e.key === 'Enter') {
            nextCol += 1; // Default to next cell on Enter
        } else {
            return;
        }

        const container = containerRef.current;
        if (!container) return;

        let nextInput = container.querySelector(`input[data-row="${nextRow}"][data-col="${nextCol}"]`) as HTMLInputElement;
        
        // Wrap around for Enter
        if (!nextInput && e.key === 'Enter') {
            nextRow += 1;
            nextCol = 0;
            nextInput = container.querySelector(`input[data-row="${nextRow}"][data-col="${nextCol}"]`) as HTMLInputElement;
        }

        if (nextInput) {
            e.preventDefault();
            nextInput.focus();
            nextInput.select();
        }
    };

    const exportToExcel = async () => {
        if (!gridData) return;
        const ExcelJS = (window as any).ExcelJS;
        if (!ExcelJS) { console.error("ExcelJS library is not loaded."); return; }
        
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet(`${title} ${selectedMonth}`, { views: [{ rightToLeft: false }] });
        
        const headerTitleFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB4C6E7' } };
        const fontBold = { bold: true };
        const borderStyle = { 
            top: { style: 'thin' }, left: { style: 'thin' }, 
            bottom: { style: 'thin' }, right: { style: 'thin' } 
        };

        let currentRow = 2;
        sheet.getCell(`A${currentRow}`).value = `${title} - ${selectedMonth}`;
        sheet.getCell(`A${currentRow}`).font = { bold: true, size: 16, color: { argb: 'FFEA580C' } };
        currentRow += 2;

        const headers = ['No', 'Name', 'Job Title', 'Bonuses', 'O.T Trips', 'Total'];
        daysArray.forEach(day => headers.push(day.toString()));
        headers.push('Rate');

        headers.forEach((header, idx) => {
            const cell = sheet.getCell(currentRow, idx + 1);
            cell.value = header;
            cell.fill = headerTitleFill;
            cell.font = fontBold;
            cell.border = borderStyle as any;
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            if (header === 'Total') {
                cell.font = { bold: true, color: { argb: 'FFDC2626' }};
            }
            if (parseInt(header) >= 1 && parseInt(header) <= 31) {
                cell.font = { bold: true, color: { argb: 'FF800080' }};
            }
            if (header === 'Rate') {
                cell.font = { bold: true, color: { argb: 'FF800080' }};
            }
        });
        sheet.getRow(currentRow).height = 25;
        currentRow++;

        employees.forEach((emp, idx) => {
            const dData = gridData.employeesData[emp.id] || { bonus: '', otTrips: '', rate: '', days: {} };
            const total = calculateTotalHours(emp.id);
            
            const cellValues = [
                idx + 1,
                emp.name,
                emp.jobTitle,
                dData.bonus,
                dData.otTrips,
                total
            ];
            
            daysArray.forEach(day => {
                const isFriday = new Date(currentYear, currentMonth - 1, day).getDay() === 5;
                const cellVal = getCellValue(emp.id, day);
                cellValues.push({ value: cellVal, isFriday });
            });
            cellValues.push(dData.rate);

            cellValues.forEach((valData, cIdx) => {
                const cell = sheet.getCell(currentRow, cIdx + 1);
                cell.border = borderStyle as any;
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
                
                if (cIdx === 1) cell.alignment = { horizontal: 'right', vertical: 'middle' };

                if (typeof valData === 'object' && valData !== null && 'value' in valData) {
                    cell.value = valData.value;
                    if (valData.isFriday) {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00B0F0' } };
                    } else if (idx % 2 !== 0) {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE9F0FA' } };
                    }
                } else {
                    cell.value = valData as any;
                    if (idx % 2 !== 0) {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE9F0FA' } };
                    }
                }
                
                if (headers[cIdx] === 'Total') {
                    cell.font = { bold: true, color: { argb: 'FFDC2626' } };
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }; // keep total white bg
                }
                if (headers[cIdx] === 'Bonuses') {
                    cell.font = { bold: true, color: { argb: 'FFDC2626' } };
                }
                if (cIdx === 1) cell.font = { bold: true };
            });
            sheet.getRow(currentRow).height = 20;
            currentRow++;
        });

        sheet.getColumn(1).width = 5;
        sheet.getColumn(2).width = 25;
        sheet.getColumn(3).width = 15;
        sheet.getColumn(4).width = 10;
        sheet.getColumn(5).width = 10;
        sheet.getColumn(6).width = 10;
        for(let i = 0; i < daysArray.length; i++) {
            sheet.getColumn(7 + i).width = 5;
        }
        sheet.getColumn(7 + daysArray.length).width = 10;

        workbook.xlsx.writeBuffer().then(async (buffer: ArrayBuffer) => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const filename = `Timesheet_${typeKey}_${selectedMonth}.xlsx`;
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

    const handleCopyData = (employeeId?: string) => {
        if (!gridData) return;
        try {
            let dataToCopy: any = null;
            if (employeeId) {
                // Copy only specific employee
                dataToCopy = { [employeeId]: gridData.employeesData[employeeId] };
            } else {
                // Copy all
                dataToCopy = gridData.employeesData;
            }
            localStorage.setItem(`timesheet_clipboard_${typeKey}`, JSON.stringify(dataToCopy));
            alert("Data copied successfully!");
            setShowCopyMenu(false);
        } catch (err) {
            console.error("Error copying data:", err);
            alert("Failed to copy data.");
            setShowCopyMenu(false);
        }
    };

    const handlePasteData = () => {
        if (!gridData || !isEditableMonth) return;
        try {
            const copiedDataStr = localStorage.getItem(`timesheet_clipboard_${typeKey}`);
            if (!copiedDataStr) {
                alert("No data found to paste.");
                return;
            }
            
            const copiedEmployeesData = JSON.parse(copiedDataStr) as Record<string, EmployeeGridData>;
            const newEmployeesData = { ...gridData.employeesData };
            
            let pastedCount = 0;
            employees.forEach(emp => {
                const showInTab = typeKey === 'overtime1' ? emp.showInOvertime1 !== false : emp.showInOvertime2 !== false;
                if (emp.isActive && showInTab && copiedEmployeesData[emp.id]) {
                    const copiedEmpData = copiedEmployeesData[emp.id];
                    
                    const filteredDays: Record<number, string> = {};
                    if (copiedEmpData.days) {
                        Object.keys(copiedEmpData.days).forEach(dayKey => {
                            const val = copiedEmpData.days[parseInt(dayKey)];
                            if (val) {
                                const valClean = val.trim().toLowerCase();
                                const isStatusText = STATUS_OPTIONS.some(opt => 
                                    opt.en.toLowerCase() === valClean || 
                                    opt.ar.toLowerCase() === valClean
                                );
                                if (!isStatusText) {
                                    filteredDays[parseInt(dayKey)] = val;
                                }
                            }
                        });
                    }

                    newEmployeesData[emp.id] = {
                        bonus: copiedEmpData.bonus || '',
                        otTrips: copiedEmpData.otTrips || '',
                        rate: copiedEmpData.rate || '',
                        days: filteredDays,
                        statuses: newEmployeesData[emp.id]?.statuses || {}
                    };
                    pastedCount++;
                }
            });
            
            if (pastedCount === 0) {
                 alert("No matching employees found in copied data.");
                 return;
            }

            const newData = {
                ...gridData,
                employeesData: newEmployeesData
            };

            setGridData(newData);
            
            dualStorage.save(COLLECTIONS.RECORDS, newData.id, {
                type: `timesheet_grid_${typeKey}`,
                data: newData
            }).catch(err => {
                console.error("Error saving pasted data:", err);
            });
            
            alert(`Pasted data for ${pastedCount} employees.`);

        } catch (err) {
            console.error("Error pasting data:", err);
            alert("Failed to paste data.");
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (!gridData) return null;

    return (
        <div ref={containerRef} className="w-full space-y-4 px-1 sm:px-2 pb-8 pt-2 print:pt-0 print:m-0 print:p-0">
            <style>{`
                #printable-table-ts-${typeKey} tbody {
                    counter-reset: rowNumber;
                }
                #printable-table-ts-${typeKey} tbody tr {
                    counter-increment: rowNumber;
                }
                #printable-table-ts-${typeKey} tbody tr td.row-counter::before {
                    content: counter(rowNumber);
                }
            `}</style>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center print:hidden border-b pb-4 gap-4">
                <h1 className="text-3xl font-black tracking-tight text-orange-600">
                    {title} - {new Date(currentYear, currentMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h1>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative" ref={datePickerRef}>
                        <button
                            onClick={() => {
                                setPickerYear(parseInt(selectedMonth.split('-')[0]));
                                setShowDatePicker(!showDatePicker);
                            }}
                            className="flex items-center justify-between h-10 px-4 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm min-w-[150px]"
                            title="Select Month"
                        >
                            <span className="font-bold text-gray-700">{selectedMonth}</span>
                            <Calendar className="w-5 h-5 text-gray-500" />
                        </button>
                        {showDatePicker && (
                            <div className="absolute z-50 mt-1 right-0 sm:left-0 bg-white border border-gray-300 rounded-md shadow-lg p-3 w-64 no-print">
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
                                    {months.map((m, i) => {
                                        const isSelected = pickerYear === parseInt(selectedMonth.split('-')[0]) && i + 1 === parseInt(selectedMonth.split('-')[1]);
                                        return (
                                            <button
                                                key={m}
                                                onClick={() => {
                                                    const mm = String(i + 1).padStart(2, '0');
                                                    setSelectedMonth(`${pickerYear}-${mm}`);
                                                    setShowDatePicker(false);
                                                }}
                                                className={`py-2 text-sm rounded transition-colors ${
                                                    isSelected ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'hover:bg-indigo-100 text-gray-700 font-medium'
                                                }`}
                                            >
                                                {m}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative" ref={copyMenuRef}>
                            <button
                                onClick={() => setShowCopyMenu(!showCopyMenu)}
                                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-xl transition-all active:scale-95 shadow-md hover:shadow-lg h-[44px] group border-b-4 border-indigo-800"
                                title="Copy Data"
                            >
                                <Copy className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                <span className="hidden xs:inline">Copy</span>
                            </button>
                            {showCopyMenu && (
                                <div className="absolute z-50 mt-1 left-0 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto w-72 no-print">
                                    <button
                                        onClick={() => handleCopyData()}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm font-bold border-b border-gray-200 whitespace-nowrap"
                                    >
                                        All
                                    </button>
                                    {employees.filter(emp => typeKey === 'overtime1' ? emp.showInOvertime1 !== false : emp.showInOvertime2 !== false).filter(e => e.isActive).map(emp => (
                                        <button
                                            key={emp.id}
                                            onClick={() => handleCopyData(emp.id)}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-800 whitespace-nowrap"
                                        >
                                            {emp.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handlePasteData}
                            disabled={!isEditableMonth}
                            className={`flex items-center justify-center gap-2 ${isEditableMonth ? 'bg-teal-600 hover:bg-teal-700 border-teal-800 cursor-pointer' : 'bg-gray-400 border-gray-500 cursor-not-allowed opacity-70'} text-white font-bold py-2 px-3 rounded-xl transition-all shadow-md h-[44px] group border-b-4`}
                            title="Paste Data"
                        >
                            <ClipboardPaste className={`h-5 w-5 ${isEditableMonth ? 'group-hover:scale-110 transition-transform' : ''}`} />
                            <span className="hidden xs:inline">Paste</span>
                        </button>
                        <button
                            onClick={handlePrint}
                            className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-4 rounded-xl transition-all active:scale-95 shadow-md hover:shadow-lg h-[44px] min-w-[100px] group"
                            title="Print Report"
                        >
                            <Printer className="h-5 w-5 group-hover:scale-110 transition-transform" />
                            <span className="hidden xs:inline">Print</span>
                        </button>
                        <button
                            onClick={exportToExcel}
                            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl transition-all active:scale-95 shadow-md hover:shadow-lg h-[44px] min-w-[100px] group border-b-4 border-emerald-800"
                            title="Export to Excel"
                        >
                            <FileSpreadsheet className="h-5 w-5 group-hover:scale-110 transition-transform" />
                            <span className="hidden xs:inline">Excel</span>
                        </button>
                    </div>
                </div>
            </div>

            <div id={`printable-area-ts-${typeKey}`} className="overflow-x-auto bg-white border-y border-gray-200 mt-4 print:border-none print:shadow-none print:mt-0 print:overflow-visible print:min-w-fit">
                {/* Print-only exact replica of screen Header - English Only */}
                <div className="print-only w-full border border-gray-300 rounded-lg overflow-hidden mb-3">
                    {/* Main Blue Header Bar */}
                    <div className="print-header-main bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 text-white p-3 flex justify-between items-center" style={{ background: 'linear-gradient(to right, #1d4ed8, #2563eb, #0284c7) !important', color: '#ffffff !important' }}>
                        <div className="flex items-center gap-3">
                            <div className="print-header-logo bg-white/20 px-2 py-1 rounded border border-white/30 text-white font-black text-xs tracking-tighter" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2) !important', borderColor: 'rgba(255, 255, 255, 0.3) !important' }}>
                                SWC
                            </div>
                            <div>
                                <h1 className="text-sm font-bold tracking-tight text-white leading-tight flex items-center gap-1">
                                    Sweet Water Company LTD
                                </h1>
                                <p className="text-[10px] font-semibold text-blue-100 opacity-90">
                                    {typeKey === 'overtime1' 
                                        ? 'Overtime 1'
                                        : typeKey === 'overtime2'
                                        ? 'Overtime 2'
                                        : 'Employee Overtime'}
                                    {selectedMonth ? ' - ' + new Date(currentYear, currentMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Print Subtitle bar - English Only */}
                <div className="print-only w-full px-1 mb-2 text-left">
                    <h2 className="text-xl font-bold text-orange-600 print-subtitle-text" style={{ color: '#ea580c !important' }}>
                        {`Overtime - ${new Date(currentYear, currentMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}
                    </h2>
                </div>
                <table id={`printable-table-ts-${typeKey}`} className="min-w-full divide-y divide-gray-300 text-center print:w-full print:text-xs">
                    <thead className="bg-[#b4c6e7] print:bg-gray-200">
                        <tr>
                            <th className="px-1 py-2 text-xs font-bold text-gray-900 border border-gray-400 w-10">No</th>
                            <th className={`px-2 py-2 text-xs font-bold text-gray-900 border border-gray-400 whitespace-nowrap min-w-max ${namesLanguage === 'en' ? 'text-left' : 'text-right'}`}>Name</th>
                            <th className={`px-2 py-2 text-xs font-bold text-gray-900 border border-gray-400 whitespace-nowrap min-w-max ${namesLanguage === 'en' ? 'text-left' : 'text-right'}`}>Job Title</th>
                            <th className="px-2 py-2 text-xs font-bold text-gray-900 border border-gray-400 w-20">Bonuses</th>
                            <th className="px-1 py-2 text-xs font-bold text-gray-900 border border-gray-400 w-20">O.T Trips</th>
                            <th className="px-2 py-2 text-xs font-bold text-red-600 border border-gray-400 w-16">Total</th>
                            {daysArray.map(day => (
                                <th key={day} className="px-1 py-2 text-xs font-bold text-[#800080] border border-gray-400 w-10">
                                    {day}
                                </th>
                            ))}
                            <th className="px-2 py-2 text-xs font-bold text-[#800080] border border-gray-400 w-16">Rate</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {employees.map((emp, idx) => {
                            const dData = gridData.employeesData[emp.id] || { bonus: '', otTrips: '', rate: '', days: {} };
                            const isSelected = selectedEmployeeId === emp.id;
                            const bgStriped = isSelected
                                ? 'bg-amber-100 hover:bg-amber-200 print:bg-transparent'
                                : (idx % 2 === 0 ? 'bg-white' : 'bg-[#e9f0fa]');
                            const totalHours = calculateTotalHours(emp.id);
                            const isZeroHours = totalHours === 0;
                            
                            return (
                                <tr 
                                    key={emp.id} 
                                    onClick={() => setSelectedEmployeeId(prev => prev === emp.id ? null : emp.id)}
                                    className={`cursor-pointer hover:bg-yellow-50 transition-colors ${bgStriped} ${isZeroHours ? 'print:hidden' : ''}`}
                                >
                                    <td className="row-counter px-1 py-1 text-xs font-bold text-gray-900 border border-gray-300"></td>
                                    <td className={`px-2 py-1 text-xs font-bold text-gray-900 border border-gray-300 whitespace-nowrap ${namesLanguage === 'en' ? 'text-left' : 'text-right'}`}>{emp.name}</td>
                                    <td className="px-1 py-1 border border-gray-300 whitespace-nowrap">
                                        <div className={`w-full text-xs p-0 m-0 ${namesLanguage === 'en' ? 'text-left px-2' : 'text-right px-2'}`}>{emp.jobTitle}</div>
                                    </td>
                                    <td className="p-0 border border-gray-300 print:p-0">
                                        <div className="hidden ts-print-show w-full h-full items-center justify-center font-bold text-red-600 min-h-[24px]">
                                            {dData.bonus || ''}
                                        </div>
                                        <input
                                            type="text"
                                            data-row={idx}
                                            data-col={0}
                                            disabled={!isEditableMonth}
                                            onFocus={() => setSelectedEmployeeId(emp.id)}
                                            onKeyDown={(e) => handleKeyDown(e, idx, 0)}
                                            value={dData.bonus || ''}
                                            onChange={(e) => updateCell(emp.id, 'bonus', e.target.value)}
                                            className="w-full h-full min-h-[28px] text-center text-xs font-bold text-red-600 p-1 m-0 bg-transparent border-none outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50 ts-print-hide"
                                        />
                                    </td>
                                    <td className={`p-0 border border-gray-300 print:p-0 ${isSelected ? 'bg-transparent' : 'bg-white'}`}>
                                        <div className="hidden ts-print-show w-full h-full items-center justify-center font-bold text-indigo-700 min-h-[24px]">
                                            {dData.otTrips || ''}
                                        </div>
                                        <input
                                            type="text"
                                            data-row={idx}
                                            data-col={1}
                                            disabled={!isEditableMonth}
                                            onFocus={() => setSelectedEmployeeId(emp.id)}
                                            onKeyDown={(e) => handleKeyDown(e, idx, 1)}
                                            value={dData.otTrips || ''}
                                            onChange={(e) => updateCell(emp.id, 'otTrips', e.target.value)}
                                            className="w-full h-full min-h-[28px] text-center text-xs font-bold text-indigo-700 p-1 m-0 bg-transparent border-none outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50 ts-print-hide"
                                        />
                                    </td>
                                    <td className={`px-2 py-1 text-xs font-bold text-red-600 border border-gray-300 ${isSelected ? 'bg-transparent' : 'bg-white'}`}>
                                        {calculateTotalHours(emp.id)}
                                    </td>
                                    {daysArray.map(day => {
                                        const isFriday = new Date(currentYear, currentMonth - 1, day).getDay() === 5;
                                        const displayVal = getCellValue(emp.id, day);
                                        const cellStyle = getCellStyle(emp.id, day, displayVal, isFriday);

                                        return (
                                            <td key={day} className="p-0 border border-gray-300 print:p-0" style={cellStyle}>
                                                <div 
                                                    className="hidden ts-print-show w-full h-full items-center justify-center font-bold min-h-[24px]"
                                                    style={{ color: cellStyle.color || (displayVal !== '' ? '#111827' : undefined) }}
                                                >
                                                    {displayVal}
                                                </div>
                                                <input
                                                    type="text"
                                                    data-row={idx}
                                                    data-col={1 + day}
                                                    disabled={!isEditableMonth}
                                                    onDoubleClick={(e) => handleCellDoubleClick(e, emp.id, day)}
                                                    onFocus={() => setSelectedEmployeeId(emp.id)}
                                                    onKeyDown={(e) => handleKeyDown(e, idx, 1 + day)}
                                                    value={displayVal}
                                                    onChange={(e) => updateCell(emp.id, 'day', e.target.value, day)}
                                                    className="w-full h-full min-h-[28px] text-center text-xs font-bold p-1 m-0 bg-transparent border-none outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600 disabled:cursor-not-allowed ts-print-hide"
                                                    style={{ 
                                                        backgroundColor: cellStyle.backgroundColor,
                                                        color: cellStyle.color || (displayVal !== '' ? '#111827' : undefined) 
                                                    }}
                                                />
                                            </td>
                                        );
                                    })}
                                    <td className="p-0 border border-gray-300 print:p-0">
                                        <div className="hidden ts-print-show w-full h-full items-center justify-center font-medium min-h-[24px]">
                                            {dData.rate || ''}
                                        </div>
                                        <input
                                            type="text"
                                            data-row={idx}
                                            data-col={33}
                                            disabled={!isEditableMonth}
                                            onFocus={() => setSelectedEmployeeId(emp.id)}
                                            onKeyDown={(e) => handleKeyDown(e, idx, 33)}
                                            value={dData.rate || ''}
                                            onChange={(e) => updateCell(emp.id, 'rate', e.target.value)}
                                            className="w-full h-full min-h-[28px] text-center text-xs font-medium p-1 m-0 bg-transparent border-none outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50 ts-print-hide"
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Miniature status legend */}
                <div className="mt-4 flex justify-start px-1 print:mt-4">
                    <div className="flex border border-black overflow-hidden print:w-[350px] w-full max-w-[500px]">
                        {STATUS_OPTIONS.map((opt, oIdx) => {
                            const label = namesLanguage === 'en' ? opt.en : opt.ar;
                            return (
                                <div 
                                    key={opt.key}
                                    className={`flex-1 px-1 py-1 text-[10px] sm:text-xs font-bold text-black text-center whitespace-nowrap ${oIdx < STATUS_OPTIONS.length - 1 ? 'border-r border-black' : ''}`}
                                    style={{ backgroundColor: opt.color }}
                                >
                                    {label}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Approval signature section under the table */}
                <div className="mt-6 flex justify-end print:mt-8 px-4">
                    <div className={namesLanguage === 'en' ? 'text-left' : 'text-right'}>
                        <p className="text-lg font-bold text-green-700 print:text-sm border-t-2 border-green-600 pt-1 px-4 inline-block">
                            {namesLanguage === 'en' ? 'Approved' : 'Approved'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Post button */}
            <div className="flex justify-end pt-4 no-print border-t border-gray-100">
                <button
                    onClick={() => setShowPostConfirm(true)}
                    disabled={!isEditableMonth}
                    className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-lg shadow-sm transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    <span>Post Current Month Overtime</span>
                </button>
            </div>

            {/* Confirmation Modal */}
            {showPostConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[400] no-print">
                    <div 
                        dir="ltr" 
                        className={`bg-white rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-100 text-left`}
                    >
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            Post Current Month Overtime
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed mb-6">
                            Are you sure you want to post the overtime of <span className="font-bold text-indigo-600">{new Date(currentYear, currentMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>? This will save current data, clear inputs, and advance the month.
                        </p>
                        <div className={`flex justify-end space-x-3`}>
                            <button
                                disabled={isPosting}
                                onClick={() => setShowPostConfirm(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={isPosting}
                                onClick={handlePostOvertime}
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
                            >
                                {isPosting ? 'Posting...' : 'Confirm & Post'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {doubleClickMenu && (
                <>
                    {/* Backdrop to close the menu on click outside */}
                    <div 
                        className="fixed inset-0 z-[490] bg-transparent no-print" 
                        onClick={() => setDoubleClickMenu(null)}
                    />
                    <div 
                        className="absolute z-[500] bg-white border-2 border-black rounded shadow-lg overflow-hidden flex flex-col w-[120px] no-print"
                        style={{ 
                            left: `${doubleClickMenu.x}px`, 
                            top: `${doubleClickMenu.y}px` 
                        }}
                    >
                        {STATUS_OPTIONS.map(opt => {
                            const label = namesLanguage === 'en' ? opt.en : opt.ar;
                            return (
                                <button
                                    key={opt.key}
                                    onClick={() => {
                                        updateCellStatus(doubleClickMenu.empId, doubleClickMenu.day, opt.key);
                                        setDoubleClickMenu(null);
                                    }}
                                    className="w-full text-center py-1.5 px-1 text-xs font-bold border-b-2 border-black last:border-b-0 cursor-pointer hover:opacity-90 select-none"
                                    style={{ backgroundColor: opt.color, color: '#000000' }}
                                >
                                    {label}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => {
                                updateCell(doubleClickMenu.empId, 'day', '', doubleClickMenu.day);
                                updateCellStatus(doubleClickMenu.empId, doubleClickMenu.day, '');
                                setDoubleClickMenu(null);
                            }}
                            className="w-full text-center py-1.5 px-1 text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer select-none"
                        >
                            {namesLanguage === 'en' ? 'Clear' : 'Clear'}
                        </button>
                    </div>
                </>
            )}

            <style>{`
                input { outline: none; }
                input[type=number]::-webkit-inner-spin-button, 
                input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
                input[type=number] { -moz-appearance: textfield; }
                @media print {
                    @page { 
                        size: landscape; 
                        margin: 0.3cm !important; 
                    }
                    
                    /* Reset all parent layout margins/paddings on print to guarantee no blank/white gaps at the top */
                    html, body, #root, main {
                        margin: 0 !important;
                        padding: 0 !important;
                        min-height: auto !important;
                        height: auto !important;
                        background: white !important;
                    }
                    
                    /* Scale down the printable area to guarantee it fits on a single page */
                    #printable-area-ts-${typeKey} {
                        zoom: 100% !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 10px !important; /* Added small space on both sides */
                    }

                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    body { background: white !important; }
                    .no-print { display: none !important; }
                    .ts-print-hide { display: none !important; }
                    .ts-print-show { display: flex !important; }
                    
                    /* Print header compact styles */
                    .print-only { display: block !important; margin-bottom: 6px !important; }
                    
                    /* Custom subtitle style */
                    .print-subtitle-text {
                        font-size: 15px !important;
                        font-weight: bold !important;
                        color: #ea580c !important;
                        margin-top: 4px !important;
                        margin-bottom: 4px !important;
                    }
                    
                    /* Table compress styles */
                    table { width: 100% !important; border-collapse: collapse !important; margin: 0 !important; }
                    th, td { 
                        font-size: 11px !important; 
                        padding: 2px 2px !important; 
                        border: 1.5px solid black !important; 
                        line-height: 1.3 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    th {
                        padding-top: 6px !important; 
                        padding-bottom: 6px !important; 
                    }
                    td.print\:p-0, td[class*="print:p-0"] {
                        padding: 0 !important;
                    }
                    .ts-print-show {
                        padding: 1px 1px !important; 
                        min-height: 16px !important;
                    }
                    input { 
                        border: none !important; 
                        background: transparent !important; 
                        background-color: transparent !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        width: 100% !important; 
                        font-size: 11px !important; 
                        min-height: unset !important; 
                        height: 15px !important; 
                        padding: 0 !important; 
                        margin: 0 !important;
                        line-height: 1.3 !important;
                        color: inherit !important;
                        -webkit-appearance: none !important;
                        appearance: none !important;
                        box-shadow: none !important;
                    }
                    
                    /* Force background colors to print */
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    
                    /* Legend & Approved Section Compress */
                    .mt-4 { margin-top: 8px !important; }
                    .mt-6 { margin-top: 10px !important; }
                    .px-3 { padding-left: 6px !important; padding-right: 6px !important; }
                    .py-1.5 { padding-top: 2px !important; padding-bottom: 2px !important; }
                    .text-xs { font-size: 8px !important; }
                    .text-lg { font-size: 11px !important; }
                    
                    .bg-[#00b0f0] { background-color: #00b0f0 !important; }
                    .bg-[#e9f0fa] { background-color: #e9f0fa !important; }
                    .text-red-600 { color: #dc2626 !important; }
                }
            `}</style>
        </div>
    );
}
