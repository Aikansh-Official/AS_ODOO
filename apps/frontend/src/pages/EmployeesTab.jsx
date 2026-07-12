import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Filter, Shield, AlertTriangle, Edit, UserCheck, UserX } from 'lucide-react';
import { isLicenseExpired } from '../data/mockData';

export function EmployeesTab({ drivers, setDrivers }) {
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [form, setForm] = useState({ name: '', licenseNumber: '', licenseCategory: 'C', licenseExpiry: '', contactNumber: '', safetyScore: 80 });

  const filteredDrivers = drivers.filter(d => {
    if (filterStatus !== 'All' && d.status !== filterStatus) return false;
    if (filterCategory !== 'All' && d.licenseCategory !== filterCategory) return false;
    return true;
  });

  const inputClass = "w-full bg-surface-container border border-outline/20 rounded-xl px-4 py-3 text-sm text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary/50 transition-all";

  const handleAdd = (e) => {
    e.preventDefault();
    if (drivers.some(d => d.licenseNumber === form.licenseNumber)) { alert('License number already exists.'); return; }
    const id = `DRV-${String(drivers.length + 1).padStart(3, '0')}`;
    setDrivers([{ id, ...form, safetyScore: Number(form.safetyScore), status: 'Available' }, ...drivers]);
    setIsAdding(false);
    setForm({ name: '', licenseNumber: '', licenseCategory: 'C', licenseExpiry: '', contactNumber: '', safetyScore: 80 });
  };

  const handleEdit = (e) => {
    e.preventDefault();
    setDrivers(drivers.map(d => d.id === selectedDriver.id ? { ...d, ...form, safetyScore: Number(form.safetyScore) } : d));
    const updated = { ...selectedDriver, ...form, safetyScore: Number(form.safetyScore) };
    setSelectedDriver(updated);
    setIsEditing(false);
  };

  const toggleStatus = (newStatus) => {
    if (selectedDriver.status === 'On Trip') { alert('Cannot change status while on trip.'); return; }
    const updated = { ...selectedDriver, status: newStatus };
    setDrivers(drivers.map(d => d.id === selectedDriver.id ? updated : d));
    setSelectedDriver(updated);
  };

  const openEditForm = () => {
    setForm({ name: selectedDriver.name, licenseNumber: selectedDriver.licenseNumber, licenseCategory: selectedDriver.licenseCategory, licenseExpiry: selectedDriver.licenseExpiry, contactNumber: selectedDriver.contactNumber, safetyScore: selectedDriver.safetyScore });
    setIsEditing(true);
  };

  const statusColor = (s) => {
    const m = { 'Available': 'bg-tertiary/10 text-tertiary', 'On Trip': 'bg-primary/10 text-primary', 'Off Duty': 'bg-outline/20 text-on-surface-variant', 'Suspended': 'bg-error/10 text-error' };
    return m[s] || m['Available'];
  };

  const safetyColor = (score) => score >= 80 ? 'text-tertiary' : score >= 60 ? 'text-amber-600' : 'text-error';

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="w-full flex-1 flex flex-col h-full overflow-hidden">
      {selectedDriver ? (
        /* ── Detail ── */
        <div className="flex flex-col h-full bg-surface rounded-2xl border border-outline/10 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-outline/10 shrink-0">
            <div className="flex items-center gap-4">
              <button onClick={() => setSelectedDriver(null)} className="p-2 rounded-xl bg-surface-container border border-outline/10 hover:bg-surface-container-high transition-all cursor-pointer text-on-surface">←</button>
              <div>
                <h2 className="text-lg font-bold text-on-surface font-headline">{selectedDriver.name}</h2>
                <span className="text-xs text-on-surface-variant font-mono-label">{selectedDriver.id} • {selectedDriver.licenseCategory} License</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={openEditForm} className="p-2 rounded-xl bg-surface-container border border-outline/10 hover:bg-surface-container-high cursor-pointer"><Edit className="w-4 h-4 text-on-surface-variant" /></button>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColor(selectedDriver.status)}`}>{selectedDriver.status.toUpperCase()}</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InfoCard label="License Number" value={selectedDriver.licenseNumber} />
              <InfoCard label="License Category" value={selectedDriver.licenseCategory} />
              <InfoCard label="License Expiry" value={selectedDriver.licenseExpiry} badge={isLicenseExpired(selectedDriver) ? 'EXPIRED' : null} />
              <InfoCard label="Contact" value={selectedDriver.contactNumber} />
              <div className="p-4 rounded-xl bg-surface-container border border-outline/10 flex flex-col gap-2">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Safety Score</span>
                <div className="flex items-center gap-3">
                  <span className={`text-2xl font-bold ${safetyColor(selectedDriver.safetyScore)}`}>{selectedDriver.safetyScore}</span>
                  <div className="flex-1 h-2 bg-outline/10 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${selectedDriver.safetyScore >= 80 ? 'bg-tertiary' : selectedDriver.safetyScore >= 60 ? 'bg-amber-500' : 'bg-error'}`} style={{ width: `${selectedDriver.safetyScore}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {isLicenseExpired(selectedDriver) && (
              <div className="mt-5 p-3 rounded-xl bg-error/5 border border-error/15 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-error shrink-0" />
                <span className="text-xs text-error font-semibold">License expired on {selectedDriver.licenseExpiry}. This driver cannot be assigned to trips.</span>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 border-t border-outline/10 pt-5">
              <span className="text-xs font-bold text-on-surface uppercase tracking-wider mb-1">Quick Actions</span>
              {selectedDriver.status !== 'On Trip' && (
                <div className="grid grid-cols-2 gap-3">
                  {selectedDriver.status !== 'Available' && <button onClick={() => toggleStatus('Available')} className="p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 bg-tertiary/10 text-tertiary border border-tertiary/15 hover:bg-tertiary/20 cursor-pointer"><UserCheck className="w-4 h-4" /> Set Available</button>}
                  {selectedDriver.status !== 'Off Duty' && <button onClick={() => toggleStatus('Off Duty')} className="p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 bg-surface-container border border-outline/10 text-on-surface-variant hover:bg-surface-container-high cursor-pointer">Set Off Duty</button>}
                  {selectedDriver.status !== 'Suspended' && <button onClick={() => toggleStatus('Suspended')} className="p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 bg-error/10 text-error border border-error/15 hover:bg-error/20 cursor-pointer"><UserX className="w-4 h-4" /> Suspend</button>}
                </div>
              )}
              {selectedDriver.status === 'On Trip' && <div className="p-3 rounded-xl bg-primary/5 border border-primary/15 text-center text-xs font-semibold text-primary">Currently on an active trip. Complete or cancel the trip to change status.</div>}
            </div>
          </div>
        </div>
      ) : (
        /* ── List ── */
        <div className="flex flex-col h-full">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5 shrink-0">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-surface-container border border-outline/10 rounded-xl px-3 py-2">
                <Filter className="w-4 h-4 text-on-surface-variant" />
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-transparent text-xs text-on-surface font-semibold focus:outline-none appearance-none pr-4 cursor-pointer">
                  <option value="All">All Statuses</option>
                  <option value="Available">Available</option>
                  <option value="On Trip">On Trip</option>
                  <option value="Off Duty">Off Duty</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
              <div className="flex items-center gap-2 bg-surface-container border border-outline/10 rounded-xl px-3 py-2">
                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="bg-transparent text-xs text-on-surface font-semibold focus:outline-none appearance-none pr-4 cursor-pointer">
                  <option value="All">All Categories</option>
                  <option value="B">Cat B</option>
                  <option value="C">Cat C</option>
                  <option value="CE">Cat CE</option>
                  <option value="D">Cat D</option>
                </select>
              </div>
            </div>
            <button onClick={() => setIsAdding(true)} className="px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold flex items-center gap-2 shadow-md hover:opacity-90 cursor-pointer"><Plus className="w-4 h-4" /> Add Driver</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 overflow-y-auto pb-6">
            {filteredDrivers.map(d => (
              <div key={d.id} onClick={() => setSelectedDriver(d)} className="p-5 rounded-2xl bg-surface border border-outline/10 hover:border-outline/25 hover:shadow-md transition-all cursor-pointer group flex flex-col gap-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 px-3 py-1.5 rounded-bl-xl bg-surface-container border-b border-l border-outline/10">
                  <span className={`text-[9px] font-bold ${safetyColor(d.safetyScore)} font-mono-label flex items-center gap-1`}><Shield className="w-2.5 h-2.5" /> {d.safetyScore}</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">{d.name}</h3>
                  <span className="text-[10px] font-mono-label text-on-surface-variant block mt-1">{d.id} • Cat {d.licenseCategory}</span>
                </div>
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-outline/5">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${statusColor(d.status)}`}>{d.status.toUpperCase()}</span>
                  {isLicenseExpired(d) && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-error/10 text-error">EXPIRED</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Modal */}
      <ModalShell open={isAdding} onClose={() => setIsAdding(false)} title="Register New Driver">
        <form onSubmit={handleAdd} className="p-5 flex flex-col gap-4">
          <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full Name" className={inputClass} />
          <input type="text" required value={form.licenseNumber} onChange={e => setForm({ ...form, licenseNumber: e.target.value })} placeholder="License Number" className={inputClass} />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.licenseCategory} onChange={e => setForm({ ...form, licenseCategory: e.target.value })} className={inputClass}>
              <option value="B">Category B</option>
              <option value="C">Category C</option>
              <option value="CE">Category CE</option>
              <option value="D">Category D</option>
            </select>
            <input type="date" required value={form.licenseExpiry} onChange={e => setForm({ ...form, licenseExpiry: e.target.value })} className={inputClass} />
          </div>
          <input type="tel" required value={form.contactNumber} onChange={e => setForm({ ...form, contactNumber: e.target.value })} placeholder="Contact Number" className={inputClass} />
          <input type="number" required min="0" max="100" value={form.safetyScore} onChange={e => setForm({ ...form, safetyScore: e.target.value })} placeholder="Safety Score (0-100)" className={inputClass} />
          <button type="submit" className="w-full py-3 mt-1 rounded-xl bg-primary text-on-primary text-sm font-bold hover:opacity-90 cursor-pointer">Register Driver</button>
        </form>
      </ModalShell>

      {/* Edit Modal */}
      <ModalShell open={isEditing} onClose={() => setIsEditing(false)} title={`Edit ${selectedDriver?.name}`}>
        <form onSubmit={handleEdit} className="p-5 flex flex-col gap-4">
          <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full Name" className={inputClass} />
          <input type="text" required value={form.licenseNumber} onChange={e => setForm({ ...form, licenseNumber: e.target.value })} placeholder="License Number" className={inputClass} />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.licenseCategory} onChange={e => setForm({ ...form, licenseCategory: e.target.value })} className={inputClass}>
              <option value="B">Category B</option>
              <option value="C">Category C</option>
              <option value="CE">Category CE</option>
              <option value="D">Category D</option>
            </select>
            <input type="date" required value={form.licenseExpiry} onChange={e => setForm({ ...form, licenseExpiry: e.target.value })} className={inputClass} />
          </div>
          <input type="tel" required value={form.contactNumber} onChange={e => setForm({ ...form, contactNumber: e.target.value })} placeholder="Contact Number" className={inputClass} />
          <input type="number" required min="0" max="100" value={form.safetyScore} onChange={e => setForm({ ...form, safetyScore: e.target.value })} placeholder="Safety Score (0-100)" className={inputClass} />
          <button type="submit" className="w-full py-3 mt-1 rounded-xl bg-primary text-on-primary text-sm font-bold hover:opacity-90 cursor-pointer">Save Changes</button>
        </form>
      </ModalShell>
    </motion.div>
  );
}

function InfoCard({ label, value, badge }) {
  return (
    <div className="p-4 rounded-xl bg-surface-container border border-outline/10 flex flex-col gap-1">
      <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-on-surface">{value}</span>
        {badge && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-error/10 text-error">{badge}</span>}
      </div>
    </div>
  );
}

function ModalShell({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-surface border border-outline/10 rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-outline/5">
              <h3 className="text-lg font-headline font-bold text-on-surface">{title}</h3>
              <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer p-1"><X className="w-5 h-5" /></button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
