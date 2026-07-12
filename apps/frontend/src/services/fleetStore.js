// ─── Fleet API client ───
// Talks to the backend fleet endpoints, which persist drivers, vehicles and the
// rest of the fleet data in the backend database (db.json). The driver portal,
// the owner's vehicle-assignment control and the dashboard all read/write here,
// so an assignment made by the incharge shows up in the driver's portal.
//
// A few company-code helpers remain client-side (localStorage): the dashboard
// header badge and the "active company code" remembered at signup.

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const ACTIVE_COMPANY_CODE_KEY = 'transitops_active_company_code';
const COMPANY_CODES_KEY = 'transitops_company_codes';

// A built-in demo company code so the portal is usable without a live signup.
export const DEMO_COMPANY_CODE = 'TRANSIT-OPS';

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });
  } catch {
    throw new Error('Backend is not reachable. Start apps/backend, then try again.');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Request failed. Please try again.');
  }
  return data;
}

// ─── Driver Portal ───

// Gate + employee login. Resolves to the driver record, throws with a message.
export async function portalLogin(companyCode, employeeCode) {
  const { driver } = await request('/fleet/portal/login', {
    method: 'POST',
    body: JSON.stringify({ companyCode, employeeCode }),
  });
  return driver;
}

export async function fetchDriver(code) {
  const { driver } = await request(`/fleet/drivers/${encodeURIComponent(code)}`);
  return driver;
}

export async function saveDriverProfile(code, profile) {
  const { driver } = await request(`/fleet/drivers/${encodeURIComponent(code)}/profile`, {
    method: 'PATCH',
    body: JSON.stringify(profile),
  });
  return driver;
}

// Owner/incharge action: assign (vehicle object) or clear (null) a driver's vehicle.
export async function assignVehicle(code, vehicle) {
  const { driver } = await request(`/fleet/drivers/${encodeURIComponent(code)}/vehicle`, {
    method: 'PATCH',
    body: JSON.stringify({ vehicle: vehicle || null }),
  });
  return driver;
}

// ─── Fleet datasets (for the control center dashboard) ───

export async function fetchDrivers() {
  const { drivers } = await request('/fleet/drivers');
  return drivers;
}

export async function fetchVehicles() {
  const { vehicles } = await request('/fleet/vehicles');
  return vehicles;
}

export async function fetchCollection(name) {
  const { items } = await request(`/fleet/collections/${encodeURIComponent(name)}`);
  return items;
}

// ─── Company codes (client-side convenience) ───

function getStoredCompanyCodes() {
  try {
    return JSON.parse(localStorage.getItem(COMPANY_CODES_KEY) || '[]');
  } catch {
    return [];
  }
}

export function registerCompanyCode(code) {
  const norm = (code || '').trim().toUpperCase();
  if (!norm || typeof localStorage === 'undefined') return;
  const codes = getStoredCompanyCodes();
  if (!codes.includes(norm)) {
    codes.push(norm);
    localStorage.setItem(COMPANY_CODES_KEY, JSON.stringify(codes));
  }
}

// Remember the code for the company using this workspace (set at company signup).
export function setActiveCompanyCode(code) {
  const norm = (code || '').trim().toUpperCase();
  if (!norm || typeof localStorage === 'undefined') return;
  localStorage.setItem(ACTIVE_COMPANY_CODE_KEY, norm);
  registerCompanyCode(norm);
}

// The current workspace's company code, falling back to the demo code.
export function getActiveCompanyCode() {
  const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(ACTIVE_COMPANY_CODE_KEY) : null;
  return raw || DEMO_COMPANY_CODE;
}
