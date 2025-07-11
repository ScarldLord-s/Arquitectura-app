import bcrypt from 'bcryptjs'; // Cambiado a 'bcryptjs' que es más común en frontend/Node.js para bcrypt
import RoomModel from '../models/roomModel.js';

class RoomService {
  async getAllRooms() {
    return await RoomModel.getAllRooms();
  }

  async getRoomById(roomId) {
    return await RoomModel.getRoomById(roomId);
  }

  // --- FUNCIÓN createRoom ACTUALIZADA ---
  async createRoom({ name, isPrivate, password, creatorId }) { // <--- ¡Añadido creatorId aquí!
    let hashedPassword = null;
    if (isPrivate && password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }
    // Pasa el creatorId al RoomModel.createRoom
    return await RoomModel.createRoom({ 
      name, 
      isPrivate, 
      password: hashedPassword, // Pasa la contraseña hasheada
      creatorId // <--- ¡Pasa el creatorId al modelo!
    });
  }
  // --- FIN FUNCIÓN createRoom ACTUALIZADA ---

  async checkRoomPassword(roomId, password) {
    const room = await RoomModel.getRoomById(roomId);
    if (!room) {
      return { success: false, message: 'Sala no encontrada' };
    }
    if (!room.is_private) {
      return { success: true, isPrivate: false };
    }
    // La columna de contraseña en tu DB es 'password', no 'password_hash'
    const isMatch = await bcrypt.compare(password, room.password); 
    if (isMatch) {
      return { success: true, isPrivate: true };
    } else {
      return { success: false, message: 'Contraseña incorrecta', isPrivate: true };
    }
  }
}

export default new RoomService();