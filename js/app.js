// PrintPilot - Main Application
// Redesigned with step-by-step wizard and multiple design modes

// ========== Configuration ==========
const CONFIG = {
    API_URL: 'https://printpilot-api.vercel.app'
};

// Helper function to draw AI background with contain fit + scale/position controls
function drawAIBackground(ctx, img, canvasWidth, canvasHeight, scale, posX, posY) {
    const imgRatio = img.width / img.height;
    const canvasRatio = canvasWidth / canvasHeight;

    let baseWidth, baseHeight;

    // Contain fit - fit entire image inside canvas
    if (imgRatio > canvasRatio) {
        // Image is wider - fit by width
        baseWidth = canvasWidth;
        baseHeight = canvasWidth / imgRatio;
    } else {
        // Image is taller - fit by height
        baseHeight = canvasHeight;
        baseWidth = canvasHeight * imgRatio;
    }

    // Apply scale (100 = base contain size)
    const scaleFactor = scale / 100;
    const drawWidth = baseWidth * scaleFactor;
    const drawHeight = baseHeight * scaleFactor;

    // Calculate position based on posX/posY (0-100 range, 50 = centered)
    // When image is smaller than canvas, 0 = left edge, 100 = right edge
    // When image is larger than canvas, 0 = show left part, 100 = show right part
    const maxOffsetX = canvasWidth - drawWidth;
    const maxOffsetY = canvasHeight - drawHeight;

    const offsetX = maxOffsetX * (posX / 100);
    const offsetY = maxOffsetY * (posY / 100);

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
}

// ========== Product Data ==========
const PRODUCTS = {
    'vinyl-banner': {
        name: 'Vinyl Banner',
        category: 'banners',
        sizes: [
            { label: '2ft x 4ft', width: 2, height: 4, price: 29.99 },
            { label: '3ft x 6ft', width: 3, height: 6, price: 49.99 },
            { label: '4ft x 8ft', width: 4, height: 8, price: 79.99 },
            { label: '5ft x 10ft', width: 5, height: 10, price: 119.99 }
        ],
        options: [
            { id: 'grommets', label: 'Grommets (Metal eyelets)', price: 0, default: true },
            { id: 'pole-pockets', label: 'Pole Pockets', price: 10 },
            { id: 'hemmed', label: 'Hemmed Edges', price: 5 }
        ],
        canvasRatio: 2
    },
    'mesh-banner': {
        name: 'Mesh Banner',
        category: 'banners',
        sizes: [
            { label: '3ft x 6ft', width: 3, height: 6, price: 39.99 },
            { label: '4ft x 8ft', width: 4, height: 8, price: 69.99 },
            { label: '5ft x 10ft', width: 5, height: 10, price: 99.99 }
        ],
        options: [
            { id: 'grommets', label: 'Grommets', price: 0, default: true },
            { id: 'wind-slits', label: 'Wind Slits', price: 15 }
        ],
        canvasRatio: 2
    },
    'photo-backdrop': {
        name: 'Photo Backdrop',
        category: 'banners',
        sizes: [
            { label: '6ft x 6ft', width: 6, height: 6, price: 89.99 },
            { label: '8ft x 8ft', width: 8, height: 8, price: 129.99 },
            { label: '8ft x 10ft', width: 8, height: 10, price: 159.99 },
            { label: '10ft x 10ft', width: 10, height: 10, price: 199.99 }
        ],
        options: [
            { id: 'stand', label: 'Include Stand', price: 49.99 },
            { id: 'carry-bag', label: 'Carry Bag', price: 19.99 }
        ],
        canvasRatio: 1
    },
    'retractable-banner': {
        name: 'Retractable Banner',
        category: 'banners',
        sizes: [
            { label: '23" x 66"', width: 23, height: 66, price: 69.99 },
            { label: '24" x 81"', width: 24, height: 81, price: 79.99 },
            { label: '33" x 81"', width: 33, height: 81, price: 99.99 },
            { label: '47" x 81"', width: 47, height: 81, price: 149.99 }
        ],
        options: [
            { id: 'uv-fabric', label: 'UV Printed Fabric (Recommended)', price: 0, default: true },
            { id: 'matte-vinyl', label: '13oz Matte Vinyl', price: 0 },
            { id: 'led-light', label: 'LED Light', price: 49.99 },
            { id: 'travel-bag', label: 'Travel Bag (Included)', price: 0, default: true }
        ],
        // Print specifications from BS.run catalog
        printSpecs: {
            materials: ['UV Printed Coated Polyester Fabric', '13 oz. Matte Vinyl Banner'],
            safetyMargins: {
                top: 1,      // 1 inch from top
                bottom: 3,   // 3 inches from bottom (retractable mechanism)
                left: 0,
                right: 0
            },
            fileFormats: ['JPEG', 'PDF'],
            colorSpace: 'CMYK',
            resolution: 150,  // DPI - sufficient for large format
            maxFileSize: 300, // MB
            bleed: 0,         // No bleed required
            notes: 'Submit artwork built to ordered size. Do not include crop marks or bleeds.'
        },
        canvasRatio: 0.407  // 33/81 ratio for default size
    },
    'feather-flag': {
        name: 'Feather Flag',
        category: 'flags',
        sizes: [
            { label: 'X-Large (18ft)', width: 24, height: 183.5, price: 179.99 }
        ],
        options: [
            { id: 'ground-stake', label: 'Ground Stake (Soft ground)', price: 0, default: true },
            { id: 'cross-base', label: 'Cross Base (Hard surfaces)', price: 29.99 },
            { id: 'water-bag', label: 'Water Bag (For cross base)', price: 14.99 },
            { id: 'square-base', label: 'Square Base (Heavy duty)', price: 49.99 },
            { id: 'double-sided', label: 'Double Sided Print', price: 40 }
        ],
        // Print specifications from B2Sign
        printSpecs: {
            materials: ['4 oz Polyester mesh flag material'],
            method: 'Dye Sublimated',
            safetyMargins: {
                top: 0,
                bottom: 0,
                left: 0,
                right: 0
            },
            fileFormats: ['JPEG', 'PDF'],
            colorSpace: 'CMYK',
            resolution: 150,
            maxFileSize: 300,
            bleed: 0,
            notes: 'Submit artwork at ordered dimensions. No crop marks or bleeds. Convert fonts to outlines. No Pantone/Spot colors.'
        },
        canvasRatio: 0.2  // Tall narrow flag shape
    },
    'yard-sign': {
        name: 'Yard Signs',
        category: 'signs',
        sizes: [
            { label: '12" x 18"', width: 12, height: 18, price: 12.99 },
            { label: '18" x 24"', width: 18, height: 24, price: 19.99 },
            { label: '24" x 36"', width: 24, height: 36, price: 29.99 }
        ],
        options: [
            { id: 'h-stake', label: 'H-Stake (Metal)', price: 3.99, default: true },
            { id: 'wire-stake', label: 'Wire Stakes (2)', price: 2.99 },
            { id: 'double-sided', label: 'Double-Sided Print', price: 8 }
        ],
        canvasRatio: 0.67
    },
    'a-frame-sign': {
        name: 'A-Frame Signs',
        category: 'signs',
        sizes: [
            { label: '24" x 36"', width: 24, height: 36, price: 49.99 },
            { label: '24" x 48"', width: 24, height: 48, price: 69.99 }
        ],
        options: [
            { id: 'frame-black', label: 'Black Frame', price: 0, default: true },
            { id: 'frame-white', label: 'White Frame', price: 0 }
        ],
        canvasRatio: 0.67
    },
    'foam-board': {
        name: 'Foam Board Signs',
        category: 'signs',
        sizes: [
            { label: '11" x 17"', width: 11, height: 17, price: 19.99 },
            { label: '18" x 24"', width: 18, height: 24, price: 29.99 },
            { label: '24" x 36"', width: 24, height: 36, price: 44.99 }
        ],
        options: [
            { id: 'easel', label: 'Easel Back', price: 5.99 },
            { id: 'mounting', label: 'Mounting Tape', price: 2.99 }
        ],
        canvasRatio: 0.65
    },
    'acrylic-sign': {
        name: 'Acrylic Signs',
        category: 'signs',
        sizes: [
            { label: '8" x 10"', width: 8, height: 10, price: 59.99 },
            { label: '12" x 16"', width: 12, height: 16, price: 89.99 },
            { label: '18" x 24"', width: 18, height: 24, price: 149.99 }
        ],
        options: [
            { id: 'standoffs', label: 'Standoff Mounts', price: 19.99 },
            { id: 'frosted', label: 'Frosted Finish', price: 15 }
        ],
        canvasRatio: 0.8
    },
    'popup-display': {
        name: 'Pop-up Displays',
        category: 'tradeshow',
        sizes: [
            { label: '8ft Curved', width: 8, height: 7.5, price: 299.99 },
            { label: '10ft Curved', width: 10, height: 7.5, price: 399.99 },
            { label: '8ft Straight', width: 8, height: 7.5, price: 279.99 },
            { label: '10ft Straight', width: 10, height: 7.5, price: 379.99 }
        ],
        options: [
            { id: 'lights', label: 'Halogen Lights (2)', price: 79.99 },
            { id: 'case', label: 'Hard Case with Wheels', price: 149.99 }
        ],
        canvasRatio: 1.3
    },
    'canopy-tent': {
        name: 'Canopy Tents',
        category: 'tradeshow',
        sizes: [
            { label: '10ft x 10ft', width: 10, height: 10, price: 399.99 },
            { label: '10ft x 15ft', width: 10, height: 15, price: 549.99 },
            { label: '10ft x 20ft', width: 10, height: 20, price: 699.99 }
        ],
        options: [
            { id: 'walls', label: 'Side Walls (4)', price: 199.99 },
            { id: 'weights', label: 'Weight Bags (4)', price: 49.99 },
            { id: 'roller-bag', label: 'Roller Bag', price: 79.99 }
        ],
        canvasRatio: 1
    },
    'fabric-backdrop': {
        name: 'Fabric Backdrops',
        category: 'tradeshow',
        sizes: [
            { label: '8ft x 8ft', width: 8, height: 8, price: 149.99 },
            { label: '10ft x 8ft', width: 10, height: 8, price: 199.99 },
            { label: '10ft x 10ft', width: 10, height: 10, price: 249.99 }
        ],
        options: [
            { id: 'frame', label: 'Tension Frame', price: 149.99 },
            { id: 'carry-bag', label: 'Carry Bag', price: 29.99 }
        ],
        canvasRatio: 1
    }
};

// ========== State Management ==========
let state = {
    cart: [],
    currentProduct: null,
    currentStep: 1,
    selectedSize: null,
    selectedOptions: [],
    designType: null,
    uploadedImage: null,
    originalImageData: null,
    backgroundImage: null,
    backgroundType: 'solid',
    // AI background controls
    aiBgScale: 100,
    aiBgX: 50,
    aiBgY: 50,
    textElements: [],
    // Photo mode controls
    photoImageScale: 100,
    photoImageX: 0.5,
    photoImageY: 0.5,
    photoFitMode: 'cover',
    gradDirection: 'horizontal',
    // Text layers (up to 3)
    photoTextLayers: [
        { enabled: false, text: '', x: 0.5, y: 0.2, size: 48, font: 'Impact', color: '#000000' },
        { enabled: false, text: '', x: 0.5, y: 0.5, size: 32, font: 'Impact', color: '#ffffff' },
        { enabled: false, text: '', x: 0.5, y: 0.85, size: 24, font: 'Impact', color: '#ffcc00' }
    ],
    // Logo mode
    logoImage: null,
    patternStyle: 'diagonal',
    logoSize: 150,
    patternSpacing: 20,
    patternBgColor: '#ffffff',
    // New pattern controls
    patternRotation: 0,
    patternOffsetX: 0,
    patternOffsetY: 0,
    // Single logo controls
    singleLogoSize: 200,
    singleLogoX: 0.5,  // 0-1 ratio of canvas width
    singleLogoY: 0.5,  // 0-1 ratio of canvas height
    // Single logo text
    showSingleText: false,
    singleText: 'YOUR LOGO',
    singleTextFont: 'Arial Black',
    singleTextColor: '#333333',
    showSingleTagline: false,
    singleTagline: 'TAGLINE HERE',
    singleTaglineFont: 'Arial',
    singleTaglineColor: '#666666',
    // Highlight mode controls
    highlightSize: 250,
    highlightLogoX: 0.5,  // 0-1 ratio of canvas width
    highlightLogoY: 0.5,  // 0-1 ratio of canvas height
    // Highlight background
    showHighlightBg: false,
    highlightBgSize: 120,
    highlightBgColor: '#ffffff',
    highlightBgShape: 'rectangle',
    // Highlight text
    showHighlightText: true,
    highlightText: 'YOUR LOGO',
    highlightTextFont: 'Arial Black',
    highlightTextColor: '#333333',
    showHighlightTagline: true,
    highlightTagline: 'TAGLINE HERE',
    highlightTaglineFont: 'Arial',
    highlightTaglineColor: '#666666',
    // SVG support
    logoSvgData: null,  // stores original SVG string for vector export
};

// ========== DOM Elements ==========
let canvas, ctx, finalCanvas, finalCtx;

// ========== Initialize ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('PrintPilot initialized');

    // Initialize canvases
    canvas = document.getElementById('previewCanvas');
    if (canvas) {
        ctx = canvas.getContext('2d');
    }

    finalCanvas = document.getElementById('finalCanvas');
    if (finalCanvas) {
        finalCtx = finalCanvas.getContext('2d');
    }

    // Load cart from localStorage
    const savedCart = localStorage.getItem('printpilot_cart');
    if (savedCart) {
        state.cart = JSON.parse(savedCart);
        updateCartUI();
    }

    // Initialize event listeners
    initEventListeners();

    // Initialize mockup view toggle
    initMockupViewToggle();

    // Initial canvas draw
    if (ctx) updateCanvas();

    // Bleed marks toggle
    const showBleedMarks = document.getElementById('showBleedMarks');
    const showSafeArea = document.getElementById('showSafeArea');
    const bleedOverlay = document.getElementById('bleedOverlay');
    const safeArea = document.getElementById('safeArea');

    if (showBleedMarks) {
        showBleedMarks.addEventListener('change', function() {
            if (bleedOverlay) {
                bleedOverlay.classList.toggle('active', this.checked);
            }
        });
    }

    if (showSafeArea) {
        showSafeArea.addEventListener('change', function() {
            if (safeArea) {
                safeArea.style.display = this.checked ? 'block' : 'none';
            }
        });
    }
});

// ========== Event Listeners ==========
function initEventListeners() {
    // Category tabs
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', handleCategoryFilter);
    });

    // Product cards
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', handleProductSelect);
    });

    // Back to products
    const backBtn = document.getElementById('backToProducts');
    if (backBtn) {
        backBtn.addEventListener('click', backToProducts);
    }

    // Wizard navigation - FIX: Direct click handlers
    document.getElementById('step1Next')?.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Step 1 Next clicked');
        goToStep(2);
    });

    document.getElementById('step2Back')?.addEventListener('click', function(e) {
        e.preventDefault();
        goToStep(1);
    });

    document.getElementById('step2Next')?.addEventListener('click', function(e) {
        e.preventDefault();
        if (!this.disabled) {
            goToStep(3);
        }
    });

    document.getElementById('step3Back')?.addEventListener('click', function(e) {
        e.preventDefault();
        goToStep(2);
    });

    document.getElementById('step3Next')?.addEventListener('click', function(e) {
        e.preventDefault();
        goToStep(4);
    });

    document.getElementById('step4Back')?.addEventListener('click', function(e) {
        e.preventDefault();
        goToStep(3);
    });

    // Design type selection
    document.querySelectorAll('.design-type-card:not(.disabled)').forEach(card => {
        card.addEventListener('click', handleDesignTypeSelect);
    });

    // Photo mode controls
    initPhotoControls();

    // Logo mode controls
    initLogoControls();

    // Cart
    document.getElementById('cartBtn')?.addEventListener('click', openCart);
    document.getElementById('closeCart')?.addEventListener('click', closeCartModal);
    document.getElementById('addToCart')?.addEventListener('click', handleAddToCart);
    document.querySelector('.modal-backdrop')?.addEventListener('click', closeCartModal);

    // PDF Download
    document.getElementById('downloadPDF')?.addEventListener('click', downloadPDF);
}

// ========== Photo Mode Controls ==========
function initPhotoControls() {
    const uploadZone = document.getElementById('uploadZone');
    const imageUpload = document.getElementById('imageUpload');

    if (uploadZone && imageUpload) {
        uploadZone.addEventListener('click', () => imageUpload.click());
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });
        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });
        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            if (e.dataTransfer.files.length) {
                imageUpload.files = e.dataTransfer.files;
                handleImageUpload({ target: imageUpload });
            }
        });
        imageUpload.addEventListener('change', handleImageUpload);
    }

    document.getElementById('removeImage')?.addEventListener('click', () => {
        state.uploadedImage = null;
        state.originalImageData = null;
        document.getElementById('uploadedImage')?.classList.add('hidden');
        document.getElementById('uploadZone')?.classList.remove('hidden');
        document.getElementById('removeBackground')?.classList.add('hidden');
        document.getElementById('photoImageControls')?.classList.add('hidden');
        updateCanvas();
    });

    document.getElementById('removeBackground')?.addEventListener('click', removeBackground);

    document.querySelectorAll('.bg-type-btn').forEach(btn => {
        btn.addEventListener('click', handleBackgroundTypeChange);
    });

    document.getElementById('bgColor')?.addEventListener('input', updateCanvas);
    document.getElementById('gradColor1')?.addEventListener('input', updateCanvas);
    document.getElementById('gradColor2')?.addEventListener('input', updateCanvas);
    document.getElementById('generateBackground')?.addEventListener('click', generateAIBackground);

    // AI Background controls
    document.getElementById('aiBgScale')?.addEventListener('input', function() {
        state.aiBgScale = parseInt(this.value);
        document.getElementById('aiBgScaleValue').textContent = this.value;
        updateCanvas();
    });
    document.getElementById('aiBgX')?.addEventListener('input', function() {
        state.aiBgX = parseInt(this.value);
        document.getElementById('aiBgXValue').textContent = this.value;
        updateCanvas();
    });
    document.getElementById('aiBgY')?.addEventListener('input', function() {
        state.aiBgY = parseInt(this.value);
        document.getElementById('aiBgYValue').textContent = this.value;
        updateCanvas();
    });

    // Gradient direction
    document.getElementById('gradDirection')?.addEventListener('change', function() {
        state.gradDirection = this.value;
        updateCanvas();
    });

    // Photo image scale
    const photoImageScale = document.getElementById('photoImageScale');
    if (photoImageScale) {
        photoImageScale.addEventListener('input', function() {
            state.photoImageScale = parseInt(this.value);
            document.getElementById('photoImageScaleValue').textContent = this.value + '%';
            updateCanvas();
        });
    }

    // Photo fit mode
    document.getElementById('photoFitMode')?.addEventListener('change', function() {
        state.photoFitMode = this.value;
        updateCanvas();
    });

    // Photo position buttons
    document.querySelectorAll('.position-btn[data-target="photo"]').forEach(btn => {
        btn.addEventListener('click', handlePhotoPositionChange);
    });

    // Text layer toggles
    document.querySelectorAll('.text-layer-toggle').forEach(toggle => {
        toggle.addEventListener('change', function() {
            const layer = parseInt(this.dataset.layer);
            state.photoTextLayers[layer].enabled = this.checked;
            const settings = document.querySelector(`.text-layer-settings[data-layer="${layer}"]`);
            if (settings) settings.classList.toggle('hidden', !this.checked);
            updateCanvas();
        });
    });

    // Text layer content
    document.querySelectorAll('.text-layer-content').forEach(input => {
        input.addEventListener('input', function() {
            const layer = parseInt(this.dataset.layer);
            state.photoTextLayers[layer].text = this.value;
            updateCanvas();
        });
    });

    // Text layer color
    document.querySelectorAll('.text-layer-color').forEach(input => {
        input.addEventListener('input', function() {
            const layer = parseInt(this.dataset.layer);
            state.photoTextLayers[layer].color = this.value;
            updateCanvas();
        });
    });

    // Text layer size
    document.querySelectorAll('.text-layer-size').forEach(input => {
        input.addEventListener('input', function() {
            const layer = parseInt(this.dataset.layer);
            state.photoTextLayers[layer].size = parseInt(this.value);
            const sizeValue = document.querySelector(`.text-layer-size-value[data-layer="${layer}"]`);
            if (sizeValue) sizeValue.textContent = this.value + 'px';
            updateCanvas();
        });
    });

    // Text layer font
    document.querySelectorAll('.text-layer-font').forEach(select => {
        select.addEventListener('change', function() {
            const layer = parseInt(this.dataset.layer);
            state.photoTextLayers[layer].font = this.value;
            updateCanvas();
        });
    });

    // Text layer position buttons
    document.querySelectorAll('.text-pos-btn').forEach(btn => {
        btn.addEventListener('click', handleTextPositionChange);
    });
}

