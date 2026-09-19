import archiver from 'archiver';
import PDFDocument from 'pdfkit';
import { generateQRCodeBuffer } from './qrService.js';

/**
 * Creates a ZIP archive containing high-resolution printable QR code PNG images
 * for all provided trees, formatted for signage makers.
 */
export const createTreesQRZip = async (trees, res) => {
  const archive = archiver('zip', {
    zlib: { level: 9 }, // Maximum compression
  });

  res.attachment('FFJ_Tree_Aadhar_QRCodes.zip');
  archive.pipe(res);

  for (const tree of trees) {
    try {
      const defaultHost = process.env.FRONTEND_URL || 'https://fruitfull-jaipur.vercel.app';
      const targetUrl = (tree.qrTargetUrl && !tree.qrTargetUrl.includes('localhost'))
        ? tree.qrTargetUrl
        : `${defaultHost.replace(/\/$/, '')}/tree/${tree.treeId}`;
      const qrBuffer = await generateQRCodeBuffer(targetUrl);
      const cleanName = (tree.commonName || 'Tree').replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `${tree.treeId}_${cleanName}_QR.png`;
      archive.append(qrBuffer, { name: filename });
    } catch (err) {
      console.error(`Error adding QR for tree ${tree.treeId} to zip:`, err);
    }
  }

  // Also include a README index in the ZIP
  const indexContent = [
    '====================================================',
    'FRUITFULL JAIPUR (FFJ) - JECRC FOUNDATION',
    'TREE AADHAR DIGITAL IDENTITY QR ARCHIVE',
    '====================================================',
    `Generated at: ${new Date().toISOString()}`,
    `Total Trees: ${trees.length}`,
    '',
    'Tree Inventory Index:',
    ...trees.map(
      (t) => `- ${t.treeId} | ${t.commonName} (${t.scientificName}) | Zone: ${t.location?.zone || 'Campus'} | Status: ${t.healthStatus}`
    ),
    '',
    'Instructions:',
    'These high-resolution PNGs can be sent directly to laser engraving or metal/acrylic plaque printing.',
    '====================================================',
  ].join('\n');

  archive.append(indexContent, { name: 'TREE_AADHAR_INDEX.txt' });

  await archive.finalize();
};

/**
 * Generates an official, print-ready PDF containing printable physical plaque cards
 * formatted in an A4 grid (2 cards per page), ready to laminate and attach to trees.
 */
