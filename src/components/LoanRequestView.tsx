import React, { useState, useEffect } from 'react';
import { CalculatedEmployee } from '../types';
import { formatNumber, triggerSafePrint, formatDateGB } from '../utils';
import SearchableEmployeeSelect from './SearchableEmployeeSelect';
import { Printer, Archive } from 'lucide-react';
import { useCompanySettings } from '../utils/companySettings';
import { usePrintTemplates } from '../utils/printTemplates';
import LoanRequestPrintTemplates from './print/LoanRequestPrintTemplates';

interface Props {
  employees: CalculatedEmployee[];
  onArchive?: (record: any) => void;
  archivedData?: any;
}

export default function LoanRequestView({ employees, onArchive, archivedData }: Props) {
  const { companyNameAr, companyNameEn } = useCompanySettings();
  const { printTemplates } = usePrintTemplates();
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [requestDate, setRequestDate] = useState<string>(todayStr);
  const [deductionStartDate, setDeductionStartDate] = useState<string>(todayStr);
  const [loanAmount, setLoanAmount] = useState<string>('2000');
  const [repaymentsCount, setRepaymentsCount] = useState<string>('');
  const emp = archivedData ? archivedData.emp : employees.find(e => e.id === selectedEmpId);

  useEffect(() => {
    if (archivedData) {
      if (archivedData.requestDate !== undefined) setRequestDate(archivedData.requestDate);
      if (archivedData.deductionStartDate !== undefined) setDeductionStartDate(archivedData.deductionStartDate);
      if (archivedData.loanAmount !== undefined) setLoanAmount(String(archivedData.loanAmount));
      if (archivedData.repaymentsCount !== undefined) setRepaymentsCount(String(archivedData.repaymentsCount));
    } else if (emp) {
      const today = new Date().toISOString().split('T')[0];
      setRequestDate(today);
      setDeductionStartDate(today);
    }
  }, [emp, archivedData]);

  return (
    <div className="flex flex-col gap-4 h-full">
      {!archivedData && (
        <div className="no-print bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 flex-grow">
            <label className="font-bold text-slate-700 text-xs sm:text-sm shrink-0">اختر الموظف:</label>
            <SearchableEmployeeSelect
              employees={employees}
              value={selectedEmpId}
              onChange={(val) => setSelectedEmpId(val)}
              className="w-full sm:max-w-md flex-grow"
            />
          </div>
          <div className="flex items-center gap-3">
            {onArchive && (
              <button
                type="button"
                onClick={() => {
                  if (emp && onArchive) {
                    onArchive({
                      type: 'loanRequest',
                      title: 'طلب سلفة',
                      employeeName: emp.name,
                      data: {
                        emp,
                        requestDate,
                        deductionStartDate,
                        loanAmount,
                        repaymentsCount
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
        <LoanRequestPrintTemplates
          templateId={printTemplates.loanRequest}
          emp={emp}
          companyNameAr={companyNameAr}
          companyNameEn={companyNameEn}
          archivedData={archivedData}
          requestDate={requestDate}
          setRequestDate={setRequestDate}
          deductionStartDate={deductionStartDate}
          setDeductionStartDate={setDeductionStartDate}
          loanAmount={loanAmount}
          setLoanAmount={setLoanAmount}
          repaymentsCount={repaymentsCount}
          setRepaymentsCount={setRepaymentsCount}
        />
      )}
    </div>
  );
}
