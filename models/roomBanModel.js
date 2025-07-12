import { pool } from '../Config/dataService.js';

class RoomBanModel {
  async banUser(roomId, userId) {
    const deleteMembership = 'DELETE FROM room_members WHERE room_id = $1 AND user_id = $2';
    await pool.query(deleteMembership, [roomId, userId]);

    const insertBan = `
      INSERT INTO room_bans (room_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      RETURNING *;
    `;
    const { rows } = await pool.query(insertBan, [roomId, userId]);
    return rows[0];
  }

  async isUserBanned(roomId, userId) {
    const query = 'SELECT 1 FROM room_bans WHERE room_id = $1 AND user_id = $2';
    const { rowCount } = await pool.query(query, [roomId, userId]);
    return rowCount > 0;
  }

  async getBannedUsers(roomId) {
    const query = `
      SELECT users.user_id, users.username, rb.banned_at
      FROM room_bans rb
      JOIN users ON rb.user_id = users.user_id
      WHERE rb.room_id = $1
      ORDER BY rb.banned_at DESC;
    `;
    const { rows } = await pool.query(query, [roomId]);
    return rows;
  }

  async unbanUser(roomId, userId) {
    const query = 'DELETE FROM room_bans WHERE room_id = $1 AND user_id = $2 RETURNING *';
    const { rows } = await pool.query(query, [roomId, userId]);
    return rows[0];
  }
}

export default new RoomBanModel();
