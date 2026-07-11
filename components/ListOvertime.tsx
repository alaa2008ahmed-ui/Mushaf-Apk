import React, { useState, useEffect } from 'react';
import { dualStorage, COLLECTIONS } from '../DualStorageService';
import { Trash2, Calendar, FileSpreadsheet, Eye, X, Printer, Undo2 } from 'lucide-react';
import { TimeSheetEmployee, User } from '../types';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

interface EmployeeGridData {
    bonus: string;
    otTrips: string;
    rate: string;
    days: Record<number, string>;
}

interface MonthlyGrid {
    id: string;
    month: string;
    employeesData: Record<string, EmployeeGridData>;
}

interface ArchivedMonth {
    id: string;
    month: string;
    postedAt: string;
    overtime1?: MonthlyGrid;
    overtime2?: MonthlyGrid;
    drivers?: MonthlyGrid;
    employees: TimeSheetEmployee[];
    overtimeType?: 'overtime1' | 'overtime2' | 'drivers';
}

interface MergedArchive {
    id: string;
    month: string;
    postedAt: string;
    overtime1?: MonthlyGrid;
    overtime2?: MonthlyGrid;
    drivers?: MonthlyGrid;
    employees: TimeSheetEmployee[];
    sourceId1?: string;
    sourceId2?: string;
    sourceIdDrivers?: string;
}

interface Props {
    currentUser?: User;
}

