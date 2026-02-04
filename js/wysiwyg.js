/**
 * WYSIWYG Coordinate System Module
 * =================================
 *
 * CRITICAL: This module ensures that the viewer and exported SVG match exactly.
 * DO NOT modify without understanding the coordinate system!
 *
 * ## The Problem This Solves
 *
 * The canvas has two sets of dimensions:
 * - canvas.width/height: Internal resolution (includes scaleFactor for quality)
 * - canvas.displayWidth/displayHeight: Actual display size in CSS pixels
 *
 * For feather flags, scaleFactor = 4, so:
 * - canvas.width = 2400, canvas.displayWidth = 600
 * - canvas.height = 18350, canvas.displayHeight = 4587
 *
 * The viewer uses ctx.setTransform(scaleFactor, 0, 0, scaleFactor, 0, 0) which
 * automatically scales all drawing operations. This means the viewer draws in
 * DISPLAY coordinates, not internal resolution coordinates.
 *
 * ## WYSIWYG Rule
 *
 * To match viewer and export:
 * 1. Viewer MUST use displayWidth/displayHeight for all calculations
 * 2. Export MUST normalize coordinates as percentage of displayWidth/displayHeight
 * 3. Export MUST then scale those percentages to SVG viewBox dimensions
 *
 * ## Usage
 *
 * // In viewer (drawLogoMode, drawPhotoMode):
 * const dims = WYSIWYG.getViewerDimensions(canvas);
 * ctx.fillRect(0, 0, dims.width, dims.height);
 *
 * // In export:
 * const transform = WYSIWYG.createExportTransform(canvas, svgWidth, svgHeight);
 * const svgX = transform.x(normalizedX);
 * const svgFontSize = transform.size(viewerFontSize);
 *
 * @module WYSIWYG
 * @version 1.0.0
 * @author PrintPilot Team
 */

