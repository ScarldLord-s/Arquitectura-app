import { pool } from '../Config/dataService.js';

class PollModel {
  async createPoll({ roomId, question, options, createdBy }) {
    const query = `
      INSERT INTO polls (room_id, question, options, created_by)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [roomId, question, options, createdBy];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  async getPollsByRoom(roomId) {
    const query = `SELECT * FROM polls WHERE room_id = $1 ORDER BY created_at DESC;`;
    const { rows } = await pool.query(query, [roomId]);
    return rows;
  }

  async getPollById(pollId) {
    const query = `SELECT * FROM polls WHERE poll_id = $1;`;
    const { rows } = await pool.query(query, [pollId]);
    return rows[0];
  }

  async closePoll(pollId) {
    const query = `UPDATE polls SET is_active = FALSE WHERE poll_id = $1 RETURNING *;`;
    const { rows } = await pool.query(query, [pollId]);
    return rows[0];
  }
}

export default new PollModel();