// Handle photo position change
function handlePhotoPositionChange(e) {
    const btn = e.target.closest('.position-btn');
    if (!btn) return;

    const direction = btn.dataset.direction;
    const step = 0.05;

    switch (direction) {
        case 'up':
            state.photoImageY = Math.max(0, state.photoImageY - step);
            break;
        case 'down':
            state.photoImageY = Math.min(1, state.photoImageY + step);
            break;
        case 'left':
            state.photoImageX = Math.max(0, state.photoImageX - step);
            break;
        case 'right':
            state.photoImageX = Math.min(1, state.photoImageX + step);
            break;
        case 'center':
            state.photoImageX = 0.5;
            state.photoImageY = 0.5;
            break;
    }
    updateCanvas();
}

// Handle text layer position change
function handleTextPositionChange(e) {
    const btn = e.target.closest('.text-pos-btn');
    if (!btn) return;

    const layer = parseInt(btn.dataset.layer);
    const direction = btn.dataset.direction;
    const step = 0.03;

    switch (direction) {
        case 'up':
            state.photoTextLayers[layer].y = Math.max(0.05, state.photoTextLayers[layer].y - step);
            break;
        case 'down':
            state.photoTextLayers[layer].y = Math.min(0.95, state.photoTextLayers[layer].y + step);
            break;
        case 'left':
            state.photoTextLayers[layer].x = Math.max(0.1, state.photoTextLayers[layer].x - step);
            break;
        case 'right':
            state.photoTextLayers[layer].x = Math.min(0.9, state.photoTextLayers[layer].x + step);
            break;
        case 'center':
            state.photoTextLayers[layer].x = 0.5;
            // Keep Y position when centering horizontally
            break;
    }
    updateCanvas();
}

// ========== Logo Mode Controls ==========
function initLogoControls() {
    const logoUploadZone = document.getElementById('logoUploadZone');
    const logoUpload = document.getElementById('logoUpload');

    if (logoUploadZone && logoUpload) {
        logoUploadZone.addEventListener('click', () => logoUpload.click());
        logoUploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            logoUploadZone.classList.add('dragover');
        });
        logoUploadZone.addEventListener('dragleave', () => {
            logoUploadZone.classList.remove('dragover');
        });
        logoUploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            logoUploadZone.classList.remove('dragover');
            if (e.dataTransfer.files.length) {
                logoUpload.files = e.dataTransfer.files;
                handleLogoUpload({ target: logoUpload });
            }
        });
        logoUpload.addEventListener('change', handleLogoUpload);
    }

    document.getElementById('removeLogo')?.addEventListener('click', () => {
        state.logoImage = null;
        state.logoSvgData = null;
        document.getElementById('uploadedLogo')?.classList.add('hidden');
        document.getElementById('logoUploadZone')?.classList.remove('hidden');
        updateCanvas();
    });

    document.querySelectorAll('.pattern-btn').forEach(btn => {
        btn.addEventListener('click', handlePatternStyleChange);
    });

    // Pattern controls
    const logoSize = document.getElementById('logoSize');
    const patternSpacing = document.getElementById('patternSpacing');
    const patternBgColor = document.getElementById('patternBgColor');
    const patternRotation = document.getElementById('patternRotation');
    const patternOffsetX = document.getElementById('patternOffsetX');
    const patternOffsetY = document.getElementById('patternOffsetY');

    if (logoSize) {
        logoSize.addEventListener('input', function() {
            state.logoSize = parseInt(this.value);
            document.getElementById('logoSizeValue').textContent = this.value + 'px';
            updateCanvas();
        });
    }
    if (patternSpacing) {
        patternSpacing.addEventListener('input', function() {
            state.patternSpacing = parseInt(this.value);
            document.getElementById('spacingValue').textContent = this.value + 'px';
            updateCanvas();
        });
    }
    if (patternBgColor) {
        patternBgColor.addEventListener('input', function() {
            state.patternBgColor = this.value;
            updateCanvas();
        });
    }
    if (patternRotation) {
        patternRotation.addEventListener('input', function() {
            state.patternRotation = parseInt(this.value);
            document.getElementById('rotationValue').textContent = this.value + '°';
            updateCanvas();
        });
    }
    if (patternOffsetX) {
        patternOffsetX.addEventListener('input', function() {
            state.patternOffsetX = parseInt(this.value);
            document.getElementById('offsetXValue').textContent = this.value + 'px';
            updateCanvas();
        });
    }
    if (patternOffsetY) {
        patternOffsetY.addEventListener('input', function() {
            state.patternOffsetY = parseInt(this.value);
            document.getElementById('offsetYValue').textContent = this.value + 'px';
            updateCanvas();
        });
    }

    // Single logo controls
    const singleLogoSize = document.getElementById('singleLogoSize');
    const singleBgColor = document.getElementById('singleBgColor');

    if (singleLogoSize) {
        singleLogoSize.addEventListener('input', function() {
            state.singleLogoSize = parseInt(this.value);
            document.getElementById('singleLogoSizeValue').textContent = this.value + 'px';
            updateCanvas();
        });
    }
    if (singleBgColor) {
        singleBgColor.addEventListener('input', function() {
            state.patternBgColor = this.value;
            updateCanvas();
        });
    }

    // Single logo text controls
    const showSingleText = document.getElementById('showSingleText');
    const singleTextInput = document.getElementById('singleText');
    const singleTextFont = document.getElementById('singleTextFont');
    const singleTextColor = document.getElementById('singleTextColor');
    const showSingleTagline = document.getElementById('showSingleTagline');
    const singleTaglineInput = document.getElementById('singleTagline');
    const singleTaglineFont = document.getElementById('singleTaglineFont');
    const singleTaglineColor = document.getElementById('singleTaglineColor');

    if (showSingleText) {
        showSingleText.addEventListener('change', function() {
            state.showSingleText = this.checked;
            const textSettings = document.getElementById('singleTextSettings');
            if (textSettings) textSettings.classList.toggle('hidden', !this.checked);
            updateCanvas();
        });
    }
    if (singleTextInput) {
        singleTextInput.addEventListener('input', function() {
            state.singleText = this.value;
            updateCanvas();
        });
    }
    if (singleTextFont) {
        singleTextFont.addEventListener('change', function() {
            state.singleTextFont = this.value;
            updateCanvas();
        });
    }
    if (singleTextColor) {
        singleTextColor.addEventListener('input', function() {
            state.singleTextColor = this.value;
            updateCanvas();
        });
    }
    if (showSingleTagline) {
        showSingleTagline.addEventListener('change', function() {
            state.showSingleTagline = this.checked;
            const taglineSettings = document.getElementById('singleTaglineSettings');
            if (taglineSettings) taglineSettings.classList.toggle('hidden', !this.checked);
            updateCanvas();
        });
    }
    if (singleTaglineInput) {
        singleTaglineInput.addEventListener('input', function() {
            state.singleTagline = this.value;
            updateCanvas();
        });
    }
    if (singleTaglineFont) {
        singleTaglineFont.addEventListener('change', function() {
            state.singleTaglineFont = this.value;
            updateCanvas();
        });
    }
    if (singleTaglineColor) {
        singleTaglineColor.addEventListener('input', function() {
            state.singleTaglineColor = this.value;
            updateCanvas();
        });
    }

    // Position buttons for single logo
    document.querySelectorAll('.position-btn').forEach(btn => {
        btn.addEventListener('click', handlePositionChange);
    });

    // Highlight controls
    const highlightSize = document.getElementById('highlightSize');

    // Highlight background controls
    const showHighlightBg = document.getElementById('showHighlightBg');
    const highlightBgSize = document.getElementById('highlightBgSize');
    const highlightBgColor = document.getElementById('highlightBgColor');
    const highlightBgShape = document.getElementById('highlightBgShape');

    // Highlight text controls
    const showHighlightText = document.getElementById('showHighlightText');
    const highlightText = document.getElementById('highlightText');
    const highlightTextFont = document.getElementById('highlightTextFont');
    const highlightTextColor = document.getElementById('highlightTextColor');

    // Highlight tagline controls
    const showHighlightTagline = document.getElementById('showHighlightTagline');
    const highlightTagline = document.getElementById('highlightTagline');
    const highlightTaglineFont = document.getElementById('highlightTaglineFont');
    const highlightTaglineColor = document.getElementById('highlightTaglineColor');

    if (highlightSize) {
        highlightSize.addEventListener('input', function() {
            state.highlightSize = parseInt(this.value);
            document.getElementById('highlightSizeValue').textContent = this.value + 'px';
            updateCanvas();
        });
    }

    // Highlight background
    if (showHighlightBg) {
        showHighlightBg.addEventListener('change', function() {
            state.showHighlightBg = this.checked;
            const bgSettings = document.getElementById('highlightBgSettings');
            if (bgSettings) bgSettings.classList.toggle('hidden', !this.checked);
            updateCanvas();
        });
    }
    if (highlightBgSize) {
        highlightBgSize.addEventListener('input', function() {
            state.highlightBgSize = parseInt(this.value);
            // Display as padding percentage (value - 100)
            document.getElementById('highlightBgSizeValue').textContent = (this.value - 100) + '%';
            updateCanvas();
        });
    }
    if (highlightBgColor) {
        highlightBgColor.addEventListener('input', function() {
            state.highlightBgColor = this.value;
            updateCanvas();
        });
    }
    if (highlightBgShape) {
        highlightBgShape.addEventListener('change', function() {
            state.highlightBgShape = this.value;
            updateCanvas();
        });
    }

    // Highlight text
    if (showHighlightText) {
        showHighlightText.addEventListener('change', function() {
            state.showHighlightText = this.checked;
            const textSettings = document.getElementById('highlightTextSettings');
            if (textSettings) textSettings.classList.toggle('hidden', !this.checked);
            updateCanvas();
        });
    }
    if (highlightText) {
        highlightText.addEventListener('input', function() {
            state.highlightText = this.value;
            updateCanvas();
        });
    }
    if (highlightTextFont) {
        highlightTextFont.addEventListener('change', function() {
            state.highlightTextFont = this.value;
            updateCanvas();
        });
    }
    if (highlightTextColor) {
        highlightTextColor.addEventListener('input', function() {
            state.highlightTextColor = this.value;
            updateCanvas();
        });
    }

    // Highlight tagline
    if (showHighlightTagline) {
        showHighlightTagline.addEventListener('change', function() {
            state.showHighlightTagline = this.checked;
            const taglineSettings = document.getElementById('highlightTaglineSettings');
            if (taglineSettings) taglineSettings.classList.toggle('hidden', !this.checked);
            updateCanvas();
        });
    }
    if (highlightTagline) {
        highlightTagline.addEventListener('input', function() {
            state.highlightTagline = this.value;
            updateCanvas();
        });
    }
    if (highlightTaglineFont) {
        highlightTaglineFont.addEventListener('change', function() {
            state.highlightTaglineFont = this.value;
            updateCanvas();
        });
    }
    if (highlightTaglineColor) {
        highlightTaglineColor.addEventListener('input', function() {
            state.highlightTaglineColor = this.value;
            updateCanvas();
        });
    }
}

// Handle position button clicks for single logo and highlight logo
function handlePositionChange(e) {
    const btn = e.target.closest('.position-btn');
    if (!btn) return;

    const direction = btn.dataset.direction;
    const target = btn.dataset.target || 'single'; // 'single' or 'highlight'
    const step = 0.05; // 5% of canvas

    if (target === 'highlight') {
        // Handle highlight logo position
        switch (direction) {
            case 'up':
                state.highlightLogoY = Math.max(0.1, state.highlightLogoY - step);
                break;
            case 'down':
                state.highlightLogoY = Math.min(0.9, state.highlightLogoY + step);
                break;
            case 'left':
                state.highlightLogoX = Math.max(0.1, state.highlightLogoX - step);
                break;
            case 'right':
                state.highlightLogoX = Math.min(0.9, state.highlightLogoX + step);
                break;
            case 'center':
                state.highlightLogoX = 0.5;
                state.highlightLogoY = 0.5;
                break;
        }
    } else {
        // Handle single logo position
        switch (direction) {
            case 'up':
                state.singleLogoY = Math.max(0.1, state.singleLogoY - step);
                break;
            case 'down':
                state.singleLogoY = Math.min(0.9, state.singleLogoY + step);
                break;
            case 'left':
                state.singleLogoX = Math.max(0.1, state.singleLogoX - step);
                break;
            case 'right':
                state.singleLogoX = Math.min(0.9, state.singleLogoX + step);
                break;
            case 'center':
                state.singleLogoX = 0.5;
                state.singleLogoY = 0.5;
                break;
        }
    }
    updateCanvas();
}

