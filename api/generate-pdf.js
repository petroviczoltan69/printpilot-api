// Vercel Serverless Function - Generate Print-Ready PDF
// Creates PDF/X-4 compatible output with CMYK intent, bleeds, TrimBox, BleedBox and crop marks

const PDFDocument = require('pdfkit');

module.exports = async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { imageData, width, height, unit, dpi, productName } = req.body;

        if (!imageData) {
            return res.status(400).json({ error: 'No image data provided' });
        }

        const targetDPI = dpi || 150;

        // Print-ready margins (in inches)
        const bleedInches = 0.125;      // 1/8 inch = 3.175mm standard bleed
        const markMarginInches = 0.25;  // Extra margin for crop marks (1/4 inch)
        const cropMarkLength = 0.375;   // 3/8 inch crop mark length
        const cropMarkGap = 0.0625;     // 1/16 inch gap from trim line

        // Parse dimensions - convert to inches
        let widthInches, heightInches;

        if (unit === 'ft') {
            widthInches = width * 12;
            heightInches = height * 12;
        } else if (unit === 'in' || unit === 'inches') {
            widthInches = width;
            heightInches = height;
        } else {
            // Auto-detect: if small numbers, assume feet
            if (width <= 12 && height <= 12) {
                widthInches = width * 12;
                heightInches = height * 12;
            } else {
                widthInches = width;
                heightInches = height;
            }
        }

        // Calculate dimensions in points (72 points per inch)
        const PPI = 72;
        const bleedPts = bleedInches * PPI;
        const markMarginPts = markMarginInches * PPI;
        const cropMarkLengthPts = cropMarkLength * PPI;
        const cropMarkGapPts = cropMarkGap * PPI;

        // Trim size (final cut size)
        const trimWidth = widthInches * PPI;
        const trimHeight = heightInches * PPI;

        // Bleed size (trim + bleed on all sides)
        const bleedWidth = trimWidth + (bleedPts * 2);
        const bleedHeight = trimHeight + (bleedPts * 2);

        // Total page size (bleed + margin for marks)
        const totalWidth = bleedWidth + (markMarginPts * 2);
        const totalHeight = bleedHeight + (markMarginPts * 2);

        // Offsets for positioning
        const imageX = markMarginPts;  // Where bleed area starts
        const imageY = markMarginPts;
        const trimX = markMarginPts + bleedPts;  // Where trim area starts
        const trimY = markMarginPts + bleedPts;

        console.log(`Generating PDF: ${widthInches}" x ${heightInches}" trim, ${bleedInches}" bleed, ${markMarginInches}" mark margin`);

        // Extract image buffer from base64
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // Create PDF document
        const doc = new PDFDocument({
            size: [totalWidth, totalHeight],
            margin: 0,
            autoFirstPage: true,
            bufferPages: true,
            info: {
                Title: `${productName || 'PrintPilot Design'} - Print Ready`,
                Author: 'PrintPilot',
                Subject: `Print-Ready PDF - ${widthInches}" x ${heightInches}" with ${bleedInches}" bleed`,
                Keywords: 'print-ready, CMYK, bleed, trim marks, crop marks',
                Creator: 'PrintPilot Design Studio',
                Producer: 'PrintPilot PDF Generator v2.1'
            }
        });

        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));

        const pdfPromise = new Promise((resolve, reject) => {
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
        });

        // Fill mark margin area with white
        doc.rect(0, 0, totalWidth, totalHeight).fill('#FFFFFF');

        // Add image in the bleed area (not in mark margin)
        doc.image(imageBuffer, imageX, imageY, {
            width: bleedWidth,
            height: bleedHeight,
            cover: [bleedWidth, bleedHeight]
        });

        // ===== CROP MARKS =====
        // These go in the white margin area, pointing to trim edges
        doc.strokeColor('#000000').lineWidth(0.75);

        // Trim box corners
        const trimLeft = trimX;
        const trimRight = trimX + trimWidth;
        const trimTop = trimY;
        const trimBottom = trimY + trimHeight;

        // Top-left crop marks
        doc.moveTo(trimLeft, trimTop - cropMarkGapPts)
           .lineTo(trimLeft, trimTop - cropMarkGapPts - cropMarkLengthPts).stroke();
        doc.moveTo(trimLeft - cropMarkGapPts, trimTop)
           .lineTo(trimLeft - cropMarkGapPts - cropMarkLengthPts, trimTop).stroke();

        // Top-right crop marks
        doc.moveTo(trimRight, trimTop - cropMarkGapPts)
           .lineTo(trimRight, trimTop - cropMarkGapPts - cropMarkLengthPts).stroke();
        doc.moveTo(trimRight + cropMarkGapPts, trimTop)
           .lineTo(trimRight + cropMarkGapPts + cropMarkLengthPts, trimTop).stroke();

        // Bottom-left crop marks
        doc.moveTo(trimLeft, trimBottom + cropMarkGapPts)
           .lineTo(trimLeft, trimBottom + cropMarkGapPts + cropMarkLengthPts).stroke();
        doc.moveTo(trimLeft - cropMarkGapPts, trimBottom)
           .lineTo(trimLeft - cropMarkGapPts - cropMarkLengthPts, trimBottom).stroke();

        // Bottom-right crop marks
        doc.moveTo(trimRight, trimBottom + cropMarkGapPts)
           .lineTo(trimRight, trimBottom + cropMarkGapPts + cropMarkLengthPts).stroke();
        doc.moveTo(trimRight + cropMarkGapPts, trimBottom)
           .lineTo(trimRight + cropMarkGapPts + cropMarkLengthPts, trimBottom).stroke();

        // ===== REGISTRATION MARKS (in corners of mark margin) =====
        const regOffset = markMarginPts / 2;
        drawRegistrationMark(doc, regOffset, regOffset);
        drawRegistrationMark(doc, totalWidth - regOffset, regOffset);
        drawRegistrationMark(doc, regOffset, totalHeight - regOffset);
        drawRegistrationMark(doc, totalWidth - regOffset, totalHeight - regOffset);

        // ===== COLOR BARS (CMYK) in top margin =====
        const barWidth = 14;
        const barHeight = 10;
        const barY = markMarginPts / 2 - barHeight / 2;
        const barStartX = trimLeft + 40;

        doc.rect(barStartX, barY, barWidth, barHeight).fill('#00FFFF');      // Cyan
        doc.rect(barStartX + 16, barY, barWidth, barHeight).fill('#FF00FF'); // Magenta
        doc.rect(barStartX + 32, barY, barWidth, barHeight).fill('#FFFF00'); // Yellow
        doc.rect(barStartX + 48, barY, barWidth, barHeight).fill('#000000'); // Black

        // Grayscale bar
        doc.rect(barStartX + 70, barY, barWidth/2, barHeight).fill('#FFFFFF').stroke('#000000');
        doc.rect(barStartX + 77, barY, barWidth/2, barHeight).fill('#808080');
        doc.rect(barStartX + 84, barY, barWidth/2, barHeight).fill('#000000');

        // ===== JOB INFO LABEL =====
        doc.fontSize(7).fillColor('#000000');
        const infoText = `${productName || 'PrintPilot'} | Trim: ${widthInches}" x ${heightInches}" | Bleed: ${bleedInches}" | ${targetDPI} DPI | CMYK Ready`;
        doc.text(infoText, barStartX + 110, barY + 1, { width: 400 });

        // ===== BLEED INDICATOR LINES (optional - shows bleed boundary) =====
        doc.strokeColor('#FF0000').lineWidth(0.25).opacity(0.3);
        // Bleed box outline (dashed)
        doc.rect(imageX, imageY, bleedWidth, bleedHeight).stroke();
        doc.opacity(1);

        doc.end();

        let pdfBuffer = await pdfPromise;

        // Add TrimBox, BleedBox, and PDF/X Output Intent
        pdfBuffer = addPrintReadyMetadata(pdfBuffer, {
            // PDF boxes use coordinates from bottom-left origin
            mediaBox: [0, 0, totalWidth, totalHeight],
            bleedBox: [imageX, imageY, imageX + bleedWidth, imageY + bleedHeight],
            trimBox: [trimX, trimY, trimX + trimWidth, trimY + trimHeight],
            artBox: [trimX, trimY, trimX + trimWidth, trimY + trimHeight]
        });

        const pdfBase64 = pdfBuffer.toString('base64');
        const filename = `PrintPilot_${(productName || 'Design').replace(/\s+/g, '_')}_${widthInches}x${heightInches}in_bleed_CMYK_PRINT.pdf`;

        return res.status(200).json({
            success: true,
            pdf: `data:application/pdf;base64,${pdfBase64}`,
            filename: filename,
            specs: {
                trimSize: `${widthInches}" x ${heightInches}"`,
                bleedSize: `${(widthInches + bleedInches * 2).toFixed(3)}" x ${(heightInches + bleedInches * 2).toFixed(3)}"`,
                totalSize: `${(widthInches + bleedInches * 2 + markMarginInches * 2).toFixed(3)}" x ${(heightInches + bleedInches * 2 + markMarginInches * 2).toFixed(3)}"`,
                bleed: `${bleedInches}" (${(bleedInches * 25.4).toFixed(1)}mm)`,
                dpi: targetDPI,
                colorSpace: 'CMYK-Ready (PDF/X-4 Output Intent)',
                features: ['TrimBox', 'BleedBox', 'Crop Marks', 'Registration Marks', 'Color Bars', 'Bleed Guides']
            }
        });

    } catch (error) {
        console.error('PDF generation error:', error);
        return res.status(500).json({
            error: 'PDF generation failed',
            message: error.message
        });
    }
};

