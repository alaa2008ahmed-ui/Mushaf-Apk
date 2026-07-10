import React, { useState, useEffect } from 'react';
import { Edit, Trash2, CheckCircle, XCircle, Plus, X } from 'lucide-react';
import { TimeSheetEmployee, Driver, DriverWorkLog, User } from '../types';
import { dualStorage, COLLECTIONS } from '../DualStorageService';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import TimeSheetReport from './TimeSheetReport';
import ListOvertime from './ListOvertime';
import { initialEmployees } from '../payroll/data/initialEmployees';

interface Props {
    drivers: Driver[];
    workLogs: DriverWorkLog[];
    selectedBranchId?: string;
    users?: User[];
    currentUser?: User;
    onUpdateUser?: (id: string, user: User) => void;
    isMobile?: boolean;
}

const DEFAULT_EMPLOYEES = [
    { name: "نايف محمد عبد الله الخفره", jobTitle: "العضو المنتدب", englishName: "Nayef Mohamed Abdullah Al-Khafrah" },
    { name: "على محمد منصور الخلف", jobTitle: "شئون موظفين", englishName: "Ali Mohamed Mansour Al-Khalaf" },
    { name: "محمد احمد محمد البدرى", jobTitle: "نائب المدير العام", englishName: "Mohamed Ahmed Mohamed Al-Badri" },
    { name: "معتز حامد صالح الشوربجى", jobTitle: "مدير المبيعات", englishName: "Moataz Hamed Saleh Al-Shorbagy" },
    { name: "علاء احمد المرشدى", jobTitle: "محاسب عام", englishName: "Alaa Ahmed Al-Murshidi" },
    { name: "إبراهيم إسماعيل الحمادي", jobTitle: "امين صندوق", englishName: "Ibrahim Ismail Al-Hammadi" },
    { name: "فضيله محمد منصور الخلف", jobTitle: "محاسبة مبيعات", englishName: "Fadhilah Mohamed Mansour Al-Khalaf" },
    { name: "عبير محمد الدوسري", jobTitle: "محاسبة مبيعات", englishName: "Abeer Mohamed Al-Dousari" },
    { name: "أروى إبراهيم الشامسي", jobTitle: "مندوبة مشتريات", englishName: "Arwa Ibrahim Al-Shamsi" },
    { name: "عهد تركى فهد الدوسري", jobTitle: "محاسبة", englishName: "Ahd Turki Fahd Al-Dousari" },
    { name: "مشاعل موسى بكارى", jobTitle: "محاسبة", englishName: "Mashael Mousa Bakari" },
    { name: "صغير احمد بحر خان", jobTitle: "ميكانيكي", englishName: "Saghir Ahmed Bahar Khan" },
    { name: "عبدالرحمن شهاب الدين", jobTitle: "مراقب حركة سيارات", englishName: "Abdulrahman Shihabuddin" },
    { name: "ماني فانيلو سلونا", jobTitle: "سائق شاحنه", englishName: "Manny Vanilo Slona" },
    { name: "سنتراج كاتورا ياداف", jobTitle: "سائق نقل", englishName: "Santaj Katura Yadav" },
    { name: "جومير جاراسيا", jobTitle: "سائق شاحنة ثقيلة", englishName: "Jomber Garasia" },
    { name: "جيمى هاو قرقايو", jobTitle: "مشغل محطة", englishName: "Jimmy Hao Garfayo" },
    { name: "نزرور الحسين", jobTitle: "سائق شاحنه", englishName: "Nazrul Al-Hussein" },
    { name: "كمال الدين شمس الحق", jobTitle: "عامل شحن وتفريغ", englishName: "Kamaluddin Shamsul Haq" },
    { name: "كاجي بهادور غالي كمال", jobTitle: "سائق شاحنه", englishName: "Kaji Bahadur Ghali Kamal" },
    { name: "محمد كمال حسين", jobTitle: "مراقب حركة سيارات", englishName: "Mohamed Kamal Hussein" },
    { name: "محمد سلمان أنصاري", jobTitle: "مشغل محطة", englishName: "Mohamed Salman Ansari" },
    { name: "محمد عبد ال مالك", jobTitle: "عامل شحن وتفريغ", englishName: "Mohamed Abdul Malik" },
    { name: "مهيم الدين", jobTitle: "سائق شاحنه", englishName: "Mohimuddin" },
    { name: "دينيش كومار", jobTitle: "سائق شاحنه", englishName: "Dinesh Kumar" },
    { name: "هاربال سينغ", jobTitle: "عامل ورشه", englishName: "Harpal Singh" },
    { name: "محمد نظيم", jobTitle: "عامل شحن وتفريغ", englishName: "Mohamed Nazim" },
    { name: "محمد شاه باج", jobTitle: "عامل شحن وتفريغ", englishName: "Mohamed Shah Baj" },
    { name: "امتياز محمد", jobTitle: "سائق شاحنة ثقيلة", englishName: "Imtiaz Mohamed" },
    { name: "مشرف حسين", jobTitle: "سائق شاحنة ثقيلة", englishName: "Musharraf Hussein" },
    { name: "سلمان مومين", jobTitle: "سائق شاحنة ثقيلة", englishName: "Salman Momin" },
    { name: "ماجوما دار سوبكوت", jobTitle: "مشغل محطة", englishName: "Majumadar Suikot" },
    { name: "مصيد الرحمان عبد الرحمن", jobTitle: "مشغل محطة", englishName: "Mosaid Al-Rahman Abdul Rahman" },
    { name: "محمد رياض", jobTitle: "ميكانيكي", englishName: "Mohamed Riad" },
    { name: "ياسين عبدالجبار البكري", jobTitle: "مراقب حركة سيارات", englishName: "Yaseen Abdul Jabbar Al-Bakri" },
    { name: "محمد طارق انس احمد", jobTitle: "مشغل محطة", englishName: "Mohamed Tariq Anas Ahmed" },
    { name: "الترابى احمد ادريس على", jobTitle: "مراقب حركة سيارات", englishName: "Al-Torabi Ahmed Idris Ali" },
    { name: "نعمان كبير حسين", jobTitle: "مشغل محطة", englishName: "Numan Kabeer Hussein" }
];

