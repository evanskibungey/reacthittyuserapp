import React, { useEffect, useRef, useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { 
  FaTimes, FaPlus, FaMinus, FaStar, FaStarHalfAlt, 
  FaTruck, FaShieldAlt, FaCheck, FaArrowLeft, FaArrowRight 
} from 'react-icons/fa';

const ProductDetailModal = ({ isOpen, onClose, product }) => {
  const modalRef = useRef();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  
  // Mock images array (in a real app, these would come from the product)
  const productImages = [
    `/api/placeholder/400/400?text=${encodeURIComponent(product?.name || 'Product')}`,
    `/api/placeholder/400/400?text=${encodeURIComponent('Side View')}`,
    `/api/placeholder/400/400?text=${encodeURIComponent('Details')}`
  ];
  
  // Reset quantity when product changes
  useEffect(() => {
    setQuantity(1);
  }, [product]);

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
  const handleAddToCart = () => {
    addToCart(product, quantity);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 2000);
  };

  // Function to render star ratings
  const renderRating = (rating) => {
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
  };

  // Animation classes
  const modalClasses = isOpen 
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm transition-all duration-300 opacity-100 overflow-y-auto py-10'
    : 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 transition-all duration-300 opacity-0 pointer-events-none';

  const modalContentClasses = isOpen
    ? 'relative bg-white rounded-2xl shadow-2xl transform transition-all duration-300 ease-out w-full max-w-5xl mx-4 overflow-hidden border border-gray-200'
    : 'relative bg-white rounded-2xl shadow-2xl transform transition-all duration-300 scale-95 opacity-0 w-full max-w-5xl mx-4 overflow-hidden border border-gray-200';

  if (!isOpen || !product) return null;

  const stockStatus = product?.current_stock > 10 
    ? { label: 'In Stock', color: 'text-green-600', bg: 'bg-green-100', icon: <FaCheck className="mr-1" /> }
    : product?.current_stock > 0 
      ? { label: 'Low Stock', color: 'text-orange-500', bg: 'bg-orange-100', icon: <FaMinus className="mr-1" /> }
      : { label: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-100', icon: <FaTimes className="mr-1" /> };

  const slideLeft = () => {
    setActiveImage((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  };

  const slideRight = () => {
    setActiveImage((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className={modalClasses}>
      {/* Success notification */}
      {showNotification && (
        <div className="fixed top-8 right-8 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-fadeIn flex items-center">
          <FaCheck className="mr-2" />
          Added to cart successfully!
        </div>
      )}

      <div 
        ref={modalRef}
        className={modalContentClasses}
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-gray-800 transition-colors z-20 bg-white rounded-full p-2 shadow-md"
          aria-label="Close modal"
        >
          <FaTimes size={20} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Product Image Section */}
          <div className="bg-gradient-to-br from-purple-50 to-gray-50 p-8 flex flex-col items-center justify-center min-h-[450px] relative">
            {/* Main image with navigation arrows */}
            <div className="relative w-full h-64 mb-6">
              <div className="absolute inset-0 flex items-center justify-center bg-white rounded-xl shadow-md overflow-hidden p-6">
                <img 
                  src={productImages[activeImage]}
                  alt={product?.name || 'Product'} 
                  className="max-h-full max-w-full object-contain transition-transform duration-500 hover:scale-110"
                />
              </div>
              
              {/* Image navigation arrows */}
              <button 
                onClick={slideLeft}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md text-purple-600 hover:text-purple-800 hover:bg-purple-50 transition-colors"
                aria-label="Previous image"
              >
                <FaArrowLeft size={16} />
              </button>
              <button 
                onClick={slideRight}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md text-purple-600 hover:text-purple-800 hover:bg-purple-50 transition-colors"
                aria-label="Next image"
              >
                <FaArrowRight size={16} />
              </button>
            </div>
            
            {/* Thumbnail navigation */}
            <div className="flex space-x-3 mt-4">
              {productImages.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    activeImage === idx ? 'bg-purple-600 scale-125' : 'bg-gray-300 hover:bg-purple-300'
                  }`}
                  aria-label={`View image ${idx + 1}`}
                />
              ))}
            </div>
            
            {/* Product badges */}
            <div className="absolute top-4 left-4 flex flex-col space-y-2">
              {product?.isNew && (
                <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  NEW
                </span>
              )}
              {product?.discount && (
                <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  {product.discount}% OFF
                </span>
              )}
            </div>
          </div>

          {/* Product Details Section */}
          <div className="p-8 bg-white overflow-y-auto max-h-[80vh]">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full font-medium">
                <FaCheck className="mr-1 text-purple-500" size={10} />
                {product?.category || 'Refill'}
              </span>
            </div>

            {/* Product Title & Rating */}
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{product?.name || 'k-Gas 6kg Refill'}</h2>
            <div className="flex items-center mb-4">
              {renderRating(product?.rating || 4.4)}
              <span className="ml-2 text-gray-600 text-sm hover:text-purple-700 transition-colors">
                {product?.rating || 4.4} ({product?.reviews || 55} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center mb-6 space-x-3">
              <span className="text-3xl font-bold text-green-700">
                KSh {product?.selling_price?.toLocaleString() || '1,050.00'}
              </span>
              {product?.originalPrice && (
                <span className="text-lg text-red-400 line-through">
                  KSh {product.originalPrice.toLocaleString()}
                </span>
              )}
              {product?.discount && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-semibold">
                  Save {product.discount}%
                </span>
              )}
            </div>

            {/* Divider */}
            <div className="border-b border-gray-200 mb-6"></div>

            {/* Description */}
            <p className="text-gray-700 mb-6 leading-relaxed">
              {product?.description || `K-Gas 6kg Cylinder – by Rubis Petrol Station
              Clean, safe, and reliable LPG for home use. 
              Supplied and refilled by trusted Rubis Petrol Station. 
              Accurate gas weight verified before and after delivery. 
              Guaranteed quality and quantity – no underfills. 
              Free delivery to your doorstep.`}
            </p>

            {/* Stock Status & Delivery */}
            <div className="flex flex-wrap items-center mb-6 gap-4">
              <span className={`flex items-center text-sm font-medium px-3 py-1.5 rounded-full ${stockStatus.bg} ${stockStatus.color}`}>
                {stockStatus.icon}
                {stockStatus.label}
              </span>
              <span className="flex items-center text-sm font-medium bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full">
                <FaTruck className="mr-1" />
                Delivery: {product?.delivery_time || '30-60 min'}
              </span>
            </div>

            {/* Features List */}
            <div className="mb-8 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 text-lg">Key Features</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="bg-green-100 p-1 rounded-full mr-2 mt-0.5">
                    <FaCheck className="text-green-600" size={12} />
                  </div>
                  <span className="text-gray-700">High quality and durable design</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-green-100 p-1 rounded-full mr-2 mt-0.5">
                    <FaCheck className="text-green-600" size={12} />
                  </div>
                  <span className="text-gray-700">Includes safety certifications</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-green-100 p-1 rounded-full mr-2 mt-0.5">
                    <FaCheck className="text-green-600" size={12} />
                  </div>
                  <span className="text-gray-700">Compatible with standard equipment</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-green-100 p-1 rounded-full mr-2 mt-0.5">
                    <FaCheck className="text-green-600" size={12} />
                  </div>
                  <span className="text-gray-700">Includes manufacturer warranty</span>
                </li>
              </ul>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
              <div className="flex items-center border border-gray-200 rounded-lg bg-white shadow-sm">
                <button 
                  onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                  className="px-4 py-3 text-gray-600 hover:text-purple-700 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-300 rounded-l-lg transition-colors"
                  aria-label="Decrease quantity"
                >
                  <FaMinus size={14} />
                </button>
                <span className="px-6 py-3 text-gray-900 font-medium bg-gray-50 border-x border-gray-200">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-3 text-gray-600 hover:text-purple-700 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-300 rounded-r-lg transition-colors"
                  aria-label="Increase quantity"
                >
                  <FaPlus size={14} />
                </button>
              </div>
              <button 
                onClick={handleAddToCart}
                disabled={product?.current_stock <= 0}
                className={`${
                  product?.current_stock <= 0 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-purple-600 hover:bg-purple-700 transform hover:-translate-y-0.5 hover:shadow-lg'
                } flex-1 text-white font-semibold py-3 px-8 rounded-lg flex items-center justify-center transition-all duration-300`}
              >
                Add to Cart
                <FaPlus size={14} className="ml-2" />
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 gap-4 mt-6 border-t border-gray-100 pt-6">
              <div className="flex items-center bg-gradient-to-r from-purple-50 to-white rounded-lg p-4 shadow-sm border border-purple-100">
                <div className="mr-4 bg-purple-100 p-2 rounded-full text-purple-600">
                  <FaTruck size={20} />
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-900">Fast Delivery</p>
                  <p className="text-xs text-gray-500">Within 60 minutes</p>
                </div>
              </div>
              <div className="flex items-center bg-gradient-to-r from-purple-50 to-white rounded-lg p-4 shadow-sm border border-purple-100">
                <div className="mr-4 bg-purple-100 p-2 rounded-full text-purple-600">
                  <FaShieldAlt size={20} />
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-900">Quality Guaranteed</p>
                  <p className="text-xs text-gray-500">100% Authentic Products</p>
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