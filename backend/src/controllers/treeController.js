import { Op, fn, col } from 'sequelize';
import { Tree } from '../models/Tree.js';
import {
  generateQRCodeDataUrl,
  generateNextTreeId,
  getBaseTreeUrl,
} from '../services/qrService.js';
import { createTreesQRZip, createPrintablePlaquesPDF } from '../services/exportService.js';
import csvParser from 'csv-parser';
import { Readable } from 'stream';

/**
 * Get Paginated & Filtered Trees (Server-side search & filtering with Sequelize)
 */
export const getTrees = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 12));
    const offset = (page - 1) * limit;

    const { search, category, zone, healthStatus, sort } = req.query;
    const whereConditions = [];

    // Multi-field search
    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      whereConditions.push({
        [Op.or]: [
          { treeId: { [Op.like]: term } },
          { commonName: { [Op.like]: term } },
          { scientificName: { [Op.like]: term } },
          { localName: { [Op.like]: term } },
          { plantedBy: { [Op.like]: term } },
          { zone: { [Op.like]: term } },
        ],
      });
    }

    if (category && category !== 'All') {
      whereConditions.push({ category });
    }

    if (zone && zone !== 'All') {
      whereConditions.push({ zone });
    }

    if (healthStatus && healthStatus !== 'All') {
      whereConditions.push({ healthStatus });
    }

    const where = whereConditions.length > 0 ? { [Op.and]: whereConditions } : {};

    // Sorting
    let order = [['createdAt', 'DESC']];
    if (sort === 'oldest') {
      order = [['plantedDate', 'ASC']];
    } else if (sort === 'newest') {
      order = [['plantedDate', 'DESC']];
    } else if (sort === 'treeId_asc') {
      order = [['treeId', 'ASC']];
    } else if (sort === 'treeId_desc') {
      order = [['treeId', 'DESC']];
    } else if (sort === 'name_asc') {
      order = [['commonName', 'ASC']];
    }

    const { rows, count } = await Tree.findAndCountAll({
      where,
      limit,
      offset,
      order,
    });

    const prodHost = process.env.FRONTEND_URL || 'https://fruitfull-jaipur.vercel.app';
    const formattedTrees = await Promise.all(
      rows.map(async (tree) => {
        if (!tree.qrTargetUrl || tree.qrTargetUrl.includes('localhost') || !tree.qrCodeData) {
          const cleanUrl = `${prodHost.replace(/\/$/, '')}/tree/${tree.treeId}`;
          tree.qrTargetUrl = cleanUrl;
          try {
            tree.qrCodeData = await generateQRCodeDataUrl(cleanUrl);
            await tree.save();
          } catch (e) {
            console.error('Error auto-repairing tree QR:', e);
          }
        }
        return tree.toFormattedJSON();
      })
    );

    res.json({
      success: true,
      trees: formattedTrees,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit) || 1,
    });
  } catch (error) {
    console.error('Error fetching trees:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch trees', error: error.message });
  }
};

/**
 * Get Comprehensive Campus & Tree Statistics
 */
export const getStats = async (req, res) => {
  try {
    const totalTrees = await Tree.count();

    // Distinct species count
    const speciesRows = await Tree.findAll({
      attributes: [[fn('DISTINCT', col('scientificName')), 'scientificName']],
      raw: true,
    });
    const speciesCount = speciesRows.filter((r) => r.scientificName).length;

    // Category aggregation
    const categoryRows = await Tree.findAll({
      attributes: ['category', [fn('COUNT', col('id')), 'count']],
      group: ['category'],
      raw: true,
    });
    const categories = categoryRows.reduce((acc, curr) => {
      acc[curr.category] = parseInt(curr.count, 10);
      return acc;
    }, {});

    // Health status aggregation
    const healthRows = await Tree.findAll({
      attributes: ['healthStatus', [fn('COUNT', col('id')), 'count']],
      group: ['healthStatus'],
      raw: true,
    });
    const health = healthRows.reduce((acc, curr) => {
      acc[curr.healthStatus] = parseInt(curr.count, 10);
      return acc;
    }, {});

    // Distinct campus zones
    const zoneRows = await Tree.findAll({
      attributes: [[fn('DISTINCT', col('zone')), 'zone']],
      raw: true,
    });
    const zones = zoneRows.map((r) => r.zone).filter(Boolean);

    // Recent plantations
    const recentTrees = await Tree.findAll({
      order: [['plantedDate', 'DESC']],
      limit: 5,
    });
    const recentPlantations = recentTrees.map((t) => t.toFormattedJSON());

    res.json({
      success: true,
      stats: {
        totalTrees,
        speciesCount,
        campusZonesCount: zones.length,
        categories,
        health,
        zones,
        recentPlantations,
      },
    });
  } catch (error) {
    console.error('Error fetching tree stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats', error: error.message });
  }
};

