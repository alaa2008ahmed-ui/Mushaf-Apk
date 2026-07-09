import React from 'react';
import { PrintTemplateId } from '../../utils/printTemplates';
import { CalculatedEmployee } from '../../types';
import { formatDateGB } from '../../utils';

export type HeaderType = 'swc' | 'classic' | 'executive' | 'minimal' | 'institutional' | 'modern' | 'geometric' | 'creative' | 'detailed' | 'compact' | 'elegant' | 'tech' | 'academic' | 'fast' | 'balanced';

export interface ThemeConfig {
  wrapper: string;
  headerType: HeaderType;
  tableHeadClass: string;
  subHeadClass: string;
}

export const getThemeConfig = (templateId: PrintTemplateId): ThemeConfig => {
  switch (templateId) {
    case '2': // الكلاسيكي الرسمي
      return { wrapper: "border-[3px] border-double border-slate-900 p-2 sm:p-5 bg-white print:border-none", headerType: 'classic', tableHeadClass: "bg-slate-200 text-slate-900 font-bold", subHeadClass: "font-bold text-sm sm:text-base mb-1 text-right text-slate-900 border-b-2 border-slate-800 pb-0.5" };
    case '3': // التنفيذي الراقي
      return { wrapper: "border border-indigo-300 p-2 sm:p-5 bg-white print:border-none rounded-lg", headerType: 'executive', tableHeadClass: "bg-indigo-950 text-white font-bold", subHeadClass: "font-bold text-sm sm:text-base mb-1 text-right text-indigo-950" };
    case '4': // المبسط المدمج
      return { wrapper: "border border-gray-300 p-2 sm:p-4 bg-white print:border-none font-sans", headerType: 'minimal', tableHeadClass: "bg-gray-100 text-gray-900 font-bold", subHeadClass: "font-bold text-xs sm:text-sm mb-1 text-right text-gray-800 underline" };
    case '5': // الحكومي المؤسسي
      return { wrapper: "border-4 border-slate-900 p-2 sm:p-4 bg-white print:border-none font-serif", headerType: 'institutional', tableHeadClass: "bg-slate-300 text-slate-950 font-bold", subHeadClass: "font-bold text-sm sm:text-base mb-1 text-right text-slate-900 bg-slate-100 px-2 py-0.5 border-r-4 border-slate-800" };
    case '6': // حديث ومبسط
      return { wrapper: "p-2 sm:p-4 bg-white print:border-none text-slate-800 font-sans shadow-md print:shadow-none", headerType: 'modern', tableHeadClass: "bg-blue-50 text-blue-900 font-bold border-b-2 border-blue-200", subHeadClass: "font-bold text-sm mb-1 text-right text-blue-800 border-b border-blue-100" };
    case '7': // هندسي دقيق
      return { wrapper: "border-2 border-emerald-900 p-2 sm:p-4 bg-white print:border-none font-mono", headerType: 'geometric', tableHeadClass: "bg-emerald-900 text-white font-bold tracking-wider", subHeadClass: "font-bold text-sm mb-1 text-right text-emerald-900 bg-emerald-50 px-2 border-l-4 border-emerald-800" };
    case '8': // إبداعي ملون
      return { wrapper: "border-[4px] border-amber-400 p-2 sm:p-4 bg-white print:border-none rounded-xl font-sans", headerType: 'creative', tableHeadClass: "bg-gradient-to-r from-amber-200 to-orange-200 text-amber-900 font-bold", subHeadClass: "font-bold text-sm mb-1 text-right text-amber-800 bg-amber-50 rounded px-2" };
    case '9': // شامل تفصيلي
      return { wrapper: "border-2 border-dashed border-gray-600 p-2 sm:p-4 bg-gray-50 print:bg-white print:border-none font-serif", headerType: 'detailed', tableHeadClass: "bg-gray-800 text-gray-100 font-bold", subHeadClass: "font-bold text-sm mb-1 text-right text-gray-900 border-b-2 border-dotted border-gray-400" };
    case '10': // مدمج مضغوط
      return { wrapper: "p-1 sm:p-2 bg-white print:border-none text-xs font-sans", headerType: 'compact', tableHeadClass: "bg-slate-100 text-slate-800 font-bold text-[10px]", subHeadClass: "font-bold text-xs mb-0.5 text-right text-slate-700 bg-slate-50 px-1 border-r-2 border-slate-400" };
    case '11': // أنيق وفاخر
      return { wrapper: "border border-rose-200 p-2 sm:p-5 bg-white print:border-none rounded-2xl shadow-xl print:shadow-none font-sans", headerType: 'elegant', tableHeadClass: "bg-rose-900 text-rose-50 font-bold uppercase", subHeadClass: "font-bold text-sm mb-1 text-right text-rose-900 border-b border-rose-200 pb-1" };
    case '12': // تقني متطور
      return { wrapper: "border-l-4 border-cyan-600 p-2 sm:p-4 bg-slate-50 print:bg-white print:border-none font-mono", headerType: 'tech', tableHeadClass: "bg-cyan-900 text-cyan-50 font-bold", subHeadClass: "font-bold text-sm mb-1 text-right text-cyan-800 border-b border-cyan-800 border-dashed" };
    case '13': // أكاديمي موثق
      return { wrapper: "border-4 border-double border-stone-800 p-3 sm:p-6 bg-[#fdfbf7] print:bg-white print:border-none font-serif", headerType: 'academic', tableHeadClass: "bg-stone-300 text-stone-900 font-bold", subHeadClass: "font-bold text-sm sm:text-base mb-1 text-right text-stone-900 bg-stone-200 px-2 font-serif" };
    case '14': // سريع ومباشر
      return { wrapper: "p-2 bg-white print:border-none font-sans", headerType: 'fast', tableHeadClass: "bg-zinc-800 text-white font-bold text-xs", subHeadClass: "font-bold text-xs mb-1 text-right text-zinc-800 bg-zinc-100 px-1 border-l-[3px] border-zinc-800" };
    case '15': // عصري متوازن
      return { wrapper: "border border-teal-500 rounded p-2 sm:p-4 bg-white print:border-none font-sans", headerType: 'balanced', tableHeadClass: "bg-teal-50 text-teal-900 font-bold border-t-2 border-teal-500", subHeadClass: "font-bold text-sm mb-1 text-right text-teal-800 px-2 bg-teal-50 rounded-full inline-block" };
    case '1': // المعاصر النظيف (القالب الأساسي)
    default:
      return { wrapper: "border border-slate-200 shadow-sm p-3 sm:p-6 bg-white print:border-none print:shadow-none", headerType: 'swc', tableHeadClass: "bg-gray-300 text-black font-bold", subHeadClass: "font-bold text-sm sm:text-base mb-1 text-right text-black" };
  }
};

