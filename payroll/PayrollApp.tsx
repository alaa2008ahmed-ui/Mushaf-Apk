import React, { useState, useEffect, useMemo, useRef } from "react";
import { Employee, ViewMode, Signatures, ArchivedMonth } from "./types";
import { initialEmployees } from "./data/initialEmployees";
import { initialArchives } from "./data/initialArchives";
import {
  calculateGrandTotals,
  calculateEmployeeTotals,
} from "./utils/calculations";
import { exportPayrollToExcel } from "./utils/excelExport";
import {
  getDynamicSheetTitle,
  getFormattedTitle,
  getArabicMonthName,
} from "./utils/dateUtils";
import { generateSmartPrintCSS } from "./utils/printConfig";
import { Header } from "./components/Header";
import { StatsCards } from "./components/StatsCards";
import { PayrollTable } from "./components/PayrollTable";
import { EmployeeModal } from "./components/EmployeeModal";
import { PaySlipModal } from "./components/PaySlipModal";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import { AIAssistantModal } from "./components/AIAssistantModal";
import { SettingsPage } from "./components/SettingsPage";
import { ArchivePage } from "./components/ArchivePage";
import { AccountStatementPage } from "./components/AccountStatementPage";
import { MigrateMonthModal } from "./components/MigrateMonthModal";
import { ArchivedSheetEditor } from "./components/ArchivedSheetEditor";
import { BankPayrollFile } from "./components/BankPayrollFile";
import { BulkPrintCards } from "./components/BulkPrintCards";
import { dualStorage, COLLECTIONS } from "../DualStorageService";

import { User } from "../types";

const normalizeArabicName = (name: string) => {
  if (!name) return "";
  let n = name
    .replace(/أ|إ|آ/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/\s+/g, "")
    .trim();
  const aliases: Record<string, string> = {
    جيميهاوقرفايو: "جيميهاوقرقايو",
    سنتاجكاتوراياداف: "سنتراجكاتوراياداف",
    جومبرجاراسيا: "جوميرجاراسيا",
    ماجومادارسويكوت: "ماجومادارسوبكوت",
    نعمانكبيرحسين: "نعمانحسين",
  };
  return aliases[n] || n;
};

const normalizeEnglishName = (name: string) => {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
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
    const normName = normalizeArabicName(emp.name || "");
    const code = emp.code ? emp.code.trim() : "";

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

const getSafeSavedArchives = () => {
  const saved2026 = localStorage.getItem("payroll_archives_2026");
  if (saved2026 && saved2026 !== "[]") return saved2026;
  const saved = localStorage.getItem("payroll_archives");
  if (saved && saved !== "[]") return saved;
  return saved2026 || saved || "[]";
};

const getLatestArchivedMonth = (archivesList: any[]) => {
  if (!archivesList || archivesList.length === 0) return null;
  const sorted = [...archivesList].sort((a, b) => (b.monthIso || "").localeCompare(a.monthIso || ""));
  return sorted[0].monthIso;
};

const getNextMonthIso = (monthIso: string) => {
  const [year, month] = monthIso.split("-").map(Number);
  let nextYear = year;
  let nextMonth = month + 1;
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear += 1;
  }
  return `${nextYear}-${String(nextMonth).padStart(2, "0")}`;
};

const syncMonthlyValuesForEmployee = (emp: Employee, month: string): Employee => {
  const variableFields = [
    "overtimeHours",
    "overtime",
    "commission",
    "bonus",
    "generalDeduction",
    "loan",
    "absenceDays",
    "absenceDeduction"
  ] as const;

  const currentMonthValues = {
    ...(emp.monthlyValues?.[month] || {})
  };
  variableFields.forEach(f => {
    currentMonthValues[f] = emp[f] as any;
  });

  return {
    ...emp,
    monthlyValues: {
      ...(emp.monthlyValues || {}),
      [month]: currentMonthValues
    }
  };
};

