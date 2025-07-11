// En services/roomMemberService.js
import { pool } from '../Config/dataService.js'; // Asegúrate de que esta ruta a tu pool sea correcta

export const addMemberToRoom = async (roomId, userId) => {
  try {
    // 1. Primero, verifica si el usuario ya es miembro de la sala
    const checkQuery = 'SELECT * FROM room_members WHERE room_id = $1 AND user_id = $2';
    const existingMemberResult = await pool.query(checkQuery, [roomId, userId]);

    if (existingMemberResult.rows.length > 0) {
      // Si ya existe, retorna el miembro existente sin hacer nada más
      return { success: true, message: 'Member already in room', member: existingMemberResult.rows[0] };
    }

    // 2. Si el miembro no existe, procede a insertarlo
    const insertQuery = 'INSERT INTO room_members (room_id, user_id) VALUES ($1, $2) RETURNING *';
    const insertResult = await pool.query(insertQuery, [roomId, userId]);
    return { success: true, message: 'Member added', member: insertResult.rows[0] };

  } catch (error) {
    // Este log de error es crucial para la depuración en producción.
    console.error(`[DB] Error al agregar el miembro ${userId} a la sala ${roomId}:`, error);
    // Relanza el error para que pueda ser capturado y manejado en el código del socket si es necesario.
    throw error;
  }
};

// Función para obtener todos los miembros de una sala (no necesita cambios)
export const getRoomMembers = async (roomId) => {
  const query = 'SELECT * FROM room_members WHERE room_id = $1';
  const { rows } = await pool.query(query, [roomId]);
  return rows;
};