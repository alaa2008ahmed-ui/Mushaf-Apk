import React, { useState, useMemo } from 'react';
import { X, Save, Calendar, Users, ArrowUpRight, Calculator, AlertCircle } from 'lucide-react';
import { ArchivedMonth, Employee } from '../types';
import { formatCurrency, calculateEmployeeTotals, calculateGrandTotals } from '../utils/calculations';

interface ArchivedSheetEditorProps {
  isOpen: boolean;
  onClose: () => void;
  archive: ArchivedMonth | null;
  onSave: (updatedArchive: ArchivedMonth) => void;
}

export const ArchivedSheetEditor: React.FC<ArchivedSheetEditorProps> = ({
  isOpen,
  onClose,
  archive,
  onSave,
}) => {
  const [editedArchive, setEditedArchive] = useState<ArchivedMonth | null>(null);

  // Initialize edited state when archive changes
  React.useEffect(() => {
    if (archive && isOpen) {
      setEditedArchive(JSON.parse(JSON.stringify(archive)));
    }
  }, [archive, isOpen]);

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
    return calculateGrandTotals(editedArchive.employees);
  }, [editedArchive]);

  const handleSave = () => {
    if (editedArchive && currentTotals) {
      const finalArchive = {
        ...editedArchive,
        totals: currentTotals
      };
      onSave(finalArchive);
      onClose();
    }
  };

  if (!isOpen || !editedArchive) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center z-[60] p-2 sm:p-4 overflow-y-auto font-sans" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[98vw] h-[95vh] flex flex-col overflow-hidden border border-slate-200">
        
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

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold transition-all border border-slate-700"
            >
              إلغاء التعديل
            </button>
            
            <button
              onClick={handleSave}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-emerald-900/20 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>حفظ التعديلات نهائياً</span>
            </button>
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
        <div className="flex-1 overflow-auto p-2 sm:p-4 bg-slate-100/50">
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-x-auto h-full">
            <table className="w-full text-center border-collapse text-[11px] font-sans dir-rtl min-w-[1400px]" dir="rtl">
              <thead>
                <tr className="bg-slate-800 text-white font-extrabold border-b border-slate-700 sticky top-0 z-10">
                  <th className="p-2 border border-slate-700 w-10">ت</th>
                  <th className="p-2 border border-slate-700 w-20">الكود</th>
                  <th className="p-2 border border-slate-700 min-w-[160px] text-right pr-4">اسم الموظف</th>
                  <th className="p-2 border border-slate-700 w-24 bg-slate-700 text-blue-300">الأساسي</th>
                  <th className="p-2 border border-slate-700 w-20 bg-slate-700">إضافي</th>
                  <th className="p-2 border border-slate-700 w-20 bg-slate-700">عمولة</th>
                  <th className="p-2 border border-slate-700 w-20 bg-slate-700">مكافأة</th>
                  <th className="p-2 border border-slate-700 w-20 bg-slate-700">بدل سكن</th>
                  <th className="p-2 border border-slate-700 w-20 bg-slate-700">بدل انتقال</th>
                  <th className="p-2 border border-slate-700 w-20 bg-slate-700 text-rose-300">تأمينات</th>
                  <th className="p-2 border border-slate-700 w-20 bg-slate-700 text-rose-300">خصم</th>
                  <th className="p-2 border border-slate-700 w-20 bg-slate-700 text-rose-300">سلفة</th>
                  <th className="p-2 border border-slate-700 w-20 bg-slate-700 text-rose-300">غياب</th>
                  <th className="p-2 border border-slate-700 bg-blue-600 text-white w-24">الصافي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {editedArchive.employees.map((emp, index) => {
                  const totals = calculateEmployeeTotals(emp);
                  return (
                    <tr key={emp.id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="p-1 border border-slate-200 font-mono text-slate-400">{index + 1}</td>
                      <td className="p-1 border border-slate-200 font-bold text-slate-600">{emp.code}</td>
                      <td className="p-1 border border-slate-200 font-bold text-slate-900 text-right pr-3">{emp.name}</td>
                      
                      {/* Editable Fields */}
                      <td className="p-0 border border-slate-200">
                        <input
                          type="number"
                          className="w-full h-9 bg-transparent text-center font-mono font-bold focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          value={emp.basicSalary || ''}
                          onChange={(e) => handleEmployeeChange(emp.id, 'basicSalary', e.target.value)}
                        />
                      </td>
                      <td className="p-0 border border-slate-200">
                        <input
                          type="number"
                          className="w-full h-9 bg-transparent text-center font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          value={emp.overtime || ''}
                          onChange={(e) => handleEmployeeChange(emp.id, 'overtime', e.target.value)}
                        />
                      </td>
                      <td className="p-0 border border-slate-200">
                        <input
                          type="number"
                          className="w-full h-9 bg-transparent text-center font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          value={emp.commission || ''}
                          onChange={(e) => handleEmployeeChange(emp.id, 'commission', e.target.value)}
                        />
                      </td>
                      <td className="p-0 border border-slate-200">
                        <input
                          type="number"
                          className="w-full h-9 bg-transparent text-center font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          value={emp.bonus || ''}
                          onChange={(e) => handleEmployeeChange(emp.id, 'bonus', e.target.value)}
                        />
                      </td>
                      <td className="p-0 border border-slate-200">
                        <input
                          type="number"
                          className="w-full h-9 bg-transparent text-center font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          value={emp.housingAllowance || ''}
                          onChange={(e) => handleEmployeeChange(emp.id, 'housingAllowance', e.target.value)}
                        />
                      </td>
                      <td className="p-0 border border-slate-200">
                        <input
                          type="number"
                          className="w-full h-9 bg-transparent text-center font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          value={emp.transportationAllowance || ''}
                          onChange={(e) => handleEmployeeChange(emp.id, 'transportationAllowance', e.target.value)}
                        />
                      </td>
                      
                      <td className="p-0 border border-slate-200 bg-rose-50/30">
                        <input
                          type="number"
                          className="w-full h-9 bg-transparent text-center font-mono text-rose-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                          value={emp.insuranceDeduction || ''}
                          onChange={(e) => handleEmployeeChange(emp.id, 'insuranceDeduction', e.target.value)}
                        />
                      </td>
                      <td className="p-0 border border-slate-200 bg-rose-50/30">
                        <input
                          type="number"
                          className="w-full h-9 bg-transparent text-center font-mono text-rose-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                          value={emp.generalDeduction || ''}
                          onChange={(e) => handleEmployeeChange(emp.id, 'generalDeduction', e.target.value)}
                        />
                      </td>
                      <td className="p-0 border border-slate-200 bg-rose-50/30">
                        <input
                          type="number"
                          className="w-full h-9 bg-transparent text-center font-mono text-rose-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                          value={emp.loan || ''}
                          onChange={(e) => handleEmployeeChange(emp.id, 'loan', e.target.value)}
                        />
                      </td>
                      <td className="p-0 border border-slate-200 bg-rose-50/30">
                        <input
                          type="number"
                          className="w-full h-9 bg-transparent text-center font-mono text-rose-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                          value={emp.absenceDeduction || ''}
                          onChange={(e) => handleEmployeeChange(emp.id, 'absenceDeduction', e.target.value)}
                        />
                      </td>
                      
                      <td className="p-1 border border-slate-200 font-mono font-extrabold bg-blue-50 text-blue-700">
                        {formatCurrency(totals.netSalary)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-[10px] font-bold">تأكد من مراجعة المجموع النهائي قبل الضغط على حفظ.</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-8 py-2.5 rounded-xl text-xs transition-all"
            >
              إلغاء التعديلات
            </button>
            <button
              onClick={handleSave}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-12 py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-900/20 transition-all"
            >
              حفظ واعتماد التغييرات
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
