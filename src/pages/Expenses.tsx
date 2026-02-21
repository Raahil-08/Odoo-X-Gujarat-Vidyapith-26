import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { KPICard } from "@/components/KPICard";
import {
  getVehicles,
  createFuelEntry,
  getTotalFuelCost,
  getTotalMaintenanceCost,
  getTotalOperationalCost,
} from "@/lib/supabase-queries";

export default function Expenses() {
  const queryClient = useQueryClient();
  const [vehicleId, setVehicleId] = useState("");
  const [liters, setLiters] = useState("");
  const [cost, setCost] = useState("");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10));

  const { data: vehicles = [] } = useQuery({ queryKey: ["vehicles"], queryFn: getVehicles });
  const { data: fuelTotal = 0 } = useQuery({
    queryKey: ["expense-totals", "fuel"],
    queryFn: getTotalFuelCost,
  });
  const { data: maintenanceTotal = 0 } = useQuery({
    queryKey: ["expense-totals", "maintenance"],
    queryFn: getTotalMaintenanceCost,
  });
  const { data: operationalTotal = 0 } = useQuery({
    queryKey: ["expense-totals", "operational"],
    queryFn: getTotalOperationalCost,
  });

  const createMutation = useMutation({
    mutationFn: createFuelEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-totals"] });
      setVehicleId("");
      setLiters("");
      setCost("");
      setEntryDate(new Date().toISOString().slice(0, 10));
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!vehicleId || !liters || !cost) return;
    createMutation.mutate({
      vehicle_id: vehicleId,
      liters: parseFloat(liters),
      cost: parseFloat(cost),
      entry_date: entryDate,
    });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold uppercase tracking-wider">Expense & Fuel Logging</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="neu-card p-6 space-y-4">
          <h2 className="text-lg font-bold uppercase tracking-wider">Log Fuel Entry</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1">Vehicle</label>
              <select className="w-full neu-input" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} required>
                <option value="">— Select —</option>
                {vehicles.map((v: { id: string; vehicle_id: string; name: string }) => (
                  <option key={v.id} value={v.id}>{v.vehicle_id} — {v.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-bold uppercase tracking-widest mb-1">Liters</label><input type="number" step="0.01" className="w-full neu-input" placeholder="0" value={liters} onChange={(e) => setLiters(e.target.value)} /></div>
              <div><label className="block text-xs font-bold uppercase tracking-widest mb-1">Cost (₹)</label><input type="number" step="0.01" className="w-full neu-input" placeholder="0.00" value={cost} onChange={(e) => setCost(e.target.value)} /></div>
            </div>
            <div><label className="block text-xs font-bold uppercase tracking-widest mb-1">Date</label><input type="date" className="w-full neu-input" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} /></div>
            <Button type="submit" variant="default" size="lg" className="w-full" disabled={createMutation.isPending}>Log Entry →</Button>
          </form>
        </div>

        <div className="space-y-4">
          <KPICard title="Total Fuel Cost" value={`₹${fuelTotal.toLocaleString('en-IN')}`} bgClass="bg-secondary text-secondary-foreground" />
          <KPICard title="Maintenance Cost" value={`₹${maintenanceTotal.toLocaleString('en-IN')}`} bgClass="bg-primary text-primary-foreground" />
          <KPICard title="Total Operational Cost" value={`₹${operationalTotal.toLocaleString('en-IN')}`} bgClass="bg-accent text-accent-foreground" />
        </div>
      </div>
    </div>
  );
}
