import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { createPoll, getPollsByRoom, votePoll, getVotesByPoll, closePoll } from '../controllers/pollController.js';

const router = express.Router();

router.post('/create', authenticateToken, createPoll);
router.get('/room/:roomId', authenticateToken, getPollsByRoom);
router.post('/vote', authenticateToken, votePoll);
router.get('/votes/:pollId', authenticateToken, getVotesByPoll);
router.post('/close', authenticateToken, closePoll);

export default router;