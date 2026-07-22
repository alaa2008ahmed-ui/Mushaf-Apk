import React from 'react';
import EnglishDateInput from '../EnglishDateInput';
import { CalculatedEmployee } from '../../types';
import { formatNumber, tafqeetArabic, tafqeetEnglish, formatDateGB } from '../../utils';
import PrintableSheet from '../PrintableSheet';
import { PrintTemplateId } from '../../utils/printTemplates';
import { getThemeConfig, PrintHeader } from './PrintThemeConfig';

export interface EndOfServicePrintProps {
  templateId: PrintTemplateId;
  emp: CalculatedEmployee;
  companyNameAr: string;
  companyNameEn: string;
  archivedData?: any;
  endOfServiceReason: string;
  setEndOfServiceReason: (v: string) => void;
  END_OF_SERVICE_REASONS: Record<string, string>;
  customCalcDate: string;
  setCustomCalcDate: (v: string) => void;
  setWorkDaysCount: (v: number) => void;
  workDaysCount: number;
  isProportionalActive: boolean;
  calcDateParts: { day: string; month: string; year: string };
  hireDateParts: { day: string; month: string; year: string };
  vacDateParts: { day: string; month: string; year: string };
  workDiff: { years: number; months: number; days: number };
  vacDiff: { years: number; months: number; days: number };
  workDaysSalary: number;
  overtimeValue: number;
  overtimeHours: number;
  setOvertimeHours: (v: number) => void;
  housingValue: number;
  transferValue: number;
  phoneValue: number;
  foodValue: number;
  actualIndemnity: number;
  totalEntitlements: number;
  socialSecurityDeduction: number;
  absenceDeduction: number;
  totalDeductions: number;
  netAmount: number;
}

