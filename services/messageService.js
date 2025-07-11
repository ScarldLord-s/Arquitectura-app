import { pool } from '../Config/dataService.js';

// Función para guardar un mensaje en la base de datos
export const saveMessage = async (roomId, userId, content) => {
  const query = 'INSERT INTO messages (room_id, user_id, content) VALUES ($1, $2, $3) RETURNING *';
  const { rows } = await pool.query(query, [roomId, userId, content]);
  return rows[0];
};

// Función para obtener mensajes de una sala
export const getMessagesByRoomId = async (roomId) => {
  const query = 'SELECT * FROM messages WHERE room_id = $1 ORDER BY created_at ASC';
  const { rows } = await pool.query(query, [roomId]);
  return rows;
};
