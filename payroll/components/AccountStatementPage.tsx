import React, { useState, useMemo } from 'react';
import { ArchivedMonth, Employee, ViewMode } from '../types';
import { ArrowRight, Layers, FileText, Calendar, Filter, Printer, Download, User } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';

interface AccountStatementPageProps {
  archives: ArchivedMonth[];
  currentEmployees: Employee[];
  currentMonthName: string;
  onViewChange: (mode: ViewMode) => void;
  signatures: any;
}

export const AccountStatementPage: React.FC<AccountStatementPageProps> = ({
  archives,
  currentEmployees,
  currentMonthName,
  onViewChange,
  signatures
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<string[]>(['netSalary']);
  const [dateRange, setDateRange] = useState<{ start: string, end: string }>({ start: '', end: '' });

  // Get all available months (archives only as requested)
  const allMonths = useMemo(() => {
    const months = archives.map(a => {
      const originalName = a.monthName || '';
      // Shorten month name if it contains the long phrase
      const shortenedName = originalName.replace(/اجمالي\s+الراتب\s+والبدلات\s+والاضافي\s+للعاملين\s+عن\s+شهر/gi, 'راتب شهر');
      return {
        id: a.id,
        name: shortenedName,
        date: new Date(a.monthIso || a.archivedAt),
        employees: a.employees,
        isCurrent: false
      };
    });

    // Sort chronologically
    return months.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [archives]);

  const allEmployeesList = useMemo(() => {
    const empMap = new Map<number, Employee>();
    allMonths.forEach(m => {
      m.employees.forEach(e => {
        if (!empMap.has(e.id)) {
          empMap.set(e.id, e);
        }
      });
    });
    return Array.from(empMap.values());
  }, [allMonths]);

  const itemsList = [
    { id: 'basicSalary', label: 'الراتب الأساسي', type: 'entitlement' },
    { id: 'overtime', label: 'الإضافي', type: 'entitlement' },
    { id: 'communicationAllowance', label: 'بدل الاتصال', type: 'entitlement' },
    { id: 'housingAllowance', label: 'بدل السكن', type: 'entitlement' },
    { id: 'foodAllowance', label: 'بدل الطعام', type: 'entitlement' },
    { id: 'transportationAllowance', label: 'بدل الانتقال', type: 'entitlement' },
    { id: 'commission', label: 'العمولة', type: 'entitlement' },
    { id: 'bonus', label: 'المكافأة (بدلات أخرى)', type: 'entitlement' },
    { id: 'insuranceDeduction', label: 'خصم التأمينات', type: 'deduction' },
    { id: 'generalDeduction', label: 'خصم عام / جزاءات', type: 'deduction' },
    { id: 'loan', label: 'سلفة', type: 'deduction' },
    { id: 'absenceDeduction', label: 'خصم الغياب', type: 'deduction' },
    { id: 'netSalary', label: 'صافي الراتب', type: 'net' }
  ];

  const handlePrint = () => {
    window.print();
  };

  const toggleItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Filter months based on dateRange
  const filteredMonths = useMemo(() => {
    let result = allMonths;
    const startMonth = allMonths.find(m => m.id === dateRange.start);
    const endMonth = allMonths.find(m => m.id === dateRange.end);

    if (startMonth) {
       result = result.filter(m => m.date >= startMonth.date);
    }
    if (endMonth) {
       result = result.filter(m => m.date <= endMonth.date);
    }
    return result; // Chronological order
  }, [allMonths, dateRange]);

  const generateStatementData = () => {
    if (!dateRange.start || !dateRange.end || !selectedEmployee) {
       return [];
    }
    const data: any[] = [];
    
    const empsToProcess = selectedEmployee === 'all' 
      ? allEmployeesList 
      : allEmployeesList.filter(e => e.id.toString() === selectedEmployee);

    empsToProcess.forEach(emp => {
      const empRows: any[] = [];
      let totalValue = 0;

      filteredMonths.forEach(m => {
        const monthEmp = m.employees.find(e => e.id === emp.id);
        if (monthEmp) {
          const rowData: any = { month: m.name };
          let rowTotal = 0;

          selectedItems.forEach(itemId => {
             let val = 0;
             if (itemId === 'netSalary') {
                const entitlements = 
                  (monthEmp.basicSalary || 0) + 
                  (monthEmp.overtime || 0) + 
                  (monthEmp.communicationAllowance || 0) + 
                  (monthEmp.housingAllowance || 0) + 
                  (monthEmp.foodAllowance || 0) + 
                  (monthEmp.transportationAllowance || 0) + 
                  (monthEmp.commission || 0) + 
                  (monthEmp.bonus || 0);
                const deductions = 
                  (monthEmp.hasInsurance !== false ? (monthEmp.insuranceDeduction || 0) : 0) + 
                  (monthEmp.generalDeduction || 0) + 
                  (monthEmp.loan || 0) + 
                  (monthEmp.absenceDeduction || 0);
                val = entitlements - deductions;
             } else {
                val = (monthEmp as any)[itemId] || 0;
             }
             rowData[itemId] = val;
             rowTotal += val;
          });
          
          if (selectedItems.length > 0) {
             empRows.push(rowData);
             totalValue += rowTotal;
          }
        }
      });

      if (empRows.length > 0) {
         data.push({
            employee: emp,
            rows: empRows,
            totalValue
         });
      }
    });

    return data;
  };

  const statementData = useMemo(() => generateStatementData(), [filteredMonths, selectedEmployee, selectedItems, dateRange]);

  const isFormComplete = dateRange.start !== '' && dateRange.end !== '' && selectedEmployee !== '';

  return (
    <div className="p-4 sm:p-6 w-full font-sans min-h-screen bg-slate-50">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 print:hidden gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-600" />
            كشف حساب للموظفين
          </h1>
          <p className="text-slate-500 mt-1 font-medium">عرض تفصيلي لبنود الرواتب خلال فترات زمنية محددة</p>
        </div>
        <div className="flex gap-2">
          {isFormComplete && (
             <button
               onClick={handlePrint}
               className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-bold shadow-sm transition-all"
             >
               <Printer className="w-4 h-4" />
               طباعة
             </button>
          )}
          <button
            onClick={() => onViewChange('table')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-bold shadow-sm transition-all"
          >
            العودة للجدول
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 print:hidden space-y-6">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
               <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  الفترة الزمنية
               </label>
               <div className="flex gap-4">
                  <div className="flex-1">
                     <span className="text-xs text-slate-500 block mb-1">من (شهر / سنة)</span>
                     <select 
                        className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                     >
                        <option value="">اختر الشهر...</option>
                        {allMonths.map(m => (
                           <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                     </select>
                  </div>
                  <div className="flex-1">
                     <span className="text-xs text-slate-500 block mb-1">إلى (شهر / سنة)</span>
                     <select 
                        className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                     >
                        <option value="">اختر الشهر...</option>
                        {allMonths.map(m => (
                           <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                     </select>
                  </div>
               </div>
            </div>
            
            <div>
               <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-500" />
                  تحديد الموظف
               </label>
               <select 
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-[42px] mt-5"
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
               >
                  <option value="">اختر الموظف...</option>
                  <option value="all">الكل (جميع الموظفين)</option>
                  {allEmployeesList.map(emp => (
                     <option key={emp.id} value={emp.id.toString()}>{emp.name}</option>
                  ))}
               </select>
            </div>
         </div>

         <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
               <FileText className="w-4 h-4 text-indigo-500" />
               البنود المراد عرضها
            </label>
            <div className="flex flex-wrap gap-2">
               {itemsList.map(item => (
                  <button
                     key={item.id}
                     onClick={() => toggleItem(item.id)}
                     className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                        selectedItems.includes(item.id) 
                           ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-xs' 
                           : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                     }`}
                  >
                     {item.label}
                  </button>
               ))}
            </div>
         </div>
      </div>

      {/* Results */}
      <div className="space-y-8">
         {!isFormComplete ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
               <Layers className="w-12 h-12 text-slate-300 mx-auto mb-4" />
               <h3 className="text-lg font-bold text-slate-900">حدد البيانات لعرض كشف الحساب</h3>
               <p className="text-slate-500 mt-1">الرجاء اختيار الفترة الزمنية والموظف لظهور النتائج</p>
            </div>
         ) : statementData.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
               <Layers className="w-12 h-12 text-slate-300 mx-auto mb-4" />
               <h3 className="text-lg font-bold text-slate-900">لا توجد بيانات</h3>
               <p className="text-slate-500 mt-1">لم يتم العثور على أي بيانات تطابق معايير البحث المحددة</p>
            </div>
         ) : (
            statementData.map((empData, idx) => {
               // Calculate column totals for this employee's statement
               const columnTotals: { [key: string]: number } = {};
               selectedItems.forEach(itemId => {
                 columnTotals[itemId] = empData.rows.reduce((sum: number, row: any) => sum + (row[itemId] || 0), 0);
               });

               return (
                  <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print:shadow-none print:border-slate-300 break-inside-avoid">
                     <div className="bg-slate-50 p-4 border-b border-slate-200 print:bg-slate-100 flex justify-between items-center">
                        <div>
                           <h3 className="text-lg font-black text-slate-900">{empData.employee.name}</h3>
                           <p className="text-sm text-slate-500">{empData.employee.jobTitle} - {empData.employee.branch}</p>
                        </div>
                        <div className="text-left">
                           <span className="block text-xs text-slate-500 uppercase font-black tracking-wider mb-1">الإجمالي</span>
                           <span className="text-xl font-mono font-black text-indigo-600">{formatCurrency(empData.totalValue)}</span>
                        </div>
                     </div>
                     
                     <div className="p-0 overflow-x-auto">
                        <table className="w-full text-sm text-right">
                           <thead className="bg-white text-slate-500 text-xs uppercase font-black">
                              <tr>
                                 <th className="px-6 py-3 border-b border-slate-200">الشهر</th>
                                 {selectedItems.map(itemId => (
                                    <th key={itemId} className="px-6 py-3 border-b border-slate-200 whitespace-nowrap">
                                       {itemsList.find(i => i.id === itemId)?.label}
                                    </th>
                                 ))}
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                              {empData.rows.map((row: any, rIdx: number) => (
                                 <tr key={rIdx} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">{row.month}</td>
                                    {selectedItems.map(itemId => (
                                       <td key={itemId} className="px-6 py-4 font-mono whitespace-nowrap">
                                          {formatCurrency(row[itemId] || 0)}
                                       </td>
                                    ))}
                                 </tr>
                              ))}
                           </tbody>
                           <tfoot className="bg-slate-50 border-t border-slate-200 font-bold">
                              <tr>
                                 <td className="px-6 py-4 text-slate-900 whitespace-nowrap font-black">الإجمالي الكلي</td>
                                 {selectedItems.map(itemId => (
                                    <td key={itemId} className="px-6 py-4 font-mono text-indigo-600 whitespace-nowrap font-black">
                                       {formatCurrency(columnTotals[itemId] || 0)}
                                    </td>
                                 ))}
                              </tr>
                           </tfoot>
                        </table>
                     </div>
                  </div>
               );
            })
         )}
      </div>
      
      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .w-full, .w-full * {
            visibility: visible;
          }
          .print\\:hidden {
            display: none !important;
          }
          .w-full {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
          }
        }
      `}} />
    </div>
  );
};
