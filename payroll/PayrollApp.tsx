import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Employee, ViewMode, Signatures, ArchivedMonth } from './types';
import { initialEmployees } from './data/initialEmployees';
import { calculateGrandTotals, calculateEmployeeTotals } from './utils/calculations';
import { exportPayrollToExcel } from './utils/excelExport';
import { getDynamicSheetTitle, getFormattedTitle, getArabicMonthName } from './utils/dateUtils';
import { generateSmartPrintCSS } from './utils/printConfig';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { PayrollTable } from './components/PayrollTable';
import { EmployeeModal } from './components/EmployeeModal';
import { PaySlipModal } from './components/PaySlipModal';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { AIAssistantModal } from './components/AIAssistantModal';
import { SettingsPage } from './components/SettingsPage';
import { ArchivePage } from './components/ArchivePage';
import { AccountStatementPage } from './components/AccountStatementPage';
import { MigrateMonthModal } from './components/MigrateMonthModal';
import { BankPayrollFile } from './components/BankPayrollFile';
import { BulkPrintCards } from './components/BulkPrintCards';
import { dualStorage, COLLECTIONS } from '../DualStorageService';

import { User } from '../types';

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
        'صفرييادافدهرمارج': 'صغرييادافدهرمارج',
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

const ensureUniqueIdsAndDeduplicate = (list: Employee[]): Employee[] => {
  if (!list || list.length === 0) return [];

  // Step 1: Deduplicate by exact code or normalized name to avoid duplicate records of the same person
  const uniqueRecords: Employee[] = [];
  const seenNames = new Set<string>();
  const seenCodes = new Set<string>();

  for (const emp of list) {
    if (!emp) continue;
    const normName = normalizeArabicName(emp.name || '');
    const code = emp.code ? emp.code.trim() : '';

    let isDuplicate = false;
    if (normName && seenNames.has(normName)) {
      isDuplicate = true;
    }
    if (code && seenCodes.has(code)) {
      isDuplicate = true;
    }

    if (!isDuplicate) {
      if (normName) seenNames.add(normName);
      if (code) seenCodes.add(code);
      uniqueRecords.push({ ...emp });
    }
  }

  // Step 2: Ensure all IDs are strictly unique and positive integers
  const finalRecords: Employee[] = [];
  const takenIds = new Set<number>();

  // First pass: keep existing valid IDs that are not duplicated
  for (const emp of uniqueRecords) {
    if (emp.id && !takenIds.has(emp.id)) {
      takenIds.add(emp.id);
      finalRecords.push(emp);
    } else {
      finalRecords.push({ ...emp, id: 0 }); 
    }
  }

  // Second pass: assign new unique IDs to any that had id = 0 or collided
  let nextId = Math.max(0, ...Array.from(takenIds)) + 1;
  if (nextId < 1) nextId = 1;

  for (const emp of finalRecords) {
    if (emp.id === 0) {
      emp.id = nextId;
      takenIds.add(nextId);
      nextId++;
    }
  }

  return finalRecords;
};

