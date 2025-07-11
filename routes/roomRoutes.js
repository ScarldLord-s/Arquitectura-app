import express from 'express';
import { RoomController } from '../controllers/roomController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Obtener todas las salas
router.get('/', authenticateToken, RoomController.getAllRooms);

// Obtener una sala por ID
router.get('/:roomId', authenticateToken, RoomController.getRoomById);

// Crear una nueva sala
router.post('/', authenticateToken, RoomController.createRoom);

// Verificar contraseña de una sala privada
router.post('/check-password', authenticateToken, RoomController.checkRoomPassword);

export default router;