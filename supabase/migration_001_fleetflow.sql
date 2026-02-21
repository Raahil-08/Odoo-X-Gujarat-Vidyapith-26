-- ============================================================
-- FleetFlow Migration 001
-- Run this in Supabase SQL Editor (one shot)
-- ============================================================

-- ── 1. expense_category enum ────────────────────────────────
DO $$ BEGIN
  CREATE TYPE expense_category AS ENUM ('MAINTENANCE','TOLL','PARKING','OTHER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── 2. driver_status_enum (extend if needed) ─────────────────
-- Statuses: ON_DUTY, OFF_DUTY, SUSPENDED, ON_TRIP
-- These should already exist on the drivers table as text/enum.
-- If you have a separate enum, add SUSPENDED / ON_TRIP here.

-- ── 3. fuel_logs table ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS fuel_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id  UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  trip_id     UUID REFERENCES trips(id) ON DELETE SET NULL,
  liters      NUMERIC(10,2) NOT NULL CHECK (liters > 0),
  cost        NUMERIC(12,2) NOT NULL CHECK (cost >= 0),
  log_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── 4. expenses table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id      UUID REFERENCES trips(id) ON DELETE SET NULL,
  category     expense_category NOT NULL,
  amount       NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  description  TEXT,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ── 5. revenue column on trips ───────────────────────────────
ALTER TABLE trips ADD COLUMN IF NOT EXISTS revenue NUMERIC(12,2) DEFAULT 0;

-- ── 6. vehicle_financials VIEW ───────────────────────────────
CREATE OR REPLACE VIEW vehicle_financials AS
SELECT
  v.id                                              AS vehicle_id,
  v.name                                            AS vehicle_name,
  v.license_plate,
  v.acquisition_cost,
  COALESCE(SUM(fl.cost), 0)                        AS total_fuel_cost,
  COALESCE(SUM(fl.liters), 0)                      AS total_liters,
  COALESCE(
    SUM(CASE WHEN t.distance_km > 0 THEN t.distance_km END) /
    NULLIF(SUM(fl.liters), 0), 0
  )                                                 AS km_per_liter,
  COALESCE(mc.total_maintenance_cost, 0)            AS total_maintenance_cost,
  COALESCE(tr.total_revenue, 0)                     AS total_revenue,
  CASE
    WHEN COALESCE(v.acquisition_cost, 0) = 0 THEN 0
    ELSE ROUND(
      (
        COALESCE(tr.total_revenue, 0) -
        (COALESCE(SUM(fl.cost), 0) + COALESCE(mc.total_maintenance_cost, 0))
      ) / v.acquisition_cost * 100, 2
    )
  END                                               AS roi_percent
FROM vehicles v
LEFT JOIN fuel_logs fl ON fl.vehicle_id = v.id
LEFT JOIN trips t       ON t.vehicle_id = v.id
LEFT JOIN (
  SELECT vehicle_id, SUM(cost) AS total_maintenance_cost
  FROM maintenance_logs
  GROUP BY vehicle_id
) mc ON mc.vehicle_id = v.id
LEFT JOIN (
  SELECT vehicle_id, SUM(revenue) AS total_revenue
  FROM trips
  WHERE status = 'COMPLETED'
  GROUP BY vehicle_id
) tr ON tr.vehicle_id = v.id
GROUP BY v.id, v.name, v.license_plate, v.acquisition_cost,
         mc.total_maintenance_cost, tr.total_revenue;

-- ── 7. RPC: create_trip (full validation) ───────────────────
CREATE OR REPLACE FUNCTION create_trip(
  p_vehicle_id       UUID,
  p_driver_id        UUID,
  p_origin           TEXT,
  p_destination      TEXT,
  p_cargo_weight_kg  NUMERIC,
  p_region           TEXT DEFAULT NULL,
  p_revenue          NUMERIC DEFAULT 0
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_vehicle    vehicles%ROWTYPE;
  v_driver     drivers%ROWTYPE;
  v_trip_id    UUID;
BEGIN
  -- Fetch vehicle
  SELECT * INTO v_vehicle FROM vehicles WHERE id = p_vehicle_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Vehicle not found';
  END IF;

  -- Fetch driver
  SELECT * INTO v_driver FROM drivers WHERE id = p_driver_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Driver not found';
  END IF;

  -- Vehicle must be AVAILABLE
  IF v_vehicle.status <> 'AVAILABLE' THEN
    RAISE EXCEPTION 'Vehicle is not available (current status: %)', v_vehicle.status;
  END IF;

  -- Capacity check
  IF p_cargo_weight_kg > v_vehicle.max_capacity THEN
    RAISE EXCEPTION 'Cargo weight (% kg) exceeds vehicle max capacity (% kg)',
      p_cargo_weight_kg, v_vehicle.max_capacity;
  END IF;

  -- Driver must not be OFF_DUTY or SUSPENDED
  IF v_driver.status IN ('OFF_DUTY', 'SUSPENDED') THEN
    RAISE EXCEPTION 'Driver is not available (current status: %)', v_driver.status;
  END IF;

  -- License expiry check
  IF v_driver.license_expiry_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'Driver license expired on %', v_driver.license_expiry_date;
  END IF;

  -- Create trip
  INSERT INTO trips (
    vehicle_id, driver_id, origin, destination,
    cargo_weight_kg, region, revenue, status
  )
  VALUES (
    p_vehicle_id, p_driver_id, p_origin, p_destination,
    p_cargo_weight_kg, p_region, p_revenue, 'DRAFT'
  )
  RETURNING id INTO v_trip_id;

  RETURN v_trip_id;
END;
$$;

-- ── 8. RPC: dispatch_trip (preserve existing, no changes) ─────
-- Already exists; leave as-is.

-- ── 9. RPC: complete_trip (preserve existing, no changes) ─────
-- Already exists; leave as-is.

-- ── 10. RPC: cancel_trip ─────────────────────────────────────
CREATE OR REPLACE FUNCTION cancel_trip(
  p_trip_id UUID
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_trip trips%ROWTYPE;
BEGIN
  SELECT * INTO v_trip FROM trips WHERE id = p_trip_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Trip not found';
  END IF;

  IF v_trip.status = 'COMPLETED' THEN
    RAISE EXCEPTION 'Cannot cancel a completed trip';
  END IF;

  IF v_trip.status = 'CANCELLED' THEN
    RAISE EXCEPTION 'Trip is already cancelled';
  END IF;

  -- Revert vehicle & driver if trip was dispatched
  IF v_trip.status = 'DISPATCHED' THEN
    UPDATE vehicles SET status = 'AVAILABLE' WHERE id = v_trip.vehicle_id;
    UPDATE drivers  SET status = 'ON_DUTY'   WHERE id = v_trip.driver_id;
  END IF;

  UPDATE trips SET status = 'CANCELLED' WHERE id = p_trip_id;
END;
$$;

-- ── 11. RPC: log_fuel ────────────────────────────────────────
CREATE OR REPLACE FUNCTION log_fuel(
  p_vehicle_id UUID,
  p_liters     NUMERIC,
  p_cost       NUMERIC,
  p_trip_id    UUID    DEFAULT NULL,
  p_log_date   DATE    DEFAULT CURRENT_DATE
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
BEGIN
  IF p_liters <= 0 THEN
    RAISE EXCEPTION 'liters must be greater than 0';
  END IF;
  IF p_cost < 0 THEN
    RAISE EXCEPTION 'cost must be >= 0';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM vehicles WHERE id = p_vehicle_id) THEN
    RAISE EXCEPTION 'Vehicle not found';
  END IF;

  INSERT INTO fuel_logs (vehicle_id, trip_id, liters, cost, log_date)
  VALUES (p_vehicle_id, p_trip_id, p_liters, p_cost, p_log_date)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- ── 12. RPC: log_expense ─────────────────────────────────────
CREATE OR REPLACE FUNCTION log_expense(
  p_category     TEXT,
  p_amount       NUMERIC,
  p_trip_id      UUID    DEFAULT NULL,
  p_description  TEXT    DEFAULT NULL,
  p_expense_date DATE    DEFAULT CURRENT_DATE
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
BEGIN
  IF p_amount < 0 THEN
    RAISE EXCEPTION 'amount must be >= 0';
  END IF;

  INSERT INTO expenses (trip_id, category, amount, description, expense_date)
  VALUES (p_trip_id, p_category::expense_category, p_amount, p_description, p_expense_date)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- ── 13. RPC: update_driver_status ────────────────────────────
CREATE OR REPLACE FUNCTION update_driver_status(
  p_driver_id UUID,
  p_status    TEXT
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_status NOT IN ('ON_DUTY','OFF_DUTY','SUSPENDED','ON_TRIP') THEN
    RAISE EXCEPTION 'Invalid status: %. Allowed: ON_DUTY, OFF_DUTY, SUSPENDED, ON_TRIP', p_status;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM drivers WHERE id = p_driver_id) THEN
    RAISE EXCEPTION 'Driver not found';
  END IF;

  UPDATE drivers SET status = p_status WHERE id = p_driver_id;
END;
$$;

-- ── 14. RPC: get_vehicle_financials ──────────────────────────
CREATE OR REPLACE FUNCTION get_vehicle_financials()
RETURNS TABLE (
  vehicle_id             UUID,
  vehicle_name           TEXT,
  license_plate          TEXT,
  acquisition_cost       NUMERIC,
  total_fuel_cost        NUMERIC,
  total_liters           NUMERIC,
  km_per_liter           NUMERIC,
  total_maintenance_cost NUMERIC,
  total_revenue          NUMERIC,
  roi_percent            NUMERIC
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    vehicle_id,
    vehicle_name,
    license_plate,
    acquisition_cost,
    total_fuel_cost,
    total_liters,
    km_per_liter,
    total_maintenance_cost,
    total_revenue,
    roi_percent
  FROM vehicle_financials;
$$;
