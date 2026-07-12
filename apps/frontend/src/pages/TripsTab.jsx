import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Filter, Play, Check, StopCircle, Navigation } from 'lucide-react';
import { LocationSearchInput } from '../utils/mapUtils';
import { isDriverAssignable } from '../data/mockData';

export function TripsTab({ trips, setTrips, trucks, setTrucks, drivers, setDrivers }) {
  const [filterStatus, setFilterStatus] = useState('All');
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({ source: '', sourceCoords: null, destination: '', destCoords: null, vehicleId: '', driverId: '', cargoWeight: '', plannedDistance: '', cargo: '' });
  const [formError, setFormError] = useState('');

  const filteredTrips = trips.filter(t => filterStatus === 'All' || t.status === filterStatus);

  const availableVehicles = trucks.filter(t => t.status === 'Available');
  const availableDrivers = drivers.filter(d => isDriverAssignable(d));

  const inputClass = "w-full bg-surface-container border border-outline/20 rounded-xl px-4 py-3 text-sm text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary/50 transition-all";

  const statusBadge = (s) => {
    const m = { 'Draft': 'bg-outline/20 text-on-surface-variant', 'Dispatched': 'bg-primary/10 text-primary', 'Completed': 'bg-tertiary/10 text-tertiary', 'Cancelled': 'bg-error/10 text-error' };
    return m[s] || m['Draft'];
  };

  const handleCreate = (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.sourceCoords) { setFormError('Select a valid source location from search.'); return; }
    if (!form.destCoords) { setFormError('Select a valid destination location from search.'); return; }
    const vehicle = trucks.find(t => t.id === form.vehicleId);
    if (vehicle && Number(form.cargoWeight) > vehicle.maxCapacity) { setFormError(`Cargo exceeds vehicle capacity (${vehicle.maxCapacity}kg).`); return; }

    const id = `TRP-${String(trips.length + 1).padStart(3, '0')}`;
    const newTrip = {
      id, vehicleId: form.vehicleId || null, driverId: form.driverId || null,
      source: form.source, sourceCoords: form.sourceCoords,
      destination: form.destination, destCoords: form.destCoords,
      cargoWeight: Number(form.cargoWeight), plannedDistance: Number(form.plannedDistance),
      cargo: form.cargo || 'General Freight', status: 'Draft',
      createdAt: new Date().toISOString().split('T')[0], dispatchedAt: null,
    };
    setTrips([newTrip, ...trips]);
    setIsCreating(false);
    setForm({ source: '', sourceCoords: null, destination: '', destCoords: null, vehicleId: '', driverId: '', cargoWeight: '', plannedDistance: '', cargo: '' });
  };

  const dispatchTrip = (trip) => {
    if (!trip.vehicleId || !trip.driverId) { alert('Assign a vehicle and driver before dispatching.'); return; }
    const vehicle = trucks.find(t => t.id === trip.vehicleId);
    const driver = drivers.find(d => d.id === trip.driverId);
    if (!vehicle || vehicle.status !== 'Available') { alert('Selected vehicle is not available.'); return; }
    if (!driver || !isDriverAssignable(driver)) { alert('Selected driver is not available.'); return; }

    setTrips(trips.map(t => t.id === trip.id ? { ...t, status: 'Dispatched', dispatchedAt: new Date().toISOString().split('T')[0] } : t));
    setTrucks(trucks.map(t => t.id === trip.vehicleId ? { ...t, status: 'On Trip', currentCargoWeight: trip.cargoWeight, driverId: driver.id, driver: driver.name, cargo: trip.cargo, destCity: trip.destination, destCoords: trip.destCoords, route: `${trip.source} -> ${trip.destination}`, speed: '45 mph', journeyProgress: 0 } : t));
    setDrivers(drivers.map(d => d.id === trip.driverId ? { ...d, status: 'On Trip' } : d));
  };

  const completeTrip = (trip) => {
    setTrips(trips.map(t => t.id === trip.id ? { ...t, status: 'Completed' } : t));
    setTrucks(trucks.map(t => t.id === trip.vehicleId ? { ...t, status: 'Available', currentCargoWeight: 0, driverId: null, driver: 'Unassigned', cargo: 'None', route: 'None', destCity: 'None', destCoords: null, speed: '0 mph', journeyProgress: 0 } : t));
    setDrivers(drivers.map(d => d.id === trip.driverId ? { ...d, status: 'Available' } : d));
  };

  const cancelTrip = (trip) => {
    if (!window.confirm('Cancel this trip?')) return;
    setTrips(trips.map(t => t.id === trip.id ? { ...t, status: 'Cancelled' } : t));
    if (trip.status === 'Dispatched') {
      setTrucks(trucks.map(t => t.id === trip.vehicleId ? { ...t, status: 'Available', currentCargoWeight: 0, driverId: null, driver: 'Unassigned', cargo: 'None', route: 'None', destCity: 'None', destCoords: null, speed: '0 mph', journeyProgress: 0 } : t));
      setDrivers(drivers.map(d => d.id === trip.driverId ? { ...d, status: 'Available' } : d));
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="w-full flex-1 flex flex-col h-full overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-surface-container border border-outline/10 rounded-xl px-3 py-2">
            <Filter className="w-4 h-4 text-on-surface-variant" />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-transparent text-xs text-on-surface font-semibold focus:outline-none appearance-none pr-4 cursor-pointer">
              <option value="All">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Dispatched">Dispatched</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <button onClick={() => setIsCreating(true)} className="px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold flex items-center gap-2 shadow-md hover:opacity-90 cursor-pointer"><Plus className="w-4 h-4" /> Create Trip</button>
      </div>

      <div className="overflow-y-auto flex-1 pb-6">
        <div className="rounded-2xl border border-outline/10 bg-surface overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-outline/10 bg-surface-container">
                <th className="px-4 py-3 text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Trip ID</th>
                <th className="px-4 py-3 text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Route</th>
                <th className="px-4 py-3 text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Vehicle</th>
                <th className="px-4 py-3 text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Driver</th>
                <th className="px-4 py-3 text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Cargo</th>
                <th className="px-4 py-3 text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Status</th>
                <th className="px-4 py-3 text-[10px] uppercase font-bold text-on-surface-variant tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrips.map(trip => {
                const vehicle = trucks.find(t => t.id === trip.vehicleId);
                const driver = drivers.find(d => d.id === trip.driverId);
                return (
                  <tr key={trip.id} className="border-b border-outline/5 hover:bg-surface-container-low transition-colors">
                    <td className="px-4 py-3 text-xs font-bold font-mono-label text-on-surface">{trip.id}</td>
                    <td className="px-4 py-3 text-xs text-on-surface-variant">{trip.source} → {trip.destination}</td>
                    <td className="px-4 py-3 text-xs text-on-surface">{vehicle?.name || '—'}</td>
                    <td className="px-4 py-3 text-xs text-on-surface">{driver?.name || '—'}</td>
                    <td className="px-4 py-3 text-xs text-on-surface-variant">{trip.cargo} ({trip.cargoWeight.toLocaleString()}kg)</td>
                    <td className="px-4 py-3"><span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${statusBadge(trip.status)}`}>{trip.status}</span></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {trip.status === 'Draft' && <button onClick={() => dispatchTrip(trip)} className="text-[10px] font-bold px-2 py-1 rounded bg-primary text-on-primary hover:opacity-90 cursor-pointer flex items-center gap-1"><Play className="w-3 h-3" /> Dispatch</button>}
                        {trip.status === 'Dispatched' && <button onClick={() => completeTrip(trip)} className="text-[10px] font-bold px-2 py-1 rounded bg-tertiary text-on-tertiary hover:opacity-90 cursor-pointer flex items-center gap-1"><Check className="w-3 h-3" /> Complete</button>}
                        {(trip.status === 'Draft' || trip.status === 'Dispatched') && <button onClick={() => cancelTrip(trip)} className="text-[10px] font-bold px-2 py-1 rounded bg-error/10 text-error hover:bg-error/20 cursor-pointer flex items-center gap-1"><StopCircle className="w-3 h-3" /> Cancel</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredTrips.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-xs text-on-surface-variant">No trips found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Trip Modal */}
      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => setIsCreating(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-surface border border-outline/10 rounded-2xl shadow-xl overflow-visible">
              <div className="flex items-center justify-between p-5 border-b border-outline/5">
                <h3 className="text-lg font-headline font-bold text-on-surface flex items-center gap-2"><Navigation className="w-5 h-5 text-primary" /> Create Trip</h3>
                <button onClick={() => setIsCreating(false)} className="text-on-surface-variant hover:text-on-surface cursor-pointer p-1"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreate} className="p-5 flex flex-col gap-4 overflow-visible">
                {formError && <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-xs font-bold">{formError}</div>}
                <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider -mb-2">Source</label>
                <LocationSearchInput onSelect={loc => { if (loc) setForm({ ...form, source: loc.name, sourceCoords: [loc.lat, loc.lon] }); else setForm({ ...form, source: '', sourceCoords: null }); }} />
                <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider -mb-2">Destination</label>
                <LocationSearchInput onSelect={loc => { if (loc) setForm({ ...form, destination: loc.name, destCoords: [loc.lat, loc.lon] }); else setForm({ ...form, destination: '', destCoords: null }); }} />
                <div className="grid grid-cols-2 gap-3">
                  <select value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })} className={inputClass}>
                    <option value="">Select Vehicle</option>
                    {availableVehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.id})</option>)}
                  </select>
                  <select value={form.driverId} onChange={e => setForm({ ...form, driverId: e.target.value })} className={inputClass}>
                    <option value="">Select Driver</option>
                    {availableDrivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" required value={form.cargoWeight} onChange={e => setForm({ ...form, cargoWeight: e.target.value })} placeholder="Cargo Weight (kg)" className={inputClass} />
                  <input type="number" required value={form.plannedDistance} onChange={e => setForm({ ...form, plannedDistance: e.target.value })} placeholder="Distance (km)" className={inputClass} />
                </div>
                <input type="text" value={form.cargo} onChange={e => setForm({ ...form, cargo: e.target.value })} placeholder="Cargo Description" className={inputClass} />
                <button type="submit" className="w-full py-3 mt-1 rounded-xl bg-primary text-on-primary text-sm font-bold hover:opacity-90 cursor-pointer">Create Trip</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
