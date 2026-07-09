import React, { useState } from 'react';
import { Employee } from '../types';
import { Database, ShieldCheck, AlertTriangle, CheckCircle, FileText, Building2, Save, Palette, Check, Calculator, Lock } from 'lucide-react';
import { getCompanyNameAr, getCompanyNameEn, saveCompanyNames } from '../utils/companySettings';
import { usePrintTemplates, PRINT_TEMPLATE_OPTIONS, PrintTemplateId } from '../utils/printTemplates';
import { getFormulaSettings, saveFormulaSettings, FormulaSettings } from '../utils/formulaSettings';

interface Props {
  employees: Employee[];
}

export default function SettingsView({ employees }: Props) {
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const [companyNameArInput, setCompanyNameArInput] = useState<string>(getCompanyNameAr());
  const [companyNameEnInput, setCompanyNameEnInput] = useState<string>(getCompanyNameEn());

  const { printTemplates, setSectionTemplate } = usePrintTemplates();

  const [formulaSettings, setFormulaSettings] = useState<FormulaSettings>(getFormulaSettings());
  const [isFormulaUnlocked, setIsFormulaUnlocked] = useState<boolean>(false);
  const [formulaPasswordInput, setFormulaPasswordInput] = useState<string>( '');

  const handleUnlockFormulas = (e: React.FormEvent) => {
    e.preventDefault();
    if (formulaPasswordInput.trim() === '0120301012') {
      setIsFormulaUnlocked(true);
      setFormulaPasswordInput('');
      setStatusMessage({
        type: 'success',
        text: 'تم فتح قفل الربط المحاسبي بنجاح.'
      });
    } else {
      setStatusMessage({
        type: 'error',
        text: 'كلمة السر غير صحيحة. يرجى إدخال كلمة السر المصرح بها لفتح قفل الإعدادات.'
      });
    }
  };

  const handleSaveFormulaSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveFormulaSettings(formulaSettings);
    setStatusMessage({
      type: 'success',
      text: 'تم حفظ وتحديث المعادلات المحاسبية بنجاح والمزامنة سحابياً فوراً لجميع الأجهزة والربط المالي بالبرنامج.'
    });
  };

  const handleSaveCompanySettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyNameArInput.trim() || !companyNameEnInput.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'يرجى إدخال اسم الشركة باللغتين العربية والإنجليزية.'
      });
      return;
    }
    saveCompanyNames(companyNameArInput.trim(), companyNameEnInput.trim());
    setStatusMessage({
      type: 'success',
      text: 'تم حفظ وتحديث اسم الشركة بنجاح. سيتم اعتماده فوراً في جميع الطباعة وملفات الإكسيل.'
    });
  };

  return (
    <div className="p-4 sm:p-6 w-full flex-grow flex flex-col justify-start text-right font-sans" dir="rtl">
      {statusMessage && (
        <div className={`p-3 rounded-xl border mb-4 flex items-start gap-3 transition-all ${
          statusMessage.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
          statusMessage.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" /> :
           statusMessage.type === 'error' ? <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" /> :
           <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />}
          <div className="text-xs font-bold">{statusMessage.text}</div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Company Settings Card (takes 1 column or 3 depending on screen size) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:border-indigo-200 transition-colors lg:col-span-3">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Building2 className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-800">بيانات واسم الشركة</h2>
          </div>

          <form onSubmit={handleSaveCompanySettings} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">اسم الشركة (باللغة العربية)</label>
              <input
                type="text"
                value={companyNameArInput}
                onChange={(e) => setCompanyNameArInput(e.target.value)}
                placeholder="مثال: شركة المياه العذبة المحدودة"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-bold text-slate-800"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">اسم الشركة (باللغة الإنجليزية)</label>
              <input
                type="text"
                value={companyNameEnInput}
                onChange={(e) => setCompanyNameEnInput(e.target.value)}
                placeholder="Example: Sweet Water Company Ltd"
                dir="ltr"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-bold text-slate-800 text-left"
                required
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="py-1.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 text-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>حفظ اسم الشركة</span>
              </button>
            </div>
          </form>
        </div>

        {/* Calculation Formulas & Accounting Link Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:border-indigo-200 transition-colors lg:col-span-3">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
              <Calculator className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-800">الربط المحاسبى</h2>
          </div>

          {!isFormulaUnlocked ? (
            <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-3 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 animate-pulse">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="text-right">
                  <h3 className="text-xs font-bold text-slate-950">الربط المحاسبي محمي بكلمة مرور</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">يرجى إدخال كلمة السر المصرح بها للتعديل على معادلات الحساب.</p>
                </div>
              </div>
              <form onSubmit={handleUnlockFormulas} className="flex items-center gap-2 w-full md:w-auto max-w-xs shrink-0">
                <input
                  type="password"
                  placeholder="كلمة المرور..."
                  value={formulaPasswordInput}
                  onChange={(e) => setFormulaPasswordInput(e.target.value)}
                  className="w-full md:w-36 px-3 py-1.5 rounded-lg border border-slate-300 font-bold text-slate-800 focus:ring-1 focus:ring-amber-500 outline-none text-center text-xs"
                />
                <button
                  type="submit"
                  className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-1 text-xs whitespace-nowrap shadow-sm"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>فتح القفل</span>
                </button>
              </form>
            </div>
          ) : (
            <form onSubmit={handleSaveFormulaSettings} className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                
                {/* Vacation Allowance Card */}
                <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="font-bold text-slate-800 text-xs pb-1.5 border-b border-slate-200 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>مخصص الإجازة ومستحقاتها</span>
                    </h3>
                    
                    <div className="space-y-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">أساس الراتب المعتمد:</label>
                        <select
                          value={formulaSettings.vacationSalaryBasis}
                          onChange={(e) => setFormulaSettings(prev => ({ ...prev, vacationSalaryBasis: e.target.value as 'total' | 'basic' }))}
                          className="w-full px-2 py-1 text-xs rounded border border-slate-300 bg-white font-bold text-slate-800 focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="total">الراتب الإجمالي (الأساسي + البدلات)</option>
                          <option value="basic">الراتب الأساسي فقط</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">أيام الاستحقاق السنوية (أقل من 5 سنوات):</label>
                        <input
                          type="number"
                          min="1"
                          max="60"
                          value={formulaSettings.vacationLessThan5YearsDays}
                          onChange={(e) => setFormulaSettings(prev => ({ ...prev, vacationLessThan5YearsDays: parseInt(e.target.value) || 0 }))}
                          className="w-full px-2 py-1 text-xs rounded border border-slate-300 font-bold text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">أيام الاستحقاق السنوية (5 سنوات فأكثر):</label>
                        <input
                          type="number"
                          min="1"
                          max="60"
                          value={formulaSettings.vacationMoreThan5YearsDays}
                          onChange={(e) => setFormulaSettings(prev => ({ ...prev, vacationMoreThan5YearsDays: parseInt(e.target.value) || 0 }))}
                          className="w-full px-2 py-1 text-xs rounded border border-slate-300 font-bold text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">قاسم أيام الشهر (لحساب اليومية):</label>
                        <input
                          type="number"
                          min="1"
                          max="365"
                          value={formulaSettings.vacationDivisor}
                          onChange={(e) => setFormulaSettings(prev => ({ ...prev, vacationDivisor: parseInt(e.target.value) || 0 }))}
                          className="w-full px-2 py-1 text-xs rounded border border-slate-300 font-bold text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="pt-1.5 mt-2 border-t border-slate-100 text-[9px] text-slate-500 leading-relaxed font-semibold">
                    <span className="font-bold text-slate-700">المعادلة المطبقة:</span> (الراتب المعتمد / {formulaSettings.vacationDivisor}) × رصيد الأيام
                  </div>
                </div>

                {/* Ticket Allowance Card */}
                <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="font-bold text-slate-800 text-xs pb-1.5 border-b border-slate-200 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                      <span>مخصص التذاكر السنوية</span>
                    </h3>
                    
                    <div className="space-y-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">دورية تذاكر الإدارة (سنوات لكل تذكرة):</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={formulaSettings.ticketAdminIntervalYears}
                          onChange={(e) => setFormulaSettings(prev => ({ ...prev, ticketAdminIntervalYears: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-2 py-1 text-xs rounded border border-slate-300 font-bold text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">دورية تذاكر الفروع والمواقع (سنوات لكل تذكرة):</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={formulaSettings.ticketBranchesIntervalYears}
                          onChange={(e) => setFormulaSettings(prev => ({ ...prev, ticketBranchesIntervalYears: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-2 py-1 text-xs rounded border border-slate-300 font-bold text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">تحديد المخصص بقيمة التذكرة الفعلية كحد أقصى:</label>
                        <select
                          value={formulaSettings.ticketCapToPrice ? "yes" : "no"}
                          onChange={(e) => setFormulaSettings(prev => ({ ...prev, ticketCapToPrice: e.target.value === "yes" }))}
                          className="w-full px-2 py-1 text-xs rounded border border-slate-300 bg-white font-bold text-slate-800 focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="yes">نعم (كحد أقصى قيمة التذكرة)</option>
                          <option value="no">لا (تراكمي دون سقف)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="pt-1.5 mt-2 border-t border-slate-100 text-[9px] text-slate-500 leading-relaxed font-semibold">
                    <span className="font-bold text-slate-700">المعادلة المطبقة:</span> (التذكرة × المدة) / دورية القسم بالسنوات
                  </div>
                </div>

                {/* End of Service Allowance Card */}
                <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="font-bold text-slate-800 text-xs pb-1.5 border-b border-slate-200 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      <span>مكافأة نهاية الخدمة (نظام العمل)</span>
                    </h3>
                    
                    <div className="space-y-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">أساس الراتب المعتمد للمكافأة:</label>
                        <select
                          value={formulaSettings.eosSalaryBasis}
                          onChange={(e) => setFormulaSettings(prev => ({ ...prev, eosSalaryBasis: e.target.value as 'total' | 'basic' }))}
                          className="w-full px-2 py-1 text-xs rounded border border-slate-300 bg-white font-bold text-slate-800 focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="total">الراتب الإجمالي (الأساسي + البدلات)</option>
                          <option value="basic">الراتب الأساسي فقط</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">سنوات الفترة الأولى (المعدل المخفض):</label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={formulaSettings.eosFirstPeriodYears}
                          onChange={(e) => setFormulaSettings(prev => ({ ...prev, eosFirstPeriodYears: parseInt(e.target.value) || 0 }))}
                          className="w-full px-2 py-1 text-xs rounded border border-slate-300 font-bold text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">معامل الفترة الأولى (راتب لكل سنة):</label>
                        <input
                          type="number"
                          step="0.05"
                          min="0"
                          max="2"
                          value={formulaSettings.eosFirstPeriodCoefficient}
                          onChange={(e) => setFormulaSettings(prev => ({ ...prev, eosFirstPeriodCoefficient: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-2 py-1 text-xs rounded border border-slate-300 font-bold text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">معامل الفترة الثانية (راتب لكل سنة):</label>
                        <input
                          type="number"
                          step="0.05"
                          min="0"
                          max="2"
                          value={formulaSettings.eosSecondPeriodCoefficient}
                          onChange={(e) => setFormulaSettings(prev => ({ ...prev, eosSecondPeriodCoefficient: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-2 py-1 text-xs rounded border border-slate-300 font-bold text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="pt-1.5 mt-2 border-t border-slate-100 text-[9px] text-slate-500 leading-relaxed font-semibold">
                    <span className="font-bold text-slate-700">المعادلة:</span> أول {formulaSettings.eosFirstPeriodYears} سنوات بـ {formulaSettings.eosFirstPeriodCoefficient} راتب، وما تلاها بـ {formulaSettings.eosSecondPeriodCoefficient} راتب.
                  </div>
                </div>

              </div>

              {/* Verification and Save Actions */}
              <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-3 flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="text-right">
                    <h4 className="text-xs font-bold text-emerald-900">تم إلغاء قفل الإعدادات بنجاح</h4>
                    <p className="text-[10px] text-emerald-700">يمكنك التعديل وسيتم حفظ التعديلات سحابياً ولحظياً.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsFormulaUnlocked(false)}
                    className="py-1 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 text-xs"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>إعادة القفل</span>
                  </button>

                  <button
                    type="submit"
                    className="py-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 text-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>حفظ واعتماد</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Print Templates Customization Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:border-indigo-200 transition-colors lg:col-span-3">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">تخصيص نماذج وتصميمات الطباعة لكل قسم</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-2">
            {[
              { key: 'endOfService' as const, title: 'طباعة مخصص نهاية الخدمة' },
              { key: 'vacationAllowance' as const, title: 'طباعة مخصص الإجازة' },
              { key: 'vacationRequest' as const, title: 'طباعة طلب الإجازة' },
              { key: 'loanRequest' as const, title: 'طباعة طلب السلفة' },
              { key: 'employeeStatement' as const, title: 'طباعة بطاقة الموظف' },
            ].map((sec) => (
              <div key={sec.key} className="bg-slate-50 rounded-lg border border-slate-200 p-3 flex flex-col justify-between shadow-sm">
                <h3 className="font-bold text-slate-800 text-xs mb-2 flex items-center gap-1 pb-1.5 border-b border-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600 inline-block"></span>
                  <span>{sec.title}</span>
                </h3>

                <div className="space-y-1.5">
                  <div className="relative">
                    <select
                      value={printTemplates[sec.key] || '1'}
                      onChange={(e) => {
                        const selectedId = e.target.value as PrintTemplateId;
                        setSectionTemplate(sec.key, selectedId);
                        const selectedOpt = PRINT_TEMPLATE_OPTIONS.find(o => o.id === selectedId);
                        setStatusMessage({
                          type: 'success',
                          text: `تم اختيار "${selectedOpt?.label || selectedId}" لقسم (${sec.title}) بنجاح والمزامنة السحابية الفورية.`
                        });
                      }}
                      className="w-full appearance-none bg-white border border-slate-300 hover:border-purple-500 rounded-lg px-2.5 py-1.5 pr-2.5 pl-8 text-[11px] font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all cursor-pointer shadow-sm"
                    >
                      {PRINT_TEMPLATE_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2 text-purple-600">
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
