import { Router } from "express";
import { requireAuth } from "../lib/auth";
import { requireRole } from "../lib/rbac";
import { supabaseAsUser } from "../lib/supabase";

const router = Router();

// ── Helper: convert array of objects → CSV string ──────────────────────────
function toCSV(rows: Record<string, unknown>[]): string {
    if (!rows || rows.length === 0) return "";
    const headers = Object.keys(rows[0]);
    const escape = (val: unknown): string => {
        const str = val === null || val === undefined ? "" : String(val);
        return str.includes(",") || str.includes('"') || str.includes("\n")
            ? `"${str.replace(/"/g, '""')}"`
            : str;
    };
    const headerRow = headers.join(",");
    const dataRows = rows.map((row) => headers.map((h) => escape(row[h])).join(","));
    return [headerRow, ...dataRows].join("\n");
}

// ── GET /api/exports/vehicles.csv ──────────────────────────────────────────
router.get(
    "/vehicles.csv",
    requireAuth,
    requireRole(["FINANCIAL_ANALYST", "MANAGER"]),
    async (req, res) => {
        const jwt = (req as any).jwt as string;
        const supabase = supabaseAsUser(jwt);

        const { data, error } = await supabase
            .from("vehicles")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) return res.status(400).json({ error: error.message });

        const csv = toCSV((data as Record<string, unknown>[]) ?? []);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", 'attachment; filename="vehicles.csv"');
        res.send(csv);
    }
);

// ── GET /api/exports/financials.csv ───────────────────────────────────────
router.get(
    "/financials.csv",
    requireAuth,
    requireRole(["FINANCIAL_ANALYST", "MANAGER"]),
    async (req, res) => {
        const jwt = (req as any).jwt as string;
        const supabase = supabaseAsUser(jwt);

        const { data, error } = await supabase.rpc("get_vehicle_financials");

        if (error) return res.status(400).json({ error: error.message });

        const csv = toCSV((data as Record<string, unknown>[]) ?? []);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", 'attachment; filename="financials.csv"');
        res.send(csv);
    }
);

export default router;
