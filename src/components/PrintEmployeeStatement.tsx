import React from 'react';
import { CalculatedEmployee } from '../types';
import { formatCurrency, formatNumber, tafqeetArabic, tafqeetEnglish, formatDateGB } from '../utils';
import { useCompanySettings } from '../utils/companySettings';

interface Props {
  employee: CalculatedEmployee | null;
}

export default function PrintEmployeeStatement({ employee }: Props) {
  const { companyNameAr, companyNameEn } = useCompanySettings();
  if (!employee) return null;

  return (
    <div id="printable-area" className="hidden print:block absolute top-0 left-0 w-full bg-white p-8" dir="rtl">
      <div className="text-center mb-8 border-b-2 border-slate-800 pb-4">
        <h1 className="text-2xl font-bold mb-2">بيان مخصصات الموظف</h1>
        <h2 className="text-xl font-bold">{companyNameAr}</h2>
        <h3 className="text-sm text-slate-700 mt-0.5">{companyNameEn}</h3>

        <p className="text-slate-600 mt-2">تاريخ الطباعة: {formatDateGB(new Date())}</p>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-8">
        <div className="flex border-b border-slate-200 py-2">
          <span className="font-bold w-1/3">رقم الموظف:</span>
          <span>{employee.sequenceNumber}</span>
        </div>
        <div className="flex border-b border-slate-200 py-2">
          <span className="font-bold w-1/3">اسم الموظف:</span>
          <span>{employee.name}</span>
        </div>
        <div className="flex border-b border-slate-200 py-2">
          <span className="font-bold w-1/3">جهة العمل:</span>
          <span>{employee.branch}</span>
        </div>
        <div className="flex border-b border-slate-200 py-2">
          <span className="font-bold w-1/3">تاريخ التعيين:</span>
          <span className="font-mono">{formatDateGB(employee.hireDate)}</span>
        </div>
        <div className="flex border-b border-slate-200 py-2">
          <span className="font-bold w-1/3">تاريخ العودة من الإجازة:</span>
          <span className="font-mono">{formatDateGB(employee.lastVacationReturnDate)}</span>
        </div>
        <div className="flex border-b border-slate-200 py-2">
          <span className="font-bold w-1/3">تاريخ الاحتساب:</span>
          <span className="font-mono">{formatDateGB(employee.calculationDate)}</span>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4 bg-slate-100 p-2 border border-slate-300">تفاصيل الراتب والمدد</h3>
        <table className="w-full text-sm border-collapse border border-slate-300">
          <thead>
            <tr className="bg-slate-50">
              <th className="border border-slate-300 p-2 text-right">الراتب الأساسي</th>
              <th className="border border-slate-300 p-2 text-right">البدلات الثابتة</th>
              <th className="border border-slate-300 p-2 text-right">إجمالي الراتب</th>
              <th className="border border-slate-300 p-2 text-right">مدة العمل الإجمالية (سنوات)</th>
              <th className="border border-slate-300 p-2 text-right">مدة العمل من آخر إجازة</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-slate-300 p-2 font-mono">{formatCurrency(employee.basicSalary)}</td>
              <td className="border border-slate-300 p-2 font-mono">{formatCurrency(employee.fixedAllowances)}</td>
              <td className="border border-slate-300 p-2 font-mono font-bold bg-slate-50">{formatCurrency(employee.totalSalary)}</td>
              <td className="border border-slate-300 p-2 font-mono">{formatNumber(employee.totalWorkDurationYears)}</td>
              <td className="border border-slate-300 p-2 font-mono">{formatNumber(employee.durationSinceLastVacationYears)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4 bg-slate-100 p-2 border border-slate-300">تفاصيل المخصصات</h3>
        <table className="w-full text-sm border-collapse border border-slate-300">
          <thead>
            <tr className="bg-slate-50">
              <th className="border border-slate-300 p-2 text-right">سعر التذكرة</th>
              <th className="border border-slate-300 p-2 text-right">مخصص التذاكر</th>
              <th className="border border-slate-300 p-2 text-right">مخصص الإجازة</th>
              <th className="border border-slate-300 p-2 text-right">مخصص نهاية الخدمة (الإجمالي)</th>
              <th className="border border-slate-300 p-2 text-right text-red-700">المدفوع من نهاية الخدمة</th>
              <th className="border border-slate-300 p-2 text-right text-green-700">المستحق من نهاية الخدمة</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-slate-300 p-2 font-mono">{formatCurrency(employee.ticketPrice)}</td>
              <td className="border border-slate-300 p-2 font-mono">{formatCurrency(employee.ticketAllowance)}</td>
              <td className="border border-slate-300 p-2 font-mono">{formatCurrency(employee.vacationAllowance)}</td>
              <td className="border border-slate-300 p-2 font-mono">{formatCurrency(employee.endOfServiceAllowance)}</td>
              <td className="border border-slate-300 p-2 font-mono text-red-700">{formatCurrency(employee.paidEndOfService)}</td>
              <td className="border border-slate-300 p-2 font-mono font-bold text-green-700 bg-green-50">{formatCurrency(employee.dueEndOfService)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mb-8">
        <table className="w-full border-collapse border-2 border-black text-center font-bold text-sm bg-gray-200">
          <tbody>
            <tr>
              <td className="border border-black p-2 w-[18%]">صافي المبلغ المستحق</td>
              <td className="border border-black p-2 w-[14%] font-mono text-lg">{formatCurrency((employee.vacationAllowance || 0) + (employee.ticketAllowance || 0) + (employee.dueEndOfService || 0))}</td>
              <td className="border border-black p-2 border-4 border-green-700 bg-white w-[68%]" style={{ borderStyle: 'double' }}>
                <div className="flex flex-col justify-center gap-0.5 text-center py-0.5 overflow-x-auto overflow-y-hidden">
                  <div dir="rtl" className="text-slate-950 font-bold text-[11px] sm:text-xs print:text-[11px] whitespace-nowrap leading-tight">{tafqeetArabic((employee.vacationAllowance || 0) + (employee.ticketAllowance || 0) + (employee.dueEndOfService || 0))}</div>
                  <div className="border-t border-slate-300 w-4/5 mx-auto my-0.5"></div>
                  <div dir="ltr" className="text-slate-800 font-mono font-semibold text-[10px] sm:text-[11px] print:text-[10px] whitespace-nowrap leading-tight">{tafqeetEnglish((employee.vacationAllowance || 0) + (employee.ticketAllowance || 0) + (employee.dueEndOfService || 0))}</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {employee.notes && (
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-2">ملاحظات</h3>
          <p className="p-4 border border-slate-300 bg-slate-50 rounded">{employee.notes}</p>
        </div>
      )}

      <div className="mt-16 flex justify-between px-16">
        <div className="text-center">
          <p className="font-bold mb-8">إعداد / الموارد البشرية</p>
          <p>_____________________</p>
        </div>
        <div className="text-center">
          <p className="font-bold mb-8">اعتماد / الإدارة المالية</p>
          <p>_____________________</p>
        </div>
      </div>
    </div>
  );
}
