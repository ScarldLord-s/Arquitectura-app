import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  banUserFromRoom,
  unbanUserFromRoom,
  getBannedUsers,
  checkBanStatus
} from '../controllers/roomBanController.js';

const router = express.Router();

router.post('/ban', authenticateToken, banUserFromRoom);
router.post('/unban', authenticateToken, unbanUserFromRoom);
router.get('/banned/:roomId', authenticateToken, getBannedUsers);
router.get('/check-ban/:roomId/:userId', checkBanStatus);

export default router;

