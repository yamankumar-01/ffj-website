import QRCode from 'qrcode';
import { Tree } from '../models/Tree.js';

export const getBaseTreeUrl = (treeId) => {
  const host = process.env.FRONTEND_URL || 'http://localhost:5173';
  return `${host.replace(/\/$/, '')}/tree/${treeId}`;
};

export const generateQRCodeDataUrl = async (url) => {
  try {
    return await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'H', // High error correction (30% recovery)
      type: 'image/png',
      margin: 2,
      width: 400,
      color: {
        dark: '#1b4332',  // Deep FFJ Forest Green
        light: '#ffffff', // Crisp white background
      },
    });
  } catch (err) {
    console.error('Error generating QR code data URL:', err);
    throw err;
  }
};

export const generateQRCodeBuffer = async (url) => {
  try {
    return await QRCode.toBuffer(url, {
      errorCorrectionLevel: 'H',
      type: 'png',
      margin: 2,
      width: 600,
      color: {
        dark: '#1b4332',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Error generating QR code buffer:', err);
    throw err;
  }
};

export const generateNextTreeId = async () => {
  // Find highest existing treeId starting with FFJ-TREE-
  const latestTree = await Tree.findOne({ treeId: { $regex: /^FFJ-TREE-\d+$/ } })
    .sort({ treeId: -1 })
    .lean();

  if (!latestTree || !latestTree.treeId) {
    return 'FFJ-TREE-0001';
  }

  const match = latestTree.treeId.match(/^FFJ-TREE-(\d+)$/);
  if (!match) {
    return 'FFJ-TREE-0001';
  }

  const nextNumber = parseInt(match[1], 10) + 1;
  return `FFJ-TREE-${String(nextNumber).padStart(4, '0')}`;
};
