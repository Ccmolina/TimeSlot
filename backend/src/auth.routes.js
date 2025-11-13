import { Router } from "express";
import { pool } from "./db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendResetEmail } from "./mailer.js";
import { requireAuth } from "./authMiddleware.js";

const router = Router();

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
}


router.post("/demo", async (_req, res) => {
  const user = { id: 0, email: "demo@timeslot.local", name: "Demo", last: "" };
  const token = signToken(user);
  return res.json({ token, user });
});


router.post("/register", async (req, res) => {
  try {
    const { name, last, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Datos incompletos" });

    const [dup] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (dup.length) return res.status(409).json({ error: "El correo ya está registrado" });

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (name, last, email, password_hash) VALUES (?, ?, ?, ?)",
      [name || "", last || "", email, hash]
    );

    const user = { id: result.insertId, email, name: name || "", last: last || "" };
    const token = signToken(user);
    return res.json({ token, user });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Error en servidor" });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (!rows.length) return res.status(401).json({ error: "Credenciales inválidas" });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

    const token = signToken(user);
    return res.json({ token, user: { id: user.id, email: user.email, name: user.name, last: user.last } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Error en servidor" });
  }
});


router.get("/me", requireAuth, async (req, res) => {
  const [rows] = await pool.query("SELECT id, email, name, last FROM users WHERE id = ?", [req.user.id]);
  return res.json(rows[0] || null);
});


router.post("/forgot", async (req, res) => {
  try {
    const { email } = req.body;
    const [rows] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (!rows.length) return res.json({ ok: true }); // no revelar existencia

    const user = rows[0];
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 min

    await pool.query(
      "INSERT INTO password_resets (user_id, token, expires_at, used) VALUES (?, ?, ?, 0)",
      [user.id, token, expires]
    );

    const resetUrl = `${process.env.FRONT_URL}?token=${token}`;
    await sendResetEmail(email, resetUrl);
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Error en servidor" });
  }
});


router.post("/reset", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: "Datos incompletos" });

    const [rows] = await pool.query(
      "SELECT * FROM password_resets WHERE token = ? AND used = 0 AND expires_at > NOW()",
      [token]
    );
    if (!rows.length) return res.status(400).json({ error: "Token inválido o expirado" });

    const pr = rows[0];
    const hash = await bcrypt.hash(password, 10);

    await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [hash, pr.user_id]);
    await pool.query("UPDATE password_resets SET used = 1 WHERE id = ?", [pr.id]);

    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Error en servidor" });
  }
});

export default router;
