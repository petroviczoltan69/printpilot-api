# PrintPilot API - Vercel Serverless

Background removal API proxy za PrintPilot koristeći Clipdrop AI.

## 🚀 Kako deploy-ovati na Vercel:

### 1. Instalacija Vercel CLI

```bash
npm install -g vercel
```

### 2. Login u Vercel

```bash
vercel login
```

Unesi email i klikni link koji dobiješ.

### 3. Deploy

Iz ovog foldera pokreni:

```bash
vercel
```

Odgovori na pitanja:
- Set up and deploy? **Y**
- Which scope? Tvoj username
- Link to existing project? **N**
- Project name? **printpilot-api**
- Directory? **./** (samo enter)
- Override settings? **N**

### 4. Produkcioni Deploy

```bash
vercel --prod
```

Dobijaš URL tipa: `https://printpilot-api.vercel.app`

## 📝 Korišćenje u frontend-u

Kada dobiješ Vercel URL, update-uj HTML fajl:

```javascript
const API_URL = 'https://printpilot-api.vercel.app';

// U background removal funkciji:
const response = await fetch(`${API_URL}/api/remove-background`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        imageData: originalImageData
    })
});

const data = await response.json();
if (data.success) {
    // Učitaj obrađenu sliku
    uploadedImage.src = data.image;
}
```

## 🎉 Gotovo!

API će biti dostupan 24/7, besplatno, sa automatskim scaling-om!

## Troubleshooting

Ako dobijaš greške:
1. Proveri da li je `form-data` instaliran: `npm install`
2. Proveri Vercel logs: `vercel logs`
3. Proveri da li imaš credits na Clipdrop nalogu
