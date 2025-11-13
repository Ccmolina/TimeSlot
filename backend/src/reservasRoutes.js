import { Router } from "express";
import jwt from "jsonwebtoken";

const r = Router();
const reservas = []; // {id, userId, area, profesional, fechaISO, hora, modalidad}

function auth(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: "No token" });
  try { req.user = jwt.verify(token, process.env.JWT_SECRET); next(); }
  catch { return res.status(401).json({ error: "Token inválido" }); }
}

r.get("/", auth, (req, res) => {
  res.json(reservas.filter(x => x.userId === req.user.id));
});

r.post("/", auth, (req, res) => {
  const { area, profesional, fechaISO, hora, modalidad } = req.body || {};
  if (!area || !profesional || !fechaISO || !hora) return res.status(400).json({ error: "Datos incompletos" });
  const nuevo = { id: String(Date.now()), userId: req.user.id, area, profesional, fechaISO, hora, modalidad: modalidad || "Presencial" };
  reservas.push(nuevo);
  res.json(nuevo);
});

export default r;
