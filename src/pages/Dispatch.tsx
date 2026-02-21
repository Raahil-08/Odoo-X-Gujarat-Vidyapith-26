import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { getTrips, getVehicles, getActiveDrivers, createTrip } from "@/lib/supabase-queries";

const stages = ["DRAFT", "DISPATCHED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

export default function Dispatch() {
  const queryClient = useQueryClient();
  const [cargoWeight, setCargoWeight] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [tripDurationDays, setTripDurationDays] = useState("");
  const [estFuelCost, setEstFuelCost] = useState("");
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  const { data: trips = [] } = useQuery({ queryKey: ["trips"], queryFn: getTrips });
  const { data: vehicles = [] } = useQuery({ queryKey: ["vehicles"], queryFn: getVehicles });
  const { data: drivers = [] } = useQuery({ queryKey: ["drivers"], queryFn: getActiveDrivers });

  const selectedVehicle = vehicles.find((v: { id: string; max_load_kg: number }) => v.id === vehicleId);
  const maxCapacity = selectedVehicle?.max_load_kg ?? 25000;
  const overloaded = Number(cargoWeight) > maxCapacity;

  const createMutation = useMutation({
    mutationFn: createTrip,
    onSuccess: async () => {
      setCargoWeight("");
      setVehicleId("");
      setDriverId("");
      setOrigin("");
      setDestination("");
      setTripDurationDays("");
      setEstFuelCost("");
      await queryClient.refetchQueries({ queryKey: ["trips"] });
      await queryClient.refetchQueries({ queryKey: ["vehicles"] });
    },
    onError: (err) => {
      window.alert(`Failed to dispatch trip: ${(err as Error).message}`);
    },
  });

  function handleDispatch(e: React.FormEvent) {
    e.preventDefault();
    if (overloaded) {
      window.alert(`Cargo weight (${cargoWeight} kg) exceeds this truck's max capacity (${maxCapacity.toLocaleString()} kg). Please reduce the load or choose another vehicle.`);
      return;
    }
    if (!vehicleId || !driverId || !origin.trim() || !destination.trim()) return;
    createMutation.mutate({
      vehicle_id: vehicleId,
      driver_id: driverId,
      origin: origin.trim(),
      destination: destination.trim(),
      cargo_weight_kg: parseInt(cargoWeight, 10) || 0,
      trip_duration_days: tripDurationDays ? parseInt(tripDurationDays, 10) || null : null,
      estimated_fuel_cost: parseFloat(estFuelCost) || 0,
      stage: "DISPATCHED",
    });
  }

  const recentTrips = trips.slice(0, 5);
  const selectedTrip = selectedTripId ? trips.find((t: { id: string }) => t.id === selectedTripId) : null;
  const activeStage = selectedTrip ? (selectedTrip as { stage: string }).stage : null;

  function getDaysLeft(createdAt: string, durationDays: number | null): string | null {
    if (durationDays == null || durationDays <= 0) return null;
    const start = new Date(createdAt).getTime();
    const end = start + durationDays * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const daysLeft = Math.ceil((end - now) / (24 * 60 * 60 * 1000));
    if (daysLeft > 0) return `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`;
    if (daysLeft === 0) return "Due today";
    return `${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? "" : "s"} overdue`;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold uppercase tracking-wider">Trip Dispatcher</h1>

      <div className="flex items-center gap-0 overflow-x-auto">
        {stages.map((stage, i) => {
          const isActiveStage = activeStage === stage;
          const stageIndex = stages.indexOf(activeStage ?? "");
          const isPastOrCurrent = activeStage ? i <= stageIndex : i <= 1;
          return (
            <div key={stage} className="flex items-center">
              <div className={`px-5 py-3 text-xs font-bold uppercase tracking-wider neu-border ${isActiveStage ? "bg-primary text-primary-foreground ring-2 ring-foreground" : isPastOrCurrent ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"}`}>
                {stage.replace("_", " ")}
              </div>
              {i < stages.length - 1 && <div className="w-8 h-[3px] bg-foreground" />}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="neu-card p-6 space-y-4">
          <h2 className="text-lg font-bold uppercase tracking-wider">New Dispatch</h2>
          <form onSubmit={handleDispatch} className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1">Select Vehicle</label>
              <select className="w-full neu-input" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} required>
                <option value="">— Select —</option>
                {vehicles.filter((v: { status: string }) => v.status === "AVAILABLE" || v.status === "ON TRIP").map((v: { id: string; vehicle_id: string; name: string; max_load_kg: number }) => (
                  <option key={v.id} value={v.id}>{v.vehicle_id} — {v.name} (max {v.max_load_kg.toLocaleString()} kg)</option>
                ))}
              </select>
              {selectedVehicle && (
                <p className="mt-1.5 text-sm font-bold text-muted-foreground">
                  Max capacity: <span className="font-mono text-foreground">{selectedVehicle.max_load_kg.toLocaleString()} kg</span>
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1">Select Driver</label>
              <select className="w-full neu-input" value={driverId} onChange={(e) => setDriverId(e.target.value)} required>
                <option value="">— Select —</option>
                {drivers.map((d: { id: string; name: string }) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1">Cargo Weight (kg)</label>
              <input
                type="number"
                className="w-full neu-input"
                value={cargoWeight}
                onChange={(e) => setCargoWeight(e.target.value)}
                onBlur={() => {
                  if (vehicleId && cargoWeight && Number(cargoWeight) > maxCapacity) {
                    window.alert(`Cargo weight (${cargoWeight} kg) exceeds this truck's max capacity (${maxCapacity.toLocaleString()} kg). Please reduce the load or choose another vehicle.`);
                  }
                }}
                placeholder="Enter weight"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-bold uppercase tracking-widest mb-1">Origin</label><input className="w-full neu-input" placeholder="City / Depot" value={origin} onChange={(e) => setOrigin(e.target.value)} /></div>
              <div><label className="block text-xs font-bold uppercase tracking-widest mb-1">Destination</label><input className="w-full neu-input" placeholder="City / Depot" value={destination} onChange={(e) => setDestination(e.target.value)} /></div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1">Trip duration (days)</label>
              <input type="number" min="1" className="w-full neu-input" placeholder="e.g. 3" value={tripDurationDays} onChange={(e) => setTripDurationDays(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1">Est. Fuel Cost (₹)</label>
              <input type="number" step="0.01" className="w-full neu-input" placeholder="0.00" value={estFuelCost} onChange={(e) => setEstFuelCost(e.target.value)} />
            </div>

            {overloaded && (
              <div className="bg-destructive text-destructive-foreground neu-border p-4 flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 flex-shrink-0" />
                <span className="font-bold uppercase text-sm">Load exceeds capacity — max {maxCapacity.toLocaleString()} kg</span>
              </div>
            )}

            <Button type="submit" variant="secondary" size="lg" className="w-full" disabled={overloaded || createMutation.isPending}>
              Dispatch Trip →
            </Button>
          </form>
        </div>

        <div className="neu-card p-6 space-y-4">
          <h2 className="text-lg font-bold uppercase tracking-wider">Recent Dispatches</h2>
          {recentTrips.length === 0 ? (
            <p className="text-muted-foreground text-sm">No trips yet.</p>
          ) : (
            <div className="overflow-x-auto border-[3px] border-foreground rounded-[var(--radius)]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-[3px] border-foreground bg-muted/50">
                    <th className="p-3 text-xs font-bold uppercase tracking-widest">Trip ID</th>
                    <th className="p-3 text-xs font-bold uppercase tracking-widest">Route</th>
                    <th className="p-3 text-xs font-bold uppercase tracking-widest whitespace-nowrap">Duration left</th>
                    <th className="p-3 text-xs font-bold uppercase tracking-widest">Stage</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTrips.map((d: { id: string; trip_id: string; vehicle_code?: string; vehicle_name?: string; origin: string; destination: string; stage: string; created_at: string; trip_duration_days: number | null }) => {
                    const hasDuration = d.trip_duration_days != null && d.trip_duration_days > 0;
                    const durationLeftRaw = (d.stage === "DISPATCHED" || d.stage === "IN_PROGRESS") && hasDuration
                      ? getDaysLeft(d.created_at, d.trip_duration_days)
                      : null;
                    const durationLeft = durationLeftRaw ?? (hasDuration ? `${d.trip_duration_days} day${d.trip_duration_days === 1 ? "" : "s"}` : "Not set");
                    const isSelected = selectedTripId === d.id;
                    return (
                      <tr
                        key={d.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedTripId(d.id)}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedTripId(d.id); } }}
                        className={`border-b border-foreground/30 last:border-b-0 cursor-pointer transition-colors ${isSelected ? "bg-primary/15 ring-2 ring-primary" : "hover:bg-muted/50"}`}
                      >
                        <td className="p-3 font-mono font-bold text-sm">{d.trip_id}</td>
                        <td className="p-3 text-sm text-muted-foreground">{d.vehicle_code ?? d.vehicle_name ?? ""} • {d.origin} → {d.destination}</td>
                        <td className="p-3 text-sm font-bold whitespace-nowrap">{durationLeft}</td>
                        <td className="p-3">
                          <span className={`neu-badge ${d.stage === "DISPATCHED" || d.stage === "IN_PROGRESS" ? "bg-secondary text-secondary-foreground" : "bg-success text-success-foreground"}`}>
                            {d.stage.replace("_", " ")}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
