import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  banUserFromRoom,
  unbanUserFromRoom,
  getBannedUsers
} from '../controllers/roomBanController.js';

const router = express.Router();

router.post('/ban', authenticateToken, banUserFromRoom);
router.post('/unban', authenticateToken, unbanUserFromRoom);
router.get('/banned/:roomId', authenticateToken, getBannedUsers);

export default router;
