import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getDrivers, createDriver } from "@/lib/supabase-queries";
import type { Database } from "@/types/database.types";

export default function Drivers() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    license_number: "",
    license_expiry: "",
    phone: "",
    email: "",
    completion_rate: "0",
    safety_score: "0",
    status: "ACTIVE" as Database["public"]["Tables"]["drivers"]["Row"]["status"],
  });

  const { data: drivers = [], isLoading, error } = useQuery({
    queryKey: ["drivers"],
    queryFn: getDrivers,
  });

  const createMutation = useMutation({
    mutationFn: (driver: Database["public"]["Tables"]["drivers"]["Insert"]) => createDriver(driver),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      setShowModal(false);
      resetForm();
    },
  });

  function resetForm() {
    setForm({
      name: "",
      license_number: "",
      license_expiry: "",
      phone: "",
      email: "",
      completion_rate: "0",
      safety_score: "0",
      status: "ACTIVE",
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    createMutation.mutate({
      name: form.name.trim(),
      license_number: form.license_number.trim() || null,
      license_expiry: form.license_expiry || null,
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      completion_rate: parseInt(form.completion_rate, 10) || 0,
      safety_score: parseInt(form.safety_score, 10) || 0,
      status: form.status,
    });
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold uppercase tracking-wider">Driver Performance & Safety</h1>
        <div className="neu-card p-6 text-destructive font-bold">{(error as Error).message}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold uppercase tracking-wider">Driver Performance & Safety</h1>
        <Button variant="default" onClick={() => { resetForm(); setShowModal(true); }}>
          <Plus className="h-4 w-4" /> Add Driver
        </Button>
      </div>

      <div className="neu-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-foreground text-background">
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">License Expiry</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Completion</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Safety Score</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr className="border-t-[3px] border-foreground bg-card">
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground font-bold">Loading…</td>
              </tr>
            ) : (
              drivers.map((d: { id: string; name: string; license_expiry: string | null; completion_rate: number; safety_score: number; status: string }, i: number) => (
                <tr key={d.id} className={`border-t-[3px] border-foreground ${d.status === "EXPIRED" ? "bg-destructive/20" : i % 2 === 0 ? "bg-card" : "bg-muted"}`}>
                  <td className="px-4 py-3 font-bold text-sm">{d.name}</td>
                  <td className="px-4 py-3 font-mono text-sm">{d.license_expiry ?? "—"}</td>
                  <td className="px-4 py-3 font-mono font-bold text-sm">{d.completion_rate}%</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center justify-center w-14 h-14 neu-border font-mono font-bold text-lg bg-card">
                      {d.safety_score}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`neu-badge ${d.status === "EXPIRED" ? "bg-destructive text-destructive-foreground" : "bg-success text-success-foreground"}`}>
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4" onClick={() => { setShowModal(false); }}>
          <div className="w-full max-w-lg bg-card neu-border rounded-[var(--radius)] overflow-hidden" style={{ boxShadow: "8px 8px 0px 0px hsl(var(--shadow-color))" }} onClick={(e) => e.stopPropagation()}>
            <div className="bg-primary text-primary-foreground p-4 border-b-[3px] border-foreground">
              <h2 className="text-xl font-bold uppercase">Add New Driver</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1">Name</label>
                <input className="w-full neu-input" placeholder="Driver name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-1">License number</label>
                  <input className="w-full neu-input" placeholder="e.g. DL-2024-001" value={form.license_number} onChange={(e) => setForm((f) => ({ ...f, license_number: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-1">License expiry</label>
                  <input type="date" className="w-full neu-input" value={form.license_expiry} onChange={(e) => setForm((f) => ({ ...f, license_expiry: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-1">Phone</label>
                  <input type="tel" className="w-full neu-input" placeholder="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-1">Email</label>
                  <input type="email" className="w-full neu-input" placeholder="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-1">Completion rate (%)</label>
                  <input type="number" min="0" max="100" className="w-full neu-input" placeholder="0" value={form.completion_rate} onChange={(e) => setForm((f) => ({ ...f, completion_rate: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-1">Safety score (%)</label>
                  <input type="number" min="0" max="100" className="w-full neu-input" placeholder="0" value={form.safety_score} onChange={(e) => setForm((f) => ({ ...f, safety_score: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1">Status</label>
                <select className="w-full neu-input" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as typeof form.status }))}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="EXPIRED">EXPIRED</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" variant="default" className="flex-1" disabled={createMutation.isPending || !form.name.trim()}>
                  Add Driver
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowModal(false); }}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