export const createPrintablePlaquesPDF = async (trees, res) => {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 36, // 0.5 inch margins
    info: {
      Title: 'Tree Aadhar Physical Plaques - Fruitfull Jaipur',
      Author: 'Fruitfull Jaipur (JECRC Foundation)',
      Subject: 'Printable Tree ID Plaques',
    },
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="FFJ_Tree_Aadhar_Plaques.pdf"');
  doc.pipe(res);

  // We place 2 cards per A4 page (top and bottom) for high-visibility physical signage
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 36;
  const cardWidth = pageWidth - margin * 2;
  const cardHeight = (pageHeight - margin * 3) / 2; // ~360pt height per plaque

  for (let i = 0; i < trees.length; i++) {
    const tree = trees[i];
    const cardIndexOnPage = i % 2;

    if (i > 0 && cardIndexOnPage === 0) {
      doc.addPage();
    }

    const cardY = margin + cardIndexOnPage * (cardHeight + margin);

    // Card background & rounded border
    doc.save();
    doc.roundedRect(margin, cardY, cardWidth, cardHeight, 14)
       .fillAndStroke('#fcfbf7', '#2d6a4f');

    // Header banner band
    doc.roundedRect(margin, cardY, cardWidth, 48, 14)
       .fill('#1b4332');
    // Square off the bottom corners of the header band
    doc.rect(margin, cardY + 28, cardWidth, 20)
       .fill('#1b4332');

    // Header Title
    doc.font('Helvetica-Bold')
       .fontSize(13)
       .fillColor('#ffffff')
       .text('FRUITFULL JAIPUR  •  JECRC FOUNDATION', margin + 18, cardY + 12, {
         width: cardWidth - 36,
         align: 'left',
       });

    doc.font('Helvetica')
       .fontSize(8.5)
       .fillColor('#d8f3dc')
       .text('DIGITAL BOTANICAL IDENTITY PLAQUE  •  TREE AADHAR', margin + 18, cardY + 29);

    // Generate QR Buffer for this tree
    try {
      const defaultHost = process.env.FRONTEND_URL || 'https://fruitfull-jaipur.vercel.app';
      const targetUrl = (tree.qrTargetUrl && !tree.qrTargetUrl.includes('localhost'))
        ? tree.qrTargetUrl
        : `${defaultHost.replace(/\/$/, '')}/tree/${tree.treeId}`;
      const qrBuffer = await generateQRCodeBuffer(targetUrl);
      
      // QR Box on the right
      const qrSize = 135;
      const qrX = margin + cardWidth - qrSize - 20;
      const qrY = cardY + 68;

      // QR Border container
      doc.roundedRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 8)
         .fillAndStroke('#ffffff', '#d8f3dc');
      
      doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });

      doc.font('Helvetica-Bold')
         .fontSize(7.5)
         .fillColor('#1b4332')
         .text('SCAN FOR DIGITAL RECORDS', qrX - 8, qrY + qrSize + 12, {
           width: qrSize + 16,
           align: 'center',
         });
    } catch (qrErr) {
      console.error('Failed to generate QR for PDF:', qrErr);
    }

    // Left Column: Tree details
    const textX = margin + 20;
    let textY = cardY + 62;

    // Tree ID Pill
    doc.roundedRect(textX, textY, 130, 20, 4)
       .fill('#1b4332');
    doc.font('Helvetica-Bold')
       .fontSize(9)
       .fillColor('#ffffff')
       .text(`AADHAR: ${tree.treeId}`, textX + 6, textY + 5);

    // Category Pill
    doc.roundedRect(textX + 138, textY, 80, 20, 4)
       .fill('#d8f3dc');
    doc.font('Helvetica-Bold')
       .fontSize(8.5)
       .fillColor('#1b4332')
       .text(tree.category || 'Fruit', textX + 138, textY + 5, { width: 80, align: 'center' });

    textY += 32;

    // Common & Hindi Name
    doc.font('Helvetica-Bold')
       .fontSize(22)
       .fillColor('#1b4332')
       .text(tree.commonName, textX, textY);

    if (tree.localName) {
      textY += 26;
      doc.font('Helvetica')
         .fontSize(13)
         .fillColor('#c2410c')
         .text(tree.localName, textX, textY);
    }

    textY += 18;

    // Scientific Name (Italic)
    doc.font('Helvetica-Oblique')
       .fontSize(11)
       .fillColor('#40916c')
       .text(tree.scientificName, textX, textY);

    textY += 24;

    // Info Grid
    doc.font('Helvetica-Bold')
       .fontSize(8.5)
       .fillColor('#6b4f3b')
       .text('CAMPUS ZONE:', textX, textY);
    doc.font('Helvetica')
       .fontSize(9)
       .fillColor('#1b4332')
       .text(tree.location?.zone || 'JECRC Campus', textX + 85, textY);

    textY += 16;

    doc.font('Helvetica-Bold')
       .fontSize(8.5)
       .fillColor('#6b4f3b')
       .text('PLANTED BY:', textX, textY);
    doc.font('Helvetica')
       .fontSize(9)
       .fillColor('#1b4332')
       .text(tree.plantedBy || 'FFJ Volunteers', textX + 85, textY, { width: 220 });

    textY += 16;

    doc.font('Helvetica-Bold')
       .fontSize(8.5)
       .fillColor('#6b4f3b')
       .text('HEALTH STATUS:', textX, textY);
    const healthColor = tree.healthStatus === 'Healthy' ? '#15803d' : '#b45309';
    doc.font('Helvetica-Bold')
       .fontSize(9)
       .fillColor(healthColor)
       .text(tree.healthStatus || 'Healthy', textX + 85, textY);

    // Footer of card
    const cardFooterY = cardY + cardHeight - 34;
    doc.roundedRect(margin + 12, cardFooterY, cardWidth - 24, 24, 6)
       .fill('#f0f4f1');
    doc.font('Helvetica')
       .fontSize(7.5)
       .fillColor('#2d6a4f')
       .text('Fruitfull Jaipur Initiative  •  JECRC Foundation, Jaipur, Rajasthan  •  fruitfull-jaipur.vercel.app', margin + 12, cardFooterY + 7, {
         width: cardWidth - 24,
         align: 'center',
       });

    doc.restore();
  }

  doc.end();
};
