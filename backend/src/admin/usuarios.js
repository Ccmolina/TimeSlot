const db = require('../database'); 
const bcrypt = require('bcryptjs');


exports.getUsuarios = async (req, res) => {
  const rol = req.query.rol;
  try {
    let query = 'SELECT usuario_id, nombre_usuario, apellido, telefono, correo, rol FROM Usuario';
    let params = [];
    if (rol) {
      query += ' WHERE rol = ?';
      params.push(rol);
    }
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

exports.crearUsuario = async (req, res) => {
  const { nombre_usuario, apellido, correo, contra, telefono, rol } = req.body;

  if (!nombre_usuario || !correo || !contra || !rol) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const [existe] = await db.query('SELECT usuario_id FROM Usuario WHERE correo = ?', [correo]);
    if (existe.length > 0) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(contra, 10);

    const [result] = await db.query(
      'INSERT INTO Usuario (nombre_usuario, apellido, correo, contra, telefono, rol) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre_usuario, apellido, correo, hashedPassword, telefono, rol]
    );

    res.status(201).json({
      message: 'Usuario creado correctamente',
      usuarioId: result.insertId,
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


exports.actualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre_usuario, apellido, correo, telefono } = req.body;

  if (!nombre_usuario || !correo ) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

    try {
    const [result] = await db.query(
      'UPDATE Usuario SET nombre_usuario=?, apellido=?, correo=?, telefono=? WHERE usuario_id=?',
      [nombre_usuario, apellido, correo, telefono, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


exports.eliminarUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM Usuario WHERE usuario_id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};