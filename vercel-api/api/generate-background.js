// Vercel Serverless Function - Generate Background with DALL-E 3

module.exports = async function handler(req, res) {
    // CORS headers - restrict to your domain
    const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Api-Key');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Verify API secret key (sent by PHP proxy from Hostinger)
    const apiKey = req.headers['x-api-key'];
    const expectedKey = process.env.API_SECRET_KEY;
    if (expectedKey && apiKey !== expectedKey) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'No prompt provided' });
        }

        // OpenAI API Key - set this in Vercel Environment Variables
        const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

        if (!OPENAI_API_KEY) {
            return res.status(500).json({ error: 'OpenAI API key not configured' });
        }

        const fetch = (await import('node-fetch')).default;

        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "dall-e-3",
                prompt: `Create a professional, high-quality banner background design: ${prompt}. Make it vibrant, print-ready quality, suitable for large format printing. High resolution, professional graphics.`,
                n: 1,
                size: "1792x1024",
                quality: "standard"
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenAI error:', errorData);
            return res.status(response.status).json({
                error: 'Image generation failed',
                details: errorData.error?.message || 'Unknown error'
            });
        }

        const data = await response.json();

        if (data.data && data.data[0] && data.data[0].url) {
            return res.status(200).json({
                success: true,
                imageUrl: data.data[0].url
            });
        } else {
            return res.status(500).json({ error: 'No image URL in response' });
        }

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
};
