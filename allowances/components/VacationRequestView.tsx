import React, { useState, useEffect } from 'react';
import { CalculatedEmployee } from '../types';
import { calculateDateDifferenceInDays, formatNumber, triggerSafePrint, formatDateGB, calculateEmployeeAllowances } from '../utils';
import SearchableEmployeeSelect from './SearchableEmployeeSelect';
import { Printer, Archive } from 'lucide-react';
import { useCompanySettings } from '../utils/companySettings';
import { usePrintTemplates } from '../utils/printTemplates';
import VacationRequestPrintTemplates from './print/VacationRequestPrintTemplates';

interface Props {
  employees: CalculatedEmployee[];
  onArchive?: (record: any) => void;
  archivedData?: any;
}

export default function VacationRequestView({ employees, onArchive, archivedData }: Props) {
  const { companyNameAr, companyNameEn } = useCompanySettings();
  const { printTemplates } = usePrintTemplates();
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [requestDate, setRequestDate] = useState<string>(todayStr);
  const [customStartDate, setCustomStartDate] = useState<string>(todayStr);
  const [customReturnDate, setCustomReturnDate] = useState<string>(todayStr);
  const baseEmp = archivedData ? archivedData.emp : employees.find(e => e.id === selectedEmpId);
  const emp = archivedData 
    ? archivedData.emp 
    : (baseEmp ? calculateEmployeeAllowances({ ...baseEmp, calculationDate: requestDate }) : undefined);

  useEffect(() => {
    if (archivedData) {
      if (archivedData.requestDate !== undefined) setRequestDate(archivedData.requestDate);
      if (archivedData.customStartDate !== undefined) setCustomStartDate(archivedData.customStartDate);
      if (archivedData.customReturnDate !== undefined) setCustomReturnDate(archivedData.customReturnDate);
    } else if (selectedEmpId) {
      const t = new Date().toISOString().split('T')[0];
      setRequestDate(t);
      setCustomStartDate(t);
      setCustomReturnDate(t);
    }
  }, [selectedEmpId, archivedData]);

  const requestedLeaveDays = calculateDateDifferenceInDays(customStartDate, customReturnDate);

  const isInLeave = (dateStr: string) => {
    if (!customStartDate || !customReturnDate) return false;
    if (customStartDate < customReturnDate) {
      return dateStr >= customStartDate && dateStr < customReturnDate;
    } else if (customStartDate === customReturnDate) {
      return dateStr === customStartDate;
    }
    return false;
  };

  const displayMonths = (() => {
    let baseDate = new Date();
    if (customStartDate) {
      const parsed = new Date(customStartDate);
      if (!isNaN(parsed.getTime())) {
        baseDate = parsed;
      }
    }
    const months = [];
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const monthNamesAr = [
      "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
      "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
    ];
    for (let i = 0; i < 4; i++) {
      const d = new Date(baseDate.getFullYear(), baseDate.getMonth() + i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0: SUN ... 6: SAT

      const weeks: (number | null)[][] = Array.from({ length: 6 }, () => Array(7).fill(null));
      for (let day = 1; day <= daysInMonth; day++) {
        const offset = firstDayOfWeek + day - 1;
        const weekIdx = Math.floor(offset / 7);
        const colIdx = offset % 7;
        if (weekIdx < 6) {
          weeks[weekIdx][colIdx] = day;
        }
      }

      months.push({
        year,
        month,
        title: `${monthNames[month]} - ${monthNamesAr[month]} / ${year}`,
        weeks
      });
    }
    return months;
  })();

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
                      type: 'vacationRequest',
                      title: 'طلب إجازة',
                      employeeName: emp.name,
                      data: {
                        emp,
                        requestDate,
                        customStartDate,
                        customReturnDate
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
        <VacationRequestPrintTemplates
          templateId={printTemplates.vacationRequest}
          emp={emp}
          companyNameAr={companyNameAr}
          companyNameEn={companyNameEn}
          archivedData={archivedData}
          requestDate={requestDate}
          setRequestDate={setRequestDate}
          customStartDate={customStartDate}
          setCustomStartDate={setCustomStartDate}
          customReturnDate={customReturnDate}
          setCustomReturnDate={setCustomReturnDate}
          requestedLeaveDays={requestedLeaveDays}
          displayMonths={displayMonths}
          isInLeave={isInLeave}
        />
      )}
    </div>
  );
}