const getEnglishNameForArabic = (arabicName: string): string => {
    if (!arabicName) return '';
    const trimmed = arabicName.trim().toLowerCase();
    const found = DEFAULT_EMPLOYEES.find(e => e.name.trim().toLowerCase() === trimmed);
    if (found) return found.englishName;
    return arabicName;
};

const getEnglishJobTitleForArabic = (arabicTitle: string): string => {
    if (!arabicTitle) return '';
    const map: Record<string, string> = {
        "العضو المنتدب": "Managing Director",
        "شئون موظفين": "Personnel Affairs",
        "نائب المدير العام": "Deputy General Manager",
        "مدير المبيعات": "Sales Manager",
        "محاسب عام": "General Accountant",
        "امين صندوق": "Treasurer",
        "محاسبة مبيعات": "Sales Accountant",
        "محاسبة": "Accountant",
        "ميكانيكي": "Mechanic",
        "مراقب حركة سيارات": "Car Movement Controller",
        "سائق شاحنه": "Truck Driver",
        "سائق نقل": "Transport Driver",
        "سائق شاحنة ثقيلة": "Heavy Truck Driver",
        "مشغل محطة": "Station Operator",
        "عامل شحن وتفريغ": "Loading and Unloading Worker",
        "عامل ورشه": "Workshop Worker",
        "مندوبة مشتريات": "Purchasing Representative"
    };
    return map[arabicTitle.trim()] || arabicTitle;
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

export default function TimeSheet({ drivers, workLogs, selectedBranchId, users = [], currentUser, onUpdateUser, isMobile }: Props) {
    const [activeTab, setActiveTab] = useState<'employees' | 'overtime1' | 'overtime2' | 'list_overtime' | 'settings'>('employees');

    useEffect(() => {
        if (currentUser && currentUser.username.toLowerCase() !== 'alaa') {
            const perms = currentUser.permissions;
            const allowedTabs = [];
            if (perms?.tsCanViewEmployees === true) allowedTabs.push('employees');
            if (perms?.tsCanViewOvertime1 === true) allowedTabs.push('overtime1');
            if (perms?.tsCanViewOvertime2 === true) allowedTabs.push('overtime2');
            if (perms?.tsCanViewListOvertime === true) allowedTabs.push('list_overtime');
            if (perms?.tsCanManageSettings === true) allowedTabs.push('settings');
            
            if (!allowedTabs.includes(activeTab) && allowedTabs.length > 0) {
                setActiveTab(allowedTabs[0] as any);
            }
        }
    }, [currentUser, activeTab]);

    const [employees, setEmployees] = useState<TimeSheetEmployee[]>(() => {
        const local = dualStorage.getLocalData(COLLECTIONS.RECORDS) || [];
        return local
            .filter((r: any) => r && r.type === 'timesheet_employee' && r.data)
            .map((r: any) => r.data as TimeSheetEmployee)
            .sort((a, b) => (a.serialNumber || 0) - (b.serialNumber || 0));
    });
    const [showAddModal, setShowAddModal] = useState(false);
    const [editEmployee, setEditEmployee] = useState<TimeSheetEmployee | null>(null);
    const [employeeToDelete, setEmployeeToDelete] = useState<TimeSheetEmployee | null>(null);
    const [settingsUserId, setSettingsUserId] = useState<string>('');

    // Dynamic names language state for OT tabs ('ar' or 'en')
    const [namesLanguage, setNamesLanguage] = useState<'ar' | 'en'>(() => {
        return (localStorage.getItem('timesheet_names_language') as 'ar' | 'en') || 'en';
    });

    const [employeeFilter, setEmployeeFilter] = useState<'all' | 'active' | 'inactive'>(() => {
        return (localStorage.getItem('timesheet_employee_filter') as 'all' | 'active' | 'inactive') || 'all';
    });
    const [searchQuery, setSearchQuery] = useState('');

    const sortedEmployees = React.useMemo(() => {
        let payrollEmps: any[] = [];
        const saved = localStorage.getItem('payroll_employees_2026');
        if (saved) {
            try {
                payrollEmps = JSON.parse(saved) || [];
            } catch (e) {
                console.error(e);
            }
        }
        if (!payrollEmps || payrollEmps.length === 0) {
            payrollEmps = initialEmployees;
        }

        const branchOrder = [
            'الادارة',
            'المركز الرئيسي',
            'فرع الدمام',
            'فرع الاحساء',
            'فرع المعباه'
        ];

        const sortedPayroll = [...payrollEmps].sort((a, b) => {
            const idxA = a.branch ? branchOrder.indexOf(a.branch.trim()) : -1;
            const idxB = b.branch ? branchOrder.indexOf(b.branch.trim()) : -1;
            const valA = idxA !== -1 ? idxA : 999;
            const valB = idxB !== -1 ? idxB : 999;
            return valA - valB;
        });

        const payrollIndices = new Map<string, number>();
        sortedPayroll.forEach((pEmp, idx) => {
            const key = normalizeArabicName(pEmp.name);
            if (!payrollIndices.has(key)) {
                payrollIndices.set(key, idx);
            }
        });

        return [...employees].sort((a, b) => {
            const keyA = normalizeArabicName(a.name);
            const keyB = normalizeArabicName(b.name);

            const idxA = payrollIndices.has(keyA) ? payrollIndices.get(keyA)! : 1000 + (a.serialNumber || 0);
            const idxB = payrollIndices.has(keyB) ? payrollIndices.get(keyB)! : 1000 + (b.serialNumber || 0);

            return idxA - idxB;
        });
    }, [employees]);

    const toggleNamesLanguage = (lang: 'ar' | 'en') => {
        setNamesLanguage(lang);
        localStorage.setItem('timesheet_names_language', lang);
    };

    // Control visibility of global footer on second, third, and fourth tabs
    useEffect(() => {
        const footer = document.querySelector('.global-app-footer');
        if (footer) {
            if (activeTab === 'overtime1' || activeTab === 'overtime2' || activeTab === 'list_overtime') {
                footer.classList.add('hidden');
            } else {
                footer.classList.remove('hidden');
            }
        }
        return () => {
            const f = document.querySelector('.global-app-footer');
            if (f) {
                f.classList.remove('hidden');
            }
        };
    }, [activeTab]);

    // Form state
    const [empName, setEmpName] = useState('');
    const [empEnglishName, setEmpEnglishName] = useState('');
    const [empJobTitle, setEmpJobTitle] = useState('');
    const [empEnglishJobTitle, setEmpEnglishJobTitle] = useState('');
    const [empShowInOvertime1, setEmpShowInOvertime1] = useState(true);
    const [empShowInOvertime2, setEmpShowInOvertime2] = useState(true);

    const handleSeedEmployees = async () => {
        try {
            // Get current employees in the database
            const records = dualStorage.getLocalData(COLLECTIONS.RECORDS) || [];
            const currentEmps = records
                .filter((r: any) => r && r.type === 'timesheet_employee' && r.data)
                .map((r: any) => r.data as TimeSheetEmployee);

            // Create a set of trimmed lowercase existing names to check against
            const existingNames = new Set(
                currentEmps.map(emp => emp.name.trim().toLowerCase())
            );

            // Find which DEFAULT_EMPLOYEES are missing
            const missingEmps = DEFAULT_EMPLOYEES.filter(
                defaultEmp => !existingNames.has(defaultEmp.name.trim().toLowerCase())
            );

            if (missingEmps.length === 0) {
                // All 40 employees are already present, nothing to restore!
                return;
            }

            // Let's determine the next starting serial number
            let nextSerial = currentEmps.length > 0 
                ? Math.max(...currentEmps.map(e => e.serialNumber || 0)) + 1 
                : 1;

            // Add the missing employees in parallel
            const newEmps: TimeSheetEmployee[] = missingEmps.map((empData, i) => ({
                id: `ts-emp-${Date.now()}-${i}`,
                serialNumber: nextSerial + i,
                name: empData.name,
                englishName: empData.englishName,
                jobTitle: empData.jobTitle,
                englishJobTitle: getEnglishJobTitleForArabic(empData.jobTitle),
                isActive: true
            }));

            await Promise.all(newEmps.map(newEmp => 
                dualStorage.save(COLLECTIONS.RECORDS, newEmp.id, { type: 'timesheet_employee', data: newEmp })
            ));

            // Re-fetch all and re-sequence serial numbers to make sure they are consecutive and correct!
            const updatedRecords = dualStorage.getLocalData(COLLECTIONS.RECORDS) || [];
            const allEmps = updatedRecords
                .filter((r: any) => r && r.type === 'timesheet_employee' && r.data)
                .map((r: any) => r.data as TimeSheetEmployee)
                .sort((a, b) => (a.serialNumber || 0) - (b.serialNumber || 0));

            const resequencedEmps = allEmps.map((emp, i) => ({ ...emp, serialNumber: i + 1 }));

            await Promise.all(resequencedEmps.map(updatedEmp => 
                dualStorage.save(COLLECTIONS.RECORDS, updatedEmp.id, { type: 'timesheet_employee', data: updatedEmp })
            ));

            window.dispatchEvent(new Event('timesheet_updated'));
        } catch (error) {
            console.error("Error restoring missing employees:", error);
        }
    };

    useEffect(() => {
        const q = query(
            collection(db, COLLECTIONS.RECORDS),
            where('type', '==', 'timesheet_employee')
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const emps = snapshot.docs
                .map(doc => ({ ...doc.data().data, id: doc.id } as TimeSheetEmployee))
                .sort((a, b) => (a.serialNumber || 0) - (b.serialNumber || 0));

            if (emps.length === 0) {
                // If completely empty, check if we should seed (initial setup)
                setEmployees([]);
                return;
            }

            // Filter and delete Suresh Kumar if found in active database records
            const sureshEmp = emps.find(emp => emp.name && (emp.name.includes("سوريش") || emp.name.toLowerCase().includes("suresh")));
            if (sureshEmp) {
                console.log("Auto-deleting Suresh Kumar from timesheet database...");
                await dualStorage.delete(COLLECTIONS.RECORDS, sureshEmp.id);
                window.dispatchEvent(new Event('timesheet_updated'));
                return;
            }

            // Check for duplicate names locally for cleanup if needed
            const seenNames = new Set<string>();
            const uniqueEmps: TimeSheetEmployee[] = [];
            const duplicatesToDelete: TimeSheetEmployee[] = [];

            emps.forEach(emp => {
                if (!emp || !emp.name) return;
                const nameKey = normalizeArabicName(emp.name);
                if (seenNames.has(nameKey)) {
                    duplicatesToDelete.push(emp);
                } else {
                    seenNames.add(nameKey);
                    uniqueEmps.push(emp);
                }
            });

            if (duplicatesToDelete.length > 0) {
                console.log(`Deduplicating ${duplicatesToDelete.length} employees...`);
                await Promise.all(duplicatesToDelete.map(dup => 
                    dualStorage.delete(COLLECTIONS.RECORDS, dup.id)
                ));
                
                // Re-sequence remaining in parallel
                const resequenced = uniqueEmps.map((emp, i) => ({ ...emp, serialNumber: i + 1 }));
                await Promise.all(resequenced.map(updatedEmp => 
                    dualStorage.save(COLLECTIONS.RECORDS, updatedEmp.id, { type: 'timesheet_employee', data: updatedEmp })
                ));
                return;
            }



            // Check if any loaded employees are missing englishName or englishJobTitle, or have misspelled names, and auto-backfill/correct them!
            const spellingCorrections: Record<string, string> = {
                "علي محمد منصور الخلف": "على محمد منصور الخلف",
                "معتز حامد صالح الشوربجي": "معتز حامد صالح الشوربجى",
                "أروي إبراهيم الشامسي": "أروى إبراهيم الشامسي",
                "عهد تركي فهد الدوسري": "عهد تركى فهد الدوسري",
                "مشاعل موسى بكاري": "مشاعل موسى بكارى",
                "سنتاج كاتورا ياداف": "سنتراج كاتورا ياداف",
                "جومبر جاراسيا": "جومير جاراسيا",
                "جيمي هاو قرفايو": "جيمى هاو قرقايو",
                "ماجومادار سويكوت": "ماجوما دار سوبكوت"
            };

            let hasActualCorrections = false;

            // Removed Safri special logic

            const backfillPromises = emps.map(async (emp) => {
                let updated = { ...emp };
                let changed = false;
                
                const trimmedName = emp.name ? emp.name.trim() : '';
                if (trimmedName && spellingCorrections[trimmedName] && spellingCorrections[trimmedName] !== emp.name) {
                    updated.name = spellingCorrections[trimmedName];
                    changed = true;
                }
                
                    if (!emp.englishName && trimmedName) {
                        const newEn = getEnglishNameForArabic(updated.name);
                        if (newEn && newEn !== emp.englishName) {
                            updated.englishName = newEn;
                            changed = true;
                        }
                    }
                    if (!emp.englishJobTitle && emp.jobTitle) {
                        const newJobTitle = getEnglishJobTitleForArabic(updated.jobTitle);
                        if (newJobTitle && newJobTitle !== emp.englishJobTitle) {
                            updated.englishJobTitle = newJobTitle;
                            changed = true;
                        }
                    }
                if (changed) {
                    hasActualCorrections = true;
                    return dualStorage.save(COLLECTIONS.RECORDS, emp.id, { type: 'timesheet_employee', data: updated });
                }
                return Promise.resolve();
            });

            // If we queued actual saves, wait for them and skip setting UI state this frame
            // The next onSnapshot will bring the corrected data
            if (hasActualCorrections) {
                await Promise.all(backfillPromises);
                return;
            }

            // Check if there's exactly 1 employee whose name contains "علاء احمد عنتر"
            const needsSeeding = emps.length === 1 && (
                emps[0].name.includes('علاء احمد عنتر') || 
                emps[0].name.includes('علاء أحمد عنتر')
            );

            if (needsSeeding) {
                handleSeedEmployees();
            } else {
                setEmployees(emps);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        let updatedEmployees = [...employees];
        let targetEmp: TimeSheetEmployee;

        if (editEmployee) {
            targetEmp = {
                ...editEmployee,
                name: empName,
                englishName: empEnglishName,
                jobTitle: empJobTitle,
                englishJobTitle: empEnglishJobTitle,
                showInOvertime1: empShowInOvertime1,
                showInOvertime2: empShowInOvertime2
            };
            updatedEmployees = updatedEmployees.map(emp => emp.id === targetEmp.id ? targetEmp : emp);
        } else {
            const nextSerial = employees.length > 0 ? Math.max(...employees.map(e => e.serialNumber)) + 1 : 1;
            targetEmp = {
                id: `ts-emp-${Date.now()}`,
                serialNumber: nextSerial,
                name: empName,
                englishName: empEnglishName,
                jobTitle: empJobTitle,
                englishJobTitle: empEnglishJobTitle,
                isActive: true,
                showInOvertime1: empShowInOvertime1,
                showInOvertime2: empShowInOvertime2
            };
            updatedEmployees.push(targetEmp);
        }
        
        // Optimistic UI update - instantaneous response!
        setEmployees(updatedEmployees);
        setShowAddModal(false);
        setEditEmployee(null);
        setEmpName('');
        setEmpEnglishName('');
        setEmpJobTitle('');
        setEmpEnglishJobTitle('');

        // Sync name changes/additions from Overtime tab (TimeSheet) to Payroll employees list
        try {
            let payrollEmps = [];
            const payrollSaved = localStorage.getItem('payroll_employees_2026');
            if (payrollSaved) {
                payrollEmps = JSON.parse(payrollSaved);
            } else {
                const localRecords = dualStorage.getLocalData(COLLECTIONS.RECORDS) || [];
                const payrollRec = localRecords.find((r: any) => r.id === 'payroll_employees_data');
                if (payrollRec && payrollRec.data) {
                    payrollEmps = payrollRec.data;
                } else {
                    payrollEmps = initialEmployees;
                }
            }

            if (payrollEmps && payrollEmps.length > 0) {
                const oldName = editEmployee ? editEmployee.name : empName;
                
                // Let's check if the employee already exists in Payroll
                const exists = payrollEmps.some((emp: any) => normalizeArabicName(emp.name) === normalizeArabicName(oldName));
                
                let updatedPayrollEmps;
                if (exists) {
                    updatedPayrollEmps = payrollEmps.map((emp: any) => {
                        const normPayrollAr = normalizeArabicName(emp.name);
                        const normOldAr = normalizeArabicName(oldName);
                        if (normPayrollAr === normOldAr) {
                            return {
                                ...emp,
                                name: empName,
                                nameEn: empEnglishName,
                                jobTitle: empJobTitle
                            };
                        }
                        return emp;
                    });
                } else {
                    // Create a new Employee for Payroll
                    const newPayrollId = payrollEmps.length > 0 ? Math.max(...payrollEmps.map((e: any) => e.id)) + 1 : 1;
                    const newEmp = {
                        id: newPayrollId,
                        code: `EMP-${newPayrollId}`,
                        name: empName,
                        nameEn: empEnglishName,
                        nationalId: '',
                        iban: '',
                        jobTitle: empJobTitle,
                        branch: 'الكل',
                        hireDate: '',
                        nationality: '',
                        hasInsurance: false,
                        basicSalary: 0,
                        housingAllowance: 0,
                        transportationAllowance: 0,
                        communicationAllowance: 0,
                        foodAllowance: 0,
                        bonus: 0,
                        overtime: 0,
                        commission: 0,
                        insuranceDeduction: 0,
                        generalDeduction: 0,
                        loan: 0,
                        absenceDeduction: 0,
                        isActive: true
                    };
                    updatedPayrollEmps = [...payrollEmps, newEmp];
                }
                localStorage.setItem('payroll_employees_2026', JSON.stringify(updatedPayrollEmps));
                
                // Save to dualStorage to keep it synced in DB!
                await dualStorage.save(COLLECTIONS.RECORDS, 'payroll_employees_data', {
                    type: 'payroll_employees_list',
                    data: updatedPayrollEmps
                });

                window.dispatchEvent(new Event('payroll_employees_updated'));
            }
        } catch (err) {
            console.error("Error syncing to payroll employees:", err);
        }

        // Perform DB write in background
        try {
            await dualStorage.save(COLLECTIONS.RECORDS, targetEmp.id, { type: 'timesheet_employee', data: targetEmp });
        } catch (error) {
            console.error("Error saving employee to dualStorage:", error);
        }
    };

    const confirmDelete = async () => {
        if (!employeeToDelete) return;
        const deleteId = employeeToDelete.id;
        
        // Optimistically calculate the new state
        const updatedEmployees = employees
            .filter(emp => emp.id !== deleteId)
            .map((emp, idx) => ({ ...emp, serialNumber: idx + 1 }));

        // Sync deletion to payroll employees list
        try {
            let payrollEmps = [];
            const payrollSaved = localStorage.getItem('payroll_employees_2026');
            if (payrollSaved) {
                payrollEmps = JSON.parse(payrollSaved);
            } else {
                const localRecords = dualStorage.getLocalData(COLLECTIONS.RECORDS) || [];
                const payrollRec = localRecords.find((r: any) => r.id === 'payroll_employees_data');
                if (payrollRec && payrollRec.data) {
                    payrollEmps = payrollRec.data;
                } else {
                    payrollEmps = initialEmployees;
                }
            }

            if (payrollEmps && payrollEmps.length > 0) {
                const updatedPayrollEmps = payrollEmps.filter((emp: any) => normalizeArabicName(emp.name) !== normalizeArabicName(employeeToDelete.name));
                localStorage.setItem('payroll_employees_2026', JSON.stringify(updatedPayrollEmps));
                
                // Save to DB!
                await dualStorage.save(COLLECTIONS.RECORDS, 'payroll_employees_data', {
                    type: 'payroll_employees_list',
                    data: updatedPayrollEmps
                });

                window.dispatchEvent(new Event('payroll_employees_updated'));
            }
        } catch (err) {
            console.error("Error deleting from payroll employees list:", err);
        }

        // Optimistic UI update
        setEmployees(updatedEmployees);
        setEmployeeToDelete(null);

        // Run DB operations in background
        (async () => {
            try {
                // Delete the employee
                await dualStorage.delete(COLLECTIONS.RECORDS, deleteId);
                
                // Re-sequence remaining in parallel
                const savePromises = updatedEmployees.map(emp => 
                    dualStorage.save(COLLECTIONS.RECORDS, emp.id, { type: 'timesheet_employee', data: emp })
                );
                await Promise.all(savePromises);
            } catch (error) {
                console.error("Error deleting employee or re-sequencing:", error);
            }
        })();
    };

    const handleToggleStatus = async (emp: TimeSheetEmployee) => {
        const newStatus = emp.isActive === false;
        const updated = { ...emp, isActive: newStatus };
        
        // Optimistic UI update
        setEmployees(prev => prev.map(e => e.id === emp.id ? updated : e));
        
        try {
            await dualStorage.save(COLLECTIONS.RECORDS, emp.id, { type: 'timesheet_employee', data: updated });
            
            // Sync to Payroll list
            const payrollSaved = localStorage.getItem('payroll_employees_2026');
            if (payrollSaved) {
                const payrollEmps = JSON.parse(payrollSaved);
                const normName = normalizeArabicName(emp.name);
                let changed = false;
                const updatedPayroll = payrollEmps.map((pEmp: any) => {
                    if (normalizeArabicName(pEmp.name) === normName) {
                        if (pEmp.isActive !== newStatus) {
                            changed = true;
                            return { ...pEmp, isActive: newStatus };
                        }
                    }
                    return pEmp;
                });
                
                if (changed) {
                    localStorage.setItem('payroll_employees_2026', JSON.stringify(updatedPayroll));
                    // Also save to Firestore for persistence
                    await dualStorage.save(COLLECTIONS.RECORDS, 'payroll_employees_data', {
                        type: 'payroll_employees_list',
                        data: updatedPayroll
                    });
                }
            }
        } catch (error) {
            console.error("Error toggling employee status:", error);
        }
    };

    const handleToggleOvertimeTab = async (emp: TimeSheetEmployee, tabNum: 1 | 2) => {
        const updated = {
            ...emp,
            showInOvertime1: tabNum === 1 ? !(emp.showInOvertime1 !== false) : (emp.showInOvertime1 !== false),
            showInOvertime2: tabNum === 2 ? !(emp.showInOvertime2 !== false) : (emp.showInOvertime2 !== false)
        };
        
        // Optimistic UI update
        setEmployees(prev => prev.map(e => e.id === emp.id ? updated : e));
        
        try {
            await dualStorage.save(COLLECTIONS.RECORDS, emp.id, { type: 'timesheet_employee', data: updated });
        } catch (error) {
            console.error("Error toggling overtime tab visibility:", error);
        }
    };

    const openEdit = (emp: TimeSheetEmployee) => {
        setEditEmployee(emp);
        setEmpName(emp.name);
        setEmpEnglishName(emp.englishName || '');
        setEmpJobTitle(emp.jobTitle);
        setEmpEnglishJobTitle(emp.englishJobTitle || '');
        setEmpShowInOvertime1(emp.showInOvertime1 !== false);
        setEmpShowInOvertime2(emp.showInOvertime2 !== false);
        setShowAddModal(true);
    };

    const openAdd = () => {
        setEditEmployee(null);
        setEmpName('');
        setEmpEnglishName('');
        setEmpJobTitle('');
        setEmpEnglishJobTitle('');
        setEmpShowInOvertime1(true);
        setEmpShowInOvertime2(true);
        setShowAddModal(true);
    };

    return (
        <div className="w-full space-y-3 py-4 print:py-0 print:m-0 print:p-0">
            <div className={`px-2 print:hidden sticky bg-white z-40 py-3 border-b border-gray-200 shadow-sm ${isMobile ? 'top-0' : 'top-[160px]'}`}>
                {/* Tabs */}
                <div className="flex space-x-3 overflow-x-auto pb-1">
                {(!currentUser || currentUser.username.toLowerCase() === 'alaa' || currentUser.permissions?.tsCanViewEmployees === true) && (
                    <button
                        onClick={() => setActiveTab('employees')}
                        className={`pb-2 px-2 whitespace-nowrap text-lg sm:text-xl font-bold transition-colors border-b-2 ${
                            activeTab === 'employees'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Employees
                    </button>
                )}
                {(!currentUser || currentUser.username.toLowerCase() === 'alaa' || currentUser.permissions?.tsCanViewOvertime1 === true) && (
                    <button
                        onClick={() => setActiveTab('overtime1')}
                        className={`pb-2 px-2 whitespace-nowrap text-lg sm:text-xl font-bold transition-colors border-b-2 ${
                            activeTab === 'overtime1'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Overtime 1
                    </button>
                )}
                {(!currentUser || currentUser.username.toLowerCase() === 'alaa' || currentUser.permissions?.tsCanViewOvertime2 === true) && (
                    <button
                        onClick={() => setActiveTab('overtime2')}
                        className={`pb-2 px-2 whitespace-nowrap text-lg sm:text-xl font-bold transition-colors border-b-2 ${
                            activeTab === 'overtime2'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Overtime 2
                    </button>
                )}
                {(!currentUser || currentUser.username.toLowerCase() === 'alaa' || currentUser.permissions?.tsCanViewListOvertime === true) && (
                    <button
                        onClick={() => setActiveTab('list_overtime')}
                        className={`pb-2 px-2 whitespace-nowrap text-lg sm:text-xl font-bold transition-colors border-b-2 ${
                            activeTab === 'list_overtime'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        List Overtime
                    </button>
                )}
                {(currentUser && (currentUser.username.toLowerCase() === 'alaa' || currentUser.permissions?.tsCanManageSettings === true)) && (
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`pb-2 px-2 whitespace-nowrap text-lg sm:text-xl font-bold transition-colors border-b-2 ${
                            activeTab === 'settings'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Setting
                    </button>
                )}
            </div>
            </div>

            {/* Content */}
            <div className="bg-white shadow print:shadow-none print:m-0 print:p-0">
                {activeTab === 'employees' && (
                    <div className="block">
                        <div className="space-y-4 p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Employees List ({employees.filter(emp => emp.isActive !== false).length})</h2>
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="flex bg-gray-100 rounded-md p-1">
                                    <button
                                        onClick={() => toggleNamesLanguage('en')}
                                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                                            namesLanguage === 'en'
                                                ? 'bg-white text-indigo-600 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        English Names
                                    </button>
                                    <button
                                        onClick={() => toggleNamesLanguage('ar')}
                                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                                            namesLanguage === 'ar'
                                                ? 'bg-white text-indigo-600 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Arabic Names
                                    </button>
                                </div>

                                <div className="flex bg-gray-100 rounded-md p-1">
                                    <select
                                        value={employeeFilter}
                                        onChange={(e) => {
                                            const val = e.target.value as 'all' | 'active' | 'inactive';
                                            setEmployeeFilter(val);
                                            localStorage.setItem('timesheet_employee_filter', val);
                                        }}
                                        className="px-3 py-1 text-sm font-medium rounded-md bg-transparent border-none focus:ring-0 text-gray-700 cursor-pointer"
                                    >
                                        <option value="all">All</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>

                                <div className="flex bg-gray-100 rounded-md p-1">
                                    <input
                                        type="text"
                                        placeholder="Search by employee name..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="px-3 py-1 text-sm font-medium rounded-md bg-transparent border-none focus:ring-0 text-gray-700 min-w-[150px]"
                                    />
                                </div>
                                {(!currentUser || currentUser.username.toLowerCase() === 'alaa' || currentUser.permissions?.tsCanAddEmployee === true) && (
                                    <button
                                        onClick={openAdd}
                                        className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                                    >
                                        <Plus size={18} />
                                        <span>Add Employee</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-left">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">No</th>
                                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            <div className="flex flex-col gap-1.5">
                                                <span>Employee Name (AR)</span>
                                            </div>
                                        </th>
                                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            <div className="flex flex-col gap-1.5">
                                                <span>Employee Name (EN)</span>
                                            </div>
                                        </th>
                                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Job Title (AR)</th>
                                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Job Title (EN)</th>
                                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Action & OT Tabs</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {sortedEmployees
                                        .filter(emp => employeeFilter === 'all' ? true : employeeFilter === 'active' ? emp.isActive !== false : emp.isActive === false)
                                        .filter(emp => !searchQuery || emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || (emp.englishName && emp.englishName.toLowerCase().includes(searchQuery.toLowerCase())))
                                        .map((emp, idx) => (
                                        <tr key={emp.id} className={emp.isActive === false ? 'bg-gray-50 opacity-75' : ''}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{idx + 1}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{emp.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{emp.englishName || ''}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.jobTitle}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.englishJobTitle || ''}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex justify-center space-x-4">
                                                {(!currentUser || currentUser.username.toLowerCase() === 'alaa' || currentUser.permissions?.tsCanEditEmployee === true) && (
                                                    <button
                                                        onClick={() => openEdit(emp)}
                                                        className="text-blue-600 hover:text-blue-900 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                )}
                                                {(!currentUser || currentUser.username.toLowerCase() === 'alaa' || currentUser.permissions?.tsCanDeleteEmployee === true) && (
                                                    <button
                                                        onClick={() => setEmployeeToDelete(emp)}
                                                        className="text-red-600 hover:text-red-900 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                                {(!currentUser || currentUser.username.toLowerCase() === 'alaa' || currentUser.permissions?.tsCanEditEmployee === true) && (
                                                    <button
                                                        onClick={() => handleToggleStatus(emp)}
                                                        className={`${emp.isActive !== false ? 'text-green-600 hover:text-green-900' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
                                                        title={emp.isActive !== false ? 'Deactivate' : 'Activate'}
                                                    >
                                                        {emp.isActive !== false ? <CheckCircle size={18} /> : <XCircle size={18} />}
                                                    </button>
                                                )}

                                                {/* Vertical Divider */}
                                                <div className="w-[1px] h-5 bg-gray-200"></div>

                                                {/* Overtime Checkboxes */}
                                                {(!currentUser || currentUser.username.toLowerCase() === 'alaa' || currentUser.permissions?.tsCanEditEmployee === true) && (
                                                    <div className="flex items-center gap-3 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100 shadow-sm">
                                                        <label className="inline-flex items-center space-x-1 cursor-pointer select-none">
                                                            <input
                                                                type="checkbox"
                                                                checked={emp.showInOvertime1 !== false}
                                                                onChange={() => handleToggleOvertimeTab(emp, 1)}
                                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-3 w-3 cursor-pointer"
                                                            />
                                                            <span className="text-[9px] text-gray-600 font-bold tracking-wider">O1</span>
                                                        </label>
                                                        <label className="inline-flex items-center space-x-1 cursor-pointer select-none">
                                                            <input
                                                                type="checkbox"
                                                                checked={emp.showInOvertime2 !== false}
                                                                onChange={() => handleToggleOvertimeTab(emp, 2)}
                                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-3 w-3 cursor-pointer"
                                                            />
                                                            <span className="text-[9px] text-gray-600 font-bold tracking-wider">O2</span>
                                                        </label>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {sortedEmployees.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                No employees found. Click "Add Employee" to create one.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    </div>
                )}

                {activeTab === 'overtime1' && (
                    <div className="block">
                        <TimeSheetReport 
                            employees={sortedEmployees.filter(emp => emp.isActive !== false && emp.showInOvertime1 !== false).map(emp => ({
                                ...emp,
                                name: namesLanguage === 'en' && emp.englishName ? emp.englishName : emp.name,
                                jobTitle: namesLanguage === 'en' && emp.englishJobTitle ? emp.englishJobTitle : emp.jobTitle
                            }))} 
                            title="Overtime" 
                            typeKey="overtime1" 
                            namesLanguage={namesLanguage}
                            currentUser={currentUser}
                        />
                    </div>
                )}

                {activeTab === 'overtime2' && (
                    <div className="block">
                        <TimeSheetReport 
                            employees={sortedEmployees.filter(emp => emp.isActive !== false && emp.showInOvertime2 !== false).map(emp => ({
                                ...emp,
                                name: namesLanguage === 'en' && emp.englishName ? emp.englishName : emp.name,
                                jobTitle: namesLanguage === 'en' && emp.englishJobTitle ? emp.englishJobTitle : emp.jobTitle
                            }))} 
                            title="Overtime" 
                            typeKey="overtime2" 
                            namesLanguage={namesLanguage}
                            currentUser={currentUser}
                        />
                    </div>
                )}

                {activeTab === 'list_overtime' && (
                    <div className="block">
                        <ListOvertime currentUser={currentUser} />
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="block">
                        <div className="p-4 sm:p-6 w-full">
                        
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Select User</label>
                            <select
                                value={settingsUserId}
                                onChange={(e) => setSettingsUserId(e.target.value)}
                                className="w-full sm:w-1/2 border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500 font-semibold"
                            >
                                <option value="">-- Select a User --</option>
                                {users && users
                                    .filter(u => u.username.toLowerCase() !== 'alaa')
                                    .filter((user, index, self) => 
                                        self.findIndex(u => u.username.toLowerCase() === user.username.toLowerCase()) === index
                                    )
                                    .map(user => (
                                        <option key={user.id} value={user.id}>{user.username} {user.role === 'admin' && user.username.toLowerCase() !== 'admin' ? '(Admin)' : ''}</option>
                                    ))
                                }
                            </select>
                        </div>
                        
                        <div className="p-6 border rounded-xl bg-white shadow-sm space-y-6">
                            {(() => {
                                const user = users.find(u => u.id === settingsUserId);
                                const isUserSelected = !!user;
                                const updatePerm = (key: string, value: boolean) => {
                                    if (user && onUpdateUser) {
                                        const updatedUser = {
                                            ...user,
                                            permissions: {
                                                ...user.permissions,
                                                [key]: value
                                            }
                                        };
                                        onUpdateUser(user.id, updatedUser);
                                    }
                                };
                                
                                return (
                                    <>
                                        <div className="mb-4">
                                            <h3 className="text-lg font-bold text-blue-800 mb-3 border-b border-blue-100 pb-2">
                                                Page Access
                                            </h3>
                                            <label className={`flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors ${isUserSelected ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
                                                <input
                                                    type="checkbox"
                                                    disabled={!isUserSelected}
                                                    checked={isUserSelected && (user.permissions?.allowedPages || []).includes('Time Sheet')}
                                                    onChange={(e) => {
                                                        if (user && onUpdateUser) {
                                                            const currentPages = user.permissions?.allowedPages || [];
                                                            const newAllowed = e.target.checked 
                                                                ? [...currentPages, 'Time Sheet']
                                                                : currentPages.filter(p => p !== 'Time Sheet');
                                                            onUpdateUser(user.id, {
                                                                ...user,
                                                                permissions: { ...user.permissions, allowedPages: newAllowed }
                                                            });
                                                        }
                                                    }}
                                                    className="w-4 h-4 text-blue-600 rounded"
                                                />
                                                Can Access Time Sheet Page
                                            </label>
                                        </div>

                                        <div className="mb-4">
                                            <h3 className="text-lg font-bold text-indigo-800 mb-3 border-b border-indigo-100 pb-2">
                                                Tabs Visibility
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {[
                                                    { key: 'tsCanViewEmployees', label: 'View Employees Tab' },
                                                    { key: 'tsCanViewOvertime1', label: 'View Overtime 1 Tab' },
                                                    { key: 'tsCanViewOvertime2', label: 'View Overtime 2 Tab' },
                                                    { key: 'tsCanViewListOvertime', label: 'View List Overtime Tab' },
                                                    { key: 'tsCanManageSettings', label: 'View Setting Tab' },
                                                ].map(perm => (
                                                    <label key={perm.key} className={`flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors ${isUserSelected ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
                                                        <input
                                                            type="checkbox"
                                                            disabled={!isUserSelected}
                                                            checked={isUserSelected && (user.permissions as any)?.[perm.key] === true}
                                                            onChange={(e) => updatePerm(perm.key, e.target.checked)}
                                                            className="w-4 h-4 text-indigo-600 rounded"
                                                        />
                                                        {perm.label}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <h3 className="text-lg font-bold text-teal-800 mb-3 border-b border-teal-100 pb-2">
                                                Employees Tab Permissions
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {[
                                                    { key: 'tsCanAddEmployee', label: 'Add Employee' },
                                                    { key: 'tsCanEditEmployee', label: 'Edit Employee' },
                                                    { key: 'tsCanDeleteEmployee', label: 'Delete Employee' },
                                                ].map(perm => (
                                                    <label key={perm.key} className={`flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-teal-600 transition-colors ${isUserSelected ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
                                                        <input
                                                            type="checkbox"
                                                            disabled={!isUserSelected}
                                                            checked={isUserSelected && (user.permissions as any)?.[perm.key] === true}
                                                            onChange={(e) => updatePerm(perm.key, e.target.checked)}
                                                            className="w-4 h-4 text-teal-600 rounded"
                                                        />
                                                        {perm.label}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <h3 className="text-lg font-bold text-orange-800 mb-3 border-b border-orange-100 pb-2">
                                                List Overtime Permissions
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {[
                                                    { key: 'tsCanViewArchiveO1', label: 'View Overtime 1 Archive' },
                                                    { key: 'tsCanViewArchiveO2', label: 'View Overtime 2 Archive' },
                                                    { key: 'tsCanUndoPost', label: 'Undo Post' },
                                                    { key: 'tsCanDeletePost', label: 'Delete Post' },
                                                ].map(perm => (
                                                    <label key={perm.key} className={`flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-orange-600 transition-colors ${isUserSelected ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
                                                        <input
                                                            type="checkbox"
                                                            disabled={!isUserSelected}
                                                            checked={isUserSelected && (user.permissions as any)?.[perm.key] === true}
                                                            onChange={(e) => updatePerm(perm.key, e.target.checked)}
                                                            className="w-4 h-4 text-orange-600 rounded"
                                                        />
                                                        {perm.label}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editEmployee ? 'Edit Employee' : 'Add Employee'}
                            </h3>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name (Arabic)</label>
                                <input
                                    type="text"
                                    required
                                    value={empName}
                                    onChange={(e) => setEmpName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Enter employee name in Arabic"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name (English)</label>
                                <input
                                    type="text"
                                    required
                                    value={empEnglishName}
                                    onChange={(e) => setEmpEnglishName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Enter employee name in English"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title (Arabic)</label>
                                <input
                                    type="text"
                                    required
                                    value={empJobTitle}
                                    onChange={(e) => setEmpJobTitle(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Enter job title in Arabic"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title (English)</label>
                                <input
                                    type="text"
                                    required
                                    value={empEnglishJobTitle}
                                    onChange={(e) => setEmpEnglishJobTitle(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Enter job title in English"
                                />
                            </div>
                            <div className="space-y-2 pt-2 border-t border-gray-100">
                                <span className="block text-sm font-medium text-gray-700">Show in Overtime Tabs</span>
                                <div className="flex flex-col gap-2">
                                    <label className="inline-flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={empShowInOvertime1}
                                            onChange={(e) => setEmpShowInOvertime1(e.target.checked)}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                                        />
                                        <span className="text-sm text-gray-700 select-none">Show in Overtime 1 (O1)</span>
                                    </label>
                                    <label className="inline-flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={empShowInOvertime2}
                                            onChange={(e) => setEmpShowInOvertime2(e.target.checked)}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                                        />
                                        <span className="text-sm text-gray-700 select-none">Show in Overtime 2 (O2)</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {employeeToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[300]">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
                                <Trash2 size={20} />
                                <span>Delete Employee</span>
                            </h3>
                            <button onClick={() => setEmployeeToDelete(null)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-3 mb-6 text-left">
                            <p className="text-sm text-gray-700 font-medium">
                                Are you sure you want to delete this employee? This action cannot be undone.
                            </p>
                            <div className="bg-gray-50 p-3 rounded-md border border-gray-100 text-sm">
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-600">Name:</span>
                                    <span className="text-gray-900">{employeeToDelete.name}</span>
                                </div>
                                <div className="flex justify-between mt-2">
                                    <span className="font-semibold text-gray-600">Job Title:</span>
                                    <span className="text-gray-900">{employeeToDelete.jobTitle}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setEmployeeToDelete(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
