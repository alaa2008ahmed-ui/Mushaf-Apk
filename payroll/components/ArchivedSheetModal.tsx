import React from 'react';
import { X, Printer, Calendar, Users, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { ArchivedMonth } from '../types';
import { formatCurrency } from '../utils/calculations';

interface ArchivedSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  archive: ArchivedMonth | null;
  onPrint: (archive: ArchivedMonth) => void;
}

export const ArchivedSheetModal: React.FC<ArchivedSheetModalProps> = ({
  isOpen,
  onClose,
  archive,
  onPrint,
}) => {
  if (!isOpen || !archive) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto font-sans" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up border border-slate-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold flex items-center gap-2">
                {archive.sheetTitle}
                <span className="text-xs bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full font-normal border border-blue-400/30">
                  نسخة مؤرشفة
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                تاريخ الحفظ في الأرشيف: {archive.archivedAt} | عدد الموظفين: {archive.employeeCount}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onPrint(archive);
                onClose();
              }}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الكشف</span>
            </button>
            
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Totals Summary Banner */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center shrink-0">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <span className="block text-xs text-slate-500 mb-1">إجمالي الموظفين</span>
            <span className="font-extrabold text-slate-900 text-sm flex items-center justify-center gap-1">
              <Users className="w-4 h-4 text-blue-600" />
              {archive.employeeCount} موظف
            </span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <span className="block text-xs text-slate-500 mb-1">الرواتب الأساسية</span>
            <span className="font-mono font-extrabold text-slate-900 text-sm">
              {formatCurrency(archive.totals?.basicSalary || 0)}
            </span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <span className="block text-xs text-slate-500 mb-1">إجمالي الاستحقاقات</span>
            <span className="font-mono font-extrabold text-emerald-600 text-sm flex items-center justify-center gap-1">
              <ArrowUpRight className="w-4 h-4" />
              {formatCurrency(archive.totals?.totalEntitlements || 0)}
            </span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <span className="block text-xs text-slate-500 mb-1">صافي الرواتب المستحقة</span>
            <span className="font-mono font-extrabold text-blue-600 text-base">
              {formatCurrency(archive.totals?.netSalary || 0)}
            </span>
          </div>
        </div>

        {/* Archived Table Content */}
        <div className="flex-1 overflow-auto p-4 bg-slate-100/50">
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-x-auto">
            <table className="w-full text-center border-collapse text-xs font-sans dir-rtl min-w-[1100px]" dir="rtl">
              <thead>
                <tr className="bg-slate-800 text-white font-extrabold border-b border-slate-700 uppercase tracking-wider text-xs sticky top-0 z-10">
                  <th className="p-2.5 border border-slate-700 w-12">الرقم</th>
                  <th className="p-2.5 border border-slate-700 w-20">كود الموظف</th>
                  <th className="p-2.5 border border-slate-700 min-w-[160px]">اسم الموظف</th>
                  <th className="p-2.5 border border-slate-700 w-28">الإدارة / الفرع</th>
                  <th className="p-2.5 border border-slate-700 w-28">الوظيفة</th>
                  <th className="p-2.5 border border-slate-700 bg-slate-700 text-blue-300">الراتب الأساسي</th>
                  <th className="p-2.5 border border-slate-700 bg-slate-700">إضافي</th>
                  <th className="p-2.5 border border-slate-700 bg-slate-700">عمولة ومكافأة</th>
                  <th className="p-2.5 border border-slate-700 bg-emerald-950/60 text-emerald-300 font-extrabold">إجمالي استحقاق</th>
                  <th className="p-2.5 border border-slate-700 bg-slate-700 text-rose-300">تأمينات وخصم</th>
                  <th className="p-2.5 border border-slate-700 bg-slate-700 text-rose-300">سلفة وغيابات</th>
                  <th className="p-2.5 border border-slate-700 bg-rose-950/60 text-rose-300 font-extrabold">إجمالي خصم</th>
                  <th className="p-2.5 border border-slate-700 bg-blue-600 text-white font-extrabold">الصافي المستحق</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
                {archive.employees.map((emp, index) => {
                  const basic = Number(emp.basicSalary) || 0;
                  const ovt = Number(emp.overtime) || 0;
                  const comm = Number(emp.commission) || 0;
                  const bon = Number(emp.bonus) || 0;
                  const allow = (Number(emp.housingAllowance)||0)+(Number(emp.transportationAllowance)||0)+(Number(emp.foodAllowance)||0)+(Number(emp.communicationAllowance)||0);
                  const totalEnt = basic + ovt + comm + bon + allow;

                  const ins = Number(emp.insuranceDeduction) || 0;
                  const gen = Number(emp.generalDeduction) || 0;
                  const ln = Number(emp.loan) || 0;
                  const abs = Number(emp.absenceDeduction) || 0;
                  const totalDed = ins + gen + ln + abs;
                  const net = totalEnt - totalDed;

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2 border border-slate-200 font-mono text-slate-500">{index + 1}</td>
                      <td className="p-2 border border-slate-200 font-mono font-bold text-slate-700">{emp.code}</td>
                      <td className="p-2 border border-slate-200 font-bold text-slate-900 text-right pr-3">{emp.name}</td>
                      <td className="p-2 border border-slate-200 text-slate-600">{emp.branch}</td>
                      <td className="p-2 border border-slate-200 text-slate-600">{emp.jobTitle}</td>
                      <td className="p-2 border border-slate-200 font-mono font-bold">{formatCurrency(basic)}</td>
                      <td className="p-2 border border-slate-200 font-mono text-blue-600">{ovt > 0 ? formatCurrency(ovt) : '-'}</td>
                      <td className="p-2 border border-slate-200 font-mono text-blue-600">{(comm + bon) > 0 ? formatCurrency(comm + bon) : '-'}</td>
                      <td className="p-2 border border-slate-200 font-mono font-extrabold bg-emerald-50/50 text-emerald-800">{formatCurrency(totalEnt)}</td>
                      <td className="p-2 border border-slate-200 font-mono text-rose-600">{(ins + gen) > 0 ? formatCurrency(ins + gen) : '-'}</td>
                      <td className="p-2 border border-slate-200 font-mono text-rose-600">{(ln + abs) > 0 ? formatCurrency(ln + abs) : '-'}</td>
                      <td className="p-2 border border-slate-200 font-mono font-extrabold bg-rose-50/50 text-rose-800">{formatCurrency(totalDed)}</td>
                      <td className="p-2 border border-slate-200 font-mono font-extrabold bg-blue-50/50 text-blue-700 text-sm">{formatCurrency(net)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-6 py-2 rounded-xl text-xs transition-colors"
          >
            إغلاق النافذة
          </button>
        </div>

      </div>
    </div>
  );
};
