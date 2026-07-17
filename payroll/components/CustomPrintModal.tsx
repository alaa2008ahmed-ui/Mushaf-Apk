import React, { useState, useMemo } from 'react';
import { Search, Printer, CheckSquare, Square, Users } from 'lucide-react';
import { Employee } from '../types';
import { calculateEmployeeTotals, formatCurrency } from '../utils/calculations';

interface CustomPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  payrollPhase: 'full' | 'phase1' | 'phase2';
  onPrint: (selectedEmployees: Employee[], printBranch?: string) => void;
}

export const CustomPrintModal: React.FC<CustomPrintModalProps> = ({
  isOpen,
  onClose,
  employees,
  payrollPhase,
  onPrint,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [selectedIds, setSelectedIds] = useState<Record<number, boolean>>({});

  // Reset filters and branch when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedBranch('All');
    }
  }, [isOpen]);

  // Extract all unique branches
  const branches = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((emp) => {
      if (emp.branch) set.add(emp.branch.trim());
    });
    return Array.from(set);
  }, [employees]);

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchBranch = selectedBranch === 'All' || emp.branch?.trim() === selectedBranch;
      const matchSearch =
        !searchTerm.trim() ||
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.jobTitle && emp.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchBranch && matchSearch;
    });
  }, [employees, selectedBranch, searchTerm]);

  // Auto-select all matching employees when selectedBranch or search term changes
  React.useEffect(() => {
    const updated: Record<number, boolean> = {};
    filteredEmployees.forEach((emp) => {
      updated[emp.id] = true;
    });
    setSelectedIds(updated);
  }, [selectedBranch, searchTerm, employees]);

  // Toggle single employee
  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Toggle select/deselect all matching
  const isAllFilteredSelected = useMemo(() => {
    return filteredEmployees.length > 0 && filteredEmployees.every(emp => !!selectedIds[emp.id]);
  }, [filteredEmployees, selectedIds]);

  const handleToggleSelectAll = () => {
    if (isAllFilteredSelected) {
      // Deselect all filtered
      setSelectedIds((prev) => {
        const updated = { ...prev };
        filteredEmployees.forEach((emp) => {
          updated[emp.id] = false;
        });
        return updated;
      });
    } else {
      // Select all filtered
      setSelectedIds((prev) => {
        const updated = { ...prev };
        filteredEmployees.forEach((emp) => {
          updated[emp.id] = true;
        });
        return updated;
      });
    }
  };

  // Only count selected employees that are currently visible/filtered!
  const selectedFilteredEmployees = useMemo(() => {
    return filteredEmployees.filter((emp) => !!selectedIds[emp.id]);
  }, [filteredEmployees, selectedIds]);

  const selectedCount = selectedFilteredEmployees.length;

  // Sum netSalary of selected visible employees
  const totalNetSalarySelected = useMemo(() => {
    return selectedFilteredEmployees.reduce((sum, emp) => {
      const totals = calculateEmployeeTotals(emp, payrollPhase);
      return sum + totals.netSalary;
    }, 0);
  }, [selectedFilteredEmployees, payrollPhase]);

  if (!isOpen) return null;

  const handlePrintTrigger = () => {
    if (selectedFilteredEmployees.length === 0) {
      alert('يرجى تحديد موظف واحد على الأقل للطباعة.');
      return;
    }
    onPrint(selectedFilteredEmployees, selectedBranch);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto font-sans" dir="rtl">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col border border-slate-200 text-right relative">
        
        {/* Filters Panel (Now at the very top of the modal, no black header row, no X button) */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث بالاسم، الكود أو المسمى الوظيفي..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-9 pl-4 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 shadow-2xs text-slate-800 font-medium text-right"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 shadow-2xs text-slate-700 font-bold"
            >
              <option value="All">جميع الفروع</option>
              {branches.map((br) => (
                <option key={br} value={br}>
                  {br}
                </option>
              ))}
            </select>

            <button
              onClick={handleToggleSelectAll}
              className={`px-3 py-2 text-xs font-bold border rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                isAllFilteredSelected
                  ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/80"
                  : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100/80"
              }`}
            >
              {isAllFilteredSelected ? (
                <>
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>إلغاء الكل</span>
                </>
              ) : (
                <>
                  <Square className="w-3.5 h-3.5" />
                  <span>اختيار الكل</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Employee List Section */}
        <div className="flex-1 overflow-y-auto max-h-[65vh]">
          {filteredEmployees.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm font-semibold">لم يتم العثور على موظفين يطابقون معايير البحث.</p>
            </div>
          ) : (
            <table className="w-full text-right border-collapse text-sm">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="p-3 w-12 text-center">طباعة</th>
                  <th className="p-3 w-24 text-right">كود الموظف</th>
                  <th className="p-3 text-right">الاسم (العربية / الإنجليزية)</th>
                  <th className="p-3 text-right">الفرع</th>
                  <th className="p-3 text-right">إجمالي المستحقات</th>
                  <th className="p-3 text-right">إجمالي الاستقطاعات</th>
                  <th className="p-3 text-right">صافي الراتب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((emp) => {
                  const isChecked = !!selectedIds[emp.id];
                  const totals = calculateEmployeeTotals(emp, payrollPhase);
                  return (
                    <tr
                      key={emp.id}
                      onClick={() => handleToggleSelect(emp.id)}
                      className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                        isChecked ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(emp.id)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="p-3 font-mono text-xs font-bold text-slate-500 text-right">{emp.code}</td>
                      <td className="p-3 text-right">
                        <div className="font-bold text-slate-950 font-sans" dir="rtl">{emp.name}</div>
                        {emp.nameEn && (
                          <div className="text-xs text-slate-500 font-medium" dir="ltr">{emp.nameEn}</div>
                        )}
                      </td>
                      <td className="p-3 text-right font-semibold text-slate-600" dir="rtl">
                        {emp.branch || 'أخرى'}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-600">
                        {formatCurrency(totals.totalEntitlements)}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-rose-600">
                        {formatCurrency(totals.totalDeductions)}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-blue-700">
                        {formatCurrency(totals.netSalary)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-sm font-bold text-slate-700 flex items-center gap-x-4">
            <div className="font-mono text-sm font-bold flex items-center">
              <span className="text-blue-600 font-bold">{selectedCount}</span>
              <span className="text-slate-400 mx-1.5">:</span>
              <span className="text-slate-900 font-bold">{filteredEmployees.length}</span>
            </div>
            {selectedCount > 0 && (
              <div className="text-slate-500 font-bold">
                | المبلغ: <span className="text-blue-700 font-mono text-base">{formatCurrency(totalNetSalarySelected)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              إلغاء
            </button>

            <button
              onClick={handlePrintTrigger}
              disabled={selectedCount === 0}
              className="p-2.5 text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              title={`طباعة المحدد (${selectedCount})`}
            >
              <Printer className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
