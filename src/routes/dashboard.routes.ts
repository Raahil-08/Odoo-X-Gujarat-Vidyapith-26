import { Router } from "express";
import { requireAuth } from "../lib/auth";
import { supabaseAsUser } from "../lib/supabase";

const router = Router();

// ── GET /api/dashboard ────────────────────────────────────────────────────
router.get("/", requireAuth, async (req, res) => {
    const jwt = (req as any).jwt as string;
    const supabase = supabaseAsUser(jwt);

    const [vehicles, drivers, activeTrips, pendingCargo] = await Promise.all([
        supabase
            .from("vehicles")
            .select("id", { count: "exact", head: true })
            .eq("status", "AVAILABLE"),
        supabase
            .from("drivers")
            .select("id", { count: "exact", head: true })
            .eq("status", "ON_DUTY"),
        supabase
            .from("trips")
            .select("id", { count: "exact", head: true })
            .eq("status", "DISPATCHED"),
        supabase
            .from("trips")
            .select("id", { count: "exact", head: true })
            .eq("status", "DRAFT"),
    ]);

    res.json({
        availableVehicles: vehicles.count ?? 0,
        availableDrivers: drivers.count ?? 0,
        activeTrips: activeTrips.count ?? 0,
        pendingCargo: pendingCargo.count ?? 0,
    });
});

export default router;