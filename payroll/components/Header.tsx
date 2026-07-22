import React, { useRef, useEffect, useState } from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  UserPlus, 
  BarChart3, 
  Table as TableIcon, 
  RotateCcw, 
  Sparkles, 
  Search, 
  Filter,
  Calendar,
  Archive,
  Settings,
  CalendarCheck,
  Clock,
  Layers,
  ChevronLeft,
  ChevronRight,
  Download,
  Save,
  Languages
} from 'lucide-react';
import { ViewMode, ArchivedMonth } from '../types';
import { getDynamicSheetTitle } from '../utils/dateUtils';

interface HeaderProps {
  sheetTitle: string;
  onTitleChange: (newTitle: string) => void;
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  onAddEmployee: () => void;
  onExportExcel: () => void;
  onSmartPrint: () => void;
  onNewTabPrint: () => void;
  onCustomPrint: () => void;
  onResetData: () => void;
  onOpenAI: () => void;
  onMigrateMonth?: () => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedBranch: string;
  onBranchChange: (val: string) => void;
  branches: string[];
  showInactive?: boolean;
  onShowInactiveChange?: (val: boolean) => void;
  payrollPhase: 'full' | 'phase1' | 'phase2';
  onPayrollPhaseChange: (val: 'full' | 'phase1' | 'phase2') => void;
  selectedMonth: string;
  onSelectedMonthChange: (val: string) => void;
  selectedCount?: number;
  onBulkPrint?: () => void;
  isAlaa?: boolean;
  isArchivedView?: boolean;
  archives?: ArchivedMonth[];
  isExactlyAlaa?: boolean;
  isEnglishTable?: boolean;
  onToggleLanguage?: () => void;
}

const getFormattedMonthLabel = (monthIso: string) => {
  if (!monthIso) return '';
  const parts = monthIso.split('-');
  if (parts.length !== 2) return monthIso;
  const [y, m] = parts.map(Number);
  const monthsEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  if (m >= 1 && m <= 12) {
    return `${y} (${monthsEn[m - 1]})`;
  }
  return monthIso;
};

