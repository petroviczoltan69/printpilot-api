// Vercel Serverless Function - Generate Print-Ready PDF
// Creates PDF with bleeds, TrimBox, BleedBox and crop marks

const PDFDocument = require('pdfkit');
const sharp = require('sharp');

module.exports = async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { imageData, width, height, unit, dpi, productName } = req.body;

        if (!imageData) {
            return res.status(400).json({ error: 'No image data provided' });
        }

        // Default values
        const targetDPI = dpi || 150;
        const bleedInches = 0.125; // 1/8 inch = 3mm standard bleed

        // Parse dimensions - convert to inches
        let widthInches, heightInches;

        if (unit === 'ft') {
            widthInches = width * 12;
            heightInches = height * 12;
        } else if (unit === 'in' || unit === 'inches') {
            widthInches = width;
            heightInches = height;
        } else {
            if (width <= 12 && height <= 12) {
                widthInches = width * 12;
                heightInches = height * 12;
            } else {
                widthInches = width;
                heightInches = height;
            }
        }

        // Calculate dimensions
        const bleedPoints = bleedInches * 72; // Bleed in points
        const trimWidth = widthInches * 72;   // Trim size (final cut size) in points
        const trimHeight = heightInches * 72;
        const totalWidth = trimWidth + (bleedPoints * 2);  // Total with bleeds
        const totalHeight = trimHeight + (bleedPoints * 2);

        // Pixel dimensions at target DPI (including bleed)
        const pixelWidth = Math.round((widthInches + bleedInches * 2) * targetDPI);
        const pixelHeight = Math.round((heightInches + bleedInches * 2) * targetDPI);

        console.log(`Generating PDF: ${widthInches}x${heightInches}" trim + ${bleedInches}" bleed at ${targetDPI} DPI`);

        // Extract base64 data
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // Process image with Sharp
        const processedImage = await sharp(imageBuffer)
            .resize(pixelWidth, pixelHeight, {
                fit: 'cover',
                position: 'center',
                kernel: 'lanczos3'
            })
            .png({ compressionLevel: 6 })
            .toBuffer();

        // Create PDF document - MediaBox is total size including bleeds
        const doc = new PDFDocument({
            size: [totalWidth, totalHeight],
            margin: 0,
            info: {
                Title: `${productName || 'PrintPilot Design'} - Print Ready`,
                Author: 'PrintPilot',
                Subject: 'Print-Ready PDF with Bleeds and Crop Marks',
                Keywords: 'print, bleed, press-ready, crop marks',
                Creator: 'PrintPilot Design Studio',
                Producer: 'PDFKit + PrintPilot'
            }
        });

        // Collect PDF data
        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));

        const pdfPromise = new Promise((resolve, reject) => {
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
        });

        // Add image to PDF (full bleed - covers entire page)
        doc.image(processedImage, 0, 0, {
            width: totalWidth,
            height: totalHeight
        });

        // Draw crop marks (outside the bleed area, indicating trim line)
        const markLength = 24; // Length of crop marks in points
        const markGap = 6;     // Gap between trim line and mark start

        doc.strokeColor('#000000').lineWidth(0.5);

        // Top-left crop marks
        doc.moveTo(bleedPoints, 0)
           .lineTo(bleedPoints, bleedPoints - markGap)
           .stroke();
        doc.moveTo(0, bleedPoints)
           .lineTo(bleedPoints - markGap, bleedPoints)
           .stroke();

        // Top-right crop marks
        doc.moveTo(totalWidth - bleedPoints, 0)
           .lineTo(totalWidth - bleedPoints, bleedPoints - markGap)
           .stroke();
        doc.moveTo(totalWidth, bleedPoints)
           .lineTo(totalWidth - bleedPoints + markGap, bleedPoints)
           .stroke();

        // Bottom-left crop marks
        doc.moveTo(bleedPoints, totalHeight)
           .lineTo(bleedPoints, totalHeight - bleedPoints + markGap)
           .stroke();
        doc.moveTo(0, totalHeight - bleedPoints)
           .lineTo(bleedPoints - markGap, totalHeight - bleedPoints)
           .stroke();

        // Bottom-right crop marks
        doc.moveTo(totalWidth - bleedPoints, totalHeight)
           .lineTo(totalWidth - bleedPoints, totalHeight - bleedPoints + markGap)
           .stroke();
        doc.moveTo(totalWidth, totalHeight - bleedPoints)
           .lineTo(totalWidth - bleedPoints + markGap, totalHeight - bleedPoints)
           .stroke();

        // Registration marks in corners (in bleed area)
        const regOffset = bleedPoints / 2;

        // Top-left registration mark
        drawRegistrationMark(doc, regOffset, regOffset);
        // Top-right registration mark
        drawRegistrationMark(doc, totalWidth - regOffset, regOffset);
        // Bottom-left registration mark
        drawRegistrationMark(doc, regOffset, totalHeight - regOffset);
        // Bottom-right registration mark
        drawRegistrationMark(doc, totalWidth - regOffset, totalHeight - regOffset);

        // Color bars (CMYK reference) - top bleed area
        const barWidth = 10;
        const barHeight = 6;
        const barY = 2;
        const barStartX = bleedPoints + 20;

        // Cyan
        doc.rect(barStartX, barY, barWidth, barHeight).fill('#00FFFF');
        // Magenta
        doc.rect(barStartX + barWidth + 2, barY, barWidth, barHeight).fill('#FF00FF');
        // Yellow
        doc.rect(barStartX + (barWidth + 2) * 2, barY, barWidth, barHeight).fill('#FFFF00');
        // Black
        doc.rect(barStartX + (barWidth + 2) * 3, barY, barWidth, barHeight).fill('#000000');

        doc.end();

        // Wait for PDF to complete
        let pdfBuffer = await pdfPromise;

        // Post-process PDF to add TrimBox and BleedBox
        pdfBuffer = addPDFBoxes(pdfBuffer, {
            mediaBox: [0, 0, totalWidth, totalHeight],
            bleedBox: [0, 0, totalWidth, totalHeight],
            trimBox: [bleedPoints, bleedPoints, totalWidth - bleedPoints, totalHeight - bleedPoints]
        });

        const pdfBase64 = pdfBuffer.toString('base64');

        const filename = `PrintPilot_${(productName || 'Design').replace(/\s+/g, '_')}_${widthInches}x${heightInches}in_${targetDPI}dpi_PRINT.pdf`;

        return res.status(200).json({
            success: true,
            pdf: `data:application/pdf;base64,${pdfBase64}`,
            filename: filename,
            specs: {
                dimensions: `${widthInches}" x ${heightInches}"`,
                withBleed: `${(widthInches + bleedInches * 2).toFixed(3)}" x ${(heightInches + bleedInches * 2).toFixed(3)}"`,
                bleed: `${bleedInches}" (${Math.round(bleedInches * 25.4)}mm)`,
                dpi: targetDPI,
                colorSpace: 'RGB (printer converts to CMYK)',
                pixelDimensions: `${pixelWidth} x ${pixelHeight} px`
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

// Draw a registration mark (target symbol)
function drawRegistrationMark(doc, x, y) {
    const size = 4;
    doc.strokeColor('#000000').lineWidth(0.3);
    // Outer circle
    doc.circle(x, y, size).stroke();
    // Inner circle
    doc.circle(x, y, size / 2).stroke();
    // Crosshairs
    doc.moveTo(x - size - 2, y).lineTo(x + size + 2, y).stroke();
    doc.moveTo(x, y - size - 2).lineTo(x, y + size + 2).stroke();
}

// Add TrimBox and BleedBox to PDF by modifying the page object
function addPDFBoxes(pdfBuffer, boxes) {
    let pdfString = pdfBuffer.toString('binary');

    // Find the page object (usually object 3 or 4)
    // Look for /Type /Page pattern
    const pagePattern = /(\d+\s+0\s+obj[\s\S]*?\/Type\s*\/Page[\s\S]*?)(\/MediaBox\s*\[[^\]]+\])([\s\S]*?endobj)/;

    const match = pdfString.match(pagePattern);
    if (match) {
        const beforeMediaBox = match[1];
        const mediaBoxStr = match[2];
        const afterMediaBox = match[3];

        // Create box strings
        const trimBoxStr = `/TrimBox [${boxes.trimBox.join(' ')}]`;
        const bleedBoxStr = `/BleedBox [${boxes.bleedBox.join(' ')}]`;

        // Insert TrimBox and BleedBox after MediaBox
        const newPageObj = beforeMediaBox + mediaBoxStr + ' ' + trimBoxStr + ' ' + bleedBoxStr + afterMediaBox;

        pdfString = pdfString.replace(pagePattern, newPageObj);
    }

    return Buffer.from(pdfString, 'binary');
}
