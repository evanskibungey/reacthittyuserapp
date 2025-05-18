/**
 * Utility functions for image handling and optimization
 */

/**
 * Preloads an image for faster display
 * 
 * @param {string} src - Image source URL
 * @returns {Promise} - Promise that resolves when the image is loaded
 */
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    if (!src) {
      resolve(null);
      return;
    }
    
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
};

/**
 * Preloads multiple images in parallel
 * 
 * @param {Array<string>} srcs - Array of image source URLs
 * @returns {Promise} - Promise that resolves when all images are loaded
 */
export const preloadImages = async (srcs) => {
  if (!srcs || !Array.isArray(srcs) || srcs.length === 0) {
    return [];
  }
  
  const promises = srcs
    .filter(src => typeof src === 'string' && src.trim().length > 0)
    .map(src => preloadImage(src));
    
  return Promise.allSettled(promises);
};

/**
 * Gets a placeholder image URL
 * 
 * @param {number} width - Width of the placeholder
 * @param {number} height - Height of the placeholder
 * @param {string} text - Text to display in the placeholder
 * @returns {string} - Placeholder image URL
 */
export const getPlaceholder = (width = 300, height = 200, text = 'Loading...') => {
  return `/api/placeholder/${width}/${height}?text=${encodeURIComponent(text)}`;
};

/**
 * Gets an optimized version of an image URL
 * For example, can be used to convert to WebP
 * 
 * @param {string} url - Original image URL
 * @param {Object} options - Options for optimization
 * @returns {string} - Optimized image URL
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  // This is a placeholder function. In a real application, you would
  // implement image optimization logic here, such as WebP conversion
  // or resizing based on device/screen size.
  
  if (!url) return null;
  
  // Currently just returns the original URL
  // In a production app, you would connect this to your image processing service
  return url;
};

export default {
  preloadImage,
  preloadImages,
  getPlaceholder,
  getOptimizedImageUrl
};
