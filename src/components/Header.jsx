import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useNotifications } from '../contexts/NotificationContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaShoppingCart, 
  FaUser, 
  FaSearch, 
  FaPhone, 
  FaMapMarkerAlt,
  FaArrowRight,
  FaBell,
  FaRegBell,
  FaTachometerAlt,
  FaBox,
  FaSignOutAlt,
  FaCog,
  FaGift,
  FaWhatsapp,
  FaHeadset,
  FaCreditCard
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import OptimizedImage from './common/OptimizedImage';

const Header = ({ setIsAuthModalOpen, setIsCartOpen, isLoggedIn, setIsLoggedIn }) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isHeaderFixed, setIsHeaderFixed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItemsCount } = useCart();
  
  // Get notifications from context
  const { 
    notifications, 
    unreadCount, 
    loading: notificationsLoading, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY;
      setScrollPosition(position);
      setIsHeaderFixed(position > 60);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.mobile-menu-container')) {
        setIsMobileMenuOpen(false);
      }
      
      if (showNotifications && !event.target.closest('.notifications-container')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen, showNotifications]);

  const handleLogout = () => {
    // Clear auth data from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    // Update auth state
    setIsLoggedIn(false);
    // Redirect to home
    navigate('/');
  };
  
  // Check if we're on the dashboard
  const isDashboard = location.pathname.includes('/dashboard') || 
                      location.pathname.includes('/profile') || 
                      location.pathname.includes('/orders') ||
                      location.pathname.includes('/points');
  
  // Format notification time
  const formatNotificationTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 0) {
      return diffDay === 1 ? '1 day ago' : `${diffDay} days ago`;
    }
    if (diffHour > 0) {
      return diffHour === 1 ? '1 hour ago' : `${diffHour} hours ago`;
    }
    if (diffMin > 0) {
      return diffMin === 1 ? '1 minute ago' : `${diffMin} minutes ago`;
    }
    return 'Just now';
  };
  
  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Mark notification as read in the backend
    if (!notification.read_at) {
      markAsRead(notification.id);
    }
    
    // Navigate based on notification type
    if (notification.data.type === 'order_status' && notification.data.order_id) {
      navigate(`/orders/${notification.data.order_id}`);
      setShowNotifications(false);
    }
  };
  
  // Get notification icon based on type
  const getNotificationIcon = (notification) => {
    const type = notification.data?.type || 'info';
    
    switch(type) {
      case 'order_status':
        return 'success';
      case 'promo':
        return 'promo';
      case 'payment':
        return 'payment';
      default:
        return 'info';
    }
  };

  return (
    <header 
      className={`${
        isHeaderFixed 
          ? 'fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 transition-all duration-300 transform translate-y-0 shadow-sm' 
          : isDashboard ? 'bg-white z-50 relative border-b border-gray-100' : 'bg-white z-50 relative'
      }`}
    >
      {/* Top Bar - Only visible on large screens when not fixed and not on dashboard */}
      {!isHeaderFixed && !isDashboard && (
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 hidden md:block">
          <div className="container mx-auto px-4 flex justify-between items-center text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="bg-white/10 rounded-full p-1 mr-2">
                  <FaPhone className="h-3 w-3 text-white" />
                </div>
                <span>Need help? Call: <a href="tel:0712345678" className="font-medium hover:text-white/80 transition-colors">0712 345 678</a></span>
              </div>
              
              <div className="flex items-center">
                <div className="bg-white/10 rounded-full p-1 mr-2">
                  <FaWhatsapp className="h-3 w-3 text-white" />
                </div>
                <span>Chat with us: <a href="https://wa.me/254712345678" className="font-medium hover:text-white/80 transition-colors">WhatsApp Support</a></span>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <Link to="/track-order" className="hover:text-white/80 transition-colors flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Track Your Order
              </Link>
              <Link to="/about" className="hover:text-white/80 transition-colors flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                About Us
              </Link>
              <Link to="/contact" className="hover:text-white/80 transition-colors flex items-center">
                <FaMapMarkerAlt className="h-3 w-3 mr-1" />
                Contact
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <div className={`${isDashboard ? 'md:px-8' : 'container mx-auto px-4'} py-3 flex items-center justify-between`}>
        <div className="flex items-center">
          <Link to="/" className="mr-6">
            <div className="flex items-center">
              {/* Logo Image */}
              <img 
                src="/logo.png" 
                alt="Hitty Deliveries" 
                className="h-12 w-auto mr-2"
              />
             
            </div>
          </Link>
          
          {!isDashboard && (
            <div className="hidden lg:flex items-center bg-gray-100 hover:bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-purple-500/30 rounded-full px-4 py-2 flex-grow max-w-md transition-all duration-300">
              <FaSearch className="text-gray-400 mr-2" />
              <input 
                type="text" 
                placeholder="Search for gas cylinders, stoves and more..." 
                className="bg-transparent border-none focus:outline-none text-gray-800 w-full text-sm"
              />
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-600 hover:text-purple-600 p-2 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              )}
            </svg>
          </button>
        </div>

        <div className="hidden lg:flex items-center space-x-1 md:space-x-3">
          {!isDashboard && (
            <Link to="/products" className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-lg transition-colors hover:bg-purple-50 flex items-center">
              <FaBox className="mr-1 text-purple-500" size={14} />
              Products
            </Link>
          )}
          
          {isLoggedIn && !isDashboard && (
            <Link to="/dashboard" className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-lg transition-colors hover:bg-purple-50 flex items-center">
              <FaTachometerAlt className="mr-1 text-purple-500" size={14} />
              Dashboard
            </Link>
          )}
          
          <Link to="/contact" className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-lg transition-colors hover:bg-purple-50 flex items-center">
            <FaHeadset className="mr-1 text-purple-500" size={14} />
            Support
          </Link>
         
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative text-gray-700 hover:text-purple-600 p-2 rounded-full hover:bg-purple-50 transition-colors"
            aria-label="Open cart"
          >
            <FaShoppingCart className="w-5 h-5" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                {cartItemsCount}
              </span>
            )}
          </button>
          
          {isLoggedIn && (
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative text-gray-700 hover:text-purple-600 p-2 rounded-full hover:bg-purple-50 transition-colors"
                aria-label="Notifications"
              >
                {unreadCount > 0 ? (
                  <>
                    <FaBell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 bg-red-500 w-2.5 h-2.5 rounded-full"></span>
                    {unreadCount > 1 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </>
                ) : (
                  <FaRegBell className="w-5 h-5" />
                )}
              </button>
              
              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="notifications-container absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl overflow-hidden z-20 border border-gray-100">
                  <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                    <button 
                      onClick={markAllAsRead}
                      className="text-xs text-purple-600 hover:text-purple-800"
                    >
                      Mark all as read
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notificationsLoading ? (
                      <div className="py-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto mb-3"></div>
                        <p className="text-gray-500">Loading notifications...</p>
                      </div>
                    ) : notifications && notifications.length > 0 ? (
                      notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${notification.read_at ? 'opacity-70' : ''}`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex">
                            <div className={`flex-shrink-0 mr-3 mt-1 rounded-full p-2 ${
                              getNotificationIcon(notification) === 'success' 
                                ? 'bg-green-100 text-green-600' 
                                : getNotificationIcon(notification) === 'promo' 
                                  ? 'bg-purple-100 text-purple-600' 
                                  : getNotificationIcon(notification) === 'payment'
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'bg-gray-100 text-gray-600'
                            }`}>
                              {getNotificationIcon(notification) === 'success' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : getNotificationIcon(notification) === 'promo' ? (
                                <FaGift className="h-4 w-4" />
                              ) : getNotificationIcon(notification) === 'payment' ? (
                                <FaCreditCard className="h-4 w-4" />
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <p className="font-medium text-gray-800">{notification.data?.title || 'Notification'}</p>
                                <span className="text-xs text-gray-500">{formatNotificationTime(notification.created_at)}</span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{notification.data?.message || notification.data?.body || 'You have a new notification'}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <p className="text-gray-500">No notifications yet</p>
                      </div>
                    )}
                  </div>
                  <Link to="/notifications" className="block bg-purple-50 text-purple-600 text-center py-3 hover:bg-purple-100 transition-colors">
                    View all notifications
                  </Link>
                </div>
              )}
            </div>
          )}
          
          {isLoggedIn ? (
            <div className="relative group">
              <button className="flex items-center space-x-1 text-gray-700 hover:text-purple-600 p-2 rounded-full hover:bg-purple-50 transition-colors">
                <FaUser className="w-5 h-5" />
                <span className="hidden md:inline text-sm font-medium">Account</span>
              </button>
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl overflow-hidden z-20 invisible group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100 border border-gray-100">
                <div className="py-2">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-br from-purple-50 to-white">
                    <p className="text-sm font-medium text-gray-900">Welcome back!</p>
                    <p className="text-xs text-gray-500 truncate">{localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).name : 'Customer'}</p>
                  </div>
                  
                  <Link to="/dashboard" className="flex items-center px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors">
                    <FaTachometerAlt className="w-4 h-4 mr-3 text-gray-400" />
                    Dashboard
                  </Link>
                  
                  <Link to="/orders" className="flex items-center px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors">
                    <FaBox className="w-4 h-4 mr-3 text-gray-400" />
                    My Orders
                  </Link>
                  
                  <Link to="/profile" className="flex items-center px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors">
                    <FaCog className="w-4 h-4 mr-3 text-gray-400" />
                    Settings
                  </Link>
                  
                  <div className="border-t border-gray-100"></div>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <FaSignOutAlt className="w-4 h-4 mr-3 text-gray-400" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center space-x-1 text-gray-700 hover:text-purple-600 p-2 rounded-full hover:bg-purple-50 transition-colors"
            >
              <FaUser className="w-5 h-5" />
              <span className="hidden md:inline text-sm font-medium">Account</span>
            </button>
          )}
          
          {!isDashboard && (
            <Link 
              to="/products" 
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md text-sm font-medium"
            >
              <span>Order Now</span>
              <FaArrowRight className="ml-2 text-sm" />
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`lg:hidden fixed inset-0 z-50 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} transition-opacity duration-300`}>
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}></div>
        <motion.div 
          className={`mobile-menu-container absolute top-0 right-0 h-full w-4/5 max-w-xs bg-white shadow-xl overflow-y-auto`}
          initial={{ x: "100%" }}
          animate={{ x: isMobileMenuOpen ? 0 : "100%" }}
          transition={{ type: "tween", duration: 0.3 }}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center">
                {/* Logo in mobile menu */}
                <img 
                  src="/logo.png" 
                  alt="Hitty Deliveries" 
                  className="h-10 w-auto mr-2"
                />
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            {isLoggedIn && (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xl mr-3">
                    {localStorage.getItem('user') 
                      ? JSON.parse(localStorage.getItem('user')).name.charAt(0).toUpperCase() 
                      : 'C'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).name : 'Customer'}
                    </p>
                    <Link to="/profile" className="text-xs text-purple-600">View Profile</Link>
                  </div>
                </div>
              </div>
            )}
            
            <nav className="mb-6 pb-6 border-b border-gray-200">
              <ul className="space-y-4">
                <li>
                  <Link 
                    to="/products" 
                    className="flex items-center text-gray-700 hover:text-purple-600"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Products
                  </Link>
                </li>
                {isLoggedIn && (
                  <li>
                    <Link 
                      to="/dashboard" 
                      className="flex items-center text-gray-700 hover:text-purple-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <FaTachometerAlt className="w-5 h-5 mr-3 text-gray-400" />
                      Dashboard
                    </Link>
                  </li>
                )}
                <li>
                  <Link 
                    to="/offers" 
                    className="flex items-center text-gray-700 hover:text-purple-600"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FaGift className="w-5 h-5 mr-3 text-gray-400" />
                    Offers
                    <span className="ml-2 bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5">New</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/contact" 
                    className="flex items-center text-gray-700 hover:text-purple-600"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FaHeadset className="w-5 h-5 mr-3 text-gray-400" />
                    Support
                  </Link>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      setIsCartOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center text-gray-700 hover:text-purple-600"
                  >
                    <FaShoppingCart className="w-5 h-5 mr-3 text-gray-400" />
                    Cart
                    {cartItemsCount > 0 && (
                      <span className="ml-2 bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5">{cartItemsCount}</span>
                    )}
                  </button>
                </li>
                {!isLoggedIn && (
                  <li>
                    <button 
                      onClick={() => {
                        setIsAuthModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center text-gray-700 hover:text-purple-600"
                    >
                      <FaUser className="w-5 h-5 mr-3 text-gray-400" />
                      Login / Register
                    </button>
                  </li>
                )}
              </ul>
            </nav>
            
            {isLoggedIn && (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <p className="font-medium mb-4 text-gray-800">Account</p>
                <ul className="space-y-4">
                  <li>
                    <Link 
                      to="/profile" 
                      className="flex items-center text-gray-700 hover:text-purple-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <FaCog className="w-5 h-5 mr-3 text-gray-400" />
                      Settings
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/orders" 
                      className="flex items-center text-gray-700 hover:text-purple-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <FaBox className="w-5 h-5 mr-3 text-gray-400" />
                      Orders
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center text-red-600 hover:text-red-700"
                    >
                      <FaSignOutAlt className="w-5 h-5 mr-3 text-red-500" />
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
            
            <div className="pt-4">
              <Link 
                to="/products" 
                className="block w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-center px-4 py-3 rounded-lg transition-colors mb-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Order Now
              </Link>
              
              {/* Customer Support Section */}
              <div className="mt-6 bg-purple-50 rounded-lg p-4">
                <h3 className="font-medium text-purple-800 mb-2 flex items-center">
                  <FaHeadset className="mr-2" /> 
                  Customer Support
                </h3>
                <p className="text-sm text-gray-600 mb-3">Need help with your order?</p>
                <div className="flex space-x-3">
                  <a 
                    href="tel:0712345678" 
                    className="flex-1 bg-white text-purple-600 text-center py-2 rounded border border-purple-200 text-sm font-medium hover:bg-purple-100 transition-colors"
                  >
                    Call Us
                  </a>
                  <a 
                    href="https://wa.me/254712345678" 
                    className="flex-1 bg-green-600 text-white text-center py-2 rounded text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <FaWhatsapp className="mr-1" /> WhatsApp
                  </a>
                </div>
              </div>
              
              <div className="flex items-center justify-center space-x-6 py-4">
                <a href="#" className="text-gray-400 hover:text-purple-600 transition-colors">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-purple-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-purple-600 transition-colors">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </header>
  );
};

export default Header;