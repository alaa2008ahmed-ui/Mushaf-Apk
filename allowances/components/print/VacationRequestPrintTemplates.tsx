import React from 'react';
import EnglishDateInput from '../EnglishDateInput';
import { CalculatedEmployee } from '../../types';
import { formatNumber, formatDateGB } from '../../utils';
import PrintableSheet from '../PrintableSheet';
import { PrintTemplateId } from '../../utils/printTemplates';
import { getThemeConfig, PrintHeader } from './PrintThemeConfig';

export interface VacationRequestPrintProps {
  templateId: PrintTemplateId;
  emp: CalculatedEmployee;
  companyNameAr: string;
  companyNameEn: string;
  archivedData?: any;
  requestDate: string;
  setRequestDate: (v: string) => void;
  customStartDate: string;
  setCustomStartDate: (v: string) => void;
  customReturnDate: string;
  setCustomReturnDate: (v: string) => void;
  requestedLeaveDays: number;
  displayMonths: Array<{
    title: string;
    month: number;
    year: number;
    weeks: Array<Array<number | null>>;
  }>;
  isInLeave: (d: string) => boolean;
}

export default function VacationRequestPrintTemplates(props: VacationRequestPrintProps) {
  const {
    templateId, emp, companyNameAr, companyNameEn, archivedData,
    requestDate, setRequestDate, customStartDate, setCustomStartDate,
    customReturnDate, setCustomReturnDate, requestedLeaveDays,
    displayMonths, isInLeave
  } = props;

  const [vacationType, setVacationType] = React.useState<'annual' | 'unpaid' | 'sick' | 'other' | 'deduct_balance'>('annual');

  const renderRequestDate = () => (
    archivedData ? (
      <span className="w-full text-center font-bold text-blue-600 block">{formatDateGB(requestDate)}</span>
    ) : (
      <input 
        type="date" 
        className="custom-date-picker-full w-full text-center outline-none bg-transparent font-bold text-blue-600 cursor-pointer" 
        value={requestDate} 
        onChange={(e) => setRequestDate(e.target.value)} 
      />
    )
  );

  const renderStartDate = () => (
    archivedData ? (
      <span className="w-full text-center font-mono font-bold text-blue-600 block">{formatDateGB(customStartDate)}</span>
    ) : (
      <>
        <span className="hidden print:inline w-full text-center font-mono font-bold text-blue-600">{formatDateGB(customStartDate)}</span>
        <input type="date" lang="en-GB" className="custom-date-picker-full print:hidden w-full text-center outline-none bg-transparent font-bold text-blue-600 cursor-pointer" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} />
      </>
    )
  );

  const renderReturnDate = () => (
    archivedData ? (
      <span className="w-full text-center font-mono font-bold text-blue-600 block">{formatDateGB(customReturnDate)}</span>
    ) : (
      <>
        <span className="hidden print:inline w-full text-center font-mono font-bold text-blue-600">{formatDateGB(customReturnDate)}</span>
        <input type="date" lang="en-GB" className="custom-date-picker-full print:hidden w-full text-center outline-none bg-transparent font-bold text-blue-600 cursor-pointer" value={customReturnDate} onChange={(e) => setCustomReturnDate(e.target.value)} />
      </>
    )
  );

  const theme = getThemeConfig(templateId);
  const balanceBefore = emp.earnedVacationDays !== undefined ? emp.earnedVacationDays : Math.round((emp.durationSinceLastVacationYears || 0) * 30);
  const deductedDays = emp.absence || 0;
  const balanceBeforeWithDeduction = balanceBefore - deductedDays;
  const effectiveDeductedLeaveDays = vacationType === 'annual' ? (requestedLeaveDays || 0) : 0;
  const balanceAfter = Math.max(0, balanceBeforeWithDeduction - effectiveDeductedLeaveDays);

  return (
    <PrintableSheet>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin-left: 1cm !important;
            margin-right: 1cm !important;
            margin-top: 1cm !important;
            margin-bottom: 0.5cm !important;
          }
          .print-single-page {
            zoom: 0.85 !important;
            width: 100% !important;
            max-width: 100% !important;
            padding-top: 1cm !important;
            padding-right: 0 !important;
            padding-bottom: 0 !important;
            padding-left: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
          table {
            width: 100% !important;
            max-width: 100% !important;
          }
        }
        .custom-date-picker-full {
          position: relative !important;
        }
        .custom-date-picker-full::-webkit-calendar-picker-indicator {
          display: block !important;
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          height: 100% !important;
          opacity: 0 !important;
          cursor: pointer !important;
          z-index: 30 !important;
        }
      `}} />
      <div className={`${theme.wrapper} mx-auto w-full max-w-full flex-grow flex flex-col text-black text-xs sm:text-sm font-sans overflow-x-auto print-single-page h-full`} dir="rtl">
        <PrintHeader theme={theme} companyNameAr={companyNameAr} companyNameEn={companyNameEn} docTitle="طلب إجازة" docTitleEn="Vacation Request" emp={emp} customCalcDate={requestDate} />

        {/* 1. جدول بيانات الموظف الأساسية */}
        <div className="text-right font-bold text-sm sm:text-base print:text-sm mb-1 print:mb-0.5">بيانات الموظف .</div>
        <table className="w-full border-collapse border-2 border-black text-center mb-1 print:mb-0.5 font-bold text-sm sm:text-xs print:text-sm">
          <tbody>
            <tr>
              <td className="border border-black p-1.5 sm:p-2.5 print:p-2 bg-gray-50 w-[22%] whitespace-nowrap">اسم الموظف</td>
              <td className="border border-black p-1.5 sm:p-2.5 print:p-2 text-blue-600 w-[28%] whitespace-nowrap overflow-hidden text-ellipsis">{emp.name}</td>
              <td className="border border-black p-1.5 sm:p-2.5 print:p-2 bg-gray-50 w-[22%] whitespace-nowrap">الرقم الوظيفي</td>
              <td className="border border-black p-1.5 sm:p-2.5 print:p-2 font-mono w-[28%] whitespace-nowrap">{emp.code || emp.sequenceNumber}</td>
            </tr>
            <tr>
              <td className="border border-black p-1.5 sm:p-2.5 print:p-2 bg-gray-50 w-[22%] whitespace-nowrap">تاريخ المباشرة</td>
              <td className="border border-black p-1.5 sm:p-2.5 print:p-2 font-mono w-[28%] whitespace-nowrap">{formatDateGB(emp.hireDate)}</td>
              <td className="border border-black p-1.5 sm:p-2.5 print:p-2 bg-gray-50 w-[22%] whitespace-nowrap">العودة من آخر إجازة</td>
              <td className="border border-black p-1.5 sm:p-2.5 print:p-2 font-mono w-[28%] whitespace-nowrap">{formatDateGB(emp.lastVacationReturnDate || emp.hireDate)}</td>
            </tr>
            <tr>
              <td className="border border-black p-1.5 sm:p-2.5 print:p-2 bg-gray-50 w-[22%] whitespace-nowrap">الراتب الاساسي</td>
              <td className="border border-black p-1.5 sm:p-2.5 print:p-2 font-mono w-[28%] whitespace-nowrap">{formatNumber(emp.basicSalary)}</td>
              <td className="border border-black p-1.5 sm:p-2.5 print:p-2 bg-gray-50 w-[22%] whitespace-nowrap">الوظيفة</td>
              <td className="border border-black p-1.5 sm:p-2.5 print:p-2 w-[28%] whitespace-nowrap overflow-hidden text-ellipsis">{emp.jobTitle || emp.branch}</td>
            </tr>
            <tr>
              <td className="border border-black p-1.5 sm:p-2.5 print:p-2 bg-gray-50 w-[22%] whitespace-nowrap">مدة العمل منذ اخر اجازة</td>
              <td className="border border-black p-1.5 sm:p-2.5 print:p-2 font-mono w-[28%] whitespace-nowrap">{formatNumber(emp.durationSinceLastVacationYears)} سنه</td>
              <td className="border border-black p-1.5 sm:p-2.5 print:p-2 bg-gray-50 w-[22%] whitespace-nowrap">تاريخ الطلب</td>
              <td className="border border-black p-1.5 sm:p-2.5 print:p-2 font-mono text-blue-600 w-[28%] whitespace-nowrap">
                {renderRequestDate()}
              </td>
            </tr>
          </tbody>
        </table>

        {/* 2. جدول تفاصيل ونوع الإجازة المطلوبة */}
        <table className="w-full border-collapse border-2 border-black text-center mb-1 print:mb-0.5 font-bold text-sm sm:text-xs print:text-sm">
          <tbody>
            <tr className={`${theme.tableHeadClass} h-8 print:h-7`}>
              <td className="border border-black p-1.5 sm:p-2.5 print:p-2" colSpan={4}>نوع الاجازة المطلوبة</td>
            </tr>
            <tr>
              <td colSpan={4} className="border border-black p-0 sm:p-0 print:p-0">
                <div className="grid grid-cols-5 w-full divide-x divide-x-reverse divide-black">
                  <div className="p-1.5 sm:p-2.5 print:p-2 flex items-center justify-center">
                    <label className="flex items-center justify-center gap-1 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="w-3 h-3" 
                        checked={vacationType === 'annual'} 
                        onChange={() => setVacationType('annual')} 
                      />
                      <span className="whitespace-nowrap">اجازة سنوية مستحقة</span>
                    </label>
                  </div>
                  <div className="p-1.5 sm:p-2.5 print:p-2 flex items-center justify-center">
                    <label className="flex items-center justify-center gap-1 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="w-3 h-3" 
                        checked={vacationType === 'unpaid'} 
                        onChange={() => setVacationType('unpaid')} 
                      />
                      <span className="whitespace-nowrap">اجازة بدون راتب</span>
                    </label>
                  </div>
                  <div className="p-1.5 sm:p-2.5 print:p-2 flex items-center justify-center">
                    <label className="flex items-center justify-center gap-1 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="w-3 h-3" 
                        checked={vacationType === 'sick'} 
                        onChange={() => setVacationType('sick')} 
                      />
                      <span className="whitespace-nowrap">اجازة مرضية</span>
                    </label>
                  </div>
                  <div className="p-1.5 sm:p-2.5 print:p-2 flex items-center justify-center">
                    <label className="flex items-center justify-center gap-1 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="w-3 h-3" 
                        checked={vacationType === 'deduct_balance'} 
                        onChange={() => setVacationType('deduct_balance')} 
                      />
                      <span className="whitespace-nowrap">خصم من الرصيد</span>
                    </label>
                  </div>
                  <div className="p-1.5 sm:p-2.5 print:p-2 flex items-center justify-center">
                    <label className="flex items-center justify-center gap-1 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="w-3 h-3" 
                        checked={vacationType === 'other'} 
                        onChange={() => setVacationType('other')} 
                      />
                      <span className="whitespace-nowrap">اخرى</span>
                    </label>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1.5 sm:p-2.5 print:p-2 bg-gray-50 whitespace-nowrap">تاريخ بداية الاجازة</td>
              <td className="border border-black p-1.5 sm:p-2.5 print:p-2 font-mono text-blue-600 font-bold whitespace-nowrap">
                {renderStartDate()}
              </td>
              <td className="border border-black p-1.5 sm:p-2.5 print:p-2 bg-gray-50 whitespace-nowrap">تاريخ العودة من الاجازة</td>
              <td className="border border-black p-1.5 sm:p-2.5 print:p-2 font-mono text-blue-600 font-bold whitespace-nowrap">
                {renderReturnDate()}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1.5 sm:p-2.5 print:p-2 bg-gray-50 whitespace-nowrap">رصيد الاجازة المستحق</td>
              <td className="border border-black p-1.5 sm:p-2.5 print:p-2 font-mono whitespace-nowrap">{formatNumber(balanceBefore)}</td>
              <td className="border border-black p-1.5 sm:p-2.5 print:p-2 bg-gray-50 whitespace-nowrap">أيام خصم إجازات</td>
              <td className="border border-black p-1.5 sm:p-2.5 print:p-2 font-mono text-red-600 whitespace-nowrap">{formatNumber(deductedDays)}</td>
            </tr>
            <tr>
              <td className="border border-black p-1.5 sm:p-2.5 print:p-2 bg-gray-50 whitespace-nowrap">مدة الاجازة المطلوبة</td>
              <td className="border border-black p-1.5 sm:p-2.5 print:p-2 font-mono text-blue-600 font-bold whitespace-nowrap">{requestedLeaveDays || 0}</td>
              <td className="border border-black p-1.5 sm:p-2.5 print:p-2 bg-gray-50 whitespace-nowrap">الرصيد المتبقي بعد الطلب</td>
              <td className="border border-black p-1.5 sm:p-2.5 print:p-2 font-mono text-emerald-700 font-bold whitespace-nowrap">{formatNumber(balanceAfter)}</td>
            </tr>
          </tbody>
        </table>

        {/* جدول توقيع الموظف والبديل والملاحظات */}
        <table className="w-full border-collapse border-2 border-black text-center mb-1 print:mb-0.5 font-bold text-sm sm:text-xs print:text-sm bg-white">
          <tbody>
            <tr className="h-12 print:h-10">
              <td className="border border-black p-1 bg-white w-[33%] align-middle text-center">
                توقيع الموظف
              </td>
              <td className="border border-black p-1 bg-white w-[33%] align-middle text-center">
                Signature
              </td>
              <td className="border border-black p-1 bg-white w-[34%] align-middle text-center">
                اسم الموظف البديل
              </td>
            </tr>
            <tr className="h-12 print:h-10">
              <td className="border border-black p-1 bg-white w-[66%] align-middle text-center" colSpan={2}>
                توقيع الموظف البديل
              </td>
              <td className="border border-black p-1 bg-white w-[34%] align-middle text-center">
                رقم الاتصال
              </td>
            </tr>
            <tr className="h-12 print:h-10">
              <td className="border border-black p-1 bg-white align-middle text-center" colSpan={3}>
                الملاحظات
              </td>
            </tr>
          </tbody>
        </table>

        {/* 3. التقويم المصغر لعرض أيام الإجازة */}
        {displayMonths && displayMonths.length > 0 && (
          <div className="mb-1 print:mb-0.5">
            <h4 className="text-xl print:text-lg font-bold mb-2 text-right">أيام الإجازة :</h4>
            <div className="grid grid-cols-2 gap-2.5 print:gap-1.5 text-center text-xs print:text-[10px]">
              {displayMonths.slice(0, 4).map((m, idx) => (
                <div key={idx} className="border border-black p-1.5 sm:p-2 print:p-1 rounded bg-gray-50/50 flex flex-col justify-between overflow-hidden">
                  <div className="font-bold border-b border-gray-400 p-1 mb-1 print:mb-0.5 text-center text-xs sm:text-sm print:text-[10px] whitespace-nowrap overflow-hidden text-ellipsis bg-gray-200">
                    {m.title.split(' - ')[0]} / {m.title.split(' / ')[1]}
                  </div>
                  <div className="grid grid-cols-7 gap-1 print:gap-1 font-bold text-sm print:text-[10px] text-gray-600 mb-2 print:mb-1">
                    <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span className="text-red-500">F</span><span className="text-red-500">S</span>
                  </div>
                  <div className="space-y-2 print:space-y-1">
                    {m.weeks.map((week, wIdx) => (
                      <div key={wIdx} className="grid grid-cols-7 gap-1 print:gap-1">
                        {week.map((day, dIdx) => {
                          const isWeekend = dIdx === 5 || dIdx === 6;
                          if (day === null) return <span key={dIdx} className={`py-1 print:py-1 px-0.5 print:px-[1px] ${isWeekend ? 'bg-red-50/50 rounded' : ''}`}></span>;
                          const dateStr = `${m.year}-${String(m.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          const isLeave = isInLeave(dateStr);
                          return (
                            <span 
                              key={dIdx} 
                              className={`py-1 print:py-1 px-0.5 print:px-[1px] rounded font-mono text-center flex items-center justify-center text-sm print:text-[10px] leading-none ${isLeave ? 'bg-blue-600 text-white font-black' : (isWeekend ? 'text-red-600 bg-red-50/50' : '')}`}
                            >
                              {day}
                            </span>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. التوقيعات والاعتمادات */}
        <div className="flex justify-between items-end mt-0.5 pt-0.5 pb-0.5 print:mt-0.5 print:pb-0.5 px-4 font-bold text-xs print:text-sm gap-2">
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
