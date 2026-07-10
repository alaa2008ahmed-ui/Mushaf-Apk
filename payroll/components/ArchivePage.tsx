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
import { formatCurrency } from '../utils/calculations';
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
              أرشيف كشوف الرواتب الشهرية
              <span className="text-xs bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full font-bold">
                {archives.length} شهر مؤرشف
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              السجل التاريخي الكامل لرواتب الشهور السابقة المحفوظة في النظام للرجوع إليها أو طباعتها أو استرجاعها
            </p>
          </div>
        </div>
        
        <button
          onClick={() => onViewChange('table')}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors border border-slate-200"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة لجدول الرواتب</span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {archives.map((archive) => {
            const net = archive.totals?.netSalary || 0;
            const ent = archive.totals?.totalEntitlements || 0;
            const ded = archive.totals?.totalDeductions || 0;

            return (
              <div 
                key={archive.id} 
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-200 overflow-hidden flex flex-col justify-between group"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {archive.archivedAt}
                    </span>
                    <span className="text-xs font-mono font-bold bg-white/10 px-2 py-0.5 rounded text-slate-300">
                      {archive.employeeCount} موظف
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold leading-snug text-white pt-1 line-clamp-2">
                    {archive.sheetTitle}
                  </h3>
                </div>

                {/* Card Body - Financial Summary */}
                <div className="p-5 space-y-4 bg-slate-50/50 flex-1">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="block text-[11px] text-slate-400 mb-0.5">إجمالي الاستحقاقات</span>
                      <span className="font-mono font-bold text-emerald-600 text-xs">
                        {formatCurrency(ent)}
                      </span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="block text-[11px] text-slate-400 mb-0.5">إجمالي الخصومات</span>
                      <span className="font-mono font-bold text-rose-600 text-xs">
                        {formatCurrency(ded)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-blue-50/70 border border-blue-200 p-3 rounded-xl flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900">صافي الرواتب المستحقة:</span>
                    <span className="font-mono font-extrabold text-blue-700 text-sm">
                      {formatCurrency(net)}
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-1">
                    <button
                      onClick={() => handleOpenView(archive)}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-indigo-200/60"
                      title="عرض جدول الرواتب الكامل لهذا الشهر"
                    >
                      <Eye className="w-4 h-4 text-indigo-600" />
                      <span>عرض</span>
                    </button>

                    <button
                      onClick={() => onEditArchive(archive)}
                      className="bg-amber-50 hover:bg-amber-100 text-amber-700 font-extrabold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-amber-200/60"
                      title="تعديل بيانات هذا الشهر المؤرشف مباشرة"
                    >
                      <RotateCcw className="w-4 h-4 text-amber-600" />
                      <span>تعديل</span>
                    </button>
                    
                    <button
                      onClick={() => onPrintArchive(archive)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold p-2 rounded-xl text-xs transition-colors border border-slate-200"
                      title="طباعة كشف هذا الشهر"
                    >
                      <Printer className="w-4 h-4 text-blue-600" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        if (window.confirm(`هل أنت متأكد من حذف كشف (${archive.sheetTitle}) من الأرشيف نهائياً؟`)) {
                          onDeleteArchive(archive.id);
                        }
                      }}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold p-2 rounded-xl text-xs transition-colors border border-rose-200/60"
                      title="حذف من الأرشيف"
                    >
                      <Trash2 className="w-4 h-4 text-rose-600" />
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