/**
 * Get Single Tree by treeId (e.g. FFJ-TREE-0001) or primary key
 */
export const getTreeById = async (req, res) => {
  try {
    const { treeId } = req.params;
    const isNumeric = /^\d+$/.test(treeId);

    const tree = await Tree.findOne({
      where: isNumeric
        ? {
            [Op.or]: [{ treeId: treeId.toUpperCase() }, { id: parseInt(treeId, 10) }],
          }
        : {
            treeId: treeId.toUpperCase(),
          },
    });

    if (!tree) {
      return res.status(404).json({ success: false, message: `Tree not found for ID: ${treeId}` });
    }

    const prodHost = process.env.FRONTEND_URL || 'https://fruitfull-jaipur.vercel.app';
    if (!tree.qrTargetUrl || tree.qrTargetUrl.includes('localhost') || !tree.qrCodeData) {
      const cleanUrl = `${prodHost.replace(/\/$/, '')}/tree/${tree.treeId}`;
      tree.qrTargetUrl = cleanUrl;
      try {
        tree.qrCodeData = await generateQRCodeDataUrl(cleanUrl);
        await tree.save();
      } catch (e) {
        console.error('Error auto-repairing tree QR:', e);
      }
    }

    res.json({ success: true, tree: tree.toFormattedJSON() });
  } catch (error) {
    console.error('Error fetching tree:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tree', error: error.message });
  }
};

/**
 * Create a new Tree (Admin only)
 */
