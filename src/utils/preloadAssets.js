import { preloadImages } from './imageUtils';

// List of critical images that should be preloaded
const CRITICAL_IMAGES = [
  '/heroimg.png',
  // Add other important images here
];

/**
 * Preloads critical images for the application
 * This should be called early in the application lifecycle
 */
export const preloadCriticalAssets = async () => {
  try {
    console.log('Preloading critical assets...');
    const results = await preloadImages(CRITICAL_IMAGES);
    
    // Log success/failure of each preload operation
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`✓ Preloaded: ${CRITICAL_IMAGES[index]}`);
      } else {
        console.warn(`✗ Failed to preload: ${CRITICAL_IMAGES[index]}`);
      }
    });
    
    console.log('Critical asset preloading complete');
    return true;
  } catch (error) {
    console.error('Error preloading critical assets:', error);
    return false;
  }
};

export default preloadCriticalAssets;