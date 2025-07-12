import { pool } from '../Config/dataService.js';

class ReportModel {
  async createReport({ userId, type, message }) {
    const query = `
      INSERT INTO reports (user_id, type, message)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [userId, type, message];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  async getAllReports() {
    const query = `SELECT * FROM reports ORDER BY created_at DESC;`;
    const { rows } = await pool.query(query);
    return rows;
  }
}

export default new ReportModel();
