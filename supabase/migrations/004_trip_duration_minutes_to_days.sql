-- Rename trip_duration_minutes to trip_duration_days (if 003 was applied with minutes)
-- If trip_duration_days already exists (e.g. 003 run again with days), just drop the old column
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'trips' AND column_name = 'trip_duration_minutes'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'trips' AND column_name = 'trip_duration_days'
    ) THEN
      -- Both columns exist: drop the old one
      ALTER TABLE public.trips DROP COLUMN trip_duration_minutes;
    ELSE
      -- Only minutes exists: rename to days
      ALTER TABLE public.trips RENAME COLUMN trip_duration_minutes TO trip_duration_days;
      COMMENT ON COLUMN public.trips.trip_duration_days IS 'Estimated trip duration in days';
    END IF;
  END IF;
END $$;
