import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { createReport, getAllReports } from '../controllers/reportController.js';

const router = express.Router();

router.post('/', authenticateToken, createReport); // POST /api/reports
router.get('/', authenticateToken, getAllReports); // GET /api/reports

export default router;
