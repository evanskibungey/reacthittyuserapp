import React, { useEffect, useRef, useState, useCallback } from 'react';
import { productService } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { 
  FaTimes, FaPlus, FaMinus, FaStar, FaStarHalfAlt, 
  FaTruck, FaShieldAlt, FaCheck, FaCreditCard
} from 'react-icons/fa';

const ProductDetailModal = ({ isOpen, onClose, product, navigateToCart }) => {
  const modalRef = useRef();
  const { addToCart } = useCart();
  
  // All useState hooks declared at the top level
  const [quantity, setQuantity] = useState(1);
  const [showNotification, setShowNotification] = useState(false);
  const [productDetails, setProductDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch detailed product information when product ID changes
  useEffect(() => {
    if (isOpen && product && product.id) {
      setLoading(true);
      setError(null);
      
      productService.getProduct(product.id)
        .then(response => {
          if (response.success && response.data) {
            setProductDetails(response.data);
          } else {
            setError('Failed to fetch product details');
            // Keep using the summary product data we already have
            setProductDetails(product);
          }
        })
        .catch(err => {
          console.error('Error fetching product details:', err);
          setError('Failed to fetch product details');
          // Keep using the summary product data we already have
          setProductDetails(product);
        })
        .finally(() => {
          setLoading(false);
        });
    }
    
    // Reset quantity when modal opens
    setQuantity(1);
  }, [isOpen, product]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Function to handle adding to cart with notification
  const handleAddToCart = useCallback(() => {
    const productToAdd = productDetails || product;
    // Check if the product is available
    if (productToAdd?.current_stock <= 0) {
      // Show error notification or toast here if needed
      console.warn('Product is out of stock');
      return;
    }
    
    addToCart(productToAdd, quantity);
    setShowNotification(true);
    
    // Close the modal and navigate to cart after a brief delay
    setTimeout(() => {
      setShowNotification(false);
      onClose(); // Close the modal
      
      // If navigateToCart prop is provided, use it to redirect to cart
      if (typeof navigateToCart === 'function') {
        navigateToCart();
      }
    }, 1000); // Reduced time to 1 second for better UX
  }, [productDetails, product, quantity, addToCart, onClose, navigateToCart]);
  
  // Function to render star ratings
  const renderRating = useCallback((rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex text-yellow-400">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={i} className="mr-1" />
        ))}
        {hasHalfStar && <FaStarHalfAlt className="mr-1" />}
        {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
          <FaStar key={`empty-${i}`} className="text-gray-300 mr-1" />
        ))}
      </div>
    );
  }, []);

  // Animation classes with smooth transitions
  const modalClasses = isOpen 
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm transition-all duration-300 opacity-100 overflow-auto'
    : 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-0 transition-all duration-300 opacity-0 pointer-events-none';

  const modalContentClasses = isOpen
    ? 'relative bg-white rounded-xl shadow-lg transform transition-all duration-300 ease-out w-full max-w-5xl mx-4 overflow-hidden border border-gray-100'
    : 'relative bg-white rounded-xl shadow-lg transform transition-all duration-300 scale-95 opacity-0 w-full max-w-5xl mx-4 overflow-hidden border border-gray-100';
    
  // Skip rendering if modal is not open or product is null
  if (!isOpen || !product) return null;

  // Get the most up-to-date product data
  const displayProduct = productDetails || product || {};
  
  // Determine stock status
  const stockStatus = displayProduct?.current_stock > 10 
    ? { label: 'In Stock', color: 'text-green-600', bg: 'bg-green-100', icon: <FaCheck className="mr-1" /> }
    : displayProduct?.current_stock > 0 
      ? { label: 'Low Stock', color: 'text-orange-500', bg: 'bg-orange-100', icon: <FaMinus className="mr-1" /> }
      : { label: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-100', icon: <FaTimes className="mr-1" /> };

  // Extract key features from product description
  const extractFeatures = (description) => {
    if (!description) return [];
    
    // Option 1: Split by periods, newlines, or bullet points
    const features = description
      .split(/[.\n•]+/)
      .map(feature => feature.trim())
      .filter(feature => feature.length > 10);
      
    return features.length > 0 ? features : ['High quality product', 'Reliable performance', 'Long-lasting design'];
  };
  
  const features = extractFeatures(displayProduct?.description);

  return (
    <div className={modalClasses}>
      {/* Success notification */}
      {showNotification && (
        <div className="fixed top-8 right-8 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-fadeIn flex items-center">
          <FaCheck className="mr-2" />
          Added to cart successfully!
        </div>
      )}
      
      {/* Simple loading spinner instead of shimmer UI */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-xl shadow-lg flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-gray-700 font-medium">Loading...</p>
          </div>
        </div>
      )}

      <div 
        ref={modalRef}
        className={modalContentClasses}
      >
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-20 bg-white rounded-full p-2 shadow-sm hover:shadow-md"
          aria-label="Close modal"
        >
          <FaTimes size={16} />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Left Panel - Product Image */}
          <div className="md:w-1/3 bg-gradient-to-b from-purple-50 to-white p-4 md:p-5 flex items-center justify-center">
            <div className="relative w-full h-64 flex items-center justify-center p-4">
              <img 
                src={displayProduct.image_url || `https://via.placeholder.com/400x400.png?text=${encodeURIComponent(displayProduct.name || 'Product')}`}
                alt={displayProduct?.name || 'Product'} 
                className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
              />
              
              {/* Product badges overlay on image */}
              <div className="absolute top-0 left-0 flex flex-col space-y-2">
                {/* Free Delivery Badge */}
                <span className="bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                  FREE DELIVERY
                </span>
                
                {displayProduct?.isNew && (
                  <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                    NEW
                  </span>
                )}
                
                {displayProduct?.discount && (
                  <span className="bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                    {displayProduct.discount}% OFF
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Product Details */}
          <div className="md:w-2/3 bg-white p-4 md:p-6">
            {/* Header Section */}
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{displayProduct?.name || 'Product Name'}</h2>
              
              <div className="flex items-center mt-1 mb-2">
                {renderRating(displayProduct?.rating || 4.4)}
                <span className="ml-2 text-gray-500 text-sm">
                  {displayProduct?.rating || 4.4} ({displayProduct?.reviews || 55} reviews)
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 font-medium">
                  <FaCheck className="mr-1 text-purple-500" size={8} />
                  {displayProduct?.category || 'Refill'}
                </span>
                
                {/* Stock and Delivery Status */}
                <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-md ${stockStatus.bg} ${stockStatus.color} font-medium`}>
                  {stockStatus.icon}
                  {stockStatus.label}
                </span>
                
                <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium">
                  <FaTruck className="mr-1 text-blue-500" size={8} />
                  Delivery: {displayProduct?.delivery_time || '30-60 min'}
                </span>
              </div>
            </div>
            
            {/* Price and Add to Cart Section */}
            <div className="flex flex-wrap items-center justify-between mt-3 mb-4 bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-gray-800">
                  KSh {displayProduct?.selling_price?.toLocaleString() || '1,050.00'}
                </span>
                {displayProduct?.originalPrice && (
                  <span className="text-sm text-red-400 line-through">
                    KSh {displayProduct.originalPrice.toLocaleString()}
                  </span>
                )}
                {displayProduct?.discount && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-md font-semibold">
                    Save {displayProduct.discount}%
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                <div className="flex items-center border border-gray-200 rounded-md bg-white">
                  <button 
                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                    className="px-2 py-1 text-gray-600 hover:text-purple-700 hover:bg-purple-50 focus:outline-none rounded-l-md transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <FaMinus size={12} />
                  </button>
                  <span className="px-3 py-1 text-gray-900 font-medium">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-2 py-1 text-gray-600 hover:text-purple-700 hover:bg-purple-50 focus:outline-none rounded-r-md transition-colors"
                    aria-label="Increase quantity"
                  >
                    <FaPlus size={12} />
                  </button>
                </div>
                
                <button 
                  onClick={handleAddToCart}
                  disabled={displayProduct?.current_stock <= 0}
                  className={`${
                    displayProduct?.current_stock <= 0 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-purple-600 hover:bg-purple-700 hover:shadow-md'
                  } text-white font-medium py-1.5 px-4 rounded-md flex items-center justify-center transition-all duration-300`}
                >
                  Add to Cart
                  <FaPlus size={10} className="ml-1" />
                </button>
              </div>
            </div>
            
            {/* Two-column layout for features and specifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {/* Key Features */}
              <div className="col-span-1">
                <h3 className="font-semibold text-gray-800 mb-2 text-sm">Key Features</h3>
                <ul className="space-y-1.5">
                  {features.slice(0, 6).map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0 bg-green-100 p-0.5 rounded-full mr-1.5 mt-0.5">
                        <FaCheck className="text-green-600" size={8} />
                      </div>
                      <span className="text-gray-600 text-xs">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Specifications and Trust Indicators */}
              <div className="col-span-1">
                {/* Specs */}
                {displayProduct?.sku && (
                  <div className="mb-3">
                    <h3 className="font-semibold text-gray-800 mb-2 text-sm">Specifications</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between bg-gray-50 p-1.5 rounded">
                        <span className="text-gray-500">SKU:</span>
                        <span className="text-gray-800 font-medium">{displayProduct.sku}</span>
                      </div>
                      {displayProduct.category && (
                        <div className="flex justify-between bg-gray-50 p-1.5 rounded">
                          <span className="text-gray-500">Category:</span>
                          <span className="text-gray-800 font-medium">{displayProduct.category}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Trust Indicators */}
                <div className="mt-2">
                  <div className="flex items-center bg-gradient-to-r from-purple-50 to-white rounded-md p-2 mb-2 shadow-sm border border-purple-100">
                    <div className="mr-2 bg-purple-100 p-1 rounded-full text-purple-600">
                      <FaShieldAlt size={10} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-800">Quality Guaranteed</p>
                      <p className="text-xs text-gray-500">100% Authentic Products</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center bg-gradient-to-r from-blue-50 to-white rounded-md p-2 shadow-sm border border-blue-100">
                    <div className="mr-2 bg-blue-100 p-1 rounded-full text-blue-600">
                      <FaCreditCard size={10} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-800">Secure Payment</p>
                      <p className="text-xs text-gray-500">Multiple payment options</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;