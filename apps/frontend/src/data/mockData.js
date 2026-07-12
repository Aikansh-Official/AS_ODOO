// ─── Mock Data for the TransitOps Dashboard ───
// All mock datasets used across the application.

export const MOCK_DRIVERS = [
  { id: 'DRV-001', name: 'Arjun Sharma', licenseNumber: 'CDL-MV-2021', licenseCategory: 'CE', licenseExpiry: '2027-08-15', contactNumber: '+1-555-0101', safetyScore: 92, status: 'On Trip' },
  { id: 'DRV-002', name: 'Priya Nair', licenseNumber: 'CDL-SJ-2020', licenseCategory: 'C', licenseExpiry: '2027-03-22', contactNumber: '+1-555-0102', safetyScore: 88, status: 'On Trip' },
  { id: 'DRV-003', name: 'Ananya Reddy', licenseNumber: 'CDL-ER-2019', licenseCategory: 'CE', licenseExpiry: '2026-11-30', contactNumber: '+1-555-0103', safetyScore: 95, status: 'On Trip' },
  { id: 'DRV-004', name: 'Rohan Gupta', licenseNumber: 'CDL-DM-2018', licenseCategory: 'B', licenseExpiry: '2025-01-10', contactNumber: '+1-555-0104', safetyScore: 71, status: 'Available' },
  { id: 'DRV-005', name: 'Vikram Singh', licenseNumber: 'CDL-JC-2022', licenseCategory: 'CE', licenseExpiry: '2028-06-01', contactNumber: '+1-555-0105', safetyScore: 84, status: 'On Trip' },
  { id: 'DRV-006', name: 'Aditya Rao', licenseNumber: 'CDL-AO-2023', licenseCategory: 'C', licenseExpiry: '2029-02-28', contactNumber: '+1-555-0106', safetyScore: 90, status: 'Available' },
  { id: 'DRV-007', name: 'Rahul Verma', licenseNumber: 'CDL-JD-2017', licenseCategory: 'D', licenseExpiry: '2026-09-15', contactNumber: '+1-555-0107', safetyScore: 45, status: 'Suspended' },
  { id: 'DRV-008', name: 'Sneha Iyer', licenseNumber: 'CDL-MS-2021', licenseCategory: 'CE', licenseExpiry: '2027-12-01', contactNumber: '+1-555-0108', safetyScore: 97, status: 'Off Duty' },
];

export const MOCK_TRUCKS = [
  { id: 'TRK-4022', name: 'Volvo VNL 860', type: 'ICE', licenseNumber: 'NY-4928X', maxCapacity: 25000, currentCargoWeight: 20000, fuelLevel: 42, odometer: 154000, acquisitionCost: 165000, journeyProgress: 60, driverId: 'DRV-001', driver: 'Arjun Sharma', geohash: 'dr5reg', city: 'New York', status: 'On Trip', speed: '48 mph', cargo: 'Medical Supplies', route: 'NY -> BOS', destCity: 'Boston', destCoords: [42.3601, -71.0589] },
  { id: 'TRK-1105', name: 'Tesla Semi', type: 'EV', licenseNumber: 'CA-1029Y', maxCapacity: 35000, currentCargoWeight: 32000, fuelLevel: 80, odometer: 24000, acquisitionCost: 250000, journeyProgress: 25, driverId: 'DRV-002', driver: 'Priya Nair', geohash: 'dp3wt1', city: 'Chicago', status: 'On Trip', speed: '62 mph', cargo: 'Electronics', route: 'CHI -> DET', destCity: 'Detroit', destCoords: [42.3314, -83.0458] },
  { id: 'TRK-8901', name: 'Freightliner Cascadia', type: 'ICE', licenseNumber: 'TX-8392Z', maxCapacity: 40000, currentCargoWeight: 15000, fuelLevel: 65, odometer: 189000, acquisitionCost: 145000, journeyProgress: 88, driverId: 'DRV-003', driver: 'Ananya Reddy', geohash: 'c23nbd', city: 'Los Angeles', status: 'On Trip', speed: '55 mph', cargo: 'Automotive Parts', route: 'LA -> SF', destCity: 'San Francisco', destCoords: [37.7749, -122.4194] },
  { id: 'TRK-5520', name: 'Peterbilt 579', type: 'ICE', licenseNumber: 'FL-2019A', maxCapacity: 22000, currentCargoWeight: 0, fuelLevel: 15, odometer: 225000, acquisitionCost: 130000, journeyProgress: 0, driverId: null, driver: 'Unassigned', geohash: 'dpu58z', city: 'Houston', status: 'In Shop', speed: '0 mph', cargo: 'None', route: 'None', destCity: 'None', destCoords: null },
  { id: 'TRK-7712', name: 'Rivian Commercial', type: 'EV', licenseNumber: 'GA-5091B', maxCapacity: 12000, currentCargoWeight: 10000, fuelLevel: 90, odometer: 8500, acquisitionCost: 95000, journeyProgress: 10, driverId: 'DRV-005', driver: 'Vikram Singh', geohash: 'dn5bpf', city: 'Atlanta', status: 'On Trip', speed: '58 mph', cargo: 'Dry Goods', route: 'ATL -> MIA', destCity: 'Miami', destCoords: [25.7617, -80.1918] },
  { id: 'TRK-9099', name: 'Volvo VNR Electric', type: 'EV', licenseNumber: 'NV-1102C', maxCapacity: 33000, currentCargoWeight: 0, fuelLevel: 100, odometer: 12000, acquisitionCost: 210000, journeyProgress: 0, driverId: null, driver: 'Unassigned', geohash: '9q5cs', city: 'Las Vegas', status: 'Available', speed: '0 mph', cargo: 'None', route: 'None', destCity: 'None', destCoords: null }
];

