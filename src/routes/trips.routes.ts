import { Router } from "express";
import { requireAuth } from "../lib/auth";
import { requireRole } from "../lib/rbac";
import { supabaseAsUser } from "../lib/supabase";

const router = Router();

// ── POST /api/trips — Create trip (DISPATCHER, MANAGER) ───────────────────
router.post(
    "/",
    requireAuth,
    requireRole(["DISPATCHER", "MANAGER"]),
    async (req, res) => {
        const jwt = (req as any).jwt as string;
        const supabase = supabaseAsUser(jwt);

        const {
            vehicle_id,
            driver_id,
            origin,
            destination,
            cargo_weight_kg,
            region,
            revenue,
        } = req.body;

        if (!vehicle_id || !driver_id || !origin || !destination) {
            return res.status(400).json({ error: "vehicle_id, driver_id, origin, destination are required" });
        }

        const { data, error } = await supabase.rpc("create_trip", {
            p_vehicle_id: vehicle_id,
            p_driver_id: driver_id,
            p_origin: origin,
            p_destination: destination,
            p_cargo_weight_kg: cargo_weight_kg ?? 0,
            p_region: region ?? null,
            p_revenue: revenue ?? 0,
        });

        if (error) return res.status(400).json({ error: error.message });

        res.status(201).json({ trip_id: data });
    }
);

// ── POST /api/trips/:id/dispatch ──────────────────────────────────────────
router.post(
    "/:id/dispatch",
    requireAuth,
    requireRole(["DISPATCHER", "MANAGER"]),
    async (req, res) => {
        const jwt = (req as any).jwt as string;
        const supabase = supabaseAsUser(jwt);

        const { error } = await supabase.rpc("dispatch_trip", {
            p_trip_id: req.params.id,
        });

        if (error) return res.status(400).json({ error: error.message });

        res.json({ success: true });
    }
);

// ── POST /api/trips/:id/complete ──────────────────────────────────────────
router.post(
    "/:id/complete",
    requireAuth,
    requireRole(["DISPATCHER", "MANAGER"]),
    async (req, res) => {
        const jwt = (req as any).jwt as string;
        const supabase = supabaseAsUser(jwt);

        const { end_odometer_km } = req.body;

        if (typeof end_odometer_km !== "number") {
            return res.status(400).json({ error: "end_odometer_km must be a number" });
        }

        const { error } = await supabase.rpc("complete_trip", {
            p_trip_id: req.params.id,
            p_end_odometer_km: end_odometer_km,
        });

        if (error) return res.status(400).json({ error: error.message });

        res.json({ success: true });
    }
);

// ── POST /api/trips/:id/cancel ────────────────────────────────────────────
router.post(
    "/:id/cancel",
    requireAuth,
    requireRole(["DISPATCHER", "MANAGER"]),
    async (req, res) => {
        const jwt = (req as any).jwt as string;
        const supabase = supabaseAsUser(jwt);

        const { error } = await supabase.rpc("cancel_trip", {
            p_trip_id: req.params.id,
        });

        if (error) return res.status(400).json({ error: error.message });

        res.json({ success: true });
    }
);

export default router;