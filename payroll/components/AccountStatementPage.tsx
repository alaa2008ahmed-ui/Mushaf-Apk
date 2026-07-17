import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ArchivedMonth, Employee, ViewMode } from '../types';
import { ArrowRight, Layers, FileText, Calendar, Filter, Printer, User, Search, ChevronDown, X } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';
import { useCompanySettings } from '../../allowances/utils/companySettings';

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

interface SearchableEmployeeDropdownProps {
  employees: Employee[];
  value: string;
  onChange: (val: string) => void;
}

const SearchableEmployeeDropdown: React.FC<SearchableEmployeeDropdownProps> = ({
  employees,
  value,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const selectedEmp = employees.find(e => e.name === value || (e.name && normalizeArabicName(e.name) === normalizeArabicName(value)));
  const isAllSelected = value === 'all';

  const filteredEmployees = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return employees;
    const normalizedTerm = normalizeArabicName(term);
    return employees.filter(e => {
      const nameMatch = e.name && (
        e.name.toLowerCase().includes(term) ||
        normalizeArabicName(e.name).includes(normalizedTerm)
      );
      const nameEnMatch = e.nameEn && e.nameEn.toLowerCase().includes(term);
      const codeMatch = e.code && e.code.toString().toLowerCase().includes(term);
      const jobTitleMatch = e.jobTitle && e.jobTitle.toLowerCase().includes(term);
      return nameMatch || nameEnMatch || codeMatch || jobTitleMatch;
    });
  }, [employees, searchTerm]);

  return (
    <div ref={containerRef} className="relative w-full mt-1">
      {/* Trigger Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border border-slate-200 rounded-lg p-2.5 bg-white hover:border-indigo-500 cursor-pointer flex items-center justify-between gap-2 shadow-sm transition-colors min-h-[42px] select-none"
      >
        <div className="flex items-center gap-2 truncate">
          <User className="w-4 h-4 text-slate-400 shrink-0" />
          <span className={`truncate text-sm font-semibold ${value ? 'text-slate-800' : 'text-slate-400'}`}>
            {isAllSelected 
              ? 'الكل (جميع الموظفين)' 
              : selectedEmp 
                ? selectedEmp.name 
                : 'اختر الموظف...'}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              title="إلغاء التحديد"
              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-rose-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in duration-150">
          {/* Search Box */}
          <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="ابحث باسم الموظف أو الكود..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsOpen(false);
                } else if (e.key === 'Enter') {
                  e.preventDefault();
                  if (filteredEmployees.length > 0) {
                    onChange(filteredEmployees[0].name);
                    setIsOpen(false);
                  }
                }
              }}
              className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 font-medium"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Employee List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-50 font-sans">
            {/* option for empty / select employee */}
            <div
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className={`p-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                !value ? 'bg-indigo-50/80 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-500 font-medium'
              }`}
            >
              <span>اختر الموظف...</span>
            </div>

            {/* option for all */}
            {(!searchTerm || 'الكل'.includes(searchTerm.toLowerCase()) || 'all'.includes(searchTerm.toLowerCase()) || 'جميع الموظفين'.includes(searchTerm.toLowerCase())) && (
              <div
                onClick={() => {
                  onChange('all');
                  setIsOpen(false);
                }}
                className={`p-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                  isAllSelected ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-800'
                }`}
              >
                <span>الكل (جميع الموظفين)</span>
              </div>
            )}

            {filteredEmployees.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-400">
                لا توجد نتائج مطابقة لبحثك
              </div>
            ) : (
              filteredEmployees.map((e) => {
                const isSelected = e.name === value || (e.name && normalizeArabicName(e.name) === normalizeArabicName(value));
                return (
                  <div
                    key={e.name}
                    onClick={() => {
                      onChange(e.name);
                      setIsOpen(false);
                    }}
                    className={`p-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                      isSelected ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex flex-col truncate">
                      <span className="truncate font-semibold">{e.name}</span>
                      <span className="text-xs text-slate-400 font-normal">
                        {e.code ? `كود: ${e.code}` : ''} {e.jobTitle ? `• ${e.jobTitle}` : ''} {e.branch ? `• ${e.branch}` : ''}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface AccountStatementPageProps {
  archives: ArchivedMonth[];
  currentEmployees: Employee[];
  currentMonthName: string;
  onViewChange: (mode: ViewMode) => void;
  signatures: any;
}

export const AccountStatementPage: React.FC<AccountStatementPageProps> = ({
  archives,
  currentEmployees,
  currentMonthName,
  onViewChange,
  signatures
}) => {
  const { companyNameAr, companyNameEn } = useCompanySettings();
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<string[]>([
    'basicSalary',
    'communicationAllowance',
    'housingAllowance',
    'foodAllowance',
    'transportationAllowance',
    'commission',
    'bonus',
    'insuranceDeduction',
    'netSalary'
  ]);
  const [dateRange, setDateRange] = useState<{ start: string, end: string }>({ start: '', end: '' });

  const ORIGINAL_COLUMN_ORDER = useMemo(() => [
    'basicSalary',
    'overtime',
    'housingAllowance',
    'transportationAllowance',
    'communicationAllowance',
    'foodAllowance',
    'commission',
    'bonus',
    'insuranceDeduction',
    'generalDeduction',
    'loan',
    'absenceDeduction',
    'netSalary'
  ], []);

  const orderedSelectedItems = useMemo(() => {
    return [...selectedItems].sort((a, b) => {
      return ORIGINAL_COLUMN_ORDER.indexOf(a) - ORIGINAL_COLUMN_ORDER.indexOf(b);
    });
  }, [selectedItems, ORIGINAL_COLUMN_ORDER]);

  const getMonthAndYearBilingual = (monthIso?: string, archivedAt?: string) => {
    let year = '2026';
    let monthIdx = 5; // default June
    if (monthIso && /^\d{4}-\d{2}$/.test(monthIso)) {
      const [y, m] = monthIso.split('-');
      year = y;
      monthIdx = parseInt(m, 10) - 1;
    } else if (archivedAt) {
       const date = new Date(archivedAt);
       if (!isNaN(date.getTime())) {
          year = date.getFullYear().toString();
          monthIdx = date.getMonth();
       }
    }
    const monthsAr = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    const monthsEn = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const arStr = `${monthsAr[monthIdx] || 'يونيو'} ${year}`;
    const enStr = `${monthsEn[monthIdx] || 'June'} ${year}`;
    return { ar: arStr, en: enStr, combined: `${arStr} (${enStr})` };
  };

  // Get all available months (archives only as requested)
  const allMonths = useMemo(() => {
    const months = archives.map(a => {
      const displayTitle = getMonthAndYearBilingual(a.monthIso, a.archivedAt).en;
      return {
        id: a.id,
        name: displayTitle,
        date: new Date(a.monthIso || a.archivedAt),
        employees: a.employees,
        isCurrent: false
      };
    });

    // Sort chronologically
    return months.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [archives]);

  // Set default dateRange on mount to span the full available period
  useEffect(() => {
    if (allMonths.length > 0) {
      if (!dateRange.start) {
        setDateRange(prev => ({ ...prev, start: allMonths[0].id }));
      }
      if (!dateRange.end) {
        setDateRange(prev => ({ ...prev, end: allMonths[allMonths.length - 1].id }));
      }
    }
  }, [allMonths]);

  // List of employees only from archived records, de-duplicated by normalized name
  const allEmployeesList = useMemo(() => {
    const empMap = new Map<string, Employee>();
    allMonths.forEach(m => {
      m.employees.forEach(e => {
        if (e && e.name) {
          const norm = normalizeArabicName(e.name);
          if (!empMap.has(norm)) {
            empMap.set(norm, e);
          }
        }
      });
    });
    // Sort employees by code or name
    return Array.from(empMap.values()).sort((a, b) => {
      const codeA = parseInt(a.code || '0', 10);
      const codeB = parseInt(b.code || '0', 10);
      if (!isNaN(codeA) && !isNaN(codeB) && codeA !== 0 && codeB !== 0) {
        return codeA - codeB;
      }
      return a.name.localeCompare(b.name, 'ar');
    });
  }, [allMonths]);

  const itemsList = [
    { id: 'basicSalary', label: 'الراتب الأساسي', type: 'entitlement' },
    { id: 'overtime', label: 'الإضافي', type: 'entitlement' },
    { id: 'housingAllowance', label: 'بدل السكن', type: 'entitlement' },
    { id: 'transportationAllowance', label: 'بدل الانتقال', type: 'entitlement' },
    { id: 'communicationAllowance', label: 'بدل الاتصال', type: 'entitlement' },
    { id: 'foodAllowance', label: 'بدل الطعام', type: 'entitlement' },
    { id: 'commission', label: 'العمولة', type: 'entitlement' },
    { id: 'bonus', label: 'المكافأة', type: 'entitlement' },
    { id: 'insuranceDeduction', label: 'خصم التأمينات', type: 'deduction' },
    { id: 'generalDeduction', label: 'جزاءات', type: 'deduction' },
    { id: 'loan', label: 'سلفة', type: 'deduction' },
    { id: 'absenceDeduction', label: 'خصم الغياب', type: 'deduction' },
    { id: 'netSalary', label: 'صافي الراتب', type: 'net' }
  ];

  const handlePrint = () => {
    window.print();
  };

  const toggleItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Filter months based on dateRange
  const filteredMonths = useMemo(() => {
    let result = allMonths;
    const startMonth = allMonths.find(m => m.id === dateRange.start);
    const endMonth = allMonths.find(m => m.id === dateRange.end);

    if (startMonth) {
       result = result.filter(m => m.date >= startMonth.date);
    }
    if (endMonth) {
       result = result.filter(m => m.date <= endMonth.date);
    }
    return result; // Chronological order
  }, [allMonths, dateRange]);

  const generateStatementData = () => {
    if (!selectedEmployee) {
       return [];
    }
    const data: any[] = [];
    
    const empsToProcess = selectedEmployee === 'all' 
      ? allEmployeesList 
      : allEmployeesList.filter(e => e.name === selectedEmployee || normalizeArabicName(e.name) === normalizeArabicName(selectedEmployee));

    empsToProcess.forEach(emp => {
      const empRows: any[] = [];
      let totalValue = 0;

      filteredMonths.forEach(m => {
        // Robust employee matching in archived months using name/code
        const monthEmp = m.employees.find(e => 
          (e.name === emp.name) ||
          (e.code && emp.code && e.code.trim() === emp.code.trim()) ||
          (normalizeArabicName(e.name) === normalizeArabicName(emp.name))
        );

        if (monthEmp) {
          const rowData: any = { month: m.name };

          selectedItems.forEach(itemId => {
             let val = 0;
             if (itemId === 'netSalary') {
                const entitlements = 
                  (monthEmp.basicSalary || 0) + 
                  (monthEmp.overtime || 0) + 
                  (monthEmp.communicationAllowance || 0) + 
                  (monthEmp.housingAllowance || 0) + 
                  (monthEmp.foodAllowance || 0) + 
                  (monthEmp.transportationAllowance || 0) + 
                  (monthEmp.commission || 0) + 
                  (monthEmp.bonus || 0);
                const deductions = 
                  (monthEmp.hasInsurance !== false ? (monthEmp.insuranceDeduction || 0) : 0) + 
                  (monthEmp.generalDeduction || 0) + 
                  (monthEmp.loan || 0) + 
                  (monthEmp.absenceDeduction || 0);
                val = entitlements - deductions;
             } else {
                val = (monthEmp as any)[itemId] || 0;
             }
             rowData[itemId] = val;
          });
          
          if (selectedItems.length > 0) {
             empRows.push(rowData);
             if (selectedItems.includes('netSalary')) {
                totalValue += rowData['netSalary'] || 0;
             } else {
                selectedItems.forEach(itemId => {
                   totalValue += rowData[itemId] || 0;
                });
             }
          }
        }
      });

      if (empRows.length > 0) {
         data.push({
            employee: emp,
            rows: empRows,
            totalValue
         });
      }
    });

    return data;
  };

  const statementData = useMemo(() => generateStatementData(), [filteredMonths, selectedEmployee, selectedItems, dateRange]);

  const isFormComplete = selectedEmployee !== '';

  return (
    <div className="p-4 sm:p-6 w-full font-sans min-h-screen bg-slate-50">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 print:hidden gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-600" />
            كشف حساب للموظفين
          </h1>
          <p className="text-slate-500 mt-1 font-medium">عرض تفصيلي لبنود الرواتب خلال فترات زمنية محددة</p>
        </div>
        <div className="flex gap-2">
          {isFormComplete && (
             <button
               onClick={handlePrint}
               className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-bold shadow-sm transition-all"
             >
               <Printer className="w-4 h-4" />
               طباعة
             </button>
          )}
          <button
            onClick={() => onViewChange('table')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-bold shadow-sm transition-all"
          >
            العودة للجدول
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 print:hidden space-y-6">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
               <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  الفترة الزمنية
               </label>
               <div className="flex gap-4">
                  <div className="flex-1">
                     <span className="text-xs text-slate-500 block mb-1">من (شهر / سنة)</span>
                     <select 
                        className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                     >
                        <option value="">اختر الشهر...</option>
                        {allMonths.map(m => (
                           <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                     </select>
                  </div>
                  <div className="flex-1">
                     <span className="text-xs text-slate-500 block mb-1">إلى (شهر / سنة)</span>
                     <select 
                        className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                     >
                        <option value="">اختر الشهر...</option>
                        {allMonths.map(m => (
                           <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                     </select>
                  </div>
               </div>
            </div>
            
            <div>
               <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-500" />
                  تحديد الموظف
               </label>
               <SearchableEmployeeDropdown
                  employees={allEmployeesList}
                  value={selectedEmployee}
                  onChange={setSelectedEmployee}
               />
            </div>
         </div>

         <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
               <FileText className="w-4 h-4 text-indigo-500" />
               البنود المراد عرضها
            </label>
            <div className="flex flex-wrap gap-2">
               {itemsList.map(item => (
                  <button
                     key={item.id}
                     onClick={() => toggleItem(item.id)}
                     className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                        selectedItems.includes(item.id) 
                           ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-xs' 
                           : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                     }`}
                  >
                     {item.label}
                  </button>
               ))}
            </div>
         </div>
      </div>

      {/* Results */}
      <div className="space-y-8 print-statement-container">
         {!isFormComplete ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
               <Layers className="w-12 h-12 text-slate-300 mx-auto mb-4" />
               <h3 className="text-lg font-bold text-slate-900">حدد البيانات لعرض كشف الحساب</h3>
               <p className="text-slate-500 mt-1">الرجاء اختيار الفترة الزمنية والموظف لظهور النتائج</p>
            </div>
         ) : statementData.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
               <Layers className="w-12 h-12 text-slate-300 mx-auto mb-4" />
               <h3 className="text-lg font-bold text-slate-900">لا توجد بيانات</h3>
               <p className="text-slate-500 mt-1">لم يتم العثور على أي بيانات تطابق معايير البحث المحددة</p>
            </div>
         ) : (
            statementData.map((empData, idx) => {
               // Calculate column totals for this employee's statement
               const columnTotals: { [key: string]: number } = {};
               orderedSelectedItems.forEach(itemId => {
                 columnTotals[itemId] = empData.rows.reduce((sum: number, row: any) => sum + (row[itemId] || 0), 0);
               });

               return (
                  <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print:shadow-none print:border-none print:mb-8 break-inside-avoid print:w-full print:max-w-full print:p-0 print:m-0">
                     {/* Print Header */}
                     <div className="hidden print:block mb-6 border-b-2 border-slate-800 pb-4 text-center">
                        <div className="flex justify-between items-center mb-2">
                           <div className="text-right">
                              <h2 className="text-xl font-black text-slate-800">{companyNameAr}</h2>
                              <h3 className="text-sm font-bold text-slate-500">{companyNameEn}</h3>
                           </div>
                           <div className="text-center">
                              <h1 className="text-2xl font-black text-slate-900">كشف حساب رواتب الموظف</h1>
                              <p className="text-sm font-bold text-slate-500">Employee Payroll Statement</p>
                           </div>
                           <div className="text-left">
                              <p className="text-xs font-bold text-slate-400">تاريخ الطباعة: {new Date().toLocaleDateString('en-GB')}</p>
                           </div>
                        </div>
                        <div className="bg-slate-900 text-white py-2 px-4 rounded-xl mt-4 flex justify-between items-center">
                           <span className="font-black text-lg">الموظف: {empData.employee.name}</span>
                           <span className="font-bold text-sm">كود: {empData.employee.code || empData.employee.id}</span>
                        </div>
                     </div>

                     <div className="bg-slate-50 p-4 border-b border-slate-200 print:bg-white print:border-b-2 print:border-slate-300 flex justify-between items-center">
                        <div className="print:hidden">
                           <h3 className="text-lg font-black text-slate-900">{empData.employee.name}</h3>
                           <p className="text-sm text-slate-500">{empData.employee.jobTitle} - {empData.employee.branch}</p>
                        </div>
                        <div className="hidden print:block">
                           <h3 className="text-sm font-bold text-slate-500">تفاصيل الحركات المالية</h3>
                        </div>
                        <div className="text-left">
                           <span className="block text-xs text-slate-500 uppercase font-black tracking-wider mb-1">الإجمالي الكلي</span>
                           <span className="text-xl font-mono font-black text-indigo-600 print:text-2xl print:text-slate-900">{formatCurrency(empData.totalValue)}</span>
                        </div>
                     </div>
                     
                     <div className="p-0 overflow-x-auto print:overflow-visible print:w-full">
                        <table className="w-full text-sm text-right print:text-[11px] print:w-full">
                           <thead className="bg-white text-slate-500 text-xs uppercase font-black print:bg-slate-100 print:text-slate-900">
                              <tr>
                                 <th className="px-6 py-3 border-b border-slate-200">الشهر</th>
                                 {orderedSelectedItems.map(itemId => (
                                    <th key={itemId} className="px-6 py-3 border-b border-slate-200 whitespace-nowrap">
                                       {itemsList.find(i => i.id === itemId)?.label}
                                    </th>
                                 ))}
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                              {empData.rows.map((row: any, rIdx: number) => (
                                 <tr key={rIdx} className="hover:bg-slate-50 print:hover:bg-transparent">
                                    <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap border-r border-slate-100">{row.month}</td>
                                    {orderedSelectedItems.map(itemId => (
                                       <td key={itemId} className="px-6 py-4 font-mono whitespace-nowrap">
                                          {formatCurrency(row[itemId] || 0)}
                                       </td>
                                    ))}
                                 </tr>
                              ))}
                           </tbody>
                           <tfoot className="bg-slate-50 border-t border-slate-200 font-bold print:bg-slate-100">
                              <tr>
                                 <td className="px-6 py-4 text-slate-900 whitespace-nowrap font-black">الإجمالي الكلي</td>
                                 {orderedSelectedItems.map(itemId => (
                                    <td key={itemId} className="px-6 py-4 font-mono text-indigo-600 whitespace-nowrap font-black print:text-slate-900">
                                       {formatCurrency(columnTotals[itemId] || 0)}
                                    </td>
                                 ))}
                              </tr>
                           </tfoot>
                        </table>
                     </div>

                     {/* Signature Section for Print */}
                     <div className="hidden print:grid grid-cols-2 gap-12 mt-12 px-8 pb-4 text-center">
                        <div>
                           <p className="font-black text-slate-500 mb-10 text-[10px] uppercase tracking-widest">توقيع الموظف</p>
                           <div className="border-t border-dashed border-slate-400 w-full max-w-[200px] mx-auto"></div>
                        </div>
                        <div>
                           <p className="font-black text-slate-500 mb-10 text-[10px] uppercase tracking-widest">اعتماد الإدارة المالية</p>
                           <div className="border-t border-dashed border-slate-400 w-full max-w-[200px] mx-auto"></div>
                        </div>
                     </div>
                  </div>
               );
            })
         )}
      </div>
      
      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: landscape;
            margin: 1.2cm;
          }
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Hide all screen components */
          body * {
            visibility: hidden;
            height: 0;
            overflow: hidden;
          }
          /* Show results container only */
          .print-statement-container, .print-statement-container * {
            visibility: visible;
            height: auto;
            overflow: visible;
          }
          /* Reset print positioning to utilize full landscape width */
          .print-statement-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            display: block !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          /* Elegant Table Styling */
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            border-spacing: 0 !important;
            margin-top: 15px !important;
            font-family: inherit;
          }
          th, td {
            border: 1px solid #334155 !important; /* solid charcoal border */
            padding: 10px 12px !important;
            font-size: 11px !important;
            text-align: right !important;
            color: #000000 !important;
          }
          th {
            background-color: #f1f5f9 !important;
            font-weight: 800 !important;
            color: #0f172a !important;
          }
          /* Totals row highlight in print */
          tfoot tr td {
            font-weight: 800 !important;
            background-color: #f8fafc !important;
            border-top: 2px solid #000000 !important;
          }
          /* Hide empty/redundant spaces */
          .shadow-sm, .rounded-2xl {
            box-shadow: none !important;
            border-radius: 0 !important;
          }
        }
      `}} />
    </div>
  );
};
