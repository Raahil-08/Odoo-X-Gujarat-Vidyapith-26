import { Router } from "express";
import { requireAuth } from "../lib/auth";
import { requireRole } from "../lib/rbac";
import { supabaseAsUser } from "../lib/supabase";

const router = Router();

router.get(
    "/vehicles",
    requireAuth,
    requireRole(["FINANCIAL_ANALYST", "MANAGER"]),
    async (req, res) => {
        const jwt = (req as any).jwt as string;
        const supabase = supabaseAsUser(jwt);

        const { data, error } = await supabase.rpc("get_vehicle_financials");

        if (error) return res.status(400).json({ error: error.message });

        res.json(data);
    }
);

export default router;
