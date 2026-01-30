# 🚀 PrintPilot API - GitHub to Vercel Setup

## Brzi Setup (5 minuta):

### 1️⃣ Kreiraj GitHub Repo

1. Idi na https://github.com/new
2. **Repository name:** `printpilot-api`
3. **Description:** "Background removal API for PrintPilot"
4. **Public** ili **Private** - kako želiš
5. ❌ **NE** check-uj "Add README" (već imaš)
6. Klikni **Create repository**

### 2️⃣ Push Code na GitHub

GitHub će ti pokazati commands. Otvori terminal u folderu sa ovim fajlovima i pokreni:

```bash
git add .
git commit -m "Initial commit - Clipdrop API proxy"
git branch -M main
git remote add origin https://github.com/TVOJ-USERNAME/printpilot-api.git
git push -u origin main
```

**Zameni** `TVOJ-USERNAME` sa svojim GitHub username-om!

### 3️⃣ Deploy na Vercel

1. Idi na https://vercel.com/signup
2. Klikni **"Continue with GitHub"**
3. Autorizuj Vercel da vidi tvoje repo-je
4. Na Vercel dashboard-u klikni **"New Project"**
5. **Import** svoj `printpilot-api` repo
6. Framework Preset: **Other** (automatski detektuje)
7. Klikni **"Deploy"** 

**Gotovo!** 🎉

### 4️⃣ Uzmi URL i koristi ga

Posle deploy-a dobijaš URL kao:
```
https://printpilot-api-abc123.vercel.app
```

Kopiraj taj URL i koristi ga u svom HTML fajlu!

---

## 📝 Update HTML fajl da koristi API

U `printpilot-ai.html`, promeni background removal funkciju:

```javascript
// Na vrhu fajla dodaj:
const API_URL = 'https://tvoj-vercel-url.vercel.app'; // Stavi svoj URL ovde

// U background removal funkciji zameni sa:
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
    const img = new Image();
    img.onload = function() {
        uploadedImage = img;
        document.getElementById('imagePreview').src = data.image;
        updateCanvas();
        showSuccess('🎉 Background removed with Clipdrop AI!');
    };
    img.src = data.image;
}
```

---

## 🎯 Šta radiš kada:

**Git nije instaliran?**
```bash
# Windows: Download sa git-scm.com
# Mac: brew install git
# Linux: sudo apt install git
```

**GitHub traži username/password?**
- Koristi Personal Access Token umesto password-a
- Idi na: GitHub Settings → Developer Settings → Personal Access Tokens
- Generate New Token → repo permissions

**Vercel deployment failed?**
- Proveri da li `package.json` ima `form-data` dependency
- Check Vercel logs u dashboard-u

---

## 💰 Troškovi

- GitHub: **Besplatno** ✅
- Vercel: **Besplatno** (100GB bandwidth/mesečno) ✅
- Clipdrop API: **100 poziva/mesečno besplatno** ✅

---

## 🔄 Auto-Deploy

Svaki put kad push-uješ izmene na GitHub, Vercel automatski deploy-uje novu verziju! 

```bash
git add .
git commit -m "Update API"
git push
```

---

## ✨ Gotovo!

Imaš production-ready API koji radi 24/7, besplatno! 🚀
