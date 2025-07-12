import RoomBanService from '../services/roomBanService.js';

export const banUserFromRoom = async (req, res) => {
  try {
    const { roomId, userId } = req.body;
    const requesterId = req.user.id;
    const requesterRole = req.user.role;

    const result = await RoomBanService.banUser({ roomId, userId, requesterId, requesterRole });
    res.status(200).json({ success: true, message: 'Usuario expulsado de la sala', ban: result });
  } catch (error) {
    res.status(403).json({ success: false, message: error.message });
  }
};

export const unbanUserFromRoom = async (req, res) => {
  try {
    const { roomId, userId } = req.body;
    const requesterId = req.user.id;
    const requesterRole = req.user.role;

    const result = await RoomBanService.unbanUser({ roomId, userId, requesterId, requesterRole });
    res.status(200).json({ success: true, message: 'Usuario desbaneado de la sala', unbanned: result });
  } catch (error) {
    res.status(403).json({ success: false, message: error.message });
  }
};

export const getBannedUsers = async (req, res) => {
  try {
    const { roomId } = req.params;
    const users = await RoomBanService.getBannedUsers(roomId);
    res.status(200).json({ success: true, bannedUsers: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
