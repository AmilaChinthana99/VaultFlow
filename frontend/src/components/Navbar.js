'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  Wallet, 
  LayoutDashboard, 
  Receipt, 
  PieChart, 
  BarChart3, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', href: '/transactions', icon: Receipt },
  { name: 'Budgets', href: '/budgets', icon: PieChart },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Navbar({ title = 'Dashboard' }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-20 glass-card border-b border-slate-800 px-4 py-3 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-slate-400 hover:text-slate-200 p-1.5 rounded-lg bg-slate-800/60"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <h2 className="text-xl font-bold text-slate-100">{title}</h2>
      </div>

      {/* Quick user avatar */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-xs font-semibold text-slate-200">{user?.name}</span>
          <span className="text-[10px] text-slate-400">{user?.email}</span>
        </div>
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-cyan-500/20">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden fixed inset-x-0 top-[57px] bg-slate-950/95 backdrop-blur-xl border-b border-slate-800 p-4 space-y-2 shadow-2xl z-50">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 text-sm font-medium"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
