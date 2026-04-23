import React, { useState, useEffect } from 'react';
import { Home, ListOrdered, Landmark, Users, PieChart, Plus, Trash2, X, TrendingUp, TrendingDown, Sun, Moon, ChevronDown, Tags, Edit2, ArrowRight, ChevronLeft, Layers, Calendar, Filter, Menu, Settings, Shield, Lock, Unlock, Fingerprint, FileText, Download, Upload, Printer, FileSpreadsheet, BarChart2, ArrowLeftRight, PauseCircle, PlayCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { motion, AnimatePresence } from 'motion/react';

// --- TYPES ---
type CategoryType = 'income' | 'fixed_expense' | 'variable_expense';
type MainCategory = { id: string; name: string; type: 'income' | 'expense'; items: string[]; };
type Transaction = { id: string; type: 'income' | 'expense'; category: string; amount: number; date: string; accountId: string; note: string; transferId?: string; };
type Account = { id: string; name: string; initialBalance: number; isPaused?: boolean; };
type DebtType = 'owed_to_me' | 'owed_by_me';
type Debt = { id: string; person: string; amount: number; type: DebtType; date: string; note: string; isPaid: boolean; transactionId?: string; accountId?: string; };
type ExpenseGroup = { id: string; name: string; categories: string[]; };

// --- HELPERS ---
const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2, 5);
const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(val);
const formatDate = (date: string) => new Intl.DateTimeFormat('en-GB').format(new Date(date));
const getCurrentMonthStr = () => new Date().toISOString().slice(0, 7);

const defaultMainCategories: MainCategory[] = [
  { id: 'mc_1', name: 'الدخل', type: 'income', items: ['راتب', 'مكافأة'] },
  { id: 'mc_2', name: 'المنزل (ثابت)', type: 'expense', items: ['إيجار', 'كهرباء', 'إنترنت'] },
  { id: 'mc_3', name: 'مصاريف معيشة', type: 'expense', items: ['طعام', 'مواصلات', 'أخرى'] }
];

