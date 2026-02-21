import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"manager" | "dispatcher">("manager");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md bg-primary neu-border rounded-[var(--radius)] p-8" style={{ boxShadow: "8px 8px 0px 0px hsl(var(--shadow-color))" }}>
        <h1 className="text-4xl font-bold text-primary-foreground mb-2 tracking-tight">
          FLEET<span className="bg-foreground text-background px-2 py-0.5 ml-1">FLOW</span>
        </h1>
        <p className="text-primary-foreground/80 font-bold text-sm uppercase tracking-wider mb-8">
          Fleet & Logistics Command
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-primary-foreground mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="operator@fleetflow.io"
              className="w-full neu-input"
              defaultValue="admin@fleetflow.io"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-primary-foreground mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full neu-input"
              defaultValue="password"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-primary-foreground mb-2">
              Role
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRole("manager")}
                className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider neu-border rounded-[var(--radius)] transition-all duration-100 neu-press ${
                  role === "manager"
                    ? "bg-secondary text-secondary-foreground neu-shadow"
                    : "bg-background/50 text-primary-foreground/70 hover:bg-background/80"
                }`}
              >
                Manager
              </button>
              <button
                type="button"
                onClick={() => setRole("dispatcher")}
                className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider neu-border rounded-[var(--radius)] transition-all duration-100 neu-press ${
                  role === "dispatcher"
                    ? "bg-secondary text-secondary-foreground neu-shadow"
                    : "bg-background/50 text-primary-foreground/70 hover:bg-background/80"
                }`}
              >
                Dispatcher
              </button>
            </div>
          </div>

          <Button type="submit" size="lg" variant="outline" className="w-full mt-6 text-base">
            LOGIN →
          </Button>
        </form>
      </div>
    </div>
  );
}
