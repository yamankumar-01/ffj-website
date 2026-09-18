import express from 'express';
import multer from 'multer';
import {
  getTrees,
  getStats,
  getTreeById,
  createTree,
  updateTree,
  deleteTree,
  bulkImportCSV,
  exportQRZip,
  exportPlaquesPDF,
  getCSVTemplate,
} from '../controllers/treeController.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Public read endpoints
router.get('/', getTrees);
router.get('/stats', getStats);
router.get('/template/csv', getCSVTemplate);
router.get('/export/zip', exportQRZip);
router.get('/export/pdf', exportPlaquesPDF);
router.get('/:treeId', getTreeById);

// Admin-protected write endpoints
router.post('/', authenticateAdmin, createTree);
router.put('/:treeId', authenticateAdmin, updateTree);
router.delete('/:treeId', authenticateAdmin, deleteTree);
router.post('/bulk-import', authenticateAdmin, upload.single('csvFile'), bulkImportCSV);

export default router;
