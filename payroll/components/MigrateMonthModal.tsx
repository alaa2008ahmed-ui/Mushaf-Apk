import React, { useState, useEffect } from 'react';
import { X, CalendarCheck, Sparkles, ArrowRight, ShieldCheck, CheckCircle2, RotateCcw } from 'lucide-react';
import { PayrollTotals } from '../types';
import { formatCurrency } from '../utils/calculations';

interface MigrateMonthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmMigration: (newTitle: string) => void;
  currentTitle: string;
  totals: PayrollTotals;
  employeeCount: number;
}

export const MigrateMonthModal: React.FC<MigrateMonthModalProps> = ({
  isOpen,
  onClose,
  onConfirmMigration,
  currentTitle,
  totals,
  employeeCount,
}) => {
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Try to intelligently guess next month name in Arabic
      let suggested = currentTitle;
      const months: Record<string, string> = {
        'يناير': 'فبراير',
        'فبراير': 'مارس',
        'مارس': 'أبريل',
        'أبريل': 'مايو',
        'مايو': 'يونيو',
        'يونيو': 'يوليو',
        'يوليو': 'أغسطس',
        'أغسطس': 'سبتمبر',
        'سبتمبر': 'أكتوبر',
        'أكتوبر': 'نوفمبر',
        'نوفمبر': 'ديسمبر',
        'ديسمبر': 'يناير'
      };

      for (const [curr, next] of Object.entries(months)) {
        if (currentTitle.includes(curr)) {
          suggested = currentTitle.replace(curr, next);
          if (curr === 'ديسمبر') {
            suggested = suggested.replace(/\b(20\d\d)\b/, (match, yearStr) => {
              const nextYear = parseInt(yearStr, 10) + 1;
              return nextYear.toString();
            });
          }
          break;
        }
      }
      setNewTitle(suggested);
    }
  }, [isOpen, currentTitle]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert("يرجى إدخال عنوان لكشف شهر الرواتب الجديد.");
      return;
    }
    onConfirmMigration(newTitle.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto font-sans" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-scale-up border border-slate-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-5 flex items-center justify-between border-b border-emerald-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white font-bold">
              <CalendarCheck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold flex items-center gap-2">
                ترحيل رواتب الشهر وتفريغ الجدول
                <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-black">
                  دورة مالية جديدة
                </span>
              </h2>
              <p className="text-xs text-emerald-100">
                حفظ الشهر الحالي في الأرشيف وتجهيز الجدول لشهر جديد
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-100 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Current Month Snapshot Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 border-b border-slate-200 pb-2">
              <span>الشهر الحالي الذي سيتم أرشفته:</span>
              <span className="text-emerald-600 font-extrabold">{employeeCount} موظف</span>
            </div>
            <p className="font-extrabold text-slate-900 text-sm">{currentTitle}</p>
            <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-600 font-bold">إجمالي الصافي المُرَحَّل:</span>
              <span className="font-mono font-extrabold text-blue-600 text-sm">
                {formatCurrency(totals.netSalary)}
              </span>
            </div>
          </div>

          {/* What happens explanation */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>ما الذي سيحدث عند تأكيد الترحيل؟</span>
            </h3>
            <ul className="text-[11px] text-amber-800 space-y-1.5 font-medium pr-4 list-disc">
              <li>سيتم حفظ نسخة كاملة من كشف الرواتب الحالي في <strong className="font-bold text-slate-900">الأرشيف الشهري</strong> للرجوع إليها أو طباعتها لاحقاً.</li>
              <li>سيتم تفريغ الخانات المتغيرة فقط وتصفيرها (<strong className="text-rose-700">الإضافي، العمولة، المكافأة، الخصم، السلفة، الغيابات</strong>) لجميع الموظفين.</li>
              <li>سيتم <strong className="text-emerald-800">الاحتفاظ بجميع الموظفين، رواتبهم الأساسية، وبدلاتهم الثابتة</strong> والتأمينات كما هي لبدء الشهر الجديد بسلاسة.</li>
            </ul>
          </div>

          {/* New Month Title Input */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold text-slate-800">
              عنوان كشف الشهر الجديد:
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="مثال: اجمالي الراتب والبدلات والاضافي للعاملين عن شهر يوليو 2026 م"
              className="w-full border-2 border-slate-300 hover:border-emerald-500 focus:border-emerald-600 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none transition-all shadow-xs"
              required
            />
            <span className="text-[11px] text-slate-500 block">
              💡 يمكنك تعديل العنوان كما تشاء أو ترك الاقتراح الذكي للشهر التالي.
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-3 rounded-xl text-xs transition-colors"
            >
              إلغاء الأمر
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all text-xs flex items-center justify-center gap-2"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>تأكيد الترحيل وبدء الشهر الجديد</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
