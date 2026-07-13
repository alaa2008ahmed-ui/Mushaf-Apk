import React, { useState, useEffect } from 'react';
import { CalculatedEmployee } from '../types';
import { formatNumber, calculateEmployeeAllowances, calculateIndemnityByReason, triggerSafePrint, tafqeetArabic, tafqeetEnglish, formatDateGB } from '../utils';
import SearchableEmployeeSelect from './SearchableEmployeeSelect';
import { Printer, Archive } from 'lucide-react';
import { useCompanySettings } from '../utils/companySettings';
import { usePrintTemplates } from '../utils/printTemplates';
import EndOfServicePrintTemplates from './print/EndOfServicePrintTemplates';

const END_OF_SERVICE_REASONS: { [key: string]: string } = {
  end_of_contract: 'نهاية العقد المحدود',
  redundancy: 'استغناء / فسخ من قبل صاحب العمل',
  resignation: 'استقالة (المادة 85)',
  probation_period: 'فسخ خلال فترة التجربة / التدريب',
  article_80: 'فصل بموجب المادة (80)',
  force_majeure: 'ترك العمل لقوة قاهرة (المادة 87)',
  marriage_or_childbirth: 'إنهاء بسبب الزواج أو الإنجاب (المادة 87)',
  employer_breach: 'إخلال صاحب العمل بالتزاماته (المادة 81)',
};

interface Props {
  employees: CalculatedEmployee[];
  onArchive?: (record: any) => void;
  archivedData?: any;
}

