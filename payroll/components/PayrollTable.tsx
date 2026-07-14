import React, { useState, useMemo } from 'react';
import { Edit2, Trash2, FileText, Check, X, Printer } from 'lucide-react';
import { Employee, PayrollTotals, Signatures } from '../types';
import { calculateEmployeeTotals, formatCurrency, formatNumberClean, getEmployeeFieldPhase } from '../utils/calculations';
import { generateMediaPrintCSS } from '../utils/printConfig';

interface PayrollTableProps {
  employees: Employee[];
  totals: PayrollTotals;
  onEditEmployee: (emp: Employee) => void;
  onDeleteEmployee: (id: number) => void;
  onViewPaySlip: (emp: Employee) => void;
  onPrintEmployee: (emp: Employee) => void;
  onUpdateEmployeeField: (id: number, field: keyof Employee, value: number) => void;
  signatures: Signatures;
  onUpdateSignatures: (sigs: Signatures) => void;
  sheetTitle: string;
  payrollPhase: 'full' | 'phase1' | 'phase2';
  selectedEmployeeIds: number[];
  onSelectEmployee: (id: number) => void;
  onSelectAllEmployees: (ids: number[]) => void;
  isAlaa?: boolean;
  readOnly?: boolean;
  selectedBranch?: string;
}

