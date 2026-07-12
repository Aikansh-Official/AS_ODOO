import React, { useState } from 'react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Header } from '../components/dashboard/Header';
import { OverviewTab } from './OverviewTab';
import { VehiclesTab } from './VehiclesTab';
import { EmployeesTab } from './EmployeesTab';
import { TripsTab } from './TripsTab';
import { MaintenanceTab } from './MaintenanceTab';
import { FinanceTab } from './FinanceTab';
import { ReportsTab } from './ReportsTab';
import {
  MOCK_TRUCKS, MOCK_DRIVERS, MOCK_TRIPS,
  MOCK_MAINTENANCE, MOCK_FUEL_LOGS, MOCK_EXPENSES,
} from '../data/mockData';

export function Dashboard({ onNavigate }) {
  // ─── Centralized State ───
  const [trucks, setTrucks] = useState(MOCK_TRUCKS);
  const [drivers, setDrivers] = useState(MOCK_DRIVERS);
  const [trips, setTrips] = useState(MOCK_TRIPS);
  const [maintenance, setMaintenance] = useState(MOCK_MAINTENANCE);
  const [fuelLogs, setFuelLogs] = useState(MOCK_FUEL_LOGS);
  const [expenses, setExpenses] = useState(MOCK_EXPENSES);

  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = () => {
    onNavigate('home');
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-background text-on-surface flex overflow-hidden z-40">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

      <main className="flex-1 flex flex-col min-w-0 h-full relative overflow-y-auto bg-background p-6 md:p-8">
        <Header activeTab={activeTab} />

        {activeTab === 'overview' && <OverviewTab trucks={trucks} drivers={drivers} />}
        {activeTab === 'vehicles' && <VehiclesTab trucks={trucks} setTrucks={setTrucks} drivers={drivers} setDrivers={setDrivers} />}
        {activeTab === 'employees' && <EmployeesTab drivers={drivers} setDrivers={setDrivers} />}
        {activeTab === 'trips' && <TripsTab trips={trips} setTrips={setTrips} trucks={trucks} setTrucks={setTrucks} drivers={drivers} setDrivers={setDrivers} />}
        {activeTab === 'maintenance' && <MaintenanceTab maintenance={maintenance} setMaintenance={setMaintenance} trucks={trucks} setTrucks={setTrucks} />}
        {activeTab === 'finance' && <FinanceTab fuelLogs={fuelLogs} setFuelLogs={setFuelLogs} expenses={expenses} setExpenses={setExpenses} trucks={trucks} maintenance={maintenance} />}
        {activeTab === 'reports' && <ReportsTab trucks={trucks} fuelLogs={fuelLogs} maintenance={maintenance} expenses={expenses} drivers={drivers} />}
      </main>
    </div>
  );
}
