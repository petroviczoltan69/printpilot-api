// PrintPilot AI - Main Application

// ========== Configuration ==========
const CONFIG = {
    // API Keys - VAZNO: Prebaciti na backend za produkciju!
    OPENAI_API_KEY: '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',
    CLIPDROP_API_KEY: '3cbd14e61caf622cd51cb12a24e1d7eede5ffaaae0ae0a564bcfd1ae9e0ffad16a0d23c0132d2a0aa1d5bf31619b3238',
    API_URL: 'https://printpilot-api.vercel.app'
};

// ========== State Management ==========
let cart = [];
let currentProduct = null;
let canvas, ctx;
let uploadedImage = null;
let backgroundImage = null;
let textElements = [];
let originalImageData = null;

// ========== Initialize ==========
window.onload = function() {
    canvas = document.getElementById('previewCanvas');
    ctx = canvas.getContext('2d');
    updateCanvas();

    // Load cart from localStorage
    const savedCart = localStorage.getItem('printpilot_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }

    // Initialize event listeners
    initEventListeners();
};

// ========== Event Listeners ==========
function initEventListeners() {
    // Upload zone
    document.getElementById('uploadZone').addEventListener('click', () => {
        document.getElementById('imageUpload').click();
    });

    // Image upload
    document.getElementById('imageUpload').addEventListener('change', handleImageUpload);

    // Remove background
    document.getElementById('removeBackground').addEventListener('click', removeBackground);

    // Background type change
    document.getElementById('bgType').addEventListener('change', handleBackgroundTypeChange);

    // Color changes
    document.getElementById('bgColor').addEventListener('input', updateCanvas);
    document.getElementById('gradColor1').addEventListener('input', updateCanvas);
    document.getElementById('gradColor2').addEventListener('input', updateCanvas);

    // AI background generation
    document.getElementById('generateBackground').addEventListener('click', generateAIBackground);

    // Text controls
    document.getElementById('fontSize').addEventListener('input', function() {
        document.getElementById('fontSizeValue').textContent = this.value + 'px';
        updateCanvas();
    });
    document.getElementById('textColor').addEventListener('input', updateCanvas);
    document.getElementById('fontFamily').addEventListener('change', updateCanvas);
    document.getElementById('textContent').addEventListener('input', updateCanvas);
    document.getElementById('addText').addEventListener('click', addTextLayer);

    // Cart
    document.getElementById('addToCart').addEventListener('click', addToCart);
    document.getElementById('cartBtn').addEventListener('click', openCart);

    // Close cart when clicking outside
    document.getElementById('cartModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeCart();
        }
    });
}

// ========== Product Selection ==========
function selectProduct(type, name, price) {
    currentProduct = { type, name, price };
    document.getElementById('designStudio').classList.remove('hidden');
    document.getElementById('productPrice').textContent = price.toFixed(2);
    setTimeout(() => {
        document.getElementById('designStudio').scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

// ========== Image Upload ==========
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 10 * 1024 * 1024) {
            alert('File too large! Please use an image under 10MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                uploadedImage = img;
                originalImageData = event.target.result;

                // Show preview
                document.getElementById('imagePreview').src = event.target.result;
                document.getElementById('imagePreviewContainer').classList.remove('hidden');

                updateCanvas();
                showSuccess('Image uploaded successfully!');
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// ========== Professional Background Removal via Vercel API ==========
async function removeBackground() {
    if (!uploadedImage) return;

    showLoading(true);

    try {
        console.log('Starting background removal with Vercel API...');

        // Call your Vercel API
        const response = await fetch(`${CONFIG.API_URL}/api/remove-background`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                imageData: originalImageData
            })
        });

        console.log('API response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API error:', errorData);
            throw new Error(errorData.error || 'API request failed');
        }

        const data = await response.json();
        console.log('API response received');

        if (data.success && data.image) {
            // Load the processed image
            const img = new Image();
            img.onload = function() {
                uploadedImage = img;
                document.getElementById('imagePreview').src = data.image;
                updateCanvas();
                showSuccess('Background removed perfectly with AI!');
                console.log('Background removal successful!');
            };
            img.onerror = function() {
                console.error('Error loading processed image');
                throw new Error('Failed to load processed image');
            };
            img.src = data.image;
        } else {
            throw new Error('No processed image in response');
        }

    } catch (error) {
        console.error('Full error:', error);
        alert(`Error removing background: ${error.message}\n\nPlease check:\n- Your Vercel API is running\n- You have Clipdrop API credits\n- Image format is supported`);
    } finally {
        showLoading(false);
    }
}

// ========== Background Options ==========
function handleBackgroundTypeChange() {
    const type = this.value;
    document.getElementById('solidColorOptions').classList.add('hidden');
    document.getElementById('gradientOptions').classList.add('hidden');
    document.getElementById('aiGenerateOptions').classList.add('hidden');

    if (type === 'solid') {
        document.getElementById('solidColorOptions').classList.remove('hidden');
    } else if (type === 'gradient') {
        document.getElementById('gradientOptions').classList.remove('hidden');
    } else if (type === 'ai') {
        document.getElementById('aiGenerateOptions').classList.remove('hidden');
    }

    updateCanvas();
}

