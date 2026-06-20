import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Loader2, 
  Cloud,
  Layers,
  MapPin,
  Clock,
  Database
} from 'lucide-react';

const REGIONS_BY_PROVIDER = {
  AWS: ['us-east-1', 'us-west-2'],
  Azure: ['westeurope'],
  GCP: ['us-central1']
};

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [provider, setProvider] = useState('AWS');
  const [region, setRegion] = useState('us-east-1');
  const [type, setType] = useState('Virtual Machine');
  const [cpuUsage, setCpuUsage] = useState(10);
  const [memoryUsage, setMemoryUsage] = useState(20);
  const [storageUsage, setStorageUsage] = useState(100);
  const [networkUsage, setNetworkUsage] = useState(50);
  const [runtimeHours, setRuntimeHours] = useState(24);

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/resources');
      setResources(response.data);
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError('Failed to fetch resources. Make sure API backend is online.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  // Update region automatically when provider changes
  useEffect(() => {
    const availableRegions = REGIONS_BY_PROVIDER[provider] || [];
    if (availableRegions.length > 0 && !availableRegions.includes(region)) {
      setRegion(availableRegions[0]);
    }
  }, [provider]);

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setProvider('AWS');
    setRegion('us-east-1');
    setType('Virtual Machine');
    setCpuUsage(10);
    setMemoryUsage(20);
    setStorageUsage(100);
    setNetworkUsage(50);
    setRuntimeHours(24);
    setModalOpen(true);
  };

  const openEditModal = (res) => {
    setEditingId(res.id);
    setName(res.name);
    setProvider(res.provider);
    setRegion(res.region);
    setType(res.type);
    setCpuUsage(parseFloat(res.cpu_usage));
    setMemoryUsage(parseFloat(res.memory_usage));
    setStorageUsage(parseFloat(res.storage_usage));
    setNetworkUsage(parseFloat(res.network_usage));
    setRuntimeHours(parseFloat(res.runtime_hours));
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;

    try {
      await api.delete(`/resources/${id}`);
      setResources(resources.filter(r => r.id !== id));
    } catch (err) {
      console.error('Error deleting resource:', err);
      alert('Failed to delete resource');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert('Name is required');

    const payload = {
      name,
      provider,
      region,
      type,
      cpu_usage: Number(cpuUsage),
      memory_usage: Number(memoryUsage),
      storage_usage: Number(storageUsage),
      network_usage: Number(networkUsage),
      runtime_hours: Number(runtimeHours)
    };

    try {
      setSubmitting(true);
      if (editingId) {
        // Edit Mode
        const res = await api.put(`/resources/${editingId}`, payload);
        // Refresh list
        await fetchResources();
      } else {
        // Create Mode
        const res = await api.post('/resources', payload);
        // Refresh list
        await fetchResources();
      }
      setModalOpen(false);
    } catch (err) {
      console.error('Error submitting resource form:', err);
      alert(err.response?.data?.error || 'Failed to save resource details');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Cloud Resources
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Register and configure cloud resources to compute footprint analytics.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center space-x-2 px-5 py-3 bg-brand-600 hover:bg-brand-550 active:scale-[0.98] text-white font-bold rounded-2xl transition-all shadow-lg shadow-brand-900/25"
        >
          <Plus className="w-5 h-5" />
          <span>Add Resource</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-2xl font-medium">
          {error}
        </div>
      )}

      {/* Main content grid or table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          <p className="text-slate-400 text-sm">Loading resources...</p>
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl space-y-4">
          <p className="text-slate-400 text-medium">No resources found. Add resources to get started.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/85 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Provider & Region</th>
                  <th className="py-4 px-6">Type</th>
                  <th className="py-4 px-6">Usage Metrics</th>
                  <th className="py-4 px-6">Runtime</th>
                  <th className="py-4 px-6 text-right">Est. Carbon</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                {resources.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-800 dark:text-white">
                      {res.name}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                          <Cloud className="w-3.5 h-3.5 text-slate-400 mr-1" /> {res.provider}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 mr-1" /> {res.region}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-400 font-medium">
                      {res.type}
                    </td>
                    <td className="py-4 px-6">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        <span className="text-slate-400">CPU: <span className="font-semibold text-slate-700 dark:text-slate-200">{parseFloat(res.cpu_usage)}%</span></span>
                        <span className="text-slate-400">Memory: <span className="font-semibold text-slate-700 dark:text-slate-200">{parseFloat(res.memory_usage)}%</span></span>
                        <span className="text-slate-400">Storage: <span className="font-semibold text-slate-700 dark:text-slate-200">{parseFloat(res.storage_usage)} GB</span></span>
                        <span className="text-slate-400">Network: <span className="font-semibold text-slate-700 dark:text-slate-200">{parseFloat(res.network_usage)} GB</span></span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-medium">
                      <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1 text-slate-450" /> {parseFloat(res.runtime_hours)} hrs</span>
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-brand-600 dark:text-brand-400">
                      {parseFloat(res.carbon_emission || 0).toLocaleString()} <span className="text-[10px] font-medium text-slate-400">gCO2e</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => openEditModal(res)}
                          className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 rounded-xl transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(res.id)}
                          className="p-2 bg-slate-100 hover:bg-red-500/10 hover:text-red-500 dark:bg-slate-800 dark:hover:bg-red-950/20 dark:hover:text-red-400 text-slate-600 dark:text-slate-350 rounded-xl transition-all"
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
        </div>
      )}

      {/* CRUD Dialog Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-fade-in">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingId ? 'Edit Cloud Resource' : 'Add New Cloud Resource'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-300 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Resource Name */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    Resource Name
                  </label>
                  <input
                    id="resource-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="production-db-instance"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 focus:border-brand-500 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none transition-all"
                  />
                </div>

                {/* Resource Type */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    Resource Type
                  </label>
                  <select
                    id="resource-type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 focus:border-brand-500 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none transition-all"
                  >
                    <option value="Virtual Machine">Virtual Machine (EC2/VM)</option>
                    <option value="Database">Relational Database (RDS/CloudSQL)</option>
                    <option value="Storage Instance">Object Storage Bucket</option>
                    <option value="Kubernetes Node">Kubernetes Worker Node</option>
                  </select>
                </div>

                {/* Provider */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    Cloud Provider
                  </label>
                  <select
                    id="resource-provider"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 focus:border-brand-500 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none transition-all"
                  >
                    <option value="AWS">AWS</option>
                    <option value="Azure">Azure</option>
                    <option value="GCP">GCP</option>
                  </select>
                </div>

                {/* Region */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    Region (Includes Carbon Intensity)
                  </label>
                  <select
                    id="resource-region"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 focus:border-brand-500 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none transition-all"
                  >
                    {(REGIONS_BY_PROVIDER[provider] || []).map((reg) => (
                      <option key={reg} value={reg}>{reg}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Resource usage sliders/numbers */}
              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-5">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center">
                  <Database className="w-4 h-4 mr-1 text-brand-555" /> Usage Metrics & Workload Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* CPU Usage */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 block">
                      CPU Usage: {cpuUsage}%
                    </label>
                    <input
                      id="resource-cpu"
                      type="range"
                      min="1"
                      max="100"
                      value={cpuUsage}
                      onChange={(e) => setCpuUsage(Number(e.target.value))}
                      className="w-full accent-brand-500 bg-slate-150 dark:bg-slate-800"
                    />
                  </div>

                  {/* Memory Usage */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 block">
                      Memory Usage: {memoryUsage}%
                    </label>
                    <input
                      id="resource-memory"
                      type="range"
                      min="1"
                      max="100"
                      value={memoryUsage}
                      onChange={(e) => setMemoryUsage(Number(e.target.value))}
                      className="w-full accent-brand-500 bg-slate-150 dark:bg-slate-800"
                    />
                  </div>

                  {/* Runtime Hours */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 block">
                      Runtime: {runtimeHours} hrs
                    </label>
                    <input
                      id="resource-runtime"
                      type="range"
                      min="1"
                      max="720"
                      value={runtimeHours}
                      onChange={(e) => setRuntimeHours(Number(e.target.value))}
                      className="w-full accent-brand-500 bg-slate-150 dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                  {/* Storage Usage */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 block">
                      Storage Allocation (GB)
                    </label>
                    <input
                      id="resource-storage"
                      type="number"
                      min="0"
                      value={storageUsage}
                      onChange={(e) => setStorageUsage(Math.max(0, Number(e.target.value)))}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  {/* Network Usage */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 block">
                      Estimated Network Outbound (GB)
                    </label>
                    <input
                      id="resource-network"
                      type="number"
                      min="0"
                      value={networkUsage}
                      onChange={(e) => setNetworkUsage(Math.max(0, Number(e.target.value)))}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-5 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-350 rounded-xl font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center space-x-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-550 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingId ? 'Save Changes' : 'Add Resource'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
