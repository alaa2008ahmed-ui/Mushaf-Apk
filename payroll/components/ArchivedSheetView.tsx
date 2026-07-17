import React from 'react';
import { ArrowRight, Calendar, Users, ArrowUpRight } from 'lucide-react';
import { ArchivedMonth } from '../types';
import { formatCurrency, calculateEmployeeTotals, calculateGrandTotals, getEmployeeFieldPhase, formatArchiveMonthName } from '../utils/calculations';

interface ArchivedSheetViewProps {
  archive: ArchivedMonth;
  onBack: () => void;
  payrollPhase?: 'full' | 'phase1' | 'phase2';
  isEnglish?: boolean;
}

export const ArchivedSheetView: React.FC<ArchivedSheetViewProps> = ({
  archive,
  onBack,
  payrollPhase = 'full',
  isEnglish = false,
}) => {
  const activePhase = payrollPhase as 'full' | 'phase1' | 'phase2';

  // Use the helper to calculate grand totals for the selected phase
  const totals = calculateGrandTotals(archive.employees, activePhase);

  const sumBasic = totals.basicSalary || 0;
  const sumOvertimeHours = totals.overtimeHours || 0;
  const sumOvertime = totals.overtime || 0;
  const sumHousing = totals.housingAllowance || 0;
  const sumTransport = totals.transportationAllowance || 0;
  const sumCommunication = totals.communicationAllowance || 0;
  const sumFood = totals.foodAllowance || 0;
  const sumCommission = totals.commission || 0;
  const sumBonus = totals.bonus || 0;
  const sumTotalEnt = totals.totalEntitlements || 0;

  const sumInsurance = totals.insuranceDeduction || 0;
  const sumGeneral = totals.generalDeduction || 0;
  const sumLoan = totals.loan || 0;
  const sumAbsenceDays = totals.absenceDays || 0;
  const sumAbsence = totals.absenceDeduction || 0;
  const sumTotalDed = totals.totalDeductions || 0;
  const sumNet = totals.netSalary || 0;

  return (
    <div className="w-full space-y-2 animate-fade-in font-sans" dir="rtl">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white py-2 px-4 rounded-xl shadow-xs border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white shadow-xs">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-1.5 leading-none">
              {archive.sheetTitle}
              <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-bold">
                نسخة مؤرشفة
              </span>
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 leading-none">
              {isEnglish ? `Archive Month: ${formatArchiveMonthName(archive.monthIso, true)} | Employees: ${archive.employeeCount}` : `تاريخ الحفظ في الأرشيف: ${formatArchiveMonthName(archive.monthIso, false)} | عدد الموظفين: ${archive.employeeCount} موظف`}
            </p>
          </div>
        </div>

        <button
          onClick={onBack}
          className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors border border-slate-200 cursor-pointer"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>رجوع</span>
        </button>
      </div>

      {/* Totals Summary Banner */}
      <div className="bg-white rounded-xl border border-slate-200 py-2 px-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center shadow-xs">
        <div className="bg-slate-50 py-1.5 px-2 rounded-lg border border-slate-100">
          <span className="block text-[10px] text-slate-500 mb-0.5">إجمالي الموظفين</span>
          <span className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center justify-center gap-1 leading-none">
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            {archive.employeeCount} موظف
          </span>
        </div>
        <div className="bg-slate-50 py-1.5 px-2 rounded-lg border border-slate-100">
          <span className="block text-[10px] text-slate-500 mb-0.5">الرواتب الأساسية</span>
          <span className="font-mono font-extrabold text-slate-900 text-xs sm:text-sm leading-none">
            {formatCurrency(sumBasic)}
          </span>
        </div>
        <div className="bg-slate-50 py-1.5 px-2 rounded-lg border border-slate-100">
          <span className="block text-[10px] text-slate-500 mb-0.5">إجمالي الاستحقاقات</span>
          <span className="font-mono font-extrabold text-emerald-600 text-xs sm:text-sm flex items-center justify-center gap-1 leading-none">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
            {formatCurrency(sumTotalEnt)}
          </span>
        </div>
        <div className="bg-slate-50 py-1.5 px-2 rounded-lg border border-slate-100">
          <span className="block text-[10px] text-slate-500 mb-0.5">صافي الرواتب المستحقة</span>
          <span className="font-mono font-extrabold text-indigo-600 text-sm sm:text-base leading-none">
            {formatCurrency(sumNet)}
          </span>
        </div>
      </div>

      {/* Archived Table Content */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-2 overflow-hidden">
        <div className="overflow-auto max-h-[72vh] rounded-lg border border-slate-150">
          <table className="w-full text-center border-collapse text-[10px] font-sans dir-rtl min-w-[1850px]" dir="rtl">
            <thead className="sticky top-0 z-20 shadow-xs bg-slate-800 text-white font-extrabold text-[10px]">
              <tr className="bg-slate-800 text-white font-extrabold border-b border-slate-700 uppercase tracking-wider text-[10px]">
                <th className="py-1 px-1 border border-slate-700 w-10">ت</th>
                <th className="py-1 px-1 border border-slate-700 w-16">الكود</th>
                <th className="py-1 px-1 border border-slate-700 min-w-[120px] text-right pr-2">اسم الموظف</th>
                <th className="py-1 px-1 border border-slate-700 w-24">الفرع</th>
                <th className="py-1 px-1 border border-slate-700 w-24">الوظيفة</th>
                
                {/* Entitlements */}
                <th className="py-1 px-1 border border-slate-700 bg-slate-700 text-blue-300 w-20">الأساسي</th>
                <th className="py-1 px-1 border border-slate-700 bg-slate-700 text-blue-300 w-16">ساعات العمل</th>
                <th className="py-1 px-1 border border-slate-700 bg-slate-700 text-blue-300 w-16">الإضافي</th>
                <th className="py-1 px-1 border border-slate-700 bg-slate-700 text-blue-300 w-20">بدل السكن</th>
                <th className="py-1 px-1 border border-slate-700 bg-slate-700 text-blue-300 w-20">بدل انتقال</th>
                <th className="py-1 px-1 border border-slate-700 bg-slate-700 text-blue-300 w-20">بدل اتصال</th>
                <th className="py-1 px-1 border border-slate-700 bg-slate-700 text-blue-300 w-20">بدل طعام</th>
                <th className="py-1 px-1 border border-slate-700 bg-slate-700 text-blue-300 w-16">العمولة</th>
                <th className="py-1 px-1 border border-slate-700 bg-slate-700 text-blue-300 w-16">المكافأة</th>
                <th className="py-1 px-1 border border-slate-700 bg-emerald-950 text-emerald-300 font-extrabold w-24">إجمالي استحقاق</th>
                
                {/* Deductions */}
                <th className="py-1 px-1 border border-slate-700 bg-slate-700 text-rose-300 w-16">تأمينات</th>
                <th className="py-1 px-1 border border-slate-700 bg-slate-700 text-rose-300 w-16">خصم</th>
                <th className="py-1 px-1 border border-slate-700 bg-slate-700 text-rose-300 w-16">سلفة</th>
                <th className="py-1 px-1 border border-slate-700 bg-slate-700 text-rose-300 w-16">أيام الغياب</th>
                <th className="py-1 px-1 border border-slate-700 bg-slate-700 text-rose-300 w-16">غيابات</th>
                <th className="py-1 px-1 border border-slate-700 bg-rose-950 text-rose-300 font-extrabold w-24">إجمالي خصم</th>
                
                <th className="py-1 px-1 border border-slate-700 bg-indigo-600 text-white font-extrabold w-24">الصافي المستحق</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800 font-medium text-[10px]">
              {archive.employees.map((emp, index) => {
                const totals = calculateEmployeeTotals(emp, activePhase);

                const basic = totals.basicSalary || 0;
                
                const isOvertimeHoursVisible = activePhase === 'full' || getEmployeeFieldPhase(emp, 'overtimeHours') === (activePhase === 'phase1' ? '1' : '2');
                const ovtHours = isOvertimeHoursVisible ? (emp.overtimeHours || 0) : 0;

                const isOvertimeVisible = activePhase === 'full' || getEmployeeFieldPhase(emp, 'overtime') === (activePhase === 'phase1' ? '1' : '2');
                const ovt = isOvertimeVisible ? (emp.overtime || 0) : 0;

                const isHousingVisible = activePhase === 'full' || getEmployeeFieldPhase(emp, 'housingAllowance') === (activePhase === 'phase1' ? '1' : '2');
                const housing = isHousingVisible ? (emp.housingAllowance || 0) : 0;

                const isTransportVisible = activePhase === 'full' || getEmployeeFieldPhase(emp, 'transportationAllowance') === (activePhase === 'phase1' ? '1' : '2');
                const transport = isTransportVisible ? (emp.transportationAllowance || 0) : 0;

                const isCommunicationVisible = activePhase === 'full' || getEmployeeFieldPhase(emp, 'communicationAllowance') === (activePhase === 'phase1' ? '1' : '2');
                const communication = isCommunicationVisible ? (emp.communicationAllowance || 0) : 0;

                const isFoodVisible = activePhase === 'full' || getEmployeeFieldPhase(emp, 'foodAllowance') === (activePhase === 'phase1' ? '1' : '2');
                const food = isFoodVisible ? (emp.foodAllowance || 0) : 0;

                const isCommVisible = activePhase === 'full' || getEmployeeFieldPhase(emp, 'commission') === (activePhase === 'phase1' ? '1' : '2');
                const comm = isCommVisible ? (emp.commission || 0) : 0;

                const isBonVisible = activePhase === 'full' || getEmployeeFieldPhase(emp, 'bonus') === (activePhase === 'phase1' ? '1' : '2');
                const bon = isBonVisible ? (emp.bonus || 0) : 0;

                const totalEnt = totals.totalEntitlements || 0;

                const ins = totals.insuranceDeduction || 0;

                const isGenVisible = activePhase === 'full' || getEmployeeFieldPhase(emp, 'generalDeduction') === (activePhase === 'phase1' ? '1' : '2');
                const gen = isGenVisible ? (emp.generalDeduction || 0) : 0;

                const isLoanVisible = activePhase === 'full' || getEmployeeFieldPhase(emp, 'loan') === (activePhase === 'phase1' ? '1' : '2');
                const ln = isLoanVisible ? (emp.loan || 0) : 0;

                const isAbsDaysVisible = activePhase === 'full' || getEmployeeFieldPhase(emp, 'absenceDays') === (activePhase === 'phase1' ? '1' : '2');
                const absDays = isAbsDaysVisible ? (emp.absenceDays || 0) : 0;

                const isAbsVisible = activePhase === 'full' || getEmployeeFieldPhase(emp, 'absenceDeduction') === (activePhase === 'phase1' ? '1' : '2');
                const abs = isAbsVisible ? (emp.absenceDeduction || 0) : 0;

                const totalDed = totals.totalDeductions || 0;
                const net = totals.netSalary || 0;

                return (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors h-7 leading-none">
                    <td className="py-0.5 px-1 border border-slate-200 font-mono text-slate-500">{index + 1}</td>
                    <td className="py-0.5 px-1 border border-slate-200 font-mono font-bold text-slate-700">{emp.code}</td>
                    <td className="py-0.5 px-1 border border-slate-200 font-bold text-slate-900 text-right pr-2">{emp.name}</td>
                    <td className="py-0.5 px-1 border border-slate-200 text-slate-600 text-right pr-2">{emp.branch || 'أخرى'}</td>
                    <td className="py-0.5 px-1 border border-slate-200 text-slate-600 text-right pr-2">{emp.jobTitle}</td>
                    <td className="py-0.5 px-1 border border-slate-200 font-mono font-bold">{formatCurrency(basic)}</td>
                    <td className="py-0.5 px-1 border border-slate-200 font-mono text-slate-600">{ovtHours > 0 ? ovtHours : '-'}</td>
                    <td className="py-0.5 px-1 border border-slate-200 font-mono text-blue-600">{ovt > 0 ? formatCurrency(ovt) : '-'}</td>
                    <td className="py-0.5 px-1 border border-slate-200 font-mono text-blue-600">{housing > 0 ? formatCurrency(housing) : '-'}</td>
                    <td className="py-0.5 px-1 border border-slate-200 font-mono text-blue-600">{transport > 0 ? formatCurrency(transport) : '-'}</td>
                    <td className="py-0.5 px-1 border border-slate-200 font-mono text-blue-600">{communication > 0 ? formatCurrency(communication) : '-'}</td>
                    <td className="py-0.5 px-1 border border-slate-200 font-mono text-blue-600">{food > 0 ? formatCurrency(food) : '-'}</td>
                    <td className="py-0.5 px-1 border border-slate-200 font-mono text-blue-600">{comm > 0 ? formatCurrency(comm) : '-'}</td>
                    <td className="py-0.5 px-1 border border-slate-200 font-mono text-blue-600">{bon > 0 ? formatCurrency(bon) : '-'}</td>
                    <td className="py-0.5 px-1 border border-slate-200 font-mono font-extrabold bg-emerald-50/50 text-emerald-800">{formatCurrency(totalEnt)}</td>
                    <td className="py-0.5 px-1 border border-slate-200 font-mono text-rose-600">{ins > 0 ? formatCurrency(ins) : '-'}</td>
                    <td className="py-0.5 px-1 border border-slate-200 font-mono text-rose-600">{gen > 0 ? formatCurrency(gen) : '-'}</td>
                    <td className="py-0.5 px-1 border border-slate-200 font-mono text-rose-600">{ln > 0 ? formatCurrency(ln) : '-'}</td>
                    <td className="py-0.5 px-1 border border-slate-200 font-mono text-rose-600">{absDays > 0 ? absDays : '-'}</td>
                    <td className="py-0.5 px-1 border border-slate-200 font-mono text-rose-600">{abs > 0 ? formatCurrency(abs) : '-'}</td>
                    <td className="py-0.5 px-1 border border-slate-200 font-mono font-extrabold bg-rose-50/50 text-rose-800">{formatCurrency(totalDed)}</td>
                    <td className="py-0.5 px-1 border border-slate-200 font-mono font-extrabold bg-indigo-50 text-indigo-700">{formatCurrency(net)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-200 text-slate-900 font-extrabold border-t border-slate-400 text-[10px] h-7 leading-none">
                <td colSpan={5} className="py-0.5 px-1 border border-slate-300 text-center font-bold bg-slate-200">الإجمالي العام</td>
                <td className="py-0.5 px-1 border border-slate-300 font-mono">{formatCurrency(sumBasic)}</td>
                <td className="py-0.5 px-1 border border-slate-300 font-mono text-slate-700">{sumOvertimeHours}</td>
                <td className="py-0.5 px-1 border border-slate-300 font-mono text-blue-800">{formatCurrency(sumOvertime)}</td>
                <td className="py-0.5 px-1 border border-slate-300 font-mono text-blue-800">{formatCurrency(sumHousing)}</td>
                <td className="py-0.5 px-1 border border-slate-300 font-mono text-blue-800">{formatCurrency(sumTransport)}</td>
                <td className="py-0.5 px-1 border border-slate-300 font-mono text-blue-800">{formatCurrency(sumCommunication)}</td>
                <td className="py-0.5 px-1 border border-slate-300 font-mono text-blue-800">{formatCurrency(sumFood)}</td>
                <td className="py-0.5 px-1 border border-slate-300 font-mono text-blue-800">{formatCurrency(sumCommission)}</td>
                <td className="py-0.5 px-1 border border-slate-300 font-mono text-blue-800">{formatCurrency(sumBonus)}</td>
                <td className="py-0.5 px-1 border border-slate-300 font-mono text-emerald-800 bg-emerald-100">{formatCurrency(sumTotalEnt)}</td>
                <td className="py-0.5 px-1 border border-slate-300 font-mono text-rose-800">{formatCurrency(sumInsurance)}</td>
                <td className="py-0.5 px-1 border border-slate-300 font-mono text-rose-800">{formatCurrency(sumGeneral)}</td>
                <td className="py-0.5 px-1 border border-slate-300 font-mono text-rose-800">{formatCurrency(sumLoan)}</td>
                <td className="py-0.5 px-1 border border-slate-300 font-mono text-rose-700">{sumAbsenceDays}</td>
                <td className="py-0.5 px-1 border border-slate-300 font-mono text-rose-800">{formatCurrency(sumAbsence)}</td>
                <td className="py-0.5 px-1 border border-slate-300 font-mono text-rose-800 bg-rose-100">{formatCurrency(sumTotalDed)}</td>
                <td className="py-0.5 px-1 border border-slate-300 font-mono text-indigo-900 bg-indigo-100" colSpan={1}>{formatCurrency(sumNet)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
