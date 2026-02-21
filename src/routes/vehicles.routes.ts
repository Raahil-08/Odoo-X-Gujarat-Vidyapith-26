import { Router } from "express";
import { requireAuth } from "../lib/auth";
import { supabaseAsUser } from "../lib/supabase";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
    const jwt = (req as any).jwt;
    const supabase = supabaseAsUser(jwt);

    const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    res.json(data);
});

export default router;