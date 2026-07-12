import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ChevronLeft, Navigation, Wrench, ShieldAlert, Zap, Droplet, MapPin, Play, StopCircle, RefreshCcw, Filter, DollarSign, Package, Check } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import { decodeGeohash, getTruckIcon, fetchOSRMRoute, LocationSearchInput } from '../utils/mapUtils';
import { isDriverAssignable } from '../data/mockData';

export function VehiclesTab({ trucks, setTrucks, drivers, setDrivers }) {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [routePath, setRoutePath] = useState([]);

  // Filters
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterRegion, setFilterRegion] = useState('All');

  // Modals
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ name: '', licenseNumber: '', type: 'ICE', maxCapacity: '', acquisitionCost: '' });

  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [dispatchData, setDispatchData] = useState({ driverId: '', cargoWeight: '', cargo: '', destCity: '', destCoords: null });
  const [dispatchError, setDispatchError] = useState('');

  const [completeTripModalOpen, setCompleteTripModalOpen] = useState(false);
  const [completeTripData, setCompleteTripData] = useState({ odometer: '', fuelConsumed: '' });

  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);
  const [maintenanceReason, setMaintenanceReason] = useState('');

  // Fetch route for selected vehicle
  useEffect(() => {
    if (!selectedVehicle || selectedVehicle.status !== 'On Trip') { setRoutePath([]); return; }
    let alive = true;
    const start = decodeGeohash(selectedVehicle.geohash);
    const end = selectedVehicle.destCoords || [start[0] + 1, start[1] + 1];
    fetchOSRMRoute(start, end).then(p => { if (alive) setRoutePath(p); });
    return () => { alive = false; };
  }, [selectedVehicle]);

  const uniqueRegions = ['All', ...new Set(trucks.map(t => t.city))];
  const filteredTrucks = trucks.filter(t => {
    if (filterType !== 'All' && t.type !== filterType) return false;
    if (filterStatus !== 'All' && t.status !== filterStatus) return false;
    if (filterRegion !== 'All' && t.city !== filterRegion) return false;
    return true;
  });

  const availableDrivers = drivers.filter(d => isDriverAssignable(d));
  const capacityPercent = selectedVehicle ? Math.round((selectedVehicle.currentCargoWeight / selectedVehicle.maxCapacity) * 100) : 0;

  // ─── Handlers ───
  const handleAddVehicle = (e) => {
    e.preventDefault();
    if (trucks.some(t => t.licenseNumber === newVehicle.licenseNumber)) { alert(`Registration number ${newVehicle.licenseNumber} already exists.`); return; }
    const id = `TRK-${Math.floor(1000 + Math.random() * 9000)}`;
    setTrucks([{ ...newVehicle, id, maxCapacity: Number(newVehicle.maxCapacity), acquisitionCost: Number(newVehicle.acquisitionCost), driver: 'Unassigned', driverId: null, geohash: '9q5cs', city: 'Headquarters', status: 'Available', speed: '0 mph', cargo: 'None', currentCargoWeight: 0, fuelLevel: 100, odometer: 0, journeyProgress: 0, route: 'None', destCity: 'None', destCoords: null }, ...trucks]);
    setIsAddingVehicle(false);
    setNewVehicle({ name: '', licenseNumber: '', type: 'ICE', maxCapacity: '', acquisitionCost: '' });
  };

  const handleDispatch = (e) => {
    e.preventDefault();
    setDispatchError('');
    const weight = Number(dispatchData.cargoWeight);
    if (weight > selectedVehicle.maxCapacity) { setDispatchError(`Cargo weight (${weight}kg) exceeds capacity (${selectedVehicle.maxCapacity}kg).`); return; }
    if (!dispatchData.destCoords) { setDispatchError('Please select a valid destination from search.'); return; }
    const driver = drivers.find(d => d.id === dispatchData.driverId);
    const updated = { ...selectedVehicle, status: 'On Trip', currentCargoWeight: weight, driverId: driver.id, driver: driver.name, cargo: dispatchData.cargo || 'General Freight', destCity: dispatchData.destCity, destCoords: dispatchData.destCoords, route: `HQ -> ${dispatchData.destCity}`, speed: '45 mph', journeyProgress: 0 };
    setTrucks(trucks.map(t => t.id === selectedVehicle.id ? updated : t));
    setDrivers(drivers.map(d => d.id === driver.id ? { ...d, status: 'On Trip' } : d));
    setSelectedVehicle(updated);
    setDispatchModalOpen(false);
    setDispatchData({ driverId: '', cargoWeight: '', cargo: '', destCity: '', destCoords: null });
  };

  const handleCompleteTrip = (e) => {
    e.preventDefault();
    const updated = { ...selectedVehicle, status: 'Available', currentCargoWeight: 0, driverId: null, driver: 'Unassigned', odometer: selectedVehicle.odometer + Number(completeTripData.odometer), fuelLevel: Math.max(0, selectedVehicle.fuelLevel - Number(completeTripData.fuelConsumed)), cargo: 'None', route: 'None', destCity: 'None', destCoords: null, speed: '0 mph', journeyProgress: 0 };
    setTrucks(trucks.map(t => t.id === selectedVehicle.id ? updated : t));
    setDrivers(drivers.map(d => d.id === selectedVehicle.driverId ? { ...d, status: 'Available' } : d));
    setSelectedVehicle(updated);
    setCompleteTripModalOpen(false);
    setCompleteTripData({ odometer: '', fuelConsumed: '' });
  };

  const handleCancelTrip = () => {
    if (!window.confirm('Cancel this trip?')) return;
    const updated = { ...selectedVehicle, status: 'Available', currentCargoWeight: 0, driverId: null, driver: 'Unassigned', cargo: 'None', route: 'None', destCity: 'None', destCoords: null, speed: '0 mph', journeyProgress: 0 };
    setTrucks(trucks.map(t => t.id === selectedVehicle.id ? updated : t));
    setDrivers(drivers.map(d => d.id === selectedVehicle.driverId ? { ...d, status: 'Available' } : d));
    setSelectedVehicle(updated);
  };

  const handleMaintenance = (e) => {
    e.preventDefault();
    const updated = { ...selectedVehicle, status: 'In Shop' };
    setTrucks(trucks.map(t => t.id === selectedVehicle.id ? updated : t));
    setSelectedVehicle(updated);
    setMaintenanceModalOpen(false);
    setMaintenanceReason('');
  };

  const handleCloseMaintenance = () => {
    const updated = { ...selectedVehicle, status: 'Available' };
    setTrucks(trucks.map(t => t.id === selectedVehicle.id ? updated : t));
    setSelectedVehicle(updated);
  };

  const handleRetire = () => {
    if (!window.confirm('Permanently retire this vehicle?')) return;
    const updated = { ...selectedVehicle, status: 'Retired' };
    setTrucks(trucks.map(t => t.id === selectedVehicle.id ? updated : t));
    setSelectedVehicle(updated);
  };

  const statusBadge = (status) => {
    const map = { 'On Trip': 'bg-primary/10 text-primary', 'In Shop': 'bg-amber-500/10 text-amber-600', 'Retired': 'bg-error/10 text-error', 'Available': 'bg-tertiary/10 text-tertiary' };
    return map[status] || map['Available'];
  };

  const inputClass = "w-full bg-surface-container border border-outline/20 rounded-xl px-4 py-3 text-sm text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary/50 transition-all";

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="w-full flex-1 flex flex-col h-full overflow-hidden">
      {selectedVehicle ? (
        /* ── Detail View ── */
        <div className="flex flex-col h-full bg-surface rounded-2xl border border-outline/10 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-outline/10 shrink-0">
            <div className="flex items-center gap-4">
              <button onClick={() => setSelectedVehicle(null)} className="p-2 rounded-xl bg-surface-container border border-outline/10 hover:bg-surface-container-high transition-all cursor-pointer text-on-surface"><ChevronLeft className="w-5 h-5" /></button>
              <div>
                <h2 className="text-lg font-bold text-on-surface font-headline">{selectedVehicle.name}</h2>
                <span className="text-xs text-on-surface-variant font-mono-label">{selectedVehicle.id} • {selectedVehicle.licenseNumber} • {selectedVehicle.type}</span>
              </div>
            </div>
            <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${statusBadge(selectedVehicle.status)}`}>{selectedVehicle.status.toUpperCase()}</span>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start h-full">
              {/* Left: Info + Map */}
              <div className="flex flex-col gap-5 h-full">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-surface-container border border-outline/10 flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Operator</span>
                    <span className="text-sm font-bold text-on-surface">{selectedVehicle.driver}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-container border border-outline/10 flex flex-col gap-1 text-right">
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider flex items-center justify-end gap-1"><DollarSign className="w-3 h-3" /> Cost</span>
                    <span className="text-sm font-bold text-tertiary">${selectedVehicle.acquisitionCost?.toLocaleString() || 0}</span>
                  </div>
                </div>
                <div className="flex-1 rounded-xl border border-outline/10 overflow-hidden relative min-h-[300px]">
                  {selectedVehicle.status === 'On Trip' ? (
                    <MapContainer center={decodeGeohash(selectedVehicle.geohash)} zoom={8} zoomControl={false} className="w-full h-full z-10 bg-surface-container-low">
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker position={decodeGeohash(selectedVehicle.geohash)} icon={getTruckIcon(selectedVehicle.status, true)} />
                      {routePath.length > 0 && <Polyline positions={routePath} color="#3b82f6" weight={4} opacity={0.85} />}
                    </MapContainer>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container border-2 border-dashed border-outline/10 rounded-xl">
                      <MapPin className="w-10 h-10 text-on-surface-variant mb-2 opacity-40" />
                      <span className="text-xs text-on-surface-variant font-medium">Vehicle is {selectedVehicle.status.toLowerCase()}.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Metrics + Actions */}
              <div className="flex flex-col gap-5">
                <div className="p-5 rounded-xl bg-surface-container border border-outline/10 flex flex-col gap-4">
                  <MetricBar label="Cargo Capacity" icon={<Package className="w-3.5 h-3.5" />} value={`${selectedVehicle.currentCargoWeight.toLocaleString()} / ${selectedVehicle.maxCapacity.toLocaleString()} kg (${capacityPercent}%)`} percent={capacityPercent} color="bg-tertiary" />
                  <MetricBar label="Energy" icon={selectedVehicle.type === 'EV' ? <Zap className="w-3.5 h-3.5" /> : <Droplet className="w-3.5 h-3.5" />} value={`${selectedVehicle.fuelLevel}%`} percent={selectedVehicle.fuelLevel} color={selectedVehicle.fuelLevel < 25 ? 'bg-error' : selectedVehicle.fuelLevel < 50 ? 'bg-amber-400' : 'bg-primary'} />
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Odometer</span>
                    <span className="text-xs font-bold text-on-surface font-mono-label">{selectedVehicle.odometer.toLocaleString()} km</span>
                  </div>
                  {selectedVehicle.status === 'On Trip' && <MetricBar label="Journey" icon={<Navigation className="w-3.5 h-3.5" />} value={`${selectedVehicle.journeyProgress}%`} percent={selectedVehicle.journeyProgress} color="bg-indigo-400" pulse />}
                </div>

                <div className="flex flex-col gap-3 mt-auto border-t border-outline/10 pt-5">
                  {selectedVehicle.status === 'Available' && (
                    <>
                      <button onClick={() => setDispatchModalOpen(true)} className="w-full p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 bg-primary text-on-primary hover:opacity-90 cursor-pointer"><Play className="w-4 h-4" /> Dispatch on Trip</button>
                      <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setMaintenanceModalOpen(true)} className="w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 bg-surface-container border border-outline/10 hover:bg-amber-500/10 hover:text-amber-600 text-on-surface cursor-pointer"><Wrench className="w-4 h-4" /> Send to Shop</button>
                        <button onClick={handleRetire} className="w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 bg-surface-container border border-outline/10 hover:bg-error/10 hover:text-error text-on-surface cursor-pointer"><ShieldAlert className="w-4 h-4" /> Retire</button>
                      </div>
                    </>
                  )}
                  {selectedVehicle.status === 'On Trip' && (
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setCompleteTripModalOpen(true)} className="w-full p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 bg-tertiary text-on-tertiary hover:opacity-90 cursor-pointer"><Check className="w-4 h-4" /> Complete</button>
                      <button onClick={handleCancelTrip} className="w-full p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 bg-error/10 text-error border border-error/20 hover:bg-error/20 cursor-pointer"><StopCircle className="w-4 h-4" /> Cancel</button>
                    </div>
                  )}
                  {selectedVehicle.status === 'In Shop' && (
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={handleCloseMaintenance} className="w-full p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 cursor-pointer"><RefreshCcw className="w-4 h-4" /> Close Maintenance</button>
                      <button onClick={handleRetire} className="w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 bg-surface-container border border-outline/10 hover:bg-error/10 hover:text-error text-on-surface cursor-pointer"><ShieldAlert className="w-4 h-4" /> Retire</button>
                    </div>
                  )}
                  {selectedVehicle.status === 'Retired' && <div className="w-full p-3 rounded-xl border border-error/20 bg-error/5 text-center"><span className="text-xs font-bold text-error">Permanently retired.</span></div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── List View ── */
        <div className="flex flex-col h-full">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5 shrink-0">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-surface-container border border-outline/10 rounded-xl px-3 py-2">
                <Filter className="w-4 h-4 text-on-surface-variant" />
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="bg-transparent text-xs text-on-surface font-semibold focus:outline-none appearance-none pr-4 cursor-pointer">
                  <option value="All">All Types</option>
                  <option value="ICE">ICE</option>
                  <option value="EV">EV</option>
                </select>
              </div>
              <div className="flex items-center gap-2 bg-surface-container border border-outline/10 rounded-xl px-3 py-2">
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-transparent text-xs text-on-surface font-semibold focus:outline-none appearance-none pr-4 cursor-pointer">
                  <option value="All">All Statuses</option>
                  <option value="Available">Available</option>
                  <option value="On Trip">On Trip</option>
                  <option value="In Shop">In Shop</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>
              <div className="flex items-center gap-2 bg-surface-container border border-outline/10 rounded-xl px-3 py-2">
                <select value={filterRegion} onChange={(e) => setFilterRegion(e.target.value)} className="bg-transparent text-xs text-on-surface font-semibold focus:outline-none appearance-none pr-4 cursor-pointer max-w-[120px] truncate">
                  {uniqueRegions.map(r => <option key={r} value={r}>{r === 'All' ? 'All Regions' : r}</option>)}
                </select>
              </div>
            </div>
            <button onClick={() => setIsAddingVehicle(true)} className="px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold flex items-center gap-2 shadow-md hover:opacity-90 cursor-pointer"><Plus className="w-4 h-4" /> Add Vehicle</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 overflow-y-auto pb-6">
            {filteredTrucks.length === 0 && (
              <div className="col-span-full py-12 flex flex-col items-center justify-center text-on-surface-variant">
                <Filter className="w-12 h-12 mb-3 opacity-20" />
                <span className="text-sm font-bold">No vehicles match filters</span>
                <button onClick={() => { setFilterType('All'); setFilterStatus('All'); setFilterRegion('All'); }} className="mt-3 text-xs text-primary hover:underline cursor-pointer">Clear</button>
              </div>
            )}
            {filteredTrucks.map(truck => (
              <div key={truck.id} onClick={() => setSelectedVehicle(truck)} className="p-5 rounded-2xl bg-surface border border-outline/10 hover:border-outline/25 hover:shadow-md transition-all cursor-pointer group flex flex-col gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-surface-container border-b border-l border-outline/10 px-3 py-1.5 rounded-bl-xl">
                  <span className="text-[9px] font-bold text-tertiary/80 font-mono-label flex items-center gap-1"><DollarSign className="w-2.5 h-2.5" /> {truck.acquisitionCost?.toLocaleString() || 0}</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">{truck.name}</h3>
                  <span className="text-[10px] font-mono-label text-on-surface-variant block mt-1">{truck.id} • {truck.type} • {truck.city}</span>
                </div>
                <div className="mt-auto grid grid-cols-2 gap-4 pt-4 border-t border-outline/5">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase font-bold text-on-surface-variant tracking-wider">Capacity</span>
                    <span className="text-xs font-bold text-on-surface">{truck.currentCargoWeight.toLocaleString()}/{truck.maxCapacity.toLocaleString()}kg</span>
                  </div>
                  <div className="flex flex-col gap-1 text-right relative">
                    <span className={`absolute -top-14 right-0 text-[9px] font-bold px-2 py-0.5 rounded-full ${statusBadge(truck.status)}`}>{truck.status.toUpperCase()}</span>
                    <span className="text-[9px] uppercase font-bold text-on-surface-variant tracking-wider">Odometer</span>
                    <span className="text-xs font-bold text-on-surface">{truck.odometer.toLocaleString()} km</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      <ModalShell open={isAddingVehicle} onClose={() => setIsAddingVehicle(false)} title="Register New Vehicle">
        <form onSubmit={handleAddVehicle} className="p-5 flex flex-col gap-4">
          <input type="text" required value={newVehicle.name} onChange={e => setNewVehicle({ ...newVehicle, name: e.target.value })} placeholder="Vehicle Name / Model" className={inputClass} />
          <input type="text" required value={newVehicle.licenseNumber} onChange={e => setNewVehicle({ ...newVehicle, licenseNumber: e.target.value })} placeholder="License Plate Number" className={inputClass} />
          <input type="number" required value={newVehicle.maxCapacity} onChange={e => setNewVehicle({ ...newVehicle, maxCapacity: e.target.value })} placeholder="Max Capacity (kg)" className={inputClass} />
          <input type="number" required value={newVehicle.acquisitionCost} onChange={e => setNewVehicle({ ...newVehicle, acquisitionCost: e.target.value })} placeholder="Acquisition Cost ($)" className={inputClass} />
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setNewVehicle({ ...newVehicle, type: 'ICE' })} className={`py-2.5 rounded-xl text-xs font-bold border cursor-pointer flex items-center justify-center gap-2 ${newVehicle.type === 'ICE' ? 'bg-primary/10 border-primary text-primary' : 'bg-surface-container border-outline/10 text-on-surface-variant'}`}><Droplet className="w-4 h-4" /> ICE</button>
            <button type="button" onClick={() => setNewVehicle({ ...newVehicle, type: 'EV' })} className={`py-2.5 rounded-xl text-xs font-bold border cursor-pointer flex items-center justify-center gap-2 ${newVehicle.type === 'EV' ? 'bg-primary/10 border-primary text-primary' : 'bg-surface-container border-outline/10 text-on-surface-variant'}`}><Zap className="w-4 h-4" /> EV</button>
          </div>
          <button type="submit" className="w-full py-3 mt-1 rounded-xl bg-primary text-on-primary text-sm font-bold hover:opacity-90 cursor-pointer">Register</button>
        </form>
      </ModalShell>

      <ModalShell open={dispatchModalOpen} onClose={() => setDispatchModalOpen(false)} title={`Dispatch ${selectedVehicle?.id}`} overflow>
        <form onSubmit={handleDispatch} className="p-5 flex flex-col gap-4 overflow-visible">
          {dispatchError && <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-xs font-bold">{dispatchError}</div>}
          <select required value={dispatchData.driverId} onChange={e => setDispatchData({ ...dispatchData, driverId: e.target.value })} className={inputClass}>
            <option value="" disabled>Select Driver</option>
            {availableDrivers.length === 0 && <option disabled>No valid drivers</option>}
            {availableDrivers.map(d => <option key={d.id} value={d.id}>{d.name} ({d.id})</option>)}
          </select>
          <LocationSearchInput onSelect={loc => { if (loc) setDispatchData({ ...dispatchData, destCity: loc.name, destCoords: [loc.lat, loc.lon] }); else setDispatchData({ ...dispatchData, destCity: '', destCoords: null }); }} />
          <input type="number" required value={dispatchData.cargoWeight} onChange={e => setDispatchData({ ...dispatchData, cargoWeight: e.target.value })} placeholder={`Cargo Weight (Max: ${selectedVehicle?.maxCapacity}kg)`} className={inputClass} />
          <input type="text" required value={dispatchData.cargo} onChange={e => setDispatchData({ ...dispatchData, cargo: e.target.value })} placeholder="Cargo Description" className={inputClass} />
          <button type="submit" disabled={availableDrivers.length === 0} className="w-full py-3 mt-1 rounded-xl bg-primary text-on-primary text-sm font-bold hover:opacity-90 cursor-pointer disabled:opacity-50">Confirm Dispatch</button>
        </form>
      </ModalShell>

      <ModalShell open={completeTripModalOpen} onClose={() => setCompleteTripModalOpen(false)} title="Complete Trip Log">
        <form onSubmit={handleCompleteTrip} className="p-5 flex flex-col gap-4">
          <div className="text-xs text-on-surface-variant mb-1">Finalizing trip for {selectedVehicle?.driver} on {selectedVehicle?.id}.</div>
          <input type="number" required value={completeTripData.odometer} onChange={e => setCompleteTripData({ ...completeTripData, odometer: e.target.value })} placeholder="Trip Distance (km)" className={inputClass} />
          <input type="number" required value={completeTripData.fuelConsumed} onChange={e => setCompleteTripData({ ...completeTripData, fuelConsumed: e.target.value })} placeholder="Fuel/Battery Consumed (%)" max="100" className={inputClass} />
          <button type="submit" className="w-full py-3 mt-1 rounded-xl bg-tertiary text-on-tertiary text-sm font-bold hover:opacity-90 cursor-pointer">Submit & Close Trip</button>
        </form>
      </ModalShell>

      <ModalShell open={maintenanceModalOpen} onClose={() => setMaintenanceModalOpen(false)} title="Log Maintenance">
        <form onSubmit={handleMaintenance} className="p-5 flex flex-col gap-4">
          <textarea required value={maintenanceReason} onChange={e => setMaintenanceReason(e.target.value)} placeholder="Maintenance Reason" rows="3" className={`${inputClass} resize-none`} />
          <button type="submit" className="w-full py-3 mt-1 rounded-xl bg-amber-500 text-white text-sm font-bold hover:opacity-90 cursor-pointer">Confirm Shop Order</button>
        </form>
      </ModalShell>
    </motion.div>
  );
}

// ─── Shared Sub-Components ───

function MetricBar({ label, icon, value, percent, color, pulse }) {
  return (
    <div>
      <div className="flex justify-between items-end mb-2">
        <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider flex items-center gap-1.5">{icon} {label}</span>
        <span className="text-xs font-bold text-on-surface">{value}</span>
      </div>
      <div className="h-2 w-full bg-outline/10 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full relative overflow-hidden`} style={{ width: `${percent}%` }}>
          {pulse && <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse" />}
        </div>
      </div>
    </div>
  );
}

function ModalShell({ open, onClose, title, children, overflow }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className={`relative w-full max-w-md bg-surface border border-outline/10 rounded-2xl shadow-xl ${overflow ? 'overflow-visible' : 'overflow-hidden'}`}>
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
