import { useQuery } from "@tanstack/react-query";
import { KPICard } from "@/components/KPICard";
import { FleetTable } from "@/components/FleetTable";
import { getDashboardStats } from "@/lib/supabase-queries";

export default function Dashboard() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold uppercase tracking-wider">Dashboard Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Active Fleet"
          value={isLoading ? "…" : error ? "—" : stats?.active_fleet_count ?? 0}
          bgClass="bg-secondary text-secondary-foreground"
        />
        <KPICard
          title="Maintenance Alerts"
          value={isLoading ? "…" : error ? "—" : stats?.maintenance_alerts_count ?? 0}
          bgClass="bg-primary text-primary-foreground"
        />
        <KPICard
          title="Utilization Rate"
          value={isLoading ? "…" : error ? "—" : `${stats?.utilization_rate ?? 0}%`}
          bgClass="bg-success text-success-foreground"
        />
        <KPICard
          title="Available"
          value={isLoading ? "…" : error ? "—" : stats?.available_count ?? 0}
          bgClass="bg-accent text-accent-foreground"
        />
      </div>

      <div>
        <h2 className="text-lg font-bold uppercase tracking-wider mb-3">Fleet Status</h2>
        <FleetTable />
      </div>
    </div>
  );
}
