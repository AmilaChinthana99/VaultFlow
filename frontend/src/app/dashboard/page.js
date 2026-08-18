'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight,
  Loader2,
  Calendar
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import TransactionModal from '../../components/TransactionModal';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../lib/api';

const COLORS = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#3b82f6', '#ef4444', '#ec4899', '#a855f7'];

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();

  const [reportData, setReportData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [reportRes, catRes] = await Promise.all([
        api.get('/reports/summary'),
        api.get('/categories')
      ]);
      setReportData(reportRes.data);
      setCategories(catRes.data.categories || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else {
        fetchDashboardData();
      }
    }
  }, [authLoading, isAuthenticated, router, fetchDashboardData]);

  if (authLoading || (loading && !reportData)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-cyan-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const { summary, categoryBreakdown, trends, recentTransactions } = reportData || {
    summary: { totalIncome: 0, totalExpense: 0, netBalance: 0 },
    categoryBreakdown: [],
    trends: [],
    recentTransactions: []
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Dashboard Overview" />

        <main className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-100">Financial Summary</h2>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Current Month Analytics
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Transaction
            </button>
          </div>

          {/* Metric Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Total Income Card */}
            <div className="glass-card p-6 rounded-2xl relative overflow-hidden border border-emerald-500/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Income</span>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-extrabold text-slate-100">
                  ${summary.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-emerald-400 mt-1 font-medium flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Received this month
                </p>
              </div>
            </div>

            {/* Total Expense Card */}
            <div className="glass-card p-6 rounded-2xl relative overflow-hidden border border-rose-500/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Expenses</span>
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <ArrowDownRight className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-extrabold text-slate-100">
                  ${summary.totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-rose-400 mt-1 font-medium flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" /> Spent this month
                </p>
              </div>
            </div>

            {/* Net Balance Card */}
            <div className="glass-card p-6 rounded-2xl relative overflow-hidden border border-cyan-500/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Balance</span>
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <p className={`text-3xl font-extrabold ${summary.netBalance >= 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
                  ${summary.netBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-slate-400 mt-1 font-medium">
                  {summary.netBalance >= 0 ? 'Positive net savings' : 'Expense exceeds income'}
                </p>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 6-Month Income vs Expense Bar Chart */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <h3 className="text-base font-bold text-slate-100 mb-4">Income vs Expense Trend (Last 6 Months)</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                      formatter={(val) => `$${val.toLocaleString()}`}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Expense Breakdown Pie Chart */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <h3 className="text-base font-bold text-slate-100 mb-4">Expense Breakdown by Category</h3>
              {categoryBreakdown.length === 0 ? (
                <div className="h-72 flex items-center justify-center text-slate-500 text-sm">
                  No expense data available for this month.
                </div>
              ) : (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
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

          {/* Recent Transactions Table Widget */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-100">Recent Transactions</h3>
              <button
                onClick={() => router.push('/transactions')}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                View All →
              </button>
            </div>

            {recentTransactions.length === 0 ? (
              <p className="text-slate-500 text-xs py-4 text-center">No transactions recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/60 uppercase text-[10px] text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {recentTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="px-4 py-3.5 flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: tx.category?.color || '#38bdf8' }}
                          />
                          <span className="font-semibold text-slate-200">{tx.category?.name || 'Uncategorized'}</span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-400 max-w-xs truncate">{tx.description || '-'}</td>
                        <td className="px-4 py-3.5 text-slate-400">
                          {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className={`px-4 py-3.5 text-right font-bold ${tx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {tx.type === 'INCOME' ? '+' : '-'}${tx.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchDashboardData}
        categories={categories}
      />
    </div>
  );
}
