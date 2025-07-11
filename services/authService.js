// services/authService.js 

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/authModel.js';

const registerUser = async ({ username, email, password }) => {
  try {
    // Verifica si el usuario ya existe
    const existingUser = await UserModel.findOneByEmail(email);
    if (existingUser) {
      return { success: false, message: 'El correo ya está registrado' };
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crea el usuario
    const user = await UserModel.create({ username, email, password: hashedPassword });

    // Crea token JWT
    const token = jwt.sign({ id: user.user_id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    return {
      success: true,
      token,
      user,
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const loginUser = async ({ email, password }) => {
  try {
    const user = await UserModel.findOneByEmail(email);
    if (!user) {
      return { success: false, message: 'Usuario no encontrado' };
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return { success: false, message: 'Contraseña incorrecta' };
    }

    const token = jwt.sign({ id: user.user_id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    return {
      success: true,
      token,
      user: {
        id: user.user_id,
        email: user.email,
        username: user.username,
      },
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const getProfile = async (userId) => {
  try {
    const user = await UserModel.getUserById(userId);
    if (!user) {
      // Si el usuario no se encuentra, puedes devolver null o lanzar un error.
      // Devolver null es más limpio para que el llamador pueda manejarlo.
      return null; // <--- CAMBIO CRÍTICO AQUÍ: Devuelve null si no hay usuario
    }
    return user; // <--- CAMBIO CRÍTICO AQUÍ: Devuelve directamente el objeto user
  } catch (error) {
    console.error("Error en getProfile:", error); // Agregamos un log para errores internos
    return null; // <--- CAMBIO CRÍTICO AQUÍ: Devuelve null en caso de error
  }
};

const verifyToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { success: true, decoded };
  } catch (error) {
    return { success: false, message: 'Token inválido' };
  }
};

const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  }
  return null;
};

export const AuthService = {
  registerUser,
  loginUser,
  getProfile,
  verifyToken,
  extractTokenFromHeader,
};