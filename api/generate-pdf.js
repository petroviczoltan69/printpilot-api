// Vercel Serverless Function - Generate Print-Ready PDF
// Creates PDF with bleeds, TrimBox, BleedBox and crop marks

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

        // Calculate dimensions in points (72 points per inch)
        const bleedPoints = bleedInches * 72;
        const trimWidth = widthInches * 72;
        const trimHeight = heightInches * 72;
        const totalWidth = trimWidth + (bleedPoints * 2);
        const totalHeight = trimHeight + (bleedPoints * 2);

        console.log(`Generating PDF: ${widthInches}x${heightInches}" trim + ${bleedInches}" bleed`);

        // Extract image buffer from base64
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // Create PDF document
        const doc = new PDFDocument({
            size: [totalWidth, totalHeight],
            margin: 0,
            info: {
                Title: `${productName || 'PrintPilot Design'} - Print Ready`,
                Author: 'PrintPilot',
                Subject: 'Print-Ready PDF with Bleeds and Crop Marks',
                Creator: 'PrintPilot Design Studio'
            }
        });

        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));

        const pdfPromise = new Promise((resolve, reject) => {
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
        });

        // Add image - PDFKit can handle the image directly
        doc.image(imageBuffer, 0, 0, {
            width: totalWidth,
            height: totalHeight,
            cover: [totalWidth, totalHeight]
        });

        // Draw crop marks
        doc.strokeColor('#000000').lineWidth(0.5);

        // Top-left crop marks
        doc.moveTo(bleedPoints, 0).lineTo(bleedPoints, bleedPoints - 3).stroke();
        doc.moveTo(0, bleedPoints).lineTo(bleedPoints - 3, bleedPoints).stroke();

        // Top-right crop marks
        doc.moveTo(totalWidth - bleedPoints, 0).lineTo(totalWidth - bleedPoints, bleedPoints - 3).stroke();
        doc.moveTo(totalWidth, bleedPoints).lineTo(totalWidth - bleedPoints + 3, bleedPoints).stroke();

        // Bottom-left crop marks
        doc.moveTo(bleedPoints, totalHeight).lineTo(bleedPoints, totalHeight - bleedPoints + 3).stroke();
        doc.moveTo(0, totalHeight - bleedPoints).lineTo(bleedPoints - 3, totalHeight - bleedPoints).stroke();

        // Bottom-right crop marks
        doc.moveTo(totalWidth - bleedPoints, totalHeight).lineTo(totalWidth - bleedPoints, totalHeight - bleedPoints + 3).stroke();
        doc.moveTo(totalWidth, totalHeight - bleedPoints).lineTo(totalWidth - bleedPoints + 3, totalHeight - bleedPoints).stroke();

        // Registration marks in corners
        const regOffset = bleedPoints / 2;
        drawRegistrationMark(doc, regOffset, regOffset);
        drawRegistrationMark(doc, totalWidth - regOffset, regOffset);
        drawRegistrationMark(doc, regOffset, totalHeight - regOffset);
        drawRegistrationMark(doc, totalWidth - regOffset, totalHeight - regOffset);

        // Color bars
        const barWidth = 10, barHeight = 6, barY = 2, barStartX = bleedPoints + 20;
        doc.rect(barStartX, barY, barWidth, barHeight).fill('#00FFFF');
        doc.rect(barStartX + 12, barY, barWidth, barHeight).fill('#FF00FF');
        doc.rect(barStartX + 24, barY, barWidth, barHeight).fill('#FFFF00');
        doc.rect(barStartX + 36, barY, barWidth, barHeight).fill('#000000');

        doc.end();

        let pdfBuffer = await pdfPromise;

        // Add TrimBox and BleedBox to PDF
        pdfBuffer = addPDFBoxes(pdfBuffer, {
            trimBox: [bleedPoints, bleedPoints, totalWidth - bleedPoints, totalHeight - bleedPoints],
            bleedBox: [0, 0, totalWidth, totalHeight]
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
                colorSpace: 'RGB (printer converts to CMYK)'
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

function drawRegistrationMark(doc, x, y) {
    doc.strokeColor('#000000').lineWidth(0.3);
    doc.circle(x, y, 4).stroke();
    doc.circle(x, y, 2).stroke();
    doc.moveTo(x - 6, y).lineTo(x + 6, y).stroke();
    doc.moveTo(x, y - 6).lineTo(x, y + 6).stroke();
}

function addPDFBoxes(pdfBuffer, boxes) {
    let pdfString = pdfBuffer.toString('binary');

    // Find page object and add boxes
    const pagePattern = /(\/Type\s*\/Page[^>]*)(>>)/;
    const match = pdfString.match(pagePattern);

    if (match) {
        const trimBoxStr = `/TrimBox [${boxes.trimBox.map(n => n.toFixed(2)).join(' ')}]`;
        const bleedBoxStr = `/BleedBox [${boxes.bleedBox.map(n => n.toFixed(2)).join(' ')}]`;
        const replacement = match[1] + ' ' + trimBoxStr + ' ' + bleedBoxStr + ' ' + match[2];
        pdfString = pdfString.replace(pagePattern, replacement);
    }

    return Buffer.from(pdfString, 'binary');
}
