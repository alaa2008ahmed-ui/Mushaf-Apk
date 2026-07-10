import React, { useState } from 'react';
import { CalculatedEmployee } from '../types';
import { User } from '../../types';
import { formatCurrency, formatNumber, formatDateGB } from '../utils';
import { Printer, Edit, Trash2, UserCheck, UserX, Calendar, Briefcase, Building2 } from 'lucide-react';

interface Props {
  employees: CalculatedEmployee[];
  viewMode: 'cards' | 'table';
  onPrint: (employee: CalculatedEmployee) => void;
  onUpdateEmployee: (id: string, field: keyof CalculatedEmployee, value: any) => void;
  onEdit: (employee: CalculatedEmployee) => void;
  onDelete: (id: string) => void;
  currentUser?: User;
}

export default function EmployeeTable({ employees, viewMode, onPrint, onUpdateEmployee, onEdit, onDelete, currentUser }: Props) {
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const activeEmployees = employees.filter(e => e.isActive !== false);
  const isAlaa = currentUser?.username?.toLowerCase() === 'alaa';

  return (
    <div className="flex flex-col flex-grow w-full h-full gap-2">
      {viewMode === 'cards' ? (
        /* Mobile / Cards View */
        <div className="overflow-y-auto flex-grow w-full h-full">
          {employees.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 font-medium">
              لا يوجد موظفين في هذا القسم
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 pb-4 w-full">
              {employees.map((emp) => {
                const isDisabled = emp.isActive === false;
                return (
                  <div
                    key={emp.id}
                    className={`bg-white rounded-xl border transition-all p-3 shadow-sm hover:shadow-md flex flex-col justify-between ${
                      isDisabled ? 'border-rose-200 bg-rose-50/20 opacity-75' : 'border-slate-200'
                    }`}
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-1.5 border-b border-slate-100 pb-2 mb-2">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <h4 className={`font-bold text-sm ${isDisabled ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                              {emp.name}
                            </h4>
                          </div>
                          <div className="flex items-center gap-2 text-[10.5px] text-slate-500 font-medium">
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-3 h-3 text-indigo-500 shrink-0" />
                              <span className="truncate max-w-[100px]">{emp.jobTitle || emp.branch}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-amber-500 shrink-0" />
                              <span className="truncate max-w-[80px]">{emp.branch}</span>
                            </span>
                          </div>
                        </div>
                        <span className="bg-slate-100 text-slate-700 font-mono font-black text-[11px] px-2 py-0.5 rounded-md border border-slate-200 shrink-0">
                          #{emp.code || emp.sequenceNumber}
                        </span>
                      </div>

                      {/* Dates */}
                      <div className="flex items-center justify-between text-[10.5px] text-slate-500 bg-slate-50 p-1.5 rounded-lg mb-2.5 border border-slate-100">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>التعيين:</span>
                          <span className="font-mono font-bold text-slate-700">{formatDateGB(emp.hireDate)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>الخدمة:</span>
                          <span className="font-mono font-bold text-slate-700">{formatNumber(emp.totalWorkDurationYears)} سنة</span>
                        </div>
                      </div>

                      {/* Financial Metrics Grid */}
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="bg-indigo-50/60 border border-indigo-100 p-2 rounded-lg">
                          <span className="text-[10px] font-bold text-indigo-700 block mb-0.5">إجمالي الراتب</span>
                          <span className="text-xs font-mono font-black text-indigo-950">
                            {formatCurrency(emp.totalSalary)}
                          </span>
                        </div>
                        <div className="bg-amber-50/60 border border-amber-100 p-2 rounded-lg">
                          <span className="text-[10px] font-bold text-amber-700 block mb-0.5">مخصص الإجازة</span>
                          <span className="text-xs font-mono font-black text-amber-950">
                            {formatCurrency(emp.vacationAllowance)}
                          </span>
                        </div>
                        <div className="bg-rose-50/60 border border-rose-100 p-2 rounded-lg col-span-2 flex items-center justify-between">
                          <span className="text-[11px] font-bold text-rose-700">المستحق من نهاية الخدمة:</span>
                          <span className="text-sm font-mono font-black text-rose-950">
                            {formatCurrency(emp.dueEndOfService)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Table View */
        <div className="flex-grow w-full rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto overflow-y-auto max-h-[calc(100vh-210px)] print:max-h-none print:overflow-visible custom-scrollbar">
          <table className="w-full text-right border-collapse whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-30 shadow-md transition-all">
              <tr>
                <th className="py-2.5 px-3 text-[9.5px] font-bold text-slate-500 uppercase sticky top-0 md:right-0 bg-slate-50 z-40 w-12 text-center shadow-[0_1px_2px_rgba(0,0,0,0.05)]">م</th>
                <th className="py-2.5 px-3 text-[9.5px] font-bold text-slate-500 uppercase sticky top-0 text-center print:hidden bg-slate-50 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">كود الموظف</th>
                <th className="py-2.5 px-4 text-[9.5px] font-bold text-slate-500 uppercase sticky top-0 md:right-12 bg-slate-50 z-40 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">اسم الموظف</th>
                <th className="py-2.5 px-4 text-[9.5px] font-bold text-slate-500 uppercase sticky top-0 print:hidden bg-slate-50 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">الوظيفة</th>
                <th className="py-2.5 px-4 text-[9.5px] font-bold text-slate-500 uppercase sticky top-0 print:hidden bg-slate-50 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">جهة العمل</th>
                <th className="py-2.5 px-4 text-[9.5px] font-bold text-slate-500 uppercase sticky top-0 text-center bg-slate-50 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">تاريخ التعيين</th>
                <th className="py-2.5 px-4 text-[9.5px] font-bold text-slate-500 uppercase sticky top-0 text-center bg-slate-50 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">تاريخ العودة<br/>من اخر اجازة</th>
                <th className="py-2.5 px-4 text-[9.5px] font-bold text-slate-500 uppercase sticky top-0 text-center bg-slate-50 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">تاريخ<br/>الاحتساب</th>
                <th className="py-2.5 px-4 text-[9.5px] font-bold text-slate-500 uppercase sticky top-0 text-center bg-slate-50 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">مدة العمل<br/>الاجمالية</th>
                <th className="py-2.5 px-4 text-[9.5px] font-bold text-slate-500 uppercase sticky top-0 text-center bg-slate-50 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">مدة العمل<br/>من اخر اجازة</th>
                <th className="py-2.5 px-4 text-[9.5px] font-bold text-slate-500 uppercase sticky top-0 text-center bg-slate-50 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">الراتب<br/>الأساسي</th>
                <th className="py-2.5 px-4 text-[9.5px] font-bold text-slate-500 uppercase sticky top-0 text-center bg-slate-50 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">البدلات<br/>الثابتة</th>
                <th className="py-2.5 px-4 text-[9.5px] font-bold text-slate-500 uppercase sticky top-0 text-center text-indigo-600 bg-slate-50 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">اجمالي<br/>الراتب</th>
                <th className="py-2.5 px-4 text-[9.5px] font-bold text-slate-500 uppercase sticky top-0 text-center bg-slate-50 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">سعر<br/>التذكرة</th>
                <th className="py-2.5 px-4 text-[9.5px] font-bold text-slate-500 uppercase sticky top-0 text-center text-amber-600 bg-slate-50 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">مخصص<br/>التذاكر</th>
                <th className="py-2.5 px-4 text-[9.5px] font-bold text-slate-500 uppercase sticky top-0 text-center text-indigo-600 bg-slate-50 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">مخصص<br/>الاجازة</th>
                <th className="py-2.5 px-4 text-[9.5px] font-bold text-slate-500 uppercase sticky top-0 text-center text-rose-600 bg-slate-50 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">مخصص<br/>نهاية الخدمة</th>
                <th className="py-2.5 px-4 text-[9.5px] font-bold text-slate-500 uppercase sticky top-0 text-center text-slate-400 bg-slate-50 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">مسحوبات<br/>نهاية الخدمة</th>
                <th className="py-2.5 px-4 text-[9.5px] font-bold text-slate-500 uppercase sticky top-0 text-center text-emerald-600 bg-slate-50 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">المستحق من<br/>نهاية الخدمة</th>
                <th className="py-2.5 px-4 text-[9.5px] font-bold text-slate-500 uppercase sticky top-0 text-center print:hidden bg-slate-50 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={20} className="p-6 text-center text-slate-500 text-[11px]">
                    لا يوجد موظفين في هذا القسم
                  </td>
                </tr>
              ) : (
                employees.map((emp, index) => {
                  const isDisabled = emp.isActive === false;
                  const isSelected = selectedRowId === emp.id;
                  return (
                  <tr 
                    key={emp.id} 
                    onClick={() => setSelectedRowId(prev => prev === emp.id ? null : emp.id)}
                    className={`group transition-colors cursor-pointer ${
                      isSelected 
                        ? 'bg-amber-100/95 hover:bg-amber-200 shadow-md font-bold' 
                        : isDisabled 
                          ? 'bg-slate-100/80 opacity-60 hover:opacity-100 hover:bg-slate-100' 
                          : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className={`py-2.5 px-3 text-center md:sticky md:right-0 z-20 transition-colors text-[11px] ${
                      isSelected 
                        ? 'bg-amber-100 group-hover:bg-amber-200 text-amber-950 font-extrabold border-r-4 border-amber-500' 
                        : isDisabled ? 'bg-slate-100 group-hover:bg-slate-100' : 'bg-white group-hover:bg-slate-50'
                    }`}>{index + 1}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-[11px] text-slate-600 print:hidden">{emp.code || emp.sequenceNumber}</td>
                    <td className={`py-2.5 px-4 text-[11px] font-bold whitespace-nowrap md:sticky md:right-12 z-20 transition-colors ${
                      isSelected 
                        ? 'bg-amber-100 group-hover:bg-amber-200 text-amber-950 font-extrabold' 
                        : isDisabled ? 'bg-slate-100 group-hover:bg-slate-100 text-slate-500' : 'bg-white group-hover:bg-slate-50 text-slate-800'
                    }`}>
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <span className={isDisabled ? 'line-through whitespace-nowrap' : 'whitespace-nowrap'}>{emp.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-[11px] font-medium text-indigo-900 print:hidden">{emp.jobTitle || emp.branch}</td>
                    <td className="py-2.5 px-4 text-[11px] text-slate-600 print:hidden">{emp.branch}</td>
                    <td className="py-2.5 px-4 text-center text-[11px] text-slate-500 font-mono">{formatDateGB(emp.hireDate)}</td>
                    <td className="py-2.5 px-4 text-center text-[11px] text-slate-500 font-mono">{formatDateGB(emp.lastVacationReturnDate)}</td>
                    <td className="py-2.5 px-4 text-center text-[11px] text-slate-500 font-mono">{formatDateGB(emp.calculationDate)}</td>
                    
                    <td className="py-2.5 px-4 text-center text-[11px] font-mono">{formatNumber(emp.totalWorkDurationYears)}</td>
                    <td className="py-2.5 px-4 text-center text-[11px] font-mono">{formatNumber(emp.durationSinceLastVacationYears)}</td>
                    
                    <td className="py-2.5 px-4 text-center text-[11px] font-mono">{formatCurrency(emp.basicSalary)}</td>
                    <td className="py-2.5 px-4 text-center text-[11px] font-mono">{formatCurrency(emp.fixedAllowances)}</td>
                    <td className={`py-2.5 px-4 text-center text-[11px] font-mono font-bold ${
                      isSelected ? 'text-indigo-950 bg-amber-200/80 font-black' : 'text-indigo-600 bg-indigo-50/30'
                    }`}>{formatCurrency(emp.totalSalary)}</td>
                    
                    <td className="py-2.5 px-4 text-center text-[11px] font-mono">{formatCurrency(emp.ticketPrice)}</td>
                    <td className="py-2.5 px-4 text-center text-[11px] font-mono text-amber-600">{formatCurrency(emp.ticketAllowance)}</td>
                    <td className="py-2.5 px-4 text-center text-[11px] font-mono text-indigo-600">{formatCurrency(emp.vacationAllowance)}</td>
                    <td className={`py-2.5 px-4 text-center text-[11px] font-mono font-bold ${
                      isSelected ? 'text-rose-950 bg-amber-200/80 font-black' : 'text-rose-600 bg-rose-50/30'
                    }`}>{formatCurrency(emp.endOfServiceAllowance)}</td>
                    
                    <td className="py-2.5 px-4 text-center text-[11px] font-mono text-slate-400">{formatCurrency(emp.paidEndOfService)}</td>
                    <td className={`py-2.5 px-4 text-center text-[11px] font-mono font-bold ${
                      isSelected ? 'text-emerald-950 bg-amber-200/80 font-black' : 'text-emerald-600 bg-emerald-50/30'
                    }`}>{formatCurrency(emp.dueEndOfService)}</td>
                    
                    <td className="py-2.5 px-4 text-center print:hidden" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        {isAlaa && (
                          <button
                            onClick={() => onUpdateEmployee(emp.id, 'isActive', isDisabled ? true : false)}
                            className={`p-1.5 border rounded-lg transition-colors shadow-sm ${
                              isDisabled
                                ? 'border-rose-300 text-rose-600 bg-rose-100 hover:bg-rose-200'
                                : 'border-emerald-200 text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                            }`}
                            title={isDisabled ? 'الموظف معطل - انقر لتفعيله' : 'الموظف مفعل - انقر لتعطيله'}
                          >
                            {isDisabled ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>
                        )}
                        <button 
                          onClick={() => !isDisabled && onPrint(emp)}
                          disabled={isDisabled}
                          className={`p-1.5 border rounded-lg transition-colors shadow-sm ${isDisabled ? 'border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed' : 'border-slate-300 text-slate-600 bg-white hover:bg-slate-100'}`}
                          title={isDisabled ? 'الموظف معطل - لا يمكن طباعة بيانه' : 'طباعة'}
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        {isAlaa && (
                          <>
                            <button 
                              onClick={() => onEdit(emp)}
                              className="p-1.5 border border-blue-200 text-blue-600 rounded-lg bg-white hover:bg-blue-50 transition-colors shadow-sm"
                              title="تعديل"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => onDelete(emp.id)}
                              className="p-1.5 border border-rose-200 text-rose-600 rounded-lg bg-white hover:bg-rose-50 transition-colors shadow-sm"
                              title="حذف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
                })
              )}
            </tbody>
            {employees.length > 0 && (
              <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-bold sticky bottom-0 z-30 shadow-inner text-[11px]">
                <tr>
                  <td colSpan={10} className="py-3 px-4 text-left text-[11px] text-slate-700 md:sticky md:right-0 bg-slate-100 z-40">
                    الإجمالي الكلي ({activeEmployees.length} موظف):
                  </td>
                  <td className="py-3 px-4 text-center text-[11px] font-mono text-slate-800">
                    {formatCurrency(activeEmployees.reduce((sum, e) => sum + (e.basicSalary || 0), 0))}
                  </td>
                  <td className="py-3 px-4 text-center text-[11px] font-mono text-slate-800">
                    {formatCurrency(activeEmployees.reduce((sum, e) => sum + (e.fixedAllowances || 0), 0))}
                  </td>
                  <td className="py-3 px-4 text-center text-[11px] font-mono font-bold text-indigo-700 bg-indigo-100/60">
                    {formatCurrency(activeEmployees.reduce((sum, e) => sum + (e.totalSalary || 0), 0))}
                  </td>
                  <td className="py-3 px-4 text-center text-[11px] font-mono text-slate-600">-</td>
                  <td className="py-3 px-4 text-center text-[11px] font-mono text-amber-700">
                    {formatCurrency(activeEmployees.reduce((sum, e) => sum + (e.ticketAllowance || 0), 0))}
                  </td>
                  <td className="py-3 px-4 text-center text-[11px] font-mono text-indigo-700">
                    {formatCurrency(activeEmployees.reduce((sum, e) => sum + (e.vacationAllowance || 0), 0))}
                  </td>
                  <td className="py-3 px-4 text-center text-[11px] font-mono font-bold text-rose-700 bg-rose-100/60">
                    {formatCurrency(activeEmployees.reduce((sum, e) => sum + (e.endOfServiceAllowance || 0), 0))}
                  </td>
                  <td className="py-3 px-4 text-center text-[11px] font-mono text-slate-600">
                    {formatCurrency(activeEmployees.reduce((sum, e) => sum + (e.paidEndOfService || 0), 0))}
                  </td>
                  <td className="py-3 px-4 text-center text-[11px] font-mono font-bold text-emerald-700 bg-emerald-100/60">
                    {formatCurrency(activeEmployees.reduce((sum, e) => sum + (e.dueEndOfService || 0), 0))}
                  </td>
                  <td className="py-3 px-4 print:hidden"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  );
}

