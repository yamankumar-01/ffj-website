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
 * Get Paginated & Filtered Trees (Server-side search & filtering)
 */
export const getTrees = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 12));
    const skip = (page - 1) * limit;

    const { search, category, zone, healthStatus, sort } = req.query;
    const filter = {};

    // Search query matches treeId, commonName, scientificName, localName, or plantedBy
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { treeId: searchRegex },
        { commonName: searchRegex },
        { scientificName: searchRegex },
        { localName: searchRegex },
        { plantedBy: searchRegex },
        { 'location.zone': searchRegex },
      ];
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (zone && zone !== 'All') {
      filter['location.zone'] = zone;
    }

    if (healthStatus && healthStatus !== 'All') {
      filter.healthStatus = healthStatus;
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { plantedDate: 1 };
    } else if (sort === 'newest') {
      sortOption = { plantedDate: -1 };
    } else if (sort === 'treeId_asc') {
      sortOption = { treeId: 1 };
    } else if (sort === 'treeId_desc') {
      sortOption = { treeId: -1 };
    } else if (sort === 'name_asc') {
      sortOption = { commonName: 1 };
    }

    const [trees, total] = await Promise.all([
      Tree.find(filter).sort(sortOption).skip(skip).limit(limit),
      Tree.countDocuments(filter),
    ]);

    res.json({
      success: true,
      trees,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
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
    const [
      totalTrees,
      speciesList,
      categoriesAggregate,
      healthAggregate,
      zonesList,
      recentPlantations,
    ] = await Promise.all([
      Tree.countDocuments(),
      Tree.distinct('scientificName'),
      Tree.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      Tree.aggregate([{ $group: { _id: '$healthStatus', count: { $sum: 1 } } }]),
      Tree.distinct('location.zone'),
      Tree.find().sort({ plantedDate: -1 }).limit(5).select('treeId commonName localName plantedDate photos category'),
    ]);

    const categoryCounts = categoriesAggregate.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    const healthCounts = healthAggregate.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    res.json({
      success: true,
      stats: {
        totalTrees,
        speciesCount: speciesList.length,
        campusZonesCount: zonesList.length,
        categories: categoryCounts,
        health: healthCounts,
        zones: zonesList,
        recentPlantations,
      },
    });
  } catch (error) {
    console.error('Error fetching tree stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats', error: error.message });
  }
};

/**
 * Get Single Tree by treeId (e.g. FFJ-TREE-0001) or MongoDB _id
 */
