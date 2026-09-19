import { Op } from 'sequelize';
import { Tree } from '../models/Tree.js';
import { Admin } from '../models/Admin.js';
import { initialTrees } from './seedData.js';
import { generateQRCodeDataUrl, getBaseTreeUrl } from '../services/qrService.js';

export const seedDatabase = async () => {
  try {
    // Auto-migrate any existing records that contain 'localhost' to canonical production URL
    const prodHost = process.env.FRONTEND_URL || 'https://fruitfull-jaipur.vercel.app';
    const localhostTrees = await Tree.findAll({
      where: {
        [Op.or]: [
          { qrTargetUrl: { [Op.like]: '%localhost%' } },
          { qrTargetUrl: null },
        ],
      },
    });

    if (localhostTrees && localhostTrees.length > 0) {
      console.log(`🔄 Upgrading ${localhostTrees.length} trees from localhost to ${prodHost}...`);
      for (const t of localhostTrees) {
        const cleanUrl = `${prodHost.replace(/\/$/, '')}/tree/${t.treeId}`;
        const newQr = await generateQRCodeDataUrl(cleanUrl);
        await t.update({ qrTargetUrl: cleanUrl, qrCodeData: newQr });
      }
      console.log('✅ All tree QR codes and target URLs upgraded to production URL successfully.');
    }

    console.log(`🌱 Verifying botanical trees (${initialTrees.length} trees) with production dynamic QR codes...`);
    const validTreeIds = initialTrees.map((t) => t.treeId);

    // Remove any obsolete or dummy trees that do not belong to the verified dataset
    const obsoleteCount = await Tree.destroy({
      where: {
        treeId: { [Op.notIn]: validTreeIds },
      },
    });
    if (obsoleteCount > 0) {
      console.log(`🧹 Removed ${obsoleteCount} obsolete dummy trees from database.`);
    }

    for (const rawTree of initialTrees) {
      const existing = await Tree.findOne({ where: { treeId: rawTree.treeId } });
      const targetUrl = getBaseTreeUrl(rawTree.treeId);
      const qrCodeData = await generateQRCodeDataUrl(targetUrl);

      const treeData = {
        treeId: rawTree.treeId,
        commonName: rawTree.commonName,
        scientificName: rawTree.scientificName,
        localName: rawTree.localName,
        category: rawTree.category,
        photos: rawTree.photos,
        description: rawTree.description,
        healthBenefits: rawTree.healthBenefits,
        culturalSignificance: rawTree.culturalSignificance,
        plantedDate: rawTree.plantedDate,
        plantedBy: rawTree.plantedBy,
        zone: rawTree.location?.zone || 'Block A - Central Lawn',
        latitude: rawTree.location?.latitude || 26.78198,
        longitude: rawTree.location?.longitude || 75.82251,
        healthStatus: rawTree.healthStatus || 'Healthy',
        lastCheckupDate: rawTree.lastCheckupDate || new Date(),
        height: rawTree.height,
        girth: rawTree.girth,
        caretakerName: rawTree.caretakerName,
        qrTargetUrl: targetUrl,
        qrCodeData,
      };

      if (!existing) {
        await Tree.create(treeData);
      } else {
        // Always ensure existing tree records match the verified dataset and canonical QR codes
        await existing.update(treeData);
      }
    }
    console.log(`✅ All ${initialTrees.length} botanical trees verified and synchronized in database.`);

    // Ensure default admin exists
    const adminUser = process.env.ADMIN_USER || 'admin';
    const adminPass = process.env.ADMIN_PASSWORD || 'ffj@jecrc2025';

    const existingAdmin = await Admin.findOne({
      where: { username: adminUser.toLowerCase() },
    });

    if (!existingAdmin) {
      await Admin.create({
        username: adminUser.toLowerCase(),
        password: adminPass,
        name: 'Fruitfull Jaipur Administrator',
        role: 'admin',
      });
      console.log(`🛡️ Default admin account created: [User: ${adminUser} | Pass: ${adminPass}]`);
    } else {
      console.log(`🛡️ Admin user '${adminUser}' already configured.`);
    }
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
  }
};
