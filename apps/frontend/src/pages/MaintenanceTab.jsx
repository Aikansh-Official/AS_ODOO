import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Filter, Wrench, Check } from 'lucide-react';

export function MaintenanceTab({ maintenance, setMaintenance, trucks, setTrucks }) {
  const [isAdding, setIsAdding] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [form, setForm] = useState({ vehicleId: '', type: 'Scheduled', description: '', cost: '' });

  const filteredRecords = maintenance.filter(r => filterStatus === 'All' || r.status === filterStatus);
  // Only non-retired vehicles can go to shop
  const eligibleVehicles = trucks.filter(t => t.status !== 'Retired' && t.status !== 'In Shop');

  const inputClass = "w-full bg-surface-container border border-outline/20 rounded-xl px-4 py-3 text-sm text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary/50 transition-all";

  const handleAdd = (e) => {
    e.preventDefault();
    const id = `MNT-${String(maintenance.length + 1).padStart(3, '0')}`;
    const newRecord = { id, vehicleId: form.vehicleId, type: form.type, description: form.description, cost: Number(form.cost), date: new Date().toISOString().split('T')[0], status: 'Open' };
    setMaintenance([newRecord, ...maintenance]);
    // Auto-set vehicle to In Shop
    setTrucks(trucks.map(t => t.id === form.vehicleId ? { ...t, status: 'In Shop' } : t));
    setIsAdding(false);
    setForm({ vehicleId: '', type: 'Scheduled', description: '', cost: '' });
  };

  const closeRecord = (record) => {
    setMaintenance(maintenance.map(r => r.id === record.id ? { ...r, status: 'Closed' } : r));
    // Only restore to Available if vehicle isn't retired and no other open records exist
    const otherOpen = maintenance.filter(r => r.vehicleId === record.vehicleId && r.id !== record.id && r.status === 'Open');
    if (otherOpen.length === 0) {
      const vehicle = trucks.find(t => t.id === record.vehicleId);
      if (vehicle && vehicle.status !== 'Retired') {
        setTrucks(trucks.map(t => t.id === record.vehicleId ? { ...t, status: 'Available' } : t));
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="w-full flex-1 flex flex-col h-full overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-surface-container border border-outline/10 rounded-xl px-3 py-2">
            <Filter className="w-4 h-4 text-on-surface-variant" />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-transparent text-xs text-on-surface font-semibold focus:outline-none appearance-none pr-4 cursor-pointer">
              <option value="All">All Records</option>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
        <button onClick={() => setIsAdding(true)} className="px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold flex items-center gap-2 shadow-md hover:opacity-90 cursor-pointer"><Plus className="w-4 h-4" /> New Record</button>
      </div>

      <div className="overflow-y-auto flex-1 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRecords.map(record => {
            const vehicle = trucks.find(t => t.id === record.vehicleId);
            return (
              <div key={record.id} className="p-5 rounded-2xl bg-surface border border-outline/10 shadow-sm flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono-label text-on-surface">{record.id}</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${record.status === 'Open' ? 'bg-amber-500/10 text-amber-600' : 'bg-tertiary/10 text-tertiary'}`}>{record.status}</span>
                </div>
                <div>
                  <span className="text-sm font-bold text-on-surface">{vehicle?.name || record.vehicleId}</span>
                  <span className="block text-[10px] text-on-surface-variant mt-1">{record.type} • {record.date}</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">{record.description}</p>
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-outline/5">
                  <span className="text-sm font-bold text-error font-mono-label">₹{record.cost.toLocaleString()}</span>
                  {record.status === 'Open' && (
                    <button onClick={() => closeRecord(record)} className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-tertiary text-on-tertiary hover:opacity-90 cursor-pointer flex items-center gap-1"><Check className="w-3 h-3" /> Close</button>
                  )}
                </div>
              </div>
            );
          })}
          {filteredRecords.length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-on-surface-variant">
              <Wrench className="w-12 h-12 mb-3 opacity-20" />
              <span className="text-sm font-bold">No maintenance records found.</span>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => setIsAdding(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-surface border border-outline/10 rounded-2xl shadow-xl overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-outline/5">
                <h3 className="text-lg font-headline font-bold text-on-surface flex items-center gap-2"><Wrench className="w-5 h-5 text-amber-500" /> New Maintenance Record</h3>
                <button onClick={() => setIsAdding(false)} className="text-on-surface-variant hover:text-on-surface cursor-pointer p-1"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAdd} className="p-5 flex flex-col gap-4">
                <select required value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })} className={inputClass}>
                  <option value="" disabled>Select Vehicle</option>
                  {eligibleVehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.id})</option>)}
                </select>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className={inputClass}>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Unscheduled">Unscheduled</option>
                  <option value="Repair">Repair</option>
                </select>
                <textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description of work..." rows="3" className={`${inputClass} resize-none`} />
                <input type="number" required value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} placeholder="Estimated Cost (₹)" className={inputClass} />
                <button type="submit" className="w-full py-3 mt-1 rounded-xl bg-amber-500 text-white text-sm font-bold hover:opacity-90 cursor-pointer">Create Record</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
