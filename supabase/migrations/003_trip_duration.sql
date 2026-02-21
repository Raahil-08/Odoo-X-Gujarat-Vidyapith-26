-- Add trip duration (estimated duration in days) to trips
ALTER TABLE public.trips
ADD COLUMN IF NOT EXISTS trip_duration_days INTEGER;

COMMENT ON COLUMN public.trips.trip_duration_days IS 'Estimated trip duration in days';
