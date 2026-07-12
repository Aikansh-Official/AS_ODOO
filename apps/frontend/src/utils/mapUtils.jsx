// ─── Map Utilities for TransitOps Dashboard ───
import { useState, useEffect } from 'react';
import L from 'leaflet';

// Base32 Geohash Decoder
export function decodeGeohash(geohash) {
  const B32 = "0123456789bcdefghjkmnpqrstuvwxyz";
  const B32_MAP = {};
  for (let i = 0; i < B32.length; i++) B32_MAP[B32[i]] = i;

  let minLat = -90.0, maxLat = 90.0;
  let minLon = -180.0, maxLon = 180.0;
  let isEven = true;

  if (!geohash) return [0, 0];

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

// Truck Map Marker Icon Generator
export function getTruckIcon(status, isSelected) {
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
    className: 'custom-truck-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// Live Map Location Search Autocomplete Input
export function LocationSearchInput({ onSelect, initialQuery = '' }) {
  const [query, setQuery] = useState(initialQuery);
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
        } catch (err) {
          console.error("Geocoding error", err);
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
          onSelect(null);
        }}
        placeholder="Search Map Location (e.g. Seattle, WA)"
        className="w-full bg-white/5 border border-outline/30 rounded-xl px-4 py-3 text-sm text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary/50 transition-all"
        required
      />
      {isSearching && <span className="absolute right-4 top-3 text-xs text-primary animate-pulse">Searching...</span>}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 mt-1 w-full bg-surface border border-outline/20 rounded-xl overflow-hidden z-50 max-h-48 overflow-y-auto shadow-2xl">
          {results.map(r => (
            <div
              key={r.place_id}
              onClick={() => {
                const shortName = r.display_name.split(',')[0];
                onSelect({ name: shortName, fullName: r.display_name, lat: parseFloat(r.lat), lon: parseFloat(r.lon) });
                setQuery(r.display_name);
                setIsOpen(false);
              }}
              className="p-3 text-xs text-on-surface hover:bg-surface-container-high cursor-pointer border-b border-outline/10 last:border-0 truncate transition-colors"
            >
              {r.display_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Fetch OSRM route between two coordinate pairs
export async function fetchOSRMRoute(startCoord, endCoord) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${startCoord[1]},${startCoord[0]};${endCoord[1]},${endCoord[0]}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.routes && data.routes[0]) {
      return data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
    }
    return [startCoord, endCoord];
  } catch {
    return [startCoord, endCoord];
  }
}