interface PrintHeaderProps {
  theme: ThemeConfig;
  companyNameAr: string;
  companyNameEn: string;
  docTitle: string;
  docTitleEn?: string;
  emp?: CalculatedEmployee;
  customCalcDate?: string;
}

export const PrintHeader: React.FC<PrintHeaderProps> = ({ theme, companyNameAr, companyNameEn, docTitle, docTitleEn = "Document", emp, customCalcDate }) => {
  const dateStr = customCalcDate ? formatDateGB(customCalcDate) : formatDateGB(new Date().toISOString());
  const refCode = emp?.code || 'DOC';

  switch (theme.headerType) {
    case 'classic':
      return (
        <div className="text-center border-b-2 border-slate-900 pb-2 mb-2 print:pb-1 print:mb-1.5">
          <h1 className="text-xl print:text-base font-bold mb-0.5">{companyNameAr}</h1>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">{companyNameEn}</h2>
          <div className="inline-block px-4 py-1 border-2 border-slate-900 font-black text-base print:text-sm bg-slate-100">
            {docTitle}
          </div>
        </div>
      );
    case 'executive':
      return (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-3 print:p-2 rounded-lg flex justify-between items-center mb-2 print:mb-1.5">
          <div>
            <h1 className="text-lg print:text-base font-black tracking-wide text-indigo-300 mb-0.5">{companyNameAr}</h1>
            <h2 className="text-[10px] font-medium text-slate-300 uppercase tracking-widest">{companyNameEn}</h2>
          </div>
          <div className="text-left">
            <div className="text-[10px] font-bold bg-indigo-400 text-slate-950 px-2 py-0.5 rounded inline-block mb-0.5">{docTitleEn.toUpperCase()}</div>
            <h3 className="text-sm print:text-xs font-bold">{docTitle}</h3>
          </div>
        </div>
      );
    case 'minimal':
      return (
        <div className="flex justify-between items-end border-b border-gray-400 pb-2 mb-2 print:pb-1 print:mb-1.5 font-sans">
          <div>
            <h1 className="text-lg print:text-sm font-bold text-gray-900">{companyNameAr}</h1>
            <h2 className="text-[10px] uppercase text-gray-500">{companyNameEn}</h2>
          </div>
          <div className="text-left">
            <span className="text-xs font-bold uppercase text-gray-700 block">{docTitleEn}</span>
            <span className="text-sm font-bold text-black">{docTitle}</span>
          </div>
        </div>
      );
    case 'institutional':
      return (
        <div className="border-2 border-slate-900 p-2 print:p-1.5 mb-2 print:mb-1.5 bg-slate-50 flex justify-between items-center text-center">
          <div className="w-1/4 font-bold text-xs print:text-[10px]">
            <div>المملكة العربية السعودية</div>
            <div>{companyNameAr}</div>
          </div>
          <div className="w-1/2 font-black text-base print:text-sm underline">
            {docTitle}
          </div>
          <div className="w-1/4 font-mono text-left text-[10px]" dir="ltr">
            <div>Ref: {refCode}</div>
            <div>Date: {dateStr}</div>
          </div>
        </div>
      );
    case 'modern':
      return (
        <div className="flex justify-between items-center pb-2 mb-2 print:pb-1 print:mb-1.5 border-b-4 border-blue-500">
          <div>
            <h1 className="text-2xl print:text-lg font-bold text-blue-900">{companyNameAr}</h1>
            <h2 className="text-xs text-blue-600">{companyNameEn}</h2>
          </div>
          <h3 className="text-xl print:text-base font-black text-blue-800 bg-blue-50 px-4 py-1 rounded-full">{docTitle}</h3>
        </div>
      );
    case 'geometric':
      return (
        <div className="border-b-2 border-emerald-900 mb-2 pb-2 flex justify-between">
          <div className="border-r-8 border-emerald-900 pr-2">
            <h1 className="font-bold text-emerald-950 text-xl print:text-base">{companyNameAr}</h1>
            <h2 className="text-xs uppercase text-emerald-800">{companyNameEn}</h2>
          </div>
          <div className="text-left">
            <h3 className="font-bold text-emerald-900 text-lg print:text-sm bg-emerald-100 px-2 py-1">{docTitle}</h3>
            <div className="text-[10px] mt-1 font-mono">{dateStr}</div>
          </div>
        </div>
      );
    case 'creative':
      return (
        <div className="bg-amber-100 rounded-xl p-3 flex flex-col items-center justify-center mb-2 text-amber-900 border-2 border-amber-300">
          <h1 className="text-2xl font-black">{companyNameAr}</h1>
          <h2 className="text-sm opacity-80 mb-1">{companyNameEn}</h2>
          <div className="bg-amber-500 text-white font-bold px-4 py-0.5 rounded shadow-sm">{docTitle}</div>
        </div>
      );
    case 'detailed':
      return (
        <div className="border-b-4 border-double border-gray-800 mb-2 pb-1 flex justify-between items-end">
          <div>
            <h1 className="text-xl font-bold font-serif">{companyNameAr}</h1>
            <h2 className="text-xs text-gray-600">{companyNameEn}</h2>
          </div>
          <div className="text-center font-bold text-lg bg-gray-800 text-white px-3 py-1">{docTitle}</div>
          <div className="text-[10px] text-gray-500">
            <div>التاريخ: {dateStr}</div>
            <div>المرجع: {refCode}</div>
          </div>
        </div>
      );
    case 'compact':
      return (
        <div className="flex justify-between items-center bg-slate-200 p-1 mb-1 border border-slate-300">
          <div className="font-bold text-sm">{companyNameAr}</div>
          <div className="font-bold text-sm bg-white px-2 rounded shadow-sm">{docTitle}</div>
          <div className="text-[10px]">{dateStr}</div>
        </div>
      );
    case 'elegant':
      return (
        <div className="text-center mb-2 pb-2 border-b border-rose-200">
          <h1 className="text-2xl text-rose-900 font-bold tracking-tight">{companyNameAr}</h1>
          <h2 className="text-[10px] text-rose-500 tracking-[0.2em] uppercase mb-2">{companyNameEn}</h2>
          <h3 className="text-lg text-rose-800 font-serif italic border-y border-rose-100 py-1 inline-block px-8">{docTitle}</h3>
        </div>
      );
    case 'tech':
      return (
        <div className="flex bg-cyan-900 text-cyan-50 p-2 mb-2 items-center justify-between">
          <div className="flex flex-col">
            <span className="font-bold text-lg">{companyNameAr}</span>
            <span className="text-[10px] font-mono text-cyan-300">{companyNameEn}</span>
          </div>
          <div className="font-mono text-xl border-l-2 border-cyan-600 pl-4">
            {docTitle}
          </div>
        </div>
      );
    case 'academic':
      return (
        <div className="text-center border-b-4 border-stone-900 pb-2 mb-2">
          <h1 className="text-2xl font-black font-serif text-stone-900 mb-1">{companyNameAr}</h1>
          <div className="w-16 h-1 bg-stone-400 mx-auto mb-1"></div>
          <h3 className="text-xl font-bold text-stone-800">{docTitle}</h3>
        </div>
      );
    case 'fast':
      return (
        <div className="flex justify-between border-b-2 border-zinc-800 mb-1 pb-1">
          <h1 className="font-bold text-zinc-900 text-sm">{companyNameAr} - {docTitle}</h1>
          <span className="text-[10px] font-mono">{dateStr}</span>
        </div>
      );
    case 'balanced':
      return (
        <div className="bg-teal-50 p-2 rounded mb-2 flex justify-between items-center border border-teal-200">
          <div>
            <h1 className="text-teal-900 font-bold text-lg">{companyNameAr}</h1>
            <h2 className="text-teal-600 text-[10px] uppercase">{companyNameEn}</h2>
          </div>
          <div className="text-teal-900 font-black bg-white px-3 py-1 rounded shadow-sm">{docTitle}</div>
        </div>
      );
    case 'swc':
    default:
      return (
        <div className="flex justify-between items-center border-b-[3px] border-black pb-2 mb-2 print:pb-1 print:mb-2">
          <div className="flex flex-col items-center text-[#4a148c]">
            <span className="text-sm print:text-xs font-bold -mb-2">مياه</span>
            <span className="text-5xl print:text-3xl font-black tracking-tighter">عذبة</span>
            <span className="text-lg print:text-xs font-bold -mt-1">adba water</span>
          </div>
          <div className="text-center font-bold">
            <h1 className="text-2xl print:text-base mb-1 print:mb-0.5">{companyNameAr}</h1>
            <h2 className="text-xl print:text-xs mb-2 print:mb-1 uppercase">{companyNameEn}</h2>
            <h3 className="text-2xl print:text-base">{docTitle}</h3>
          </div>
          <div className="text-[#e53935] font-black italic tracking-tighter text-7xl print:text-4xl leading-none">
            SWC
          </div>
        </div>
      );
  }
};
