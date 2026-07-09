import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X, User } from 'lucide-react';
import { Employee } from '../types';

interface Props {
  employees: Employee[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}

export default function SearchableEmployeeSelect({ employees, value, onChange, className = "flex-grow max-w-md" }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedEmp = employees.find(e => e.id === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const filteredEmployees = employees.filter(e => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      (e.name && e.name.toLowerCase().includes(term)) ||
      (e.jobTitle && e.jobTitle.toLowerCase().includes(term))
    );
  });

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border border-slate-300 rounded-lg p-2 bg-white hover:border-indigo-500 cursor-pointer flex items-center justify-between gap-2 shadow-sm transition-colors min-h-[40px]"
      >
        <div className="flex items-center gap-2 truncate">
          <User className="w-4 h-4 text-slate-400 shrink-0" />
          <span className={`truncate text-sm font-semibold ${selectedEmp ? 'text-slate-800' : 'text-slate-400'}`}>
            {selectedEmp ? selectedEmp.name : '-- اختر موظف --'}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {selectedEmp && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              title="إلغاء التحديد"
              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-rose-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in duration-150">
          {/* Search Box */}
          <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="ابحث باسم الموظف أو الوظيفة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsOpen(false);
                } else if (e.key === 'Enter' && filteredEmployees.length > 0) {
                  e.preventDefault();
                  onChange(filteredEmployees[0].id);
                  setIsOpen(false);
                }
              }}
              className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 font-medium"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Employee List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-50">
            <div
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className={`p-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                !value ? 'bg-indigo-50/80 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-600 font-medium'
              }`}
            >
              <span>-- اختر موظف --</span>
            </div>

            {filteredEmployees.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-400">
                لا توجد نتائج مطابقة لبحثك
              </div>
            ) : (
              filteredEmployees.map((e) => {
                const isSelected = e.id === value;
                return (
                  <div
                    key={e.id}
                    onClick={() => {
                      onChange(e.id);
                      setIsOpen(false);
                    }}
                    className={`p-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                      isSelected ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex flex-col truncate">
                      <span className="truncate">{e.name}</span>
                      {e.jobTitle && <span className="text-xs text-slate-400 font-normal">{e.jobTitle}</span>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
