import React from 'react';
import { CalculatedEmployee } from '../types';
import { formatCurrency, formatNumber, formatDateGB } from '../utils';
import { useCompanySettings } from '../utils/companySettings';

interface Props {
  employees: CalculatedEmployee[];
  branchName: string;
  calcDate?: string;
}

export default function PrintTable({ employees, branchName, calcDate }: Props) {
  const { companyNameAr, companyNameEn } = useCompanySettings();
  const activeEmps = employees.filter(emp => emp.isActive !== false);
  const displayCalcDate = calcDate 
    ? formatDateGB(calcDate) 
    : (activeEmps[0]?.calculationDate ? formatDateGB(activeEmps[0].calculationDate) : formatDateGB(new Date()));

  return (
    <div id="pdf-table-container" className="hidden print:block w-full bg-white text-black print-landscape p-0" dir="rtl">
      
      {/* Title only visible in Print or above table */}
      <div className="text-center mb-2 hidden print:block">
        <h2 className="text-sm sm:text-base print:text-[13.5pt] font-extrabold inline-block text-black m-0" style={{ lineHeight: '1.4' }}>
          <div className="mb-1">{branchName === 'الكل' || !branchName ? 'مخصصات نهاية الخدمة' : `مخصصات نهاية الخدمة - ${branchName}`}</div>
          <div className="mb-1">{companyNameAr} - {companyNameEn}</div>
          <div className="text-[11px] print:text-xs font-bold text-slate-800">تاريخ الاحتساب: {displayCalcDate}</div>
        </h2>
      </div>

      <table className="w-full text-right border-collapse text-[8px] print-table">
        <thead>
          <tr className="border-2 border-black text-[8px]" style={{ backgroundColor: '#f1f5f9' }}>
            <th className="p-1 border border-black align-middle font-bold text-center w-[3%]">م</th>
            <th className="p-1 border border-black align-middle font-bold text-right whitespace-nowrap">اسم الموظف</th>
            <th className="p-1 border border-black align-middle font-bold text-center">تاريخ التعيين</th>
            <th className="p-1 border border-black align-middle font-bold text-center">العودة من اجازة</th>
            <th className="p-1 border border-black align-middle font-bold text-center">تاريخ الاحتساب</th>
            <th className="p-1 border border-black align-middle font-bold text-center">مدة العمل</th>
            <th className="p-1 border border-black align-middle font-bold text-center">مدة من اجازة</th>
            <th className="p-1 border border-black align-middle font-bold text-center">الراتب الأساسي</th>
            <th className="p-1 border border-black align-middle font-bold text-center">البدلات</th>
            <th className="p-1 border border-black align-middle font-bold text-center" style={{ color: '#1e1b4b' }}>اجمالي الراتب</th>
            <th className="p-1 border border-black align-middle font-bold text-center">سعر التذكرة</th>
            <th className="p-1 border border-black align-middle font-bold text-center" style={{ color: '#451a03' }}>مخصص التذاكر</th>
            <th className="p-1 border border-black align-middle font-bold text-center" style={{ color: '#1e1b4b' }}>مخصص الاجازة</th>
            <th className="p-1 border border-black align-middle font-bold text-center" style={{ color: '#4c0519' }}>نهاية الخدمة</th>
            <th className="p-1 border border-black align-middle font-bold text-center">المدفوع</th>
            <th className="p-1 border border-black align-middle font-bold text-center" style={{ color: '#022c22' }}>المستحق</th>
          </tr>
        </thead>
        <tbody>
          {activeEmps.map((emp, index) => {
            const isEvenRow = index % 2 === 0;
            const rowBg = isEvenRow ? '#ffffff' : '#f1f5f9';
            return (
              <tr 
                key={emp.id} 
                className="employee-row border-b border-black text-[8px]"
                style={{ backgroundColor: rowBg }}
              >
                <td className="p-1 border border-black align-middle text-center font-bold">{index + 1}</td>
                <td className="p-1 border border-black align-middle font-bold whitespace-nowrap text-right">{emp.name}</td>
                <td className="p-1 border border-black align-middle whitespace-nowrap text-center font-mono">{formatDateGB(emp.hireDate)}</td>
                <td className="p-1 border border-black align-middle whitespace-nowrap text-center font-mono">{formatDateGB(emp.lastVacationReturnDate)}</td>
                <td className="p-1 border border-black align-middle whitespace-nowrap text-center font-mono">{formatDateGB(emp.calculationDate)}</td>
                <td className="p-1 border border-black align-middle text-center font-mono">{formatNumber(emp.totalWorkDurationYears)}</td>
                <td className="p-1 border border-black align-middle text-center font-mono">{formatNumber(emp.durationSinceLastVacationYears)}</td>
                <td className="p-1 border border-black align-middle font-mono text-center">{formatNumber(emp.basicSalary)}</td>
                <td className="p-1 border border-black align-middle font-mono text-center">{formatNumber(emp.fixedAllowances)}</td>
                <td className="p-1 border border-black align-middle font-mono font-bold text-center">{formatNumber(emp.totalSalary)}</td>
                <td className="p-1 border border-black align-middle font-mono text-center">{formatNumber(emp.ticketPrice)}</td>
                <td className="p-1 border border-black align-middle font-mono text-center">{formatNumber(emp.ticketAllowance)}</td>
                <td className="p-1 border border-black align-middle font-mono text-center">{formatNumber(emp.vacationAllowance)}</td>
                <td className="p-1 border border-black align-middle font-mono text-center">{formatNumber(emp.endOfServiceAllowance)}</td>
                <td className="p-1 border border-black align-middle font-mono text-center">{formatNumber(emp.paidEndOfService)}</td>
                <td className="p-1 border border-black align-middle font-mono font-bold text-center">{formatNumber(emp.dueEndOfService)}</td>
              </tr>
            );
          })}
        </tbody>
        {activeEmps.length > 0 && (
          <tfoot className="font-bold text-[8.5px]">
            <tr className="border-2 border-black" style={{ backgroundColor: '#e2e8f0' }}>
              <td colSpan={7} className="p-1 border border-black align-middle align-middle text-left font-bold">الإجمالي ({activeEmps.length} موظف):</td>
              <td className="p-1 border border-black align-middle font-mono text-center">{formatNumber(activeEmps.reduce((sum, e) => sum + (e.basicSalary || 0), 0))}</td>
              <td className="p-1 border border-black align-middle font-mono text-center">{formatNumber(activeEmps.reduce((sum, e) => sum + (e.fixedAllowances || 0), 0))}</td>
              <td className="p-1 border border-black align-middle font-mono font-bold text-center" style={{ backgroundColor: '#cbd5e1' }}>{formatNumber(activeEmps.reduce((sum, e) => sum + (e.totalSalary || 0), 0))}</td>
              <td className="p-1 border border-black align-middle font-mono text-center">-</td>
              <td className="p-1 border border-black align-middle font-mono text-center">{formatNumber(activeEmps.reduce((sum, e) => sum + (e.ticketAllowance || 0), 0))}</td>
              <td className="p-1 border border-black align-middle font-mono text-center">{formatNumber(activeEmps.reduce((sum, e) => sum + (e.vacationAllowance || 0), 0))}</td>
              <td className="p-1 border border-black align-middle font-mono text-center">{formatNumber(activeEmps.reduce((sum, e) => sum + (e.endOfServiceAllowance || 0), 0))}</td>
              <td className="p-1 border border-black align-middle font-mono text-center">{formatNumber(activeEmps.reduce((sum, e) => sum + (e.paidEndOfService || 0), 0))}</td>
              <td className="p-1 border border-black align-middle font-mono font-bold text-center" style={{ backgroundColor: '#cbd5e1' }}>{formatNumber(activeEmps.reduce((sum, e) => sum + (e.dueEndOfService || 0), 0))}</td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
