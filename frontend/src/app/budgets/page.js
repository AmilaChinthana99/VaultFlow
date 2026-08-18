'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PieChart, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  AlertOctagon, 
  Trash2, 
  Loader2,
  Calendar
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import BudgetModal from '../../components/BudgetModal';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../lib/api';

export default function BudgetsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();

  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    try {
      const [bRes, cRes] = await Promise.all([
        api.get('/budgets', { params: { month, year } }),
        api.get('/categories')
      ]);
      setBudgets(bRes.data.budgets || []);
      setCategories(cRes.data.categories || []);
    } catch (err) {
      console.error('Failed to fetch budgets:', err);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else {
        fetchBudgets();
      }
    }
  }, [authLoading, isAuthenticated, router, fetchBudgets]);

  const handleDeleteBudget = async (id) => {
    if (window.confirm('Delete this budget target?')) {
      try {
        await api.delete(`/budgets/${id}`);
        fetchBudgets();
      } catch (err) {
        console.error('Delete budget error:', err);
      }
    }
  };

  if (authLoading) return null;

  const exceededBudgets = budgets.filter((b) => b.percentage >= 100);
  const warningBudgets = budgets.filter((b) => b.percentage >= 90 && b.percentage < 100);

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Budget Management" />

        <main className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-100">Monthly Category Budgets</h2>
              <p className="text-xs text-slate-400 mt-1">Set monthly limits and track real-time spending progress</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Month/Year selector */}
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
                <select
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value, 10))}
                  className="bg-transparent text-slate-200 px-2 py-1 focus:outline-none"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m} className="bg-slate-900">
                      {new Date(2026, m - 1, 1).toLocaleString('default', { month: 'short' })}
                    </option>
                  ))}
                </select>
                <select
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value, 10))}
                  className="bg-transparent text-slate-200 px-2 py-1 focus:outline-none"
                >
                  {[2024, 2025, 2026, 2027].map((y) => (
                    <option key={y} value={y} className="bg-slate-900">
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all"
              >
                <Plus className="w-4 h-4" />
                Set Budget
              </button>
            </div>
          </div>

          {/* Alert Banners */}
          {exceededBudgets.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-start gap-3 shadow-lg">
              <AlertOctagon className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Budget Exceeded Alert!</p>
                <p className="mt-0.5 text-rose-300 font-normal">
                  You have exceeded 100% of your budget limit in {exceededBudgets.map(b => b.category?.name).join(', ')}.
                </p>
              </div>
            </div>
          )}

          {warningBudgets.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold flex items-start gap-3 shadow-lg">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Near Budget Limit Warning</p>
                <p className="mt-0.5 text-amber-300 font-normal">
                  You have reached over 90% of your limit in {warningBudgets.map(b => b.category?.name).join(', ')}.
                </p>
              </div>
            </div>
          )}

          {/* Budgets Grid */}
          {loading ? (
            <div className="py-16 flex items-center justify-center text-cyan-400">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : budgets.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center text-slate-400 border border-slate-800">
              <PieChart className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="font-bold text-slate-200 text-base">No Budgets Set</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Set monthly category budgets to keep your expenses organized and get automatic alert notifications.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold hover:bg-cyan-500/30 transition-all"
              >
                + Set Your First Budget
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {budgets.map((budget) => {
                const isExceeded = budget.percentage >= 100;
                const isWarning = budget.percentage >= 90 && budget.percentage < 100;

                let statusBadge = (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> On Track
                  </span>
                );

                if (isExceeded) {
                  statusBadge = (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                      <AlertOctagon className="w-3 h-3" /> Exceeded
                    </span>
                  );
                } else if (isWarning) {
                  statusBadge = (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Warning (90%+)
                    </span>
                  );
                }

                let barColor = 'bg-cyan-500';
                if (isExceeded) barColor = 'bg-rose-500';
                else if (isWarning) barColor = 'bg-amber-500';

                return (
                  <div key={budget.id} className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: budget.category?.color || '#38bdf8' }} />
                        <h4 className="font-bold text-slate-100 text-sm">{budget.category?.name}</h4>
                      </div>
                      {statusBadge}
                    </div>

                    <div>
                      <div className="flex items-baseline justify-between mb-1.5">
                        <span className="text-xs text-slate-400 font-medium">Spent: <strong className="text-slate-200">${budget.spent.toFixed(2)}</strong></span>
                        <span className="text-xs text-slate-400 font-medium">Limit: <strong className="text-slate-200">${budget.monthlyLimit.toFixed(2)}</strong></span>
                      </div>

                      {/* Progress Bar Container */}
                      <div className="w-full h-3 rounded-full bg-slate-900 border border-slate-800 overflow-hidden relative">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                          style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center mt-2 text-[11px] text-slate-400">
                        <span>{budget.percentage}% Used</span>
                        <span>
                          {budget.monthlyLimit - budget.spent >= 0
                            ? `$${(budget.monthlyLimit - budget.spent).toFixed(2)} remaining`
                            : `$${Math.abs(budget.monthlyLimit - budget.spent).toFixed(2)} over limit`}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex justify-end">
                      <button
                        onClick={() => handleDeleteBudget(budget.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-900 transition-colors"
                        title="Remove budget"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchBudgets}
        categories={categories}
        currentMonth={month}
        currentYear={year}
      />
    </div>
  );
}
