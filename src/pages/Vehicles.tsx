import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import {
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from "@/lib/supabase-queries";
import type { Database } from "@/types/database.types";

const statusTagClasses: Record<string, string> = {
  "ON TRIP": "bg-tag-on-trip text-tag-on-trip-foreground",
  "IN SHOP": "bg-tag-in-shop text-tag-in-shop-foreground",
  "AVAILABLE": "bg-tag-available text-tag-available-foreground",
  "COMPLETED": "bg-accent text-accent-foreground",
};

type VehicleRow = Database["public"]["Tables"]["vehicles"]["Row"];

export default function Vehicles() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    vehicle_id: "",
    name: "",
    model: "",
    plate_number: "",
    max_load_kg: "25000",
    odometer_km: "0",
  });

  const { data: vehiclesData = [], isLoading, error } = useQuery({
    queryKey: ["vehicles"],
    queryFn: getVehicles,
  });

  const createMutation = useMutation({
    mutationFn: (v: Database["public"]["Tables"]["vehicles"]["Insert"]) => createVehicle(v),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      setShowModal(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Database["public"]["Tables"]["vehicles"]["Update"] }) =>
      updateVehicle(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      setEditingId(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVehicle,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vehicles"] }),
  });

  function resetForm() {
    setForm({
      vehicle_id: "",
      name: "",
      model: "",
      plate_number: "",
      max_load_kg: "25000",
      odometer_km: "0",
    });
  }

  function openAdd() {
    resetForm();
    setEditingId(null);
    setShowModal(true);
  }

  function openEdit(v: VehicleRow) {
    setForm({
      vehicle_id: v.vehicle_id,
      name: v.name,
      model: v.model ?? "",
      plate_number: v.plate_number,
      max_load_kg: String(v.max_load_kg),
      odometer_km: String(v.odometer_km),
    });
    setEditingId(v.id);
    setShowModal(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: form.name,
      model: form.model || null,
      plate_number: form.plate_number,
      max_load_kg: parseInt(form.max_load_kg, 10) || 0,
      odometer_km: parseInt(form.odometer_km, 10) || 0,
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, updates: payload });
    } else {
      createMutation.mutate({
        vehicle_id: form.vehicle_id.trim() || `TRK-${String(vehiclesData.length + 1).padStart(3, "0")}`,
        ...payload,
      });
    }
  }

  function handleDelete(id: string) {
    if (window.confirm("Delete this vehicle?")) deleteMutation.mutate(id);
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold uppercase tracking-wider">Vehicle Registry</h1>
        <div className="neu-card p-6 text-destructive font-bold">{(error as Error).message}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold uppercase tracking-wider">Vehicle Registry</h1>
        <Button variant="default" onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add Vehicle
        </Button>
      </div>

      {isLoading ? (
        <div className="neu-card p-8 text-center text-muted-foreground font-bold">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {vehiclesData.map((v: VehicleRow) => (
            <div key={v.id} className="neu-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">{v.name}</h3>
                <span className={`neu-badge ${statusTagClasses[v.status] ?? "bg-muted"}`}>
                  {v.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="font-bold uppercase text-xs text-muted-foreground">Model</span><p className="font-mono font-bold">{v.model ?? "—"}</p></div>
                <div><span className="font-bold uppercase text-xs text-muted-foreground">Plate</span><p className="font-mono font-bold">{v.plate_number}</p></div>
                <div><span className="font-bold uppercase text-xs text-muted-foreground">Max Load</span><p className="font-mono font-bold">{v.max_load_kg.toLocaleString()} kg</p></div>
                <div><span className="font-bold uppercase text-xs text-muted-foreground">Odometer</span><p className="font-mono font-bold">{v.odometer_km.toLocaleString()} km</p></div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(v)}><Edit className="h-4 w-4" /></Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(v.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4" onClick={() => { setShowModal(false); setEditingId(null); }}>
          <div className="w-full max-w-lg bg-card neu-border rounded-[var(--radius)] overflow-hidden" style={{ boxShadow: "8px 8px 0px 0px hsl(var(--shadow-color))" }} onClick={(e) => e.stopPropagation()}>
            <div className="bg-primary text-primary-foreground p-4 border-b-[3px] border-foreground">
              <h2 className="text-xl font-bold uppercase">{editingId ? "Edit Vehicle" : "Add New Vehicle"}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-1">Vehicle ID</label>
                  <input
                    className="w-full neu-input"
                    placeholder="TRK-001"
                    value={form.vehicle_id}
                    onChange={(e) => setForm((f) => ({ ...f, vehicle_id: e.target.value }))}
                    disabled={!!editingId}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-1">Name</label>
                  <input className="w-full neu-input" placeholder="Vehicle name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-1">Model</label>
                  <input className="w-full neu-input" placeholder="Year/Model" value={form.model} onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-1">Registration No. (Indian format)</label>
                  <input className="w-full neu-input" placeholder="MH-12-AB-1234" value={form.plate_number} onChange={(e) => setForm((f) => ({ ...f, plate_number: e.target.value.toUpperCase() }))} required title="e.g. State code (2 letters)-RTO number (2 digits)-Series (2 letters)-Number (1-4 digits)" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-1">Max Load (kg)</label>
                  <input type="number" className="w-full neu-input" placeholder="25000" value={form.max_load_kg} onChange={(e) => setForm((f) => ({ ...f, max_load_kg: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-1">Odometer (km)</label>
                  <input type="number" className="w-full neu-input" placeholder="0" value={form.odometer_km} onChange={(e) => setForm((f) => ({ ...f, odometer_km: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" variant="default" className="flex-1" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingId ? "Update" : "Save"} Vehicle
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowModal(false); setEditingId(null); }}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
