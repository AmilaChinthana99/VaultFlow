'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  Calendar,
  Tag
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import TransactionModal from '../../components/TransactionModal';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../lib/api';

export default function TransactionsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  
  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);

  const fetchTransactions = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        search,
        type: typeFilter,
        categoryId: categoryFilter,
        startDate,
        endDate
      };

      const [txRes, catRes] = await Promise.all([
        api.get('/transactions', { params }),
        api.get('/categories')
      ]);

      setTransactions(txRes.data.transactions || []);
      setPagination(txRes.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
      setCategories(catRes.data.categories || []);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, categoryFilter, startDate, endDate]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else {
        fetchTransactions(1);
      }
    }
  }, [authLoading, isAuthenticated, router, fetchTransactions]);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const response = await api.get('/transactions/export', {
        params: { search, type: typeFilter, categoryId: categoryFilter, startDate, endDate },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('CSV export error:', err);
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await api.delete(`/transactions/${id}`);
        fetchTransactions(pagination.page);
      } catch (err) {
        console.error('Failed to delete transaction:', err);
      }
    }
  };

  const handleOpenAdd = () => {
    setSelectedTx(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tx) => {
    setSelectedTx(tx);
    setIsModalOpen(true);
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Transaction Management" />

        <main className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Top Control Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-100">All Transactions</h2>
              <p className="text-xs text-slate-400 mt-1">Manage, filter, search and export income and expenses</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleExportCSV}
                disabled={exporting}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all disabled:opacity-50"
              >
                {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 text-cyan-400" />}
                Export CSV
              </button>

              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Transaction
              </button>
            </div>
          </div>

          {/* Filter & Search Toolbar */}
          <div className="glass-card p-4 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="">All Types (Income & Expense)</option>
                <option value="EXPENSE">Expense Only</option>
                <option value="INCOME">Income Only</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* End Date */}
            <div>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Transactions Table */}
          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            {loading ? (
              <div className="py-16 flex items-center justify-center text-cyan-400">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-16 text-center text-slate-500 text-sm">
                No transactions found matching your criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/80 uppercase text-[10px] text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="px-5 py-3.5">Type</th>
                      <th className="px-5 py-3.5">Category</th>
                      <th className="px-5 py-3.5">Description</th>
                      <th className="px-5 py-3.5">Date</th>
                      <th className="px-5 py-3.5 text-right">Amount</th>
                      <th className="px-5 py-3.5 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            tx.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tx.category?.color || '#38bdf8' }} />
                            <span className="font-semibold text-slate-200">{tx.category?.name || 'Uncategorized'}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-300 max-w-xs truncate">{tx.description || '-'}</td>
                        <td className="px-5 py-4 text-slate-400">
                          {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className={`px-5 py-4 text-right font-extrabold text-sm ${tx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {tx.type === 'INCOME' ? '+' : '-'}${tx.amount.toFixed(2)}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenEdit(tx)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(tx.id)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-rose-400 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            <div className="px-5 py-4 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Page <span className="font-bold text-slate-200">{pagination.page}</span> of <span className="font-bold text-slate-200">{pagination.totalPages}</span> ({pagination.total} total)
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => fetchTransactions(pagination.page - 1)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:hover:bg-slate-800 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchTransactions(pagination.page + 1)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:hover:bg-slate-800 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchTransactions(pagination.page)}
        initialData={selectedTx}
        categories={categories}
      />
    </div>
  );
}