export const createTree = async (req, res) => {
  try {
    const treeData = { ...req.body };

    // Auto-generate treeId if not provided
    if (!treeData.treeId || !treeData.treeId.trim()) {
      treeData.treeId = await generateNextTreeId();
    } else {
      treeData.treeId = treeData.treeId.trim().toUpperCase();
      const existing = await Tree.findOne({ where: { treeId: treeData.treeId } });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Tree ID ${treeData.treeId} is already assigned to another tree.`,
        });
      }
    }

    // Unpack location if object
    if (treeData.location) {
      if (typeof treeData.location === 'string') {
        treeData.zone = treeData.location;
      } else {
        if (treeData.location.zone) treeData.zone = treeData.location.zone;
        if (treeData.location.latitude) treeData.latitude = parseFloat(treeData.location.latitude);
        if (treeData.location.longitude) treeData.longitude = parseFloat(treeData.location.longitude);
      }
    }

    // Build QR Target URL
    const targetUrl = getBaseTreeUrl(treeData.treeId);
    treeData.qrTargetUrl = targetUrl;
    treeData.qrCodeData = await generateQRCodeDataUrl(targetUrl);

    // Photos array
    if (typeof treeData.photos === 'string') {
      treeData.photos = treeData.photos.split(',').map((p) => p.trim()).filter(Boolean);
    }

    const tree = await Tree.create(treeData);

    res.status(201).json({
      success: true,
      message: `Tree ${tree.treeId} created successfully`,
      tree: tree.toFormattedJSON(),
    });
  } catch (error) {
    console.error('Error creating tree:', error);
    res.status(400).json({ success: false, message: 'Failed to create tree', error: error.message });
  }
};

/**
 * Update an existing Tree (Admin only)
 */
export const updateTree = async (req, res) => {
  try {
    const { treeId } = req.params;
    const isNumeric = /^\d+$/.test(treeId);

    const tree = await Tree.findOne({
      where: isNumeric
        ? { [Op.or]: [{ treeId: treeId.toUpperCase() }, { id: parseInt(treeId, 10) }] }
        : { treeId: treeId.toUpperCase() },
    });

    if (!tree) {
      return res.status(404).json({ success: false, message: 'Tree not found' });
    }

    const updates = { ...req.body };

    // Photos
    if (typeof updates.photos === 'string') {
      updates.photos = updates.photos.split(',').map((p) => p.trim()).filter(Boolean);
    }

    // Location
    if (updates.zone) tree.zone = updates.zone;
    if (updates.latitude !== undefined) tree.latitude = parseFloat(updates.latitude);
    if (updates.longitude !== undefined) tree.longitude = parseFloat(updates.longitude);

    // Check if treeId changed
    if (updates.treeId && updates.treeId.toUpperCase() !== tree.treeId) {
      updates.treeId = updates.treeId.trim().toUpperCase();
      const targetUrl = getBaseTreeUrl(updates.treeId);
      updates.qrTargetUrl = targetUrl;
      updates.qrCodeData = await generateQRCodeDataUrl(targetUrl);
    }

    await tree.update(updates);

    res.json({
      success: true,
      message: `Tree ${tree.treeId} updated successfully`,
      tree: tree.toFormattedJSON(),
    });
  } catch (error) {
    console.error('Error updating tree:', error);
    res.status(400).json({ success: false, message: 'Failed to update tree', error: error.message });
  }
};

/**
 * Delete a Tree (Admin only)
 */
export const deleteTree = async (req, res) => {
  try {
    const { treeId } = req.params;
    const isNumeric = /^\d+$/.test(treeId);

    const tree = await Tree.findOne({
      where: isNumeric
        ? { [Op.or]: [{ treeId: treeId.toUpperCase() }, { id: parseInt(treeId, 10) }] }
        : { treeId: treeId.toUpperCase() },
    });

    if (!tree) {
      return res.status(404).json({ success: false, message: 'Tree not found' });
    }

    const deletedTreeId = tree.treeId;
    const deletedName = tree.commonName;

    await tree.destroy();

    res.json({
      success: true,
      message: `Tree ${deletedTreeId} (${deletedName}) deleted successfully`,
    });
  } catch (error) {
    console.error('Error deleting tree:', error);
    res.status(500).json({ success: false, message: 'Failed to delete tree', error: error.message });
  }
};

/**
 * CSV Bulk Import for onboarding 250+ trees at once
 */
export const bulkImportCSV = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ success: false, message: 'Please upload a valid CSV file' });
    }

    const rows = [];
    const stream = Readable.from(req.file.buffer);

    await new Promise((resolve, reject) => {
      stream
        .pipe(csvParser({ mapHeaders: ({ header }) => header.trim() }))
        .on('data', (data) => rows.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'The uploaded CSV file is empty' });
    }

    let nextIdNumber = 1;
    const latestTree = await Tree.findOne({
      where: { treeId: { [Op.like]: 'FFJ-TREE-%' } },
      order: [['treeId', 'DESC']],
    });

    if (latestTree && latestTree.treeId) {
      const m = latestTree.treeId.match(/^FFJ-TREE-(\d+)$/);
      if (m) nextIdNumber = parseInt(m[1], 10) + 1;
    }

    const importedTrees = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        // Skip completely empty rows
        if ((!row.commonName || !row.commonName.trim()) && (!row.scientificName || !row.scientificName.trim())) {
          continue;
        }

        if (!row.commonName || !row.scientificName) {
          errors.push(`Row ${i + 1}: Missing required commonName or scientificName`);
          continue;
        }

        let currentTreeId = row.treeId ? row.treeId.trim().toUpperCase() : null;
        if (!currentTreeId) {
          currentTreeId = `FFJ-TREE-${String(nextIdNumber++).padStart(4, '0')}`;
        }

        const existing = await Tree.findOne({ where: { treeId: currentTreeId } });
        if (existing) {
          errors.push(`Row ${i + 1}: Tree ID ${currentTreeId} already exists in database`);
          continue;
        }

        const targetUrl = getBaseTreeUrl(currentTreeId);
        const qrCodeData = await generateQRCodeDataUrl(targetUrl);

        const photoList = row.photos
          ? row.photos.split('|').map((p) => p.trim()).filter(Boolean)
          : [];

        const newTree = await Tree.create({
          treeId: currentTreeId,
          commonName: row.commonName.trim(),
          scientificName: row.scientificName.trim(),
          localName: row.localName ? row.localName.trim() : row.commonName.trim(),
          category: ['Fruit', 'Medicinal', 'Ornamental', 'Shade'].includes(row.category)
            ? row.category
            : 'Fruit',
          description: row.description || `${row.commonName} planted on JECRC Campus.`,
          healthBenefits: row.healthBenefits || '',
          culturalSignificance: row.culturalSignificance || '',
          plantedDate: row.plantedDate ? new Date(row.plantedDate) : new Date(),
          plantedBy: row.plantedBy || 'Fruitfull Jaipur Initiative',
          zone: row.zone || 'JECRC Main Green Belt',
          latitude: row.latitude ? parseFloat(row.latitude) : 26.78198,
          longitude: row.longitude ? parseFloat(row.longitude) : 75.82251,
          healthStatus: ['Healthy', 'Needs Attention', 'Under Treatment'].includes(row.healthStatus)
            ? row.healthStatus
            : 'Healthy',
          lastCheckupDate: row.lastCheckupDate ? new Date(row.lastCheckupDate) : new Date(),
          height: row.height ? parseFloat(row.height) : null,
          girth: row.girth ? parseFloat(row.girth) : null,
          caretakerName: row.caretakerName || 'Green Campus Club',
          photos: photoList,
          qrCodeData,
          qrTargetUrl: targetUrl,
        });

        importedTrees.push({ treeId: newTree.treeId, commonName: newTree.commonName });
      } catch (rowErr) {
        errors.push(`Row ${i + 1}: ${rowErr.message}`);
      }
    }

    res.json({
      success: true,
      message: `Successfully imported ${importedTrees.length} trees`,
      importedCount: importedTrees.length,
      errorsCount: errors.length,
      errors,
      sampleImported: importedTrees.slice(0, 10),
    });
  } catch (error) {
    console.error('Error during bulk CSV import:', error);
    res.status(500).json({ success: false, message: 'CSV import failed', error: error.message });
  }
};

/**
 * Bulk ZIP Download of QR Codes
 */
export const exportQRZip = async (req, res) => {
  try {
    const { category, zone } = req.query;
    const where = {};
    if (category && category !== 'All') where.category = category;
    if (zone && zone !== 'All') where.zone = zone;

    const trees = await Tree.findAll({ where, order: [['treeId', 'ASC']] });
    if (!trees || trees.length === 0) {
      return res.status(404).json({ success: false, message: 'No trees found to export' });
    }

    await createTreesQRZip(trees.map((t) => t.toFormattedJSON()), res);
  } catch (error) {
    console.error('Error exporting QR zip:', error);
    res.status(500).json({ success: false, message: 'Failed to generate QR zip', error: error.message });
  }
};

/**
 * Bulk Printable PDF Plaques Sheet Download
 */
export const exportPlaquesPDF = async (req, res) => {
  try {
    const { category, zone } = req.query;
    const where = {};
    if (category && category !== 'All') where.category = category;
    if (zone && zone !== 'All') where.zone = zone;

    const trees = await Tree.findAll({ where, order: [['treeId', 'ASC']] });
    if (!trees || trees.length === 0) {
      return res.status(404).json({ success: false, message: 'No trees found to export' });
    }

    await createPrintablePlaquesPDF(trees.map((t) => t.toFormattedJSON()), res);
  } catch (error) {
    console.error('Error generating PDF plaques:', error);
    res.status(500).json({ success: false, message: 'Failed to generate PDF plaques', error: error.message });
  }
};

/**
 * Download CSV Template
 */
export const getCSVTemplate = (req, res) => {
  const headers = [
    'treeId',
    'commonName',
    'scientificName',
    'localName',
    'category',
    'zone',
    'latitude',
    'longitude',
    'plantedDate',
    'plantedBy',
    'healthStatus',
    'height',
    'girth',
    'caretakerName',
    'description',
    'healthBenefits',
    'culturalSignificance',
    'photos',
  ];

  const sampleRows = [
    [
      '',
      'Mango',
      'Mangifera indica',
      'आम (Aam)',
      'Fruit',
      'Block A - Central Lawn',
      '26.78198',
      '75.82251',
      '2023-07-15',
      'Batch of 2023 - Environment Club',
      'Healthy',
      '3.5',
      '42',
      'Ramesh Ji',
      'The King of Fruits, planted during Van Mahotsav.',
      'High in Vitamin A and C, aids digestion and skin health.',
      'Sacred leaves used in traditional Indian toran and festive rituals.',
      'https://res.cloudinary.com/dcn93ic66/image/upload/v1782473998/FFJ_dev/dqmtfhbt6sng7dnmsisv.jpg',
    ],
    [
      '',
      'Neem',
      'Azadirachta indica',
      'नीम (Neem)',
      'Medicinal',
      'Ayurvedic Garden',
      '26.78245',
      '75.82210',
      '2022-08-10',
      'JECRC Foundation Alumni',
      'Healthy',
      '5.2',
      '68',
      'Green Team',
      'A revered medicinal tree renowned for air purification and natural antiseptic qualities.',
      'Potent antimicrobial, supports blood purification and dental care.',
      'Considered sacred and a village dispensary in Indian tradition.',
      'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800',
    ],
  ];

  const csvString = [
    headers.join(','),
    ...sampleRows.map((r) => r.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="Tree_Aadhar_Import_Template.csv"');
  res.send(csvString);
};