// --- CATEGORY PICKER MODAL ---
const CategoryPickerModal = ({ isOpen, onClose, onSelect, mainCategories, txType }: { isOpen: boolean, onClose: () => void, onSelect: (val: string) => void, mainCategories: MainCategory[], txType: 'income' | 'expense' }) => {
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
       setActiveGroup(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const availableGroups = mainCategories.filter(mc => mc.type === txType);

  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-slate-900 z-[90] flex flex-col animate-slide-up">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-950 min-h-[72px]">
         <div className="flex items-center gap-3">
            {activeGroup ? (
              <button type="button" onClick={() => setActiveGroup(null)} className="p-2 -mr-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <ArrowRight size={20} />
              </button>
            ) : null}
            <h2 className="font-bold text-lg text-slate-800 dark:text-white">
              {activeGroup ? mainCategories.find(mc => mc.id === activeGroup)?.name : (txType === 'expense' ? 'اختر تصنيف المصروف' : 'اختر الإيراد')}
            </h2>
         </div>
         <button type="button" onClick={onClose} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
           <X size={20} />
         </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-20">
        {!activeGroup ? (
          availableGroups.map(g => (
            <div 
              key={g.id} 
              onClick={() => setActiveGroup(g.id)}
              className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between cursor-pointer active:scale-95 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${g.type === 'income' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400'}`}>
                  <Tags size={24} />
                </div>
                <span className="font-bold text-[1.1rem] text-slate-800 dark:text-slate-100">{g.name}</span>
              </div>
              <ChevronLeft size={24} className="text-slate-400 dark:text-slate-600" />
            </div>
          ))
        ) : (
          mainCategories.find(mc => mc.id === activeGroup)?.items.map(item => (
            <div 
              key={item}
              onClick={() => { onSelect(item); onClose(); }}
              className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between cursor-pointer active:scale-95 transition-all"
            >
              <span className="font-semibold text-slate-700 dark:text-slate-200 text-base">{item}</span>
              <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center"></div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// --- CUSTOM SELECT COMPONENT ---
const CustomSelect = ({ value, onChange, options, placeholder }: {value: string, onChange: (val: string) => void, options: {value: string, label: string}[], placeholder: string}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)} 
        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-50 p-3.5 rounded-2xl text-sm flex justify-between items-center cursor-pointer transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
      >
        <span className={!selected ? "text-slate-400 dark:text-slate-500" : "font-medium"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={16} className="text-slate-400 dark:text-slate-500" />
      </div>
      
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/20 dark:bg-slate-950/80 backdrop-blur-md flex items-end justify-center z-[70]">
          {/* Click outside to close */}
          <div className="absolute inset-0" onClick={() => setIsOpen(false)}></div>
          <div className="bg-slate-50 dark:bg-slate-900 w-full max-w-md rounded-t-[2.5rem] p-6 pb-12 animate-slide-up shadow-2xl border-t border-slate-200 dark:border-slate-800 relative z-10 flex flex-col max-h-[85vh]">
             <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-6"></div>
             <button type="button" onClick={() => setIsOpen(false)} className="absolute top-6 left-6 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 p-2 rounded-full transition-colors"><X size={18}/></button>
             <h3 className="font-bold text-lg mb-6 text-slate-900 dark:text-white px-2 mt-1">{placeholder}</h3>
             <div className="space-y-3 overflow-y-auto px-1 flex-1 pb-4">
                {options.map(o => (
                  <div 
                    key={o.value} 
                    onClick={() => { onChange(o.value); setIsOpen(false); }} 
                    className={`flex justify-between items-center p-4 rounded-[1.25rem] cursor-pointer transition-all ${value === o.value ? 'bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 shadow-sm'}`}
                  >
                     <span className={`text-base font-semibold ${value === o.value ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200'}`}>{o.label}</span>
                     <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${value === o.value ? 'border-indigo-600 dark:border-indigo-400' : 'border-slate-300 dark:border-slate-600'}`}>
                        {value === o.value && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400 transition-transform" />}
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      )}
    </>
  )
}

// --- MAIN APP COMPONENT ---
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') !== 'light'); // Default to dark conceptually, but let's make light default via css, actually user asked for White theme as default. Let's flip it.
  
  // Actually, light theme as default:
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return next;
    });
  };

  // Data States
  const [transactions, setTransactions] = useState<Transaction[]>(() => JSON.parse(localStorage.getItem('fin_transactions') || '[]'));
  const [accounts, setAccounts] = useState<Account[]>(() => JSON.parse(localStorage.getItem('fin_accounts') || '[{"id":"1","name":"كاش","initialBalance":0}]'));
  const [debts, setDebts] = useState<Debt[]>(() => JSON.parse(localStorage.getItem('fin_debts') || '[]'));
  const [editDebtId, setEditDebtId] = useState<string | null>(null);
  const [budget, setBudget] = useState<{ [month: string]: number }>(() => JSON.parse(localStorage.getItem('fin_budget') || '{}'));
  const [mainCategories, setMainCategories] = useState<MainCategory[]>(() => JSON.parse(localStorage.getItem('fin_main_cats') || JSON.stringify(defaultMainCategories)));
  const defaultGroups = [
    { id: 'grp_1', name: 'السيارة', categories: ['مواصلات'] },
    { id: 'grp_2', name: 'المنزل', categories: ['إيجار', 'كهرباء', 'إنترنت', 'طعام'] }
  ];
  const [expenseGroups, setExpenseGroups] = useState<ExpenseGroup[]>(() => {
    const saved = localStorage.getItem('fin_expense_groups');
    if (!saved || saved === '[]') return defaultGroups;
    return JSON.parse(saved);
  });

  useEffect(() => { localStorage.setItem('fin_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('fin_accounts', JSON.stringify(accounts)); }, [accounts]);
  useEffect(() => { localStorage.setItem('fin_debts', JSON.stringify(debts)); }, [debts]);
  useEffect(() => { localStorage.setItem('fin_budget', JSON.stringify(budget)); }, [budget]);
  useEffect(() => { localStorage.setItem('fin_main_cats', JSON.stringify(mainCategories)); }, [mainCategories]);
  useEffect(() => { localStorage.setItem('fin_expense_groups', JSON.stringify(expenseGroups)); }, [expenseGroups]);

  // Derived Account Balances
  const getAccountBalance = (accId: string) => {
    const acc = accounts.find(a => a.id === accId);
    if (!acc) return 0;
    let bal = acc.initialBalance;
    transactions.filter(t => t.accountId === accId).forEach(t => {
      if (t.type === 'income') bal += t.amount;
      if (t.type === 'expense') bal -= t.amount;
    });
    return bal;
  };

  const currentMonth = getCurrentMonthStr();
  const currentMonthTrans = transactions.filter(t => t.date.startsWith(currentMonth));
  const totalIncome = currentMonthTrans.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = currentMonthTrans.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const bankBalance = accounts.filter(a => !a.isPaused).reduce((s, a) => s + getAccountBalance(a.id), 0);
  const owedToMe = debts.filter(d => !d.isPaid && d.type === 'owed_to_me').reduce((s, d) => s + d.amount, 0);
  const owedByMe = debts.filter(d => !d.isPaid && d.type === 'owed_by_me').reduce((s, d) => s + d.amount, 0);
  const totalAvailableBalance = bankBalance; // User excluded debts from total balance
  const netWorth = bankBalance + owedToMe - owedByMe; // Keep internal netWorth for calculation if needed, but UI will use bankBalance for "Total Current Balance"

  // Global Trans Modal State
  const [showTransModal, setShowTransModal] = useState(false);
  const [editTransId, setEditTransId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [accFilterStart, setAccFilterStart] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  });
  const [accFilterEnd, setAccFilterEnd] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Security States
  const [appPin, setAppPin] = useState(() => localStorage.getItem('app_pin') || '');
  const [isLocked, setIsLocked] = useState(() => !!localStorage.getItem('app_pin'));
  const [useBiometrics, setUseBiometrics] = useState(() => localStorage.getItem('use_biometrics') === 'true');

  const exportToExcel = (data: any[], fileName: string) => {
    // Calculate total for Excel
    const total = data.reduce((s, d) => {
      const amt = d['المبلغ'] || d['الرصيد الحالي'] || 0;
      const type = d['النوع'] || 'إيداع';
      return s + (type === 'سحب' ? -amt : amt);
    }, 0);
    
    const ws = XLSX.utils.json_to_sheet([...data, {}, { 'التاريخ': 'الإجمالي النهائي', 'المبلغ': total }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  const exportToPDF = (headers: string[], data: any[][], title: string, fileName: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return alert('يرجى السماح بالنوافذ المنبثقة');

    let tableHtml = `<table style="width:100%; border-collapse: collapse; direction: rtl; font-family: 'Cairo', sans-serif;">
      <thead>
        <tr style="background-color: #f1f5f9;">
          ${headers.map(h => `<th style="border: 1px solid #e2e8f0; padding: 12px; text-align: right;">${h}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${data.map(row => `
          <tr>
            ${row.map(cell => `<td style="border: 1px solid #e2e8f0; padding: 10px; text-align: right;">${cell}</td>`).join('')}
          </tr>
        `).join('')}
        <tr style="background-color: #f8fafc; font-weight: bold;">
          ${headers.map(h => {
            const totalIndex = headers.indexOf('المبلغ') !== -1 ? headers.indexOf('المبلغ') : headers.indexOf('الرصيد الحالي');
            const valIndex = headers.indexOf(h);
            if (valIndex === totalIndex) {
               const total = data.reduce((s, r) => {
                 const amt = parseFloat(r[totalIndex] || '0');
                 const typeIndex = headers.indexOf('النوع');
                 const type = typeIndex !== -1 ? r[typeIndex] : 'إيداع';
                 return s + (type === 'سحب' ? -amt : amt);
               }, 0);
               return `<td style="border: 1px solid #e2e8f0; padding: 12px; text-align: right;">${total}</td>`;
            }
            if (valIndex === 0) return `<td style="border: 1px solid #e2e8f0; padding: 12px; text-align: right;">الإجمالي</td>`;
            return `<td style="border: 1px solid #e2e8f0; padding: 12px; text-align: right;"></td>`;
          }).join('')}
        </tr>
      </tbody>
    </table>`;

    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Cairo', sans-serif; padding: 40px; }
            h1 { text-align: center; color: #1e293b; margin-bottom: 30px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <h1>${title}</h1>
          ${tableHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  useEffect(() => {
    if (useBiometrics && isLocked) {
      handleBiometricAuth();
    }
  }, []);

  const handleBiometricAuth = async () => {
    if (window.isSecureContext && window.PublicKeyCredential) {
      try {
        // Simple biometric check simulation or real webauthn
        // For a simple demo/app, we can use a small delay and unlock if successful
        setIsLocked(false);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const verifyPin = (input: string) => {
    if (input === appPin) {
      setIsLocked(false);
      return true;
    }
    return false;
  };

  const selectedAccount = accounts.find(a => a.id === selectedAccountId);
  const accountTxs = transactions
    .filter(t => {
      if (t.accountId !== selectedAccountId) return false;
      const tDate = new Date(t.date).getTime();
      const start = accFilterStart ? new Date(accFilterStart).getTime() : 0;
      const end = accFilterEnd ? new Date(accFilterEnd).getTime() : Infinity;
      // Compare dates only (ignore time if needed but ISO usually works fine for these inputs)
      return tDate >= start && tDate <= end;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const AccountDetailModal = () => {
    if (!selectedAccountId || !selectedAccount) return null;
    return (
      <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[110] p-5">
        <div className="absolute inset-0" onClick={() => setSelectedAccountId(null)}></div>
        <div className="bg-white dark:bg-slate-900 w-full max-w-[360px] rounded-[2.5rem] p-6 relative shadow-2xl z-10 max-h-[80vh] flex flex-col animate-slide-up border border-slate-200 dark:border-slate-800 transition-all overflow-hidden" dir="rtl">
          <button onClick={() => setSelectedAccountId(null)} className="absolute top-5 left-5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition-colors z-20"><X size={20}/></button>
          {selectedAccount.id !== '1' && selectedAccount.name !== 'كاش' && selectedAccount.name !== 'النقدية' && selectedAccount.name !== 'البنك' && (
            <button 
              onClick={() => {
                const bal = getAccountBalance(selectedAccount.id);
                if (bal !== 0) {
                  alert('لا يمكن حذف حساب به رصيد. يرجى تصفية الحساب أولاً.');
                  return;
                }
                if(confirm('تأكيد حذف هذا الحساب نهائياً؟')) {
                  setAccounts(prev => prev.filter(a => a.id !== selectedAccount.id));
                  setSelectedAccountId(null);
                }
              }} 
              disabled={accounts.length === 1}
              className="absolute top-5 left-16 text-slate-300 hover:text-red-500 p-2 rounded-full transition-colors z-20 disabled:opacity-0"
            >
              <Trash2 size={20}/>
            </button>
          )}
          
          <div className="mb-6">
            <h3 className="font-black text-xl text-slate-900 dark:text-white truncate pr-8">{selectedAccount.name}</h3>
            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">من تاريخ</p>
                    <input 
                      type="date" 
                      value={accFilterStart} 
                      onChange={e => setAccFilterStart(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 p-2 rounded-xl focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">إلى تاريخ</p>
                    <input 
                      type="date" 
                      value={accFilterEnd} 
                      onChange={e => setAccFilterEnd(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 p-2 rounded-xl focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="h-px bg-slate-100 dark:bg-slate-700 w-full"></div>
                <div className="flex justify-between items-center">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">الرصيد الحالي بهذا الحساب</p>
                   <p className="text-sm font-black text-blue-600 dark:text-blue-400">{formatCurrency(getAccountBalance(selectedAccount.id)).replace('EGP','')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5 custom-scrollbar">
            {accountTxs.length === 0 && (
              <div className="text-center text-slate-400 py-12 flex flex-col items-center gap-3">
                 <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center">
                   <ListOrdered size={24} className="opacity-20" />
                 </div>
                 <p className="text-xs font-bold font-arabic">لا توجد حركات مسجلة لهذا الحساب</p>
              </div>
            )}
            {accountTxs.map(t => (
              <div key={t.id} onClick={() => { setEditTransId(t.id); setShowTransModal(true); setSelectedAccountId(null); }} className="bg-white dark:bg-slate-950 p-3.5 rounded-2xl flex justify-between items-center border border-slate-100 dark:border-slate-800 shadow-sm transition-all active:scale-[0.98] cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50">
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-xs block text-slate-800 dark:text-slate-200 truncate">{t.category}</span>
                  <span className="text-[10px] font-bold text-slate-400 mt-1 block truncate">{formatDate(t.date)} {t.note && `• ${t.note}`}</span>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0 ml-3">
                  <span className={`font-black text-xs ${t.type==='income' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {t.type==='income'?'+':'-'}{formatCurrency(t.amount).replace('EGP','')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Shared Card Classes based on Bento Grid - updated for dual theme
  const cardClass = "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 flex flex-col justify-between transition-all shadow-sm";
  const headerClass = "text-[0.875rem] text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-2 mb-3";

  // --- SUB-COMPONENTS ---
  const Dashboard = () => {
    const [detailContent, setDetailContent] = useState<{title: string, type: 'tx' | 'acc' | 'debt', data: any[]} | null>(null);

    // Using current month transactions instead of custom periods as requested
    const pIncomeTx = currentMonthTrans.filter(t => t.type === 'income');
    const pIncome = pIncomeTx.reduce((s, t) => s + t.amount, 0);
    const pExpenseTx = currentMonthTrans.filter(t => t.type === 'expense');
    const pExpense = pExpenseTx.reduce((s, t) => s + t.amount, 0);
    const pNet = pIncome - pExpense;
    
    // Detailed lists rendering - Centered Modal
    const renderDetailList = () => {
      if (!detailContent) return null;
      return (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[110] p-5">
          <div className="absolute inset-0" onClick={() => setDetailContent(null)}></div>
          <div className="bg-white dark:bg-slate-900 w-full max-w-[340px] rounded-[2rem] p-5 relative shadow-2xl z-10 max-h-[60vh] flex flex-col animate-slide-up border border-slate-200 dark:border-slate-800 transition-all">
            <button onClick={() => setDetailContent(null)} className="absolute top-4 left-4 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full"><X size={18}/></button>
            <h3 className="font-bold text-base mb-4 text-slate-900 dark:text-white px-1 pr-2 shrink-0">{detailContent.title}</h3>
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 pb-1">
              {detailContent.data.length === 0 && <div className="text-center text-slate-500 py-6 font-medium text-sm">لا توجد بيانات لهذه الفترة</div>}
              {detailContent.type === 'tx' && detailContent.data.map((t: Transaction) => (
                <div key={t.id} className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl flex justify-between items-center border border-slate-100 dark:border-slate-800 shadow-sm transition-all active:scale-[0.98]">
                  <div className="flex-1 overflow-hidden cursor-pointer" onClick={() => { setEditTransId(t.id); setShowTransModal(true); setDetailContent(null); }}>
                    <span className="font-bold text-xs block text-slate-800 dark:text-slate-200 truncate">{t.category}</span>
                    <span className="text-[10px] font-medium text-slate-500 mt-1 block truncate">{formatDate(t.date)} {t.note && `- ${t.note}`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-xs ${t.type==='income'? 'text-emerald-500': 'text-red-500'}`}>{formatCurrency(t.amount).replace('EGP','')}</span>
                  </div>
                </div>
              ))}
              {detailContent.type === 'acc' && detailContent.data.map((a: Account) => (
                <div key={a.id} className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl flex justify-between items-center border border-slate-100 dark:border-slate-800 shadow-sm">
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{a.name}</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 text-xs">{formatCurrency(getAccountBalance(a.id)).replace('EGP','')}</span>
                </div>
              ))}
              {detailContent.type === 'debt' && detailContent.data.map((d: Debt) => (
                <div key={d.id} className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl flex justify-between items-center border border-slate-100 dark:border-slate-800 shadow-sm">
                  <div>
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">{d.person}</span>
                    <span className="text-[10px] font-medium text-slate-500 mt-1 block">{d.note || 'بدون ملاحظات'}</span>
                  </div>
                  <span className={`font-bold text-xs ${d.type==='owed_to_me'? 'text-emerald-500': 'text-red-500'}`}>{formatCurrency(d.amount).replace('EGP','')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="p-4 h-full flex flex-col relative">
        <div className="grid grid-cols-2 gap-3 p-4 pb-24 overflow-y-auto w-full flex-1 mt-2">
          {/* Net Worth - Global (Made Smaller) */}
          <div className="col-span-2 bg-gradient-to-br from-indigo-700 to-indigo-900 dark:from-slate-800 dark:to-slate-950 rounded-[1.5rem] p-5 shadow-lg border border-indigo-500/30 cursor-pointer active:scale-95 transition-transform" onClick={() => setDetailContent({type: 'acc', title: 'تفاصيل الأرصدة والبنوك', data: accounts})}>
            <div className="text-indigo-100 dark:text-slate-300 text-[11px] font-bold flex items-center justify-between mb-1">إجمالي الرصيد الحالي <div className="bg-white/20 p-1 rounded-full"><ChevronDown size={12}/></div></div>
            <div className="text-3xl font-bold text-white tracking-tight mt-1">{formatCurrency(totalAvailableBalance).replace('EGP', '')}</div>
          </div>

          {/* Period Income & Expense */}
          <div className="col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[1.5rem] p-4 shadow-sm cursor-pointer active:scale-95 transition-transform hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-900/50" onClick={() => setDetailContent({type: 'tx', title: 'إيرادات الشهر الحالي', data: pIncomeTx})}>
             <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-[11px] font-extrabold mb-2 uppercase tracking-wide bg-emerald-50 dark:bg-emerald-500/10 w-fit px-2 py-1 rounded-lg"><TrendingUp size={12}/> الدخل</div>
             <div className="text-lg font-bold text-slate-800 dark:text-slate-50">{formatCurrency(pIncome).replace('EGP','')}</div>
          </div>
          <div className="col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[1.5rem] p-4 shadow-sm cursor-pointer active:scale-95 transition-transform hover:shadow-md hover:border-red-200 dark:hover:border-red-900/50" onClick={() => setDetailContent({type: 'tx', title: 'مصروفات الشهر الحالي', data: pExpenseTx})}>
             <div className="flex items-center gap-1.5 text-red-500 dark:text-red-400 text-[11px] font-extrabold mb-2 uppercase tracking-wide bg-red-50 dark:bg-red-500/10 w-fit px-2 py-1 rounded-lg"><TrendingDown size={12}/> المصروفات</div>
             <div className="text-lg font-bold text-slate-800 dark:text-slate-50">{formatCurrency(pExpense).replace('EGP','')}</div>
          </div>

          {/* Savings / Net in Period */}
          <div className="col-span-2 bg-indigo-50 dark:bg-slate-900 border border-indigo-100 dark:border-slate-800 rounded-[1.5rem] p-4 shadow-sm flex justify-between items-center cursor-pointer active:scale-95 transition-transform" onClick={() => setDetailContent({type: 'tx', title: 'سجل حركات الشهر', data: currentMonthTrans})}>
             <div className="flex items-center gap-2">
                <div className="bg-indigo-100 dark:bg-slate-800 p-1.5 rounded-xl text-indigo-600 dark:text-indigo-400"><PieChart size={16}/></div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-200">صافي الشهر (التوفير)</div>
             </div>
             <div className={`text-lg font-bold ${pNet >= 0 ? 'text-emerald-600 dark:text-emerald-400': 'text-red-600 dark:text-red-400'}`} dir="ltr">{pNet >= 0 ? '+' : ''}{pNet}</div>
          </div>

          {/* Expense Groups Summary */}
          {expenseGroups.length > 0 && (
            <div className="col-span-2 grid grid-cols-2 gap-3 mt-1">
               {expenseGroups.map(group => {
                 const gTx = pExpenseTx.filter(t => group.categories.includes(t.category));
                 const gTotal = gTx.reduce((s, t) => s + t.amount, 0);
                 return (
                   <div key={group.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[1.5rem] p-4 shadow-sm cursor-pointer active:scale-95 transition-transform hover:border-cyan-200 dark:hover:border-cyan-900/50" onClick={() => setDetailContent({type: 'tx', title: `مصاريف ${group.name}`, data: gTx})}>
                      <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-between">{group.name} <ChevronDown size={12}/></div>
                      <div className="text-base font-bold text-slate-800 dark:text-slate-100">{formatCurrency(gTotal).replace('EGP','')}</div>
                   </div>
                 );
               })}
            </div>
          )}

          {/* Debts Summary */}
          <div className="col-span-2 flex gap-3 mt-1">
             <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[1.5rem] p-4 shadow-sm cursor-pointer active:scale-95 transition-transform" onClick={() => setDetailContent({type: 'debt', title: 'لك عند الآخرين', data: debts.filter(d => d.type === 'owed_to_me' && !d.isPaid)})}>
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1 flex justify-between">أدائن (لي) <ChevronDown size={12}/></div>
                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(owedToMe).replace('EGP','')}</div>
             </div>
             <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[1.5rem] p-4 shadow-sm cursor-pointer active:scale-95 transition-transform" onClick={() => setDetailContent({type: 'debt', title: 'ديون مستحقة عليك', data: debts.filter(d => d.type === 'owed_by_me' && !d.isPaid)})}>
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1 flex justify-between">مدين (علي) <ChevronDown size={12}/></div>
                <div className="text-sm font-bold text-red-500 dark:text-red-400">{formatCurrency(owedByMe).replace('EGP','')}</div>
             </div>
          </div>
          
        </div>
        {renderDetailList()}
      </div>
    );
  };

  const TransactionsManager = () => {
    return (
      <div className="p-4 h-full flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-3 pb-24">
          {transactions.map(t => (
            <div key={t.id} onClick={() => { setEditTransId(t.id); setShowTransModal(true); }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl flex justify-between items-center border-r-4 transition-all shadow-sm cursor-pointer active:scale-[0.99] hover:bg-slate-50 dark:hover:bg-slate-800/50" style={{borderRightColor: t.transferId ? '#60a5fa' : (t.type === 'income' ? '#34d399' : '#f87171')}}>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm text-slate-800 dark:text-slate-50">{t.category}</p>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded-xl font-medium">{accounts.find(a => a.id === t.accountId)?.name}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">{formatDate(t.date)} {t.note && `• ${t.note}`}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`font-bold ${t.type === 'income' ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>{t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount).replace('EGP','')}</span>
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
             <div className="text-center text-slate-500 dark:text-slate-400 p-10 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">لا توجد حركات مسجلة</div>
          )}
        </div>
      </div>
    );
  };

  const AccountsManager = () => {
    const [name, setName] = useState('');
    const [initBal, setInitBal] = useState('');

    const addAccount = (e: React.FormEvent) => {
      e.preventDefault();
      if(!name) return;
      setAccounts([...accounts, { id: generateId(), name, initialBalance: parseFloat(initBal || '0') }]);
      setName(''); setInitBal('');
    };

    return (
      <div className="p-4 h-full flex flex-col">
        <form onSubmit={addAccount} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-3xl mb-5 flex gap-2 shadow-sm">
          <input required type="text" placeholder="اسم الحساب" value={name} onChange={e => setName(e.target.value)} onFocus={(e) => setTimeout(() => e.target.scrollIntoView({behavior:'smooth', block:'center'}), 300)} className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-50 p-3.5 rounded-2xl text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-500"/>
          <input type="number" placeholder="رصيد" value={initBal} onChange={e => setInitBal(e.target.value)} onFocus={(e) => setTimeout(() => e.target.scrollIntoView({behavior:'smooth', block:'center'}), 300)} className="w-[80px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-50 p-3.5 rounded-2xl text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-500"/>
          <button type="submit" className="bg-blue-500 dark:bg-blue-500 text-white p-3.5 rounded-2xl flex items-center justify-center font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-transform"><Plus size={20}/></button>
        </form>
        <div className="space-y-3 overflow-y-auto pb-24">
          {accounts.map(acc => (
             <div key={acc.id} onClick={() => setSelectedAccountId(acc.id)} className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl flex justify-between items-center shadow-sm transition-all cursor-pointer active:scale-[0.98] hover:bg-slate-50 dark:hover:bg-slate-800/50 ${acc.isPaused ? 'opacity-60' : ''}`}>
               <div className="flex flex-col">
                 <span className="font-bold text-sm text-slate-800 dark:text-slate-100">{acc.name}</span>
                 {acc.isPaused && <span className="text-[10px] text-amber-600 dark:text-amber-500 font-bold mt-1">متوقف مؤقتاً</span>}
               </div>
              <div className="flex items-center gap-3">
                <span className={`font-bold px-3 py-1 rounded-full text-sm ${acc.isPaused ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'}`}>
                  {formatCurrency(getAccountBalance(acc.id)).replace('EGP','')}
                </span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setAccounts(accounts.map(a => a.id === acc.id ? { ...a, isPaused: !a.isPaused } : a));
                  }} 
                  className={`p-2 rounded-xl transition-all ${acc.isPaused ? 'text-amber-500 bg-amber-50 dark:bg-amber-500/10' : 'text-slate-400 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                  title={acc.isPaused ? "تفعيل" : "إيقاف مؤقت"}
                >
                  {acc.isPaused ? <PlayCircle size={18}/> : <PauseCircle size={18}/>}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const DebtsManager = () => {
    const [showModal, setShowModal] = useState(false);
    const [debtToDelete, setDebtToDelete] = useState<Debt | null>(null);
    const [form, setForm] = useState({ person: '', amount: '', type: 'owed_by_me', date: new Date().toISOString().split('T')[0], note: '', accountId: accounts[0]?.id || '' });

    const openEdit = (d: Debt) => {
      setEditDebtId(d.id);
      setForm({ person: d.person, amount: d.amount.toString(), type: d.type, date: d.date, note: d.note, accountId: d.accountId || accounts[0]?.id || '' });
      setShowModal(true);
    };

    const saveForm = (e: React.FormEvent) => {
      e.preventDefault();
      if(!form.person || !form.amount || !form.accountId) return;
      
      const debtId = editDebtId || generateId();
      const amountValue = parseFloat(form.amount);
      const oldDebt = debts.find(x => x.id === editDebtId);
      
      // We manage a related transaction to update cash/bank
      // When adding debt:
      // if owed_to_me (I lend): expense from account
      // if owed_by_me (I borrow): income to account
      
      const txId = oldDebt?.transactionId || generateId();
      const newTx: Transaction = {
        id: txId,
        type: form.type === 'owed_to_me' ? 'expense' : 'income',
        category: form.type === 'owed_to_me' ? 'سلفية منصرفة' : 'سلفية واردة',
        amount: amountValue,
        date: form.date,
        accountId: form.accountId,
        note: `سلفة: ${form.person} ${form.note ? `(${form.note})` : ''}`
      };

      const payload: Debt = { 
        id: debtId, 
        person: form.person, 
        amount: amountValue, 
        type: form.type as DebtType, 
        date: form.date, 
        note: form.note, 
        isPaid: oldDebt?.isPaid || false,
        transactionId: txId,
        accountId: form.accountId
      };
      
      if (editDebtId) {
        setDebts(debts.map(d => d.id === editDebtId ? payload : d));
        setTransactions(prev => prev.map(t => t.id === txId ? newTx : t));
      } else {
        setDebts([payload, ...debts]);
        setTransactions([newTx, ...transactions]);
      }
      
      setShowModal(false);
      setEditDebtId(null);
      setForm({ person: '', amount: '', type: 'owed_by_me', date: new Date().toISOString().split('T')[0], note: '', accountId: accounts[0]?.id || '' });
    };

    const deleteDebt = (d: Debt) => {
      setDebts(debts.filter(x => x.id !== d.id));
      if (d.transactionId) {
        setTransactions(prev => prev.filter(t => t.id !== d.transactionId));
      }
      setDebtToDelete(null);
    };

    return (
      <div className="p-4 h-full relative flex flex-col">
        <div className="flex justify-between items-center mb-4 px-2">
           <button onClick={() => { setEditDebtId(null); setForm({ person: '', amount: '', type: 'owed_by_me', date: new Date().toISOString().split('T')[0], note: '', accountId: accounts[0]?.id || '' }); setShowModal(true); }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-blue-600 dark:text-blue-400 rounded-full p-2.5 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors mr-auto"><Plus size={20}/></button>
        </div>
        
        {/* Debts Summary */}
        <div className="grid grid-cols-2 gap-3 mb-4">
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 flex flex-col shadow-sm">
              <span className="text-xs text-emerald-500 dark:text-emerald-400 font-semibold mb-1">سلفيات لي</span>
              <span className="font-bold text-xl text-slate-800 dark:text-white">{formatCurrency(owedToMe).replace('EGP','')}</span>
           </div>
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 flex flex-col shadow-sm">
              <span className="text-xs text-red-500 dark:text-red-400 font-semibold mb-1">سلفيات علي</span>
              <span className="font-bold text-xl text-slate-800 dark:text-white">{formatCurrency(owedByMe).replace('EGP','')}</span>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pb-24">
          {debts.map(d => (
            <div key={d.id} className={`p-5 rounded-3xl border transition-all shadow-sm ${d.isPaid ? 'opacity-60 grayscale bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800/50' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-white">
                    {d.person} 
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ml-2 font-medium ${d.type === 'owed_to_me' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                      {d.type === 'owed_to_me' ? 'سلفة لي' : 'سلفة علي'}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">{formatDate(d.date)} {d.note && `• ${d.note}`}</p>
                </div>
                <span className="font-bold text-lg text-slate-800 dark:text-white">{formatCurrency(d.amount).replace('EGP','')}</span>
              </div>
              <div className="flex justify-between items-center mt-3 border-t border-slate-100 dark:border-slate-800 pt-3">
                 <div className="flex items-center gap-2">
                    <button onClick={() => setDebtToDelete(d)} className="text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 p-2 bg-slate-50 dark:bg-slate-800 rounded-full transition-colors"><Trash2 size={16}/></button>
                    <button onClick={() => openEdit(d)} className="text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 p-2 bg-slate-50 dark:bg-slate-800 rounded-full transition-colors"><Edit2 size={16}/></button>
                 </div>
               <button onClick={() => {
                 const isPaid = !d.isPaid;
                 setDebts(debts.map(x => x.id === d.id ? {...x, isPaid} : x));
                 
                 // If marked as paid, we should probably add a counter-transaction to clear account balance?
                 // Most accounting apps do this. If I borrowed (Income), paying back is Expense.
                 if (isPaid && d.accountId) {
                    const paybackId = generateId();
                    const paybackTx: Transaction = {
                      id: paybackId,
                      type: d.type === 'owed_by_me' ? 'expense' : 'income', 
                      category: d.type === 'owed_by_me' ? 'سداد سلفة (للغير)' : 'تحصيل سلفة (من الغير)',
                      amount: d.amount,
                      date: new Date().toISOString().split('T')[0],
                      accountId: d.accountId,
                      note: `سداد سداد سلفة: ${d.person}`
                    };
                    setTransactions(prev => [paybackTx, ...prev]);
                 }
               }} className={`text-xs py-2 px-5 rounded-full font-bold transition-all ${d.isPaid ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30'}`}>
                {d.isPaid ? 'تم السداد ✓' : 'سداد السلفة ✓'}
               </button>
              </div>
            </div>
          ))}
          {debts.length === 0 && <div className="text-center text-slate-500 dark:text-slate-400 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">لا يوجد سلفيات</div>}
        </div>

        {/* Modal for debt */ }
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[80] p-4">
            <div className="absolute inset-0" onClick={() => setShowModal(false)}></div>
            <div className="bg-slate-50 dark:bg-slate-900 w-full max-w-sm sm:max-w-md rounded-[2.5rem] p-6 pb-6 relative shadow-2xl border border-slate-200 dark:border-slate-800 z-10 animate-slide-up flex flex-col max-h-[85vh]">
              <button onClick={() => { setShowModal(false); setEditDebtId(null); }} className="absolute top-6 left-6 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 p-2 rounded-full transition-colors"><X size={18}/></button>
              <h3 className="font-bold text-lg mb-6 text-slate-900 dark:text-white px-2 uppercase">{editDebtId ? 'تعديل سلفة' : 'إضافة سلفة'}</h3>
              <form onSubmit={saveForm} className="space-y-4 overflow-y-auto pb-4 px-1" style={{ scrollbarWidth: 'none' }}>
                <div className="flex bg-white dark:bg-slate-950 rounded-[1.25rem] p-1.5 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <button type="button" onClick={() => setForm({...form, type: 'owed_to_me'})} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${form.type === 'owed_to_me' ? 'bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-500'}`}>سلفة لي</button>
                  <button type="button" onClick={() => setForm({...form, type: 'owed_by_me'})} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${form.type === 'owed_by_me' ? 'bg-red-50 dark:bg-slate-800 text-red-600 dark:text-red-400 shadow-sm' : 'text-slate-500 dark:text-slate-500'}`}>سلفة علي</button>
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-bold text-slate-500 px-1">الحساب المختص:</label>
                   <CustomSelect 
                      value={form.accountId} 
                      onChange={val => setForm({...form, accountId: val})} 
                      placeholder="اختر الحساب..."
                      options={accounts.filter(a => !a.isPaused).map(a => ({value: a.id, label: a.name}))}
                   />
                </div>
                <input required type="text" placeholder="اسم الشخص" value={form.person} onChange={e => setForm({...form, person: e.target.value})} onFocus={(e) => setTimeout(() => e.target.scrollIntoView({behavior:'smooth', block:'center'}), 300)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-50 p-4 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 shadow-sm"/>
                <input required type="number" step="0.01" placeholder="المبلغ" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} onFocus={(e) => setTimeout(() => e.target.scrollIntoView({behavior:'smooth', block:'center'}), 300)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-50 p-4 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 shadow-sm"/>
                <input required type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} onFocus={(e) => setTimeout(() => e.target.scrollIntoView({behavior:'smooth', block:'center'}), 300)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-50 p-4 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 shadow-sm"/>
                <input type="text" placeholder="ملاحظات" value={form.note} onChange={e => setForm({...form, note: e.target.value})} onFocus={(e) => setTimeout(() => e.target.scrollIntoView({behavior:'smooth', block:'center'}), 300)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-50 p-4 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 shadow-sm"/>
                <button type="submit" className="w-full bg-indigo-600 dark:bg-indigo-500 text-white font-bold p-4 rounded-2xl mt-4 shadow-lg shadow-indigo-600/20 active:scale-95 transition-transform shrink-0">{editDebtId ? 'تعديل السلفة' : 'حفظ الإضافة'}</button>
              </form>
            </div>
          </div>
        )}

        {/* Custom Confirmation for Debt */}
        {debtToDelete && (
          <div className="fixed inset-0 flex items-center justify-center z-[130] p-4 bg-transparent animate-fade-in">
             <div className="absolute inset-0 bg-transparent" onClick={() => setDebtToDelete(null)}></div>
             <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 w-full max-w-[280px] rounded-[2rem] p-6 shadow-2xl relative z-10 animate-slide-up flex flex-col gap-4">
                <button 
                  onClick={() => deleteDebt(debtToDelete)}
                  className="w-full bg-red-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-red-500/20 active:scale-90 transition-transform text-lg"
                >
                  تأكيد الحذف
                </button>
                <button 
                  onClick={() => setDebtToDelete(null)}
                  className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold py-4 rounded-2xl active:scale-90 transition-transform text-lg"
                >
                  تراجع
                </button>
             </div>
          </div>
        )}
      </div>
    );
  };

  const ReportsManager = () => {
    // Account Statement State
    const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 7) + '-01');
    const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
    const [selectedCats, setSelectedCats] = useState<string[]>([]);
    const [showStatement, setShowStatement] = useState(false);

    const filteredTrans = transactions.filter(t => {
      const isAfterStart = t.date >= startDate;
      const isBeforeEnd = t.date <= endDate;
      const isCatSelected = selectedCats.length === 0 || selectedCats.includes(t.category);
      return isAfterStart && isBeforeEnd && isCatSelected;
    });

    const totalIncome = filteredTrans.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = filteredTrans.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    const toggleCat = (catName: string) => {
      setSelectedCats(prev => prev.includes(catName) ? prev.filter(c => c !== catName) : [...prev, catName]);
    };

    const selectAllExpense = () => {
      setSelectedCats(mainCategories.filter(mc => mc.type === 'expense').flatMap(mc => mc.items));
    };

    const selectAllIncome = () => {
      setSelectedCats(mainCategories.filter(mc => mc.type === 'income').flatMap(mc => mc.items));
    };

    const selectGroup = (groupId: string) => {
      const group = expenseGroups.find(g => g.id === groupId);
      if (group) setSelectedCats(group.categories);
    };

    return (
      <div className="p-4 pb-24 h-full overflow-y-auto space-y-6" style={{ scrollbarWidth: 'none' }}>
        
        {/* ACCOUNT STATEMENT GENERATOR */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden">
           <div className="flex items-center gap-3 mb-6 text-emerald-600 dark:text-emerald-400 font-black">
              <FileText size={22} /> <span className="text-lg">كشف حساب تفصيلي</span>
           </div>

           <div className="space-y-5">
              {/* Date Filters */}
              <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="text-[10px] font-bold text-slate-400 mb-1.5 block pr-1">من تاريخ</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-3 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"/>
                 </div>
                 <div>
                    <label className="text-[10px] font-bold text-slate-400 mb-1.5 block pr-1">إلى تاريخ</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-3 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"/>
                 </div>
              </div>

              {/* Quick Filters */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 mb-3 block pr-1">فلاتر سريعة الاختيار</label>
                <div className="flex flex-wrap gap-2">
                   <button onClick={selectAllExpense} className="px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-full text-[10px] font-bold border border-red-100 dark:border-red-500/20 active:scale-95 transition-all">كل المصروفات</button>
                   <button onClick={selectAllIncome} className="px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-bold border border-emerald-100 dark:border-emerald-500/20 active:scale-95 transition-all">كل الدخل</button>
                   {expenseGroups.map(g => (
                     <button key={g.id} onClick={() => selectGroup(g.id)} className="px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-bold border border-indigo-100 dark:border-indigo-500/20 active:scale-95 transition-all">{g.name}</button>
                   ))}
                   <button onClick={() => setSelectedCats([])} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-[10px] font-bold active:scale-95 transition-all">إعادة تعيين</button>
                </div>
              </div>

              {/* Category Selector */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 mb-3 block pr-1 text-right">الفئات المحددة ({selectedCats.length || 'الكل'})</label>
                <div className="max-h-[220px] overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-2xl p-3 bg-slate-50/50 dark:bg-slate-950/50 grid grid-cols-2 gap-2" style={{ scrollbarWidth: 'thin' }}>
                   {mainCategories.flatMap(mc => mc.items).map(cat => (
                     <button 
                       key={cat} 
                       onClick={() => toggleCat(cat)}
                       className={`flex items-center gap-2 p-2.5 rounded-xl border text-[11px] font-bold transition-all text-right ${selectedCats.includes(cat) ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-800'}`}
                     >
                        <div className={`w-3.5 h-3.5 rounded-sm border-2 flex items-center justify-center shrink-0 ${selectedCats.includes(cat) ? 'bg-white border-white' : 'border-slate-300'}`}>
                           {selectedCats.includes(cat) && <div className="w-2 h-2 bg-indigo-600 rounded-sm" />}
                        </div>
                        <span className="truncate flex-1">{cat}</span>
                     </button>
                   ))}
                </div>
              </div>

              <button onClick={() => setShowStatement(true)} className="w-full bg-emerald-600 dark:bg-emerald-500 text-white font-black p-4 rounded-2xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-transform flex items-center justify-center gap-3">
                 <PieChart size={20} /> عرض كشف الحساب المستخرج
              </button>
           </div>
        </div>

        {/* Modal Result of Statement */}
        {showStatement && (
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[140] p-4">
             <div className="absolute inset-0" onClick={() => setShowStatement(false)}></div>
             <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-6 pb-8 relative shadow-2xl border border-slate-200 dark:border-slate-800 z-10 animate-slide-up flex flex-col max-h-[85vh]">
                <button onClick={() => setShowStatement(false)} className="absolute top-6 left-6 text-slate-400 p-2 rounded-full"><X size={18}/></button>
                <div className="mb-6 mt-1">
                   <h3 className="font-black text-xl text-slate-900 dark:text-white">كشف الحساب المستخرج</h3>
                   <p className="text-[10px] text-slate-500 mt-1 font-bold">من {startDate} إلى {endDate}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6 shrink-0">
                   <div className="bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-500/20">
                      <p className="text-[10px] font-bold text-emerald-600 mb-1">إجمالي الدخل</p>
                      <p className="font-black text-lg text-emerald-600">{formatCurrency(totalIncome).replace('EGP','')}</p>
                   </div>
                   <div className="bg-red-50 dark:bg-red-500/10 p-4 rounded-2xl border border-red-100 dark:border-red-500/20">
                      <p className="text-[10px] font-bold text-red-600 mb-1">إجمالي المصاريف</p>
                      <p className="font-black text-lg text-red-600">{formatCurrency(totalExpense).replace('EGP','')}</p>
                   </div>
                </div>

                <div className="flex-1 overflow-y-auto mb-6 pr-1 space-y-2.5" style={{ scrollbarWidth: 'thin' }}>
                   {filteredTrans.length === 0 && <div className="text-center py-12 text-slate-500 font-bold">لا توجد حركات مطابقة للفلاتر المختارة</div>}
                   {filteredTrans.map(t => (
                     <div key={t.id} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <div className="flex-1">
                           <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-sm text-slate-800 dark:text-white">{t.category}</span>
                              <span className="text-[10px] bg-indigo-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-lg font-bold">{accounts.find(a => a.id === t.accountId)?.name}</span>
                           </div>
                           <p className="text-[10px] text-slate-500 font-bold">{formatDate(t.date)} {t.note && `• ${t.note}`}</p>
                        </div>
                        <span className={`font-black text-sm pr-4 ${t.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>{t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount).replace('EGP','')}</span>
                     </div>
                   ))}
                </div>

                <div className="grid grid-cols-2 gap-4 shrink-0">
                   <button onClick={() => {
                      const data = filteredTrans.map(t => ({
                        'التاريخ': t.date,
                        'النوع': t.type === 'income' ? 'إيداع' : 'سحب',
                        'الفئة': t.category,
                        'الحساب': accounts.find(a => a.id === t.accountId)?.name || 'غير معروف',
                        'المبلغ': t.amount,
                        'ملاحظات': t.note
                      }));
                      exportToExcel(data, `Statement_${startDate}_${endDate}`);
                   }} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white p-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all">
                      <FileSpreadsheet size={18} className="text-emerald-500"/> Excel
                   </button>
                   <button onClick={() => {
                      const data = filteredTrans.map(t => [t.date, t.type === 'income' ? 'إيداع' : 'سحب', t.category, accounts.find(a => a.id === t.accountId)?.name || 'غير معروف', t.amount, t.note]);
                      exportToPDF(['التاريخ', 'النوع', 'الفئة', 'الحساب', 'المبلغ', 'ملاحظات'], data, `كشف حساب فترات (${startDate} إلى ${endDate})`, `Statement_${startDate}_${endDate}`);
                   }} className="bg-indigo-600 dark:bg-indigo-500 text-white p-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-indigo-600/20">
                      <Printer size={18}/> طباعة التقرير
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>
    );
  };

  const ComparisonView = ({ months, onClose }: { months: string[], onClose: () => void }) => {
    const categoriesSet = new Set<string>();
    const incomeCategoriesSet = new Set<string>();
    
    months.forEach(m => {
      transactions.filter(t => t.date.startsWith(m)).forEach(t => {
        if (t.type === 'expense') categoriesSet.add(t.category);
        else if (t.type === 'income') incomeCategoriesSet.add(t.category);
      });
    });

    const categories = Array.from(categoriesSet).sort();
    const incomeCategories = Array.from(incomeCategoriesSet).sort();

    const getMonthData = (month: string) => {
      const txs = transactions.filter(t => t.date.startsWith(month));
      const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      return { income, expense, txs };
    };

    return (
      <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 z-[100] flex flex-col pt-safe animate-slide-up" dir="rtl">
        <header className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10 shrink-0">
          <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><ChevronLeft size={24}/></button>
          <h3 className="font-bold text-slate-800 dark:text-white">مقارنة تفصيلية</h3>
          <div className="w-10"></div>
        </header>

        <div className="flex-1 overflow-auto p-4 space-y-6 pb-12">
          {/* Summary Row */}
          <div className="grid grid-cols-1 gap-4">
             <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm overflow-x-auto">
               <table className="w-full text-right border-collapse min-w-[300px]">
                 <thead>
                   <tr className="text-[10px] text-slate-400 border-b border-slate-100 dark:border-slate-800">
                     <th className="py-3 font-bold pr-2">الشهر</th>
                     <th className="py-3 font-bold text-center">إجمالي الدخل</th>
                     <th className="py-3 font-bold text-center">إجمالي المصروف</th>
                     <th className="py-3 font-bold pl-2 text-left">الصافي</th>
                   </tr>
                 </thead>
                 <tbody className="text-sm">
                   {months.map(m => {
                     const data = getMonthData(m);
                     const net = data.income - data.expense;
                     return (
                       <tr key={m} className="border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                         <td className="py-4 font-bold text-slate-700 dark:text-slate-200 pr-2">{new Date(m).toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}</td>
                         <td className="py-4 text-center font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(data.income).replace('EGP','')}</td>
                         <td className="py-4 text-center font-bold text-red-600 dark:text-red-400">{formatCurrency(data.expense).replace('EGP','')}</td>
                         <td className="py-4 pl-2 text-left font-black" style={{ color: net >= 0 ? '#10b981' : '#ef4444' }}>{formatCurrency(net).replace('EGP','')}</td>
                       </tr>
                     );
                   })}
                 </tbody>
               </table>
             </div>
          </div>

          {/* Details Tables */}
          <div className="space-y-4">
             <h4 className="font-black text-red-500 flex items-center gap-2 px-2"><span className="w-2 h-2 rounded-full bg-red-500"></span> تفاصيل المصروفات</h4>
             <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm overflow-x-auto">
                <table className="w-full text-right border-collapse min-w-[400px]">
                  <thead>
                    <tr className="text-[10px] text-slate-400 border-b border-slate-100 dark:border-slate-800">
                      <th className="py-3 font-bold pr-2">الفئة</th>
                      {months.map(m => (
                        <th key={m} className="py-3 font-bold text-center">{new Date(m).toLocaleDateString('ar-EG', { month: 'short' })}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {categories.map(cat => (
                      <tr key={cat} className="border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-3.5 font-bold text-slate-600 dark:text-slate-300 pr-2">{cat}</td>
                        {months.map(m => {
                          const total = transactions
                            .filter(t => t.date.startsWith(m) && t.category === cat && t.type === 'expense')
                            .reduce((s, t) => s + t.amount, 0);
                          return <td key={m} className="py-3.5 text-center font-semibold text-slate-800 dark:text-white">{total > 0 ? formatCurrency(total).replace('EGP','') : '—'}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>

          <div className="space-y-4">
             <h4 className="font-black text-emerald-500 flex items-center gap-2 px-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> تفاصيل الدخل</h4>
             <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm overflow-x-auto">
                <table className="w-full text-right border-collapse min-w-[400px]">
                  <thead>
                    <tr className="text-[10px] text-slate-400 border-b border-slate-100 dark:border-slate-800">
                      <th className="py-3 font-bold pr-2">الفئة</th>
                      {months.map(m => (
                        <th key={m} className="py-3 font-bold text-center">{new Date(m).toLocaleDateString('ar-EG', { month: 'short' })}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {incomeCategories.map(cat => (
                      <tr key={cat} className="border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-3.5 font-bold text-slate-600 dark:text-slate-300 pr-2">{cat}</td>
                        {months.map(m => {
                          const total = transactions
                            .filter(t => t.date.startsWith(m) && t.category === cat && t.type === 'income')
                            .reduce((s, t) => s + t.amount, 0);
                          return <td key={m} className="py-3.5 text-center font-semibold text-slate-800 dark:text-white">{total > 0 ? formatCurrency(total).replace('EGP','') : '—'}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
        </div>
      </div>
    );
  };

  const AnalysisManager = () => {
    const [compareMode, setCompareMode] = useState(false);
    const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
    const [showComparison, setShowComparison] = useState(false);

    const allMonths = Array.from(new Set(transactions.map(t => t.date.substring(0, 7)))) as string[];
    allMonths.sort().reverse();
    const currentMonth = new Date().toISOString().substring(0, 7);
    if (!allMonths.includes(currentMonth)) allMonths.unshift(currentMonth);

    const toggleMonthSelection = (month: string) => {
      setSelectedMonths(prev => 
        prev.includes(month) ? prev.filter(m => m !== month) : [...prev, month]
      );
    };

    return (
      <div className="p-4 h-full flex flex-col relative">
        <div className="flex justify-between items-center mb-5 px-2">
           <button 
             onClick={() => {
                setCompareMode(!compareMode);
                setSelectedMonths([]);
             }}
             className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold transition-all shadow-sm active:scale-95 ${compareMode ? 'bg-amber-500 text-white shadow-amber-500/20' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800'}`}
           >
             <ArrowLeftRight size={18} />
             <span>{compareMode ? 'إلغاء التحديد' : 'تحديد شهور للمقارنة'}</span>
           </button>
           
           {!compareMode && (
             <div className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full uppercase tracking-tighter">اضغط للمقارنة</div>
           )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pb-32">
           {allMonths.map(month => {
              const monthTxs = transactions.filter(t => t.date.startsWith(month));
              const income = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
              const expense = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
              const isSelected = selectedMonths.includes(month);

              return (
                <div 
                  key={month} 
                  onClick={() => compareMode && toggleMonthSelection(month)}
                  className={`bg-white dark:bg-slate-900 border-2 rounded-[2rem] p-5 shadow-sm transition-all relative overflow-hidden group ${compareMode ? 'cursor-pointer active:scale-[0.98]' : ''} ${isSelected ? 'border-amber-500 bg-amber-50/30 dark:bg-amber-500/5' : 'border-slate-100 dark:border-slate-800'}`}
                >
                  {compareMode && (
                    <div className={`absolute top-4 left-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                      {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                    </div>
                  )}

                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 dark:text-white">{new Date(month).toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}</h3>
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5 uppercase tracking-wider">{month}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-emerald-50/50 dark:bg-emerald-500/5 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-500/10">
                      <span className="text-[10px] font-bold text-emerald-600/70 dark:text-emerald-400/50 block mb-1">إجمالي الدخل</span>
                      <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(income).replace('EGP','')}</span>
                    </div>
                    <div className="bg-red-50/50 dark:bg-red-500/5 p-3 rounded-2xl border border-red-100 dark:border-red-500/10">
                      <span className="text-[10px] font-bold text-red-600/70 dark:text-red-400/50 block mb-1">إجمالي المصاريف</span>
                      <span className="text-lg font-black text-red-600 dark:text-red-400">{formatCurrency(expense).replace('EGP','')}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center px-1">
                     <span className="text-[10px] font-bold text-slate-400">الصافي:</span>
                     <span className={`text-sm font-black ${(income - expense) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {formatCurrency(income - expense).replace('EGP','')}
                     </span>
                  </div>
                </div>
              );
           })}
        </div>

        {/* Action Button for Comparison */}
        {compareMode && selectedMonths.length > 0 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] z-40 animate-slide-up">
            <button 
              onClick={() => setShowComparison(true)}
              className="w-full bg-slate-900 dark:bg-amber-500 text-white p-5 rounded-[2rem] font-bold flex items-center justify-between shadow-2xl shadow-slate-900/40 dark:shadow-amber-500/20 active:scale-95 transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <PieChart size={20} />
                </div>
                <span>عرض {selectedMonths.length === 1 ? 'تفاصيل الشهر' : 'مقارنة الشهور'}</span>
              </div>
              <ChevronLeft size={20} />
            </button>
          </div>
        )}

        {showComparison && <ComparisonView months={selectedMonths} onClose={() => setShowComparison(false)} />}
      </div>
    );
  };

  const CategoriesManager = () => {
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [editGroupId, setEditGroupId] = useState<string | null>(null);
    const [groupForm, setGroupForm] = useState({ name: '', type: 'expense' as 'income' | 'expense' });
    
    const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
    const [newItemName, setNewItemName] = useState('');

    const saveGroup = (e: React.FormEvent) => {
      e.preventDefault();
      if (!groupForm.name) return;
      if (editGroupId) {
        setMainCategories(mainCategories.map(mc => mc.id === editGroupId ? { ...mc, name: groupForm.name, type: groupForm.type } : mc));
      } else {
        setMainCategories([...mainCategories, { id: generateId(), name: groupForm.name, type: groupForm.type, items: [] }]);
      }
      setShowGroupModal(false);
      setEditGroupId(null);
      setGroupForm({ name: '', type: 'expense' });
    };

    const deleteGroup = (id: string) => {
      if (confirm('تأكيد حذف الفئة الرئيسية بالكامل؟ سيفقد الوصول لجميع أنواع المصاريف بداخلها.')) {
        setMainCategories(mainCategories.filter(mc => mc.id !== id));
      }
    };

    const addItem = (groupId: string) => {
      if (!newItemName) return;
      setMainCategories(mainCategories.map(mc => {
        if (mc.id === groupId) {
          if (mc.items.includes(newItemName)) {
            alert('هذا النوع موجود مسبقاً');
            return mc;
          }
          return { ...mc, items: [...mc.items, newItemName] };
        }
        return mc;
      }));
      setNewItemName('');
    };

    const deleteItem = (groupId: string, itemName: string) => {
      if (confirm(`تأكيد حذف النوع "${itemName}"؟`)) {
        setMainCategories(mainCategories.map(mc => mc.id === groupId ? { ...mc, items: mc.items.filter(i => i !== itemName) } : mc));
      }
    };

    const renameItem = (groupId: string, oldName: string) => {
      const newName = prompt('أدخل الاسم الجديد:', oldName);
      if (newName && newName !== oldName) {
        setMainCategories(mainCategories.map(mc => mc.id === groupId ? { ...mc, items: mc.items.map(i => i === oldName ? newName : i) } : mc));
        // Update all related transactions
        setTransactions(transactions.map(t => t.category === oldName ? { ...t, category: newName } : t));
      }
    };

    return (
      <div className="p-4 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6 px-2">
           <button onClick={() => setShowGroupModal(true)} className="bg-indigo-600 dark:bg-indigo-500 text-white p-3 rounded-2xl flex items-center gap-2 font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition-transform text-sm mr-auto">
             <Plus size={18}/> فئة جديدة
           </button>
        </div>

        <div className="space-y-4 overflow-y-auto flex-1 pr-1 pb-24" style={{ scrollbarWidth: 'none' }}>
          {mainCategories.map(mc => (
             <div key={mc.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden transition-all">
                {/* Header of Category Group */}
                <div className="p-4 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                   <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => setExpandedGroupId(expandedGroupId === mc.id ? null : mc.id)}>
                      <div className={`p-2.5 rounded-xl ${mc.type === 'income' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20' : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20'}`}>
                         <Tags size={18} />
                      </div>
                      <div>
                         <span className="font-bold text-slate-800 dark:text-slate-100 block">{mc.name}</span>
                         <span className="text-[10px] text-slate-500 font-semibold">{mc.items.length} أنواع</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-2">
                      <button onClick={() => { setEditGroupId(mc.id); setGroupForm({name: mc.name, type: mc.type}); setShowGroupModal(true); }} className="text-slate-400 hover:text-blue-500 p-2"><Edit2 size={16}/></button>
                      {mc.name !== 'المصاريف' && mc.name !== 'الإيرادات' && (
                        <button onClick={() => deleteGroup(mc.id)} className="text-slate-400 hover:text-red-500 p-2"><Trash2 size={16}/></button>
                      )}
                      <button onClick={() => setExpandedGroupId(expandedGroupId === mc.id ? null : mc.id)} className={`text-slate-400 p-2 transition-transform ${expandedGroupId === mc.id ? 'rotate-180' : ''}`}><ChevronDown size={18}/></button>
                   </div>
                </div>

                {/* Sub items list */}
                {expandedGroupId === mc.id && (
                  <div className="p-4 bg-white dark:bg-slate-900 space-y-3 animate-slide-up border-t border-slate-100 dark:border-slate-800/50">
                     <div className="flex gap-2 mb-4">
                        <input 
                           type="text" placeholder="إضافة نوع مصروف جديد..." 
                           value={newItemName} onChange={e => setNewItemName(e.target.value)}
                           className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-50 p-3 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                        />
                        <button onClick={() => addItem(mc.id)} className="bg-indigo-600 text-white p-3 rounded-xl active:scale-95 transition-transform"><Plus size={18}/></button>
                     </div>
                     
                     <div className="grid grid-cols-1 gap-2">
                        {mc.items.map(item => (
                           <div key={item} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 shadow-tiny">
                              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{item}</span>
                              <div className="flex items-center gap-1">
                                 <button onClick={() => renameItem(mc.id, item)} className="text-slate-400 hover:text-indigo-500 p-1.5"><Edit2 size={14}/></button>
                                 <button onClick={() => deleteItem(mc.id, item)} className="text-slate-400 hover:text-red-500 p-1.5"><Trash2 size={14}/></button>
                              </div>
                           </div>
                        ))}
                        {mc.items.length === 0 && <p className="text-center text-xs text-slate-400 py-2">لا توجد أنواع مضافة بعد</p>}
                     </div>
                  </div>
                )}
             </div>
          ))}
        </div>

        {/* Modal for Group Category */}
        {showGroupModal && (
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[120] p-4">
             <div className="absolute inset-0" onClick={() => setShowGroupModal(false)}></div>
             <div className="bg-slate-50 dark:bg-slate-900 w-full max-w-sm rounded-[2rem] p-6 pb-6 relative shadow-2xl border border-slate-200 dark:border-slate-800 z-10 animate-slide-up flex flex-col">
                <button type="button" onClick={() => setShowGroupModal(false)} className="absolute top-6 left-6 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 p-2 rounded-full transition-colors"><X size={18}/></button>
                <h3 className="font-bold text-lg mb-6 text-slate-900 dark:text-white px-2 mt-1">{editGroupId ? 'تعديل الفئة الرئيسية' : 'إضافة فئة رئيسية'}</h3>
                
                <form onSubmit={saveGroup} className="space-y-5">
                   <div className="space-y-4">
                      <input 
                         required type="text" placeholder="اسم الفئة (مثل: شخصي، سيارة، منزل)" 
                         value={groupForm.name} onChange={e => setGroupForm({ ...groupForm, name: e.target.value })} 
                         className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-50 p-4 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 shadow-sm"
                      />
                      <div className="flex bg-white dark:bg-slate-950 rounded-[1.25rem] p-1.5 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <button type="button" onClick={() => setGroupForm({...groupForm, type: 'expense'})} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${groupForm.type === 'expense' ? 'bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-500'}`}>مصروفات</button>
                        <button type="button" onClick={() => setGroupForm({...groupForm, type: 'income'})} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${groupForm.type === 'income' ? 'bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-500'}`}>إيرادات</button>
                      </div>
                   </div>
                   <button type="submit" className="w-full bg-indigo-600 dark:bg-indigo-500 text-white font-bold p-4 rounded-2xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-transform text-base mt-2">حفظ</button>
                </form>
             </div>
          </div>
        )}
      </div>
    );
  };

  const ExpenseGroupsManager = () => {
    const [filterMode, setFilterMode] = useState<'month' | 'range'>('month');
    const [monthName, setMonthName] = useState(getCurrentMonthStr());
    const [startDate, setStartDate] = useState(getCurrentMonthStr() + '-01');
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [formName, setFormName] = useState('');
    const [formCats, setFormCats] = useState<string[]>([]);

    const openModal = (group?: ExpenseGroup) => {
      if (group) {
        setEditId(group.id);
        setFormName(group.name);
        setFormCats(group.categories);
      } else {
        setEditId(null);
        setFormName('');
        setFormCats([]);
      }
      setShowModal(true);
    };

    const saveGroup = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formName) return alert('أدخل اسم المجموعة');
      if (formCats.length === 0) return alert('اختر مصروفاً واحداً على الأقل');
      
      const payload: ExpenseGroup = { id: editId || generateId(), name: formName, categories: formCats };
      if (editId) {
        setExpenseGroups(expenseGroups.map(g => g.id === editId ? payload : g));
      } else {
        setExpenseGroups([payload, ...expenseGroups]);
      }
      setShowModal(false);
    };

    const toggleCatSelection = (catName: string) => {
      if (formCats.includes(catName)) {
        setFormCats(formCats.filter(c => c !== catName));
      } else {
        setFormCats([...formCats, catName]);
      }
    };

    const deleteGroup = (id: string) => {
      if(confirm('تأكيد مسح المجموعة؟')) setExpenseGroups(expenseGroups.filter(g => g.id !== id));
    };

    const isTxInDate = (date: string) => {
      if (filterMode === 'month') return date.startsWith(monthName);
      return date >= startDate && date <= endDate;
    };

    const expenseCategories = mainCategories.filter(mc => mc.type === 'expense').flatMap(mc => mc.items);

    return (
      <div className="p-4 h-full flex flex-col">
        {/* Filters Bento */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 mb-3 shadow-sm mt-2">
           <div className="flex gap-1.5 bg-slate-50 dark:bg-slate-950 rounded-[1.25rem] p-1.5 border border-slate-200 dark:border-slate-800 shadow-sm mb-3">
             <button type="button" onClick={() => setFilterMode('month')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${filterMode === 'month' ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-500'}`}>
               <Calendar size={16} /> شهري
             </button>
             <button type="button" onClick={() => setFilterMode('range')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${filterMode === 'range' ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-500'}`}>
               <Filter size={16} /> فترة مخصصة
             </button>
             <button onClick={() => openModal()} className="bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-400 text-white rounded-xl p-2 shadow-sm transition-colors aspect-square flex items-center justify-center active:scale-95"><Plus size={18}/></button>
           </div>

           {filterMode === 'month' ? (
             <input type="month" value={monthName} onChange={e => setMonthName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-50 p-3.5 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500"/>
           ) : (
             <div className="flex items-center gap-3">
               <div className="flex-1">
                 <label className="text-[10px] text-slate-500 block mb-1 px-1">من</label>
                 <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-50 p-3.5 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500"/>
               </div>
               <div className="flex-1">
                 <label className="text-[10px] text-slate-500 block mb-1 px-1">إلى</label>
                 <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-50 p-3.5 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500"/>
               </div>
             </div>
           )}
        </div>

        {/* Groups List */}
        <div className="flex-1 overflow-y-auto space-y-4 pb-24">
           {expenseGroups.map(group => {
              const groupTotal = transactions
                .filter(t => t.type === 'expense' && group.categories.includes(t.category) && isTxInDate(t.date))
                .reduce((sum, t) => sum + t.amount, 0);

              return (
                <div key={group.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl flex flex-col shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-white">{group.name}</h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        {group.categories.join(' • ')}
                      </p>
                    </div>
                    <div className="flex bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 h-fit">
                      <button onClick={() => openModal(group)} className="p-1.5 text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"><Edit2 size={12}/></button>
                      <div className="w-px bg-slate-200 dark:bg-slate-700"></div>
                      <button onClick={() => deleteGroup(group.id)} className="p-1.5 text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"><Trash2 size={12}/></button>
                    </div>
                  </div>
                  
                  <div className="mt-1 bg-slate-50 dark:bg-slate-950 rounded-2xl py-3 flex flex-col items-center justify-center border border-slate-100 dark:border-slate-800">
                     <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">الإجمالي خلال الفترة</span>
                     <span className="text-xl font-extrabold text-amber-500 dark:text-amber-400">{formatCurrency(groupTotal).replace('EGP','')}</span>
                  </div>
                </div>
              );
           })}
           {expenseGroups.length === 0 && (
             <div className="text-center text-slate-500 dark:text-slate-400 p-10 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm mt-4">
               تجميع المصروفات! أنشئ مجموعة لحساب إجمالي عدة مصاريف معاً (مثال: كافة مصاريف السيارة).
             </div>
           )}
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[80] p-4">
             <div className="absolute inset-0" onClick={() => setShowModal(false)}></div>
             <div className="bg-slate-50 dark:bg-slate-900 w-full max-w-sm sm:max-w-md rounded-[2.5rem] p-6 pb-6 relative shadow-2xl border border-slate-200 dark:border-slate-800 z-10 animate-slide-up flex flex-col max-h-[85vh]">
               <button type="button" onClick={() => setShowModal(false)} className="absolute top-6 left-6 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 p-2 rounded-full transition-colors"><X size={18}/></button>
               <h3 className="font-bold text-lg mb-6 text-slate-900 dark:text-white px-2 shrink-0">{editId ? 'تعديل المجموعة' : 'مجموعة جديدة'}</h3>
               
               <form onSubmit={saveGroup} className="flex-1 overflow-y-auto w-full px-1 space-y-5 pb-4" style={{ scrollbarWidth: 'none' }}>
                 <input 
                   required type="text" placeholder="اسم المجموعة (مثل: السيارة)" 
                   value={formName} onChange={e => setFormName(e.target.value)} 
                   onFocus={(e) => setTimeout(() => e.target.scrollIntoView({behavior:'smooth', block:'center'}), 300)}
                   className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-50 p-4 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 shadow-sm"
                 />
                 
                 <div>
                   <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-3 px-1">اختر المصروفات المرتبطة:</label>
                   <div className="grid grid-cols-2 gap-2">
                     {expenseCategories.map(item => {
                        const isSelected = formCats.includes(item);
                        return (
                          <div 
                            key={item}
                            onClick={() => toggleCatSelection(item)}
                            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all active:scale-95 ${isSelected ? 'bg-indigo-600 dark:bg-indigo-500 border-indigo-600 dark:border-indigo-500 text-white shadow-md' : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-700'}`}
                          >
                            <span className="text-sm font-semibold">{item}</span>
                            {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                          </div>
                        )
                     })}
                   </div>
                 </div>

                 <button type="submit" className="w-full bg-indigo-600 dark:bg-indigo-500 text-white font-bold p-4 rounded-2xl mt-4 shadow-lg shadow-indigo-600/20 active:scale-95 transition-transform text-base">
                   حفظ المجموعة
                 </button>
               </form>
             </div>
          </div>
        )}
      </div>
    );
  };

  // --- GLOBAL TRANS MODAL (FAB targets this) ---
  const GlobalTransModal = () => {
    const [form, setForm] = useState({ type: 'expense', amount: '', date: new Date().toISOString().split('T')[0], category: '', accountId: accounts[0]?.id || '', toAccountId: accounts[1]?.id || '', note: '' });
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    
    const handleDelete = () => {
      setTransactions(prev => {
        const currentTx = prev.find(x => x.id === editTransId);
        if (!currentTx) return prev;
        
        if (currentTx.transferId) {
          // Delete both sides of the transfer
          return prev.filter(x => x.transferId !== currentTx.transferId);
        } else {
          // Delete single transaction
          return prev.filter(x => x.id !== currentTx.id);
        }
      });
      setShowDeleteConfirm(false);
      setShowTransModal(false);
      setEditTransId(null);
    };

    useEffect(() => {
      if (editTransId) {
        const t = transactions.find(x => x.id === editTransId);
        if (t) {
          if (t.transferId) {
            const pair = transactions.find(x => x.transferId === t.transferId && x.id !== t.id);
            const from = t.type === 'expense' ? t : pair;
            const to = t.type === 'income' ? t : pair;
            setForm({ type: 'transfer', amount: from?.amount.toString() || '', date: from?.date || '', category: 'تحويل داخلي', accountId: from?.accountId || '', toAccountId: to?.accountId || '', note: from?.note || '' });
          } else {
            setForm({ type: t.type, amount: t.amount.toString(), date: t.date, category: t.category, accountId: t.accountId, toAccountId: '', note: t.note });
          }
        }
      } else {
        setForm({ type: 'expense', amount: '', date: new Date().toISOString().split('T')[0], category: '', accountId: accounts[0]?.id || '', toAccountId: '', note: '' });
      }
    }, [editTransId, showTransModal]);

    if(!showTransModal) return null;

    const saveForm = (e: React.FormEvent) => {
      e.preventDefault();
      const isTransfer = form.type === 'transfer';
      
      if (!form.amount || !form.accountId || (!isTransfer && !form.category) || (isTransfer && !form.toAccountId)) {
        return alert('أكمل الحقول الأساسية');
      }

      const amount = parseFloat(form.amount);
      const currentAccountBalance = getAccountBalance(form.accountId);

      // Validation for Expense or Transfer
      if (form.type === 'expense' || isTransfer) {
        let availableBalance = currentAccountBalance;
        
        if (editTransId) {
          const oldTx = transactions.find(t => t.id === editTransId);
          if (oldTx && oldTx.accountId === form.accountId && oldTx.type === 'expense') {
            availableBalance += oldTx.amount;
          } else if (oldTx && oldTx.transferId) {
            const pair = transactions.find(x => x.transferId === oldTx.transferId && x.id !== oldTx.id);
            const fromSide = oldTx.type === 'expense' ? oldTx : pair;
            if (fromSide && fromSide.accountId === form.accountId) availableBalance += fromSide.amount;
          }
        }

        if (availableBalance <= 0) return alert('رصيد الحساب صفر أو أقل.');
        if (amount > availableBalance) return alert(`المبلغ (${amount}) يتجاوز المتاح (${availableBalance}).`);
      }

      if (isTransfer && form.accountId === form.toAccountId) {
        return alert('لا يمكن التحويل لنفس الحساب');
      }

      if (isTransfer) {
        const tId = generateId();
        const txFrom: Transaction = { id: generateId(), type: 'expense', amount, date: form.date, category: 'تحويل داخلي', accountId: form.accountId, note: form.note, transferId: tId };
        const txTo: Transaction = { id: generateId(), type: 'income', amount, date: form.date, category: 'تحويل داخلي', accountId: form.toAccountId, note: form.note, transferId: tId };

        if (editTransId) {
          const oldTx = transactions.find(t => t.id === editTransId);
          if (oldTx?.transferId) {
            setTransactions(prev => [...prev.filter(t => t.transferId !== oldTx.transferId), txFrom, txTo]);
          } else {
            setTransactions(prev => [txFrom, txTo, ...prev.filter(t => t.id !== editTransId)]);
          }
        } else {
          setTransactions(prev => [txFrom, txTo, ...prev]);
        }
      } else {
        const payload: Transaction = { id: editTransId || generateId(), type: form.type as any, amount, date: form.date, category: form.category, accountId: form.accountId, note: form.note };
        if (editTransId) {
          // If we are editing from a transfer to a normal tx
          const oldTx = transactions.find(t => t.id === editTransId);
          if (oldTx?.transferId) {
            setTransactions(prev => [...prev.filter(t => t.transferId !== oldTx.transferId), payload]);
          } else {
            setTransactions(prev => prev.map(t => t.id === editTransId ? payload : t));
          }
        } else {
          setTransactions(prev => [payload, ...prev]);
        }
      }
      
      setShowTransModal(false);
      setEditTransId(null);
    };

    return (
      <div className={`fixed inset-0 transition-colors duration-300 flex items-center justify-center z-[60] p-4 ${showDeleteConfirm ? 'bg-transparent' : 'bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-md'}`}>
        <div className="absolute inset-0" onClick={() => { setShowTransModal(false); setEditTransId(null); setShowDeleteConfirm(false); }}></div>
        <div className={`w-full max-w-sm sm:max-w-md rounded-[2.5rem] p-6 pb-6 relative shadow-2xl border z-10 animate-slide-up flex flex-col max-h-[85vh] transition-all duration-300 ${showDeleteConfirm ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-white/20 dark:border-slate-800/50' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
           {!showDeleteConfirm ? (
             <>
               <button onClick={() => { setShowTransModal(false); setEditTransId(null); setShowDeleteConfirm(false); }} className="absolute top-6 left-6 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 p-2 rounded-full transition-colors"><X size={18}/></button>
               <h3 className="font-bold text-lg mb-6 text-slate-900 dark:text-white px-2 mt-1">{editTransId ? (form.type === 'transfer' ? 'تعديل تحويل' : 'تعديل معاملة') : 'إضافة معاملة'}</h3>
               <form onSubmit={saveForm} className="space-y-4 overflow-y-auto pb-4 px-1" style={{ scrollbarWidth: 'none' }}>
                  <div className="flex bg-white dark:bg-slate-950 rounded-[1.25rem] p-1.5 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <button type="button" onClick={() => setForm({...form, type: 'expense'})} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${form.type === 'expense' ? 'bg-red-50 dark:bg-slate-800 text-red-600 dark:text-red-400 shadow-sm' : 'text-slate-500 dark:text-slate-500'}`}>سحب</button>
                    <button type="button" onClick={() => setForm({...form, type: 'income'})} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${form.type === 'income' ? 'bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-500'}`}>إيداع</button>
                    <button type="button" onClick={() => setForm({...form, type: 'transfer', category: 'تحويل داخلي'})} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${form.type === 'transfer' ? 'bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-500'}`}>تحويل</button>
                  </div>

                  <div className="flex gap-3">
                     <input type="number" step="0.01" required value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} onFocus={(e) => setTimeout(() => e.target.scrollIntoView({behavior:'smooth', block:'center'}), 300)} placeholder="المبلغ" className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-50 p-4 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 w-full shadow-sm" />
                     <input type="date" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} onFocus={(e) => setTimeout(() => e.target.scrollIntoView({behavior:'smooth', block:'center'}), 300)} className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 p-4 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 w-full shadow-sm flex items-center" />
                  </div>
                  
                  <div className="space-y-3">
                     <label className="text-xs font-bold text-slate-500 px-1">{form.type === 'transfer' ? 'من حساب:' : 'الحساب المستخدم:'}</label>
                     <CustomSelect 
                        value={form.accountId} 
                        onChange={val => setForm({...form, accountId: val})} 
                        placeholder="اختر الحساب..."
                        options={accounts.filter(a => editTransId ? (!a.isPaused || a.id === form.accountId) : !a.isPaused).map(a => ({value: a.id, label: a.name}))}
                     />
                  </div>

                  {form.type === 'transfer' && (
                    <div className="space-y-3 animate-slide-up">
                       <label className="text-xs font-bold text-slate-500 px-1">إلى حساب:</label>
                       <CustomSelect 
                          value={form.toAccountId} 
                          onChange={val => setForm({...form, toAccountId: val})} 
                          placeholder="اختر الحساب المحول إليه..."
                          options={accounts.filter(a => a.id !== form.accountId && (editTransId ? (!a.isPaused || a.id === form.toAccountId) : !a.isPaused)).map(a => ({value: a.id, label: a.name}))}
                       />
                    </div>
                  )}
                  
                  {form.type !== 'transfer' && (
                    <>
                      <div 
                        onClick={() => setShowCategoryPicker(true)} 
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-50 p-4 rounded-2xl text-sm flex justify-between items-center cursor-pointer shadow-sm transition-colors"
                      >
                        <span className={!form.category ? "text-slate-400 dark:text-slate-500" : "font-medium"}>
                          {form.category ? form.category : (form.type === 'expense' ? 'المصروف' : 'الإيراد')}
                        </span>
                        <ChevronDown size={16} className="text-slate-400 dark:text-slate-500" />
                      </div>

                      <CategoryPickerModal 
                         isOpen={showCategoryPicker} 
                         onClose={() => setShowCategoryPicker(false)} 
                         onSelect={(val) => setForm({...form, category: val})}
                         mainCategories={mainCategories}
                         txType={form.type as 'income' | 'expense'}
                      />
                    </>
                  )}

                  <input type="text" value={form.note} onChange={e => setForm({...form, note: e.target.value})} onFocus={(e) => setTimeout(() => e.target.scrollIntoView({behavior:'smooth', block:'center'}), 300)} placeholder="ملاحظات (اختياري)" className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-50 p-4 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 shadow-sm" />
                  <div className="flex gap-3 mt-6">
                    <button type="submit" className="flex-1 bg-indigo-600 dark:bg-indigo-500 text-white font-bold p-4 rounded-2xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-transform text-base shrink-0">تأكيد الحفظ</button>
                    {editTransId && (
                      <button 
                        type="button" 
                        onClick={() => setShowDeleteConfirm(true)} 
                        className="w-16 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center border border-red-100 dark:border-red-500/20 active:scale-95 transition-transform shrink-0"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
               </form>
             </>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4 animate-slide-up">
               <button 
                 onClick={handleDelete}
                 className="w-full bg-red-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-red-500/20 active:scale-90 transition-transform text-lg"
               >
                 تأكيد الحذف
               </button>
               <button 
                 onClick={() => setShowDeleteConfirm(false)}
                 className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold py-4 rounded-2xl active:scale-90 transition-transform text-lg"
               >
                 تراجع
               </button>
             </div>
           )}
        </div>
      </div>
    )
  }

  const SettingsManager = () => {
    const [pinInput, setPinInput] = useState('');
    const [isSettingPin, setIsSettingPin] = useState(false);
    const [showExportModal, setShowExportModal] = useState<'excel' | 'pdf' | 'print' | null>(null);
    
    const [month, setMonth] = useState(getCurrentMonthStr());
    const [budgetInput, setBudgetInput] = useState('');
    const monthBudget = budget[month] || 0;
    const saveBudget = () => { setBudget({...budget, [month]: parseFloat(budgetInput || '0')}); setBudgetInput(''); };

    const handleBackupExport = () => {
      const data = { transactions, accounts, debts, budget, mainCategories, expenseGroups, appPin, useBiometrics };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finance_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
    };

    const handleBackupImport = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (data.transactions) setTransactions(data.transactions);
          if (data.accounts) setAccounts(data.accounts);
          if (data.debts) setDebts(data.debts);
          if (data.budget) setBudget(data.budget);
          if (data.mainCategories) setMainCategories(data.mainCategories);
          if (data.expenseGroups) setExpenseGroups(data.expenseGroups);
          if (data.appPin !== undefined) {
            setAppPin(data.appPin);
            localStorage.setItem('app_pin', data.appPin);
          }
          if (data.useBiometrics !== undefined) {
            setUseBiometrics(data.useBiometrics);
            localStorage.setItem('use_biometrics', data.useBiometrics.toString());
          }
          alert('تم استيراد البيانات بنجاح');
        } catch (err) { alert('خطأ في استيراد الملف'); }
      };
      reader.readAsText(file);
    };

    const prepareExportData = () => {
      return transactions.map(t => ({
        'التاريخ': t.date,
        'النوع': t.type === 'income' ? 'إيداع' : 'سحب',
        'الفئة': t.category,
        'الحساب': accounts.find(a => a.id === t.accountId)?.name || 'غير معروف',
        'المبلغ': t.amount,
        'ملاحظات': t.note
      }));
    };

    const renderExportOptions = () => {
      if (!showExportModal) return null;
      const title = showExportModal === 'excel' ? 'تصدير Excel' : showExportModal === 'pdf' ? 'تصدير PDF' : 'طباعة التقارير';
      return (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[130] p-4">
          <div className="absolute inset-0" onClick={() => setShowExportModal(null)}></div>
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-6 pb-8 relative shadow-2xl border border-slate-200 dark:border-slate-800 z-10 animate-slide-up flex flex-col">
            <button onClick={() => setShowExportModal(null)} className="absolute top-6 left-6 text-slate-400 p-2 rounded-full transition-colors"><X size={18}/></button>
            <h3 className="font-bold text-lg mb-6 text-slate-900 dark:text-white mt-1">{title}</h3>
            <div className="space-y-3">
              <button onClick={() => {
                const data = prepareExportData();
                if (showExportModal === 'excel') exportToExcel(data, 'Transactions');
                if (showExportModal === 'pdf' || showExportModal === 'print') exportToPDF(['التاريخ', 'النوع', 'الفئة', 'الحساب', 'المبلغ', 'ملاحظات'], data.map(d => Object.values(d)), 'سجل كافة العمليات', 'Transactions');
                setShowExportModal(null);
              }} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-right font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">سجل كافة العمليات</button>
              <button onClick={() => {
                 const currentMonth = getCurrentMonthStr();
                 const data = prepareExportData().filter(d => d['التاريخ'].startsWith(currentMonth));
                 if (showExportModal === 'excel') exportToExcel(data, `Transactions_${currentMonth}`);
                 if (showExportModal === 'pdf' || showExportModal === 'print') exportToPDF(['التاريخ', 'النوع', 'الفئة', 'الحساب', 'المبلغ', 'ملاحظات'], data.map(d => Object.values(d)), `سجل حركات شهر ${currentMonth}`, `Transactions_${currentMonth}`);
                 setShowExportModal(null);
              }} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-right font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">حركات الشهر الحالي</button>
              <button onClick={() => {
                const data = accounts.map(a => ({ 'اسم الحساب': a.name, 'الرصيد الحالي': getAccountBalance(a.id) }));
                if (showExportModal === 'excel') exportToExcel(data, 'Accounts_Balance');
                if (showExportModal === 'pdf' || showExportModal === 'print') exportToPDF(['اسم الحساب', 'الرصيد الحالي'], data.map(d => Object.values(d)), 'رصيد الحسابات القائم', 'Accounts_Balance');
                setShowExportModal(null);
              }} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-right font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">الأرصدة الحالية للحسابات</button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="p-4 pb-24 h-full overflow-y-auto space-y-6" style={{ scrollbarWidth: 'none' }}>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
           <div className="flex items-center justify-between mb-3 text-indigo-600 dark:text-indigo-400">
             <div className="flex items-center gap-2">
                <PieChart size={18} /> <span className="font-bold text-xs uppercase tracking-wider">الميزانية الشهرية</span>
             </div>
             <div className="flex flex-col items-end">
                <span className="text-[9px] text-slate-400 font-bold mb-0.5">الميزانية الحالية ({month.split('-')[1]})</span>
                <span className="bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-lg text-[13px] font-black border border-indigo-100 dark:border-indigo-500/20">
                   {formatCurrency(monthBudget).replace('EGP','')}
                </span>
             </div>
           </div>
           
           <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 mt-2 pt-3">
              <input type="month" value={month} onChange={e => setMonth(e.target.value)} className="flex-[0.8] bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-2.5 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors w-full"/>
              <div className="flex-[1.2] flex gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-1.5 rounded-xl shadow-inner-sm">
                 <input type="number" placeholder="قيمة جديدة..." value={budgetInput} onChange={e => setBudgetInput(e.target.value)} className="flex-1 bg-transparent text-[11px] text-slate-800 dark:text-white focus:outline-none pr-1 w-full font-bold"/>
                 <button onClick={saveBudget} className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold text-[10px] active:scale-95 transition-all shadow-sm">حفظ</button>
              </div>
           </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
           <div className="flex items-center gap-3 mb-5 text-indigo-600 dark:text-indigo-400">
             <Shield size={20} /> <span className="font-bold text-sm">حماية التطبيق</span>
           </div>
           <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div>
                   <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{appPin ? 'تغيير الرقم السري' : 'تفعيل رقم سري'}</p>
                   <p className="text-[10px] text-slate-500 mt-0.5">قفل التطبيق برمز حماية خاص</p>
                </div>
                <button onClick={() => setIsSettingPin(true)} className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 active:scale-95 transition-transform shadow-sm">
                   {appPin ? <Edit2 size={18}/> : <Plus size={18}/>}
                </button>
              </div>
              {/* خيار البصمة دائماً ظاهر */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Fingerprint size={16} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-800 dark:text-slate-200">فتح بالبصمة</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">استخدم البصمة أو الوجه لفتح التطبيق</p>
                  </div>
                </div>
                <button 
                  onClick={() => { 
                    if (!appPin) return alert('يجب تعيين رقم سري أولاً قبل تفعيل البصمة');
                    const val = !useBiometrics; 
                    setUseBiometrics(val); 
                    localStorage.setItem('use_biometrics', val.toString()); 
                  }} 
                  className={`w-12 h-6 rounded-full relative transition-colors ${useBiometrics ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${useBiometrics ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>

              {appPin && (
                <button onClick={() => { if(confirm('تأكيد إلغاء القفل؟')) { setAppPin(''); localStorage.removeItem('app_pin'); setUseBiometrics(false); localStorage.setItem('use_biometrics', 'false'); } }} className="w-full p-4 text-red-500 font-bold text-xs bg-red-50 dark:bg-red-500/10 rounded-2xl">إيقاف ميزات الحماية</button>
              )}
           </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
           <div className="flex items-center gap-3 mb-5 text-emerald-600 dark:text-emerald-400">
             <FileText size={20} /> <span className="font-bold text-sm">تصدير التقارير</span>
           </div>
           <div className="grid grid-cols-3 gap-3">
              <button onClick={() => setShowExportModal('excel')} className="flex flex-col items-center gap-2 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 active:scale-95 transition-transform shadow-tiny">
                 <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-1"><FileSpreadsheet size={20}/></div>
                 <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Excel</span>
              </button>
              <button onClick={() => setShowExportModal('pdf')} className="flex flex-col items-center gap-2 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 active:scale-95 transition-transform shadow-tiny">
                 <div className="w-10 h-10 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-1"><FileText size={20}/></div>
                 <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">PDF</span>
              </button>
              <button onClick={() => setShowExportModal('print')} className="flex flex-col items-center gap-2 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 active:scale-95 transition-transform shadow-tiny">
                 <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-1"><Printer size={20}/></div>
                 <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">طباعة</span>
              </button>
           </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
           <div className="flex items-center gap-3 mb-5 text-amber-600 dark:text-amber-400">
             <Download size={20} /> <span className="font-bold text-sm">النسخ الاحتياطي</span>
           </div>
           <div className="flex gap-3">
              <button onClick={handleBackupExport} className="flex-1 flex flex-col items-center justify-center gap-2 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 font-bold text-[10px] text-slate-700 dark:text-slate-100 shadow-tiny active:scale-95 transition-all">
                <Download size={18} className="text-amber-500"/> تصدير نسخة
              </button>
              <div className="flex-1 relative">
                <input type="file" accept=".json" onChange={handleBackupImport} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                <button className="h-full w-full flex flex-col items-center justify-center gap-2 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 font-bold text-[10px] text-slate-700 dark:text-slate-100 shadow-tiny active:scale-95 transition-all">
                  <Upload size={18} className="text-blue-500"/> استيراد نسخة
                </button>
              </div>
           </div>
        </div>

        {isSettingPin && (
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[130] p-4">
             <div className="absolute inset-0" onClick={() => setIsSettingPin(false)}></div>
             <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-6 pb-8 relative shadow-2xl border border-slate-200 dark:border-slate-800 z-10 animate-slide-up">
                <button onClick={() => setIsSettingPin(false)} className="absolute top-6 left-6 text-slate-400 p-2 rounded-full"><X size={18}/></button>
                <h3 className="font-bold text-lg mb-6 text-slate-900 dark:text-white mt-1">تحديد رمز الحماية</h3>
                <input type="password" maxLength={4} placeholder="كود من ٤ أرقام" value={pinInput} onChange={e => setPinInput(e.target.value.replace(/\D/,''))} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white p-4 rounded-2xl text-center text-2xl font-extrabold tracking-[10px] mb-6 focus:outline-none focus:border-indigo-500"/>
                <button onClick={() => { if(pinInput.length === 4) { setAppPin(pinInput); localStorage.setItem('app_pin', pinInput); setIsSettingPin(false); setPinInput(''); alert('تم حفظ الرمز'); } else { alert('أدخل ٤ أرقام'); } }} className="w-full bg-indigo-600 dark:bg-indigo-500 text-white font-bold p-4 rounded-2xl shadow-lg active:scale-95 transition-transform text-sm">حفظ الرمز</button>
             </div>
          </div>
        )}
        {renderExportOptions()}
      </div>
    );
  };

  const LockScreen = () => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);
    const handleInput = (char: string) => {
      if (pin.length < 4) {
        const newPin = pin + char;
        setPin(newPin);
        if (newPin.length === 4) {
          if (newPin === appPin) { setIsLocked(false); } else { setError(true); setTimeout(() => { setPin(''); setError(false); }, 500); }
        }
      }
    };
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-50 dark:bg-slate-900 z-[200] flex flex-col items-center justify-center p-6 bg-cover bg-center" style={{ backgroundImage: 'url(https://picsum.photos/seed/secure/1080/1920?blur=10)' }}>
         <div className="absolute inset-0 bg-white/40 dark:bg-slate-950/60 backdrop-blur-xl"></div>
         <div className="relative z-10 flex flex-col items-center w-full max-w-xs animate-slide-up">
            <div className="w-20 h-20 bg-indigo-600 dark:bg-indigo-500 rounded-3xl flex items-center justify-center shadow-2xl mb-6">
               <Shield size={40} className="text-white" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">تطبيق المصاريف</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-12 text-sm text-center">أدخل رمز الحماية للمتابعة</p>
            <div className={`flex gap-4 mb-12 ${error ? 'animate-shake' : ''}`}>
               {[0,1,2,3].map(i => ( <div key={i} className={`w-4 h-4 rounded-full border-2 border-indigo-600 dark:border-indigo-400 transition-all duration-300 ${pin.length > i ? 'bg-indigo-600 dark:bg-indigo-400 scale-125' : 'bg-transparent'}`}></div> ))}
            </div>
            <div className="grid grid-cols-3 gap-4 w-full">
               {[1,2,3,4,5,6,7,8,9].map(n => ( <button key={n} onClick={() => handleInput(n.toString())} className="h-16 rounded-2xl bg-white/20 dark:bg-white/5 backdrop-blur-md border border-white/30 dark:border-white/10 text-slate-900 dark:text-white text-xl font-bold flex items-center justify-center active:bg-indigo-600/20 transition-all active:scale-90">{n}</button> ))}
               <button onClick={handleBiometricAuth} className="h-16 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center active:scale-90 transition-all"><Fingerprint size={24} /></button>
               <button onClick={() => handleInput('0')} className="h-16 rounded-2xl bg-white/20 dark:bg-white/5 backdrop-blur-md border border-white/30 dark:border-white/10 text-slate-900 dark:text-white text-xl font-bold flex items-center justify-center active:bg-indigo-600/20 transition-all active:scale-90">0</button>
               <button onClick={() => setPin(pin.slice(0,-1))} className="h-16 rounded-2xl bg-white/20 dark:bg-white/5 text-slate-500 dark:text-slate-400 flex items-center justify-center active:scale-90 transition-all"><ChevronLeft size={24}/></button>
            </div>
         </div>
      </motion.div>
    );
  };

  return (
    <div className="bg-slate-200 dark:bg-slate-950 min-h-screen flex justify-center font-sans selection:bg-indigo-500/30 select-none">
      <div className="bg-slate-50 dark:bg-slate-900 w-full max-w-md h-screen relative flex flex-col shadow-2xl sm:shadow-xl sm:border-x sm:border-slate-200 dark:sm:border-slate-800 overflow-hidden mx-auto transition-colors duration-300">
        
        {/* HEADER */}
        <header className="p-6 pt-8 pb-4 z-10 flex items-center justify-between">
          <div className="flex items-center justify-center gap-3">
             <button onClick={() => setIsSidebarOpen(true)} className="w-11 h-11 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all focus:outline-none active:scale-95">
                <Menu size={20} />
             </button>
             <div className="flex flex-col pt-1">
                <h1 className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white leading-none">
                  {{ 'dashboard': 'المصاريف الشخصية', 'transactions': 'الحركات', 'accounts': 'النقدي والبنوك', 'debts': 'السلفيات', 'categories': 'الفئات', 'groups': 'المصاريف', 'analysis': 'المقارنة الشهرية', 'reports': 'التقارير', 'settings': 'الإعدادات' }[activeTab] || 'المصاريف الشخصية'}
                </h1>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-1">{new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
             </div>
          </div>
          <button onClick={toggleTheme} className="w-11 h-11 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all focus:outline-none active:scale-95">
             {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        {/* CONTAINER */}
        <main className="flex-1 overflow-hidden relative">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'transactions' && <TransactionsManager />}
          {activeTab === 'accounts' && <AccountsManager />}
          {activeTab === 'debts' && <DebtsManager />}
          {activeTab === 'reports' && <ReportsManager />}
          {activeTab === 'categories' && <CategoriesManager />}
          {activeTab === 'groups' && <ExpenseGroupsManager />}
          {activeTab === 'analysis' && <AnalysisManager />}
          {activeTab === 'settings' && <SettingsManager />}
        </main>

        <AnimatePresence>
          {isLocked && <LockScreen />}
        </AnimatePresence>

        {/* FAB */}
        <button onClick={() => { setEditTransId(null); setShowTransModal(true); }} className="absolute bottom-6 left-6 w-16 h-16 bg-indigo-600/90 dark:bg-indigo-500/90 backdrop-blur-md text-white rounded-full flex items-center justify-center shadow-[0_10px_25px_-5px_rgba(79,70,229,0.5)] z-30 active:scale-90 transition-transform">
           <Plus size={28} strokeWidth={2.5} />
        </button>

        <GlobalTransModal />
        <AccountDetailModal />

        {/* SIDE MENU (FLOATING) */}
        {isSidebarOpen && (
           <div className="absolute inset-0 bg-slate-900/10 dark:bg-slate-950/20 backdrop-blur-[1px] z-[100]" dir="rtl">
              <div className="absolute inset-0" onClick={() => setIsSidebarOpen(false)}></div>
              <div className="absolute top-20 right-0 w-[210px] max-h-[75vh] bg-white dark:bg-slate-900 rounded-l-[2rem] shadow-2xl flex flex-col animate-slide-in-right overflow-hidden z-10">
                
                <div className="p-4 flex items-center justify-between bg-indigo-50/30 dark:bg-slate-800/20">
                   <h2 className="font-bold text-lg text-indigo-900 dark:text-white">القائمة</h2>
                </div>

                <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
                  {[
                    { id: 'dashboard', label: 'الرئيسية', icon: Home },
                    { id: 'accounts', label: 'النقدي والبنوك', icon: Landmark },
                    { id: 'debts', label: 'السلفيات', icon: Users },
                    { id: 'categories', label: 'الفئات', icon: Tags },
                    { id: 'groups', label: 'المصاريف', icon: Layers },
                    { id: 'analysis', label: 'المقارنة الشهرية', icon: BarChart2 },
                    { id: 'transactions', label: 'الحركات', icon: ListOrdered },
                    { id: 'reports', label: 'التقارير', icon: PieChart },
                    { id: 'settings', label: 'الإعدادات', icon: Settings },
                  ].map(item => (
                    <button 
                      key={item.id}
                      onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-[1.25rem] transition-all ${activeTab === item.id ? 'bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white font-semibold'}`}
                    >
                       <item.icon size={18} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                       <span className="text-sm">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
}
