import { AuthService } from '../services/authService.js';

const registerController = async (req, res) => {
  try {
    const { email, password, username } = req.body;
    const result = await AuthService.register({ email, password, username });
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login({ email, password });
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

const getProfileController = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const result = await AuthService.getProfile(userId);
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

const verifyTokenController = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = AuthService.extractTokenFromHeader(authHeader);
    const result = await AuthService.verifyToken(token);
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const AuthController = {
  registerController,
  loginController,
  getProfileController,
  verifyTokenController
};
