import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, Users, Package, LogOut, Bell, AlertTriangle, 
  CreditCard, Activity, Info, Check, RefreshCw, Plus, X, ChevronLeft, Navigation, Wrench, ShieldAlert, Zap, Droplet, MapPin, Play, StopCircle, RefreshCcw, Filter, DollarSign
} from 'lucide-react';
import { Logo } from '../components/common/Logo';

// Leaflet Map Imports
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Simulated Geohashed Logistics Fleet Data & Drivers
const MOCK_DRIVERS = [
  { id: 'DRV-001', name: 'Marcus Vance', licenseStatus: 'Valid', status: 'On Trip' },
  { id: 'DRV-002', name: 'Sarah Jenkins', licenseStatus: 'Valid', status: 'On Trip' },
  { id: 'DRV-003', name: 'Elena Rostova', licenseStatus: 'Valid', status: 'On Trip' },
  { id: 'DRV-004', name: 'David Miller', licenseStatus: 'Expired', status: 'Available' },
  { id: 'DRV-005', name: 'James Carter', licenseStatus: 'Valid', status: 'On Trip' },
  { id: 'DRV-006', name: 'Alex Operator', licenseStatus: 'Valid', status: 'Available' },
  { id: 'DRV-007', name: 'John Doe', licenseStatus: 'Suspended', status: 'Available' }
];

const MOCK_TRUCKS = [
  { id: 'TRK-4022', name: 'Volvo VNL 860', type: 'ICE', licenseNumber: 'NY-4928X', maxCapacity: 25000, currentCargoWeight: 20000, fuelLevel: 42, odometer: 154000, acquisitionCost: 165000, journeyProgress: 60, driverId: 'DRV-001', driver: 'Marcus Vance', geohash: 'dr5reg', city: 'New York', status: 'On Trip', speed: '48 mph', cargo: 'Medical Supplies', route: 'NY -> BOS', destCity: 'Boston', destCoords: [42.3601, -71.0589] },
  { id: 'TRK-1105', name: 'Tesla Semi', type: 'EV', licenseNumber: 'CA-1029Y', maxCapacity: 35000, currentCargoWeight: 32000, fuelLevel: 80, odometer: 24000, acquisitionCost: 250000, journeyProgress: 25, driverId: 'DRV-002', driver: 'Sarah Jenkins', geohash: 'dp3wt1', city: 'Chicago', status: 'On Trip', speed: '62 mph', cargo: 'Electronics', route: 'CHI -> DET', destCity: 'Detroit', destCoords: [42.3314, -83.0458] },
  { id: 'TRK-8901', name: 'Freightliner Cascadia', type: 'ICE', licenseNumber: 'TX-8392Z', maxCapacity: 40000, currentCargoWeight: 15000, fuelLevel: 65, odometer: 189000, acquisitionCost: 145000, journeyProgress: 88, driverId: 'DRV-003', driver: 'Elena Rostova', geohash: 'c23nbd', city: 'Los Angeles', status: 'On Trip', speed: '55 mph', cargo: 'Automotive Parts', route: 'LA -> SF', destCity: 'San Francisco', destCoords: [37.7749, -122.4194] },
  { id: 'TRK-5520', name: 'Peterbilt 579', type: 'ICE', licenseNumber: 'FL-2019A', maxCapacity: 22000, currentCargoWeight: 0, fuelLevel: 15, odometer: 225000, acquisitionCost: 130000, journeyProgress: 0, driverId: null, driver: 'Unassigned', geohash: 'dpu58z', city: 'Houston', status: 'In Shop', speed: '0 mph', cargo: 'None', route: 'None', destCity: 'None', destCoords: null },
  { id: 'TRK-7712', name: 'Rivian Commercial', type: 'EV', licenseNumber: 'GA-5091B', maxCapacity: 12000, currentCargoWeight: 10000, fuelLevel: 90, odometer: 8500, acquisitionCost: 95000, journeyProgress: 10, driverId: 'DRV-005', driver: 'James Carter', geohash: 'dn5bpf', lat: 33.7490, lon: -84.3880, city: 'Atlanta', status: 'On Trip', speed: '58 mph', cargo: 'Dry Goods', route: 'ATL -> MIA', destCity: 'Miami', destCoords: [25.7617, -80.1918] },
  { id: 'TRK-9099', name: 'Volvo VNR Electric', type: 'EV', licenseNumber: 'NV-1102C', maxCapacity: 33000, currentCargoWeight: 0, fuelLevel: 100, odometer: 12000, acquisitionCost: 210000, journeyProgress: 0, driverId: null, driver: 'Unassigned', geohash: '9q5cs', city: 'Las Vegas', status: 'Available', speed: '0 mph', cargo: 'None', route: 'None', destCity: 'None', destCoords: null }
];

const MOCK_ALERTS = [
  { id: 'ALT-01', type: 'critical', msg: 'Truck TRK-4022 (Geohash: dr5reg) - Route deviation detected near I-95 corridor.', action: 'Recalculate Route' },
  { id: 'ALT-02', type: 'warning', msg: 'Truck TRK-5520 (Geohash: dpu58z) - Core engine temperature spike detected.', action: 'Send Service Alert' }
];

const MOCK_SALARIES = [
  { id: 'SAL-01', department: 'Fleet Operators', msg: 'July 2026 operator salary payroll pending disbursement clearance.', amount: '$148,250' }
];

const MOCK_NOTIFICATIONS = [
  { id: 1, title: 'System Security', desc: 'Terminal node connection verified.', time: '1 hour ago' }
];

