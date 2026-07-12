import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CreditCard, Info, Check } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import { KpiRibbon } from '../components/dashboard/KpiRibbon';
import { decodeGeohash, getTruckIcon, fetchOSRMRoute } from '../utils/mapUtils';
import { MOCK_ALERTS, MOCK_SALARIES } from '../data/mockData';

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

export function OverviewTab({ trucks, drivers }) {
  const onTripTrucks = trucks.filter(t => t.status === 'On Trip');
  const [selectedTruck, setSelectedTruck] = useState(onTripTrucks[0] || null);
  const [routePath, setRoutePath] = useState([]);

  useEffect(() => {
    if (!selectedTruck || selectedTruck.status !== 'On Trip') {
      setRoutePath([]);
      return;
    }
    let alive = true;
    const start = decodeGeohash(selectedTruck.geohash);
    const end = selectedTruck.destCoords || [start[0] + 1, start[1] + 1];
    fetchOSRMRoute(start, end).then(path => { if (alive) setRoutePath(path); });
    return () => { alive = false; };
  }, [selectedTruck]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="w-full flex-1 flex flex-col gap-6 md:gap-8">
      <KpiRibbon trucks={trucks} drivers={drivers} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch flex-1">
        {/* Map */}
        <div className="lg:col-span-8 rounded-2xl border border-outline/10 bg-surface shadow-sm p-5 min-h-[400px] flex flex-col overflow-hidden">
          <div className="flex-1 border border-outline/5 rounded-xl relative overflow-hidden bg-surface-container-low">
            <MapContainer center={[38.5, -96.0]} zoom={4} zoomControl={true} className="w-full h-full z-10" style={{ height: '100%', width: '100%', minHeight: '340px' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {onTripTrucks.map((trk) => {
                const coords = decodeGeohash(trk.geohash);
                return (
                  <Marker key={trk.id} position={coords} icon={getTruckIcon(trk.status, selectedTruck?.id === trk.id)} eventHandlers={{ click: () => setSelectedTruck(trk) }}>
                    <Popup><div className="text-left"><span className="block text-xs font-bold text-primary">{trk.id}</span><span className="block text-[10px] text-on-surface-variant">{trk.driver}</span></div></Popup>
                  </Marker>
                );
              })}
              {routePath.length > 0 && selectedTruck?.status === 'On Trip' && (
                <Polyline positions={routePath} color="#3b82f6" weight={4} opacity={0.85} />
              )}
              <MapController selectedTruck={selectedTruck} />
            </MapContainer>
          </div>
        </div>

        {/* Journey List */}
        <div className="lg:col-span-4 rounded-2xl border border-outline/10 bg-surface shadow-sm p-5 flex flex-col h-full overflow-hidden">
          <span className="text-xs font-bold text-on-surface uppercase tracking-wider mb-4 block text-left">Active Journeys ({onTripTrucks.length})</span>
          <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-1">
            {onTripTrucks.map((trk) => (
              <button key={trk.id} onClick={() => setSelectedTruck(trk)} className={`w-full p-3 rounded-xl border flex items-center gap-3 text-left transition-all cursor-pointer ${selectedTruck?.id === trk.id ? 'bg-primary/8 border-primary shadow-sm' : 'border-outline/5 bg-surface-container hover:bg-surface-container-high'}`}>
                <span className={`h-2.5 w-2.5 rounded-full ${selectedTruck?.id === trk.id ? 'bg-primary' : 'bg-outline'}`} />
                <div><span className="text-xs font-bold text-on-surface block">{trk.id}</span><span className="text-[10px] text-on-surface-variant block mt-0.5">{trk.driver} • {trk.destCity}</span></div>
              </button>
            ))}
            {onTripTrucks.length === 0 && <div className="text-center p-4 text-xs font-medium text-on-surface-variant">No vehicles currently on trip.</div>}
          </div>
        </div>
      </div>

      {/* Attention Required */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-start shrink-0">
        <div className="rounded-2xl border border-outline/10 bg-surface shadow-sm p-5 flex flex-col gap-4 text-left">
          <span className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-error animate-pulse" /> Truck Operations
          </span>
          <div className="flex flex-col gap-3">
            {MOCK_ALERTS.map((alert) => (
              <div key={alert.id} className="p-3 rounded-xl border border-outline/5 bg-surface-container flex items-center justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <span className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${alert.type === 'critical' ? 'bg-error/10 text-error' : 'bg-amber-500/10 text-amber-500'}`}>
                    {alert.type === 'critical' ? <AlertTriangle className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
                  </span>
                  <p className="text-xs text-on-surface-variant leading-relaxed">{alert.msg}</p>
                </div>
                <button className="shrink-0 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border border-outline/10 bg-surface-container-high hover:bg-surface-container-highest transition-all text-on-surface cursor-pointer whitespace-nowrap">{alert.action}</button>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-outline/10 bg-surface shadow-sm p-5 flex flex-col gap-4 text-left">
          <span className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" /> Employee Payroll
          </span>
          <div className="flex flex-col gap-3">
            {MOCK_SALARIES.map((salary) => (
              <div key={salary.id} className="p-3 rounded-xl border border-outline/5 bg-surface-container flex items-center justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="h-6 w-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5"><CreditCard className="w-3.5 h-3.5" /></span>
                  <div className="min-w-0"><span className="block text-xs font-bold text-on-surface">{salary.department}</span><p className="text-[11px] text-on-surface-variant leading-normal mt-0.5">{salary.msg}</p></div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-xs font-bold text-tertiary font-mono-label">{salary.amount}</span>
                  <button className="text-[9px] font-semibold px-2 py-1 rounded bg-primary text-on-primary hover:opacity-90 transition-all cursor-pointer flex items-center gap-1.5"><Check className="w-2.5 h-2.5" /> Approve</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
