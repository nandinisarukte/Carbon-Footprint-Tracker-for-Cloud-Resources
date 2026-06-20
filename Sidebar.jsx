import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Cpu, 
  TrendingUp, 
  LogOut, 
  Leaf,
  ShieldAlert
} from 'lucide-react';

export default function Sidebar() {
  const { currentUser, logout, isMockAuth } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Cloud Resources', path: '/resources', icon: Cpu },
    { name: 'Optimizations', path: '/recommendations', icon: TrendingUp },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col min-h-screen border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
        <Leaf className="w-8 h-8 text-brand-400 stroke-[2.5]" />
        <div>
          <h1 className="font-extrabold text-lg leading-tight tracking-wider text-white">
            ECO<span className="text-brand-400">TRACK</span>
          </h1>
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-widest">
            Cloud Carbon
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/40'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                }`
              }
            >
              <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Mock Auth Warning */}
      {isMockAuth && (
        <div className="mx-4 my-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start space-x-2">
          <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-amber-400">Local Auth Mode</p>
            <p className="text-[10px] text-amber-300/80 leading-normal">
              Firebase credentials missing. Using local mock auth.
            </p>
          </div>
        </div>
      )}

      {/* User Section / Logout */}
      <div className="p-4 border-t border-slate-800 space-y-4">
        <div className="flex items-center space-x-3 px-2">
          <div className="w-9 h-9 bg-brand-500/20 text-brand-400 font-bold rounded-full flex items-center justify-center border border-brand-500/30 uppercase">
            {currentUser?.email?.substring(0, 2) || 'US'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate text-white">
              {currentUser?.displayName || currentUser?.email?.split('@')[0]}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {currentUser?.email}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-800/60 hover:bg-red-900/20 hover:text-red-400 border border-slate-700/50 hover:border-red-900/30 rounded-xl transition-all duration-200 text-slate-300 text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
