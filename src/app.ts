import express from "express";
import cors from "cors";

import tripsRoutes from "./routes/trips.routes";
import maintenanceRoutes from "./routes/maintenance.routes";
import vehiclesRoutes from "./routes/vehicles.routes";
import driversRoutes from "./routes/drivers.routes";
import tripsGetRoutes from "./routes/trips.get.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import fuelRoutes from "./routes/fuel.routes";
import expensesRoutes from "./routes/expenses.routes";
import analyticsRoutes from "./routes/analytics.routes";
import exportsRoutes from "./routes/exports.routes";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => {
    res.json({ ok: true });
});

// ── Core ─────────────────────────────────────────────────────────────────
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/vehicles", vehiclesRoutes);
app.use("/api/drivers", driversRoutes);
app.use("/api/trips", tripsRoutes);
app.use("/api/trips", tripsGetRoutes);
app.use("/api/maintenance", maintenanceRoutes);

// ── New modules ───────────────────────────────────────────────────────────
app.use("/api/fuel", fuelRoutes);
app.use("/api/expenses", expensesRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/exports", exportsRoutes);