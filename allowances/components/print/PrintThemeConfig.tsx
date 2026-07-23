import React from 'react';
import { PrintTemplateId } from '../../utils/printTemplates';
import { CalculatedEmployee } from '../../types';
import { formatDateGB } from '../../utils';

export type HeaderType = 'swc' | 'classic' | 'executive' | 'minimal' | 'institutional' | 'modern' | 'geometric' | 'creative' | 'detailed' | 'compact' | 'elegant' | 'tech' | 'academic' | 'fast' | 'balanced' | 'professional-advanced' | 'modern-corporate' | 'innovative-elegant' | 'clear-data' | 'official-luxury';

export interface ThemeConfig {
  wrapper: string;
  headerType: HeaderType;
  tableHeadClass: string;
  subHeadClass: string;
}

export const getThemeConfig = (templateId: PrintTemplateId): ThemeConfig => {
  switch (templateId) {
    case '2': // الاحترافي المطور
      return { wrapper: "border-l-[6px] border-l-blue-800 border-t border-r border-b border-gray-200 p-2 sm:p-5 bg-white print:border-none shadow-sm print:shadow-none font-sans", headerType: 'professional-advanced', tableHeadClass: "bg-blue-800 text-white font-bold", subHeadClass: "font-bold text-sm mb-1 text-right text-blue-900 border-b border-blue-200 pb-1" };
    case '3': // تصميم الشركات الحديث
      return { wrapper: "border border-slate-300 p-2 sm:p-4 bg-slate-50 print:bg-white print:border-none font-sans", headerType: 'modern-corporate', tableHeadClass: "bg-slate-800 text-slate-100 font-bold uppercase", subHeadClass: "font-bold text-sm mb-1 text-right text-slate-800 bg-slate-200 px-2 py-0.5" };
    case '4': // المبتكر الأنيق
      return { wrapper: "border-2 border-indigo-100 rounded-xl p-2 sm:p-5 bg-white print:border-none font-sans", headerType: 'innovative-elegant', tableHeadClass: "bg-indigo-50 text-indigo-900 font-bold border-y-2 border-indigo-200", subHeadClass: "font-bold text-sm mb-1 text-right text-indigo-800" };
    case '5': // الرسمي الفاخر
      return { wrapper: "border-4 border-double border-amber-800 p-3 sm:p-6 bg-[#fffcf5] print:bg-white print:border-none font-serif", headerType: 'official-luxury', tableHeadClass: "bg-amber-900 text-amber-50 font-bold", subHeadClass: "font-bold text-sm sm:text-base mb-1 text-right text-amber-950 border-b border-amber-900/30 pb-0.5" };
    case '1': // المعاصر النظيف (القالب الأساسي)
    default:
      return { wrapper: "border border-slate-200 shadow-sm p-3 sm:p-6 bg-white print:border-none print:shadow-none print:p-0", headerType: 'swc', tableHeadClass: "bg-gray-300 text-black font-bold", subHeadClass: "font-bold text-sm sm:text-base mb-1 text-right text-black" };
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
    case 'professional-advanced':
      return (
        <div className="flex justify-between items-center border-b-[3px] border-blue-800 pb-2 mb-3 print:pb-2 print:mb-3">
          <div className="flex flex-col">
            <h1 className="text-2xl print:text-lg font-bold text-blue-900 mb-0.5">{companyNameAr}</h1>
            <h2 className="text-[10px] text-blue-600 uppercase tracking-widest">{companyNameEn}</h2>
          </div>
          <div className="text-left bg-blue-50 px-4 py-1.5 rounded-lg border border-blue-100 shadow-sm">
            <h3 className="text-lg print:text-base font-black text-blue-900 mb-0.5">{docTitle}</h3>
            <div className="text-[10px] text-blue-700 font-mono flex justify-between gap-4">
              <span>Date: {dateStr}</span>
              <span>Ref: {refCode}</span>
            </div>
          </div>
        </div>
      );
    case 'modern-corporate':
      return (
        <div className="flex bg-slate-900 text-white p-3 print:p-2 mb-3 print:mb-2 justify-between items-center rounded-t-lg print:rounded-none shadow-sm">
          <div>
            <h1 className="text-xl print:text-base font-bold tracking-tight">{companyNameAr}</h1>
            <h2 className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">{companyNameEn}</h2>
          </div>
          <div className="bg-white text-slate-900 px-4 py-1 rounded text-sm print:text-xs font-bold shadow flex flex-col items-center justify-center">
            <span className="text-base print:text-sm">{docTitle}</span>
            <span className="text-[9px] text-slate-500 font-normal mt-0.5">{dateStr}</span>
          </div>
        </div>
      );
    case 'innovative-elegant':
      return (
        <div className="text-center mb-4 print:mb-3 pb-3 border-b-2 border-indigo-100 relative">
          <div className="absolute left-0 top-0 text-[10px] text-indigo-400 font-mono text-left bg-indigo-50 px-2 py-1 rounded">
            <div>D: {dateStr}</div>
            <div>R: {refCode}</div>
          </div>
          <h1 className="text-2xl print:text-xl font-black text-indigo-950 mb-1">{companyNameAr}</h1>
          <h2 className="text-[11px] uppercase text-indigo-400 tracking-[0.2em] mb-2">{companyNameEn}</h2>
          <div className="inline-block px-8 py-1.5 bg-gradient-to-r from-indigo-50 via-white to-indigo-50 text-indigo-900 font-bold text-lg print:text-base rounded-full border border-indigo-200 shadow-sm">
            {docTitle}
          </div>
        </div>
      );
    case 'clear-data':
      return (
        <div className="border-b-[4px] border-gray-900 mb-3 print:mb-2 pb-1.5 flex justify-between items-end bg-gray-50 print:bg-white px-2">
          <div className="font-mono">
            <h1 className="text-lg print:text-base font-bold text-gray-900">{companyNameAr}</h1>
            <h2 className="text-[10px] text-gray-600 font-sans">{companyNameEn}</h2>
          </div>
          <div className="bg-gray-900 text-white px-3 py-1 font-black text-lg print:text-base tracking-wider shadow-sm uppercase">
            {docTitle}
          </div>
          <div className="text-[10px] font-mono text-left text-gray-700 bg-gray-200 print:bg-gray-100 px-2 py-1">
            <div>DATE: {dateStr}</div>
            <div>REF: {refCode}</div>
          </div>
        </div>
      );
    case 'official-luxury':
      return (
        <div className="border-b-[5px] border-double border-amber-900 mb-3 print:mb-2 pb-1.5 text-center bg-gradient-to-b from-amber-50/50 to-transparent">
          <h1 className="text-2xl print:text-xl font-serif text-amber-950 font-black mb-0.5 drop-shadow-sm">{companyNameAr}</h1>
          <h2 className="text-[10px] font-serif text-amber-700 mb-2 tracking-widest">{companyNameEn}</h2>
          <div className="flex justify-between items-center max-w-[95%] mx-auto mt-1" dir="ltr">
            <span className="text-[10px] print:text-[9px] text-amber-900 font-serif font-bold min-w-[80px] text-left">Ref: {refCode}</span>
            <div className="inline-block border-y-2 border-amber-800 py-1 px-8 bg-white shadow-sm mx-2">
               <h3 className="text-base print:text-sm font-bold text-amber-950" dir="rtl">{docTitle}</h3>
            </div>
            <span className="text-[10px] print:text-[9px] text-amber-900 font-serif font-bold min-w-[80px] text-right">Date: {dateStr}</span>
          </div>
        </div>
      );
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
        <div className="flex justify-between items-center border-b-[3px] border-black pb-2 mb-2 print:pb-0 print:mb-1">
          <div className="flex justify-start items-center pr-[2cm] print:pr-[2cm]">
            <img src="/swc-logo.jpg" alt="SWC Logo" className="max-h-20 print:max-h-16 object-contain" onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmM2Y0ZjYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2FjYWFjYSIgZHk9Ii4zZW0iPkxvZ288L3RleHQ+PC9zdmc+' }} />
          </div>
          <div className="text-center font-bold flex-1 px-2">
            <h3 className="text-2xl print:text-lg font-black m-0 leading-none pb-1">{docTitle}</h3>
            <h1 className="text-2xl print:text-lg m-0 leading-none">{companyNameAr} - {companyNameEn}</h1>
            {customCalcDate && <div className="text-xs font-bold text-slate-800 m-0 leading-none pt-1">تاريخ الاحتساب: {formatDateGB(customCalcDate)}</div>}
          </div>
          <div className="flex justify-end items-center pl-[2cm] print:pl-[2cm]">
            <img src="/adba-logo.jpg" alt="Adba Water" className="max-h-32 print:max-h-28 object-contain" onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmM2Y0ZjYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2FjYWFjYSIgZHk9Ii4zZW0iPkxvZ288L3RleHQ+PC9zdmc+' }} />
          </div>
        </div>
      );
  }
};
