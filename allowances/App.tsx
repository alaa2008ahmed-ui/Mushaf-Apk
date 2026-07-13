/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import './index.css';
import EnglishDateInput from './components/EnglishDateInput';
import { Plus, FileSpreadsheet, Smartphone, Monitor, FileText, Lock, Unlock } from 'lucide-react';
import { useIsMobile } from './hooks/useIsMobile';
import { Employee, CalculatedEmployee, ArchivedRecord } from './types';
import { calculateEmployeeAllowances, triggerSafePrint, formatNumber } from './utils';
import { useFormulaSettings } from './utils/formulaSettings';
import { exportEmployeesToExcel } from './utils/exportToExcel';
import { saveOrShareFile } from './utils/fileSaverHelper';
import EmployeeTable from './components/EmployeeTable';
import EmployeeModal from './components/EmployeeModal';
import PrintEmployeeStatement from './components/PrintEmployeeStatement';
import PrintTable from './components/PrintTable';
import VacationAllowanceView from './components/VacationAllowanceView';
import LoanRequestView from './components/LoanRequestView';
import VacationRequestView from './components/VacationRequestView';
import EndOfServiceView from './components/EndOfServiceView';
import ArchiveView from './components/ArchiveView';
import SettingsView from './components/SettingsView';
import { INITIAL_DATA } from './data';
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const BRANCHES = ['الكل', 'الادارة', 'المركز الرئيسي', 'فرع المعباه', 'فرع الدمام', 'فرع الاحساء'];

const isTargetAhsaEmployee = (emp?: Partial<Employee>): boolean => {
  if (!emp || !emp.name) return false;
  const name = emp.name
    .replace(/[أإآ]/g, 'ا')
    .replace(/[ى]/g, 'ي')
    .replace(/[ة]/g, 'ه')
    .replace(/\s+/g, ' ')
    .trim();
  return (
    name.includes('التراب') ||
    name.includes('نعمان') ||
    name.includes('ادريس') ||
    name.includes('كبير')
  );
};

const applyBranchCorrections = (list: Employee[]): Employee[] => {
  return list.map(emp => {
    let branch = emp.branch;
    let ticketPrice = emp.ticketPrice;

    if (branch === 'المركز الرئيسي 1') branch = 'المركز الرئيسي';
    else if (branch === 'فرع المعبيلة' || branch === 'فرع المعبيله') branch = 'فرع المعباه';

    if (isTargetAhsaEmployee(emp)) {
      branch = 'فرع الاحساء';
    }

    let transferAllowance = emp.transferAllowance;
    let calculationDate = emp.calculationDate;
    let code = emp.code;
    let isActive = emp.isActive;
    let hireDate = emp.hireDate;
    let lastVacationReturnDate = emp.lastVacationReturnDate;

    if (emp.id === '13' || (emp.name && emp.name.includes('باسمه'))) {
      if (hireDate === '2021-01-01') hireDate = '2026-05-11';
      if (lastVacationReturnDate === '2025-12-31') lastVacationReturnDate = '2026-05-11';
    }

    if (emp.id === '14' || (emp.name && emp.name.includes('لولوه'))) {
      if (hireDate === '2021-01-01') hireDate = '2026-05-10';
      if (lastVacationReturnDate === '2025-12-31') lastVacationReturnDate = '2026-05-10';
    }

    if (emp.id === '11' || (emp.name && emp.name.includes('اماني إبراهيم يحي الفيفي'))) {
      if (code === '11' || !code) code = '1177';
      if (emp.code === '11' || isActive === undefined) isActive = false;
    }

    if (emp.id === '31' || code === '31' || code === '1168' || (emp.name && emp.name.includes('سوريش كومار'))) {
      if (code === '31' || !code) code = '1168';
      if (calculationDate === '2026-07-02') {
        calculationDate = '2026-12-31';
      }
    }

    if (emp.id === '36' || code === '36' || (emp.name && emp.name.includes('عبد الصمد عبد السلام'))) {
      if (code === '36' || !code) code = '1178';
    }

    if (emp.id === '37' || code === '37' || (emp.name && emp.name.includes('صاحب جود'))) {
      if (code === '37' || !code) code = '1179';
    }

    if ((code === '1078' || (emp.name && emp.name.includes('التراب')))) {
      if (!ticketPrice || ticketPrice === 0) ticketPrice = 1350;
      if (transferAllowance !== 0) transferAllowance = 0;
    } else if ((code === '1147' || (emp.name && emp.name.includes('نعمان')))) {
      if (!ticketPrice || ticketPrice === 0) ticketPrice = 2000;
      if (transferAllowance !== 0) transferAllowance = 0;
    }

    if (branch !== emp.branch || ticketPrice !== emp.ticketPrice || transferAllowance !== emp.transferAllowance || calculationDate !== emp.calculationDate || code !== emp.code || isActive !== emp.isActive || hireDate !== emp.hireDate || lastVacationReturnDate !== emp.lastVacationReturnDate) {
      return { ...emp, branch, ticketPrice, transferAllowance, calculationDate, code, isActive, hireDate, lastVacationReturnDate };
    }
    return emp;
  });
};

