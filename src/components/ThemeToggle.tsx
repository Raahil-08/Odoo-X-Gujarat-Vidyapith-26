import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="relative h-12 w-24 neu-border neu-shadow neu-press rounded-[var(--radius)] bg-muted overflow-hidden flex items-center"
      aria-label="Toggle theme"
    >
      <div
        className={`absolute h-9 w-10 neu-border bg-primary rounded-sm transition-all duration-200 ${
          dark ? "left-[calc(100%-2.75rem)]" : "left-[3px]"
        }`}
      />
      <div className="flex items-center justify-between w-full px-3 relative z-10">
        <Sun className="h-5 w-5" />
        <Moon className="h-5 w-5" />
      </div>
    </button>
  );
}
