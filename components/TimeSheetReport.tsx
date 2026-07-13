import React, { useState, useEffect, useMemo } from 'react';
import { TimeSheetEmployee } from '../types';
import { dualStorage, COLLECTIONS } from '../DualStorageService';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { captureAndExport, printOrDownloadPdf } from '../captureUtils';
import { Printer, FileSpreadsheet, Copy, ClipboardPaste, Calendar, ChevronLeft, ChevronRight, Plus, Edit2, Trash2, Eraser } from 'lucide-react';

const getContrastColor = (hexColor: string) => {
    let r = 0, g = 0, b = 0;
    if (hexColor.length === 4) {
        r = parseInt(hexColor[1] + hexColor[1], 16);
        g = parseInt(hexColor[2] + hexColor[2], 16);
        b = parseInt(hexColor[3] + hexColor[3], 16);
    } else if (hexColor.length === 7) {
        r = parseInt(hexColor.slice(1, 3), 16);
        g = parseInt(hexColor.slice(3, 5), 16);
        b = parseInt(hexColor.slice(5, 7), 16);
    }
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
};

const normalizeArabicName = (name: string) => {
    if (!name) return '';
    let n = name
        .replace(/أ|إ|آ/g, 'ا')
        .replace(/ة/g, 'ه')
        .replace(/ى/g, 'ي')
        .replace(/\s+/g, '')
        .trim();
    const aliases: Record<string, string> = {
        'جيميهاوقرفايو': 'جيميهاوقرقايو',
        'سنتاجكاتوراياداف': 'سنتراجكاتوراياداف',
        'جومبرجاراسيا': 'جوميرجاراسيا',
        'ماجومادارسويكوت': 'ماجومادارسوبكوت',
        'نعمانكبيرحسين': 'نعمانحسين'
    };
    return aliases[n] || n;
};

const normalizeEnglishName = (name: string) => {
    if (!name) return '';
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .trim();
};

