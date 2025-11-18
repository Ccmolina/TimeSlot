const db = require('../database');

exports.getResumenReservas = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        DATE(fecha_creacion) AS fecha,
        COUNT(*) AS total_reservas
      FROM Reserva
      WHERE estado = 'confirmada'
      GROUP BY DATE(fecha_creacion)
      ORDER BY fecha DESC
      LIMIT 7;
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
