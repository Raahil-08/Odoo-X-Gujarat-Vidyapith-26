import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { KPICard } from "@/components/KPICard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from "recharts";
import { getDashboardStats, getFuelCostByMonth, getUtilizationTrend } from "@/lib/supabase-queries";

export default function Analytics() {
  const { data: stats } = useQuery({ queryKey: ["dashboard-stats"], queryFn: getDashboardStats });
  const { data: fuelData = [] } = useQuery({ queryKey: ["analytics-fuel"], queryFn: getFuelCostByMonth });
  const { data: utilizationData = [] } = useQuery({ queryKey: ["analytics-utilization"], queryFn: getUtilizationTrend });

  const utilizationRate = stats?.utilization_rate ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold uppercase tracking-wider">Operational Analytics</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Export CSV</Button>
          <Button variant="outline" size="sm">Export PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard title="Fuel Efficiency" value="8.2 km/L" bgClass="bg-secondary text-secondary-foreground" />
        <KPICard title="Vehicle ROI" value="142%" bgClass="bg-success text-success-foreground" />
        <KPICard title="Utilization Rate" value={`${utilizationRate}%`} bgClass="bg-primary text-primary-foreground" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="neu-card p-6">
          <h2 className="text-lg font-bold uppercase tracking-wider mb-4">Fuel Cost Trend</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={fuelData.length ? fuelData : [{ month: "—", value: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontWeight: 700, fontSize: 12 }} />
              <YAxis tick={{ fontWeight: 700, fontSize: 12 }} />
              <Bar dataKey="value" fill="hsl(var(--secondary))" stroke="hsl(var(--foreground))" strokeWidth={3} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="neu-card p-6">
          <h2 className="text-lg font-bold uppercase tracking-wider mb-4">Utilization Rate</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={utilizationData.length ? utilizationData : [{ month: "—", rate: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontWeight: 700, fontSize: 12 }} />
              <YAxis tick={{ fontWeight: 700, fontSize: 12 }} />
              <Line type="monotone" dataKey="rate" stroke="hsl(var(--accent))" strokeWidth={4} dot={{ r: 6, strokeWidth: 3, fill: "hsl(var(--background))" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
