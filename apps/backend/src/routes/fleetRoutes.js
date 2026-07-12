import express from 'express';
import { z } from 'zod';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const fleetRouter = express.Router();
fleetRouter.use(requireAuth);

const vehicleSchema = z.object({
  registrationNumber: z.string().trim().min(3).max(32).regex(/^[A-Za-z0-9 -]+$/, 'Registration number can use letters, numbers, spaces and hyphens only.'),
  name: z.string().trim().min(2).max(120),
  vehicleType: z.string().trim().min(2).max(40),
  maxLoadKg: z.coerce.number().positive().max(1000000),
  odometerKm: z.coerce.number().min(0).max(10000000).default(0),
  acquisitionCost: z.coerce.number().min(0).max(100000000).default(0),
});

const driverSchema = z.object({
  fullName: z.string().trim().min(2).max(120).regex(/^[A-Za-z][A-Za-z .'-]+$/),
  licenseNumber: z.string().trim().min(3).max(64).regex(/^[A-Za-z0-9-]+$/),
  licenseCategory: z.string().trim().min(1).max(20),
  licenseExpiry: z.string().date(),
  phone: z.string().trim().min(8).max(20).regex(/^\+?[0-9][0-9 -]*$/),
  safetyScore: z.coerce.number().min(0).max(100).default(80),
});

const tripSchema = z.object({
  vehicleId: z.string().uuid(),
  driverId: z.string().uuid(),
  source: z.string().trim().min(2).max(160),
  destination: z.string().trim().min(2).max(160),
  cargo: z.string().trim().min(1).max(240).default('General freight'),
  cargoWeightKg: z.coerce.number().positive().max(1000000),
  plannedDistanceKm: z.coerce.number().min(0).max(1000000).default(0),
});

const completionSchema = z.object({
  finalOdometerKm: z.coerce.number().min(0).max(10000000),
  fuelConsumedLiters: z.coerce.number().min(0).max(1000000),
});

const maintenanceSchema = z.object({
  vehicleId: z.string().uuid(),
  maintenanceType: z.string().trim().min(2).max(40),
  description: z.string().trim().min(3).max(500),
  cost: z.coerce.number().min(0).max(100000000),
});

const fuelSchema = z.object({
  vehicleId: z.string().uuid(),
  liters: z.coerce.number().min(0).max(1000000),
  cost: z.coerce.number().min(0).max(100000000),
  odometerKm: z.coerce.number().min(0).max(10000000),
});

const expenseSchema = z.object({
  vehicleId: z.string().uuid().nullable().optional(),
  category: z.string().trim().min(2).max(80),
  amount: z.coerce.number().min(0).max(100000000),
  description: z.string().trim().max(500).optional(),
  incurredAt: z.string().date().optional(),
});

function parse(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) {
    const error = new Error(result.error.issues[0].message);
    error.statusCode = 400;
    throw error;
  }
  return result.data;
}

async function companyIdFor(client, userId) {
  const result = await client.query(
    `SELECT c.id
       FROM companies c
      WHERE c.owner_user_id = $1
      UNION
     SELECT c.id
       FROM companies c
       JOIN employee_profiles ep ON ep.company_invite_code = c.invite_code
      WHERE ep.user_id = $1
      LIMIT 1`,
    [userId],
  );
  if (!result.rows[0]) {
    const error = new Error('Your account is not linked to a fleet company.');
    error.statusCode = 403;
    throw error;
  }
  return result.rows[0].id;
}

function mapVehicle(row) {
  return { id: row.id, registrationNumber: row.registration_number, name: row.name, vehicleType: row.vehicle_type, maxLoadKg: Number(row.max_load_kg), status: row.status, odometerKm: Number(row.odometer_km), acquisitionCost: Number(row.acquisition_cost) };
}
function mapDriver(row) {
  return { id: row.id, fullName: row.full_name, licenseNumber: row.license_number, licenseCategory: row.license_category, licenseExpiry: row.license_expiry, phone: row.phone, safetyScore: Number(row.safety_score), status: row.status };
}
function mapTrip(row) {
  return { id: row.id, vehicleId: row.vehicle_id, driverId: row.driver_id, source: row.source_name, destination: row.destination_name, cargo: row.cargo_description, cargoWeightKg: Number(row.cargo_weight_kg), plannedDistanceKm: Number(row.planned_distance_km), status: row.status, dispatchedAt: row.dispatched_at, completedAt: row.completed_at, finalOdometerKm: row.final_odometer_km == null ? null : Number(row.final_odometer_km), fuelConsumedLiters: row.fuel_consumed_liters == null ? null : Number(row.fuel_consumed_liters) };
}

async function withCompany(req, handler) {
  const client = await pool.connect();
  try {
    const companyId = await companyIdFor(client, req.auth.sub);
    return await handler(client, companyId);
  } finally {
    client.release();
  }
}

fleetRouter.get('/bootstrap', asyncHandler(async (req, res) => {
  await withCompany(req, async (client, companyId) => {
    const [vehicles, drivers, trips, maintenance, fuelLogs, expenses] = await Promise.all([
      client.query('SELECT * FROM vehicles WHERE company_id = $1 ORDER BY created_at DESC', [companyId]),
      client.query('SELECT * FROM drivers WHERE company_id = $1 ORDER BY created_at DESC', [companyId]),
      client.query('SELECT * FROM trips WHERE company_id = $1 ORDER BY created_at DESC', [companyId]),
      client.query('SELECT * FROM maintenance_records WHERE company_id = $1 ORDER BY opened_at DESC', [companyId]),
      client.query('SELECT * FROM fuel_logs WHERE company_id = $1 ORDER BY logged_at DESC', [companyId]),
      client.query('SELECT * FROM expenses WHERE company_id = $1 ORDER BY incurred_at DESC', [companyId]),
    ]);
    res.json({ vehicles: vehicles.rows.map(mapVehicle), drivers: drivers.rows.map(mapDriver), trips: trips.rows.map(mapTrip), maintenance: maintenance.rows, fuelLogs: fuelLogs.rows, expenses: expenses.rows });
  });
}));

fleetRouter.post('/vehicles', asyncHandler(async (req, res) => {
  const body = parse(vehicleSchema, req.body);
  await withCompany(req, async (client, companyId) => {
    try {
      const result = await client.query(
        `INSERT INTO vehicles (company_id, registration_number, name, vehicle_type, max_load_kg, odometer_km, acquisition_cost)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [companyId, body.registrationNumber.toUpperCase(), body.name, body.vehicleType, body.maxLoadKg, body.odometerKm, body.acquisitionCost],
      );
      res.status(201).json({ vehicle: mapVehicle(result.rows[0]) });
    } catch (error) {
      if (error.code === '23505') { error.statusCode = 409; error.message = 'Vehicle registration number already exists.'; }
      throw error;
    }
  });
}));

fleetRouter.patch('/vehicles/:id/status', asyncHandler(async (req, res) => {
  const status = parse(z.object({ status: z.enum(['available', 'retired']) }), req.body).status;
  await withCompany(req, async (client, companyId) => {
    const result = await client.query(
      `UPDATE vehicles SET status = $1, updated_at = now()
        WHERE id = $2 AND company_id = $3 AND status NOT IN ('on_trip', 'in_shop') RETURNING *`,
      [status, req.params.id, companyId],
    );
    if (!result.rows[0]) return res.status(409).json({ message: 'Only available vehicles can be retired or restored.' });
    res.json({ vehicle: mapVehicle(result.rows[0]) });
  });
}));

fleetRouter.post('/drivers', asyncHandler(async (req, res) => {
  const body = parse(driverSchema, req.body);
  await withCompany(req, async (client, companyId) => {
    try {
      const result = await client.query(
        `INSERT INTO drivers (company_id, full_name, license_number, license_category, license_expiry, phone, safety_score)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [companyId, body.fullName, body.licenseNumber.toUpperCase(), body.licenseCategory, body.licenseExpiry, body.phone, body.safetyScore],
      );
      res.status(201).json({ driver: mapDriver(result.rows[0]) });
    } catch (error) {
      if (error.code === '23505') { error.statusCode = 409; error.message = 'Driver license number already exists.'; }
      throw error;
    }
  });
}));

fleetRouter.patch('/drivers/:id/status', asyncHandler(async (req, res) => {
  const status = parse(z.object({ status: z.enum(['available', 'off_duty', 'suspended']) }), req.body).status;
  await withCompany(req, async (client, companyId) => {
    const result = await client.query(
      `UPDATE drivers SET status = $1, updated_at = now()
        WHERE id = $2 AND company_id = $3 AND status <> 'on_trip' RETURNING *`,
      [status, req.params.id, companyId],
    );
    if (!result.rows[0]) return res.status(409).json({ message: 'A driver on a trip cannot have their status changed.' });
    res.json({ driver: mapDriver(result.rows[0]) });
  });
}));

fleetRouter.post('/trips', asyncHandler(async (req, res) => {
  const body = parse(tripSchema, req.body);
  await withCompany(req, async (client, companyId) => {
    const result = await client.query(
      `INSERT INTO trips (company_id, vehicle_id, driver_id, source_name, destination_name, cargo_description, cargo_weight_kg, planned_distance_km)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [companyId, body.vehicleId, body.driverId, body.source, body.destination, body.cargo, body.cargoWeightKg, body.plannedDistanceKm],
    );
    res.status(201).json({ trip: mapTrip(result.rows[0]) });
  });
}));

fleetRouter.post('/trips/:id/dispatch', asyncHandler(async (req, res) => {
  await withCompany(req, async (client, companyId) => {
    await client.query('BEGIN');
    try {
      const tripResult = await client.query('SELECT * FROM trips WHERE id = $1 AND company_id = $2 FOR UPDATE', [req.params.id, companyId]);
      const trip = tripResult.rows[0];
      if (!trip || trip.status !== 'draft') throw Object.assign(new Error('Only draft trips can be dispatched.'), { statusCode: 409 });
      const [vehicleResult, driverResult] = await Promise.all([
        client.query('SELECT * FROM vehicles WHERE id = $1 AND company_id = $2 FOR UPDATE', [trip.vehicle_id, companyId]),
        client.query('SELECT * FROM drivers WHERE id = $1 AND company_id = $2 FOR UPDATE', [trip.driver_id, companyId]),
      ]);
      const vehicle = vehicleResult.rows[0];
      const driver = driverResult.rows[0];
      if (!vehicle || vehicle.status !== 'available') throw Object.assign(new Error('The selected vehicle is not available for dispatch.'), { statusCode: 409 });
      if (!driver || driver.status !== 'available' || new Date(driver.license_expiry) < new Date()) throw Object.assign(new Error('The selected driver is unavailable, suspended, or has an expired license.'), { statusCode: 409 });
      if (Number(trip.cargo_weight_kg) > Number(vehicle.max_load_kg)) throw Object.assign(new Error('Cargo weight exceeds the vehicle maximum load capacity.'), { statusCode: 409 });
      await client.query("UPDATE vehicles SET status = 'on_trip', updated_at = now() WHERE id = $1", [vehicle.id]);
      await client.query("UPDATE drivers SET status = 'on_trip', updated_at = now() WHERE id = $1", [driver.id]);
      const result = await client.query("UPDATE trips SET status = 'dispatched', dispatched_at = now(), updated_at = now() WHERE id = $1 RETURNING *", [trip.id]);
      await client.query('COMMIT');
      res.json({ message: 'Trip dispatched. Vehicle and driver are now On Trip.', trip: mapTrip(result.rows[0]) });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  });
}));

fleetRouter.post('/trips/:id/complete', asyncHandler(async (req, res) => {
  const body = parse(completionSchema, req.body);
  await withCompany(req, async (client, companyId) => {
    await client.query('BEGIN');
    try {
      const tripResult = await client.query('SELECT * FROM trips WHERE id = $1 AND company_id = $2 FOR UPDATE', [req.params.id, companyId]);
      const trip = tripResult.rows[0];
      if (!trip || trip.status !== 'dispatched') throw Object.assign(new Error('Only dispatched trips can be completed.'), { statusCode: 409 });
      const vehicleResult = await client.query('SELECT * FROM vehicles WHERE id = $1 FOR UPDATE', [trip.vehicle_id]);
      if (!vehicleResult.rows[0] || body.finalOdometerKm < Number(vehicleResult.rows[0].odometer_km)) throw Object.assign(new Error('Final odometer cannot be lower than the current vehicle odometer.'), { statusCode: 400 });
      await client.query("UPDATE vehicles SET status = 'available', odometer_km = $1, updated_at = now() WHERE id = $2", [body.finalOdometerKm, trip.vehicle_id]);
      await client.query("UPDATE drivers SET status = 'available', updated_at = now() WHERE id = $1", [trip.driver_id]);
      const result = await client.query("UPDATE trips SET status = 'completed', completed_at = now(), final_odometer_km = $1, fuel_consumed_liters = $2, updated_at = now() WHERE id = $3 RETURNING *", [body.finalOdometerKm, body.fuelConsumedLiters, trip.id]);
      await client.query('COMMIT');
      res.json({ message: 'Trip completed. Vehicle and driver are now Available.', trip: mapTrip(result.rows[0]) });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  });
}));

fleetRouter.post('/trips/:id/cancel', asyncHandler(async (req, res) => {
  await withCompany(req, async (client, companyId) => {
    await client.query('BEGIN');
    try {
      const result = await client.query('SELECT * FROM trips WHERE id = $1 AND company_id = $2 FOR UPDATE', [req.params.id, companyId]);
      const trip = result.rows[0];
      if (!trip || !['draft', 'dispatched'].includes(trip.status)) throw Object.assign(new Error('This trip cannot be cancelled.'), { statusCode: 409 });
      if (trip.status === 'dispatched') {
        await client.query("UPDATE vehicles SET status = 'available', updated_at = now() WHERE id = $1", [trip.vehicle_id]);
        await client.query("UPDATE drivers SET status = 'available', updated_at = now() WHERE id = $1", [trip.driver_id]);
      }
      const cancelled = await client.query("UPDATE trips SET status = 'cancelled', updated_at = now() WHERE id = $1 RETURNING *", [trip.id]);
      await client.query('COMMIT');
      res.json({ message: 'Trip cancelled and resources restored.', trip: mapTrip(cancelled.rows[0]) });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  });
}));

fleetRouter.post('/maintenance', asyncHandler(async (req, res) => {
  const body = parse(maintenanceSchema, req.body);
  await withCompany(req, async (client, companyId) => {
    await client.query('BEGIN');
    try {
      const vehicle = await client.query('SELECT * FROM vehicles WHERE id = $1 AND company_id = $2 FOR UPDATE', [body.vehicleId, companyId]);
      if (!vehicle.rows[0] || ['retired', 'on_trip'].includes(vehicle.rows[0].status)) throw Object.assign(new Error('Only available vehicles can enter maintenance.'), { statusCode: 409 });
      const created = await client.query('INSERT INTO maintenance_records (company_id, vehicle_id, maintenance_type, description, cost) VALUES ($1, $2, $3, $4, $5) RETURNING *', [companyId, body.vehicleId, body.maintenanceType, body.description, body.cost]);
      await client.query("UPDATE vehicles SET status = 'in_shop', updated_at = now() WHERE id = $1", [body.vehicleId]);
      await client.query('COMMIT');
      res.status(201).json({ message: 'Maintenance opened. Vehicle is now In Shop.', maintenance: created.rows[0] });
    } catch (error) { await client.query('ROLLBACK'); throw error; }
  });
}));

fleetRouter.post('/maintenance/:id/close', asyncHandler(async (req, res) => {
  await withCompany(req, async (client, companyId) => {
    await client.query('BEGIN');
    try {
      const record = await client.query("SELECT * FROM maintenance_records WHERE id = $1 AND company_id = $2 AND status = 'open' FOR UPDATE", [req.params.id, companyId]);
      if (!record.rows[0]) throw Object.assign(new Error('Open maintenance record not found.'), { statusCode: 404 });
      const closed = await client.query("UPDATE maintenance_records SET status = 'closed', closed_at = now() WHERE id = $1 RETURNING *", [req.params.id]);
      const otherOpen = await client.query("SELECT 1 FROM maintenance_records WHERE vehicle_id = $1 AND status = 'open' AND id <> $2", [record.rows[0].vehicle_id, req.params.id]);
      if (!otherOpen.rows.length) await client.query("UPDATE vehicles SET status = 'available', updated_at = now() WHERE id = $1 AND status <> 'retired'", [record.rows[0].vehicle_id]);
      await client.query('COMMIT');
      res.json({ message: 'Maintenance closed.', maintenance: closed.rows[0] });
    } catch (error) { await client.query('ROLLBACK'); throw error; }
  });
}));

fleetRouter.post('/fuel-logs', asyncHandler(async (req, res) => {
  const body = parse(fuelSchema, req.body);
  await withCompany(req, async (client, companyId) => {
    const vehicle = await client.query('SELECT odometer_km FROM vehicles WHERE id = $1 AND company_id = $2', [body.vehicleId, companyId]);
    if (!vehicle.rows[0]) return res.status(404).json({ message: 'Vehicle not found.' });
    if (body.odometerKm < Number(vehicle.rows[0].odometer_km)) return res.status(400).json({ message: 'Fuel log odometer cannot be lower than the vehicle odometer.' });
    const result = await client.query('INSERT INTO fuel_logs (company_id, vehicle_id, liters, cost, odometer_km) VALUES ($1, $2, $3, $4, $5) RETURNING *', [companyId, body.vehicleId, body.liters, body.cost, body.odometerKm]);
    res.status(201).json({ fuelLog: result.rows[0] });
  });
}));

fleetRouter.post('/expenses', asyncHandler(async (req, res) => {
  const body = parse(expenseSchema, req.body);
  await withCompany(req, async (client, companyId) => {
    const result = await client.query('INSERT INTO expenses (company_id, vehicle_id, category, amount, description, incurred_at) VALUES ($1, $2, $3, $4, $5, COALESCE($6, CURRENT_DATE)) RETURNING *', [companyId, body.vehicleId || null, body.category, body.amount, body.description || null, body.incurredAt || null]);
    res.status(201).json({ expense: result.rows[0] });
  });
}));

fleetRouter.get('/reports/summary', asyncHandler(async (req, res) => {
  await withCompany(req, async (client, companyId) => {
    const result = await client.query(
      `SELECT
        (SELECT count(*) FROM vehicles WHERE company_id = $1) AS vehicles,
        (SELECT count(*) FROM vehicles WHERE company_id = $1 AND status = 'available') AS available_vehicles,
        (SELECT count(*) FROM drivers WHERE company_id = $1 AND status = 'available' AND license_expiry >= CURRENT_DATE) AS available_drivers,
        (SELECT count(*) FROM trips WHERE company_id = $1 AND status = 'dispatched') AS active_trips,
        (SELECT COALESCE(sum(cost), 0) FROM fuel_logs WHERE company_id = $1) AS fuel_cost,
        (SELECT COALESCE(sum(cost), 0) FROM maintenance_records WHERE company_id = $1) AS maintenance_cost,
        (SELECT COALESCE(sum(amount), 0) FROM expenses WHERE company_id = $1) AS other_expense`,
      [companyId],
    );
    res.json({ summary: result.rows[0] });
  });
}));
