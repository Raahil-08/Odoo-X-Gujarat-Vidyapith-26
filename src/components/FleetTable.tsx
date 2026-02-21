import { useQuery } from "@tanstack/react-query";
import { getVehicles } from "@/lib/supabase-queries";

const statusStyles: Record<string, string> = {
  "ON TRIP": "bg-tag-on-trip text-tag-on-trip-foreground",
  "IN SHOP": "bg-tag-in-shop text-tag-in-shop-foreground",
  "AVAILABLE": "bg-tag-available text-tag-available-foreground",
  "COMPLETED": "bg-accent text-accent-foreground",
};

export function FleetTable() {
  const { data: fleetData = [], isLoading, error } = useQuery({
    queryKey: ["vehicles"],
    queryFn: getVehicles,
  });

  const rows = fleetData.map((v: { id: string; vehicle_id: string; name: string; plate_number: string; status: string; drivers?: { name: string } | null }) => ({
    id: v.vehicle_id,
    name: v.name,
    plate: v.plate_number,
    driver: v.drivers?.name ?? "—",
    status: v.status,
  }));

  if (error) {
    return (
      <div className="neu-card p-6 text-destructive font-bold">
        Failed to load fleet: {(error as Error).message}
          </div>
    );
  }

  return (
    <div className="neu-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-foreground text-background">
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">ID</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Vehicle</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Reg. No.</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Driver</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr className="border-t-[3px] border-foreground bg-card">
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground font-bold">
                  Loading…
                </td>
              </tr>
            ) : (
              rows.map((item, i) => (
                <tr key={item.id} className={`border-t-[3px] border-foreground ${i % 2 === 0 ? "bg-card" : "bg-muted"}`}>
                  <td className="px-4 py-3 font-mono font-bold text-sm">{item.id}</td>
                  <td className="px-4 py-3 font-bold text-sm">{item.name}</td>
                  <td className="px-4 py-3 font-mono text-sm">{item.plate}</td>
                  <td className="px-4 py-3 text-sm">{item.driver}</td>
                  <td className="px-4 py-3">
                    <span className={`neu-badge ${statusStyles[item.status] ?? "bg-muted"}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
