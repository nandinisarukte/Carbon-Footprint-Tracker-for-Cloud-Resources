import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { 
  Cpu, 
  Zap, 
  Leaf, 
  Calendar, 
  RefreshCw,
  Plus
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chartPeriod, setChartPeriod] = useState('daily'); // daily, weekly, monthly
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/emissions/dashboard');
      setData(response.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Could not retrieve analytics data. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">Calculating Carbon Footprint...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-500/10 border border-red-500/25 rounded-3xl text-center space-y-4 max-w-lg mx-auto mt-10">
        <p className="text-red-500 font-semibold">{error}</p>
        <button 
          onClick={fetchData}
          className="px-6 py-2.5 bg-red-650 hover:bg-red-600 text-white rounded-xl font-bold transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { summary, daily, weekly, monthly, byProvider, topPolluting } = data || {};
  const hasResources = summary && summary.totalResources > 0;

  // Pie chart coloring
  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

  // Select source for time series chart
  const timeData = chartPeriod === 'daily' ? daily : chartPeriod === 'weekly' ? weekly : monthly;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Upper Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Real-time analytics of your cloud computing carbon footprint.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-250 dark:border-slate-700/60 rounded-xl transition-all font-medium text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {!hasResources ? (
        <div className="flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl space-y-6 shadow-sm">
          <div className="w-16 h-16 bg-brand-500/10 border border-brand-500/30 rounded-2xl flex items-center justify-center text-brand-500">
            <Leaf className="w-8 h-8" />
          </div>
          <div className="max-w-md">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">No Cloud Resources Tracked Yet</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
              Add your virtual machines, databases, or object storage volumes to start estimating their energy consumption and carbon emissions.
            </p>
          </div>
          <button
            onClick={() => navigate('/resources')}
            className="flex items-center space-x-2 px-6 py-3 bg-brand-600 hover:bg-brand-550 text-white font-bold rounded-2xl transition-all shadow-lg shadow-brand-900/20"
          >
            <Plus className="w-5 h-5" />
            <span>Add First Resource</span>
          </button>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Resources */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl flex items-center justify-between shadow-sm relative overflow-hidden group">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Total Tracked Resources
                </span>
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white block">
                  {summary?.totalResources}
                </span>
              </div>
              <div className="w-14 h-14 bg-blue-500/10 dark:bg-blue-500/20 border border-blue-550/10 dark:border-blue-500/30 text-blue-500 dark:text-blue-400 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                <Cpu className="w-7 h-7" />
              </div>
            </div>

            {/* Total Energy */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl flex items-center justify-between shadow-sm relative overflow-hidden group">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Energy Consumption
                </span>
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white block">
                  {summary?.totalEnergy?.toFixed(2)} <span className="text-lg font-bold text-slate-400">kWh</span>
                </span>
              </div>
              <div className="w-14 h-14 bg-amber-500/10 dark:bg-amber-500/20 border border-amber-550/10 dark:border-amber-500/30 text-amber-550 dark:text-amber-400 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                <Zap className="w-7 h-7" />
              </div>
            </div>

            {/* Total Carbon */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl flex items-center justify-between shadow-sm relative overflow-hidden group">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Estimated CO₂e Footprint
                </span>
                <span className="text-4xl font-extrabold text-brand-600 dark:text-brand-400 block">
                  {(summary?.totalCarbon / 1000).toFixed(3)} <span className="text-lg font-bold text-slate-400">kg</span>
                </span>
              </div>
              <div className="w-14 h-14 bg-brand-500/10 dark:bg-brand-500/20 border border-brand-550/10 dark:border-brand-500/30 text-brand-600 dark:text-brand-400 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                <Leaf className="w-7 h-7" />
              </div>
            </div>
          </div>

          {/* Time Series Emissions Chart */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-brand-500" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Emissions Over Time</h3>
              </div>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/60 text-xs font-semibold">
                {['daily', 'weekly', 'monthly'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setChartPeriod(period)}
                    className={`px-3 py-1.5 rounded-lg transition-all capitalize ${
                      chartPeriod === period 
                        ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-750 dark:hover:text-slate-200'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="h-80 w-full">
              {timeData && timeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeData}>
                    <defs>
                      <linearGradient id="colorCarbon" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                    <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} label={{ value: 'CO2e (g)', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8', fontSize: 11 } }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                        borderColor: '#334155',
                        borderRadius: '16px',
                        color: '#f8fafc',
                        fontSize: '12px'
                      }} 
                    />
                    <Area type="monotone" dataKey="carbon" stroke="#22c55e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCarbon)" name="Carbon (gCO2e)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">
                  No historical emission records found.
                </div>
              )}
            </div>
          </div>

          {/* Lower Grid: Provider split + Top Polluters */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By Provider Chart */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl shadow-sm flex flex-col justify-between">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Emissions By Provider</h3>
              <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-6 h-60">
                <div className="w-1/2 h-full min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={byProvider}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="carbon"
                        nameKey="provider"
                      >
                        {byProvider?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                          borderColor: '#334155',
                          borderRadius: '16px',
                          color: '#f8fafc',
                          fontSize: '12px'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-3 text-sm">
                  {byProvider?.map((entry, index) => (
                    <div key={entry.provider} className="flex items-center space-x-3">
                      <span 
                        className="w-3 h-3 rounded-full shrink-0" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                      />
                      <span className="font-semibold text-slate-700 dark:text-slate-300 w-16">{entry.provider}</span>
                      <span className="text-slate-400">{(parseFloat(entry.carbon) / 1000).toFixed(2)} kg</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Polluters */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Top Polluting Resources</h3>
              <div className="h-60 w-full">
                {topPolluting && topPolluting.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topPolluting} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                      <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} width={80} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                          borderColor: '#334155',
                          borderRadius: '16px',
                          color: '#f8fafc',
                          fontSize: '12px'
                        }} 
                      />
                      <Bar dataKey="carbon" fill="#ef4444" radius={[0, 8, 8, 0]} name="Carbon (gCO2e)" barSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">
                    No polluting resources identified.
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