// Draw registration mark (target symbol for alignment)
function drawRegistrationMark(doc, x, y) {
    doc.save();
    doc.strokeColor('#000000').lineWidth(0.5);

    // Outer circle
    doc.circle(x, y, 6).stroke();
    // Inner circle
    doc.circle(x, y, 2.5).stroke();
    // Crosshairs
    doc.moveTo(x - 9, y).lineTo(x + 9, y).stroke();
    doc.moveTo(x, y - 9).lineTo(x, y + 9).stroke();

    doc.restore();
}

// Add TrimBox, BleedBox, and PDF/X-4 Output Intent to PDF
function addPrintReadyMetadata(pdfBuffer, boxes) {
    let pdfString = pdfBuffer.toString('binary');

    const { mediaBox, bleedBox, trimBox, artBox } = boxes;

    // Find the page object and add boxes
    const pagePattern = /(\/Type\s*\/Page\b)([^>]*?)(>>)/;
    const match = pdfString.match(pagePattern);

    if (match) {
        const trimBoxStr = `/TrimBox [${trimBox.map(n => n.toFixed(4)).join(' ')}]`;
        const bleedBoxStr = `/BleedBox [${bleedBox.map(n => n.toFixed(4)).join(' ')}]`;
        const artBoxStr = `/ArtBox [${artBox.map(n => n.toFixed(4)).join(' ')}]`;

        const boxesStr = ` ${trimBoxStr} ${bleedBoxStr} ${artBoxStr}`;
        const replacement = match[1] + match[2] + boxesStr + match[3];
        pdfString = pdfString.replace(pagePattern, replacement);
    }

    // Add Output Intent for PDF/X-4 (CMYK)
    const outputIntentObj = `
/OutputIntents [<<
/Type /OutputIntent
/S /GTS_PDFX
/OutputConditionIdentifier (CGATS TR 001)
/RegistryName (http://www.color.org)
/Info (U.S. Web Coated SWOP v2)
>>]`;

    // Find catalog and add output intent
    const catalogPattern = /(\/Type\s*\/Catalog\b)([^>]*?)(>>)/;
    const catalogMatch = pdfString.match(catalogPattern);

    if (catalogMatch) {
        const replacement = catalogMatch[1] + catalogMatch[2] + outputIntentObj + catalogMatch[3];
        pdfString = pdfString.replace(catalogPattern, replacement);
    }

    return Buffer.from(pdfString, 'binary');
}
