import React from 'react';
import { PayrollTotals } from '../types';
import { formatCurrency } from '../utils/calculations';

interface StatsCardsProps {
  totals: PayrollTotals;
  employeeCount: number;
  isEnglish?: boolean;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ totals, employeeCount, isEnglish = false }) => {
  const totalAllowances = 
    (totals.communicationAllowance || 0) +
    (totals.housingAllowance || 0) +
    (totals.foodAllowance || 0) +
    (totals.transportationAllowance || 0) +
    (totals.commission || 0) +
    (totals.bonus || 0);

  const totalOvertime = totals.overtime || 0;

  const labels = {
    totalEmployees: isEnglish ? 'Total Employees' : 'إجمالي الموظفين',
    employee: isEnglish ? 'employee' : 'موظف',
    basicSalaries: isEnglish ? 'Basic Salaries' : 'الرواتب الأساسية',
    totalAllowances: isEnglish ? 'Total Allowances' : 'إجمالي البدلات',
    totalOvertime: isEnglish ? 'Total Overtime' : 'إجمالي الإضافي',
    totalEntitlements: isEnglish ? 'Total Entitlements' : 'إجمالي الاستحقاقات',
    totalDeductions: isEnglish ? 'Total Deductions' : 'إجمالي الاستقطاعات',
    netPayable: isEnglish ? 'Net Payable Salaries' : 'صافي الرواتب المستحقة',
  };

  return (
    <section className="w-full px-4 sm:px-6 py-4 print:hidden">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
        
        {/* Card 1: Total Employees */}
        <div className="bg-white min-h-[70px] py-2.5 px-3 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center">
          <div className="text-slate-500 text-[10px] sm:text-xs mb-0.5 font-medium">{labels.totalEmployees}</div>
          <div className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            {employeeCount} <span className="text-[9px] font-normal text-slate-400">{labels.employee}</span>
          </div>
        </div>

        {/* Card 2: Total Basic Salary */}
        <div className="bg-white min-h-[70px] py-2.5 px-3 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center">
          <div className="text-slate-500 text-[10px] sm:text-xs mb-0.5 font-medium">{labels.basicSalaries}</div>
          <div className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            {formatCurrency(totals.basicSalary)}
          </div>
        </div>

        {/* Card 3: Total Allowances */}
        <div className="bg-white min-h-[70px] py-2.5 px-3 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center">
          <div className="text-slate-500 text-[10px] sm:text-xs mb-0.5 font-medium">{labels.totalAllowances}</div>
          <div className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            {formatCurrency(totalAllowances)}
          </div>
        </div>

        {/* Card 4: Total Overtime */}
        <div className="bg-white min-h-[70px] py-2.5 px-3 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center">
          <div className="text-slate-500 text-[10px] sm:text-xs mb-0.5 font-medium">{labels.totalOvertime}</div>
          <div className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            {formatCurrency(totalOvertime)}
          </div>
        </div>

        {/* Card 5: Total Entitlements */}
        <div className="bg-white min-h-[70px] py-2.5 px-3 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center bg-blue-50/10">
          <div className="text-violet-600 text-[10px] sm:text-xs mb-0.5 font-bold underline decoration-violet-200 underline-offset-4">{labels.totalEntitlements}</div>
          <div className="text-sm sm:text-base font-black text-violet-700 tracking-tight">
            {formatCurrency(totals.totalEntitlements)}
          </div>
        </div>

        {/* Card 6: Total Deductions */}
        <div className="bg-white min-h-[70px] py-2.5 px-3 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center">
          <div className="text-slate-500 text-[10px] sm:text-xs mb-0.5 font-medium">{labels.totalDeductions}</div>
          <div className="text-sm sm:text-base font-bold text-rose-600 tracking-tight">
            -{formatCurrency(totals.totalDeductions)}
          </div>
        </div>

        {/* Card 7: Net Payable Payroll */}
        <div className="bg-white min-h-[70px] py-2.5 px-3 rounded-xl border border-blue-300 shadow-lg hover:shadow-xl transition-all flex flex-col items-center justify-center text-center col-span-2 sm:col-span-1 lg:col-span-1 border-t-4 border-t-blue-600">
          <div className="text-blue-600 text-[10px] sm:text-xs mb-0.5 font-bold">{labels.netPayable}</div>
          <div className="text-sm sm:text-base font-black text-blue-800 tracking-tighter">
            {formatCurrency(totals.netSalary)}
          </div>
        </div>

      </div>
    </section>
  );
};

