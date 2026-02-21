interface KPICardProps {
  title: string;
  value: string | number;
  bgClass: string;
}

export function KPICard({ title, value, bgClass }: KPICardProps) {
  return (
    <div className={`neu-card p-6 ${bgClass} hover:-translate-y-1 transition-transform duration-150`}>
      <p className="text-xs font-bold uppercase tracking-widest mb-2">{title}</p>
      <p className="text-4xl font-bold font-mono">{value}</p>
    </div>
  );
}