export const MOCK_TRIPS = [
  { id: 'TRP-001', vehicleId: 'TRK-4022', driverId: 'DRV-001', source: 'New York', sourceCoords: [40.7128, -74.006], destination: 'Boston', destCoords: [42.3601, -71.0589], cargoWeight: 20000, plannedDistance: 350, cargo: 'Medical Supplies', status: 'Dispatched', createdAt: '2026-07-10', dispatchedAt: '2026-07-10' },
  { id: 'TRP-002', vehicleId: 'TRK-1105', driverId: 'DRV-002', source: 'Chicago', sourceCoords: [41.8781, -87.6298], destination: 'Detroit', destCoords: [42.3314, -83.0458], cargoWeight: 32000, plannedDistance: 280, cargo: 'Electronics', status: 'Dispatched', createdAt: '2026-07-11', dispatchedAt: '2026-07-11' },
  { id: 'TRP-003', vehicleId: 'TRK-8901', driverId: 'DRV-003', source: 'Los Angeles', sourceCoords: [34.0522, -118.2437], destination: 'San Francisco', destCoords: [37.7749, -122.4194], cargoWeight: 15000, plannedDistance: 380, cargo: 'Automotive Parts', status: 'Dispatched', createdAt: '2026-07-09', dispatchedAt: '2026-07-09' },
  { id: 'TRP-004', vehicleId: 'TRK-7712', driverId: 'DRV-005', source: 'Atlanta', sourceCoords: [33.749, -84.388], destination: 'Miami', destCoords: [25.7617, -80.1918], cargoWeight: 10000, plannedDistance: 660, cargo: 'Dry Goods', status: 'Dispatched', createdAt: '2026-07-12', dispatchedAt: '2026-07-12' },
  { id: 'TRP-005', vehicleId: 'TRK-9099', driverId: null, source: 'Las Vegas', sourceCoords: [36.1699, -115.1398], destination: 'Phoenix', destCoords: [33.4484, -112.074], cargoWeight: 5000, plannedDistance: 300, cargo: 'Retail Goods', status: 'Draft', createdAt: '2026-07-12', dispatchedAt: null },
];

export const MOCK_MAINTENANCE = [
  { id: 'MNT-001', vehicleId: 'TRK-5520', type: 'Unscheduled', description: 'Engine overheating — coolant system replacement', cost: 4500, date: '2026-07-08', status: 'Open' },
  { id: 'MNT-002', vehicleId: 'TRK-4022', type: 'Scheduled', description: 'Routine 150k km service — oil, filters, brakes', cost: 1200, date: '2026-06-15', status: 'Closed' },
  { id: 'MNT-003', vehicleId: 'TRK-8901', type: 'Repair', description: 'Tire blowout on rear axle — full replacement', cost: 2800, date: '2026-06-28', status: 'Closed' },
];

export const MOCK_FUEL_LOGS = [
  { id: 'FL-001', vehicleId: 'TRK-4022', liters: 320, cost: 576, date: '2026-07-09', odometerAtFill: 153700 },
  { id: 'FL-002', vehicleId: 'TRK-8901', liters: 400, cost: 720, date: '2026-07-07', odometerAtFill: 188600 },
  { id: 'FL-003', vehicleId: 'TRK-5520', liters: 250, cost: 450, date: '2026-07-01', odometerAtFill: 224800 },
  { id: 'FL-004', vehicleId: 'TRK-1105', liters: 0, cost: 85, date: '2026-07-10', odometerAtFill: 23800 },
  { id: 'FL-005', vehicleId: 'TRK-7712', liters: 0, cost: 42, date: '2026-07-11', odometerAtFill: 8400 },
];

export const MOCK_EXPENSES = [
  { id: 'EXP-001', vehicleId: 'TRK-4022', category: 'Tolls', amount: 125, date: '2026-07-10', description: 'I-95 Northeast corridor tolls' },
  { id: 'EXP-002', vehicleId: 'TRK-8901', category: 'Tolls', amount: 80, date: '2026-07-09', description: 'CA Turnpike toll charges' },
  { id: 'EXP-003', vehicleId: 'TRK-5520', category: 'Insurance', amount: 350, date: '2026-07-01', description: 'Monthly comprehensive insurance premium' },
  { id: 'EXP-004', vehicleId: 'TRK-1105', category: 'Other', amount: 200, date: '2026-07-05', description: 'Cargo netting and tie-down replacement' },
];

export const MOCK_ALERTS = [
  { id: 'ALT-01', type: 'critical', msg: 'Truck TRK-4022 — Route deviation detected near I-95 corridor.', action: 'Recalculate Route' },
  { id: 'ALT-02', type: 'warning', msg: 'Truck TRK-5520 — Core engine temperature spike detected.', action: 'Send Service Alert' }
];

export const MOCK_SALARIES = [
  { id: 'SAL-01', department: 'Fleet Operators', msg: 'July 2026 operator salary payroll pending disbursement clearance.', amount: '₹148,250' }
];

export const MOCK_NOTIFICATIONS = [
  { id: 1, title: 'System Security', desc: 'Terminal node connection verified.', time: '1 hour ago' }
];

// Helper: check if a driver's license is expired
export function isLicenseExpired(driver) {
  return new Date(driver.licenseExpiry) < new Date();
}

// Helper: check if a driver can be assigned to a trip
export function isDriverAssignable(driver) {
  return driver.status === 'Available' && !isLicenseExpired(driver) && driver.status !== 'Suspended';
}
