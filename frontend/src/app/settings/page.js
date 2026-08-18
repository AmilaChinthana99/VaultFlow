'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Settings, 
  Tag, 
  Plus, 
  Trash2, 
  User, 
  ShieldCheck, 
  Palette, 
  Loader2,
  Check
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../lib/api';

const COLOR_OPTIONS = [
  '#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', 
  '#3b82f6', '#ef4444', '#ec4899', '#a855f7',
  '#14b8a6', '#6366f1', '#eab308', '#f97316'
];

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Category Form State
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else {
        fetchCategories();
      }
    }
  }, [authLoading, isAuthenticated, router, fetchCategories]);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter a category name.');
      return;
    }

    setAdding(true);
    try {
      await api.post('/categories', {
        name: name.trim(),
        color,
        icon: 'Tag'
      });
      setName('');
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create category.');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Delete this custom category?')) {
      try {
        await api.delete(`/categories/${id}`);
        fetchCategories();
      } catch (err) {
        console.error('Delete category error:', err);
      }
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Settings & Categories" />

        <main className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Preferences & Categories</h2>
            <p className="text-xs text-slate-400 mt-1">Manage user account profile and customize spending categories</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* User Profile Overview */}
            <div className="lg:col-span-1 glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base">{user?.name}</h3>
                  <p className="text-xs text-slate-400">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-slate-900/60 text-slate-300">
                  <span className="text-slate-400">Account Role</span>
                  <span className="font-semibold text-cyan-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Owner
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-slate-900/60 text-slate-300">
                  <span className="text-slate-400">Auth Token</span>
                  <span className="font-mono text-[10px] text-slate-400">JWT Protected</span>
                </div>
              </div>
            </div>

            {/* Category Management */}
            <div className="lg:col-span-2 space-y-6">
              {/* Add Custom Category Form */}
              <div className="glass-card p-6 rounded-2xl border border-slate-800">
                <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-cyan-400" />
                  Create Custom Category
                </h3>

                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
                    {error}
                  </div>
                )}

                <form onSubmit={handleAddCategory} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Subscriptions or Pets"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Color Accent</label>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {COLOR_OPTIONS.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setColor(c)}
                            className={`w-6 h-6 rounded-full transition-transform flex items-center justify-center ${
                              color === c ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'
                            }`}
                            style={{ backgroundColor: c }}
                          >
                            {color === c && <Check className="w-3 h-3 text-white" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={adding}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Category'}
                  </button>
                </form>
              </div>

              {/* Categories List */}
              <div className="glass-card p-6 rounded-2xl border border-slate-800">
                <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-cyan-400" />
                  Your Active Categories ({categories.length})
                </h3>

                {loading ? (
                  <div className="py-8 flex justify-center text-cyan-400">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {categories.map((cat) => (
                      <div key={cat.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: cat.color }} />
                          <div>
                            <p className="font-semibold text-slate-200 text-xs">{cat.name}</p>
                            <p className="text-[10px] text-slate-500">{cat.isDefault ? 'Default System Category' : 'Custom Category'}</p>
                          </div>
                        </div>

                        {!cat.isDefault && (
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                            title="Delete custom category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
