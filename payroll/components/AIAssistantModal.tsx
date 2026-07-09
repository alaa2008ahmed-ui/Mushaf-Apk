import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User, Loader2, Lightbulb, TrendingUp } from 'lucide-react';
import { Employee, PayrollTotals } from '../types';
import { formatCurrency } from '../utils/calculations';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  totals: PayrollTotals;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  employees,
  totals
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: `مرحباً بك في مستشار كشوف الرواتب الذكي! 🤖✨\nأنا هنا لمساعدتك في تحليل رواتب ${employees.length} موظف (بإجمالي استحقاقات ${formatCurrency(totals.totalEntitlements)} ر.س).\nيمكنك سؤالي عن إحصائيات أي فرع، اقتراح علاوات، أو استعلام عن موظفين محددين!`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const quickQuestions = [
    "ما هو الفرع الأعلى استهلاكاً للرواتب؟",
    "ما تكلفة زيادة الراتب الأساسي 5% لجميع الموظفين؟",
    "من هم الموظفون الذين لديهم غيابات أو سلف؟",
    "قدم لي ملخصاً سريعاً للوضع المالي لرواتب شهر يونيو."
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      // Create lightweight summary payload to send to our Express backend
      const branchSummary: Record<string, { count: number; totalNet: number }> = {};
      employees.forEach(e => {
        const b = e.branch || 'أخرى';
        if (!branchSummary[b]) branchSummary[b] = { count: 0, totalNet: 0 };
        branchSummary[b].count++;
        branchSummary[b].totalNet += (e.basicSalary + (e.housingAllowance||0) + (e.transportationAllowance||0) + (e.communicationAllowance||0) + (e.foodAllowance||0) + (e.overtime||0) + (e.commission||0) + (e.bonus||0)) - ((e.insuranceDeduction||0) + (e.generalDeduction||0) + (e.loan||0) + (e.absenceDeduction||0));
      });

      const response = await fetch('/api/analyze-payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend,
          summary: {
            employeeCount: employees.length,
            totals,
            branches: branchSummary,
            sampleEmployees: employees.slice(0, 10).map(e => ({
              name: e.name,
              code: e.code,
              jobTitle: e.jobTitle,
              branch: e.branch,
              basicSalary: e.basicSalary,
              loan: e.loan,
              absence: e.absenceDeduction
            }))
          }
        })
      });

      if (!response.ok) {
        throw new Error('فشل الاتصال بمستشار الرواتب');
      }

      const data = await response.json();
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.reply || 'عذراً، لم أتمكن من تحليل البيانات حالياً.'
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: `⚠️ تنبيه: ${err.message || 'حدث خطأ في الاتصال بالذكاء الاصطناعي.'} (تأكد من إعداد مفتاح GEMINI_API_KEY في إعدادات البيئة).`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full h-[650px] max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
        
        {/* Modal Top Bar */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between border-b border-blue-700 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl text-white shadow-xs border border-white/30">
              <Sparkles className="w-5 h-5 animate-pulse text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                مستشار الرواتب الذكي (Gemini AI Advisor)
              </h3>
              <p className="text-xs text-blue-100 font-medium">تحليل فوري واستشارات مالية لكشوف رواتب الموظفين</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs ${
                msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-xs whitespace-pre-wrap ${
                msg.sender === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none font-medium'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 mr-auto items-center text-slate-500 text-sm font-medium bg-white p-4 rounded-2xl border border-slate-200 shadow-xs w-48">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
              <span>جاري تحليل الرواتب...</span>
            </div>
          )}
        </div>

        {/* Quick Question Chips */}
        <div className="px-6 py-2 bg-white border-t border-slate-200 overflow-x-auto flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="text-xs font-bold text-slate-500 shrink-0">أسئلة مقترحة:</span>
          <div className="flex gap-1.5 overflow-x-auto py-1">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={loading}
                className="text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 px-3 py-1.5 rounded-full border border-slate-200 whitespace-nowrap transition-all cursor-pointer disabled:opacity-50 font-medium"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اسأل عن أي إحصائية، علاوة، أو تكلفة مالية في كشف الرواتب..."
              disabled={loading}
              className="flex-1 bg-slate-50 border border-slate-300 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <span>إرسال</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