import { User } from '../types';

export default function App({ currentUser }: { currentUser: User }) {
  const isAlaa = currentUser?.username?.toLowerCase() === 'alaa';
  const isMobile = useIsMobile(768);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>(isMobile ? 'cards' : 'table');

  useEffect(() => {
    setViewMode(isMobile ? 'cards' : 'table');
  }, [isMobile]);

  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem('app_employees_data_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return applyBranchCorrections(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to parse initial allowances employees', e);
    }
    return applyBranchCorrections(INITIAL_DATA);
  });
  const [selectedBranch, setSelectedBranch] = useState<string>('الكل');
  const [vacationDurationFilter, setVacationDurationFilter] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [globalCalcDate, setGlobalCalcDate] = useState<string>(() => `${new Date().getFullYear()}-12-31`);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [employeeToPrint, setEmployeeToPrint] = useState<CalculatedEmployee | null>(null);
  const [printMode, setPrintMode] = useState<'none' | 'employee' | 'table'>('none');
  const [currentView, setCurrentView] = useState<'end-of-service' | 'end-of-service-print' | 'vacation-allowance' | 'vacation-request' | 'loan-request' | 'archive' | 'settings'>('end-of-service');

  useEffect(() => {
    const p = currentUser?.permissions;
    if (!p) return;
    const views = [
      { id: 'end-of-service', allowed: p.canViewAllowancesEndOfService },
      { id: 'end-of-service-print', allowed: p.canViewAllowancesEndOfServicePrint },
      { id: 'vacation-allowance', allowed: p.canViewAllowancesVacationAllowance },
      { id: 'vacation-request', allowed: p.canViewAllowancesVacationRequest },
      { id: 'loan-request', allowed: p.canViewAllowancesLoanRequest },
      { id: 'archive', allowed: p.canViewAllowancesArchive },
      { id: 'settings', allowed: p.canViewAllowancesSettings }
    ];

    const currentAllowed = views.find(v => v.id === currentView)?.allowed;
    if (!currentAllowed) {
      const firstAllowed = views.find(v => v.allowed);
      if (firstAllowed) {
        setCurrentView(firstAllowed.id as any);
      }
    }
  }, [currentUser?.permissions, currentView]);
  const [archivedRecords, setArchivedRecords] = useState<ArchivedRecord[]>(() => {
    try {
      const local = localStorage.getItem('app_archived_records_v1');
      if (local) return JSON.parse(local);
    } catch {}
    return [];
  });

  const [isPasswordUnlocked, setIsPasswordUnlocked] = useState<boolean>(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [enteredPassword, setEnteredPassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);

  const { settings: formulaSettings } = useFormulaSettings();

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    onConfirm: () => void;
    isDestructive?: boolean;
  } | null>(null);

  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const requirePasswordAuth = (callback: () => void) => {
    if (isPasswordUnlocked) {
      callback();
    } else {
      setPendingCallback(() => callback);
      setEnteredPassword('');
      setPasswordError('');
      setIsPasswordModalOpen(true);
    }
  };

  useEffect(() => {
    const handleAfterPrint = () => setPrintMode('none');
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  const lastSavedJsonRef = React.useRef<string>('');
  const lastSavedArchivesRef = React.useRef<string>(localStorage.getItem('app_archived_records_v1') || '');

  const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const archivesSaveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Outbound Synchronization to DualStorage (Local + Cloud)
  useEffect(() => {
    if (employees && employees.length > 0) {
      try {
        const json = JSON.stringify(employees);
        localStorage.setItem('app_employees_data_v1', json);
        
        if (json !== lastSavedJsonRef.current) {
          lastSavedJsonRef.current = json;
          if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
          saveTimeoutRef.current = setTimeout(() => {
            import('../DualStorageService').then(({ dualStorage, COLLECTIONS }) => {
              dualStorage.save(COLLECTIONS.RECORDS, 'allowances_employees_data', {
                type: 'allowances_employees_list',
                data: employees
              }).catch(err => console.error('Error saving allowances employees', err));
            });
          }, 150);
        }
      } catch (e) {
        // ignore storage errors
      }
    }
  }, [employees]);

  useEffect(() => {
    try {
      const json = JSON.stringify(archivedRecords);
      localStorage.setItem('app_archived_records_v1', json);
      
      if (json !== lastSavedArchivesRef.current) {
        lastSavedArchivesRef.current = json;
        if (archivesSaveTimeoutRef.current) clearTimeout(archivesSaveTimeoutRef.current);
        archivesSaveTimeoutRef.current = setTimeout(() => {
          import('../DualStorageService').then(({ dualStorage, COLLECTIONS }) => {
            dualStorage.save(COLLECTIONS.RECORDS, 'allowances_archives_data', {
              type: 'allowances_archives_list',
              data: archivedRecords
            }).catch(err => console.error('Error saving allowances archives', err));
          });
        }, 150);
      }
    } catch {}
  }, [archivedRecords]);

  // Inbound Synchronization from DualStorage
  useEffect(() => {
    // 1. Setup Event Listeners for real-time updates broadcast by root App.tsx
    const handleEmployeesSynced = () => {
      const saved = localStorage.getItem('app_employees_data_v1');
      if (saved && saved !== lastSavedJsonRef.current) {
        try {
          const parsed = JSON.parse(saved);
          lastSavedJsonRef.current = saved;
          setEmployees(applyBranchCorrections(parsed));
        } catch (e) {
          console.error("Failed to sync allowances employees", e);
        }
      }
    };

    const handleArchivesSynced = () => {
      const saved = localStorage.getItem('app_archived_records_v1');
      if (saved && saved !== lastSavedArchivesRef.current) {
        try {
          const parsed = JSON.parse(saved);
          lastSavedArchivesRef.current = saved;
          setArchivedRecords(parsed);
        } catch (e) {
          console.error("Failed to sync allowances archives", e);
        }
      }
    };

    window.addEventListener('allowances_employees_synced', handleEmployeesSynced);
    window.addEventListener('allowances_archives_synced', handleArchivesSynced);

    // 2. Initial Data Loading Strategy
    const loadInitialData = async () => {
      const { dualStorage, COLLECTIONS } = await import('../DualStorageService');
      const records = dualStorage.getLocalData(COLLECTIONS.RECORDS) || [];
      
      // Load Employees
      const empsData = records.find((r: any) => r.id === 'allowances_employees_data');
      if (empsData && empsData.data) {
          const json = JSON.stringify(empsData.data);
          if (json !== lastSavedJsonRef.current) {
              lastSavedJsonRef.current = json;
              localStorage.setItem('app_employees_data_v1', json);
              setEmployees(applyBranchCorrections(empsData.data));
          }
      } else {
          // Fallback if not yet in dualStorage
          const local = localStorage.getItem('app_employees_data_v1');
          if (local) {
              try {
                  const parsed = JSON.parse(local);
                  lastSavedJsonRef.current = local;
                  setEmployees(applyBranchCorrections(parsed));
              } catch(e) {}
          } else {
              setEmployees(applyBranchCorrections(INITIAL_DATA));
          }
      }

      // Load Archives
      const arcsData = records.find((r: any) => r.id === 'allowances_archives_data');
      if (arcsData && arcsData.data) {
          const json = JSON.stringify(arcsData.data);
          if (json !== lastSavedArchivesRef.current) {
              lastSavedArchivesRef.current = json;
              localStorage.setItem('app_archived_records_v1', json);
              setArchivedRecords(arcsData.data);
          }
      }
    };

    loadInitialData();

    return () => {
      window.removeEventListener('allowances_employees_synced', handleEmployeesSynced);
      window.removeEventListener('allowances_archives_synced', handleArchivesSynced);
    };
  }, []);

  const handleUpdateEmployeeField = (id: string, field: keyof Employee, value: any) => {
    requirePasswordAuth(() => {
      setEmployees(prev => {
        const updated = prev.map(emp => emp.id === id ? { ...emp, [field]: value } : emp);
        const corrected = applyBranchCorrections(updated);
        return corrected;
      });
    });
  };

  const calculatedEmployees = useMemo(() => {
    return applyBranchCorrections(employees).map(emp => {
      const targetDate = globalCalcDate || emp.calculationDate;
      return calculateEmployeeAllowances({
        ...emp,
        calculationDate: targetDate
      });
    });
  }, [employees, globalCalcDate, formulaSettings]);

  const filteredEmployees = useMemo(() => {
    let list = calculatedEmployees;
    if (selectedBranch !== 'الكل') {
      list = list.filter(emp => emp.branch === selectedBranch);
    }
    if (vacationDurationFilter > 0) {
      list = list.filter(emp => emp.durationSinceLastVacationYears >= vacationDurationFilter - 0.005);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(emp =>
        (emp.name && emp.name.toLowerCase().includes(q)) ||
        (emp.code && emp.code.toString().toLowerCase().includes(q)) ||
        (emp.jobTitle && emp.jobTitle.toLowerCase().includes(q))
      );
    }
    return list;
  }, [calculatedEmployees, selectedBranch, vacationDurationFilter, searchQuery]);

  const activeFilteredEmployees = useMemo(() => {
    return filteredEmployees.filter(emp => emp.isActive !== false);
  }, [filteredEmployees]);

  const handleSaveEmployee = async (empData: Employee | Omit<Employee, 'id' | 'sequenceNumber'>) => {
    requirePasswordAuth(async () => {
      let savedEmp: Employee;
      const isAhsaEmployee = isTargetAhsaEmployee(empData);
      const branch = isAhsaEmployee ? 'فرع الاحساء' : empData.branch;

      if ('id' in empData) {
        savedEmp = { ...(empData as Employee), branch };
        setEmployees(prev => applyBranchCorrections(prev.map(emp => emp.id === savedEmp.id ? savedEmp : emp)));
      } else {
        savedEmp = {
          ...empData,
          branch,
          id: generateUUID(),
          sequenceNumber: employees.length > 0 ? Math.max(...employees.map(e => e.sequenceNumber)) + 1 : 1,
        };
        setEmployees(prev => applyBranchCorrections([...prev, savedEmp]));
      }
      setEmployeeToEdit(savedEmp);
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Cleanup empty name employees
    setEmployees(prev => prev.filter(emp => emp.name && emp.name.trim() !== ''));
    setEmployeeToEdit(null);
  };

  const openAddModal = () => {
    requirePasswordAuth(() => {
      const newId = generateUUID();
      const newSeq = employees.length > 0 ? Math.max(...employees.map(e => e.sequenceNumber)) + 1 : 1;
      const defaultBranch = BRANCHES.find(b => b !== 'الكل' && b !== 'All') || 'الادارة';
      const newEmp: Employee = {
        id: newId,
        sequenceNumber: newSeq,
        code: '',
        jobTitle: '',
        name: '',
        branch: '',
        hireDate: new Date().toISOString().split('T')[0],
        lastVacationReturnDate: new Date().toISOString().split('T')[0],
        calculationDate: new Date().toISOString().split('T')[0],
        basicSalary: '' as unknown as number,
        housingAllowance: '' as unknown as number,
        transferAllowance: '' as unknown as number,
        phoneAllowance: '' as unknown as number,
        foodAllowance: '' as unknown as number,
        fixedAllowances: '' as unknown as number,
        ticketPrice: '' as unknown as number,
        paidEndOfService: '' as unknown as number,
        socialSecurity: '' as unknown as number,
        includeSocialSecurity: true,
        loans: '' as unknown as number,
        absence: '' as unknown as number,
        withdrawals: '' as unknown as number,
        notes: '',
        isActive: true
      };

      setEmployees(prev => applyBranchCorrections([...prev, newEmp]));
      setEmployeeToEdit(newEmp);
      setIsModalOpen(true);
    });
  };

  const handleEdit = (employee: Employee) => {
    requirePasswordAuth(() => {
      setEmployeeToEdit(employee);
      setIsModalOpen(true);
    });
  };

  const handleDelete = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'تأكيد حذف الموظف',
      message: 'هل أنت متأكد من رغبتك في حذف بيانات هذا الموظف؟',
      confirmText: 'نعم، تأكيد الحذف',
      isDestructive: true,
      onConfirm: () => {
        requirePasswordAuth(async () => {
          setEmployees(prev => prev.filter(emp => emp.id !== id));
          setNotification('تم حذف بيانات الموظف بنجاح');
        });
      }
    });
  };

  const handlePrint = (employee: CalculatedEmployee) => {
    setEmployeeToPrint(employee);
    setPrintMode('employee');
    triggerSafePrint();
  };

  const handlePrintTable = () => {
    setPrintMode('table');
    triggerSafePrint();
  };

  const handleExportExcel = () => {
    exportEmployeesToExcel(filteredEmployees, selectedBranch);
  };

  const handleExportPDF = async () => {
    setPrintMode('table');
    setTimeout(async () => {
      const element = document.getElementById('pdf-table-container');
      if (element) {
        const originalClass = element.className;
        const originalStyle = element.getAttribute('style') || '';
        
        // Make it visible temporarily for html2canvas with fixed A4 landscape width
        element.className = 'bg-white text-black';
        element.setAttribute('style', 'display: block !important; width: 280mm; padding: 2mm; font-size: 8px; box-sizing: border-box; background: white;');
        
        const opt = {
          margin: 5,
          filename: 'مخصصات_الموظفين.pdf',
          image: { type: 'jpeg', quality: 1 },
          html2canvas: { scale: 2, useCORS: true, windowWidth: 1122 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
        };
        
        try {
          const html2pdfModule = await import('html2pdf.js');
          const html2pdf = (html2pdfModule.default || html2pdfModule) as any;
          const pdfWorker = html2pdf().from(element).set(opt);
          const blob = await pdfWorker.output('blob');
          await saveOrShareFile(blob, 'مخصصات_الموظفين.pdf');
        } catch (error) {
          console.error("PDF generation failed:", error);
        } finally {
          element.className = originalClass;
          element.setAttribute('style', originalStyle);
          setPrintMode('none');
        }
      }
    }, 100);
  };

  const handleArchiveRecord = (record: Omit<ArchivedRecord, 'id' | 'date'>) => {
    setConfirmDialog({
      isOpen: true,
      title: 'تأكيد أرشفة النموذج',
      message: 'هل ترغب في أرشفة وحفظ نسخة من هذا النموذج في صفحة الأرشيف؟',
      confirmText: 'نعم، تأكيد الأرشفة',
      isDestructive: false,
      onConfirm: () => {
        const newRecord: ArchivedRecord = {
          ...record,
          id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 4),
          date: new Date().toISOString()
        };
        setArchivedRecords(prev => [newRecord, ...prev]);
        setNotification('تم أرشفة وحفظ النموذج بنجاح في صفحة الأرشيف!');
      }
    });
  };

  const handleDeleteArchivedRecord = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'تأكيد حذف النموذج من الأرشيف',
      message: 'هل أنت متأكد من رغبتك في حذف هذا النموذج من الأرشيف نهائياً؟',
      confirmText: 'نعم، تأكيد الحذف',
      isDestructive: true,
      onConfirm: () => {
        requirePasswordAuth(() => {
          setArchivedRecords(prev => prev.filter(r => r.id !== id));
          setNotification('تم حذف النموذج من الأرشيف بنجاح');
        });
      }
    });
  };

  return (
    <div dir="rtl" className={`min-h-screen ${['end-of-service-print', 'vacation-allowance', 'vacation-request', 'loan-request'].includes(currentView) ? 'bg-white' : 'bg-slate-50'} flex flex-col font-sans`}>
      {printMode === 'employee' && <PrintEmployeeStatement employee={employeeToPrint} />}
      {printMode === 'table' && <PrintTable employees={activeFilteredEmployees} branchName={selectedBranch} calcDate={globalCalcDate} />}

      <div className={`${printMode !== 'none' ? 'no-print' : ''} flex-grow flex flex-col min-h-screen`}>
        <header className="no-print sticky top-0 z-40 bg-white shadow-sm shrink-0">
          <div className="bg-white border-b border-slate-200 px-3 sm:px-8 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 sm:gap-6 overflow-x-auto scrollbar-none py-1 sm:py-0">
            <div className="flex items-center gap-3 sm:gap-6 shrink-0">
              {(isAlaa || currentUser?.permissions?.canViewAllowancesEndOfService) && (
                <button
                  onClick={() => setCurrentView('end-of-service')}
                  className={`py-3 sm:py-4 px-2 sm:px-0 text-xs sm:text-sm font-bold sm:font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 ${currentView === 'end-of-service' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                  المخصصات
                </button>
              )}
              {isAlaa && currentUser?.permissions?.canViewAllowancesEndOfServicePrint && (
                <button
                  onClick={() => setCurrentView('end-of-service-print')}
                  className={`py-3 sm:py-4 px-2 sm:px-0 text-xs sm:text-sm font-bold sm:font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 ${currentView === 'end-of-service-print' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                  مخصص نهاية الخدمة
                </button>
              )}
              {isAlaa && currentUser?.permissions?.canViewAllowancesVacationAllowance && (
                <button
                  onClick={() => setCurrentView('vacation-allowance')}
                  className={`py-3 sm:py-4 px-2 sm:px-0 text-xs sm:text-sm font-bold sm:font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 ${currentView === 'vacation-allowance' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                  مخصص الإجازة
                </button>
              )}
              {isAlaa && currentUser?.permissions?.canViewAllowancesVacationRequest && (
                <button
                  onClick={() => setCurrentView('vacation-request')}
                  className={`py-3 sm:py-4 px-2 sm:px-0 text-xs sm:text-sm font-bold sm:font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 ${currentView === 'vacation-request' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                  طلب إجازة
                </button>
              )}
              {isAlaa && currentUser?.permissions?.canViewAllowancesLoanRequest && (
                <button
                  onClick={() => setCurrentView('loan-request')}
                  className={`py-3 sm:py-4 px-2 sm:px-0 text-xs sm:text-sm font-bold sm:font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 ${currentView === 'loan-request' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                  طلب سلفة
                </button>
              )}
              {isAlaa && currentUser?.permissions?.canViewAllowancesArchive && (
                <button
                  onClick={() => setCurrentView('archive')}
                  className={`py-3 sm:py-4 px-2 sm:px-0 text-xs sm:text-sm font-bold sm:font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 ${currentView === 'archive' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                  الأرشيف
                </button>
              )}
              {isAlaa && currentUser?.permissions?.canViewAllowancesSettings && (
                <button
                  onClick={() => setCurrentView('settings')}
                  className={`py-3 sm:py-4 px-2 sm:px-0 text-xs sm:text-sm font-bold sm:font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 ${currentView === 'settings' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                  الإعدادات
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 py-1.5 sm:py-0 my-auto">
              {isAlaa && (
                <button 
                  onClick={openAddModal}
                  className="bg-indigo-600 text-white p-2 rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-sm shrink-0"
                  title="إضافة موظف / Add Employee"
                >
                  <Plus className="w-5 h-5" />
                </button>
              )}
              {isAlaa && (
                <button
                  onClick={() => {
                    if (isPasswordUnlocked) {
                      setIsPasswordUnlocked(false);
                    } else {
                      requirePasswordAuth(() => {});
                    }
                  }}
                  className={`p-2 rounded-lg transition-all flex items-center justify-center border ${
                    isPasswordUnlocked 
                      ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100' 
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                  title={isPasswordUnlocked ? 'التعديل مفتوح (انقر لقفل التعديلات) / Edit Unlocked (Click to Lock)' : 'التعديل محمي بكلمة سر / Edit Protected with Password'}
                >
                  {isPasswordUnlocked ? <Unlock className="w-5 h-5 text-amber-600" /> : <Lock className="w-5 h-5 text-slate-600" />}
                </button>
              )}
            </div>
          </div>
        </header>

        <main className={`flex-grow flex flex-col w-full mx-auto ${currentView === 'end-of-service' ? 'p-1.5 sm:p-2 gap-2 max-w-full' : ['end-of-service-print', 'vacation-allowance', 'vacation-request', 'loan-request'].includes(currentView) ? 'p-0 gap-0 w-full max-w-full' : 'p-3 sm:p-6 gap-4 sm:gap-6 max-w-[1920px]'}`}>
          {currentView === 'end-of-service' ? (
            <>
              <div className="no-print grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5 shrink-0 w-full">
            <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <p className="text-slate-500 text-xs sm:text-sm mb-1 font-semibold">إجمالي الموظفين</p>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800">{activeFilteredEmployees.length} <span className="text-slate-400 text-xs sm:text-sm font-normal">موظف</span></h3>
            </div>
            <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <p className="text-indigo-600 text-xs sm:text-sm mb-1 font-bold">إجمالي الراتب</p>
              <h3 className="text-lg sm:text-2xl font-bold text-slate-800 underline decoration-indigo-200">
                {formatNumber(activeFilteredEmployees.reduce((sum, emp) => sum + emp.totalSalary, 0))} <span className="text-slate-400 text-xs sm:text-sm font-normal">ر.س</span>
              </h3>
            </div>
            <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <p className="text-indigo-600 text-xs sm:text-sm mb-1 font-bold">مخصص الإجازات</p>
              <h3 className="text-lg sm:text-2xl font-bold text-slate-800 underline decoration-indigo-200">
                {formatNumber(activeFilteredEmployees.reduce((sum, emp) => sum + emp.vacationAllowance, 0))} <span className="text-slate-400 text-xs sm:text-sm font-normal">ر.س</span>
              </h3>
            </div>
            <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <p className="text-amber-600 text-xs sm:text-sm mb-1 font-bold">مخصص التذاكر</p>
              <h3 className="text-lg sm:text-2xl font-bold text-slate-800 underline decoration-amber-200">
                {formatNumber(activeFilteredEmployees.reduce((sum, emp) => sum + emp.ticketAllowance, 0))} <span className="text-slate-400 text-xs sm:text-sm font-normal">ر.س</span>
              </h3>
            </div>
            <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <p className="text-emerald-600 text-xs sm:text-sm mb-1 font-bold">المدفوع من نهاية الخدمة</p>
              <h3 className="text-lg sm:text-2xl font-bold text-slate-800 underline decoration-emerald-200">
                {formatNumber(activeFilteredEmployees.reduce((sum, emp) => sum + emp.paidEndOfService, 0))} <span className="text-slate-400 text-xs sm:text-sm font-normal">ر.س</span>
              </h3>
            </div>
            <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <p className="text-rose-600 text-xs sm:text-sm mb-1 font-bold">نهاية الخدمة المستحقة</p>
              <h3 className="text-lg sm:text-2xl font-bold text-slate-800 underline decoration-rose-200">
                {formatNumber(activeFilteredEmployees.reduce((sum, emp) => sum + emp.dueEndOfService, 0))} <span className="text-slate-400 text-xs sm:text-sm font-normal">ر.س</span>
              </h3>
            </div>
          </div>

          <div className="no-print bg-white p-2 sm:p-2.5 rounded-xl border border-slate-200 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-2 shadow-sm shrink-0 w-full">
            <div className="flex-1 w-full flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 sm:gap-4">
              <div className="flex flex-wrap justify-center items-center gap-1.5 sm:gap-2 w-full xl:w-auto">
                {BRANCHES.map(branch => (
                  <button
                    key={branch}
                    onClick={() => setSelectedBranch(branch)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                      selectedBranch === branch 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
                        : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {branch}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-between sm:justify-center gap-2 sm:gap-3 w-full xl:w-auto">
                <div className="flex items-center gap-1.5 sm:gap-2 bg-indigo-50/80 border border-indigo-200 px-2.5 sm:px-3 py-1.5 rounded-lg shrink-0 shadow-sm">
                  <span className="text-[11px] sm:text-xs font-bold text-indigo-900 whitespace-nowrap">تاريخ الاحتساب:</span>
                  <input
                    type="date" lang="en-GB"
                    value={globalCalcDate}
                    onChange={(e) => setGlobalCalcDate(e.target.value)}
                    onClick={(e) => { try { e.currentTarget.showPicker?.(); } catch {} }}
                    className="bg-transparent text-xs sm:text-sm font-extrabold text-indigo-600 outline-none cursor-pointer"
                  />
                </div>
                <div className="flex items-center bg-amber-50/80 border border-amber-200 px-2.5 sm:px-3 py-1.5 rounded-lg shrink-0 shadow-sm">
                  <select
                    value={vacationDurationFilter}
                    onChange={(e) => setVacationDurationFilter(Number(e.target.value))}
                    className="bg-transparent text-xs sm:text-sm font-extrabold text-amber-900 outline-none cursor-pointer"
                  >
                    <option value={0}>الكل</option>
                    <option value={1}>اكثر من سنه</option>
                    <option value={2}>اكثر من سنتين</option>
                    <option value={3}>اكثر من 3 سنوات</option>
                    <option value={4}>اكثر من 4 سنوات</option>
                    <option value={5}>اكثر من 5 سنوات</option>
                  </select>
                </div>
                <div className="relative w-full sm:w-56 flex-1 shrink-0">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="بحث باسم الموظف أو الكود..."
                    className="w-full pr-9 pl-8 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 placeholder-slate-400"
                  />
                  <svg className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600 font-bold text-xs bg-slate-200 hover:bg-slate-300 rounded-full w-5 h-5 flex items-center justify-center"
                      title="مسح البحث"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {isAlaa && (
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 shadow-sm shrink-0">
                      <button
                        type="button"
                        onClick={() => setViewMode('cards')}
                        title="بطاقات الهاتف"
                        className={`p-1.5 sm:p-2 rounded-md transition-all flex items-center justify-center ${
                          viewMode === 'cards'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-200/60'
                        }`}
                      >
                        <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode('table')}
                        title="جدول التفاصيل"
                        className={`p-1.5 sm:p-2 rounded-md transition-all flex items-center justify-center ${
                          viewMode === 'table'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-200/60'
                        }`}
                      >
                        <Monitor className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  )}

                  <button
                    onClick={handleExportPDF}
                    title="تصدير إلى PDF"
                    className="bg-white border border-gray-200 text-red-600 p-2 sm:p-2.5 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors shadow-sm shrink-0"
                  >
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                  </button>
                  <button
                    onClick={handleExportExcel}
                    title="تصدير للإكسيل"
                    className="bg-white border border-gray-200 text-emerald-700 p-2 sm:p-2.5 rounded-lg flex items-center justify-center hover:bg-emerald-50 transition-colors shadow-sm shrink-0"
                  >
                    <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700" />
                  </button>
                  <button
                    onClick={handlePrintTable}
                    title="طباعة الجدول"
                    className="bg-white border border-gray-200 text-emerald-600 p-2 sm:p-2.5 rounded-lg flex items-center justify-center hover:bg-emerald-50 transition-colors shadow-sm shrink-0"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

              <div className="flex flex-col flex-grow w-full relative">
                <EmployeeTable 
                  employees={filteredEmployees} 
                  viewMode={viewMode}
                  onPrint={handlePrint}
                  onUpdateEmployee={handleUpdateEmployeeField}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  currentUser={currentUser}
                />
              </div>
            </>
          ) : currentView === 'end-of-service-print' ? (
            <EndOfServiceView employees={activeFilteredEmployees} onArchive={handleArchiveRecord} />
          ) : currentView === 'vacation-allowance' ? (
            <VacationAllowanceView employees={activeFilteredEmployees} onArchive={handleArchiveRecord} />
          ) : currentView === 'loan-request' ? (
            <LoanRequestView employees={activeFilteredEmployees} onArchive={handleArchiveRecord} />
          ) : currentView === 'vacation-request' ? (
            <VacationRequestView employees={activeFilteredEmployees} onArchive={handleArchiveRecord} />
          ) : currentView === 'archive' ? (
            <ArchiveView records={archivedRecords} employees={employees} onDeleteRecord={handleDeleteArchivedRecord} />
          ) : currentView === 'settings' ? (
            <SettingsView
              employees={employees}
            />
          ) : null}
        </main>

        <EmployeeModal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal} 
          onSave={handleSaveEmployee}
          branches={BRANCHES.filter(b => b !== 'الكل')}
          employeeToEdit={employeeToEdit}
        />

        {isPasswordModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-xs w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
              <div className="bg-slate-800 text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🔒</span>
                  <h3 className="font-bold text-base">مصادقة أمنية للتعديل</h3>
                </div>
                <button 
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (enteredPassword.trim() === '0120301012') {
                    setIsPasswordUnlocked(true);
                    setIsPasswordModalOpen(false);
                    setPasswordError('');
                    if (pendingCallback) {
                      pendingCallback();
                      setPendingCallback(null);
                    }
                  } else {
                    setPasswordError('كلمة السر غير صحيحة، يرجى إدخال 0120301012 للمتابعة.');
                  }
                }}
                className="p-5 space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">كلمة السر الصلاحية:</label>
                  <input 
                    type="password"
                    autoFocus
                    value={enteredPassword}
                    onChange={(e) => {
                      setEnteredPassword(e.target.value);
                      setPasswordError('');
                    }}
                    placeholder="أدخل كلمة السر..."
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-center tracking-widest text-lg bg-slate-50"
                  />
                  {passwordError && (
                    <p className="text-xs text-rose-600 font-semibold mt-2 flex items-center gap-1">
                      <span>⚠️</span> {passwordError}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm"
                  >
                    تأكيد ومتابعة
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPasswordModalOpen(false)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-sm transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {confirmDialog && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
              <div className={`p-5 flex items-center justify-between text-white ${confirmDialog.isDestructive ? 'bg-rose-600' : 'bg-indigo-600'}`}>
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{confirmDialog.isDestructive ? '⚠️' : 'ℹ️'}</span>
                  <h3 className="font-bold text-base">{confirmDialog.title}</h3>
                </div>
                <button 
                  onClick={() => setConfirmDialog(null)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 space-y-5">
                <p className="text-slate-700 text-base font-medium leading-relaxed">
                  {confirmDialog.message}
                </p>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      const cb = confirmDialog.onConfirm;
                      setConfirmDialog(null);
                      cb();
                    }}
                    className={`flex-1 text-white py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm ${confirmDialog.isDestructive ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                  >
                    {confirmDialog.confirmText}
                  </button>
                  <button
                    onClick={() => setConfirmDialog(null)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-sm transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {notification && (
          <div className="fixed bottom-6 left-6 z-50 animate-in slide-in-from-bottom duration-300">
            <div className="bg-slate-800 text-white px-5 py-3.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-3">
              <span className="text-emerald-400 text-lg">✅</span>
              <span className="text-sm font-semibold">{notification}</span>
              <button 
                onClick={() => setNotification(null)}
                className="text-slate-400 hover:text-white mr-2 text-xs"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
