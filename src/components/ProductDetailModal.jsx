import React, { useEffect, useRef } from 'react';
import { FaTimes, FaPlus, FaMinus, FaStar, FaStarHalfAlt, FaTruck, FaShieldAlt, FaCheck } from 'react-icons/fa';

const ProductDetailModal = ({ isOpen, onClose, product }) => {
  const modalRef = useRef();

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

  // Function to render star ratings
  const renderRating = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex text-yellow-400">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={i} />
        ))}
        {hasHalfStar && <FaStarHalfAlt />}
        {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
          <FaStar key={`empty-${i}`} className="text-gray-300" />
        ))}
      </div>
    );
  };

  // Animation classes
  const modalClasses = isOpen 
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 opacity-100 overflow-y-auto py-10' 
    : 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 opacity-0 pointer-events-none';

  const modalContentClasses = isOpen
    ? 'bg-white rounded-xl shadow-xl transform transition-all duration-300 ease-out w-full max-w-4xl mx-4 overflow-hidden'
    : 'bg-white rounded-xl shadow-xl transform transition-all duration-300 scale-95 opacity-0 w-full max-w-4xl mx-4 overflow-hidden';

  if (!isOpen || !product) return null;

  const stockStatus = product.current_stock > 10 
    ? { label: 'In Stock', color: 'text-green-600', bg: 'bg-green-600' }
    : product.current_stock > 0 
      ? { label: 'Low Stock', color: 'text-orange-500', bg: 'bg-orange-500' }
      : { label: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-600' };

  return (
    <div className={modalClasses}>
      <div 
        ref={modalRef}
        className={modalContentClasses}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-20"
        >
          <FaTimes size={24} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Product Image Section */}
          <div className="bg-gray-100 p-8 flex items-center justify-center min-h-[400px]">
            <img 
              src={`/api/placeholder/400/400?text=${encodeURIComponent(product.name)}`}
              alt={product.name} 
              className="max-h-[300px] max-w-full object-contain"
            />
          </div>

          {/* Product Details Section */}
          <div className="p-8">
            {/* Tags */}
            <div className="flex space-x-2 mb-4">
              <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                {product.category}
              </span>
              {product.isNew && (
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  NEW
                </span>
              )}
              {product.discount && (
                <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                  {product.discount}% OFF
                </span>
              )}
            </div>

            {/* Product Title & Rating */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h2>
            <div className="flex items-center mb-4">
              {renderRating(product.rating)}
              <span className="ml-2 text-gray-600">{product.rating} ({product.reviews} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-center mb-6">
              <span className="text-3xl font-bold text-gray-900">KSh {product.selling_price.toLocaleString()}</span>
              {product.originalPrice && (
                <span className="ml-2 text-lg text-gray-500 line-through">
                  KSh {product.originalPrice.toLocaleString()}
                </span>
              )}
              {product.discount && (
                <span className="ml-2 text-sm bg-red-100 text-red-700 px-2 py-1 rounded">
                  Save {product.discount}%
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-6">
              {product.description}
            </p>

            {/* Stock Status */}
            <div className="flex items-center mb-6">
              <span className={`${stockStatus.color} flex items-center text-sm font-medium`}>
                <div className={`w-2 h-2 ${stockStatus.bg} rounded-full mr-1`}></div>
                {stockStatus.label}
              </span>
              <span className="mx-2 text-gray-300">|</span>
              <span className="text-gray-600 text-sm flex items-center">
                <FaTruck className="text-purple-500 mr-1" />
                Delivery: {product.delivery_time}
              </span>
            </div>

            {/* Features List */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Key Features</h3>
              <ul className="space-y-1">
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-gray-600">High quality and durable design</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-gray-600">Includes safety certifications</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-gray-600">Compatible with standard equipment</span>
                </li>
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-gray-600">Includes manufacturer warranty</span>
                </li>
              </ul>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="flex items-center justify-between mt-8">
              <div className="flex items-center border rounded-lg">
                <button className="px-3 py-2 text-gray-600 hover:text-purple-700">
                  <FaMinus size={14} />
                </button>
                <span className="px-4 py-2 text-gray-800 font-medium">1</span>
                <button className="px-3 py-2 text-gray-600 hover:text-purple-700">
                  <FaPlus size={14} />
                </button>
              </div>
              
              <button 
                className="bg-purple-700 hover:bg-purple-800 text-white font-medium py-2 px-6 rounded-lg flex items-center transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Add to Cart
                <FaPlus size={14} className="ml-2" />
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t">
              <div className="flex items-center">
                <FaTruck className="text-purple-700 mr-2" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-900">Fast Delivery</p>
                  <p className="text-xs text-gray-500">Within 60 minutes</p>
                </div>
              </div>
              <div className="flex items-center">
                <FaShieldAlt className="text-purple-700 mr-2" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-900">Quality Guaranteed</p>
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
