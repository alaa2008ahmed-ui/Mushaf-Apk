import React from 'react';
import EnglishDateInput from '../EnglishDateInput';
import { CalculatedEmployee } from '../../types';
import { formatNumber, tafqeetArabic, tafqeetEnglish, formatDateGB } from '../../utils';
import PrintableSheet from '../PrintableSheet';
import { PrintTemplateId } from '../../utils/printTemplates';
import { getThemeConfig, PrintHeader } from './PrintThemeConfig';

export interface VacationAllowancePrintProps {
  templateId: PrintTemplateId;
  emp: CalculatedEmployee;
  companyNameAr: string;
  companyNameEn: string;
  archivedData?: any;
  customStartDate: string;
  setCustomStartDate: (v: string) => void;
  customReturnDate: string;
  setCustomReturnDate: (v: string) => void;
  setWorkDaysCount: (v: number) => void;
  workDaysCount: number;
  vacationReason: string;
  setVacationReason: (v: string) => void;
  isProportionalActive: boolean;
  overtimeHours: number;
  setOvertimeHours: (v: number) => void;
  workDaysSalary: number;
  overtimeValue: number;
  housingValue: number;
  transferValue: number;
  otherAllowancesValue: number;
  totalAllowancesGross: number;
  socialSecurityDeduction: number;
  absenceDeduction: number;
  totalDeductions: number;
  netAmount: number;
  VacationReasonCombobox: React.ComponentType<{ value: string; onChange: (v: string) => void; disabled?: boolean }>;
}

