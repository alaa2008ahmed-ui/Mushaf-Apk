import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, CartesianGrid 
} from 'recharts';
import { Employee, PayrollTotals } from '../types';
import { calculateEmployeeTotals, formatCurrency } from '../utils/calculations';
import { Building2, PieChart as PieIcon, Award, TrendingUp } from 'lucide-react';

interface AnalyticsDashboardProps {
  employees: Employee[];
  totals: PayrollTotals;
  payrollPhase: 'full' | 'phase1' | 'phase2';
}

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#64748b'];

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ employees, totals, payrollPhase }) => {
  // Aggregate data by Branch (الفرع)
  const branchMap: Record<string, { branch: string; count: number; totalEntitlements: number; netSalary: number }> = {};
  
  employees.forEach(emp => {
    const b = emp.branch || 'أخرى';
    if (!branchMap[b]) {
      branchMap[b] = { branch: b, count: 0, totalEntitlements: 0, netSalary: 0 };
    }
    const t = calculateEmployeeTotals(emp, payrollPhase);
    branchMap[b].count += 1;
    branchMap[b].totalEntitlements += t.totalEntitlements;
    branchMap[b].netSalary += t.netSalary;
  });

  const branchData = Object.values(branchMap);

  // Entitlements breakdown pie chart
  const pieData = [
    { name: 'الراتب الأساسي', value: totals.basicSalary },
    { name: 'بدل السكن', value: totals.housingAllowance },
    { name: 'بدل الانتقال', value: totals.transportationAllowance },
    { name: 'بدل الاتصال', value: totals.communicationAllowance },
    { name: 'بدل الطعام', value: totals.foodAllowance },
    { name: 'الإضافي والمكافآت', value: totals.overtime + totals.commission + totals.bonus }
  ].filter(d => d.value > 0);

  // Top 5 highest paid employees
  const topEmployees = [...employees]
    .map(emp => ({
      ...emp,
      totals: calculateEmployeeTotals(emp)
    }))
    .sort((a, b) => b.totals.netSalary - a.totals.netSalary)
    .slice(0, 5);

  return (
    <div className="w-full px-4 sm:px-6 py-8 space-y-8 font-sans" dir="rtl">
      
      {/* Dashboard Title Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            لوحة التحليلات والإحصائيات المالية
          </h2>
          <p className="text-sm text-slate-500">نظرة عامة على توزيع الرواتب، البدلات، والأفرع</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-emerald-800 text-xs font-bold">
          عدد الموظفين المحللين: {employees.length} موظف
        </div>
      </div>

      {/* Grid of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Chart 1: Payroll by Branch */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-800">توزيع الرواتب المستحقة حسب الإدارة / الفرع</h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="branch" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: any) => [`${Number(value || 0).toLocaleString()} ر.س`, 'المبلغ']}
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', border: 'none' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar name="إجمالي الاستحقاقات" dataKey="totalEntitlements" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar name="صافي الراتب" dataKey="netSalary" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Entitlements Breakdown Pie */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <PieIcon className="w-5 h-5 text-purple-600" />
            <h3 className="text-base font-bold text-slate-800">نسب مكونات الاستحقاقات (أساسي مقابل بدلات)</h3>
          </div>
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => `${Number(val || 0).toLocaleString()} ر.س`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Top 5 Highest Paid List & Summary Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Top 5 Employees */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-800">أعلى 5 موظفين من حيث صافي الراتب</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="p-3">الترتيب</th>
                  <th className="p-3">الاسم</th>
                  <th className="p-3">الوظيفة</th>
                  <th className="p-3">الفرع</th>
                  <th className="p-3 text-left">الراتب الأساسي</th>
                  <th className="p-3 text-left">صافي الراتب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topEmployees.map((emp, i) => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-bold text-slate-400">#{i + 1}</td>
                    <td className="p-3 font-bold text-slate-800">{emp.name}</td>
                    <td className="p-3 text-slate-600">{emp.jobTitle}</td>
                    <td className="p-3 text-slate-600">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-xs">
                        {emp.branch}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-left text-slate-600">{formatCurrency(emp.basicSalary)}</td>
                    <td className="p-3 font-mono font-bold text-left text-emerald-600">{formatCurrency(emp.totals.netSalary)} ر.س</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Branch Summary List */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 mb-4">ملخص الرواتب حسب الإدارات</h3>
          <div className="space-y-3">
            {branchData.map((b, i) => (
              <div key={b.branch} className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                    {b.branch}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{b.count} موظفين</p>
                </div>
                <div className="text-left">
                  <p className="font-mono font-bold text-slate-900 text-sm">{formatCurrency(b.netSalary)}</p>
                  <p className="text-[10px] text-slate-400 font-medium">صافي الرواتب</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
