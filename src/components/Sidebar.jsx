import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaBox, 
  FaUser, 
  FaHeart, 
  FaGift, 
  FaShoppingBag, 
  FaMapMarkerAlt, 
  FaHeadset, 
  FaSignOutAlt,
  FaTachometerAlt,
  FaChevronRight,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const Sidebar = ({ onLogout }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeGroup, setActiveGroup] = useState('account');
  
  // Check if current path is active
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  // Group menu items for better organization
  const menuGroups = {
    account: [
      {
        title: 'Dashboard',
        icon: <FaTachometerAlt />,
        path: '/dashboard',
      },
      {
        title: 'My Profile',
        icon: <FaUser />,
        path: '/profile',
      },
      {
        title: 'Saved Addresses',
        icon: <FaMapMarkerAlt />,
        path: '/addresses',
      },
    ],
    orders: [
      {
        title: 'My Orders',
        icon: <FaBox />,
        path: '/orders',
      },
      {
        title: 'Purchase History',
        icon: <FaShoppingBag />,
        path: '/purchase-history',
      },
      {
        title: 'Wishlist',
        icon: <FaHeart />,
        path: '/wishlist',
      },
    ],
    other: [
      {
        title: 'Referrals',
        icon: <FaGift />,
        path: '/referrals',
      },
      {
        title: 'Support',
        icon: <FaHeadset />,
        path: '/support',
      },
    ]
  };

  // Render menu items for a group
  const renderMenuItems = (items) => {
    return items.map((item, index) => (
      <motion.li 
        key={index}
        whileHover={{ x: 5 }}
        transition={{ duration: 0.2 }}
      >
        <Link
          to={item.path}
          className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-transparent hover:text-purple-700 rounded-l-lg transition-all duration-300 ${
            isActive(item.path) 
              ? 'bg-gradient-to-r from-purple-100 to-transparent text-purple-700 border-r-4 border-purple-700 font-medium' 
              : ''
          }`}
        >
          <span className={`mr-3 text-lg ${isActive(item.path) ? 'text-purple-700' : 'text-gray-500'}`}>
            {item.icon}
          </span>
          {!isCollapsed && (
            <span className="transition-opacity duration-300">{item.title}</span>
          )}
        </Link>
      </motion.li>
    ));
  };

  // Sidebar container variants for animations
  const sidebarVariants = {
    expanded: { width: 256 },
    collapsed: { width: 80 }
  };

  return (
    <motion.div 
      className="bg-white h-screen shadow-lg fixed left-0 top-16 overflow-y-auto z-20 pb-6"
      initial="expanded"
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Collapse toggle button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-3 right-3 p-1 rounded-full bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
      >
        {isCollapsed ? <FaBars size={16} /> : <FaTimes size={16} />}
      </button>

      <div className={`px-6 mb-4 pt-6 ${isCollapsed ? 'text-center' : ''}`}>
        <h2 className={`text-xl font-bold text-gray-800 ${isCollapsed ? 'scale-0 h-0' : ''} transition-all duration-300`}>
          {!isCollapsed && 'Customer Area'}
        </h2>
        <p className={`text-sm text-gray-500 ${isCollapsed ? 'scale-0 h-0' : ''} transition-all duration-300`}>
          {!isCollapsed && 'Manage your account'}
        </p>
      </div>
      
      <nav className="pb-6">
        {/* Account Group */}
        <div className="mb-4">
          <div 
            className={`flex items-center px-6 py-2 cursor-pointer ${isCollapsed ? 'justify-center' : 'justify-between'}`}
            onClick={() => !isCollapsed && setActiveGroup(activeGroup === 'account' ? '' : 'account')}
          >
            {!isCollapsed && <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Account</h3>}
            {!isCollapsed && (
              <FaChevronRight 
                className={`text-gray-400 transform transition-transform duration-200 ${activeGroup === 'account' ? 'rotate-90' : ''}`} 
                size={12} 
              />
            )}
          </div>
          <ul className="space-y-1">
            {renderMenuItems(menuGroups.account)}
          </ul>
        </div>

        {/* Orders Group */}
        <div className="mb-4">
          <div 
            className={`flex items-center px-6 py-2 cursor-pointer ${isCollapsed ? 'justify-center' : 'justify-between'}`}
            onClick={() => !isCollapsed && setActiveGroup(activeGroup === 'orders' ? '' : 'orders')}
          >
            {!isCollapsed && <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Orders</h3>}
            {!isCollapsed && (
              <FaChevronRight 
                className={`text-gray-400 transform transition-transform duration-200 ${activeGroup === 'orders' ? 'rotate-90' : ''}`} 
                size={12} 
              />
            )}
          </div>
          <ul className="space-y-1">
            {renderMenuItems(menuGroups.orders)}
          </ul>
        </div>

        {/* Other Group */}
        <div className="mb-4">
          <div 
            className={`flex items-center px-6 py-2 cursor-pointer ${isCollapsed ? 'justify-center' : 'justify-between'}`}
            onClick={() => !isCollapsed && setActiveGroup(activeGroup === 'other' ? '' : 'other')}
          >
            {!isCollapsed && <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">More</h3>}
            {!isCollapsed && (
              <FaChevronRight 
                className={`text-gray-400 transform transition-transform duration-200 ${activeGroup === 'other' ? 'rotate-90' : ''}`} 
                size={12} 
              />
            )}
          </div>
          <ul className="space-y-1">
            {renderMenuItems(menuGroups.other)}
          </ul>
        </div>
        
        <div className="px-6 pt-2">
          <div className="border-t border-gray-200"></div>
        </div>
        
        <motion.div 
          whileHover={{ x: 5 }}
          className="px-6 pt-2"
        >
          <button
            onClick={onLogout}
            className="w-full flex items-center px-6 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
          >
            <FaSignOutAlt className="mr-3 text-lg" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </motion.div>
      </nav>
      
      {!isCollapsed && (
        <div className="px-6 pt-2">
          <motion.div 
            className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4 rounded-lg shadow-md"
            initial={{ opacity: 0.8 }}
            whileHover={{ opacity: 1, scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="font-semibold text-white mb-2">Need Help?</h3>
            <p className="text-sm text-purple-100 mb-3">
              Our customer support team is available 24/7 to assist you.
            </p>
            <Link
              to="/contact"
              className="text-sm text-white hover:text-purple-200 font-medium flex items-center"
            >
              <FaHeadset className="mr-2" />
              Contact Support
            </Link>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Sidebar;
