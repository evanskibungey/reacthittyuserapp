import React, { useState, useEffect, useRef, lazy } from 'react';
import { useCart } from '../contexts/CartContext';
import { Link } from 'react-router-dom';
import { 
  FaMapMarkerAlt, 
  FaMoon, 
  FaPhone, 
  FaShoppingCart, 
  FaSearch, 
  FaPlus,
  FaStar,
  FaStarHalfAlt,
  FaUser,
  FaTruck,
  FaShieldAlt,
  FaCreditCard,
  FaArrowRight,
  FaClock,
  FaWhatsapp,
  FaFilter,
  FaTimes
} from 'react-icons/fa';
import { productService, inquiryService } from '../services/api';
import AuthModal from '../components/AuthModal';
import CartSidebar from '../components/CartSidebar';
import ProductDetailModal from '../components/ProductDetailModal';
import Header from '../components/Header';
import Footer from '../components/Footer';
import OptimizedImage from '../components/common/OptimizedImage';

const Home = ({ setIsLoggedIn }) => {
  // Form state for contact/order form
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    
    try {
      setIsSubmitting(true);
      setFormError(null);
      
      // Check if this is an order request based on subject
      const isOrderRequest = formData.subject === 'Order Gas';
      
      // Send data to the backend API
      const response = await inquiryService.submitInquiry({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        is_order_request: isOrderRequest
      });
      
      if (response.success) {
        // Show success message
        setFormSubmitted(true);
        
        // Reset form after 5 seconds
        setTimeout(() => {
          setFormSubmitted(false);
          setFormData({
            name: '',
            phone: '',
            email: '',
            subject: '',
            message: ''
          });
        }, 5000);
      } else {
        // Show error message
        setFormError(response.message || 'An error occurred. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setFormError('An unexpected error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };
  // State for modals and sidebars
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { addToCart, setOnAddToCartCallback } = useCart();
  
  // Function to navigate to cart
  const handleNavigateToCart = () => {
    setIsCartOpen(true); // Open the cart sidebar
  };
  
  // Set up the cart callback when component mounts
  useEffect(() => {
    setOnAddToCartCallback(() => {
      setIsCartOpen(true);
    });
    
    // Cleanup callback when component unmounts
    return () => {
      setOnAddToCartCallback(null);
    };
  }, [setOnAddToCartCallback]);
  
  // Check if user is logged in
  const [isLoggedIn, setIsLoggedInState] = useState(false);
  
  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('authToken');
    setIsLoggedInState(!!token);
  }, []);
  
  // Product state
  const [allProducts, setAllProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isHeaderFixed, setIsHeaderFixed] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const heroRef = useRef(null);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY;
      setScrollPosition(position);
      setIsHeaderFixed(position > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Fetch all products (no pagination)
  useEffect(() => {
    setLoading(true);
    fetchAllProducts();
  }, []);

  // Fetch products function (get all products)
  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      // Get all products without pagination by setting a very large limit
      const response = await productService.getProducts({ per_page: 999 });
      console.log('Home API Response:', response);
      if (response && response.success && response.data) {
        // Add a random rating for display purposes
        const enhancedProducts = response.data.map(product => ({
          ...product,
          rating: (Math.floor(Math.random() * 10) + 40) / 10, // Random rating between 4.0-5.0
          reviews: Math.floor(Math.random() * 50) + 10, // Random number of reviews
          delivery_time: '30-60 min'
        }));
        setAllProducts(enhancedProducts);
        setDisplayedProducts(enhancedProducts); // Initially show all products
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories
  const categories = ['All', ...new Set(allProducts.map(product => product.category))];

  // Filter products by search term and category
  useEffect(() => {
    let filtered = allProducts;
    
    // Filter by category first
    if (activeCategory !== 'All') {
      filtered = filtered.filter(product => product.category === activeCategory);
    }
    
    // Then filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product => {
        const searchLower = searchTerm.toLowerCase();
        return (
          product.name.toLowerCase().includes(searchLower) ||
          (product.description && product.description.toLowerCase().includes(searchLower)) ||
          (product.category && product.category.toLowerCase().includes(searchLower))
        );
      });
    }
    
    setDisplayedProducts(filtered);
  }, [allProducts, activeCategory, searchTerm]);

  // Handle product click
  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Header 
        setIsAuthModalOpen={setIsAuthModalOpen} 
        setIsCartOpen={setIsCartOpen} 
        isLoggedIn={isLoggedIn} 
        setIsLoggedIn={setIsLoggedIn}
      />

      {/* Hero Section - IMPROVED DESIGN */}
      <section className="relative py-24 md:py-32 text-white overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <OptimizedImage 
          src="/heroimg.png" 
          alt="Hero Background" 
          className="w-full h-full"
            objectFit="cover"
                    priority={true} /* Load hero image with high priority since it's above the fold */
                  />
          {/* Enhanced Gradient Overlay with texture */}
          <div 
            className="absolute inset-0 bg-gradient-to-l from-[#4a235a]/95 via-[#663399]/90 to-[#663399]/80 z-0" 
            style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'%3E%3Cpath d='M5 0h1L0 5v1H0V0h5z'/%3E%3C/g%3E%3C/svg%3E')"}}
          ></div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-300/20 rounded-full blur-3xl"></div>
        
        {/* Wave Shape at bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg 
            className="absolute bottom-0 left-0 w-full" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 1440 320"
          >
            <path 
              fill="#f9fafb" 
              fillOpacity="1" 
              d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,202.7C672,203,768,181,864,170.7C960,160,1056,160,1152,170.7C1248,181,1344,203,1392,213.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>
        
        <div className="container mx-auto px-4 relative z-20">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight text-white tracking-tight">
                Cooking Gas <span className="text-orange-300 relative inline-block">Delivered
                  <svg className="absolute -bottom-2 left-0 w-full h-2 text-orange-500/50" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 25 9, 50 5 Q 75 0, 100 5" stroke="currentColor" strokeWidth="10" fill="none" />
                  </svg>
                </span> To Your Doorstep
              </h1>
              <p className="text-lg md:text-xl mb-8 text-gray-100 max-w-xl tracking-wide leading-relaxed">
                Fast, safe and reliable LPG delivery service. Order in minutes and get your gas cylinder delivered within the hour.
              </p>
              
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link 
                  to="/products" 
                  className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-8 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                >
                  Order Now <FaArrowRight className="ml-2" />
                </Link>
                <Link 
                  to="/how-it-works" 
                  className="bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-8 rounded-lg border border-white/30 flex items-center justify-center transition-all duration-300"
                >
                  How It Works
                </Link>
              </div>
              
              <div className="mt-10 flex items-center space-x-4">
                {/* User avatars */}
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(num => (
                    <div key={num} className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold border-2 border-white overflow-hidden shadow-md">
                      {['JD', 'SM', 'AK', 'TP'][num-1]}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center">
                    <div className="text-orange-400 flex">
                      {[1, 2, 3, 4, 5].map(num => (
                        <FaStar key={num} size={14} />
                      ))}
                    </div>
                    <span className="ml-1 font-medium">4.9</span>
                  </div>
                  <p className="text-sm text-gray-300">from 2,000+ happy customers</p>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/2 flex justify-center md:justify-end">
              <div className="relative">
                {/* Fast Delivery Badge with improved styling */}
                <div className="bg-white rounded-xl p-5 shadow-xl inline-flex items-center transform hover:-translate-y-1 transition-transform duration-300">
                  <div className="bg-orange-500 p-3 rounded-lg mr-4 shadow-md">
                    <FaTruck className="text-white text-xl" />
                  </div>
                  <div>
                    <p className="font-bold text-[#663399] text-xl">Fast Delivery</p>
                    <p className="text-gray-600">Within 60 minutes</p>
                  </div>
                </div>
                
                {/* Additional badges for visual appeal */}
                <div className="absolute -top-10 -right-10 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg inline-flex items-center transform rotate-6">
                  <div className="bg-[#663399] p-2 rounded-lg mr-3 shadow-sm">
                    <FaShieldAlt className="text-white text-sm" />
                  </div>
                  <div>
                    <p className="font-bold text-[#663399] text-sm">Safe & Secure</p>
                    <p className="text-gray-600 text-xs">Quality Guaranteed</p>
                  </div>
                </div>
                
                <div className="absolute -bottom-8 -left-8 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg inline-flex items-center transform -rotate-3">
                  <div className="bg-green-500 p-2 rounded-lg mr-3 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-green-700 text-sm">No Hidden Fees</p>
                    <p className="text-gray-600 text-xs">Transparent Pricing</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section - IMPROVED */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold flex items-center">
              <span className="bg-[#663399]/10 h-12 w-2 rounded-full mr-3"></span>
              Featured <span className="text-[#663399] ml-2">Products</span>
            </h2>
            <Link to="/products" className="text-[#663399] hover:text-[#4a235a] font-medium flex items-center transition-colors group">
              View All <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Category Sidebar - IMPROVED */}
            <div className="lg:w-1/4">
              <div className="bg-gradient-to-r from-[#663399] to-[#4a235a] text-white rounded-t-xl p-5 shadow-sm">
                <h3 className="font-medium flex items-center text-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  Categories
                </h3>
              </div>
              <div className="bg-white shadow-md rounded-b-xl border border-gray-100">
                <ul>
                  {categories.map((category) => (
                    <li key={category} className="border-b last:border-b-0">
                      <button 
                        className={`w-full text-left p-4 flex justify-between items-center hover:bg-gray-50 transition-colors ${activeCategory === category ? 'text-[#663399] font-medium bg-purple-50' : 'text-gray-700'}`}
                        onClick={() => setActiveCategory(category)}
                      >
                        <span>{category}</span>
                        {activeCategory === category && (
                          <div className="bg-[#663399] text-white p-1 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-8 bg-gradient-to-br from-purple-50 to-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="font-bold text-lg mb-4 text-gray-800">Need Help?</h3>
                <p className="text-gray-600 mb-6">Our customer service team is here to help you with your purchase.</p>
                <a href="tel:+1234567890" className="flex items-center text-[#663399] font-medium hover:text-[#4a235a] transition-colors">
                  <div className="bg-[#663399] p-2 rounded-full mr-3 text-white">
                    <FaPhone className="text-sm" />
                  </div>
                  Call Us Now
                </a>
              </div>
            </div>
            
            {/* Products Grid - IMPROVED */}
            <div className="lg:w-3/4">
              {/* Search and Sorting Bar */}
              <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  {/* Search Input */}
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaSearch className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search products by name, description, or category..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                    />
                  </div>
                  
                  {/* Sorting Dropdown */}
                  <div className="relative w-full md:w-auto flex items-center">
                    <div className="mr-2 text-gray-600 whitespace-nowrap">Sort by:</div>
                    <select className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#663399] focus:border-transparent flex-1 md:flex-none">
                      <option>Featured</option>
                      <option>Price: Low to High</option>
                      <option>Price: High to Low</option>
                      <option>Rating</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Search Results Count */}
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-gray-600">
                    {displayedProducts.length === 0 && searchTerm 
                      ? 'No products found matching your search' 
                      : `Showing ${displayedProducts.length} products ${activeCategory !== 'All' ? `in ${activeCategory}` : ''}`}
                  </p>
                  
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center"
                    >
                      Clear Search <FaTimes className="ml-1" />
                    </button>
                  )}
                </div>
              </div>
          
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="bg-white rounded-xl p-4 shadow-sm animate-pulse border border-gray-100">
                      <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-4 w-1/2"></div>
                      <div className="flex justify-between items-center">
                        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {displayedProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                      {displayedProducts.map((product) => (
                        <div 
                          key={product.id}
                          className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 relative transform hover:-translate-y-1 border border-gray-100 group"
                        >
                          {/* Product Tags */}
                          <div className="absolute top-0 left-0 p-4 z-10 flex flex-col gap-2">
                            {product.isNew && (
                              <span className="bg-blue-500 text-white text-xs font-medium py-1 px-2 rounded-full shadow-md">
                                NEW
                              </span>
                            )}
                            {product.discount && (
                              <span className="bg-orange-500 text-white text-xs font-medium py-1 px-2 rounded-full shadow-md">
                                {product.discount}% OFF
                              </span>
                            )}
                          </div>
                          
                          {/* Product Image */}
                          <div className="bg-gradient-to-br from-purple-50 to-gray-50 p-6 h-64 flex items-center justify-center cursor-pointer group-hover:from-purple-100 group-hover:to-white transition-all duration-300" onClick={() => handleProductClick(product)}>
                            <OptimizedImage 
                              src={product.image_url || `/api/placeholder/280/200?text=${encodeURIComponent(product.name)}`}
                              alt={product.name}
                              className="h-full max-w-full transition-transform duration-500 group-hover:scale-110"
                              objectFit="contain"
                              width={280}
                              height={200}
                            />
                          </div>
                          
                          {/* Product Details */}
                          <div className="p-5">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-[#663399] bg-purple-50 px-2 py-1 rounded-full">
                                {product.category}
                              </span>
                              <div className="flex items-center">
                                <div className="flex text-yellow-400 items-center text-sm">
                                  <FaStar />
                                  <span className="ml-1 text-gray-700 font-medium">{product.rating}</span>
                                </div>
                              </div>
                            </div>
                            
                            <h3 className="font-medium text-lg mb-1 text-gray-900 cursor-pointer hover:text-[#663399] transition-colors line-clamp-1" onClick={() => handleProductClick(product)}>
                              {product.name}
                            </h3>
                            
                            <p className="text-gray-500 text-sm mb-3 line-clamp-2">{product.description || 'No description available'}</p>
                            
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center text-sm text-gray-500">
                                <FaClock className="text-[#663399] mr-1" />
                                <span>{product.delivery_time}</span>
                              </div>
                              
                              {product.current_stock > 10 ? (
                                <span className="text-green-600 text-sm font-medium flex items-center">
                                  <div className="w-2 h-2 bg-green-600 rounded-full mr-1"></div>
                                  In Stock
                                </span>
                              ) : product.current_stock > 0 ? (
                                <span className="text-orange-500 text-sm font-medium flex items-center">
                                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-1"></div>
                                  Low Stock
                                </span>
                              ) : (
                                <span className="text-red-600 text-sm font-medium flex items-center">
                                  <div className="w-2 h-2 bg-red-600 rounded-full mr-1"></div>
                                  Out of Stock
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-xl font-bold text-gray-900">KSh {product.selling_price.toLocaleString()}</span>
                                {product.originalPrice && (
                                  <span className="text-sm text-gray-500 line-through ml-2">
                                    KSh {product.originalPrice.toLocaleString()}
                                  </span>
                                )}
                              </div>
                              
                              <button 
                                onClick={() => addToCart(product, 1)}
                                className="bg-[#663399] hover:bg-[#4a235a] text-white p-2 rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
                                aria-label="Add to cart"
                                disabled={product.current_stock <= 0}
                              >
                                <FaPlus size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* No products found message */
                    <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
                      <FaSearch className="mx-auto text-gray-300 text-5xl mb-4" />
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
                      <p className="text-gray-500 mb-6">
                        {searchTerm 
                          ? `We couldn't find any products matching "${searchTerm}"` 
                          : 'No products available in this category'}
                      </p>
                      <button 
                        onClick={() => {
                          setSearchTerm('');
                          setActiveCategory('All');
                        }}
                        className="bg-[#663399] hover:bg-[#4a235a] text-white font-medium py-2 px-6 rounded-lg transition-all"
                      >
                        View All Products
                      </button>
                    </div>
                  )}

                  {/* Loading spinner shown during API requests */}
                  {loading && (
                    <div className="col-span-full flex justify-center py-6">
                      <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-[#663399] transition ease-in-out duration-150">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading products...
                      </div>
                    </div>
                  )}
                </>
              )}
              
              <div className="mt-12 text-center">
                <Link 
                  to="/products" 
                  className="inline-flex items-center justify-center bg-[#663399] hover:bg-[#4a235a] text-white font-medium py-3 px-8 rounded-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                >
                  Browse All Products
                  <FaArrowRight className="ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - IMPROVED */}
      <section className="py-20 bg-gradient-to-b from-purple-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center mb-4">
              <span className="bg-[#663399]/10 h-1 w-10 rounded-full"></span>
              <span className="bg-[#663399]/20 h-1 w-5 rounded-full mx-1"></span>
              <span className="bg-[#663399]/30 h-1 w-3 rounded-full"></span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose <span className="text-[#663399]">Hitty Deliveries</span></h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Experience the best gas delivery service with our customer-focused approach</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-xl shadow hover:shadow-lg transition-all duration-300 border border-gray-100 transform hover:-translate-y-1 group">
              <div className="w-16 h-16 bg-gradient-to-br from-[#663399]/10 to-[#663399]/5 rounded-full flex items-center justify-center mb-6 group-hover:from-[#663399]/20 group-hover:to-[#663399]/10 transition-all duration-300">
                <FaTruck className="text-[#663399] text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Fast Delivery</h3>
              <p className="text-gray-600 leading-relaxed">Get your gas cylinder delivered within 60 minutes of placing your order.</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow hover:shadow-lg transition-all duration-300 border border-gray-100 transform hover:-translate-y-1 group">
              <div className="w-16 h-16 bg-gradient-to-br from-[#663399]/10 to-[#663399]/5 rounded-full flex items-center justify-center mb-6 group-hover:from-[#663399]/20 group-hover:to-[#663399]/10 transition-all duration-300">
                <FaShieldAlt className="text-[#663399] text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Safety First</h3>
              <p className="text-gray-600 leading-relaxed">All our cylinders are safety checked and comply with industry standards.</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow hover:shadow-lg transition-all duration-300 border border-gray-100 transform hover:-translate-y-1 group">
              <div className="w-16 h-16 bg-gradient-to-br from-[#663399]/10 to-[#663399]/5 rounded-full flex items-center justify-center mb-6 group-hover:from-[#663399]/20 group-hover:to-[#663399]/10 transition-all duration-300">
                <svg className="text-[#663399] w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">24/7 Support</h3>
              <p className="text-gray-600 leading-relaxed">Our customer support team is available round the clock to assist you.</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow hover:shadow-lg transition-all duration-300 border border-gray-100 transform hover:-translate-y-1 group">
              <div className="w-16 h-16 bg-gradient-to-br from-[#663399]/10 to-[#663399]/5 rounded-full flex items-center justify-center mb-6 group-hover:from-[#663399]/20 group-hover:to-[#663399]/10 transition-all duration-300">
                <svg className="text-[#663399] w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 8V6C16 3.79086 14.2091 2 12 2C9.79086 2 8 3.79086 8 6V8M10 15C10 16.1046 10.8954 17 12 17C13.1046 17 14 16.1046 14 15C14 13.8954 13.1046 13 12 13C10.8954 13 10 13.8954 10 15ZM5 8H19V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Secure Payments</h3>
              <p className="text-gray-600 leading-relaxed">Multiple payment options with secure and encrypted transactions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Download App Section - IMPROVED */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-[#4a235a] to-[#663399] rounded-2xl overflow-hidden shadow-xl relative">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -ml-32 -mt-32"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mb-32"></div>
            
            <div className="flex flex-col md:flex-row items-center relative z-10">
              <div className="md:w-1/2 p-10 md:p-16">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/10 text-white mb-6">
                  <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  NEW
                </span>
                
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">Download Our Mobile App</h2>
                <p className="text-gray-200 mb-8 text-lg leading-relaxed">Get exclusive offers and track your orders in real-time with our mobile app. Easy to use and available for iOS and Android.</p>
                
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-10">
                  <a href="#" className="bg-black text-white rounded-xl overflow-hidden flex items-center px-5 py-3 hover:bg-gray-900 transition-all hover:shadow-lg transform hover:-translate-y-1">
                    <svg className="w-8 h-8 mr-3" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.5227 7.39069V13.8381C17.5227 16.6017 16.2193 17.9509 13.5064 17.9509H7.01319C4.30031 17.9509 2.99689 16.6017 2.99689 13.8381V7.38186C2.99689 4.61826 4.30031 3.26904 7.01319 3.26904H13.5053C16.2193 3.26904 17.5227 4.61826 17.5227 7.39069Z" fill="currentColor"/>
                      <path opacity="0.4" d="M21.0032 16.5614V17.2076C21.0032 19.9712 19.6997 21.3204 16.9869 21.3204H10.4948C7.87193 21.3204 6.57965 20.0711 6.50024 17.4464H13.5064C17.2845 17.4464 19.2187 15.5122 19.2187 11.7342V4.7281H16.9758C19.6009 4.7281 21.0032 6.13053 21.0032 8.89413V16.5614Z" fill="currentColor"/>
                    </svg>
                    <div>
                      <div className="text-xs">Download on the</div>
                      <div className="text-sm font-semibold">App Store</div>
                    </div>
                  </a>
                  
                  <a href="#" className="bg-black text-white rounded-xl overflow-hidden flex items-center px-5 py-3 hover:bg-gray-900 transition-all hover:shadow-lg transform hover:-translate-y-1">
                    <svg className="w-8 h-8 mr-3" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.0001 7.47008L14.1001 3.4801L14.1101 3.4701C14.5401 2.6201 14.5401 1.6001 14.1101 0.750098C13.8801 0.300098 13.5101 0.00012207 13.0001 0.00012207L2.00011 0.000122070C1.60011 0.000122070 1.23011 0.180122 0.990114 0.530122C0.750114 0.870122 0.690114 1.30012 0.840114 1.69012L5.74011 13.9701L12.0001 7.47008Z" fill="currentColor"/>
                      <path d="M5.73989 13.97L0.839891 1.68997C0.829891 1.68997 0.829891 1.68997 0.819891 1.68997L7.31989 8.43997L5.73989 13.97Z" fill="currentColor"/>
                      <path d="M23.1598 1.68994L14.0998 3.47994L7.31982 10.85L5.73982 13.9699L12.0098 20.6299L13.9398 23.7799C13.9498 23.7899 13.9598 23.7899 13.9698 23.7899L23.1598 1.68994Z" fill="currentColor"/>
                      <path d="M14.1101 3.47L14.1001 3.48L23.1601 1.69L14.1101 3.47Z" fill="currentColor"/>
                    </svg>
                    <div>
                      <div className="text-xs">GET IT ON</div>
                      <div className="text-sm font-semibold">Google Play</div>
                    </div>
                  </a>
                </div>
                
                <div className="flex items-center">
                  {/* App users */}
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map(num => (
                      <div key={num} className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold border-2 border-[#663399] overflow-hidden shadow-md">
                        {['JD', 'SM', 'AK', 'TP'][num-1]}
                      </div>
                    ))}
                  </div>
                  <div className="ml-4">
                    <div className="text-white font-medium">Join 10,000+ happy customers</div>
                    <div className="text-purple-200 text-sm">★★★★★ 4.9 app rating</div>
                  </div>
                </div>
              </div>
              
              <div className="md:w-1/2 relative p-8">
                <div className="relative">
                  {/* Phone mockup with shadow and reflection */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl transform translate-y-4 blur-xl scale-90 mx-auto w-64 h-5/6"></div>
                  <OptimizedImage 
                    src="/api/placeholder/600/500?text=App+Screenshot" 
                    alt="Mobile App" 
                    className="w-full max-w-sm mx-auto rounded-3xl border-8 border-gray-800 shadow-2xl relative z-10"
                    width={600}
                    height={500}
                  />
                  
                  {/* Floating elements */}
                  <div className="absolute top-10 -right-5 bg-white rounded-xl p-4 shadow-lg z-20 transform rotate-6">
                    <div className="flex items-center">
                      <div className="bg-green-500 p-2 rounded-lg mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-green-700 text-sm">Order Delivered</p>
                        <p className="text-gray-600 text-xs">2 mins ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section - IMPROVED */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg border border-gray-100">
            <div className="flex flex-col md:flex-row gap-12">
              {/* Contact Info */}
              <div className="md:w-1/2">
                <div className="inline-flex items-center justify-center mb-4">
                  <span className="bg-[#663399]/10 h-1 w-10 rounded-full"></span>
                  <span className="bg-[#663399]/20 h-1 w-5 rounded-full mx-1"></span>
                  <span className="bg-[#663399]/30 h-1 w-3 rounded-full"></span>
                </div>
                <h2 className="text-3xl font-bold mb-6">Get In <span className="text-[#663399]">Touch</span></h2>
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">Have questions or need assistance? Our team is here to help you with any inquiries about our gas delivery service.</p>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-[#663399]/10 rounded-xl p-4 mr-5">
                      <FaPhone className="text-[#663399] text-xl" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg text-gray-800">Phone</h3>
                      <p className="text-gray-600">+254 712 345 678</p>
                      <p className="text-gray-500 text-sm mt-1">Mon-Fri, 8am-6pm</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-[#663399]/10 rounded-xl p-4 mr-5">
                      <svg className="w-6 h-6 text-[#663399]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-lg text-gray-800">Email</h3>
                      <p className="text-gray-600">support@hittydeliveries.com</p>
                      <p className="text-gray-500 text-sm mt-1">We respond within 24 hours</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-[#663399]/10 rounded-xl p-4 mr-5">
                      <FaMapMarkerAlt className="text-[#663399] text-xl" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg text-gray-800">Address</h3>
                      <p className="text-gray-600">123 Business District, Nairobi, Kenya</p>
                      <p className="text-gray-500 text-sm mt-1">Main headquarters</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-10">
                  <button className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-8 rounded-lg flex items-center transition-all hover:shadow-lg transform hover:-translate-y-1">
                    <FaWhatsapp className="mr-2 text-xl" />
                    Chat on WhatsApp
                  </button>
                </div>
              </div>
              
              {/* Contact Form */}
              <div className="md:w-1/2">
                <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="text-2xl font-bold mb-6 text-gray-800">Send Us a Message/Order from here</h3>
                  {formSubmitted ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                      <svg className="w-12 h-12 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h4 className="text-xl font-bold text-green-800 mb-2">Thank You!</h4>
                      <p className="text-green-700 mb-4">Your message/order has been submitted successfully.</p>
                      <p className="text-green-600 text-sm">We'll get back to you shortly.</p>
                    </div>
                  ) : (
                  <form className="space-y-5" onSubmit={handleFormSubmit}>
                    <div>
                      <label htmlFor="name" className="block text-gray-700 mb-2 font-medium">Full Name</label>
                      <input 
                        type="text" 
                        id="name" 
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#663399] focus:border-transparent bg-white"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-gray-700 mb-2 font-medium">Phone Number <span className="text-red-500">*</span></label>
                      <input 
                        type="tel" 
                        id="phone" 
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#663399] focus:border-transparent bg-white"
                        placeholder="Your phone number"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-gray-700 mb-2 font-medium">Email Address <span className="text-gray-400">(Optional)</span></label>
                      <input 
                        type="email" 
                        id="email" 
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#663399] focus:border-transparent bg-white"
                        placeholder="Your email (optional)"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="subject" className="block text-gray-700 mb-2 font-medium">Subject</label>
                      <select 
                        id="subject" 
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#663399] focus:border-transparent bg-white appearance-none"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                      >
                        <option>Select a subject</option>
                        <option>Order Gas</option>
                        <option>Delivery Inquiry</option>
                        <option>Product Information</option>
                        <option>Billing Question</option>
                        <option>Technical Support</option>
                        <option>Other</option>
                      </select>
                      <div className="pointer-events-none absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-gray-700 mb-2 font-medium">Message</label>
                      <textarea 
                        id="message" 
                        rows={4}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#663399] focus:border-transparent bg-white"
                        placeholder="Your message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                      ></textarea>
                    </div>
                    
                    {formError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4">
                        {formError}
                      </div>
                    )}
                    
                    <button 
                      type="submit"
                      className="w-full bg-[#663399] hover:bg-[#4a235a] text-white font-medium py-3 px-6 rounded-lg transition-all hover:shadow-lg transform hover:-translate-y-1 flex items-center justify-center"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting...
                        </>
                      ) : 'Send Message/Submit Order'}
                    </button>
                    
                    <p className="text-center text-gray-500 text-sm">We'll get back to you as soon as possible</p>
                    <p className="text-center text-gray-500 text-sm mt-1">For urgent orders, please call us directly</p>
                  </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        setIsLoggedIn={setIsLoggedIn}
      />
      
      {/* Cart Sidebar */}
      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        product={selectedProduct}
        navigateToCart={handleNavigateToCart}
      />
      
      {/* Floating WhatsApp Button - IMPROVED */}
      <a 
        href="#" 
        className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-xl hover:bg-green-600 transition-all z-50 transform hover:scale-110 hover:-translate-y-1 group"
        aria-label="Chat on WhatsApp"
      >
        <FaWhatsapp size={28} className="group-hover:animate-pulse" />
      </a>
    </div>
  );
};  

export default Home;