import React, { useState, useMemo } from 'react';
import { X, Save, Calendar, Users, ArrowUpRight, Calculator, AlertCircle } from 'lucide-react';
import { ArchivedMonth, Employee } from '../types';
import { formatCurrency, calculateEmployeeTotals, calculateGrandTotals, getEmployeeFieldPhase } from '../utils/calculations';

interface ArchivedSheetEditorProps {
  archive: ArchivedMonth | null;
  onSave: (updatedArchive: ArchivedMonth) => void;
  onClose: () => void;
  payrollPhase?: 'full' | 'phase1' | 'phase2';
}

export const ArchivedSheetEditor: React.FC<ArchivedSheetEditorProps> = ({
  archive,
  onSave,
  onClose,
  payrollPhase = 'full',
}) => {
  const [editedArchive, setEditedArchive] = useState<ArchivedMonth | null>(null);
  const activePhase = payrollPhase as 'full' | 'phase1' | 'phase2';

  // Initialize edited state when archive changes
  React.useEffect(() => {
    if (archive) {
      setEditedArchive(JSON.parse(JSON.stringify(archive)));
    }
  }, [archive]);

  const handleEmployeeChange = (employeeId: number, field: keyof Employee, value: string) => {
    if (!editedArchive) return;

    const numValue = parseFloat(value) || 0;
    const updatedEmployees = editedArchive.employees.map(emp => {
      if (emp.id === employeeId) {
        const updatedEmp = { ...emp, [field]: numValue };
        // Recalculate employee derived fields if needed (though usually we just store raw numbers)
        return updatedEmp;
      }
      return emp;
    });

    setEditedArchive({
      ...editedArchive,
      employees: updatedEmployees
    });
  };

  const currentTotals = useMemo(() => {
    if (!editedArchive) return null;
    return calculateGrandTotals(editedArchive.employees, activePhase);
  }, [editedArchive, activePhase]);

  const handleSave = () => {
    if (editedArchive) {
      const fullTotals = calculateGrandTotals(editedArchive.employees, 'full');
      const finalArchive = {
        ...editedArchive,
        totals: fullTotals
      };
      onSave(finalArchive);
    }
  };

  React.useEffect(() => {
    const onSaveEvent = () => {
      handleSave();
    };
    const onCloseEvent = () => {
      onClose();
    };

    window.addEventListener('save-archived-sheet', onSaveEvent);
    window.addEventListener('close-archived-sheet', onCloseEvent);

    return () => {
      window.removeEventListener('save-archived-sheet', onSaveEvent);
      window.removeEventListener('close-archived-sheet', onCloseEvent);
    };
  }, [editedArchive, onSave, onClose]);

  const renderInputCell = (
    emp: Employee,
    field: keyof Employee,
    inputClass: string = '',
    tdClass: string = ''
  ) => {
    const isVisible = activePhase === 'full' || getEmployeeFieldPhase(emp, field) === (activePhase === 'phase1' ? '1' : '2');
    
    if (!isVisible) {
      return (
        <td className="p-0 border border-slate-200 bg-slate-100/40">
          <input
            type="text"
            disabled
            className="w-full h-9 bg-transparent text-center font-mono text-slate-300 cursor-not-allowed select-none"
            value="-"
          />
        </td>
      );
    }

    return (
      <td className={`p-0 border border-slate-200 ${tdClass}`}>
        <input
          type="number"
          className={`w-full h-9 bg-transparent text-center font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 ${inputClass}`}
          value={emp[field] || ''}
          onChange={(e) => handleEmployeeChange(emp.id, field, e.target.value)}
        />
      </td>
    );
  };

  if (!editedArchive) return null;

  const editBasic = currentTotals?.basicSalary || 0;
  const editOvertimeHours = currentTotals?.overtimeHours || 0;
  const editOvertime = currentTotals?.overtime || 0;
  const editHousing = currentTotals?.housingAllowance || 0;
  const editTransport = currentTotals?.transportationAllowance || 0;
  const editCommunication = currentTotals?.communicationAllowance || 0;
  const editFood = currentTotals?.foodAllowance || 0;
  const editCommission = currentTotals?.commission || 0;
  const editBonus = currentTotals?.bonus || 0;
  const editInsurance = currentTotals?.insuranceDeduction || 0;
  const editGeneral = currentTotals?.generalDeduction || 0;
  const editLoan = currentTotals?.loan || 0;
  const editAbsenceDays = currentTotals?.absenceDays || 0;
  const editAbsence = currentTotals?.absenceDeduction || 0;
  const editNet = currentTotals?.netSalary || 0;

  const editTotalEntitlements = currentTotals?.totalEntitlements || 0;

  const editTotalDeductions = currentTotals?.totalDeductions || 0;

  return (
    <div className="w-full flex flex-col font-sans" dir="rtl">
      <div className="bg-white min-h-screen flex flex-col">
        
        {/* Editor Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold border border-amber-500/30">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold flex items-center gap-2">
                تعديل بيانات: {archive?.sheetTitle}
                <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full font-normal border border-amber-500/30">
                  وضع التعديل المباشر
                </span>
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5">
                تنبيه: التعديلات هنا تؤثر فقط على النسخة المؤرشفة ولن تغير بيانات الجدول الرئيسي النشط.
              </p>
            </div>
          </div>

        </div>

        {/* Totals Preview Bar */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center shrink-0">
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
            <span className="block text-[10px] text-slate-500 mb-0.5">عدد الموظفين</span>
            <span className="font-extrabold text-slate-900 text-xs flex items-center justify-center gap-1">
              <Users className="w-3 h-3 text-blue-600" />
              {editedArchive.employeeCount}
            </span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
            <span className="block text-[10px] text-slate-500 mb-0.5">إجمالي الاستحقاقات</span>
            <span className="font-mono font-extrabold text-emerald-600 text-xs">
              {formatCurrency(currentTotals?.totalEntitlements || 0)}
            </span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
            <span className="block text-[10px] text-slate-500 mb-0.5">إجمالي الخصومات</span>
            <span className="font-mono font-extrabold text-rose-600 text-xs">
              {formatCurrency(currentTotals?.totalDeductions || 0)}
            </span>
          </div>
          <div className="bg-indigo-50 p-2.5 rounded-xl border border-indigo-200 shadow-sm">
            <span className="block text-[10px] text-indigo-500 mb-0.5">الصافي الجديد</span>
            <span className="font-mono font-extrabold text-indigo-700 text-sm">
              {formatCurrency(currentTotals?.netSalary || 0)}
            </span>
          </div>
        </div>

        {/* Editable Table */}
        <div className="flex-1 p-2 sm:p-4 bg-slate-100/50">
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-auto max-h-[70vh]">
            <table className="w-full text-center border-collapse text-[11px] font-sans dir-rtl min-w-[1850px]" dir="rtl">
              <thead className="sticky top-0 z-20 shadow-sm bg-slate-800 text-white font-extrabold">
                <tr className="bg-slate-800 text-white font-extrabold border-b border-slate-700">
                  <th className="p-2 border border-slate-700 w-10">ت</th>
                  <th className="p-2 border border-slate-700 w-20">الكود</th>
                  <th className="p-2 border border-slate-700 w-32 min-w-[120px] text-right pr-4">اسم الموظف</th>
                  <th className="p-2 border border-slate-700 w-24">الفرع</th>
                  <th className="p-2 border border-slate-700 w-24">الوظيفة</th>
                  
                  {/* Entitlements */}
                  <th className="p-2 border border-slate-700 w-24 bg-slate-700 text-blue-300">الأساسي</th>
                  <th className="p-2 border border-slate-700 w-16 bg-slate-700 text-blue-300">ساعات العمل</th>
                  <th className="p-2 border border-slate-700 w-20 bg-slate-700 text-blue-300">إضافي</th>
                  <th className="p-2 border border-slate-700 w-20 bg-slate-700 text-blue-300">بدل سكن</th>
                  <th className="p-2 border border-slate-700 w-20 bg-slate-700 text-blue-300">بدل انتقال</th>
                  <th className="p-2 border border-slate-700 w-20 bg-slate-700 text-blue-300">بدل اتصال</th>
                  <th className="p-2 border border-slate-700 w-20 bg-slate-700 text-blue-300">بدل طعام</th>
                  <th className="p-2 border border-slate-700 w-20 bg-slate-700 text-blue-300">عمولة</th>
                  <th className="p-2 border border-slate-700 w-20 bg-slate-700 text-blue-300">مكافأة</th>
                  <th className="p-2 border border-slate-700 w-24 bg-amber-700 text-white font-extrabold text-[10px]">
                    إجمالي الاستحقاقات
                  </th>
                  
                  {/* Deductions */}
                  <th className="p-2 border border-slate-700 w-20 bg-slate-700 text-rose-300">تأمينات</th>
                  <th className="p-2 border border-slate-700 w-20 bg-slate-700 text-rose-300">خصم</th>
                  <th className="p-2 border border-slate-700 w-20 bg-slate-700 text-rose-300">سلفة</th>
                  <th className="p-2 border border-slate-700 w-16 bg-slate-700 text-rose-300">أيام الغياب</th>
                  <th className="p-2 border border-slate-700 w-20 bg-slate-700 text-rose-300">غياب</th>
                  <th className="p-2 border border-slate-700 w-24 bg-rose-700 text-white font-extrabold text-[10px]">
                    إجمالي الاستقطاعات
                  </th>
                  <th className="p-2 border border-slate-700 bg-blue-600 text-white w-24">الصافي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {editedArchive.employees.map((emp, index) => {
                  const totals = calculateEmployeeTotals(emp, activePhase);
                  return (
                    <tr key={emp.id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="p-1 border border-slate-200 font-mono text-slate-400">{index + 1}</td>
                      <td className="p-1 border border-slate-200 font-mono font-bold text-slate-600">{emp.code}</td>
                      <td className="p-1 border border-slate-200 font-bold text-slate-900 text-right pr-3">{emp.name}</td>
                      <td className="p-1 border border-slate-200 text-slate-600 text-right pr-2 text-[10px]">{emp.branch || 'أخرى'}</td>
                      <td className="p-1 border border-slate-200 text-slate-600 text-right pr-2 text-[10px]">{emp.jobTitle}</td>
                      
                      {/* Editable Fields */}
                      {renderInputCell(emp, 'basicSalary', 'font-bold focus:ring-indigo-500')}
                      {renderInputCell(emp, 'overtimeHours', 'focus:ring-indigo-500')}
                      {renderInputCell(emp, 'overtime', 'focus:ring-indigo-500')}
                      {renderInputCell(emp, 'housingAllowance', 'focus:ring-indigo-500')}
                      {renderInputCell(emp, 'transportationAllowance', 'focus:ring-indigo-500')}
                      {renderInputCell(emp, 'communicationAllowance', 'focus:ring-indigo-500')}
                      {renderInputCell(emp, 'foodAllowance', 'focus:ring-indigo-500')}
                      {renderInputCell(emp, 'commission', 'focus:ring-indigo-500')}
                      {renderInputCell(emp, 'bonus', 'focus:ring-indigo-500')}
                      
                      {/* Entitlements Total */}
                      <td className="p-1 border border-slate-200 font-mono font-bold bg-amber-50/50 text-amber-800">
                        {formatCurrency(totals.totalEntitlements)}
                      </td>
                      
                      {renderInputCell(emp, 'insuranceDeduction', 'text-rose-700 focus:ring-rose-500', 'bg-rose-50/30')}
                      {renderInputCell(emp, 'generalDeduction', 'text-rose-700 focus:ring-rose-500', 'bg-rose-50/30')}
                      {renderInputCell(emp, 'loan', 'text-rose-700 focus:ring-rose-500', 'bg-rose-50/30')}
                      {renderInputCell(emp, 'absenceDays', 'text-rose-700 focus:ring-rose-500', 'bg-rose-50/30')}
                      {renderInputCell(emp, 'absenceDeduction', 'text-rose-700 focus:ring-rose-500', 'bg-rose-50/30')}
                      
                      {/* Deductions Total */}
                      <td className="p-1 border border-slate-200 font-mono font-bold bg-rose-50/50 text-rose-800">
                        {formatCurrency(totals.totalDeductions)}
                      </td>
                      
                      <td className="p-1 border border-slate-200 font-mono font-extrabold bg-blue-50 text-blue-700">
                        {formatCurrency(totals.netSalary)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-200 text-slate-950 font-extrabold border-t-2 border-slate-700">
                  <td colSpan={5} className="p-2 border border-slate-300 text-center text-xs font-bold bg-slate-200">الإجمالي العام</td>
                  <td className="p-2 border border-slate-300 font-mono text-xs">{formatCurrency(editBasic)}</td>
                  <td className="p-2 border border-slate-300 font-mono text-xs text-slate-700">{editOvertimeHours}</td>
                  <td className="p-2 border border-slate-300 font-mono text-xs text-blue-700">{formatCurrency(editOvertime)}</td>
                  <td className="p-2 border border-slate-300 font-mono text-xs">{formatCurrency(editHousing)}</td>
                  <td className="p-2 border border-slate-300 font-mono text-xs">{formatCurrency(editTransport)}</td>
                  <td className="p-2 border border-slate-300 font-mono text-xs">{formatCurrency(editCommunication)}</td>
                  <td className="p-2 border border-slate-300 font-mono text-xs">{formatCurrency(editFood)}</td>
                  <td className="p-2 border border-slate-300 font-mono text-xs text-blue-700">{formatCurrency(editCommission)}</td>
                  <td className="p-2 border border-slate-300 font-mono text-xs text-blue-700">{formatCurrency(editBonus)}</td>
                  <td className="p-2 border border-slate-300 font-mono text-xs font-extrabold text-amber-800 bg-amber-100">{formatCurrency(editTotalEntitlements)}</td>
                  <td className="p-2 border border-slate-300 font-mono text-xs text-rose-700 bg-rose-50/50">{formatCurrency(editInsurance)}</td>
                  <td className="p-2 border border-slate-300 font-mono text-xs text-rose-700 bg-rose-50/50">{formatCurrency(editGeneral)}</td>
                  <td className="p-2 border border-slate-300 font-mono text-xs text-rose-700 bg-rose-50/50">{formatCurrency(editLoan)}</td>
                  <td className="p-2 border border-slate-300 font-mono text-xs text-rose-700 bg-rose-50/50">{editAbsenceDays}</td>
                  <td className="p-2 border border-slate-300 font-mono text-xs text-rose-700 bg-rose-50/50">{formatCurrency(editAbsence)}</td>
                  <td className="p-2 border border-slate-300 font-mono text-xs font-extrabold text-rose-800 bg-rose-100">{formatCurrency(editTotalDeductions)}</td>
                  <td className="p-2 border border-slate-300 font-mono text-xs font-extrabold text-blue-700 bg-blue-100">{formatCurrency(editNet)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-center shrink-0">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-[10px] font-bold">تأكد من مراجعة المجموع النهائي قبل الضغط على حفظ.</span>
          </div>
        </div>

      </div>
    </div>
  );
};
