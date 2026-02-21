-- Allow anonymous read (and write for demo) so app works without login.
-- Remove or restrict these policies for production when using Auth.

CREATE POLICY "Allow anon read vehicles" ON public.vehicles FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read drivers" ON public.drivers FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read trips" ON public.trips FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read maintenance_logs" ON public.maintenance_logs FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read fuel_entries" ON public.fuel_entries FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read expenses" ON public.expenses FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon insert vehicles" ON public.vehicles FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update vehicles" ON public.vehicles FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow anon delete vehicles" ON public.vehicles FOR DELETE TO anon USING (true);

CREATE POLICY "Allow anon insert drivers" ON public.drivers FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update drivers" ON public.drivers FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow anon delete drivers" ON public.drivers FOR DELETE TO anon USING (true);

CREATE POLICY "Allow anon insert trips" ON public.trips FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update trips" ON public.trips FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow anon delete trips" ON public.trips FOR DELETE TO anon USING (true);

CREATE POLICY "Allow anon insert maintenance_logs" ON public.maintenance_logs FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update maintenance_logs" ON public.maintenance_logs FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow anon delete maintenance_logs" ON public.maintenance_logs FOR DELETE TO anon USING (true);

CREATE POLICY "Allow anon insert fuel_entries" ON public.fuel_entries FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon insert expenses" ON public.expenses FOR INSERT TO anon WITH CHECK (true);

-- Views: grant usage to anon (select from view uses underlying table policies)
-- So anon can select from fleet_dashboard_stats, vehicles_with_driver, trip_details
-- once the underlying table policies allow it. For views we need to grant SELECT.
GRANT SELECT ON public.fleet_dashboard_stats TO anon;
GRANT SELECT ON public.vehicles_with_driver TO anon;
GRANT SELECT ON public.trip_details TO anon;
