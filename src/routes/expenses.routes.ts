import { Router } from "express";
import { requireAuth } from "../lib/auth";
import { requireRole } from "../lib/rbac";
import { supabaseAsUser } from "../lib/supabase";

const VALID_CATEGORIES = ["MAINTENANCE", "TOLL", "PARKING", "OTHER"] as const;
type ExpenseCategory = typeof VALID_CATEGORIES[number];

const router = Router();

router.post(
    "/",
    requireAuth,
    requireRole(["FINANCIAL_ANALYST", "MANAGER"]),
    async (req, res) => {
        const jwt = (req as any).jwt as string;
        const supabase = supabaseAsUser(jwt);

        const { category, amount, trip_id, description, expense_date } = req.body;

        if (!category || !VALID_CATEGORIES.includes(category as ExpenseCategory)) {
            return res.status(400).json({
                error: `category must be one of: ${VALID_CATEGORIES.join(", ")}`,
            });
        }
        if (typeof amount !== "number") {
            return res.status(400).json({ error: "amount must be a number" });
        }

        const { data, error } = await supabase.rpc("log_expense", {
            p_category: category,
            p_amount: amount,
            p_trip_id: trip_id ?? null,
            p_description: description ?? null,
            p_expense_date: expense_date ?? null,
        });

        if (error) return res.status(400).json({ error: error.message });

        res.status(201).json({ success: true, expense_id: data });
    }
);

export default router;
