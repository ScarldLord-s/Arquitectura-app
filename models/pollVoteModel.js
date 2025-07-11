import { pool } from '../Config/dataService.js';

class PollVoteModel {
  async vote({ pollId, userId, optionIndex }) {
    const query = `
      INSERT INTO poll_votes (poll_id, user_id, option_index)
      VALUES ($1, $2, $3)
      ON CONFLICT (poll_id, user_id) DO UPDATE SET option_index = EXCLUDED.option_index
      RETURNING *;
    `;
    const values = [pollId, userId, optionIndex];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  async getVotesByPoll(pollId) {
    const query = `SELECT * FROM poll_votes WHERE poll_id = $1;`;
    const { rows } = await pool.query(query, [pollId]);
    return rows;
  }
}

export default new PollVoteModel();