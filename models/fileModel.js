import { pool } from '../Config/dataService.js';

class FileModel {
  async createFile({ roomId, userId, fileName, filePath, publicUrl, fileSize, mimeType }) {
    const client = await pool.connect();
    try {
      const query = `
        INSERT INTO files (room_id, user_id, file_name, file_path, public_url, file_size, mime_type, uploaded_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING *
      `;
      const values = [roomId, userId, fileName, filePath, publicUrl, fileSize, mimeType];
      const result = await client.query(query, values);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async getFilesByRoom(roomId) {
    const client = await pool.connect();
    try {
      const query = `
        SELECT f.*, u.username 
        FROM files f
        LEFT JOIN users u ON f.user_id = u.user_id
        WHERE f.room_id = $1
        ORDER BY f.uploaded_at DESC
      `;
      const result = await client.query(query, [roomId]);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async getFileById(fileId) {
    const client = await pool.connect();
    try {
      const query = 'SELECT * FROM files WHERE file_id = $1';
      const result = await client.query(query, [fileId]);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async getFilesByUser(userId) {
    const client = await pool.connect();
    try {
      const query = `
        SELECT f.*, r.room_name 
        FROM files f
        LEFT JOIN rooms r ON f.room_id = r.room_id
        WHERE f.user_id = $1
        ORDER BY f.uploaded_at DESC
      `;
      const result = await client.query(query, [userId]);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async deleteFile(fileId) {
    const client = await pool.connect();
    try {
      const query = 'DELETE FROM files WHERE file_id = $1 RETURNING *';
      const result = await client.query(query, [fileId]);
      return result.rows[0];
    } finally {
      client.release();
    }
  }
}

export default new FileModel();