const WYSIWYG = (function() {
    'use strict';

    /**
     * Get the correct dimensions for viewer drawing.
     * ALWAYS use these instead of canvas.width/height directly!
     *
     * @param {HTMLCanvasElement} canvas - The canvas element
     * @returns {Object} - { width, height, aspectRatio }
     */
    function getViewerDimensions(canvas) {
        if (!canvas) {
            console.error('WYSIWYG: Canvas is required');
            return { width: 600, height: 4166, aspectRatio: 0.144 };
        }

        const width = canvas.displayWidth || canvas.width;
        const height = canvas.displayHeight || canvas.height;

        return {
            width: width,
            height: height,
            aspectRatio: width / height
        };
    }

    /**
     * Create a coordinate transformer for SVG export.
     * Maps viewer (display) coordinates to SVG viewBox coordinates.
     *
     * @param {HTMLCanvasElement} canvas - The canvas element
     * @param {number} svgWidth - SVG viewBox width
     * @param {number} svgHeight - SVG viewBox height
     * @returns {Object} - Transformer with x(), y(), size(), scale() methods
     */
    function createExportTransform(canvas, svgWidth, svgHeight) {
        const viewer = getViewerDimensions(canvas);

        const scaleX = svgWidth / viewer.width;
        const scaleY = svgHeight / viewer.height;
        // Average scale for font sizes (maintains proportions)
        const avgScale = (scaleX + scaleY) / 2;

        return {
            // Convert normalized (0-1) position to SVG coordinate
            x: function(normalized) {
                return normalized * svgWidth;
            },
            y: function(normalized) {
                return normalized * svgHeight;
            },

            // Convert viewer pixel size to SVG units
            size: function(viewerPixels) {
                return viewerPixels * avgScale;
            },

            // Convert viewer pixel value to SVG (using width scale)
            scaleWidth: function(viewerPixels) {
                return viewerPixels * scaleX;
            },

            // Convert viewer pixel value to SVG (using height scale)
            scaleHeight: function(viewerPixels) {
                return viewerPixels * scaleY;
            },

            // Normalize a viewer pixel value to percentage of viewer width
            normalizeToWidth: function(viewerPixels) {
                return viewerPixels / viewer.width;
            },

            // Normalize a viewer pixel value to percentage of viewer height
            normalizeToHeight: function(viewerPixels) {
                return viewerPixels / viewer.height;
            },

            // Scale factors for direct use
            scaleX: scaleX,
            scaleY: scaleY,
            avgScale: avgScale,

            // Dimensions for reference
            viewerWidth: viewer.width,
            viewerHeight: viewer.height,
            svgWidth: svgWidth,
            svgHeight: svgHeight
        };
    }

    /**
     * Normalize a viewer dimension to a percentage (0-1) of viewer width.
     * Use this for logo sizes, spacing, etc. that should scale uniformly.
     *
     * @param {HTMLCanvasElement} canvas - The canvas element
     * @param {number} viewerPixels - Value in viewer pixels
     * @returns {number} - Normalized value (0-1)
     */
    function normalizeToViewerWidth(canvas, viewerPixels) {
        const viewer = getViewerDimensions(canvas);
        return viewerPixels / viewer.width;
    }

    /**
     * Convert a normalized value to SVG coordinates.
     *
     * @param {number} normalized - Normalized value (0-1)
     * @param {number} svgDimension - SVG width or height
     * @returns {number} - SVG coordinate
     */
    function denormalizeToSVG(normalized, svgDimension) {
        return normalized * svgDimension;
    }

    /**
     * Calculate logo dimensions for export that match the viewer.
     *
     * @param {HTMLCanvasElement} canvas - The canvas element
     * @param {number} svgWidth - SVG viewBox width
     * @param {number} svgHeight - SVG viewBox height
     * @param {number} viewerLogoSize - Logo size in viewer pixels
     * @param {number} logoAspectRatio - Logo width/height ratio
     * @returns {Object} - { width, height } in SVG units
     */
    function calculateLogoSizeForExport(canvas, svgWidth, svgHeight, viewerLogoSize, logoAspectRatio) {
        const viewer = getViewerDimensions(canvas);

        // Normalize to percentage of viewer width
        const logoWidthNorm = viewerLogoSize / viewer.width;

        // Apply to SVG width
        const svgLogoWidth = logoWidthNorm * svgWidth;
        const svgLogoHeight = svgLogoWidth / logoAspectRatio;

        return {
            width: svgLogoWidth,
            height: svgLogoHeight
        };
    }

    /**
     * Calculate spacing for export that matches the viewer.
     *
     * @param {HTMLCanvasElement} canvas - The canvas element
     * @param {number} svgWidth - SVG viewBox width
     * @param {number} viewerSpacing - Spacing in viewer pixels
     * @returns {number} - Spacing in SVG units
     */
    function calculateSpacingForExport(canvas, svgWidth, viewerSpacing) {
        const viewer = getViewerDimensions(canvas);
        const spacingNorm = viewerSpacing / viewer.width;
        return spacingNorm * svgWidth;
    }

    /**
     * Calculate font size for export that matches the viewer.
     *
     * @param {HTMLCanvasElement} canvas - The canvas element
     * @param {number} svgWidth - SVG viewBox width
     * @param {number} svgHeight - SVG viewBox height
     * @param {number} viewerFontSize - Font size in viewer pixels
     * @returns {number} - Font size in SVG units
     */
    function calculateFontSizeForExport(canvas, svgWidth, svgHeight, viewerFontSize) {
        const transform = createExportTransform(canvas, svgWidth, svgHeight);
        return transform.size(viewerFontSize);
    }

    /**
     * Validate that canvas has displayWidth/displayHeight set.
     * Call this during initialization to catch configuration errors early.
     *
     * @param {HTMLCanvasElement} canvas - The canvas element
     * @returns {boolean} - True if valid
     */
    function validateCanvas(canvas) {
        if (!canvas) {
            console.error('WYSIWYG: Canvas element is null');
            return false;
        }

        if (!canvas.displayWidth || !canvas.displayHeight) {
            console.warn('WYSIWYG: Canvas missing displayWidth/displayHeight. Using canvas.width/height as fallback.');
            console.warn('Set canvas.displayWidth and canvas.displayHeight for proper WYSIWYG support.');
            return false;
        }

        const scaleFactor = canvas.width / canvas.displayWidth;
        if (scaleFactor !== canvas.height / canvas.displayHeight) {
            console.warn('WYSIWYG: Non-uniform scale factors detected. This may cause distortion.');
        }

        return true;
    }

    /**
     * Debug helper - logs current coordinate system state.
     *
     * @param {HTMLCanvasElement} canvas - The canvas element
     * @param {number} svgWidth - SVG viewBox width
     * @param {number} svgHeight - SVG viewBox height
     */
    function debugCoordinates(canvas, svgWidth, svgHeight) {
        const viewer = getViewerDimensions(canvas);
        const transform = createExportTransform(canvas, svgWidth, svgHeight);

        console.group('WYSIWYG Coordinate Debug');
        console.log('Canvas internal:', canvas.width, 'x', canvas.height);
        console.log('Canvas display:', viewer.width, 'x', viewer.height);
        console.log('Scale factor:', canvas.width / viewer.width);
        console.log('SVG viewBox:', svgWidth, 'x', svgHeight);
        console.log('Export scale X:', transform.scaleX);
        console.log('Export scale Y:', transform.scaleY);
        console.log('Export avg scale:', transform.avgScale);
        console.groupEnd();
    }

    // Public API
    return {
        // Core functions
        getViewerDimensions: getViewerDimensions,
        createExportTransform: createExportTransform,

        // Helper functions
        normalizeToViewerWidth: normalizeToViewerWidth,
        denormalizeToSVG: denormalizeToSVG,
        calculateLogoSizeForExport: calculateLogoSizeForExport,
        calculateSpacingForExport: calculateSpacingForExport,
        calculateFontSizeForExport: calculateFontSizeForExport,

        // Validation and debugging
        validateCanvas: validateCanvas,
        debugCoordinates: debugCoordinates,

        // Version for compatibility checks
        VERSION: '1.0.0'
    };
})();

// Export for ES modules (if needed in future)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WYSIWYG;
}
