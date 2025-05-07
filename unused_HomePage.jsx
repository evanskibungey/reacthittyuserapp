import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaMoon, FaPhone, FaShoppingCart, FaUser, FaSearch, FaPlus } from 'react-icons/fa';
import { productService } from '../services/api';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        // In a real app, you might have a parameter to fetch featured products
        try {
          const response = await productService.getProducts({ limit: 6 });
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
              current_stock: 50,
              rating: 4.8,
              reviews: 42
            },
            {
              id: 2,
              name: 'LPG 13kg Cylinder',
              description: 'Large 13kg LPG cylinder for extended use',
              selling_price: 2499,
              category_id: 1,
              current_stock: 30,
              rating: 4.9,
              reviews: 38,
              isNew: true
            },
            {
              id: 3,
              name: 'LPG 22kg Cylinder',
              description: 'Extra large 22kg LPG cylinder for commercial use',
              selling_price: 3799,
              category_id: 1,
              current_stock: 5,
              rating: 4.5,
              reviews: 24,
              discount: 5
            },
            {
              id: 4,
              name: 'Standard Gas Regulator',
              description: 'Universal gas regulator with hose',
              selling_price: 899,
              category_id: 2,
              current_stock: 100,
              rating: 4.6,
              reviews: 31
            },
            {
              id: 5,
              name: '2-Burner Gas Stove',
              description: 'Efficient 2-burner gas stove for your kitchen',
              selling_price: 4599,
              category_id: 3,
              current_stock: 25,
              rating: 4.9,
              reviews: 56,
              discount: 10,
              originalPrice: 5099
            },
            {
              id: 6,
              name: 'Standard Gas Hose (1.5m)',
              description: 'High-quality gas hose for safe connections',
              selling_price: 699,
              category_id: 4,
              current_stock: 75,
              rating: 4.7,
              reviews: 19
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

  // Function to render star ratings
  const renderRating = (rating, reviews) => {
    return (
      <div className="flex items-center">
        <div className="flex text-yellow-400">
          {[...Array(5)].map((_, i) => (
            <svg 
              key={i} 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4" 
              viewBox="0 0 20 20" 
              fill={i < Math.floor(rating) ? "currentColor" : "none"}
              stroke="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <span className="text-gray-500 text-sm ml-1">({reviews})</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* 1. Navigation Bar and Logo Section */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center">
              <FaMapMarkerAlt className="text-purple-700 mr-2" />
              <select className="border-none text-gray-700 focus:outline-none">
                <option>Nairobi, Kenya</option>
                <option>Mombasa, Kenya</option>
                <option>Kisumu, Kenya</option>
              </select>
            </div>
            <div className="flex items-center space-x-4">
              <button className="flex items-center">
                <FaMoon className="mr-2" />
                <span>Light Mode</span>
              </button>
              <button className="flex items-center">
                <FaPhone className="mr-2" />
                <span>01700000000</span>
              </button>
              
            </div>
          </div>

          {/* Main Navigation */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <div className="flex items-center">
                <img src="/logo.svg" alt="Hitty Deliveries" className="h-12" />
              </div>
              </Link>
              <nav className="ml-10">
                <ul className="flex space-x-6">
                  <li>
                    <Link to="/" className="font-medium text-gray-900 hover:text-purple-700">Home</Link>
                  </li>
                  <li>
                    <Link to="/products" className="font-medium text-gray-600 hover:text-purple-700">Products</Link>
                  </li>
                  <li>
                    <Link to="#" className="font-medium text-gray-600 hover:text-purple-700">Stores</Link>
                  </li>
                </ul>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/track" className="text-gray-600 hover:text-purple-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </Link>
              <Link to="/cart" className="text-gray-600 hover:text-purple-700">
                <FaShoppingCart className="h-6 w-6" />
              </Link>
              <Link to="/login" className="bg-purple-700 text-white px-4 py-2 rounded-full hover:bg-purple-800 transition duration-200">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Hero Section with Background */}
      <section className="bg-purple-700 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-800 to-purple-600 opacity-90"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Cooking Gas Delivery<br />In Just 3 Simple Steps</h1>
              <p className="text-lg mb-8">Order cooking gas online and get fast, reliable delivery to your doorstep. No more waiting in lines or carrying heavy cylinders.</p>
              <div className="flex space-x-4">
                <Link to="/products" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                  </svg>
                  Order Now
                </Link>
                <Link to="/how-it-works" className="bg-transparent border-2 border-white hover:bg-white hover:text-purple-700 text-white font-bold py-3 px-6 rounded-lg flex items-center transition duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                  </svg>
                  How It Works
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img 
                src="/api/placeholder/500/400" 
                alt="LPG Gas Delivery" 
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
            <path fill="#ffffff" fillOpacity="1" d="M0,224L80,213.3C160,203,320,181,480,181.3C640,181,800,203,960,202.7C1120,203,1280,181,1360,170.7L1440,160L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* 3. Categories Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Shop By Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition duration-200">
              <div className="p-6 bg-pink-50 flex justify-center">
                <img 
                  src="/api/placeholder/150/150" 
                  alt="LPG Cylinders"
                  className="h-24 w-24 object-contain"
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="font-medium text-gray-800">LPG Cylinders</h3>
                <p className="text-sm text-gray-500 mt-1">Explore Items</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition duration-200">
              <div className="p-6 bg-blue-50 flex justify-center">
                <img 
                  src="/api/placeholder/150/150" 
                  alt="Cooking Accessories"
                  className="h-24 w-24 object-contain"
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="font-medium text-gray-800">Cooking</h3>
                <p className="text-sm text-gray-500 mt-1">Explore Items</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition duration-200">
              <div className="p-6 bg-gray-50 flex justify-center">
                <img 
                  src="/api/placeholder/150/150" 
                  alt="Household"
                  className="h-24 w-24 object-contain"
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="font-medium text-gray-800">Household</h3>
                <p className="text-sm text-gray-500 mt-1">Explore Items</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition duration-200">
              <div className="p-6 bg-green-50 flex justify-center">
                <img 
                  src="/api/placeholder/150/150" 
                  alt="Fresh Products"
                  className="h-24 w-24 object-contain"
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="font-medium text-gray-800">Fresh Products</h3>
                <p className="text-sm text-gray-500 mt-1">Explore Items</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Product Listing Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Our Products</h2>
            <div className="flex space-x-2">
              <button className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                </svg>
                All Filters
              </button>
              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg">
                Promotions
              </button>
              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg">
                Best Sellers
              </button>
            </div>
          </div>

          {/* Category Sidebar and Products */}
          <div className="flex flex-col md:flex-row">
            {/* Category Sidebar */}
            <div className="w-full md:w-1/4 md:pr-8 mb-6 md:mb-0">
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
                  <li className="border-b">
                    <button className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-50">
                      <span>LPG Cylinders</span>
                      <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">8</span>
                    </button>
                    <ul className="pl-8 pb-2">
                      <li>
                        <button className="w-full text-left py-2 px-4 text-sm text-gray-600 hover:text-purple-700">
                          Home Cylinders
                          <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">5</span>
                        </button>
                      </li>
                      <li>
                        <button className="w-full text-left py-2 px-4 text-sm text-gray-600 hover:text-purple-700">
                          Commercial Cylinders
                          <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">3</span>
                        </button>
                      </li>
                    </ul>
                  </li>
                  <li className="border-b">
                    <button className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-50">
                      <span>Accessories</span>
                      <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">12</span>
                    </button>
                  </li>
                  <li className="border-b">
                    <button className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-50">
                      <span>Gas Stoves</span>
                      <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">7</span>
                    </button>
                  </li>
                  <li className="border-b">
                    <button className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-50">
                      <span>Regulators</span>
                      <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">4</span>
                    </button>
                  </li>
                  <li>
                    <button className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-50">
                      <span>Gas Hoses</span>
                      <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">6</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            {/* Products Grid */}
            <div className="w-full md:w-3/4">
              <div className="flex justify-between items-center mb-4">
                <p className="text-gray-600">Showing {featuredProducts.length} products</p>
                <div className="flex items-center">
                  <span className="mr-2 text-gray-600">Sort by:</span>
                  <select className="border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500">
                    <option>Featured</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Newest</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                      <div className="h-48 bg-gray-200 rounded mb-4"></div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredProducts.map(product => (
                    <div key={product.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition duration-200">
                      {/* Product Tags */}
                      <div className="relative">
                        {product.isNew && (
                          <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                            New
                          </span>
                        )}
                        {product.discount && (
                          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {product.discount}% OFF
                          </span>
                        )}
                      </div>

                      {/* Product Image */}
                      <div className="h-48 bg-gray-100 flex items-center justify-center">
                        <img 
                          src={`/api/placeholder/300/200?text=${encodeURIComponent(product.name)}`}
                          alt={product.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="p-4">
                        <div className="mb-1 flex items-center">
                          <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded mr-2">Hitty Deliveries</span>
                          <span className="text-gray-500 text-sm">Cylinder</span>
                        </div>
                        <h3 className="font-medium text-gray-800 mb-1">{product.name}</h3>
                        {renderRating(product.rating, product.reviews)}
                        
                        <div className="mt-2 flex items-center">
                          {product.current_stock > 0 ? (
                            <span className="text-green-600 text-sm flex items-center">
                              <svg className="h-4 w-4 mr-1 fill-current" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              In Stock
                            </span>
                          ) : (
                            <span className="text-orange-600 text-sm flex items-center">
                              <svg className="h-4 w-4 mr-1 fill-current" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              Low Stock
                            </span>
                          )}
                        </div>

                        <div className="mt-4 flex justify-between items-center">
                          <div>
                            <span className="text-xl font-bold text-gray-800">KSh {product.selling_price.toLocaleString()}</span>
                            {product.originalPrice && (
                              <span className="ml-2 text-sm text-gray-500 line-through">KSh {product.originalPrice.toLocaleString()}</span>
                            )}
                          </div>
                          <button className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded flex items-center">
                            <FaPlus className="mr-1" size={14} />
                            Add
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
                  className="bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 px-6 rounded-lg inline-flex items-center"
                >
                  View All Products
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Contact and Footer */}
      <footer className="bg-gray-50 pt-12 mt-12 border-t">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Column 1 */}
            <div>
              <div className="mb-4">
                <Link to="/" className="inline-block">
                  <img src="/logo.svg" alt="Hitty Deliveries" className="h-10" />
                </Link>
              </div>
              <p className="text-gray-600 mb-6">Connect with our social media and other sites to keep up to date</p>
              <div className="flex space-x-4">
                <a href="#" className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="#" className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                  </svg>
                </a>
                <a href="#" className="bg-blue-400 text-white p-2 rounded-full hover:bg-blue-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="bg-blue-700 text-white p-2 rounded-full hover:bg-blue-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/>
                  </svg>
                </a>
                <a href="#" className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.627 0-12 5.372-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
                  </svg>
                </a>
              </div>
              <div className="mt-6 flex space-x-4">
                <a href="#" className="block">
                  <img 
                    src="/api/placeholder/140/40?text=Google Play" 
                    alt="Get it on Google Play"
                    className="h-10"
                  />
                </a>
                <a href="#" className="block">
                  <img 
                    src="/api/placeholder/140/40?text=App Store" 
                    alt="Download on App Store"
                    className="h-10"
                  />
                </a>
              </div>
            </div>

            {/* Column 2 */}
            <div>
              <h3 className="text-gray-900 font-medium mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/become-vendor" className="text-gray-600 hover:text-purple-700">Become a Vendor owner</Link>
                </li>
                <li>
                  <Link to="/become-rider" className="text-gray-600 hover:text-purple-700">Become a delivery man</Link>
                </li>
                <li>
                  <Link to="/support" className="text-gray-600 hover:text-purple-700">Help & Support</Link>
                </li>
                <li>
                  <Link to="/about" className="text-gray-600 hover:text-purple-700">About Us</Link>
                </li>
                <li>
                  <Link to="/track-order" className="text-gray-600 hover:text-purple-700">Track Order</Link>
                </li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h3 className="text-gray-900 font-medium mb-4">Contact Us</h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-700 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-600">support@hittydeliveries.com</span>
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-700 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-600">01700000000</span>
                </li>
              </ul>
            </div>

            {/* Column 4 */}
            <div>
              <h3 className="text-gray-900 font-medium mb-4">Find Us</h3>
              <div className="bg-gray-200 rounded-lg h-40 flex items-center justify-center">
                <img 
                  src="/api/placeholder/300/200?text=Map" 
                  alt="Location Map"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <p className="mt-2 text-gray-600">Nairobi, Kenya</p>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t py-6">
            <div className="flex flex-wrap justify-between items-center">
              <p className="text-gray-600 mb-4 md:mb-0">
                &copy; 2023-2025 Hitty Deliveries. All rights reserved.
              </p>
              <div className="flex space-x-6">
                <Link to="/terms" className="text-gray-600 hover:text-purple-700">Terms & Conditions</Link>
                <Link to="/privacy" className="text-gray-600 hover:text-purple-700">Privacy Policy</Link>
                <Link to="/refund" className="text-gray-600 hover:text-purple-700">Refund Policy</Link>
                <Link to="/cancellation" className="text-gray-600 hover:text-purple-700">Cancellation Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
