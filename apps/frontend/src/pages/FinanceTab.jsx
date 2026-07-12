import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';

export function FinanceTab({ fuelLogs, setFuelLogs, expenses, setExpenses, trucks, maintenance }) {
  const [activeSection, setActiveSection] = useState('fuel');
  const [isAddingFuel, setIsAddingFuel] = useState(false);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [fuelForm, setFuelForm] = useState({ vehicleId: '', liters: '', cost: '', date: '', odometerAtFill: '' });
  const [expenseForm, setExpenseForm] = useState({ vehicleId: '', category: 'Tolls', amount: '', date: '', description: '' });

  const inputClass = "w-full bg-surface-container border border-outline/20 rounded-xl px-4 py-3 text-sm text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary/50 transition-all";

  // Per-vehicle cost summary
  const vehicleCostSummary = trucks.map(t => {
    const totalFuel = fuelLogs.filter(f => f.vehicleId === t.id).reduce((sum, f) => sum + f.cost, 0);
    const totalMaint = maintenance.filter(m => m.vehicleId === t.id).reduce((sum, m) => sum + m.cost, 0);
    const totalExpenses = expenses.filter(e => e.vehicleId === t.id).reduce((sum, e) => sum + e.amount, 0);
    return { ...t, totalFuel, totalMaint, totalExpenses, totalOps: totalFuel + totalMaint + totalExpenses };
  }).filter(v => v.totalOps > 0).sort((a, b) => b.totalOps - a.totalOps);

  const handleAddFuel = (e) => {
    e.preventDefault();
    const id = `FL-${String(fuelLogs.length + 1).padStart(3, '0')}`;
    setFuelLogs([{ id, vehicleId: fuelForm.vehicleId, liters: Number(fuelForm.liters), cost: Number(fuelForm.cost), date: fuelForm.date, odometerAtFill: Number(fuelForm.odometerAtFill) }, ...fuelLogs]);
    setIsAddingFuel(false);
    setFuelForm({ vehicleId: '', liters: '', cost: '', date: '', odometerAtFill: '' });
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    const id = `EXP-${String(expenses.length + 1).padStart(3, '0')}`;
    setExpenses([{ id, vehicleId: expenseForm.vehicleId, category: expenseForm.category, amount: Number(expenseForm.amount), date: expenseForm.date, description: expenseForm.description }, ...expenses]);
    setIsAddingExpense(false);
    setExpenseForm({ vehicleId: '', category: 'Tolls', amount: '', date: '', description: '' });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="w-full flex-1 flex flex-col h-full overflow-hidden">
      {/* Section Toggle */}
      <div className="flex items-center gap-3 mb-5 shrink-0">
        <div className="flex bg-surface-container rounded-xl p-1 border border-outline/10">
          {['fuel', 'expenses', 'summary'].map(s => (
            <button key={s} onClick={() => setActiveSection(s)} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer capitalize ${activeSection === s ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>{s === 'fuel' ? 'Fuel Logs' : s === 'expenses' ? 'Expenses' : 'Cost Summary'}</button>
          ))}
        </div>
        <div className="ml-auto">
          {activeSection === 'fuel' && <button onClick={() => setIsAddingFuel(true)} className="px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold flex items-center gap-2 shadow-md hover:opacity-90 cursor-pointer"><Plus className="w-4 h-4" /> Log Fuel</button>}
          {activeSection === 'expenses' && <button onClick={() => setIsAddingExpense(true)} className="px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold flex items-center gap-2 shadow-md hover:opacity-90 cursor-pointer"><Plus className="w-4 h-4" /> Add Expense</button>}
        </div>
      </div>

      <div className="overflow-y-auto flex-1 pb-6">
        {activeSection === 'fuel' && (
          <div className="rounded-2xl border border-outline/10 bg-surface overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-outline/10 bg-surface-container">
                  <th className="px-4 py-3 text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">ID</th>
                  <th className="px-4 py-3 text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Vehicle</th>
                  <th className="px-4 py-3 text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Liters</th>
                  <th className="px-4 py-3 text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Cost</th>
                  <th className="px-4 py-3 text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Odometer</th>
                  <th className="px-4 py-3 text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {fuelLogs.map(log => {
                  const v = trucks.find(t => t.id === log.vehicleId);
                  return (
                    <tr key={log.id} className="border-b border-outline/5 hover:bg-surface-container-low transition-colors">
                      <td className="px-4 py-3 text-xs font-bold font-mono-label text-on-surface">{log.id}</td>
                      <td className="px-4 py-3 text-xs text-on-surface">{v?.name || log.vehicleId}</td>
                      <td className="px-4 py-3 text-xs text-on-surface">{log.liters > 0 ? `${log.liters} L` : '— (EV)'}</td>
                      <td className="px-4 py-3 text-xs font-bold text-error font-mono-label">₹{log.cost}</td>
                      <td className="px-4 py-3 text-xs text-on-surface-variant font-mono-label">{log.odometerAtFill.toLocaleString()} km</td>
                      <td className="px-4 py-3 text-xs text-on-surface-variant">{log.date}</td>
                    </tr>
                  );
                })}
                {fuelLogs.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-xs text-on-surface-variant">No fuel logs.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {activeSection === 'expenses' && (
          <div className="rounded-2xl border border-outline/10 bg-surface overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-outline/10 bg-surface-container">
                  <th className="px-4 py-3 text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">ID</th>
                  <th className="px-4 py-3 text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Vehicle</th>
                  <th className="px-4 py-3 text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Category</th>
                  <th className="px-4 py-3 text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Date</th>
                  <th className="px-4 py-3 text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(exp => {
                  const v = trucks.find(t => t.id === exp.vehicleId);
                  return (
                    <tr key={exp.id} className="border-b border-outline/5 hover:bg-surface-container-low transition-colors">
                      <td className="px-4 py-3 text-xs font-bold font-mono-label text-on-surface">{exp.id}</td>
                      <td className="px-4 py-3 text-xs text-on-surface">{v?.name || exp.vehicleId}</td>
                      <td className="px-4 py-3"><span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{exp.category}</span></td>
                      <td className="px-4 py-3 text-xs font-bold text-error font-mono-label">₹{exp.amount}</td>
                      <td className="px-4 py-3 text-xs text-on-surface-variant">{exp.date}</td>
                      <td className="px-4 py-3 text-xs text-on-surface-variant">{exp.description}</td>
                    </tr>
                  );
                })}
                {expenses.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-xs text-on-surface-variant">No expenses.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {activeSection === 'summary' && (
          <div className="rounded-2xl border border-outline/10 bg-surface overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-outline/10 bg-surface-container">
                  <th className="px-4 py-3 text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Vehicle</th>
                  <th className="px-4 py-3 text-[10px] uppercase font-bold text-on-surface-variant tracking-wider text-right">Fuel Cost</th>
                  <th className="px-4 py-3 text-[10px] uppercase font-bold text-on-surface-variant tracking-wider text-right">Maintenance</th>
                  <th className="px-4 py-3 text-[10px] uppercase font-bold text-on-surface-variant tracking-wider text-right">Other</th>
                  <th className="px-4 py-3 text-[10px] uppercase font-bold text-on-surface-variant tracking-wider text-right">Total Ops Cost</th>
                </tr>
              </thead>
              <tbody>
                {vehicleCostSummary.map(v => (
                  <tr key={v.id} className="border-b border-outline/5 hover:bg-surface-container-low transition-colors">
                    <td className="px-4 py-3"><span className="text-xs font-bold text-on-surface">{v.name}</span><span className="block text-[10px] text-on-surface-variant font-mono-label">{v.id}</span></td>
                    <td className="px-4 py-3 text-xs font-mono-label text-on-surface text-right">₹{v.totalFuel.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs font-mono-label text-on-surface text-right">₹{v.totalMaint.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs font-mono-label text-on-surface text-right">₹{v.totalExpenses.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs font-bold font-mono-label text-error text-right">₹{v.totalOps.toLocaleString()}</td>
                  </tr>
                ))}
                {vehicleCostSummary.length === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-xs text-on-surface-variant">No cost data yet.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Fuel Log Modal */}
      <AnimatePresence>
        {isAddingFuel && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => setIsAddingFuel(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-surface border border-outline/10 rounded-2xl shadow-xl overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-outline/5">
                <h3 className="text-lg font-headline font-bold text-on-surface">Log Fuel</h3>
                <button onClick={() => setIsAddingFuel(false)} className="text-on-surface-variant hover:text-on-surface cursor-pointer p-1"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAddFuel} className="p-5 flex flex-col gap-4">
                <select required value={fuelForm.vehicleId} onChange={e => setFuelForm({ ...fuelForm, vehicleId: e.target.value })} className={inputClass}>
                  <option value="" disabled>Select Vehicle</option>
                  {trucks.map(v => <option key={v.id} value={v.id}>{v.name} ({v.id})</option>)}
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" required value={fuelForm.liters} onChange={e => setFuelForm({ ...fuelForm, liters: e.target.value })} placeholder="Liters (0 if EV)" className={inputClass} />
                  <input type="number" required value={fuelForm.cost} onChange={e => setFuelForm({ ...fuelForm, cost: e.target.value })} placeholder="Cost (₹)" className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" required value={fuelForm.date} onChange={e => setFuelForm({ ...fuelForm, date: e.target.value })} className={inputClass} />
                  <input type="number" required value={fuelForm.odometerAtFill} onChange={e => setFuelForm({ ...fuelForm, odometerAtFill: e.target.value })} placeholder="Odometer (km)" className={inputClass} />
                </div>
                <button type="submit" className="w-full py-3 mt-1 rounded-xl bg-primary text-on-primary text-sm font-bold hover:opacity-90 cursor-pointer">Log Fuel</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Expense Modal */}
      <AnimatePresence>
        {isAddingExpense && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => setIsAddingExpense(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-surface border border-outline/10 rounded-2xl shadow-xl overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-outline/5">
                <h3 className="text-lg font-headline font-bold text-on-surface">Add Expense</h3>
                <button onClick={() => setIsAddingExpense(false)} className="text-on-surface-variant hover:text-on-surface cursor-pointer p-1"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAddExpense} className="p-5 flex flex-col gap-4">
                <select required value={expenseForm.vehicleId} onChange={e => setExpenseForm({ ...expenseForm, vehicleId: e.target.value })} className={inputClass}>
                  <option value="" disabled>Select Vehicle</option>
                  {trucks.map(v => <option key={v.id} value={v.id}>{v.name} ({v.id})</option>)}
                </select>
                <select value={expenseForm.category} onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })} className={inputClass}>
                  <option value="Tolls">Tolls</option>
                  <option value="Repairs">Repairs</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Other">Other</option>
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" required value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} placeholder="Amount (₹)" className={inputClass} />
                  <input type="date" required value={expenseForm.date} onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })} className={inputClass} />
                </div>
                <input type="text" value={expenseForm.description} onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })} placeholder="Description" className={inputClass} />
                <button type="submit" className="w-full py-3 mt-1 rounded-xl bg-primary text-on-primary text-sm font-bold hover:opacity-90 cursor-pointer">Add Expense</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
