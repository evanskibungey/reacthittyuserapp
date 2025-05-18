import React, { useState, useEffect } from 'react';

/**
 * OptimizedImage component for better image loading performance
 * 
 * @param {string} src - Image source URL
 * @param {string} alt - Alt text for accessibility
 * @param {string} className - CSS classes to apply
 * @param {number} width - Image width
 * @param {number} height - Height of the image
 * @param {string} objectFit - CSS object-fit property (contain, cover, etc.)
 * @param {boolean} priority - Whether to load the image with high priority (no lazy loading)
 * @param {function} onLoad - Callback for when image loads
 * @param {function} onError - Callback for when image fails to load
 * @param {object} placeholderProps - Props for the placeholder
 * @param {object} ...props - Additional props to pass to img element
 */
const OptimizedImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  objectFit = 'cover',
  priority = false,
  onLoad,
  onError,
  placeholderProps = {},
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [imgSrc, setImgSrc] = useState(src);
  const [imgError, setImgError] = useState(false);

  // Update image source if the src prop changes
  useEffect(() => {
    setImgSrc(src);
    setImgError(false);
    setIsLoading(true);
  }, [src]);

  // Handle successful image load
  const handleLoad = (e) => {
    setIsLoading(false);
    if (onLoad) onLoad(e);
  };

  // Handle image load error
  const handleError = (e) => {
    setIsLoading(false);
    setImgError(true);
    
    // If there's a valid URL, try to use a fallback image
    if (imgSrc && imgSrc.startsWith('http')) {
      // Generate a placeholder with the text from alt or a default message
      const fallbackText = alt || 'Image';
      setImgSrc(`/api/placeholder/${width || 300}/${height || 200}?text=${encodeURIComponent(fallbackText.substring(0, 15))}`);
    }
    
    if (onError) onError(e);
  };

  // Custom styles for the image
  const imgStyle = {
    objectFit,
    width: width ? `${width}px` : '100%',
    height: height ? `${height}px` : '100%',
    // Add blur effect while loading
    filter: isLoading ? 'blur(5px)' : 'none',
    transition: 'filter 0.3s ease-in-out',
  };

  // Placeholder styles
  const placeholderStyle = {
    width: width ? `${width}px` : '100%',
    height: height ? `${height}px` : '100%',
    backgroundColor: '#e2e8f0', // Tailwind's gray-200
    display: isLoading ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
    ...placeholderProps.style,
  };

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {isLoading && (
        <div 
          className={`absolute inset-0 ${placeholderProps.className || ''}`} 
          style={placeholderStyle}
        >
          <div className="animate-pulse bg-gray-300 w-full h-full rounded"></div>
        </div>
      )}
      
      <img
        src={imgSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={handleLoad}
        onError={handleError}
        style={imgStyle}
        className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        width={width}
        height={height}
        {...props}
      />
    </div>
  );
};

export default OptimizedImage;