CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  registration_number VARCHAR(32) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  vehicle_type VARCHAR(40) NOT NULL,
  max_load_kg NUMERIC(12, 2) NOT NULL CHECK (max_load_kg > 0),
  status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'on_trip', 'in_shop', 'retired')),
  odometer_km NUMERIC(14, 1) NOT NULL DEFAULT 0 CHECK (odometer_km >= 0),
  acquisition_cost NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (acquisition_cost >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  full_name VARCHAR(120) NOT NULL,
  license_number VARCHAR(64) NOT NULL UNIQUE,
  license_category VARCHAR(20) NOT NULL,
  license_expiry DATE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  safety_score NUMERIC(5, 2) NOT NULL DEFAULT 80 CHECK (safety_score BETWEEN 0 AND 100),
  status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'on_trip', 'off_duty', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id),
  driver_id UUID NOT NULL REFERENCES drivers(id),
  source_name VARCHAR(160) NOT NULL,
  destination_name VARCHAR(160) NOT NULL,
  cargo_description VARCHAR(240) NOT NULL DEFAULT 'General freight',
  cargo_weight_kg NUMERIC(12, 2) NOT NULL CHECK (cargo_weight_kg > 0),
  planned_distance_km NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (planned_distance_km >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'dispatched', 'completed', 'cancelled')),
  dispatched_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  final_odometer_km NUMERIC(14, 1),
  fuel_consumed_liters NUMERIC(12, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS maintenance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id),
  maintenance_type VARCHAR(40) NOT NULL,
  description VARCHAR(500) NOT NULL,
  cost NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (cost >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS fuel_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id),
  liters NUMERIC(12, 2) NOT NULL CHECK (liters >= 0),
  cost NUMERIC(14, 2) NOT NULL CHECK (cost >= 0),
  odometer_km NUMERIC(14, 1) NOT NULL CHECK (odometer_km >= 0),
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  category VARCHAR(80) NOT NULL,
  amount NUMERIC(14, 2) NOT NULL CHECK (amount >= 0),
  description VARCHAR(500),
  incurred_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vehicles_company_status ON vehicles(company_id, status);
CREATE INDEX IF NOT EXISTS idx_drivers_company_status ON drivers(company_id, status);
CREATE INDEX IF NOT EXISTS idx_trips_company_status ON trips(company_id, status);
CREATE INDEX IF NOT EXISTS idx_maintenance_vehicle_status ON maintenance_records(vehicle_id, status);