export const getTreeById = async (req, res) => {
  try {
    const { treeId } = req.params;

    let tree = await Tree.findOne({ treeId: treeId.toUpperCase() });
    if (!tree && treeId.match(/^[0-9a-fA-F]{24}$/)) {
      tree = await Tree.findById(treeId);
    }

    if (!tree) {
      return res.status(404).json({ success: false, message: `Tree not found for ID: ${treeId}` });
    }

    res.json({ success: true, tree });
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
      const existing = await Tree.findOne({ treeId: treeData.treeId });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Tree ID ${treeData.treeId} is already assigned to another tree.`,
        });
      }
    }

    // Format location
    if (typeof treeData.location === 'string') {
      treeData.location = { zone: treeData.location };
    }

    // Build QR Target URL
    const targetUrl = getBaseTreeUrl(treeData.treeId);
    treeData.qrTargetUrl = targetUrl;
    treeData.qrCodeData = await generateQRCodeDataUrl(targetUrl);

    // Ensure photos is an array
    if (typeof treeData.photos === 'string') {
      treeData.photos = treeData.photos.split(',').map((p) => p.trim()).filter(Boolean);
    }

    const tree = new Tree(treeData);
    await tree.save();

    res.status(201).json({
      success: true,
      message: `Tree ${tree.treeId} created successfully`,
      tree,
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
    let tree = await Tree.findOne({ treeId: treeId.toUpperCase() });
    if (!tree && treeId.match(/^[0-9a-fA-F]{24}$/)) {
      tree = await Tree.findById(treeId);
    }

    if (!tree) {
      return res.status(404).json({ success: false, message: 'Tree not found' });
    }

    const updates = { ...req.body };

    // If photos is comma-separated string, convert to array
    if (typeof updates.photos === 'string') {
      updates.photos = updates.photos.split(',').map((p) => p.trim()).filter(Boolean);
    }

    // If location is string, format object
    if (updates.zone) {
      updates.location = {
        ...tree.location.toObject(),
        zone: updates.zone,
        latitude: updates.latitude !== undefined ? Number(updates.latitude) : tree.location.latitude,
        longitude: updates.longitude !== undefined ? Number(updates.longitude) : tree.location.longitude,
      };
    }

    // Check if target URL or treeId changed
    if (updates.treeId && updates.treeId.toUpperCase() !== tree.treeId) {
      updates.treeId = updates.treeId.trim().toUpperCase();
      const targetUrl = getBaseTreeUrl(updates.treeId);
      updates.qrTargetUrl = targetUrl;
      updates.qrCodeData = await generateQRCodeDataUrl(targetUrl);
    }

    Object.assign(tree, updates);
    await tree.save();

    res.json({
      success: true,
      message: `Tree ${tree.treeId} updated successfully`,
      tree,
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
    let tree = await Tree.findOneAndDelete({ treeId: treeId.toUpperCase() });
    if (!tree && treeId.match(/^[0-9a-fA-F]{24}$/)) {
      tree = await Tree.findByIdAndDelete(treeId);
    }

    if (!tree) {
      return res.status(404).json({ success: false, message: 'Tree not found' });
    }

    res.json({
      success: true,
      message: `Tree ${tree.treeId} (${tree.commonName}) deleted successfully`,
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
    const latestTree = await Tree.findOne({ treeId: { $regex: /^FFJ-TREE-\d+$/ } })
      .sort({ treeId: -1 })
      .lean();

    if (latestTree && latestTree.treeId) {
      const m = latestTree.treeId.match(/^FFJ-TREE-(\d+)$/);
      if (m) nextIdNumber = parseInt(m[1], 10) + 1;
    }

    const importedTrees = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        if (!row.commonName || !row.scientificName) {
          errors.push(`Row ${i + 1}: Missing required commonName or scientificName`);
          continue;
        }

        let currentTreeId = row.treeId ? row.treeId.trim().toUpperCase() : null;
        if (!currentTreeId) {
          currentTreeId = `FFJ-TREE-${String(nextIdNumber++).padStart(4, '0')}`;
        }

        // Check uniqueness
        const existing = await Tree.findOne({ treeId: currentTreeId });
        if (existing) {
          errors.push(`Row ${i + 1}: Tree ID ${currentTreeId} already exists in database`);
          continue;
        }

        const targetUrl = getBaseTreeUrl(currentTreeId);
        const qrCodeData = await generateQRCodeDataUrl(targetUrl);

        const photoList = row.photos
          ? row.photos.split('|').map((p) => p.trim()).filter(Boolean)
          : [];

        const newTree = new Tree({
          treeId: currentTreeId,
          commonName: row.commonName.trim(),
          scientificName: row.scientificName.trim(),
          localName: row.localName ? row.localName.trim() : row.commonName.trim(),
          category: ['Fruit', 'Medicinal', 'Ornamental', 'Shade'].includes(row.category)
            ? row.category
            : 'Fruit',
          description: row.description || `${row.commonName} planted on JECRC Campus as part of Fruitfull Jaipur initiative.`,
          healthBenefits: row.healthBenefits || '',
          culturalSignificance: row.culturalSignificance || '',
          plantedDate: row.plantedDate ? new Date(row.plantedDate) : new Date(),
          plantedBy: row.plantedBy || 'Fruitfull Jaipur Initiative',
          location: {
            zone: row.zone || 'JECRC Main Green Belt',
            latitude: row.latitude ? parseFloat(row.latitude) : 26.78198,
            longitude: row.longitude ? parseFloat(row.longitude) : 75.82251,
          },
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

        await newTree.save();
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
    const filter = {};
    if (category && category !== 'All') filter.category = category;
    if (zone && zone !== 'All') filter['location.zone'] = zone;

    const trees = await Tree.find(filter).sort({ treeId: 1 });
    if (!trees || trees.length === 0) {
      return res.status(404).json({ success: false, message: 'No trees found to export' });
    }

    await createTreesQRZip(trees, res);
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
    const filter = {};
    if (category && category !== 'All') filter.category = category;
    if (zone && zone !== 'All') filter['location.zone'] = zone;

    const trees = await Tree.find(filter).sort({ treeId: 1 });
    if (!trees || trees.length === 0) {
      return res.status(404).json({ success: false, message: 'No trees found to export' });
    }

    await createPrintablePlaquesPDF(trees, res);
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
