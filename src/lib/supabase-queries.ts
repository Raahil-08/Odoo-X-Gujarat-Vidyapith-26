import { supabase } from './supabase';
import type { Database } from '@/types/database.types';

type Vehicle = Database['public']['Tables']['vehicles']['Row'];
type Driver = Database['public']['Tables']['drivers']['Row'];
type Trip = Database['public']['Tables']['trips']['Row'];
type MaintenanceLog = Database['public']['Tables']['maintenance_logs']['Row'];
type FuelEntry = Database['public']['Tables']['fuel_entries']['Row'];
type Expense = Database['public']['Tables']['expenses']['Row'];

// ============================================================================
// VEHICLES QUERIES
// ============================================================================

export async function getVehicles() {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*, drivers(*)')
    .order('vehicle_id', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getVehicleById(id: string) {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*, drivers(*)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function getVehiclesByStatus(status: Vehicle['status']) {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*, drivers(*)')
    .eq('status', status)
    .order('vehicle_id', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createVehicle(vehicle: Database['public']['Tables']['vehicles']['Insert']) {
  const { data, error } = await supabase
    .from('vehicles')
    .insert(vehicle)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateVehicle(id: string, updates: Database['public']['Tables']['vehicles']['Update']) {
  const { data, error } = await supabase
    .from('vehicles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteVehicle(id: string) {
  const { error } = await supabase
    .from('vehicles')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================================================
// DRIVERS QUERIES
// ============================================================================

export async function getDrivers() {
  const { data, error } = await supabase
    .from('drivers')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getDriverById(id: string) {
  const { data, error } = await supabase
    .from('drivers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function getActiveDrivers() {
  const { data, error } = await supabase
    .from('drivers')
    .select('*')
    .eq('status', 'ACTIVE')
    .order('name', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createDriver(driver: Database['public']['Tables']['drivers']['Insert']) {
  const { data, error } = await supabase
    .from('drivers')
    .insert(driver)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateDriver(id: string, updates: Database['public']['Tables']['drivers']['Update']) {
  const { data, error } = await supabase
    .from('drivers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDriver(id: string) {
  const { error } = await supabase
    .from('drivers')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================================================
// TRIPS QUERIES
// ============================================================================

export async function getTrips() {
  const { data, error } = await supabase
    .from('trip_details')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getTripById(id: string) {
  const { data, error } = await supabase
    .from('trip_details')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function getTripsByStage(stage: Trip['stage']) {
  const { data, error } = await supabase
    .from('trip_details')
    .select('*')
    .eq('stage', stage)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getTripsByVehicle(vehicleId: string) {
  const { data, error } = await supabase
    .from('trip_details')
    .select('*')
    .eq('vehicle_id', vehicleId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createTrip(trip: Database['public']['Tables']['trips']['Insert']) {
  // Generate trip_id if not provided
  if (!trip.trip_id) {
    const { data: generatedId } = await supabase.rpc('generate_trip_id');
    trip.trip_id = (generatedId as string) ?? '';
  }

  // Set created_by to current user
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    trip.created_by = user.id;
  }

  const { data, error } = await supabase
    .from('trips')
    .insert(trip)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTrip(id: string, updates: Database['public']['Tables']['trips']['Update']) {
  const { data, error } = await supabase
    .from('trips')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTrip(id: string) {
  const { error } = await supabase
    .from('trips')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================================================
// MAINTENANCE LOGS QUERIES
// ============================================================================

export async function getMaintenanceLogs() {
  const { data, error } = await supabase
    .from('maintenance_logs')
    .select('*, vehicles(*)')
    .order('service_date', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getMaintenanceLogById(id: string) {
  const { data, error } = await supabase
    .from('maintenance_logs')
    .select('*, vehicles(*)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function getMaintenanceLogsByVehicle(vehicleId: string) {
  const { data, error } = await supabase
    .from('maintenance_logs')
    .select('*')
    .eq('vehicle_id', vehicleId)
    .order('service_date', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getMaintenanceLogsByStatus(status: MaintenanceLog['status']) {
  const { data, error } = await supabase
    .from('maintenance_logs')
    .select('*, vehicles(*)')
    .eq('status', status)
    .order('service_date', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createMaintenanceLog(log: Database['public']['Tables']['maintenance_logs']['Insert']) {
  // Generate log_id if not provided
  if (!log.log_id) {
    const { data: generatedId } = await supabase.rpc('generate_maintenance_log_id');
    log.log_id = (generatedId as string) ?? '';
  }

  // Set created_by to current user
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    log.created_by = user.id;
  }

  const { data, error } = await supabase
    .from('maintenance_logs')
    .insert(log)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateMaintenanceLog(id: string, updates: Database['public']['Tables']['maintenance_logs']['Update']) {
  const { data, error } = await supabase
    .from('maintenance_logs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMaintenanceLog(id: string) {
  const { error } = await supabase
    .from('maintenance_logs')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================================================
// FUEL ENTRIES QUERIES
// ============================================================================

export async function getFuelEntries() {
  const { data, error } = await supabase
    .from('fuel_entries')
    .select('*, vehicles(*), trips(*)')
    .order('entry_date', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getFuelEntriesByVehicle(vehicleId: string) {
  const { data, error } = await supabase
    .from('fuel_entries')
    .select('*')
    .eq('vehicle_id', vehicleId)
    .order('entry_date', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createFuelEntry(entry: Database['public']['Tables']['fuel_entries']['Insert']) {
  // Set created_by to current user
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    entry.created_by = user.id;
  }

  const { data, error } = await supabase
    .from('fuel_entries')
    .insert(entry)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateFuelEntry(id: string, updates: Database['public']['Tables']['fuel_entries']['Update']) {
  const { data, error } = await supabase
    .from('fuel_entries')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteFuelEntry(id: string) {
  const { error } = await supabase
    .from('fuel_entries')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================================================
// EXPENSES QUERIES
// ============================================================================

export async function getExpenses() {
  const { data, error } = await supabase
    .from('expenses')
    .select('*, vehicles(*), trips(*)')
    .order('expense_date', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getExpensesByVehicle(vehicleId: string) {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('vehicle_id', vehicleId)
    .order('expense_date', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getExpensesByCategory(category: Expense['category']) {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('category', category)
    .order('expense_date', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createExpense(expense: Database['public']['Tables']['expenses']['Insert']) {
  // Set created_by to current user
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    expense.created_by = user.id;
  }

  const { data, error } = await supabase
    .from('expenses')
    .insert(expense)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateExpense(id: string, updates: Database['public']['Tables']['expenses']['Update']) {
  const { data, error } = await supabase
    .from('expenses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteExpense(id: string) {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================================================
// DASHBOARD STATS QUERIES
// ============================================================================

export async function getDashboardStats() {
  const { data, error } = await supabase
    .from('fleet_dashboard_stats')
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

// Get total fuel cost
export async function getTotalFuelCost() {
  const { data, error } = await supabase
    .from('fuel_entries')
    .select('cost');

  if (error) throw error;
  return data.reduce((sum, entry) => sum + (entry.cost || 0), 0);
}

// Get total maintenance cost
export async function getTotalMaintenanceCost() {
  const { data, error } = await supabase
    .from('maintenance_logs')
    .select('cost')
    .eq('status', 'COMPLETED');

  if (error) throw error;
  return data.reduce((sum, log) => sum + (log.cost || 0), 0);
}

// Get total operational cost (fuel + maintenance + expenses)
export async function getTotalOperationalCost() {
  const [fuelCost, maintenanceCost, expensesData] = await Promise.all([
    getTotalFuelCost(),
    getTotalMaintenanceCost(),
    supabase.from('expenses').select('amount'),
  ]);

  if (expensesData.error) throw expensesData.error;
  const expensesCost = expensesData.data.reduce((sum, exp) => sum + (exp.amount || 0), 0);

  return fuelCost + maintenanceCost + expensesCost;
}

// Analytics: fuel cost by month (last 6 months)
export async function getFuelCostByMonth() {
  const { data, error } = await supabase
    .from('fuel_entries')
    .select('entry_date, cost');
  if (error) throw error;
  const byMonth: Record<string, number> = {};
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  data.forEach((row) => {
    const d = new Date(row.entry_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    byMonth[key] = (byMonth[key] ?? 0) + Number(row.cost);
  });
  const sorted = Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b)).slice(-6);
  return sorted.map(([key, value]) => {
    const [y, m] = key.split('-');
    return { month: months[parseInt(m, 10) - 1], value: Math.round(value) };
  });
}

// Analytics: utilization rate placeholder (use dashboard stats or compute from trips)
export async function getUtilizationTrend() {
  const stats = await getDashboardStats();
  const rate = stats?.utilization_rate ?? 0;
  const months = ['SEP', 'OCT', 'NOV', 'DEC', 'JAN', 'FEB'];
  return months.map((month, i) => ({ month, rate: Math.min(100, rate + (i - 2) * 3) }));
}
