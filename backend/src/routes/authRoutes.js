import express from 'express';
import { login, getMe } from '../controllers/authController.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.get('/me', authenticateAdmin, getMe);

export default router;
