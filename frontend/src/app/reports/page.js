'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BarChart3, 
  Calendar, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  Loader2,
  PieChart as PieIcon
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../lib/api';

const COLORS = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#3b82f6', '#ef4444', '#ec4899', '#a855f7'];

export default function ReportsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get('/reports/summary', { params });
      setReportData(res.data);
    } catch (err) {
      console.error('Failed to load report summary:', err);
    } fontally: {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else {
        fetchReport();
      }
    }
  }, [authLoading, isAuthenticated, router, fetchReport]);

  if (authLoading) return null;

  const { summary, categoryBreakdown } = reportData || {
    summary: { totalIncome: 0, totalExpense: 0, netBalance: 0 },
    categoryBreakdown: []
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Financial Reports" />

        <main className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-100">Financial Reports & Analytics</h2>
              <p className="text-xs text-slate-400 mt-1">Generate custom date range summaries and category-wise spending reports</p>
            </div>
          </div>

          {/* Custom Date Range Filter */}
          <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>Select Custom Date Range:</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>From:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>To:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              {(startDate || endDate) && (
                <button
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="text-xs text-slate-400 hover:text-slate-200 underline"
                >
                  Reset Filter
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="py-16 flex items-center justify-center text-cyan-400">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="glass-card p-6 rounded-2xl border border-emerald-500/20">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Range Income</span>
                  <p className="text-3xl font-extrabold text-slate-100 mt-2">
                    ${summary.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="glass-card p-6 rounded-2xl border border-rose-500/20">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Range Expense</span>
                  <p className="text-3xl font-extrabold text-slate-100 mt-2">
                    ${summary.totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="glass-card p-6 rounded-2xl border border-cyan-500/20">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Savings</span>
                  <p className={`text-3xl font-extrabold mt-2 ${summary.netBalance >= 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
                    ${summary.netBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* Category-wise Spending Detailed Table & Pie Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Spending Table */}
                <div className="glass-card p-6 rounded-2xl border border-slate-800">
                  <h3 className="text-base font-bold text-slate-100 mb-4">Category-Wise Spending Breakdown</h3>

                  {categoryBreakdown.length === 0 ? (
                    <p className="text-slate-500 text-xs py-8 text-center">No spending records found in selected range.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-900/60 uppercase text-[10px] text-slate-400 font-semibold border-b border-slate-800">
                          <tr>
                            <th className="px-4 py-3">Category</th>
                            <th className="px-4 py-3 text-right">Total Spent</th>
                            <th className="px-4 py-3 text-right">% of Total Expense</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {categoryBreakdown.map((item) => {
                            const pct = summary.totalExpense > 0 
                              ? ((item.value / summary.totalExpense) * 100).toFixed(1)
                              : '0.0';
                            return (
                              <tr key={item.name} className="hover:bg-slate-900/40">
                                <td className="px-4 py-3.5 flex items-center gap-2">
                                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                  <span className="font-semibold text-slate-200">{item.name}</span>
                                </td>
                                <td className="px-4 py-3.5 text-right font-bold text-slate-100">
                                  ${item.value.toFixed(2)}
                                </td>
                                <td className="px-4 py-3.5 text-right text-slate-400 font-medium">
                                  {pct}%
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Pie Chart Visualizer */}
                <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
                  <h3 className="text-base font-bold text-slate-100 mb-4">Visual Distribution</h3>
                  {categoryBreakdown.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
                      No data to visualize.
                    </div>
                  ) : (
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryBreakdown}
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            paddingAngle={3}
                            dataKey="value"
                            nameKey="name"
                          >
                            {categoryBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                            formatter={(val) => `$${val.toLocaleString()}`}
                          />
                          <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