const DEFAULT_STATUS_OPTIONS = [
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
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const saved = localStorage.getItem('payroll_selected_month_iso');
        if (saved && /^\d{4}-\d{2}$/.test(saved)) {
            return saved;
        }
        return new Date().toISOString().slice(0, 7);
    });

    useEffect(() => {
        const handlePayrollMonthChanged = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail && customEvent.detail !== selectedMonth) {
                setSelectedMonth(customEvent.detail);
            }
        };
        window.addEventListener('payroll_selected_month_changed', handlePayrollMonthChanged);
        return () => window.removeEventListener('payroll_selected_month_changed', handlePayrollMonthChanged);
    }, [selectedMonth]);

    useEffect(() => {
        window.dispatchEvent(new CustomEvent('timesheet_selected_month_changed', { detail: selectedMonth }));
    }, [selectedMonth]);
    
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
    const [showClearConfirm, setShowClearConfirm] = useState(false);
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

    const [statusOptions, setStatusOptions] = useState<any[]>(() => {
        try {
            const local = dualStorage.getLocalData(COLLECTIONS.RECORDS) || [];
            const record = local.find((r: any) => r && r.type === 'timesheet_status_options');
            if (record && record.data) {
                return record.data;
            }
            const stored = localStorage.getItem('timesheetStatusOptions');
            if (stored) return JSON.parse(stored);
            
            const oldStored = localStorage.getItem('timesheetCustomStatuses');
            if (oldStored) {
                const parsedOld = JSON.parse(oldStored);
                return [...DEFAULT_STATUS_OPTIONS, ...parsedOld];
            }
        } catch (e) {
            console.error(e);
        }
        return DEFAULT_STATUS_OPTIONS;
    });

    useEffect(() => {
        const q = query(
            collection(db, COLLECTIONS.RECORDS),
            where('type', '==', 'timesheet_status_options')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const loaded = snapshot.docs[0].data();
                if (loaded && loaded.data) {
                    setStatusOptions(loaded.data);
                    localStorage.setItem('timesheetStatusOptions', JSON.stringify(loaded.data));
                }
            }
        });

        return () => unsubscribe();
    }, []);

    const [showAddStatusMenu, setShowAddStatusMenu] = useState(false);
    const [showStatusForm, setShowStatusForm] = useState(false);
    const [editingStatusKey, setEditingStatusKey] = useState<string | null>(null);
    const [newStatusNameEn, setNewStatusNameEn] = useState('');
    const [newStatusNameAr, setNewStatusNameAr] = useState('');
    const [newStatusColor, setNewStatusColor] = useState('#000000');
    const menuRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowAddStatusMenu(false);
                setShowStatusForm(false);
            }
        };
        if (showAddStatusMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showAddStatusMenu]);

    const handleSaveCustomStatus = () => {
        if (!newStatusNameEn && !newStatusNameAr) return;
        const textColor = getContrastColor(newStatusColor);
        
        let updated;
        if (editingStatusKey) {
            updated = statusOptions.map(s => 
                s.key === editingStatusKey 
                    ? { ...s, en: newStatusNameEn || newStatusNameAr, ar: newStatusNameAr || newStatusNameEn, color: newStatusColor, textColor }
                    : s
            );
        } else {
            const newStatus = {
                key: `custom_${Date.now()}`,
                en: newStatusNameEn || newStatusNameAr,
                ar: newStatusNameAr || newStatusNameEn,
                color: newStatusColor,
                textColor
            };
            updated = [...statusOptions, newStatus];
        }
        
        setStatusOptions(updated);
        localStorage.setItem('timesheetStatusOptions', JSON.stringify(updated));
        dualStorage.save(COLLECTIONS.RECORDS, 'timesheet_status_options', { type: 'timesheet_status_options', data: updated });
        
        setEditingStatusKey(null);
        setNewStatusNameEn('');
        setNewStatusNameAr('');
        setNewStatusColor('#000000');
        setShowStatusForm(false);
    };

    const handleEditStatus = (status: any) => {
        setEditingStatusKey(status.key);
        setNewStatusNameEn(status.en);
        setNewStatusNameAr(status.ar);
        setNewStatusColor(status.color);
        setShowStatusForm(true);
    };

    const handleDeleteStatus = (key: string) => {
        const updated = statusOptions.filter(s => s.key !== key);
        setStatusOptions(updated);
        localStorage.setItem('timesheetStatusOptions', JSON.stringify(updated));
        dualStorage.save(COLLECTIONS.RECORDS, 'timesheet_status_options', { type: 'timesheet_status_options', data: updated });
        if (editingStatusKey === key) {
            setEditingStatusKey(null);
            setNewStatusNameEn('');
            setNewStatusNameAr('');
            setNewStatusColor('#000000');
        }
    };

    useEffect(() => {
        // Query only by type to avoid requiring a composite index
        const q = query(
            collection(db, COLLECTIONS.RECORDS),
            where('type', '==', 'timesheet_posted_month')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            let isCurrentMonthPosted = false;
            
            snapshot.docs.forEach(doc => {
                const data = doc.data().data;
                if (data.month === selectedMonth && data.overtimeType === typeKey) {
                    isCurrentMonthPosted = true;
                }
            });
            
            setIsPosted(isCurrentMonthPosted);
        });

        return () => unsubscribe();
    }, [selectedMonth, typeKey]);

    const isEditableMonth = useMemo(() => {
        if (isPosted) {
            return false;
        }
        return true;
    }, [isPosted]);

    const getCellStyle = (empId: string, day: number, displayVal: string, isFriday: boolean) => {
        // 1. Check statuses field first
        const statusKey = gridData?.employeesData[empId]?.statuses?.[day];
        if (statusKey) {
            const matched = statusOptions.find(opt => opt.key === statusKey);
            if (matched) {
                return {
                    backgroundColor: matched.color,
                    color: (matched as any).textColor || getContrastColor(matched.color),
                    fontWeight: 'bold' as const
                };
            }
        }

        // 2. Fallback to display text value matching for backward compatibility
        const valClean = (displayVal || '').trim().toLowerCase();
        if (valClean) {
            const matched = statusOptions.find(opt => 
                opt.en.toLowerCase() === valClean || 
                opt.ar.toLowerCase() === valClean
            );
            if (matched) {
                return {
                    backgroundColor: matched.color,
                    color: (matched as any).textColor || getContrastColor(matched.color),
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
            }

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
        // Query only by type to avoid requiring a composite index!
        const q = query(
            collection(db, COLLECTIONS.RECORDS),
            where('type', '==', `timesheet_grid_${typeKey}`)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const loadedDocs = snapshot.docs.map(doc => doc.data().data).filter(d => d.month === selectedMonth);
                if (loadedDocs.length > 0) {
                    // If multiple exist (due to previous bug creating new IDs), merge them or pick the one with most employees
                    let bestDoc = loadedDocs[0];
                    if (loadedDocs.length > 1) {
                        for (let i = 1; i < loadedDocs.length; i++) {
                            if (Object.keys(loadedDocs[i].employeesData || {}).length > Object.keys(bestDoc.employeesData || {}).length) {
                                bestDoc = loadedDocs[i];
                            }
                        }
                        
                        // Merge all into the bestDoc just to be safe
                        loadedDocs.forEach(doc => {
                            if (doc !== bestDoc && doc.employeesData) {
                                Object.keys(doc.employeesData).forEach(empId => {
                                    if (!bestDoc.employeesData[empId] || Object.keys(bestDoc.employeesData[empId].days || {}).length === 0) {
                                        bestDoc.employeesData[empId] = doc.employeesData[empId];
                                    }
                                });
                            }
                        });
                    }

                    setGridData(bestDoc);
                } else {
                    setGridData({
                        id: `ts-grid-${typeKey}-${selectedMonth}`,
                        month: selectedMonth,
                        employeesData: {}
                    });
                }
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


    const syncArchive = (newData: any) => {
        if (isPosted) {
            const archiveId = `ts-archive-${typeKey}-${selectedMonth}`;
            const records = dualStorage.getLocalData(COLLECTIONS.RECORDS) || [];
            const archiveRecord = records.find((r: any) => r.id === archiveId);
            if (archiveRecord && archiveRecord.data) {
                const updatedArchiveData = { ...archiveRecord.data };
                if (typeKey === 'overtime1') {
                    updatedArchiveData.overtime1 = newData;
                } else {
                    updatedArchiveData.overtime2 = newData;
                }
                dualStorage.save(COLLECTIONS.RECORDS, archiveId, {
                    type: 'timesheet_posted_month',
                    data: updatedArchiveData
                }).finally(() => window.dispatchEvent(new Event('timesheet_updated'))).catch(err => {
                    console.error("Error updating archive:", err);
                });
            }
        }
    };

    const updateCell = (empId: string, field: 'bonus' | 'otTrips' | 'rate' | 'day', val: string, day?: number) => {
        if (!gridData) return;
        
        let finalVal = val;
        let matchedStatusKey: string | undefined = undefined;

        if (field === 'day' && day) {
            const lastChar = val.slice(-1).toLowerCase();
            if (lastChar && /^[a-z]$/.test(lastChar)) {
                const matched = statusOptions.find(opt => opt.en.toLowerCase().startsWith(lastChar));
                if (matched) {
                    matchedStatusKey = matched.key;
                    finalVal = val.slice(0, -1);
                }
            }
        }

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
            newEmployeesData[empId].days[day] = finalVal;
            if (matchedStatusKey !== undefined) {
                newEmployeesData[empId].statuses[day] = matchedStatusKey;
            }
        } else if (field !== 'day') {
            newEmployeesData[empId][field] = finalVal;
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
        }).finally(() => window.dispatchEvent(new Event('timesheet_updated'))).catch(err => {
            console.error("Error saving grid cell:", err);
        });
        
        syncArchive(newData);
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
        }).finally(() => window.dispatchEvent(new Event('timesheet_updated'))).catch(err => {
            console.error("Error saving grid cell status:", err);
        });
        
        syncArchive(newData);
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

        // Add Grand Total row to Excel
        const excelGrandTotal = employees.reduce((sum, emp) => sum + calculateTotalHours(emp.id), 0);
        const totalRowValues = [
            '',
            'Total Hours',
            '',
            '',
            '',
            excelGrandTotal
        ];
        daysArray.forEach(() => totalRowValues.push(''));
        totalRowValues.push('');

        totalRowValues.forEach((val, cIdx) => {
            const cell = sheet.getCell(currentRow, cIdx + 1);
            cell.value = val;
            cell.font = fontBold;
            cell.border = borderStyle as any;
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F6FC' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            if (cIdx === 1) {
                cell.alignment = { horizontal: 'left', vertical: 'middle' };
            }
            if (cIdx === 5) {
                cell.font = { bold: true, color: { argb: 'FFDC2626' } };
            }
        });
        sheet.getRow(currentRow).height = 22;
        currentRow++;

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

    const handleClearAllData = () => {
        if (!gridData || !isEditableMonth) return;
        setShowClearConfirm(true);
    };

    const handleConfirmClear = () => {
        if (!gridData || !isEditableMonth) return;

        const newEmployeesData = { ...gridData.employeesData };
        
        employees.forEach(emp => {
            const showInTab = typeKey === 'overtime1' ? emp.showInOvertime1 !== false : emp.showInOvertime2 !== false;
            if (emp.isActive !== false && showInTab) {
                newEmployeesData[emp.id] = {
                    bonus: '',
                    otTrips: '',
                    rate: '',
                    days: {},
                    statuses: {}
                };
            }
        });

        const newData = {
            ...gridData,
            employeesData: newEmployeesData
        };

        setGridData(newData);
        
        dualStorage.save(COLLECTIONS.RECORDS, newData.id, {
            type: `timesheet_grid_${typeKey}`,
            data: newData
        }).finally(() => window.dispatchEvent(new Event('timesheet_updated'))).catch(err => {
            console.error("Error clearing grid:", err);
        });
        
        syncArchive(newData);
        setShowClearConfirm(false);
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
                if (emp.isActive !== false && showInTab && copiedEmployeesData[emp.id]) {
                    const copiedEmpData = copiedEmployeesData[emp.id];
                    
                    const filteredDays: Record<number, string> = {};
                    if (copiedEmpData.days) {
                        Object.keys(copiedEmpData.days).forEach(dayKey => {
                            const val = copiedEmpData.days[parseInt(dayKey)];
                            if (val) {
                                const valClean = val.trim().toLowerCase();
                                const isStatusText = statusOptions.some(opt => 
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
            }).finally(() => window.dispatchEvent(new Event('timesheet_updated'))).catch(err => {
                console.error("Error saving pasted data:", err);
            });
            
            syncArchive(newData);
            alert(`Pasted data for ${pastedCount} employees.`);

        } catch (err) {
            console.error("Error pasting data:", err);
            alert("Failed to paste data.");
        }
    };

    const handleExcelPaste = (e: React.ClipboardEvent<HTMLTableElement>) => {
        if (!isEditableMonth) return;

        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT') return;
        
        const rowAttr = target.getAttribute('data-row');
        const colAttr = target.getAttribute('data-col');
        if (rowAttr === null || colAttr === null) return;

        const clipboardData = e.clipboardData;
        if (!clipboardData) return;

        const pastedText = clipboardData.getData('text/plain');
        if (!pastedText) return;

        e.preventDefault();

        const rows = pastedText.split(/\r?\n/).filter(row => row.trim().length > 0);
        if (rows.length === 0) return;

        const newEmployeesData = { ...gridData?.employeesData } as Record<string, any>;
        let hasChanges = false;

        const visibleEmployees = employees.filter(emp => typeKey === 'overtime1' ? emp.showInOvertime1 !== false : emp.showInOvertime2 !== false).filter(e => e.isActive);
        const startRow = parseInt(rowAttr, 10);
        const startCol = parseInt(colAttr, 10);

        rows.forEach((rowText, rIndex) => {
            const targetRow = startRow + rIndex;
            if (targetRow >= visibleEmployees.length) return;

            const emp = visibleEmployees[targetRow];
            const empData = newEmployeesData[emp.id] || { bonus: '', otTrips: '', rate: '', days: {}, statuses: {} };
            const newEmpData = { ...empData, days: { ...empData.days } };

            const cells = rowText.split('\t');
            cells.forEach((cellText, cIndex) => {
                const targetCol = startCol + cIndex;
                const value = cellText.trim();

                if (targetCol === 0) {
                    newEmpData.bonus = value;
                    hasChanges = true;
                } else if (targetCol === 1) {
                    newEmpData.otTrips = value;
                    hasChanges = true;
                } else if (targetCol >= 2 && targetCol <= 32) {
                    const day = targetCol - 1;
                    if (day <= daysInMonth) {
                        newEmpData.days[day] = value;
                        hasChanges = true;
                    }
                } else if (targetCol === 33) {
                    newEmpData.rate = value;
                    hasChanges = true;
                }
            });

            newEmployeesData[emp.id] = newEmpData;
        });

        if (hasChanges && gridData) {
            const newData = {
                ...gridData,
                employeesData: newEmployeesData
            };
            setGridData(newData);
            
            dualStorage.save(COLLECTIONS.RECORDS, newData.id, {
                type: `timesheet_grid_${typeKey}`,
                data: newData
            }).finally(() => window.dispatchEvent(new Event('timesheet_updated'))).catch(err => {
                console.error("Error saving Excel pasted data:", err);
            });
            
            syncArchive(newData);
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
                            onClick={handleClearAllData}
                            disabled={!isEditableMonth}
                            className={`flex items-center justify-center gap-2 ${isEditableMonth ? 'bg-red-600 hover:bg-red-700 border-red-800 cursor-pointer' : 'bg-gray-400 border-gray-500 cursor-not-allowed opacity-70'} text-white font-bold py-2 px-3 rounded-xl transition-all shadow-md h-[44px] group border-b-4`}
                            title={namesLanguage === 'en' ? 'Clear Data' : 'مسح البيانات'}
                        >
                            <Eraser className={`h-5 w-5 ${isEditableMonth ? 'group-hover:scale-110 transition-transform' : ''}`} />
                            <span className="hidden xs:inline">{namesLanguage === 'en' ? 'Clear' : 'مسح'}</span>
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
                <table id={`printable-table-ts-${typeKey}`} className="min-w-full divide-y divide-gray-300 text-center print:w-full print:text-xs" onPaste={handleExcelPaste}>
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
                    <tfoot className="bg-[#f8fafc] print:bg-slate-50 border-t-2 border-gray-400 font-bold">
                        <tr>
                            <td className="px-2 py-1.5 text-xs font-bold text-gray-900 border border-gray-300 text-left" colSpan={3}>
                                Total Hours
                            </td>
                            <td className="px-1 py-1.5 border border-gray-300"></td>
                            <td className="px-1 py-1.5 border border-gray-300"></td>
                            <td className="px-2 py-1.5 text-xs font-extrabold text-red-600 border border-gray-300 font-mono">
                                {employees.reduce((sum, emp) => sum + calculateTotalHours(emp.id), 0)}
                            </td>
                            {daysArray.map(day => (
                                <td key={day} className="px-1 py-1.5 border border-gray-300"></td>
                            ))}
                            <td className="px-1 py-1.5 border border-gray-300"></td>
                        </tr>
                    </tfoot>
                </table>

                {/* Miniature status legend */}
                <div className="mt-4 flex justify-start px-1 print:mt-4 items-center">
                    <div className="flex border border-black overflow-hidden print:w-[350px] w-full max-w-[700px]">
                        {statusOptions.map((opt, oIdx) => {
                            const label = namesLanguage === 'en' ? opt.en : opt.ar;
                            return (
                                <div 
                                    key={opt.key}
                                    className={`flex-1 px-1 py-1 text-[10px] sm:text-xs font-bold text-center whitespace-nowrap ${oIdx < statusOptions.length - 1 ? 'border-r border-black' : ''}`}
                                    style={{ backgroundColor: opt.color, color: (opt as any).textColor || getContrastColor(opt.color) }}
                                >
                                    {label}
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className="relative ml-2 no-print" ref={menuRef}>
                        <button
                            onClick={() => setShowAddStatusMenu(!showAddStatusMenu)}
                            className="flex items-center justify-center p-1 bg-gray-200 hover:bg-gray-300 rounded border border-gray-400"
                            title="Add"
                        >
                            <Plus size={16} />
                            <span className="text-xs font-bold ml-1 mr-1">Add</span>
                        </button>

                        {showAddStatusMenu && (
                            <div className="absolute bottom-full left-0 mb-1 bg-white border shadow-lg p-3 z-50 w-72 rounded-md max-h-[80vh] overflow-y-auto">
                                {showStatusForm ? (
                                    /* Form for adding/editing */
                                    <div className="mb-4 pb-4 border-b border-gray-200">
                                        <div className="mb-2">
                                            <label className="block text-xs font-bold mb-1">{namesLanguage === 'en' ? 'Name (English)' : 'الاسم (إنجليزي)'}</label>
                                            <input 
                                                type="text"
                                                value={newStatusNameEn}
                                                onChange={(e) => setNewStatusNameEn(e.target.value)}
                                                className="w-full border rounded px-2 py-1 text-sm"
                                            />
                                        </div>
                                        <div className="mb-2">
                                            <label className="block text-xs font-bold mb-1">{namesLanguage === 'en' ? 'Name (Arabic)' : 'الاسم (عربي)'}</label>
                                            <input 
                                                type="text"
                                                dir="rtl"
                                                value={newStatusNameAr}
                                                onChange={(e) => setNewStatusNameAr(e.target.value)}
                                                className="w-full border rounded px-2 py-1 text-sm text-right"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="block text-xs font-bold mb-1">{namesLanguage === 'en' ? 'Color' : 'اللون'}</label>
                                            <input 
                                                type="color"
                                                value={newStatusColor}
                                                onChange={(e) => setNewStatusColor(e.target.value)}
                                                className="w-full h-8 cursor-pointer"
                                            />
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => {
                                                    setEditingStatusKey(null);
                                                    setNewStatusNameEn('');
                                                    setNewStatusNameAr('');
                                                    setNewStatusColor('#000000');
                                                    setShowStatusForm(false);
                                                }}
                                                className="px-3 py-1 bg-gray-200 text-xs rounded hover:bg-gray-300"
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                onClick={handleSaveCustomStatus}
                                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-3 border-b border-gray-200 pb-3 flex justify-between items-center">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Statuses
                                        </h4>
                                        <button 
                                            onClick={() => {
                                                setEditingStatusKey(null);
                                                setNewStatusNameEn('');
                                                setNewStatusNameAr('');
                                                setNewStatusColor('#000000');
                                                setShowStatusForm(true);
                                            }}
                                            className="px-3 py-1 bg-gray-200 text-xs rounded hover:bg-gray-300 font-bold"
                                        >
                                            Add
                                        </button>
                                    </div>
                                )}
                                
                                {/* List of Statuses */}
                                {!showStatusForm && (
                                    <div>
                                        {statusOptions.length === 0 ? (
                                            <p className="text-xs text-gray-400 italic">
                                                No statuses yet.
                                            </p>
                                        ) : (
                                        <div className="space-y-2">
                                            {statusOptions.map((status) => (
                                                <div key={status.key} className="flex items-center justify-between p-1 hover:bg-gray-50 rounded">
                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                        <div 
                                                            className="w-4 h-4 rounded-full border border-gray-300 shrink-0" 
                                                            style={{ backgroundColor: status.color }} 
                                                        />
                                                        <span className="text-xs truncate" title={namesLanguage === 'en' ? status.en : status.ar}>
                                                            {namesLanguage === 'en' ? status.en : status.ar}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <button 
                                                            onClick={() => handleEditStatus(status)}
                                                            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteStatus(status.key)}
                                                            className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                )}
                            </div>
                        )}
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
            {!isPosted && (
                <div className="flex justify-end pt-4 no-print border-t border-gray-100">
                    <button
                        onClick={() => setShowPostConfirm(true)}
                        disabled={!isEditableMonth}
                        className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-lg shadow-sm transition-all text-sm h-10 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        <span>Post Current</span>
                    </button>
                </div>
            )}

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
                            Are you sure you want to post the overtime of <span className="font-bold text-indigo-600">{new Date(currentYear, currentMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>? This will transfer the month to the List Overtime tab and immediately lock the data from further edits.
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

            {/* Clear Confirmation Modal */}
            {showClearConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[400] no-print">
                    <div 
                        dir={namesLanguage === 'en' ? 'ltr' : 'rtl'} 
                        className={`bg-white rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-100 ${namesLanguage === 'ar' ? 'text-right' : 'text-left'}`}
                    >
                        <h3 className="text-lg font-bold text-gray-900 mb-2 p-6 pb-0">
                            {namesLanguage === 'en' ? 'Clear Table Data' : 'مسح بيانات الجدول'}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed mb-6 px-6">
                            {namesLanguage === 'en' 
                                ? 'Are you sure you want to clear all cells, values, and colors in this monthly overtime grid? This action is permanent and cannot be undone.' 
                                : 'هل أنت متأكد من رغبتك في مسح كافة الخانات والقيم والألوان في جدول العمل الإضافي لشهرنا الحالي؟ هذا الإجراء نهائي ولا يمكن التراجع عنه.'
                            }
                        </p>
                        <div className={`flex justify-end gap-3 px-6 pb-6 ${namesLanguage === 'ar' ? 'flex-row-reverse' : ''}`}>
                            <button
                                onClick={() => setShowClearConfirm(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                {namesLanguage === 'en' ? 'Cancel' : 'إلغاء'}
                            </button>
                            <button
                                onClick={handleConfirmClear}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors shadow-sm"
                            >
                                {namesLanguage === 'en' ? 'Clear All Data' : 'مسح كافة البيانات'}
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
                        {statusOptions.map(opt => {
                            const label = namesLanguage === 'en' ? opt.en : opt.ar;
                            return (
                                <button
                                    key={opt.key}
                                    onClick={() => {
                                        updateCellStatus(doubleClickMenu.empId, doubleClickMenu.day, opt.key);
                                        setDoubleClickMenu(null);
                                    }}
                                    className="w-full text-center py-1.5 px-1 text-xs font-bold border-b-2 border-black last:border-b-0 cursor-pointer hover:opacity-90 select-none"
                                    style={{ backgroundColor: opt.color, color: (opt as any).textColor || getContrastColor(opt.color) }}
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
