import React, { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import { Employee } from '../types';
import { formatNumber } from '../utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Employee | Omit<Employee, 'id' | 'sequenceNumber'>) => void;
  branches: string[];
  employeeToEdit?: Employee | null;
}

export default function EmployeeModal({ isOpen, onClose, onSave, branches, employeeToEdit }: Props) {
  const [formData, setFormData] = useState({
    code: '',
    jobTitle: '',
    name: '',
    branch: branches[0] || 'الادارة',
    hireDate: new Date().toISOString().split('T')[0],
    lastVacationReturnDate: new Date().toISOString().split('T')[0],
    calculationDate: new Date().toISOString().split('T')[0],
    basicSalary: '' as unknown as number,
    housingAllowance: '' as unknown as number,
    transferAllowance: '' as unknown as number,
    phoneAllowance: '' as unknown as number,
    foodAllowance: '' as unknown as number,
    fixedAllowances: '' as unknown as number,
    ticketPrice: '' as unknown as number,
    paidEndOfService: '' as unknown as number,
    socialSecurity: '' as unknown as number,
    includeSocialSecurity: true,
    loans: '' as unknown as number,
    absence: '' as unknown as number,
    withdrawals: '' as unknown as number,
    notes: ''
  });

  useEffect(() => {
    const getVal = (val: any) => (val === undefined || val === null || val === '' ? '' : val);
    if (employeeToEdit) {
      setFormData({
        code: employeeToEdit.code || '',
        jobTitle: employeeToEdit.jobTitle || '',
        name: employeeToEdit.name,
        branch: employeeToEdit.branch || '',
        hireDate: employeeToEdit.hireDate,
        lastVacationReturnDate: employeeToEdit.lastVacationReturnDate,
        calculationDate: employeeToEdit.calculationDate,
        basicSalary: getVal(employeeToEdit.basicSalary) as unknown as number,
        housingAllowance: getVal(employeeToEdit.housingAllowance) as unknown as number,
        transferAllowance: getVal(employeeToEdit.transferAllowance) as unknown as number,
        phoneAllowance: getVal(employeeToEdit.phoneAllowance) as unknown as number,
        foodAllowance: getVal(employeeToEdit.foodAllowance) as unknown as number,
        fixedAllowances: getVal(employeeToEdit.fixedAllowances) as unknown as number,
        ticketPrice: getVal(employeeToEdit.ticketPrice) as unknown as number,
        paidEndOfService: getVal(employeeToEdit.paidEndOfService) as unknown as number,
        socialSecurity: getVal(employeeToEdit.socialSecurity) as unknown as number,
        includeSocialSecurity: employeeToEdit.includeSocialSecurity !== false,
        loans: getVal(employeeToEdit.loans) as unknown as number,
        absence: getVal(employeeToEdit.absence) as unknown as number,
        withdrawals: getVal(employeeToEdit.withdrawals) as unknown as number,
        notes: employeeToEdit.notes || ''
      });
    } else {
      setFormData({
        code: '',
        jobTitle: '',
        name: '',
        branch: branches[0] || 'الادارة',
        hireDate: new Date().toISOString().split('T')[0],
        lastVacationReturnDate: new Date().toISOString().split('T')[0],
        calculationDate: new Date().toISOString().split('T')[0],
        basicSalary: '' as unknown as number,
        housingAllowance: '' as unknown as number,
        transferAllowance: '' as unknown as number,
        phoneAllowance: '' as unknown as number,
        foodAllowance: '' as unknown as number,
        fixedAllowances: '' as unknown as number,
        ticketPrice: '' as unknown as number,
        paidEndOfService: '' as unknown as number,
        socialSecurity: '' as unknown as number,
        includeSocialSecurity: true,
        loans: '' as unknown as number,
        absence: '' as unknown as number,
        withdrawals: '' as unknown as number,
        notes: ''
      });
    }
  }, [employeeToEdit, isOpen, branches]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
      };

      const computedFixedAllowances = Number(updated.housingAllowance || 0) + Number(updated.transferAllowance || 0) + Number(updated.phoneAllowance || 0) + Number(updated.foodAllowance || 0);
      const dataToSave = { ...updated, fixedAllowances: computedFixedAllowances };

      if (employeeToEdit) {
        onSave({ ...employeeToEdit, ...dataToSave, id: employeeToEdit.id, sequenceNumber: employeeToEdit.sequenceNumber });
      } else {
        onSave({ ...dataToSave, isActive: true });
      }

      return updated;
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-[96vw] max-w-6xl max-h-[94vh] flex flex-col overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between p-5 border-b bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-3 h-8 bg-blue-600 rounded-full"></div>
            <h2 className="text-2xl font-black text-slate-800">
              {!employeeToEdit || !employeeToEdit.name ? 'إضافة موظف جديد' : `تعديل بيانات الموظف: ${employeeToEdit.name}`}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:bg-slate-200 p-2 rounded-full transition-colors">
            <X size={26} />
          </button>
        </div>
        
        <form onSubmit={(e) => e.preventDefault()} className="p-6 overflow-y-auto flex-grow space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700">كود الموظف</label>
              <input type="text" name="code" value={formData.code} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono" placeholder="مثال: 1008" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700">الوظيفة</label>
              <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="مثال: مبيعات، سائق..." />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-sm font-bold text-slate-700">اسم الموظف <span className="text-rose-500">*</span></label>
              <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-semibold" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700">جهة العمل (الفرع)</label>
              <select name="branch" value={formData.branch} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium">
                {branches.map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700">تاريخ التعيين</label>
              <div className="relative">
                <input 
                  required 
                  lang="en-GB"
                  dir="ltr"
                  type="date"
                  name="hireDate" 
                  value={formData.hireDate} 
                  onChange={handleChange} 
                  onClick={(e) => {
                    try { if (e.currentTarget.showPicker) e.currentTarget.showPicker(); } catch (err) {}
                  }}
                  className="relative w-full border border-slate-300 rounded-lg p-2.5 pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-left custom-date-picker" 
                />
                <button 
                  type="button"
                  tabIndex={-1}
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    try { if (input && input.showPicker) input.showPicker(); } catch (err) {}
                  }}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 focus:outline-none z-10"
                >
                  <Calendar className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700">تاريخ العودة من اخر إجازة</label>
              <div className="relative">
                <input 
                  required 
                  lang="en-GB"
                  dir="ltr"
                  type="date"
                  name="lastVacationReturnDate" 
                  value={formData.lastVacationReturnDate} 
                  onChange={handleChange} 
                  onClick={(e) => {
                    try { if (e.currentTarget.showPicker) e.currentTarget.showPicker(); } catch (err) {}
                  }}
                  className="relative w-full border border-slate-300 rounded-lg p-2.5 pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-left custom-date-picker" 
                />
                <button 
                  type="button"
                  tabIndex={-1}
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    try { if (input && input.showPicker) input.showPicker(); } catch (err) {}
                  }}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 focus:outline-none z-10"
                >
                  <Calendar className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700">تاريخ الاحتساب</label>
              <div className="relative">
                <input 
                  required 
                  lang="en-GB"
                  dir="ltr"
                  type="date"
                  name="calculationDate" 
                  value={formData.calculationDate} 
                  onChange={handleChange} 
                  onClick={(e) => {
                    try { if (e.currentTarget.showPicker) e.currentTarget.showPicker(); } catch (err) {}
                  }}
                  className="relative w-full border border-slate-300 rounded-lg p-2.5 pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-left custom-date-picker" 
                />
                <button 
                  type="button"
                  tabIndex={-1}
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    try { if (input && input.showPicker) input.showPicker(); } catch (err) {}
                  }}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 focus:outline-none z-10"
                >
                  <Calendar className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700">الراتب الأساسي</label>
              <input required type="number" min="0" step="0.01" name="basicSalary" value={formData.basicSalary} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono font-bold text-indigo-700 bg-indigo-50/40" />
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700">بدل السكن</label>
              <input required type="number" min="0" step="0.01" name="housingAllowance" value={formData.housingAllowance} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700">بدل النقل</label>
              <input required type="number" min="0" step="0.01" name="transferAllowance" value={formData.transferAllowance} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700">بدل اتصال</label>
              <input required type="number" min="0" step="0.01" name="phoneAllowance" value={formData.phoneAllowance} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700">بدل طعام</label>
              <input required type="number" min="0" step="0.01" name="foodAllowance" value={formData.foodAllowance} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono" />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700">سعر التذكرة</label>
              <input required type="number" min="0" step="0.01" name="ticketPrice" value={formData.ticketPrice} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700">مسحوبات نهاية خدمة (المدفوع)</label>
              <input required type="number" min="0" step="0.01" name="paidEndOfService" value={formData.paidEndOfService} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-slate-700">التأمينات الاجتماعية</label>
                <button
                  type="button"
                  onClick={() => setFormData(prev => {
                    const updated = { ...prev, includeSocialSecurity: !prev.includeSocialSecurity };
                    const computedFixedAllowances = Number(updated.housingAllowance || 0) + Number(updated.transferAllowance || 0) + Number(updated.phoneAllowance || 0) + Number(updated.foodAllowance || 0);
                    const dataToSave = { ...updated, fixedAllowances: computedFixedAllowances };
                    if (employeeToEdit) {
                      onSave({ ...employeeToEdit, ...dataToSave, id: employeeToEdit.id, sequenceNumber: employeeToEdit.sequenceNumber });
                    } else {
                      onSave({ ...dataToSave, isActive: true });
                    }
                    return updated;
                  })}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all border ${
                    formData.includeSocialSecurity !== false
                      ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-100 text-rose-700 border-rose-300 hover:bg-rose-200'
                  }`}
                  title="تفعيل أو تعطيل خصم التأمينات الاجتماعية في مخصص نهاية الخدمة ومخصص الإجازة"
                >
                  {formData.includeSocialSecurity !== false ? 'مفعل بالخصم ✓' : 'معطل ✕'}
                </button>
              </div>
              <input required type="number" min="0" step="0.01" name="socialSecurity" value={formData.socialSecurity} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700">السلفيات</label>
              <input required type="number" min="0" step="0.01" name="loans" value={formData.loans} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700">خصم إجازات</label>
              <input required type="number" min="0" step="0.01" name="absence" value={formData.absence} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono" />
            </div>
            
            <div className="space-y-1.5 md:col-span-3">
              <label className="block text-sm font-bold text-slate-700">ملاحظات</label>
              <input type="text" name="notes" value={formData.notes} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
            </div>
          </div>
          
          <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between">
            <div className="text-sm font-medium text-slate-600">
              إجمالي البدلات الثابتة (سكن + نقل + اتصال + طعام): <span className="font-bold text-indigo-700 font-mono">{formatNumber(Number(formData.housingAllowance||0) + Number(formData.transferAllowance||0) + Number(formData.phoneAllowance||0) + Number(formData.foodAllowance||0))} ر.س</span>
            </div>
            <div className="text-sm font-medium text-slate-600">
              إجمالي الراتب المتوقع: <span className="font-bold text-emerald-700 font-mono text-base">{formatNumber(Number(formData.basicSalary||0) + Number(formData.housingAllowance||0) + Number(formData.transferAllowance||0) + Number(formData.phoneAllowance||0) + Number(formData.foodAllowance||0))} ر.س</span>
            </div>
          </div>
        </form>

        <div className="p-5 bg-slate-50 border-t flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-700 font-bold transition-all">
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
