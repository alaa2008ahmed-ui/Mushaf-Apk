import React from 'react';
import { CalculatedEmployee } from '../types';
import { formatCurrency, formatNumber, tafqeetArabic, tafqeetEnglish, formatDateGB } from '../utils';
import { useCompanySettings } from '../utils/companySettings';
import PrintableSheet from './PrintableSheet';
import { getThemeConfig, PrintHeader } from './print/PrintThemeConfig';
import { usePrintTemplates } from '../utils/printTemplates';

interface Props {
  employee: CalculatedEmployee | null;
}

export default function PrintEmployeeStatement({ employee }: Props) {
  const { companyNameAr, companyNameEn } = useCompanySettings();
  const { templates } = usePrintTemplates();
  const templateId = templates.employeeStatement || '1';
  
  if (!employee) return null;

  const theme = getThemeConfig(templateId);

  return (
    <PrintableSheet>
      <div className={`${theme.wrapper} mx-auto w-full max-w-full flex-grow flex flex-col text-black text-xs sm:text-sm font-sans overflow-x-auto print-single-page h-full`} dir="rtl">
        <PrintHeader theme={theme} companyNameAr={companyNameAr} companyNameEn={companyNameEn} docTitle="بيان بطاقة الموظف" docTitleEn="Employee Statement" emp={employee} customCalcDate={employee.calculationDate} />
        
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-4 mt-2">
          <div className="flex border-b border-slate-200 py-1">
            <span className="font-bold w-1/3">رقم الموظف:</span>
            <span>{employee.sequenceNumber}</span>
          </div>
          <div className="flex border-b border-slate-200 py-1">
            <span className="font-bold w-1/3">اسم الموظف:</span>
            <span>{employee.name}</span>
          </div>
          <div className="flex border-b border-slate-200 py-1">
            <span className="font-bold w-1/3">جهة العمل:</span>
            <span>{employee.branch}</span>
          </div>
          <div className="flex border-b border-slate-200 py-1">
            <span className="font-bold w-1/3">تاريخ التعيين:</span>
            <span className="font-mono">{formatDateGB(employee.hireDate)}</span>
          </div>
          <div className="flex border-b border-slate-200 py-1">
            <span className="font-bold w-1/3">العودة من الإجازة:</span>
            <span className="font-mono">{formatDateGB(employee.lastVacationReturnDate)}</span>
          </div>
          <div className="flex border-b border-slate-200 py-1">
            <span className="font-bold w-1/3">تاريخ الاحتساب:</span>
            <span className="font-mono">{formatDateGB(employee.calculationDate)}</span>
          </div>
        </div>

        <div className="mb-4">
          <h3 className={theme.subHeadClass}>تفاصيل الراتب والمدد</h3>
          <table className="w-full text-sm border-collapse border border-slate-400 text-center">
            <thead>
              <tr className={theme.tableHeadClass}>
                <th className="border border-slate-400 p-1">الراتب الأساسي</th>
                <th className="border border-slate-400 p-1">البدلات الثابتة</th>
                <th className="border border-slate-400 p-1">إجمالي الراتب</th>
                <th className="border border-slate-400 p-1">المدة الكلية (سنوات)</th>
                <th className="border border-slate-400 p-1">المدة من الإجازة</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-400 p-1 font-mono">{formatCurrency(employee.basicSalary)}</td>
                <td className="border border-slate-400 p-1 font-mono">{formatCurrency(employee.fixedAllowances)}</td>
                <td className="border border-slate-400 p-1 font-mono font-bold bg-slate-100">{formatCurrency(employee.totalSalary)}</td>
                <td className="border border-slate-400 p-1 font-mono">{formatNumber(employee.totalWorkDurationYears)}</td>
                <td className="border border-slate-400 p-1 font-mono">{formatNumber(employee.durationSinceLastVacationYears)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mb-4">
          <h3 className={theme.subHeadClass}>تفاصيل المخصصات</h3>
          <table className="w-full text-sm border-collapse border border-slate-400 text-center">
            <thead>
              <tr className={theme.tableHeadClass}>
                <th className="border border-slate-400 p-1">سعر التذكرة</th>
                <th className="border border-slate-400 p-1">مخصص التذاكر</th>
                <th className="border border-slate-400 p-1">مخصص الإجازة</th>
                <th className="border border-slate-400 p-1">مخصص نهاية الخدمة</th>
                <th className="border border-slate-400 p-1 text-red-800">مدفوع نهاية خدمة</th>
                <th className="border border-slate-400 p-1 text-green-800">مستحق نهاية خدمة</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-400 p-1 font-mono">{formatCurrency(employee.ticketPrice)}</td>
                <td className="border border-slate-400 p-1 font-mono">{formatCurrency(employee.ticketAllowance)}</td>
                <td className="border border-slate-400 p-1 font-mono">{formatCurrency(employee.vacationAllowance)}</td>
                <td className="border border-slate-400 p-1 font-mono">{formatCurrency(employee.endOfServiceAllowance)}</td>
                <td className="border border-slate-400 p-1 font-mono text-red-700">{formatCurrency(employee.paidEndOfService)}</td>
                <td className="border border-slate-400 p-1 font-mono font-bold text-green-700 bg-green-50">{formatCurrency(employee.dueEndOfService)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <table className="w-full border-collapse border-2 border-black text-center font-bold text-sm bg-gray-100">
            <tbody>
              <tr>
                <td className="border border-black p-2 w-[20%]">صافي المبلغ المستحق</td>
                <td className="border border-black p-2 w-[15%] font-mono text-base">{formatCurrency((employee.vacationAllowance || 0) + (employee.ticketAllowance || 0) + (employee.dueEndOfService || 0))}</td>
                <td className="border border-black p-1 border-4 border-slate-800 bg-white w-[65%]" style={{ borderStyle: 'double' }}>
                  <div className="flex flex-col justify-center gap-0.5 text-center py-0.5">
                    <div dir="rtl" className="text-slate-900 font-bold text-xs whitespace-nowrap">{tafqeetArabic((employee.vacationAllowance || 0) + (employee.ticketAllowance || 0) + (employee.dueEndOfService || 0))}</div>
                    <div className="border-t border-slate-300 w-4/5 mx-auto my-0.5"></div>
                    <div dir="ltr" className="text-slate-800 font-mono font-semibold text-[10px] whitespace-nowrap">{tafqeetEnglish((employee.vacationAllowance || 0) + (employee.ticketAllowance || 0) + (employee.dueEndOfService || 0))}</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {employee.notes && (
          <div className="mb-4">
            <h3 className={theme.subHeadClass}>ملاحظات</h3>
            <p className="p-2 border border-slate-300 bg-slate-50 text-xs">{employee.notes}</p>
          </div>
        )}

        <div className="mt-auto pt-6 flex justify-between px-10 text-sm">
          <div className="text-center">
            <p className="font-bold mb-6">إعداد / الموارد البشرية</p>
            <p>___________________</p>
          </div>
          <div className="text-center">
            <p className="font-bold mb-6">اعتماد / الإدارة المالية</p>
            <p>___________________</p>
          </div>
        </div>
      </div>
    </PrintableSheet>
  );
}
