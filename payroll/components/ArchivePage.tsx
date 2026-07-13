import React, { useState } from 'react';
import { 
  Archive, 
  Printer, 
  RotateCcw, 
  Trash2, 
  Eye, 
  Calendar, 
  Users, 
  ArrowRight, 
  FileText, 
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { ArchivedMonth, ViewMode } from '../types';
import { formatCurrency, calculateGrandTotals } from '../utils/calculations';
import { ArchivedSheetModal } from './ArchivedSheetModal';
import { ArchivedSheetEditor } from './ArchivedSheetEditor';
import { ArchivedSheetView } from './ArchivedSheetView';

interface ArchivePageProps {
  archives: ArchivedMonth[];
  onDeleteArchive: (id: string) => void;
  onRestoreArchive: (archive: ArchivedMonth) => void;
  onPrintArchive: (archive: ArchivedMonth) => void;
  onUpdateArchive: (updatedArchive: ArchivedMonth) => void;
  onEditArchive: (archive: ArchivedMonth) => void;
  onViewChange: (mode: ViewMode) => void;
  payrollPhase?: 'full' | 'phase1' | 'phase2';
}

export const ArchivePage: React.FC<ArchivePageProps> = ({
  archives,
  onDeleteArchive,
  onRestoreArchive,
  onPrintArchive,
  onUpdateArchive,
  onEditArchive,
  onViewChange,
  payrollPhase = 'full',
}) => {
  const [viewingArchive, setViewingArchive] = useState<ArchivedMonth | null>(null);
  const [selectedArchive, setSelectedArchive] = useState<ArchivedMonth | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenView = (archive: ArchivedMonth) => {
    setViewingArchive(archive);
  };

  if (viewingArchive) {
    return (
      <ArchivedSheetView
        archive={viewingArchive}
        onBack={() => setViewingArchive(null)}
        payrollPhase={payrollPhase}
      />
    );
  }

  const sortedArchives = [...archives].sort((a, b) => a.monthIso.localeCompare(b.monthIso));

  return (
    <div className="w-full px-1 sm:px-2 py-8 space-y-8 font-sans" dir="rtl">
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white shadow-md">
            <Archive className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              أرشيف الرواتب الشهرية
              <span className="text-xs bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full font-bold">
                {archives.length} شهر مؤرشف
              </span>
            </h1>
          </div>
        </div>
        
        <button
          onClick={() => onViewChange('table')}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors border border-slate-200"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العوده</span>
        </button>
      </div>

      {/* Empty State */}
      {archives.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center max-w-2xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Archive className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-extrabold text-slate-800">لم يتم حفظ أي كشوف رواتب في الأرشيف بعد</h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-lg mx-auto">
            عند انتهائك من رواتب الشهر الحالي، اضغط على زر <strong className="text-indigo-600 font-extrabold">(ترحيل رواتب الشهر)</strong> في الصفحة الرئيسية. سيتم حفظ نسخة كاملة من جدول رواتب الشهر هنا بأمان مع تفريغ المتغيرات لبدء شهر جديد!
          </p>
          <div className="pt-2">
            <button
              onClick={() => onViewChange('table')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-extrabold text-xs shadow-md transition-all flex items-center gap-2 mx-auto"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>الذهاب لجدول الرواتب وترحيل شهر الآن</span>
            </button>
          </div>
        </div>
      ) : (
        /* Archives Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {sortedArchives.map((archive) => {
            // Recalculate totals based on the active payroll phase
            const currentTotals = calculateGrandTotals(archive.employees, payrollPhase as 'full' | 'phase1' | 'phase2');
            const net = currentTotals.netSalary || 0;
            const ent = currentTotals.totalEntitlements || 0;
            const ded = currentTotals.totalDeductions || 0;

            return (
              <div 
                key={archive.id} 
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-200 overflow-hidden flex flex-col justify-between group"
              >
                {/* Card Header - White Background */}
                <div className="bg-white border-b border-slate-100 p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {(() => {
                        if (!archive.archivedAt) return '';
                        // Simple check for Arabic digits and replace them
                        const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
                        let str = archive.archivedAt;
                        arabicDigits.forEach((d, i) => {
                          str = str.replace(new RegExp(d, 'g'), i.toString());
                        });
                        
                        // If it's a long date with Arabic months, try to keep digits but English
                        // If it was already ISO like "2026-01-31", it stays same.
                        return str;
                      })()}
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                      {archive.employeeCount} موظف
                    </span>
                  </div>
                </div>

                {/* Card Body - Financial Summary */}
                <div className="p-4 space-y-3 bg-slate-50/30 flex-1">
                  <div className="grid grid-cols-1 gap-2">
                    <div className="bg-white p-2 rounded-lg border border-slate-100 flex justify-between items-center">
                      <span className="text-[10px] text-slate-400">إجمالي الاستحقاقات</span>
                      <span className="font-mono font-bold text-emerald-600 text-[11px]">
                        {formatCurrency(ent)}
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-100 flex justify-between items-center">
                      <span className="text-[10px] text-slate-400">إجمالي الخصومات</span>
                      <span className="font-mono font-bold text-rose-600 text-[11px]">
                        {formatCurrency(ded)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-blue-50/50 border border-blue-100 p-2 rounded-lg flex justify-between items-center">
                    <span className="text-[10px] font-bold text-blue-900">الصافي:</span>
                    <span className="font-mono font-extrabold text-blue-700 text-xs">
                      {formatCurrency(net)}
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1 flex-1">
                    <button
                      onClick={() => handleOpenView(archive)}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold py-1.5 px-2 rounded-lg text-[10px] flex items-center justify-center gap-1 transition-colors border border-indigo-100"
                      title="عرض"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>عرض</span>
                    </button>

                    <button
                      onClick={() => onEditArchive(archive)}
                      className="bg-amber-50 hover:bg-amber-100 text-amber-700 font-extrabold py-1.5 px-2 rounded-lg text-[10px] flex items-center justify-center gap-1 transition-colors border border-amber-100"
                      title="تعديل"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>تعديل</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onPrintArchive(archive)}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-600 p-1.5 rounded-lg transition-colors border border-slate-100"
                      title="طباعة"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`هل أنت متأكد من حذف كشف (${archive.sheetTitle}) من الأرشيف نهائياً؟`)) {
                          onDeleteArchive(archive.id);
                        }
                      }}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-1.5 rounded-lg transition-colors border border-rose-100"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Historical Sheet Detail Modal */}
      <ArchivedSheetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        archive={selectedArchive}
        onPrint={(arch) => {
          setIsModalOpen(false);
          onPrintArchive(arch);
        }}
      />

    </div>
  );
};
