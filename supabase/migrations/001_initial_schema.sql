-- ============================================================================
-- Fleet Command Center - Supabase Database Schema
-- ============================================================================
-- This migration creates all tables, relationships, RLS policies, and
-- database functions for the Fleet Command Center application.
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PostGIS for location data (optional, uncomment if needed)
-- CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT CHECK (role IN ('manager', 'dispatcher', 'admin')) DEFAULT 'dispatcher',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drivers table (must be created before vehicles due to foreign key reference)
CREATE TABLE public.drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  license_number TEXT UNIQUE,
  license_expiry DATE,
  phone TEXT,
  email TEXT,
  completion_rate INTEGER DEFAULT 0 CHECK (completion_rate >= 0 AND completion_rate <= 100),
  safety_score INTEGER DEFAULT 0 CHECK (safety_score >= 0 AND safety_score <= 100),
  status TEXT CHECK (status IN ('ACTIVE', 'INACTIVE', 'EXPIRED', 'SUSPENDED')) DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicles table
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id TEXT UNIQUE NOT NULL, -- e.g., "TRK-001"
  name TEXT NOT NULL, -- e.g., "Volvo FH16"
  model TEXT, -- e.g., "2023"
  plate_number TEXT UNIQUE NOT NULL, -- Indian format: e.g., "MH-12-AB-1234"
  max_load_kg INTEGER NOT NULL DEFAULT 0,
  odometer_km INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('ON TRIP', 'IN SHOP', 'AVAILABLE', 'COMPLETED')) DEFAULT 'AVAILABLE',
  current_driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trips/Dispatches table
CREATE TABLE public.trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id TEXT UNIQUE NOT NULL, -- e.g., "DSP-041"
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE RESTRICT,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  cargo_weight_kg INTEGER DEFAULT 0,
  estimated_fuel_cost DECIMAL(10, 2) DEFAULT 0,
  actual_fuel_cost DECIMAL(10, 2),
  stage TEXT CHECK (stage IN ('DRAFT', 'DISPATCHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')) DEFAULT 'DRAFT',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Maintenance logs table
CREATE TABLE public.maintenance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  log_id TEXT UNIQUE NOT NULL, -- e.g., "MNT-101"
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL, -- e.g., "Engine Overhaul", "Tire Replacement"
  description TEXT,
  cost DECIMAL(10, 2) DEFAULT 0,
  service_date DATE NOT NULL,
  status TEXT CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')) DEFAULT 'SCHEDULED',
  next_service_date DATE,
  odometer_at_service INTEGER,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fuel entries table
CREATE TABLE public.fuel_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  liters DECIMAL(10, 2) NOT NULL,
  cost DECIMAL(10, 2) NOT NULL,
  price_per_liter DECIMAL(10, 2) GENERATED ALWAYS AS (CASE WHEN liters > 0 THEN cost / liters ELSE 0 END) STORED,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  odometer_km INTEGER,
  station_name TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses table (for other operational expenses)
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
  trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  category TEXT CHECK (category IN ('FUEL', 'MAINTENANCE', 'TOLL', 'PARKING', 'REPAIR', 'INSURANCE', 'OTHER')) NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_url TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_vehicles_status ON public.vehicles(status);
CREATE INDEX idx_vehicles_vehicle_id ON public.vehicles(vehicle_id);
CREATE INDEX idx_drivers_status ON public.drivers(status);
CREATE INDEX idx_trips_vehicle_id ON public.trips(vehicle_id);
CREATE INDEX idx_trips_driver_id ON public.trips(driver_id);
CREATE INDEX idx_trips_stage ON public.trips(stage);
CREATE INDEX idx_trips_created_at ON public.trips(created_at DESC);
CREATE INDEX idx_maintenance_vehicle_id ON public.maintenance_logs(vehicle_id);
CREATE INDEX idx_maintenance_status ON public.maintenance_logs(status);
CREATE INDEX idx_fuel_vehicle_id ON public.fuel_entries(vehicle_id);
CREATE INDEX idx_fuel_entry_date ON public.fuel_entries(entry_date DESC);
CREATE INDEX idx_expenses_vehicle_id ON public.expenses(vehicle_id);
CREATE INDEX idx_expenses_category ON public.expenses(category);
CREATE INDEX idx_expenses_expense_date ON public.expenses(expense_date DESC);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER set_updated_at_vehicles
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_drivers
  BEFORE UPDATE ON public.drivers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_trips
  BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_maintenance_logs
  BEFORE UPDATE ON public.maintenance_logs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'dispatcher')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update vehicle status when trip starts/completes
