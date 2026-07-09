import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ArchivedRecord, Employee } from '../types';
import { Archive, Trash2, Eye, Printer, Search, FileText, Calendar, User, ChevronDown, X } from 'lucide-react';
import EndOfServiceView from './EndOfServiceView';
import VacationAllowanceView from './VacationAllowanceView';
import VacationRequestView from './VacationRequestView';
import LoanRequestView from './LoanRequestView';
import { triggerSafePrint, formatDateTimeEN, formatDateGB } from '../utils';

interface Props {
  records: ArchivedRecord[];
  employees?: Employee[];
  onDeleteRecord: (id: string) => void;
}

export default function ArchiveView({ records, employees = [], onDeleteRecord }: Props) {
  const [activeTab, setActiveTab] = useState<'all' | 'endOfService' | 'vacationAllowance' | 'vacationRequest' | 'loanRequest'>('all');
  const [selectedEmployeeName, setSelectedEmployeeName] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [selectedRecordToView, setSelectedRecordToView] = useState<ArchivedRecord | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedRecordToView && !records.some(r => r.id === selectedRecordToView.id)) {
      setSelectedRecordToView(null);
    }
  }, [records, selectedRecordToView]);

  // Extract all unique employee names ordered as in system employees list
  const allEmployeeNames = useMemo(() => {
    const namesList: string[] = [];
    const namesSet = new Set<string>();
    employees.forEach(e => {
      if (e.name && e.name.trim()) {
        const trimmed = e.name.trim();
        if (!namesSet.has(trimmed)) {
          namesSet.add(trimmed);
          namesList.push(trimmed);
        }
      }
    });
    records.forEach(r => {
      if (r.employeeName && r.employeeName.trim()) {
        const trimmed = r.employeeName.trim();
        if (!namesSet.has(trimmed)) {
          namesSet.add(trimmed);
          namesList.push(trimmed);
        }
      }
    });
    return namesList;
  }, [employees, records]);

  const filteredEmployeeNames = useMemo(() => {
    const term = employeeSearchTerm.trim().toLowerCase();
    if (!term) return allEmployeeNames;
    return allEmployeeNames.filter(name => name.toLowerCase().includes(term));
  }, [allEmployeeNames, employeeSearchTerm]);

  const filteredRecords = useMemo(() => {
    let list = records;
    if (activeTab !== 'all') {
      list = list.filter(r => r.type === activeTab);
    }
    if (selectedEmployeeName) {
      list = list.filter(r => r.employeeName?.trim() === selectedEmployeeName);
    }
    // Sort newest first
    return list.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records, activeTab, selectedEmployeeName]);

  const getSectionBadge = (type: ArchivedRecord['type']) => {
    switch (type) {
      case 'endOfService':
        return <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 rounded-full text-[11px] font-bold">مخصص نهاية الخدمة</span>;
      case 'vacationAllowance':
        return <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 rounded-full text-[11px] font-bold">مخصص الإجازة</span>;
      case 'vacationRequest':
        return <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[11px] font-bold">طلب إجازة</span>;
      case 'loanRequest':
        return <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[11px] font-bold">طلب سلفة</span>;
    }
  };

  if (selectedRecordToView) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <div className="no-print bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <button
            onClick={() => setSelectedRecordToView(null)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-2 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shrink-0"
          >
            <span>→ الرجوع بقائمة الأرشيف</span>
          </button>
          <div className="flex flex-wrap items-center justify-between sm:justify-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-400">تاريخ الأرشفة:</span>
              <span className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-mono font-bold text-slate-700" dir="ltr">
                {formatDateTimeEN(selectedRecordToView.date)}
              </span>
            </div>
            {getSectionBadge(selectedRecordToView.type)}
          </div>
          <div className="flex items-center justify-end gap-2 shrink-0">
            <button
              onClick={() => onDeleteRecord(selectedRecordToView.id)}
              className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-2 sm:p-2.5 rounded-lg flex items-center justify-center transition-colors shadow-sm"
              title="حذف النموذج"
            >
              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={triggerSafePrint}
              className="bg-indigo-600 text-white p-2 sm:p-2.5 rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-sm"
              title="طباعة النموذج الأرشيفي"
            >
              <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        <div className="w-full relative [&_input]:pointer-events-none [&_select]:pointer-events-none [&_button]:pointer-events-none">
          {selectedRecordToView.type === 'endOfService' && (
            <EndOfServiceView employees={[]} archivedData={selectedRecordToView.data} />
          )}
          {selectedRecordToView.type === 'vacationAllowance' && (
            <VacationAllowanceView employees={[]} archivedData={selectedRecordToView.data} />
          )}
          {selectedRecordToView.type === 'vacationRequest' && (
            <VacationRequestView employees={[]} archivedData={selectedRecordToView.data} />
          )}
          {selectedRecordToView.type === 'loanRequest' && (
            <LoanRequestView employees={[]} archivedData={selectedRecordToView.data} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2.5">
              <Archive className="w-7 h-7 text-indigo-600" />
              <span>أرشيف المخصصات</span>
            </h2>
          </div>
          <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl">
            <FileText className="w-5 h-5 text-indigo-600" />
            <span className="text-sm font-bold text-indigo-900">إجمالي المؤرشف: {records.length} نموذج</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              الكل ({records.length})
            </button>
            <button
              onClick={() => setActiveTab('endOfService')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'endOfService'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-100'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              مخصص نهاية الخدمة ({records.filter(r => r.type === 'endOfService').length})
            </button>
            <button
              onClick={() => setActiveTab('vacationAllowance')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'vacationAllowance'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              مخصص الإجازة ({records.filter(r => r.type === 'vacationAllowance').length})
            </button>
            <button
              onClick={() => setActiveTab('vacationRequest')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'vacationRequest'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-100'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              طلب إجازة ({records.filter(r => r.type === 'vacationRequest').length})
            </button>
            <button
              onClick={() => setActiveTab('loanRequest')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'loanRequest'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              طلب سلفة ({records.filter(r => r.type === 'loanRequest').length})
            </button>
          </div>

          <div ref={dropdownRef} className="relative w-full lg:w-80">
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2 bg-slate-50 hover:bg-white hover:border-indigo-500 cursor-pointer flex items-center justify-between gap-2 shadow-sm transition-all min-h-[42px]"
            >
              <div className="flex items-center gap-2 truncate">
                <User className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-sm font-bold text-slate-800 truncate">
                  {selectedEmployeeName ? selectedEmployeeName : 'جميع الموظفين (عرض الكل)'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {selectedEmployeeName && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEmployeeName('');
                    }}
                    title="إلغاء التحديد وعرض جميع الموظفين"
                    className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {isDropdownOpen && (
              <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in duration-150 w-full min-w-[280px]">
                <div className="p-2.5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="ابحث بالقائمة باسم الموظف..."
                    value={employeeSearchTerm}
                    onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                    className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 font-medium"
                    autoFocus
                  />
                  {employeeSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setEmployeeSearchTerm('')}
                      className="text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="max-h-60 overflow-y-auto divide-y divide-slate-50">
                  <div
                    onClick={() => {
                      setSelectedEmployeeName('');
                      setIsDropdownOpen(false);
                    }}
                    className={`p-3 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                      !selectedEmployeeName ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-700 font-semibold'
                    }`}
                  >
                    <span>جميع الموظفين (عرض كل الأرشيف)</span>
                    <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                      {records.length}
                    </span>
                  </div>

                  {filteredEmployeeNames.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-400">
                      لا توجد أسماء موظفين مطابقة للبحث
                    </div>
                  ) : (
                    filteredEmployeeNames.map((name) => {
                      const isSelected = name === selectedEmployeeName;
                      const empRecordCount = records.filter(r => r.employeeName?.trim() === name).length;
                      return (
                        <div
                          key={name}
                          onClick={() => {
                            setSelectedEmployeeName(name);
                            setIsDropdownOpen(false);
                          }}
                          className={`p-3 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                            isSelected ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-800 font-medium'
                          }`}
                        >
                          <span className="truncate">{name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${isSelected ? 'bg-indigo-200 text-indigo-800' : 'bg-slate-100 text-slate-600'}`}>
                            {empRecordCount} نموذج
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
            <Archive className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">لا توجد نماذج مؤرشفة هنا</h3>
          <p className="text-sm text-slate-500 max-w-md">
            يمكنك أخذ نسخة وحفظ أي نموذج بصفحة الأرشيف من خلال النقر على زر "أرشفة النموذج" داخل أقسام المخصصات وطلبات الإجازة والسلف.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRecords.map((rec) => (
            <div
              key={rec.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow transition-all p-4 flex flex-col justify-between gap-3"
            >
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-2">
                  {getSectionBadge(rec.type)}
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono" dir="ltr">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDateGB(rec.date)}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="truncate">{rec.title}</span>
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-600 font-semibold bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{rec.employeeName}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100">
                <button
                  onClick={() => setSelectedRecordToView(rec)}
                  className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-1.5 px-2.5 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>عرض وطباعة النموذج</span>
                </button>
                <button
                  onClick={() => onDeleteRecord(rec.id)}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 p-1.5 rounded-lg transition-colors"
                  title="حذف من الأرشيف"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
