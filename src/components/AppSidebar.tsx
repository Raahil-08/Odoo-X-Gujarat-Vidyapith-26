import { LayoutDashboard, Truck, Send, Wrench, DollarSign, Users, BarChart3, LogOut } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

const navItems = [
  { title: "DASHBOARD", path: "/dashboard", icon: LayoutDashboard },
  { title: "VEHICLES", path: "/vehicles", icon: Truck },
  { title: "DISPATCH", path: "/dispatch", icon: Send },
  { title: "MAINTENANCE", path: "/maintenance", icon: Wrench },
  { title: "EXPENSES", path: "/expenses", icon: DollarSign },
  { title: "DRIVERS", path: "/drivers", icon: Users },
  { title: "ANALYTICS", path: "/analytics", icon: BarChart3 },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 min-h-screen bg-sidebar text-sidebar-foreground border-r-[3px] border-foreground flex flex-col">
      <div className="p-6 border-b-[3px] border-foreground">
        <h1 className="text-2xl font-bold tracking-tight">FLEET<span className="text-sidebar-primary-foreground bg-sidebar-primary px-1">FLOW</span></h1>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-bold tracking-wider transition-all duration-100 rounded-[var(--radius)] ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground neu-border neu-shadow"
                  : "hover:bg-sidebar-accent/20"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.title}
            </NavLink>
          );
        })}
      </nav>
      <div className="p-3 border-t-[3px] border-foreground">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-4 py-3 text-sm font-bold tracking-wider hover:bg-sidebar-accent/20 rounded-[var(--radius)]"
        >
          <LogOut className="h-5 w-5" />
          LOGOUT
        </NavLink>
      </div>
    </aside>
  );
}
