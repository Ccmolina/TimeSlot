// src/admin/servicios.js
import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

// Listar servicios
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.*, u.name, u.last
      FROM servicios s
      LEFT JOIN users u ON s.user_id = u.id
      ORDER BY s.id DESC
    `);
    res.json({ ok: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: "Error en servidor" });
  }
});


// ===== Listar médicos =====
router.get("/medicos", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id AS usuario_id, name AS nombre_usuario, last AS apellido
      FROM users
      WHERE role='medico'
      ORDER BY name
    `);
    res.json({ ok: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: "Error en servidor" });
  }
});

// ===== Asignar médico a servicio =====
router.put("/asignar", async (req, res) => {
  try {
    const { servicio_id, usuario_id } = req.body;
    if (!servicio_id || !usuario_id) {
      return res.status(400).json({ ok: false, msg: "Faltan parámetros" });
    }

    await pool.query(`UPDATE servicios SET user_id=? WHERE id=?`, [usuario_id, servicio_id]);

    const [rows] = await pool.query("SELECT * FROM servicios WHERE id=?", [servicio_id]);
    res.json({ ok: true, msg: "Médico asignado correctamente", data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: "Error en servidor" });
  }
});

// ===== Crear servicio =====
router.post("/", async (req, res) => {
  try {
    const { negocio_id, user_id, nombre, descripcion, duracion_min } = req.body;
    const [result] = await pool.query(
      `INSERT INTO servicios (negocio_id, user_id, nombre, descripcion, duracion_min)
       VALUES (?, ?, ?, ?, ?)`,
      [negocio_id, user_id || null, nombre, descripcion, duracion_min]
    );

    const [rows] = await pool.query("SELECT * FROM servicios WHERE id=?", [result.insertId]);
    res.json({ ok: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: "Error en servidor" });
  }
});

// ===== Editar servicio =====
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, duracion_min, user_id } = req.body;
    await pool.query(
      `UPDATE servicios SET nombre=?, descripcion=?, duracion_min=?, user_id=? WHERE id=?`,
      [nombre, descripcion, duracion_min, user_id || null, id]
    );

    const [rows] = await pool.query("SELECT * FROM servicios WHERE id=?", [id]);
    res.json({ ok: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: "Error en servidor" });
  }
});

// ===== Eliminar servicio =====
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM servicios WHERE id=?", [id]);
    res.json({ ok: true, msg: "Servicio eliminado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: "Error en servidor" });
  }
});

export default router;
