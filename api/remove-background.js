// Vercel Serverless Function - Remove Background API
// Uses Clipdrop API for professional background removal

export default async function handler(req, res) {
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
        const { imageData } = req.body;

        if (!imageData) {
            return res.status(400).json({ error: 'No image data provided' });
        }

        // Extract base64 data
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // Clipdrop API Key - set this in Vercel Environment Variables
        const CLIPDROP_API_KEY = process.env.CLIPDROP_API_KEY;

        if (!CLIPDROP_API_KEY) {
            return res.status(500).json({ error: 'Clipdrop API key not configured' });
        }

        // Create form data for Clipdrop
        const FormData = (await import('form-data')).default;
        const formData = new FormData();
        formData.append('image_file', imageBuffer, {
            filename: 'image.png',
            contentType: 'image/png'
        });

        // Call Clipdrop API
        const response = await fetch('https://clipdrop-api.co/remove-background/v1', {
            method: 'POST',
            headers: {
                'x-api-key': CLIPDROP_API_KEY,
                ...formData.getHeaders()
            },
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Clipdrop error:', errorText);
            return res.status(response.status).json({
                error: 'Background removal failed',
                details: errorText
            });
        }

        // Get the result image
        const resultBuffer = await response.arrayBuffer();
        const resultBase64 = Buffer.from(resultBuffer).toString('base64');
        const resultDataUrl = `data:image/png;base64,${resultBase64}`;

        return res.status(200).json({
            success: true,
            image: resultDataUrl
        });

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
