// middleware/auth.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Middleware para verificar token JWT
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next function
 */
export const authenticateToken = (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Token de acceso requerido',
        message: 'No se proporcionó token de autenticación'
      });
    }

    // Verificar token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.error('Error verificando token:', err);

        if (err.name === 'TokenExpiredError') {
          return res.status(403).json({
            error: 'Token expirado',
            message: 'El token de acceso ha expirado'
          });
        }

        if (err.name === 'JsonWebTokenError') {
          return res.status(403).json({
            error: 'Token inválido',
            message: 'El token proporcionado no es válido'
          });
        }

        return res.status(403).json({
          error: 'Token inválido',
          message: 'Error al verificar el token'
        });
      }

      // Agregar información del usuario al request
      // IMPORTANT: The 'user' object here contains the decoded JWT payload.
      // We assume your JWT payload contains 'id' for the user's ID.
      // Example payload: { id: 123, username: 'testuser', role: 'admin' }
      req.user = user;
      next();
    });

  } catch (error) {
    console.error('Error en authenticateToken:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al procesar la autenticación'
    });
  }
};

/**
 * Middleware opcional - permite requests con y sin token
 * Útil para endpoints que pueden ser públicos o privados
 */
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      // No hay token, continuar sin usuario
      req.user = null;
      return next();
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        // Token inválido, continuar sin usuario
        req.user = null;
      } else {
        // Token válido, agregar usuario
        req.user = user; // 'user' object from decoded JWT
      }
      next();
    });

  } catch (error) {
    console.error('Error en optionalAuth:', error);
    req.user = null;
    next();
  }
};

/**
 * Middleware para verificar roles específicos
 * @param {string|Array} allowedRoles - Rol o array de roles permitidos
 */
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Usuario no autenticado',
        message: 'Se requiere autenticación para acceder a este recurso'
      });
    }

    // Assuming the role is stored under 'role' in the JWT payload
    const userRole = req.user.role; // <--- MODIFIED: Access 'role' directly
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        error: 'Permisos insuficientes',
        message: `Se requiere uno de los siguientes roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Middleware para verificar que el usuario sea propietario del recurso
 * @param {string} paramName - Nombre del parámetro que contiene el userId (e.g., 'userId', 'id')
 */
export const requireOwnership = (paramName = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Usuario no autenticado'
      });
    }

    const resourceUserId = parseInt(req.params[paramName]);
    // MODIFIED: Access user ID from req.user.id (assuming JWT payload uses 'id')
    const currentUserId = req.user.id; // <--- MODIFIED: Using 'req.user.id'

    // Add a log to see values for debugging ownership
    console.log(`Checking ownership: Resource ID param (${paramName}): ${resourceUserId}, Current User ID (from token): ${currentUserId}`);


    if (resourceUserId !== currentUserId) {
      return res.status(403).json({
        error: 'No tienes permisos para acceder a este recurso'
      });
    }

    next();
  };
};