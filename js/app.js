// PrintPilot - Main Application
// Redesigned with step-by-step wizard and multiple design modes

// ========== Configuration ==========
const CONFIG = {
    API_URL: 'https://printpilot-api.vercel.app'
};

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
            { label: '24" x 80"', width: 24, height: 80, price: 79.99 },
            { label: '33" x 80"', width: 33, height: 80, price: 99.99 },
            { label: '47" x 80"', width: 47, height: 80, price: 149.99 }
        ],
        options: [
            { id: 'premium-base', label: 'Premium Base', price: 30 },
            { id: 'travel-bag', label: 'Padded Travel Bag', price: 15 }
        ],
        canvasRatio: 0.4
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
    'table-cover': {
        name: 'Table Covers',
        category: 'tradeshow',
        sizes: [
            { label: '4ft Table', width: 4, height: 2.5, price: 69.99 },
            { label: '6ft Table', width: 6, height: 2.5, price: 89.99 },
            { label: '8ft Table', width: 8, height: 2.5, price: 119.99 }
        ],
        options: [
            { id: 'fitted', label: 'Fitted Style', price: 0, default: true },
            { id: 'throw', label: 'Throw Style', price: 0 },
            { id: 'stretch', label: 'Stretch Fabric', price: 30 }
        ],
        canvasRatio: 2.4
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
    textElements: [],
    logoImage: null,
    patternStyle: 'grid',
    logoSize: 150,
    patternSpacing: 20,
    patternBgColor: '#ffffff'
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

    // Initial canvas draw
    if (ctx) updateCanvas();
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

    const fontSize = document.getElementById('fontSize');
    if (fontSize) {
        fontSize.addEventListener('input', function() {
            document.getElementById('fontSizeValue').textContent = this.value + 'px';
            updateCanvas();
        });
    }
    document.getElementById('textColor')?.addEventListener('input', updateCanvas);
    document.getElementById('fontFamily')?.addEventListener('change', updateCanvas);
    document.getElementById('textContent')?.addEventListener('input', updateCanvas);
    document.getElementById('addText')?.addEventListener('click', addTextLayer);
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
        document.getElementById('uploadedLogo')?.classList.add('hidden');
        document.getElementById('logoUploadZone')?.classList.remove('hidden');
        updateCanvas();
    });

    document.querySelectorAll('.pattern-btn').forEach(btn => {
        btn.addEventListener('click', handlePatternStyleChange);
    });

    const logoSize = document.getElementById('logoSize');
    const patternSpacing = document.getElementById('patternSpacing');
    const patternBgColor = document.getElementById('patternBgColor');

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
    state.textElements = [];
    state.logoImage = null;
    state.patternStyle = 'grid';
    state.logoSize = 150;
    state.patternSpacing = 20;
    state.patternBgColor = '#ffffff';

    // Reset UI elements
    document.getElementById('uploadedImage')?.classList.add('hidden');
    document.getElementById('uploadZone')?.classList.remove('hidden');
    document.getElementById('removeBackground')?.classList.add('hidden');
    document.getElementById('uploadedLogo')?.classList.add('hidden');
    document.getElementById('logoUploadZone')?.classList.remove('hidden');

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
        if (btn.dataset.pattern === 'grid') btn.classList.add('active');
    });

    // Reset sliders
    const logoSizeEl = document.getElementById('logoSize');
    const spacingEl = document.getElementById('patternSpacing');
    const patternBgEl = document.getElementById('patternBgColor');

    if (logoSizeEl) {
        logoSizeEl.value = 150;
        document.getElementById('logoSizeValue').textContent = '150px';
    }
    if (spacingEl) {
        spacingEl.value = 20;
        document.getElementById('spacingValue').textContent = '20px';
    }
    if (patternBgEl) patternBgEl.value = '#ffffff';

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

    if (state.currentProduct.options.length === 0) {
        container.innerHTML = '<p class="no-options">No additional options available</p>';
        return;
    }

    container.innerHTML = state.currentProduct.options.map(option => `
        <label class="option-checkbox ${state.selectedOptions.includes(option.id) ? 'selected' : ''}">
            <input type="checkbox" value="${option.id}" ${state.selectedOptions.includes(option.id) ? 'checked' : ''}>
            <span class="option-label">${option.label}</span>
            <span class="option-price">${option.price > 0 ? '+$' + option.price.toFixed(2) : 'Included'}</span>
        </label>
    `).join('');

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

    const ratio = state.currentProduct.canvasRatio || 2;
    const baseHeight = 500;
    const baseWidth = baseHeight * ratio;

    canvas.width = baseWidth;
    canvas.height = baseHeight;

    if (finalCanvas) {
        finalCanvas.width = baseWidth;
        finalCanvas.height = baseHeight;
    }

    const previewSize = document.getElementById('previewSize');
    if (previewSize) {
        previewSize.textContent = state.selectedSize.label;
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

            const preview = document.getElementById('imagePreview');
            const uploadedContainer = document.getElementById('uploadedImage');
            const uploadZone = document.getElementById('uploadZone');
            const removeBtn = document.getElementById('removeBackground');

            if (preview) preview.src = event.target.result;
            if (uploadedContainer) uploadedContainer.classList.remove('hidden');
            if (uploadZone) uploadZone.classList.add('hidden');
            if (removeBtn) removeBtn.classList.remove('hidden');

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

    const reader = new FileReader();
    reader.onload = function(event) {
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
            showSuccess('Logo uploaded successfully!');
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
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

    if (state.backgroundType === 'solid') {
        document.getElementById('solidBgOptions')?.classList.remove('hidden');
    } else if (state.backgroundType === 'gradient') {
        document.getElementById('gradientBgOptions')?.classList.remove('hidden');
    } else if (state.backgroundType === 'ai') {
        document.getElementById('aiBgOptions')?.classList.remove('hidden');
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
                updateCanvas();
                showSuccess('AI background generated!');
            };

            img.onerror = function() {
                const img2 = new Image();
                img2.onload = function() {
                    state.backgroundImage = img2;
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

// ========== Canvas Update ==========
function updateCanvas() {
    if (!ctx || !canvas) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (state.designType === 'photo') {
        drawPhotoMode();
    } else if (state.designType === 'logo') {
        drawLogoMode();
    }
}

// ========== Draw Photo Mode ==========
function drawPhotoMode() {
    if (state.backgroundType === 'solid') {
        const color = document.getElementById('bgColor')?.value || '#ffffff';
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (state.backgroundType === 'gradient') {
        const color1 = document.getElementById('gradColor1')?.value || '#667eea';
        const color2 = document.getElementById('gradColor2')?.value || '#764ba2';
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (state.backgroundType === 'ai' && state.backgroundImage) {
        ctx.drawImage(state.backgroundImage, 0, 0, canvas.width, canvas.height);
    }

    if (state.uploadedImage) {
        const maxWidth = canvas.width * 0.6;
        const maxHeight = canvas.height * 0.7;
        const scale = Math.min(maxWidth / state.uploadedImage.width, maxHeight / state.uploadedImage.height);

        const width = state.uploadedImage.width * scale;
        const height = state.uploadedImage.height * scale;
        const x = (canvas.width - width) / 2;
        const y = (canvas.height - height) / 2 - 20;

        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetY = 10;

        ctx.drawImage(state.uploadedImage, x, y, width, height);

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
    }

    state.textElements.forEach(element => {
        ctx.font = `bold ${element.fontSize}px ${element.fontFamily}`;
        ctx.fillStyle = element.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        ctx.fillText(element.text, element.x, element.y);

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
    });

    const currentText = document.getElementById('textContent')?.value.trim();
    if (currentText) {
        const fontSize = document.getElementById('fontSize')?.value || 60;
        const fontFamily = document.getElementById('fontFamily')?.value || 'Impact';
        const color = document.getElementById('textColor')?.value || '#000000';

        ctx.font = `bold ${fontSize}px ${fontFamily}`;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.globalAlpha = 0.5;
        ctx.fillText(currentText, canvas.width / 2, canvas.height - 80);
        ctx.globalAlpha = 1.0;
    }
}

// ========== Draw Logo Mode ==========
function drawLogoMode() {
    ctx.fillStyle = state.patternBgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!state.logoImage) return;

    const logoWidth = state.logoSize;
    const logoHeight = (state.logoImage.height / state.logoImage.width) * logoWidth;
    const spacing = state.patternSpacing;

    if (state.patternStyle === 'grid') {
        for (let y = -logoHeight; y < canvas.height + logoHeight; y += logoHeight + spacing) {
            for (let x = -logoWidth; x < canvas.width + logoWidth; x += logoWidth + spacing) {
                ctx.drawImage(state.logoImage, x, y, logoWidth, logoHeight);
            }
        }
    } else if (state.patternStyle === 'diagonal') {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-Math.PI / 6);
        ctx.translate(-canvas.width, -canvas.height);

        for (let y = -logoHeight * 2; y < canvas.height * 3; y += logoHeight + spacing) {
            for (let x = -logoWidth * 2; x < canvas.width * 3; x += logoWidth + spacing) {
                ctx.drawImage(state.logoImage, x, y, logoWidth, logoHeight);
            }
        }
        ctx.restore();
    } else if (state.patternStyle === 'offset') {
        let rowIndex = 0;
        for (let y = -logoHeight; y < canvas.height + logoHeight; y += logoHeight + spacing) {
            const offset = rowIndex % 2 === 0 ? 0 : (logoWidth + spacing) / 2;
            for (let x = -logoWidth + offset; x < canvas.width + logoWidth; x += logoWidth + spacing) {
                ctx.drawImage(state.logoImage, x, y, logoWidth, logoHeight);
            }
            rowIndex++;
        }
    }
}

// ========== Update Review Panel ==========
function updateReviewPanel() {
    const summaryProduct = document.getElementById('summaryProduct');
    const summarySize = document.getElementById('summarySize');
    const summaryOptions = document.getElementById('summaryOptions');
    const summaryTotal = document.getElementById('summaryTotal');

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
}

// ========== Copy to Final Canvas ==========
function copyToFinalCanvas() {
    if (!finalCtx || !canvas) return;
    finalCtx.drawImage(canvas, 0, 0);
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

// ========== Download PDF ==========
async function downloadPDF() {
    if (!canvas || !state.currentProduct || !state.selectedSize) {
        alert('Please complete your design first.');
        return;
    }

    showLoading(true);

    try {
        // Get canvas image data
        const imageData = canvas.toDataURL('image/png', 1.0);

        // Parse size dimensions from label (e.g., "2ft x 4ft" or "24" x 36"")
        const sizeLabel = state.selectedSize.label;
        let width, height, unit;

        // Check for feet (ft)
        const ftMatch = sizeLabel.match(/(\d+(?:\.\d+)?)\s*ft?\s*x\s*(\d+(?:\.\d+)?)\s*ft?/i);
        // Check for inches (", in, inches)
        const inMatch = sizeLabel.match(/(\d+(?:\.\d+)?)["\s]*(?:in|inches?)?\s*x\s*(\d+(?:\.\d+)?)["\s]*(?:in|inches?)?/i);

        if (ftMatch) {
            width = parseFloat(ftMatch[1]);
            height = parseFloat(ftMatch[2]);
            unit = 'ft';
        } else if (inMatch) {
            width = parseFloat(inMatch[1]);
            height = parseFloat(inMatch[2]);
            unit = 'in';
        } else {
            // Fallback to product data
            width = state.selectedSize.width;
            height = state.selectedSize.height;
            unit = width > 20 ? 'in' : 'ft'; // Guess based on size
        }

        console.log(`Generating PDF: ${width} x ${height} ${unit}`);

        // Call server API for CMYK PDF generation
        const response = await fetch(`${CONFIG.API_URL}/api/generate-pdf`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                imageData: imageData,
                width: width,
                height: height,
                unit: unit,
                dpi: 150,
                productName: state.currentProduct.name
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'PDF generation failed');
        }

        const data = await response.json();

        if (data.success && data.pdf) {
            // Download the PDF
            const link = document.createElement('a');
            link.href = data.pdf;
            link.download = data.filename || 'PrintPilot_Design_CMYK_PRINT.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Show specs to user
            const specs = data.specs;
            showSuccess(`PDF Downloaded! ${specs.dimensions} at ${specs.dpi} DPI, ${specs.colorSpace}`);

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
