'use client';

import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import './globals.css';

export default function RootLayout({ children }) {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <html lang="en">
      <head>
        <title>VaultFlow - Personal Finance Management & Tracker</title>
        <meta name="description" content="Manage income, track expenses, visualize spending trends, set category budgets, and export financial data." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased selection:bg-cyan-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
