// Vercel Serverless Function - Generate Print-Ready PDF
// Artboard = exact trim size, image fills to edge

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

        // Extract image buffer from base64
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // Detect image orientation and match PDF to it
        const imageIsLandscape = detectImageOrientation(imageBuffer);
        const dimsAreLandscape = widthInches > heightInches;

        if (imageIsLandscape !== null && imageIsLandscape !== dimsAreLandscape) {
            console.log(`Swapping dimensions: image is ${imageIsLandscape ? 'landscape' : 'portrait'}`);
            [widthInches, heightInches] = [heightInches, widthInches];
        }

        // Calculate dimensions in points (72 points per inch)
        const PPI = 72;

        // Artboard/document size = exact trim size
        const docWidth = widthInches * PPI;
        const docHeight = heightInches * PPI;

        console.log(`Generating PDF: ${widthInches}" x ${heightInches}" (${docWidth}pt x ${docHeight}pt)`);

        // Create PDF with exact trim size
        const doc = new PDFDocument({
            size: [docWidth, docHeight],
            margin: 0,
            autoFirstPage: true,
            bufferPages: true,
            info: {
                Title: `${productName || 'PrintPilot Design'} - Print Ready`,
                Author: 'PrintPilot',
                Subject: `Print-Ready PDF - ${widthInches}" x ${heightInches}"`,
                Keywords: 'print-ready, CMYK',
                Creator: 'PrintPilot Design Studio',
                Producer: 'PrintPilot PDF Generator v4.0'
            }
        });

        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));

        const pdfPromise = new Promise((resolve, reject) => {
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
        });

        // Draw image filling entire artboard
        doc.image(imageBuffer, 0, 0, {
            width: docWidth,
            height: docHeight,
            cover: [docWidth, docHeight]
        });

        doc.end();

        let pdfBuffer = await pdfPromise;

        // Add PDF boxes and CMYK output intent
        pdfBuffer = addPrintReadyMetadata(pdfBuffer, {
            mediaBox: [0, 0, docWidth, docHeight],
            trimBox: [0, 0, docWidth, docHeight],
            artBox: [0, 0, docWidth, docHeight]
        });

        const pdfBase64 = pdfBuffer.toString('base64');
        const filename = `PrintPilot_${(productName || 'Design').replace(/\s+/g, '_')}_${widthInches}x${heightInches}in_PRINT.pdf`;

        return res.status(200).json({
            success: true,
            pdf: `data:application/pdf;base64,${pdfBase64}`,
            filename: filename,
            specs: {
                size: `${widthInches}" x ${heightInches}"`,
                dpi: targetDPI,
                colorSpace: 'CMYK-Ready (PDF/X-4 Output Intent)',
                note: 'Artboard matches exact trim size'
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

// Detect image orientation from JPEG/PNG headers
function detectImageOrientation(buffer) {
    try {
        if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
            return detectJpegOrientation(buffer);
        }
        if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
            return detectPngOrientation(buffer);
        }
        return null;
    } catch (e) {
        return null;
    }
}

function detectJpegOrientation(buffer) {
    let offset = 2;
    while (offset < buffer.length) {
        if (buffer[offset] !== 0xFF) break;
        const marker = buffer[offset + 1];
        if ((marker >= 0xC0 && marker <= 0xC3) || (marker >= 0xC5 && marker <= 0xC7) ||
            (marker >= 0xC9 && marker <= 0xCB) || (marker >= 0xCD && marker <= 0xCF)) {
            const height = buffer.readUInt16BE(offset + 5);
            const width = buffer.readUInt16BE(offset + 7);
            return width > height;
        }
        const length = buffer.readUInt16BE(offset + 2);
        offset += 2 + length;
    }
    return null;
}

function detectPngOrientation(buffer) {
    if (buffer.length > 24) {
        const width = buffer.readUInt32BE(16);
        const height = buffer.readUInt32BE(20);
        return width > height;
    }
    return null;
}

// Add PDF metadata
function addPrintReadyMetadata(pdfBuffer, boxes) {
    let pdfString = pdfBuffer.toString('binary');

    const { trimBox, artBox } = boxes;

    // Add TrimBox and ArtBox to Page object
    const pagePattern = /(\/Type\s*\/Page\b[^>]*?)(>>)/;
    const match = pdfString.match(pagePattern);

    if (match) {
        const trimBoxStr = `/TrimBox [${trimBox.map(n => n.toFixed(4)).join(' ')}]`;
        const artBoxStr = `/ArtBox [${artBox.map(n => n.toFixed(4)).join(' ')}]`;

        const boxesStr = ` ${trimBoxStr} ${artBoxStr} `;
        const replacement = match[1] + boxesStr + match[2];
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

    const catalogPattern = /(\/Type\s*\/Catalog\b)([^>]*?)(>>)/;
    const catalogMatch = pdfString.match(catalogPattern);

    if (catalogMatch) {
        const replacement = catalogMatch[1] + catalogMatch[2] + outputIntentObj + catalogMatch[3];
        pdfString = pdfString.replace(catalogPattern, replacement);
    }

    return Buffer.from(pdfString, 'binary');
}
