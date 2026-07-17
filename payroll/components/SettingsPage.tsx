import React, { useState, useRef } from 'react';
import { 
  Settings, 
  Download, 
  Upload, 
  ShieldCheck, 
  RotateCcw, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  ArrowRight,
  PenTool,
  Database,
  Lock
} from 'lucide-react';
import { Employee, Signatures, ArchivedMonth, ViewMode } from '../types';
import { encryptBackupData, decryptBackupData, BackupPayload } from '../utils/backupCrypto';

interface SettingsPageProps {
  employees: Employee[];
  sheetTitle: string;
  signatures: Signatures;
  archives: ArchivedMonth[];
  insurancePercentage: number;
  onUpdateInsurancePercentage: (val: number) => void;
  onImportSuccess: (payload: BackupPayload) => void;
  onUpdateSignatures: (sigs: Signatures) => void;
  onResetData: () => void;
  onClearArchives: () => void;
  onViewChange: (mode: ViewMode) => void;
  onSyncHiringDates?: () => number;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  employees,
  sheetTitle,
  signatures,
  archives,
  insurancePercentage,
  onUpdateInsurancePercentage,
  onImportSuccess,
  onUpdateSignatures,
  onResetData,
  onClearArchives,
  onViewChange,
  onSyncHiringDates,
}) => {
  const [localSignatures, setLocalSignatures] = useState<Signatures>({ ...signatures });
  const [localInsurancePercentage, setLocalInsurancePercentage] = useState(insurancePercentage);
  const [saveSigSuccess, setSaveSigSuccess] = useState(false);
  const [saveInsuranceSuccess, setSaveInsuranceSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [isExporting, setIsExporting] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ updatedCount: number; checked: boolean }>({ updatedCount: 0, checked: false });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Export .bak
  const handleExportBak = () => {
    setIsExporting(true);
    try {
      const payload: BackupPayload = {
        version: "2026.1",
        exportedAt: new Date().toISOString(),
        sheetTitle: sheetTitle,
        employees: employees,
        signatures: signatures,
        archives: archives
      };

      const encryptedString = encryptBackupData(payload);
      const blob = new Blob([encryptedString], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      const cleanTitle = sheetTitle.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_').substring(0, 30);
      a.download = `Payroll_Backup_${cleanTitle}_${new Date().toISOString().slice(0, 10)}.bak`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
      alert("حدث خطأ أثناء تصدير ملف النسخة الاحتياطية.");
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Import .bak
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.bak') && !file.name.endsWith('.json')) {
      setImportStatus({
        type: 'error',
        message: 'تنبيه: يرجى اختيار ملف بصيغة .bak مشفر أو ملف نسخة احتياطية صحيح.'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const content = evt.target?.result as string;
        if (!content) throw new Error("الملف فارغ");

        const data = decryptBackupData(content);
        onImportSuccess(data);
        
        setImportStatus({
          type: 'success',
          message: `تم استعادة النسخة الاحتياطية بنجاح! (تم استرجاع ${data.employees.length} موظف و ${data.archives?.length || 0} شهر مؤرشف)`
        });

        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err: any) {
        console.error("Import failed:", err);
        setImportStatus({
          type: 'error',
          message: err.message || "فشل في استيراد الملف. قد يكون الملف غير صالح أو تالف."
        });
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleSaveSignatures = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSignatures(localSignatures);
    setSaveSigSuccess(true);
    setTimeout(() => setSaveSigSuccess(false), 3000);
  };

  return (
    <div className="w-full px-1 sm:px-2 py-8 space-y-8 font-sans" dir="rtl">
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white shadow-md">
            <Settings className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">إعدادات النظام والنسخ الاحتياطي</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">إدارة البيانات، تشفير وحفظ ملفات الرواتب (.bak)، وضبط التوقيعات الرسمية</p>
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

      {/* Section 2: Signatures Settings */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <PenTool className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">إعدادات التوقيعات والاعتمادات الرسمية</h2>
            <p className="text-xs text-slate-500">ضبط أسماء المسؤولين الظاهرة في أسفل كشوف الرواتب المطبوعة وقسائم الرواتب</p>
          </div>
        </div>

        <form onSubmit={handleSaveSignatures} className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">إعداد / الموارد البشرية</label>
              <input
                type="text"
                value={localSignatures.preparedBy}
                onChange={(e) => setLocalSignatures({ ...localSignatures, preparedBy: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-600 text-slate-900 bg-slate-50 focus:bg-white transition-all"
                placeholder="اسم المسؤول..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">مدير الحسابات</label>
              <input
                type="text"
                value={localSignatures.accountsManager}
                onChange={(e) => setLocalSignatures({ ...localSignatures, accountsManager: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-600 text-slate-900 bg-slate-50 focus:bg-white transition-all"
                placeholder="اسم مدير الحسابات..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">نائب المدير العام</label>
              <input
                type="text"
                value={localSignatures.deputyGeneralManager}
                onChange={(e) => setLocalSignatures({ ...localSignatures, deputyGeneralManager: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-600 text-slate-900 bg-slate-50 focus:bg-white transition-all"
                placeholder="اسم نائب المدير..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">المدير العام والعضو المنتدب</label>
              <input
                type="text"
                value={localSignatures.managingDirector}
                onChange={(e) => setLocalSignatures({ ...localSignatures, managingDirector: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-600 text-slate-900 bg-slate-50 focus:bg-white transition-all"
                placeholder="اسم المدير العام..."
              />
            </div>

          </div>

          <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-6 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all text-sm flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>حفظ التوقيعات الرسمية</span>
            </button>

            {saveSigSuccess && (
              <span className="text-emerald-600 font-bold text-xs flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-fade-in">
                <CheckCircle className="w-4 h-4" />
                <span>تم حفظ تعديل التوقيعات بنجاح في النظام!</span>
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Section: Insurance Percentage Settings */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">إعدادات التأمينات الاجتماعية</h2>
            <p className="text-xs text-slate-500">ضبط النسبة المئوية الافتراضية للتأمينات الاجتماعية للموظفين</p>
          </div>
        </div>
        
        <form 
          className="p-6 space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            onUpdateInsurancePercentage(localInsurancePercentage);
            setSaveInsuranceSuccess(true);
            setTimeout(() => setSaveInsuranceSuccess(false), 3000);
          }}
        >
          <div className="max-w-xs space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">نسبة التأمينات الاجتماعية (%)</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={localInsurancePercentage}
                onChange={(e) => setLocalInsurancePercentage(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-bold focus:outline-none focus:border-indigo-600 text-indigo-900 bg-indigo-50/30 focus:bg-white transition-all text-center"
              />
              <span className="text-lg font-bold text-slate-400">%</span>
            </div>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold px-6 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all text-sm flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>حفظ نسبة التأمينات</span>
            </button>

            {saveInsuranceSuccess && (
              <span className="text-emerald-600 font-bold text-xs flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-fade-in">
                <CheckCircle className="w-4 h-4" />
                <span>تم تحديث نسبة التأمينات بنجاح!</span>
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Section: Synchronize Hiring Dates */}
      {onSyncHiringDates && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Synchronize Hiring Dates</h2>
              <p className="text-xs text-slate-500">Copy correct hiring dates from the Allowances For Employees page to existing payroll employees.</p>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <p className="text-sm text-slate-600">
              This action matches employees between Allowances and Payroll pages using their codes or names, and updates their hiring dates in Payroll. No new employees will be added to the Payroll list.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  const count = onSyncHiringDates();
                  setSyncStatus({ updatedCount: count, checked: true });
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-6 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all text-sm flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Sync Hiring Dates Now</span>
              </button>
              
              {syncStatus.checked && (
                <span className={`text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${
                  syncStatus.updatedCount > 0 
                    ? 'text-emerald-600 bg-emerald-50 border-emerald-200' 
                    : 'text-slate-600 bg-slate-50 border-slate-200'
                }`}>
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    {syncStatus.updatedCount > 0 
                      ? `Successfully synchronized hiring dates for ${syncStatus.updatedCount} employees!`
                      : 'All hiring dates are already synchronized.'}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