export default function ListOvertime({ currentUser }: Props) {
    const [archives, setArchives] = useState<MergedArchive[]>(() => {
        const records = dualStorage.getLocalData(COLLECTIONS.RECORDS) || [];
        const loaded = records
            .filter((r: any) => r && r.type === 'timesheet_posted_month' && r.data)
            .map((r: any) => r.data as ArchivedMonth);

        const groupedMap = new Map<string, MergedArchive>();
        loaded.forEach((record) => {
            const m = record.month;
            if (!groupedMap.has(m)) {
                groupedMap.set(m, {
                    id: `merged-${m}`,
                    month: m,
                    postedAt: record.postedAt,
                    employees: [...record.employees],
                    sourceId1: record.overtimeType === 'overtime1' ? record.id : undefined,
                    sourceId2: record.overtimeType === 'overtime2' ? record.id : undefined,
                    sourceIdDrivers: record.overtimeType === 'drivers' ? record.id : undefined,
                    overtime1: record.overtime1,
                    overtime2: record.overtime2,
                    drivers: record.drivers,
                });
            } else {
                const existing = groupedMap.get(m)!;
                if (new Date(record.postedAt) > new Date(existing.postedAt)) {
                    existing.postedAt = record.postedAt;
                }
                if (record.overtimeType === 'overtime1') existing.sourceId1 = record.id;
                if (record.overtimeType === 'overtime2') existing.sourceId2 = record.id;
                if (record.overtimeType === 'drivers') existing.sourceIdDrivers = record.id;
                if (record.overtime1) {
                    existing.overtime1 = record.overtime1;
                }
                if (record.overtime2) {
                    existing.overtime2 = record.overtime2;
                }
                if (record.drivers) {
                    existing.drivers = record.drivers;
                }
                const empMap = new Map<string, TimeSheetEmployee>();
                existing.employees.forEach(e => empMap.set(e.id, e));
                record.employees.forEach(e => empMap.set(e.id, e));
                existing.employees = Array.from(empMap.values());
            }
        });

        return Array.from(groupedMap.values()).sort((a, b) => b.month.localeCompare(a.month));
    });
    const [selectedArchive, setSelectedArchive] = useState<MergedArchive | null>(null);
    const [archiveTab, setArchiveTab] = useState<'overtime1' | 'overtime2' | 'drivers'>('overtime1');
    const [archiveToDelete, setArchiveToDelete] = useState<MergedArchive | null>(null);
    const [archiveToUnpost, setArchiveToUnpost] = useState<{archive: MergedArchive, tab: 'overtime1' | 'overtime2' | 'drivers'} | null>(null);
    const [isUnposting, setIsUnposting] = useState(false);

    const loadArchives = (records: any[]) => {
        const loaded = records
            .filter((r: any) => r && r.type === 'timesheet_posted_month' && r.data)
            .map((r: any) => r.data as ArchivedMonth);

        // Group by month to merge overtime1 and overtime2
        const groupedMap = new Map<string, MergedArchive>();
        loaded.forEach((record) => {
            const m = record.month;
            if (!groupedMap.has(m)) {
                groupedMap.set(m, {
                    id: `merged-${m}`,
                    month: m,
                    postedAt: record.postedAt,
                    employees: [...record.employees],
                    sourceId1: record.overtimeType === 'overtime1' ? record.id : undefined,
                    sourceId2: record.overtimeType === 'overtime2' ? record.id : undefined,
                    sourceIdDrivers: record.overtimeType === 'drivers' ? record.id : undefined,
                    overtime1: record.overtime1,
                    overtime2: record.overtime2,
                    drivers: record.drivers,
                });
            } else {
                const existing = groupedMap.get(m)!;
                if (new Date(record.postedAt) > new Date(existing.postedAt)) {
                    existing.postedAt = record.postedAt;
                }
                if (record.overtimeType === 'overtime1') existing.sourceId1 = record.id;
                if (record.overtimeType === 'overtime2') existing.sourceId2 = record.id;
                if (record.overtimeType === 'drivers') existing.sourceIdDrivers = record.id;
                if (record.overtime1) {
                    existing.overtime1 = record.overtime1;
                }
                if (record.overtime2) {
                    existing.overtime2 = record.overtime2;
                }
                if (record.drivers) {
                    existing.drivers = record.drivers;
                }
                // Merge employees list without duplicates by id
                const empMap = new Map<string, TimeSheetEmployee>();
                existing.employees.forEach(e => empMap.set(e.id, e));
                record.employees.forEach(e => empMap.set(e.id, e));
                existing.employees = Array.from(empMap.values());
            }
        });

        const sorted = Array.from(groupedMap.values()).sort((a, b) => b.month.localeCompare(a.month));
        setArchives(sorted);
    };

    useEffect(() => {
        const q = query(
            collection(db, COLLECTIONS.RECORDS),
            where('type', '==', 'timesheet_posted_month')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const records = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            loadArchives(records);
        });

        return () => unsubscribe();
    }, []);

    const handleDelete = async (archive: MergedArchive) => {
        try {
            if (archive.sourceId1) await dualStorage.delete(COLLECTIONS.RECORDS, archive.sourceId1);
            if (archive.sourceId2) await dualStorage.delete(COLLECTIONS.RECORDS, archive.sourceId2);
            if (archive.sourceIdDrivers) await dualStorage.delete(COLLECTIONS.RECORDS, archive.sourceIdDrivers);
            
            setArchiveToDelete(null);
            if (selectedArchive?.month === archive.month) {
                setSelectedArchive(null);
            }
        } catch (error) {
            console.error("Error deleting archived month:", error);
        }
    };

    const handleUnpost = async (item: {archive: MergedArchive, tab: 'overtime1' | 'overtime2' | 'drivers'}) => {
        setIsUnposting(true);
        const { archive, tab } = item;
        try {
            if (tab === 'overtime1' && archive.overtime1) {
                // Restore Overtime 1
                await dualStorage.save(COLLECTIONS.RECORDS, archive.overtime1.id, {
                    type: 'timesheet_grid_overtime1',
                    data: archive.overtime1
                });
                if (archive.sourceId1) {
                    await dualStorage.delete(COLLECTIONS.RECORDS, archive.sourceId1);
                }
            } else if (tab === 'overtime2' && archive.overtime2) {
                // Restore Overtime 2
                await dualStorage.save(COLLECTIONS.RECORDS, archive.overtime2.id, {
                    type: 'timesheet_grid_overtime2',
                    data: archive.overtime2
                });
                if (archive.sourceId2) {
                    await dualStorage.delete(COLLECTIONS.RECORDS, archive.sourceId2);
                }
            } else if (tab === 'drivers' && archive.drivers) {
                // Restore Drivers
                await dualStorage.save(COLLECTIONS.RECORDS, archive.drivers.id, {
                    type: 'timesheet_drivers_tankers',
                    data: archive.drivers
                });
                if (archive.sourceIdDrivers) {
                    await dualStorage.delete(COLLECTIONS.RECORDS, archive.sourceIdDrivers);
                }
            }

            // Dispatch events to refresh TimeSheetReport components
            window.dispatchEvent(new CustomEvent('timesheet_unposted', { detail: { month: archive.month, tab } }));
            window.dispatchEvent(new Event('timesheet_grid_updated'));
            window.dispatchEvent(new Event('timesheet_grid_updated_remote'));

            setArchiveToUnpost(null);
            if (selectedArchive?.month === archive.month) {
                setSelectedArchive(null);
            }
        } catch (error) {
            console.error("Error unposting archive:", error);
            alert("Failed to undo post.");
        } finally {
            setIsUnposting(false);
        }
    };

    const getMonthName = (monthStr: string) => {
        const [year, month] = monthStr.split('-');
        return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    const getDaysInMonth = (monthStr: string) => {
        const [year, month] = monthStr.split('-');
        return new Date(parseInt(year), parseInt(month), 0).getDate();
    };

    const getDayName = (dayNumber: number, monthStr: string) => {
        const [year, month] = monthStr.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, dayNumber);
        return date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    };

    // Calculate total hours for an employee in the archived grid
    const calculateArchivedHours = (grid: MonthlyGrid | undefined, empId: string, daysCount: number) => {
        if (!grid || !grid.employeesData[empId]) return 0;
        const dData = grid.employeesData[empId];
        let sum = 0;
        for (let d = 1; d <= daysCount; d++) {
            const val = parseFloat(dData.days[d] || '0');
            sum += isNaN(val) ? 0 : val;
        }
        return sum;
    };

    const calculateTotalTabHours = (grid: any | undefined, employees: TimeSheetEmployee[], daysCount: number, typeKey: 'overtime1' | 'overtime2' | 'drivers') => {
        if (!grid) return 0;
        let grandTotal = 0;
        employees.forEach(emp => {
            const showInTab = typeKey === 'overtime1' ? emp.showInOvertime1 !== false : (typeKey === 'overtime2' ? emp.showInOvertime2 !== false : emp.showInDriversTab !== false);
            if (emp.isActive !== false && showInTab) {
                if (typeKey === 'drivers') {
                    const eData = grid.employeesData?.[emp.id];
                    const otVal = parseFloat(eData?.overtime || '0');
                    grandTotal += isNaN(otVal) ? 0 : otVal;
                } else {
                    grandTotal += calculateArchivedHours(grid, emp.id, daysCount);
                }
            }
        });
        return grandTotal;
    };

    const exportArchivedToExcel = async (archive: ArchivedMonth, typeKey: 'overtime1' | 'overtime2' | 'drivers') => {
        const grid = typeKey === 'overtime1' ? archive.overtime1 : (typeKey === 'overtime2' ? archive.overtime2 : archive.drivers);
        const title = typeKey === 'overtime1' ? 'Overtime 1' : (typeKey === 'overtime2' ? 'Overtime 2' : 'Drivers (Tankers)');
        
        const ExcelJS = (window as any).ExcelJS;
        if (!ExcelJS) {
            console.error("ExcelJS library is not loaded.");
            return;
        }
        
        const [yearStr, monthStr] = archive.month.split('-');
        const currentYear = parseInt(yearStr);
        const currentMonth = parseInt(monthStr);
        const daysInMonth = getDaysInMonth(archive.month);
        const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

        const workbook = new ExcelJS.Workbook();
        const headerTitleFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB4C6E7' } };
        const fontBold = { bold: true };
        const borderStyle = { 
            top: { style: 'thin' }, left: { style: 'thin' }, 
            bottom: { style: 'thin' }, right: { style: 'thin' } 
        };

        if (typeKey === 'drivers') {
            const sheet = workbook.addWorksheet(`Drivers ${archive.month}`, { views: [{ rightToLeft: false }] });
            sheet.getCell(`A2`).value = `Drivers (Tankers) (Archived) - ${getMonthName(archive.month)}`;
            sheet.getCell(`A2`).font = { bold: true, size: 16, color: { argb: 'FF1F3A60' } };
            
            let currentRow = 4;
            const headers = ['Name', 'CAPACITY (M3)', 'TOTAL TRIPS', 'TRIPS ON DUTY', 'TRIPS O.T.', 'OVERTIME'];
            daysArray.forEach(day => headers.push(day.toString()));
            
            headers.forEach((header, idx) => {
                const cell = sheet.getCell(currentRow, idx + 1);
                cell.value = header;
                cell.fill = headerTitleFill;
                cell.font = fontBold;
                cell.border = borderStyle as any;
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
            });
            sheet.getRow(currentRow).height = 25;
            currentRow++;
            
            const filteredEmployees = archive.employees.filter(emp => {
                const showInTab = emp.showInDriversTab !== false;
                return emp.isActive !== false && showInTab;
            });
            
            filteredEmployees.forEach((emp) => {
                const eData = (grid?.employeesData?.[emp.id] || { capacity: '', totalTrips: '', tripsOnDuty: '', tripsOT: '', overtime: '', days: {} }) as any;
                
                // Write Row 1
                const row1Values: any[] = [
                    emp.englishName || emp.name,
                    eData.capacity,
                    '',
                    '',
                    '',
                    eData.overtime
                ];
                daysArray.forEach(day => {
                    row1Values.push(eData.days?.[`${day}_1`] || '');
                });
                
                row1Values.forEach((val, cIdx) => {
                    const cell = sheet.getCell(currentRow, cIdx + 1);
                    cell.value = val;
                    cell.border = borderStyle as any;
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                    if (cIdx === 0) {
                        cell.font = { bold: true };
                        cell.alignment = { horizontal: 'left', vertical: 'middle' };
                    }
                });
                sheet.getRow(currentRow).height = 20;
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
                daysArray.forEach(day => {
                    row2Values.push(eData.days?.[`${day}_2`] || '');
                });
                row2Values.forEach((val, cIdx) => {
                    const cell = sheet.getCell(currentRow, cIdx + 1);
                    cell.value = val;
                    cell.border = borderStyle as any;
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                });
                sheet.getRow(currentRow).height = 20;
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
                daysArray.forEach(day => {
                    row3Values.push(eData.days?.[`${day}_3`] || '');
                });
                row3Values.forEach((val, cIdx) => {
                    const cell = sheet.getCell(currentRow, cIdx + 1);
                    cell.value = val;
                    cell.border = borderStyle as any;
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                });
                sheet.getRow(currentRow).height = 20;
                currentRow++;
                
                // Merge name cell across the 3 rows
                sheet.mergeCells(currentRow - 3, 1, currentRow - 1, 1);
            });
            
            sheet.getColumn(1).width = 25;
            sheet.getColumn(2).width = 15;
            sheet.getColumn(3).width = 15;
            sheet.getColumn(4).width = 15;
            sheet.getColumn(5).width = 15;
            sheet.getColumn(6).width = 15;
            for(let i = 0; i < daysArray.length; i++) {
                sheet.getColumn(7 + i).width = 5;
            }
            
            workbook.xlsx.writeBuffer().then((buffer: ArrayBuffer) => {
                const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const filename = `Archived_${title}_${archive.month}.xlsx`;
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            });
            return;
        }

        const sheet = workbook.addWorksheet(`${title} ${archive.month}`, { views: [{ rightToLeft: false }] });
        
        let currentRow = 2;
        sheet.getCell(`A${currentRow}`).value = `${title} (Archived) - ${getMonthName(archive.month)}`;
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

        const filteredEmployees = archive.employees.filter(emp => {
            const showInTab = typeKey === 'overtime1' ? emp.showInOvertime1 !== false : (typeKey === 'overtime2' ? emp.showInOvertime2 !== false : emp.showInDriversTab !== false);
            return emp.isActive !== false && showInTab;
        });

        filteredEmployees.forEach((emp, idx) => {
            const dData = grid?.employeesData?.[emp.id] || { bonus: '', otTrips: '', rate: '', days: {} };
            const total = calculateArchivedHours(grid, emp.id, daysInMonth);
            
            const cellValues: any[] = [
                idx + 1,
                emp.name,
                emp.jobTitle,
                dData.bonus,
                dData.otTrips,
                total
            ];
            
            daysArray.forEach(day => {
                const isFriday = new Date(currentYear, currentMonth - 1, day).getDay() === 5;
                const cellVal = dData.days?.[day] || '';
                cellValues.push({ value: cellVal, isFriday });
            });
            cellValues.push(dData.rate);

            cellValues.forEach((valData: any, cIdx) => {
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
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
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

        workbook.xlsx.writeBuffer().then((buffer: ArrayBuffer) => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const filename = `Archived_${title}_${archive.month}.xlsx`;
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

    return (
        <div className="w-full space-y-6 p-4 sm:p-6 pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900">List Overtime (Archives)</h2>
                    <p className="text-sm text-gray-500 mt-1">View and manage history of posted monthly overtime logs</p>
                </div>
            </div>

            {archives.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <Calendar size={48} className="text-gray-400 mb-3" />
                    <h3 className="text-lg font-bold text-gray-700">No Posted Overtime Found</h3>
                    <p className="text-sm text-gray-500 max-w-sm mt-1">
                        Use the "Post Current Month Overtime" button under Overtime 1 or Overtime 2 tabs to save monthly records here.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {archives.map((archive, idx) => {
                        const daysInMonth = getDaysInMonth(archive.month);
                        return (
                            <div key={archive.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                                <Calendar size={20} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-base font-bold text-gray-900">{getMonthName(archive.month)}</h3>
                                                    <div className="flex gap-1.5">
                                                        {archive.overtime1 && (
                                                            <div className="flex items-center bg-orange-100 rounded-full pl-2 pr-1 py-0.5">
                                                                <span className="text-[9px] font-bold text-orange-700 mr-1">
                                                                    O1
                                                                </span>
                                                                {idx === 0 && (!currentUser || currentUser.username.toLowerCase() === 'alaa' || currentUser.permissions?.tsCanUndoPost === true) && (
                                                                    <button 
                                                                        onClick={() => setArchiveToUnpost({ archive, tab: 'overtime1' })}
                                                                        className="text-orange-500 hover:text-orange-700 bg-white rounded-full p-0.5 shadow-sm transition-colors"
                                                                        title="Undo Post O1"
                                                                    >
                                                                        <Undo2 size={10} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                        {archive.overtime2 && (
                                                            <div className="flex items-center bg-teal-100 rounded-full pl-2 pr-1 py-0.5">
                                                                <span className="text-[9px] font-bold text-teal-700 mr-1">
                                                                    O2
                                                                </span>
                                                                {idx === 0 && (!currentUser || currentUser.username.toLowerCase() === 'alaa' || currentUser.permissions?.tsCanUndoPost === true) && (
                                                                    <button 
                                                                        onClick={() => setArchiveToUnpost({ archive, tab: 'overtime2' })}
                                                                        className="text-teal-500 hover:text-teal-700 bg-white rounded-full p-0.5 shadow-sm transition-colors"
                                                                        title="Undo Post O2"
                                                                    >
                                                                        <Undo2 size={10} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                        {archive.drivers && (
                                                            <div className="flex items-center bg-[#b4c6e7] rounded-full pl-2 pr-1 py-0.5">
                                                                <span className="text-[9px] font-bold text-indigo-700 mr-1">
                                                                    Drivers
                                                                </span>
                                                                {idx === 0 && (!currentUser || currentUser.username.toLowerCase() === 'alaa' || currentUser.permissions?.tsCanUndoPost === true) && (
                                                                    <button 
                                                                        onClick={() => setArchiveToUnpost({ archive, tab: 'drivers' })}
                                                                        className="text-indigo-500 hover:text-indigo-700 bg-white rounded-full p-0.5 shadow-sm transition-colors"
                                                                        title="Undo Post Drivers"
                                                                    >
                                                                        <Undo2 size={10} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-[11px] text-gray-400">
                                                    Posted: {new Date(archive.postedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {(!currentUser || currentUser.username.toLowerCase() === 'alaa' || currentUser.permissions?.tsCanDeletePost === true) && (
                                                <button 
                                                    onClick={() => setArchiveToDelete(archive)}
                                                    className="text-gray-400 hover:text-red-600 transition-colors p-1"
                                                    title="Delete Archive"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-3 grid grid-cols-3 gap-1.5 text-center border-t border-b py-2 my-3 bg-gray-50 rounded-md">
                                        <div className="border-r border-gray-200 pr-1">
                                            <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider mb-1">O1</p>
                                            <p className="text-xs font-black text-indigo-600">
                                                {archive.employees.filter(e => e.isActive && e.showInOvertime1 !== false).length}
                                            </p>
                                            {archive.overtime1 ? (
                                                <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                                                    <span className="font-bold text-orange-600">{calculateTotalTabHours(archive.overtime1, archive.employees, daysInMonth, 'overtime1')}h</span>
                                                </p>
                                            ) : (
                                                <p className="text-[9px] text-gray-400 italic mt-0.5">None</p>
                                            )}
                                        </div>
                                        <div className="border-r border-gray-200 px-1">
                                            <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider mb-1">O2</p>
                                            <p className="text-xs font-black text-indigo-600">
                                                {archive.employees.filter(e => e.isActive && e.showInOvertime2 !== false).length}
                                            </p>
                                            {archive.overtime2 ? (
                                                <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                                                    <span className="font-bold text-teal-600">{calculateTotalTabHours(archive.overtime2, archive.employees, daysInMonth, 'overtime2')}h</span>
                                                </p>
                                            ) : (
                                                <p className="text-[9px] text-gray-400 italic mt-0.5">None</p>
                                            )}
                                        </div>
                                        <div className="pl-1">
                                            <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider mb-1">Drivers</p>
                                            <p className="text-xs font-black text-indigo-600">
                                                {archive.employees.filter(e => e.isActive && e.showInDriversTab !== false).length}
                                            </p>
                                            {archive.drivers ? (
                                                <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                                                    <span className="font-bold text-indigo-600">{calculateTotalTabHours(archive.drivers, archive.employees, daysInMonth, 'drivers')}h</span>
                                                </p>
                                            ) : (
                                                <p className="text-[9px] text-gray-400 italic mt-0.5">None</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {(!currentUser || currentUser.username.toLowerCase() === 'alaa' || currentUser.permissions?.tsCanViewArchiveO1 === true || currentUser.permissions?.tsCanViewArchiveO2 === true || currentUser.permissions?.tsCanViewArchiveDrivers === true) ? (
                                    <button
                                        onClick={() => {
                                            setSelectedArchive(archive);
                                            const canViewO1 = !currentUser || currentUser.username.toLowerCase() === 'alaa' || currentUser.permissions?.tsCanViewArchiveO1 === true;
                                            const canViewO2 = !currentUser || currentUser.username.toLowerCase() === 'alaa' || currentUser.permissions?.tsCanViewArchiveO2 === true;
                                            if (archive.overtime1 && canViewO1) {
                                                setArchiveTab('overtime1');
                                            } else if (archive.overtime2 && canViewO2) {
                                                setArchiveTab('overtime2');
                                            } else {
                                                setArchiveTab('drivers');
                                            }
                                        }}
                                        className="w-full flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg font-medium text-sm transition-all"
                                    >
                                        <Eye size={14} />
                                        <span>View Archived Details</span>
                                    </button>
                                ) : (
                                    <button
                                        disabled
                                        className="w-full flex items-center justify-center space-x-2 bg-gray-50 text-gray-400 py-2 rounded-lg font-medium text-sm cursor-not-allowed"
                                    >
                                        <Eye size={14} />
                                        <span>View Archived Details</span>
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* View Archive Details Modal */}
            {selectedArchive && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-2 sm:p-4 z-[400] overflow-y-auto">
                    <style>{`
                        #printable-archive-table tbody {
                            counter-reset: rowNumber;
                        }
                        #printable-archive-table tbody tr {
                            counter-increment: rowNumber;
                        }
                        #printable-archive-table tbody tr td.row-counter::before {
                            content: counter(rowNumber);
                        }
                    `}</style>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl my-auto flex flex-col max-h-[90vh] border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                            <div>
                                <h3 className="text-xl font-black text-indigo-900 flex items-center gap-2">
                                    <Calendar className="text-indigo-600" size={24} />
                                    <span>Archived Overtime - {getMonthName(selectedArchive.month)}</span>
                                </h3>
                                <p className="text-xs text-gray-400 mt-1">
                                    Posted on {new Date(selectedArchive.postedAt).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'medium' })}
                                </p>
                            </div>
                            <button 
                                onClick={() => setSelectedArchive(null)} 
                                className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Tabs and Export Controls */}
                        <div className="px-6 py-3 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-3">
                            <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
                                {selectedArchive.overtime1 && (!currentUser || currentUser.username.toLowerCase() === 'alaa' || currentUser.permissions?.tsCanViewArchiveO1 === true) && (
                                    <button
                                        onClick={() => setArchiveTab('overtime1')}
                                        className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${
                                            archiveTab === 'overtime1'
                                                ? 'bg-white text-indigo-700 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                    >
                                        Overtime 1
                                    </button>
                                )}
                                {selectedArchive.overtime2 && (!currentUser || currentUser.username.toLowerCase() === 'alaa' || currentUser.permissions?.tsCanViewArchiveO2 === true) && (
                                    <button
                                        onClick={() => setArchiveTab('overtime2')}
                                        className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${
                                            archiveTab === 'overtime2'
                                                ? 'bg-white text-indigo-700 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                    >
                                        Overtime 2
                                    </button>
                                )}
                                {selectedArchive.drivers && (!currentUser || currentUser.username.toLowerCase() === 'alaa' || currentUser.permissions?.tsCanViewArchiveDrivers === true) && (
                                    <button
                                        onClick={() => setArchiveTab('drivers')}
                                        className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${
                                            archiveTab === 'drivers'
                                                ? 'bg-white text-indigo-700 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                    >
                                        Drivers (Tankers)
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => exportArchivedToExcel(selectedArchive, archiveTab)}
                                    className="flex items-center space-x-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium text-xs transition-colors shadow-sm"
                                >
                                    <FileSpreadsheet size={16} />
                                    <span>Export Excel</span>
                                </button>
                                <button
                                    onClick={() => window.print()}
                                    className="flex items-center space-x-1.5 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-md font-medium text-xs transition-colors shadow-sm"
                                >
                                    <Printer size={16} />
                                    <span>Print Table</span>
                                </button>
                            </div>
                        </div>

                        {/* Table Area */}
                        <div className="flex-1 overflow-auto p-6">
                            <div className="overflow-x-auto border rounded-lg">
                                <table id="printable-archive-table" className="min-w-full divide-y divide-gray-200 text-center text-xs">
                                    {archiveTab === 'drivers' ? (
                                        <>
                                            <thead className="bg-[#b4c6e7]">
                                                <tr>
                                                    <th className="border border-gray-300 p-2 font-bold text-gray-900 w-40 align-middle" rowSpan={2}>
                                                        Name
                                                    </th>
                                                    <th className="border border-gray-300 p-2 font-bold text-gray-900 w-16 align-middle uppercase" rowSpan={2}>
                                                        CAPACITY (M3)
                                                    </th>
                                                    <th className="border border-gray-300 p-2 font-bold text-gray-900 w-16 align-middle uppercase" rowSpan={2}>
                                                        TOTAL TRIPS
                                                    </th>
                                                    <th className="border border-gray-300 p-2 font-bold text-gray-900 w-16 align-middle uppercase" rowSpan={2}>
                                                        TRIPS ON DUTY
                                                    </th>
                                                    <th className="border border-gray-300 p-2 font-bold text-gray-900 w-16 align-middle uppercase" rowSpan={2}>
                                                        TRIPS O.T.
                                                    </th>
                                                    <th className="border border-gray-300 p-2 font-bold text-red-600 w-16 align-middle uppercase" rowSpan={2}>
                                                        OVERTIME
                                                    </th>
                                                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                                                        const dName = getDayName(day, selectedArchive.month);
                                                        const isRed = dName === 'FRIDAY' || dName === 'SATURDAY';
                                                        return (
                                                            <th key={`h1-${day}`} className={`border border-gray-300 p-0.5 align-middle bg-[#00b0f0] w-6 font-bold ${isRed ? 'text-red-600' : 'text-gray-900'}`}>
                                                                <div className="flex items-center justify-center h-full w-full py-1">
                                                                    <div className="[writing-mode:vertical-rl] rotate-180 text-[10px] font-bold tracking-wider">{dName.substring(0, 3)}</div>
                                                                </div>
                                                            </th>
                                                        );
                                                    })}
                                                </tr>
                                                <tr>
                                                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                                        <th key={`h2-${day}`} className="border border-gray-300 p-1 text-center font-bold bg-yellow-300 text-[11px] text-gray-900">
                                                            {day <= getDaysInMonth(selectedArchive.month) ? day : ''}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {(() => {
                                                    const grid = selectedArchive.drivers;
                                                    const filteredEmployees = selectedArchive.employees.filter(emp => emp.isActive !== false && emp.showInDriversTab === true);

                                                    if (filteredEmployees.length === 0) {
                                                        return (
                                                            <tr>
                                                                <td colSpan={37} className="px-6 py-12 text-center text-gray-500 font-medium">
                                                                    No active employees in this archive tab.
                                                                </td>
                                                            </tr>
                                                        );
                                                    }

                                                    const daysCount = getDaysInMonth(selectedArchive.month);
                                                    const daysArray = Array.from({ length: 31 }, (_, i) => i + 1);

                                                    const isWeekend = (dayNumber: number) => {
                                                        const dName = getDayName(dayNumber, selectedArchive.month);
                                                        return dName === 'FRIDAY' || dName === 'SATURDAY';
                                                    };

                                                    return filteredEmployees.map((emp) => {
                                                        const eData = (grid?.employeesData?.[emp.id] || { capacity: '', totalTrips: '', tripsOnDuty: '', tripsOT: '', overtime: '', days: {} }) as any;
                                                        const isDriver = (emp.jobTitle || '').includes('سائق شاحنه') || (emp.jobTitle || '').includes('سائق');
                                                        const borderBottom = isDriver ? '1px dashed #9ca3af' : '2px solid #000';
                                                        const rowSpan = isDriver ? 3 : 1;

                                                        return (
                                                            <React.Fragment key={emp.id}>
                                                                <tr>
                                                                    <td style={{ borderBottom: '2px solid #000', borderRight: '1px solid #000' }} className="p-2 font-bold text-red-600 uppercase text-left align-middle bg-white" rowSpan={rowSpan}>
                                                                        {emp.englishName || emp.name}
                                                                    </td>
                                                                    <td style={{ borderBottom: borderBottom, borderRight: '1px dashed #9ca3af' }} className="p-1 text-center font-bold bg-white h-6 border border-gray-200">
                                                                        {isDriver && eData.capacity}
                                                                    </td>
                                                                    <td style={{ borderBottom: borderBottom, borderRight: '1px dashed #9ca3af' }} className="p-1 text-center bg-white h-6 border border-gray-200"></td>
                                                                    <td style={{ borderBottom: borderBottom, borderRight: '1px dashed #9ca3af' }} className="p-1 text-center bg-white h-6 border border-gray-200"></td>
                                                                    <td style={{ borderBottom: borderBottom, borderRight: '1px dashed #9ca3af' }} className="p-1 text-center bg-white h-6 border border-gray-200"></td>
                                                                    <td style={{ borderBottom: borderBottom, borderRight: '1px solid #000' }} className="p-1 text-center font-bold text-red-600 bg-white h-6 border border-gray-200">
                                                                        {eData.overtime}
                                                                    </td>
                                                                    {daysArray.map(day => (
                                                                        <td key={`d1-${day}`} style={{ borderBottom: borderBottom, borderRight: day === 31 ? '1px solid #000' : '1px dashed #9ca3af' }} className={`p-1 text-center font-bold bg-white h-6 border border-gray-200 ${day <= daysCount && isWeekend(day) ? 'text-red-600' : 'text-gray-800'}`}>
                                                                            {day <= daysCount && (eData.days[`${day}_1`] || '')}
                                                                        </td>
                                                                    ))}
                                                                </tr>
                                                                {isDriver && (
                                                                    <>
                                                                        <tr>
                                                                            <td style={{ borderBottom: '1px dashed #9ca3af', borderRight: '1px dashed #9ca3af' }} className="p-1 bg-white h-6 border border-gray-200"></td>
                                                                            <td style={{ borderBottom: '1px dashed #9ca3af', borderRight: '1px dashed #9ca3af' }} className="p-1 text-center font-bold bg-white h-6 border border-gray-200">
                                                                                {eData.totalTrips}
                                                                            </td>
                                                                            <td style={{ borderBottom: '1px dashed #9ca3af', borderRight: '1px dashed #9ca3af' }} className="p-1 bg-white h-6 border border-gray-200"></td>
                                                                            <td style={{ borderBottom: '1px dashed #9ca3af', borderRight: '1px dashed #9ca3af' }} className="p-1 text-center font-bold bg-white h-6 border border-gray-200">
                                                                                {eData.tripsOT}
                                                                            </td>
                                                                            <td style={{ borderBottom: '1px dashed #9ca3af', borderRight: '1px solid #000' }} className="p-1 bg-white h-6 border border-gray-200"></td>
                                                                            {daysArray.map(day => (
                                                                                <td key={`d2-${day}`} style={{ borderBottom: '1px dashed #9ca3af', borderRight: day === 31 ? '1px solid #000' : '1px dashed #9ca3af' }} className="p-1 text-center font-bold text-gray-800 bg-white h-6 border border-gray-200">
                                                                                    {day <= daysCount && (eData.days[`${day}_2`] || '')}
                                                                                </td>
                                                                            ))}
                                                                        </tr>
                                                                        <tr>
                                                                            <td style={{ borderBottom: '2px solid #000', borderRight: '1px dashed #9ca3af' }} className="p-1 bg-white h-6 border border-gray-200"></td>
                                                                            <td style={{ borderBottom: '2px solid #000', borderRight: '1px dashed #9ca3af' }} className="p-1 bg-white h-6 border border-gray-200"></td>
                                                                            <td style={{ borderBottom: '2px solid #000', borderRight: '1px dashed #9ca3af' }} className="p-1 text-center font-bold bg-white h-6 border border-gray-200">
                                                                                {eData.tripsOnDuty}
                                                                            </td>
                                                                            <td style={{ borderBottom: '2px solid #000', borderRight: '1px dashed #9ca3af' }} className="p-1 bg-white h-6 border border-gray-200"></td>
                                                                            <td style={{ borderBottom: '2px solid #000', borderRight: '1px solid #000' }} className="p-1 bg-white h-6 border border-gray-200"></td>
                                                                            {daysArray.map(day => (
                                                                                <td key={`d3-${day}`} style={{ borderBottom: '2px solid #000', borderRight: day === 31 ? '1px solid #000' : '1px dashed #9ca3af' }} className="p-1 text-center font-bold text-gray-800 bg-white h-6 border border-gray-200">
                                                                                    {day <= daysCount && (eData.days[`${day}_3`] || '')}
                                                                                </td>
                                                                            ))}
                                                                        </tr>
                                                                    </>
                                                                )}
                                                            </React.Fragment>
                                                        );
                                                    });
                                                })()}
                                            </tbody>
                                        </>
                                    ) : (
                                        <>
                                            <thead className="bg-[#b4c6e7]">
                                                <tr>
                                                    <th className="px-1 py-2 font-bold text-gray-900 border border-gray-300 w-10">No</th>
                                                    <th className="px-2 py-2 font-bold text-gray-900 border border-gray-300 text-right min-w-[150px]">Name</th>
                                                    <th className="px-2 py-2 font-bold text-gray-900 border border-gray-300 min-w-[120px]">Job Title</th>
                                                    <th className="px-2 py-2 font-bold text-gray-900 border border-gray-300 w-16">Bonuses</th>
                                                    <th className="px-1 py-2 font-bold text-gray-900 border border-gray-300 w-16">O.T Trips</th>
                                                    <th className="px-2 py-2 font-bold text-red-600 border border-gray-300 w-16">Total</th>
                                                    {Array.from({ length: getDaysInMonth(selectedArchive.month) }, (_, i) => i + 1).map(day => (
                                                        <th key={day} className="px-0.5 py-2 font-bold text-[#800080] border border-gray-300 w-8">
                                                            {day}
                                                        </th>
                                                    ))}
                                                    <th className="px-2 py-2 font-bold text-[#800080] border border-gray-300 w-16">Rate</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {(() => {
                                                    const grid = archiveTab === 'overtime1' ? selectedArchive.overtime1 : selectedArchive.overtime2;
                                                    const filteredEmployees = selectedArchive.employees.filter(emp => {
                                                        const showInTab = archiveTab === 'overtime1' ? emp.showInOvertime1 !== false : emp.showInOvertime2 !== false;
                                                        return emp.isActive !== false && showInTab;
                                                    });

                                                    if (filteredEmployees.length === 0) {
                                                        return (
                                                            <tr>
                                                                <td colSpan={7 + getDaysInMonth(selectedArchive.month)} className="px-6 py-12 text-center text-gray-500 font-medium">
                                                                    No active employees in this archive tab.
                                                                </td>
                                                            </tr>
                                                        );
                                                    }

                                                    const daysCount = getDaysInMonth(selectedArchive.month);
                                                    const [yStr, mStr] = selectedArchive.month.split('-');
                                                    const y = parseInt(yStr);
                                                    const m = parseInt(mStr);

                                                    return filteredEmployees.map((emp, idx) => {
                                                        const dData = grid?.employeesData?.[emp.id] || { bonus: '', otTrips: '', rate: '', days: {} };
                                                        const totalHours = calculateArchivedHours(grid, emp.id, daysCount);
                                                        const bgStriped = idx % 2 === 0 ? 'bg-white' : 'bg-[#e9f0fa]';
                                                        const isZeroHours = totalHours === 0;

                                                        return (
                                                            <tr key={emp.id} className={`${bgStriped} hover:bg-yellow-50 ${(isZeroHours || emp.name.toLowerCase() === 'admin' || emp.englishName?.toLowerCase() === 'admin') ? 'print:hidden' : ''}`}>
                                                                <td className="row-counter px-1 py-1 font-bold text-gray-900 border border-gray-200"></td>
                                                                <td className="px-2 py-1 font-bold text-gray-900 border border-gray-200 text-right whitespace-nowrap">{emp.name}</td>
                                                                <td className="px-2 py-1 text-gray-600 border border-gray-200 whitespace-nowrap text-left">{emp.jobTitle}</td>
                                                                <td className="px-1 py-1 font-bold text-red-600 border border-gray-200">{dData.bonus || ''}</td>
                                                                <td className="px-1 py-1 font-bold text-indigo-700 border border-gray-200">{dData.otTrips || ''}</td>
                                                                <td className="px-1 py-1 font-bold text-red-600 border border-gray-200">{totalHours}</td>
                                                                {Array.from({ length: daysCount }, (_, i) => i + 1).map(day => {
                                                                    const isFriday = new Date(y, m - 1, day).getDay() === 5;
                                                                    const cellBg = isFriday ? 'bg-[#00b0f0]' : 'bg-transparent';
                                                                    const val = dData.days?.[day] || '';
                                                                    return (
                                                                        <td key={day} className={`px-0.5 py-1 border border-gray-200 font-medium ${cellBg}`}>
                                                                            {val}
                                                                        </td>
                                                                    );
                                                                })}
                                                                <td className="px-1 py-1 border border-gray-200 font-semibold">{dData.rate || ''}</td>
                                                            </tr>
                                                        );
                                                    });
                                                })()}
                                            </tbody>
                                        </>
                                    )}
                                </table>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                            <button
                                onClick={() => setSelectedArchive(null)}
                                className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                Close View
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Archive Confirmation Modal */}
            {archiveToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[500]">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
                                <Trash2 size={20} />
                                <span>Delete Archived Month</span>
                            </h3>
                            <button onClick={() => setArchiveToDelete(null)} className="text-gray-400 hover:text-gray-600 p-1">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-3 mb-6 text-left">
                            <p className="text-sm text-gray-700 font-medium leading-relaxed">
                                Are you sure you want to delete the archive for <span className="font-bold text-indigo-900">{getMonthName(archiveToDelete.month)}</span>? This action is permanent and cannot be undone.
                            </p>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setArchiveToDelete(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDelete(archiveToDelete)}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors shadow-sm"
                            >
                                Delete Archive
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Unpost Confirmation Modal */}
            {archiveToUnpost && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[500] animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 border border-gray-100 text-center">
                        <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Undo2 size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            Undo Post
                        </h3>
                        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                            Are you sure you want to undo the post for ({archiveToUnpost.tab === 'overtime1' ? 'O1' : (archiveToUnpost.tab === 'overtime2' ? 'O2' : 'Drivers')}) of {getMonthName(archiveToUnpost.archive.month)}? Data will be restored to the active tabs for editing.
                        </p>
                        <div className="flex justify-center gap-3">
                            <button
                                disabled={isUnposting}
                                onClick={() => setArchiveToUnpost(null)}
                                className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={isUnposting}
                                onClick={() => handleUnpost(archiveToUnpost)}
                                className="px-5 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 transition-colors shadow-sm flex items-center gap-2"
                            >
                                {isUnposting ? (
                                    <span>Processing...</span>
                                ) : (
                                    <>
                                        <Undo2 size={16} />
                                        <span>Confirm Undo</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
