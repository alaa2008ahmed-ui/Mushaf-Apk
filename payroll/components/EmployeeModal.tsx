import React, { useState, useEffect } from 'react';
import { Save, User, DollarSign, Building2, Briefcase, Calendar, ShieldAlert, ChevronRight, ChevronLeft } from 'lucide-react';
import { Employee } from '../types';
import { calculateEmployeeTotals, formatCurrency, getEmployeeFieldPhase } from '../utils/calculations';

const jobTitleTranslations: Record<string, string> = {
  'كيميائيه': 'Chemist',
  'كيميائية': 'Chemist',
  'كيميائي': 'Chemist',
  'محاسب': 'Accountant',
  'سائق': 'Driver',
  'عامل': 'Worker',
  'فني': 'Technician',
  'مدير': 'Manager',
  'مهندس': 'Engineer',
  'مبيعات': 'Sales',
  'مندوب مبيعات': 'Sales Representative',
  'مندوب': 'Representative',
  'مشرف': 'Supervisor',
  'حارس': 'Security',
  'سكرتير': 'Secretary',
  'شؤون موظفين': 'HR',
  'مسؤول': 'Officer',
  'مشغل': 'Operator'
};

const translateJobTitle = (arabicTitle: string) => {
  if (!arabicTitle) return '';
  for (const [ar, en] of Object.entries(jobTitleTranslations)) {
    if (arabicTitle.includes(ar)) {
      return en;
    }
  }
  return '';
};

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
    nationality: '',
    hasInsurance: false,
    isActive: true,
    basicSalary: '' as unknown as number,
    overtimeHours: '' as unknown as number,
    overtime: '' as unknown as number,
    communicationAllowance: '' as unknown as number,
    housingAllowance: '' as unknown as number,
    foodAllowance: '' as unknown as number,
    transportationAllowance: '' as unknown as number,
    commission: '' as unknown as number,
    bonus: '' as unknown as number,
    insuranceDeduction: '' as unknown as number,
    generalDeduction: '' as unknown as number,
    loan: '' as unknown as number,
    absenceDeduction: '' as unknown as number,
    endOfServicePaid: '' as unknown as number,
    paymentStage: '1'
  });

  const onSaveRef = React.useRef(onSave);
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  const isDirtyRef = React.useRef<boolean>(false);
  const lastSavedJsonRef = React.useRef<string>('');

  useEffect(() => {
    if (employeeToEdit) {
      setFormData(prev => {
        // Prevent overwriting current edits if it's the same employee and the modal is already open
        if (prev.id === employeeToEdit.id && prev.name !== undefined) {
           return prev;
        }
        isDirtyRef.current = false;
        lastSavedJsonRef.current = '';

        let parsedEnglishJobTitle = employeeToEdit.englishJobTitle || '';
        if (/[\u0600-\u06FF]/.test(parsedEnglishJobTitle)) {
           parsedEnglishJobTitle = translateJobTitle(parsedEnglishJobTitle) || translateJobTitle(employeeToEdit.jobTitle || '') || '';
        }

        return {
          ...employeeToEdit,
          nameEn: employeeToEdit.nameEn || '',
          nationalId: employeeToEdit.nationalId || '',
          iban: employeeToEdit.iban || '',
          nationality: employeeToEdit.nationality !== undefined ? employeeToEdit.nationality : '',
          hasInsurance: !!employeeToEdit.hasInsurance,
          isActive: employeeToEdit.isActive !== false,
          englishJobTitle: parsedEnglishJobTitle,
          showInOvertime1: employeeToEdit.showInOvertime1 !== false,
          showInOvertime2: employeeToEdit.showInOvertime2 !== false,
          showInDriversTab: !!employeeToEdit.showInDriversTab,
        };
      });
    } else {
      isDirtyRef.current = false;
      lastSavedJsonRef.current = '';
      setFormData({
        id: Date.now(),
        code: '',
        name: '',
        nameEn: '',
        nationalId: '',
        jobTitle: '',
        englishJobTitle: '',
        branch: '',
        hireDate: new Date().toISOString().split('T')[0],
        iban: '',
        nationality: '',
        hasInsurance: false,
        isActive: true,
        showInOvertime1: true,
        showInOvertime2: true,
        showInDriversTab: false,
        basicSalary: '' as unknown as number,
        overtimeHours: '' as unknown as number,
        overtime: '' as unknown as number,
        communicationAllowance: '' as unknown as number,
        housingAllowance: '' as unknown as number,
        foodAllowance: '' as unknown as number,
        transportationAllowance: '' as unknown as number,
        commission: '' as unknown as number,
        bonus: '' as unknown as number,
        insuranceDeduction: '' as unknown as number,
        generalDeduction: '' as unknown as number,
        loan: '' as unknown as number,
        absenceDeduction: '' as unknown as number,
        endOfServicePaid: '' as unknown as number,
        paymentStage: '1'
      });
    }
  }, [employeeToEdit, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (!isDirtyRef.current) return;

    // Helper to determine if actual values have changed from the original employeeToEdit
    const isFormDataChanged = (current: Partial<Employee>, original: Employee | null | undefined): boolean => {
      if (!original) {
        // For new employee, check if there is any substantial input
        return Object.entries(current).some(([key, val]) => {
          if (
            key === 'id' || 
            key === 'isActive' || 
            key === 'hasInsurance' || 
            key === 'paymentStage' || 
            key === 'showInOvertime1' || 
            key === 'showInOvertime2' || 
            key === 'showInDriversTab' || 
            key === 'hireDate'
          ) return false;
          return val !== '' && val !== 0 && val !== undefined;
        });
      }

      // Compare non-id fields
      const keysToCompare = Object.keys(current) as Array<keyof Employee>;
      for (const key of keysToCompare) {
        if (key === 'id') continue;

        let valCurrent = current[key];
        let valOriginal = original[key];

        if (valCurrent === undefined || valCurrent === null) valCurrent = '';
        if (valOriginal === undefined || valOriginal === null) valOriginal = '';

        if (key === 'isActive') {
          if (!!valCurrent !== (valOriginal !== false)) return true;
          continue;
        }
        if (key === 'hasInsurance') {
          if (!!valCurrent !== !!valOriginal) return true;
          continue;
        }
        if (key === 'showInOvertime1') {
          if (!!valCurrent !== (valOriginal !== false)) return true;
          continue;
        }
        if (key === 'showInOvertime2') {
          if (!!valCurrent !== (valOriginal !== false)) return true;
          continue;
        }
        if (key === 'showInDriversTab') {
          if (!!valCurrent !== !!valOriginal) return true;
          continue;
        }
        if (key === 'fieldPhases' || key === 'monthlyValues') {
          const strCurrent = typeof valCurrent === 'object' ? JSON.stringify(valCurrent) : String(valCurrent);
          const strOriginal = typeof valOriginal === 'object' ? JSON.stringify(valOriginal) : String(valOriginal);
          if (strCurrent !== strOriginal) return true;
          continue;
        }

        if (String(valCurrent) !== String(valOriginal)) {
          return true;
        }
      }
      return false;
    };

    const currentJson = JSON.stringify(formData);
    if (currentJson === lastSavedJsonRef.current) {
      return;
    }

    const changed = isFormDataChanged(formData, employeeToEdit);
    if (!changed) {
      return;
    }

    const timeoutId = setTimeout(() => {
      lastSavedJsonRef.current = currentJson;
      isDirtyRef.current = false;
      onSaveRef.current(formData as Employee);
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [formData, isOpen, employeeToEdit]);

  if (!isOpen) return null;

  const handleChange = (field: keyof Employee, value: string | number | boolean) => {
    isDirtyRef.current = true;
    setFormData(prev => {
      let numVal: any = value;
      if (typeof value === 'string' && !['name', 'nameEn', 'nationalId', 'code', 'jobTitle', 'englishJobTitle', 'branch', 'transferDate', 'hireDate', 'notes', 'iban', 'nationality'].includes(field)) {
        numVal = value === '' ? '' : (parseFloat(value) || 0);
      }
      
      let updated: any = { ...prev, [field]: numVal };

      if (field === 'jobTitle' && typeof value === 'string') {
         const translated = translateJobTitle(value);
         if (translated && (!updated.englishJobTitle || /[\u0600-\u06FF]/.test(updated.englishJobTitle))) {
             updated.englishJobTitle = translated;
         }
      }

      if (field === 'englishJobTitle' && typeof value === 'string') {
         // Optionally remove arabic characters
         updated.englishJobTitle = value.replace(/[\u0600-\u06FF]/g, '');
      }

      if (field === 'paymentStage') {
        updated.paymentStage = value as '1' | '2';
      }

      if (field === 'branch' && typeof value === 'string') {
         if (prev.branch && prev.branch !== 'الكل' && value !== prev.branch) {
             const localDate = new Date();
             const year = localDate.getFullYear();
             const month = String(localDate.getMonth() + 1).padStart(2, '0');
             const day = String(localDate.getDate()).padStart(2, '0');
             updated.transferDate = `${year}-${month}-${day}`;
         }
      }

      // Automatic Insurance Calculation
      if (field === 'basicSalary' || field === 'housingAllowance' || field === 'hasInsurance') {
        const isInsured = field === 'hasInsurance' ? (numVal as boolean) : (updated.hasInsurance !== false);
        if (isInsured) {
          const basic = Number(updated.basicSalary) || 0;
          const housing = Number(updated.housingAllowance) || 0;
          updated.insuranceDeduction = Number(((basic + housing) * (insurancePercentage / 100)).toFixed(2));
        } else {
          updated.insuranceDeduction = '' as unknown as number;
        }
      }

      if (field === 'overtimeHours') {
        const basic = Number(prev.basicSalary) || 0;
        const hourlyRate = (basic / 240) * 1.5;
        const hrs = numVal === '' ? 0 : Number(numVal);
        updated.overtime = hrs > 0 ? Number((hrs * hourlyRate).toFixed(2)) : ('' as unknown as number);
      }
      if (field === 'basicSalary' && prev.overtimeHours && Number(prev.overtimeHours) > 0) {
        const numBasic = numVal === '' ? 0 : Number(numVal);
        const hourlyRate = (numBasic / 240) * 1.5;
        updated.overtime = hourlyRate > 0 ? Number((Number(prev.overtimeHours) * hourlyRate).toFixed(2)) : ('' as unknown as number);
      }
      if (field === 'overtime' && prev.basicSalary && Number(prev.basicSalary) > 0) {
        const hourlyRate = (Number(prev.basicSalary) / 240) * 1.5;
        const ovt = numVal === '' ? 0 : Number(numVal);
        if (hourlyRate > 0) {
          updated.overtimeHours = ovt > 0 ? Number((ovt / hourlyRate).toFixed(2)) : ('' as unknown as number);
        }
      }

      if (field === 'absenceDays') {
        const basic = Number(updated.basicSalary) || 0;
        const dailyRate = basic / 30;
        const days = numVal === '' ? 0 : Number(numVal);
        updated.absenceDeduction = days > 0 ? Number((days * dailyRate).toFixed(2)) : ('' as unknown as number);
      }
      if (field === 'basicSalary' && prev.absenceDays && Number(prev.absenceDays) > 0) {
        const numBasic = numVal === '' ? 0 : Number(numVal);
        const dailyRate = numBasic / 30;
        updated.absenceDeduction = dailyRate > 0 ? Number((Number(prev.absenceDays) * dailyRate).toFixed(2)) : ('' as unknown as number);
      }
      if (field === 'absenceDeduction' && prev.basicSalary && Number(prev.basicSalary) > 0) {
        const dailyRate = Number(prev.basicSalary) / 30;
        const absDed = numVal === '' ? 0 : Number(numVal);
        if (dailyRate > 0) {
          updated.absenceDays = absDed > 0 ? Number((absDed / dailyRate).toFixed(2)) : ('' as unknown as number);
        }
      }

      return updated;
    });
  };

  const handleFieldPhaseChange = (field: string, phase: '1' | '2') => {
    isDirtyRef.current = true;
    setFormData(prev => {
      const currentPhases = { ...(prev.fieldPhases || {}) };
      currentPhases[field] = phase;
      
      if (field === 'overtime') currentPhases.overtimeHours = phase;
      if (field === 'overtimeHours') currentPhases.overtime = phase;
      if (field === 'absenceDeduction') currentPhases.absenceDays = phase;
      if (field === 'absenceDays') currentPhases.absenceDeduction = phase;

      const updated = {
        ...prev,
        fieldPhases: currentPhases
      };

      return updated;
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
                {!employeeToEdit || !employeeToEdit.name ? 'إضافة موظف' : `تعديل بيانات وراتب: ${employeeToEdit.name}`}
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
              className="px-5 py-2.5 text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={(e) => e.preventDefault()} className="p-6 overflow-y-auto space-y-6">
          
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
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-semibold"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">الوظيفة باللغة الإنجليزية / English Job Title</label>
                <input
                  type="text"
                  value={formData.englishJobTitle || ''}
                  onChange={(e) => handleChange('englishJobTitle', e.target.value)}
                  placeholder="e.g. Accountant, Driver..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-semibold text-left"
                  dir="ltr"
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
                <div className="relative">
                  <input
                    type="date"
                    lang="en-GB"
                    dir="ltr"
                    value={formData.hireDate || ''}
                    onChange={(e) => handleChange('hireDate', e.target.value)}
                    onClick={(e) => {
                      try { if (e.currentTarget.showPicker) e.currentTarget.showPicker(); } catch (err) {}
                    }}
                    className="relative w-full bg-slate-50 border border-slate-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-mono text-left custom-date-picker"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      try { if (input && input.showPicker) input.showPicker(); } catch (err) {}
                    }}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 focus:outline-none z-10"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                </div>
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

              <div className="sm:col-span-9">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ظهور الموظف في تبويبات الإضافي / Overtime Tabs Visibility
                </label>
                <div className="grid grid-cols-3 gap-3 h-[38px]">
                  {/* Overtime 1 */}
                  <button
                    type="button"
                    onClick={() => handleChange('showInOvertime1', formData.showInOvertime1 === false)}
                    className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer h-full ${
                      formData.showInOvertime1 !== false
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-800 hover:bg-indigo-100/80'
                        : 'bg-slate-100 border-slate-300 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${formData.showInOvertime1 !== false ? 'bg-indigo-500 animate-pulse' : 'bg-slate-400'}`}></span>
                      Overtime 1
                    </span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono">O1</span>
                  </button>

                  {/* Overtime 2 */}
                  <button
                    type="button"
                    onClick={() => handleChange('showInOvertime2', formData.showInOvertime2 === false)}
                    className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer h-full ${
                      formData.showInOvertime2 !== false
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-800 hover:bg-indigo-100/80'
                        : 'bg-slate-100 border-slate-300 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${formData.showInOvertime2 !== false ? 'bg-indigo-500 animate-pulse' : 'bg-slate-400'}`}></span>
                      Overtime 2
                    </span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono">O2</span>
                  </button>

                  {/* Drivers / Tankers */}
                  <button
                    type="button"
                    onClick={() => handleChange('showInDriversTab', !formData.showInDriversTab)}
                    className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer h-full ${
                      formData.showInDriversTab
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-800 hover:bg-indigo-100/80'
                        : 'bg-slate-100 border-slate-300 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${formData.showInDriversTab ? 'bg-indigo-500 animate-pulse' : 'bg-slate-400'}`}></span>
                      Drivers
                    </span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono">DT</span>
                  </button>
                </div>
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
                  value={formData.basicSalary !== undefined ? formData.basicSalary : ''}
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
                  value={formData.overtimeHours !== undefined ? formData.overtimeHours : ''}
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
                  value={formData.overtime !== undefined ? formData.overtime : ''}
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
                  value={formData.communicationAllowance !== undefined ? formData.communicationAllowance : ''}
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
                  value={formData.housingAllowance !== undefined ? formData.housingAllowance : ''}
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
                  value={formData.foodAllowance !== undefined ? formData.foodAllowance : ''}
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
                  value={formData.transportationAllowance !== undefined ? formData.transportationAllowance : ''}
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
                  value={formData.commission !== undefined ? formData.commission : ''}
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
                  value={formData.bonus !== undefined ? formData.bonus : ''}
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
                  value={formData.insuranceDeduction !== undefined ? formData.insuranceDeduction : ''}
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
                  value={formData.generalDeduction !== undefined ? formData.generalDeduction : ''}
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
                  value={formData.loan !== undefined ? formData.loan : ''}
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
                  value={formData.absenceDays !== undefined ? formData.absenceDays : ''}
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
                  value={formData.absenceDeduction !== undefined ? formData.absenceDeduction : ''}
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