// ========== Category Filter ==========
function handleCategoryFilter(e) {
    const category = e.target.dataset.category;

    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    e.target.classList.add('active');

    document.querySelectorAll('.product-card').forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// ========== Product Selection ==========
function handleProductSelect(e) {
    const card = e.target.closest('.product-card');
    const productId = card.dataset.product;
    const product = PRODUCTS[productId];

    if (!product) return;

    // Reset design state for new product
    resetDesignState();

    state.currentProduct = { id: productId, ...product };
    state.selectedSize = product.sizes[0];
    state.selectedOptions = product.options.filter(o => o.default).map(o => o.id);
    state.currentStep = 1;

    // Show design studio
    document.getElementById('designStudio').classList.remove('hidden');
    document.getElementById('products').classList.add('hidden');
    document.querySelector('.hero')?.classList.add('hidden');
    document.querySelector('.how-it-works')?.classList.add('hidden');
    document.querySelector('.features-section')?.classList.add('hidden');

    // Populate options
    populateSizeOptions();
    populateAdditionalOptions();
    updatePriceSummary();

    // Reset wizard to step 1
    goToStep(1);

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== Reset Design State ==========
function resetDesignState() {
    state.designType = null;
    state.uploadedImage = null;
    state.originalImageData = null;
    state.backgroundImage = null;
    state.backgroundType = 'solid';
    // AI background reset
    state.aiBgScale = 100;
    state.aiBgX = 50;
    state.aiBgY = 50;
    state.textElements = [];
    // Photo mode reset
    state.photoImageScale = 100;
    state.photoImageX = 0.5;
    state.photoImageY = 0.5;
    state.photoFitMode = 'cover';
    state.gradDirection = 'horizontal';
    // Reset text layers
    state.photoTextLayers = [
        { enabled: false, text: '', x: 0.5, y: 0.2, size: 48, font: 'Impact', color: '#000000' },
        { enabled: false, text: '', x: 0.5, y: 0.5, size: 32, font: 'Impact', color: '#ffffff' },
        { enabled: false, text: '', x: 0.5, y: 0.85, size: 24, font: 'Impact', color: '#ffcc00' }
    ];
    // Logo mode
    state.logoImage = null;
    state.patternStyle = 'diagonal';
    state.logoSize = 150;
    state.patternSpacing = 20;
    state.patternBgColor = '#ffffff';
    state.patternRotation = 0;
    state.patternOffsetX = 0;
    state.patternOffsetY = 0;
    state.singleLogoSize = 200;
    state.singleLogoX = 0.5;
    state.singleLogoY = 0.5;
    state.showSingleText = false;
    state.singleText = 'YOUR LOGO';
    state.singleTextFont = 'Arial Black';
    state.singleTextColor = '#333333';
    state.showSingleTagline = false;
    state.singleTagline = 'TAGLINE HERE';
    state.singleTaglineFont = 'Arial';
    state.singleTaglineColor = '#666666';
    state.highlightSize = 250;
    state.highlightLogoX = 0.5;
    state.highlightLogoY = 0.5;
    state.showHighlightBg = false;
    state.highlightBgSize = 120;
    state.highlightBgColor = '#ffffff';
    state.highlightBgShape = 'rectangle';
    state.showHighlightText = true;
    state.highlightText = 'YOUR LOGO';
    state.highlightTextFont = 'Arial Black';
    state.highlightTextColor = '#333333';
    state.showHighlightTagline = true;
    state.highlightTagline = 'TAGLINE HERE';
    state.highlightTaglineFont = 'Arial';
    state.highlightTaglineColor = '#666666';
    state.logoSvgData = null;

    // Reset UI elements
    document.getElementById('uploadedImage')?.classList.add('hidden');
    document.getElementById('uploadZone')?.classList.remove('hidden');
    document.getElementById('removeBackground')?.classList.add('hidden');
    document.getElementById('photoImageControls')?.classList.add('hidden');
    document.getElementById('uploadedLogo')?.classList.add('hidden');
    document.getElementById('logoUploadZone')?.classList.remove('hidden');

    // Reset text layer checkboxes and settings
    document.querySelectorAll('.text-layer-toggle').forEach(toggle => {
        toggle.checked = false;
    });
    document.querySelectorAll('.text-layer-settings').forEach(settings => {
        settings.classList.add('hidden');
    });
    document.querySelectorAll('.text-layer-content').forEach(input => {
        input.value = '';
    });

    // Reset design type selection
    document.querySelectorAll('.design-type-card').forEach(c => {
        c.classList.remove('selected');
    });

    // Disable step 2 next button
    const step2Next = document.getElementById('step2Next');
    if (step2Next) step2Next.disabled = true;

    // Reset background type buttons
    document.querySelectorAll('.bg-type-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.bg === 'solid') btn.classList.add('active');
    });

    document.getElementById('solidBgOptions')?.classList.remove('hidden');
    document.getElementById('gradientBgOptions')?.classList.add('hidden');
    document.getElementById('aiBgOptions')?.classList.add('hidden');

    // Reset color pickers
    const bgColor = document.getElementById('bgColor');
    if (bgColor) bgColor.value = '#ffffff';

    // Reset pattern buttons
    document.querySelectorAll('.pattern-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.pattern === 'diagonal') btn.classList.add('active');
    });

    // Reset sliders
    const logoSizeEl = document.getElementById('logoSize');
    const spacingEl = document.getElementById('patternSpacing');
    const patternBgEl = document.getElementById('patternBgColor');
    const rotationEl = document.getElementById('patternRotation');
    const offsetXEl = document.getElementById('patternOffsetX');
    const offsetYEl = document.getElementById('patternOffsetY');

    if (logoSizeEl) {
        logoSizeEl.value = 150;
        document.getElementById('logoSizeValue').textContent = '150px';
    }
    if (spacingEl) {
        spacingEl.value = 20;
        document.getElementById('spacingValue').textContent = '20px';
    }
    if (patternBgEl) patternBgEl.value = '#ffffff';
    if (rotationEl) {
        rotationEl.value = 0;
        document.getElementById('rotationValue').textContent = '0°';
    }
    if (offsetXEl) {
        offsetXEl.value = 0;
        document.getElementById('offsetXValue').textContent = '0px';
    }
    if (offsetYEl) {
        offsetYEl.value = 0;
        document.getElementById('offsetYValue').textContent = '0px';
    }

    // Reset single logo controls
    const singleLogoSizeEl = document.getElementById('singleLogoSize');
    if (singleLogoSizeEl) {
        singleLogoSizeEl.value = 200;
        document.getElementById('singleLogoSizeValue').textContent = '200px';
    }

    // Reset single logo text controls
    const showSingleTextEl = document.getElementById('showSingleText');
    const singleTextEl = document.getElementById('singleText');
    const singleTextFontEl = document.getElementById('singleTextFont');
    const singleTextColorEl = document.getElementById('singleTextColor');
    const singleTextSettings = document.getElementById('singleTextSettings');
    const showSingleTaglineEl = document.getElementById('showSingleTagline');
    const singleTaglineEl = document.getElementById('singleTagline');
    const singleTaglineFontEl = document.getElementById('singleTaglineFont');
    const singleTaglineColorEl = document.getElementById('singleTaglineColor');
    const singleTaglineSettings = document.getElementById('singleTaglineSettings');

    if (showSingleTextEl) showSingleTextEl.checked = false;
    if (singleTextEl) singleTextEl.value = 'YOUR LOGO';
    if (singleTextFontEl) singleTextFontEl.value = 'Arial Black';
    if (singleTextColorEl) singleTextColorEl.value = '#333333';
    if (singleTextSettings) singleTextSettings.classList.add('hidden');
    if (showSingleTaglineEl) showSingleTaglineEl.checked = false;
    if (singleTaglineEl) singleTaglineEl.value = 'TAGLINE HERE';
    if (singleTaglineFontEl) singleTaglineFontEl.value = 'Arial';
    if (singleTaglineColorEl) singleTaglineColorEl.value = '#666666';
    if (singleTaglineSettings) singleTaglineSettings.classList.add('hidden');

    // Reset highlight background controls
    const showHighlightBgEl = document.getElementById('showHighlightBg');
    const highlightBgSizeEl = document.getElementById('highlightBgSize');
    const highlightBgColorEl = document.getElementById('highlightBgColor');
    const highlightBgShapeEl = document.getElementById('highlightBgShape');
    const highlightBgSettings = document.getElementById('highlightBgSettings');

    if (showHighlightBgEl) showHighlightBgEl.checked = false;
    if (highlightBgSizeEl) {
        highlightBgSizeEl.value = 120;
        const sizeValue = document.getElementById('highlightBgSizeValue');
        if (sizeValue) sizeValue.textContent = '20%';
    }
    if (highlightBgColorEl) highlightBgColorEl.value = '#ffffff';
    if (highlightBgShapeEl) highlightBgShapeEl.value = 'rectangle';
    if (highlightBgSettings) highlightBgSettings.classList.add('hidden');

    // Reset highlight text/tagline controls
    const highlightSizeEl = document.getElementById('highlightSize');
    const showHighlightTextEl = document.getElementById('showHighlightText');
    const highlightTextEl = document.getElementById('highlightText');
    const highlightTextFontEl = document.getElementById('highlightTextFont');
    const highlightTextColorEl = document.getElementById('highlightTextColor');
    const highlightTextSettings = document.getElementById('highlightTextSettings');
    const showHighlightTaglineEl = document.getElementById('showHighlightTagline');
    const highlightTaglineEl = document.getElementById('highlightTagline');
    const highlightTaglineFontEl = document.getElementById('highlightTaglineFont');
    const highlightTaglineColorEl = document.getElementById('highlightTaglineColor');
    const highlightTaglineSettings = document.getElementById('highlightTaglineSettings');

    if (highlightSizeEl) {
        highlightSizeEl.value = 250;
        document.getElementById('highlightSizeValue').textContent = '250px';
    }
    if (showHighlightTextEl) showHighlightTextEl.checked = true;
    if (highlightTextEl) highlightTextEl.value = 'YOUR LOGO';
    if (highlightTextFontEl) highlightTextFontEl.value = 'Arial Black';
    if (highlightTextColorEl) highlightTextColorEl.value = '#333333';
    if (highlightTextSettings) highlightTextSettings.classList.remove('hidden');
    if (showHighlightTaglineEl) showHighlightTaglineEl.checked = true;
    if (highlightTaglineEl) highlightTaglineEl.value = 'TAGLINE HERE';
    if (highlightTaglineFontEl) highlightTaglineFontEl.value = 'Arial';
    if (highlightTaglineColorEl) highlightTaglineColorEl.value = '#666666';
    if (highlightTaglineSettings) highlightTaglineSettings.classList.remove('hidden');

    // Show/hide control panels
    document.getElementById('singleLogoControls')?.classList.add('hidden');
    document.getElementById('patternControls')?.classList.remove('hidden');
    document.getElementById('highlightControls')?.classList.add('hidden');

    // Clear text input
    const textContent = document.getElementById('textContent');
    if (textContent) textContent.value = '';
}

// ========== Back to Products ==========
function backToProducts() {
    document.getElementById('designStudio').classList.add('hidden');
    document.getElementById('products').classList.remove('hidden');
    document.querySelector('.hero')?.classList.remove('hidden');
    document.querySelector('.how-it-works')?.classList.remove('hidden');
    document.querySelector('.features-section')?.classList.remove('hidden');

    state.currentProduct = null;
    state.selectedSize = null;
    state.selectedOptions = [];
    resetDesignState();

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== Populate Size Options ==========
function populateSizeOptions() {
    const container = document.getElementById('sizeOptions');
    if (!container || !state.currentProduct) return;

    container.innerHTML = state.currentProduct.sizes.map((size, index) => `
        <label class="size-option ${index === 0 ? 'selected' : ''}">
            <input type="radio" name="size" value="${index}" ${index === 0 ? 'checked' : ''}>
            <span class="size-label">${size.label}</span>
            <span class="size-price">$${size.price.toFixed(2)}</span>
        </label>
    `).join('');

    container.querySelectorAll('input[name="size"]').forEach(input => {
        input.addEventListener('change', (e) => {
            state.selectedSize = state.currentProduct.sizes[parseInt(e.target.value)];
            container.querySelectorAll('.size-option').forEach(opt => opt.classList.remove('selected'));
            e.target.closest('.size-option').classList.add('selected');
            updatePriceSummary();
        });
    });
}

// ========== Populate Additional Options ==========
function populateAdditionalOptions() {
    const container = document.getElementById('additionalOptions');
    if (!container || !state.currentProduct) return;

    let html = '';

    // Add solid color selector for solid-table-throw product
    if (state.currentProduct.solidColors) {
        const colors = state.currentProduct.solidColors;
        state.solidTableColor = state.solidTableColor || colors[0];
        html += `
            <div class="solid-color-selector">
                <h4 class="options-subtitle">Select Color</h4>
                <div class="color-swatches">
                    ${colors.map((color, idx) => `
                        <button class="color-swatch ${state.solidTableColor === color ? 'selected' : ''}"
                                data-color="${color}"
                                style="background-color: ${color}; ${color === '#ffffff' ? 'border: 2px solid #ddd;' : ''}"
                                title="${getColorName(color)}">
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    if (state.currentProduct.options.length === 0 && !state.currentProduct.solidColors) {
        container.innerHTML = '<p class="no-options">No additional options available</p>';
        return;
    }

    html += state.currentProduct.options.map(option => `
        <label class="option-checkbox ${state.selectedOptions.includes(option.id) ? 'selected' : ''}">
            <input type="checkbox" value="${option.id}" ${state.selectedOptions.includes(option.id) ? 'checked' : ''}>
            <span class="option-label">${option.label}</span>
            <span class="option-price">${option.price > 0 ? '+$' + option.price.toFixed(2) : option.price < 0 ? '-$' + Math.abs(option.price).toFixed(2) : 'Included'}</span>
        </label>
    `).join('');

    container.innerHTML = html;

    // Add color swatch listeners
    container.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.addEventListener('click', (e) => {
            state.solidTableColor = e.target.dataset.color;
            container.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
            e.target.classList.add('selected');
            updateCanvas();
        });
    });

    container.querySelectorAll('input[type="checkbox"]').forEach(input => {
        input.addEventListener('change', (e) => {
            const optionId = e.target.value;
            if (e.target.checked) {
                state.selectedOptions.push(optionId);
                e.target.closest('.option-checkbox').classList.add('selected');
            } else {
                state.selectedOptions = state.selectedOptions.filter(id => id !== optionId);
                e.target.closest('.option-checkbox').classList.remove('selected');
            }
            updatePriceSummary();
        });
    });
}

// Helper function to get color name from hex
function getColorName(hex) {
    const colorNames = {
        '#000000': 'Black',
        '#ffffff': 'White',
        '#1a365d': 'Navy Blue',
        '#2c5282': 'Royal Blue',
        '#2d3748': 'Charcoal',
        '#742a2a': 'Burgundy',
        '#22543d': 'Forest Green',
        '#744210': 'Brown'
    };
    return colorNames[hex.toLowerCase()] || hex;
}

// ========== Update Price Summary ==========
function updatePriceSummary() {
    if (!state.currentProduct || !state.selectedSize) return;

    const basePrice = state.selectedSize.price;
    let optionsPrice = 0;

    state.selectedOptions.forEach(optionId => {
        const option = state.currentProduct.options.find(o => o.id === optionId);
        if (option) optionsPrice += option.price;
    });

    const total = basePrice + optionsPrice;

    const basePriceEl = document.getElementById('basePrice');
    const optionsPriceEl = document.getElementById('optionsPrice');
    const totalPriceEl = document.getElementById('totalPrice');

    if (basePriceEl) basePriceEl.textContent = '$' + basePrice.toFixed(2);
    if (optionsPriceEl) optionsPriceEl.textContent = '$' + optionsPrice.toFixed(2);
    if (totalPriceEl) totalPriceEl.textContent = '$' + total.toFixed(2);
}

// ========== Wizard Navigation ==========
function goToStep(step) {
    console.log('Going to step:', step);
    state.currentStep = step;

    // Update wizard step indicators
    document.querySelectorAll('.wizard-step').forEach(el => {
        const stepNum = parseInt(el.dataset.step);
        el.classList.remove('active', 'completed');
        if (stepNum < step) el.classList.add('completed');
        if (stepNum === step) el.classList.add('active');
    });

    // Show/hide content
    document.querySelectorAll('.wizard-content').forEach(el => {
        el.classList.remove('active');
    });

    const stepContent = document.getElementById(`step${step}`);
    if (stepContent) {
        stepContent.classList.add('active');
    }

    // Step-specific actions
    if (step === 3) {
        showDesignControls();
        updateCanvasSize();

        // Pre-load feather flag template and overlay if needed
        if (isFeatherFlagProduct()) {
            console.log('Pre-loading feather flag template and overlay...');
            loadFeatherFlagTemplate();
            loadFeatherFlagOverlay();
        }

        updateCanvas();
    }

    if (step === 4) {
        updateReviewPanel();
        copyToFinalCanvas();
    }

    // Scroll to top of studio
    const studio = document.getElementById('designStudio');
    if (studio) {
        studio.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// ========== Design Type Selection ==========
function handleDesignTypeSelect(e) {
    const card = e.target.closest('.design-type-card');
    if (!card || card.classList.contains('disabled')) return;

    state.designType = card.dataset.type;

    document.querySelectorAll('.design-type-card').forEach(c => {
        c.classList.remove('selected');
    });
    card.classList.add('selected');

    const nextBtn = document.getElementById('step2Next');
    if (nextBtn) nextBtn.disabled = false;
}

// ========== Show Design Controls ==========
function showDesignControls() {
    const photoControls = document.getElementById('photoControls');
    const logoControls = document.getElementById('logoControls');

    if (state.designType === 'photo') {
        photoControls?.classList.remove('hidden');
        logoControls?.classList.add('hidden');
    } else if (state.designType === 'logo') {
        photoControls?.classList.add('hidden');
        logoControls?.classList.remove('hidden');
    }
}

// ========== Update Canvas Size ==========
function updateCanvasSize() {
    if (!canvas || !state.currentProduct || !state.selectedSize) return;

    // Use actual product dimensions for correct aspect ratio
    const productWidth = state.selectedSize.width;
    const productHeight = state.selectedSize.height;

    // Calculate aspect ratio from actual dimensions
    let aspectRatio = productWidth / productHeight;

    // Use device pixel ratio for sharper rendering on high-DPI displays
    const dpr = window.devicePixelRatio || 1;

    // For feather flags, use the SVG template aspect ratio (viewBox 1944 x 13500)
    const isFeatherFlag = state.currentProduct === 'feather-flag';
    if (isFeatherFlag) {
        aspectRatio = 1944 / 13500; // SVG viewBox aspect ratio
    }

    // For very narrow products like feather flags, ensure minimum width for quality
    const isVeryNarrow = aspectRatio < 0.2;

    let displayWidth, displayHeight;

    if (isVeryNarrow) {
        // Feather flags: display width 200px, but render at higher resolution
        displayWidth = 200;
        displayHeight = displayWidth / aspectRatio;
    } else if (aspectRatio >= 1) {
        // Landscape or square
        displayWidth = 600;
        displayHeight = 600 / aspectRatio;
    } else {
        // Portrait
        displayHeight = 600;
        displayWidth = 600 * aspectRatio;
    }

    // Set canvas internal resolution higher for quality (4x for feather flags for better SVG text, dpr for others)
    const scaleFactor = isVeryNarrow ? 4 : dpr;
    canvas.width = displayWidth * scaleFactor;
    canvas.height = displayHeight * scaleFactor;

    // Set CSS display size
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';

    // Scale context to match - this makes all drawing operations work in display coordinates
    ctx.setTransform(scaleFactor, 0, 0, scaleFactor, 0, 0);

    // Enable high quality image smoothing for better SVG rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Store display dimensions for other functions to use
    canvas.displayWidth = displayWidth;
    canvas.displayHeight = displayHeight;

    if (finalCanvas) {
        finalCanvas.width = displayWidth * scaleFactor;
        finalCanvas.height = displayHeight * scaleFactor;
    }

    const previewSize = document.getElementById('previewSize');
    if (previewSize) {
        previewSize.textContent = state.selectedSize.label;
    }

    // Update safe area overlay based on product printSpecs
    updateSafeAreaOverlay(canvasWidth, canvasHeight, productWidth, productHeight);
}

// ========== Update Safe Area Overlay ==========
function updateSafeAreaOverlay(canvasWidth, canvasHeight, productWidth, productHeight) {
    const safeArea = document.getElementById('safeArea');
    if (!safeArea) return;

    const product = PRODUCTS[state.currentProduct];
    if (!product || !product.printSpecs || !product.printSpecs.safetyMargins) {
        // Default safe area for products without specific specs
        safeArea.style.inset = '8px';
        return;
    }

    const margins = product.printSpecs.safetyMargins;

    // Calculate pixel values based on canvas size and product dimensions
    // Product dimensions are in inches, convert to canvas pixels
    const pixelsPerInchX = canvasWidth / productWidth;
    const pixelsPerInchY = canvasHeight / productHeight;

    const topPx = Math.round(margins.top * pixelsPerInchY);
    const bottomPx = Math.round(margins.bottom * pixelsPerInchY);
    const leftPx = Math.round(margins.left * pixelsPerInchX);
    const rightPx = Math.round(margins.right * pixelsPerInchX);

    // Apply calculated margins to safe area element
    safeArea.style.top = topPx + 'px';
    safeArea.style.bottom = bottomPx + 'px';
    safeArea.style.left = leftPx + 'px';
    safeArea.style.right = rightPx + 'px';
    safeArea.style.inset = ''; // Clear inset to use individual values

    // Update label if margins are asymmetric
    if (margins.top !== margins.bottom) {
        safeArea.setAttribute('data-label', `Safe: Top ${margins.top}" / Bottom ${margins.bottom}"`);
    }
}

// ========== Image Upload ==========
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
        alert('File too large! Please use an image under 10MB.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            state.uploadedImage = img;
            state.originalImageData = event.target.result;
            // Reset position for new image
            state.photoImageX = 0.5;
            state.photoImageY = 0.5;
            state.photoImageScale = 100;

            const preview = document.getElementById('imagePreview');
            const uploadedContainer = document.getElementById('uploadedImage');
            const uploadZone = document.getElementById('uploadZone');
            const removeBtn = document.getElementById('removeBackground');
            const imageControls = document.getElementById('photoImageControls');

            if (preview) preview.src = event.target.result;
            if (uploadedContainer) uploadedContainer.classList.remove('hidden');
            if (uploadZone) uploadZone.classList.add('hidden');
            if (removeBtn) removeBtn.classList.remove('hidden');
            if (imageControls) imageControls.classList.remove('hidden');

            // Reset scale slider
            const scaleSlider = document.getElementById('photoImageScale');
            if (scaleSlider) {
                scaleSlider.value = 100;
                document.getElementById('photoImageScaleValue').textContent = '100%';
            }

            updateCanvas();
            showSuccess('Image uploaded successfully!');
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

// ========== Logo Upload ==========
function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
        alert('File too large! Please use an image under 10MB.');
        return;
    }

    const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');

    const reader = new FileReader();
    reader.onload = function(event) {
        // Store SVG data for vector PDF export
        if (isSvg) {
            state.logoSvgData = event.target.result;
        } else {
            state.logoSvgData = null;
        }

        const img = new Image();
        img.onload = function() {
            state.logoImage = img;

            const preview = document.getElementById('logoPreview');
            const uploadedContainer = document.getElementById('uploadedLogo');
            const uploadZone = document.getElementById('logoUploadZone');

            if (preview) preview.src = event.target.result;
            if (uploadedContainer) uploadedContainer.classList.remove('hidden');
            if (uploadZone) uploadZone.classList.add('hidden');

            updateCanvas();
            showSuccess(isSvg ? 'SVG logo uploaded! Best quality for PDF export.' : 'Logo uploaded successfully!');
        };
        img.src = event.target.result;
    };

    if (isSvg) {
        reader.readAsText(file);
        // Also read as data URL for preview
        const previewReader = new FileReader();
        previewReader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                state.logoImage = img;

                const preview = document.getElementById('logoPreview');
                const uploadedContainer = document.getElementById('uploadedLogo');
                const uploadZone = document.getElementById('logoUploadZone');

                if (preview) preview.src = event.target.result;
                if (uploadedContainer) uploadedContainer.classList.remove('hidden');
                if (uploadZone) uploadZone.classList.add('hidden');

                updateCanvas();
                showSuccess('SVG logo uploaded! Best quality for PDF export.');
            };
            img.src = event.target.result;
        };
        previewReader.readAsDataURL(file);

        // Read SVG text for storage
        reader.readAsText(file);
        reader.onload = function(event) {
            state.logoSvgData = event.target.result;
        };
    } else {
        state.logoSvgData = null;
        reader.readAsDataURL(file);
    }
}

