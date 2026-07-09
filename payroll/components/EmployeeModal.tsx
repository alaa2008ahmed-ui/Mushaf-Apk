import React, { useState, useEffect } from 'react';
import { Save, User, DollarSign, Building2, Briefcase, Calendar, ShieldAlert, ChevronRight, ChevronLeft } from 'lucide-react';
import { Employee } from '../types';
import { calculateEmployeeTotals, formatCurrency, getEmployeeFieldPhase } from '../utils/calculations';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (emp: Employee) => void;
  employeeToEdit?: Employee | null;
  branches: string[];
  insurancePercentage: number;
  onNext?: () => void;
  onPrev?: () => void;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  employeeToEdit,
  branches,
  insurancePercentage,
  onNext,
  onPrev
}) => {
  const [formData, setFormData] = useState<Partial<Employee>>({
    code: '',
    name: '',
    nameEn: '',
    nationalId: '',
    jobTitle: '',
    branch: branches.length > 1 ? branches[1] : 'الادارة',
    hireDate: new Date().toISOString().split('T')[0],
    iban: '',
    nationality: 'سعودي',
    hasInsurance: true,
    basicSalary: 3000,
    overtime: 0,
    communicationAllowance: 0,
    housingAllowance: 500,
    foodAllowance: 200,
    transportationAllowance: 0,
    commission: 0,
    bonus: 0,
    insuranceDeduction: 300,
    generalDeduction: 0,
    loan: 0,
    absenceDeduction: 0,
    endOfServicePaid: 0,
    paymentStage: '1'
  });

  useEffect(() => {
    if (employeeToEdit) {
      setFormData({
        ...employeeToEdit,
        nameEn: employeeToEdit.nameEn || '',
        nationalId: employeeToEdit.nationalId || '',
        iban: employeeToEdit.iban || '',
        nationality: employeeToEdit.nationality || 'سعودي',
        hasInsurance: employeeToEdit.hasInsurance !== false,
        isActive: employeeToEdit.isActive !== false,
      });
    } else {
      setFormData({
        code: Math.floor(1000 + Math.random() * 9000).toString(),
        name: '',
        nameEn: '',
        nationalId: '',
        jobTitle: 'مبيعات',
        branch: branches.length > 1 ? branches[1] : 'الادارة',
        hireDate: new Date().toISOString().split('T')[0],
        iban: '',
        nationality: 'سعودي',
        hasInsurance: true,
        isActive: true,
        basicSalary: 3000,
        overtimeHours: 0,
        overtime: 0,
        communicationAllowance: 0,
        housingAllowance: 500,
        foodAllowance: 200,
        transportationAllowance: 0,
        commission: 0,
        bonus: 0,
        insuranceDeduction: 300,
        generalDeduction: 0,
        loan: 0,
        absenceDeduction: 0,
        endOfServicePaid: 0,
        paymentStage: '1'
      });
    }
  }, [employeeToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: keyof Employee, value: string | number | boolean) => {
    setFormData(prev => {
      let numVal: any = value;
      if (typeof value === 'string' && !['name', 'nameEn', 'nationalId', 'code', 'jobTitle', 'branch', 'hireDate', 'notes', 'iban', 'nationality'].includes(field)) {
        numVal = parseFloat(value) || 0;
      }
      
      let updated: any = { ...prev, [field]: numVal };

      if (field === 'paymentStage') {
        updated.paymentStage = value as '1' | '2';
      }

      // Automatic Insurance Calculation
      if (field === 'basicSalary' || field === 'housingAllowance' || field === 'hasInsurance') {
        const isInsured = field === 'hasInsurance' ? (numVal as boolean) : (updated.hasInsurance !== false);
        if (isInsured) {
          const basic = updated.basicSalary || 0;
          const housing = updated.housingAllowance || 0;
          updated.insuranceDeduction = Number(((basic + housing) * (insurancePercentage / 100)).toFixed(2));
        } else {
          updated.insuranceDeduction = 0;
        }
      }

      if (field === 'overtimeHours') {
        const basic = prev.basicSalary || 0;
        const hourlyRate = (basic / 240) * 1.5;
        updated.overtime = Number(((numVal as number) * hourlyRate).toFixed(2));
      }
      if (field === 'basicSalary' && prev.overtimeHours && prev.overtimeHours > 0) {
        const hourlyRate = ((numVal as number) / 240) * 1.5;
        updated.overtime = Number((prev.overtimeHours * hourlyRate).toFixed(2));
      }
      if (field === 'overtime' && prev.basicSalary && prev.basicSalary > 0) {
        const hourlyRate = (prev.basicSalary / 240) * 1.5;
        if (hourlyRate > 0) {
          updated.overtimeHours = Number(((numVal as number) / hourlyRate).toFixed(2));
        }
      }

      if (field === 'absenceDays') {
        const basic = updated.basicSalary || 0;
        const dailyRate = basic / 30;
        updated.absenceDeduction = Number(((numVal as number) * dailyRate).toFixed(2));
      }
      if (field === 'basicSalary' && prev.absenceDays && prev.absenceDays > 0) {
        const dailyRate = (numVal as number) / 30;
        updated.absenceDeduction = Number((prev.absenceDays * dailyRate).toFixed(2));
      }
      if (field === 'absenceDeduction' && prev.basicSalary && prev.basicSalary > 0) {
        const dailyRate = prev.basicSalary / 30;
        if (dailyRate > 0) {
          updated.absenceDays = Number(((numVal as number) / dailyRate).toFixed(2));
        }
      }

      return updated;
    });
  };

  const handleFieldPhaseChange = (field: string, phase: '1' | '2') => {
    setFormData(prev => {
      const currentPhases = { ...(prev.fieldPhases || {}) };
      currentPhases[field] = phase;
      
      if (field === 'overtime') currentPhases.overtimeHours = phase;
      if (field === 'overtimeHours') currentPhases.overtime = phase;
      if (field === 'absenceDeduction') currentPhases.absenceDays = phase;
      if (field === 'absenceDays') currentPhases.absenceDeduction = phase;

      return {
        ...prev,
        fieldPhases: currentPhases
      };
    });
  };

  const renderPhaseButtons = (field: string, isRoseTheme: boolean = false) => {
    const currentPhase = getEmployeeFieldPhase(formData as Employee, field);
    return (
      <div className={`flex items-center p-0.5 rounded border text-[10px] font-bold shrink-0 ${isRoseTheme ? 'bg-rose-100/70 border-rose-300' : 'bg-emerald-100/70 border-emerald-300'}`}>
        <button
          type="button"
          onClick={() => handleFieldPhaseChange(field, '1')}
          title="تخصيص للمرحلة الأولى"
          className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
            currentPhase === '1'
              ? isRoseTheme ? 'bg-rose-600 text-white shadow-xs' : 'bg-emerald-600 text-white shadow-xs'
              : isRoseTheme ? 'text-rose-800 hover:bg-rose-200/50' : 'text-emerald-800 hover:bg-emerald-200/50'
          }`}
        >
          م1
        </button>
        <button
          type="button"
          onClick={() => handleFieldPhaseChange(field, '2')}
          title="تخصيص للمرحلة الثانية"
          className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
            currentPhase === '2'
              ? isRoseTheme ? 'bg-rose-600 text-white shadow-xs' : 'bg-emerald-600 text-white shadow-xs'
              : isRoseTheme ? 'text-rose-800 hover:bg-rose-200/50' : 'text-emerald-800 hover:bg-emerald-200/50'
          }`}
        >
          م2
        </button>
      </div>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      alert("يرجى إدخال اسم الموظف والكود");
      return;
    }
    onSave(formData as Employee);
    onClose();
  };

  // Live calculation preview
  const totals = calculateEmployeeTotals(formData as Employee);

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-0 sm:p-2 overflow-y-auto font-sans" dir="rtl">
      <div className="bg-white sm:rounded-xl shadow-2xl w-full h-full sm:w-[98%] sm:h-[98%] overflow-hidden flex flex-col border border-slate-200">
        
        {/* Modal Header */}
        <div className="bg-white text-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-200 shadow-2xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold">
                {employeeToEdit ? `تعديل بيانات وراتب: ${employeeToEdit.name}` : 'إضافة موظف'}
              </h3>
            </div>
            {employeeToEdit && (
              <div className="flex items-center gap-1 border-r border-slate-200 pr-4 mr-2">
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); if (onPrev) onPrev(); }}
                  disabled={!onPrev}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  title="الموظف السابق"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); if (onNext) onNext(); }}
                  disabled={!onNext}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  title="الموظف التالي"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              إلغاء
            </button>
            <button
              onClick={handleSubmit}
              type="submit"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>حفظ بيانات الموظف</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          
          {/* Section 1: Basic Information */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-blue-600" />
              البيانات الوظيفية والأساسية
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-6">
                <label className="block text-xs font-semibold text-slate-700 mb-1">اسم الموظف باللغة العربية <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="الاسم الرباعي بالعربية"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-semibold"
                />
              </div>

              <div className="sm:col-span-6">
                <label className="block text-xs font-semibold text-slate-700 mb-1">اسم الموظف باللغة الإنجليزية <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.nameEn || ''}
                  onChange={(e) => handleChange('nameEn', e.target.value)}
                  placeholder="Full Name in English"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-semibold text-left"
                  dir="ltr"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">كود الموظف <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.code || ''}
                  onChange={(e) => handleChange('code', e.target.value)}
                  placeholder="مثال: 1045"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">رقم الهوية / الإقامة <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.nationalId || ''}
                  onChange={(e) => handleChange('nationalId', e.target.value)}
                  placeholder="رقم الهوية الوطنية أو الإقامة"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-left"
                  dir="ltr"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">الوظيفة</label>
                <input
                  type="text"
                  value={formData.jobTitle || ''}
                  onChange={(e) => handleChange('jobTitle', e.target.value)}
                  placeholder="مثال: محاسب، مبيعات، سائق..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">الجنسية</label>
                <input
                  type="text"
                  value={formData.nationality || ''}
                  onChange={(e) => handleChange('nationality', e.target.value)}
                  placeholder="مثال: سعودي، مصري..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-semibold"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">الإدارة / الفرع</label>
                <select
                  value={formData.branch || ''}
                  onChange={(e) => handleChange('branch', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-semibold"
                >
                  {branches.filter(b => b !== 'الكل').map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                  {!branches.filter(b => b !== 'الكل').includes(formData.branch || '') && formData.branch && (
                    <option value={formData.branch}>{formData.branch}</option>
                  )}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">تاريخ التعيين</label>
                <input
                  type="date"
                  value={formData.hireDate || ''}
                  onChange={(e) => handleChange('hireDate', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-mono"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">رقم الآيبان (IBAN)</label>
                <input
                  type="text"
                  value={formData.iban || ''}
                  onChange={(e) => handleChange('iban', e.target.value)}
                  placeholder="SA00 0000 0000 0000 0000 0000"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-left animate-fade-in"
                  dir="ltr"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">حالة تفعيل الموظف</label>
                <button
                  type="button"
                  onClick={() => handleChange('isActive', formData.isActive === false)}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-bold border transition-all h-[38px] cursor-pointer ${
                    formData.isActive !== false
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100/80'
                      : 'bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${formData.isActive !== false ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                    {formData.isActive !== false ? 'موظف نشط' : 'موظف معطل'}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                    formData.isActive !== false ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                  }`}>
                    {formData.isActive !== false ? 'نشط' : 'معطل'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Section 2: Entitlements (إستحقاقات) */}
          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-3 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              الاستحقاقات المالية والبدلات (ر.س)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <label className="text-[11px] font-semibold text-emerald-900 truncate">الراتب الأساسي</label>
                  {renderPhaseButtons('basicSalary')}
                </div>
                <input
                  type="number"
                  min="0"
                  value={formData.basicSalary || 0}
                  onChange={(e) => handleChange('basicSalary', e.target.value)}
                  onFocus={(e) => e.target.select()}
                  className="w-full bg-white border border-emerald-300 rounded-lg px-3 py-1.5 text-sm font-mono font-bold text-slate-800 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <label className="text-[11px] font-semibold text-emerald-900 truncate">ساعات العمل / الإضافي</label>
                  {renderPhaseButtons('overtimeHours')}
                </div>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={formData.overtimeHours || 0}
                  onChange={(e) => handleChange('overtimeHours', e.target.value)}
                  onFocus={(e) => e.target.select()}
                  className="w-full bg-white border border-emerald-300 rounded-lg px-3 py-1.5 text-sm font-mono text-amber-700 font-bold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <label className="text-[11px] font-semibold text-emerald-900 truncate">مبلغ الإضافي (ر.س)</label>
                  {renderPhaseButtons('overtime')}
                </div>
                <input
                  type="number"
                  min="0"
                  disabled
                  value={formData.overtime || 0}
                  onChange={(e) => handleChange('overtime', e.target.value)}
                  onFocus={(e) => e.target.select()}
                  className="w-full bg-slate-100 border border-emerald-300 rounded-lg px-3 py-1.5 text-sm font-mono text-blue-700 font-bold cursor-not-allowed focus:outline-none focus:border-emerald-600"
                  title="يتم احتسابه تلقائياً بناء على ساعات العمل | Overtime is automatically calculated based on working hours"
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <label className="text-[11px] font-semibold text-emerald-900 truncate">بدل اتصال</label>
                  {renderPhaseButtons('communicationAllowance')}
                </div>
                <input
                  type="number"
                  min="0"
                  value={formData.communicationAllowance || 0}
                  onChange={(e) => handleChange('communicationAllowance', e.target.value)}
                  className="w-full bg-white border border-emerald-300 rounded-lg px-3 py-1.5 text-sm font-mono text-slate-800 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <label className="text-[11px] font-semibold text-emerald-900 truncate">بدل سكن</label>
                  {renderPhaseButtons('housingAllowance')}
                </div>
                <input
                  type="number"
                  min="0"
                  value={formData.housingAllowance || 0}
                  onChange={(e) => handleChange('housingAllowance', e.target.value)}
                  className="w-full bg-white border border-emerald-300 rounded-lg px-3 py-1.5 text-sm font-mono text-slate-800 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <label className="text-[11px] font-semibold text-emerald-900 truncate">بدل طعام</label>
                  {renderPhaseButtons('foodAllowance')}
                </div>
                <input
                  type="number"
                  min="0"
                  value={formData.foodAllowance || 0}
                  onChange={(e) => handleChange('foodAllowance', e.target.value)}
                  className="w-full bg-white border border-emerald-300 rounded-lg px-3 py-1.5 text-sm font-mono text-slate-800 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <label className="text-[11px] font-semibold text-emerald-900 truncate">بدل مواصلات</label>
                  {renderPhaseButtons('transportationAllowance')}
                </div>
                <input
                  type="number"
                  min="0"
                  value={formData.transportationAllowance || 0}
                  onChange={(e) => handleChange('transportationAllowance', e.target.value)}
                  className="w-full bg-white border border-emerald-300 rounded-lg px-3 py-1.5 text-sm font-mono text-slate-800 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <label className="text-[11px] font-semibold text-emerald-900 truncate">عمولة مبيعات</label>
                  {renderPhaseButtons('commission')}
                </div>
                <input
                  type="number"
                  min="0"
                  value={formData.commission || 0}
                  onChange={(e) => handleChange('commission', e.target.value)}
                  className="w-full bg-white border border-emerald-300 rounded-lg px-3 py-1.5 text-sm font-mono text-blue-700 font-bold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <label className="text-[11px] font-semibold text-emerald-900 truncate">مكافأة / بدلات أخرى</label>
                  {renderPhaseButtons('bonus')}
                </div>
                <input
                  type="number"
                  min="0"
                  value={formData.bonus || 0}
                  onChange={(e) => handleChange('bonus', e.target.value)}
                  className="w-full bg-white border border-emerald-300 rounded-lg px-3 py-1.5 text-sm font-mono text-blue-700 font-bold focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Deductions (إستقطاعات) */}
          <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-200/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 mb-3 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              الاستقطاعات والخصومات (ر.س)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-rose-900 mb-1">الاشتراك في التأمينات الاجتماعية</label>
                <button
                  type="button"
                  onClick={() => handleChange('hasInsurance', formData.hasInsurance === false)}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all h-[38px] cursor-pointer ${
                    formData.hasInsurance !== false
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100/80'
                      : 'bg-slate-100 border-slate-300 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${formData.hasInsurance !== false ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                    {formData.hasInsurance !== false ? 'مفعل ومستقطع' : 'معطل'}
                  </span>
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <label className="text-[11px] font-semibold text-rose-900 truncate">التأمينات</label>
                  {renderPhaseButtons('insuranceDeduction', true)}
                </div>
                <input
                  type="number"
                  min="0"
                  disabled={formData.hasInsurance === false}
                  value={formData.hasInsurance !== false ? (formData.insuranceDeduction || 0) : 0}
                  onChange={(e) => handleChange('insuranceDeduction', e.target.value)}
                  className={`w-full border rounded-lg px-2 py-1.5 text-xs font-mono font-bold focus:outline-none h-[38px] ${
                    formData.hasInsurance !== false
                      ? 'bg-white border-rose-300 text-rose-800 focus:border-rose-600'
                      : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <label className="text-[11px] font-semibold text-rose-900 truncate">خصم عام</label>
                  {renderPhaseButtons('generalDeduction', true)}
                </div>
                <input
                  type="number"
                  min="0"
                  value={formData.generalDeduction || 0}
                  onChange={(e) => handleChange('generalDeduction', e.target.value)}
                  className="w-full bg-white border border-rose-300 rounded-lg px-2 py-1.5 text-xs font-mono text-rose-800 font-bold focus:outline-none focus:border-rose-600 h-[38px]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <label className="text-[11px] font-semibold text-rose-900 truncate">سلفة مالية</label>
                  {renderPhaseButtons('loan', true)}
                </div>
                <input
                  type="number"
                  min="0"
                  value={formData.loan || 0}
                  onChange={(e) => handleChange('loan', e.target.value)}
                  className="w-full bg-white border border-rose-300 rounded-lg px-2 py-1.5 text-xs font-mono text-rose-800 font-bold focus:outline-none focus:border-rose-600 h-[38px]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <label className="text-[11px] font-semibold text-rose-900 truncate">ايام غياب</label>
                  {renderPhaseButtons('absenceDays', true)}
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.absenceDays || 0}
                  onChange={(e) => handleChange('absenceDays', e.target.value)}
                  className="w-full bg-white border border-rose-300 rounded-lg px-2 py-1.5 text-xs font-mono text-rose-800 font-bold focus:outline-none focus:border-rose-600 h-[38px]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <label className="text-[11px] font-semibold text-rose-900 truncate">خصم غياب</label>
                  {renderPhaseButtons('absenceDeduction', true)}
                </div>
                <input
                  type="number"
                  min="0"
                  value={formData.absenceDeduction || 0}
                  onChange={(e) => handleChange('absenceDeduction', e.target.value)}
                  className="w-full bg-white border border-rose-300 rounded-lg px-2 py-1.5 text-xs font-mono text-rose-800 font-bold focus:outline-none focus:border-rose-600 h-[38px]"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Live Summary Bar */}
          <div className="bg-slate-900 text-white p-4 rounded-xl grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-slate-400">إجمالي الاستحقاقات</p>
              <p className="text-base font-bold text-emerald-400 font-mono">{formatCurrency(totals.totalEntitlements)} <span className="text-xs font-normal">ر.س</span></p>
            </div>
            <div className="border-x border-slate-700">
              <p className="text-xs text-slate-400">إجمالي الاستقطاعات</p>
              <p className="text-base font-bold text-rose-400 font-mono">{formatCurrency(totals.totalDeductions)} <span className="text-xs font-normal">ر.س</span></p>
            </div>
            <div>
              <p className="text-xs text-slate-400">صافي الراتب المستحق</p>
              <p className="text-lg font-extrabold text-amber-300 font-mono">{formatCurrency(totals.netSalary)} <span className="text-xs font-normal">ر.س</span></p>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
