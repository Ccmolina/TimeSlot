const db = require('../db');

exports.getServicios = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.servicio_id, s.nombre_servicio, s.descripcion, s.duracion_min,
             u.usuario_id, u.nombre_usuario, u.apellido
      FROM Servicio s
      LEFT JOIN Usuario u ON s.usuario_id = u.usuario_id
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.asignarMedico = async (req, res) => {
  const { servicio_id, usuario_id } = req.body;
  if (!servicio_id || !usuario_id) {
    return res.status(400).json({ error: 'Servicio y usuario son requeridos' });
  }

  try {
    const [result] = await db.query(
      `UPDATE Servicio SET usuario_id = ? WHERE servicio_id = ?`,
      [usuario_id, servicio_id]
    );
    res.json({ message: 'Médico asignado correctamente', affectedRows: result.affectedRows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMedicos = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT usuario_id, nombre_usuario, apellido FROM Usuario WHERE rol = 'medico'`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.crearServicio = async (req, res) => {
  const { negocio_id, nombre_servicio, descripcion, duracion_min } = req.body;
  if (!negocio_id || !nombre_servicio || !descripcion || !duracion_min) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO Servicio (negocio_id, nombre_servicio, descripcion, duracion_min) VALUES (?, ?, ?, ?)`,
      [negocio_id, nombre_servicio, descripcion, duracion_min]
    );
    res.json({ message: 'Servicio creado', servicio_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.editarServicio = async (req, res) => {
  const { servicio_id, nombre_servicio, descripcion, duracion_min } = req.body;
  if (!servicio_id || !nombre_servicio || !descripcion || !duracion_min) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  try {
    const [result] = await db.query(
      `UPDATE Servicio SET nombre_servicio = ?, descripcion = ?, duracion_min = ? WHERE servicio_id = ?`,
      [nombre_servicio, descripcion, duracion_min, servicio_id]
    );
    res.json({ message: 'Servicio actualizado', affectedRows: result.affectedRows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.eliminarServicio = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query(
      `DELETE FROM Servicio WHERE servicio_id = ?`,
      [id]
    );
    res.json({ message: 'Servicio eliminado', affectedRows: result.affectedRows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