// ========== Background Removal ==========
async function removeBackground() {
    if (!state.uploadedImage || !state.originalImageData) return;

    showLoading(true);

    try {
        const response = await fetch(`${CONFIG.API_URL}/api/remove-background`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageData: state.originalImageData })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'API request failed');
        }

        const data = await response.json();

        if (data.success && data.image) {
            const img = new Image();
            img.onload = function() {
                state.uploadedImage = img;
                document.getElementById('imagePreview').src = data.image;
                updateCanvas();
                showSuccess('Background removed successfully!');
            };
            img.src = data.image;
        } else {
            throw new Error('No processed image in response');
        }
    } catch (error) {
        console.error('Error:', error);
        alert(`Error removing background: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

// ========== Background Type Change ==========
function handleBackgroundTypeChange(e) {
    const btn = e.target.closest('.bg-type-btn');
    if (!btn) return;

    state.backgroundType = btn.dataset.bg;

    document.querySelectorAll('.bg-type-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    document.getElementById('solidBgOptions')?.classList.add('hidden');
    document.getElementById('gradientBgOptions')?.classList.add('hidden');
    document.getElementById('aiBgOptions')?.classList.add('hidden');
    document.getElementById('aiBgControls')?.classList.add('hidden');

    if (state.backgroundType === 'solid') {
        document.getElementById('solidBgOptions')?.classList.remove('hidden');
    } else if (state.backgroundType === 'gradient') {
        document.getElementById('gradientBgOptions')?.classList.remove('hidden');
    } else if (state.backgroundType === 'ai') {
        document.getElementById('aiBgOptions')?.classList.remove('hidden');
        // Show controls if AI background already exists
        if (state.backgroundImage) {
            document.getElementById('aiBgControls')?.classList.remove('hidden');
        }
    }

    updateCanvas();
}

// ========== AI Background Generation ==========
async function generateAIBackground() {
    const prompt = document.getElementById('aiPrompt')?.value.trim();

    if (!prompt) {
        alert('Please describe the background you want to generate');
        return;
    }

    showLoading(true);

    try {
        const response = await fetch(`${CONFIG.API_URL}/api/generate-background`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || errorData.details || 'Failed to generate image');
        }

        const data = await response.json();

        if (data.success && data.imageUrl) {
            const img = new Image();
            img.crossOrigin = "anonymous";

            img.onload = function() {
                state.backgroundImage = img;
                // Reset AI background controls to default
                state.aiBgScale = 100;
                state.aiBgX = 50;
                state.aiBgY = 50;
                // Update UI controls
                const scaleEl = document.getElementById('aiBgScale');
                const xEl = document.getElementById('aiBgX');
                const yEl = document.getElementById('aiBgY');
                if (scaleEl) { scaleEl.value = 100; document.getElementById('aiBgScaleValue').textContent = '100'; }
                if (xEl) { xEl.value = 50; document.getElementById('aiBgXValue').textContent = '50'; }
                if (yEl) { yEl.value = 50; document.getElementById('aiBgYValue').textContent = '50'; }
                // Show AI background controls
                document.getElementById('aiBgControls')?.classList.remove('hidden');
                updateCanvas();
                showSuccess('AI background generated!');
            };

            img.onerror = function() {
                const img2 = new Image();
                img2.onload = function() {
                    state.backgroundImage = img2;
                    // Reset AI background controls to default
                    state.aiBgScale = 100;
                    state.aiBgX = 50;
                    state.aiBgY = 50;
                    // Show AI background controls
                    document.getElementById('aiBgControls')?.classList.remove('hidden');
                    updateCanvas();
                    showSuccess('AI background generated!');
                };
                img2.src = data.imageUrl;
            };

            img.src = data.imageUrl;
        } else {
            throw new Error('No image URL in response');
        }
    } catch (error) {
        console.error('Error:', error);
        alert(`Error: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

// ========== Pattern Style Change ==========
function handlePatternStyleChange(e) {
    const btn = e.target.closest('.pattern-btn');
    if (!btn) return;

    state.patternStyle = btn.dataset.pattern;

    document.querySelectorAll('.pattern-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Show/hide appropriate controls based on pattern style
    const singleControls = document.getElementById('singleLogoControls');
    const patternControls = document.getElementById('patternControls');
    const highlightControls = document.getElementById('highlightControls');

    if (state.patternStyle === 'single') {
        singleControls?.classList.remove('hidden');
        patternControls?.classList.add('hidden');
        highlightControls?.classList.add('hidden');
    } else if (state.patternStyle === 'highlight') {
        singleControls?.classList.add('hidden');
        patternControls?.classList.remove('hidden');
        highlightControls?.classList.remove('hidden');
    } else {
        singleControls?.classList.add('hidden');
        patternControls?.classList.remove('hidden');
        highlightControls?.classList.add('hidden');
    }

    updateCanvas();
}

// ========== Text Layer ==========
function addTextLayer() {
    const textInput = document.getElementById('textContent');
    const text = textInput?.value.trim();

    if (!text) return;

    state.textElements.push({
        text: text,
        x: canvas.width / 2,
        y: canvas.height - 80,
        fontSize: parseInt(document.getElementById('fontSize')?.value || 60),
        color: document.getElementById('textColor')?.value || '#000000',
        fontFamily: document.getElementById('fontFamily')?.value || 'Impact'
    });

    textInput.value = '';
    updateCanvas();
    showSuccess('Text added!');
}

// ========== Check if Feather Flag Product ==========
function isFeatherFlagProduct() {
    if (!state.currentProduct) return false;
    return state.currentProduct.id === 'feather-flag';
}

// ========== B2Sign PDF Template Cache ==========
let featherFlagTemplateImage = null;
let featherFlagTemplateLoading = false;
let featherFlagPdfBytes = null;
let featherFlagOverlayImage = null;
let featherFlagOverlayLoading = false;

// Template URLs - try multiple paths for different environments
const FEATHER_FLAG_TEMPLATE_URLS = [
    '/FeatherAngled_XL_SingleSided_PrintThru.pdf',           // Vercel production (via route)
    '/public/FeatherAngled_XL_SingleSided_PrintThru.pdf'     // Local development
];

// SVG overlay for preview (original B2Sign template with text and guidelines)
const FEATHER_FLAG_OVERLAY_URLS = [
    '/Feather_Flag_Small__9ft__PrintReady (2).svg',
    '/public/Feather_Flag_Small__9ft__PrintReady (2).svg'
];

// Feather flag shape path from SVG template (viewBox 0 0 1944 13500)
// This defines the printable area inside the flag
const FEATHER_FLAG_SVG_VIEWBOX = { width: 1944, height: 13500 };
const FEATHER_FLAG_ARTWORK_PATH = new Path2D();
// The inner cutout path that defines where artwork goes
// Extracted from SVG: the second part of the path after the rectangle cutout
// Points: top-right curve down to bottom-left, then back up
FEATHER_FLAG_ARTWORK_PATH.moveTo(1852.5, 138.3);   // Start at top right
FEATHER_FLAG_ARTWORK_PATH.lineTo(1852.5, 12377.6); // Down the right side
FEATHER_FLAG_ARTWORK_PATH.lineTo(126, 13363.4);    // To bottom left corner
FEATHER_FLAG_ARTWORK_PATH.lineTo(142.3, 216.9);    // Up to top area
FEATHER_FLAG_ARTWORK_PATH.bezierCurveTo(211.3, 586.2, 1861.9, 138.3, 1852.5, 138.3); // Curve at top
FEATHER_FLAG_ARTWORK_PATH.closePath();

// ========== Load SVG overlay for preview ==========
async function loadFeatherFlagOverlay() {
    if (featherFlagOverlayImage) return featherFlagOverlayImage;
    if (featherFlagOverlayLoading) return null;

    featherFlagOverlayLoading = true;
    console.log('Loading feather flag SVG overlay...');

    try {
        for (const url of FEATHER_FLAG_OVERLAY_URLS) {
            console.log('Trying to fetch SVG overlay from:', url);
            try {
                const response = await fetch(url);
                if (response.ok) {
                    let svgText = await response.text();

                    // Make the gray fill transparent so artwork shows through the cutout
                    // The .st1 class has fill: #f1f2f2 which needs to be transparent
                    svgText = svgText.replace(/fill:\s*#f1f2f2/g, 'fill: none');

                    // Create image from modified SVG
                    const svgBlob = new Blob([svgText], { type: 'image/svg+xml' });
                    const imageUrl = URL.createObjectURL(svgBlob);

                    featherFlagOverlayImage = new Image();
                    featherFlagOverlayImage.src = imageUrl;

                    await new Promise((resolve, reject) => {
                        featherFlagOverlayImage.onload = resolve;
                        featherFlagOverlayImage.onerror = reject;
                    });

                    console.log('SVG overlay loaded successfully:', featherFlagOverlayImage.width, 'x', featherFlagOverlayImage.height);

                    // Trigger re-render
                    if (isFeatherFlagProduct() && canvas && ctx) {
                        updateCanvas();
                    }

                    return featherFlagOverlayImage;
                }
            } catch (e) {
                console.log('Failed to fetch SVG from:', url, e);
            }
        }
        console.warn('Could not load feather flag SVG overlay');
        return null;
    } catch (error) {
        console.error('Error loading SVG overlay:', error);
        return null;
    } finally {
        featherFlagOverlayLoading = false;
    }
}

// ========== Load and render B2Sign PDF template as image ==========
async function loadFeatherFlagTemplate() {
    if (featherFlagTemplateImage) return featherFlagTemplateImage;
    if (featherFlagTemplateLoading) {
        // Already loading - return null but the caller should retry later
        return null;
    }

    featherFlagTemplateLoading = true;
    console.log('Starting to load feather flag template...');

    try {
        // Initialize PDF.js
        if (typeof pdfjsLib === 'undefined') {
            console.error('PDF.js library not loaded');
            return null;
        }

        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        // Try to fetch PDF from multiple URLs
        let response = null;
        let successUrl = null;

        for (const url of FEATHER_FLAG_TEMPLATE_URLS) {
            console.log('Trying to fetch PDF from:', url);
            try {
                response = await fetch(url);
                if (response.ok) {
                    successUrl = url;
                    console.log('Found PDF at:', url);
                    break;
                }
            } catch (e) {
                console.log('Failed to fetch from:', url);
            }
        }

        if (!response || !response.ok) {
            console.warn('Could not load feather flag template PDF from any URL');
            return null;
        }

        // Store bytes for later use in download
        featherFlagPdfBytes = await response.arrayBuffer();
        console.log('PDF bytes loaded, size:', featherFlagPdfBytes.byteLength);

        // Render PDF to image using PDF.js
        const pdf = await pdfjsLib.getDocument({ data: featherFlagPdfBytes.slice(0) }).promise;
        const page = await pdf.getPage(1);

        // Get page dimensions and render at appropriate scale
        const viewport = page.getViewport({ scale: 1 });
        console.log('PDF viewport:', viewport.width, 'x', viewport.height);

        // Create canvas for rendering
        const pdfCanvas = document.createElement('canvas');
        const pdfCtx = pdfCanvas.getContext('2d');

        // Scale to fit our preview canvas while maintaining aspect ratio
        // Use higher scale for better quality preview
        const scale = Math.min(1200 / viewport.width, 3000 / viewport.height);
        const scaledViewport = page.getViewport({ scale });

        pdfCanvas.width = scaledViewport.width;
        pdfCanvas.height = scaledViewport.height;

        // Render PDF page
        await page.render({
            canvasContext: pdfCtx,
            viewport: scaledViewport
        }).promise;

        // Convert to image
        featherFlagTemplateImage = new Image();
        featherFlagTemplateImage.src = pdfCanvas.toDataURL('image/png');

        await new Promise((resolve, reject) => {
            featherFlagTemplateImage.onload = resolve;
            featherFlagTemplateImage.onerror = reject;
        });

        console.log('Feather flag template loaded successfully!');

        // Trigger canvas re-render now that template is loaded
        if (isFeatherFlagProduct() && canvas && ctx) {
            console.log('Re-rendering canvas with loaded template...');
            updateCanvas();
        }

        return featherFlagTemplateImage;
    } catch (error) {
        console.error('Error loading feather flag template:', error);
        return null;
    } finally {
        featherFlagTemplateLoading = false;
    }
}

// ========== Get print area coordinates from B2Sign PDF ==========
// These are approximate coordinates of the white print area in the PDF
// Measured from the PDF: the print area is positioned within the page
// Get the artwork area bounds from SVG path coordinates
// SVG viewBox is 1944 x 13500, artwork area extracted from path
function getFeatherFlagArtworkBounds() {
    // Artwork area bounds from SVG path analysis
    // The flag shape goes from approximately:
    // Top: y=138 (with curve)
    // Bottom: y=13363
    // Left: x=126 (at bottom), x=142 (at top)
    // Right: x=1852
    return {
        // Normalized to 0-1 range based on SVG viewBox (1944 x 13500)
        left: 126 / 1944,      // ~0.065
        top: 138 / 13500,      // ~0.01
        right: 1852 / 1944,    // ~0.953
        bottom: 13363 / 13500  // ~0.99
    };
}

// Create clipping path for feather flag shape
function createFeatherFlagClipPath(ctx, scale, offsetX, offsetY) {
    const svgWidth = 1944;
    const svgHeight = 13500;

    ctx.beginPath();
    // Scale and translate SVG coordinates to canvas
    const sx = (x) => offsetX + (x / svgWidth) * scale.width;
    const sy = (y) => offsetY + (y / svgHeight) * scale.height;

    // Draw the flag shape path (the inner artwork area)
    // This is based on the SVG template mask path
    ctx.moveTo(sx(1852.5), sy(138.3));
    ctx.lineTo(sx(1852.5), sy(12377.6));
    ctx.lineTo(sx(126), sy(13363.4));
    ctx.lineTo(sx(142.3), sy(216.9));
    // Bezier curve at top
    ctx.bezierCurveTo(sx(211.3), sy(586.2), sx(1861.9), sy(138.3), sx(1852.5), sy(138.3));
    ctx.closePath();
}

// ========== Draw Feather Flag Canvas using PNG Overlay ==========
async function drawFeatherFlagCanvas() {
    // Load both overlay and PDF template
    const [overlay, template] = await Promise.all([
        loadFeatherFlagOverlay(),
        loadFeatherFlagTemplate()
    ]);

    if (overlay) {
        // Use PNG overlay for better quality preview
        drawFeatherFlagWithOverlay(overlay);
    } else if (template) {
        // Fallback to PDF template
        drawFeatherFlagWithPDFTemplate(template);
    } else {
        // Last resort: draw with approximated shape
        drawFeatherFlagFallback();
    }
}

function drawFeatherFlagWithOverlay(overlay) {
    // Get display dimensions (stored by updateCanvasSize)
    const displayWidth = canvas.displayWidth || parseFloat(canvas.style.width) || 200;
    const displayHeight = canvas.displayHeight || parseFloat(canvas.style.height) || 1400;

    // Clear canvas (use display dimensions since ctx is already scaled)
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    // Canvas aspect ratio now matches SVG (1944/13500), so SVG fills entire canvas
    const drawWidth = displayWidth;
    const drawHeight = displayHeight;
    const drawX = 0;
    const drawY = 0;

    // STEP 1: Draw user's artwork (PNG overlay has transparent hole where artwork shows)

    // Draw background filling the draw area
    if (state.backgroundType === 'solid') {
        const color = document.getElementById('bgColor')?.value || '#ffffff';
        ctx.fillStyle = color;
        ctx.fillRect(drawX, drawY, drawWidth, drawHeight);
    } else if (state.backgroundType === 'gradient') {
        const color1 = document.getElementById('gradColor1')?.value || '#667eea';
        const color2 = document.getElementById('gradColor2')?.value || '#764ba2';
        let gradient;
        switch (state.gradDirection) {
            case 'horizontal':
                gradient = ctx.createLinearGradient(drawX, drawY, drawX + drawWidth, drawY);
                break;
            case 'vertical':
                gradient = ctx.createLinearGradient(drawX, drawY, drawX, drawY + drawHeight);
                break;
            case 'diagonal':
                gradient = ctx.createLinearGradient(drawX, drawY, drawX + drawWidth, drawY + drawHeight);
                break;
            case 'radial':
                gradient = ctx.createRadialGradient(
                    drawX + drawWidth / 2, drawY + drawHeight / 2, 0,
                    drawX + drawWidth / 2, drawY + drawHeight / 2, Math.max(drawWidth, drawHeight) / 2
                );
                break;
            default:
                gradient = ctx.createLinearGradient(drawX, drawY, drawX + drawWidth, drawY);
        }
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        ctx.fillStyle = gradient;
        ctx.fillRect(drawX, drawY, drawWidth, drawHeight);
    }

    // Draw uploaded image (fills entire draw area)
    if (state.uploadedImage) {
        const imgRatio = state.uploadedImage.width / state.uploadedImage.height;
        const areaRatio = drawWidth / drawHeight;
        let imgX, imgY, imgW, imgH;

        if (state.photoFitMode === 'cover') {
            if (imgRatio > areaRatio) {
                imgH = drawHeight * (state.photoImageScale / 100);
                imgW = imgH * imgRatio;
            } else {
                imgW = drawWidth * (state.photoImageScale / 100);
                imgH = imgW / imgRatio;
            }
            imgX = drawX + (drawWidth - imgW) * state.photoImageX;
            imgY = drawY + (drawHeight - imgH) * state.photoImageY;
        } else {
            imgW = drawWidth * 0.9 * (state.photoImageScale / 100);
            imgH = imgW / imgRatio;
            imgX = drawX + (drawWidth - imgW) / 2;
            imgY = drawY + (drawHeight - imgH) / 2;
        }

        ctx.drawImage(state.uploadedImage, imgX, imgY, imgW, imgH);
    }

    // Draw logo if in logo mode
    if (state.designType === 'logo' && state.logoImage) {
        const logoSize = Math.min(drawWidth, drawHeight) * 0.6;
        const logoX = drawX + (drawWidth - logoSize) / 2;
        const logoY = drawY + (drawHeight - logoSize) / 2;
        ctx.drawImage(state.logoImage, logoX, logoY, logoSize, logoSize);
    }

    // STEP 2: Draw PNG overlay on top - transparent hole shows artwork beneath
    ctx.drawImage(overlay, drawX, drawY, drawWidth, drawHeight);
}

// Fallback using PDF template rendering
function drawFeatherFlagWithPDFTemplate(template) {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate scaling to fit template in canvas
    const templateAspect = template.width / template.height;
    const canvasAspect = canvas.width / canvas.height;

    let drawWidth, drawHeight, drawX, drawY;

    if (templateAspect > canvasAspect) {
        drawWidth = canvas.width;
        drawHeight = canvas.width / templateAspect;
        drawX = 0;
        drawY = (canvas.height - drawHeight) / 2;
    } else {
        drawHeight = canvas.height;
        drawWidth = canvas.height * templateAspect;
        drawX = (canvas.width - drawWidth) / 2;
        drawY = 0;
    }

    // Get artwork bounds
    const bounds = getFeatherFlagArtworkBounds();
    const artworkX = drawX + bounds.left * drawWidth;
    const artworkY = drawY + bounds.top * drawHeight;
    const artworkW = (bounds.right - bounds.left) * drawWidth;
    const artworkH = (bounds.bottom - bounds.top) * drawHeight;

    // Draw user's design clipped to flag shape
    ctx.save();
    createFeatherFlagClipPath(ctx, { width: drawWidth, height: drawHeight }, drawX, drawY);
    ctx.clip();

    // Draw background
    if (state.backgroundType === 'solid') {
        const color = document.getElementById('bgColor')?.value || '#ffffff';
        ctx.fillStyle = color;
        ctx.fillRect(drawX, drawY, drawWidth, drawHeight);
    } else if (state.backgroundType === 'gradient') {
        const color1 = document.getElementById('gradColor1')?.value || '#667eea';
        const color2 = document.getElementById('gradColor2')?.value || '#764ba2';
        let gradient;
        switch (state.gradDirection) {
            case 'horizontal':
                gradient = ctx.createLinearGradient(drawX, drawY, drawX + drawWidth, drawY);
                break;
            case 'vertical':
                gradient = ctx.createLinearGradient(drawX, drawY, drawX, drawY + drawHeight);
                break;
            default:
                gradient = ctx.createLinearGradient(drawX, drawY, drawX + drawWidth, drawY);
        }
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        ctx.fillStyle = gradient;
        ctx.fillRect(drawX, drawY, drawWidth, drawHeight);
    }

    // Draw uploaded image
    if (state.uploadedImage) {
        const imgRatio = state.uploadedImage.width / state.uploadedImage.height;
        const areaRatio = artworkW / artworkH;
        let imgX, imgY, imgW, imgH;

        if (state.photoFitMode === 'cover') {
            if (imgRatio > areaRatio) {
                imgH = artworkH * (state.photoImageScale / 100);
                imgW = imgH * imgRatio;
            } else {
                imgW = artworkW * (state.photoImageScale / 100);
                imgH = imgW / imgRatio;
            }
            imgX = artworkX + (artworkW - imgW) * state.photoImageX;
            imgY = artworkY + (artworkH - imgH) * state.photoImageY;
        } else {
            imgW = artworkW * 0.9 * (state.photoImageScale / 100);
            imgH = imgW / imgRatio;
            imgX = artworkX + (artworkW - imgW) / 2;
            imgY = artworkY + (artworkH - imgH) / 2;
        }

        ctx.drawImage(state.uploadedImage, imgX, imgY, imgW, imgH);
    }

    // Draw logo if in logo mode
    if (state.designType === 'logo' && state.logoImage) {
        const logoSize = Math.min(artworkW, artworkH) * 0.6;
        const logoX = artworkX + (artworkW - logoSize) / 2;
        const logoY = artworkY + (artworkH - logoSize) / 2;
        ctx.drawImage(state.logoImage, logoX, logoY, logoSize, logoSize);
    }

    ctx.restore();

    // Draw template on top
    ctx.drawImage(template, drawX, drawY, drawWidth, drawHeight);
}

function drawFeatherFlagFallback() {
    // Fallback when template PDF is not available
    // First draw the content normally
    if (state.designType === 'photo') {
        drawPhotoMode();
    } else if (state.designType === 'logo') {
        drawLogoMode();
    }

    // Create a temporary canvas with the content
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(canvas, 0, 0);

    // Clear main canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Simple approximated feather shape
    ctx.save();
    ctx.beginPath();
    const topWidthRatio = 0.13;
    const topLeftX = canvas.width * (1 - topWidthRatio);
    ctx.moveTo(canvas.width, 0);
    ctx.lineTo(topLeftX, 0);
    ctx.bezierCurveTo(
        topLeftX * 0.3, canvas.height * 0.15,
        0, canvas.height * 0.4,
        0, canvas.height
    );
    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(tempCanvas, 0, 0);
    ctx.restore();

    // Draw outline
    ctx.strokeStyle = '#e53935';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width, 0);
    ctx.lineTo(topLeftX, 0);
    ctx.bezierCurveTo(
        topLeftX * 0.3, canvas.height * 0.15,
        0, canvas.height * 0.4,
        0, canvas.height
    );
    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(229, 57, 53, 0.8)';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PRINT AREA', canvas.width / 2 + canvas.width * 0.1, 20);
}

// ========== Canvas Update ==========
function updateCanvas() {
    if (!ctx || !canvas) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Check if this is a feather flag product
    if (isFeatherFlagProduct()) {
        drawFeatherFlagCanvas();
    }
    // Check if this is a table cloth product that needs mockup preview
    else if (isTableClothProduct() && (state.designType === 'photo' || state.designType === 'logo')) {
        drawTableMockup();
    } else if (state.designType === 'photo') {
        drawPhotoMode();
    } else if (state.designType === 'logo') {
        drawLogoMode();
    }
}

// ========== Draw Photo Mode ==========
function drawPhotoMode() {
    // Draw background
    if (state.backgroundType === 'solid') {
        const color = document.getElementById('bgColor')?.value || '#ffffff';
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (state.backgroundType === 'gradient') {
        const color1 = document.getElementById('gradColor1')?.value || '#667eea';
        const color2 = document.getElementById('gradColor2')?.value || '#764ba2';
        let gradient;

        switch (state.gradDirection) {
            case 'horizontal':
                gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
                break;
            case 'vertical':
                gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
                break;
            case 'diagonal':
                gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                break;
            case 'radial':
                gradient = ctx.createRadialGradient(
                    canvas.width / 2, canvas.height / 2, 0,
                    canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
                );
                break;
            default:
                gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        }
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (state.backgroundType === 'ai' && state.backgroundImage) {
        drawAIBackground(ctx, state.backgroundImage, canvas.width, canvas.height, state.aiBgScale, state.aiBgX, state.aiBgY);
    }

    // Draw uploaded image with position and scale controls
    if (state.uploadedImage) {
        let x, y, width, height;
        const imgRatio = state.uploadedImage.width / state.uploadedImage.height;
        const canvasRatio = canvas.width / canvas.height;

        if (state.photoFitMode === 'cover') {
            // Cover - fill canvas, may crop
            if (imgRatio > canvasRatio) {
                height = canvas.height * (state.photoImageScale / 100);
                width = height * imgRatio;
            } else {
                width = canvas.width * (state.photoImageScale / 100);
                height = width / imgRatio;
            }
            x = (canvas.width - width) * state.photoImageX;
            y = (canvas.height - height) * state.photoImageY;
        } else if (state.photoFitMode === 'contain') {
            // Contain - fit inside, may have letterbox
            if (imgRatio > canvasRatio) {
                width = canvas.width * 0.9 * (state.photoImageScale / 100);
                height = width / imgRatio;
            } else {
                height = canvas.height * 0.9 * (state.photoImageScale / 100);
                width = height * imgRatio;
            }
            x = (canvas.width - width) / 2 + (state.photoImageX - 0.5) * canvas.width * 0.5;
            y = (canvas.height - height) / 2 + (state.photoImageY - 0.5) * canvas.height * 0.5;
        } else {
            // Free position mode
            width = state.uploadedImage.width * (state.photoImageScale / 100) * 0.5;
            height = state.uploadedImage.height * (state.photoImageScale / 100) * 0.5;
            x = canvas.width * state.photoImageX - width / 2;
            y = canvas.height * state.photoImageY - height / 2;
        }

        // Drop shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetY = 10;

        ctx.drawImage(state.uploadedImage, x, y, width, height);

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
    }

    // Draw text layers (up to 3)
    state.photoTextLayers.forEach((layer, index) => {
        if (!layer.enabled || !layer.text.trim()) return;

        ctx.font = `bold ${layer.size}px ${layer.font}`;
        ctx.fillStyle = layer.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Text shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        const textX = canvas.width * layer.x;
        const textY = canvas.height * layer.y;

        ctx.fillText(layer.text, textX, textY);

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
    });
}

// ========== Draw Logo Mode ==========
function drawLogoMode() {
    ctx.fillStyle = state.patternBgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!state.logoImage) return;

    const logoWidth = state.logoSize;
    const logoHeight = (state.logoImage.height / state.logoImage.width) * logoWidth;
    const spacing = state.patternSpacing;
    const offsetX = state.patternOffsetX || 0;
    const offsetY = state.patternOffsetY || 0;
    const rotation = (state.patternRotation || 0) * Math.PI / 180;

    // Single logo mode
    if (state.patternStyle === 'single') {
        const singleWidth = state.singleLogoSize;
        const singleHeight = (state.logoImage.height / state.logoImage.width) * singleWidth;

        // Calculate text offset based on what's visible
        let textOffset = 0;
        if (state.showSingleText) textOffset += 50;
        if (state.showSingleTagline) textOffset += 30;

        const x = canvas.width * state.singleLogoX - singleWidth / 2;
        const y = canvas.height * state.singleLogoY - singleHeight / 2 - textOffset / 2;

        ctx.drawImage(state.logoImage, x, y, singleWidth, singleHeight);

        // Draw text below logo if enabled
        let textY = y + singleHeight + 45;

        if (state.showSingleText) {
            ctx.font = `bold 36px ${state.singleTextFont}`;
            ctx.fillStyle = state.singleTextColor;
            ctx.textAlign = 'center';
            ctx.fillText(state.singleText, canvas.width * state.singleLogoX, textY);
            textY += 35;
        }

        // Draw tagline if enabled (positioned based on whether text is showing)
        if (state.showSingleTagline) {
            ctx.font = `18px ${state.singleTaglineFont}`;
            ctx.fillStyle = state.singleTaglineColor;
            ctx.textAlign = 'center';
            ctx.fillText(state.singleTagline, canvas.width * state.singleLogoX, textY);
        }
        return;
    }

    // Highlight mode - grid with centered large logo
    if (state.patternStyle === 'highlight') {
        // Draw background pattern (smaller logos)
        ctx.save();
        ctx.translate(canvas.width / 2 + offsetX, canvas.height / 2 + offsetY);
        ctx.rotate(rotation);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);

        const smallLogoWidth = logoWidth * 0.6;
        const smallLogoHeight = (state.logoImage.height / state.logoImage.width) * smallLogoWidth;

        let rowIndex = 0;
        for (let y = -smallLogoHeight * 2; y < canvas.height + smallLogoHeight * 2; y += smallLogoHeight + spacing) {
            const rowOffset = rowIndex % 2 === 0 ? 0 : (smallLogoWidth + spacing) / 2;
            for (let x = -smallLogoWidth * 2 + rowOffset; x < canvas.width + smallLogoWidth * 2; x += smallLogoWidth + spacing) {
                ctx.globalAlpha = 0.3;
                ctx.drawImage(state.logoImage, x, y, smallLogoWidth, smallLogoHeight);
            }
            rowIndex++;
        }
        ctx.restore();
        ctx.globalAlpha = 1;

        // Calculate text offset based on what's visible
        let textOffset = 0;
        if (state.showHighlightText) textOffset += 50;
        if (state.showHighlightTagline) textOffset += 30;

        // Draw highlight logo using position state (logo, background and text move together)
        const highlightWidth = state.highlightSize;
        const highlightHeight = (state.logoImage.height / state.logoImage.width) * highlightWidth;

        // Use highlightLogoX/Y for positioning (default 0.5 = center)
        const logoCenterX = canvas.width * state.highlightLogoX;
        const logoCenterY = canvas.height * state.highlightLogoY;
        const centerX = logoCenterX - highlightWidth / 2;
        const centerY = logoCenterY - highlightHeight / 2 - textOffset / 2;

        // Draw background behind highlight logo if enabled
        if (state.showHighlightBg) {
            // Calculate padding as percentage of logo size (equal on all sides)
            const paddingPercent = (state.highlightBgSize - 100) / 100;
            const padding = Math.min(highlightWidth, highlightHeight) * paddingPercent;

            const bgWidth = highlightWidth + padding * 2;
            const bgHeight = highlightHeight + padding * 2;
            const bgX = centerX - padding;
            const bgY = centerY - padding;

            ctx.fillStyle = state.highlightBgColor;

            if (state.highlightBgShape === 'circle') {
                // For circle, use the larger dimension to ensure logo fits
                const radius = Math.max(bgWidth, bgHeight) / 2;
                const circleCenterX = centerX + highlightWidth / 2;
                const circleCenterY = centerY + highlightHeight / 2;
                ctx.beginPath();
                ctx.arc(circleCenterX, circleCenterY, radius, 0, Math.PI * 2);
                ctx.fill();
            } else if (state.highlightBgShape === 'rounded') {
                const radius = padding * 0.5; // Corner radius based on padding
                ctx.beginPath();
                ctx.roundRect(bgX, bgY, bgWidth, bgHeight, radius);
                ctx.fill();
            } else {
                ctx.fillRect(bgX, bgY, bgWidth, bgHeight);
            }
        }

        ctx.drawImage(state.logoImage, centerX, centerY, highlightWidth, highlightHeight);

        // Draw text below if enabled (follows logo position)
        let textY = centerY + highlightHeight + 45;

        if (state.showHighlightText) {
            ctx.font = `bold 36px ${state.highlightTextFont}`;
            ctx.fillStyle = state.highlightTextColor;
            ctx.textAlign = 'center';
            ctx.fillText(state.highlightText, logoCenterX, textY);
            textY += 35;
        }

        // Draw tagline if enabled (follows logo position)
        if (state.showHighlightTagline) {
            ctx.font = `18px ${state.highlightTaglineFont}`;
            ctx.fillStyle = state.highlightTaglineColor;
            ctx.textAlign = 'center';
            ctx.fillText(state.highlightTagline, logoCenterX, textY);
        }
        return;
    }

    // Grid, Diagonal, Offset patterns with rotation and offset support
    ctx.save();
    ctx.translate(canvas.width / 2 + offsetX, canvas.height / 2 + offsetY);
    ctx.rotate(rotation);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    if (state.patternStyle === 'grid') {
        for (let y = -logoHeight * 2; y < canvas.height + logoHeight * 2; y += logoHeight + spacing) {
            for (let x = -logoWidth * 2; x < canvas.width + logoWidth * 2; x += logoWidth + spacing) {
                ctx.drawImage(state.logoImage, x, y, logoWidth, logoHeight);
            }
        }
    } else if (state.patternStyle === 'diagonal') {
        ctx.rotate(-Math.PI / 6);
        for (let y = -logoHeight * 3; y < canvas.height * 3; y += logoHeight + spacing) {
            for (let x = -logoWidth * 3; x < canvas.width * 3; x += logoWidth + spacing) {
                ctx.drawImage(state.logoImage, x, y, logoWidth, logoHeight);
            }
        }
    } else if (state.patternStyle === 'offset') {
        let rowIndex = 0;
        for (let y = -logoHeight * 2; y < canvas.height + logoHeight * 2; y += logoHeight + spacing) {
            const rowOffset = rowIndex % 2 === 0 ? 0 : (logoWidth + spacing) / 2;
            for (let x = -logoWidth * 2 + rowOffset; x < canvas.width + logoWidth * 2; x += logoWidth + spacing) {
                ctx.drawImage(state.logoImage, x, y, logoWidth, logoHeight);
            }
            rowIndex++;
        }
    }

    ctx.restore();
}

// ========== Table Cloth Mockup Rendering ==========
// Check if current product is a table cloth that needs mockup preview
function isTableClothProduct() {
    return state.currentProduct && state.currentProduct.mockupType;
}

// Draw mockup preview for table cloth products
function drawTableMockup() {
    const mockupType = state.currentProduct.mockupType;

    // First draw the design onto an offscreen canvas
    const designCanvas = document.createElement('canvas');
    designCanvas.width = canvas.width;
    designCanvas.height = canvas.height;
    const designCtx = designCanvas.getContext('2d');

    // Draw design based on mode
    if (state.designType === 'photo') {
        drawDesignToContext(designCtx, designCanvas.width, designCanvas.height);
    } else if (state.designType === 'logo') {
        drawLogoDesignToContext(designCtx, designCanvas.width, designCanvas.height);
    }

    // Clear main canvas and draw mockup scene
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw based on mockup type
    switch(mockupType) {
        case 'stretch-table':
            drawStretchTableMockup(designCanvas);
            break;
        case 'table-throw':
            drawTableThrowMockup(designCanvas);
            break;
        case 'table-runner':
            drawTableRunnerMockup(designCanvas);
            break;
        case 'solid-table':
            drawSolidTableMockup();
            break;
        case 'round-table':
            drawRoundTableMockup(designCanvas);
            break;
        default:
            drawTableThrowMockup(designCanvas);
    }
}

// Helper: draw photo design to any context
function drawDesignToContext(targetCtx, w, h) {
    // Draw background
    if (state.backgroundType === 'solid') {
        const color = document.getElementById('bgColor')?.value || '#ffffff';
        targetCtx.fillStyle = color;
        targetCtx.fillRect(0, 0, w, h);
    } else if (state.backgroundType === 'gradient') {
        const color1 = document.getElementById('gradColor1')?.value || '#667eea';
        const color2 = document.getElementById('gradColor2')?.value || '#764ba2';
        let gradient;
        switch (state.gradDirection) {
            case 'horizontal':
                gradient = targetCtx.createLinearGradient(0, 0, w, 0);
                break;
            case 'vertical':
                gradient = targetCtx.createLinearGradient(0, 0, 0, h);
                break;
            case 'diagonal':
                gradient = targetCtx.createLinearGradient(0, 0, w, h);
                break;
            case 'radial':
                gradient = targetCtx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w, h)/2);
                break;
            default:
                gradient = targetCtx.createLinearGradient(0, 0, w, 0);
        }
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        targetCtx.fillStyle = gradient;
        targetCtx.fillRect(0, 0, w, h);
    } else if (state.backgroundType === 'ai' && state.backgroundImage) {
        drawAIBackground(targetCtx, state.backgroundImage, w, h, state.aiBgScale, state.aiBgX, state.aiBgY);
    }

    // Draw uploaded image
    if (state.uploadedImage) {
        let x, y, width, height;
        const imgRatio = state.uploadedImage.width / state.uploadedImage.height;
        const canvasRatio = w / h;

        if (state.photoFitMode === 'cover') {
            if (imgRatio > canvasRatio) {
                height = h * (state.photoImageScale / 100);
                width = height * imgRatio;
            } else {
                width = w * (state.photoImageScale / 100);
                height = width / imgRatio;
            }
            x = (w - width) * state.photoImageX;
            y = (h - height) * state.photoImageY;
        } else if (state.photoFitMode === 'contain') {
            if (imgRatio > canvasRatio) {
                width = w * 0.9 * (state.photoImageScale / 100);
                height = width / imgRatio;
            } else {
                height = h * 0.9 * (state.photoImageScale / 100);
                width = height * imgRatio;
            }
            x = (w - width) / 2 + (state.photoImageX - 0.5) * w * 0.5;
            y = (h - height) / 2 + (state.photoImageY - 0.5) * h * 0.5;
        } else {
            width = state.uploadedImage.width * (state.photoImageScale / 100) * 0.5;
            height = state.uploadedImage.height * (state.photoImageScale / 100) * 0.5;
            x = w * state.photoImageX - width / 2;
            y = h * state.photoImageY - height / 2;
        }
        targetCtx.drawImage(state.uploadedImage, x, y, width, height);
    }

    // Draw text layers
    state.photoTextLayers.forEach(layer => {
        if (!layer.enabled || !layer.text.trim()) return;
        targetCtx.font = `bold ${layer.size}px ${layer.font}`;
        targetCtx.fillStyle = layer.color;
        targetCtx.textAlign = 'center';
        targetCtx.textBaseline = 'middle';
        targetCtx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        targetCtx.shadowBlur = 8;
        targetCtx.fillText(layer.text, w * layer.x, h * layer.y);
        targetCtx.shadowColor = 'transparent';
    });
}