export default function EndOfServicePrintTemplates(props: EndOfServicePrintProps) {
  const {
    templateId, emp, companyNameAr, companyNameEn, archivedData,
    endOfServiceReason, setEndOfServiceReason, END_OF_SERVICE_REASONS,
    customCalcDate, setCustomCalcDate, setWorkDaysCount,
    workDaysCount, isProportionalActive, calcDateParts, hireDateParts, vacDateParts,
    workDiff, vacDiff, workDaysSalary, overtimeValue, overtimeHours, setOvertimeHours,
    housingValue, transferValue, phoneValue, foodValue, actualIndemnity,
    totalEntitlements, socialSecurityDeduction, absenceDeduction, totalDeductions, netAmount
  } = props;

  const renderReasonInput = () => (
    archivedData ? (
      <span className="w-full text-center font-bold py-1 block">
        {END_OF_SERVICE_REASONS[endOfServiceReason] || endOfServiceReason}
      </span>
    ) : (
      <>
        <select 
          className="w-full h-full text-center outline-none bg-transparent py-1 print:hidden cursor-pointer"
          value={endOfServiceReason}
          onChange={(e) => setEndOfServiceReason(e.target.value)}
        >
          {Object.entries(END_OF_SERVICE_REASONS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <span className="hidden print:inline-block w-full text-center font-bold py-1">
          {END_OF_SERVICE_REASONS[endOfServiceReason] || endOfServiceReason}
        </span>
      </>
    )
  );

  const renderDateInput = () => (
    archivedData ? (
      <span className="w-full text-center font-mono py-1 block">{formatDateGB(customCalcDate)}</span>
    ) : (
      <>
        <input 
          type="date"
          lang="en-GB"
          className="w-full text-center outline-none bg-transparent py-1 print:hidden font-bold text-blue-600 cursor-pointer font-mono" 
          value={customCalcDate} 
          onChange={(e) => {
            setCustomCalcDate(e.target.value);
            if (e.target.value) {
              const d = new Date(e.target.value);
              if (!isNaN(d.getDate())) setWorkDaysCount(Math.min(30, Math.max(0, d.getDate() - 1)));
            }
          }} 
          onClick={(e) => {
            try {
              e.currentTarget.showPicker?.();
            } catch {}
          }}
        />
        <span className="hidden print:inline-block w-full text-center font-mono py-1">
          {formatDateGB(customCalcDate)}
        </span>
      </>
    )
  );

  const renderOvertimeInput = () => (
    isProportionalActive ? (
      archivedData ? (
        <span className="font-bold">{overtimeHours}</span>
      ) : (
        <input 
          type="number" 
          min="0" 
          step="0.5" 
          className="w-16 text-center bg-blue-50/50 outline-none border border-blue-300 rounded print:border-none print:bg-transparent font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
          value={overtimeHours} 
          onChange={(e) => setOvertimeHours(Number(e.target.value))} 
        />
      )
    ) : '0.00'
  );

  const theme = getThemeConfig(templateId);

  return (
    <PrintableSheet>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin-left: 0.5cm !important;
            margin-right: 0.5cm !important;
            margin-top: 0.5cm !important;
            margin-bottom: 0.5cm !important;
          }
          .print-single-page {
            width: 103% !important;
            max-width: 103% !important;
            padding: 0 !important;
            margin: 0 !important;
            margin-left: -1.5% !important;
            margin-right: -1.5% !important;
            border: none !important;
            box-shadow: none !important;
          }
          table {
            width: 100% !important;
            max-width: 100% !important;
          }
          .print-single-page table th, 
          .print-single-page table td {
            padding: 3px 4px !important;
          }
        }
      `}} />
      <div className={`${theme.wrapper} mx-auto w-full max-w-full flex-grow flex flex-col text-black text-xs sm:text-sm font-sans overflow-x-auto print-single-page h-full`} dir="rtl">
        {/* هامش علوي 1 سم للطباعة */}
        <div className="h-[10mm] w-full shrink-0 print:block"></div>
        
        <PrintHeader theme={theme} companyNameAr={companyNameAr} companyNameEn={companyNameEn} docTitle="تصفية مستحقات ونهاية خدمة" docTitleEn="End of Service Statement" emp={emp} customCalcDate={customCalcDate} />

        {/* 1. جدول بيانات الموظف الأساسية */}
        <table className="w-full border-collapse border-2 border-black text-center mb-1 print:mb-0.5 font-bold text-[10px] sm:text-xs print:text-[10px]">
          <tbody>
            <tr>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 bg-gray-50 w-[22%] whitespace-nowrap">الاســــــــــم</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 text-blue-600 w-[28%] whitespace-nowrap overflow-hidden text-ellipsis">{emp.name}</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 bg-gray-50 w-[22%] whitespace-nowrap">كود الموظف</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 font-mono w-[28%] whitespace-nowrap">{emp.code || emp.sequenceNumber}</td>
            </tr>
            <tr>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 bg-gray-50 w-[22%] whitespace-nowrap">الوظيفة</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 w-[28%] whitespace-nowrap overflow-hidden text-ellipsis">{emp.jobTitle || emp.branch}</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 bg-gray-50 w-[22%] whitespace-nowrap">الراتب</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 font-mono w-[28%] whitespace-nowrap">{formatNumber(emp.basicSalary)}</td>
            </tr>
            <tr>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 bg-gray-50 w-[22%] whitespace-nowrap">العودة من آخر إجازة</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 font-mono text-center w-[28%] whitespace-nowrap">{formatDateGB(emp.lastVacationReturnDate)}</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 bg-gray-50 w-[22%] whitespace-nowrap">اسباب انهاء الخدمة للموظف</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 text-center w-[28%] whitespace-nowrap">
                {renderReasonInput()}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 bg-gray-50 w-[22%] whitespace-nowrap">تاريخ التعيين</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 font-mono text-center w-[28%] whitespace-nowrap">{formatDateGB(emp.hireDate)}</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 bg-gray-50 w-[22%] whitespace-nowrap">اخر يوم عمل</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 font-mono text-center text-blue-600 font-bold w-[28%] whitespace-nowrap">
                {renderDateInput()}
              </td>
            </tr>
          </tbody>
        </table>

        {/* 2. جدول حساب التصفية النهائية والتواريخ */}
        <h4 className={`${theme.subHeadClass} mb-0.5 py-0`}>حساب التصفية النهائية</h4>
        <table className="w-full border-collapse border-2 border-black text-center mb-1 print:mb-0.5 font-bold text-[10px] sm:text-xs print:text-[10px]">
          <thead>
            <tr className={`${theme.tableHeadClass} h-6 print:h-4`}>
              <th className="border border-black p-0.5 print:p-0.5">مكافأة نهاية الخدمة</th>
              <th className="border border-black p-0.5 print:p-0.5 w-[8%] whitespace-nowrap">يوم</th>
              <th className="border border-black p-0.5 print:p-0.5 w-[8%] whitespace-nowrap">شهر</th>
              <th className="border border-black p-0.5 print:p-0.5 w-[8%] whitespace-nowrap">سنه</th>
              <th className="border border-black p-0.5 print:p-0.5 w-1/4">مخصص الاجازة</th>
              <th className="border border-black p-0.5 print:p-0.5 w-[8%] whitespace-nowrap">يوم</th>
              <th className="border border-black p-0.5 print:p-0.5 w-[8%] whitespace-nowrap">شهر</th>
              <th className="border border-black p-0.5 print:p-0.5 w-[8%] whitespace-nowrap">سنه</th>
            </tr>
          </thead>
          <tbody>
            <tr className="h-6 print:h-4">
              <td className="border border-black p-0.5 print:p-0.5 whitespace-nowrap">تاريخ نهاية الخدمة</td>
              <td className="border border-black p-0.5 print:p-0.5 font-mono">{calcDateParts.day}</td>
              <td className="border border-black p-0.5 print:p-0.5 font-mono">{calcDateParts.month}</td>
              <td className="border border-black p-0.5 print:p-0.5 font-mono">{calcDateParts.year}</td>
              <td className="border border-black p-0.5 print:p-0.5 whitespace-nowrap">تاريخ انهاء الخدمة</td>
              <td className="border border-black p-0.5 print:p-0.5 font-mono">{calcDateParts.day}</td>
              <td className="border border-black p-0.5 print:p-0.5 font-mono">{calcDateParts.month}</td>
              <td className="border border-black p-0.5 print:p-0.5 font-mono">{calcDateParts.year}</td>
            </tr>
            <tr className="h-6 print:h-4">
              <td className="border border-black p-0.5 print:p-0.5 whitespace-nowrap">تاريخ التعيين</td>
              <td className="border border-black p-0.5 print:p-0.5 font-mono">{hireDateParts.day}</td>
              <td className="border border-black p-0.5 print:p-0.5 font-mono">{hireDateParts.month}</td>
              <td className="border border-black p-0.5 print:p-0.5 font-mono">{hireDateParts.year}</td>
              <td className="border border-black p-0.5 print:p-0.5 whitespace-nowrap">تاريخ اخر اجازة</td>
              <td className="border border-black p-0.5 print:p-0.5 font-mono">{vacDateParts.day}</td>
              <td className="border border-black p-0.5 print:p-0.5 font-mono">{vacDateParts.month}</td>
              <td className="border border-black p-0.5 print:p-0.5 font-mono">{vacDateParts.year}</td>
            </tr>
            <tr className="h-6 print:h-4">
              <td className="border border-black p-0.5 print:p-0.5 whitespace-nowrap">صافى مدة العمل</td>
              <td className="border border-black p-0.5 print:p-0.5 font-mono">{workDiff.days}</td>
              <td className="border border-black p-0.5 print:p-0.5 font-mono">{workDiff.months}</td>
              <td className="border border-black p-0.5 print:p-0.5 font-mono">{workDiff.years}</td>
              <td className="border border-black p-0.5 print:p-0.5 whitespace-nowrap">المدة المستحقة للاجازة</td>
              <td className="border border-black p-0.5 print:p-0.5 font-mono">{vacDiff.days}</td>
              <td className="border border-black p-0.5 print:p-0.5 font-mono">{vacDiff.months}</td>
              <td className="border border-black p-0.5 print:p-0.5 font-mono">{vacDiff.years}</td>
            </tr>
          </tbody>
        </table>

        {/* 3. جدول احتساب التصفية والبدلات الشهرية */}
        <h4 className={`${theme.subHeadClass} mb-0.5 py-0`}>احتساب التصفية النهائية</h4>
        <table className="w-full border-collapse border-2 border-black text-center mb-1 print:mb-0.5 font-bold text-[10px] sm:text-xs print:text-[10px]">
          <thead>
            <tr className={`${theme.tableHeadClass} h-6 print:h-4`}>
              <th className="border border-black p-0.5 print:p-0.5" colSpan={2}>الاستحقاقات</th>
              <th className="border border-black p-0.5 print:p-0.5 w-[15%]">المبلغ</th>
              <th className="border border-black p-0.5 print:p-0.5 w-1/4">تفاصيل الراتب الشهرى</th>
              <th className="border border-black p-0.5 print:p-0.5 w-[15%]">المبلغ</th>
            </tr>
          </thead>
          <tbody>
            <tr className="h-6 print:h-4">
              <td className="border border-black p-0.5 print:p-0.5 whitespace-nowrap">
                راتب ايام العمل
                {isProportionalActive && <span className="text-[9px] font-normal"> ({workDaysCount} يوم)</span>}
              </td>
              <td className="border border-black p-0.5 print:p-0.5 text-left px-2 whitespace-nowrap" dir="ltr">Salary Of Working</td>
              <td className="border border-black p-0.5 print:p-0.5 font-mono">{formatNumber(workDaysSalary)}</td>
              <td className="border border-black p-0.5 print:p-0.5 whitespace-nowrap">الراتب الاساسي</td>
              <td className="border border-black p-0.5 print:p-0.5 font-mono">{formatNumber(emp.basicSalary)}</td>
            </tr>
            <tr className="h-6 print:h-4">
              <td className="border border-black p-0.5 print:p-0.5 whitespace-nowrap">
                بدل العمل الإضافي
                {isProportionalActive && <span className="text-[9px] font-normal"> ({overtimeHours} ساعة)</span>}
              </td>
              <td className="border border-black p-0.5 print:p-0.5 text-left px-2 whitespace-nowrap" dir="ltr">Extra Work</td>
              <td className="border border-black p-0.5 print:p-0.5 font-mono">{formatNumber(overtimeValue)}</td>
              <td className="border border-black p-0.5 print:p-0.5 whitespace-nowrap">ساعات العمل الاضافي</td>
              <td className="border border-black p-0.5 print:p-0.5 font-mono text-blue-600 whitespace-nowrap">
                {renderOvertimeInput()}
              </td>
            </tr>
            <tr className="h-6 print:h-4">
              <td className="border border-black p-0.5 print:p-0.5 whitespace-nowrap">
                بدل السكن {isProportionalActive && <span className="text-[9px] font-normal">(30 يوم)</span>}
              </td>
              <td className="border border-black p-0.5 print:p-0.5 text-left px-2 whitespace-nowrap" dir="ltr">Housing Allowance</td>
              <td className="border border-black p-0.5 print:p-0.5 font-mono">{formatNumber(housingValue)}</td>
              <td className="border border-black p-0.5 print:p-0.5 whitespace-nowrap">بدل السكن</td>
              <td className="border border-black p-0.5 print:p-0.5 font-mono">{formatNumber(emp.housingAllowance || 0)}</td>
            </tr>
            <tr className="h-6 print:h-4">
              <td className="border border-black p-0.5 print:p-0.5 whitespace-nowrap">
                بدل نقل
                {isProportionalActive && <span className="text-[9px] font-normal"> ({workDaysCount} يوم)</span>}
              </td>
              <td className="border border-black p-0.5 print:p-0.5 text-left px-2 whitespace-nowrap" dir="ltr">Transfer Allowance</td>
              <td className="border border-black p-0.5 print:p-0.5 font-mono">{formatNumber(transferValue)}</td>
              <td className="border border-black p-0.5 print:p-0.5 whitespace-nowrap">بدل نقل</td>
              <td className="border border-black p-0.5 print:p-0.5 font-mono">{formatNumber(emp.transferAllowance || 0)}</td>
            </tr>
            <tr className="h-6 print:h-4">
              <td className="border border-black p-0.5 print:p-0.5 whitespace-nowrap">
                بدل اتصال
                {isProportionalActive && <span className="text-[9px] font-normal"> ({workDaysCount} يوم)</span>}
              </td>
              <td className="border border-black p-0.5 print:p-0.5 text-left px-2 whitespace-nowrap" dir="ltr">Phone Allowance</td>
              <td className="border border-black p-0.5 print:p-0.5 font-mono">{formatNumber(phoneValue)}</td>
              <td className="border border-black p-0.5 print:p-0.5 whitespace-nowrap">بدل اتصال</td>
              <td className="border border-black p-0.5 print:p-0.5 font-mono">{formatNumber(emp.phoneAllowance || 0)}</td>
            </tr>
            <tr className="h-6 print:h-4">
              <td className="border border-black p-0.5 print:p-0.5 whitespace-nowrap">
                بدل طعام
                {isProportionalActive && <span className="text-[9px] font-normal"> ({workDaysCount} يوم)</span>}
              </td>
              <td className="border border-black p-0.5 print:p-0.5 text-left px-2 whitespace-nowrap" dir="ltr">Food allowance</td>
              <td className="border border-black p-0.5 print:p-0.5 font-mono">{formatNumber(foodValue)}</td>
              <td className="border border-black p-0.5 print:p-0.5 whitespace-nowrap">بدل طعام</td>
              <td className="border border-black p-0.5 print:p-0.5 font-mono">{formatNumber(emp.foodAllowance || 0)}</td>
            </tr>
            <tr className="h-6 print:h-4">
              <td className="border border-black p-0.5 print:p-0.5 whitespace-nowrap">مخصص الاجازة</td>
              <td className="border border-black p-0.5 print:p-0.5 text-left px-2 whitespace-nowrap" dir="ltr">Holiday Allowance</td>
              <td className="border border-black p-0.5 print:p-0.5 font-mono">{formatNumber(emp.vacationAllowance)}</td>
              <td className="border border-black p-0.5 print:p-0.5"></td>
              <td className="border border-black p-0.5 print:p-0.5"></td>
            </tr>
            <tr className="h-6 print:h-4">
              <td className="border border-black p-0.5 print:p-0.5 whitespace-nowrap">مكافأة الخدمة</td>
              <td className="border border-black p-0.5 print:p-0.5 text-left px-2 whitespace-nowrap" dir="ltr">Indemnity</td>
              <td className="border border-black p-0.5 print:p-0.5 font-mono">{formatNumber(actualIndemnity)}</td>
              <td className="border border-black p-0.5 print:p-0.5"></td>
              <td className="border border-black p-0.5 print:p-0.5"></td>
            </tr>
            <tr className="bg-gray-200 h-6 print:h-4">
              <td className="border border-black p-0.5 print:p-0.5 text-left px-2 whitespace-nowrap" colSpan={2}>مجموع الاستحقاقات</td>
              <td className="border border-black p-0.5 print:p-0.5 font-mono">{formatNumber(totalEntitlements)}</td>
              <td className="border border-black p-0.5 print:p-0.5" colSpan={2}></td>
            </tr>
          </tbody>
        </table>

        {/* 4. جدول الحسميات */}
        <table className="w-full border-collapse border-2 border-black text-center mb-1 print:mb-0.5 font-bold text-[10px] sm:text-xs print:text-[10px]">
          <thead>
            <tr className={`${theme.tableHeadClass} h-6 print:h-4`}>
              <th className="border border-black p-0.5 print:p-0.5" colSpan={2}>الحسميات</th>
              <th className="border border-black p-0.5 print:p-0.5 w-[15%]">المبلغ</th>
              <th className="border border-black p-0.5 print:p-0.5 w-1/4">الحسميات</th>
              <th className="border border-black p-0.5 print:p-0.5 w-[15%]">المبلغ</th>
            </tr>
          </thead>
          <tbody>
            {emp.includeSocialSecurity !== false && (
              <tr className="h-6 print:h-4">
                <td className="border border-black p-0.5 print:p-0.5 whitespace-nowrap">تامينات اجتماعية (10%)</td>
                <td className="border border-black p-0.5 print:p-0.5 text-left px-2 whitespace-nowrap" dir="ltr">Social Security</td>
                <td className="border border-black p-0.5 print:p-0.5 font-mono text-blue-600">{formatNumber(socialSecurityDeduction)}</td>
                <td className="border border-black p-0.5 print:p-0.5"></td>
                <td className="border border-black p-0.5 print:p-0.5"></td>
              </tr>
            )}
            <tr className="h-6 print:h-4">
              <td className="border border-black p-0.5 print:p-0.5 whitespace-nowrap">سلفيات</td>
              <td className="border border-black p-0.5 print:p-0.5 text-left px-2 whitespace-nowrap" dir="ltr">Loans</td>
              <td className="border border-black p-0.5 print:p-0.5 font-mono text-blue-600">{formatNumber(emp.loans || 0)}</td>
              <td className="border border-black p-0.5 print:p-0.5"></td>
              <td className="border border-black p-0.5 print:p-0.5"></td>
            </tr>
            <tr className="h-6 print:h-4">
              <td className="border border-black p-0.5 print:p-0.5 whitespace-nowrap">خصم اجازات {emp.absence ? `(${emp.absence} أيام)` : ''}</td>
              <td className="border border-black p-0.5 print:p-0.5 text-left px-2 whitespace-nowrap" dir="ltr">Absence</td>
              <td className="border border-black p-0.5 print:p-0.5 font-mono text-blue-600">{formatNumber(absenceDeduction)}</td>
              <td className="border border-black p-0.5 print:p-0.5"></td>
              <td className="border border-black p-0.5 print:p-0.5"></td>
            </tr>
            <tr className="h-6 print:h-4">
              <td className="border border-black p-0.5 print:p-0.5 whitespace-nowrap">مسحوبات نهاية خدمه</td>
              <td className="border border-black p-0.5 print:p-0.5 text-left px-2 whitespace-nowrap" dir="ltr">Withdrawals</td>
              <td className="border border-black p-0.5 print:p-0.5 font-mono">{formatNumber(emp.paidEndOfService || 0)}</td>
              <td className="border border-black p-0.5 print:p-0.5"></td>
              <td className="border border-black p-0.5 print:p-0.5"></td>
            </tr>
            <tr className="bg-gray-200 h-6 print:h-4">
              <td className="border border-black p-0.5 print:p-0.5 text-left px-2 whitespace-nowrap" colSpan={2}>مجموع الحسميات</td>
              <td className="border border-black p-0.5 print:p-0.5 font-mono">{formatNumber(totalDeductions)}</td>
              <td className="border border-black p-0.5 print:p-0.5" colSpan={2}></td>
            </tr>
          </tbody>
        </table>

        {/* 5. صافي المبلغ والتفقيط */}
        <table className="w-full border-collapse border-2 border-black text-center mb-1 print:mb-0.5 font-bold text-[10px] sm:text-xs print:text-[10px] bg-gray-200">
          <tbody>
            <tr>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 w-[12%] whitespace-nowrap">المبلغ المستحق</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 w-[14%] font-mono text-base whitespace-nowrap">{formatNumber(netAmount)}</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 border-4 border-black bg-white w-[74%] print-double-border" style={{ borderStyle: 'double' }}>
                <div className="flex flex-col justify-center gap-0 text-center py-0.5">
                  <div dir="rtl" className="text-slate-950 font-bold text-[11px] sm:text-xs print:text-[11px] leading-tight px-1">{tafqeetArabic(netAmount)}</div>
                  <div className="border-t border-slate-300 w-4/5 mx-auto my-0.5"></div>
                  <div dir="ltr" className="text-slate-800 font-mono font-semibold text-[10px] sm:text-[11px] print:text-[10px] leading-tight px-1">{tafqeetEnglish(netAmount)}</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* إقرار الاستلام */}
        <div className="border-2 border-black rounded-sm p-1.5 mb-0.5 print:mb-0.5 bg-gray-50/50 text-[11px] print:text-[10px] leading-tight">
          <p className="font-bold text-right mb-0.5" dir="rtl">
            أقر باستلام جميع المستحقات المالية والوظيفية كاملة، ولا توجد لي أي حقوق أو مطالبات حالية أو مستقبلية تجاه الشركة.
          </p>
          <p className="font-bold text-left" dir="ltr">
            I acknowledge receiving all financial and employment entitlements in full, with no current or future claims against the Company.
          </p>
        </div>

        {/* 6. التوقيعات والاعتمادات */}
        <div className="flex justify-between items-end mt-0.5 pt-0.5 pb-0.5 print:mt-0.5 print:pb-0.5 px-4 font-bold text-xs print:text-[10px] gap-2">
          <div className="text-center flex flex-col justify-end flex-1">
             <div className="h-6 print:h-4"></div> {/* Space for physical signature */}
             <div className="w-full max-w-[120px] mx-auto pt-0.5 mb-0.5">المستلم</div>
          </div>
          <div className="text-center flex flex-col justify-end flex-1">
             <div className="h-6 print:h-4"></div> {/* Space for physical signature */}
             <div className="w-full max-w-[120px] mx-auto pt-0.5 mb-0.5">مدير الحسابات</div>
          </div>
          <div className="text-center flex flex-col justify-end flex-1">
             <div className="h-6 print:h-4"></div> {/* Space for physical signature */}
             <div className="w-full max-w-[120px] mx-auto pt-0.5 mb-0.5">نائب المدير العام</div>
          </div>
          <div className="text-center flex flex-col justify-end flex-1">
             <div className="h-6 print:h-4"></div> {/* Space for physical signature */}
             <div className="w-full max-w-[120px] mx-auto pt-0.5 mb-0.5">العضو المنتدب</div>
          </div>
        </div>
      </div>
    </PrintableSheet>
  );
}
