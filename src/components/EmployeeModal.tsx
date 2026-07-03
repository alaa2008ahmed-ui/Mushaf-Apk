import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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
    hireDate: '',
    lastVacationReturnDate: '',
    calculationDate: new Date().toISOString().split('T')[0],
    basicSalary: 0,
    housingAllowance: 0,
    transferAllowance: 0,
    phoneAllowance: 0,
    foodAllowance: 0,
    fixedAllowances: 0,
    ticketPrice: 0,
    paidEndOfService: 0,
    socialSecurity: 0,
    includeSocialSecurity: true,
    loans: 0,
    absence: 0,
    withdrawals: 0,
    notes: ''
  });

  useEffect(() => {
    if (employeeToEdit) {
      setFormData({
        code: employeeToEdit.code || String(employeeToEdit.sequenceNumber || ''),
        jobTitle: employeeToEdit.jobTitle || employeeToEdit.branch || '',
        name: employeeToEdit.name,
        branch: employeeToEdit.branch,
        hireDate: employeeToEdit.hireDate,
        lastVacationReturnDate: employeeToEdit.lastVacationReturnDate,
        calculationDate: employeeToEdit.calculationDate,
        basicSalary: employeeToEdit.basicSalary,
        housingAllowance: employeeToEdit.housingAllowance || 0,
        transferAllowance: employeeToEdit.transferAllowance || 0,
        phoneAllowance: employeeToEdit.phoneAllowance || 0,
        foodAllowance: employeeToEdit.foodAllowance || 0,
        fixedAllowances: employeeToEdit.fixedAllowances,
        ticketPrice: employeeToEdit.ticketPrice,
        paidEndOfService: employeeToEdit.paidEndOfService,
        socialSecurity: employeeToEdit.socialSecurity || 0,
        includeSocialSecurity: employeeToEdit.includeSocialSecurity !== false,
        loans: employeeToEdit.loans || 0,
        absence: employeeToEdit.absence || 0,
        withdrawals: employeeToEdit.withdrawals || 0,
        notes: employeeToEdit.notes || ''
      });
    } else {
      setFormData({
        code: '',
        jobTitle: '',
        name: '',
        branch: branches[0] || 'الادارة',
        hireDate: '',
        lastVacationReturnDate: '',
        calculationDate: new Date().toISOString().split('T')[0],
        basicSalary: 0,
        housingAllowance: 0,
        transferAllowance: 0,
        phoneAllowance: 0,
        foodAllowance: 0,
        fixedAllowances: 0,
        ticketPrice: 0,
        paidEndOfService: 0,
        socialSecurity: 0,
        includeSocialSecurity: true,
        loans: 0,
        absence: 0,
        withdrawals: 0,
        notes: ''
      });
    }
  }, [employeeToEdit, isOpen, branches]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const computedFixedAllowances = Number(formData.housingAllowance || 0) + Number(formData.transferAllowance || 0) + Number(formData.phoneAllowance || 0) + Number(formData.foodAllowance || 0);
    const dataToSave = { ...formData, fixedAllowances: computedFixedAllowances };
    if (employeeToEdit) {
      onSave({ ...employeeToEdit, ...dataToSave, id: employeeToEdit.id, sequenceNumber: employeeToEdit.sequenceNumber });
    } else {
      onSave({ ...dataToSave, isActive: true });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-[96vw] max-w-6xl max-h-[94vh] flex flex-col overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between p-5 border-b bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-3 h-8 bg-blue-600 rounded-full"></div>
            <h2 className="text-2xl font-black text-slate-800">
              {employeeToEdit ? `تعديل بيانات الموظف: ${employeeToEdit.name}` : 'إضافة موظف جديد'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:bg-slate-200 p-2 rounded-full transition-colors">
            <X size={26} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-grow space-y-6">
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
              <input 
                required 
                lang="en-GB"
                type={formData.hireDate ? "date" : "text"} 
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) => { if (!e.target.value) e.target.type = "text"; }}
                name="hireDate" 
                value={formData.hireDate} 
                onChange={handleChange} 
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700">تاريخ العودة من اخر إجازة</label>
              <input 
                required 
                lang="en-GB"
                type={formData.lastVacationReturnDate ? "date" : "text"} 
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) => { if (!e.target.value) e.target.type = "text"; }}
                name="lastVacationReturnDate" 
                value={formData.lastVacationReturnDate} 
                onChange={handleChange} 
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700">تاريخ الاحتساب</label>
              <input 
                required 
                lang="en-GB"
                type={formData.calculationDate ? "date" : "text"} 
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) => { if (!e.target.value) e.target.type = "text"; }}
                name="calculationDate" 
                value={formData.calculationDate} 
                onChange={handleChange} 
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono" 
              />
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
                  onClick={() => setFormData(prev => ({ ...prev, includeSocialSecurity: !prev.includeSocialSecurity }))}
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
          <button type="button" onClick={onClose} className="px-6 py-2.5 border border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-200 transition-colors">
            إلغاء
          </button>
          <button onClick={handleSubmit} type="button" className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md transition-all">
            {employeeToEdit ? 'حفظ التعديلات' : 'حفظ الموظف'}
          </button>
        </div>
      </div>
    </div>
  );
}