// Helper: draw logo design to any context
function drawLogoDesignToContext(targetCtx, w, h) {
    targetCtx.fillStyle = state.patternBgColor;
    targetCtx.fillRect(0, 0, w, h);

    if (!state.logoImage) return;

    const logoWidth = state.logoSize;
    const logoHeight = (state.logoImage.height / state.logoImage.width) * logoWidth;
    const spacing = state.patternSpacing;

    if (state.patternStyle === 'single') {
        const singleWidth = state.singleLogoSize;
        const singleHeight = (state.logoImage.height / state.logoImage.width) * singleWidth;
        const x = w * state.singleLogoX - singleWidth / 2;
        const y = h * state.singleLogoY - singleHeight / 2;
        targetCtx.drawImage(state.logoImage, x, y, singleWidth, singleHeight);
    } else if (state.patternStyle === 'diagonal') {
        let rowIndex = 0;
        for (let y = -logoHeight; y < h + logoHeight; y += logoHeight + spacing) {
            const rowOffset = rowIndex % 2 === 0 ? 0 : (logoWidth + spacing) / 2;
            for (let x = -logoWidth + rowOffset; x < w + logoWidth; x += logoWidth + spacing) {
                targetCtx.drawImage(state.logoImage, x, y, logoWidth, logoHeight);
            }
            rowIndex++;
        }
    } else if (state.patternStyle === 'grid') {
        for (let y = 0; y < h + logoHeight; y += logoHeight + spacing) {
            for (let x = 0; x < w + logoWidth; x += logoWidth + spacing) {
                targetCtx.drawImage(state.logoImage, x, y, logoWidth, logoHeight);
            }
        }
    } else if (state.patternStyle === 'offset') {
        let rowIndex = 0;
        for (let y = 0; y < h + logoHeight; y += logoHeight + spacing) {
            const rowOffset = rowIndex % 2 === 0 ? 0 : (logoWidth + spacing) / 2;
            for (let x = rowOffset; x < w + logoWidth; x += logoWidth + spacing) {
                targetCtx.drawImage(state.logoImage, x, y, logoWidth, logoHeight);
            }
            rowIndex++;
        }
    }
}

