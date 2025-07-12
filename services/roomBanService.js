import RoomBanModel from '../models/roomBanModel.js';
import RoomModel from '../models/roomModel.js';

class RoomBanService {
  async banUser({ roomId, userId, requesterId, requesterRole }) {
    const room = await RoomModel.getRoomById(roomId);
    if (!room) throw new Error('Sala no encontrada');

    if (room.created_by !== requesterId && requesterRole !== 'admin') {
      throw new Error('No tienes permiso para expulsar usuarios de esta sala');
    }

    return await RoomBanModel.banUser(roomId, userId);
  }

  async unbanUser({ roomId, userId, requesterId, requesterRole }) {
    const room = await RoomModel.getRoomById(roomId);
    if (!room) throw new Error('Sala no encontrada');

    if (room.created_by !== requesterId && requesterRole !== 'admin') {
      throw new Error('No tienes permiso para remover el baneo');
    }

    return await RoomBanModel.unbanUser(roomId, userId);
  }

  async getBannedUsers(roomId) {
    return await RoomBanModel.getBannedUsers(roomId);
  }

  async isUserBanned(roomId, userId) {
    return await RoomBanModel.isUserBanned(roomId, userId);
  }
}

export default new RoomBanService();
