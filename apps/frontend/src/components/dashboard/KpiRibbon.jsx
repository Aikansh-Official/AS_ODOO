import React from 'react';

export function KpiRibbon({ trucks, drivers, trips = [] }) {
  const kpiActiveVehicles = trucks.filter(t => t.status === 'On Trip').length;
  const kpiAvailableVehicles = trucks.filter(t => t.status === 'Available').length;
  const kpiVehiclesInShop = trucks.filter(t => t.status === 'In Shop').length;
  const kpiDriversOnDuty = drivers.filter(d => d.status === 'On Trip').length;
  const totalOperational = trucks.filter(t => t.status !== 'Retired').length;
  const fleetUtilPercent = totalOperational > 0 ? Math.round((kpiActiveVehicles / totalOperational) * 100) : 0;
  const kpiPendingTrips = trips.filter(t => t.status === 'Draft' || t.status === 'draft').length;

  const cards = [
    { label: 'Active Vehicles', value: kpiActiveVehicles, color: 'text-primary' },
    { label: 'Available', value: kpiAvailableVehicles, color: 'text-tertiary' },
    { label: 'In Shop', value: kpiVehiclesInShop, color: 'text-amber-500' },
    { label: 'Active Trips', value: kpiActiveVehicles, color: 'text-on-surface' },
    { label: 'Pending Trips', value: kpiPendingTrips, color: 'text-on-surface-variant' },
    { label: 'Drivers On Duty', value: kpiDriversOnDuty, color: 'text-indigo-500' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 w-full shrink-0">
      {cards.map(c => (
        <div key={c.label} className="p-4 rounded-2xl bg-surface border border-outline/10 flex flex-col items-center justify-center text-center shadow-sm">
          <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block mb-1">{c.label}</span>
          <span className={`text-2xl font-bold ${c.color}`}>{c.value}</span>
        </div>
      ))}
      <div className="p-4 rounded-2xl bg-primary/8 border border-primary/15 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-sm">
        <div className="absolute bottom-0 left-0 h-1 bg-primary transition-all" style={{ width: `${fleetUtilPercent}%` }} />
        <span className="text-[10px] uppercase font-bold text-primary tracking-wider block mb-1">Fleet Util</span>
        <span className="text-2xl font-bold text-primary">{fleetUtilPercent}%</span>
      </div>
    </div>
  );
}
