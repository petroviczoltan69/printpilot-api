// Vercel Serverless Function for Clipdrop Background Removal
// This acts as a proxy to bypass CORS restrictions

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const CLIPDROP_API_KEY = '3cbd14e61caf622cd51cb12a24e1d7eede5ffaaae0ae0a564bcfd1ae9e0ffad16a0d23c0132d2a0aa1d5bf31619b3238';

        // Get image from request body
        const { imageData } = req.body;

        if (!imageData) {
            return res.status(400).json({ error: 'No image data provided' });
        }

        // Convert base64 to blob
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // Create form data
        const FormData = require('form-data');
        const formData = new FormData();
        formData.append('image_file', buffer, {
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
                error: 'Clipdrop API error',
                details: errorText 
            });
        }

        // Get result as buffer
        const resultBuffer = await response.arrayBuffer();
        const resultBase64 = Buffer.from(resultBuffer).toString('base64');

        // Return as base64
        return res.status(200).json({
            success: true,
            image: `data:image/png;base64,${resultBase64}`
        });

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
}