export default function PayrollApp({ currentUser }: { currentUser?: User | null }) {
  const isAlaa = useMemo(() => {
    return currentUser?.username?.toLowerCase() === 'alaa';
  }, [currentUser]);

  // Load initial employees from localStorage or fallback to initialEmployees
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('payroll_employees_2026');
    if (saved) {
      try {
        const parsed: Employee[] = JSON.parse(saved);
        const filtered = parsed.filter(emp => emp && emp.name && emp.name.trim() !== '');
        const currentInsPercent = Number(localStorage.getItem('payroll_insurance_percentage') || '10');
        const migrated = filtered.map(emp => {
          let updated = { ...emp };
          let changed = false;
          if (emp.code === '1175' || emp.name === 'محمد سليم' || emp.name === 'محمد سليم ') {
            updated.name = 'محمد تسليم';
            updated.nameEn = 'Mohamed Tasleem';
            changed = true;
          }
          if (updated.jobTitle === 'ميكانيكى') {
            updated.jobTitle = 'ميكانيكي';
            changed = true;
          }
          
          // Recalculate overtime to ensure correct 2 decimal places (correcting any past Math.round values)
          if (updated.overtimeHours && updated.overtimeHours > 0) {
            const basic = updated.basicSalary || 0;
            const hourlyRate = (basic / 240) * 1.5;
            const calculatedOvertime = Number((updated.overtimeHours * hourlyRate).toFixed(2));
            if (updated.overtime !== calculatedOvertime) {
              updated.overtime = calculatedOvertime;
              changed = true;
            }
          }
          
          // Recalculate absence deduction to ensure correct 2 decimal places
          if (updated.absenceDays && updated.absenceDays > 0) {
            const basic = updated.basicSalary || 0;
            const dailyRate = basic / 30;
            const calculatedAbsence = Number((updated.absenceDays * dailyRate).toFixed(2));
            if (updated.absenceDeduction !== calculatedAbsence) {
              updated.absenceDeduction = calculatedAbsence;
              changed = true;
            }
          }
          
          // Recalculate insurance deduction to ensure correct 2 decimal places
          if (updated.hasInsurance !== false && updated.insuranceDeduction && updated.insuranceDeduction > 0) {
            const basic = updated.basicSalary || 0;
            const housing = updated.housingAllowance || 0;
            const calculatedInsurance = Number(((basic + housing) * (currentInsPercent / 100)).toFixed(2));
            if (updated.insuranceDeduction !== calculatedInsurance) {
              updated.insuranceDeduction = calculatedInsurance;
              changed = true;
            }
          }
          
          return updated;
        });
        if (migrated.length > 0) {
          // Programmatically backfill missing employees 1078 and 1147
          const has1078 = migrated.some(emp => emp && (emp.code === '1078' || normalizeArabicName(emp.name) === normalizeArabicName('الترابي أحمد أدريس علي')));
          const has1147 = migrated.some(emp => emp && (emp.code === '1147' || normalizeArabicName(emp.name) === normalizeArabicName('نعمان حسين')));
          
          let changed = false;
          if (!has1078) {
            const emp1078 = initialEmployees.find(emp => emp.code === '1078');
            if (emp1078) {
              migrated.push(emp1078);
              changed = true;
            }
          }
          if (!has1147) {
            const emp1147 = initialEmployees.find(emp => emp.code === '1147');
            if (emp1147) {
              migrated.push(emp1147);
              changed = true;
            }
          }
          const sanitized = ensureUniqueIdsAndDeduplicate(migrated);
          if (changed || JSON.stringify(sanitized) !== JSON.stringify(migrated)) {
            localStorage.setItem('payroll_employees_2026', JSON.stringify(sanitized));
          }
          return sanitized;
        }
      } catch (e) {
        console.error("Failed to parse saved employees", e);
      }
    }
    return ensureUniqueIdsAndDeduplicate(initialEmployees);
  });

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const isUserAlaa = currentUser?.username?.toLowerCase() === 'alaa';
    if (!isUserAlaa) {
      const local = dualStorage.getLocalData(COLLECTIONS.RECORDS) || [];
      const arcRec = local.find((r: any) => r.id === 'payroll_archives_data');
      const localArchives = arcRec && arcRec.data ? (arcRec.data as ArchivedMonth[]) : [];
      if (localArchives.length > 0) {
        const sorted = [...localArchives].sort((a, b) => {
          const m1 = a.monthIso || '';
          const m2 = b.monthIso || '';
          return m2.localeCompare(m1);
        });
        const latest = sorted[0].monthIso;
        if (latest) return latest;
      }
    }

    const saved = localStorage.getItem('payroll_selected_month_iso');
    if (saved && /^\d{4}-\d{2}$/.test(saved)) {
      return saved;
    }
    return new Date().toISOString().slice(0, 7);
  });

  const [sheetTitle, setSheetTitle] = useState<string>(() => {
    const savedTitle = localStorage.getItem('payroll_sheet_title');
    if (savedTitle) return savedTitle;
    return getDynamicSheetTitle(selectedMonth);
  });

  const [signatures, setSignatures] = useState<Signatures>(() => {
    const savedSigs = localStorage.getItem('payroll_signatures');
    if (savedSigs) {
      try {
        return JSON.parse(savedSigs);
      } catch (e) {
        console.error("Failed to parse signatures", e);
      }
    }
    return {
      preparedBy: "",
      accountsManager: "علاء أحمد عنتر المرشدي",
      deputyGeneralManager: "محمد أحمد محمد البدري",
      managingDirector: "نايف محمد عبدالله الخضره"
    };
  });

  const [insurancePercentage, setInsurancePercentage] = useState<number>(() => {
    const saved = localStorage.getItem('payroll_insurance_percentage');
    return saved ? Number(saved) : 10;
  });

  useEffect(() => {
    localStorage.setItem('payroll_insurance_percentage', insurancePercentage.toString());
  }, [insurancePercentage]);

  const [archives, setArchives] = useState<ArchivedMonth[]>(() => {
    // Try to get from dualStorage cache first for better consistency
    const local = dualStorage.getLocalData(COLLECTIONS.RECORDS) || [];
    const arcRec = local.find((r: any) => r.id === 'payroll_archives_data');
    if (arcRec && arcRec.data) return arcRec.data;

    const saved = localStorage.getItem('payroll_archives_2026');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse archives", e);
      }
    }
    return [];
  });

  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [restoredArchiveId, setRestoredArchiveId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<string>('الكل');
  const [showInactive, setShowInactive] = useState<boolean>(false);
  const [payrollPhase, setPayrollPhase] = useState<'full' | 'phase1' | 'phase2'>('full');

  const activePayrollPhase = useMemo(() => {
    const isCurrentMonthArchived = archives.some(arc => arc.monthIso === selectedMonth);
    if (isCurrentMonthArchived) return 'full';
    return isAlaa ? payrollPhase : 'full';
  }, [isAlaa, payrollPhase, archives, selectedMonth]);

  const activeShowInactive = useMemo(() => {
    const isCurrentMonthArchived = archives.some(arc => arc.monthIso === selectedMonth);
    if (isCurrentMonthArchived) return true;
    return isAlaa ? showInactive : false;
  }, [isAlaa, showInactive, archives, selectedMonth]);

  // Modals state
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState<boolean>(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [employeeForSlip, setEmployeeForSlip] = useState<Employee | null>(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);
  const [isMigrateModalOpen, setIsMigrateModalOpen] = useState<boolean>(false);

  // Selection for bulk printing
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>([]);
  const [isBulkPrintOpen, setIsBulkPrintOpen] = useState<boolean>(false);
  const [bulkEmployees, setBulkEmployees] = useState<Employee[]>([]);

  // Save changes to localStorage
  useEffect(() => {
    document.title = "Alaa_Payroll Management";
  }, []);

  useEffect(() => {
    localStorage.setItem('payroll_selected_month_iso', selectedMonth);
    const title = getDynamicSheetTitle(selectedMonth);
    const finalTitle = getFormattedTitle(title, activePayrollPhase, selectedMonth);
    setSheetTitle(finalTitle);
    localStorage.setItem('payroll_sheet_title', finalTitle);
    
    // Sync to Overtime (TimeSheet) page
    window.dispatchEvent(new CustomEvent('payroll_selected_month_changed', { detail: selectedMonth }));
  }, [selectedMonth, activePayrollPhase]);

  // Listen for month selection changes in Overtime page
  useEffect(() => {
    const handleTimesheetMonthChanged = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail !== selectedMonth) {
        setSelectedMonth(customEvent.detail);
      }
    };
    window.addEventListener('timesheet_selected_month_changed', handleTimesheetMonthChanged);
    return () => window.removeEventListener('timesheet_selected_month_changed', handleTimesheetMonthChanged);
  }, [selectedMonth]);

  const lastSavedJsonRef = useRef<string>('');
  const lastSavedArchivesRef = useRef<string>(localStorage.getItem('payroll_archives_2026') || '');
  const lastSavedSettingsRef = useRef<string>('');
  const isMigratingRef = useRef<boolean>(false);
  const hasDefaultedMonthRef = useRef<boolean>(false);

  // Default non-Alaa users to the latest archived month on first load once archives are ready
  useEffect(() => {
    if (!isAlaa && archives.length > 0 && !hasDefaultedMonthRef.current) {
      const sorted = [...archives].sort((a, b) => {
        const m1 = a.monthIso || '';
        const m2 = b.monthIso || '';
        return m2.localeCompare(m1);
      });
      const latest = sorted[0]?.monthIso;
      if (latest) {
        setSelectedMonth(latest);
        hasDefaultedMonthRef.current = true;
      }
    }
  }, [isAlaa, archives]);

  // Listen for sync events from App.tsx
  useEffect(() => {
    const handleEmployeesSynced = () => {
      if (isMigratingRef.current) return;
      const saved = localStorage.getItem('payroll_employees_2026');
      if (saved && saved !== lastSavedJsonRef.current) {
        try {
          const parsed = JSON.parse(saved);
          const sanitized = ensureUniqueIdsAndDeduplicate(parsed);
          const sanitizedJson = JSON.stringify(sanitized);
          lastSavedJsonRef.current = sanitizedJson;
          setEmployees(sanitized);
        } catch (e) {
          console.error("Failed to sync employees", e);
        }
      }
    };

    const handleArchivesUpdated = () => {
      if (isMigratingRef.current) return;
      const saved = localStorage.getItem('payroll_archives_2026');
      if (saved && saved !== lastSavedArchivesRef.current) {
        try {
          lastSavedArchivesRef.current = saved;
          setArchives(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to sync archives", e);
        }
      }
    };
    const handleMonthSynced = (e: Event) => {
      if (!isAlaa) return; // Non-Alaa users maintain independent selection of archived months
      const detail = (e as CustomEvent).detail;
      if (detail && detail !== selectedMonth) {
        setSelectedMonth(detail);
      }
    };
    const handleInsuranceUpdated = () => {
      const val = localStorage.getItem('payroll_insurance_percentage');
      if (val && Number(val) !== insurancePercentage) {
        setInsurancePercentage(Number(val));
      }
    };
    const handleSignaturesUpdated = () => {
      const val = localStorage.getItem('payroll_signatures');
      const currentSignaturesJson = JSON.stringify(signatures);
      if (val && val !== currentSignaturesJson) {
        try {
          setSignatures(JSON.parse(val));
        } catch (e) {
          console.error("Failed to sync signatures", e);
        }
      }
    };
    const handleTitleUpdated = () => {
      const val = localStorage.getItem('payroll_sheet_title');
      if (val && val !== sheetTitle) {
        setSheetTitle(val);
      }
    };

    window.addEventListener('payroll_archives_updated', handleArchivesUpdated);
    window.addEventListener('payroll_selected_month_synced', handleMonthSynced);
    window.addEventListener('payroll_insurance_updated', handleInsuranceUpdated);
    window.addEventListener('payroll_signatures_updated', handleSignaturesUpdated);
    window.addEventListener('payroll_title_updated', handleTitleUpdated);
    window.addEventListener('payroll_employees_synced', handleEmployeesSynced);

    return () => {
      window.removeEventListener('payroll_archives_updated', handleArchivesUpdated);
      window.removeEventListener('payroll_selected_month_synced', handleMonthSynced);
      window.removeEventListener('payroll_insurance_updated', handleInsuranceUpdated);
      window.removeEventListener('payroll_signatures_updated', handleSignaturesUpdated);
      window.removeEventListener('payroll_title_updated', handleTitleUpdated);
      window.removeEventListener('payroll_employees_synced', handleEmployeesSynced);
    };
  }, [selectedMonth, insurancePercentage, signatures, sheetTitle, employees, archives]);

  // Listen for employee updates in Overtime page (localStorage sync)
  useEffect(() => {
    const handlePayrollEmployeesUpdated = () => {
      const saved = localStorage.getItem('payroll_employees_2026');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const filtered = parsed.filter((emp: any) => emp && emp.name && emp.name.trim() !== '');
          const sanitized = ensureUniqueIdsAndDeduplicate(filtered);
          if (sanitized.length > 0) {
            const json = JSON.stringify(sanitized);
            if (json !== JSON.stringify(employees)) {
              lastSavedJsonRef.current = json;
              setEmployees(sanitized);
            }
          }
        } catch (e) {
          console.error(e);
        }
      }
    };
    window.addEventListener('payroll_employees_updated', handlePayrollEmployeesUpdated);
    return () => window.removeEventListener('payroll_employees_updated', handlePayrollEmployeesUpdated);
  }, [employees]);

  useEffect(() => {
    const json = JSON.stringify(employees);
    localStorage.setItem('payroll_employees_2026', json);
    
    if (json !== lastSavedJsonRef.current) {
      lastSavedJsonRef.current = json;
      // Save to dualStorage
      dualStorage.save(COLLECTIONS.RECORDS, 'payroll_employees_data', {
        type: 'payroll_employees_list',
        data: employees
      }).catch(err => console.error('Error saving payroll employees to dualStorage', err));
    }
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('payroll_sheet_title', sheetTitle);
  }, [sheetTitle]);

  useEffect(() => {
    localStorage.setItem('payroll_signatures', JSON.stringify(signatures));
  }, [signatures]);

  useEffect(() => {
    const json = JSON.stringify(archives);
    localStorage.setItem('payroll_archives_2026', json);
    
    if (json !== lastSavedArchivesRef.current) {
      lastSavedArchivesRef.current = json;
      dualStorage.save(COLLECTIONS.RECORDS, 'payroll_archives_data', {
        type: 'payroll_archives',
        data: archives
      }).catch(err => console.error('Error saving payroll archives to dualStorage', err));
    }
  }, [archives]);

  // Auto-correct employee 'محيبر الرحمن الرحمن محيبر' branch from "الكل" to "المركز الرئيسي"
  useEffect(() => {
    let employeesChanged = false;
    const updatedEmployees = employees.map(emp => {
      if (
        emp && 
        (emp.code === '1184' || (emp.name && emp.name.trim() === 'محيبر الرحمن الرحمن محيبر')) && 
        emp.branch === 'الكل'
      ) {
        employeesChanged = true;
        return { ...emp, branch: 'المركز الرئيسي' };
      }
      return emp;
    });

    if (employeesChanged) {
      setEmployees(updatedEmployees);
    }

    let archivesChanged = false;
    const updatedArchives = archives.map(arc => {
      let archiveEmployeesChanged = false;
      const arcEmps = arc.employees.map(emp => {
        if (
          emp && 
          (emp.code === '1184' || (emp.name && emp.name.trim() === 'محيبر الرحمن الرحمن محيبر')) && 
          emp.branch === 'الكل'
        ) {
          archiveEmployeesChanged = true;
          return { ...emp, branch: 'المركز الرئيسي' };
        }
        return emp;
      });

      if (archiveEmployeesChanged) {
        archivesChanged = true;
        return { ...arc, employees: arcEmps };
      }
      return arc;
    });

    if (archivesChanged) {
      setArchives(updatedArchives);
    }
  }, [employees, archives]);

  // Sync global settings to dualStorage
  useEffect(() => {
    const settings = {
      selectedMonth,
      insurancePercentage,
      signatures,
      sheetTitle
    };
    const json = JSON.stringify(settings);
    if (json !== lastSavedSettingsRef.current) {
      lastSavedSettingsRef.current = json;
      dualStorage.save(COLLECTIONS.RECORDS, 'payroll_global_settings', {
        type: 'payroll_settings',
        data: settings
      }).catch(err => console.error('Error saving payroll settings to dualStorage', err));
    }
  }, [selectedMonth, insurancePercentage, signatures, sheetTitle]);

  // Determine if we are currently viewing an archived month
  const archivedMonthData = useMemo(() => {
    return archives.find(arc => arc.monthIso === selectedMonth);
  }, [archives, selectedMonth]);

  const isCurrentMonthArchived = !!archivedMonthData;

  // Use archived snapshot if archived, otherwise active state
  const displayedEmployees = useMemo(() => {
    if (!isAlaa) {
      if (isCurrentMonthArchived && archivedMonthData) {
        return archivedMonthData.employees;
      } else if (archives.length > 0) {
        // Fallback to latest archived if current selected is not archived
        const sorted = [...archives].sort((a, b) => (b.monthIso || '').localeCompare(a.monthIso || ''));
        return sorted[0].employees;
      }
      return [];
    }
    return isCurrentMonthArchived && archivedMonthData ? archivedMonthData.employees : employees;
  }, [isAlaa, isCurrentMonthArchived, archivedMonthData, employees, archives]);

  const displayedSheetTitle = useMemo(() => {
    if (!isAlaa) {
      return isCurrentMonthArchived && archivedMonthData 
        ? archivedMonthData.sheetTitle 
        : "شهر غير مؤرشف / Unarchived Month";
    }
    return isCurrentMonthArchived && archivedMonthData ? archivedMonthData.sheetTitle : sheetTitle;
  }, [isAlaa, isCurrentMonthArchived, archivedMonthData, sheetTitle]);

  // Derive unique branches
  const branches = useMemo(() => {
    const set = new Set<string>();
    set.add('الكل');
    displayedEmployees.forEach(emp => {
      if (emp.branch) set.add(emp.branch);
    });
    return Array.from(set);
  }, [displayedEmployees]);

  // Filter employees based on search & branch
  const filteredEmployees = useMemo(() => {
    return displayedEmployees.filter(emp => {
      if (!activeShowInactive && emp.isActive === false) return false;
      const matchBranch = selectedBranch === 'الكل' || emp.branch === selectedBranch;
      const matchSearch = 
        !searchTerm.trim() ||
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.jobTitle && emp.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchBranch && matchSearch;
    });
  }, [displayedEmployees, selectedBranch, searchTerm, activeShowInactive]);

  // Compute Grand Totals across filtered employees
  const totals = useMemo(() => {
    const isFiltered = selectedBranch !== 'الكل' || searchTerm.trim() !== '';
    if (isCurrentMonthArchived && archivedMonthData?.totals && !isFiltered) {
      return archivedMonthData.totals;
    }
    return calculateGrandTotals(filteredEmployees, activePayrollPhase);
  }, [isCurrentMonthArchived, archivedMonthData, filteredEmployees, activePayrollPhase, selectedBranch, searchTerm]);

  // Handlers
  const handleAddEmployeeClick = () => {
    setEmployeeToEdit(null);
    setIsEmployeeModalOpen(true);
  };

  const handleEditEmployeeClick = (emp: Employee) => {
    setEmployeeToEdit(emp);
    setIsEmployeeModalOpen(true);
  };

  const handleNextEmployee = () => {
    if (!employeeToEdit || filteredEmployees.length === 0) return;
    const currentIndex = filteredEmployees.findIndex(e => e.id === employeeToEdit.id);
    if (currentIndex >= 0 && currentIndex < filteredEmployees.length - 1) {
      setEmployeeToEdit(filteredEmployees[currentIndex + 1]);
    }
  };

  const handlePrevEmployee = () => {
    if (!employeeToEdit || filteredEmployees.length === 0) return;
    const currentIndex = filteredEmployees.findIndex(e => e.id === employeeToEdit.id);
    if (currentIndex > 0) {
      setEmployeeToEdit(filteredEmployees[currentIndex - 1]);
    }
  };

  useEffect(() => {
    const syncOvertime = () => {
      try {
        const local = dualStorage.getLocalData(COLLECTIONS.RECORDS) || [];
        
        // Get TimeSheet employees
        const tsEmployees = local
          .filter((r: any) => r && r.type === 'timesheet_employee' && r.data)
          .map((r: any) => r.data);
          
        if (tsEmployees.length === 0) {
          return;
        }
          
        // Get current selected month
        const currentMonth = selectedMonth;
        
        // Get overtime 1 and 2 grids
        const ot1Record = local.find((r: any) => r && r.type === 'timesheet_grid_overtime1' && r.data && r.data.month === currentMonth);
        const ot1Grid = ot1Record ? ot1Record.data : null;
        
        const ot2Record = local.find((r: any) => r && r.type === 'timesheet_grid_overtime2' && r.data && r.data.month === currentMonth);
        const ot2Grid = ot2Record ? ot2Record.data : null;
        
        if (!ot1Record && !ot2Record) {
          // If no overtime is posted/saved for this selected month in Timesheet, reset the hours to 0
          let hasChanges = false;
          setEmployees(prev => {
            const newEmps = prev.map(emp => {
              const tsEmp = tsEmployees.find((t: any) => {
                const normTsAr = normalizeArabicName(t.name);
                const normEmpAr = normalizeArabicName(emp.name);
                if (normTsAr && normEmpAr && normTsAr === normEmpAr) return true;
                
                const normTsEn = normalizeEnglishName(t.englishName || '');
                const normEmpEn = normalizeEnglishName(emp.nameEn || '');
                if (normTsEn && normEmpEn && normTsEn === normEmpEn) return true;
                
                return false;
              });

              let updatedEmp = { ...emp };
              let changedForThisEmp = false;

              if (emp.overtimeHours !== 0 || emp.overtime !== 0) {
                updatedEmp.overtimeHours = 0;
                updatedEmp.overtime = 0;
                changedForThisEmp = true;
              }

              if (emp.bonus !== 0) {
                updatedEmp.bonus = 0;
                changedForThisEmp = true;
              }

              if (tsEmp && tsEmp.jobTitle && emp.jobTitle !== tsEmp.jobTitle) {
                updatedEmp.jobTitle = tsEmp.jobTitle;
                changedForThisEmp = true;
              }

              if (changedForThisEmp) {
                hasChanges = true;
                return updatedEmp;
              }
              return emp;
            });
            return hasChanges ? newEmps : prev;
          });
          return;
        }
        
        const getEmployeeTotalHours = (empId: string, grid: any) => {
          if (!grid || !grid.employeesData || !grid.employeesData[empId]) return 0;
          const dData = grid.employeesData[empId];
          let sum = 0;
          for (let i = 1; i <= 31; i++) {
            const val = parseFloat(dData.days[i] || '0');
            if (!isNaN(val)) sum += val;
          }
          return sum;
        };
        
        let hasChanges = false;
        
        setEmployees(prev => {
          const newEmps = prev.map(emp => {
            const tsEmp = tsEmployees.find((t: any) => {
              const normTsAr = normalizeArabicName(t.name);
              const normEmpAr = normalizeArabicName(emp.name);
              if (normTsAr && normEmpAr && normTsAr === normEmpAr) return true;
              
              const normTsEn = normalizeEnglishName(t.englishName || '');
              const normEmpEn = normalizeEnglishName(emp.nameEn || '');
              if (normTsEn && normEmpEn && normTsEn === normEmpEn) return true;
              
              return false;
            });

            let updatedEmp = { ...emp };
            let changedForThisEmp = false;

            if (tsEmp) {
              const ot1Hours = getEmployeeTotalHours(tsEmp.id, ot1Grid);
              const ot2Hours = getEmployeeTotalHours(tsEmp.id, ot2Grid);
              const totalOtHours = ot1Hours + ot2Hours;
              
              // Correctly sync even if it is 0, to ensure new months are empty
              if (emp.overtimeHours !== totalOtHours) {
                const basic = emp.basicSalary || 0;
                const hourlyRate = (basic / 240) * 1.5;
                const calculatedOvertime = Number((totalOtHours * hourlyRate).toFixed(2));
                updatedEmp.overtimeHours = totalOtHours;
                updatedEmp.overtime = calculatedOvertime;
                changedForThisEmp = true;
              }

              // Sync bonuses from Overtime 1 and Overtime 2 grids automatically
              const ot1BonusRaw = String(ot1Grid?.employeesData?.[tsEmp.id]?.bonus || '0').replace(/,/g, '').trim();
              const ot2BonusRaw = String(ot2Grid?.employeesData?.[tsEmp.id]?.bonus || '0').replace(/,/g, '').trim();
              const ot1Bonus = parseFloat(ot1BonusRaw) || 0;
              const ot2Bonus = parseFloat(ot2BonusRaw) || 0;
              const totalBonus = ot1Bonus + ot2Bonus;

              if (emp.bonus !== totalBonus) {
                updatedEmp.bonus = totalBonus;
                changedForThisEmp = true;
              }

              if (tsEmp.jobTitle && emp.jobTitle !== tsEmp.jobTitle) {
                updatedEmp.jobTitle = tsEmp.jobTitle;
                changedForThisEmp = true;
              }
            }

            if (changedForThisEmp) {
              hasChanges = true;
              return updatedEmp;
            }
            return emp;
          });
          return hasChanges ? newEmps : prev;
        });
      } catch (err) {
        console.error('Error syncing overtime from TimeSheet', err);
      }
    };
    
    syncOvertime();
    
    // Listen for custom event from TimeSheet
    window.addEventListener('timesheet_updated', syncOvertime);
    window.addEventListener('timesheet_grid_updated', syncOvertime);
    return () => {
      window.removeEventListener('timesheet_updated', syncOvertime);
      window.removeEventListener('timesheet_grid_updated', syncOvertime);
    };
  }, [selectedMonth]);

  const handleSaveEmployee = async (emp: Employee) => {
    if (isCurrentMonthArchived || !isAlaa) return;
    let savedEmp = emp;
    if (employeeToEdit) {
      // Update existing
      setEmployees(prev => prev.map(item => item.id === emp.id ? emp : item));
    } else {
      // Add new
      const newId = employees.length > 0 ? Math.max(...employees.map(i => i.id)) + 1 : 1;
      savedEmp = { ...emp, id: newId };
      setEmployees(prev => [...prev, savedEmp]);
    }

    // Sync to TimeSheet
    try {
      const local = dualStorage.getLocalData(COLLECTIONS.RECORDS) || [];
      const tsEmployees = local
          .filter((r: any) => r && r.type === 'timesheet_employee' && r.data)
          .map((r: any) => r.data as any);
      
      const oldName = employeeToEdit ? employeeToEdit.name : savedEmp.name;
      let tsEmp = tsEmployees.find((e: any) => normalizeArabicName(e.name) === normalizeArabicName(oldName) || normalizeArabicName(e.name) === normalizeArabicName(savedEmp.name));
      if (!tsEmp) {
          tsEmp = {
              id: crypto.randomUUID(),
              serialNumber: tsEmployees.length + 1,
              name: savedEmp.name,
              englishName: savedEmp.nameEn || '',
              jobTitle: savedEmp.jobTitle,
              englishJobTitle: '',
              isActive: savedEmp.isActive !== false,
              showInOvertime1: true,
              showInOvertime2: true
          };
      } else {
          tsEmp.name = savedEmp.name;
          if (savedEmp.nameEn) tsEmp.englishName = savedEmp.nameEn;
          tsEmp.jobTitle = savedEmp.jobTitle;
          tsEmp.isActive = savedEmp.isActive !== false;
      }
      await dualStorage.save(COLLECTIONS.RECORDS, tsEmp.id, { type: 'timesheet_employee', data: tsEmp });
      window.dispatchEvent(new Event('timesheet_updated'));
    } catch(err) {
      console.error('Error syncing to TimeSheet', err);
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    if (isCurrentMonthArchived || !isAlaa) return;
    const employeeToDelete = employees.find(emp => emp.id === id);
    if (!employeeToDelete) return;

    setEmployees(prev => prev.filter(emp => emp.id !== id));

    // Also delete from Overtime (TimeSheet) page automatically!
    try {
      const records = dualStorage.getLocalData(COLLECTIONS.RECORDS) || [];
      const timesheetEmps = records
        .filter((r: any) => r && r.type === 'timesheet_employee' && r.data)
        .map((r: any) => r.data);
      
      const matchedTsEmp = timesheetEmps.find((emp: any) => normalizeArabicName(emp.name) === normalizeArabicName(employeeToDelete.name));
      if (matchedTsEmp) {
        await dualStorage.delete(COLLECTIONS.RECORDS, matchedTsEmp.id);
        
        // Re-sequence remaining timesheet employees
        const remainingTsEmps = timesheetEmps
          .filter((emp: any) => emp.id !== matchedTsEmp.id)
          .sort((a: any, b: any) => (a.serialNumber || 0) - (b.serialNumber || 0))
          .map((emp: any, idx: number) => ({ ...emp, serialNumber: idx + 1 }));

        await Promise.all(remainingTsEmps.map((emp: any) => 
          dualStorage.save(COLLECTIONS.RECORDS, emp.id, { type: 'timesheet_employee', data: emp })
        ));
      }
    } catch (err) {
      console.error("Error deleting matching timesheet employee:", err);
    }
  };

  const handleUpdateEmployeeField = (id: number, field: keyof Employee, value: number) => {
    if (isCurrentMonthArchived || !isAlaa) return;
    setEmployees(prev => prev.map(emp => {
      if (emp.id === id) {
        if (field === 'overtimeHours') {
          const basic = emp.basicSalary || 0;
          // حساب أجر الساعة = (الراتب الأساسي ÷ 240) × 1.5 حسب نظام العمل
          const hourlyRate = (basic / 240) * 1.5;
          const calculatedOvertime = Number((value * hourlyRate).toFixed(2));
          return { ...emp, overtimeHours: value, overtime: calculatedOvertime };
        }
        if (field === 'basicSalary') {
          const newBasic = value;
          const housing = emp.housingAllowance || 0;
          let updatedEmp = { ...emp, basicSalary: newBasic };
          
          if (emp.hasInsurance !== false) {
            updatedEmp.insuranceDeduction = Number(((newBasic + housing) * (insurancePercentage / 100)).toFixed(2));
          }

          if (emp.overtimeHours && emp.overtimeHours > 0) {
            const hourlyRate = (newBasic / 240) * 1.5;
            updatedEmp.overtime = Number((emp.overtimeHours * hourlyRate).toFixed(2));
          }
          if (emp.absenceDays && emp.absenceDays > 0) {
            const dailyRate = newBasic / 30;
            updatedEmp.absenceDeduction = Number((emp.absenceDays * dailyRate).toFixed(2));
          }
          return updatedEmp;
        }
        if (field === 'housingAllowance') {
          const newHousing = value;
          const basic = emp.basicSalary || 0;
          let updatedEmp = { ...emp, housingAllowance: newHousing };
          
          if (emp.hasInsurance !== false) {
            updatedEmp.insuranceDeduction = Number(((basic + newHousing) * (insurancePercentage / 100)).toFixed(2));
          }
          return updatedEmp;
        }
        if (field === 'overtime') {
          const basic = emp.basicSalary || 0;
          const hourlyRate = (basic / 240) * 1.5;
          let calculatedHours = emp.overtimeHours || 0;
          if (hourlyRate > 0) {
            calculatedHours = Number((value / hourlyRate).toFixed(2));
          }
          return { ...emp, overtime: value, overtimeHours: calculatedHours };
        }
        if (field === 'absenceDays') {
          const basic = emp.basicSalary || 0;
          const dailyRate = basic / 30;
          const calculatedDeduction = Number((value * dailyRate).toFixed(2));
          return { ...emp, absenceDays: value, absenceDeduction: calculatedDeduction };
        }
        if (field === 'absenceDeduction') {
          const basic = emp.basicSalary || 0;
          const dailyRate = basic / 30;
          let calculatedDays = emp.absenceDays || 0;
          if (dailyRate > 0) {
            calculatedDays = Number((value / dailyRate).toFixed(2));
          }
          return { ...emp, absenceDeduction: value, absenceDays: calculatedDays };
        }
        return { ...emp, [field]: value };
      }
      return emp;
    }));
  };

  const handleConfirmMigration = (newTitle: string) => {
    if (isMigratingRef.current) return;
    
    // Set migration protection flag
    isMigratingRef.current = true;
    localStorage.setItem('payroll_last_migration_time', Date.now().toString());

    // 1. Create Archive Entry
    const currentTotals = calculateGrandTotals(employees);
    const [y, m] = selectedMonth.split('-').map(Number);
    const monthName = getArabicMonthName(m);
    const newArchive: ArchivedMonth = {
      id: Date.now().toString(),
      monthName: monthName,
      archivedAt: new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }),
      sheetTitle: sheetTitle,
      employees: JSON.parse(JSON.stringify(employees)),
      totals: currentTotals,
      employeeCount: employees.length,
      monthIso: selectedMonth,
    };

    const updatedArchives = [newArchive, ...archives];
    lastSavedArchivesRef.current = JSON.stringify(updatedArchives);
    setArchives(updatedArchives);
    
    // 2. Reset Variable Data for New Month
    const resettedEmployees = employees.map(emp => ({
      ...emp,
      workingDays: 30,
      overtimeHours: 0,
      overtime: 0,
      salesCommission: 0,
      commission: 0, 
      incentives: 0,
      bonuses: 0,
      bonus: 0, 
      lateDeduction: 0,
      absenceDays: 0,
      absenceDeduction: 0,
      loans: 0,
      loan: 0, 
      otherDeductions: 0,
      generalDeduction: 0, 
    }));
    lastSavedJsonRef.current = JSON.stringify(resettedEmployees);
    setEmployees(resettedEmployees);

    // 3. Calculate Next Month
    const [year, month] = selectedMonth.split('-').map(Number);
    let nextYear = year;
    let nextMonth = month + 1;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }
    const nextMonthIso = `${nextYear}-${String(nextMonth).padStart(2, '0')}`;
    
    // Update month and view
    localStorage.setItem('payroll_sync_in_progress', 'true');
    localStorage.setItem('payroll_selected_month_iso', nextMonthIso);
    setSelectedMonth(nextMonthIso);
    setViewMode('table');
    
    // Force a custom event to notify other parts of the app
    window.dispatchEvent(new CustomEvent('payroll_selected_month_changed', { detail: nextMonthIso }));

    // Release protection after a delay to allow cloud sync to stabilize
    setTimeout(() => {
      isMigratingRef.current = false;
      localStorage.removeItem('payroll_sync_in_progress');
      alert(`تم ترحيل الشهر بنجاح. الشهر الحالي الجديد هو: ${nextMonthIso}`);
    }, 2000);
  };

  const handleDeleteArchive = (id: string) => {
    if (!isAlaa) return;
    setArchives(prev => prev.filter(a => a.id !== id));
  };

  const handleRestoreArchive = (archive: ArchivedMonth) => {
    if (!isAlaa) return;
    if (window.confirm(`هل أنت متأكد من استبدال كشف الرواتب الحالي ببيانات شهر (${archive.sheetTitle}) الأرشيفي وجعله الكشف النشط للتعديل؟`)) {
      setEmployees(archive.employees);
      setSheetTitle(archive.sheetTitle);
      if (archive.monthIso) {
        setSelectedMonth(archive.monthIso);
      }
      // Remove from archives so it becomes the editable, active month!
      setArchives(prev => prev.filter(arc => arc.id !== archive.id));
      setViewMode('table');
    }
  };

  const handleUpdateArchive = (updatedArchive: ArchivedMonth) => {
    setArchives(prev => prev.map(arc => arc.id === updatedArchive.id ? updatedArchive : arc));
    setTimeout(() => {
      alert("تم تحديث بيانات الشهر المؤرشف بنجاح");
    }, 100);
  };

  const handlePrintArchive = (archive: ArchivedMonth) => {
    if (archive.monthIso) {
      setSelectedMonth(archive.monthIso);
      setViewMode('table');
    } else {
      if (window.confirm(`هل ترغب في عرض وطباعة كشف شهر (${archive.sheetTitle})؟ سيتم تحميل الكشف في الجدول الرئيسي للطباعة.`)) {
        setEmployees(archive.employees);
        setSheetTitle(archive.sheetTitle);
        setViewMode('table');
      }
    }
  };

  const handleImportBakSuccess = (payload: any) => {
    if (payload.employees) setEmployees(payload.employees);
    if (payload.sheetTitle) setSheetTitle(payload.sheetTitle);
    if (payload.signatures) setSignatures(payload.signatures);
    if (payload.archives && Array.isArray(payload.archives)) {
      setArchives(payload.archives);
    }
  };

  const handleResetData = () => {
    if (isCurrentMonthArchived || !isAlaa) return;
    if (window.confirm("هل ترغب في إعادة ضبط جميع البيانات والرواتب إلى الـ 41 موظفاً الأصليين بالملف البنكي؟ (سيتم مسح التعديلات والإضافات)")) {
      setEmployees(initialEmployees);
      const dynamicTitle = getDynamicSheetTitle();
      setSheetTitle(dynamicTitle);
      setSignatures({
        preparedBy: "",
        accountsManager: "علاء أحمد عنتر المرشدي",
        deputyGeneralManager: "محمد أحمد محمد البدري",
        managingDirector: "نايف محمد عبدالله الخضره"
      });
      localStorage.removeItem('payroll_employees_2026');
      localStorage.setItem('payroll_sheet_title', dynamicTitle);
      localStorage.removeItem('payroll_signatures');
    }
  };

  const handleExportExcel = () => {
    exportPayrollToExcel(filteredEmployees, sheetTitle, signatures, activePayrollPhase);
  };

  const handleStandalonePrint = () => {
    try {
      const el = document.getElementById('printable-payroll-section');
      if (!el) {
        alert("لم يتم العثور على جدول الرواتب للطباعة");
        return;
      }

      const count = filteredEmployees.filter(emp => {
        const t = calculateEmployeeTotals(emp, activePayrollPhase);
        return t.netSalary > 0;
      }).length || 1;
      const isAllBranches = !selectedBranch || selectedBranch === 'الكل' || selectedBranch === 'All';
      const smartCSS = generateSmartPrintCSS(count, isAllBranches);
      
      const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map(s => s.outerHTML)
        .join('\n');

      const printWin = window.open('', '_blank', 'width=1200,height=850');
      if (printWin) {
        printWin.document.open();
        printWin.document.write(`
          <!DOCTYPE html>
          <html dir="rtl" lang="ar">
            <head>
              <meta charset="utf-8">
              <title>${getFormattedTitle(sheetTitle, activePayrollPhase)} - طباعة رسمية</title>
              ${styles}
              <style>${smartCSS}</style>
            </head>
            <body>
              ${el.outerHTML}
              <script>
                let hasPrinted = false;
                function triggerPrint() {
                  if (hasPrinted) return;
                  hasPrinted = true;
                  try {
                    window.focus();
                    window.print();
                  } catch(e) {}
                }
                if (document.readyState === 'complete' || document.readyState === 'interactive') {
                  setTimeout(triggerPrint, 350);
                } else {
                  window.addEventListener('load', function() {
                    setTimeout(triggerPrint, 350);
                  });
                }
                setTimeout(triggerPrint, 1000); // Fallback
              </script>
            </body>
          </html>
        `);
        printWin.document.close();
        
        setTimeout(() => {
          try {
            printWin.focus();
            // Removed redundant printWin.print() that was causing duplicate dialogs
          } catch(e) {}
        }, 500);
      } else {
        handleOpenInNewTab();
      }
    } catch (err) {
      console.error("Standalone print error:", err);
      handleOpenInNewTab();
    }
  };

  const handleOpenInNewTab = () => {
    try {
      const el = document.getElementById('printable-payroll-section');
      if (!el) {
        alert("لم يتم العثور على جدول الرواتب للطباعة");
        return;
      }

      const count = filteredEmployees.filter(emp => {
        const t = calculateEmployeeTotals(emp, activePayrollPhase);
        return t.netSalary > 0;
      }).length || 1;
      const smartCSS = generateSmartPrintCSS(count);
      
      const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map(s => s.outerHTML)
        .join('\n');

      const htmlContent = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
          <head>
            <meta charset="utf-8">
            <title>${getFormattedTitle(sheetTitle, activePayrollPhase)} - طباعة رسمية</title>
            ${styles}
            <style>${smartCSS}</style>
          </head>
          <body>
            ${el.outerHTML}
            <script>
              let hasPrinted = false;
              function triggerPrint() {
                if (hasPrinted) return;
                hasPrinted = true;
                try {
                  window.focus();
                  window.print();
                } catch(e) {}
              }
              if (document.readyState === 'complete' || document.readyState === 'interactive') {
                setTimeout(triggerPrint, 400);
              } else {
                window.addEventListener('load', function() {
                  setTimeout(triggerPrint, 400);
                });
              }
              setTimeout(triggerPrint, 1000); // Fallback
            </script>
          </body>
        </html>
      `;

      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      
      const newTab = window.open(blobUrl, '_blank');
      if (!newTab) {
        const a = document.createElement('a');
        a.href = blobUrl;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error("New tab print error:", err);
      alert("حدث خطأ أثناء محاولة فتح الكشف في تبويب جديد.");
    }
  };

  const handleSelectEmployee = (id: number) => {
    setSelectedEmployeeIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkPrint = () => {
    const selected = employees.filter(emp => selectedEmployeeIds.includes(emp.id));
    if (selected.length === 0) return;
    setBulkEmployees(selected);
    setIsBulkPrintOpen(true);
  };

  const handlePrintIndividual = (emp: Employee) => {
    setBulkEmployees([emp]);
    setIsBulkPrintOpen(true);
  };

  return (
    <div className="payroll-wrapper min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white" dir="rtl">
      
      {/* Application Navbar / Header */}
      <Header
        sheetTitle={displayedSheetTitle}
        onTitleChange={setSheetTitle}
        viewMode={viewMode}
        onViewChange={setViewMode}
        onAddEmployee={handleAddEmployeeClick}
        onExportExcel={handleExportExcel}
        onSmartPrint={handleStandalonePrint}
        onNewTabPrint={handleOpenInNewTab}
        onResetData={handleResetData}
        onOpenAI={() => setIsAIModalOpen(true)}
        onMigrateMonth={() => setIsMigrateModalOpen(true)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedBranch={selectedBranch}
        onBranchChange={setSelectedBranch}
        branches={branches}
        showInactive={activeShowInactive}
        onShowInactiveChange={setShowInactive}
        payrollPhase={activePayrollPhase}
        onPayrollPhaseChange={(phase) => {
          setPayrollPhase(phase);
          setSheetTitle(prevTitle => getFormattedTitle(prevTitle, phase, selectedMonth));
        }}
        selectedMonth={selectedMonth}
        onSelectedMonthChange={(newMonth) => {
          localStorage.setItem('payroll_sync_in_progress', 'true');
          setSelectedMonth(newMonth);
          // Auto-release after 2 seconds to allow local write to propagate
          setTimeout(() => localStorage.removeItem('payroll_sync_in_progress'), 2000);
        }}
        selectedCount={selectedEmployeeIds.length}
        onBulkPrint={handleBulkPrint}
        isAlaa={isAlaa}
        isArchivedView={isCurrentMonthArchived}
        archives={archives}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        
        {/* KPI Statistics Cards */}
        {viewMode === 'table' && (
          <StatsCards totals={totals} employeeCount={filteredEmployees.length} />
        )}

        {/* View Mode Switcher */}
        {viewMode === 'table' ? (
          <PayrollTable
            employees={filteredEmployees}
            totals={totals}
            onEditEmployee={handleEditEmployeeClick}
            onDeleteEmployee={handleDeleteEmployee}
            onViewPaySlip={(emp) => setEmployeeForSlip(emp)}
            onPrintEmployee={handlePrintIndividual}
            onUpdateEmployeeField={handleUpdateEmployeeField}
            signatures={signatures}
            onUpdateSignatures={setSignatures}
            sheetTitle={displayedSheetTitle}
            payrollPhase={activePayrollPhase}
            selectedEmployeeIds={selectedEmployeeIds}
            onSelectEmployee={handleSelectEmployee}
            onSelectAllEmployees={setSelectedEmployeeIds}
            isAlaa={isAlaa}
            readOnly={isCurrentMonthArchived || !isAlaa}
            selectedBranch={selectedBranch}
          />
        ) : viewMode === 'analytics' ? (
          <AnalyticsDashboard
            employees={filteredEmployees}
            totals={totals}
            payrollPhase={activePayrollPhase}
          />
        ) : viewMode === 'bank' ? (
          <BankPayrollFile
            employees={filteredEmployees.filter(emp => emp.isActive !== false)}
            sheetTitle={sheetTitle}
            signatures={signatures}
            payrollPhase={activePayrollPhase}
          />
        ) : viewMode === 'account-statement' ? (
          <AccountStatementPage
            archives={archives}
            currentEmployees={employees}
            currentMonthName={getArabicMonthName(selectedMonth)}
            signatures={signatures}
            onViewChange={setViewMode}
          />
        ) : viewMode === 'archive' ? (
          <ArchivePage
            archives={archives}
            onDeleteArchive={handleDeleteArchive}
            onRestoreArchive={handleRestoreArchive}
            onUpdateArchive={handleUpdateArchive}
            onPrintArchive={handlePrintArchive}
            onViewChange={setViewMode}
          />
        ) : viewMode === 'settings' ? (
          <SettingsPage
            employees={employees}
            sheetTitle={sheetTitle}
            signatures={signatures}
            archives={archives}
            insurancePercentage={insurancePercentage}
            onUpdateInsurancePercentage={setInsurancePercentage}
            onImportSuccess={handleImportBakSuccess}
            onUpdateSignatures={setSignatures}
            onResetData={handleResetData}
            onClearArchives={() => {
              if (window.confirm("هل أنت متأكد من مسح جميع أرشيف الرواتب السابقة؟")) {
                setArchives([]);
              }
            }}
            onViewChange={setViewMode}
          />
        ) : null}

      </main>

      {/* Modals */}
      <EmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        onSave={handleSaveEmployee}
        employeeToEdit={employeeToEdit}
        branches={branches.filter(b => b !== 'الكل')}
        insurancePercentage={insurancePercentage}
        onNext={employeeToEdit && filteredEmployees.findIndex(e => e.id === employeeToEdit.id) < filteredEmployees.length - 1 ? handleNextEmployee : undefined}
        onPrev={employeeToEdit && filteredEmployees.findIndex(e => e.id === employeeToEdit.id) > 0 ? handlePrevEmployee : undefined}
      />

      <PaySlipModal
        employee={employeeForSlip}
        onClose={() => setEmployeeForSlip(null)}
        signatures={signatures}
        sheetTitle={sheetTitle}
      />

      <AIAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        employees={filteredEmployees}
        totals={totals}
      />


      <MigrateMonthModal
        isOpen={isMigrateModalOpen}
        onClose={() => setIsMigrateModalOpen(false)}
        onConfirmMigration={handleConfirmMigration}
        currentTitle={sheetTitle}
        totals={calculateGrandTotals(filteredEmployees, 'full')}
        employeeCount={employees.length}
      />

      {isBulkPrintOpen && (
        <BulkPrintCards
          employees={bulkEmployees}
          signatures={signatures}
          sheetTitle={sheetTitle}
          onClose={() => setIsBulkPrintOpen(false)}
          payrollPhase={activePayrollPhase}
        />
      )}

    </div>
  );
}