CREATE OR REPLACE FUNCTION public.update_vehicle_status_on_trip_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stage = 'DISPATCHED' OR NEW.stage = 'IN_PROGRESS' THEN
    UPDATE public.vehicles
    SET status = 'ON TRIP', current_driver_id = NEW.driver_id
    WHERE id = NEW.vehicle_id;
  ELSIF NEW.stage = 'COMPLETED' THEN
    UPDATE public.vehicles
    SET status = 'AVAILABLE', current_driver_id = NULL
    WHERE id = NEW.vehicle_id;
  ELSIF NEW.stage = 'CANCELLED' THEN
    UPDATE public.vehicles
    SET status = 'AVAILABLE', current_driver_id = NULL
    WHERE id = NEW.vehicle_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trip_status_change
  AFTER INSERT OR UPDATE OF stage ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.update_vehicle_status_on_trip_change();

-- Function to update vehicle status when maintenance starts/completes
CREATE OR REPLACE FUNCTION public.update_vehicle_status_on_maintenance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'IN_PROGRESS' THEN
    UPDATE public.vehicles
    SET status = 'IN SHOP'
    WHERE id = NEW.vehicle_id;
  ELSIF NEW.status = 'COMPLETED' AND OLD.status = 'IN_PROGRESS' THEN
    -- Only set to AVAILABLE if vehicle is not on a trip
    UPDATE public.vehicles
    SET status = 'AVAILABLE'
    WHERE id = NEW.vehicle_id AND status = 'IN SHOP';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER maintenance_status_change
  AFTER INSERT OR UPDATE OF status ON public.maintenance_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_vehicle_status_on_maintenance();

-- Function to generate next trip ID
CREATE OR REPLACE FUNCTION public.generate_trip_id()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(trip_id FROM 5) AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.trips
  WHERE trip_id LIKE 'DSP-%';
  RETURN 'DSP-' || LPAD(next_num::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to generate next maintenance log ID
CREATE OR REPLACE FUNCTION public.generate_maintenance_log_id()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(log_id FROM 5) AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.maintenance_logs
  WHERE log_id LIKE 'MNT-%';
  RETURN 'MNT-' || LPAD(next_num::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Vehicles policies
CREATE POLICY "Authenticated users can view vehicles"
  ON public.vehicles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Managers and admins can insert vehicles"
  ON public.vehicles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('manager', 'admin')
    )
  );

CREATE POLICY "Managers and admins can update vehicles"
  ON public.vehicles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('manager', 'admin')
    )
  );

CREATE POLICY "Managers and admins can delete vehicles"
  ON public.vehicles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('manager', 'admin')
    )
  );

-- Drivers policies
CREATE POLICY "Authenticated users can view drivers"
  ON public.drivers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Managers and admins can manage drivers"
  ON public.drivers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('manager', 'admin')
    )
  );

-- Trips policies
CREATE POLICY "Authenticated users can view trips"
  ON public.trips FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Dispatchers, managers, and admins can create trips"
  ON public.trips FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('dispatcher', 'manager', 'admin')
    )
  );

CREATE POLICY "Dispatchers, managers, and admins can update trips"
  ON public.trips FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('dispatcher', 'manager', 'admin')
    )
  );

CREATE POLICY "Managers and admins can delete trips"
  ON public.trips FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('manager', 'admin')
    )
  );

-- Maintenance logs policies
CREATE POLICY "Authenticated users can view maintenance logs"
  ON public.maintenance_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Managers and admins can manage maintenance logs"
  ON public.maintenance_logs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('manager', 'admin')
    )
  );

