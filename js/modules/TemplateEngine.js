/**
 * TemplateEngine - Universal SVG Template Loader and Renderer
 *
 * Handles loading, parsing, and rendering of SVG templates for print products.
 * Supports any product shape with standardized SVG template structure.
 *
 * Template SVG Structure:
 * - viewBox: defines aspect ratio and coordinate system
 * - TEMPLATE_MASK layer: gray overlay with transparent cutout for artwork
 * - ARTWORK_HERE layer (optional): visual guide for artwork placement
 * - Uses fill-rule: evenodd for transparent cutout effect
 */

class TemplateEngine {
    constructor(options = {}) {
        this.templatesPath = options.templatesPath || '/templates/';
        this.configPath = options.configPath || '/config/products.json';
        this.cache = new Map(); // Cache loaded templates
        this.config = null;
        this.onTemplateLoad = options.onTemplateLoad || null;
    }

    /**
     * Initialize the engine - load product config
     */
    async init() {
        try {
            const response = await fetch(this.configPath);
            if (!response.ok) throw new Error(`Failed to load config: ${response.status}`);
            this.config = await response.json();
            console.log('TemplateEngine initialized with', Object.keys(this.config.products).length, 'products');
            return this.config;
        } catch (error) {
            console.error('TemplateEngine init error:', error);
            throw error;
        }
    }

    /**
     * Get product configuration by ID
     */
    getProduct(productId) {
        if (!this.config) throw new Error('TemplateEngine not initialized');
        return this.config.products[productId] || null;
    }

    /**
     * Get all products
     */
    getAllProducts() {
        if (!this.config) throw new Error('TemplateEngine not initialized');
        return this.config.products;
    }

    /**
     * Get products by category
     */
    getProductsByCategory(categoryId) {
        if (!this.config) throw new Error('TemplateEngine not initialized');
        return Object.values(this.config.products).filter(p => p.category === categoryId);
    }

    /**
     * Get size configuration for a product
     */
    getSize(productId, sizeId) {
        const product = this.getProduct(productId);
        if (!product) return null;
        return product.sizes.find(s => s.id === sizeId) || product.sizes[0];
    }

