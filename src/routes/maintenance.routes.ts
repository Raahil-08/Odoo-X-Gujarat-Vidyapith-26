import { Router } from "express";
import { requireAuth } from "../lib/auth";
import { requireRole } from "../lib/rbac";
import { supabaseAsUser } from "../lib/supabase";

const router = Router();

// ── POST /api/maintenance — Log maintenance (MANAGER only) ────────────────
router.post(
    "/",
    requireAuth,
    requireRole(["MANAGER"]),
    async (req, res) => {
        const jwt = (req as any).jwt as string;
        const supabase = supabaseAsUser(jwt);

        const { vehicle_id, type, description, service_date, cost } = req.body;

        if (!vehicle_id || !type) {
            return res.status(400).json({ error: "vehicle_id and type are required" });
        }

        const { error } = await supabase.rpc("log_maintenance", {
            p_vehicle_id: vehicle_id,
            p_type: type,
            p_description: description ?? null,
            p_service_date: service_date ?? null,
            p_cost: cost ?? 0,
        });

        if (error) return res.status(400).json({ error: error.message });

        res.json({ success: true });
    }
);

export default router;