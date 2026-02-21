import { Request, Response, NextFunction } from "express";
import { supabaseAsUser } from "./supabase";

export function requireRole(allowed: string[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const jwt = (req as any).jwt as string;
            const supabase = supabaseAsUser(jwt);

            const { data: userData, error: userErr } = await supabase.auth.getUser();
            if (userErr || !userData.user) return res.status(401).json({ error: "Invalid token" });

            const userId = userData.user.id;

            const { data: profile, error } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", userId)
                .single();

            if (error) return res.status(403).json({ error: "No role profile" });

            if (!allowed.includes(profile.role)) {
                return res.status(403).json({ error: "Forbidden" });
            }

            (req as any).role = profile.role;
            next();
        } catch (e: any) {
            res.status(500).json({ error: e.message });
        }
    };
}