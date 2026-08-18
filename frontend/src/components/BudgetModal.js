'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import api from '../lib/api';

export default function BudgetModal({ isOpen, onClose, onSuccess, categories = [], currentMonth, currentYear }) {
  const [categoryId, setCategoryId] = useState('');
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [month, setMonth] = useState(currentMonth || new Date().getMonth() + 1);
  const [year, setYear] = useState(currentYear || new Date().getFullYear());

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (categories.length > 0) {
        setCategoryId(categories[0].id);
      }
      setMonthlyLimit('');
      setMonth(currentMonth || new Date().getMonth() + 1);
      setYear(currentYear || new Date().getFullYear());
      setError(null);
    }
  }, [isOpen, categories, currentMonth, currentYear]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!categoryId) {
      setError('Please select a category.');
      return;
    }

    if (!monthlyLimit || parseFloat(monthlyLimit) <= 0) {
      setError('Please enter a valid monthly limit amount.');
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/budgets', {
        categoryId,
        monthlyLimit: parseFloat(monthlyLimit),
        month: parseInt(month, 10),
        year: parseInt(year, 10)
      });

      setIsLoading(false);
      onSuccess();
      onClose();
    } catch (err) {
      setIsLoading(false);
      setError(err.response?.data?.error || 'Failed to save budget.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-card w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-700/60 relative">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <h3 className="text-lg font-bold text-slate-100">Set Category Budget</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            >
              <option value="" disabled>Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-slate-900 text-slate-100">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Limit ($) */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Monthly Limit ($)</label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="e.g. 500.00"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Month & Year Select */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m} className="bg-slate-900">
                    {new Date(2026, m - 1, 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y} className="bg-slate-900">
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-medium text-xs hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Set Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
