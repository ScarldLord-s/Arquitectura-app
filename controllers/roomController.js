import RoomService from '../services/roomService.js';

const getAllRooms = async (req, res) => {
  try {
    const rooms = await RoomService.getAllRooms();
    res.json({ success: true, rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRoomById = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await RoomService.getRoomById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Sala no encontrada' });
    }
    res.json({ success: true, room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createRoom = async (req, res) => {
  try {
    const { name, isPrivate, password } = req.body;
    
    // --- CAMBIO CLAVE AQUÍ: OBTENER EL ID DEL USUARIO DESDE req.user ---
    // El middleware 'authenticateToken' ya ha adjuntado el ID del usuario al objeto 'req'.
    const creatorId = req.user && req.user.id; // Verifica que req.user exista

    // Puedes agregar una validación para asegurarte de que creatorId está presente
    if (!creatorId) {
      return res.status(401).json({ success: false, message: 'No autenticado: ID de usuario no encontrado.' });
    }

    const room = await RoomService.createRoom({ 
      name, 
      isPrivate, 
      password,
      creatorId // <--- PASAR creatorId al RoomService
    });
    res.status(201).json({ success: true, room });
  } catch (error) {
    console.error('Error in RoomController.createRoom:', error); // Log más detallado
    res.status(500).json({ success: false, message: error.message || 'Error interno del servidor.' });
  }
};

const checkRoomPassword = async (req, res) => {
  try {
    const { roomId, password } = req.body;
    const result = await RoomService.checkRoomPassword(roomId, password);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const RoomController = {
  getAllRooms,
  getRoomById,
  createRoom,
  checkRoomPassword,
};