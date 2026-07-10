import React from 'react';
import { X, Printer, FileText, CheckCircle2, Building, Calendar, UserCheck } from 'lucide-react';
import { Employee, Signatures } from '../types';
import { calculateEmployeeTotals, formatCurrency, getEmployeeFieldPhase } from '../utils/calculations';

interface PaySlipModalProps {
  employee: Employee | null;
  onClose: () => void;
  signatures: Signatures;
  sheetTitle: string;
  payrollPhase: 'full' | 'phase1' | 'phase2';
  selectedMonth: string;
}

export const PaySlipModal: React.FC<PaySlipModalProps> = ({
  employee,
  onClose,
  signatures,
  sheetTitle,
  payrollPhase,
  selectedMonth
}) => {
  if (!employee) return null;

  const totals = calculateEmployeeTotals(employee, payrollPhase);

  const getFieldVal = (field: string) => {
    if (payrollPhase === 'full') return (employee as any)[field] || 0;
    const target = payrollPhase === 'phase1' ? '1' : '2';
    return getEmployeeFieldPhase(employee, field) === target ? (employee as any)[field] || 0 : 0;
  };

  const getPhaseText = () => {
    if (payrollPhase === 'phase1') return ' - المرحلة الأولى (Phase 1)';
    if (payrollPhase === 'phase2') return ' - المرحلة الثانية (Phase 2)';
    return '';
  };

  const getFormattedMonth = () => {
    if (!selectedMonth || !/^\d{4}-\d{2}$/.test(selectedMonth)) return selectedMonth;
    const [y, m] = selectedMonth.split('-').map(Number);
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    return `${months[m - 1]} ${y}`;
  };

  const handlePrint = () => {
    try {
      window.focus();
      setTimeout(() => {
        window.print();
      }, 150);
    } catch (e) {
      console.error("Print failed:", e);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex justify-center items-start z-50 p-4 sm:p-6 md:p-10 overflow-y-auto font-sans" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full overflow-hidden flex flex-col border border-slate-200 print:shadow-none print:border-none print:max-w-none print:rounded-none my-auto">
        
        {/* Modal Top Bar (Hidden in print) */}
        <div className="bg-white text-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-200 shadow-2xs print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold">قسيمة تفاصيل الراتب المباشرة (Pay Slip)</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة القسيمة</span>
            </button>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pay Slip Content (Printable area) */}
        <div id="individual-slip-modal-content" className="p-4 sm:p-6 space-y-3 print:px-2 print:pt-10 print:pb-4 bg-white">
          
          {/* Company Name */}
          <div className="border-b-4 border-slate-800 pb-1 text-center">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              شركة المياه العذبة المحدوده
            </h2>
          </div>

          {/* Employee Basic Info Grid */}
          <div className="bg-slate-50 rounded-2xl p-4 border-2 border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-y-3 gap-x-8 text-sm font-sans shadow-sm">
            <div className="col-span-2 sm:col-span-2">
              <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest">اسم الموظف</p>
              <p className="text-slate-900 font-black text-xl mt-1">{employee.name}</p>
            </div>
            <div>
              <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest">الوظيفة</p>
              <p className="text-slate-800 font-black text-lg mt-1">{employee.jobTitle}</p>
            </div>
            <div>
              <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest">الإدارة - الفرع</p>
              <p className="text-slate-800 font-black text-lg mt-1">{employee.branch}</p>
            </div>
            <div>
              <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest">رقم الهوية</p>
              <p className="text-slate-800 font-mono font-black text-lg mt-1">{employee.nationalId || '-'}</p>
            </div>
            <div>
              <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest">تاريخ التعيين</p>
              <p className="text-slate-800 font-mono font-black text-lg mt-1">{employee.hireDate || '-'}</p>
            </div>
            <div>
              <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest">الجنسية</p>
              <p className="text-slate-800 font-black text-lg mt-1">{employee.nationality || '-'}</p>
            </div>
            <div>
              <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest">نهاية الخدمة</p>
              <p className="text-slate-800 font-mono font-black text-lg mt-1">{employee.endOfServicePaid ? formatCurrency(employee.endOfServicePaid) + ' ر.س' : '0 ر.س'}</p>
            </div>
          </div>

          {/* 2-Column Breakdown: Entitlements vs Deductions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            
            {/* Column 1: Entitlements */}
            <div className="border border-emerald-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-emerald-600 text-white px-3 py-4 font-extrabold text-sm flex items-center justify-between">
                <span>الاستحقاقات المالية</span>
                <span>المبلغ</span>
              </div>
              <div className="divide-y divide-emerald-100 p-2 space-y-1 text-xs">
                {[
                  { label: 'الراتب الأساسي', value: getFieldVal('basicSalary') },
                  { label: 'إضافي', value: getFieldVal('overtime') },
                  { label: 'بدل اتصال', value: getFieldVal('communicationAllowance') },
                  { label: 'بدل سكن', value: getFieldVal('housingAllowance') },
                  { label: 'بدل طعام', value: getFieldVal('foodAllowance') },
                  { label: 'بدل مواصلات', value: getFieldVal('transportationAllowance') },
                  { label: 'عمولة مبيعات', value: getFieldVal('commission') },
                  { label: 'مكافأة / بدلات أخرى', value: getFieldVal('bonus') },
                ].filter(item => (item.value || 0) > 0).map((item, idx) => (
                  <div key={idx} className="flex justify-between py-4 items-center">
                    <span className="text-slate-600 font-extrabold">{item.label}</span>
                    <span className="font-mono font-extrabold text-slate-800 text-sm">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
              <div className="bg-emerald-50 px-3 py-4 border-t border-emerald-200 flex justify-between font-extrabold text-emerald-900 text-sm mt-auto">
                <span>إجمالي الاستحقاقات</span>
                <span className="font-mono">{formatCurrency(totals.totalEntitlements)}</span>
              </div>
            </div>

            {/* Column 2: Deductions */}
            <div className="border border-rose-200 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
              <div>
                <div className="bg-rose-600 text-white px-3 py-4 font-extrabold text-sm flex items-center justify-between">
                  <span>الاستقطاعات والخصومات</span>
                  <span>المبلغ</span>
                </div>
                <div className="divide-y divide-rose-100 p-2 space-y-2 text-xs">
                  {[
                    { label: 'خصم نسبة التأمينات', value: employee.hasInsurance !== false ? getFieldVal('insuranceDeduction') : 0 },
                    { label: 'خصم عام / جزاءات', value: getFieldVal('generalDeduction') },
                    { label: 'سلفة مالية', value: getFieldVal('loan') },
                    { label: 'غيابات', value: getFieldVal('absenceDeduction') },
                  ].filter(item => (item.value || 0) > 0).map((item, idx) => (
                    <div key={idx} className="flex justify-between py-4 items-center">
                      <span className="text-slate-600 font-extrabold">{item.label}</span>
                      <span className="font-mono font-extrabold text-rose-800 text-sm">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-rose-50 px-3 py-4 border-t border-rose-200 flex justify-between font-extrabold text-rose-900 text-sm mt-auto">
                <span>إجمالي الاستقطاعات</span>
                <span className="font-mono">{formatCurrency(totals.totalDeductions)}</span>
              </div>
            </div>

          </div>

          {/* Prominent Net Payable Box - Repurposed for Overtime */}
          <div id="individual-slip-print" className="bg-white border-4 border-slate-900 text-slate-900 rounded-3xl p-6 shadow-sm flex items-center justify-between my-4">
            <div className="flex items-center gap-6">
              <div className="bg-blue-100 text-blue-600 p-5 rounded-2xl border-2 border-blue-200">
                <Printer className="w-12 h-12" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-black uppercase tracking-widest mb-1">
                  الصافي لشهر ({getFormattedMonth()}){getPhaseText()}
                </p>
                <p className="text-5xl font-black text-slate-900 font-mono tracking-tight">
                  {formatCurrency(totals.netSalary)}
                </p>
              </div>
            </div>
            <div className="text-left hidden sm:block">
              <div className="bg-blue-50 text-blue-700 border-2 border-blue-200 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-sm">
                كشف الراتب المعتمد
              </div>
            </div>
          </div>

          {/* Signature lines for the slip */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-10 text-center font-sans text-[10px] pb-2">
            <div className="flex flex-col items-center">
              <p className="font-extrabold text-slate-600 mb-6 uppercase tracking-widest text-[12px]">توقيع الموظف</p>
              <div className="border-t border-dashed border-slate-400 w-full max-w-[150px] mt-4"></div>
            </div>
            <div className="flex flex-col items-center">
              <p className="font-extrabold text-slate-600 mb-6 uppercase tracking-widest text-[12px]">اعتماد المحاسبة</p>
              <p className="font-black text-slate-900 text-sm mb-1">{signatures.accountsManager === 'علاء أحمد عنتر المرشدي' ? '' : signatures.accountsManager}</p>
              <div className="border-t border-dashed border-slate-400 w-full max-w-[150px] mt-4"></div>
            </div>
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
              body * {
                visibility: hidden;
              }
              #individual-slip-modal-content, #individual-slip-modal-content * {
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
              #individual-slip-modal-content {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                box-sizing: border-box !important;
                height: auto !important;
                min-height: 145mm !important;
                background: white !important;
                padding-top: 1cm !important;
                padding-left: 1cm !important;
                padding-right: 1cm !important;
                padding-bottom: 4mm !important;
                margin: 0 !important;
                z-index: 9999 !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: space-between !important;
              }
              .print\\:hidden {
                display: none !important;
                visibility: hidden !important;
              }
            }
          `}} />

        </div>

      </div>
    </div>
  );
};
