// models/roomModel.js (ENSURE this is your current version)
import { pool } from '../Config/dataService.js';
import bcrypt from 'bcryptjs';

class RoomModel {
  async getAllRooms() {
    const query = `
      SELECT
          r.room_id,
          r.name,
          r.is_private,
          r.password,
          r.created_by,
          r.created_at,
          u.username AS creator_username -- This is what RoomItem needs!
      FROM rooms r
      LEFT JOIN users u ON r.created_by = u.user_id; -- Corrected to u.user_id
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  async getRoomById(roomId) {
    const query = `
      SELECT
          r.room_id,
          r.name,
          r.is_private,
          r.password,
          r.created_by,
          r.created_at,
          u.username AS creator_username
      FROM rooms r
      LEFT JOIN users u ON r.created_by = u.user_id -- Corrected to u.user_id
      WHERE r.room_id = $1;
    `;
    const { rows } = await pool.query(query, [roomId]);
    return rows[0];
  }

  async createRoom({ name, isPrivate, password, creatorId }) {
    const client = await pool.connect();
    try {
      let hashedPassword = null;
      if (isPrivate && password) {
        hashedPassword = await bcrypt.hash(password, 10);
      }

      const query = `
        INSERT INTO rooms (name, is_private, password, created_by)
        VALUES ($1, $2, $3, $4)
        RETURNING room_id, name, is_private, created_by, created_at;
      `;
      const values = [name, isPrivate, hashedPassword, creatorId];

      const { rows } = await client.query(query, values);
      return rows[0];
    } finally {
      client.release();
    }
  }
}

export default new RoomModel();