// Stretch Table Throw - form-fitting, shows top and front
function drawStretchTableMockup(designCanvas) {
    const padding = 40;
    const tableWidth = canvas.width - padding * 2;
    const tableHeight = canvas.height * 0.35;
    const topHeight = canvas.height * 0.25;
    const frontHeight = canvas.height * 0.45;

    // Draw background gradient (floor/wall)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGrad.addColorStop(0, '#e8e8e8');
    bgGrad.addColorStop(1, '#d0d0d0');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Table dimensions
    const topY = canvas.height * 0.15;
    const perspectiveOffset = tableWidth * 0.08;

    // Draw table top (perspective trapezoid)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(padding + perspectiveOffset, topY);
    ctx.lineTo(canvas.width - padding - perspectiveOffset, topY);
    ctx.lineTo(canvas.width - padding, topY + topHeight);
    ctx.lineTo(padding, topY + topHeight);
    ctx.closePath();
    ctx.clip();

    // Draw design on top with perspective transform approximation
    ctx.drawImage(designCanvas, padding, topY - perspectiveOffset * 0.5, tableWidth, topHeight + perspectiveOffset);

    // Add lighting effect
    const topGrad = ctx.createLinearGradient(0, topY, 0, topY + topHeight);
    topGrad.addColorStop(0, 'rgba(255,255,255,0.2)');
    topGrad.addColorStop(1, 'rgba(0,0,0,0.1)');
    ctx.fillStyle = topGrad;
    ctx.fill();
    ctx.restore();

    // Draw front panel
    ctx.save();
    const frontY = topY + topHeight;
    ctx.beginPath();
    ctx.moveTo(padding, frontY);
    ctx.lineTo(canvas.width - padding, frontY);
    ctx.lineTo(canvas.width - padding - perspectiveOffset * 0.3, frontY + frontHeight);
    ctx.lineTo(padding + perspectiveOffset * 0.3, frontY + frontHeight);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(designCanvas, padding, frontY, tableWidth, frontHeight);

    // Add shadow/depth
    const frontGrad = ctx.createLinearGradient(0, frontY, 0, frontY + frontHeight);
    frontGrad.addColorStop(0, 'rgba(0,0,0,0.05)');
    frontGrad.addColorStop(0.5, 'rgba(0,0,0,0)');
    frontGrad.addColorStop(1, 'rgba(0,0,0,0.15)');
    ctx.fillStyle = frontGrad;
    ctx.fill();
    ctx.restore();

    // Add edge highlight
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, topY + topHeight);
    ctx.lineTo(canvas.width - padding, topY + topHeight);
    ctx.stroke();

    // Drop shadow under table
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fillRect(padding + 20, topY + topHeight + frontHeight + 5, tableWidth - 40, 15);
}

// Table Throw - draped look with visible sides
function drawTableThrowMockup(designCanvas) {
    const padding = 50;
    const topY = canvas.height * 0.18;
    const topHeight = canvas.height * 0.22;
    const frontHeight = canvas.height * 0.5;
    const tableWidth = canvas.width - padding * 2;
    const perspectiveOffset = tableWidth * 0.1;

    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGrad.addColorStop(0, '#f5f5f5');
    bgGrad.addColorStop(1, '#e0e0e0');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw left side drape
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(padding, topY + topHeight);
    ctx.lineTo(padding + perspectiveOffset * 1.5, topY);
    ctx.lineTo(padding, topY + topHeight * 0.3);
    ctx.quadraticCurveTo(padding - 20, topY + topHeight + frontHeight * 0.5, padding + 10, topY + topHeight + frontHeight);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(designCanvas, padding - tableWidth * 0.3, topY, tableWidth * 0.5, frontHeight + topHeight);
    const leftGrad = ctx.createLinearGradient(padding, 0, padding + perspectiveOffset, 0);
    leftGrad.addColorStop(0, 'rgba(0,0,0,0.3)');
    leftGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = leftGrad;
    ctx.fill();
    ctx.restore();

    // Draw table top
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(padding + perspectiveOffset, topY);
    ctx.lineTo(canvas.width - padding - perspectiveOffset, topY);
    ctx.lineTo(canvas.width - padding, topY + topHeight);
    ctx.lineTo(padding, topY + topHeight);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(designCanvas, padding, topY - 20, tableWidth, topHeight + 40);
    const topGrad = ctx.createLinearGradient(0, topY, 0, topY + topHeight);
    topGrad.addColorStop(0, 'rgba(255,255,255,0.15)');
    topGrad.addColorStop(1, 'rgba(0,0,0,0.05)');
    ctx.fillStyle = topGrad;
    ctx.fill();
    ctx.restore();

    // Draw front drape with wave effect
    ctx.save();
    const frontY = topY + topHeight;
    ctx.beginPath();
    ctx.moveTo(padding, frontY);
    ctx.lineTo(canvas.width - padding, frontY);
    // Wavy bottom edge
    const waveCount = 5;
    const waveHeight = 8;
    for (let i = waveCount; i >= 0; i--) {
        const x = padding + (tableWidth / waveCount) * i;
        const y = frontY + frontHeight + (i % 2 === 0 ? waveHeight : 0);
        if (i === waveCount) {
            ctx.lineTo(x, y);
        } else {
            ctx.quadraticCurveTo(x + tableWidth / waveCount / 2, frontY + frontHeight + (i % 2 === 0 ? 0 : waveHeight), x, y);
        }
    }
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(designCanvas, padding, frontY - 20, tableWidth, frontHeight + 40);

    // Add fabric fold shadows
    for (let i = 1; i < waveCount; i++) {
        const x = padding + (tableWidth / waveCount) * i;
        const foldGrad = ctx.createLinearGradient(x - 20, 0, x + 20, 0);
        foldGrad.addColorStop(0, 'rgba(0,0,0,0)');
        foldGrad.addColorStop(0.5, 'rgba(0,0,0,0.08)');
        foldGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = foldGrad;
        ctx.fillRect(x - 20, frontY, 40, frontHeight);
    }
    ctx.restore();

    // Draw right side drape
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(canvas.width - padding, topY + topHeight);
    ctx.lineTo(canvas.width - padding - perspectiveOffset * 1.5, topY);
    ctx.lineTo(canvas.width - padding, topY + topHeight * 0.3);
    ctx.quadraticCurveTo(canvas.width - padding + 20, topY + topHeight + frontHeight * 0.5, canvas.width - padding - 10, topY + topHeight + frontHeight);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(designCanvas, canvas.width - padding - tableWidth * 0.2, topY, tableWidth * 0.5, frontHeight + topHeight);
    const rightGrad = ctx.createLinearGradient(canvas.width - padding, 0, canvas.width - padding - perspectiveOffset, 0);
    rightGrad.addColorStop(0, 'rgba(0,0,0,0.25)');
    rightGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = rightGrad;
    ctx.fill();
    ctx.restore();

    // Floor shadow
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.beginPath();
    ctx.ellipse(canvas.width / 2, topY + topHeight + frontHeight + 10, tableWidth * 0.45, 15, 0, 0, Math.PI * 2);
    ctx.fill();
}

// Table Runner - shows runner over solid color table
function drawTableRunnerMockup(designCanvas) {
    const padding = 50;
    const topY = canvas.height * 0.2;
    const topHeight = canvas.height * 0.25;
    const frontHeight = canvas.height * 0.45;
    const tableWidth = canvas.width - padding * 2;
    const perspectiveOffset = tableWidth * 0.08;
    const runnerWidth = tableWidth * 0.35;

    // Background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Base table color (white/neutral)
    const tableColor = '#ffffff';

    // Draw table top
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(padding + perspectiveOffset, topY);
    ctx.lineTo(canvas.width - padding - perspectiveOffset, topY);
    ctx.lineTo(canvas.width - padding, topY + topHeight);
    ctx.lineTo(padding, topY + topHeight);
    ctx.closePath();
    ctx.fillStyle = tableColor;
    ctx.fill();
    const topGrad = ctx.createLinearGradient(0, topY, 0, topY + topHeight);
    topGrad.addColorStop(0, 'rgba(255,255,255,0.3)');
    topGrad.addColorStop(1, 'rgba(0,0,0,0.05)');
    ctx.fillStyle = topGrad;
    ctx.fill();
    ctx.restore();

    // Draw front of table
    ctx.save();
    const frontY = topY + topHeight;
    ctx.beginPath();
    ctx.moveTo(padding, frontY);
    ctx.lineTo(canvas.width - padding, frontY);
    ctx.lineTo(canvas.width - padding - perspectiveOffset * 0.3, frontY + frontHeight);
    ctx.lineTo(padding + perspectiveOffset * 0.3, frontY + frontHeight);
    ctx.closePath();
    ctx.fillStyle = tableColor;
    ctx.fill();
    const frontGrad = ctx.createLinearGradient(0, frontY, 0, frontY + frontHeight);
    frontGrad.addColorStop(0, 'rgba(0,0,0,0)');
    frontGrad.addColorStop(1, 'rgba(0,0,0,0.1)');
    ctx.fillStyle = frontGrad;
    ctx.fill();
    ctx.restore();

    // Draw runner on top (centered strip)
    ctx.save();
    const runnerTopX = (canvas.width - runnerWidth) / 2;
    ctx.beginPath();
    ctx.moveTo(runnerTopX + perspectiveOffset * 0.35, topY - 5);
    ctx.lineTo(runnerTopX + runnerWidth - perspectiveOffset * 0.35, topY - 5);
    ctx.lineTo(runnerTopX + runnerWidth, topY + topHeight);
    ctx.lineTo(runnerTopX, topY + topHeight);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(designCanvas, runnerTopX, topY - 10, runnerWidth, topHeight + 20);
    ctx.restore();

    // Draw runner front drape
    ctx.save();
    const runnerFrontX = (canvas.width - runnerWidth) / 2;
    ctx.beginPath();
    ctx.moveTo(runnerFrontX, frontY);
    ctx.lineTo(runnerFrontX + runnerWidth, frontY);
    ctx.lineTo(runnerFrontX + runnerWidth - 5, frontY + frontHeight + 15);
    ctx.lineTo(runnerFrontX + 5, frontY + frontHeight + 15);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(designCanvas, runnerFrontX, frontY - 10, runnerWidth, frontHeight + 30);

    // Fabric fold in runner
    const centerX = canvas.width / 2;
    const foldGrad = ctx.createLinearGradient(centerX - 30, 0, centerX + 30, 0);
    foldGrad.addColorStop(0, 'rgba(0,0,0,0)');
    foldGrad.addColorStop(0.5, 'rgba(0,0,0,0.1)');
    foldGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = foldGrad;
    ctx.fillRect(centerX - 30, frontY, 60, frontHeight);
    ctx.restore();

    // Runner edges highlight
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(runnerFrontX, frontY);
    ctx.lineTo(runnerFrontX + 5, frontY + frontHeight + 15);
    ctx.moveTo(runnerFrontX + runnerWidth, frontY);
    ctx.lineTo(runnerFrontX + runnerWidth - 5, frontY + frontHeight + 15);
    ctx.stroke();

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.fillRect(padding + 30, topY + topHeight + frontHeight + 5, tableWidth - 60, 12);
}

// Solid Color Table Throw - just shows color, no custom design
function drawSolidTableMockup() {
    const padding = 50;
    const topY = canvas.height * 0.18;
    const topHeight = canvas.height * 0.22;
    const frontHeight = canvas.height * 0.5;
    const tableWidth = canvas.width - padding * 2;
    const perspectiveOffset = tableWidth * 0.1;

    // Get selected color from state or default
    let tableColor = state.solidTableColor || '#000000';

    // Background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw table top
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(padding + perspectiveOffset, topY);
    ctx.lineTo(canvas.width - padding - perspectiveOffset, topY);
    ctx.lineTo(canvas.width - padding, topY + topHeight);
    ctx.lineTo(padding, topY + topHeight);
    ctx.closePath();
    ctx.fillStyle = tableColor;
    ctx.fill();
    const topGrad = ctx.createLinearGradient(0, topY, 0, topY + topHeight);
    topGrad.addColorStop(0, 'rgba(255,255,255,0.2)');
    topGrad.addColorStop(1, 'rgba(0,0,0,0.1)');
    ctx.fillStyle = topGrad;
    ctx.fill();
    ctx.restore();

    // Draw front
    ctx.save();
    const frontY = topY + topHeight;
    ctx.beginPath();
    ctx.moveTo(padding, frontY);
    ctx.lineTo(canvas.width - padding, frontY);
    ctx.lineTo(canvas.width - padding - perspectiveOffset * 0.5, frontY + frontHeight);
    ctx.lineTo(padding + perspectiveOffset * 0.5, frontY + frontHeight);
    ctx.closePath();
    ctx.fillStyle = tableColor;
    ctx.fill();
    const frontGrad = ctx.createLinearGradient(0, frontY, 0, frontY + frontHeight);
    frontGrad.addColorStop(0, 'rgba(0,0,0,0)');
    frontGrad.addColorStop(1, 'rgba(0,0,0,0.15)');
    ctx.fillStyle = frontGrad;
    ctx.fill();
    ctx.restore();

    // Side panels
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(padding, topY + topHeight);
    ctx.lineTo(padding + perspectiveOffset, topY);
    ctx.lineTo(padding + perspectiveOffset, topY + topHeight * 0.5);
    ctx.lineTo(padding + perspectiveOffset * 0.5, frontY + frontHeight);
    ctx.closePath();
    ctx.fillStyle = tableColor;
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fill();
    ctx.restore();

    // Edge highlight
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, topY + topHeight);
    ctx.lineTo(canvas.width - padding, topY + topHeight);
    ctx.stroke();

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fillRect(padding + 30, topY + topHeight + frontHeight + 5, tableWidth - 60, 15);
}

// Round Table Throw - circular table with draped cloth
function drawRoundTableMockup(designCanvas) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height * 0.35;
    const topRadiusX = canvas.width * 0.35;
    const topRadiusY = canvas.height * 0.12;
    const drapLength = canvas.height * 0.5;

    // Background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw draped sides (create elliptical drape effect)
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, topRadiusX, topRadiusY, 0, 0, Math.PI);
    ctx.lineTo(centerX - topRadiusX * 0.9, centerY + drapLength);
    ctx.quadraticCurveTo(centerX, centerY + drapLength + 20, centerX + topRadiusX * 0.9, centerY + drapLength);
    ctx.closePath();
    ctx.clip();

    // Draw design stretched over drape
    ctx.drawImage(designCanvas, centerX - topRadiusX, centerY - topRadiusY, topRadiusX * 2, drapLength + topRadiusY + 30);

    // Add fabric folds
    const foldCount = 8;
    for (let i = 0; i < foldCount; i++) {
        const angle = (i / foldCount) * Math.PI;
        const x1 = centerX + Math.cos(angle) * topRadiusX;
        const x2 = centerX + Math.cos(angle) * topRadiusX * 0.9;
        const foldGrad = ctx.createLinearGradient(x1 - 15, 0, x1 + 15, 0);
        foldGrad.addColorStop(0, 'rgba(0,0,0,0)');
        foldGrad.addColorStop(0.5, 'rgba(0,0,0,0.1)');
        foldGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = foldGrad;
        ctx.fillRect(x1 - 15, centerY, 30, drapLength);
    }
    ctx.restore();

    // Draw table top (ellipse)
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, topRadiusX, topRadiusY, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(designCanvas, centerX - topRadiusX, centerY - topRadiusY, topRadiusX * 2, topRadiusY * 2);

    // Top lighting
    const topGrad = ctx.createRadialGradient(centerX, centerY - topRadiusY * 0.5, 0, centerX, centerY, topRadiusX);
    topGrad.addColorStop(0, 'rgba(255,255,255,0.2)');
    topGrad.addColorStop(1, 'rgba(0,0,0,0.1)');
    ctx.fillStyle = topGrad;
    ctx.fill();
    ctx.restore();

    // Edge highlight
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, topRadiusX, topRadiusY, 0, Math.PI, Math.PI * 2);
    ctx.stroke();

    // Floor shadow
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + drapLength + 10, topRadiusX * 0.85, 12, 0, 0, Math.PI * 2);
    ctx.fill();
}

