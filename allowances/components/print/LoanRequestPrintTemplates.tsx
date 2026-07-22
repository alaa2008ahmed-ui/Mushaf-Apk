import React from 'react';
import EnglishDateInput from '../EnglishDateInput';
import { CalculatedEmployee } from '../../types';
import { formatNumber, formatDateGB, calculateEmployeeAllowances } from '../../utils';
import PrintableSheet from '../PrintableSheet';
import { PrintTemplateId } from '../../utils/printTemplates';
import { getThemeConfig, PrintHeader } from './PrintThemeConfig';

export interface LoanRequestPrintProps {
  templateId: PrintTemplateId;
  emp: CalculatedEmployee;
  companyNameAr: string;
  companyNameEn: string;
  archivedData?: any;
  requestDate: string;
  setRequestDate: (v: string) => void;
  deductionStartDate: string;
  setDeductionStartDate: (v: string) => void;
  loanAmount: string;
  setLoanAmount: (v: string) => void;
  repaymentsCount: string;
  setRepaymentsCount: (v: string) => void;
}

export default function LoanRequestPrintTemplates(props: LoanRequestPrintProps) {
  const {
    templateId, emp, companyNameAr, companyNameEn, archivedData,
    requestDate, setRequestDate, deductionStartDate, setDeductionStartDate,
    loanAmount, setLoanAmount, repaymentsCount, setRepaymentsCount
  } = props;

  const [loanType, setLoanType] = React.useState<'service' | 'temporary_trust' | 'permanent_trust' | 'personal'>('service');
  const [previousLoans, setPreviousLoans] = React.useState<string>(String(emp.loans || 0));
  const [adminRemarks, setAdminRemarks] = React.useState<string>('لا مانع');

  const todayStr = React.useMemo(() => new Date().toISOString().split('T')[0], []);
  const empToday = React.useMemo(() => {
    return calculateEmployeeAllowances({
      ...emp,
      calculationDate: todayStr
    });
  }, [emp, todayStr]);

  React.useEffect(() => {
    setPreviousLoans(String(emp.loans || 0));
  }, [emp.id, emp.loans]);

  const empTodayIndemnity = Number(empToday.dueEndOfService || empToday.endOfServiceAllowance || 0);
  const empTodayVacation = Number(empToday.vacationAllowance || 0);
  const availableBalance = empTodayIndemnity + empTodayVacation;

  const renderRequestDate = () => (
    archivedData ? (
      <span className="font-mono font-bold text-green-700 block">{formatDateGB(requestDate)}</span>
    ) : (
      <>
        <span className="hidden print:inline font-mono font-bold text-green-700">{formatDateGB(requestDate)}</span>
        <input 
          type="date" 
          lang="en-GB"
          className="print:hidden w-full text-center outline-none bg-transparent font-bold text-green-700 cursor-pointer" 
          value={requestDate} 
          onChange={(e) => { if (!archivedData) setRequestDate(e.target.value); }} 
        />
      </>
    )
  );

  const renderDeductionStartDate = () => (
    archivedData ? (
      <span className="font-mono font-bold text-green-700 block">{formatDateGB(deductionStartDate)}</span>
    ) : (
      <>
        <span className="hidden print:inline font-mono font-bold text-green-700">{formatDateGB(deductionStartDate)}</span>
        <input 
          type="date" 
          lang="en-GB"
          className="print:hidden w-full text-center outline-none bg-transparent font-bold text-green-700 cursor-pointer" 
          value={deductionStartDate} 
          onChange={(e) => { if (!archivedData) setDeductionStartDate(e.target.value); }} 
        />
      </>
    )
  );

  const getInstallmentDateFormatted = (baseDateStr: string, index: number): string => {
    if (!baseDateStr) return '-';
    const date = new Date(baseDateStr);
    if (isNaN(date.getTime())) return '-';
    
    const baseDay = date.getDate();
    const baseMonth = date.getMonth(); // 0-11
    const baseYear = date.getFullYear();
    
    // Calculate target year and month
    let targetMonth = baseMonth + index;
    let targetYear = baseYear;
    if (targetMonth > 11) {
      targetYear += Math.floor(targetMonth / 12);
      targetMonth = targetMonth % 12;
    }
    
    // Find max days in the target year/month
    const maxDays = new Date(targetYear, targetMonth + 1, 0).getDate();
    const targetDay = Math.min(baseDay, maxDays);
    
    const targetDate = new Date(targetYear, targetMonth, targetDay);
    return formatDateGB(targetDate);
  };

  const renderLoanAmount = () => (
    archivedData ? (
      <span className="w-full text-center text-blue-600 font-mono font-bold block">{loanAmount}</span>
    ) : (
      <input type="number" className="w-full text-center text-blue-600 font-mono outline-none bg-transparent font-bold" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} />
    )
  );

  const renderRepaymentsCount = () => (
    archivedData ? (
      <span className="w-full text-center text-blue-600 font-mono font-bold block">{repaymentsCount}</span>
    ) : (
      <input type="number" className="w-full text-center text-blue-600 font-mono outline-none bg-transparent font-bold" value={repaymentsCount} onChange={(e) => setRepaymentsCount(e.target.value)} />
    )
  );

  const theme = getThemeConfig(templateId);
  const amt = Number(loanAmount) || 0;
  const count = Number(repaymentsCount) || 1;
  const monthlyRepayment = count > 0 ? (amt / count) : 0;

  const chunkArray = (size: number, total: number) => {
    const chunks: number[][] = [];
    for (let i = 0; i < total; i += size) {
      const chunk: number[] = [];
      for (let j = i; j < Math.min(i + size, total); j++) {
        chunk.push(j);
      }
      chunks.push(chunk);
    }
    return chunks;
  };

  const installmentChunks = chunkArray(7, count);

  return (
    <PrintableSheet>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 0.1cm !important;
          }
          body {
            padding: 0 !important;
            margin: 0 !important;
            background-color: white !important;
          }
          .print-loan-custom.print-single-page {
            width: 120% !important;
            max-width: 120% !important;
            padding: 0 !important;
            margin: 0 !important;
            margin-left: -10% !important;
            margin-right: -10% !important;
            border: none !important;
            box-shadow: none !important;
          }
          .print-loan-custom.print-single-page table th, 
          .print-loan-custom.print-single-page table td {
            padding: 3px 4px !important;
          }
          .print-loan-custom.print-single-page button span {
            font-size: 13px !important;
          }
        }
      `}} />
      <div className={`${theme.wrapper} mx-auto w-full max-w-full flex-grow flex flex-col text-black text-xs sm:text-sm font-sans overflow-x-auto print-single-page print-loan-custom h-full`} dir="rtl">
        {/* هامش علوي 1 سم للطباعة */}
        <div className="h-[10mm] w-full shrink-0 print:block"></div>

        <PrintHeader theme={theme} companyNameAr={companyNameAr} companyNameEn={companyNameEn} docTitle="طلب سلفة" docTitleEn="Loan Request" emp={emp} customCalcDate={requestDate} />

        {/* نوع السلفة Selection Table */}
        <table className="w-full border-collapse border-2 border-black text-right mb-1 print:mb-0.5 font-bold text-[9px] sm:text-[10px] print:text-[9px] bg-white">
          <tbody>
            <tr className="h-10 print:h-9">
              <td className="border border-black p-0.5 text-center" colSpan={3}>
                <div className="flex justify-between items-center w-full px-4 sm:px-8 print:px-6">
                  {/* سلفه من الخدمه */}
                  <button 
                    type="button"
                    className="flex items-center gap-1.5 cursor-pointer disabled:cursor-default whitespace-nowrap"
                    disabled={!!archivedData}
                    onClick={() => setLoanType('service')}
                  >
                    <span>سلفه من الخدمه</span>
                    <span className="flex items-center justify-center w-3 h-3 border-2 border-black rounded-sm shrink-0">
                      {loanType === 'service' && <span className="w-2 h-2 bg-black rounded-sm"></span>}
                    </span>
                  </button>

                  {/* عهدة مؤقته */}
                  <button 
                    type="button"
                    className="flex items-center gap-1.5 cursor-pointer disabled:cursor-default whitespace-nowrap"
                    disabled={!!archivedData}
                    onClick={() => setLoanType('temporary_trust')}
                  >
                    <span>عهدة مؤقته</span>
                    <span className="flex items-center justify-center w-3 h-3 border-2 border-black rounded-sm shrink-0">
                      {loanType === 'temporary_trust' && <span className="w-2 h-2 bg-black rounded-sm"></span>}
                    </span>
                  </button>

                  {/* عهدة مستديم */}
                  <button 
                    type="button"
                    className="flex items-center gap-1.5 cursor-pointer disabled:cursor-default whitespace-nowrap"
                    disabled={!!archivedData}
                    onClick={() => setLoanType('permanent_trust')}
                  >
                    <span>عهدة مستديم</span>
                    <span className="flex items-center justify-center w-3 h-3 border-2 border-black rounded-sm shrink-0">
                      {loanType === 'permanent_trust' && <span className="w-2 h-2 bg-black rounded-sm"></span>}
                    </span>
                  </button>

                  {/* سلفه شخصيه */}
                  <button 
                    type="button"
                    className="flex items-center gap-1.5 cursor-pointer disabled:cursor-default whitespace-nowrap"
                    disabled={!!archivedData}
                    onClick={() => setLoanType('personal')}
                  >
                    <span>سلفه شخصيه</span>
                    <span className="flex items-center justify-center w-3 h-3 border-2 border-black rounded-sm shrink-0">
                      {loanType === 'personal' && <span className="w-2 h-2 bg-black rounded-sm"></span>}
                    </span>
                  </button>
                </div>
              </td>
              <td className="border border-black p-0.5 text-center font-mono w-[22%] bg-gray-50/50">
                {formatDateGB(todayStr)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* 1. جدول بيانات الموظف والراتب */}
        <table className="w-full border-collapse border-2 border-black text-center mb-1 print:mb-0.5 font-bold text-[10px] sm:text-xs print:text-[10px]">
          <tbody>
            <tr className="h-10 print:h-9">
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 bg-gray-50 w-[22%] whitespace-nowrap">اسم الموظف</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 text-blue-600 w-[28%] whitespace-nowrap overflow-hidden text-ellipsis">{emp.name}</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 bg-gray-50 w-[22%] whitespace-nowrap">الرقم الوظيفي</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 font-mono w-[28%] whitespace-nowrap">{emp.code || emp.sequenceNumber}</td>
            </tr>
            <tr className="h-10 print:h-9">
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 bg-gray-50 w-[22%] whitespace-nowrap">الراتب الاساسي</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 font-mono w-[28%] whitespace-nowrap">{formatNumber(emp.basicSalary)}</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 bg-gray-50 w-[22%] whitespace-nowrap">الوظيفة</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 w-[28%] whitespace-nowrap overflow-hidden text-ellipsis">{emp.jobTitle || emp.branch}</td>
            </tr>
            <tr className="h-10 print:h-9">
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 bg-gray-50 w-[22%] whitespace-nowrap">تاريخ المباشرة</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 font-mono w-[28%] whitespace-nowrap">{formatDateGB(emp.hireDate)}</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 bg-gray-50 w-[22%] whitespace-nowrap">الرصيد المتاح للسلفة</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 font-mono text-blue-600 font-bold w-[28%] whitespace-nowrap">{formatNumber(availableBalance)}</td>
            </tr>
          </tbody>
        </table>

        {/* 2. جدول تفاصيل القسط والمبلغ المطلوب */}
        <h4 className={`${theme.subHeadClass} mt-1 mb-0.5 print:mt-1 print:mb-0.5`}>تفاصيل طلب السلفة والأقساط</h4>
        <table className="w-full border-collapse border-2 border-black text-center mb-1 print:mb-0.5 font-bold text-[10px] sm:text-xs print:text-[10px]">
          <thead>
            <tr className={`${theme.tableHeadClass} h-10 print:h-9`}>
              <th className="border border-black p-0.5 print:p-0.5 whitespace-nowrap">المبلغ المطلوب سلفة</th>
              <th className="border border-black p-0.5 print:p-0.5 whitespace-nowrap">مبلغ القسط الشهري</th>
              <th className="border border-black p-0.5 print:p-0.5 whitespace-nowrap">عدد الأقساط الشهرية</th>
              <th className="border border-black p-0.5 print:p-0.5 whitespace-nowrap">تاريخ بدء الخصم</th>
            </tr>
          </thead>
          <tbody>
            <tr className="h-10 print:h-9">
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 min-h-[30px] print:min-h-0 whitespace-nowrap text-center align-middle">
                {renderLoanAmount()}
              </td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 font-mono text-blue-600 whitespace-nowrap">{formatNumber(monthlyRepayment)}</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 whitespace-nowrap text-center align-middle">
                {renderRepaymentsCount()}
              </td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 font-mono whitespace-nowrap">{renderDeductionStartDate()}</td>
            </tr>
          </tbody>
        </table>

        {/* 3. جدول الخصم الشهري (جدول الأقساط المجدولة) */}
        <div className="flex flex-col gap-1 mb-1 print:mb-0.5">
          {installmentChunks.map((chunk, chunkIdx) => (
            <table key={chunkIdx} className="w-full border-collapse border-2 border-black text-center font-bold text-[10px] sm:text-xs print:text-[10px]">
              <thead>
                <tr className={`${theme.tableHeadClass} h-10 print:h-9`}>
                  <th className="border border-black p-0.5 print:p-0.5 whitespace-nowrap w-[15%]">تاريخ السداد</th>
                  {chunk.map((i) => (
                    <th key={i} className="border border-black p-0.5 print:p-0.5 font-mono whitespace-nowrap w-[12.14%]">
                      {getInstallmentDateFormatted(deductionStartDate, i)}
                    </th>
                  ))}
                  {chunk.length < 7 && Array.from({ length: 7 - chunk.length }).map((_, padIdx) => (
                    <th key={`pad-head-${padIdx}`} className="border border-black p-0.5 print:p-0.5 bg-gray-100 opacity-50 w-[12.14%]"></th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="h-10 print:h-9">
                  <td className="border border-black p-0.5 print:p-0.5 bg-gray-50 whitespace-nowrap w-[15%]">قيمة القسط</td>
                  {chunk.map((i) => (
                    <td key={i} className="border border-black p-0.5 print:p-0.5 font-mono text-slate-800 whitespace-nowrap w-[12.14%]">
                      {formatNumber(monthlyRepayment)}
                    </td>
                  ))}
                  {chunk.length < 7 && Array.from({ length: 7 - chunk.length }).map((_, padIdx) => (
                    <td key={`pad-body-${padIdx}`} className="border border-black p-0.5 print:p-0.5 bg-gray-50 opacity-50 w-[12.14%]"></td>
                  ))}
                </tr>
              </tbody>
            </table>
          ))}
        </div>

        {/* جدول تفاصيل السلفة وتوقيع مقدم الطلب والمدير المباشر */}
        <table className="w-full border-collapse border-2 border-black text-right mb-0.5 font-bold text-[10px] sm:text-xs print:text-[10px] bg-white">
          <tbody>
            <tr className="h-10 print:h-9">
              <td className="border border-black p-0.5 text-right w-[25%] pr-2 bg-gray-50/50">الغرض من السلفة</td>
              <td className="border border-black p-0.5 text-center text-blue-600 font-bold w-[50%]">ظروف شخصية</td>
              <td className="border border-black p-0.5 text-left w-[25%] pl-2">For Expense</td>
            </tr>
            <tr className="h-10 print:h-9">
              <td className="border border-black p-0.5 text-right w-[25%] pr-2 bg-gray-50/50">توقيع مقدم الطلب</td>
              <td className="border border-black p-0.5 w-[50%]"></td>
              <td className="border border-black p-0.5 text-left w-[25%] pl-2">Employee Sign</td>
            </tr>
          </tbody>
        </table>

        {/* المدير المباشر Direct Manager */}
        <table className="w-full border-collapse border-2 border-black text-right mb-0.5 font-bold text-[10px] sm:text-xs print:text-[10px] bg-white">
          <thead>
            <tr className="bg-gray-200 text-center text-[10px] sm:text-xs print:text-[10px] border-b border-black">
              <th colSpan={3} className="border border-black p-0.5 font-bold text-center">
                <div className="flex justify-center items-center gap-4 text-slate-900">
                  <span>المدير المباشر</span>
                  <span>Direct Manager</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="h-10 print:h-9">
              <td className="border border-black p-0.5 text-right w-[25%] pr-2 bg-gray-50/50 text-[9px] print:text-[8px]">
                تقييم المدير المباشر للموظف
              </td>
              <td className="border border-black p-0.5 text-center" colSpan={2}>
                <div className="grid grid-cols-3 w-full justify-items-center items-center">
                  <div className="flex items-center gap-1.5">
                    <span>Excellent ممتاز</span>
                    <span className="inline-block w-3 h-3 border-2 border-black rounded-sm"></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>V. Good جيد جدا</span>
                    <span className="inline-block w-3 h-3 border-2 border-black rounded-sm"></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>Good جيد</span>
                    <span className="inline-block w-3 h-3 border-2 border-black rounded-sm"></span>
                  </div>
                </div>
              </td>
            </tr>
            <tr className="h-10 print:h-9">
              <td className="border border-black p-0.5 text-right w-[25%] pr-2 bg-gray-50/50">
                رأي المدير المباشر
              </td>
              <td className="border border-black p-0.5 text-center" colSpan={2}>
                <div className="grid grid-cols-2 w-full justify-items-center items-center">
                  <div className="flex items-center gap-1.5">
                    <span>Not Approved غير موافق</span>
                    <span className="inline-block w-3 h-3 border-2 border-black rounded-sm"></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>Approved موافق</span>
                    <span className="inline-block w-3 h-3 border-2 border-black rounded-sm"></span>
                  </div>
                </div>
              </td>
            </tr>
            <tr className="h-10 print:h-9">
              <td className="border border-black p-0.5 text-right w-[25%] pr-2 bg-gray-50/50">ملاحظات</td>
              <td className="border border-black p-0.5 w-[50%]"></td>
              <td className="border border-black p-0.5 text-left w-[25%] pl-2">Remarks</td>
            </tr>
            <tr className="h-10 print:h-9">
              <td className="border border-black p-0.5 text-right w-[25%] pr-2 bg-gray-50/50">التوقيع</td>
              <td className="border border-black p-0.5 w-[50%]"></td>
              <td className="border border-black p-0.5 text-left w-[25%] pl-2 font-bold">Signature</td>
            </tr>
          </tbody>
        </table>
 
        {/* خاص بالشئون الاداريه والماليه */}
        <table className="w-full border-collapse border-2 border-black text-right mb-0.5 font-bold text-[10px] sm:text-xs print:text-[10px] bg-white" dir="ltr">
          <thead>
            <tr className="bg-gray-200 text-center text-[10px] sm:text-xs print:text-[10px] border-b border-black">
              <th colSpan={6} className="border border-black p-0.5 font-bold text-center">
                خاص بالشئون الاداريه والماليه
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Row 1 */}
            <tr className="h-10 print:h-9">
              <td className="border border-black p-0.5 text-center font-mono w-[18%]">{formatDateGB(empToday.hireDate)}</td>
              <td className="border border-black p-0.5 text-right bg-gray-50/50 w-[15%] pr-2">تاريخ التعاقد</td>
              <td className="border border-black p-0.5 text-center font-mono w-[18%]">{formatNumber(empToday.fixedAllowances)}</td>
              <td className="border border-black p-0.5 text-right bg-gray-50/50 w-[15%] pr-2">اجمالي البدلات</td>
              <td className="border border-black p-0.5 text-center font-mono w-[18%]">{formatNumber(empToday.basicSalary)}</td>
              <td className="border border-black p-0.5 text-right bg-gray-50/50 w-[16%] pr-2">الراتب الأساسي</td>
            </tr>
            {/* Row 2 */}
            <tr className="h-10 print:h-9">
              <td className="border border-black p-0.5 text-center font-mono w-[18%]">{formatNumber(empToday.dueEndOfService || empToday.endOfServiceAllowance || 0)}</td>
              <td className="border border-black p-0.5 text-right bg-gray-50/50 w-[15%] pr-2">نهاية خدمة</td>
              <td className="border border-black p-0.5 text-center font-mono w-[18%]">{formatNumber(empToday.vacationAllowance)}</td>
              <td className="border border-black p-0.5 text-right bg-gray-50/50 w-[15%] pr-2">أجازات</td>
              <td className="border border-black p-0.5 text-right bg-gray-50/50 w-[34%] pr-2" colSpan={2}>وضع الموظف المالي في الشركه</td>
            </tr>
            {/* Row 3 */}
            <tr className="h-10 print:h-9">
              <td className="border border-black p-0.5 text-left w-[18%] pl-2">Remarks</td>
              <td className="border border-black p-0.5 text-center w-[66%]" colSpan={4}>
                {archivedData ? (
                  <span className="font-bold">{adminRemarks}</span>
                ) : (
                  <input 
                    type="text" 
                    className="w-full text-center outline-none bg-transparent font-bold" 
                    value={adminRemarks} 
                    onChange={(e) => setAdminRemarks(e.target.value)} 
                  />
                )}
              </td>
              <td className="border border-black p-0.5 text-right bg-gray-50/50 w-[16%] pr-2">ملاحظات</td>
            </tr>
            {/* Row 4 */}
            <tr className="h-10 print:h-9">
              <td className="border border-black p-0.5 text-right w-[50%] align-top pt-0.5 pr-2" colSpan={3}>
                الشئون الماليه
              </td>
              <td className="border border-black p-0.5 text-right w-[50%] align-top pt-0.5 pr-2" colSpan={3}>
                الشئون الاداريه
              </td>
            </tr>
          </tbody>
        </table>

        {/* 5. التوقيعات والاعتمادات */}
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
