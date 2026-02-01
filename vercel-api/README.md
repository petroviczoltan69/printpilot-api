# PrintPilot API

Vercel Serverless API za PrintPilot AI.

## Setup

1. **Deploy na Vercel:**
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Dodaj Environment Variable na Vercel:**
   - Idi na: https://vercel.com/your-project/settings/environment-variables
   - Dodaj: `CLIPDROP_API_KEY` = tvoj Clipdrop API key

3. **Redeploy:**
   ```bash
   vercel --prod
   ```

## API Endpoints

### POST /api/remove-background

Uklanja pozadinu sa slike.

**Request:**
```json
{
  "imageData": "data:image/png;base64,..."
}
```

**Response:**
```json
{
  "success": true,
  "image": "data:image/png;base64,..."
}
```

## Clipdrop API

Registruj se na https://clipdrop.co/apis da dobijes API key.
