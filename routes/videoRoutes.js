import express from 'express';
import { startCall, endCall, getCallStatus } from '../controllers/videoCallController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/start', authenticateToken, startCall); // body: { roomId }
router.post('/end', authenticateToken, endCall);     // body: { callId }
router.get('/status/:roomId', authenticateToken, getCallStatus);

export default router;