export default function PayrollApp({
  currentUser,
}: {
  currentUser?: User | null;
}) {
  const isAlaa = useMemo(() => {
    const username = currentUser?.username?.toLowerCase();
    return (
      username === "alaa" ||
      currentUser?.role === "admin" ||
      currentUser?.permissions?.canViewPayroll === true
    );
  }, [currentUser]);

  const isExactlyAlaa = useMemo(() => {
    return currentUser?.username?.toLowerCase() === "alaa";
  }, [currentUser]);

  // Load initial employees from localStorage or fallback to initialEmployees
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem("payroll_employees_2026");
    if (saved) {
      try {
        const parsed: Employee[] = JSON.parse(saved);
        const filtered = parsed.filter(
          (emp) => emp && emp.name && emp.name.trim() !== "",
        );
        const currentInsPercent = Number(
          localStorage.getItem("payroll_insurance_percentage") || "10",
        );
        const migrated = filtered.map((emp) => {
          let updated = { ...emp };
          let changed = false;
          if (
            emp.name === "محمد سليم" ||
            emp.name === "محمد سليم "
          ) {
            updated.name = "محمد تسليم";
            changed = true;
          }
          if (emp.code === "1175" && (!emp.nameEn || emp.nameEn === "Mohamed Tasleem")) {
            updated.nameEn = "MD Mohamed Tasleem";
            changed = true;
          }

          if (updated.jobTitle === "ميكانيكى") {
            updated.jobTitle = "ميكانيكي";
            changed = true;
          }

          // Recalculate overtime to ensure correct 2 decimal places (correcting any past Math.round values)
          if (updated.overtimeHours && updated.overtimeHours > 0) {
            const basic = updated.basicSalary || 0;
            const hourlyRate = (basic / 240) * 1.5;
            const calculatedOvertime = Number(
              (updated.overtimeHours * hourlyRate).toFixed(2),
            );
            if (updated.overtime !== calculatedOvertime) {
              updated.overtime = calculatedOvertime;
              changed = true;
            }
          }

          // Recalculate absence deduction to ensure correct 2 decimal places
          if (updated.absenceDays && updated.absenceDays > 0) {
            const basic = updated.basicSalary || 0;
            const dailyRate = basic / 30;
            const calculatedAbsence = Number(
              (updated.absenceDays * dailyRate).toFixed(2),
            );
            if (updated.absenceDeduction !== calculatedAbsence) {
              updated.absenceDeduction = calculatedAbsence;
              changed = true;
            }
          }

          // Recalculate insurance deduction to ensure correct 2 decimal places
          if (
            updated.hasInsurance !== false &&
            updated.insuranceDeduction &&
            updated.insuranceDeduction > 0
          ) {
            const basic = updated.basicSalary || 0;
            const housing = updated.housingAllowance || 0;
            const calculatedInsurance = Number(
              ((basic + housing) * (currentInsPercent / 100)).toFixed(2),
            );
            if (updated.insuranceDeduction !== calculatedInsurance) {
              updated.insuranceDeduction = calculatedInsurance;
              changed = true;
            }
          }

          return updated;
        });

        let finalMigrated = migrated;
        return finalMigrated;
      } catch (err) {
        console.error("Error parsing employees", err);
      }
    }
    return initialEmployees;
  });

  const [archives, setArchives] = useState<any[]>(() => {
    const saved = getSafeSavedArchives();
    const parsed = saved ? JSON.parse(saved) : [];
    
    // Seed with initialArchives if missing
    const initial = initialArchives || [];
    const merged = [...parsed];
    initial.forEach(arc => {
      if (!merged.find(m => m.monthIso === arc.monthIso)) {
        merged.push(arc);
      }
    });

    // Remove Jan-May 2026 as per user request
    const toRemove = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05'];
    const filtered = merged.filter(arc => !toRemove.includes(arc.monthIso));

    return filtered;
  });

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const saved = getSafeSavedArchives();
    let localArchives = saved ? JSON.parse(saved) : [];
    
    // Filter out Jan-May 2026 for latest calculation
    const toRemove = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05'];
    localArchives = localArchives.filter((arc: any) => !toRemove.includes(arc.monthIso));
    
    const latest = getLatestArchivedMonth(localArchives);
    const isUsernameAlaa = currentUser?.username?.toLowerCase() === "alaa";
    
    if (isUsernameAlaa) {
      if (latest) {
        return getNextMonthIso(latest);
      }
      return new Date().toISOString().substring(0, 7);
    } else {
      if (latest) {
        return latest;
      }
      return new Date().toISOString().substring(0, 7);
    }
  });

  const isInitialMonthSetRef = useRef(false);

  useEffect(() => {
    if (isInitialMonthSetRef.current) return;
    
    const latest = getLatestArchivedMonth(archives);
    const isUsernameAlaa = currentUser?.username?.toLowerCase() === "alaa";
    
    if (isUsernameAlaa) {
      if (latest) {
        setSelectedMonth(getNextMonthIso(latest));
        isInitialMonthSetRef.current = true;
      }
    } else {
      if (latest) {
        setSelectedMonth(latest);
        isInitialMonthSetRef.current = true;
      }
    }
  }, [archives, currentUser]);

  const handleSelectedMonthChange = (newMonth: string) => {
    isInitialMonthSetRef.current = true;
    localStorage.setItem("payroll_sync_in_progress", "true");
    setSelectedMonth(newMonth);
    setTimeout(
      () => localStorage.removeItem("payroll_sync_in_progress"),
      2000,
    );
  };

  const [viewMode, setViewMode] = useState<string>("table");

  const [signatures, setSignatures] = useState<any>(() => {
    const saved = localStorage.getItem("payroll_signatures");
    return saved
      ? JSON.parse(saved)
      : {
          preparedBy: "",
          accountsManager: "علاء أحمد عنتر المرشدي",
          deputyGeneralManager: "محمد أحمد محمد البدري",
          managingDirector: "نايف محمد عبدالله الخضره",
        };
  });

  const [activePayrollPhase, setPayrollPhase] = useState<
    "full" | "phase1" | "phase2"
  >("full");
  const [activeShowInactive, setShowInactive] = useState(false);

  // Missing States and Refs
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [insurancePercentage, setInsurancePercentage] = useState<number>(() =>
    Number(localStorage.getItem("payroll_insurance_percentage") || "10"),
  );
  const isMigratingRef = useRef(false);
  const lastSavedArchivesRef = useRef(getSafeSavedArchives());
  const lastSavedJsonRef = useRef(
    localStorage.getItem("payroll_employees_2026") || "[]"
  );
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<any[]>([]);
  const [isBulkPrintOpen, setIsBulkPrintOpen] = useState(false);
  const [bulkEmployees, setBulkEmployees] = useState<Employee[]>([]);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isMigrateModalOpen, setIsMigrateModalOpen] = useState(false);
  const [employeeForSlip, setEmployeeForSlip] = useState<Employee | null>(null);
  const [editingArchiveData, setEditingArchiveData] = useState<ArchivedMonth | null>(null);

  const archivedMonthData = useMemo(() => {
    return archives.find((arc) => arc.monthIso === selectedMonth);
  }, [archives, selectedMonth]);

  const isCurrentMonthArchived = !!archivedMonthData;

  const [sheetTitle, setSheetTitle] = useState(() => {
    const saved = localStorage.getItem("payroll_sheetTitle");
    if (saved) return saved;
    return getDynamicSheetTitle(new Date());
  });

  const displayedSheetTitle = useMemo(() => {
    if (isCurrentMonthArchived && archivedMonthData) {
      return archivedMonthData.sheetTitle;
    }
    if (!isAlaa) return "شهر غير مؤرشف";
    return getFormattedTitle(sheetTitle, activePayrollPhase, selectedMonth);
  }, [
    sheetTitle,
    activePayrollPhase,
    selectedMonth,
    isAlaa,
    isCurrentMonthArchived,
    archivedMonthData,
  ]);

  // Sync changes to TimeSheet documents (Two-way sync)
  useEffect(() => {
    if (!employees || employees.length === 0) return;

    const syncToTimeSheet = async () => {
      for (const emp of employees) {
        const tsRecords = dualStorage.getLocalData(COLLECTIONS.RECORDS);
        const existingTs = tsRecords.find(
          (r: any) =>
            r &&
            r.type === "timesheet_employee" &&
            r.data &&
            (normalizeArabicName(r.data.name) === normalizeArabicName(emp.name) || (r.data.code && r.data.code === emp.code)),
        );

        if (existingTs) {
          const tsData = existingTs.data;
          const needsSync = 
            tsData.isActive !== (emp.isActive !== false) ||
            tsData.name !== emp.name ||
            tsData.englishName !== emp.nameEn ||
            tsData.jobTitle !== emp.jobTitle ||
            tsData.code !== emp.code;

          if (needsSync) {
            const updatedTs = { 
              ...tsData, 
              isActive: emp.isActive !== false,
              name: emp.name,
              englishName: emp.nameEn,
              jobTitle: emp.jobTitle,
              code: emp.code
            };
            await dualStorage.save(COLLECTIONS.RECORDS, existingTs.id, {
              type: "timesheet_employee",
              data: updatedTs,
            });
          }
        }
      }
    };

    syncToTimeSheet();
  }, [employees]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("الكل");
  const [employeeToEdit, setEmployeeToEdit] = useState<any>(null);

  // Save/Sync employees to localStorage and Firestore
  useEffect(() => {
    if (!employees || employees.length === 0) return;

    // Prevent saving if we are in the middle of a migration reset
    if (isMigratingRef.current) return;

    const employeesJson = JSON.stringify(employees);
    if (employeesJson === lastSavedJsonRef.current) return;
    lastSavedJsonRef.current = employeesJson;

    // Save to localStorage
    localStorage.setItem("payroll_employees_2026", employeesJson);

    // Save to Firestore (dualStorage)
    dualStorage
      .save(COLLECTIONS.RECORDS, "payroll_employees_data", {
        type: "payroll_employees_list",
        data: employees,
      })
      .catch((err) => {
        console.error("Error saving payroll employees to Firestore:", err);
      });
  }, [employees]);

  // Save/Sync archives to localStorage and Firestore
  useEffect(() => {
    if (!archives) return;

    const archivesJson = JSON.stringify(archives);
    if (archivesJson === lastSavedArchivesRef.current) return;
    lastSavedArchivesRef.current = archivesJson;

    // Save to localStorage
    localStorage.setItem("payroll_archives", archivesJson);
    localStorage.setItem("payroll_archives_2026", archivesJson);

    // Save to Firestore (dualStorage)
    dualStorage
      .save(COLLECTIONS.RECORDS, "payroll_archives_data", {
        type: "payroll_archives_list",
        data: archives,
      })
      .catch((err) => {
        console.error("Error saving archives to Firestore:", err);
      });
  }, [archives]);

  // Load month-specific variables when the selected month or employees list changes
  useEffect(() => {
    if (!employees || employees.length === 0) return;
    if (isCurrentMonthArchived) return;

    let needsUpdate = false;
    const updatedEmployees = employees.map((emp) => {
      const monthData = emp.monthlyValues?.[selectedMonth];
      const variableFields = [
        "overtimeHours",
        "overtime",
        "commission",
        "bonus",
        "generalDeduction",
        "loan",
        "absenceDays",
        "absenceDeduction"
      ] as const;

      let changedForEmp = false;
      const updatedEmp = { ...emp };

      variableFields.forEach((field) => {
        const expectedValue = monthData && monthData[field] !== undefined ? monthData[field] : 0;
        if (updatedEmp[field] !== expectedValue) {
          updatedEmp[field] = expectedValue as any;
          changedForEmp = true;
        }
      });

      if (changedForEmp) {
        needsUpdate = true;
        // Make sure monthlyValues has selectedMonth set
        updatedEmp.monthlyValues = {
          ...(updatedEmp.monthlyValues || {}),
          [selectedMonth]: {
            ...(updatedEmp.monthlyValues?.[selectedMonth] || {})
          }
        };
        variableFields.forEach((field) => {
          updatedEmp.monthlyValues![selectedMonth][field] = updatedEmp[field] as any;
        });
      }

      return updatedEmp;
    });

    if (needsUpdate) {
      setEmployees(updatedEmployees);
    }
  }, [selectedMonth, isCurrentMonthArchived, employees]);

  // Save sheet title and signatures
  useEffect(() => {
    if (sheetTitle) {
      localStorage.setItem("payroll_sheetTitle", sheetTitle);
      localStorage.setItem("payroll_sheet_title", sheetTitle);
    }
  }, [sheetTitle]);

  useEffect(() => {
    if (signatures) {
      localStorage.setItem("payroll_signatures", JSON.stringify(signatures));
    }
  }, [signatures]);

  // Listen for external real-time sync events from Firestore
  useEffect(() => {
    const syncFromDualStorage = () => {
      try {
        const records = dualStorage.getLocalData(COLLECTIONS.RECORDS) || [];
        
        // Sync Employees
        const empRecord = records.find((r: any) => r.id === "payroll_employees_data");
        if (empRecord && empRecord.data && Array.isArray(empRecord.data) && empRecord.data.length > 0) {
          setEmployees(prev => {
            const currentStr = JSON.stringify(prev);
            const newStr = JSON.stringify(empRecord.data);
            if (currentStr !== newStr) {
              lastSavedJsonRef.current = newStr;
              localStorage.setItem("payroll_employees_2026", newStr);
              return empRecord.data;
            }
            return prev;
          });
        }

        // Sync Archives
        const arcRecord = records.find((r: any) => r.id === "payroll_archives_data");
        if (arcRecord && arcRecord.data && Array.isArray(arcRecord.data)) {
          // Filter out Jan-May 2026
          const toRemove = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05'];
          const filteredData = arcRecord.data.filter((arc: any) => !toRemove.includes(arc.monthIso));

          setArchives(prev => {
            const currentStr = JSON.stringify(prev);
            const newStr = JSON.stringify(filteredData);
            if (currentStr !== newStr) {
              lastSavedArchivesRef.current = newStr;
              localStorage.setItem("payroll_archives", newStr);
              localStorage.setItem("payroll_archives_2026", newStr);
              return filteredData;
            }
            return prev;
          });
        }
      } catch (err) {
        console.error("Error syncing from dual storage:", err);
      }
    };

    const handleEmployeesSynced = () => {
      syncFromDualStorage();
      
      // Fallback for localStorage updates from other tabs
      const saved = localStorage.getItem("payroll_employees_2026");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setEmployees(prev => {
              const currentStr = JSON.stringify(prev);
              if (JSON.stringify(parsed) !== currentStr) {
                lastSavedJsonRef.current = saved;
                return parsed;
              }
              return prev;
            });
          }
        } catch (e) {
          console.error("Error parsing synced employees", e);
        }
      }
    };

    const handleArchivesUpdated = () => {
      syncFromDualStorage();

      const saved = getSafeSavedArchives();
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            // Filter out Jan-May 2026
            const toRemove = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05'];
            const filteredData = parsed.filter((arc: any) => !toRemove.includes(arc.monthIso));

            setArchives(prev => {
              const currentStr = JSON.stringify(prev);
              const filteredStr = JSON.stringify(filteredData);
              if (filteredStr !== currentStr) {
                lastSavedArchivesRef.current = filteredStr;
                return filteredData;
              }
              return prev;
            });
          }
        } catch (e) {
          console.error("Error parsing synced archives", e);
        }
      }
    };

    // Run once on mount
    syncFromDualStorage();

    window.addEventListener("payroll_employees_updated", handleEmployeesSynced);
    window.addEventListener("payroll_employees_synced", handleEmployeesSynced);
    window.addEventListener("payroll_archives_updated", handleArchivesUpdated);

    return () => {
      window.removeEventListener("payroll_employees_updated", handleEmployeesSynced);
      window.removeEventListener("payroll_employees_synced", handleEmployeesSynced);
      window.removeEventListener("payroll_archives_updated", handleArchivesUpdated);
    };
  }, []);

  // Use archived snapshot if archived, otherwise active state
  const displayedEmployees = useMemo(() => {
    if (!isAlaa) {
      if (isCurrentMonthArchived && archivedMonthData) {
        return archivedMonthData.employees;
      } else if (archives.length > 0) {
        // Fallback to latest archived if current selected is not archived
        const sorted = [...archives].sort((a, b) =>
          (b.monthIso || "").localeCompare(a.monthIso || ""),
        );
        return sorted[0].employees;
      }
      return [];
    }
    return isCurrentMonthArchived && archivedMonthData
      ? archivedMonthData.employees
      : employees;
  }, [isAlaa, isCurrentMonthArchived, archivedMonthData, employees, archives]);

  // Derive unique branches
  const branches = useMemo(() => {
    const set = new Set<string>();
    set.add("الكل");
    displayedEmployees.forEach((emp) => {
      if (emp.branch) set.add(emp.branch);
    });
    return Array.from(set);
  }, [displayedEmployees]);

  // Filter employees based on search & branch
  const filteredEmployees = useMemo(() => {
    const list = displayedEmployees.filter((emp) => {
      // For archived months, do not filter out inactive or unregistered employees - show everyone completely
      if (!isCurrentMonthArchived && !activeShowInactive && emp.isActive === false) return false;
      const matchBranch =
        selectedBranch === "الكل" || emp.branch === selectedBranch;
      const matchSearch =
        !searchTerm.trim() ||
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.jobTitle &&
          emp.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchBranch && matchSearch;
    });

    const branchOrder = [
      "الادارة",
      "المركز الرئيسي",
      "فرع الدمام",
      "فرع الاحساء",
      "فرع المعباه",
    ];

    return [...list].sort((a, b) => {
      const idxA = a.branch ? branchOrder.indexOf(a.branch.trim()) : -1;
      const idxB = b.branch ? branchOrder.indexOf(b.branch.trim()) : -1;
      const valA = idxA !== -1 ? idxA : 999;
      const valB = idxB !== -1 ? idxB : 999;
      return valA - valB;
    });
  }, [displayedEmployees, selectedBranch, searchTerm, activeShowInactive]);

  // Compute Grand Totals across filtered employees
  const totals = useMemo(() => {
    return calculateGrandTotals(filteredEmployees, activePayrollPhase);
  }, [filteredEmployees, activePayrollPhase]);

  // Handlers
  const handleAddEmployeeClick = () => {
    const newId =
      employees.length > 0 ? Math.max(...employees.map((i) => i.id)) + 1 : 1;
    const newCode = Math.floor(1000 + Math.random() * 9000).toString();
    const defaultBranch =
      branches.find((b) => b !== "الكل" && b !== "All") || "الادارة";
    const newEmp: Employee = {
      id: newId,
      code: "",
      name: "",
      nameEn: "",
      nationalId: "",
      jobTitle: "",
      branch: "",
      hireDate: new Date().toISOString().split("T")[0],
      iban: "",
      nationality: "",
      hasInsurance: false,
      isActive: true,
      basicSalary: "" as unknown as number,
      overtimeHours: "" as unknown as number,
      overtime: "" as unknown as number,
      communicationAllowance: "" as unknown as number,
      housingAllowance: "" as unknown as number,
      foodAllowance: "" as unknown as number,
      transportationAllowance: "" as unknown as number,
      commission: "" as unknown as number,
      bonus: "" as unknown as number,
      insuranceDeduction: "" as unknown as number,
      generalDeduction: "" as unknown as number,
      loan: "" as unknown as number,
      absenceDeduction: "" as unknown as number,
      endOfServicePaid: "" as unknown as number,
      paymentStage: "1",
    };

    setEmployees((prev) => [...prev, newEmp]);
    setEmployeeToEdit(newEmp);
    setIsEmployeeModalOpen(true);
  };

  const handleCloseEmployeeModal = () => {
    setIsEmployeeModalOpen(false);
    // Cleanup any employee with an empty or whitespace name
    setEmployees((prev) =>
      prev.filter((emp) => emp.name && emp.name.trim() !== ""),
    );
    setEmployeeToEdit(null);
  };

  const handleEditEmployeeClick = (emp: Employee) => {
    setEmployeeToEdit(emp);
    setIsEmployeeModalOpen(true);
  };

  const handleNextEmployee = () => {
    if (!employeeToEdit || filteredEmployees.length === 0) return;
    const currentIndex = filteredEmployees.findIndex(
      (e) => e.id === employeeToEdit.id,
    );
    if (currentIndex >= 0 && currentIndex < filteredEmployees.length - 1) {
      setEmployeeToEdit(filteredEmployees[currentIndex + 1]);
    }
  };

  const handlePrevEmployee = () => {
    if (!employeeToEdit || filteredEmployees.length === 0) return;
    const currentIndex = filteredEmployees.findIndex(
      (e) => e.id === employeeToEdit.id,
    );
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
          .filter((r: any) => r && r.type === "timesheet_employee" && r.data)
          .map((r: any) => r.data);

        if (tsEmployees.length === 0) {
          return;
        }

        // Get current selected month
        const currentMonth = selectedMonth;

        // Get overtime 1 and 2 grids
        const ot1Record = local.find(
          (r: any) =>
            r &&
            r.type === "timesheet_grid_overtime1" &&
            r.data &&
            r.data.month === currentMonth,
        );
        const ot1Grid = ot1Record ? ot1Record.data : null;

        const ot2Record = local.find(
          (r: any) =>
            r &&
            r.type === "timesheet_grid_overtime2" &&
            r.data &&
            r.data.month === currentMonth,
        );
        const ot2Grid = ot2Record ? ot2Record.data : null;

        const getEmployeeTotalHours = (empId: string, grid: any) => {
          if (!grid || !grid.employeesData) return 0;

          let dData = grid.employeesData[empId];
          const targetTsEmp = tsEmployees.find((e: any) => e.id === empId);

          if (
            (!dData || !dData.days || Object.keys(dData.days).length === 0) &&
            targetTsEmp
          ) {
            const targetNormAr = normalizeArabicName(targetTsEmp.name);
            for (const key of Object.keys(grid.employeesData)) {
              const otherTsEmp = tsEmployees.find((e: any) => e.id === key);
              if (
                otherTsEmp &&
                normalizeArabicName(otherTsEmp.name) === targetNormAr
              ) {
                dData = grid.employeesData[key];
                break;
              }
            }
          }

          if (!dData) return 0;
          let sum = 0;
          for (let i = 1; i <= 31; i++) {
            const val = parseFloat(dData.days[i] || "0");
            if (!isNaN(val)) sum += val;
          }
          return sum;
        };

        const getEmployeeBonus = (empId: string, grid: any) => {
          if (!grid || !grid.employeesData) return 0;

          let dData = grid.employeesData[empId];
          const targetTsEmp = tsEmployees.find((e: any) => e.id === empId);

          if ((!dData || !dData.bonus) && targetTsEmp) {
            const targetNormAr = normalizeArabicName(targetTsEmp.name);
            for (const key of Object.keys(grid.employeesData)) {
              const otherTsEmp = tsEmployees.find((e: any) => e.id === key);
              if (
                otherTsEmp &&
                normalizeArabicName(otherTsEmp.name) === targetNormAr
              ) {
                dData = grid.employeesData[key];
                break;
              }
            }
          }

          return dData && dData.bonus
            ? parseFloat(String(dData.bonus).replace(/,/g, "").trim()) || 0
            : 0;
        };

        const updateEmps = (
          emps: Employee[],
        ): { changed: boolean; emps: Employee[] } => {
          let changed = false;
          const updated = emps.map((emp) => {
            const tsEmp = tsEmployees.find((t: any) => {
              const normTsAr = normalizeArabicName(t.name);
              const normEmpAr = normalizeArabicName(emp.name);
              if (normTsAr && normEmpAr && normTsAr === normEmpAr) return true;
              const normTsEn = normalizeEnglishName(t.englishName || "");
              const normEmpEn = normalizeEnglishName(emp.nameEn || "");
              if (normTsEn && normEmpEn && normTsEn === normEmpEn) return true;
              return false;
            });
            let updatedEmp = { ...emp };
            let changedForThisEmp = false;
            if (tsEmp) {
              const ot1Hours = getEmployeeTotalHours(tsEmp.id, ot1Grid);
              const ot2Hours = getEmployeeTotalHours(tsEmp.id, ot2Grid);
              const totalOtHours = ot1Hours + ot2Hours;
              if (emp.overtimeHours !== totalOtHours) {
                const basic = emp.basicSalary || 0;
                const hourlyRate = (basic / 240) * 1.5;
                updatedEmp.overtimeHours = totalOtHours;
                updatedEmp.overtime = Number(
                  (totalOtHours * hourlyRate).toFixed(2),
                );
                changedForThisEmp = true;
              }
              const totalBonus =
                getEmployeeBonus(tsEmp.id, ot1Grid) +
                getEmployeeBonus(tsEmp.id, ot2Grid);
              if (emp.bonus !== totalBonus) {
                updatedEmp.bonus = totalBonus;
                changedForThisEmp = true;
              }
            }
            if (changedForThisEmp) {
              changed = true;
              return syncMonthlyValuesForEmployee(updatedEmp, currentMonth);
            }
            return emp;
          });
          return { changed, emps: updated };
        };
        setEmployees((prev) => {
          const res = updateEmps(prev);
          return res.changed ? res.emps : prev;
        });
      } catch (err) {
        console.error("Error syncing overtime from TimeSheet", err);
      }
    };

    syncOvertime();

    // Listen for custom event from TimeSheet
    window.addEventListener("timesheet_updated", syncOvertime);
    window.addEventListener("timesheet_grid_updated", syncOvertime);
    return () => {
      window.removeEventListener("timesheet_updated", syncOvertime);
      window.removeEventListener("timesheet_grid_updated", syncOvertime);
    };
  }, [selectedMonth]);

  const handleSaveEmployee = async (emp: Employee) => {
    if (isCurrentMonthArchived || !isAlaa) return;
    let savedEmp = syncMonthlyValuesForEmployee(emp, selectedMonth);
    const oldEmp = employees.find((item) => item.id === emp.id);

    let newEmployees: Employee[];
    if (oldEmp) {
      // Update existing
      newEmployees = employees.map((item) => (item.id === emp.id ? savedEmp : item));
      setEmployees(newEmployees);
    } else {
      // Add new
      const newId = emp.id
        ? emp.id
        : employees.length > 0
          ? Math.max(...employees.map((i) => i.id)) + 1
          : 1;
      savedEmp = { ...savedEmp, id: newId };
      newEmployees = [...employees, savedEmp];
      setEmployees(newEmployees);
    }
    setEmployeeToEdit(savedEmp);

    // Synchronously save to dual storage to prevent race condition with incoming snapshot from tsEmp
    const employeesJson = JSON.stringify(newEmployees);
    lastSavedJsonRef.current = employeesJson;
    localStorage.setItem("payroll_employees_2026", employeesJson);
    dualStorage
      .save(COLLECTIONS.RECORDS, "payroll_employees_data", {
        type: "payroll_employees_list",
        data: newEmployees,
      })
      .catch((err) => {
        console.error("Error saving payroll employees to Firestore:", err);
      });

    // Sync to TimeSheet
    try {
      const local = dualStorage.getLocalData(COLLECTIONS.RECORDS) || [];
      const tsEmployees = local
        .filter((r: any) => r && r.type === "timesheet_employee" && r.data)
        .map((r: any) => r.data as any);

      const oldName = oldEmp ? oldEmp.name : savedEmp.name;
      let tsEmp = tsEmployees.find(
        (e: any) =>
          normalizeArabicName(e.name) === normalizeArabicName(oldName) ||
          normalizeArabicName(e.name) === normalizeArabicName(savedEmp.name),
      );

      const getEnglishJobTitleForArabic = (arabicTitle: string): string => {
        if (!arabicTitle) return "";
        const map: Record<string, string> = {
          "العضو المنتدب": "Managing Director",
          "شئون موظفين": "Personnel Affairs",
          "نائب المدير العام": "Deputy General Manager",
          "مدير المبيعات": "Sales Manager",
          "محاسب عام": "General Accountant",
          "امين صندوق": "Treasurer",
          "محاسبة مبيعات": "Sales Accountant",
          محاسبة: "Accountant",
          ميكانيكي: "Mechanic",
          "مراقب حركة سيارات": "Car Movement Controller",
          "سائق شاحنه": "Truck Driver",
          "سائق نقل": "Transport Driver",
          "سائق شاحنة ثقيلة": "Heavy Truck Driver",
          "مشغل محطة": "Station Operator",
          "عامل شحن وتفريغ": "Loading and Unloading Worker",
          "عامل ورشه": "Workshop Worker",
          "مندوبة مشتريات": "Purchasing Representative",
        };
        return map[arabicTitle.trim()] || arabicTitle;
      };

      if (!tsEmp) {
        tsEmp = {
          id: crypto.randomUUID(),
          serialNumber: tsEmployees.length + 1,
          name: savedEmp.name,
          englishName: savedEmp.nameEn || "",
          jobTitle: savedEmp.jobTitle,
          englishJobTitle: getEnglishJobTitleForArabic(savedEmp.jobTitle),
          isActive: savedEmp.isActive !== false,
          showInOvertime1: true,
          showInOvertime2: true,
        };
      } else {
        tsEmp.name = savedEmp.name;
        tsEmp.englishName = savedEmp.nameEn || "";
        tsEmp.jobTitle = savedEmp.jobTitle;
        tsEmp.englishJobTitle = getEnglishJobTitleForArabic(savedEmp.jobTitle);
        tsEmp.isActive = savedEmp.isActive !== false;
      }
      await dualStorage.save(COLLECTIONS.RECORDS, tsEmp.id, {
        type: "timesheet_employee",
        data: tsEmp,
      });
      window.dispatchEvent(new Event("timesheet_updated"));
    } catch (err) {
      console.error("Error syncing to TimeSheet", err);
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    if (isCurrentMonthArchived || !isAlaa) return;
    const employeeToDelete = employees.find((emp) => emp.id === id);
    if (!employeeToDelete) return;

    const newEmployees = employees.filter((emp) => emp.id !== id);
    setEmployees(newEmployees);

    // Synchronously save to dual storage to prevent race condition
    const employeesJson = JSON.stringify(newEmployees);
    lastSavedJsonRef.current = employeesJson;
    localStorage.setItem("payroll_employees_2026", employeesJson);
    dualStorage
      .save(COLLECTIONS.RECORDS, "payroll_employees_data", {
        type: "payroll_employees_list",
        data: newEmployees,
      })
      .catch(console.error);

    // Also delete from Overtime (TimeSheet) page automatically!
    try {
      const records = dualStorage.getLocalData(COLLECTIONS.RECORDS) || [];
      const timesheetEmps = records
        .filter((r: any) => r && r.type === "timesheet_employee" && r.data)
        .map((r: any) => r.data);

      const matchedTsEmp = timesheetEmps.find(
        (emp: any) =>
          normalizeArabicName(emp.name) ===
          normalizeArabicName(employeeToDelete.name),
      );
      if (matchedTsEmp) {
        await dualStorage.delete(COLLECTIONS.RECORDS, matchedTsEmp.id);

        // Re-sequence remaining timesheet employees
        const remainingTsEmps = timesheetEmps
          .filter((emp: any) => emp.id !== matchedTsEmp.id)
          .sort(
            (a: any, b: any) => (a.serialNumber || 0) - (b.serialNumber || 0),
          )
          .map((emp: any, idx: number) => ({ ...emp, serialNumber: idx + 1 }));

        await Promise.all(
          remainingTsEmps.map((emp: any) =>
            dualStorage.save(COLLECTIONS.RECORDS, emp.id, {
              type: "timesheet_employee",
              data: emp,
            }),
          ),
        );
      }
    } catch (err) {
      console.error("Error deleting matching timesheet employee:", err);
    }
  };

  const handleUpdateEmployeeField = (
    id: number,
    field: keyof Employee,
    value: number,
  ) => {
    if (isCurrentMonthArchived || !isAlaa) return;
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === id) {
          let updatedEmp = emp;
          if (field === "overtimeHours") {
            const basic = emp.basicSalary || 0;
            // حساب أجر الساعة = (الراتب الأساسي ÷ 240) × 1.5 حسب نظام العمل
            const hourlyRate = (basic / 240) * 1.5;
            const calculatedOvertime = Number((value * hourlyRate).toFixed(2));
            updatedEmp = {
              ...emp,
              overtimeHours: value,
              overtime: calculatedOvertime,
            };
          } else if (field === "basicSalary") {
            const newBasic = value;
            const housing = emp.housingAllowance || 0;
            let tmpEmp = { ...emp, basicSalary: newBasic };

            if (emp.hasInsurance !== false) {
              tmpEmp.insuranceDeduction = Number(
                ((newBasic + housing) * (insurancePercentage / 100)).toFixed(2),
              );
            }

            if (emp.overtimeHours && emp.overtimeHours > 0) {
              const hourlyRate = (newBasic / 240) * 1.5;
              tmpEmp.overtime = Number(
                (emp.overtimeHours * hourlyRate).toFixed(2),
              );
            }
            if (emp.absenceDays && emp.absenceDays > 0) {
              const dailyRate = newBasic / 30;
              tmpEmp.absenceDeduction = Number(
                (emp.absenceDays * dailyRate).toFixed(2),
              );
            }
            updatedEmp = tmpEmp;
          } else if (field === "housingAllowance") {
            const newHousing = value;
            const basic = emp.basicSalary || 0;
            let tmpEmp = { ...emp, housingAllowance: newHousing };

            if (emp.hasInsurance !== false) {
              tmpEmp.insuranceDeduction = Number(
                ((basic + newHousing) * (insurancePercentage / 100)).toFixed(2),
              );
            }
            updatedEmp = tmpEmp;
          } else if (field === "overtime") {
            const basic = emp.basicSalary || 0;
            const hourlyRate = (basic / 240) * 1.5;
            let calculatedHours = emp.overtimeHours || 0;
            if (hourlyRate > 0) {
              calculatedHours = Number((value / hourlyRate).toFixed(2));
            }
            updatedEmp = { ...emp, overtime: value, overtimeHours: calculatedHours };
          } else if (field === "absenceDays") {
            const basic = emp.basicSalary || 0;
            const dailyRate = basic / 30;
            const calculatedDeduction = Number((value * dailyRate).toFixed(2));
            updatedEmp = {
              ...emp,
              absenceDays: value,
              absenceDeduction: calculatedDeduction,
            };
          } else if (field === "absenceDeduction") {
            const basic = emp.basicSalary || 0;
            const dailyRate = basic / 30;
            let calculatedDays = emp.absenceDays || 0;
            if (dailyRate > 0) {
              calculatedDays = Number((value / dailyRate).toFixed(2));
            }
            updatedEmp = {
              ...emp,
              absenceDeduction: value,
              absenceDays: calculatedDays,
            };
          } else {
            updatedEmp = { ...emp, [field]: value };
          }
          return syncMonthlyValuesForEmployee(updatedEmp, selectedMonth);
        }
        return emp;
      }),
    );
  };

  const handleConfirmMigration = (newTitle: string) => {
    if (isMigratingRef.current) return;

    // Set migration protection flag
    isMigratingRef.current = true;
    localStorage.setItem("payroll_last_migration_time", Date.now().toString());

    // 1. Create Archive Entry (Only active employees)
    const activeEmployeesToArchive = employees.filter((emp) => emp.isActive !== false);
    const currentTotals = calculateGrandTotals(activeEmployeesToArchive);
    const [y, m] = selectedMonth.split("-").map(Number);
    const monthName = getArabicMonthName(m);
    const newArchive: ArchivedMonth = {
      id: Date.now().toString(),
      monthName: monthName,
      archivedAt: new Date().toISOString().split("T")[0],
      sheetTitle: sheetTitle,
      employees: JSON.parse(JSON.stringify(activeEmployeesToArchive)),
      totals: currentTotals,
      employeeCount: activeEmployeesToArchive.length,
      monthIso: selectedMonth,
    };

    const updatedArchives = [newArchive, ...archives];
    lastSavedArchivesRef.current = JSON.stringify(updatedArchives);
    setArchives(updatedArchives);

    // 2. Reset Variable Data for New Month (Keep deductions, advances, bonuses, etc. only in the archived month where they were recorded)
    // 2. إعادة تصفير المتغيرات للشهر الجديد (الاحتفاظ بالخصومات والسلف والمكافآت وغيرها فقط في الشهر المؤرشف الذي سجلت فيه، والبدء بصفحة نظيفة للشهر الجديد)
    const resettedEmployees = employees.map((emp) => ({
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
    const [year, month] = selectedMonth.split("-").map(Number);
    let nextYear = year;
    let nextMonth = month + 1;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }
    const nextMonthIso = `${nextYear}-${String(nextMonth).padStart(2, "0")}`;

    // Update month and view
    localStorage.setItem("payroll_sync_in_progress", "true");
    localStorage.setItem("payroll_selected_month_iso", nextMonthIso);
    setSelectedMonth(nextMonthIso);
    setViewMode("table");

    // Force a custom event to notify other parts of the app
    window.dispatchEvent(
      new CustomEvent("payroll_selected_month_changed", {
        detail: nextMonthIso,
      }),
    );

    // Release protection after a delay to allow cloud sync to stabilize
    setTimeout(() => {
      isMigratingRef.current = false;
      localStorage.removeItem("payroll_sync_in_progress");
      alert(`تم ترحيل الشهر بنجاح. الشهر الحالي الجديد هو: ${nextMonthIso}\nMonth migrated successfully. The new current month is: ${nextMonthIso}`);
    }, 2000);
  };

  const handleDeleteArchive = (id: string) => {
    if (!isAlaa) return;
    setArchives((prev) => prev.filter((a) => a.id !== id));
  };

  const handleRestoreArchive = (archive: ArchivedMonth) => {
    if (!isAlaa) return;
    if (
      window.confirm(
        `هل أنت متأكد من استبدال كشف الرواتب الحالي ببيانات شهر (${archive.sheetTitle}) الأرشيفي وجعله الكشف النشط للتعديل؟\n\nAre you sure you want to replace the current payroll sheet with the archived data of month (${archive.sheetTitle}) and make it the active editable sheet?`,
      )
    ) {
      setEmployees(archive.employees);
      setSheetTitle(archive.sheetTitle);
      if (archive.monthIso) {
        setSelectedMonth(archive.monthIso);
      }
      // Remove from archives so it becomes the editable, active month!
      setArchives((prev) => prev.filter((arc) => arc.id !== archive.id));
      setViewMode("table");
    }
  };

  const handleUpdateArchive = (updatedArchive: ArchivedMonth) => {
    setArchives((prev) =>
      prev.map((arc) => (arc.id === updatedArchive.id ? updatedArchive : arc)),
    );
    setTimeout(() => {
      alert("تم تحديث بيانات الشهر المؤرشف بنجاح\nArchived month data updated successfully");
    }, 100);
  };

  const handleOpenArchiveEditor = (archive: ArchivedMonth) => {
    setEditingArchiveData(archive);
    setViewMode("edit-archive");
  };

  const handlePrintArchive = (archive: ArchivedMonth) => {
    if (archive.monthIso) {
      setSelectedMonth(archive.monthIso);
      setViewMode("table");
    } else {
      if (
        window.confirm(
          `هل ترغب في عرض وطباعة كشف شهر (${archive.sheetTitle})؟ سيتم تحميل الكشف في الجدول الرئيسي للطباعة.`,
        )
      ) {
        setEmployees(archive.employees);
        setSheetTitle(archive.sheetTitle);
        setViewMode("table");
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
    if (
      window.confirm(
        "هل ترغب في إعادة ضبط جميع البيانات والرواتب إلى الـ 41 موظفاً الأصليين بالملف البنكي؟ (سيتم مسح التعديلات والإضافات)",
      )
    ) {
      setEmployees(initialEmployees);
      const dynamicTitle = getDynamicSheetTitle();
      setSheetTitle(dynamicTitle);
      setSignatures({
        preparedBy: "",
        accountsManager: "علاء أحمد عنتر المرشدي",
        deputyGeneralManager: "محمد أحمد محمد البدري",
        managingDirector: "نايف محمد عبدالله الخضره",
      });
      localStorage.removeItem("payroll_employees_2026");
      localStorage.setItem("payroll_sheet_title", dynamicTitle);
      localStorage.removeItem("payroll_signatures");
    }
  };

  const handleExportExcel = () => {
    exportPayrollToExcel(
      filteredEmployees,
      sheetTitle,
      signatures,
      activePayrollPhase,
    );
  };

  const handleStandalonePrint = () => {
    try {
      const el = document.getElementById("printable-payroll-section");
      if (!el) {
        alert("لم يتم العثور على جدول الرواتب للطباعة");
        return;
      }

      const count =
        filteredEmployees.filter((emp) => {
          const t = calculateEmployeeTotals(emp, activePayrollPhase);
          return t.netSalary > 0;
        }).length || 1;
      const isAllBranches =
        !selectedBranch ||
        selectedBranch === "الكل" ||
        selectedBranch === "All";
      const smartCSS = generateSmartPrintCSS(count, isAllBranches);

      const styles = Array.from(
        document.querySelectorAll('style, link[rel="stylesheet"]'),
      )
        .map((s) => s.outerHTML)
        .join("\n");

      const printWin = window.open("", "_blank", "width=1200,height=850");
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
          } catch (e) {}
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
      const el = document.getElementById("printable-payroll-section");
      if (!el) {
        alert("لم يتم العثور على جدول الرواتب للطباعة");
        return;
      }

      const count =
        filteredEmployees.filter((emp) => {
          const t = calculateEmployeeTotals(emp, activePayrollPhase);
          return t.netSalary > 0;
        }).length || 1;
      const smartCSS = generateSmartPrintCSS(count);

      const styles = Array.from(
        document.querySelectorAll('style, link[rel="stylesheet"]'),
      )
        .map((s) => s.outerHTML)
        .join("\n");

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

      const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
      const blobUrl = URL.createObjectURL(blob);

      const newTab = window.open(blobUrl, "_blank");
      if (!newTab) {
        const a = document.createElement("a");
        a.href = blobUrl;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
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
    setSelectedEmployeeIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleBulkPrint = () => {
    const selected = displayedEmployees.filter((emp) =>
      selectedEmployeeIds.includes(emp.id),
    );
    if (selected.length === 0) return;
    setBulkEmployees(selected);
    setIsBulkPrintOpen(true);
  };

  const handlePrintIndividual = (emp: Employee) => {
    setBulkEmployees([emp]);
    setIsBulkPrintOpen(true);
  };

  return (
    <div
      className="payroll-wrapper min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white"
      dir="rtl"
    >
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
          setSheetTitle((prevTitle) =>
            getFormattedTitle(prevTitle, phase, selectedMonth),
          );
        }}
        selectedMonth={selectedMonth}
        onSelectedMonthChange={handleSelectedMonthChange}
        selectedCount={selectedEmployeeIds.length}
        onBulkPrint={handleBulkPrint}
        isAlaa={isAlaa}
        isArchivedView={isCurrentMonthArchived}
        archives={archives}
        isExactlyAlaa={isExactlyAlaa}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {/* KPI Statistics Cards */}
        {viewMode === "table" && (
          <StatsCards
            totals={totals}
            employeeCount={filteredEmployees.length}
          />
        )}

        {/* View Mode Switcher */}
        {viewMode === "table" ? (
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
        ) : viewMode === "analytics" ? (
          <AnalyticsDashboard
            employees={filteredEmployees}
            totals={totals}
            payrollPhase={activePayrollPhase}
          />
        ) : viewMode === "bank" ? (
          <BankPayrollFile
            employees={filteredEmployees.filter(
              (emp) => emp.isActive !== false,
            )}
            sheetTitle={sheetTitle}
            signatures={signatures}
            payrollPhase={activePayrollPhase}
            selectedMonth={selectedMonth}
          />
        ) : viewMode === "account-statement" ? (
          <AccountStatementPage
            archives={archives}
            currentEmployees={employees}
            currentMonthName={getArabicMonthName(selectedMonth)}
            signatures={signatures}
            onViewChange={setViewMode}
          />
        ) : viewMode === "archive" ? (
          <ArchivePage
            archives={archives}
            onDeleteArchive={handleDeleteArchive}
            onRestoreArchive={handleRestoreArchive}
            onUpdateArchive={handleUpdateArchive}
            onPrintArchive={handlePrintArchive}
            onViewChange={setViewMode}
            onEditArchive={handleOpenArchiveEditor}
            payrollPhase={activePayrollPhase}
          />
        ) : viewMode === "edit-archive" ? (
          <ArchivedSheetEditor
            archive={editingArchiveData}
            payrollPhase={activePayrollPhase}
            onSave={(updated) => {
              handleUpdateArchive(updated);
              setViewMode("archive");
            }}
            onClose={() => setViewMode("archive")}
          />
        ) : viewMode === "settings" ? (
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
              if (
                window.confirm(
                  "هل أنت متأكد من مسح جميع أرشيف الرواتب السابقة؟",
                )
              ) {
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
        onClose={handleCloseEmployeeModal}
        onSave={handleSaveEmployee}
        employeeToEdit={employeeToEdit}
        branches={branches.filter((b) => b !== "الكل")}
        insurancePercentage={insurancePercentage}
        onNext={
          employeeToEdit &&
          filteredEmployees.findIndex((e) => e.id === employeeToEdit.id) <
            filteredEmployees.length - 1
            ? handleNextEmployee
            : undefined
        }
        onPrev={
          employeeToEdit &&
          filteredEmployees.findIndex((e) => e.id === employeeToEdit.id) > 0
            ? handlePrevEmployee
            : undefined
        }
      />

      <PaySlipModal
        employee={employeeForSlip}
        onClose={() => setEmployeeForSlip(null)}
        signatures={signatures}
        sheetTitle={sheetTitle}
        payrollPhase={activePayrollPhase}
        selectedMonth={selectedMonth}
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
        totals={calculateGrandTotals(filteredEmployees, "full")}
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
