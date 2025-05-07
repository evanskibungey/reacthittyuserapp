import React, { useState, useEffect, useRef } from 'react';
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
  FaWhatsapp
} from 'react-icons/fa';
import { productService } from '../services/api';
import AuthModal from '../components/AuthModal';
import CartSidebar from '../components/CartSidebar';
import ProductDetailModal from '../components/ProductDetailModal';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Home = ({ setIsLoggedIn }) => {
  // State for modals and sidebars
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Product state
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // Fetch products
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        try {
          const response = await productService.getProducts({ limit: 8 });
          setFeaturedProducts(response.data || []);
        } catch (err) {
          console.log('API not available, using sample data');
          // Sample data for development
          setFeaturedProducts([
            {
              id: 1,
              name: 'LPG 6kg Cylinder',
              description: 'Standard 6kg LPG cylinder for home use',
              selling_price: 1299,
              category_id: 1,
              category: 'Home Cylinders',
              current_stock: 50,
              rating: 4.8,
              reviews: 42,
              delivery_time: '30-60 min'
            },
            {
              id: 2,
              name: 'LPG 13kg Cylinder',
              description: 'Large 13kg LPG cylinder for extended use',
              selling_price: 2499,
              category_id: 1,
              category: 'Home Cylinders',
              current_stock: 30,
              rating: 4.9,
              reviews: 38,
              isNew: true,
              delivery_time: '30-60 min'
            },
            {
              id: 3,
              name: 'LPG 22kg Cylinder',
              description: 'Extra large 22kg LPG cylinder for commercial use',
              selling_price: 3799,
              category_id: 1,
              category: 'Commercial Cylinders',
              current_stock: 5,
              rating: 4.5,
              reviews: 24,
              discount: 5,
              delivery_time: '1-2 hours'
            },
            {
              id: 4,
              name: 'Standard Gas Regulator',
              description: 'Universal gas regulator with hose',
              selling_price: 899,
              category_id: 2,
              category: 'Accessories',
              current_stock: 100,
              rating: 4.6,
              reviews: 31,
              delivery_time: '30-60 min'
            },
            {
              id: 5,
              name: '2-Burner Gas Stove',
              description: 'Efficient 2-burner gas stove for your kitchen',
              selling_price: 4599,
              category_id: 3,
              category: 'Gas Stoves',
              current_stock: 25,
              rating: 4.9,
              reviews: 56,
              discount: 10,
              originalPrice: 5099,
              delivery_time: '1-2 hours'
            },
            {
              id: 6,
              name: 'Standard Gas Hose (1.5m)',
              description: 'High-quality gas hose for safe connections',
              selling_price: 699,
              category_id: 4,
              category: 'Accessories',
              current_stock: 75,
              rating: 4.7,
              reviews: 19,
              delivery_time: '30-60 min'
            },
            {
              id: 7,
              name: 'Digital Gas Detector',
              description: 'Safety device to detect gas leaks in your home',
              selling_price: 1899,
              category_id: 2,
              category: 'Safety Devices',
              current_stock: 40,
              rating: 4.8,
              reviews: 27,
              isNew: true,
              delivery_time: '30-60 min'
            },
            {
              id: 8,
              name: '3-Burner Gas Stove (Premium)',
              description: 'Luxury 3-burner gas stove with auto-ignition',
              selling_price: 6999,
              category_id: 3,
              category: 'Gas Stoves',
              current_stock: 15,
              rating: 4.9,
              reviews: 42,
              isNew: true,
              delivery_time: '1-2 hours'
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Get unique categories
  const categories = ['All', ...new Set(featuredProducts.map(product => product.category))];

  // Filter products by category
  const filteredProducts = activeCategory === 'All' 
    ? featuredProducts 
    : featuredProducts.filter(product => product.category === activeCategory);

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
        isLoggedIn={false} 
        setIsLoggedIn={setIsLoggedIn}
      />

      {/* Hero Section */}
      <section className="relative py-20 md:py-28 text-white overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/heroimg.png" 
            alt="Hero Background" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Gradient Overlay with texture */}
        <div className="absolute inset-0 bg-gradient-to-l from-purple-900/95 via-purple-800/90 to-purple-700/80 z-0" 
            style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'%3E%3Cpath d='M5 0h1L0 5v1H0V0h5z'/%3E%3C/g%3E%3C/svg%3E')"}}
        ></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-24 h-24 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-300/10 rounded-full blur-3xl"></div>
        
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
            <div 
              className="md:w-1/2 mb-10 md:mb-0"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight text-white tracking-tight">
                Cooking Gas <span className="text-orange-300 relative inline-block">Delivered
                  <svg className="absolute -bottom-2 left-0 w-full h-2 text-orange-500/50" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 25 9, 50 5 Q 75 0, 100 5" stroke="currentColor" strokeWidth="10" fill="none" />
                  </svg>
                </span> To Your Doorstep
              </h1>
              <p className="text-lg md:text-xl mb-8 text-gray-100 max-w-lg tracking-wide">
                Fast, safe and reliable LPG delivery service. Order in minutes and get your gas cylinder delivered within the hour.
              </p>
              
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link 
                  to="/products" 
                  className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-8 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-lg"
                >
                  Order Now
                </Link>
                <Link 
                  to="/how-it-works" 
                  className="bg-transparent hover:bg-white/10 text-white font-medium py-3 px-8 rounded-lg border-2 border-white flex items-center justify-center transition-all"
                >
                  How It Works
                </Link>
              </div>
              
              <div className="mt-10 flex items-center space-x-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(num => (
                    <div key={num} className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white overflow-hidden">
                      <img src={`/api/placeholder/40/40?text=${num}`} alt="User" className="w-full h-full object-cover" />
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
                  <p className="text-sm text-gray-300">from 2,000+ reviews</p>
                </div>
              </div>
            </div>
            
            <div 
              className="md:w-1/2 flex justify-center"
            >
              <div className="relative">
                {/* Fast Delivery Badge matching the provided image */}
                <div className="bg-white text-purple-900 rounded-lg p-4 shadow-lg inline-flex items-center">
                  <div className="bg-orange-500 p-2 rounded-lg mr-3">
                    <FaTruck className="text-white text-xl" />
                  </div>
                  <div>
                    <p className="font-bold text-purple-800 text-lg">Fast Delivery</p>
                    <p className="text-gray-600">Within 60 minutes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Featured Products Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured <span className="text-purple-700">Products</span></h2>
            <Link to="/products" className="text-purple-700 hover:text-purple-900 font-medium flex items-center transition-colors">
              View All <FaArrowRight className="ml-2" />
            </Link>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Category Sidebar */}
            <div className="lg:w-1/4">
              <div className="bg-purple-700 text-white rounded-t-lg p-4">
                <h3 className="font-medium flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  Categories
                </h3>
              </div>
              <div className="bg-white shadow-sm rounded-b-lg">
                <ul>
                  {categories.map((category) => (
                    <li key={category} className="border-b last:border-b-0">
                      <button 
                        className={`w-full text-left p-4 flex justify-between items-center hover:bg-gray-50 transition-colors ${activeCategory === category ? 'text-purple-700 font-medium' : 'text-gray-700'}`}
                        onClick={() => setActiveCategory(category)}
                      >
                        <span>{category}</span>
                        {activeCategory === category && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-700" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-8 bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="font-bold text-lg mb-4">Need Help?</h3>
                <p className="text-gray-600 mb-4">Our customer service team is here to help you with your purchase.</p>
                <a href="tel:+1234567890" className="flex items-center text-purple-700 font-medium hover:text-purple-900 transition-colors">
                  <FaPhone className="mr-2" /> Call Us
                </a>
              </div>
            </div>
            
            {/* Products Grid */}
            <div className="lg:w-3/4">
              <div className="mb-6">
                <p className="text-gray-600">Showing {filteredProducts.length} products {activeCategory !== 'All' ? `in ${activeCategory}` : ''}</p>
              </div>
          
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.slice(0, 9).map((product) => (
                <div 
                  key={product.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 relative transform hover:-translate-y-1"
                >
                  {/* Product Tags */}
                  <div className="absolute top-0 left-0 p-4 z-10 flex flex-col gap-2">
                    {product.isNew && (
                      <span className="bg-blue-500 text-white text-xs font-medium py-1 px-2 rounded-full">
                        NEW
                      </span>
                    )}
                    {product.discount && (
                      <span className="bg-orange-500 text-white text-xs font-medium py-1 px-2 rounded-full">
                        {product.discount}% OFF
                      </span>
                    )}
                  </div>
                  
                  {/* Product Image */}
                  <div className="bg-gray-50 p-6 h-48 flex items-center justify-center">
                    <img 
                      src={`/api/placeholder/280/200?text=${encodeURIComponent(product.name)}`}
                      alt={product.name}
                      className="h-full object-contain max-w-full"
                    />
                  </div>
                  
                  {/* Product Details */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded">
                        {product.category}
                      </span>
                      <div className="flex items-center">
                        <div className="flex text-yellow-400 items-center text-sm">
                          <FaStar />
                          <span className="ml-1 text-gray-700 font-medium">{product.rating}</span>
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="font-medium text-lg mb-1 text-gray-900 hover:text-purple-700 transition-colors">
                      <button 
                        onClick={() => handleProductClick(product)}
                        className="hover:text-purple-700 transition-colors text-left"
                      >
                        {product.name}
                      </button>
                    </h3>
                    
                    <p className="text-gray-500 text-sm mb-3 overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical'}}>{product.description}</p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center text-sm text-gray-500">
                        <FaClock className="text-purple-500 mr-1" />
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
                        className="bg-purple-700 hover:bg-purple-800 text-white p-2 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
                        aria-label="Add to cart"
                      >
                        <FaPlus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                  ))}
                </div>
              )}
              
              <div className="mt-8 text-center">
                <Link 
                  to="/products" 
                  className="inline-flex items-center justify-center bg-purple-700 hover:bg-purple-800 text-white font-medium py-3 px-8 rounded-lg transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-lg"
                >
                  Browse All Products
                  <FaArrowRight className="ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-b from-purple-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose <span className="text-purple-700">Hitty Deliveries</span></h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Experience the best gas delivery service with our customer-focused approach</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <FaTruck className="text-purple-700 text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Get your gas cylinder delivered within 60 minutes of placing your order.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <FaShieldAlt className="text-purple-700 text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-2">Safety First</h3>
              <p className="text-gray-600">All our cylinders are safety checked and comply with industry standards.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg className="text-purple-700 w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">24/7 Support</h3>
              <p className="text-gray-600">Our customer support team is available round the clock to assist you.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg className="text-purple-700 w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 8V6C16 3.79086 14.2091 2 12 2C9.79086 2 8 3.79086 8 6V8M10 15C10 16.1046 10.8954 17 12 17C13.1046 17 14 16.1046 14 15C14 13.8954 13.1046 13 12 13C10.8954 13 10 13.8954 10 15ZM5 8H19V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Secure Payments</h3>
              <p className="text-gray-600">Multiple payment options with secure and encrypted transactions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Download App Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-purple-900 to-purple-700 rounded-2xl overflow-hidden shadow-xl">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 p-8 md:p-12">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Download Our Mobile App</h2>
                <p className="text-gray-200 mb-8">Get exclusive offers and track your orders in real-time with our mobile app</p>
                
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <a href="#" className="bg-black text-white rounded-lg overflow-hidden flex items-center px-4 py-2 hover:bg-gray-900 transition">
                    <svg className="w-8 h-8 mr-3" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.5227 7.39069V13.8381C17.5227 16.6017 16.2193 17.9509 13.5064 17.9509H7.01319C4.30031 17.9509 2.99689 16.6017 2.99689 13.8381V7.38186C2.99689 4.61826 4.30031 3.26904 7.01319 3.26904H13.5053C16.2193 3.26904 17.5227 4.61826 17.5227 7.39069Z" fill="currentColor"/>
                      <path opacity="0.4" d="M21.0032 16.5614V17.2076C21.0032 19.9712 19.6997 21.3204 16.9869 21.3204H10.4948C7.87193 21.3204 6.57965 20.0711 6.50024 17.4464H13.5064C17.2845 17.4464 19.2187 15.5122 19.2187 11.7342V4.7281H16.9758C19.6009 4.7281 21.0032 6.13053 21.0032 8.89413V16.5614Z" fill="currentColor"/>
                    </svg>
                    <div>
                      <div className="text-xs">Download on the</div>
                      <div className="text-sm font-semibold">App Store</div>
                    </div>
                  </a>
                  
                  <a href="#" className="bg-black text-white rounded-lg overflow-hidden flex items-center px-4 py-2 hover:bg-gray-900 transition">
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
                
                <div className="mt-8 flex items-center">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map(num => (
                      <div key={num} className="w-8 h-8 rounded-full bg-gray-300 border-2 border-purple-800 overflow-hidden">
                        <img src={`/api/placeholder/40/40?text=${num}`} alt="User" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <div className="ml-4">
                    <div className="text-white">Join 10,000+ happy customers</div>
                  </div>
                </div>
              </div>
              
              <div className="md:w-1/2 relative">
                <img 
                  src="/api/placeholder/600/500?text=App+Screenshot" 
                  alt="Mobile App" 
                  className="w-full max-w-sm mx-auto transform translate-y-4"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-gray-50 rounded-2xl p-8 md:p-12 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-3xl font-bold mb-6">Contact <span className="text-purple-700">Us</span></h2>
                <p className="text-gray-600 mb-8">Have questions or need assistance? Our team is here to help you with any inquiries.</p>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-purple-100 rounded-full p-3 mr-4">
                      <FaPhone className="text-purple-700" />
                    </div>
                    <div>
                      <h3 className="font-medium">Phone</h3>
                      <p className="text-gray-600">+254 712 345 678</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-purple-100 rounded-full p-3 mr-4">
                      <svg className="w-5 h-5 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Email</h3>
                      <p className="text-gray-600">support@hittydeliveries.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-purple-100 rounded-full p-3 mr-4">
                      <FaMapMarkerAlt className="text-purple-700" />
                    </div>
                    <div>
                      <h3 className="font-medium">Address</h3>
                      <p className="text-gray-600">123 Business District, Nairobi, Kenya</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <button className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-lg flex items-center transition-colors">
                    <FaWhatsapp className="mr-2" />
                    Chat on WhatsApp
                  </button>
                </div>
              </div>
              
              <div>
                <form className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-gray-700 mb-2">Full Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Your name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-gray-700 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      id="email" 
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Your email"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-gray-700 mb-2">Message</label>
                    <textarea 
                      id="message" 
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Your message"
                    ></textarea>
                  </div>
                  
                  <button 
                    type="submit"
                    className="w-full bg-purple-700 hover:bg-purple-800 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    Send Message
                  </button>
                </form>
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
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        product={selectedProduct}
      />
      
      {/* Floating WhatsApp Button */}
      <a 
        href="#" 
        className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors z-50"
        aria-label="Chat on WhatsApp"
      >
        <FaWhatsapp size={24} />
      </a>
    </div>
  );
};

export default Home;
