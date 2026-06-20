import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Sun, Moon } from 'lucide-react';

export default function Layout({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return true; // default to dark mode for carbon dashboard look
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-250">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header bar */}
        <header className="h-16 px-8 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between bg-white/80 dark:bg-slate-900/60 backdrop-blur-md z-10">
          <h2 className="text-lg font-bold tracking-tight text-slate-800 dark:text-white uppercase">
            Sustainability Analytics Console
          </h2>
          
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 transition-all duration-200 border border-slate-200 dark:border-slate-700/60 shadow-sm"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-500" />}
          </button>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-55/40 dark:bg-slate-950/20">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
