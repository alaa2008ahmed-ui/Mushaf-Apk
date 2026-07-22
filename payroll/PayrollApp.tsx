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
import { CustomPrintModal } from "./components/CustomPrintModal";
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
    const numId = Number(emp.id);
    if (emp.id !== undefined && emp.id !== null && !isNaN(numId) && numId > 0 && !takenIds.has(numId)) {
      takenIds.add(numId);
      finalRecords.push({ ...emp, id: numId });
    } else {
      finalRecords.push({ ...emp, id: 0 });
    }
  }

  // Second pass: assign new unique IDs to any that had id = 0 or collided
  const validTakenIds = Array.from(takenIds).filter((id) => !isNaN(id) && isFinite(id));
  let nextId = validTakenIds.length > 0 ? Math.max(0, ...validTakenIds) + 1 : 1;
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

          if (updated.branch) {
            const b = updated.branch.trim();
            if (b === "الادارة" || b === "الإدارة" || b === "الاداره" || b === "الإداره") {
              updated.branch = "الادارة المركزيه";
              changed = true;
            } else if (b === "فرع المعبأه") {
              updated.branch = "فرع المعباه";
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
    return initialEmployees.map((emp) => {
      if (!emp || !emp.branch) return emp;
      const b = emp.branch.trim();
      let normalized = emp.branch;
      if (b === "الادارة" || b === "الإدارة" || b === "الاداره" || b === "الإداره") {
        normalized = "الادارة المركزيه";
      } else if (b === "فرع المعبأه") {
        normalized = "فرع المعباه";
      }
      if (normalized !== emp.branch) {
        return { ...emp, branch: normalized };
      }
      return emp;
    });
  });

  const [archives, setArchives] = useState<any[]>(() => {
    const saved = getSafeSavedArchives();
    const parsed = saved ? JSON.parse(saved) : [];
    
    // Seed with initialArchives if missing
    const initial = initialArchives || [];
    const merged = [...parsed];
    initial.forEach(arc => {
      const existingIndex = merged.findIndex(m => m.monthIso === arc.monthIso);
      if (existingIndex >= 0) {
        // Force override for 2026-05, 2026-04, 2026-03, 2026-02, and 2026-01
        if (arc.monthIso === '2026-05' || arc.monthIso === '2026-04' || arc.monthIso === '2026-03' || arc.monthIso === '2026-02' || arc.monthIso === '2026-01') {
          merged[existingIndex] = arc;
        }
      } else {
        merged.push(arc);
      }
    });

    return merged;
  });

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const saved = getSafeSavedArchives();
    let localArchives = saved ? JSON.parse(saved) : [];
    
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
  const isInternalUpdateRef = useRef<boolean>(false);
  const lastSyncedMonthRef = useRef<string>("");
  const lastSavedArchivesRef = useRef(getSafeSavedArchives());
  const lastSavedJsonRef = useRef(
    localStorage.getItem("payroll_employees_2026") || "[]"
  );
  const lastSavedSettingsRef = useRef<string>("");
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<any[]>([]);
  const [isBulkPrintOpen, setIsBulkPrintOpen] = useState(false);
  const [bulkEmployees, setBulkEmployees] = useState<Employee[]>([]);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isMigrateModalOpen, setIsMigrateModalOpen] = useState(false);
  const [isCustomPrintModalOpen, setIsCustomPrintModalOpen] = useState(false);
  const [customPrintList, setCustomPrintList] = useState<Employee[] | null>(null);
  const [customPrintBranch, setCustomPrintBranch] = useState<string>("All");
  const [employeeForSlip, setEmployeeForSlip] = useState<Employee | null>(null);
  const [editingArchiveData, setEditingArchiveData] = useState<ArchivedMonth | null>(null);
  const [isEnglishTable, setIsEnglishTable] = useState(() => {
    return localStorage.getItem("payroll_language_pref") === "true";
  });

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
      if (isEnglishTable) {
        // Try to derive English title from date if it looks like a standard title
        const monthMatch = archivedMonthData.sheetTitle.match(/(يناير|فبراير|مارس|أبريل|مايو|يونيو|يوليو|أغسطس|سبتمبر|أكتوبر|نوفمبر|ديسمبر)/);
        const yearMatch = archivedMonthData.sheetTitle.match(/\b(20\d{2})\b/);
        if (monthMatch && yearMatch) {
          return getFormattedTitle(archivedMonthData.sheetTitle, activePayrollPhase, selectedMonth, true);
        }
        return archivedMonthData.sheetTitle; // Fallback to stored title if complex
      }
      return archivedMonthData.sheetTitle;
    }
    if (!isAlaa) return isEnglishTable ? "Unarchived Month" : "شهر غير مؤرشف";
    return getFormattedTitle(sheetTitle, activePayrollPhase, selectedMonth, isEnglishTable);
  }, [
    sheetTitle,
    activePayrollPhase,
    selectedMonth,
    isAlaa,
    isCurrentMonthArchived,
    archivedMonthData,
    isEnglishTable,
  ]);

  // Sync changes to TimeSheet documents (Two-way sync)
  useEffect(() => {
    if (!employees || employees.length === 0) return;

    const syncToTimeSheet = async () => {
      const tsRecords = dualStorage.getLocalData(COLLECTIONS.RECORDS);
      for (const emp of employees) {
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
            tsData.englishJobTitle !== emp.englishJobTitle ||
            tsData.showInOvertime1 !== (emp.showInOvertime1 !== false) ||
            tsData.showInOvertime2 !== (emp.showInOvertime2 !== false) ||
            tsData.showInDriversTab !== (!!emp.showInDriversTab) ||
            tsData.code !== emp.code;

          if (needsSync) {
            const updatedTs = { 
              ...tsData, 
              isActive: emp.isActive !== false,
              name: emp.name,
              englishName: emp.nameEn,
              jobTitle: emp.jobTitle,
              englishJobTitle: emp.englishJobTitle || tsData.englishJobTitle,
              showInOvertime1: emp.showInOvertime1 !== false,
              showInOvertime2: emp.showInOvertime2 !== false,
              showInDriversTab: !!emp.showInDriversTab,
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

  // ONE-TIME MIGRATION FOR ACTIVE EMPLOYEES
  useEffect(() => {
    if (initialEmployees && initialEmployees.length > 0) {
      const isMigrated = localStorage.getItem("migrated_final_v10_sync");
      if (!isMigrated) {
        console.log("DualStorage: Running final forced migration to sync server...");
        setEmployees(initialEmployees);
        localStorage.setItem("migrated_final_v10_sync", "true");
        lastSavedJsonRef.current = JSON.stringify(initialEmployees);
        localStorage.setItem("payroll_employees_2026", lastSavedJsonRef.current);
        
        // Explicitly force a save to server immediately
        dualStorage.save(COLLECTIONS.RECORDS, "payroll_employees_data", {
          type: "payroll_employees_list",
          data: initialEmployees,
        }).then(() => {
          console.log("DualStorage: Server sync successful after migration.");
        }).catch(err => {
          console.error("DualStorage: Server sync failed after migration:", err);
        });
      }
    }
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("الكل");
  const [employeeToEdit, setEmployeeToEdit] = useState<any>(null);

  // Save/Sync employees to localStorage and Firestore
  useEffect(() => {
    if (!employees || employees.length === 0) return;

    // Prevent saving if we are in the middle of a migration reset or an internal month sync
    if (isMigratingRef.current || isInternalUpdateRef.current) return;

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
    if (isMigratingRef.current || isInternalUpdateRef.current) return;

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
        
        // Use loose equality for numbers/strings if necessary, but here we expect numbers
        const currentVal = Number(updatedEmp[field] || 0);
        const targetVal = Number(expectedValue || 0);
        
        if (currentVal !== targetVal) {
          updatedEmp[field] = targetVal as any;
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
      console.log(`PayrollApp: Syncing employee fields for month ${selectedMonth}`);
      isInternalUpdateRef.current = true;
      
      // Ensure we don't save this intermediate state to server immediately to avoid loops
      const newStr = JSON.stringify(updatedEmployees);
      if (newStr !== lastSavedJsonRef.current) {
         lastSavedJsonRef.current = newStr;
         setEmployees(updatedEmployees);
      }
      
      // Reset the internal update ref after a delay
      setTimeout(() => { 
        isInternalUpdateRef.current = false; 
      }, 500);
    }
  }, [selectedMonth, isCurrentMonthArchived, employees]);

  // Save sheet title, signatures, insurance percentage, and selected month, and sync to Firestore
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

  useEffect(() => {
    if (insurancePercentage !== undefined) {
      localStorage.setItem("payroll_insurance_percentage", insurancePercentage.toString());
    }
  }, [insurancePercentage]);

  useEffect(() => {
    if (selectedMonth) {
      localStorage.setItem("payroll_selected_month_iso", selectedMonth);
    }
  }, [selectedMonth]);

  useEffect(() => {
    if (!signatures || !selectedMonth || !sheetTitle) return;

    const currentSettings = {
      signatures,
      insurancePercentage,
      sheetTitle,
      selectedMonth,
    };

    const settingsJson = JSON.stringify(currentSettings);
    if (settingsJson === lastSavedSettingsRef.current) return;
    lastSavedSettingsRef.current = settingsJson;

    const timer = setTimeout(() => {
      dualStorage.save(COLLECTIONS.RECORDS, "payroll_global_settings", {
        type: "payroll_settings",
        data: currentSettings,
      })
        .then(() => {
          console.log("DualStorage: Saved payroll global settings to Firestore successfully.");
        })
        .catch(err => {
          console.error("DualStorage: Failed to save payroll global settings to Firestore:", err);
        });
    }, 1000); // Debounce by 1 second

    return () => clearTimeout(timer);
  }, [signatures, insurancePercentage, sheetTitle, selectedMonth]);

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
          // Force inject 2026-05
          const mayArchive = initialArchives.find(a => a.monthIso === '2026-05');
          if (mayArchive) {
            const existingIndex = arcRecord.data.findIndex((m: any) => m.monthIso === '2026-05');
            if (existingIndex >= 0) {
              arcRecord.data[existingIndex] = mayArchive;
            } else {
              arcRecord.data.push(mayArchive);
            }
          }
          // Force inject 2026-04
          const aprilArchive = initialArchives.find(a => a.monthIso === '2026-04');
          if (aprilArchive) {
            const existingIndex = arcRecord.data.findIndex((m: any) => m.monthIso === '2026-04');
            if (existingIndex >= 0) {
              arcRecord.data[existingIndex] = aprilArchive;
            } else {
              arcRecord.data.push(aprilArchive);
            }
          }
          // Force inject 2026-03
          const marchArchive = initialArchives.find(a => a.monthIso === '2026-03');
          if (marchArchive) {
            const existingIndex = arcRecord.data.findIndex((m: any) => m.monthIso === '2026-03');
            if (existingIndex >= 0) {
              arcRecord.data[existingIndex] = marchArchive;
            } else {
              arcRecord.data.push(marchArchive);
            }
          }
          // Force inject 2026-02
          const febArchive = initialArchives.find(a => a.monthIso === '2026-02');
          if (febArchive) {
            const existingIndex = arcRecord.data.findIndex((m: any) => m.monthIso === '2026-02');
            if (existingIndex >= 0) {
              arcRecord.data[existingIndex] = febArchive;
            } else {
              arcRecord.data.push(febArchive);
            }
          }
          // Force inject 2026-01
          const janArchive = initialArchives.find(a => a.monthIso === '2026-01');
          if (janArchive) {
            const existingIndex = arcRecord.data.findIndex((m: any) => m.monthIso === '2026-01');
            if (existingIndex >= 0) {
              arcRecord.data[existingIndex] = janArchive;
            } else {
              arcRecord.data.push(janArchive);
            }
          }

          setArchives(prev => {
            const currentStr = JSON.stringify(prev);
            const newStr = JSON.stringify(arcRecord.data);
            if (currentStr !== newStr) {
              lastSavedArchivesRef.current = newStr;
              localStorage.setItem("payroll_archives", newStr);
              localStorage.setItem("payroll_archives_2026", newStr);
              return arcRecord.data;
            }
            return prev;
          });
        }

        // Sync Global Settings
        const settingsRecord = records.find((r: any) => r.id === "payroll_global_settings");
        if (settingsRecord && settingsRecord.data) {
          const settings = settingsRecord.data;
          const currentSettings = {
            signatures: settings.signatures,
            insurancePercentage: settings.insurancePercentage,
            sheetTitle: settings.sheetTitle,
            selectedMonth: settings.selectedMonth,
          };
          const newStr = JSON.stringify(currentSettings);
          if (newStr !== lastSavedSettingsRef.current) {
            lastSavedSettingsRef.current = newStr;
            if (settings.signatures) {
              setSignatures(settings.signatures);
              localStorage.setItem("payroll_signatures", JSON.stringify(settings.signatures));
            }
            if (settings.insurancePercentage !== undefined) {
              setInsurancePercentage(settings.insurancePercentage);
              localStorage.setItem("payroll_insurance_percentage", settings.insurancePercentage.toString());
            }
            if (settings.sheetTitle) {
              setSheetTitle(settings.sheetTitle);
              localStorage.setItem("payroll_sheet_title", settings.sheetTitle);
              localStorage.setItem("payroll_sheetTitle", settings.sheetTitle);
            }
            // Sync month if not recently edited locally or under alaa user
            const savedUser = localStorage.getItem('currentUser');
            let isCurrentUserAlaa = false;
            if (savedUser) {
              try {
                const u = JSON.parse(savedUser);
                if (u && u.username && u.username.toLowerCase() === 'alaa') {
                  isCurrentUserAlaa = true;
                }
              } catch (e) {}
            }
            const isSyncing = localStorage.getItem('payroll_sync_in_progress') === 'true';
            if (!isSyncing && !isCurrentUserAlaa && settings.selectedMonth) {
              setSelectedMonth(settings.selectedMonth);
              localStorage.setItem("payroll_selected_month_iso", settings.selectedMonth);
            }
          }
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
            // Force inject 2026-05
            const mayArchive = initialArchives.find(a => a.monthIso === '2026-05');
            if (mayArchive) {
              const existingIndex = parsed.findIndex((m: any) => m.monthIso === '2026-05');
              if (existingIndex >= 0) {
                parsed[existingIndex] = mayArchive;
              } else {
                parsed.push(mayArchive);
              }
            }
            // Force inject 2026-04
            const aprilArchive = initialArchives.find(a => a.monthIso === '2026-04');
            if (aprilArchive) {
              const existingIndex = parsed.findIndex((m: any) => m.monthIso === '2026-04');
              if (existingIndex >= 0) {
                parsed[existingIndex] = aprilArchive;
              } else {
                parsed.push(aprilArchive);
              }
            }
            // Force inject 2026-03
            const marchArchive = initialArchives.find(a => a.monthIso === '2026-03');
            if (marchArchive) {
              const existingIndex = parsed.findIndex((m: any) => m.monthIso === '2026-03');
              if (existingIndex >= 0) {
                parsed[existingIndex] = marchArchive;
              } else {
                parsed.push(marchArchive);
              }
            }
            // Force inject 2026-02
            const febArchive = initialArchives.find(a => a.monthIso === '2026-02');
            if (febArchive) {
              const existingIndex = parsed.findIndex((m: any) => m.monthIso === '2026-02');
              if (existingIndex >= 0) {
                parsed[existingIndex] = febArchive;
              } else {
                parsed.push(febArchive);
              }
            }
            // Force inject 2026-01
            const janArchive = initialArchives.find(a => a.monthIso === '2026-01');
            if (janArchive) {
              const existingIndex = parsed.findIndex((m: any) => m.monthIso === '2026-01');
              if (existingIndex >= 0) {
                parsed[existingIndex] = janArchive;
              } else {
                parsed.push(janArchive);
              }
            }

            setArchives(prev => {
              const currentStr = JSON.stringify(prev);
              const filteredStr = JSON.stringify(parsed);
              if (filteredStr !== currentStr) {
                lastSavedArchivesRef.current = filteredStr;
                return parsed;
              }
              return prev;
            });
          }
        } catch (e) {
          console.error("Error parsing synced archives", e);
        }
      }
    };

    const handleSignaturesUpdated = () => {
      const saved = localStorage.getItem("payroll_signatures");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSignatures(parsed);
          const currentSettings = {
            signatures: parsed,
            insurancePercentage,
            sheetTitle,
            selectedMonth,
          };
          lastSavedSettingsRef.current = JSON.stringify(currentSettings);
        } catch (e) {
          console.error("Error parsing synced signatures", e);
        }
      }
    };

    const handleInsuranceUpdated = () => {
      const saved = localStorage.getItem("payroll_insurance_percentage");
      if (saved) {
        const val = Number(saved);
        setInsurancePercentage(val);
        const currentSettings = {
          signatures,
          insurancePercentage: val,
          sheetTitle,
          selectedMonth,
        };
        lastSavedSettingsRef.current = JSON.stringify(currentSettings);
      }
    };

    const handleTitleUpdated = () => {
      const saved = localStorage.getItem("payroll_sheet_title");
      if (saved) {
        setSheetTitle(saved);
        const currentSettings = {
          signatures,
          insurancePercentage,
          sheetTitle: saved,
          selectedMonth,
        };
        lastSavedSettingsRef.current = JSON.stringify(currentSettings);
      }
    };

    const handleMonthSynced = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        setSelectedMonth(detail);
        const currentSettings = {
          signatures,
          insurancePercentage,
          sheetTitle,
          selectedMonth: detail,
        };
        lastSavedSettingsRef.current = JSON.stringify(currentSettings);
      }
    };

    // Run once on mount
    syncFromDualStorage();

    window.addEventListener("payroll_employees_updated", handleEmployeesSynced);
    window.addEventListener("payroll_employees_synced", handleEmployeesSynced);
    window.addEventListener("payroll_archives_updated", handleArchivesUpdated);
    window.addEventListener("payroll_signatures_updated", handleSignaturesUpdated);
    window.addEventListener("payroll_insurance_updated", handleInsuranceUpdated);
    window.addEventListener("payroll_title_updated", handleTitleUpdated);
    window.addEventListener("payroll_selected_month_synced", handleMonthSynced);

    return () => {
      window.removeEventListener("payroll_employees_updated", handleEmployeesSynced);
      window.removeEventListener("payroll_employees_synced", handleEmployeesSynced);
      window.removeEventListener("payroll_archives_updated", handleArchivesUpdated);
      window.removeEventListener("payroll_signatures_updated", handleSignaturesUpdated);
      window.removeEventListener("payroll_insurance_updated", handleInsuranceUpdated);
      window.removeEventListener("payroll_title_updated", handleTitleUpdated);
      window.removeEventListener("payroll_selected_month_synced", handleMonthSynced);
    };
  }, []);

  // Use archived snapshot if archived, otherwise active state
  const displayedEmployees = useMemo(() => {
    let rawList: Employee[] = [];
    if (!isAlaa) {
      if (isCurrentMonthArchived && archivedMonthData) {
        rawList = archivedMonthData.employees;
      } else if (archives.length > 0) {
        // Fallback to latest archived if current selected is not archived
        const sorted = [...archives].sort((a, b) =>
          (b.monthIso || "").localeCompare(a.monthIso || ""),
        );
        rawList = sorted[0].employees;
      }
    } else {
      rawList = isCurrentMonthArchived && archivedMonthData
        ? archivedMonthData.employees
        : employees;
    }

    // Dynamic normalization of branch names
    return rawList.map(emp => {
      if (!emp || !emp.branch) return emp;
      const b = emp.branch.trim();
      let normalized = emp.branch;
      if (b === "الادارة" || b === "الإدارة" || b === "الاداره" || b === "الإداره") {
        normalized = "الادارة المركزيه";
      } else if (b === "فرع المعبأه") {
        normalized = "فرع المعباه";
      }
      if (normalized !== emp.branch) {
        return { ...emp, branch: normalized };
      }
      return emp;
    });
  }, [isAlaa, isCurrentMonthArchived, archivedMonthData, employees, archives]);

  // Derive unique branches
  const branches = useMemo(() => {
    const set = new Set<string>();
    set.add("الكل");
    ["الادارة المركزيه", "المركز الرئيسي", "فرع الدمام", "فرع الاحساء", "فرع المعباه"].forEach(b => set.add(b));
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
      "الادارة المركزيه",
      "المركز الرئيسي",
      "فرع الدمام",
      "فرع الاحساء",
      "فرع المعباه",
      "فرع المعبأه",
    ];

    return [...list].sort((a, b) => {
      const branchA = a.branch ? a.branch.trim() : '';
      const branchB = b.branch ? b.branch.trim() : '';
      const idxA = branchOrder.indexOf(branchA);
      const idxB = branchOrder.indexOf(branchB);
      const valA = idxA !== -1 ? idxA : 999;
      const valB = idxB !== -1 ? idxB : 999;
      if (valA !== valB) {
        return valA - valB;
      }
      return Number(a.id) - Number(b.id);
    });
  }, [displayedEmployees, selectedBranch, searchTerm, activeShowInactive]);

  // Compute Grand Totals across filtered employees
  const totals = useMemo(() => {
    return calculateGrandTotals(filteredEmployees, activePayrollPhase);
  }, [filteredEmployees, activePayrollPhase]);

  // Handlers
  const handleAddEmployeeClick = () => {
    const validIds = employees.map((i) => Number(i.id)).filter((id) => !isNaN(id) && isFinite(id));
    const newId = validIds.length > 0 ? Math.max(...validIds) + 1 : 1;
    const existingCodes = new Set(
      employees
        .map((emp) => emp.code ? emp.code.trim() : "")
        .filter((code) => code !== "")
    );
    let nextCodeInt = 1188;
    while (existingCodes.has(nextCodeInt.toString())) {
      nextCodeInt++;
    }
    const nextCode = nextCodeInt.toString();
    const defaultBranch =
      selectedBranch !== "الكل" ? selectedBranch : (branches.find((b) => b !== "الكل" && b !== "All") || "الادارة") === "الادارة" ? "الادارة المركزيه" : (branches.find((b) => b !== "الكل" && b !== "All") || "الادارة المركزيه");
    const newEmp: Employee = {
      id: newId,
      code: nextCode,
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
    try {
      const local = dualStorage.getLocalData(COLLECTIONS.RECORDS) || [];
      const tsEmployees = local
        .filter((r: any) => r && r.type === "timesheet_employee" && r.data)
        .map((r: any) => r.data);
      
      const matchedTs = tsEmployees.find(
        (e: any) =>
          normalizeArabicName(e.name) === normalizeArabicName(emp.name) ||
          (e.code && e.code === emp.code)
      );

      if (matchedTs) {
        emp = {
          ...emp,
          englishJobTitle: emp.englishJobTitle || matchedTs.englishJobTitle || '',
          showInOvertime1: emp.showInOvertime1 !== undefined ? emp.showInOvertime1 : (matchedTs.showInOvertime1 !== false),
          showInOvertime2: emp.showInOvertime2 !== undefined ? emp.showInOvertime2 : (matchedTs.showInOvertime2 !== false),
          showInDriversTab: emp.showInDriversTab !== undefined ? emp.showInDriversTab : !!matchedTs.showInDriversTab,
        };
      }
    } catch (err) {
      console.error("Error matching timesheet employee on edit:", err);
    }
    setEmployeeToEdit(emp);
    setIsEmployeeModalOpen(true);
  };

  const handleNextEmployee = () => {
    if (!employeeToEdit || filteredEmployees.length === 0) return;
    const currentIndex = filteredEmployees.findIndex(
      (e) => e.id === employeeToEdit.id,
    );
    if (currentIndex >= 0 && currentIndex < filteredEmployees.length - 1) {
      let nextEmp = filteredEmployees[currentIndex + 1];
      try {
        const local = dualStorage.getLocalData(COLLECTIONS.RECORDS) || [];
        const tsEmployees = local
          .filter((r: any) => r && r.type === "timesheet_employee" && r.data)
          .map((r: any) => r.data);
        const matchedTs = tsEmployees.find(
          (e: any) =>
            normalizeArabicName(e.name) === normalizeArabicName(nextEmp.name) ||
            (e.code && e.code === nextEmp.code)
        );
        if (matchedTs) {
          nextEmp = {
            ...nextEmp,
            englishJobTitle: nextEmp.englishJobTitle || matchedTs.englishJobTitle || '',
            showInOvertime1: nextEmp.showInOvertime1 !== undefined ? nextEmp.showInOvertime1 : (matchedTs.showInOvertime1 !== false),
            showInOvertime2: nextEmp.showInOvertime2 !== undefined ? nextEmp.showInOvertime2 : (matchedTs.showInOvertime2 !== false),
            showInDriversTab: nextEmp.showInDriversTab !== undefined ? nextEmp.showInDriversTab : !!matchedTs.showInDriversTab,
          };
        }
      } catch (err) {}
      setEmployeeToEdit(nextEmp);
    }
  };

  const handlePrevEmployee = () => {
    if (!employeeToEdit || filteredEmployees.length === 0) return;
    const currentIndex = filteredEmployees.findIndex(
      (e) => e.id === employeeToEdit.id,
    );
    if (currentIndex > 0) {
      let prevEmp = filteredEmployees[currentIndex - 1];
      try {
        const local = dualStorage.getLocalData(COLLECTIONS.RECORDS) || [];
        const tsEmployees = local
          .filter((r: any) => r && r.type === "timesheet_employee" && r.data)
          .map((r: any) => r.data);
        const matchedTs = tsEmployees.find(
          (e: any) =>
            normalizeArabicName(e.name) === normalizeArabicName(prevEmp.name) ||
            (e.code && e.code === prevEmp.code)
        );
        if (matchedTs) {
          prevEmp = {
            ...prevEmp,
            englishJobTitle: prevEmp.englishJobTitle || matchedTs.englishJobTitle || '',
            showInOvertime1: prevEmp.showInOvertime1 !== undefined ? prevEmp.showInOvertime1 : (matchedTs.showInOvertime1 !== false),
            showInOvertime2: prevEmp.showInOvertime2 !== undefined ? prevEmp.showInOvertime2 : (matchedTs.showInOvertime2 !== false),
            showInDriversTab: prevEmp.showInDriversTab !== undefined ? prevEmp.showInDriversTab : !!matchedTs.showInDriversTab,
          };
        }
      } catch (err) {}
      setEmployeeToEdit(prevEmp);
    }
  };

  useEffect(() => {
    const syncOvertime = () => {
      if (isInternalUpdateRef.current) return;
      try {
        const local = dualStorage.getLocalData(COLLECTIONS.RECORDS) || [];

        // Get TimeSheet employees
        const tsEmployees = local
          .filter((r: any) => r && r.type === "timesheet_employee" && r.data)
          .map((r: any) => r.data);

        // Get current selected month
        const currentMonth = selectedMonth;

        // Get overtime 1 and 2 grids
        
        // First check if there's an archived timesheet for this month
        const archiveRecord = local.find(
          (r: any) =>
            r &&
            r.type === "timesheet_posted_month" &&
            r.data &&
            r.data.month === currentMonth,
        );
        
        let ot1Grid = null;
        let ot2Grid = null;
        
        if (archiveRecord && archiveRecord.data) {
          ot1Grid = archiveRecord.data.grid1;
          ot2Grid = archiveRecord.data.grid2;
        } else {
          const ot1Record = local.find(
            (r: any) =>
              r &&
              r.type === "timesheet_grid_overtime1" &&
              r.data &&
              r.data.month === currentMonth,
          );
          ot1Grid = ot1Record ? ot1Record.data : null;

          const ot2Record = local.find(
            (r: any) =>
              r &&
              r.type === "timesheet_grid_overtime2" &&
              r.data &&
              r.data.month === currentMonth,
          );
          ot2Grid = ot2Record ? ot2Record.data : null;
        }


      const getEmployeeTotalHours = (emp: Employee, grid: any, emps: Employee[], matchedTsEmp?: any) => {
        if (!grid || !grid.employeesData) return 0;

        let dData = grid.employeesData[emp.id?.toString()];
        if (!dData && matchedTsEmp) {
          dData = grid.employeesData[matchedTsEmp.id];
        }

        if (!dData) {
          // Fallback to name matching
          const targetNormAr = normalizeArabicName(emp.name || "");
          const targetNormEn = normalizeEnglishName(emp.nameEn || "");

          for (const key of Object.keys(grid.employeesData)) {
            // Check if key matches via emps (payroll employees list)
            const gridEmp = emps.find((e) => String(e.id) === String(key));
            if (gridEmp) {
              const normAr = normalizeArabicName(gridEmp.name || "");
              const normEn = normalizeEnglishName(gridEmp.nameEn || "");
              if (
                (targetNormAr && normAr && targetNormAr === normAr) ||
                (targetNormEn && normEn && targetNormEn === normEn)
              ) {
                dData = grid.employeesData[key];
                break;
              }
            }

            // Check if key matches via tsEmployees (timesheet employees list)
            const tsEmp = tsEmployees.find((e) => String(e.id) === String(key));
            if (tsEmp) {
              const normAr = normalizeArabicName(tsEmp.name || "");
              const normEn = normalizeEnglishName(tsEmp.englishName || "");
              if (
                (targetNormAr && normAr && targetNormAr === normAr) ||
                (targetNormEn && normEn && targetNormEn === normEn)
              ) {
                dData = grid.employeesData[key];
                break;
              }
            }
          }
        }

        if (!dData || !dData.days) return 0;
        let sum = 0;
        const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
        for (let i = 1; i <= 31; i++) {
          let strVal = String(dData.days[i] || "0");
          for (let j = 0; j < 10; j++) {
            strVal = strVal.replace(new RegExp(arabicNumbers[j], 'g'), j.toString());
          }
          const val = parseFloat(strVal);
          if (!isNaN(val)) sum += val;
        }
        return sum;
      };

      const getEmployeeBonus = (emp: Employee, grid: any, emps: Employee[], matchedTsEmp?: any) => {
        if (!grid || !grid.employeesData) return 0;

        let dData = grid.employeesData[emp.id?.toString()];
        if (!dData && matchedTsEmp) {
          dData = grid.employeesData[matchedTsEmp.id];
        }

        if (!dData) {
          // Fallback to name matching
          const targetNormAr = normalizeArabicName(emp.name || "");
          const targetNormEn = normalizeEnglishName(emp.nameEn || "");

          for (const key of Object.keys(grid.employeesData)) {
            // Check if key matches via emps (payroll employees list)
            const gridEmp = emps.find((e) => String(e.id) === String(key));
            if (gridEmp) {
              const normAr = normalizeArabicName(gridEmp.name || "");
              const normEn = normalizeEnglishName(gridEmp.nameEn || "");
              if (
                (targetNormAr && normAr && targetNormAr === normAr) ||
                (targetNormEn && normEn && targetNormEn === normEn)
              ) {
                dData = grid.employeesData[key];
                break;
              }
            }

            // Check if key matches via tsEmployees (timesheet employees list)
            const tsEmp = tsEmployees.find((e) => String(e.id) === String(key));
            if (tsEmp) {
              const normAr = normalizeArabicName(tsEmp.name || "");
              const normEn = normalizeEnglishName(tsEmp.englishName || "");
              if (
                (targetNormAr && normAr && targetNormAr === normAr) ||
                (targetNormEn && normEn && targetNormEn === normEn)
              ) {
                dData = grid.employeesData[key];
                break;
              }
            }
          }
        }

        if (!dData || dData.bonus === undefined || dData.bonus === '') return 0;
        let strVal = String(dData.bonus).replace(/,/g, "").trim();
        const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
        for (let i = 0; i < 10; i++) {
            strVal = strVal.replace(new RegExp(arabicNumbers[i], 'g'), i.toString());
        }
        return parseFloat(strVal) || 0;
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
            
            const ot1Hours = getEmployeeTotalHours(emp, ot1Grid, emps, tsEmp);
            const ot2Hours = getEmployeeTotalHours(emp, ot2Grid, emps, tsEmp);
            const totalOtHours = ot1Hours + ot2Hours;
            
            const currentOtHours = Number(emp.overtimeHours || 0);
            if (currentOtHours !== totalOtHours) {
              const basic = emp.basicSalary || 0;
              const hourlyRate = (basic / 240) * 1.5;
              updatedEmp.overtimeHours = totalOtHours;
              updatedEmp.overtime = Number(
                (totalOtHours * hourlyRate).toFixed(2),
              );
              changedForThisEmp = true;
            }
            
            const totalBonus = Number(getEmployeeBonus(emp, ot1Grid, emps, tsEmp) || 0) + Number(getEmployeeBonus(emp, ot2Grid, emps, tsEmp) || 0);
            if (totalBonus > 0) console.log('syncOvertime: totalBonus for', emp.name, totalBonus);
            
            const currentBonus = Number(emp.bonus || 0);
            if (currentBonus !== totalBonus) {
              updatedEmp.bonus = totalBonus;
              changedForThisEmp = true;
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
          if (res.changed) {
            const newEmps = res.emps;
            const newStr = JSON.stringify(newEmps);
            if (lastSavedJsonRef.current !== newStr) {
              lastSavedJsonRef.current = newStr;
              
              // Defer all side effects to the next tick to keep the state updater pure and avoid React render warnings!
              setTimeout(() => {
                localStorage.setItem("payroll_employees_2026", newStr);
                dualStorage.save(COLLECTIONS.RECORDS, "payroll_employees_data", {
                  type: "payroll_employees_list",
                  data: newEmps,
                }).catch((e) => {
                  console.error("Error saving synced overtime to dualStorage", e);
                });
              }, 0);
            }
            return newEmps;
          }
          return prev;
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
      const validIds = employees.map((i) => Number(i.id)).filter((id) => !isNaN(id) && isFinite(id));
      const newId = emp.id
        ? emp.id
        : validIds.length > 0
          ? Math.max(...validIds) + 1
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

      // Handle branch transfer dayBranches updates
      if (oldEmp && oldEmp.branch && savedEmp.branch && oldEmp.branch !== savedEmp.branch) {
        const today = new Date();
        const currentYearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        // If selectedMonth is current, use current date. If selectedMonth is past/future, fallback to 15.
        let transferDay = today.getDate();
        if (selectedMonth !== currentYearMonth) {
          transferDay = 15;
        }

        // Find grid records in local storage
        const gridRecords = local.filter((r: any) => 
          r && (r.type === 'timesheet_grid_overtime1' || r.type === 'timesheet_grid_overtime2') && 
          r.data && r.data.month === selectedMonth
        );

        for (const record of gridRecords) {
          const gridData = { ...record.data };
          if (gridData) {
            gridData.employeesData = { ...(gridData.employeesData || {}) };
            const empIdStr = savedEmp.id.toString();
            if (!gridData.employeesData[empIdStr]) {
              gridData.employeesData[empIdStr] = { bonus: '', otTrips: '', rate: '', days: {}, statuses: {}, dayBranches: {} };
            } else {
              gridData.employeesData[empIdStr] = {
                ...gridData.employeesData[empIdStr],
                dayBranches: { ...(gridData.employeesData[empIdStr].dayBranches || {}) }
              };
            }

            // Fill days 1 to transferDay - 1 with the old branch
            for (let d = 1; d < transferDay; d++) {
              gridData.employeesData[empIdStr].dayBranches[d] = oldEmp.branch;
            }
            // Fill days transferDay to 31 with the new branch
            for (let d = transferDay; d <= 31; d++) {
              gridData.employeesData[empIdStr].dayBranches[d] = savedEmp.branch;
            }

            await dualStorage.save(COLLECTIONS.RECORDS, record.id, {
              type: record.type,
              data: gridData
            });
          }
        }
        window.dispatchEvent(new Event("timesheet_grid_updated"));
        window.dispatchEvent(new Event("timesheet_grid_updated_remote"));
      }

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
          englishJobTitle: savedEmp.englishJobTitle || getEnglishJobTitleForArabic(savedEmp.jobTitle),
          isActive: savedEmp.isActive !== false,
          showInOvertime1: savedEmp.showInOvertime1 !== false,
          showInOvertime2: savedEmp.showInOvertime2 !== false,
          showInDriversTab: !!savedEmp.showInDriversTab,
        };
      } else {
        tsEmp.name = savedEmp.name;
        tsEmp.englishName = savedEmp.nameEn || "";
        tsEmp.jobTitle = savedEmp.jobTitle;
        tsEmp.englishJobTitle = savedEmp.englishJobTitle || getEnglishJobTitleForArabic(savedEmp.jobTitle);
        tsEmp.isActive = savedEmp.isActive !== false;
        tsEmp.showInOvertime1 = savedEmp.showInOvertime1 !== false;
        tsEmp.showInOvertime2 = savedEmp.showInOvertime2 !== false;
        tsEmp.showInDriversTab = !!savedEmp.showInDriversTab;
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

  const handleSyncHiringDates = (): number => {
    const allowancesSaved = localStorage.getItem("app_employees_data_v1");
    if (!allowancesSaved) return 0;

    try {
      const allowancesEmps = JSON.parse(allowancesSaved);
      if (!Array.isArray(allowancesEmps) || allowancesEmps.length === 0) {
        return 0;
      }

      let updateCount = 0;
      const updatedEmployees = employees.map((emp) => {
        if (!emp) return emp;

        // Find matching employee in allowances
        // 1. Match by code
        let match = allowancesEmps.find((ae) => {
          if (!ae) return false;
          const aeCode = ae.code ? String(ae.code).trim() : "";
          const empCode = emp.code ? String(emp.code).trim() : "";
          return aeCode !== "" && empCode !== "" && aeCode === empCode;
        });

        // 2. Match by normalized Arabic Name
        if (!match) {
          const normEmpName = normalizeArabicName(emp.name || "");
          match = allowancesEmps.find((ae) => {
            if (!ae) return false;
            const normAeName = normalizeArabicName(ae.name || "");
            return normEmpName !== "" && normAeName !== "" && normEmpName === normAeName;
          });
        }

        // 3. Match by nameEn / englishName
        if (!match && emp.nameEn) {
          const normEmpNameEn = normalizeEnglishName(emp.nameEn || "");
          match = allowancesEmps.find((ae) => {
            if (!ae) return false;
            const aeNameEn = ae.englishName || ae.nameEn || ae.name || "";
            return normEmpNameEn !== "" && aeNameEn !== "" && normEmpNameEn === normalizeEnglishName(aeNameEn);
          });
        }

        if (match && match.hireDate) {
          const cleanedHireDate = String(match.hireDate).trim();
          const currentHireDate = emp.hireDate ? String(emp.hireDate).trim() : "";
          if (cleanedHireDate && currentHireDate !== cleanedHireDate) {
            updateCount++;
            return {
              ...emp,
              hireDate: cleanedHireDate,
            };
          }
        }
        return emp;
      });

      if (updateCount > 0) {
        setEmployees(updatedEmployees);
        console.log(`Successfully updated hire dates for ${updateCount} employees from allowances data.`);
      }
      return updateCount;
    } catch (e) {
      console.error("Failed to sync hire dates from allowances", e);
      return 0;
    }
  };

  // Run automatically on mount and when event fires
  useEffect(() => {
    const autoSync = () => {
      const allowancesSaved = localStorage.getItem("app_employees_data_v1");
      if (!allowancesSaved) return;

      try {
        const allowancesEmps = JSON.parse(allowancesSaved);
        if (!Array.isArray(allowancesEmps) || allowancesEmps.length === 0) return;

        setEmployees((prevEmployees) => {
          if (!prevEmployees || prevEmployees.length === 0) return prevEmployees;

          let changed = false;
          const updatedEmployees = prevEmployees.map((emp) => {
            if (!emp) return emp;

            // Find matching employee in allowances
            let match = allowancesEmps.find((ae) => {
              if (!ae) return false;
              const aeCode = ae.code ? String(ae.code).trim() : "";
              const empCode = emp.code ? String(emp.code).trim() : "";
              return aeCode !== "" && empCode !== "" && aeCode === empCode;
            });

            if (!match) {
              const normEmpName = normalizeArabicName(emp.name || "");
              match = allowancesEmps.find((ae) => {
                if (!ae) return false;
                const normAeName = normalizeArabicName(ae.name || "");
                return normEmpName !== "" && normAeName !== "" && normEmpName === normAeName;
              });
            }

            if (!match && emp.nameEn) {
              const normEmpNameEn = normalizeEnglishName(emp.nameEn || "");
              match = allowancesEmps.find((ae) => {
                if (!ae) return false;
                const aeNameEn = ae.englishName || ae.nameEn || ae.name || "";
                return normEmpNameEn !== "" && aeNameEn !== "" && normEmpNameEn === normalizeEnglishName(aeNameEn);
              });
            }

            if (match && match.hireDate) {
              const cleanedHireDate = String(match.hireDate).trim();
              const currentHireDate = emp.hireDate ? String(emp.hireDate).trim() : "";
              if (cleanedHireDate && currentHireDate !== cleanedHireDate) {
                changed = true;
                return {
                  ...emp,
                  hireDate: cleanedHireDate,
                };
              }
            }
            return emp;
          });

          return changed ? updatedEmployees : prevEmployees;
        });
      } catch (err) {
        console.error("Auto sync hire dates error:", err);
      }
    };

    // Delay slightly to let initial state load completely
    const timer = setTimeout(autoSync, 1000);

    window.addEventListener("allowances_employees_synced", autoSync);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("allowances_employees_synced", autoSync);
    };
  }, []);

  const handleExportExcel = () => {
    exportPayrollToExcel(
      filteredEmployees,
      sheetTitle,
      signatures,
      activePayrollPhase,
    );
  };

  const handleCustomPrint = (selectedEmps: Employee[], printBranch?: string) => {
    setCustomPrintList(selectedEmps);
    setCustomPrintBranch(printBranch || "All");
    setTimeout(() => {
      try {
        const container = document.getElementById("custom-printable-payroll-section");
        if (!container) {
          alert("Could not find the custom print section container.");
          return;
        }
        const el = container.querySelector("#printable-payroll-section");
        if (!el) {
          alert("Could not find the printable payroll section.");
          return;
        }

        const count = selectedEmps.length || 1;
        const isAllBranches =
          !printBranch ||
          printBranch === "الكل" ||
          printBranch === "All";
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
            <html dir="${isEnglishTable ? 'ltr' : 'rtl'}" lang="${isEnglishTable ? 'en' : 'ar'}">
              <head>
                <meta charset="utf-8">
                <title>${getFormattedTitle(sheetTitle, activePayrollPhase, selectedMonth, isEnglishTable)} - ${isEnglishTable ? 'Official Print' : 'طباعة رسمية'}</title>
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
            } catch (e) {}
          }, 500);
        } else {
          const htmlContent = `
            <!DOCTYPE html>
            <html dir="${isEnglishTable ? 'ltr' : 'rtl'}" lang="${isEnglishTable ? 'en' : 'ar'}">
              <head>
                <meta charset="utf-8">
                <title>${getFormattedTitle(sheetTitle, activePayrollPhase, selectedMonth, isEnglishTable)} - ${isEnglishTable ? 'Official Print' : 'طباعة رسمية'}</title>
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
        }
      } catch (err) {
        console.error("Custom print error:", err);
        alert("حدث خطأ أثناء الطباعة");
      }
    }, 150);
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
          <html dir="${isEnglishTable ? 'ltr' : 'rtl'}" lang="${isEnglishTable ? 'en' : 'ar'}">
            <head>
              <meta charset="utf-8">
              <title>${getFormattedTitle(sheetTitle, activePayrollPhase, selectedMonth, isEnglishTable)} - ${isEnglishTable ? 'Official Print' : 'طباعة رسمية'}</title>
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
        alert(isEnglishTable ? "Payroll table not found for printing" : "لم يتم العثور على جدول الرواتب للطباعة");
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

      const htmlContent = `
        <!DOCTYPE html>
        <html dir="${isEnglishTable ? 'ltr' : 'rtl'}" lang="${isEnglishTable ? 'en' : 'ar'}">
          <head>
            <meta charset="utf-8">
            <title>${getFormattedTitle(sheetTitle, activePayrollPhase, selectedMonth, isEnglishTable)} - ${isEnglishTable ? 'Official Print' : 'طباعة رسمية'}</title>
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
      dir={isEnglishTable ? "ltr" : "rtl"}
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
        onCustomPrint={() => setIsCustomPrintModalOpen(true)}
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
            getFormattedTitle(prevTitle, phase, selectedMonth, isEnglishTable),
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
        isEnglishTable={isEnglishTable}
        onToggleLanguage={() => {
          setIsEnglishTable((prev) => {
            const newVal = !prev;
            localStorage.setItem("payroll_language_pref", String(newVal));
            return newVal;
          });
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {/* KPI Statistics Cards */}
        {viewMode === "table" && (
          <StatsCards
            totals={totals}
            employeeCount={filteredEmployees.length}
            isEnglish={isEnglishTable}
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
            isEnglishTable={isEnglishTable}
          />
        ) : viewMode === "analytics" ? (
          <AnalyticsDashboard
            employees={filteredEmployees}
            totals={totals}
            payrollPhase={activePayrollPhase}
          />
        ) : viewMode === "bank" ? (
          <BankPayrollFile
            employees={filteredEmployees}
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
            isEnglish={isEnglishTable}
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
            onSyncHiringDates={handleSyncHiringDates}
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
        employees={employees}
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

      <CustomPrintModal
        isOpen={isCustomPrintModalOpen}
        onClose={() => setIsCustomPrintModalOpen(false)}
        employees={filteredEmployees}
        payrollPhase={activePayrollPhase}
        onPrint={handleCustomPrint}
      />

      {/* Hidden print container used dynamically during custom selective prints */}
      <div id="custom-printable-payroll-section" className="hidden" style={{ display: "none" }}>
        {customPrintList && (
          <PayrollTable
            employees={customPrintList}
            totals={calculateGrandTotals(customPrintList, activePayrollPhase)}
            onEditEmployee={() => {}}
            onDeleteEmployee={() => {}}
            onViewPaySlip={() => {}}
            onPrintEmployee={() => {}}
            onUpdateEmployeeField={() => {}}
            signatures={signatures}
            onUpdateSignatures={() => {}}
            sheetTitle={sheetTitle}
            payrollPhase={activePayrollPhase}
            selectedEmployeeIds={[]}
            onSelectEmployee={() => {}}
            onSelectAllEmployees={() => {}}
            isAlaa={isAlaa}
            readOnly={true}
            selectedBranch={customPrintBranch}
            isEnglishTable={isEnglishTable}
          />
        )}
      </div>
    </div>
  );
}
