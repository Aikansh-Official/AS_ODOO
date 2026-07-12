import React from 'react';
import { Activity, Truck, Users, Navigation, Wrench, DollarSign, BarChart3, LogOut } from 'lucide-react';
import { Logo } from '../common/Logo';

const TABS = [
  { id: 'overview', label: 'Command Overview', icon: Activity },
  { id: 'vehicles', label: 'Vehicles', icon: Truck },
  { id: 'employees', label: 'Employees', icon: Users },
  { id: 'trips', label: 'Trips', icon: Navigation },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench },
  { id: 'finance', label: 'Finance', icon: DollarSign },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
];

export function Sidebar({ activeTab, setActiveTab, onLogout }) {
  return (
    <aside className="w-64 border-r border-outline/15 bg-surface/90 backdrop-blur-2xl flex flex-col justify-between p-5 z-50 shrink-0">
      <div className="flex flex-col gap-7">
        <div className="flex items-center gap-2 px-2">
          <Logo />
        </div>
        <nav className="flex flex-col gap-1">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-body text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-md'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high border border-transparent'
                }`}
              >
                <Icon className="h-4 w-4" /> {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-3 border-t border-outline/10 pt-4">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-body text-xs font-semibold text-error border border-error/20 bg-error/5 hover:bg-error/10 hover:border-error/35 transition-all cursor-pointer"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </aside>
  );
}
