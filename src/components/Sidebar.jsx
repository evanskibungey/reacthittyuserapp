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
  FaTimes,
  FaCoins,
  FaHistory,
  FaArrowLeft
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const Sidebar = ({ onLogout }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeGroup, setActiveGroup] = useState(null);
  
  // Determine which group should be active based on current path
  React.useEffect(() => {
    if (location.pathname.includes('/profile') || location.pathname === '/dashboard') {
      setActiveGroup('account');
    } else if (location.pathname.includes('/order') || location.pathname.includes('/wish')) {
      setActiveGroup('orders');
    } else if (location.pathname.includes('/referral') || location.pathname.includes('/support')) {
      setActiveGroup('other');
    }
  }, [location.pathname]);
  
  // Check if current path is active
  const isActive = (path) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') {
      return true;
    }
    return location.pathname.startsWith(path);
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
        title: 'Loyalty Points',
        icon: <FaCoins />,
        path: '/points',
      },
    ],
    orders: [
      {
        title: 'My Orders',
        icon: <FaBox />,
        path: '/orders',
      },
      {
        title: 'Order History',
        icon: <FaHistory />,
        path: '/order-history',
      },
      {
        title: 'Saved Products',
        icon: <FaHeart />,
        path: '/wishlist',
      },
    ],
    other: [
      {
        title: 'Referral Program',
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
  const renderMenuItems = (items, groupName) => {
    return items.map((item, index) => (
      <motion.li 
        key={index}
        whileHover={{ x: 5 }}
        transition={{ duration: 0.2 }}
        className={activeGroup !== groupName && isCollapsed ? 'hidden' : ''}
      >
        <Link
          to={item.path}
          className={`flex items-center px-6 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-md transition-all duration-200 ${
            isActive(item.path) 
              ? 'bg-purple-50 text-purple-700 font-medium' 
              : ''
          }`}
        >
          <span className={`${isCollapsed ? 'mx-auto text-xl' : 'mr-3 text-lg'} ${isActive(item.path) ? 'text-purple-700' : 'text-gray-500'}`}>
            {item.icon}
          </span>
          {!isCollapsed && (
            <span className="transition-opacity duration-300">{item.title}</span>
          )}
          {!isCollapsed && isActive(item.path) && (
            <span className="ml-auto">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-700"></div>
            </span>
          )}
        </Link>
      </motion.li>
    ));
  };

  // Sidebar container variants for animations
  const sidebarVariants = {
    expanded: { width: '16rem' },
    collapsed: { width: '5rem' }
  };

  return (
    <motion.div 
      className="bg-white h-screen fixed left-0 top-16 border-r border-gray-100 overflow-y-auto z-20 pb-6"
      initial="expanded"
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Collapse toggle button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-4 right-4 p-1.5 rounded-full bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? <FaArrowLeft size={14} /> : <FaArrowLeft className="rotate-180" size={14} />}
      </button>

      <div className={`px-6 py-6 ${isCollapsed ? 'text-center' : ''}`}>
        <div className={`${isCollapsed ? 'justify-center' : ''} flex items-center`}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg mr-3">
            H
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-bold text-gray-800">Hitty Deliveries</h2>
              <p className="text-xs text-gray-500">Customer Portal</p>
            </div>
          )}
        </div>
      </div>
      
      <nav className="pb-6 mt-2">
        {/* Account Group */}
        <div className="mb-4">
          <div 
            className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-6'} py-2 cursor-pointer`}
            onClick={() => !isCollapsed && setActiveGroup(activeGroup === 'account' ? null : 'account')}
          >
            {!isCollapsed && <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Account</h3>}
            {!isCollapsed && (
              <FaChevronRight 
                className={`text-gray-400 transform transition-transform duration-200 ml-auto ${activeGroup === 'account' ? 'rotate-90' : ''}`} 
                size={12} 
              />
            )}
          </div>
          <ul className="space-y-1 mt-1">
            {renderMenuItems(menuGroups.account, 'account')}
          </ul>
        </div>

        {/* Orders Group */}
        <div className="mb-4">
          <div 
            className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-6'} py-2 cursor-pointer`}
            onClick={() => !isCollapsed && setActiveGroup(activeGroup === 'orders' ? null : 'orders')}
          >
            {!isCollapsed && <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Orders</h3>}
            {!isCollapsed && (
              <FaChevronRight 
                className={`text-gray-400 transform transition-transform duration-200 ml-auto ${activeGroup === 'orders' ? 'rotate-90' : ''}`} 
                size={12} 
              />
            )}
          </div>
          <ul className="space-y-1 mt-1">
            {renderMenuItems(menuGroups.orders, 'orders')}
          </ul>
        </div>

        {/* Other Group */}
        <div className="mb-4">
          <div 
            className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-6'} py-2 cursor-pointer`}
            onClick={() => !isCollapsed && setActiveGroup(activeGroup === 'other' ? null : 'other')}
          >
            {!isCollapsed && <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">More</h3>}
            {!isCollapsed && (
              <FaChevronRight 
                className={`text-gray-400 transform transition-transform duration-200 ml-auto ${activeGroup === 'other' ? 'rotate-90' : ''}`} 
                size={12} 
              />
            )}
          </div>
          <ul className="space-y-1 mt-1">
            {renderMenuItems(menuGroups.other, 'other')}
          </ul>
        </div>
        
        <div className={`${isCollapsed ? 'px-2' : 'px-6'} pt-2`}>
          <div className="border-t border-gray-200"></div>
        </div>
        
        <div className={`${isCollapsed ? 'px-2' : 'px-6'} pt-4`}>
          <button
            onClick={onLogout}
            className={`w-full flex ${isCollapsed ? 'justify-center' : ''} items-center py-3 px-4 text-red-600 hover:bg-red-50 rounded-md transition-all duration-200`}
          >
            <FaSignOutAlt className={`${isCollapsed ? '' : 'mr-3'} text-lg`} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </nav>
      
      {!isCollapsed && (
        <div className="px-6 mt-4">
          <motion.div 
            className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-lg shadow-sm overflow-hidden relative"
            initial={{ opacity: 0.9 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-white opacity-10 -mr-6 -mt-6"></div>
            <div className="relative z-10">
              <h3 className="font-semibold text-white mb-2">Need Assistance?</h3>
              <p className="text-xs text-purple-100 mb-3">
                Our support team is here to help you with your orders and questions.
              </p>
              <button
                className="text-xs bg-white text-purple-700 hover:bg-opacity-90 px-3 py-1.5 rounded font-medium transition-colors inline-flex items-center"
              >
                <FaHeadset className="mr-1.5" />
                Contact Support
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Sidebar;
