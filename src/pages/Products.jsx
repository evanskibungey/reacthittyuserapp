import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
import { useCart } from '../contexts/CartContext';
import { Link } from 'react-router-dom';
import { 
  FaStar, 
  FaStarHalfAlt, 
  FaPlus, 
  FaMinus, 
  FaShoppingCart,
  FaUser,
  FaFilter,
  FaArrowRight,
  FaSearch,
  FaTimes
} from 'react-icons/fa';
import { productService } from '../services/api';
import AuthModal from '../components/AuthModal';
import CartSidebar from '../components/CartSidebar';
import ProductDetailModal from '../components/ProductDetailModal';
import Header from '../components/Header';
import Footer from '../components/Footer';
import OptimizedImage from '../components/common/OptimizedImage';

// Product Image Component with Progressive Loading
const ProgressiveImage = ({ src, alt, className, width, height }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const placeholderSrc = `/api/placeholder/${width || 280}/${height || 200}?text=Loading...`;
  
  return (
    <div className="relative overflow-hidden w-full h-full">
      {/* Low quality placeholder */}
      <div className={`absolute inset-0 ${isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 bg-gray-100 flex items-center justify-center`}>
        <div className="animate-pulse bg-gray-200 rounded-lg w-full h-full"></div>
      </div>
      
      {/* Actual image */}
      <img
        src={src || placeholderSrc}
        alt={alt}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500 h-full w-full object-contain`}
        width={width || 280}
        height={height || 200}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
};

const Products = ({ setIsLoggedIn }) => {
  const { addToCart, setOnAddToCartCallback } = useCart();
  // State for modals and sidebars
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  
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

  // Products state
  const [allProducts, setAllProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState('featured');
  const [searchTerm, setSearchTerm] = useState('');
  const [totalProducts, setTotalProducts] = useState(0);
  
  // Virtual Scrolling for better performance with large lists
  const [visibleProducts, setVisibleProducts] = useState([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const ITEMS_PER_PAGE = 12; // Load 12 items at a time
  const LOAD_THRESHOLD = 800; // px from bottom to trigger load more
  
  // Handle scroll and load more products as user scrolls
  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY;
      setScrollPosition(position);
      
      // Near bottom of page? Load more products
      const nearBottom = 
        window.innerHeight + window.pageYOffset >= 
        document.body.offsetHeight - LOAD_THRESHOLD;
        
      if (nearBottom && !loading && visibleProducts.length < displayedProducts.length) {
        loadMoreItems();
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [displayedProducts, visibleProducts, loading]);
  
  // Load initial batch of products when displayedProducts changes
  useEffect(() => {
    setVisibleProducts(displayedProducts.slice(0, ITEMS_PER_PAGE));
  }, [displayedProducts]);
  
  // Load more items function
  const loadMoreItems = useCallback(() => {
    setVisibleProducts(prev => {
      const nextBatch = displayedProducts.slice(0, prev.length + ITEMS_PER_PAGE);
      return nextBatch;
    });
  }, [displayedProducts]);
  
  // Memoize expensive calculations
  const hasMoreItemsToLoad = useMemo(() => {
    return visibleProducts.length < displayedProducts.length;
  }, [visibleProducts, displayedProducts]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await productService.getCategories();
        if (response && response.success && response.data) {
          const categoryNames = response.data.map(category => category.name);
          setCategories(['All', ...categoryNames]);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        // If API fails, keep the default "All" category
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get all products with a large per_page value
        const response = await productService.getProducts({ per_page: 999 });
        console.log('API Response:', response);
        
        if (response && response.success) {
          // Add a random rating for display purposes
          const enhancedProducts = response.data.map(product => ({
            ...product,
            rating: (Math.floor(Math.random() * 10) + 40) / 10, // Random rating between 4.0-5.0
            reviews: Math.floor(Math.random() * 50) + 10, // Random number of reviews
            delivery_time: '30-60 min'
          }));
          
          setAllProducts(enhancedProducts);
          setTotalProducts(response.data.length);
        } else {
          // Fallback to sample data if API response is invalid
          console.log('Invalid API response, using sample data');
          useSampleData();
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please try again later.');
        useSampleData();
      } finally {
        setLoading(false);
      }
    };

    const useSampleData = () => {
      // Sample data for development or when API fails
      const sampleProducts = [
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
        }
      ];
      setAllProducts(sampleProducts);
      setTotalProducts(sampleProducts.length);
    };

    fetchAllProducts();
  }, []);

  // Filter products based on category, price range, and search term
  useEffect(() => {
    let filtered = [...allProducts];
    
    // Filter by category
    if (activeCategory !== 'All') {
      filtered = filtered.filter(product => product.category === activeCategory);
    }
    
    // Filter by price range
    filtered = filtered.filter(product => 
      product.selling_price >= priceRange[0] && 
      product.selling_price <= priceRange[1]
    );
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(product => {
        return (
          product.name.toLowerCase().includes(searchLower) ||
          (product.description && product.description.toLowerCase().includes(searchLower)) ||
          (product.category && product.category.toLowerCase().includes(searchLower))
        );
      });
    }
    
    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.selling_price - b.selling_price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.selling_price - a.selling_price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default: // 'featured'
        // Keep original order
        break;
    }
    
    setDisplayedProducts(filtered);
  }, [allProducts, activeCategory, priceRange, searchTerm, sortBy]);

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
          <FaStar key={i} size={14} />
        ))}
        {hasHalfStar && <FaStarHalfAlt size={14} />}
        {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
          <FaStar key={`empty-${i}`} className="text-gray-300" size={14} />
        ))}
      </div>
    );
  };

  // Reset all filters
  const resetFilters = () => {
    setActiveCategory('All');
    setPriceRange([0, 10000]);
    setSortBy('featured');
    setSearchTerm('');
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <Header 
        setIsAuthModalOpen={setIsAuthModalOpen} 
        setIsCartOpen={setIsCartOpen} 
        isLoggedIn={isLoggedIn} 
        setIsLoggedIn={setIsLoggedIn}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-purple-700">Home</Link>
          <svg className="h-4 w-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="font-medium text-gray-900">Products</span>
        </div>

        {/* Page Title */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Our Products</h1>
          <button 
            onClick={() => setFilterOpen(!filterOpen)}
            className="md:hidden bg-purple-100 text-purple-700 px-4 py-2 rounded-lg flex items-center"
          >
            <FaFilter className="mr-2" /> 
            Filter
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters - Hidden on mobile unless toggled */}
          <div className={`md:w-1/4 ${filterOpen ? 'block' : 'hidden md:block'}`}>
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 transition-all hover:shadow-md">
              <h2 className="font-bold text-lg mb-4 flex items-center">
                <span className="w-1.5 h-6 bg-purple-500 rounded-full mr-2"></span>
                Categories
              </h2>
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li key={category} className="flex items-center">
                    <button 
                      onClick={() => setActiveCategory(category)}
                      className={`flex items-center w-full text-left p-2 rounded-md transition-colors ${activeCategory === category ? 'bg-purple-100 text-purple-700 font-medium' : 'hover:bg-gray-100'}`}
                    >
                      {activeCategory === category && (
                        <svg className="h-4 w-4 mr-2 text-purple-700" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      {category}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 transition-all hover:shadow-md">
              <h2 className="font-bold text-lg mb-4 flex items-center">
                <span className="w-1.5 h-6 bg-purple-500 rounded-full mr-2"></span>
                Price Range
              </h2>
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span>KSh {priceRange[0].toLocaleString()}</span>
                  <span>KSh {priceRange[1].toLocaleString()}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="10000" 
                  step="100"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-700"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="number" 
                  placeholder="Min" 
                  value={priceRange[0]} 
                  onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                  className="border border-gray-300 rounded-lg p-2 w-full"
                />
                <input 
                  type="number" 
                  placeholder="Max" 
                  value={priceRange[1]} 
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 10000])}
                  className="border border-gray-300 rounded-lg p-2 w-full"
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 transition-all hover:shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg flex items-center">
                  <span className="w-1.5 h-6 bg-purple-500 rounded-full mr-2"></span>
                  Top Rated
                </h2>
                <Link to="#" className="text-purple-700 text-sm hover:underline">View All</Link>
              </div>
              <div className="space-y-4">
                {allProducts
                  .sort((a, b) => b.rating - a.rating)
                  .slice(0, 3)
                  .map(product => (
                    <div key={`top-${product.id}`} className="flex">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <ProgressiveImage 
                          src={product.image_url || `/api/placeholder/100/100?text=${encodeURIComponent(product.name.substring(0, 10))}`}
                          alt={product.name}
                          className="w-full h-full p-2"
                          width={100}
                          height={100}
                        />
                      </div>
                      <div className="ml-3">
                        <button 
                          onClick={() => handleProductClick(product)}
                          className="font-medium text-gray-800 hover:text-purple-700 line-clamp-2 text-left"
                        >
                          {product.name}
                        </button>
                        <div className="flex items-center mt-1">
                          {renderRating(product.rating)}
                          <span className="ml-1 text-sm text-gray-500">{product.rating}</span>
                        </div>
                        <p className="font-bold text-purple-700">KSh {product.selling_price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="md:w-3/4">
            {/* Search and Sort */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6 transition-all hover:shadow-md">
              {/* Search Bar */}
              <div className="mb-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search products by name, description, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50 shadow-sm transition-all focus:shadow"
                  />
                  {searchTerm && (
                    <button 
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      onClick={() => setSearchTerm('')}
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              </div>

              {/* Sort and Results Count */}
              <div className="flex flex-wrap items-center justify-between">
                <p className="text-gray-600">
                  Showing <span className="font-medium">{displayedProducts.length}</span> products
                  {activeCategory !== 'All' ? ` in "${activeCategory}"` : ''}
                  {searchTerm ? ` matching "${searchTerm}"` : ''}
                  {totalProducts > 0 && ` of ${totalProducts} total`}
                </p>
                <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                  <span className="text-gray-600">Sort by:</span>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Rating</option>
                  </select>
                </div>
              </div>

              {/* Active filters */}
              {(activeCategory !== 'All' || searchTerm || priceRange[0] > 0 || priceRange[1] < 10000) && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-gray-500 text-sm">Active filters:</span>
                    
                    {activeCategory !== 'All' && (
                      <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-1 rounded flex items-center">
                        Category: {activeCategory}
                        <button 
                          onClick={() => setActiveCategory('All')} 
                          className="ml-1 hover:text-purple-600"
                        >
                          <FaTimes size={10} />
                        </button>
                      </span>
                    )}
                    
                    {(priceRange[0] > 0 || priceRange[1] < 10000) && (
                      <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-1 rounded flex items-center">
                        Price: KSh {priceRange[0].toLocaleString()} - KSh {priceRange[1].toLocaleString()}
                        <button 
                          onClick={() => setPriceRange([0, 10000])} 
                          className="ml-1 hover:text-purple-600"
                        >
                          <FaTimes size={10} />
                        </button>
                      </span>
                    )}

                    {searchTerm && (
                      <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-1 rounded flex items-center">
                        Search: {searchTerm}
                        <button 
                          onClick={() => setSearchTerm('')} 
                          className="ml-1 hover:text-purple-600"
                        >
                          <FaTimes size={10} />
                        </button>
                      </span>
                    )}
                    
                    <button 
                      onClick={resetFilters}
                      className="text-purple-700 text-xs font-medium ml-auto hover:underline"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
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
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            ) : displayedProducts.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center">
                <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
                  <FaSearch className="w-full h-full" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm 
                    ? `We couldn't find any products matching "${searchTerm}"`
                    : "We couldn't find any products matching your criteria. Try adjusting your filters."}
                </p>
                <button 
                  onClick={resetFilters}
                  className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {visibleProducts.map((product) => (
                    <div 
                      key={product.id}
                      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 relative transform hover:-translate-y-1 border border-gray-100"
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
                      <div className="bg-gradient-to-br from-purple-50 to-gray-50 p-6 h-60 flex items-center justify-center cursor-pointer group" onClick={() => handleProductClick(product)}>
                        <ProgressiveImage 
                          src={product.image_url || `/api/placeholder/280/200?text=${encodeURIComponent(product.name)}`}
                          alt={product.name}
                          className="h-full max-w-full transition-transform duration-500 group-hover:scale-110"
                          width={280}
                          height={200}
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
                        
                        <h3 className="font-medium text-lg mb-1 text-gray-900 cursor-pointer hover:text-purple-700 transition-colors line-clamp-1" onClick={() => handleProductClick(product)}>
                          {product.name}
                        </h3>
                        
                        <p className="text-gray-500 text-sm mb-3 line-clamp-2">{product.description || 'No description available'}</p>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center text-sm text-gray-500">
                            <svg className="w-4 h-4 text-purple-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{product.delivery_time || '30-60 min'}</span>
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
                            className="bg-purple-700 hover:bg-purple-800 text-white p-2 rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:rotate-3 hover:shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed"
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
                
                {/* Load more indicator */}
                {hasMoreItemsToLoad && (
                  <div className="flex justify-center my-8">
                    <button 
                      onClick={loadMoreItems}
                      className="bg-white hover:bg-purple-50 text-purple-700 font-medium py-2 px-4 border border-purple-300 rounded-lg shadow-sm transition-colors flex items-center"
                    >
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-purple-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Load More Products
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

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
    </div>
  );
};

export default Products;