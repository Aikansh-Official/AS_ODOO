import React from 'react';
import { motion } from 'framer-motion';
import { Download, BarChart3, TrendingUp, DollarSign, Fuel } from 'lucide-react';

export function ReportsTab({ trucks, fuelLogs, maintenance, expenses, drivers }) {
  // Compute per-vehicle analytics
  const analytics = trucks.filter(t => t.status !== 'Retired').map(t => {
    const vFuelLogs = fuelLogs.filter(f => f.vehicleId === t.id);
    const vMaint = maintenance.filter(m => m.vehicleId === t.id);
    const vExpenses = expenses.filter(e => e.vehicleId === t.id);

    const totalFuelCost = vFuelLogs.reduce((s, f) => s + f.cost, 0);
    const totalFuelLiters = vFuelLogs.reduce((s, f) => s + f.liters, 0);
    const totalMaintCost = vMaint.reduce((s, m) => s + m.cost, 0);
    const totalExpenseCost = vExpenses.reduce((s, e) => s + e.amount, 0);
    const totalOpsCost = totalFuelCost + totalMaintCost + totalExpenseCost;

    // Fuel efficiency: Distance / Fuel (km/L). Use odometer as proxy for total distance.
    const fuelEfficiency = totalFuelLiters > 0 ? (t.odometer / totalFuelLiters).toFixed(1) : '—';

    // Revenue is mocked as a function of odometer (e.g., $2/km)
    const estimatedRevenue = t.odometer * 2;
    const roi = t.acquisitionCost > 0 ? (((estimatedRevenue - totalOpsCost) / t.acquisitionCost) * 100).toFixed(1) : '—';

    return { ...t, totalFuelCost, totalFuelLiters, totalMaintCost, totalExpenseCost, totalOpsCost, fuelEfficiency, estimatedRevenue, roi };
  });

  // Fleet-wide KPIs
  const totalOperational = trucks.filter(t => t.status !== 'Retired').length;
  const activeVehicles = trucks.filter(t => t.status === 'On Trip').length;
  const fleetUtil = totalOperational > 0 ? ((activeVehicles / totalOperational) * 100).toFixed(0) : 0;
  const totalOpsFleet = analytics.reduce((s, a) => s + a.totalOpsCost, 0);
  const avgFuelEfficiency = analytics.filter(a => a.fuelEfficiency !== '—').length > 0
    ? (analytics.filter(a => a.fuelEfficiency !== '—').reduce((s, a) => s + parseFloat(a.fuelEfficiency), 0) / analytics.filter(a => a.fuelEfficiency !== '—').length).toFixed(1)
    : '—';

  const exportCSV = () => {
    const headers = ['Vehicle ID', 'Name', 'Type', 'Odometer (km)', 'Fuel Cost ($)', 'Fuel (L)', 'Fuel Efficiency (km/L)', 'Maintenance ($)', 'Expenses ($)', 'Total Ops ($)', 'Acquisition ($)', 'Est Revenue ($)', 'ROI (%)'];
    const rows = analytics.map(a => [a.id, a.name, a.type, a.odometer, a.totalFuelCost, a.totalFuelLiters, a.fuelEfficiency, a.totalMaintCost, a.totalExpenseCost, a.totalOpsCost, a.acquisitionCost, a.estimatedRevenue, a.roi]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fleet_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const kpiCards = [
    { label: 'Fleet Utilization', value: `${fleetUtil}%`, icon: <TrendingUp className="w-5 h-5" />, color: 'text-primary' },
    { label: 'Avg Fuel Efficiency', value: avgFuelEfficiency !== '—' ? `${avgFuelEfficiency} km/L` : '—', icon: <Fuel className="w-5 h-5" />, color: 'text-tertiary' },
    { label: 'Total Ops Cost', value: `$${totalOpsFleet.toLocaleString()}`, icon: <DollarSign className="w-5 h-5" />, color: 'text-error' },
    { label: 'Active Drivers', value: drivers.filter(d => d.status === 'On Trip').length, icon: <BarChart3 className="w-5 h-5" />, color: 'text-indigo-500' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="w-full flex-1 flex flex-col h-full overflow-hidden">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 shrink-0">
        {kpiCards.map(c => (
          <div key={c.label} className="p-5 rounded-2xl bg-surface border border-outline/10 shadow-sm flex items-center gap-4">
            <div className={`h-10 w-10 rounded-xl bg-surface-container flex items-center justify-center ${c.color}`}>{c.icon}</div>
            <div>
              <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block">{c.label}</span>
              <span className={`text-xl font-bold ${c.color}`}>{c.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Export Button */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <span className="text-xs font-bold text-on-surface uppercase tracking-wider">Per-Vehicle Analytics</span>
        <button onClick={exportCSV} className="px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold flex items-center gap-2 shadow-md hover:opacity-90 cursor-pointer"><Download className="w-4 h-4" /> Export CSV</button>
      </div>

      {/* Analytics Table */}
      <div className="overflow-y-auto flex-1 pb-6">
        <div className="rounded-2xl border border-outline/10 bg-surface overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-outline/10 bg-surface-container">
                <th className="px-4 py-3 text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Vehicle</th>
                <th className="px-4 py-3 text-[10px] uppercase font-bold text-on-surface-variant tracking-wider text-right">Odometer</th>
                <th className="px-4 py-3 text-[10px] uppercase font-bold text-on-surface-variant tracking-wider text-right">Fuel Eff.</th>
                <th className="px-4 py-3 text-[10px] uppercase font-bold text-on-surface-variant tracking-wider text-right">Fuel $</th>
                <th className="px-4 py-3 text-[10px] uppercase font-bold text-on-surface-variant tracking-wider text-right">Maint $</th>
                <th className="px-4 py-3 text-[10px] uppercase font-bold text-on-surface-variant tracking-wider text-right">Total Ops $</th>
                <th className="px-4 py-3 text-[10px] uppercase font-bold text-on-surface-variant tracking-wider text-right">ROI</th>
              </tr>
            </thead>
            <tbody>
              {analytics.map(a => (
                <tr key={a.id} className="border-b border-outline/5 hover:bg-surface-container-low transition-colors">
                  <td className="px-4 py-3"><span className="text-xs font-bold text-on-surface">{a.name}</span><span className="block text-[10px] text-on-surface-variant font-mono-label">{a.id} • {a.type}</span></td>
                  <td className="px-4 py-3 text-xs font-mono-label text-on-surface text-right">{a.odometer.toLocaleString()} km</td>
                  <td className="px-4 py-3 text-xs font-bold text-tertiary font-mono-label text-right">{a.fuelEfficiency}{a.fuelEfficiency !== '—' ? ' km/L' : ''}</td>
                  <td className="px-4 py-3 text-xs font-mono-label text-on-surface text-right">${a.totalFuelCost.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs font-mono-label text-on-surface text-right">${a.totalMaintCost.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs font-bold font-mono-label text-error text-right">${a.totalOpsCost.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs font-bold font-mono-label text-right"><span className={`${parseFloat(a.roi) >= 0 ? 'text-tertiary' : 'text-error'}`}>{a.roi}{a.roi !== '—' ? '%' : ''}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
