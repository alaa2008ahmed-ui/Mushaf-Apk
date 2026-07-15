import React, { useState, useMemo, useEffect } from 'react';
import { 
  Download, 
  Info, 
  Calendar, 
  Building, 
  CreditCard, 
  FileText, 
  CheckCircle, 
  HelpCircle,
  FileSpreadsheet,
  Layers,
  Sparkles
} from 'lucide-react';
import { Employee, Signatures } from '../types';
import { calculateEmployeeTotals, formatCurrency, getEmployeeFieldPhase } from '../utils/calculations';
import * as XLSX from 'xlsx';

interface BankPayrollFileProps {
  employees: Employee[];
  sheetTitle: string;
  signatures: Signatures;
  payrollPhase: 'full' | 'phase1' | 'phase2';
  selectedMonth?: string;
}

export const BankPayrollFile: React.FC<BankPayrollFileProps> = ({
  employees,
  sheetTitle,
  signatures,
  payrollPhase,
  selectedMonth
}) => {
  // Configurable state parameters with default values mirroring the image
  const [bankCode, setBankCode] = useState<string>('ARNB'); // Al Rajhi Bank (ARNB)
  const [employerAccount, setEmployerAccount] = useState<string>('0108004102880011');
  const [fileSequence, setFileSequence] = useState<string>('2222');
  const [employerId, setEmployerId] = useState<string>('4-278');
  const [referenceDateStr, setReferenceDateStr] = useState<string>('29062026.105');
  
  // Format payment date based on current sheetTitle or default
  const [paymentDate, setPaymentDate] = useState<string>(() => {
    // Return standard format DDMMYYYY (e.g. 30062026 for June 30, 2026)
    const today = new Date();
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const dd = String(lastDayOfMonth.getDate()).padStart(2, '0');
    const mm = String(lastDayOfMonth.getMonth() + 1).padStart(2, '0');
    const yyyy = lastDayOfMonth.getFullYear();
    return `${dd}${mm}${yyyy}`;
  });

  const [paymentDesc, setPaymentDesc] = useState<string>(() => {
    const today = new Date();
    const monthsEn = [
      'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 
      'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
    ];
    return `SALARY OF ${monthsEn[today.getMonth()]} ${today.getFullYear()}`;
  });

  // Dynamic automatic update when selectedMonth changes
  useEffect(() => {
    if (!selectedMonth) return;
    const parts = selectedMonth.split('-');
    if (parts.length === 2) {
      const year = parseInt(parts[0], 10);
      const monthZeroBased = parseInt(parts[1], 10) - 1;
      
      const monthsEn = [
        'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 
        'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
      ];
      const monthName = monthsEn[monthZeroBased] || 'JULY';
      setPaymentDesc(`SALARY OF ${monthName} ${year}`);
      
      // Also auto-update payment date to the last day of that selected month
      const lastDay = new Date(year, monthZeroBased + 1, 0);
      const dd = String(lastDay.getDate()).padStart(2, '0');
      const mm = String(lastDay.getMonth() + 1).padStart(2, '0');
      const yyyy = lastDay.getFullYear();
      setPaymentDate(`${dd}${mm}${yyyy}`);
    }
  }, [selectedMonth]);

  // Calculate row records
  const processedRecords = useMemo(() => {
    return employees
      .filter(emp => {
        const name = (emp.name || '').trim();
        const hasValidName = name !== '';

        if (!hasValidName) return false;

        // Only include if net salary in this phase is > 0 OR if employee is inactive
        const t = calculateEmployeeTotals(emp, payrollPhase);
        return t.netSalary > 0 || emp.isActive === false;
      })
      .map(emp => {
      const totals = calculateEmployeeTotals(emp, payrollPhase);
      
      const isFull = payrollPhase === 'full';
      const targetPhase = payrollPhase === 'phase1' ? '1' : '2';
      const showItem = (fieldName: string) => isFull || getEmployeeFieldPhase(emp, fieldName) === targetPhase;

      const isInactive = emp.isActive === false;

      const basic = isInactive ? 0 : (showItem('basicSalary') ? (emp.basicSalary || 0) : 0);
      const housing = isInactive ? 0 : (showItem('housingAllowance') ? (emp.housingAllowance || 0) : 0);

      const otherAllowances = isInactive ? 0 : (
        (showItem('communicationAllowance') ? (emp.communicationAllowance || 0) : 0) +
        (showItem('foodAllowance') ? (emp.foodAllowance || 0) : 0) +
        (showItem('transportationAllowance') ? (emp.transportationAllowance || 0) : 0) +
        (showItem('commission') ? (emp.commission || 0) : 0) +
        (showItem('bonus') ? (emp.bonus || 0) : 0) +
        (showItem('overtime') ? (emp.overtime || 0) : 0)
      );

      // Deductions: sum of insurance + general + loan + absence
      const deductions = isInactive ? 0 : totals.totalDeductions;

      // Net salary
      const net = isInactive ? 0 : totals.netSalary;

      return {
        employee: emp,
        recordType: 'D',
        netSalary: net,
        iban: emp.iban || 'SA0000000000000000000000',
        englishName: emp.nameEn || emp.name || '',
        bankIdentifier: bankCode,
        paymentDesc: paymentDesc,
        basicSalary: basic,
        housingAllowance: housing,
        otherAllowances: otherAllowances,
        deductions: deductions,
        nationalId: emp.nationalId || '1000000000'
      };
    });
  }, [employees, bankCode, paymentDesc, payrollPhase]);

  // Aggregate totals of net salary
  const totalNetSalaries = useMemo(() => {
    return processedRecords.reduce((sum, rec) => sum + rec.netSalary, 0);
  }, [processedRecords]);

  // Generate text file contents (WPS Standard)
  const handleDownloadWPS = () => {
    // Header Row values
    const headerRow = [
      'H',
      bankCode,
      fileSequence,
      'N',
      referenceDateStr,
      employerAccount,
      'SAR',
      paymentDate,
      totalNetSalaries.toFixed(2),
      paymentDate,
      employerId
    ].join(',');

    // Detail Rows
    const detailRows = processedRecords.map(rec => [
      rec.recordType,
      rec.netSalary.toFixed(2),
      rec.iban.replace(/\s+/g, ''), // Strip spaces from IBAN
      rec.englishName.replace(/,/g, ''), // Ensure no commas in English Name
      rec.bankIdentifier,
      rec.paymentDesc.replace(/,/g, ''),
      rec.basicSalary.toFixed(2),
      rec.housingAllowance.toFixed(2),
      rec.otherAllowances.toFixed(2),
      rec.deductions.toFixed(2),
      rec.nationalId
    ].join(','));

    const fileContent = [headerRow, ...detailRows].join('\n');
    
    // Create download link
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Create clean file name based on paymentDate
    link.href = url;
    link.download = `WPS_${bankCode}_${paymentDate}_${fileSequence}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export to Excel Workbook with RTL formatting and Header information
  const handleExportToExcel = () => {
    // Construct layout data for Excel Sheet
    const wsData = [
      ["كشف رواتب البنك وحماية الأجور (WPS) - مسير الرواتب الفعلي"],
      [],
      ["ملخص بيانات الملف (Header Information)"],
      ["رمز البنك (Bank Code)", bankCode, "رقم تسلسل الملف (Sequence)", fileSequence],
      ["حساب المنشأة (Employer Account)", employerAccount, "تاريخ الصرف (Value Date)", paymentDate],
      ["بيان الراتب (Description)", paymentDesc, "رقم الهوية الوطنية / كود الملف", employerId],
      ["إجمالي الرواتب الصافية", totalNetSalaries, "عدد الموظفين", processedRecords.length],
      [],
      ["تفاصيل رواتب الموظفين (Detail Records)"],
      [
        "نوع السجل",
        "صافي الراتب (ر.س)",
        "رقم الآيبان الدولي (IBAN)",
        "اسم الموظف بالإنجليزية",
        "كود البنك المستلم",
        "بيان الدفعة",
        "الراتب الأساسي (ر.س)",
        "بدل السكن (ر.س)",
        "البدلات الأخرى (ر.س)",
        "الاستقطاعات والخصم (ر.س)",
        "رقم الهوية / الإقامة"
      ]
    ];

    // Add detail rows
    processedRecords.forEach(rec => {
      wsData.push([
        rec.recordType,
        rec.netSalary,
        rec.iban.replace(/\s+/g, ''), // Strip spaces from IBAN
        rec.englishName,
        rec.bankIdentifier,
        rec.paymentDesc,
        rec.basicSalary,
        rec.housingAllowance,
        rec.otherAllowances,
        rec.deductions,
        rec.nationalId
      ]);
    });

    // Create Worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Set direction to RTL for Arabic Excel interface
    if (!ws['!views']) ws['!views'] = [];
    ws['!views'].push({ RTL: true });

    // Set professional column widths
    ws['!cols'] = [
      { wch: 10 }, // Record Type
      { wch: 15 }, // Net Salary
      { wch: 30 }, // IBAN
      { wch: 35 }, // English Name
      { wch: 15 }, // Bank Code
      { wch: 25 }, // Description
      { wch: 15 }, // Basic
      { wch: 15 }, // Housing
      { wch: 15 }, // Others
      { wch: 15 }, // Deductions
      { wch: 20 }, // National ID
    ];

    // Create Workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ملف البنك وحماية الأجور");

    // Save/write the file
    XLSX.writeFile(wb, `WPS_Payroll_${bankCode}_${paymentDate}.xlsx`);
  };

  useEffect(() => {
    const handleExport = () => {
      handleExportToExcel();
    };
    const handleDownload = () => {
      handleDownloadWPS();
    };

    window.addEventListener('trigger-bank-export-excel', handleExport);
    window.addEventListener('trigger-bank-download-wps', handleDownload);

    return () => {
      window.removeEventListener('trigger-bank-export-excel', handleExport);
      window.removeEventListener('trigger-bank-download-wps', handleDownload);
    };
  }, [processedRecords, bankCode, paymentDate, fileSequence, employerAccount, employerId, paymentDesc]);

  return (
    <div className="px-4 sm:px-6 py-6 font-sans space-y-6" dir="ltr">
      
      {/* Grid of editable parameter cards */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
            <Building className="w-3.5 h-3.5 text-emerald-600" />
            <span>رمز البنك</span>
          </label>
          <select
            value={bankCode}
            onChange={(e) => setBankCode(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ARNB">مصرف الراجحي</option>
            <option value="ANB">البنك العربي الوطني</option>
            <option value="ALBI">بنك البلاد</option>
            <option value="SABB">البنك الأول ساب</option>
            <option value="SNB">البنك الأهلي السعودي</option>
            <option value="BJAZ">بنك الجزيرة</option>
            <option value="BSFR">البنك السعودي الفرنسي</option>
            <option value="SIBG">البنك السعودي للاستثمار</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
            <span>حساب المنشأة</span>
          </label>
          <input
            type="text"
            value={employerAccount}
            onChange={(e) => setEmployerAccount(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>رقم تسلسل الملف</span>
          </label>
          <input
            type="text"
            value={fileSequence}
            onChange={(e) => setFileSequence(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>تاريخ الصرف</span>
          </label>
          <input
            type="text"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            placeholder="اليوم-الشهر-السنة"
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>بيان الراتب</span>
          </label>
          <input
            type="text"
            value={paymentDesc}
            onChange={(e) => setPaymentDesc(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>رقم الهوية الوطنية / كود الملف</span>
          </label>
          <input
            type="text"
            value={employerId}
            onChange={(e) => setEmployerId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

      </div>

      {/* Main Excel-style visual sheet */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
        
        {/* Table Title and Metadata Summary Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <h3 className="font-extrabold text-slate-800 text-base">جدول حماية الأجور والرواتب الفعلي للبنك</h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Stats */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-600">
              <div className="bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5">
                إجمالي الصافي: <span className="font-mono text-emerald-700 text-sm">{formatCurrency(totalNetSalaries)}</span> ر.س
              </div>
              <div className="bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5">
                عدد الموظفين: <span className="font-mono text-blue-700 text-sm">{processedRecords.length}</span> موظف
              </div>
            </div>
          </div>
        </div>

        {/* Excel layout viewport */}
        <div className="overflow-x-auto max-w-full">
          <table className="w-full border-collapse border-slate-300 text-[13px] font-sans">
            
            {/* Clean Professional Table Header */}
            <thead>
              <tr className="bg-slate-800 text-white font-extrabold text-xs text-center border-b border-slate-700">
                <th className="w-12 py-3 border-l border-slate-700 bg-slate-900 text-slate-300">م</th>
                <th className="px-3 py-3 border-l border-slate-700">نوع السجل</th>
                <th className="px-3 py-3 border-l border-slate-700">صافي الراتب</th>
                <th className="px-3 py-3 border-l border-slate-700">رقم الآيبان الدولي</th>
                <th className="px-3 py-3 border-l border-slate-700">اسم الموظف بالإنجليزية</th>
                <th className="px-3 py-3 border-l border-slate-700">كود البنك المستلم</th>
                <th className="px-3 py-3 border-l border-slate-700">بيان الدفعة</th>
                <th className="px-3 py-3 border-l border-slate-700">الراتب الأساسي</th>
                <th className="px-3 py-3 border-l border-slate-700">بدل السكن</th>
                <th className="px-3 py-3 border-l border-slate-700">البدلات الأخرى</th>
                <th className="px-3 py-3 border-l border-slate-700">الاستقطاعات والخصم</th>
                <th className="px-3 py-3 border-slate-700">رقم الهوية / الإقامة</th>
              </tr>
            </thead>

            <tbody>
              
              {/* Row 1: Header Line (H Record) - Styled to standout exactly like the image */}
              <tr className="hover:bg-amber-50/50 bg-amber-50/20 border-b border-slate-300 text-center font-mono text-xs">
                <td className="bg-slate-200/50 border-l border-r border-slate-300 text-slate-400 font-bold text-center">-</td>
                <td className="px-3 py-3 border-l border-slate-300 font-bold text-blue-600">H</td>
                <td className="px-3 py-3 border-l border-slate-300 font-bold text-emerald-700">{bankCode}</td>
                <td className="px-3 py-3 border-l border-slate-300 text-slate-700">{fileSequence}</td>
                <td className="px-3 py-3 border-l border-slate-300 text-slate-500 text-center font-sans">N</td>
                <td className="px-3 py-3 border-l border-slate-300 font-semibold text-slate-700">{referenceDateStr}</td>
                <td className="px-3 py-3 border-l border-slate-300 text-slate-800 font-semibold">{employerAccount}</td>
                <td className="px-3 py-3 border-l border-slate-300 text-slate-500 font-sans">SAR</td>
                <td className="px-3 py-3 border-l border-slate-300 text-slate-700">{paymentDate}</td>
                <td className="px-3 py-3 border-l border-slate-300 font-bold text-slate-900 bg-amber-100/50">{totalNetSalaries.toFixed(2)}</td>
                <td className="px-3 py-3 border-l border-slate-300 text-slate-700">{paymentDate}</td>
                <td className="px-3 py-3 border-slate-300 text-slate-700">{employerId}</td>
              </tr>

              {/* Detail Records (D rows) */}
              {processedRecords.map((rec, index) => {
                return (
                  <tr key={rec.employee.id} className="hover:bg-slate-50 border-b border-slate-300 even:bg-slate-50/40 text-center transition-all">
                    {/* Row Index */}
                    <td className="bg-slate-200/50 border-l border-r border-slate-300 text-slate-600 font-bold font-mono text-center">{index + 1}</td>
                    
                    {/* A: Record Type */}
                    <td className="px-3 py-2.5 border-l border-slate-300 font-mono font-bold text-slate-500">
                      {rec.recordType}
                    </td>

                    {/* B: Net Salary */}
                    <td className="px-3 py-2.5 border-l border-slate-300 font-mono font-bold text-emerald-700">
                      {formatCurrency(rec.netSalary)}
                    </td>

                    {/* C: IBAN */}
                    <td className="px-3 py-2.5 border-l border-slate-300 font-mono text-left" dir="ltr">
                      {rec.iban === 'SA0000000000000000000000' || !rec.iban || rec.iban.trim() === '' ? (
                        <span className="text-rose-600 font-extrabold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 text-[10px]">SA0000000000000000000000 (ناقص)</span>
                      ) : (
                        <span className="text-slate-800">{rec.iban}</span>
                      )}
                    </td>

                    {/* D: English Name */}
                    <td className="px-3 py-2.5 border-l border-slate-300 text-slate-900 text-left font-semibold font-sans pr-4">
                      {rec.englishName}
                    </td>

                    {/* E: Bank Identifier */}
                    <td className="px-3 py-2.5 border-l border-slate-300 font-mono text-slate-500">
                      {rec.bankIdentifier}
                    </td>

                    {/* F: Payment Description */}
                    <td className="px-3 py-2.5 border-l border-slate-300 text-slate-500 text-left max-w-[180px] truncate" title={rec.paymentDesc}>
                      {rec.paymentDesc}
                    </td>

                    {/* G: Basic Salary */}
                    <td className="px-3 py-2.5 border-l border-slate-300 font-mono font-semibold text-slate-700">
                      {formatCurrency(rec.basicSalary)}
                    </td>

                    {/* H: Housing Allowance */}
                    <td className="px-3 py-2.5 border-l border-slate-300 font-mono text-slate-700">
                      {formatCurrency(rec.housingAllowance)}
                    </td>

                    {/* I: Other Allowances */}
                    <td className="px-3 py-2.5 border-l border-slate-300 font-mono text-slate-700">
                      {formatCurrency(rec.otherAllowances)}
                    </td>

                    {/* J: Deductions */}
                    <td className="px-3 py-2.5 border-l border-slate-300 font-mono text-rose-600">
                      {formatCurrency(rec.deductions)}
                    </td>

                    {/* K: National ID / Iqama */}
                    <td className="px-3 py-2.5 border-slate-300 font-mono font-medium text-left" dir="ltr">
                      {rec.nationalId === '1000000000' || !rec.nationalId || rec.nationalId.trim() === '' || rec.nationalId.length < 9 ? (
                        <span className="text-rose-600 font-extrabold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 text-[10px]">{rec.nationalId || '1000000000'} (ناقص)</span>
                      ) : (
                        <span className="text-slate-800">{rec.nationalId}</span>
                      )}
                    </td>
                  </tr>
                );
              })}

            </tbody>

          </table>
        </div>

        {/* Informative Tip Cards */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex flex-col md:flex-row items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2 text-emerald-800 font-semibold shrink-0">
            <Info className="w-4 h-4 text-emerald-600" />
            <span>توجيهات رفع الملف البنكي:</span>
          </div>
          <p className="leading-relaxed">
            عند حفظ هذا الكشف بصيغة ملف نصي، يتم فصل الحقول بفواصل عادية ووضع السجل الرأسي في السطر الأول. تأكد من تطابق رقم حساب المنشأة والآيبان مع حسابات الموظفين الحقيقية قبل الرفع للمصرف لتفادي حدوث أي أخطاء في الرفض الآلي.
          </p>
        </div>

      </div>

    </div>
  );
};
