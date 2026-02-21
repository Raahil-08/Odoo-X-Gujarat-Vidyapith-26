-- Recreate trip_details view so it includes trip_duration_days (added in 003).
-- CREATE OR REPLACE cannot add columns in the middle, so we drop and recreate.
DROP VIEW IF EXISTS public.trip_details;

CREATE VIEW public.trip_details AS
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

-- Restore grant from 002_allow_anon_read
GRANT SELECT ON public.trip_details TO anon;