export default function VacationAllowancePrintTemplates(props: VacationAllowancePrintProps) {
  const {
    templateId, emp, companyNameAr, companyNameEn, archivedData,
    customStartDate, setCustomStartDate, customReturnDate, setCustomReturnDate,
    setWorkDaysCount, workDaysCount, vacationReason, setVacationReason,
    isProportionalActive, overtimeHours, setOvertimeHours,
    workDaysSalary, overtimeValue, housingValue, transferValue, otherAllowancesValue,
    totalAllowancesGross, socialSecurityDeduction, absenceDeduction, totalDeductions, netAmount,
    VacationReasonCombobox
  } = props;

  const renderStartDateInput = () => (
    archivedData ? (
      <span className="w-full text-center font-mono py-1 block">{formatDateGB(customStartDate)}</span>
    ) : (
      <>
        <input 
          type="date" 
          className="w-full text-center outline-none bg-transparent py-1 print:hidden font-bold text-blue-600 cursor-pointer" 
          value={customStartDate} 
          onChange={(e) => {
            setCustomStartDate(e.target.value);
            if (e.target.value) {
              const d = new Date(e.target.value);
              if (!isNaN(d.getDate())) setWorkDaysCount(Math.min(30, d.getDate()));
            }
          }} 
          onClick={(e) => { try { e.currentTarget.showPicker?.(); } catch {} }} 
        />
        <span className="hidden print:inline-block w-full text-center font-mono py-1">{formatDateGB(customStartDate)}</span>
      </>
    )
  );

  const renderReturnDateInput = () => (
    archivedData ? (
      <span className="w-full text-center font-mono py-1 block">{formatDateGB(customReturnDate)}</span>
    ) : (
      <>
        <input 
          type="date" 
          className="w-full text-center outline-none bg-transparent py-1 print:hidden font-bold text-blue-600 cursor-pointer" 
          value={customReturnDate} 
          onChange={(e) => setCustomReturnDate(e.target.value)} 
          onClick={(e) => { try { e.currentTarget.showPicker?.(); } catch {} }}
        />
        <span className="hidden print:inline-block w-full text-center font-mono py-1">{formatDateGB(customReturnDate)}</span>
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
      <div className={`${theme.wrapper} mx-auto w-full max-w-full flex-grow flex flex-col text-black text-xs sm:text-sm font-sans overflow-x-auto print-single-page h-full`} dir="rtl">
        {/* هامش علوي 1 سم للطباعة */}
        <div className="h-[10mm] w-full shrink-0 print:block"></div>

        <PrintHeader theme={theme} companyNameAr={companyNameAr} companyNameEn={companyNameEn} docTitle="تسوية مستحقات إجازة" docTitleEn="Vacation Allowance Settlement" emp={emp} customCalcDate={emp.calculationDate} />

        {/* 1. جدول بيانات الموظف والإجازة */}
        <table className="w-full border-collapse border-2 border-black text-center mb-1 print:mb-0.5 font-bold text-[10px] sm:text-xs print:text-[10px]">
          <tbody>
            <tr>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 bg-gray-50 w-[22%] whitespace-nowrap">اسم الموظف</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 text-blue-600 w-[28%] whitespace-nowrap overflow-hidden text-ellipsis">{emp.name}</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 bg-gray-50 w-[22%] whitespace-nowrap">الرقم الوظيفي</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 font-mono w-[28%] whitespace-nowrap">{emp.code || emp.sequenceNumber}</td>
            </tr>
            <tr>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 bg-gray-50 w-[22%] whitespace-nowrap">المهنة</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 w-[28%] whitespace-nowrap overflow-hidden text-ellipsis">{emp.jobTitle || emp.branch}</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 bg-gray-50 w-[22%] whitespace-nowrap">تاريخ الطلب</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 font-mono w-[28%] whitespace-nowrap">{formatDateGB(new Date())}</td>
            </tr>
            <tr>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 bg-gray-50 w-[22%] whitespace-nowrap">تاريخ بداية الاجازة</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 font-mono text-center text-blue-600 w-[28%] whitespace-nowrap">
                {renderStartDateInput()}
              </td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 bg-gray-50 w-[22%] whitespace-nowrap">تاريخ العودة من الاجازة</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 font-mono text-center text-blue-600 w-[28%] whitespace-nowrap">
                {renderReturnDateInput()}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 bg-gray-50 w-[22%] whitespace-nowrap">العودة من آخر إجازة</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 font-mono w-[28%] whitespace-nowrap">{formatDateGB(emp.lastVacationReturnDate || emp.hireDate)}</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 bg-gray-50 w-[22%] whitespace-nowrap">آخر يوم عمل</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 font-mono w-[28%] whitespace-nowrap">{formatDateGB((emp as any).lastWorkDate || emp.calculationDate)}</td>
            </tr>
            <tr>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 bg-gray-50 w-[22%] whitespace-nowrap">سبب الاجازة</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 w-[28%] whitespace-nowrap">
                <VacationReasonCombobox value={vacationReason} onChange={setVacationReason} disabled={!!archivedData} />
              </td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 bg-gray-50 w-[22%] whitespace-nowrap">تاريخ التعيين</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 font-mono w-[28%] whitespace-nowrap">{formatDateGB(emp.hireDate)}</td>
            </tr>
            <tr>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 bg-gray-50 w-[22%] whitespace-nowrap">رصيد الاجازات المستحقة</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 w-[28%] whitespace-nowrap">
                <div className="flex justify-around items-center">
                  <span>يوم : <span className="font-mono text-blue-600">{formatNumber(emp.earnedVacationDays || 30)}</span></span>
                  <span>شهر : <span className="font-mono text-blue-600">{formatNumber(emp.durationSinceLastVacationYears * 12)}</span></span>
                </div>
              </td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 bg-gray-50 w-[22%] whitespace-nowrap">ملاحظات</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 w-[28%] whitespace-nowrap"></td>
            </tr>
          </tbody>
        </table>

        {/* 2. جدول إقرار الدخول والاعتماد */}
        <table className="w-full border-collapse border-2 border-black text-center mb-1 print:mb-0.5 font-bold text-[10px] sm:text-xs print:text-[10px]">
          <tbody>
            <tr>
              <td className="border border-black p-0.5 bg-gray-50 w-1/4 whitespace-nowrap">تاريخ دخول المملكه من مقيم</td>
              <td className="border border-black p-0.5 w-1/4 whitespace-nowrap"></td>
              <td className="border border-black p-0.5 bg-gray-50 w-1/4 whitespace-nowrap">اعتماد شئون الموظفين</td>
              <td className="border border-black p-0.5 w-1/4 whitespace-nowrap"></td>
            </tr>
          </tbody>
        </table>

        {/* 3. جدول احتساب مستحقات الإجازة والرواتب الشهرية */}
        <h4 className={`${theme.subHeadClass} mb-0.5 py-0`}>حساب مستحقات الاجازة للموظف</h4>
        <table className="w-full border-collapse border-2 border-black text-center mb-1 print:mb-0.5 font-bold text-[10px] sm:text-xs print:text-[10px]">
          <thead>
            <tr className={`${theme.tableHeadClass} h-6 print:h-5`}>
              <th className="border border-black p-0.5 print:p-0.5" colSpan={2}>الاستحقاقات</th>
              <th className="border border-black p-0.5 print:p-0.5 w-[15%]">المبلغ</th>
              <th className="border border-black p-0.5 print:p-0.5 w-1/4">تفاصيل الراتب الشهرى</th>
              <th className="border border-black p-0.5 print:p-0.5 w-[15%]">المبلغ</th>
            </tr>
          </thead>
          <tbody>
            <tr className="h-6 print:h-5">
              <td className="border border-black p-0.5 print:p-0.5 whitespace-nowrap">
                راتب ايام العمل {isProportionalActive && <span className="text-[9px] font-normal">({workDaysCount} يوم)</span>}
              </td>
              <td className="border border-black p-0.5 print:p-0.5 text-left px-2 whitespace-nowrap" dir="ltr">Salary Of Working</td>
              <td className="border border-black p-0.5 print:p-0.5">{formatNumber(workDaysSalary)}</td>
              <td className="border border-black p-0.5 print:p-0.5 whitespace-nowrap">الراتب الاساسي</td>
              <td className="border border-black p-0.5 print:p-0.5">{formatNumber(emp.basicSalary)}</td>
            </tr>
            <tr className="h-6 print:h-5">
              <td className="border border-black p-0.5 print:p-0.5 whitespace-nowrap">
                بدل العمل الإضافي {isProportionalActive && <span className="text-[9px] font-normal">({overtimeHours} ساعة)</span>}
              </td>
              <td className="border border-black p-0.5 print:p-0.5 text-left px-2 whitespace-nowrap" dir="ltr">Extra Work</td>
              <td className="border border-black p-0.5 print:p-0.5">{formatNumber(overtimeValue)}</td>
              <td className="border border-black p-0.5 print:p-0.5 whitespace-nowrap">ساعات العمل الاضافي</td>
              <td className="border border-black p-0.5 print:p-0.5 font-mono text-blue-600 whitespace-nowrap">
                {renderOvertimeInput()}
              </td>
            </tr>
            <tr className="h-6 print:h-5">
              <td className="border border-black p-0.5 print:p-0.5 whitespace-nowrap">
                بدل السكن {isProportionalActive && <span className="text-[9px] font-normal">({workDaysCount} يوم)</span>}
              </td>
              <td className="border border-black p-0.5 print:p-0.5 text-left px-2 whitespace-nowrap" dir="ltr">Housing Allowance</td>
              <td className="border border-black p-0.5 print:p-0.5">{formatNumber(housingValue)}</td>
              <td className="border border-black p-0.5 print:p-0.5 whitespace-nowrap">بدل السكن</td>
              <td className="border border-black p-0.5 print:p-0.5">{formatNumber(emp.housingAllowance || 0)}</td>
            </tr>
            <tr className="h-6 print:h-5">
              <td className="border border-black p-0.5 print:p-0.5 whitespace-nowrap">
                بدل انتقال {isProportionalActive && <span className="text-[9px] font-normal">({workDaysCount} يوم)</span>}
              </td>
              <td className="border border-black p-0.5 print:p-0.5 text-left px-2 whitespace-nowrap" dir="ltr">Transfer Allowance</td>
              <td className="border border-black p-0.5 print:p-0.5">{formatNumber(transferValue)}</td>
              <td className="border border-black p-0.5 print:p-0.5 whitespace-nowrap">بدل انتقال</td>
              <td className="border border-black p-0.5 print:p-0.5">{formatNumber(emp.transferAllowance || 0)}</td>
            </tr>
            <tr className="h-6 print:h-5">
              <td className="border border-black p-0.5 print:p-0.5 whitespace-nowrap">
                بدلات اخري {isProportionalActive && <span className="text-[9px] font-normal">({workDaysCount} يوم)</span>}
              </td>
              <td className="border border-black p-0.5 print:p-0.5 text-left px-2 whitespace-nowrap" dir="ltr">Other Allowances</td>
              <td className="border border-black p-0.5 print:p-0.5">{formatNumber(otherAllowancesValue)}</td>
              <td className="border border-black p-0.5 print:p-0.5 whitespace-nowrap">بدلات اخرى</td>
              <td className="border border-black p-0.5 print:p-0.5">{formatNumber((emp.fixedAllowances || 0) - (emp.housingAllowance || 0) - (emp.transferAllowance || 0))}</td>
            </tr>
            <tr className="h-6 print:h-5">
              <td className="border border-black p-0.5 print:p-0.5 whitespace-nowrap">بدل الاجازه</td>
              <td className="border border-black p-0.5 print:p-0.5 text-left px-2 whitespace-nowrap" dir="ltr">Vacation Allowance</td>
              <td className="border border-black p-0.5 print:p-0.5">{formatNumber(emp.vacationAllowance)}</td>
              <td className="border border-black p-0.5 print:p-0.5"></td>
              <td className="border border-black p-0.5 print:p-0.5"></td>
            </tr>
            <tr className="bg-gray-200 h-6 print:h-5">
              <td className="border border-black p-0.5 print:p-0.5 text-left px-2 whitespace-nowrap" colSpan={2}>مجموع الاستحقاقات</td>
              <td className="border border-black p-0.5 print:p-0.5 font-mono">{formatNumber(totalAllowancesGross)}</td>
              <td className="border border-black p-0.5 print:p-0.5" colSpan={2}></td>
            </tr>
          </tbody>
        </table>

        {/* 4. جدول الحسميات */}
        <table className="w-full border-collapse border-2 border-black text-center mb-1 print:mb-0.5 font-bold text-[10px] sm:text-xs print:text-[10px]">
          <thead>
            <tr className={`${theme.tableHeadClass} h-6 print:h-5`}>
              <th className="border border-black p-0.5 print:p-0.5 w-1/4">الحسميات</th>
              <th className="border border-black p-0.5 print:p-0.5 w-[15%]">المبلغ</th>
              <th className="border border-black p-0.5 print:p-0.5 w-[60%]">بيان وتفاصيل الخصم</th>
            </tr>
          </thead>
          <tbody>
            {emp.includeSocialSecurity !== false && (
              <tr className="h-6 print:h-5">
                <td className="border border-black p-0.5 print:p-0.5 text-right px-2 whitespace-nowrap">تامينات اجتماعية</td>
                <td className="border border-black p-0.5 print:p-0.5 font-mono text-red-600">{formatNumber(socialSecurityDeduction)}</td>
                <td className="border border-black p-0.5 print:p-0.5"></td>
              </tr>
            )}
            <tr className="h-6 print:h-5">
              <td className="border border-black p-0.5 print:p-0.5 text-right px-2 whitespace-nowrap">سلفيات</td>
              <td className="border border-black p-0.5 print:p-0.5 font-mono text-red-600">{formatNumber(emp.loans || 0)}</td>
              <td className="border border-black p-0.5 print:p-0.5"></td>
            </tr>
            <tr className="h-6 print:h-5">
              <td className="border border-black p-0.5 print:p-0.5 text-right px-2 whitespace-nowrap">خصم إجازة</td>
              <td className="border border-black p-0.5 print:p-0.5 font-mono text-red-600">{formatNumber(absenceDeduction)}</td>
              <td className="border border-black p-0.5 print:p-0.5"></td>
            </tr>
            <tr className="bg-gray-200 h-6 print:h-5">
              <td className="border border-black p-0.5 print:p-0.5 text-right px-2 whitespace-nowrap">مجموع الحسميات</td>
              <td className="border border-black p-0.5 print:p-0.5 font-mono text-red-800">{formatNumber(totalDeductions)}</td>
              <td className="border border-black p-0.5 print:p-0.5"></td>
            </tr>
          </tbody>
        </table>

        {/* 5. صافي المبلغ والتفقيط */}
        <table className="w-full border-collapse border-2 border-black text-center mb-1 print:mb-0.5 font-bold text-[10px] sm:text-xs print:text-[10px] bg-gray-200">
          <tbody>
            <tr>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 w-[18%] whitespace-nowrap">صافي المبلغ المستحق</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 w-[14%] font-mono text-base whitespace-nowrap">{formatNumber(netAmount)}</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 border-4 border-black bg-white w-[68%] print-double-border" style={{ borderStyle: 'double' }}>
                <div className="flex flex-col justify-center gap-0 text-center py-0.5 overflow-x-auto overflow-y-hidden">
                  <div dir="rtl" className="text-slate-950 font-bold text-[11px] sm:text-xs print:text-[11px] whitespace-nowrap leading-tight">{tafqeetArabic(netAmount)}</div>
                  <div className="border-t border-slate-300 w-4/5 mx-auto my-0.5"></div>
                  <div dir="ltr" className="text-slate-800 font-mono font-semibold text-[10px] sm:text-[11px] print:text-[10px] whitespace-nowrap leading-tight">{tafqeetEnglish(netAmount)}</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

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
