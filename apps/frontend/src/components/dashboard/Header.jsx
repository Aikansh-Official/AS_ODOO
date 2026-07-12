import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, RefreshCw } from 'lucide-react';
import { MOCK_NOTIFICATIONS } from '../../data/mockData';

const TAB_TITLES = {
  overview: { title: 'Operations Center', desc: 'Comprehensive fleet status tracking.', badge: true },
  vehicles: { title: 'Vehicles Command', desc: 'Manage fleet operations, enforce rules, and assign transit.' },
  employees: { title: 'Employee & Driver Hub', desc: 'Manage driver profiles, licenses, and duty status.' },
  trips: { title: 'Trip Management', desc: 'Create, dispatch, track, and complete trips.' },
  maintenance: { title: 'Maintenance Log', desc: 'Track vehicle servicing, repairs, and shop orders.' },
  finance: { title: 'Finance & Expenses', desc: 'Record fuel logs, tolls, and operational costs.' },
  reports: { title: 'Reports & Analytics', desc: 'Fleet metrics, efficiency analysis, and CSV exports.' },
};

export function Header({ activeTab }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const meta = TAB_TITLES[activeTab] || TAB_TITLES.overview;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <header className="w-full flex items-center justify-between mb-6 md:mb-8 shrink-0">
      <div>
        <h1 className="font-headline text-2xl font-bold tracking-tight text-on-surface flex items-center gap-2.5">
          {meta.title}
          {meta.badge && (
            <span className="inline-flex items-center gap-1 text-[9px] font-mono-label px-2 py-0.5 rounded bg-tertiary/10 border border-tertiary/25 text-tertiary">
              <span className="h-1 w-1 rounded-full bg-tertiary animate-pulse" /> Live Telemetry
            </span>
          )}
        </h1>
        <p className="mt-1 font-body text-xs text-on-surface-variant">{meta.desc}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleRefresh}
          className={`p-2.5 rounded-full border border-outline/15 bg-surface-container hover:bg-surface-container-high transition-all text-on-surface-variant hover:text-on-surface cursor-pointer ${isRefreshing ? 'animate-spin' : ''}`}
        >
          <RefreshCw className="h-4 w-4" />
        </button>

        <div className="relative">
          <button
            onClick={() => { setNotificationsOpen(!notificationsOpen); setUnreadNotifications(false); }}
            className={`h-10 w-10 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
              notificationsOpen
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-outline/15 bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadNotifications && (
              <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-surface animate-pulse" />
            )}
          </button>

          <AnimatePresence>
            {notificationsOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-80 rounded-2xl border border-outline/15 bg-surface/95 backdrop-blur-3xl shadow-xl p-4 flex flex-col gap-3 z-50 text-left"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-outline/10">
                    <span className="text-xs font-bold text-on-surface uppercase tracking-wider">Alert Logs</span>
                    <button className="text-[10px] text-primary hover:underline cursor-pointer" onClick={() => setUnreadNotifications(false)}>Clear</button>
                  </div>
                  <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                    {MOCK_NOTIFICATIONS.map((n) => (
                      <div key={n.id} className="p-2.5 rounded-xl border border-outline/5 bg-surface-container hover:bg-surface-container-high transition-all">
                        <span className="block text-xs font-semibold text-on-surface">{n.title}</span>
                        <span className="block text-[10px] text-on-surface-variant mt-0.5 leading-normal">{n.desc}</span>
                        <span className="block text-[8px] text-on-surface-variant/60 font-mono-label mt-1 text-right">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