export default function EndOfServiceView({ employees, onArchive, archivedData }: Props) {
  const { companyNameAr, companyNameEn } = useCompanySettings();
  const { printTemplates } = usePrintTemplates();
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [customCalcDate, setCustomCalcDate] = useState<string>('');
  const [endOfServiceReason, setEndOfServiceReason] = useState<string>('end_of_contract');
  const [isProportionalActive, setIsProportionalActive] = useState<boolean>(false);
  const [workDaysCount, setWorkDaysCount] = useState<number>(30);
  const [overtimeHours, setOvertimeHours] = useState<number>(0);
  const originalEmp = archivedData ? archivedData.emp : employees.find(e => e.id === selectedEmpId);

  useEffect(() => {
    if (archivedData) {
      if (archivedData.customCalcDate !== undefined) setCustomCalcDate(archivedData.customCalcDate);
      else if (archivedData.emp) setCustomCalcDate(archivedData.emp.calculationDate);
      if (archivedData.endOfServiceReason !== undefined) setEndOfServiceReason(archivedData.endOfServiceReason);
      if (archivedData.isProportionalActive !== undefined) setIsProportionalActive(Boolean(archivedData.isProportionalActive));
      if (archivedData.workDaysCount !== undefined) setWorkDaysCount(Number(archivedData.workDaysCount));
      if (archivedData.overtimeHours !== undefined) setOvertimeHours(Number(archivedData.overtimeHours));
    } else if (originalEmp) {
      setCustomCalcDate(originalEmp.calculationDate);
      const d = new Date(originalEmp.calculationDate);
      const day = !isNaN(d.getDate()) ? Math.min(30, d.getDate()) : 30;
      setWorkDaysCount(day);
    }
  }, [originalEmp, archivedData]);

  useEffect(() => {
    if (!archivedData && customCalcDate) {
      const d = new Date(customCalcDate);
      if (!isNaN(d.getTime())) {
        setWorkDaysCount(Math.min(30, d.getDate()));
      }
    }
  }, [customCalcDate, archivedData]);

  // Date calculation helpers
  const getYearMonthDay = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      days += prevMonth.getDate();
    }
    
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    return { years: isNaN(years) ? 0 : years, months: isNaN(months) ? 0 : months, days: isNaN(days) ? 0 : days };
  };

  const getDateParts = (d: string) => {
    if (!d) return { year: '', month: '', day: '' };
    const date = new Date(d);
    return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
  }

  let calcDateParts: any = { year: '', month: '', day: '' };
  let vacDateParts: any = { year: '', month: '', day: '' };
  let hireDateParts: any = { year: '', month: '', day: '' };
  let workDiff = { years: 0, months: 0, days: 0 };
  let vacDiff = { years: 0, months: 0, days: 0 };
  let emp = originalEmp;
  
  let totalDeductions = 0;
  let netAmount = 0;
  let actualIndemnity = 0;
  let absenceDeduction = 0;
  let socialSecurityDeduction = 0;

  let workDaysSalary = 0;
  let housingValue = 0;
  let transferValue = 0;
  let phoneValue = 0;
  let foodValue = 0;
  let overtimeValue = 0;
  let totalEntitlements = 0;

  if (originalEmp) {
    const effectiveCalcDate = customCalcDate || originalEmp.calculationDate;
    emp = calculateEmployeeAllowances({ ...originalEmp, calculationDate: effectiveCalcDate });
    calcDateParts = getDateParts(effectiveCalcDate);
    vacDateParts = getDateParts(emp.lastVacationReturnDate);
    hireDateParts = getDateParts(emp.hireDate);
    workDiff = getYearMonthDay(emp.hireDate, effectiveCalcDate);
    vacDiff = getYearMonthDay(emp.lastVacationReturnDate, effectiveCalcDate);
    absenceDeduction = (emp.totalSalary / 30) * (emp.absence || 0);
    const tenPercentCalc = Math.round(0.10 * (emp.basicSalary + (emp.housingAllowance || 0)) * 100) / 100;
    const empSocialSecurityEnabled = emp.includeSocialSecurity !== false && isProportionalActive;
    socialSecurityDeduction = empSocialSecurityEnabled ? (emp.socialSecurity || tenPercentCalc) : 0;
    totalDeductions = socialSecurityDeduction + (emp.loans || 0) + absenceDeduction + (emp.paidEndOfService || 0);
    actualIndemnity = calculateIndemnityByReason(emp.endOfServiceAllowance, emp.totalWorkDurationYears, endOfServiceReason);

    if (isProportionalActive) {
      const effectiveDays = Math.min(30, workDaysCount);
      workDaysSalary = Math.min(emp.basicSalary, Math.round(((emp.basicSalary / 30) * effectiveDays) * 100) / 100);
      housingValue = emp.housingAllowance || 0; // تثبيت بدل السكن بحيث يكتب بكامل قيمته
      transferValue = Math.min((emp.transferAllowance || 0), Math.round((((emp.transferAllowance || 0) / 30) * effectiveDays) * 100) / 100);
      phoneValue = Math.min((emp.phoneAllowance || 0), Math.round((((emp.phoneAllowance || 0) / 30) * effectiveDays) * 100) / 100);
      foodValue = Math.min((emp.foodAllowance || 0), Math.round((((emp.foodAllowance || 0) / 30) * effectiveDays) * 100) / 100);
      overtimeValue = Math.round((((emp.basicSalary / 30 / 8) * 1.5) * overtimeHours) * 100) / 100;
    } else {
      housingValue = 0;
    }

    totalEntitlements = emp.vacationAllowance + actualIndemnity + workDaysSalary + housingValue + transferValue + phoneValue + foodValue + overtimeValue;
    netAmount = totalEntitlements - totalDeductions;
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {!archivedData && (
        <div className="no-print bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 sm:gap-4 shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 flex-grow">
            <label className="font-bold text-slate-700 text-xs sm:text-sm shrink-0">اختر الموظف:</label>
            <SearchableEmployeeSelect
              employees={employees}
              value={selectedEmpId}
              onChange={(val) => {
                setSelectedEmpId(val);
                const found = employees.find(emp => emp.id === val);
                if (found) {
                  const d = new Date(found.calculationDate);
                  const day = !isNaN(d.getDate()) ? Math.min(30, d.getDate()) : 30;
                  setWorkDaysCount(day);
                }
              }}
              className="w-full sm:max-w-md flex-grow"
            />
          </div>

          <div className="flex items-center gap-4 flex-wrap bg-slate-50 p-2 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setIsProportionalActive(!isProportionalActive)}
              className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-sm cursor-pointer ${
                isProportionalActive 
                  ? 'bg-amber-500 text-amber-950 border-2 border-amber-600 shadow-amber-100' 
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
              }`}
            >
              <span className="text-lg leading-none">{isProportionalActive ? '☑' : '☐'}</span>
              <span>احتساب الراتب</span>
            </button>

            {isProportionalActive && (
              <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                  <span>ساعات الإضافي:</span>
                  <input 
                    type="number" 
                    min="0" 
                    step="0.5"
                    value={overtimeHours} 
                    onChange={(e) => setOvertimeHours(Number(e.target.value))} 
                    className="w-14 bg-white border border-blue-400 rounded px-1.5 py-0.5 text-center font-black text-blue-950 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                  <span>ساعة</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {onArchive && (
              <button
                type="button"
                onClick={() => {
                  if (emp && onArchive) {
                    onArchive({
                      type: 'endOfService',
                      title: 'مخصص نهاية الخدمة',
                      employeeName: emp.name,
                      data: {
                        emp,
                        customCalcDate,
                        endOfServiceReason,
                        isProportionalActive,
                        workDaysCount,
                        overtimeHours
                      }
                    });
                  }
                }}
                disabled={!emp}
                title="أرشفة النموذج"
                className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center shadow-sm"
              >
                <Archive className="w-5 h-5" />
              </button>
            )}
            <button onClick={triggerSafePrint} disabled={!emp} title="طباعة" className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center shadow-sm"><Printer className="w-5 h-5" /></button>
          </div>
        </div>
      )}

      {emp && (
        <EndOfServicePrintTemplates
          templateId={printTemplates.endOfService}
          emp={emp}
          companyNameAr={companyNameAr}
          companyNameEn={companyNameEn}
          archivedData={archivedData}
          endOfServiceReason={endOfServiceReason}
          setEndOfServiceReason={setEndOfServiceReason}
          END_OF_SERVICE_REASONS={END_OF_SERVICE_REASONS}
          customCalcDate={customCalcDate}
          setCustomCalcDate={setCustomCalcDate}
          setWorkDaysCount={setWorkDaysCount}
          workDaysCount={workDaysCount}
          isProportionalActive={isProportionalActive}
          calcDateParts={calcDateParts}
          hireDateParts={hireDateParts}
          vacDateParts={vacDateParts}
          workDiff={workDiff}
          vacDiff={vacDiff}
          workDaysSalary={workDaysSalary}
          overtimeValue={overtimeValue}
          overtimeHours={overtimeHours}
          setOvertimeHours={setOvertimeHours}
          housingValue={housingValue}
          transferValue={transferValue}
          phoneValue={phoneValue}
          foodValue={foodValue}
          actualIndemnity={actualIndemnity}
          totalEntitlements={totalEntitlements}
          socialSecurityDeduction={socialSecurityDeduction}
          absenceDeduction={absenceDeduction}
          totalDeductions={totalDeductions}
          netAmount={netAmount}
        />
      )}
    </div>
  );
}
