import React from 'react';
import { PayrollTotals } from '../types';
import { formatCurrency } from '../utils/calculations';

interface StatsCardsProps {
  totals: PayrollTotals;
  employeeCount: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ totals, employeeCount }) => {
  const totalAllowances = 
    (totals.communicationAllowance || 0) +
    (totals.housingAllowance || 0) +
    (totals.foodAllowance || 0) +
    (totals.transportationAllowance || 0) +
    (totals.commission || 0) +
    (totals.bonus || 0);

  const totalOvertime = totals.overtime || 0;

  return (
    <section className="w-full px-4 sm:px-6 py-4 print:hidden">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
        
        {/* Card 1: Total Employees */}
        <div className="bg-white min-h-[100px] p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center">
          <div className="text-slate-500 text-xs sm:text-sm mb-1.5 font-medium">إجمالي الموظفين</div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {employeeCount} <span className="text-xs font-normal text-slate-400">موظف</span>
          </div>
        </div>

        {/* Card 2: Total Basic Salary */}
        <div className="bg-white min-h-[100px] p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center">
          <div className="text-slate-500 text-xs sm:text-sm mb-1.5 font-medium">الرواتب الأساسية</div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {formatCurrency(totals.basicSalary)}
          </div>
        </div>

        {/* Card 3: Total Allowances */}
        <div className="bg-white min-h-[100px] p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center">
          <div className="text-slate-500 text-xs sm:text-sm mb-1.5 font-medium">إجمالي البدلات</div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {formatCurrency(totalAllowances)}
          </div>
        </div>

        {/* Card 4: Total Overtime */}
        <div className="bg-white min-h-[100px] p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center">
          <div className="text-slate-500 text-xs sm:text-sm mb-1.5 font-medium">إجمالي الإضافي</div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {formatCurrency(totalOvertime)}
          </div>
        </div>

        {/* Card 5: Total Entitlements */}
        <div className="bg-white min-h-[100px] p-4 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center bg-blue-50/10">
          <div className="text-violet-600 text-xs sm:text-sm mb-1.5 font-bold underline decoration-violet-200 underline-offset-4">إجمالي الاستحقاقات</div>
          <div className="text-xl sm:text-2xl font-black text-violet-700 tracking-tight">
            {formatCurrency(totals.totalEntitlements)}
          </div>
        </div>

        {/* Card 6: Total Deductions */}
        <div className="bg-white min-h-[100px] p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center">
          <div className="text-slate-500 text-xs sm:text-sm mb-1.5 font-medium">إجمالي الاستقطاعات</div>
          <div className="text-xl sm:text-2xl font-bold text-rose-600 tracking-tight">
            -{formatCurrency(totals.totalDeductions)}
          </div>
        </div>

        {/* Card 7: Net Payable Payroll */}
        <div className="bg-white min-h-[100px] p-4 rounded-xl border border-blue-300 shadow-lg hover:shadow-xl transition-all flex flex-col items-center justify-center text-center col-span-2 sm:col-span-1 lg:col-span-1 border-t-4 border-t-blue-600">
          <div className="text-blue-600 text-xs sm:text-sm mb-1.5 font-bold">صافي الرواتب المستحقة</div>
          <div className="text-xl sm:text-2xl font-black text-blue-800 tracking-tighter">
            {formatCurrency(totals.netSalary)}
          </div>
        </div>

      </div>
    </section>
  );
};