export const PayrollTable: React.FC<PayrollTableProps> = ({
  employees,
  totals,
  onEditEmployee,
  onDeleteEmployee,
  onViewPaySlip,
  onPrintEmployee,
  onUpdateEmployeeField,
  signatures,
  onUpdateSignatures,
  sheetTitle,
  payrollPhase,
  selectedEmployeeIds,
  onSelectEmployee,
  onSelectAllEmployees,
  isAlaa = false,
  readOnly = false,
  selectedBranch
}) => {
  // Inline editing state: { empId, field, value }
  const [editingCell, setEditingCell] = useState<{ id: number; field: keyof Employee; value: string } | null>(null);
  const [editingSig, setEditingSig] = useState<keyof Signatures | null>(null);
  const [sigTempVal, setSigTempVal] = useState<string>('');
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);

  const isAllSelected = employees.length > 0 && selectedEmployeeIds.length === employees.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      onSelectAllEmployees([]);
    } else {
      onSelectAllEmployees(employees.map(e => e.id));
    }
  };

  const handleCellClick = (emp: Employee, field: keyof Employee) => {
    if (readOnly || !isAlaa) return;
    setEditingCell({
      id: emp.id,
      field,
      value: String((emp as any)[field] || '')
    });
  };

  const saveCellEdit = () => {
    if (!editingCell) return;
    const numVal = parseFloat(editingCell.value) || 0;
    onUpdateEmployeeField(editingCell.id, editingCell.field, numVal);
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveCellEdit();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  const startSigEdit = (field: keyof Signatures, val: string) => {
    if (readOnly || !isAlaa) return;
    setEditingSig(field);
    setSigTempVal(val);
  };

  const saveSigEdit = () => {
    if (!editingSig) return;
    onUpdateSignatures({
      ...signatures,
      [editingSig]: sigTempVal
    });
    setEditingSig(null);
  };

  const isColumnEmpty = (field: keyof Employee) => {
    if (field === 'overtimeHours') return true; // Always hide Working Hours from print as requested
    return totals[field as keyof PayrollTotals] === 0;
  };

  const colVisibility = {
    basicSalary: !isColumnEmpty('basicSalary'),
    overtimeHours: false, // Always hide per request
    overtime: !isColumnEmpty('overtime'),
    communicationAllowance: !isColumnEmpty('communicationAllowance'),
    housingAllowance: !isColumnEmpty('housingAllowance'),
    foodAllowance: !isColumnEmpty('foodAllowance'),
    transportationAllowance: !isColumnEmpty('transportationAllowance'),
    commission: !isColumnEmpty('commission'),
    bonus: !isColumnEmpty('bonus'),
    insuranceDeduction: !isColumnEmpty('insuranceDeduction'),
    generalDeduction: !isColumnEmpty('generalDeduction'),
    loan: !isColumnEmpty('loan'),
    absenceDays: false, // Always hide per request
    absenceDeduction: !isColumnEmpty('absenceDeduction'),
  };

  const printedCount = useMemo(() => {
    return employees.filter(emp => {
      const empTotals = calculateEmployeeTotals(emp, payrollPhase);
      return empTotals.netSalary > 0;
    }).length || 1;
  }, [employees, payrollPhase]);

  const printedEmployees = useMemo(() => {
    return employees.filter(emp => {
      const empTotals = calculateEmployeeTotals(emp, payrollPhase);
      return empTotals.netSalary > 0;
    });
  }, [employees, payrollPhase]);

  const printIndexMap = useMemo(() => {
    const map: Record<number, number> = {};
    printedEmployees.forEach((emp, idx) => {
      map[emp.id] = idx + 1;
    });
    return map;
  }, [printedEmployees]);

  const printEntitlementsColSpan = useMemo(() => {
    return [
      colVisibility.basicSalary,
      colVisibility.overtime,
      colVisibility.communicationAllowance,
      colVisibility.housingAllowance,
      colVisibility.foodAllowance,
      colVisibility.transportationAllowance,
      colVisibility.commission,
      colVisibility.bonus
    ].filter(Boolean).length + 1; // +1 for "إجمالي"
  }, [colVisibility]);

  const printDeductionsColSpan = useMemo(() => {
    return [
      colVisibility.insuranceDeduction,
      colVisibility.generalDeduction,
      colVisibility.loan,
      colVisibility.absenceDeduction
    ].filter(Boolean).length + 1; // +1 for "إجمالي"
  }, [colVisibility]);

  const isAllBranches = !selectedBranch || selectedBranch === 'الكل' || selectedBranch === 'All';

  return (
    <div id="printable-payroll-section" className="w-full px-2 sm:px-4 pb-12">
      
      {/* Dynamic Smart Print CSS injected so row height and font automatically scale to fill the page */}
      <style dangerouslySetInnerHTML={{ __html: generateMediaPrintCSS(printedCount, isAllBranches) }} />

      {/* Title only visible in Print or above table */}
      <div className="text-center mb-2 hidden print:block">
        <h2 className="text-sm sm:text-base print:text-[13.5pt] font-extrabold inline-block text-black">
          شركة المياه العذبة المحدوده - {isAllBranches ? sheetTitle : `${sheetTitle} - ${selectedBranch}`}
        </h2>
      </div>

      {/* Spreadsheet Table Container */}
      <div className="hidden md:block print:!block bg-white rounded-xl shadow-sm border border-slate-200 print:!shadow-none print:!border-none print:!rounded-none print:!overflow-visible print:!max-h-none print:!h-auto print:!w-full w-full overflow-auto max-h-[75vh]">
        <table className="w-full text-center border-collapse text-[13px] sm:text-sm font-sans dir-rtl min-w-[1250px] print:min-w-0" dir="rtl">
          
          {/* Table Headers (Exact 2-tier design from image) */}
          <thead className="sticky top-0 z-20 print:static shadow-sm bg-white">
            {/* Top Tier - UI version */}
            <tr className="bg-white text-slate-900 font-extrabold border-b-2 border-slate-300 tracking-wider uppercase text-[13px] sm:text-sm print:hidden shadow-sm">
              <th rowSpan={2} className="p-2.5 border border-slate-300 w-10 bg-white">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </th>
              <th rowSpan={2} className="p-2.5 border border-slate-300 w-10 bg-white">الرقم</th>
              <th rowSpan={2} className="p-2.5 border border-slate-300 w-16 bg-white">كود الموظف</th>
              <th rowSpan={2} className="p-2.5 border border-slate-300 min-w-[150px] bg-white text-right pr-3">اسم الموظف</th>
              <th rowSpan={2} className="p-2.5 border border-slate-300 w-24 bg-white text-right pr-3">الفرع</th>
              <th rowSpan={2} className="p-2.5 border border-slate-300 w-24 bg-white text-right pr-3">الوظيفة</th>
              
              <th colSpan={10} className="py-2.5 px-1 border border-slate-300 bg-blue-100 text-amber-700 font-extrabold text-sm text-center">
                إستحقاقات العاملين
              </th>
              
              <th colSpan={6} className="py-2.5 px-1 border border-slate-300 bg-rose-100 text-rose-900 font-extrabold text-sm text-center">
                إستقطاعات والخصومات
              </th>
              
              <th rowSpan={2} className="p-2.5 border border-slate-300 bg-white text-blue-700 font-extrabold w-24">
                الصافي المستحق
              </th>
              
              <th rowSpan={2} className="p-2.5 border border-slate-300  bg-slate-100 text-slate-800 font-bold print:hidden w-24">
                إجراءات
              </th>
            </tr>

            {/* Top Tier - Print version (dynamic colspans) */}
            <tr className="hidden print:table-row bg-white text-black font-extrabold border-b-2 border-black tracking-wider uppercase text-[13px] sm:text-sm">
              <th rowSpan={2} className="p-2 border border-black ">الرقم</th>
              <th rowSpan={2} className="p-2 border border-black print:hidden">الكود</th>
              <th rowSpan={2} className="p-2 border border-black min-w-[80px] text-right pr-2">الاسم</th>
              <th rowSpan={2} className="p-2 border border-black  text-right pr-2">الفرع</th>
              <th rowSpan={2} className="p-2 border border-black print:hidden text-right pr-2">الوظيفة</th>
              
              <th colSpan={printEntitlementsColSpan} className="py-2 border border-black bg-blue-50 text-amber-700 font-extrabold text-[10px]">
                إستحقاقات العاملين
              </th>
              
              <th colSpan={printDeductionsColSpan} className="py-2 border border-black bg-rose-50 text-rose-900 font-extrabold text-[10px]">
                إستقطاعات والخصومات
              </th>
              
              <th rowSpan={2} className="p-2 border border-black bg-white text-blue-700 font-extrabold  print-col-net">
                الصافي
              </th>
            </tr>

            {/* Bottom Tier */}
            <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 print:bg-slate-50 print:border-slate-800 uppercase tracking-wider text-xs print:static shadow-sm">
              {/* Entitlements sub-columns */}
              <th className={`p-2 border border-slate-200 print:border-slate-800 text-amber-700 font-bold bg-slate-100 print:bg-slate-50 ${!colVisibility.basicSalary ? 'print:hidden' : ''}`}>الاساسى</th>
              <th className={`p-2 border border-slate-200 print:border-slate-800 text-amber-700 bg-slate-100 print:bg-slate-50 font-bold print:hidden`} title="عدد ساعات العمل / الإضافي (تتحول لمبلغ الإضافي تلقائياً)">ساعات العمل</th>
              <th className={`p-2 border border-slate-200 print:border-slate-800 text-amber-700 bg-slate-100 print:bg-slate-50 ${!colVisibility.overtime ? 'print:hidden' : ''}`}>الاضافى</th>
              <th className={`p-2 border border-slate-200 print:border-slate-800 text-amber-700 bg-slate-100 print:bg-slate-50 ${!colVisibility.housingAllowance ? 'print:hidden' : ''}`}>بدل السكن</th>
              <th className={`p-2 border border-slate-200 print:border-slate-800 text-amber-700 bg-slate-100 print:bg-slate-50 ${!colVisibility.transportationAllowance ? 'print:hidden' : ''}`}>بدل انتقال</th>
              <th className={`p-2 border border-slate-200 print:border-slate-800 text-amber-700 bg-slate-100 print:bg-slate-50 ${!colVisibility.communicationAllowance ? 'print:hidden' : ''}`}>بدل اتصال</th>
              <th className={`p-2 border border-slate-200 print:border-slate-800 text-amber-700 bg-slate-100 print:bg-slate-50 ${!colVisibility.foodAllowance ? 'print:hidden' : ''}`}>بدل طعام</th>
              <th className={`p-2 border border-slate-200 print:border-slate-800 text-amber-700 bg-slate-100 print:bg-slate-50 ${!colVisibility.commission ? 'print:hidden' : ''}`}>العموله</th>
              <th className={`p-2 border border-slate-200 print:border-slate-800 text-amber-700 bg-slate-100 print:bg-slate-50 ${!colVisibility.bonus ? 'print:hidden' : ''}`}>المكافأه</th>
              <th className="p-2 border border-slate-200 print:border-slate-800 bg-slate-200 text-amber-700 font-extrabold print-col-total">إجمالي</th>
              
              {/* Deductions sub-columns */}
              <th className={`p-2 border border-slate-200 print:border-slate-800 text-rose-600 bg-slate-100 print:bg-slate-50 ${!colVisibility.insuranceDeduction ? 'print:hidden' : ''}`}>تأمينات</th>
              <th className={`p-2 border border-slate-200 print:border-slate-800 text-rose-600 bg-slate-100 print:bg-slate-50 ${!colVisibility.generalDeduction ? 'print:hidden' : ''}`}>خصم</th>
              <th className={`p-2 border border-slate-200 print:border-slate-800 text-rose-600 bg-slate-100 print:bg-slate-50 ${!colVisibility.loan ? 'print:hidden' : ''}`}>سلفة</th>
              <th className="p-2 border border-slate-200 print:border-slate-800 text-rose-600 bg-slate-100 print:bg-slate-50 print:hidden" title="عدد أيام الغياب (يخصم تلقائياً من غيابات)">ايام الغياب</th>
              <th className={`p-2 border border-slate-200 print:border-slate-800 text-rose-600 bg-slate-100 print:bg-slate-50 ${!colVisibility.absenceDeduction ? 'print:hidden' : ''}`}>غيابات</th>
              <th className="p-2 border border-slate-200 print:border-slate-800 bg-slate-200 text-rose-900 font-extrabold print-col-total">إجمالي</th>
            </tr>
          </thead>

          
          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 print:divide-black">
            {employees.map((emp, index) => {
              const empTotals = calculateEmployeeTotals(emp, payrollPhase);
              const isEven = index % 2 === 0;
              const isSelected = selectedRowId === emp.id;

              // Helper to render an editable cell
              const renderEditableCell = (field: keyof Employee, colorClass: string = '', isEditable: boolean = true) => {
                const isCellEditable = isEditable && !readOnly;
                const isEditing = isCellEditable && editingCell?.id === emp.id && editingCell?.field === field;
                let val = (emp[field] as number) || 0;
                
                let isVisibleInPhase = true;
                if (payrollPhase === 'phase1' || payrollPhase === 'phase2') {
                  const targetPhase = payrollPhase === 'phase1' ? '1' : '2';
                  if (['basicSalary', 'overtimeHours', 'overtime', 'communicationAllowance', 'housingAllowance', 'foodAllowance', 'transportationAllowance', 'commission', 'bonus', 'insuranceDeduction', 'generalDeduction', 'loan', 'absenceDays', 'absenceDeduction'].includes(field)) {
                    isVisibleInPhase = getEmployeeFieldPhase(emp, field) === targetPhase;
                  }
                }

                if (field === 'insuranceDeduction' && emp.hasInsurance === false) {
                  val = 0;
                }

                const hiddenInPrint = !colVisibility[field as keyof typeof colVisibility];

                if (isEditing) {
                  return (
                    <td 
                      onClick={(e) => e.stopPropagation()}
                      className={`p-2 border border-slate-100 print:border-black bg-blue-50 text-center align-middle ${colorClass} ${hiddenInPrint ? 'print:hidden' : ''}`}
                    >
                      <input
                        type="text"
                        inputMode="decimal"
                        autoFocus
                        value={editingCell.value}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9.]/g, '');
                          setEditingCell({ ...editingCell, value: val });
                        }}
                        onKeyDown={handleKeyDown}
                        onBlur={saveCellEdit}
                        placeholder="0"
                        onFocus={(e) => e.target.select()}
                        className="w-full text-center text-[13px] font-bold bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-blue-950 p-0 m-0 font-mono leading-none block"
                      />
                    </td>
                  );
                }

                const isDisabledInsurance = field === 'insuranceDeduction' && emp.hasInsurance === false;
                
                // Blend backgrounds elegantly when selected
                const cleanColorClass = isSelected 
                  ? colorClass.replace(/bg-[a-z0-9\-\/]+/g, '').trim() + ' text-yellow-950 font-bold'
                  : colorClass;

                
                let displayVal = '-';
                if (isVisibleInPhase) {
                  if (field === 'overtimeHours' || field === 'absenceDays') {
                     displayVal = val > 0 ? formatNumberClean(val) : '0';
                  } else {
                     displayVal = val > 0 ? formatCurrency(val) : '0';
                  }
                }


                return (
                  <td 
                    onClick={() => {
                      if (!isCellEditable) return;
                      if (isDisabledInsurance) {
                        alert("التأمينات معطلة لهذا الموظف. يمكنك تفعيلها من نافذة تعديل بيانات الموظف.");
                        return;
                      }
                      handleCellClick(emp, field);
                    }}
                    className={`p-2 border border-slate-100 print:border-black transition-colors font-mono ${cleanColorClass} ${
                      isDisabledInsurance 
                        ? 'text-slate-300 line-through font-normal' 
                        : val > 0 && isVisibleInPhase ? 'font-semibold text-slate-800' : 'text-slate-400 font-normal'
                    } ${
                      !isCellEditable 
                        ? 'cursor-default' 
                        : 'cursor-pointer hover:bg-yellow-50'
                    } ${hiddenInPrint ? 'print:hidden' : ''}`}
                    title={
                      isDisabledInsurance 
                        ? "التأمينات معطلة لهذا الموظف" 
                        : !isCellEditable 
                          ? (readOnly ? "قراءة فقط - لا يمكن تعديل هذا الكشف" : "للتعديل، يرجى فتح بيانات الموظف بالضغط على السطر")
                          : "اضغط للتعديل السريع"
                    }
                  >
                    {isDisabledInsurance ? '0' : displayVal}
                  </td>
                );
              };

              return (
                <tr 
                  key={emp.id} 
                  onClick={() => setSelectedRowId(isSelected ? null : emp.id)}
                  className={`cursor-pointer transition-all h-[42px] min-h-[42px] max-h-[42px] overflow-hidden ${
                    isSelected 
                      ? 'bg-yellow-100 text-yellow-950 shadow-xs' 
                      : emp.isActive === false 
                        ? 'bg-slate-100/70 text-slate-400 opacity-70 hover:bg-slate-200/50' 
                        : isEven 
                          ? 'bg-white hover:bg-slate-50' 
                          : 'bg-slate-50 hover:bg-slate-100'
                  } print:bg-transparent items-center text-sm ${empTotals.netSalary === 0 ? 'print:hidden' : ''}`}
                >
                  <td className="p-2 border border-slate-100 print:hidden text-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedEmployeeIds.includes(emp.id)}
                      onChange={() => onSelectEmployee(emp.id)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </td>
                  <td className="p-2 border border-slate-100 print:border-slate-800 font-mono text-slate-400 text-[13px] sm:text-sm">
                    <span className="print:hidden">{index + 1}</span>
                    <span className="hidden print:inline-block">{printIndexMap[emp.id] || ''}</span>
                  </td>
                  <td className="p-2 border border-slate-100 print:border-slate-800 font-mono font-medium text-slate-500 text-[13px] sm:text-sm print:hidden">{emp.code}</td>
                  <td className="p-2 border border-slate-100 print:border-slate-800 text-right pr-3 text-[13px]">
                    <div className="flex items-center gap-1.5 justify-start">
                      <span className={`block font-bold leading-tight ${emp.isActive === false ? 'text-slate-400 line-through font-normal' : isSelected ? 'text-yellow-950' : 'text-slate-900'}`}>{emp.name}</span>
                      {emp.isActive === false && (
                        <span className="bg-rose-100 text-rose-700 text-[9px] px-1.5 py-0.5 rounded-md font-extrabold select-none">معطل</span>
                      )}
                    </div>
                  </td>
                  <td className="p-2 border border-slate-100 print:border-slate-800 text-right pr-3 text-slate-700 font-semibold text-[13px] sm:text-sm">
                    {emp.branch || 'أخرى'}
                  </td>
                  <td className="p-2 border border-slate-100 print:border-slate-800 text-right pr-3 text-slate-600 text-[13px] sm:text-sm font-medium print:hidden">{emp.jobTitle}</td>
                  
                  {/* Entitlements */}
                  {renderEditableCell('basicSalary', 'font-semibold text-slate-900', false)}
                  {renderEditableCell('overtimeHours', 'text-amber-700')}
                  {renderEditableCell('overtime', 'text-blue-700', false)}
                  {renderEditableCell('housingAllowance')}
                  {renderEditableCell('transportationAllowance', '', false)}
                  {renderEditableCell('communicationAllowance', '', false)}
                  {renderEditableCell('foodAllowance', '', false)}
                  {renderEditableCell('commission', 'text-blue-700')}
                  {renderEditableCell('bonus', 'text-blue-700')}
                  
                  {/* Entitlements Total */}
                  <td className={`p-2 border border-slate-100 print:border-slate-800 font-bold font-mono ${isSelected ? 'text-yellow-950' : 'text-slate-900'} print-col-total`}>
                    {formatCurrency(empTotals.totalEntitlements)}
                  </td>
                  
                  {/* Deductions */}
                  {renderEditableCell('insuranceDeduction', 'text-rose-500', false)}
                  {renderEditableCell('generalDeduction', 'text-rose-500')}
                  {renderEditableCell('loan', 'text-rose-500')}
                  {renderEditableCell('absenceDays', 'text-rose-500 print:hidden')}
                  {renderEditableCell('absenceDeduction', 'text-rose-500', false)}
                  
                  {/* Deductions Total */}
                  <td className={`p-2 border border-slate-100 print:border-slate-800 font-bold font-mono ${isSelected ? 'text-rose-900' : 'text-rose-700'} print-col-total`}>
                    {formatCurrency(empTotals.totalDeductions)}
                  </td>
                  
                  {/* Net Employee Salary */}
                  <td className={`p-2 border border-slate-100 print:border-slate-800 font-bold font-mono text-sm bg-white ${isSelected ? 'text-yellow-950 bg-yellow-200' : 'text-blue-700'} print-col-net`}>
                    {formatCurrency(empTotals.netSalary)}
                  </td>
                  
                  <td className="p-1 border border-slate-300 print:hidden text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); onPrintEmployee(emp); }}
                        className="p-1 text-blue-700 hover:bg-blue-200 rounded transition-colors"
                        title="طباعة قسيمة الراتب"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      {(!readOnly && isAlaa) && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); onEditEmployee(emp); }}
                            className="p-1 text-emerald-600 hover:bg-emerald-100 rounded transition-colors"
                            title="تعديل بيانات وراتب الموظف"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Are you sure you want to delete employee "${emp.name}"?`)) {
                                onDeleteEmployee(emp.id);
                              }
                            }}
                            className="p-1 text-rose-600 hover:bg-rose-100 rounded transition-colors"
                            title="حذف الموظف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {/* If no employees found */}
            {employees.length === 0 && (
              <tr>
                <td colSpan={100} className="py-8 text-center text-slate-500 font-medium">
                  لا توجد بيانات موظفين تطابق البحث أو الفلتر المختار
                </td>
              </tr>
            )}
          </tbody>

          {/* Table Footer: الاجمالــــــى */}
          {employees.length > 0 && (
            <tfoot>
              <tr className="bg-slate-100 text-slate-900 font-extrabold border-t-2 border-slate-300 print:bg-slate-200 print:border-slate-800 shadow-xs">
                <td colSpan={6} className="py-2.5 px-3 text-right border border-slate-300 print:border-slate-800 font-extrabold tracking-wide text-sm print:hidden">
                  الاجمالــــــى
                </td>
                <td colSpan={3} className="py-2.5 px-3 text-right border border-slate-300 print:border-slate-800 font-extrabold tracking-wide text-sm hidden print:table-cell">
                  الاجمالــــــى
                </td>
                <td className={`p-2 border border-slate-300 print:border-slate-800 font-mono text-[13px] sm:text-sm ${!colVisibility.basicSalary ? 'print:hidden' : ''}`}>{formatCurrency(totals.basicSalary)}</td>
                <td className={`p-2 border border-slate-300 print:border-slate-800 font-mono text-[13px] sm:text-sm text-amber-700 font-bold print:hidden`}>{totals.overtimeHours ? totals.overtimeHours.toLocaleString('en-US') : '0'}</td>
                <td className={`p-2 border border-slate-300 print:border-slate-800 font-mono text-[13px] sm:text-sm text-blue-700 ${!colVisibility.overtime ? 'print:hidden' : ''}`}>{formatCurrency(totals.overtime)}</td>
                <td className={`p-2 border border-slate-300 print:border-slate-800 font-mono text-[13px] sm:text-sm ${!colVisibility.housingAllowance ? 'print:hidden' : ''}`}>{formatCurrency(totals.housingAllowance)}</td>
                <td className={`p-2 border border-slate-300 print:border-slate-800 font-mono text-[13px] sm:text-sm ${!colVisibility.transportationAllowance ? 'print:hidden' : ''}`}>{formatCurrency(totals.transportationAllowance)}</td>
                <td className={`p-2 border border-slate-300 print:border-slate-800 font-mono text-[13px] sm:text-sm ${!colVisibility.communicationAllowance ? 'print:hidden' : ''}`}>{formatCurrency(totals.communicationAllowance)}</td>
                <td className={`p-2 border border-slate-300 print:border-slate-800 font-mono text-[13px] sm:text-sm ${!colVisibility.foodAllowance ? 'print:hidden' : ''}`}>{formatCurrency(totals.foodAllowance)}</td>
                <td className={`p-2 border border-slate-300 print:border-slate-800 font-mono text-[13px] sm:text-sm text-blue-700 ${!colVisibility.commission ? 'print:hidden' : ''}`}>{formatCurrency(totals.commission)}</td>
                <td className={`p-2 border border-slate-300 print:border-slate-800 font-mono text-[13px] sm:text-sm text-blue-700 ${!colVisibility.bonus ? 'print:hidden' : ''}`}>{formatCurrency(totals.bonus)}</td>
                <td className="p-2 border border-slate-300 print:border-slate-800 bg-slate-200 font-mono text-[13px] sm:text-sm text-slate-900 font-extrabold print-col-total">{formatCurrency(totals.totalEntitlements)}</td>
                
                <td className={`p-2 border border-slate-300 print:border-slate-800 font-mono text-[13px] sm:text-sm text-rose-600 ${!colVisibility.insuranceDeduction ? 'print:hidden' : ''}`}>{formatCurrency(totals.insuranceDeduction)}</td>
                <td className={`p-2 border border-slate-300 print:border-slate-800 font-mono text-[13px] sm:text-sm text-rose-600 ${!colVisibility.generalDeduction ? 'print:hidden' : ''}`}>{formatCurrency(totals.generalDeduction)}</td>
                <td className={`p-2 border border-slate-300 print:border-slate-800 font-mono text-[13px] sm:text-sm text-rose-600 ${!colVisibility.loan ? 'print:hidden' : ''}`}>{formatCurrency(totals.loan)}</td>
                <td className="p-2 border border-slate-300 print:border-slate-800 font-mono text-[13px] sm:text-sm text-rose-600 print:hidden">{formatNumberClean(totals.absenceDays)}</td>
                <td className={`p-2 border border-slate-300 print:border-slate-800 font-mono text-[13px] sm:text-sm text-rose-600 ${!colVisibility.absenceDeduction ? 'print:hidden' : ''}`}>{formatCurrency(totals.absenceDeduction)}</td>
                <td className="p-2 border border-slate-300 print:border-slate-800 bg-rose-100 font-mono text-[13px] sm:text-sm text-rose-800 font-extrabold print-col-total">{formatCurrency(totals.totalDeductions)}</td>
                
                <td className="p-2 border border-slate-300 print:border-slate-800 bg-blue-600 print:!bg-[#dbeafe] font-mono text-sm sm:text-base text-white font-extrabold print-col-net">{formatCurrency(totals.netSalary)}</td>
                <td className="border border-slate-300 print:hidden bg-slate-200"></td>
              </tr>
            </tfoot>
          )}

        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="block md:hidden print:hidden space-y-4 w-full">
        {employees.map((emp, index) => {
          const empTotals = calculateEmployeeTotals(emp, payrollPhase);
          const isSelected = selectedRowId === emp.id;
          
          return (
            <div 
              key={emp.id} 
              onClick={() => setSelectedRowId(isSelected ? null : emp.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                isSelected 
                  ? 'bg-yellow-50/80 border-yellow-300 shadow-sm' 
                  : emp.isActive === false 
                    ? 'bg-slate-50 border-slate-200 opacity-70' 
                    : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
              }`}
            >
              {/* Header: Name, Code, Status */}
              <div className="flex justify-between items-start gap-2 mb-3 pb-2.5 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`font-bold text-sm ${emp.isActive === false ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                      {emp.name || 'موظف جديد'}
                    </span>
                    {emp.isActive === false && (
                      <span className="bg-rose-100 text-rose-700 text-[9px] px-1.5 py-0.5 rounded font-extrabold select-none">معطل</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex flex-wrap gap-x-1.5 gap-y-0.5">
                    <span>كود: {emp.code}</span>
                    <span>•</span>
                    <span>{emp.branch || 'أخرى'}</span>
                    <span>•</span>
                    <span>{emp.jobTitle}</span>
                  </div>
                </div>
                <div className="text-left shrink-0">
                  <span className="text-[10px] text-slate-400 block font-semibold text-left">الصافي المستحق</span>
                  <span className="text-sm font-black text-blue-700 font-mono">{formatCurrency(empTotals.netSalary)}</span>
                </div>
              </div>

              {/* Grid of basic information & salary components */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                {/* Entitlements block */}
                <div className="space-y-1.5 border-l border-slate-100 pl-2">
                  <div className="font-bold text-amber-700 border-b border-slate-100 pb-1 mb-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                    <span>الاستحقاقات</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>الأساسي:</span>
                    <span className="font-semibold font-mono text-slate-800">{formatCurrency(emp.basicSalary || 0)}</span>
                  </div>
                  {(emp.overtime > 0) && (
                    <div className="flex justify-between text-slate-600">
                      <span>إضافي:</span>
                      <span className="font-semibold font-mono text-slate-800">{formatCurrency(emp.overtime)}</span>
                    </div>
                  )}
                  {(emp.communicationAllowance > 0) && (
                    <div className="flex justify-between text-slate-600">
                      <span>اتصال:</span>
                      <span className="font-semibold font-mono text-slate-800">{formatCurrency(emp.communicationAllowance)}</span>
                    </div>
                  )}
                  {(emp.housingAllowance > 0) && (
                    <div className="flex justify-between text-slate-600">
                      <span>سكن:</span>
                      <span className="font-semibold font-mono text-slate-800">{formatCurrency(emp.housingAllowance)}</span>
                    </div>
                  )}
                  {(emp.foodAllowance > 0) && (
                    <div className="flex justify-between text-slate-600">
                      <span>طعام:</span>
                      <span className="font-semibold font-mono text-slate-800">{formatCurrency(emp.foodAllowance)}</span>
                    </div>
                  )}
                  {(emp.transportationAllowance > 0) && (
                    <div className="flex justify-between text-slate-600">
                      <span>مواصلات:</span>
                      <span className="font-semibold font-mono text-slate-800">{formatCurrency(emp.transportationAllowance)}</span>
                    </div>
                  )}
                  {(emp.commission > 0) && (
                    <div className="flex justify-between text-slate-600">
                      <span>عمولة:</span>
                      <span className="font-semibold font-mono text-slate-800">{formatCurrency(emp.commission)}</span>
                    </div>
                  )}
                  {(emp.bonus > 0) && (
                    <div className="flex justify-between text-slate-600">
                      <span>مكافأة:</span>
                      <span className="font-semibold font-mono text-slate-800">{formatCurrency(emp.bonus)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-amber-700 font-bold border-t border-slate-100 pt-1 mt-1">
                    <span>إجمالي الاستحقاق:</span>
                    <span className="font-mono">{formatCurrency(empTotals.totalEntitlements)}</span>
                  </div>
                </div>

                {/* Deductions block */}
                <div className="space-y-1.5">
                  <div className="font-bold text-rose-800 border-b border-slate-100 pb-1 mb-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                    <span>الاستقطاعات</span>
                  </div>
                  {(emp.hasInsurance !== false && emp.insuranceDeduction > 0) && (
                    <div className="flex justify-between text-slate-600">
                      <span>تأمينات:</span>
                      <span className="font-semibold font-mono text-rose-600">{formatCurrency(emp.insuranceDeduction)}</span>
                    </div>
                  )}
                  {(emp.generalDeduction > 0) && (
                    <div className="flex justify-between text-slate-600">
                      <span>خصومات:</span>
                      <span className="font-semibold font-mono text-rose-600">{formatCurrency(emp.generalDeduction)}</span>
                    </div>
                  )}
                  {(emp.loan > 0) && (
                    <div className="flex justify-between text-slate-600">
                      <span>سلفة:</span>
                      <span className="font-semibold font-mono text-rose-600">{formatCurrency(emp.loan)}</span>
                    </div>
                  )}
                  {(emp.absenceDeduction > 0) && (
                    <div className="flex justify-between text-slate-600">
                      <span>غيابات:</span>
                      <span className="font-semibold font-mono text-rose-600">{formatCurrency(emp.absenceDeduction)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-rose-700 font-bold border-t border-slate-100 pt-1 mt-1">
                    <span>إجمالي الخصم:</span>
                    <span className="font-mono">{formatCurrency(empTotals.totalDeductions)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {employees.length === 0 && (
          <div className="py-8 text-center text-slate-500 font-medium bg-white rounded-xl border border-slate-200">
            لا توجد بيانات موظفين تطابق البحث أو الفلتر المختار
          </div>
        )}
      </div>

      {/* Signatures Footer (Mirrors Excel image bottom lines) */}
      <div className="hidden print:grid mt-2 pt-1 border-t border-slate-300 print:grid-cols-4 gap-4 text-center font-sans print-signatures-grid">
        
        {/* Signature 1: Prepared By */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs print:border-none print:shadow-none print:p-2">
          <p className="text-sm font-bold text-slate-700 mb-6">إعداد</p>
          {editingSig === 'preparedBy' ? (
            <div className="flex items-center justify-center gap-1">
              <input
                type="text"
                value={sigTempVal}
                onChange={(e) => setSigTempVal(e.target.value)}
                className="border rounded px-2 py-1 text-xs w-full text-center"
              />
              <button onClick={saveSigEdit} className="text-emerald-600"><Check className="w-4 h-4" /></button>
              <button onClick={() => setEditingSig(null)} className="text-rose-600"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <p 
              onClick={() => startSigEdit('preparedBy', signatures.preparedBy)}
              className={`text-xs font-semibold text-slate-800 border-t border-dashed border-slate-400 pt-2 ${readOnly || !isAlaa ? 'cursor-default' : 'cursor-pointer hover:text-blue-600'}`}
              title={readOnly || !isAlaa ? "التوقيع" : "اضغط لتعديل الاسم"}
            >
              {signatures.preparedBy || ''}
            </p>
          )}
        </div>

        {/* Signature 2: Accounts Manager */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs print:border-none print:shadow-none print:p-2">
          <p className="text-sm font-bold text-slate-700 mb-6">مدير الحسابات</p>
          {editingSig === 'accountsManager' ? (
            <div className="flex items-center justify-center gap-1">
              <input
                type="text"
                value={sigTempVal}
                onChange={(e) => setSigTempVal(e.target.value)}
                className="border rounded px-2 py-1 text-xs w-full text-center"
              />
              <button onClick={saveSigEdit} className="text-emerald-600"><Check className="w-4 h-4" /></button>
              <button onClick={() => setEditingSig(null)} className="text-rose-600"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <p 
              onClick={() => startSigEdit('accountsManager', signatures.accountsManager)}
              className={`text-xs font-semibold text-slate-800 border-t border-dashed border-slate-400 pt-2 ${readOnly || !isAlaa ? 'cursor-default' : 'cursor-pointer hover:text-blue-600'}`}
              title={readOnly || !isAlaa ? "التوقيع" : "اضغط لتعديل الاسم"}
            >
              {signatures.accountsManager}
            </p>
          )}
        </div>

        {/* Signature 3: Deputy General Manager */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs print:border-none print:shadow-none print:p-2">
          <p className="text-sm font-bold text-slate-700 mb-6">نائب المدير العام</p>
          {editingSig === 'deputyGeneralManager' ? (
            <div className="flex items-center justify-center gap-1">
              <input
                type="text"
                value={sigTempVal}
                onChange={(e) => setSigTempVal(e.target.value)}
                className="border rounded px-2 py-1 text-xs w-full text-center"
              />
              <button onClick={saveSigEdit} className="text-emerald-600"><Check className="w-4 h-4" /></button>
              <button onClick={() => setEditingSig(null)} className="text-rose-600"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <p 
              onClick={() => startSigEdit('deputyGeneralManager', signatures.deputyGeneralManager)}
              className={`text-xs font-semibold text-slate-800 border-t border-dashed border-slate-400 pt-2 ${readOnly || !isAlaa ? 'cursor-default' : 'cursor-pointer hover:text-blue-600'}`}
              title={readOnly || !isAlaa ? "التوقيع" : "اضغط لتعديل الاسم"}
            >
              {signatures.deputyGeneralManager}
            </p>
          )}
        </div>

        {/* Signature 4: Managing Director */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs print:border-none print:shadow-none print:p-2">
          <p className="text-sm font-bold text-slate-700 mb-6">العضو المنتدب</p>
          {editingSig === 'managingDirector' ? (
            <div className="flex items-center justify-center gap-1">
              <input
                type="text"
                value={sigTempVal}
                onChange={(e) => setSigTempVal(e.target.value)}
                className="border rounded px-2 py-1 text-xs w-full text-center"
              />
              <button onClick={saveSigEdit} className="text-emerald-600"><Check className="w-4 h-4" /></button>
              <button onClick={() => setEditingSig(null)} className="text-rose-600"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <p 
              onClick={() => startSigEdit('managingDirector', signatures.managingDirector)}
              className={`text-xs font-semibold text-slate-800 border-t border-dashed border-slate-400 pt-2 ${readOnly || !isAlaa ? 'cursor-default' : 'cursor-pointer hover:text-blue-600'}`}
              title={readOnly || !isAlaa ? "التوقيع" : "اضغط لتعديل الاسم"}
            >
              {signatures.managingDirector}
            </p>
          )}
        </div>

      </div>

    </div>
  );
};
