// Vercel Serverless Function - Generate Print-Ready PDF
// Creates PDF with bleeds at exact dimensions for professional printing

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
            // Default: assume feet for larger numbers, inches for smaller
            if (width <= 12 && height <= 12) {
                widthInches = width * 12; // Assume feet
                heightInches = height * 12;
            } else {
                widthInches = width; // Assume inches
                heightInches = height;
            }
        }

        // Add bleed to dimensions
        const totalWidthInches = widthInches + (bleedInches * 2);
        const totalHeightInches = heightInches + (bleedInches * 2);

        // Calculate pixel dimensions at target DPI
        const pixelWidth = Math.round(totalWidthInches * targetDPI);
        const pixelHeight = Math.round(totalHeightInches * targetDPI);

        // PDF dimensions in points (72 points per inch)
        const pdfWidth = totalWidthInches * 72;
        const pdfHeight = totalHeightInches * 72;

        console.log(`Generating PDF: ${widthInches}x${heightInches} inches + ${bleedInches}" bleed = ${totalWidthInches}x${totalHeightInches}" at ${targetDPI} DPI`);

        // Extract base64 data
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // Process image with Sharp - resize and convert to high quality PNG
        const processedImage = await sharp(imageBuffer)
            .resize(pixelWidth, pixelHeight, {
                fit: 'cover',
                position: 'center',
                kernel: 'lanczos3'
            })
            .png({
                quality: 100,
                compressionLevel: 6
            })
            .toBuffer();

        // Create PDF document with exact dimensions
        const doc = new PDFDocument({
            size: [pdfWidth, pdfHeight],
            margin: 0,
            info: {
                Title: `${productName || 'PrintPilot Design'} - Print Ready`,
                Author: 'PrintPilot',
                Subject: 'Print-Ready PDF with Bleeds',
                Keywords: 'print, bleed, press-ready',
                Creator: 'PrintPilot Design Studio',
                Producer: 'PDFKit'
            }
        });

        // Collect PDF data
        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));

        // Create promise for PDF completion
        const pdfPromise = new Promise((resolve, reject) => {
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
        });

        // Add image to PDF (full page, including bleeds)
        doc.image(processedImage, 0, 0, {
            width: pdfWidth,
            height: pdfHeight
        });

        // Add trim marks (crop marks) at corners
        const trimOffset = bleedInches * 72; // Convert bleed to points
        const markLength = 18; // 0.25 inch marks
        const markOffset = 6; // Small gap from trim line

        doc.strokeColor('#000000')
           .lineWidth(0.5);

        // Top-left corner marks
        doc.moveTo(trimOffset - markOffset, 0)
           .lineTo(trimOffset - markOffset, markLength)
           .stroke();
        doc.moveTo(0, trimOffset - markOffset)
           .lineTo(markLength, trimOffset - markOffset)
           .stroke();

        // Top-right corner marks
        doc.moveTo(pdfWidth - trimOffset + markOffset, 0)
           .lineTo(pdfWidth - trimOffset + markOffset, markLength)
           .stroke();
        doc.moveTo(pdfWidth, trimOffset - markOffset)
           .lineTo(pdfWidth - markLength, trimOffset - markOffset)
           .stroke();

        // Bottom-left corner marks
        doc.moveTo(trimOffset - markOffset, pdfHeight)
           .lineTo(trimOffset - markOffset, pdfHeight - markLength)
           .stroke();
        doc.moveTo(0, pdfHeight - trimOffset + markOffset)
           .lineTo(markLength, pdfHeight - trimOffset + markOffset)
           .stroke();

        // Bottom-right corner marks
        doc.moveTo(pdfWidth - trimOffset + markOffset, pdfHeight)
           .lineTo(pdfWidth - trimOffset + markOffset, pdfHeight - markLength)
           .stroke();
        doc.moveTo(pdfWidth, pdfHeight - trimOffset + markOffset)
           .lineTo(pdfWidth - markLength, pdfHeight - trimOffset + markOffset)
           .stroke();

        // Add registration mark (target) in top-left bleed area
        const regX = trimOffset / 2;
        const regY = trimOffset / 2;
        doc.circle(regX, regY, 4).stroke();
        doc.circle(regX, regY, 2).stroke();
        doc.moveTo(regX - 6, regY).lineTo(regX + 6, regY).stroke();
        doc.moveTo(regX, regY - 6).lineTo(regX, regY + 6).stroke();

        // Finalize PDF
        doc.end();

        // Wait for PDF to complete
        const pdfBuffer = await pdfPromise;
        const pdfBase64 = pdfBuffer.toString('base64');

        // Generate filename
        const filename = `PrintPilot_${(productName || 'Design').replace(/\s+/g, '_')}_${widthInches}x${heightInches}in_${targetDPI}dpi_PRINT.pdf`;

        return res.status(200).json({
            success: true,
            pdf: `data:application/pdf;base64,${pdfBase64}`,
            filename: filename,
            specs: {
                dimensions: `${widthInches}" x ${heightInches}"`,
                withBleed: `${totalWidthInches}" x ${totalHeightInches}"`,
                bleed: `${bleedInches}" (${Math.round(bleedInches * 25.4)}mm)`,
                dpi: targetDPI,
                colorSpace: 'RGB (printer will convert to CMYK)',
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
