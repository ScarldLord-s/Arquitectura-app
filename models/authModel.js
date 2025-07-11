import { pool } from '../Config/dataService.js';

const create = async ({ email, password, username }) => {
  const query = {
    text: "INSERT INTO users (email, password, username) VALUES ($1, $2, $3) RETURNING user_id, email, username, created_at",
    values: [email, password, username],
  };
  const { rows } = await pool.query(query);
  return rows[0];
};

const findOneByEmail = async (email) => {
  const query = {
    text: "SELECT user_id, username, email, password, created_at FROM users WHERE email = $1",
    values: [email],
  };
  const { rows } = await pool.query(query);
  return rows[0];
};

const getUserById = async (user_id) => {
  const result = await pool.query(
    "SELECT user_id, username, email, password, created_at FROM users WHERE user_id = $1", 
    [user_id]
  );
  return result.rows[0];
};

const updateLastConnection = async (email) => {
  const query = {
    text: "SELECT user_id, username, email, created_at FROM users WHERE email = $1",
    values: [email],
  };
  const { rows } = await pool.query(query);
  return rows[0];
};

export const UserModel = {
  create,
  findOneByEmail,
  getUserById,
  updateLastConnection, 
};