// ========== AI Background Generation ==========
async function generateAIBackground() {
    const prompt = document.getElementById('aiPrompt').value.trim();

    if (!prompt) {
        alert('Please describe the background you want to generate');
        return;
    }

    showLoading(true);

    try {
        console.log('Generating background with prompt:', prompt);

        // Call Vercel API instead of OpenAI directly
        const response = await fetch(`${CONFIG.API_URL}/api/generate-background`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: prompt })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            throw new Error(errorData.error || errorData.details || 'Failed to generate image');
        }

        const data = await response.json();
        console.log('API Response:', data);

        if (data.success && data.imageUrl) {
            const img = new Image();
            img.crossOrigin = "anonymous";

            img.onload = function() {
                backgroundImage = img;
                updateCanvas();
                showSuccess('AI background generated successfully!');
            };

            img.onerror = function() {
                // Fallback: try loading without crossOrigin
                const img2 = new Image();
                img2.onload = function() {
                    backgroundImage = img2;
                    updateCanvas();
                    showSuccess('AI background generated successfully!');
                };
                img2.src = data.imageUrl;
            };

            img.src = data.imageUrl;
        } else {
            throw new Error('No image URL in response');
        }

    } catch (error) {
        console.error('Full error:', error);
        alert(`Error: ${error.message}\n\nTip: Make sure the API is configured correctly.`);
    } finally {
        showLoading(false);
    }
}

// ========== Text Controls ==========
function addTextLayer() {
    const text = document.getElementById('textContent').value.trim();
    if (text) {
        textElements.push({
            text: text,
            x: canvas.width / 2,
            y: canvas.height / 2,
            fontSize: document.getElementById('fontSize').value,
            color: document.getElementById('textColor').value,
            fontFamily: document.getElementById('fontFamily').value
        });
        document.getElementById('textContent').value = '';
        updateCanvas();
        showSuccess('Text layer added!');
    }
}

// ========== Canvas Update ==========
function updateCanvas() {
    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw background
    const bgType = document.getElementById('bgType').value;

    if (bgType === 'solid') {
        ctx.fillStyle = document.getElementById('bgColor').value;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (bgType === 'gradient') {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, document.getElementById('gradColor1').value);
        gradient.addColorStop(1, document.getElementById('gradColor2').value);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (bgType === 'ai' && backgroundImage) {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    }

    // Draw uploaded image (centered and scaled)
    if (uploadedImage) {
        const maxWidth = canvas.width * 0.6;
        const maxHeight = canvas.height * 0.6;
        const scale = Math.min(maxWidth / uploadedImage.width, maxHeight / uploadedImage.height);

        const width = uploadedImage.width * scale;
        const height = uploadedImage.height * scale;
        const x = (canvas.width - width) / 2;
        const y = (canvas.height - height) / 2;

        // Add shadow for depth
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 10;

        ctx.drawImage(uploadedImage, x, y, width, height);

        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }

    // Draw text elements
    textElements.forEach(element => {
        ctx.font = `bold ${element.fontSize}px ${element.fontFamily}`;
        ctx.fillStyle = element.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Add text shadow for better visibility
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;

        ctx.fillText(element.text, element.x, element.y);

        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    });

    // Draw current text preview (semi-transparent)
    const currentText = document.getElementById('textContent').value.trim();
    if (currentText) {
        const fontSize = document.getElementById('fontSize').value;
        const fontFamily = document.getElementById('fontFamily').value;
        const color = document.getElementById('textColor').value;

        ctx.font = `bold ${fontSize}px ${fontFamily}`;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = 0.6;

        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;

        ctx.fillText(currentText, canvas.width / 2, canvas.height / 2);

        ctx.globalAlpha = 1.0;
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }
}

// ========== Cart Management ==========
function addToCart() {
    if (!currentProduct) {
        alert('Please select a product first');
        return;
    }

    // Capture canvas as image
    const designImage = canvas.toDataURL('image/png');

    const item = {
        ...currentProduct,
        design: designImage,
        id: Date.now()
    };

    cart.push(item);
    saveCart();
    updateCartUI();
    showSuccess('Added to cart successfully!');
}

function openCart() {
    document.getElementById('cartModal').classList.remove('hidden');
    renderCart();
}

function closeCart() {
    document.getElementById('cartModal').classList.add('hidden');
}

function updateCartUI() {
    document.getElementById('cartCount').textContent = cart.length;
}

function renderCart() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="text-gray-400 text-center py-12">Your cart is empty</p>';
        cartTotal.textContent = '0.00';
        return;
    }

    let total = 0;
    cartItems.innerHTML = cart.map(item => {
        total += item.price;
        return `
            <div class="glass rounded-xl p-4 flex gap-4 items-center">
                <img src="${item.design}" alt="${item.name}" class="w-32 h-32 object-cover rounded-lg border-2 border-gray-700">
                <div class="flex-1">
                    <h3 class="font-display font-bold text-lg text-white">${item.name}</h3>
                    <p class="text-gray-400 text-sm mt-1">${item.type}</p>
                    <p class="text-gradient font-bold text-xl mt-2">$${item.price.toFixed(2)}</p>
                </div>
                <button onclick="removeFromCart(${item.id})" class="text-red-400 hover:text-red-300 transition text-2xl px-4">
                    Delete
                </button>
            </div>
        `;
    }).join('');

    cartTotal.textContent = total.toFixed(2);
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartUI();
    renderCart();
    showSuccess('Item removed from cart');
}

function saveCart() {
    localStorage.setItem('printpilot_cart', JSON.stringify(cart));
}

// ========== UI Helpers ==========
function showLoading(show) {
    document.getElementById('loadingIndicator').classList.toggle('hidden', !show);
}

function showSuccess(message) {
    const notification = document.getElementById('successNotification');
    document.getElementById('successMessage').textContent = message;
    notification.classList.remove('hidden');

    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}
