import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const REASONS = [
  'الاجازة السنويه',
  'إجازة مرضية',
  'إجازة طارئة / عرضية',
  'إجازة بدون راتب',
  'إجازة زواج',
  'إجازة أداء فريضة الحج',
  'إجازة وضع / أمومة',
  'إجازة دراسية أو أداء امتحانات'
];

interface Props {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export default function VacationReasonCombobox({ value, onChange, disabled }: Props) {
  if (disabled) {
    return <span className="w-full text-center block font-bold py-1">{value}</span>;
  }

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center">
      <div className="relative w-full flex items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onClick={() => setIsOpen(true)}
          className="w-full text-center outline-none bg-transparent py-1 font-bold text-black cursor-text px-6"
          placeholder="اختر أو اكتب سبب الإجازة..."
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="absolute left-1.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 p-1 print:hidden"
          title="عرض قائمة الأسباب"
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-slate-300 rounded-lg shadow-xl max-h-56 overflow-y-auto text-right print:hidden">
          {REASONS.map((reason) => (
            <div
              key={reason}
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(reason);
                setIsOpen(false);
              }}
              className={`p-2 text-sm cursor-pointer hover:bg-slate-100 border-b border-slate-100 font-bold transition-colors ${
                value === reason ? 'bg-indigo-50 text-indigo-700' : 'text-black'
              }`}
            >
              {reason}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