// ========== Update Review Panel ==========
function updateReviewPanel() {
    const summaryProduct = document.getElementById('summaryProduct');
    const summarySize = document.getElementById('summarySize');
    const summaryOptions = document.getElementById('summaryOptions');
    const summaryTotal = document.getElementById('summaryTotal');
    const viewToggle = document.querySelector('.preview-view-toggle');

    if (summaryProduct && state.currentProduct) {
        summaryProduct.textContent = state.currentProduct.name;
    }

    if (summarySize && state.selectedSize) {
        summarySize.textContent = state.selectedSize.label;
    }

    if (summaryOptions && state.currentProduct) {
        const optionLabels = state.selectedOptions.map(id => {
            const opt = state.currentProduct.options.find(o => o.id === id);
            return opt ? opt.label : '';
        }).filter(Boolean);
        summaryOptions.textContent = optionLabels.length > 0 ? optionLabels.join(', ') : 'None';
    }

    if (summaryTotal && state.selectedSize) {
        let total = state.selectedSize.price;
        state.selectedOptions.forEach(optionId => {
            const option = state.currentProduct.options.find(o => o.id === optionId);
            if (option) total += option.price;
        });
        summaryTotal.textContent = '$' + total.toFixed(2);
    }

    // Hide 3D mockup toggle for products without 3D support (flags, etc.)
    if (viewToggle) {
        const productsWithout3D = ['feather-flag']; // Products that don't have 3D mockup
        const currentProductId = state.currentProduct?.id || Object.keys(PRODUCTS).find(k => PRODUCTS[k] === state.currentProduct);

        if (productsWithout3D.includes(currentProductId)) {
            viewToggle.style.display = 'none';
            // Ensure flat view is shown
            document.getElementById('flatPreview')?.classList.remove('hidden');
            document.getElementById('mockupPreview')?.classList.add('hidden');
        } else {
            viewToggle.style.display = 'flex';
        }
    }
}

// ========== Copy to Final Canvas ==========
function copyToFinalCanvas() {
    if (!finalCtx || !canvas) return;
    finalCtx.drawImage(canvas, 0, 0);

    // Also render to mockup canvas
    renderMockupCanvas();
}

// ========== Three.js 3D Mockup ==========
let threejsScene, threejsCamera, threejsRenderer, bannerMesh, bannerStand;
let threejsInitialized = false;
let targetRotationY = 0;
let currentRotationY = 0;
let isThreejsDragging = false;
let previousMouseX = 0;

// Zoom controls
let targetZoom = 4.2;
let currentZoom = 4.2;
const MIN_ZOOM = 3.0;
const MAX_ZOOM = 6.0;

function initThreeJsMockup() {
    const container = document.getElementById('threejs-container');
    if (!container || threejsInitialized) return;

    // Check if Three.js is loaded
    if (typeof THREE === 'undefined') {
        console.error('Three.js not loaded');
        return;
    }

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 420;

    // Scene
    threejsScene = new THREE.Scene();
    threejsScene.background = new THREE.Color(0xf5f5f5);

    // Camera - positioned for larger model view
    threejsCamera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    threejsCamera.position.set(0, 1.4, targetZoom);
    threejsCamera.lookAt(0, 1.3, 0);

    // Renderer
    threejsRenderer = new THREE.WebGLRenderer({ antialias: true });
    threejsRenderer.setSize(width, height);
    threejsRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    threejsRenderer.shadowMap.enabled = true;
    threejsRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(threejsRenderer.domElement);

    // Lights - soft studio lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    threejsScene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.6);
    mainLight.position.set(3, 8, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    threejsScene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-3, 4, -3);
    threejsScene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.2);
    rimLight.position.set(0, 3, -5);
    threejsScene.add(rimLight);

    // Ground plane for shadow
    const groundGeometry = new THREE.PlaneGeometry(15, 15);
    const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.12 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    threejsScene.add(ground);

    // Create banner stand group
    bannerStand = new THREE.Group();

    // Materials - realistic aluminum
    const silverMaterial = new THREE.MeshStandardMaterial({
        color: 0xd8d8d8,
        metalness: 0.9,
        roughness: 0.2
    });

    const brushedMetal = new THREE.MeshStandardMaterial({
        color: 0xc0c0c0,
        metalness: 0.85,
        roughness: 0.35
    });

    const darkEndcap = new THREE.MeshStandardMaterial({
        color: 0x888888,
        metalness: 0.8,
        roughness: 0.3
    });

    // ===== CYLINDRICAL BASE (Cassette) =====
    const baseRadius = 0.055;
    const baseLength = 1.0;

    // Main cylinder body
    const baseCylinderGeometry = new THREE.CylinderGeometry(baseRadius, baseRadius, baseLength, 32);
    const baseCylinder = new THREE.Mesh(baseCylinderGeometry, brushedMetal);
    baseCylinder.rotation.z = Math.PI / 2;
    baseCylinder.position.y = baseRadius;
    baseCylinder.castShadow = true;
    bannerStand.add(baseCylinder);

    // End caps (circular)
    const endCapGeometry = new THREE.CylinderGeometry(baseRadius + 0.008, baseRadius + 0.008, 0.015, 32);

    const leftEndCap = new THREE.Mesh(endCapGeometry, darkEndcap);
    leftEndCap.rotation.z = Math.PI / 2;
    leftEndCap.position.set(-baseLength / 2 - 0.007, baseRadius, 0);
    leftEndCap.castShadow = true;
    bannerStand.add(leftEndCap);

    const rightEndCap = new THREE.Mesh(endCapGeometry, darkEndcap);
    rightEndCap.rotation.z = Math.PI / 2;
    rightEndCap.position.set(baseLength / 2 + 0.007, baseRadius, 0);
    rightEndCap.castShadow = true;
    bannerStand.add(rightEndCap);

    // Slot on top of base (where banner comes out)
    const slotGeometry = new THREE.BoxGeometry(baseLength - 0.1, 0.008, 0.015);
    const slotMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.5, roughness: 0.5 });
    const slot = new THREE.Mesh(slotGeometry, slotMaterial);
    slot.position.y = baseRadius * 2 - 0.002;
    bannerStand.add(slot);

    // ===== FEET (angled supports) =====
    const footLength = 0.45;
    const footWidth = 0.04;
    const footHeight = 0.012;
    const footGeometry = new THREE.BoxGeometry(footLength, footHeight, footWidth);

    // Round the edges slightly with bevel
    const leftFoot = new THREE.Mesh(footGeometry, brushedMetal);
    leftFoot.position.set(-0.15, footHeight / 2, 0.22);
    leftFoot.rotation.y = Math.PI * 0.12;
    leftFoot.castShadow = true;
    bannerStand.add(leftFoot);

    const rightFoot = new THREE.Mesh(footGeometry, brushedMetal);
    rightFoot.position.set(0.15, footHeight / 2, 0.22);
    rightFoot.rotation.y = -Math.PI * 0.12;
    rightFoot.castShadow = true;
    bannerStand.add(rightFoot);

    // Foot end caps (rounded ends)
    const footCapGeometry = new THREE.CylinderGeometry(footWidth / 2, footWidth / 2, footHeight, 16);

    const leftFootCap = new THREE.Mesh(footCapGeometry, brushedMetal);
    leftFootCap.position.set(-0.15 - Math.cos(Math.PI * 0.12) * footLength / 2, footHeight / 2, 0.22 + Math.sin(Math.PI * 0.12) * footLength / 2);
    bannerStand.add(leftFootCap);

    const rightFootCap = new THREE.Mesh(footCapGeometry, brushedMetal);
    rightFootCap.position.set(0.15 + Math.cos(Math.PI * 0.12) * footLength / 2, footHeight / 2, 0.22 + Math.sin(Math.PI * 0.12) * footLength / 2);
    bannerStand.add(rightFootCap);

    // ===== BANNER =====
    const bannerWidth = 0.85;
    const bannerHeight = 2.4;
    const bannerGeometry = new THREE.PlaneGeometry(bannerWidth, bannerHeight);
    const bannerMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        roughness: 0.7,
        metalness: 0.0
    });
    bannerMesh = new THREE.Mesh(bannerGeometry, bannerMaterial);
    // Position banner so it starts from the slot (no gap)
    bannerMesh.position.y = baseRadius * 2 + bannerHeight / 2;
    bannerMesh.castShadow = true;
    bannerStand.add(bannerMesh);

    // ===== TOP RAIL =====
    const topRailRadius = 0.012;
    const topRailLength = bannerWidth + 0.03;
    const topRailGeometry = new THREE.CylinderGeometry(topRailRadius, topRailRadius, topRailLength, 16);
    const topRail = new THREE.Mesh(topRailGeometry, silverMaterial);
    topRail.rotation.z = Math.PI / 2;
    topRail.position.y = baseRadius * 2 + bannerHeight + topRailRadius;
    topRail.castShadow = true;
    bannerStand.add(topRail);

    // Top rail end caps
    const topCapGeometry = new THREE.SphereGeometry(topRailRadius + 0.003, 16, 16);

    const topLeftCap = new THREE.Mesh(topCapGeometry, silverMaterial);
    topLeftCap.position.set(-topRailLength / 2, baseRadius * 2 + bannerHeight + topRailRadius, 0);
    bannerStand.add(topLeftCap);

    const topRightCap = new THREE.Mesh(topCapGeometry, silverMaterial);
    topRightCap.position.set(topRailLength / 2, baseRadius * 2 + bannerHeight + topRailRadius, 0);
    bannerStand.add(topRightCap);

    // ===== CENTER POLE (support) =====
    const poleGeometry = new THREE.CylinderGeometry(0.008, 0.008, 0.05, 12);
    const poleMesh = new THREE.Mesh(poleGeometry, silverMaterial);
    poleMesh.position.y = baseRadius * 2 + bannerHeight + topRailRadius + 0.025;
    poleMesh.position.z = -0.01;
    bannerStand.add(poleMesh);

    threejsScene.add(bannerStand);

    // Event listeners for rotation
    container.addEventListener('mousedown', onThreejsMouseDown);
    container.addEventListener('touchstart', onThreejsTouchStart, { passive: false });
    document.addEventListener('mousemove', onThreejsMouseMove);
    document.addEventListener('mouseup', onThreejsMouseUp);
    document.addEventListener('touchmove', onThreejsTouchMove, { passive: false });
    document.addEventListener('touchend', onThreejsTouchEnd);

    // Zoom with mouse wheel
    container.addEventListener('wheel', onThreejsWheel, { passive: false });

    // Handle resize
    window.addEventListener('resize', onThreejsResize);

    threejsInitialized = true;

    // Start animation loop
    animateThreejs();

    // Apply design texture
    updateBannerTexture();
}

function updateBannerTexture() {
    if (!bannerMesh || !canvas) return;

    // Create texture from design canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    texture.anisotropy = threejsRenderer ? threejsRenderer.capabilities.getMaxAnisotropy() : 1;

    bannerMesh.material.map = texture;
    bannerMesh.material.needsUpdate = true;
}

// Zoom handler
function onThreejsWheel(e) {
    e.preventDefault();
    targetZoom += e.deltaY * 0.005;
    targetZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, targetZoom));
}

function animateThreejs() {
    if (!threejsInitialized) return;

    requestAnimationFrame(animateThreejs);

    // Smooth rotation
    currentRotationY += (targetRotationY - currentRotationY) * 0.1;
    if (bannerStand) {
        bannerStand.rotation.y = currentRotationY;
    }

    // Smooth zoom
    currentZoom += (targetZoom - currentZoom) * 0.1;
    if (threejsCamera) {
        threejsCamera.position.z = currentZoom;
    }

    threejsRenderer.render(threejsScene, threejsCamera);
}

function onThreejsMouseDown(e) {
    isThreejsDragging = true;
    previousMouseX = e.clientX;
}

function onThreejsMouseMove(e) {
    if (!isThreejsDragging) return;

    const deltaX = e.clientX - previousMouseX;
    targetRotationY += deltaX * 0.01;

    // Clamp rotation
    targetRotationY = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetRotationY));

    previousMouseX = e.clientX;
}

function onThreejsMouseUp() {
    isThreejsDragging = false;
}

function onThreejsTouchStart(e) {
    if (e.touches.length === 1) {
        isThreejsDragging = true;
        previousMouseX = e.touches[0].clientX;
        e.preventDefault();
    }
}

function onThreejsTouchMove(e) {
    if (!isThreejsDragging || e.touches.length !== 1) return;

    const deltaX = e.touches[0].clientX - previousMouseX;
    targetRotationY += deltaX * 0.01;
    targetRotationY = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetRotationY));

    previousMouseX = e.touches[0].clientX;
    e.preventDefault();
}

function onThreejsTouchEnd() {
    isThreejsDragging = false;
}

function onThreejsResize() {
    const container = document.getElementById('threejs-container');
    if (!container || !threejsRenderer || !threejsCamera) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    threejsCamera.aspect = width / height;
    threejsCamera.updateProjectionMatrix();
    threejsRenderer.setSize(width, height);
}

function renderMockupCanvas() {
    // For Three.js, just update the texture
    if (threejsInitialized) {
        updateBannerTexture();
    }
}

// ========== Initialize Mockup View Toggle ==========
function initMockupViewToggle() {
    // Use event delegation on document to handle dynamically visible elements
    document.addEventListener('click', function(e) {
        const btn = e.target.closest('.view-toggle-btn');
        if (!btn) return;

        const view = btn.dataset.view;
        const flatPreview = document.getElementById('flatPreview');
        const mockupPreview = document.getElementById('mockupPreview');
        const toggleBtns = document.querySelectorAll('.view-toggle-btn');

        console.log('View toggle clicked:', view);

        // Update button states
        toggleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Show/hide previews
        if (view === 'flat') {
            flatPreview?.classList.remove('hidden');
            mockupPreview?.classList.add('hidden');
        } else if (view === 'mockup') {
            flatPreview?.classList.add('hidden');
            mockupPreview?.classList.remove('hidden');

            // Initialize Three.js if not done
            setTimeout(() => {
                initThreeJsMockup();
                updateBannerTexture();
            }, 100);
        }
    });
}

// Legacy rotation code - no longer needed but kept for reference
let mockupRotationY = -15;
let isDraggingMockup = false;
let lastMouseX = 0;

function initMockupRotation() {
    // Now handled by Three.js
}

function handleMockupMouseDown(e) {
    // Now handled by Three.js
}

function handleMockupMouseMove(e) {
    // Now handled by Three.js
}

function handleMockupMouseUp() {
    isDraggingMockup = false;
}

function handleMockupTouchStart(e) {
    if (e.target.closest('.view-toggle-btn')) return;
    if (e.touches.length === 1) {
        isDraggingMockup = true;
        lastMouseX = e.touches[0].clientX;
        e.preventDefault();
    }
}

function handleMockupTouchMove(e) {
    if (!isDraggingMockup || e.touches.length !== 1) return;

    const deltaX = e.touches[0].clientX - lastMouseX;
    mockupRotationY += deltaX * 0.5;
    mockupRotationY = Math.max(-60, Math.min(60, mockupRotationY));

    lastMouseX = e.touches[0].clientX;
    updateMockupRotation();
    e.preventDefault();
}

function handleMockupTouchEnd() {
    isDraggingMockup = false;
}

function updateMockupRotation() {
    const mockupStand = document.getElementById('mockupStand');
    if (mockupStand) {
        mockupStand.style.setProperty('--rotate-y', mockupRotationY + 'deg');
    }
}

// ========== Add to Cart ==========
function handleAddToCart() {
    if (!state.currentProduct || !state.selectedSize) {
        alert('Please complete your design first');
        return;
    }

    let totalPrice = state.selectedSize.price;
    state.selectedOptions.forEach(optionId => {
        const option = state.currentProduct.options.find(o => o.id === optionId);
        if (option) totalPrice += option.price;
    });

    const designImage = canvas.toDataURL('image/png');

    const item = {
        id: Date.now(),
        productId: state.currentProduct.id,
        name: state.currentProduct.name,
        size: state.selectedSize.label,
        options: state.selectedOptions.map(id => {
            const opt = state.currentProduct.options.find(o => o.id === id);
            return opt ? opt.label : '';
        }).filter(Boolean),
        price: totalPrice,
        design: designImage
    };

    state.cart.push(item);
    saveCart();
    updateCartUI();
    showSuccess('Added to cart!');

    setTimeout(() => {
        backToProducts();
    }, 1500);
}

