import { Router } from "express";
import { requireAuth } from "../lib/auth";
import { requireRole } from "../lib/rbac";
import { supabaseAsUser } from "../lib/supabase";

const router = Router();

// ── GET /api/drivers ──────────────────────────────────────────────────────
router.get("/", requireAuth, async (req, res) => {
    const jwt = (req as any).jwt as string;
    const supabase = supabaseAsUser(jwt);

    const { data, error } = await supabase
        .from("drivers")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    res.json(data);
});

// ── PATCH /api/drivers/:id/status — Update driver status (SAFETY_OFFICER, MANAGER) ──
router.patch(
    "/:id/status",
    requireAuth,
    requireRole(["SAFETY_OFFICER", "MANAGER"]),
    async (req, res) => {
        const jwt = (req as any).jwt as string;
        const supabase = supabaseAsUser(jwt);

        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: "status is required" });
        }

        const { error } = await supabase.rpc("update_driver_status", {
            p_driver_id: req.params.id,
            p_status: status,
        });

        if (error) return res.status(400).json({ error: error.message });

        res.json({ success: true });
    }
);

export default router;