-- Fuel entries policies
CREATE POLICY "Authenticated users can view fuel entries"
  ON public.fuel_entries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create fuel entries"
  ON public.fuel_entries FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Managers and admins can update fuel entries"
  ON public.fuel_entries FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('manager', 'admin')
    )
  );

CREATE POLICY "Managers and admins can delete fuel entries"
  ON public.fuel_entries FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('manager', 'admin')
    )
  );

-- Expenses policies
CREATE POLICY "Authenticated users can view expenses"
  ON public.expenses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create expenses"
  ON public.expenses FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Managers and admins can update expenses"
  ON public.expenses FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('manager', 'admin')
    )
  );

CREATE POLICY "Managers and admins can delete expenses"
  ON public.expenses FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('manager', 'admin')
    )
  );

-- ============================================================================
-- VIEWS (Optional helper views)
-- ============================================================================

-- View for fleet dashboard KPIs
CREATE OR REPLACE VIEW public.fleet_dashboard_stats AS
SELECT
  COUNT(*) FILTER (WHERE v.status = 'ON TRIP') AS active_fleet_count,
  COUNT(*) FILTER (WHERE v.status = 'IN SHOP') AS maintenance_alerts_count,
  COUNT(*) FILTER (WHERE v.status = 'AVAILABLE') AS available_count,
  COUNT(*) AS total_fleet_count,
  ROUND(
    COUNT(*) FILTER (WHERE v.status = 'ON TRIP')::NUMERIC / NULLIF(COUNT(*), 0) * 100,
    2
  ) AS utilization_rate
FROM public.vehicles v;

-- View for vehicle with driver info
CREATE OR REPLACE VIEW public.vehicles_with_driver AS
SELECT
  v.*,
  d.name AS driver_name,
  d.license_number AS driver_license,
  d.status AS driver_status
FROM public.vehicles v
LEFT JOIN public.drivers d ON v.current_driver_id = d.id;

-- View for trip details with vehicle and driver
CREATE OR REPLACE VIEW public.trip_details AS
SELECT
  t.*,
  v.vehicle_id AS vehicle_code,
  v.name AS vehicle_name,
  v.plate_number,
  d.name AS driver_name,
  d.license_number AS driver_license
FROM public.trips t
JOIN public.vehicles v ON t.vehicle_id = v.id
JOIN public.drivers d ON t.driver_id = d.id;

-- ============================================================================
-- SEED DATA (Optional - for development)
-- ============================================================================

-- Uncomment to add seed data for testing
/*
INSERT INTO public.drivers (name, license_number, license_expiry, completion_rate, safety_score, status) VALUES
  ('Marcus Reid', 'DL-2024-001', '2026-08-15', 94, 97, 'ACTIVE'),
  ('Elena Voss', 'DL-2024-002', '2025-11-30', 88, 92, 'ACTIVE'),
  ('James Okon', 'DL-2024-003', '2025-01-10', 76, 85, 'EXPIRED'),
  ('Priya Nair', 'DL-2024-004', '2027-03-22', 91, 96, 'ACTIVE'),
  ('Tom Alvarez', 'DL-2024-005', '2026-12-05', 82, 78, 'ACTIVE'),
  ('Yuki Tanaka', 'DL-2024-006', '2024-06-18', 69, 71, 'EXPIRED');

INSERT INTO public.vehicles (vehicle_id, name, model, plate_number, max_load_kg, odometer_km, status) VALUES
  ('TRK-001', 'Volvo FH16', '2023', 'FL-2847', 25000, 142500, 'ON TRIP'),
  ('TRK-002', 'Scania R500', '2022', 'FL-1923', 22000, 98200, 'AVAILABLE'),
  ('TRK-003', 'MAN TGX', '2021', 'FL-4510', 20000, 215800, 'IN SHOP'),
  ('TRK-004', 'DAF XF', '2023', 'FL-3378', 24000, 67400, 'ON TRIP'),
  ('TRK-005', 'Mercedes Actros', '2022', 'FL-6621', 26000, 178900, 'ON TRIP'),
  ('TRK-006', 'Iveco S-Way', '2023', 'FL-8890', 23000, 45600, 'AVAILABLE');
*/
