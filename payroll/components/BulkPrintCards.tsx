import React from 'react';
import { Employee, Signatures } from '../types';
import { calculateEmployeeTotals, formatCurrency, getEmployeeFieldPhase } from '../utils/calculations';
import { Building, CheckCircle2, Printer } from 'lucide-react';

interface BulkPrintCardsProps {
  employees: Employee[];
  signatures: Signatures;
  sheetTitle: string;
  onClose: () => void;
  payrollPhase: 'full' | 'phase1' | 'phase2';
}

export const BulkPrintCards: React.FC<BulkPrintCardsProps> = ({
  employees,
  signatures,
  sheetTitle,
  onClose,
  payrollPhase
}) => {
  const activeEmployees = React.useMemo(() => {
    return employees.filter(emp => {
      const totals = calculateEmployeeTotals(emp, payrollPhase);
      return totals.netSalary > 0;
    });
  }, [employees, payrollPhase]);

  const handlePrint = () => {
    window.print();
  };

  // Helper to extract month and year from sheetTitle
  const getMonthYear = (title: string) => {
    const monthMatch = title.match(/شهر\s+([^\s]+)\s+(\d{4})/);
    if (monthMatch) {
      return `${monthMatch[1]} ${monthMatch[2]}`;
    }
    return "يوليو 2026";
  };

  const getPhaseText = () => {
    if (payrollPhase === 'phase1') return ' - المرحلة الأولى (Phase 1)';
    if (payrollPhase === 'phase2') return ' - المرحلة الثانية (Phase 2)';
    return '';
  };

  const periodLabel = getMonthYear(sheetTitle) + getPhaseText();

  return (
    <div id="bulk-print-wrapper" className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex flex-col items-center p-4 sm:p-8 overflow-y-auto font-sans" dir="rtl">
      {/* Control Bar */}
      <div id="bulk-print-controls" className="bg-white rounded-xl shadow-lg p-4 mb-6 flex items-center justify-between w-full max-w-4xl print:hidden sticky top-0 z-[110] border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 p-2 rounded-lg">
            <Building className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">معاينة كروت الرواتب ({activeEmployees.length} موظف)</h3>
            <p className="text-xs text-slate-500 font-medium">سيتم طباعة كل كرت في صفحة A5 مستقلة</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            type="button"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-black transition-all shadow-lg cursor-pointer active:scale-95"
          >
            <Printer className="w-5 h-5" />
            <span>بدء الطباعة</span>
          </button>
          <button
            onClick={onClose}
            type="button"
            className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-3 rounded-xl font-black transition-all cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>

      {/* Printable Area */}
      <div id="bulk-print-container" className="w-full max-w-[210mm] space-y-12 print:space-y-0 print:m-0 print:p-0 print:w-full">
        {activeEmployees.map((employee, index) => {
          const totals = calculateEmployeeTotals(employee, payrollPhase);

          const getFieldVal = (field: string) => {
            if (payrollPhase === 'full') return (employee as any)[field] || 0;
            const target = payrollPhase === 'phase1' ? '1' : '2';
            return getEmployeeFieldPhase(employee, field) === target ? (employee as any)[field] || 0 : 0;
          };

          return (
            <div 
              key={employee.id} 
              className="print:h-auto print:w-full print:page-break-after-always print:flex print:flex-col"
            >
              <div 
                className="bg-white w-full border border-slate-300 rounded-xl overflow-hidden print:border-none print:rounded-none print:shadow-none print:m-0 print:p-0 print:pt-4 print:h-auto shadow-xl relative card-print-container flex flex-col justify-between"
              >
                {/* Company Name */}
                <div className="px-4 pt-1 text-center mb-0">
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                    شركة المياه العذبة المحدوده
                  </h2>
                </div>

                {/* Employee Basic Details */}
                <div className="px-2 py-2 grid grid-cols-2 gap-2 text-sm">
                  <div className="text-right">
                    <p className="text-slate-400 font-bold text-[10px] mb-0.5 uppercase">الاسم</p>
                    <p className="text-slate-900 font-black text-xl leading-tight">{employee.name}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-slate-400 font-bold text-[10px] mb-0.5 uppercase">الوظيفة - الفرع</p>
                    <p className="text-slate-800 font-black text-lg leading-tight">{employee.jobTitle} - {employee.branch}</p>
                  </div>
                </div>

                {/* Breakdown Table */}
                <div className="px-2 pb-2 flex-grow flex flex-col">
                  <div className="grid grid-cols-2 gap-0 border-2 border-slate-400 shadow-sm flex-grow">
                    {/* Entitlements Column */}
                    <div className="border-l-2 border-slate-400 flex flex-col justify-between">
                      <div>
                        <div className="bg-slate-100 text-slate-900 font-black p-4 border-b-2 border-slate-400 text-center text-sm">
                          الاستحقاقات
                        </div>
                        {[
                          { label: 'الراتب الأساسي', labelEn: 'Basic Salary', value: getFieldVal('basicSalary') },
                          { label: 'إضافي', labelEn: 'Overtime', value: getFieldVal('overtime') },
                          { label: 'بدل الاتصال', labelEn: 'Comm. Allowance', value: getFieldVal('communicationAllowance') },
                          { label: 'بدل السكن', labelEn: 'Housing Allowance', value: getFieldVal('housingAllowance') },
                          { label: 'بدل الطعام', labelEn: 'Food Allowance', value: getFieldVal('foodAllowance') },
                          { label: 'بدل الانتقال', labelEn: 'Trans. Allowance', value: getFieldVal('transportationAllowance') },
                          { label: 'عمولة', labelEn: 'Commission', value: getFieldVal('commission') },
                          { label: 'مكافأة / بدلات أخرى', labelEn: 'Bonus / Others', value: getFieldVal('bonus') },
                        ].filter(item => (item.value || 0) > 0).map((item, idx) => (
                          <div key={idx} className="flex justify-between p-4 border-b border-slate-200 text-[13px]">
                            <span className="text-slate-700 font-extrabold">{item.label}</span>
                            <span className="font-mono font-black">{formatCurrency(item.value)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between p-3 bg-emerald-50 font-black text-[13px] text-emerald-900 border-t-2 border-slate-400">
                        <span>إجمالي الاستحقاقات</span>
                        <span className="font-mono">{formatCurrency(totals.totalEntitlements)}</span>
                      </div>
                    </div>

                    {/* Deductions Column */}
                    <div className="flex flex-col justify-between">
                      <div>
                        <div className="bg-slate-100 text-slate-900 font-black p-4 border-b-2 border-slate-400 text-center text-sm">
                          الاستقطاعات
                        </div>
                        {[
                          { label: 'التأمينات', labelEn: 'Insurance', value: employee.hasInsurance !== false ? getFieldVal('insuranceDeduction') : 0 },
                          { label: 'خصم', labelEn: 'Deduction', value: getFieldVal('generalDeduction') },
                          { label: 'سلفة', labelEn: 'Loan', value: getFieldVal('loan') },
                          { label: 'غيابات', labelEn: 'Absence', value: getFieldVal('absenceDeduction') },
                        ].filter(item => (item.value || 0) > 0).map((item, idx) => (
                          <div key={idx} className="flex justify-between p-4 border-b border-slate-200 text-[13px]">
                            <span className="text-slate-700 font-extrabold">{item.label}</span>
                            <span className="font-mono font-black text-rose-600">{formatCurrency(item.value)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between p-3 bg-rose-50 font-black text-[13px] text-rose-900 border-t-2 border-slate-400">
                        <span>إجمالي الاستقطاعات</span>
                        <span className="font-mono">{formatCurrency(totals.totalDeductions)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Net Result Bar - Repurposed for Overtime */}
                <div className="mx-2 p-2 border-4 border-slate-900 bg-white rounded-xl flex items-center justify-between mb-2 shadow-md">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-8 h-8 text-blue-600" />
                    <div className="flex flex-col">
                      <span className="font-black text-lg text-slate-900 uppercase">الصافي لشهر ({periodLabel})</span>
                      <span className="font-bold text-[10px] text-slate-500 leading-none">Net Salary for July 2026</span>
                    </div>
                  </div>
                  <div className="text-3xl font-black font-mono text-slate-900">
                    {formatCurrency(totals.netSalary)}
                  </div>
                </div>

                {/* Signature area */}
                <div className="px-2 pb-1 grid grid-cols-2 gap-10 text-center text-[10px]">
                  <div className="flex flex-col items-center">
                    <p className="font-black text-slate-700 mb-6 uppercase tracking-widest text-[12px]">توقيع الموظف</p>
                    <div className="border-t-2 border-dashed border-slate-400 w-full max-w-[150px]"></div>
                  </div>
                  <div className="flex flex-col items-center">
                    <p className="font-black text-slate-700 mb-6 uppercase tracking-widest text-[12px]">اعتماد المحاسبة</p>
                    <p className="font-black text-slate-900 text-sm mb-1">{signatures.accountsManager === 'علاء أحمد عنتر المرشدي' ? '' : signatures.accountsManager}</p>
                    <div className="border-t-2 border-dashed border-slate-400 w-full max-w-[150px]"></div>
                  </div>
                </div>
                
                {/* Page Numbering for Print */}
                <div className="absolute bottom-2 left-4 text-[8px] text-slate-300 hidden print:block">
                  صفحة {index + 1} من {activeEmployees.length}
                </div>
              </div>
              {/* Bottom half spacer for print */}
              <div className="hidden print:block print:flex-1"></div>
            </div>
          );
        })}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin-top: 0;
            margin-bottom: 0;
            margin-right: 1cm;
            margin-left: 1cm;
          }
          /* Visibility trick to print only specific element */
          body * {
            visibility: hidden;
          }
          #bulk-print-wrapper, #bulk-print-wrapper * {
            visibility: visible;
          }
          body {
            zoom: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }
          /* Reset all positioning contexts on ancestors */
          html, body, #root, div.fixed.inset-0, div.fixed.inset-0 > div {
            position: static !important;
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: none !important;
            width: 100% !important;
            height: auto !important;
            transform: none !important;
            filter: none !important;
            backdrop-filter: none !important;
            background: none !important;
            box-shadow: none !important;
            border: none !important;
          }
          #bulk-print-wrapper {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            z-index: 9999 !important;
            display: block !important;
          }
          #bulk-print-controls, #bulk-print-controls * {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
          }
          .print-hidden, .print\\:hidden {
            display: none !important;
            visibility: hidden !important;
          }
          #bulk-print-container {
            max-width: none !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print\\:page-break-after-always {
            page-break-after: always !important;
          }
          /* Ensure the card itself is at the top with reduced height (from 185mm to 145mm) */
          .card-print-container {
            height: auto !important;
            min-height: 145mm !important;
            width: 100% !important;
            box-sizing: border-box !important;
            padding-top: 1cm !important;
            padding-left: 1cm !important;
            padding-right: 1cm !important;
            padding-bottom: 4mm !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
          }
        }
      `}} />
    </div>
  );
};
