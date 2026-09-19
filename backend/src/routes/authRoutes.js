import express from 'express';
import { login, getMe } from '../controllers/authController.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.get('/me', authenticateAdmin, getMe);

// Dedicated route to ensure abhishekmatoria admin credentials are synchronized in database
router.get('/migrate-admin', async (req, res) => {
  try {
    const { Admin } = await import('../models/Admin.js');
    const legacy = await Admin.findOne({ where: { username: 'admin' } });
    if (legacy) {
      legacy.username = 'abhishekmatoria';
      legacy.password = 'fruitfulljaipur';
      legacy.name = 'Abhishek Matoria';
      await legacy.save();
    }
    const target = await Admin.findOne({ where: { username: 'abhishekmatoria' } });
    if (!target) {
      await Admin.create({
        username: 'abhishekmatoria',
        password: 'fruitfulljaipur',
        name: 'Abhishek Matoria',
        role: 'admin',
      });
    } else {
      target.password = 'fruitfulljaipur';
      target.name = 'Abhishek Matoria';
      await target.save();
    }
    res.json({
      success: true,
      message: 'Admin credentials successfully updated to abhishekmatoria',
      admin: { username: 'abhishekmatoria', name: 'Abhishek Matoria' },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
