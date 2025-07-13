import { pool } from "../Config/dataService.js";

class RoomBanModel {
  async banUser(roomId, userId) {
    const deleteMembership =
      "DELETE FROM room_members WHERE room_id = $1 AND user_id = $2";
    await pool.query(deleteMembership, [roomId, userId]);

    const insertBan = `
INSERT INTO room_bans (room_id, user_id)
VALUES ($1, $2)
ON CONFLICT DO NOTHING
RETURNING *; `;
    const { rows } = await pool.query(insertBan, [roomId, userId]);
    return rows[0];
  } // ESTA ES LA ÚNICA Y CORRECTA DEFINICIÓN DE isUserBanned

  async isUserBanned(roomId, userId) {
    // Agrega un console.log aquí para depurar en el backend
    console.log(
      `[RoomBanModel] Verificando baneo para Room ID: ${roomId}, User ID: ${userId}`
    );
    const query = "SELECT 1 FROM room_bans WHERE room_id = $1 AND user_id = $2";
    try {
      const { rowCount } = await pool.query(query, [roomId, userId]);
      console.log(
        `[RoomBanModel] Resultado de baneo: ${
          rowCount > 0 ? "Baneado" : "No Baneado"
        }`
      );
      return rowCount > 0;
    } catch (error) {
      console.error(
        "[RoomBanModel] Error en isUserBanned al ejecutar query:",
        error
      );
      throw error; // Re-lanza el error para que el controlador lo capture
    }
  }

  async getBannedUsers(roomId) {
    const query = `
SELECT users.user_id, users.username, rb.banned_at
 FROM room_bans rb
JOIN users ON rb.user_id = users.user_id WHERE rb.room_id = $1
 ORDER BY rb.banned_at DESC;
`;
    const { rows } = await pool.query(query, [roomId]);
    return rows;
  }

  async unbanUser(roomId, userId) {
    const query =
      "DELETE FROM room_bans WHERE room_id = $1 AND user_id = $2 RETURNING *";
    const { rows } = await pool.query(query, [roomId, userId]);
    return rows[0];
  }
}

export default new RoomBanModel();
