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

  const [vacationType, setVacationType] = React.useState<'annual' | 'unpaid' | 'sick' | 'other'>('annual');

  const renderRequestDate = () => (
    archivedData ? (
      <span className="w-full text-center font-bold text-blue-600 block">{formatDateGB(requestDate)}</span>
    ) : (
      <input 
        type="date" 
        className="w-full text-center outline-none bg-transparent font-bold text-blue-600 cursor-pointer" 
        value={requestDate} 
        onChange={(e) => setRequestDate(e.target.value)} 
        onClick={(e) => { try { e.currentTarget.showPicker?.(); } catch {} }}
      />
    )
  );

  const renderStartDate = () => (
    archivedData ? (
      <span className="w-full text-center font-mono font-bold text-blue-600 block">{formatDateGB(customStartDate)}</span>
    ) : (
      <>
        <span className="hidden print:inline w-full text-center font-mono font-bold text-blue-600">{formatDateGB(customStartDate)}</span>
        <input type="date" lang="en-GB" className="print:hidden w-full text-center outline-none bg-transparent font-bold text-blue-600 cursor-pointer" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} onClick={(e) => { try { e.currentTarget.showPicker?.(); } catch {} }} />
      </>
    )
  );

  const renderReturnDate = () => (
    archivedData ? (
      <span className="w-full text-center font-mono font-bold text-blue-600 block">{formatDateGB(customReturnDate)}</span>
    ) : (
      <>
        <span className="hidden print:inline w-full text-center font-mono font-bold text-blue-600">{formatDateGB(customReturnDate)}</span>
        <input type="date" lang="en-GB" className="print:hidden w-full text-center outline-none bg-transparent font-bold text-blue-600 cursor-pointer" value={customReturnDate} onChange={(e) => setCustomReturnDate(e.target.value)} onClick={(e) => { try { e.currentTarget.showPicker?.(); } catch {} }} />
      </>
    )
  );

  const theme = getThemeConfig(templateId);
  const balanceBefore = emp.earnedVacationDays !== undefined ? emp.earnedVacationDays : Math.round((emp.durationSinceLastVacationYears || 0) * 30);
  const balanceAfter = Math.max(0, balanceBefore - (requestedLeaveDays || 0));

  return (
    <PrintableSheet>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin-left: 1cm;
            margin-right: 1cm;
            margin-top: 1cm;
            margin-bottom: 1cm;
          }
          body {
            background-color: white !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            min-width: 100% !important;
          }
          /* إخفاء أسهم الإدخال الرقمي */
          input[type="number"]::-webkit-outer-spin-button,
          input[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input[type="number"] {
            -moz-appearance: textfield;
            appearance: textfield;
          }
          /* إلغاء الهوامش الجانبية تماماً وتمديد التصميم عرضياً */
          .print-single-page {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 100% !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            border: none !important;
            box-shadow: none !important;
            transform: none !important;
          }
          .print-single-page > div {
            width: 100% !important;
            max-width: 100% !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
          }
          table {
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}} />
      <div className={`${theme.wrapper} mx-auto w-full max-w-full flex-grow flex flex-col text-black text-xs sm:text-sm font-sans overflow-x-auto print-single-page h-full`} dir="rtl">
        {/* هامش علوي 1 سم للطباعة */}
        <div className="h-[10mm] w-full shrink-0 print:block"></div>

        <PrintHeader theme={theme} companyNameAr={companyNameAr} companyNameEn={companyNameEn} docTitle="طلب إجازة" docTitleEn="Vacation Request" emp={emp} customCalcDate={requestDate} />

        {/* 1. جدول بيانات الموظف الأساسية */}
        <table className="w-full border-collapse border-2 border-black text-center mb-1 print:mb-0.5 font-bold text-[10px] sm:text-xs print:text-[10px]">
          <tbody>
            <tr>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 bg-gray-50 w-[22%] whitespace-nowrap">اسم الموظف</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 text-blue-600 w-[28%] whitespace-nowrap overflow-hidden text-ellipsis">{emp.name}</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 bg-gray-50 w-[22%] whitespace-nowrap">الرقم الوظيفي</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 font-mono w-[28%] whitespace-nowrap">{emp.code || emp.sequenceNumber}</td>
            </tr>
            <tr>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 bg-gray-50 w-[22%] whitespace-nowrap">تاريخ المباشرة</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 font-mono w-[28%] whitespace-nowrap">{formatDateGB(emp.hireDate)}</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 bg-gray-50 w-[22%] whitespace-nowrap">العودة من آخر إجازة</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 font-mono w-[28%] whitespace-nowrap">{formatDateGB(emp.lastVacationReturnDate || emp.hireDate)}</td>
            </tr>
            <tr>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 bg-gray-50 w-[22%] whitespace-nowrap">الراتب الاساسي</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 font-mono w-[28%] whitespace-nowrap">{formatNumber(emp.basicSalary)}</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 bg-gray-50 w-[22%] whitespace-nowrap">الوظيفة</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 w-[28%] whitespace-nowrap overflow-hidden text-ellipsis">{emp.jobTitle || emp.branch}</td>
            </tr>
            <tr>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 bg-gray-50 w-[22%] whitespace-nowrap">مدة العمل منذ اخر اجازة</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 font-mono w-[28%] whitespace-nowrap">{formatNumber(emp.durationSinceLastVacationYears)} سنه</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 bg-gray-50 w-[22%] whitespace-nowrap">تاريخ الطلب</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 font-mono text-blue-600 w-[28%] whitespace-nowrap">
                {renderRequestDate()}
              </td>
            </tr>
          </tbody>
        </table>

        {/* 2. جدول تفاصيل ونوع الإجازة المطلوبة */}
        <table className="w-full border-collapse border-2 border-black text-center mb-1 print:mb-0.5 font-bold text-[10px] sm:text-xs print:text-[10px]">
          <tbody>
            <tr className={`${theme.tableHeadClass} h-6 print:h-5`}>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5" colSpan={4}>نوع الاجازة المطلوبة</td>
            </tr>
             <tr>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5">
                <label className="flex items-center justify-center gap-1 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-3 h-3" 
                    checked={vacationType === 'annual'} 
                    onChange={() => setVacationType('annual')} 
                  />
                  <span className="whitespace-nowrap">اجازة سنوية مستحقة</span>
                </label>
              </td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5">
                <label className="flex items-center justify-center gap-1 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-3 h-3" 
                    checked={vacationType === 'unpaid'} 
                    onChange={() => setVacationType('unpaid')} 
                  />
                  <span className="whitespace-nowrap">اجازة بدون راتب</span>
                </label>
              </td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5">
                <label className="flex items-center justify-center gap-1 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-3 h-3" 
                    checked={vacationType === 'sick'} 
                    onChange={() => setVacationType('sick')} 
                  />
                  <span className="whitespace-nowrap">اجازة مرضية</span>
                </label>
              </td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5">
                <label className="flex items-center justify-center gap-1 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-3 h-3" 
                    checked={vacationType === 'other'} 
                    onChange={() => setVacationType('other')} 
                  />
                  <span className="whitespace-nowrap">اخرى</span>
                </label>
              </td>
            </tr>
            <tr>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 bg-gray-50 whitespace-nowrap">تاريخ بداية الاجازة</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 font-mono text-blue-600 font-bold whitespace-nowrap">
                {renderStartDate()}
              </td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 bg-gray-50 whitespace-nowrap">تاريخ العودة من الاجازة</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 font-mono text-blue-600 font-bold whitespace-nowrap">
                {renderReturnDate()}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 bg-gray-50 whitespace-nowrap">مدة الاجازة المطلوبة</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 font-mono text-blue-600 font-bold whitespace-nowrap">{requestedLeaveDays || 0} يوم</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 bg-gray-50 whitespace-nowrap">رصيد الاجازة المستحق قبل الطلب</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 font-mono whitespace-nowrap">{formatNumber(balanceBefore)} يوم</td>
            </tr>
            <tr>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 bg-gray-50 whitespace-nowrap">الرصيد المتبقي بعد الطلب</td>
              <td className="border border-black p-0.5 sm:p-1 print:p-0.5 font-mono text-emerald-700 font-bold whitespace-nowrap" colSpan={3}>{formatNumber(balanceAfter)} يوم</td>
            </tr>
          </tbody>
        </table>

        {/* جدول توقيع الموظف والبديل والملاحظات */}
        <table className="w-full border-collapse border-2 border-black text-right mb-1 print:mb-0.5 font-bold text-[10px] sm:text-xs print:text-[10px] bg-white">
          <tbody>
            <tr className="h-8 print:h-7">
              <td className="border border-black p-0.5 bg-white text-right w-[33%] align-top pt-0.5 pr-2">
                توقيع الموظف
              </td>
              <td className="border border-black p-0.5 bg-white text-right w-[33%] align-top pt-0.5 pr-2">
                Signature
              </td>
              <td className="border border-black p-0.5 bg-white text-right w-[34%] align-top pt-0.5 pr-2">
                اسم الموظف البديل
              </td>
            </tr>
            <tr className="h-8 print:h-7">
              <td className="border border-black p-0.5 bg-white text-right w-[66%] align-top pt-0.5 pr-2" colSpan={2}>
                توقيع الموظف البديل
              </td>
              <td className="border border-black p-0.5 bg-white text-right w-[34%] align-top pt-0.5 pr-2">
                رقم الاتصال
              </td>
            </tr>
            <tr className="h-8 print:h-7">
              <td className="border border-black p-0.5 bg-white text-right align-top pt-0.5 pr-2" colSpan={3}>
                الملاحظات
              </td>
            </tr>
          </tbody>
        </table>

        {/* 3. التقويم المصغر لعرض أيام الإجازة */}
        {displayMonths && displayMonths.length > 0 && (
          <div className="mb-1 print:mb-0.5">
            <h4 className={`${theme.subHeadClass} mb-1 print:mb-0.5`}>التقويم الشهري (أيام الإجازة المظللة)</h4>
            <div className="grid grid-cols-2 gap-3 print:gap-2 text-center text-xs print:text-[10px]">
              {displayMonths.slice(0, 2).map((m, idx) => (
                <div key={idx} className="border border-black p-2 sm:p-3 print:p-1 rounded bg-gray-50/50 flex flex-col justify-between">
                  <div className="font-bold border-b border-gray-400 pb-1 mb-1 print:mb-0.5 text-center text-xs sm:text-sm print:text-xs">{m.title}</div>
                  <div className="grid grid-cols-7 gap-1 print:gap-[2px] font-bold text-[10px] print:text-[8px] text-gray-600 mb-1 print:mb-0.5">
                    <span>ح</span><span>ن</span><span>ث</span><span>ر</span><span>خ</span><span>ج</span><span>س</span>
                  </div>
                  <div className="space-y-1 print:space-y-0.5">
                    {m.weeks.map((week, wIdx) => (
                      <div key={wIdx} className="grid grid-cols-7 gap-1 print:gap-[2px]">
                        {week.map((day, dIdx) => {
                          if (day === null) return <span key={dIdx} className="py-1 print:py-0.5 px-0.5 print:px-0.5"></span>;
                          const dateStr = `${m.year}-${String(m.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          const isLeave = isInLeave(dateStr);
                          return (
                            <span 
                              key={dIdx} 
                              className={`py-1 print:py-0.5 px-0.5 print:px-0.5 rounded font-mono text-center flex items-center justify-center text-[11px] print:text-[9.5px] leading-none ${isLeave ? 'bg-blue-600 text-white font-black' : ''}`}
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
