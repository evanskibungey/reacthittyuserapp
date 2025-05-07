import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaSearch, FaSignOutAlt, FaArrowRight } from 'react-icons/fa';

const Header = ({ setIsAuthModalOpen, setIsCartOpen, isLoggedIn, setIsLoggedIn }) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isHeaderFixed, setIsHeaderFixed] = useState(false);
  const navigate = useNavigate();

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

  const handleLogout = () => {
    // Clear auth data from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    // Update auth state
    setIsLoggedIn(false);
    // Redirect to home
    navigate('/');
  };

  return (
    <header 
      className={`${
        isHeaderFixed 
          ? 'fixed top-0 left-0 right-0 bg-white shadow-md z-50 transition-all duration-300 transform translate-y-0' 
          : 'bg-white z-50 relative'
      }`}
    >
      {/* Top Bar - Only visible on large screens when not fixed */}
      {!isHeaderFixed && (
        <div className="bg-purple-800 text-white py-2 hidden md:block">
          <div className="container mx-auto px-4 flex justify-between items-center text-sm">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>Need help? Call: 0712 345 678</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link to="/track-order" className="hover:text-orange-300 transition">Track Your Order</Link>
              <Link to="/about" className="hover:text-orange-300 transition">About Us</Link>
              <Link to="/contact" className="hover:text-orange-300 transition">Contact</Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="mr-8">
            <img src="/logo.png" alt="Hitty Deliveries" className="h-12" />
          </Link>
          <div className="hidden lg:flex items-center bg-gray-100 rounded-full px-4 py-2 flex-grow max-w-md">
            <FaSearch className="text-gray-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search for gas cylinders, stoves and more..." 
              className="bg-transparent border-none focus:outline-none text-gray-800 w-full"
            />
          </div>
        </div>

        <div className="flex items-center space-x-1 md:space-x-4">
          <Link to="/products" className="hidden md:block text-gray-800 hover:text-purple-700 px-3 py-2 rounded-lg transition">
            Products
          </Link>
          {isLoggedIn && (
            <Link to="/dashboard" className="hidden md:block text-gray-800 hover:text-purple-700 px-3 py-2 rounded-lg transition">
              Dashboard
            </Link>
          )}
          <Link to="/offers" className="hidden md:block text-gray-800 hover:text-purple-700 px-3 py-2 rounded-lg transition">
            Offers
          </Link>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative text-gray-800 hover:text-purple-700 p-2 rounded-full hover:bg-gray-100 transition"
            aria-label="Open cart"
          >
            <FaShoppingCart size={20} />
            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
          </button>
          
          {isLoggedIn ? (
            <div className="relative group">
              <button className="flex items-center space-x-1 text-gray-800 hover:text-purple-700 p-2 rounded-full hover:bg-gray-100 transition">
                <FaUser size={20} />
                <span className="hidden md:inline">Account</span>
              </button>
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl overflow-hidden z-20 invisible group-hover:visible transition-all duration-300 transform origin-top-right scale-95 group-hover:scale-100">
                <div className="py-2">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">Welcome back!</p>
                    <p className="text-xs text-gray-500 truncate">{localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).name : 'Customer'}</p>
                  </div>
                  <Link to="/dashboard" className="block px-4 py-3 text-gray-800 hover:bg-purple-50 hover:text-purple-700 transition-colors">
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Dashboard
                    </span>
                  </Link>
                  <Link to="/orders" className="block px-4 py-3 text-gray-800 hover:bg-purple-50 hover:text-purple-700 transition-colors">
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      My Orders
                    </span>
                  </Link>
                  <Link to="/profile" className="block px-4 py-3 text-gray-800 hover:bg-purple-50 hover:text-purple-700 transition-colors">
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </span>
                  </Link>
                  <div className="border-t border-gray-100"></div>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-3 text-gray-800 hover:bg-red-50 hover:text-red-700 transition-colors"
                  >
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center space-x-1 text-gray-800 hover:text-purple-700 p-2 rounded-full hover:bg-gray-100 transition"
            >
              <FaUser size={20} />
              <span className="hidden md:inline">Account</span>
            </button>
          )}
          
          <Link 
            to="/products" 
            className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-lg"
          >
            <span>Order Now</span>
            <FaArrowRight className="ml-2" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
