import express from 'express';
import { AuthService  } from '../services/authService.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const data = await AuthService.loginUser(req.body);
    res.status(200).json(data);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
});

router.post('/signup', async (req, res) => {
  try {
    const data = await AuthService.registerUser(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
