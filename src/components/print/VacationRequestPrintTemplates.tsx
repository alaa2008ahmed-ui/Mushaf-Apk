import React from 'react';
import { CalculatedEmployee } from '../../types';
import { formatNumber, formatDateGB } from '../../utils';
import PrintableSheet from '../PrintableSheet';
import { PrintTemplateId } from '../../utils/printTemplates';

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
          wrapper: "border border-cyan-300 p-2 sm:p-5 bg-white print:border-none rounded-lg",
          headerType: 'executive' as const,
          tableHeadClass: "bg-cyan-950 text-white font-bold",
          subHeadClass: "font-bold text-sm sm:text-base mb-1 text-right text-cyan-950",
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
  const balanceBefore = emp.earnedVacationDays !== undefined ? emp.earnedVacationDays : Math.round((emp.durationSinceLastVacationYears || 0) * 30);
  const balanceAfter = Math.max(0, balanceBefore - (requestedLeaveDays || 0));

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
              <h3 className="text-2xl print:text-base">طلب اجازة</h3>
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
              نموذج طلب إجازة موظف رسمي
            </div>
          </div>
        )}

        {theme.headerType === 'executive' && (
          <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 text-white p-3 print:p-2 rounded-lg flex justify-between items-center mb-2 print:mb-1.5">
            <div>
              <h1 className="text-lg print:text-base font-black tracking-wide text-cyan-300 mb-0.5">{companyNameAr}</h1>
              <h2 className="text-[10px] font-medium text-slate-300 uppercase tracking-widest">{companyNameEn}</h2>
            </div>
            <div className="text-left">
              <div className="text-[10px] font-bold bg-cyan-400 text-slate-950 px-2 py-0.5 rounded inline-block mb-0.5">LEAVE REQUEST</div>
              <h3 className="text-sm print:text-xs font-bold">طلب إجازة دورية موظف</h3>
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
              <span className="text-xs font-bold uppercase text-gray-700 block">Vacation Application</span>
              <span className="text-sm font-bold text-black">طلب إجازة موظف</span>
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
              نموذج طلب إجازة معتمد
            </div>
            <div className="w-1/4 font-mono text-left text-[10px]" dir="ltr">
              <div>Ref: LV-{emp.code || 'DOC'}</div>
              <div>Date: {formatDateGB(requestDate)}</div>
            </div>
          </div>
        )}

        {/* 1. جدول بيانات الموظف الأساسية */}
        <table className="w-full border-collapse border-2 border-black text-center mb-2 font-bold text-xs sm:text-sm print:text-[11px]">
          <tbody>
            <tr>
              <td className="border border-black p-1 bg-gray-50 w-[15%]">اسم الموظف</td>
              <td className="border border-black p-1 text-blue-600">{emp.name}</td>
              <td className="border border-black p-1 bg-gray-50 w-[15%]">الرقم الوظيفي</td>
              <td className="border border-black p-1 font-mono">{emp.code || emp.sequenceNumber}</td>
            </tr>
            <tr>
              <td className="border border-black p-1 bg-gray-50">تاريخ المباشرة</td>
              <td className="border border-black p-1 font-mono">{formatDateGB(emp.hireDate)}</td>
              <td className="border border-black p-1 bg-gray-50">تاريخ العودة من اخر اجازة</td>
              <td className="border border-black p-1 font-mono">{formatDateGB(emp.lastVacationReturnDate || emp.hireDate)}</td>
            </tr>
            <tr>
              <td className="border border-black p-1 bg-gray-50">الراتب الاساسي</td>
              <td className="border border-black p-1 font-mono">{formatNumber(emp.basicSalary)}</td>
              <td className="border border-black p-1 bg-gray-50">الوظيفة</td>
              <td className="border border-black p-1">{emp.jobTitle || emp.branch}</td>
            </tr>
            <tr>
              <td className="border border-black p-1 bg-gray-50">مدة العمل منذ اخر اجازة</td>
              <td className="border border-black p-1 font-mono">{formatNumber(emp.durationSinceLastVacationYears)} سنه</td>
              <td className="border border-black p-1 bg-gray-50">تاريخ الطلب</td>
              <td className="border border-black p-1 font-mono text-blue-600">
                {renderRequestDate()}
              </td>
            </tr>
          </tbody>
        </table>

        {/* 2. جدول تفاصيل ونوع الإجازة المطلوبة */}
        <table className="w-full border-collapse border-2 border-black text-center mb-2 font-bold text-xs sm:text-sm print:text-[11px]">
          <tbody>
            <tr className={theme.tableHeadClass}>
              <td className="border border-black p-1" colSpan={4}>نوع الاجازة المطلوبة</td>
            </tr>
             <tr>
              <td className="border border-black p-1">
                <label className="flex items-center justify-center gap-1 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-3.5 h-3.5" 
                    checked={vacationType === 'annual'} 
                    onChange={() => setVacationType('annual')} 
                  />
                  <span>اجازة سنوية مستحقة</span>
                </label>
              </td>
              <td className="border border-black p-1">
                <label className="flex items-center justify-center gap-1 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-3.5 h-3.5" 
                    checked={vacationType === 'unpaid'} 
                    onChange={() => setVacationType('unpaid')} 
                  />
                  <span>اجازة بدون راتب</span>
                </label>
              </td>
              <td className="border border-black p-1">
                <label className="flex items-center justify-center gap-1 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-3.5 h-3.5" 
                    checked={vacationType === 'sick'} 
                    onChange={() => setVacationType('sick')} 
                  />
                  <span>اجازة مرضية</span>
                </label>
              </td>
              <td className="border border-black p-1">
                <label className="flex items-center justify-center gap-1 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-3.5 h-3.5" 
                    checked={vacationType === 'other'} 
                    onChange={() => setVacationType('other')} 
                  />
                  <span>اخرى</span>
                </label>
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1 bg-gray-50">تاريخ بداية الاجازة</td>
              <td className="border border-black p-1 font-mono text-blue-600 font-bold">
                {renderStartDate()}
              </td>
              <td className="border border-black p-1 bg-gray-50">تاريخ العودة من الاجازة</td>
              <td className="border border-black p-1 font-mono text-blue-600 font-bold">
                {renderReturnDate()}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1 bg-gray-50">مدة الاجازة المطلوبة</td>
              <td className="border border-black p-1 font-mono text-blue-600 font-bold">{requestedLeaveDays || 0} يوم</td>
              <td className="border border-black p-1 bg-gray-50">رصيد الاجازة المستحق قبل الطلب</td>
              <td className="border border-black p-1 font-mono">{formatNumber(balanceBefore)} يوم</td>
            </tr>
            <tr>
              <td className="border border-black p-1 bg-gray-50">الرصيد المتبقي بعد الطلب</td>
              <td className="border border-black p-1 font-mono text-emerald-700 font-bold" colSpan={3}>{formatNumber(balanceAfter)} يوم</td>
            </tr>
          </tbody>
        </table>

        {/* 3. التقويم المصغر لعرض أيام الإجازة */}
        {displayMonths && displayMonths.length > 0 && (
          <div className="mb-2 print:mb-1">
            <h4 className={theme.subHeadClass}>التقويم الشهري (أيام الإجازة المظللة)</h4>
            <div className="grid grid-cols-2 gap-2 text-center text-[10px] print:text-[9px]">
              {displayMonths.slice(0, 4).map((m, idx) => (
                <div key={idx} className="border border-black p-1 rounded bg-gray-50/50">
                  <div className="font-bold border-b border-gray-400 pb-0.5 mb-1">{m.title}</div>
                  <div className="grid grid-cols-7 gap-0.5 font-bold text-[8px] text-gray-600 mb-0.5">
                    <span>ح</span><span>ن</span><span>ث</span><span>ر</span><span>خ</span><span>ج</span><span>س</span>
                  </div>
                  <div className="space-y-0.5">
                    {m.weeks.map((week, wIdx) => (
                      <div key={wIdx} className="grid grid-cols-7 gap-0.5">
                        {week.map((day, dIdx) => {
                          if (day === null) return <span key={dIdx} className="p-0.5"></span>;
                          const dateStr = `${m.year}-${String(m.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          const isLeave = isInLeave(dateStr);
                          return (
                            <span 
                              key={dIdx} 
                              className={`p-0.5 rounded font-mono ${isLeave ? 'bg-blue-600 text-white font-bold' : ''}`}
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
        <div className="flex justify-between items-end mt-auto pt-3 print:mt-auto print:pb-0.5 px-4 font-bold text-xs print:text-[11px] gap-2 border-t border-black">
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