// ========== Download Feather Flag PDF ==========
// Uses original B2Sign CMYK template and inserts artwork into ARTWORK HERE layer
async function downloadFeatherFlagPDF() {
    if (!canvas || !state.currentProduct || !state.selectedSize) {
        alert('Please complete your design first.');
        return;
    }

    showLoading(true);

    try {
        const { PDFDocument } = PDFLib;
        const sizeLabel = state.selectedSize.label;

        // Load the original B2Sign CMYK PDF template
        let pdfBytes;
        if (featherFlagPdfBytes) {
            pdfBytes = featherFlagPdfBytes.slice(0);
        } else {
            let response = null;
            for (const url of FEATHER_FLAG_TEMPLATE_URLS) {
                try {
                    response = await fetch(url);
                    if (response.ok) break;
                } catch (e) {
                    console.log('Failed to fetch PDF from:', url);
                }
            }
            if (!response || !response.ok) {
                throw new Error('Could not load B2Sign PDF template.');
            }
            pdfBytes = await response.arrayBuffer();
        }

        // Load the CMYK PDF template
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pages = pdfDoc.getPages();
        const page = pages[0];

        // Get page dimensions (in points)
        const { width: pageWidth, height: pageHeight } = page.getSize();
        console.log('B2Sign template size:', pageWidth, 'x', pageHeight, 'points');

        // Create high-res canvas for artwork at 150 DPI
        const dpi = 150;
        const pageWidthInches = pageWidth / 72;
        const pageHeightInches = pageHeight / 72;

        const printCanvas = document.createElement('canvas');
        printCanvas.width = Math.round(pageWidthInches * dpi);
        printCanvas.height = Math.round(pageHeightInches * dpi);
        const printCtx = printCanvas.getContext('2d');

        console.log('Artwork canvas size:', printCanvas.width, 'x', printCanvas.height);

        // Draw background filling entire canvas
        if (state.backgroundType === 'solid') {
            const color = document.getElementById('bgColor')?.value || '#ffffff';
            printCtx.fillStyle = color;
            printCtx.fillRect(0, 0, printCanvas.width, printCanvas.height);
        } else if (state.backgroundType === 'gradient') {
            const color1 = document.getElementById('gradColor1')?.value || '#667eea';
            const color2 = document.getElementById('gradColor2')?.value || '#764ba2';
            let gradient;
            switch (state.gradDirection) {
                case 'horizontal':
                    gradient = printCtx.createLinearGradient(0, 0, printCanvas.width, 0);
                    break;
                case 'vertical':
                    gradient = printCtx.createLinearGradient(0, 0, 0, printCanvas.height);
                    break;
                case 'diagonal':
                    gradient = printCtx.createLinearGradient(0, 0, printCanvas.width, printCanvas.height);
                    break;
                case 'radial':
                    gradient = printCtx.createRadialGradient(
                        printCanvas.width / 2, printCanvas.height / 2, 0,
                        printCanvas.width / 2, printCanvas.height / 2, Math.max(printCanvas.width, printCanvas.height) / 2
                    );
                    break;
                default:
                    gradient = printCtx.createLinearGradient(0, 0, printCanvas.width, 0);
            }
            gradient.addColorStop(0, color1);
            gradient.addColorStop(1, color2);
            printCtx.fillStyle = gradient;
            printCtx.fillRect(0, 0, printCanvas.width, printCanvas.height);
        }

        // Draw uploaded image
        if (state.uploadedImage) {
            const imgRatio = state.uploadedImage.width / state.uploadedImage.height;
            const canvasRatio = printCanvas.width / printCanvas.height;
            let x, y, width, height;

            if (state.photoFitMode === 'cover') {
                if (imgRatio > canvasRatio) {
                    height = printCanvas.height * (state.photoImageScale / 100);
                    width = height * imgRatio;
                } else {
                    width = printCanvas.width * (state.photoImageScale / 100);
                    height = width / imgRatio;
                }
                x = (printCanvas.width - width) * state.photoImageX;
                y = (printCanvas.height - height) * state.photoImageY;
            } else {
                width = printCanvas.width * 0.9 * (state.photoImageScale / 100);
                height = width / imgRatio;
                x = (printCanvas.width - width) / 2;
                y = (printCanvas.height - height) / 2;
            }
            printCtx.drawImage(state.uploadedImage, x, y, width, height);
        }

        // Draw logo if in logo mode
        if (state.designType === 'logo' && state.logoImage) {
            const logoSize = Math.min(printCanvas.width, printCanvas.height) * 0.6;
            const logoX = (printCanvas.width - logoSize) / 2;
            const logoY = (printCanvas.height - logoSize) / 2;
            printCtx.drawImage(state.logoImage, logoX, logoY, logoSize, logoSize);
        }

        // Convert canvas to PNG (better quality for print)
        const pngDataUrl = printCanvas.toDataURL('image/png');
        const pngData = pngDataUrl.split(',')[1];
        const pngImageBytes = Uint8Array.from(atob(pngData), c => c.charCodeAt(0));

        // Embed the artwork image into the CMYK PDF
        const artworkImage = await pdfDoc.embedPng(pngImageBytes);

        // Draw artwork filling entire page (behind existing template mask)
        // pdf-lib draws on top, but template mask layer stays visible
        page.drawImage(artworkImage, {
            x: 0,
            y: 0,
            width: pageWidth,
            height: pageHeight,
        });

        // Save the modified CMYK PDF
        const modifiedPdfBytes = await pdfDoc.save();

        // Download
        const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const productName = state.currentProduct.name.replace(/\s+/g, '_');
        const sizeName = sizeLabel.replace(/[^a-zA-Z0-9]/g, '_');
        link.download = `${productName}_${sizeName}_CMYK_PrintReady.pdf`;
        link.click();
        URL.revokeObjectURL(url);

        showSuccess(`CMYK PDF Downloaded! Using B2Sign template with your artwork.`);
    } catch (error) {
        console.error('PDF generation error:', error);
        alert('Error generating PDF: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// ========== Download PDF ==========
async function downloadPDF() {
    if (!canvas || !state.currentProduct || !state.selectedSize) {
        alert('Please complete your design first.');
        return;
    }

    // Check if this is a feather flag - use special PDF function
    if (isFeatherFlagProduct()) {
        return downloadFeatherFlagPDF();
    }

    showLoading(true);

    try {
        // Create a high-resolution canvas for better PDF quality
        // 4x scale gives us ~2000x1000 base canvas -> 8000x4000 output
        // This provides good quality for large format prints
        const scaleFactor = 4;
        const hiResCanvas = document.createElement('canvas');
        hiResCanvas.width = canvas.width * scaleFactor;
        hiResCanvas.height = canvas.height * scaleFactor;
        const hiResCtx = hiResCanvas.getContext('2d');

        // Enable high quality image rendering
        hiResCtx.imageSmoothingEnabled = true;
        hiResCtx.imageSmoothingQuality = 'high';

        // Scale and redraw at higher resolution
        hiResCtx.scale(scaleFactor, scaleFactor);

        // Redraw the design at higher resolution
        // Background
        hiResCtx.fillStyle = state.patternBgColor || '#ffffff';
        hiResCtx.fillRect(0, 0, canvas.width, canvas.height);

        if (state.designType === 'photo') {
            // Redraw photo mode content (same as drawPhotoMode but on hiResCtx)
            // Background
            if (state.backgroundType === 'solid') {
                const color = document.getElementById('bgColor')?.value || '#ffffff';
                hiResCtx.fillStyle = color;
                hiResCtx.fillRect(0, 0, canvas.width, canvas.height);
            } else if (state.backgroundType === 'gradient') {
                const color1 = document.getElementById('gradColor1')?.value || '#667eea';
                const color2 = document.getElementById('gradColor2')?.value || '#764ba2';
                let gradient;
                switch (state.gradDirection) {
                    case 'horizontal':
                        gradient = hiResCtx.createLinearGradient(0, 0, canvas.width, 0);
                        break;
                    case 'vertical':
                        gradient = hiResCtx.createLinearGradient(0, 0, 0, canvas.height);
                        break;
                    case 'diagonal':
                        gradient = hiResCtx.createLinearGradient(0, 0, canvas.width, canvas.height);
                        break;
                    case 'radial':
                        gradient = hiResCtx.createRadialGradient(
                            canvas.width / 2, canvas.height / 2, 0,
                            canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
                        );
                        break;
                    default:
                        gradient = hiResCtx.createLinearGradient(0, 0, canvas.width, 0);
                }
                gradient.addColorStop(0, color1);
                gradient.addColorStop(1, color2);
                hiResCtx.fillStyle = gradient;
                hiResCtx.fillRect(0, 0, canvas.width, canvas.height);
            } else if (state.backgroundType === 'ai' && state.backgroundImage) {
                drawAIBackground(hiResCtx, state.backgroundImage, canvas.width, canvas.height, state.aiBgScale, state.aiBgX, state.aiBgY);
            }

            // Draw uploaded image with position and scale
            if (state.uploadedImage) {
                let x, y, width, height;
                const imgRatio = state.uploadedImage.width / state.uploadedImage.height;
                const canvasRatio = canvas.width / canvas.height;

                if (state.photoFitMode === 'cover') {
                    if (imgRatio > canvasRatio) {
                        height = canvas.height * (state.photoImageScale / 100);
                        width = height * imgRatio;
                    } else {
                        width = canvas.width * (state.photoImageScale / 100);
                        height = width / imgRatio;
                    }
                    x = (canvas.width - width) * state.photoImageX;
                    y = (canvas.height - height) * state.photoImageY;
                } else if (state.photoFitMode === 'contain') {
                    if (imgRatio > canvasRatio) {
                        width = canvas.width * 0.9 * (state.photoImageScale / 100);
                        height = width / imgRatio;
                    } else {
                        height = canvas.height * 0.9 * (state.photoImageScale / 100);
                        width = height * imgRatio;
                    }
                    x = (canvas.width - width) / 2 + (state.photoImageX - 0.5) * canvas.width * 0.5;
                    y = (canvas.height - height) / 2 + (state.photoImageY - 0.5) * canvas.height * 0.5;
                } else {
                    width = state.uploadedImage.width * (state.photoImageScale / 100) * 0.5;
                    height = state.uploadedImage.height * (state.photoImageScale / 100) * 0.5;
                    x = canvas.width * state.photoImageX - width / 2;
                    y = canvas.height * state.photoImageY - height / 2;
                }
                hiResCtx.drawImage(state.uploadedImage, x, y, width, height);
            }

            // Draw text layers (up to 3)
            state.photoTextLayers.forEach((layer, index) => {
                if (!layer.enabled || !layer.text.trim()) return;

                hiResCtx.font = `bold ${layer.size}px ${layer.font}`;
                hiResCtx.fillStyle = layer.color;
                hiResCtx.textAlign = 'center';
                hiResCtx.textBaseline = 'middle';

                const textX = canvas.width * layer.x;
                const textY = canvas.height * layer.y;

                hiResCtx.fillText(layer.text, textX, textY);
            });
        } else if (state.designType === 'logo' && state.logoImage) {
            // For logo mode, redraw everything at high resolution
            // Background
            hiResCtx.fillStyle = state.patternBgColor || '#ffffff';
            hiResCtx.fillRect(0, 0, canvas.width, canvas.height);

            const logoWidth = state.logoSize;
            const logoHeight = (state.logoImage.height / state.logoImage.width) * logoWidth;
            const spacing = state.patternSpacing;
            const offsetX = state.patternOffsetX || 0;
            const offsetY = state.patternOffsetY || 0;
            const rotation = (state.patternRotation || 0) * Math.PI / 180;

            if (state.patternStyle === 'single') {
                // Single logo
                const singleWidth = state.singleLogoSize;
                const singleHeight = (state.logoImage.height / state.logoImage.width) * singleWidth;
                let textOffset = 0;
                if (state.showSingleText) textOffset += 50;
                if (state.showSingleTagline) textOffset += 30;
                const x = canvas.width * state.singleLogoX - singleWidth / 2;
                const y = canvas.height * state.singleLogoY - singleHeight / 2 - textOffset / 2;

                hiResCtx.drawImage(state.logoImage, x, y, singleWidth, singleHeight);

                let textY = y + singleHeight + 45;
                if (state.showSingleText) {
                    hiResCtx.font = `bold 36px ${state.singleTextFont}`;
                    hiResCtx.fillStyle = state.singleTextColor;
                    hiResCtx.textAlign = 'center';
                    hiResCtx.fillText(state.singleText, canvas.width * state.singleLogoX, textY);
                    textY += 35;
                }
                if (state.showSingleTagline) {
                    hiResCtx.font = `18px ${state.singleTaglineFont}`;
                    hiResCtx.fillStyle = state.singleTaglineColor;
                    hiResCtx.textAlign = 'center';
                    hiResCtx.fillText(state.singleTagline, canvas.width * state.singleLogoX, textY);
                }
            } else if (state.patternStyle === 'highlight') {
                // Highlight mode - pattern + positioned logo (with background and text)
                hiResCtx.save();
                hiResCtx.translate(canvas.width / 2 + offsetX, canvas.height / 2 + offsetY);
                hiResCtx.rotate(rotation);
                hiResCtx.translate(-canvas.width / 2, -canvas.height / 2);

                const smallLogoWidth = logoWidth * 0.6;
                const smallLogoHeight = (state.logoImage.height / state.logoImage.width) * smallLogoWidth;

                let rowIndex = 0;
                for (let py = -smallLogoHeight * 2; py < canvas.height + smallLogoHeight * 2; py += smallLogoHeight + spacing) {
                    const rowOffset = rowIndex % 2 === 0 ? 0 : (smallLogoWidth + spacing) / 2;
                    for (let px = -smallLogoWidth * 2 + rowOffset; px < canvas.width + smallLogoWidth * 2; px += smallLogoWidth + spacing) {
                        hiResCtx.globalAlpha = 0.3;
                        hiResCtx.drawImage(state.logoImage, px, py, smallLogoWidth, smallLogoHeight);
                    }
                    rowIndex++;
                }
                hiResCtx.restore();
                hiResCtx.globalAlpha = 1;

                let textOffset = 0;
                if (state.showHighlightText) textOffset += 50;
                if (state.showHighlightTagline) textOffset += 30;

                const highlightWidth = state.highlightSize;
                const highlightHeight = (state.logoImage.height / state.logoImage.width) * highlightWidth;

                // Use highlightLogoX/Y for positioning
                const logoCenterX = canvas.width * state.highlightLogoX;
                const logoCenterY = canvas.height * state.highlightLogoY;
                const centerX = logoCenterX - highlightWidth / 2;
                const centerY = logoCenterY - highlightHeight / 2 - textOffset / 2;

                // Background behind highlight logo
                if (state.showHighlightBg) {
                    const paddingPercent = (state.highlightBgSize - 100) / 100;
                    const padding = Math.min(highlightWidth, highlightHeight) * paddingPercent;
                    const bgWidth = highlightWidth + padding * 2;
                    const bgHeight = highlightHeight + padding * 2;
                    const bgX = centerX - padding;
                    const bgY = centerY - padding;

                    hiResCtx.fillStyle = state.highlightBgColor;
                    if (state.highlightBgShape === 'circle') {
                        const radius = Math.max(bgWidth, bgHeight) / 2;
                        hiResCtx.beginPath();
                        hiResCtx.arc(centerX + highlightWidth / 2, centerY + highlightHeight / 2, radius, 0, Math.PI * 2);
                        hiResCtx.fill();
                    } else if (state.highlightBgShape === 'rounded') {
                        hiResCtx.beginPath();
                        hiResCtx.roundRect(bgX, bgY, bgWidth, bgHeight, padding * 0.5);
                        hiResCtx.fill();
                    } else {
                        hiResCtx.fillRect(bgX, bgY, bgWidth, bgHeight);
                    }
                }

                hiResCtx.drawImage(state.logoImage, centerX, centerY, highlightWidth, highlightHeight);

                let textY = centerY + highlightHeight + 45;
                if (state.showHighlightText) {
                    hiResCtx.font = `bold 36px ${state.highlightTextFont}`;
                    hiResCtx.fillStyle = state.highlightTextColor;
                    hiResCtx.textAlign = 'center';
                    hiResCtx.fillText(state.highlightText, logoCenterX, textY);
                    textY += 35;
                }
                if (state.showHighlightTagline) {
                    hiResCtx.font = `18px ${state.highlightTaglineFont}`;
                    hiResCtx.fillStyle = state.highlightTaglineColor;
                    hiResCtx.textAlign = 'center';
                    hiResCtx.fillText(state.highlightTagline, logoCenterX, textY);
                }
            } else {
                // Grid, Diagonal, Offset patterns
                hiResCtx.save();
                hiResCtx.translate(canvas.width / 2 + offsetX, canvas.height / 2 + offsetY);
                hiResCtx.rotate(rotation);
                hiResCtx.translate(-canvas.width / 2, -canvas.height / 2);

                if (state.patternStyle === 'diagonal') {
                    hiResCtx.rotate(-Math.PI / 6);
                    for (let py = -logoHeight * 3; py < canvas.height * 3; py += logoHeight + spacing) {
                        for (let px = -logoWidth * 3; px < canvas.width * 3; px += logoWidth + spacing) {
                            hiResCtx.drawImage(state.logoImage, px, py, logoWidth, logoHeight);
                        }
                    }
                } else if (state.patternStyle === 'offset') {
                    let rowIndex = 0;
                    for (let py = -logoHeight * 2; py < canvas.height + logoHeight * 2; py += logoHeight + spacing) {
                        const rowOffset = rowIndex % 2 === 0 ? 0 : (logoWidth + spacing) / 2;
                        for (let px = -logoWidth * 2 + rowOffset; px < canvas.width + logoWidth * 2; px += logoWidth + spacing) {
                            hiResCtx.drawImage(state.logoImage, px, py, logoWidth, logoHeight);
                        }
                        rowIndex++;
                    }
                } else {
                    // Grid
                    for (let py = -logoHeight * 2; py < canvas.height + logoHeight * 2; py += logoHeight + spacing) {
                        for (let px = -logoWidth * 2; px < canvas.width + logoWidth * 2; px += logoWidth + spacing) {
                            hiResCtx.drawImage(state.logoImage, px, py, logoWidth, logoHeight);
                        }
                    }
                }
                hiResCtx.restore();
            }
        }

        // Reset scale for getting image data
        hiResCtx.setTransform(1, 0, 0, 1, 0, 0);

        // Get high-resolution image data - use PNG for better quality
        const imageData = hiResCanvas.toDataURL('image/png');

        // Use product dimensions directly from state
        const sizeLabel = state.selectedSize.label;
        let width = state.selectedSize.width;
        let height = state.selectedSize.height;

        // Determine unit from label
        let unit;
        if (sizeLabel.includes('ft')) {
            unit = 'ft';
        } else if (sizeLabel.includes('"') || sizeLabel.includes('in')) {
            unit = 'in';
        } else {
            // Guess based on numeric value - dimensions > 20 are likely inches
            unit = (width > 20 || height > 20) ? 'in' : 'ft';
        }

        console.log(`Generating PDF: ${width} x ${height} ${unit} (canvas: ${canvas.width}x${canvas.height})`);

        // Call server API for CMYK PDF generation
        const response = await fetch(`${CONFIG.API_URL}/api/generate-pdf`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                imageData: imageData,
                width: width,
                height: height,
                unit: unit,
                dpi: 300,  // Higher DPI for better print quality
                productName: state.currentProduct.name,
                hasSvgLogo: !!state.logoSvgData  // Flag for potential future SVG support
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'PDF generation failed');
        }

        const data = await response.json();

        if (data.success && data.pdf) {
            // Convert base64 to Blob for reliable download (Chrome blocks data: URLs)
            const base64Data = data.pdf.split(',')[1];
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: 'application/pdf' });

            // Create object URL and download
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = data.filename || 'PrintPilot_Design_PRINT.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up blob URL
            setTimeout(() => URL.revokeObjectURL(blobUrl), 100);

            // Show specs to user
            const specs = data.specs;
            showSuccess(`PDF Downloaded! Trim: ${specs.trimSize} | Bleed: ${specs.bleed} | ${specs.colorSpace}`);

            console.log('PDF Specs:', specs);
        } else {
            throw new Error('No PDF data in response');
        }

    } catch (error) {
        console.error('PDF generation error:', error);

        // Fallback to client-side PDF if server fails
        if (typeof window.jspdf !== 'undefined') {
            console.log('Falling back to client-side PDF generation...');
            downloadPDFFallback();
        } else {
            alert(`Error generating PDF: ${error.message}`);
        }
    } finally {
        showLoading(false);
    }
}

// Fallback client-side PDF (RGB only)
function downloadPDFFallback() {
    try {
        const { jsPDF } = window.jspdf;

        const dpi = 150;
        const mmPerInch = 25.4;
        const pdfWidth = (canvas.width / dpi) * mmPerInch;
        const pdfHeight = (canvas.height / dpi) * mmPerInch;

        const pdf = new jsPDF({
            orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
            unit: 'mm',
            format: [pdfWidth, pdfHeight]
        });

        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

        const productName = state.currentProduct?.name || 'design';
        const size = state.selectedSize?.label || '';
        const filename = `PrintPilot_${productName.replace(/\s+/g, '_')}_${size.replace(/\s+/g, '_')}_RGB_PRINT.pdf`;

        pdf.save(filename);
        showSuccess('PDF downloaded (RGB fallback)');
    } catch (error) {
        console.error('Fallback PDF error:', error);
        alert('Error generating PDF. Please try again.');
    }
}

// ========== Cart Functions ==========
function openCart() {
    document.getElementById('cartModal')?.classList.remove('hidden');
    renderCart();
}

function closeCartModal() {
    document.getElementById('cartModal')?.classList.add('hidden');
}

function updateCartUI() {
    const countEl = document.getElementById('cartCount');
    if (countEl) {
        countEl.textContent = state.cart.length;
    }
}

function renderCart() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    if (!cartItems) return;

    if (state.cart.length === 0) {
        cartItems.innerHTML = '<p class="cart-empty">Your cart is empty</p>';
        if (cartTotal) cartTotal.textContent = '$0.00';
        return;
    }

    let total = 0;
    cartItems.innerHTML = state.cart.map(item => {
        total += item.price;
        return `
            <div class="cart-item">
                <img src="${item.design}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <p class="cart-item-size">${item.size}</p>
                    ${item.options.length > 0 ? `<p class="cart-item-options">${item.options.join(', ')}</p>` : ''}
                    <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        `;
    }).join('');

    if (cartTotal) cartTotal.textContent = '$' + total.toFixed(2);
}

function removeFromCart(id) {
    state.cart = state.cart.filter(item => item.id !== id);
    saveCart();
    updateCartUI();
    renderCart();
    showSuccess('Item removed');
}

function saveCart() {
    localStorage.setItem('printpilot_cart', JSON.stringify(state.cart));
}

// ========== UI Helpers ==========
function showLoading(show) {
    const indicator = document.getElementById('loadingIndicator');
    if (indicator) {
        indicator.classList.toggle('hidden', !show);
    }
}

function showSuccess(message) {
    const notification = document.getElementById('successNotification');
    const messageEl = document.getElementById('successMessage');

    if (notification && messageEl) {
        messageEl.textContent = message;
        notification.classList.remove('hidden');

        setTimeout(() => {
            notification.classList.add('hidden');
        }, 3000);
    }
}
