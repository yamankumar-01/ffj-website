import { Tree } from '../models/Tree.js';
import { Admin } from '../models/Admin.js';
import { initialTrees } from './seedData.js';
import { generateQRCodeDataUrl, getBaseTreeUrl } from '../services/qrService.js';

export const seedDatabase = async () => {
  try {
    const existingCount = await Tree.countDocuments();
    if (existingCount > 0) {
      console.log(`🌿 Database already contains ${existingCount} trees. Skipping auto-seeding.`);
    } else {
      console.log('🌱 Seeding initial 10 botanical trees with dynamic QR codes...');
      
      for (const treeData of initialTrees) {
        const targetUrl = getBaseTreeUrl(treeData.treeId);
        const qrCodeData = await generateQRCodeDataUrl(targetUrl);
        
        await Tree.create({
          ...treeData,
          qrTargetUrl: targetUrl,
          qrCodeData,
        });
      }
      console.log('✅ Successfully seeded 10 botanical tree identities with high-res QRs.');
    }

    // Ensure default admin exists
    const adminUser = process.env.ADMIN_USER || 'admin';
    const adminPass = process.env.ADMIN_PASSWORD || 'ffj@jecrc2025';

    const existingAdmin = await Admin.findOne({ username: adminUser.toLowerCase() });
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
