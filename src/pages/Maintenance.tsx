import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getMaintenanceLogs, getVehicles, createMaintenanceLog } from "@/lib/supabase-queries";

export default function Maintenance() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [vehicleId, setVehicleId] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<"SCHEDULED" | "IN_PROGRESS" | "COMPLETED">("SCHEDULED");

  const { data: logs = [], isLoading, error } = useQuery({
    queryKey: ["maintenance"],
    queryFn: getMaintenanceLogs,
  });
  const { data: vehicles = [] } = useQuery({ queryKey: ["vehicles"], queryFn: getVehicles });

  const createMutation = useMutation({
    mutationFn: createMaintenanceLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      setShowModal(false);
      setVehicleId("");
      setServiceType("");
      setServiceDate(new Date().toISOString().slice(0, 10));
      setStatus("SCHEDULED");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!vehicleId || !serviceType.trim()) return;
    createMutation.mutate({
      vehicle_id: vehicleId,
      service_type: serviceType.trim(),
      service_date: serviceDate,
      status,
    });
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold uppercase tracking-wider">Maintenance & Service Logs</h1>
        <div className="neu-card p-6 text-destructive font-bold">{(error as Error).message}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold uppercase tracking-wider">Maintenance & Service Logs</h1>
        <Button variant="default" onClick={() => setShowModal(true)}><Plus className="h-4 w-4" /> Log Service</Button>
      </div>

      <div className="neu-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-foreground text-background">
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Log ID</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Vehicle</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Service Type</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr className="border-t-[3px] border-foreground bg-card">
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground font-bold">Loading…</td>
              </tr>
            ) : (
              logs.map((log: { id: string; log_id: string; service_type: string; service_date: string; status: string; vehicles?: { vehicle_id: string } | null }, i: number) => (
                <tr key={log.id} className={`border-t-[3px] border-foreground ${i % 2 === 0 ? "bg-card" : "bg-muted"}`}>
                  <td className="px-4 py-3 font-mono font-bold text-sm">{log.log_id}</td>
                  <td className="px-4 py-3 font-bold text-sm">{log.vehicles?.vehicle_id ?? "—"}</td>
                  <td className="px-4 py-3 text-sm">{log.service_type}</td>
                  <td className="px-4 py-3 font-mono text-sm">{log.service_date}</td>
                  <td className="px-4 py-3">
                    <span className={`neu-badge ${log.status === "IN_PROGRESS" ? "bg-primary text-primary-foreground" : "bg-success text-success-foreground"}`}>
                      {log.status.replace("_", " ")}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-lg bg-card neu-border rounded-[var(--radius)] overflow-hidden" style={{ boxShadow: "8px 8px 0px 0px hsl(var(--shadow-color))" }} onClick={(e) => e.stopPropagation()}>
            <div className="bg-primary text-primary-foreground p-4 border-b-[3px] border-foreground">
              <h2 className="text-xl font-bold uppercase">Log Service</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1">Vehicle</label>
                <select className="w-full neu-input" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} required>
                  <option value="">— Select —</option>
                  {vehicles.map((v: { id: string; vehicle_id: string; name: string }) => (
                    <option key={v.id} value={v.id}>{v.vehicle_id} — {v.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1">Service Type</label>
                <input className="w-full neu-input" placeholder="e.g. Oil Change, Brake Inspection" value={serviceType} onChange={(e) => setServiceType(e.target.value)} required />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1">Date</label>
                <input type="date" className="w-full neu-input" value={serviceDate} onChange={(e) => setServiceDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1">Status</label>
                <select className="w-full neu-input" value={status} onChange={(e) => setStatus(e.target.value as "SCHEDULED" | "IN_PROGRESS" | "COMPLETED")}>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" variant="default" className="flex-1" disabled={createMutation.isPending}>Save</Button>
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
