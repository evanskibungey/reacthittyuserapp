import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { 
  FaArrowLeft, 
  FaBell, 
  FaCheck, 
  FaGift, 
  FaCreditCard, 
  FaShoppingBag,
  FaCheckCircle,
  FaClock,
  FaTruckMoving,
  FaBoxOpen,
  FaTimes,
  FaInfoCircle
} from 'react-icons/fa';

const Notifications = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const navigate = useNavigate();
  
  const { 
    notifications, 
    loading, 
    error, 
    fetchNotifications, 
    markAsRead,
    markAllAsRead 
  } = useNotifications();

  useEffect(() => {
    // Refresh notifications when the page loads
    fetchNotifications();
  }, [fetchNotifications]);

  const handleNotificationClick = (notification) => {
    // Mark notification as read
    if (!notification.read_at) {
      markAsRead(notification.id);
    }
    
    // Navigate based on notification type
    if (notification.data.type === 'order_status' && notification.data.order_id) {
      navigate(`/orders/${notification.data.order_id}`);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Just now';
    
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotificationIcon = (notification) => {
    const type = notification.data?.type || 'info';
    const status = notification.data?.status || '';
    
    if (type === 'order_status') {
      switch(status.toLowerCase()) {
        case 'completed':
          return <FaCheckCircle className="text-green-500" size={20} />;
        case 'processing':
          return <FaBoxOpen className="text-blue-500" size={20} />;
        case 'in_transit':
          return <FaTruckMoving className="text-indigo-500" size={20} />;
        case 'cancelled':
          return <FaTimes className="text-red-500" size={20} />;
        case 'pending':
        default:
          return <FaClock className="text-yellow-500" size={20} />;
      }
    } else if (type === 'promo') {
      return <FaGift className="text-purple-500" size={20} />;
    } else if (type === 'payment') {
      return <FaCreditCard className="text-blue-500" size={20} />;
    } else {
      return <FaInfoCircle className="text-gray-500" size={20} />;
    }
  };

  const getNotificationBackground = (notification) => {
    const type = notification.data?.type || 'info';
    const status = notification.data?.status || '';
    
    if (type === 'order_status') {
      switch(status.toLowerCase()) {
        case 'completed':
          return 'bg-green-50';
        case 'processing':
          return 'bg-blue-50';
        case 'in_transit':
          return 'bg-indigo-50';
        case 'cancelled':
          return 'bg-red-50';
        case 'pending':
        default:
          return 'bg-yellow-50';
      }
    } else if (type === 'promo') {
      return 'bg-purple-50';
    } else if (type === 'payment') {
      return 'bg-blue-50';
    } else {
      return 'bg-gray-50';
    }
  };

  return (
    <>
      <Header
        setIsAuthModalOpen={setIsAuthModalOpen}
        setIsCartOpen={setIsCartOpen}
        isLoggedIn={true}
        setIsLoggedIn={() => {}}
      />
      
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        
        <div className="ml-64 w-full pt-16 px-8 pb-8">
          {/* Back button and title */}
          <div className="mb-8">
            <button 
              onClick={() => navigate('/dashboard')}
              className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
            >
              <FaArrowLeft className="mr-2" />
              Back to Dashboard
            </button>
            
            <div className="flex flex-wrap justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <FaBell className="mr-3 text-purple-500" />
                Notifications
              </h1>
              
              {notifications && notifications.length > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                >
                  <FaCheck className="inline-block mr-2" />
                  Mark all as read
                </button>
              )}
            </div>
          </div>
          
          {/* Notifications list */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading notifications...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <div className="bg-red-100 text-red-700 p-4 rounded-lg inline-block">
                  <p className="font-medium">Error loading notifications</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            ) : notifications && notifications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-6 hover:bg-gray-50 ${notification.read_at ? 'opacity-70' : ''} ${getNotificationBackground(notification)} cursor-pointer`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start">
                      <div className="mr-4 mt-1">
                        {getNotificationIcon(notification)}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap justify-between items-start mb-1">
                          <h3 className="text-lg font-semibold text-gray-800">{notification.data?.title || 'Notification'}</h3>
                          <div className="flex items-center">
                            <span className="text-xs text-gray-500">{formatDateTime(notification.created_at)}</span>
                            {!notification.read_at && (
                              <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">New</span>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-600 mb-2">{notification.data?.message || notification.data?.body || 'You have a new notification'}</p>
                        
                        {notification.data?.type === 'order_status' && notification.data?.order_id && (
                          <div className="mt-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/orders/${notification.data.order_id}`);
                              }}
                              className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                            >
                              View Order #{notification.data.order_number || notification.data.order_id}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <FaBell className="mx-auto text-gray-300 text-5xl mb-4" />
                <h2 className="text-xl font-bold text-gray-800 mb-2">No Notifications</h2>
                <p className="text-gray-500">You don't have any notifications at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Notifications;
