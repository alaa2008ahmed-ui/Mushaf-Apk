import React from 'react';
import { CalculatedEmployee } from '../../types';
import { formatNumber, formatDateGB } from '../../utils';
import PrintableSheet from '../PrintableSheet';
import { PrintTemplateId } from '../../utils/printTemplates';

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

  const [loanType, setLoanType] = React.useState<'service' | 'trust' | 'other'>('service');

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
      <span className="w-1/2 text-center text-blue-600 font-mono font-bold block">{loanAmount}</span>
    ) : (
      <input type="number" className="w-1/2 text-center text-blue-600 font-mono outline-none bg-transparent font-bold" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} />
    )
  );

  const renderRepaymentsCount = () => (
    archivedData ? (
      <span className="w-1/2 text-center text-blue-600 font-mono font-bold block">{repaymentsCount}</span>
    ) : (
      <input type="number" className="w-1/2 text-center text-blue-600 font-mono outline-none bg-transparent font-bold" value={repaymentsCount} onChange={(e) => setRepaymentsCount(e.target.value)} />
    )
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
          wrapper: "border border-amber-300 p-2 sm:p-5 bg-white print:border-none rounded-lg",
          headerType: 'executive' as const,
          tableHeadClass: "bg-amber-950 text-white font-bold",
          subHeadClass: "font-bold text-sm sm:text-base mb-1 text-right text-amber-950",
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
  const amt = Number(loanAmount) || 0;
  const count = Number(repaymentsCount) || 1;
  const monthlyRepayment = count > 0 ? (amt / count) : 0;

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
              <h3 className="text-2xl print:text-base">طلب سلفه</h3>
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
              نموذج طلب سلفة وتسهيلات مالية
            </div>
          </div>
        )}

        {theme.headerType === 'executive' && (
          <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white p-3 print:p-2 rounded-lg flex justify-between items-center mb-2 print:mb-1.5">
            <div>
              <h1 className="text-lg print:text-base font-black tracking-wide text-amber-300 mb-0.5">{companyNameAr}</h1>
              <h2 className="text-[10px] font-medium text-slate-300 uppercase tracking-widest">{companyNameEn}</h2>
            </div>
            <div className="text-left">
              <div className="text-[10px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded inline-block mb-0.5">LOAN REQUEST</div>
              <h3 className="text-sm print:text-xs font-bold">طلب سلفة مالية موظف</h3>
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
              <span className="text-xs font-bold uppercase text-gray-700 block">Loan Application</span>
              <span className="text-sm font-bold text-black">طلب سلفة وتسهيلات</span>
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
              نموذج طلب سلفة مالية معتمد
            </div>
            <div className="w-1/4 font-mono text-left text-[10px]" dir="ltr">
              <div>Ref: LOAN-{emp.code || 'DOC'}</div>
              <div>Date: {formatDateGB(requestDate)}</div>
            </div>
          </div>
        )}

        {/* شريط معلومات الطلب والتاريخ */}
        <div className="flex justify-between items-center border border-black p-1.5 mb-2 font-bold text-xs sm:text-sm bg-gray-50">
          <div className="flex items-center gap-2">
            <span>تاريخ الطلب:</span>
            <span className="w-32">{renderRequestDate()}</span>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1 cursor-pointer">
              <input 
                type="checkbox" 
                className="w-3.5 h-3.5" 
                checked={loanType === 'service'} 
                onChange={() => setLoanType('service')} 
              />
              <span>سلفه من الخدمه</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input 
                type="checkbox" 
                className="w-3.5 h-3.5" 
                checked={loanType === 'trust'} 
                onChange={() => setLoanType('trust')} 
              />
              <span>عهده</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input 
                type="checkbox" 
                className="w-3.5 h-3.5" 
                checked={loanType === 'other'} 
                onChange={() => setLoanType('other')} 
              />
              <span>اخري</span>
            </label>
          </div>
        </div>

        {/* 1. جدول بيانات الموظف والراتب */}
        <table className="w-full border-collapse border-2 border-black text-center mb-2 font-bold text-xs sm:text-sm print:text-[11px]">
          <tbody>
            <tr>
              <td className="border border-black p-1 bg-gray-50 w-[15%]">اسم الموظف</td>
              <td className="border border-black p-1 text-blue-600">{emp.name}</td>
              <td className="border border-black p-1 bg-gray-50 w-[15%]">الرقم الوظيفي</td>
              <td className="border border-black p-1 font-mono">{emp.code || emp.sequenceNumber}</td>
            </tr>
            <tr>
              <td className="border border-black p-1 bg-gray-50">الراتب الاساسي</td>
              <td className="border border-black p-1 font-mono">{formatNumber(emp.basicSalary)}</td>
              <td className="border border-black p-1 bg-gray-50">الوظيفة</td>
              <td className="border border-black p-1">{emp.jobTitle || emp.branch}</td>
            </tr>
            <tr>
              <td className="border border-black p-1 bg-gray-50">تاريخ المباشرة</td>
              <td className="border border-black p-1 font-mono">{formatDateGB(emp.hireDate)}</td>
              <td className="border border-black p-1 bg-gray-50">مخصص نهاية الخدمة حتى اليوم</td>
              <td className="border border-black p-1 font-mono text-emerald-700 font-bold">{formatNumber((emp as any).indemnityAmount || emp.dueEndOfService || emp.endOfServiceAllowance || 0)}</td>
            </tr>
            <tr>
              <td className="border border-black p-1 bg-gray-50">اجمالي السلف السابقة</td>
              <td className="border border-black p-1 font-mono text-red-600">{formatNumber(emp.loans || 0)}</td>
              <td className="border border-black p-1 bg-gray-50">الرصيد المتاح للسلفة</td>
              <td className="border border-black p-1 font-mono text-blue-600 font-bold">{formatNumber(Math.max(0, ((emp as any).indemnityAmount || emp.dueEndOfService || emp.endOfServiceAllowance || 0) - (emp.loans || 0)))}</td>
            </tr>
          </tbody>
        </table>

        {/* 2. جدول تفاصيل القسط والمبلغ المطلوب */}
        <h4 className={`${theme.subHeadClass} mt-4 mb-2`}>تفاصيل طلب السلفة والأقساط</h4>
        <table className="w-full border-collapse border-2 border-black text-center mb-4 font-bold text-xs sm:text-sm print:text-[11px]">
          <thead>
            <tr className={theme.tableHeadClass}>
              <th className="border border-black p-2">المبلغ المطلوب سلفة</th>
              <th className="border border-black p-2">مبلغ القسط الشهري</th>
              <th className="border border-black p-2">عدد الأقساط الشهرية</th>
              <th className="border border-black p-2">تاريخ بدء الخصم</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-2 flex justify-center items-center gap-1 min-h-[36px]">
                {renderLoanAmount()}
              </td>
              <td className="border border-black p-2 font-mono text-blue-600">{formatNumber(monthlyRepayment)}</td>
              <td className="border border-black p-2 flex justify-center items-center gap-1">
                {renderRepaymentsCount()}
              </td>
              <td className="border border-black p-2 font-mono">{renderDeductionStartDate()}</td>
            </tr>
          </tbody>
        </table>

        {/* 3. جدول الخصم الشهري (جدول الأقساط المجدولة) */}
        <table className="w-full border-collapse border-2 border-black text-center mb-4 font-bold text-xs sm:text-sm print:text-[11px]">
          <thead>
            <tr className={theme.tableHeadClass}>
              <th className="border border-black p-2">تاريخ السداد</th>
              {Array.from({ length: count }).map((_, i) => (
                <th key={i} className="border border-black p-2 font-mono">
                  {getInstallmentDateFormatted(deductionStartDate, i)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-2 bg-gray-50">قيمة القسط</td>
              {Array.from({ length: count }).map((_, i) => (
                <td key={i} className="border border-black p-2 font-mono text-slate-800">
                  {formatNumber(monthlyRepayment)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>

        {/* 4. إقرار وتعهد الموظف */}
        <div className="border border-black p-4 mb-4 bg-gray-50 text-xs sm:text-sm font-semibold leading-relaxed rounded-md">
          <p className="mb-3 leading-loose">
            أتعهد أنا الموضح اسمي وبياناتي أعلاه بأنني استلمت المبلغ المذكور، وأوافق موافقة غير مشروطة على خصم قيمة الأقساط الشهرية الموضحة أعلاه من راتبي الشهري أو مستحقاتي لدى الشركة في حال انتهاء خدماتي لأي سبب من الأسباب قبل سداد كامل المبلغ.
          </p>
          <div className="flex justify-between items-center pt-2 border-t border-dashed border-slate-300 font-bold">
            <span>توقيع الموظف المقر: ................................................................</span>
            <span>التاريخ: {formatDateGB(requestDate)}</span>
          </div>
        </div>

        {/* 5. التوقيعات والاعتمادات */}
        <div className="flex justify-between items-end mt-auto pt-3 print:mt-auto print:pb-0.5 px-4 font-bold text-xs print:text-[11px] gap-2 border-t-2 border-black">
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
