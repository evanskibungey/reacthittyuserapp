import React from 'react';
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
  FaTachometerAlt
} from 'react-icons/fa';

const Sidebar = ({ onLogout }) => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  const menuItems = [
    {
      title: 'Dashboard',
      icon: <FaTachometerAlt />,
      path: '/dashboard',
    },
    {
      title: 'My Orders',
      icon: <FaBox />,
      path: '/orders',
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
    {
      title: 'Wishlist',
      icon: <FaHeart />,
      path: '/wishlist',
    },
    {
      title: 'Referrals',
      icon: <FaGift />,
      path: '/referrals',
    },
    {
      title: 'Purchase History',
      icon: <FaShoppingBag />,
      path: '/purchase-history',
    },
    {
      title: 'Support',
      icon: <FaHeadset />,
      path: '/support',
    },
  ];

  return (
    <div className="bg-white h-screen shadow-md w-64 fixed left-0 top-16 overflow-y-auto z-20 pb-6">
      <div className="px-6 mb-8 pt-6">
        <h2 className="text-xl font-bold text-gray-800">Customer Area</h2>
        <p className="text-sm text-gray-500">Manage your account</p>
      </div>
      
      <nav>
        <ul className="space-y-1">
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                className={`flex items-center px-6 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors ${
                  isActive(item.path) 
                    ? 'bg-purple-100 text-purple-700 border-r-4 border-purple-700' 
                    : ''
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                <span>{item.title}</span>
              </Link>
            </li>
          ))}
          
          <li className="px-6 pt-6">
            <div className="border-t border-gray-200"></div>
          </li>
          
          <li>
            <button
              onClick={onLogout}
              className="w-full flex items-center px-6 py-3 text-red-600 hover:bg-red-50 transition-colors"
            >
              <FaSignOutAlt className="mr-3 text-lg" />
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </nav>
      
      <div className="px-6 pt-6 mt-8">
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-700 mb-2">Need Help?</h3>
          <p className="text-sm text-gray-600 mb-3">
            Our customer support team is available 24/7 to assist you.
          </p>
          <Link
            to="/contact"
            className="text-sm text-purple-700 hover:text-purple-900 font-medium flex items-center"
          >
            <FaHeadset className="mr-2" />
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
