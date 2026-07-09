import React, { useState, useEffect } from 'react';
import { CalculatedEmployee } from '../types';
import { formatNumber, calculateEmployeeAllowances, triggerSafePrint, tafqeetArabic, tafqeetEnglish, formatDateGB } from '../utils';
import SearchableEmployeeSelect from './SearchableEmployeeSelect';
import VacationReasonCombobox from './VacationReasonCombobox';
import { Printer, Archive } from 'lucide-react';
import { useCompanySettings } from '../utils/companySettings';
import { usePrintTemplates } from '../utils/printTemplates';
import VacationAllowancePrintTemplates from './print/VacationAllowancePrintTemplates';

interface Props {
  employees: CalculatedEmployee[];
  onArchive?: (record: any) => void;
  archivedData?: any;
}

export default function VacationAllowanceView({ employees, onArchive, archivedData }: Props) {
  const { companyNameAr, companyNameEn } = useCompanySettings();
  const { printTemplates } = usePrintTemplates();
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const todayInitial = new Date().toISOString().split('T')[0];
  const [customStartDate, setCustomStartDate] = useState<string>(todayInitial);
  const [customReturnDate, setCustomReturnDate] = useState<string>(todayInitial);
  const [vacationReason, setVacationReason] = useState<string>('الاجازة السنويه');
  const [isProportionalActive, setIsProportionalActive] = useState<boolean>(false);
  const [workDaysCount, setWorkDaysCount] = useState<number>(30);
  const [overtimeHours, setOvertimeHours] = useState<number>(0);
  const originalEmp = archivedData ? archivedData.emp : employees.find(e => e.id === selectedEmpId);

  useEffect(() => {
    if (archivedData) {
      if (archivedData.customStartDate !== undefined) setCustomStartDate(archivedData.customStartDate);
      if (archivedData.customReturnDate !== undefined) setCustomReturnDate(archivedData.customReturnDate);
      if (archivedData.vacationReason !== undefined) setVacationReason(archivedData.vacationReason);
      if (archivedData.isProportionalActive !== undefined) setIsProportionalActive(Boolean(archivedData.isProportionalActive));
      if (archivedData.workDaysCount !== undefined) setWorkDaysCount(Number(archivedData.workDaysCount));
      if (archivedData.overtimeHours !== undefined) setOvertimeHours(Number(archivedData.overtimeHours));
    } else if (originalEmp) {
      const t = new Date().toISOString().split('T')[0];
      setCustomStartDate(t);
      setCustomReturnDate(t);
      setVacationReason('الاجازة السنويه');
      const d = new Date();
      const day = !isNaN(d.getDate()) ? Math.min(30, d.getDate()) : 30;
      setWorkDaysCount(day);
    }
  }, [originalEmp, archivedData]);

  useEffect(() => {
    if (!archivedData && customStartDate) {
      const d = new Date(customStartDate);
      if (!isNaN(d.getTime())) {
        setWorkDaysCount(Math.min(30, d.getDate()));
      }
    }
  }, [customStartDate, archivedData]);

  let emp = originalEmp;
  let absenceDeduction = 0;
  let socialSecurityDeduction = 0;
  let totalDeductions = 0;
  let netAmount = 0;
  let totalAllowancesGross = 0;

  let workDaysSalary = 0;
  let housingValue = 0;
  let transferValue = 0;
  let otherAllowancesValue = 0;
  let overtimeValue = 0;

  if (originalEmp) {
    const effectiveCalcDate = customStartDate || originalEmp.calculationDate;
    emp = calculateEmployeeAllowances({ ...originalEmp, calculationDate: effectiveCalcDate });
    absenceDeduction = (emp.totalSalary / 30) * (emp.absence || 0);
    const empSocialSecurityEnabled = emp.includeSocialSecurity !== false;
    socialSecurityDeduction = empSocialSecurityEnabled ? (emp.socialSecurity || 0) : 0;
    totalDeductions = socialSecurityDeduction + (emp.loans || 0) + absenceDeduction;

    if (isProportionalActive) {
      const effectiveDays = Math.min(30, workDaysCount);
      workDaysSalary = Math.min(emp.basicSalary, Math.round(((emp.basicSalary / 30) * effectiveDays) * 100) / 100);
      housingValue = emp.housingAllowance || 0; // تثبيت بدل السكن بحيث يكتب بكامل قيمته
      transferValue = Math.min((emp.transferAllowance || 0), Math.round((((emp.transferAllowance || 0) / 30) * effectiveDays) * 100) / 100);
      const otherAllowancesBase = (emp.fixedAllowances || 0) - (emp.housingAllowance || 0) - (emp.transferAllowance || 0);
      otherAllowancesValue = Math.min(otherAllowancesBase, Math.round(((otherAllowancesBase / 30) * effectiveDays) * 100) / 100);
      overtimeValue = Math.round((((emp.basicSalary / 30 / 8) * 1.5) * overtimeHours) * 100) / 100;
    } else {
      workDaysSalary = 0;
      housingValue = 0;
      transferValue = 0;
      otherAllowancesValue = 0;
      overtimeValue = 0;
    }

    totalAllowancesGross = emp.vacationAllowance + workDaysSalary + housingValue + transferValue + otherAllowancesValue + overtimeValue;
    netAmount = totalAllowancesGross - totalDeductions;
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
                      type: 'vacationAllowance',
                      title: 'مخصص الإجازة',
                      employeeName: emp.name,
                      data: {
                        emp,
                        customStartDate,
                        customReturnDate,
                        vacationReason,
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
        <VacationAllowancePrintTemplates
          templateId={printTemplates.vacationAllowance}
          emp={emp}
          companyNameAr={companyNameAr}
          companyNameEn={companyNameEn}
          archivedData={archivedData}
          customStartDate={customStartDate}
          setCustomStartDate={setCustomStartDate}
          customReturnDate={customReturnDate}
          setCustomReturnDate={setCustomReturnDate}
          setWorkDaysCount={setWorkDaysCount}
          workDaysCount={workDaysCount}
          vacationReason={vacationReason}
          setVacationReason={setVacationReason}
          isProportionalActive={isProportionalActive}
          overtimeHours={overtimeHours}
          setOvertimeHours={setOvertimeHours}
          workDaysSalary={workDaysSalary}
          overtimeValue={overtimeValue}
          housingValue={housingValue}
          transferValue={transferValue}
          otherAllowancesValue={otherAllowancesValue}
          totalAllowancesGross={totalAllowancesGross}
          socialSecurityDeduction={socialSecurityDeduction}
          absenceDeduction={absenceDeduction}
          totalDeductions={totalDeductions}
          netAmount={netAmount}
          VacationReasonCombobox={VacationReasonCombobox}
        />
      )}
    </div>
  );
}