// Helper Base32 Geohash Decoder
function decodeGeohash(geohash) {
  const B32 = "0123456789bcdefghjkmnpqrstuvwxyz";
  const B32_MAP = {};
  for (let i = 0; i < B32.length; i++) B32_MAP[B32[i]] = i;

  let minLat = -90.0, maxLat = 90.0;
  let minLon = -180.0, maxLon = 180.0;
  let isEven = true;

  if(!geohash) return [0,0];

  for (let i = 0; i < geohash.length; i++) {
    const c = geohash[i];
    const val = B32_MAP[c];
    if (val === undefined) continue;

    for (let mask = 16; mask > 0; mask >>= 1) {
      if (isEven) {
        const mid = (minLon + maxLon) / 2;
        if (val & mask) minLon = mid;
        else maxLon = mid;
      } else {
        const mid = (minLat + maxLat) / 2;
        if (val & mask) minLat = mid;
        else maxLat = mid;
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
    if (selectedTruck && selectedTruck.geohash) {
      const coords = decodeGeohash(selectedTruck.geohash);
      map.setView(coords, 6, { animate: true, duration: 1.5 });
    }
  }, [selectedTruck, map]);
  return null;
}

// Live Map Location Search Autocomplete
function LocationSearchInput({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query && query.length > 2) {
        setIsSearching(true);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
          const data = await res.json();
          setResults(data.slice(0, 5));
          setIsOpen(true);
        } catch (e) {
          console.error("Geocoding error", e);
        }
        setIsSearching(false);
      } else {
        setIsOpen(false);
      }
    }, 600);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div className="relative w-full">
      <input 
        type="text" 
        value={query} 
        onChange={(e) => {
            setQuery(e.target.value);
            onSelect(null); // Clear selected if typing
        }} 
        placeholder="Search Map Destination (e.g. Seattle, WA)" 
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-on-surface placeholder-on-surface/50 focus:outline-none focus:border-primary/50 transition-all" 
        required 
      />
      {isSearching && <span className="absolute right-4 top-3 text-xs text-primary animate-pulse">Searching...</span>}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 mt-1 w-full bg-surface-dim border border-white/10 rounded-xl overflow-hidden z-50 max-h-48 overflow-y-auto shadow-2xl">
          {results.map(r => (
            <div 
              key={r.place_id} 
              onClick={() => { 
                const shortName = r.display_name.split(',')[0];
                onSelect({ name: shortName, fullName: r.display_name, lat: parseFloat(r.lat), lon: parseFloat(r.lon) }); 
                setQuery(r.display_name); 
                setIsOpen(false); 
              }} 
              className="p-3 text-xs text-on-surface hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-0 truncate transition-colors"
            >
              {r.display_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Dashboard({ onNavigate }) {
  const [trucks, setTrucks] = useState(MOCK_TRUCKS);
  const [drivers, setDrivers] = useState(MOCK_DRIVERS);
  const [selectedTruck, setSelectedTruck] = useState(trucks[0]);
  const [activeTab, setActiveTab] = useState('overview'); 
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeRoutePath, setActiveRoutePath] = useState([]);

  // Vehicles view state
  const [selectedVehicleView, setSelectedVehicleView] = useState(null);
  
  // Filter state
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterRegion, setFilterRegion] = useState('All');
  
  // Modals state
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ name: '', id: '', licenseNumber: '', type: 'ICE', maxCapacity: '', acquisitionCost: '' });
  
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [dispatchData, setDispatchData] = useState({ driverId: '', cargoWeight: '', cargo: '', destCity: '', destCoords: null });
  const [dispatchError, setDispatchError] = useState('');

  const [completeTripModalOpen, setCompleteTripModalOpen] = useState(false);
  const [completeTripData, setCompleteTripData] = useState({ odometer: '', fuelConsumed: '' });

  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);
  const [maintenanceReason, setMaintenanceReason] = useState('');

  // Fetch driving route coordinates via public free OSRM Routing API
  useEffect(() => {
    const truckToFetch = (activeTab === 'overview' ? selectedTruck : selectedVehicleView);
    if (!truckToFetch || truckToFetch.status !== 'On Trip') {
        setActiveRoutePath([]);
        return;
    }
    
    let isMounted = true;
    const startCoord = decodeGeohash(truckToFetch.geohash);
    const endCoord = truckToFetch.destCoords || [startCoord[0] + 1, startCoord[1] + 1];

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
        if (isMounted) setActiveRoutePath([startCoord, endCoord]);
      }
    };
    fetchOSRMRoute();
    return () => { isMounted = false; };
  }, [selectedTruck, selectedVehicleView, activeTab, trucks]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const getTruckIcon = (status, isSelected) => {
    const color = status === 'On Trip' ? '#3b82f6' : status === 'In Shop' ? '#fbbf24' : status === 'Retired' ? '#f43f5e' : '#94a3b8';
    const size = isSelected ? 34 : 26;
    return L.divIcon({
      html: `
        <div class="relative flex items-center justify-center" style="width: ${size}px; height: ${size}px;">
          ${isSelected && status === 'On Trip' ? `<span class="absolute h-full w-full rounded-full animate-ping opacity-60" style="background-color: ${color};"></span>` : ''}
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
      className: 'custom-truck-marker', iconSize: [size, size], iconAnchor: [size / 2, size / 2],
    });
  };

  // --- BUSINESS RULES ACTIONS ---

  const handleAddVehicle = (e) => {
    e.preventDefault();
    if (trucks.some(t => t.licenseNumber === newVehicle.licenseNumber)) {
        alert(`Error: Registration number ${newVehicle.licenseNumber} must be unique.`);
        return;
    }
    const newId = newVehicle.id || `TRK-${Math.floor(1000 + Math.random() * 9000)}`;
    const addedVehicle = {
      ...newVehicle,
      maxCapacity: Number(newVehicle.maxCapacity),
      acquisitionCost: Number(newVehicle.acquisitionCost),
      id: newId, driver: 'Unassigned', driverId: null, geohash: '9q5cs', city: 'Headquarters',
      status: 'Available', speed: '0 mph', cargo: 'None', currentCargoWeight: 0, fuelLevel: 100, 
      odometer: 0, journeyProgress: 0, route: 'None', destCity: 'None', destCoords: null
    };
    setTrucks([addedVehicle, ...trucks]);
    setIsAddingVehicle(false);
    setNewVehicle({ name: '', id: '', licenseNumber: '', type: 'ICE', maxCapacity: '', acquisitionCost: '' });
  };

  const handleDispatch = (e) => {
    e.preventDefault();
    setDispatchError('');
    const weight = Number(dispatchData.cargoWeight);
    if (weight > selectedVehicleView.maxCapacity) {
        setDispatchError(`Cargo weight (${weight}kg) exceeds vehicle capacity (${selectedVehicleView.maxCapacity}kg).`);
        return;
    }
    if (!dispatchData.destCoords) {
        setDispatchError(`Please select a valid destination from the map search dropdown.`);
        return;
    }

    const driver = drivers.find(d => d.id === dispatchData.driverId);
    
    const updatedTrucks = trucks.map(t => {
        if (t.id === selectedVehicleView.id) {
            const updated = { 
                ...t, status: 'On Trip', currentCargoWeight: weight, driverId: driver.id, driver: driver.name, 
                cargo: dispatchData.cargo || 'General Freight', destCity: dispatchData.destCity, destCoords: dispatchData.destCoords, route: `HQ -> ${dispatchData.destCity}`, speed: '45 mph', journeyProgress: 0 
            };
            setSelectedVehicleView(updated);
            return updated;
        }
        return t;
    });
    const updatedDrivers = drivers.map(d => d.id === driver.id ? { ...d, status: 'On Trip' } : d);
    
    setTrucks(updatedTrucks);
    setDrivers(updatedDrivers);
    setDispatchModalOpen(false);
    setDispatchData({ driverId: '', cargoWeight: '', cargo: '', destCity: '', destCoords: null });
  };

  const handleCompleteTrip = (e) => {
    e.preventDefault();
    const updatedTrucks = trucks.map(t => {
        if (t.id === selectedVehicleView.id) {
            const updated = { 
                ...t, status: 'Available', currentCargoWeight: 0, driverId: null, driver: 'Unassigned',
                odometer: t.odometer + Number(completeTripData.odometer),
                fuelLevel: Math.max(0, t.fuelLevel - Number(completeTripData.fuelConsumed)),
                cargo: 'None', route: 'None', destCity: 'None', destCoords: null, speed: '0 mph', journeyProgress: 0
            };
            setSelectedVehicleView(updated);
            return updated;
        }
        return t;
    });
    const updatedDrivers = drivers.map(d => d.id === selectedVehicleView.driverId ? { ...d, status: 'Available' } : d);
    setTrucks(updatedTrucks);
    setDrivers(updatedDrivers);
    setCompleteTripModalOpen(false);
    setCompleteTripData({ odometer: '', fuelConsumed: '' });
  };

  const handleCancelTrip = () => {
    if(!window.confirm("Are you sure you want to cancel this trip?")) return;
    const updatedTrucks = trucks.map(t => {
        if (t.id === selectedVehicleView.id) {
            const updated = { ...t, status: 'Available', currentCargoWeight: 0, driverId: null, driver: 'Unassigned', cargo: 'None', route: 'None', destCity: 'None', destCoords: null, speed: '0 mph', journeyProgress: 0 };
            setSelectedVehicleView(updated);
            return updated;
        }
        return t;
    });
    const updatedDrivers = drivers.map(d => d.id === selectedVehicleView.driverId ? { ...d, status: 'Available' } : d);
    setTrucks(updatedTrucks);
    setDrivers(updatedDrivers);
  };

  const handleMaintenance = (e) => {
    e.preventDefault();
    const updatedTrucks = trucks.map(t => {
        if (t.id === selectedVehicleView.id) {
            const updated = { ...t, status: 'In Shop' };
            setSelectedVehicleView(updated);
            return updated;
        }
        return t;
    });
    setTrucks(updatedTrucks);
    setMaintenanceModalOpen(false);
    setMaintenanceReason('');
  };

  const handleCloseMaintenance = () => {
    const updatedTrucks = trucks.map(t => {
        if (t.id === selectedVehicleView.id) {
            const updated = { ...t, status: 'Available' };
            setSelectedVehicleView(updated);
            return updated;
        }
        return t;
    });
    setTrucks(updatedTrucks);
  };

  const handleRetireTruck = () => {
    if(!window.confirm("Are you sure you want to completely retire this vehicle? This action is permanent.")) return;
    const updatedTrucks = trucks.map(t => {
        if (t.id === selectedVehicleView.id) {
            const updated = { ...t, status: 'Retired' };
            setSelectedVehicleView(updated);
            return updated;
        }
        return t;
    });
    setTrucks(updatedTrucks);
  };

  // --- DERIVED KPI DATA ---
  const kpiActiveVehicles = trucks.filter(t => t.status === 'On Trip').length;
  const kpiAvailableVehicles = trucks.filter(t => t.status === 'Available').length;
  const kpiVehiclesInShop = trucks.filter(t => t.status === 'In Shop').length;
  const kpiDriversOnDuty = drivers.filter(d => d.status === 'On Trip').length;
  const totalOperational = trucks.filter(t => t.status !== 'Retired').length;
  const fleetUtilPercent = totalOperational > 0 ? Math.round((kpiActiveVehicles / totalOperational) * 100) : 0;
  
  const kpiPendingTrips = 0;

  // --- REGISTRY FILTERING ---
  const uniqueRegions = ['All', ...new Set(trucks.map(t => t.city))];
  const filteredTrucks = trucks.filter(t => {
    if (filterType !== 'All' && t.type !== filterType) return false;
    if (filterStatus !== 'All' && t.status !== filterStatus) return false;
    if (filterRegion !== 'All' && t.city !== filterRegion) return false;
    return true;
  });

  const capacityPercent = selectedVehicleView ? Math.round((selectedVehicleView.currentCargoWeight / selectedVehicleView.maxCapacity) * 100) : 0;
  const availableDrivers = drivers.filter(d => d.status === 'Available' && d.licenseStatus === 'Valid');

  return (
    <div className="fixed inset-0 w-screen h-screen bg-background text-on-surface flex overflow-hidden z-40">
      
      {/* 1. Left Sidebar navigation */}
      <aside className="w-64 border-r border-white/10 bg-surface-dim/75 backdrop-blur-2xl flex flex-col justify-between p-6 z-50 shrink-0">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-2">
            <Logo />
          </div>

          <nav className="flex flex-col gap-1.5">
            <button onClick={() => { setActiveTab('overview'); setSelectedVehicleView(null); }} className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-body text-xs font-semibold tracking-wide transition-all cursor-pointer ${activeTab === 'overview' ? 'bg-primary text-white border border-primary/20 shadow-[0_4px_12px_rgba(59,130,246,0.25)]' : 'text-on-surface-variant hover:text-white hover:bg-white/5 border border-transparent'}`}>
              <Activity className="h-4.5 w-4.5" /> Command Overview
            </button>
            <button onClick={() => setActiveTab('vehicles')} className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-body text-xs font-semibold tracking-wide transition-all cursor-pointer ${activeTab === 'vehicles' ? 'bg-primary text-white border border-primary/20 shadow-[0_4px_12px_rgba(59,130,246,0.25)]' : 'text-on-surface-variant hover:text-white hover:bg-white/5 border border-transparent'}`}>
              <Truck className="h-4.5 w-4.5" /> Vehicles Command
            </button>
            <button onClick={() => setActiveTab('employees')} className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-body text-xs font-semibold tracking-wide transition-all cursor-pointer ${activeTab === 'employees' ? 'bg-primary text-white border border-primary/20 shadow-[0_4px_12px_rgba(59,130,246,0.25)]' : 'text-on-surface-variant hover:text-white hover:bg-white/5 border border-transparent'}`}>
              <Users className="h-4.5 w-4.5" /> Employee Operations
            </button>
            <button onClick={() => setActiveTab('consignments')} className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-body text-xs font-semibold tracking-wide transition-all cursor-pointer ${activeTab === 'consignments' ? 'bg-primary text-white border border-primary/20 shadow-[0_4px_12px_rgba(59,130,246,0.25)]' : 'text-on-surface-variant hover:text-white hover:bg-white/5 border border-transparent'}`}>
              <Package className="h-4.5 w-4.5" /> Consignments Registry
            </button>
          </nav>
        </div>

        <div className="flex flex-col gap-3.5 border-t border-white/5 pt-5">
          <button onClick={() => onNavigate('home')} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-body text-xs font-semibold text-error border border-error/20 bg-error/5 hover:bg-error/10 hover:border-error/35 transition-all cursor-pointer">
            <LogOut className="h-4 w-4" /> Logout Station
          </button>
        </div>
      </aside>

      {/* 2. Main Page Content Section */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--color-surface-container-low)_0%,_var(--color-background)_100%)] p-6 md:p-8">
        
        <header className="w-full flex items-center justify-between mb-6 md:mb-8 shrink-0">
          <div>
            <h1 className="font-headline text-2xl font-bold tracking-tight text-on-surface flex items-center gap-2.5">
              {activeTab === 'overview' && 'Operations Center'}
              {activeTab === 'vehicles' && 'Vehicles Command'}
              {activeTab === 'overview' && (
                <span className="inline-flex items-center gap-1 text-[9px] font-mono-label px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                  <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" /> Live Telemetry
                </span>
              )}
            </h1>
            <p className="mt-1 font-body text-xs text-on-surface-variant">
              {activeTab === 'overview' && 'Comprehensive fleet status tracking.'}
              {activeTab === 'vehicles' && 'Manage fleet operations, enforce rules, and assign transit.'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleRefresh} className={`p-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-on-surface-variant hover:text-white cursor-pointer ${isRefreshing ? 'animate-spin' : ''}`}><RefreshCw className="h-4.5 w-4.5" /></button>

            {/* Notification Bell */}
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
                      initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.15 }}
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

        {/* OVERVIEW TAB CONTENT */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="w-full flex-1 flex flex-col gap-6 md:gap-8 justify-between">
            
            {/* --- KPI RIBBON --- */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 w-full shrink-0">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block mb-1">Active Vehicles</span>
                    <span className="text-2xl font-bold text-primary">{kpiActiveVehicles}</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block mb-1">Available</span>
                    <span className="text-2xl font-bold text-emerald-400">{kpiAvailableVehicles}</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block mb-1">In Shop</span>
                    <span className="text-2xl font-bold text-amber-400">{kpiVehiclesInShop}</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block mb-1">Active Trips</span>
                    <span className="text-2xl font-bold text-on-surface">{kpiActiveVehicles}</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block mb-1">Pending Trips</span>
                    <span className="text-2xl font-bold text-on-surface-variant">{kpiPendingTrips}</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block mb-1">Drivers On Duty</span>
                    <span className="text-2xl font-bold text-indigo-400">{kpiDriversOnDuty}</span>
                </div>
                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 backdrop-blur-md flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 h-1 bg-primary transition-all" style={{width: `${fleetUtilPercent}%`}}></div>
                    <span className="text-[10px] uppercase font-bold text-primary tracking-wider block mb-1">Fleet Util</span>
                    <span className="text-2xl font-bold text-primary">{fleetUtilPercent}%</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch flex-1">
              <div className="lg:col-span-8 rounded-[2rem] border border-white/10 bg-white/[0.01] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),_0_12px_24px_rgba(0,0,0,0.3)] backdrop-blur-3xl p-6 min-h-[400px] flex flex-col relative overflow-hidden">
                <div className="flex-1 border border-white/5 rounded-2xl relative overflow-hidden shadow-inner flex items-center justify-center z-10 bg-background/50">
                  <MapContainer center={[38.5, -96.0]} zoom={4} zoomControl={true} className="w-full h-full z-10" style={{ height: '100%', width: '100%', minHeight: '340px' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {trucks.filter(t => t.status === 'On Trip').map((trk) => {
                      const coords = decodeGeohash(trk.geohash);
                      return (
                        <Marker key={trk.id} position={coords} icon={getTruckIcon(trk.status, selectedTruck.id === trk.id)} eventHandlers={{click: () => setSelectedTruck(trk)}}>
                          <Popup><div className="text-left text-white leading-normal"><span className="block text-xs font-bold text-primary">{trk.id}</span></div></Popup>
                        </Marker>
                      );
                    })}
                    {activeRoutePath.length > 0 && selectedTruck?.status === 'On Trip' && (
                      <Polyline positions={activeRoutePath} color="#3b82f6" weight={4} opacity={0.85} />
                    )}
                    <MapController selectedTruck={selectedTruck} />
                  </MapContainer>
                </div>
              </div>
              <div className="lg:col-span-4 rounded-[2rem] border border-white/10 bg-white/[0.01] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),_0_12px_24px_rgba(0,0,0,0.3)] backdrop-blur-3xl p-6 flex flex-col h-full overflow-hidden">
                <span className="text-xs font-bold text-on-surface uppercase tracking-wider mb-4 block text-left">Active Journeys ({trucks.filter(t => t.status === 'On Trip').length})</span>
                <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-1">
                  {trucks.filter(t => t.status === 'On Trip').map((trk) => (
                    <button key={trk.id} onClick={() => setSelectedTruck(trk)} className={`w-full p-3.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${selectedTruck.id === trk.id ? 'bg-primary/10 border-primary shadow-sm' : 'border-white/5 bg-white/[0.01] hover:bg-white/5 hover:border-white/10'}`}>
                      <div className="flex items-center gap-3">
                        <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                        <div><span className="text-xs font-bold text-on-surface block">{trk.id}</span><span className="text-[10px] text-on-surface-variant block mt-0.5">{trk.driver}</span></div>
                      </div>
                    </button>
                  ))}
                  {trucks.filter(t => t.status === 'On Trip').length === 0 && (
                     <div className="text-center p-4 text-xs font-medium text-on-surface-variant">No vehicles currently on trip.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Attention Required Section */}
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
                      <button onClick={() => window.alert(`Initiated action: ${alert.action}`)} className="shrink-0 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-on-surface cursor-pointer whitespace-nowrap">{alert.action}</button>
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
                        <span className="h-6 w-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5"><CreditCard className="w-3.5 h-3.5" /></span>
                        <div className="min-w-0"><span className="block text-xs font-bold text-on-surface">{salary.department}</span><p className="text-[11px] text-on-surface-variant leading-normal mt-0.5 truncate-2-lines">{salary.msg}</p></div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="text-xs font-bold text-emerald-400 font-mono-label">{salary.amount}</span>
                        <button onClick={() => window.alert(`Cleared payroll for ${salary.department}`)} className="text-[9px] font-semibold px-2 py-1 rounded bg-primary text-white border border-primary/20 hover:scale-[1.02] active:scale-98 transition-all cursor-pointer flex items-center gap-1.5"><Check className="w-2.5 h-2.5" /> Approve</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* VEHICLES TAB CONTENT */}
        {activeTab === 'vehicles' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="w-full flex-1 flex flex-col h-full overflow-hidden">
            {selectedVehicleView ? (
              // Vehicle Detail Pane
              <div className="flex flex-col h-full bg-white/[0.02] rounded-[2rem] border border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl relative">
                <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setSelectedVehicleView(null)} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer text-on-surface"><ChevronLeft className="w-5 h-5" /></button>
                    <div>
                      <h2 className="text-lg font-bold text-on-surface font-headline">{selectedVehicleView.name}</h2>
                      <span className="text-xs text-on-surface-variant font-mono-label">{selectedVehicleView.id} • License: {selectedVehicleView.licenseNumber} • {selectedVehicleView.type}</span>
                    </div>
                  </div>
                  <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${selectedVehicleView.status === 'On Trip' ? 'bg-primary/20 text-primary' : selectedVehicleView.status === 'In Shop' ? 'bg-amber-400/20 text-amber-400' : selectedVehicleView.status === 'Retired' ? 'bg-error/20 text-error' : 'bg-surface-bright text-on-surface-variant'}`}>
                    {selectedVehicleView.status.toUpperCase()}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start h-full">
                    <div className="flex flex-col gap-6 h-full">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 rounded-[1.5rem] bg-white/5 border border-white/10 flex flex-col gap-1">
                          <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Assigned Operator</span>
                          <span className="text-sm font-bold text-on-surface">{selectedVehicleView.driver}</span>
                        </div>
                        <div className="p-5 rounded-[1.5rem] bg-white/5 border border-white/10 flex flex-col gap-1 text-right">
                          <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider flex items-center justify-end gap-1"><DollarSign className="w-3 h-3"/> Acquisition Cost</span>
                          <span className="text-sm font-bold text-emerald-400">${selectedVehicleView.acquisitionCost?.toLocaleString() || 0}</span>
                        </div>
                      </div>

                      <div className="flex-1 rounded-[1.5rem] border border-white/10 overflow-hidden relative min-h-[300px]">
                        {selectedVehicleView.status === 'On Trip' ? (
                           <MapContainer center={decodeGeohash(selectedVehicleView.geohash)} zoom={8} zoomControl={false} className="w-full h-full z-10 bg-background/50">
                              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                              <Marker position={decodeGeohash(selectedVehicleView.geohash)} icon={getTruckIcon(selectedVehicleView.status, true)} />
                              {activeRoutePath.length > 0 && <Polyline positions={activeRoutePath} color="#3b82f6" weight={4} opacity={0.85} />}
                           </MapContainer>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-surface-dim border-2 border-dashed border-white/10 rounded-[1.5rem]">
                             <MapPin className="w-10 h-10 text-on-surface-variant mb-2 opacity-50" />
                             <span className="text-xs text-on-surface-variant font-medium">Vehicle is currently {selectedVehicleView.status.toLowerCase()}.</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-6">
                      <div className="p-6 rounded-[1.5rem] bg-white/5 border border-white/10 flex flex-col gap-5">
                         <div>
                            <div className="flex justify-between items-end mb-2">
                               <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider flex items-center gap-1.5"><Package className="w-3.5 h-3.5"/> Cargo Capacity</span>
                               <span className="text-xs font-bold text-on-surface">{selectedVehicleView.currentCargoWeight.toLocaleString()} / {selectedVehicleView.maxCapacity.toLocaleString()} kg ({capacityPercent}%)</span>
                            </div>
                            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                               <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${capacityPercent}%` }} />
                            </div>
                         </div>
                         <div>
                            <div className="flex justify-between items-end mb-2">
                               <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider flex items-center gap-1.5">{selectedVehicleView.type === 'EV' ? <Zap className="w-3.5 h-3.5"/> : <Droplet className="w-3.5 h-3.5"/>} Energy</span>
                               <span className="text-xs font-bold text-on-surface">{selectedVehicleView.fuelLevel}%</span>
                            </div>
                            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                               <div className={`h-full rounded-full ${selectedVehicleView.fuelLevel < 25 ? 'bg-error' : selectedVehicleView.fuelLevel < 50 ? 'bg-amber-400' : 'bg-primary'}`} style={{ width: `${selectedVehicleView.fuelLevel}%` }} />
                            </div>
                         </div>
                         <div className="flex justify-between items-end">
                            <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Odometer</span>
                            <span className="text-xs font-bold text-on-surface font-mono-label">{selectedVehicleView.odometer.toLocaleString()} km</span>
                         </div>
                         {selectedVehicleView.status === 'On Trip' && (
                           <div className="mt-2">
                              <div className="flex justify-between items-end mb-2">
                                 <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider flex items-center gap-1.5"><Navigation className="w-3.5 h-3.5"/> Journey</span>
                                 <span className="text-xs font-bold text-on-surface">{selectedVehicleView.journeyProgress}%</span>
                              </div>
                              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                 <div className="h-full bg-indigo-400 rounded-full relative overflow-hidden" style={{ width: `${selectedVehicleView.journeyProgress}%` }}><div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse"></div></div>
                              </div>
                           </div>
                         )}
                      </div>

                      {/* Action Buttons specific to business rules */}
                      <div className="flex flex-col gap-3 mt-auto border-t border-white/10 pt-6">
                        {selectedVehicleView.status === 'Available' && (
                           <>
                              <button onClick={() => setDispatchModalOpen(true)} className="w-full p-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all bg-primary text-white border border-primary/20 hover:bg-primary/90 cursor-pointer">
                                <Play className="w-4 h-4" /> Dispatch on Trip
                              </button>
                              <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => setMaintenanceModalOpen(true)} className="w-full p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all bg-white/5 border border-white/10 hover:bg-amber-400/10 hover:text-amber-400 hover:border-amber-400/30 text-on-surface cursor-pointer">
                                  <Wrench className="w-4 h-4" /> Send to Shop
                                </button>
                                <button onClick={handleRetireTruck} className="w-full p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all bg-white/5 border border-white/10 hover:bg-error/10 hover:text-error hover:border-error/30 text-on-surface cursor-pointer">
                                  <ShieldAlert className="w-4 h-4" /> Retire Truck
                                </button>
                              </div>
                           </>
                        )}
                        {selectedVehicleView.status === 'On Trip' && (
                           <div className="grid grid-cols-2 gap-3">
                              <button onClick={() => setCompleteTripModalOpen(true)} className="w-full p-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all bg-emerald-500 text-white border border-emerald-500/20 hover:bg-emerald-600 cursor-pointer">
                                <Check className="w-4 h-4" /> Complete Trip
                              </button>
                              <button onClick={handleCancelTrip} className="w-full p-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all bg-error/10 text-error border border-error/20 hover:bg-error/20 cursor-pointer">
                                <StopCircle className="w-4 h-4" /> Cancel Trip
                              </button>
                           </div>
                        )}
                        {selectedVehicleView.status === 'In Shop' && (
                           <div className="grid grid-cols-2 gap-3">
                              <button onClick={handleCloseMaintenance} className="w-full p-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 cursor-pointer">
                                <RefreshCcw className="w-4 h-4" /> Close Maintenance
                              </button>
                              <button onClick={handleRetireTruck} className="w-full p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all bg-white/5 border border-white/10 hover:bg-error/10 hover:text-error hover:border-error/30 text-on-surface cursor-pointer">
                                <ShieldAlert className="w-4 h-4" /> Retire Truck
                              </button>
                           </div>
                        )}
                        {selectedVehicleView.status === 'Retired' && (
                           <div className="w-full p-4 rounded-xl border border-error/20 bg-error/5 text-center">
                              <span className="text-xs font-bold text-error block">This vehicle has been permanently retired.</span>
                           </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Vehicles List View
              <div className="flex flex-col h-full">
                
                {/* FILTER BAR & ADD BUTTON */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6 shrink-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                        <Filter className="w-4 h-4 text-on-surface-variant" />
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide border-r border-white/10 pr-2 mr-1">Filter</span>
                        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="bg-transparent text-xs text-on-surface font-semibold focus:outline-none appearance-none pr-4 cursor-pointer">
                           <option value="All" className="text-black">All Types</option>
                           <option value="ICE" className="text-black">ICE Only</option>
                           <option value="EV" className="text-black">EV Only</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-transparent text-xs text-on-surface font-semibold focus:outline-none appearance-none pr-4 cursor-pointer">
                           <option value="All" className="text-black">All Statuses</option>
                           <option value="Available" className="text-black">Available</option>
                           <option value="On Trip" className="text-black">On Trip</option>
                           <option value="In Shop" className="text-black">In Shop</option>
                           <option value="Retired" className="text-black">Retired</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                        <select value={filterRegion} onChange={(e) => setFilterRegion(e.target.value)} className="bg-transparent text-xs text-on-surface font-semibold focus:outline-none appearance-none pr-4 cursor-pointer max-w-[120px] truncate">
                           {uniqueRegions.map(r => <option key={r} value={r} className="text-black">{r === 'All' ? 'All Regions' : r}</option>)}
                        </select>
                    </div>
                  </div>

                  <button onClick={() => setIsAddingVehicle(true)} className="px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold tracking-wide flex items-center gap-2 shadow-[0_4px_12px_rgba(59,130,246,0.3)] hover:bg-primary/90 transition-all cursor-pointer">
                    <Plus className="w-4 h-4" /> Add New Vehicle
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-6">
                  {filteredTrucks.length === 0 && (
                     <div className="col-span-full py-12 flex flex-col items-center justify-center text-on-surface-variant">
                        <Filter className="w-12 h-12 mb-3 opacity-20" />
                        <span className="text-sm font-bold">No vehicles match filters</span>
                        <button onClick={() => {setFilterType('All'); setFilterStatus('All'); setFilterRegion('All');}} className="mt-3 text-xs text-primary hover:underline cursor-pointer">Clear Filters</button>
                     </div>
                  )}
                  {filteredTrucks.map((truck) => (
                    <div key={truck.id} onClick={() => setSelectedVehicleView(truck)} className="p-5 rounded-[1.5rem] bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] hover:border-white/20 transition-all cursor-pointer group flex flex-col gap-4 relative overflow-hidden">
                      {/* Price badge absolute */}
                      <div className="absolute top-0 right-0 bg-white/5 border-b border-l border-white/10 px-3 py-1.5 rounded-bl-xl">
                         <span className="text-[9px] font-bold text-emerald-400/80 font-mono-label flex items-center gap-1"><DollarSign className="w-2.5 h-2.5"/> {truck.acquisitionCost?.toLocaleString() || 0}</span>
                      </div>

                      <div className="flex justify-between items-start mt-1">
                        <div>
                           <h3 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">{truck.name}</h3>
                           <span className="text-[10px] font-mono-label text-on-surface-variant block mt-1">{truck.id} • {truck.type} • {truck.city}</span>
                        </div>
                      </div>
                      
                      <div className="mt-auto grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] uppercase font-bold text-on-surface-variant tracking-wider">Capacity</span>
                          <span className="text-xs font-bold text-on-surface">{truck.currentCargoWeight.toLocaleString()}/{truck.maxCapacity.toLocaleString()}kg</span>
                        </div>
                        <div className="flex flex-col gap-1 text-right relative">
                           <span className={`absolute -top-14 right-0 inline-block text-[9px] font-bold px-2 py-0.5 rounded-full ${truck.status === 'On Trip' ? 'bg-primary/20 text-primary' : truck.status === 'In Shop' ? 'bg-amber-400/20 text-amber-400' : truck.status === 'Retired' ? 'bg-error/20 text-error' : 'bg-surface-bright text-on-surface-variant'}`}>
                            {truck.status.toUpperCase()}
                           </span>
                           <span className="text-[9px] uppercase font-bold text-on-surface-variant tracking-wider">Odometer</span>
                           <span className="text-xs font-bold text-on-surface">{truck.odometer.toLocaleString()} km</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* --- MODALS --- */}

      {/* Add New Vehicle Modal */}
      <AnimatePresence>
        {isAddingVehicle && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsAddingVehicle(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-surface-dim border border-white/10 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <h3 className="text-lg font-headline font-bold text-on-surface">Register New Vehicle</h3>
                <button onClick={() => setIsAddingVehicle(false)} className="text-on-surface-variant hover:text-white transition-colors cursor-pointer p-1"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAddVehicle} className="p-6 flex flex-col gap-4">
                <input type="text" required value={newVehicle.name} onChange={(e) => setNewVehicle({...newVehicle, name: e.target.value})} placeholder="Vehicle Name / Model" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-on-surface placeholder-on-surface/50 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all" />
                <input type="text" required value={newVehicle.licenseNumber} onChange={(e) => setNewVehicle({...newVehicle, licenseNumber: e.target.value})} placeholder="License Plate Number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-on-surface placeholder-on-surface/50 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all" />
                <input type="number" required value={newVehicle.maxCapacity} onChange={(e) => setNewVehicle({...newVehicle, maxCapacity: e.target.value})} placeholder="Max Load Capacity (kg)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-on-surface placeholder-on-surface/50 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all" />
                <input type="number" required value={newVehicle.acquisitionCost} onChange={(e) => setNewVehicle({...newVehicle, acquisitionCost: e.target.value})} placeholder="Acquisition Cost ($)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-on-surface placeholder-on-surface/50 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all" />
                
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <button type="button" onClick={() => setNewVehicle({...newVehicle, type: 'ICE'})} className={`py-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${newVehicle.type === 'ICE' ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 text-on-surface-variant'}`}><Droplet className="w-4 h-4" /> ICE</button>
                  <button type="button" onClick={() => setNewVehicle({...newVehicle, type: 'EV'})} className={`py-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${newVehicle.type === 'EV' ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 text-on-surface-variant'}`}><Zap className="w-4 h-4" /> EV</button>
                </div>
                <button type="submit" className="w-full py-3.5 mt-2 rounded-xl bg-primary text-white text-sm font-bold tracking-wide hover:bg-primary/90 transition-all cursor-pointer">Register Vehicle</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dispatch Trip Modal */}
      <AnimatePresence>
        {dispatchModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setDispatchModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-surface-dim border border-white/10 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-visible">
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <h3 className="text-lg font-headline font-bold text-on-surface">Dispatch Trip ({selectedVehicleView?.id})</h3>
                <button onClick={() => setDispatchModalOpen(false)} className="text-on-surface-variant hover:text-white transition-colors cursor-pointer p-1"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleDispatch} className="p-6 flex flex-col gap-4 overflow-visible">
                {dispatchError && <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-xs font-bold">{dispatchError}</div>}
                
                <select required value={dispatchData.driverId} onChange={(e) => setDispatchData({...dispatchData, driverId: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-all">
                  <option value="" disabled className="text-black">Select Available Driver</option>
                  {availableDrivers.length === 0 && <option disabled className="text-black">No Valid Drivers Available</option>}
                  {availableDrivers.map(d => <option key={d.id} value={d.id} className="text-black">{d.name} ({d.id})</option>)}
                </select>
                
                <LocationSearchInput 
                  onSelect={(loc) => {
                    if(loc) {
                        setDispatchData({...dispatchData, destCity: loc.name, destCoords: [loc.lat, loc.lon]});
                    } else {
                        setDispatchData({...dispatchData, destCity: '', destCoords: null});
                    }
                  }} 
                />

                <input type="number" required value={dispatchData.cargoWeight} onChange={(e) => setDispatchData({...dispatchData, cargoWeight: e.target.value})} placeholder={`Cargo Weight (Max: ${selectedVehicleView?.maxCapacity}kg)`} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-on-surface placeholder-on-surface/50 focus:outline-none focus:border-primary/50 transition-all" />
                <input type="text" required value={dispatchData.cargo} onChange={(e) => setDispatchData({...dispatchData, cargo: e.target.value})} placeholder="Cargo Description" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-on-surface placeholder-on-surface/50 focus:outline-none focus:border-primary/50 transition-all" />
                
                <button type="submit" disabled={availableDrivers.length === 0} className="w-full py-3.5 mt-2 rounded-xl bg-primary text-white text-sm font-bold tracking-wide hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50">Confirm Dispatch</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Complete Trip Modal */}
      <AnimatePresence>
        {completeTripModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setCompleteTripModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-surface-dim border border-white/10 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <h3 className="text-lg font-headline font-bold text-on-surface">Complete Trip Log</h3>
                <button onClick={() => setCompleteTripModalOpen(false)} className="text-on-surface-variant hover:text-white transition-colors cursor-pointer p-1"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCompleteTrip} className="p-6 flex flex-col gap-4">
                <div className="text-xs text-on-surface-variant mb-2">Finalizing trip for {selectedVehicleView?.driver} on {selectedVehicleView?.id}.</div>
                <input type="number" required value={completeTripData.odometer} onChange={(e) => setCompleteTripData({...completeTripData, odometer: e.target.value})} placeholder="Trip Distance (km)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-on-surface placeholder-on-surface/50 focus:outline-none focus:border-emerald-500/50 transition-all" />
                <input type="number" required value={completeTripData.fuelConsumed} onChange={(e) => setCompleteTripData({...completeTripData, fuelConsumed: e.target.value})} placeholder="Fuel/Battery Consumed (%)" max="100" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-on-surface placeholder-on-surface/50 focus:outline-none focus:border-emerald-500/50 transition-all" />
                <button type="submit" className="w-full py-3.5 mt-2 rounded-xl bg-emerald-500 text-white text-sm font-bold tracking-wide hover:bg-emerald-600 transition-all cursor-pointer">Submit & Close Trip</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Maintenance Modal */}
      <AnimatePresence>
        {maintenanceModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMaintenanceModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-surface-dim border border-white/10 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <h3 className="text-lg font-headline font-bold text-on-surface">Log Maintenance</h3>
                <button onClick={() => setMaintenanceModalOpen(false)} className="text-on-surface-variant hover:text-white transition-colors cursor-pointer p-1"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleMaintenance} className="p-6 flex flex-col gap-4">
                <textarea required value={maintenanceReason} onChange={(e) => setMaintenanceReason(e.target.value)} placeholder="Maintenance Reason (e.g., Oil Change, Brake Pads)" rows="3" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-on-surface placeholder-on-surface/50 focus:outline-none focus:border-amber-400/50 transition-all resize-none" />
                <button type="submit" className="w-full py-3.5 mt-2 rounded-xl bg-amber-500 text-white text-sm font-bold tracking-wide hover:bg-amber-600 transition-all cursor-pointer">Confirm Shop Order</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
