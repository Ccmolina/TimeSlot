import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import authRoutes from "./auth.routes.js";
import { pool } from "./db.js";

const app = express();

const ORIGIN = process.env.CORS_ORIGIN || true;
app.use(cors({ origin: ORIGIN, credentials: true }));
app.use(express.json());


app.get("/api/health", (_req, res) => res.json({ ok: true }));


app.use("/api/auth", authRoutes);


app.use((req, res) => res.status(404).json({ error: "Not found" }));



app.use((err, _req, res, _next) => {
  console.error("❌ Error:", err);
  res.status(500).json({ error: "Error en servidor" });
});


(async () => {
  try {
    const c = await pool.getConnection();
    await c.ping();
    c.release();
    console.log("✅ MySQL OK");
  } catch (err) {
    console.warn("⚠️ MySQL NO disponible:", err.message);
  }
})();


const port = Number(process.env.PORT || 4000);
const host = "0.0.0.0";

const server = app.listen(port, host, () => {
  console.log(`✅ API escuchando en http://${host}:${port}`);
});

const shutdown = () => {
  console.log("\n🛑 Cerrando servidor…");
  server.close(() => process.exit(0));
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