export const Header: React.FC<HeaderProps> = ({
  sheetTitle,
  onTitleChange,
  viewMode,
  onViewChange,
  onAddEmployee,
  onExportExcel,
  onSmartPrint,
  onNewTabPrint,
  onCustomPrint,
  onResetData,
  onOpenAI,
  onMigrateMonth,
  searchTerm,
  onSearchChange,
  selectedBranch,
  onBranchChange,
  branches,
  showInactive,
  onShowInactiveChange,
  payrollPhase,
  onPayrollPhaseChange,
  selectedMonth,
  onSelectedMonthChange,
  selectedCount = 0,
  onBulkPrint,
  isAlaa = false,
  isArchivedView = false,
  archives = [],
  isExactlyAlaa = false,
  isEnglishTable = false,
  onToggleLanguage
}) => {
  const headerRef = useRef<HTMLElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(() => {
    return parseInt(selectedMonth.split('-')[0]) || new Date().getFullYear();
  });
  const [localTypedMonth, setLocalTypedMonth] = useState(selectedMonth);

  const translateBranch = (branch: string): string => {
    const mapping: Record<string, string> = {
      'الكل': 'All',
      'المركز الرئيسي': 'Main Branch',
      'فرع الدمام': 'Dammam Branch',
      'فرع الاحساء': 'AlHasa Branch',
      'فرع المعبأه': 'Bottle Branch',
      'الادارة': 'Administration',
      'الإدارة': 'Administration',
      'الاداره': 'Administration',
      'الإداره': 'Administration',
      'أخرى': 'Other',
      'الرياض': 'Riyadh',
      'جده': 'Jeddah',
      'جدة': 'Jeddah',
      'الدمام': 'Dammam',
      'مكة': 'Makkah',
      'مكه': 'Makkah',
      'المدينة': 'Madinah',
      'المدينه': 'Madinah',
    };
    return mapping[branch] || branch;
  };

  const labels = {
    addEmployee: isEnglishTable ? 'Add Employee' : 'إضافة موظف جديد',
    payrollTable: isEnglishTable ? 'Payroll Table' : 'جدول الرواتب',
    bankFile: isEnglishTable ? 'Bank File' : 'ملف البنك',
    archivedSheet: isEnglishTable ? 'Archived' : 'كشف مؤرشف',
    searchPlaceholder: isEnglishTable ? 'Search by name, code, job...' : 'بحث بالاسم، الكود، الوظيفة...',
    all: isEnglishTable ? 'All' : 'الكل',
    printCards: isEnglishTable ? 'Print Cards' : 'طباعة الكروت',
    titlePlaceholder: isEnglishTable ? 'Sheet Title' : 'عنوان الكشف',
    titleTooltip: isEnglishTable ? (isArchivedView || !isAlaa ? 'Sheet Title (Read Only)' : 'Click to edit title') : (isArchivedView || !isAlaa ? "عنوان الكشف (قراءة فقط)" : "اضغط لتعديل عنوان الشهر والسنة"),
    digitalAssistant: isEnglishTable ? 'Sweet Water Company LTD' : 'شركة المياه العذبة المحدوده',
    advancedSystem: isEnglishTable ? 'Advanced System for Payroll & Financial Calculations' : 'النظام المتقدم لإدارة الرواتب والحسابات المالية',
    backToMain: isEnglishTable ? 'Back to main payroll table' : 'العودة إلى جدول الرواتب الرئيسي',
    fullMonth: isEnglishTable ? 'Full Month' : 'كامل الشهر',
    phase1: isEnglishTable ? 'Phase 1' : 'المرحلة 1',
    phase2: isEnglishTable ? 'Phase 2' : 'المرحلة 2',
    fullMonthTooltip: isEnglishTable ? 'Show full monthly payroll' : 'عرض كشف الرواتب كاملاً لشهر كامل',
    phase1Tooltip: isEnglishTable ? 'Phase 1: Basic salary and allowances' : 'المرحلة 1: صرف الراتب الأساسي والبدلات والتأمينات لجميع الموظفين',
    phase2Tooltip: isEnglishTable ? 'Phase 2: Overtime and deductions' : 'المرحلة 2: صرف الإضافي والعمولة والمكافأة وخصم الغياب والخصومات والسلف لجميع الموظفين',
    saveChanges: isEnglishTable ? 'Save Changes' : 'حفظ التعديلات',
    cancelEdit: isEnglishTable ? 'Cancel Edit' : 'إلغاء التعديل',
    customPrint: isEnglishTable ? 'Custom Print (Select Employees)' : 'طباعة مخصصة (تحديد موظفين)',
    archiveTooltip: isEnglishTable ? 'Archived Payrolls' : 'أرشيف الرواتب السابقة',
  };

  useEffect(() => {
    setLocalTypedMonth(selectedMonth);
  }, [selectedMonth]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    const updateHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        document.documentElement.style.setProperty('--header-height', `${height}px`);
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [viewMode, sheetTitle]);

  return (
    <header ref={headerRef} className="bg-white text-slate-900 shadow-sm border-b border-slate-200 print:hidden sticky top-0 z-30 transition-all">
      {/* Top Navbar */}
      <div className="w-full px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {labels.digitalAssistant}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-2.5">
          {/* Payroll Table Button */}
          {isExactlyAlaa && viewMode !== 'table' && (
            <button
              onClick={() => onViewChange('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm border cursor-pointer shrink-0 ${
                viewMode === 'table'
                  ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border-slate-200'
              }`}
              title={labels.backToMain}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>{labels.payrollTable}</span>
            </button>
          )}

          {/* Payroll Phase Switcher */}
          {isAlaa && (
            <div className="flex items-center bg-blue-50/50 p-0.5 rounded-lg border border-blue-100 shrink-0">
              <button
                onClick={() => onPayrollPhaseChange('full')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  payrollPhase === 'full'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-blue-700 hover:text-blue-900'
                }`}
                title={labels.fullMonthTooltip}
              >
                {labels.fullMonth}
              </button>
              <button
                onClick={() => onPayrollPhaseChange('phase1')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  payrollPhase === 'phase1'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-blue-700 hover:text-blue-900'
                }`}
                title={labels.phase1Tooltip}
              >
                {labels.phase1}
              </button>
              <button
                onClick={() => onPayrollPhaseChange('phase2')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  payrollPhase === 'phase2'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-blue-700 hover:text-blue-900'
                }`}
                title={labels.phase2Tooltip}
              >
                {labels.phase2}
              </button>
            </div>
          )}

          {/* Save and Cancel buttons during Archive Edit */}
          {viewMode === 'edit-archive' && (
            <>
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('save-archived-sheet'));
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer border border-emerald-500 shrink-0"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{labels.saveChanges}</span>
              </button>
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('close-archived-sheet'));
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-slate-200 cursor-pointer shrink-0"
              >
                {labels.cancelEdit}
              </button>
            </>
          )}

          {/* Custom Print Button */}
          {isExactlyAlaa && viewMode === 'table' && (
            <button
              onClick={onCustomPrint}
              className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-md transition-all shadow-xs cursor-pointer shrink-0"
              title={labels.customPrint}
            >
              <Printer className="w-5 h-5" />
            </button>
          )}

          {/* Language Toggle Button */}
          {onToggleLanguage && (
            <button
              onClick={onToggleLanguage}
              className="flex items-center justify-center w-9 h-9 bg-white hover:bg-blue-50 text-blue-600 rounded-md text-xs font-black transition-all shadow-xs cursor-pointer shrink-0 border border-blue-200"
              title={isEnglishTable ? "تحويل للغة العربية" : "Switch to English"}
            >
              <span>{isEnglishTable ? "EN" : "AR"}</span>
            </button>
          )}

          {(isExactlyAlaa || isAlaa) && (
            <button
              onClick={() => onViewChange('archive')}
              className={`flex items-center justify-center p-2 rounded-md transition-colors shadow-xs cursor-pointer ${
                viewMode === 'archive' 
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500' 
                  : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900 border border-slate-200'
              }`}
              title={labels.archiveTooltip}
            >
              <Archive className={`w-5 h-5 ${viewMode === 'archive' ? 'text-white' : 'text-indigo-600'}`} />
            </button>
          )}

              {isExactlyAlaa && viewMode !== 'edit-archive' && (
            <button
              onClick={() => onViewChange('settings')}
              className={`flex items-center justify-center p-2 rounded-md transition-colors shadow-xs cursor-pointer ${
                viewMode === 'settings' 
                  ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700' 
                  : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900 border border-slate-200'
              }`}
              title={isEnglishTable ? "System Settings & Backup" : "إعدادات النظام والنسخ الاحتياطي"}
            >
              <Settings className={`w-5 h-5 ${viewMode === 'settings' ? 'text-white animate-spin-slow' : 'text-slate-700'}`} />
            </button>
          )}

          {isExactlyAlaa && !isArchivedView && viewMode === 'table' && onMigrateMonth && (
            <button
              onClick={onMigrateMonth}
              className="flex items-center justify-center bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 p-2 rounded-md shadow-xs border border-slate-200 transition-colors cursor-pointer"
              title="Post current month payroll, archive, and clear table for a new month"
            >
              <CalendarCheck className="w-5 h-5 text-emerald-600" />
            </button>
          )}

          {isExactlyAlaa && !isArchivedView && viewMode !== 'edit-archive' && (
            <button
              onClick={onAddEmployee}
              className="flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-md shadow-xs transition-colors cursor-pointer"
              title={labels.addEmployee}
            >
              <UserPlus className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Title bar and Filter bar */}
      {(viewMode === 'table' || viewMode === 'bank' || viewMode === 'analytics') && (
        <div className="bg-slate-50 border-t border-slate-200 py-3 px-4 sm:px-6">
          <div className="w-full flex flex-wrap items-center justify-between gap-4">
            
             {/* Right side: Sheet Title & View Mode Switcher */}
            <div className="flex flex-wrap items-center gap-4 min-w-[300px]">
              {(viewMode === 'table' || viewMode === 'bank') && (
                <>
          {isExactlyAlaa ? (
            <div className="relative inline-block text-right" ref={datePickerRef}>
              <div className="flex items-center gap-1.5 bg-white border border-slate-300 hover:border-slate-400 focus-within:border-blue-500 rounded-md px-2.5 py-1.5 text-xs text-slate-700 shadow-2xs font-medium shrink-0 transition-all">
                <input
                  type="text"
                  value={localTypedMonth}
                  onChange={(e) => {
                    const val = e.target.value;
                    setLocalTypedMonth(val);
                    if (/^\d{4}-\d{2}$/.test(val)) {
                      const [y, m] = val.split('-').map(Number);
                      if (y < 2026 || (y === 2026 && m < 6)) return;
                      onSelectedMonthChange(val);
                    }
                  }}
                  onBlur={() => {
                    if (/^\d{4}-\d{2}$/.test(localTypedMonth)) {
                      const [y, m] = localTypedMonth.split('-').map(Number);
                      if (y < 2026 || (y === 2026 && m < 6)) {
                        setLocalTypedMonth(selectedMonth);
                        return;
                      }
                      onSelectedMonthChange(localTypedMonth);
                    } else {
                      setLocalTypedMonth(selectedMonth);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (/^\d{4}-\d{2}$/.test(localTypedMonth)) {
                        const [y, m] = localTypedMonth.split('-').map(Number);
                        if (y < 2026 || (y === 2026 && m < 6)) {
                          setLocalTypedMonth(selectedMonth);
                        } else {
                          onSelectedMonthChange(localTypedMonth);
                        }
                      } else {
                        setLocalTypedMonth(selectedMonth);
                      }
                      setShowDatePicker(false);
                    }
                  }}
                  className="bg-transparent text-slate-900 font-bold focus:outline-none w-16 font-sans text-center ml-1"
                  placeholder="YYYY-MM"
                  title="أدخل التاريخ يدوياً بصيغة YYYY-MM / Enter date manually as YYYY-MM"
                />
                <button
                  type="button"
                  onClick={() => {
                    const parts = selectedMonth.split('-');
                    const yr = parseInt(parts[0]) || new Date().getFullYear();
                    setPickerYear(yr);
                    setShowDatePicker(!showDatePicker);
                  }}
                  className="text-blue-600 hover:text-blue-800 focus:outline-none p-0.5 rounded cursor-pointer"
                  title="اختر من قائمة التاريخ / Choose from Date List"
                >
                  <Calendar className="w-4 h-4" />
                </button>
              </div>

              {showDatePicker && (
                <div className={`absolute z-50 mt-1 ${isEnglishTable ? 'left-0' : 'right-0'} bg-white border border-slate-300 rounded-md shadow-lg p-3 w-64 no-print select-none`}>
                  <div className="flex justify-between items-center mb-3">
                    <button
                      type="button"
                      onClick={() => setPickerYear(y => y - 1)}
                      className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-sm text-slate-800 font-mono">{pickerYear}</span>
                    <button
                      type="button"
                      onClick={() => setPickerYear(y => y + 1)}
                      className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => {
                      const mm = String(i + 1).padStart(2, '0');
                      const monthIso = `${pickerYear}-${mm}`;
                      const isSelected = monthIso === selectedMonth;
                      const isDisabled = pickerYear < 2026; // Disable before 2026
                      
                      return (
                        <button
                          key={m}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => {
                            if (isDisabled) return;
                            onSelectedMonthChange(monthIso);
                            setLocalTypedMonth(monthIso);
                            setShowDatePicker(false);
                          }}
                          className={`py-1.5 text-xs rounded transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 text-white font-bold shadow-xs'
                              : isDisabled
                              ? 'text-slate-300 cursor-not-allowed bg-slate-50'
                              : 'hover:bg-blue-50 text-slate-700 font-medium'
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
          ) : (
            <div className="relative inline-block text-right" ref={datePickerRef}>
              <div 
                className="flex items-center gap-1.5 bg-white border border-blue-500 rounded-md px-2.5 py-1.5 text-xs text-slate-700 shadow-2xs font-bold shrink-0 transition-all select-none cursor-pointer hover:bg-slate-50"
                onClick={() => {
                  const parts = selectedMonth.split('-');
                  const yr = parseInt(parts[0]) || new Date().getFullYear();
                  setPickerYear(yr);
                  setShowDatePicker(!showDatePicker);
                }}
                title="Choose from archived months list"
              >
                <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-mono text-slate-900 font-bold select-none">{selectedMonth}</span>
              </div>

              {showDatePicker && (
                <div className={`absolute z-50 mt-1 ${isEnglishTable ? 'left-0' : 'right-0'} bg-white border border-slate-300 rounded-md shadow-lg p-3 w-64 no-print select-none`}>
                  <div className="flex justify-between items-center mb-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPickerYear(y => y - 1);
                      }}
                      className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-sm text-slate-800 font-mono">{pickerYear}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPickerYear(y => y + 1);
                      }}
                      className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => {
                      const mm = String(i + 1).padStart(2, '0');
                      const monthIso = `${pickerYear}-${mm}`;
                      const isSelected = monthIso === selectedMonth;
                      const isArchived = archives.some(a => a.monthIso === monthIso);
                      const isDisabled = !isArchived;
                      
                      return (
                        <button
                          key={m}
                          type="button"
                          disabled={isDisabled}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isDisabled) return;
                            onSelectedMonthChange(monthIso);
                            setShowDatePicker(false);
                          }}
                          className={`py-1.5 text-xs rounded transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 text-white font-bold shadow-xs'
                              : isDisabled
                              ? 'text-slate-300 cursor-not-allowed bg-slate-50'
                              : 'hover:bg-blue-50 text-slate-700 font-medium'
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
          )}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="relative flex items-center">
                      {/* Hidden mirror span to auto-size the input container based on sheetTitle length */}
                      <span className="invisible whitespace-pre px-3 py-1.5 text-sm font-bold border border-transparent select-none min-w-[200px] max-w-[650px] inline-block">
                        {sheetTitle || ' '}
                      </span>
                      <input
                        type="text"
                        value={sheetTitle}
                        onChange={(e) => onTitleChange(e.target.value)}
                        disabled={isArchivedView || !isAlaa}
                        className="absolute inset-0 w-full bg-white border border-slate-300 hover:border-slate-400 focus:border-blue-500 rounded-md px-3 py-1.5 text-sm font-bold text-slate-900 focus:outline-none transition-all shadow-2xs disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:cursor-not-allowed text-center"
                        title={labels.titleTooltip}
                        placeholder={labels.titlePlaceholder}
                      />
                    </div>
                    {isArchivedView && isExactlyAlaa && (
                      <span className="bg-amber-100 text-amber-800 border border-amber-300 rounded-md px-2.5 py-1.5 text-xs font-bold shrink-0 flex items-center gap-1 shadow-2xs">
                        <Archive className="w-3.5 h-3.5" />
                        <span>{labels.archivedSheet}</span>
                      </span>
                    )}
                  </div>
                </>
              )}

              {/* View Mode Tabs Switcher */}
              {isExactlyAlaa && (
                <div className="flex items-center bg-slate-200/60 p-0.5 rounded-lg border border-slate-200 shrink-0">
                  <button
                    onClick={() => onViewChange('table')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                      viewMode === 'table'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                    <span>{labels.payrollTable}</span>
                  </button>

                  {isExactlyAlaa && (
                    <button
                      onClick={() => onViewChange('bank')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                        viewMode === 'bank'
                          ? 'bg-white text-emerald-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{labels.bankFile}</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Left side: Search & Branch Filter & Actions */}
            <div className="flex items-center flex-wrap gap-2.5">
              {selectedCount > 0 && onBulkPrint && isAlaa && (
                <button
                  onClick={onBulkPrint}
                  className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white px-3.5 py-1.5 rounded-md text-xs font-bold transition-all shadow-sm animate-in fade-in zoom-in duration-200 cursor-pointer"
                  title={labels.printCards}
                >
                  <Printer className="w-4 h-4" />
                  <span>{selectedCount}</span>
                </button>
              )}
              {(viewMode === 'table' || viewMode === 'bank') && (
                <>
                  <div className="relative">
                    <Search className={`w-4 h-4 text-slate-400 absolute ${isEnglishTable ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2`} />
                    <input
                      type="text"
                      placeholder={labels.searchPlaceholder}
                      value={searchTerm}
                      onChange={(e) => onSearchChange(e.target.value)}
                      className={`bg-white border border-slate-300 rounded-md ${isEnglishTable ? 'pl-9 pr-3' : 'pr-9 pl-3'} py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 w-44 sm:w-56 shadow-2xs font-medium`}
                    />
                  </div>

                  <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-700 shadow-2xs font-medium">
                    <select
                      value={selectedBranch}
                      onChange={(e) => onBranchChange(e.target.value)}
                      className={`bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer ${isEnglishTable ? 'pl-1' : 'pr-1'}`}
                    >
                      <option value="الكل" className="bg-white text-slate-900">{labels.all}</option>
                      {branches.filter(b => b !== 'الكل').map(b => (
                        <option key={b} value={b} className="bg-white text-slate-900">
                          {isEnglishTable ? translateBranch(b) : b}
                        </option>
                      ))}
                    </select>
                  </div>

                  {isExactlyAlaa && onShowInactiveChange && (
                    <label className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-700 shadow-2xs font-medium cursor-pointer hover:bg-slate-50 transition-all select-none">
                      <input
                        type="checkbox"
                        checked={showInactive || false}
                        onChange={(e) => onShowInactiveChange(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer ml-1"
                      />
                      <span>
                        {isEnglishTable 
                          ? (showInactive ? 'Hide Employee' : 'Show Employee') 
                          : (showInactive ? 'إخفاء الموظف' : 'إظهار الموظف')
                        }
                      </span>
                    </label>
                  )}

                  {viewMode === 'bank' && (
                    <div className="flex items-center gap-1.5 animate-in fade-in zoom-in duration-200">
                      <button
                        onClick={() => window.dispatchEvent(new CustomEvent('trigger-bank-export-excel'))}
                        className="flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-md p-2 shadow-2xs cursor-pointer hover:scale-105 active:scale-95 transition-all"
                        title={isEnglishTable ? "Export Bank File (Excel)" : "تصدير ملف البنك (إكسل)"}
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => window.dispatchEvent(new CustomEvent('trigger-bank-download-wps'))}
                        className="flex items-center justify-center bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-md p-2 shadow-2xs cursor-pointer hover:scale-105 active:scale-95 transition-all"
                        title={isEnglishTable ? "Download WPS File (TXT)" : "تحميل ملف حماية الأجور (نصي)"}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              )}

              {viewMode === 'table' && (
                <div className="flex items-center gap-2">
                  {isAlaa && (
                    <button
                      onClick={() => onViewChange('account-statement')}
                      className="flex items-center justify-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-md p-2 transition-all shadow-2xs cursor-pointer"
                      title={isEnglishTable ? "Employee Account Statement" : "كشف حساب للموظفين"}
                    >
                      <Layers className="w-4 h-4" />
                      <span className="sr-only">{isEnglishTable ? "Account Statement" : "كشف حساب"}</span>
                    </button>
                  )}

                  <button
                    onClick={onExportExcel}
                    className="flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-md p-2 transition-all shadow-2xs cursor-pointer"
                    title={isEnglishTable ? "Export Payroll to Excel" : "تصدير جدول الرواتب إلى ملف Excel"}
                  >
                    <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                  </button>

                  <button
                    onClick={onSmartPrint}
                    className="flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-md p-2 transition-all shadow-sm cursor-pointer"
                    title={isEnglishTable ? "Smart Independent Print (Recommended)" : "الطباعة الذكية المستقلة (الموصى بها)"}
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </header>
  );
};
