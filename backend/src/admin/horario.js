const db = require('../database');

exports.getHorarios = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Horario ORDER BY horario_id ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.guardarHorario = async (req, res) => {
  const horarios = req.body;

  if (!Array.isArray(horarios) || horarios.length === 0) {
    return res.status(400).json({ error: 'Debe enviar una lista de horarios' });
  }

  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    for (const h of horarios) {
      await conn.query(
        `UPDATE Horario 
         SET hora_inicio = ?, hora_fin = ?, abierto = ? 
         WHERE horario_id = ?`,
        [h.hora_inicio, h.hora_fin, h.abierto, h.horario_id]
      );
    }

    await conn.commit();
    conn.release();
    res.json({ message: 'Todos los horarios actualizados correctamente' });
  } catch (error) {
    await conn.rollback();
    conn.release();
    res.status(500).json({ error: error.message });
  }
};
