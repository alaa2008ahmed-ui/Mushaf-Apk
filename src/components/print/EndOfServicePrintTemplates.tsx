import React from 'react';
import { CalculatedEmployee } from '../../types';
import { formatNumber, tafqeetArabic, tafqeetEnglish, formatDateGB } from '../../utils';
import PrintableSheet from '../PrintableSheet';
import { PrintTemplateId } from '../../utils/printTemplates';

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
          className="w-full text-center outline-none bg-transparent py-1 print:hidden font-bold text-blue-600 cursor-pointer" 
          value={customCalcDate} 
          onChange={(e) => {
            setCustomCalcDate(e.target.value);
            if (e.target.value) {
              const d = new Date(e.target.value);
              if (!isNaN(d.getDate())) setWorkDaysCount(Math.min(30, d.getDate()));
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
          className="w-16 text-center bg-blue-50/50 outline-none border border-blue-300 rounded print:border-none print:bg-transparent font-bold" 
          value={overtimeHours} 
          onChange={(e) => setOvertimeHours(Number(e.target.value))} 
        />
      )
    ) : '0.00'
  );

  // إعدادات الأنماط البصرية المميزة لكل قالب مع الحفاظ على اكتمال جميع البيانات بنسبة 100%
  const getThemeConfig = () => {
    switch (templateId) {
      case '2': // الكلاسيكي الرسمي
        return {
          wrapper: "border-[3px] border-double border-slate-900 p-2 sm:p-5 bg-white print:border-none",
          headerType: 'classic' as const,
          tableHeadClass: "bg-slate-200 text-slate-900 font-bold",
          subHeadClass: "font-bold text-sm sm:text-base mb-1 text-right text-slate-900 border-b-2 border-slate-800 pb-0.5",
        };
      case '3': // التنفيذي الراقي
        return {
          wrapper: "border border-indigo-300 p-2 sm:p-5 bg-white print:border-none rounded-lg",
          headerType: 'executive' as const,
          tableHeadClass: "bg-indigo-950 text-white font-bold",
          subHeadClass: "font-bold text-sm sm:text-base mb-1 text-right text-indigo-950",
        };
      case '4': // المبسط المدمج
        return {
          wrapper: "border border-gray-300 p-2 sm:p-4 bg-white print:border-none font-sans",
          headerType: 'minimal' as const,
          tableHeadClass: "bg-gray-100 text-gray-900 font-bold",
          subHeadClass: "font-bold text-xs sm:text-sm mb-1 text-right text-gray-800 underline",
        };
      case '5': // المؤسسي الحكومي
        return {
          wrapper: "border-2 border-slate-900 p-2 sm:p-5 bg-white print:border-none",
          headerType: 'institutional' as const,
          tableHeadClass: "bg-slate-300 text-slate-950 font-bold",
          subHeadClass: "font-bold text-sm sm:text-base mb-1 text-right text-slate-900 bg-slate-100 px-2 py-0.5 border-r-4 border-slate-800",
        };
      default: // '1' المعاصر النظيف (القالب الأساسي)
        return {
          wrapper: "border border-slate-200 shadow-sm p-3 sm:p-6 bg-white print:border-none print:shadow-none",
          headerType: 'swc' as const,
          tableHeadClass: "bg-gray-300 text-black font-bold",
          subHeadClass: "font-bold text-sm sm:text-base mb-1 text-right text-black",
        };
    }
  };

  const theme = getThemeConfig();

  return (
    <PrintableSheet>
      <div className={`${theme.wrapper} mx-auto w-full max-w-full flex-grow flex flex-col text-black text-xs sm:text-sm font-sans overflow-x-auto print-single-page h-full`} dir="rtl">
        {/* هيدر القالب حسب الاختيار */}
        {theme.headerType === 'swc' && (
          <div className="flex justify-between items-center border-b-[3px] border-black pb-2 mb-2 print:pb-1 print:mb-1.5">
            <div className="flex flex-col items-center text-[#4a148c]">
              <span className="text-sm print:text-xs font-bold -mb-2">مياه</span>
              <span className="text-5xl print:text-3xl font-black tracking-tighter">عذبة</span>
              <span className="text-lg print:text-xs font-bold -mt-1">adba water</span>
            </div>
            <div className="text-center font-bold">
              <h1 className="text-2xl print:text-base mb-1 print:mb-0">{companyNameAr}</h1>
              <h2 className="text-xl print:text-xs mb-2 print:mb-0.5 uppercase">{companyNameEn}</h2>
              <h3 className="text-2xl print:text-base">مستحقات الاجازه ونهاية الخدمة</h3>
            </div>
            <div className="text-[#e53935] font-black italic tracking-tighter text-7xl print:text-4xl leading-none">
              SWC
            </div>
          </div>
        )}

        {theme.headerType === 'classic' && (
          <div className="text-center border-b-2 border-slate-900 pb-2 mb-2 print:pb-1 print:mb-1.5">
            <h1 className="text-xl print:text-base font-bold mb-0.5">{companyNameAr}</h1>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">{companyNameEn}</h2>
            <div className="inline-block px-4 py-1 border-2 border-slate-900 font-black text-base print:text-sm bg-slate-100">
              بيان تصفية مستحقات ونهاية خدمة موظف رسمي
            </div>
          </div>
        )}

        {theme.headerType === 'executive' && (
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-3 print:p-2 rounded-lg flex justify-between items-center mb-2 print:mb-1.5">
            <div>
              <h1 className="text-lg print:text-base font-black tracking-wide text-indigo-300 mb-0.5">{companyNameAr}</h1>
              <h2 className="text-[10px] font-medium text-slate-300 uppercase tracking-widest">{companyNameEn}</h2>
            </div>
            <div className="text-left">
              <div className="text-[10px] font-bold bg-indigo-400 text-slate-950 px-2 py-0.5 rounded inline-block mb-0.5">FINAL SETTLEMENT</div>
              <h3 className="text-sm print:text-xs font-bold">تصفية مستحقات ونهاية الخدمة</h3>
            </div>
          </div>
        )}

        {theme.headerType === 'minimal' && (
          <div className="flex justify-between items-end border-b border-gray-400 pb-2 mb-2 print:pb-1 print:mb-1.5 font-sans">
            <div>
              <h1 className="text-lg print:text-sm font-bold text-gray-900">{companyNameAr}</h1>
              <h2 className="text-[10px] uppercase text-gray-500">{companyNameEn}</h2>
            </div>
            <div className="text-left">
              <span className="text-xs font-bold uppercase text-gray-700 block">End of Service Statement</span>
              <span className="text-sm font-bold text-black">بيان تصفية المستحقات</span>
            </div>
          </div>
        )}

        {theme.headerType === 'institutional' && (
          <div className="border-2 border-slate-900 p-2 print:p-1.5 mb-2 print:mb-1.5 bg-slate-50 flex justify-between items-center text-center">
            <div className="w-1/4 font-bold text-xs print:text-[10px]">
              <div>المملكة العربية السعودية</div>
              <div>{companyNameAr}</div>
            </div>
            <div className="w-1/2 font-black text-base print:text-sm underline">
              نموذج تصفية مستحقات ونهاية خدمة معتمد
            </div>
            <div className="w-1/4 font-mono text-left text-[10px]" dir="ltr">
              <div>Ref: EOS-{emp.code || 'DOC'}</div>
              <div>Date: {formatDateGB(customCalcDate)}</div>
            </div>
          </div>
        )}

        {/* 1. جدول بيانات الموظف الأساسية */}
        <table className="w-full border-collapse border-2 border-black text-center mb-2 print:mb-1 font-bold text-xs sm:text-sm print:text-[11px]">
          <tbody>
            <tr>
              <td className="border border-black p-1 bg-gray-50 w-[15%]">الاســــــــــم :</td>
              <td className="border border-black p-1 text-blue-600">{emp.name}</td>
              <td className="border border-black p-1 bg-gray-50 w-[15%]">كود الموظف :</td>
              <td className="border border-black p-1 font-mono">{emp.code || emp.sequenceNumber}</td>
            </tr>
            <tr>
              <td className="border border-black p-1 bg-gray-50">الوظيفة :</td>
              <td className="border border-black p-1">{emp.jobTitle || emp.branch}</td>
              <td className="border border-black p-1 bg-gray-50">الراتب :</td>
              <td className="border border-black p-1 font-mono">{formatNumber(emp.basicSalary)}</td>
            </tr>
            <tr>
              <td className="border border-black p-1 bg-gray-50">اخر تاريخ عوده :</td>
              <td className="border border-black p-1 font-mono text-center">{formatDateGB(emp.lastVacationReturnDate)}</td>
              <td className="border border-black p-1 bg-gray-50">اسباب انهاء الخدمة للموظف</td>
              <td className="border border-black p-0 text-center">
                {renderReasonInput()}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1 bg-gray-50">تاريخ التعيين :</td>
              <td className="border border-black p-1 font-mono text-center">{formatDateGB(emp.hireDate)}</td>
              <td className="border border-black p-1 bg-gray-50">اخر يوم عمل :</td>
              <td className="border border-black p-0 font-mono text-center text-blue-600 font-bold">
                {renderDateInput()}
              </td>
            </tr>
          </tbody>
        </table>

        {/* 2. جدول حساب التصفية النهائية والتواريخ */}
        <h4 className={theme.subHeadClass}>حساب التصفية النهائية</h4>
        <table className="w-full border-collapse border-2 border-black text-center mb-2 print:mb-1 font-bold text-xs sm:text-sm print:text-[11px]">
          <thead>
            <tr className={theme.tableHeadClass}>
              <th className="border border-black p-1">مكافأة نهاية الخدمة</th>
              <th className="border border-black p-1 w-[8%]">يوم</th>
              <th className="border border-black p-1 w-[8%]">شهر</th>
              <th className="border border-black p-1 w-[8%]">سنه</th>
              <th className="border border-black p-1 w-1/4">مخصص الاجازة</th>
              <th className="border border-black p-1 w-[8%]">يوم</th>
              <th className="border border-black p-1 w-[8%]">شهر</th>
              <th className="border border-black p-1 w-[8%]">سنه</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-1">تاريخ نهاية الخدمة</td>
              <td className="border border-black p-1 font-mono">{calcDateParts.day}</td>
              <td className="border border-black p-1 font-mono">{calcDateParts.month}</td>
              <td className="border border-black p-1 font-mono">{calcDateParts.year}</td>
              <td className="border border-black p-1">تاريخ انهاء الخدمة</td>
              <td className="border border-black p-1 font-mono">{calcDateParts.day}</td>
              <td className="border border-black p-1 font-mono">{calcDateParts.month}</td>
              <td className="border border-black p-1 font-mono">{calcDateParts.year}</td>
            </tr>
            <tr>
              <td className="border border-black p-1">تاريخ التعيين</td>
              <td className="border border-black p-1 font-mono">{hireDateParts.day}</td>
              <td className="border border-black p-1 font-mono">{hireDateParts.month}</td>
              <td className="border border-black p-1 font-mono">{hireDateParts.year}</td>
              <td className="border border-black p-1">تاريخ اخر اجازة</td>
              <td className="border border-black p-1 font-mono">{vacDateParts.day}</td>
              <td className="border border-black p-1 font-mono">{vacDateParts.month}</td>
              <td className="border border-black p-1 font-mono">{vacDateParts.year}</td>
            </tr>
            <tr>
              <td className="border border-black p-1">صافى مدة العمل</td>
              <td className="border border-black p-1 font-mono">{workDiff.days}</td>
              <td className="border border-black p-1 font-mono">{workDiff.months}</td>
              <td className="border border-black p-1 font-mono">{workDiff.years}</td>
              <td className="border border-black p-1">المدة المستحقة للاجازة</td>
              <td className="border border-black p-1 font-mono">{vacDiff.days}</td>
              <td className="border border-black p-1 font-mono">{vacDiff.months}</td>
              <td className="border border-black p-1 font-mono">{vacDiff.years}</td>
            </tr>
          </tbody>
        </table>

        {/* 3. جدول احتساب التصفية والبدلات الشهرية */}
        <h4 className={theme.subHeadClass}>احتساب التصفية النهائية</h4>
        <table className="w-full border-collapse border-2 border-black text-center mb-2 print:mb-1 font-bold text-xs sm:text-sm print:text-[11px]">
          <thead>
            <tr className={theme.tableHeadClass}>
              <th className="border border-black p-1" colSpan={2}>الاستحقاقات</th>
              <th className="border border-black p-1 w-[15%]">المبلغ</th>
              <th className="border border-black p-1 w-1/4">تفاصيل الراتب الشهرى</th>
              <th className="border border-black p-1 w-[15%]">المبلغ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-1">
                راتب ايام العمل
                {isProportionalActive && <span className="text-xs font-normal"> ({workDaysCount} يوم)</span>}
              </td>
              <td className="border border-black p-1 text-left px-2" dir="ltr">Salary Of Working</td>
              <td className="border border-black p-1 font-mono">{formatNumber(workDaysSalary)}</td>
              <td className="border border-black p-1">الراتب الاساسي</td>
              <td className="border border-black p-1 font-mono">{formatNumber(emp.basicSalary)}</td>
            </tr>
            <tr>
              <td className="border border-black p-1">
                بدل العمل الإضافي
                {isProportionalActive && <span className="text-xs font-normal"> ({overtimeHours} ساعة)</span>}
              </td>
              <td className="border border-black p-1 text-left px-2" dir="ltr">Extra Work</td>
              <td className="border border-black p-1 font-mono">{formatNumber(overtimeValue)}</td>
              <td className="border border-black p-1">ساعات العمل الاضافي</td>
              <td className="border border-black p-1 font-mono text-blue-600">
                {renderOvertimeInput()}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1">
                بدل السكن {isProportionalActive && <span className="text-xs font-normal">(كامل)</span>}
              </td>
              <td className="border border-black p-1 text-left px-2" dir="ltr">Housing Allowance</td>
              <td className="border border-black p-1 font-mono">{formatNumber(housingValue)}</td>
              <td className="border border-black p-1">بدل السكن</td>
              <td className="border border-black p-1 font-mono">{formatNumber(emp.housingAllowance || 0)}</td>
            </tr>
            <tr>
              <td className="border border-black p-1">
                بدل نقل
                {isProportionalActive && <span className="text-xs font-normal"> ({workDaysCount} يوم)</span>}
              </td>
              <td className="border border-black p-1 text-left px-2" dir="ltr">Transfer Allowance</td>
              <td className="border border-black p-1 font-mono">{formatNumber(transferValue)}</td>
              <td className="border border-black p-1">بدل نقل</td>
              <td className="border border-black p-1 font-mono">{formatNumber(emp.transferAllowance || 0)}</td>
            </tr>
            <tr>
              <td className="border border-black p-1">
                بدل اتصال
                {isProportionalActive && <span className="text-xs font-normal"> ({workDaysCount} يوم)</span>}
              </td>
              <td className="border border-black p-1 text-left px-2" dir="ltr">Phone Allowance</td>
              <td className="border border-black p-1 font-mono">{formatNumber(phoneValue)}</td>
              <td className="border border-black p-1">بدل اتصال</td>
              <td className="border border-black p-1 font-mono">{formatNumber(emp.phoneAllowance || 0)}</td>
            </tr>
            <tr>
              <td className="border border-black p-1">
                بدل طعام
                {isProportionalActive && <span className="text-xs font-normal"> ({workDaysCount} يوم)</span>}
              </td>
              <td className="border border-black p-1 text-left px-2" dir="ltr">Food allowance</td>
              <td className="border border-black p-1 font-mono">{formatNumber(foodValue)}</td>
              <td className="border border-black p-1">بدل طعام</td>
              <td className="border border-black p-1 font-mono">{formatNumber(emp.foodAllowance || 0)}</td>
            </tr>
            <tr>
              <td className="border border-black p-1">مخصص الاجازة</td>
              <td className="border border-black p-1 text-left px-2" dir="ltr">Holiday Allowance</td>
              <td className="border border-black p-1 font-mono">{formatNumber(emp.vacationAllowance)}</td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
            </tr>
            <tr>
              <td className="border border-black p-1">مكافأة الخدمة</td>
              <td className="border border-black p-1 text-left px-2" dir="ltr">Indemnity</td>
              <td className="border border-black p-1 font-mono">{formatNumber(actualIndemnity)}</td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
            </tr>
            <tr className="bg-gray-200">
              <td className="border border-black p-1 text-left px-2" colSpan={2}>مجموع الاستحقاقات</td>
              <td className="border border-black p-1 font-mono">{formatNumber(totalEntitlements)}</td>
              <td className="border border-black p-1" colSpan={2}></td>
            </tr>
          </tbody>
        </table>

        {/* 4. جدول الحسميات */}
        <table className="w-full border-collapse border-2 border-black text-center mb-2 print:mb-1 font-bold text-xs sm:text-sm print:text-[11px]">
          <thead>
            <tr className={theme.tableHeadClass}>
              <th className="border border-black p-1" colSpan={2}>الحسميات</th>
              <th className="border border-black p-1 w-[15%]">المبلغ</th>
              <th className="border border-black p-1 w-1/4">الحسميات</th>
              <th className="border border-black p-1 w-[15%]">المبلغ</th>
            </tr>
          </thead>
          <tbody>
            {emp.includeSocialSecurity !== false && (
              <tr>
                <td className="border border-black p-1">تامينات اجتماعية (10%)</td>
                <td className="border border-black p-1 text-left px-2" dir="ltr">Social Security</td>
                <td className="border border-black p-1 font-mono text-blue-600">{formatNumber(socialSecurityDeduction)}</td>
                <td className="border border-black p-1"></td>
                <td className="border border-black p-1"></td>
              </tr>
            )}
            <tr>
              <td className="border border-black p-1">سلفيات</td>
              <td className="border border-black p-1 text-left px-2" dir="ltr">Loans</td>
              <td className="border border-black p-1 font-mono text-blue-600">{formatNumber(emp.loans || 0)}</td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
            </tr>
            <tr>
              <td className="border border-black p-1">خصم اجازات</td>
              <td className="border border-black p-1 text-left px-2" dir="ltr">Absence</td>
              <td className="border border-black p-1 font-mono text-blue-600">{formatNumber(absenceDeduction)}</td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
            </tr>
            <tr>
              <td className="border border-black p-1">مسحوبات نهاية خدمه</td>
              <td className="border border-black p-1 text-left px-2" dir="ltr">Withdrawals</td>
              <td className="border border-black p-1 font-mono">{formatNumber(emp.paidEndOfService || 0)}</td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
            </tr>
            <tr className="bg-gray-200">
              <td className="border border-black p-1" colSpan={2}>مجموع الحسميات</td>
              <td className="border border-black p-1 font-mono">{formatNumber(totalDeductions)}</td>
              <td className="border border-black p-1" colSpan={2}></td>
            </tr>
          </tbody>
        </table>

        {/* 5. صافي المبلغ والتفقيط */}
        <table className="w-full border-collapse border-2 border-black text-center mb-3 print:mb-1 font-bold text-xs sm:text-sm bg-gray-200">
          <tbody>
            <tr>
              <td className="border border-black p-1.5 w-[18%]">صافي المبلغ المستحق</td>
              <td className="border border-black p-1.5 w-[14%] font-mono text-base">{formatNumber(netAmount)}</td>
              <td className="border border-black p-1.5 border-4 border-black bg-white w-[68%] print-double-border" style={{ borderStyle: 'double' }}>
                <div className="flex flex-col justify-center gap-0.5 text-center py-0.5 overflow-x-auto overflow-y-hidden">
                  <div dir="rtl" className="text-slate-950 font-bold text-[11px] sm:text-xs print:text-[11px] whitespace-nowrap leading-tight">{tafqeetArabic(netAmount)}</div>
                  <div className="border-t border-slate-300 w-4/5 mx-auto my-0.5"></div>
                  <div dir="ltr" className="text-slate-800 font-mono font-semibold text-[10px] sm:text-[11px] print:text-[10px] whitespace-nowrap leading-tight">{tafqeetEnglish(netAmount)}</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* 6. التوقيعات والاعتمادات */}
        <div className="flex justify-between items-end mt-auto pt-3 print:mt-auto print:pb-0.5 px-4 font-bold text-xs print:text-[11px] gap-2">
          <div className="text-center flex flex-col justify-end flex-1">
             <div className="h-10"></div> {/* Space for physical signature */}
             <div className="border-t border-black w-full max-w-[120px] mx-auto pt-1 mb-0.5">المستلم</div>
          </div>
          <div className="text-center flex flex-col justify-end flex-1">
             <div className="h-10"></div> {/* Space for physical signature */}
             <div className="border-t border-black w-full max-w-[120px] mx-auto pt-1 mb-0.5">مدير الحسابات</div>
          </div>
          <div className="text-center flex flex-col justify-end flex-1">
             <div className="h-10"></div> {/* Space for physical signature */}
             <div className="border-t border-black w-full max-w-[120px] mx-auto pt-1 mb-0.5">نائب المدير العام</div>
          </div>
          <div className="text-center flex flex-col justify-end flex-1">
             <div className="h-10"></div> {/* Space for physical signature */}
             <div className="border-t border-black w-full max-w-[120px] mx-auto pt-1 mb-0.5">العضو المنتدب</div>
          </div>
        </div>
      </div>
    </PrintableSheet>
  );
}
