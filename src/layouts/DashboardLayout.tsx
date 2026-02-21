import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b-[3px] border-foreground flex items-center justify-between px-6">
          <h2 className="text-lg font-bold uppercase tracking-wider">Command Center</h2>
          <ThemeToggle />
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
