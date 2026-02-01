// Adobe PDF Services API Endpoint
// Converts images to CMYK PDF and optionally merges with template

const ADOBE_CLIENT_ID = process.env.ADOBE_CLIENT_ID;
const ADOBE_CLIENT_SECRET = process.env.ADOBE_CLIENT_SECRET;

// Get Adobe access token
async function getAccessToken() {
  const response = await fetch('https://pdf-services.adobe.io/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: ADOBE_CLIENT_ID,
      client_secret: ADOBE_CLIENT_SECRET,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get Adobe access token: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Upload asset to Adobe
async function uploadAsset(accessToken, fileBuffer, mediaType) {
  // Create upload URI
  const createResponse = await fetch('https://pdf-services.adobe.io/assets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'X-API-Key': ADOBE_CLIENT_ID,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      mediaType: mediaType,
    }),
  });

  if (!createResponse.ok) {
    const error = await createResponse.text();
    throw new Error(`Failed to create upload URI: ${error}`);
  }

  const { assetID, uploadUri } = await createResponse.json();

  // Upload file
  const uploadResponse = await fetch(uploadUri, {
    method: 'PUT',
    headers: {
      'Content-Type': mediaType,
    },
    body: fileBuffer,
  });

  if (!uploadResponse.ok) {
    throw new Error('Failed to upload file to Adobe');
  }

  return assetID;
}

// Create PDF from image
async function createPDFFromImage(accessToken, imageAssetID) {
  const response = await fetch('https://pdf-services.adobe.io/operation/createpdf', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'X-API-Key': ADOBE_CLIENT_ID,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      assetID: imageAssetID,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create PDF job: ${error}`);
  }

  // Get job location
  const location = response.headers.get('location');
  if (!location) {
    throw new Error('No job location returned from Adobe');
  }

  // Poll for completion
  return await pollJobStatus(accessToken, location);
}

// Combine PDFs (overlay artwork on template)
async function combinePDFs(accessToken, assetIDs) {
  const response = await fetch('https://pdf-services.adobe.io/operation/combinepdf', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'X-API-Key': ADOBE_CLIENT_ID,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      assets: assetIDs.map(assetID => ({ assetID })),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create combine job: ${error}`);
  }

  const location = response.headers.get('location');
  if (!location) {
    throw new Error('No job location returned for combine');
  }

  return await pollJobStatus(accessToken, location);
}

// Poll job status until complete
async function pollJobStatus(accessToken, location) {
  let attempts = 0;
  const maxAttempts = 60; // 60 seconds timeout

  while (attempts < maxAttempts) {
    const response = await fetch(location, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-API-Key': ADOBE_CLIENT_ID,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to check job status');
    }

    const data = await response.json();

    if (data.status === 'done') {
      return data.asset.downloadUri;
    } else if (data.status === 'failed') {
      throw new Error(`Adobe job failed: ${data.error?.message || 'Unknown error'}`);
    }

    // Wait 1 second before polling again
    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;
  }

  throw new Error('Adobe job timed out after 60 seconds');
}

// Download file from URI
async function downloadFile(uri) {
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error('Failed to download file from Adobe');
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Parse multipart form data manually (Vercel serverless)
async function parseMultipartForm(req) {
  return new Promise((resolve, reject) => {
    const busboy = require('busboy');
    const bb = busboy({ headers: req.headers });

    const files = {};
    const fields = {};

    bb.on('file', (name, file, info) => {
      const chunks = [];
      file.on('data', (data) => chunks.push(data));
      file.on('end', () => {
        files[name] = {
          buffer: Buffer.concat(chunks),
          filename: info.filename,
          mimeType: info.mimeType,
        };
      });
    });

    bb.on('field', (name, val) => {
      fields[name] = val;
    });

    bb.on('finish', () => resolve({ files, fields }));
    bb.on('error', reject);

    req.pipe(bb);
  });
}

module.exports = async (req, res) => {
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
    // Check credentials
    if (!ADOBE_CLIENT_ID || !ADOBE_CLIENT_SECRET) {
      throw new Error('Adobe credentials not configured');
    }

    // Parse form data
    const { files, fields } = await parseMultipartForm(req);

    const artworkFile = files.artwork;
    const templateFile = files.template;

    if (!artworkFile) {
      return res.status(400).json({ error: 'Artwork file is required' });
    }

    console.log('Processing artwork:', artworkFile.filename, artworkFile.mimeType);

    // Get access token
    const accessToken = await getAccessToken();
    console.log('Got Adobe access token');

    // Upload artwork image
    const artworkAssetID = await uploadAsset(
      accessToken,
      artworkFile.buffer,
      artworkFile.mimeType || 'image/png'
    );
    console.log('Uploaded artwork, assetID:', artworkAssetID);

    // Create PDF from artwork image
    const artworkPDFUri = await createPDFFromImage(accessToken, artworkAssetID);
    console.log('Created PDF from artwork');

    let finalPDFBuffer;

    if (templateFile) {
      // Download the artwork PDF first
      const artworkPDFBuffer = await downloadFile(artworkPDFUri);

      // Upload artwork PDF
      const artworkPDFAssetID = await uploadAsset(accessToken, artworkPDFBuffer, 'application/pdf');

      // Upload template PDF
      const templateAssetID = await uploadAsset(
        accessToken,
        templateFile.buffer,
        'application/pdf'
      );
      console.log('Uploaded template PDF');

      // Combine PDFs (template first as background, then artwork)
      const combinedPDFUri = await combinePDFs(accessToken, [templateAssetID, artworkPDFAssetID]);
      finalPDFBuffer = await downloadFile(combinedPDFUri);
      console.log('Combined PDFs');
    } else {
      // Just use the artwork PDF
      finalPDFBuffer = await downloadFile(artworkPDFUri);
    }

    // Return PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="print-ready-${Date.now()}.pdf"`);
    return res.send(finalPDFBuffer);

  } catch (error) {
    console.error('Adobe PDF API Error:', error);
    return res.status(500).json({
      error: error.message || 'PDF processing failed',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