    /**
     * Load SVG template for a product size
     * Returns parsed template object with metadata
     */
    async loadTemplate(productId, sizeId) {
        const size = this.getSize(productId, sizeId);
        if (!size || !size.template) {
            console.log(`No template for ${productId}/${sizeId}`);
            return null;
        }

        const cacheKey = `${productId}-${sizeId}`;

        // Check cache first
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const url = `${this.templatesPath}${size.template}`;
            console.log('Loading template:', url);

            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to load template: ${response.status}`);

            const svgText = await response.text();
            const template = this.parseTemplate(svgText, size);

            // Cache the result
            this.cache.set(cacheKey, template);

            if (this.onTemplateLoad) {
                this.onTemplateLoad(template);
            }

            return template;
        } catch (error) {
            console.error('Template load error:', error);
            return null;
        }
    }

    /**
     * Parse SVG text and extract template metadata
     */
    parseTemplate(svgText, sizeConfig) {
        // Parse viewBox to get aspect ratio
        const viewBoxMatch = svgText.match(/viewBox="([^"]+)"/);
        let viewBox = { x: 0, y: 0, width: 1000, height: 1000 };

        if (viewBoxMatch) {
            const parts = viewBoxMatch[1].split(/\s+/).map(Number);
            viewBox = {
                x: parts[0] || 0,
                y: parts[1] || 0,
                width: parts[2] || 1000,
                height: parts[3] || 1000
            };
        }

        const aspectRatio = viewBox.width / viewBox.height;

        // Create image from SVG
        const svgBlob = new Blob([svgText], { type: 'image/svg+xml' });
        const imageUrl = URL.createObjectURL(svgBlob);

        return {
            svgText,
            imageUrl,
            viewBox,
            aspectRatio,
            dimensions: sizeConfig.dimensions,
            print: sizeConfig.print,
            image: null // Will be populated when loaded
        };
    }

    /**
     * Load template as Image object (for canvas rendering)
     */
    async loadTemplateAsImage(productId, sizeId) {
        const template = await this.loadTemplate(productId, sizeId);
        if (!template) return null;

        if (template.image) return template;

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                template.image = img;
                resolve(template);
            };
            img.onerror = reject;
            img.src = template.imageUrl;
        });
    }

    /**
     * Calculate canvas dimensions for a template
     * @param {Object} template - Parsed template object
     * @param {number} maxWidth - Maximum display width
     * @param {number} maxHeight - Maximum display height (optional)
     * @returns {Object} { width, height, scale }
     */
    calculateDisplaySize(template, maxWidth = 600, maxHeight = null) {
        const { aspectRatio } = template;

        let width = maxWidth;
        let height = width / aspectRatio;

        // If maxHeight specified and exceeded, scale down
        if (maxHeight && height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
        }

        return {
            width: Math.round(width),
            height: Math.round(height),
            scale: width / template.viewBox.width
        };
    }

    /**
     * Clear template cache
     */
    clearCache() {
        // Revoke object URLs to free memory
        for (const template of this.cache.values()) {
            if (template.imageUrl) {
                URL.revokeObjectURL(template.imageUrl);
            }
        }
        this.cache.clear();
    }
}

/**
 * TemplatePreview - Canvas-based preview renderer
 *
 * Renders artwork with template overlay on a canvas element.
 */
class TemplatePreview {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.template = null;
        this.artwork = null;
        this.backgroundColor = options.backgroundColor || '#ffffff';
        this.scaleFactor = options.scaleFactor || (window.devicePixelRatio || 1);
        this.maxWidth = options.maxWidth || 600;

        // Artwork positioning
        this.artworkTransform = {
            x: 0.5,      // 0-1, center position
            y: 0.5,      // 0-1, center position
            scale: 1,    // 1 = fit, >1 = zoom in
            fitMode: 'cover' // 'cover', 'contain', 'fill'
        };
    }

    /**
     * Set the template for this preview
     */
    setTemplate(template) {
        this.template = template;
        this.updateCanvasSize();
        this.render();
    }

    /**
     * Set artwork image
     */
    setArtwork(image, transform = {}) {
        this.artwork = image;
        this.artworkTransform = { ...this.artworkTransform, ...transform };
        this.render();
    }

    /**
     * Set background color or gradient
     */
    setBackground(background) {
        this.backgroundColor = background;
        this.render();
    }

    /**
     * Update artwork transform (position, scale)
     */
    updateArtworkTransform(transform) {
        this.artworkTransform = { ...this.artworkTransform, ...transform };
        this.render();
    }

    /**
     * Update canvas size based on template
     */
    updateCanvasSize() {
        if (!this.template) return;

        const displaySize = this.calculateDisplaySize();

        // Set internal resolution (higher for quality)
        this.canvas.width = displaySize.width * this.scaleFactor;
        this.canvas.height = displaySize.height * this.scaleFactor;

        // Set CSS display size
        this.canvas.style.width = displaySize.width + 'px';
        this.canvas.style.height = displaySize.height + 'px';

        // Scale context
        this.ctx.setTransform(this.scaleFactor, 0, 0, this.scaleFactor, 0, 0);
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';

        // Store display dimensions
        this.displayWidth = displaySize.width;
        this.displayHeight = displaySize.height;
    }

    /**
     * Calculate display size based on template and container
     */
    calculateDisplaySize() {
        if (!this.template) {
            return { width: this.maxWidth, height: this.maxWidth };
        }

        const width = this.maxWidth;
        const height = width / this.template.aspectRatio;

        return { width, height };
    }

    /**
     * Main render function
     */
    render() {
        if (!this.template) return;

        const { displayWidth, displayHeight } = this;

        // Clear canvas
        this.ctx.clearRect(0, 0, displayWidth, displayHeight);

        // 1. Draw background
        this.drawBackground();

        // 2. Draw artwork (if any)
        if (this.artwork) {
            this.drawArtwork();
        }

        // 3. Draw template overlay
        this.drawTemplate();
    }

    /**
     * Draw background (solid color or gradient)
     */
    drawBackground() {
        const { ctx, displayWidth, displayHeight, backgroundColor } = this;

        if (typeof backgroundColor === 'string') {
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, displayWidth, displayHeight);
        } else if (backgroundColor.type === 'gradient') {
            const { colors, direction } = backgroundColor;
            let gradient;

            switch (direction) {
                case 'horizontal':
                    gradient = ctx.createLinearGradient(0, 0, displayWidth, 0);
                    break;
                case 'vertical':
                    gradient = ctx.createLinearGradient(0, 0, 0, displayHeight);
                    break;
                case 'diagonal':
                    gradient = ctx.createLinearGradient(0, 0, displayWidth, displayHeight);
                    break;
                case 'radial':
                    gradient = ctx.createRadialGradient(
                        displayWidth / 2, displayHeight / 2, 0,
                        displayWidth / 2, displayHeight / 2, Math.max(displayWidth, displayHeight) / 2
                    );
                    break;
                default:
                    gradient = ctx.createLinearGradient(0, 0, displayWidth, 0);
            }

            colors.forEach((color, i) => {
                gradient.addColorStop(i / (colors.length - 1), color);
            });

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, displayWidth, displayHeight);
        }
    }

    /**
     * Draw artwork image
     */
    drawArtwork() {
        const { ctx, artwork, displayWidth, displayHeight, artworkTransform } = this;
        const { x, y, scale, fitMode } = artworkTransform;

        const imgRatio = artwork.width / artwork.height;
        const canvasRatio = displayWidth / displayHeight;

        let drawWidth, drawHeight, drawX, drawY;

        if (fitMode === 'cover') {
            if (imgRatio > canvasRatio) {
                drawHeight = displayHeight * scale;
                drawWidth = drawHeight * imgRatio;
            } else {
                drawWidth = displayWidth * scale;
                drawHeight = drawWidth / imgRatio;
            }
            drawX = (displayWidth - drawWidth) * x;
            drawY = (displayHeight - drawHeight) * y;
        } else if (fitMode === 'contain') {
            if (imgRatio > canvasRatio) {
                drawWidth = displayWidth * scale;
                drawHeight = drawWidth / imgRatio;
            } else {
                drawHeight = displayHeight * scale;
                drawWidth = drawHeight * imgRatio;
            }
            drawX = (displayWidth - drawWidth) / 2;
            drawY = (displayHeight - drawHeight) / 2;
        } else { // fill
            drawWidth = displayWidth;
            drawHeight = displayHeight;
            drawX = 0;
            drawY = 0;
        }

        ctx.drawImage(artwork, drawX, drawY, drawWidth, drawHeight);
    }

    /**
     * Draw template overlay
     */
    drawTemplate() {
        if (!this.template || !this.template.image) return;

        const { ctx, displayWidth, displayHeight } = this;
        ctx.drawImage(this.template.image, 0, 0, displayWidth, displayHeight);
    }

    /**
     * Export canvas as image data URL
     */
    toDataURL(type = 'image/png', quality = 1) {
        return this.canvas.toDataURL(type, quality);
    }

    /**
     * Export canvas as Blob
     */
    toBlob(type = 'image/png', quality = 1) {
        return new Promise(resolve => {
            this.canvas.toBlob(resolve, type, quality);
        });
    }
}

// Export for use as ES module or global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TemplateEngine, TemplatePreview };
} else {
    window.TemplateEngine = TemplateEngine;
    window.TemplatePreview = TemplatePreview;
}
