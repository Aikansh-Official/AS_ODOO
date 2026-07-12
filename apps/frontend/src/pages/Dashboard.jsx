import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, Users, Package, LogOut, Bell, AlertTriangle, 
  CreditCard, Activity, Info, Check, RefreshCw 
} from 'lucide-react';
import { Logo } from '../components/common/Logo';

// Leaflet Map Imports
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Simulated Geohashed Logistics Fleet Data
const MOCK_TRUCKS = [
  { id: 'TRK-4022', driver: 'Marcus Vance', geohash: 'dr5reg', city: 'New York', status: 'delayed', speed: '48 mph', cargo: 'Medical Supplies', route: 'NY -> BOS', destCity: 'Boston' },
  { id: 'TRK-1105', driver: 'Sarah Jenkins', geohash: 'dp3wt1', city: 'Chicago', status: 'active', speed: '62 mph', cargo: 'Electronics', route: 'CHI -> DET', destCity: 'Detroit' },
  { id: 'TRK-8901', driver: 'Elena Rostova', geohash: 'c23nbd', city: 'Los Angeles', status: 'active', speed: '55 mph', cargo: 'Automotive Parts', route: 'LA -> SF', destCity: 'San Francisco' },
  { id: 'TRK-5520', driver: 'David Miller', geohash: 'dpu58z', city: 'Houston', status: 'warning', speed: '12 mph', cargo: 'Fresh Produce', route: 'HOU -> NO', destCity: 'New Orleans' },
  { id: 'TRK-7712', driver: 'James Carter', geohash: 'dn5bpf', lat: 33.7490, lon: -84.3880, city: 'Atlanta', status: 'active', speed: '58 mph', cargo: 'Dry Goods', route: 'ATL -> MIA', destCity: 'Miami' }
];

const MOCK_ALERTS = [
  { id: 'ALT-01', type: 'critical', msg: 'Truck TRK-4022 (Geohash: dr5reg) - Route deviation detected near I-95 corridor.', action: 'Recalculate Route' },
  { id: 'ALT-02', type: 'warning', msg: 'Truck TRK-5520 (Geohash: dpu58z) - Core engine temperature spike detected.', action: 'Send Service Alert' },
  { id: 'ALT-03', type: 'info', msg: 'Truck TRK-8901 (Geohash: c23nbd) - Approaching service duty limit in 45 mins.', action: 'Schedule Relief' }
];

const MOCK_SALARIES = [
  { id: 'SAL-01', department: 'Fleet Operators', msg: 'July 2026 operator salary payroll pending disbursement clearance.', amount: '$148,250' },
  { id: 'SAL-02', department: 'Contract Logistics', msg: 'Disbursement bonuses for 12 safety-certified drivers pending approval.', amount: '$24,000' }
];

const MOCK_NOTIFICATIONS = [
  { id: 1, title: 'Route Recalibrated', desc: 'TRK-1105 auto-diverted around construction on I-80.', time: '2 mins ago' },
  { id: 2, title: 'Critical Alert Resolved', desc: 'TRK-8901 fuel pressure sensor back within limits.', time: '15 mins ago' },
  { id: 3, title: 'System Security', desc: 'Terminal node connection verified with AES-256 standards.', time: '1 hour ago' }
];

// Helper Base32 Geohash Decoder
function decodeGeohash(geohash) {
  const B32 = "0123456789bcdefghjkmnpqrstuvwxyz";
  const B32_MAP = {};
  for (let i = 0; i < B32.length; i++) {
    B32_MAP[B32[i]] = i;
  }

  let minLat = -90.0, maxLat = 90.0;
  let minLon = -180.0, maxLon = 180.0;
  let isEven = true;

  for (let i = 0; i < geohash.length; i++) {
    const c = geohash[i];
    const val = B32_MAP[c];
    if (val === undefined) continue;

    for (let mask = 16; mask > 0; mask >>= 1) {
      if (isEven) {
        const mid = (minLon + maxLon) / 2;
        if (val & mask) {
          minLon = mid;
        } else {
          maxLon = mid;
        }
      } else {
        const mid = (minLat + maxLat) / 2;
        if (val & mask) {
          minLat = mid;
        } else {
          maxLat = mid;
        }
      }
      isEven = !isEven;
    }
  }

  return [(minLat + maxLat) / 2, (minLon + maxLon) / 2];
}

