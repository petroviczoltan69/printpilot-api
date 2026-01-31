// Vercel Serverless Function - Generate Print-Ready CMYK PDF
// Creates PDF with bleeds at exact dimensions for professional printing
// Uses raw PDF commands to embed CMYK images properly

const sharp = require('sharp');
const zlib = require('zlib');

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

        console.log(`Generating CMYK PDF: ${widthInches}x${heightInches} inches + ${bleedInches}" bleed at ${targetDPI} DPI`);

        // Extract base64 data
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // Process image with Sharp - convert to CMYK raw pixels
        const cmykImage = await sharp(imageBuffer)
            .resize(pixelWidth, pixelHeight, {
                fit: 'cover',
                position: 'center',
                kernel: 'lanczos3'
            })
            .toColorspace('cmyk')
            .raw()
            .toBuffer({ resolveWithObject: true });

        const { data: cmykData, info } = cmykImage;

        // Compress the CMYK data with zlib (FlateDecode)
        const compressedData = zlib.deflateSync(cmykData);

        // Build PDF manually with CMYK color space
        const pdf = buildCMYKPdf({
            cmykData: compressedData,
            rawDataLength: cmykData.length,
            pixelWidth: info.width,
            pixelHeight: info.height,
            pdfWidth,
            pdfHeight,
            bleedInches,
            productName: productName || 'PrintPilot Design'
        });

        const pdfBase64 = pdf.toString('base64');

        // Generate filename
        const filename = `PrintPilot_${(productName || 'Design').replace(/\s+/g, '_')}_${widthInches}x${heightInches}in_${targetDPI}dpi_CMYK_PRINT.pdf`;

        return res.status(200).json({
            success: true,
            pdf: `data:application/pdf;base64,${pdfBase64}`,
            filename: filename,
            specs: {
                dimensions: `${widthInches}" x ${heightInches}"`,
                withBleed: `${totalWidthInches}" x ${totalHeightInches}"`,
                bleed: `${bleedInches}" (${Math.round(bleedInches * 25.4)}mm)`,
                dpi: targetDPI,
                colorSpace: 'CMYK',
                pixelDimensions: `${info.width} x ${info.height} px`
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

/**
 * Build a PDF with CMYK image using raw PDF commands
 */
function buildCMYKPdf({ cmykData, rawDataLength, pixelWidth, pixelHeight, pdfWidth, pdfHeight, bleedInches, productName }) {
    const trimOffset = bleedInches * 72;

    // PDF objects
    const objects = [];
    let objectNum = 1;

    // Object 1: Catalog
    objects.push({
        num: objectNum++,
        content: `<< /Type /Catalog /Pages 2 0 R >>`
    });

    // Object 2: Pages
    objects.push({
        num: objectNum++,
        content: `<< /Type /Pages /Kids [3 0 R] /Count 1 >>`
    });

    // Object 3: Page
    objects.push({
        num: objectNum++,
        content: `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pdfWidth.toFixed(2)} ${pdfHeight.toFixed(2)}] /TrimBox [${trimOffset.toFixed(2)} ${trimOffset.toFixed(2)} ${(pdfWidth - trimOffset).toFixed(2)} ${(pdfHeight - trimOffset).toFixed(2)}] /BleedBox [0 0 ${pdfWidth.toFixed(2)} ${pdfHeight.toFixed(2)}] /Resources << /XObject << /Img 5 0 R >> >> /Contents 4 0 R >>`
    });

    // Object 4: Page content stream (draw image + crop marks)
    const cropMarks = generateCropMarks(pdfWidth, pdfHeight, trimOffset);
    const contentStream = `q ${pdfWidth.toFixed(2)} 0 0 ${pdfHeight.toFixed(2)} 0 0 cm /Img Do Q ${cropMarks}`;
    const contentStreamCompressed = zlib.deflateSync(Buffer.from(contentStream));

    objects.push({
        num: objectNum++,
        content: `<< /Length ${contentStreamCompressed.length} /Filter /FlateDecode >>`,
        stream: contentStreamCompressed
    });

    // Object 5: CMYK Image XObject
    objects.push({
        num: objectNum++,
        content: `<< /Type /XObject /Subtype /Image /Width ${pixelWidth} /Height ${pixelHeight} /ColorSpace /DeviceCMYK /BitsPerComponent 8 /Length ${cmykData.length} /Filter /FlateDecode /Decode [1 0 1 0 1 0 1 0] >>`,
        stream: cmykData
    });

    // Object 6: Info dictionary
    const now = new Date();
    const dateStr = `D:${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}`;

    objects.push({
        num: objectNum++,
        content: `<< /Title (${productName} - Print Ready CMYK) /Author (PrintPilot) /Subject (Print-Ready CMYK PDF with Bleeds) /Creator (PrintPilot Design Studio) /Producer (PrintPilot PDF Generator) /CreationDate (${dateStr}) >>`
    });

    // Build the PDF file
    let pdf = '%PDF-1.4\n%\xFF\xFF\xFF\xFF\n';
    const offsets = [];

    for (const obj of objects) {
        offsets.push(pdf.length);
        pdf += `${obj.num} 0 obj\n${obj.content}\n`;
        if (obj.stream) {
            pdf += 'stream\n';
            // Convert to buffer for binary stream
            const pdfBefore = Buffer.from(pdf, 'binary');
            const pdfAfter = Buffer.from('\nendstream\nendobj\n', 'binary');
            pdf = Buffer.concat([pdfBefore, obj.stream, pdfAfter]);
        } else {
            pdf += 'endobj\n';
        }
    }

    // Convert to buffer if still string
    if (typeof pdf === 'string') {
        pdf = Buffer.from(pdf, 'binary');
    }

    // XRef table
    const xrefOffset = pdf.length;
    let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (const offset of offsets) {
        xref += `${String(offset).padStart(10, '0')} 00000 n \n`;
    }

    // Trailer
    const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info 6 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    return Buffer.concat([pdf, Buffer.from(xref + trailer)]);
}

/**
 * Generate crop marks PDF commands
 */
function generateCropMarks(pdfWidth, pdfHeight, trimOffset) {
    const markLength = 18;
    const markGap = 6;

    let marks = '0 0 0 1 K 0.5 w '; // CMYK Black, 0.5pt line width

    // Top-left
    marks += `${trimOffset - markGap} 0 m ${trimOffset - markGap} ${markLength} l S `;
    marks += `0 ${trimOffset - markGap} m ${markLength} ${trimOffset - markGap} l S `;

    // Top-right
    marks += `${pdfWidth - trimOffset + markGap} 0 m ${pdfWidth - trimOffset + markGap} ${markLength} l S `;
    marks += `${pdfWidth} ${trimOffset - markGap} m ${pdfWidth - markLength} ${trimOffset - markGap} l S `;

    // Bottom-left
    marks += `${trimOffset - markGap} ${pdfHeight} m ${trimOffset - markGap} ${pdfHeight - markLength} l S `;
    marks += `0 ${pdfHeight - trimOffset + markGap} m ${markLength} ${pdfHeight - trimOffset + markGap} l S `;

    // Bottom-right
    marks += `${pdfWidth - trimOffset + markGap} ${pdfHeight} m ${pdfWidth - trimOffset + markGap} ${pdfHeight - markLength} l S `;
    marks += `${pdfWidth} ${pdfHeight - trimOffset + markGap} m ${pdfWidth - markLength} ${pdfHeight - trimOffset + markGap} l S `;

    // Registration mark (target) - top left corner in bleed area
    const rx = trimOffset / 2;
    const ry = pdfHeight - trimOffset / 2;

    // Circle approximation with bezier curves
    const r = 4;
    const c = r * 0.552284749831; // Control point distance
    marks += `${rx - r} ${ry} m ${rx - r} ${ry + c} ${rx - c} ${ry + r} ${rx} ${ry + r} c `;
    marks += `${rx + c} ${ry + r} ${rx + r} ${ry + c} ${rx + r} ${ry} c `;
    marks += `${rx + r} ${ry - c} ${rx + c} ${ry - r} ${rx} ${ry - r} c `;
    marks += `${rx - c} ${ry - r} ${rx - r} ${ry - c} ${rx - r} ${ry} c S `;

    // Crosshairs
    marks += `${rx - 6} ${ry} m ${rx + 6} ${ry} l S `;
    marks += `${rx} ${ry - 6} m ${rx} ${ry + 6} l S `;

    return marks;
}
