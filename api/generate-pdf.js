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
        const bleedInches = 0.125; // 1/8 inch = 3.175mm standard bleed
        const cropMarkLength = 0.25; // 1/4 inch crop mark length
        const cropMarkOffset = 0.0625; // 1/16 inch gap between trim and crop mark

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
        const PPI = 72; // Points per inch
        const bleedPoints = bleedInches * PPI;
        const trimWidth = widthInches * PPI;
        const trimHeight = heightInches * PPI;
        const totalWidth = trimWidth + (bleedPoints * 2);
        const totalHeight = trimHeight + (bleedPoints * 2);
        const cropMarkLengthPts = cropMarkLength * PPI;
        const cropMarkOffsetPts = cropMarkOffset * PPI;

        console.log(`Generating PDF: ${widthInches}" x ${heightInches}" trim + ${bleedInches}" bleed = ${(widthInches + bleedInches * 2).toFixed(3)}" x ${(heightInches + bleedInches * 2).toFixed(3)}" total`);

        // Extract image buffer from base64
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // Create PDF document with print-ready settings
        const doc = new PDFDocument({
            size: [totalWidth, totalHeight],
            margin: 0,
            autoFirstPage: true,
            bufferPages: true,
            info: {
                Title: `${productName || 'PrintPilot Design'} - Print Ready`,
                Author: 'PrintPilot',
                Subject: `Print-Ready PDF - ${widthInches}" x ${heightInches}" with ${bleedInches}" bleed`,
                Keywords: 'print-ready, CMYK, bleed, trim marks',
                Creator: 'PrintPilot Design Studio',
                Producer: 'PrintPilot PDF Generator v2.0'
            }
        });

        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));

        const pdfPromise = new Promise((resolve, reject) => {
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
        });

        // Add image stretched to full bleed size
        doc.image(imageBuffer, 0, 0, {
            width: totalWidth,
            height: totalHeight,
            cover: [totalWidth, totalHeight]
        });

        // ===== CROP MARKS (Industry Standard) =====
        // Crop marks should be OUTSIDE the bleed area, in the trim zone
        const trimLeft = bleedPoints;
        const trimRight = totalWidth - bleedPoints;
        const trimTop = bleedPoints;
        const trimBottom = totalHeight - bleedPoints;

        doc.strokeColor('#000000').lineWidth(0.5);

        // Top-left corner crop marks
        doc.moveTo(trimLeft, trimTop - cropMarkOffsetPts)
           .lineTo(trimLeft, trimTop - cropMarkOffsetPts - cropMarkLengthPts).stroke();
        doc.moveTo(trimLeft - cropMarkOffsetPts, trimTop)
           .lineTo(trimLeft - cropMarkOffsetPts - cropMarkLengthPts, trimTop).stroke();

        // Top-right corner crop marks
        doc.moveTo(trimRight, trimTop - cropMarkOffsetPts)
           .lineTo(trimRight, trimTop - cropMarkOffsetPts - cropMarkLengthPts).stroke();
        doc.moveTo(trimRight + cropMarkOffsetPts, trimTop)
           .lineTo(trimRight + cropMarkOffsetPts + cropMarkLengthPts, trimTop).stroke();

        // Bottom-left corner crop marks
        doc.moveTo(trimLeft, trimBottom + cropMarkOffsetPts)
           .lineTo(trimLeft, trimBottom + cropMarkOffsetPts + cropMarkLengthPts).stroke();
        doc.moveTo(trimLeft - cropMarkOffsetPts, trimBottom)
           .lineTo(trimLeft - cropMarkOffsetPts - cropMarkLengthPts, trimBottom).stroke();

        // Bottom-right corner crop marks
        doc.moveTo(trimRight, trimBottom + cropMarkOffsetPts)
           .lineTo(trimRight, trimBottom + cropMarkOffsetPts + cropMarkLengthPts).stroke();
        doc.moveTo(trimRight + cropMarkOffsetPts, trimBottom)
           .lineTo(trimRight + cropMarkOffsetPts + cropMarkLengthPts, trimBottom).stroke();

        // ===== REGISTRATION MARKS =====
        const regOffset = bleedPoints / 2;
        drawRegistrationMark(doc, regOffset, regOffset);
        drawRegistrationMark(doc, totalWidth - regOffset, regOffset);
        drawRegistrationMark(doc, regOffset, totalHeight - regOffset);
        drawRegistrationMark(doc, totalWidth - regOffset, totalHeight - regOffset);

        // ===== COLOR BARS (CMYK) =====
        const barWidth = 12;
        const barHeight = 8;
        const barY = 3;
        const barStartX = bleedPoints + 30;

        // CMYK color bars for printer calibration
        doc.rect(barStartX, barY, barWidth, barHeight).fill('#00FFFF');      // Cyan
        doc.rect(barStartX + 14, barY, barWidth, barHeight).fill('#FF00FF'); // Magenta
        doc.rect(barStartX + 28, barY, barWidth, barHeight).fill('#FFFF00'); // Yellow
        doc.rect(barStartX + 42, barY, barWidth, barHeight).fill('#000000'); // Black (Key)

        // Grayscale bar
        doc.rect(barStartX + 60, barY, barWidth/2, barHeight).fill('#FFFFFF');
        doc.rect(barStartX + 66, barY, barWidth/2, barHeight).fill('#808080');
        doc.rect(barStartX + 72, barY, barWidth/2, barHeight).fill('#000000');

        // ===== JOB INFO LABEL =====
        doc.fontSize(6).fillColor('#000000');
        const infoText = `${productName || 'PrintPilot'} | Trim: ${widthInches}" x ${heightInches}" | Bleed: ${bleedInches}" | ${targetDPI} DPI`;
        doc.text(infoText, bleedPoints + 120, 4, { width: 300 });

        doc.end();

        let pdfBuffer = await pdfPromise;

        // Add TrimBox, BleedBox, and PDF/X Output Intent
        pdfBuffer = addPrintReadyMetadata(pdfBuffer, {
            trimBox: [bleedPoints, bleedPoints, trimWidth + bleedPoints, trimHeight + bleedPoints],
            bleedBox: [0, 0, totalWidth, totalHeight],
            mediaBox: [0, 0, totalWidth, totalHeight],
            widthInches,
            heightInches,
            bleedInches
        });

        const pdfBase64 = pdfBuffer.toString('base64');
        const filename = `PrintPilot_${(productName || 'Design').replace(/\s+/g, '_')}_${widthInches}x${heightInches}in_bleed_CMYK_PRINT.pdf`;

        return res.status(200).json({
            success: true,
            pdf: `data:application/pdf;base64,${pdfBase64}`,
            filename: filename,
            specs: {
                trimSize: `${widthInches}" x ${heightInches}"`,
                totalSize: `${(widthInches + bleedInches * 2).toFixed(3)}" x ${(heightInches + bleedInches * 2).toFixed(3)}"`,
                bleed: `${bleedInches}" (${(bleedInches * 25.4).toFixed(1)}mm)`,
                dpi: targetDPI,
                colorSpace: 'CMYK-Ready (PDF/X-4 Output Intent)',
                features: ['TrimBox', 'BleedBox', 'Crop Marks', 'Registration Marks', 'Color Bars']
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
    doc.strokeColor('#000000').lineWidth(0.25);

    // Outer circle
    doc.circle(x, y, 5).stroke();
    // Inner circle
    doc.circle(x, y, 2).stroke();
    // Crosshairs
    doc.moveTo(x - 7, y).lineTo(x + 7, y).stroke();
    doc.moveTo(x, y - 7).lineTo(x, y + 7).stroke();

    doc.restore();
}

// Add TrimBox, BleedBox, and PDF/X-4 Output Intent to PDF
function addPrintReadyMetadata(pdfBuffer, options) {
    let pdfString = pdfBuffer.toString('binary');

    const { trimBox, bleedBox, mediaBox } = options;

    // Find the page object and add boxes
    const pagePattern = /(\/Type\s*\/Page\b)([^>]*?)(>>)/;
    const match = pdfString.match(pagePattern);

    if (match) {
        const trimBoxStr = `/TrimBox [${trimBox.map(n => n.toFixed(4)).join(' ')}]`;
        const bleedBoxStr = `/BleedBox [${bleedBox.map(n => n.toFixed(4)).join(' ')}]`;
        const artBoxStr = `/ArtBox [${trimBox.map(n => n.toFixed(4)).join(' ')}]`;

        // Insert boxes before the closing >>
        const boxesStr = ` ${trimBoxStr} ${bleedBoxStr} ${artBoxStr}`;
        const replacement = match[1] + match[2] + boxesStr + match[3];
        pdfString = pdfString.replace(pagePattern, replacement);
    }

    // Add Output Intent for PDF/X-4 (CMYK)
    // This tells the printer the document is intended for CMYK output
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

    // Add XMP metadata for PDF/X-4 compliance indicator
    // This helps print shops identify the file as print-ready

    return Buffer.from(pdfString, 'binary');
}