// Map Controller for Zooming/Panning
function MapController({ selectedTruck }) {
  const map = useMap();
  useEffect(() => {
    if (selectedTruck) {
      const coords = decodeGeohash(selectedTruck.geohash);
      map.setView(coords, 6, { animate: true, duration: 1.5 });
    }
  }, [selectedTruck, map]);
  return null;
}

export function Dashboard({ onNavigate }) {
  const [selectedTruck, setSelectedTruck] = useState(MOCK_TRUCKS[0]);
  const [activeTab, setActiveTab] = useState('vehicles'); 
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeRoutePath, setActiveRoutePath] = useState([]);

  // Fetch driving route coordinates via public free OSRM Routing API
  useEffect(() => {
    if (!selectedTruck) return;
    
    let isMounted = true;
    const startCoord = decodeGeohash(selectedTruck.geohash);
    
    // Rough coordinates for target cities
    const destCoords = {
      'TRK-4022': [42.3601, -71.0589],   // Boston
      'TRK-1105': [42.3314, -83.0458],   // Detroit
      'TRK-8901': [37.7749, -122.4194],  // San Francisco
      'TRK-5520': [29.9511, -90.0715],   // New Orleans
      'TRK-7712': [25.7617, -80.1918]    // Miami
    };
    const endCoord = destCoords[selectedTruck.id] || startCoord;

    const fetchOSRMRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${startCoord[1]},${startCoord[0]};${endCoord[1]},${endCoord[0]}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (isMounted && data.routes && data.routes[0]) {
          const path = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
          setActiveRoutePath(path);
        }
      } catch (e) {
        console.error("OSRM Route API fetch error:", e);
        if (isMounted) {
          setActiveRoutePath([startCoord, endCoord]); // Fallback to straight line coordinate
        }
      }
    };

    fetchOSRMRoute();

    return () => {
      isMounted = false;
    };
  }, [selectedTruck]);

  // Handle simulated auto-refresh telemetry
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  // Generate a customized pulsing DivIcon truck marker
  const getTruckIcon = (status, isSelected) => {
    const color = status === 'delayed' ? '#f43f5e' : status === 'warning' ? '#fbbf24' : '#3b82f6';
    const size = isSelected ? 34 : 26;
    
    return L.divIcon({
      html: `
        <div class="relative flex items-center justify-center" style="width: ${size}px; height: ${size}px;">
          ${isSelected ? `<span class="absolute h-full w-full rounded-full animate-ping opacity-60" style="background-color: ${color};"></span>` : ''}
          <div class="absolute rounded-full shadow-lg flex items-center justify-center" style="width: ${size * 0.75}px; height: ${size * 0.75}px; background-color: ${color}; border: 1.5px solid #ffffff;">
            <svg class="text-white" style="width: ${size * 0.4}px; height: ${size * 0.4}px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
              <path d="M19 18h2a1 1 0 0 0 1-1v-5.18a2 2 0 0 0-.59-1.42l-2.82-2.82a2 2 0 0 0-1.41-.58H14" />
              <circle cx="7.5" cy="18.5" r="2.5" />
              <circle cx="16.5" cy="18.5" r="2.5" />
            </svg>
          </div>
        </div>
      `,
      className: 'custom-truck-marker',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-background text-on-surface flex overflow-hidden z-40">
      
      {/* 1. Left Sidebar navigation */}
      <aside className="w-64 border-r border-white/10 bg-surface-dim/75 backdrop-blur-2xl flex flex-col justify-between p-6 z-50 shrink-0">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-2">
            <Logo />
          </div>

          <nav className="flex flex-col gap-1.5">
            <button
              onClick={() => setActiveTab('vehicles')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-body text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'vehicles'
                  ? 'bg-primary text-white border border-primary/20 shadow-[0_4px_12px_rgba(59,130,246,0.25)]'
                  : 'text-on-surface-variant hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Truck className="h-4.5 w-4.5" />
              Vehicles Command
            </button>
            <button
              onClick={() => setActiveTab('employees')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-body text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'employees'
                  ? 'bg-primary text-white border border-primary/20 shadow-[0_4px_12px_rgba(59,130,246,0.25)]'
                  : 'text-on-surface-variant hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Users className="h-4.5 w-4.5" />
              Employee Operations
            </button>
            <button
              onClick={() => setActiveTab('consignments')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-body text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'consignments'
                  ? 'bg-primary text-white border border-primary/20 shadow-[0_4px_12px_rgba(59,130,246,0.25)]'
                  : 'text-on-surface-variant hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Package className="h-4.5 w-4.5" />
              Consignments Registry
            </button>
          </nav>
        </div>

        <div className="flex flex-col gap-3.5 border-t border-white/5 pt-5">
          <button
            onClick={() => alert('Station operator configurations are currently locked under security policy.')}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all text-left cursor-pointer group"
          >
            <span className="h-9 w-9 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-sm uppercase">
              OP
            </span>
            <div className="flex-1 overflow-hidden">
              <span className="block text-xs font-bold text-on-surface truncate group-hover:text-primary transition-colors">Alex Operator</span>
              <span className="block text-[10px] font-mono-label text-on-surface-variant/80 truncate">Station #024</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('home')}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-body text-xs font-semibold text-error border border-error/20 bg-error/5 hover:bg-error/10 hover:border-error/35 transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Logout Station
          </button>
        </div>
      </aside>

      {/* 2. Main Page Command Section */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--color-surface-container-low)_0%,_var(--color-background)_100%)] p-6 md:p-8">
        
        <header className="w-full flex items-center justify-between mb-6 md:mb-8 shrink-0">
          <div>
            <h1 className="font-headline text-2xl font-bold tracking-tight text-on-surface flex items-center gap-2.5">
              Operations Center
              <span className="inline-flex items-center gap-1 text-[9px] font-mono-label px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" /> Live Telemetry
              </span>
            </h1>
            <p className="mt-1 font-body text-xs text-on-surface-variant">
              Comprehensive fleet status tracking, geohash spatial coordinates, and payroll notifications.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleRefresh} 
              className={`p-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-on-surface-variant hover:text-white cursor-pointer ${isRefreshing ? 'animate-spin' : ''}`}
              title="Refresh Fleet Telemetry"
            >
              <RefreshCw className="h-4.5 w-4.5" />
            </button>

            <div className="relative">
              <button 
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setUnreadNotifications(false);
                }}
                className={`h-11 w-11 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                  notificationsOpen 
                    ? 'border-primary bg-primary/10 text-primary shadow-[0_0_12px_rgba(59,130,246,0.2)]' 
                    : 'border-white/10 bg-white/5 text-on-surface-variant hover:text-white hover:bg-white/10'
                }`}
                aria-label="Toggle notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifications && (
                  <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse" />
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
                      className="absolute right-0 mt-2.5 w-80 rounded-2xl border border-white/10 bg-surface-dim/95 backdrop-blur-3xl shadow-[0_20px_40px_rgba(0,0,0,0.6)] p-4 flex flex-col gap-3 z-50 text-left"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-white/5">
                        <span className="text-xs font-bold text-on-surface uppercase tracking-wider">Alert Logs</span>
                        <button className="text-[10px] text-primary hover:underline cursor-pointer" onClick={() => setUnreadNotifications(false)}>Clear</button>
                      </div>
                      <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto pr-1">
                        {MOCK_NOTIFICATIONS.map((n) => (
                          <div key={n.id} className="p-2.5 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all">
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

        {/* 3. Command Central Grid */}
        <div className="w-full flex-1 flex flex-col gap-6 md:gap-8 justify-between">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch flex-1">
            
            {/* Map Service Box Container */}
            <div className="lg:col-span-8 rounded-[2rem] border border-white/10 bg-white/[0.01] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),_0_12px_24px_rgba(0,0,0,0.3)] backdrop-blur-3xl p-6 min-h-[400px] flex flex-col relative overflow-hidden">
              <div className="flex justify-between items-center z-20 shrink-0 mb-4">
                <span className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary animate-pulse" /> Active Transit Corridors (OpenStreetMap Tile Layer)
                </span>
                <span className="text-[10px] font-mono-label text-on-surface-variant">
                  Geohash Decoding Active
                </span>
              </div>

              {/* Leaflet Map Canvas */}
              <div className="flex-1 border border-white/5 rounded-2xl relative overflow-hidden shadow-inner flex items-center justify-center z-10 bg-background/50">
                <MapContainer 
                  center={[38.5, -96.0]} 
                  zoom={4} 
                  zoomControl={true}
                  className="w-full h-full z-10"
                  style={{ height: '100%', width: '100%', minHeight: '340px' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  {MOCK_TRUCKS.map((trk) => {
                    const coords = decodeGeohash(trk.geohash);
                    const isSelected = selectedTruck.id === trk.id;
                    return (
                      <Marker 
                        key={trk.id} 
                        position={coords} 
                        icon={getTruckIcon(trk.status, isSelected)}
                        eventHandlers={{
                          click: () => setSelectedTruck(trk)
                        }}
                      >
                        <Popup>
                          <div className="text-left text-white leading-normal">
                            <span className="block text-xs font-bold text-primary">{trk.id}</span>
                            <span className="block text-[11px] font-semibold text-on-surface mt-1">Driver: {trk.driver}</span>
                            <span className="block text-[10px] text-on-surface-variant mt-0.5">Cargo: {trk.cargo}</span>
                            <span className="block text-[10px] text-on-surface-variant">Coordinates: {coords[0].toFixed(4)}, {coords[1].toFixed(4)}</span>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                  
                  {activeRoutePath.length > 0 && (
                    <Polyline 
                      positions={activeRoutePath} 
                      color="#3b82f6" 
                      weight={4}
                      opacity={0.85}
                    />
                  )}
                  
                  <MapController selectedTruck={selectedTruck} />
                </MapContainer>

                {/* Map Details Popover overlay when selected */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl border border-white/10 bg-surface-dim/85 backdrop-blur-md flex items-center justify-between text-left gap-4 max-w-full z-20 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${selectedTruck.status === 'delayed' ? 'bg-error/15 text-error border border-error/25' : selectedTruck.status === 'warning' ? 'bg-amber-400/10 text-amber-400 border border-amber-400/25' : 'bg-primary/10 text-primary border border-primary/25'} border`}>
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-on-surface block">{selectedTruck.id} • {selectedTruck.driver}</span>
                      <span className="text-[10px] font-mono-label text-on-surface-variant block mt-0.5">Geohash: <span className="text-primary font-semibold">{selectedTruck.geohash}</span> ({selectedTruck.city})</span>
                    </div>
                  </div>

                  <div className="flex gap-6 text-right shrink-0">
                    <div className="hidden sm:block">
                      <span className="text-[9px] font-mono-label text-on-surface-variant block">Route</span>
                      <span className="text-xs font-bold text-on-surface">{selectedTruck.route} ({selectedTruck.destCity})</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono-label text-on-surface-variant block">Speed / Cargo</span>
                      <span className="text-xs font-bold text-on-surface">{selectedTruck.speed} ({selectedTruck.cargo})</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Side Truck Registry Detail Panel */}
            <div className="lg:col-span-4 rounded-[2rem] border border-white/10 bg-white/[0.01] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),_0_12px_24px_rgba(0,0,0,0.3)] backdrop-blur-3xl p-6 flex flex-col h-full overflow-hidden">
              <span className="text-xs font-bold text-on-surface uppercase tracking-wider mb-4 block text-left">
                Active Journeys ({MOCK_TRUCKS.length})
              </span>

              {/* Truck List */}
              <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-1">
                {MOCK_TRUCKS.map((trk) => {
                  const isSelected = selectedTruck.id === trk.id;
                  const coords = decodeGeohash(trk.geohash);
                  return (
                    <button
                      key={trk.id}
                      onClick={() => setSelectedTruck(trk)}
                      className={`w-full p-3.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-primary/10 border-primary shadow-sm'
                          : 'border-white/5 bg-white/[0.01] hover:bg-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`h-2.5 w-2.5 rounded-full ${trk.status === 'delayed' ? 'bg-error animate-pulse' : trk.status === 'warning' ? 'bg-amber-400' : 'bg-primary'}`} />
                        <div>
                          <span className="text-xs font-bold text-on-surface block">{trk.id}</span>
                          <span className="text-[10px] text-on-surface-variant block mt-0.5">{trk.driver}</span>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className="text-[10px] font-mono-label text-primary font-semibold">{trk.geohash}</span>
                        <span className="text-[9px] text-on-surface-variant mt-0.5">{coords[0].toFixed(2)}, {coords[1].toFixed(2)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4. Attention Required Section */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start shrink-0">
            
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.01] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-3xl p-6 flex flex-col gap-4 text-left">
              <span className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="h-4.5 w-4.5 text-error animate-pulse" /> Attention Required: Truck Operations
              </span>
              <div className="flex flex-col gap-3">
                {MOCK_ALERTS.map((alert) => (
                  <div key={alert.id} className="p-3.5 rounded-xl border border-white/5 bg-white/[0.01] flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${alert.type === 'critical' ? 'bg-error/10 text-error' : alert.type === 'warning' ? 'bg-amber-400/10 text-amber-400' : 'bg-primary/10 text-primary'}`}>
                        {alert.type === 'critical' ? <AlertTriangle className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
                      </span>
                      <p className="text-xs text-on-surface-variant leading-relaxed truncate-2-lines">{alert.msg}</p>
                    </div>
                    <button 
                      onClick={() => alert(`Initiated action: ${alert.action}`)}
                      className="shrink-0 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-on-surface cursor-pointer whitespace-nowrap"
                    >
                      {alert.action}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.01] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-3xl p-6 flex flex-col gap-4 text-left">
              <span className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="h-4.5 w-4.5 text-primary" /> Attention Required: Employee Payroll
              </span>
              <div className="flex flex-col gap-3">
                {MOCK_SALARIES.map((salary) => (
                  <div key={salary.id} className="p-3.5 rounded-xl border border-white/5 bg-white/[0.01] flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="h-6 w-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                        <CreditCard className="w-3.5 h-3.5" />
                      </span>
                      <div className="min-w-0">
                        <span className="block text-xs font-bold text-on-surface">{salary.department}</span>
                        <p className="text-[11px] text-on-surface-variant leading-normal mt-0.5 truncate-2-lines">{salary.msg}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="text-xs font-bold text-emerald-400 font-mono-label">{salary.amount}</span>
                      <button 
                        onClick={() => alert(`Cleared payroll for ${salary.department}`)}
                        className="text-[9px] font-semibold px-2 py-1 rounded bg-primary text-white border border-primary/20 hover:scale-[1.02] active:scale-98 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Check className="w-2.5 h-2.5" /> Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>

        </div>
      </main>

    </div>
  );
}
