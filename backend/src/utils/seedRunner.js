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

    const existingCount = await Tree.count();
    if (existingCount > 0) {
      console.log(`🌿 Database already contains ${existingCount} trees.`);
    } else {
      console.log('🌱 Seeding initial 10 botanical trees with dynamic QR codes...');
      
      for (const rawTree of initialTrees) {
        const targetUrl = getBaseTreeUrl(rawTree.treeId);
        const qrCodeData = await generateQRCodeDataUrl(targetUrl);

        await Tree.create({
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
        });
      }
      console.log('✅ Successfully seeded 10 botanical tree identities with high-res QRs into database.');
    }

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
