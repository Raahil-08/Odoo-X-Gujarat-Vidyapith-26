import { Router } from "express";
import { requireAuth } from "../lib/auth";
import { requireRole } from "../lib/rbac";
import { supabaseAsUser } from "../lib/supabase";

const router = Router();

router.post(
    "/",
    requireAuth,
    requireRole(["FINANCIAL_ANALYST", "MANAGER"]),
    async (req, res) => {
        const jwt = (req as any).jwt as string;
        const supabase = supabaseAsUser(jwt);

        const { vehicle_id, trip_id, liters, cost, log_date } = req.body;

        if (!vehicle_id) {
            return res.status(400).json({ error: "vehicle_id is required" });
        }
        if (typeof liters !== "number") {
            return res.status(400).json({ error: "liters must be a number" });
        }
        if (typeof cost !== "number") {
            return res.status(400).json({ error: "cost must be a number" });
        }

        const { data, error } = await supabase.rpc("log_fuel", {
            p_vehicle_id: vehicle_id,
            p_liters: liters,
            p_cost: cost,
            p_trip_id: trip_id ?? null,
            p_log_date: log_date ?? null,
        });

        if (error) return res.status(400).json({ error: error.message });

        res.status(201).json({ success: true, fuel_log_id: data });
    }
);

export default router;
